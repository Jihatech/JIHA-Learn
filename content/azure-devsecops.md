---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-devsecops
slug: azure-devsecops
order: 73
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — DevSecOps (AZ-400) : secrets, scan IaC, chaîne d'approvisionnement"
title_en: "Azure — DevSecOps (AZ-400): secrets, IaC scanning, supply chain"
tagline_fr: "détecter les secrets, scanner l'IaC, sécuriser la pipeline."
tagline_en: "detect secrets, scan IaC, secure the pipeline."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 280
repo: "Yelp/detect-secrets"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-iac-pipelines]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [devsecops, secrets, detect-secrets, pre-commit, key-vault, checkov, scan-iac, supply-chain, sha-pinning, az-400]
concepts_en: [devsecops, secrets, detect-secrets, pre-commit, key-vault, checkov, iac-scanning, supply-chain, sha-pinning, az-400]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Sécuriser la chaîne DevOps pour l'AZ-400, en local et pour de vrai : détecter un secret en dur avec detect-secrets, le bloquer AVANT le commit via un hook pre-commit (shift-left), gérer les secrets correctement dans un coffre Key Vault (live sur miniblue : set/show/list), scanner l'IaC avec checkov (12 problèmes trouvés sur un stockage non durci, puis 0 après correction), et bâtir une pipeline Sécurité (scan de secrets + IaC + dépendances) au moindre privilège, avec des actions épinglées par SHA. Plus la chaîne d'approvisionnement (SBOM, pinning). Sans compte cloud.",
og_description_en: "Securing the DevOps chain for AZ-400, locally and for real: detect a hardcoded secret with detect-secrets, block it BEFORE the commit via a pre-commit hook (shift-left), manage secrets properly in a Key Vault (live on miniblue: set/show/list), scan IaC with checkov (12 issues found on an un-hardened storage, then 0 after fixing), and build a Security pipeline (secret + IaC + dependency scanning) with least privilege and SHA-pinned actions. Plus supply chain (SBOM, pinning). No cloud account."
---

## intro

:::lang fr
Tes pipelines **construisent, testent et déploient** (guides précédents). Il manque le **S** de **DevSecOps** : intégrer la **sécurité** dans la chaîne, tôt et automatiquement — pas comme une étape finale qu'on subit. C'est un pilier de l'**AZ-400** : gestion des **secrets**, **analyse statique** de l'IaC et des dépendances, sécurité de la **chaîne d'approvisionnement**.

Fidèle à la méthode, on le fait **en vrai et en local**, avec des outils **open-source** standards : on **détecte un secret** codé en dur (`detect-secrets`), on le **bloque avant le commit** avec un hook **pre-commit** (le fameux *shift-left*), puis on gère les secrets **correctement** dans un **coffre Key Vault** — live sur **miniblue** (`set` / `show` / `list`). On **scanne l'IaC** avec **checkov** : sur un compte de stockage non durci, il trouve **12 problèmes** ; après correction, **0**. On assemble une **pipeline Sécurité** (scan de secrets + IaC + dépendances) au **moindre privilège** et avec des **actions épinglées par SHA**. Enfin, la **chaîne d'approvisionnement** : SBOM, pinning, scan des dépendances.

**Pour qui c'est :** tu as des pipelines qui déploient (guides AZ-400 précédents) et tu veux les **sécuriser**.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas encore de pipeline IaC → fais d'abord *Azure — l'IaC dans les pipelines (AZ-400)*.
- Tu cherches la sécurité **runtime** (Defender, WAF) → c'est plutôt l'**AZ-500** ; ici c'est la sécurité **de la pipeline**.
:::

:::lang en
Your pipelines **build, test and deploy** (previous guides). The **S** of **DevSecOps** is missing: baking **security** into the chain, early and automatically — not as a final step you endure. It's an **AZ-400** pillar: **secrets** management, **static analysis** of IaC and dependencies, **supply chain** security.

True to the method, we do it **for real and locally**, with standard **open-source** tools: we **detect a hardcoded secret** (`detect-secrets`), **block it before the commit** with a **pre-commit** hook (the famous *shift-left*), then manage secrets **properly** in a **Key Vault** — live on **miniblue** (`set` / `show` / `list`). We **scan IaC** with **checkov**: on an un-hardened storage account it finds **12 issues**; after fixing, **0**. We assemble a **Security pipeline** (secret + IaC + dependency scanning) with **least privilege** and **SHA-pinned actions**. Finally, the **supply chain**: SBOM, pinning, dependency scanning.

**Who it's for:** you have pipelines that deploy (previous AZ-400 guides) and want to **secure** them.

**When it's NOT the right choice:**

- You don't have an IaC pipeline yet → do *Azure — IaC in pipelines (AZ-400)* first.
- You want **runtime** security (Defender, WAF) → that's more **AZ-500**; here it's **pipeline** security.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- **Détecter** un secret codé en dur avec `detect-secrets`.
- **Bloquer** un secret **avant** le commit avec un hook **pre-commit** (shift-left).
- Gérer les secrets **correctement** dans un **Key Vault** (set / show / list).
- **Scanner l'IaC** avec **checkov** et **corriger** les problèmes trouvés.
- Bâtir une pipeline **Sécurité** (secrets + IaC + dépendances).
- Appliquer le **moindre privilège** (`permissions`) et **épingler les actions par SHA**.
- Comprendre la sécurité de la **chaîne d'approvisionnement** (SBOM, pinning).
:::

:::lang en
By the end of this guide, you can:

- **Detect** a hardcoded secret with `detect-secrets`.
- **Block** a secret **before** the commit with a **pre-commit** hook (shift-left).
- Manage secrets **properly** in a **Key Vault** (set / show / list).
- **Scan IaC** with **checkov** and **fix** the issues found.
- Build a **Security** pipeline (secrets + IaC + dependencies).
- Apply **least privilege** (`permissions`) and **pin actions by SHA**.
- Understand **supply chain** security (SBOM, pinning).
:::

## prerequisites

:::lang fr
- Le guide **Azure — l'IaC dans les pipelines (AZ-400)** (Terraform, checkov utile).
- **Python 3** + `pip`, et deux outils open-source : `pip install detect-secrets checkov` (installation locale, hors ligne une fois téléchargés).
- Le **lab local** : **miniblue** démarré (port 4567) pour la partie **Key Vault** (`azlocal keyvault`).
- **Git** et un **terminal**. **Aucun compte cloud** : tout est local.
:::

:::lang en
- The **Azure — IaC in pipelines (AZ-400)** guide (Terraform, checkov handy).
- **Python 3** + `pip`, and two open-source tools: `pip install detect-secrets checkov` (local install, offline once downloaded).
- The **local lab**: **miniblue** started (port 4567) for the **Key Vault** part (`azlocal keyvault`).
- **Git** and a **terminal**. **No cloud account**: everything is local.
:::

## concepts

:::lang fr
**DevSecOps : décaler la sécurité à gauche (*shift-left*).** Dans un flux classique, la sécurité arrive **en dernier** — trop tard, trop cher. DevSecOps la **déplace tôt** : dès l'écriture du code et à **chaque commit**, des contrôles automatiques cherchent secrets, mauvaises configs et dépendances vulnérables. La sécurité devient une **responsabilité partagée**, intégrée à la pipeline.

**Les secrets : le risque n°1.** Un mot de passe, une clé d'API, un jeton **codé en dur** dans le dépôt = fuite quasi certaine (les dépôts sont clonés, publiés, indexés). Deux défenses : (1) **détecter** — un scanner (`detect-secrets`) repère les motifs et les chaînes à forte entropie ; (2) **prévenir** — un **hook pre-commit** **bloque** le commit s'il contient un secret. Et la bonne pratique : ne **jamais** mettre le secret dans le code — le stocker dans un **coffre** (**Key Vault**) et l'**injecter** au moment de l'exécution.

**Le coffre (Key Vault).** Un service qui **stocke** secrets, clés et certificats, avec contrôle d'accès et audit. Le code ne contient qu'une **référence** ; la valeur est lue au runtime (via identité managée en vrai Azure). On teste `set` / `show` / `list` en local sur miniblue.

**L'analyse statique (SAST & IaC scanning).** Analyser le **code** (et l'**IaC**) **sans l'exécuter** pour trouver des failles. Pour l'infra, **checkov** compare ton Terraform/Bicep à des **centaines de règles** (HTTPS forcé, TLS récent, accès public fermé, chiffrement…). Il tourne **hors ligne**, en **gate de CI** : un `Failed checks: N` fait échouer le job jusqu'à correction.

**Le scan des dépendances.** Ton app dépend de bibliothèques ; certaines ont des **vulnérabilités connues** (CVE). Un scanner (`npm audit`, `pip-audit`, Dependabot) les **signale**. En pipeline, on échoue au-dessus d'un **seuil** de sévérité (`--audit-level=high`).

**La chaîne d'approvisionnement (supply chain).** Tout ce dont dépend ta build : dépendances, images de base, **actions** de CI. Risques : une action de tierce partie compromise, une image piégée. Défenses : **épingler par SHA** (pas par tag mouvant — `@v4` peut changer, `@<sha40>` non), **moindre privilège** (`permissions: contents: read`), un **SBOM** (inventaire des composants) pour la traçabilité.

**Ce qui est live ici.** `detect-secrets` **scanne** de vrais fichiers et **trouve** de vrais secrets ; le **hook pre-commit** **bloque** réellement un commit ; **Key Vault** sur miniblue **stocke et restitue** un secret (`set`/`show`/`list`) ; **checkov** **analyse** ton Terraform et **compte** les problèmes (12 → 0). Les **pipelines de sécurité** (GitHub Actions) se **valident** en local ; leur **exécution** sur runner cible un vrai dépôt. Tout s'apprend **sans compte cloud**.
:::

:::lang en
**DevSecOps: shifting security left.** In a classic flow, security comes **last** — too late, too costly. DevSecOps **moves it early**: from the moment code is written and on **every commit**, automated checks look for secrets, misconfigurations and vulnerable dependencies. Security becomes a **shared responsibility**, baked into the pipeline.

**Secrets: risk #1.** A password, an API key, a **hardcoded** token in the repo = near-certain leak (repos get cloned, published, indexed). Two defenses: (1) **detect** — a scanner (`detect-secrets`) spots patterns and high-entropy strings; (2) **prevent** — a **pre-commit hook** **blocks** the commit if it contains a secret. And the good practice: **never** put the secret in code — store it in a **vault** (**Key Vault**) and **inject** it at runtime.

**The vault (Key Vault).** A service that **stores** secrets, keys and certificates, with access control and audit. Code holds only a **reference**; the value is read at runtime (via managed identity in real Azure). We test `set` / `show` / `list` locally on miniblue.

**Static analysis (SAST & IaC scanning).** Analyze the **code** (and **IaC**) **without running it** to find flaws. For infra, **checkov** compares your Terraform/Bicep to **hundreds of rules** (HTTPS enforced, recent TLS, public access closed, encryption…). It runs **offline**, as a **CI gate**: a `Failed checks: N` fails the job until fixed.

**Dependency scanning.** Your app depends on libraries; some have **known vulnerabilities** (CVEs). A scanner (`npm audit`, `pip-audit`, Dependabot) **flags** them. In a pipeline, you fail above a severity **threshold** (`--audit-level=high`).

**The supply chain.** Everything your build depends on: dependencies, base images, CI **actions**. Risks: a compromised third-party action, a poisoned image. Defenses: **pin by SHA** (not a movable tag — `@v4` can change, `@<sha40>` can't), **least privilege** (`permissions: contents: read`), an **SBOM** (component inventory) for traceability.

**What's live here.** `detect-secrets` **scans** real files and **finds** real secrets; the **pre-commit hook** actually **blocks** a commit; **Key Vault** on miniblue **stores and returns** a secret (`set`/`show`/`list`); **checkov** **analyzes** your Terraform and **counts** the issues (12 → 0). The **security pipelines** (GitHub Actions) are **validated** locally; **running** them on a runner targets a real repo. It all learns **without a cloud account**.
:::

:::figure azure-devsecops-chain
caption_fr: "Schéma 1. La chaîne DevSecOps : à l'écriture, un hook PRE-COMMIT bloque tout SECRET (detect-secrets) — les secrets vont au COFFRE (Key Vault), pas dans le code. À chaque push, la pipeline SÉCURITÉ scanne en parallèle : secrets, IaC (checkov), dépendances (audit). Au moindre privilège (permissions: read) et actions épinglées par SHA. La sécurité est décalée À GAUCHE, automatique, à chaque étape."
caption_en: "Figure 1. The DevSecOps chain: at writing time, a PRE-COMMIT hook blocks any SECRET (detect-secrets) — secrets go to the VAULT (Key Vault), not into code. On every push, the SECURITY pipeline scans in parallel: secrets, IaC (checkov), dependencies (audit). With least privilege (permissions: read) and SHA-pinned actions. Security is shifted LEFT, automatic, at every stage."
:::

## walkthrough

:::lang fr
On avance ainsi : détecter un secret → le bloquer avant commit (hook) → secrets au coffre (Key Vault) → scanner l'IaC (checkov, 12 problèmes) → corriger et re-scanner (0) → pipeline Sécurité (moindre privilège, SHA) → chaîne d'approvisionnement & récap.
:::

:::lang en
We'll go like this: detect a secret → block it before commit (hook) → secrets to the vault (Key Vault) → scan IaC (checkov, 12 issues) → fix and re-scan (0) → Security pipeline (least privilege, SHA) → supply chain & recap.
:::

### step-01

:::lang fr
**Objectif.** **Détecter** un secret codé en dur avec `detect-secrets`.

**🤔 On ne peut protéger que ce qu'on voit.** Avant tout, apprends à **repérer** un secret. `detect-secrets` scanne un fichier et signale clés d'API, jetons et chaînes à forte entropie. On crée un fichier fautif et on le scanne.

Installe l'outil, crée un fichier fautif, scanne :
:::

:::lang en
**Goal.** **Detect** a hardcoded secret with `detect-secrets`.

**🤔 You can only protect what you can see.** First, learn to **spot** a secret. `detect-secrets` scans a file and flags API keys, tokens and high-entropy strings. We create an offending file and scan it.

Install the tool, create an offending file, scan:
:::

```bash
pip install detect-secrets checkov    # outils DevSecOps open-source / open-source DevSecOps tools

mkdir -p devsecops && cd devsecops
cat > config.py <<'PY'
DB_HOST = "localhost"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
API_TOKEN = "ghp_1234567890abcdefghijklmnopqrstuvwxyzAB"
PY

detect-secrets scan config.py \
  | python3 -c "import sys,json; d=json.load(sys.stdin); [print(f'{f}:{r[\"line_number\"]}  {r[\"type\"]}') for f,res in d['results'].items() for r in res]"
```

:::lang fr
**✅ Vérification :** la sortie liste plusieurs détections, dont `config.py:2  AWS Access Key`, `config.py:3  GitHub Token`, et des `Base64 High Entropy String`. `detect-secrets` a **repéré** les secrets en dur — clés reconnues **et** chaînes suspectes par entropie. C'est le radar. Mais détecter **après** commit, c'est déjà trop tard : on va **prévenir**.
:::

:::lang en
**✅ Check:** the output lists several detections, including `config.py:2  AWS Access Key`, `config.py:3  GitHub Token`, and `Base64 High Entropy String`s. `detect-secrets` **spotted** the hardcoded secrets — known key formats **and** entropy-suspicious strings. That's the radar. But detecting **after** commit is already too late: we'll **prevent**.
:::

### step-02

:::lang fr
**Objectif.** **Bloquer** un secret **avant** le commit — un hook **pre-commit** (shift-left).

**🤔 Empêcher, pas seulement constater.** Un **hook pre-commit** est un script que Git lance **avant** d'enregistrer un commit. S'il détecte un secret, il **refuse** (`exit 1`) : le secret n'entre **jamais** dans l'historique. On installe le hook, on tente un commit fautif, puis un commit propre.

Installe le hook, teste le blocage :
:::

:::lang en
**Goal.** **Block** a secret **before** the commit — a **pre-commit** hook (shift-left).

**🤔 Prevent, not just observe.** A **pre-commit hook** is a script Git runs **before** recording a commit. If it detects a secret, it **refuses** (`exit 1`): the secret **never** enters history. We install the hook, attempt an offending commit, then a clean one.

Install the hook, test the block:
:::

```bash
git init -q && git config user.email you@example.com && git config user.name student

cat > .git/hooks/pre-commit <<'HOOK'
#!/bin/sh
# Un contrôle de sécurité doit ÉCHOUER FERMÉ / a security control must FAIL CLOSED.
# Si l'outil manque, on bloque (on ne laisse pas passer par défaut).
if ! command -v detect-secrets >/dev/null 2>&1; then
  echo "⛔ detect-secrets introuvable — commit bloqué par sécurité (installe-le / ajoute-le au PATH)."
  exit 1
fi
for f in $(git diff --cached --name-only); do
  [ -f "$f" ] || continue
  N=$(detect-secrets scan "$f" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(sum(len(v) for v in d['results'].values()))" 2>/dev/null)
  [ -z "$N" ] && N=-1   # scan échoué -> traiter comme suspect / failed scan -> treat as suspect
  if [ "$N" -ne 0 ]; then
    echo "❌ SECRET détecté (ou scan impossible) dans $f — commit bloqué (utilise Key Vault, pas de secret en dur)."
    exit 1
  fi
done
echo "✅ Aucun secret détecté."
HOOK
chmod +x .git/hooks/pre-commit

# Tentative fautive / offending attempt
git add config.py
git commit -m "ajout config" ; echo "resultat commit fautif / offending commit result: $?"

# Version propre (le secret vient de l'environnement) / clean version (secret from env)
cat > config.py <<'PY'
import os
DB_HOST = "localhost"
API_TOKEN = os.environ["API_TOKEN"]   # injecté au runtime, jamais en dur
PY
git add config.py
git commit -m "ajout config (sans secret)" ; echo "resultat commit propre / clean commit result: $?"
```

:::lang fr
**✅ Vérification :** le **premier** commit est **refusé** — tu vois `❌ SECRET détecté dans config.py — commit bloqué` et `resultat commit fautif: 1` (Git a **rejeté** l'enregistrement). Après avoir remplacé le secret par une **lecture d'environnement**, le **second** commit **passe** (`resultat commit propre: 0`). Le secret n'est **jamais** entré dans l'historique : c'est le *shift-left*. En équipe, on utilise le framework `pre-commit` (fichier `.pre-commit-config.yaml`) ; le principe est identique.
:::

:::lang en
**✅ Check:** the **first** commit is **refused** — you see `❌ SECRET détecté dans config.py — commit bloqué` and `resultat commit fautif: 1` (Git **rejected** the record). After replacing the secret with an **environment read**, the **second** commit **passes** (`resultat commit propre: 0`). The secret **never** entered history: that's *shift-left*. In a team you'd use the `pre-commit` framework (a `.pre-commit-config.yaml` file); the principle is identical.
:::

### step-03

:::lang fr
**Objectif.** Gérer les secrets **correctement** — dans un **Key Vault** (live sur miniblue).

**🤔 Le secret vit dans le coffre, pas dans le code.** Si le code ne doit **jamais** contenir le secret, où va-t-il ? Dans un **coffre** : on l'y **dépose** (`set`), le code garde une **référence**, et on le **lit** au runtime. On teste le cycle sur miniblue.

Dépose, liste, relis un secret :
:::

:::lang en
**Goal.** Manage secrets **properly** — in a **Key Vault** (live on miniblue).

**🤔 The secret lives in the vault, not in code.** If code must **never** hold the secret, where does it go? In a **vault**: you **deposit** it (`set`), code keeps a **reference**, and you **read** it at runtime. We test the cycle on miniblue.

Deposit, list, re-read a secret:
:::

```bash
# Déposer le secret dans le coffre / deposit the secret in the vault
azlocal keyvault secret set --vault kv-devsecops --name api-token --value "ghp_secret_du_lab_123" 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('déposé / stored:', d['id'])"

# Lister les secrets du coffre / list the vault's secrets
azlocal keyvault secret list --vault kv-devsecops 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('secrets:', [s['id'].split('/')[-1] for s in d['value']])"

# Relire la valeur (ce que fait l'app au runtime) / read the value (what the app does at runtime)
azlocal keyvault secret show --vault kv-devsecops --name api-token 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('valeur lue / value read:', d['value'])"
```

:::lang fr
**✅ Vérification :** `set` renvoie `déposé / stored: https://kv-devsecops.vault.azure.net/secrets/api-token`, `list` affiche `secrets: ['api-token']`, et `show` renvoie `valeur lue / value read: ghp_secret_du_lab_123`. Le secret vit dans le **coffre** ; le code ne contient qu'une **référence** (le nom). En vrai Azure, l'app lit le coffre via une **identité managée** (pas de secret pour accéder au secret). ⚠️ miniblue **stocke la valeur en clair** pour la démo — un vrai Key Vault la **chiffre** et **journalise** les accès.
:::

:::lang en
**✅ Check:** `set` returns `déposé / stored: https://kv-devsecops.vault.azure.net/secrets/api-token`, `list` shows `secrets: ['api-token']`, and `show` returns `valeur lue / value read: ghp_secret_du_lab_123`. The secret lives in the **vault**; code holds only a **reference** (the name). In real Azure, the app reads the vault via a **managed identity** (no secret to access the secret). ⚠️ miniblue **stores the value in clear** for the demo — a real Key Vault **encrypts** it and **audits** access.
:::

### step-04

:::lang fr
**Objectif.** **Scanner l'IaC** avec **checkov** — trouver les mauvaises configurations.

**🤔 Une infra peut être « valide » et **non sécurisée**.** `terraform validate` dit que la **syntaxe** est bonne ; il ne dit **rien** de la sécurité. **checkov** compare ton code à des **centaines de règles**. On écrit un compte de stockage **volontairement non durci** et on le scanne.

Écris une infra non durcie et scanne-la :
:::

:::lang en
**Goal.** **Scan IaC** with **checkov** — find misconfigurations.

**🤔 Infra can be "valid" and **insecure**.** `terraform validate` says the **syntax** is fine; it says **nothing** about security. **checkov** compares your code to **hundreds of rules**. We write a **deliberately un-hardened** storage account and scan it.

Write un-hardened infra and scan it:
:::

```bash
mkdir -p infra
cat > infra/main.tf <<'TF'
resource "azurerm_storage_account" "insecure" {
  name                     = "stinsecure001"
  resource_group_name      = "rg-demo"
  location                 = "westeurope"
  account_tier             = "Standard"
  account_replication_type = "LRS"
  enable_https_traffic_only = false   # PROBLEME : HTTPS non forcé / HTTPS not enforced
  min_tls_version           = "TLS1_0" # PROBLEME : TLS obsolète / obsolete TLS
}
TF

checkov -d infra --compact --quiet -o cli 2>/dev/null | grep -E "Passed checks|Failed checks"
echo "--- exemples de règles échouées / sample failed rules ---"
checkov -d infra --compact --quiet -o cli 2>/dev/null | grep -E "CKV_AZURE_3:|CKV_AZURE_44:"
```

:::lang fr
**✅ Vérification :** checkov affiche `Passed checks: 3, Failed checks: 12` (l'infra est **valide** mais **non sécurisée**) et pointe des règles comme `CKV_AZURE_3: "Ensure that 'enable_https_traffic_only' is enabled"` et `CKV_AZURE_44: "Ensure Storage Account is using the latest version of TLS"`. C'est le **gate de sécurité IaC** : en pipeline, `Failed checks > 0` fait **échouer** le job. On corrige à l'étape suivante.
:::

:::lang en
**✅ Check:** checkov shows `Passed checks: 3, Failed checks: 12` (the infra is **valid** but **insecure**) and points to rules like `CKV_AZURE_3: "Ensure that 'enable_https_traffic_only' is enabled"` and `CKV_AZURE_44: "Ensure Storage Account is using the latest version of TLS"`. That's the **IaC security gate**: in a pipeline, `Failed checks > 0` **fails** the job. We fix it next.
:::

### step-05

:::lang fr
**Objectif.** **Corriger** et **re-scanner** — passer de 12 à 0.

**🤔 Le scan guide la correction.** Chaque règle échouée dit **quoi** durcir. On force HTTPS, on relève le TLS, on ferme l'accès public, et on **re-scanne** : les règles concernées **passent**.

Durcis l'infra et re-scanne :
:::

:::lang en
**Goal.** **Fix** and **re-scan** — go from 12 to 0.

**🤔 The scan guides the fix.** Each failed rule tells you **what** to harden. We enforce HTTPS, raise TLS, close public access, and **re-scan**: the relevant rules **pass**.

Harden the infra and re-scan:
:::

```bash
cat > infra/main.tf <<'TF'
resource "azurerm_storage_account" "secure" {
  name                            = "stsecure001"
  resource_group_name             = "rg-demo"
  location                        = "westeurope"
  account_tier                    = "Standard"
  account_replication_type        = "GRS"
  enable_https_traffic_only       = true      # HTTPS forcé / HTTPS enforced
  min_tls_version                 = "TLS1_2"  # TLS récent / recent TLS
  public_network_access_enabled   = false     # accès public fermé / public access closed
  allow_nested_items_to_be_public = false
}
TF

echo "--- règles HTTPS/TLS après durcissement / HTTPS/TLS rules after hardening ---"
checkov -d infra --check CKV_AZURE_3,CKV_AZURE_44 --compact --quiet 2>/dev/null | grep -E "Passed checks|Failed checks"
```

:::lang fr
**✅ Vérification :** en ne gardant que les deux règles clés, checkov affiche `Passed checks: 2, Failed checks: 0` — HTTPS forcé et TLS récent sont désormais **respectés**. Le durcissement (GRS, accès public fermé, chiffrement récent) fait tomber les problèmes. En pipeline, on peut **exiger** un scan **vert** avant de fusionner. ⚠️ Ne « skippe » une règle (`# checkov:skip=...`) que si tu la **comprends** et l'**assumes** (avec justification).
:::

:::lang en
**✅ Check:** keeping only the two key rules, checkov shows `Passed checks: 2, Failed checks: 0` — HTTPS enforced and recent TLS are now **respected**. Hardening (GRS, public access closed, recent encryption) clears the issues. In a pipeline you can **require** a **green** scan before merging. ⚠️ Only "skip" a rule (`# checkov:skip=...`) if you **understand** and **own** it (with justification).
:::

### step-06

:::lang fr
**Objectif.** Assembler la **pipeline Sécurité** — moindre privilège et actions **épinglées par SHA**.

**🤔 La sécurité, un stage à part entière.** On regroupe les scans (secrets, IaC, dépendances) dans un workflow **Sécurité** qui tourne à **chaque push/PR**. Deux durcissements clés du workflow lui-même : `permissions: contents: read` (**moindre privilège**) et les **actions épinglées par SHA** (immuables). On écrit et on **valide**.

Écris la pipeline Sécurité et valide-la :
:::

:::lang en
**Goal.** Assemble the **Security pipeline** — least privilege and **SHA-pinned** actions.

**🤔 Security, a first-class stage.** We group the scans (secrets, IaC, dependencies) into a **Security** workflow that runs on **every push/PR**. Two key hardenings of the workflow itself: `permissions: contents: read` (**least privilege**) and **SHA-pinned actions** (immutable). We write and **validate**.

Write the Security pipeline and validate it:
:::

```bash
mkdir -p .github/workflows
cat > .github/workflows/securite.yml <<'YAML'
name: Sécurité
on: [push, pull_request]
permissions:
  contents: read            # moindre privilège : lecture seule / least privilege: read-only
jobs:
  secrets:
    name: Scan de secrets
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2 (épinglé par SHA)
      - run: pip install detect-secrets && detect-secrets scan --all-files
  iac:
    name: Scan IaC
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
      - run: pip install checkov && checkov -d infra
  dependances:
    name: Scan des dépendances
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
      - run: npm audit --audit-level=high
YAML

python3 -c "
import yaml, re
d = yaml.safe_load(open('.github/workflows/securite.yml'))
print('jobs:', list(d['jobs'].keys()))
print('moindre privilège / least privilege:', d['permissions'])
pins = [s['uses'].split('@')[1] for j in d['jobs'].values() for s in j['steps'] if 'uses' in s]
print('toutes actions épinglées par SHA / all actions SHA-pinned:', all(re.fullmatch(r'[0-9a-f]{40}', p) for p in pins))
"
```

:::lang fr
**✅ Vérification :** la sortie affiche `jobs: ['secrets', 'iac', 'dependances']`, `moindre privilège / least privilege: {'contents': 'read'}`, et `toutes actions épinglées par SHA / all actions SHA-pinned: True`. Trois scans **en parallèle** à chaque push, un token de workflow **en lecture seule**, des actions **immuables** (un attaquant ne peut pas repousser du code malveillant derrière `@v4`). C'est une pipeline de sécurité **complète**. ⚠️ On **valide** la structure ici ; l'exécution réelle installe et lance les scanners sur le runner.
:::

:::lang en
**✅ Check:** the output shows `jobs: ['secrets', 'iac', 'dependances']`, `moindre privilège / least privilege: {'contents': 'read'}`, and `toutes actions épinglées par SHA / all actions SHA-pinned: True`. Three scans **in parallel** on every push, a **read-only** workflow token, **immutable** actions (an attacker can't push malicious code behind `@v4`). That's a **complete** security pipeline. ⚠️ We **validate** the structure here; real execution installs and runs the scanners on the runner.
:::

### step-07

:::lang fr
**Objectif.** Comprendre la **chaîne d'approvisionnement** (SBOM, pinning, dépendances) et récapituler.

**🤔 Tu hérites de la sécurité de tes dépendances.** Ta build dépend de bibliothèques, d'images et d'actions : leur compromission devient la tienne. Défenses : **scanner les dépendances** (seuil de sévérité), **épingler** par version/SHA, produire un **SBOM** (inventaire) pour savoir **ce qui** tourne. On simule un scan de dépendances et on note les pratiques.

Prépare un manifeste, note le SBOM, récapitule :
:::

:::lang en
**Goal.** Understand the **supply chain** (SBOM, pinning, dependencies) and recap.

**🤔 You inherit your dependencies' security.** Your build depends on libraries, images and actions: their compromise becomes yours. Defenses: **scan dependencies** (severity threshold), **pin** by version/SHA, produce an **SBOM** (inventory) to know **what** runs. We simulate a dependency scan and note the practices.

Prepare a manifest, note the SBOM, recap:
:::

```bash
# Un manifeste avec versions épinglées / a manifest with pinned versions
cat > package.json <<'JSON'
{
  "name": "app",
  "version": "1.0.0",
  "dependencies": {}
}
JSON

# npm audit exige un fichier de verrou / npm audit requires a lockfile
npm install --package-lock-only >/dev/null 2>&1

# Scan des dépendances (seuil de sévérité) / dependency scan (severity threshold)
npm audit --audit-level=high 2>&1 | tail -2

# SBOM : inventaire des composants (concept) / SBOM: component inventory (concept)
echo "SBOM = inventaire signé de TOUS les composants (deps, versions, licences)"
echo "  outils : syft, 'npm sbom', 'az acr' ; format : CycloneDX / SPDX"
echo "Chaîne d'approvisionnement sécurisée = pin par SHA + scan deps + SBOM + moindre privilège"
```

:::lang fr
**✅ Vérification :** `npm audit` répond `found 0 vulnerabilities` (manifeste vide) — en pipeline, un `--audit-level=high` **échouerait** au-dessus d'une vulnérabilité haute/critique. Tu as bouclé la chaîne DevSecOps : **secrets** (détecter, bloquer, coffre), **IaC** (scanner, durcir), **pipeline** (moindre privilège, SHA), **dépendances & SBOM**. La sécurité est désormais **dans** la pipeline, à chaque étape. La suite du track AZ-400 : la **supervision** de la livraison (métriques, alertes, feedback), puis le **projet DevOps** de synthèse.
:::

:::lang en
**✅ Check:** `npm audit` answers `found 0 vulnerabilities` (empty manifest) — in a pipeline, an `--audit-level=high` would **fail** above a high/critical vulnerability. You closed the DevSecOps loop: **secrets** (detect, block, vault), **IaC** (scan, harden), **pipeline** (least privilege, SHA), **dependencies & SBOM**. Security is now **inside** the pipeline, at every stage. Next in the AZ-400 track: delivery **monitoring** (metrics, alerts, feedback), then the capstone **DevOps project**.
:::

## pitfalls

:::lang fr
**1. Détecter sans prévenir — et échouer « ouvert ».** Trouver un secret **après** commit = déjà fuité (l'historique le garde). Mets un **hook pre-commit** (ou un check CI **bloquant**). Et surtout, un contrôle de sécurité doit **échouer fermé** : si l'outil manque ou le scan plante, **bloque** (ne laisse **pas** passer par défaut) — un hook qui « laisse passer » en cas d'erreur est pire qu'inutile.

**2. Secret « chiffré » dans le repo.** Un secret encodé/base64 **reste** un secret. Le seul bon endroit est un **coffre** (Key Vault), pas le dépôt.

**3. Confondre `validate` et sécurité.** `terraform validate` ne vérifie que la syntaxe. La sécurité de l'infra, c'est **checkov** (ou tfsec/trivy).

**4. Skipper les règles pour « passer ».** `# checkov:skip` sans justification = fausse sécurité. Corrige, ou assume explicitement (avec raison).

**5. Actions épinglées par tag mouvant.** `@v4` peut être **réécrit**. Épingle par **SHA** (`@<40 hex>`) — immuable.

**6. Token de workflow trop permissif.** Par défaut, un workflow peut avoir des droits d'écriture. Déclare `permissions: contents: read` et n'élargis **qu'au besoin**.

**7. Ignorer les dépendances.** Le code peut être parfait et **hériter** d'une CVE d'une lib. Scanne (`npm audit`, `pip-audit`, Dependabot) et fixe un **seuil**.
:::

:::lang en
**1. Detect without prevent — and failing "open".** Finding a secret **after** commit = already leaked (history keeps it). Add a **pre-commit hook** (or a **blocking** CI check). And crucially, a security control must **fail closed**: if the tool is missing or the scan crashes, **block** (do **not** let it through by default) — a hook that "lets it through" on error is worse than useless.

**2. An "encrypted" secret in the repo.** An encoded/base64 secret **is still** a secret. The only right place is a **vault** (Key Vault), not the repo.

**3. Confusing `validate` with security.** `terraform validate` only checks syntax. Infra security is **checkov** (or tfsec/trivy).

**4. Skipping rules to "pass".** `# checkov:skip` without justification = fake security. Fix it, or explicitly own it (with a reason).

**5. Actions pinned by a movable tag.** `@v4` can be **rewritten**. Pin by **SHA** (`@<40 hex>`) — immutable.

**6. Over-permissive workflow token.** By default a workflow can have write rights. Declare `permissions: contents: read` and widen **only as needed**.

**7. Ignoring dependencies.** Code can be perfect and **inherit** a CVE from a lib. Scan (`npm audit`, `pip-audit`, Dependabot) and set a **threshold**.
:::

## success

:::lang fr
Tu as réussi si :

- Tu **détectes** un secret avec `detect-secrets`.
- Ton **hook pre-commit** **bloque** un commit contenant un secret.
- Tu **stockes/lis** un secret dans un **Key Vault** (au lieu de le coder en dur).
- Tu **scannes** ton IaC avec **checkov** et **corriges** (12 → 0).
- Tu as une pipeline **Sécurité** (secrets + IaC + dépendances) au **moindre privilège**.
- Tes **actions** sont **épinglées par SHA** et tu sais ce qu'est un **SBOM**.
:::

:::lang en
You've succeeded if:

- You **detect** a secret with `detect-secrets`.
- Your **pre-commit hook** **blocks** a commit containing a secret.
- You **store/read** a secret in a **Key Vault** (instead of hardcoding it).
- You **scan** your IaC with **checkov** and **fix** it (12 → 0).
- You have a **Security** pipeline (secrets + IaC + dependencies) with **least privilege**.
- Your **actions** are **SHA-pinned** and you know what an **SBOM** is.
:::

## next

:::lang fr
- **Suivant :** *Azure — supervision de la livraison (AZ-400)* — métriques (DORA), alertes, boucles de retour.
- **Réviser :** *Azure — l'IaC dans les pipelines (AZ-400)* pour le contexte Terraform/Bicep.
- **S'entraîner :** ajoute le stage **Sécurité** à ta pipeline CI/CD et exige un scan **vert** dans la stratégie de branche.
:::

:::lang en
- **Next:** *Azure — delivery monitoring (AZ-400)* — metrics (DORA), alerts, feedback loops.
- **Review:** *Azure — IaC in pipelines (AZ-400)* for the Terraform/Bicep context.
- **Practice:** add the **Security** stage to your CI/CD pipeline and require a **green** scan in the branch policy.
:::

## cheatsheet

:::lang fr
**Secrets**

```bash
pip install detect-secrets                  # installe le scanner
detect-secrets scan FICHIER                 # scanne un fichier / dossier (--all-files)
# hook : .git/hooks/pre-commit -> scan des fichiers indexés, exit 1 si trouvé
#        FAIL CLOSED : si l'outil manque ou le scan échoue -> bloquer (ne jamais laisser passer)
```

**Coffre (Key Vault, live sur miniblue)**

```bash
azlocal keyvault secret set  --vault V --name N --value "…"   # déposer
azlocal keyvault secret list --vault V                        # lister
azlocal keyvault secret show --vault V --name N               # relire
# le code garde une RÉFÉRENCE (nom), jamais la valeur
```

**Scan IaC (checkov)**

```bash
pip install checkov
checkov -d infra                            # scanne un dossier Terraform/Bicep
checkov -d infra --check CKV_AZURE_3        # une règle précise
checkov -d infra --compact --quiet          # sortie condensée (gate de CI)
```

**Chaîne d'approvisionnement**

```text
- actions épinglées par SHA :  uses: actions/checkout@<40 hex>   # pas @v4
- moindre privilège :           permissions: { contents: read }
- scan des dépendances :        npm audit --audit-level=high
- SBOM :                        syft / npm sbom (format CycloneDX / SPDX)
```
:::

:::lang en
**Secrets**

```bash
pip install detect-secrets                  # install the scanner
detect-secrets scan FILE                    # scan a file / folder (--all-files)
# hook: .git/hooks/pre-commit -> scan staged files, exit 1 if found
#       FAIL CLOSED: if the tool is missing or the scan fails -> block (never let it through)
```

**Vault (Key Vault, live on miniblue)**

```bash
azlocal keyvault secret set  --vault V --name N --value "…"   # deposit
azlocal keyvault secret list --vault V                        # list
azlocal keyvault secret show --vault V --name N               # re-read
# code keeps a REFERENCE (name), never the value
```

**IaC scan (checkov)**

```bash
pip install checkov
checkov -d infra                            # scan a Terraform/Bicep folder
checkov -d infra --check CKV_AZURE_3        # a specific rule
checkov -d infra --compact --quiet          # condensed output (CI gate)
```

**Supply chain**

```text
- SHA-pinned actions:  uses: actions/checkout@<40 hex>   # not @v4
- least privilege:     permissions: { contents: read }
- dependency scan:     npm audit --audit-level=high
- SBOM:                syft / npm sbom (CycloneDX / SPDX format)
```
:::

## resources

:::lang fr
- **detect-secrets** (Yelp) : scan de secrets, baseline, hook — dépôt GitHub `Yelp/detect-secrets`.
- **pre-commit** : framework de hooks Git (`.pre-commit-config.yaml`) — pre-commit.com.
- **checkov** (Prisma/Bridgecrew) : scan IaC (Terraform, Bicep, ARM, K8s) — docs checkov.
- **Azure Key Vault** : secrets, clés, certificats ; accès par identité managée — Microsoft Learn.
- **Sécurité GitHub Actions** : `permissions`, épinglage par SHA, `GITHUB_TOKEN` — docs GitHub.
- **SBOM & supply chain** : SLSA, CycloneDX, SPDX, `syft` — pour la traçabilité des composants.
:::

:::lang en
- **detect-secrets** (Yelp): secret scanning, baseline, hook — GitHub repo `Yelp/detect-secrets`.
- **pre-commit**: Git hooks framework (`.pre-commit-config.yaml`) — pre-commit.com.
- **checkov** (Prisma/Bridgecrew): IaC scanning (Terraform, Bicep, ARM, K8s) — checkov docs.
- **Azure Key Vault**: secrets, keys, certificates; access via managed identity — Microsoft Learn.
- **GitHub Actions security**: `permissions`, SHA pinning, `GITHUB_TOKEN` — GitHub docs.
- **SBOM & supply chain**: SLSA, CycloneDX, SPDX, `syft` — for component traceability.
:::

## troubleshooting

:::lang fr
**`detect-secrets : commande introuvable`.** Installe-le : `pip install detect-secrets`. Si `pip` l'installe dans `~/.local/bin` hors PATH, ajoute ce dossier au `PATH` ou lance `python3 -m detect_secrets`.

**Le hook pre-commit ne se déclenche pas.** Vérifie qu'il est **exécutable** (`chmod +x .git/hooks/pre-commit`) et bien nommé (`pre-commit`, sans extension). Il ne s'applique qu'au dépôt local (pas partagé par `git clone` — d'où le framework `pre-commit` en équipe).

**`checkov` très bavard / trop de règles.** Utilise `--compact --quiet`, cible des règles (`--check CKV_...`) ou un framework (`--framework terraform`). Pour ignorer une règle **assumée** : commentaire `# checkov:skip=CKV_AZURE_X: raison`.

**`azlocal keyvault` : `--vault is required`.** Le drapeau est `--vault` (pas `--vault-name`). Vérifie aussi que miniblue tourne (port 4567).

**`npm audit` : `requires existing shrinkwrap file`.** L'audit a besoin d'un **fichier de verrou**. Génère-le d'abord : `npm install --package-lock-only`. (Sans réseau, l'audit peut aussi échouer car il interroge le registre npm ; en pipeline, le runner a le réseau.)

**checkov signale des règles sur du code de démo.** C'est normal : nos exemples sont **minimalistes**. En vrai, corrige ou assume chaque règle ; ne vise pas « zéro finding » à tout prix, vise « **zéro finding non justifié** ».
:::

:::lang en
**`detect-secrets: command not found`.** Install it: `pip install detect-secrets`. If `pip` installs it into `~/.local/bin` off PATH, add that folder to `PATH` or run `python3 -m detect_secrets`.

**The pre-commit hook doesn't fire.** Check it's **executable** (`chmod +x .git/hooks/pre-commit`) and correctly named (`pre-commit`, no extension). It only applies to the local repo (not shared by `git clone` — hence the `pre-commit` framework for teams).

**`checkov` very verbose / too many rules.** Use `--compact --quiet`, target rules (`--check CKV_...`) or a framework (`--framework terraform`). To ignore an **owned** rule: comment `# checkov:skip=CKV_AZURE_X: reason`.

**`azlocal keyvault`: `--vault is required`.** The flag is `--vault` (not `--vault-name`). Also check miniblue is running (port 4567).

**`npm audit` fails offline.** The audit queries the npm registry; offline it can fail. In local learning, keep the **principle** (severity threshold); in a pipeline, the runner has network.

**checkov flags rules on demo code.** That's normal: our examples are **minimal**. In reality, fix or own each rule; don't chase "zero findings" at all costs, aim for "**zero unjustified findings**".
:::
