---
# — Identité (ne change JAMAIS une fois publié) —
id: terraform-state-avance
slug: terraform-state-avance
order: 9
status: published

# — Titres & accroches (bilingue) —
title_fr: "Terraform — le state en profondeur"
title_en: "Terraform — state in depth"
tagline_fr: "Backends distants, verrouillage, import, drift, chirurgie du state."
tagline_en: "Remote backends, locking, import, drift, state surgery."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 120
repo: "hashicorp/terraform"
last_review: "2026-07-31"

# — Relations de parcours (par id) —
prerequisites: [terraform-fondamentaux]
next: [kubernetes-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [state-remote-backend, verrouillage, state-mv-rm, import, drift, secrets-state]
concepts_en: [remote-backend, locking, state-mv-rm, import, drift, state-secrets]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Maîtrise le state Terraform en conditions réelles : backends distants et verrouillage, refactoring avec state mv/rm, import de ressources existantes, détection de drift, et sécurité du state. Aligné Terraform Associate."
og_description_en: "Master Terraform state for real-world use: remote backends and locking, refactoring with state mv/rm, importing existing resources, drift detection, and state security. Aligned with Terraform Associate."
---

## intro

:::lang fr
Dans le guide fondamentaux, le **state** était une boîte noire : un fichier `terraform.tfstate` qui « marche ». En équipe et en production, c'est **la** source de la moitié des incidents Terraform : deux personnes qui appliquent en même temps et s'écrasent, une ressource créée à la main que Terraform ignore, un `tfstate` corrompu ou commité avec des secrets en clair.

Ce guide fait du state une compétence maîtrisée, pas une source d'angoisse. Tu vas voir **ce qu'il contient vraiment**, le **refactoriser sans rien détruire**, **importer** l'existant, **détecter les écarts** (drift), et le sécuriser via un **backend distant avec verrouillage**.

Comme toujours, on reste **sur ta machine** : le provider Docker sert d'infrastructure à manipuler. Seule la config de backend distant demande un vrai stockage (S3, Terraform Cloud) — on la montre et on explique la migration, tu la brancheras au module cloud.

**Pour qui c'est :** tu as fait Terraform fondamentaux (HCL, plan/apply, modules) et tu veux le niveau « équipe / prod » — celui que teste la certification Associate.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas encore le socle Terraform (providers, ressources, plan/apply) → reviens au guide fondamentaux.
- Tu cherches à provisionner un vrai cloud (AWS/Azure/GCP) : c'est la suite ; ici on solidifie le **cœur** que ces modules réutiliseront.
:::

:::lang en
In the fundamentals guide, **state** was a black box: a `terraform.tfstate` file that "works". On a team and in production, it's **the** source of half of all Terraform incidents: two people applying at once and clobbering each other, a resource created by hand that Terraform ignores, a `tfstate` corrupted or committed with clear-text secrets.

This guide turns state into a mastered skill, not a source of dread. You'll see **what it really contains**, **refactor it without destroying anything**, **import** existing resources, **detect drift**, and secure it via a **remote backend with locking**.

As always, we stay **on your machine**: the Docker provider is the infrastructure to manipulate. Only the remote-backend config needs real storage (S3, Terraform Cloud) — we show it and explain the migration; you'll wire it up in the cloud module.

**Who it's for:** you've done Terraform fundamentals (HCL, plan/apply, modules) and you want the "team / prod" level — the one the Associate certification tests.

**When it's NOT the right choice:**

- You don't have the Terraform base yet (providers, resources, plan/apply) → go back to the fundamentals guide.
- You want to provision a real cloud (AWS/Azure/GCP): that's next; here we solidify the **core** those modules will reuse.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Inspecter le **state** et comprendre ce qu'il stocke (et pourquoi on n'y touche pas à la main).
- Refactoriser sans destruction avec **`terraform state mv`** et **`terraform state rm`**.
- **Importer** une ressource existante sous gestion Terraform.
- Détecter et réconcilier le **drift** (changements hors Terraform).
- Configurer un **backend distant** avec **verrouillage** (concept + migration).
- Traiter le state comme une **donnée sensible**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Inspect the **state** and understand what it stores (and why you don't touch it by hand).
- Refactor without destruction using **`terraform state mv`** and **`terraform state rm`**.
- **Import** an existing resource under Terraform management.
- Detect and reconcile **drift** (changes made outside Terraform).
- Configure a **remote backend** with **locking** (concept + migration).
- Treat state as **sensitive data**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Le guide **Terraform fondamentaux** acquis (prérequis dur).
- **Terraform** et **Docker** installés et fonctionnels.
- Un projet de travail. Repars propre :
:::

:::lang en
You should have:

- The **Terraform fundamentals** guide under your belt (hard prerequisite).
- **Terraform** and **Docker** installed and working.
- A working project. Start clean:
:::

```bash
mkdir tf-state && cd tf-state
```

:::lang fr
Crée `main.tf` avec une image et un conteneur (notre « infra » à gérer) :
:::

:::lang en
Create `main.tf` with an image and a container (our "infra" to manage):
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

resource "docker_container" "web" {
  name  = "tf-state-web"
  image = docker_image.nginx.image_id
  ports {
    internal = 80
    external = 8080
  }
}
```

```bash
terraform init && terraform apply -auto-approve
```

## concepts

:::lang fr
Le **state** est le **carnet de comptes** de Terraform : la correspondance entre ton code (`docker_container.web`) et l'objet réel (le conteneur, son ID, ses attributs). Sans lui, Terraform ne saurait pas ce qui existe déjà.

Trois vérités à intégrer :

- **Le state peut mentir par rapport au réel.** Si quelqu'un modifie l'infra **hors** Terraform (supprime le conteneur à la main), le state ne le sait pas encore : c'est le **drift**. `terraform plan` le révèle en comparant state et réalité.
- **Le state ≠ ton code.** Renommer une ressource dans le code (`web` → `frontend`) fait croire à Terraform que l'ancienne a disparu et qu'une nouvelle apparaît → il **détruit et recrée**. Pour renommer *sans* détruire, on déplace l'entrée dans le state (`state mv`).
- **Le state contient des données sensibles en clair.** Mots de passe, clés générées, sorties : tout y est. D'où deux règles : **jamais dans Git**, et en équipe **un backend distant chiffré et verrouillé**.

Le **backend** est l'endroit où vit le state. Par défaut : **local** (`terraform.tfstate` sur ton disque) — parfait pour apprendre, dangereux en équipe. En prod : un **backend distant** (S3, Terraform Cloud, GCS…) qui **partage** le state et le **verrouille** : pendant qu'une personne applique, les autres sont bloquées. Fini les `apply` concurrents qui se corrompent.
:::

:::lang en
The **state** is Terraform's **ledger**: the mapping between your code (`docker_container.web`) and the real object (the container, its ID, its attributes). Without it, Terraform wouldn't know what already exists.

Three truths to internalize:

- **State can lie about reality.** If someone changes the infra **outside** Terraform (deletes the container by hand), state doesn't know yet: that's **drift**. `terraform plan` reveals it by comparing state and reality.
- **State ≠ your code.** Renaming a resource in code (`web` → `frontend`) makes Terraform think the old one vanished and a new one appeared → it **destroys and recreates**. To rename *without* destroying, you move the entry in state (`state mv`).
- **State holds sensitive data in clear text.** Passwords, generated keys, outputs: it's all there. Hence two rules: **never in Git**, and on a team **a remote, encrypted, locked backend**.

The **backend** is where state lives. By default: **local** (`terraform.tfstate` on your disk) — perfect for learning, dangerous on a team. In prod: a **remote backend** (S3, Terraform Cloud, GCS…) that **shares** state and **locks** it: while one person applies, the others are blocked. No more concurrent `apply`s corrupting each other.
:::

:::figure terraform-state-flow
caption_fr: "Schéma 1. Le state relie code et réel ; le backend distant le partage et le verrouille entre plusieurs personnes."
caption_en: "Figure 1. State links code and reality; the remote backend shares and locks it across people."
:::

:::lang fr
On avance : inspecter le state → refactorer avec `state mv` → arrêter de gérer avec `state rm` → importer l'existant → détecter le drift → backend distant & verrouillage → sécurité.
:::

:::lang en
We'll go: inspect state → refactor with `state mv` → stop managing with `state rm` → import existing → detect drift → remote backend & locking → security.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Regarder dans le state — et comprendre pourquoi on le lit avec des commandes, jamais avec un éditeur.

**🤔 Pourquoi `terraform state` et pas ouvrir le fichier ?** Le `.tfstate` est du JSON que Terraform met à jour de façon atomique. L'éditer à la main, c'est risquer de le désynchroniser du réel — une des pires pannes Terraform. Les sous-commandes `state` sont l'interface **sûre**.
:::

:::lang en
**Goal.** Look inside state — and understand why you read it with commands, never with an editor.

**🤔 Why `terraform state` and not open the file?** The `.tfstate` is JSON that Terraform updates atomically. Editing it by hand risks desyncing it from reality — one of the worst Terraform failures. The `state` subcommands are the **safe** interface.
:::

```bash
terraform state list                       # les ressources gérées / the managed resources
terraform state show docker_container.web  # tous les attributs enregistrés / all recorded attributes
```

:::lang fr
**✅ Vérification :** `state list` affiche `docker_image.nginx` et `docker_container.web`. `state show` détaille l'objet réel (ID, ports, image) tel que Terraform le connaît. Note l'**adresse de ressource** (`docker_container.web`) : c'est la clé qu'on manipule ensuite.
:::

:::lang en
**✅ Check:** `state list` shows `docker_image.nginx` and `docker_container.web`. `state show` details the real object (ID, ports, image) as Terraform knows it. Note the **resource address** (`docker_container.web`): that's the key we'll manipulate next.
:::

### step-02

:::lang fr
**Objectif.** Renommer une ressource **sans la détruire**, avec `terraform state mv`.

**🤔 Pourquoi ne pas juste renommer dans le code ?** Parce que Terraform identifie une ressource par son **adresse** (`docker_container.web`). Change l'adresse dans le code et le plan devient « détruire `web`, créer `frontend` » — inacceptable sur une base de données en prod. `state mv` déplace l'entrée dans le state pour que la nouvelle adresse pointe vers l'objet **existant**.

Renomme d'abord dans le state, **puis** dans le code (l'ordre compte) :
:::

:::lang en
**Goal.** Rename a resource **without destroying it**, with `terraform state mv`.

**🤔 Why not just rename in code?** Because Terraform identifies a resource by its **address** (`docker_container.web`). Change the address in code and the plan becomes "destroy `web`, create `frontend`" — unacceptable on a production database. `state mv` moves the state entry so the new address points to the **existing** object.

Rename in state first, **then** in code (order matters):
:::

```bash
terraform state mv docker_container.web docker_container.frontend
# puis édite main.tf : renomme le bloc "web" en "frontend" / then edit main.tf: rename block "web" to "frontend"
terraform plan
```

:::lang fr
**✅ Vérification :** après le `state mv` et l'édition du code, `terraform plan` annonce **`No changes`** — la ressource a changé de nom **sans** être recréée. Sans `state mv`, tu aurais vu un `-/+` destructeur.
:::

:::lang en
**✅ Check:** after the `state mv` and the code edit, `terraform plan` reports **`No changes`** — the resource was renamed **without** being recreated. Without `state mv`, you'd have seen a destructive `-/+`.
:::

### step-03

:::lang fr
**Objectif.** Retirer une ressource de la gestion Terraform **sans la supprimer**, avec `terraform state rm`.

**🤔 À quoi ça sert ?** Parfois tu veux que Terraform **oublie** une ressource (elle sera gérée autrement, ou par un autre projet) sans la détruire. `state rm` retire l'entrée du state : l'objet réel continue de tourner, mais Terraform ne le suit plus.
:::

:::lang en
**Goal.** Remove a resource from Terraform management **without deleting it**, with `terraform state rm`.

**🤔 What's it for?** Sometimes you want Terraform to **forget** a resource (it'll be managed elsewhere, or by another project) without destroying it. `state rm` removes the state entry: the real object keeps running, but Terraform no longer tracks it.
:::

```bash
terraform state rm docker_container.frontend
terraform state list          # frontend a disparu du state / frontend is gone from state
docker ps                     # ...mais le conteneur tourne toujours / ...but the container still runs
```

:::lang fr
**✅ Vérification :** `terraform state list` ne montre plus `docker_container.frontend`, alors que `docker ps` le liste encore. Terraform l'a **oublié**, pas détruit. *(À l'étape suivante, on va le ré-adopter par `import`.)*
:::

:::lang en
**✅ Check:** `terraform state list` no longer shows `docker_container.frontend`, while `docker ps` still lists it. Terraform **forgot** it, didn't destroy it. *(In the next step, we'll re-adopt it via `import`.)*
:::

### step-04

:::lang fr
**Objectif.** Importer une ressource **existante** sous gestion Terraform, avec `terraform import`.

**🤔 Le cas réel ?** Une infra créée à la main (ou par un autre outil) que tu veux désormais gérer en code — sans la recréer. `import` associe une ressource **réelle** (par son ID) à une adresse Terraform. Le code doit déjà décrire la ressource ; l'import remplit le state.

Le bloc `docker_container.frontend` est toujours dans ton `main.tf` (on l'a seulement retiré du state). Récupère l'ID du conteneur et importe-le :
:::

:::lang en
**Goal.** Import an **existing** resource under Terraform management, with `terraform import`.

**🤔 The real-world case?** Infra created by hand (or by another tool) that you now want to manage as code — without recreating it. `import` binds a **real** resource (by its ID) to a Terraform address. The code must already describe the resource; import fills the state.

The `docker_container.frontend` block is still in your `main.tf` (we only removed it from state). Get the container's ID and import it:
:::

```bash
docker ps --filter name=tf-state-web --format '{{.ID}}'   # récupère l'ID / get the ID
terraform import docker_container.frontend <ID-DU-CONTENEUR>
terraform plan
```

:::lang fr
**✅ Vérification :** `terraform import` répond `Import successful!`, et `terraform plan` affiche `No changes` — Terraform gère de nouveau le conteneur existant, sans l'avoir recréé. Tu viens de **ré-adopter** une ressource.
:::

:::lang en
**✅ Check:** `terraform import` replies `Import successful!`, and `terraform plan` shows `No changes` — Terraform manages the existing container again, without recreating it. You just **re-adopted** a resource.
:::

### step-05

:::lang fr
**Objectif.** Provoquer un **drift** et le réconcilier.

**🤔 Pourquoi c'est central ?** En vrai, l'infra bouge hors Terraform : un collègue modifie une ressource dans la console, un incident supprime un objet. Le **drift**, c'est l'écart entre le state et le réel. Terraform le **détecte** au `plan` (il rafraîchit l'état réel avant de comparer) et propose de **reconverger** vers ton code.

On simule : on supprime le conteneur **à la main**, puis on regarde ce que Terraform en dit.
:::

:::lang en
**Goal.** Cause **drift** and reconcile it.

**🤔 Why is this central?** In reality, infra changes outside Terraform: a colleague edits a resource in the console, an incident deletes an object. **Drift** is the gap between state and reality. Terraform **detects** it at `plan` (it refreshes real state before comparing) and offers to **reconverge** to your code.

We simulate: delete the container **by hand**, then see what Terraform says.
:::

```bash
docker rm -f tf-state-web          # changement HORS Terraform / change OUTSIDE Terraform
terraform plan                     # Terraform détecte que le conteneur a disparu / detects it's gone
terraform apply -auto-approve      # reconverge : il le recrée / reconverges: recreates it
```

:::lang fr
**✅ Vérification :** le `plan` signale que `docker_container.frontend` a été supprimé hors Terraform et propose de le **recréer** (`1 to add`). Après `apply`, `docker ps` le remontre. Terraform a **réconcilié** le réel avec ton code.
:::

:::lang en
**✅ Check:** the `plan` flags that `docker_container.frontend` was deleted outside Terraform and offers to **recreate** it (`1 to add`). After `apply`, `docker ps` shows it again. Terraform **reconciled** reality with your code.
:::

### step-06

:::lang fr
**Objectif.** Passer d'un state local à un **backend distant avec verrouillage** — le prérequis du travail en équipe.

**🤔 Ce que ça change :** le state ne vit plus sur ton disque mais dans un stockage partagé (S3, Terraform Cloud, GCS…), **chiffré**, et **verrouillé** pendant chaque opération. Deux `apply` simultanés ? Le second attend le déverrouillage — plus de corruption.

On déclare le backend dans un bloc `terraform`. Exemple avec **Terraform Cloud/HCP** (gratuit pour démarrer) :
:::

:::lang en
**Goal.** Move from local state to a **remote backend with locking** — the prerequisite for teamwork.

**🤔 What changes:** state no longer lives on your disk but in shared storage (S3, Terraform Cloud, GCS…), **encrypted**, and **locked** during each operation. Two simultaneous `apply`s? The second waits for the unlock — no more corruption.

You declare the backend in a `terraform` block. Example with **Terraform Cloud/HCP** (free to start):
:::

```hcl
terraform {
  backend "s3" {
    bucket         = "mon-org-terraform-state"
    key            = "tf-state/demo.tfstate"
    region         = "eu-west-3"
    dynamodb_table = "terraform-locks"   # le verrouillage / the locking
    encrypt        = true
  }
}
```

```bash
terraform init -migrate-state    # migre le state local vers le backend distant / migrate local state to the remote backend
```

:::lang fr
**✅ Vérification :** `terraform init -migrate-state` te demande de confirmer la copie du state local vers le backend, puis `terraform.tfstate` local devient vide (le state vit à distance).

⚠️ **Cette étape exige un vrai backend** (un bucket S3 + table de verrouillage, ou un compte Terraform Cloud) — tu la brancheras pour de bon au **module cloud**. Retiens le mécanisme : un bloc `backend` + `init -migrate-state`, et le verrouillage devient automatique.
:::

:::lang en
**✅ Check:** `terraform init -migrate-state` asks you to confirm copying local state to the backend, then the local `terraform.tfstate` becomes empty (state lives remotely).

⚠️ **This step requires a real backend** (an S3 bucket + lock table, or a Terraform Cloud account) — you'll wire it up for real in the **cloud module**. Remember the mechanism: a `backend` block + `init -migrate-state`, and locking becomes automatic.
:::

### step-07

:::lang fr
**Objectif.** Traiter le state comme la donnée sensible qu'il est.

**🤔 Pourquoi si sensible ?** Le state stocke **en clair** tout ce que Terraform connaît : mots de passe de bases, clés générées, jetons. Committer un `tfstate`, c'est publier des secrets. Idem pour les fichiers de plan (`-out`).

Protège-toi :
:::

:::lang en
**Goal.** Treat state as the sensitive data it is.

**🤔 Why so sensitive?** State stores **in clear text** everything Terraform knows: database passwords, generated keys, tokens. Committing a `tfstate` means publishing secrets. Same for plan files (`-out`).

Protect yourself:
:::

```bash
printf '%s\n' 'terraform.tfstate*' '.terraform/' '*.tfplan' '.terraform.lock.hcl' > .gitignore
# note : .terraform.lock.hcl SE commite (versions de providers) ; retire-le du .gitignore
```

:::lang fr
**✅ Vérification :** `git status` ne propose plus de suivre `terraform.tfstate`. Corrige la ligne du lock : `.terraform.lock.hcl` **doit** être versionné (il fige les versions de providers) — c'est le seul fichier `terraform*` qu'on commite.

*(Nettoyage : `terraform destroy -auto-approve` supprime le conteneur de démo.)*
:::

:::lang en
**✅ Check:** `git status` no longer offers to track `terraform.tfstate`. Fix the lock line: `.terraform.lock.hcl` **must** be versioned (it pins provider versions) — it's the only `terraform*` file you commit.

*(Cleanup: `terraform destroy -auto-approve` removes the demo container.)*
:::

## pitfalls

:::lang fr
**1. Éditer `terraform.tfstate` à la main.** La panne classique : tu désynchronises Terraform du réel. Utilise **toujours** `state mv`/`rm`/`import`, jamais un éditeur.

**2. Renommer une ressource dans le code sans `state mv`.** Tu déclenches un `destroy`/`create` — potentiellement destructeur sur du stateful. `state mv` d'abord.

**3. Committer le state.** Secrets en clair publiés. `.gitignore` sur `terraform.tfstate*` et, en équipe, backend distant.

**4. State local à plusieurs.** Deux personnes, deux states divergents → corruption. Backend distant + verrouillage dès qu'on est plus d'un.

**5. Ignorer le drift.** Si le réel dérive et que tu ne rafraîchis jamais, ton prochain `apply` peut surprendre. `terraform plan` régulièrement ; il rafraîchit et révèle les écarts.

**6. Oublier le verrouillage.** Un backend distant **sans** verrouillage (ex. S3 sans table DynamoDB) n'empêche pas les `apply` concurrents. Le verrou fait partie du backend, pas une option.
:::

:::lang en
**1. Editing `terraform.tfstate` by hand.** The classic failure: you desync Terraform from reality. **Always** use `state mv`/`rm`/`import`, never an editor.

**2. Renaming a resource in code without `state mv`.** You trigger a `destroy`/`create` — potentially destructive on stateful resources. `state mv` first.

**3. Committing state.** Clear-text secrets published. `.gitignore` on `terraform.tfstate*` and, on a team, a remote backend.

**4. Local state with multiple people.** Two people, two diverging states → corruption. Remote backend + locking as soon as there's more than one of you.

**5. Ignoring drift.** If reality drifts and you never refresh, your next `apply` can surprise you. Run `terraform plan` regularly; it refreshes and reveals the gaps.

**6. Forgetting locking.** A remote backend **without** locking (e.g. S3 without a DynamoDB table) doesn't prevent concurrent `apply`s. The lock is part of the backend, not an option.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu lis le state avec `state list`/`show` et tu **n'ouvres jamais** le fichier.
- [ ] Tu renommes/déplaces une ressource **sans** la recréer (`state mv`).
- [ ] Tu sais retirer (`state rm`) et ré-adopter (`import`) une ressource.
- [ ] Tu reconnais un **drift** dans un plan et tu sais reconverger.
- [ ] Tu expliques backend distant + **verrouillage**, et la migration `init -migrate-state`.
- [ ] Le state n'atterrit **jamais** dans Git ; le lock, lui, y est.

Six cases cochées = tu gères le state au niveau « équipe / prod » attendu par l'Associate.
:::

:::lang en
You know it works when…

- [ ] You read state with `state list`/`show` and **never open** the file.
- [ ] You rename/move a resource **without** recreating it (`state mv`).
- [ ] You can remove (`state rm`) and re-adopt (`import`) a resource.
- [ ] You recognize **drift** in a plan and know how to reconverge.
- [ ] You can explain remote backend + **locking**, and the `init -migrate-state` migration.
- [ ] State **never** lands in Git; the lock file does.

Six boxes ticked = you handle state at the "team / prod" level the Associate expects.
:::

## next

:::lang fr
La suite de la track Terraform :

1. **Composition & expressions** — `count`/`for_each`, fonctions, `data` sources, `dynamic` : générer de l'infra sans copier-coller.
2. **Travail d'équipe & cloud réel** — Terraform Cloud et un vrai provider (AWS/Azure/GCP), puis le **projet d'entreprise** : une infra multi-environnement.
:::

:::lang en
The rest of the Terraform track:

1. **Composition & expressions** — `count`/`for_each`, functions, `data` sources, `dynamic`: generate infra without copy-paste.
2. **Teamwork & real cloud** — Terraform Cloud and a real provider (AWS/Azure/GCP), then the **enterprise project**: a multi-environment infrastructure.
:::

## cheatsheet

:::lang fr
Aide-mémoire du state Terraform.
:::

:::lang en
Terraform state cheat sheet.
:::

```bash
# Inspecter / Inspect
terraform state list                 # ressources gérées / managed resources
terraform state show <adresse>       # attributs d'une ressource / a resource's attributes

# Chirurgie du state (jamais l'éditeur !) / State surgery (never the editor!)
terraform state mv <ancien> <nouveau>  # renommer/déplacer sans recréer / rename/move without recreating
terraform state rm <adresse>           # oublier (sans détruire) / forget (without destroying)
terraform import <adresse> <ID-réel>   # adopter une ressource existante / adopt an existing resource

# Drift
terraform plan                       # rafraîchit et révèle les écarts / refreshes and reveals drift
terraform apply -refresh-only        # met à jour le state sans changer l'infra / update state without changing infra

# Backend distant / Remote backend
terraform init -migrate-state        # migrer le state vers le backend / migrate state to the backend
```

## resources

:::lang fr
- [Terraform — state](https://developer.hashicorp.com/terraform/language/state) — la référence.
- [Commandes `state`](https://developer.hashicorp.com/terraform/cli/commands/state) — mv, rm, show, list.
- [Backends distants](https://developer.hashicorp.com/terraform/language/backend) — S3, Terraform Cloud, GCS…
- [Importer des ressources](https://developer.hashicorp.com/terraform/cli/import) — adopter l'existant.
:::

:::lang en
- [Terraform — state](https://developer.hashicorp.com/terraform/language/state) — the reference.
- [`state` commands](https://developer.hashicorp.com/terraform/cli/commands/state) — mv, rm, show, list.
- [Remote backends](https://developer.hashicorp.com/terraform/language/backend) — S3, Terraform Cloud, GCS…
- [Importing resources](https://developer.hashicorp.com/terraform/cli/import) — adopt existing infra.
:::

## troubleshooting

:::lang fr
**`Error acquiring the state lock`.** Un verrou est resté (un `apply` interrompu, ou un collègue en cours). Attends, ou en dernier recours `terraform force-unlock <ID>` — seulement si tu es **sûr** qu'aucune opération ne tourne.

**`terraform import` : « Resource already managed ».** L'adresse est déjà dans le state. Fais `state rm` d'abord, ou choisis une autre adresse.

**Après `import`, `plan` propose des changements.** Ton code ne correspond pas exactement à la ressource réelle (un attribut diffère). Ajuste le HCL pour refléter le réel jusqu'à obtenir `No changes`.

**`state mv` : « Invalid target address ».** Vérifie la syntaxe de l'adresse (`type.nom`, ou `module.x.type.nom`). `terraform state list` te donne les adresses exactes.

**Le `plan` veut tout recréer après un changement de backend.** Tu as probablement fait un `init` sans `-migrate-state` : le nouveau backend est vide. Restaure le state (copie de sauvegarde `terraform.tfstate.backup`) et refais `init -migrate-state`.
:::

:::lang en
**`Error acquiring the state lock`.** A lock got stuck (an interrupted `apply`, or a colleague mid-operation). Wait, or as a last resort `terraform force-unlock <ID>` — only if you're **sure** no operation is running.

**`terraform import`: "Resource already managed".** The address is already in state. Run `state rm` first, or pick another address.

**After `import`, `plan` proposes changes.** Your code doesn't exactly match the real resource (an attribute differs). Adjust the HCL to reflect reality until you get `No changes`.

**`state mv`: "Invalid target address".** Check the address syntax (`type.name`, or `module.x.type.name`). `terraform state list` gives you the exact addresses.

**`plan` wants to recreate everything after a backend change.** You probably ran `init` without `-migrate-state`: the new backend is empty. Restore state (from the `terraform.tfstate.backup` copy) and re-run `init -migrate-state`.
:::
