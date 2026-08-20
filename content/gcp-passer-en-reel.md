---
# — Identité (ne change JAMAIS une fois publié) —
id: gcp-passer-en-reel
slug: gcp-passer-en-reel
order: 57
status: published

# — Titres & accroches (bilingue) —
title_fr: "GCP — passer en réel proprement"
title_en: "GCP — going real, cleanly"
tagline_fr: "projet, facturation, ADC, garde-fous de coût, ce que les émulateurs cachaient."
tagline_en: "project, billing, ADC, cost guardrails, what the emulators hid."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 190
repo: "hashicorp/terraform-provider-google"
last_review: "2026-08-20"

# — Relations de parcours (par id) —
prerequisites: [gcp-projet-entreprise]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [projet-gcp, facturation, adc-authentification, garde-fous-cout, budgets-alertes, activer-apis, terraform-apply-reel, emulateurs-vs-reel, certification-ace]
concepts_en: [gcp-project, billing, adc-authentication, cost-guardrails, budgets-alerts, enable-apis, terraform-apply-real, emulators-vs-real, ace-certification]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "La transition du labo au vrai Google Cloud, sans mauvaise surprise : créer un projet et lier la facturation (crédits d'essai + palier Always Free), s'authentifier proprement (gcloud + ADC pour Terraform), poser des garde-fous de coût AVANT toute ressource (budgets Cloud Billing + alertes), activer les APIs, créer la base Firestore/Datastore, déployer ton projet Terraform pour de vrai (apply) puis tout démonter (destroy + suppression du projet), et comprendre ce que les émulateurs cachaient (IAM appliqué, unicité mondiale, dead-letter réel, cohérence, quotas). Plus la feuille de route vers la certification ACE."
og_description_en: "The transition from lab to real Google Cloud, with no nasty surprise: create a project and link billing (trial credits + Always Free tier), authenticate cleanly (gcloud + ADC for Terraform), set cost guardrails BEFORE any resource (Cloud Billing budgets + alerts), enable APIs, create the Firestore/Datastore database, deploy your Terraform project for real (apply) then tear it all down (destroy + project deletion), and understand what the emulators hid (IAM enforced, global uniqueness, real dead-letter, consistency, quotas). Plus the roadmap to the ACE certification."
---

## intro

:::lang fr
Tu as appris tout GCP **sans compte, sans carte, sans risque** grâce aux émulateurs officiels et à fake-gcs. À un moment, tu voudras (ou devras) toucher au **vrai** Google Cloud : pour l'examen, pour un projet client, pour valider en conditions réelles. Ce guide est le **pont** — et surtout le **garde-fou**. Car le vrai GCP a une différence de taille avec les émulateurs : **il facture**. Une base laissée active, un bucket oublié, une API coûteuse activée, et c'est la facture surprise. Ce guide t'apprend à passer en réel **proprement** : créer un projet, poser des garde-fous de coût **avant** de créer quoi que ce soit, déployer ton projet Terraform, puis **tout démonter**.

On avance dans l'ordre qui évite les catastrophes : d'abord **créer un projet** et **lier la facturation** (avec les **crédits d'essai** et le palier **Always Free**), puis **s'authentifier proprement** (`gcloud` pour toi, **ADC** pour Terraform), puis — **avant toute ressource** — les **garde-fous de coût** (budgets Cloud Billing + alertes). Ensuite seulement on **active les APIs**, on **crée la base** Firestore/Datastore, et on déploie ton **projet Terraform** pour de vrai (`apply`). Enfin, on **démonte tout** (`destroy` + suppression du projet) et on démonte aussi les **illusions des émulateurs** : ce qu'ils cachaient et qui compte vraiment en production.

⚠️ **Ce guide implique de VRAIES actions sur un VRAI compte Google Cloud**, qui peuvent **coûter de l'argent** si tu n'es pas discipliné·e. On reste dans les **crédits d'essai** / l'**offre gratuite** et on nettoie tout — mais lis chaque avertissement. Les vérifications « ✅ » décrivent ce que tu dois **voir** dans la console/CLI, pas des commandes de labo à rejouer à l'aveugle.

**Pour qui c'est :** tu as terminé tout le track GCP (jusqu'au projet d'entreprise) et tu es prêt·e à mettre le pied dans le vrai cloud.

**Quand ce n'est PAS le bon choix :**

- Tu veux juste réviser/t'entraîner → reste sur les **émulateurs**, c'est gratuit et sans risque.
- Tu n'es pas sûr·e de pouvoir surveiller tes coûts → pose **d'abord** les garde-fous de ce guide (étape 3), puis reviens créer des ressources.
:::

:::lang en
You learned all of GCP **with no account, no card, no risk** thanks to the official emulators and fake-gcs. At some point, you'll want (or need) to touch **real** Google Cloud: for the exam, a client project, a real-conditions validation. This guide is the **bridge** — and above all the **guardrail**. Because real GCP has one big difference from the emulators: **it bills**. A database left active, a forgotten bucket, an expensive API enabled, and it's a surprise bill. This guide teaches you to go real **cleanly**: create a project, set cost guardrails **before** creating anything, deploy your Terraform project, then **tear it all down**.

We go in the disaster-avoiding order: first **create a project** and **link billing** (with the **trial credits** and the **Always Free** tier), then **authenticate cleanly** (`gcloud` for you, **ADC** for Terraform), then — **before any resource** — the **cost guardrails** (Cloud Billing budgets + alerts). Only then do we **enable the APIs**, **create the** Firestore/Datastore **database**, and deploy your **Terraform project** for real (`apply`). Finally, we **tear everything down** (`destroy` + project deletion) and also dismantle the **emulators' illusions**: what they hid and what truly matters in production.

⚠️ **This guide involves REAL actions on a REAL Google Cloud account**, which can **cost money** if you're not disciplined. We stay in the **trial credits** / **free tier** and clean everything up — but read every warning. The "✅" checks describe what you should **see** in the console/CLI, not lab commands to replay blindly.

**Who it's for:** you've finished the whole GCP track (through the enterprise project) and you're ready to step into the real cloud.

**When it's NOT the right choice:**

- You just want to revise/practice → stay on the **emulators**, it's free and risk-free.
- You're not sure you can watch your costs → set **this guide's guardrails first** (step 3), then come back to create resources.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Créer un **projet GCP** et **lier la facturation** (crédits d'essai, Always Free).
- T'authentifier avec **`gcloud`** et surtout **ADC** (ce que Terraform utilise).
- Poser des **garde-fous de coût** (budgets + alertes) **avant** toute ressource.
- **Activer les APIs** nécessaires et **créer la base** Firestore/Datastore.
- Déployer ton **projet Terraform** pour de vrai (`plan` → `apply`).
- **Faire tourner le pipeline** contre le vrai GCP (sans les variables d'émulateur).
- **Tout démonter** (`destroy` + suppression du projet) — la discipline anti-facture.
- Reconnaître **ce que les émulateurs cachaient** (IAM, unicité, dead-letter, cohérence).
:::

:::lang en
By the end of this guide, you can:

- Create a **GCP project** and **link billing** (trial credits, Always Free).
- Authenticate with **`gcloud`** and above all **ADC** (what Terraform uses).
- Set **cost guardrails** (budgets + alerts) **before** any resource.
- **Enable the APIs** needed and **create the** Firestore/Datastore **database**.
- Deploy your **Terraform project** for real (`plan` → `apply`).
- **Run the pipeline** against real GCP (without the emulator variables).
- **Tear everything down** (`destroy` + project deletion) — the anti-bill discipline.
- Recognize **what the emulators hid** (IAM, uniqueness, dead-letter, consistency).
:::

## prerequisites

:::lang fr
- Le guide **GCP projet d'entreprise** terminé (l'infra Terraform + l'app que tu vas déployer).
- Un **compte Google** et une **carte bancaire** (exigée pour ouvrir la facturation, même en essai gratuit — GCP ne débite pas sans ton accord explicite en fin d'essai).
- **`gcloud`** et **Terraform** installés.
- ⚠️ La volonté de **lire les avertissements** et de **nettoyer** derrière toi. Le vrai cloud facture.
:::

:::lang en
- The **GCP enterprise project** guide done (the Terraform infra + app you'll deploy).
- A **Google account** and a **payment card** (required to open billing, even on the free trial — GCP won't charge without your explicit consent at trial's end).
- **`gcloud`** and **Terraform** installed.
- ⚠️ The willingness to **read the warnings** and **clean up** after yourself. Real cloud bills.
:::

## concepts

:::lang fr
**Projet & facturation.** Sur GCP, **tout** vit dans un **projet** (l'unité d'isolation et de facturation). Pour créer des ressources payantes, le projet doit être **lié à un compte de facturation**. GCP offre des **crédits d'essai** (un montant offert sur une période) et un palier **Always Free** (des quotas gratuits permanents sur certains services — Pub/Sub, Cloud Storage, Firestore ont des franchises généreuses). Bien utilisé, ce track se déploie **sans dépenser un centime réel**.

**Authentification : toi vs les machines.** Deux niveaux. `gcloud auth login` t'authentifie **toi** (pour la CLI). `gcloud auth application-default login` écrit les **Application Default Credentials (ADC)** — le fichier d'identifiants que les **bibliothèques et Terraform** cherchent automatiquement. C'est **précisément** l'ADC qui manquait au guide *IAM & Terraform* quand `plan` échouait. En prod, on n'utilise pas ses identifiants perso mais un **compte de service** (Workload Identity).

**Garde-fous de coût (LE réflexe).** Un **budget** Cloud Billing te **prévient** (par e-mail, à 50/90/100 % d'un seuil) quand la dépense approche une limite. ⚠️ **Un budget ALERTE, il ne BLOQUE pas** par défaut : c'est un signal, pas un plafond dur. On le pose **avant** de créer quoi que ce soit. Complément : surveiller le tableau de bord de facturation et **supprimer** ce qu'on n'utilise plus.

**Activer les APIs.** Sur GCP, chaque service a une **API** à **activer** par projet avant usage (`pubsub.googleapis.com`, `firestore.googleapis.com`, `storage.googleapis.com`, `iam.googleapis.com`…). Les émulateurs n'exigeaient rien de tel — c'est une étape **réelle** à ne pas oublier (sinon `apply` échoue avec « API not enabled »).

**Créer la base Firestore/Datastore.** L'émulateur Datastore fonctionnait « tout seul ». En réel, il faut **créer une base** dans le projet et **choisir son mode** : **Firestore natif** (moderne, temps réel) **ou** **Datastore mode** (compatible avec le code du track). Ce choix est **définitif** par projet — un vrai point d'examen.

**Le cycle réel de Terraform.** Ici, `terraform apply` **crée vraiment** les ressources ; le fichier d'**état** (`terraform.tfstate`) mémorise ce qui existe. `destroy` supprime **exactement** ce que le state gère — la contrepartie propre. C'est la force de l'IaC : ce que tu as **validé** en local, tu le **déploies** et le **retires** d'une commande.
:::

:::lang en
**Project & billing.** On GCP, **everything** lives in a **project** (the unit of isolation and billing). To create paid resources, the project must be **linked to a billing account**. GCP offers **trial credits** (a granted amount over a period) and an **Always Free** tier (permanent free quotas on some services — Pub/Sub, Cloud Storage, Firestore have generous allowances). Used well, this track deploys **without spending a real cent**.

**Authentication: you vs machines.** Two levels. `gcloud auth login` authenticates **you** (for the CLI). `gcloud auth application-default login` writes the **Application Default Credentials (ADC)** — the credential file that **libraries and Terraform** look for automatically. It's **precisely** the ADC that was missing in the *IAM & Terraform* guide when `plan` failed. In prod, you don't use personal credentials but a **service account** (Workload Identity).

**Cost guardrails (THE reflex).** A Cloud Billing **budget** **warns** you (by email, at 50/90/100% of a threshold) when spend approaches a limit. ⚠️ **A budget ALERTS, it does NOT BLOCK** by default: it's a signal, not a hard cap. You set it **before** creating anything. Complement: watch the billing dashboard and **delete** what you no longer use.

**Enabling APIs.** On GCP, each service has an **API** to **enable** per project before use (`pubsub.googleapis.com`, `firestore.googleapis.com`, `storage.googleapis.com`, `iam.googleapis.com`…). The emulators required no such thing — it's a **real** step not to forget (else `apply` fails with "API not enabled").

**Creating the Firestore/Datastore database.** The Datastore emulator "just worked". For real, you must **create a database** in the project and **choose its mode**: **Firestore native** (modern, real-time) **or** **Datastore mode** (compatible with the track's code). This choice is **permanent** per project — a real exam point.

**Terraform's real cycle.** Here, `terraform apply` **really creates** resources; the **state** file (`terraform.tfstate`) remembers what exists. `destroy` removes **exactly** what the state manages — the clean counterpart. That's the strength of IaC: what you **validated** locally, you **deploy** and **remove** with one command.
:::

:::figure gcp-lab-to-real
caption_fr: "Schéma 1. Du labo au réel : à gauche, les émulateurs (Pub/Sub, Datastore, fake-gcs), gratuits et sans compte ; à droite, le vrai GCP. Le pont se traverse dans l'ordre : projet + facturation → auth (gcloud + ADC) → garde-fous de coût (budgets/alertes) → activer APIs + créer la base → terraform apply → destroy. La sécurité coût avant toute ressource."
caption_en: "Figure 1. From lab to real: on the left, the emulators (Pub/Sub, Datastore, fake-gcs), free and account-less; on the right, real GCP. The bridge is crossed in order: project + billing → auth (gcloud + ADC) → cost guardrails (budgets/alerts) → enable APIs + create the database → terraform apply → destroy. Cost safety before any resource."
:::

## walkthrough

:::lang fr
On avance ainsi : projet & facturation → authentification (gcloud + ADC) → garde-fous de coût → activer les APIs & créer la base → déployer en réel (apply) & faire tourner → ce que les émulateurs cachaient → tout démonter & cap sur l'ACE. **La sécurité coût passe avant les ressources.**
:::

:::lang en
We go like this: project & billing → authentication (gcloud + ADC) → cost guardrails → enable APIs & create the database → deploy for real (apply) & run → what the emulators hid → tear it all down & aim for ACE. **Cost safety before resources.**
:::

### step-01

:::lang fr
**Objectif.** Créer un **projet GCP** et **lier la facturation** — proprement.

**🤔 Le projet, unité de tout.** On crée un projet **dédié** à cet apprentissage (facile à supprimer en bloc à la fin). On y lie un **compte de facturation** (nécessaire pour les ressources, mais couvert par les crédits d'essai / l'Always Free).

En CLI (ou via la console `console.cloud.google.com`) :
:::

:::lang en
**Goal.** Create a **GCP project** and **link billing** — cleanly.

**🤔 The project, unit of everything.** We create a project **dedicated** to this learning (easy to delete wholesale at the end). We link a **billing account** to it (needed for resources, but covered by trial credits / Always Free).

In the CLI (or via the console `console.cloud.google.com`):
:::

```bash
# Crée un projet dédié (ID mondialement unique) / create a dedicated project (globally unique ID)
gcloud projects create mon-labo-ace-2026 --name="Labo ACE"

# Liste tes comptes de facturation / list your billing accounts
gcloud billing accounts list

# Lie la facturation au projet / link billing to the project
gcloud billing projects link mon-labo-ace-2026 \
  --billing-account=XXXXXX-XXXXXX-XXXXXX

# Fixe ce projet comme actif / set this project as active
gcloud config set project mon-labo-ace-2026
```

:::lang fr
**✅ Vérification :** `gcloud projects describe mon-labo-ace-2026` renvoie l'état `ACTIVE`. `gcloud billing projects describe mon-labo-ace-2026` montre `billingEnabled: true`. Dans la console, le projet apparaît dans le sélecteur en haut. ⚠️ **L'ID de projet est définitif et mondialement unique** (ajoute un suffixe si « pris »). Sépare bien **compte de facturation** (le moyen de paiement) et **projet** (où vivent les ressources) : un compte de facturation peut porter plusieurs projets. Garde ce projet **isolé** — on le supprimera **entièrement** à la fin.
:::

:::lang en
**✅ Check:** `gcloud projects describe mon-labo-ace-2026` returns state `ACTIVE`. `gcloud billing projects describe mon-labo-ace-2026` shows `billingEnabled: true`. In the console, the project shows in the top selector. ⚠️ **The project ID is permanent and globally unique** (add a suffix if "taken"). Keep **billing account** (the payment method) and **project** (where resources live) distinct: one billing account can carry several projects. Keep this project **isolated** — we'll delete it **entirely** at the end.
:::

### step-02

:::lang fr
**Objectif.** T'authentifier proprement : **`gcloud`** pour toi, **ADC** pour Terraform.

**🤔 L'ADC, le chaînon manquant.** Au guide *IAM & Terraform*, `terraform plan` échouait sur « No credentials loaded ». La raison : Terraform cherche les **Application Default Credentials**. On les crée maintenant. Deux commandes distinctes : l'une pour la **CLI** (toi), l'autre pour les **bibliothèques/Terraform** (ADC).

Authentifie-toi :
:::

:::lang en
**Goal.** Authenticate cleanly: **`gcloud`** for you, **ADC** for Terraform.

**🤔 ADC, the missing link.** In the *IAM & Terraform* guide, `terraform plan` failed on "No credentials loaded". The reason: Terraform looks for the **Application Default Credentials**. We create them now. Two distinct commands: one for the **CLI** (you), one for **libraries/Terraform** (ADC).

Authenticate:
:::

```bash
# 1) T'authentifier pour la CLI gcloud / authenticate for the gcloud CLI
gcloud auth login

# 2) Écrire les Application Default Credentials (ce que Terraform utilise) / write ADC
gcloud auth application-default login

# Vérifier / verify
gcloud auth list                        # ton compte actif / your active account
gcloud config list                      # projet + compte / project + account
```

:::lang fr
**✅ Vérification :** `gcloud auth list` montre ton compte avec un `*` (actif). Un fichier d'identifiants ADC est écrit (typiquement `~/.config/gcloud/application_default_credentials.json`). **Désormais, `terraform plan` ne renverra plus l'erreur d'identifiants** — il s'authentifiera via l'ADC. ⚠️ **Ces identifiants sont sensibles** (ils agissent en ton nom). Ne les committe jamais, ne les partage pas. En production, on n'utilise **pas** ses identifiants perso : on attache un **compte de service** au workload (Workload Identity) — pas de clé à traîner. Ici, en labo perso, l'ADC suffit.
:::

:::lang en
**✅ Check:** `gcloud auth list` shows your account with a `*` (active). An ADC credentials file is written (typically `~/.config/gcloud/application_default_credentials.json`). **From now on, `terraform plan` won't return the credentials error** — it authenticates via ADC. ⚠️ **These credentials are sensitive** (they act as you). Never commit them, never share them. In production, you don't use personal credentials: you attach a **service account** to the workload (Workload Identity) — no key to carry. Here, in a personal lab, ADC suffices.
:::

### step-03

:::lang fr
**Objectif.** Poser les **garde-fous de coût** — **AVANT** toute ressource.

**🤔 Le réflexe qui sauve.** On crée un **budget** Cloud Billing avec des **alertes** par e-mail (50 %, 90 %, 100 % d'un petit seuil, ex. 5 €). Ça ne bloque pas la dépense, mais ça te **prévient** immédiatement si quelque chose dérape. On le fait **maintenant**, avant de créer la moindre ressource.

Via la console (recommandé) : **Facturation → Budgets et alertes → Créer un budget**. En CLI (nécessite l'API Billing Budgets activée) :
:::

:::lang en
**Goal.** Set the **cost guardrails** — **BEFORE** any resource.

**🤔 The reflex that saves you.** We create a Cloud Billing **budget** with email **alerts** (50%, 90%, 100% of a small threshold, e.g. €5). It doesn't block spend, but it **warns** you immediately if something goes wrong. We do it **now**, before creating any resource.

Via the console (recommended): **Billing → Budgets & alerts → Create budget**. In the CLI (needs the Billing Budgets API enabled):
:::

```bash
# Activer l'API des budgets / enable the Budgets API
gcloud services enable billingbudgets.googleapis.com

# Créer un budget de 5 € avec alertes à 50/90/100 % / create a €5 budget with 50/90/100% alerts
gcloud billing budgets create \
  --billing-account=XXXXXX-XXXXXX-XXXXXX \
  --display-name="Garde-fou labo ACE" \
  --budget-amount=5EUR \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.9 \
  --threshold-rule=percent=1.0
```

:::lang fr
**✅ Vérification :** dans **Facturation → Budgets et alertes**, ton budget « Garde-fou labo ACE » apparaît avec ses seuils. Tu recevras un e-mail dès 50 % atteints. ⚠️ **Un budget n'est PAS un plafond dur** (point d'examen crucial) : il **alerte**, il ne **coupe** pas la dépense automatiquement. Pour vraiment couper, il faut un mécanisme actif (une Cloud Function déclenchée par l'alerte qui désactive la facturation) — hors périmètre ici. La vraie garantie anti-facture de ce guide, c'est la **discipline** : rester dans l'Always Free et **tout supprimer** (étape 7). Pose ce garde-fou **avant** de continuer.
:::

:::lang en
**✅ Check:** in **Billing → Budgets & alerts**, your "Garde-fou labo ACE" budget appears with its thresholds. You'll get an email as soon as 50% is reached. ⚠️ **A budget is NOT a hard cap** (crucial exam point): it **alerts**, it doesn't **cut** spend automatically. To truly cut, you need an active mechanism (a Cloud Function triggered by the alert that disables billing) — out of scope here. This guide's real anti-bill guarantee is **discipline**: stay in Always Free and **delete everything** (step 7). Set this guardrail **before** continuing.
:::

### step-04

:::lang fr
**Objectif.** **Activer les APIs** et **créer la base** Firestore/Datastore.

**🤔 Ce que les émulateurs ne demandaient pas.** En réel, chaque service a une **API à activer** par projet, et la base Datastore doit être **créée** (avec son **mode**, définitif). On active Pub/Sub, Firestore, Storage, IAM ; puis on crée la base en **mode Datastore** (le mode qu'utilise le code de ton projet).

Active et crée :
:::

:::lang en
**Goal.** **Enable the APIs** and **create the** Firestore/Datastore **database**.

**🤔 What the emulators didn't require.** For real, each service has an **API to enable** per project, and the Datastore database must be **created** (with its **mode**, permanent). We enable Pub/Sub, Firestore, Storage, IAM; then create the database in **Datastore mode** (the mode your project's code uses).

Enable and create:
:::

```bash
# Activer les APIs nécessaires / enable the needed APIs
gcloud services enable \
  pubsub.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com

# Créer la base en MODE DATASTORE (définitif pour le projet) / create the database in DATASTORE MODE (permanent)
gcloud firestore databases create \
  --location=eur3 \
  --type=datastore-mode
```

:::lang fr
**✅ Vérification :** `gcloud services list --enabled` liste les quatre APIs. `gcloud firestore databases describe --database="(default)"` montre `type: DATASTORE_MODE`. Ta base est prête, dans une multirégion européenne (`eur3`). ⚠️ **Le mode est DÉFINITIF** : un projet est en **Datastore mode** OU **Firestore natif**, pas les deux, et on ne change pas après coup. Ton code du projet d'entreprise utilise l'API Datastore → **Datastore mode**. ⚠️ **Point coût :** activer une API ne coûte rien ; ce sont les **ressources** créées ensuite qui comptent (et Firestore/Pub/Sub/Storage ont des franchises Always Free généreuses).
:::

:::lang en
**✅ Check:** `gcloud services list --enabled` lists the four APIs. `gcloud firestore databases describe --database="(default)"` shows `type: DATASTORE_MODE`. Your database is ready, in a European multi-region (`eur3`). ⚠️ **The mode is PERMANENT**: a project is in **Datastore mode** OR **Firestore native**, not both, and you don't change it afterward. Your enterprise-project code uses the Datastore API → **Datastore mode**. ⚠️ **Cost point:** enabling an API costs nothing; it's the **resources** created afterward that count (and Firestore/Pub/Sub/Storage have generous Always Free allowances).
:::

### step-05

:::lang fr
**Objectif.** Déployer ton **projet Terraform** pour de vrai (`apply`) et **faire tourner** le pipeline.

**🤔 Le même code, le vrai cloud.** Bonne surprise : ton infra Terraform du projet d'entreprise **ne change quasiment pas** — elle visait déjà le vrai GCP (aucun endpoint d'émulateur dedans). Il suffit de pointer le bon `project_id` et de faire `apply`. Côté **app**, on retire les **variables d'émulateur** (`PUBSUB_EMULATOR_HOST`, `DATASTORE_EMULATOR_HOST`) et, dans le worker, les options **fake-gcs** (`AnonymousCredentials`, `api_endpoint`) — les clients visent alors le vrai GCP via l'ADC.

Déploie l'infra, puis lance le pipeline :
:::

:::lang en
**Goal.** Deploy your **Terraform project** for real (`apply`) and **run** the pipeline.

**🤔 The same code, the real cloud.** Good surprise: your enterprise-project Terraform infra **barely changes** — it already targeted real GCP (no emulator endpoints in it). Just point to the right `project_id` and `apply`. On the **app** side, drop the **emulator variables** (`PUBSUB_EMULATOR_HOST`, `DATASTORE_EMULATOR_HOST`) and, in the worker, the **fake-gcs** options (`AnonymousCredentials`, `api_endpoint`) — the clients then target real GCP via ADC.

Deploy the infra, then run the pipeline:
:::

```bash
cd ~/projet-commandes/infra

# Le bucket doit être MONDIALEMENT unique : ajuste le nom si besoin (var project_id l'y aide).
# The bucket must be GLOBALLY unique: adjust the name if needed (var project_id helps).
terraform plan  -var="project_id=mon-labo-ace-2026"    # cette fois, ça marche (ADC) / this time it works (ADC)
terraform apply -var="project_id=mon-labo-ace-2026"    # crée VRAIMENT les ressources / really creates resources
```

:::lang fr
Puis l'app, **sans** les variables d'émulateur (retire aussi `credentials=AnonymousCredentials()` et `api_endpoint` du worker) :
:::

:::lang en
Then the app, **without** the emulator variables (also remove `credentials=AnonymousCredentials()` and `api_endpoint` from the worker):
:::

```bash
cd ~/projet-commandes/app
unset PUBSUB_EMULATOR_HOST DATASTORE_EMULATOR_HOST   # viser le VRAI GCP / target REAL GCP
# (les sujets/abonnements existent déjà — créés par terraform apply — pas besoin de bootstrap.py)
python3 producteur.py
python3 travailleur.py
python3 verifier.py
```

:::lang fr
**✅ Vérification :** `terraform apply` affiche `Apply complete! Resources: N added.` Dans la console : les sujets Pub/Sub, la base Datastore et le bucket **existent réellement**. Le pipeline tourne contre le vrai GCP, et `verifier.py` liste **3** enregistrements et **3** archives — comme en local, mais **pour de vrai**. ⚠️ **Différences réelles :** `bootstrap.py` n'est **plus** nécessaire (Terraform a créé la topologie) ; le **nom du bucket** doit être **mondialement unique** (d'où le suffixe projet) ; les identités **IAM** sont **réellement appliquées** (un compte de service sans le bon rôle sera **refusé**, ce que l'émulateur ignorait). Tu déploies désormais comme un pro : IaC + app, sur le vrai cloud.
:::

:::lang en
**✅ Check:** `terraform apply` prints `Apply complete! Resources: N added.` In the console: the Pub/Sub topics, the Datastore database and the bucket **really exist**. The pipeline runs against real GCP, and `verifier.py` lists **3** records and **3** archives — like locally, but **for real**. ⚠️ **Real differences:** `bootstrap.py` is **no longer** needed (Terraform created the topology); the **bucket name** must be **globally unique** (hence the project suffix); **IAM** identities are **really enforced** (a service account without the right role is **denied**, which the emulator ignored). You now deploy like a pro: IaC + app, on the real cloud.
:::

### step-06

:::lang fr
**Objectif.** Démonter les **illusions des émulateurs** — ce qui change en réel.

**🤔 Ce que le labo cachait (et qui compte à l'examen).** Les émulateurs sont parfaits pour apprendre la **logique**, mais ils **simplifient**. Connaître les écarts, c'est éviter les mauvaises surprises en prod — et répondre juste à l'ACE.

Les principaux écarts :
:::

:::lang en
**Goal.** Dismantle the **emulators' illusions** — what changes for real.

**🤔 What the lab hid (and what matters on the exam).** The emulators are perfect for learning the **logic**, but they **simplify**. Knowing the gaps means avoiding nasty prod surprises — and answering the ACE correctly.

The main gaps:
:::

```text
Émulateur / Emulator            →  Réel / Real
──────────────────────────────────────────────────────────────────────────
IAM ignoré / IAM ignored        →  IAM APPLIQUÉ : sans le bon rôle, accès refusé
Noms « libres » / free names    →  bucket = unicité MONDIALE ; SA = unique par projet
dead-letter conceptuel          →  routage RÉEL après N échecs (droits IAM requis pour Pub/Sub)
classe/versioning ignorés (GCS) →  RÉELLEMENT appliqués et facturés
cohérence immédiate             →  Datastore : requêtes éventuellement cohérentes possibles
pas de quotas / no quotas       →  quotas & limites par région/API (à surveiller)
gratuit / free                  →  facturé au-delà de l'Always Free (surveille le budget)
```

:::lang fr
**✅ Vérification :** tu peux **expliquer** chaque écart. Les plus piégeux à l'examen : (1) **IAM est réellement appliqué** — teste en retirant un rôle au compte de service, l'appel est **refusé** (l'émulateur laissait tout passer) ; (2) l'**unicité mondiale** des noms de bucket ; (3) le **dead-letter réel** exige que Pub/Sub ait les **droits** de publier dans le sujet de rebut (un binding IAM à ajouter) ; (4) certaines requêtes Datastore sont **éventuellement cohérentes** (une entité juste écrite peut ne pas apparaître immédiatement dans une requête). ⚠️ Ces écarts ne **remettent pas en cause** ce que tu as appris : la **logique** est la même. Ils ajoutent la **rigueur** du réel — sécurité, unicité, cohérence, coût.
:::

:::lang en
**✅ Check:** you can **explain** each gap. The trickiest on the exam: (1) **IAM is really enforced** — test by removing a role from the service account, the call is **denied** (the emulator let everything through); (2) the **global uniqueness** of bucket names; (3) **real dead-letter** requires Pub/Sub to have the **rights** to publish to the dead-letter topic (an IAM binding to add); (4) some Datastore queries are **eventually consistent** (a just-written entity may not appear immediately in a query). ⚠️ These gaps don't **invalidate** what you learned: the **logic** is the same. They add the **rigor** of real life — security, uniqueness, consistency, cost.
:::

### step-07

:::lang fr
**Objectif.** **Tout démonter** (la discipline anti-facture) et **cap sur la certification ACE**.

**🤔 Créer → utiliser → détruire.** La seule vraie garantie contre la facture surprise : **supprimer** ce que tu ne veux plus payer. `terraform destroy` retire ce que le state gère ; puis, pour être **certain** qu'il ne reste **rien** de facturable, on **supprime le projet entier**.

Démonte :
:::

:::lang en
**Goal.** **Tear everything down** (the anti-bill discipline) and **aim for the ACE certification**.

**🤔 Create → use → destroy.** The only real guarantee against a surprise bill: **delete** what you no longer want to pay for. `terraform destroy` removes what the state manages; then, to be **certain** nothing billable remains, we **delete the whole project**.

Tear it down:
:::

```bash
# 1) Détruire l'infra gérée par Terraform / destroy the Terraform-managed infra
cd ~/projet-commandes/infra
terraform destroy -var="project_id=mon-labo-ace-2026"

# 2) Filet de sécurité : supprimer le PROJET entier (retire TOUT résiduel + arrête la facturation)
#    safety net: delete the WHOLE project (removes ANY leftover + stops billing)
gcloud projects delete mon-labo-ace-2026
```

:::lang fr
**✅ Vérification :** `terraform destroy` affiche `Destroy complete! Resources: N destroyed.`. Après `gcloud projects delete`, `gcloud projects describe mon-labo-ace-2026` montre l'état `DELETE_REQUESTED` (le projet est planifié pour suppression, réversible ~30 jours puis définitif). **Plus aucune ressource facturable.** Tu as bouclé le cycle **créer → utiliser → détruire** — le réflexe d'un ingénieur cloud responsable. 🎓 **Cap sur l'ACE :** ton parcours GCP couvre le cœur de l'examen **Associate Cloud Engineer** — projets & IAM, Compute/Storage, Pub/Sub, bases de données, IaC Terraform, facturation & garde-fous. Entraîne-toi sur des **examens blancs**, révise les **quotas/régions** et les **choix de service**, et présente ton **projet d'entreprise** en entretien. Tu es prêt·e.
:::

:::lang en
**✅ Check:** `terraform destroy` prints `Destroy complete! Resources: N destroyed.`. After `gcloud projects delete`, `gcloud projects describe mon-labo-ace-2026` shows state `DELETE_REQUESTED` (the project is scheduled for deletion, reversible ~30 days then permanent). **No more billable resource.** You closed the **create → use → destroy** cycle — the reflex of a responsible cloud engineer. 🎓 **Aim for ACE:** your GCP path covers the core of the **Associate Cloud Engineer** exam — projects & IAM, Compute/Storage, Pub/Sub, databases, Terraform IaC, billing & guardrails. Practice on **mock exams**, revise **quotas/regions** and **service choices**, and present your **enterprise project** in interviews. You're ready.
:::

## pitfalls

:::lang fr
**1. Créer des ressources AVANT le budget.** Toujours l'inverse : garde-fous **d'abord**, ressources ensuite. Un budget posé après ne rattrape pas une dépense déjà partie.

**2. Croire qu'un budget bloque la dépense.** Il **alerte**, il ne **coupe** pas. La vraie protection, c'est la **suppression** (destroy + delete project).

**3. Oublier d'activer une API.** `apply` échoue avec « API not enabled ». Active Pub/Sub, Firestore, Storage, IAM **avant**.

**4. Se tromper de mode Firestore/Datastore.** Le mode est **définitif** par projet. Le code du track utilise l'API **Datastore** → **Datastore mode**.

**5. Laisser les variables d'émulateur.** Si `PUBSUB_EMULATOR_HOST` reste exporté, ton app vise **encore l'émulateur** local, pas le réel. `unset` avant de lancer.

**6. Nom de bucket non unique.** En réel, les noms GCS sont **mondiaux**. Suffixe avec l'ID de projet (déjà fait dans l'infra).

**7. Utiliser ses identifiants perso en prod.** L'ADC perso, c'est pour le **labo**. En prod, un **compte de service** (Workload Identity), pas de clé.

**8. Oublier de supprimer le projet.** Le filet de sécurité ultime. `gcloud projects delete` arrête **toute** facturation résiduelle.
:::

:::lang en
**1. Creating resources BEFORE the budget.** Always the reverse: guardrails **first**, resources next. A budget set afterward won't recover an already-started spend.

**2. Thinking a budget blocks spend.** It **alerts**, it doesn't **cut**. The real protection is **deletion** (destroy + delete project).

**3. Forgetting to enable an API.** `apply` fails with "API not enabled". Enable Pub/Sub, Firestore, Storage, IAM **first**.

**4. Picking the wrong Firestore/Datastore mode.** The mode is **permanent** per project. The track's code uses the **Datastore** API → **Datastore mode**.

**5. Leaving the emulator variables set.** If `PUBSUB_EMULATOR_HOST` stays exported, your app **still targets the local emulator**, not real. `unset` before running.

**6. Non-unique bucket name.** For real, GCS names are **global**. Suffix with the project ID (already done in the infra).

**7. Using personal credentials in prod.** Personal ADC is for the **lab**. In prod, a **service account** (Workload Identity), no key.

**8. Forgetting to delete the project.** The ultimate safety net. `gcloud projects delete` stops **any** residual billing.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées un **projet** et **lies la facturation**.
- [ ] Tu écris l'**ADC** (`gcloud auth application-default login`) et `plan` ne se plaint plus.
- [ ] Tu poses un **budget + alertes** **avant** toute ressource.
- [ ] Tu **actives les APIs** et **crées la base** en mode Datastore.
- [ ] Tu fais un **`terraform apply`** réel et le pipeline tourne sur le vrai GCP.
- [ ] Tu cites **3 écarts** émulateur → réel (IAM appliqué, unicité, cohérence…).
- [ ] Tu fais **`destroy`** puis **supprimes le projet** — zéro ressource facturable.

Sept cases = tu sais passer en réel **proprement**. Prochain arrêt : la **certification ACE**.
:::

:::lang en
You know it works when…

- [ ] You create a **project** and **link billing**.
- [ ] You write the **ADC** (`gcloud auth application-default login`) and `plan` stops complaining.
- [ ] You set a **budget + alerts** **before** any resource.
- [ ] You **enable the APIs** and **create the database** in Datastore mode.
- [ ] You run a real **`terraform apply`** and the pipeline runs on real GCP.
- [ ] You name **3 gaps** emulator → real (IAM enforced, uniqueness, consistency…).
- [ ] You run **`destroy`** then **delete the project** — zero billable resource.

Seven boxes = you can go real **cleanly**. Next stop: the **ACE certification**.
:::

## next

:::lang fr
Tu as terminé le track **GCP → Associate Cloud Engineer** ! 🎉

1. **Certification ACE** : entraîne-toi sur des **examens blancs**, révise les **choix de service** (quel stockage ? quelle base ?), les **quotas/régions**, et les **modèles IAM**.
2. **Ton CV** : mets en avant le **projet d'entreprise** (plateforme d'ingestion événementielle) — architecture, IaC, moindre privilège, test local.
3. **Pour aller plus loin** : Kubernetes (GKE), CI/CD (Cloud Build), observabilité (Cloud Monitoring), et les autres tracks de la plateforme.
:::

:::lang en
You've finished the **GCP → Associate Cloud Engineer** track! 🎉

1. **ACE certification**: practice on **mock exams**, revise **service choices** (which storage? which database?), **quotas/regions**, and **IAM models**.
2. **Your CV**: highlight the **enterprise project** (event-driven ingestion platform) — architecture, IaC, least privilege, local testing.
3. **To go further**: Kubernetes (GKE), CI/CD (Cloud Build), observability (Cloud Monitoring), and the platform's other tracks.
:::

## cheatsheet

:::lang fr
Aide-mémoire « passer en réel ».
:::

:::lang en
"Going real" cheat sheet.
:::

```bash
# Projet & facturation / project & billing
gcloud projects create mon-labo-ace-2026 --name="Labo ACE"
gcloud billing projects link mon-labo-ace-2026 --billing-account=XXXXXX-XXXXXX-XXXXXX
gcloud config set project mon-labo-ace-2026

# Auth (toi + ADC pour Terraform) / auth (you + ADC for Terraform)
gcloud auth login
gcloud auth application-default login

# Garde-fous de coût AVANT tout / cost guardrails FIRST
gcloud services enable billingbudgets.googleapis.com
# ...puis créer un budget + alertes (console ou gcloud billing budgets create)

# Activer APIs + créer la base / enable APIs + create the database
gcloud services enable pubsub.googleapis.com firestore.googleapis.com storage.googleapis.com iam.googleapis.com
gcloud firestore databases create --location=eur3 --type=datastore-mode

# Déployer / deploy
terraform apply -var="project_id=mon-labo-ace-2026"
unset PUBSUB_EMULATOR_HOST DATASTORE_EMULATOR_HOST     # app vise le vrai GCP / app targets real GCP

# TOUT démonter / tear it ALL down
terraform destroy -var="project_id=mon-labo-ace-2026"
gcloud projects delete mon-labo-ace-2026
```

## resources

:::lang fr
- [Créer et gérer des projets](https://cloud.google.com/resource-manager/docs/creating-managing-projects) — l'unité de base.
- [Authentification (ADC)](https://cloud.google.com/docs/authentication/provide-credentials-adc) — ce que Terraform utilise.
- [Budgets et alertes](https://cloud.google.com/billing/docs/how-to/budgets) — les garde-fous de coût.
- [Palier Always Free](https://cloud.google.com/free/docs/free-cloud-features) — les quotas gratuits permanents.
- [Firestore : mode Datastore vs natif](https://cloud.google.com/datastore/docs/firestore-or-datastore) — le choix définitif.
- [Certification Associate Cloud Engineer](https://cloud.google.com/learn/certification/cloud-engineer) — le programme officiel.
:::

:::lang en
- [Creating and managing projects](https://cloud.google.com/resource-manager/docs/creating-managing-projects) — the base unit.
- [Authentication (ADC)](https://cloud.google.com/docs/authentication/provide-credentials-adc) — what Terraform uses.
- [Budgets and alerts](https://cloud.google.com/billing/docs/how-to/budgets) — the cost guardrails.
- [Always Free tier](https://cloud.google.com/free/docs/free-cloud-features) — the permanent free quotas.
- [Firestore: Datastore mode vs native](https://cloud.google.com/datastore/docs/firestore-or-datastore) — the permanent choice.
- [Associate Cloud Engineer certification](https://cloud.google.com/learn/certification/cloud-engineer) — the official program.
:::

## troubleshooting

:::lang fr
**`terraform apply` : « API [xxx] not enabled ».** Tu n'as pas activé l'API du service concerné. `gcloud services enable xxx.googleapis.com`, attends une minute, relance.

**`apply` : « billing account ... disabled » ou permission refusée.** Le projet n'est pas lié à un compte de facturation actif, ou ton compte manque de droits. Vérifie `gcloud billing projects describe`.

**Le pipeline vise encore l'émulateur.** `PUBSUB_EMULATOR_HOST` / `DATASTORE_EMULATOR_HOST` sont encore exportés. `unset`-les. Et retire `AnonymousCredentials`/`api_endpoint` du client Storage.

**Erreur de nom de bucket (« already exists »).** Les noms GCS sont **mondiaux**. Change le suffixe (l'ID de projet aide, mais un autre l'a peut-être pris) : rends-le plus spécifique.

**`firestore databases create` échoue (« already exists »).** La base par défaut existe déjà (une seule par projet). Vérifie son mode : `gcloud firestore databases describe --database="(default)"`.

**Refus d'accès IAM inattendu.** En réel, IAM **s'applique** : le compte de service doit avoir le rôle nécessaire (contrairement à l'émulateur). Ajoute le binding manquant (`google_project_iam_member`).

**Peur de la facture.** Le plus sûr : `gcloud projects delete <projet>`. Ça planifie la suppression de **tout** le projet et **arrête** la facturation. Réversible ~30 jours.
:::

:::lang en
**`terraform apply`: "API [xxx] not enabled".** You didn't enable that service's API. `gcloud services enable xxx.googleapis.com`, wait a minute, re-run.

**`apply`: "billing account ... disabled" or permission denied.** The project isn't linked to an active billing account, or your account lacks rights. Check `gcloud billing projects describe`.

**The pipeline still targets the emulator.** `PUBSUB_EMULATOR_HOST` / `DATASTORE_EMULATOR_HOST` are still exported. `unset` them. And remove `AnonymousCredentials`/`api_endpoint` from the Storage client.

**Bucket name error ("already exists").** GCS names are **global**. Change the suffix (the project ID helps, but someone may have taken another): make it more specific.

**`firestore databases create` fails ("already exists").** The default database already exists (one per project). Check its mode: `gcloud firestore databases describe --database="(default)"`.

**Unexpected IAM access denial.** For real, IAM **applies**: the service account must have the needed role (unlike the emulator). Add the missing binding (`google_project_iam_member`).

**Fear of the bill.** Safest: `gcloud projects delete <project>`. It schedules deletion of the **whole** project and **stops** billing. Reversible ~30 days.
:::
