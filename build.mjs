#!/usr/bin/env node
/* ============================================================
 * jiha.tech — générateur de pages de guide
 * Lit content/<id>.md (format GUIDE-TEMPLATE), guides.json et config.json,
 * produit guides/<slug>/index.html — page statique bilingue avec
 * thème terminal, schéma SVG inline, feuille print, et CTA injectés.
 *
 * Zéro dépendance npm. Node 18+ (utilisé pour le linter de cohérence).
 * ============================================================ */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)));

/* -------------------- Helpers -------------------- */
const log = (...a) => console.log('[build]', ...a);
const escapeHtml = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* -------------------- Tiny YAML parser --------------------
 * Suffisant pour notre front-matter : clés plates, valeurs string / int /
 * tableau inline [a, b, c] / chaines entre guillemets. Pas de nested.
 */
function parseFrontmatter(src) {
  const lines = src.split(/\r?\n/);
  const out = {};
  for (const raw of lines) {
    const line = raw.replace(/\s+#.*$/, '').trimEnd();          // strip inline comments
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    out[key] = parseScalar(rawVal);
  }
  return out;
}
function parseScalar(v) {
  v = v.trim();
  if (v === '' || v === 'null') return null;
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^\[.*\]$/.test(v)) {
    return v.slice(1, -1).split(',').map(x => stripQuotes(x.trim())).filter(Boolean);
  }
  return stripQuotes(v);
}
function stripQuotes(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

/* -------------------- Split front-matter / body -------------------- */
function splitGuide(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('Front-matter manquant (--- … ---)');
  return { fm: parseFrontmatter(m[1]), body: m[2] };
}

/* -------------------- Markdown light renderer --------------------
 * On gère uniquement ce qu'on utilise : titres, paragraphes, listes
 * (ul, ol, checkboxes), code fences, **gras**, *italique*, `code inline`,
 * [texte](url). Pas de tables (déjà gérées en HTML dans le source si besoin).
 */
function renderInline(text) {
  let t = escapeHtml(text);
  // images / liens — image avant lien
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // code inline avant le reste pour ne pas casser ` `
  t = t.replace(/`([^`]+)`/g, (_, c) => '<code>' + c + '</code>');
  // gras / italique
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return t;
}

function renderBlock(blockLines) {
  if (blockLines.length === 0) return '';
  const first = blockLines[0];

  // headings
  let m;
  if ((m = first.match(/^(#{1,4})\s+(.*)$/))) {
    const lvl = m[1].length;
    return `<h${lvl}>${renderInline(m[2])}</h${lvl}>`;
  }
  // checklist (lignes - [ ])
  if (blockLines.every(l => /^[-*]\s+\[\s?\]\s+/.test(l))) {
    const items = blockLines.map(l => l.replace(/^[-*]\s+\[\s?\]\s+/, ''));
    return '<ul class="checklist">' + items.map(i => `<li>${renderInline(i)}</li>`).join('') + '</ul>';
  }
  // ul
  if (blockLines.every(l => /^[-*]\s+/.test(l))) {
    return '<ul>' + blockLines.map(l => `<li>${renderInline(l.replace(/^[-*]\s+/, ''))}</li>`).join('') + '</ul>';
  }
  // ol
  if (blockLines.every(l => /^\d+\.\s+/.test(l))) {
    return '<ol>' + blockLines.map(l => `<li>${renderInline(l.replace(/^\d+\.\s+/, ''))}</li>`).join('') + '</ol>';
  }
  // paragraphe
  return '<p>' + renderInline(blockLines.join(' ')) + '</p>';
}

function renderMarkdown(md) {
  // gère blocs de code séparément
  const parts = md.split(/(^```[\s\S]*?^```$)/m);
  let html = '';
  for (const part of parts) {
    if (part.startsWith('```')) {
      const m = part.match(/^```(\w+)?\s*\n([\s\S]*?)\n```$/);
      if (!m) continue;
      const lang = (m[1] || '').toLowerCase();
      const code = m[2];
      html += renderCodeBlock(code, lang);
    } else {
      html += renderTextBlocks(part);
    }
  }
  return html;
}

function renderTextBlocks(md) {
  const blocks = md.split(/\n\s*\n/);
  let html = '';
  for (const b of blocks) {
    const trimmed = b.trim();
    if (!trimmed) continue;
    const lines = trimmed.split('\n').map(l => l.trimEnd()).filter(Boolean);
    html += renderBlock(lines) + '\n';
  }
  return html;
}

function renderCodeBlock(code, lang) {
  const titleMap = {
    bash: 'shell',
    sh: 'shell',
    yaml: 'docker-compose.yml',
    yml: 'docker-compose.yml',
    env: '.env',
    dockerfile: 'Dockerfile',
    json: 'JSON',
    text: 'text',
  };
  const title = titleMap[lang] || (lang || 'text');
  const escaped = escapeHtml(code);
  // IMPORTANT : aucun whitespace entre </div> et <code> — `<pre>` préserve les blancs
  return `<pre class="term lang-${lang || 'text'}"><div class="term-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span><span class="title">${escapeHtml(title)}</span><button class="copy-btn" type="button">Copy</button></div><code>${escaped}</code></pre>
`;
}

/* -------------------- Body parser (sections + :::lang + :::figure) -------------------- */
function parseBody(body) {
  // découpe par section ## name
  const sections = [];
  let cur = null;
  for (const line of body.split('\n')) {
    const h2 = line.match(/^##\s+([\w-]+)\s*$/);
    if (h2) {
      cur = { id: h2[1], lines: [] };
      sections.push(cur);
      continue;
    }
    if (cur) cur.lines.push(line);
  }
  return sections.map(s => ({ id: s.id, blocks: parseBlocks(s.lines.join('\n')) }));
}

function parseBlocks(src) {
  // Découpe en blocs : :::lang fr/en/figure ... ::: ; ### step-NN ; reste
  const blocks = [];
  let i = 0;
  const lines = src.split('\n');
  while (i < lines.length) {
    const l = lines[i];

    // ### step-XX
    const step = l.match(/^###\s+(step-\d+)\s*$/);
    if (step) {
      blocks.push({ kind: 'step-marker', id: step[1] });
      i++; continue;
    }

    // :::lang fr / en
    const langM = l.match(/^:::lang\s+(fr|en)\s*$/);
    if (langM) {
      const buf = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') { buf.push(lines[i]); i++; }
      i++; // saute :::
      blocks.push({ kind: 'lang', lang: langM[1], content: buf.join('\n') });
      continue;
    }

    // :::figure NAME
    const figM = l.match(/^:::figure\s+([\w-]+)\s*$/);
    if (figM) {
      const buf = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') { buf.push(lines[i]); i++; }
      i++;
      // parse caption_fr / caption_en
      const meta = {};
      for (const line of buf) {
        const m = line.match(/^([a-zA-Z_]+):\s*"(.*)"\s*$/);
        if (m) meta[m[1]] = m[2];
      }
      blocks.push({ kind: 'figure', name: figM[1], meta });
      continue;
    }

    // code fence — on garde tout brut
    if (l.startsWith('```')) {
      const buf = [l];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { buf.push(lines[i]); i++; }
      if (i < lines.length) { buf.push(lines[i]); i++; }
      blocks.push({ kind: 'code', raw: buf.join('\n') });
      continue;
    }

    // ligne brute (sera consolidée plus tard)
    blocks.push({ kind: 'raw', raw: l });
    i++;
  }
  // Regroupe les lignes "raw" consécutives en un seul bloc markdown
  const merged = [];
  for (const b of blocks) {
    if (b.kind === 'raw') {
      const last = merged[merged.length - 1];
      if (last && last.kind === 'raw') last.raw += '\n' + b.raw;
      else merged.push({ kind: 'raw', raw: b.raw });
    } else merged.push(b);
  }
  return merged;
}

/* -------------------- SVG schemas (référencés par :::figure NAME) -------------------- */
const SCHEMAS = {
  'traefik-architecture': `
<svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="schema-traefik-title">
  <title id="schema-traefik-title">Architecture Traefik — reverse proxy avec HTTPS auto</title>
  <defs>
    <marker id="arr-tr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="currentColor"/>
    </marker>
  </defs>
  <style>
    .box { fill: none; stroke: currentColor; stroke-width: 1.5; }
    .box-accent { fill: #ffb627; stroke: #c98d10; stroke-width: 1.5; }
    .box-soft { fill: #1e3a5f; stroke: #1e3a5f; stroke-width: 1.5; }
    .label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; fill: currentColor; font-weight: 600; }
    .label-on-fill { fill: #0d1117; }
    .label-on-blue { fill: #f5f0e6; }
    .sub { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; fill: currentColor; opacity: 0.65; }
    .sub-on-fill { fill: #0d1117; opacity: 0.7; }
    .sub-on-blue { fill: #d1d9e0; opacity: 0.85; }
    .arrow-line { stroke: currentColor; stroke-width: 1.5; fill: none; marker-end: url(#arr-tr); }
    .net { stroke: #ffb627; stroke-dasharray: 5,3; stroke-width: 1.5; fill: none; }
  </style>

  <!-- Internet -->
  <text class="label" x="380" y="22" text-anchor="middle">Internet</text>

  <!-- Routeur -->
  <rect class="box" x="280" y="36" width="200" height="44" rx="3"/>
  <text class="label" x="380" y="56" text-anchor="middle" data-lang="fr">Routeur / Box</text>
  <text class="label" x="380" y="56" text-anchor="middle" data-lang="en">Router</text>
  <text class="sub" x="380" y="72" text-anchor="middle">forward :80 / :443</text>
  <path class="arrow-line" d="M 380 80 L 380 105"/>

  <!-- Traefik -->
  <rect class="box-accent" x="240" y="108" width="280" height="76" rx="3"/>
  <text class="label label-on-fill" x="380" y="132" text-anchor="middle">Traefik v3</text>
  <text class="sub sub-on-fill"   x="380" y="148" text-anchor="middle" data-lang="fr">reverse proxy · HTTPS auto · :80 :443</text>
  <text class="sub sub-on-fill"   x="380" y="148" text-anchor="middle" data-lang="en">reverse proxy · auto HTTPS · :80 :443</text>
  <text class="sub sub-on-fill"   x="380" y="164" text-anchor="middle" data-lang="fr">dashboard sécurisé · basic auth</text>
  <text class="sub sub-on-fill"   x="380" y="164" text-anchor="middle" data-lang="en">secured dashboard · basic auth</text>
  <text class="sub sub-on-fill"   x="380" y="178" text-anchor="middle">acme.json (Let's Encrypt)</text>

  <!-- réseau proxy -->
  <rect class="net" x="100" y="210" width="560" height="120" rx="4"/>
  <text class="sub" x="115" y="228" data-lang="fr">réseau Docker partagé · proxy (external)</text>
  <text class="sub" x="115" y="228" data-lang="en">shared Docker network · proxy (external)</text>

  <!-- Connexions -->
  <path class="arrow-line" d="M 340 184 L 220 245"/>
  <path class="arrow-line" d="M 380 184 L 380 245"/>
  <path class="arrow-line" d="M 420 184 L 540 245"/>

  <!-- Service apps -->
  <rect class="box-soft" x="135" y="248" width="170" height="64" rx="3"/>
  <text class="label label-on-blue" x="220" y="270" text-anchor="middle">Vaultwarden</text>
  <text class="sub sub-on-blue"   x="220" y="286" text-anchor="middle" data-lang="fr">labels traefik.*</text>
  <text class="sub sub-on-blue"   x="220" y="286" text-anchor="middle" data-lang="en">traefik.* labels</text>
  <text class="sub sub-on-blue"   x="220" y="302" text-anchor="middle">Host(\`vault.exemple.com\`)</text>

  <rect class="box-soft" x="295" y="248" width="170" height="64" rx="3"/>
  <text class="label label-on-blue" x="380" y="270" text-anchor="middle">whoami</text>
  <text class="sub sub-on-blue"   x="380" y="286" text-anchor="middle">traefik/whoami</text>
  <text class="sub sub-on-blue"   x="380" y="302" text-anchor="middle">Host(\`whoami.exemple.com\`)</text>

  <rect class="box-soft" x="455" y="248" width="170" height="64" rx="3"/>
  <text class="label label-on-blue" x="540" y="270" text-anchor="middle">Immich</text>
  <text class="sub sub-on-blue"   x="540" y="286" text-anchor="middle" data-lang="fr">… etc.</text>
  <text class="sub sub-on-blue"   x="540" y="286" text-anchor="middle" data-lang="en">… etc.</text>
  <text class="sub sub-on-blue"   x="540" y="302" text-anchor="middle">Host(\`photos.exemple.com\`)</text>

  <!-- Socket Docker -->
  <text class="sub" x="40" y="148" data-lang="fr">socket Docker (:ro)</text>
  <text class="sub" x="40" y="148" data-lang="en">Docker socket (:ro)</text>
  <text class="sub" x="40" y="162" data-lang="fr">→ découverte automatique</text>
  <text class="sub" x="40" y="162" data-lang="en">→ auto-discovery</text>
  <path class="arrow-line" d="M 180 155 L 235 145"/>

  <!-- Légende droite -->
  <text class="sub" x="660" y="148" text-anchor="end" data-lang="fr">aucun port exposé</text>
  <text class="sub" x="660" y="148" text-anchor="end" data-lang="en">no ports exposed</text>
  <text class="sub" x="660" y="162" text-anchor="end" data-lang="fr">sur les apps</text>
  <text class="sub" x="660" y="162" text-anchor="end" data-lang="en">on the apps</text>

  <text class="sub" x="380" y="360" text-anchor="middle" data-lang="fr">un seul certificat Let's Encrypt par sous-domaine (TLS challenge)</text>
  <text class="sub" x="380" y="360" text-anchor="middle" data-lang="en">one Let's Encrypt certificate per subdomain (TLS challenge)</text>
</svg>
`,
  architecture: `
<svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="schema-arch-title">
  <title id="schema-arch-title">Architecture Vaultwarden derrière Traefik</title>
  <defs>
    <marker id="arr" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="currentColor"/>
    </marker>
  </defs>
  <style>
    .box { fill: none; stroke: currentColor; stroke-width: 1.5; }
    .box-accent { fill: #ffb627; stroke: #c98d10; stroke-width: 1.5; }
    .box-data { fill: #50c878; stroke: #2c8c4f; stroke-width: 1.5; }
    .label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; fill: currentColor; font-weight: 600; }
    .label-on-fill { fill: #0d1117; }
    .sub { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; fill: currentColor; opacity: 0.65; }
    .sub-on-fill { fill: #0d1117; opacity: 0.7; }
    .arrow-line { stroke: currentColor; stroke-width: 1.5; fill: none; marker-end: url(#arr); }
    .net { stroke: #ffb627; stroke-dasharray: 5,3; stroke-width: 1.5; fill: none; }
  </style>

  <!-- Internet -->
  <text class="label" x="380" y="28" text-anchor="middle" data-lang="fr">Internet</text>
  <text class="label" x="380" y="28" text-anchor="middle" data-lang="en">Internet</text>
  <path class="arrow-line" d="M 380 40 L 380 70"/>

  <!-- Traefik -->
  <rect class="box" x="260" y="74" width="240" height="68" rx="3"/>
  <text class="label" x="380" y="100" text-anchor="middle">Traefik</text>
  <text class="sub"   x="380" y="118" text-anchor="middle">HTTPS · Let's Encrypt · :443</text>
  <text class="sub"   x="380" y="132" text-anchor="middle" data-lang="fr">reverse proxy</text>
  <text class="sub"   x="380" y="132" text-anchor="middle" data-lang="en">reverse proxy</text>

  <!-- Réseau proxy (dashed box) -->
  <rect class="net" x="190" y="160" width="380" height="120" rx="4"/>
  <text class="sub" x="200" y="178" data-lang="fr">réseau Docker · proxy (external)</text>
  <text class="sub" x="200" y="178" data-lang="en">Docker network · proxy (external)</text>

  <path class="arrow-line" d="M 380 142 L 380 190"/>

  <!-- Vaultwarden -->
  <rect class="box-accent" x="270" y="195" width="220" height="68" rx="3"/>
  <text class="label label-on-fill" x="380" y="220" text-anchor="middle">Vaultwarden</text>
  <text class="sub sub-on-fill"   x="380" y="238" text-anchor="middle">vaultwarden/server:1.34.1</text>
  <text class="sub sub-on-fill"   x="380" y="252" text-anchor="middle">:80 → /alive (healthcheck)</text>

  <!-- Volume -->
  <path class="arrow-line" d="M 380 263 L 380 295"/>
  <rect class="box-data" x="240" y="298" width="280" height="50" rx="3"/>
  <text class="label" x="380" y="318" text-anchor="middle" data-lang="fr">Volume disque · ./vw-data/</text>
  <text class="label" x="380" y="318" text-anchor="middle" data-lang="en">Disk volume · ./vw-data/</text>
  <text class="sub"   x="380" y="334" text-anchor="middle">db.sqlite3 · rsa_key.* · attachments/</text>

  <!-- Side labels -->
  <text class="sub" x="22"  y="240" data-lang="fr">conteneur jetable</text>
  <text class="sub" x="22"  y="240" data-lang="en">disposable container</text>
  <text class="sub" x="22"  y="254" data-lang="fr">tu peux le recréer</text>
  <text class="sub" x="22"  y="254" data-lang="en">you can recreate it</text>

  <text class="sub" x="640" y="320" data-lang="fr">TA donnée précieuse</text>
  <text class="sub" x="640" y="320" data-lang="en">your real data</text>
  <text class="sub" x="640" y="334" data-lang="fr">backup obligatoire</text>
  <text class="sub" x="640" y="334" data-lang="en">backup is mandatory</text>
</svg>
`
};

/* -------------------- Render body -------------------- */
function renderBody(sections, fm, manifest) {
  // ordre canonique des sections de page (alignement BUILD-SPEC §3.1 / template)
  const order = [
    'intro', 'objectives', 'prerequisites', 'concepts',
    'walkthrough', 'pitfalls', 'success', 'next',
    'cheatsheet', 'resources', 'troubleshooting'
  ];
  const labels = {
    intro:        { fr: 'Pourquoi ce guide existe',       en: 'Why this guide exists' },
    objectives:   { fr: 'Ce que tu vas apprendre',       en: "What you'll learn" },
    prerequisites:{ fr: 'Prérequis honnêtes',            en: 'Honest prerequisites' },
    concepts:     { fr: 'Vue d\'ensemble',                en: 'Overview' },
    walkthrough:  { fr: 'Pas-à-pas',                      en: 'Walkthrough' },
    pitfalls:     { fr: 'Pièges connus',                  en: 'Known pitfalls' },
    success:      { fr: 'Tu sais que c\'est bon quand…',  en: "You know it works when…" },
    next:         { fr: 'Et après ?',                     en: 'What\'s next?' },
    cheatsheet:   { fr: 'Cheatsheet',                     en: 'Cheatsheet' },
    resources:    { fr: 'Pour aller plus loin',           en: 'Going further' },
    troubleshooting: { fr: 'Troubleshooting',             en: 'Troubleshooting' },
  };
  const sectionsById = Object.fromEntries(sections.map(s => [s.id, s]));

  let html = '';
  let sectionNum = 0;

  for (const id of order) {
    const sec = sectionsById[id];
    if (!sec) continue;
    sectionNum++;
    const numStr = String(sectionNum).padStart(2, '0');
    html += `\n<section id="${id}">\n`;
    html += `  <span class="section-tag" data-lang="fr">§ ${numStr} — ${labels[id].fr}</span>\n`;
    html += `  <span class="section-tag" data-lang="en">§ ${numStr} — ${labels[id].en}</span>\n`;
    html += `  <h2 data-lang="fr">${labels[id].fr}</h2>\n`;
    html += `  <h2 data-lang="en">${labels[id].en}</h2>\n`;

    if (id === 'walkthrough') {
      html += renderWalkthrough(sec.blocks);
    } else if (id === 'prerequisites') {
      html += renderBlocks(sec.blocks);
      html += renderPrerequisitesLinks(fm, manifest);
    } else if (id === 'next') {
      html += renderBlocks(sec.blocks);
      html += renderNextLinks(fm, manifest);
    } else {
      html += renderBlocks(sec.blocks);
    }
    html += `</section>\n`;
  }
  return html;
}

function renderBlocks(blocks) {
  let html = '';
  for (const b of blocks) {
    if (b.kind === 'lang') {
      html += `<div data-lang="${b.lang}">${renderMarkdown(b.content)}</div>\n`;
    } else if (b.kind === 'code') {
      // strip ``` lang ... ```
      const m = b.raw.match(/^```(\w+)?\s*\n([\s\S]*?)\n```\s*$/);
      if (m) html += renderCodeBlock(m[2], (m[1] || '').toLowerCase());
    } else if (b.kind === 'figure') {
      html += renderFigure(b);
    } else if (b.kind === 'raw') {
      const txt = b.raw.trim();
      if (txt) html += renderMarkdown(txt);
    }
  }
  return html;
}

function renderFigure(b) {
  const svg = SCHEMAS[b.name] || `<p>[schema "${escapeHtml(b.name)}" manquant]</p>`;
  const cap = (text) => {
    if (!text) return '';
    // sépare la première phrase pour la mettre en gras
    const m = text.match(/^([^.]+\.)\s*(.*)$/s);
    const lead = m ? m[1] : text;
    const rest = m ? m[2] : '';
    return `<strong>${renderInline(lead)}</strong>${rest ? ' ' + renderInline(rest) : ''}`;
  };
  return `
<figure class="schema" id="figure-${b.name}">
  ${svg}
  <figcaption data-lang="fr">${cap(b.meta.caption_fr)}</figcaption>
  <figcaption data-lang="en">${cap(b.meta.caption_en)}</figcaption>
</figure>
`;
}

function renderWalkthrough(blocks) {
  let html = '';
  let curStep = null;
  let buf = [];

  const flush = () => {
    if (!curStep) return;
    const num = curStep.replace('step-', '');
    html += `
<div class="step" id="${curStep}">
  <span class="step-num" data-lang="fr">Étape ${num}</span>
  <span class="step-num" data-lang="en">Step ${num}</span>
  ${renderBlocks(buf)}
</div>
`;
    buf = [];
  };

  for (const b of blocks) {
    if (b.kind === 'step-marker') {
      flush();
      curStep = b.id;
    } else if (curStep) {
      buf.push(b);
    }
  }
  flush();
  return html;
}

function renderPrerequisitesLinks(fm, manifest) {
  if (!Array.isArray(fm.prerequisites) || fm.prerequisites.length === 0) return '';
  return `
<h3 data-lang="fr">Guides prérequis</h3>
<h3 data-lang="en">Required prerequisite guides</h3>
${renderGuideList(fm.prerequisites, manifest)}
`;
}

function renderNextLinks(fm, manifest) {
  if (!Array.isArray(fm.next) || fm.next.length === 0) return '';
  return `
<h3 data-lang="fr">Suite logique du parcours</h3>
<h3 data-lang="en">Logical next steps in the path</h3>
${renderGuideList(fm.next, manifest)}
`;
}

function renderGuideList(ids, manifest) {
  const items = ids.map(id => manifest.guides.find(g => g.id === id)).filter(Boolean);
  return `<ul class="guides-list">` + items.map(g => {
    const cls = g.status === 'published' ? 'guide-link' : 'guide-link coming-soon';
    const href = g.status === 'published' ? `../${g.slug}/` : '#';
    const badgeFr = g.status === 'published' ? '' : '<span class="badge">bientôt</span>';
    const badgeEn = g.status === 'published' ? '' : '<span class="badge">soon</span>';
    const num = String(g.order).padStart(2, '0');
    return `
<li>
  <a class="${cls}" href="${href}">
    <span class="num">${num}</span>
    <span class="title-line" data-lang="fr">${escapeHtml(g.title_fr)}</span>
    <span class="title-line" data-lang="en">${escapeHtml(g.title_en)}</span>
    <span data-lang="fr">${badgeFr}</span>
    <span data-lang="en">${badgeEn}</span>
  </a>
</li>`;
  }).join('') + `</ul>`;
}

/* -------------------- TOC -------------------- */
function renderTOC(sections) {
  const labels = {
    intro:        { fr: 'Introduction',           en: 'Introduction' },
    objectives:   { fr: 'Objectifs',              en: 'Objectives' },
    prerequisites:{ fr: 'Prérequis',              en: 'Prerequisites' },
    concepts:     { fr: 'Vue d\'ensemble',        en: 'Overview' },
    walkthrough:  { fr: 'Pas-à-pas',              en: 'Walkthrough' },
    pitfalls:     { fr: 'Pièges',                 en: 'Pitfalls' },
    success:      { fr: 'Succès',                 en: 'Success' },
    next:         { fr: 'Et après ?',             en: 'What\'s next' },
    cheatsheet:   { fr: 'Cheatsheet',             en: 'Cheatsheet' },
    resources:    { fr: 'Ressources',             en: 'Resources' },
    troubleshooting:{ fr: 'Troubleshooting',      en: 'Troubleshooting' },
  };
  const present = sections.filter(s => labels[s.id]);
  let html = `<nav class="toc" aria-label="Sommaire / Contents">
  <h3 data-lang="fr">Sommaire</h3>
  <h3 data-lang="en">Contents</h3>
  <ol>`;
  for (const s of present) {
    html += `
    <li>
      <a href="#${s.id}" data-lang="fr">${labels[s.id].fr}</a>
      <a href="#${s.id}" data-lang="en">${labels[s.id].en}</a>
    </li>`;
  }
  html += `\n  </ol>\n</nav>`;
  return html;
}

/* -------------------- Page render -------------------- */
function renderPage({ fm, body, manifest, config, logoSvg }) {
  const sections = body;
  const slug = fm.slug;
  const platformUrl = config.platform_url;
  const titleFr = `${fm.title_fr} — ${config.brand}`;
  const titleEn = `${fm.title_en} — ${config.brand}`;

  // Pretty hero meta
  const heroMeta = `
<div class="hero-meta" data-lang="fr">
  <div><span>Durée</span><strong>~ ${fm.duration_min} min</strong></div>
  <div><span>Niveau</span><strong>${fmLevelFr(fm.level)}</strong></div>
  <div><span>Étapes</span><strong>8 étapes</strong></div>
  <div><span>Version validée</span><strong>${escapeHtml(fm.validated_version)}</strong></div>
  <div><span>Dernière revue</span><strong>${escapeHtml(fm.last_review)}</strong></div>
</div>
<div class="hero-meta" data-lang="en">
  <div><span>Duration</span><strong>~ ${fm.duration_min} min</strong></div>
  <div><span>Level</span><strong>${fmLevelEn(fm.level)}</strong></div>
  <div><span>Steps</span><strong>8 steps</strong></div>
  <div><span>Validated version</span><strong>${escapeHtml(fm.validated_version)}</strong></div>
  <div><span>Last review</span><strong>${escapeHtml(fm.last_review)}</strong></div>
</div>`;

  const bodyHtml = renderBody(sections, fm, manifest);
  const tocHtml  = renderTOC(sections);

  return `<!DOCTYPE html>
<html lang="${config.default_lang}" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title data-lang="fr">${escapeHtml(titleFr)}</title>
  <title data-lang="en">${escapeHtml(titleEn)}</title>
  <meta name="description" content="${escapeHtml(fm.og_description_fr)}" data-lang="fr">
  <meta name="description" content="${escapeHtml(fm.og_description_en)}" data-lang="en">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(fm.title_fr)}">
  <meta property="og:description" content="${escapeHtml(fm.og_description_fr)}">
  <meta property="og:image" content="${escapeHtml(config.site_url + config.og_image)}">
  <meta property="og:url" content="${escapeHtml(config.site_url + '/guides/' + slug + '/')}">
  <link rel="canonical" href="${escapeHtml(config.site_url + '/guides/' + slug + '/')}">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="../../assets/styles/main.css">
  <link rel="stylesheet" href="../../assets/styles/print.css" media="print">
</head>
<body data-guide-slug="${escapeHtml(slug)}">

<!-- ============================================ TOPBAR ============================================ -->
<header class="topbar" role="banner">
  <div class="topbar-inner">
    <a class="brand" href="../../">
      ${logoSvg}
    </a>
    <span class="spacer"></span>
    <div class="btn-group" role="group" aria-label="Language">
      <button class="btn-pill" type="button" data-set-lang="fr">FR</button>
      <button class="btn-pill" type="button" data-set-lang="en">EN</button>
    </div>
    <button class="btn-pill" type="button" data-toggle-theme>☾ Dark</button>
    <button class="btn-pill" type="button" data-print-pdf>
      <span data-lang="fr">PDF</span>
      <span data-lang="en">PDF</span>
    </button>
  </div>
</header>

<!-- ============================================ CTA BANDEAU HAUT (discret) ============================================ -->
<div class="cta-banner">
  <span data-lang="fr">Ce guide fait partie de la formation ${escapeHtml(config.brand)} · </span>
  <span data-lang="en">This guide is part of the ${escapeHtml(config.brand)} learning path · </span>
  <a href="${escapeHtml(platformUrl)}" data-lang="fr">découvrir le parcours →</a>
  <a href="${escapeHtml(platformUrl)}" data-lang="en">discover the path →</a>
</div>

<!-- ============================================ HERO ============================================ -->
<header class="hero">
  <div class="hero-inner">
    <div class="prompt" data-lang="fr">~/guides/${escapeHtml(slug)}</div>
    <div class="prompt" data-lang="en">~/guides/${escapeHtml(slug)}</div>
    <h1 data-lang="fr">${escapeHtml(fm.title_fr)}</h1>
    <h1 data-lang="en">${escapeHtml(fm.title_en)}</h1>
    <p class="tagline" data-lang="fr">${escapeHtml(fm.tagline_fr)}</p>
    <p class="tagline" data-lang="en">${escapeHtml(fm.tagline_en)}</p>
    ${heroMeta}
  </div>
</header>

<!-- ============================================ LAYOUT ============================================ -->
<div class="layout">
  ${tocHtml}
  <main>
${bodyHtml}

<!-- ============================================ CTA fort en fin de guide ============================================ -->
<aside class="cta-strong" role="complementary">
  <h3 data-lang="fr">Ce guide t'a aidé ?</h3>
  <h3 data-lang="en">Did this guide help?</h3>
  <p data-lang="fr">Il fait partie d'un parcours complet pour t'apprendre le DevOps et le self-hosting en faisant, pas en cliquant. Inscris-toi sur ${escapeHtml(config.brand)} pour suivre ta progression, débloquer les guides avancés, et rejoindre la communauté.</p>
  <p data-lang="en">It's part of a complete path to teach you DevOps and self-hosting by doing — not by clicking. Sign up at ${escapeHtml(config.brand)} to track your progress, unlock advanced guides, and join the community.</p>
  <a class="btn" href="${escapeHtml(platformUrl)}" data-lang="fr">Rejoindre la formation</a>
  <a class="btn" href="${escapeHtml(platformUrl)}" data-lang="en">Join the path</a>
</aside>

<!-- ============================================ BLOC PDF ============================================ -->
<section class="pdf-block" id="pdf">
  <div class="icon">⬇</div>
  <div class="text">
    <h3 data-lang="fr">Télécharger ce guide en PDF</h3>
    <h3 data-lang="en">Download this guide as PDF</h3>
    <p data-lang="fr">Le PDF reprend exactement ce que tu vois ici, dans ta langue active. Idéal pour lire offline, imprimer, ou partager.</p>
    <p data-lang="en">The PDF mirrors exactly what you see here, in your active language. Great for offline reading, printing, or sharing.</p>
  </div>
  <button class="btn" type="button" data-print-pdf>
    <span data-lang="fr">Télécharger</span>
    <span data-lang="en">Download</span>
  </button>
</section>

  </main>
</div>

<!-- ============================================ FOOTER ============================================ -->
<footer class="page-footer" role="contentinfo">
  <div class="footer-logo">${logoSvg}</div>
  <p data-lang="fr">${escapeHtml(config.brand)} · Skill tree DevOps & self-hosting · ${escapeHtml(config.edition)}</p>
  <p data-lang="en">${escapeHtml(config.brand)} · DevOps & self-hosting skill tree · ${escapeHtml(config.edition)}</p>
  <p>
    <a href="${escapeHtml(platformUrl)}" data-lang="fr">Plateforme</a>
    <a href="${escapeHtml(platformUrl)}" data-lang="en">Platform</a>
    · <a href="${escapeHtml(config.site_url)}/guides.json">guides.json</a>
    · <span data-lang="fr">Distribué sous licence MIT</span>
    <span data-lang="en">Distributed under the MIT license</span>
  </p>
</footer>

<script src="../../assets/js/ui.js" defer></script>
</body>
</html>
`;
}

function fmLevelFr(l) { return ({ beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé' }[l] || l); }
function fmLevelEn(l) { return ({ beginner: 'Beginner',  intermediate: 'Intermediate', advanced: 'Advanced' }[l] || l); }

/* -------------------- Lint (CHECKLIST.md A. + E.) -------------------- */
function lintGuide(fm, sections, manifest) {
  const issues = [];

  // A. ID kebab-case, sans version, sans accent
  if (!/^[a-z0-9][a-z0-9-]*$/.test(fm.id || ''))
    issues.push(`[A] id invalide: "${fm.id}" (attendu kebab-case sans accent)`);

  // A. prerequisites cohérents
  for (const p of fm.prerequisites || []) {
    const ref = manifest.guides.find(g => g.id === p);
    if (!ref) issues.push(`[A] prerequisite inconnu dans le manifeste: ${p}`);
    else if (ref.order >= fm.order)
      issues.push(`[A] prerequisite "${p}" (order ${ref.order}) >= ce guide (order ${fm.order})`);
  }
  // A. next cohérents
  for (const n of fm.next || []) {
    if (!manifest.guides.find(g => g.id === n))
      issues.push(`[A] next inconnu: ${n}`);
  }

  // E. champs bilingues présents
  const bilingual = ['title', 'tagline', 'og_description'];
  for (const k of bilingual)
    if (!fm[`${k}_fr`] || !fm[`${k}_en`])
      issues.push(`[E] champ bilingue manquant: ${k}_fr / ${k}_en`);

  // E. chaque section a ses deux langues
  for (const s of sections) {
    const langs = new Set(s.blocks.filter(b => b.kind === 'lang').map(b => b.lang));
    if (langs.size > 0 && (!langs.has('fr') || !langs.has('en')))
      issues.push(`[E] section "${s.id}" non bilingue (${Array.from(langs).join(',')})`);
  }

  // C. schéma présent dans concepts
  const concepts = sections.find(s => s.id === 'concepts');
  if (!concepts || !concepts.blocks.some(b => b.kind === 'figure'))
    issues.push(`[C] aucun schéma dans la section "concepts" (obligatoire BUILD-SPEC §2.5)`);

  return issues;
}

/* -------------------- Homepage (parcours) -------------------- */
function renderHomepage({ manifest, config, logoSvg }) {
  const guides = [...manifest.guides].sort((a, b) => a.order - b.order);
  const publishedCount = guides.filter(g => g.status === 'published').length;
  const total = guides.length;

  const levelClass = l => l;
  const levelFr = fmLevelFr;
  const levelEn = fmLevelEn;

  const guidesHtml = guides.map(g => {
    const cls = g.status === 'published' ? 'home-card' : 'home-card coming-soon';
    const href = g.status === 'published' ? `./guides/${g.slug}/` : '#';
    const num = String(g.order).padStart(2, '0');
    const badge = g.status === 'published'
      ? `<span class="card-badge ok" data-lang="fr">publié</span><span class="card-badge ok" data-lang="en">published</span>`
      : `<span class="card-badge" data-lang="fr">bientôt</span><span class="card-badge" data-lang="en">soon</span>`;
    return `
<a class="${cls}" href="${href}">
  <div class="card-head">
    <span class="card-num">${num}</span>
    ${badge}
  </div>
  <h3 data-lang="fr">${escapeHtml(g.title_fr)}</h3>
  <h3 data-lang="en">${escapeHtml(g.title_en)}</h3>
  <p data-lang="fr">${escapeHtml(g.tagline_fr || '')}</p>
  <p data-lang="en">${escapeHtml(g.tagline_en || '')}</p>
  <div class="card-meta">
    <span data-lang="fr">${levelFr(g.level)} · ${g.duration_min} min</span>
    <span data-lang="en">${levelEn(g.level)} · ${g.duration_min} min</span>
  </div>
</a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="${config.default_lang}" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title data-lang="fr">${escapeHtml(config.brand)} — Skill tree DevOps &amp; self-hosting</title>
  <title data-lang="en">${escapeHtml(config.brand)} — DevOps &amp; self-hosting skill tree</title>
  <meta name="description" content="Apprendre le DevOps et le self-hosting en faisant — pas en cliquant sur un bouton magique." data-lang="fr">
  <meta name="description" content="Learn DevOps and self-hosting by doing — not by clicking a magic button." data-lang="en">

  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(config.brand)} — Skill tree DevOps &amp; self-hosting">
  <meta property="og:image" content="${escapeHtml(config.site_url + config.og_image)}">
  <meta property="og:url" content="${escapeHtml(config.site_url + '/')}">
  <link rel="canonical" href="${escapeHtml(config.site_url + '/')}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="./assets/styles/main.css">
  <style>
    /* Homepage-specific layout */
    .home-hero { padding: 5rem var(--gutter) 3rem; border-bottom: 1px solid var(--line); position: relative; }
    .home-hero-inner { max-width: var(--maxw); margin: 0 auto; text-align: center; }
    .home-hero h1 { font-family: var(--font-title); font-size: clamp(2.4rem, 6vw, 4rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; margin-bottom: 1.25rem; }
    .home-hero h1 em { color: var(--accent); font-style: italic; font-weight: 600; }
    .home-hero .lede { font-size: clamp(1.05rem, 1.7vw, 1.25rem); color: var(--fg-soft); max-width: 36rem; margin: 0 auto 1.75rem; }
    .home-hero .stats { display: inline-flex; gap: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--line); font-family: var(--font-mono); font-size: 0.78rem; color: var(--fg-soft); }
    .home-hero .stats strong { color: var(--accent); font-size: 1.5rem; font-weight: 700; display: block; }

    .home-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; max-width: var(--maxw); margin: 0 auto; padding: 3rem var(--gutter); }
    .home-card { background: var(--bg-elev); border: 1px solid var(--line); border-left: 3px solid var(--line-strong); border-radius: var(--radius); padding: 1.4rem; text-decoration: none; color: var(--fg); transition: border-color 0.15s, transform 0.15s; display: block; }
    .home-card:hover { border-color: var(--accent); border-left-color: var(--accent); transform: translateY(-2px); }
    .home-card.coming-soon { opacity: 0.55; pointer-events: none; }
    .home-card.coming-soon:hover { transform: none; }
    .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem; }
    .card-num { font-family: var(--font-mono); font-size: 1.6rem; font-weight: 800; color: var(--accent); }
    .card-badge { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; padding: 0.18rem 0.5rem; border: 1px solid var(--line-strong); border-radius: 2px; color: var(--fg-mute); }
    .card-badge.ok { color: var(--accent); border-color: var(--accent); }
    .home-card h3 { font-family: var(--font-title); font-size: 1.1rem; line-height: 1.2; margin-bottom: 0.5rem; }
    .home-card p { color: var(--fg-soft); font-size: 0.92rem; margin-bottom: 0.8rem; }
    .card-meta { font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-mute); }
    .promise { max-width: var(--maxw); margin: 0 auto; padding: 3rem var(--gutter); border-top: 1px solid var(--line); }
    .promise h2 { font-family: var(--font-title); font-size: 1.6rem; margin-bottom: 1rem; }
    .promise p { color: var(--fg-soft); max-width: 40rem; }
  </style>
</head>
<body>

<header class="topbar" role="banner">
  <div class="topbar-inner">
    <a class="brand" href="./">${logoSvg}</a>
    <span class="spacer"></span>
    <div class="btn-group" role="group" aria-label="Language">
      <button class="btn-pill" type="button" data-set-lang="fr">FR</button>
      <button class="btn-pill" type="button" data-set-lang="en">EN</button>
    </div>
    <button class="btn-pill" type="button" data-toggle-theme>☾ Dark</button>
  </div>
</header>

<header class="home-hero">
  <div class="home-hero-inner">
    <h1 data-lang="fr">Apprends le DevOps <em>en faisant.</em></h1>
    <h1 data-lang="en">Learn DevOps <em>by doing.</em></h1>
    <p class="lede" data-lang="fr">Un skill tree de guides hands-on pour passer du terminal au self-hosting maîtrisé. Pas d'automatisation magique : tu déploies, tu casses, tu comprends.</p>
    <p class="lede" data-lang="en">A skill tree of hands-on guides to go from the terminal to fluent self-hosting. No magic automation: you deploy, you break things, you understand.</p>
    <div class="stats">
      <div><strong>${total}</strong><span data-lang="fr">guides au parcours</span><span data-lang="en">guides in the path</span></div>
      <div><strong>${publishedCount}</strong><span data-lang="fr">publié(s)</span><span data-lang="en">published</span></div>
      <div><strong>FR/EN</strong><span data-lang="fr">bilingue</span><span data-lang="en">bilingual</span></div>
    </div>
  </div>
</header>

<section class="home-grid" aria-label="Liste des guides du parcours">
${guidesHtml}
</section>

<section class="promise">
  <h2 data-lang="fr">La promesse</h2>
  <h2 data-lang="en">The promise</h2>
  <p data-lang="fr">Chaque guide explique le <strong>pourquoi</strong> avant le <strong>comment</strong>. Chaque commande est justifiée. Chaque étape est vérifiable. Et tu repars avec une stack qui tourne sur ta machine, pas avec des slides.</p>
  <p data-lang="en">Each guide explains the <strong>why</strong> before the <strong>how</strong>. Every command is justified. Every step is verifiable. You leave with a stack that runs on your machine — not slides.</p>
</section>

<footer class="page-footer" role="contentinfo">
  <div class="footer-logo">${logoSvg}</div>
  <p data-lang="fr">${escapeHtml(config.brand)} · Skill tree DevOps &amp; self-hosting · ${escapeHtml(config.edition)}</p>
  <p data-lang="en">${escapeHtml(config.brand)} · DevOps &amp; self-hosting skill tree · ${escapeHtml(config.edition)}</p>
  <p>
    <a href="${escapeHtml(config.platform_url)}" data-lang="fr">Plateforme</a>
    <a href="${escapeHtml(config.platform_url)}" data-lang="en">Platform</a>
    · <a href="./guides.json">guides.json</a>
    · <span data-lang="fr">Distribué sous licence MIT</span>
    <span data-lang="en">Distributed under the MIT license</span>
  </p>
</footer>

<script src="./assets/js/ui.js" defer></script>
</body>
</html>
`;
}

/* -------------------- Main -------------------- */
function main() {
  const guideId = process.argv[2] || 'vaultwarden';

  const guidePath = join(ROOT, 'content', `${guideId}.md`);
  const manifestPath = join(ROOT, 'guides.json');
  const configPath = join(ROOT, 'config.json');
  const logoPath = join(ROOT, 'assets/logo/LOGO_JIHA_TECHSVG.svg');

  log('lecture des sources…');
  const src = readFileSync(guidePath, 'utf-8');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const logoSvg = readFileSync(logoPath, 'utf-8').replace(/<\?xml[^?]*\?>/, '').replace(/<!--.*?-->/gs, '').trim();

  const { fm, body } = splitGuide(src);
  log(`front-matter: ${fm.id} v${fm.validated_version} (${fm.status})`);

  const sections = parseBody(body);
  log(`sections détectées: ${sections.map(s => s.id).join(', ')}`);

  // Lint
  const issues = lintGuide(fm, sections, manifest);
  if (issues.length) {
    console.warn('\n[lint] avertissements:');
    for (const i of issues) console.warn('   - ' + i);
  } else log('lint OK');

  const html = renderPage({ fm, body: sections, manifest, config, logoSvg });

  const outDir = join(ROOT, 'guides', fm.slug);
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, 'index.html');
  writeFileSync(outFile, html, 'utf-8');
  log(`écrit: ${outFile}  (${Math.round(html.length / 1024)} KB)`);

  // Homepage (parcours) — toujours regénérée
  const homeHtml = renderHomepage({ manifest, config, logoSvg });
  const homeFile = join(ROOT, 'index.html');
  writeFileSync(homeFile, homeHtml, 'utf-8');
  log(`écrit: ${homeFile}  (${Math.round(homeHtml.length / 1024)} KB)`);
}

main();
