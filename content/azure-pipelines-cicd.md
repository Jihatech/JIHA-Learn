---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-pipelines-cicd
slug: azure-pipelines-cicd
order: 71
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — pipelines CI/CD en profondeur (AZ-400) : jobs, matrice, artefacts"
title_en: "Azure — CI/CD pipelines in depth (AZ-400): jobs, matrix, artifacts"
tagline_fr: "build reproductible, tests réels, graphe de jobs, artefacts."
tagline_en: "reproducible build, real tests, job graph, artifacts."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 260
repo: "actions/runner"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-devops-fondamentaux]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [ci-cd, pipeline, jobs, stages, matrice, cache, artefacts, npm-ci, tests, azure-pipelines, az-400]
concepts_en: [ci-cd, pipeline, jobs, stages, matrix, cache, artifacts, npm-ci, tests, azure-pipelines, az-400]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Approfondir les pipelines CI/CD pour l'AZ-400, en local et pour de vrai : une vraie suite de tests exécutée (node --test, vert/rouge, codes de sortie), un build reproductible (npm ci + lockfile), le graphe de jobs (lint → test → paquet avec needs/dependsOn), la stratégie de matrice (tester sur plusieurs versions en parallèle), le cache et surtout les artefacts (produire un rapport de test TAP et un paquet, le transmettre entre étapes). Pipelines GitHub Actions ET Azure Pipelines multi-stages validées localement. Puis le passage CI → CD (environnements & approbations). Sans compte cloud.",
og_description_en: "Going deeper on CI/CD pipelines for AZ-400, locally and for real: a real test suite executed (node --test, green/red, exit codes), a reproducible build (npm ci + lockfile), the job graph (lint → test → package with needs/dependsOn), the matrix strategy (test across versions in parallel), caching and above all artifacts (produce a TAP test report and a package, pass it between stages). GitHub Actions AND Azure Pipelines multi-stage pipelines validated locally. Then the CI → CD step (environments & approvals). No cloud account."
---

## intro

:::lang fr
Tu sais écrire une **première pipeline** (guide précédent). On **approfondit** maintenant ce qui fait une vraie chaîne CI/CD : un **build reproductible**, des **tests qui s'exécutent pour de vrai**, un **graphe de jobs** avec dépendances, une **matrice** pour couvrir plusieurs versions, du **cache**, et surtout des **artefacts** — les fichiers qu'une étape produit et qu'une autre consomme. C'est le cœur de l'examen **AZ-400** côté pipelines.

Fidèle à la méthode : tout est **local et gratuit**. On prend un petit **module métier** (un panier), on lui écrit de **vrais tests** qu'on **exécute** (`node --test` — vert, puis rouge quand on casse le code), on rend le build **reproductible** (`npm ci` + fichier de verrou), puis on décrit la pipeline en YAML — **GitHub Actions** et **Azure Pipelines** multi-stages — qu'on **valide localement**. On produit un **rapport de test** et un **paquet** comme **artefacts**. Enfin, on relie **CI → CD** : les **environnements** et les **approbations**, la porte avant le déploiement.

**Pour qui c'est :** tu as fait le guide *DevOps fondamentaux* et tu veux des pipelines **robustes**, pas des jouets.

**Quand ce n'est PAS le bon choix :**

- Tu n'as jamais écrit de pipeline → fais d'abord *Azure — DevOps fondamentaux (AZ-400)*.
- Tu veux déployer de l'infra depuis la pipeline → c'est le **guide suivant** (IaC dans les pipelines).
:::

:::lang en
You can write a **first pipeline** (previous guide). Now we go **deeper** into what makes a real CI/CD chain: a **reproducible build**, tests that **actually run**, a **job graph** with dependencies, a **matrix** to cover several versions, **caching**, and above all **artifacts** — the files one stage produces and another consumes. This is the heart of the **AZ-400** exam on the pipelines side.

True to the method: everything is **local and free**. We take a small **business module** (a shopping cart), write it **real tests** we **execute** (`node --test` — green, then red when we break the code), make the build **reproducible** (`npm ci` + lockfile), then describe the pipeline in YAML — **GitHub Actions** and multi-stage **Azure Pipelines** — validated **locally**. We produce a **test report** and a **package** as **artifacts**. Finally, we connect **CI → CD**: **environments** and **approvals**, the gate before deployment.

**Who it's for:** you did the *DevOps fundamentals* guide and want **robust** pipelines, not toys.

**When it's NOT the right choice:**

- You've never written a pipeline → do *Azure — DevOps fundamentals (AZ-400)* first.
- You want to deploy infra from the pipeline → that's the **next guide** (IaC in pipelines).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Écrire et **exécuter** une vraie suite de tests (`node --test`) et lire ses **codes de sortie**.
- Rendre un build **reproductible** (`npm ci` + fichier de verrou).
- Structurer une pipeline en **jobs/stages** avec **dépendances** (`needs` / `dependsOn`).
- Utiliser une **matrice** pour tester plusieurs versions **en parallèle**.
- Comprendre le **cache** et produire/consommer des **artefacts**.
- Écrire une pipeline **multi-stages** en GitHub Actions **et** Azure Pipelines.
- Relier **CI → CD** avec **environnements** et **approbations**.
:::

:::lang en
By the end of this guide, you can:

- Write and **run** a real test suite (`node --test`) and read its **exit codes**.
- Make a build **reproducible** (`npm ci` + lockfile).
- Structure a pipeline in **jobs/stages** with **dependencies** (`needs` / `dependsOn`).
- Use a **matrix** to test several versions **in parallel**.
- Understand **caching** and produce/consume **artifacts**.
- Write a **multi-stage** pipeline in GitHub Actions **and** Azure Pipelines.
- Connect **CI → CD** with **environments** and **approvals**.
:::

## prerequisites

:::lang fr
- Le guide **Azure — DevOps fondamentaux (AZ-400)** (Git, YAML, première pipeline).
- **Node.js** installé (`node -v` ≥ 18) — le lanceur de tests `node --test` est intégré, **aucune dépendance**.
- **Git** et un **terminal** ; **Python 3** pour valider le YAML (optionnel).
- **Aucun compte cloud requis** : tout s'exécute et se valide en local.
:::

:::lang en
- The **Azure — DevOps fundamentals (AZ-400)** guide (Git, YAML, first pipeline).
- **Node.js** installed (`node -v` ≥ 18) — the `node --test` runner is built in, **no dependencies**.
- **Git** and a **terminal**; **Python 3** to validate YAML (optional).
- **No cloud account required**: everything runs and validates locally.
:::

## concepts

:::lang fr
**CI en profondeur : le build reproductible.** Une pipeline CI n'a de valeur que si elle est **déterministe** : même commit → même résultat. D'où deux règles. (1) **Installer à l'identique** : `npm ci` lit le **fichier de verrou** (`package-lock.json`) et installe **exactement** les versions figées (contrairement à `npm install` qui peut les faire bouger). (2) **Tester vraiment** : les tests **s'exécutent** et renvoient un **code de sortie** — `0` = succès (pipeline **verte**), non-zéro = échec (pipeline **rouge**). Le code de sortie est le **signal** que lit le runner.

**Jobs, stages, dépendances.** Un **job** est une unité qui tourne sur un **runner** (machine éphémère) ; ses **étapes** s'exécutent en séquence. Plusieurs jobs tournent **en parallèle** par défaut — sauf si on déclare une **dépendance** : `needs:` (GitHub Actions) ou `dependsOn:` (Azure Pipelines). Cela dessine un **graphe** : `lint` → `test` → `paquet`. Azure Pipelines ajoute la notion de **stage** (regroupement de jobs, ex. *Valider* / *Tester* / *Déployer*), pratique pour séparer CI et CD.

**La matrice.** Tester sur **plusieurs configurations** sans dupliquer le job : une **matrice** (`strategy.matrix`) démultiplie un job en autant d'exécutions **parallèles** — par ex. Node **20** et **22**. Une seule définition, N variantes.

**Le cache.** Télécharger les dépendances à chaque exécution est lent. Le **cache** (`actions/setup-node` avec `cache: npm`, ou une clé de cache) réutilise les paquets d'une exécution à l'autre. Gain de **temps**, pas de changement de résultat.

**Les artefacts.** Ce qu'une étape **produit** et qu'une autre **consomme** : un binaire, un `.tgz`, un **rapport de test**. Sur GitHub Actions : `upload-artifact` / `download-artifact`. Sur Azure Pipelines : `PublishBuildArtifacts` / `DownloadBuildArtifacts`. C'est ainsi qu'un **stage de build** transmet son résultat à un **stage de déploiement** — sans reconstruire.

**CI vs CD, et la porte.** **CI** valide (build + tests). **CD** livre/déploie. Entre les deux, on met souvent une **porte** : un **environnement** (`staging`, `production`) protégé par une **approbation** (un humain valide) ou des **checks**. C'est le point de contrôle avant la prod — on l'écrit dans la pipeline, on ne le bricole pas à la main.

**Ce qui est live ici.** Les **tests s'exécutent pour de vrai** (`node --test`), le **build est reproductible** (`npm ci`), les **artefacts** sont de **vrais fichiers** produits localement (rapport TAP, paquet `.tgz`). Les **pipelines** (GitHub Actions, Azure Pipelines) s'écrivent en YAML et se **valident localement** ; leur **exécution** sur des runners demande un compte GitHub/Azure DevOps (gratuit). Les fondamentaux, eux, sont **100 % locaux**.
:::

:::lang en
**CI in depth: the reproducible build.** A CI pipeline is only worth it if it's **deterministic**: same commit → same result. Hence two rules. (1) **Install identically**: `npm ci` reads the **lockfile** (`package-lock.json`) and installs the **exact** pinned versions (unlike `npm install`, which may move them). (2) **Really test**: tests **run** and return an **exit code** — `0` = success (**green** pipeline), non-zero = failure (**red** pipeline). The exit code is the **signal** the runner reads.

**Jobs, stages, dependencies.** A **job** is a unit running on a **runner** (ephemeral machine); its **steps** run in sequence. Multiple jobs run **in parallel** by default — unless you declare a **dependency**: `needs:` (GitHub Actions) or `dependsOn:` (Azure Pipelines). That draws a **graph**: `lint` → `test` → `package`. Azure Pipelines adds the notion of a **stage** (a group of jobs, e.g. *Validate* / *Test* / *Deploy*), handy to separate CI and CD.

**The matrix.** Testing across **several configurations** without duplicating the job: a **matrix** (`strategy.matrix`) fans a job out into as many **parallel** runs — e.g. Node **20** and **22**. One definition, N variants.

**Caching.** Downloading dependencies on every run is slow. The **cache** (`actions/setup-node` with `cache: npm`, or a cache key) reuses packages from one run to the next. Saves **time**, doesn't change the result.

**Artifacts.** What one stage **produces** and another **consumes**: a binary, a `.tgz`, a **test report**. On GitHub Actions: `upload-artifact` / `download-artifact`. On Azure Pipelines: `PublishBuildArtifacts` / `DownloadBuildArtifacts`. That's how a **build stage** hands its result to a **deploy stage** — without rebuilding.

**CI vs CD, and the gate.** **CI** validates (build + tests). **CD** delivers/deploys. Between them we often place a **gate**: an **environment** (`staging`, `production`) protected by an **approval** (a human validates) or **checks**. It's the control point before prod — you write it into the pipeline, you don't hand-hack it.

**What's live here.** The **tests actually run** (`node --test`), the **build is reproducible** (`npm ci`), the **artifacts** are **real files** produced locally (TAP report, `.tgz` package). The **pipelines** (GitHub Actions, Azure Pipelines) are written in YAML and **validated locally**; **running** them on runners needs a GitHub/Azure DevOps account (free). The fundamentals themselves are **100% local**.
:::

:::figure azure-pipelines-cicd-graph
caption_fr: "Schéma 1. Une pipeline CI/CD en profondeur : le commit déclenche le STAGE CI (job lint → job test en MATRICE Node 20/22 → job paquet) qui produit des ARTEFACTS (rapport de test, paquet). Le STAGE CD consomme l'artefact et déploie, derrière une PORTE (environnement + approbation). needs/dependsOn dessinent le graphe ; le cache accélère sans changer le résultat."
caption_en: "Figure 1. A CI/CD pipeline in depth: the commit triggers the CI STAGE (lint job → test job in a Node 20/22 MATRIX → package job) which produces ARTIFACTS (test report, package). The CD STAGE consumes the artifact and deploys, behind a GATE (environment + approval). needs/dependsOn draw the graph; the cache speeds things up without changing the result."
:::

## walkthrough

:::lang fr
On avance ainsi : le module et ses vrais tests → CI en rouge (codes de sortie) → build reproductible (npm ci) → graphe de jobs (needs) → matrice → artefacts → CI vers CD (environnements, Azure Pipelines) puis on versionne.
:::

:::lang en
We'll go like this: the module and its real tests → CI going red (exit codes) → reproducible build (npm ci) → job graph (needs) → matrix → artifacts → CI to CD (environments, Azure Pipelines) then we version it.
:::

### step-01

:::lang fr
**Objectif.** Avoir un **module métier** et de **vrais tests** qui **s'exécutent**.

**🤔 Pas de CI sans tests.** Une pipeline qui ne teste rien est une décoration. On écrit un petit module (`panier`) et trois tests avec le lanceur **intégré** de Node (`node --test`) — **aucune dépendance** à installer.

Crée le projet, le module et les tests, puis lance-les :
:::

:::lang en
**Goal.** Have a **business module** and **real tests** that **run**.

**🤔 No CI without tests.** A pipeline that tests nothing is decoration. We write a small module (`panier`) and three tests with Node's **built-in** runner (`node --test`) — **no dependency** to install.

Create the project, the module and the tests, then run them:
:::

```bash
mkdir -p ci-projet/src ci-projet/test && cd ci-projet

cat > package.json <<'JSON'
{
  "name": "panier",
  "version": "1.0.0",
  "main": "src/panier.js",
  "scripts": {
    "lint": "node -e \"process.exit(0)\"",
    "test": "node --test"
  }
}
JSON

cat > src/panier.js <<'JS'
// Le total d'un panier, avec une remise optionnelle.
function total(articles, remise = 0) {
  const somme = articles.reduce((acc, a) => acc + a.prix * a.qte, 0);
  return Math.round(somme * (1 - remise) * 100) / 100;
}
module.exports = { total };
JS

cat > test/panier.test.js <<'JS'
const test = require("node:test");
const assert = require("node:assert");
const { total } = require("../src/panier.js");

test("total sans remise", () => {
  assert.strictEqual(total([{ prix: 10, qte: 2 }, { prix: 5, qte: 1 }]), 25);
});
test("total avec remise de 10%", () => {
  assert.strictEqual(total([{ prix: 100, qte: 1 }], 0.1), 90);
});
test("panier vide vaut 0", () => {
  assert.strictEqual(total([]), 0);
});
JS

node --test
echo "code de sortie / exit code: $?"
```

:::lang fr
**✅ Vérification :** la sortie se termine par `# pass 3` et `# fail 0`, et le **code de sortie est `0`**. Trois tests **réels** passent. C'est le signal que la CI attend. Ce `panier` est notre unité à protéger dans toute la suite.
:::

:::lang en
**✅ Check:** the output ends with `# pass 3` and `# fail 0`, and the **exit code is `0`**. Three **real** tests pass. That's the signal CI waits for. This `panier` is the unit we'll protect throughout.
:::

### step-02

:::lang fr
**Objectif.** Voir la CI passer au **rouge** — et comprendre le **code de sortie**.

**🤔 Le rouge, c'est le but.** La CI a de la valeur quand elle **échoue** au bon moment. On introduit un **bug**, on relance : le code de sortie devient **non-zéro**, la pipeline serait **rouge**. Puis on répare.

Casse le calcul, observe, répare :
:::

:::lang en
**Goal.** See CI go **red** — and understand the **exit code**.

**🤔 Red is the point.** CI is valuable when it **fails** at the right time. We introduce a **bug**, re-run: the exit code becomes **non-zero**, the pipeline would be **red**. Then we fix it.

Break the calculation, observe, fix:
:::

```bash
# On casse la remise (bug volontaire) / break the discount (deliberate bug)
sed -i 's/1 - remise/1 - remise + 0.5/' src/panier.js
node --test 2>&1 | grep -E "^# (pass|fail)"
echo "code de sortie / exit code: ${PIPESTATUS[0]}"

# On répare / fix it back
sed -i 's/1 - remise + 0.5/1 - remise/' src/panier.js
node --test 2>&1 | grep -E "^# (pass|fail)"
echo "code de sortie / exit code: ${PIPESTATUS[0]}"
```

:::lang fr
**✅ Vérification :** avec le bug, tu vois `# fail 2` et **code de sortie `1`** (la pipeline serait **rouge**) ; après réparation, `# fail 0` et **code `0`** (**verte**). Retiens : la pipeline ne « lit » pas tes tests, elle lit un **code de sortie**. Toute commande d'un job suit cette règle — un `terraform validate` ou un `az bicep build` qui échoue rend le job rouge de la même façon.
:::

:::lang en
**✅ Check:** with the bug you see `# fail 2` and **exit code `1`** (the pipeline would be **red**); after the fix, `# fail 0` and **code `0`** (**green**). Remember: the pipeline doesn't "read" your tests, it reads an **exit code**. Every command in a job follows this rule — a failing `terraform validate` or `az bicep build` makes the job red the same way.
:::

### step-03

:::lang fr
**Objectif.** Rendre le build **reproductible** avec `npm ci` et un **fichier de verrou**.

**🤔 Même commit, même install.** `npm install` peut faire bouger les versions ; `npm ci` installe **exactement** ce qui est figé dans `package-lock.json`. C'est la règle d'or d'une CI fiable. On génère le verrou (hors ligne, on n'a aucune dépendance), puis on installe à l'identique.

Génère le verrou et installe :
:::

:::lang en
**Goal.** Make the build **reproducible** with `npm ci` and a **lockfile**.

**🤔 Same commit, same install.** `npm install` may move versions; `npm ci` installs **exactly** what's frozen in `package-lock.json`. It's the golden rule of a reliable CI. We generate the lock (offline — we have no dependency), then install identically.

Generate the lock and install:
:::

```bash
# Générer le fichier de verrou / generate the lockfile
npm install --package-lock-only
ls -1 package-lock.json

# Installer à l'identique (ce que fait la CI) / install identically (what CI does)
npm ci
echo "code de sortie / exit code: $?"
```

:::lang fr
**✅ Vérification :** `package-lock.json` existe et `npm ci` se termine avec le **code `0`** (`up to date, audited 1 package`). Dans une pipeline, `npm ci` remplace toujours `npm install` : reproductible et plus rapide. ⚠️ `npm ci` **exige** le fichier de verrou — versionne-le (`git add package-lock.json`).
:::

:::lang en
**✅ Check:** `package-lock.json` exists and `npm ci` ends with **code `0`** (`up to date, audited 1 package`). In a pipeline, `npm ci` always replaces `npm install`: reproducible and faster. ⚠️ `npm ci` **requires** the lockfile — version it (`git add package-lock.json`).
:::

### step-04

:::lang fr
**Objectif.** Dessiner le **graphe de jobs** : `lint` → `test` → `paquet` avec `needs`.

**🤔 Ordonner et paralléliser.** Par défaut les jobs sont parallèles. On veut : `lint` d'abord, `test` **après** lint, `paquet` **après** test. `needs:` crée cette dépendance et le **graphe**. On écrit la pipeline dans `.github/workflows/ci.yml` et on **valide** sa structure.

Crée le workflow et valide-le :
:::

:::lang en
**Goal.** Draw the **job graph**: `lint` → `test` → `package` with `needs`.

**🤔 Order and parallelize.** By default jobs are parallel. We want: `lint` first, `test` **after** lint, `package` **after** test. `needs:` creates that dependency and the **graph**. We write the pipeline in `.github/workflows/ci.yml` and **validate** its structure.

Create the workflow and validate it:
:::

```bash
mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<'YAML'
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
  test:
    name: Test (Node ${{ matrix.node }})
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm test
  paquet:
    name: Construire l'artefact
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - run: tar -czf panier-dist.tgz src package.json
      - uses: actions/upload-artifact@v4
        with:
          name: panier-dist
          path: panier-dist.tgz
YAML

python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/ci.yml')); \
print('jobs:', list(d['jobs'].keys())); \
print('test.needs:', d['jobs']['test']['needs']); \
print('paquet.needs:', d['jobs']['paquet']['needs'])"
```

:::lang fr
**✅ Vérification :** la sortie affiche `jobs: ['lint', 'test', 'paquet']`, `test.needs: lint`, `paquet.needs: test`. Le **graphe** est en place : rien ne teste avant le lint, rien ne s'empaquette avant les tests. `cache: npm` accélère l'install. On voit déjà la **matrice** (`node: [20, 22]`) et l'**artefact** (`upload-artifact`) — on les détaille juste après.
:::

:::lang en
**✅ Check:** the output shows `jobs: ['lint', 'test', 'paquet']`, `test.needs: lint`, `paquet.needs: test`. The **graph** is in place: nothing tests before lint, nothing packages before tests. `cache: npm` speeds up the install. You can already see the **matrix** (`node: [20, 22]`) and the **artifact** (`upload-artifact`) — we detail them next.
:::

### step-05

:::lang fr
**Objectif.** Comprendre la **matrice** — tester **plusieurs versions en parallèle**.

**🤔 Une définition, N exécutions.** Le job `test` porte `strategy.matrix.node: [20, 22]`. Le runner le **démultiplie** : deux exécutions parallèles, une par version, chacune avec `${{ matrix.node }}` injecté. Si le code casse sur Node 20 mais pas 22, la matrice le **révèle**. Localement, on **simule** la matrice en bouclant sur les versions (le concept, sans runner) et on **relit** la définition.

Simule la matrice et vérifie la définition :
:::

:::lang en
**Goal.** Understand the **matrix** — testing **several versions in parallel**.

**🤔 One definition, N runs.** The `test` job carries `strategy.matrix.node: [20, 22]`. The runner **fans it out**: two parallel runs, one per version, each with `${{ matrix.node }}` injected. If code breaks on Node 20 but not 22, the matrix **reveals** it. Locally we **simulate** the matrix by looping over versions (the concept, no runner) and **re-read** the definition.

Simulate the matrix and check the definition:
:::

```bash
# Lire les versions de la matrice / read the matrix versions
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/ci.yml')); \
print('matrice / matrix:', d['jobs']['test']['strategy']['matrix']['node'])"

# Simuler chaque variante (ici, une seule version locale, mais la boucle illustre)
for v in 20 22; do
  echo "== variante Node $v : lancement des tests =="
  node --test 2>&1 | grep -E "^# (pass|fail)"
done
```

:::lang fr
**✅ Vérification :** tu vois `matrice / matrix: [20, 22]`, puis les tests passent (`# pass 3`) pour chaque variante simulée. Sur un runner GitHub, ces deux variantes tourneraient **en parallèle** sur de **vraies** images Node 20 et 22. Une matrice évite de dupliquer le job — une ligne, deux (ou dix) configurations.
:::

:::lang en
**✅ Check:** you see `matrice / matrix: [20, 22]`, then the tests pass (`# pass 3`) for each simulated variant. On a GitHub runner these two variants would run **in parallel** on **real** Node 20 and 22 images. A matrix avoids duplicating the job — one line, two (or ten) configurations.
:::

### step-06

:::lang fr
**Objectif.** Produire des **artefacts** : un **rapport de test** et un **paquet**.

**🤔 Ce qu'une étape lègue à la suivante.** Un artefact est un **fichier** produit par un job et récupérable ensuite (téléchargement, ou consommé par un stage de déploiement). On produit deux artefacts **réels** localement : un **rapport de test** au format **TAP** (lisible par machine) et le **paquet** `panier-dist.tgz`. Dans le YAML, c'est `upload-artifact` (GitHub) qui les publie.

Produis les artefacts pour de vrai :
:::

:::lang en
**Goal.** Produce **artifacts**: a **test report** and a **package**.

**🤔 What one stage bequeaths to the next.** An artifact is a **file** produced by a job and retrievable afterwards (download, or consumed by a deploy stage). We produce two **real** artifacts locally: a **test report** in **TAP** format (machine-readable) and the **package** `panier-dist.tgz`. In YAML, `upload-artifact` (GitHub) publishes them.

Produce the artifacts for real:
:::

```bash
# Rapport de test lisible par machine (format TAP) / machine-readable test report (TAP)
node --test --test-reporter tap > test-report.tap
echo "rapport / report: $(head -1 test-report.tap) ($(wc -l < test-report.tap) lignes/lines)"

# Paquet de production (ce que 'paquet' construit dans le YAML) / production package
tar -czf panier-dist.tgz src package.json
echo "paquet / package:"; ls -lh panier-dist.tgz | awk '{print $5, $9}'

# Vérifier le contenu du paquet / check the package contents
tar -tzf panier-dist.tgz
```

:::lang fr
**✅ Vérification :** `test-report.tap` commence par `TAP version 13` et le paquet `panier-dist.tgz` contient `src/panier.js` et `package.json`. Ce sont de **vrais artefacts** : dans une pipeline, `upload-artifact` les attache à l'exécution, et un **stage suivant** peut les **télécharger** sans reconstruire. Un rapport TAP/JUnit permet aussi à la plateforme d'**afficher** les tests (verts/rouges) dans l'UI.
:::

:::lang en
**✅ Check:** `test-report.tap` starts with `TAP version 13` and the package `panier-dist.tgz` contains `src/panier.js` and `package.json`. These are **real artifacts**: in a pipeline, `upload-artifact` attaches them to the run, and a **later stage** can **download** them without rebuilding. A TAP/JUnit report also lets the platform **display** tests (green/red) in the UI.
:::

### step-07

:::lang fr
**Objectif.** Relier **CI → CD** (environnements & approbations) et écrire l'équivalent **Azure Pipelines** multi-stages ; puis versionner.

**🤔 La porte avant la prod.** Après la CI, le **CD** déploie — mais on met une **porte** : un **environnement** (`production`) protégé par une **approbation**. La pipeline **s'arrête** et attend un humain. On écrit une pipeline **Azure Pipelines** à trois **stages** (Valider → Tester → Déployer, ce dernier ciblant un `environment`), on la **valide**, puis on **versionne** tout.

Écris la pipeline Azure Pipelines, valide, versionne :
:::

:::lang en
**Goal.** Connect **CI → CD** (environments & approvals) and write the multi-stage **Azure Pipelines** equivalent; then version it.

**🤔 The gate before prod.** After CI, **CD** deploys — but we add a **gate**: an **environment** (`production`) protected by an **approval**. The pipeline **pauses** and waits for a human. We write a three-**stage** **Azure Pipelines** pipeline (Validate → Test → Deploy, the latter targeting an `environment`), **validate** it, then **version** everything.

Write the Azure Pipelines pipeline, validate, version:
:::

```bash
cat > azure-pipelines.yml <<'YAML'
trigger:
  branches:
    include: [ main ]
pool:
  vmImage: ubuntu-latest
stages:
  - stage: Valider
    jobs:
      - job: lint
        steps:
          - task: NodeTool@0
            inputs: { versionSpec: '22.x' }
          - script: npm ci
          - script: npm run lint
  - stage: Tester
    dependsOn: Valider
    jobs:
      - job: test
        strategy:
          matrix:
            node20: { nodeVersion: '20.x' }
            node22: { nodeVersion: '22.x' }
        steps:
          - task: NodeTool@0
            inputs: { versionSpec: $(nodeVersion) }
          - script: npm ci
          - script: npm test
  - stage: Deployer
    dependsOn: Tester
    jobs:
      - deployment: deploy
        environment: production   # porte : approbation configurée sur l'environnement
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Déploiement du paquet vers production"
YAML

python3 -c "import yaml; d=yaml.safe_load(open('azure-pipelines.yml')); \
st=d['stages']; \
print('stages:', [s['stage'] for s in st]); \
print('deps:', {s['stage']: s.get('dependsOn') for s in st}); \
print('environnement / environment:', st[2]['jobs'][0]['environment'])"

# Ne versionne PAS les artefacts générés (paquet, rapport) / don't version generated artifacts
cat > .gitignore <<'GI'
panier-dist.tgz
test-report.tap
node_modules/
GI

# Versionner CI + CD (pipeline-as-code) / version CI + CD
git init -q 2>/dev/null; git config user.email you@example.com; git config user.name student
git add -A && git commit -qm "ci: pipeline CI/CD (jobs, matrice, artefacts) + CD" && git log --oneline -1
echo "--- fichiers versionnés / tracked files ---"; git ls-files
```

:::lang fr
**✅ Vérification :** la sortie affiche `stages: ['Valider', 'Tester', 'Deployer']`, `deps` chaînés (`Tester`←`Valider`, `Deployer`←`Tester`) et `environnement / environment: production`. Le stage `Deployer` est un **deployment job** ciblant l'**environnement** `production` : dans Azure DevOps, on y attache une **approbation** — la pipeline attendra un humain avant de déployer. Tu tiens une pipeline **multi-stages** complète (CI + CD), versionnée. Note que `git ls-files` **n'inclut pas** `panier-dist.tgz` ni `test-report.tap` : le `.gitignore` les exclut — un **artefact** est **produit** par la pipeline, il ne se versionne pas (seul le **code source** et la **pipeline** le sont). La suite du track : **l'IaC dans les pipelines** (déployer Bicep/Terraform depuis un stage), puis la **sécurité** (DevSecOps) et la **supervision**.
:::

:::lang en
**✅ Check:** the output shows `stages: ['Valider', 'Tester', 'Deployer']`, chained `deps` (`Tester`←`Valider`, `Deployer`←`Tester`) and `environnement / environment: production`. The `Deployer` stage is a **deployment job** targeting the `production` **environment**: in Azure DevOps you attach an **approval** to it — the pipeline will wait for a human before deploying. You hold a complete **multi-stage** pipeline (CI + CD), versioned. Note that `git ls-files` **does not include** `panier-dist.tgz` or `test-report.tap`: the `.gitignore` excludes them — an **artifact** is **produced** by the pipeline, it isn't versioned (only the **source code** and the **pipeline** are). Next in the track: **IaC in pipelines** (deploy Bicep/Terraform from a stage), then **security** (DevSecOps) and **monitoring**.
:::

## pitfalls

:::lang fr
**1. `npm install` en CI.** Il peut faire bouger les versions → builds non reproductibles. Utilise **`npm ci`** (exige le fichier de verrou, versionné).

**2. Oublier `needs` / `dependsOn`.** Sans dépendance, les jobs tournent **en parallèle** : le paquet peut se construire **avant** que les tests passent. Déclare le graphe.

**3. Croire que la pipeline lit tes tests.** Elle lit un **code de sortie**. Un test qui « affiche » une erreur mais renvoie `0` laisse la pipeline **verte** à tort. Assure-toi que l'échec **fait échouer** la commande.

**4. Matrice = duplication.** Ne copie pas un job pour chaque version : une **matrice** fait le travail, une seule définition.

**5. Reconstruire au lieu de transmettre.** Le stage de déploiement doit **consommer l'artefact** du stage de build, pas tout recompiler (risque de divergence, et lenteur).

**6. Déployer sans porte.** Un `production` sans **environnement + approbation** = déploiement non contrôlé. Mets la porte dans la pipeline.

**7. Cache confondu avec artefact.** Le **cache** accélère (dépendances réutilisées) mais n'est **pas** un livrable ; l'**artefact** est le **résultat** transmis/téléchargé. Ne stocke pas un livrable dans le cache.
:::

:::lang en
**1. `npm install` in CI.** It can move versions → non-reproducible builds. Use **`npm ci`** (requires the lockfile, versioned).

**2. Forgetting `needs` / `dependsOn`.** Without a dependency, jobs run **in parallel**: the package may build **before** tests pass. Declare the graph.

**3. Thinking the pipeline reads your tests.** It reads an **exit code**. A test that "prints" an error but returns `0` leaves the pipeline **green** wrongly. Make sure failure **fails** the command.

**4. Matrix = duplication.** Don't copy a job per version: a **matrix** does the job, one definition.

**5. Rebuilding instead of passing on.** The deploy stage should **consume the build stage's artifact**, not recompile everything (divergence risk, and slowness).

**6. Deploying without a gate.** A `production` without an **environment + approval** = uncontrolled deployment. Put the gate in the pipeline.

**7. Cache confused with artifact.** The **cache** speeds things up (reused dependencies) but is **not** a deliverable; the **artifact** is the **result** passed on/downloaded. Don't store a deliverable in the cache.
:::

## success

:::lang fr
Tu as réussi si :

- Tes **tests s'exécutent** (`node --test`) et tu sais lire le **code de sortie** (0/​non-zéro).
- Ton build est **reproductible** (`npm ci` + `package-lock.json` versionné).
- Ta pipeline a un **graphe** de jobs (`needs`/`dependsOn`) : `lint` → `test` → `paquet`.
- Tu utilises une **matrice** pour couvrir plusieurs versions.
- Tu **produis** et sais **consommer** des **artefacts** (rapport de test, paquet).
- Tu as une pipeline **multi-stages** (GitHub Actions **et** Azure Pipelines) avec une **porte** CD (environnement + approbation), le tout **versionné**.
:::

:::lang en
You've succeeded if:

- Your **tests run** (`node --test`) and you can read the **exit code** (0/​non-zero).
- Your build is **reproducible** (`npm ci` + versioned `package-lock.json`).
- Your pipeline has a job **graph** (`needs`/`dependsOn`): `lint` → `test` → `package`.
- You use a **matrix** to cover several versions.
- You **produce** and can **consume** **artifacts** (test report, package).
- You have a **multi-stage** pipeline (GitHub Actions **and** Azure Pipelines) with a CD **gate** (environment + approval), all **versioned**.
:::

## next

:::lang fr
- **Suivant :** *Azure — l'IaC dans les pipelines (AZ-400)* — déployer Bicep/Terraform depuis un stage, avec approbations et environnements.
- **Réviser :** *Azure — DevOps fondamentaux (AZ-400)* si le YAML ou Git te manquent.
- **S'entraîner :** ajoute un job de **couverture** de tests, ou un artefact **JUnit** affiché dans l'UI.
:::

:::lang en
- **Next:** *Azure — IaC in pipelines (AZ-400)* — deploy Bicep/Terraform from a stage, with approvals and environments.
- **Review:** *Azure — DevOps fundamentals (AZ-400)* if YAML or Git feel shaky.
- **Practice:** add a test **coverage** job, or a **JUnit** artifact displayed in the UI.
:::

## cheatsheet

:::lang fr
**Tests & build (local, réel)**

```bash
node --test                       # lance les tests ; code 0 = vert, non-zéro = rouge
node --test --test-reporter tap   # rapport TAP (artefact/UI)
npm install --package-lock-only   # génère le fichier de verrou
npm ci                            # install reproductible (exige le verrou)
```

**Anatomie GitHub Actions**

```text
on:            déclencheurs (push, pull_request, tag)
jobs:          unités parallèles (sur un runner)
  needs:       dépendance entre jobs (graphe)
strategy.matrix: N variantes parallèles (ex. node: [20, 22])
cache: npm     réutilise les dépendances (setup-node)
upload-artifact / download-artifact : produire / consommer un fichier
```

**Anatomie Azure Pipelines**

```text
trigger:       déclencheurs
stages:        regroupent des jobs (ex. Valider/Tester/Deployer)
  dependsOn:   dépendance entre stages/jobs
deployment + environment: déploiement + porte (approbation)
PublishBuildArtifacts / DownloadBuildArtifacts : artefacts
```

**Valider le YAML sans l'exécuter**

```bash
python3 -c "import yaml; print(list(yaml.safe_load(open('.github/workflows/ci.yml'))['jobs']))"
```
:::

:::lang en
**Tests & build (local, real)**

```bash
node --test                       # run tests; code 0 = green, non-zero = red
node --test --test-reporter tap   # TAP report (artifact/UI)
npm install --package-lock-only   # generate the lockfile
npm ci                            # reproducible install (requires the lock)
```

**GitHub Actions anatomy**

```text
on:            triggers (push, pull_request, tag)
jobs:          parallel units (on a runner)
  needs:       dependency between jobs (graph)
strategy.matrix: N parallel variants (e.g. node: [20, 22])
cache: npm     reuse dependencies (setup-node)
upload-artifact / download-artifact : produce / consume a file
```

**Azure Pipelines anatomy**

```text
trigger:       triggers
stages:        group jobs (e.g. Validate/Test/Deploy)
  dependsOn:   dependency between stages/jobs
deployment + environment: deployment + gate (approval)
PublishBuildArtifacts / DownloadBuildArtifacts : artifacts
```

**Validate YAML without running it**

```bash
python3 -c "import yaml; print(list(yaml.safe_load(open('.github/workflows/ci.yml'))['jobs']))"
```
:::

## resources

:::lang fr
- **Node.js — Test runner** : `node --test`, reporters (TAP, JUnit) — documentation officielle Node.
- **GitHub Actions** : jobs, `needs`, `strategy.matrix`, `cache`, artifacts — docs GitHub.
- **Azure Pipelines** : stages, `dependsOn`, deployment jobs, environments & approbations — docs Microsoft Learn (AZ-400).
- **npm ci** : install reproductible et fichier de verrou — docs npm.
- **Métriques DORA** : lead time, fréquence de déploiement, MTTR, taux d'échec — pour mesurer la CI/CD.
:::

:::lang en
- **Node.js — Test runner**: `node --test`, reporters (TAP, JUnit) — official Node docs.
- **GitHub Actions**: jobs, `needs`, `strategy.matrix`, `cache`, artifacts — GitHub docs.
- **Azure Pipelines**: stages, `dependsOn`, deployment jobs, environments & approvals — Microsoft Learn docs (AZ-400).
- **npm ci**: reproducible install and lockfile — npm docs.
- **DORA metrics**: lead time, deployment frequency, MTTR, change-failure rate — to measure CI/CD.
:::

## troubleshooting

:::lang fr
**`npm ci` échoue : « package-lock.json » manquant.** `npm ci` **exige** le verrou. Génère-le : `npm install --package-lock-only`, puis versionne-le (`git add package-lock.json`).

**Mes tests « passent » mais la pipeline reste rouge.** Vérifie le **code de sortie** : `node --test; echo $?`. Une commande **avant** les tests (lint, build) peut échouer et arrêter le job. Regarde le **premier** step rouge.

**Ma matrice ne se lance qu'une fois.** `strategy.matrix` doit être **sous le job**, pas sous `steps`. Vérifie l'indentation : `jobs.<job>.strategy.matrix.<clé>: [ ... ]`.

**`python3 ... yaml` : `KeyError: 'on'`.** En YAML 1.1, la clé `on:` est lue comme le booléen `True` par PyYAML. C'est **cosmétique** : GitHub Actions la lit correctement. Ne teste pas `d['on']` ; lis `d['jobs']`.

**L'artefact n'apparaît pas dans le stage suivant.** Il faut **`upload-artifact`** dans le job producteur **et** **`download-artifact`** (même `name`) dans le consommateur. Sur Azure Pipelines : `PublishBuildArtifacts` puis `DownloadBuildArtifacts`.

**Le déploiement ne demande pas d'approbation.** L'approbation s'attache à l'**environnement** (Azure DevOps → Environments → *production* → Approvals), pas au YAML. Le YAML **cible** l'environnement ; la porte se configure une fois côté plateforme.
:::

:::lang en
**`npm ci` fails: "package-lock.json" missing.** `npm ci` **requires** the lock. Generate it: `npm install --package-lock-only`, then version it (`git add package-lock.json`).

**My tests "pass" but the pipeline stays red.** Check the **exit code**: `node --test; echo $?`. A command **before** the tests (lint, build) may fail and stop the job. Look at the **first** red step.

**My matrix only runs once.** `strategy.matrix` must be **under the job**, not under `steps`. Check indentation: `jobs.<job>.strategy.matrix.<key>: [ ... ]`.

**`python3 ... yaml`: `KeyError: 'on'`.** In YAML 1.1, the `on:` key is read as the boolean `True` by PyYAML. It's **cosmetic**: GitHub Actions reads it fine. Don't test `d['on']`; read `d['jobs']`.

**The artifact doesn't show up in the next stage.** You need **`upload-artifact`** in the producer job **and** **`download-artifact`** (same `name`) in the consumer. On Azure Pipelines: `PublishBuildArtifacts` then `DownloadBuildArtifacts`.

**The deployment doesn't ask for approval.** The approval attaches to the **environment** (Azure DevOps → Environments → *production* → Approvals), not the YAML. The YAML **targets** the environment; the gate is configured once on the platform side.
:::
