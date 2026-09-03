---
# — Identité (ne change JAMAIS une fois publié) —
id: terraform-projet-entreprise
slug: terraform-projet-entreprise
order: 12
status: published

# — Titres & accroches (bilingue) —
title_fr: "Terraform — projet d'entreprise : plateforme multi-environnement"
title_en: "Terraform — enterprise project: multi-environment platform"
tagline_fr: "Modules, dev/staging/prod, remote state — un livrable de CV."
tagline_en: "Modules, dev/staging/prod, remote state — a CV deliverable."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 300
repo: "hashicorp/terraform"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [terraform-modules]
next: [kubernetes-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [architecture-multi-env, bibliotheque-modules, isolation-state, remote-state, tfvars-par-env, documentation, livrable-portfolio]
concepts_en: [multi-env-architecture, module-library, state-isolation, remote-state, per-env-tfvars, documentation, portfolio-deliverable]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet fil-rouge Terraform : conçois une bibliothèque de modules, provisionne une plateforme partagée et trois environnements isolés (dev/staging/prod) reliés par remote state, puis documente le tout. Un livrable d'infrastructure-as-code à présenter sur ton CV, entièrement en local."
og_description_en: "The Terraform capstone project: design a module library, provision a shared platform and three isolated environments (dev/staging/prod) wired by remote state, then document it all. An infrastructure-as-code deliverable for your CV, entirely local."
---

## intro

:::lang fr
Tu as appris les briques : HCL, state, `count`/`for_each`, modules, workspaces, remote state. **Un recruteur ne veut pas voir des briques — il veut voir un mur.** Ce projet est ce mur : une **plateforme d'infrastructure multi-environnement**, structurée comme dans une vraie boîte, que tu construis de A à Z et que tu mets sur ton CV et ton GitHub.

**Le scénario.** Tu es l'ingénieur DevOps d'une PME e-commerce, *Brownfield Market*. On te demande de rendre l'infrastructure **reproductible et isolée par environnement** : une équipe doit pouvoir monter un `dev`, valider en `staging`, et livrer en `prod` — **le même code**, des paramètres différents, **des states séparés** (une erreur en dev ne doit jamais toucher prod). Tu vas livrer :

- une **bibliothèque de modules** réutilisables (`network`, `service`, `stack`) ;
- une **couche plateforme** partagée (un réseau commun), dont les autres configs lisent la sortie via **remote state** ;
- **trois environnements** `dev` / `staging` / `prod`, isolés, qui diffèrent uniquement par leurs variables ;
- un **README** et un **schéma d'architecture** qui expliquent tes choix — la partie que les recruteurs lisent en premier.

**Tout tourne en local**, via le provider Docker : des conteneurs jouent le rôle des services (frontend, API, base de données, reverse proxy). Aucun compte cloud, aucune carte bancaire — mais l'**architecture est exactement celle d'un vrai déploiement cloud**. Le jour où tu remplaces le provider `docker` par `aws`/`azurerm`/`google`, la structure ne bouge pas.

**Ce que ce projet prouve à un recruteur :** que tu sais **structurer** de l'IaC (pas juste écrire un `main.tf`), **isoler** des environnements, **faire dialoguer** des configurations, et **documenter** une décision d'architecture. C'est précisément ce qu'on attend d'un DevOps junior.
:::

:::lang en
You've learned the bricks: HCL, state, `count`/`for_each`, modules, workspaces, remote state. **A recruiter doesn't want to see bricks — they want to see a wall.** This project is that wall: a **multi-environment infrastructure platform**, structured like a real company's, that you build end to end and put on your CV and GitHub.

**The scenario.** You're the DevOps engineer at an e-commerce SME, *Brownfield Market*. You're asked to make the infrastructure **reproducible and isolated per environment**: a team must be able to spin up `dev`, validate in `staging`, and ship to `prod` — **the same code**, different parameters, **separate states** (a mistake in dev must never touch prod). You'll deliver:

- a **library of reusable modules** (`network`, `service`, `stack`);
- a shared **platform layer** (a common network), whose output other configs read via **remote state**;
- **three environments** `dev` / `staging` / `prod`, isolated, differing only by their variables;
- a **README** and an **architecture diagram** explaining your choices — the part recruiters read first.

**Everything runs locally**, via the Docker provider: containers play the roles of services (frontend, API, database, reverse proxy). No cloud account, no credit card — but the **architecture is exactly that of a real cloud deployment**. The day you swap the `docker` provider for `aws`/`azurerm`/`google`, the structure doesn't move.

**What this project proves to a recruiter:** that you can **structure** IaC (not just write a `main.tf`), **isolate** environments, **wire** configurations together, and **document** an architecture decision. That's precisely what's expected of a junior DevOps.
:::

## objectives

:::lang fr
À la fin de ce projet, tu auras produit et su expliquer :

- Une **bibliothèque de modules** (`network`, `service`, `stack`) avec des interfaces propres.
- Une **couche plateforme** qui expose des ressources partagées via des **outputs**.
- **Trois environnements** isolés, un dossier par env, réutilisant les mêmes modules.
- Le **câblage remote state** : chaque env lit la sortie de la plateforme sans la recréer.
- Des **`terraform.tfvars` par environnement** qui portent toute la différence dev/staging/prod.
- Un **README** et un **schéma** de niveau professionnel.
- Une **démo reproductible** : `plan` des trois envs, `apply` de prod, vérification, `destroy`.
:::

:::lang en
By the end of this project, you'll have produced and be able to explain:

- A **module library** (`network`, `service`, `stack`) with clean interfaces.
- A **platform layer** exposing shared resources via **outputs**.
- **Three isolated environments**, one folder per env, reusing the same modules.
- The **remote state wiring**: each env reads the platform's output without recreating it.
- **Per-environment `terraform.tfvars`** carrying the whole dev/staging/prod difference.
- A professional-grade **README** and **diagram**.
- A **reproducible demo**: `plan` all three envs, `apply` prod, verify, `destroy`.
:::

## prerequisites

:::lang fr
Tu dois avoir **terminé toute la track Terraform** :

- **Fondamentaux**, **state avancé**, **composition**, **modules** — ce projet les mobilise tous.
- **Terraform** et **Docker** installés et fonctionnels.
- **Git** installé (le livrable est un dépôt).
- ~3 h devant toi et un peu de RAM (une dizaine de conteneurs légers au pic).

Crée le dépôt du projet :
:::

:::lang en
You must have **finished the entire Terraform track**:

- **Fundamentals**, **advanced state**, **composition**, **modules** — this project mobilizes them all.
- **Terraform** and **Docker** installed and working.
- **Git** installed (the deliverable is a repo).
- ~3 h ahead of you and a bit of RAM (about ten light containers at peak).

Create the project repo:
:::

```bash
mkdir brownfield-platform && cd brownfield-platform
git init
```

## concepts

:::lang fr
**L'architecture cible.** On sépare trois responsabilités :

1. **La plateforme** (`platform/`) — la ressource **partagée** par tous les environnements : ici un **réseau** Docker commun. Elle expose son nom en **output**. C'est l'équivalent d'un VPC/réseau géré par l'équipe « socle » (on pourrait y ajouter d'autres ressources socle : registre, secrets, DNS…).
2. **Les modules** (`modules/`) — la **bibliothèque** réutilisable. Un module `service` (un conteneur paramétrable) et un module `stack` qui **compose** plusieurs services (web + api + db) en une unité cohérente. On les écrit **une fois**.
3. **Les environnements** (`envs/dev`, `envs/staging`, `envs/prod`) — chacun est une **config Terraform à part entière**, avec **son propre state**, qui **consomme** les modules et **lit** la plateforme via remote state. La seule chose qui change d'un env à l'autre : son `terraform.tfvars`.

**Dossiers par environnement, pas workspaces.** On l'a vu dans le guide modules : les workspaces partagent code et backend, ce qui convient à des variantes légères. En entreprise, pour des environnements qui peuvent diverger (tailles, images, secrets, voire comptes cloud), on préfère **un dossier par env réutilisant les mêmes modules**. C'est plus explicite, plus sûr, et c'est le pattern qu'un recruteur reconnaît. **Sache justifier ce choix** — c'est une question d'entretien classique.

**Le fil remote state.** La plateforme applique en premier et expose `network_name`. Chaque environnement déclare une data source `terraform_remote_state` qui **lit** cette sortie et l'injecte dans ses modules. Résultat : un seul réseau partagé, **une seule source de vérité**, zéro duplication.
:::

:::lang en
**The target architecture.** We split three responsibilities:

1. **The platform** (`platform/`) — the resource **shared** by all environments: here a common Docker **network**. It exposes its name as an **output**. This is the equivalent of a VPC/network managed by the "foundation" team (you could add other foundation resources: registry, secrets, DNS…).
2. **The modules** (`modules/`) — the reusable **library**. A `service` module (a parameterizable container) and a `stack` module that **composes** several services (web + api + db) into a coherent unit. We write them **once**.
3. **The environments** (`envs/dev`, `envs/staging`, `envs/prod`) — each is a **full Terraform config**, with **its own state**, that **consumes** the modules and **reads** the platform via remote state. The only thing that changes from one env to another: its `terraform.tfvars`.

**Folders per environment, not workspaces.** We saw it in the modules guide: workspaces share code and backend, which suits light variants. In a company, for environments that may diverge (sizes, images, secrets, even cloud accounts), we prefer **one folder per env reusing the same modules**. It's more explicit, safer, and it's the pattern a recruiter recognizes. **Know how to justify this choice** — it's a classic interview question.

**The remote-state thread.** The platform applies first and exposes `network_name`. Each environment declares a `terraform_remote_state` data source that **reads** that output and injects it into its modules. Result: a single shared network, **one source of truth**, zero duplication.
:::

:::figure terraform-projet-architecture
caption_fr: "Schéma 1. La plateforme expose le réseau partagé ; chaque environnement (dev/staging/prod) a son state, lit la plateforme par remote state, et instancie le module stack (web+api+db)."
caption_en: "Figure 1. The platform exposes the shared network; each environment (dev/staging/prod) has its own state, reads the platform via remote state, and instantiates the stack module (web+api+db)."
:::

:::lang fr
Le plan de construction : arborescence → module `service` → module `stack` → plateforme → env `dev` → décliner `staging`/`prod` → documentation → démo & nettoyage.
:::

:::lang en
The build plan: tree → `service` module → `stack` module → platform → `dev` env → replicate `staging`/`prod` → documentation → demo & teardown.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Poser l'**arborescence** du dépôt — la structure que le recruteur ouvrira en premier.

Crée les dossiers et un `.gitignore` correct dès le départ :
:::

:::lang en
**Goal.** Lay down the repo **tree** — the structure the recruiter opens first.

Create the folders and a correct `.gitignore` from the start:
:::

```bash
mkdir -p modules/service modules/stack platform envs/dev envs/staging envs/prod
```

```bash
# .gitignore (racine du dépôt / repo root)
cat > .gitignore <<'EOF'
# State & backups locaux — ne JAMAIS committer (secrets en clair)
# Local state & backups — NEVER commit (cleartext secrets)
*.tfstate
*.tfstate.*
.terraform.tfstate.lock.info

# Répertoire de travail (providers, modules téléchargés)
# Working dir (providers, downloaded modules)
.terraform/

# Variables potentiellement sensibles par machine
# Possibly machine-sensitive variables
*.auto.tfvars
crash.log
EOF
```

:::lang fr
**🤔 Pourquoi ne pas ignorer `terraform.tfvars` ?** Ici nos `.tfvars` ne portent **pas de secret** (juste des tailles, ports, tags) : on veut au contraire les **committer** pour documenter chaque environnement. On n'ignore que les `*.auto.tfvars` (souvent locaux) et surtout le **state** (qui, lui, contient des données sensibles). On garde en revanche `.terraform.lock.hcl` (versions de providers) — il **se committe**.

**✅ Vérification :** `tree -L 2` (ou `find . -maxdepth 2 -type d`) montre `modules/{service,stack}`, `platform/`, `envs/{dev,staging,prod}`. Le squelette parle déjà de lui-même : c'est le premier signal de professionnalisme.
:::

:::lang en
**🤔 Why not ignore `terraform.tfvars`?** Here our `.tfvars` carry **no secret** (just sizes, ports, tags): on the contrary we want to **commit** them to document each environment. We only ignore `*.auto.tfvars` (often local) and above all the **state** (which does hold sensitive data). We do keep `.terraform.lock.hcl` (provider versions) — it **gets committed**.

**✅ Check:** `tree -L 2` (or `find . -maxdepth 2 -type d`) shows `modules/{service,stack}`, `platform/`, `envs/{dev,staging,prod}`. The skeleton already speaks for itself: it's the first signal of professionalism.
:::

### step-02

:::lang fr
**Objectif.** Écrire le module de base **`service`** : un conteneur paramétrable, branché sur le réseau partagé.

C'est la brique atomique. Son interface : un nom, une image, un port optionnel, le réseau à rejoindre, et des variables d'environnement. `modules/service/variables.tf` :
:::

:::lang en
**Goal.** Write the base **`service`** module: a parameterizable container, plugged into the shared network.

It's the atomic brick. Its interface: a name, an image, an optional port, the network to join, and environment variables. `modules/service/variables.tf`:
:::

```hcl
# modules/service/variables.tf
variable "name"    { type = string }
variable "image"   { type = string }
variable "network" { type = string }

variable "external_port" {
  type        = number
  default     = 0          # 0 = ne pas publier de port hôte / 0 = don't publish a host port
  description = "Port hôte ; 0 pour ne rien exposer / Host port; 0 to expose nothing"
}

variable "env" {
  type        = map(string)
  default     = {}
  description = "Variables d'environnement du conteneur / Container environment variables"
}
```

:::lang fr
`modules/service/main.tf` — remarque le **`dynamic "ports"`** (vu en composition) qui ne publie un port que si `external_port > 0` :
:::

:::lang en
`modules/service/main.tf` — note the **`dynamic "ports"`** (seen in composition) that publishes a port only if `external_port > 0`:
:::

```hcl
# modules/service/main.tf
resource "docker_image" "this" {
  name         = var.image
  keep_locally = true       # ne pas supprimer l'image au destroy (partagée entre envs) / don't remove the image on destroy (shared across envs)
}

resource "docker_container" "this" {
  name  = var.name
  image = docker_image.this.image_id

  networks_advanced {
    name = var.network
  }

  dynamic "ports" {
    for_each = var.external_port > 0 ? [var.external_port] : []
    content {
      internal = 80
      external = ports.value
    }
  }

  env = [for k, v in var.env : "${k}=${v}"]
}
```

```hcl
# modules/service/outputs.tf
output "name" { value = docker_container.this.name }
output "id"   { value = docker_container.this.id }
```

:::lang fr
**✅ Vérification :** le module `service` est autonome (pas de provider déclaré), avec trois fichiers `variables/main/outputs`. Le `dynamic "ports"` conditionnel est la marque d'un module **réutilisable** : la base de données n'exposera aucun port, le reverse proxy en exposera un — le même module gère les deux.
:::

:::lang en
**✅ Check:** the `service` module is self-contained (no provider declared), with three files `variables/main/outputs`. The conditional `dynamic "ports"` is the mark of a **reusable** module: the database will expose no port, the reverse proxy will expose one — the same module handles both.
:::

### step-03

:::lang fr
**Objectif.** Composer avec un module **`stack`** : web + api + db en une unité, décrite par des variables de haut niveau.

**🤔 La composition de modules.** Un module peut en appeler d'autres. `stack` orchestre trois `service`. L'environnement ne verra qu'**une** interface simple (`replicas`, `db_image`, `expose_port`), pas la plomberie. `modules/stack/variables.tf` :
:::

:::lang en
**Goal.** Compose with a **`stack`** module: web + api + db as one unit, described by high-level variables.

**🤔 Module composition.** A module can call others. `stack` orchestrates three `service`s. The environment sees only **one** simple interface (`replicas`, `db_image`, `expose_port`), not the plumbing. `modules/stack/variables.tf`:
:::

```hcl
# modules/stack/variables.tf
variable "env_name"    { type = string }               # dev / staging / prod
variable "network"     { type = string }
variable "web_replicas" {
  type    = number
  default = 1
}
variable "db_image" {
  type    = string
  default = "postgres:16-alpine"
}
variable "expose_port" {
  type        = number
  default     = 0
  description = "Port hôte du reverse proxy web / Web reverse-proxy host port"
}
```

:::lang fr
`modules/stack/main.tf` — la db (jamais exposée), N réplicas web (via `count`), une api :
:::

:::lang en
`modules/stack/main.tf` — the db (never exposed), N web replicas (via `count`), an api:
:::

```hcl
# modules/stack/main.tf
module "db" {
  source        = "../service"
  name          = "${var.env_name}-db"
  image         = var.db_image
  network       = var.network
  external_port = 0                       # une base ne s'expose jamais / a DB never gets exposed
  env = {
    POSTGRES_PASSWORD = "demo-not-a-real-secret"   # démo locale — en vrai : variable sensible / local demo — real life: sensitive var
    POSTGRES_DB       = "shop"
  }
}

module "api" {
  source        = "../service"
  name          = "${var.env_name}-api"
  image         = "nginx:1.27-alpine"     # stand-in d'une API / API stand-in
  network       = var.network
  external_port = 0
  env           = { APP_ENV = var.env_name }
}

module "web" {
  source        = "../service"
  count         = var.web_replicas
  name          = "${var.env_name}-web-${count.index}"
  image         = "nginx:1.27-alpine"
  network       = var.network
  # seul le 1er réplica publie le port (proxy) / only the 1st replica publishes the port (proxy)
  external_port = count.index == 0 ? var.expose_port : 0
  env           = { APP_ENV = var.env_name }
}
```

```hcl
# modules/stack/outputs.tf
output "web_containers" {
  value = [for w in module.web : w.name]
}
output "summary" {
  value = "${var.env_name}: ${var.web_replicas} web + 1 api + 1 db"
}
```

:::lang fr
**✅ Vérification :** le module `stack` **compose** trois modules `service` et n'expose qu'une interface métier (`web_replicas`, `db_image`, `expose_port`). C'est la couche qui rend un environnement **descriptible en cinq lignes**. Note comment `count` sur `web` reste légitime ici : des réplicas web sont **interchangeables** (pas d'identité propre) — c'est le cas d'usage canonique de `count`.
:::

:::lang en
**✅ Check:** the `stack` module **composes** three `service` modules and exposes only a business interface (`web_replicas`, `db_image`, `expose_port`). It's the layer that makes an environment **describable in five lines**. Note how `count` on `web` stays legitimate here: web replicas are **interchangeable** (no identity of their own) — the canonical use case for `count`.
:::

### step-04

:::lang fr
**Objectif.** Provisionner la **couche plateforme** — le réseau partagé — et exposer sa sortie.

`platform/main.tf` :
:::

:::lang en
**Goal.** Provision the **platform layer** — the shared network — and expose its output.

`platform/main.tf`:
:::

```hcl
# platform/main.tf
terraform {
  required_providers {
    docker = { source = "kreuzwerker/docker", version = "~> 3.0" }
  }
}
provider "docker" {}

resource "docker_network" "shared" {
  name = "brownfield-net"
}

output "network_name" { value = docker_network.shared.name }
```

```bash
cd platform
terraform init
terraform apply -auto-approve
terraform output
cd ..
```

:::lang fr
**✅ Vérification :** `terraform output` (dans `platform/`) affiche `network_name = "brownfield-net"`. `docker network ls | grep brownfield-net` confirme la création. **La plateforme est le socle** : elle s'applique **une fois**, avant tout environnement, et publie le contrat que les envs consommeront.
:::

:::lang en
**✅ Check:** `terraform output` (in `platform/`) shows `network_name = "brownfield-net"`. `docker network ls | grep brownfield-net` confirms creation. **The platform is the foundation**: it applies **once**, before any environment, and publishes the contract the envs will consume.
:::

### step-05

:::lang fr
**Objectif.** Construire l'environnement **`dev`** : il lit la plateforme par remote state et instancie le module `stack`.

Trois fichiers dans `envs/dev/`. D'abord `main.tf` (identique pour les trois envs — c'est **le même code**) :
:::

:::lang en
**Goal.** Build the **`dev`** environment: it reads the platform via remote state and instantiates the `stack` module.

Three files in `envs/dev/`. First `main.tf` (identical across all three envs — it's **the same code**):
:::

```hcl
# envs/dev/main.tf
terraform {
  required_providers {
    docker = { source = "kreuzwerker/docker", version = "~> 3.0" }
  }
}
provider "docker" {}

data "terraform_remote_state" "platform" {
  backend = "local"
  config  = { path = "../../platform/terraform.tfstate" }
}

variable "env_name"     { type = string }
variable "web_replicas" { type = number }
variable "expose_port"  { type = number }
variable "db_image"     { type = string }

module "stack" {
  source       = "../../modules/stack"
  env_name     = var.env_name
  network      = data.terraform_remote_state.platform.outputs.network_name
  web_replicas = var.web_replicas
  expose_port  = var.expose_port
  db_image     = var.db_image
}

output "summary"        { value = module.stack.summary }
output "web_containers" { value = module.stack.web_containers }
```

:::lang fr
Puis `terraform.tfvars` — **c'est le seul fichier qui distingue `dev`** :
:::

:::lang en
Then `terraform.tfvars` — **it's the only file that makes `dev` different**:
:::

```hcl
# envs/dev/terraform.tfvars
env_name     = "dev"
web_replicas = 1
expose_port  = 8080          # http://localhost:8080
db_image     = "postgres:16-alpine"
```

```bash
cd envs/dev
terraform init
terraform apply -auto-approve
terraform output summary        # "dev: 1 web + 1 api + 1 db"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080   # 200
cd ../..
```

:::lang fr
**✅ Vérification :** `terraform output summary` renvoie `dev: 1 web + 1 api + 1 db`, et `curl localhost:8080` répond `200` (le réplica web). `docker network inspect brownfield-net --format '{{range .Containers}}{{.Name}} {{end}}'` liste `dev-web-0`, `dev-api`, `dev-db` — tous **branchés sur le réseau de la plateforme**, que dev n'a **pas** créé. Le fil remote state fonctionne de bout en bout.
:::

:::lang en
**✅ Check:** `terraform output summary` returns `dev: 1 web + 1 api + 1 db`, and `curl localhost:8080` answers `200` (the web replica). `docker network inspect brownfield-net --format '{{range .Containers}}{{.Name}} {{end}}'` lists `dev-web-0`, `dev-api`, `dev-db` — all **plugged into the platform's network**, which dev did **not** create. The remote-state thread works end to end.
:::

### step-06

:::lang fr
**Objectif.** Décliner **`staging`** et **`prod`** — sans réécrire une ligne de logique.

**🤔 Le paiement de l'architecture.** `staging` et `prod` réutilisent **exactement** le `main.tf` de `dev`. Seuls leurs `.tfvars` changent : plus de réplicas, un port différent, en prod une image db épinglée. Copie le `main.tf` et adapte les vars.
:::

:::lang en
**Goal.** Replicate **`staging`** and **`prod`** — without rewriting a line of logic.

**🤔 The architecture paying off.** `staging` and `prod` reuse **exactly** dev's `main.tf`. Only their `.tfvars` change: more replicas, a different port, in prod a pinned db image. Copy the `main.tf` and adapt the vars.
:::

```bash
cp envs/dev/main.tf envs/staging/main.tf
cp envs/dev/main.tf envs/prod/main.tf
```

```hcl
# envs/staging/terraform.tfvars
env_name     = "staging"
web_replicas = 2
expose_port  = 8081
db_image     = "postgres:16-alpine"
```

```hcl
# envs/prod/terraform.tfvars
env_name     = "prod"
web_replicas = 3
expose_port  = 8082
db_image     = "postgres:16.3-alpine"   # version épinglée en prod / pinned version in prod
```

```bash
for e in staging prod; do
  ( cd envs/$e && terraform init && terraform apply -auto-approve && terraform output summary )
done
```

:::lang fr
**✅ Vérification :** `staging` publie `2 web` sur 8081, `prod` publie `3 web` sur 8082 — et `dev` tourne toujours sur 8080. `docker ps --format '{{.Names}}' | sort` montre les trois environnements **côte à côte, isolés** : `dev-*`, `staging-*`, `prod-*`. Chaque env a son propre `terraform.tfstate` dans son dossier. **Trois environnements, un seul corpus de code, zéro copier-coller de logique** — c'est exactement l'argument que tu vendras en entretien.

*(Astuce : `curl localhost:8080`, `:8081`, `:8082` répondent tous `200`, chacun servi par son propre env.)*
:::

:::lang en
**✅ Check:** `staging` publishes `2 web` on 8081, `prod` publishes `3 web` on 8082 — and `dev` still runs on 8080. `docker ps --format '{{.Names}}' | sort` shows the three environments **side by side, isolated**: `dev-*`, `staging-*`, `prod-*`. Each env has its own `terraform.tfstate` in its folder. **Three environments, one codebase, zero logic copy-paste** — exactly the argument you'll sell in an interview.

*(Tip: `curl localhost:8080`, `:8081`, `:8082` all answer `200`, each served by its own env.)*
:::

### step-07

:::lang fr
**Objectif.** Documenter — la partie qui transforme un dossier de code en **livrable de CV**.

**🤔 Le README fait 50 % de la valeur.** Un recruteur passe deux minutes sur ton repo : il lit le README, regarde l'arbre, cherche un schéma. Sans doc, ton beau code est **invisible**. Crée un `README.md` à la racine en suivant ce plan (chaque titre devient une section Markdown `##`) :
:::

:::lang en
**Goal.** Document — the part that turns a code folder into a **CV deliverable**.

**🤔 The README is 50% of the value.** A recruiter spends two minutes on your repo: they read the README, look at the tree, hunt for a diagram. Without docs, your nice code is **invisible**. Create a root `README.md` following this outline (each heading becomes a Markdown `##` section):
:::

    # Brownfield Platform — Terraform multi-environnement
    #
    # Infrastructure-as-code : une plateforme partagée + 3 environnements
    # (dev/staging/prod) isolés, en local via le provider Docker.
    #
    # Architecture
    # - platform/        : réseau partagé (applique en premier)
    # - modules/service  : conteneur paramétrable réutilisable
    # - modules/stack    : compose web + api + db
    # - envs/{dev,staging,prod} : une config par env, state isolé,
    #                     différence portée par terraform.tfvars uniquement
    # - [schéma : voir architecture.md]
    #
    # Décisions d'architecture
    # - Dossiers par env plutôt que workspaces : environnements pouvant
    #   diverger (tailles, images), isolation de state explicite.
    # - Remote state : les envs lisent le réseau de la plateforme, pas de
    #   duplication, une source de vérité.
    # - Modules composés : stack cache la plomberie derrière une interface
    #   métier (web_replicas, expose_port).
    #
    # Démarrer
    #   cd platform && terraform init && terraform apply
    #   cd ../envs/dev && terraform init && terraform apply   # idem staging / prod
    #
    # Détruire
    #   détruire les envs AVANT la plateforme (cf. step-08)

:::lang fr
Ajoute un `architecture.md` avec un **schéma** (un simple diagramme Mermaid suffit et s'affiche sur GitHub) :
:::

:::lang en
Add an `architecture.md` with a **diagram**. Un simple diagramme **Mermaid** suffit et s'affiche directement sur GitHub — colle ce contenu dans un bloc ` ```mermaid ` de ton `architecture.md` (ici en retrait pour l'affichage) :
:::

:::lang en
Add an `architecture.md` with a **diagram**. A simple **Mermaid** diagram is enough and renders directly on GitHub — paste this content into a ` ```mermaid ` block in your `architecture.md` (shown indented here for display):
:::

    graph TD
      P[platform: réseau partagé] -->|remote_state output| D[env dev]
      P -->|remote_state output| S[env staging]
      P -->|remote_state output| PR[env prod]
      D --> M[modules: stack -> service x3]
      S --> M
      PR --> M

:::lang fr
**✅ Vérification :** ton repo a un `README.md` (quoi, pourquoi, comment) et un `architecture.md` (le schéma). Ouvre-les comme le ferait un recruteur : en deux minutes, comprend-on **ce que fait le projet et pourquoi tes choix sont bons** ? Si oui, le livrable est vendable.
:::

:::lang en
**✅ Check:** your repo has a `README.md` (what, why, how) and an `architecture.md` (the diagram). Open them as a recruiter would: in two minutes, is it clear **what the project does and why your choices are sound**? If so, the deliverable is sellable.
:::

### step-08

:::lang fr
**Objectif.** Prouver la reproductibilité, committer, puis **nettoyer proprement**.

D'abord, la preuve « ça se rejoue » — un `plan` doit être **vide** sur un env déjà appliqué (aucune dérive) :
:::

:::lang en
**Goal.** Prove reproducibility, commit, then **tear down cleanly**.

First, the "it replays" proof — a `plan` must be **empty** on an already-applied env (no drift):
:::

```bash
( cd envs/prod && terraform plan )      # "No changes. Your infrastructure matches the configuration."
```

```bash
# Committer le livrable (le .gitignore protège déjà le state)
git add .
git commit -m "Brownfield: plateforme Terraform multi-environnement (dev/staging/prod)"
```

:::lang fr
Puis le **nettoyage**, dans le bon ordre — les environnements **dépendent** de la plateforme (ils utilisent son réseau), donc on détruit les envs **avant** la plateforme :
:::

:::lang en
Then the **teardown**, in the right order — the environments **depend** on the platform (they use its network), so destroy the envs **before** the platform:
:::

```bash
for e in prod staging dev; do
  ( cd envs/$e && terraform destroy -auto-approve )
done
( cd platform && terraform destroy -auto-approve )
```

:::lang fr
**✅ Vérification :** `docker ps -a --format '{{.Names}}' | grep -E 'dev-|staging-|prod-'` ne renvoie rien, et `docker network ls | grep brownfield-net` non plus. `terraform plan` vide **avant** destruction = preuve de reproductibilité ; destruction **par env avant la plateforme** = preuve que tu as compris les dépendances. Ton dépôt, lui, reste — c'est le livrable. **Pousse-le sur GitHub et mets le lien sur ton CV.**
:::

:::lang en
**✅ Check:** `docker ps -a --format '{{.Names}}' | grep -E 'dev-|staging-|prod-'` returns nothing, and neither does `docker network ls | grep brownfield-net`. Empty `terraform plan` **before** teardown = proof of reproducibility; teardown **per env before the platform** = proof you understood dependencies. Your repo stays — it's the deliverable. **Push it to GitHub and put the link on your CV.**
:::

## pitfalls

:::lang fr
**1. Appliquer un env avant la plateforme.** La data source `terraform_remote_state` lira un state **vide** (`outputs is empty`) et le réseau sera introuvable. La plateforme **d'abord**, toujours.

**2. Committer le state.** Le `terraform.tfstate` contient des valeurs en clair (ici un mot de passe db). Le `.gitignore` du step-01 est **non négociable**. Vérifie avec `git status` avant le premier commit.

**3. Mettre de la logique dans les `.tfvars`.** Un `.tfvars` ne contient que des **valeurs**. Toute la logique (conditions, `count`, composition) vit dans les modules. Si tu te retrouves à dupliquer du `main.tf` différent par env, c'est que la variabilisation est incomplète.

**4. Exposer le même port hôte dans deux envs.** `dev`=8080, `staging`=8081, `prod`=8082. Deux envs sur le même port ne peuvent pas coexister (collision Docker). Chaque env a le sien.

**5. Réseau partagé = fausse isolation applicative.** Ici les trois envs partagent **le réseau** de la plateforme pour la démo. En vrai, on isolerait souvent le réseau **par env** (ou par un vrai VPC cloud). Sache le dire : le partage réseau est un choix **pédagogique**, pas une reco de prod.

**6. Oublier `terraform init` dans chaque dossier.** Chaque env et la plateforme sont des configs **indépendantes** : chacune a son `init`, son `.terraform/`, son state. Un `init` global n'existe pas.
:::

:::lang en
**1. Applying an env before the platform.** The `terraform_remote_state` data source will read an **empty** state (`outputs is empty`) and the network won't be found. Platform **first**, always.

**2. Committing the state.** The `terraform.tfstate` holds cleartext values (here a db password). The step-01 `.gitignore` is **non-negotiable**. Check with `git status` before the first commit.

**3. Putting logic in `.tfvars`.** A `.tfvars` holds only **values**. All logic (conditionals, `count`, composition) lives in the modules. If you find yourself duplicating a different `main.tf` per env, your variabilization is incomplete.

**4. Exposing the same host port in two envs.** `dev`=8080, `staging`=8081, `prod`=8082. Two envs on the same port can't coexist (Docker collision). Each env has its own.

**5. Shared network = false app isolation.** Here the three envs share the platform's **network** for the demo. In reality you'd often isolate the network **per env** (or via a real cloud VPC). Know how to say it: network sharing is a **pedagogical** choice, not a prod recommendation.

**6. Forgetting `terraform init` in each folder.** Each env and the platform are **independent** configs: each has its own `init`, `.terraform/`, state. There's no global `init`.
:::

## success

:::lang fr
Ton livrable est prêt pour un CV quand…

- [ ] Le dépôt s'ouvre sur un **README** clair (quoi, pourquoi, comment) et un **schéma**.
- [ ] La **plateforme** s'applique seule et expose le réseau partagé en output.
- [ ] Les **trois environnements** montent, isolés, et ne diffèrent que par leur `.tfvars`.
- [ ] Chaque env **lit** la plateforme via `terraform_remote_state` (aucune duplication).
- [ ] `terraform plan` est **vide** après apply (reproductible, sans dérive).
- [ ] Le **state n'est pas** dans Git ; `.terraform.lock.hcl` **l'est**.
- [ ] Tu sais **justifier à l'oral** : dossiers-par-env vs workspaces, rôle du remote state, composition de modules.

Sept cases cochées = tu ne présentes pas un exercice, tu présentes une **infrastructure**. C'est la différence entre « j'ai suivi une formation » et « j'ai livré ça ».
:::

:::lang en
Your deliverable is CV-ready when…

- [ ] The repo opens on a clear **README** (what, why, how) and a **diagram**.
- [ ] The **platform** applies on its own and exposes the shared network as an output.
- [ ] The **three environments** come up, isolated, and differ only by their `.tfvars`.
- [ ] Each env **reads** the platform via `terraform_remote_state` (no duplication).
- [ ] `terraform plan` is **empty** after apply (reproducible, no drift).
- [ ] The **state is not** in Git; `.terraform.lock.hcl` **is**.
- [ ] You can **justify out loud**: folders-per-env vs workspaces, remote state's role, module composition.

Seven boxes ticked = you're not presenting an exercise, you're presenting an **infrastructure**. That's the difference between "I took a course" and "I shipped this".
:::

## next

:::lang fr
Tu as bouclé la track **Terraform → Associate**, projet compris. Pour aller plus loin :

1. **Passe l'examen** — avec le QCM et l'examen blanc de la track, tu es prêt pour la certification **HashiCorp Terraform Associate**.
2. **Rejoue le projet sur un vrai cloud** — remplace le provider `docker` par `aws`/`azurerm`/`google` (couvert dans les tracks cloud) : la **structure ne change pas**, seuls les modules `service`/`stack` deviennent des vraies ressources cloud. C'est la preuve ultime que ton architecture était bonne.
3. **Enchaîne sur Kubernetes** — le prochain jalon de ton parcours DevOps.
:::

:::lang en
You've completed the **Terraform → Associate** track, project included. To go further:

1. **Sit the exam** — with the track's quiz and mock exam, you're ready for the **HashiCorp Terraform Associate** certification.
2. **Replay the project on a real cloud** — swap the `docker` provider for `aws`/`azurerm`/`google` (covered in the cloud tracks): the **structure doesn't change**, only the `service`/`stack` modules become real cloud resources. It's the ultimate proof your architecture was sound.
3. **Move on to Kubernetes** — the next milestone of your DevOps path.
:::

## resources

:::lang fr
- [Structurer un projet Terraform](https://developer.hashicorp.com/terraform/language/modules/develop/structure) — conventions de dépôt.
- [Standard module structure](https://developer.hashicorp.com/terraform/language/modules/develop/structure) et [remote state](https://developer.hashicorp.com/terraform/language/state/remote-state-data).
- [Provider Docker (kreuzwerker)](https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs) — ressources `docker_container`, `docker_network`, `docker_image`.
- [Diagrammes Mermaid sur GitHub](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) — pour ton `architecture.md`.
:::

:::lang en
- [Structuring a Terraform project](https://developer.hashicorp.com/terraform/language/modules/develop/structure) — repo conventions.
- [Standard module structure](https://developer.hashicorp.com/terraform/language/modules/develop/structure) and [remote state](https://developer.hashicorp.com/terraform/language/state/remote-state-data).
- [Docker provider (kreuzwerker)](https://registry.terraform.io/providers/kreuzwerker/docker/latest/docs) — `docker_container`, `docker_network`, `docker_image` resources.
- [Mermaid diagrams on GitHub](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams) — for your `architecture.md`.
:::

## troubleshooting

:::lang fr
**`outputs is empty` sur la data source remote state.** La plateforme n'a pas été appliquée (ou son state est ailleurs). Applique `platform/` d'abord, et vérifie le `path` relatif `../../platform/terraform.tfstate`.

**`Error: port is already allocated`.** Deux envs demandent le même `expose_port`, ou un conteneur d'un run précédent traîne. Donne un port distinct par env (8080/8081/8082) et vérifie `docker ps`.

**`Reference to undeclared module`.** Un `source` relatif faux. Depuis `envs/dev`, le module `stack` est à `../../modules/stack` ; depuis `modules/stack`, `service` est à `../service`. Compte bien les `../`.

**Le conteneur db redémarre en boucle.** L'image `postgres` exige `POSTGRES_PASSWORD` : vérifie qu'il est bien passé dans `env`. Pour la démo c'est une valeur en clair — en prod, ce serait une variable sensible injectée par le backend/CI.

**`terraform plan` n'est jamais vide.** Une ressource a une valeur « connue après apply » qui bouge (ex. `image_id` si le tag `latest` change). Épingle les images (`postgres:16.3-alpine`, pas `latest`) pour un plan stable — c'est aussi une bonne pratique de prod.

**`git status` montre `terraform.tfstate`.** Ton `.gitignore` n'est pas pris en compte (créé après un `git add` ?). Fais `git rm --cached **/*.tfstate` puis recommite ; ne pousse jamais de state.
:::

:::lang en
**`outputs is empty` on the remote-state data source.** The platform wasn't applied (or its state is elsewhere). Apply `platform/` first, and check the relative `path` `../../platform/terraform.tfstate`.

**`Error: port is already allocated`.** Two envs request the same `expose_port`, or a container from a previous run lingers. Give a distinct port per env (8080/8081/8082) and check `docker ps`.

**`Reference to undeclared module`.** A wrong relative `source`. From `envs/dev`, the `stack` module is at `../../modules/stack`; from `modules/stack`, `service` is at `../service`. Count the `../` carefully.

**The db container restart-loops.** The `postgres` image requires `POSTGRES_PASSWORD`: check it's passed in `env`. For the demo it's a cleartext value — in prod it'd be a sensitive variable injected by the backend/CI.

**`terraform plan` is never empty.** A resource has a "known after apply" value that moves (e.g. `image_id` if the `latest` tag changes). Pin images (`postgres:16.3-alpine`, not `latest`) for a stable plan — it's also a prod best practice.

**`git status` shows `terraform.tfstate`.** Your `.gitignore` isn't taking effect (created after a `git add`?). Run `git rm --cached **/*.tfstate` then recommit; never push state.
:::
