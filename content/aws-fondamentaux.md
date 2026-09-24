---
# — Identité (ne change JAMAIS une fois publié) —
id: aws-fondamentaux
slug: aws-fondamentaux
order: 44
status: published

# — Titres & accroches (bilingue) —
title_fr: "AWS — les fondamentaux, en 100% local"
title_en: "AWS — the fundamentals, 100% local"
tagline_fr: "LocalStack, aws-cli, régions, S3, IAM : le cloud sans compte."
tagline_en: "LocalStack, aws-cli, regions, S3, IAM: the cloud with no account."

# — Métadonnées pédagogiques —
level: beginner
duration_min: 180
repo: "localstack/localstack"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [docker-fondamentaux]
next: [aws-iam-securite]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [cloud-vs-onprem, regions-az, localstack, aws-cli-awslocal, premier-bucket-s3, premier-utilisateur-iam, console-cli-api-iac]
concepts_en: [cloud-vs-onprem, regions-az, localstack, aws-cli-awslocal, first-s3-bucket, first-iam-user, console-cli-api-iac]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Démarre AWS sans compte, sans carte bancaire, sans facture : LocalStack émule AWS dans Docker sur ta machine. Installe aws-cli et awslocal, comprends régions et zones de disponibilité, crée ton premier bucket S3 et ton premier utilisateur IAM, et maîtrise les 4 façons de parler à AWS (console, CLI, API, IaC). La base du track Solutions Architect Associate (SAA-C03)."
og_description_en: "Start AWS with no account, no credit card, no bill: LocalStack emulates AWS in Docker on your machine. Install aws-cli and awslocal, understand regions and availability zones, create your first S3 bucket and first IAM user, and master the 4 ways to talk to AWS (console, CLI, API, IaC). The base of the Solutions Architect Associate (SAA-C03) track."
---

## intro

:::lang fr
Apprendre AWS, d'habitude, ça commence par : crée un compte, mets une carte bancaire, et prie pour ne pas oublier d'éteindre une ressource qui te facturera 200 € en fin de mois. Pas ici. Dans ce track, tu apprends AWS **entièrement sur ta machine**, grâce à **LocalStack** — un émulateur qui fait tourner les services AWS (S3, IAM, EC2, Lambda, DynamoDB…) dans un conteneur Docker. **Aucun compte, aucune carte, aucune facture, aucun risque.** Les mêmes commandes `aws`, la même API, les mêmes concepts qu'en vrai — mais en local.

Ce guide pose les fondations : tu lances LocalStack, tu installes l'outil en ligne de commande d'AWS (`aws-cli`) et son raccourci local (`awslocal`), tu comprends la géographie d'AWS (**régions** et **zones de disponibilité**), et tu crées tes deux premiers objets : un **bucket S3** (du stockage) et un **utilisateur IAM** (une identité). Tu repars avec le modèle mental des **4 façons de parler à AWS** — console, CLI, API, infrastructure-as-code.

C'est la première marche du track **AWS Solutions Architect Associate (SAA-C03)**, la certification cloud la plus demandée. Tout le track reste local-first ; un guide final t'expliquera comment **passer en réel** proprement, avec les garde-fous de coût, quand tu seras prêt·e.

**Pour qui c'est :** tu connais Docker (tu sais lancer un conteneur) et tu veux apprendre le cloud AWS sans risque financier.

**Quand ce n'est PAS le bon choix :**

- Tu n'as jamais lancé de conteneur → fais d'abord *Docker fondamentaux*, c'est le prérequis dur (LocalStack tourne dans Docker).
- Tu veux **déjà** cliquer dans la vraie console AWS avec ton compte → tu peux, mais ce track t'apprend d'abord les concepts sans facture ; le guide « passer en réel » viendra ensuite.
:::

:::lang en
Learning AWS usually starts with: create an account, put in a credit card, and pray you don't forget to shut down a resource that bills you €200 at month's end. Not here. In this track you learn AWS **entirely on your machine**, thanks to **LocalStack** — an emulator that runs AWS services (S3, IAM, EC2, Lambda, DynamoDB…) inside a Docker container. **No account, no card, no bill, no risk.** The same `aws` commands, the same API, the same concepts as the real thing — but local.

This guide lays the foundations: you launch LocalStack, install AWS's command-line tool (`aws-cli`) and its local shortcut (`awslocal`), understand AWS geography (**regions** and **availability zones**), and create your first two objects: an **S3 bucket** (storage) and an **IAM user** (an identity). You leave with the mental model of the **4 ways to talk to AWS** — console, CLI, API, infrastructure-as-code.

It's the first step of the **AWS Solutions Architect Associate (SAA-C03)** track, the most in-demand cloud certification. The whole track stays local-first; a final guide will show you how to **go real** cleanly, with cost guardrails, when you're ready.

**Who it's for:** you know Docker (you can launch a container) and you want to learn AWS cloud without financial risk.

**When it's NOT the right choice:**

- You've never launched a container → do *Docker fundamentals* first, it's the hard prerequisite (LocalStack runs in Docker).
- You want to **already** click in the real AWS console with your account → you can, but this track teaches the concepts bill-free first; the "go real" guide comes later.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Lancer **LocalStack** (version communautaire, sans jeton) dans Docker et vérifier sa santé.
- Installer et configurer **`aws-cli`** + **`awslocal`** pour parler à LocalStack.
- Expliquer **régions** et **zones de disponibilité** (AZ), et les lister.
- Créer, remplir et lister un **bucket S3**.
- Créer un **utilisateur IAM** et vérifier ton identité avec **STS**.
- Nommer les **4 façons de parler à AWS** (console, CLI, API/SDK, IaC) et savoir quand utiliser laquelle.
:::

:::lang en
By the end of this guide, you can:

- Launch **LocalStack** (community edition, tokenless) in Docker and check its health.
- Install and configure **`aws-cli`** + **`awslocal`** to talk to LocalStack.
- Explain **regions** and **availability zones** (AZs), and list them.
- Create, fill and list an **S3 bucket**.
- Create an **IAM user** and check your identity with **STS**.
- Name the **4 ways to talk to AWS** (console, CLI, API/SDK, IaC) and know when to use each.
:::

## prerequisites

:::lang fr
- **Docker** installé et fonctionnel (`docker run hello-world`). LocalStack tourne dedans.
- **Python 3** + `pip` (pour installer `aws-cli` et `awslocal`).
- ~4 Go de RAM libres et ~2 Go de disque (l'image LocalStack pèse ~1 Go).
- Aucun compte AWS, aucune carte bancaire. C'est tout l'intérêt.
:::

:::lang en
- **Docker** installed and working (`docker run hello-world`). LocalStack runs inside it.
- **Python 3** + `pip` (to install `aws-cli` and `awslocal`).
- ~4 GB free RAM and ~2 GB disk (the LocalStack image is ~1 GB).
- No AWS account, no credit card. That's the whole point.
:::

## concepts

:::lang fr
**Le cloud vs l'on-premise.** « On-premise », c'est tes propres serveurs, chez toi ou en datacenter : tu achètes, tu installes, tu maintiens. Le **cloud** (AWS), c'est louer à la demande la puissance d'Amazon : tu crées un serveur en 30 secondes par une commande, tu paies à l'usage, tu le détruis quand tu veux. Tu ne gères plus le matériel, seulement ta configuration.

**Régions et zones de disponibilité (AZ).** AWS est découpé géographiquement. Une **région** est une zone du monde (`us-east-1` en Virginie, `eu-west-3` à Paris). Chaque région contient plusieurs **zones de disponibilité** (AZ) — des datacenters isolés mais proches (`us-east-1a`, `us-east-1b`…). Répartir une application sur **plusieurs AZ** la rend résistante à la panne d'un datacenter : c'est un pilier de l'examen SAA (haute disponibilité).

**LocalStack.** Un émulateur qui reproduit les **API** d'AWS localement, dans un conteneur Docker écoutant sur le port **4566**. Tu lui envoies exactement les mêmes requêtes qu'à AWS ; il répond pareil. Idéal pour apprendre et tester sans compte ni coût. ⚠️ Il **émule** : il ne fait pas *tourner* de vraies machines EC2, mais il gère leur cycle de vie API (créer, décrire, taguer, supprimer) — parfait pour apprendre l'architecture et les commandes.

**`aws-cli` et `awslocal`.** `aws` est l'outil officiel en ligne de commande d'AWS. Par défaut il parle au vrai AWS ; on lui dit de parler à LocalStack en ajoutant `--endpoint-url=http://localhost:4566`. Comme c'est fastidieux, **`awslocal`** est un raccourci qui ajoute cette option automatiquement. `awslocal s3 ls` = `aws --endpoint-url=http://localhost:4566 s3 ls`.

**IAM et STS.** **IAM** (Identity and Access Management) gère **qui** peut faire **quoi** : utilisateurs, groupes, rôles, permissions. **STS** (Security Token Service) répond à « qui suis-je, là, maintenant ? » via `get-caller-identity`. Ce sont les fondations de la sécurité AWS (tout un guide y est dédié ensuite).

**Les 4 façons de parler à AWS.** (1) La **console** web (cliquer) : pratique pour explorer. (2) La **CLI** (`aws`/`awslocal`) : scriptable, reproductible. (3) L'**API/SDK** : depuis ton code (Python boto3, etc.). (4) L'**IaC** (Terraform, CloudFormation) : décrire l'infra en fichiers versionnés. En pro, on vit surtout en CLI et IaC.
:::

:::lang en
**Cloud vs on-premise.** "On-premise" is your own servers, at home or in a datacenter: you buy, install, maintain. The **cloud** (AWS) is renting Amazon's power on demand: you create a server in 30 seconds with a command, pay per use, destroy it whenever. You no longer manage hardware, only your configuration.

**Regions and availability zones (AZ).** AWS is split geographically. A **region** is a world area (`us-east-1` in Virginia, `eu-west-3` in Paris). Each region contains several **availability zones** (AZs) — isolated but nearby datacenters (`us-east-1a`, `us-east-1b`…). Spreading an application across **several AZs** makes it resilient to a datacenter failure: a pillar of the SAA exam (high availability).

**LocalStack.** An emulator reproducing AWS's **APIs** locally, in a Docker container listening on port **4566**. You send it exactly the same requests as to AWS; it answers the same. Ideal to learn and test with no account or cost. ⚠️ It **emulates**: it doesn't *run* real EC2 machines, but it manages their API lifecycle (create, describe, tag, delete) — perfect to learn architecture and commands.

**`aws-cli` and `awslocal`.** `aws` is AWS's official command-line tool. By default it talks to real AWS; we tell it to talk to LocalStack by adding `--endpoint-url=http://localhost:4566`. Since that's tedious, **`awslocal`** is a shortcut that adds that option automatically. `awslocal s3 ls` = `aws --endpoint-url=http://localhost:4566 s3 ls`.

**IAM and STS.** **IAM** (Identity and Access Management) manages **who** can do **what**: users, groups, roles, permissions. **STS** (Security Token Service) answers "who am I, right now?" via `get-caller-identity`. These are the foundations of AWS security (a whole guide is dedicated to them next).

**The 4 ways to talk to AWS.** (1) The web **console** (clicking): handy to explore. (2) The **CLI** (`aws`/`awslocal`): scriptable, reproducible. (3) The **API/SDK**: from your code (Python boto3, etc.). (4) **IaC** (Terraform, CloudFormation): describe infra in versioned files. In the field, you mostly live in CLI and IaC.
:::

:::figure aws-localstack-setup
caption_fr: "Schéma 1. Le montage local-first : ta machine → aws-cli/awslocal → LocalStack (conteneur Docker sur le port 4566) qui émule les services AWS. Les mêmes commandes qu'en réel, sans compte ni facture."
caption_en: "Figure 1. The local-first setup: your machine → aws-cli/awslocal → LocalStack (Docker container on port 4566) emulating AWS services. The same commands as the real thing, no account or bill."
:::

## walkthrough

:::lang fr
On avance ainsi : lancer LocalStack → installer & configurer aws-cli/awslocal → régions & AZ → premier bucket S3 → premier utilisateur IAM → identité STS → les 4 façons de parler à AWS.
:::

:::lang en
We'll go like this: launch LocalStack → install & configure aws-cli/awslocal → regions & AZs → first S3 bucket → first IAM user → STS identity → the 4 ways to talk to AWS.
:::

### step-01

:::lang fr
**Objectif.** Lancer **LocalStack** dans Docker et vérifier qu'il répond.

**🤔 Pourquoi une version épinglée ?** Le tag `latest` de LocalStack exige désormais un **jeton de licence** (édition Pro) et refuse de démarrer sans (erreur « License activation failed »). On épingle une version **communautaire** (`3.8.1`) qui démarre **sans jeton, sans compte** — fidèle à notre promesse local-first. Le port **4566** est le point d'entrée unique de tous les services AWS émulés.

Lance le conteneur :
:::

:::lang en
**Goal.** Launch **LocalStack** in Docker and check it responds.

**🤔 Why a pinned version?** LocalStack's `latest` tag now requires a **license token** (Pro edition) and refuses to start without one ("License activation failed" error). We pin a **community** version (`3.8.1`) that starts **tokenless, account-free** — true to our local-first promise. Port **4566** is the single entry point for all emulated AWS services.

Launch the container:
:::

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack:3.8.1

# Attendre qu'il soit prêt (statut "healthy") / wait until "healthy"
docker ps --filter name=localstack --format "{{.Names}} {{.Status}}"

# Vérifier la santé des services / check service health
curl -s http://localhost:4566/_localstack/health | head -c 300
```

:::lang fr
**✅ Vérification :** `docker ps` montre `localstack` en `Up ... (healthy)` au bout de ~15-30 s. La requête `health` renvoie un JSON listant des services avec leur état, par exemple `"s3": "available"` (l'état passe à `"running"` une fois le service utilisé), `"iam": "available"`. Si tu vois ce JSON, LocalStack est prêt à recevoir tes commandes AWS. (Si le conteneur `Exited (55)` avec « License activation failed », c'est que tu as utilisé `:latest` au lieu de `:3.8.1` — supprime-le et relance avec la version épinglée.)
:::

:::lang en
**✅ Check:** `docker ps` shows `localstack` as `Up ... (healthy)` after ~15-30 s. The `health` request returns a JSON listing services with their state, e.g. `"s3": "available"` (the state flips to `"running"` once you've used the service), `"iam": "available"`. If you see this JSON, LocalStack is ready for your AWS commands. (If the container `Exited (55)` with "License activation failed", you used `:latest` instead of `:3.8.1` — remove it and relaunch with the pinned version.)
:::

### step-02

:::lang fr
**Objectif.** Installer **`aws-cli`** et **`awslocal`**, et les configurer pour parler à LocalStack.

**🤔 Des identifiants « bidon » ?** LocalStack ne vérifie pas les identifiants — il accepte n'importe quelle clé. On met donc `test`/`test`, une convention universelle pour LocalStack. En réel, ce seraient de vraies clés IAM (le guide sécurité y reviendra). La **région** par défaut sera `us-east-1`, la région historique d'AWS.

Installe et configure :
:::

:::lang en
**Goal.** Install **`aws-cli`** and **`awslocal`**, and configure them to talk to LocalStack.

**🤔 "Dummy" credentials?** LocalStack doesn't verify credentials — it accepts any key. So we use `test`/`test`, a universal LocalStack convention. In real life these would be real IAM keys (the security guide covers that). The default **region** will be `us-east-1`, AWS's historic region.

Install and configure:
:::

```bash
# aws-cli (l'outil officiel) + awslocal (le raccourci LocalStack) / official tool + LocalStack shortcut
pip install awscli awscli-local

# Configurer des identifiants bidon + la région / configure dummy creds + region
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1

# Vérifier : awslocal ajoute --endpoint-url=http://localhost:4566 automatiquement
awslocal sts get-caller-identity
```

:::lang fr
**✅ Vérification :** `awslocal sts get-caller-identity` renvoie un JSON avec un `Account` (souvent `000000000000` en LocalStack), un `UserId` et un `Arn`. Ça prouve que la chaîne complète marche : `awslocal` → LocalStack → réponse. Si tu obtiens « Could not connect to the endpoint URL », LocalStack n'est pas prêt (reviens à l'étape 1). Astuce : `awslocal` est juste `aws --endpoint-url=http://localhost:4566` — si `awslocal` manque, tu peux toujours taper la commande longue.
:::

:::lang en
**✅ Check:** `awslocal sts get-caller-identity` returns a JSON with an `Account` (often `000000000000` in LocalStack), a `UserId` and an `Arn`. It proves the full chain works: `awslocal` → LocalStack → response. If you get "Could not connect to the endpoint URL", LocalStack isn't ready (go back to step 1). Tip: `awslocal` is just `aws --endpoint-url=http://localhost:4566` — if `awslocal` is missing, you can always type the long command.
:::

### step-03

:::lang fr
**Objectif.** Comprendre **régions** et **zones de disponibilité**, et les lister.

**🤔 Pourquoi c'est central au SAA.** L'examen Solutions Architect tourne autour de la **résilience** : répartir sur plusieurs AZ pour survivre à la panne d'un datacenter. Comprendre que `us-east-1` (la région) contient `us-east-1a`, `us-east-1b`… (les AZ) est le premier réflexe d'architecte.
:::

:::lang en
**Goal.** Understand **regions** and **availability zones**, and list them.

**🤔 Why it's central to SAA.** The Solutions Architect exam revolves around **resilience**: spreading across several AZs to survive a datacenter failure. Understanding that `us-east-1` (the region) contains `us-east-1a`, `us-east-1b`… (the AZs) is an architect's first reflex.
:::

```bash
# Lister les zones de disponibilité de la région courante / list AZs of the current region
awslocal ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --output text

# La région vient de ta config ; on peut la surcharger par commande / region from config; override per command
awslocal ec2 describe-availability-zones --region us-east-1 --output table
```

:::lang fr
**✅ Vérification :** la première commande liste plusieurs AZ de `us-east-1` : `us-east-1a us-east-1b us-east-1c ...`. Ce sont les datacenters isolés de la région. Retiens la hiérarchie : **AWS** → **régions** (géographie) → **AZ** (datacenters d'une région) → tes ressources. Une architecture « multi-AZ » place des copies dans **au moins deux** AZ. (LocalStack simule la topologie de `us-east-1` ; en réel chaque région a ses propres AZ, souvent 3.)
:::

:::lang en
**✅ Check:** the first command lists several AZs of `us-east-1`: `us-east-1a us-east-1b us-east-1c ...`. These are the region's isolated datacenters. Remember the hierarchy: **AWS** → **regions** (geography) → **AZs** (a region's datacenters) → your resources. A "multi-AZ" architecture places copies in **at least two** AZs. (LocalStack simulates `us-east-1`'s topology; in reality each region has its own AZs, often 3.)
:::

### step-04

:::lang fr
**Objectif.** Créer ton **premier bucket S3**, y déposer un fichier, le lister — le « hello world » d'AWS.

**🤔 C'est quoi S3 ?** Le stockage d'objets d'AWS : tu ranges des **fichiers** (« objets ») dans des **buckets** (des conteneurs au nom **unique mondialement**). C'est le service le plus utilisé d'AWS — sauvegardes, sites statiques, data lakes. Un guide entier lui est consacré ensuite ; ici on fait le tour du propriétaire.

Crée et remplis un bucket :
:::

:::lang en
**Goal.** Create your **first S3 bucket**, drop a file in it, list it — AWS's "hello world".

**🤔 What is S3?** AWS's object storage: you store **files** ("objects") in **buckets** (containers with a **globally unique** name). It's AWS's most-used service — backups, static sites, data lakes. A whole guide is dedicated to it next; here we take the tour.

Create and fill a bucket:
:::

```bash
# Créer un bucket (mb = make bucket) / create a bucket
awslocal s3 mb s3://mon-premier-bucket

# Y copier un fichier / copy a file into it
echo "Bonjour AWS depuis ma machine" > bonjour.txt
awslocal s3 cp bonjour.txt s3://mon-premier-bucket/bonjour.txt

# Lister le contenu / list the content
awslocal s3 ls s3://mon-premier-bucket/

# Lister tous les buckets / list all buckets
awslocal s3 ls
```

:::lang fr
**✅ Vérification :** `s3 mb` répond `make_bucket: mon-premier-bucket`. `s3 cp` affiche une ligne `upload: ... to s3://...`. `s3 ls s3://mon-premier-bucket/` liste `bonjour.txt` avec sa taille et sa date. Tu viens de stocker un objet dans le cloud (émulé) — la même commande créerait un vrai bucket en réel. ⚠️ En réel, un nom de bucket est **unique dans le monde entier** : `mon-premier-bucket` serait sûrement déjà pris (on préfixe souvent avec un identifiant unique).
:::

:::lang en
**✅ Check:** `s3 mb` answers `make_bucket: mon-premier-bucket`. `s3 cp` prints an `upload: ... to s3://...` line. `s3 ls s3://mon-premier-bucket/` lists `bonjour.txt` with its size and date. You just stored an object in the (emulated) cloud — the same command would create a real bucket for real. ⚠️ In reality, a bucket name is **globally unique**: `mon-premier-bucket` would surely be taken (people often prefix with a unique identifier).
:::

### step-05

:::lang fr
**Objectif.** Créer ton **premier utilisateur IAM** et comprendre les identités AWS.

**🤔 Root vs IAM.** Quand tu ouvres un compte AWS, tu obtiens l'utilisateur **root** — tout-puissant, à **ne quasiment jamais** utiliser. La bonne pratique : créer des **utilisateurs IAM** avec juste les permissions nécessaires. Ici tu crées un utilisateur `dev` et tu lui attaches une permission gérée par AWS (lecture seule sur S3).

Crée l'utilisateur et attache une politique :
:::

:::lang en
**Goal.** Create your **first IAM user** and understand AWS identities.

**🤔 Root vs IAM.** When you open an AWS account, you get the **root** user — all-powerful, to be used **almost never**. Best practice: create **IAM users** with just the needed permissions. Here you create a `dev` user and attach an AWS-managed permission (read-only on S3).

Create the user and attach a policy:
:::

```bash
# Créer un utilisateur IAM / create an IAM user
awslocal iam create-user --user-name dev

# Lui donner un accès en LECTURE SEULE à S3 (politique gérée par AWS) / grant S3 read-only (AWS-managed policy)
awslocal iam attach-user-policy --user-name dev \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Vérifier ce qui lui est attaché / check what's attached
awslocal iam list-attached-user-policies --user-name dev
```

:::lang fr
**✅ Vérification :** `create-user` renvoie un JSON avec le `UserName` (`dev`) et un `Arn` de la forme `arn:aws:iam::000000000000:user/dev`. `list-attached-user-policies` montre `AmazonS3ReadOnlyAccess`. Cet **ARN** (Amazon Resource Name) est l'identifiant unique de chaque ressource AWS — tu en verras partout. Tu viens de créer une identité et de lui donner une permission précise : c'est le cœur de la sécurité AWS, approfondi au guide suivant.
:::

:::lang en
**✅ Check:** `create-user` returns a JSON with the `UserName` (`dev`) and an `Arn` like `arn:aws:iam::000000000000:user/dev`. `list-attached-user-policies` shows `AmazonS3ReadOnlyAccess`. This **ARN** (Amazon Resource Name) is the unique identifier of every AWS resource — you'll see them everywhere. You just created an identity and gave it a precise permission: the heart of AWS security, deepened in the next guide.
:::

### step-06

:::lang fr
**Objectif.** Explorer une ressource par la **CLI** avec des **requêtes** (`--query`) et différents **formats de sortie** — la boîte à outils du quotidien.

**🤔 Pourquoi `--query` et `--output`.** Les réponses AWS sont de gros JSON. `--query` (langage **JMESPath**) extrait juste ce qui t'intéresse ; `--output` choisit le format (`json`, `table`, `text`). Maîtriser ça, c'est diviser par dix le temps passé à lire des sorties.

Joue avec les formats :
:::

:::lang en
**Goal.** Explore a resource via the **CLI** with **queries** (`--query`) and different **output formats** — the daily toolbox.

**🤔 Why `--query` and `--output`.** AWS responses are big JSON. `--query` (the **JMESPath** language) extracts just what you want; `--output` chooses the format (`json`, `table`, `text`). Mastering this cuts the time spent reading outputs tenfold.

Play with the formats:
:::

```bash
# Tout le JSON (verbeux) / all the JSON (verbose)
awslocal iam list-users

# Juste les noms d'utilisateurs, en texte / just the usernames, as text
awslocal iam list-users --query 'Users[].UserName' --output text

# Un tableau lisible / a readable table
awslocal iam list-users --query 'Users[].[UserName,Arn]' --output table

# Filtrer : l'utilisateur dont le nom est "dev" / filter: the user named "dev"
awslocal iam list-users --query "Users[?UserName=='dev'].Arn" --output text
```

:::lang fr
**✅ Vérification :** la commande `--query 'Users[].UserName'` renvoie `dev` (ta liste d'utilisateurs). Le `--output table` dessine un tableau ASCII avec nom et ARN. La requête filtrée `Users[?UserName=='dev']` ne renvoie que l'ARN de `dev`. Ces trois options (`--query`, `--output`, filtres JMESPath) reviennent dans **chaque** commande AWS — c'est un investissement qui paie sur tout le track.
:::

:::lang en
**✅ Check:** the `--query 'Users[].UserName'` command returns `dev` (your user list). `--output table` draws an ASCII table with name and ARN. The filtered query `Users[?UserName=='dev']` returns only `dev`'s ARN. These three options (`--query`, `--output`, JMESPath filters) come back in **every** AWS command — an investment that pays off across the whole track.
:::

### step-07

:::lang fr
**Objectif.** Ancrer le modèle mental des **4 façons de parler à AWS**, et ranger ton atelier.

**🤔 Pourquoi ça compte.** Un architecte choisit le bon outil : la **console** pour explorer/déboguer, la **CLI** pour les actions ponctuelles et les scripts, l'**API/SDK** depuis une application, l'**IaC** pour tout ce qui doit être reproductible et versionné (la prod). Ce track te fait vivre surtout **CLI** (ce guide) et **IaC** (Terraform, plus loin) — les deux compétences pro.
:::

:::lang en
**Goal.** Anchor the mental model of the **4 ways to talk to AWS**, and tidy your workshop.

**🤔 Why it matters.** An architect picks the right tool: the **console** to explore/debug, the **CLI** for one-off actions and scripts, the **API/SDK** from an application, **IaC** for everything that must be reproducible and versioned (production). This track has you live mostly in **CLI** (this guide) and **IaC** (Terraform, later) — the two pro skills.
:::

```bash
# 2) CLI — ce que tu viens de faire / what you just did
awslocal s3 ls

# 3) API/SDK — le même appel depuis Python (aperçu) / the same call from Python (preview)
#    python3 -c "import boto3; print(boto3.client('s3', endpoint_url='http://localhost:4566').list_buckets())"

# Ranger : vider puis supprimer le bucket, détacher puis supprimer l'utilisateur
# Tidy: empty then delete the bucket, detach then delete the user
awslocal s3 rb s3://mon-premier-bucket --force
awslocal iam detach-user-policy --user-name dev --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
awslocal iam delete-user --user-name dev

# Optionnel : arrêter LocalStack (l'état est éphémère par défaut) / optional: stop LocalStack (state is ephemeral by default)
# docker stop localstack && docker rm localstack
```

:::lang fr
**✅ Vérification :** `s3 rb --force` vide et supprime le bucket (plus rien dans `awslocal s3 ls`). `delete-user` retire `dev` (après avoir **détaché** sa politique — on ne peut pas supprimer un utilisateur qui a des politiques attachées). Tu as bouclé un cycle complet : créer → utiliser → nettoyer. ⚠️ Réflexe **crucial** en réel : **toujours nettoyer** ce que tu crées (une ressource oubliée = une facture). En LocalStack, l'état est éphémère (perdu à l'arrêt du conteneur) — mais prends l'habitude tout de suite.
:::

:::lang en
**✅ Check:** `s3 rb --force` empties and deletes the bucket (nothing left in `awslocal s3 ls`). `delete-user` removes `dev` (after **detaching** its policy — you can't delete a user with attached policies). You closed a full cycle: create → use → clean up. ⚠️ **Crucial** real-world reflex: **always clean up** what you create (a forgotten resource = a bill). In LocalStack, state is ephemeral (lost when the container stops) — but build the habit right now.
:::

## pitfalls

:::lang fr
**1. Utiliser `:latest` de LocalStack.** Le tag `latest` exige un jeton de licence et sort en `Exited (55)`. Épingle une version communautaire (`localstack/localstack:3.8.1`) qui démarre sans compte.

**2. Oublier `awslocal` et taper `aws`.** `aws` tout court parle au **vrai** AWS (et échouera faute d'identifiants, ou pire, agira sur un vrai compte). Pour LocalStack, c'est **`awslocal`** (ou `aws --endpoint-url=http://localhost:4566`).

**3. Croire que LocalStack fait tourner de vraies machines.** Il **émule les API**. Un `run-instances` EC2 « crée » une instance côté API (tu peux la décrire, la taguer, la supprimer) mais aucun OS ne démarre réellement. C'est parfait pour apprendre l'architecture et les commandes, pas pour héberger un vrai service.

**4. Supprimer un utilisateur IAM sans détacher ses politiques.** `delete-user` échoue si des politiques (ou clés, groupes) sont attachées. Détache d'abord, supprime ensuite. Même logique en réel.

**5. Nom de bucket S3 non unique (en réel).** En réel, `mon-premier-bucket` est probablement pris — les noms sont **mondiaux**. Préfixe avec quelque chose d'unique. En LocalStack, pas de collision, mais prends déjà l'habitude.

**6. Confondre région et AZ.** La **région** est géographique (`eu-west-3` = Paris) ; l'**AZ** est un datacenter dans cette région (`eu-west-3a`). Le SAA teste sans cesse le multi-AZ : ne les confonds pas.

**7. Oublier de nettoyer.** En LocalStack c'est gratuit, mais en réel une ressource oubliée facture. Prends le réflexe `create → use → destroy` dès maintenant.
:::

:::lang en
**1. Using LocalStack's `:latest`.** The `latest` tag requires a license token and exits with `Exited (55)`. Pin a community version (`localstack/localstack:3.8.1`) that starts account-free.

**2. Forgetting `awslocal` and typing `aws`.** Plain `aws` talks to **real** AWS (and will fail for lack of credentials, or worse, act on a real account). For LocalStack it's **`awslocal`** (or `aws --endpoint-url=http://localhost:4566`).

**3. Thinking LocalStack runs real machines.** It **emulates the APIs**. An EC2 `run-instances` "creates" an instance API-side (you can describe, tag, delete it) but no OS actually boots. Perfect to learn architecture and commands, not to host a real service.

**4. Deleting an IAM user without detaching its policies.** `delete-user` fails if policies (or keys, groups) are attached. Detach first, delete after. Same logic in real life.

**5. Non-unique S3 bucket name (in reality).** In reality, `mon-premier-bucket` is probably taken — names are **global**. Prefix with something unique. In LocalStack, no collision, but build the habit already.

**6. Confusing region and AZ.** The **region** is geographic (`eu-west-3` = Paris); the **AZ** is a datacenter within it (`eu-west-3a`). SAA tests multi-AZ constantly: don't confuse them.

**7. Forgetting to clean up.** In LocalStack it's free, but in reality a forgotten resource bills. Build the `create → use → destroy` reflex now.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] LocalStack tourne (`healthy`) et `health` liste `s3`/`iam` disponibles.
- [ ] `awslocal sts get-caller-identity` renvoie ton identité.
- [ ] Tu expliques région vs AZ et tu listes les AZ de `us-east-1`.
- [ ] Tu crées un bucket S3, y déposes un fichier, le listes.
- [ ] Tu crées un utilisateur IAM et lui attaches une politique gérée.
- [ ] Tu extrais une valeur précise avec `--query` (JMESPath).
- [ ] Tu nommes les 4 façons de parler à AWS et tu nettoies tes ressources.

Sept cases = ton labo AWS local tourne, tu tiens les bases. La suite : la sécurité IAM en profondeur.
:::

:::lang en
You know it works when…

- [ ] LocalStack runs (`healthy`) and `health` lists `s3`/`iam` available.
- [ ] `awslocal sts get-caller-identity` returns your identity.
- [ ] You explain region vs AZ and list `us-east-1`'s AZs.
- [ ] You create an S3 bucket, drop a file, list it.
- [ ] You create an IAM user and attach a managed policy.
- [ ] You extract a precise value with `--query` (JMESPath).
- [ ] You name the 4 ways to talk to AWS and clean up your resources.

Seven boxes = your local AWS lab runs, you hold the basics. Next up: IAM security in depth.
:::

## next

:::lang fr
La suite du track AWS → SAA-C03 :

1. **AWS — IAM & sécurité** : utilisateurs, groupes, **rôles**, politiques JSON (moindre privilège), évaluation des permissions, et le modèle de responsabilité partagée. Le socle de sécurité de l'examen.
2. Plus loin : S3 en profondeur, réseau VPC, compute (EC2/Lambda), découplage (SQS/SNS/DynamoDB), le **projet d'entreprise** serverless, et enfin **passer en réel** proprement.
:::

:::lang en
The AWS → SAA-C03 track continues:

1. **AWS — IAM & security**: users, groups, **roles**, JSON policies (least privilege), permission evaluation, and the shared responsibility model. The exam's security foundation.
2. Further along: S3 in depth, VPC networking, compute (EC2/Lambda), decoupling (SQS/SNS/DynamoDB), the serverless **enterprise project**, and finally **going real** cleanly.
:::

## cheatsheet

:::lang fr
Aide-mémoire AWS local.
:::

:::lang en
AWS local cheat sheet.
:::

```bash
# LocalStack
docker run -d --name localstack -p 4566:4566 localstack/localstack:3.8.1
curl -s http://localhost:4566/_localstack/health        # santé des services / service health
docker stop localstack && docker rm localstack          # arrêter (état éphémère) / stop (ephemeral state)

# Config aws-cli (identifiants bidon pour LocalStack) / dummy creds for LocalStack
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1

# awslocal = aws --endpoint-url=http://localhost:4566
awslocal sts get-caller-identity                        # qui suis-je / who am I
awslocal ec2 describe-availability-zones --output table # les AZ / the AZs

# S3
awslocal s3 mb s3://bucket ; awslocal s3 cp f s3://bucket/ ; awslocal s3 ls s3://bucket/
awslocal s3 rb s3://bucket --force                      # vider + supprimer / empty + delete

# IAM
awslocal iam create-user --user-name dev
awslocal iam attach-user-policy --user-name dev --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Sortie / Output
--query 'Users[].UserName'   --output text|table|json   # JMESPath + format
```

## resources

:::lang fr
- [Documentation LocalStack](https://docs.localstack.cloud/) — services couverts, configuration.
- [AWS CLI — référence des commandes](https://docs.aws.amazon.com/cli/latest/reference/) — toutes les commandes `aws`.
- [Régions et zones de disponibilité AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) — la géographie officielle.
- [JMESPath (le langage de `--query`)](https://jmespath.org/tutorial.html) — extraire et filtrer les sorties.
- [Certification AWS Solutions Architect Associate (SAA-C03)](https://aws.amazon.com/certification/certified-solutions-architect-associate/) — la certification visée.
:::

:::lang en
- [LocalStack documentation](https://docs.localstack.cloud/) — covered services, configuration.
- [AWS CLI — command reference](https://docs.aws.amazon.com/cli/latest/reference/) — all `aws` commands.
- [AWS regions and availability zones](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html) — the official geography.
- [JMESPath (the `--query` language)](https://jmespath.org/tutorial.html) — extract and filter outputs.
- [AWS Solutions Architect Associate (SAA-C03) certification](https://aws.amazon.com/certification/certified-solutions-architect-associate/) — the target certification.
:::

## troubleshooting

:::lang fr
**`Could not connect to the endpoint URL: "http://localhost:4566/"`.** LocalStack n'est pas démarré ou pas encore prêt. Vérifie `docker ps` et attends le statut `healthy` ; teste `curl http://localhost:4566/_localstack/health`.

**Le conteneur `Exited (55)` — « License activation failed ».** Tu utilises `:latest` (qui exige un jeton Pro). Supprime-le (`docker rm -f localstack`) et relance avec `localstack/localstack:3.8.1`.

**`awslocal: command not found`.** `awscli-local` n'est pas installé (`pip install awscli-local`), ou pas dans le `PATH`. Contourne avec `aws --endpoint-url=http://localhost:4566 ...`.

**`Unable to locate credentials`.** Tu n'as pas configuré les identifiants bidon. Lance les trois `aws configure set ...` de l'étape 2 (LocalStack accepte n'importe quelle valeur, mais l'outil `aws` en exige une).

**`delete-user` échoue avec `DeleteConflict`.** L'utilisateur a des politiques (ou clés/groupes) attachés. Détache-les d'abord (`detach-user-policy`), puis supprime.

**Un port 4566 déjà utilisé.** Un autre conteneur/process occupe le port. Arrête-le, ou mappe un autre port (`-p 4567:4566`) et adapte l'endpoint.
:::

:::lang en
**`Could not connect to the endpoint URL: "http://localhost:4566/"`.** LocalStack isn't started or not ready yet. Check `docker ps` and wait for `healthy`; test `curl http://localhost:4566/_localstack/health`.

**The container `Exited (55)` — "License activation failed".** You're using `:latest` (which requires a Pro token). Remove it (`docker rm -f localstack`) and relaunch with `localstack/localstack:3.8.1`.

**`awslocal: command not found`.** `awscli-local` isn't installed (`pip install awscli-local`), or not on the `PATH`. Work around with `aws --endpoint-url=http://localhost:4566 ...`.

**`Unable to locate credentials`.** You didn't configure the dummy credentials. Run the three `aws configure set ...` from step 2 (LocalStack accepts any value, but the `aws` tool requires one).

**`delete-user` fails with `DeleteConflict`.** The user has attached policies (or keys/groups). Detach them first (`detach-user-policy`), then delete.

**Port 4566 already in use.** Another container/process holds the port. Stop it, or map another port (`-p 4567:4566`) and adjust the endpoint.
:::
