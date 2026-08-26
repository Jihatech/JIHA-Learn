---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-reseau-acces-prive
slug: azure-reseau-acces-prive
order: 86
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — accès privé aux services (AZ-700) : Private Endpoint, Private Link"
title_en: "Azure — private access to services (AZ-700): Private Endpoint, Private Link"
tagline_fr: "sortir le PaaS d'Internet — IP privée, coupe l'accès public, DNS privé."
tagline_en: "take PaaS off the Internet — private IP, cut public access, private DNS."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 250
repo: "Azure/bicep"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-reseau-distribution]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [acces-prive, point-terminaison-prive, private-link, point-terminaison-de-service, dns-privatelink, coupe-acces-public, az-700]
concepts_en: [private-access, private-endpoint, private-link, service-endpoint, privatelink-dns, cut-public-access, az-700]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Rendre le PaaS privé pour l'AZ-700, en local et pour de vrai : le problème de l'exposition publique (checkov le signale), les points de terminaison de service (identité du VNet étendue au PaaS) vs les points de terminaison privés (IP privée dans ton VNet via Private Link, écrit et validé en Bicep), l'intégration DNS privatelink obligatoire (zone privée + enregistrement, azlocal live), un moteur de décision service endpoint vs private endpoint, et la fermeture de l'accès public (checkov au vert). Sans compte cloud.",
og_description_en: "Making PaaS private for AZ-700, locally and for real: the public-exposure problem (checkov flags it), service endpoints (VNet identity extended to PaaS) vs private endpoints (a private IP in your VNet via Private Link, written and validated in Bicep), the mandatory privatelink DNS integration (private zone + record, azlocal live), a service-endpoint vs private-endpoint decision engine, and closing public access (checkov green). No cloud account."
---

## intro

:::lang fr
Par défaut, un service **PaaS** (stockage, base, Key Vault) a un **point d'accès public** — joignable depuis **Internet**. Pour des données sensibles, c'est une **surface d'attaque** inutile. L'**AZ-700** attend que tu saches **retirer le PaaS d'Internet** : le rendre joignable **uniquement depuis ton réseau**, via des **points de terminaison privés** et **Private Link**.

Fidèle à la méthode, on pratique **en local et pour de vrai** : on **constate l'exposition** publique (checkov la signale), on distingue **points de terminaison de service** (identité du VNet étendue au PaaS) et **points de terminaison privés** (une **IP privée** dans ton VNet via **Private Link**, écrit et **validé** en Bicep), on met en place l'**intégration DNS privatelink** **obligatoire** (zone privée + enregistrement, **live** sur miniblue), on **choisit** entre les deux avec un **moteur de décision**, et on **ferme l'accès public** (checkov au vert).

**Pour qui c'est :** tu maîtrises le réseau AZ-700 (guides précédents) et tu veux **privatiser** l'accès au PaaS.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas les fondations réseau/DNS → fais *Azure — réseau fondamentaux (AZ-700)*.
- Tu cherches le durcissement **données** (chiffrement) → c'est l'**AZ-500** ; ici c'est l'**accès réseau** privé.
:::

:::lang en
By default, a **PaaS** service (storage, database, Key Vault) has a **public endpoint** — reachable from **the Internet**. For sensitive data, that's a needless **attack surface**. **AZ-700** expects you to **take PaaS off the Internet**: make it reachable **only from your network**, via **private endpoints** and **Private Link**.

True to the method, we practice **locally and for real**: we **observe the public** exposure (checkov flags it), we distinguish **service endpoints** (VNet identity extended to PaaS) and **private endpoints** (a **private IP** in your VNet via **Private Link**, written and **validated** in Bicep), we set up the **mandatory** privatelink **DNS integration** (private zone + record, **live** on miniblue), we **choose** between the two with a **decision engine**, and we **close public access** (checkov green).

**Who it's for:** you master AZ-700 networking (previous guides) and want to **privatize** PaaS access.

**When it's NOT the right choice:**

- You lack the network/DNS foundations → do *Azure — network fundamentals (AZ-700)*.
- You want **data** hardening (encryption) → that's **AZ-500**; here it's private **network access**.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- **Constater** l'exposition publique d'un PaaS (avec un garde-fou).
- Distinguer **point de terminaison de service** et **point de terminaison privé**.
- Écrire un **point de terminaison privé** et le **valider** en Bicep.
- Mettre en place l'**intégration DNS privatelink** (zone privée + enregistrement).
- **Choisir** entre service endpoint et private endpoint selon le besoin.
- **Fermer l'accès public** (`public_network_access = Disabled`) et le **valider**.
- Comprendre le rôle de **Private Link**.
:::

:::lang en
By the end of this guide, you can:

- **Observe** a PaaS's public exposure (with a guardrail).
- Distinguish a **service endpoint** and a **private endpoint**.
- Write a **private endpoint** and **validate** it in Bicep.
- Set up the **privatelink DNS integration** (private zone + record).
- **Choose** between service endpoint and private endpoint by need.
- **Close public access** (`public_network_access = Disabled`) and **validate** it.
- Understand the role of **Private Link**.
:::

## prerequisites

:::lang fr
- Les guides **Azure — réseau fondamentaux / routage (AZ-700)** (VNet, DNS privé).
- Le **lab local** : **miniblue** démarré (DNS live), `azlocal` sur le `PATH`, **Bicep CLI**, **Python 3**, `pip install checkov`.
- **Aucun compte cloud** : DNS privatelink live, point de terminaison privé validé en Bicep.
:::

:::lang en
- The **Azure — network fundamentals / routing (AZ-700)** guides (VNet, private DNS).
- The **local lab**: **miniblue** started (DNS live), `azlocal` on `PATH`, **Bicep CLI**, **Python 3**, `pip install checkov`.
- **No cloud account**: privatelink DNS live, private endpoint validated in Bicep.
:::

## concepts

:::lang fr
**Le problème : le PaaS public.** Un compte de stockage, une base, un coffre : par défaut, chacun expose un **point d'accès public** (un nom DNS public, une IP publique). Même protégé par un mot de passe ou un pare-feu, il **reste joignable** depuis Internet — donc **attaquable** (force brute, fuite de clé, faille). Pour les données sensibles, on veut le **sortir d'Internet**.

**Les points de terminaison de service (Service Endpoints).** Première approche : **étendre l'identité du VNet** au service PaaS. Le PaaS n'accepte alors le trafic **que** depuis les sous-réseaux autorisés, via le **backbone Azure** (pas l'Internet public). Simple à activer. Limite : le service **garde son IP publique** (l'accès est **restreint**, pas rendu **privé**) ; ça ne couvre pas l'accès **depuis l'on-prem**.

**Les points de terminaison privés (Private Endpoints).** Approche plus forte : donner au PaaS une **interface réseau avec une IP privée** **dans ton VNet**. Le service devient une **ressource de ton réseau** : on le joint par son **IP privée**, et on peut **couper totalement** l'accès public. C'est **Private Link** : une connexion **privée** entre ton VNet et le service, sans passer par Internet. Ça marche aussi **depuis l'on-prem** (via VPN/ExpressRoute).

**L'intégration DNS : obligatoire.** Un point de terminaison privé donne une **IP privée** — mais le nom DNS **public** du service (`monstockage.blob.core.windows.net`) pointe encore vers l'**IP publique**. Il faut donc une **zone DNS privée** spéciale (`privatelink.blob.core.windows.net`) qui **résout le nom vers l'IP privée** du point de terminaison. **Sans cette intégration DNS, le point de terminaison privé ne sert à rien** : les clients continuent d'aller vers l'IP publique. C'est **l'** erreur classique.

**Service endpoint ou private endpoint ?** **Service endpoint** : rapide, gratuit, restreint l'accès à tes sous-réseaux (mais IP publique conservée, pas d'on-prem). **Private endpoint** : IP privée dans le VNet, accès public **coupable**, marche depuis l'on-prem, mais coûte (par endpoint) et demande la **config DNS**. Pour du **vraiment privé** (données sensibles, conformité), c'est le **private endpoint**.

**Fermer l'accès public.** Le point de terminaison privé n'a de sens que si on **coupe** l'accès public : `public_network_access = Disabled`. Ainsi, le service n'est joignable **que** par son IP privée. Un scan de sécurité (checkov, `CKV_AZURE_59`) **exige** cette fermeture.

**Ce qui est live ici.** La **zone DNS privatelink** et son **enregistrement** se **créent** sur miniblue (azlocal, live) — c'est le cœur de l'intégration DNS. Le **point de terminaison privé** s'écrit et se **compile en ARM** avec **Bicep** (validation ; miniblue ne l'émule pas). L'**exposition publique** se **détecte** avec **checkov** (offline). Le **choix** service/private endpoint est un **moteur exécutable**. Tout sans compte cloud.
:::

:::lang en
**The problem: public PaaS.** A storage account, a database, a vault: by default, each exposes a **public endpoint** (a public DNS name, a public IP). Even protected by a password or firewall, it **stays reachable** from the Internet — thus **attackable** (brute force, key leak, flaw). For sensitive data, we want to **take it off the Internet**.

**Service endpoints.** First approach: **extend the VNet's identity** to the PaaS service. The PaaS then accepts traffic **only** from authorized subnets, via the **Azure backbone** (not the public Internet). Simple to enable. Limit: the service **keeps its public IP** (access is **restricted**, not made **private**); it doesn't cover access **from on-prem**.

**Private endpoints.** A stronger approach: give the PaaS a **network interface with a private IP** **in your VNet**. The service becomes a **resource of your network**: you reach it by its **private IP**, and you can **fully cut** public access. That's **Private Link**: a **private** connection between your VNet and the service, without going through the Internet. It also works **from on-prem** (via VPN/ExpressRoute).

**DNS integration: mandatory.** A private endpoint gives a **private IP** — but the service's **public** DNS name (`mystorage.blob.core.windows.net`) still points to the **public IP**. You therefore need a special **private DNS zone** (`privatelink.blob.core.windows.net`) that **resolves the name to the endpoint's private IP**. **Without this DNS integration, the private endpoint is useless**: clients keep going to the public IP. That's **the** classic mistake.

**Service endpoint or private endpoint?** **Service endpoint**: fast, free, restricts access to your subnets (but keeps public IP, no on-prem). **Private endpoint**: private IP in the VNet, public access **can be cut**, works from on-prem, but costs (per endpoint) and requires **DNS config**. For **truly private** (sensitive data, compliance), it's the **private endpoint**.

**Closing public access.** The private endpoint only makes sense if you **cut** public access: `public_network_access = Disabled`. Then the service is reachable **only** by its private IP. A security scan (checkov, `CKV_AZURE_59`) **requires** this closure.

**What's live here.** The **privatelink DNS zone** and its **record** are **created** on miniblue (azlocal, live) — the heart of the DNS integration. The **private endpoint** is written and **compiled to ARM** with **Bicep** (validation; miniblue doesn't emulate it). The **public exposure** is **detected** with **checkov** (offline). The service/private endpoint **choice** is a **runnable engine**. All without a cloud account.
:::

:::figure azure-reseau-acces-prive-privatelink
caption_fr: "Schéma 1. L'accès privé au PaaS : un service public (IP publique, joignable d'Internet) devient PRIVÉ via un POINT DE TERMINAISON PRIVÉ — une carte réseau avec une IP PRIVÉE dans ton VNet (Private Link). La ZONE DNS privatelink résout le nom public vers l'IP privée (intégration OBLIGATOIRE). On COUPE l'accès public (public access = Disabled). Alternative plus légère : le POINT DE TERMINAISON DE SERVICE (identité du VNet étendue, IP publique conservée)."
caption_en: "Figure 1. Private access to PaaS: a public service (public IP, reachable from the Internet) becomes PRIVATE via a PRIVATE ENDPOINT — a NIC with a PRIVATE IP in your VNet (Private Link). The privatelink DNS ZONE resolves the public name to the private IP (MANDATORY integration). We CUT public access (public access = Disabled). Lighter alternative: the SERVICE ENDPOINT (VNet identity extended, public IP kept)."
:::

## walkthrough

:::lang fr
On avance ainsi : constater l'exposition publique → points de terminaison de service → point de terminaison privé (Bicep) → intégration DNS privatelink → choisir service/private → fermer l'accès public → accès privé assemblé.
:::

:::lang en
We'll go like this: observe the public exposure → service endpoints → private endpoint (Bicep) → privatelink DNS integration → choose service/private → close public access → private access assembled.
:::

### step-01

:::lang fr
**Objectif.** **Constater** l'exposition publique d'un PaaS.

**🤔 Le PaaS est public par défaut.** Un stockage à accès public est joignable d'Internet. On l'écrit et on lance un **garde-fou** qui **signale** l'exposition.

Écris un stockage exposé et scanne-le :
:::

:::lang en
**Goal.** **Observe** a PaaS's public exposure.

**🤔 PaaS is public by default.** A public-access storage is reachable from the Internet. We write one and run a **guardrail** that **flags** the exposure.

Write an exposed storage and scan it:
:::

```bash
mkdir -p acces-prive/infra && cd acces-prive
cat > infra/main.tf <<'TF'
resource "azurerm_storage_account" "public" {
  name                          = "stpublic001"
  resource_group_name           = "rg-x"
  location                      = "westeurope"
  account_tier                  = "Standard"
  account_replication_type      = "LRS"
  public_network_access_enabled = true   # DANGER : joignable depuis Internet
}
TF

checkov -d infra --compact --quiet 2>/dev/null | grep -E "CKV_AZURE_59|Failed checks" | head -3
```

:::lang fr
**✅ Vérification :** checkov signale l'exposition : `CKV_AZURE_59` (« Ensure that Storage accounts disallow public access ») et un `Failed checks: ≥ 1`. Ce stockage est **joignable depuis Internet** — même avec des clés, c'est une **surface d'attaque**. Le garde-fou le **détecte**. La bonne réponse : le rendre **privé**. Deux options — service endpoint (léger) ou private endpoint (fort) — qu'on découvre maintenant.
:::

:::lang en
**✅ Check:** checkov flags the exposure: `CKV_AZURE_59` ("Ensure that Storage accounts disallow public access") and a `Failed checks: ≥ 1`. This storage is **reachable from the Internet** — even with keys, it's an **attack surface**. The guardrail **detects** it. The right answer: make it **private**. Two options — service endpoint (light) or private endpoint (strong) — which we discover now.
:::

### step-02

:::lang fr
**Objectif.** Comprendre les **points de terminaison de service** — restreindre au VNet.

**🤔 Étendre l'identité du VNet.** Un **service endpoint** dit au PaaS : « n'accepte le trafic **que** depuis ces sous-réseaux ». Le trafic passe par le **backbone Azure**, pas l'Internet public. Simple, mais le service **garde son IP publique**. On modélise la restriction.

Modélise le service endpoint :
:::

:::lang en
**Goal.** Understand **service endpoints** — restrict to the VNet.

**🤔 Extend the VNet's identity.** A **service endpoint** tells the PaaS: "only accept traffic **from** these subnets". Traffic goes over the **Azure backbone**, not the public Internet. Simple, but the service **keeps its public IP**. We model the restriction.

Model the service endpoint:
:::

```bash
cat > service_endpoint.py <<'PY'
# Service endpoint : le PaaS n'accepte QUE les sous-reseaux autorises (backbone Azure)
SOUS_RESEAUX_AUTORISES = {"snet-app", "snet-web"}
def accepte(source_subnet):
    return source_subnet in SOUS_RESEAUX_AUTORISES

for src in ["snet-app", "snet-web", "snet-inconnu", "internet"]:
    print(f"acces depuis {src:14} -> {'AUTORISE (backbone Azure)' if accepte(src) else 'REFUSE'}")
print("-> Note : le PaaS garde son IP PUBLIQUE ; l'acces est RESTREINT, pas rendu prive.")
PY
python3 service_endpoint.py
```

:::lang fr
**✅ Vérification :** la sortie montre que `snet-app` et `snet-web` sont **AUTORISE (backbone Azure)**, mais `snet-inconnu` et `internet` sont **REFUSE**. Le **service endpoint** restreint l'accès au PaaS **à tes sous-réseaux** — c'est mieux qu'un accès ouvert. **Mais** : le service **garde son IP publique** (l'accès est **restreint**, pas **privé**), et ça ne couvre **pas** l'accès depuis l'**on-prem**. Pour un accès **vraiment privé**, il faut le **point de terminaison privé**.
:::

:::lang en
**✅ Check:** the output shows `snet-app` and `snet-web` are **AUTORISE (backbone Azure)**, but `snet-inconnu` and `internet` are **REFUSE**. The **service endpoint** restricts PaaS access **to your subnets** — better than open access. **But**: the service **keeps its public IP** (access is **restricted**, not **private**), and it doesn't cover access from **on-prem**. For **truly private** access, you need the **private endpoint**.
:::

### step-03

:::lang fr
**Objectif.** Écrire un **point de terminaison privé** et le **valider** en Bicep.

**🤔 Une IP privée dans ton VNet.** Le **private endpoint** donne au PaaS une **carte réseau** avec une **IP privée** dans ton sous-réseau, via **Private Link**. On l'écrit en Bicep (connexion au stockage, groupe `blob`) et on le **compile**.

Écris le point de terminaison privé et valide-le :
:::

:::lang en
**Goal.** Write a **private endpoint** and **validate** it in Bicep.

**🤔 A private IP in your VNet.** The **private endpoint** gives the PaaS a **NIC** with a **private IP** in your subnet, via **Private Link**. We write it in Bicep (connection to the storage, `blob` group) and **compile** it.

Write the private endpoint and validate it:
:::

```bash
cat > pe.bicep <<'BICEP'
param location string = resourceGroup().location

resource pe 'Microsoft.Network/privateEndpoints@2023-05-01' = {
  name: 'pe-stockage'
  location: location
  properties: {
    subnet: {
      id: resourceId('Microsoft.Network/virtualNetworks/subnets', 'vnet-hub', 'snet-data')
    }
    privateLinkServiceConnections: [
      {
        name: 'vers-stockage'
        properties: {
          privateLinkServiceId: resourceId('Microsoft.Storage/storageAccounts', 'monstockage')
          groupIds: [ 'blob' ]   // le sous-service cible (blob, file, table...)
        }
      }
    ]
  }
}
BICEP

bicep build pe.bicep --stdout 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('private endpoint -> ARM OK, ressource:', d['resources'][0]['type'])"
```

:::lang fr
**✅ Vérification :** la sortie affiche `private endpoint -> ARM OK, ressource: Microsoft.Network/privateEndpoints`. Le point de terminaison est **valide** : il connecte le stockage `monstockage` (sous-service **`blob`**) à ton sous-réseau **`snet-data`**, via **Private Link**. Une fois déployé (en vrai Azure), le stockage a une **IP privée** dans ton VNet — il devient une **ressource de ton réseau**, joignable **sans passer par Internet**, et **depuis l'on-prem** aussi. ⚠️ miniblue ne l'exécute pas : on le **valide** en Bicep. Mais il manque **l'** élément crucial : la **résolution DNS**.
:::

:::lang en
**✅ Check:** the output shows `private endpoint -> ARM OK, ressource: Microsoft.Network/privateEndpoints`. The endpoint is **valid**: it connects the `monstockage` storage (sub-service **`blob`**) to your **`snet-data`** subnet, via **Private Link**. Once deployed (in real Azure), the storage has a **private IP** in your VNet — it becomes a **resource of your network**, reachable **without going through the Internet**, and **from on-prem** too. ⚠️ miniblue doesn't execute it: we **validate** it in Bicep. But **the** crucial element is missing: **DNS resolution**.
:::

### step-04

:::lang fr
**Objectif.** Mettre en place l'**intégration DNS privatelink** — obligatoire.

**🤔 Sans DNS, le point de terminaison privé est inutile.** Le nom public du stockage pointe encore vers l'**IP publique**. Il faut une **zone DNS privée** `privatelink.blob.core.windows.net` qui résout le nom vers l'**IP privée** du point de terminaison. On la crée **pour de vrai** sur miniblue.

Crée la zone DNS privatelink et l'enregistrement :
:::

:::lang en
**Goal.** Set up the **privatelink DNS integration** — mandatory.

**🤔 Without DNS, the private endpoint is useless.** The storage's public name still points to the **public IP**. You need a **private DNS zone** `privatelink.blob.core.windows.net` that resolves the name to the endpoint's **private IP**. We create it **for real** on miniblue.

Create the privatelink DNS zone and record:
:::

```bash
azlocal group create --name rg-acces-prive --location westeurope >/dev/null 2>&1

# Zone DNS privee speciale "privatelink" / special "privatelink" private DNS zone
azlocal dns zone create --resource-group rg-acces-prive --name privatelink.blob.core.windows.net 2>/dev/null \
  | python3 -c "import sys,json; print('zone privatelink creee:', json.load(sys.stdin)['name'])"

# Enregistrement : le nom du stockage -> l'IP PRIVEE du point de terminaison
azlocal dns record create --resource-group rg-acces-prive --zone privatelink.blob.core.windows.net --name monstockage --type A --value 10.0.3.10 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('resolution:', d['name'], '-> 10.0.3.10 (IP privee du point de terminaison)')"
```

:::lang fr
**✅ Vérification :** la sortie confirme `zone privatelink creee: privatelink.blob.core.windows.net` et `resolution: monstockage -> 10.0.3.10 (IP privee du point de terminaison)`. C'est **l'** élément qui fait tout fonctionner : quand un client résout `monstockage.blob.core.windows.net`, la zone **privatelink** répond avec l'**IP privée** (`10.0.3.10`) au lieu de l'IP publique. Le trafic va donc au **point de terminaison privé**, **dans ton VNet**. ⚠️ **Oublier cette intégration DNS est l'erreur n°1** : le point de terminaison existe, mais les clients continuent d'aller vers l'IP publique. Zone + enregistrement + liaison au VNet = accès privé **effectif**.
:::

:::lang en
**✅ Check:** the output confirms `zone privatelink creee: privatelink.blob.core.windows.net` and `resolution: monstockage -> 10.0.3.10 (IP privee du point de terminaison)`. This is **the** element that makes it all work: when a client resolves `monstockage.blob.core.windows.net`, the **privatelink** zone answers with the **private IP** (`10.0.3.10`) instead of the public IP. Traffic thus goes to the **private endpoint**, **in your VNet**. ⚠️ **Forgetting this DNS integration is mistake #1**: the endpoint exists, but clients keep going to the public IP. Zone + record + VNet link = **effective** private access.
:::

### step-05

:::lang fr
**Objectif.** **Choisir** entre service endpoint et private endpoint.

**🤔 Léger ou fort ?** Service endpoint : rapide, gratuit, restreint (mais IP publique, pas d'on-prem). Private endpoint : IP privée, accès public coupable, on-prem, mais coûte + DNS. On écrit un **moteur de décision**.

Écris le moteur de décision et teste-le :
:::

:::lang en
**Goal.** **Choose** between service endpoint and private endpoint.

**🤔 Light or strong?** Service endpoint: fast, free, restricted (but public IP, no on-prem). Private endpoint: private IP, public access can be cut, on-prem, but costs + DNS. We write a **decision engine**.

Write the decision engine and test it:
:::

```bash
cat > acces.py <<'PY'
def choisir(b):
    if b["ip_privee_dans_vnet"] or b["depuis_on_prem"] or b["couper_public"]:
        return "Private Endpoint", "IP privee dans le VNet (Private Link), coupe l'acces public, marche depuis l'on-prem"
    if b["restreindre_aux_sous_reseaux"]:
        return "Service Endpoint", "restreint aux sous-reseaux (IP publique conservee), rapide/gratuit"
    return "Acces public (a eviter)", "exposition Internet"

cas = [
    {"nom":"donnees sensibles, zero Internet","ip_privee_dans_vnet":True, "depuis_on_prem":False,"couper_public":True, "restreindre_aux_sous_reseaux":False},
    {"nom":"acces aussi depuis l'on-prem",     "ip_privee_dans_vnet":False,"depuis_on_prem":True, "couper_public":False,"restreindre_aux_sous_reseaux":False},
    {"nom":"juste restreindre a mes subnets",  "ip_privee_dans_vnet":False,"depuis_on_prem":False,"couper_public":False,"restreindre_aux_sous_reseaux":True},
]
for c in cas:
    sol, pourquoi = choisir(c)
    print(f"{c['nom']:30} -> {sol:18} ({pourquoi})")
PY
python3 acces.py
```

:::lang fr
**✅ Vérification :** le moteur recommande : `donnees sensibles, zero Internet -> Private Endpoint`, `acces aussi depuis l'on-prem -> Private Endpoint`, `juste restreindre a mes subnets -> Service Endpoint`. La règle : dès qu'il faut une **IP privée**, **couper l'accès public**, ou **atteindre depuis l'on-prem** → **private endpoint**. Si on veut juste **restreindre** l'accès à ses sous-réseaux (sans supprimer l'IP publique) → **service endpoint** (léger). Pour la plupart des données **sensibles**, c'est le **private endpoint** + fermeture publique. On finit par cette **fermeture**.
:::

:::lang en
**✅ Check:** the engine recommends: `donnees sensibles, zero Internet -> Private Endpoint`, `acces aussi depuis l'on-prem -> Private Endpoint`, `juste restreindre a mes subnets -> Service Endpoint`. The rule: as soon as you need a **private IP**, to **cut public access**, or to **reach from on-prem** → **private endpoint**. If you just want to **restrict** access to your subnets (without removing the public IP) → **service endpoint** (light). For most **sensitive** data, it's the **private endpoint** + public closure. We finish with that **closure**.
:::

### step-06

:::lang fr
**Objectif.** **Fermer l'accès public** et le **valider**.

**🤔 Le point de terminaison privé sans fermeture ne suffit pas.** Tant que l'accès public reste **ouvert**, le service est **encore** joignable d'Internet. On le **ferme** (`public_network_access = Disabled`) et on **vérifie** que le scan passe au vert.

Ferme l'accès public et re-scanne :
:::

:::lang en
**Goal.** **Close public access** and **validate** it.

**🤔 A private endpoint without closure isn't enough.** As long as public access stays **open**, the service is **still** reachable from the Internet. We **close** it (`public_network_access = Disabled`) and **check** the scan goes green.

Close public access and re-scan:
:::

```bash
cat > infra/main.tf <<'TF'
resource "azurerm_storage_account" "prive" {
  name                          = "stprive001"
  resource_group_name           = "rg-x"
  location                      = "westeurope"
  account_tier                  = "Standard"
  account_replication_type      = "LRS"
  public_network_access_enabled = false   # accès public FERME (joignable seulement par le point de terminaison prive)
}
TF

checkov -d infra --check CKV_AZURE_59 --compact --quiet 2>/dev/null | grep -E "Passed checks|Failed checks"
```

:::lang fr
**✅ Vérification :** checkov affiche `Passed checks: 1, Failed checks: 0` sur `CKV_AZURE_59` — l'accès public est **fermé**. Le service n'est désormais joignable **que** par son **point de terminaison privé** (IP privée dans ton VNet), avec la **résolution DNS privatelink** (step-04). La boucle est complète : **IP privée** (private endpoint) + **DNS privé** (privatelink) + **accès public coupé** = le PaaS est **hors d'Internet**, joignable **uniquement** depuis ton réseau. C'est la **surface d'attaque minimale** pour les données. On récapitule.
:::

:::lang en
**✅ Check:** checkov shows `Passed checks: 1, Failed checks: 0` on `CKV_AZURE_59` — public access is **closed**. The service is now reachable **only** by its **private endpoint** (private IP in your VNet), with the **privatelink DNS resolution** (step-04). The loop is complete: **private IP** (private endpoint) + **private DNS** (privatelink) + **public access cut** = the PaaS is **off the Internet**, reachable **only** from your network. That's the **minimal attack surface** for data. Let's recap.
:::

### step-07

:::lang fr
**Objectif.** Assembler l'**accès privé** et récapituler.

**🤔 Le PaaS privé, de bout en bout.** On récapitule les trois briques indissociables — point de terminaison privé, DNS privatelink, fermeture publique — puis on nettoie.

Récapitule l'accès privé et nettoie :
:::

:::lang en
**Goal.** Assemble **private access** and recap.

**🤔 Private PaaS, end to end.** We recap the three inseparable pieces — private endpoint, privatelink DNS, public closure — then clean up.

Recap private access and clean up:
:::

```bash
echo "=== Acces prive au PaaS (AZ-700) / private PaaS access ==="
printf "%-24s %s\n" "Service Endpoint"     "restreint aux sous-reseaux (IP publique conservee)"
printf "%-24s %s\n" "Private Endpoint"     "IP privee dans le VNet (Private Link), on-prem OK"
printf "%-24s %s\n" "DNS privatelink"      "OBLIGATOIRE : resout le nom -> IP privee"
printf "%-24s %s\n" "Fermer l'acces public" "public_network_access = Disabled"
echo "-> Les 3 ensemble (private endpoint + DNS + fermeture) = PaaS hors d'Internet."

# Nettoyer le lab / clean up
azlocal group delete --name rg-acces-prive >/dev/null 2>&1 && echo "rg-acces-prive supprime / deleted"
```

:::lang fr
**✅ Vérification :** la table récapitule les briques de l'accès privé, puis `rg-acces-prive supprime` nettoie le lab. Tu tiens le pilier **accès privé** de l'AZ-700 : distinguer **service endpoint** (léger, restreint) et **private endpoint** (fort, IP privée), écrire le point de terminaison (**Bicep**), mettre en place l'**intégration DNS privatelink** (l'élément **obligatoire**, trop souvent oublié) et **fermer l'accès public**. Ton PaaS n'est plus sur Internet : il est **privé**, joignable uniquement depuis ton réseau. Tu as désormais tous les piliers réseau AZ-700 — il ne reste que le **projet de synthèse** pour l'emballage CV.
:::

:::lang en
**✅ Check:** the table recaps the private-access pieces, then `rg-acces-prive supprime` cleans the lab. You hold the **private access** pillar of AZ-700: distinguishing **service endpoint** (light, restricted) and **private endpoint** (strong, private IP), writing the endpoint (**Bicep**), setting up the **privatelink DNS integration** (the **mandatory** element, too often forgotten) and **closing public access**. Your PaaS is no longer on the Internet: it's **private**, reachable only from your network. You now have all the AZ-700 network pillars — only the capstone **project** remains for CV packaging.
:::

## pitfalls

:::lang fr
**1. Oublier l'intégration DNS.** **L'erreur n°1.** Sans la zone `privatelink.*` qui résout vers l'IP privée, les clients vont **encore** à l'IP publique — le point de terminaison privé est **inutile**.

**2. Point de terminaison privé sans fermer l'accès public.** Le service reste joignable d'Internet. Coupe `public_network_access`.

**3. Confondre service endpoint et private endpoint.** Le service endpoint **restreint** (IP publique conservée) ; le private endpoint **privatise** (IP privée). Besoins différents.

**4. Service endpoint pour l'on-prem.** Il ne couvre **pas** l'accès depuis l'on-prem. Pour ça, **private endpoint** (via VPN/ExpressRoute).

**5. Mauvais `groupId`.** Un stockage a plusieurs sous-services (`blob`, `file`, `table`, `queue`). Le point de terminaison privé cible **un** `groupId` — choisis le bon.

**6. Sous-réseau du point de terminaison mal choisi.** Réserve un sous-réseau pour tes points de terminaison privés (et attention aux politiques réseau du sous-réseau).

**7. Croire qu'un pare-feu suffit.** Un PaaS avec pare-feu IP **reste** exposé (IP publique). Le **private endpoint** le **retire** vraiment d'Internet.
:::

:::lang en
**1. Forgetting DNS integration.** **Mistake #1.** Without the `privatelink.*` zone resolving to the private IP, clients **still** go to the public IP — the private endpoint is **useless**.

**2. Private endpoint without closing public access.** The service stays reachable from the Internet. Cut `public_network_access`.

**3. Confusing service endpoint and private endpoint.** The service endpoint **restricts** (public IP kept); the private endpoint **privatizes** (private IP). Different needs.

**4. Service endpoint for on-prem.** It doesn't cover access from on-prem. For that, **private endpoint** (via VPN/ExpressRoute).

**5. Wrong `groupId`.** A storage has several sub-services (`blob`, `file`, `table`, `queue`). The private endpoint targets **one** `groupId` — pick the right one.

**6. Wrong endpoint subnet.** Reserve a subnet for your private endpoints (and mind the subnet's network policies).

**7. Thinking a firewall is enough.** A PaaS with an IP firewall **stays** exposed (public IP). The **private endpoint** truly **removes** it from the Internet.
:::

## success

:::lang fr
Tu as réussi si :

- Tu **détectes** l'exposition publique d'un PaaS (checkov).
- Tu distingues **service endpoint** (restreint) et **private endpoint** (privé).
- Tu écris un **point de terminaison privé** et le **valides** en Bicep.
- Tu mets en place l'**intégration DNS privatelink** (zone + enregistrement).
- Tu **choisis** la bonne option selon le besoin (on-prem, couper public…).
- Tu **fermes l'accès public** et le **valides** au vert.
:::

:::lang en
You've succeeded if:

- You **detect** a PaaS's public exposure (checkov).
- You distinguish **service endpoint** (restricted) and **private endpoint** (private).
- You write a **private endpoint** and **validate** it in Bicep.
- You set up the **privatelink DNS integration** (zone + record).
- You **choose** the right option by need (on-prem, cut public…).
- You **close public access** and **validate** it green.
:::

## next

:::lang fr
- **Suivant :** *Azure — projet réseau (AZ-700)* — le projet de synthèse : concevoir et implémenter une topologie réseau complète.
- **Réviser :** *Azure — réseau fondamentaux (AZ-700)* pour le DNS privé.
- **S'entraîner :** ajoute un point de terminaison privé pour un `Microsoft.KeyVault/vaults` (groupId `vault`) et sa zone `privatelink.vaultcore.azure.net`.
:::

:::lang en
- **Next:** *Azure — network project (AZ-700)* — the capstone: design and implement a complete network topology.
- **Review:** *Azure — network fundamentals (AZ-700)* for private DNS.
- **Practice:** add a private endpoint for a `Microsoft.KeyVault/vaults` (groupId `vault`) and its `privatelink.vaultcore.azure.net` zone.
:::

## cheatsheet

:::lang fr
**Service endpoint vs private endpoint**

```text
Service Endpoint : restreint le PaaS a tes sous-reseaux (backbone Azure)
                   -> IP PUBLIQUE conservee, pas d'on-prem, gratuit
Private Endpoint : IP PRIVEE dans ton VNet (Private Link)
                   -> coupe l'acces public, marche depuis l'on-prem, coute + DNS
```

**Les 3 briques d'un acces vraiment prive**

```text
1. Private endpoint : Microsoft.Network/privateEndpoints (subnet + privateLinkServiceId + groupIds)
2. DNS privatelink  : zone privatelink.<service> + enregistrement A -> IP privee  (OBLIGATOIRE)
3. Fermer le public : public_network_access_enabled = false   (CKV_AZURE_59)
```

**Zones privatelink (exemples)**

```text
Blob     privatelink.blob.core.windows.net
Key Vault privatelink.vaultcore.azure.net
SQL      privatelink.database.windows.net
```

**DNS privatelink (live)**

```bash
azlocal dns zone create   --resource-group RG --name privatelink.blob.core.windows.net
azlocal dns record create --resource-group RG --zone privatelink.blob.core.windows.net --name monstockage --type A --value 10.0.3.10
```
:::

:::lang en
**Service endpoint vs private endpoint**

```text
Service Endpoint : restricts PaaS to your subnets (Azure backbone)
                   -> PUBLIC IP kept, no on-prem, free
Private Endpoint : PRIVATE IP in your VNet (Private Link)
                   -> cuts public access, works from on-prem, costs + DNS
```

**The 3 pieces of truly private access**

```text
1. Private endpoint: Microsoft.Network/privateEndpoints (subnet + privateLinkServiceId + groupIds)
2. privatelink DNS : privatelink.<service> zone + A record -> private IP  (MANDATORY)
3. Close public    : public_network_access_enabled = false   (CKV_AZURE_59)
```

**privatelink zones (examples)**

```text
Blob      privatelink.blob.core.windows.net
Key Vault privatelink.vaultcore.azure.net
SQL       privatelink.database.windows.net
```

**privatelink DNS (live)**

```bash
azlocal dns zone create   --resource-group RG --name privatelink.blob.core.windows.net
azlocal dns record create --resource-group RG --zone privatelink.blob.core.windows.net --name mystorage --type A --value 10.0.3.10
```
:::

## resources

:::lang fr
- **Azure Private Link / Private Endpoint** : IP privée, connexions, groupIds — Microsoft Learn.
- **Points de terminaison de service** : restriction aux sous-réseaux — Microsoft Learn.
- **Intégration DNS privée** : zones `privatelink.*`, liaison au VNet — Microsoft Learn (AZ-700).
- **Fermeture de l'accès public** : `publicNetworkAccess`, pare-feu PaaS — Microsoft Learn.
- **checkov** : `CKV_AZURE_59` (accès public) — docs checkov.
- **miniblue** : émulateur Azure local (DNS live) — github.com/moabukar/miniblue.
:::

:::lang en
- **Azure Private Link / Private Endpoint**: private IP, connections, groupIds — Microsoft Learn.
- **Service endpoints**: subnet restriction — Microsoft Learn.
- **Private DNS integration**: `privatelink.*` zones, VNet link — Microsoft Learn (AZ-700).
- **Closing public access**: `publicNetworkAccess`, PaaS firewall — Microsoft Learn.
- **checkov**: `CKV_AZURE_59` (public access) — checkov docs.
- **miniblue**: local Azure emulator (DNS live) — github.com/moabukar/miniblue.
:::

## troubleshooting

:::lang fr
**Le point de terminaison privé « ne marche pas ».** **99% du temps : le DNS.** Vérifie la zone `privatelink.<service>` **et** l'enregistrement A vers l'IP privée **et** la liaison au VNet. Sans ça, le client résout encore l'IP publique.

**`bicep : command not found` (step-03).** `az bicep install` ou le binaire autonome.

**`azlocal dns` : erreur (step-04).** Le groupe de ressources doit exister (`azlocal group create`). Vérifie que miniblue tourne (DNS live) et `azlocal` sur le `PATH`.

**checkov signale encore l'accès public (step-06).** Vérifie `public_network_access_enabled = false` dans le `.tf`. Avec `true`, `CKV_AZURE_59` **échoue** — c'est voulu.

**Quel `groupId` pour mon service ?** Il dépend du sous-service : stockage `blob`/`file`/`table`/`queue`, Key Vault `vault`, SQL `sqlServer`. Un mauvais groupId ne connecte pas le bon endpoint.

**Les points de terminaison privés ne se déploient pas en local.** miniblue ne les émule pas. On **valide** en **Bicep** et on **crée le DNS** (live) ; l'exécution du endpoint vise du vrai Azure.
:::

:::lang en
**The private endpoint "doesn't work".** **99% of the time: DNS.** Check the `privatelink.<service>` zone **and** the A record to the private IP **and** the VNet link. Without them, the client still resolves the public IP.

**`bicep: command not found` (step-03).** `az bicep install` or the standalone binary.

**`azlocal dns`: error (step-04).** The resource group must exist (`azlocal group create`). Check miniblue is running (DNS live) and `azlocal` on `PATH`.

**checkov still flags public access (step-06).** Check `public_network_access_enabled = false` in the `.tf`. With `true`, `CKV_AZURE_59` **fails** — that's intended.

**Which `groupId` for my service?** It depends on the sub-service: storage `blob`/`file`/`table`/`queue`, Key Vault `vault`, SQL `sqlServer`. A wrong groupId doesn't connect the right endpoint.

**Private endpoints won't deploy locally.** miniblue doesn't emulate them. We **validate** in **Bicep** and **create the DNS** (live); the endpoint's execution targets real Azure.
:::
