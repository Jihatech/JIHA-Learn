---
# — Identité (ne change JAMAIS une fois publié) —
id: aws-stockage-s3
slug: aws-stockage-s3
order: 46
status: published

# — Titres & accroches (bilingue) —
title_fr: "AWS — stockage S3 en profondeur"
title_en: "AWS — S3 storage in depth"
tagline_fr: "versioning, classes, cycle de vie, chiffrement, site statique, URL présignées."
tagline_en: "versioning, classes, lifecycle, encryption, static site, presigned URLs."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 210
repo: "localstack/localstack"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [aws-iam-securite]
next: [aws-reseau-vpc]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [buckets-objets, versioning, classes-de-stockage, cycle-de-vie, chiffrement-sse, site-statique, url-presignees]
concepts_en: [buckets-objects, versioning, storage-classes, lifecycle, sse-encryption, static-website, presigned-urls]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "S3 en profondeur pour le SAA-C03 : le modèle bucket/objet, le versioning (protection contre l'écrasement), les classes de stockage (Standard/IA/Glacier et leurs compromis coût), les règles de cycle de vie (transition et expiration automatiques), le chiffrement au repos (SSE-S3/KMS), l'hébergement de site web statique, et les URL présignées (accès temporaire sans rendre public). Tout en LocalStack."
og_description_en: "S3 in depth for SAA-C03: the bucket/object model, versioning (overwrite protection), storage classes (Standard/IA/Glacier and their cost tradeoffs), lifecycle rules (automatic transition and expiration), encryption at rest (SSE-S3/KMS), static website hosting, and presigned URLs (temporary access without going public). All on LocalStack."
---

## intro

:::lang fr
S3 (Simple Storage Service) est le service le plus utilisé d'AWS et le deuxième plus testé à l'examen SAA, juste après IAM. C'est un **stockage d'objets** : tu ranges des fichiers dans des buckets, et AWS s'occupe de la durabilité (99,999999999 % — onze neuf), de la disponibilité et de la mise à l'échelle. Sauvegardes, sites web, journaux, data lakes, artefacts de build : S3 est partout.

Mais « ranger des fichiers » ne fait pas de toi un architecte. Le SAA teste ce qui **entoure** le stockage : comment **protéger** tes données de l'écrasement accidentel (**versioning**), comment **payer moins** selon la fréquence d'accès (**classes de stockage** et **règles de cycle de vie**), comment **chiffrer** au repos (**SSE**), comment **héberger un site web** statique, et comment **partager un objet privé temporairement** sans le rendre public (**URL présignées**). C'est exactement ce guide.

Tout se fait en **LocalStack** : tu crées de vrais buckets, tu actives le versioning, tu poses des règles de cycle de vie et du chiffrement, tu génères des URL présignées — les mêmes commandes qu'en réel, sans compte ni facture.

**Pour qui c'est :** tu as fait *AWS fondamentaux* et *IAM & sécurité*, et tu veux maîtriser le service de stockage phare.

**Quand ce n'est PAS le bon choix :**

- Tu cherches une base de données (requêtes, index) → S3 stocke des **objets**, pas des données structurées interrogeables ; c'est DynamoDB/RDS (guides suivants).
- Tu veux un système de fichiers partagé monté sur des serveurs → c'est EFS, pas S3.
:::

:::lang en
S3 (Simple Storage Service) is AWS's most-used service and the second most tested on the SAA exam, right after IAM. It's **object storage**: you store files in buckets, and AWS handles durability (99.999999999% — eleven nines), availability and scaling. Backups, websites, logs, data lakes, build artifacts: S3 is everywhere.

But "storing files" doesn't make you an architect. The SAA tests what **surrounds** storage: how to **protect** your data from accidental overwrite (**versioning**), how to **pay less** based on access frequency (**storage classes** and **lifecycle rules**), how to **encrypt** at rest (**SSE**), how to **host a static website**, and how to **temporarily share a private object** without making it public (**presigned URLs**). That's exactly this guide.

Everything runs on **LocalStack**: you create real buckets, enable versioning, set lifecycle rules and encryption, generate presigned URLs — the same commands as the real thing, no account or bill.

**Who it's for:** you've done *AWS fundamentals* and *IAM & security*, and you want to master the flagship storage service.

**When it's NOT the right choice:**

- You want a database (queries, indexes) → S3 stores **objects**, not queryable structured data; that's DynamoDB/RDS (later guides).
- You want a shared filesystem mounted on servers → that's EFS, not S3.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Manipuler **buckets et objets** (cp, sync, préfixes) et le modèle clé/valeur de S3.
- Activer le **versioning** et restaurer une version antérieure d'un objet.
- Choisir une **classe de stockage** (Standard/IA/Glacier) selon le coût et l'accès.
- Écrire une **règle de cycle de vie** (transition et expiration automatiques).
- Activer le **chiffrement au repos** (SSE-S3/AES256) par défaut sur un bucket.
- Héberger un **site web statique** sur S3.
- Générer une **URL présignée** pour un accès temporaire sans rendre l'objet public.
:::

:::lang en
By the end of this guide, you can:

- Handle **buckets and objects** (cp, sync, prefixes) and S3's key/value model.
- Enable **versioning** and restore a previous version of an object.
- Choose a **storage class** (Standard/IA/Glacier) based on cost and access.
- Write a **lifecycle rule** (automatic transition and expiration).
- Enable **encryption at rest** (SSE-S3/AES256) by default on a bucket.
- Host a **static website** on S3.
- Generate a **presigned URL** for temporary access without making the object public.
:::

## prerequisites

:::lang fr
- Les guides **AWS fondamentaux** et **IAM & sécurité** terminés.
- **LocalStack qui tourne** (`docker run -d --name localstack -p 4566:4566 localstack/localstack:3.8.1`) et **`awslocal`** configuré.
- De quoi créer quelques fichiers de test (`echo`, un éditeur).
:::

:::lang en
- The **AWS fundamentals** and **IAM & security** guides done.
- **LocalStack running** (`docker run -d --name localstack -p 4566:4566 localstack/localstack:3.8.1`) and **`awslocal`** configured.
- A way to create a few test files (`echo`, an editor).
:::

## concepts

:::lang fr
**Bucket et objet.** Un **bucket** est un conteneur (nom **unique mondialement**). Un **objet** est un fichier + ses métadonnées, identifié par une **clé** (son « chemin »). S3 est **plat** : `photos/2026/chat.jpg` n'est pas un dossier imbriqué, c'est **une clé** qui contient des `/`. On parle de **préfixe** (`photos/`) pour filtrer, mais il n'y a pas de vraie hiérarchie.

**Versioning.** Activé sur un bucket, il conserve **chaque version** d'un objet à chaque écrasement. Écraser `contrat.pdf` ne perd pas l'ancien : il devient une version antérieure, récupérable. Supprimer pose un **marqueur de suppression** (l'objet est masqué mais restaurable). C'est la protection n°1 contre l'erreur humaine.

**Classes de stockage.** S3 propose plusieurs niveaux, du plus cher/rapide au moins cher/lent : **Standard** (accès fréquent), **Standard-IA** (Infrequent Access — accès rare, stockage moins cher mais récupération payante), **Glacier**/**Glacier Deep Archive** (archivage, récupération en minutes à heures). Choisir la bonne classe selon la fréquence d'accès est un pilier du domaine **coût** du SAA.

**Cycle de vie (lifecycle).** Des **règles automatiques** sur un bucket : « après 30 jours, passe les objets en Standard-IA », « après 90 jours, en Glacier », « après 365 jours, supprime-les ». Tu automatises l'optimisation des coûts sans y penser.

**Chiffrement (SSE).** Le **Server-Side Encryption** chiffre les objets **au repos**, côté serveur. **SSE-S3** (AES256, clés gérées par AWS) est le défaut simple. **SSE-KMS** utilise une clé du service KMS (traçabilité, rotation). On peut l'imposer **par défaut** sur un bucket.

**Site web statique.** S3 peut **servir** directement des fichiers HTML/CSS/JS comme un site web (document d'index, page d'erreur). Combiné à une bucket policy publique, c'est l'hébergement le moins cher pour un site statique.

**URL présignée.** Une URL **temporaire et signée** qui donne un accès **limité dans le temps** à un objet **privé**, sans le rendre public ni distribuer de clés. Idéal pour « télécharge ce fichier, ce lien expire dans 1 heure ».
:::

:::lang en
**Bucket and object.** A **bucket** is a container (**globally unique** name). An **object** is a file + its metadata, identified by a **key** (its "path"). S3 is **flat**: `photos/2026/cat.jpg` isn't a nested folder, it's **one key** containing `/`. We speak of a **prefix** (`photos/`) to filter, but there's no real hierarchy.

**Versioning.** Enabled on a bucket, it keeps **every version** of an object on each overwrite. Overwriting `contract.pdf` doesn't lose the old one: it becomes a previous version, recoverable. Deleting places a **delete marker** (the object is hidden but restorable). It's the #1 protection against human error.

**Storage classes.** S3 offers several tiers, from most expensive/fast to cheapest/slow: **Standard** (frequent access), **Standard-IA** (Infrequent Access — rare access, cheaper storage but paid retrieval), **Glacier**/**Glacier Deep Archive** (archival, retrieval in minutes to hours). Choosing the right class by access frequency is a pillar of the SAA **cost** domain.

**Lifecycle.** **Automatic rules** on a bucket: "after 30 days, move objects to Standard-IA", "after 90 days, to Glacier", "after 365 days, delete them". You automate cost optimization without thinking about it.

**Encryption (SSE).** **Server-Side Encryption** encrypts objects **at rest**, server-side. **SSE-S3** (AES256, AWS-managed keys) is the simple default. **SSE-KMS** uses a KMS service key (traceability, rotation). You can enforce it **by default** on a bucket.

**Static website.** S3 can **serve** HTML/CSS/JS files directly like a website (index document, error page). Combined with a public bucket policy, it's the cheapest hosting for a static site.

**Presigned URL.** A **temporary, signed** URL giving **time-limited** access to a **private** object, without making it public or distributing keys. Ideal for "download this file, this link expires in 1 hour".
:::

:::figure aws-s3-lifecycle
caption_fr: "Schéma 1. Le cycle de vie d'un objet S3 : créé en Standard (accès fréquent), transféré en Standard-IA après 30 j, archivé en Glacier après 90 j, supprimé après 365 j — automatiquement, pour optimiser le coût selon l'âge et la fréquence d'accès."
caption_en: "Figure 1. An S3 object's lifecycle: created in Standard (frequent access), moved to Standard-IA after 30 d, archived in Glacier after 90 d, deleted after 365 d — automatically, to optimize cost by age and access frequency."
:::

## walkthrough

:::lang fr
On avance ainsi : buckets & objets → versioning → classes de stockage → cycle de vie → chiffrement → site statique → URL présignée.
:::

:::lang en
We'll go like this: buckets & objects → versioning → storage classes → lifecycle → encryption → static site → presigned URL.
:::

### step-01

:::lang fr
**Objectif.** Manipuler **buckets et objets** : créer, copier, synchroniser, lister avec des **préfixes**.

**🤔 Le modèle plat.** S3 n'a pas de dossiers : `rapports/2026/q1.txt` est **une clé**. Le `s3 sync` copie un arbre local en préservant les clés `dossier/sous-dossier/fichier`. Le préfixe (`rapports/`) sert à **filtrer** un listing, pas à créer une hiérarchie réelle.

Crée un bucket et remplis-le :
:::

:::lang en
**Goal.** Handle **buckets and objects**: create, copy, sync, list with **prefixes**.

**🤔 The flat model.** S3 has no folders: `reports/2026/q1.txt` is **one key**. `s3 sync` copies a local tree preserving the `folder/subfolder/file` keys. The prefix (`reports/`) is for **filtering** a listing, not for creating a real hierarchy.

Create a bucket and fill it:
:::

```bash
awslocal s3 mb s3://atelier-s3

# Copier un objet avec une clé "en dossier" / copy an object with a "folder" key
echo "rapport Q1" > q1.txt
awslocal s3 cp q1.txt s3://atelier-s3/rapports/2026/q1.txt

# Synchroniser un dossier local entier / sync a whole local folder
mkdir -p site && echo "<h1>Accueil</h1>" > site/index.html && echo "body{}" > site/style.css
awslocal s3 sync site/ s3://atelier-s3/site/

# Lister avec un préfixe / list with a prefix
awslocal s3 ls s3://atelier-s3/rapports/2026/
awslocal s3 ls s3://atelier-s3/ --recursive
```

:::lang fr
**✅ Vérification :** `s3 cp` crée l'objet de clé `rapports/2026/q1.txt`. `s3 sync` téléverse `site/index.html` et `site/style.css` (deux objets). `s3 ls --recursive` liste **toutes** les clés à plat, avec leur taille — tu vois bien que `rapports/2026/q1.txt` est une seule clé, pas trois dossiers. Le préfixe `rapports/2026/` filtre le listing à ce « sous-dossier » virtuel.
:::

:::lang en
**✅ Check:** `s3 cp` creates the object with key `rapports/2026/q1.txt`. `s3 sync` uploads `site/index.html` and `site/style.css` (two objects). `s3 ls --recursive` lists **all** keys flat, with their size — you see clearly that `rapports/2026/q1.txt` is a single key, not three folders. The prefix `rapports/2026/` filters the listing to that virtual "subfolder".
:::

### step-02

:::lang fr
**Objectif.** Activer le **versioning** et récupérer une **version antérieure** après un écrasement.

**🤔 La protection contre l'erreur.** Sans versioning, écraser un objet écrase l'ancien **définitivement**. Avec versioning, chaque écriture crée une **nouvelle version** et garde les précédentes. C'est la parade au « j'ai écrasé le bon fichier par erreur ».

Active le versioning et écrase un objet :
:::

:::lang en
**Goal.** Enable **versioning** and recover a **previous version** after an overwrite.

**🤔 Protection against error.** Without versioning, overwriting an object overwrites the old one **permanently**. With versioning, each write creates a **new version** and keeps the previous ones. It's the answer to "I overwrote the right file by mistake".

Enable versioning and overwrite an object:
:::

```bash
# Activer le versioning sur le bucket / enable versioning on the bucket
awslocal s3api put-bucket-versioning --bucket atelier-s3 \
  --versioning-configuration Status=Enabled

# Écrire deux versions de la même clé / write two versions of the same key
echo "contrat v1" > contrat.txt ; awslocal s3 cp contrat.txt s3://atelier-s3/contrat.txt
echo "contrat v2" > contrat.txt ; awslocal s3 cp contrat.txt s3://atelier-s3/contrat.txt

# Lister les versions / list the versions
awslocal s3api list-object-versions --bucket atelier-s3 --prefix contrat.txt \
  --query 'Versions[].[VersionId,IsLatest]' --output table
```

:::lang fr
**✅ Vérification :** `list-object-versions` montre **deux** versions de `contrat.txt`, chacune avec un `VersionId` distinct ; une seule a `IsLatest=True` (la v2). Pour **récupérer la v1**, tu télécharges par son VersionId : `awslocal s3api get-object --bucket atelier-s3 --key contrat.txt --version-id <ID_de_v1> recupere.txt` → `recupere.txt` contient « contrat v1 ». Rien n'est perdu : le versioning garde tout l'historique. (En réel, chaque version compte dans la facture de stockage — d'où l'intérêt des règles de cycle de vie pour purger les vieilles versions.)
:::

:::lang en
**✅ Check:** `list-object-versions` shows **two** versions of `contrat.txt`, each with a distinct `VersionId`; only one has `IsLatest=True` (v2). To **recover v1**, you download it by its VersionId: `awslocal s3api get-object --bucket atelier-s3 --key contrat.txt --version-id <v1_ID> recovered.txt` → `recovered.txt` contains "contrat v1". Nothing is lost: versioning keeps the full history. (In reality, each version counts in the storage bill — hence lifecycle rules to purge old versions.)
:::

### step-03

:::lang fr
**Objectif.** Choisir une **classe de stockage** selon le coût et la fréquence d'accès.

**🤔 Le domaine « coût » du SAA.** Toutes les données ne se valent pas : un fichier consulté 100 fois/jour va en **Standard** ; une archive légale consultée une fois/an va en **Glacier** (bien moins cher au stockage, mais récupération lente et payante). L'examen te donne un scénario (« logs rarement lus », « backup à conserver 7 ans ») et attend la bonne classe.

Dépose des objets dans différentes classes :
:::

:::lang en
**Goal.** Choose a **storage class** based on cost and access frequency.

**🤔 The SAA "cost" domain.** Not all data is equal: a file accessed 100×/day goes to **Standard**; a legal archive accessed once/year goes to **Glacier** (much cheaper to store, but slow, paid retrieval). The exam gives a scenario ("rarely-read logs", "backup to keep 7 years") and expects the right class.

Store objects in different classes:
:::

```bash
echo "log rarement lu" > vieux.log
# Standard-IA : accès rare, stockage moins cher / Infrequent Access
awslocal s3 cp vieux.log s3://atelier-s3/archives/vieux.log --storage-class STANDARD_IA

echo "archive legale" > archive.dat
# Glacier : archivage long terme / long-term archival
awslocal s3 cp archive.dat s3://atelier-s3/archives/archive.dat --storage-class GLACIER

# Vérifier la classe de chaque objet / check each object's class
awslocal s3api head-object --bucket atelier-s3 --key archives/vieux.log   --query 'StorageClass' --output text
awslocal s3api head-object --bucket atelier-s3 --key archives/archive.dat --query 'StorageClass' --output text
```

:::lang fr
**✅ Vérification :** `head-object` sur `vieux.log` renvoie `STANDARD_IA`, sur `archive.dat` renvoie `GLACIER`. (Un objet en `STANDARD` renvoie souvent `None`/vide, car Standard est la classe par défaut implicite.) Retiens la logique de choix : **fréquent → Standard** ; **rare mais récupérable vite → Standard-IA** ; **archivage, récupération lente OK → Glacier** ; **archivage très long, très froid → Glacier Deep Archive**. C'est un compromis coût-de-stockage vs coût/délai-de-récupération.
:::

:::lang en
**✅ Check:** `head-object` on `vieux.log` returns `STANDARD_IA`, on `archive.dat` returns `GLACIER`. (A `STANDARD` object often returns `None`/empty, since Standard is the implicit default class.) Remember the choice logic: **frequent → Standard**; **rare but quick to retrieve → Standard-IA**; **archival, slow retrieval OK → Glacier**; **very long, very cold archival → Glacier Deep Archive**. It's a storage-cost vs retrieval-cost/delay tradeoff.
:::

### step-04

:::lang fr
**Objectif.** Automatiser l'optimisation des coûts avec une **règle de cycle de vie**.

**🤔 Pourquoi automatiser.** Passer les objets à la main d'une classe à l'autre est intenable. Une **règle de cycle de vie** le fait toute seule selon l'**âge** : transition après N jours, expiration après M jours. Tu la poses une fois, S3 s'occupe du reste — l'optimisation de coût « set and forget ».

Pose une règle de cycle de vie :
:::

:::lang en
**Goal.** Automate cost optimization with a **lifecycle rule**.

**🤔 Why automate.** Moving objects by hand from one class to another is untenable. A **lifecycle rule** does it on its own by **age**: transition after N days, expiration after M days. You set it once, S3 handles the rest — "set and forget" cost optimization.

Set a lifecycle rule:
:::

```json
{
  "Rules": [
    {
      "ID": "archivage-progressif",
      "Status": "Enabled",
      "Filter": { "Prefix": "archives/" },
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 90, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 365 }
    }
  ]
}
```

```bash
# Enregistre le JSON ci-dessus dans lifecycle.json / save the JSON above as lifecycle.json
awslocal s3api put-bucket-lifecycle-configuration --bucket atelier-s3 \
  --lifecycle-configuration file://lifecycle.json

# Relire la règle posée / read the rule back
awslocal s3api get-bucket-lifecycle-configuration --bucket atelier-s3 \
  --query 'Rules[0].[ID,Status]' --output text
```

:::lang fr
**✅ Vérification :** `put-bucket-lifecycle-configuration` réussit (aucune erreur), et `get-bucket-lifecycle-configuration` te réaffiche la règle `archivage-progressif Enabled`. La règle dit : pour tout objet sous `archives/`, passe en Standard-IA à 30 jours, en Glacier à 90 jours, supprime à 365 jours. En réel, S3 applique ces transitions automatiquement chaque nuit. (LocalStack enregistre la règle mais ne fait pas « vieillir » les objets — c'est la **configuration** que tu valides ici, exactement ce que l'architecte écrit.)
:::

:::lang en
**✅ Check:** `put-bucket-lifecycle-configuration` succeeds (no error), and `get-bucket-lifecycle-configuration` shows you back the `archivage-progressif Enabled` rule. The rule says: for any object under `archives/`, move to Standard-IA at 30 days, to Glacier at 90 days, delete at 365 days. In real AWS, S3 applies these transitions automatically each night. (LocalStack stores the rule but doesn't "age" objects — it's the **configuration** you validate here, exactly what the architect writes.)
:::

### step-05

:::lang fr
**Objectif.** Imposer le **chiffrement au repos** (SSE) par défaut sur un bucket.

**🤔 Chiffrer sans y penser.** Le chiffrement au repos protège tes données si quelqu'un accède au stockage physique. En posant un **chiffrement par défaut** sur le bucket, **tout** nouvel objet est chiffré automatiquement — plus besoin d'y penser à chaque `put`. `SSE-S3` (AES256) est le plus simple ; `SSE-KMS` ajoute la traçabilité via le service de clés KMS.

Active le chiffrement par défaut :
:::

:::lang en
**Goal.** Enforce **encryption at rest** (SSE) by default on a bucket.

**🤔 Encrypt without thinking.** Encryption at rest protects your data if someone accesses the physical storage. By setting **default encryption** on the bucket, **every** new object is encrypted automatically — no need to think about it on each `put`. `SSE-S3` (AES256) is the simplest; `SSE-KMS` adds traceability via the KMS key service.

Enable default encryption:
:::

```json
{
  "Rules": [
    { "ApplyServerSideEncryptionByDefault": { "SSEAlgorithm": "AES256" } }
  ]
}
```

```bash
# Enregistre dans encryption.json / save as encryption.json
awslocal s3api put-bucket-encryption --bucket atelier-s3 \
  --server-side-encryption-configuration file://encryption.json

# Vérifier / verify
awslocal s3api get-bucket-encryption --bucket atelier-s3 \
  --query 'ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm' \
  --output text
```

:::lang fr
**✅ Vérification :** `get-bucket-encryption` renvoie `AES256` — le chiffrement par défaut (SSE-S3) est actif. Désormais, tout objet déposé dans `atelier-s3` est chiffré au repos, sans rien préciser au moment du `put`. En réel, un objet uploadé montrerait un en-tête `x-amz-server-side-encryption: AES256`. C'est une bonne pratique de sécurité qu'on impose au niveau du bucket, pas objet par objet.
:::

:::lang en
**✅ Check:** `get-bucket-encryption` returns `AES256` — default encryption (SSE-S3) is active. From now on, any object stored in `atelier-s3` is encrypted at rest, without specifying anything at `put` time. In real AWS, an uploaded object would show an `x-amz-server-side-encryption: AES256` header. It's a security best practice enforced at the bucket level, not object by object.
:::

### step-06

:::lang fr
**Objectif.** Héberger un **site web statique** sur S3.

**🤔 L'hébergement le moins cher.** Pour un site sans backend (HTML/CSS/JS), pas besoin de serveur : S3 sert les fichiers directement. Tu actives le mode « site web » (document d'index, page d'erreur) et tu rends les objets lisibles publiquement via une bucket policy. C'est un cas d'usage classique du SAA (souvent combiné à CloudFront pour la performance).

Configure l'hébergement statique :
:::

:::lang en
**Goal.** Host a **static website** on S3.

**🤔 The cheapest hosting.** For a backend-less site (HTML/CSS/JS), no server needed: S3 serves the files directly. You enable "website" mode (index document, error page) and make objects publicly readable via a bucket policy. It's a classic SAA use case (often combined with CloudFront for performance).

Configure static hosting:
:::

```bash
# Un bucket dédié au site / a bucket dedicated to the site
awslocal s3 mb s3://mon-site-statique
echo "<h1>Bienvenue sur mon site</h1>" > index.html
echo "<h1>404 - page introuvable</h1>" > erreur.html
awslocal s3 cp index.html  s3://mon-site-statique/index.html
awslocal s3 cp erreur.html s3://mon-site-statique/erreur.html

# Activer le mode site web (index + page d'erreur) / enable website mode
awslocal s3 website s3://mon-site-statique/ --index-document index.html --error-document erreur.html

# Servir le contenu / serve the content (LocalStack expose le site sur ce chemin)
curl -s http://localhost:4566/mon-site-statique/index.html
```

:::lang fr
**✅ Vérification :** `s3 website` configure l'hébergement (aucune erreur). `curl http://localhost:4566/mon-site-statique/index.html` renvoie `<h1>Bienvenue sur mon site</h1>`. En réel, le site serait accessible via l'URL de point de terminaison du site (`http://mon-site-statique.s3-website-<region>.amazonaws.com`), et tu attacherais une **bucket policy publique** (`Principal:"*"`, `s3:GetObject`) — vu au guide IAM — pour que les visiteurs puissent lire les objets. LocalStack sert le contenu directement pour le test.
:::

:::lang en
**✅ Check:** `s3 website` configures hosting (no error). `curl http://localhost:4566/mon-site-statique/index.html` returns `<h1>Bienvenue sur mon site</h1>`. In real AWS, the site would be reachable via the website endpoint URL (`http://mon-site-statique.s3-website-<region>.amazonaws.com`), and you'd attach a **public bucket policy** (`Principal:"*"`, `s3:GetObject`) — seen in the IAM guide — so visitors can read the objects. LocalStack serves the content directly for testing.
:::

### step-07

:::lang fr
**Objectif.** Générer une **URL présignée** — un accès temporaire à un objet **privé**, sans le rendre public.

**🤔 Le meilleur des deux mondes.** Tu veux qu'un utilisateur télécharge un objet privé (une facture, une image) **sans** rendre le bucket public **ni** lui donner des clés AWS. La solution : une **URL présignée**, signée avec **tes** droits, **valable un temps limité**. Passé le délai, le lien ne marche plus. C'est LE motif de partage sécurisé.

Génère une URL présignée et nettoie :
:::

:::lang en
**Goal.** Generate a **presigned URL** — temporary access to a **private** object, without making it public.

**🤔 The best of both worlds.** You want a user to download a private object (an invoice, an image) **without** making the bucket public **nor** giving them AWS keys. The solution: a **presigned URL**, signed with **your** rights, **valid for a limited time**. After the delay, the link stops working. It's THE secure-sharing pattern.

Generate a presigned URL and clean up:
:::

```bash
echo "facture privee 2026" > facture.pdf
awslocal s3 cp facture.pdf s3://atelier-s3/factures/facture.pdf

# URL présignée valable 1 heure (3600 s) / presigned URL valid 1 hour
url=$(awslocal s3 presign s3://atelier-s3/factures/facture.pdf --expires-in 3600)
echo "$url"
# Le lien fonctionne sans identifiants AWS / the link works with no AWS credentials
curl -s "$url"

# --- Nettoyage complet / full cleanup ---
awslocal s3 rb s3://atelier-s3 --force
awslocal s3 rb s3://mon-site-statique --force
```

:::lang fr
**✅ Vérification :** `s3 presign` renvoie une longue URL contenant `?AWSAccessKeyId=...&Signature=...&Expires=...`. Le `curl` sur cette URL renvoie `facture privee 2026` — **sans aucun identifiant AWS**, juste avec le lien signé. C'est ça, la magie : un accès délégué, temporaire, révoqué automatiquement à l'expiration. Le bucket, lui, reste **privé**. `s3 rb --force` vide et supprime les deux buckets — labo rangé. ⚠️ Ne partage une URL présignée que par un canal sûr : quiconque a le lien (avant expiration) a l'accès.
:::

:::lang en
**✅ Check:** `s3 presign` returns a long URL containing `?AWSAccessKeyId=...&Signature=...&Expires=...`. The `curl` on that URL returns `facture privee 2026` — **with no AWS credentials at all**, just the signed link. That's the magic: delegated, temporary access, auto-revoked at expiry. The bucket itself stays **private**. `s3 rb --force` empties and deletes both buckets — lab tidied. ⚠️ Only share a presigned URL over a safe channel: anyone with the link (before expiry) has the access.
:::

## pitfalls

:::lang fr
**1. Croire que les préfixes sont des dossiers.** S3 est plat : `a/b/c.txt` est **une clé**. Il n'y a pas de dossier `a/` à créer ou supprimer — supprimer « le dossier » revient à supprimer tous les objets qui partagent ce préfixe.

**2. Activer le versioning et oublier les vieilles versions.** Chaque version compte dans la facture. Sans règle de cycle de vie qui purge les versions non-courantes, le coût enfle silencieusement.

**3. Choisir Glacier pour des données consultées souvent.** Glacier est peu cher **au stockage** mais la **récupération** est lente et payante. Pour de l'accès fréquent, c'est un contresens : Standard revient moins cher au total.

**4. Confondre ARN de bucket et d'objets dans les règles.** Une bucket policy `s3:GetObject` doit cibler `arn:aws:s3:::bucket/*` (les objets), pas `arn:aws:s3:::bucket` (le bucket). Erreur vue au guide IAM, encore plus fréquente ici.

**5. Rendre un bucket public pour partager un seul fichier.** N'ouvre pas tout le bucket : utilise une **URL présignée** pour un accès temporaire à un objet précis. Le bucket reste privé.

**6. Oublier « Block Public Access » (en réel).** Sur le vrai AWS, même avec une bucket policy publique, l'accès est bloqué tant que « Block Public Access » est actif (il l'est par défaut). Le désactiver est une décision explicite. LocalStack ne simule pas ce garde-fou — attention en réel.

**7. Nom de bucket non conforme.** En réel, un nom de bucket doit être en minuscules, sans underscore, unique mondialement, et respecter des règles DNS. `Mon_Bucket` est invalide.
:::

:::lang en
**1. Thinking prefixes are folders.** S3 is flat: `a/b/c.txt` is **one key**. There's no `a/` folder to create or delete — deleting "the folder" means deleting all objects sharing that prefix.

**2. Enabling versioning and forgetting old versions.** Each version counts in the bill. Without a lifecycle rule purging noncurrent versions, cost swells silently.

**3. Choosing Glacier for frequently-accessed data.** Glacier is cheap **to store** but **retrieval** is slow and paid. For frequent access, it's a mistake: Standard is cheaper overall.

**4. Confusing bucket and objects ARN in rules.** A bucket policy `s3:GetObject` must target `arn:aws:s3:::bucket/*` (the objects), not `arn:aws:s3:::bucket` (the bucket). Mistake seen in the IAM guide, even more frequent here.

**5. Making a bucket public to share one file.** Don't open the whole bucket: use a **presigned URL** for temporary access to a precise object. The bucket stays private.

**6. Forgetting "Block Public Access" (in real AWS).** On real AWS, even with a public bucket policy, access is blocked while "Block Public Access" is on (it is by default). Disabling it is an explicit decision. LocalStack doesn't simulate this guardrail — beware in real life.

**7. Non-compliant bucket name.** In reality, a bucket name must be lowercase, no underscore, globally unique, and follow DNS rules. `My_Bucket` is invalid.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées des objets avec des clés « en dossier » et tu comprends le modèle plat.
- [ ] Tu actives le versioning et tu récupères une version antérieure par son VersionId.
- [ ] Tu déposes un objet en `STANDARD_IA` et un en `GLACIER`, et tu sais quand choisir quoi.
- [ ] Tu poses une règle de cycle de vie (transition + expiration) et tu la relis.
- [ ] Tu imposes le chiffrement `AES256` par défaut sur un bucket.
- [ ] Tu héberges un site statique servi par S3.
- [ ] Tu génères une URL présignée qui donne un accès temporaire sans clé.

Sept cases = tu maîtrises S3 au niveau SAA. La suite : le réseau VPC.
:::

:::lang en
You know it works when…

- [ ] You create objects with "folder" keys and understand the flat model.
- [ ] You enable versioning and recover a previous version by its VersionId.
- [ ] You store an object in `STANDARD_IA` and one in `GLACIER`, and know when to pick which.
- [ ] You set a lifecycle rule (transition + expiration) and read it back.
- [ ] You enforce `AES256` default encryption on a bucket.
- [ ] You host a static site served by S3.
- [ ] You generate a presigned URL giving temporary keyless access.

Seven boxes = you master S3 at SAA level. Next up: VPC networking.
:::

## next

:::lang fr
La suite du track AWS → SAA-C03 :

1. **AWS — réseau VPC** : réseaux virtuels, sous-réseaux publics/privés, tables de routage, passerelle Internet, groupes de sécurité vs NACL — comment isoler et connecter tes ressources.
2. Plus loin : compute (EC2/Lambda), découplage (SQS/SNS/DynamoDB), le **projet d'entreprise** serverless, puis **passer en réel**.
:::

:::lang en
The AWS → SAA-C03 track continues:

1. **AWS — VPC networking**: virtual networks, public/private subnets, route tables, internet gateway, security groups vs NACLs — how to isolate and connect your resources.
2. Further along: compute (EC2/Lambda), decoupling (SQS/SNS/DynamoDB), the serverless **enterprise project**, then **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire S3.
:::

:::lang en
S3 cheat sheet.
:::

```bash
# Objets / Objects
awslocal s3 cp f s3://b/cle ; awslocal s3 sync dossier/ s3://b/prefixe/
awslocal s3 ls s3://b/ --recursive
awslocal s3 rb s3://b --force                       # vider + supprimer / empty + delete

# Versioning
awslocal s3api put-bucket-versioning --bucket b --versioning-configuration Status=Enabled
awslocal s3api list-object-versions --bucket b --prefix cle
awslocal s3api get-object --bucket b --key cle --version-id <ID> sortie

# Classe de stockage / Storage class
awslocal s3 cp f s3://b/cle --storage-class STANDARD_IA   # ou GLACIER
awslocal s3api head-object --bucket b --key cle --query StorageClass

# Cycle de vie & chiffrement / Lifecycle & encryption
awslocal s3api put-bucket-lifecycle-configuration --bucket b --lifecycle-configuration file://lc.json
awslocal s3api put-bucket-encryption --bucket b --server-side-encryption-configuration file://enc.json

# Site statique & URL présignée / Static site & presigned URL
awslocal s3 website s3://b/ --index-document index.html --error-document erreur.html
awslocal s3 presign s3://b/cle --expires-in 3600
```

## resources

:::lang fr
- [Documentation Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) — la référence complète.
- [Classes de stockage S3](https://aws.amazon.com/s3/storage-classes/) — comparatif coût/accès.
- [Gestion du cycle de vie](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html) — transitions et expiration.
- [Chiffrement S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html) — SSE-S3, SSE-KMS.
- [URL présignées](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — accès temporaire délégué.
:::

:::lang en
- [Amazon S3 documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) — the full reference.
- [S3 storage classes](https://aws.amazon.com/s3/storage-classes/) — cost/access comparison.
- [Lifecycle management](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html) — transitions and expiration.
- [S3 encryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html) — SSE-S3, SSE-KMS.
- [Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) — delegated temporary access.
:::

## troubleshooting

:::lang fr
**`BucketAlreadyExists` / `BucketAlreadyOwnedByYou`.** Le nom est pris (mondial en réel). Choisis un nom unique (préfixe avec un identifiant).

**`NoSuchBucket`.** Tu cibles un bucket qui n'existe pas (faute de frappe, ou déjà supprimé). Vérifie avec `awslocal s3 ls`.

**Le versioning ne garde pas d'anciennes versions.** Il n'était pas activé **avant** l'écrasement. Le versioning ne protège que les écritures **postérieures** à son activation.

**`head-object` renvoie `StorageClass: None`.** Normal pour un objet en **Standard** (la classe par défaut n'est pas affichée). Les classes non-standard (IA, Glacier) s'affichent bien.

**`MalformedXML` / erreur sur put-bucket-lifecycle.** Le JSON de la règle est invalide (champ mal nommé, `Status` manquant). Compare à l'exemple ; `Status` doit valoir `Enabled`.

**L'URL présignée renvoie `SignatureDoesNotMatch` ou est expirée.** Le délai `--expires-in` est passé, ou l'horloge/région diffère. Régénère l'URL.
:::

:::lang en
**`BucketAlreadyExists` / `BucketAlreadyOwnedByYou`.** The name is taken (global in reality). Pick a unique name (prefix with an identifier).

**`NoSuchBucket`.** You target a bucket that doesn't exist (typo, or already deleted). Check with `awslocal s3 ls`.

**Versioning doesn't keep old versions.** It wasn't enabled **before** the overwrite. Versioning only protects writes **after** its activation.

**`head-object` returns `StorageClass: None`.** Normal for a **Standard** object (the default class isn't shown). Non-standard classes (IA, Glacier) display fine.

**`MalformedXML` / error on put-bucket-lifecycle.** The rule JSON is invalid (misnamed field, missing `Status`). Compare to the example; `Status` must be `Enabled`.

**The presigned URL returns `SignatureDoesNotMatch` or is expired.** The `--expires-in` delay passed, or the clock/region differs. Regenerate the URL.
:::
