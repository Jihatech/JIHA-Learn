/* Générateur de schémas SVG pour les :::figure.
   Style aligné sur les schémas inline de build.mjs (thème CRT/ambre, currentColor).
   Chaque spec -> schemas/<name>.svg. Layouts : flow, layers, grid, hubspoke, cycle. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPECS } from './schema-specs.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'schemas');
mkdirSync(OUT, { recursive: true });

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const STYLE = `
  <style>
    .box{fill:none;stroke:currentColor;stroke-width:1.5}
    .box-accent{fill:#ffb627;stroke:#c98d10;stroke-width:1.5}
    .box-soft{fill:#1e3a5f;stroke:#1e3a5f;stroke-width:1.5}
    .lbl{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;fill:currentColor;font-weight:600}
    .lbl-fill{fill:#0d1117}.lbl-blue{fill:#f5f0e6}
    .sub{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;fill:currentColor;opacity:.62}
    .sub-fill{fill:#0d1117;opacity:.72}.sub-blue{fill:#d1d9e0;opacity:.85}
    .ttl{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;fill:currentColor;opacity:.8;font-weight:600}
    .arrow{stroke:currentColor;stroke-width:1.5;fill:none;marker-end:url(#ar)}
    .dash{stroke:#ffb627;stroke-dasharray:5,3;stroke-width:1.4;fill:none}
  </style>
  <defs><marker id="ar" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
    <path d="M0,0 L0,6 L9,3 z" fill="currentColor"/></marker></defs>`;

// découpe un texte en lignes de ~max caractères
function wrap(s, max) {
  const words = String(s).split(/\s+/);
  const lines = []; let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function boxNode(x, y, w, h, n) {
  const cls = n.accent ? 'box-accent' : n.soft ? 'box-soft' : 'box';
  const lc = n.accent ? 'lbl lbl-fill' : n.soft ? 'lbl lbl-blue' : 'lbl';
  const sc = n.accent ? 'sub sub-fill' : n.soft ? 'sub sub-blue' : 'sub';
  const cx = x + w / 2;
  let out = `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`;
  const labelLines = wrap(n.label, Math.floor(w / 7.2));
  const subLines = n.sub ? wrap(n.sub, Math.floor(w / 6)) : [];
  const totalLines = labelLines.length + subLines.length;
  let ty = y + h / 2 - (totalLines - 1) * 6.5 + 4;
  for (const ln of labelLines) { out += `<text class="${lc}" x="${cx}" y="${ty}" text-anchor="middle">${esc(ln)}</text>`; ty += 13; }
  for (const ln of subLines) { out += `<text class="${sc}" x="${cx}" y="${ty}" text-anchor="middle">${esc(ln)}</text>`; ty += 12; }
  return out;
}

function svgWrap(name, w, h, title, inner) {
  return `
<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="s-${name}">
  <title id="s-${name}">${esc(title)}</title>${STYLE}
  ${inner}
</svg>`;
}

// ---- Layouts ----
function layoutFlow(spec) {
  // chaîne horizontale (avec retour à la ligne si > 4), flèches entre nœuds
  const W = 760, pad = 16, gap = 26;
  const perRow = Math.min(spec.nodes.length, spec.perRow || (spec.nodes.length <= 4 ? spec.nodes.length : Math.ceil(spec.nodes.length / 2)));
  const rows = [];
  for (let i = 0; i < spec.nodes.length; i += perRow) rows.push(spec.nodes.slice(i, i + perRow));
  const bw = Math.floor((W - pad * 2 - gap * (perRow - 1)) / perRow);
  const bh = 66, rowGap = 40, top = 40;
  let inner = `<text class="ttl" x="${W/2}" y="22" text-anchor="middle">${esc(spec.title || '')}</text>`;
  let idx = 0;
  rows.forEach((row, r) => {
    const y = top + r * (bh + rowGap);
    const rowW = row.length * bw + (row.length - 1) * gap;
    const x0 = (W - rowW) / 2;
    row.forEach((n, c) => {
      const x = x0 + c * (bw + gap);
      inner += boxNode(x, y, bw, bh, n);
      if (c < row.length - 1) inner += `<path class="arrow" d="M ${x + bw} ${y + bh/2} L ${x + bw + gap} ${y + bh/2}"/>`;
      idx++;
    });
    // flèche de fin de rangée vers rangée suivante (serpentin)
    if (r < rows.length - 1) {
      const lastX = x0 + rowW;
      inner += `<path class="arrow" d="M ${lastX - bw/2} ${y + bh} L ${lastX - bw/2} ${y + bh + rowGap/2} L ${(W - rows[r+1].length*bw - (rows[r+1].length-1)*gap)/2 + bw/2} ${y + bh + rowGap/2} L ${(W - rows[r+1].length*bw - (rows[r+1].length-1)*gap)/2 + bw/2} ${y + bh + rowGap}"/>`;
    }
  });
  const h = top + rows.length * bh + (rows.length - 1) * rowGap + (spec.foot ? 46 : 24);
  if (spec.foot) inner += foot(spec.foot, W, h);
  return svgWrap(spec.name, W, h, spec.title || spec.name, inner);
}

function layoutLayers(spec) {
  const W = 760, pad = 90, top = 40, bh = 40, gap = 10;
  let inner = `<text class="ttl" x="${W/2}" y="22" text-anchor="middle">${esc(spec.title || '')}</text>`;
  spec.nodes.forEach((n, i) => {
    const y = top + i * (bh + gap);
    const w = W - pad * 2 - i * 0; // bandes pleine largeur
    inner += boxNode(pad, y, W - pad * 2, bh, n);
  });
  const h = top + spec.nodes.length * (bh + gap) + (spec.foot ? 40 : 14);
  if (spec.foot) inner += foot(spec.foot, W, h);
  return svgWrap(spec.name, W, h, spec.title || spec.name, inner);
}

function layoutGrid(spec) {
  const W = 760, pad = 16, cols = spec.cols || 3, gap = 18, top = 40;
  const bw = Math.floor((W - pad * 2 - gap * (cols - 1)) / cols);
  const bh = 62, rowGap = 16;
  let inner = `<text class="ttl" x="${W/2}" y="22" text-anchor="middle">${esc(spec.title || '')}</text>`;
  spec.nodes.forEach((n, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    inner += boxNode(pad + c * (bw + gap), top + r * (bh + rowGap), bw, bh, n);
  });
  const rows = Math.ceil(spec.nodes.length / cols);
  const h = top + rows * bh + (rows - 1) * rowGap + (spec.foot ? 42 : 16);
  if (spec.foot) inner += foot(spec.foot, W, h);
  return svgWrap(spec.name, W, h, spec.title || spec.name, inner);
}

function layoutHub(spec) {
  const W = 760, H = 380, cx = W / 2, cy = 200;
  const hubW = 200, hubH = 70;
  let inner = `<text class="ttl" x="${W/2}" y="22" text-anchor="middle">${esc(spec.title || '')}</text>`;
  const sats = spec.nodes.slice(1);
  const bw = 150, bh = 56, Rx = 220, Ry = 130;
  const pos = (i) => {
    const a = (-Math.PI / 2) + (i * 2 * Math.PI / sats.length);
    return { x: cx + Math.cos(a) * Rx - bw / 2, y: cy + Math.sin(a) * Ry - bh / 2 };
  };
  // flèches depuis le bord du hub vers chaque satellite
  sats.forEach((n, i) => {
    const p = pos(i);
    inner += `<path class="arrow" d="M ${cx} ${cy} L ${p.x + bw/2} ${p.y + bh/2}"/>`;
  });
  sats.forEach((n, i) => { const p = pos(i); inner += boxNode(p.x, p.y, bw, bh, n); });
  inner += boxNode(cx - hubW / 2, cy - hubH / 2, hubW, hubH, { ...spec.nodes[0], accent: true });
  if (spec.foot) inner += foot(spec.foot, W, H - 6);
  return svgWrap(spec.name, W, H, spec.title || spec.name, inner);
}

function foot(text, W, h) {
  return `<text class="sub" x="${W/2}" y="${h - 8}" text-anchor="middle">${esc(text)}</text>`;
}

const LAYOUTS = { flow: layoutFlow, layers: layoutLayers, grid: layoutGrid, hubspoke: layoutHub, cycle: layoutFlow };

let n = 0;
for (const spec of SPECS) {
  const fn = LAYOUTS[spec.layout] || layoutFlow;
  writeFileSync(join(OUT, spec.name + '.svg'), fn(spec).trim() + '\n');
  n++;
}
console.log('généré', n, 'schémas dans schemas/');
