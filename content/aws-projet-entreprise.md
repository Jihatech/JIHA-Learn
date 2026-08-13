---
# — Identité (ne change JAMAIS une fois publié) —
id: aws-projet-entreprise
slug: aws-projet-entreprise
order: 50
status: published

# — Titres & accroches (bilingue) —
title_fr: "AWS — projet d'entreprise : pipeline serverless"
title_en: "AWS — enterprise project: serverless pipeline"
tagline_fr: "S3 → Lambda → DynamoDB + SNS/SQS, provisionné en Terraform."
tagline_en: "S3 → Lambda → DynamoDB + SNS/SQS, provisioned with Terraform."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 320
repo: "localstack/localstack"
last_review: "2026-08-13"

# — Relations de parcours (par id) —
prerequisites: [aws-decouplage-messagerie]
next: [aws-passer-en-reel]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [architecture-serverless, terraform-aws, pipeline-evenementiel, s3-lambda-dynamodb, fan-out-notifications, iac-idempotente, livrable-cv]
concepts_en: [serverless-architecture, terraform-aws, event-pipeline, s3-lambda-dynamodb, fan-out-notifications, idempotent-iac, cv-deliverable]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le capstone AWS/SAA-C03 : un pipeline serverless complet provisionné en Terraform contre LocalStack. Un fichier déposé dans S3 déclenche une fonction Lambda qui enregistre une entrée dans DynamoDB et publie une notification SNS diffusée vers une file SQS. Rôles IAM, déclencheur S3, fan-out, tout en infrastructure-as-code idempotente. Un livrable de CV, avec README d'architecture et pitch d'entretien."
og_description_en: "The AWS/SAA-C03 capstone: a complete serverless pipeline provisioned with Terraform against LocalStack. A file dropped in S3 triggers a Lambda function that records an entry in DynamoDB and publishes an SNS notification broadcast to an SQS queue. IAM roles, S3 trigger, fan-out, all in idempotent infrastructure-as-code. A CV deliverable, with an architecture README and interview pitch."
---

## intro

:::lang fr
C'est le moment d'assembler **tout** ce que tu as appris dans le track AWS en **un seul projet** montrable en entretien : un **pipeline serverless de traitement de fichiers**, provisionné **entièrement en Terraform**. Le scénario est réaliste et fréquent en entreprise : un utilisateur **dépose un fichier dans S3**, ce qui **déclenche une fonction Lambda** qui **enregistre une entrée dans DynamoDB** (le catalogue) et **publie une notification SNS**, diffusée (fan-out) vers une **file SQS** qu'un service en aval consommera. Zéro serveur à administrer, mise à l'échelle automatique, et une infrastructure **décrite en code**, reproductible d'une commande.

Ce projet mobilise **toute** la boîte à outils du track : **IAM** (rôle d'exécution, moindre privilège), **S3** (le déclencheur), **Lambda** (le traitement événementiel), **DynamoDB** (l'état), **SNS/SQS** (le découplage et la diffusion), et **Terraform** (l'IaC qui assemble le tout et le rend idempotent). C'est exactement l'architecture qu'on déploie pour du traitement d'images, d'imports de données, de webhooks — un vrai motif de production.

Tout se monte en **LocalStack** : Terraform crée de vraies ressources émulées, tu déposes un fichier, et tu **vois** l'entrée apparaître dans DynamoDB et le message atterrir dans SQS. À la fin, tu as un dépôt Git propre — `.tf`, code Lambda, README d'architecture — que tu peux **mettre sur ton CV et ton GitHub** comme preuve concrète de tes compétences AWS/serverless/IaC.

**Pour qui c'est :** tu as terminé tout le track AWS (IAM → découplage). C'est l'examen final.

**Ce que tu vas produire :** un projet Terraform idempotent qui, en une commande (`terraform apply`), déploie un pipeline serverless événementiel complet — et que tu détruis proprement en une autre (`terraform destroy`).
:::

:::lang en
Time to assemble **everything** you learned in the AWS track into **one project** you can show in an interview: a **serverless file-processing pipeline**, provisioned **entirely with Terraform**. The scenario is realistic and common in companies: a user **drops a file in S3**, which **triggers a Lambda function** that **records an entry in DynamoDB** (the catalog) and **publishes an SNS notification**, fanned out to an **SQS queue** a downstream service will consume. Zero servers to administer, automatic scaling, and infrastructure **described in code**, reproducible in one command.

This project mobilizes the **whole** track toolbox: **IAM** (execution role, least privilege), **S3** (the trigger), **Lambda** (event-driven processing), **DynamoDB** (state), **SNS/SQS** (decoupling and broadcast), and **Terraform** (the IaC that assembles it all and makes it idempotent). It's exactly the architecture deployed for image processing, data imports, webhooks — a real production pattern.

Everything runs on **LocalStack**: Terraform creates real emulated resources, you drop a file, and you **see** the entry appear in DynamoDB and the message land in SQS. In the end, you have a clean Git repo — `.tf`, Lambda code, architecture README — that you can **put on your CV and GitHub** as concrete proof of your AWS/serverless/IaC skills.

**Who it's for:** you've finished the whole AWS track (IAM → decoupling). This is the final exam.

**What you'll produce:** an idempotent Terraform project that, in one command (`terraform apply`), deploys a complete event-driven serverless pipeline — and that you tear down cleanly with another (`terraform destroy`).
:::

## objectives

:::lang fr
À la fin de ce projet, tu as construit et tu sais expliquer :

- Un **provider Terraform** pointant vers LocalStack (endpoints, credentials de labo).
- Un **stockage S3** et une **table DynamoDB** en IaC.
- Une **fonction Lambda** empaquetée par Terraform, avec son **rôle IAM** en moindre privilège.
- Un **déclencheur S3 → Lambda** (notification + permission).
- Une **notification SNS** diffusée en **fan-out** vers une **file SQS**.
- Un **pipeline testé bout-en-bout** : dépôt S3 → entrée DynamoDB + message SQS.
- Un projet **idempotent** (`apply` deux fois = aucun changement) et un **README de CV**.
:::

:::lang en
By the end of this project, you've built and can explain:

- A **Terraform provider** pointing to LocalStack (endpoints, lab credentials).
- **S3 storage** and a **DynamoDB table** in IaC.
- A **Lambda function** packaged by Terraform, with its **IAM role** in least privilege.
- An **S3 → Lambda trigger** (notification + permission).
- An **SNS notification** broadcast in **fan-out** to an **SQS queue**.
- A **pipeline tested end-to-end**: S3 upload → DynamoDB entry + SQS message.
- An **idempotent** project (`apply` twice = no change) and a **CV README**.
:::

## prerequisites

:::lang fr
- **Tout le track AWS** terminé (fondamentaux → IAM → S3 → VPC → compute → découplage).
- **Terraform ≥ 1.6** (`terraform version`) et **`awslocal`** pour vérifier.
- **LocalStack lancé AVEC le socket Docker** (le pipeline utilise Lambda) :

```bash
docker rm -f localstack 2>/dev/null
docker run -d --name localstack -p 4566:4566 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  localstack/localstack:3.8.1
sleep 15
```

- Accès réseau à **registry.terraform.io** (Terraform télécharge le provider AWS au premier `init`).
:::

:::lang en
- **The whole AWS track** done (fundamentals → IAM → S3 → VPC → compute → decoupling).
- **Terraform ≥ 1.6** (`terraform version`) and **`awslocal`** to verify.
- **LocalStack launched WITH the Docker socket** (the pipeline uses Lambda):

```bash
docker rm -f localstack 2>/dev/null
docker run -d --name localstack -p 4566:4566 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  localstack/localstack:3.8.1
sleep 15
```

- Network access to **registry.terraform.io** (Terraform downloads the AWS provider on the first `init`).
:::

## concepts

:::lang fr
**Pipeline événementiel serverless.** Une chaîne où chaque étape **réagit** à un événement, sans serveur permanent : un **événement source** (dépôt S3) déclenche un **traitement** (Lambda) qui **écrit un état** (DynamoDB) et **émet une notification** (SNS→SQS). Chaque maillon est managé, scalable, et facturé à l'usage.

**Terraform pour AWS.** On décrit chaque ressource (`aws_s3_bucket`, `aws_lambda_function`, `aws_dynamodb_table`…) dans des fichiers `.tf`. Terraform calcule le graphe de dépendances, crée tout dans le bon ordre, et garde un **état** pour rendre les `apply` **idempotents**. Pointer Terraform vers LocalStack = un bloc `endpoints` dans le provider.

**Empaquetage de la Lambda par Terraform.** Le code de la fonction doit être livré en **zip**. La source de données `archive_file` de Terraform **zippe automatiquement** ton dossier de code à chaque `apply` — pas de zip à faire à la main, et le hash du zip déclenche une mise à jour si le code change.

**Rôle d'exécution en moindre privilège.** La Lambda **endosse un rôle IAM** (vu au guide IAM) qui l'autorise à écrire dans **cette** table DynamoDB et publier sur **ce** sujet SNS — et rien d'autre. Pas de clés dans le code.

**Déclencheur S3 → Lambda.** Deux pièces : une **permission** (`aws_lambda_permission`) autorisant le service S3 à invoquer la fonction, et une **notification de bucket** (`aws_s3_bucket_notification`) qui câble l'événement `s3:ObjectCreated:*` vers la fonction. Sans la permission, S3 ne peut pas invoquer.

**Fan-out SNS → SQS.** La fonction publie sur un **sujet SNS** ; une **file SQS** y est abonnée. Ça découple le traitement (Lambda) de la consommation aval (un autre service lit la file à son rythme). Une **queue policy** autorise SNS à déposer dans la file.

**Endpoint dans la Lambda.** Détail LocalStack : à l'intérieur du conteneur d'exécution, la fonction ne joint pas `localhost:4566`. LocalStack lui injecte la variable `AWS_ENDPOINT_URL` ; le code crée ses clients boto3 avec `endpoint_url=os.environ.get("AWS_ENDPOINT_URL")` — inoffensif en réel (la variable est absente, boto3 vise le vrai AWS).
:::

:::lang en
**Serverless event pipeline.** A chain where each step **reacts** to an event, with no permanent server: a **source event** (S3 upload) triggers a **processing** (Lambda) that **writes state** (DynamoDB) and **emits a notification** (SNS→SQS). Each link is managed, scalable, and billed per use.

**Terraform for AWS.** You describe each resource (`aws_s3_bucket`, `aws_lambda_function`, `aws_dynamodb_table`…) in `.tf` files. Terraform computes the dependency graph, creates everything in the right order, and keeps a **state** to make `apply`s **idempotent**. Pointing Terraform at LocalStack = an `endpoints` block in the provider.

**Packaging the Lambda with Terraform.** The function code must be delivered as a **zip**. Terraform's `archive_file` data source **zips your code folder automatically** on each `apply` — no manual zip, and the zip's hash triggers an update if the code changes.

**Least-privilege execution role.** The Lambda **assumes an IAM role** (seen in the IAM guide) that lets it write to **this** DynamoDB table and publish to **this** SNS topic — and nothing else. No keys in the code.

**S3 → Lambda trigger.** Two pieces: a **permission** (`aws_lambda_permission`) allowing the S3 service to invoke the function, and a **bucket notification** (`aws_s3_bucket_notification`) wiring the `s3:ObjectCreated:*` event to the function. Without the permission, S3 can't invoke.

**SNS → SQS fan-out.** The function publishes to an **SNS topic**; an **SQS queue** is subscribed. It decouples the processing (Lambda) from downstream consumption (another service reads the queue at its own pace). A **queue policy** allows SNS to deposit into the queue.

**Endpoint inside the Lambda.** LocalStack detail: inside the execution container, the function can't reach `localhost:4566`. LocalStack injects the `AWS_ENDPOINT_URL` variable; the code creates its boto3 clients with `endpoint_url=os.environ.get("AWS_ENDPOINT_URL")` — harmless in real AWS (the variable is absent, boto3 targets real AWS).
:::

:::figure aws-serverless-pipeline
caption_fr: "Schéma 1. Le pipeline : un dépôt dans S3 (uploads) déclenche la Lambda (processeur) qui écrit une entrée dans DynamoDB (catalogue) et publie sur SNS (notifications), diffusé en fan-out vers une file SQS (consommateur aval). Tout provisionné par Terraform."
caption_en: "Figure 1. The pipeline: an upload to S3 (uploads) triggers the Lambda (processor) which writes an entry to DynamoDB (catalog) and publishes to SNS (notifications), fanned out to an SQS queue (downstream consumer). All provisioned by Terraform."
:::

## walkthrough

:::lang fr
On avance ainsi : provider Terraform → S3 & DynamoDB → Lambda & rôle IAM → déclencheur S3 → SNS/SQS fan-out → déployer & tester bout-en-bout → idempotence, CV & teardown.
:::

:::lang en
We'll go like this: Terraform provider → S3 & DynamoDB → Lambda & IAM role → S3 trigger → SNS/SQS fan-out → deploy & test end-to-end → idempotence, CV & teardown.
:::

### step-01

:::lang fr
**Objectif.** Poser le **squelette Terraform** et le **provider** pointant vers LocalStack.

**🤔 Le bloc endpoints.** En réel, le provider AWS parle au vrai AWS. Pour LocalStack, on le redirige service par service via un bloc `endpoints`, avec des credentials de labo (`test`/`test`) et les `skip_*` qui évitent les vérifications propres au vrai AWS. C'est **la seule** différence avec un projet Terraform de production.

Crée le projet et `provider.tf` :
:::

:::lang en
**Goal.** Lay the **Terraform skeleton** and the **provider** pointing to LocalStack.

**🤔 The endpoints block.** In real AWS, the provider talks to real AWS. For LocalStack, we redirect it service by service via an `endpoints` block, with lab credentials (`test`/`test`) and the `skip_*` flags that avoid real-AWS-specific checks. It's **the only** difference from a production Terraform project.

Create the project and `provider.tf`:
:::

```bash
mkdir -p ~/projet-serverless/lambda && cd ~/projet-serverless
```

```hcl
# ~/projet-serverless/provider.tf
terraform {
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 5.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.0" }
  }
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true

  endpoints {
    s3       = "http://localhost:4566"
    lambda   = "http://localhost:4566"
    dynamodb = "http://localhost:4566"
    iam      = "http://localhost:4566"
    sns      = "http://localhost:4566"
    sqs      = "http://localhost:4566"
    sts      = "http://localhost:4566"
  }
}
```

```bash
terraform init
```

:::lang fr
**✅ Vérification :** `terraform init` télécharge les providers `hashicorp/aws` et `hashicorp/archive` et termine par `Terraform has been successfully initialized!`. Un dossier `.terraform/` apparaît. Le provider est prêt à parler à LocalStack. ⚠️ Si `init` échoue sur `registry.terraform.io` (réseau), vérifie ton accès Internet — le provider se télécharge une seule fois depuis le registre HashiCorp.
:::

:::lang en
**✅ Check:** `terraform init` downloads the `hashicorp/aws` and `hashicorp/archive` providers and ends with `Terraform has been successfully initialized!`. A `.terraform/` folder appears. The provider is ready to talk to LocalStack. ⚠️ If `init` fails on `registry.terraform.io` (network), check your internet access — the provider is downloaded once from the HashiCorp registry.
:::

### step-02

:::lang fr
**Objectif.** Déclarer le **stockage S3** et la **table DynamoDB** en Terraform.

**🤔 Les deux extrémités du pipeline.** Le bucket S3 est l'**entrée** (on y dépose des fichiers) ; la table DynamoDB est la **sortie d'état** (la Lambda y écrira une entrée par fichier traité). On les déclare en premier car la fonction en dépendra.

Crée `storage.tf` :
:::

:::lang en
**Goal.** Declare the **S3 storage** and the **DynamoDB table** in Terraform.

**🤔 The pipeline's two ends.** The S3 bucket is the **entry** (you drop files in it); the DynamoDB table is the **state output** (the Lambda will write one entry per processed file). We declare them first because the function will depend on them.

Create `storage.tf`:
:::

```hcl
# ~/projet-serverless/storage.tf
resource "aws_s3_bucket" "uploads" {
  bucket        = "uploads-pipeline"
  force_destroy = true   # laisse "terraform destroy" vider le bucket avant de le supprimer / lets destroy empty the bucket first
}

resource "aws_dynamodb_table" "catalogue" {
  name         = "catalogue-fichiers"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}
```

```bash
terraform apply -auto-approve
awslocal s3 ls
awslocal dynamodb list-tables --query 'TableNames' --output text
```

:::lang fr
**✅ Vérification :** `terraform apply` affiche `Apply complete! Resources: 2 added`. `awslocal s3 ls` liste `uploads-pipeline` et `dynamodb list-tables` renvoie `catalogue-fichiers`. Terraform a créé les deux ressources dans LocalStack, et enregistré leur existence dans son état (`terraform.tfstate`). Tu construis l'infra **progressivement** : à chaque étape, un `apply` ajoute les nouvelles ressources sans toucher aux précédentes.
:::

:::lang en
**✅ Check:** `terraform apply` shows `Apply complete! Resources: 2 added`. `awslocal s3 ls` lists `uploads-pipeline` and `dynamodb list-tables` returns `catalogue-fichiers`. Terraform created both resources in LocalStack, and recorded their existence in its state (`terraform.tfstate`). You build the infra **progressively**: at each step, an `apply` adds the new resources without touching the previous ones.
:::

### step-03

:::lang fr
**Objectif.** Écrire la **fonction Lambda**, son **rôle IAM** en moindre privilège, et laisser Terraform l'**empaqueter**.

**🤔 Trois pièces liées.** (1) Le **code** (`lambda/handler.py`) qui lit l'événement S3, écrit dans DynamoDB et publie sur SNS. (2) Le **rôle** que la fonction endosse, avec une politique qui autorise **juste** l'écriture dans notre table et la publication sur notre sujet. (3) La ressource `aws_lambda_function`, dont le zip est produit par `archive_file`.

Écris le code de la fonction :
:::

:::lang en
**Goal.** Write the **Lambda function**, its least-privilege **IAM role**, and let Terraform **package** it.

**🤔 Three linked pieces.** (1) The **code** (`lambda/handler.py`) that reads the S3 event, writes to DynamoDB and publishes to SNS. (2) The **role** the function assumes, with a policy allowing **just** writing to our table and publishing to our topic. (3) The `aws_lambda_function` resource, whose zip is produced by `archive_file`.

Write the function code:
:::

```python
# ~/projet-serverless/lambda/handler.py
import os, boto3

def handler(event, context):
    endpoint = os.environ.get("AWS_ENDPOINT_URL")  # défini par LocalStack ; absent en réel
    ddb = boto3.client("dynamodb", endpoint_url=endpoint)
    sns = boto3.client("sns", endpoint_url=endpoint)
    for record in event["Records"]:
        bucket = record["s3"]["bucket"]["name"]
        key    = record["s3"]["object"]["key"]
        ddb.put_item(
            TableName=os.environ["TABLE_NAME"],
            Item={"id": {"S": key}, "bucket": {"S": bucket}, "statut": {"S": "traite"}},
        )
        sns.publish(TopicArn=os.environ["TOPIC_ARN"], Message=f"Fichier traite : {key}")
    return {"traites": len(event["Records"])}
```

:::lang fr
Puis `lambda.tf` (rôle + politique + empaquetage + fonction) :
:::

:::lang en
Then `lambda.tf` (role + policy + packaging + function):
:::

```hcl
# ~/projet-serverless/lambda.tf
data "archive_file" "code" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/fonction.zip"
}

resource "aws_iam_role" "lambda" {
  name = "role-processeur"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "lambda" {
  name = "acces-minimal"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = "dynamodb:PutItem", Resource = aws_dynamodb_table.catalogue.arn },
      { Effect = "Allow", Action = "sns:Publish",     Resource = aws_sns_topic.notifs.arn }
    ]
  })
}

resource "aws_lambda_function" "processeur" {
  function_name    = "processeur-fichiers"
  runtime          = "python3.11"
  handler          = "handler.handler"
  role             = aws_iam_role.lambda.arn
  filename         = data.archive_file.code.output_path
  source_code_hash = data.archive_file.code.output_base64sha256

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.catalogue.name
      TOPIC_ARN  = aws_sns_topic.notifs.arn
    }
  }
}
```

:::lang fr
**✅ Vérification :** ne lance pas encore `apply` — la fonction référence `aws_sns_topic.notifs`, qu'on créera à l'étape 5 (Terraform résout les dépendances, mais la ressource doit exister dans le code). Pour l'instant, vérifie la **cohérence** : `terraform validate` doit répondre `Success! The configuration is valid.` (il vérifie la syntaxe et les références). On assemblera et déploiera tout à l'étape 6. La politique du rôle n'autorise que `dynamodb:PutItem` sur **notre** table et `sns:Publish` sur **notre** sujet — moindre privilège.
:::

:::lang en
**✅ Check:** don't run `apply` yet — the function references `aws_sns_topic.notifs`, which we'll create in step 5 (Terraform resolves dependencies, but the resource must exist in the code). For now, check **consistency**: `terraform validate` should answer `Success! The configuration is valid.` (it checks syntax and references). We'll assemble and deploy everything in step 6. The role's policy allows only `dynamodb:PutItem` on **our** table and `sns:Publish` on **our** topic — least privilege.
:::

### step-04

:::lang fr
**Objectif.** Câbler le **déclencheur S3 → Lambda** — permission + notification.

**🤔 Les deux pièces indispensables.** (1) Une **permission** qui autorise le service S3 (`s3.amazonaws.com`) à invoquer notre fonction — sans elle, S3 n'a pas le droit. (2) Une **notification de bucket** qui dit « à chaque `s3:ObjectCreated:*`, invoque cette fonction ». Terraform impose l'ordre : la permission **avant** la notification (`depends_on`).

Crée `trigger.tf` :
:::

:::lang en
**Goal.** Wire the **S3 → Lambda trigger** — permission + notification.

**🤔 The two essential pieces.** (1) A **permission** allowing the S3 service (`s3.amazonaws.com`) to invoke our function — without it, S3 isn't allowed. (2) A **bucket notification** saying "on each `s3:ObjectCreated:*`, invoke this function". Terraform enforces the order: the permission **before** the notification (`depends_on`).

Create `trigger.tf`:
:::

```hcl
# ~/projet-serverless/trigger.tf
resource "aws_lambda_permission" "depuis_s3" {
  statement_id  = "AutoriserS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.processeur.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.uploads.arn
}

resource "aws_s3_bucket_notification" "sur_depot" {
  bucket = aws_s3_bucket.uploads.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.processeur.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.depuis_s3]
}
```

:::lang fr
**✅ Vérification :** toujours pas d'`apply` (on attend SNS/SQS de l'étape 5), mais `terraform validate` reste `Success`. Observe le `depends_on` : sans lui, Terraform pourrait créer la notification **avant** la permission, et AWS refuserait (« Unable to validate the following destination configurations »). L'ordre permission → notification est un piège classique que `depends_on` règle explicitement.
:::

:::lang en
**✅ Check:** still no `apply` (we're waiting for SNS/SQS from step 5), but `terraform validate` stays `Success`. Notice the `depends_on`: without it, Terraform might create the notification **before** the permission, and AWS would refuse ("Unable to validate the following destination configurations"). The permission → notification order is a classic trap that `depends_on` solves explicitly.
:::

### step-05

:::lang fr
**Objectif.** Ajouter les **notifications** : un **sujet SNS** diffusé en **fan-out** vers une **file SQS**.

**🤔 Découpler l'aval.** La Lambda publie sur SNS ; une file SQS y est abonnée pour qu'un service aval (facturation, indexation…) consomme à son rythme. Il faut une **queue policy** autorisant SNS à déposer dans la file — sinon la diffusion échoue silencieusement. C'est le motif fan-out du guide précédent, en Terraform.

Crée `notifications.tf` :
:::

:::lang en
**Goal.** Add the **notifications**: an **SNS topic** fanned out to an **SQS queue**.

**🤔 Decouple downstream.** The Lambda publishes to SNS; an SQS queue is subscribed so a downstream service (billing, indexing…) consumes at its own pace. You need a **queue policy** allowing SNS to deposit into the queue — otherwise the broadcast fails silently. It's the fan-out pattern from the previous guide, in Terraform.

Create `notifications.tf`:
:::

```hcl
# ~/projet-serverless/notifications.tf
resource "aws_sns_topic" "notifs" {
  name = "notifications-fichiers"
}

resource "aws_sqs_queue" "aval" {
  name = "consommateur-aval"
}

# Abonner la file SQS au sujet SNS (fan-out) / subscribe the SQS queue to the SNS topic
resource "aws_sns_topic_subscription" "sqs" {
  topic_arn = aws_sns_topic.notifs.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.aval.arn
}

# Autoriser SNS à déposer dans la file / allow SNS to deposit into the queue
resource "aws_sqs_queue_policy" "autoriser_sns" {
  queue_url = aws_sqs_queue.aval.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "sns.amazonaws.com" }
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.aval.arn
      Condition = { ArnEquals = { "aws:SourceArn" = aws_sns_topic.notifs.arn } }
    }]
  })
}
```

:::lang fr
**✅ Vérification :** `terraform validate` répond `Success` — toutes les références sont maintenant résolues (la Lambda de l'étape 3 pointait vers `aws_sns_topic.notifs`, qui existe désormais). Ton infrastructure est **complète en code** : S3, DynamoDB, Lambda+rôle, déclencheur, SNS+SQS+abonnement+policy. On peut enfin tout déployer. La `queue policy` avec la condition `ArnEquals` sur `aws:SourceArn` est la bonne pratique : seule **notre** topic peut écrire dans la file.
:::

:::lang en
**✅ Check:** `terraform validate` answers `Success` — all references are now resolved (the step-3 Lambda pointed to `aws_sns_topic.notifs`, which now exists). Your infrastructure is **complete in code**: S3, DynamoDB, Lambda+role, trigger, SNS+SQS+subscription+policy. We can finally deploy it all. The `queue policy` with the `ArnEquals` condition on `aws:SourceArn` is the best practice: only **our** topic can write to the queue.
:::

### step-06

:::lang fr
**Objectif.** **Déployer** tout le pipeline et le **tester bout-en-bout** : un dépôt S3 fait apparaître une entrée DynamoDB **et** un message SQS.

**🤔 Le moment de vérité.** Un seul `terraform apply` crée l'infra manquante et câble tout. Puis on **dépose un fichier** dans S3 : ça déclenche la Lambda, qui écrit dans DynamoDB et publie sur SNS, diffusé vers SQS. On **observe** les deux effets — c'est la preuve que le pipeline vit.

Déploie et déclenche :
:::

:::lang en
**Goal.** **Deploy** the whole pipeline and **test it end-to-end**: an S3 upload makes a DynamoDB entry **and** an SQS message appear.

**🤔 The moment of truth.** A single `terraform apply` creates the missing infra and wires everything. Then we **drop a file** in S3: it triggers the Lambda, which writes to DynamoDB and publishes to SNS, fanned out to SQS. We **observe** both effects — proof the pipeline is alive.

Deploy and trigger:
:::

```bash
# Déployer tout le pipeline / deploy the whole pipeline
terraform apply -auto-approve

# Déposer un fichier -> déclenche la Lambda / drop a file -> triggers the Lambda
echo "rapport annuel 2026" > rapport.pdf
awslocal s3 cp rapport.pdf s3://uploads-pipeline/rapport.pdf
sleep 5   # laisser la Lambda s'exécuter / let the Lambda run

# Effet 1 : une entrée dans DynamoDB / effect 1: a DynamoDB entry
echo "--- DynamoDB ---"
awslocal dynamodb get-item --table-name catalogue-fichiers \
  --key '{"id":{"S":"rapport.pdf"}}' --query 'Item.[id.S,statut.S]' --output text

# Effet 2 : un message dans la file SQS (via SNS) / effect 2: an SQS message (via SNS)
echo "--- SQS ---"
awslocal sqs receive-message \
  --queue-url "$(awslocal sqs get-queue-url --queue-name consommateur-aval --query 'QueueUrl' --output text)" \
  --query 'Messages[0].Body' --output text | head -c 120 ; echo
```

:::lang fr
**✅ Vérification :** `terraform apply` termine `Apply complete!` (les ressources restantes ajoutées). Après le dépôt de `rapport.pdf` : **Effet 1** — `get-item` renvoie `rapport.pdf   traite` : la Lambda a bien écrit dans DynamoDB. **Effet 2** — `receive-message` renvoie une enveloppe SNS contenant `Fichier traite : rapport.pdf` : la notification a été diffusée jusqu'à SQS. **Le pipeline complet fonctionne** : S3 → Lambda → (DynamoDB + SNS → SQS). 🎉 Si l'un des deux effets manque, vois le troubleshooting (souvent la permission Lambda ou l'endpoint boto3).
:::

:::lang en
**✅ Check:** `terraform apply` ends `Apply complete!` (remaining resources added). After dropping `rapport.pdf`: **Effect 1** — `get-item` returns `rapport.pdf   traite`: the Lambda wrote to DynamoDB. **Effect 2** — `receive-message` returns an SNS envelope containing `Fichier traite : rapport.pdf`: the notification was broadcast all the way to SQS. **The full pipeline works**: S3 → Lambda → (DynamoDB + SNS → SQS). 🎉 If either effect is missing, see troubleshooting (often the Lambda permission or the boto3 endpoint).
:::

### step-07

:::lang fr
**Objectif.** Prouver l'**idempotence**, préparer le **livrable CV**, puis **détruire** proprement.

**🤔 Le critère de qualité IaC.** Un projet Terraform sérieux est **idempotent** : relancer `apply` sans rien changer ne doit produire **aucune** modification. Et il se **détruit** d'une commande — pas de ressource oubliée qui traîne (ou facture, en réel). C'est la discipline qui distingue un projet pro.

Vérifie l'idempotence puis détruis :
:::

:::lang en
**Goal.** Prove **idempotence**, prepare the **CV deliverable**, then **destroy** cleanly.

**🤔 The IaC quality criterion.** A serious Terraform project is **idempotent**: rerunning `apply` without changing anything must produce **no** modification. And it **destroys** in one command — no forgotten resource lingering (or billing, in real AWS). It's the discipline that sets a pro project apart.

Check idempotence then destroy:
:::

```bash
# Idempotence : un 2e apply ne doit RIEN changer / a 2nd apply must change NOTHING
terraform apply -auto-approve

# Tout détruire proprement / destroy everything cleanly
terraform destroy -auto-approve
awslocal s3 ls ; awslocal dynamodb list-tables --query 'TableNames' --output text
```

:::lang fr
**✅ Vérification :** le **second** `terraform apply` affiche `No changes. Your infrastructure matches the configuration.` — c'est **la** preuve d'idempotence (Terraform compare l'état voulu à l'état réel, et ne voit rien à faire). `terraform destroy` supprime toutes les ressources — **y compris le bucket, que `force_destroy = true` vide d'abord** (le `rapport.pdf` déposé à l'étape 6 le rend non vide ; sans ce réglage, `destroy` échouerait en `BucketNotEmpty`). Après, `s3 ls` et `dynamodb list-tables` sont vides. Ton pipeline se déploie **et** se démonte d'une commande. ⚠️ En réel, ce `destroy` est ce qui t'évite une facture — prends-en le réflexe. Tu as un projet serverless complet, idempotent, reproductible.
:::

:::lang en
**✅ Check:** the **second** `terraform apply` shows `No changes. Your infrastructure matches the configuration.` — that's **the** idempotence proof (Terraform compares desired state to real state, and sees nothing to do). `terraform destroy` removes all resources — **including the bucket, which `force_destroy = true` empties first** (the `rapport.pdf` uploaded in step 6 makes it non-empty; without this setting, `destroy` would fail with `BucketNotEmpty`). After, `s3 ls` and `dynamodb list-tables` are empty. Your pipeline deploys **and** tears down in one command. ⚠️ In real AWS, this `destroy` is what saves you a bill — build the reflex. You have a complete, idempotent, reproducible serverless project.
:::

## pitfalls

:::lang fr
**1. Oublier le bloc `endpoints` du provider.** Sans lui, Terraform vise le **vrai** AWS (et échouera faute de credentials valides, ou pire). Le bloc `endpoints` + `test`/`test` + `skip_*` est ce qui redirige vers LocalStack.

**2. Endpoint boto3 manquant dans la Lambda.** Depuis le conteneur d'exécution, la fonction ne joint pas `localhost:4566`. Crée les clients avec `endpoint_url=os.environ.get("AWS_ENDPOINT_URL")` : LocalStack injecte la variable, et en réel elle est absente (boto3 vise le vrai AWS). Sans ça, la Lambda plante ou n'écrit rien.

**3. Déclencheur S3 sans permission Lambda.** `aws_s3_bucket_notification` seul ne suffit pas : il faut `aws_lambda_permission` autorisant `s3.amazonaws.com`, **avant** (via `depends_on`). Sinon la notification est refusée ou muette.

**4. Fan-out SNS→SQS sans queue policy.** SNS ne peut déposer dans la file que si une `aws_sqs_queue_policy` l'autorise. Sans elle, l'abonnement existe mais aucun message n'arrive.

**5. `source_code_hash` oublié.** Sans lui, Terraform ne détecte pas les changements de code : tu modifies `handler.py`, `apply` ne redéploie pas la fonction. `source_code_hash = data.archive_file.code.output_base64sha256` règle ça.

**6. Politique de rôle trop large.** `dynamodb:*` sur `*` marche mais viole le moindre privilège. Cible `PutItem` sur l'ARN de **ta** table, `Publish` sur **ton** topic. L'examen (et un bon reviewer) le remarquent.

**7. Ne pas détruire.** En LocalStack c'est gratuit, mais l'habitude compte : `terraform destroy` à la fin. En réel, une ressource oubliée = une facture mensuelle silencieuse.

**8. Lancer LocalStack sans le socket.** Le pipeline utilise Lambda : sans `-v /var/run/docker.sock:...`, la fonction reste `Failed` et rien ne se déclenche. Relance LocalStack avec le socket (prérequis).
:::

:::lang en
**1. Forgetting the provider's `endpoints` block.** Without it, Terraform targets **real** AWS (and will fail for lack of valid credentials, or worse). The `endpoints` block + `test`/`test` + `skip_*` is what redirects to LocalStack.

**2. Missing boto3 endpoint in the Lambda.** From the execution container, the function can't reach `localhost:4566`. Create clients with `endpoint_url=os.environ.get("AWS_ENDPOINT_URL")`: LocalStack injects the variable, and in real AWS it's absent (boto3 targets real AWS). Without it, the Lambda crashes or writes nothing.

**3. S3 trigger without Lambda permission.** `aws_s3_bucket_notification` alone isn't enough: you need `aws_lambda_permission` allowing `s3.amazonaws.com`, **before** (via `depends_on`). Otherwise the notification is refused or silent.

**4. SNS→SQS fan-out without a queue policy.** SNS can deposit into the queue only if an `aws_sqs_queue_policy` allows it. Without it, the subscription exists but no message arrives.

**5. Forgetting `source_code_hash`.** Without it, Terraform doesn't detect code changes: you edit `handler.py`, `apply` doesn't redeploy the function. `source_code_hash = data.archive_file.code.output_base64sha256` fixes it.

**6. Too-broad role policy.** `dynamodb:*` on `*` works but violates least privilege. Target `PutItem` on **your** table's ARN, `Publish` on **your** topic. The exam (and a good reviewer) notice.

**7. Not destroying.** In LocalStack it's free, but the habit matters: `terraform destroy` at the end. In real AWS, a forgotten resource = a silent monthly bill.

**8. Launching LocalStack without the socket.** The pipeline uses Lambda: without `-v /var/run/docker.sock:...`, the function stays `Failed` and nothing triggers. Relaunch LocalStack with the socket (prerequisites).
:::

## success

:::lang fr
Tu sais que le projet est réussi quand…

- [ ] `terraform init` télécharge les providers et le bloc `endpoints` vise LocalStack.
- [ ] S3, DynamoDB, Lambda+rôle, déclencheur, SNS+SQS sont tous en `.tf`.
- [ ] La politique du rôle Lambda est en **moindre privilège** (PutItem + Publish ciblés).
- [ ] Un dépôt S3 fait apparaître une entrée DynamoDB (`statut = traite`).
- [ ] Le même dépôt fait arriver un message dans la file SQS (via SNS).
- [ ] Un **2e** `terraform apply` affiche `No changes` (idempotence).
- [ ] `terraform destroy` nettoie tout, et ton dépôt Git a un **README d'architecture**.

Sept cases = tu as un projet serverless de niveau entreprise, prêt pour ton CV. 🏆
:::

:::lang en
You know the project is a success when…

- [ ] `terraform init` downloads the providers and the `endpoints` block targets LocalStack.
- [ ] S3, DynamoDB, Lambda+role, trigger, SNS+SQS are all in `.tf`.
- [ ] The Lambda role's policy is **least privilege** (targeted PutItem + Publish).
- [ ] An S3 upload makes a DynamoDB entry appear (`statut = traite`).
- [ ] The same upload makes a message arrive in the SQS queue (via SNS).
- [ ] A **2nd** `terraform apply` shows `No changes` (idempotence).
- [ ] `terraform destroy` cleans everything, and your Git repo has an **architecture README**.

Seven boxes = you have an enterprise-grade serverless project, ready for your CV. 🏆
:::

## next

:::lang fr
**Mettre ce projet sur ton CV.** Tu viens de produire une preuve concrète. Voici comment la valoriser.

Structure de dépôt à pousser sur GitHub (le README est ce que le recruteur lit en premier — écris-le comme un schéma d'architecture) :
:::

:::lang en
**Put this project on your CV.** You've just produced concrete proof. Here's how to leverage it.

Repo structure to push to GitHub (the README is what a recruiter reads first — write it like an architecture diagram):
:::

    projet-serverless/
    ├── README.md            # architecture, prérequis, "terraform apply"
    ├── provider.tf          # provider AWS -> LocalStack (endpoints)
    ├── storage.tf           # bucket S3 + table DynamoDB
    ├── lambda.tf            # rôle IAM (moindre privilège) + fonction (archive_file)
    ├── trigger.tf           # permission + notification S3 -> Lambda
    ├── notifications.tf     # SNS + SQS + abonnement + queue policy (fan-out)
    └── lambda/
        └── handler.py       # code : lit l'événement S3, écrit DynamoDB, publie SNS

:::lang fr
**Le pitch (2 phrases pour l'entretien) :** « J'ai construit un pipeline serverless événementiel sur AWS, entièrement en Terraform : un dépôt de fichier dans S3 déclenche une fonction Lambda qui catalogue le fichier dans DynamoDB et publie une notification diffusée en fan-out SNS→SQS. Rôle IAM en moindre privilège, infrastructure idempotente, déployable et destructible d'une commande. »

**Pour aller plus loin :**

1. Ajoute un **traitement réel** dans la Lambda (extraire les métadonnées, redimensionner une image).
2. Ajoute une **seconde file** abonnée au même sujet (fan-out à deux consommateurs) et une **DLQ**.
3. Découpe en **modules Terraform** réutilisables (un module « pipeline »).
4. **Passe en réel** : le guide suivant t'explique comment déployer ce même projet sur un vrai compte AWS free-tier, avec les garde-fous de coût.
:::

:::lang en
**The pitch (2 sentences for the interview):** "I built an event-driven serverless pipeline on AWS, entirely in Terraform: a file upload to S3 triggers a Lambda function that catalogs the file in DynamoDB and publishes a notification fanned out SNS→SQS. Least-privilege IAM role, idempotent infrastructure, deployable and destroyable in one command."

**To go further:**

1. Add **real processing** in the Lambda (extract metadata, resize an image).
2. Add a **second queue** subscribed to the same topic (fan-out to two consumers) and a **DLQ**.
3. Split into reusable **Terraform modules** (a "pipeline" module).
4. **Go real**: the next guide shows how to deploy this same project on a real AWS free-tier account, with cost guardrails.
:::

## cheatsheet

:::lang fr
Aide-mémoire du projet.
:::

:::lang en
Project cheat sheet.
:::

```bash
# Cycle Terraform / Terraform cycle
terraform init                    # télécharger les providers / download providers
terraform validate                # vérifier syntaxe & références / check syntax & refs
terraform plan                    # prévisualiser les changements / preview changes
terraform apply -auto-approve     # déployer / deploy
terraform apply -auto-approve     # 2e fois -> "No changes" (idempotence) / 2nd time
terraform destroy -auto-approve   # tout détruire / destroy everything

# Tester le pipeline / test the pipeline
awslocal s3 cp fichier s3://uploads-pipeline/fichier      # déclencher / trigger
awslocal dynamodb get-item --table-name catalogue-fichiers --key '{"id":{"S":"fichier"}}'
awslocal sqs receive-message --queue-url $(awslocal sqs get-queue-url --queue-name consommateur-aval --query QueueUrl --output text)
```

```hcl
# Le motif clé : empaqueter la Lambda par Terraform / the key pattern: package the Lambda
data "archive_file" "code" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/fonction.zip"
}
# ... source_code_hash = data.archive_file.code.output_base64sha256 (détecte les changements de code)
```

## resources

:::lang fr
- [LocalStack + Terraform](https://docs.localstack.cloud/user-guide/integrations/terraform/) — configurer le provider.
- [Provider AWS Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) — toutes les ressources.
- [`archive_file`](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) — empaqueter du code.
- [Notifications d'événements S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/NotificationHowTo.html) — déclencher Lambda/SNS/SQS.
- [Architectures serverless AWS](https://aws.amazon.com/serverless/) — motifs de référence.
:::

:::lang en
- [LocalStack + Terraform](https://docs.localstack.cloud/user-guide/integrations/terraform/) — configure the provider.
- [Terraform AWS provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) — all resources.
- [`archive_file`](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) — package code.
- [S3 event notifications](https://docs.aws.amazon.com/AmazonS3/latest/userguide/NotificationHowTo.html) — trigger Lambda/SNS/SQS.
- [AWS serverless architectures](https://aws.amazon.com/serverless/) — reference patterns.
:::

## troubleshooting

:::lang fr
**`terraform init` échoue sur registry.terraform.io.** Problème réseau vers le registre HashiCorp. Vérifie ta connexion ; le provider se télécharge une fois puis est mis en cache dans `.terraform/`.

**`apply` échoue « connection refused » sur localhost:4566.** LocalStack n'est pas lancé ou pas prêt. Vérifie `docker ps` et le `health`, puis relance `apply`.

**Le dépôt S3 ne crée pas d'entrée DynamoDB.** La Lambda ne s'est pas exécutée ou a planté. Vérifie que LocalStack a le **socket Docker** (sinon `Failed`), que la **permission** S3→Lambda existe, et que le code utilise `endpoint_url=os.environ.get("AWS_ENDPOINT_URL")`.

**Pas de message dans SQS après le dépôt.** L'abonnement SNS→SQS ou la **queue policy** manque. Vérifie que `aws_sqs_queue_policy` autorise `sns.amazonaws.com`, et que la Lambda publie bien (Effet 1 OK mais pas Effet 2 = souci SNS/SQS, pas Lambda).

**`Unable to validate the following destination configurations`.** La notification S3 est créée avant la permission Lambda. Ajoute `depends_on = [aws_lambda_permission...]` sur la notification.

**Je modifie `handler.py` mais `apply` ne redéploie pas.** Il manque `source_code_hash` sur `aws_lambda_function`. Ajoute `source_code_hash = data.archive_file.code.output_base64sha256`.

**`terraform destroy` échoue en `BucketNotEmpty`.** Le bucket contient des objets (le fichier de test). La solution propre est `force_destroy = true` sur `aws_s3_bucket` (déjà dans le projet) : `destroy` le vide alors tout seul. En dépannage manuel : `awslocal s3 rm s3://uploads-pipeline --recursive` puis relance `destroy`.
:::

:::lang en
**`terraform init` fails on registry.terraform.io.** Network issue to the HashiCorp registry. Check your connection; the provider downloads once then is cached in `.terraform/`.

**`apply` fails "connection refused" on localhost:4566.** LocalStack isn't started or not ready. Check `docker ps` and `health`, then rerun `apply`.

**The S3 upload doesn't create a DynamoDB entry.** The Lambda didn't run or crashed. Check LocalStack has the **Docker socket** (else `Failed`), the S3→Lambda **permission** exists, and the code uses `endpoint_url=os.environ.get("AWS_ENDPOINT_URL")`.

**No SQS message after the upload.** The SNS→SQS subscription or the **queue policy** is missing. Check `aws_sqs_queue_policy` allows `sns.amazonaws.com`, and the Lambda publishes (Effect 1 OK but not Effect 2 = SNS/SQS issue, not Lambda).

**`Unable to validate the following destination configurations`.** The S3 notification is created before the Lambda permission. Add `depends_on = [aws_lambda_permission...]` on the notification.

**I edit `handler.py` but `apply` doesn't redeploy.** Missing `source_code_hash` on `aws_lambda_function`. Add `source_code_hash = data.archive_file.code.output_base64sha256`.

**`terraform destroy` fails with `BucketNotEmpty`.** The bucket holds objects (the test file). The clean fix is `force_destroy = true` on `aws_s3_bucket` (already in the project): `destroy` then empties it on its own. Manual workaround: `awslocal s3 rm s3://uploads-pipeline --recursive` then rerun `destroy`.
:::
