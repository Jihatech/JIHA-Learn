---
# — Identité (ne change JAMAIS une fois publié) —
id: aws-compute-ec2-lambda
slug: aws-compute-ec2-lambda
order: 48
status: published

# — Titres & accroches (bilingue) —
title_fr: "AWS — compute : EC2 & Lambda"
title_en: "AWS — compute: EC2 & Lambda"
tagline_fr: "instances EC2, AMI, user-data, fonctions Lambda, événementiel."
tagline_en: "EC2 instances, AMIs, user-data, Lambda functions, event-driven."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 220
repo: "localstack/localstack"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [aws-reseau-vpc]
next: [aws-decouplage-messagerie]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [instances-ec2, types-instances, amis, user-data, fonctions-lambda, modele-evenementiel, ec2-vs-lambda]
concepts_en: [ec2-instances, instance-types, amis, user-data, lambda-functions, event-driven, ec2-vs-lambda]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le compute AWS pour le SAA-C03 : lancer des machines virtuelles EC2 (paires de clés, AMI, types d'instances, user-data, cycle de vie, EBS), puis le serverless avec Lambda (rôle d'exécution, packaging, création, invocation, configuration, modèle événementiel avec déclencheurs S3). Et surtout : choisir entre serveur (EC2) et sans-serveur (Lambda). Tout en LocalStack (Lambda avec le socket Docker monté)."
og_description_en: "AWS compute for SAA-C03: launch EC2 virtual machines (key pairs, AMIs, instance types, user-data, lifecycle, EBS), then serverless with Lambda (execution role, packaging, creation, invocation, configuration, event-driven model with S3 triggers). And above all: choosing between server (EC2) and serverless (Lambda). All on LocalStack (Lambda with the Docker socket mounted)."
---

## intro

:::lang fr
« Compute », c'est **là où ton code s'exécute**. AWS offre deux grandes familles, aux philosophies opposées, et le SAA t'oblige à savoir choisir. **EC2** (Elastic Compute Cloud), ce sont des **machines virtuelles** : tu loues un serveur, tu l'administres (OS, paquets, mise à l'échelle), tu paies tant qu'il tourne. **Lambda**, c'est le **serverless** : tu déposes une **fonction**, AWS l'exécute **à la demande** (sur événement), la met à l'échelle automatiquement, et tu ne paies **que le temps d'exécution** — zéro serveur à gérer, zéro coût au repos.

Ce guide te fait vivre les deux. Côté **EC2** : une paire de clés, une AMI, le lancement d'une instance avec un script de démarrage (**user-data**), les **types d'instances**, le cycle de vie (start/stop/terminate) et le stockage **EBS**. Côté **Lambda** : le rôle d'exécution, l'empaquetage d'une fonction, sa création, son **invocation**, sa configuration (mémoire, timeout, variables), et le **modèle événementiel** — le vrai super-pouvoir du serverless : une fonction qui **réagit** à un dépôt de fichier S3.

Point d'outillage : **Lambda a besoin que LocalStack puisse accéder à Docker** pour exécuter les fonctions. On lance donc LocalStack en **montant le socket Docker** (`-v /var/run/docker.sock:/var/run/docker.sock`) — c'est la configuration recommandée, on l'explique au moment venu. EC2, lui, marche sans.

**Pour qui c'est :** tu as le réseau VPC en main et tu veux enfin faire tourner du code sur AWS.

**Quand ce n'est PAS le bon choix :**

- Tu ne maîtrises pas les sous-réseaux/SG → refais *réseau VPC* (une instance vit dans un sous-réseau, derrière un SG).
- Tu cherches des conteneurs managés (ECS/EKS/Fargate) → c'est un autre pan du compute, non couvert ici ; on pose EC2 et Lambda, les deux fondamentaux du SAA.
:::

:::lang en
"Compute" is **where your code runs**. AWS offers two big families with opposite philosophies, and the SAA forces you to know how to choose. **EC2** (Elastic Compute Cloud) is **virtual machines**: you rent a server, you administer it (OS, packages, scaling), you pay while it runs. **Lambda** is **serverless**: you drop a **function**, AWS runs it **on demand** (on an event), auto-scales it, and you pay **only for execution time** — zero servers to manage, zero cost at rest.

This guide has you live both. On the **EC2** side: a key pair, an AMI, launching an instance with a startup script (**user-data**), **instance types**, the lifecycle (start/stop/terminate) and **EBS** storage. On the **Lambda** side: the execution role, packaging a function, its creation, its **invocation**, its configuration (memory, timeout, variables), and the **event-driven model** — serverless's real superpower: a function that **reacts** to an S3 file upload.

A tooling note: **Lambda needs LocalStack to access Docker** to run functions. So we launch LocalStack **mounting the Docker socket** (`-v /var/run/docker.sock:/var/run/docker.sock`) — the recommended config, explained when the time comes. EC2 works without it.

**Who it's for:** you hold VPC networking and you finally want to run code on AWS.

**When it's NOT the right choice:**

- You're not comfortable with subnets/SGs → redo *VPC networking* (an instance lives in a subnet, behind an SG).
- You want managed containers (ECS/EKS/Fargate) → that's another compute area, not covered here; we lay EC2 and Lambda, the SAA's two fundamentals.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Créer une **paire de clés** et trouver une **AMI** pour lancer une instance.
- Lancer une **instance EC2** avec un **user-data**, et lire ses métadonnées.
- Gérer le **cycle de vie** (stop/start/terminate) et comprendre **types d'instances** et **EBS**.
- Lancer LocalStack **avec le socket Docker** pour activer Lambda.
- Créer une **fonction Lambda** (rôle, package, `create-function`) et l'**invoquer**.
- **Configurer** une fonction (mémoire, timeout, variables d'environnement).
- Câbler un **déclencheur événementiel** (un dépôt S3 qui invoque la fonction) et choisir **EC2 vs Lambda**.
:::

:::lang en
By the end of this guide, you can:

- Create a **key pair** and find an **AMI** to launch an instance.
- Launch an **EC2 instance** with **user-data**, and read its metadata.
- Manage the **lifecycle** (stop/start/terminate) and understand **instance types** and **EBS**.
- Launch LocalStack **with the Docker socket** to enable Lambda.
- Create a **Lambda function** (role, package, `create-function`) and **invoke** it.
- **Configure** a function (memory, timeout, environment variables).
- Wire an **event-driven trigger** (an S3 upload that invokes the function) and choose **EC2 vs Lambda**.
:::

## prerequisites

:::lang fr
- Les guides AWS précédents du track (jusqu'au **réseau VPC**).
- **LocalStack** et **`awslocal`**. Pour la partie Lambda, on (re)lancera LocalStack **avec le socket Docker monté** (étape 4) — commande donnée sur place.
- **aws-cli v2** recommandé (les fonctions Lambda utilisent `--cli-binary-format`, une option de la v2). Vérifie : `aws --version` → `aws-cli/2.x`.
- `zip` installé (pour empaqueter la fonction Lambda).
:::

:::lang en
- The previous AWS track guides (through **VPC networking**).
- **LocalStack** and **`awslocal`**. For the Lambda part, we'll (re)launch LocalStack **with the Docker socket mounted** (step 4) — command given there.
- **aws-cli v2** recommended (Lambda functions use `--cli-binary-format`, a v2 option). Check: `aws --version` → `aws-cli/2.x`.
- `zip` installed (to package the Lambda function).
:::

## concepts

:::lang fr
**EC2 (machine virtuelle).** Un serveur virtuel que tu loues. Tu choisis une **AMI** (Amazon Machine Image — le modèle d'OS/logiciels de départ), un **type d'instance** (la taille : CPU/RAM, ex. `t2.micro`), un **sous-réseau** et un **groupe de sécurité** (vus au guide VPC), et une **paire de clés** (pour t'y connecter en SSH). L'instance démarre, tu paies à la seconde tant qu'elle tourne.

**Types d'instances.** Des familles optimisées : `t` (usage général, économique, avec crédits CPU), `m` (équilibré), `c` (calcul), `r` (mémoire), etc., déclinées en tailles (`.micro`, `.large`…). Choisir le bon type selon la charge est un sujet coût/performance du SAA.

**User-data.** Un **script exécuté au tout premier démarrage** de l'instance (installer un serveur web, configurer l'app). C'est la façon standard d'**automatiser la mise en route** d'une instance sans image personnalisée.

**EBS (Elastic Block Store).** Le **disque** d'une instance : un volume réseau persistant, attaché à l'instance, qui survit à un stop/start (mais pas forcément à un terminate, selon le réglage). C'est le stockage « bloc » (comme un disque dur), à distinguer de S3 (stockage « objet »).

**Lambda (serverless).** Tu fournis une **fonction** (du code + un **handler**, le point d'entrée) et un **runtime** (Python, Node…). AWS l'exécute **à la demande**, à chaque **événement** (requête HTTP, message, dépôt de fichier…), met à l'échelle **automatiquement** de 0 à des milliers d'exécutions parallèles, et facture **au temps d'exécution** (à la milliseconde). Au repos : **rien à payer**.

**Rôle d'exécution.** Une fonction Lambda **endosse un rôle IAM** (guide IAM) pour agir sur AWS (lire S3, écrire en base). Pas de clés dans le code : des permissions via un rôle.

**Modèle événementiel.** Le cœur du serverless : une fonction ne « tourne » pas en continu, elle **réagit** à une **source d'événement** — un objet déposé dans S3, un message dans une file SQS, une requête via API Gateway, un planning EventBridge. C'est ce qui permet des architectures **découplées** et **élastiques** (sujet central du SAA, approfondi au guide suivant).

**EC2 vs Lambda.** EC2 = contrôle total, charge **continue/longue**, tu gères le serveur. Lambda = zéro serveur, charge **ponctuelle/événementielle**, mise à l'échelle et coût automatiques, mais contraintes (durée max ~15 min, taille du package, démarrage à froid). L'architecte choisit selon la charge.
:::

:::lang en
**EC2 (virtual machine).** A virtual server you rent. You pick an **AMI** (Amazon Machine Image — the starting OS/software template), an **instance type** (the size: CPU/RAM, e.g. `t2.micro`), a **subnet** and a **security group** (seen in the VPC guide), and a **key pair** (to SSH in). The instance boots, you pay by the second while it runs.

**Instance types.** Optimized families: `t` (general purpose, economical, with CPU credits), `m` (balanced), `c` (compute), `r` (memory), etc., in sizes (`.micro`, `.large`…). Choosing the right type by workload is an SAA cost/performance topic.

**User-data.** A **script run at the instance's very first boot** (install a web server, configure the app). It's the standard way to **automate an instance's startup** without a custom image.

**EBS (Elastic Block Store).** An instance's **disk**: a persistent network volume, attached to the instance, that survives a stop/start (but not necessarily a terminate, depending on the setting). It's "block" storage (like a hard drive), distinct from S3 ("object" storage).

**Lambda (serverless).** You provide a **function** (code + a **handler**, the entry point) and a **runtime** (Python, Node…). AWS runs it **on demand**, on each **event** (HTTP request, message, file upload…), auto-scales from 0 to thousands of parallel executions, and bills **per execution time** (to the millisecond). At rest: **nothing to pay**.

**Execution role.** A Lambda function **assumes an IAM role** (IAM guide) to act on AWS (read S3, write to a database). No keys in the code: permissions via a role.

**Event-driven model.** Serverless's core: a function doesn't "run" continuously, it **reacts** to an **event source** — an object dropped in S3, a message in an SQS queue, a request via API Gateway, an EventBridge schedule. That's what enables **decoupled** and **elastic** architectures (an SAA central topic, deepened in the next guide).

**EC2 vs Lambda.** EC2 = full control, **continuous/long** workload, you manage the server. Lambda = zero servers, **occasional/event-driven** workload, automatic scaling and cost, but constraints (max duration ~15 min, package size, cold start). The architect chooses by workload.
:::

:::figure aws-ec2-vs-lambda
caption_fr: "Schéma 1. Deux modèles de compute : EC2 (une VM que tu administres, qui tourne en continu et se paie au temps de fonctionnement) vs Lambda (une fonction qui réagit à un événement, scale de 0 à N automatiquement, se paie au temps d'exécution)."
caption_en: "Figure 1. Two compute models: EC2 (a VM you administer, running continuously and billed for uptime) vs Lambda (a function reacting to an event, scaling 0 to N automatically, billed for execution time)."
:::

## walkthrough

:::lang fr
On avance ainsi : paire de clés & AMI → lancer une instance EC2 → cycle de vie & EBS → LocalStack + socket & première fonction Lambda → invoquer & configurer → déclencheur événementiel S3 → EC2 vs Lambda & nettoyage.
:::

:::lang en
We'll go like this: key pair & AMI → launch an EC2 instance → lifecycle & EBS → LocalStack + socket & first Lambda function → invoke & configure → S3 event trigger → EC2 vs Lambda & cleanup.
:::

### step-01

:::lang fr
**Objectif.** Créer une **paire de clés** et trouver une **AMI** — les deux prérequis pour lancer une instance.

**🤔 Clé et AMI, pourquoi.** La **paire de clés** te permettra de te connecter en SSH à l'instance (AWS installe ta clé publique dedans). L'**AMI** est le modèle de départ : quel OS, quels logiciels préinstallés. On récupère un ID d'AMI disponible pour lancer notre instance.

Crée la clé et repère une AMI :
:::

:::lang en
**Goal.** Create a **key pair** and find an **AMI** — the two prerequisites to launch an instance.

**🤔 Key and AMI, why.** The **key pair** lets you SSH into the instance (AWS installs your public key in it). The **AMI** is the starting template: which OS, which preinstalled software. We grab an available AMI ID to launch our instance.

Create the key and find an AMI:
:::

```bash
# Créer une paire de clés (la clé privée est renvoyée une seule fois) / create a key pair
awslocal ec2 create-key-pair --key-name lab-key \
  --query 'KeyName' --output text

# Repérer une AMI disponible / find an available AMI
AMI=$(awslocal ec2 describe-images --query 'Images[0].ImageId' --output text)
echo "AMI = $AMI"
```

:::lang fr
**✅ Vérification :** `create-key-pair` renvoie `lab-key`. En réel, cette commande te renvoie aussi la **clé privée** (`KeyMaterial`) — à sauver **immédiatement**, AWS ne te la redonnera jamais. `describe-images` te donne un ID d'AMI (`ami-xxxxxxxx`) stocké dans `$AMI`. ⚠️ Garde le shell ouvert : `$AMI` sert à l'étape suivante. (En réel, on choisit une AMI précise — Amazon Linux, Ubuntu… — via des filtres ; en LocalStack, on prend la première disponible.)
:::

:::lang en
**✅ Check:** `create-key-pair` returns `lab-key`. In real AWS, this command also returns the **private key** (`KeyMaterial`) — save it **immediately**, AWS will never give it back. `describe-images` gives you an AMI ID (`ami-xxxxxxxx`) stored in `$AMI`. ⚠️ Keep the shell open: `$AMI` is used in the next step. (In real AWS, you pick a specific AMI — Amazon Linux, Ubuntu… — via filters; in LocalStack, we take the first available.)
:::

### step-02

:::lang fr
**Objectif.** Lancer une **instance EC2** avec un script de démarrage (**user-data**).

**🤔 Le user-data.** Plutôt que de te connecter à l'instance pour l'installer à la main, tu fournis un **script** qui s'exécute au **premier démarrage** : installer nginx, configurer l'app… C'est la base de l'automatisation EC2 (et le pont vers Ansible/IaC). On le passe encodé à `run-instances`.

Prépare le user-data et lance l'instance :
:::

:::lang en
**Goal.** Launch an **EC2 instance** with a startup script (**user-data**).

**🤔 User-data.** Rather than connecting to the instance to set it up by hand, you provide a **script** that runs at **first boot**: install nginx, configure the app… It's the basis of EC2 automation (and the bridge to Ansible/IaC). We pass it to `run-instances`.

Prepare the user-data and launch the instance:
:::

```bash
# Un script de démarrage / a startup script
cat > user-data.sh <<'EOF'
#!/bin/bash
echo "Instance démarrée le $(date)" > /var/log/demarrage.txt
EOF

# Lancer l'instance (type t2.micro, notre clé, le user-data) / launch the instance
IID=$(awslocal ec2 run-instances \
  --image-id "$AMI" --instance-type t2.micro --key-name lab-key \
  --user-data file://user-data.sh \
  --query 'Instances[0].InstanceId' --output text)
echo "Instance = $IID"

# Décrire l'instance / describe the instance
awslocal ec2 describe-instances --instance-ids "$IID" \
  --query 'Reservations[0].Instances[0].[InstanceId,InstanceType,State.Name]' --output text
```

:::lang fr
**✅ Vérification :** `run-instances` renvoie un ID `i-xxxxxxxx` (dans `$IID`). `describe-instances` affiche `i-... t2.micro running` — ton instance tourne. Tu viens de lancer un serveur virtuel en une commande, avec un script de démarrage. ⚠️ En LocalStack, l'instance est **émulée au niveau API** : elle passe bien à l'état `running`, tu peux la décrire/taguer/arrêter, mais **aucun vrai OS ne démarre** (le user-data ne s'exécute pas réellement). C'est parfait pour apprendre le cycle de vie et les commandes ; pour un vrai OS, il faut le vrai AWS.
:::

:::lang en
**✅ Check:** `run-instances` returns an ID `i-xxxxxxxx` (in `$IID`). `describe-instances` shows `i-... t2.micro running` — your instance runs. You just launched a virtual server in one command, with a startup script. ⚠️ In LocalStack, the instance is **emulated at the API level**: it does go to `running`, you can describe/tag/stop it, but **no real OS boots** (the user-data doesn't actually run). Perfect to learn the lifecycle and commands; for a real OS, you need real AWS.
:::

### step-03

:::lang fr
**Objectif.** Gérer le **cycle de vie** de l'instance et comprendre **types** et **EBS**.

**🤔 Le cycle de vie.** Une instance passe par des états : `running` → `stopped` (arrêtée, tu ne paies plus le compute mais gardes le disque EBS) → `running` (redémarrée) → `terminated` (détruite, définitivement). Bien gérer ces états, c'est maîtriser le **coût** : on **arrête** une instance inutilisée, on **termine** ce qui ne sert plus.

Joue le cycle de vie et tague :
:::

:::lang en
**Goal.** Manage the instance **lifecycle** and understand **types** and **EBS**.

**🤔 The lifecycle.** An instance goes through states: `running` → `stopped` (stopped, you stop paying for compute but keep the EBS disk) → `running` (restarted) → `terminated` (destroyed, permanently). Managing these states well is mastering **cost**: you **stop** an unused instance, **terminate** what's no longer needed.

Run the lifecycle and tag:
:::

```bash
# Taguer l'instance / tag the instance
awslocal ec2 create-tags --resources "$IID" --tags Key=Name,Value=serveur-web

# Arrêter (on garde le disque EBS, on ne paie plus le compute) / stop (keep EBS, stop paying compute)
awslocal ec2 stop-instances --instance-ids "$IID" --query 'StoppingInstances[0].CurrentState.Name' --output text

# Redémarrer / start again
awslocal ec2 start-instances --instance-ids "$IID" --query 'StartingInstances[0].CurrentState.Name' --output text

# Voir le volume EBS attaché / see the attached EBS volume
awslocal ec2 describe-volumes --query 'Volumes[0].[VolumeId,Size,State]' --output text
```

:::lang fr
**✅ Vérification :** `stop-instances` renvoie `stopping` puis l'instance passe `stopped` ; `start-instances` la repasse `pending`/`running`. `describe-volumes` montre un volume **EBS** (`vol-...`) avec sa taille — c'est le **disque** de ton instance, persistant à travers stop/start. Retiens la logique de coût : **stopped** = tu paies le stockage EBS mais pas le compute ; **terminated** = tu ne paies plus rien (et tu perds tout). En réel, `t2.micro` est éligible à l'offre gratuite — un détail que le SAA aime rappeler.
:::

:::lang en
**✅ Check:** `stop-instances` returns `stopping` then the instance goes `stopped`; `start-instances` moves it back to `pending`/`running`. `describe-volumes` shows an **EBS** volume (`vol-...`) with its size — it's your instance's **disk**, persistent across stop/start. Remember the cost logic: **stopped** = you pay for EBS storage but not compute; **terminated** = you pay nothing more (and lose everything). In real AWS, `t2.micro` is free-tier eligible — a detail the SAA likes to recall.
:::

### step-04

:::lang fr
**Objectif.** (Re)lancer LocalStack **avec le socket Docker** et créer ta **première fonction Lambda**.

**🤔 Pourquoi le socket.** Pour **exécuter** une fonction, LocalStack lance un petit conteneur (le runtime Python/Node). Il lui faut donc accéder à ton **démon Docker** — on le lui donne en montant `/var/run/docker.sock`. Sans ça, la fonction se crée mais reste en état `Failed` (« Docker not available »). C'est la config LocalStack **recommandée**.

Relance LocalStack avec le socket, crée le rôle et la fonction :
:::

:::lang en
**Goal.** (Re)launch LocalStack **with the Docker socket** and create your **first Lambda function**.

**🤔 Why the socket.** To **run** a function, LocalStack spawns a small container (the Python/Node runtime). It therefore needs access to your **Docker daemon** — we give it by mounting `/var/run/docker.sock`. Without it, the function creates but stays `Failed` ("Docker not available"). It's the **recommended** LocalStack config.

Relaunch LocalStack with the socket, create the role and the function:
:::

```bash
# Relancer LocalStack AVEC le socket Docker (pour exécuter Lambda) / relaunch WITH the Docker socket
docker rm -f localstack 2>/dev/null
docker run -d --name localstack -p 4566:4566 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  localstack/localstack:3.8.1
# attendre "healthy" / wait for "healthy"
sleep 15

# Rôle d'exécution de la fonction / the function's execution role
cat > trust.json <<'EOF'
{ "Version": "2012-10-17", "Statement": [ { "Effect": "Allow",
  "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" } ] }
EOF
awslocal iam create-role --role-name lambda-role \
  --assume-role-policy-document file://trust.json --query 'Role.Arn' --output text

# La fonction (un handler Python simple) / the function (a simple Python handler)
cat > handler.py <<'EOF'
def handler(event, context):
    nom = event.get("nom", "monde")
    return {"message": f"Bonjour {nom} depuis Lambda"}
EOF
zip -q fonction.zip handler.py

# Créer la fonction / create the function
awslocal lambda create-function --function-name salut \
  --runtime python3.11 --handler handler.handler \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --zip-file fileb://fonction.zip --query 'State' --output text

# Attendre qu'elle soit "Active" (le runtime se prépare) / wait until "Active"
awslocal lambda wait function-active --function-name salut && echo "fonction Active"
```

:::lang fr
**✅ Vérification :** après `create-function`, l'état est `Pending`, puis `awslocal lambda wait function-active` rend la main quand la fonction est **`Active`** (le conteneur runtime a été préparé via le socket Docker). Si elle reste `Failed` avec « Docker not available », c'est que LocalStack n'a **pas** le socket monté — relance-le avec le `-v /var/run/docker.sock:...`. Tu as déposé du code que tu n'as **pas** à héberger : AWS s'occupe de l'exécuter à la demande.
:::

:::lang en
**✅ Check:** after `create-function`, the state is `Pending`, then `awslocal lambda wait function-active` returns when the function is **`Active`** (the runtime container was prepared via the Docker socket). If it stays `Failed` with "Docker not available", LocalStack doesn't have the socket mounted — relaunch it with `-v /var/run/docker.sock:...`. You dropped code you **don't** have to host: AWS handles running it on demand.
:::

### step-05

:::lang fr
**Objectif.** **Invoquer** la fonction et la **configurer** (mémoire, timeout, variables d'environnement).

**🤔 Invoquer = exécuter.** Une fonction Lambda ne « tourne » pas ; on l'**invoque** avec un **événement** (un JSON), elle s'exécute, renvoie un résultat, puis s'éteint. On peut aussi ajuster ses **ressources** : plus de mémoire (et donc de CPU), un timeout plus long, des **variables d'environnement** pour la configurer sans toucher au code.

Invoque, puis reconfigure :
:::

:::lang en
**Goal.** **Invoke** the function and **configure** it (memory, timeout, environment variables).

**🤔 Invoke = run.** A Lambda function doesn't "run"; you **invoke** it with an **event** (a JSON), it executes, returns a result, then shuts down. You can also tune its **resources**: more memory (and thus CPU), a longer timeout, **environment variables** to configure it without touching the code.

Invoke, then reconfigure:
:::

```bash
# Invoquer avec un événement JSON / invoke with a JSON event
awslocal lambda invoke --function-name salut \
  --payload '{"nom": "Jiha"}' \
  --cli-binary-format raw-in-base64-out \
  reponse.json
cat reponse.json ; echo

# Reconfigurer : mémoire, timeout, variable d'environnement / reconfigure
awslocal lambda update-function-configuration --function-name salut \
  --memory-size 256 --timeout 10 \
  --environment "Variables={ENV=prod}" \
  --query '[MemorySize,Timeout]' --output text
```

:::lang fr
**✅ Vérification :** `invoke` écrit dans `reponse.json` le résultat de la fonction : `{"message": "Bonjour Jiha depuis Lambda"}`. La fonction a bien reçu l'événement `{"nom": "Jiha"}` et l'a traité. `update-function-configuration` renvoie `256   10` — la fonction a maintenant 256 Mo de mémoire et 10 s de timeout. ⚠️ L'option `--cli-binary-format raw-in-base64-out` est **nécessaire en aws-cli v2** pour passer un payload JSON brut ; en v1 elle n'existe pas (on passe le JSON directement). Vérifie ta version avec `aws --version`.
:::

:::lang en
**✅ Check:** `invoke` writes to `reponse.json` the function's result: `{"message": "Bonjour Jiha depuis Lambda"}`. The function received the event `{"nom": "Jiha"}` and processed it. `update-function-configuration` returns `256   10` — the function now has 256 MB memory and a 10 s timeout. ⚠️ The `--cli-binary-format raw-in-base64-out` option is **required in aws-cli v2** to pass a raw JSON payload; in v1 it doesn't exist (you pass the JSON directly). Check your version with `aws --version`.
:::

### step-06

:::lang fr
**Objectif.** Câbler un **déclencheur événementiel** : un dépôt de fichier dans S3 **invoque** la fonction.

**🤔 Le super-pouvoir du serverless.** Jusqu'ici tu invoquais la fonction **à la main**. La vraie puissance, c'est qu'elle **réagit** toute seule à un événement. Le motif canonique : « quand un fichier arrive dans ce bucket, exécute cette fonction » (redimensionner une image, traiter un CSV…). On connecte S3 → Lambda via une **notification de bucket**.

Autorise S3 à invoquer la fonction, puis connecte-les :
:::

:::lang en
**Goal.** Wire an **event-driven trigger**: a file drop in S3 **invokes** the function.

**🤔 Serverless's superpower.** So far you invoked the function **by hand**. The real power is that it **reacts** on its own to an event. The canonical pattern: "when a file lands in this bucket, run this function" (resize an image, process a CSV…). We connect S3 → Lambda via a **bucket notification**.

Allow S3 to invoke the function, then connect them:
:::

```bash
awslocal s3 mb s3://depot-images

# Autoriser le service S3 à invoquer la fonction / allow the S3 service to invoke the function
awslocal lambda add-permission --function-name salut \
  --statement-id s3-invoke --action lambda:InvokeFunction \
  --principal s3.amazonaws.com --source-arn arn:aws:s3:::depot-images \
  --query 'Statement' --output text >/dev/null && echo "permission ajoutée"

# Connecter : tout dépôt d'objet déclenche la fonction / connect: any object upload triggers the function
FN_ARN=$(awslocal lambda get-function --function-name salut --query 'Configuration.FunctionArn' --output text)
awslocal s3api put-bucket-notification-configuration --bucket depot-images \
  --notification-configuration "{\"LambdaFunctionConfigurations\":[{\"LambdaFunctionArn\":\"$FN_ARN\",\"Events\":[\"s3:ObjectCreated:*\"]}]}"

# Déclencher : déposer un fichier / trigger: upload a file
echo "photo" > chat.jpg
awslocal s3 cp chat.jpg s3://depot-images/chat.jpg
sleep 3
echo "notification configurée :"
awslocal s3api get-bucket-notification-configuration --bucket depot-images \
  --query 'LambdaFunctionConfigurations[0].Events' --output text
```

:::lang fr
**✅ Vérification :** `add-permission` autorise le principal `s3.amazonaws.com` à invoquer `salut`. `put-bucket-notification-configuration` connecte le bucket à la fonction sur l'événement `s3:ObjectCreated:*`. `get-bucket-notification-configuration` te réaffiche `s3:ObjectCreated:*` — le câblage est en place. Quand tu déposes `chat.jpg`, S3 **invoque automatiquement** la fonction avec un événement décrivant l'objet créé (bucket, clé). C'est **exactement** le motif d'architecture serverless que tu réutiliseras au projet : S3 → Lambda → (traitement). ⚠️ La permission (`add-permission`) est **obligatoire** : sans elle, S3 n'a pas le droit d'invoquer la fonction et le déclencheur reste muet.
:::

:::lang en
**✅ Check:** `add-permission` authorizes the `s3.amazonaws.com` principal to invoke `salut`. `put-bucket-notification-configuration` connects the bucket to the function on the `s3:ObjectCreated:*` event. `get-bucket-notification-configuration` shows you back `s3:ObjectCreated:*` — the wiring is in place. When you upload `chat.jpg`, S3 **automatically invokes** the function with an event describing the created object (bucket, key). It's **exactly** the serverless architecture pattern you'll reuse in the project: S3 → Lambda → (processing). ⚠️ The permission (`add-permission`) is **mandatory**: without it, S3 isn't allowed to invoke the function and the trigger stays silent.
:::

### step-07

:::lang fr
**Objectif.** Trancher **EC2 vs Lambda**, puis nettoyer.

**🤔 La décision d'architecte.** C'est la question que le SAA pose sans cesse : quel compute pour quel besoin ? **EC2** pour une charge **continue** (un serveur d'application qui tourne 24/7, un logiciel qui a besoin d'un OS complet, un contrôle fin). **Lambda** pour une charge **événementielle et intermittente** (traiter un upload, répondre à un webhook, une tâche planifiée légère) : pas de serveur à gérer, mise à l'échelle et coût automatiques, mais durée et taille limitées.

Récapitule et nettoie tout :
:::

:::lang en
**Goal.** Decide **EC2 vs Lambda**, then clean up.

**🤔 The architect's decision.** It's the question the SAA asks constantly: which compute for which need? **EC2** for a **continuous** workload (an app server running 24/7, software needing a full OS, fine-grained control). **Lambda** for an **event-driven, intermittent** workload (process an upload, answer a webhook, a light scheduled task): no server to manage, automatic scaling and cost, but limited duration and size.

Recap and clean everything:
:::

```bash
# --- Nettoyage / cleanup ---
# EC2
awslocal ec2 terminate-instances --instance-ids "$IID" --query 'TerminatingInstances[0].CurrentState.Name' --output text
awslocal ec2 delete-key-pair --key-name lab-key

# Lambda + S3
awslocal lambda delete-function --function-name salut
awslocal s3 rb s3://depot-images --force
awslocal iam delete-role --role-name lambda-role

echo "labo rangé / lab tidied"
```

:::lang fr
**✅ Vérification :** `terminate-instances` renvoie `shutting-down` (l'instance sera `terminated`). `delete-function`, `rb --force` et `delete-role` retirent le reste. Tout est nettoyé. **La grille de décision à retenir** : charge **continue / OS complet / contrôle** → **EC2** ; **événementiel / intermittent / zéro admin** → **Lambda**. Entre les deux, il existe des conteneurs managés (ECS/Fargate), mais pour le SAA, cette dichotomie EC2/Lambda est le réflexe de base. La suite : découpler les composants avec les files et les sujets (SQS/SNS) — le prolongement naturel de l'événementiel.
:::

:::lang en
**✅ Check:** `terminate-instances` returns `shutting-down` (the instance will be `terminated`). `delete-function`, `rb --force` and `delete-role` remove the rest. Everything is cleaned up. **The decision grid to remember**: **continuous / full OS / control** workload → **EC2**; **event-driven / intermittent / zero admin** → **Lambda**. Between the two, there are managed containers (ECS/Fargate), but for the SAA, this EC2/Lambda dichotomy is the base reflex. Next up: decoupling components with queues and topics (SQS/SNS) — the natural extension of event-driven.
:::

## pitfalls

:::lang fr
**1. Perdre la clé privée d'une paire de clés.** En réel, `create-key-pair` ne renvoie la clé privée **qu'une fois**. Pas de sauvegarde = plus de SSH vers les instances existantes. Sauve-la immédiatement (ou utilise SSM Session Manager).

**2. Croire que `terminated` = `stopped`.** `stopped` : l'instance est éteinte mais **existe** (disque EBS gardé, redémarrable). `terminated` : elle est **détruite**, définitivement. Ne termine pas quand tu voulais juste arrêter.

**3. Lambda qui reste `Failed`.** « Docker not available » : LocalStack n'a pas le socket monté. Relance-le avec `-v /var/run/docker.sock:/var/run/docker.sock`. En réel, un `Failed` vient plutôt d'un handler/runtime erroné.

**4. Oublier `--cli-binary-format` (aws-cli v2).** Sans lui, `invoke --payload '{...}'` échoue (« Invalid base64 ») en v2. Ajoute `--cli-binary-format raw-in-base64-out`. En v1, ne le mets pas (l'option n'existe pas).

**5. Déclencheur S3 sans `add-permission`.** Configurer la notification ne suffit pas : il faut **autoriser** S3 (`lambda:InvokeFunction`, principal `s3.amazonaws.com`) à invoquer la fonction. Sinon le déclencheur est silencieux.

**6. Handler mal nommé.** `--handler fichier.fonction` doit pointer le bon module et la bonne fonction : `handler.handler` = fichier `handler.py`, fonction `handler`. Une faute ici et la fonction plante à l'invocation.

**7. Choisir Lambda pour une charge continue.** Une fonction limitée à ~15 min, avec démarrage à froid, n'est pas faite pour un serveur permanent. Pour du 24/7, c'est EC2 (ou un conteneur). Inversement, un EC2 allumé pour traiter un fichier par jour est un gâchis : c'est un cas Lambda.
:::

:::lang en
**1. Losing a key pair's private key.** In real AWS, `create-key-pair` returns the private key **only once**. No save = no more SSH to existing instances. Save it immediately (or use SSM Session Manager).

**2. Thinking `terminated` = `stopped`.** `stopped`: the instance is off but **exists** (EBS disk kept, restartable). `terminated`: it's **destroyed**, permanently. Don't terminate when you just wanted to stop.

**3. Lambda stuck `Failed`.** "Docker not available": LocalStack lacks the mounted socket. Relaunch with `-v /var/run/docker.sock:/var/run/docker.sock`. In real AWS, a `Failed` comes rather from a wrong handler/runtime.

**4. Forgetting `--cli-binary-format` (aws-cli v2).** Without it, `invoke --payload '{...}'` fails ("Invalid base64") in v2. Add `--cli-binary-format raw-in-base64-out`. In v1, don't add it (the option doesn't exist).

**5. S3 trigger without `add-permission`.** Configuring the notification isn't enough: you must **authorize** S3 (`lambda:InvokeFunction`, principal `s3.amazonaws.com`) to invoke the function. Otherwise the trigger is silent.

**6. Misnamed handler.** `--handler file.function` must point to the right module and function: `handler.handler` = file `handler.py`, function `handler`. A mistake here and the function crashes on invocation.

**7. Choosing Lambda for a continuous workload.** A function capped at ~15 min, with cold start, isn't made for a permanent server. For 24/7, it's EC2 (or a container). Conversely, an EC2 left on to process one file a day is a waste: that's a Lambda case.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées une paire de clés et tu récupères une AMI.
- [ ] Tu lances une instance EC2 avec un user-data et tu la décris `running`.
- [ ] Tu joues stop/start/terminate et tu expliques le coût de chaque état.
- [ ] Tu lances LocalStack avec le socket et ta fonction Lambda passe `Active`.
- [ ] Tu invoques la fonction et tu ajustes mémoire/timeout/variables.
- [ ] Tu câbles un déclencheur S3 → Lambda (avec `add-permission`).
- [ ] Tu justifies un choix **EC2 vs Lambda** sur un scénario donné.

Sept cases = tu tiens le compute au niveau SAA. La suite : découpler avec SQS/SNS/DynamoDB.
:::

:::lang en
You know it works when…

- [ ] You create a key pair and grab an AMI.
- [ ] You launch an EC2 instance with user-data and describe it `running`.
- [ ] You run stop/start/terminate and explain each state's cost.
- [ ] You launch LocalStack with the socket and your Lambda function goes `Active`.
- [ ] You invoke the function and adjust memory/timeout/variables.
- [ ] You wire an S3 → Lambda trigger (with `add-permission`).
- [ ] You justify an **EC2 vs Lambda** choice on a given scenario.

Seven boxes = you hold compute at SAA level. Next up: decoupling with SQS/SNS/DynamoDB.
:::

## next

:::lang fr
La suite du track AWS → SAA-C03 :

1. **AWS — découplage & données (SQS/SNS/DynamoDB)** : les files de messages (SQS), les sujets de publication (SNS) et la base NoSQL (DynamoDB) — comment découpler et rendre une architecture élastique et résiliente.
2. Plus loin : le **projet d'entreprise** serverless (qui assemble S3, Lambda, DynamoDB, SQS…), puis **passer en réel**.
:::

:::lang en
The AWS → SAA-C03 track continues:

1. **AWS — decoupling & data (SQS/SNS/DynamoDB)**: message queues (SQS), publish topics (SNS) and the NoSQL database (DynamoDB) — how to decouple and make an architecture elastic and resilient.
2. Further along: the serverless **enterprise project** (assembling S3, Lambda, DynamoDB, SQS…), then **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire compute.
:::

:::lang en
Compute cheat sheet.
:::

```bash
# EC2
awslocal ec2 create-key-pair --key-name lab-key
awslocal ec2 run-instances --image-id $AMI --instance-type t2.micro --key-name lab-key --user-data file://ud.sh
awslocal ec2 describe-instances --instance-ids $IID
awslocal ec2 stop-instances / start-instances / terminate-instances --instance-ids $IID

# Lambda (LocalStack AVEC le socket : -v /var/run/docker.sock:/var/run/docker.sock)
zip -q fn.zip handler.py
awslocal lambda create-function --function-name f --runtime python3.11 \
  --handler handler.handler --role <role-arn> --zip-file fileb://fn.zip
awslocal lambda wait function-active --function-name f
awslocal lambda invoke --function-name f --payload '{"k":"v"}' --cli-binary-format raw-in-base64-out out.json
awslocal lambda update-function-configuration --function-name f --memory-size 256 --timeout 10 --environment "Variables={ENV=prod}"

# Déclencheur S3 -> Lambda / S3 -> Lambda trigger
awslocal lambda add-permission --function-name f --statement-id s3 --action lambda:InvokeFunction \
  --principal s3.amazonaws.com --source-arn arn:aws:s3:::bucket
awslocal s3api put-bucket-notification-configuration --bucket bucket --notification-configuration file://notif.json
```

## resources

:::lang fr
- [Amazon EC2 — guide](https://docs.aws.amazon.com/ec2/) — instances, AMI, types.
- [Données user-data EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html) — scripts de démarrage.
- [AWS Lambda — guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) — fonctions, runtimes, invocation.
- [Sources d'événements Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html) — S3, SQS, API Gateway…
- [EC2 vs Lambda (modèles de compute)](https://aws.amazon.com/products/compute/) — quand choisir quoi.
:::

:::lang en
- [Amazon EC2 — guide](https://docs.aws.amazon.com/ec2/) — instances, AMIs, types.
- [EC2 user-data](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html) — startup scripts.
- [AWS Lambda — guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) — functions, runtimes, invocation.
- [Lambda event sources](https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html) — S3, SQS, API Gateway…
- [EC2 vs Lambda (compute models)](https://aws.amazon.com/products/compute/) — when to choose which.
:::

## troubleshooting

:::lang fr
**L'instance reste `pending`.** En LocalStack, elle passe vite à `running` ; attends quelques secondes et re-décris. En réel, un `pending` long peut venir d'un manque de capacité ou d'un sous-réseau/SG mal configuré.

**Lambda `Failed` / « Docker not available ».** LocalStack n'a pas le socket Docker. Relance-le avec `-v /var/run/docker.sock:/var/run/docker.sock`, attends `healthy`, recrée la fonction.

**`invoke` : « Invalid base64 ».** Tu es en aws-cli v2 sans `--cli-binary-format raw-in-base64-out`. Ajoute l'option. (En v1, ne la mets pas.)

**La fonction plante à l'invocation (`Unhandled`).** Le `--handler` ne correspond pas au code (mauvais nom de fichier ou de fonction), ou le code lève une exception. Vérifie `fichier.fonction` et teste le handler en local.

**Le déclencheur S3 n'invoque rien.** Il manque `add-permission` (autoriser `s3.amazonaws.com`), ou la notification n'est pas posée. Vérifie `get-bucket-notification-configuration` et la permission de la fonction.

**`aws --version` affiche 1.x.** Tu utilises aws-cli v1 (installé par `pip install awscli`). Les fonctions de ce guide marchent, mais sans `--cli-binary-format`. Pour la v2 (recommandée), installe-la depuis le paquet officiel AWS.
:::

:::lang en
**The instance stays `pending`.** In LocalStack it quickly goes `running`; wait a few seconds and re-describe. In real AWS, a long `pending` can come from a capacity shortage or a misconfigured subnet/SG.

**Lambda `Failed` / "Docker not available".** LocalStack lacks the Docker socket. Relaunch with `-v /var/run/docker.sock:/var/run/docker.sock`, wait for `healthy`, recreate the function.

**`invoke`: "Invalid base64".** You're on aws-cli v2 without `--cli-binary-format raw-in-base64-out`. Add the option. (In v1, don't add it.)

**The function crashes on invocation (`Unhandled`).** The `--handler` doesn't match the code (wrong file or function name), or the code raises an exception. Check `file.function` and test the handler locally.

**The S3 trigger invokes nothing.** Missing `add-permission` (authorize `s3.amazonaws.com`), or the notification isn't set. Check `get-bucket-notification-configuration` and the function's permission.

**`aws --version` shows 1.x.** You're using aws-cli v1 (installed by `pip install awscli`). This guide's functions work, but without `--cli-binary-format`. For v2 (recommended), install it from the official AWS package.
:::
