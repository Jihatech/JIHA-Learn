---
# — Identité (ne change JAMAIS une fois publié) —
id: terraform-composition
slug: terraform-composition
order: 10
status: published

# — Titres & accroches (bilingue) —
title_fr: "Terraform — composition & expressions"
title_en: "Terraform — composition & expressions"
tagline_fr: "count, for_each, expressions, fonctions, data, dynamic."
tagline_en: "count, for_each, expressions, functions, data, dynamic."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 130
repo: "hashicorp/terraform"
last_review: "2026-07-31"

# — Relations de parcours (par id) —
prerequisites: [terraform-fondamentaux]
next: [kubernetes-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [locals-types, count, for-each, expressions-conditions, fonctions, data-sources, blocs-dynamic]
concepts_en: [locals-types, count, for-each, conditional-expressions, functions, data-sources, dynamic-blocks]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Génère de l'infrastructure sans copier-coller : count et for_each, expressions et conditions, fonctions, data sources et blocs dynamic. Le niveau composition attendu par la certification Terraform Associate."
og_description_en: "Generate infrastructure without copy-paste: count and for_each, expressions and conditionals, functions, data sources and dynamic blocks. The composition level the Terraform Associate certification expects."
---

## intro

:::lang fr
Au niveau fondamentaux, tu écrivais **un bloc `resource` par objet**. Ça ne passe pas à l'échelle : dix serveurs identiques, ce n'est pas dix copier-coller. Terraform génère de l'infrastructure **à partir de données** — un nombre, une liste, une map — via des **méta-arguments** (`count`, `for_each`) et des **expressions**.

Ce guide te fait passer du « je décris chaque ressource » au « je décris un **patron** et je le décline ». C'est le saut qui sépare un `main.tf` d'amateur (répétitif, fragile) d'un code **DRY**, paramétrable, lisible — et c'est un gros bloc du programme **Terraform Associate**.

On reste **sur ta machine** : le provider Docker fournit l'infra à générer. Toutes les commandes tournent en local.

**Pour qui c'est :** tu as les fondamentaux Terraform (HCL, plan/apply, variables, modules) et tu veux arrêter de copier-coller des blocs.

**Quand ce n'est PAS le bon choix :**

- Tu ne maîtrises pas encore providers/ressources/variables → reviens au guide fondamentaux.
- Tu cherches à gérer le state en équipe → c'est le guide précédent (state en profondeur).
:::

:::lang en
At the fundamentals level, you wrote **one `resource` block per object**. That doesn't scale: ten identical servers isn't ten copy-pastes. Terraform generates infrastructure **from data** — a number, a list, a map — via **meta-arguments** (`count`, `for_each`) and **expressions**.

This guide takes you from "I describe each resource" to "I describe a **pattern** and instantiate it". That's the leap that separates an amateur `main.tf` (repetitive, fragile) from **DRY**, parameterizable, readable code — and it's a big chunk of the **Terraform Associate** exam.

We stay **on your machine**: the Docker provider supplies the infra to generate. All commands run locally.

**Who it's for:** you have the Terraform fundamentals (HCL, plan/apply, variables, modules) and you want to stop copy-pasting blocks.

**When it's NOT the right choice:**

- You're not comfortable with providers/resources/variables yet → go back to the fundamentals guide.
- You're looking to manage state on a team → that's the previous guide (state in depth).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Structurer avec des **`locals`** et des variables **typées** (list, map, object).
- Créer N ressources avec **`count`** — et connaître son piège d'index.
- Créer des ressources nommées avec **`for_each`** (map/set) — et pourquoi le préférer.
- Écrire des **expressions** : conditions, boucles `for`, interpolation, splat.
- Utiliser des **fonctions** intégrées et les tester avec `terraform console`.
- Lire l'existant avec une **data source**.
- Générer des blocs imbriqués avec **`dynamic`**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Structure with **`locals`** and **typed** variables (list, map, object).
- Create N resources with **`count`** — and know its index pitfall.
- Create named resources with **`for_each`** (map/set) — and why to prefer it.
- Write **expressions**: conditionals, `for` loops, interpolation, splat.
- Use built-in **functions** and test them with `terraform console`.
- Read existing infra with a **data source**.
- Generate nested blocks with **`dynamic`**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Le guide **Terraform fondamentaux** acquis (prérequis dur).
- **Terraform** et **Docker** installés et fonctionnels.
- Un projet vierge :
:::

:::lang en
You should have:

- The **Terraform fundamentals** guide under your belt (hard prerequisite).
- **Terraform** and **Docker** installed and working.
- A blank project:
:::

```bash
mkdir tf-compo && cd tf-compo
```

:::lang fr
Crée `main.tf` avec le provider et une image partagée :
:::

:::lang en
Create `main.tf` with the provider and a shared image:
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

resource "docker_image" "nginx" {
  name = "nginx:1.27"
}
```

```bash
terraform init
```

## concepts

:::lang fr
Deux familles d'outils permettent de **générer** au lieu de **répéter**.

**Les méta-arguments** créent plusieurs instances d'une même ressource :

- **`count`** prend un **nombre** : Terraform crée N copies, indexées par `count.index` (0, 1, 2…). Simple, mais l'index est **positionnel** — c'est son talon d'Achille (voir plus bas).
- **`for_each`** prend une **map** ou un **set** : Terraform crée une instance par clé, accessible via `each.key` et `each.value`. Chaque instance est identifiée par une **clé stable**, pas par une position.

**Les expressions** transforment les données :

- **conditions** : `var.prod ? "nginx:1.27" : "nginx:latest"` ;
- **boucles `for`** : `[for p in var.ports : p + 8000]` construit une nouvelle liste ;
- **fonctions** : `length()`, `merge()`, `lookup()`, `upper()`… (des dizaines) ;
- **interpolation** : `"site-${each.key}"`.

Enfin, une **data source** (`data "..."`) **lit** un objet existant (au lieu de le créer) pour le référencer, et un bloc **`dynamic`** génère des **blocs imbriqués** répétés (plusieurs `ports`, plusieurs règles…) à partir d'une collection.

La règle d'or de ce guide : **`for_each` plutôt que `count` dès que les instances ont une identité** (un nom, une clé). Pourquoi ? Avec `count`, supprimer l'élément du milieu **décale tous les suivants** → Terraform détruit et recrée à la chaîne. Avec `for_each`, chaque instance a une clé stable : supprimer une clé ne touche pas les autres.
:::

:::lang en
Two families of tools let you **generate** instead of **repeat**.

**Meta-arguments** create multiple instances of one resource:

- **`count`** takes a **number**: Terraform creates N copies, indexed by `count.index` (0, 1, 2…). Simple, but the index is **positional** — its Achilles' heel (see below).
- **`for_each`** takes a **map** or a **set**: Terraform creates one instance per key, accessed via `each.key` and `each.value`. Each instance is identified by a **stable key**, not a position.

**Expressions** transform data:

- **conditionals**: `var.prod ? "nginx:1.27" : "nginx:latest"`;
- **`for` loops**: `[for p in var.ports : p + 8000]` builds a new list;
- **functions**: `length()`, `merge()`, `lookup()`, `upper()`… (dozens);
- **interpolation**: `"site-${each.key}"`.

Finally, a **data source** (`data "..."`) **reads** an existing object (instead of creating it) to reference it, and a **`dynamic`** block generates repeated **nested blocks** (multiple `ports`, multiple rules…) from a collection.

The golden rule of this guide: **`for_each` over `count` as soon as instances have an identity** (a name, a key). Why? With `count`, deleting the middle element **shifts all the following ones** → Terraform destroys and recreates down the line. With `for_each`, each instance has a stable key: deleting one key doesn't touch the others.
:::

:::figure terraform-count-foreach
caption_fr: "Schéma 1. count indexe par position (fragile au retrait) ; for_each indexe par clé stable (sûr)."
caption_en: "Figure 1. count indexes by position (fragile on removal); for_each indexes by stable key (safe)."
:::

:::lang fr
On avance : locals & types → `count` → `for_each` (et son avantage) → expressions → fonctions → data source → `dynamic`.
:::

:::lang en
We'll go: locals & types → `count` → `for_each` (and its advantage) → expressions → functions → data source → `dynamic`.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Externaliser des valeurs avec des **`locals`** et une variable **typée**.

**🤔 `locals` vs `variable` ?** Une **variable** est une entrée (fournie de l'extérieur : `.tfvars`, CLI). Un **local** est une valeur **calculée en interne**, réutilisable, pour ne pas répéter une expression. On introduit aussi une variable **map** — le type qu'on va décliner avec `for_each`.

Ajoute à `main.tf` :
:::

:::lang en
**Goal.** Externalize values with **`locals`** and a **typed** variable.

**🤔 `locals` vs `variable`?** A **variable** is an input (provided from outside: `.tfvars`, CLI). A **local** is a value **computed internally**, reusable, to avoid repeating an expression. We also introduce a **map** variable — the type we'll instantiate with `for_each`.

Add to `main.tf`:
:::

```hcl
variable "sites" {
  type = map(number)   # nom du site => port externe / site name => external port
  default = {
    blog = 8081
    shop = 8082
  }
}

locals {
  image = docker_image.nginx.image_id
  count_of_sites = length(var.sites)
}
```

```bash
terraform console <<< 'local.count_of_sites'   # évalue une expression sans appliquer / evaluate without applying
```

:::lang fr
**✅ Vérification :** `terraform console` renvoie `2` (le nombre de sites). `terraform console` est ton bac à sable pour tester expressions et fonctions **sans** toucher à l'infra.
:::

:::lang en
**✅ Check:** `terraform console` returns `2` (the number of sites). `terraform console` is your sandbox to test expressions and functions **without** touching infra.
:::

### step-02

:::lang fr
**Objectif.** Créer N conteneurs identiques avec **`count`**.

**🤔 Quand `count` ?** Quand les instances sont **interchangeables** et sans identité propre (des répliques anonymes). `count.index` donne le numéro (0..N-1) pour différencier nom et port.
:::

:::lang en
**Goal.** Create N identical containers with **`count`**.

**🤔 When `count`?** When instances are **interchangeable** with no identity of their own (anonymous replicas). `count.index` gives the number (0..N-1) to differentiate name and port.
:::

```hcl
resource "docker_container" "worker" {
  count = 3
  name  = "worker-${count.index}"
  image = local.image
  ports {
    internal = 80
    external = 9000 + count.index
  }
}

output "worker_names" {
  value = docker_container.worker[*].name   # splat : la liste des noms / splat: the list of names
}
```

```bash
terraform apply -auto-approve
terraform output worker_names         # ["worker-0","worker-1","worker-2"] (via splat)
terraform state list | grep worker    # worker[0], worker[1], worker[2]
```

:::lang fr
**✅ Vérification :** trois conteneurs `worker-0/1/2` tournent (ports 9000-9002), et `terraform output worker_names` renvoie `["worker-0","worker-1","worker-2"]` grâce à l'opérateur **splat** `[*]` (une liste construite depuis toutes les instances `count`). Dans le state, ils sont indexés **par position** : `docker_container.worker[0]`, `[1]`, `[2]`. Retiens ce détail — c'est le piège de l'étape suivante.
:::

:::lang en
**✅ Check:** three `worker-0/1/2` containers run (ports 9000-9002), and `terraform output worker_names` returns `["worker-0","worker-1","worker-2"]` thanks to the **splat** operator `[*]` (a list built from all `count` instances). In state they're indexed **by position**: `docker_container.worker[0]`, `[1]`, `[2]`. Remember this — it's the pitfall in the next step.
:::

### step-03

:::lang fr
**Objectif.** Créer des ressources **nommées** avec **`for_each`**, et comprendre pourquoi il bat `count`.

**🤔 Le problème de `count`.** Avec `count = 3`, si tu passes à `count = 2`, Terraform supprime `worker[2]` — logique. Mais si tu voulais supprimer **celui du milieu**, `count` ne sait pas : il réindexe tout, et `worker[1]` puis `worker[2]` sont **détruits et recréés**. Sur des serveurs avec état, c'est un désastre.

**La solution `for_each`.** Chaque instance a une **clé stable** (le nom du site). Retirer une clé ne touche **que** son instance. On décline notre map `var.sites` :
:::

:::lang en
**Goal.** Create **named** resources with **`for_each`**, and understand why it beats `count`.

**🤔 The `count` problem.** With `count = 3`, if you drop to `count = 2`, Terraform removes `worker[2]` — fine. But if you wanted to remove **the middle one**, `count` can't: it reindexes everything, and `worker[1]` then `worker[2]` are **destroyed and recreated**. On stateful servers, that's a disaster.

**The `for_each` fix.** Each instance has a **stable key** (the site name). Removing a key touches **only** its instance. We instantiate our `var.sites` map:
:::

```hcl
resource "docker_container" "site" {
  for_each = var.sites
  name     = "site-${each.key}"        # site-blog, site-shop
  image    = local.image
  ports {
    internal = 80
    external = each.value              # 8081, 8082
  }
}
```

```bash
terraform apply -auto-approve
terraform state list | grep site      # site["blog"], site["shop"]
```

:::lang fr
**✅ Vérification :** deux conteneurs `site-blog` (8081) et `site-shop` (8082) tournent, indexés **par clé** : `docker_container.site["blog"]`. Preuve du gain : retire `shop` du `default` de `var.sites` (édite `main.tf`) puis `terraform plan` → **seul** `site["shop"]` est détruit, `site["blog"]` est intact. Refais l'inverse pour t'en convaincre. *(Remets `shop` avant de continuer.)*
:::

:::lang en
**✅ Check:** two containers `site-blog` (8081) and `site-shop` (8082) run, indexed **by key**: `docker_container.site["blog"]`. Proof of the gain: remove `shop` from `var.sites`'s `default` (edit `main.tf`) then `terraform plan` → **only** `site["shop"]` is destroyed, `site["blog"]` is untouched. Do the reverse to convince yourself. *(Put `shop` back before continuing.)*
:::

### step-04

:::lang fr
**Objectif.** Transformer des données avec des **expressions** : condition et boucle `for`.

**🤔 Pourquoi ?** Rarement les données arrivent dans la forme voulue. Une **condition** (`? :`) choisit une valeur ; une **boucle `for`** produit une nouvelle collection à partir d'une autre. Teste-les dans `terraform console` :
:::

:::lang en
**Goal.** Transform data with **expressions**: conditional and `for` loop.

**🤔 Why?** Data rarely arrives in the shape you want. A **conditional** (`? :`) picks a value; a **`for` loop** produces a new collection from another. Test them in `terraform console`:
:::

```bash
terraform console
# Dans la console / In the console:
# > var.sites
# > [for name, port in var.sites : "${name}:${port}"]      # boucle for / for loop
# > { for name, port in var.sites : name => port + 1000 }  # for -> map
# > length(var.sites) > 1 ? "plusieurs" : "un seul"         # condition
# > exit
```

:::lang fr
**✅ Vérification :** la boucle `for` sur la liste renvoie `["blog:8081", "shop:8082"]` ; la version map renvoie `{blog = 9081, shop = 9082}` ; la condition renvoie `"plusieurs"`. Tu viens de **transformer** des données sans écrire de boucle impérative.
:::

:::lang en
**✅ Check:** the list `for` loop returns `["blog:8081", "shop:8082"]`; the map version returns `{blog = 9081, shop = 9082}`; the conditional returns `"plusieurs"`. You just **transformed** data without writing an imperative loop.
:::

### step-05

:::lang fr
**Objectif.** Découvrir les **fonctions** intégrées les plus utiles.

**🤔 Pourquoi les connaître ?** Terraform fournit des dizaines de fonctions (chaînes, collections, numériques, encodage…). Pas besoin de les mémoriser — mais reconnaître les indispensables (`merge`, `lookup`, `length`, `coalesce`, `join`, `toset`) t'évite de réinventer la roue. `terraform console` reste ton terrain d'essai :
:::

:::lang en
**Goal.** Discover the most useful built-in **functions**.

**🤔 Why know them?** Terraform provides dozens of functions (string, collection, numeric, encoding…). No need to memorize them — but recognizing the essentials (`merge`, `lookup`, `length`, `coalesce`, `join`, `toset`) saves you reinventing the wheel. `terraform console` stays your testing ground:
:::

```bash
terraform console
# > merge({a = 1}, {b = 2})            # fusionne deux maps / merge two maps
# > lookup(var.sites, "blog", 0)       # valeur ou défaut / value or default
# > join(", ", keys(var.sites))        # "blog, shop"
# > upper("prod")                      # "PROD"
# > coalesce("", null, "défaut")       # première valeur non vide / first non-empty
# > exit
```

:::lang fr
**✅ Vérification :** `merge` renvoie `{a=1, b=2}`, `lookup` renvoie `8081`, `join(keys())` renvoie `"blog, shop"`. Garde le réflexe : un besoin de manipulation → il existe probablement une fonction (cf. doc « Functions »).
:::

:::lang en
**✅ Check:** `merge` returns `{a=1, b=2}`, `lookup` returns `8081`, `join(keys())` returns `"blog, shop"`. Keep the reflex: a manipulation need → there's probably a function for it (see the "Functions" docs).
:::

### step-06

:::lang fr
**Objectif.** Lire un objet **existant** avec une **data source**.

**🤔 Ressource vs data source ?** Une `resource` **crée et gère** un objet. Une `data` **lit** un objet qui existe déjà (créé ailleurs, ou fourni par la plateforme) pour le **référencer**. Cas classique : récupérer l'empreinte (digest) d'une image dans le registre pour l'épingler de façon immuable.

Ajoute :
:::

:::lang en
**Goal.** Read an **existing** object with a **data source**.

**🤔 Resource vs data source?** A `resource` **creates and manages** an object. A `data` **reads** an object that already exists (created elsewhere, or supplied by the platform) to **reference** it. Classic case: fetch an image's digest from the registry to pin it immutably.

Add:
:::

```hcl
data "docker_registry_image" "nginx" {
  name = "nginx:1.27"
}

output "nginx_digest" {
  value = data.docker_registry_image.nginx.sha256_digest
}
```

```bash
terraform apply -auto-approve
terraform output nginx_digest
```

:::lang fr
**✅ Vérification :** `terraform output nginx_digest` affiche un `sha256:...` — l'empreinte réelle de l'image dans le registre, **lue** sans rien créer. On pourrait maintenant épingler l'image par ce digest (immuable, plus sûr qu'un tag).
:::

:::lang en
**✅ Check:** `terraform output nginx_digest` shows a `sha256:...` — the image's real digest in the registry, **read** without creating anything. We could now pin the image by that digest (immutable, safer than a tag).
:::

### step-07

:::lang fr
**Objectif.** Générer des **blocs imbriqués** répétés avec **`dynamic`**.

**🤔 Le besoin ?** Certains blocs se répètent dans une ressource (plusieurs `ports`, plusieurs règles). Les écrire à la main = copier-coller. Un bloc **`dynamic`** les génère à partir d'une collection : `for_each` sur la collection, et `content { … }` décrit le bloc à produire.

Un conteneur qui expose **plusieurs ports** définis par une variable :
:::

:::lang en
**Goal.** Generate repeated **nested blocks** with **`dynamic`**.

**🤔 The need?** Some blocks repeat inside a resource (multiple `ports`, multiple rules). Writing them by hand = copy-paste. A **`dynamic`** block generates them from a collection: `for_each` over the collection, and `content { … }` describes the block to produce.

A container that exposes **several ports** defined by a variable:
:::

```hcl
variable "extra_ports" {
  type    = list(number)
  default = [8091, 8092, 8093]
}

resource "docker_container" "multi" {
  name  = "multi-port"
  image = local.image
  dynamic "ports" {
    for_each = var.extra_ports
    content {
      internal = 80
      external = ports.value
    }
  }
}
```

```bash
terraform apply -auto-approve
docker port multi-port          # trois mappings vers 80 / three mappings to 80
```

:::lang fr
**✅ Vérification :** `docker port multi-port` liste **trois** mappings (8091/8092/8093 → 80), générés par un seul bloc `dynamic`. Le nom du bloc (`ports`) sert d'itérateur (`ports.value`).

*(Nettoyage : `terraform destroy -auto-approve`.)*
:::

:::lang en
**✅ Check:** `docker port multi-port` lists **three** mappings (8091/8092/8093 → 80), generated by a single `dynamic` block. The block name (`ports`) acts as the iterator (`ports.value`).

*(Cleanup: `terraform destroy -auto-approve`.)*
:::

## pitfalls

:::lang fr
**1. `count` sur des ressources qui ont une identité.** Le retrait d'un élément du milieu réindexe et détruit/recrée les suivants. Dès qu'il y a un nom/une clé → **`for_each`**.

**2. `for_each` sur une liste.** `for_each` attend une **map** ou un **set**, pas une liste (l'ordre d'une liste n'est pas une identité stable). Convertis avec `toset(...)` si besoin.

**3. Abuser des expressions/conditions imbriquées.** Une expression illisible sur trois niveaux vaut moins qu'un `local` bien nommé. Décompose dans `locals`.

**4. Confondre `resource` et `data`.** Une `data` ne crée rien ; si tu attends une création, c'est une `resource`. Et une `data` est **relue à chaque plan** (elle peut changer).

**5. Oublier que `count`/`for_each` changent l'adresse.** `web` devient `web[0]` ou `web["clé"]`. Après avoir ajouté un `count`/`for_each` à une ressource existante, un `state mv` peut être nécessaire (cf. guide state).

**6. Dépendances implicites avec `count = 0`.** Une ressource conditionnée par `count = var.enabled ? 1 : 0` n'existe pas toujours ; référence-la avec précaution (`one(...)` ou `[0]` protégé).
:::

:::lang en
**1. `count` on resources that have an identity.** Removing a middle element reindexes and destroys/recreates the following ones. As soon as there's a name/key → **`for_each`**.

**2. `for_each` on a list.** `for_each` expects a **map** or a **set**, not a list (a list's order isn't a stable identity). Convert with `toset(...)` if needed.

**3. Overusing nested expressions/conditionals.** An unreadable three-level expression is worth less than a well-named `local`. Break it down in `locals`.

**4. Confusing `resource` and `data`.** A `data` creates nothing; if you expect a creation, it's a `resource`. And a `data` is **re-read on every plan** (it can change).

**5. Forgetting that `count`/`for_each` change the address.** `web` becomes `web[0]` or `web["key"]`. After adding a `count`/`for_each` to an existing resource, a `state mv` may be needed (see the state guide).

**6. Implicit dependencies with `count = 0`.** A resource gated by `count = var.enabled ? 1 : 0` doesn't always exist; reference it carefully (`one(...)` or a guarded `[0]`).
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu choisis `count` **ou** `for_each` en connaissance de cause (identité = `for_each`).
- [ ] Tu déclines une ressource depuis une **map** avec `each.key`/`each.value`.
- [ ] Tu écris une condition et une boucle `for`, et tu les testes dans `terraform console`.
- [ ] Tu pioches les bonnes **fonctions** au lieu de bricoler.
- [ ] Tu lis l'existant avec une **data source**.
- [ ] Tu génères des blocs imbriqués avec **`dynamic`**.

Six cases cochées = tu génères de l'infra proprement, au niveau composition attendu par l'Associate.
:::

:::lang en
You know it works when…

- [ ] You choose `count` **or** `for_each` deliberately (identity = `for_each`).
- [ ] You instantiate a resource from a **map** with `each.key`/`each.value`.
- [ ] You write a conditional and a `for` loop, and test them in `terraform console`.
- [ ] You pick the right **functions** instead of hacking around.
- [ ] You read existing infra with a **data source**.
- [ ] You generate nested blocks with **`dynamic`**.

Six boxes ticked = you generate infra cleanly, at the composition level the Associate expects.
:::

## next

:::lang fr
La suite de la track Terraform :

1. **Travail d'équipe & cloud réel** — Terraform Cloud, workspaces, un vrai provider (AWS/Azure/GCP), modules réutilisables.
2. **Projet d'entreprise** — provisionner une infrastructure **multi-environnement** (dev/staging/prod), qui met en œuvre state distant, `for_each` et modules — le livrable de portfolio.
:::

:::lang en
The rest of the Terraform track:

1. **Teamwork & real cloud** — Terraform Cloud, workspaces, a real provider (AWS/Azure/GCP), reusable modules.
2. **Enterprise project** — provision a **multi-environment** infrastructure (dev/staging/prod), putting remote state, `for_each` and modules into practice — the portfolio deliverable.
:::

## cheatsheet

:::lang fr
Aide-mémoire composition & expressions.
:::

:::lang en
Composition & expressions cheat sheet.
:::

```hcl
# Méta-arguments / Meta-arguments
count    = 3                 # -> ressource[0..2], count.index
for_each = var.map_ou_set    # -> ressource["clé"], each.key / each.value

# Expressions
var.prod ? "a" : "b"                       # condition / conditional
[for x in liste : x + 1]                   # for -> liste / list
{ for k, v in map : k => upper(v) }        # for -> map
docker_container.worker[*].name            # splat (ressources count) -> liste / splat (count) -> list
[for s in docker_container.site : s.name]  # équivalent pour for_each (map) / for_each equivalent

# Fonctions utiles / Useful functions
length()  merge()  lookup(m, k, defaut)  coalesce()  join()  keys()  values()  toset()

# Data source (lit, ne crée pas / reads, doesn't create)
data "docker_registry_image" "x" { name = "nginx:1.27" }

# Bloc dynamic / dynamic block
dynamic "ports" {
  for_each = var.liste
  content {
    internal = 80
    external = ports.value
  }
}
```

```bash
terraform console      # tester expressions & fonctions / test expressions & functions
```

## resources

:::lang fr
- [Meta-arguments `count`](https://developer.hashicorp.com/terraform/language/meta-arguments/count) et [`for_each`](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each).
- [Expressions](https://developer.hashicorp.com/terraform/language/expressions) — conditions, `for`, splat.
- [Fonctions intégrées](https://developer.hashicorp.com/terraform/language/functions) — la liste complète.
- [Data sources](https://developer.hashicorp.com/terraform/language/data-sources) et [blocs `dynamic`](https://developer.hashicorp.com/terraform/language/expressions/dynamic-blocks).
:::

:::lang en
- [`count`](https://developer.hashicorp.com/terraform/language/meta-arguments/count) and [`for_each`](https://developer.hashicorp.com/terraform/language/meta-arguments/for_each) meta-arguments.
- [Expressions](https://developer.hashicorp.com/terraform/language/expressions) — conditionals, `for`, splat.
- [Built-in functions](https://developer.hashicorp.com/terraform/language/functions) — the full list.
- [Data sources](https://developer.hashicorp.com/terraform/language/data-sources) and [`dynamic` blocks](https://developer.hashicorp.com/terraform/language/expressions/dynamic-blocks).
:::

## troubleshooting

:::lang fr
**`for_each` : « argument must be a map, or set of strings ».** Tu lui passes une liste. Convertis : `for_each = toset(var.ma_liste)`, ou restructure en map.

**Un changement de `count`/`for_each` recrée des ressources non voulues.** Tu es passé de blocs distincts à `count`/`for_each` (ou de `count` à `for_each`) : l'adresse change. Utilise `terraform state mv` pour aligner (cf. guide state).

**`Error: Invalid index` sur une ressource `count`.** Tu référence `res[0]` alors que `count` vaut 0. Protège : `length(res) > 0 ? res[0].id : null`, ou `one(res[*].id)`.

**`terraform console` renvoie une erreur sur une data source.** La data doit avoir été lue au moins une fois (`apply` ou `plan` récent). Sinon la valeur est « known after apply ».

**Une expression `for` ne compile pas.** Vérifie la forme : liste `[for x in c : expr]`, map `{ for k, v in c : k => v }`. Le `=>` n'existe que pour produire une map.
:::

:::lang en
**`for_each`: "argument must be a map, or set of strings".** You're passing it a list. Convert: `for_each = toset(var.my_list)`, or restructure into a map.

**A `count`/`for_each` change recreates unwanted resources.** You went from distinct blocks to `count`/`for_each` (or from `count` to `for_each`): the address changes. Use `terraform state mv` to align (see the state guide).

**`Error: Invalid index` on a `count` resource.** You reference `res[0]` while `count` is 0. Guard: `length(res) > 0 ? res[0].id : null`, or `one(res[*].id)`.

**`terraform console` errors on a data source.** The data must have been read at least once (recent `apply` or `plan`). Otherwise the value is "known after apply".

**A `for` expression won't compile.** Check the form: list `[for x in c : expr]`, map `{ for k, v in c : k => v }`. The `=>` only exists to produce a map.
:::
