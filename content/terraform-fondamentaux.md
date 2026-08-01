---
# — Identité (ne change JAMAIS une fois publié) —
id: terraform-fondamentaux
slug: terraform-fondamentaux
order: 8
status: published

# — Titres & accroches (bilingue) —
title_fr: "Terraform — l'infrastructure en code"
title_en: "Terraform — infrastructure as code"
tagline_fr: "Déclaratif, plan/apply, state, variables, modules."
tagline_en: "Declarative, plan/apply, state, variables, modules."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 150
repo: "hashicorp/terraform"
last_review: "2026-07-31"

# — Relations de parcours (par id) —
prerequisites: [docker-fondamentaux]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [iac-declaratif, providers-ressources, plan-apply, state, variables-outputs, graphe-dependances, modules]
concepts_en: [declarative-iac, providers-resources, plan-apply, state, variables-outputs, dependency-graph, modules]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Apprends Terraform sur ta propre machine, sans compte cloud : le provider Docker pour provisionner en local, plan/apply, le state, variables et outputs, le graphe de dépendances et les modules. Aligné Terraform Associate."
og_description_en: "Learn Terraform on your own machine, no cloud account: the Docker provider to provision locally, plan/apply, state, variables and outputs, the dependency graph and modules. Aligned with Terraform Associate."
---

## intro

:::lang fr
Ansible **configure** des machines qui existent déjà. Mais qui **crée** les machines, les réseaux, les volumes ? À la main dans une console cloud, c'est lent, non reproductible, et impossible à versionner. **Terraform** décrit ton infrastructure en **code déclaratif** : tu écris l'état voulu (« je veux ce conteneur, ce réseau »), Terraform calcule les actions nécessaires et les applique.

Deux idées le rendent puissant : le **plan** (Terraform te montre *exactement* ce qu'il va créer/modifier/détruire **avant** d'agir) et le **state** (il mémorise ce qu'il gère, pour ne toucher qu'aux différences). C'est de l'infrastructure **comme du code** : versionnée en Git, revue en pull request, rejouée à l'identique.

Le piège pour apprendre Terraform : la plupart des tutos exigent un compte AWS/Azure (carte bancaire, risque de facture). Ici, on utilise le **provider Docker** : tu provisionnes des conteneurs **en local**, sur ta machine, avec exactement la même grammaire Terraform qu'en production cloud. Zéro compte, zéro coût.

**Pour qui c'est :** tu connais Docker (image, conteneur, port) et tu veux décrire ton infra en code plutôt qu'à la main.

**Quand ce n'est PAS le bon choix :**

- Tu ne maîtrises pas Docker → repasse par ce guide, c'est le prérequis dur (on s'en sert comme « infra » à provisionner).
- Tu veux **configurer l'intérieur** d'une machine (installer des paquets, éditer des fichiers) : c'est le rôle d'Ansible. Terraform **crée** l'infra, Ansible la **configure**.
:::

:::lang en
Ansible **configures** machines that already exist. But who **creates** the machines, networks, volumes? By hand in a cloud console, it's slow, not reproducible, and impossible to version. **Terraform** describes your infrastructure as **declarative code**: you write the desired state ("I want this container, this network"), Terraform computes the necessary actions and applies them.

Two ideas make it powerful: the **plan** (Terraform shows you *exactly* what it will create/change/destroy **before** acting) and the **state** (it remembers what it manages, to touch only the differences). It's infrastructure **as code**: versioned in Git, reviewed in a pull request, replayed identically.

The trap when learning Terraform: most tutorials require an AWS/Azure account (credit card, risk of a bill). Here, we use the **Docker provider**: you provision containers **locally**, on your machine, with the exact same Terraform grammar as in cloud production. Zero account, zero cost.

**Who it's for:** you know Docker (image, container, port) and you want to describe your infra as code rather than by hand.

**When it's NOT the right choice:**

- You're not comfortable with Docker → go back through that guide, it's the hard prerequisite (we use it as the "infra" to provision).
- You want to **configure the inside** of a machine (install packages, edit files): that's Ansible's job. Terraform **creates** the infra, Ansible **configures** it.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Ce qu'est l'**IaC déclarative** : décrire l'état voulu, pas les étapes.
- Écrire du **HCL** : `provider`, `resource`, références entre ressources.
- Le cycle **`init` → `plan` → `apply` → `destroy`**.
- Le rôle du **state** et pourquoi on ne l'édite jamais à la main.
- Paramétrer avec **variables** et exposer avec **outputs**.
- Comment Terraform déduit un **graphe de dépendances**.
- Factoriser avec un **module**.
:::

:::lang en
By the end of this guide, you'll know:

- What **declarative IaC** is: describe the desired state, not the steps.
- How to write **HCL**: `provider`, `resource`, references between resources.
- The **`init` → `plan` → `apply` → `destroy`** cycle.
- The role of **state** and why you never edit it by hand.
- How to parameterize with **variables** and expose with **outputs**.
- How Terraform derives a **dependency graph**.
- How to factor things out with a **module**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Le guide **Docker fondamentaux** acquis (image, conteneur, port — prérequis dur).
- **Docker** installé et fonctionnel (`docker run hello-world` marche).
- **Terraform** installé. Vérifie, ou suis la [doc d'installation officielle](https://developer.hashicorp.com/terraform/install) pour ton OS :
:::

:::lang en
You should have:

- The **Docker fundamentals** guide under your belt (image, container, port — hard prerequisite).
- **Docker** installed and working (`docker run hello-world` works).
- **Terraform** installed. Check, or follow the [official install docs](https://developer.hashicorp.com/terraform/install) for your OS:
:::

```bash
terraform version        # ex. Terraform v1.9.x
mkdir tf-demo && cd tf-demo   # dossier de travail / working directory
```

## concepts

:::lang fr
Terraform s'articule autour de quelques briques.

- Un **provider** est un plugin qui sait parler à une plateforme (AWS, Azure, Docker…). Il traduit tes ressources en appels d'API. Ici, le provider **Docker** parle à ton démon Docker local.
- Une **ressource** (`resource`) est un objet géré : un conteneur, une image, un réseau. Tu décris ses attributs voulus ; Terraform se charge de l'amener à cet état.
- Le **state** (`terraform.tfstate`) est le carnet de comptes de Terraform : il mémorise la correspondance entre ton code et les objets réels. C'est **lui** qui permet à Terraform de savoir ce qui existe déjà et donc quoi créer, modifier ou détruire. On n'y touche **jamais** à la main.

Le cœur du modèle : le cycle **plan / apply**. `terraform plan` compare trois choses — ton **code** (l'état voulu), le **state** (ce que Terraform croit exister) et le **réel** — et t'affiche le diff : `+` créer, `~` modifier, `-` détruire. `terraform apply` exécute ce plan. Tu **valides toujours le plan avant d'appliquer** : c'est le garde-fou contre les surprises.

Enfin, Terraform déduit un **graphe de dépendances** : si un conteneur référence une image, Terraform crée l'image **d'abord**, automatiquement. Tu décris le *quoi*, pas l'*ordre*.
:::

:::lang en
Terraform revolves around a few building blocks.

- A **provider** is a plugin that knows how to talk to a platform (AWS, Azure, Docker…). It translates your resources into API calls. Here, the **Docker** provider talks to your local Docker daemon.
- A **resource** (`resource`) is a managed object: a container, an image, a network. You describe its desired attributes; Terraform brings it to that state.
- The **state** (`terraform.tfstate`) is Terraform's ledger: it records the mapping between your code and the real objects. It's **what** lets Terraform know what already exists, hence what to create, change, or destroy. You **never** touch it by hand.

The heart of the model: the **plan / apply** cycle. `terraform plan` compares three things — your **code** (desired state), the **state** (what Terraform thinks exists), and **reality** — and shows you the diff: `+` create, `~` change, `-` destroy. `terraform apply` runs that plan. You **always review the plan before applying**: it's the guardrail against surprises.

Finally, Terraform derives a **dependency graph**: if a container references an image, Terraform creates the image **first**, automatically. You describe the *what*, not the *order*.
:::

:::figure terraform-plan-apply
caption_fr: "Schéma 1. Le cycle plan/apply : code + state + réel → diff → application."
caption_en: "Figure 1. The plan/apply cycle: code + state + reality → diff → apply."
:::

:::lang fr
On avance ainsi : premier provider & init → première ressource (plan/apply) → le state → variables & outputs → dépendances & modification → module → destroy.
:::

:::lang en
We'll go like this: first provider & init → first resource (plan/apply) → the state → variables & outputs → dependencies & change → module → destroy.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Déclarer le provider Docker et initialiser le projet.

**🤔 Pourquoi `terraform init` ?** Terraform ne connaît aucun provider par défaut. `init` lit ton bloc `required_providers`, **télécharge** le plugin correspondant, et prépare le dossier. C'est la première commande de tout projet — et à relancer quand tu ajoutes un provider.

Crée `main.tf` :
:::

:::lang en
**Goal.** Declare the Docker provider and initialize the project.

**🤔 Why `terraform init`?** Terraform knows no providers by default. `init` reads your `required_providers` block, **downloads** the matching plugin, and prepares the folder. It's the first command of any project — and to re-run when you add a provider.

Create `main.tf`:
:::

```hcl
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}
```

```bash
terraform init
```

:::lang fr
**✅ Vérification :** `init` affiche « Terraform has been successfully initialized! ». Un dossier `.terraform/` et un fichier `.terraform.lock.hcl` (qui **fige** la version du provider) sont apparus.
:::

:::lang en
**✅ Check:** `init` prints "Terraform has been successfully initialized!". A `.terraform/` folder and a `.terraform.lock.hcl` file (which **pins** the provider version) appeared.
:::

### step-02

:::lang fr
**Objectif.** Provisionner ta première ressource : une image + un conteneur nginx.

**🤔 Pourquoi référencer `docker_image.nginx.image_id` ?** Le conteneur a besoin d'une image. En **référençant** l'attribut de la ressource image plutôt qu'en écrivant un nom en dur, tu crées une **dépendance explicite** : Terraform sait qu'il doit créer l'image avant le conteneur. C'est ça, le graphe.

Ajoute à `main.tf` :
:::

:::lang en
**Goal.** Provision your first resource: an image + an nginx container.

**🤔 Why reference `docker_image.nginx.image_id`?** The container needs an image. By **referencing** the image resource's attribute rather than hardcoding a name, you create an **explicit dependency**: Terraform knows it must create the image before the container. That's the graph.

Add to `main.tf`:
:::

```hcl
resource "docker_image" "nginx" {
  name = "nginx:1.27"
}

resource "docker_container" "web" {
  name  = "tf-web"
  image = docker_image.nginx.image_id
  ports {
    internal = 80
    external = 8080
  }
}
```

```bash
terraform plan          # regarde AVANT d'agir / look BEFORE acting
terraform apply         # tape "yes" pour confirmer / type "yes" to confirm
curl http://localhost:8080
```

:::lang fr
**✅ Vérification :** `plan` annonce `Plan: 2 to add`. Après `apply`, `curl http://localhost:8080` affiche la page nginx, et `docker ps` liste le conteneur `tf-web`. Tu viens de créer de l'infra **par du code**.
:::

:::lang en
**✅ Check:** `plan` announces `Plan: 2 to add`. After `apply`, `curl http://localhost:8080` shows the nginx page, and `docker ps` lists the `tf-web` container. You just created infrastructure **with code**.
:::

### step-03

:::lang fr
**Objectif.** Comprendre le **state** et vérifier l'idempotence.

**🤔 Pourquoi le state est-il central ?** Il mémorise ce que Terraform gère. Relance `apply` sans rien changer : Terraform compare code, state et réel → **aucune** action. Comme Ansible, Terraform est **idempotent** : il converge vers l'état voulu, sans effet de bord.
:::

:::lang en
**Goal.** Understand the **state** and verify idempotence.

**🤔 Why is state central?** It records what Terraform manages. Re-run `apply` without changing anything: Terraform compares code, state, and reality → **no** action. Like Ansible, Terraform is **idempotent**: it converges to the desired state, with no side effects.
:::

```bash
terraform state list          # les ressources gérées / the managed resources
terraform show                # l'état détaillé / the detailed state
terraform apply               # relance : "No changes." / re-run: "No changes."
```

:::lang fr
**✅ Vérification :** `state list` montre `docker_image.nginx` et `docker_container.web`. Le second `apply` affiche « No changes. Your infrastructure matches the configuration ». 

⚠️ **Ne modifie jamais `terraform.tfstate` à la main** et ne le commite pas s'il contient des secrets. Il reflète le réel : le corrompre, c'est faire perdre à Terraform la trace de ton infra.
:::

:::lang en
**✅ Check:** `state list` shows `docker_image.nginx` and `docker_container.web`. The second `apply` prints "No changes. Your infrastructure matches the configuration".

⚠️ **Never edit `terraform.tfstate` by hand** and don't commit it if it holds secrets. It reflects reality: corrupting it makes Terraform lose track of your infra.
:::

### step-04

:::lang fr
**Objectif.** Paramétrer avec des **variables** et exposer une **output**.

**🤔 Pourquoi ?** Coder le port `8080` en dur t'oblige à éditer le code pour chaque environnement. Une **variable** externalise ce choix ; une **output** expose une valeur utile (ici l'URL) après `apply`, réutilisable par un autre outil ou un humain.

Crée `variables.tf`, `outputs.tf` et `terraform.tfvars` :
:::

:::lang en
**Goal.** Parameterize with **variables** and expose an **output**.

**🤔 Why?** Hardcoding port `8080` forces you to edit the code for every environment. A **variable** externalizes that choice; an **output** exposes a useful value (here the URL) after `apply`, reusable by another tool or a human.

Create `variables.tf`, `outputs.tf` and `terraform.tfvars`:
:::

```hcl
# variables.tf
variable "external_port" {
  type    = number
  default = 8080
}

variable "nginx_tag" {
  type    = string
  default = "1.27"
}
```

```hcl
# outputs.tf
output "url" {
  value = "http://localhost:${var.external_port}"
}
```

```hcl
# terraform.tfvars — Terraform lit ce fichier automatiquement / Terraform reads this file automatically
external_port = 9090
nginx_tag     = "1.27"
```

:::lang fr
Mets à jour `main.tf` pour utiliser les variables (le bloc `terraform`/`provider` du step-01 reste inchangé) :
:::

:::lang en
Update `main.tf` to use the variables (the `terraform`/`provider` block from step-01 stays unchanged):
:::

```hcl
resource "docker_image" "nginx" {
  name = "nginx:${var.nginx_tag}"
}

resource "docker_container" "web" {
  name  = "tf-web"
  image = docker_image.nginx.image_id
  ports {
    internal = 80
    external = var.external_port
  }
}
```

```bash
terraform apply         # lit terraform.tfvars (port 9090) / reads terraform.tfvars (port 9090)
terraform output url    # http://localhost:9090
```

:::lang fr
**✅ Vérification :** le `plan` montre que le conteneur est **remplacé** (`-/+`, avec la ligne `forces replacement`) — un conteneur Docker est quasi immuable, Terraform le recrée pour changer son port. Après `apply`, `terraform output url` renvoie `http://localhost:9090` et le `curl` sur ce port répond.
:::

:::lang en
**✅ Check:** the `plan` shows the container is **replaced** (`-/+`, with the `forces replacement` line) — a Docker container is nearly immutable, Terraform recreates it to change its port. After `apply`, `terraform output url` returns `http://localhost:9090` and a `curl` on that port responds.
:::

### step-05

:::lang fr
**Objectif.** Observer le **graphe de dépendances** en changeant l'image.

**🤔 `~` (en place) vs `-/+` (remplacement) ?** Sur beaucoup de ressources cloud, un changement se fait **en place** (`~`). Mais un conteneur Docker est **quasi immuable** : changer son image (comme son port à l'étape précédente) impose de le **remplacer** (`-/+` : détruire puis recréer). L'important ici, c'est le **graphe** : la nouvelle image est créée **avant** que le conteneur soit recréé. Lis toujours le plan pour repérer les remplacements.
:::

:::lang en
**Goal.** Observe the **dependency graph** by changing the image.

**🤔 `~` (in place) vs `-/+` (replacement)?** On many cloud resources, a change happens **in place** (`~`). But a Docker container is **nearly immutable**: changing its image (like its port in the previous step) forces a **replace** (`-/+`: destroy then recreate). What matters here is the **graph**: the new image is created **before** the container is recreated. Always read the plan to spot replacements.
:::

:::lang fr
Change `nginx_tag` à `1.26` dans `terraform.tfvars`, puis :
:::

:::lang en
Change `nginx_tag` to `1.26` in `terraform.tfvars`, then:
:::

```bash
terraform plan          # cherche la ligne "forces replacement" / look for the "forces replacement" line
terraform apply -auto-approve
```

:::lang fr
**✅ Vérification :** le `plan` annonce une nouvelle image `nginx:1.26` à **créer** et le conteneur à **remplacer** (`-/+ forces replacement`). Terraform gère l'ordre tout seul : l'image d'abord, le conteneur ensuite — c'est le graphe de dépendances. *(`-auto-approve` saute la confirmation — pratique pour itérer, à éviter en prod.)*
:::

:::lang en
**✅ Check:** the `plan` announces a new `nginx:1.26` image to **create** and the container to **replace** (`-/+ forces replacement`). Terraform handles the order itself: the image first, the container next — that's the dependency graph. *(`-auto-approve` skips confirmation — handy to iterate, avoid in prod.)*
:::

### step-06

:::lang fr
**Objectif.** Factoriser dans un **module** réutilisable.

**🤔 Pourquoi un module ?** Dès que tu répètes un schéma (« un conteneur web exposé »), un **module** l'encapsule : un dossier avec ses `variables`, ses `resource`, ses `outputs`. Tu l'appelles ensuite avec des paramètres différents, sans copier-coller. C'est l'unité de réutilisation de Terraform.

Crée `modules/webserver/main.tf` :
:::

:::lang en
**Goal.** Factor things into a reusable **module**.

**🤔 Why a module?** As soon as you repeat a pattern ("an exposed web container"), a **module** encapsulates it: a folder with its `variables`, `resource`s, and `outputs`. You then call it with different parameters, no copy-paste. It's Terraform's unit of reuse.

Create `modules/webserver/main.tf`:
:::

```hcl
# modules/webserver/main.tf
variable "name"          { type = string }
variable "external_port" { type = number }
variable "nginx_tag" {
  type    = string
  default = "1.27"
}

resource "docker_image" "nginx" {
  name = "nginx:${var.nginx_tag}"
}

resource "docker_container" "web" {
  name  = var.name
  image = docker_image.nginx.image_id
  ports {
    internal = 80
    external = var.external_port
  }
}

output "url" { value = "http://localhost:${var.external_port}" }
```

:::lang fr
**Remplace tout le contenu de `main.tf`** : garde uniquement le bloc `terraform`/`provider` (step-01), **supprime les deux `resource`** `docker_image`/`docker_container`, et ajoute les deux appels de `module` ci-dessous. *(Supprime aussi `variables.tf`, `outputs.tf` et `terraform.tfvars` de la racine : le module porte désormais ses propres variables et outputs.)*
:::

:::lang en
**Replace the entire contents of `main.tf`**: keep only the `terraform`/`provider` block (step-01), **delete the two `resource`s** `docker_image`/`docker_container`, and add the two `module` calls below. *(Also delete `variables.tf`, `outputs.tf` and `terraform.tfvars` from the root: the module now carries its own variables and outputs.)*
:::

```hcl
module "site_a" {
  source        = "./modules/webserver"
  name          = "tf-site-a"
  external_port = 8081
}

module "site_b" {
  source        = "./modules/webserver"
  name          = "tf-site-b"
  external_port = 8082
}
```

```bash
terraform init      # réindexe le nouveau module / re-index the new module
terraform apply -auto-approve
curl http://localhost:8081 && curl http://localhost:8082
```

:::lang fr
**✅ Vérification :** deux conteneurs (`tf-site-a`, `tf-site-b`) tournent, chacun sur son port, **depuis le même module** paramétré différemment. `terraform init` est nécessaire après l'ajout d'un module.
:::

:::lang en
**✅ Check:** two containers (`tf-site-a`, `tf-site-b`) run, each on its port, **from the same module** parameterized differently. `terraform init` is required after adding a module.
:::

### step-07

:::lang fr
**Objectif.** Tout détruire proprement, et connaître les commandes d'hygiène.

**🤔 Pourquoi `destroy` ?** Terraform gère le cycle de vie **complet**, création **et** suppression. `destroy` supprime tout ce qui est dans le state — indispensable pour ne pas laisser traîner de ressources (surtout en cloud, où ça coûte). `fmt` et `validate` sont tes réflexes qualité avant de committer.
:::

:::lang en
**Goal.** Tear everything down cleanly, and know the hygiene commands.

**🤔 Why `destroy`?** Terraform manages the **full** lifecycle, creation **and** deletion. `destroy` removes everything in the state — essential to avoid leaving stray resources (especially in cloud, where it costs). `fmt` and `validate` are your quality reflexes before committing.
:::

```bash
terraform fmt           # met en forme le HCL / formats the HCL
terraform validate      # vérifie la syntaxe / checks the syntax
terraform destroy       # supprime tout (tape "yes") / removes everything (type "yes")
docker ps               # plus aucun conteneur tf-* / no more tf-* container
```

:::lang fr
**✅ Vérification :** `destroy` annonce `Destroy complete! Resources: N destroyed`, et `docker ps` ne montre plus aucun conteneur `tf-*`. Le `terraform.tfstate` est maintenant vide de ressources.
:::

:::lang en
**✅ Check:** `destroy` announces `Destroy complete! Resources: N destroyed`, and `docker ps` no longer shows any `tf-*` container. The `terraform.tfstate` is now empty of resources.
:::

## pitfalls

:::lang fr
**1. Committer `terraform.tfstate` (surtout avec des secrets).** Le state peut contenir des valeurs sensibles en clair. Ajoute-le à `.gitignore`. En équipe, utilise un **backend distant** (S3, Terraform Cloud) avec verrouillage, jamais le state local partagé par mail.

**2. Éditer le state à la main.** Tu désynchronises Terraform du réel. Pour corriger, utilise les commandes dédiées (`terraform state mv/rm`, `import`), jamais un éditeur de texte.

**3. Appliquer sans lire le plan.** Un `-/+` (remplacement) peut détruire une base de données. **Lis toujours le plan** ; en prod, `-auto-approve` est à proscrire.

**4. Ne pas figer les versions.** Sans `version = "~> 3.0"` et sans committer `.terraform.lock.hcl`, une mise à jour du provider peut casser ton code en silence. Fige et commite le lock.

**5. Confondre Terraform et Ansible.** Terraform **crée/détruit** l'infra (le *quoi*). Ansible **configure l'intérieur** (installer, éditer). Ne demande pas à Terraform de faire du `apt install`.

**6. Mettre des secrets en dur dans le `.tf`.** Passe-les par des variables sensibles (`sensitive = true`), des variables d'environnement (`TF_VAR_...`) ou un gestionnaire de secrets — jamais en clair dans le code versionné.
:::

:::lang en
**1. Committing `terraform.tfstate` (especially with secrets).** State can hold sensitive values in clear text. Add it to `.gitignore`. On a team, use a **remote backend** (S3, Terraform Cloud) with locking, never the local state shared by email.

**2. Editing state by hand.** You desync Terraform from reality. To fix, use the dedicated commands (`terraform state mv/rm`, `import`), never a text editor.

**3. Applying without reading the plan.** A `-/+` (replacement) can destroy a database. **Always read the plan**; in prod, `-auto-approve` is to be banned.

**4. Not pinning versions.** Without `version = "~> 3.0"` and without committing `.terraform.lock.hcl`, a provider update can silently break your code. Pin and commit the lock.

**5. Confusing Terraform and Ansible.** Terraform **creates/destroys** infra (the *what*). Ansible **configures the inside** (install, edit). Don't ask Terraform to run `apt install`.

**6. Hardcoding secrets in the `.tf`.** Pass them via sensitive variables (`sensitive = true`), environment variables (`TF_VAR_...`), or a secrets manager — never in clear text in versioned code.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu expliques la différence entre **déclaratif** (Terraform) et impératif (un script).
- [ ] Le cycle `init` → `plan` → `apply` → `destroy` est un réflexe, et tu **lis toujours le plan**.
- [ ] Tu sais ce qu'est le **state** et pourquoi on n'y touche pas.
- [ ] Tu paramètres avec des **variables** et exposes avec des **outputs**.
- [ ] Tu repères dans un plan un **remplacement** (`-/+`) et tu comprends pourquoi.
- [ ] Tu factorises en **module** réutilisable.

Six cases cochées = tu décris et versionnes de l'infrastructure en code. Bravo.
:::

:::lang en
You know it works when…

- [ ] You can explain the difference between **declarative** (Terraform) and imperative (a script).
- [ ] The `init` → `plan` → `apply` → `destroy` cycle is a reflex, and you **always read the plan**.
- [ ] You know what **state** is and why you don't touch it.
- [ ] You parameterize with **variables** and expose with **outputs**.
- [ ] You spot a **replacement** (`-/+`) in a plan and understand why.
- [ ] You factor into a reusable **module**.

Six boxes ticked = you describe and version infrastructure as code. Well done.
:::

## next

:::lang fr
La suite logique :

1. **Traefik** — exposer proprement, en HTTPS, les services que tu provisionnes.
2. Plus loin : **Kubernetes** (orchestration), puis le **projet homelab** où Terraform provisionne un vrai serveur qu'Ansible configure — la combinaison gagnante.
:::

:::lang en
The logical next steps:

1. **Traefik** — cleanly expose, over HTTPS, the services you provision.
2. Further along: **Kubernetes** (orchestration), then the **homelab project** where Terraform provisions a real server that Ansible configures — the winning combo.
:::

## cheatsheet

:::lang fr
Aide-mémoire Terraform.
:::

:::lang en
Terraform cheat sheet.
:::

```bash
# Cycle de vie / Lifecycle
terraform init          # télécharge les providers / download providers
terraform plan          # montre le diff (toujours lire !) / show the diff (always read!)
terraform apply         # applique / apply
terraform destroy       # supprime tout / remove all
terraform apply -var="port=9090"      # passer une variable / pass a variable

# State
terraform state list    # ressources gérées / managed resources
terraform show          # état détaillé / detailed state
terraform output        # valeurs exposées / exposed outputs

# Qualité / Quality
terraform fmt           # met en forme / format
terraform validate      # vérifie la syntaxe / check syntax
```

```hcl
# Squelette / Skeleton
terraform {
  required_providers {
    docker = { source = "kreuzwerker/docker", version = "~> 3.0" }
  }
}
provider "docker" {}

resource "docker_container" "web" {
  name  = "web"
  image = docker_image.nginx.image_id      # référence = dépendance / reference = dependency
  ports {
    internal = 80
    external = var.port
  }
}
```

## resources

:::lang fr
- [Documentation Terraform](https://developer.hashicorp.com/terraform/docs) — la référence.
- [Provider Docker (registry)](https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs) — toutes les ressources `docker_*`.
- [Terraform Associate — préparation](https://developer.hashicorp.com/terraform/tutorials/certification-003) — la certification que ce module prépare.
- [Style HCL & bonnes pratiques](https://developer.hashicorp.com/terraform/language/style) — conventions officielles.
- **Pour compléter la prépa Associate** : `data` sources, `count`/`for_each`, fonctions et expressions, `import`, workspaces, et backends distants (S3, Terraform Cloud).
:::

:::lang en
- [Terraform documentation](https://developer.hashicorp.com/terraform/docs) — the reference.
- [Docker provider (registry)](https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs) — all the `docker_*` resources.
- [Terraform Associate — preparation](https://developer.hashicorp.com/terraform/tutorials/certification-003) — the certification this module prepares for.
- [HCL style & best practices](https://developer.hashicorp.com/terraform/language/style) — official conventions.
- **To round out the Associate prep**: `data` sources, `count`/`for_each`, functions and expressions, `import`, workspaces, and remote backends (S3, Terraform Cloud).
:::

## troubleshooting

:::lang fr
**`Error: Cannot connect to the Docker daemon`.** Docker n'est pas lancé, ou ton user n'a pas les droits. Vérifie `docker ps` (cf. guide Docker : groupe `docker`).

**`port is already allocated`.** Un autre service occupe déjà le port externe. Change la variable (`-var="external_port=9091"`) ou libère le port.

**`terraform apply` propose un remplacement inattendu.** Un attribut « force new » a changé (ex. l'image d'un conteneur). Lis le plan : la ligne `# forces replacement` t'indique lequel. C'est voulu, pas un bug.

**`Error: Inconsistent dependency lock file` après un changement.** Relance `terraform init` (voire `terraform init -upgrade`) pour resynchroniser le `.terraform.lock.hcl`.

**Le state semble faux / une ressource a été supprimée hors Terraform.** `terraform plan` te montrera qu'il veut la recréer (drift). Ne modifie pas le state à la main ; laisse Terraform réconcilier via `apply`.
:::

:::lang en
**`Error: Cannot connect to the Docker daemon`.** Docker isn't running, or your user lacks rights. Check `docker ps` (see the Docker guide: `docker` group).

**`port is already allocated`.** Another service already uses the external port. Change the variable (`-var="external_port=9091"`) or free the port.

**`terraform apply` proposes an unexpected replacement.** A "force new" attribute changed (e.g. a container's image). Read the plan: the `# forces replacement` line tells you which. It's intended, not a bug.

**`Error: Inconsistent dependency lock file` after a change.** Re-run `terraform init` (or `terraform init -upgrade`) to resync the `.terraform.lock.hcl`.

**The state seems wrong / a resource was deleted outside Terraform.** `terraform plan` will show it wants to recreate it (drift). Don't edit the state by hand; let Terraform reconcile via `apply`.
:::
