#!/usr/bin/env node
// Garde-fou : aucun guide ne doit préparer à un examen retiré.
// Lit retired-exams.json et cherche chaque code dans content/*.md et guides.json.
// Mention historique autorisée : « ex-AZ-500 ».
// Usage : node scripts/check-exams.mjs   (code de sortie 1 si une mention est trouvée)

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { exams } = JSON.parse(readFileSync(join(ROOT, 'retired-exams.json'), 'utf8'));
const gh = process.env.GITHUB_ACTIONS === 'true';

const files = [
  'guides.json',
  ...readdirSync(join(ROOT, 'content'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `content/${f}`),
];

let hits = 0;
for (const file of files) {
  const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const exam of exams) {
      const re = new RegExp(`(?<!ex-)\\b${exam.code}\\b`, 'g');
      if (!re.test(line)) continue;
      hits++;
      const fix = exam.replacement ? `remplacé par ${exam.replacement}` : 'sans remplaçant direct';
      const msg = `${exam.code} retiré le ${exam.retired} (${fix})`;
      console.error(gh ? `::error file=${file},line=${i + 1}::${msg}` : `✗ ${file}:${i + 1} ${msg}`);
    }
  });
}

if (hits) {
  console.error(`\n${hits} mention(s) d'examen retiré. Mettre à jour le contenu, ou écrire « ex-CODE » pour une mention historique.`);
  process.exit(1);
}
console.log(`✓ aucun examen retiré cité (${exams.length} codes surveillés, ${files.length} fichiers)`);
