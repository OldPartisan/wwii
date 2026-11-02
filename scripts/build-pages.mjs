import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const out = path.join(root, 'dist-pages');

execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root, stdio: 'inherit' });

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(dist, out, { recursive: true });
fs.writeFileSync(path.join(out, '.nojekyll'), '');

const textExt = new Set(['.html', '.js', '.css', '.json', '.svg']);
const replacements = [
  ['"/assets/', '"./assets/'],
  ["'/assets/", "'./assets/"],
  ['"/data/', '"./data/'],
  ["'/data/", "'./data/"],
  ['"/img/', '"./img/'],
  ["'/img/", "'./img/"],
  ['"/favicon', '"./favicon'],
  ["'/favicon", "'./favicon"],
  ['url(/assets/', 'url(./assets/'],
];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (textExt.has(path.extname(ent.name))) {
      let s = fs.readFileSync(p, 'utf8');
      for (const [a, b] of replacements) s = s.split(a).join(b);
      fs.writeFileSync(p, s);
    }
  }
}
walk(out);

const leftovers = [];
function scan(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) scan(p);
    else if (textExt.has(path.extname(ent.name))) {
      const s = fs.readFileSync(p, 'utf8');
      for (const token of ['"/assets/', '"/data/', '"/img/', '"/favicon', 'url(/assets/']) {
        if (s.includes(token)) leftovers.push(`${path.relative(out, p)}: ${token}`);
      }
    }
  }
}
scan(out);
if (leftovers.length) {
  console.error('Absolute project paths left:', leftovers.slice(0, 10));
  process.exit(1);
}
console.log(`Pages build ready: ${out}`);
