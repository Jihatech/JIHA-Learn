---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-reseau-routage
slug: azure-reseau-routage
order: 83
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — routage réseau (AZ-700) : routes système, UDR, tunneling forcé"
title_en: "Azure — network routing (AZ-700): system routes, UDR, forced tunneling"
tagline_fr: "préfixe le plus long, routes définies, faire passer par le pare-feu."
tagline_en: "longest prefix, user-defined routes, force through the firewall."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 250
repo: "Azure/bicep"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-reseau-fondamentaux]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [routage, routes-systeme, udr, table-de-routes, prefixe-le-plus-long, tunneling-force, nva, routes-effectives, az-700]
concepts_en: [routing, system-routes, udr, route-table, longest-prefix, forced-tunneling, nva, effective-routes, az-700]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Maîtriser le routage Azure pour l'AZ-700, en local et pour de vrai : les routes système par défaut, la logique de sélection (préfixe le plus long puis priorité de source UDR > BGP > système) reproduite dans un moteur de routage exécutable, les routes définies par l'utilisateur (UDR) écrites et validées en Bicep, le tunneling forcé (0.0.0.0/0 → pare-feu), les routes effectives combinées, et le chaînage de service via une appliance réseau virtuelle (NVA + IP forwarding). Sans compte cloud.",
og_description_en: "Mastering Azure routing for AZ-700, locally and for real: the default system routes, the selection logic (longest prefix then source priority UDR > BGP > system) reproduced in a runnable routing engine, user-defined routes (UDR) written and validated in Bicep, forced tunneling (0.0.0.0/0 → firewall), the combined effective routes, and service chaining through a network virtual appliance (NVA + IP forwarding). No cloud account."
---

## intro

:::lang fr
Un paquet quitte une machine — **où va-t-il** ? La réponse est le **routage** : la table qui décide, pour chaque destination, le **prochain saut**. L'**AZ-700** en fait un savoir-faire précis : comprendre les **routes système**, écrire des **routes définies par l'utilisateur** (UDR), forcer le trafic par un **pare-feu** (tunneling forcé), et lire les **routes effectives**. C'est ce qui distingue un réseau **qui marche** d'un réseau **maîtrisé**.

Fidèle à la méthode, on pratique **en local et pour de vrai** : on décrit les **routes système** par défaut, on **reproduit la logique de sélection d'Azure** (préfixe **le plus long**, puis priorité **UDR > BGP > système**) dans un **moteur de routage exécutable**, on écrit et **valide** des **UDR** en **Bicep**, on met en place le **tunneling forcé** (`0.0.0.0/0` → pare-feu), on combine les **routes effectives**, et on **chaîne un service** via une **appliance réseau virtuelle** (NVA + *IP forwarding*).

**Pour qui c'est :** tu as les fondations réseau (guide précédent) et tu veux **contrôler les chemins**.

**Quand ce n'est PAS le bon choix :**

- Tu ne connais pas VNet/sous-réseaux → fais *Azure — réseau fondamentaux (AZ-700)*.
- Tu cherches le filtrage (NSG) → c'est la **sécurité** ; ici c'est le **chemin** (routage).
:::

:::lang en
A packet leaves a machine — **where does it go**? The answer is **routing**: the table that decides, for each destination, the **next hop**. **AZ-700** makes it a precise skill: understanding **system routes**, writing **user-defined routes** (UDR), forcing traffic through a **firewall** (forced tunneling), and reading the **effective routes**. It's what separates a network that **works** from one you **control**.

True to the method, we practice **locally and for real**: we describe the default **system routes**, we **reproduce Azure's selection logic** (**longest** prefix, then **UDR > BGP > system** priority) in a **runnable routing engine**, we write and **validate** **UDRs** in **Bicep**, we set up **forced tunneling** (`0.0.0.0/0` → firewall), we combine the **effective routes**, and we **chain a service** through a **network virtual appliance** (NVA + *IP forwarding*).

**Who it's for:** you have the network foundations (previous guide) and want to **control the paths**.

**When it's NOT the right choice:**

- You don't know VNet/subnets → do *Azure — network fundamentals (AZ-700)*.
- You want filtering (NSG) → that's **security**; here it's the **path** (routing).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Expliquer les **routes système** par défaut d'Azure.
- Appliquer la **correspondance de préfixe le plus long** (longest prefix match).
- Résoudre les priorités **UDR > BGP > système** (routes effectives).
- Écrire une **route définie par l'utilisateur** (UDR) et la **valider** en Bicep.
- Mettre en place le **tunneling forcé** (`0.0.0.0/0` → pare-feu).
- **Chaîner un service** via une **NVA** (+ *IP forwarding*).
- Diagnostiquer un chemin avec les **routes effectives**.
:::

:::lang en
By the end of this guide, you can:

- Explain Azure's default **system routes**.
- Apply **longest prefix match**.
- Resolve **UDR > BGP > system** priorities (effective routes).
- Write a **user-defined route** (UDR) and **validate** it in Bicep.
- Set up **forced tunneling** (`0.0.0.0/0` → firewall).
- **Chain a service** through an **NVA** (+ *IP forwarding*).
- Diagnose a path with **effective routes**.
:::

## prerequisites

:::lang fr
- Le guide **Azure — réseau fondamentaux (AZ-700)** (VNet, sous-réseaux, adressage).
- Le **lab local** : **Bicep CLI** (`az bicep install` ou binaire), **Python 3** (module `ipaddress`), **miniblue** optionnel.
- **Aucun compte cloud** : moteur de routage exécutable en local, UDR validées en Bicep.
:::

:::lang en
- The **Azure — network fundamentals (AZ-700)** guide (VNet, subnets, addressing).
- The **local lab**: **Bicep CLI** (`az bicep install` or binary), **Python 3** (`ipaddress` module), **miniblue** optional.
- **No cloud account**: runnable routing engine locally, UDRs validated in Bicep.
:::

## concepts

:::lang fr
**Les routes système.** Azure crée **automatiquement** des routes pour chaque sous-réseau : vers le **VNet local** (trafic interne), vers les **VNets peerés**, et une route par défaut `0.0.0.0/0` vers **Internet**. Elles suffisent souvent — mais tu ne les **contrôles pas**. Pour dévier le trafic, il faut des **routes à toi**.

**La correspondance de préfixe le plus long.** Quand plusieurs routes matchent une destination, Azure choisit celle au **préfixe le plus long** (le plus **spécifique**). Exemple : pour `10.1.2.3`, une route `10.1.0.0/16` (préfixe /16) **l'emporte** sur `0.0.0.0/0` (préfixe /0). C'est **la** règle de sélection — la plus spécifique gagne.

**La priorité de source (routes effectives).** À **préfixe égal**, Azure départage par **source** : **UDR** (route définie par l'utilisateur) > **BGP** (route apprise, ex. via ExpressRoute/VPN) > **Système** (route par défaut). Une **UDR** peut donc **écraser** une route système de même préfixe. La combinaison de toutes ces routes forme les **routes effectives** d'une carte réseau — ce que le paquet suit **réellement**.

**Les routes définies par l'utilisateur (UDR).** Une **table de routes** (route table) contient des **UDR** que tu **attaches à un sous-réseau**. Chaque UDR : un **préfixe** de destination + un **type de prochain saut** (`Internet`, `VirtualNetworkGateway`, `VirtualAppliance` avec une IP, `None` pour bloquer). C'est ainsi qu'on **dévie** le trafic — vers un pare-feu, une passerelle, un trou noir.

**Le tunneling forcé.** Par défaut, le trafic sortant part **directement** vers Internet (route système `0.0.0.0/0`). Le **tunneling forcé** ajoute une **UDR** `0.0.0.0/0` → **appliance/pare-feu** (ou passerelle) : **tout** le trafic sortant passe désormais par le **pare-feu** (inspection, journalisation, egress contrôlé) avant de sortir — ou reste **on-premises**. C'est un contrôle **de sécurité** majeur exprimé par le **routage**.

**Le chaînage de service (NVA).** Une **appliance réseau virtuelle** (NVA — pare-feu tiers, proxy) s'insère dans le chemin : les UDR envoient le trafic **vers** la NVA, qui l'inspecte puis le **réémet**. Pour cela, la NVA doit avoir l'**IP forwarding** activé (elle route du trafic **qui ne lui est pas destiné**). C'est le **service chaining** : forcer le trafic à traverser des fonctions réseau.

**Ce qui est live ici.** La **logique de routage** (préfixe le plus long + priorité de source) est un **moteur exécutable** en Python — de **vraies** décisions reproduisant Azure. Les **UDR** et les **tables de routes** s'écrivent et se **compilent en ARM** avec **Bicep** (validation offline ; miniblue n'émule pas les tables de routes). Le **tunneling forcé** et le **chaînage NVA** se **démontrent** par le moteur. Tout sans compte cloud.
:::

:::lang en
**System routes.** Azure **automatically** creates routes for each subnet: to the **local VNet** (internal traffic), to **peered VNets**, and a default `0.0.0.0/0` route to **the Internet**. They often suffice — but you don't **control** them. To divert traffic, you need routes of **your own**.

**Longest prefix match.** When several routes match a destination, Azure picks the one with the **longest prefix** (the most **specific**). Example: for `10.1.2.3`, a `10.1.0.0/16` route (prefix /16) **beats** `0.0.0.0/0` (prefix /0). That's **the** selection rule — the most specific wins.

**Source priority (effective routes).** At **equal prefix**, Azure breaks the tie by **source**: **UDR** (user-defined route) > **BGP** (learned route, e.g. via ExpressRoute/VPN) > **System** (default route). So a **UDR** can **override** a system route of the same prefix. Combining all these routes forms a NIC's **effective routes** — what the packet **actually** follows.

**User-defined routes (UDR).** A **route table** holds **UDRs** you **attach to a subnet**. Each UDR: a destination **prefix** + a **next-hop type** (`Internet`, `VirtualNetworkGateway`, `VirtualAppliance` with an IP, `None` to block). That's how you **divert** traffic — to a firewall, a gateway, a black hole.

**Forced tunneling.** By default, outbound traffic goes **directly** to the Internet (system route `0.0.0.0/0`). **Forced tunneling** adds a UDR `0.0.0.0/0` → **appliance/firewall** (or gateway): **all** outbound traffic now goes through the **firewall** (inspection, logging, controlled egress) before leaving — or stays **on-premises**. It's a major **security** control expressed through **routing**.

**Service chaining (NVA).** A **network virtual appliance** (NVA — third-party firewall, proxy) inserts into the path: UDRs send traffic **to** the NVA, which inspects then **re-emits** it. For that, the NVA needs **IP forwarding** enabled (it routes traffic **not addressed to it**). That's **service chaining**: forcing traffic through network functions.

**What's live here.** The **routing logic** (longest prefix + source priority) is a **runnable engine** in Python — **real** decisions reproducing Azure. **UDRs** and **route tables** are written and **compiled to ARM** with **Bicep** (offline validation; miniblue doesn't emulate route tables). **Forced tunneling** and **NVA chaining** are **demonstrated** by the engine. All without a cloud account.
:::

:::figure azure-reseau-routage-selection
caption_fr: "Schéma 1. La sélection de route Azure : pour une destination, on retient les routes qui MATCHENT, puis on choisit le PRÉFIXE LE PLUS LONG (le plus spécifique) ; à préfixe égal, la PRIORITÉ DE SOURCE tranche (UDR > BGP > Système). Une UDR 0.0.0.0/0 → PARE-FEU (tunneling forcé) dévie TOUT l'egress par l'appliance. Les routes effectives = système + BGP + UDR combinées."
caption_en: "Figure 1. Azure route selection: for a destination, keep the routes that MATCH, then pick the LONGEST PREFIX (most specific); at equal prefix, SOURCE PRIORITY decides (UDR > BGP > System). A UDR 0.0.0.0/0 → FIREWALL (forced tunneling) diverts ALL egress through the appliance. Effective routes = system + BGP + UDR combined."
:::

## walkthrough

:::lang fr
On avance ainsi : routes système → correspondance de préfixe le plus long → UDR (Bicep) → tunneling forcé → routes effectives (priorité de source) → chaînage NVA → routage assemblé.
:::

:::lang en
We'll go like this: system routes → longest prefix match → UDR (Bicep) → forced tunneling → effective routes (source priority) → NVA chaining → routing assembled.
:::

### step-01

:::lang fr
**Objectif.** Comprendre les **routes système** — ce qu'Azure fournit par défaut.

**🤔 Le routage existe déjà.** Sans rien faire, Azure crée des routes : vers le **VNet local**, vers les **VNets peerés**, et vers **Internet** (`0.0.0.0/0`). On les pose comme base de notre moteur.

Écris les routes système de base :
:::

:::lang en
**Goal.** Understand **system routes** — what Azure provides by default.

**🤔 Routing already exists.** Without doing anything, Azure creates routes: to the **local VNet**, to **peered VNets**, and to the **Internet** (`0.0.0.0/0`). We lay them as our engine's base.

Write the base system routes:
:::

```bash
mkdir -p routage && cd routage
cat > routes.py <<'PY'
# Routes SYSTEME par defaut (Azure les cree automatiquement)
ROUTES_SYSTEME = [
    {"prefixe": "10.0.0.0/16", "next_hop": "VNet local", "source": "Systeme"},
    {"prefixe": "0.0.0.0/0",   "next_hop": "Internet",   "source": "Systeme"},
]
print("Routes systeme par defaut :")
for r in ROUTES_SYSTEME:
    print(f"  {r['prefixe']:14} -> {r['next_hop']:12} [{r['source']}]")
PY
python3 routes.py
```

:::lang fr
**✅ Vérification :** la sortie liste les deux routes système : `10.0.0.0/16 -> VNet local` (le trafic interne reste dans le VNet) et `0.0.0.0/0 -> Internet` (le reste part vers Internet). Ce sont les routes qu'Azure **crée seul** pour chaque sous-réseau — tu n'as **rien** écrit. Elles fonctionnent, mais tu ne les **contrôles pas** : impossible de forcer une inspection ou un egress par pare-feu **avec les seules routes système**. Pour cela, il faut comprendre **comment Azure choisit** une route.
:::

:::lang en
**✅ Check:** the output lists the two system routes: `10.0.0.0/16 -> VNet local` (internal traffic stays in the VNet) and `0.0.0.0/0 -> Internet` (the rest goes to the Internet). These are the routes Azure **creates by itself** for each subnet — you wrote **nothing**. They work, but you don't **control** them: you can't force inspection or firewall egress **with system routes alone**. For that, you must understand **how Azure picks** a route.
:::

### step-02

:::lang fr
**Objectif.** Appliquer la **correspondance de préfixe le plus long**.

**🤔 La plus spécifique gagne.** Quand plusieurs routes matchent, Azure choisit le **préfixe le plus long**. On écrit le **moteur** qui applique cette règle et on l'éprouve sur trois destinations.

Écris le moteur de routage et teste-le :
:::

:::lang en
**Goal.** Apply **longest prefix match**.

**🤔 The most specific wins.** When several routes match, Azure picks the **longest prefix**. We write the **engine** that applies this rule and test it on three destinations.

Write the routing engine and test it:
:::

```bash
cat > routage.py <<'PY'
import ipaddress
# Priorite de source pour departager a prefixe EGAL / source priority at EQUAL prefix
PRIORITE = {"UDR": 0, "BGP": 1, "Systeme": 2}

def router(routes, dest_ip):
    ip = ipaddress.ip_address(dest_ip)
    candidats = [r for r in routes if ip in ipaddress.ip_network(r["prefixe"])]
    if not candidats:
        return {"next_hop": "AUCUNE (paquet perdu)", "prefixe": "-", "source": "-"}
    # prefixe le plus long d'abord, puis priorite de source
    candidats.sort(key=lambda r: (-ipaddress.ip_network(r["prefixe"]).prefixlen, PRIORITE[r["source"]]))
    return candidats[0]

routes = [
    {"prefixe": "10.0.0.0/16", "next_hop": "VNet local", "source": "Systeme"},
    {"prefixe": "0.0.0.0/0",   "next_hop": "Internet",   "source": "Systeme"},
]
for dest in ["10.0.5.10", "8.8.8.8"]:
    r = router(routes, dest)
    print(f"{dest:12} -> {r['next_hop']:12} (prefixe {r['prefixe']}, source {r['source']})")
PY
python3 routage.py
```

:::lang fr
**✅ Vérification :** la sortie montre `10.0.5.10 -> VNet local (prefixe 10.0.0.0/16)` et `8.8.8.8 -> Internet (prefixe 0.0.0.0/0)`. Pour `10.0.5.10`, **deux** routes matchaient (`10.0.0.0/16` **et** `0.0.0.0/0`) — le moteur a choisi la **plus spécifique** (`/16` > `/0`). Pour `8.8.8.8`, seule `0.0.0.0/0` matchait. C'est **exactement** la règle d'Azure : **préfixe le plus long**. Maintenant qu'on sait choisir, on va **ajouter nos propres routes** pour dévier le trafic.
:::

:::lang en
**✅ Check:** the output shows `10.0.5.10 -> VNet local (prefixe 10.0.0.0/16)` and `8.8.8.8 -> Internet (prefixe 0.0.0.0/0)`. For `10.0.5.10`, **two** routes matched (`10.0.0.0/16` **and** `0.0.0.0/0`) — the engine picked the **most specific** (`/16` > `/0`). For `8.8.8.8`, only `0.0.0.0/0` matched. That's **exactly** Azure's rule: **longest prefix**. Now that we can pick, we'll **add our own routes** to divert traffic.
:::

### step-03

:::lang fr
**Objectif.** Écrire une **route définie par l'utilisateur** (UDR) et la **valider** en Bicep.

**🤔 Tes propres routes.** Une **table de routes** contient des **UDR** attachées à un sous-réseau. On en écrit une (`0.0.0.0/0` → appliance à `10.0.0.4`) en Bicep et on la **compile** (validation).

Écris la table de routes en Bicep et valide-la :
:::

:::lang en
**Goal.** Write a **user-defined route** (UDR) and **validate** it in Bicep.

**🤔 Your own routes.** A **route table** holds **UDRs** attached to a subnet. We write one (`0.0.0.0/0` → appliance at `10.0.0.4`) in Bicep and **compile** it (validation).

Write the route table in Bicep and validate it:
:::

```bash
cat > rt.bicep <<'BICEP'
resource rt 'Microsoft.Network/routeTables@2023-05-01' = {
  name: 'rt-spoke'
  location: resourceGroup().location
  properties: {
    routes: [
      {
        name: 'vers-firewall'
        properties: {
          addressPrefix: '0.0.0.0/0'          // toute destination
          nextHopType: 'VirtualAppliance'     // via une appliance (NVA/pare-feu)
          nextHopIpAddress: '10.0.0.4'        // l'IP de l'appliance
        }
      }
    ]
  }
}
BICEP

bicep build rt.bicep --stdout 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('table de routes -> ARM OK, ressource:', d['resources'][0]['type'])"
```

:::lang fr
**✅ Vérification :** la sortie affiche `table de routes -> ARM OK, ressource: Microsoft.Network/routeTables`. La table est **valide** : elle contient une **UDR** `0.0.0.0/0` → `VirtualAppliance` à `10.0.0.4`. Attachée à un sous-réseau (en vrai Azure), elle **redirige** tout le trafic sortant vers l'appliance **au lieu** d'Internet. Note les pièces d'une UDR : le **préfixe** (destination) et le **type de prochain saut** (`Internet`, `VirtualNetworkGateway`, `VirtualAppliance`, ou `None` pour bloquer). ⚠️ miniblue n'exécute pas les tables de routes : on les **valide** en Bicep. On voit maintenant l'effet : le **tunneling forcé**.
:::

:::lang en
**✅ Check:** the output shows `table de routes -> ARM OK, ressource: Microsoft.Network/routeTables`. The table is **valid**: it holds a **UDR** `0.0.0.0/0` → `VirtualAppliance` at `10.0.0.4`. Attached to a subnet (in real Azure), it **redirects** all outbound traffic to the appliance **instead of** the Internet. Note a UDR's parts: the **prefix** (destination) and the **next-hop type** (`Internet`, `VirtualNetworkGateway`, `VirtualAppliance`, or `None` to block). ⚠️ miniblue doesn't execute route tables: we **validate** them in Bicep. Now let's see the effect: **forced tunneling**.
:::

### step-04

:::lang fr
**Objectif.** Mettre en place le **tunneling forcé** — tout l'egress par le pare-feu.

**🤔 Reprendre le contrôle de la sortie.** On ajoute l'UDR `0.0.0.0/0` → pare-feu à nos routes, avec la **priorité de source** (UDR > système). Résultat : le trafic Internet ne part **plus** directement, il passe par le **pare-feu**.

Ajoute l'UDR et observe le déroutage :
:::

:::lang en
**Goal.** Set up **forced tunneling** — all egress through the firewall.

**🤔 Regain control of egress.** We add the UDR `0.0.0.0/0` → firewall to our routes, with **source priority** (UDR > system). Result: Internet traffic no longer leaves **directly**, it goes through the **firewall**.

Add the UDR and observe the diversion:
:::

```bash
cat >> routage.py <<'PY'

# Tunneling force : une UDR 0.0.0.0/0 -> pare-feu ecrase la route systeme Internet
routes_avec_udr = routes + [
    {"prefixe": "0.0.0.0/0", "next_hop": "Pare-feu (10.0.0.4)", "source": "UDR"},
]
print("--- avec tunneling force / with forced tunneling ---")
for dest in ["8.8.8.8", "10.0.5.10"]:
    r = router(routes_avec_udr, dest)
    print(f"{dest:12} -> {r['next_hop']:22} (prefixe {r['prefixe']}, source {r['source']})")
PY
python3 routage.py | tail -3
```

:::lang fr
**✅ Vérification :** avec l'UDR, `8.8.8.8 -> Pare-feu (10.0.0.4) (prefixe 0.0.0.0/0, source UDR)` : le trafic Internet passe désormais par le **pare-feu** (la route système Internet est **écrasée** par l'UDR de même préfixe, priorité **UDR > Système**). Mais `10.0.5.10 -> VNet local` reste inchangé : sa route `/16` est **plus spécifique** que le `/0` de l'UDR — le trafic **interne** n'est **pas** dérouté. C'est le **tunneling forcé** : tout l'**egress** est inspecté par le pare-feu, sans casser le trafic **local**. Un contrôle de sécurité **exprimé par le routage**.
:::

:::lang en
**✅ Check:** with the UDR, `8.8.8.8 -> Pare-feu (10.0.0.4) (prefixe 0.0.0.0/0, source UDR)`: Internet traffic now goes through the **firewall** (the system Internet route is **overridden** by the same-prefix UDR, priority **UDR > System**). But `10.0.5.10 -> VNet local` stays unchanged: its `/16` route is **more specific** than the UDR's `/0` — **internal** traffic is **not** diverted. That's **forced tunneling**: all **egress** is inspected by the firewall, without breaking **local** traffic. A security control **expressed through routing**.
:::

### step-05

:::lang fr
**Objectif.** Lire les **routes effectives** — combiner système, BGP et UDR.

**🤔 Ce que le paquet suit vraiment.** Les routes viennent de **trois sources** (système, BGP appris, UDR). Les **routes effectives** les combinent, avec la priorité **UDR > BGP > Système** à préfixe égal. On ajoute une route **BGP** (VNet peeré) et on lit le résultat.

Combine les trois sources et lis les routes effectives :
:::

:::lang en
**Goal.** Read the **effective routes** — combine system, BGP and UDR.

**🤔 What the packet actually follows.** Routes come from **three sources** (system, learned BGP, UDR). The **effective routes** combine them, with priority **UDR > BGP > System** at equal prefix. We add a **BGP** route (peered VNet) and read the result.

Combine the three sources and read the effective routes:
:::

```bash
cat > effectives.py <<'PY'
import ipaddress
PRIORITE = {"UDR": 0, "BGP": 1, "Systeme": 2}
def router(routes, dest_ip):
    ip = ipaddress.ip_address(dest_ip)
    c = [r for r in routes if ip in ipaddress.ip_network(r["prefixe"])]
    c.sort(key=lambda r: (-ipaddress.ip_network(r["prefixe"]).prefixlen, PRIORITE[r["source"]]))
    return c[0]

# Routes effectives = systeme + BGP (appris) + UDR
effectives = [
    {"prefixe": "10.0.0.0/16", "next_hop": "VNet local",       "source": "Systeme"},
    {"prefixe": "0.0.0.0/0",   "next_hop": "Internet",         "source": "Systeme"},
    {"prefixe": "10.1.0.0/16", "next_hop": "Peering (spoke)",  "source": "BGP"},      # appris
    {"prefixe": "0.0.0.0/0",   "next_hop": "Pare-feu (10.0.0.4)", "source": "UDR"},   # tunneling force
]
for dest in ["10.0.5.10", "10.1.2.3", "8.8.8.8"]:
    r = router(effectives, dest)
    print(f"{dest:12} -> {r['next_hop']:22} (prefixe {r['prefixe']}, source {r['source']})")
PY
python3 effectives.py
```

:::lang fr
**✅ Vérification :** les routes effectives donnent : `10.0.5.10 -> VNet local (Systeme)`, `10.1.2.3 -> Peering (spoke) (BGP)`, `8.8.8.8 -> Pare-feu (UDR)`. Trois sources, une décision par destination : le trafic **interne** reste local (route système la plus spécifique), le trafic vers le **spoke** suit la route **BGP** apprise (`/16`), et l'**egress Internet** est **forcé** par le pare-feu (UDR). Ce sont les **routes effectives** — ce que le paquet suit **réellement**, toutes sources confondues. C'est **la** vue à consulter pour diagnostiquer un chemin.
:::

:::lang en
**✅ Check:** the effective routes give: `10.0.5.10 -> VNet local (Systeme)`, `10.1.2.3 -> Peering (spoke) (BGP)`, `8.8.8.8 -> Pare-feu (UDR)`. Three sources, one decision per destination: **internal** traffic stays local (most specific system route), traffic to the **spoke** follows the learned **BGP** route (`/16`), and **Internet egress** is **forced** through the firewall (UDR). These are the **effective routes** — what the packet **actually** follows, all sources combined. It's **the** view to check when diagnosing a path.
:::

### step-06

:::lang fr
**Objectif.** **Chaîner un service** via une **NVA** — et l'*IP forwarding*.

**🤔 Faire traverser une fonction réseau.** Une **appliance réseau virtuelle** (pare-feu tiers) inspecte le trafic **au milieu** du chemin. Pour router du trafic **qui ne lui est pas destiné**, elle a besoin de l'**IP forwarding**. On modélise le chaînage et la condition.

Modélise le chaînage de service :
:::

:::lang en
**Goal.** **Chain a service** through an **NVA** — and *IP forwarding*.

**🤔 Route through a network function.** A **network virtual appliance** (third-party firewall) inspects traffic **in the middle** of the path. To route traffic **not addressed to it**, it needs **IP forwarding**. We model the chaining and the condition.

Model the service chaining:
:::

```bash
cat > nva.py <<'PY'
# Chainage de service : le trafic passe PAR la NVA, qui le reemet.
# Condition : la NVA doit avoir l'IP forwarding active (router ce qui ne lui est pas destine).
def traverser_nva(ip_forwarding, dest):
    if not ip_forwarding:
        return f"{dest}: ❌ paquet ABANDONNE (IP forwarding desactive sur la NVA)"
    return f"{dest}: ✅ inspecte par la NVA puis reemis vers {dest}"

print("NVA sans IP forwarding :")
print(" ", traverser_nva(False, "8.8.8.8"))
print("NVA avec IP forwarding :")
print(" ", traverser_nva(True, "8.8.8.8"))
PY
python3 nva.py
```

:::lang fr
**✅ Vérification :** sans IP forwarding, `8.8.8.8: ❌ paquet ABANDONNE` — la NVA **jette** le trafic qui ne lui est pas destiné (comportement par défaut d'une carte réseau). Avec IP forwarding **activé**, `8.8.8.8: ✅ inspecte par la NVA puis reemis`. Le **chaînage de service** combine donc **deux** choses : (1) des **UDR** qui envoient le trafic **vers** la NVA (step-04), et (2) l'**IP forwarding** activé sur la NVA pour qu'elle **route** ce trafic. Oublier l'IP forwarding est **l'erreur classique** : le pare-feu reçoit le trafic mais le **jette**. Les deux ensemble = inspection en ligne.
:::

:::lang en
**✅ Check:** without IP forwarding, `8.8.8.8: ❌ paquet ABANDONNE` — the NVA **drops** traffic not addressed to it (a NIC's default behavior). With IP forwarding **enabled**, `8.8.8.8: ✅ inspecte par la NVA puis reemis`. So **service chaining** combines **two** things: (1) **UDRs** that send traffic **to** the NVA (step-04), and (2) **IP forwarding** enabled on the NVA so it **routes** that traffic. Forgetting IP forwarding is **the classic mistake**: the firewall receives traffic but **drops** it. Both together = inline inspection.
:::

### step-07

:::lang fr
**Objectif.** Assembler le **routage** et récapituler.

**🤔 Le routage, de bout en bout.** On récapitule la mécanique — routes système, sélection, UDR, tunneling forcé, routes effectives, chaînage — qui permet de **contrôler tous les chemins**.

Récapitule le routage :
:::

:::lang en
**Goal.** Assemble **routing** and recap.

**🤔 Routing, end to end.** We recap the mechanics — system routes, selection, UDR, forced tunneling, effective routes, chaining — that let you **control all paths**.

Recap routing:
:::

```bash
echo "=== Routage Azure (AZ-700) / Azure routing ==="
printf "%-22s %s\n" "Routes systeme"       "creees seules : VNet local, peering, Internet"
printf "%-22s %s\n" "Selection"            "prefixe LE PLUS LONG (le plus specifique gagne)"
printf "%-22s %s\n" "Priorite de source"   "UDR > BGP > Systeme (a prefixe egal)"
printf "%-22s %s\n" "UDR"                   "tes routes : prefixe + next hop (dans une route table)"
printf "%-22s %s\n" "Tunneling force"       "UDR 0.0.0.0/0 -> pare-feu (tout l'egress inspecte)"
printf "%-22s %s\n" "Chainage (NVA)"        "UDR vers la NVA + IP forwarding active"
echo "-> routes effectives = systeme + BGP + UDR : ce que le paquet suit vraiment."
```

:::lang fr
**✅ Vérification :** la table récapitule la **mécanique complète** du routage. Tu tiens le pilier **routage** de l'AZ-700 : comprendre les **routes système**, appliquer le **préfixe le plus long** et la **priorité de source**, écrire des **UDR**, forcer l'egress par un **pare-feu** (tunneling forcé), lire les **routes effectives** et **chaîner** une NVA. Tu **contrôles** désormais où va chaque paquet — pas seulement s'il passe (NSG, AZ-500), mais **par où**. La suite du track AZ-700 : la **connectivité hybride** (VPN, ExpressRoute, peering) puis la **distribution** applicative (équilibrage de charge).
:::

:::lang en
**✅ Check:** the table recaps routing's **full mechanics**. You hold the **routing** pillar of AZ-700: understanding **system routes**, applying **longest prefix** and **source priority**, writing **UDRs**, forcing egress through a **firewall** (forced tunneling), reading **effective routes** and **chaining** an NVA. You now **control** where each packet goes — not just whether it passes (NSG, AZ-500), but **which way**. Next in the AZ-700 track: **hybrid connectivity** (VPN, ExpressRoute, peering) then application **delivery** (load balancing).
:::

## pitfalls

:::lang fr
**1. Croire que les routes système suffisent.** Elles marchent mais tu ne les **contrôles pas**. Pour dévier (pare-feu, passerelle), il faut des **UDR**.

**2. Ignorer le préfixe le plus long.** Une route `/16` **l'emporte** sur `/0`. Une UDL `0.0.0.0/0` ne dévie **pas** le trafic interne (`/16` plus spécifique). C'est **voulu**.

**3. UDR sans IP forwarding sur la NVA.** Le trafic arrive à la NVA… qui le **jette** (pas de forwarding). Active l'**IP forwarding**.

**4. Tunneling forcé qui casse tout.** Rediriger `0.0.0.0/0` vers une appliance **injoignable** ou mal configurée coupe **tout** l'egress. Teste le chemin.

**5. Confondre routage et filtrage.** Le **routage** décide **où** va le paquet ; le **NSG** décide **s'il** passe. Deux mécanismes distincts, complémentaires.

**6. Oublier les routes effectives.** Pour diagnostiquer, regarde les **routes effectives** de la carte réseau (système + BGP + UDR combinés), pas juste la table de routes.

**7. Prochain saut `None` par erreur.** `nextHopType: None` **bloque** (trou noir) le préfixe. Utile pour bloquer, dangereux par accident.
:::

:::lang en
**1. Thinking system routes suffice.** They work but you don't **control** them. To divert (firewall, gateway), you need **UDRs**.

**2. Ignoring longest prefix.** A `/16` route **beats** `/0`. A `0.0.0.0/0` UDR does **not** divert internal traffic (`/16` more specific). That's **intended**.

**3. UDR without IP forwarding on the NVA.** Traffic reaches the NVA… which **drops** it (no forwarding). Enable **IP forwarding**.

**4. Forced tunneling that breaks everything.** Redirecting `0.0.0.0/0` to an **unreachable** or misconfigured appliance cuts **all** egress. Test the path.

**5. Confusing routing and filtering.** **Routing** decides **where** the packet goes; the **NSG** decides **whether** it passes. Two distinct, complementary mechanisms.

**6. Forgetting effective routes.** To diagnose, look at the NIC's **effective routes** (system + BGP + UDR combined), not just the route table.

**7. Next hop `None` by mistake.** `nextHopType: None` **blocks** (black hole) the prefix. Useful to block, dangerous by accident.
:::

## success

:::lang fr
Tu as réussi si :

- Tu expliques les **routes système** par défaut.
- Tu appliques le **préfixe le plus long** et la **priorité de source** (UDR > BGP > système).
- Tu écris une **UDR** (table de routes) et la **valides** en Bicep.
- Tu mets en place le **tunneling forcé** (`0.0.0.0/0` → pare-feu) **sans** casser le trafic interne.
- Tu lis les **routes effectives** (trois sources combinées).
- Tu **chaînes** une NVA en activant l'**IP forwarding**.
:::

:::lang en
You've succeeded if:

- You explain the default **system routes**.
- You apply **longest prefix** and **source priority** (UDR > BGP > system).
- You write a **UDR** (route table) and **validate** it in Bicep.
- You set up **forced tunneling** (`0.0.0.0/0` → firewall) **without** breaking internal traffic.
- You read the **effective routes** (three sources combined).
- You **chain** an NVA by enabling **IP forwarding**.
:::

## next

:::lang fr
- **Suivant :** *Azure — connectivité hybride (AZ-700)* — VPN, ExpressRoute, peering de VNets.
- **Réviser :** *Azure — réseau fondamentaux (AZ-700)* pour l'adressage.
- **S'entraîner :** ajoute une UDR `None` (trou noir) sur un préfixe et observe l'effet dans le moteur ; ajoute une route BGP plus spécifique qu'une UDR.
:::

:::lang en
- **Next:** *Azure — hybrid connectivity (AZ-700)* — VPN, ExpressRoute, VNet peering.
- **Review:** *Azure — network fundamentals (AZ-700)* for addressing.
- **Practice:** add a `None` UDR (black hole) on a prefix and observe the engine's effect; add a BGP route more specific than a UDR.
:::

## cheatsheet

:::lang fr
**La sélection de route (dans l'ordre)**

```text
1. Garder les routes qui MATCHENT la destination
2. Choisir le PREFIXE LE PLUS LONG (le plus specifique)
3. A prefixe egal : UDR > BGP > Systeme (priorite de source)
-> routes effectives = systeme + BGP + UDR combinees
```

**Types de prochain saut (UDR)**

```text
Internet               sortie directe
VirtualNetworkGateway  vers une passerelle VPN/ExpressRoute
VirtualAppliance       vers une NVA (avec next_hop_in_ip_address)
VnetLocal              dans le VNet
None                   bloquer (trou noir)
```

**UDR en Bicep**

```text
Microsoft.Network/routeTables : routes[] { addressPrefix, nextHopType, nextHopIpAddress }
bicep build rt.bicep --stdout        # valider la table
```

**Tunneling force & NVA**

```text
UDR 0.0.0.0/0 -> VirtualAppliance (pare-feu)  = tout l'egress inspecte
NVA : IP forwarding OBLIGATOIRE (router ce qui ne lui est pas destine)
```
:::

:::lang en
**Route selection (in order)**

```text
1. Keep the routes that MATCH the destination
2. Pick the LONGEST PREFIX (most specific)
3. At equal prefix: UDR > BGP > System (source priority)
-> effective routes = system + BGP + UDR combined
```

**Next-hop types (UDR)**

```text
Internet               direct egress
VirtualNetworkGateway  to a VPN/ExpressRoute gateway
VirtualAppliance       to an NVA (with next_hop_in_ip_address)
VnetLocal              inside the VNet
None                   block (black hole)
```

**UDR in Bicep**

```text
Microsoft.Network/routeTables: routes[] { addressPrefix, nextHopType, nextHopIpAddress }
bicep build rt.bicep --stdout        # validate the table
```

**Forced tunneling & NVA**

```text
UDR 0.0.0.0/0 -> VirtualAppliance (firewall)  = all egress inspected
NVA: IP forwarding MANDATORY (route traffic not addressed to it)
```
:::

## resources

:::lang fr
- **Routage Azure** : routes système, UDR, sélection, routes effectives — Microsoft Learn.
- **Tables de routes (UDR)** : préfixes, types de prochain saut — Microsoft Learn.
- **Tunneling forcé** : forcer l'egress par une appliance/passerelle — Microsoft Learn (AZ-700).
- **Appliances réseau virtuelles (NVA)** : IP forwarding, service chaining — Microsoft Learn.
- **BGP dans Azure** : routes apprises via VPN/ExpressRoute — Microsoft Learn.
- **Bicep** : `Microsoft.Network/routeTables` — Microsoft Learn.
:::

:::lang en
- **Azure routing**: system routes, UDR, selection, effective routes — Microsoft Learn.
- **Route tables (UDR)**: prefixes, next-hop types — Microsoft Learn.
- **Forced tunneling**: forcing egress through an appliance/gateway — Microsoft Learn (AZ-700).
- **Network virtual appliances (NVA)**: IP forwarding, service chaining — Microsoft Learn.
- **BGP in Azure**: routes learned via VPN/ExpressRoute — Microsoft Learn.
- **Bicep**: `Microsoft.Network/routeTables` — Microsoft Learn.
:::

## troubleshooting

:::lang fr
**`bicep : command not found` (step-03).** `az bicep install`, ou installe le binaire autonome (releases GitHub `Azure/bicep`).

**Le moteur choisit une route inattendue.** Rappelle la règle : **préfixe le plus long d'abord**, puis **priorité de source**. Une route `/16` bat une `/0` même si cette dernière est une UDR — c'est **normal** (la spécificité prime sur la source).

**Ma UDR `0.0.0.0/0` ne dévie pas le trafic interne.** C'est **voulu** : la route système `10.0.0.0/16` (VNet local) est **plus spécifique** que le `/0`. Le tunneling forcé ne concerne que l'**egress** (Internet), pas le trafic **intra-VNet**.

**Le trafic arrive à la NVA mais « disparaît ».** L'**IP forwarding** n'est pas activé sur la NVA : elle jette ce qui ne lui est pas destiné. Active-le (step-06).

**Les tables de routes ne se déploient pas en local.** miniblue ne les émule pas. On **valide** en **Bicep** (`bicep build`) et on **raisonne** la logique avec le moteur ; l'exécution vise du vrai Azure.

**`ipaddress` : `has host bits set`.** Utilise l'**adresse réseau** d'un préfixe (`10.0.0.0/16`, pas `10.0.5.0/16`) ou `strict=False`.
:::

:::lang en
**`bicep: command not found` (step-03).** `az bicep install`, or install the standalone binary (GitHub `Azure/bicep` releases).

**The engine picks an unexpected route.** Recall the rule: **longest prefix first**, then **source priority**. A `/16` route beats a `/0` even if the latter is a UDR — that's **normal** (specificity trumps source).

**My `0.0.0.0/0` UDR doesn't divert internal traffic.** That's **intended**: the system route `10.0.0.0/16` (local VNet) is **more specific** than the `/0`. Forced tunneling only concerns **egress** (Internet), not **intra-VNet** traffic.

**Traffic reaches the NVA but "disappears".** **IP forwarding** isn't enabled on the NVA: it drops what's not addressed to it. Enable it (step-06).

**Route tables won't deploy locally.** miniblue doesn't emulate them. We **validate** in **Bicep** (`bicep build`) and **reason** about the logic with the engine; execution targets real Azure.

**`ipaddress`: `has host bits set`.** Use a prefix's **network address** (`10.0.0.0/16`, not `10.0.5.0/16`) or `strict=False`.
:::
