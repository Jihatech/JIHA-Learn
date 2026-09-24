---
# — Identité (ne change JAMAIS une fois publié) —
id: gcp-fondamentaux
slug: gcp-fondamentaux
order: 52
status: published

# — Titres & accroches (bilingue) —
title_fr: "GCP — les fondamentaux, en local"
title_en: "GCP — the fundamentals, locally"
tagline_fr: "gcloud, émulateurs, projets, régions, Cloud Storage, Pub/Sub."
tagline_en: "gcloud, emulators, projects, regions, Cloud Storage, Pub/Sub."

# — Métadonnées pédagogiques —
level: beginner
duration_min: 190
repo: "GoogleCloudPlatform/cloud-sdk-docker"
last_review: "2026-08-20"

# — Relations de parcours (par id) —
prerequisites: [docker-fondamentaux]
next: [gcp-stockage]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [modele-gcp, projets-ressources, regions-zones, gcloud-sdk, emulateurs-locaux, cloud-storage, pub-sub]
concepts_en: [gcp-model, projects-resources, regions-zones, gcloud-sdk, local-emulators, cloud-storage, pub-sub]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Démarre Google Cloud sans compte ni facture grâce aux émulateurs locaux : installe le SDK gcloud, comprends la hiérarchie des ressources (organisation, projets), les régions et zones, et manipule tes premiers services en local — un bucket Cloud Storage (via fake-gcs-server) et un sujet Pub/Sub (émulateur officiel). La base du track Associate Cloud Engineer (ACE)."
og_description_en: "Start Google Cloud with no account or bill thanks to local emulators: install the gcloud SDK, understand the resource hierarchy (organization, projects), regions and zones, and handle your first services locally — a Cloud Storage bucket (via fake-gcs-server) and a Pub/Sub topic (official emulator). The base of the Associate Cloud Engineer (ACE) track."
---

## intro

:::lang fr
Après AWS, voici **Google Cloud Platform (GCP)** — l'autre grand fournisseur, réputé pour ses données, son réseau mondial et Kubernetes (qu'il a inventé). Comme pour AWS, on veut apprendre **sans compte, sans carte, sans facture**. La différence : GCP n'a **pas** d'émulateur unique aussi complet que LocalStack. Mais Google fournit des **émulateurs officiels** pour ses services de données (Pub/Sub, Firestore/Datastore), et la communauté un émulateur de **Cloud Storage** (fake-gcs-server). On assemble ces briques pour un **vrai labo local**.

Ce guide pose les fondations : tu installes le **SDK `gcloud`** (l'outil en ligne de commande de GCP), tu montes le **labo local** (les émulateurs + fake-gcs dans Docker), tu comprends le **modèle GCP** (organisation → projets, régions & zones), et tu crées tes deux premiers objets — un **bucket Cloud Storage** et un **sujet Pub/Sub** — pour de vrai, en local. Tu repars avec le modèle mental des **façons d'interagir** avec GCP (console, `gcloud`, API/SDK, IaC).

C'est la première marche du track **Associate Cloud Engineer (ACE)**, la certification GCP d'entrée pour les ingénieurs cloud. Tout ce qui est **émulable** (stockage, messagerie, NoSQL) se fait en local ; les services qui **exigent un vrai compte** (machines Compute Engine, réseau VPC, IAM appliqué, GKE) sont vus en concept + `gcloud` + Terraform, et un guide final t'explique comment **passer en réel** proprement avec les garde-fous de coût.

**Pour qui c'est :** tu connais Docker, tu as peut-être fait le track AWS, et tu veux découvrir GCP sans risque financier.

**Quand ce n'est PAS le bon choix :**

- Tu n'as jamais lancé de conteneur → fais d'abord *Docker fondamentaux* (fake-gcs tourne dans Docker).
- Tu veux **tout de suite** cliquer dans la vraie console GCP → possible, mais ce track t'apprend d'abord les concepts sans facture ; le guide « passer en réel » viendra ensuite.
:::

:::lang en
After AWS, here's **Google Cloud Platform (GCP)** — the other big provider, known for data, its global network, and Kubernetes (which it invented). As with AWS, we want to learn **with no account, no card, no bill**. The difference: GCP has **no** single emulator as complete as LocalStack. But Google provides **official emulators** for its data services (Pub/Sub, Firestore/Datastore), and the community a **Cloud Storage** emulator (fake-gcs-server). We assemble these blocks into a **real local lab**.

This guide lays the foundations: you install the **`gcloud` SDK** (GCP's command-line tool), set up the **local lab** (the emulators + fake-gcs in Docker), understand the **GCP model** (organization → projects, regions & zones), and create your first two objects — a **Cloud Storage bucket** and a **Pub/Sub topic** — for real, locally. You leave with the mental model of the **ways to interact** with GCP (console, `gcloud`, API/SDK, IaC).

It's the first step of the **Associate Cloud Engineer (ACE)** track, GCP's entry certification for cloud engineers. Everything **emulatable** (storage, messaging, NoSQL) runs locally; the services that **require a real account** (Compute Engine machines, VPC networking, enforced IAM, GKE) are seen conceptually + `gcloud` + Terraform, and a final guide shows how to **go real** cleanly with cost guardrails.

**Who it's for:** you know Docker, maybe did the AWS track, and want to discover GCP without financial risk.

**When it's NOT the right choice:**

- You've never launched a container → do *Docker fundamentals* first (fake-gcs runs in Docker).
- You want to **immediately** click in the real GCP console → possible, but this track teaches the concepts bill-free first; the "go real" guide comes later.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Installer et configurer le **SDK `gcloud`**.
- Monter un **labo local** : émulateurs Pub/Sub & Datastore + Cloud Storage (fake-gcs) dans Docker.
- Expliquer le **modèle GCP** : organisation → dossiers → **projets** → ressources.
- Distinguer **régions** et **zones**, et savoir où vivent les ressources.
- Créer et manipuler un **bucket Cloud Storage** avec `gcloud storage` (en local).
- Créer un **sujet Pub/Sub** et faire circuler un message (émulateur).
- Nommer les **façons d'interagir** avec GCP (console, `gcloud`, API/SDK, IaC).
:::

:::lang en
By the end of this guide, you can:

- Install and configure the **`gcloud` SDK**.
- Set up a **local lab**: Pub/Sub & Datastore emulators + Cloud Storage (fake-gcs) in Docker.
- Explain the **GCP model**: organization → folders → **projects** → resources.
- Tell **regions** from **zones**, and know where resources live.
- Create and handle a **Cloud Storage bucket** with `gcloud storage` (locally).
- Create a **Pub/Sub topic** and move a message through it (emulator).
- Name the **ways to interact** with GCP (console, `gcloud`, API/SDK, IaC).
:::

## prerequisites

:::lang fr
- **Docker** installé et fonctionnel (fake-gcs-server tourne dedans).
- **Python 3** + `pip` (pour le client Pub/Sub) et **Java** (les émulateurs Google sont en Java — souvent déjà là, sinon `apt install default-jre`).
- ~2 Go de disque (SDK gcloud + composants émulateurs).
- Aucun compte Google Cloud, aucune carte bancaire. C'est tout l'intérêt.
:::

:::lang en
- **Docker** installed and working (fake-gcs-server runs inside it).
- **Python 3** + `pip` (for the Pub/Sub client) and **Java** (Google's emulators are Java-based — often already there, otherwise `apt install default-jre`).
- ~2 GB disk (gcloud SDK + emulator components).
- No Google Cloud account, no credit card. That's the whole point.
:::

## concepts

:::lang fr
**Le modèle GCP.** Tout est organisé en **hiérarchie** : une **organisation** (ton entreprise) contient des **dossiers** (départements, équipes), qui contiennent des **projets**, qui contiennent les **ressources** (machines, buckets…). Le **projet** est l'unité centrale : facturation, quotas, IAM et APIs y sont attachés. Chaque projet a un **ID unique mondialement**. En labo, on travaille avec un projet fictif (`demo-projet`).

**Régions et zones.** Comme AWS, GCP est découpé géographiquement. Une **région** est une zone du monde (`europe-west1` en Belgique, `europe-west9` à Paris). Chaque région contient des **zones** (`europe-west9-a`, `-b`, `-c`) — des datacenters isolés. Certaines ressources sont **zonales** (une VM vit dans une zone), d'autres **régionales** (répliquées sur plusieurs zones), d'autres **multirégionales** (un bucket peut l'être). Répartir sur plusieurs zones = haute disponibilité, un pilier de l'ACE.

**Le SDK `gcloud`.** L'outil en ligne de commande de GCP. `gcloud` gère l'identité, les projets, la config et la plupart des services. Deux compagnons : **`gcloud storage`** (Cloud Storage, ex-`gsutil`) et **`bq`** (BigQuery). En réel, `gcloud auth login` t'authentifie ; en labo, on n'a **pas** besoin d'auth (les émulateurs acceptent tout).

**Émulateurs locaux.** Google fournit des **émulateurs officiels** pour **Pub/Sub**, **Firestore**, **Datastore**, **Bigtable**, **Spanner** — ils tournent sur ta machine (via `gcloud beta emulators ...`), sans compte. Pour **Cloud Storage**, on utilise **fake-gcs-server** (communautaire, dans Docker). On configure les clients/outils pour taper ces émulateurs plutôt que le vrai GCP, via des **variables d'environnement** (`PUBSUB_EMULATOR_HOST`, endpoint de storage…).

**Cloud Storage (GCS).** Le stockage d'objets de GCP (équivalent de S3) : des **buckets** (nom unique mondial) contenant des **objets**. On le pilote avec **`gcloud storage`**. C'est le service de stockage phare — un guide entier lui est consacré ensuite.

**Pub/Sub.** Le service de **messagerie** de GCP : un **sujet** (topic) reçoit des messages, des **abonnements** (subscriptions) les distribuent aux consommateurs. C'est la brique de découplage et d'événementiel (comme SNS+SQS chez AWS réunis). Émulable en local — parfait pour apprendre.
:::

:::lang en
**The GCP model.** Everything is organized in a **hierarchy**: an **organization** (your company) contains **folders** (departments, teams), which contain **projects**, which contain the **resources** (machines, buckets…). The **project** is the central unit: billing, quotas, IAM and APIs attach to it. Each project has a **globally unique ID**. In the lab, we use a fictional project (`demo-projet`).

**Regions and zones.** Like AWS, GCP is split geographically. A **region** is a world area (`europe-west1` in Belgium, `europe-west9` in Paris). Each region contains **zones** (`europe-west9-a`, `-b`, `-c`) — isolated datacenters. Some resources are **zonal** (a VM lives in a zone), others **regional** (replicated across zones), others **multi-regional** (a bucket can be). Spreading across zones = high availability, an ACE pillar.

**The `gcloud` SDK.** GCP's command-line tool. `gcloud` handles identity, projects, config and most services. Two companions: **`gcloud storage`** (Cloud Storage, formerly `gsutil`) and **`bq`** (BigQuery). In real life, `gcloud auth login` authenticates you; in the lab, we **don't** need auth (the emulators accept anything).

**Local emulators.** Google provides **official emulators** for **Pub/Sub**, **Firestore**, **Datastore**, **Bigtable**, **Spanner** — they run on your machine (via `gcloud beta emulators ...`), no account. For **Cloud Storage**, we use **fake-gcs-server** (community, in Docker). We configure the clients/tools to hit these emulators instead of real GCP, via **environment variables** (`PUBSUB_EMULATOR_HOST`, the storage endpoint…).

**Cloud Storage (GCS).** GCP's object storage (S3's equivalent): **buckets** (globally unique name) holding **objects**. You drive it with **`gcloud storage`**. It's the flagship storage service — a whole guide is dedicated to it next.

**Pub/Sub.** GCP's **messaging** service: a **topic** receives messages, **subscriptions** distribute them to consumers. It's the decoupling and event-driven block (like AWS's SNS+SQS combined). Emulatable locally — perfect to learn.
:::

:::figure gcp-local-lab
caption_fr: "Schéma 1. Le labo GCP local : ta machine → gcloud & clients → émulateurs (Pub/Sub, Datastore via gcloud emulators) + Cloud Storage (fake-gcs-server dans Docker). Les mêmes commandes/API qu'en réel, sans compte ni facture."
caption_en: "Figure 1. The local GCP lab: your machine → gcloud & clients → emulators (Pub/Sub, Datastore via gcloud emulators) + Cloud Storage (fake-gcs-server in Docker). The same commands/APIs as the real thing, no account or bill."
:::

## walkthrough

:::lang fr
On avance ainsi : installer gcloud → monter le labo local → modèle & projet → régions & zones → premier bucket Cloud Storage → premier sujet Pub/Sub → façons d'interagir & nettoyage.
:::

:::lang en
We'll go like this: install gcloud → set up the local lab → model & project → regions & zones → first Cloud Storage bucket → first Pub/Sub topic → ways to interact & cleanup.
:::

### step-01

:::lang fr
**Objectif.** Installer le **SDK `gcloud`** et les composants d'émulateurs.

**🤔 Pourquoi le SDK complet.** `gcloud` est l'outil central ; les **émulateurs** (Pub/Sub, Datastore) sont des **composants** à ajouter. On installe le SDK puis ces composants, une fois.

Installe le SDK (Linux ; sur macOS/Windows, voir la doc officielle) :
:::

:::lang en
**Goal.** Install the **`gcloud` SDK** and the emulator components.

**🤔 Why the full SDK.** `gcloud` is the central tool; the **emulators** (Pub/Sub, Datastore) are **components** to add. We install the SDK then those components, once.

Install the SDK (Linux; on macOS/Windows, see the official docs):
:::

```bash
# Télécharger et extraire le SDK / download and extract the SDK
curl -sSO https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
tar -xzf google-cloud-cli-linux-x86_64.tar.gz
./google-cloud-sdk/install.sh --quiet --path-update true
export PATH="$PWD/google-cloud-sdk/bin:$PATH"   # ou relance ton shell / or restart your shell

# Vérifier / verify
gcloud --version | head -1

# Installer les composants d'émulateurs / install the emulator components
gcloud components install pubsub-emulator cloud-datastore-emulator beta --quiet
```

:::lang fr
**✅ Vérification :** `gcloud --version` affiche `Google Cloud SDK 5xx.x.x`. La commande `gcloud components list` montre `pubsub-emulator`, `cloud-datastore-emulator` et `beta` comme **Installed**. Tu as l'outil et les émulateurs — pas encore d'authentification, et c'est normal : en labo local, on n'en a pas besoin. ⚠️ Les émulateurs sont en **Java** : si `gcloud beta emulators` se plaint, installe un JRE (`apt install default-jre`).
:::

:::lang en
**✅ Check:** `gcloud --version` shows `Google Cloud SDK 5xx.x.x`. `gcloud components list` shows `pubsub-emulator`, `cloud-datastore-emulator` and `beta` as **Installed**. You have the tool and the emulators — no authentication yet, and that's fine: in the local lab, we don't need it. ⚠️ The emulators are **Java**-based: if `gcloud beta emulators` complains, install a JRE (`apt install default-jre`).
:::

### step-02

:::lang fr
**Objectif.** **Monter le labo local** : lancer les émulateurs et Cloud Storage (fake-gcs), et poser les variables d'environnement.

**🤔 Le montage.** Trois briques : l'émulateur **Pub/Sub** (port 8085), l'émulateur **Datastore** (port 8081), et **fake-gcs-server** pour Cloud Storage (port 4443, dans Docker). On dit ensuite aux clients/outils de taper **ces** endpoints via des variables — sinon ils viseraient le vrai GCP.

Lance les trois briques :
:::

:::lang en
**Goal.** **Set up the local lab**: launch the emulators and Cloud Storage (fake-gcs), and set the environment variables.

**🤔 The setup.** Three blocks: the **Pub/Sub** emulator (port 8085), the **Datastore** emulator (port 8081), and **fake-gcs-server** for Cloud Storage (port 4443, in Docker). We then tell clients/tools to hit **these** endpoints via variables — otherwise they'd target real GCP.

Launch the three blocks:
:::

```bash
# 1) Émulateur Pub/Sub (en arrière-plan) / Pub/Sub emulator (background)
gcloud beta emulators pubsub start --host-port=localhost:8085 --project=demo-projet &

# 2) Émulateur Datastore (pour le guide stockage) / Datastore emulator
gcloud beta emulators datastore start --host-port=localhost:8081 --project=demo-projet --no-store-on-disk &

# 3) Cloud Storage local via fake-gcs-server (Docker) / Cloud Storage via fake-gcs-server
docker run -d --name fakegcs -p 4443:4443 fsouza/fake-gcs-server \
  -scheme http -port 4443 -public-host localhost:4443

# 4) Variables : dire aux outils de viser les émulateurs / point tools at the emulators
export CLOUDSDK_AUTH_DISABLE_CREDENTIALS=True                          # pas d'auth en labo
export PUBSUB_EMULATOR_HOST=localhost:8085
export DATASTORE_EMULATOR_HOST=localhost:8081
export CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE=http://localhost:4443/  # gcloud storage -> fake-gcs
# (le projet, lui, se fige avec "gcloud config set project" à l'étape 3 / the project is set in step 3)
```

:::lang fr
**✅ Vérification :** `docker ps` montre `fakegcs` en cours. Les deux émulateurs `gcloud` affichent chacun `Server started` / `is now running` dans leur sortie. Une requête directe confirme que Cloud Storage local répond : `curl -s http://localhost:4443/storage/v1/b?project=demo-projet` renvoie un JSON (`"kind": "storage#buckets"`). ⚠️ **Garde ce shell ouvert** (les variables et les processus en arrière-plan y vivent). Astuce : mets ces exports dans un fichier `lab.env` et fais `source lab.env` à chaque session. Note : les émulateurs se pilotent via les **clients/`gcloud storage`**, pas via `gcloud pubsub` (qui, lui, vise toujours le vrai GCP).
:::

:::lang en
**✅ Check:** `docker ps` shows `fakegcs` running. Both `gcloud` emulators print `Server started` / `is now running` in their output. A direct request confirms local Cloud Storage answers: `curl -s http://localhost:4443/storage/v1/b?project=demo-projet` returns JSON (`"kind": "storage#buckets"`). ⚠️ **Keep this shell open** (the variables and background processes live in it). Tip: put these exports in a `lab.env` file and `source lab.env` each session. Note: the emulators are driven via the **client libraries/`gcloud storage`**, not via `gcloud pubsub` (which always targets real GCP).
:::

### step-03

:::lang fr
**Objectif.** Comprendre le **modèle GCP** et configurer ton **projet** de travail.

**🤔 Le projet, unité centrale.** Sur GCP, **tout** vit dans un **projet** : facturation, quotas, IAM, APIs. On configure `gcloud` pour cibler notre projet de labo `demo-projet`. En réel, tu créerais un projet avec un ID unique mondial ; ici il est fictif (les émulateurs s'en contentent).

Configure et inspecte :
:::

:::lang en
**Goal.** Understand the **GCP model** and set your working **project**.

**🤔 The project, central unit.** On GCP, **everything** lives in a **project**: billing, quotas, IAM, APIs. We configure `gcloud` to target our lab project `demo-projet`. In real life, you'd create a project with a globally unique ID; here it's fictional (the emulators are fine with it).

Configure and inspect:
:::

```bash
# Cibler le projet (déjà fait via la variable, on le fige dans la config) / set the project
gcloud config set project demo-projet

# Voir la config active / see the active config
gcloud config list

# La hiérarchie (en réel : organisation > dossiers > projets > ressources)
# The hierarchy (real: organization > folders > projects > resources)
gcloud config get-value project
```

:::lang fr
**✅ Vérification :** `gcloud config list` montre `project = demo-projet` sous `[core]`. `gcloud config get-value project` renvoie `demo-projet`. Tu as fixé le **contexte** de toutes tes futures commandes. Retiens la hiérarchie : **organisation → dossiers → projets → ressources**. Le **projet** est ce que tu manipules au quotidien (et ce qui, en réel, reçoit la facture). Chaque ressource que tu crées appartient à **ce** projet. ⚠️ En réel, l'ID de projet est **unique mondialement** et **immuable** — on le choisit avec soin (souvent `entreprise-app-env`).
:::

:::lang en
**✅ Check:** `gcloud config list` shows `project = demo-projet` under `[core]`. `gcloud config get-value project` returns `demo-projet`. You've fixed the **context** for all your future commands. Remember the hierarchy: **organization → folders → projects → resources**. The **project** is what you handle daily (and what, in real life, gets the bill). Every resource you create belongs to **this** project. ⚠️ In real life, the project ID is **globally unique** and **immutable** — chosen carefully (often `company-app-env`).
:::

### step-04

:::lang fr
**Objectif.** Créer ton **premier bucket Cloud Storage** et y déposer un objet — avec `gcloud storage`, en local.

**🤔 Le « hello world » de GCP.** Cloud Storage (GCS) est le stockage d'objets : des **fichiers** dans des **buckets**. On le pilote avec `gcloud storage` (l'outil moderne, ex-`gsutil`). Grâce à la variable `CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE`, ces commandes tapent **fake-gcs-server** en local — mais la syntaxe est **exactement** celle du vrai GCP.

Crée et remplis un bucket :
:::

:::lang en
**Goal.** Create your **first Cloud Storage bucket** and drop an object in it — with `gcloud storage`, locally.

**🤔 GCP's "hello world".** Cloud Storage (GCS) is object storage: **files** in **buckets**. You drive it with `gcloud storage` (the modern tool, formerly `gsutil`). Thanks to the `CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE` variable, these commands hit **fake-gcs-server** locally — but the syntax is **exactly** that of real GCP.

Create and fill a bucket:
:::

```bash
# Créer un bucket (gs:// = le schéma Cloud Storage) / create a bucket
gcloud storage buckets create gs://mon-premier-bucket

# Déposer un objet / drop an object
echo "Bonjour GCP depuis ma machine" > bonjour.txt
gcloud storage cp bonjour.txt gs://mon-premier-bucket/bonjour.txt

# Lister le contenu / list the content
gcloud storage ls gs://mon-premier-bucket/

# Relire l'objet / read the object back
gcloud storage cat gs://mon-premier-bucket/bonjour.txt
```

:::lang fr
**✅ Vérification :** `buckets create` affiche `Creating gs://mon-premier-bucket/...`. `cp` téléverse le fichier. `ls gs://mon-premier-bucket/` liste `gs://mon-premier-bucket/bonjour.txt`. `cat` renvoie `Bonjour GCP depuis ma machine`. Tu viens de stocker un objet dans le cloud (émulé) avec la **vraie** commande `gcloud storage` — la même créerait un vrai bucket en production. ⚠️ En réel, un nom de bucket est **unique mondialement** : `mon-premier-bucket` serait pris (on préfixe avec un identifiant unique).
:::

:::lang en
**✅ Check:** `buckets create` shows `Creating gs://mon-premier-bucket/...`. `cp` uploads the file. `ls gs://mon-premier-bucket/` lists `gs://mon-premier-bucket/bonjour.txt`. `cat` returns `Bonjour GCP depuis ma machine`. You just stored an object in the (emulated) cloud with the **real** `gcloud storage` command — the same would create a real bucket in production. ⚠️ In real life, a bucket name is **globally unique**: `mon-premier-bucket` would be taken (prefix with a unique identifier).
:::

### step-05

:::lang fr
**Objectif.** Créer ton **premier sujet Pub/Sub** et faire circuler un message — via l'émulateur.

**🤔 Le découplage par messages.** Pub/Sub, c'est un **sujet** où un producteur **publie**, et des **abonnements** qui distribuent aux consommateurs. C'est LA brique d'événementiel de GCP. L'émulateur se pilote via les **bibliothèques clientes** (ici Python) — car `gcloud pubsub` vise toujours le vrai GCP, pas l'émulateur. La variable `PUBSUB_EMULATOR_HOST` fait que le client tape l'émulateur local.

Installe le client et fais un cycle complet :
:::

:::lang en
**Goal.** Create your **first Pub/Sub topic** and move a message through it — via the emulator.

**🤔 Message decoupling.** Pub/Sub is a **topic** where a producer **publishes**, and **subscriptions** distribute to consumers. It's GCP's event-driven block. The emulator is driven via **client libraries** (here Python) — because `gcloud pubsub` always targets real GCP, not the emulator. The `PUBSUB_EMULATOR_HOST` variable makes the client hit the local emulator.

Install the client and run a full cycle:
:::

```bash
pip install google-cloud-pubsub
# PUBSUB_EMULATOR_HOST est déjà exporté (étape 2) / already exported in step 2
```

```python
# premier_pubsub.py
from google.cloud import pubsub_v1
projet = "demo-projet"
pub = pubsub_v1.PublisherClient()
sub = pubsub_v1.SubscriberClient()

sujet = pub.topic_path(projet, "commandes")
abonnement = sub.subscription_path(projet, "traiteur")

pub.create_topic(request={"name": sujet})
sub.create_subscription(request={"name": abonnement, "topic": sujet})
print("sujet et abonnement créés")

pub.publish(sujet, b"commande #42").result()
print("message publié")

reponse = sub.pull(request={"subscription": abonnement, "max_messages": 10})
for msg in reponse.received_messages:
    print("reçu :", msg.message.data.decode())
    sub.acknowledge(request={"subscription": abonnement, "ack_ids": [msg.ack_id]})
```

```bash
python3 premier_pubsub.py
```

:::lang fr
**✅ Vérification :** le script affiche `sujet et abonnement créés`, `message publié`, puis `reçu : commande #42`. Tu viens de faire circuler un message de bout en bout dans Pub/Sub, **en local** : un producteur publie sur un **sujet**, un **abonnement** délivre au consommateur, qui **acquitte** (ack) le message une fois traité. C'est le socle de toute architecture événementielle GCP — approfondi au guide *messagerie*. ⚠️ En réel, tu utiliserais la même bibliothèque **sans** `PUBSUB_EMULATOR_HOST` (elle viserait alors le vrai Pub/Sub), et `gcloud pubsub topics create` pour la CLI.
:::

:::lang en
**✅ Check:** the script prints `sujet et abonnement créés`, `message publié`, then `reçu : commande #42`. You just moved a message end-to-end through Pub/Sub, **locally**: a producer publishes to a **topic**, a **subscription** delivers to the consumer, which **acknowledges** (ack) the message once processed. It's the foundation of any GCP event-driven architecture — deepened in the *messaging* guide. ⚠️ In real life, you'd use the same library **without** `PUBSUB_EMULATOR_HOST` (it would then target real Pub/Sub), and `gcloud pubsub topics create` for the CLI.
:::

### step-06

:::lang fr
**Objectif.** Ancrer les **façons d'interagir** avec GCP et les **essentiels `gcloud`**.

**🤔 Choisir le bon outil.** Comme AWS, GCP se pilote de quatre façons : la **console** web (explorer), la **CLI `gcloud`** (scripter, reproduire), l'**API/SDK** (depuis ton code — ce qu'on a fait pour Pub/Sub), et l'**IaC** (Terraform provider `google`, pour du reproductible versionné). En pro, on vit surtout en **`gcloud`** et **Terraform**.

Explore les essentiels `gcloud` :
:::

:::lang en
**Goal.** Anchor the **ways to interact** with GCP and the **`gcloud` essentials**.

**🤔 Pick the right tool.** Like AWS, GCP is driven four ways: the web **console** (explore), the **`gcloud` CLI** (script, reproduce), the **API/SDK** (from your code — what we did for Pub/Sub), and **IaC** (Terraform `google` provider, for versioned reproducibility). In the field, you mostly live in **`gcloud`** and **Terraform**.

Explore the `gcloud` essentials:
:::

```bash
# Config & contexte / config & context
gcloud config list                       # projet, compte, région actifs / active project, account, region
gcloud config configurations list        # profils de config (comme les profils AWS) / config profiles

# Aide & découverte / help & discovery
gcloud storage --help | head -n 15       # les sous-commandes de storage / storage subcommands
gcloud storage ls                        # tous tes buckets locaux / all your local buckets

# Formats de sortie (utile partout) / output formats (useful everywhere)
gcloud storage buckets list --format="value(name)"   # juste les noms / just the names
gcloud storage buckets list --format=json | head     # JSON complet / full JSON
```

:::lang fr
**✅ Vérification :** `gcloud config list` affiche ton projet et le fait que l'auth est désactivée (labo). `gcloud storage ls` liste `gs://mon-premier-bucket/`. `--format="value(name)"` extrait juste le nom du bucket — l'équivalent GCP des `--query`/`--output` d'AWS. Retiens les **4 façons** : console (explorer), `gcloud` (CLI), API/SDK (code), Terraform (IaC). Ce track te fait vivre surtout **`gcloud`** (ce guide) et **Terraform** (guide IAM/IaC) — les deux compétences pro de l'ACE.
:::

:::lang en
**✅ Check:** `gcloud config list` shows your project and that auth is disabled (lab). `gcloud storage ls` lists `gs://mon-premier-bucket/`. `--format="value(name)"` extracts just the bucket name — GCP's equivalent of AWS's `--query`/`--output`. Remember the **4 ways**: console (explore), `gcloud` (CLI), API/SDK (code), Terraform (IaC). This track has you live mostly in **`gcloud`** (this guide) and **Terraform** (IAM/IaC guide) — the ACE's two pro skills.
:::

### step-07

:::lang fr
**Objectif.** Ranger ton labo — arrêter les émulateurs et nettoyer.

**🤔 L'hygiène de labo.** En local, rien ne facture, mais prends dès maintenant le réflexe **créer → utiliser → nettoyer** (crucial en réel). On supprime le bucket, on arrête fake-gcs, et on stoppe les émulateurs.

Nettoie :
:::

:::lang en
**Goal.** Tidy your lab — stop the emulators and clean up.

**🤔 Lab hygiene.** Locally, nothing bills, but build the **create → use → clean up** reflex now (crucial in real life). We delete the bucket, stop fake-gcs, and stop the emulators.

Clean up:
:::

```bash
# Supprimer les objets, puis le bucket / delete the objects, then the bucket
gcloud storage rm gs://mon-premier-bucket/**          # les objets / the objects
gcloud storage buckets delete gs://mon-premier-bucket # le bucket / the bucket
# En réel, "gcloud storage rm --recursive gs://mon-premier-bucket" fait les deux d'un coup.
# On real GCP, "gcloud storage rm --recursive gs://mon-premier-bucket" does both at once.

# Arrêter Cloud Storage local / stop local Cloud Storage
docker stop fakegcs && docker rm fakegcs

# Arrêter les émulateurs gcloud (ils tournent en arrière-plan de ce shell) / stop the emulators
#   -> Ctrl+C sur leurs processus, ou :
kill %1 %2 2>/dev/null            # les jobs lancés à l'étape 2 / the background jobs from step 2
jobs                              # vérifier qu'ils sont arrêtés / check they're stopped
```

:::lang fr
**✅ Vérification :** après `rm gs://.../**` puis `buckets delete`, le bucket a disparu (`gcloud storage ls` ne le liste plus). `docker ps` ne montre plus `fakegcs`. `jobs` ne liste plus les émulateurs. Ton labo est rangé. ⚠️ **Note émulateur :** contre fake-gcs, ces commandes de suppression peuvent afficher un avertissement **inoffensif** (`'NoneType' object has no attribute 'items'` ou un `404` sur « managed folders ») **même quand la suppression réussit** — c'est une limite de l'émulateur, pas un vrai problème (vérifie avec `gcloud storage ls` que le bucket est bien parti). Réflexe **crucial** transféré au réel : **toujours nettoyer** ce que tu crées (une ressource oubliée = une facture).
:::

:::lang en
**✅ Check:** after `rm gs://.../**` then `buckets delete`, the bucket is gone (`gcloud storage ls` no longer lists it). `docker ps` no longer shows `fakegcs`. `jobs` no longer lists the emulators. Your lab is tidy. ⚠️ **Emulator note:** against fake-gcs, these delete commands may print a **harmless** warning (`'NoneType' object has no attribute 'items'` or a `404` on "managed folders") **even when the deletion succeeds** — an emulator limitation, not a real problem (confirm with `gcloud storage ls` that the bucket is gone). **Crucial** reflex to carry to real life: **always clean up** what you create (a forgotten resource = a bill).
:::

## pitfalls

:::lang fr
**1. Piloter Pub/Sub avec `gcloud pubsub` en labo.** `gcloud pubsub` vise **toujours le vrai GCP**, pas l'émulateur (il n'y a pas de variable d'override pour lui). Pour l'émulateur, on passe par les **bibliothèques clientes** (avec `PUBSUB_EMULATOR_HOST`). `gcloud storage`, en revanche, sait viser fake-gcs via l'override d'endpoint.

**2. Oublier les variables d'environnement.** `PUBSUB_EMULATOR_HOST`, `DATASTORE_EMULATOR_HOST`, l'override de storage : sans elles, tes outils tapent le **vrai** GCP (et échouent faute d'auth). Mets-les dans un `lab.env` et `source`-le à chaque session.

**3. Fermer le shell des émulateurs.** Les émulateurs `gcloud` tournent en **avant-plan/arrière-plan** du shell. Ferme-le et ils s'arrêtent. Garde-le ouvert, ou lance-les dans `tmux`/`screen`.

**4. Confondre région et zone.** La **région** est géographique (`europe-west9` = Paris) ; la **zone** est un datacenter dedans (`europe-west9-a`). Une VM est **zonale**, un bucket peut être **multirégional**. L'ACE teste ça.

**5. Croire que le projet est optionnel.** Sur GCP, **toute** ressource appartient à un **projet**. Sans projet configuré, la plupart des commandes échouent. `gcloud config set project ...` d'abord.

**6. Nom de bucket non unique (en réel).** Comme S3, les noms GCS sont **mondiaux**. `mon-premier-bucket` est pris. Préfixe en réel. En local (fake-gcs), pas de collision — mais prends l'habitude.

**7. Attendre que fake-gcs émule TOUT Cloud Storage.** Il couvre l'essentiel (buckets, objets, listing) mais pas toutes les fonctions avancées (certaines options de cycle de vie, IAM sur bucket…). Pour apprendre les commandes de base, il est parfait ; pour le pointu, c'est le vrai GCP.
:::

:::lang en
**1. Driving Pub/Sub with `gcloud pubsub` in the lab.** `gcloud pubsub` **always targets real GCP**, not the emulator (there's no override variable for it). For the emulator, go through the **client libraries** (with `PUBSUB_EMULATOR_HOST`). `gcloud storage`, however, can target fake-gcs via the endpoint override.

**2. Forgetting the environment variables.** `PUBSUB_EMULATOR_HOST`, `DATASTORE_EMULATOR_HOST`, the storage override: without them, your tools hit **real** GCP (and fail for lack of auth). Put them in a `lab.env` and `source` it each session.

**3. Closing the emulators' shell.** The `gcloud` emulators run in the shell's **foreground/background**. Close it and they stop. Keep it open, or run them in `tmux`/`screen`.

**4. Confusing region and zone.** The **region** is geographic (`europe-west9` = Paris); the **zone** is a datacenter within it (`europe-west9-a`). A VM is **zonal**, a bucket can be **multi-regional**. The ACE tests this.

**5. Thinking the project is optional.** On GCP, **every** resource belongs to a **project**. Without a configured project, most commands fail. `gcloud config set project ...` first.

**6. Non-unique bucket name (in real life).** Like S3, GCS names are **global**. `mon-premier-bucket` is taken. Prefix in real life. Locally (fake-gcs), no collision — but build the habit.

**7. Expecting fake-gcs to emulate ALL of Cloud Storage.** It covers the essentials (buckets, objects, listing) but not every advanced feature (some lifecycle options, bucket IAM…). To learn the basic commands, it's perfect; for the advanced, it's real GCP.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] `gcloud --version` répond et les composants émulateurs sont installés.
- [ ] Les trois briques du labo tournent (Pub/Sub, Datastore, fake-gcs) et les variables sont posées.
- [ ] Tu expliques organisation → projets → ressources, et région vs zone.
- [ ] Tu crées un bucket, y déposes un objet, le relis avec `gcloud storage`.
- [ ] Tu fais circuler un message Pub/Sub (publish → pull → ack) via l'émulateur.
- [ ] Tu nommes les 4 façons d'interagir et tu utilises `--format`.
- [ ] Tu nettoies ton labo (bucket, conteneur, émulateurs).

Sept cases = ton labo GCP local tourne, tu tiens les bases. La suite : le stockage (Cloud Storage + Firestore/Datastore).
:::

:::lang en
You know it works when…

- [ ] `gcloud --version` answers and the emulator components are installed.
- [ ] The three lab blocks run (Pub/Sub, Datastore, fake-gcs) and the variables are set.
- [ ] You explain organization → projects → resources, and region vs zone.
- [ ] You create a bucket, drop an object, read it back with `gcloud storage`.
- [ ] You move a Pub/Sub message (publish → pull → ack) via the emulator.
- [ ] You name the 4 ways to interact and use `--format`.
- [ ] You clean up your lab (bucket, container, emulators).

Seven boxes = your local GCP lab runs, you hold the basics. Next up: storage (Cloud Storage + Firestore/Datastore).
:::

## next

:::lang fr
La suite du track GCP → ACE :

1. **GCP — stockage** : Cloud Storage en profondeur (classes, versioning, cycle de vie) et **Firestore/Datastore** (base NoSQL) via l'émulateur — le stockage sous toutes ses formes.
2. Plus loin : Pub/Sub en profondeur, IAM & Terraform, le **projet d'entreprise** événementiel, puis **passer en réel**.
:::

:::lang en
The GCP → ACE track continues:

1. **GCP — storage**: Cloud Storage in depth (classes, versioning, lifecycle) and **Firestore/Datastore** (NoSQL database) via the emulator — storage in all its forms.
2. Further along: Pub/Sub in depth, IAM & Terraform, the event-driven **enterprise project**, then **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire GCP local.
:::

:::lang en
GCP local cheat sheet.
:::

```bash
# Labo local (variables) / local lab (variables)
export CLOUDSDK_CORE_PROJECT=demo-projet
export CLOUDSDK_AUTH_DISABLE_CREDENTIALS=True
export PUBSUB_EMULATOR_HOST=localhost:8085
export DATASTORE_EMULATOR_HOST=localhost:8081
export CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE=http://localhost:4443/

# Émulateurs / emulators
gcloud beta emulators pubsub start --host-port=localhost:8085 --project=demo-projet &
gcloud beta emulators datastore start --host-port=localhost:8081 --project=demo-projet --no-store-on-disk &
docker run -d --name fakegcs -p 4443:4443 fsouza/fake-gcs-server -scheme http -port 4443 -public-host localhost:4443

# Config & projet / config & project
gcloud config set project demo-projet
gcloud config list

# Cloud Storage (gcloud storage) — même syntaxe qu'en réel / same syntax as real
gcloud storage buckets create gs://bucket
gcloud storage cp fichier gs://bucket/     ;  gcloud storage ls gs://bucket/
gcloud storage cat gs://bucket/fichier     ;  gcloud storage rm --recursive gs://bucket

# Pub/Sub -> via bibliothèque cliente (pas gcloud) / via client library (not gcloud)
#   client Python : PublisherClient / SubscriberClient (avec PUBSUB_EMULATOR_HOST)
```

## resources

:::lang fr
- [Installer le SDK gcloud](https://cloud.google.com/sdk/docs/install) — toutes plateformes.
- [Émulateurs locaux GCP](https://cloud.google.com/sdk/gcloud/reference/beta/emulators) — Pub/Sub, Datastore, Firestore…
- [fake-gcs-server](https://github.com/fsouza/fake-gcs-server) — l'émulateur Cloud Storage communautaire.
- [Hiérarchie des ressources GCP](https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy) — organisation, projets.
- [Certification Associate Cloud Engineer](https://cloud.google.com/learn/certification/cloud-engineer) — la certification visée.
:::

:::lang en
- [Install the gcloud SDK](https://cloud.google.com/sdk/docs/install) — all platforms.
- [GCP local emulators](https://cloud.google.com/sdk/gcloud/reference/beta/emulators) — Pub/Sub, Datastore, Firestore…
- [fake-gcs-server](https://github.com/fsouza/fake-gcs-server) — the community Cloud Storage emulator.
- [GCP resource hierarchy](https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy) — organization, projects.
- [Associate Cloud Engineer certification](https://cloud.google.com/learn/certification/cloud-engineer) — the target certification.
:::

## troubleshooting

:::lang fr
**`gcloud storage` : erreur d'authentification ou de proxy.** En labo, exporte `CLOUDSDK_AUTH_DISABLE_CREDENTIALS=True` et l'override d'endpoint `CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE=http://localhost:4443/`. Vérifie que `fakegcs` tourne (`docker ps`).

**Le client Pub/Sub vise le vrai GCP (erreur d'auth).** `PUBSUB_EMULATOR_HOST=localhost:8085` n'est pas exporté dans **ce** shell. Ré-exporte-le (ou `source lab.env`).

**`gcloud beta emulators ...` : « command not found » ou erreur Java.** Le composant n'est pas installé (`gcloud components install pubsub-emulator beta`) ou il manque un JRE (`apt install default-jre`).

**`curl http://localhost:4443/...` ne répond pas.** fake-gcs n'est pas lancé, ou le port 4443 est pris. `docker ps`, `docker logs fakegcs`, ou mappe un autre port.

**Un émulateur « occupe » un port déjà pris.** Un autre process écoute sur 8085/8081/4443. Arrête-le, ou change le `--host-port` / le mapping Docker et adapte les variables.

**`gcloud pubsub topics create` échoue en labo.** Normal : `gcloud pubsub` ne parle **pas** à l'émulateur. Utilise la bibliothèque cliente pour l'émulateur ; `gcloud pubsub` est pour le vrai GCP.
:::

:::lang en
**`gcloud storage`: auth or proxy error.** In the lab, export `CLOUDSDK_AUTH_DISABLE_CREDENTIALS=True` and the endpoint override `CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE=http://localhost:4443/`. Check `fakegcs` is running (`docker ps`).

**The Pub/Sub client targets real GCP (auth error).** `PUBSUB_EMULATOR_HOST=localhost:8085` isn't exported in **this** shell. Re-export it (or `source lab.env`).

**`gcloud beta emulators ...`: "command not found" or Java error.** The component isn't installed (`gcloud components install pubsub-emulator beta`) or a JRE is missing (`apt install default-jre`).

**`curl http://localhost:4443/...` doesn't answer.** fake-gcs isn't running, or port 4443 is taken. `docker ps`, `docker logs fakegcs`, or map another port.

**An emulator "port already in use".** Another process listens on 8085/8081/4443. Stop it, or change the `--host-port` / Docker mapping and adjust the variables.

**`gcloud pubsub topics create` fails in the lab.** Normal: `gcloud pubsub` does **not** talk to the emulator. Use the client library for the emulator; `gcloud pubsub` is for real GCP.
:::
