---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-securite-reseau
slug: azure-securite-reseau
order: 78
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — sécurité réseau (AZ-500) : segmentation, pare-feu, WAF"
title_en: "Azure — network security (AZ-500): segmentation, firewall, WAF"
tagline_fr: "segmenter, refuser par défaut, filtrer la sortie, bloquer les attaques."
tagline_en: "segment, deny by default, filter egress, block attacks."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 260
repo: "hashicorp/terraform-provider-azurerm"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-securite-identite]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [reseau, segmentation, nsg, micro-segmentation, pare-feu, egress, point-terminaison-prive, waf, ddos, az-500]
concepts_en: [network, segmentation, nsg, micro-segmentation, firewall, egress, private-endpoint, waf, ddos, az-500]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Sécuriser le réseau pour l'AZ-500, en local et pour de vrai : segmenter un réseau en tiers (VNet + sous-réseaux web/app/data avec NSG, déployés live sur miniblue), comprendre la logique d'évaluation NSG (priorité croissante, première règle qui matche, refus implicite) avec un évaluateur exécutable, la micro-segmentation qui isole les tiers (le web ne parle PAS directement au data), le contrôle de sortie (pare-feu à liste blanche de FQDN contre l'exfiltration), les points de terminaison privés (garder le PaaS hors d'Internet), et un WAF + rate-limiter qui bloquent injections et abus. Sans compte cloud.",
og_description_en: "Securing the network for AZ-500, locally and for real: segmenting a network into tiers (VNet + web/app/data subnets with NSGs, deployed live on miniblue), understanding NSG evaluation logic (ascending priority, first matching rule, implicit deny) with a runnable evaluator, micro-segmentation isolating tiers (web does NOT talk directly to data), egress control (an FQDN-allowlist firewall against exfiltration), private endpoints (keeping PaaS off the internet), and a WAF + rate-limiter blocking injections and abuse. No cloud account."
---

## intro

:::lang fr
Après l'identité, le **réseau**. Même avec une identité parfaite, un réseau **plat** (tout communique avec tout) offre à un attaquant un **terrain de jeu** : une machine compromise atteint tout le reste. L'**AZ-500** attend que tu saches **segmenter**, **refuser par défaut**, **filtrer la sortie** et **bloquer les attaques**. C'est la couche **réseau** de la défense en profondeur.

Fidèle à la méthode, on pratique **en local et pour de vrai** : on **segmente** un réseau en tiers (VNet + sous-réseaux **web/app/data** avec NSG, déployés **live** sur **miniblue**), on **décortique la logique d'évaluation NSG** (priorité croissante, **première règle** qui matche, **refus implicite**) avec un évaluateur **exécutable**, on met en place la **micro-segmentation** (le tier web ne parle **pas** directement au tier data), on **contrôle la sortie** (un pare-feu à **liste blanche de FQDN** contre l'exfiltration), on garde le PaaS **hors d'Internet** avec les **points de terminaison privés**, et on installe un **WAF + rate-limiter** qui **bloquent** injections et abus.

**Pour qui c'est :** tu maîtrises l'identité (guide précédent) et tu veux **cloisonner** ton réseau.

**Quand ce n'est PAS le bon choix :**

- Tu ne connais pas VNet/NSG → révise *Azure — réseau (AZ-104)*.
- Tu veux la **conception** réseau (topologie hub-spoke détaillée) → ici c'est l'angle **sécurité**.
:::

:::lang en
After identity, the **network**. Even with perfect identity, a **flat** network (everything talks to everything) hands an attacker a **playground**: one compromised machine reaches everything else. **AZ-500** expects you to **segment**, **deny by default**, **filter egress** and **block attacks**. It's the **network** layer of defense in depth.

True to the method, we practice **locally and for real**: we **segment** a network into tiers (VNet + **web/app/data** subnets with NSGs, deployed **live** on **miniblue**), we **dissect NSG evaluation logic** (ascending priority, **first matching** rule, **implicit deny**) with a **runnable** evaluator, we set up **micro-segmentation** (the web tier does **not** talk directly to the data tier), we **control egress** (an **FQDN-allowlist** firewall against exfiltration), we keep PaaS **off the internet** with **private endpoints**, and we install a **WAF + rate-limiter** that **block** injections and abuse.

**Who it's for:** you master identity (previous guide) and want to **compartmentalize** your network.

**When it's NOT the right choice:**

- You don't know VNet/NSG → review *Azure — networking (AZ-104)*.
- You want network **design** (detailed hub-spoke topology) → here it's the **security** angle.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- **Segmenter** un réseau en tiers (VNet + sous-réseaux + NSG) et le **déployer**.
- Expliquer la **logique d'évaluation NSG** (priorité, première règle, refus implicite).
- Mettre en place la **micro-segmentation** (isoler les tiers entre eux).
- **Contrôler la sortie** (egress) avec une **liste blanche de FQDN**.
- Comprendre les **points de terminaison privés** (PaaS hors d'Internet).
- Installer un **WAF** (bloquer les injections) et un **rate-limiter** (anti-abus/DDoS).
- Situer la protection **DDoS** et le rôle du **pare-feu** applicatif.
:::

:::lang en
By the end of this guide, you can:

- **Segment** a network into tiers (VNet + subnets + NSG) and **deploy** it.
- Explain **NSG evaluation logic** (priority, first rule, implicit deny).
- Set up **micro-segmentation** (isolating tiers from each other).
- **Control egress** with an **FQDN allowlist**.
- Understand **private endpoints** (PaaS off the internet).
- Install a **WAF** (block injections) and a **rate-limiter** (anti-abuse/DDoS).
- Place **DDoS** protection and the role of the application **firewall**.
:::

## prerequisites

:::lang fr
- Le guide **Azure — sécurité de l'identité (AZ-500)** et *Azure — réseau (AZ-104)*.
- Le **lab local** : **miniblue** démarré, **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`, `azlocal` sur le `PATH`.
- **Python 3**. **Aucun compte cloud** : segmentation live, évaluateurs/pare-feu/WAF exécutés en local.
:::

:::lang en
- The **Azure — identity security (AZ-500)** guide and *Azure — networking (AZ-104)*.
- The **local lab**: **miniblue** started, **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`, `azlocal` on `PATH`.
- **Python 3**. **No cloud account**: segmentation live, evaluators/firewall/WAF run locally.
:::

## concepts

:::lang fr
**Segmenter : diviser pour protéger.** Un réseau **plat** est dangereux : une brèche = accès à tout. On **segmente** en **tiers** — typiquement **web** (exposé), **app** (logique), **data** (base). Chaque tier est un **sous-réseau** avec son **NSG**. Le trafic entre tiers est **contrôlé**, pas libre. C'est la traduction réseau de « supposer la brèche ».

**Le NSG et sa logique d'évaluation.** Un **Network Security Group** est une liste de **règles**. Azure les évalue par **priorité croissante** (100 avant 200…), s'arrête à la **première** qui **matche** (protocole + port + source/destination + direction), et applique son **action** (Allow/Deny). Si **aucune** ne matche, une règle **implicite** refuse (**deny by default**). Corollaire : une règle de faible priorité peut **masquer** une règle de plus forte priorité — l'**ordre** compte.

**La micro-segmentation.** On ne se contente pas de séparer d'Internet : on **cloisonne aussi à l'intérieur**. Le tier **web** peut parler au tier **app** ; le tier **app** au tier **data** ; mais le **web** **ne peut PAS** atteindre le **data** directement. Ainsi, une compromission du front-end n'ouvre **pas** la base. Chaque flux **légitime** est autorisé **explicitement** ; tout le reste est **refusé**.

**Le contrôle de sortie (egress).** On filtre le trafic **entrant**… et souvent on **oublie le sortant**. Or l'**exfiltration** de données passe par la **sortie**. Un **pare-feu** (Azure Firewall) applique des **règles d'application** : n'autoriser les sorties que vers des **FQDN approuvés** (`packages.microsoft.com`, ton API…). Une machine compromise ne peut **pas** téléverser tes données vers `evil-exfil.ru`. Refuser par défaut vaut aussi **en sortie**.

**Les points de terminaison privés.** Par défaut, un service PaaS (stockage, base, Key Vault) a un **point d'accès public**. Un **point de terminaison privé** (*private endpoint*) lui donne une **IP privée** dans ton VNet et **coupe** l'accès public : le service n'est joignable que **depuis ton réseau**. Combiné à « **public network access = disabled** », c'est la fin de l'exposition Internet des données.

**WAF & DDoS.** Devant une app web, un **WAF** (Web Application Firewall) inspecte les requêtes et **bloque** les motifs d'attaque (injection SQL, XSS, traversée de chemin) — souvent via les règles **OWASP**. La protection **DDoS** absorbe les floods volumétriques ; un **rate-limiter** limite le nombre de requêtes par client. Ensemble : le trafic **applicatif** est filtré, pas seulement le trafic **réseau**.

**Ce qui est live ici.** La **segmentation** (VNet + sous-réseaux + NSG + association) se **déploie** sur miniblue (Terraform, live). La **logique NSG**, la **micro-segmentation**, le **pare-feu de sortie**, le **WAF** et le **rate-limiter** sont des **moteurs exécutables** en Python — de **vraies** décisions reproduisant la logique d'Azure. Les **points de terminaison privés** se **raisonnent** (et se **valident** en policy). Tout sans compte cloud.
:::

:::lang en
**Segment: divide to protect.** A **flat** network is dangerous: one breach = access to everything. We **segment** into **tiers** — typically **web** (exposed), **app** (logic), **data** (database). Each tier is a **subnet** with its **NSG**. Traffic between tiers is **controlled**, not free. It's the network translation of "assume breach".

**The NSG and its evaluation logic.** A **Network Security Group** is a list of **rules**. Azure evaluates them by **ascending priority** (100 before 200…), stops at the **first** that **matches** (protocol + port + source/destination + direction), and applies its **action** (Allow/Deny). If **none** matches, an **implicit** rule denies (**deny by default**). Corollary: a low-priority rule can **shadow** a higher-priority one — **order** matters.

**Micro-segmentation.** You don't just separate from the Internet: you **compartmentalize inside** too. The **web** tier can talk to the **app** tier; the **app** to the **data** tier; but the **web** **can NOT** reach the **data** directly. So a front-end compromise does **not** open the database. Each **legitimate** flow is allowed **explicitly**; everything else is **denied**.

**Egress control.** We filter **inbound** traffic… and often **forget outbound**. Yet data **exfiltration** goes through **egress**. A **firewall** (Azure Firewall) applies **application rules**: only allow egress to **approved FQDNs** (`packages.microsoft.com`, your API…). A compromised machine can **not** upload your data to `evil-exfil.ru`. Deny-by-default applies **outbound** too.

**Private endpoints.** By default, a PaaS service (storage, database, Key Vault) has a **public endpoint**. A **private endpoint** gives it a **private IP** in your VNet and **cuts** public access: the service is reachable only **from your network**. Combined with "**public network access = disabled**", it ends Internet exposure of data.

**WAF & DDoS.** In front of a web app, a **WAF** (Web Application Firewall) inspects requests and **blocks** attack patterns (SQL injection, XSS, path traversal) — often via **OWASP** rules. **DDoS** protection absorbs volumetric floods; a **rate-limiter** caps requests per client. Together: **application** traffic is filtered, not just **network** traffic.

**What's live here.** The **segmentation** (VNet + subnets + NSG + association) is **deployed** on miniblue (Terraform, live). The **NSG logic**, **micro-segmentation**, **egress firewall**, **WAF** and **rate-limiter** are **runnable engines** in Python — **real** decisions reproducing Azure's logic. **Private endpoints** are **reasoned** (and **validated** in policy). All without a cloud account.
:::

:::figure azure-securite-reseau-segmentation
caption_fr: "Schéma 1. La sécurité réseau en couches : un VNet SEGMENTÉ en tiers (web → app → data), chacun un sous-réseau + NSG. La MICRO-SEGMENTATION isole les tiers (web ✗ data direct). En entrée : WAF (bloque injection/XSS) + rate-limiter (anti-DDoS). En sortie : pare-feu EGRESS à liste blanche de FQDN (bloque l'exfiltration). Le PaaS (data) via POINT DE TERMINAISON PRIVÉ, hors d'Internet. NSG : priorité croissante, première règle, refus par défaut."
caption_en: "Figure 1. Layered network security: a VNet SEGMENTED into tiers (web → app → data), each a subnet + NSG. MICRO-SEGMENTATION isolates the tiers (web ✗ direct data). Inbound: WAF (blocks injection/XSS) + rate-limiter (anti-DDoS). Outbound: EGRESS firewall with FQDN allowlist (blocks exfiltration). PaaS (data) via PRIVATE ENDPOINT, off the Internet. NSG: ascending priority, first rule, deny by default."
:::

## walkthrough

:::lang fr
On avance ainsi : segmenter (VNet + tiers, live) → logique d'évaluation NSG → micro-segmentation (isoler les tiers) → contrôle de sortie (egress) → points de terminaison privés → WAF + rate-limiter → posture réseau assemblée.
:::

:::lang en
We'll go like this: segment (VNet + tiers, live) → NSG evaluation logic → micro-segmentation (isolate tiers) → egress control → private endpoints → WAF + rate-limiter → network posture assembled.
:::

### step-01

:::lang fr
**Objectif.** **Segmenter** le réseau : un VNet et des sous-réseaux **web/app/data** avec NSG.

**🤔 Diviser pour protéger.** On casse le réseau plat en **tiers**. Chaque tier est un **sous-réseau** ; le tier sensible (**data**) reçoit son **NSG** (associé au sous-réseau). On déploie **pour de vrai** sur miniblue.

Déploie le réseau segmenté :
:::

:::lang en
**Goal.** **Segment** the network: a VNet and **web/app/data** subnets with an NSG.

**🤔 Divide to protect.** We break the flat network into **tiers**. Each tier is a **subnet**; the sensitive tier (**data**) gets its **NSG** (associated with the subnet). We deploy **for real** on miniblue.

Deploy the segmented network:
:::

```bash
export SSL_CERT_FILE=$HOME/.miniblue/cert.pem
export ARM_ENVIRONMENT=public

mkdir -p reseau && cd reseau
cat > providers.tf <<'TF'
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
cat > main.tf <<'TF'
resource "azurerm_resource_group" "net" {
  name     = "rg-net-securite"
  location = "westeurope"
}
resource "azurerm_virtual_network" "app" {
  name                = "vnet-app"
  location            = azurerm_resource_group.net.location
  resource_group_name = azurerm_resource_group.net.name
  address_space       = ["10.0.0.0/16"]
}
resource "azurerm_subnet" "web" {
  name                 = "snet-web"
  resource_group_name  = azurerm_resource_group.net.name
  virtual_network_name = azurerm_virtual_network.app.name
  address_prefixes     = ["10.0.1.0/24"]
}
resource "azurerm_subnet" "data" {
  name                 = "snet-data"
  resource_group_name  = azurerm_resource_group.net.name
  virtual_network_name = azurerm_virtual_network.app.name
  address_prefixes     = ["10.0.3.0/24"]
}
resource "azurerm_network_security_group" "data" {
  name                = "nsg-data"
  location            = azurerm_resource_group.net.location
  resource_group_name = azurerm_resource_group.net.name
}
resource "azurerm_subnet_network_security_group_association" "data" {
  subnet_id                 = azurerm_subnet.data.id
  network_security_group_id = azurerm_network_security_group.data.id
}
TF
terraform init -no-color >/dev/null 2>&1
terraform apply -auto-approve -no-color 2>&1 | grep -E "Apply complete"
cd ..
```

:::lang fr
**✅ Vérification :** `apply` confirme `Apply complete! Resources: 6 added` — le groupe, le VNet, les **deux sous-réseaux** (web, data), le **NSG** et son **association** au sous-réseau data sont **déployés** sur miniblue. Le réseau n'est plus **plat** : il est **segmenté** en tiers, et le tier sensible (**data**) a son **garde** (le NSG). On va maintenant **comprendre comment** ce NSG décide — sa logique d'évaluation.
:::

:::lang en
**✅ Check:** `apply` confirms `Apply complete! Resources: 6 added` — the group, the VNet, the **two subnets** (web, data), the **NSG** and its **association** to the data subnet are **deployed** on miniblue. The network is no longer **flat**: it's **segmented** into tiers, and the sensitive tier (**data**) has its **guard** (the NSG). We'll now **understand how** this NSG decides — its evaluation logic.
:::

### step-02

:::lang fr
**Objectif.** Décortiquer la **logique d'évaluation NSG** — priorité, première règle, refus implicite.

**🤔 L'ordre décide.** Un NSG évalue ses règles par **priorité croissante** et s'arrête à la **première** qui matche. Comprendre ça évite les erreurs (une règle large en tête **masque** les suivantes). On écrit un **évaluateur** fidèle à Azure et on l'éprouve.

Écris l'évaluateur NSG et teste-le :
:::

:::lang en
**Goal.** Dissect **NSG evaluation logic** — priority, first rule, implicit deny.

**🤔 Order decides.** An NSG evaluates its rules by **ascending priority** and stops at the **first** that matches. Understanding this avoids mistakes (a broad rule at the top **shadows** the rest). We write an **evaluator** faithful to Azure and test it.

Write the NSG evaluator and test it:
:::

```bash
cat > nsg.py <<'PY'
# Evaluateur NSG : priorite croissante, PREMIERE regle qui matche gagne,
# refus IMPLICITE par defaut (exactement comme Azure).
def evaluer(regles, flux):
    for r in sorted(regles, key=lambda x: x["priorite"]):
        if (r["direction"] == flux["direction"]
            and (r["port"] == "*" or r["port"] == flux["port"])
            and (r["source"] == "*" or r["source"] == flux["source"])):
            return r["action"], r["nom"], r["priorite"]
    return "Deny", "refus-par-defaut-implicite", 65500

# NSG du tier DATA : autoriser APP (10.0.2.0/24) sur 5432 ; refuser WEB (10.0.1.0/24)
regles_data = [
    {"nom": "autoriser-app-postgres", "priorite": 100, "direction": "Inbound", "port": "5432", "source": "10.0.2.0/24", "action": "Allow"},
    {"nom": "refuser-web-vers-data",  "priorite": 200, "direction": "Inbound", "port": "*",    "source": "10.0.1.0/24", "action": "Deny"},
]
flux = [
    {"nom": "app -> data:5432", "direction": "Inbound", "port": "5432", "source": "10.0.2.0/24"},
    {"nom": "web -> data:5432", "direction": "Inbound", "port": "5432", "source": "10.0.1.0/24"},
    {"nom": "internet -> data", "direction": "Inbound", "port": "5432", "source": "203.0.113.5"},
]
for f in flux:
    action, regle, prio = evaluer(regles_data, f)
    print(f"{f['nom']:22} -> {action:5} (regle: {regle}, prio {prio})")
PY
python3 nsg.py
```

:::lang fr
**✅ Vérification :** la sortie montre : `app -> data:5432 -> Allow (regle: autoriser-app-postgres, prio 100)`, `web -> data:5432 -> Deny (regle: refuser-web-vers-data, prio 200)`, et `internet -> data -> Deny (regle: refus-par-defaut-implicite, prio 65500)`. Trois enseignements : le tier **app** est **autorisé** (règle explicite prio 100), le tier **web** est **refusé** (règle prio 200), et **Internet** est refusé **par défaut** (aucune règle ne matche → refus implicite). C'est **exactement** la logique d'Azure — la **priorité** et la **première correspondance** gouvernent tout.
:::

:::lang en
**✅ Check:** the output shows: `app -> data:5432 -> Allow (regle: autoriser-app-postgres, prio 100)`, `web -> data:5432 -> Deny (regle: refuser-web-vers-data, prio 200)`, and `internet -> data -> Deny (regle: refus-par-defaut-implicite, prio 65500)`. Three lessons: the **app** tier is **allowed** (explicit rule prio 100), the **web** tier is **denied** (rule prio 200), and **Internet** is denied **by default** (no rule matches → implicit deny). That's **exactly** Azure's logic — **priority** and **first match** govern everything.
:::

### step-03

:::lang fr
**Objectif.** Appliquer la **micro-segmentation** — le web ne parle **pas** au data.

**🤔 Cloisonner à l'intérieur.** La segmentation sépare d'Internet ; la **micro-segmentation** sépare **les tiers entre eux**. Règle : web→app OK, app→data OK, mais **web→data NON**. On modélise les trois tiers et on vérifie qu'un flux **web→data** est bien **bloqué**.

Vérifie l'isolation des tiers :
:::

:::lang en
**Goal.** Apply **micro-segmentation** — the web does **not** talk to the data.

**🤔 Compartmentalize inside.** Segmentation separates from the Internet; **micro-segmentation** separates **the tiers from each other**. Rule: web→app OK, app→data OK, but **web→data NO**. We model the three tiers and verify a **web→data** flow is indeed **blocked**.

Verify tier isolation:
:::

```bash
cat > microseg.py <<'PY'
# Micro-segmentation : matrice des flux AUTORISES entre tiers
AUTORISES = {("web", "app"), ("app", "data")}   # tout le reste est refuse
def flux_autorise(src, dst):
    return (src, dst) in AUTORISES

tests = [("web", "app"), ("app", "data"), ("web", "data"), ("data", "web"), ("internet", "web")]
for src, dst in tests:
    ok = flux_autorise(src, dst)
    note = "" if ok else "  <- cloisonne / isolated"
    print(f"{src:9} -> {dst:5} : {'AUTORISE' if ok else 'REFUSE'}{note}")
PY
python3 microseg.py
```

:::lang fr
**✅ Vérification :** la sortie confirme `web -> app : AUTORISE`, `app -> data : AUTORISE`, mais `web -> data : REFUSE`, `data -> web : REFUSE`, `internet -> web : REFUSE`. Le flux **web→data** est **cloisonné** : même si le front-end est compromis, il **ne peut pas** attaquer la base **directement** — il devrait d'abord passer par l'**app** (qui, elle, a ses propres contrôles). C'est la **micro-segmentation** : chaque flux **légitime** est autorisé **explicitement**, tout le reste est **refusé**. Un attaquant ne se déplace plus **latéralement** à volonté.
:::

:::lang en
**✅ Check:** the output confirms `web -> app : AUTORISE`, `app -> data : AUTORISE`, but `web -> data : REFUSE`, `data -> web : REFUSE`, `internet -> web : REFUSE`. The **web→data** flow is **isolated**: even if the front-end is compromised, it **can't** attack the database **directly** — it would have to go through the **app** first (which has its own controls). That's **micro-segmentation**: each **legitimate** flow is allowed **explicitly**, everything else is **denied**. An attacker no longer moves **laterally** at will.
:::

### step-04

:::lang fr
**Objectif.** **Contrôler la sortie** (egress) — bloquer l'exfiltration.

**🤔 On oublie souvent le trafic sortant.** L'entrée est filtrée… mais un attaquant **exfiltre** par la **sortie**. Un **pare-feu** (Azure Firewall) n'autorise les sorties que vers des **FQDN approuvés**. On écrit ce pare-feu et on tente des sorties légitimes et malveillantes.

Écris le pare-feu de sortie et teste-le :
:::

:::lang en
**Goal.** **Control egress** — block exfiltration.

**🤔 We often forget outbound.** Inbound is filtered… but an attacker **exfiltrates** through **egress**. A **firewall** (Azure Firewall) only allows egress to **approved FQDNs**. We write that firewall and try legitimate and malicious egress.

Write the egress firewall and test it:
:::

```bash
cat > egress.py <<'PY'
# Pare-feu de sortie : n'autoriser QUE des FQDN approuves (regles d'application)
FQDN_AUTORISES = {"packages.microsoft.com", "api.monentreprise.com", "login.microsoftonline.com"}
def sortie_autorisee(fqdn):
    return fqdn in FQDN_AUTORISES

for fqdn in ["api.monentreprise.com", "packages.microsoft.com", "evil-exfil.ru", "pastebin.com"]:
    print(f"sortie vers {fqdn:26} -> {'AUTORISEE' if sortie_autorisee(fqdn) else 'BLOQUEE'}")
PY
python3 egress.py
```

:::lang fr
**✅ Vérification :** les sorties vers `api.monentreprise.com` et `packages.microsoft.com` sont **AUTORISEE**, mais `evil-exfil.ru` et `pastebin.com` sont **BLOQUEE**. Le pare-feu applique le **refus par défaut en sortie** : seule la **liste blanche** de FQDN passe. Résultat : une machine compromise ne peut **pas** téléverser tes données vers un domaine inconnu — l'**exfiltration** est coupée. C'est le pendant **sortant** du NSG, indispensable et souvent négligé.
:::

:::lang en
**✅ Check:** egress to `api.monentreprise.com` and `packages.microsoft.com` is **AUTORISEE**, but `evil-exfil.ru` and `pastebin.com` are **BLOQUEE**. The firewall applies **deny-by-default outbound**: only the FQDN **allowlist** passes. Result: a compromised machine can **not** upload your data to an unknown domain — **exfiltration** is cut. It's the **outbound** counterpart of the NSG, essential and often neglected.
:::

### step-05

:::lang fr
**Objectif.** Comprendre les **points de terminaison privés** — le PaaS hors d'Internet.

**🤔 Couper l'accès public.** Par défaut, un service PaaS a un **point public**. Un **point de terminaison privé** lui donne une **IP privée** dans ton VNet et, avec `public_network_access = Disabled`, **coupe** l'accès Internet. On **valide** cette exigence avec un garde-fou : une config à accès public **échoue** au scan.

Détecte l'accès public avec un garde-fou :
:::

:::lang en
**Goal.** Understand **private endpoints** — PaaS off the Internet.

**🤔 Cut public access.** By default, a PaaS service has a **public endpoint**. A **private endpoint** gives it a **private IP** in your VNet and, with `public_network_access = Disabled`, **cuts** Internet access. We **validate** this requirement with a guardrail: a public-access config **fails** the scan.

Detect public access with a guardrail:
:::

```bash
mkdir -p paas
cat > paas/main.tf <<'TF'
resource "azurerm_storage_account" "expose" {
  name                          = "stexpose001"
  resource_group_name           = "rg-x"
  location                      = "westeurope"
  account_tier                  = "Standard"
  account_replication_type      = "LRS"
  public_network_access_enabled = true   # DANGER : PaaS exposé sur Internet
}
TF

# Le garde-fou signale l'exposition publique / the guardrail flags public exposure
checkov -d paas --compact --quiet 2>/dev/null | grep -E "CKV_AZURE_59|CKV_AZURE_35|Failed checks" | head -4
```

:::lang fr
**✅ Vérification :** checkov signale l'exposition, par ex. `CKV_AZURE_59` (« Ensure that Storage accounts disallow public access ») et un `Failed checks: ≥ 1`. Le garde-fou **exige** que le PaaS ne soit **pas** ouvert à Internet — la bonne réponse étant un **point de terminaison privé** + `public_network_access = Disabled`. Ainsi, la base et le stockage ne sont joignables que **depuis ton VNet** (via l'IP privée), jamais depuis Internet. C'est la **surface d'attaque** la plus réduite pour les données. (En vrai Azure, **Azure Policy** refuse la création exposée.)
:::

:::lang en
**✅ Check:** checkov flags the exposure, e.g. `CKV_AZURE_59` ("Ensure that Storage accounts disallow public access") and a `Failed checks: ≥ 1`. The guardrail **requires** that PaaS not be **open** to the Internet — the right answer being a **private endpoint** + `public_network_access = Disabled`. This way, the database and storage are reachable only **from your VNet** (via the private IP), never from the Internet. It's the smallest **attack surface** for data. (In real Azure, **Azure Policy** denies exposed creation.)
:::

### step-06

:::lang fr
**Objectif.** Filtrer le trafic **applicatif** — WAF (injections) + rate-limiter (abus/DDoS).

**🤔 Le réseau ne voit pas tout.** Un NSG laisse passer HTTPS ; il **ne voit pas** une injection SQL **dans** la requête. Un **WAF** inspecte le **contenu** et **bloque** les attaques ; un **rate-limiter** coupe les abus volumétriques. On écrit les deux.

Écris le WAF + rate-limiter et teste :
:::

:::lang en
**Goal.** Filter **application** traffic — WAF (injections) + rate-limiter (abuse/DDoS).

**🤔 The network doesn't see everything.** An NSG lets HTTPS through; it **doesn't see** a SQL injection **inside** the request. A **WAF** inspects the **content** and **blocks** attacks; a **rate-limiter** cuts volumetric abuse. We write both.

Write the WAF + rate-limiter and test:
:::

```bash
cat > waf.py <<'PY'
import re
from collections import Counter

# WAF : bloquer les motifs d'attaque (injection SQL, XSS, traversee de chemin)
MOTIFS = [r"(?i)union\s+select", r"(?i)<script", r"(?i)\.\./\.\."]
def waf_bloque(requete):
    return any(re.search(m, requete) for m in MOTIFS)

requetes = [
    "GET /produits?id=42",
    "GET /p?id=1 UNION SELECT pwd FROM users",
    "GET /?q=<script>alert(1)</script>",
    "GET /../../etc/passwd",
]
print("== WAF ==")
for r in requetes:
    print(f"{'BLOQUE' if waf_bloque(r) else 'OK    '} : {r[:45]}")

# Rate limiter : au-dela de SEUIL requetes par IP -> bloquer (anti-abus / DDoS L7)
print("== Rate limiter ==")
SEUIL = 5
compteur = Counter()
trafic = [("1.2.3.4", i) for i in range(8)] + [("5.6.7.8", 0)]
bloques = 0
for ip, _ in trafic:
    compteur[ip] += 1
    if compteur[ip] > SEUIL:
        bloques += 1
print(f"IP 1.2.3.4 : {compteur['1.2.3.4']} req -> {bloques} bloquees (seuil {SEUIL})")
print(f"IP 5.6.7.8 : {compteur['5.6.7.8']} req -> 0 bloquees")
PY
python3 waf.py
```

:::lang fr
**✅ Vérification :** le **WAF** laisse passer `GET /produits?id=42` (`OK`) mais **bloque** l'injection SQL (`UNION SELECT`), le **XSS** (`<script>`) et la **traversée de chemin** (`../../`). Le **rate-limiter** compte `IP 1.2.3.4 : 8 req -> 3 bloquees (seuil 5)` — au-delà de 5 requêtes, l'IP est **freinée**, tandis que `5.6.7.8` (1 req) passe. Ensemble, ils protègent la **couche applicative** : le WAF contre les **injections** (règles OWASP), le rate-limiter contre les **abus** et les **DDoS applicatifs** (L7). En vrai Azure : **Application Gateway WAF** / **Front Door** + **Azure DDoS Protection**.
:::

:::lang en
**✅ Check:** the **WAF** lets `GET /produits?id=42` through (`OK`) but **blocks** the SQL injection (`UNION SELECT`), the **XSS** (`<script>`) and the **path traversal** (`../../`). The **rate-limiter** counts `IP 1.2.3.4 : 8 req -> 3 bloquees (seuil 5)` — beyond 5 requests, the IP is **throttled**, while `5.6.7.8` (1 req) passes. Together they protect the **application layer**: the WAF against **injections** (OWASP rules), the rate-limiter against **abuse** and **application DDoS** (L7). In real Azure: **Application Gateway WAF** / **Front Door** + **Azure DDoS Protection**.
:::

### step-07

:::lang fr
**Objectif.** Assembler la **posture réseau** et nettoyer.

**🤔 Toutes les couches réseau.** On récapitule ce qui protège le réseau — segmentation, NSG, micro-segmentation, egress, points privés, WAF/DDoS — puis on détruit le lab.

Récapitule la posture et nettoie :
:::

:::lang en
**Goal.** Assemble the **network posture** and clean up.

**🤔 All the network layers.** We recap what protects the network — segmentation, NSG, micro-segmentation, egress, private endpoints, WAF/DDoS — then destroy the lab.

Recap the posture and clean up:
:::

```bash
echo "=== Posture reseau (defense en profondeur) / network posture ==="
printf "%-22s %s\n" "Segmentation"        "VNet + sous-reseaux par tier (web/app/data)"
printf "%-22s %s\n" "NSG (refus defaut)"  "priorite croissante, 1re regle, deny implicite"
printf "%-22s %s\n" "Micro-segmentation"  "isoler les tiers (web != data direct)"
printf "%-22s %s\n" "Egress"              "pare-feu FQDN (bloque l'exfiltration)"
printf "%-22s %s\n" "Point term. prive"   "PaaS hors d'Internet (public access disabled)"
printf "%-22s %s\n" "WAF + DDoS"          "bloquer injections + rate-limiter (L7)"

# Nettoyer le lab / clean up
cd reseau && terraform destroy -auto-approve -no-color 2>&1 | grep -E "Destroy complete" ; cd ..
```

:::lang fr
**✅ Vérification :** la table récapitule les **six leviers** réseau, puis `Destroy complete! Resources: 6 destroyed` nettoie le lab. Tu tiens le pilier **réseau** de l'AZ-500 : **segmenter** (tiers), **refuser par défaut** (NSG), **cloisonner** (micro-segmentation), **filtrer la sortie** (egress), **retirer d'Internet** (points privés) et **filtrer l'applicatif** (WAF/DDoS). Chaque couche **contient** un attaquant qui aurait franchi la précédente. La suite du track AZ-500 : la sécurité des **données** (chiffrement, coffre de clés, rotation), puis les **opérations de sécurité** (Defender, Sentinel, politiques).
:::

:::lang en
**✅ Check:** the table recaps the **six network levers**, then `Destroy complete! Resources: 6 destroyed` cleans the lab. You hold the **network** pillar of AZ-500: **segment** (tiers), **deny by default** (NSG), **compartmentalize** (micro-segmentation), **filter egress**, **remove from the Internet** (private endpoints) and **filter the application** (WAF/DDoS). Each layer **contains** an attacker who crossed the previous one. Next in the AZ-500 track: **data** security (encryption, key vault, rotation), then **security operations** (Defender, Sentinel, policies).
:::

## pitfalls

:::lang fr
**1. Réseau plat.** Tout dans un seul sous-réseau = une brèche ouvre tout. **Segmente** en tiers.

**2. Oublier l'ordre des règles NSG.** Une règle large en **faible priorité** masque les suivantes. Range par **priorité** et teste.

**3. Segmenter d'Internet mais pas à l'intérieur.** Sans **micro-segmentation**, un attaquant se déplace **latéralement**. Isole les tiers.

**4. Filtrer l'entrée, ignorer la sortie.** L'**exfiltration** passe par l'**egress**. Refuse par défaut **en sortie** aussi (liste blanche de FQDN).

**5. PaaS exposé sur Internet.** Un stockage/base à **accès public** est une cible directe. **Point de terminaison privé** + `public access disabled`.

**6. Croire que le NSG voit tout.** Le NSG filtre **ports/IP**, pas le **contenu**. Une injection SQL passe en HTTPS. Ajoute un **WAF**.

**7. Pas de limite de débit.** Sans **rate-limiter**/DDoS, un flood applicatif (L7) sature le service. Limite par client.
:::

:::lang en
**1. Flat network.** Everything in one subnet = one breach opens everything. **Segment** into tiers.

**2. Forgetting NSG rule order.** A broad rule at **low priority** shadows the rest. Order by **priority** and test.

**3. Segmenting from the Internet but not inside.** Without **micro-segmentation**, an attacker moves **laterally**. Isolate the tiers.

**4. Filtering inbound, ignoring outbound.** **Exfiltration** goes through **egress**. Deny-by-default **outbound** too (FQDN allowlist).

**5. PaaS exposed on the Internet.** A **publicly accessible** storage/database is a direct target. **Private endpoint** + `public access disabled`.

**6. Thinking the NSG sees everything.** The NSG filters **ports/IPs**, not **content**. A SQL injection goes through HTTPS. Add a **WAF**.

**7. No rate limiting.** Without a **rate-limiter**/DDoS, an application flood (L7) saturates the service. Cap per client.
:::

## success

:::lang fr
Tu as réussi si :

- Tu **déploies** un réseau **segmenté** (VNet + sous-réseaux + NSG + association).
- Tu expliques la **logique NSG** (priorité, première règle, refus implicite) et la **prouves**.
- Tu appliques la **micro-segmentation** (web ✗ data direct).
- Tu **contrôles la sortie** avec une **liste blanche de FQDN**.
- Tu comprends les **points de terminaison privés** et détectes l'**accès public**.
- Tu bloques les **injections** (WAF) et les **abus** (rate-limiter).
:::

:::lang en
You've succeeded if:

- You **deploy** a **segmented** network (VNet + subnets + NSG + association).
- You explain **NSG logic** (priority, first rule, implicit deny) and **prove** it.
- You apply **micro-segmentation** (web ✗ direct data).
- You **control egress** with an **FQDN allowlist**.
- You understand **private endpoints** and detect **public access**.
- You block **injections** (WAF) and **abuse** (rate-limiter).
:::

## next

:::lang fr
- **Suivant :** *Azure — sécurité des données (AZ-500)* — chiffrement au repos/en transit, coffre de clés, rotation.
- **Réviser :** *Azure — réseau (AZ-104)* pour VNet/NSG.
- **S'entraîner :** ajoute une règle NSG de **plus faible priorité** qui **masque** une règle Allow, et observe l'effet dans `nsg.py`.
:::

:::lang en
- **Next:** *Azure — data security (AZ-500)* — encryption at rest/in transit, key vault, rotation.
- **Review:** *Azure — networking (AZ-104)* for VNet/NSG.
- **Practice:** add a **lower-priority** NSG rule that **shadows** an Allow rule, and observe the effect in `nsg.py`.
:::

## cheatsheet

:::lang fr
**Segmentation (Terraform, live)**

```text
VNet 10.0.0.0/16
  snet-web  10.0.1.0/24   (expose)
  snet-app  10.0.2.0/24   (logique)
  snet-data 10.0.3.0/24   (base) + NSG associe
```

**Logique NSG**

```text
- priorite CROISSANTE (100 avant 200...)
- PREMIERE regle qui matche gagne (protocole+port+source+direction)
- si aucune -> REFUS implicite (deny by default)
- l'ordre compte : une regle large en tete masque les suivantes
```

**Les couches réseau**

```text
Segmentation      VNet + sous-reseaux par tier
Micro-segmentation web->app->data ; web ✗ data direct
Egress            pare-feu FQDN (liste blanche) contre l'exfiltration
Point prive       PaaS hors Internet (public access disabled)
WAF               bloquer injection SQL / XSS / traversee (OWASP)
DDoS/rate-limit   limiter les requetes par client (L3/4 et L7)
```
:::

:::lang en
**Segmentation (Terraform, live)**

```text
VNet 10.0.0.0/16
  snet-web  10.0.1.0/24   (exposed)
  snet-app  10.0.2.0/24   (logic)
  snet-data 10.0.3.0/24   (database) + associated NSG
```

**NSG logic**

```text
- ASCENDING priority (100 before 200...)
- FIRST matching rule wins (protocol+port+source+direction)
- if none -> implicit DENY (deny by default)
- order matters: a broad rule on top shadows the rest
```

**The network layers**

```text
Segmentation       VNet + subnets per tier
Micro-segmentation web->app->data ; web ✗ direct data
Egress             FQDN firewall (allowlist) against exfiltration
Private endpoint   PaaS off the Internet (public access disabled)
WAF                block SQL injection / XSS / traversal (OWASP)
DDoS/rate-limit    cap requests per client (L3/4 and L7)
```
:::

## resources

:::lang fr
- **Réseau Azure** : VNet, sous-réseaux, NSG, priorités et règles — Microsoft Learn.
- **Azure Firewall** : règles d'application (FQDN), règles réseau, egress — Microsoft Learn.
- **Points de terminaison privés & Private Link** : PaaS sans exposition publique — Microsoft Learn.
- **Application Gateway WAF / Front Door** : OWASP, protection applicative — Microsoft Learn.
- **Azure DDoS Protection** : L3/L4 volumétrique, bonnes pratiques — Microsoft Learn (AZ-500).
- **miniblue** : émulateur Azure local (community, non officiel) — github.com/moabukar/miniblue.
:::

:::lang en
- **Azure networking**: VNet, subnets, NSG, priorities and rules — Microsoft Learn.
- **Azure Firewall**: application rules (FQDN), network rules, egress — Microsoft Learn.
- **Private endpoints & Private Link**: PaaS with no public exposure — Microsoft Learn.
- **Application Gateway WAF / Front Door**: OWASP, application protection — Microsoft Learn.
- **Azure DDoS Protection**: L3/L4 volumetric, best practices — Microsoft Learn (AZ-500).
- **miniblue**: local Azure emulator (community, unofficial) — github.com/moabukar/miniblue.
:::

## troubleshooting

:::lang fr
**`terraform` : erreur TLS / certificat (step-01).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` et vérifie que miniblue tourne (port 4567).

**`Apply complete` affiche moins de 6 ressources.** Vérifie que le fichier `main.tf` contient bien RG + VNet + 2 sous-réseaux + NSG + association. Une faute de frappe HCL (bloc sur une seule ligne) casse tout — garde le format multi-ligne.

**`nsg.py` renvoie toujours Deny.** Vérifie que la **direction** et la **source** des flux correspondent aux règles (`Inbound`, préfixes exacts). Le refus implicite s'applique si **aucune** règle ne matche.

**checkov ne signale rien (step-05).** Vérifie que `public_network_access_enabled = true` est bien présent dans le `.tf`. Une config **durcie** (public access désactivé) **passe** — c'est voulu.

**Les scripts Python n'affichent rien.** Lance `python3 fichier.py` ; chaque script est autonome. Attention aux tabulations mélangées.

**Les points de terminaison privés ne se déploient pas en local.** miniblue ne les émule pas (comme le peering/DNS privé). On les **raisonne** et on **valide** l'exigence (accès public désactivé) en policy ; l'exécution vise du vrai Azure.
:::

:::lang en
**`terraform`: TLS / certificate error (step-01).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` and check miniblue is running (port 4567).

**`Apply complete` shows fewer than 6 resources.** Check that `main.tf` holds RG + VNet + 2 subnets + NSG + association. An HCL typo (single-line block) breaks everything — keep the multi-line format.

**`nsg.py` always returns Deny.** Check the flows' **direction** and **source** match the rules (`Inbound`, exact prefixes). The implicit deny applies if **no** rule matches.

**checkov reports nothing (step-05).** Check `public_network_access_enabled = true` is present in the `.tf`. A **hardened** config (public access disabled) **passes** — that's intended.

**The Python scripts print nothing.** Run `python3 file.py`; each script is standalone. Beware mixed tabs.

**Private endpoints won't deploy locally.** miniblue doesn't emulate them (like peering/private DNS). We **reason** about them and **validate** the requirement (public access disabled) in policy; execution targets real Azure.
:::
