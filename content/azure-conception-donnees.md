---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-conception-donnees
slug: azure-conception-donnees
order: 66
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — conception des données (AZ-305) : SQL, Cosmos, cache"
title_en: "Azure — data design (AZ-305): SQL, Cosmos, cache"
tagline_fr: "relationnel, NoSQL, cohérence, partitionnement, cache."
tagline_en: "relational, NoSQL, consistency, partitioning, cache."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 260
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-architecture-well-architected]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [azure-sql, postgresql, cosmos-db, niveaux-coherence, cle-de-partition, unites-requete, cache-redis, choix-de-stockage, az-305]
concepts_en: [azure-sql, postgresql, cosmos-db, consistency-levels, partition-key, request-units, redis-cache, storage-selection, az-305]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "La conception des données Azure pour l'AZ-305 : choisir et concevoir le bon stockage. On déploie EN LOCAL sur miniblue une base relationnelle (Azure SQL serveur + base), du NoSQL (documents Cosmos DB), du relationnel open-source (PostgreSQL) et un cache Redis ; on décrit en Bicep un compte Cosmos avec niveau de cohérence, clé de partition et débit autoscale (RU/s). Puis on grave les décisions d'architecte : relationnel vs NoSQL, cohérence vs latence, partitionnement, quand mettre un cache. Sans compte ni facture."
og_description_en: "Azure data design for AZ-305: choosing and designing the right storage. We deploy LOCALLY on miniblue a relational database (Azure SQL server + database), NoSQL (Cosmos DB documents), open-source relational (PostgreSQL) and a Redis cache; we describe in Bicep a Cosmos account with consistency level, partition key and autoscale throughput (RU/s). Then we engrave the architect decisions: relational vs NoSQL, consistency vs latency, partitioning, when to add a cache. No account or bill."
---

## intro

:::lang fr
« Quelle base pour ce besoin ? » — c'est la question la plus fréquente de l'examen **AZ-305**, et l'une des plus lourdes de conséquences en production. Choisir **Azure SQL** quand il fallait **Cosmos DB** (ou l'inverse) se paie en refonte, en coût et en performance. Ce guide fait de toi un architecte des données : tu apprends à **choisir**, à **concevoir** et à **régler** le stockage Azure.

On travaille **en pratique** sur miniblue : tu déploies une base **relationnelle** (Azure SQL, serveur + base), du **NoSQL** (documents **Cosmos DB**), une base **relationnelle open-source** (**PostgreSQL**) et un **cache Redis** — tous **en live**. Puis tu décris en **Bicep** un compte Cosmos avec ses **décisions d'architecte** : le **niveau de cohérence** (le compromis cohérence ↔ latence), la **clé de partition** (la distribution/échelle) et le **débit autoscale** (RU/s, l'élasticité et le coût). Enfin, tu graves les **grilles de choix** et les **concepts** (cohérence, partitionnement) que l'AZ-305 teste sans relâche.

C'est le deuxième guide du track **AZ-305**, après le Well-Architected Framework. La donnée est le cœur de toute architecture — la concevoir juste, c'est la moitié du travail d'architecte.

**Pour qui c'est :** tu as fait le guide *architecture (WAF)* et tu veux la conception des données en profondeur.

**Quand ce n'est PAS le bon choix :**

- Tu débutes sur le stockage → revois *AZ-104 stockage* d'abord (comptes, Blob).
- Tu cherches l'administration d'une base (sauvegarde, tuning) → ici c'est le **choix** et la **conception**, pas l'exploitation fine.
:::

:::lang en
"Which database for this need?" — it's the AZ-305 exam's most frequent question, and one of the most consequential in production. Choosing **Azure SQL** when you needed **Cosmos DB** (or vice versa) is paid for in rewrites, cost and performance. This guide makes you a data architect: you learn to **choose**, **design** and **tune** Azure storage.

We work **hands-on** on miniblue: you deploy a **relational** database (Azure SQL, server + database), **NoSQL** (**Cosmos DB** documents), an **open-source relational** database (**PostgreSQL**) and a **Redis cache** — all **live**. Then you describe in **Bicep** a Cosmos account with its **architect decisions**: the **consistency level** (the consistency ↔ latency tradeoff), the **partition key** (distribution/scale) and the **autoscale throughput** (RU/s, elasticity and cost). Finally, you engrave the **choice grids** and **concepts** (consistency, partitioning) the AZ-305 tests relentlessly.

This is the second guide of the **AZ-305** track, after the Well-Architected Framework. Data is the heart of any architecture — designing it right is half the architect's job.

**Who it's for:** you've done the *architecture (WAF)* guide and want data design in depth.

**When it's NOT the right choice:**

- You're new to storage → review *AZ-104 storage* first (accounts, Blob).
- You want database administration (backup, tuning) → here it's the **choice** and **design**, not fine operations.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Choisir entre **relationnel**, **NoSQL**, **objet** et **cache** selon la donnée.
- Déployer une base **Azure SQL** (serveur + base) et une base **PostgreSQL**.
- Créer et interroger des **documents Cosmos DB** (NoSQL).
- Expliquer les **niveaux de cohérence** (fort → éventuel) et leur compromis.
- Choisir une **clé de partition** et comprendre les **RU/s**.
- Mettre un **cache Redis** (cache-aside) devant une base.
- Décrire un compte Cosmos complet en **Bicep** (cohérence, partition, autoscale).
:::

:::lang en
By the end of this guide, you can:

- Choose between **relational**, **NoSQL**, **object** and **cache** by the data.
- Deploy an **Azure SQL** database (server + database) and a **PostgreSQL** database.
- Create and query **Cosmos DB documents** (NoSQL).
- Explain the **consistency levels** (strong → eventual) and their tradeoff.
- Choose a **partition key** and understand **RU/s**.
- Put a **Redis cache** (cache-aside) in front of a database.
- Describe a full Cosmos account in **Bicep** (consistency, partition, autoscale).
:::

## prerequisites

:::lang fr
- Le guide **Azure architecture (WAF)** terminé.
- **miniblue** qui tourne (`azlocal health`), **Bicep** installé.
- Rappel : les services de données se créent via `azlocal` (live) ; les configs avancées (cohérence, partition) se décrivent en **Bicep**.
:::

:::lang en
- The **Azure architecture (WAF)** guide done.
- **miniblue** running (`azlocal health`), **Bicep** installed.
- Reminder: data services are created via `azlocal` (live); advanced configs (consistency, partition) are described in **Bicep**.
:::

## concepts

:::lang fr
**Les familles de stockage.** GCP, AWS, Azure : même logique, un service par **forme de donnée**. **Relationnel** (tables, schéma fort, transactions ACID, jointures) → **Azure SQL**, **PostgreSQL**, **MySQL**. **NoSQL** (documents/clé-valeur, schéma souple, échelle massive) → **Cosmos DB**. **Objet** (fichiers non structurés) → **Blob Storage**. **Cache** (mémoire ultra-rapide) → **Azure Cache for Redis**. **Analytique** (entrepôt, requêtes massives) → **Synapse / Fabric**. Choisir, c'est partir de la **donnée** et des **besoins** (cohérence, latence, échelle, coût).

**Azure SQL — les options.** Trois formes : **Single Database** (une base isolée, la plus courante), **Elastic Pool** (plusieurs bases partageant des ressources, économique pour des charges variables), **Managed Instance** (compatibilité quasi-totale avec SQL Server on-premises, pour la migration). Tarification : **DTU** (unités groupées, simple) ou **vCore** (CPU/mémoire séparés, flexible, réservations possibles).

**Cosmos DB — le NoSQL mondial.** Base NoSQL managée, distribution **multi-région**, faible latence garantie par SLA. Plusieurs **API** (Core/SQL pour documents, MongoDB, Cassandra, Gremlin, Table). Trois notions d'architecte :

- **Niveaux de cohérence.** Le compromis **cohérence ↔ latence/dispo**, du plus fort au plus faible : **Strong** (linéarisable, lecture toujours à jour, plus lent), **Bounded Staleness** (retard borné), **Session** (cohérent pour une session — **le défaut**, bon équilibre), **Consistent Prefix** (ordre respecté), **Eventual** (le plus rapide/disponible, peut lire une valeur ancienne). L'architecte choisit selon le besoin.
- **Clé de partition.** Cosmos distribue les données par **partitions logiques** selon une **clé** (`/clientId`, `/region`…). Une **bonne** clé répartit uniformément la charge (cardinalité élevée, accès équilibrés) ; une **mauvaise** crée un « hot partition ». **Décision structurante et difficile à changer.**
- **RU/s (Request Units).** Le débit se mesure en **unités de requête par seconde** — l'unité de coût/performance de Cosmos. On provisionne un débit (fixe ou **autoscale**, qui ajuste entre un min et un max). Trop peu → throttling ; trop → gaspillage.

**Le cache.** Un **cache Redis** en mémoire, placé **devant** la base, sert les données chaudes en < 1 ms et décharge la base. Pattern **cache-aside** : l'appli regarde le cache ; si absent (miss), elle lit la base et **remplit** le cache. Attention à l'**invalidation** (garder le cache cohérent avec la base) — « le plus dur en informatique ».

**Migration.** Faire venir des données existantes : **Azure Database Migration Service**, la **réplication**, ou l'export/import. Managed Instance facilite la migration SQL Server. C'est un thème AZ-305 (concevoir la **transition**).

**Ce qui est live ici.** SQL (serveur + base), PostgreSQL, documents Cosmos et cache Redis sont **déployés en live** sur miniblue via `azlocal`. Les **réglages fins** de Cosmos (cohérence, partition, autoscale) se décrivent et **valident en Bicep** — la forme exacte du vrai Azure.
:::

:::lang en
**The storage families.** GCP, AWS, Azure: same logic, one service per **data shape**. **Relational** (tables, strong schema, ACID transactions, joins) → **Azure SQL**, **PostgreSQL**, **MySQL**. **NoSQL** (documents/key-value, flexible schema, massive scale) → **Cosmos DB**. **Object** (unstructured files) → **Blob Storage**. **Cache** (ultra-fast memory) → **Azure Cache for Redis**. **Analytics** (warehouse, massive queries) → **Synapse / Fabric**. Choosing means starting from the **data** and the **requirements** (consistency, latency, scale, cost).

**Azure SQL — the options.** Three forms: **Single Database** (an isolated database, the most common), **Elastic Pool** (several databases sharing resources, economical for variable loads), **Managed Instance** (near-full compatibility with on-premises SQL Server, for migration). Pricing: **DTU** (bundled units, simple) or **vCore** (separate CPU/memory, flexible, reservations possible).

**Cosmos DB — global NoSQL.** Managed NoSQL database, **multi-region** distribution, SLA-guaranteed low latency. Several **APIs** (Core/SQL for documents, MongoDB, Cassandra, Gremlin, Table). Three architect notions:

- **Consistency levels.** The **consistency ↔ latency/availability** tradeoff, from strongest to weakest: **Strong** (linearizable, reads always current, slower), **Bounded Staleness** (bounded lag), **Session** (consistent within a session — **the default**, good balance), **Consistent Prefix** (order preserved), **Eventual** (fastest/most available, may read a stale value). The architect chooses by the need.
- **Partition key.** Cosmos distributes data into **logical partitions** by a **key** (`/clientId`, `/region`…). A **good** key spreads load evenly (high cardinality, balanced access); a **bad** one creates a "hot partition". **A structuring decision, hard to change.**
- **RU/s (Request Units).** Throughput is measured in **request units per second** — Cosmos's cost/performance unit. You provision throughput (fixed or **autoscale**, which adjusts between a min and a max). Too little → throttling; too much → waste.

**The cache.** A Redis **cache** in memory, placed **in front of** the database, serves hot data in < 1 ms and offloads the database. **Cache-aside** pattern: the app checks the cache; on a miss, it reads the database and **fills** the cache. Watch **invalidation** (keeping the cache consistent with the database) — "the hardest thing in computing".

**Migration.** Bringing in existing data: **Azure Database Migration Service**, **replication**, or export/import. Managed Instance eases SQL Server migration. It's an AZ-305 theme (designing the **transition**).

**What's live here.** SQL (server + database), PostgreSQL, Cosmos documents and Redis cache are **deployed live** on miniblue via `azlocal`. Cosmos's **fine settings** (consistency, partition, autoscale) are described and **validated in Bicep** — the exact shape of real Azure.
:::

:::figure azure-donnees-choix
caption_fr: "Schéma 1. Choisir le stockage de données Azure : relationnel/ACID/jointures → Azure SQL / PostgreSQL / MySQL ; NoSQL mondial/faible latence → Cosmos DB (niveau de cohérence, clé de partition, RU/s) ; objets/fichiers → Blob ; lecture ultra-rapide → cache Redis devant la base ; analytique → Synapse. Le bon service selon la forme de la donnée et les besoins."
caption_en: "Figure 1. Choosing Azure data storage: relational/ACID/joins → Azure SQL / PostgreSQL / MySQL; global NoSQL/low latency → Cosmos DB (consistency level, partition key, RU/s); objects/files → Blob; ultra-fast reads → Redis cache in front of the database; analytics → Synapse. The right service by the data's shape and requirements."
:::

## walkthrough

:::lang fr
On avance ainsi : base relationnelle SQL → NoSQL Cosmos → PostgreSQL → cache Redis → conception Cosmos en Bicep → grilles & concepts → nettoyage.
:::

:::lang en
We'll go like this: relational SQL database → NoSQL Cosmos → PostgreSQL → Redis cache → Cosmos design in Bicep → grids & concepts → cleanup.
:::

### step-01

:::lang fr
**Objectif.** Déployer une base **relationnelle Azure SQL** — serveur + base, en live.

**🤔 Le relationnel, valeur sûre.** Pour des données **structurées** avec des **relations** et des **transactions** (commandes, comptes, stocks), le relationnel s'impose : schéma fort, **ACID**, jointures, SQL. On crée un **serveur** logique puis une **base** dessus.

Crée le serveur et la base :
:::

:::lang en
**Goal.** Deploy a **relational Azure SQL** database — server + database, live.

**🤔 Relational, a safe bet.** For **structured** data with **relations** and **transactions** (orders, accounts, inventory), relational wins: strong schema, **ACID**, joins, SQL. We create a logical **server** then a **database** on it.

Create the server and the database:
:::

```bash
azlocal group create --name rg-data --location westeurope

# Serveur SQL logique + base / logical SQL server + database
azlocal sql server create --name sqlsrv-archi --resource-group rg-data
azlocal sql database create --server sqlsrv-archi --name commandesdb --resource-group rg-data
azlocal sql database list --server sqlsrv-archi --resource-group rg-data
```

:::lang fr
**✅ Vérification :** `sql server create` renvoie un serveur `Ready` (version 12.0), `sql database create` une base `commandesdb` `Succeeded`, et `database list` la montre. Tu as une base **relationnelle** prête pour des données transactionnelles. Retiens les **options** (à choisir en réel) : **Single Database** (isolée, courant), **Elastic Pool** (mutualisée, coût variable), **Managed Instance** (compatibilité SQL Server, migration). Et la **tarification** : **DTU** (simple) ou **vCore** (flexible). ⚠️ Le **serveur** SQL est un conteneur logique (endpoint + admin), la **base** est la donnée — deux objets distincts.
:::

:::lang en
**✅ Check:** `sql server create` returns a `Ready` server (version 12.0), `sql database create` a `Succeeded` `commandesdb` database, and `database list` shows it. You have a **relational** database ready for transactional data. Remember the **options** (to choose for real): **Single Database** (isolated, common), **Elastic Pool** (shared, variable cost), **Managed Instance** (SQL Server compatibility, migration). And the **pricing**: **DTU** (simple) or **vCore** (flexible). ⚠️ The SQL **server** is a logical container (endpoint + admin), the **database** is the data — two distinct objects.
:::

### step-02

:::lang fr
**Objectif.** Créer et interroger des **documents Cosmos DB** — le NoSQL, en live.

**🤔 Le NoSQL, pour l'échelle et la souplesse.** Pour des données **semi-structurées** (profils, catalogues, événements) à **grande échelle** et **faible latence mondiale**, on choisit **Cosmos DB** : pas de schéma fixe, distribution multi-région. On crée des **documents** dans une **base** et un **conteneur** (collection).

Crée et liste des documents :
:::

:::lang en
**Goal.** Create and query **Cosmos DB documents** — NoSQL, live.

**🤔 NoSQL, for scale and flexibility.** For **semi-structured** data (profiles, catalogs, events) at **large scale** and **low global latency**, you choose **Cosmos DB**: no fixed schema, multi-region distribution. We create **documents** in a **database** and a **container** (collection).

Create and list documents:
:::

```bash
# Créer des documents (data plane) / create documents (data plane)
azlocal cosmosdb doc create --account cosmos-archi --database appdb \
  --collection commandes --id cmd-1001 --resource-group rg-data
azlocal cosmosdb doc create --account cosmos-archi --database appdb \
  --collection commandes --id cmd-1002 --resource-group rg-data

# Lister les documents / list the documents
azlocal cosmosdb doc list --account cosmos-archi --database appdb \
  --collection commandes --resource-group rg-data
```

:::lang fr
**✅ Vérification :** chaque `doc create` renvoie l'`id` du document (`cmd-1001`, `cmd-1002`), et `doc list` renvoie un objet `Documents` contenant les deux. Tu viens de stocker du **NoSQL** — sans schéma déclaré, chaque document pouvant avoir sa propre forme. C'est la souplesse de Cosmos. ⚠️ **Décisions d'architecte à venir** (étape 5) : le **niveau de cohérence** (à quel point les lectures sont à jour), la **clé de partition** (comment les données se distribuent) et les **RU/s** (le débit provisionné). Ces réglages font ou défont la performance et le coût — on les conçoit en Bicep.
:::

:::lang en
**✅ Check:** each `doc create` returns the document's `id` (`cmd-1001`, `cmd-1002`), and `doc list` returns a `Documents` object containing both. You just stored **NoSQL** — with no declared schema, each document able to have its own shape. That's Cosmos's flexibility. ⚠️ **Architect decisions to come** (step 5): the **consistency level** (how up-to-date reads are), the **partition key** (how data distributes) and the **RU/s** (the provisioned throughput). These settings make or break performance and cost — we design them in Bicep.
:::

### step-03

:::lang fr
**Objectif.** Déployer **PostgreSQL** — l'option relationnelle open-source, en live.

**🤔 Relationnel, mais lequel ?** Azure propose trois moteurs relationnels managés : **Azure SQL** (moteur Microsoft), **PostgreSQL** et **MySQL** (open-source, « Flexible Server »). Le choix dépend de l'**écosystème** (une appli PostgreSQL existante → PostgreSQL managé) et des fonctionnalités.

Crée un serveur PostgreSQL :
:::

:::lang en
**Goal.** Deploy **PostgreSQL** — the open-source relational option, live.

**🤔 Relational, but which one?** Azure offers three managed relational engines: **Azure SQL** (Microsoft engine), **PostgreSQL** and **MySQL** (open-source, "Flexible Server"). The choice depends on the **ecosystem** (an existing PostgreSQL app → managed PostgreSQL) and features.

Create a PostgreSQL server:
:::

```bash
azlocal postgres server create --name pg-archi --resource-group rg-data
azlocal postgres server list --resource-group rg-data
```

:::lang fr
**✅ Vérification :** `postgres server create` renvoie un serveur `pg-archi` `Succeeded`, listé par `server list`. Tu offres maintenant les **trois moteurs relationnels** en réflexe. Retiens la grille : **Azure SQL** pour l'écosystème Microsoft/.NET et la compatibilité SQL Server ; **PostgreSQL** pour l'open-source riche (extensions, JSON) ; **MySQL** pour les applis web classiques (LAMP, WordPress). ⚠️ Tous trois sont **managés** (Azure gère patchs, sauvegardes, HA) — l'architecte choisit le **moteur**, pas la gestion du serveur. Le mode **Flexible Server** est le déploiement moderne recommandé (contrôle de la maintenance, zones de dispo).
:::

:::lang en
**✅ Check:** `postgres server create` returns a `Succeeded` `pg-archi` server, listed by `server list`. You now offer the **three relational engines** as a reflex. Remember the grid: **Azure SQL** for the Microsoft/.NET ecosystem and SQL Server compatibility; **PostgreSQL** for rich open-source (extensions, JSON); **MySQL** for classic web apps (LAMP, WordPress). ⚠️ All three are **managed** (Azure handles patches, backups, HA) — the architect chooses the **engine**, not server management. **Flexible Server** mode is the recommended modern deployment (maintenance control, availability zones).
:::

### step-04

:::lang fr
**Objectif.** Ajouter un **cache Redis** — le pilier performance, en live.

**🤔 Décharger la base.** Une base sous forte charge de **lecture** ralentit et coûte. On met un **cache Redis** **devant** : les données chaudes (un catalogue, une session) sont servies en mémoire. Pattern **cache-aside** : l'appli lit le cache ; si absent, elle lit la base et remplit le cache.

Crée le cache :
:::

:::lang en
**Goal.** Add a **Redis cache** — the performance pillar, live.

**🤔 Offload the database.** A database under heavy **read** load slows down and costs. You put a **Redis cache** **in front**: hot data (a catalog, a session) is served from memory. **Cache-aside** pattern: the app reads the cache; on a miss, it reads the database and fills the cache.

Create the cache:
:::

```bash
azlocal redis create --name redis-archi --resource-group rg-data
azlocal redis list --resource-group rg-data
```

:::lang fr
**✅ Vérification :** `redis create` renvoie un cache `redis-archi` `Succeeded` (Redis 7.x, ports 6379/6380). Ton architecture de données combine désormais **durabilité** (SQL/Cosmos) et **vitesse** (Redis). Analyse WAF : **performance** (lectures chaudes en < 1 ms) et **coût** (moins de charge sur la base = base plus petite). ⚠️ **Le piège du cache : l'invalidation.** Quand la donnée change en base, le cache doit être **mis à jour ou invalidé**, sinon on sert une valeur périmée. Stratégies : expiration (TTL), invalidation à l'écriture (write-through). C'est un vrai sujet de conception.
:::

:::lang en
**✅ Check:** `redis create` returns a `Succeeded` `redis-archi` cache (Redis 7.x, ports 6379/6380). Your data architecture now combines **durability** (SQL/Cosmos) and **speed** (Redis). WAF analysis: **performance** (hot reads in < 1 ms) and **cost** (less load on the DB = smaller DB). ⚠️ **The cache trap: invalidation.** When data changes in the DB, the cache must be **updated or invalidated**, else you serve a stale value. Strategies: expiry (TTL), write-through invalidation. It's a real design topic.
:::

### step-05

:::lang fr
**Objectif.** Concevoir un compte **Cosmos DB** complet en Bicep — cohérence, partition, autoscale.

**🤔 Les vraies décisions d'architecte.** Créer des documents, c'est facile ; **bien concevoir** le compte, c'est le métier. On décrit en Bicep un compte Cosmos avec ses trois décisions : le **niveau de cohérence** (`Session`, l'équilibre par défaut), la **clé de partition** (`/clientId`, pour répartir la charge), et le **débit autoscale** (RU/s, l'élasticité).

Crée `cosmos.bicep` :
:::

:::lang en
**Goal.** Design a full **Cosmos DB** account in Bicep — consistency, partition, autoscale.

**🤔 The real architect decisions.** Creating documents is easy; **designing** the account well is the craft. We describe in Bicep a Cosmos account with its three decisions: the **consistency level** (`Session`, the default balance), the **partition key** (`/clientId`, to spread load), and the **autoscale throughput** (RU/s, elasticity).

Create `cosmos.bicep`:
:::

```bicep
// cosmos.bicep — compte Cosmos : cohérence + base + conteneur partitionné + autoscale
param location string = resourceGroup().location
param nomCompte string = 'cosmos${uniqueString(resourceGroup().id)}'

resource compte 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: nomCompte
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      // Strong | BoundedStaleness | Session | ConsistentPrefix | Eventual
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      { locationName: location, failoverPriority: 0 }
    ]
  }
}

resource base 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: compte
  name: 'appdb'
  properties: { resource: { id: 'appdb' } }
}

resource conteneur 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  parent: base
  name: 'commandes'
  properties: {
    resource: {
      id: 'commandes'
      partitionKey: { paths: [ '/clientId' ], kind: 'Hash' }   // clé de partition
    }
    options: {
      autoscaleSettings: { maxThroughput: 4000 }               // RU/s autoscale
    }
  }
}
```

```bash
bicep build cosmos.bicep --stdout | head -n 25
```

:::lang fr
**✅ Vérification :** `bicep build` compile **trois** ressources — `databaseAccounts`, `sqlDatabases`, `containers` — sans erreur. Tu as conçu un compte Cosmos **complet** avec ses trois décisions. Analyse : **cohérence `Session`** (lectures cohérentes pour un utilisateur, bon équilibre latence/cohérence) ; **clé `/clientId`** (les commandes d'un client sur la même partition — accès efficace, mais gare au client géant → hot partition) ; **autoscale 4000 RU/s** (débit élastique, tu paies l'usage réel). ⚠️ La **clé de partition** est le choix le plus **structurant** et le plus **difficile à changer** après coup — pense-la selon les **motifs d'accès** dominants.
:::

:::lang en
**✅ Check:** `bicep build` compiles **three** resources — `databaseAccounts`, `sqlDatabases`, `containers` — with no error. You designed a **complete** Cosmos account with its three decisions. Analysis: **`Session` consistency** (consistent reads for one user, good latency/consistency balance); **`/clientId` key** (a client's orders on the same partition — efficient access, but watch a giant client → hot partition); **autoscale 4000 RU/s** (elastic throughput, you pay actual use). ⚠️ The **partition key** is the most **structuring** choice and the **hardest to change** later — design it by the dominant **access patterns**.
:::

### step-06

:::lang fr
**Objectif.** Graver les **grilles de choix** et les **concepts** — le cœur de l'AZ-305.

**🤔 Décider vite et juste.** L'examen enchaîne les « quelle base ? » et les questions sur la **cohérence**. On mémorise deux grilles.

Les grilles :
:::

:::lang en
**Goal.** Engrave the **choice grids** and **concepts** — the AZ-305 core.

**🤔 Decide fast and right.** The exam strings together "which database?" and **consistency** questions. We memorize two grids.

The grids:
:::

```text
CHOIX DE STOCKAGE / STORAGE CHOICE
  Relationnel, ACID, jointures        -> Azure SQL / PostgreSQL / MySQL
  NoSQL, mondial, faible latence      -> Cosmos DB
  Objets / fichiers                   -> Blob Storage
  Lecture ultra-rapide (cache)        -> Azure Cache for Redis (devant la base)
  Analytique / entrepôt               -> Synapse / Fabric

COHÉRENCE COSMOS / COSMOS CONSISTENCY (fort -> faible / strong -> weak)
  Strong              lecture toujours à jour ; latence la + haute ; 1 région
  BoundedStaleness    retard borné (temps/versions) ; multi-région
  Session (défaut)    cohérent DANS une session ; meilleur équilibre
  ConsistentPrefix    jamais d'ordre incohérent ; peut être en retard
  Eventual            le + rapide/disponible ; peut lire une valeur ancienne
```

:::lang fr
**✅ Vérification :** face à un scénario, tu **choisis** et tu **justifies**. « Commandes/comptes transactionnels » → **Azure SQL** ; « catalogue mondial, faible latence » → **Cosmos DB** (cohérence **Session** ou **Eventual** selon la tolérance) ; « solde bancaire » → cohérence **Strong** ; « fil d'actualité » → **Eventual** (rapide, une lecture légèrement en retard est acceptable). Retiens : **plus la cohérence est forte, plus la latence monte et la disponibilité multi-région baisse** — c'est **le** compromis Cosmos. ⚠️ Justifie toujours par le **besoin métier** (tolère-t-on une lecture légèrement périmée ?), pas par habitude.
:::

:::lang en
**✅ Check:** faced with a scenario, you **choose** and **justify**. "Transactional orders/accounts" → **Azure SQL**; "global catalog, low latency" → **Cosmos DB** (**Session** or **Eventual** consistency by tolerance); "bank balance" → **Strong** consistency; "news feed" → **Eventual** (fast, a slightly stale read is acceptable). Remember: **the stronger the consistency, the higher the latency and the lower multi-region availability** — that's **the** Cosmos tradeoff. ⚠️ Always justify by the **business need** (can we tolerate a slightly stale read?), not by habit.
:::

### step-07

:::lang fr
**Objectif.** Nettoyer.

**🤔 L'hygiène.** On supprime le groupe et tous les services de données.

Nettoie :
:::

:::lang en
**Goal.** Clean up.

**🤔 Hygiene.** We delete the group and all data services.

Clean up:
:::

```bash
azlocal group delete --name rg-data
```

:::lang fr
**✅ Vérification :** `group delete` renvoie `Deleted` — le serveur SQL, la base, PostgreSQL, Cosmos et Redis partent avec le groupe. Ton labo est rangé. Tu maîtrises maintenant la **conception des données** au niveau AZ-305 : choisir la famille (relationnel/NoSQL/objet/cache), les moteurs relationnels, et surtout **concevoir Cosmos** (cohérence, clé de partition, RU/s) et le **cache**. La suite du track : la **continuité d'activité** (sauvegarde, reprise après sinistre, haute disponibilité).
:::

:::lang en
**✅ Check:** `group delete` returns `Deleted` — the SQL server, database, PostgreSQL, Cosmos and Redis go with the group. Your lab is tidy. You now master **data design** at AZ-305 level: choosing the family (relational/NoSQL/object/cache), the relational engines, and above all **designing Cosmos** (consistency, partition key, RU/s) and the **cache**. The track continues: **business continuity** (backup, disaster recovery, high availability).
:::

## pitfalls

:::lang fr
**1. Mettre du relationnel dans du NoSQL (ou l'inverse).** SQL = relations/jointures/ACID ; Cosmos = documents/échelle. Le mauvais choix = refonte coûteuse.

**2. Choisir Strong « par sécurité ».** La cohérence forte coûte en **latence** et en **disponibilité multi-région**. Beaucoup de cas tolèrent **Session** ou **Eventual** — choisis selon le besoin.

**3. Mauvaise clé de partition.** Une clé à faible cardinalité ou déséquilibrée crée un **hot partition** (une partition saturée). Difficile à corriger après coup — pense les motifs d'accès.

**4. Sous- ou sur-provisionner les RU/s.** Trop peu → throttling (429) ; trop → gaspillage. L'**autoscale** ajuste entre un min et un max — souvent le bon défaut.

**5. Oublier l'invalidation du cache.** Un cache non invalidé sert des données périmées. TTL et/ou write-through selon la fraîcheur requise.

**6. Ignorer les options SQL.** Single Database, Elastic Pool, Managed Instance répondent à des besoins différents (isolation, coût variable, migration). Ne prends pas Single par défaut aveugle.

**7. Choisir sans justifier.** L'AZ-305 veut le **pourquoi** (forme de la donnée, cohérence, échelle, coût), pas seulement le service.
:::

:::lang en
**1. Putting relational in NoSQL (or vice versa).** SQL = relations/joins/ACID; Cosmos = documents/scale. The wrong choice = costly rewrite.

**2. Choosing Strong "to be safe".** Strong consistency costs **latency** and **multi-region availability**. Many cases tolerate **Session** or **Eventual** — choose by the need.

**3. Bad partition key.** A low-cardinality or unbalanced key creates a **hot partition** (a saturated partition). Hard to fix later — design by access patterns.

**4. Under- or over-provisioning RU/s.** Too little → throttling (429); too much → waste. **Autoscale** adjusts between a min and max — often the right default.

**5. Forgetting cache invalidation.** An uninvalidated cache serves stale data. TTL and/or write-through by required freshness.

**6. Ignoring the SQL options.** Single Database, Elastic Pool, Managed Instance meet different needs (isolation, variable cost, migration). Don't blindly default to Single.

**7. Choosing without justifying.** AZ-305 wants the **why** (data shape, consistency, scale, cost), not just the service.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu choisis relationnel / NoSQL / objet / cache selon la donnée.
- [ ] Tu déploies une base **Azure SQL** (serveur + base) et **PostgreSQL**.
- [ ] Tu crées et listes des **documents Cosmos**.
- [ ] Tu expliques les **niveaux de cohérence** (Strong → Eventual).
- [ ] Tu choisis une **clé de partition** et comprends les **RU/s**.
- [ ] Tu ajoutes un **cache Redis** et connais le piège de l'invalidation.
- [ ] Tu **conçois** un compte Cosmos en Bicep (cohérence, partition, autoscale).

Sept cases = tu tiens la conception des données AZ-305. La suite : la **continuité d'activité**.
:::

:::lang en
You know it works when…

- [ ] You choose relational / NoSQL / object / cache by the data.
- [ ] You deploy an **Azure SQL** database (server + database) and **PostgreSQL**.
- [ ] You create and list **Cosmos documents**.
- [ ] You explain the **consistency levels** (Strong → Eventual).
- [ ] You choose a **partition key** and understand **RU/s**.
- [ ] You add a **Redis cache** and know the invalidation trap.
- [ ] You **design** a Cosmos account in Bicep (consistency, partition, autoscale).

Seven boxes = you hold AZ-305 data design. Next up: **business continuity**.
:::

## next

:::lang fr
Le track AZ-305 continue :

1. **Azure — continuité d'activité** : sauvegarde (Backup), reprise après sinistre (Site Recovery), haute disponibilité (zones, régions, réplication) — concevoir la résilience.
2. Plus loin : l'**infrastructure** (compute, réseau avancé), le **projet d'architecte** et l'examen AZ-305.
:::

:::lang en
The AZ-305 track continues:

1. **Azure — business continuity**: backup (Backup), disaster recovery (Site Recovery), high availability (zones, regions, replication) — designing resilience.
2. Further along: **infrastructure** (compute, advanced networking), the **architect project** and the AZ-305 exam.
:::

## cheatsheet

:::lang fr
Aide-mémoire conception des données Azure.
:::

:::lang en
Azure data design cheat sheet.
:::

```bash
# Relationnel (azlocal, live) / relational
azlocal sql server create --name sqlsrv-archi --resource-group rg-data
azlocal sql database create --server sqlsrv-archi --name commandesdb --resource-group rg-data
azlocal postgres server create --name pg-archi --resource-group rg-data

# NoSQL (documents Cosmos, live) / NoSQL
azlocal cosmosdb doc create --account cosmos-archi --database appdb --collection commandes --id cmd-1 --resource-group rg-data
azlocal cosmosdb doc list   --account cosmos-archi --database appdb --collection commandes --resource-group rg-data

# Cache (live) / cache
azlocal redis create --name redis-archi --resource-group rg-data

# Conception Cosmos (Bicep, validé) / Cosmos design
bicep build cosmos.bicep --stdout    # cohérence + clé de partition + autoscale RU/s
```

```text
Choix : SQL(relationnel) · Cosmos(NoSQL mondial) · Blob(objets) · Redis(cache) · Synapse(analytique)
Cohérence Cosmos : Strong > BoundedStaleness > Session(défaut) > ConsistentPrefix > Eventual
Partition : clé à cardinalité élevée + accès équilibré ; RU/s : autoscale = élastique
```

## resources

:::lang fr
- [Choisir un magasin de données](https://learn.microsoft.com/azure/architecture/guide/technology-choices/data-store-decision-tree) — l'arbre de décision.
- [Azure SQL — options de déploiement](https://learn.microsoft.com/azure/azure-sql/database/sql-database-paas-overview) — Single/Pool/MI.
- [Cosmos DB — niveaux de cohérence](https://learn.microsoft.com/azure/cosmos-db/consistency-levels) — le compromis.
- [Cosmos DB — partitionnement](https://learn.microsoft.com/azure/cosmos-db/partitioning-overview) — clés et partitions.
- [Azure Cache for Redis](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-overview) — patterns de cache.
:::

:::lang en
- [Choose a data store](https://learn.microsoft.com/azure/architecture/guide/technology-choices/data-store-decision-tree) — the decision tree.
- [Azure SQL — deployment options](https://learn.microsoft.com/azure/azure-sql/database/sql-database-paas-overview) — Single/Pool/MI.
- [Cosmos DB — consistency levels](https://learn.microsoft.com/azure/cosmos-db/consistency-levels) — the tradeoff.
- [Cosmos DB — partitioning](https://learn.microsoft.com/azure/cosmos-db/partitioning-overview) — keys and partitions.
- [Azure Cache for Redis](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-overview) — cache patterns.
:::

## troubleshooting

:::lang fr
**`azlocal sql database create` : « server not found ».** Crée d'abord le **serveur** (`sql server create`), puis la base (`--server <nom>`).

**`azlocal cosmosdb doc` : « --collection is required ».** Les documents vivent dans un **compte → base → collection**. Fournis `--account`, `--database`, `--collection` et `--id`.

**`bicep build cosmos.bicep` : erreur de schéma.** Vérifie les types imbriqués (`databaseAccounts/sqlDatabases/containers`) et la version d'API ; la `partitionKey` et `autoscaleSettings` doivent être aux bons niveaux.

**Quelle cohérence choisir ?** Pars du besoin : donnée critique lue juste après écriture → **Strong/Session** ; flux tolérant au léger retard → **Eventual**. Session est le défaut équilibré.

**Ma clé de partition sature (hot partition).** Choisis une clé à **cardinalité élevée** et à **accès équilibré** (pas `/pays` si 90 % du trafic est un pays). Difficile à changer après — conçois-la tôt.

**`azlocal ... create` : connexion refusée.** miniblue ne tourne pas. Lance `miniblue`, vérifie `azlocal health`.
:::

:::lang en
**`azlocal sql database create`: "server not found".** Create the **server** first (`sql server create`), then the database (`--server <name>`).

**`azlocal cosmosdb doc`: "--collection is required".** Documents live in an **account → database → collection**. Provide `--account`, `--database`, `--collection` and `--id`.

**`bicep build cosmos.bicep`: schema error.** Check the nested types (`databaseAccounts/sqlDatabases/containers`) and the API version; `partitionKey` and `autoscaleSettings` must be at the right levels.

**Which consistency to choose?** Start from the need: critical data read right after a write → **Strong/Session**; a stream tolerant of slight lag → **Eventual**. Session is the balanced default.

**My partition key saturates (hot partition).** Choose a **high-cardinality**, **balanced-access** key (not `/country` if 90% of traffic is one country). Hard to change later — design it early.

**`azlocal ... create`: connection refused.** miniblue isn't running. Start `miniblue`, check `azlocal health`.
:::
