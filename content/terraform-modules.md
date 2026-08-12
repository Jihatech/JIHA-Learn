---
# — Identité (ne change JAMAIS une fois publié) —
id: terraform-modules
slug: terraform-modules
order: 11
status: published

# — Titres & accroches (bilingue) —
title_fr: "Terraform — modules & workflow d'équipe"
title_en: "Terraform — modules & team workflow"
tagline_fr: "Modules, workspaces, remote_state, Terraform Cloud."
tagline_en: "Modules, workspaces, remote_state, Terraform Cloud."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 140
repo: "hashicorp/terraform"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [terraform-composition]
next: [kubernetes-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [modules, inputs-outputs, module-versionne, composition, workspaces, remote-state, terraform-cloud]
concepts_en: [modules, inputs-outputs, versioned-module, composition, workspaces, remote-state, terraform-cloud]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Emballe ton infra en modules réutilisables, gère plusieurs environnements avec les workspaces, partage l'état entre configurations avec terraform_remote_state, et découvre Terraform Cloud. Le workflow d'équipe attendu par la certification Terraform Associate."
og_description_en: "Package your infra into reusable modules, manage multiple environments with workspaces, share state across configurations with terraform_remote_state, and discover Terraform Cloud. The team workflow the Terraform Associate certification expects."
---

## intro

:::lang fr
Jusqu'ici tu écrivais **un** `main.tf` que tu appliquais **toi**, sur **ta** machine. En entreprise, ce n'est jamais ça : plusieurs personnes, plusieurs environnements (dev/staging/prod), et du code qu'on **réutilise** au lieu de le copier d'un projet à l'autre.

Ce guide te fait passer du script solo au **workflow d'équipe**. Tu vas emballer ton infra dans un **module** réutilisable (avec ses entrées et sorties), t'en servir plusieurs fois, isoler des environnements avec les **workspaces**, faire dialoguer deux configurations via **`terraform_remote_state`**, et comprendre ce qu'apporte **Terraform Cloud**. C'est le dernier gros bloc du programme **Terraform Associate** — celui qui sépare « je sais écrire du HCL » de « je sais livrer de l'infra à plusieurs ».

On reste **sur ta machine** : le provider Docker fournit l'infra, et un backend local simule le travail partagé. Toutes les commandes tournent en local — Terraform Cloud est présenté conceptuellement, sans t'obliger à créer un compte.

**Pour qui c'est :** tu as les guides fondamentaux, state et composition, et tu veux structurer un vrai projet.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas encore `count`/`for_each` et les expressions → fais d'abord le guide composition.
- Tu ne sais pas ce qu'est le state distant → reviens au guide state avancé.
:::

:::lang en
Until now you wrote **one** `main.tf` that **you** applied, on **your** machine. In a company it's never that: several people, several environments (dev/staging/prod), and code you **reuse** instead of copying from project to project.

This guide takes you from the solo script to the **team workflow**. You'll package your infra into a reusable **module** (with its inputs and outputs), use it several times, isolate environments with **workspaces**, wire two configurations together via **`terraform_remote_state`**, and understand what **Terraform Cloud** brings. It's the last big chunk of the **Terraform Associate** program — the one that separates "I can write HCL" from "I can ship infra as a team".

We stay **on your machine**: the Docker provider supplies the infra, and a local backend simulates shared work. All commands run locally — Terraform Cloud is presented conceptually, without forcing you to create an account.

**Who it's for:** you have the fundamentals, state and composition guides, and you want to structure a real project.

**When it's NOT the right choice:**

- You don't have `count`/`for_each` and expressions yet → do the composition guide first.
- You don't know what remote state is → go back to the advanced state guide.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Comprendre ce qu'est un **module** (le module racine et les modules enfants).
- **Écrire** un module réutilisable avec ses **variables** (entrées) et ses **outputs** (sorties).
- **Consommer** un module local, puis un module **versionné** depuis le Registry.
- **Composer** des modules (en passer la sortie de l'un à l'entrée d'un autre).
- Isoler plusieurs environnements avec les **workspaces** (`terraform workspace`).
- Partager des données entre configurations avec **`terraform_remote_state`**.
- Situer **Terraform Cloud** : le bloc `cloud{}`, l'exécution distante, le free tier.
:::

:::lang en
By the end of this guide, you'll know how to:

- Understand what a **module** is (the root module and child modules).
- **Write** a reusable module with its **variables** (inputs) and **outputs**.
- **Consume** a local module, then a **versioned** module from the Registry.
- **Compose** modules (pass one's output into another's input).
- Isolate multiple environments with **workspaces** (`terraform workspace`).
- Share data across configurations with **`terraform_remote_state`**.
- Place **Terraform Cloud**: the `cloud{}` block, remote execution, the free tier.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides **fondamentaux**, **state avancé** et **composition** acquis.
- **Terraform** et **Docker** installés et fonctionnels.
- Un dossier de travail vierge :
:::

:::lang en
You should have:

- The **fundamentals**, **advanced state** and **composition** guides under your belt.
- **Terraform** and **Docker** installed and working.
- A blank working directory:
:::

```bash
mkdir tf-modules && cd tf-modules
```

## concepts

:::lang fr
**Un module, c'est juste un dossier de fichiers `.tf`.** Rien de magique. Le dossier où tu lances `terraform apply` est le **module racine** (*root module*). Dès que tu appelles un autre dossier avec un bloc `module "..."`, ce dossier devient un **module enfant** (*child module*). Un module a une **interface** : ses **variables** sont ses entrées, ses **outputs** ses sorties. Entre les deux, l'implémentation est une **boîte noire** pour l'appelant.

Pourquoi faire ? **Réutiliser** (le même « patron de service web » décliné dix fois), **standardiser** (tout le monde crée les ressources de la même façon) et **cacher la complexité** (l'appelant fournit trois variables, pas trente lignes de HCL).

Trois provenances pour la clé `source` d'un module :

- **local** : `source = "./modules/webservice"` — un dossier de ton dépôt ;
- **Registry** : `source = "terraform-aws-modules/vpc/aws"` + `version = "..."` — un module public versionné ;
- **Git** : `source = "git::https://..."` — un dépôt privé.

**Les workspaces** permettent d'avoir **plusieurs states** pour **un même code**. `default`, `dev`, `prod`… chacun a son fichier d'état isolé. `terraform.workspace` te donne le nom courant, pour faire varier le code (moins de ressources en dev, plus en prod).

**`terraform_remote_state`** est une **data source** qui **lit** le state d'une **autre** configuration. Le réseau expose l'ID d'un réseau en output ; l'appli le lit sans le recréer. C'est le fil qui relie des configurations séparées.

Enfin, **Terraform Cloud** (offre SaaS de HashiCorp, free tier généreux) héberge le state, verrouille, et **exécute les `plan`/`apply` à distance** — pour ne pas dépendre de la machine de chacun. On l'active avec un bloc `cloud{}` dans `terraform {}`.
:::

:::lang en
**A module is just a folder of `.tf` files.** Nothing magic. The folder where you run `terraform apply` is the **root module**. As soon as you call another folder with a `module "..."` block, that folder becomes a **child module**. A module has an **interface**: its **variables** are its inputs, its **outputs** its outputs. In between, the implementation is a **black box** to the caller.

Why bother? **Reuse** (the same "web service pattern" instantiated ten times), **standardize** (everyone creates resources the same way) and **hide complexity** (the caller provides three variables, not thirty lines of HCL).

Three origins for a module's `source` key:

- **local**: `source = "./modules/webservice"` — a folder in your repo;
- **Registry**: `source = "terraform-aws-modules/vpc/aws"` + `version = "..."` — a public, versioned module;
- **Git**: `source = "git::https://..."` — a private repo.

**Workspaces** let you have **several states** for **one codebase**. `default`, `dev`, `prod`… each has its own isolated state file. `terraform.workspace` gives you the current name, to vary the code (fewer resources in dev, more in prod).

**`terraform_remote_state`** is a **data source** that **reads** another configuration's state. The network exposes a network ID as an output; the app reads it without recreating it. It's the thread that links separate configurations.

Finally, **Terraform Cloud** (HashiCorp's SaaS offering, generous free tier) hosts the state, locks it, and **runs `plan`/`apply` remotely** — so you don't depend on each person's machine. You enable it with a `cloud{}` block inside `terraform {}`.
:::

:::figure terraform-module-interface
caption_fr: "Schéma 1. Un module = une boîte : variables en entrée, ressources cachées à l'intérieur, outputs en sortie. Le module racine appelle des modules enfants."
caption_en: "Figure 1. A module = a box: variables in, hidden resources inside, outputs out. The root module calls child modules."
:::

:::lang fr
On avance : écrire un module → l'appeler une fois → l'appeler N fois (`for_each`) → module versionné du Registry → workspaces → `terraform_remote_state` → Terraform Cloud (concept).
:::

:::lang en
We'll go: write a module → call it once → call it N times (`for_each`) → versioned Registry module → workspaces → `terraform_remote_state` → Terraform Cloud (concept).
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Écrire un **module local** : un « service web » réutilisable avec ses entrées et sorties.

**🤔 L'interface d'abord.** Un bon module se pense par son **interface** : qu'est-ce que l'appelant fournit (variables) et qu'est-ce qu'il récupère (outputs) ? Ici : entrée = un nom et un port ; sortie = le nom du conteneur créé.

Crée l'arborescence et le module :
:::

:::lang en
**Goal.** Write a **local module**: a reusable "web service" with its inputs and outputs.

**🤔 Interface first.** A good module is designed by its **interface**: what does the caller provide (variables) and what does it get back (outputs)? Here: input = a name and a port; output = the created container's name.

Create the tree and the module:
:::

```bash
mkdir -p modules/webservice
```

:::lang fr
Dans `modules/webservice/`, crée trois fichiers. `variables.tf` (les entrées) :
:::

:::lang en
In `modules/webservice/`, create three files. `variables.tf` (the inputs):
:::

```hcl
# modules/webservice/variables.tf
variable "name" {
  type        = string
  description = "Nom logique du service / Logical service name"
}

variable "external_port" {
  type        = number
  description = "Port exposé sur l'hôte / Host-exposed port"
}

variable "image" {
  type        = string
  default     = "nginx:1.27"
  description = "Image du conteneur / Container image"
}
```

:::lang fr
`main.tf` (l'implémentation — la boîte noire) :
:::

:::lang en
`main.tf` (the implementation — the black box):
:::

```hcl
# modules/webservice/main.tf
resource "docker_image" "this" {
  name = var.image
}

resource "docker_container" "this" {
  name  = var.name
  image = docker_image.this.image_id
  ports {
    internal = 80
    external = var.external_port
  }
}
```

:::lang fr
`outputs.tf` (les sorties) :
:::

:::lang en
`outputs.tf` (the outputs):
:::

```hcl
# modules/webservice/outputs.tf
output "container_name" {
  value = docker_container.this.name
}

output "external_port" {
  value = var.external_port
}
```

:::lang fr
**✅ Vérification :** tu as `modules/webservice/{variables,main,outputs}.tf`. Note qu'un module **ne déclare pas le provider `docker`** ni le bloc `terraform {}` : c'est le module racine qui les fournit et les passe à ses enfants. Un module enfant hérite des providers du root.
:::

:::lang en
**✅ Check:** you have `modules/webservice/{variables,main,outputs}.tf`. Note that a module **does not declare the `docker` provider** nor the `terraform {}` block: the root module provides them and passes them to its children. A child module inherits the root's providers.
:::

### step-02

:::lang fr
**Objectif.** **Appeler** le module depuis le module racine, une première fois.

Dans `tf-modules/` (à la racine, pas dans `modules/`), crée `main.tf` :
:::

:::lang en
**Goal.** **Call** the module from the root module, a first time.

In `tf-modules/` (at the root, not inside `modules/`), create `main.tf`:
:::

```hcl
# main.tf (module racine / root module)
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}
provider "docker" {}

module "blog" {
  source        = "./modules/webservice"
  name          = "blog"
  external_port = 8081
}

output "blog_name" {
  value = module.blog.container_name   # on lit l'output du module / read the module's output
}
```

```bash
terraform init      # télécharge le provider ET indexe le module local / fetches the provider AND indexes the local module
terraform apply -auto-approve
terraform output blog_name
```

:::lang fr
**✅ Vérification :** `terraform init` affiche `Initializing modules...` puis `- blog in modules/webservice`. Après `apply`, un conteneur `blog` tourne sur le port 8081, et `terraform output blog_name` renvoie `blog`. Regarde le state : `terraform state list` montre `module.blog.docker_container.this` — l'adresse est **préfixée par le module**.

**🤔 `init` après chaque changement de module.** Si tu ajoutes/modifies un bloc `module`, relance `terraform init` : Terraform doit ré-indexer les modules avant `plan`. Il te le rappelle avec `Module not installed`.
:::

:::lang en
**✅ Check:** `terraform init` prints `Initializing modules...` then `- blog in modules/webservice`. After `apply`, a `blog` container runs on port 8081, and `terraform output blog_name` returns `blog`. Look at state: `terraform state list` shows `module.blog.docker_container.this` — the address is **prefixed by the module**.

**🤔 `init` after every module change.** If you add/modify a `module` block, re-run `terraform init`: Terraform must re-index modules before `plan`. It reminds you with `Module not installed`.
:::

### step-03

:::lang fr
**Objectif.** Prouver la réutilisation : **décliner** le module plusieurs fois avec **`for_each`**.

C'est ici que le module paie. Remplace le bloc `module "blog"` par un appel `for_each` piloté par une map :
:::

:::lang en
**Goal.** Prove reuse: **instantiate** the module several times with **`for_each`**.

This is where the module pays off. Replace the `module "blog"` block with a `for_each` call driven by a map:
:::

```hcl
variable "services" {
  type = map(number)   # nom => port / name => port
  default = {
    blog  = 8081
    shop  = 8082
    admin = 8083
  }
}

module "web" {
  source        = "./modules/webservice"
  for_each      = var.services
  name          = each.key
  external_port = each.value
}

output "web_names" {
  value = { for k, m in module.web : k => m.container_name }
}
```

:::lang fr
Supprime aussi l'ancien `output "blog_name"` (le module `blog` n'existe plus).
:::

:::lang en
Also remove the old `output "blog_name"` (the `blog` module no longer exists).
:::

```bash
terraform init      # ré-indexe / re-index
terraform apply -auto-approve
terraform output web_names
terraform state list | grep module.web
```

:::lang fr
**✅ Vérification :** trois conteneurs `blog`, `shop`, `admin` tournent (8081-8083). `terraform output web_names` renvoie une map `{blog = "blog", shop = "shop", admin = "admin"}`. Dans le state, chaque instance est nommée par clé : `module.web["blog"].docker_container.this`. **Un module + une map = N services standardisés.** C'est exactement le pattern d'entreprise : un module « service », décliné par environnement ou par équipe.

*(Le conteneur `blog` du step-02 a été supprimé puis recréé comme `module.web["blog"]` : l'adresse a changé. En vrai projet, un `terraform state mv` éviterait le destroy/create — cf. guide state.)*
:::

:::lang en
**✅ Check:** three containers `blog`, `shop`, `admin` run (8081-8083). `terraform output web_names` returns a map `{blog = "blog", shop = "shop", admin = "admin"}`. In state, each instance is named by key: `module.web["blog"].docker_container.this`. **One module + one map = N standardized services.** This is exactly the enterprise pattern: a "service" module, instantiated per environment or per team.

*(The `blog` container from step-02 was destroyed then recreated as `module.web["blog"]`: the address changed. In a real project, a `terraform state mv` would avoid the destroy/create — see the state guide.)*
:::

### step-04

:::lang fr
**Objectif.** Comprendre un **module versionné** du Terraform Registry — et pourquoi `version` est obligatoire.

Tu ne réinventes pas un VPC AWS ou un réseau : le **Registry** publie des milliers de modules maintenus. On ne les applique pas ici (ils exigent un provider cloud), mais tu dois **savoir les lire**. La syntaxe d'appel typique :
:::

:::lang en
**Goal.** Understand a **versioned module** from the Terraform Registry — and why `version` is mandatory.

You don't reinvent an AWS VPC or a network: the **Registry** publishes thousands of maintained modules. We won't apply them here (they need a cloud provider), but you must **know how to read them**. The typical call syntax:
:::

```hcl
# Exemple (Registry) — NE PAS appliquer sans compte AWS
# Example (Registry) — do NOT apply without an AWS account
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"           # obligatoire pour un module Registry / mandatory for a Registry module

  name = "prod-vpc"
  cidr = "10.0.0.0/16"
}
```

:::lang fr
**🤔 Pourquoi épingler `version` ?** Un module local suit ton dépôt. Un module Registry évolue **indépendamment** : sans `version`, un `init` demain pourrait tirer une v6 avec des changements cassants. `~> 5.0` autorise les correctifs `5.x` mais bloque `6.0`. C'est la même logique que pour les providers.

Le format `source` d'un module Registry est **`<NAMESPACE>/<NOM>/<PROVIDER>`** (ici `terraform-aws-modules` / `vpc` / `aws`). `terraform init` le télécharge dans `.terraform/modules/`.
:::

:::lang en
**🤔 Why pin `version`?** A local module follows your repo. A Registry module evolves **independently**: without `version`, an `init` tomorrow could pull a v6 with breaking changes. `~> 5.0` allows `5.x` patches but blocks `6.0`. Same logic as providers.

A Registry module's `source` format is **`<NAMESPACE>/<NAME>/<PROVIDER>`** (here `terraform-aws-modules` / `vpc` / `aws`). `terraform init` downloads it into `.terraform/modules/`.
:::

```bash
# À l'examen Associate, sache retrouver un module et sa doc :
# For the Associate exam, know how to find a module and its docs:
#   registry.terraform.io -> Browse Modules -> onglet "Inputs"/"Outputs"
```

:::lang fr
**✅ Vérification :** tu sais expliquer les trois provenances de `source` (local, Registry, Git), pourquoi `version` est requis pour un module distant, et lire la liste **Inputs/Outputs** d'un module sur le Registry. *(On ne modifie pas ton projet à cette étape : c'est de la lecture.)*
:::

:::lang en
**✅ Check:** you can explain the three `source` origins (local, Registry, Git), why `version` is required for a remote module, and read a module's **Inputs/Outputs** list on the Registry. *(We don't change your project at this step: it's reading.)*
:::

### step-05

:::lang fr
**Objectif.** Isoler **dev** et **prod** avec les **workspaces**, sans dupliquer le code.

**🤔 Le problème.** Tu veux le même code pour deux environnements, mais **deux states séparés** (appliquer prod ne doit pas toucher dev). Sans workspace, tu copierais le dossier. Les **workspaces** te donnent plusieurs states pour **un** code.

D'abord, rends le code sensible à l'environnement via `terraform.workspace` :
:::

:::lang en
**Goal.** Isolate **dev** and **prod** with **workspaces**, without duplicating code.

**🤔 The problem.** You want the same code for two environments, but **two separate states** (applying prod must not touch dev). Without workspaces, you'd copy the folder. **Workspaces** give you multiple states for **one** codebase.

First, make the code environment-aware via `terraform.workspace`:
:::

```hcl
locals {
  # En prod : les 3 services. Ailleurs : seulement le blog.
  # In prod: all 3 services. Elsewhere: only the blog.
  active_services = terraform.workspace == "prod" ? var.services : { blog = 8081 }
}

module "web" {
  source        = "./modules/webservice"
  for_each      = local.active_services   # <- remplace var.services par local.active_services
  name          = "${each.key}-${terraform.workspace}"
  external_port = each.value
}
```

:::lang fr
Puis crée et bascule entre workspaces :
:::

:::lang en
Then create and switch between workspaces:
:::

```bash
terraform workspace list                 # * default
terraform workspace new dev              # crée et bascule sur dev / create and switch to dev
terraform apply -auto-approve            # 1 conteneur : blog-dev
terraform state list

terraform workspace new prod             # crée et bascule sur prod / create and switch to prod
terraform apply -auto-approve            # 3 conteneurs : blog-prod, shop-prod, admin-prod
terraform workspace list                 #   default / dev / * prod
```

:::lang fr
**✅ Vérification :** `terraform workspace list` montre `default`, `dev`, `prod` avec `*` sur le courant. En `dev`, un seul conteneur `blog-dev` ; en `prod`, trois conteneurs `-prod`. Les deux environnements **coexistent** sans conflit. Avec un backend local, les states vivent dans `terraform.tfstate.d/<workspace>/` — jette un œil.

**⚠️ Limite des workspaces.** Ils partagent **le même backend et le même code**. Pour des différences **fortes** entre environnements (comptes cloud distincts, régions, permissions), l'industrie préfère souvent des **dossiers séparés** (`envs/dev`, `envs/prod`) réutilisant les mêmes **modules**. Les workspaces brillent pour des variantes **légères**. Sache citer cette nuance — elle tombe à l'examen.
:::

:::lang en
**✅ Check:** `terraform workspace list` shows `default`, `dev`, `prod` with `*` on the current one. In `dev`, a single `blog-dev` container; in `prod`, three `-prod` containers. Both environments **coexist** without conflict. With a local backend, states live in `terraform.tfstate.d/<workspace>/` — take a look.

**⚠️ Workspace limitation.** They share **the same backend and the same code**. For **strong** differences between environments (distinct cloud accounts, regions, permissions), the industry often prefers **separate folders** (`envs/dev`, `envs/prod`) reusing the same **modules**. Workspaces shine for **light** variants. Know how to state this nuance — it comes up on the exam.
:::

### step-06

:::lang fr
**Objectif.** Faire lire le state d'une configuration par une **autre** avec **`terraform_remote_state`**.

**🤔 Le scénario d'équipe.** L'équipe « plateforme » gère un réseau ; l'équipe « appli » y branche ses conteneurs. Deux configurations, deux states — mais l'appli doit connaître **l'ID du réseau** créé par la plateforme. Elle le **lit** via `terraform_remote_state`, elle ne le recrée pas.

Reviens sur `default` et fabrique la config « plateforme » dans un sous-dossier :
:::

:::lang en
**Goal.** Have one configuration read another's state with **`terraform_remote_state`**.

**🤔 The team scenario.** The "platform" team manages a network; the "app" team plugs its containers into it. Two configurations, two states — but the app must know the **network ID** created by the platform. It **reads** it via `terraform_remote_state`, it doesn't recreate it.

Switch back to `default` and build the "platform" config in a subfolder:
:::

```bash
terraform workspace select default
mkdir -p ../tf-network && cd ../tf-network
```

```hcl
# ../tf-network/main.tf  (config "plateforme" / "platform" config)
terraform {
  required_providers {
    docker = { source = "kreuzwerker/docker", version = "~> 3.0" }
  }
}
provider "docker" {}

resource "docker_network" "shared" {
  name = "app-shared-net"
}

output "network_name" {
  value = docker_network.shared.name
}
```

```bash
terraform init && terraform apply -auto-approve
```

:::lang fr
Maintenant, côté « appli » (retour dans `tf-modules`), déclare la data source qui lit le state de la plateforme, et branche les conteneurs sur ce réseau. Ajoute à `tf-modules/main.tf` :
:::

:::lang en
Now, on the "app" side (back in `tf-modules`), declare the data source that reads the platform's state, and attach the containers to that network. Add to `tf-modules/main.tf`:
:::

```hcl
data "terraform_remote_state" "network" {
  backend = "local"
  config = {
    path = "../tf-network/terraform.tfstate"   # le state de l'autre config / the other config's state
  }
}
```

:::lang fr
Puis passe le nom du réseau au module (ajoute une variable `network` au module `webservice`, et un bloc `networks_advanced` dans son conteneur). Dans `modules/webservice/variables.tf` :
:::

:::lang en
Then pass the network name to the module (add a `network` variable to the `webservice` module, and a `networks_advanced` block in its container). In `modules/webservice/variables.tf`:
:::

```hcl
variable "network" {
  type        = string
  default     = ""
  description = "Réseau Docker à rejoindre / Docker network to join"
}
```

:::lang fr
Dans `modules/webservice/main.tf`, ajoute à la ressource `docker_container.this` :
:::

:::lang en
In `modules/webservice/main.tf`, add to the `docker_container.this` resource:
:::

```hcl
  networks_advanced {
    name = var.network
  }
```

:::lang fr
Et dans l'appel `module "web"` (racine), passe la valeur **lue à distance** :
:::

:::lang en
And in the `module "web"` call (root), pass the **remotely read** value:
:::

```hcl
  network = data.terraform_remote_state.network.outputs.network_name
```

```bash
terraform init      # enregistre la nouvelle data source & la variable / registers the new data source & variable
terraform apply -auto-approve
docker network inspect app-shared-net --format '{{range .Containers}}{{.Name}} {{end}}'
```

:::lang fr
**✅ Vérification :** `docker network inspect` liste tes conteneurs `blog`/`shop`/`admin` **attachés** au réseau `app-shared-net` que **l'autre** configuration a créé. Tu n'as jamais recréé le réseau ; tu as lu son output via `data.terraform_remote_state.network.outputs.network_name`. **C'est le contrat entre équipes** : la plateforme **expose** des outputs, l'appli les **consomme**. Règle d'or : n'expose en output que ce que d'autres doivent lire.
:::

:::lang en
**✅ Check:** `docker network inspect` lists your `blog`/`shop`/`admin` containers **attached** to the `app-shared-net` network that the **other** configuration created. You never recreated the network; you read its output via `data.terraform_remote_state.network.outputs.network_name`. **This is the contract between teams**: the platform **exposes** outputs, the app **consumes** them. Golden rule: only expose as outputs what others must read.
:::

### step-07

:::lang fr
**Objectif.** Situer **Terraform Cloud / HCP Terraform** : ce que change le bloc `cloud{}` (concept, sans compte).

**🤔 Pourquoi un backend distant géré ?** Avec un state local, un seul opérateur travaille à la fois, et le state (qui contient des secrets) traîne sur les machines. En équipe, on veut : state **hébergé et chiffré**, **verrouillage** automatique, **historique**, et souvent **exécution distante** (les `plan`/`apply` tournent chez HashiCorp, pas sur ton poste). C'est l'offre **HCP Terraform** (ex-« Terraform Cloud »), gratuite jusqu'à un quota confortable.

On l'active en remplaçant le backend par un bloc `cloud{}` dans `terraform {}` :
:::

:::lang en
**Goal.** Place **Terraform Cloud / HCP Terraform**: what the `cloud{}` block changes (concept, no account).

**🤔 Why a managed remote backend?** With local state, only one operator works at a time, and the state (which holds secrets) sits on machines. As a team, you want: **hosted, encrypted** state, automatic **locking**, **history**, and often **remote execution** (`plan`/`apply` run at HashiCorp, not on your box). That's the **HCP Terraform** offering (formerly "Terraform Cloud"), free up to a comfortable quota.

You enable it by replacing the backend with a `cloud{}` block in `terraform {}`:
:::

```hcl
# Exemple conceptuel — nécessite un compte HCP Terraform (free tier)
# Conceptual example — requires an HCP Terraform account (free tier)
terraform {
  cloud {
    organization = "mon-org"
    workspaces {
      name = "tf-modules-prod"
    }
  }
  required_providers {
    docker = { source = "kreuzwerker/docker", version = "~> 3.0" }
  }
}
```

```bash
# Le workflow devient :
# The workflow becomes:
terraform login     # s'authentifie auprès de HCP / authenticate to HCP
terraform init      # migre le state local -> HCP / migrate local state -> HCP
terraform apply     # l'exécution tourne à distance, visible dans l'UI / runs remotely, visible in the UI
```

:::lang fr
**Points d'examen à retenir :**

- Le bloc `cloud{}` **remplace** un bloc `backend "..."` (on ne met pas les deux).
- Les **workspaces HCP** ne sont **pas** les workspaces CLI du step-05 : ce sont des unités d'exécution distantes, chacune avec son state et ses variables.
- Les **variables** (dont les secrets) se définissent dans l'UI/API HCP, marquées *sensitive*, au lieu de traîner en clair.
- Free tier : suffisant pour apprendre et pour de petites équipes.

**✅ Vérification :** tu sais expliquer ce qu'apporte HCP Terraform (state géré + verrou + exécution distante + variables sécurisées), où se déclare le bloc `cloud{}`, et la différence entre workspace **CLI** et workspace **HCP**. *(On ne migre pas ton projet : ça demanderait un compte. Ton state reste local pour la suite.)*
:::

:::lang en
**Exam points to remember:**

- The `cloud{}` block **replaces** a `backend "..."` block (never both).
- **HCP workspaces** are **not** the CLI workspaces from step-05: they're remote execution units, each with its own state and variables.
- **Variables** (including secrets) are defined in the HCP UI/API, marked *sensitive*, instead of sitting in cleartext.
- Free tier: enough to learn and for small teams.

**✅ Check:** you can explain what HCP Terraform brings (managed state + lock + remote execution + secured variables), where the `cloud{}` block is declared, and the difference between a **CLI** workspace and an **HCP** workspace. *(We don't migrate your project: that would need an account. Your state stays local for what follows.)*
:::

### step-08

:::lang fr
**Objectif.** Nettoyer proprement — les deux configurations et les workspaces.

**🤔 Détruire dans le bon ordre.** L'appli **dépend** du réseau (elle s'y attache). On détruit donc l'appli **avant** le réseau, sinon le réseau est encore utilisé. Et chaque **workspace** a son propre state : on détruit dans chacun.
:::

:::lang en
**Goal.** Tear down cleanly — both configurations and the workspaces.

**🤔 Destroy in the right order.** The app **depends** on the network (it attaches to it). So destroy the app **before** the network, otherwise the network is still in use. And each **workspace** has its own state: destroy in each one.
:::

```bash
# Côté appli, pour chaque workspace / app side, per workspace
cd ../tf-modules
terraform workspace select prod && terraform destroy -auto-approve
terraform workspace select dev  && terraform destroy -auto-approve
terraform workspace select default && terraform destroy -auto-approve

# Puis le réseau / then the network
cd ../tf-network && terraform destroy -auto-approve
```

:::lang fr
**✅ Vérification :** `docker ps -a` ne liste plus tes conteneurs de service, et `docker network ls | grep app-shared-net` ne renvoie rien. `terraform workspace list` montre encore `dev`/`prod` (les workspaces vides subsistent ; supprime-les si tu veux avec `terraform workspace delete dev` depuis un autre workspace). Détruire **par environnement** est le réflexe : un `destroy` n'agit que sur le **state courant**.
:::

:::lang en
**✅ Check:** `docker ps -a` no longer lists your service containers, and `docker network ls | grep app-shared-net` returns nothing. `terraform workspace list` still shows `dev`/`prod` (empty workspaces remain; delete them if you want with `terraform workspace delete dev` from another workspace). Destroying **per environment** is the reflex: a `destroy` only acts on the **current state**.
:::

## pitfalls

:::lang fr
**1. Oublier `terraform init` après un changement de module.** Ajout/modif d'un bloc `module` ou d'un `source` → `Module not installed`. Relance `init`.

**2. Ne pas épingler `version` sur un module Registry/Git.** Sans épinglage, une mise à jour amont casse ton `apply` sans prévenir. Toujours `version = "~> x.y"`.

**3. Confondre workspace CLI et workspace HCP.** Le premier = plusieurs states locaux pour un code ; le second = unité d'exécution distante. Deux concepts, même mot.

**4. Croire que les workspaces isolent des comptes cloud.** Ils partagent backend et code. Pour des environnements vraiment cloisonnés (comptes/régions distincts), préfère des dossiers séparés + modules partagés.

**5. Chemin `terraform_remote_state` fragile.** Un `path` relatif casse si on déplace un dossier. En vrai, on lit un backend **distant** (S3, HCP), pas un fichier local ; le local ne sert qu'à apprendre.

**6. Tout exposer en output « au cas où ».** Les outputs d'un module/config sont son **contrat public**. N'expose que le nécessaire — un output de trop, et une autre équipe s'y accroche.

**7. Déclarer un provider dans un module enfant.** Le module enfant hérite des providers du root. Redéclarer `provider "docker" {}` dans l'enfant crée des conflits. Le root configure, l'enfant consomme.
:::

:::lang en
**1. Forgetting `terraform init` after a module change.** Adding/editing a `module` block or a `source` → `Module not installed`. Re-run `init`.

**2. Not pinning `version` on a Registry/Git module.** Without pinning, an upstream update breaks your `apply` unannounced. Always `version = "~> x.y"`.

**3. Confusing CLI workspace and HCP workspace.** The first = several local states for one codebase; the second = a remote execution unit. Two concepts, same word.

**4. Believing workspaces isolate cloud accounts.** They share backend and code. For truly partitioned environments (distinct accounts/regions), prefer separate folders + shared modules.

**5. Fragile `terraform_remote_state` path.** A relative `path` breaks if you move a folder. In reality you read a **remote** backend (S3, HCP), not a local file; local is only for learning.

**6. Exposing everything as output "just in case".** A module/config's outputs are its **public contract**. Expose only what's needed — one output too many, and another team latches onto it.

**7. Declaring a provider in a child module.** The child inherits the root's providers. Redeclaring `provider "docker" {}` in the child creates conflicts. The root configures, the child consumes.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu écris un module avec `variables.tf` (entrées) et `outputs.tf` (sorties), sans bloc provider.
- [ ] Tu appelles un module local, puis le déclines N fois avec `for_each`.
- [ ] Tu lis la doc **Inputs/Outputs** d'un module Registry et tu épingles sa `version`.
- [ ] Tu crées `dev`/`prod` avec `terraform workspace` et fais varier le code via `terraform.workspace`.
- [ ] Tu relies deux configurations avec `terraform_remote_state` (une expose, l'autre consomme).
- [ ] Tu expliques ce qu'apporte HCP Terraform et où va le bloc `cloud{}`.

Six cases cochées = tu livres de l'infra en équipe, au niveau attendu par l'Associate.
:::

:::lang en
You know it works when…

- [ ] You write a module with `variables.tf` (inputs) and `outputs.tf` (outputs), no provider block.
- [ ] You call a local module, then instantiate it N times with `for_each`.
- [ ] You read a Registry module's **Inputs/Outputs** docs and pin its `version`.
- [ ] You create `dev`/`prod` with `terraform workspace` and vary code via `terraform.workspace`.
- [ ] You link two configurations with `terraform_remote_state` (one exposes, one consumes).
- [ ] You explain what HCP Terraform brings and where the `cloud{}` block goes.

Six boxes ticked = you ship infra as a team, at the level the Associate expects.
:::

## next

:::lang fr
Tu as bouclé la **couverture de contenu** de la track Terraform → Associate. Il te reste, pour valider et prouver la compétence :

1. **QCM + examen blanc Associate** — pour mesurer, sous format d'examen, ce que tu viens d'apprendre (state, composition, modules, workflow).
2. **Projet d'entreprise** — provisionner une infrastructure **multi-environnement** (dev/staging/prod) avec modules, workspaces et state distant : le livrable à mettre sur ton CV et à présenter en entretien.
:::

:::lang en
You've completed the **content coverage** of the Terraform → Associate track. What remains, to validate and prove the skill:

1. **Quiz + Associate mock exam** — to measure, in exam format, what you just learned (state, composition, modules, workflow).
2. **Enterprise project** — provision a **multi-environment** infrastructure (dev/staging/prod) with modules, workspaces and remote state: the deliverable for your CV and to present in interviews.
:::

## cheatsheet

:::lang fr
Aide-mémoire modules & workflow d'équipe.
:::

:::lang en
Modules & team workflow cheat sheet.
:::

```hcl
# Appeler un module / call a module
module "web" {
  source        = "./modules/webservice"   # local / Registry / git::https://...
  version       = "~> 1.0"                  # requis pour Registry & Git / required for Registry & Git
  for_each      = var.services              # décliner N fois / instantiate N times
  name          = each.key
}
# Lire sa sortie / read its output :  module.web["blog"].container_name

# Sortie d'un module / a module's output
output "x" { value = docker_container.this.name }

# Lire le state d'une autre config / read another config's state
data "terraform_remote_state" "net" {
  backend = "local"                         # ou s3 / remote / cloud
  config  = { path = "../tf-network/terraform.tfstate" }
}
# Usage : data.terraform_remote_state.net.outputs.network_name

# HCP Terraform (remplace backend "..." / replaces backend "...")
terraform {
  cloud {
    organization = "mon-org"
    workspaces { name = "prod" }
  }
}
```

```bash
# Workspaces (plusieurs states, un code / multiple states, one codebase)
terraform workspace list
terraform workspace new dev
terraform workspace select prod
terraform workspace delete dev
# Dans le code : terraform.workspace  -> "dev" | "prod" | ...

terraform init      # après TOUT changement de module / after ANY module change
terraform login     # s'authentifier à HCP / authenticate to HCP
```

## resources

:::lang fr
- [Modules — vue d'ensemble](https://developer.hashicorp.com/terraform/language/modules) et [développer un module](https://developer.hashicorp.com/terraform/language/modules/develop).
- [Sources d'un module](https://developer.hashicorp.com/terraform/language/modules/sources) — local, Registry, Git.
- [Terraform Registry](https://registry.terraform.io/browse/modules) — modules publics versionnés.
- [Workspaces (CLI)](https://developer.hashicorp.com/terraform/language/state/workspaces) et data source [`terraform_remote_state`](https://developer.hashicorp.com/terraform/language/state/remote-state-data).
- [HCP Terraform](https://developer.hashicorp.com/terraform/cloud-docs) — le bloc `cloud{}` et l'exécution distante.
:::

:::lang en
- [Modules — overview](https://developer.hashicorp.com/terraform/language/modules) and [develop a module](https://developer.hashicorp.com/terraform/language/modules/develop).
- [Module sources](https://developer.hashicorp.com/terraform/language/modules/sources) — local, Registry, Git.
- [Terraform Registry](https://registry.terraform.io/browse/modules) — public, versioned modules.
- [Workspaces (CLI)](https://developer.hashicorp.com/terraform/language/state/workspaces) and the [`terraform_remote_state`](https://developer.hashicorp.com/terraform/language/state/remote-state-data) data source.
- [HCP Terraform](https://developer.hashicorp.com/terraform/cloud-docs) — the `cloud{}` block and remote execution.
:::

## troubleshooting

:::lang fr
**`Error: Module not installed` (ou `Module not found`).** Tu as ajouté/modifié un bloc `module` sans relancer `init`. Fais `terraform init`.

**`Error: Unsupported argument` sur un appel de module.** Tu passes une variable que le module ne déclare pas (faute de frappe, ou variable absente de son `variables.tf`). Vérifie l'interface du module.

**`Error: Missing required argument` sur un appel de module.** Le module a une variable **sans `default`** que tu n'as pas fournie. Ajoute-la à l'appel, ou donne-lui un `default` dans le module.

**`terraform_remote_state` renvoie `outputs is empty` / clé absente.** L'autre config n'a pas (encore) appliqué, ou n'expose pas cet output. Applique la config source, et vérifie qu'elle a bien un bloc `output "..."`.

**Après un `for_each` sur un module, tout est détruit/recréé.** Tu es passé d'un appel simple à `for_each` : l'adresse change (`module.blog` → `module.web["blog"]`). Utilise `terraform state mv` pour aligner sans destroy (cf. guide state).

**`terraform workspace delete` refuse.** Le workspace n'est pas vide (state non détruit) ou c'est le workspace courant. Fais `destroy` dedans, bascule ailleurs (`select default`), puis supprime.
:::

:::lang en
**`Error: Module not installed` (or `Module not found`).** You added/modified a `module` block without re-running `init`. Run `terraform init`.

**`Error: Unsupported argument` on a module call.** You're passing a variable the module doesn't declare (typo, or variable missing from its `variables.tf`). Check the module's interface.

**`Error: Missing required argument` on a module call.** The module has a variable **with no `default`** that you didn't provide. Add it to the call, or give it a `default` in the module.

**`terraform_remote_state` returns `outputs is empty` / missing key.** The other config hasn't applied (yet), or doesn't expose that output. Apply the source config, and check it has an `output "..."` block.

**After a `for_each` on a module, everything is destroyed/recreated.** You went from a simple call to `for_each`: the address changes (`module.blog` → `module.web["blog"]`). Use `terraform state mv` to align without a destroy (see the state guide).

**`terraform workspace delete` refuses.** The workspace isn't empty (state not destroyed) or it's the current workspace. Run `destroy` in it, switch elsewhere (`select default`), then delete.
:::
