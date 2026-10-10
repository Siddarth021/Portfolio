// After `npm run preview:export`: make font URLs inside the CSS relative, so the
// exported folder works from any location (not only from a site root).
import fs from 'node:fs';
import path from 'node:path';
const dir = 'out/_next/static/css';
for (const f of fs.readdirSync(dir)) {
  const p = path.join(dir, f);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/url\((?:\.\/)?_next\/static\/media\//g, 'url(../media/'));
}
console.log('preview export ready in ./out');
