---
# — Identité (ne change JAMAIS une fois publié) —
id: gcp-projet-entreprise
slug: gcp-projet-entreprise
order: 56
status: published

# — Titres & accroches (bilingue) —
title_fr: "GCP — projet d'entreprise : plateforme d'ingestion événementielle"
title_en: "GCP — enterprise project: event-driven ingestion platform"
tagline_fr: "un pipeline Pub/Sub → traitement → Datastore + archive, en IaC."
tagline_en: "a Pub/Sub → processing → Datastore + archive pipeline, as IaC."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 300
repo: "googleapis/python-pubsub"
last_review: "2026-08-20"

# — Relations de parcours (par id) —
prerequisites: [gcp-messagerie, gcp-iam-terraform]
next: [gcp-passer-en-reel]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [projet-entreprise, pipeline-evenementiel, pub-sub, firestore-datastore, cloud-storage, dead-letter, fan-out, idempotence, terraform, moindre-privilege]
concepts_en: [enterprise-project, event-driven-pipeline, pub-sub, firestore-datastore, cloud-storage, dead-letter, fan-out, idempotence, terraform, least-privilege]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet de CV du track GCP : une plateforme d'ingestion événementielle complète — producteur → Pub/Sub → travailleur → Firestore/Datastore + archive Cloud Storage, avec dead-letter, fan-out analytique et idempotence — développée et exécutée EN LOCAL sur les émulateurs officiels, et décrite en Terraform (comptes de service au moindre privilège) validé contre le vrai provider. Un livrable d'ingénieur cloud, sans compte ni facture."
og_description_en: "The GCP track's CV project: a complete event-driven ingestion platform — producer → Pub/Sub → worker → Firestore/Datastore + Cloud Storage archive, with dead-letter, analytics fan-out and idempotence — built and run LOCALLY on the official emulators, and described in Terraform (least-privilege service accounts) validated against the real provider. A cloud-engineer deliverable, no account or bill."
---

## intro

:::lang fr
Voici le **livrable** du track GCP : un projet **complet, de niveau entreprise**, que tu pourras **présenter sur ton CV** et **défendre en entretien**. On ne fait pas un jouet — on construit une **plateforme d'ingestion événementielle** comme celles qui tournent en production : des événements « commande » arrivent, un **pipeline** les traite, les **stocke** de façon structurée, en **archive** la trace brute, gère les **pannes** (messages empoisonnés) et **diffuse** vers plusieurs consommateurs. Tout ce que tu as appris — Pub/Sub, Firestore/Datastore, Cloud Storage, IAM, Terraform — converge ici.

L'architecture : un **producteur** publie des commandes sur un **sujet Pub/Sub** ; un **travailleur** les **tire**, les **valide**, écrit un enregistrement structuré dans **Datastore** et **archive** la charge brute dans **Cloud Storage** ; les messages invalides partent en **dead-letter** ; un abonnement **analytique** reçoit sa propre copie (**fan-out**). Le tout est **découplé, résilient, idempotent**.

Et — c'est la marque du track — **tu le construis et le fais tourner EN LOCAL**, sur les **émulateurs officiels**, sans compte ni facture. L'infrastructure est **décrite en Terraform** (comptes de service au **moindre privilège**) et **validée** contre le vrai provider `google`. En clair : un projet qui **prouve** des compétences d'ingénieur cloud, réalisé à coût zéro, prêt à être déployé pour de vrai (guide suivant).

**Pour qui c'est :** tu as fait *messagerie* (Pub/Sub) et *IAM & Terraform*. C'est l'aboutissement — prévois une bonne session.

**Quand ce n'est PAS le bon choix :**

- Il te manque Pub/Sub ou Terraform → fais d'abord *messagerie* et *IAM & Terraform*.
- Tes émulateurs ne tournent pas → relance le labo (*fondamentaux*).
:::

:::lang en
Here's the **deliverable** of the GCP track: a **complete, enterprise-grade** project you can **put on your CV** and **defend in an interview**. We're not building a toy — we build an **event-driven ingestion platform** like the ones running in production: "order" events arrive, a **pipeline** processes them, **stores** them in structured form, **archives** the raw trace, handles **failures** (poison messages) and **fans out** to multiple consumers. Everything you learned — Pub/Sub, Firestore/Datastore, Cloud Storage, IAM, Terraform — converges here.

The architecture: a **producer** publishes orders to a **Pub/Sub topic**; a **worker** **pulls** them, **validates** them, writes a structured record to **Datastore** and **archives** the raw payload to **Cloud Storage**; invalid messages go to **dead-letter**; an **analytics** subscription gets its own copy (**fan-out**). All of it **decoupled, resilient, idempotent**.

And — the track's signature — **you build and run it LOCALLY**, on the **official emulators**, no account or bill. The infrastructure is **described in Terraform** (least-privilege service accounts) and **validated** against the real `google` provider. In short: a project that **proves** cloud-engineer skills, done at zero cost, ready to deploy for real (next guide).

**Who it's for:** you've done *messaging* (Pub/Sub) and *IAM & Terraform*. This is the culmination — set aside a good session.

**When it's NOT the right choice:**

- You're missing Pub/Sub or Terraform → do *messaging* and *IAM & Terraform* first.
- Your emulators aren't running → restart the lab (*fundamentals*).
:::

## objectives

:::lang fr
À la fin de ce projet, tu as construit et tu sais expliquer :

- Une **architecture événementielle** complète (producteur, sujet, travailleur, stockage, archive).
- L'**infrastructure en Terraform** : sujets, abonnements (dead-letter), bucket, **2 comptes de service** au **moindre privilège**.
- Un **producteur** qui publie des événements structurés (JSON + attributs).
- Un **travailleur** idempotent : valide, écrit en **Datastore**, archive en **Cloud Storage**.
- La **fiabilité** : **fan-out** analytique + **dead-letter** pour les messages invalides.
- Une **vérification bout en bout** (enregistrements, archives, copies analytiques).
- Comment **présenter ce projet** sur un CV et en entretien.
:::

:::lang en
By the end of this project, you've built and can explain:

- A complete **event-driven architecture** (producer, topic, worker, storage, archive).
- The **infrastructure in Terraform**: topics, subscriptions (dead-letter), bucket, **2 service accounts** at **least privilege**.
- A **producer** that publishes structured events (JSON + attributes).
- An idempotent **worker**: validates, writes to **Datastore**, archives to **Cloud Storage**.
- **Reliability**: analytics **fan-out** + **dead-letter** for invalid messages.
- An **end-to-end verification** (records, archives, analytics copies).
- How to **present this project** on a CV and in an interview.
:::

## prerequisites

:::lang fr
- Les guides **GCP messagerie** et **GCP IAM & Terraform** terminés.
- Le **labo local qui tourne** : émulateurs **Pub/Sub** (8085) et **Datastore** (8081), **fake-gcs** (4443).
- Les clients Python : `pip install google-cloud-pubsub google-cloud-datastore google-cloud-storage`.
- **Terraform** installé (pour la partie IaC).
- Variables exportées : `PUBSUB_EMULATOR_HOST=localhost:8085`, `DATASTORE_EMULATOR_HOST=localhost:8081`.
:::

:::lang en
- The **GCP messaging** and **GCP IAM & Terraform** guides done.
- The **local lab running**: **Pub/Sub** (8085) and **Datastore** (8081) emulators, **fake-gcs** (4443).
- The Python clients: `pip install google-cloud-pubsub google-cloud-datastore google-cloud-storage`.
- **Terraform** installed (for the IaC part).
- Exported variables: `PUBSUB_EMULATOR_HOST=localhost:8085`, `DATASTORE_EMULATOR_HOST=localhost:8081`.
:::

## concepts

:::lang fr
**Le scénario métier.** Une boutique en ligne émet un événement à chaque **commande passée**. Plusieurs traitements doivent réagir : enregistrer la commande (pour le suivi), l'archiver (pour l'audit/légal), l'agréger (pour l'analytique). Ces traitements ne doivent **pas** se bloquer entre eux, ni bloquer la prise de commande. C'est le cas d'usage canonique de l'**ingestion événementielle**.

**Le pipeline.** *Producteur* → *sujet `commandes`* → *abonnement `traitement`* → *travailleur* → (*Datastore* + *Cloud Storage*). En parallèle, l'abonnement *`analytique`* reçoit sa **copie** (fan-out). Les commandes **invalides** partent en **dead-letter** après échecs répétés. Chaque brique est **découplée** : on peut ajouter un consommateur sans toucher au producteur.

**Découplage & résilience.** Le producteur ne connaît pas les consommateurs. Si le travailleur tombe, les messages **s'accumulent** dans l'abonnement et sont traités à son retour (rien n'est perdu). Un pic de commandes ? Le sujet **absorbe**, le travailleur rattrape. C'est la promesse de l'asynchrone.

**Idempotence.** Pub/Sub garantit **au moins une fois** : un message peut arriver deux fois. On écrit en Datastore avec une **clé = l'id de commande** : réécrire la même commande est **sans effet de bord** (pas de doublon). C'est **la** règle d'or d'un pipeline correct.

**IaC vs exécution locale (le point d'honnêteté).** Terraform (provider `google`) parle au **vrai GCP**, **pas** aux émulateurs. Donc le projet a **deux faces cohérentes** : (1) l'**infra Terraform** — la définition *réelle*, **validée** en local (`init`/`fmt`/`validate`), déployée pour de vrai au guide suivant ; (2) un **`bootstrap.py`** qui crée **la même topologie** sur les émulateurs, pour faire tourner l'app **maintenant**, sans compte. Le `bootstrap` fait localement ce que `terraform apply` ferait en réel.

**Moindre privilège appliqué.** Deux comptes de service : le **producteur** n'a que `roles/pubsub.publisher` ; le **travailleur** a `roles/pubsub.subscriber` + `roles/datastore.user` + `roles/storage.objectAdmin`. Chacun **strictement** ce qu'il lui faut — le réflexe sécurité que défend l'ACE.
:::

:::lang en
**The business scenario.** An online shop emits an event on each **order placed**. Several processes must react: record the order (for tracking), archive it (for audit/legal), aggregate it (for analytics). These must **not** block each other, nor block order-taking. It's the canonical **event-driven ingestion** use case.

**The pipeline.** *Producer* → *topic `commandes`* → *subscription `traitement`* → *worker* → (*Datastore* + *Cloud Storage*). In parallel, the *`analytique`* subscription gets its **copy** (fan-out). **Invalid** orders go to **dead-letter** after repeated failures. Each block is **decoupled**: you can add a consumer without touching the producer.

**Decoupling & resilience.** The producer doesn't know the consumers. If the worker goes down, messages **pile up** in the subscription and are processed on its return (nothing lost). An order spike? The topic **absorbs**, the worker catches up. That's the async promise.

**Idempotence.** Pub/Sub guarantees **at-least-once**: a message can arrive twice. We write to Datastore with a **key = the order id**: rewriting the same order is **side-effect-free** (no duplicate). It's **the** golden rule of a correct pipeline.

**IaC vs local run (the honesty point).** Terraform (`google` provider) talks to **real GCP**, **not** the emulators. So the project has **two consistent faces**: (1) the **Terraform infra** — the *real* definition, **validated** locally (`init`/`fmt`/`validate`), deployed for real in the next guide; (2) a **`bootstrap.py`** that creates **the same topology** on the emulators, to run the app **now**, no account. The `bootstrap` does locally what `terraform apply` would do for real.

**Least privilege applied.** Two service accounts: the **producer** has only `roles/pubsub.publisher`; the **worker** has `roles/pubsub.subscriber` + `roles/datastore.user` + `roles/storage.objectAdmin`. Each **strictly** what it needs — the security reflex the ACE champions.
:::

:::figure gcp-projet-pipeline
caption_fr: "Schéma 1. La plateforme d'ingestion : le producteur publie sur le sujet 'commandes' ; l'abonnement 'traitement' alimente le travailleur (validation → Datastore + archive Cloud Storage), les commandes invalides partent en dead-letter ; l'abonnement 'analytique' reçoit sa propre copie (fan-out). L'infra est décrite en Terraform (2 comptes de service au moindre privilège) et rejouée sur les émulateurs par bootstrap.py."
caption_en: "Figure 1. The ingestion platform: the producer publishes to the 'commandes' topic; the 'traitement' subscription feeds the worker (validation → Datastore + Cloud Storage archive), invalid orders go to dead-letter; the 'analytique' subscription gets its own copy (fan-out). The infra is described in Terraform (2 least-privilege service accounts) and replayed on the emulators by bootstrap.py."
:::

## walkthrough

:::lang fr
On construit ainsi : cahier des charges & squelette → infra Terraform → producteur → travailleur → fiabilité (fan-out & dead-letter) → exécution bout en bout → emballage CV. Chaque étape ajoute une pièce **testée**.
:::

:::lang en
We build like this: spec & skeleton → Terraform infra → producer → worker → reliability (fan-out & dead-letter) → end-to-end run → CV packaging. Each step adds a **tested** piece.
:::

### step-01

:::lang fr
**Objectif.** Poser le **cahier des charges**, l'**architecture** et le **squelette** du projet.

**🤔 Un vrai projet a une structure.** On sépare l'**infra** (Terraform, la définition réelle) de l'**app** (Python, le code qui tourne). Cette séparation est un **signal de maturité** pour un recruteur.

Crée l'arborescence :
:::

:::lang en
**Goal.** Lay down the **spec**, the **architecture** and the project **skeleton**.

**🤔 A real project has structure.** We separate the **infra** (Terraform, the real definition) from the **app** (Python, the running code). This separation is a **maturity signal** to a recruiter.

Create the tree:
:::

```bash
mkdir -p ~/projet-commandes/infra ~/projet-commandes/app
cd ~/projet-commandes
# Structure cible / target structure :
#   infra/   -> Terraform (main.tf, variables.tf, outputs.tf)   [la définition RÉELLE]
#   app/     -> Python (bootstrap.py, producteur.py, travailleur.py, verifier.py)
#   README.md
```

:::lang fr
**✅ Vérification :** `ls ~/projet-commandes` montre `app` et `infra`. Tu tiens le **plan** : le producteur publie des commandes ; le travailleur valide, enregistre (Datastore) et archive (Storage) ; l'analytique reçoit une copie ; les invalides partent en dead-letter. Garde cette phrase en tête — c'est **exactement** ce que tu diras en entretien pour décrire le projet. Les prochaines étapes remplissent chaque dossier, **une pièce testée à la fois**.
:::

:::lang en
**✅ Check:** `ls ~/projet-commandes` shows `app` and `infra`. You hold the **plan**: the producer publishes orders; the worker validates, records (Datastore) and archives (Storage); analytics gets a copy; invalid ones go to dead-letter. Keep this sentence in mind — it's **exactly** what you'll say in an interview to describe the project. The next steps fill each folder, **one tested piece at a time**.
:::

### step-02

:::lang fr
**Objectif.** Écrire l'**infrastructure en Terraform** et la **valider** — la définition réelle du système.

**🤔 L'infra comme code, au moindre privilège.** On décrit : deux **sujets** (`commandes`, `commandes-rebut`), deux **abonnements** (`traitement` avec dead-letter, `analytique`), un **bucket** d'archive, et **deux comptes de service** avec **exactement** les rôles nécessaires. On `validate` contre le vrai provider — sans compte.

Crée `infra/main.tf` :
:::

:::lang en
**Goal.** Write the **infrastructure in Terraform** and **validate** it — the real definition of the system.

**🤔 Infra as code, least privilege.** We describe: two **topics** (`commandes`, `commandes-rebut`), two **subscriptions** (`traitement` with dead-letter, `analytique`), an archive **bucket**, and **two service accounts** with **exactly** the needed roles. We `validate` against the real provider — no account.

Create `infra/main.tf`:
:::

```hcl
# infra/main.tf
terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# --- Comptes de service (identités des workloads) ---
resource "google_service_account" "producteur" {
  account_id   = "svc-producteur"
  display_name = "Producteur d'événements commandes"
}

resource "google_service_account" "travailleur" {
  account_id   = "svc-travailleur"
  display_name = "Travailleur de traitement des commandes"
}

# --- Moindre privilège : chaque SA n'a que ce qu'il lui faut ---
resource "google_project_iam_member" "prod_publisher" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.producteur.email}"
}

resource "google_project_iam_member" "worker_subscriber" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.travailleur.email}"
}

resource "google_project_iam_member" "worker_datastore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.travailleur.email}"
}

resource "google_project_iam_member" "worker_storage" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.travailleur.email}"
}

# --- Messagerie : sujets + abonnements ---
resource "google_pubsub_topic" "commandes" {
  name = "commandes"
}

resource "google_pubsub_topic" "rebut" {
  name = "commandes-rebut"
}

resource "google_pubsub_subscription" "traitement" {
  name                 = "traitement"
  topic                = google_pubsub_topic.commandes.id
  ack_deadline_seconds = 20

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.rebut.id
    max_delivery_attempts = 5
  }
}

resource "google_pubsub_subscription" "analytique" {
  name  = "analytique"
  topic = google_pubsub_topic.commandes.id
}

# --- Archive : bucket Cloud Storage ---
resource "google_storage_bucket" "archive" {
  name          = "archive-commandes-${var.project_id}"
  location      = "EU"
  force_destroy = true

  versioning {
    enabled = true
  }
}
```

```hcl
# infra/variables.tf
variable "project_id" {
  type    = string
  default = "demo-projet"
}

variable "region" {
  type    = string
  default = "europe-west9"
}
```

```hcl
# infra/outputs.tf
output "topic_commandes" {
  value = google_pubsub_topic.commandes.name
}

output "bucket_archive" {
  value = google_storage_bucket.archive.name
}

output "sa_travailleur" {
  value = google_service_account.travailleur.email
}
```

```bash
cd ~/projet-commandes/infra
terraform init
terraform fmt
terraform validate
```

:::lang fr
**✅ Vérification :** `terraform validate` affiche **`Success! The configuration is valid.`**. Tu viens de décrire **tout** le système — messagerie, stockage, identités, droits — en une soixantaine de lignes **versionnables** et **revues en PR**. Note le **moindre privilège** : le producteur ne peut que **publier**, le travailleur ne peut que **s'abonner + écrire Datastore + gérer les objets**. ⚠️ Rappel : `validate` vérifie la **forme** sans compte ; le **déploiement réel** (`apply`) viendra au guide *passer en réel*. Pour **exécuter maintenant** en local, on rejoue la même topologie sur les émulateurs (étape suivante).
:::

:::lang en
**✅ Check:** `terraform validate` prints **`Success! The configuration is valid.`**. You just described the **whole** system — messaging, storage, identities, permissions — in about sixty **versionable**, **PR-reviewed** lines. Note the **least privilege**: the producer can only **publish**, the worker can only **subscribe + write Datastore + manage objects**. ⚠️ Reminder: `validate` checks the **shape** with no account; the **real deployment** (`apply`) comes in the *going real* guide. To **run now** locally, we replay the same topology on the emulators (next step).
:::

### step-03

:::lang fr
**Objectif.** Créer la topologie sur les **émulateurs** (`bootstrap.py`) et écrire le **producteur** — exécuté en live.

**🤔 Rejouer l'infra en local.** Comme Terraform vise le vrai GCP, un petit `bootstrap.py` crée **les mêmes** sujets et abonnements sur l'émulateur (ce que ferait `terraform apply` en réel). Puis le **producteur** publie des commandes : chacune est un **JSON** (le corps) avec des **attributs** (type, pays, priorité).

Crée `app/bootstrap.py` puis `app/producteur.py` :
:::

:::lang en
**Goal.** Create the topology on the **emulators** (`bootstrap.py`) and write the **producer** — run live.

**🤔 Replaying the infra locally.** Since Terraform targets real GCP, a small `bootstrap.py` creates **the same** topics and subscriptions on the emulator (what `terraform apply` would do for real). Then the **producer** publishes orders: each is a **JSON** (the body) with **attributes** (type, country, priority).

Create `app/bootstrap.py` then `app/producteur.py`:
:::

```python
# app/bootstrap.py — crée sur l'émulateur la même topologie que l'infra Terraform
import os
os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:8085"
from google.cloud import pubsub_v1
proj = "demo-projet"
pub = pubsub_v1.PublisherClient(); sub = pubsub_v1.SubscriberClient()
tp = lambda n: pub.topic_path(proj, n)
sp = lambda n: sub.subscription_path(proj, n)

# Idempotent : on repart propre / start clean
for s in sub.list_subscriptions(request={"project": f"projects/{proj}"}):
    sub.delete_subscription(request={"subscription": s.name})
for t in pub.list_topics(request={"project": f"projects/{proj}"}):
    pub.delete_topic(request={"topic": t.name})

pub.create_topic(request={"name": tp("commandes")})
pub.create_topic(request={"name": tp("commandes-rebut")})
sub.create_subscription(request={"name": sp("traitement"), "topic": tp("commandes"),
    "ack_deadline_seconds": 20,
    "dead_letter_policy": {"dead_letter_topic": tp("commandes-rebut"), "max_delivery_attempts": 5}})
sub.create_subscription(request={"name": sp("analytique"), "topic": tp("commandes")})
sub.create_subscription(request={"name": sp("rebut-veille"), "topic": tp("commandes-rebut")})
print("topologie créée : sujets=[commandes, commandes-rebut], abonnements=[traitement, analytique, rebut-veille]")
```

```python
# app/producteur.py — publie des commandes sur le sujet
import os, json
os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:8085"
from google.cloud import pubsub_v1
proj = "demo-projet"
pub = pubsub_v1.PublisherClient()
sujet = pub.topic_path(proj, "commandes")

commandes = [
    {"id": "CMD-1001", "client": "alice", "montant": 149.90, "pays": "FR"},
    {"id": "CMD-1002", "client": "bob",   "montant": 30.00,  "pays": "BE"},
    {"id": "CMD-1003", "client": "carla", "montant": 512.50, "pays": "FR"},
    {"id": "CMD-BAD",  "client": "",      "montant": -1,     "pays": "??"},  # invalide -> dead-letter
]
for c in commandes:
    data = json.dumps(c).encode()
    prio = "haute" if c["montant"] >= 500 else "normale"
    pub.publish(sujet, data, type="commande", pays=c["pays"], prio=prio).result()
print(f"{len(commandes)} commandes publiées sur 'commandes'")
```

```bash
cd ~/projet-commandes/app
export PUBSUB_EMULATOR_HOST=localhost:8085
python3 bootstrap.py
python3 producteur.py
```

:::lang fr
**✅ Vérification :** `bootstrap.py` affiche `topologie créée : ...` et `producteur.py` affiche `4 commandes publiées sur 'commandes'`. Les messages sont maintenant **en attente** dans les abonnements `traitement` et `analytique` (chacun sa copie). Note la commande **`CMD-BAD`** (client vide, montant négatif) : c'est notre **message empoisonné** volontaire, pour tester la robustesse. ⚠️ Chaque commande porte des **attributs** (`type`, `pays`, `prio`) en plus de son corps JSON — utiles pour filtrer/router sans désérialiser.
:::

:::lang en
**✅ Check:** `bootstrap.py` prints `topologie créée : ...` and `producteur.py` prints `4 commandes publiées sur 'commandes'`. The messages are now **waiting** in the `traitement` and `analytique` subscriptions (each its copy). Note the **`CMD-BAD`** order (empty client, negative amount): it's our deliberate **poison message**, to test robustness. ⚠️ Each order carries **attributes** (`type`, `pays`, `prio`) besides its JSON body — useful to filter/route without deserializing.
:::

### step-04

:::lang fr
**Objectif.** Écrire le **travailleur** : valider, écrire en **Datastore**, archiver en **Cloud Storage** — en live.

**🤔 Le cœur du pipeline.** Le travailleur **tire** l'abonnement `traitement`, **valide** chaque commande, écrit un **enregistrement structuré** dans Datastore (clé = id de commande → **idempotent**) et **archive** la charge brute dans le bucket. Les commandes **invalides** sont **nack**ées (elles seront redistribuées puis, après N échecs, envoyées en dead-letter).

⚠️ **Détail plateforme important :** le client **Cloud Storage** Python exige des identifiants ; contre **fake-gcs**, on passe des **`AnonymousCredentials`** et l'**endpoint** de l'émulateur. (En réel, on retire ces deux options : le client s'authentifie normalement.)

Crée `app/travailleur.py` :
:::

:::lang en
**Goal.** Write the **worker**: validate, write to **Datastore**, archive to **Cloud Storage** — live.

**🤔 The pipeline's heart.** The worker **pulls** the `traitement` subscription, **validates** each order, writes a **structured record** to Datastore (key = order id → **idempotent**) and **archives** the raw payload to the bucket. **Invalid** orders are **nack**ed (they'll be redelivered then, after N failures, sent to dead-letter).

⚠️ **Important platform detail:** the Python **Cloud Storage** client requires credentials; against **fake-gcs**, we pass **`AnonymousCredentials`** and the emulator **endpoint**. (On real GCP, you drop these two options: the client authenticates normally.)

Create `app/travailleur.py`:
:::

```python
# app/travailleur.py — valide, écrit en Datastore, archive en Cloud Storage
import os, json
os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:8085"
os.environ["DATASTORE_EMULATOR_HOST"] = "localhost:8081"
from google.cloud import pubsub_v1, datastore, storage
from google.auth.credentials import AnonymousCredentials
proj = "demo-projet"

sub = pubsub_v1.SubscriberClient()
ab = sub.subscription_path(proj, "traitement")
ds = datastore.Client(project=proj)
# fake-gcs : identifiants anonymes + endpoint émulateur (à retirer en réel)
gcs = storage.Client(project=proj, credentials=AnonymousCredentials(),
                     client_options={"api_endpoint": "http://localhost:4443"})
try:
    bucket = gcs.create_bucket("archive-commandes")
except Exception:
    bucket = gcs.bucket("archive-commandes")

def valide(c):
    return bool(c.get("id")) and c.get("client") and c.get("montant", 0) > 0

traites, rejetes = 0, 0
for _ in range(6):
    rep = sub.pull(request={"subscription": ab, "max_messages": 10})
    if not rep.received_messages:
        break
    for m in rep.received_messages:
        c = json.loads(m.message.data.decode())
        if not valide(c):
            # invalide -> nack (redistribution, puis dead-letter après N échecs)
            sub.modify_ack_deadline(request={"subscription": ab,
                "ack_ids": [m.ack_id], "ack_deadline_seconds": 0})
            rejetes += 1
            continue
        # Datastore : clé = id de commande -> écriture idempotente
        cle = ds.key("Commande", c["id"])
        ent = datastore.Entity(key=cle)
        ent.update({"client": c["client"], "montant": c["montant"],
                    "pays": c["pays"], "prio": dict(m.message.attributes).get("prio")})
        ds.put(ent)
        # Cloud Storage : archive de la charge brute
        bucket.blob(f"commandes/{c['id']}.json").upload_from_string(m.message.data)
        sub.acknowledge(request={"subscription": ab, "ack_ids": [m.ack_id]})
        traites += 1
    if traites >= 3:
        break
print(f"traités={traites} rejetés(nack)={rejetes}")
```

```bash
cd ~/projet-commandes/app
python3 travailleur.py
```

:::lang fr
**✅ Vérification :** le travailleur affiche `traités=3 rejetés(nack)=1`. Les **3** commandes valides sont écrites en Datastore **et** archivées dans le bucket ; la commande **invalide** (`CMD-BAD`) est **rejetée** (nack). Tu as un **worker complet** : validation métier, écriture structurée idempotente, archivage. ⚠️ L'**idempotence** vient de la **clé** Datastore (`Commande` + id) : si le même message est redélivré (at-least-once), on **réécrit** le même enregistrement, sans doublon. C'est ce qui rend le pipeline **correct** face aux redistributions.
:::

:::lang en
**✅ Check:** the worker prints `traités=3 rejetés(nack)=1`. The **3** valid orders are written to Datastore **and** archived in the bucket; the **invalid** order (`CMD-BAD`) is **rejected** (nack). You have a **complete worker**: business validation, idempotent structured write, archival. ⚠️ **Idempotence** comes from the Datastore **key** (`Commande` + id): if the same message is redelivered (at-least-once), we **rewrite** the same record, no duplicate. That's what makes the pipeline **correct** under redeliveries.
:::

### step-05

:::lang fr
**Objectif.** Éprouver la **fiabilité** : le **fan-out** analytique et le **dead-letter** — en live.

**🤔 Un événement, plusieurs usages.** L'abonnement `analytique` reçoit **sa propre copie** de **chaque** commande (y compris `CMD-BAD`) : l'analytique voit **tout le flux**, indépendamment du travailleur. Et la commande invalide, **nack**ée en boucle par le travailleur, finirait — après 5 tentatives — sur le sujet **`commandes-rebut`** (dead-letter), où l'abonnement `rebut-veille` permet de l'inspecter.

Vérifie le fan-out analytique :
:::

:::lang en
**Goal.** Stress-test **reliability**: the analytics **fan-out** and the **dead-letter** — live.

**🤔 One event, many uses.** The `analytique` subscription gets **its own copy** of **every** order (including `CMD-BAD`): analytics sees **the whole stream**, independently of the worker. And the invalid order, **nack**ed in a loop by the worker, would end up — after 5 attempts — on the **`commandes-rebut`** topic (dead-letter), where the `rebut-veille` subscription lets you inspect it.

Check the analytics fan-out:
:::

```python
# app/analytique.py — l'analytique voit tout le flux (fan-out indépendant)
import os
os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:8085"
from google.cloud import pubsub_v1
proj = "demo-projet"
sub = pubsub_v1.SubscriberClient()
an = sub.subscription_path(proj, "analytique")

rep = sub.pull(request={"subscription": an, "max_messages": 10})
print(f"analytique a reçu {len(rep.received_messages)} commandes (copie indépendante)")
for m in rep.received_messages:
    sub.acknowledge(request={"subscription": an, "ack_ids": [m.ack_id]})
```

```bash
cd ~/projet-commandes/app
python3 analytique.py
```

:::lang fr
**✅ Vérification :** `analytique.py` affiche `analytique a reçu 4 commandes (copie indépendante)` — **les 4**, y compris `CMD-BAD`. C'est le **fan-out** : l'analytique reçoit tout le flux, sans dépendre du travailleur (qui, lui, a filtré la mauvaise). ⚠️ **Dead-letter (concept vérifié à l'infra) :** la politique est **déclarée** dans le Terraform (`max_delivery_attempts = 5`) et **créée** sur l'émulateur par `bootstrap.py`. Le **routage effectif** de `CMD-BAD` vers `commandes-rebut` suppose 5 redistributions réelles — on le **conceptualise** ici (l'émulateur le déclencherait sur un cycle long ; le vrai GCP le fait en production). L'essentiel est **architectural** : les messages irrécupérables ont une **porte de sortie**, ils ne bloquent jamais la file.
:::

:::lang en
**✅ Check:** `analytique.py` prints `analytique a reçu 4 commandes (copie indépendante)` — **all 4**, including `CMD-BAD`. That's **fan-out**: analytics gets the whole stream, independent of the worker (which filtered out the bad one). ⚠️ **Dead-letter (concept verified at the infra):** the policy is **declared** in the Terraform (`max_delivery_attempts = 5`) and **created** on the emulator by `bootstrap.py`. The **actual routing** of `CMD-BAD` to `commandes-rebut` requires 5 real redeliveries — we **conceptualize** it here (the emulator would trigger it over a long cycle; real GCP does it in production). The key point is **architectural**: unrecoverable messages have an **exit door**, they never block the queue.
:::

### step-06

:::lang fr
**Objectif.** Lancer le pipeline **bout en bout** et **vérifier** le résultat — le moment « ça marche ».

**🤔 La preuve par la sortie.** On rejoue tout depuis zéro (bootstrap → produire → traiter) puis on **vérifie** les trois sorties : les **enregistrements** Datastore, les **archives** Storage, et les **copies** analytiques. C'est ce que tu montreras comme **démonstration**.

Crée `app/verifier.py`, puis lance la séquence complète :
:::

:::lang en
**Goal.** Run the pipeline **end-to-end** and **verify** the result — the "it works" moment.

**🤔 Proof by output.** We replay everything from scratch (bootstrap → produce → process) then **verify** the three outputs: Datastore **records**, Storage **archives**, and analytics **copies**. That's what you'll show as a **demo**.

Create `app/verifier.py`, then run the full sequence:
:::

```python
# app/verifier.py — vérifie les trois sorties du pipeline
import os
os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:8085"
os.environ["DATASTORE_EMULATOR_HOST"] = "localhost:8081"
from google.cloud import datastore, storage
from google.auth.credentials import AnonymousCredentials
proj = "demo-projet"

# 1) Datastore : les commandes enregistrées / recorded orders
ds = datastore.Client(project=proj)
cmds = list(ds.query(kind="Commande").fetch())
print("Datastore Commande :", sorted(e.key.name for e in cmds))

# 2) Cloud Storage : les archives / the archives
gcs = storage.Client(project=proj, credentials=AnonymousCredentials(),
                     client_options={"api_endpoint": "http://localhost:4443"})
blobs = sorted(b.name for b in gcs.list_blobs("archive-commandes"))
print("Archives Storage    :", blobs)

print("Pipeline OK" if len(cmds) == 3 and len(blobs) == 3 else "Pipeline INCOMPLET")
```

```bash
cd ~/projet-commandes/app
export PUBSUB_EMULATOR_HOST=localhost:8085 DATASTORE_EMULATOR_HOST=localhost:8081
python3 bootstrap.py && python3 producteur.py && python3 travailleur.py && python3 verifier.py
```

:::lang fr
**✅ Vérification :** la séquence se termine par :

```
Datastore Commande : ['CMD-1001', 'CMD-1002', 'CMD-1003']
Archives Storage    : ['commandes/CMD-1001.json', 'commandes/CMD-1002.json', 'commandes/CMD-1003.json']
Pipeline OK
```

Les **3** commandes valides sont **enregistrées** ET **archivées** ; la mauvaise a été écartée. **Ton pipeline fonctionne de bout en bout.** C'est **exactement** la démo à faire tourner devant un recruteur (ou à capturer en GIF dans ton README). ⚠️ Relance la séquence : le résultat est **identique** (idempotence + bootstrap propre) — un pipeline **déterministe**, marque d'un travail sérieux.
:::

:::lang en
**✅ Check:** the sequence ends with:

```
Datastore Commande : ['CMD-1001', 'CMD-1002', 'CMD-1003']
Archives Storage    : ['commandes/CMD-1001.json', 'commandes/CMD-1002.json', 'commandes/CMD-1003.json']
Pipeline OK
```

The **3** valid orders are **recorded** AND **archived**; the bad one was dropped. **Your pipeline works end-to-end.** It's **exactly** the demo to run in front of a recruiter (or capture as a GIF in your README). ⚠️ Re-run the sequence: the result is **identical** (idempotence + clean bootstrap) — a **deterministic** pipeline, the mark of serious work.
:::

### step-07

:::lang fr
**Objectif.** **Emballer** le projet pour ton CV, puis nettoyer.

**🤔 Un projet non présenté n'existe pas.** Le code, c'est la moitié ; savoir le **raconter** est l'autre. Un `README` clair, une phrase d'accroche, la liste des compétences prouvées — c'est ce qui transforme un dossier en **atout d'embauche**.

Crée `README.md` :
:::

:::lang en
**Goal.** **Package** the project for your CV, then clean up.

**🤔 An unpresented project doesn't exist.** The code is half; knowing how to **tell it** is the other. A clear `README`, a hook sentence, the list of proven skills — that's what turns a folder into a **hiring asset**.

Create `README.md`:
:::

```markdown
# Plateforme d'ingestion événementielle (GCP)

Pipeline événementiel : un producteur publie des commandes sur **Pub/Sub** ;
un travailleur idempotent les valide, les enregistre dans **Firestore/Datastore**
et archive la charge brute dans **Cloud Storage**. Fan-out vers un abonnement
analytique ; **dead-letter** pour les messages invalides. Infrastructure décrite
en **Terraform** (2 comptes de service au **moindre privilège**).

**Architecture**
Producteur → Pub/Sub `commandes` → abonnement `traitement` → Travailleur
→ Datastore + Cloud Storage. Abonnement `analytique` (fan-out). Dead-letter `commandes-rebut`.

**Stack**
Google Cloud (Pub/Sub, Firestore/Datastore, Cloud Storage, IAM), Terraform, Python.
Développé et testé **en local** sur les émulateurs officiels GCP.

**Lancer**
1. `cd infra && terraform init && terraform validate`   # valider l'infra
2. `cd ../app && python3 bootstrap.py && python3 producteur.py && python3 travailleur.py && python3 verifier.py`

**Compétences démontrées**
Architecture événementielle · découplage · idempotence · dead-letter · fan-out
· IaC (Terraform) · moindre privilège (IAM) · test local sur émulateurs.
```

```bash
# Nettoyage émulateurs (optionnel) / emulator cleanup (optional)
cd ~/projet-commandes/app && python3 bootstrap.py   # repart d'une topologie propre
# En RÉEL, le déploiement/retrait se fait avec / on REAL GCP, deploy/tear down with:
#   cd infra && terraform apply   # (guide "passer en réel")
#   cd infra && terraform destroy
```

:::lang fr
**✅ Vérification :** ton dossier `~/projet-commandes` contient `infra/` (Terraform validé), `app/` (pipeline qui tourne) et `README.md`. **Tu as un projet de CV complet.** La phrase d'accroche à réutiliser : *« J'ai conçu une plateforme d'ingestion événementielle sur GCP — Pub/Sub, Firestore/Datastore, Cloud Storage — avec Terraform et IAM au moindre privilège, développée et testée en local sur les émulateurs officiels. »* Pousse-le sur **GitHub** (avec le README). ⚠️ La dernière étape du track : **passer en réel** — brancher un vrai compte, `terraform apply`, garde-fous de coût, et la ligne d'arrivée : la **certification ACE**.
:::

:::lang en
**✅ Check:** your `~/projet-commandes` folder holds `infra/` (validated Terraform), `app/` (a running pipeline) and `README.md`. **You have a complete CV project.** The hook sentence to reuse: *"I designed an event-driven ingestion platform on GCP — Pub/Sub, Firestore/Datastore, Cloud Storage — with Terraform and least-privilege IAM, built and tested locally on the official emulators."* Push it to **GitHub** (with the README). ⚠️ The track's last step: **going real** — wire a real account, `terraform apply`, cost guardrails, and the finish line: the **ACE certification**.
:::

## pitfalls

:::lang fr
**1. Un travailleur non idempotent.** Sans clé stable (l'id de commande), une redistribution crée un **doublon**. Écris **par clé** ; c'est la parade au at-least-once.

**2. Oublier `AnonymousCredentials` avec fake-gcs.** Le client Storage Python exige des identifiants ; contre l'émulateur, passe `AnonymousCredentials()` + l'endpoint. En réel, retire-les.

**3. Croire que Terraform pilote les émulateurs.** Non : le provider `google` vise le vrai GCP. En local, `bootstrap.py` rejoue la topologie ; `terraform validate` prouve la config.

**4. Accorder trop de droits aux comptes de service.** Producteur = `publisher` **seulement** ; travailleur = juste `subscriber` + `datastore.user` + `storage.objectAdmin`. Jamais `Editor`/`Owner`.

**5. Traiter et analyser dans le même abonnement.** Le fan-out existe pour ça : **un abonnement par usage**. Mélanger, c'est se priver du découplage.

**6. Ignorer les messages empoisonnés.** Sans dead-letter, une commande corrompue tourne en boucle et bloque le worker. Déclare la politique (fait ici).

**7. Un projet sans README.** Le code seul ne se vend pas. Le README (architecture, stack, compétences) est ce que lit le recruteur **en premier**.
:::

:::lang en
**1. A non-idempotent worker.** Without a stable key (the order id), a redelivery creates a **duplicate**. Write **by key**; that's the at-least-once fix.

**2. Forgetting `AnonymousCredentials` with fake-gcs.** The Python Storage client requires credentials; against the emulator, pass `AnonymousCredentials()` + the endpoint. On real GCP, drop them.

**3. Thinking Terraform drives the emulators.** No: the `google` provider targets real GCP. Locally, `bootstrap.py` replays the topology; `terraform validate` proves the config.

**4. Over-granting service accounts.** Producer = `publisher` **only**; worker = just `subscriber` + `datastore.user` + `storage.objectAdmin`. Never `Editor`/`Owner`.

**5. Processing and analyzing in the same subscription.** Fan-out exists for this: **one subscription per use**. Mixing them forfeits the decoupling.

**6. Ignoring poison messages.** Without dead-letter, a corrupt order loops forever and blocks the worker. Declare the policy (done here).

**7. A project with no README.** Code alone doesn't sell. The README (architecture, stack, skills) is what the recruiter reads **first**.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Ton `infra/` **valide** (`terraform validate` → Success).
- [ ] `bootstrap.py` + `producteur.py` publient 4 commandes.
- [ ] `travailleur.py` affiche `traités=3 rejetés(nack)=1`.
- [ ] `analytique.py` reçoit **4** commandes (fan-out).
- [ ] `verifier.py` affiche **3** enregistrements Datastore et **3** archives → `Pipeline OK`.
- [ ] Tu expliques **découplage, idempotence, dead-letter, fan-out, moindre privilège**.
- [ ] Ton `README.md` raconte le projet en une phrase d'accroche.

Sept cases = tu as un **projet d'entreprise** défendable. La suite : passer en réel.
:::

:::lang en
You know it works when…

- [ ] Your `infra/` **validates** (`terraform validate` → Success).
- [ ] `bootstrap.py` + `producteur.py` publish 4 orders.
- [ ] `travailleur.py` prints `traités=3 rejetés(nack)=1`.
- [ ] `analytique.py` receives **4** orders (fan-out).
- [ ] `verifier.py` prints **3** Datastore records and **3** archives → `Pipeline OK`.
- [ ] You explain **decoupling, idempotence, dead-letter, fan-out, least privilege**.
- [ ] Your `README.md` tells the project in a hook sentence.

Seven boxes = you have a defensible **enterprise project**. Next up: going real.
:::

## next

:::lang fr
La dernière étape du track GCP → ACE :

1. **GCP — passer en réel** : créer un vrai projet, brancher les identifiants (ADC), poser des **garde-fous de coût** (budgets, alertes), faire un vrai `terraform apply` de cette infra, puis nettoyer avec `destroy`.
2. Et la **certification Associate Cloud Engineer** : ce que tu as construit couvre le cœur de l'examen (services, IAM, IaC, opérations).
:::

:::lang en
The last step of the GCP → ACE track:

1. **GCP — going real**: create a real project, wire credentials (ADC), set **cost guardrails** (budgets, alerts), run a real `terraform apply` of this infra, then clean up with `destroy`.
2. And the **Associate Cloud Engineer certification**: what you built covers the exam's core (services, IAM, IaC, operations).
:::

## cheatsheet

:::lang fr
Aide-mémoire du projet (depuis `~/projet-commandes`).
:::

:::lang en
Project cheat sheet (from `~/projet-commandes`).
:::

```bash
# Infra (définition réelle, validée en local) / infra (real definition, validated locally)
cd infra && terraform init && terraform fmt && terraform validate

# App (exécution locale sur émulateurs) / app (local run on emulators)
cd ../app
export PUBSUB_EMULATOR_HOST=localhost:8085 DATASTORE_EMULATOR_HOST=localhost:8081
python3 bootstrap.py      # crée la topologie sur l'émulateur / create topology on emulator
python3 producteur.py     # publie les commandes / publish orders
python3 travailleur.py    # valide -> Datastore + archive Storage / validate -> DS + Storage
python3 analytique.py     # fan-out : voit tout le flux / sees the whole stream
python3 verifier.py       # 3 enregistrements + 3 archives -> Pipeline OK
```

```text
Architecture : Producteur → Pub/Sub(commandes) → [traitement] → Travailleur → Datastore + Storage
                                                → [analytique] → (fan-out)
                          commandes invalides → dead-letter (commandes-rebut)
Moindre privilège : producteur=pubsub.publisher ; travailleur=pubsub.subscriber+datastore.user+storage.objectAdmin
```

## resources

:::lang fr
- [Architectures événementielles sur GCP](https://cloud.google.com/architecture/event-driven-architectures) — patterns de référence.
- [Pub/Sub — gérer les échecs](https://cloud.google.com/pubsub/docs/handling-failures) — dead-letter, retry.
- [Datastore — bonnes pratiques](https://cloud.google.com/datastore/docs/best-practices) — clés, requêtes, idempotence.
- [fake-gcs-server](https://github.com/fsouza/fake-gcs-server) — l'émulateur Cloud Storage.
- [Terraform sur GCP — structure de projet](https://cloud.google.com/docs/terraform/best-practices-for-terraform) — infra/, modules, state.
:::

:::lang en
- [Event-driven architectures on GCP](https://cloud.google.com/architecture/event-driven-architectures) — reference patterns.
- [Pub/Sub — handling failures](https://cloud.google.com/pubsub/docs/handling-failures) — dead-letter, retry.
- [Datastore — best practices](https://cloud.google.com/datastore/docs/best-practices) — keys, queries, idempotence.
- [fake-gcs-server](https://github.com/fsouza/fake-gcs-server) — the Cloud Storage emulator.
- [Terraform on GCP — project structure](https://cloud.google.com/docs/terraform/best-practices-for-terraform) — infra/, modules, state.
:::

## troubleshooting

:::lang fr
**`bootstrap.py` : erreur de connexion.** L'émulateur Pub/Sub n'est pas lancé (`localhost:8085`) ou `PUBSUB_EMULATOR_HOST` n'est pas exporté dans ce shell. Vérifie le labo (*fondamentaux*).

**`travailleur.py` : `DefaultCredentialsError` sur Storage.** Il manque `credentials=AnonymousCredentials()` (et l'`api_endpoint`) sur le client `storage.Client` — obligatoire contre fake-gcs.

**`travailleur.py` : `traités=0`.** As-tu lancé `producteur.py` **après** `bootstrap.py` ? Un abonnement ne reçoit que les messages publiés **après** sa création. Rejoue la séquence bootstrap → produire → traiter.

**`verifier.py` : moins de 3 archives/enregistrements.** Le travailleur n'a pas tout traité (relance-le : les messages non acquittés sont redistribués), ou `bootstrap.py` n'a pas été rejoué avant une nouvelle production. Repars propre : bootstrap → produire → traiter → vérifier.

**`terraform validate` échoue dans `infra/`.** Vérifie que `terraform init` a bien téléchargé le provider `google`, et que tes accolades/arguments correspondent au schéma (le message d'erreur pointe la ligne).

**Les résultats varient d'un run à l'autre.** Tu ne repars pas d'une topologie propre. `bootstrap.py` **réinitialise** (supprime puis recrée) — lance-le toujours en premier.
:::

:::lang en
**`bootstrap.py`: connection error.** The Pub/Sub emulator isn't running (`localhost:8085`) or `PUBSUB_EMULATOR_HOST` isn't exported in this shell. Check the lab (*fundamentals*).

**`travailleur.py`: `DefaultCredentialsError` on Storage.** You're missing `credentials=AnonymousCredentials()` (and the `api_endpoint`) on the `storage.Client` — required against fake-gcs.

**`travailleur.py`: `traités=0`.** Did you run `producteur.py` **after** `bootstrap.py`? A subscription only receives messages published **after** its creation. Replay bootstrap → produce → process.

**`verifier.py`: fewer than 3 archives/records.** The worker didn't process everything (re-run it: unacked messages are redelivered), or `bootstrap.py` wasn't replayed before a new production. Start clean: bootstrap → produce → process → verify.

**`terraform validate` fails in `infra/`.** Check that `terraform init` downloaded the `google` provider, and that your braces/arguments match the schema (the error message points to the line).

**Results vary from run to run.** You're not starting from a clean topology. `bootstrap.py` **resets** (deletes then recreates) — always run it first.
:::
