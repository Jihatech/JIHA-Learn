---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-securite-fondamentaux
slug: azure-securite-fondamentaux
order: 76
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — sécurité fondamentaux (AZ-500) : défense en profondeur, Zero Trust"
title_en: "Azure — security fundamentals (AZ-500): defense in depth, Zero Trust"
tagline_fr: "le modèle mental de la sécurité + les ancres : coffre, identité, réseau."
tagline_en: "the security mental model + the anchors: vault, identity, network."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 240
repo: "bridgecrewio/checkov"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-projet-architecte]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [securite, defense-en-profondeur, zero-trust, cia, key-vault, identite-manageee, moindre-privilege, policy-as-code, az-500]
concepts_en: [security, defense-in-depth, zero-trust, cia, key-vault, managed-identity, least-privilege, policy-as-code, az-500]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Poser les fondations de la sécurité Azure pour l'AZ-500, en local et pour de vrai (miniblue) : le modèle mental (défense en profondeur, Zero Trust, triade CIA, responsabilité partagée), puis les ancres concrètes — le coffre Key Vault (secret stocké, live), l'identité managée (authentification sans mot de passe, principalId réel, live), l'anti-pattern des clés partagées de stockage (à éviter), un réseau qui refuse par défaut (NSG durci en Terraform, live), et le garde-fou policy-as-code (checkov). Plus la ligne de base de sécurité et le secure score. Sans compte cloud.",
og_description_en: "Laying the foundations of Azure security for AZ-500, locally and for real (miniblue): the mental model (defense in depth, Zero Trust, CIA triad, shared responsibility), then the concrete anchors — the Key Vault (a secret stored, live), managed identity (passwordless auth, a real principalId, live), the storage shared-keys anti-pattern (to avoid), a network that denies by default (hardened NSG in Terraform, live), and the policy-as-code guardrail (checkov). Plus the security baseline and secure score. No cloud account."
---

## intro

:::lang fr
La sécurité n'est pas une fonctionnalité qu'on ajoute à la fin : c'est une **façon de concevoir**. L'examen **AZ-500** (Azure Security Engineer) en fait un métier — identité, réseau, données, opérations. Ce premier guide pose le **modèle mental** et les **ancres** concrètes que toute la suite réutilise.

Fidèle à la méthode, on ancre les concepts **en local et pour de vrai** avec **miniblue** : on stocke un secret dans un **coffre Key Vault** (live), on crée une **identité managée** — l'authentification **sans mot de passe** avec un vrai **principalId** (live), on voit l'**anti-pattern** des **clés partagées** de stockage (pourquoi les éviter), on durcit un **réseau** qui **refuse par défaut** (NSG en Terraform, **appliqué en vrai**), et on installe un **garde-fou policy-as-code** (`checkov`) qui **bloque** une ressource non sûre. On termine par la **ligne de base de sécurité** et le **secure score** — mesurer sa posture.

**Pour qui c'est :** tu connais l'architecture Azure (AZ-104/305) et tu veux la **sécuriser** méthodiquement.

**Quand ce n'est PAS le bon choix :**

- Tu débutes sur Azure → fais d'abord *Azure — fondamentaux (AZ-900)* et l'AZ-104.
- Tu cherches la sécurité **de la pipeline** (DevSecOps) → c'est l'**AZ-400** ; ici c'est la sécurité **de la plateforme**.
:::

:::lang en
Security isn't a feature you add at the end: it's a **way of designing**. The **AZ-500** exam (Azure Security Engineer) makes it a profession — identity, network, data, operations. This first guide lays the **mental model** and the concrete **anchors** the whole track reuses.

True to the method, we ground the concepts **locally and for real** with **miniblue**: we store a secret in a **Key Vault** (live), create a **managed identity** — **passwordless** authentication with a real **principalId** (live), see the **shared-keys** storage **anti-pattern** (why to avoid them), harden a **network** that **denies by default** (NSG in Terraform, **applied for real**), and install a **policy-as-code guardrail** (`checkov`) that **blocks** an unsafe resource. We finish with the **security baseline** and the **secure score** — measuring your posture.

**Who it's for:** you know Azure architecture (AZ-104/305) and want to **secure** it methodically.

**When it's NOT the right choice:**

- You're new to Azure → do *Azure — fundamentals (AZ-900)* and AZ-104 first.
- You want **pipeline** security (DevSecOps) → that's **AZ-400**; here it's **platform** security.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Expliquer la **défense en profondeur**, le **Zero Trust** et la triade **CIA**.
- Situer la **responsabilité partagée** (ce qui est à toi, ce qui est à Azure).
- Stocker un secret dans un **Key Vault** (l'ancre des secrets).
- Créer une **identité managée** et comprendre l'authentification **sans mot de passe**.
- Reconnaître l'**anti-pattern** des **clés partagées** et préférer l'identité.
- Durcir un **réseau** en **refus par défaut** (NSG).
- Installer un **garde-fou policy-as-code** (`checkov`) et lire un **secure score**.
:::

:::lang en
By the end of this guide, you can:

- Explain **defense in depth**, **Zero Trust** and the **CIA** triad.
- Place the **shared responsibility** (what's yours, what's Azure's).
- Store a secret in a **Key Vault** (the secrets anchor).
- Create a **managed identity** and understand **passwordless** auth.
- Recognize the **shared-keys anti-pattern** and prefer identity.
- Harden a **network** with **deny-by-default** (NSG).
- Install a **policy-as-code guardrail** (`checkov`) and read a **secure score**.
:::

## prerequisites

:::lang fr
- Un **parcours Azure** derrière toi : AZ-104 (réseau, stockage, identité) et idéalement AZ-305.
- Le **lab local** : **miniblue** démarré (ports 4566/4567), **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`. Voir *Azure — fondamentaux (AZ-900)*.
- `azlocal` sur le `PATH`, **Python 3**, et `pip install checkov`.
- **Aucun compte cloud** : coffre, identité, réseau et policy s'exécutent en local.
:::

:::lang en
- An **Azure path** behind you: AZ-104 (network, storage, identity) and ideally AZ-305.
- The **local lab**: **miniblue** started (ports 4566/4567), **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`. See *Azure — fundamentals (AZ-900)*.
- `azlocal` on `PATH`, **Python 3**, and `pip install checkov`.
- **No cloud account**: vault, identity, network and policy run locally.
:::

## concepts

:::lang fr
**La triade CIA.** La sécurité protège trois propriétés : **Confidentialité** (seuls les autorisés voient la donnée), **Intégrité** (la donnée n'est pas altérée), **Disponibilité** (le service reste accessible). Chaque contrôle sert au moins l'une d'elles. C'est la boussole.

**La défense en profondeur.** On ne mise pas sur **un** rempart mais sur **des couches** : identité → périmètre → réseau → calcul → application → données. Si une couche cède, la suivante tient. Un attaquant doit **toutes** les franchir. En pratique : MFA (identité) **et** NSG (réseau) **et** chiffrement (données) **et** moindre privilège (partout).

**Le Zero Trust.** Le vieux modèle (« à l'intérieur du réseau = de confiance ») est mort. **Zero Trust** : *ne jamais faire confiance, toujours vérifier*. Trois principes : **vérifier explicitement** (chaque accès authentifié et autorisé), **moindre privilège** (juste ce qu'il faut, juste le temps qu'il faut), **supposer la brèche** (segmenter, chiffrer, journaliser comme si l'attaquant était déjà là).

**La responsabilité partagée.** Le cloud partage la sécurité. Azure sécurise le **socle** (datacentres, matériel, hyperviseur). **Toi**, tu sécurises ce que tu **mets dessus** : identités, configurations, données, réseau. Plus tu montes (IaaS → PaaS → SaaS), plus Azure en prend ; mais **l'identité et les données restent toujours à toi**.

**Les ancres concrètes.** La théorie s'incarne dans quelques services-clés :

- **Key Vault** — le **coffre** : secrets, clés, certificats, avec contrôle d'accès et audit. Le code n'a qu'une **référence** ; rien en dur.
- **Identité managée** — une **identité** attachée à une ressource Azure, qui obtient des jetons **sans mot de passe** stocké. C'est le pilier du Zero Trust côté machine.
- **RBAC & moindre privilège** — donner le **rôle minimal** (lecteur plutôt que propriétaire), sur le **périmètre minimal** (une ressource, pas l'abonnement).
- **NSG & refus par défaut** — le réseau **n'autorise que** ce qui est explicitement permis ; tout le reste est **refusé**.
- **Policy-as-code** — des **règles automatiques** (checkov, Azure Policy) qui **empêchent** une config non conforme d'exister.

**L'anti-pattern des clés partagées.** Un compte de stockage expose des **clés d'accès** (`key1`, `key2`) toutes-puissantes. Les distribuer, c'est distribuer un **passe** permanent, difficile à révoquer et à tracer. La bonne voie : **identité managée** + **RBAC** (ou des **SAS** limitées), et les clés **au coffre** si vraiment nécessaires.

**Ce qui est live ici.** Le **coffre** stocke un secret (`azlocal keyvault`, live). L'**identité managée** se **crée** avec un vrai **principalId** (live). Les **clés de stockage** se **listent** (pour montrer le risque, live). Le **NSG** en **refus par défaut** se **déploie** en Terraform (live). Le **garde-fou checkov** **bloque** une ressource non sûre (offline). Le **RBAC** live renvoie 404 sur miniblue : on le **valide en Bicep** et on le **raisonne**. Tout le modèle mental s'ancre **sans compte cloud**.
:::

:::lang en
**The CIA triad.** Security protects three properties: **Confidentiality** (only the authorized see the data), **Integrity** (the data isn't altered), **Availability** (the service stays reachable). Every control serves at least one. It's the compass.

**Defense in depth.** You don't bet on **one** wall but on **layers**: identity → perimeter → network → compute → application → data. If one layer falls, the next holds. An attacker must cross **all** of them. In practice: MFA (identity) **and** NSG (network) **and** encryption (data) **and** least privilege (everywhere).

**Zero Trust.** The old model ("inside the network = trusted") is dead. **Zero Trust**: *never trust, always verify*. Three principles: **verify explicitly** (every access authenticated and authorized), **least privilege** (just enough, just in time), **assume breach** (segment, encrypt, log as if the attacker were already in).

**Shared responsibility.** The cloud shares security. Azure secures the **foundation** (datacenters, hardware, hypervisor). **You** secure what you **put on it**: identities, configurations, data, network. The higher you go (IaaS → PaaS → SaaS), the more Azure takes; but **identity and data always stay yours**.

**The concrete anchors.** Theory embodies in a few key services:

- **Key Vault** — the **vault**: secrets, keys, certificates, with access control and audit. Code holds only a **reference**; nothing hardcoded.
- **Managed identity** — an **identity** attached to an Azure resource that gets tokens with **no stored password**. It's the machine-side pillar of Zero Trust.
- **RBAC & least privilege** — grant the **minimal role** (reader rather than owner), on the **minimal scope** (a resource, not the subscription).
- **NSG & deny-by-default** — the network **only allows** what's explicitly permitted; everything else is **denied**.
- **Policy-as-code** — **automatic rules** (checkov, Azure Policy) that **prevent** a non-compliant config from existing.

**The shared-keys anti-pattern.** A storage account exposes all-powerful **access keys** (`key1`, `key2`). Distributing them is distributing a permanent **master key**, hard to revoke and trace. The right path: **managed identity** + **RBAC** (or limited **SAS**), and keys **in the vault** if truly needed.

**What's live here.** The **vault** stores a secret (`azlocal keyvault`, live). The **managed identity** is **created** with a real **principalId** (live). The **storage keys** are **listed** (to show the risk, live). The **deny-by-default NSG** is **deployed** in Terraform (live). The **checkov guardrail** **blocks** an unsafe resource (offline). Live **RBAC** returns 404 on miniblue: we **validate it in Bicep** and **reason** about it. The whole mental model anchors **without a cloud account**.
:::

:::figure azure-securite-defense-en-profondeur
caption_fr: "Schéma 1. La défense en profondeur, guidée par Zero Trust : des COUCHES concentriques (identité → périmètre → réseau → calcul → application → données), chacune un contrôle (MFA, NSG refus par défaut, moindre privilège RBAC, chiffrement, coffre Key Vault). Zero Trust : vérifier explicitement, moindre privilège, supposer la brèche. Un garde-fou policy-as-code empêche toute config non conforme. La triade CIA (Confidentialité, Intégrité, Disponibilité) en boussole."
caption_en: "Figure 1. Defense in depth, guided by Zero Trust: concentric LAYERS (identity → perimeter → network → compute → application → data), each a control (MFA, deny-by-default NSG, least-privilege RBAC, encryption, Key Vault). Zero Trust: verify explicitly, least privilege, assume breach. A policy-as-code guardrail prevents any non-compliant config. The CIA triad (Confidentiality, Integrity, Availability) as the compass."
:::

## walkthrough

:::lang fr
On avance ainsi : le coffre (secret) → l'identité managée (sans mot de passe) → l'anti-pattern des clés partagées → le réseau en refus par défaut → le garde-fou policy-as-code → la défense en profondeur assemblée → ligne de base & secure score.
:::

:::lang en
We'll go like this: the vault (secret) → managed identity (passwordless) → the shared-keys anti-pattern → deny-by-default network → the policy-as-code guardrail → defense in depth assembled → baseline & secure score.
:::

### step-01

:::lang fr
**Objectif.** Poser l'**ancre des secrets** : stocker un secret dans un **Key Vault**.

**🤔 Rien en dur, tout au coffre.** Le premier réflexe de sécurité : les secrets ne vivent **pas** dans le code ni les variables en clair, mais dans un **coffre** avec contrôle d'accès. On dépose un secret et on le relit.

Prépare le lab et stocke un secret :
:::

:::lang en
**Goal.** Lay the **secrets anchor**: store a secret in a **Key Vault**.

**🤔 Nothing hardcoded, everything in the vault.** The first security reflex: secrets do **not** live in code or plaintext variables, but in a **vault** with access control. We deposit a secret and read it back.

Prepare the lab and store a secret:
:::

```bash
azlocal group create --name rg-securite --location westeurope >/dev/null 2>&1

# Déposer un secret dans le coffre / deposit a secret in the vault
azlocal keyvault secret set --vault kv-securite --name db-password --value "M0tDeP@sse-Fort" 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('secret stocké / stored:', d['id'])"

# Relire (ce que fait une app autorisée) / read back (what an authorized app does)
azlocal keyvault secret show --vault kv-securite --name db-password 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('lu / read:', d['value'])"
```

:::lang fr
**✅ Vérification :** `set` renvoie `secret stocké / stored: https://kv-securite.vault.azure.net/secrets/db-password`, et `show` renvoie `lu / read: M0tDeP@sse-Fort`. Le secret vit au **coffre** ; l'app ne connaît que le **nom** (la référence). En vrai Azure, le coffre **chiffre** la valeur et **journalise** chaque accès. C'est l'ancre **Confidentialité** de la triade CIA. Mais qui a le droit de lire ? C'est là qu'entre l'**identité**.
:::

:::lang en
**✅ Check:** `set` returns `secret stocké / stored: https://kv-securite.vault.azure.net/secrets/db-password`, and `show` returns `lu / read: M0tDeP@sse-Fort`. The secret lives in the **vault**; the app knows only the **name** (the reference). In real Azure, the vault **encrypts** the value and **audits** each access. It's the **Confidentiality** anchor of the CIA triad. But who's allowed to read? That's where **identity** comes in.
:::

### step-02

:::lang fr
**Objectif.** Créer une **identité managée** — l'authentification **sans mot de passe**.

**🤔 Une identité, pas un secret.** Comment une app lit-elle le coffre sans... un secret pour y accéder ? Avec une **identité managée** : Azure attache une **identité** à la ressource, qui obtient des **jetons** automatiquement — **aucun** mot de passe stocké. On la crée et on lit son **principalId** (l'identifiant qu'on autorisera).

Crée une identité managée :
:::

:::lang en
**Goal.** Create a **managed identity** — **passwordless** authentication.

**🤔 An identity, not a secret.** How does an app read the vault without... a secret to access it? With a **managed identity**: Azure attaches an **identity** to the resource, which gets **tokens** automatically — **no** stored password. We create it and read its **principalId** (the id we'll authorize).

Create a managed identity:
:::

```bash
# Créer une identité managée / create a managed identity
azlocal identity create --resource-group rg-securite --name id-app 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); p=d['properties']; print('identité / identity:', d['name']); print('principalId:', p['principalId']); print('clientId  :', p['clientId'])"
```

:::lang fr
**✅ Vérification :** la sortie affiche `identité / identity: id-app`, un **principalId** (ex. `a6329b46-…`) et un **clientId**. Ce **principalId** est l'**identité** que tu **autorises** ensuite (ex. « lecteur de secrets sur `kv-securite` »). L'app présente cette identité, Azure émet un jeton — **sans mot de passe** à stocker, à faire fuiter ou à faire tourner. C'est le pilier **machine** du Zero Trust : *vérifier explicitement*, sans secret partagé. On **accorde** ce droit via **RBAC** (moindre privilège), abordé au track identité.
:::

:::lang en
**✅ Check:** the output shows `identité / identity: id-app`, a **principalId** (e.g. `a6329b46-…`) and a **clientId**. This **principalId** is the **identity** you then **authorize** (e.g. "secrets reader on `kv-securite`"). The app presents this identity, Azure issues a token — **no password** to store, leak or rotate. It's the **machine** pillar of Zero Trust: *verify explicitly*, with no shared secret. You **grant** that right via **RBAC** (least privilege), covered in the identity track.
:::

### step-03

:::lang fr
**Objectif.** Voir l'**anti-pattern** des **clés partagées** — et pourquoi préférer l'identité.

**🤔 La clé qui ouvre tout.** Un compte de stockage expose des **clés d'accès** toutes-puissantes. On les **liste** pour bien voir le danger : une clé = un **passe permanent**, difficile à révoquer, impossible à tracer par utilisateur. On la regarde… pour décider de **ne pas** l'utiliser ainsi.

Crée un stockage, liste ses clés, mesure le risque :
:::

:::lang en
**Goal.** See the **shared-keys anti-pattern** — and why to prefer identity.

**🤔 The key that opens everything.** A storage account exposes all-powerful **access keys**. We **list** them to see the danger clearly: a key = a **permanent master pass**, hard to revoke, impossible to trace per user. We look at it… to decide **not** to use it that way.

Create storage, list its keys, gauge the risk:
:::

```bash
azlocal storage account create --resource-group rg-securite --name stsecurite001 >/dev/null 2>&1

# Lister les clés partagées (le danger) / list the shared keys (the danger)
azlocal storage account list-keys --resource-group rg-securite --name stsecurite001 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('clés partagées / shared keys:', [k['keyName']+' ('+k['permissions']+')' for k in d['keys']])"

echo "→ Une clé 'Full' = accès TOTAL, permanent, non traçable par utilisateur."
echo "→ Bonne pratique : identité managée + RBAC (ou SAS limitée) ; clés au coffre si indispensables."
```

:::lang fr
**✅ Vérification :** la sortie affiche `clés partagées / shared keys: ['key1 (Full)', 'key2 (Full)']` — deux clés à permission **Full**. Quiconque détient `key1` a un accès **total** au stockage, **sans** identité, **sans** trace, **sans** expiration. C'est l'**anti-pattern** : à éviter. Préfère l'**identité managée** (step-02) + **RBAC** ciblé, ou une **SAS** (signature d'accès partagé) **limitée** dans le temps et la portée. Si tu dois garder une clé, mets-la **au coffre** (step-01) et **fais-la tourner**. Deux clés existent justement pour **rotationner** sans coupure.
:::

:::lang en
**✅ Check:** the output shows `clés partagées / shared keys: ['key1 (Full)', 'key2 (Full)']` — two keys with **Full** permission. Anyone holding `key1` has **total** access to the storage, **without** identity, **without** trace, **without** expiry. That's the **anti-pattern**: avoid it. Prefer the **managed identity** (step-02) + targeted **RBAC**, or a **SAS** (shared access signature) **limited** in time and scope. If you must keep a key, put it **in the vault** (step-01) and **rotate** it. Two keys exist precisely to **rotate** without downtime.
:::

### step-04

:::lang fr
**Objectif.** Durcir le **réseau** : un NSG en **refus par défaut**.

**🤔 N'autorise que le nécessaire.** Un groupe de sécurité réseau (**NSG**) filtre le trafic. Le principe Zero Trust : **refuser par défaut**, n'**autoriser** que l'explicitement nécessaire (ici, HTTPS entrant). On déploie ce NSG **pour de vrai** sur miniblue.

Déploie un NSG durci :
:::

:::lang en
**Goal.** Harden the **network**: a **deny-by-default** NSG.

**🤔 Only allow what's needed.** A network security group (**NSG**) filters traffic. The Zero Trust principle: **deny by default**, only **allow** the explicitly necessary (here, inbound HTTPS). We deploy this NSG **for real** on miniblue.

Deploy a hardened NSG:
:::

```bash
export SSL_CERT_FILE=$HOME/.miniblue/cert.pem
export ARM_ENVIRONMENT=public

mkdir -p secu-infra && cd secu-infra
cat > providers.tf <<'TF'
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
  client_secret              = "miniblue"
  environment                = "public"
}
TF
cat > main.tf <<'TF'
resource "azurerm_resource_group" "sec" {
  name     = "rg-securite-net"
  location = "westeurope"
}
resource "azurerm_network_security_group" "web" {
  name                = "nsg-web"
  location            = azurerm_resource_group.sec.location
  resource_group_name = azurerm_resource_group.sec.name
  # N'autoriser QUE HTTPS entrant ; tout le reste est refusé par défaut
  security_rule {
    name                       = "autoriser-https"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
  # Refus explicite du SSH (défense en profondeur, lisibilité)
  security_rule {
    name                       = "refuser-ssh"
    priority                   = 200
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}
TF
terraform init -no-color >/dev/null 2>&1
terraform apply -auto-approve -no-color 2>&1 | grep -E "Apply complete"
cd ..
```

:::lang fr
**✅ Vérification :** `apply` confirme `Apply complete! Resources: 2 added` — le groupe de ressources et le **NSG** sont **déployés** sur miniblue. Le NSG **n'autorise que** HTTPS (443) depuis Internet et **refuse** explicitement le SSH (22). Tout ce qui n'est **pas** autorisé est **refusé par défaut** (règle implicite d'Azure). C'est l'ancre **réseau** de la défense en profondeur : même si l'app a une faille, la **surface exposée** est minimale. On garde ce lab pour la suite.
:::

:::lang en
**✅ Check:** `apply` confirms `Apply complete! Resources: 2 added` — the resource group and the **NSG** are **deployed** on miniblue. The NSG **only allows** HTTPS (443) from the Internet and explicitly **denies** SSH (22). Anything **not** allowed is **denied by default** (Azure's implicit rule). It's the **network** anchor of defense in depth: even if the app has a flaw, the **exposed surface** is minimal. We keep this lab for later.
:::

### step-05

:::lang fr
**Objectif.** Installer un **garde-fou policy-as-code** : `checkov` **bloque** une config non sûre.

**🤔 Empêcher, pas seulement corriger.** La sécurité tient si les **mauvaises configs ne peuvent pas exister**. Un scanner de **policy-as-code** (`checkov`) analyse l'IaC et **échoue** si une règle est violée. On lui soumet un NSG **dangereux** (SSH ouvert au monde) et on regarde le garde-fou réagir.

Soumets une config dangereuse au garde-fou :
:::

:::lang en
**Goal.** Install a **policy-as-code guardrail**: `checkov` **blocks** an unsafe config.

**🤔 Prevent, not just fix.** Security holds if **bad configs can't exist**. A **policy-as-code** scanner (`checkov`) analyzes the IaC and **fails** if a rule is violated. We feed it a **dangerous** NSG (SSH open to the world) and watch the guardrail react.

Feed a dangerous config to the guardrail:
:::

```bash
mkdir -p danger
cat > danger/main.tf <<'TF'
resource "azurerm_network_security_group" "mauvais" {
  name                = "nsg-danger"
  location            = "westeurope"
  resource_group_name = "rg-x"
  security_rule {
    name                       = "ssh-ouvert-au-monde"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"     # DANGER : SSH depuis Internet entier
    destination_address_prefix = "*"
  }
}
TF

# Le garde-fou : échoue si une règle de sécurité est violée
checkov -d danger --compact --quiet 2>/dev/null | grep -E "Passed checks|Failed checks|CKV_AZURE_10|CKV_AZURE_9" | head -5
```

:::lang fr
**✅ Vérification :** checkov signale au moins un **échec**, par ex. `CKV_AZURE_10` / `CKV_AZURE_9` (« Ensure that SSH/RDP access is restricted from the internet »), avec un bilan `Failed checks: ≥ 1`. Le garde-fou **attrape** la config dangereuse **avant** tout déploiement — en pipeline, `Failed checks > 0` **bloque** la fusion. C'est la **policy-as-code** : la sécurité devient une **règle automatique**, pas une revue manuelle qu'on oublie. (En vrai Azure, **Azure Policy** joue ce rôle côté plateforme, en **refusant** la création non conforme.)
:::

:::lang en
**✅ Check:** checkov reports at least one **failure**, e.g. `CKV_AZURE_10` / `CKV_AZURE_9` ("Ensure that SSH/RDP access is restricted from the internet"), with a `Failed checks: ≥ 1` summary. The guardrail **catches** the dangerous config **before** any deployment — in a pipeline, `Failed checks > 0` **blocks** the merge. That's **policy-as-code**: security becomes an **automatic rule**, not a manual review you forget. (In real Azure, **Azure Policy** plays this role platform-side, by **denying** non-compliant creation.)
:::

### step-06

:::lang fr
**Objectif.** Assembler la **défense en profondeur** — les couches ensemble.

**🤔 Aucune couche ne suffit seule.** La force vient de la **superposition** : identité (managée, sans secret) + réseau (NSG refus par défaut) + données (secret au coffre) + garde-fou (policy). On récapitule les couches déployées et on note ce que chacune protège.

Dresse la carte des couches en place :
:::

:::lang en
**Goal.** Assemble **defense in depth** — the layers together.

**🤔 No single layer is enough.** Strength comes from **stacking**: identity (managed, secretless) + network (deny-by-default NSG) + data (secret in vault) + guardrail (policy). We recap the deployed layers and note what each protects.

Draw the map of the layers in place:
:::

```bash
export PATH="$PATH"
echo "=== Défense en profondeur — couches en place / layers in place ==="
printf "%-14s %-40s %s\n" "COUCHE" "CONTRÔLE" "PROPRIÉTÉ CIA"
printf "%-14s %-40s %s\n" "Identité"  "identité managée (sans mot de passe)"   "Confidentialité"
printf "%-14s %-40s %s\n" "Réseau"    "NSG refus par défaut (HTTPS seul)"      "Intégrité/Dispo"
printf "%-14s %-40s %s\n" "Données"   "secret au Key Vault (chiffré, audité)"  "Confidentialité"
printf "%-14s %-40s %s\n" "Gouvernance" "policy-as-code (checkov bloque)"      "les trois"

echo; echo "→ Vérif rapide que les couches vivent :"
azlocal keyvault secret show --vault kv-securite --name db-password >/dev/null 2>&1 && echo "  ✅ coffre : secret présent"
azlocal identity list --resource-group rg-securite 2>/dev/null | python3 -c "import sys,json; print('  ✅ identité :', len(json.load(sys.stdin)['value']), 'identité(s) managée(s)')"
```

:::lang fr
**✅ Vérification :** la table récapitule les **couches** (Identité, Réseau, Données, Gouvernance), leur **contrôle** et la **propriété CIA** servie ; puis les vérifs affichent `✅ coffre : secret présent` et `✅ identité : 1 identité(s) managée(s)`. Chaque couche est **indépendante** : compromettre le réseau ne donne pas le secret (au coffre) ; voler une identité sans droit ne sert à rien (moindre privilège). C'est **ça**, la défense en profondeur — et c'est la structure de tout le track AZ-500 : **identité**, **réseau**, **données**, **opérations**.
:::

:::lang en
**✅ Check:** the table recaps the **layers** (Identity, Network, Data, Governance), their **control** and the **CIA property** served; then the checks show `✅ coffre : secret présent` and `✅ identité : 1 identité(s) managée(s)`. Each layer is **independent**: compromising the network doesn't yield the secret (in the vault); stealing an identity with no rights is useless (least privilege). That **is** defense in depth — and it's the structure of the whole AZ-500 track: **identity**, **network**, **data**, **operations**.
:::

### step-07

:::lang fr
**Objectif.** Comprendre la **ligne de base** et le **secure score**, puis nettoyer.

**🤔 Mesurer sa posture.** On ne sécurise pas « au ressenti ». Une **ligne de base de sécurité** (Azure Security Benchmark) liste les contrôles attendus ; le **secure score** (Defender for Cloud) **note** ta conformité en %. On calcule un score maison sur nos couches, puis on détruit le lab.

Calcule un secure score maison, puis nettoie :
:::

:::lang en
**Goal.** Understand the **baseline** and the **secure score**, then clean up.

**🤔 Measure your posture.** You don't secure "by feel". A **security baseline** (Azure Security Benchmark) lists the expected controls; the **secure score** (Defender for Cloud) **rates** your compliance in %. We compute a homemade score on our layers, then destroy the lab.

Compute a homemade secure score, then clean up:
:::

```bash
python3 <<'PY'
controles = {
  "Secrets au coffre (pas en dur)": True,
  "Identité managée (sans mot de passe)": True,
  "NSG en refus par défaut": True,
  "SSH fermé sur Internet": True,
  "Policy-as-code active (checkov)": True,
  "Clés partagées désactivées": False,   # encore actives -> point à corriger
}
ok = sum(controles.values())
score = 100 * ok / len(controles)
print(f"Secure score (maison) : {ok}/{len(controles)} contrôles = {score:.0f}%")
for c, v in controles.items():
    print(f"  {'✅' if v else '❌'} {c}")
print("→ Le point ❌ est ta prochaine recommandation (comme dans Defender for Cloud).")
PY

# Nettoyer le lab / clean up the lab
cd secu-infra && terraform destroy -auto-approve -no-color 2>&1 | grep -E "Destroy complete" ; cd ..
azlocal group delete --name rg-securite >/dev/null 2>&1 && echo "rg-securite supprimé / deleted"
```

:::lang fr
**✅ Vérification :** le script affiche `Secure score (maison) : 5/6 contrôles = 83%` avec la liste cochée, et pointe le **❌** (clés partagées encore actives) comme **prochaine recommandation** — exactement la logique de **Defender for Cloud** : un score, des recommandations priorisées, une posture qui **s'améliore**. Puis `Destroy complete!` et `rg-securite supprimé` nettoient le lab. Tu tiens le **modèle mental** (CIA, défense en profondeur, Zero Trust, responsabilité partagée) et les **ancres** (coffre, identité, réseau, policy). La suite du track AZ-500 : l'**identité** en profondeur (Entra ID, RBAC, PIM), puis le **réseau**, les **données**, et les **opérations de sécurité**.
:::

:::lang en
**✅ Check:** the script shows `Secure score (maison) : 5/6 contrôles = 83%` with the checked list, and points to the **❌** (shared keys still active) as the **next recommendation** — exactly **Defender for Cloud**'s logic: a score, prioritized recommendations, a posture that **improves**. Then `Destroy complete!` and `rg-securite supprimé` clean the lab. You hold the **mental model** (CIA, defense in depth, Zero Trust, shared responsibility) and the **anchors** (vault, identity, network, policy). Next in the AZ-500 track: **identity** in depth (Entra ID, RBAC, PIM), then **network**, **data**, and **security operations**.
:::

## pitfalls

:::lang fr
**1. Miser sur un seul rempart.** Un pare-feu ne suffit pas. La **défense en profondeur** superpose des couches indépendantes.

**2. Faire confiance au « réseau interne ».** C'est le modèle mort. **Zero Trust** : vérifier **chaque** accès, partout.

**3. Secrets en dur / en clair.** Un secret dans le code ou une variable d'env non protégée finit par fuiter. Au **coffre**, toujours.

**4. Clés partagées distribuées.** Une clé de stockage `Full` est un passe permanent non traçable. Préfère **identité managée + RBAC** ou **SAS** limitée.

**5. NSG en « autoriser par défaut ».** Ouvre uniquement l'explicitement nécessaire ; **refuse** le reste. Attention au SSH/RDP ouvert sur `*`.

**6. Sur-privilège.** Donner « Propriétaire » sur l'abonnement « pour que ça marche » viole le moindre privilège. Rôle **minimal**, périmètre **minimal**.

**7. Sécurité « au ressenti ».** Sans **ligne de base** ni **score**, tu ne sais pas où tu en es. Mesure (secure score) et corrige les recommandations.
:::

:::lang en
**1. Betting on a single wall.** A firewall isn't enough. **Defense in depth** stacks independent layers.

**2. Trusting the "internal network".** That's the dead model. **Zero Trust**: verify **every** access, everywhere.

**3. Hardcoded / plaintext secrets.** A secret in code or an unprotected env var eventually leaks. In the **vault**, always.

**4. Distributed shared keys.** A `Full` storage key is a permanent, untraceable master pass. Prefer **managed identity + RBAC** or a limited **SAS**.

**5. "Allow by default" NSG.** Only open the explicitly necessary; **deny** the rest. Beware SSH/RDP open on `*`.

**6. Over-privilege.** Granting "Owner" on the subscription "to make it work" violates least privilege. **Minimal** role, **minimal** scope.

**7. Security "by feel".** Without a **baseline** or a **score**, you don't know where you stand. Measure (secure score) and fix the recommendations.
:::

## success

:::lang fr
Tu as réussi si :

- Tu expliques **CIA**, **défense en profondeur**, **Zero Trust** et la **responsabilité partagée**.
- Tu **stockes/lis** un secret dans un **Key Vault**.
- Tu **crées** une **identité managée** et sais lire son **principalId**.
- Tu **reconnais** le danger des **clés partagées** et la meilleure voie (identité/RBAC/SAS).
- Tu **déploies** un **NSG en refus par défaut** (HTTPS seul, SSH refusé).
- Tu **installes** un **garde-fou policy-as-code** et calcules un **secure score**.
:::

:::lang en
You've succeeded if:

- You explain **CIA**, **defense in depth**, **Zero Trust** and **shared responsibility**.
- You **store/read** a secret in a **Key Vault**.
- You **create** a **managed identity** and can read its **principalId**.
- You **recognize** the danger of **shared keys** and the better path (identity/RBAC/SAS).
- You **deploy** a **deny-by-default NSG** (HTTPS only, SSH denied).
- You **install** a **policy-as-code guardrail** and compute a **secure score**.
:::

## next

:::lang fr
- **Suivant :** *Azure — sécurité de l'identité (AZ-500)* — Entra ID, RBAC, moindre privilège, PIM, accès conditionnel.
- **Réviser :** *Azure — identité & gouvernance (AZ-104)* pour les bases RBAC.
- **S'entraîner :** reprends une infra d'un guide précédent et calcule son **secure score** maison ; corrige le premier ❌.
:::

:::lang en
- **Next:** *Azure — identity security (AZ-500)* — Entra ID, RBAC, least privilege, PIM, conditional access.
- **Review:** *Azure — identity & governance (AZ-104)* for RBAC basics.
- **Practice:** take an earlier guide's infra and compute its homemade **secure score**; fix the first ❌.
:::

## cheatsheet

:::lang fr
**Le modèle mental**

```text
Triade CIA        Confidentialité · Intégrité · Disponibilité
Défense en prof.  identité → périmètre → réseau → calcul → app → données
Zero Trust        vérifier explicitement · moindre privilège · supposer la brèche
Resp. partagée    Azure = socle ; TOI = identités, config, données, réseau
```

**Les ancres (live sur miniblue)**

```bash
# Coffre : secrets
azlocal keyvault secret set  --vault V --name N --value "…"
azlocal keyvault secret show --vault V --name N
# Identité managée : sans mot de passe (principalId à autoriser)
azlocal identity create --resource-group RG --name ID
# Clés partagées (ANTI-PATTERN — voir puis éviter)
azlocal storage account list-keys --resource-group RG --name COMPTE
```

**Réseau : refus par défaut (Terraform)**

```text
NSG : Allow 443 (Internet)  ·  Deny 22 (*)  ·  reste refusé par défaut
```

**Garde-fou policy-as-code**

```bash
checkov -d infra          # échoue si une règle de sécurité est violée (CKV_AZURE_*)
# ex : CKV_AZURE_9/10 -> SSH/RDP ouvert sur Internet
```
:::

:::lang en
**The mental model**

```text
CIA triad         Confidentiality · Integrity · Availability
Defense in depth  identity → perimeter → network → compute → app → data
Zero Trust        verify explicitly · least privilege · assume breach
Shared resp.      Azure = foundation ; YOU = identities, config, data, network
```

**The anchors (live on miniblue)**

```bash
# Vault: secrets
azlocal keyvault secret set  --vault V --name N --value "…"
azlocal keyvault secret show --vault V --name N
# Managed identity: passwordless (principalId to authorize)
azlocal identity create --resource-group RG --name ID
# Shared keys (ANTI-PATTERN — see then avoid)
azlocal storage account list-keys --resource-group RG --name ACCOUNT
```

**Network: deny by default (Terraform)**

```text
NSG: Allow 443 (Internet)  ·  Deny 22 (*)  ·  the rest denied by default
```

**Policy-as-code guardrail**

```bash
checkov -d infra          # fails if a security rule is violated (CKV_AZURE_*)
# e.g. CKV_AZURE_9/10 -> SSH/RDP open to the Internet
```
:::

## resources

:::lang fr
- **AZ-500** : Microsoft Certified Azure Security Engineer Associate — objectifs officiels, Microsoft Learn.
- **Microsoft Cloud Security Benchmark** : la ligne de base des contrôles Azure — Microsoft Learn.
- **Zero Trust** : les principes et l'architecture de référence Microsoft — learn.microsoft.com/security/zero-trust.
- **Key Vault & identités managées** : secrets, jetons sans mot de passe — Microsoft Learn.
- **checkov / Azure Policy** : policy-as-code, refus des configs non conformes — docs officielles.
- **miniblue** : émulateur Azure local (community, non officiel) — github.com/moabukar/miniblue.
:::

:::lang en
- **AZ-500**: Microsoft Certified Azure Security Engineer Associate — official objectives, Microsoft Learn.
- **Microsoft Cloud Security Benchmark**: the baseline of Azure controls — Microsoft Learn.
- **Zero Trust**: Microsoft's principles and reference architecture — learn.microsoft.com/security/zero-trust.
- **Key Vault & managed identities**: secrets, passwordless tokens — Microsoft Learn.
- **checkov / Azure Policy**: policy-as-code, denying non-compliant configs — official docs.
- **miniblue**: local Azure emulator (community, unofficial) — github.com/moabukar/miniblue.
:::

## troubleshooting

:::lang fr
**`azlocal : commande introuvable`.** Ajoute son dossier au `PATH` (`/usr/local/bin` ou `~/bin`) ou appelle-le par chemin complet. Le pipe vers `python3` masque sinon l'erreur en `JSONDecodeError`.

**`terraform` : erreur TLS / certificat (step-04).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` et vérifie que miniblue tourne (port 4567).

**`checkov : command not found` (step-05).** `pip install checkov` ; s'il atterrit dans `~/.local/bin` hors PATH, ajoute ce dossier au `PATH`.

**`keyvault : --vault is required`.** Le drapeau est `--vault` (pas `--vault-name`).

**checkov ne signale rien.** Vérifie que le dossier contient bien le `.tf` **dangereux** (SSH `source_address_prefix = "*"`). Un NSG **durci** (comme au step-04) **passe** — c'est voulu.

**Le RBAC ne se crée pas en local.** miniblue **n'émule pas** les attributions de rôles (404). C'est **attendu** : on **valide** le RBAC en **Bicep** et on le **raisonne** ; l'exécution vise du vrai Azure. L'**identité** (principalId), elle, est bien réelle en local.
:::

:::lang en
**`azlocal: command not found`.** Add its folder to `PATH` (`/usr/local/bin` or `~/bin`) or call it by full path. Otherwise the pipe to `python3` hides the error as a `JSONDecodeError`.

**`terraform`: TLS / certificate error (step-04).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` and check miniblue is running (port 4567).

**`checkov: command not found` (step-05).** `pip install checkov`; if it lands in `~/.local/bin` off PATH, add that folder to `PATH`.

**`keyvault: --vault is required`.** The flag is `--vault` (not `--vault-name`).

**checkov reports nothing.** Check the folder holds the **dangerous** `.tf` (SSH `source_address_prefix = "*"`). A **hardened** NSG (like step-04) **passes** — that's intended.

**RBAC won't create locally.** miniblue **doesn't emulate** role assignments (404). That's **expected**: we **validate** RBAC in **Bicep** and **reason** about it; execution targets real Azure. The **identity** (principalId), though, is genuinely real locally.
:::
