---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-stockage
slug: azure-stockage
order: 60
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — stockage (AZ-104) : comptes, Blob, niveaux d'accès, SAS"
title_en: "Azure — storage (AZ-104): accounts, Blob, access tiers, SAS"
tagline_fr: "compte de stockage, conteneurs, niveaux chaud/froid, SAS, cycle de vie."
tagline_en: "storage account, containers, hot/cool tiers, SAS, lifecycle."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 240
repo: "Azure/Azurite"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-fondamentaux]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [compte-de-stockage, redondance, blob, conteneurs, niveaux-acces, sas, cle-de-compte, cycle-de-vie, plan-de-controle, plan-de-donnees, az-104]
concepts_en: [storage-account, redundancy, blob, containers, access-tiers, sas, account-key, lifecycle, control-plane, data-plane, az-104]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le stockage Azure pour l'AZ-104, en local : crée un compte de stockage (plan de contrôle live sur miniblue), manipule des conteneurs Blob, des niveaux d'accès (public/privé) et des niveaux de stockage (chaud/froid) sur Azurite (plan de données live), génère un jeton SAS à privilège limité, et décris une règle de cycle de vie en Bicep (transition froid→archive, suppression). Redondance (LRS/ZRS/GRS) et choix de niveau vus en concept. Sans compte ni facture."
og_description_en: "Azure storage for AZ-104, locally: create a storage account (live control plane on miniblue), handle Blob containers, access levels (public/private) and storage tiers (hot/cool) on Azurite (live data plane), generate a least-privilege SAS token, and describe a lifecycle rule in Bicep (cool→archive transition, deletion). Redundancy (LRS/ZRS/GRS) and tier choice seen as concept. No account or bill."
---

## intro

:::lang fr
Le **stockage** est l'un des services les plus utilisés d'Azure — et un domaine central de l'examen **AZ-104**. Presque tout finit dans un **compte de stockage** : fichiers, images, sauvegardes, journaux, disques de VM, files de messages. Savoir **créer** un compte, choisir sa **redondance**, ranger des objets dans des **conteneurs Blob**, régler les **niveaux d'accès** et de **stockage**, générer des **jetons SAS** sûrs et automatiser le **cycle de vie** : c'est le quotidien de l'administrateur.

Tu vas travailler sur **les deux plans** (revois le guide *fondamentaux*) : le **plan de contrôle** — créer et configurer le **compte de stockage** — est **live sur miniblue** ; le **plan de données** — conteneurs, blobs, niveaux, SAS — est **live sur Azurite** (l'émulateur de stockage officiel, qui couvre richement le Blob). Tu créeras un compte, y organiseras des conteneurs, joueras avec les **niveaux chaud/froid**, généreras un **SAS** à privilège limité, et décriras une **règle de cycle de vie** en **Bicep**. Redondance et choix de niveau sont ancrés en concept — le cœur des questions d'examen.

C'est le deuxième guide de profondeur du track **AZ-104**, après le réseau. On y consolide le réflexe **plan de contrôle vs plan de données**, essentiel pour comprendre Azure.

**Pour qui c'est :** tu as fait *Azure fondamentaux* (miniblue + Azurite montés) et tu veux le stockage en pratique.

**Quand ce n'est PAS le bon choix :**

- Ton labo n'est pas monté → refais *Azure fondamentaux*.
- Tu cherches une base de données (SQL, Cosmos) → le stockage Blob, c'est de l'**objet** ; les bases viennent plus loin dans le track.
:::

:::lang en
**Storage** is one of Azure's most-used services — and a core domain of the **AZ-104** exam. Almost everything ends up in a **storage account**: files, images, backups, logs, VM disks, message queues. Knowing how to **create** an account, choose its **redundancy**, organize objects in **Blob containers**, set **access** and **storage tiers**, generate safe **SAS tokens** and automate the **lifecycle**: it's the administrator's daily work.

You'll work on **both planes** (revisit the *fundamentals* guide): the **control plane** — creating and configuring the **storage account** — is **live on miniblue**; the **data plane** — containers, blobs, tiers, SAS — is **live on Azurite** (the official storage emulator, which covers Blob richly). You'll create an account, organize containers in it, play with **hot/cool tiers**, generate a least-privilege **SAS**, and describe a **lifecycle rule** in **Bicep**. Redundancy and tier choice are anchored in concept — the heart of the exam questions.

This is the second depth guide of the **AZ-104** track, after networking. We consolidate the **control plane vs data plane** reflex here, essential to understanding Azure.

**Who it's for:** you've done *Azure fundamentals* (miniblue + Azurite set up) and want storage in practice.

**When it's NOT the right choice:**

- Your lab isn't set up → redo *Azure fundamentals*.
- You want a database (SQL, Cosmos) → Blob storage is **object** storage; databases come later in the track.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Créer un **compte de stockage** et choisir sa **redondance** (LRS/ZRS/GRS).
- Distinguer **plan de contrôle** (le compte) et **plan de données** (les blobs).
- Créer des **conteneurs** et régler leur **niveau d'accès** (privé/public).
- Téléverser des blobs et choisir un **niveau de stockage** (chaud/froid).
- Générer un **jeton SAS** à privilège et durée limités.
- Comparer **SAS** et **clés de compte** (sécurité).
- Décrire une **règle de cycle de vie** en Bicep (transition, suppression).
:::

:::lang en
By the end of this guide, you can:

- Create a **storage account** and choose its **redundancy** (LRS/ZRS/GRS).
- Distinguish **control plane** (the account) and **data plane** (the blobs).
- Create **containers** and set their **access level** (private/public).
- Upload blobs and choose a **storage tier** (hot/cool).
- Generate a **SAS token** with limited privilege and duration.
- Compare **SAS** and **account keys** (security).
- Describe a **lifecycle rule** in Bicep (transition, deletion).
:::

## prerequisites

:::lang fr
- Le guide **Azure fondamentaux** terminé, avec **miniblue** ET **Azurite** qui tournent.
- La **chaîne de connexion** Azurite exportée : `export AZURE_STORAGE_CONNECTION_STRING="...devstoreaccount1..."` (voir *fondamentaux*).
- **Bicep** installé (pour la règle de cycle de vie).
- Rappel : miniblue = plan de contrôle (le compte) ; Azurite = plan de données (les blobs).
:::

:::lang en
- The **Azure fundamentals** guide done, with **miniblue** AND **Azurite** running.
- The Azurite **connection string** exported: `export AZURE_STORAGE_CONNECTION_STRING="...devstoreaccount1..."` (see *fundamentals*).
- **Bicep** installed (for the lifecycle rule).
- Reminder: miniblue = control plane (the account); Azurite = data plane (the blobs).
:::

## concepts

:::lang fr
**Compte de stockage.** Le conteneur de plus haut niveau du stockage Azure (nom **mondialement unique**). Il offre plusieurs services : **Blob** (objets), **File** (partages SMB), **Queue** (messages), **Table** (NoSQL clé-valeur). On choisit à la création : le **type** (`StorageV2`, le standard moderne), la **performance** (Standard sur disque, Premium sur SSD), et la **redondance**.

**Redondance.** Combien de copies, et où : **LRS** (3 copies dans un datacenter — le moins cher), **ZRS** (3 copies dans 3 zones d'une région — résiste à une panne de zone), **GRS** (LRS + réplication asynchrone vers une **région** distante — résiste à un sinistre régional), **RA-GRS** (GRS avec **lecture** sur la copie distante). Plus on protège, plus ça coûte. Choisir la bonne redondance selon la criticité est un point d'examen classique.

**Conteneurs & blobs.** Dans le service Blob, un **conteneur** regroupe des **blobs** (objets). Trois types de blobs : **block** (fichiers, le plus courant), **append** (journaux), **page** (disques de VM). Le modèle est **plat** : `logs/2026/app.log` est **une clé**.

**Niveau d'accès (public/privé).** Un conteneur a un **niveau d'accès** : **privé** (par défaut — rien n'est public), **blob** (les blobs sont lisibles anonymement, pas la liste), **conteneur** (blobs + liste publics). ⚠️ En production, on garde **privé** et on expose via **SAS** — jamais de conteneur public par accident.

**Niveaux de stockage (chaud/froid/archive).** Chaque blob a un **niveau** selon la fréquence d'accès : **Hot** (accès fréquent), **Cool** (peu accédé, ≥ 30 j), **Cold** (rarement, ≥ 90 j), **Archive** (archivage, récupération lente et payante). Plus c'est froid, moins le **stockage** coûte, mais plus la **récupération** est chère/lente — le même compromis que sur S3/GCS.

**SAS & clés de compte.** Deux façons de déléguer l'accès aux données : les **clés de compte** (2 clés toutes-puissantes — à protéger comme des mots de passe root, à faire tourner) ; et le **SAS** (Shared Access Signature — un jeton **à privilège limité** : telles permissions, tel blob/conteneur, telle **période de validité**). Règle d'or : **SAS à portée minimale**, jamais les clés de compte dans une appli cliente.

**Cycle de vie (lifecycle).** Des **règles automatiques** sur le compte : « après 30 j, passe en Cool », « après 90 j, en Archive », « après 365 j, supprime ». On automatise l'optimisation du coût. On la décrit en **Bicep** (ressource `managementPolicies`).

**Ce qui est live ici.** Le **compte** se crée sur **miniblue** (plan de contrôle). Les **conteneurs, blobs, niveaux d'accès et de stockage, SAS** sont **live sur Azurite** (plan de données). Le **cycle de vie** se **décrit et valide en Bicep** (l'appliquer réellement demande un vrai compte — guide *passer en réel*). Redondance et choix de niveau = concept d'examen.
:::

:::lang en
**Storage account.** Azure storage's top-level container (globally **unique** name). It offers several services: **Blob** (objects), **File** (SMB shares), **Queue** (messages), **Table** (key-value NoSQL). You choose at creation: the **type** (`StorageV2`, the modern standard), the **performance** (Standard on disk, Premium on SSD), and the **redundancy**.

**Redundancy.** How many copies, and where: **LRS** (3 copies in one datacenter — cheapest), **ZRS** (3 copies across 3 zones of a region — survives a zone outage), **GRS** (LRS + async replication to a distant **region** — survives a regional disaster), **RA-GRS** (GRS with **read** access on the distant copy). The more you protect, the more it costs. Choosing the right redundancy by criticality is a classic exam point.

**Containers & blobs.** In the Blob service, a **container** groups **blobs** (objects). Three blob types: **block** (files, most common), **append** (logs), **page** (VM disks). The model is **flat**: `logs/2026/app.log` is **one key**.

**Access level (public/private).** A container has an **access level**: **private** (default — nothing public), **blob** (blobs readable anonymously, not the listing), **container** (blobs + listing public). ⚠️ In production, keep it **private** and expose via **SAS** — never an accidentally public container.

**Storage tiers (hot/cool/archive).** Each blob has a **tier** by access frequency: **Hot** (frequent access), **Cool** (rarely accessed, ≥ 30 d), **Cold** (rare, ≥ 90 d), **Archive** (archival, slow and paid retrieval). The colder, the less **storage** costs, but the more **retrieval** costs/is slow — the same tradeoff as S3/GCS.

**SAS & account keys.** Two ways to delegate data access: **account keys** (2 all-powerful keys — protect like root passwords, rotate them); and **SAS** (Shared Access Signature — a **least-privilege** token: these permissions, this blob/container, this **validity window**). Golden rule: **minimal-scope SAS**, never account keys in a client app.

**Lifecycle.** **Automatic rules** on the account: "after 30 d, move to Cool", "after 90 d, to Archive", "after 365 d, delete". You automate cost optimization. You describe it in **Bicep** (`managementPolicies` resource).

**What's live here.** The **account** is created on **miniblue** (control plane). The **containers, blobs, access and storage tiers, SAS** are **live on Azurite** (data plane). The **lifecycle** is **described and validated in Bicep** (actually applying it needs a real account — *going real* guide). Redundancy and tier choice = exam concept.
:::

:::figure azure-stockage-plans
caption_fr: "Schéma 1. Les deux plans du stockage Azure : le COMPTE de stockage (redondance LRS/ZRS/GRS, type, performance) vit sur le plan de contrôle (miniblue) ; dedans, le service Blob organise des CONTENEURS et des BLOBS avec niveaux d'accès (privé/public) et de stockage (chaud/froid/archive), exposés par SAS — sur le plan de données (Azurite). Le cycle de vie (transition, suppression) est décrit en Bicep."
caption_en: "Figure 1. The two planes of Azure storage: the storage ACCOUNT (redundancy LRS/ZRS/GRS, type, performance) lives on the control plane (miniblue); inside, the Blob service organizes CONTAINERS and BLOBS with access (private/public) and storage (hot/cool/archive) tiers, exposed via SAS — on the data plane (Azurite). The lifecycle (transition, deletion) is described in Bicep."
:::

## walkthrough

:::lang fr
On avance ainsi : compte de stockage (contrôle) → conteneurs & niveau d'accès (données) → niveaux de stockage → SAS → cycle de vie en Bicep → redondance & choix → nettoyage.
:::

:::lang en
We'll go like this: storage account (control) → containers & access level (data) → storage tiers → SAS → lifecycle in Bicep → redundancy & choice → cleanup.
:::

### step-01

:::lang fr
**Objectif.** Créer un **compte de stockage** — le plan de contrôle, live sur miniblue.

**🤔 Le conteneur de plus haut niveau.** On crée d'abord un **groupe de ressources**, puis le **compte de stockage** dedans. C'est une opération de **plan de contrôle** (ARM) → miniblue. Le compte porte le **type** et (en réel) la **redondance**.

Crée le groupe et le compte :
:::

:::lang en
**Goal.** Create a **storage account** — the control plane, live on miniblue.

**🤔 The top-level container.** We first create a **resource group**, then the **storage account** inside it. It's a **control-plane** operation (ARM) → miniblue. The account carries the **type** and (for real) the **redundancy**.

Create the group and the account:
:::

```bash
# Groupe de ressources + compte de stockage (miniblue, plan de contrôle)
azlocal group create --name rg-stockage --location westeurope
azlocal storage account create --name stlabo2026 --resource-group rg-stockage
```

:::lang fr
**✅ Vérification :** `storage account create` renvoie un objet ARM avec `"name": "stlabo2026"`, `"kind": "StorageV2"` et un `id` sous `rg-stockage`. Le **compte existe** côté plan de contrôle. Retiens qu'à la création d'un vrai compte, tu choisis aussi la **performance** (Standard/Premium) et la **redondance** (LRS/ZRS/GRS — étape 6). ⚠️ Le **nom** est **mondialement unique** et en **minuscules/chiffres** uniquement (3–24 caractères). Pour le **plan de données** (les blobs), on passe à **Azurite** à l'étape suivante — c'est l'émulateur qui couvre richement le Blob.
:::

:::lang en
**✅ Check:** `storage account create` returns an ARM object with `"name": "stlabo2026"`, `"kind": "StorageV2"` and an `id` under `rg-stockage`. The **account exists** on the control-plane side. Remember that when creating a real account, you also choose the **performance** (Standard/Premium) and **redundancy** (LRS/ZRS/GRS — step 6). ⚠️ The **name** is **globally unique** and **lowercase/digits** only (3–24 chars). For the **data plane** (the blobs), we switch to **Azurite** next — the emulator that richly covers Blob.
:::

### step-02

:::lang fr
**Objectif.** Créer des **conteneurs** et régler leur **niveau d'accès** — plan de données, live sur Azurite.

**🤔 Ranger et sécuriser.** Un **conteneur** regroupe des blobs. Son **niveau d'accès** décide de la visibilité anonyme : **privé** par défaut (recommandé). On crée un conteneur privé et on y dépose des blobs (via la chaîne de connexion Azurite).

Crée un conteneur privé et des blobs :
:::

:::lang en
**Goal.** Create **containers** and set their **access level** — data plane, live on Azurite.

**🤔 Organize and secure.** A **container** groups blobs. Its **access level** decides anonymous visibility: **private** by default (recommended). We create a private container and drop blobs in it (via the Azurite connection string).

Create a private container and blobs:
:::

```bash
# La chaîne de connexion Azurite est déjà exportée (fondamentaux)
# Conteneur PRIVÉ (aucun accès anonyme) / PRIVATE container (no anonymous access)
az storage container create --name documents --public-access off \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING"

# Déposer des blobs / drop blobs
echo "rapport Q1" > q1.txt
az storage blob upload --container-name documents --name rapports/q1.txt \
  --file q1.txt --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob list --container-name documents \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING" --output table
```

:::lang fr
**✅ Vérification :** `container create --public-access off` renvoie `"created": true` (conteneur **privé**). L'`upload` réussit, `blob list` affiche `rapports/q1.txt`. Ton conteneur est privé : **aucun** accès anonyme — c'est le bon réglage par défaut. ⚠️ Les trois niveaux : **off/privé** (rien de public), **blob** (blobs lisibles anonymement), **container** (blobs + liste publics). En prod, on reste **privé** et on délègue par **SAS** (étape 4). Un conteneur public par erreur = fuite de données classique.
:::

:::lang en
**✅ Check:** `container create --public-access off` returns `"created": true` (a **private** container). The `upload` succeeds, `blob list` shows `rapports/q1.txt`. Your container is private: **no** anonymous access — the right default. ⚠️ The three levels: **off/private** (nothing public), **blob** (blobs anonymously readable), **container** (blobs + listing public). In prod, keep it **private** and delegate via **SAS** (step 4). An accidentally public container = classic data leak.
:::

### step-03

:::lang fr
**Objectif.** Choisir un **niveau de stockage** (chaud/froid) par blob — live sur Azurite.

**🤔 Le domaine coût.** Chaque blob a un **niveau** selon sa fréquence d'accès. Un fichier consulté souvent → **Hot** ; une sauvegarde rarement lue → **Cool** (stockage moins cher, récupération un peu plus chère). On dépose un blob directement en **Cool** et on vérifie son niveau.

Téléverse en Cool et vérifie :
:::

:::lang en
**Goal.** Choose a **storage tier** (hot/cool) per blob — live on Azurite.

**🤔 The cost domain.** Each blob has a **tier** by access frequency. A frequently-read file → **Hot**; a rarely-read backup → **Cool** (cheaper storage, slightly pricier retrieval). We upload a blob directly to **Cool** and check its tier.

Upload to Cool and verify:
:::

```bash
# Déposer un blob directement en niveau Cool / upload a blob directly to Cool tier
echo "sauvegarde ancienne" > vieux.txt
az storage blob upload --container-name documents --name archives/vieux.txt \
  --file vieux.txt --tier Cool \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING"

# Vérifier le niveau du blob / check the blob tier
az storage blob show --container-name documents --name archives/vieux.txt \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING" \
  --query "properties.blobTier" --output tsv
```

:::lang fr
**✅ Vérification :** l'upload réussit et `blob show ... --query "properties.blobTier"` renvoie **`Cool`**. Tu viens de placer un objet dans un niveau moins cher au stockage. Retiens le compromis : **Hot** (accès fréquent, stockage cher), **Cool** (≥ 30 j, moins cher au stockage), **Cold** (≥ 90 j), **Archive** (archivage, récupération lente et payante). ⚠️ **Note émulateur :** Azurite gère **Hot/Cool** ; le niveau **Archive** (avec sa réhydratation lente) est un concept d'examen mais n'est pas pleinement émulé — sur un vrai compte, remonter d'Archive prend des **heures**.
:::

:::lang en
**✅ Check:** the upload succeeds and `blob show ... --query "properties.blobTier"` returns **`Cool`**. You just placed an object in a cheaper storage tier. Remember the tradeoff: **Hot** (frequent access, expensive storage), **Cool** (≥ 30 d, cheaper storage), **Cold** (≥ 90 d), **Archive** (archival, slow and paid retrieval). ⚠️ **Emulator note:** Azurite handles **Hot/Cool**; the **Archive** tier (with its slow rehydration) is an exam concept but isn't fully emulated — on a real account, coming back from Archive takes **hours**.
:::

### step-04

:::lang fr
**Objectif.** Générer un **jeton SAS** à privilège limité — live sur Azurite.

**🤔 Déléguer sans donner les clés.** Pour laisser quelqu'un lire **un** blob pendant **un temps limité**, on ne donne **pas** la clé de compte (toute-puissante) : on génère un **SAS** — un jeton signé, restreint à des permissions (`r` = lecture), une cible (ce blob) et une **expiration**. C'est **le** réflexe de sécurité du stockage.

Génère un SAS en lecture, expirant à une date donnée :
:::

:::lang en
**Goal.** Generate a least-privilege **SAS token** — live on Azurite.

**🤔 Delegate without handing over the keys.** To let someone read **one** blob for **a limited time**, you do **not** hand over the account key (all-powerful): you generate a **SAS** — a signed token, restricted to permissions (`r` = read), a target (this blob) and an **expiry**. It's **the** storage security reflex.

Generate a read SAS, expiring at a given date:
:::

```bash
# Générer un SAS en LECTURE seule sur un blob, avec expiration
# Generate a READ-only SAS on a blob, with an expiry
az storage blob generate-sas --container-name documents --name rapports/q1.txt \
  --permissions r --expiry 2030-01-01 \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING" --output tsv
```

:::lang fr
**✅ Vérification :** la commande renvoie une **chaîne SAS** de la forme `se=2030-01-01&sp=r&sv=...&sr=b&sig=...` : `sp=r` (permission **lecture** seule), `sr=b` (portée **blob**), `se=` (expiration), `sig=` (signature). Ce jeton, ajouté à l'URL du blob, donne un accès **exactement** limité à ce que tu as défini. ⚠️ Compare avec les **clés de compte** (2 clés toutes-puissantes, à faire tourner régulièrement) : le SAS est **à privilège minimal** et **expirable** — on le préfère **toujours** pour un accès délégué. Ne mets **jamais** une clé de compte dans une appli cliente ou un dépôt Git.
:::

:::lang en
**✅ Check:** the command returns a **SAS string** like `se=2030-01-01&sp=r&sv=...&sr=b&sig=...`: `sp=r` (**read**-only permission), `sr=b` (**blob** scope), `se=` (expiry), `sig=` (signature). This token, appended to the blob's URL, grants access **exactly** limited to what you defined. ⚠️ Compare with **account keys** (2 all-powerful keys, to rotate regularly): the SAS is **least-privilege** and **expirable** — you **always** prefer it for delegated access. **Never** put an account key in a client app or a Git repo.
:::

### step-05

:::lang fr
**Objectif.** Décrire une **règle de cycle de vie** en Bicep — validation hors-ligne.

**🤔 Automatiser le coût.** Plutôt que de retiérer les blobs à la main, on écrit une **règle de cycle de vie** : « passe en Cool à 30 j, en Archive à 90 j, supprime à 365 j ». C'est une ressource `managementPolicies` du compte, qu'on **décrit en Bicep** et qu'on **compile/valide**.

Crée `cycle.bicep` puis compile-le :
:::

:::lang en
**Goal.** Describe a **lifecycle rule** in Bicep — offline validation.

**🤔 Automate cost.** Rather than re-tiering blobs by hand, you write a **lifecycle rule**: "move to Cool at 30 d, Archive at 90 d, delete at 365 d". It's a `managementPolicies` resource on the account, which you **describe in Bicep** and **compile/validate**.

Create `cycle.bicep` then compile it:
:::

```bicep
// cycle.bicep — compte de stockage + règle de cycle de vie
param location string = 'westeurope'
param storageName string = 'stcycle${uniqueString(resourceGroup().id)}'

resource sa 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

resource cycleVie 'Microsoft.Storage/storageAccounts/managementPolicies@2023-01-01' = {
  parent: sa
  name: 'default'
  properties: {
    policy: {
      rules: [
        {
          name: 'refroidir-puis-supprimer'
          enabled: true
          type: 'Lifecycle'
          definition: {
            filters: { blobTypes: [ 'blockBlob' ] }
            actions: {
              baseBlob: {
                tierToCool: { daysAfterModificationGreaterThan: 30 }
                tierToArchive: { daysAfterModificationGreaterThan: 90 }
                delete: { daysAfterModificationGreaterThan: 365 }
              }
            }
          }
        }
      ]
    }
  }
}
```

```bash
bicep build cycle.bicep --stdout | head -n 20
```

:::lang fr
**✅ Vérification :** `bicep build` affiche l'ARM JSON compilé — **deux** ressources : `Microsoft.Storage/storageAccounts` et `Microsoft.Storage/storageAccounts/managementPolicies` — et **aucune erreur**. Ta règle (Cool à 30 j, Archive à 90 j, suppression à 365 j) est **valide** contre le schéma Azure. Tu automatises l'optimisation du coût, de façon versionnée. ⚠️ `bicep build` **valide la forme** ; **appliquer** réellement la règle demande un vrai compte (`az deployment`) — au guide *passer en réel*. La **logique** (refroidir puis supprimer selon l'âge) est identique en réel.
:::

:::lang en
**✅ Check:** `bicep build` prints the compiled ARM JSON — **two** resources: `Microsoft.Storage/storageAccounts` and `Microsoft.Storage/storageAccounts/managementPolicies` — and **no error**. Your rule (Cool at 30 d, Archive at 90 d, delete at 365 d) is **valid** against the Azure schema. You automate cost optimization, versioned. ⚠️ `bicep build` **validates the shape**; actually **applying** the rule needs a real account (`az deployment`) — in the *going real* guide. The **logic** (cool then delete by age) is identical for real.
:::

### step-06

:::lang fr
**Objectif.** **Choisir** la redondance et le niveau — la décision d'administrateur.

**🤔 La grille de choix (cœur de l'AZ-104).** Deux décisions à la création/gestion d'un compte : la **redondance** (combien de copies, où) et le **niveau** (fréquence d'accès). L'examen te donne un scénario et attend le bon choix.

Récapitule les grilles :
:::

:::lang en
**Goal.** **Choose** redundancy and tier — the administrator's decision.

**🤔 The choice grid (AZ-104 core).** Two decisions when creating/managing an account: **redundancy** (how many copies, where) and **tier** (access frequency). The exam gives a scenario and expects the right choice.

Recap the grids:
:::

```text
REDONDANCE / REDUNDANCY
  LRS     3 copies, 1 datacenter          le moins cher / cheapest ; perte si sinistre datacenter
  ZRS     3 copies, 3 zones d'une région  résiste à une panne de zone / zone-outage resilient
  GRS     LRS + région distante (async)   résiste à un sinistre régional / region-disaster resilient
  RA-GRS  GRS + lecture sur la copie dist. lecture même si la région primaire tombe

NIVEAU DE STOCKAGE / STORAGE TIER (par accès / by access)
  Hot      accès fréquent / frequent      stockage cher, accès bon marché
  Cool     ≥ 30 jours                      stockage moins cher, accès plus cher
  Cold     ≥ 90 jours                      encore moins cher
  Archive  archivage / archival           le moins cher au stockage ; récupération LENTE (heures) et payante
```

:::lang fr
**✅ Vérification :** tu sais **choisir**. Redondance : données jetables → **LRS** ; haute dispo intra-région → **ZRS** ; reprise après sinistre régional → **GRS/RA-GRS**. Niveau : actif → **Hot** ; sauvegarde mensuelle → **Cool** ; archive légale 7 ans → **Archive**. C'est **exactement** le type de question de l'AZ-104 (« quel compte/niveau pour ce besoin ? »). ⚠️ Le niveau se change **par blob** (ou par règle de cycle de vie) ; la redondance se choisit **au compte** (et certaines transitions, ex. vers ZRS, imposent une migration).
:::

:::lang en
**✅ Check:** you can **choose**. Redundancy: throwaway data → **LRS**; intra-region high availability → **ZRS**; regional disaster recovery → **GRS/RA-GRS**. Tier: active → **Hot**; monthly backup → **Cool**; 7-year legal archive → **Archive**. It's **exactly** the kind of AZ-104 question ("which account/tier for this need?"). ⚠️ The tier is changed **per blob** (or by lifecycle rule); redundancy is chosen **at the account** (and some transitions, e.g. to ZRS, require a migration).
:::

### step-07

:::lang fr
**Objectif.** Nettoyer ton stockage.

**🤔 L'hygiène.** On supprime le conteneur (plan de données, Azurite) et le groupe de ressources avec son compte (plan de contrôle, miniblue). Réflexe **créer → utiliser → nettoyer**.

Nettoie :
:::

:::lang en
**Goal.** Clean up your storage.

**🤔 Hygiene.** We delete the container (data plane, Azurite) and the resource group with its account (control plane, miniblue). **Create → use → clean up** reflex.

Clean up:
:::

```bash
# Plan de données : supprimer le conteneur (Azurite) / delete the container (Azurite)
az storage container delete --name documents \
  --connection-string "$AZURE_STORAGE_CONNECTION_STRING"

# Plan de contrôle : supprimer le groupe + son compte (miniblue) / delete the group + account (miniblue)
azlocal group delete --name rg-stockage
```

:::lang fr
**✅ Vérification :** `container delete` renvoie `"deleted": true`. `group delete` renvoie `Deleted` — le groupe **et** le compte de stockage qu'il contenait partent ensemble. Ton stockage est rangé. Tu maîtrises désormais les deux plans du stockage Azure : le **compte** (contrôle) et les **blobs** (données), avec niveaux d'accès, niveaux de stockage, SAS et cycle de vie. La suite du track AZ-104 : le **calcul** (machines virtuelles) et l'**identité & gouvernance** (RBAC, policies).
:::

:::lang en
**✅ Check:** `container delete` returns `"deleted": true`. `group delete` returns `Deleted` — the group **and** the storage account it held go together. Your storage is tidy. You now master both planes of Azure storage: the **account** (control) and the **blobs** (data), with access levels, storage tiers, SAS and lifecycle. The AZ-104 track continues: **compute** (virtual machines) and **identity & governance** (RBAC, policies).
:::

## pitfalls

:::lang fr
**1. Conteneur public par erreur.** Le niveau d'accès **blob**/**container** rend les données lisibles anonymement. En prod, garde **privé** et délègue par SAS. Une fuite classique.

**2. Distribuer une clé de compte.** Les clés sont **toutes-puissantes**. Ne les mets jamais dans une appli/un dépôt. Pour déléguer, un **SAS** à portée minimale.

**3. SAS trop large ou sans expiration.** Un SAS `rwdl` sans expiry, c'est presque une clé. Donne le **minimum** de permissions et une **expiration** courte.

**4. Choisir Archive pour des données actives.** Archive est bon marché au stockage mais la récupération prend des **heures** et se paie. Pour de l'accès régulier, c'est un contresens.

**5. Confondre niveau d'accès et niveau de stockage.** Le **niveau d'accès** = visibilité (privé/public). Le **niveau de stockage** = coût/fréquence (Hot/Cool/Archive). Deux réglages distincts.

**6. Croire que GRS protège d'une suppression.** GRS réplique — y compris une **suppression**. Contre l'erreur humaine, il faut **soft delete**/**versioning**, pas la redondance.

**7. Nom de compte invalide.** 3–24 caractères, **minuscules et chiffres** uniquement, **mondialement unique**. Pas de tiret, pas de majuscule.
:::

:::lang en
**1. Accidentally public container.** The **blob**/**container** access level makes data anonymously readable. In prod, keep it **private** and delegate via SAS. A classic leak.

**2. Handing out an account key.** Keys are **all-powerful**. Never put them in an app/repo. To delegate, a minimal-scope **SAS**.

**3. SAS too broad or with no expiry.** An `rwdl` SAS with no expiry is almost a key. Give the **minimum** permissions and a **short** expiry.

**4. Choosing Archive for active data.** Archive is cheap to store but retrieval takes **hours** and costs money. For regular access, it's a mistake.

**5. Confusing access level and storage tier.** The **access level** = visibility (private/public). The **storage tier** = cost/frequency (Hot/Cool/Archive). Two distinct settings.

**6. Thinking GRS protects from deletion.** GRS replicates — including a **deletion**. Against human error, you need **soft delete**/**versioning**, not redundancy.

**7. Invalid account name.** 3–24 chars, **lowercase and digits** only, **globally unique**. No dash, no uppercase.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées un **compte de stockage** (miniblue) dans un groupe.
- [ ] Tu crées un conteneur **privé** et y déposes des blobs (Azurite).
- [ ] Tu téléverses un blob en **Cool** et vérifies son niveau.
- [ ] Tu génères un **SAS** en lecture, avec expiration.
- [ ] Tu expliques **SAS vs clés de compte**.
- [ ] Tu **compiles** une règle de **cycle de vie** en Bicep.
- [ ] Tu choisis la **redondance** (LRS/ZRS/GRS) et le **niveau** selon un scénario.

Sept cases = tu tiens le stockage Azure au niveau AZ-104. La suite : le **calcul**.
:::

:::lang en
You know it works when…

- [ ] You create a **storage account** (miniblue) in a group.
- [ ] You create a **private** container and drop blobs in it (Azurite).
- [ ] You upload a blob to **Cool** and check its tier.
- [ ] You generate a read **SAS**, with an expiry.
- [ ] You explain **SAS vs account keys**.
- [ ] You **compile** a **lifecycle** rule in Bicep.
- [ ] You choose the **redundancy** (LRS/ZRS/GRS) and **tier** by scenario.

Seven boxes = you hold Azure storage at AZ-104 level. Next up: **compute**.
:::

## next

:::lang fr
Le track AZ-104 continue :

1. **Azure — calcul** : machines virtuelles, disques, mise à l'échelle, conteneurs — déployés en live contre miniblue (Terraform) + Bicep.
2. Plus loin : **identité & gouvernance** (Entra ID, RBAC, policies), le **projet d'entreprise** AZ-104 et **passer en réel**.
:::

:::lang en
The AZ-104 track continues:

1. **Azure — compute**: virtual machines, disks, scaling, containers — deployed live against miniblue (Terraform) + Bicep.
2. Further along: **identity & governance** (Entra ID, RBAC, policies), the AZ-104 **enterprise project** and **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire stockage Azure.
:::

:::lang en
Azure storage cheat sheet.
:::

```bash
# Plan de contrôle : compte (miniblue) / control plane: account (miniblue)
azlocal group create --name rg-stockage --location westeurope
azlocal storage account create --name stlabo2026 --resource-group rg-stockage

# Plan de données : conteneurs & blobs (Azurite) / data plane: containers & blobs (Azurite)
az storage container create --name documents --public-access off --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob upload --container-name documents --name cle --file f.txt --tier Cool --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob show --container-name documents --name cle --query "properties.blobTier" -o tsv --connection-string "$AZURE_STORAGE_CONNECTION_STRING"
az storage blob generate-sas --container-name documents --name cle --permissions r --expiry 2030-01-01 -o tsv --connection-string "$AZURE_STORAGE_CONNECTION_STRING"

# Cycle de vie (Bicep, hors-ligne) / lifecycle (Bicep, offline)
bicep build cycle.bicep --stdout

# Grilles : redondance LRS<ZRS<GRS<RA-GRS ; niveau Hot>Cool>Cold>Archive
```

## resources

:::lang fr
- [Comptes de stockage Azure](https://learn.microsoft.com/azure/storage/common/storage-account-overview) — types, redondance.
- [Niveaux d'accès Blob](https://learn.microsoft.com/azure/storage/blobs/access-tiers-overview) — Hot/Cool/Cold/Archive.
- [Signatures d'accès partagé (SAS)](https://learn.microsoft.com/azure/storage/common/storage-sas-overview) — délégation sûre.
- [Gestion du cycle de vie](https://learn.microsoft.com/azure/storage/blobs/lifecycle-management-overview) — règles automatiques.
- [Azurite — l'émulateur de stockage](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) — le plan de données local.
:::

:::lang en
- [Azure storage accounts](https://learn.microsoft.com/azure/storage/common/storage-account-overview) — types, redundancy.
- [Blob access tiers](https://learn.microsoft.com/azure/storage/blobs/access-tiers-overview) — Hot/Cool/Cold/Archive.
- [Shared access signatures (SAS)](https://learn.microsoft.com/azure/storage/common/storage-sas-overview) — safe delegation.
- [Lifecycle management](https://learn.microsoft.com/azure/storage/blobs/lifecycle-management-overview) — automatic rules.
- [Azurite — the storage emulator](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) — the local data plane.
:::

## troubleshooting

:::lang fr
**`az storage` : erreur de connexion.** Azurite ne tourne pas, ou `AZURE_STORAGE_CONNECTION_STRING` n'est pas exporté dans **ce** shell. Relance Azurite, ré-exporte la variable.

**`azlocal storage account create` : connexion refusée.** miniblue ne tourne pas (`localhost:4566`). Lance `miniblue`, vérifie `azlocal health`.

**`--tier Archive` échoue sur Azurite.** L'émulateur gère Hot/Cool ; Archive (et sa réhydratation) est un concept — teste-le sur un vrai compte.

**Le SAS ne donne pas accès.** Vérifie les permissions (`--permissions`), l'expiration (`--expiry` dans le futur) et que tu vises le bon blob/conteneur. Un SAS expiré ou trop restreint refuse l'accès.

**`bicep build` : erreur de schéma sur `managementPolicies`.** La structure `policy.rules[].definition.actions` doit correspondre au schéma ; compare aux exemples de la doc « lifecycle management ».

**`The API version ... is not supported by Azurite`.** Ta CLI est plus récente qu'Azurite. Mets Azurite à jour (`npm install -g azurite@latest`) ou lance-le avec `--skipApiVersionCheck`.
:::

:::lang en
**`az storage`: connection error.** Azurite isn't running, or `AZURE_STORAGE_CONNECTION_STRING` isn't exported in **this** shell. Restart Azurite, re-export the variable.

**`azlocal storage account create`: connection refused.** miniblue isn't running (`localhost:4566`). Start `miniblue`, check `azlocal health`.

**`--tier Archive` fails on Azurite.** The emulator handles Hot/Cool; Archive (and its rehydration) is a concept — test it on a real account.

**The SAS doesn't grant access.** Check the permissions (`--permissions`), the expiry (`--expiry` in the future) and that you target the right blob/container. An expired or too-restricted SAS denies access.

**`bicep build`: schema error on `managementPolicies`.** The `policy.rules[].definition.actions` structure must match the schema; compare with the "lifecycle management" docs examples.

**`The API version ... is not supported by Azurite`.** Your CLI is newer than Azurite. Update Azurite (`npm install -g azurite@latest`) or start it with `--skipApiVersionCheck`.
:::
