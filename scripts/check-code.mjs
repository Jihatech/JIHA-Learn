#!/usr/bin/env node
// Garde-fou sur les blocs de code des guides (erreurs réelles trouvées en rejouant
// la filière Docker sur une machine vierge, octobre 2026) :
//   1. Délimiteurs ``` équilibrés : un bloc sans ouverture rend « # commentaire »
//      en titre et avale la fin de la page (docker-images-dockerfile, step-06).
//   2. Pas de commentaire en fin d'instruction Dockerfile : seul RUN (exécuté par
//      un shell) tolère « # ». COPY/ENV/ARG... cassent le build ou créent des
//      variables parasites (docker-images-dockerfile, steps 01/03/04).
//   3. Pas d'image sans tag dans docker run/pull/create ni dans image: (alpine nu
//      = alpine:latest ; règle « versions pinées » de la CHECKLIST, section B).
// Usage : node scripts/check-code.mjs [id ...]   (code 1 si une erreur est trouvée)

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const gh = process.env.GITHUB_ACTIONS === 'true';
const only = process.argv.slice(2);
const files = readdirSync(join(ROOT, 'content'))
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !only.length || only.includes(f.replace(/\.md$/, '')));

const DOCKERFILE_INSTR = /^(FROM|COPY|ADD|ENV|ARG|EXPOSE|WORKDIR|USER|LABEL|VOLUME|ENTRYPOINT|CMD|HEALTHCHECK|STOPSIGNAL|SHELL|ONBUILD)\s.*\S\s+#/;
const BARE_IMAGES = 'alpine|ubuntu|debian|busybox|nginx|httpd|postgres|mariadb|mysql|redis|python|node|golang|traefik|registry';
const BARE_RUN = new RegExp(`\\bdocker (?:run|pull|create)\\b.*?\\s(${BARE_IMAGES})(?=\\s|$)`);
const BARE_IMAGE_KEY = new RegExp(`^\\s*image:\\s*(${BARE_IMAGES})\\s*(#.*)?$`);

let errors = 0;
const report = (file, line, msg) => {
  errors++;
  console.error(gh ? `::error file=content/${file},line=${line}::${msg}` : `✗ content/${file}:${line} ${msg}`);
};

for (const file of files) {
  const lines = readFileSync(join(ROOT, 'content', file), 'utf8').split('\n');
  let inCode = false;
  let inDockerfile = false;
  let openedAt = 0;
  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = raw.replace(/\r$/, '');
    if (/^```/.test(line)) {
      if (!inCode) {
        inCode = true;
        openedAt = n;
        inDockerfile = /^```dockerfile/i.test(line);
      } else {
        inCode = false;
        inDockerfile = false;
      }
      return;
    }
    if (!inCode) return;
    if (/<<-?\s*'?EOF'?/.test(line) && /Dockerfile/i.test(line)) inDockerfile = true;
    if (/^EOF\s*$/.test(line)) inDockerfile = false;
    if (inDockerfile && DOCKERFILE_INSTR.test(line)) {
      report(file, n, 'commentaire en fin d\'instruction Dockerfile (seul RUN le tolère) : le mettre sur sa propre ligne');
    }
    // Ignore le commentaire de fin de ligne et les valeurs d'options qui ne sont
    // pas des images (--name registry, --network proxy...).
    const cmd = line
      .replace(/\s#.*$/, '')
      .replace(/--(name|network|hostname|net|volume|mount|env|label)[ =]\S+/g, '')
      .replace(/\s-[evlwu]\s+\S+/g, ' ');
    const bare = cmd.match(BARE_RUN) || line.match(BARE_IMAGE_KEY);
    if (bare) report(file, n, `image « ${bare[1]} » sans tag (= :latest) : épingler une version`);
  });
  if (inCode) report(file, openedAt, 'bloc de code ouvert jamais refermé (``` manquant)');
}

if (errors) {
  console.error(`\n${errors} erreur(s) dans les blocs de code.`);
  process.exit(1);
}
console.log(`✓ blocs de code OK (${files.length} guides)`);
