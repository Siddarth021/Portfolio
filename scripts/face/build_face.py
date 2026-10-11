"""Faceted head v2 — fitted to one front photo, coloured from it.

1. Face: all 468 face-mesh landmarks (+ visible iris points), Delaunay-cut in a
   cylindrical unwrap, lifted with the model's depth (nose relief boosted a bit).
2. Head: lofted from the face oval around an ellipsoid; hair thickness only where
   the photo shows hair; upper silhouette scaled to match the photo's hair outline.
3. Ears + neck placed and sized from photo measurements.
4. Colour: z-buffer the mesh in the photo's front view, each facet takes the mean
   of the photo pixels it covers (background + shirt excluded). Facets hidden in
   the photo (back of head, under the jaw) borrow from the nearest similar facets.

usage: python3 build_face.py photo_big.png landmarks.json out.json
"""
import json, math, sys
import numpy as np
from PIL import Image
from scipy.spatial import Delaunay, cKDTree
from scipy import ndimage
from matplotlib.path import Path

PHOTO = sys.argv[1] if len(sys.argv) > 1 else 'photo_big.png'
LMS = sys.argv[2] if len(sys.argv) > 2 else 'landmarks.json'
OUT = sys.argv[3] if len(sys.argv) > 3 else 'face_mesh2.json'

img = np.asarray(Image.open(PHOTO).convert('RGB')).astype(np.float32)
IH, IW = img.shape[:2]
d = json.load(open(LMS))
W, H = d['w'], d['h']
assert (W, H) == (IW, IH), 'landmarks must come from the same image size'
L = np.array([[p['x'] * W, p['y'] * H, p['z'] * W] for p in d['lm']])
P = np.stack([L[:, 0], -L[:, 1], -L[:, 2] * 1.04], 1)   # x right, y up, z to viewer
half_w = (P[454][0] - P[234][0]) / 2

# nose relief (face-mesh depth is shallow there)
tip = P[1].copy()
dd = np.hypot(P[:, 0] - tip[0], (P[:, 1] - (tip[1] + 0.15 * half_w)) * 0.7)
P[:, 2] += 0.13 * half_w * np.exp(-(dd / (0.30 * half_w)) ** 2)

# ---------------- photo masks ----------------
bg = np.median(np.concatenate([img[:40, :40].reshape(-1, 3), img[:40, -40:].reshape(-1, 3)]), 0)
is_bg = np.linalg.norm(img - bg, axis=2) < 38
is_shirt = (img[..., 2] - img[..., 0]) > 18
head = ~is_bg & ~is_shirt
head = ndimage.binary_opening(head, iterations=2)
lab, n = ndimage.label(head)
head = lab == (np.bincount(lab.ravel())[1:].argmax() + 1)
luma = img @ np.array([0.299, 0.587, 0.114])
hair = head & (luma < 70)
hair = ndimage.binary_opening(hair, iterations=1)


def px(v):
    """model point -> photo pixel (clamped)"""
    return int(min(IW - 1, max(0, round(v[0])))), int(min(IH - 1, max(0, round(-v[1]))))


OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
        152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
LIPS_OUT = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185]
EYE_L = [263, 249, 390, 373, 374, 380, 381, 382, 362, 398, 384, 385, 386, 387, 388, 466]
EYE_R = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
BROW_L = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
BROW_R = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]

# ---------------- face surface ----------------
eyeL2 = Path(P[EYE_L][:, :2]); eyeR2 = Path(P[EYE_R][:, :2])
sel = list(range(468)) + [468, 473]
for i in list(range(469, 473)) + list(range(474, 478)):
    if eyeL2.contains_point(P[i][:2], radius=-1.0) or eyeR2.contains_point(P[i][:2], radius=-1.0):
        sel.append(i)
sel_idx = {lm: k for k, lm in enumerate(sel)}
verts = [P[i].tolist() for i in sel]
cx = np.mean([P[i][0] for i in OVAL])
z_ear = np.mean([P[i][2] for i in (234, 454)])
zc = z_ear - 0.35 * half_w

# extra points on the photo's strong edges (lids, iris rims, brows, lips, moustache,
# nostrils) so facet edges follow the real features, not just the detector's estimate
lm_xy = P[sel][:, :2]
lm_tri = Delaunay(lm_xy)


def z_at(x, y):
    s_ = lm_tri.find_simplex([x, y])
    if s_ < 0:
        return None
    Tm = lm_tri.transform[s_]
    b = Tm[:2] @ (np.array([x, y]) - Tm[2]); bc = np.r_[b, 1 - b.sum()]
    return float(bc @ P[sel][lm_tri.simplices[s_], 2])


g = ndimage.gaussian_filter(luma, 1.0)
mag = np.hypot(ndimage.sobel(g, 1), ndimage.sobel(g, 0))
ov = P[OVAL][:, :2]; ovc = ov.mean(0)
inner = Path(ovc + (ov - ovc) * 0.93)
yy, xx = np.mgrid[0:IH, 0:IW]
cand_y, cand_x = np.nonzero(mag > np.percentile(mag[head], 82))
keep = inner.contains_points(np.c_[cand_x, -cand_y.astype(float)])
cand_x, cand_y = cand_x[keep], cand_y[keep]
w = mag[cand_y, cand_x]
rng0 = np.random.default_rng(3)
order0 = np.argsort(-(w * rng0.uniform(0.6, 1.0, len(w))))
taken = cKDTree(lm_xy * np.array([1, -1]))
extra = []
MIN_D, MAX_EXTRA = 6.5, 520
pts_tree_pts = []
for j in order0:
    x, y = float(cand_x[j]), float(cand_y[j])
    if taken.query([x, y])[0] < 4.5:
        continue
    if pts_tree_pts and min(abs(x - px_) + abs(y - py_) for px_, py_ in pts_tree_pts[-400:]) < MIN_D:
        continue
    z = z_at(x, -y)
    if z is None:
        continue
    extra.append([x, -y, z]); pts_tree_pts.append((x, y))
    if len(extra) >= MAX_EXTRA:
        break
# iris rims
for c_, ring in ((468, range(469, 473)), (473, range(474, 478))):
    r_ = np.mean([np.linalg.norm(P[i][:2] - P[c_][:2]) for i in ring])
    for k in range(10):
        a_ = 2 * math.pi * k / 10
        x, y = P[c_][0] + r_ * math.cos(a_), P[c_][1] + r_ * math.sin(a_)
        z = z_at(x, y)
        if z is not None:
            extra.append([x, y, z + 0.01 * half_w])
# fine grid inside each eye opening: crisp round iris + white sclera
for eye in (EYE_L, EYE_R):
    pe = Path(P[eye][:, :2])
    xs_ = P[eye][:, 0]; ys_ = P[eye][:, 1]
    STEP = 4.0
    for gy_ in np.arange(ys_.min() + STEP / 2, ys_.max(), STEP):
        for gx_ in np.arange(xs_.min() + STEP / 2, xs_.max(), STEP):
            if pe.contains_point([gx_, gy_], radius=-1.5):
                z = z_at(gx_, gy_)
                if z is not None:
                    extra.append([gx_ + (rng0.random() - 0.5) * 1.2, gy_ + (rng0.random() - 0.5) * 1.2, z])
# drop edge points that landed too close to an eye-grid point (avoids slivers)
ex = np.array(extra)
keep_m = np.ones(len(ex), bool)
tr_ = cKDTree(ex[:, :2])
for i, j in sorted(tr_.query_pairs(2.2)):
    if keep_m[i] and keep_m[j]:
        keep_m[j] = False
extra = ex[keep_m].tolist()
verts += extra
print('edge points added', len(extra))
VV = np.array(verts)


def uvp(p):
    return [math.atan2(p[0] - cx, p[2] - zc) * half_w, p[1]]


def uv(i):
    return uvp(P[i])


UV = np.array([uvp(p) for p in VV])
tri = Delaunay(UV)
oval_path = Path(np.array([uv(i) for i in OVAL]))
reg_polys = [(3, Path(np.array([uv(i) for i in EYE_L]))), (3, Path(np.array([uv(i) for i in EYE_R]))),
             (2, Path(np.array([uv(i) for i in BROW_L]))), (2, Path(np.array([uv(i) for i in BROW_R]))),
             (4, Path(np.array([uv(i) for i in LIPS_OUT])))]
tris, region = [], []
for s in tri.simplices:
    c = UV[s].mean(0)
    if not oval_path.contains_point(c, radius=-1e-6):
        continue
    r = 0
    for code, pth in reg_polys:
        if pth.contains_point(c):
            r = code; break
    tris.append([int(k) for k in s]); region.append(r)
V = np.array(verts)
for t in tris:
    a, b, c = V[t]
    if np.cross(b - a, c - a)[2] < 0:
        t[1], t[2] = t[2], t[1]
face_tris = len(tris)

# ---------------- head shell ----------------
y_brow = np.mean([P[i][1] for i in (105, 334)])
C = np.array([cx, y_brow - 0.12 * half_w, z_ear - 0.10 * half_w])
A_top = np.array([1.06, 1.30, 1.40]) * half_w
A_bot = np.array([1.00, 1.25, 1.28]) * half_w
ear_bottom_y = P[234][1] - 0.55 * half_w
ear_top_y = P[234][1] + 0.22 * half_w


def ell(v):
    return A_top if v[1] >= 0 else A_bot


def slerp(a, b, t):
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b)
    om = math.acos(max(-1, min(1, float(a @ b))))
    if om < 1e-5:
        return a
    return (math.sin((1 - t) * om) * a + math.sin(t * om) * b) / math.sin(om)


def hairy(pt):
    """does this head-surface point carry hair?"""
    if pt[2] > z_ear - 0.05 * half_w:          # front half: ask the photo
        x, y = px(pt)
        return bool(hair[y, x]) or (not head[y, x] and pt[1] > P[234][1])
    if pt[2] > z_ear - 0.50 * half_w:          # beside the ear: skin below the ear top (temples/sideburns only)
        return pt[1] > ear_top_y
    return pt[1] > ear_bottom_y                 # behind the ears: hair down to ear bottom


K = 12
KH = 3          # ring index that sits exactly on the hairline
back = np.array([0.0, 0.18, -1.0]); back /= np.linalg.norm(back)
NCOL = 2 * len(OVAL)


def col_base(bi):
    return P[OVAL[bi // 2]] if bi % 2 == 0 else (P[OVAL[bi // 2]] + P[OVAL[(bi // 2 + 1) % len(OVAL)]]) / 2


def loft(p, t):
    """point on the bare skull along the path from face-edge point p to the back pole"""
    q = (p - C) / ell(p - C)
    r0 = np.linalg.norm(q); n = q / r0
    dv = slerp(n, back, t)
    A = ell(dv)
    r = r0 + (1.0 - r0) * min(1.0, t * 2.2)
    return C + A * dv * r, dv, A


# face-oval half width by height: the head may not bulge wider than the jaw below the cheekbones
_ov = np.array([P[i] for i in OVAL])
_ys = np.linspace(_ov[:, 1].min(), _ov[:, 1].max(), 60)
_hw_at = np.array([np.abs(_ov[np.abs(_ov[:, 1] - y) < 0.12 * half_w, 0] - cx).max() for y in _ys])
y_cheek = P[234][1] - 0.10 * half_w


def clamp_jaw(pt):
    if pt[1] < y_cheek:
        lim = np.interp(pt[1], _ys, _hw_at) * 1.01
        k = min(1.0, (y_cheek - pt[1]) / (0.25 * half_w))     # ease in below the cheekbone
        lim = lim * k + abs(pt[0] - cx) * (1 - k) if abs(pt[0] - cx) > lim else lim
        if abs(pt[0] - cx) > lim:
            pt = pt.copy(); pt[0] = cx + math.copysign(lim, pt[0] - cx)
    return pt


# where does each column cross into hair? (walk the path, ask hairy())
t_hair = np.zeros(NCOL)
for bi in range(NCOL):
    p = col_base(bi)
    th = 1.0
    for tt in np.linspace(0.0, 1.0, 121)[1:]:
        if hairy(loft(p, tt)[0]):
            th = tt; break
    t_hair[bi] = th
t_hair = ndimage.median_filter(t_hair, size=3, mode='wrap')
t_hair = np.clip(t_hair, 0.03, 0.97)

rings = [[sel_idx[i] for i in OVAL]]
shell_ids = []
for k in range(1, K + 1):
    ring = []
    for bi in range(NCOL):
        th = t_hair[bi]
        if k <= KH:                       # skin rows, evenly up to the hairline
            t = th * k / KH
        else:                             # hair rows, denser near the hairline
            t = th + (1 - th) * ((k - KH) / (K - KH)) ** 1.4
        pt, dv, A = loft(col_base(bi), t)
        pt = clamp_jaw(pt)
        if k > KH:
            up = max(0.0, dv[1]); front = max(0.0, dv[2])
            pt = pt + (A * dv / np.linalg.norm(A * dv)) * half_w * (
                0.04 + 0.26 * up ** 0.8 + 0.13 * abs(dv[0]) * min(1.0, max(0.0, (dv[1] - 0.12) / 0.35)) + 0.22 * up * front)
        verts.append(pt.tolist()); ring.append(len(verts) - 1); shell_ids.append(len(verts) - 1)
    rings.append(ring)

# fit the upper silhouette to the photo's head outline (front view, radial)
O2 = np.array([cx, P[234][1]])
ys, xs = np.nonzero(head)
hy = -ys.astype(float)
ang_pix = np.arctan2(hy - O2[1], xs - O2[0])
rad_pix = np.hypot(xs - O2[0], hy - O2[1])
upper = hy > O2[1] - 0.05 * half_w
NB = 20
bins = np.linspace(0, math.pi, NB + 1)
target = np.zeros(NB)
for b in range(NB):
    m = upper & (ang_pix >= bins[b]) & (ang_pix < bins[b + 1])
    target[b] = np.percentile(rad_pix[m], 99.5) if m.sum() > 20 else 0
Vs = np.array(verts)
sid = np.array(shell_ids)
sv = Vs[sid]
ang = np.arctan2(sv[:, 1] - O2[1], sv[:, 0] - O2[0])
rad = np.hypot(sv[:, 0] - O2[0], sv[:, 1] - O2[1])
cur = np.zeros(NB)
for b in range(NB):
    m = (ang >= bins[b]) & (ang < bins[b + 1])
    cur[b] = rad[m].max() if m.any() else 0
scale = np.where((cur > 0) & (target > 0), target / np.maximum(cur, 1e-6), 1.0)
scale = np.clip(ndimage.uniform_filter1d(np.clip(scale, 0.8, 1.25), 5, mode='nearest'), 0.85, 1.2)
centers = (bins[:-1] + bins[1:]) / 2
for j, v in enumerate(sid):
    a = ang[j]
    if sv[j, 1] < O2[1]:
        w = max(0.0, 1 - (O2[1] - sv[j, 1]) / (0.35 * half_w))   # fade out below ear level
    else:
        w = 1.0
    if a < 0:
        a = 0 if a > -math.pi / 2 else math.pi
    s = 1 + (np.interp(a, centers, scale) - 1) * w
    verts[v][0] = O2[0] + (verts[v][0] - O2[0]) * s
    verts[v][1] = O2[1] + (verts[v][1] - O2[1]) * s

Vn = np.array(verts)
nO = len(OVAL)


def band_tris(k):
    r0, r1 = rings[k], rings[k + 1]
    out = []
    if k == 0:   # 36 oval points -> 72 ring points
        for i in range(nO):
            j = (i + 1) % nO
            a0, a1, a2 = r1[2 * i], r1[2 * i + 1], r1[(2 * i + 2) % (2 * nO)]
            out += [[r0[i], a0, a1], [r0[i], a1, r0[j]], [r0[j], a1, a2]]
    else:
        n2 = 2 * nO
        for i in range(n2):
            j = (i + 1) % n2
            out += [[r0[i], r1[i], r1[j]], [r0[i], r1[j], r0[j]]]
    return out


for k in range(K):
    is_hair_band = k >= KH
    for t in band_tris(k):
        a, b, c = Vn[t]
        nrm = np.cross(b - a, c - a)
        if np.linalg.norm(nrm) < 1e-3:
            continue
        cen = (a + b + c) / 3
        if nrm @ (cen - C) < 0:
            t = [t[0], t[2], t[1]]
        tris.append(t); region.append(1 if is_hair_band else 0)

# ---------------- ears (measured: top ~ y345, bottom ~ y485, ~50px out) ----------------
def add_ear(side):
    tr = P[234] if side < 0 else P[454]
    top_y = tr[1] + 0.30 * half_w
    bot_y = tr[1] - 0.55 * half_w
    x0 = tr[0] - side * 0.03 * half_w
    zf = tr[2] - 0.05 * half_w
    depth, flare = 0.42 * half_w, 0.33 * half_w
    outline = [(0.05, 1.00, 0.35), (0.45, 1.05, 0.75), (0.85, 0.85, 1.00), (1.00, 0.50, 1.00),
               (0.90, 0.10, 0.85), (0.60, -0.25, 0.65), (0.30, -0.45, 0.45), (0.05, -0.30, 0.20),
               (0.00, 0.30, 0.15)]
    inner = [(0.45, 0.55, 0.45), (0.50, 0.15, 0.40)]
    base = len(verts)
    for u, v, w in outline + inner:
        y = bot_y + (top_y - bot_y) * (v + 0.45) / 1.5
        verts.append([x0 + side * w * flare, y, zf - u * depth])
    no = len(outline); c1, c2 = base + no, base + no + 1
    fan = [(0, 1, c1), (1, 2, c1), (2, 3, c1), (3, c2, c1), (3, 4, c2), (4, 5, c2), (5, 6, c2),
           (6, 7, c2), (7, 8, c2), (8, c1, c2), (8, 0, c1)]
    Vt = np.array(verts)
    for a, b, c in fan:
        t = [base + a if a < no else a, base + b if b < no else b, base + c if c < no else c]
        nn = np.cross(Vt[t[1]] - Vt[t[0]], Vt[t[2]] - Vt[t[0]])
        if nn[0] * side < 0:
            t = [t[0], t[2], t[1]]
        tris.append(t); region.append(6)


add_ear(-1); add_ear(1)

# ---------------- neck (measured: ~276px wide under the jaw, slimming a little) ----------------
chin = P[152]
neck_top = chin[1] + 0.35 * half_w
neck_bot = chin[1] - 0.62 * half_w
nz = z_ear + 0.10 * half_w
rx, rz = 0.78 * half_w, 0.60 * half_w
SIDES = 12
nrings = []
for y, sx, dz in [(neck_top, 0.95, 0.10 * half_w), (chin[1] - 0.22 * half_w, 0.93, 0.04 * half_w), (neck_bot, 1.02, 0.12 * half_w)]:
    ring = []
    for s in range(SIDES):
        a = 2 * math.pi * s / SIDES + math.pi / SIDES
        verts.append([cx + math.sin(a) * rx * sx, y, nz + dz + math.cos(a) * rz * sx]); ring.append(len(verts) - 1)
    nrings.append(ring)
Vt = np.array(verts)
for k in range(len(nrings) - 1):
    for s in range(SIDES):
        s2 = (s + 1) % SIDES
        for t in ([nrings[k][s], nrings[k + 1][s], nrings[k + 1][s2]], [nrings[k][s], nrings[k + 1][s2], nrings[k][s2]]):
            a, b, c = Vt[t]; cen = (a + b + c) / 3
            if np.cross(b - a, c - a) @ (cen - np.array([cx, cen[1], nz])) < 0:
                t = [t[0], t[2], t[1]]
            tris.append(t); region.append(5)
verts.append([cx, neck_bot, nz + 0.10 * half_w]); cap = len(verts) - 1
for s in range(SIDES):
    tris.append([cap, nrings[-1][(s + 1) % SIDES], nrings[-1][s]]); region.append(7)

# ---------------- colour from the photo ----------------
def rasterize(V, T):
    """front orthographic z-buffer in photo pixels -> facet id per pixel"""
    zbuf = np.full((IH, IW), -1e9, np.float32)
    idb = np.full((IH, IW), -1, np.int32)
    for ti, t in enumerate(T):
        a, b, c = V[t]
        if np.cross(b - a, c - a)[2] <= 0:      # facing away from the camera
            continue
        xs2 = np.array([a[0], b[0], c[0]]); ys2 = -np.array([a[1], b[1], c[1]]); zs2 = np.array([a[2], b[2], c[2]])
        x0, x1 = int(max(0, math.floor(xs2.min()))), int(min(IW - 1, math.ceil(xs2.max())))
        y0, y1 = int(max(0, math.floor(ys2.min()))), int(min(IH - 1, math.ceil(ys2.max())))
        if x1 < x0 or y1 < y0:
            continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        den = (ys2[1] - ys2[2]) * (xs2[0] - xs2[2]) + (xs2[2] - xs2[1]) * (ys2[0] - ys2[2])
        if abs(den) < 1e-9:
            continue
        w0 = ((ys2[1] - ys2[2]) * (gx - xs2[2]) + (xs2[2] - xs2[1]) * (gy - ys2[2])) / den
        w1 = ((ys2[2] - ys2[0]) * (gx - xs2[2]) + (xs2[0] - xs2[2]) * (gy - ys2[2])) / den
        w2 = 1 - w0 - w1
        inside = (w0 >= -1e-6) & (w1 >= -1e-6) & (w2 >= -1e-6)
        if not inside.any():
            continue
        z = w0 * zs2[0] + w1 * zs2[1] + w2 * zs2[2]
        sub_z = zbuf[y0:y1 + 1, x0:x1 + 1]; sub_id = idb[y0:y1 + 1, x0:x1 + 1]
        upd = inside & (z > sub_z)
        sub_z[upd] = z[upd]; sub_id[upd] = ti
    return idb


def pixel_groups(idb, n):
    fid = idb.ravel()
    order = np.argsort(fid, kind='stable')
    srt = fid[order]
    st = np.searchsorted(srt, np.arange(n)); en = np.searchsorted(srt, np.arange(n), side='right')
    return [order[st[i]:en[i]] for i in range(n)]


# adaptive detail: split face facets that cover a lot of colour change (eyes, brows,
# moustache, lips, nostrils) into 4, up to 3 times. Smooth skin keeps big sheets.
flat_px_all = img.reshape(-1, 3)
is_face = [True] * face_tris + [False] * (len(tris) - face_tris)
mid_cache = {}


def midpoint(i, j):
    key = (min(i, j), max(i, j))
    if key not in mid_cache:
        verts.append(((np.array(verts[i]) + np.array(verts[j])) / 2).tolist())
        mid_cache[key] = len(verts) - 1
    return mid_cache[key]


for level, (thr, min_px) in enumerate([(9.0, 40), (11.0, 18), (13.0, 9)]):
    V = np.array(verts); T = np.array(tris)
    groups = pixel_groups(rasterize(V, T), len(T))
    new_tris, new_reg, new_face = [], [], []
    split = 0
    for ti, t in enumerate(tris):
        g = groups[ti]
        if is_face[ti] and len(g) >= min_px:
            sd = flat_px_all[g].std(0).mean()
            if sd > thr:
                a, b, c = t
                ab, bc, ca = midpoint(a, b), midpoint(b, c), midpoint(c, a)
                for q in ([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]):
                    new_tris.append(q); new_reg.append(region[ti]); new_face.append(True)
                split += 1
                continue
        new_tris.append(t); new_reg.append(region[ti]); new_face.append(is_face[ti])
    tris, region, is_face = new_tris, new_reg, new_face
    print(f'detail pass {level + 1}: split {split} facets -> {len(tris)}')

V = np.array(verts); T = np.array(tris)
idb = rasterize(V, T)
valid = head
cols = np.full((len(T), 3), np.nan)
flat_ok = valid.ravel(); flat_px = img.reshape(-1, 3)
groups = pixel_groups(idb, len(T))
for ti in range(len(T)):
    idx = groups[ti]
    if len(idx) == 0:
        continue
    ok = idx[flat_ok[idx]]
    if len(ok) >= max(5, 0.4 * len(idx)):
        cols[ti] = np.median(flat_px[ok], 0) * 0.5 + flat_px[ok].mean(0) * 0.5
    elif len(ok) >= 1:
        # tiny facet: average a small window at its centre instead of 1-4 noisy pixels
        cxp, cyp = V[T[ti]][:, 0].mean(), -V[T[ti]][:, 1].mean()
        x0_, y0_ = int(max(0, cxp - 1.5)), int(max(0, cyp - 1.5))
        win = img[y0_:y0_ + 3, x0_:x0_ + 3].reshape(-1, 3)
        cols[ti] = win.mean(0)

# hidden facets: borrow from nearest sampled facets of the same kind (hair vs skin)
cent = V[T].mean(1)
reg = np.array(region)
reg0 = np.array(region)
_l = np.nan_to_num(cols @ np.array([0.299, 0.587, 0.114]), nan=0)
cols[(reg0 == 1) & (_l > 46)] = np.nan        # hair-band facets that caught skin/edge pixels
sampled = ~np.isnan(cols[:, 0])
lum = np.where(sampled, cols @ np.array([0.299, 0.587, 0.114]) if sampled.any() else 0, np.nan)
hair_src = sampled & (np.nan_to_num(lum) < 75)
skin_src = sampled & (np.nan_to_num(lum) >= 75) & (reg != 3) & (reg != 4) & (reg != 2)
rng = np.random.default_rng(7)
for kind, src in (('hair', hair_src), ('skin', skin_src)):
    tree = cKDTree(cent[src]); srcc = cols[src]
    for ti in np.nonzero(~sampled)[0]:
        want_hair = reg[ti] == 1
        if want_hair != (kind == 'hair'):
            continue
        dist, nn = tree.query(cent[ti], k=6)
        c = srcc[nn].mean(0)
        if reg[ti] == 7:
            c = c * 0.8
        cols[ti] = c * (1 + rng.uniform(-0.05, 0.05))
cols = np.clip(np.nan_to_num(cols, nan=150), 0, 255)
# clean round irises: facets inside the iris circle take the iris colour (catchlight removed)
cent2 = V[T].mean(1)
for c_, ring in ((468, range(469, 473)), (473, range(474, 478))):
    r_ = np.mean([np.linalg.norm(P[i][:2] - P[c_][:2]) for i in ring])
    yy0, xx0 = int(-P[c_][1]), int(P[c_][0]); R_ = int(r_)
    patch = img[yy0 - R_:yy0 + R_, xx0 - R_:xx0 + R_].reshape(-1, 3)
    iris_col = np.median(patch[(patch @ np.array([0.299, 0.587, 0.114])) < 70], 0)
    din = np.hypot(cent2[:, 0] - P[c_][0], cent2[:, 1] - P[c_][1])
    m = (din < r_ * 0.8) & np.isin(np.array(region), [3, 8, 0]) & (cent2[:, 2] > P[c_][2] - 0.2 * half_w)
    cols[m] = iris_col
    # one small catchlight, like the photo
    ang_ = math.radians(40)
    hx, hy = P[c_][0] + 0.35 * r_ * math.cos(ang_), P[c_][1] + 0.35 * r_ * math.sin(ang_)
    hl = np.argmin(np.hypot(cent2[:, 0] - hx, cent2[:, 1] - hy) + 1e3 * (cent2[:, 2] < P[c_][2] - 0.2 * half_w))
    cols[hl] = np.array([225, 228, 235])

# despeckle: tiny facets that disagree strongly with their neighbours take the neighbour average
vt = {}
for ti, t in enumerate(T):
    for v_ in t:
        vt.setdefault(int(v_), []).append(ti)
_e1 = V[T][:, 1, :2] - V[T][:, 0, :2]; _e2 = V[T][:, 2, :2] - V[T][:, 0, :2]
area = 0.5 * np.abs(_e1[:, 0] * _e2[:, 1] - _e1[:, 1] * _e2[:, 0])
lumv = cols @ np.array([0.299, 0.587, 0.114])
for ti in np.nonzero(area < 8)[0]:
    nb = {n for v_ in T[ti] for n in vt[int(v_)]} - {ti}
    if not nb:
        continue
    nb = list(nb); avg = cols[nb].mean(0)
    if abs(lumv[ti] - avg @ np.array([0.299, 0.587, 0.114])) > 55 and region[ti] not in (3, 8):
        cols[ti] = avg

eye_m = np.isin(np.array(region), [3, 8])
g = cols[eye_m].mean(1, keepdims=True)
cols[eye_m] = g + (cols[eye_m] - g) * 0.7

# ---------------- normalise + write ----------------
center = np.array([cx, (V[:, 1].max() + V[:, 1].min()) / 2, z_ear])
sc = (V[:, 1].max() - V[:, 1].min()) / 2
Vn = (V - center) / sc
hexes = ['%02x%02x%02x' % tuple(int(round(v)) for v in c) for c in cols]
json.dump({
    'positions': [round(float(x), 4) for x in Vn.reshape(-1)],
    'triangles': [int(i) for t in T for i in t],
    'regions': [int(r) for r in region],
    'colors': hexes,
    'faceTriangles': face_tris,
}, open(OUT, 'w'))
print('verts', len(V), 'tris', len(T), 'face tris', face_tris, 'sampled', int(sampled.sum()), 'filled', int((~sampled).sum()))
