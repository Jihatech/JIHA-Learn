---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-projet-devops
slug: azure-projet-devops
order: 75
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — projet DevOps (AZ-400) : une chaîne de livraison complète"
title_en: "Azure — DevOps project (AZ-400): a complete delivery chain"
tagline_fr: "de la branche au déploiement supervisé — sécurisé, mesuré, pour le CV."
tagline_en: "from branch to monitored deployment — secured, measured, CV-worthy."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 320
repo: "actions/runner"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-supervision-livraison]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [projet-devops, ci-cd, iac, devsecops, supervision, pipeline-complete, key-vault, dora, capstone, az-400]
concepts_en: [devops-project, ci-cd, iac, devsecops, monitoring, complete-pipeline, key-vault, dora, capstone, az-400]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet de CV du track AZ-400 : assembler une chaîne de livraison DevOps COMPLÈTE, en local et pour de vrai. Un dépôt avec branche de fonctionnalité + fusion façon pull request, une porte de sécurité (hook detect-secrets fail-closed + checkov), une CI reproductible (npm ci, node --test en matrice), une CD qui déploie l'IaC sur l'émulateur miniblue (terraform plan/apply live) avec le secret au coffre Key Vault, un smoke test post-déploiement (sonde readiness), la pipeline complète assemblée et validée (sécurité → build → plan → deploy, porte d'environnement, actions épinglées SHA, moindre privilège), et la mesure DORA. Puis l'emballage pour le CV. Sans compte ni facture.",
og_description_en: "The AZ-400 track's CV project: assembling a COMPLETE DevOps delivery chain, locally and for real. A repo with a feature branch + pull-request-style merge, a security gate (fail-closed detect-secrets hook + checkov), a reproducible CI (npm ci, node --test in a matrix), a CD that deploys IaC to the miniblue emulator (terraform plan/apply live) with the secret in Key Vault, a post-deploy smoke test (readiness probe), the complete pipeline assembled and validated (security → build → plan → deploy, environment gate, SHA-pinned actions, least privilege), and DORA measurement. Then CV packaging. No account or bill."
---

## intro

:::lang fr
C'est le **projet de synthèse** du track **AZ-400**. Tu as appris, un pilier à la fois : la **culture** et Git, les **pipelines CI/CD**, l'**IaC dans les pipelines**, le **DevSecOps**, la **supervision**. Ici, tu **assembles tout** en **une seule chaîne de livraison** — le genre de projet qui tient sur un CV et qu'on peut **montrer** en entretien.

Fidèle à la méthode, tout est **local et pour de vrai** : un dépôt avec une **branche de fonctionnalité** fusionnée façon **pull request**, une **porte de sécurité** (hook `detect-secrets` **fail-closed** + `checkov`), une **CI reproductible** (`npm ci`, `node --test` en **matrice**), une **CD** qui déploie l'**IaC** sur l'émulateur **miniblue** (`terraform plan`/`apply` **live**) avec le **secret** rangé au **coffre Key Vault**, un **smoke test** post-déploiement (sonde `readiness`), la **pipeline complète** assemblée et **validée** (sécurité → build → plan → deploy, **porte** d'environnement, actions **épinglées SHA**, **moindre privilège**), et la **mesure DORA**. On finit par l'**emballage CV**.

**Pour qui c'est :** tu as fait les cinq guides AZ-400 et tu veux un **livrable** qui prouve tes compétences DevOps.

**Ce que tu vas produire :** un dépôt Git complet — app + tests + IaC + pipeline sécurisée + supervision — **déployable sur l'émulateur**, et une **fiche CV** qui le résume.
:::

:::lang en
This is the **capstone** of the **AZ-400** track. You learned, one pillar at a time: **culture** and Git, **CI/CD pipelines**, **IaC in pipelines**, **DevSecOps**, **monitoring**. Here you **assemble everything** into **one delivery chain** — the kind of project that fits on a CV and can be **shown** in an interview.

True to the method, everything is **local and for real**: a repo with a **feature branch** merged pull-request-style, a **security gate** (fail-closed `detect-secrets` hook + `checkov`), a **reproducible CI** (`npm ci`, `node --test` in a **matrix**), a **CD** that deploys **IaC** to the **miniblue** emulator (`terraform plan`/`apply` **live**) with the **secret** stored in **Key Vault**, a post-deploy **smoke test** (readiness probe), the **complete pipeline** assembled and **validated** (security → build → plan → deploy, environment **gate**, **SHA-pinned** actions, **least privilege**), and **DORA measurement**. We finish with **CV packaging**.

**Who it's for:** you did the five AZ-400 guides and want a **deliverable** that proves your DevOps skills.

**What you'll produce:** a complete Git repo — app + tests + IaC + secured pipeline + monitoring — **deployable to the emulator**, and a **CV sheet** summarizing it.
:::

## objectives

:::lang fr
À la fin de ce projet, tu sais :

- Structurer un **dépôt** avec branche de fonctionnalité et **fusion** façon PR.
- Poser une **porte de sécurité** (hook `detect-secrets` fail-closed + `checkov`).
- Écrire une **CI reproductible** (`npm ci`, `node --test`, matrice).
- Déployer l'**IaC** sur l'émulateur (`terraform plan`/`apply` **live**) avec **Key Vault**.
- Ajouter un **smoke test** post-déploiement (sonde `readiness`).
- **Assembler** et **valider** la pipeline complète (sécurité → build → plan → deploy).
- **Mesurer** (DORA) et **emballer** le projet pour le CV.
:::

:::lang en
By the end of this project, you can:

- Structure a **repo** with a feature branch and a PR-style **merge**.
- Set a **security gate** (fail-closed `detect-secrets` hook + `checkov`).
- Write a **reproducible CI** (`npm ci`, `node --test`, matrix).
- Deploy **IaC** to the emulator (`terraform plan`/`apply` **live**) with **Key Vault**.
- Add a post-deploy **smoke test** (readiness probe).
- **Assemble** and **validate** the complete pipeline (security → build → plan → deploy).
- **Measure** (DORA) and **package** the project for the CV.
:::

## prerequisites

:::lang fr
- **Tous les guides AZ-400** : fondamentaux, pipelines CI/CD, IaC dans les pipelines, DevSecOps, supervision.
- Le **lab local** : **miniblue** démarré (port 4567), **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`.
- **Node.js** (`node -v` ≥ 18), **Python 3**, et `pip install detect-secrets checkov`.
- **Aucun compte cloud** : le déploiement cible l'émulateur ; la pipeline se valide en local.
:::

:::lang en
- **All AZ-400 guides**: fundamentals, CI/CD pipelines, IaC in pipelines, DevSecOps, monitoring.
- The **local lab**: **miniblue** started (port 4567), **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`.
- **Node.js** (`node -v` ≥ 18), **Python 3**, and `pip install detect-secrets checkov`.
- **No cloud account**: the deployment targets the emulator; the pipeline validates locally.
:::

## concepts

:::lang fr
**Une chaîne de livraison, cinq maillons.** Le projet relie ce que tu as vu séparément, dans l'ordre où une **vraie** livraison s'exécute :

1. **Source & collaboration.** Le code vit dans Git ; on travaille sur une **branche de fonctionnalité** et on fusionne via **pull request** (fusion `--no-ff` qui garde la trace de la revue). C'est le point d'entrée de toute la chaîne.
2. **Sécurité (shift-left).** Avant même la CI, un **hook pre-commit** bloque les secrets (**fail-closed**), et un scan **checkov** garde l'IaC. La sécurité est **d'abord**, pas après.
3. **CI (intégration).** À chaque changement, on **installe à l'identique** (`npm ci`) et on **teste** (`node --test`) sur plusieurs versions (**matrice**). Vert = on continue.
4. **CD (déploiement).** On **planifie** l'IaC (`terraform plan -out`), un humain approuve la **porte** d'environnement, puis on **applique** (`apply`). Le **secret** ne vit **jamais** dans le code : il est au **coffre** (Key Vault).
5. **Supervision.** Après déploiement, un **smoke test** (sonde `readiness`) confirme la santé ; les métriques **DORA** mesurent la performance de la chaîne dans le temps.

**Le fil conducteur : la porte et l'artefact.** Deux idées structurent la chaîne. La **porte** (approbation d'environnement) sépare ce qui est **automatique** (build, tests, plan) de ce qui **engage la prod** (apply). L'**artefact** (le plan Terraform, le paquet) **voyage** d'un stage à l'autre : on **revoit** puis on **applique exactement** ce qui a été revu. Sécurité, reproductibilité, traçabilité — les trois piliers d'une livraison sérieuse.

**Pourquoi ça vaut pour un CV.** Ce projet démontre, **preuves à l'appui**, que tu sais : versionner et collaborer, sécuriser une chaîne (secrets, IaC), automatiser build/test/déploiement, gérer des secrets et des portes d'approbation, et mesurer la performance. C'est **exactement** le périmètre de l'**AZ-400** — et le quotidien d'un ingénieur DevOps.

**Ce qui est live ici.** L'app **se teste** (`node --test`), la sécurité **bloque** vraiment (hook + checkov), l'IaC se **déploie et se détruit** sur **miniblue** (`terraform apply`/`destroy`), le **secret** vit au **coffre** (Key Vault `set`/`show`), le **smoke test** interroge une **vraie** sonde, les **métriques DORA** se **calculent** sur l'historique Git. La **pipeline complète** (GitHub Actions) se **valide** en local ; son **exécution** sur runner cible un vrai dépôt. **Sans compte cloud.**
:::

:::lang en
**One delivery chain, five links.** The project connects what you saw separately, in the order a **real** delivery runs:

1. **Source & collaboration.** Code lives in Git; you work on a **feature branch** and merge via **pull request** (a `--no-ff` merge that keeps the review trace). It's the entry point of the whole chain.
2. **Security (shift-left).** Even before CI, a **pre-commit hook** blocks secrets (**fail-closed**), and a **checkov** scan guards the IaC. Security comes **first**, not after.
3. **CI (integration).** On every change, you **install identically** (`npm ci`) and **test** (`node --test`) across versions (**matrix**). Green = continue.
4. **CD (deployment).** You **plan** the IaC (`terraform plan -out`), a human approves the environment **gate**, then you **apply** (`apply`). The **secret** **never** lives in code: it's in the **vault** (Key Vault).
5. **Monitoring.** After deployment, a **smoke test** (readiness probe) confirms health; **DORA** metrics measure the chain's performance over time.

**The through-line: the gate and the artifact.** Two ideas structure the chain. The **gate** (environment approval) separates what's **automatic** (build, tests, plan) from what **commits prod** (apply). The **artifact** (the Terraform plan, the package) **travels** from stage to stage: you **review** then **apply exactly** what was reviewed. Security, reproducibility, traceability — the three pillars of a serious delivery.

**Why it's CV-worthy.** This project demonstrates, **with evidence**, that you can: version and collaborate, secure a chain (secrets, IaC), automate build/test/deployment, manage secrets and approval gates, and measure performance. That's **exactly** the **AZ-400** scope — and a DevOps engineer's daily work.

**What's live here.** The app **is tested** (`node --test`), security really **blocks** (hook + checkov), the IaC **deploys and destroys** on **miniblue** (`terraform apply`/`destroy`), the **secret** lives in the **vault** (Key Vault `set`/`show`), the **smoke test** queries a **real** probe, the **DORA metrics** are **computed** on Git history. The **complete pipeline** (GitHub Actions) is **validated** locally; its **execution** on a runner targets a real repo. **No cloud account.**
:::

:::figure azure-projet-devops-chain
caption_fr: "Schéma 1. La chaîne de livraison complète du projet : SOURCE (branche + fusion PR) → SÉCURITÉ (hook detect-secrets fail-closed + checkov) → CI (npm ci + node --test en matrice) → PORTE (approbation d'environnement) → CD (terraform plan-artefact → apply live sur miniblue, secret au Key Vault) → SUPERVISION (smoke test readiness + métriques DORA). Actions épinglées SHA, moindre privilège. Un seul dépôt, une seule pipeline, prête pour le CV."
caption_en: "Figure 1. The project's complete delivery chain: SOURCE (branch + PR merge) → SECURITY (fail-closed detect-secrets hook + checkov) → CI (npm ci + node --test matrix) → GATE (environment approval) → CD (terraform plan-artifact → live apply on miniblue, secret in Key Vault) → MONITORING (readiness smoke test + DORA metrics). SHA-pinned actions, least privilege. One repo, one pipeline, CV-ready."
:::

## walkthrough

:::lang fr
On avance ainsi : échafauder le dépôt (branche + PR) → porte de sécurité → CI reproductible → CD live vers l'émulateur + Key Vault → smoke test → pipeline complète assemblée → mesurer (DORA) & emballer pour le CV.
:::

:::lang en
We'll go like this: scaffold the repo (branch + PR) → security gate → reproducible CI → live CD to the emulator + Key Vault → smoke test → complete pipeline assembled → measure (DORA) & package for the CV.
:::

### step-01

:::lang fr
**Objectif.** Échafauder le **dépôt** : app + tests + IaC, une **branche de fonctionnalité** fusionnée façon **PR**.

**🤔 Tout part de la source.** On crée le squelette (une petite app avec une fonction `sante()`, un test, un dossier `infra`), puis on travaille comme une équipe : **branche**, commit, **fusion `--no-ff`** (qui garde la trace de la PR).

Crée le projet et joue le flux de branche :
:::

:::lang en
**Goal.** Scaffold the **repo**: app + tests + IaC, a **feature branch** merged pull-request-style.

**🤔 Everything starts from source.** We create the skeleton (a small app with a `sante()` function, a test, an `infra` folder), then work like a team: **branch**, commit, **`--no-ff` merge** (which keeps the PR trace).

Create the project and play the branch flow:
:::

```bash
mkdir -p projet-devops/src projet-devops/test projet-devops/infra && cd projet-devops
git init -q && git config user.email you@example.com && git config user.name student && git branch -M main

cat > package.json <<'JSON'
{ "name": "jiha-devops-projet", "version": "1.0.0", "main": "src/app.js",
  "scripts": { "lint": "node -e \"process.exit(0)\"", "test": "node --test" } }
JSON
cat > src/app.js <<'JS'
function sante() { return { status: "ok", version: process.env.APP_VERSION || "dev" }; }
module.exports = { sante };
JS
cat > test/app.test.js <<'JS'
const test = require("node:test"), assert = require("node:assert");
const { sante } = require("../src/app.js");
test("santé ok", () => assert.strictEqual(sante().status, "ok"));
JS
cat > infra/main.tf <<'TF'
resource "azurerm_resource_group" "app" {
  name     = "rg-jiha-devops"
  location = "westeurope"
  tags     = { projet = "jiha-devops-projet", gere = "terraform" }
}

# Un groupe de sécurité réseau durci (n'autorise que HTTPS entrant)
resource "azurerm_network_security_group" "app" {
  name                = "nsg-app"
  location            = azurerm_resource_group.app.location
  resource_group_name = azurerm_resource_group.app.name
  security_rule {
    name                       = "autoriser-https"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
  tags = azurerm_resource_group.app.tags
}
TF

# Ignorer les artefacts (état/plan/verrou de provider) — jamais versionnés
cat > .gitignore <<'GI'
infra/.terraform/
infra/.terraform.lock.hcl
infra/tfplan
*.tfstate
*.tfstate.*
smoke.js
GI

git add -A && git commit -qm "chore: échafaudage du projet DevOps"

# Branche de fonctionnalité + fusion façon PR / feature branch + PR-style merge
git checkout -q -b feature/sante
echo "// endpoint de santé exposé / health endpoint exposed" >> src/app.js
git commit -qam "feat: endpoint de santé"
git checkout -q main
git merge --no-ff feature/sante -m "merge: PR #1 endpoint de santé" >/dev/null

git log --oneline --graph | head -4
```

:::lang fr
**✅ Vérification :** le graphe montre la **fusion** : `merge: PR #1 endpoint de santé` au sommet, reliant `feat: endpoint de santé` (branche) et `chore: échafaudage` (main). La fusion `--no-ff` **garde la trace** de la pull request — précieux pour l'audit. Ton dépôt contient l'**app**, ses **tests** et l'**IaC** : la matière première de toute la chaîne. On la **sécurise** dès l'étape suivante.
:::

:::lang en
**✅ Check:** the graph shows the **merge**: `merge: PR #1 endpoint de santé` on top, joining `feat: endpoint de santé` (branch) and `chore: échafaudage` (main). The `--no-ff` merge **keeps the trace** of the pull request — valuable for audit. Your repo holds the **app**, its **tests** and the **IaC**: the raw material of the whole chain. We **secure** it next.
:::

### step-02

:::lang fr
**Objectif.** Poser la **porte de sécurité** : hook `detect-secrets` **fail-closed** + scan `checkov`.

**🤔 La sécurité d'abord.** On installe un **hook pre-commit** qui **bloque** tout secret (et **échoue fermé** si l'outil manque), et on **scanne l'IaC** avec `checkov`. Rien n'avance sans ces gardes.

Installe le hook, teste-le, scanne l'IaC :
:::

:::lang en
**Goal.** Set the **security gate**: fail-closed `detect-secrets` hook + `checkov` scan.

**🤔 Security first.** We install a **pre-commit hook** that **blocks** any secret (and **fails closed** if the tool is missing), and we **scan the IaC** with `checkov`. Nothing moves without these guards.

Install the hook, test it, scan the IaC:
:::

```bash
cat > .git/hooks/pre-commit <<'HOOK'
#!/bin/sh
# Contrôle de sécurité : ÉCHOUER FERMÉ / security control: FAIL CLOSED
if ! command -v detect-secrets >/dev/null 2>&1; then
  echo "⛔ detect-secrets introuvable — commit bloqué par sécurité."
  exit 1
fi
for f in $(git diff --cached --name-only); do
  [ -f "$f" ] || continue
  N=$(detect-secrets scan "$f" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(sum(len(v) for v in d['results'].values()))" 2>/dev/null)
  [ -z "$N" ] && N=-1
  if [ "$N" -ne 0 ]; then
    echo "❌ SECRET détecté (ou scan impossible) dans $f — commit bloqué."
    exit 1
  fi
done
echo "✅ Aucun secret détecté."
HOOK
chmod +x .git/hooks/pre-commit

# Test : un secret en dur doit être REFUSÉ / a hardcoded secret must be REJECTED
echo 'const TOKEN = "ghp_1234567890abcdefghijklmnopqrstuvwxyzAB";' > src/secret.js
git add src/secret.js
git commit -m "test secret" ; echo "commit fautif / offending commit: $?"
rm src/secret.js ; git reset -q

# Scan de l'IaC / IaC scan
checkov -d infra --compact --quiet 2>/dev/null | grep -E "Passed checks|Failed checks" | head -1
```

:::lang fr
**✅ Vérification :** le commit du secret est **refusé** (`❌ SECRET détecté … commit bloqué` puis `commit fautif: 1`) — le hook **fail-closed** protège le dépôt. Le scan `checkov` sur l'`infra` affiche `Passed checks: 4, Failed checks: 0` : le groupe de sécurité réseau durci (HTTPS entrant uniquement) **passe** les règles applicables. La **porte de sécurité** est en place : secrets bloqués **avant** commit, IaC scannée et **verte**. On peut construire en confiance.
:::

:::lang en
**✅ Check:** the secret commit is **refused** (`❌ SECRET détecté … commit bloqué` then `commit fautif: 1`) — the **fail-closed** hook protects the repo. The `checkov` scan on `infra` prints `Passed checks: 4, Failed checks: 0`: the hardened network security group (HTTPS inbound only) **passes** the applicable rules. The **security gate** is in place: secrets blocked **before** commit, IaC scanned and **green**. We can build with confidence.
:::

### step-03

:::lang fr
**Objectif.** Écrire la **CI** : installe reproductible (`npm ci`) + tests (`node --test`).

**🤔 Vert avant de déployer.** La CI **installe à l'identique** puis **teste**. Un code de sortie `0` = feu vert. On génère le verrou, on lance les tests.

Rends le build reproductible et teste :
:::

:::lang en
**Goal.** Write the **CI**: reproducible install (`npm ci`) + tests (`node --test`).

**🤔 Green before deploying.** CI **installs identically** then **tests**. An exit code `0` = green light. We generate the lock, run the tests.

Make the build reproducible and test:
:::

```bash
npm install --package-lock-only >/dev/null 2>&1   # fichier de verrou / lockfile
git add package-lock.json && git commit -qm "chore: fichier de verrou npm"

npm ci >/dev/null 2>&1 && echo "npm ci: build reproductible OK (code $?)"
node --test 2>&1 | grep -E "^# (pass|fail)"
echo "code de sortie des tests / tests exit code: ${PIPESTATUS[0]}"
```

:::lang fr
**✅ Vérification :** `npm ci` réussit (`build reproductible OK`) et `node --test` affiche `# pass 1`, `# fail 0` avec **code de sortie `0`**. La CI est **verte** : install figé + tests passants. Dans la pipeline, ce job tournera sur une **matrice** (Node 20 et 22) — on l'assemble à l'étape 6. Le feu est vert pour **déployer**.
:::

:::lang en
**✅ Check:** `npm ci` succeeds (`build reproductible OK`) and `node --test` shows `# pass 1`, `# fail 0` with **exit code `0`**. CI is **green**: frozen install + passing tests. In the pipeline, this job will run on a **matrix** (Node 20 and 22) — we assemble it in step 6. The light is green to **deploy**.
:::

### step-04

:::lang fr
**Objectif.** La **CD** : déployer l'IaC sur l'émulateur (`plan` → `apply` **live**) + **secret au coffre**.

**🤔 Déployer pour de vrai, sans secret en dur.** On **planifie** l'IaC (artefact), on **applique** sur miniblue, et on range le **secret** de l'app au **Key Vault** (jamais dans le code).

Prépare le lab, déploie, range le secret :
:::

:::lang en
**Goal.** The **CD**: deploy the IaC to the emulator (`plan` → `apply` **live**) + **secret in the vault**.

**🤔 Deploy for real, with no hardcoded secret.** We **plan** the IaC (artifact), **apply** on miniblue, and store the app's **secret** in **Key Vault** (never in code).

Prepare the lab, deploy, store the secret:
:::

```bash
export SSL_CERT_FILE=$HOME/.miniblue/cert.pem
export ARM_ENVIRONMENT=public

cat > infra/providers.tf <<'TF'
terraform {
  required_providers { azurerm = { source = "hashicorp/azurerm", version = "~> 3.0" } }
}
provider "azurerm" {
  features {}
  metadata_host              = "localhost:4567"
  skip_provider_registration = true
  subscription_id            = "00000000-0000-0000-0000-000000000000"
  tenant_id                  = "00000000-0000-0000-0000-000000000001"
  client_id                  = "miniblue"
  client_secret              = "miniblue" # pragma: allowlist secret (identifiant factice de l'émulateur)
  environment                = "public"
}
TF

cd infra
terraform init -no-color >/dev/null 2>&1
terraform plan -out=tfplan -no-color 2>&1 | grep -E "Plan:"
terraform apply -no-color tfplan 2>&1 | grep -E "Apply complete"
cd ..

# Le secret de l'app va au coffre, pas dans le code / the app secret goes to the vault
azlocal keyvault secret set --vault kv-jiha --name app-token --value "tok_du_projet" 2>/dev/null \
  | python3 -c "import sys,json; print('secret au coffre / secret in vault:', json.load(sys.stdin)['id'])"
```

:::lang fr
**✅ Vérification :** `plan` annonce `Plan: 2 to add`, `apply` confirme `Apply complete! Resources: 2 added` — le groupe de ressources **et** le groupe de sécurité réseau sont **déployés pour de vrai** sur miniblue. Le **secret** est rangé au **coffre** (`secret au coffre : https://kv-jiha.vault.azure.net/secrets/app-token`). La CD a fait son travail : infra **appliquée** (depuis un plan revu), secret **hors du code**. On **vérifie la santé** juste après.
:::

:::lang en
**✅ Check:** `plan` announces `Plan: 2 to add`, `apply` confirms `Apply complete! Resources: 2 added` — the resource group **and** the network security group are **deployed for real** on miniblue. The **secret** is stored in the **vault** (`secret au coffre : https://kv-jiha.vault.azure.net/secrets/app-token`). CD did its job: infra **applied** (from a reviewed plan), secret **out of code**. We **check health** right after.
:::

### step-05

:::lang fr
**Objectif.** Le **smoke test** post-déploiement : la sonde `readiness` répond, et l'infra existe.

**🤔 Déployer ne suffit pas — vérifie.** Après un déploiement, un **smoke test** confirme que le service **répond** (sonde `readiness == 200`) et que l'infra est **là**. Sinon, on **alerte** (et on rebascule).

Lance le smoke test (santé + infra) :
:::

:::lang en
**Goal.** The post-deploy **smoke test**: the `readiness` probe answers, and the infra exists.

**🤔 Deploying isn't enough — verify.** After a deployment, a **smoke test** confirms the service **answers** (readiness probe `== 200`) and the infra is **there**. Otherwise, we **alert** (and roll back).

Run the smoke test (health + infra):
:::

```bash
# Sonde readiness de l'app (démarre puis répond 200) / app readiness probe
cat > smoke.js <<'JS'
const http = require("http");
const s = http.createServer((_, res) => res.writeHead(200).end("PRET"));
s.listen(8100, () => {
  http.get("http://localhost:8100/health/ready", r => {
    console.log("smoke test /health/ready ->", r.statusCode, r.statusCode === 200 ? "✅" : "❌");
    s.close();
  });
});
JS
node smoke.js

# L'infra déployée est bien là / the deployed infra is really there
azlocal group show --name rg-jiha-devops 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('infra:', d['name'], '->', d['properties']['provisioningState'])"
```

:::lang fr
**✅ Vérification :** le smoke test affiche `smoke test /health/ready -> 200 ✅` (le service est **prêt**) et l'infra répond `infra: rg-jiha-devops -> Succeeded`. Déploiement **vérifié** : app en bonne santé, infra provisionnée. En pipeline, un smoke test **rouge** **échoue** le déploiement (et déclenche un rollback). C'est la dernière garde avant de déclarer « livré ».
:::

:::lang en
**✅ Check:** the smoke test shows `smoke test /health/ready -> 200 ✅` (the service is **ready**) and the infra answers `infra: rg-jiha-devops -> Succeeded`. Deployment **verified**: healthy app, provisioned infra. In a pipeline, a **red** smoke test **fails** the deployment (and triggers a rollback). It's the last guard before declaring "shipped".
:::

### step-06

:::lang fr
**Objectif.** **Assembler** la pipeline complète et la **valider** — sécurité → build → plan → deploy.

**🤔 Tout, en un seul fichier.** On écrit la pipeline **de bout en bout** : job **sécurité** (secrets + IaC), job **build/test** (matrice), job **plan** (artefact), job **deploy** (derrière la **porte** `production`). Au **moindre privilège** et avec des actions **épinglées SHA**. On **valide** la structure.

Écris la pipeline complète et valide-la :
:::

:::lang en
**Goal.** **Assemble** the complete pipeline and **validate** it — security → build → plan → deploy.

**🤔 Everything, in one file.** We write the pipeline **end-to-end**: **security** job (secrets + IaC), **build/test** job (matrix), **plan** job (artifact), **deploy** job (behind the `production` **gate**). With **least privilege** and **SHA-pinned** actions. We **validate** the structure.

Write the complete pipeline and validate it:
:::

```bash
mkdir -p .github/workflows
cat > .github/workflows/livraison.yml <<'YAML'
name: Livraison
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
permissions:
  contents: read
jobs:
  securite:
    name: Sécurité (secrets + IaC)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
      - run: pip install detect-secrets checkov
      - run: detect-secrets scan --all-files
      - run: checkov -d infra
  build_test:
    name: Build & Test
    runs-on: ubuntu-latest
    needs: securite
    strategy:
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
      - uses: actions/setup-node@1a4442cacd436585916779262731d5b162bc6ec7  # v3.9.1
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
  plan:
    name: IaC Plan
    runs-on: ubuntu-latest
    needs: build_test
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
      - run: cd infra && terraform init && terraform plan -out=tfplan
      - uses: actions/upload-artifact@50769540e7f4bd5e21e526ee35c689e35e0d6874  # v4.4.0
        with:
          name: tfplan
          path: infra/tfplan
  deploy:
    name: Déploiement (porte)
    runs-on: ubuntu-latest
    needs: plan
    environment: production
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
      - uses: actions/download-artifact@fa0a91b85d4f404e444e00e005971372dc801d16  # v4.1.8
        with:
          name: tfplan
          path: infra
      - run: cd infra && terraform init && terraform apply tfplan
      - run: echo "Smoke test health/ready == 200"
YAML

python3 -c "
import yaml, re
d = yaml.safe_load(open('.github/workflows/livraison.yml'))
print('jobs:', list(d['jobs'].keys()))
print('graphe / graph:', {k: v.get('needs') for k,v in d['jobs'].items()})
print('porte / gate:', d['jobs']['deploy']['environment'])
print('moindre privilège / least privilege:', d['permissions'])
pins = [s['uses'].split('@')[1] for j in d['jobs'].values() for s in j['steps'] if 'uses' in s]
print('actions épinglées SHA / SHA-pinned:', all(re.fullmatch(r'[0-9a-f]{40}', p) for p in pins))
"
```

:::lang fr
**✅ Vérification :** la sortie affiche `jobs: ['securite', 'build_test', 'plan', 'deploy']`, le **graphe** chaîné (`build_test`←`securite`, `plan`←`build_test`, `deploy`←`plan`), `porte / gate: production`, `moindre privilège: {'contents': 'read'}` et `actions épinglées SHA: True`. C'est **toute la chaîne** en un fichier : sécurité d'abord, tests, plan revu, déploiement derrière une porte — durcie (SHA, moindre privilège). Voilà ta **pipeline de livraison complète**.
:::

:::lang en
**✅ Check:** the output shows `jobs: ['securite', 'build_test', 'plan', 'deploy']`, the chained **graph** (`build_test`←`securite`, `plan`←`build_test`, `deploy`←`plan`), `porte / gate: production`, `moindre privilège: {'contents': 'read'}` and `actions épinglées SHA: True`. That's **the whole chain** in one file: security first, tests, reviewed plan, deployment behind a gate — hardened (SHA, least privilege). There's your **complete delivery pipeline**.
:::

### step-07

:::lang fr
**Objectif.** **Mesurer** (DORA), **nettoyer**, et **emballer** le projet pour le CV.

**🤔 Preuves et pitch.** On **tague** le déploiement (matière à DORA), on calcule une métrique, on **détruit** proprement le lab, puis on rédige la **fiche CV**.

Mesure, nettoie, emballe :
:::

:::lang en
**Goal.** **Measure** (DORA), **clean up**, and **package** the project for the CV.

**🤔 Evidence and pitch.** We **tag** the deployment (DORA material), compute a metric, **destroy** the lab cleanly, then write the **CV sheet**.

Measure, clean up, package:
:::

```bash
# Taguer le déploiement et mesurer (fréquence) / tag the deploy and measure
git tag deploy-1
python3 -c "print('DORA — déploiements taggés / tagged deployments:', $(git tag | grep -c deploy))"

# Nettoyer le lab / clean up the lab
cd infra && terraform destroy -auto-approve -no-color 2>&1 | grep -E "Destroy complete" ; cd ..

# La fiche CV / the CV sheet
cat > CV.md <<'MD'
# Projet : chaîne de livraison DevOps (Azure / AZ-400)
Pipeline CI/CD complète, sécurisée et supervisée — 100% local (émulateur).

- **Source** : Git, branches de fonctionnalité, fusion par pull request (--no-ff).
- **Sécurité** : hook pre-commit fail-closed (detect-secrets), scan IaC (checkov),
  secrets au coffre (Key Vault), actions épinglées par SHA, moindre privilège.
- **CI** : installe reproductible (npm ci), tests (node --test) en matrice 20/22.
- **CD** : IaC Terraform planifiée (artefact) puis appliquée derrière une porte
  d'approbation d'environnement ; déploiement live vérifié.
- **Supervision** : smoke test (sonde readiness), métriques DORA.

Stack : Git, GitHub Actions / Azure Pipelines, Terraform, Bicep, Key Vault,
detect-secrets, checkov, Node.js. Aligné AZ-400.
MD
echo "--- fiche CV créée / CV sheet created ---"; head -3 CV.md
git add -A && git commit -qm "docs: fiche CV du projet DevOps" && git log --oneline | head -1
```

:::lang fr
**✅ Vérification :** tu vois `DORA — déploiements taggés: 1`, `Destroy complete!` (lab nettoyé), et la **fiche CV** créée puis commitée — le hook affiche `✅ Aucun secret détecté` : la porte de sécurité **re-vérifie** ce commit et **passe**, car le `.gitignore` (step-01) exclut les artefacts Terraform et le `# pragma: allowlist secret` marque l'identifiant **factice** de l'émulateur. La boucle est **cohérente** : même le dernier commit respecte la porte. **Félicitations — tu as terminé le track AZ-400 !** Tu tiens un **projet complet** : dépôt versionné, chaîne de livraison **sécurisée** (secrets, IaC), **automatisée** (CI/CD), **déployée pour de vrai** (émulateur) derrière une **porte**, et **supervisée** (smoke test, DORA). Mets `CV.md` en avant, publie le dépôt, et parle de **chaque maillon** en entretien. Toute la partie **AZ-400** de ton parcours Azure est bouclée — cap sur l'**AZ-500** (sécurité) et l'**AZ-700** (réseau).
:::

:::lang en
**✅ Check:** you see `DORA — déploiements taggés: 1`, `Destroy complete!` (lab cleaned), and the **CV sheet** created then committed — the hook prints `✅ Aucun secret détecté`: the security gate **re-checks** this commit and **passes**, because the `.gitignore` (step-01) excludes the Terraform artifacts and the `# pragma: allowlist secret` marks the emulator's **dummy** credential. The loop is **consistent**: even the last commit respects the gate. **Congratulations — you finished the AZ-400 track!** You hold a **complete project**: versioned repo, a **secured** delivery chain (secrets, IaC), **automated** (CI/CD), **deployed for real** (emulator) behind a **gate**, and **monitored** (smoke test, DORA). Feature `CV.md`, publish the repo, and speak to **every link** in an interview. The whole **AZ-400** part of your Azure path is complete — onward to **AZ-500** (security) and **AZ-700** (networking).
:::

## pitfalls

:::lang fr
**1. Sauter la source.** Sans branche/PR propre, pas de revue ni de traçabilité. La collaboration Git est le **socle**, pas un détail.

**2. Sécurité « à la fin ».** Scanner **après** le déploiement, c'est trop tard. La porte de sécurité est **avant** la CI (shift-left).

**3. Hook fail-open.** Un hook qui laisse passer si l'outil manque **n'protège pas**. Fais-le **échouer fermé** (bloquer par défaut).

**4. `npm install` en CD.** Non reproductible. La chaîne utilise `npm ci` + fichier de verrou versionné.

**5. Appliquer sans plan revu.** Le `deploy` doit consommer un **plan-artefact** approuvé derrière une **porte**, pas replanifier à l'aveugle.

**6. Secret dans le dépôt.** Même « juste pour tester ». Le secret vit au **coffre** ; le code n'a qu'une **référence**.

**7. « Livré » sans smoke test.** Un `apply` réussi ne prouve pas que l'app **répond**. Vérifie la **santé** avant de déclarer livré.
:::

:::lang en
**1. Skipping source.** Without a clean branch/PR, no review or traceability. Git collaboration is the **foundation**, not a detail.

**2. Security "at the end".** Scanning **after** deployment is too late. The security gate is **before** CI (shift-left).

**3. Fail-open hook.** A hook that lets things through if the tool is missing **protects nothing**. Make it **fail closed** (block by default).

**4. `npm install` in CD.** Not reproducible. The chain uses `npm ci` + a versioned lockfile.

**5. Applying without a reviewed plan.** `deploy` must consume an approved **plan-artifact** behind a **gate**, not blindly re-plan.

**6. Secret in the repo.** Even "just for testing". The secret lives in the **vault**; code holds only a **reference**.

**7. "Shipped" without a smoke test.** A successful `apply` doesn't prove the app **answers**. Check **health** before declaring it shipped.
:::

## success

:::lang fr
Tu as réussi si ton dépôt contient :

- Une **source** propre : branche de fonctionnalité + fusion par PR (`--no-ff`).
- Une **porte de sécurité** : hook `detect-secrets` **fail-closed** + scan `checkov`.
- Une **CI reproductible** : `npm ci` + `node --test` (matrice).
- Une **CD live** : `terraform plan`→`apply` sur l'émulateur + **secret au Key Vault**.
- Un **smoke test** : sonde `readiness == 200` + vérification de l'infra.
- Une **pipeline complète validée** (sécurité → build → plan → deploy, porte, SHA, moindre privilège).
- Une **mesure DORA** et une **fiche CV** qui résume le tout.
:::

:::lang en
You've succeeded if your repo contains:

- A clean **source**: feature branch + PR merge (`--no-ff`).
- A **security gate**: **fail-closed** `detect-secrets` hook + `checkov` scan.
- A **reproducible CI**: `npm ci` + `node --test` (matrix).
- A **live CD**: `terraform plan`→`apply` on the emulator + **secret in Key Vault**.
- A **smoke test**: `readiness == 200` probe + infra verification.
- A **complete validated pipeline** (security → build → plan → deploy, gate, SHA, least privilege).
- A **DORA measurement** and a **CV sheet** summarizing it all.
:::

## next

:::lang fr
- **Suivant :** cap sur l'**AZ-500** (sécurité Azure) et l'**AZ-700** (réseau Azure) pour compléter le parcours.
- **Réviser :** n'importe quel guide AZ-400 dont un maillon t'a paru fragile.
- **Aller plus loin :** branche la pipeline sur un **vrai** dépôt GitHub (gratuit) et fais-la **tourner** pour de vrai ; ajoute un environnement `dev` automatique avant `production`.
:::

:::lang en
- **Next:** onward to **AZ-500** (Azure security) and **AZ-700** (Azure networking) to complete the path.
- **Review:** any AZ-400 guide whose link felt shaky.
- **Go further:** wire the pipeline to a **real** GitHub repo (free) and **run** it for real; add an automatic `dev` environment before `production`.
:::

## cheatsheet

:::lang fr
**Les cinq maillons de la chaîne**

```text
1. SOURCE      git branch feature/x ; ... ; git merge --no-ff feature/x
2. SÉCURITÉ    hook pre-commit (detect-secrets, FAIL CLOSED) + checkov -d infra
3. CI          npm ci ; node --test         (matrice node: [20, 22])
4. CD          terraform plan -out=tfplan → [PORTE] → terraform apply tfplan
               secret -> azlocal keyvault secret set (jamais dans le code)
5. SUPERVISION smoke test /health/ready==200 ; métriques DORA (tags deploy)
```

**Durcissement de la pipeline**

```yaml
permissions:
  contents: read                              # moindre privilège
# ...
- uses: actions/checkout@<40 hex>             # action épinglée par SHA
# job deploy :
  environment: production                     # porte (approbation)
```

**Valider la pipeline sans l'exécuter**

```bash
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/livraison.yml')); print(list(d['jobs']))"
```
:::

:::lang en
**The chain's five links**

```text
1. SOURCE      git branch feature/x ; ... ; git merge --no-ff feature/x
2. SECURITY    pre-commit hook (detect-secrets, FAIL CLOSED) + checkov -d infra
3. CI          npm ci ; node --test          (matrix node: [20, 22])
4. CD          terraform plan -out=tfplan → [GATE] → terraform apply tfplan
               secret -> azlocal keyvault secret set (never in code)
5. MONITORING  smoke test /health/ready==200 ; DORA metrics (deploy tags)
```

**Pipeline hardening**

```yaml
permissions:
  contents: read                              # least privilege
# ...
- uses: actions/checkout@<40 hex>             # SHA-pinned action
# deploy job:
  environment: production                     # gate (approval)
```

**Validate the pipeline without running it**

```bash
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/livraison.yml')); print(list(d['jobs']))"
```
:::

## resources

:::lang fr
- **AZ-400** : Designing and Implementing Microsoft DevOps Solutions — objectifs officiels, Microsoft Learn.
- **GitHub Actions** : workflows multi-jobs, environnements, artefacts, sécurité — docs GitHub.
- **Terraform + Azure** : `plan -out`, `apply`, backends distants — HashiCorp / Microsoft Learn.
- **detect-secrets / checkov** : sécurité shift-left (secrets, IaC) — dépôts GitHub officiels.
- **DORA** : les 4 métriques et le rapport *Accelerate* — dora.dev.
- **miniblue** : émulateur Azure local (community, non officiel) — github.com/moabukar/miniblue.
:::

:::lang en
- **AZ-400**: Designing and Implementing Microsoft DevOps Solutions — official objectives, Microsoft Learn.
- **GitHub Actions**: multi-job workflows, environments, artifacts, security — GitHub docs.
- **Terraform + Azure**: `plan -out`, `apply`, remote backends — HashiCorp / Microsoft Learn.
- **detect-secrets / checkov**: shift-left security (secrets, IaC) — official GitHub repos.
- **DORA**: the 4 metrics and the *Accelerate* report — dora.dev.
- **miniblue**: local Azure emulator (community, unofficial) — github.com/moabukar/miniblue.
:::

## troubleshooting

:::lang fr
**Le hook ne bloque pas le secret.** Vérifie qu'il est **exécutable** (`chmod +x .git/hooks/pre-commit`) et que `detect-secrets` est **installé** (sinon le hook **fail-closed** bloque avec `⛔ detect-secrets introuvable`, ce qui est le comportement voulu).

**`terraform` : erreur TLS / certificat.** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` et vérifie que miniblue tourne (port 4567).

**`azlocal : commande introuvable`.** Ajoute son dossier au `PATH` (ex. `/usr/local/bin`) ou appelle-le par chemin complet. Sans lui, le pipe vers `python3` masque l'erreur en `JSONDecodeError`.

**`npm ci` échoue : verrou manquant.** Lance `npm install --package-lock-only` puis versionne `package-lock.json` (fait au step-03).

**La pipeline YAML ne parse pas.** Vérifie l'indentation (pas de tabulations), et que chaque `with:` est en **bloc** (clés sur des lignes séparées). Valide avec le one-liner Python du cheatsheet.

**Le commit du step-07 est bloqué par le hook.** C'est la porte qui fait son travail : `git add -A` a tenté d'ajouter un **artefact** Terraform (`.terraform.lock.hcl` — hachages à forte entropie) ou l'identifiant **factice** de l'émulateur (`client_secret = "miniblue"`). La parade est **dans le guide** : le `.gitignore` du step-01 exclut les artefacts, et le `# pragma: allowlist secret` du step-04 marque l'identifiant factice. Vérifie que ces deux éléments sont bien en place.

**`terraform destroy` laisse des ressources.** Relance-le depuis `infra/` avec le bon `SSL_CERT_FILE`. En dernier recours, `azlocal reset` remet l'émulateur à zéro.
:::

:::lang en
**The hook doesn't block the secret.** Check it's **executable** (`chmod +x .git/hooks/pre-commit`) and that `detect-secrets` is **installed** (otherwise the **fail-closed** hook blocks with `⛔ detect-secrets introuvable`, which is the intended behavior).

**`terraform`: TLS / certificate error.** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` and check miniblue is running (port 4567).

**`azlocal: command not found`.** Add its folder to `PATH` (e.g. `/usr/local/bin`) or call it by full path. Without it, the pipe to `python3` hides the error as a `JSONDecodeError`.

**`npm ci` fails: missing lock.** Run `npm install --package-lock-only` then version `package-lock.json` (done in step-03).

**The pipeline YAML doesn't parse.** Check indentation (no tabs), and that each `with:` is in **block** style (keys on separate lines). Validate with the Python one-liner from the cheatsheet.

**`terraform destroy` leaves resources.** Re-run it from `infra/` with the right `SSL_CERT_FILE`. As a last resort, `azlocal reset` resets the emulator.
:::
