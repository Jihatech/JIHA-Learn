---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-reseau-hybride
slug: azure-reseau-hybride
order: 84
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — connectivité hybride (AZ-700) : peering, VPN, ExpressRoute"
title_en: "Azure — hybrid connectivity (AZ-700): peering, VPN, ExpressRoute"
tagline_fr: "relier les VNets et le datacenter — le bon lien pour chaque besoin."
tagline_en: "connect VNets and the datacenter — the right link for each need."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 250
repo: "Azure/bicep"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-reseau-routage]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [connectivite, peering, gateway-transit, vpn-site-to-site, expressroute, passerelle-vpn, bgp, hub-spoke, az-700]
concepts_en: [connectivity, peering, gateway-transit, site-to-site-vpn, expressroute, vpn-gateway, bgp, hub-spoke, az-700]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Relier les réseaux pour l'AZ-700, en local et pour de vrai : le peering de VNets (vérification du non-chevauchement + modèle de gateway transit hub-spoke), la passerelle VPN site-to-site écrite et validée en Bicep, un moteur de décision exécutable qui choisit la bonne connectivité (peering / peering global / VPN / ExpressRoute) selon le besoin, ExpressRoute (lien privé dédié) vs VPN, et la propagation des routes par BGP sur la connexion. Sans compte cloud.",
og_description_en: "Connecting networks for AZ-700, locally and for real: VNet peering (non-overlap check + hub-spoke gateway transit model), the site-to-site VPN gateway written and validated in Bicep, a runnable decision engine choosing the right connectivity (peering / global peering / VPN / ExpressRoute) by need, ExpressRoute (private dedicated link) vs VPN, and route propagation by BGP over the connection. No cloud account."
---

## intro

:::lang fr
Un VNet isolé est rare : en entreprise, il faut **relier** — des VNets entre eux, et Azure au **datacenter** ou aux sites distants. L'**AZ-700** attend que tu saches choisir et concevoir la **bonne connectivité** : **peering** de VNets, **VPN site-to-site**, **ExpressRoute**. Le mauvais choix coûte cher (débit, latence, sécurité) ; le bon rend le réseau **hybride** fluide.

Fidèle à la méthode, on pratique **en local et pour de vrai** : on **relie deux VNets par peering** (avec la vérification du **non-chevauchement** et le modèle de **gateway transit** hub-spoke), on écrit et **valide** une **passerelle VPN site-to-site** en **Bicep**, on **exécute** un **moteur de décision** qui choisit la connectivité (**peering** / peering **global** / **VPN** / **ExpressRoute**) selon le besoin, on compare **ExpressRoute** (lien privé dédié) et **VPN**, et on voit la **propagation des routes par BGP**.

**Pour qui c'est :** tu maîtrises l'adressage et le routage (guides précédents) et tu veux **connecter** les réseaux.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas les fondations réseau → fais les guides AZ-700 précédents.
- Tu veux la **distribution** applicative (load balancer, Front Door) → c'est le **guide suivant**.
:::

:::lang en
An isolated VNet is rare: in the enterprise, you must **connect** — VNets to each other, and Azure to the **datacenter** or remote sites. **AZ-700** expects you to choose and design the **right connectivity**: VNet **peering**, **site-to-site VPN**, **ExpressRoute**. The wrong choice is costly (throughput, latency, security); the right one makes the **hybrid** network smooth.

True to the method, we practice **locally and for real**: we **connect two VNets by peering** (with the **non-overlap** check and the hub-spoke **gateway transit** model), we write and **validate** a **site-to-site VPN gateway** in **Bicep**, we **run** a **decision engine** that picks the connectivity (**peering** / **global** peering / **VPN** / **ExpressRoute**) by need, we compare **ExpressRoute** (private dedicated link) and **VPN**, and we see **route propagation by BGP**.

**Who it's for:** you master addressing and routing (previous guides) and want to **connect** networks.

**When it's NOT the right choice:**

- You lack the network foundations → do the previous AZ-700 guides.
- You want application **delivery** (load balancer, Front Door) → that's the **next guide**.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- **Relier** deux VNets par **peering** (et vérifier le non-chevauchement).
- Comprendre le **gateway transit** (un spoke utilise la passerelle du hub).
- Écrire une **passerelle VPN site-to-site** et la **valider** en Bicep.
- **Choisir** la bonne connectivité selon le besoin (moteur de décision).
- Comparer **VPN site-to-site** et **ExpressRoute**.
- Comprendre la **propagation des routes par BGP** sur une connexion.
- Distinguer **peering**, **peering global**, **VPN** et **ExpressRoute**.
:::

:::lang en
By the end of this guide, you can:

- **Connect** two VNets by **peering** (and check non-overlap).
- Understand **gateway transit** (a spoke uses the hub's gateway).
- Write a **site-to-site VPN gateway** and **validate** it in Bicep.
- **Choose** the right connectivity by need (decision engine).
- Compare **site-to-site VPN** and **ExpressRoute**.
- Understand **route propagation by BGP** over a connection.
- Distinguish **peering**, **global peering**, **VPN** and **ExpressRoute**.
:::

## prerequisites

:::lang fr
- Les guides **Azure — réseau fondamentaux / routage (AZ-700)**.
- Le **lab local** : **Bicep CLI** (`az bicep install` ou binaire), **Python 3** (module `ipaddress`), **miniblue** optionnel.
- **Aucun compte cloud** : peering/décision en local, passerelle VPN validée en Bicep.
:::

:::lang en
- The **Azure — network fundamentals / routing (AZ-700)** guides.
- The **local lab**: **Bicep CLI** (`az bicep install` or binary), **Python 3** (`ipaddress` module), **miniblue** optional.
- **No cloud account**: peering/decision locally, VPN gateway validated in Bicep.
:::

## concepts

:::lang fr
**Le peering de VNets.** Relier **deux VNets** directement : le trafic circule en **privé** (backbone Microsoft), à **faible latence**, sans passerelle. Deux variantes : **régional** (même région) et **global** (régions différentes). La contrainte **absolue** (vue au guide fondamentaux) : les **espaces d'adressage ne doivent pas se chevaucher**. Le peering est **non transitif** : si A↔B et B↔C, A **n'atteint pas** C automatiquement — d'où la topologie **hub-and-spoke** avec des artifices (gateway transit, routes).

**Le gateway transit.** Dans un hub-and-spoke, seule la **passerelle** vit dans le **hub** (une par VNet, coûteuse). Grâce au **gateway transit**, un **spoke** peut **utiliser la passerelle du hub** (via le peering) pour atteindre l'**on-premises** ou un autre réseau — sans sa propre passerelle. On mutualise : une passerelle au hub, tous les spokes en profitent.

**Le VPN site-to-site.** Relier ton **datacenter** (on-prem) à Azure par un **tunnel IPsec chiffré** **via Internet**. Côté Azure : une **passerelle VPN** (dans le `GatewaySubnet`) ; côté on-prem : un équipement VPN. On décrit aussi une **passerelle de réseau local** (l'IP publique + les plages de l'on-prem) et une **connexion**. Avantage : **rapide** à monter, pas cher. Limite : passe par **Internet** (débit et latence **variables**).

**ExpressRoute.** Un **lien privé dédié** entre ton on-prem et Azure, **sans passer par Internet** (via un fournisseur). Avantages : **débit garanti** (jusqu'à des dizaines de Gbps), **latence faible et stable**, **SLA**, plus **sûr** (trafic isolé). Coût et délai de mise en place **supérieurs**. Le choix pour les charges **critiques** ou à **fort débit**.

**Le choix de connectivité.** La question centrale de l'AZ-700 : **quel lien pour quel besoin** ? VNet↔VNet même région → **peering** ; VNet↔VNet multi-région → **peering global** ; on-prem↔Azure rapide/pas cher → **VPN S2S** ; on-prem↔Azure critique/gros débit → **ExpressRoute**. Un tableau de décision évite les erreurs coûteuses.

**BGP & propagation des routes.** Sur une connexion (VPN ou ExpressRoute), **BGP** échange **dynamiquement** les routes : Azure **annonce** ses plages, l'on-prem annonce les siennes. Les routes **apprises** (BGP) apparaissent dans les **routes effectives** (guide routage) — pas besoin de tout déclarer à la main. C'est ce qui rend l'hybride **dynamique**.

**Ce qui est live ici.** Le **peering** (non-chevauchement + **gateway transit**) est un **modèle exécutable** en Python — de **vraies** vérifications. La **passerelle VPN** (+ IP publique) s'écrit et se **compile en ARM** avec **Bicep** (validation ; miniblue ne l'émule pas). Le **choix de connectivité** est un **moteur de décision** exécutable. **ExpressRoute** et **BGP** se **raisonnent**. Tout sans compte cloud.
:::

:::lang en
**VNet peering.** Connecting **two VNets** directly: traffic flows **privately** (Microsoft backbone), at **low latency**, with no gateway. Two variants: **regional** (same region) and **global** (different regions). The **absolute** constraint (seen in the fundamentals guide): **address spaces must not overlap**. Peering is **non-transitive**: if A↔B and B↔C, A does **not** reach C automatically — hence the **hub-and-spoke** topology with tricks (gateway transit, routes).

**Gateway transit.** In a hub-and-spoke, only the **gateway** lives in the **hub** (one per VNet, costly). With **gateway transit**, a **spoke** can **use the hub's gateway** (via peering) to reach **on-premises** or another network — without its own gateway. You share: one gateway at the hub, all spokes benefit.

**Site-to-site VPN.** Connecting your **datacenter** (on-prem) to Azure via an **encrypted IPsec tunnel** **over the Internet**. On the Azure side: a **VPN gateway** (in the `GatewaySubnet`); on-prem: a VPN device. You also describe a **local network gateway** (the public IP + on-prem ranges) and a **connection**. Pro: **fast** to set up, cheap. Con: goes over **the Internet** (**variable** throughput and latency).

**ExpressRoute.** A **private dedicated link** between your on-prem and Azure, **without going through the Internet** (via a provider). Pros: **guaranteed throughput** (up to tens of Gbps), **low, stable latency**, **SLA**, more **secure** (isolated traffic). Higher **cost** and setup time. The choice for **critical** or **high-throughput** workloads.

**The connectivity choice.** AZ-700's central question: **which link for which need**? VNet↔VNet same region → **peering**; VNet↔VNet multi-region → **global peering**; on-prem↔Azure fast/cheap → **S2S VPN**; on-prem↔Azure critical/high-throughput → **ExpressRoute**. A decision table avoids costly mistakes.

**BGP & route propagation.** Over a connection (VPN or ExpressRoute), **BGP** exchanges routes **dynamically**: Azure **advertises** its ranges, on-prem advertises its own. **Learned** routes (BGP) appear in the **effective routes** (routing guide) — no need to declare everything by hand. That's what makes hybrid **dynamic**.

**What's live here.** **Peering** (non-overlap + **gateway transit**) is a **runnable model** in Python — **real** checks. The **VPN gateway** (+ public IP) is written and **compiled to ARM** with **Bicep** (validation; miniblue doesn't emulate it). The **connectivity choice** is a runnable **decision engine**. **ExpressRoute** and **BGP** are **reasoned**. All without a cloud account.
:::

:::figure azure-reseau-hybride-connexions
caption_fr: "Schéma 1. La connectivité hybride : des VNets reliés par PEERING (privé, faible latence, non transitif, plages non chevauchantes) en HUB-AND-SPOKE ; le hub porte la PASSERELLE VPN, les spokes l'empruntent (GATEWAY TRANSIT). Vers l'on-prem : VPN SITE-TO-SITE (tunnel IPsec via Internet, rapide/pas cher) ou EXPRESSROUTE (lien privé dédié, débit garanti, SLA). BGP propage les routes dynamiquement. Le bon lien selon le besoin."
caption_en: "Figure 1. Hybrid connectivity: VNets linked by PEERING (private, low latency, non-transitive, non-overlapping ranges) in HUB-AND-SPOKE; the hub holds the VPN GATEWAY, spokes borrow it (GATEWAY TRANSIT). To on-prem: SITE-TO-SITE VPN (IPsec tunnel over the Internet, fast/cheap) or EXPRESSROUTE (private dedicated link, guaranteed throughput, SLA). BGP propagates routes dynamically. The right link by need."
:::

## walkthrough

:::lang fr
On avance ainsi : peering de VNets (non-chevauchement) → gateway transit → passerelle VPN (Bicep) → choix de connectivité (décision) → ExpressRoute vs VPN → propagation BGP → connectivité assemblée.
:::

:::lang en
We'll go like this: VNet peering (non-overlap) → gateway transit → VPN gateway (Bicep) → connectivity choice (decision) → ExpressRoute vs VPN → BGP propagation → connectivity assembled.
:::

### step-01

:::lang fr
**Objectif.** **Relier deux VNets par peering** — et vérifier le non-chevauchement.

**🤔 Connecter en privé.** Le peering relie deux VNets **directement** (trafic privé, faible latence). Condition : plages **non chevauchantes**. On modélise un hub et deux spokes et on vérifie la compatibilité.

Vérifie la compatibilité de peering :
:::

:::lang en
**Goal.** **Connect two VNets by peering** — and check non-overlap.

**🤔 Connect privately.** Peering connects two VNets **directly** (private traffic, low latency). Condition: **non-overlapping** ranges. We model a hub and two spokes and check compatibility.

Check peering compatibility:
:::

```bash
mkdir -p hybride && cd hybride
cat > peering.py <<'PY'
import ipaddress
hub    = {"nom": "vnet-hub", "plage": "10.0.0.0/16", "a_passerelle": True}
spokes = [
    {"nom": "spoke-prod", "plage": "10.1.0.0/16"},
    {"nom": "spoke-dev",  "plage": "10.2.0.0/16"},
    {"nom": "spoke-faux", "plage": "10.0.7.0/24"},   # chevauche le hub
]
h = ipaddress.ip_network(hub["plage"])
print(f"HUB {hub['nom']} ({hub['plage']})")
for s in spokes:
    net = ipaddress.ip_network(s["plage"])
    ok = not net.overlaps(h)
    print(f"  {s['nom']:12} {s['plage']:13} -> {'✅ peering OK' if ok else '❌ chevauche le hub (peering impossible)'}")
PY
python3 peering.py
```

:::lang fr
**✅ Vérification :** la sortie montre `spoke-prod 10.1.0.0/16 -> ✅ peering OK`, `spoke-dev 10.2.0.0/16 -> ✅ peering OK`, mais `spoke-faux 10.0.7.0/24 -> ❌ chevauche le hub (peering impossible)`. Le peering relie chaque spoke au hub **en privé** — à condition que les plages **ne se chevauchent pas**. Rappel clé : le peering est **non transitif** — `spoke-prod` peut joindre le hub, mais **pas** `spoke-dev` directement (il faut le hub comme relais). C'est pourquoi le hub **centralise** les services partagés. Un de ces services : la **passerelle**.
:::

:::lang en
**✅ Check:** the output shows `spoke-prod 10.1.0.0/16 -> ✅ peering OK`, `spoke-dev 10.2.0.0/16 -> ✅ peering OK`, but `spoke-faux 10.0.7.0/24 -> ❌ chevauche le hub (peering impossible)`. Peering connects each spoke to the hub **privately** — provided ranges **don't overlap**. Key reminder: peering is **non-transitive** — `spoke-prod` can reach the hub, but **not** `spoke-dev` directly (the hub relays). That's why the hub **centralizes** shared services. One of those services: the **gateway**.
:::

### step-02

:::lang fr
**Objectif.** Comprendre le **gateway transit** — un spoke utilise la passerelle du hub.

**🤔 Une passerelle, mutualisée.** Une passerelle est **coûteuse** et **une seule par VNet**. Avec le **gateway transit**, les spokes **empruntent** la passerelle du **hub** (via le peering) pour atteindre l'on-prem. On modélise ce transit.

Modélise le gateway transit :
:::

:::lang en
**Goal.** Understand **gateway transit** — a spoke uses the hub's gateway.

**🤔 One gateway, shared.** A gateway is **costly** and **one per VNet**. With **gateway transit**, spokes **borrow** the **hub's** gateway (via peering) to reach on-prem. We model this transit.

Model gateway transit:
:::

```bash
cat > transit.py <<'PY'
import ipaddress
hub    = {"nom": "vnet-hub", "plage": "10.0.0.0/16", "a_passerelle": True}
spokes = [{"nom": "spoke-prod", "plage": "10.1.0.0/16"}, {"nom": "spoke-dev", "plage": "10.2.0.0/16"}]
h = ipaddress.ip_network(hub["plage"])
print(f"HUB {hub['nom']} — passerelle VPN : {'oui' if hub['a_passerelle'] else 'non'}")
for s in spokes:
    if ipaddress.ip_network(s["plage"]).overlaps(h):
        print(f"  {s['nom']:12} ❌ chevauche le hub"); continue
    transit = "emprunte la passerelle du hub (gateway transit) -> atteint l'on-prem" if hub["a_passerelle"] else "pas de passerelle disponible"
    print(f"  {s['nom']:12} ✅ peere au hub ; {transit}")
PY
python3 transit.py
```

:::lang fr
**✅ Vérification :** la sortie confirme `HUB vnet-hub — passerelle VPN : oui`, puis pour chaque spoke : `✅ peere au hub ; emprunte la passerelle du hub (gateway transit) -> atteint l'on-prem`. Sans gateway transit, **chaque** spoke aurait besoin de **sa propre** passerelle (coûteux, complexe). Avec, **une seule** passerelle (au hub) sert **tous** les spokes. C'est **l'** intérêt majeur du hub-and-spoke pour l'hybride : mutualiser la connectivité on-prem. Reste à décrire cette **passerelle VPN**.
:::

:::lang en
**✅ Check:** the output confirms `HUB vnet-hub — passerelle VPN : oui`, then for each spoke: `✅ peere au hub ; emprunte la passerelle du hub (gateway transit) -> atteint l'on-prem`. Without gateway transit, **each** spoke would need **its own** gateway (costly, complex). With it, **one** gateway (at the hub) serves **all** spokes. That's **the** major benefit of hub-and-spoke for hybrid: sharing on-prem connectivity. Now to describe that **VPN gateway**.
:::

### step-03

:::lang fr
**Objectif.** Écrire une **passerelle VPN site-to-site** et la **valider** en Bicep.

**🤔 Le pont vers l'on-prem.** Une **passerelle VPN** (dans le `GatewaySubnet`) monte un **tunnel IPsec** vers ton datacenter. Elle a besoin d'une **IP publique**. On l'écrit en Bicep et on la **compile**.

Écris la passerelle VPN en Bicep et valide-la :
:::

:::lang en
**Goal.** Write a **site-to-site VPN gateway** and **validate** it in Bicep.

**🤔 The bridge to on-prem.** A **VPN gateway** (in the `GatewaySubnet`) sets up an **IPsec tunnel** to your datacenter. It needs a **public IP**. We write it in Bicep and **compile** it.

Write the VPN gateway in Bicep and validate it:
:::

```bash
cat > vpngw.bicep <<'BICEP'
param location string = resourceGroup().location

resource pip 'Microsoft.Network/publicIPAddresses@2023-05-01' = {
  name: 'pip-vpngw'
  location: location
  sku: { name: 'Standard' }
  properties: { publicIPAllocationMethod: 'Static' }
}

resource vpngw 'Microsoft.Network/virtualNetworkGateways@2023-05-01' = {
  name: 'vpn-gw'
  location: location
  properties: {
    gatewayType: 'Vpn'
    vpnType: 'RouteBased'
    sku: { name: 'VpnGw1', tier: 'VpnGw1' }
    ipConfigurations: [
      {
        name: 'default'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          publicIPAddress: { id: pip.id }
          subnet: { id: resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet-hub', 'GatewaySubnet') }
        }
      }
    ]
  }
}
BICEP

bicep build vpngw.bicep --stdout 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('VPN gateway -> ARM OK, ressources:', [r['type'].split('/')[-1] for r in d['resources']])"
```

:::lang fr
**✅ Vérification :** la sortie affiche `VPN gateway -> ARM OK, ressources: ['publicIPAddresses', 'virtualNetworkGateways']`. La passerelle est **valide** : type `Vpn`, `RouteBased` (compatible BGP), SKU `VpnGw1`, une **IP publique**, dans le `GatewaySubnet`. C'est le **côté Azure** du tunnel. Il manque, côté configuration, la **passerelle de réseau local** (l'IP publique + les plages de ton on-prem) et la **connexion** (qui relie les deux, avec la clé partagée). ⚠️ miniblue n'exécute pas les passerelles : on les **valide** en Bicep. Reste **la** question : quel lien choisir ?
:::

:::lang en
**✅ Check:** the output shows `VPN gateway -> ARM OK, ressources: ['publicIPAddresses', 'virtualNetworkGateways']`. The gateway is **valid**: type `Vpn`, `RouteBased` (BGP-compatible), SKU `VpnGw1`, a **public IP**, in the `GatewaySubnet`. That's the **Azure side** of the tunnel. Configuration-wise, still missing: the **local network gateway** (your on-prem's public IP + ranges) and the **connection** (linking both, with the shared key). ⚠️ miniblue doesn't execute gateways: we **validate** them in Bicep. Now **the** question: which link to choose?
:::

### step-04

:::lang fr
**Objectif.** **Choisir** la bonne connectivité — le moteur de décision.

**🤔 Le bon lien pour le bon besoin.** VNet↔VNet, on-prem, débit garanti… chaque besoin a **sa** réponse. On écrit un **moteur de décision** qui recommande peering, peering global, VPN ou ExpressRoute.

Écris le moteur de décision et teste-le :
:::

:::lang en
**Goal.** **Choose** the right connectivity — the decision engine.

**🤔 The right link for the right need.** VNet↔VNet, on-prem, guaranteed throughput… each need has **its** answer. We write a **decision engine** that recommends peering, global peering, VPN or ExpressRoute.

Write the decision engine and test it:
:::

```bash
cat > connectivite.py <<'PY'
def choisir(b):
    if b["vnet_a_vnet"] and b["meme_region"]:
        return "VNet Peering", "faible latence, trafic prive, pas de passerelle"
    if b["vnet_a_vnet"]:
        return "VNet Peering global", "peering entre regions differentes"
    if b["on_prem"] and b["debit_garanti"]:
        return "ExpressRoute", "lien prive dedie, SLA, gros debit (pas via Internet)"
    if b["on_prem"]:
        return "VPN Site-to-Site", "tunnel IPsec chiffre via Internet (rapide/pas cher)"
    return "Aucune connexion requise", ""

cas = [
    {"nom":"2 spokes meme region",  "vnet_a_vnet":True,  "meme_region":True,  "on_prem":False, "debit_garanti":False},
    {"nom":"2 VNets multi-region",  "vnet_a_vnet":True,  "meme_region":False, "on_prem":False, "debit_garanti":False},
    {"nom":"datacenter -> Azure",   "vnet_a_vnet":False, "meme_region":False, "on_prem":True,  "debit_garanti":False},
    {"nom":"DC critique gros debit","vnet_a_vnet":False, "meme_region":False, "on_prem":True,  "debit_garanti":True},
]
for c in cas:
    sol, pourquoi = choisir(c)
    print(f"{c['nom']:24} -> {sol:20} ({pourquoi})")
PY
python3 connectivite.py
```

:::lang fr
**✅ Vérification :** le moteur recommande : `2 spokes meme region -> VNet Peering`, `2 VNets multi-region -> VNet Peering global`, `datacenter -> Azure -> VPN Site-to-Site`, `DC critique gros debit -> ExpressRoute`. Chaque besoin trouve **son** lien : le **peering** pour relier des VNets (privé, rapide), le **VPN S2S** pour un datacenter (via Internet, rapide à monter), l'**ExpressRoute** pour du **critique/gros débit** (privé dédié, SLA). Ce **tableau de décision** est exactement ce que l'AZ-700 teste — et ce qui évite un choix coûteux. On approfondit **VPN vs ExpressRoute**.
:::

:::lang en
**✅ Check:** the engine recommends: `2 spokes meme region -> VNet Peering`, `2 VNets multi-region -> VNet Peering global`, `datacenter -> Azure -> VPN Site-to-Site`, `DC critique gros debit -> ExpressRoute`. Each need finds **its** link: **peering** to connect VNets (private, fast), **S2S VPN** for a datacenter (over the Internet, fast to set up), **ExpressRoute** for **critical/high-throughput** (private dedicated, SLA). This **decision table** is exactly what AZ-700 tests — and what avoids a costly choice. Let's dig into **VPN vs ExpressRoute**.
:::

### step-05

:::lang fr
**Objectif.** Comparer **VPN site-to-site** et **ExpressRoute**.

**🤔 Deux ponts, deux profils.** Le VPN passe par **Internet** (chiffré, variable) ; ExpressRoute est un **lien privé dédié** (garanti, cher). On tabule leurs différences sur les axes qui comptent.

Compare les deux options :
:::

:::lang en
**Goal.** Compare **site-to-site VPN** and **ExpressRoute**.

**🤔 Two bridges, two profiles.** VPN goes over **the Internet** (encrypted, variable); ExpressRoute is a **private dedicated link** (guaranteed, expensive). We tabulate their differences on the axes that matter.

Compare the two options:
:::

```bash
python3 <<'PY'
axes = ["Chemin", "Debit", "Latence", "SLA", "Cout", "Delai de mise en place"]
vpn  = ["Internet (IPsec)", "jusqu'a ~1-10 Gbps", "variable", "moyen", "faible", "rapide (heures)"]
er   = ["prive dedie (provider)", "jusqu'a ~100 Gbps", "faible et stable", "eleve", "eleve", "long (semaines)"]
print(f"{'Axe':24} {'VPN Site-to-Site':24} {'ExpressRoute':24}")
for a, v, e in zip(axes, vpn, er):
    print(f"{a:24} {v:24} {e:24}")
print("\n-> VPN : rapide/pas cher, bon pour debuter ou charges non critiques.")
print("-> ExpressRoute : critique, gros debit, latence stable, conformite.")
PY
```

:::lang fr
**✅ Vérification :** le tableau oppose les deux ponts axe par axe : le **VPN** passe par **Internet** (débit ~1-10 Gbps, latence **variable**, coût **faible**, mise en place en **heures**) ; **ExpressRoute** est un **lien privé dédié** (jusqu'à ~100 Gbps, latence **faible et stable**, **SLA élevé**, coût **élevé**, mise en place en **semaines**). Le VPN est parfait pour **débuter** ou pour des charges **non critiques** ; ExpressRoute s'impose pour le **critique**, le **gros débit** et les exigences de **conformité**. Beaucoup d'entreprises font les **deux** (ExpressRoute + VPN de secours). Ces liens transportent des routes : voyons **BGP**.
:::

:::lang en
**✅ Check:** the table contrasts the two bridges axis by axis: **VPN** goes over **the Internet** (throughput ~1-10 Gbps, **variable** latency, **low** cost, setup in **hours**); **ExpressRoute** is a **private dedicated link** (up to ~100 Gbps, **low, stable** latency, **high SLA**, **high** cost, setup in **weeks**). VPN is perfect to **start** or for **non-critical** workloads; ExpressRoute wins for **critical**, **high-throughput** and **compliance** requirements. Many enterprises run **both** (ExpressRoute + backup VPN). These links carry routes: let's see **BGP**.
:::

### step-06

:::lang fr
**Objectif.** Comprendre la **propagation des routes par BGP**.

**🤔 Des routes dynamiques.** Sur une connexion, **BGP** échange les routes **automatiquement** : Azure annonce ses plages, l'on-prem les siennes. Ces routes **apprises** rejoignent les **routes effectives**. On modélise l'échange.

Modélise la propagation BGP :
:::

:::lang en
**Goal.** Understand **route propagation by BGP**.

**🤔 Dynamic routes.** Over a connection, **BGP** exchanges routes **automatically**: Azure advertises its ranges, on-prem its own. These **learned** routes join the **effective routes**. We model the exchange.

Model BGP propagation:
:::

```bash
cat > bgp.py <<'PY'
# BGP : chaque cote ANNONCE ses plages ; l'autre les APPREND (routes effectives)
azure_annonce   = ["10.0.0.0/16", "10.1.0.0/16"]      # hub + spoke
onprem_annonce  = ["192.168.0.0/16", "172.16.0.0/12"] # datacenter

print("Azure annonce a l'on-prem :", azure_annonce)
print("On-prem annonce a Azure   :", onprem_annonce)
print("--- routes apprises (BGP) cote Azure ---")
for plage in onprem_annonce:
    print(f"  {plage:16} -> next hop: passerelle VPN (source BGP)")
print("-> pas de route statique a declarer : BGP propage automatiquement.")
PY
python3 bgp.py
```

:::lang fr
**✅ Vérification :** la sortie montre qu'**Azure annonce** `['10.0.0.0/16', '10.1.0.0/16']` et l'**on-prem annonce** `['192.168.0.0/16', '172.16.0.0/12']`, puis les **routes apprises côté Azure** : `192.168.0.0/16 -> passerelle VPN (source BGP)` et `172.16.0.0/12 -> passerelle VPN (source BGP)`. Grâce à **BGP**, aucune route **statique** à maintenir : chaque côté **annonce** ses plages, l'autre les **apprend** — et elles apparaissent comme routes **effectives** (source **BGP**, guide routage). Si l'on-prem ajoute un sous-réseau, Azure l'**apprend** automatiquement. C'est ce qui rend l'hybride **dynamique et maintenable**.
:::

:::lang en
**✅ Check:** the output shows **Azure advertises** `['10.0.0.0/16', '10.1.0.0/16']` and **on-prem advertises** `['192.168.0.0/16', '172.16.0.0/12']`, then the **learned routes on the Azure side**: `192.168.0.0/16 -> passerelle VPN (source BGP)` and `172.16.0.0/12 -> passerelle VPN (source BGP)`. Thanks to **BGP**, no **static** route to maintain: each side **advertises** its ranges, the other **learns** them — and they show up as **effective** routes (source **BGP**, routing guide). If on-prem adds a subnet, Azure **learns** it automatically. That's what makes hybrid **dynamic and maintainable**.
:::

### step-07

:::lang fr
**Objectif.** Assembler la **connectivité hybride** et récapituler.

**🤔 Relier, de bout en bout.** On récapitule les options — peering, gateway transit, VPN, ExpressRoute, BGP — et **quand** utiliser chacune.

Récapitule la connectivité :
:::

:::lang en
**Goal.** Assemble **hybrid connectivity** and recap.

**🤔 Connect, end to end.** We recap the options — peering, gateway transit, VPN, ExpressRoute, BGP — and **when** to use each.

Recap the connectivity:
:::

```bash
echo "=== Connectivite hybride (AZ-700) / hybrid connectivity ==="
printf "%-20s %s\n" "VNet Peering"     "VNet<->VNet, prive, faible latence, NON transitif"
printf "%-20s %s\n" "Peering global"   "VNet<->VNet entre regions differentes"
printf "%-20s %s\n" "Gateway transit"  "les spokes empruntent la passerelle du hub"
printf "%-20s %s\n" "VPN Site-to-Site" "on-prem<->Azure via Internet (IPsec, rapide/pas cher)"
printf "%-20s %s\n" "ExpressRoute"     "on-prem<->Azure prive dedie (garanti, SLA, critique)"
printf "%-20s %s\n" "BGP"              "propagation dynamique des routes sur la connexion"
```

:::lang fr
**✅ Vérification :** la table récapitule les **six briques** de la connectivité hybride. Tu tiens le pilier **connectivité** de l'AZ-700 : relier des VNets (**peering**, régional/global, non transitif), mutualiser la passerelle (**gateway transit**), monter un pont vers l'on-prem (**VPN S2S** ou **ExpressRoute** selon le besoin), et propager les routes (**BGP**). Ton réseau n'est plus une île : il est **hybride**, connecté aux autres réseaux et au datacenter. La suite du track AZ-700 : la **distribution** applicative — équilibrage de charge, Application Gateway, Front Door, Traffic Manager.
:::

:::lang en
**✅ Check:** the table recaps the **six building blocks** of hybrid connectivity. You hold the **connectivity** pillar of AZ-700: connecting VNets (**peering**, regional/global, non-transitive), sharing the gateway (**gateway transit**), building a bridge to on-prem (**S2S VPN** or **ExpressRoute** by need), and propagating routes (**BGP**). Your network is no longer an island: it's **hybrid**, connected to other networks and the datacenter. Next in the AZ-700 track: application **delivery** — load balancing, Application Gateway, Front Door, Traffic Manager.
:::

## pitfalls

:::lang fr
**1. Peering avec plages qui se chevauchent.** Impossible. Les espaces d'adressage doivent être **disjoints** (planifie globalement, guide fondamentaux).

**2. Croire le peering transitif.** A↔B et B↔C ne donne **pas** A↔C. Utilise le **hub** comme relais (routes + gateway transit).

**3. Une passerelle par spoke.** Coûteux et complexe. Mets **une** passerelle au hub et active le **gateway transit**.

**4. VPN pour du critique/gros débit.** Le VPN passe par Internet (variable). Pour le **critique**, choisis **ExpressRoute** (dédié, SLA).

**5. ExpressRoute pour un besoin simple.** Cher et long à monter. Pour débuter ou du non-critique, le **VPN S2S** suffit.

**6. Routes statiques partout.** Fastidieux et fragile. Utilise **BGP** : les routes se **propagent** automatiquement.

**7. Oublier le `GatewaySubnet`.** La passerelle VPN **exige** un sous-réseau nommé `GatewaySubnet` (`/27`+). Réserve-le dans le plan d'adressage.
:::

:::lang en
**1. Peering with overlapping ranges.** Impossible. Address spaces must be **disjoint** (plan globally, fundamentals guide).

**2. Thinking peering is transitive.** A↔B and B↔C does **not** give A↔C. Use the **hub** as a relay (routes + gateway transit).

**3. One gateway per spoke.** Costly and complex. Put **one** gateway at the hub and enable **gateway transit**.

**4. VPN for critical/high-throughput.** VPN goes over the Internet (variable). For **critical**, choose **ExpressRoute** (dedicated, SLA).

**5. ExpressRoute for a simple need.** Expensive and slow to set up. To start or for non-critical, **S2S VPN** suffices.

**6. Static routes everywhere.** Tedious and fragile. Use **BGP**: routes **propagate** automatically.

**7. Forgetting the `GatewaySubnet`.** The VPN gateway **requires** a subnet named `GatewaySubnet` (`/27`+). Reserve it in the address plan.
:::

## success

:::lang fr
Tu as réussi si :

- Tu **relies** deux VNets par **peering** et vérifies le non-chevauchement.
- Tu expliques le **gateway transit** (spoke → passerelle du hub).
- Tu écris une **passerelle VPN** et la **valides** en Bicep.
- Tu **choisis** la bonne connectivité (peering / global / VPN / ExpressRoute).
- Tu compares **VPN** et **ExpressRoute** sur les axes clés.
- Tu comprends la **propagation des routes par BGP**.
:::

:::lang en
You've succeeded if:

- You **connect** two VNets by **peering** and check non-overlap.
- You explain **gateway transit** (spoke → hub's gateway).
- You write a **VPN gateway** and **validate** it in Bicep.
- You **choose** the right connectivity (peering / global / VPN / ExpressRoute).
- You compare **VPN** and **ExpressRoute** on the key axes.
- You understand **route propagation by BGP**.
:::

## next

:::lang fr
- **Suivant :** *Azure — distribution applicative (AZ-700)* — équilibrage de charge, App Gateway, Front Door, Traffic Manager.
- **Réviser :** *Azure — routage réseau (AZ-700)* pour les routes effectives (BGP).
- **S'entraîner :** ajoute un cas « site distant multiple » au moteur de décision, et un 3e spoke avec gateway transit.
:::

:::lang en
- **Next:** *Azure — application delivery (AZ-700)* — load balancing, App Gateway, Front Door, Traffic Manager.
- **Review:** *Azure — network routing (AZ-700)* for effective routes (BGP).
- **Practice:** add a "multiple remote sites" case to the decision engine, and a 3rd spoke with gateway transit.
:::

## cheatsheet

:::lang fr
**Le bon lien selon le besoin**

```text
VNet <-> VNet, meme region      -> VNet Peering
VNet <-> VNet, regions diff.    -> VNet Peering global
on-prem <-> Azure, rapide/cheap -> VPN Site-to-Site (IPsec via Internet)
on-prem <-> Azure, critique     -> ExpressRoute (prive dedie, SLA)
```

**Peering — a retenir**

```text
- prive, faible latence, backbone Microsoft
- plages NON chevauchantes (obligatoire)
- NON transitif (A<->B, B<->C =/=> A<->C)
- gateway transit : les spokes empruntent la passerelle du hub
```

**VPN vs ExpressRoute**

```text
              VPN S2S            ExpressRoute
Chemin        Internet (IPsec)   prive dedie (provider)
Debit         ~1-10 Gbps         jusqu'a ~100 Gbps
Latence       variable           faible et stable
Cout/delai    faible / heures    eleve / semaines
```

**Passerelle VPN (Bicep)**

```text
publicIPAddresses + virtualNetworkGateways (gatewayType: Vpn, RouteBased, GatewaySubnet)
+ localNetworkGateways (on-prem) + connections (cle partagee) ; BGP pour les routes
```
:::

:::lang en
**The right link by need**

```text
VNet <-> VNet, same region      -> VNet Peering
VNet <-> VNet, diff. regions    -> VNet Peering global
on-prem <-> Azure, fast/cheap   -> Site-to-Site VPN (IPsec over Internet)
on-prem <-> Azure, critical     -> ExpressRoute (private dedicated, SLA)
```

**Peering — remember**

```text
- private, low latency, Microsoft backbone
- NON-overlapping ranges (mandatory)
- NON-transitive (A<->B, B<->C =/=> A<->C)
- gateway transit: spokes borrow the hub's gateway
```

**VPN vs ExpressRoute**

```text
              S2S VPN            ExpressRoute
Path          Internet (IPsec)   private dedicated (provider)
Throughput    ~1-10 Gbps         up to ~100 Gbps
Latency       variable           low and stable
Cost/setup    low / hours        high / weeks
```

**VPN gateway (Bicep)**

```text
publicIPAddresses + virtualNetworkGateways (gatewayType: Vpn, RouteBased, GatewaySubnet)
+ localNetworkGateways (on-prem) + connections (shared key); BGP for routes
```
:::

## resources

:::lang fr
- **VNet peering** : régional, global, non-transitivité, gateway transit — Microsoft Learn.
- **Passerelle VPN** : site-to-site, SKU, RouteBased/PolicyBased — Microsoft Learn.
- **ExpressRoute** : circuits, peering, SLA, fournisseurs — Microsoft Learn (AZ-700).
- **BGP dans Azure** : propagation des routes, ASN — Microsoft Learn.
- **Hub-and-spoke hybride** : topologie de référence — Cloud Adoption Framework.
- **Bicep** : `virtualNetworkGateways`, `connections`, `localNetworkGateways` — Microsoft Learn.
:::

:::lang en
- **VNet peering**: regional, global, non-transitivity, gateway transit — Microsoft Learn.
- **VPN gateway**: site-to-site, SKUs, RouteBased/PolicyBased — Microsoft Learn.
- **ExpressRoute**: circuits, peerings, SLA, providers — Microsoft Learn (AZ-700).
- **BGP in Azure**: route propagation, ASN — Microsoft Learn.
- **Hybrid hub-and-spoke**: reference topology — Cloud Adoption Framework.
- **Bicep**: `virtualNetworkGateways`, `connections`, `localNetworkGateways` — Microsoft Learn.
:::

## troubleshooting

:::lang fr
**`bicep : command not found` (step-03).** `az bicep install`, ou installe le binaire autonome (releases GitHub `Azure/bicep`).

**Le peering échoue (en vrai Azure).** Les espaces d'adressage se **chevauchent**. Vérifie avec `overlaps` (step-01) : les plages doivent être **disjointes**.

**Le spoke n'atteint pas l'on-prem.** Vérifie le **gateway transit** (activé sur le peering hub→spoke) et que le hub a bien une **passerelle**. Sans transit, le spoke ne « voit » pas la passerelle.

**Deux spokes ne se parlent pas.** Le peering est **non transitif**. Il faut une route via le **hub** (UDR + une NVA/pare-feu dans le hub), ou un peering **direct** spoke↔spoke.

**Quel SKU de passerelle VPN ?** `VpnGw1` à `VpnGw5` : plus le numéro est élevé, plus le **débit** et le nombre de tunnels augmentent (et le coût). `Basic` est déconseillé (limité, pas de BGP).

**Les passerelles ne se déploient pas en local.** miniblue ne les émule pas. On **valide** en **Bicep** et on **raisonne** la connectivité ; l'exécution vise du vrai Azure.
:::

:::lang en
**`bicep: command not found` (step-03).** `az bicep install`, or install the standalone binary (GitHub `Azure/bicep` releases).

**Peering fails (in real Azure).** The address spaces **overlap**. Check with `overlaps` (step-01): ranges must be **disjoint**.

**The spoke doesn't reach on-prem.** Check **gateway transit** (enabled on the hub→spoke peering) and that the hub actually has a **gateway**. Without transit, the spoke doesn't "see" the gateway.

**Two spokes can't talk.** Peering is **non-transitive**. You need a route via the **hub** (UDR + an NVA/firewall in the hub), or a **direct** spoke↔spoke peering.

**Which VPN gateway SKU?** `VpnGw1` to `VpnGw5`: the higher the number, the more **throughput** and tunnels (and cost). `Basic` is discouraged (limited, no BGP).

**Gateways won't deploy locally.** miniblue doesn't emulate them. We **validate** in **Bicep** and **reason** about connectivity; execution targets real Azure.
:::
