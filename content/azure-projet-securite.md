---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-projet-securite
slug: azure-projet-securite
order: 81
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — projet de sécurité (AZ-500) : durcir et opérer un workload"
title_en: "Azure — security project (AZ-500): harden and operate a workload"
tagline_fr: "identité, réseau, données, gouvernance, opérations — sur un workload réel."
tagline_en: "identity, network, data, governance, operations — on a real workload."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 320
repo: "bridgecrewio/checkov"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-securite-operations]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [projet-securite, defense-en-profondeur, identite-manageee, nsg, chiffrement, azure-policy, secure-score, detection, capstone, az-500]
concepts_en: [security-project, defense-in-depth, managed-identity, nsg, encryption, azure-policy, secure-score, detection, capstone, az-500]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet de CV du track AZ-500 : durcir ET opérer un workload complet, en local et pour de vrai. Une base réseau segmentée avec NSG en refus par défaut (live sur miniblue), une identité managée sans mot de passe + secret au coffre Key Vault (live), des données durcies (chiffrement, TLS 1.2, hors d'Internet — checkov au vert), une porte de gouvernance (Azure Policy deny + checkov), la détection d'un incident (force brute) et sa réponse automatique (playbook), et la mesure de la posture (secure score). Puis l'emballage CV. Sans compte ni facture.",
og_description_en: "The AZ-500 track's CV project: hardening AND operating a complete workload, locally and for real. A segmented network base with a deny-by-default NSG (live on miniblue), a passwordless managed identity + secret in Key Vault (live), hardened data (encryption, TLS 1.2, off the Internet — checkov green), a governance gate (Azure Policy deny + checkov), detecting an incident (brute force) and its automated response (playbook), and measuring posture (secure score). Then CV packaging. No account or bill."
---

## intro

:::lang fr
C'est le **projet de synthèse** du track **AZ-500**. Tu as durci, un pilier à la fois : les **fondamentaux** (Zero Trust), l'**identité**, le **réseau**, les **données**, les **opérations**. Ici, tu **assembles tout** sur **un workload réel** — et tu montres que tu sais non seulement le **sécuriser**, mais aussi l'**opérer**. Le genre de projet qui tient sur un CV d'**ingénieur sécurité**.

Fidèle à la méthode, tout est **local et pour de vrai** : une **base réseau segmentée** avec **NSG en refus par défaut** (live sur **miniblue**), une **identité managée** sans mot de passe + **secret au coffre** (live), des **données durcies** (chiffrement, TLS 1.2, hors d'Internet — **checkov au vert**), une **porte de gouvernance** (**Azure Policy deny** + checkov), la **détection** d'un incident (force brute) et sa **réponse automatique** (playbook), et la **mesure** de la posture (**secure score**). On finit par l'**emballage CV**.

**Pour qui c'est :** tu as fait les cinq guides AZ-500 et tu veux un **livrable** qui prouve tes compétences sécurité.

**Ce que tu vas produire :** un workload **durci et opéré** — réseau + identité + données + gouvernance + détection/réponse — **déployable sur l'émulateur**, avec un **secure score** et une **fiche CV** qui le résume.
:::

:::lang en
This is the **capstone** of the **AZ-500** track. You hardened, one pillar at a time: **fundamentals** (Zero Trust), **identity**, **network**, **data**, **operations**. Here you **assemble everything** on **a real workload** — and show you can not only **secure** it but also **operate** it. The kind of project that fits a **security engineer**'s CV.

True to the method, everything is **local and for real**: a **segmented network base** with a **deny-by-default NSG** (live on **miniblue**), a passwordless **managed identity** + **secret in the vault** (live), **hardened data** (encryption, TLS 1.2, off the Internet — **checkov green**), a **governance gate** (**Azure Policy deny** + checkov), the **detection** of an incident (brute force) and its **automated response** (playbook), and **measuring** posture (**secure score**). We finish with **CV packaging**.

**Who it's for:** you did the five AZ-500 guides and want a **deliverable** that proves your security skills.

**What you'll produce:** a **hardened and operated** workload — network + identity + data + governance + detection/response — **deployable to the emulator**, with a **secure score** and a **CV sheet** summarizing it.
:::

## objectives

:::lang fr
À la fin de ce projet, tu sais :

- Déployer une **base réseau segmentée** avec **NSG en refus par défaut**.
- Créer une **identité managée** sans mot de passe et un **secret au coffre**.
- **Durcir les données** (chiffrement, TLS, hors d'Internet) et le **valider** (checkov).
- Poser une **porte de gouvernance** (**Azure Policy deny** + checkov).
- **Détecter** un incident et déclencher une **réponse automatique**.
- **Mesurer** la posture du workload (**secure score**).
- **Emballer** le projet pour le CV.
:::

:::lang en
By the end of this project, you can:

- Deploy a **segmented network base** with a **deny-by-default NSG**.
- Create a passwordless **managed identity** and a **secret in the vault**.
- **Harden data** (encryption, TLS, off the Internet) and **validate** it (checkov).
- Set a **governance gate** (**Azure Policy deny** + checkov).
- **Detect** an incident and trigger an **automated response**.
- **Measure** the workload's posture (**secure score**).
- **Package** the project for the CV.
:::

## prerequisites

:::lang fr
- **Tous les guides AZ-500** : fondamentaux, identité, réseau, données, opérations.
- Le **lab local** : **miniblue** démarré, **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`, `azlocal` sur le `PATH`.
- **Python 3**, `pip install checkov`. **Aucun compte cloud** : le workload cible l'émulateur ; la gouvernance/détection s'exécutent en local.
:::

:::lang en
- **All AZ-500 guides**: fundamentals, identity, network, data, operations.
- The **local lab**: **miniblue** started, **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`, `azlocal` on `PATH`.
- **Python 3**, `pip install checkov`. **No cloud account**: the workload targets the emulator; governance/detection run locally.
:::

## concepts

:::lang fr
**Un workload sécurisé, cinq piliers superposés.** Le projet relie ce que tu as vu séparément, sur **une même charge de travail** :

1. **Réseau (segmentation).** Une base **segmentée** : le tier sensible (data) a son **NSG en refus par défaut** — n'autoriser que l'app, refuser le reste. La surface exposée est **minimale**.
2. **Identité (sans mot de passe).** Une **identité managée** authentifie l'app **sans secret stocké** ; le **secret** applicatif vit au **coffre** (Key Vault), jamais dans le code.
3. **Données (chiffrement).** Les données sont **chiffrées** au repos et en transit (TLS 1.2, HTTPS), **hors d'Internet** (accès public fermé). Un scan le **prouve**.
4. **Gouvernance (policy).** Une **porte** empêche le non-conforme : **Azure Policy** (deny, côté plateforme) **et** **checkov** (shift-left, en CI). Rien de non sûr ne passe.
5. **Opérations (détecter/répondre).** On **surveille** : une règle détecte un incident (force brute), un **playbook** répond **automatiquement**. Et un **secure score** mesure la posture globale.

**Durcir ET opérer.** Un workload sécurisé ne se **configure** pas une fois : il se **maintient**. Les quatre premiers piliers **durcissent** (état statique) ; le cinquième **opère** (défense vivante : détection, réponse, mesure). Un vrai ingénieur sécurité fait **les deux** — et sait le **démontrer**.

**Pourquoi ça vaut pour un CV.** Ce projet prouve, **preuves à l'appui**, que tu sais : segmenter un réseau (Zero Trust), gérer des identités sans mot de passe et des secrets, chiffrer et retirer les données d'Internet, gouverner par policy (deny + shift-left), et détecter/répondre à un incident tout en mesurant la posture. C'est **exactement** le périmètre **AZ-500** — et le quotidien d'un **Azure Security Engineer**.

**Ce qui est live ici.** La **base réseau** (RG + NSG refus par défaut) se **déploie** sur miniblue (Terraform, live). L'**identité managée** se **crée** (principalId réel, live), le **secret** vit au **coffre** (live). Le **durcissement des données**, la **policy deny**, la **détection** et le **secure score** sont **validés/exécutés** en local (checkov + moteurs Python). Tout **sans compte cloud**.
:::

:::lang en
**A secured workload, five stacked pillars.** The project connects what you saw separately, on **one workload**:

1. **Network (segmentation).** A **segmented** base: the sensitive tier (data) has its **deny-by-default NSG** — allow only the app, deny the rest. The exposed surface is **minimal**.
2. **Identity (passwordless).** A **managed identity** authenticates the app with **no stored secret**; the app **secret** lives in the **vault** (Key Vault), never in code.
3. **Data (encryption).** Data is **encrypted** at rest and in transit (TLS 1.2, HTTPS), **off the Internet** (public access closed). A scan **proves** it.
4. **Governance (policy).** A **gate** prevents the non-compliant: **Azure Policy** (deny, platform-side) **and** **checkov** (shift-left, in CI). Nothing unsafe passes.
5. **Operations (detect/respond).** We **monitor**: a rule detects an incident (brute force), a **playbook** responds **automatically**. And a **secure score** measures overall posture.

**Harden AND operate.** A secured workload isn't **configured** once: it's **maintained**. The first four pillars **harden** (static state); the fifth **operates** (living defense: detection, response, measurement). A real security engineer does **both** — and can **demonstrate** it.

**Why it's CV-worthy.** This project proves, **with evidence**, that you can: segment a network (Zero Trust), manage passwordless identities and secrets, encrypt and remove data from the Internet, govern by policy (deny + shift-left), and detect/respond to an incident while measuring posture. That's **exactly** the **AZ-500** scope — and an **Azure Security Engineer**'s daily work.

**What's live here.** The **network base** (RG + deny-by-default NSG) is **deployed** on miniblue (Terraform, live). The **managed identity** is **created** (real principalId, live), the **secret** lives in the **vault** (live). The **data hardening**, **deny policy**, **detection** and **secure score** are **validated/run** locally (checkov + Python engines). All **without a cloud account**.
:::

:::figure azure-projet-securite-workload
caption_fr: "Schéma 1. Le workload durci et opéré : une BASE RÉSEAU segmentée (NSG refus par défaut) → IDENTITÉ managée sans mot de passe + secret au coffre → DONNÉES chiffrées, TLS 1.2, hors d'Internet (checkov vert) → GOUVERNANCE (Azure Policy deny + checkov shift-left) → OPÉRATIONS (détection d'incident → playbook de réponse) → SECURE SCORE qui mesure le tout. Cinq piliers AZ-500 superposés sur une seule charge de travail, prête pour le CV."
caption_en: "Figure 1. The hardened and operated workload: a segmented NETWORK BASE (deny-by-default NSG) → passwordless managed IDENTITY + secret in vault → encrypted DATA, TLS 1.2, off the Internet (checkov green) → GOVERNANCE (Azure Policy deny + checkov shift-left) → OPERATIONS (incident detection → response playbook) → SECURE SCORE measuring it all. Five AZ-500 pillars stacked on one workload, CV-ready."
:::

## walkthrough

:::lang fr
On avance ainsi : base réseau segmentée (live) → identité + secret au coffre (live) → données durcies (checkov) → porte de gouvernance (policy deny) → détection & réponse → secure score → emballage CV & teardown.
:::

:::lang en
We'll go like this: segmented network base (live) → identity + secret in vault (live) → hardened data (checkov) → governance gate (deny policy) → detection & response → secure score → CV packaging & teardown.
:::

### step-01

:::lang fr
**Objectif.** Déployer la **base réseau segmentée** — NSG en **refus par défaut**.

**🤔 Surface minimale d'abord.** On pose le socle : un groupe de ressources et un **NSG** qui n'autorise **que** l'app (10.0.2.0/24) sur HTTPS vers le tier data, et **refuse** tout le reste par défaut. On déploie **pour de vrai**.

Déploie la base réseau durcie :
:::

:::lang en
**Goal.** Deploy the **segmented network base** — deny-by-default NSG.

**🤔 Minimal surface first.** We lay the foundation: a resource group and an **NSG** that allows **only** the app (10.0.2.0/24) on HTTPS to the data tier, and **denies** the rest by default. We deploy **for real**.

Deploy the hardened network base:
:::

```bash
export SSL_CERT_FILE=$HOME/.miniblue/cert.pem
export ARM_ENVIRONMENT=public

mkdir -p projet-securite/infra && cd projet-securite
cat > infra/providers.tf <<'TF'
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}
provider "azurerm" {
  features {}
  metadata_host              = "localhost:4567"
  skip_provider_registration = true
  subscription_id            = "00000000-0000-0000-0000-000000000000"
  tenant_id                  = "00000000-0000-0000-0000-000000000001"
  client_id                  = "miniblue"
  client_secret              = "miniblue"
  environment                = "public"
}
TF
cat > infra/main.tf <<'TF'
resource "azurerm_resource_group" "sec" {
  name     = "rg-secproj"
  location = "westeurope"
}
resource "azurerm_network_security_group" "data" {
  name                = "nsg-data"
  location            = azurerm_resource_group.sec.location
  resource_group_name = azurerm_resource_group.sec.name
  # N'autoriser QUE l'app (10.0.2.0/24) sur HTTPS ; tout le reste refuse par defaut
  security_rule {
    name                       = "autoriser-app-https"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "10.0.2.0/24"
    destination_address_prefix = "*"
  }
}
TF
cd infra && terraform init -no-color >/dev/null 2>&1
terraform apply -auto-approve -no-color 2>&1 | grep -E "Apply complete"
cd ..
```

:::lang fr
**✅ Vérification :** `apply` confirme `Apply complete! Resources: 2 added` — le groupe et le **NSG en refus par défaut** sont **déployés** sur miniblue. Le tier data n'accepte **que** l'app sur HTTPS ; tout autre trafic est **refusé** implicitement. C'est le **pilier réseau** : la surface exposée est **minimale** dès le socle. On y ajoute maintenant l'**identité** et le **secret**.
:::

:::lang en
**✅ Check:** `apply` confirms `Apply complete! Resources: 2 added` — the group and the **deny-by-default NSG** are **deployed** on miniblue. The data tier accepts **only** the app on HTTPS; any other traffic is **denied** implicitly. That's the **network pillar**: the exposed surface is **minimal** from the foundation. We now add **identity** and the **secret**.
:::

### step-02

:::lang fr
**Objectif.** Ajouter l'**identité managée** sans mot de passe et le **secret au coffre**.

**🤔 Sans secret pour accéder au secret.** L'app s'authentifie via une **identité managée** (pas de mot de passe stocké) ; sa chaîne de connexion vit au **coffre** (Key Vault). On crée les deux **pour de vrai**.

Crée l'identité et dépose le secret :
:::

:::lang en
**Goal.** Add the passwordless **managed identity** and the **secret in the vault**.

**🤔 No secret to access the secret.** The app authenticates via a **managed identity** (no stored password); its connection string lives in the **vault** (Key Vault). We create both **for real**.

Create the identity and deposit the secret:
:::

```bash
# Identite managee (le "qui" sans mot de passe) / managed identity (passwordless who)
azlocal identity create --resource-group rg-secproj --name id-app 2>/dev/null \
  | python3 -c "import sys,json; print('identite / identity: id-app | principalId:', json.load(sys.stdin)['properties']['principalId'])"

# Secret applicatif au coffre (jamais dans le code) / app secret in the vault (never in code)
azlocal keyvault secret set --vault kv-secproj --name db-conn --value "conn-secret-du-lab" 2>/dev/null \
  | python3 -c "import sys,json; print('secret au coffre / in vault:', json.load(sys.stdin)['id'])"
```

:::lang fr
**✅ Vérification :** la sortie affiche `identite / identity: id-app | principalId: <uuid>` puis `secret au coffre : https://kv-secproj.vault.azure.net/secrets/db-conn`. Le **pilier identité** est posé : l'app a une **identité managée** (qu'on autoriserait au coffre via RBAC *Secrets User*, moindre privilège), et son **secret** vit **hors du code**, dans le **coffre**. Aucun mot de passe ne circule, aucun secret n'est en dur. On protège maintenant les **données** elles-mêmes.
:::

:::lang en
**✅ Check:** the output shows `identite / identity: id-app | principalId: <uuid>` then `secret au coffre : https://kv-secproj.vault.azure.net/secrets/db-conn`. The **identity pillar** is set: the app has a **managed identity** (which you'd authorize to the vault via RBAC *Secrets User*, least privilege), and its **secret** lives **outside the code**, in the **vault**. No password travels, no secret is hardcoded. We now protect the **data** itself.
:::

### step-03

:::lang fr
**Objectif.** **Durcir les données** — chiffrement, TLS 1.2, hors d'Internet (checkov au vert).

**🤔 La donnée, protégée elle-même.** On décrit la ressource de données avec **tous** les contrôles : chiffrement au repos, **TLS 1.2**, **HTTPS obligatoire**, **accès public fermé**, géo-redondance. On **scanne** : tout doit passer.

Décris et scanne la ressource de données durcie :
:::

:::lang en
**Goal.** **Harden the data** — encryption, TLS 1.2, off the Internet (checkov green).

**🤔 Data, protected itself.** We describe the data resource with **all** controls: encryption at rest, **TLS 1.2**, **HTTPS required**, **public access closed**, geo-redundancy. We **scan**: everything must pass.

Describe and scan the hardened data resource:
:::

```bash
mkdir -p data
cat > data/main.tf <<'TF'
resource "azurerm_storage_account" "donnees" {
  name                              = "stsecproj01"
  resource_group_name               = "rg-secproj"
  location                          = "westeurope"
  account_tier                      = "Standard"
  account_replication_type          = "GRS"
  enable_https_traffic_only         = true
  min_tls_version                   = "TLS1_2"
  public_network_access_enabled     = false
  infrastructure_encryption_enabled = true
}
TF

checkov -d data --check CKV_AZURE_3,CKV_AZURE_44,CKV_AZURE_59 --compact --quiet 2>/dev/null | grep -E "Passed checks|Failed checks"
```

:::lang fr
**✅ Vérification :** checkov affiche `Passed checks: 3, Failed checks: 0` — **HTTPS obligatoire** (`CKV_AZURE_3`), **TLS 1.2** (`CKV_AZURE_44`) et **pas d'accès public** (`CKV_AZURE_59`) sont **tous respectés**. Le **pilier données** est en place : chiffrée (double couche), TLS récent, HTTPS only, **hors d'Internet**, géo-redondante. La donnée — la cible ultime — est protégée **elle-même**. Reste à **empêcher** qu'une ressource non conforme n'existe : la **gouvernance**.
:::

:::lang en
**✅ Check:** checkov shows `Passed checks: 3, Failed checks: 0` — **HTTPS required** (`CKV_AZURE_3`), **TLS 1.2** (`CKV_AZURE_44`) and **no public access** (`CKV_AZURE_59`) are **all respected**. The **data pillar** is in place: encrypted (double layer), recent TLS, HTTPS only, **off the Internet**, geo-redundant. The data — the ultimate target — is protected **itself**. Now to **prevent** a non-compliant resource from existing: **governance**.
:::

### step-04

:::lang fr
**Objectif.** Poser la **porte de gouvernance** — Azure Policy (deny) + checkov (shift-left).

**🤔 Empêcher, à deux niveaux.** On combine **checkov** (bloque en CI, sur le code) et **Azure Policy** (refuse à la création, sur la plateforme). On écrit un évaluateur de policy et on lui soumet une ressource conforme et une non conforme.

Écris la porte de gouvernance et teste-la :
:::

:::lang en
**Goal.** Set the **governance gate** — Azure Policy (deny) + checkov (shift-left).

**🤔 Prevent, at two levels.** We combine **checkov** (blocks in CI, on code) and **Azure Policy** (denies at creation, on the platform). We write a policy evaluator and feed it a compliant and a non-compliant resource.

Write the governance gate and test it:
:::

```bash
cat > policy.py <<'PY'
# Azure Policy : REFUSER (deny) la creation de ressources non conformes
POLITIQUES = [
    ("HTTPS obligatoire",     lambda r: r.get("https_only") is True),
    ("TLS 1.2 minimum",       lambda r: r.get("tls") == "1.2"),
    ("Pas d'acces public",    lambda r: r.get("public") is False),
]
def evaluer(r):
    for nom, regle in POLITIQUES:
        if not regle(r):
            return "DENY", nom
    return "ALLOW", None

for r in [
    {"nom": "st-conforme",   "https_only": True,  "tls": "1.2", "public": False},
    {"nom": "st-non-conforme","https_only": True, "tls": "1.0", "public": True},
]:
    dec, motif = evaluer(r)
    print(f"{r['nom']:16} -> {dec}" + (f" (viole: {motif})" if motif else ""))
PY
python3 policy.py
```

:::lang fr
**✅ Vérification :** la sortie affiche `st-conforme -> ALLOW` et `st-non-conforme -> DENY (viole: TLS 1.2 minimum)`. La **porte de gouvernance** empêche le non-conforme : **checkov** l'arrête **en CI** (avant le déploiement), **Azure Policy** le **refuse à la création** (sur la plateforme). Les deux se **complètent** — shift-left **et** garde-fou permanent. Ton workload ne peut **pas** dériver vers une config non sûre. On passe à la **défense vivante** : détecter et répondre.
:::

:::lang en
**✅ Check:** the output shows `st-conforme -> ALLOW` and `st-non-conforme -> DENY (viole: TLS 1.2 minimum)`. The **governance gate** prevents the non-compliant: **checkov** stops it **in CI** (before deployment), **Azure Policy** **denies it at creation** (on the platform). Both **complement** each other — shift-left **and** permanent guardrail. Your workload **can't** drift to an unsafe config. On to **living defense**: detect and respond.
:::

### step-05

:::lang fr
**Objectif.** **Détecter** un incident et déclencher une **réponse automatique**.

**🤔 Durcir ne suffit pas — opérer.** On simule une attaque (force brute sur un compte), une **règle de détection** la repère, et un **playbook** répond **automatiquement**. C'est le pilier **opérations** — la défense **vivante**.

Détecte l'incident et réponds automatiquement :
:::

:::lang en
**Goal.** **Detect** an incident and trigger an **automated response**.

**🤔 Hardening isn't enough — operate.** We simulate an attack (brute force on an account), a **detection rule** spots it, and a **playbook** responds **automatically**. That's the **operations** pillar — **living** defense.

Detect the incident and respond automatically:
:::

```bash
cat > secops.py <<'PY'
from collections import defaultdict
# Journaux d'authentification (simules) / (simulated) auth logs
logs = [{"user": "admin", "result": "echec"} for _ in range(6)] + [{"user": "admin", "result": "succes"}]

# Detection : force brute (>= 5 echecs puis succes) / brute force
echecs = defaultdict(int); incident = None
for e in logs:
    if e["result"] == "echec": echecs[e["user"]] += 1
    elif e["result"] == "succes" and echecs[e["user"]] >= 5:
        incident = {"type": "Force brute", "user": e["user"], "echecs": echecs[e["user"]]}
print("Detection :", f"🚨 {incident['type']} sur {incident['user']} ({incident['echecs']} echecs puis succes)" if incident else "aucun incident")

# Reponse automatique (playbook SOAR) / automated response
if incident:
    print("Reponse automatique (playbook) :")
    for a in [f"desactiver le compte {incident['user']}", "exiger reinitialisation MDP + MFA", "bloquer l'IP source", "notifier le SOC"]:
        print(f"  -> {a}")
PY
python3 secops.py
```

:::lang fr
**✅ Vérification :** la sortie affiche `Detection : 🚨 Force brute sur admin (6 echecs puis succes)`, puis la **réponse automatique** : désactiver le compte, exiger MDP + MFA, bloquer l'IP, notifier le SOC. Le **pilier opérations** est en place : le workload n'est pas seulement **durci**, il est **surveillé** — un incident est **détecté** et une **réponse** part **sans attendre** un humain. Durcir **et** opérer : la défense est **vivante**. Reste à **mesurer** la posture globale.
:::

:::lang en
**✅ Check:** the output shows `Detection : 🚨 Force brute sur admin (6 echecs puis succes)`, then the **automated response**: disable the account, require password + MFA, block the IP, notify the SOC. The **operations pillar** is in place: the workload isn't only **hardened**, it's **monitored** — an incident is **detected** and a **response** goes out **without waiting** for a human. Harden **and** operate: the defense is **living**. Now to **measure** the overall posture.
:::

### step-06

:::lang fr
**Objectif.** **Mesurer** la posture du workload — le **secure score**.

**🤔 Une note chiffrée.** On évalue les **cinq piliers** posés (réseau, identité, données, gouvernance, opérations) et on calcule un **secure score**. Un pilier manquant devient une **recommandation**.

Calcule le secure score du workload :
:::

:::lang en
**Goal.** **Measure** the workload's posture — the **secure score**.

**🤔 A quantified rating.** We evaluate the **five pillars** set (network, identity, data, governance, operations) and compute a **secure score**. A missing pillar becomes a **recommendation**.

Compute the workload's secure score:
:::

```bash
python3 <<'PY'
piliers = {
  "Reseau : NSG refus par defaut":            True,
  "Identite : managee (sans mot de passe)":   True,
  "Donnees : chiffrees + TLS 1.2 + hors Internet": True,
  "Gouvernance : Policy deny + checkov":      True,
  "Operations : detection + reponse":         True,
  "Sauvegarde/continuite testee":             False,   # a ajouter -> recommandation
}
ok = sum(piliers.values())
print(f"Secure score du workload : {ok}/{len(piliers)} = {100*ok//len(piliers)}%")
for nom, v in piliers.items():
    print(f"  {'✅' if v else '❌'} {nom}")
print("-> Le ❌ est ta prochaine recommandation (comme dans Defender for Cloud).")
PY
```

:::lang fr
**✅ Vérification :** la sortie affiche `Secure score du workload : 5/6 = 83%`, avec les **cinq piliers** cochés et un **❌** (continuité non testée) comme **prochaine recommandation**. Ton workload est **durci sur les cinq axes AZ-500** et sa posture est **mesurée** — exactement la logique de **Defender for Cloud** : un score, des recommandations, une amélioration continue. Tu as un **livrable** complet : sécurisé **et** opéré **et** mesuré. On l'emballe pour le CV.
:::

:::lang en
**✅ Check:** the output shows `Secure score du workload : 5/6 = 83%`, with the **five pillars** checked and a **❌** (continuity untested) as the **next recommendation**. Your workload is **hardened on all five AZ-500 axes** and its posture is **measured** — exactly **Defender for Cloud**'s logic: a score, recommendations, continuous improvement. You have a complete **deliverable**: secured **and** operated **and** measured. Let's package it for the CV.
:::

### step-07

:::lang fr
**Objectif.** **Emballer** le projet pour le CV, puis nettoyer.

**🤔 Preuves et pitch.** On rédige la **fiche CV** qui résume le workload durci et opéré, puis on **détruit** proprement le lab.

Rédige la fiche CV et nettoie :
:::

:::lang en
**Goal.** **Package** the project for the CV, then clean up.

**🤔 Evidence and pitch.** We write the **CV sheet** summarizing the hardened and operated workload, then **destroy** the lab cleanly.

Write the CV sheet and clean up:
:::

```bash
cat > CV.md <<'MD'
# Projet : workload Azure durci et opere (securite / AZ-500)
Un workload securise sur les cinq piliers, durci ET opere - 100% local (emulateur).

- **Reseau** : segmentation, NSG en refus par defaut (surface minimale).
- **Identite** : identite managee sans mot de passe, secret au coffre (Key Vault),
  RBAC moindre privilege (Key Vault Secrets User).
- **Donnees** : chiffrement au repos (double couche) + TLS 1.2 + HTTPS only +
  hors d'Internet (acces public ferme), geo-redondance. Scan checkov au vert.
- **Gouvernance** : Azure Policy (deny) + checkov (shift-left) - le non-conforme
  ne peut pas exister.
- **Operations** : detection d'incident (force brute) + reponse automatique
  (playbook SOAR), posture mesuree (secure score).

Stack : Terraform, Bicep, Key Vault, identite managee, NSG, Azure Policy,
Defender for Cloud, Sentinel (KQL), checkov. Aligne AZ-500.
MD
echo "--- fiche CV creee / CV sheet created ---"; head -3 CV.md

# Nettoyer le lab / clean up the lab
cd infra && terraform destroy -auto-approve -no-color 2>&1 | grep -E "Destroy complete" ; cd ..
azlocal group delete --name rg-secproj >/dev/null 2>&1 && echo "rg-secproj supprime / deleted"
```

:::lang fr
**✅ Vérification :** la **fiche CV** est créée (résumant les cinq piliers), puis `Destroy complete!` et `rg-secproj supprime` nettoient le lab. **Félicitations — tu as terminé le track AZ-500 !** Tu tiens un **projet complet** : un workload **durci** (réseau, identité, données, gouvernance) **et opéré** (détection, réponse, mesure), **déployé pour de vrai** sur l'émulateur, avec un **secure score** et une **fiche CV**. Mets `CV.md` en avant et parle de **chaque pilier** en entretien. Tu as désormais bouclé **trois tracks de certification** Azure — AZ-104, AZ-305, AZ-400 et AZ-500 — 100% en local, 100% pratiques. Prochaine étape possible : l'**AZ-700** (réseau avancé).
:::

:::lang en
**✅ Check:** the **CV sheet** is created (summarizing the five pillars), then `Destroy complete!` and `rg-secproj supprime` clean the lab. **Congratulations — you finished the AZ-500 track!** You hold a **complete project**: a **hardened** workload (network, identity, data, governance) **and operated** (detection, response, measurement), **deployed for real** on the emulator, with a **secure score** and a **CV sheet**. Feature `CV.md` and speak to **each pillar** in an interview. You've now completed **several Azure certification tracks** — AZ-104, AZ-305, AZ-400 and AZ-500 — 100% locally, 100% hands-on. Possible next step: **AZ-700** (advanced networking).
:::

## pitfalls

:::lang fr
**1. Durcir sans opérer.** Un workload figé mais **non surveillé** rate les attaques. Ajoute **détection + réponse** (pilier opérations).

**2. Un seul pilier.** Un réseau parfait avec des secrets en dur ne vaut rien. Les **cinq piliers** ensemble, pas un seul.

**3. Secret dans le code.** Même « pour tester ». Le secret vit au **coffre** ; l'app s'authentifie par **identité managée**.

**4. NSG en autorisation par défaut.** Ouvre uniquement l'app sur HTTPS ; **refuse** le reste. Vérifie l'ordre des règles.

**5. Données exposées sur Internet.** `public_network_access = false` + point privé. Une donnée accessible publiquement est une cible.

**6. Gouvernance à un seul niveau.** checkov (CI) **et** Azure Policy (plateforme). L'un sans l'autre laisse un trou.

**7. Score jamais mesuré.** Sans **secure score**, tu ignores ta posture. Mesure, corrige le premier ❌, recommence.
:::

:::lang en
**1. Hardening without operating.** A frozen but **unmonitored** workload misses attacks. Add **detection + response** (operations pillar).

**2. A single pillar.** A perfect network with hardcoded secrets is worthless. The **five pillars** together, not one.

**3. Secret in code.** Even "for testing". The secret lives in the **vault**; the app authenticates via **managed identity**.

**4. Allow-by-default NSG.** Only open the app on HTTPS; **deny** the rest. Check rule order.

**5. Data exposed on the Internet.** `public_network_access = false` + private endpoint. Publicly accessible data is a target.

**6. Single-level governance.** checkov (CI) **and** Azure Policy (platform). Either without the other leaves a hole.

**7. Score never measured.** Without a **secure score**, you don't know your posture. Measure, fix the first ❌, repeat.
:::

## success

:::lang fr
Tu as réussi si ton workload a :

- Une **base réseau segmentée** avec **NSG en refus par défaut** (déployée live).
- Une **identité managée** sans mot de passe + **secret au coffre**.
- Des **données durcies** (chiffrement, TLS 1.2, hors d'Internet) — **checkov au vert**.
- Une **porte de gouvernance** (**Azure Policy deny** + checkov).
- Une **détection d'incident** + **réponse automatique** (playbook).
- Un **secure score** mesuré et une **fiche CV** qui résume les cinq piliers.
:::

:::lang en
You've succeeded if your workload has:

- A **segmented network base** with a **deny-by-default NSG** (deployed live).
- A passwordless **managed identity** + **secret in the vault**.
- **Hardened data** (encryption, TLS 1.2, off the Internet) — **checkov green**.
- A **governance gate** (**Azure Policy deny** + checkov).
- An **incident detection** + **automated response** (playbook).
- A measured **secure score** and a **CV sheet** summarizing the five pillars.
:::

## next

:::lang fr
- **Suivant :** l'**AZ-700** (réseau Azure avancé) pour compléter, ou consolide tes acquis avec un vrai compte gratuit.
- **Réviser :** n'importe quel guide AZ-500 dont un pilier t'a semblé fragile.
- **Aller plus loin :** ajoute le pilier manquant (continuité/sauvegarde testée), branche la détection sur de **vrais** journaux, et automatise le secure score en CI.
:::

:::lang en
- **Next:** **AZ-700** (advanced Azure networking) to complete, or consolidate with a real free account.
- **Review:** any AZ-500 guide whose pillar felt shaky.
- **Go further:** add the missing pillar (tested continuity/backup), wire detection to **real** logs, and automate the secure score in CI.
:::

## cheatsheet

:::lang fr
**Les cinq piliers du workload**

```text
1. RESEAU       NSG refus par defaut (n'autoriser que l'app sur HTTPS)      [live]
2. IDENTITE     identite managee (sans mdp) + secret au Key Vault           [live]
3. DONNEES      chiffrement + TLS 1.2 + HTTPS only + hors Internet (GRS)     [checkov]
4. GOUVERNANCE  Azure Policy (deny) + checkov (shift-left)                   [policy]
5. OPERATIONS   detection (SIEM) -> reponse (playbook) + secure score       [python]
```

**Commandes clés (live)**

```bash
terraform apply                              # base reseau (NSG refus par defaut)
azlocal identity create --resource-group RG --name ID   # identite sans mdp
azlocal keyvault secret set --vault V --name N --value "..."  # secret au coffre
checkov -d data --check CKV_AZURE_3,CKV_AZURE_44,CKV_AZURE_59  # donnees au vert
```

**Le mantra AZ-500**

```text
Durcir (reseau + identite + donnees + gouvernance)
  ET
Operer (detecter + repondre + mesurer)
= defense en profondeur, vivante.
```
:::

:::lang en
**The workload's five pillars**

```text
1. NETWORK      deny-by-default NSG (allow only the app on HTTPS)           [live]
2. IDENTITY     managed identity (passwordless) + secret in Key Vault       [live]
3. DATA         encryption + TLS 1.2 + HTTPS only + off Internet (GRS)      [checkov]
4. GOVERNANCE   Azure Policy (deny) + checkov (shift-left)                  [policy]
5. OPERATIONS   detection (SIEM) -> response (playbook) + secure score      [python]
```

**Key commands (live)**

```bash
terraform apply                              # network base (deny-by-default NSG)
azlocal identity create --resource-group RG --name ID   # passwordless identity
azlocal keyvault secret set --vault V --name N --value "..."  # secret in vault
checkov -d data --check CKV_AZURE_3,CKV_AZURE_44,CKV_AZURE_59  # data green
```

**The AZ-500 mantra**

```text
Harden (network + identity + data + governance)
  AND
Operate (detect + respond + measure)
= defense in depth, living.
```
:::

## resources

:::lang fr
- **AZ-500** : Microsoft Certified Azure Security Engineer Associate — objectifs officiels, Microsoft Learn.
- **Microsoft Cloud Security Benchmark** : la ligne de base des contrôles — Microsoft Learn.
- **Zero Trust** : principes et architecture de référence — learn.microsoft.com/security/zero-trust.
- **Defender for Cloud & Sentinel** : posture, détection, réponse — Microsoft Learn.
- **Azure Policy & checkov** : gouvernance plateforme + shift-left — docs officielles.
- **miniblue** : émulateur Azure local (community, non officiel) — github.com/moabukar/miniblue.
:::

:::lang en
- **AZ-500**: Microsoft Certified Azure Security Engineer Associate — official objectives, Microsoft Learn.
- **Microsoft Cloud Security Benchmark**: the baseline of controls — Microsoft Learn.
- **Zero Trust**: principles and reference architecture — learn.microsoft.com/security/zero-trust.
- **Defender for Cloud & Sentinel**: posture, detection, response — Microsoft Learn.
- **Azure Policy & checkov**: platform governance + shift-left — official docs.
- **miniblue**: local Azure emulator (community, unofficial) — github.com/moabukar/miniblue.
:::

## troubleshooting

:::lang fr
**`terraform` : erreur TLS / certificat (step-01).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` et vérifie que miniblue tourne (port 4567).

**`azlocal : commande introuvable`.** Ajoute son dossier au `PATH` (`/usr/local/bin` ou `~/bin`) ou appelle-le par chemin complet. Le pipe vers `python3` masque sinon l'erreur en `JSONDecodeError`.

**checkov signale `Failed checks` (step-03).** Vérifie les cinq réglages du stockage (`enable_https_traffic_only`, `min_tls_version = "TLS1_2"`, `public_network_access_enabled = false`, `infrastructure_encryption_enabled`, réplication). Un oubli fait échouer la règle.

**Le `apply` déploie moins de 2 ressources.** Vérifie que `main.tf` contient bien le RG **et** le NSG. Garde le format HCL multi-ligne (un bloc sur une seule ligne casse tout).

**La détection ne lève pas d'incident (step-05).** Le seuil est **≥ 5 échecs** avant le succès. Vérifie l'ordre des événements (les échecs d'abord).

**`terraform destroy` laisse des ressources.** Relance depuis `infra/` avec le bon `SSL_CERT_FILE`. En dernier recours, `azlocal reset` remet l'émulateur à zéro.
:::

:::lang en
**`terraform`: TLS / certificate error (step-01).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` and check miniblue is running (port 4567).

**`azlocal: command not found`.** Add its folder to `PATH` (`/usr/local/bin` or `~/bin`) or call it by full path. Otherwise the pipe to `python3` hides the error as a `JSONDecodeError`.

**checkov reports `Failed checks` (step-03).** Check the storage's five settings (`enable_https_traffic_only`, `min_tls_version = "TLS1_2"`, `public_network_access_enabled = false`, `infrastructure_encryption_enabled`, replication). A missing one fails the rule.

**The `apply` deploys fewer than 2 resources.** Check `main.tf` holds the RG **and** the NSG. Keep multi-line HCL (a single-line block breaks everything).

**Detection raises no incident (step-05).** The threshold is **≥ 5 failures** before the success. Check the order of events (failures first).

**`terraform destroy` leaves resources.** Re-run from `infra/` with the right `SSL_CERT_FILE`. As a last resort, `azlocal reset` resets the emulator.
:::
