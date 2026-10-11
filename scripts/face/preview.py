import json, math, sys
import numpy as np
from PIL import Image, ImageDraw

src = sys.argv[1] if len(sys.argv) > 1 else 'face_mesh.json'
out = sys.argv[2] if len(sys.argv) > 2 else 'preview.png'
d = json.load(open(src))
V = np.array(d['positions']).reshape(-1, 3)
T = np.array(d['triangles']).reshape(-1, 3)
R = d['regions']
COLS = [tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) for h in d['colors']] if 'colors' in d else None
pal = {0: (226, 230, 222), 1: (60, 70, 64), 2: (80, 92, 84), 3: (150, 160, 150),
       4: (212, 170, 150), 5: (214, 220, 210), 6: (220, 225, 216), 7: (180, 188, 178), 8: (70, 78, 72)}
light = np.array([0.5, 0.6, 0.8]); light /= np.linalg.norm(light)

imgs = []
for yaw in (0, -15, -35, -80):
    a = math.radians(yaw)
    Ry = np.array([[math.cos(a), 0, math.sin(a)], [0, 1, 0], [-math.sin(a), 0, math.cos(a)]])
    P = V @ Ry.T
    S = 260
    im = Image.new('RGB', (600, 640), (232, 237, 231))
    dr = ImageDraw.Draw(im)
    order = np.argsort([P[t].mean(0)[2] for t in T])
    for i in order:
        t = T[i]
        a3, b3, c3 = P[t]
        n = np.cross(b3 - a3, c3 - a3)
        nn = np.linalg.norm(n)
        if nn == 0:
            continue
        n /= nn
        if n[2] < 0:
            n = -n
        k = 0.78 + 0.32 * max(0, n @ light)
        base = COLS[i] if COLS else pal[R[i]]
        col = tuple(int(min(255, c * k)) for c in base)
        pts = [(300 + p[0] * S, 320 - p[1] * S) for p in (a3, b3, c3)]
        dr.polygon(pts, fill=col, outline=col)
    imgs.append(im)
W = sum(i.width for i in imgs)
sheet = Image.new('RGB', (W, 640))
x = 0
for i in imgs:
    sheet.paste(i, (x, 0)); x += i.width
sheet.save(out)
