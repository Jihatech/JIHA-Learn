---
# — Identité (ne change JAMAIS une fois publié) —
id: gcp-iam-terraform
slug: gcp-iam-terraform
order: 55
status: published

# — Titres & accroches (bilingue) —
title_fr: "GCP — IAM & Terraform : droits et infrastructure-as-code"
title_en: "GCP — IAM & Terraform: permissions and infrastructure-as-code"
tagline_fr: "principals, rôles, moindre privilège, comptes de service, IaC."
tagline_en: "principals, roles, least privilege, service accounts, IaC."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 220
repo: "hashicorp/terraform-provider-google"
last_review: "2026-08-20"

# — Relations de parcours (par id) —
prerequisites: [gcp-fondamentaux]
next: [gcp-projet-entreprise]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [iam, principals-membres, roles-predefinis, roles-personnalises, moindre-privilege, comptes-de-service, terraform, iac, plan-apply-state]
concepts_en: [iam, principals-members, predefined-roles, custom-roles, least-privilege, service-accounts, terraform, iac, plan-apply-state]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "IAM et Terraform pour l'ACE, en local-first : le modèle IAM (principals, rôles primitifs/prédéfinis/personnalisés, bindings, moindre privilège), les comptes de service, et l'infrastructure-as-code avec le provider Terraform google — écrite, formatée et VALIDÉE en live contre le vrai provider (init/fmt/validate hors ligne, sans compte). Le plan/apply, qui exige de vrais identifiants, prépare le passage en réel."
og_description_en: "IAM and Terraform for ACE, local-first: the IAM model (principals, primitive/predefined/custom roles, bindings, least privilege), service accounts, and infrastructure-as-code with the Terraform google provider — written, formatted and VALIDATED live against the real provider (init/fmt/validate offline, no account). plan/apply, which needs real credentials, sets up going real."
---

## intro

:::lang fr
Deux compétences séparent l'amateur du pro sur GCP, et l'examen **Associate Cloud Engineer** les teste toutes deux sans relâche : **donner les bons droits** (IAM) et **décrire son infrastructure en code** (Terraform). La première évite les catastrophes de sécurité ; la seconde rend ton infra **reproductible, versionnée, revue en équipe**. Ce guide couvre les deux ensemble, car en pratique on écrit **les droits ET les ressources** dans le même code.

Côté **IAM**, tu apprends le modèle : **qui** (un *principal* — utilisateur, groupe, compte de service) a **quel rôle** (un ensemble de permissions) **sur quoi** (projet, bucket, sujet). Tu découvres les trois familles de rôles (**primitifs**, **prédéfinis**, **personnalisés**), les **comptes de service** (l'identité des applications), et surtout le **principe du moindre privilège** — la règle d'or de la sécurité cloud.

Côté **Terraform**, tu écris ton infra en **HCL** avec le provider **`google`**, et — c'est la force du labo — tu la **valides en live contre le vrai provider**, **sans compte GCP**. `terraform init`, `fmt` et `validate` tournent **hors ligne** : ta config est vérifiée (syntaxe, schéma, arguments) exactement comme en réel. Seuls `plan` et `apply` exigent de vrais identifiants — on te montrera précisément **où** et **pourquoi**, et c'est le guide *passer en réel* qui te branchera un vrai compte.

**Pour qui c'est :** tu as monté le labo (guide *fondamentaux*) et vu Pub/Sub et le stockage ; tu veux les **droits** et l'**IaC**.

**Quand ce n'est PAS le bon choix :**

- Tu débutes totalement sur GCP → fais d'abord *fondamentaux* (le modèle projet, `gcloud`).
- Tu veux **déployer** pour de vrai maintenant → il te faudra un compte + `apply` : c'est le guide *passer en réel*. Ici, on écrit et on **valide** l'infra, sans facturer un centime.
:::

:::lang en
Two skills separate the amateur from the pro on GCP, and the **Associate Cloud Engineer** exam tests both relentlessly: **granting the right permissions** (IAM) and **describing your infrastructure as code** (Terraform). The first avoids security disasters; the second makes your infra **reproducible, versioned, team-reviewed**. This guide covers both together, because in practice you write **the permissions AND the resources** in the same code.

On the **IAM** side, you learn the model: **who** (a *principal* — user, group, service account) has **which role** (a set of permissions) **on what** (project, bucket, topic). You discover the three role families (**primitive**, **predefined**, **custom**), **service accounts** (the identity of applications), and above all the **principle of least privilege** — the golden rule of cloud security.

On the **Terraform** side, you write your infra in **HCL** with the **`google`** provider, and — the lab's strength — you **validate it live against the real provider**, **with no GCP account**. `terraform init`, `fmt` and `validate` run **offline**: your config is checked (syntax, schema, arguments) exactly as in real life. Only `plan` and `apply` need real credentials — we'll show you precisely **where** and **why**, and it's the *going real* guide that wires up a real account.

**Who it's for:** you've set up the lab (*fundamentals* guide) and seen Pub/Sub and storage; you want **permissions** and **IaC**.

**When it's NOT the right choice:**

- You're brand new to GCP → do *fundamentals* first (the project model, `gcloud`).
- You want to **deploy** for real now → you'll need an account + `apply`: that's the *going real* guide. Here, we write and **validate** the infra, without billing a cent.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Expliquer le modèle IAM : **principal → rôle → ressource**, et les **bindings**.
- Distinguer rôles **primitifs**, **prédéfinis** et **personnalisés**.
- Créer un **compte de service** et lui accorder le **moindre privilège**.
- Écrire un **rôle personnalisé** avec la liste exacte de permissions.
- Décrire des ressources (Pub/Sub, Storage) en **Terraform** (provider `google`).
- Utiliser **`init`**, **`fmt`**, **`validate`** — et valider ta config **sans compte**.
- Comprendre le cycle **`plan` / `apply` / state** et pourquoi il exige de vrais identifiants.
:::

:::lang en
By the end of this guide, you can:

- Explain the IAM model: **principal → role → resource**, and **bindings**.
- Tell **primitive**, **predefined** and **custom** roles apart.
- Create a **service account** and grant it **least privilege**.
- Write a **custom role** with the exact list of permissions.
- Describe resources (Pub/Sub, Storage) in **Terraform** (`google` provider).
- Use **`init`**, **`fmt`**, **`validate`** — and validate your config **with no account**.
- Understand the **`plan` / `apply` / state** cycle and why it needs real credentials.
:::

## prerequisites

:::lang fr
- Le guide **GCP fondamentaux** terminé (modèle projet, `gcloud`).
- **Terraform** installé (`terraform version` ≥ 1.5). Sinon : [téléchargement officiel](https://developer.hashicorp.com/terraform/downloads).
- Un accès réseau à **`registry.terraform.io`** (pour télécharger le provider `google` **une fois**, à l'`init`).
- Aucun compte GCP, aucune carte : `init`, `fmt` et `validate` tournent **hors ligne** après le téléchargement du provider.
:::

:::lang en
- The **GCP fundamentals** guide done (project model, `gcloud`).
- **Terraform** installed (`terraform version` ≥ 1.5). Otherwise: [official download](https://developer.hashicorp.com/terraform/downloads).
- Network access to **`registry.terraform.io`** (to download the `google` provider **once**, at `init`).
- No GCP account, no card: `init`, `fmt` and `validate` run **offline** after the provider download.
:::

## concepts

:::lang fr
**Le modèle IAM (le cœur).** Une autorisation GCP répond à trois questions : **qui** (le *principal*), a **quel rôle** (un paquet de permissions), **sur quelle ressource**. On l'exprime par un **binding** (liaison) : `principal + rôle` attaché à une ressource (projet, bucket, sujet…). L'ensemble des bindings d'une ressource forme sa **politique** (policy).

**Les principals (membres).** *Qui* peut être : un **utilisateur** (`user:alice@ex.com`), un **groupe** (`group:eng@ex.com`), un **compte de service** (`serviceAccount:...`), un **domaine**, ou des identités spéciales. On accorde des droits à des **groupes** plutôt qu'à des personnes une à une — plus simple, plus sûr.

**Les trois familles de rôles.** (1) **Primitifs** : `Owner`, `Editor`, `Viewer` — très larges, hérités de l'ancien temps, **à éviter** (trop de pouvoir). (2) **Prédéfinis** : granulaires, maintenus par Google, ciblés par service (`roles/pubsub.publisher`, `roles/storage.objectViewer`) — **le choix par défaut**. (3) **Personnalisés** (custom) : **toi** qui listes les permissions exactes, quand aucun prédéfini ne colle assez serré.

**Comptes de service (service accounts).** Une **application** n'est pas une personne : elle s'authentifie avec un **compte de service** — une identité robotisée à qui on accorde des rôles précis. C'est **l'identité des workloads** (une VM, une Cloud Function, un pod). Bonne pratique moderne : **pas de clés JSON** à traîner ; on attache le compte de service à la ressource (Workload Identity).

**Le moindre privilège.** La règle d'or : accorde **le minimum** de permissions nécessaires, **rien de plus**. Pas de `Owner` « pour être tranquille ». Un service qui publie sur Pub/Sub reçoit `roles/pubsub.publisher`, **pas** l'accès au stockage ni aux VMs. C'est **le** réflexe sécurité que l'ACE veut te voir avoir.

**Terraform & l'infrastructure-as-code.** Plutôt que de cliquer dans la console (non reproductible) ou de scripter `gcloud` (impératif, fragile), on **décrit l'état voulu** en **HCL**, et Terraform calcule les changements. Avantages : **versionné** (Git), **revu** (pull request), **reproductible** (même code = même infra), **documenté** (le code EST la doc).

**Le cycle Terraform.** `init` (télécharge les providers), `fmt` (formate), `validate` (vérifie syntaxe + schéma, **hors ligne**), `plan` (calcule le diff avec le réel — **exige des identifiants**), `apply` (applique), `destroy` (supprime). L'**état** (state) est le fichier où Terraform mémorise ce qu'il gère — **sensible**, à ne jamais committer en clair.
:::

:::lang en
**The IAM model (the core).** A GCP authorization answers three questions: **who** (the *principal*), has **which role** (a bundle of permissions), **on which resource**. You express it with a **binding**: `principal + role` attached to a resource (project, bucket, topic…). All of a resource's bindings form its **policy**.

**Principals (members).** *Who* can be: a **user** (`user:alice@ex.com`), a **group** (`group:eng@ex.com`), a **service account** (`serviceAccount:...`), a **domain**, or special identities. Grant rights to **groups** rather than to people one by one — simpler, safer.

**The three role families.** (1) **Primitive**: `Owner`, `Editor`, `Viewer` — very broad, legacy, **to avoid** (too much power). (2) **Predefined**: granular, Google-maintained, targeted per service (`roles/pubsub.publisher`, `roles/storage.objectViewer`) — **the default choice**. (3) **Custom**: **you** list the exact permissions, when no predefined role fits tightly enough.

**Service accounts.** An **application** isn't a person: it authenticates with a **service account** — a robot identity granted specific roles. It's the **identity of workloads** (a VM, a Cloud Function, a pod). Modern best practice: **no JSON keys** lying around; attach the service account to the resource (Workload Identity).

**Least privilege.** The golden rule: grant **the minimum** permissions needed, **nothing more**. No `Owner` "to be safe". A service that publishes to Pub/Sub gets `roles/pubsub.publisher`, **not** storage or VM access. It's **the** security reflex the ACE wants to see.

**Terraform & infrastructure-as-code.** Rather than clicking in the console (not reproducible) or scripting `gcloud` (imperative, fragile), you **describe the desired state** in **HCL**, and Terraform computes the changes. Benefits: **versioned** (Git), **reviewed** (pull request), **reproducible** (same code = same infra), **documented** (the code IS the doc).

**The Terraform cycle.** `init` (downloads providers), `fmt` (formats), `validate` (checks syntax + schema, **offline**), `plan` (computes the diff with reality — **needs credentials**), `apply` (applies), `destroy` (removes). The **state** is the file where Terraform remembers what it manages — **sensitive**, never commit it in the clear.
:::

:::figure gcp-iam-terraform
caption_fr: "Schéma 1. IAM + Terraform : un fichier HCL décrit des principals (compte de service), des rôles (prédéfinis/personnalisés, au moindre privilège) et des ressources (Pub/Sub, Storage). init/fmt/validate vérifient le tout en local contre le vrai provider google, sans compte ; plan/apply — qui touchent le vrai GCP — exigent des identifiants."
caption_en: "Figure 1. IAM + Terraform: an HCL file describes principals (service account), roles (predefined/custom, least-privileged) and resources (Pub/Sub, Storage). init/fmt/validate check it all locally against the real google provider, no account; plan/apply — which touch real GCP — need credentials."
:::

## walkthrough

:::lang fr
On avance ainsi : modèle IAM & premier Terraform → accorder au moindre privilège → rôle personnalisé → décrire tes ressources en IaC → variables & outputs → le cycle plan/apply & pourquoi il faut un compte → récap moindre privilège & nettoyage. À chaque étape, on **valide en live**.
:::

:::lang en
We'll go like this: IAM model & first Terraform → grant at least privilege → custom role → describe your resources as IaC → variables & outputs → the plan/apply cycle & why you need an account → least-privilege recap & cleanup. At each step, we **validate live**.
:::

### step-01

:::lang fr
**Objectif.** Poser le modèle IAM et écrire ton **premier Terraform** — un provider et un **compte de service** — puis le **valider en live**.

**🤔 Décrire, pas cliquer.** On crée un dossier, un bloc `terraform` (versions), un bloc `provider "google"` (projet, région), et une première ressource : un **compte de service** (l'identité d'une future application). Puis `init` (télécharge le provider **une fois**) et `validate` (vérifie **sans compte**).

Crée le dossier et les fichiers :
:::

:::lang en
**Goal.** Lay down the IAM model and write your **first Terraform** — a provider and a **service account** — then **validate it live**.

**🤔 Describe, don't click.** We create a folder, a `terraform` block (versions), a `provider "google"` block (project, region), and a first resource: a **service account** (the identity of a future application). Then `init` (downloads the provider **once**) and `validate` (checks **with no account**).

Create the folder and files:
:::

```bash
mkdir -p ~/tf-gcp && cd ~/tf-gcp
```

```hcl
# main.tf
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
  project = "demo-projet"
  region  = "europe-west9"
}

# Un compte de service : l'identité d'un workload (pas une personne).
# A service account: the identity of a workload (not a person).
resource "google_service_account" "app" {
  account_id   = "app-runtime"
  display_name = "Service account de l'application"
}
```

```bash
terraform init       # télécharge le provider google (une fois) / downloads the google provider (once)
terraform validate   # vérifie syntaxe + schéma, HORS LIGNE / checks syntax + schema, OFFLINE
```

:::lang fr
**✅ Vérification :** `terraform init` affiche `Terraform has been successfully initialized!` (et `Installed hashicorp/google v5.x`). `terraform validate` affiche **`Success! The configuration is valid.`**. Tu viens d'écrire et de **valider** une ressource GCP **sans compte, sans carte** : le provider vérifie que `google_service_account` existe et que tes arguments (`account_id`, `display_name`) sont corrects. C'est la boucle de travail : écrire → `validate` → corriger. ⚠️ `validate` ne parle **pas** au vrai GCP (il ne crée rien) : il valide la **forme**. Créer viendra avec `apply` (et un compte).
:::

:::lang en
**✅ Check:** `terraform init` prints `Terraform has been successfully initialized!` (and `Installed hashicorp/google v5.x`). `terraform validate` prints **`Success! The configuration is valid.`**. You just wrote and **validated** a GCP resource **with no account, no card**: the provider checks that `google_service_account` exists and that your arguments (`account_id`, `display_name`) are correct. That's the work loop: write → `validate` → fix. ⚠️ `validate` does **not** talk to real GCP (it creates nothing): it validates the **shape**. Creating comes with `apply` (and an account).
:::

### step-02

:::lang fr
**Objectif.** Accorder des droits au **moindre privilège** avec des **rôles prédéfinis** — validé en live.

**🤔 Le triple principal-rôle-ressource.** On lie le compte de service à des **rôles prédéfinis précis** via `google_project_iam_member` : chaque bloc = **un** principal + **un** rôle sur le projet. On donne `roles/pubsub.publisher` (publier des messages) et `roles/storage.objectViewer` (lire des objets) — **rien d'autre**. Surtout **pas** `Owner`.

Ajoute à `main.tf`, puis re-valide :
:::

:::lang en
**Goal.** Grant permissions at **least privilege** with **predefined roles** — validated live.

**🤔 The principal-role-resource triple.** We bind the service account to **precise predefined roles** via `google_project_iam_member`: each block = **one** principal + **one** role on the project. We give `roles/pubsub.publisher` (publish messages) and `roles/storage.objectViewer` (read objects) — **nothing else**. Definitely **not** `Owner`.

Add to `main.tf`, then re-validate:
:::

```hcl
# Least privilege : un rôle prédéfini précis par besoin, jamais Owner.
# Least privilege: one precise predefined role per need, never Owner.
resource "google_project_iam_member" "app_publisher" {
  project = "demo-projet"
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.app.email}"
}

resource "google_project_iam_member" "app_storage_viewer" {
  project = "demo-projet"
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.app.email}"
}
```

```bash
terraform fmt        # formate proprement / clean formatting
terraform validate
```

:::lang fr
**✅ Vérification :** `terraform validate` affiche de nouveau `Success! The configuration is valid.`. Note le `member = "serviceAccount:${google_service_account.app.email}"` : Terraform **relie** les ressources — l'e-mail du compte de service (calculé à la création) est **référencé**, pas recopié à la main. ⚠️ **Point ACE — `iam_member` vs `iam_binding` vs `iam_policy` :** `_member` ajoute **un** principal à un rôle (non destructif — recommandé) ; `_binding` fixe la **liste complète** des principals d'un rôle (écrase les autres) ; `_policy` **remplace toute** la politique (dangereux). En cas de doute, `_member`.
:::

:::lang en
**✅ Check:** `terraform validate` again prints `Success! The configuration is valid.`. Note `member = "serviceAccount:${google_service_account.app.email}"`: Terraform **links** resources — the service account's email (computed at creation) is **referenced**, not hand-copied. ⚠️ **ACE point — `iam_member` vs `iam_binding` vs `iam_policy`:** `_member` adds **one** principal to a role (non-destructive — recommended); `_binding` sets the **full list** of a role's principals (overwrites others); `_policy` **replaces the entire** policy (dangerous). When in doubt, `_member`.
:::

### step-03

:::lang fr
**Objectif.** Écrire un **rôle personnalisé** — la liste exacte de permissions — validé en live.

**🤔 Quand le prédéfini ne suffit pas.** Parfois aucun rôle prédéfini ne colle : trop large, ou trop étroit. On crée alors un **rôle personnalisé** avec **exactement** les permissions voulues (format `service.ressource.action`). Ici, un rôle qui **lit** les abonnements Pub/Sub, sans plus.

Ajoute le rôle personnalisé :
:::

:::lang en
**Goal.** Write a **custom role** — the exact list of permissions — validated live.

**🤔 When predefined isn't enough.** Sometimes no predefined role fits: too broad, or too narrow. You then create a **custom role** with **exactly** the permissions you want (format `service.resource.action`). Here, a role that **reads** Pub/Sub subscriptions, nothing more.

Add the custom role:
:::

```hcl
# Rôle personnalisé : le strict nécessaire, permission par permission.
# Custom role: the strict minimum, permission by permission.
resource "google_project_iam_custom_role" "lecteur_files" {
  role_id     = "lecteurFiles"
  title       = "Lecteur de files Pub/Sub"
  description = "Lit les abonnements Pub/Sub, sans plus."
  permissions = [
    "pubsub.subscriptions.get",
    "pubsub.subscriptions.list",
  ]
}
```

```bash
terraform validate
```

:::lang fr
**✅ Vérification :** `Success! The configuration is valid.`. Ton rôle personnalisé n'accorde **que** `get` et `list` sur les abonnements — l'incarnation du moindre privilège. ⚠️ **Quand l'utiliser (point ACE) :** privilégie **toujours** un rôle **prédéfini** s'il existe (Google le maintient à jour) ; ne crée un **personnalisé** que si aucun prédéfini n'est assez serré. Un rôle personnalisé, c'est **toi** qui le maintiens quand GCP ajoute des permissions. Le format des permissions est `service.ressource.verbe` (ex. `pubsub.subscriptions.get`).
:::

:::lang en
**✅ Check:** `Success! The configuration is valid.`. Your custom role grants **only** `get` and `list` on subscriptions — least privilege incarnate. ⚠️ **When to use it (ACE point):** **always** prefer a **predefined** role if one exists (Google keeps it up to date); only create a **custom** one if no predefined fits tightly enough. A custom role is **yours** to maintain when GCP adds permissions. The permission format is `service.resource.verb` (e.g. `pubsub.subscriptions.get`).
:::

### step-04

:::lang fr
**Objectif.** Décrire **tes ressources** en IaC — les mêmes qu'aux guides précédents — validé en live.

**🤔 L'infra comme code.** Aux guides *stockage* et *messagerie*, tu as créé buckets et sujets **à la main**. Ici, tu les **décris** : un sujet Pub/Sub, son abonnement (avec dead-letter), un sujet de rebut, et un bucket (avec versioning + cycle de vie). Le **même résultat**, mais **reproductible** et **versionné**.

Ajoute les ressources :
:::

:::lang en
**Goal.** Describe **your resources** as IaC — the same as in previous guides — validated live.

**🤔 Infra as code.** In the *storage* and *messaging* guides, you created buckets and topics **by hand**. Here, you **describe** them: a Pub/Sub topic, its subscription (with dead-letter), a dead-letter topic, and a bucket (with versioning + lifecycle). The **same result**, but **reproducible** and **versioned**.

Add the resources:
:::

```hcl
# Sujet + abonnement (avec dead-letter) / topic + subscription (with dead-letter)
resource "google_pubsub_topic" "commandes" {
  name = "commandes"
}

resource "google_pubsub_topic" "rebut" {
  name = "commandes-rebut"
}

resource "google_pubsub_subscription" "facturation" {
  name                 = "facturation"
  topic                = google_pubsub_topic.commandes.id
  ack_deadline_seconds = 20

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.rebut.id
    max_delivery_attempts = 5
  }
}

# Bucket avec versioning + cycle de vie / bucket with versioning + lifecycle
resource "google_storage_bucket" "artefacts" {
  name          = "atelier-artefacts-demo-projet"
  location      = "EU"
  storage_class = "STANDARD"
  force_destroy = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }
}
```

```bash
terraform fmt
terraform validate
```

:::lang fr
**✅ Vérification :** `Success! The configuration is valid.`. Tu as décrit en **une trentaine de lignes** ce qu'il fallait cliquer/scripter aux guides précédents — et c'est **rejouable à l'identique**. Remarque les **références** entre ressources : `topic = google_pubsub_topic.commandes.id`, `dead_letter_topic = google_pubsub_topic.rebut.id`. Terraform en déduit l'**ordre de création** (le sujet avant l'abonnement) via ce graphe de dépendances. ⚠️ Le `versioning` et le `lifecycle_rule` — vus en **concept** au guide *stockage* car fake-gcs ne les émule pas — sont ici **exacts pour le vrai GCP** et **validés** par le provider.
:::

:::lang en
**✅ Check:** `Success! The configuration is valid.`. You described in **about thirty lines** what needed clicking/scripting in the previous guides — and it's **replayable identically**. Note the **references** between resources: `topic = google_pubsub_topic.commandes.id`, `dead_letter_topic = google_pubsub_topic.rebut.id`. Terraform infers the **creation order** (topic before subscription) from this dependency graph. ⚠️ The `versioning` and `lifecycle_rule` — seen as **concept** in the *storage* guide since fake-gcs doesn't emulate them — are here **exact for real GCP** and **validated** by the provider.
:::

### step-05

:::lang fr
**Objectif.** Rendre ta config **réutilisable** avec des **variables** et des **outputs** — validé en live.

**🤔 Paramétrer, pas coder en dur.** Répéter `"demo-projet"` partout est fragile. On extrait le projet et la région en **variables** (`var.project_id`), et on expose des **outputs** (l'e-mail du compte de service, le nom du sujet) — utiles pour l'humain et pour chaîner des modules. La même config sert alors **plusieurs environnements** (dev, prod) en changeant une valeur.

Crée `variables.tf` et `outputs.tf`, et remplace les valeurs en dur :
:::

:::lang en
**Goal.** Make your config **reusable** with **variables** and **outputs** — validated live.

**🤔 Parameterize, don't hard-code.** Repeating `"demo-projet"` everywhere is fragile. We extract project and region into **variables** (`var.project_id`), and expose **outputs** (the service account email, the topic name) — useful for humans and for chaining modules. The same config then serves **multiple environments** (dev, prod) by changing one value.

Create `variables.tf` and `outputs.tf`, and replace the hard-coded values:
:::

```hcl
# variables.tf
variable "project_id" {
  type        = string
  description = "L'identifiant du projet GCP."
  default     = "demo-projet"
}

variable "region" {
  type    = string
  default = "europe-west9"
}
```

```hcl
# outputs.tf
output "service_account_email" {
  value       = google_service_account.app.email
  description = "L'e-mail du compte de service applicatif."
}

output "topic_name" {
  value = google_pubsub_topic.commandes.name
}
```

:::lang fr
Puis, dans `main.tf`, remplace `project = "demo-projet"` par `project = var.project_id` (et la région par `var.region`) dans le provider et les blocs `iam_member`. Re-valide :
:::

:::lang en
Then, in `main.tf`, replace `project = "demo-projet"` with `project = var.project_id` (and the region with `var.region`) in the provider and the `iam_member` blocks. Re-validate:
:::

```bash
terraform fmt
terraform validate
```

:::lang fr
**✅ Vérification :** `Success! The configuration is valid.`. Ta config est maintenant **paramétrée** : changer de projet = changer **une** variable (ou passer `-var="project_id=autre-projet"`). Les **outputs** exposent les valeurs calculées (l'e-mail du compte de service n'existe qu'après création — Terraform le résoudra à l'`apply`). ⚠️ Bonne pratique : un fichier `terraform.tfvars` (non committé) porte les valeurs par environnement ; les `variable` **sans** `default` deviennent **obligatoires** (Terraform les demande). C'est la base des **modules** réutilisables.
:::

:::lang en
**✅ Check:** `Success! The configuration is valid.`. Your config is now **parameterized**: switching projects = changing **one** variable (or passing `-var="project_id=other-project"`). The **outputs** expose computed values (the service account email exists only after creation — Terraform resolves it at `apply`). ⚠️ Best practice: a `terraform.tfvars` file (not committed) carries per-environment values; `variable`s **without** a `default` become **required** (Terraform asks for them). It's the basis of reusable **modules**.
:::

### step-06

:::lang fr
**Objectif.** Comprendre le cycle **`plan` / `apply` / state** — et voir **pourquoi** il exige un vrai compte.

**🤔 Là où le local s'arrête (honnêtement).** `validate` vérifie la **forme** sans compte. Mais **créer** l'infra, c'est `plan` (calculer le diff entre ton code et le réel) puis `apply` (l'appliquer). Or `plan` doit **interroger le vrai GCP** → il lui faut des **identifiants** (Application Default Credentials). Sans compte, `plan` **échoue** — et c'est **normal**. Voyons l'erreur exacte, pour la reconnaître :

Lance `plan` (il va échouer, volontairement) :
:::

:::lang en
**Goal.** Understand the **`plan` / `apply` / state** cycle — and see **why** it needs a real account.

**🤔 Where local stops (honestly).** `validate` checks the **shape** with no account. But **creating** the infra is `plan` (compute the diff between your code and reality) then `apply` (apply it). And `plan` must **query real GCP** → it needs **credentials** (Application Default Credentials). With no account, `plan` **fails** — and that's **normal**. Let's see the exact error, to recognize it:

Run `plan` (it will fail, on purpose):
:::

```bash
terraform plan
```

:::lang fr
**✅ Vérification :** `plan` s'arrête sur : `Error: Attempted to load application default credentials ... No credentials loaded. To use your gcloud credentials, run 'gcloud auth application-default login'`. **C'est le résultat attendu** : ta config est **valide** (prouvé à l'étape 1-5), mais `plan`/`apply` **touchent le vrai GCP** et exigent une authentification. Retiens le cycle complet : `init` → `fmt` → `validate` (**local, sans compte**) → `plan` → `apply` → `destroy` (**réel, avec compte**). Le fichier d'**état** (`terraform.tfstate`) mémorise ce que Terraform gère : **sensible** (jamais dans Git ; en équipe, un **backend distant** verrouillé). ⚠️ Brancher un **vrai compte** (ADC, projet de test, garde-fous de coût) et faire un `apply` réel, c'est **exactement** l'objet du guide *passer en réel*.
:::

:::lang en
**✅ Check:** `plan` stops on: `Error: Attempted to load application default credentials ... No credentials loaded. To use your gcloud credentials, run 'gcloud auth application-default login'`. **That's the expected result**: your config is **valid** (proven in steps 1-5), but `plan`/`apply` **touch real GCP** and require authentication. Remember the full cycle: `init` → `fmt` → `validate` (**local, no account**) → `plan` → `apply` → `destroy` (**real, with account**). The **state** file (`terraform.tfstate`) remembers what Terraform manages: **sensitive** (never in Git; on a team, a locked **remote backend**). ⚠️ Wiring a **real account** (ADC, a test project, cost guardrails) and doing a real `apply` is **exactly** the subject of the *going real* guide.
:::

### step-07

:::lang fr
**Objectif.** Ancrer le réflexe **moindre privilège**, puis nettoyer.

**🤔 La grille de décision (cœur de l'ACE).** Avant d'accorder un droit, demande-toi : **qui** en a besoin (un groupe ? un compte de service ?), **pour quoi faire** (le rôle **le plus étroit** qui suffit), **sur quelle ressource** (le projet ? un seul bucket ?). L'ordre de préférence des rôles : **prédéfini** > **personnalisé** > (jamais) **primitif**. Et côté IaC : **décris tout**, **versionne**, **revois en PR**.

Vérifie une dernière fois, puis nettoie :
:::

:::lang en
**Goal.** Anchor the **least-privilege** reflex, then clean up.

**🤔 The decision grid (ACE core).** Before granting a right, ask: **who** needs it (a group? a service account?), **for what** (the **narrowest** role that suffices), **on which resource** (the project? a single bucket?). Role preference order: **predefined** > **custom** > (never) **primitive**. And on the IaC side: **describe everything**, **version it**, **review in PRs**.

Check one last time, then clean up:
:::

```bash
terraform validate         # doit encore afficher Success / must still print Success
terraform fmt -check       # confirme que tout est bien formaté / confirms clean formatting

# Nettoyage local (aucune ressource réelle n'a été créée) / local cleanup (no real resource was created)
cd ~ && rm -rf ~/tf-gcp
# En RÉEL, on supprimerait l'infra gérée avec / on REAL GCP, you'd tear down managed infra with:
#   terraform destroy
```

:::lang fr
**✅ Vérification :** `terraform validate` affiche une dernière fois `Success! The configuration is valid.` et `fmt -check` ne renvoie rien (tout est formaté). Tu as **écrit, structuré et validé** une infra GCP complète — comptes de service, rôles au moindre privilège, rôle personnalisé, Pub/Sub, Storage, variables, outputs — **sans compte ni facture**. Le nettoyage local suffit ici : aucune ressource réelle n'a été créée (on n'a jamais fait `apply`). ⚠️ **En réel**, `terraform destroy` détruit ce que le state gère — la contrepartie propre de `apply`. La suite : le **projet d'entreprise**, où tu assembles tout (pipeline événementiel sur émulateurs + cette infra Terraform) en un livrable de CV.
:::

:::lang en
**✅ Check:** `terraform validate` prints one last `Success! The configuration is valid.` and `fmt -check` returns nothing (all formatted). You **wrote, structured and validated** a complete GCP infra — service accounts, least-privilege roles, a custom role, Pub/Sub, Storage, variables, outputs — **with no account or bill**. Local cleanup suffices here: no real resource was created (we never ran `apply`). ⚠️ **On real GCP**, `terraform destroy` tears down what the state manages — the clean counterpart to `apply`. Next up: the **enterprise project**, where you assemble everything (an event-driven pipeline on emulators + this Terraform infra) into a CV-worthy deliverable.
:::

## pitfalls

:::lang fr
**1. Accorder `Owner`/`Editor` « pour être tranquille ».** C'est l'anti-moindre-privilège. Un principal `Owner` peut **tout** faire, y compris supprimer le projet. Utilise des rôles **prédéfinis** ciblés.

**2. Confondre `iam_member`, `iam_binding`, `iam_policy`.** `_member` = additif (sûr). `_binding` = fixe la liste d'un rôle (écrase les autres membres). `_policy` = remplace **toute** la politique (peut te verrouiller dehors). En cas de doute, `_member`.

**3. Committer le fichier d'état.** `terraform.tfstate` contient des données **sensibles** (parfois des secrets). Jamais dans Git. En équipe : **backend distant** chiffré + verrou.

**4. Créer des clés JSON de compte de service.** Une clé qui fuite = une porte ouverte. Préfère l'**attachement** du compte de service à la ressource (Workload Identity) — pas de clé à gérer.

**5. Coder les valeurs en dur.** `project`, `region`, noms… en variables. Sinon la config n'est ni réutilisable ni multi-environnement.

**6. Croire que `validate` crée quelque chose.** `validate` vérifie la **forme**, hors ligne. Rien n'est créé tant que tu n'as pas fait `apply` (avec un compte).

**7. Oublier `fmt` avant la revue.** Un code mal formaté pollue les diffs. `terraform fmt` (ou `fmt -check` en CI) garde tout net.
:::

:::lang en
**1. Granting `Owner`/`Editor` "to be safe".** That's the anti-least-privilege. An `Owner` principal can do **everything**, including deleting the project. Use targeted **predefined** roles.

**2. Confusing `iam_member`, `iam_binding`, `iam_policy`.** `_member` = additive (safe). `_binding` = sets a role's list (overwrites other members). `_policy` = replaces the **whole** policy (can lock you out). When in doubt, `_member`.

**3. Committing the state file.** `terraform.tfstate` holds **sensitive** data (sometimes secrets). Never in Git. On a team: an encrypted **remote backend** + lock.

**4. Creating service-account JSON keys.** A leaked key = an open door. Prefer **attaching** the service account to the resource (Workload Identity) — no key to manage.

**5. Hard-coding values.** `project`, `region`, names… into variables. Otherwise the config is neither reusable nor multi-environment.

**6. Thinking `validate` creates something.** `validate` checks the **shape**, offline. Nothing is created until you `apply` (with an account).

**7. Forgetting `fmt` before review.** Badly formatted code pollutes diffs. `terraform fmt` (or `fmt -check` in CI) keeps it tidy.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu expliques **principal → rôle → ressource** et le rôle des **bindings**.
- [ ] Tu distingues rôles **primitifs / prédéfinis / personnalisés** et sais lequel préférer.
- [ ] Tu crées un **compte de service** et lui accordes un rôle **précis** (pas Owner).
- [ ] Tu écris un **rôle personnalisé** avec la liste exacte de permissions.
- [ ] Tu décris Pub/Sub + Storage en **Terraform** et ça **valide**.
- [ ] Tu paramètres avec **variables** et exposes des **outputs**.
- [ ] Tu expliques pourquoi **`plan`/`apply`** exigent un compte, pas **`validate`**.

Sept cases = tu tiens IAM & Terraform au niveau ACE. La suite : le projet d'entreprise.
:::

:::lang en
You know it works when…

- [ ] You explain **principal → role → resource** and the role of **bindings**.
- [ ] You tell **primitive / predefined / custom** roles apart and know which to prefer.
- [ ] You create a **service account** and grant it a **precise** role (not Owner).
- [ ] You write a **custom role** with the exact list of permissions.
- [ ] You describe Pub/Sub + Storage in **Terraform** and it **validates**.
- [ ] You parameterize with **variables** and expose **outputs**.
- [ ] You explain why **`plan`/`apply`** need an account, but not **`validate`**.

Seven boxes = you hold IAM & Terraform at ACE level. Next up: the enterprise project.
:::

## next

:::lang fr
La suite du track GCP → ACE :

1. **GCP — projet d'entreprise** : un **pipeline événementiel complet** (ingestion → Pub/Sub → traitement → stockage) tourné sur les émulateurs **et** décrit en Terraform — le livrable à mettre sur ton CV.
2. Puis **passer en réel** : brancher un vrai compte (ADC), garde-fous de coût, `plan`/`apply`, et la dernière ligne droite vers la **certification ACE**.
:::

:::lang en
The GCP → ACE track continues:

1. **GCP — enterprise project**: a **full event-driven pipeline** (ingestion → Pub/Sub → processing → storage) run on the emulators **and** described in Terraform — the deliverable for your CV.
2. Then **going real**: wiring a real account (ADC), cost guardrails, `plan`/`apply`, and the final stretch toward the **ACE certification**.
:::

## cheatsheet

:::lang fr
Aide-mémoire IAM & Terraform.
:::

:::lang en
IAM & Terraform cheat sheet.
:::

```hcl
# Provider / provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Compte de service / service account
resource "google_service_account" "app" {
  account_id = "app-runtime"
}

# Moindre privilège : ajouter UN principal à UN rôle / least privilege: add ONE principal to ONE role
resource "google_project_iam_member" "x" {
  project = var.project_id
  role    = "roles/pubsub.publisher" # prédéfini / predefined
  member  = "serviceAccount:${google_service_account.app.email}"
}

# Rôle personnalisé / custom role
resource "google_project_iam_custom_role" "r" {
  role_id     = "monRole"
  title       = "Mon rôle"
  permissions = ["pubsub.subscriptions.get"]
}
```

```bash
# Cycle Terraform / Terraform cycle
terraform init        # providers (une fois / once)
terraform fmt         # formater / format         (fmt -check en CI)
terraform validate    # syntaxe + schéma, HORS LIGNE / offline — sans compte / no account
terraform plan        # diff avec le réel — EXIGE un compte / needs an account
terraform apply       # créer/mettre à jour / create-update  (avec compte / with account)
terraform destroy     # supprimer / tear down
```

## resources

:::lang fr
- [Vue d'ensemble IAM](https://cloud.google.com/iam/docs/overview) — principals, rôles, policies.
- [Rôles prédéfinis](https://cloud.google.com/iam/docs/understanding-roles) — le catalogue par service.
- [Rôles personnalisés](https://cloud.google.com/iam/docs/creating-custom-roles) — permissions à la carte.
- [Comptes de service](https://cloud.google.com/iam/docs/service-account-overview) — l'identité des workloads.
- [Provider Terraform `google`](https://registry.terraform.io/providers/hashicorp/google/latest/docs) — la référence des ressources.
- [Terraform sur GCP — bonnes pratiques](https://cloud.google.com/docs/terraform/best-practices-for-terraform) — structure, state, modules.
:::

:::lang en
- [IAM overview](https://cloud.google.com/iam/docs/overview) — principals, roles, policies.
- [Predefined roles](https://cloud.google.com/iam/docs/understanding-roles) — the per-service catalog.
- [Custom roles](https://cloud.google.com/iam/docs/creating-custom-roles) — à la carte permissions.
- [Service accounts](https://cloud.google.com/iam/docs/service-account-overview) — the identity of workloads.
- [Terraform `google` provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs) — the resource reference.
- [Terraform on GCP — best practices](https://cloud.google.com/docs/terraform/best-practices-for-terraform) — structure, state, modules.
:::

## troubleshooting

:::lang fr
**`terraform init` échoue (téléchargement du provider).** Il faut un accès à `registry.terraform.io` **une fois**. Vérifie ton réseau/proxy. Après ce téléchargement, `fmt`/`validate` sont hors ligne.

**`validate` : `Reference to undeclared resource`.** Tu références une ressource (`google_...`) non déclarée, ou une faute de frappe dans son nom local. Vérifie que le bloc existe et que le nom correspond exactement.

**`validate` : `Unsupported argument` / `Missing required argument`.** Un argument n'existe pas (ou manque) pour cette ressource dans le schéma du provider. Consulte la doc du provider `google` pour la ressource concernée — le schéma fait foi.

**`plan` : `Attempted to load application default credentials ... No credentials loaded`.** **Attendu sans compte.** `plan`/`apply` touchent le vrai GCP. Ce sera l'objet du guide *passer en réel* (`gcloud auth application-default login`).

**`terraform fmt` modifie mes fichiers.** Normal : il réindente. Lance-le avant chaque commit ; en CI, `terraform fmt -check` échoue si un fichier n'est pas formaté (sans le modifier).

**Version de provider incompatible.** `version = "~> 5.0"` fige la **majeure** 5. Si une ressource/argument diffère, aligne ta version sur la doc que tu lis (le schéma change entre majeures).
:::

:::lang en
**`terraform init` fails (provider download).** You need access to `registry.terraform.io` **once**. Check your network/proxy. After that download, `fmt`/`validate` are offline.

**`validate`: `Reference to undeclared resource`.** You reference a resource (`google_...`) that isn't declared, or a typo in its local name. Check the block exists and the name matches exactly.

**`validate`: `Unsupported argument` / `Missing required argument`.** An argument doesn't exist (or is missing) for that resource in the provider schema. Check the `google` provider docs for the resource — the schema is authoritative.

**`plan`: `Attempted to load application default credentials ... No credentials loaded`.** **Expected with no account.** `plan`/`apply` touch real GCP. That's the subject of the *going real* guide (`gcloud auth application-default login`).

**`terraform fmt` changes my files.** Normal: it re-indents. Run it before each commit; in CI, `terraform fmt -check` fails if a file isn't formatted (without modifying it).

**Incompatible provider version.** `version = "~> 5.0"` pins **major** 5. If a resource/argument differs, align your version with the docs you're reading (the schema changes between majors).
:::
