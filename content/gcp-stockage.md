---
# — Identité (ne change JAMAIS une fois publié) —
id: gcp-stockage
slug: gcp-stockage
order: 53
status: published

# — Titres & accroches (bilingue) —
title_fr: "GCP — stockage : Cloud Storage & Firestore/Datastore"
title_en: "GCP — storage: Cloud Storage & Firestore/Datastore"
tagline_fr: "buckets, classes, versioning, cycle de vie, base NoSQL."
tagline_en: "buckets, classes, versioning, lifecycle, NoSQL database."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 200
repo: "fsouza/fake-gcs-server"
last_review: "2026-08-20"

# — Relations de parcours (par id) —
prerequisites: [gcp-fondamentaux]
next: [gcp-messagerie]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [cloud-storage, classes-stockage, versioning, cycle-de-vie, firestore-datastore, entites-cles, requetes-nosql]
concepts_en: [cloud-storage, storage-classes, versioning, lifecycle, firestore-datastore, entities-keys, nosql-queries]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le stockage GCP pour l'ACE : Cloud Storage (buckets et objets en local via gcloud storage, classes Standard/Nearline/Coldline/Archive, versioning et cycle de vie côté coût) et la base NoSQL Firestore/Datastore via l'émulateur officiel (entités, clés, kinds, écriture/lecture, requêtes et filtres). Cœur émulé live-testé ; fonctions avancées de GCS en concept + syntaxe."
og_description_en: "GCP storage for ACE: Cloud Storage (buckets and objects locally via gcloud storage, Standard/Nearline/Coldline/Archive classes, versioning and lifecycle on the cost side) and the Firestore/Datastore NoSQL database via the official emulator (entities, keys, kinds, write/read, queries and filters). Emulated core live-tested; GCS advanced features as concept + syntax."
---

## intro

:::lang fr
Le stockage est le cœur de toute application, et GCP en propose deux familles que l'examen **Associate Cloud Engineer** teste sans relâche : **Cloud Storage** (des **objets** — fichiers, images, sauvegardes) et **Firestore/Datastore** (une **base NoSQL** — des données structurées interrogeables). Savoir **lequel choisir**, et **comment optimiser le coût**, c'est la marque d'un ingénieur cloud.

Ce guide couvre les deux. Côté **Cloud Storage** : buckets et objets (en local via `gcloud storage`), les **classes de stockage** (Standard, Nearline, Coldline, Archive — le compromis coût/fréquence d'accès), le **versioning** (protection contre l'écrasement) et le **cycle de vie** (transitions et suppressions automatiques). Côté **Firestore/Datastore** : le modèle **entités / clés / kinds**, l'écriture et la lecture, et les **requêtes** avec filtres — le tout **en local**, sur l'émulateur officiel de Google.

Un mot d'honnêteté sur le labo : l'émulateur **fake-gcs-server** couvre parfaitement les **opérations de base** de Cloud Storage (créer, copier, lister, lire), mais **pas** les fonctions avancées (il ne rapporte ni la classe de stockage, ni l'état de versioning). Donc les **classes, versioning et cycle de vie** sont vus en **concept + syntaxe `gcloud`** (ce que tu écris est exact pour le vrai GCP), tandis que **Firestore/Datastore** est **pleinement émulé** — tu écris, lis et interroges pour de vrai. On te le signale à chaque étape.

**Pour qui c'est :** tu as fait *GCP fondamentaux* (labo local monté) et tu veux le stockage sous toutes ses formes.

**Quand ce n'est PAS le bon choix :**

- Ton labo local n'est pas monté → refais *GCP fondamentaux* (émulateurs + fake-gcs).
- Tu cherches une base **relationnelle** (SQL, jointures) → c'est **Cloud SQL** / AlloyDB, pas Firestore ; on couvre ici le NoSQL et le stockage objet.
:::

:::lang en
Storage is the heart of any application, and GCP offers two families the **Associate Cloud Engineer** exam tests relentlessly: **Cloud Storage** (**objects** — files, images, backups) and **Firestore/Datastore** (a **NoSQL database** — queryable structured data). Knowing **which to choose**, and **how to optimize cost**, is the mark of a cloud engineer.

This guide covers both. On the **Cloud Storage** side: buckets and objects (locally via `gcloud storage`), **storage classes** (Standard, Nearline, Coldline, Archive — the cost/access-frequency tradeoff), **versioning** (overwrite protection) and **lifecycle** (automatic transitions and deletions). On the **Firestore/Datastore** side: the **entities / keys / kinds** model, writing and reading, and **queries** with filters — all **locally**, on Google's official emulator.

An honesty note about the lab: the **fake-gcs-server** emulator perfectly covers Cloud Storage's **basic operations** (create, copy, list, read), but **not** the advanced features (it reports neither the storage class nor the versioning state). So **classes, versioning and lifecycle** are seen as **concept + `gcloud` syntax** (what you write is correct for real GCP), while **Firestore/Datastore** is **fully emulated** — you write, read and query for real. We flag it at each step.

**Who it's for:** you've done *GCP fundamentals* (local lab set up) and want storage in all its forms.

**When it's NOT the right choice:**

- Your local lab isn't set up → redo *GCP fundamentals* (emulators + fake-gcs).
- You want a **relational** database (SQL, joins) → that's **Cloud SQL** / AlloyDB, not Firestore; here we cover NoSQL and object storage.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Manipuler **buckets et objets** Cloud Storage avec `gcloud storage`.
- Choisir une **classe de stockage** (Standard/Nearline/Coldline/Archive) selon le coût.
- Expliquer le **versioning** et le **cycle de vie** (transitions, suppression auto).
- Comprendre le modèle **Firestore/Datastore** (entités, clés, kinds).
- **Écrire et lire** des entités via l'émulateur.
- **Interroger** avec des filtres et un tri.
- **Choisir** entre stockage objet (GCS) et base NoSQL (Firestore).
:::

:::lang en
By the end of this guide, you can:

- Handle Cloud Storage **buckets and objects** with `gcloud storage`.
- Choose a **storage class** (Standard/Nearline/Coldline/Archive) by cost.
- Explain **versioning** and **lifecycle** (transitions, auto-deletion).
- Understand the **Firestore/Datastore** model (entities, keys, kinds).
- **Write and read** entities via the emulator.
- **Query** with filters and ordering.
- **Choose** between object storage (GCS) and a NoSQL database (Firestore).
:::

## prerequisites

:::lang fr
- Le guide **GCP fondamentaux** terminé, et le **labo local qui tourne** (émulateurs Pub/Sub & Datastore + fake-gcs, variables exportées).
- **`gcloud`** dans le PATH, et le client Python **`google-cloud-datastore`** (`pip install google-cloud-datastore`).
- Rappel des variables : `CLOUDSDK_AUTH_DISABLE_CREDENTIALS=True`, `CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE=http://localhost:4443/`, `DATASTORE_EMULATOR_HOST=localhost:8081`, et le projet fixé (`gcloud config set project demo-projet`).
:::

:::lang en
- The **GCP fundamentals** guide done, and the **local lab running** (Pub/Sub & Datastore emulators + fake-gcs, variables exported).
- **`gcloud`** on PATH, and the Python client **`google-cloud-datastore`** (`pip install google-cloud-datastore`).
- Variables recap: `CLOUDSDK_AUTH_DISABLE_CREDENTIALS=True`, `CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE=http://localhost:4443/`, `DATASTORE_EMULATOR_HOST=localhost:8081`, and the project set (`gcloud config set project demo-projet`).
:::

## concepts

:::lang fr
**Cloud Storage (objets).** Un **bucket** (conteneur au nom **unique mondial**) contient des **objets** (fichiers + métadonnées, identifiés par une **clé**). Comme S3, S3 est **plat** : `photos/2026/chat.jpg` est une seule clé, pas une hiérarchie de dossiers. On le pilote avec **`gcloud storage`**.

**Classes de stockage.** Quatre niveaux, du plus cher/chaud au moins cher/froid : **Standard** (accès fréquent), **Nearline** (accès < 1×/mois), **Coldline** (< 1×/trimestre), **Archive** (archivage long terme, récupération lente). Plus c'est froid, moins le **stockage** coûte, mais plus la **récupération** est chère/lente. Choisir la bonne classe selon la fréquence d'accès est un pilier du domaine **coût** de l'ACE.

**Versioning.** Activé sur un bucket, il conserve **chaque version** d'un objet à l'écrasement (comme sur S3). Protection n°1 contre l'erreur humaine. Les vieilles versions comptent dans le coût → on les purge avec le cycle de vie.

**Cycle de vie (lifecycle).** Des **règles automatiques** sur un bucket : « après 30 jours, passe en Nearline », « après 365 jours, supprime », « ne garde que 3 versions ». On automatise l'optimisation du coût.

**Firestore / Datastore.** La **base NoSQL** de GCP, entièrement managée, scalable, à faible latence. Deux « modes » : **Datastore** (l'ancien, orienté entités) et **Firestore** (le moderne, orienté documents, avec temps réel) — mêmes fondations. Un **projet** est en mode Datastore **ou** Firestore. L'émulateur Datastore couvre le modèle entités que tu apprendras ici.

**Entités, clés, kinds.** Une **entité** est un enregistrement (comme une ligne). Son **kind** est son type (comme une table : `Produit`, `Client`). Sa **clé** l'identifie de façon unique (kind + identifiant). Pas de schéma fixe : chaque entité a ses **propriétés** (champs typés). On écrit/lit par **clé** (rapide), et on **interroge** par propriété (avec des index).

**Requêtes & index.** Une **requête** filtre les entités d'un kind par propriété (`categorie == "info"`), les trie, les limite. GCP exige un **index** pour chaque motif de requête — simple (auto) ou composite (déclaré). L'émulateur crée les index simples à la volée ; en réel, les composites se déclarent.
:::

:::lang en
**Cloud Storage (objects).** A **bucket** (container with a **globally unique** name) holds **objects** (files + metadata, identified by a **key**). Like S3, it's **flat**: `photos/2026/cat.jpg` is a single key, not a folder hierarchy. You drive it with **`gcloud storage`**.

**Storage classes.** Four tiers, from most expensive/hot to cheapest/cold: **Standard** (frequent access), **Nearline** (accessed < 1×/month), **Coldline** (< 1×/quarter), **Archive** (long-term archival, slow retrieval). The colder it is, the less **storage** costs, but the more **retrieval** costs/is slow. Choosing the right class by access frequency is a pillar of ACE's **cost** domain.

**Versioning.** Enabled on a bucket, it keeps **every version** of an object on overwrite (like S3). The #1 protection against human error. Old versions count in cost → you purge them with lifecycle.

**Lifecycle.** **Automatic rules** on a bucket: "after 30 days, move to Nearline", "after 365 days, delete", "keep only 3 versions". You automate cost optimization.

**Firestore / Datastore.** GCP's **NoSQL database**, fully managed, scalable, low-latency. Two "modes": **Datastore** (the older, entity-oriented) and **Firestore** (the modern, document-oriented, with real-time) — same foundations. A **project** is in Datastore **or** Firestore mode. The Datastore emulator covers the entity model you'll learn here.

**Entities, keys, kinds.** An **entity** is a record (like a row). Its **kind** is its type (like a table: `Produit`, `Client`). Its **key** identifies it uniquely (kind + identifier). No fixed schema: each entity has its **properties** (typed fields). You write/read by **key** (fast), and **query** by property (with indexes).

**Queries & indexes.** A **query** filters a kind's entities by property (`categorie == "info"`), sorts them, limits them. GCP requires an **index** for each query pattern — simple (automatic) or composite (declared). The emulator creates simple indexes on the fly; in real life, composites are declared.
:::

:::figure gcp-storage-choice
caption_fr: "Schéma 1. Choisir le stockage GCP : objets non structurés (fichiers, images) → Cloud Storage, avec classes selon la fréquence d'accès ; données structurées interrogeables → Firestore/Datastore (NoSQL) ; relationnel → Cloud SQL. Le bon service selon la forme de la donnée."
caption_en: "Figure 1. Choosing GCP storage: unstructured objects (files, images) → Cloud Storage, with classes by access frequency; queryable structured data → Firestore/Datastore (NoSQL); relational → Cloud SQL. The right service for the data's shape."
:::

## walkthrough

:::lang fr
On avance ainsi : buckets & objets → classes de stockage → versioning & cycle de vie → modèle Firestore/Datastore → écrire & lire → requêtes → choisir & nettoyage.
:::

:::lang en
We'll go like this: buckets & objects → storage classes → versioning & lifecycle → Firestore/Datastore model → write & read → queries → choose & cleanup.
:::

### step-01

:::lang fr
**Objectif.** Manipuler **buckets et objets** avec `gcloud storage` — le socle (émulé, live).

**🤔 Le modèle plat.** Comme S3, Cloud Storage n'a pas de dossiers : `rapports/2026/q1.txt` est **une clé**. Le préfixe (`rapports/`) sert à **filtrer** un listing. `gcloud storage cp` copie, `ls` liste (avec `--recursive` pour tout à plat).

Crée un bucket et remplis-le :
:::

:::lang en
**Goal.** Handle **buckets and objects** with `gcloud storage` — the foundation (emulated, live).

**🤔 The flat model.** Like S3, Cloud Storage has no folders: `rapports/2026/q1.txt` is **one key**. The prefix (`rapports/`) is for **filtering** a listing. `gcloud storage cp` copies, `ls` lists (with `--recursive` for everything flat).

Create a bucket and fill it:
:::

```bash
# Créer un bucket / create a bucket
gcloud storage buckets create gs://atelier-stockage

# Copier des objets avec des clés "en dossier" / copy objects with "folder" keys
echo "rapport Q1" > q1.txt
gcloud storage cp q1.txt gs://atelier-stockage/rapports/2026/q1.txt
echo "note" > note.txt
gcloud storage cp note.txt gs://atelier-stockage/notes/note.txt

# Lister : un préfixe, puis tout à plat / list: a prefix, then everything flat
gcloud storage ls gs://atelier-stockage/rapports/2026/
gcloud storage ls --recursive gs://atelier-stockage/
```

:::lang fr
**✅ Vérification :** `buckets create` affiche `Creating gs://atelier-stockage/...`. Les `cp` téléversent les deux objets. `ls gs://atelier-stockage/rapports/2026/` liste la clé `rapports/2026/q1.txt`. `ls --recursive` liste **chaque objet par sa clé complète** — tu vois que `rapports/2026/q1.txt` est **une seule** clé, pas trois dossiers. Le modèle est identique à S3 : des clés plates, des préfixes pour filtrer.
:::

:::lang en
**✅ Check:** `buckets create` shows `Creating gs://atelier-stockage/...`. The `cp`s upload both objects. `ls gs://atelier-stockage/rapports/2026/` lists the key `rapports/2026/q1.txt`. `ls --recursive` lists **every object by its full key** — you see that `rapports/2026/q1.txt` is **a single** key, not three folders. The model is identical to S3: flat keys, prefixes to filter.
:::

### step-02

:::lang fr
**Objectif.** Choisir une **classe de stockage** selon le coût — concept + syntaxe.

**🤔 Le domaine « coût » de l'ACE.** Toutes les données ne se valent pas : un fichier consulté 100×/jour va en **Standard** ; une archive légale consultée 1×/an va en **Archive** (stockage très bon marché, mais récupération lente et payante). L'examen te donne un scénario (« logs rarement lus », « sauvegarde à garder 7 ans ») et attend la bonne classe.

⚠️ **Note émulateur :** le traitement de la classe par fake-gcs **dépend de sa version** — certains builds la **stockent et la réaffichent**, d'autres l'ignorent (renvoi vide). Peu importe : les commandes ci-dessous sont la **syntaxe exacte du vrai GCP**, et c'est le **raisonnement de choix** qui compte, pas ce que renvoie l'émulateur. Sur un vrai projet, elles fonctionnent pleinement.

La syntaxe (vrai GCP) :
:::

:::lang en
**Goal.** Choose a **storage class** by cost — concept + syntax.

**🤔 ACE's "cost" domain.** Not all data is equal: a file accessed 100×/day goes to **Standard**; a legal archive accessed 1×/year goes to **Archive** (very cheap storage, but slow, paid retrieval). The exam gives a scenario ("rarely-read logs", "backup to keep 7 years") and expects the right class.

⚠️ **Emulator note:** how fake-gcs handles the class **depends on its version** — some builds **store and echo it back**, others ignore it (empty return). Either way: the commands below are the **exact real-GCP syntax**, and it's the **choice reasoning** that matters, not what the emulator returns. On a real project, they fully work.

The syntax (real GCP):
:::

```bash
# Créer un bucket dans une classe précise / create a bucket in a specific class
gcloud storage buckets create gs://mon-archive --default-storage-class=ARCHIVE --location=europe-west9

# Déposer un objet dans une classe donnée / put an object in a given class
gcloud storage cp gros.log gs://atelier-stockage/logs/gros.log --storage-class=COLDLINE

# Voir la classe (en RÉEL) / see the class (on REAL GCP)
gcloud storage objects describe gs://atelier-stockage/logs/gros.log --format="value(storageClass)"
```

:::lang fr
**✅ Vérification :** sur le **vrai GCP**, `objects describe ... --format="value(storageClass)"` renvoie `COLDLINE`. Sur l'émulateur, tu obtiendras soit `COLDLINE` (le build réaffiche la classe), soit un renvoi vide (build qui l'ignore) — les deux sont normaux. Ce qui compte ici, c'est le **raisonnement de choix** : **fréquent → Standard** ; **mensuel → Nearline** ; **trimestriel → Coldline** ; **annuel / archivage → Archive**. C'est un compromis **coût-de-stockage** (baisse quand on refroidit) vs **coût/délai-de-récupération** (monte quand on refroidit). L'ACE teste ce compromis en permanence.
:::

:::lang en
**✅ Check:** on **real GCP**, `objects describe ... --format="value(storageClass)"` returns `COLDLINE`. On the emulator you'll get either `COLDLINE` (the build echoes the class) or an empty return (a build that ignores it) — both are normal. What matters here is the **choice reasoning**: **frequent → Standard**; **monthly → Nearline**; **quarterly → Coldline**; **yearly / archival → Archive**. It's a **storage-cost** (drops as it gets colder) vs **retrieval-cost/delay** (rises as it gets colder) tradeoff. The ACE tests this tradeoff constantly.
:::

### step-03

:::lang fr
**Objectif.** Comprendre le **versioning** et le **cycle de vie** — concept + syntaxe.

**🤔 Protéger et optimiser.** Le **versioning** garde les anciennes versions d'un objet écrasé (parade à l'erreur humaine). Mais chaque version coûte → une **règle de cycle de vie** purge automatiquement (transition vers une classe froide, suppression après N jours, limitation du nombre de versions). Ensemble : sécurité **et** maîtrise du coût.

⚠️ **Note émulateur :** fake-gcs n'émule ni le versioning ni le cycle de vie. Attends-toi à deux comportements côté labo : `buckets update --versioning` **échoue bruyamment** (après un temps d'attente, une erreur `HTTP 500 : not implemented`), et `--lifecycle-file` passe sans erreur mais n'est **pas** restitué. Ce sont des artefacts du labo, pas des fautes de ta part. La syntaxe ci-dessous est celle du **vrai GCP** — à connaître pour l'ACE.

La syntaxe (vrai GCP) :
:::

:::lang en
**Goal.** Understand **versioning** and **lifecycle** — concept + syntax.

**🤔 Protect and optimize.** **Versioning** keeps old versions of an overwritten object (a fix for human error). But each version costs → a **lifecycle rule** auto-purges (transition to a cold class, deletion after N days, version-count limit). Together: safety **and** cost control.

⚠️ **Emulator note:** fake-gcs emulates neither versioning nor lifecycle. Expect two lab behaviors: `buckets update --versioning` **fails loudly** (after a wait, an `HTTP 500: not implemented` error), and `--lifecycle-file` succeeds silently but is **not** returned back. These are lab artifacts, not mistakes on your part. The syntax below is real GCP's — to know for ACE.

The syntax (real GCP):
:::

```bash
# Activer le versioning / enable versioning
gcloud storage buckets update gs://atelier-stockage --versioning

# Une règle de cycle de vie (fichier JSON) / a lifecycle rule (JSON file)
cat > cycle.json <<'EOF'
{ "rule": [
    { "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
      "condition": {"age": 30} },
    { "action": {"type": "Delete"},
      "condition": {"age": 365} }
] }
EOF
gcloud storage buckets update gs://atelier-stockage --lifecycle-file=cycle.json

# Vérifier (en RÉEL) / verify (on REAL GCP)
gcloud storage buckets describe gs://atelier-stockage --format="value(lifecycle)"
```

:::lang fr
**✅ Vérification :** sur le **vrai GCP**, `buckets describe --format="value(lifecycle)"` réaffiche ta règle (transition à 30 j vers Nearline, suppression à 365 j). Sur l'émulateur, `--versioning` renvoie une erreur `not implemented` et le cycle de vie n'est pas restitué — deux artefacts du labo, attendus. Retiens la logique : **versioning** = filet de sécurité (chaque version conservée) ; **cycle de vie** = automatisation du coût (refroidir puis supprimer selon l'âge). En prod, on active presque toujours les deux ensemble, et on limite le nombre de versions non-courantes pour éviter que le coût enfle.
:::

:::lang en
**✅ Check:** on **real GCP**, `buckets describe --format="value(lifecycle)"` shows your rule (transition at 30 d to Nearline, deletion at 365 d). On the emulator, `--versioning` returns a `not implemented` error and lifecycle isn't returned — two lab artifacts, expected. Remember the logic: **versioning** = safety net (every version kept); **lifecycle** = cost automation (cool then delete by age). In prod, you almost always enable both together, and cap the number of noncurrent versions to keep cost from swelling.
:::

### step-04

:::lang fr
**Objectif.** Découvrir **Firestore/Datastore** : le modèle **entités / clés / kinds**, et écrire tes premières entités — pleinement émulé, live.

**🤔 Le NoSQL de GCP.** Une **entité** (un enregistrement) a un **kind** (son type, ex. `Produit`) et une **clé** (son identifiant). Pas de schéma : chaque entité porte ses propres **propriétés** typées. On pilote l'émulateur avec la **bibliothèque cliente** Python (comme Pub/Sub), via `DATASTORE_EMULATOR_HOST`.

Installe le client et écris des entités :
:::

:::lang en
**Goal.** Discover **Firestore/Datastore**: the **entities / keys / kinds** model, and write your first entities — fully emulated, live.

**🤔 GCP's NoSQL.** An **entity** (a record) has a **kind** (its type, e.g. `Produit`) and a **key** (its identifier). No schema: each entity carries its own typed **properties**. You drive the emulator with the Python **client library** (like Pub/Sub), via `DATASTORE_EMULATOR_HOST`.

Install the client and write entities:
:::

```bash
pip install google-cloud-datastore
# DATASTORE_EMULATOR_HOST=localhost:8081 est déjà exporté (labo) / already exported (lab)
```

```python
# ecrire.py
from google.cloud import datastore
client = datastore.Client(project="demo-projet")

produits = [
    ("p1", {"nom": "clavier", "prix": 49,  "categorie": "info"}),
    ("p2", {"nom": "souris",  "prix": 25,  "categorie": "info"}),
    ("p3", {"nom": "chaise",  "prix": 120, "categorie": "mobilier"}),
]
for id_, props in produits:
    cle = client.key("Produit", id_)          # kind = "Produit", identifiant = id_
    entite = datastore.Entity(key=cle)
    entite.update(props)
    client.put(entite)
print("3 entités 'Produit' écrites")

# Lire une entité par sa clé / read an entity by its key
lu = client.get(client.key("Produit", "p1"))
print("lu p1 :", dict(lu))
```

```bash
python3 ecrire.py
```

:::lang fr
**✅ Vérification :** le script affiche `3 entités 'Produit' écrites` puis `lu p1 : {'categorie': 'info', 'nom': 'clavier', 'prix': 49}` (Datastore restitue les propriétés par ordre alphabétique — le contenu est identique). Tu viens de stocker et relire des données NoSQL **en local**, sans serveur ni schéma déclaré. La **clé** (`Produit` + `p1`) identifie l'entité de façon unique ; `get(clé)` la lit directement (l'accès le plus rapide). ⚠️ Comme S3/DynamoDB, un `put` avec une clé existante **remplace** l'entité entière — pour ne changer qu'une propriété, on relit, on modifie, on réécrit (ou on utilise une transaction).
:::

:::lang en
**✅ Check:** the script prints `3 entités 'Produit' écrites` then `lu p1 : {'categorie': 'info', 'nom': 'clavier', 'prix': 49}` (Datastore returns properties in alphabetical order — the content is identical). You just stored and read back NoSQL data **locally**, with no server or declared schema. The **key** (`Produit` + `p1`) uniquely identifies the entity; `get(key)` reads it directly (the fastest access). ⚠️ Like S3/DynamoDB, a `put` with an existing key **replaces** the whole entity — to change one property, you re-read, modify, rewrite (or use a transaction).
:::

### step-05

:::lang fr
**Objectif.** **Interroger** Datastore : filtrer par propriété et trier — live.

**🤔 Requêtes vs accès par clé.** `get(clé)` lit **une** entité. Pour en lire **plusieurs** selon un critère (« tous les produits de catégorie info », « les moins chers d'abord »), on écrit une **requête** : un `kind`, des **filtres** (`propriété opérateur valeur`), un **tri**. C'est le NoSQL en action.

Écris une requête filtrée et triée :
:::

:::lang en
**Goal.** **Query** Datastore: filter by property and sort — live.

**🤔 Queries vs key access.** `get(key)` reads **one** entity. To read **several** by a criterion ("all products in category info", "cheapest first"), you write a **query**: a `kind`, **filters** (`property operator value`), an **ordering**. It's NoSQL in action.

Write a filtered, sorted query:
:::

```python
# requetes.py
from google.cloud import datastore
from google.cloud.datastore.query import PropertyFilter
client = datastore.Client(project="demo-projet")

# Filtrer : catégorie == "info" / filter: category == "info"
q = client.query(kind="Produit")
q.add_filter(filter=PropertyFilter("categorie", "=", "info"))
infos = list(q.fetch())
print("catégorie info :", [e["nom"] for e in infos])

# Trier : par prix croissant / order: by ascending price
q2 = client.query(kind="Produit")
q2.order = ["prix"]
print("par prix :", [(e["nom"], e["prix"]) for e in q2.fetch()])

# Filtrer + limiter : prix > 40, un seul résultat / filter + limit
q3 = client.query(kind="Produit")
q3.add_filter(filter=PropertyFilter("prix", ">", 40))
print("prix > 40 :", [e["nom"] for e in q3.fetch()])
```

```bash
python3 requetes.py
```

:::lang fr
**✅ Vérification :** le script affiche `catégorie info : ['clavier', 'souris']` (les deux produits info), `par prix : [('souris', 25), ('clavier', 49), ('chaise', 120)]` (tri croissant), et `prix > 40 : ['clavier', 'chaise']`. Tu interroges une base NoSQL **en local**, avec filtres et tri. ⚠️ **Le piège des index :** en réel, une requête qui **combine** un filtre d'inégalité et un tri sur une **autre** propriété exige un **index composite** déclaré (sinon erreur). L'émulateur est plus permissif ; ne te fais pas surprendre en prod — c'est un point d'examen ACE.
:::

:::lang en
**✅ Check:** the script prints `catégorie info : ['clavier', 'souris']` (both info products), `par prix : [('souris', 25), ('clavier', 49), ('chaise', 120)]` (ascending sort), and `prix > 40 : ['clavier', 'chaise']`. You query a NoSQL database **locally**, with filters and sorting. ⚠️ **The index trap:** in real life, a query that **combines** an inequality filter and a sort on **another** property requires a declared **composite index** (else an error). The emulator is more permissive; don't get surprised in prod — it's an ACE exam point.
:::

### step-06

:::lang fr
**Objectif.** **Choisir** le bon stockage — la décision d'architecte.

**🤔 La grille de choix (cœur de l'ACE).** GCP a un service par **forme de données** : des **objets** non structurés (fichiers, images, vidéos, sauvegardes) → **Cloud Storage** (avec la bonne classe selon l'accès) ; des **données structurées interrogeables** à grande échelle, sans jointures complexes → **Firestore/Datastore** (NoSQL) ; du **relationnel** (SQL, transactions, jointures) → **Cloud SQL** / AlloyDB ; de l'**analytique** massif → **BigQuery**. Choisir le mauvais service coûte cher et se paie en performance.

Récapitule ce que tu as construit :
:::

:::lang en
**Goal.** **Choose** the right storage — the architect's decision.

**🤔 The choice grid (ACE core).** GCP has a service per **data shape**: unstructured **objects** (files, images, videos, backups) → **Cloud Storage** (with the right class by access); **queryable structured data** at scale, without complex joins → **Firestore/Datastore** (NoSQL); **relational** (SQL, transactions, joins) → **Cloud SQL** / AlloyDB; massive **analytics** → **BigQuery**. Choosing the wrong service is expensive and costs performance.

Recap what you built:
:::

```bash
# Ce que tu as en stockage objet / what you have in object storage
gcloud storage ls --recursive gs://atelier-stockage/
```

```python
# ...et en base NoSQL / ...and in the NoSQL database
# (rappel : compter les entités d'un kind / recall: count a kind's entities)
from google.cloud import datastore
c = datastore.Client(project="demo-projet")
print("entités Produit :", len(list(c.query(kind="Produit").fetch())))
```

:::lang fr
**✅ Vérification :** `gcloud storage ls --recursive` liste tes objets (`rapports/2026/q1.txt`, `notes/note.txt`), et le comptage NoSQL renvoie `entités Produit : 3`. Tu vois **côte à côte** les deux stockages : des **objets** (fichiers bruts, dans GCS) et des **entités** (données structurées interrogeables, dans Datastore). **La grille à graver** : fichier/média → **Cloud Storage** ; données structurées interrogeables → **Firestore/Datastore** ; relationnel → **Cloud SQL** ; analytique → **BigQuery**. C'est exactement le type de question que l'ACE pose (« quel service pour ce besoin ? »).
:::

:::lang en
**✅ Check:** `gcloud storage ls --recursive` lists your objects (`rapports/2026/q1.txt`, `notes/note.txt`), and the NoSQL count returns `entités Produit : 3`. You see the two storages **side by side**: **objects** (raw files, in GCS) and **entities** (queryable structured data, in Datastore). **The grid to engrave**: file/media → **Cloud Storage**; queryable structured data → **Firestore/Datastore**; relational → **Cloud SQL**; analytics → **BigQuery**. It's exactly the kind of question the ACE asks ("which service for this need?").
:::

### step-07

:::lang fr
**Objectif.** Nettoyer ton stockage.

**🤔 L'hygiène.** On supprime les objets et le bucket, et on efface les entités Datastore. Réflexe **créer → utiliser → nettoyer**, crucial en réel.

Nettoie :
:::

:::lang en
**Goal.** Clean up your storage.

**🤔 Hygiene.** We delete the objects and the bucket, and erase the Datastore entities. **Create → use → clean up** reflex, crucial in real life.

Clean up:
:::

```bash
# Cloud Storage : objets puis bucket / objects then bucket
gcloud storage rm gs://atelier-stockage/**
gcloud storage buckets delete gs://atelier-stockage
```

```python
# Datastore : supprimer les entités / delete the entities
from google.cloud import datastore
c = datastore.Client(project="demo-projet")
for id_ in ["p1", "p2", "p3"]:
    c.delete(c.key("Produit", id_))
print("entités supprimées :", len(list(c.query(kind="Produit").fetch())), "restantes")
```

:::lang fr
**✅ Vérification :** après suppression, `gcloud storage ls` ne montre plus `atelier-stockage`, et le comptage Datastore renvoie `0 restantes`. Ton stockage est rangé. ⚠️ **Rappel émulateur :** contre fake-gcs, `rm gs://.../**` (une fois **par objet**) **et** `buckets delete` peuvent afficher `ERROR: 'NoneType' object has no attribute 'items'` avec un **code de sortie non nul** — alors même que la suppression a bien eu lieu. C'est un artefact du labo (inexistant sur le vrai GCP) : ne t'y fie pas, vérifie le résultat réel avec `gcloud storage ls`. Tu maîtrises maintenant les deux stockages GCP essentiels. La suite : la messagerie Pub/Sub en profondeur.
:::

:::lang en
**✅ Check:** after deletion, `gcloud storage ls` no longer shows `atelier-stockage`, and the Datastore count returns `0 restantes`. Your storage is tidy. ⚠️ **Emulator reminder:** against fake-gcs, both `rm gs://.../**` (once **per object**) **and** `buckets delete` may print `ERROR: 'NoneType' object has no attribute 'items'` with a **non-zero exit code** — even though the deletion actually happened. It's a lab artifact (nonexistent on real GCP): don't trust the exit code, confirm the real result with `gcloud storage ls`. You now master the two essential GCP storages. Next up: Pub/Sub messaging in depth.
:::

## pitfalls

:::lang fr
**1. Croire que les préfixes sont des dossiers.** Cloud Storage est plat : `a/b/c.txt` est **une clé**. Supprimer « le dossier » = supprimer tous les objets qui partagent ce préfixe.

**2. Choisir Archive pour des données consultées souvent.** Archive/Coldline sont bon marché **au stockage** mais chers/lents **à la récupération**. Pour de l'accès fréquent, c'est un contresens : Standard revient moins cher au total.

**3. Attendre que fake-gcs émule les classes/versioning/cycle de vie.** L'émulateur couvre les **opérations de base** (objets), pas ces métadonnées avancées. Tu apprends la **syntaxe** ici ; l'effet réel n'a lieu que sur le vrai GCP.

**4. Confondre `get(clé)` et requête.** `get(clé)` lit **une** entité par sa clé (rapide, pas d'index). Une **requête** lit **plusieurs** entités par propriété (nécessite un index). Deux mécanismes distincts.

**5. Oublier les index composites (en réel).** Une requête combinant inégalité **et** tri sur une autre propriété exige un **index composite** déclaré. L'émulateur pardonne ; le vrai GCP renvoie une erreur avec le lien pour créer l'index.

**6. Mettre des données relationnelles dans Datastore.** Pas de jointures en NoSQL. Si ton modèle a des relations complexes et des transactions multi-tables, c'est **Cloud SQL**, pas Firestore.

**7. Nom de bucket non unique (en réel).** Comme S3, les noms GCS sont **mondiaux**. Préfixe. En local (fake-gcs), pas de collision.
:::

:::lang en
**1. Thinking prefixes are folders.** Cloud Storage is flat: `a/b/c.txt` is **one key**. Deleting "the folder" = deleting all objects sharing that prefix.

**2. Choosing Archive for frequently-accessed data.** Archive/Coldline are cheap **to store** but expensive/slow **to retrieve**. For frequent access, it's a mistake: Standard is cheaper overall.

**3. Expecting fake-gcs to emulate classes/versioning/lifecycle.** The emulator covers **basic operations** (objects), not these advanced metadata. You learn the **syntax** here; the real effect only happens on real GCP.

**4. Confusing `get(key)` and a query.** `get(key)` reads **one** entity by its key (fast, no index). A **query** reads **several** entities by property (needs an index). Two distinct mechanisms.

**5. Forgetting composite indexes (in real life).** A query combining an inequality **and** a sort on another property requires a declared **composite index**. The emulator forgives; real GCP returns an error with the link to create the index.

**6. Putting relational data in Datastore.** No joins in NoSQL. If your model has complex relationships and multi-table transactions, it's **Cloud SQL**, not Firestore.

**7. Non-unique bucket name (in real life).** Like S3, GCS names are **global**. Prefix. Locally (fake-gcs), no collision.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées un bucket, y déposes des objets avec des clés « en dossier », listes avec `--recursive`.
- [ ] Tu cites la bonne **classe** (Standard/Nearline/Coldline/Archive) pour un scénario.
- [ ] Tu expliques versioning + cycle de vie et écris une règle JSON.
- [ ] Tu écris et lis une **entité** Datastore par sa clé.
- [ ] Tu **interroges** avec un filtre (`PropertyFilter`) et un tri.
- [ ] Tu connais le piège des **index composites**.
- [ ] Tu choisis GCS vs Firestore vs Cloud SQL vs BigQuery selon la donnée.

Sept cases = tu tiens le stockage GCP au niveau ACE. La suite : Pub/Sub en profondeur.
:::

:::lang en
You know it works when…

- [ ] You create a bucket, drop objects with "folder" keys, list with `--recursive`.
- [ ] You name the right **class** (Standard/Nearline/Coldline/Archive) for a scenario.
- [ ] You explain versioning + lifecycle and write a JSON rule.
- [ ] You write and read a Datastore **entity** by its key.
- [ ] You **query** with a filter (`PropertyFilter`) and a sort.
- [ ] You know the **composite index** trap.
- [ ] You choose GCS vs Firestore vs Cloud SQL vs BigQuery by the data.

Seven boxes = you hold GCP storage at ACE level. Next up: Pub/Sub in depth.
:::

## next

:::lang fr
La suite du track GCP → ACE :

1. **GCP — messagerie Pub/Sub** : sujets, abonnements pull et push, accusés de réception, dead-letter, patterns événementiels — via l'émulateur, en profondeur.
2. Plus loin : IAM & Terraform, le **projet d'entreprise** événementiel, puis **passer en réel**.
:::

:::lang en
The GCP → ACE track continues:

1. **GCP — Pub/Sub messaging**: topics, pull and push subscriptions, acknowledgements, dead-letter, event-driven patterns — via the emulator, in depth.
2. Further along: IAM & Terraform, the event-driven **enterprise project**, then **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire stockage GCP.
:::

:::lang en
GCP storage cheat sheet.
:::

```bash
# Cloud Storage (gcloud storage)
gcloud storage buckets create gs://b [--default-storage-class=NEARLINE] [--location=europe-west9]
gcloud storage cp f gs://b/cle [--storage-class=COLDLINE]
gcloud storage ls --recursive gs://b/
gcloud storage rm gs://b/**   ;  gcloud storage buckets delete gs://b
# Versioning & cycle de vie (vrai GCP) / versioning & lifecycle (real GCP)
gcloud storage buckets update gs://b --versioning
gcloud storage buckets update gs://b --lifecycle-file=cycle.json
```

```python
# Firestore/Datastore (client Python, DATASTORE_EMULATOR_HOST)
from google.cloud import datastore
from google.cloud.datastore.query import PropertyFilter
c = datastore.Client(project="demo-projet")
c.put(datastore.Entity(key=c.key("Produit","p1")) | ...)   # écrire / write
c.get(c.key("Produit","p1"))                               # lire par clé / read by key
q = c.query(kind="Produit"); q.add_filter(filter=PropertyFilter("prix",">",40)); q.order=["prix"]
list(q.fetch())                                            # interroger / query
```

## resources

:::lang fr
- [Cloud Storage — documentation](https://cloud.google.com/storage/docs) — buckets, objets, `gcloud storage`.
- [Classes de stockage](https://cloud.google.com/storage/docs/storage-classes) — Standard/Nearline/Coldline/Archive.
- [Gestion du cycle de vie](https://cloud.google.com/storage/docs/lifecycle) — transitions, suppression.
- [Datastore / Firestore en mode Datastore](https://cloud.google.com/datastore/docs) — entités, requêtes, index.
- [Émulateur Datastore](https://cloud.google.com/datastore/docs/tools/datastore-emulator) — le labo local.
:::

:::lang en
- [Cloud Storage — documentation](https://cloud.google.com/storage/docs) — buckets, objects, `gcloud storage`.
- [Storage classes](https://cloud.google.com/storage/docs/storage-classes) — Standard/Nearline/Coldline/Archive.
- [Lifecycle management](https://cloud.google.com/storage/docs/lifecycle) — transitions, deletion.
- [Datastore / Firestore in Datastore mode](https://cloud.google.com/datastore/docs) — entities, queries, indexes.
- [Datastore emulator](https://cloud.google.com/datastore/docs/tools/datastore-emulator) — the local lab.
:::

## troubleshooting

:::lang fr
**`gcloud storage` : le bucket n'est pas listé après création.** Vérifie que fake-gcs tourne (`docker ps`) et l'override d'endpoint. Sur l'émulateur, certaines métadonnées (classe, versioning) ne reviennent pas — c'est normal.

**`objects describe ... storageClass` renvoie vide (ou `COLDLINE`).** Selon la version de fake-gcs, la classe est stockée et réaffichée, ou ignorée (renvoi vide) — les deux sont normaux en labo. La syntaxe est correcte pour le vrai GCP ; ici, on apprend la commande.

**`buckets update --versioning` : `HTTP 500: not implemented`.** fake-gcs n'implémente pas le versioning ; la commande échoue (après un temps d'attente) sur l'émulateur. C'est attendu — la syntaxe reste correcte pour le vrai GCP. Passe à l'étape suivante.

**`rm` ou `buckets delete` : `ERROR: 'NoneType' object has no attribute 'items'` (code non nul).** Artefact de fake-gcs : la suppression a bien eu lieu malgré l'erreur. Confirme avec `gcloud storage ls`. Inexistant sur le vrai GCP.

**Le client Datastore vise le vrai GCP (erreur d'auth).** `DATASTORE_EMULATOR_HOST=localhost:8081` n'est pas exporté dans **ce** shell. Ré-exporte-le.

**`add_filter` affiche un avertissement de dépréciation.** Utilise l'API moderne : `from google.cloud.datastore.query import PropertyFilter` puis `q.add_filter(filter=PropertyFilter("champ", "=", valeur))`.

**Ma requête renvoie une erreur d'index (en réel).** Le vrai GCP exige un **index composite** pour certains motifs (inégalité + tri sur une autre propriété). Le message d'erreur contient un lien pour le créer. L'émulateur, lui, est permissif.

**`put` avec une clé existante écrase tout.** C'est le comportement : `put` remplace l'entité entière. Pour modifier une propriété, relis puis réécris, ou utilise une transaction.
:::

:::lang en
**`gcloud storage`: the bucket isn't listed after creation.** Check fake-gcs is running (`docker ps`) and the endpoint override. On the emulator, some metadata (class, versioning) doesn't come back — that's normal.

**`objects describe ... storageClass` returns empty (or `COLDLINE`).** Depending on the fake-gcs version, the class is stored and echoed back, or ignored (empty return) — both are normal in the lab. The syntax is correct for real GCP; here, we learn the command.

**`buckets update --versioning`: `HTTP 500: not implemented`.** fake-gcs doesn't implement versioning; the command fails (after a wait) on the emulator. That's expected — the syntax stays correct for real GCP. Move on to the next step.

**`rm` or `buckets delete`: `ERROR: 'NoneType' object has no attribute 'items'` (non-zero exit).** A fake-gcs artifact: the deletion did happen despite the error. Confirm with `gcloud storage ls`. Nonexistent on real GCP.

**The Datastore client targets real GCP (auth error).** `DATASTORE_EMULATOR_HOST=localhost:8081` isn't exported in **this** shell. Re-export it.

**`add_filter` prints a deprecation warning.** Use the modern API: `from google.cloud.datastore.query import PropertyFilter` then `q.add_filter(filter=PropertyFilter("field", "=", value))`.

**My query returns an index error (in real life).** Real GCP requires a **composite index** for some patterns (inequality + sort on another property). The error message contains a link to create it. The emulator is permissive.

**`put` with an existing key overwrites everything.** That's the behavior: `put` replaces the whole entity. To modify one property, re-read then rewrite, or use a transaction.
:::
