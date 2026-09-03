---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-projet-reseau
slug: azure-projet-reseau
order: 87
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — projet réseau (AZ-700) : concevoir une topologie complète"
title_en: "Azure — network project (AZ-700): design a complete topology"
tagline_fr: "adressage, hub-spoke, routage, accès privé — sur un réseau réel."
tagline_en: "addressing, hub-spoke, routing, private access — on a real network."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 320
repo: "hashicorp/terraform-provider-azurerm"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-reseau-acces-prive]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [projet-reseau, hub-spoke, adressage, peering, routage, udr, private-endpoint, distribution, capstone, az-700]
concepts_en: [network-project, hub-spoke, addressing, peering, routing, udr, private-endpoint, delivery, capstone, az-700]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet de CV du track AZ-700 : concevoir ET implémenter une topologie réseau hub-and-spoke complète, en local et pour de vrai. Un plan d'adressage sans chevauchement, un hub et un spoke déployés live sur miniblue (VNets + sous-réseaux, dont AzureFirewallSubnet), le peering et sa contrainte de non-chevauchement, le routage par UDR (tunneling forcé vers le pare-feu du hub, validé en Bicep + moteur), l'accès privé au PaaS (point de terminaison privé + DNS privatelink live), et le choix de distribution. Puis l'emballage CV. Sans compte ni facture.",
og_description_en: "The AZ-700 track's CV project: designing AND implementing a complete hub-and-spoke network topology, locally and for real. A non-overlapping address plan, a hub and a spoke deployed live on miniblue (VNets + subnets, including AzureFirewallSubnet), peering and its non-overlap constraint, UDR routing (forced tunneling to the hub firewall, validated in Bicep + engine), private access to PaaS (private endpoint + live privatelink DNS), and the delivery choice. Then CV packaging. No account or bill."
---

## intro

:::lang fr
C'est le **projet de synthèse** du track **AZ-700** — et de tout le parcours réseau. Tu as appris, un pilier à la fois : l'**adressage**, le **routage**, la **connectivité hybride**, la **distribution**, l'**accès privé**. Ici, tu **assembles tout** en **une topologie réseau complète** — le genre de conception qui tient sur un CV d'**ingénieur réseau Azure**.

Fidèle à la méthode, tout est **local et pour de vrai** : un **plan d'adressage** sans chevauchement, un **hub** et un **spoke** **déployés live** sur **miniblue** (VNets + sous-réseaux, dont un `AzureFirewallSubnet`), le **peering** et sa contrainte de **non-chevauchement**, le **routage par UDR** (**tunneling forcé** vers le pare-feu du hub, validé en **Bicep** + moteur), l'**accès privé** au PaaS (**point de terminaison privé** + **DNS privatelink** live), et le **choix de distribution**. On finit par l'**emballage CV**.

**Pour qui c'est :** tu as fait les cinq guides AZ-700 et tu veux un **livrable** qui prouve tes compétences réseau.

**Ce que tu vas produire :** une **topologie hub-and-spoke** conçue et **déployée** (adressage + VNets + peering + routage + accès privé), avec un **schéma** de conception et une **fiche CV** qui la résume.
:::

:::lang en
This is the **capstone** of the **AZ-700** track — and of the whole networking path. You learned, one pillar at a time: **addressing**, **routing**, **hybrid connectivity**, **delivery**, **private access**. Here you **assemble everything** into **a complete network topology** — the kind of design that fits an **Azure Network Engineer**'s CV.

True to the method, everything is **local and for real**: a non-overlapping **address plan**, a **hub** and a **spoke** **deployed live** on **miniblue** (VNets + subnets, including an `AzureFirewallSubnet`), **peering** and its **non-overlap** constraint, **UDR routing** (**forced tunneling** to the hub firewall, validated in **Bicep** + engine), **private access** to PaaS (**private endpoint** + live **privatelink DNS**), and the **delivery choice**. We finish with **CV packaging**.

**Who it's for:** you did the five AZ-700 guides and want a **deliverable** that proves your networking skills.

**What you'll produce:** a **hub-and-spoke topology** designed and **deployed** (addressing + VNets + peering + routing + private access), with a design **diagram** and a **CV sheet** summarizing it.
:::

## objectives

:::lang fr
À la fin de ce projet, tu sais :

- **Planifier** un espace d'adressage hub-and-spoke sans chevauchement.
- **Déployer** un hub et un spoke (VNets + sous-réseaux, dont spéciaux).
- Concevoir le **peering** et vérifier le **non-chevauchement**.
- Router par **UDR** (tunneling forcé vers le pare-feu du hub).
- Rendre un PaaS **privé** (point de terminaison privé + DNS privatelink).
- **Choisir** la distribution applicative adaptée.
- **Emballer** la conception réseau pour le CV.
:::

:::lang en
By the end of this project, you can:

- **Plan** a non-overlapping hub-and-spoke address space.
- **Deploy** a hub and a spoke (VNets + subnets, including special ones).
- Design **peering** and check **non-overlap**.
- Route by **UDR** (forced tunneling to the hub firewall).
- Make a PaaS **private** (private endpoint + privatelink DNS).
- **Choose** the right application delivery.
- **Package** the network design for the CV.
:::

## prerequisites

:::lang fr
- **Tous les guides AZ-700** : fondamentaux, routage, hybride, distribution, accès privé.
- Le **lab local** : **miniblue** démarré, **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`, `azlocal` sur le `PATH`, **Bicep CLI**, **Python 3**.
- **Aucun compte cloud** : le réseau cible l'émulateur ; routage/accès privé validés en local.
:::

:::lang en
- **All AZ-700 guides**: fundamentals, routing, hybrid, delivery, private access.
- The **local lab**: **miniblue** started, **Terraform**, `SSL_CERT_FILE=$HOME/.miniblue/cert.pem`, `azlocal` on `PATH`, **Bicep CLI**, **Python 3**.
- **No cloud account**: the network targets the emulator; routing/private access validated locally.
:::

## concepts

:::lang fr
**Une topologie réseau, cinq décisions.** Le projet relie ce que tu as vu séparément, dans l'ordre où on **conçoit** un réseau :

1. **Adressage.** La **première** décision, la plus dure à changer : un plan **CIDR** global, **sans chevauchement** entre hub et spokes (sinon le peering échoue). On réserve aussi les **sous-réseaux spéciaux** (firewall, gateway).
2. **Topologie hub-and-spoke.** Un **hub** central (services partagés : pare-feu, passerelle, DNS) et des **spokes** (charges de travail) reliés par **peering**. Le peering est **non transitif** : le hub **centralise** et **relaie**.
3. **Routage.** Par défaut, chaque spoke sort **directement** vers Internet. On impose une **UDR** (`0.0.0.0/0` → pare-feu du hub) : **tunneling forcé** — tout l'egress est **inspecté** au hub. Le préfixe le plus long garde le trafic **intra-VNet** local.
4. **Accès privé.** Les données (PaaS) sortent d'Internet : un **point de terminaison privé** leur donne une **IP privée** dans un spoke, avec l'**intégration DNS privatelink** et la **fermeture** de l'accès public.
5. **Distribution.** L'application est **répartie** et **fiabilisée** : on **choisit** le bon équilibreur (L4/L7, régional/global) selon la charge.

**Concevoir ET implémenter.** L'AZ-700 ne demande pas que de la théorie : il faut **concevoir** (le plan, les choix) **et implémenter** (déployer, valider). Les quatre premières décisions **structurent** ; la cinquième **sert** l'application. Un vrai ingénieur réseau fait **les deux** — et sait le **montrer**.

**Pourquoi ça vaut pour un CV.** Ce projet prouve, **preuves à l'appui**, que tu sais : planifier un adressage sans chevauchement, déployer une topologie hub-and-spoke, contrôler les chemins par routage (tunneling forcé), privatiser l'accès au PaaS, et choisir la distribution. C'est **exactement** le périmètre **AZ-700** — et le quotidien d'un **Azure Network Engineer**.

**Ce qui est live ici.** Le **hub** et le **spoke** (VNets + sous-réseaux) se **déploient** sur miniblue (Terraform, live). La **zone DNS privatelink** se **crée** (azlocal, live). Le **peering**, le **routage** (UDR) et le **point de terminaison privé** se **valident** (Bicep) et se **raisonnent** (moteurs) — miniblue ne les exécute pas. Le **choix de distribution** est un **moteur**. Tout **sans compte cloud**.
:::

:::lang en
**A network topology, five decisions.** The project connects what you saw separately, in the order you **design** a network:

1. **Addressing.** The **first** decision, hardest to change: a global **CIDR** plan, **non-overlapping** between hub and spokes (else peering fails). You also reserve the **special subnets** (firewall, gateway).
2. **Hub-and-spoke topology.** A central **hub** (shared services: firewall, gateway, DNS) and **spokes** (workloads) linked by **peering**. Peering is **non-transitive**: the hub **centralizes** and **relays**.
3. **Routing.** By default, each spoke egresses **directly** to the Internet. We enforce a **UDR** (`0.0.0.0/0` → hub firewall): **forced tunneling** — all egress is **inspected** at the hub. Longest prefix keeps **intra-VNet** traffic local.
4. **Private access.** Data (PaaS) leaves the Internet: a **private endpoint** gives it a **private IP** in a spoke, with the **privatelink DNS integration** and the **closure** of public access.
5. **Delivery.** The application is **spread** and **hardened**: we **choose** the right balancer (L4/L7, regional/global) by load.

**Design AND implement.** AZ-700 asks for more than theory: you must **design** (the plan, the choices) **and implement** (deploy, validate). The first four decisions **structure**; the fifth **serves** the application. A real network engineer does **both** — and can **show** it.

**Why it's CV-worthy.** This project proves, **with evidence**, that you can: plan non-overlapping addressing, deploy a hub-and-spoke topology, control paths by routing (forced tunneling), privatize PaaS access, and choose delivery. That's **exactly** the **AZ-700** scope — and an **Azure Network Engineer**'s daily work.

**What's live here.** The **hub** and the **spoke** (VNets + subnets) are **deployed** on miniblue (Terraform, live). The **privatelink DNS zone** is **created** (azlocal, live). **Peering**, **routing** (UDR) and the **private endpoint** are **validated** (Bicep) and **reasoned** (engines) — miniblue doesn't execute them. The **delivery choice** is an **engine**. All **without a cloud account**.
:::

:::figure azure-projet-reseau-topologie
caption_fr: "Schéma 1. La topologie complète : un plan d'ADRESSAGE sans chevauchement (hub 10.0.0.0/16, spoke 10.1.0.0/16). Le HUB porte les services partagés (AzureFirewallSubnet). Le SPOKE (charge de travail) est relié par PEERING. Le ROUTAGE (UDR 0.0.0.0/0 → pare-feu du hub) force l'egress par le hub (tunneling forcé). Le PaaS est PRIVÉ (point de terminaison privé + DNS privatelink, accès public coupé). La DISTRIBUTION répartit la charge. Cinq piliers AZ-700 sur une seule topologie, prête pour le CV."
caption_en: "Figure 1. The complete topology: a non-overlapping ADDRESS plan (hub 10.0.0.0/16, spoke 10.1.0.0/16). The HUB holds shared services (AzureFirewallSubnet). The SPOKE (workload) is linked by PEERING. ROUTING (UDR 0.0.0.0/0 → hub firewall) forces egress through the hub (forced tunneling). The PaaS is PRIVATE (private endpoint + privatelink DNS, public access cut). DELIVERY spreads the load. Five AZ-700 pillars on one topology, CV-ready."
:::

## walkthrough

:::lang fr
On avance ainsi : plan d'adressage (non-chevauchement) → déployer hub + spoke (live) → peering → routage UDR (tunneling forcé) → accès privé (point de terminaison + DNS) → choix de distribution → emballage CV & teardown.
:::

:::lang en
We'll go like this: address plan (non-overlap) → deploy hub + spoke (live) → peering → UDR routing (forced tunneling) → private access (endpoint + DNS) → delivery choice → CV packaging & teardown.
:::

### step-01

:::lang fr
**Objectif.** **Planifier** l'adressage hub-and-spoke — sans chevauchement.

**🤔 D'abord le plan.** On alloue des plages **disjointes** : hub `10.0.0.0/16`, spoke `10.1.0.0/16`. On **vérifie** qu'elles ne se chevauchent pas (sinon le peering échouera).

Planifie et vérifie l'adressage :
:::

:::lang en
**Goal.** **Plan** the hub-and-spoke addressing — no overlap.

**🤔 The plan first.** We allocate **disjoint** ranges: hub `10.0.0.0/16`, spoke `10.1.0.0/16`. We **check** they don't overlap (else peering will fail).

Plan and verify the addressing:
:::

```bash
mkdir -p projet-reseau/infra && cd projet-reseau
cat > plan.py <<'PY'
import ipaddress
reseaux = {"hub": "10.0.0.0/16", "spoke": "10.1.0.0/16"}
nets = {n: ipaddress.ip_network(p) for n, p in reseaux.items()}
print("Plan d'adressage :")
for n, net in nets.items():
    print(f"  {n:6} {net} ({net.num_addresses} adresses)")
h, s = nets["hub"], nets["spoke"]
print(f"Chevauchement hub/spoke ? {'❌ OUI (peering impossible)' if h.overlaps(s) else '✅ NON (peering OK)'}")
PY
python3 plan.py
```

:::lang fr
**✅ Vérification :** la sortie affiche le plan (`hub 10.0.0.0/16`, `spoke 10.1.0.0/16`) et `Chevauchement hub/spoke ? ✅ NON (peering OK)`. Les plages sont **disjointes** — condition **absolue** pour le peering (et pour tout le reste). C'est la **première** décision de conception, prise **avant** de déployer quoi que ce soit. Sur cette base saine, on **construit**.
:::

:::lang en
**✅ Check:** the output shows the plan (`hub 10.0.0.0/16`, `spoke 10.1.0.0/16`) and `Chevauchement hub/spoke ? ✅ NON (peering OK)`. The ranges are **disjoint** — the **absolute** condition for peering (and for everything else). It's the **first** design decision, taken **before** deploying anything. On this sound base, we **build**.
:::

### step-02

:::lang fr
**Objectif.** **Déployer** le hub et le spoke — VNets + sous-réseaux (dont spécial).

**🤔 Du plan au réel.** On déploie le **hub** (avec un `AzureFirewallSubnet`) et le **spoke** (avec un sous-réseau applicatif) **pour de vrai** sur miniblue.

Déploie le hub et le spoke :
:::

:::lang en
**Goal.** **Deploy** the hub and the spoke — VNets + subnets (including special).

**🤔 From plan to reality.** We deploy the **hub** (with an `AzureFirewallSubnet`) and the **spoke** (with an app subnet) **for real** on miniblue.

Deploy the hub and the spoke:
:::

```bash
export SSL_CERT_FILE=$HOME/.miniblue/cert.pem
export ARM_ENVIRONMENT=public

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
resource "azurerm_resource_group" "net" {
  name     = "rg-netproj"
  location = "westeurope"
}
resource "azurerm_virtual_network" "hub" {
  name                = "vnet-hub"
  location            = azurerm_resource_group.net.location
  resource_group_name = azurerm_resource_group.net.name
  address_space       = ["10.0.0.0/16"]
}
resource "azurerm_subnet" "hub_fw" {
  name                 = "AzureFirewallSubnet"
  resource_group_name  = azurerm_resource_group.net.name
  virtual_network_name = azurerm_virtual_network.hub.name
  address_prefixes     = ["10.0.0.0/26"]
}
resource "azurerm_virtual_network" "spoke" {
  name                = "vnet-spoke"
  location            = azurerm_resource_group.net.location
  resource_group_name = azurerm_resource_group.net.name
  address_space       = ["10.1.0.0/16"]
}
resource "azurerm_subnet" "spoke_app" {
  name                 = "snet-app"
  resource_group_name  = azurerm_resource_group.net.name
  virtual_network_name = azurerm_virtual_network.spoke.name
  address_prefixes     = ["10.1.1.0/24"]
}
TF
cd infra && terraform init -no-color >/dev/null 2>&1
terraform apply -auto-approve -no-color 2>&1 | grep -E "Apply complete"
cd ..
```

:::lang fr
**✅ Vérification :** `apply` confirme `Apply complete! Resources: 5 added` — le groupe, le **VNet hub** (`10.0.0.0/16`) avec son `AzureFirewallSubnet`, et le **VNet spoke** (`10.1.0.0/16`) avec son `snet-app` sont **déployés** sur miniblue. La topologie **hub-and-spoke** prend forme : un hub qui portera le pare-feu, un spoke pour la charge. Le sous-réseau **spécial** `AzureFirewallSubnet` (nom **obligatoire**) est réservé pour le pare-feu. On **relie** maintenant les deux.
:::

:::lang en
**✅ Check:** `apply` confirms `Apply complete! Resources: 5 added` — the group, the **hub VNet** (`10.0.0.0/16`) with its `AzureFirewallSubnet`, and the **spoke VNet** (`10.1.0.0/16`) with its `snet-app` are **deployed** on miniblue. The **hub-and-spoke** topology takes shape: a hub that will hold the firewall, a spoke for the workload. The **special** `AzureFirewallSubnet` subnet (**mandatory** name) is reserved for the firewall. Now we **connect** the two.
:::

### step-03

:::lang fr
**Objectif.** Concevoir le **peering** — relier le spoke au hub.

**🤔 Connecter en privé.** Le **peering** relie le spoke au hub (trafic privé). On **re-vérifie** le non-chevauchement (déjà planifié) et on note la propriété clé : le peering est **non transitif** (le hub relaie).

Vérifie et décris le peering :
:::

:::lang en
**Goal.** Design the **peering** — connect the spoke to the hub.

**🤔 Connect privately.** **Peering** connects the spoke to the hub (private traffic). We **re-check** non-overlap (already planned) and note the key property: peering is **non-transitive** (the hub relays).

Check and describe the peering:
:::

```bash
cat > peering.py <<'PY'
import ipaddress
hub, spoke = ipaddress.ip_network("10.0.0.0/16"), ipaddress.ip_network("10.1.0.0/16")
ok = not hub.overlaps(spoke)
print(f"Peering hub <-> spoke : {'✅ possible' if ok else '❌ impossible (chevauchement)'}")
print("Proprietes du peering :")
print("  - trafic PRIVE (backbone Microsoft), faible latence")
print("  - NON transitif : le spoke joint le hub, PAS les autres spokes directement")
print("  - le hub centralise (pare-feu, passerelle, DNS) et relaie")
PY
python3 peering.py
```

:::lang fr
**✅ Vérification :** la sortie confirme `Peering hub <-> spoke : ✅ possible`, puis les propriétés : trafic **privé**, **non transitif**, hub **central**. Le spoke est désormais **relié** au hub (en vrai Azure, deux objets de peering réciproques). Comme le peering est **non transitif**, tout ce qui doit être **partagé** (pare-feu, passerelle) vit au **hub** — et les spokes y accèdent via le peering. ⚠️ miniblue n'exécute pas le peering (comme le vrai déploiement des passerelles) : on le **conçoit** et on **vérifie** sa contrainte. On impose maintenant le **routage**.
:::

:::lang en
**✅ Check:** the output confirms `Peering hub <-> spoke : ✅ possible`, then the properties: **private** traffic, **non-transitive**, **central** hub. The spoke is now **linked** to the hub (in real Azure, two reciprocal peering objects). Since peering is **non-transitive**, everything to be **shared** (firewall, gateway) lives in the **hub** — and spokes access it via peering. ⚠️ miniblue doesn't execute peering (like the actual gateway deployment): we **design** it and **check** its constraint. Now we enforce **routing**.
:::

### step-04

:::lang fr
**Objectif.** Imposer le **routage** — UDR de **tunneling forcé** vers le pare-feu du hub.

**🤔 Tout l'egress par le hub.** On force le trafic sortant du spoke à passer par le **pare-feu du hub** : une **UDR** `0.0.0.0/0` → pare-feu (`10.0.0.4`). On l'écrit en **Bicep** et on **prouve** l'effet avec le moteur de routage (le trafic interne reste local).

Écris l'UDR et prouve le tunneling forcé :
:::

:::lang en
**Goal.** Enforce **routing** — a **forced tunneling** UDR to the hub firewall.

**🤔 All egress through the hub.** We force the spoke's outbound traffic through the **hub firewall**: a **UDR** `0.0.0.0/0` → firewall (`10.0.0.4`). We write it in **Bicep** and **prove** the effect with the routing engine (internal traffic stays local).

Write the UDR and prove forced tunneling:
:::

```bash
cat > rt.bicep <<'BICEP'
resource rt 'Microsoft.Network/routeTables@2023-05-01' = {
  name: 'rt-spoke'
  location: resourceGroup().location
  properties: {
    routes: [
      {
        name: 'egress-par-le-hub'
        properties: {
          addressPrefix: '0.0.0.0/0'
          nextHopType: 'VirtualAppliance'
          nextHopIpAddress: '10.0.0.4'   // pare-feu du hub
        }
      }
    ]
  }
}
BICEP
bicep build rt.bicep --stdout 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('UDR -> ARM OK:', d['resources'][0]['type'])"

cat > routage.py <<'PY'
import ipaddress
PRIORITE = {"UDR": 0, "Systeme": 1}
routes = [
    {"prefixe": "10.1.0.0/16", "next_hop": "spoke local", "source": "Systeme"},
    {"prefixe": "0.0.0.0/0",   "next_hop": "Internet",    "source": "Systeme"},
    {"prefixe": "0.0.0.0/0",   "next_hop": "Pare-feu du hub (10.0.0.4)", "source": "UDR"},
]
def router(dest):
    ip = ipaddress.ip_address(dest)
    c = [r for r in routes if ip in ipaddress.ip_network(r["prefixe"])]
    c.sort(key=lambda r: (-ipaddress.ip_network(r["prefixe"]).prefixlen, PRIORITE[r["source"]]))
    return c[0]
for dest in ["8.8.8.8", "10.1.2.3"]:
    r = router(dest)
    print(f"{dest:10} -> {r['next_hop']:28} (source {r['source']})")
PY
python3 routage.py
```

:::lang fr
**✅ Vérification :** la sortie affiche `UDR -> ARM OK: Microsoft.Network/routeTables`, puis `8.8.8.8 -> Pare-feu du hub (10.0.0.4) (source UDR)` et `10.1.2.3 -> spoke local (source Systeme)`. Le **tunneling forcé** est en place : tout le trafic **Internet** du spoke passe par le **pare-feu du hub** (UDR écrase la route système), tandis que le trafic **intra-spoke** reste **local** (préfixe `/16` plus spécifique que le `/0`). C'est la puissance du hub-and-spoke : le **pare-feu partagé** inspecte **tout** l'egress, sans casser le trafic interne. Reste à **privatiser** les données.
:::

:::lang en
**✅ Check:** the output shows `UDR -> ARM OK: Microsoft.Network/routeTables`, then `8.8.8.8 -> Pare-feu du hub (10.0.0.4) (source UDR)` and `10.1.2.3 -> spoke local (source Systeme)`. **Forced tunneling** is in place: all the spoke's **Internet** traffic goes through the **hub firewall** (UDR overrides the system route), while **intra-spoke** traffic stays **local** (the `/16` prefix is more specific than the `/0`). That's the power of hub-and-spoke: the **shared firewall** inspects **all** egress, without breaking internal traffic. Now to **privatize** the data.
:::

### step-05

:::lang fr
**Objectif.** Rendre le PaaS **privé** — point de terminaison privé + DNS privatelink.

**🤔 Les données hors d'Internet.** On donne au stockage une **IP privée** dans le spoke (point de terminaison privé, Bicep) et on crée l'**intégration DNS privatelink** **obligatoire** (live). Le PaaS devient joignable **uniquement** depuis le réseau.

Privatise le PaaS (endpoint + DNS) :
:::

:::lang en
**Goal.** Make the PaaS **private** — private endpoint + privatelink DNS.

**🤔 Data off the Internet.** We give the storage a **private IP** in the spoke (private endpoint, Bicep) and create the **mandatory** privatelink **DNS integration** (live). The PaaS becomes reachable **only** from the network.

Privatize the PaaS (endpoint + DNS):
:::

```bash
azlocal group create --name rg-netproj --location westeurope >/dev/null 2>&1

# Le point de terminaison prive (Bicep) / the private endpoint (Bicep)
cat > pe.bicep <<'BICEP'
param location string = resourceGroup().location
resource pe 'Microsoft.Network/privateEndpoints@2023-05-01' = {
  name: 'pe-stockage'
  location: location
  properties: {
    subnet: { id: resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet-spoke', 'snet-app') }
    privateLinkServiceConnections: [
      {
        name: 'vers-stockage'
        properties: {
          privateLinkServiceId: resourceId('Microsoft.Storage/storageAccounts', 'stnetproj')
          groupIds: [ 'blob' ]
        }
      }
    ]
  }
}
BICEP
bicep build pe.bicep --stdout 2>/dev/null | python3 -c "import sys,json; print('private endpoint -> ARM OK:', json.load(sys.stdin)['resources'][0]['type'])"

# L'integration DNS privatelink OBLIGATOIRE (live) / the mandatory privatelink DNS (live)
azlocal dns zone create --resource-group rg-netproj --name privatelink.blob.core.windows.net >/dev/null 2>&1
azlocal dns record create --resource-group rg-netproj --zone privatelink.blob.core.windows.net --name stnetproj --type A --value 10.1.1.10 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('DNS privatelink:', d['name'], '-> 10.1.1.10 (IP privee)')"
```

:::lang fr
**✅ Vérification :** la sortie affiche `private endpoint -> ARM OK: Microsoft.Network/privateEndpoints` et `DNS privatelink: stnetproj -> 10.1.1.10 (IP privee)`. Le PaaS est **privatisé** : une **IP privée** dans `snet-app` (point de terminaison), et la **zone privatelink** qui résout le nom vers cette IP (l'intégration **obligatoire**). Combiné à la **fermeture** de l'accès public, le stockage est **hors d'Internet**, joignable **uniquement** depuis le réseau (et depuis l'on-prem via le hub). La topologie est **sécurisée par conception**. Reste la **distribution**.
:::

:::lang en
**✅ Check:** the output shows `private endpoint -> ARM OK: Microsoft.Network/privateEndpoints` and `DNS privatelink: stnetproj -> 10.1.1.10 (IP privee)`. The PaaS is **privatized**: a **private IP** in `snet-app` (endpoint), and the **privatelink zone** resolving the name to that IP (the **mandatory** integration). Combined with **closing** public access, the storage is **off the Internet**, reachable **only** from the network (and from on-prem via the hub). The topology is **secure by design**. The **delivery** remains.
:::

### step-06

:::lang fr
**Objectif.** **Choisir** la distribution et dresser la **carte** de conception.

**🤔 Servir l'application.** La charge du spoke a besoin d'un **équilibreur**. On **choisit** le bon service (L4/L7, régional/global) et on récapitule la **conception complète**.

Choisis la distribution et dresse la carte :
:::

:::lang en
**Goal.** **Choose** delivery and draw the design **map**.

**🤔 Serve the application.** The spoke's workload needs a **balancer**. We **choose** the right service (L4/L7, regional/global) and recap the **complete design**.

Choose delivery and draw the map:
:::

```bash
python3 <<'PY'
# Choix de distribution pour la charge du spoke (site web regional avec routage + WAF)
besoin = {"couche": "L7", "global": False}
service = "Application Gateway (L7 regional, routage par chemin + WAF)" if besoin["couche"] == "L7" and not besoin["global"] else "autre"
print("Distribution choisie :", service)
print()
print("=== Carte de la topologie (conception complete) ===")
print("  Adressage   : hub 10.0.0.0/16 | spoke 10.1.0.0/16 (disjoints)")
print("  Hub         : AzureFirewallSubnet (services partages)")
print("  Spoke       : snet-app (charge de travail)")
print("  Peering     : hub <-> spoke (prive, non transitif)")
print("  Routage     : UDR 0.0.0.0/0 -> pare-feu du hub (tunneling force)")
print("  Acces prive : point de terminaison + DNS privatelink (PaaS hors Internet)")
print("  Distribution: Application Gateway (L7, WAF) devant la charge")
PY
```

:::lang fr
**✅ Vérification :** la sortie choisit `Application Gateway (L7 regional, routage par chemin + WAF)` pour la charge (site web régional), puis dresse la **carte complète** : adressage disjoint, hub avec pare-feu, spoke applicatif, peering, tunneling forcé, accès privé au PaaS, et distribution L7. C'est **toute la topologie** conçue et cohérente — chaque décision **s'appuie** sur la précédente. Tu tiens une **conception réseau d'entreprise** : segmentée, routée, privatisée, distribuée. On l'**emballe** pour le CV.
:::

:::lang en
**✅ Check:** the output picks `Application Gateway (L7 regional, routage par chemin + WAF)` for the workload (regional website), then draws the **complete map**: disjoint addressing, hub with firewall, app spoke, peering, forced tunneling, private PaaS access, and L7 delivery. That's **the whole topology** designed and coherent — each decision **builds on** the previous one. You hold an **enterprise network design**: segmented, routed, privatized, delivered. We **package** it for the CV.
:::

### step-07

:::lang fr
**Objectif.** **Emballer** la conception réseau pour le CV, puis nettoyer.

**🤔 Preuves et pitch.** On rédige la **fiche CV** qui résume la topologie hub-and-spoke, puis on **détruit** proprement le lab.

Rédige la fiche CV et nettoie :
:::

:::lang en
**Goal.** **Package** the network design for the CV, then clean up.

**🤔 Evidence and pitch.** We write the **CV sheet** summarizing the hub-and-spoke topology, then **destroy** the lab cleanly.

Write the CV sheet and clean up:
:::

```bash
cat > CV.md <<'MD'
# Projet : topologie reseau Azure hub-and-spoke (AZ-700)
Conception ET implementation d'une topologie reseau complete - 100% local (emulateur).

- **Adressage** : plan CIDR global sans chevauchement (hub /16, spoke /16), sous-reseaux
  speciaux reserves (AzureFirewallSubnet).
- **Topologie** : hub-and-spoke, peering (prive, non transitif), hub central des
  services partages (pare-feu).
- **Routage** : UDR de tunneling force (0.0.0.0/0 -> pare-feu du hub) ; trafic interne
  garde local (prefixe le plus long).
- **Acces prive** : point de terminaison prive + DNS privatelink + fermeture de l'acces
  public (PaaS hors Internet).
- **Distribution** : Application Gateway (L7, routage par chemin + WAF) devant la charge.

Stack : Terraform, Bicep, VNet/sous-reseaux, peering, route tables (UDR), Private Link,
DNS prive, Application Gateway. Aligne AZ-700.
MD
echo "--- fiche CV creee / CV sheet created ---"; head -3 CV.md

# Nettoyer le lab / clean up
cd infra && terraform destroy -auto-approve -no-color 2>&1 | grep -E "Destroy complete" ; cd ..
azlocal group delete --name rg-netproj >/dev/null 2>&1 && echo "rg-netproj supprime / deleted"
```

:::lang fr
**✅ Vérification :** la **fiche CV** est créée (résumant les cinq décisions de conception), puis `Destroy complete!` et `rg-netproj supprime` nettoient le lab. **Félicitations — tu as terminé le track AZ-700 !** Tu tiens un **projet complet** : une topologie **hub-and-spoke** conçue et **déployée** (adressage, VNets, peering, routage, accès privé, distribution), avec un **schéma** et une **fiche CV**. Mets `CV.md` en avant et parle de **chaque décision** en entretien.

**Et surtout : tu as bouclé tout le parcours Azure — AZ-900, AZ-104, AZ-305, AZ-400, AZ-500 et AZ-700 — 100% en local, 100% pratique, sans jamais payer un centime de cloud.** De débutant à ingénieur cloud complet : architecture, DevOps, sécurité et réseau. Bravo.
:::

:::lang en
**✅ Check:** the **CV sheet** is created (summarizing the five design decisions), then `Destroy complete!` and `rg-netproj supprime` clean the lab. **Congratulations — you finished the AZ-700 track!** You hold a **complete project**: a **hub-and-spoke** topology designed and **deployed** (addressing, VNets, peering, routing, private access, delivery), with a **diagram** and a **CV sheet**. Feature `CV.md` and speak to **each decision** in an interview.

**And above all: you completed the entire Azure path — AZ-900, AZ-104, AZ-305, AZ-400, AZ-500 and AZ-700 — 100% locally, 100% hands-on, without ever paying a cent for cloud.** From beginner to a complete cloud engineer: architecture, DevOps, security and networking. Well done.
:::

## pitfalls

:::lang fr
**1. Adressage improvisé.** Sans plan **global sans chevauchement**, le peering échoue et le réseau se **coince**. Planifie **d'abord**.

**2. Oublier les sous-réseaux spéciaux.** `AzureFirewallSubnet`, `GatewaySubnet` ont des **noms** et **tailles** imposés. Réserve-les dans le plan.

**3. Croire le peering transitif.** Le spoke joint le hub, **pas** les autres spokes directement. Centralise au **hub** et route.

**4. Egress non contrôlé.** Sans **UDR** de tunneling forcé, chaque spoke sort **directement** vers Internet, sans inspection. Force par le **pare-feu du hub**.

**5. Point de terminaison privé sans DNS.** L'erreur n°1 : sans la zone `privatelink.*`, le client va **encore** à l'IP publique.

**6. PaaS public « derrière un pare-feu ».** Un pare-feu IP ne suffit pas — l'IP publique **existe**. Le **point de terminaison privé** + fermeture le retire vraiment d'Internet.

**7. Distribution inadaptée.** Un L4 pour de l'HTTP (pas de routage/WAF), ou du global pour du régional (coût). Choisis selon **couche** et **portée**.
:::

:::lang en
**1. Improvised addressing.** Without a **global non-overlapping** plan, peering fails and the network gets **stuck**. Plan **first**.

**2. Forgetting special subnets.** `AzureFirewallSubnet`, `GatewaySubnet` have **mandatory** names and sizes. Reserve them in the plan.

**3. Thinking peering is transitive.** The spoke reaches the hub, **not** other spokes directly. Centralize at the **hub** and route.

**4. Uncontrolled egress.** Without a forced-tunneling **UDR**, each spoke egresses **directly** to the Internet, uninspected. Force through the **hub firewall**.

**5. Private endpoint without DNS.** Mistake #1: without the `privatelink.*` zone, the client **still** goes to the public IP.

**6. Public PaaS "behind a firewall".** An IP firewall isn't enough — the public IP **exists**. The **private endpoint** + closure truly removes it from the Internet.

**7. Wrong delivery.** An L4 for HTTP (no routing/WAF), or global for regional (cost). Choose by **layer** and **scope**.
:::

## success

:::lang fr
Tu as réussi si ta topologie a :

- Un **plan d'adressage** disjoint (hub + spoke), sous-réseaux spéciaux réservés.
- Un **hub** et un **spoke** **déployés** (VNets + sous-réseaux).
- Un **peering** conçu (non-chevauchement vérifié, non transitif).
- Un **routage** UDR de **tunneling forcé** vers le pare-feu du hub.
- Un PaaS **privé** (point de terminaison + DNS privatelink).
- Une **distribution** adaptée et une **fiche CV** résumant la conception.
:::

:::lang en
You've succeeded if your topology has:

- A disjoint **address plan** (hub + spoke), special subnets reserved.
- A **hub** and a **spoke** **deployed** (VNets + subnets).
- A **peering** designed (non-overlap checked, non-transitive).
- A **forced-tunneling** UDR routing to the hub firewall.
- A **private** PaaS (private endpoint + privatelink DNS).
- A fitting **delivery** and a **CV sheet** summarizing the design.
:::

## next

:::lang fr
- **Suivant :** consolide sur un **vrai** compte Azure gratuit, ou révise un cert du parcours (AZ-900 → AZ-700).
- **Réviser :** n'importe quel guide AZ-700 dont un pilier t'a semblé fragile.
- **Aller plus loin :** ajoute un **2e spoke** (avec routage inter-spoke via le hub), une **passerelle VPN** au hub (gateway transit), et un **Front Door** global.
:::

:::lang en
- **Next:** consolidate on a **real** free Azure account, or review a cert from the path (AZ-900 → AZ-700).
- **Review:** any AZ-700 guide whose pillar felt shaky.
- **Go further:** add a **2nd spoke** (with inter-spoke routing via the hub), a **VPN gateway** at the hub (gateway transit), and a global **Front Door**.
:::

## cheatsheet

:::lang fr
**Les cinq décisions de conception**

```text
1. ADRESSAGE    plan CIDR global, disjoint (hub 10.0/16, spoke 10.1/16)   [Python]
2. TOPOLOGIE    hub-and-spoke, peering (prive, NON transitif)             [live+model]
3. ROUTAGE      UDR 0.0.0.0/0 -> pare-feu du hub (tunneling force)        [Bicep+moteur]
4. ACCES PRIVE  point de terminaison + DNS privatelink + fermeture public [Bicep+live]
5. DISTRIBUTION L4/L7, regional/global selon la charge                    [moteur]
```

**Ordre de conception (immuable)**

```text
adressage -> topologie -> routage -> acces prive -> distribution
(chaque decision s'appuie sur la precedente ; l'adressage est le plus dur a changer)
```

**Commandes cles**

```bash
terraform apply                                   # hub + spoke (VNets + sous-reseaux)
bicep build rt.bicep --stdout                     # UDR (tunneling force)
bicep build pe.bicep --stdout                     # point de terminaison prive
azlocal dns zone create ... privatelink.blob...   # integration DNS (OBLIGATOIRE)
```
:::

:::lang en
**The five design decisions**

```text
1. ADDRESSING   global CIDR plan, disjoint (hub 10.0/16, spoke 10.1/16)   [Python]
2. TOPOLOGY     hub-and-spoke, peering (private, NON-transitive)          [live+model]
3. ROUTING      UDR 0.0.0.0/0 -> hub firewall (forced tunneling)          [Bicep+engine]
4. PRIVATE ACC. private endpoint + privatelink DNS + public closure       [Bicep+live]
5. DELIVERY     L4/L7, regional/global by workload                        [engine]
```

**Design order (fixed)**

```text
addressing -> topology -> routing -> private access -> delivery
(each decision builds on the previous; addressing is the hardest to change)
```

**Key commands**

```bash
terraform apply                                   # hub + spoke (VNets + subnets)
bicep build rt.bicep --stdout                     # UDR (forced tunneling)
bicep build pe.bicep --stdout                     # private endpoint
azlocal dns zone create ... privatelink.blob...   # DNS integration (MANDATORY)
```
:::

## resources

:::lang fr
- **AZ-700** : Designing and Implementing Microsoft Azure Networking Solutions — objectifs officiels, Microsoft Learn.
- **Hub-and-spoke** : topologie de référence, peering, gateway transit — Cloud Adoption Framework.
- **Route tables (UDR)** : tunneling forcé, appliance — Microsoft Learn.
- **Private Link / Private Endpoint** : IP privée, DNS privatelink — Microsoft Learn.
- **Application Gateway** : L7, routage, WAF — Microsoft Learn.
- **miniblue** : émulateur Azure local (community, non officiel) — github.com/moabukar/miniblue.
:::

:::lang en
- **AZ-700**: Designing and Implementing Microsoft Azure Networking Solutions — official objectives, Microsoft Learn.
- **Hub-and-spoke**: reference topology, peering, gateway transit — Cloud Adoption Framework.
- **Route tables (UDR)**: forced tunneling, appliance — Microsoft Learn.
- **Private Link / Private Endpoint**: private IP, privatelink DNS — Microsoft Learn.
- **Application Gateway**: L7, routing, WAF — Microsoft Learn.
- **miniblue**: local Azure emulator (community, unofficial) — github.com/moabukar/miniblue.
:::

## troubleshooting

:::lang fr
**`terraform` : erreur TLS / certificat (step-02).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` et vérifie que miniblue tourne (port 4567).

**`Apply` déploie moins de 5 ressources.** Vérifie que `main.tf` contient le RG, les **deux** VNets et leurs sous-réseaux, en HCL **multi-ligne**.

**Le plan signale un chevauchement.** Les plages hub/spoke se recoupent. Reprends le plan d'adressage (step-01) : elles doivent être **disjointes**.

**`bicep : command not found` (step-04/05).** `az bicep install` ou le binaire autonome.

**Le point de terminaison privé « ne marche pas ».** 99% : le **DNS**. Vérifie la zone `privatelink.*`, l'enregistrement vers l'IP privée et la liaison au VNet (step-05).

**Peering/UDR/endpoint ne se déploient pas en local.** miniblue n'émule pas ces objets. On les **valide** (Bicep) et on les **raisonne** (moteurs) ; les **VNets/sous-réseaux** et le **DNS**, eux, sont **live**. L'exécution complète vise du vrai Azure.
:::

:::lang en
**`terraform`: TLS / certificate error (step-02).** `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem` and check miniblue is running (port 4567).

**`Apply` deploys fewer than 5 resources.** Check `main.tf` holds the RG, **both** VNets and their subnets, in **multi-line** HCL.

**The plan flags an overlap.** The hub/spoke ranges intersect. Redo the address plan (step-01): they must be **disjoint**.

**`bicep: command not found` (step-04/05).** `az bicep install` or the standalone binary.

**The private endpoint "doesn't work".** 99%: the **DNS**. Check the `privatelink.*` zone, the record to the private IP, and the VNet link (step-05).

**Peering/UDR/endpoint won't deploy locally.** miniblue doesn't emulate these objects. We **validate** them (Bicep) and **reason** about them (engines); the **VNets/subnets** and the **DNS** are **live**. Full execution targets real Azure.
:::
