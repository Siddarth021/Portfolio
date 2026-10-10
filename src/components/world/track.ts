import * as THREE from 'three';

/** The winding road. Stops are spread evenly along it. */
export const curve = new THREE.CatmullRomCurve3(
  Array.from({ length: 61 }, (_, i) => {
    const t = i / 60;
    return new THREE.Vector3(-45 + 90 * t, 0, 12 * Math.sin(t * Math.PI * 3));
  }),
);

export const ROAD_HALF = 1.6;
export const STOP_OFFSET = 9;
export const PAD_RADIUS = 4.3;

/** position along the road (0..1) for stop i of n */
export const stopT = (i: number, n: number) => (n <= 1 ? 0.5 : 0.04 + (0.92 * i) / (n - 1));

const samples = Array.from({ length: 240 }, (_, i) => curve.getPointAt(i / 239));
const layouts = new Map<number, ReturnType<typeof layoutStops>>();

/** Puts each stop on whichever side of the road has more free space. */
function layoutStops(n: number) {
  const out: { t: number; road: THREE.Vector3; side: THREE.Vector3; pos: THREE.Vector3 }[] = [];
  for (let i = 0; i < n; i++) {
    const t = stopT(i, n);
    const road = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
    let best: (typeof out)[number] | null = null;
    let bestScore = -Infinity;
    for (const sign of i % 2 ? [1, -1] : [-1, 1]) {
      const side = normal.clone().multiplyScalar(sign);
      const pos = road.clone().addScaledVector(side, STOP_OFFSET);
      const dRoad = Math.min(...samples.map((p) => p.distanceTo(pos)));
      const dPads = Math.min(Infinity, ...out.map((o) => o.pos.distanceTo(pos)));
      let score = Math.min(dRoad, dPads * 0.6);
      if (Math.abs(pos.x) > 54 || Math.abs(pos.z) > 30) score -= 100;
      if (score > bestScore + 0.01) { bestScore = score; best = { t, road, side, pos }; }
    }
    out.push(best!);
  }
  return out;
}

export function placeStop(i: number, n: number) {
  if (!layouts.has(n)) layouts.set(n, layoutStops(n));
  return layouts.get(n)![i];
}

/** Shared, mutable car progress. Kept outside React so it can change every frame. */
export const motion = { carT: stopT(0, 10) };
