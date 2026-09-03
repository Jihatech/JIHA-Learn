---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-reseau-fondamentaux
slug: azure-reseau-fondamentaux
order: 82
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — réseau fondamentaux (AZ-700) : VNet, adressage, DNS"
title_en: "Azure — network fundamentals (AZ-700): VNet, addressing, DNS"
tagline_fr: "planifier l'espace d'adressage, segmenter, résoudre les noms."
tagline_en: "plan the address space, segment, resolve names."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 250
repo: "hashicorp/terraform-provider-azurerm"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-projet-architecte]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [reseau, vnet, adressage-ip, cidr, sous-reseaux, dns-prive, topologie, hub-spoke, peering, az-700]
concepts_en: [network, vnet, ip-addressing, cidr, subnets, private-dns, topology, hub-spoke, peering, az-700]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Poser les fondations réseau pour l'AZ-700, en local et pour de vrai (miniblue) : planifier l'espace d'adressage (calculatrice CIDR exécutable, sous-réseaux non chevauchants, les 5 IP réservées par Azure), déployer un VNet avec sous-réseaux en tiers (Terraform live), la résolution de noms avec une zone DNS privée + enregistrement A (azlocal live), et la topologie hub-and-spoke avec la contrainte de non-chevauchement des plages (vérifiée en code). Sans compte cloud.",
og_description_en: "Laying network foundations for AZ-700, locally and for real (miniblue): planning the address space (a runnable CIDR calculator, non-overlapping subnets, the 5 IPs Azure reserves), deploying a VNet with tiered subnets (Terraform live), name resolution with a private DNS zone + A record (azlocal live), and the hub-and-spoke topology with the non-overlapping ranges constraint (checked in code). No cloud account."
---

## intro

:::lang fr
Le réseau est le **socle** sur lequel tout repose. L'examen **AZ-700** (Azure Network Engineer) en fait un métier à part entière : concevoir l'**adressage**, les **VNets**, le **routage**, la **connectivité hybride**, la **distribution** applicative. Ce premier guide pose les **fondations** — l'espace d'adressage, la segmentation et la résolution de noms — que toute la suite réutilise.

Fidèle à la méthode, on pratique **en local et pour de vrai** avec **miniblue** : on **planifie l'espace d'adressage** avec une **calculatrice CIDR exécutable** (sous-réseaux non chevauchants, les **5 IP réservées** par Azure), on **déploie un VNet** avec des **sous-réseaux en tiers** (Terraform, **live**), on met en place la **résolution de noms** avec une **zone DNS privée** et un **enregistrement A** (azlocal, live), et on raisonne la **topologie hub-and-spoke** avec la contrainte clé — **pas de chevauchement** des plages — vérifiée **en code**.

**Pour qui c'est :** tu connais Azure (AZ-104/305) et tu veux **maîtriser le réseau** en profondeur.

**Quand ce n'est PAS le bon choix :**

- Tu débutes → fais *Azure — réseau (AZ-104)* d'abord.
- Tu cherches la sécurité réseau (NSG, WAF) → c'est l'**AZ-500** ; ici c'est la **conception** réseau.
:::

:::lang en
The network is the **foundation** everything rests on. The **AZ-700** exam (Azure Network Engineer) makes it a full profession: designing **addressing**, **VNets**, **routing**, **hybrid connectivity**, application **delivery**. This first guide lays the **foundations** — the address space, segmentation and name resolution — the whole track reuses.

True to the method, we practice **locally and for real** with **miniblue**: we **plan the address space** with a **runnable CIDR calculator** (non-overlapping subnets, the **5 IPs** Azure reserves), we **deploy a VNet** with **tiered subnets** (Terraform, **live**), we set up **name resolution** with a **private DNS zone** and an **A record** (azlocal, live), and we reason about the **hub-and-spoke topology** with the key constraint — **no overlap** of ranges — checked **in code**.

**Who it's for:** you know Azure (AZ-104/305) and want to **master networking** in depth.

**When it's NOT the right choice:**

- You're a beginner → do *Azure — networking (AZ-104)* first.
- You want network security (NSG, WAF) → that's **AZ-500**; here it's network **design**.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- **Planifier** un espace d'adressage (CIDR) sans chevauchement.
- Calculer la **taille** d'un sous-réseau (et les **5 IP réservées** par Azure).
- **Déployer** un VNet avec des **sous-réseaux en tiers**.
- Comprendre le rôle du **GatewaySubnet** et des sous-réseaux spéciaux.
- Mettre en place la **résolution de noms** (zone **DNS privée** + enregistrement).
- Concevoir une **topologie hub-and-spoke** et vérifier le **non-chevauchement**.
- Distinguer **VNet**, **sous-réseau**, **peering** et **DNS**.
:::

:::lang en
By the end of this guide, you can:

- **Plan** a CIDR address space with no overlap.
- Compute a subnet's **size** (and the **5 IPs** Azure reserves).
- **Deploy** a VNet with **tiered subnets**.
- Understand the role of the **GatewaySubnet** and special subnets.
- Set up **name resolution** (a **private DNS zone** + record).
- Design a **hub-and-spoke topology** and check **non-overlap**.
- Distinguish **VNet**, **subnet**, **peering** and **DNS**.
:::

## prerequisites

:::lang fr
- Un **parcours Azure** : AZ-104 (réseau) et idéalement AZ-305.
- Le **lab local** : **miniblue** démarré (ports 4566/4567), **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`, `azlocal` sur le `PATH`.
- **Python 3** (module `ipaddress`, standard). **Aucun compte cloud** : VNet et DNS live, calculs en local.
:::

:::lang en
- An **Azure path**: AZ-104 (networking) and ideally AZ-305.
- The **local lab**: **miniblue** started (ports 4566/4567), **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`, `azlocal` on `PATH`.
- **Python 3** (`ipaddress` module, standard). **No cloud account**: VNet and DNS live, calculations local.
:::

## concepts

:::lang fr
**Le VNet : ton réseau privé.** Un **réseau virtuel** (VNet) est ton espace réseau **isolé** dans Azure, défini par un **espace d'adressage** (CIDR, ex. `10.0.0.0/16`). Il se découpe en **sous-réseaux** (subnets), chacun une **plage** plus fine (ex. `10.0.1.0/24`). Les ressources reçoivent une **IP privée** dans leur sous-réseau. Le VNet est le **contenant** ; les sous-réseaux **segmentent**.

**L'adressage CIDR.** Une plage `10.0.0.0/16` = **65 536** adresses ; un `/24` = **256**. Le **préfixe** (`/16`, `/24`) dit combien de bits sont **fixes** : plus il est grand, plus la plage est **petite**. Règle d'or : **planifier avant** de déployer — les plages ne doivent **jamais se chevaucher** (ni entre sous-réseaux, ni entre VNets qu'on connectera). Un chevauchement **casse** le routage et le peering.

**Les 5 IP réservées.** Azure **réserve 5 adresses** par sous-réseau : la **première** (adresse réseau), les **trois suivantes** (passerelle par défaut + DNS Azure), et la **dernière** (broadcast). Sur un `/24` (256 adresses), il reste donc **251 utilisables**. À prendre en compte pour dimensionner (un sous-réseau trop petit **manque** d'IP).

**Les sous-réseaux spéciaux.** Certains ont un **nom imposé** et un **rôle** : **GatewaySubnet** (obligatoire pour une passerelle VPN/ExpressRoute), **AzureBastionSubnet** (accès sécurisé), **AzureFirewallSubnet** (pare-feu). Leur **taille minimale** est contrainte (souvent `/27` ou plus large). On les **réserve** dans le plan d'adressage.

**La résolution de noms (DNS).** Les IP privées, c'est illisible. Le **DNS** traduit un **nom** (`app.interne.jiha.lab`) en **IP** (`10.0.1.10`). Azure fournit un DNS par défaut ; pour tes noms internes, tu crées une **zone DNS privée** avec des **enregistrements** (A, CNAME…). Liée à un VNet, elle résout tes noms **à l'intérieur** du réseau.

**La topologie hub-and-spoke.** Plutôt qu'un maillage complexe, on centralise : un **hub** (services partagés — pare-feu, passerelle, DNS) et des **spokes** (charges de travail) reliés au hub par **peering**. Le peering connecte deux VNets **directement** (trafic privé, faible latence) — à condition que leurs **plages ne se chevauchent pas**. C'est la topologie **de référence** en entreprise.

**Ce qui est live ici.** Le **VNet** et ses **sous-réseaux** se **déploient** sur miniblue (Terraform, live). La **zone DNS privée** et un **enregistrement A** se **créent** (azlocal, live). Le **plan d'adressage** (CIDR, non-chevauchement) est un **calcul exécutable** (`ipaddress`). Le **peering** se **raisonne** (miniblue ne l'émule pas) mais sa **contrainte** (non-chevauchement) est **vérifiée en code**. Tout sans compte cloud.
:::

:::lang en
**The VNet: your private network.** A **virtual network** (VNet) is your **isolated** network space in Azure, defined by an **address space** (CIDR, e.g. `10.0.0.0/16`). It's carved into **subnets**, each a finer **range** (e.g. `10.0.1.0/24`). Resources get a **private IP** in their subnet. The VNet is the **container**; subnets **segment**.

**CIDR addressing.** A `10.0.0.0/16` range = **65,536** addresses; a `/24` = **256**. The **prefix** (`/16`, `/24`) says how many bits are **fixed**: the bigger it is, the **smaller** the range. Golden rule: **plan before** deploying — ranges must **never overlap** (neither between subnets, nor between VNets you'll connect). An overlap **breaks** routing and peering.

**The 5 reserved IPs.** Azure **reserves 5 addresses** per subnet: the **first** (network address), the **next three** (default gateway + Azure DNS), and the **last** (broadcast). On a `/24` (256 addresses), **251 are usable**. Factor this into sizing (a too-small subnet **runs out** of IPs).

**Special subnets.** Some have a **mandatory name** and a **role**: **GatewaySubnet** (required for a VPN/ExpressRoute gateway), **AzureBastionSubnet** (secure access), **AzureFirewallSubnet** (firewall). Their **minimum size** is constrained (often `/27` or wider). You **reserve** them in the address plan.

**Name resolution (DNS).** Private IPs are unreadable. **DNS** translates a **name** (`app.interne.jiha.lab`) into an **IP** (`10.0.1.10`). Azure provides a default DNS; for your internal names, you create a **private DNS zone** with **records** (A, CNAME…). Linked to a VNet, it resolves your names **inside** the network.

**The hub-and-spoke topology.** Rather than a complex mesh, we centralize: a **hub** (shared services — firewall, gateway, DNS) and **spokes** (workloads) linked to the hub by **peering**. Peering connects two VNets **directly** (private traffic, low latency) — provided their **ranges don't overlap**. It's the enterprise **reference** topology.

**What's live here.** The **VNet** and its **subnets** are **deployed** on miniblue (Terraform, live). The **private DNS zone** and an **A record** are **created** (azlocal, live). The **address plan** (CIDR, non-overlap) is a **runnable calculation** (`ipaddress`). **Peering** is **reasoned** (miniblue doesn't emulate it) but its **constraint** (non-overlap) is **checked in code**. All without a cloud account.
:::

:::figure azure-reseau-fondamentaux-topologie
caption_fr: "Schéma 1. Les fondations réseau : un ESPACE D'ADRESSAGE planifié (CIDR sans chevauchement) découpé en SOUS-RÉSEAUX en tiers (web/app/data/gateway), chacun avec 5 IP réservées par Azure. Une ZONE DNS PRIVÉE résout les noms internes (app -> 10.0.1.10). Topologie HUB-AND-SPOKE : un hub (services partagés) et des spokes (charges) reliés par PEERING — à condition que les plages ne se chevauchent pas."
caption_en: "Figure 1. Network foundations: a planned ADDRESS SPACE (non-overlapping CIDR) carved into tiered SUBNETS (web/app/data/gateway), each with 5 IPs reserved by Azure. A PRIVATE DNS ZONE resolves internal names (app -> 10.0.1.10). HUB-AND-SPOKE topology: a hub (shared services) and spokes (workloads) linked by PEERING — provided ranges don't overlap."
:::

## walkthrough

:::lang fr
On avance ainsi : planifier l'espace d'adressage (CIDR) → déployer le VNet + sous-réseaux → dimensionner (IP réservées, sous-réseaux spéciaux) → résolution de noms (DNS privé) → topologie hub-and-spoke (non-chevauchement) → vérifier → fondation assemblée.
:::

:::lang en
We'll go like this: plan the address space (CIDR) → deploy the VNet + subnets → size (reserved IPs, special subnets) → name resolution (private DNS) → hub-and-spoke topology (non-overlap) → verify → foundation assembled.
:::

### step-01

:::lang fr
**Objectif.** **Planifier** l'espace d'adressage — CIDR, sous-réseaux non chevauchants.

**🤔 Planifier avant de déployer.** L'adressage est la **première** décision réseau — et la plus dure à changer après coup. On écrit une **calculatrice CIDR** qui découpe un VNet en sous-réseaux et calcule les IP utilisables.

Écris la calculatrice d'adressage et lance-la :
:::

:::lang en
**Goal.** **Plan** the address space — CIDR, non-overlapping subnets.

**🤔 Plan before deploying.** Addressing is the **first** network decision — and the hardest to change later. We write a **CIDR calculator** that carves a VNet into subnets and computes usable IPs.

Write the addressing calculator and run it:
:::

```bash
mkdir -p reseau-fond && cd reseau-fond
cat > adressage.py <<'PY'
import ipaddress
vnet = ipaddress.ip_network("10.0.0.0/16")
print(f"VNet : {vnet} -> {vnet.num_addresses} adresses")

noms = ["web", "app", "data", "gateway"]
sousreseaux = list(vnet.subnets(new_prefix=24))[:len(noms)]
for nom, s in zip(noms, sousreseaux):
    utilisables = s.num_addresses - 5   # Azure reserve 5 IP par sous-reseau
    print(f"  snet-{nom:8} {s} -> {utilisables} IP utilisables (Azure reserve 5)")
PY
python3 adressage.py
```

:::lang fr
**✅ Vérification :** la sortie affiche `VNet : 10.0.0.0/16 -> 65536 adresses`, puis les quatre sous-réseaux : `snet-web 10.0.0.0/24 -> 251 IP utilisables`, `snet-app 10.0.1.0/24`, `snet-data 10.0.2.0/24`, `snet-gateway 10.0.3.0/24`. Chaque `/24` offre **251 IP utilisables** (256 − 5 réservées). Le VNet `/16` laisse une **large marge** pour ajouter des sous-réseaux. C'est le **plan d'adressage** : décidé **avant** tout déploiement, sans chevauchement. On le **matérialise** maintenant.
:::

:::lang en
**✅ Check:** the output shows `VNet : 10.0.0.0/16 -> 65536 adresses`, then the four subnets: `snet-web 10.0.0.0/24 -> 251 IP utilisables`, `snet-app 10.0.1.0/24`, `snet-data 10.0.2.0/24`, `snet-gateway 10.0.3.0/24`. Each `/24` offers **251 usable IPs** (256 − 5 reserved). The `/16` VNet leaves **plenty of room** to add subnets. That's the **address plan**: decided **before** any deployment, no overlap. We **materialize** it now.
:::

### step-02

:::lang fr
**Objectif.** **Déployer** le VNet avec ses **sous-réseaux en tiers**.

**🤔 Du plan au réel.** On traduit le plan d'adressage en Terraform : un VNet `10.0.0.0/16` et trois sous-réseaux (web, app, data). On déploie **pour de vrai** sur miniblue.

Déploie le VNet et ses sous-réseaux :
:::

:::lang en
**Goal.** **Deploy** the VNet with its **tiered subnets**.

**🤔 From plan to reality.** We translate the address plan into Terraform: a `10.0.0.0/16` VNet and three subnets (web, app, data). We deploy **for real** on miniblue.

Deploy the VNet and its subnets:
:::

```bash
export SSL_CERT_FILE=$HOME/.miniblue/cert.pem
export ARM_ENVIRONMENT=public

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
  name     = "rg-reseau-fond"
  location = "westeurope"
}
resource "azurerm_virtual_network" "hub" {
  name                = "vnet-hub"
  location            = azurerm_resource_group.net.location
  resource_group_name = azurerm_resource_group.net.name
  address_space       = ["10.0.0.0/16"]
}
resource "azurerm_subnet" "web" {
  name                 = "snet-web"
  resource_group_name  = azurerm_resource_group.net.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = ["10.0.0.0/24"]
}
resource "azurerm_subnet" "app" {
  name                 = "snet-app"
  resource_group_name  = azurerm_resource_group.net.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = ["10.0.1.0/24"]
}
resource "azurerm_subnet" "data" {
  name                 = "snet-data"
  resource_group_name  = azurerm_resource_group.net.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = ["10.0.2.0/24"]
}
TF
terraform init -no-color >/dev/null 2>&1
terraform apply -auto-approve -no-color 2>&1 | grep -E "Apply complete"
```

:::lang fr
**✅ Vérification :** `apply` confirme `Apply complete! Resources: 5 added` — le groupe, le **VNet** `10.0.0.0/16` et ses **trois sous-réseaux** (web, app, data) sont **déployés** sur miniblue. Le plan d'adressage de l'étape 1 est maintenant **réel** : un réseau isolé, segmenté en tiers, prêt à héberger des ressources. Chaque sous-réseau a sa **plage** distincte — pas de chevauchement. On approfondit le **dimensionnement**.
:::

:::lang en
**✅ Check:** `apply` confirms `Apply complete! Resources: 5 added` — the group, the **VNet** `10.0.0.0/16` and its **three subnets** (web, app, data) are **deployed** on miniblue. The address plan from step 1 is now **real**: an isolated network, segmented into tiers, ready to host resources. Each subnet has its distinct **range** — no overlap. Let's go deeper on **sizing**.
:::

### step-03

:::lang fr
**Objectif.** Comprendre le **dimensionnement** — IP réservées et sous-réseaux spéciaux.

**🤔 Une adresse n'est pas toujours utilisable.** Azure **réserve 5 IP** par sous-réseau, et certains sous-réseaux (**GatewaySubnet**…) ont un **nom** et une **taille minimale** imposés. On calcule l'impact pour bien dimensionner.

Calcule les réservations et les tailles minimales :
:::

:::lang en
**Goal.** Understand **sizing** — reserved IPs and special subnets.

**🤔 An address isn't always usable.** Azure **reserves 5 IPs** per subnet, and some subnets (**GatewaySubnet**…) have a **mandatory name** and **minimum size**. We compute the impact to size correctly.

Compute reservations and minimum sizes:
:::

```bash
cat > dimensionnement.py <<'PY'
import ipaddress
print("=== IP utilisables selon le prefixe (Azure reserve 5) ===")
for prefixe in [24, 26, 27, 28, 29]:
    net = ipaddress.ip_network(f"10.0.0.0/{prefixe}")
    utilisables = net.num_addresses - 5
    print(f"  /{prefixe:2} -> {net.num_addresses:4} adresses -> {utilisables:4} utilisables")

print("=== Sous-reseaux speciaux (nom + taille mini imposes) ===")
speciaux = [
    ("GatewaySubnet",      "/27 (ou plus large) — passerelle VPN/ExpressRoute"),
    ("AzureBastionSubnet", "/26 (ou plus large) — acces securise"),
    ("AzureFirewallSubnet","/26 — pare-feu Azure"),
]
for nom, regle in speciaux:
    print(f"  {nom:20} {regle}")
PY
python3 dimensionnement.py
```

:::lang fr
**✅ Vérification :** la sortie montre l'impact des réservations : un `/29` (8 adresses) n'offre que **3 IP utilisables** — trop petit pour la plupart des usages ; un `/24` en laisse **251**. Puis les **sous-réseaux spéciaux** : `GatewaySubnet` (nom **obligatoire**, `/27` minimum pour une passerelle), `AzureBastionSubnet`, `AzureFirewallSubnet`. Deux enseignements : (1) ne **sous-dimensionne** pas un sous-réseau (les 5 IP réservées font mal sur les petites plages) ; (2) **réserve** les plages des sous-réseaux spéciaux **dès le plan**. Le dimensionnement se pense **avant**, pas après.
:::

:::lang en
**✅ Check:** the output shows the reservation impact: a `/29` (8 addresses) offers only **3 usable IPs** — too small for most uses; a `/24` leaves **251**. Then the **special subnets**: `GatewaySubnet` (**mandatory** name, `/27` minimum for a gateway), `AzureBastionSubnet`, `AzureFirewallSubnet`. Two lessons: (1) don't **undersize** a subnet (the 5 reserved IPs hurt on small ranges); (2) **reserve** the special subnets' ranges **from the plan**. Sizing is thought **before**, not after.
:::

### step-04

:::lang fr
**Objectif.** Mettre en place la **résolution de noms** — zone DNS privée + enregistrement.

**🤔 Des noms, pas des IP.** `10.0.1.10` est illisible ; `app.interne.jiha.lab` parle. On crée une **zone DNS privée** et un **enregistrement A** qui associe un nom à une IP — **pour de vrai** sur miniblue.

Crée la zone DNS et un enregistrement :
:::

:::lang en
**Goal.** Set up **name resolution** — private DNS zone + record.

**🤔 Names, not IPs.** `10.0.1.10` is unreadable; `app.interne.jiha.lab` speaks. We create a **private DNS zone** and an **A record** mapping a name to an IP — **for real** on miniblue.

Create the DNS zone and a record:
:::

```bash
azlocal group create --name rg-reseau-fond --location westeurope >/dev/null 2>&1

# Zone DNS privee / private DNS zone
azlocal dns zone create --resource-group rg-reseau-fond --name interne.jiha.lab 2>/dev/null \
  | python3 -c "import sys,json; print('zone creee / zone created:', json.load(sys.stdin)['name'])"

# Enregistrement A : app -> 10.0.1.10 / A record
azlocal dns record create --resource-group rg-reseau-fond --zone interne.jiha.lab --name app --type A --value 10.0.1.10 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('enregistrement / record:', d['name'], '(type', d.get('type','A').split('/')[-1] + ')')"

# Lister les zones / list zones
azlocal dns zone list --resource-group rg-reseau-fond 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); z=d['value'] if isinstance(d,dict) else d; print('zones:', [x['name'] for x in z])"
```

:::lang fr
**✅ Vérification :** la sortie confirme `zone creee : interne.jiha.lab`, `enregistrement : app (type A)`, et `zones: ['interne.jiha.lab']`. Tu as une **zone DNS privée** avec un enregistrement `app` → `10.0.1.10`. Liée à un VNet (en vrai Azure), elle résout `app.interne.jiha.lab` en `10.0.1.10` **à l'intérieur** du réseau — les apps s'appellent par **nom**, pas par IP (qui peut changer). C'est la **résolution de noms interne**, indispensable dès qu'on a plus de deux ressources. Reste à connecter plusieurs réseaux : la **topologie**.
:::

:::lang en
**✅ Check:** the output confirms `zone creee : interne.jiha.lab`, `enregistrement : app (type A)`, and `zones: ['interne.jiha.lab']`. You have a **private DNS zone** with an `app` → `10.0.1.10` record. Linked to a VNet (in real Azure), it resolves `app.interne.jiha.lab` to `10.0.1.10` **inside** the network — apps call each other by **name**, not IP (which can change). That's **internal name resolution**, essential as soon as you have more than two resources. Now to connect several networks: the **topology**.
:::

### step-05

:::lang fr
**Objectif.** Concevoir une **topologie hub-and-spoke** — et vérifier le **non-chevauchement**.

**🤔 Centraliser, sans chevaucher.** Un **hub** (services partagés) et des **spokes** (charges) reliés par **peering**. La contrainte **absolue** : les plages des VNets **ne doivent pas se chevaucher**, sinon le peering **échoue**. On écrit un vérificateur.

Vérifie la compatibilité des plages hub/spoke :
:::

:::lang en
**Goal.** Design a **hub-and-spoke topology** — and check **non-overlap**.

**🤔 Centralize, without overlapping.** A **hub** (shared services) and **spokes** (workloads) linked by **peering**. The **absolute** constraint: the VNets' ranges **must not overlap**, otherwise peering **fails**. We write a checker.

Check hub/spoke range compatibility:
:::

```bash
cat > topologie.py <<'PY'
import ipaddress
hub = ipaddress.ip_network("10.0.0.0/16")
spokes = {
    "spoke-prod": "10.1.0.0/16",
    "spoke-dev":  "10.2.0.0/16",
    "spoke-faux": "10.0.5.0/24",   # CHEVAUCHE le hub -> peering impossible
}
print(f"HUB : {hub}")
for nom, plage in spokes.items():
    net = ipaddress.ip_network(plage)
    chevauche = net.overlaps(hub)
    verdict = "❌ CHEVAUCHE le hub (peering impossible)" if chevauche else "✅ compatible (peering OK)"
    print(f"  {nom:12} {plage:14} -> {verdict}")
PY
python3 topologie.py
```

:::lang fr
**✅ Vérification :** la sortie montre `HUB : 10.0.0.0/16`, puis `spoke-prod 10.1.0.0/16 -> ✅ compatible`, `spoke-dev 10.2.0.0/16 -> ✅ compatible`, mais `spoke-faux 10.0.5.0/24 -> ❌ CHEVAUCHE le hub (peering impossible)`. La topologie **hub-and-spoke** relie chaque spoke au hub par **peering** — mais **uniquement** si les plages **ne se chevauchent pas**. `spoke-faux` est **inclus** dans le hub (`10.0.x`) : le peering **échouerait**. C'est **la** raison pour laquelle on **planifie l'adressage globalement** (étape 1) avant de créer le moindre VNet. Non-chevauchement = règle d'or du réseau Azure.
:::

:::lang en
**✅ Check:** the output shows `HUB : 10.0.0.0/16`, then `spoke-prod 10.1.0.0/16 -> ✅ compatible`, `spoke-dev 10.2.0.0/16 -> ✅ compatible`, but `spoke-faux 10.0.5.0/24 -> ❌ CHEVAUCHE le hub (peering impossible)`. The **hub-and-spoke** topology links each spoke to the hub by **peering** — but **only** if ranges **don't overlap**. `spoke-faux` is **inside** the hub (`10.0.x`): peering **would fail**. That's **the** reason you **plan addressing globally** (step 1) before creating any VNet. Non-overlap = golden rule of Azure networking.
:::

### step-06

:::lang fr
**Objectif.** **Vérifier** la fondation déployée — sous-réseaux et résolution.

**🤔 Contrôler ce qui est en place.** On liste ce qu'on a déployé (VNet, sous-réseaux) et on confirme la **cohérence** du plan d'adressage sur le réel.

Vérifie les sous-réseaux déployés :
:::

:::lang en
**Goal.** **Verify** the deployed foundation — subnets and resolution.

**🤔 Check what's in place.** We list what we deployed (VNet, subnets) and confirm the address plan's **consistency** against reality.

Verify the deployed subnets:
:::

```bash
cd ..
cd reseau-fond
# Confirmer les plages depuis l'etat Terraform / confirm ranges from Terraform state
terraform state list 2>/dev/null | grep -E "subnet|virtual_network" | head
echo "--- plages planifiees (rappel) / planned ranges (recap) ---"
python3 -c "
import ipaddress
vnet = ipaddress.ip_network('10.0.0.0/16')
subs = {'web':'10.0.0.0/24','app':'10.0.1.0/24','data':'10.0.2.0/24'}
for nom, plage in subs.items():
    net = ipaddress.ip_network(plage)
    dans = net.subnet_of(vnet)
    print(f'  snet-{nom:5} {plage} -> {\"dans le VNet\" if dans else \"HORS VNet\"} ✓' if dans else f'  snet-{nom} HORS VNet')
"
```

:::lang fr
**✅ Vérification :** `terraform state list` confirme le VNet et les trois sous-réseaux (`azurerm_subnet.web/app/data`, `azurerm_virtual_network.hub`), et le calcul confirme que **chaque sous-réseau est bien inclus** dans le VNet `10.0.0.0/16` (`dans le VNet ✓`). La fondation est **cohérente** : le plan d'adressage (étape 1) correspond au **déployé** (étape 2), sans chevauchement, avec la résolution de noms (étape 4). C'est ce contrôle qui évite les surprises de routage. On récapitule la fondation.
:::

:::lang en
**✅ Check:** `terraform state list` confirms the VNet and the three subnets (`azurerm_subnet.web/app/data`, `azurerm_virtual_network.hub`), and the calculation confirms **each subnet is indeed inside** the `10.0.0.0/16` VNet (`dans le VNet ✓`). The foundation is **consistent**: the address plan (step 1) matches the **deployed** (step 2), no overlap, with name resolution (step 4). This check avoids routing surprises. Let's recap the foundation.
:::

### step-07

:::lang fr
**Objectif.** Assembler la **fondation réseau** et nettoyer.

**🤔 Les fondations, ensemble.** On récapitule ce qui compose une base réseau saine — adressage, segmentation, DNS, topologie — puis on nettoie le lab.

Récapitule la fondation et nettoie :
:::

:::lang en
**Goal.** Assemble the **network foundation** and clean up.

**🤔 The foundations, together.** We recap what makes a sound network base — addressing, segmentation, DNS, topology — then clean the lab.

Recap the foundation and clean up:
:::

```bash
echo "=== Fondation reseau (AZ-700) / network foundation ==="
printf "%-22s %s\n" "Adressage (CIDR)"   "planifie AVANT, sans chevauchement (regle d'or)"
printf "%-22s %s\n" "VNet + sous-reseaux" "un contenant /16, des tiers /24 (web/app/data)"
printf "%-22s %s\n" "Dimensionnement"    "5 IP reservees/sous-reseau ; sous-reseaux speciaux"
printf "%-22s %s\n" "Resolution (DNS)"   "zone privee + enregistrements (nom -> IP)"
printf "%-22s %s\n" "Topologie"          "hub-and-spoke, peering (plages non chevauchantes)"

# Nettoyer le lab / clean up
terraform destroy -auto-approve -no-color 2>&1 | grep -E "Destroy complete"
azlocal group delete --name rg-reseau-fond >/dev/null 2>&1 && echo "rg-reseau-fond supprime / deleted"
```

:::lang fr
**✅ Vérification :** la table récapitule les **cinq briques** de la fondation réseau, puis `Destroy complete!` et `rg-reseau-fond supprime` nettoient le lab. Tu tiens les **fondations AZ-700** : **planifier l'adressage** (CIDR, non-chevauchement), **segmenter** (VNet + sous-réseaux), **dimensionner** (IP réservées, sous-réseaux spéciaux), **résoudre les noms** (DNS privé) et concevoir la **topologie** (hub-and-spoke). Sur cette base saine, tout le reste tient : le **routage**, la **connectivité hybride**, la **distribution** applicative — la suite du track AZ-700.
:::

:::lang en
**✅ Check:** the table recaps the **five building blocks** of the network foundation, then `Destroy complete!` and `rg-reseau-fond supprime` clean the lab. You hold the **AZ-700 foundations**: **plan addressing** (CIDR, non-overlap), **segment** (VNet + subnets), **size** (reserved IPs, special subnets), **resolve names** (private DNS) and design the **topology** (hub-and-spoke). On this sound base, everything else stands: **routing**, **hybrid connectivity**, application **delivery** — the rest of the AZ-700 track.
:::

## pitfalls

:::lang fr
**1. Ne pas planifier l'adressage.** Improviser les plages mène au **chevauchement** — qui casse peering et routage. Planifie **globalement, avant**.

**2. Sous-réseaux qui se chevauchent.** Deux sous-réseaux (ou VNets) sur des plages qui se recoupent = **erreur**. Vérifie en amont.

**3. Oublier les 5 IP réservées.** Un `/29` ne donne que **3** IP utilisables. Dimensionne en tenant compte des réservations.

**4. Mal nommer les sous-réseaux spéciaux.** `GatewaySubnet` doit s'appeler **exactement** ainsi, avec une **taille minimale**. Réserve sa plage dès le plan.

**5. Adresser par IP en dur.** Les IP changent ; les **noms** non. Utilise le **DNS** (zone privée + enregistrements).

**6. Peering avec plages qui se chevauchent.** Le peering **échoue** si les espaces d'adressage se recoupent. Non-chevauchement obligatoire.

**7. VNet trop petit.** Un `/24` de VNet limite fortement la croissance. Un `/16` laisse de la marge — dimensionne large au niveau VNet.
:::

:::lang en
**1. Not planning addressing.** Improvising ranges leads to **overlap** — which breaks peering and routing. Plan **globally, first**.

**2. Overlapping subnets.** Two subnets (or VNets) on intersecting ranges = **error**. Check upfront.

**3. Forgetting the 5 reserved IPs.** A `/29` gives only **3** usable IPs. Size accounting for reservations.

**4. Misnaming special subnets.** `GatewaySubnet` must be named **exactly** that, with a **minimum size**. Reserve its range from the plan.

**5. Addressing by hardcoded IP.** IPs change; **names** don't. Use **DNS** (private zone + records).

**6. Peering with overlapping ranges.** Peering **fails** if address spaces intersect. Non-overlap is mandatory.

**7. VNet too small.** A `/24` VNet strongly limits growth. A `/16` leaves room — size wide at the VNet level.
:::

## success

:::lang fr
Tu as réussi si :

- Tu **planifies** un espace d'adressage CIDR sans chevauchement.
- Tu calcules les **IP utilisables** (les 5 réservées d'Azure).
- Tu **déploies** un VNet avec des **sous-réseaux en tiers**.
- Tu connais les **sous-réseaux spéciaux** (GatewaySubnet…) et leur taille.
- Tu crées une **zone DNS privée** + un enregistrement (nom → IP).
- Tu vérifies le **non-chevauchement** pour une topologie **hub-and-spoke**.
:::

:::lang en
You've succeeded if:

- You **plan** a non-overlapping CIDR address space.
- You compute **usable IPs** (Azure's 5 reserved).
- You **deploy** a VNet with **tiered subnets**.
- You know the **special subnets** (GatewaySubnet…) and their size.
- You create a **private DNS zone** + a record (name → IP).
- You check **non-overlap** for a **hub-and-spoke** topology.
:::

## next

:::lang fr
- **Suivant :** *Azure — routage réseau (AZ-700)* — tables de routes, UDR, routes effectives, tunneling forcé.
- **Réviser :** *Azure — réseau (AZ-104)* pour VNet/sous-réseaux.
- **S'entraîner :** ajoute un `GatewaySubnet` et un 4e spoke à `topologie.py`, et calcule un plan d'adressage pour 10 sous-réseaux.
:::

:::lang en
- **Next:** *Azure — network routing (AZ-700)* — route tables, UDR, effective routes, forced tunneling.
- **Review:** *Azure — networking (AZ-104)* for VNet/subnets.
- **Practice:** add a `GatewaySubnet` and a 4th spoke to `topologie.py`, and compute an address plan for 10 subnets.
:::

## cheatsheet

:::lang fr
**Adressage CIDR (Python `ipaddress`)**

```python
import ipaddress
vnet = ipaddress.ip_network("10.0.0.0/16")   # 65536 adresses
list(vnet.subnets(new_prefix=24))            # decouper en /24
net.num_addresses - 5                        # IP utilisables (Azure reserve 5)
a.overlaps(b)                                # deux plages se chevauchent-elles ?
a.subnet_of(b)                               # a est-il inclus dans b ?
```

**Tailles utiles (Azure reserve 5 IP)**

```text
/24 -> 256 adr -> 251 utilisables
/26 ->  64     ->  59
/27 ->  32     ->  27   (GatewaySubnet minimum)
/29 ->   8     ->   3   (trop petit en general)
```

**Sous-reseaux speciaux (nom impose)**

```text
GatewaySubnet        /27+  passerelle VPN/ExpressRoute
AzureBastionSubnet   /26+  acces securise
AzureFirewallSubnet  /26   pare-feu Azure
```

**DNS prive (live)**

```bash
azlocal dns zone create   --resource-group RG --name interne.exemple.lab
azlocal dns record create --resource-group RG --zone interne.exemple.lab --name app --type A --value 10.0.1.10
```
:::

:::lang en
**CIDR addressing (Python `ipaddress`)**

```python
import ipaddress
vnet = ipaddress.ip_network("10.0.0.0/16")   # 65536 addresses
list(vnet.subnets(new_prefix=24))            # carve into /24
net.num_addresses - 5                        # usable IPs (Azure reserves 5)
a.overlaps(b)                                # do two ranges overlap?
a.subnet_of(b)                               # is a inside b?
```

**Useful sizes (Azure reserves 5 IPs)**

```text
/24 -> 256 addr -> 251 usable
/26 ->  64      ->  59
/27 ->  32      ->  27   (GatewaySubnet minimum)
/29 ->   8      ->   3   (usually too small)
```

**Special subnets (mandatory name)**

```text
GatewaySubnet        /27+  VPN/ExpressRoute gateway
AzureBastionSubnet   /26+  secure access
AzureFirewallSubnet  /26   Azure firewall
```

**Private DNS (live)**

```bash
azlocal dns zone create   --resource-group RG --name internal.example.lab
azlocal dns record create --resource-group RG --zone internal.example.lab --name app --type A --value 10.0.1.10
```
:::

## resources

:::lang fr
- **AZ-700** : Designing and Implementing Microsoft Azure Networking Solutions — objectifs officiels, Microsoft Learn.
- **Réseaux virtuels (VNet)** : espaces d'adressage, sous-réseaux, IP — Microsoft Learn.
- **Adressage IP & CIDR** : plans d'adressage, planification — Microsoft Learn.
- **Azure DNS / DNS privé** : zones, enregistrements, résolution — Microsoft Learn.
- **Hub-and-spoke** : topologie de référence, peering — Cloud Adoption Framework / Microsoft Learn.
- **miniblue** : émulateur Azure local (community, non officiel) — github.com/moabukar/miniblue.
:::

:::lang en
- **AZ-700**: Designing and Implementing Microsoft Azure Networking Solutions — official objectives, Microsoft Learn.
- **Virtual networks (VNet)**: address spaces, subnets, IP — Microsoft Learn.
- **IP addressing & CIDR**: address plans, planning — Microsoft Learn.
- **Azure DNS / private DNS**: zones, records, resolution — Microsoft Learn.
- **Hub-and-spoke**: reference topology, peering — Cloud Adoption Framework / Microsoft Learn.
- **miniblue**: local Azure emulator (community, unofficial) — github.com/moabukar/miniblue.
:::

## troubleshooting

:::lang fr
**`terraform` : erreur TLS / certificat (step-02).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` et vérifie que miniblue tourne (port 4567).

**`Apply` déploie moins de 5 ressources.** Vérifie que `main.tf` contient le RG, le VNet **et** les trois sous-réseaux, en HCL **multi-ligne** (un bloc sur une seule ligne casse tout).

**`azlocal dns` : erreur.** Le groupe de ressources doit exister (`azlocal group create` au step-04). Vérifie aussi que miniblue tourne et que `azlocal` est sur le `PATH`.

**Mon `/29` n'a « que » 3 IP.** C'est normal : 8 adresses − 5 réservées par Azure = 3. Prends un préfixe **plus large** pour un vrai sous-réseau.

**Le peering échoue (en vrai Azure).** Les espaces d'adressage se **chevauchent**. Vérifie avec `a.overlaps(b)` (step-05) : les plages des VNets à connecter doivent être **disjointes**.

**`ipaddress` : `has host bits set`.** Ta plage n'est pas alignée sur son préfixe (ex. `10.0.0.5/24`). Utilise l'**adresse réseau** (`10.0.0.0/24`) ou ajoute `strict=False`.
:::

:::lang en
**`terraform`: TLS / certificate error (step-02).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` and check miniblue is running (port 4567).

**`Apply` deploys fewer than 5 resources.** Check `main.tf` holds the RG, the VNet **and** the three subnets, in **multi-line** HCL (a single-line block breaks everything).

**`azlocal dns`: error.** The resource group must exist (`azlocal group create` in step-04). Also check miniblue is running and `azlocal` is on `PATH`.

**My `/29` has "only" 3 IPs.** That's normal: 8 addresses − 5 reserved by Azure = 3. Use a **wider** prefix for a real subnet.

**Peering fails (in real Azure).** The address spaces **overlap**. Check with `a.overlaps(b)` (step-05): the VNets' ranges to connect must be **disjoint**.

**`ipaddress`: `has host bits set`.** Your range isn't aligned to its prefix (e.g. `10.0.0.5/24`). Use the **network address** (`10.0.0.0/24`) or add `strict=False`.
:::
