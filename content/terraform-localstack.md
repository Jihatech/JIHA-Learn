---
# — Identité (ne change JAMAIS une fois publié) —
id: terraform-localstack
slug: terraform-localstack
order: 28.5
status: published

# — Titres & accroches (bilingue) —
title_fr: "Terraform + LocalStack — le cloud AWS, en local"
title_en: "Terraform + LocalStack — AWS cloud, locally"
tagline_fr: "Provisionne S3, DynamoDB et Lambda avec Terraform, sans compte AWS ni facture."
tagline_en: "Provision S3, DynamoDB and Lambda with Terraform, with no AWS account or bill."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 90
repo: "localstack/localstack"
last_review: "2026-10-03"

# — Relations de parcours (par id) —
prerequisites: [terraform-fondamentaux]
next: [terraform-state-avance]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [localstack, endpoints-provider, cloud-emule, s3, dynamodb, lambda, ephemere]
concepts_en: [localstack, provider-endpoints, emulated-cloud, s3, dynamodb, lambda, ephemeral]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Apprends Terraform contre un cloud AWS émulé en local avec LocalStack : zéro compte AWS, zéro facture. Tu lances LocalStack en Docker, tu pointes le provider AWS dessus, puis tu provisionnes un bucket S3, une table DynamoDB et une Lambda — et tu détruis tout d'un apply/destroy."
og_description_en: "Learn Terraform against an AWS cloud emulated locally with LocalStack: no AWS account, no bill. You run LocalStack in Docker, point the AWS provider at it, then provision an S3 bucket, a DynamoDB table and a Lambda — and tear it all down with apply/destroy."
---

## intro

:::lang fr
Apprendre le cloud coûte cher et fait peur : il faut un compte, une carte bancaire, et une mauvaise manip peut te coûter de l'argent réel. Résultat, beaucoup n'osent pas pratiquer.

**LocalStack** règle ça : c'est un cloud **AWS émulé** qui tourne dans un conteneur Docker, sur ta machine. Il parle les **mêmes API** qu'AWS (S3, DynamoDB, Lambda, IAM…). Tu peux donc écrire du **Terraform strictement identique** à celui que tu enverrais en production — mais tout se passe en local, gratuitement, et tu peux tout casser sans conséquence.

Dans ce guide, tu lances LocalStack, tu configures le provider AWS de Terraform pour qu'il pointe dessus, puis tu provisionnes un **bucket S3**, une **table DynamoDB** et une **fonction Lambda**. Le code Terraform est le vrai code AWS : seule la configuration du provider change.

**Pour qui c'est :** tu connais les bases de Terraform (`init`/`plan`/`apply`, une ressource, le state) et tu veux pratiquer les workflows cloud sans payer.

**Quand ce n'est PAS le bon choix :**

- Tu veux apprendre la **console AWS**, l'**IAM réel** ou les **services managés** tels qu'ils se comportent en prod : LocalStack émule les API, pas l'expérience console ni toutes les subtilités d'un vrai provider.
- Tu dois **facturer/estimer des coûts** réels : par définition, il n'y a pas de coût ici.
:::

:::lang en
Learning the cloud is expensive and scary: you need an account, a credit card, and one wrong move can cost real money. So many people never dare to practice.

**LocalStack** fixes this: it's an **emulated AWS cloud** running in a Docker container, on your machine. It speaks the **same APIs** as AWS (S3, DynamoDB, Lambda, IAM…). So you can write **Terraform that's strictly identical** to what you'd ship to production — but everything runs locally, for free, and you can break it all with zero consequence.

In this guide you'll start LocalStack, configure Terraform's AWS provider to point at it, then provision an **S3 bucket**, a **DynamoDB table** and a **Lambda function**. The Terraform code is the real AWS code: only the provider configuration changes.

**Who it's for:** you know Terraform basics (`init`/`plan`/`apply`, a resource, state) and want to practice cloud workflows without paying.

**When it's NOT the right choice:**

- You want to learn the **AWS console**, **real IAM** or **managed services** as they behave in prod: LocalStack emulates the APIs, not the console experience nor every real-provider subtlety.
- You need real **billing/cost estimates**: by definition there is no cost here.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Lancer **LocalStack** en conteneur et vérifier qu'il répond.
- Configurer le **provider AWS** de Terraform pour cibler LocalStack (endpoints, fausses credentials).
- Provisionner un **bucket S3** et y déposer un objet, en local.
- Créer une **table DynamoDB** et une **fonction Lambda** émulées.
- Comprendre le caractère **éphémère** de LocalStack et comment **basculer vers le vrai AWS**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Run **LocalStack** in a container and check it responds.
- Configure Terraform's **AWS provider** to target LocalStack (endpoints, fake credentials).
- Provision an **S3 bucket** and put an object in it, locally.
- Create an emulated **DynamoDB table** and **Lambda function**.
- Understand LocalStack's **ephemeral** nature and how to **switch to real AWS**.
:::

## prerequisites

:::lang fr
- **Docker** installé et fonctionnel (`docker run hello-world` passe).
- **Terraform** ≥ 1.5 (`terraform version`).
- Les **bases de Terraform** : tu as déjà fait un `init`/`plan`/`apply` sur au moins une ressource.
- Optionnel mais confortable : **Python/pip** pour installer `awscli-local` (le wrapper `awslocal`).
:::

:::lang en
- **Docker** installed and working (`docker run hello-world` passes).
- **Terraform** ≥ 1.5 (`terraform version`).
- **Terraform basics**: you've already done an `init`/`plan`/`apply` on at least one resource.
- Optional but handy: **Python/pip** to install `awscli-local` (the `awslocal` wrapper).
:::

## concepts

:::lang fr
**LocalStack** écoute sur un seul port — **4566** — et multiplexe toutes les API AWS dessus. Au lieu d'envoyer tes requêtes à `s3.amazonaws.com`, tu les envoies à `http://localhost:4566`.

Côté Terraform, c'est exactement ce que fait le bloc **`endpoints`** du provider AWS : il redirige chaque service vers LocalStack. On ajoute aussi de **fausses credentials** (`test`/`test`) et on **désactive les vérifications** qui essaieraient de joindre le vrai AWS. Le reste de ton code — `resource "aws_s3_bucket"`, `resource "aws_lambda_function"` — ne change **pas d'une ligne**.

Point clé à retenir : par défaut, LocalStack (édition communauté) est **éphémère** — redémarre le conteneur et tout ce que tu as créé disparaît. C'est une force pour apprendre (repars de zéro en 2 s), mais ça se configure si tu veux de la persistance.
:::

:::lang en
**LocalStack** listens on a single port — **4566** — and multiplexes all AWS APIs on it. Instead of sending requests to `s3.amazonaws.com`, you send them to `http://localhost:4566`.

On the Terraform side, that's exactly what the AWS provider's **`endpoints`** block does: it redirects each service to LocalStack. You also add **fake credentials** (`test`/`test`) and **disable the checks** that would try to reach real AWS. The rest of your code — `resource "aws_s3_bucket"`, `resource "aws_lambda_function"` — doesn't change **one line**.

Key takeaway: by default, LocalStack (community edition) is **ephemeral** — restart the container and everything you created is gone. That's a strength for learning (start fresh in 2s), but you can configure persistence if you want it.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Lancer LocalStack en Docker et vérifier qu'il est en bonne santé.

On le lance via `docker compose` (plus lisible qu'une longue commande `docker run`). Crée un dossier de travail et ce fichier.
:::

:::lang en
**Goal.** Start LocalStack in Docker and check it's healthy.

We launch it via `docker compose` (more readable than a long `docker run`). Create a working folder and this file.
:::

```yaml
# docker-compose.yml
services:
  localstack:
    image: localstack/localstack:3
    ports:
      - "4566:4566"            # unique point d'entrée des API AWS / single AWS API entrypoint
    environment:
      - SERVICES=s3,dynamodb,lambda,iam,sts
      - DEBUG=0
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"   # requis pour Lambda / required for Lambda
```

```bash
docker compose up -d
curl -s http://localhost:4566/_localstack/health   # liste les services et leur état / lists services and their state
```

:::lang fr
**✅ Vérification :** le `curl` renvoie un JSON où `s3`, `dynamodb`, `lambda` apparaissent avec l'état `available` (ou `running`). Si oui, ton « AWS local » écoute sur le port 4566.
:::

:::lang en
**✅ Check:** the `curl` returns JSON where `s3`, `dynamodb`, `lambda` appear with state `available` (or `running`). If so, your "local AWS" is listening on port 4566.
:::

### step-02

:::lang fr
**Objectif.** Pointer le provider AWS de Terraform vers LocalStack.

C'est **la seule partie spécifique à LocalStack**. Crée `main.tf` avec ce bloc `provider`. Les credentials sont bidon (`test`/`test`) : LocalStack ne les vérifie pas, mais le provider en exige.
:::

:::lang en
**Goal.** Point Terraform's AWS provider at LocalStack.

This is **the only LocalStack-specific part**. Create `main.tf` with this `provider` block. The credentials are fake (`test`/`test`): LocalStack doesn't check them, but the provider requires some.
:::

```hcl
# main.tf
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true   # ne pas valider les creds auprès d'AWS / don't validate creds against AWS
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true   # LocalStack sert S3 en "path style"

  # Redirige chaque service vers LocalStack (port 4566).
  # Redirect each service to LocalStack (port 4566).
  endpoints {
    s3       = "http://localhost:4566"
    dynamodb = "http://localhost:4566"
    lambda   = "http://localhost:4566"
    iam      = "http://localhost:4566"
    sts      = "http://localhost:4566"
  }
}
```

:::lang fr
**✅ Vérification :** `terraform init` télécharge le provider AWS et se termine par `Terraform has been successfully initialized!`. Rien n'est encore créé — on a juste branché Terraform sur LocalStack.
:::

:::lang en
**✅ Check:** `terraform init` downloads the AWS provider and ends with `Terraform has been successfully initialized!`. Nothing is created yet — we've just wired Terraform to LocalStack.
:::

### step-03

:::lang fr
**Objectif.** Créer ton premier service : un **bucket S3**, et y déposer un fichier.

Ajoute ces ressources à `main.tf`. Remarque : c'est du Terraform AWS **standard** — ce même code marcherait sur le vrai AWS.
:::

:::lang en
**Goal.** Create your first service: an **S3 bucket**, and put a file in it.

Add these resources to `main.tf`. Note: this is **standard** AWS Terraform — the same code would work on real AWS.
:::

```hcl
resource "aws_s3_bucket" "demo" {
  bucket = "jiha-demo-bucket"
}

resource "aws_s3_object" "hello" {
  bucket  = aws_s3_bucket.demo.id
  key     = "hello.txt"
  content = "Déployé en local avec Terraform + LocalStack / Deployed locally with Terraform + LocalStack"
}
```

```bash
terraform apply -auto-approve
# Vérifie côté "AWS" local (awslocal = aws CLI préconfiguré pour LocalStack) :
# Check on the local "AWS" (awslocal = aws CLI preconfigured for LocalStack):
pip install awscli-local        # fournit la commande "awslocal" / provides the "awslocal" command
awslocal s3 ls
awslocal s3 cp s3://jiha-demo-bucket/hello.txt -
```

:::lang fr
**✅ Vérification :** `awslocal s3 ls` liste `jiha-demo-bucket`, et la dernière commande affiche le contenu du fichier. Tu viens de provisionner du S3 — sans compte AWS.

> Pas de `pip` ? Utilise l'AWS CLI normale en ajoutant l'endpoint : `aws --endpoint-url=http://localhost:4566 s3 ls`.
:::

:::lang en
**✅ Check:** `awslocal s3 ls` lists `jiha-demo-bucket`, and the last command prints the file's content. You just provisioned S3 — with no AWS account.

> No `pip`? Use the normal AWS CLI with the endpoint flag: `aws --endpoint-url=http://localhost:4566 s3 ls`.
:::

### step-04

:::lang fr
**Objectif.** Montrer que plusieurs services coexistent : une **table DynamoDB** et une **Lambda**.

Ajoute une table DynamoDB (NoSQL) et une petite fonction Lambda Python. La Lambda a besoin d'un rôle IAM (émulé lui aussi) et d'un zip de code.
:::

:::lang en
**Goal.** Show that several services coexist: a **DynamoDB table** and a **Lambda**.

Add a DynamoDB table (NoSQL) and a small Python Lambda function. The Lambda needs an IAM role (emulated too) and a code zip.
:::

```hcl
resource "aws_dynamodb_table" "notes" {
  name         = "notes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
}

data "archive_file" "fn" {
  type        = "zip"
  output_path = "${path.module}/fn.zip"
  source {
    content  = "def handler(event, context):\n    return {'ok': True}\n"
    filename = "main.py"
  }
}

resource "aws_iam_role" "lambda" {
  name               = "demo-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow", Action = "sts:AssumeRole",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_lambda_function" "demo" {
  function_name    = "demo-fn"
  role             = aws_iam_role.lambda.arn
  handler          = "main.handler"
  runtime          = "python3.12"
  filename         = data.archive_file.fn.output_path
  source_code_hash = data.archive_file.fn.output_base64sha256
}
```

```bash
terraform apply -auto-approve
awslocal dynamodb list-tables
awslocal lambda invoke --function-name demo-fn /dev/stdout
```

:::lang fr
**✅ Vérification :** `list-tables` montre `notes`, et l'invocation de la Lambda renvoie `{"ok": true}`. Trois services AWS tournent côte à côte, en local.
:::

:::lang en
**✅ Check:** `list-tables` shows `notes`, and invoking the Lambda returns `{"ok": true}`. Three AWS services run side by side, locally.
:::

### step-05

:::lang fr
**Objectif.** Tout détruire, et comprendre l'éphémère.

`terraform destroy` supprime proprement tes ressources (comme sur le vrai AWS). Mais même sans ça, **couper le conteneur efface tout** : LocalStack communautaire ne persiste pas par défaut.
:::

:::lang en
**Goal.** Tear it all down, and understand the ephemeral model.

`terraform destroy` cleanly removes your resources (like on real AWS). But even without it, **stopping the container wipes everything**: community LocalStack doesn't persist by default.
:::

```bash
terraform destroy -auto-approve      # détruit via Terraform / destroy via Terraform
# Ou simplement, pour repartir de zéro / Or simply, to start fresh:
docker compose down                  # tout l'état LocalStack disparaît / all LocalStack state is gone
```

:::lang fr
**✅ Vérification :** après `destroy`, `awslocal s3 ls` ne liste plus le bucket. Après `compose down` puis `up`, l'« AWS » est vierge. Pense donc à **committer ton `.tf`**, pas l'état LocalStack : le code est la source de vérité, pas le conteneur.
:::

:::lang en
**✅ Check:** after `destroy`, `awslocal s3 ls` no longer lists the bucket. After `compose down` then `up`, the "AWS" is blank. So remember to **commit your `.tf`**, not the LocalStack state: the code is the source of truth, not the container.
:::

## pitfalls

:::lang fr
- **Tu oublies le bloc `endpoints`** → Terraform essaie de joindre le vrai AWS et bloque sur les credentials. Les cinq `skip_*` + `endpoints` sont indispensables.
- **Lambda « InternalError » / ne s'invoque pas** → le montage `docker.sock` manque dans le compose : LocalStack lance les Lambdas dans des conteneurs Docker, il lui faut l'accès au socket.
- **S3 « bucket already exists » après un `compose down`** → non : tout est effacé. Si tu as l'erreur, c'est que tu n'as pas coupé le conteneur et que le state Terraform et LocalStack ont divergé (`terraform destroy` d'abord).
- **Tu confonds persistance** : l'état *Terraform* (`terraform.tfstate`) survit sur ton disque, mais les *ressources* LocalStack, non. Au prochain `up`, fais `terraform apply` pour recréer.
:::

:::lang en
- **You forget the `endpoints` block** → Terraform tries to reach real AWS and stalls on credentials. The five `skip_*` + `endpoints` are mandatory.
- **Lambda "InternalError" / won't invoke** → the `docker.sock` mount is missing from the compose: LocalStack runs Lambdas inside Docker containers and needs socket access.
- **S3 "bucket already exists" after a `compose down`** → it shouldn't: everything is wiped. If you hit it, you didn't stop the container and Terraform state and LocalStack diverged (`terraform destroy` first).
- **You conflate persistence**: *Terraform* state (`terraform.tfstate`) survives on your disk, but LocalStack *resources* don't. On the next `up`, run `terraform apply` to recreate them.
:::

## success

:::lang fr
Tu sais que c'est bon quand :

- `curl .../_localstack/health` montre tes services `available`.
- `terraform apply` crée bucket + table + Lambda sans toucher à Internet.
- `awslocal s3 ls`, `awslocal dynamodb list-tables` et l'invocation Lambda répondent.
- `terraform destroy` nettoie tout, et tu peux recréer à volonté — gratuitement.
:::

:::lang en
You know it works when:

- `curl .../_localstack/health` shows your services `available`.
- `terraform apply` creates bucket + table + Lambda without touching the Internet.
- `awslocal s3 ls`, `awslocal dynamodb list-tables` and the Lambda invocation all respond.
- `terraform destroy` cleans everything, and you can recreate at will — for free.
:::

## next

:::lang fr
Tu as pratiqué le **workflow** cloud (provider, ressources, state, apply/destroy) sans payer. Pour passer au **vrai AWS**, tu ne changes quasiment que la config du provider : retire le bloc `endpoints` et les `skip_*`, mets de vraies credentials (`aws configure`), et le **même code** s'applique. Garde LocalStack pour itérer vite et tester tes pipelines, et le vrai cloud pour le capstone.

Enchaîne sur la gestion avancée du **state** (backends distants, verrouillage), puis la **composition** en modules réutilisables.
:::

:::lang en
You've practiced the cloud **workflow** (provider, resources, state, apply/destroy) without paying. To move to **real AWS**, you change almost only the provider config: remove the `endpoints` block and the `skip_*`, set real credentials (`aws configure`), and the **same code** applies. Keep LocalStack to iterate fast and test your pipelines, and real cloud for the capstone.

Move on to advanced **state** management (remote backends, locking), then **composition** into reusable modules.
:::

## cheatsheet

```bash
docker compose up -d                                   # démarre LocalStack / start LocalStack
curl -s http://localhost:4566/_localstack/health       # santé des services / service health
terraform init && terraform apply -auto-approve        # provisionne / provision
awslocal s3 ls                                         # = aws --endpoint-url=http://localhost:4566 s3 ls
awslocal lambda invoke --function-name demo-fn /dev/stdout
terraform destroy -auto-approve                        # nettoie / clean up
docker compose down                                    # efface tout l'état LocalStack / wipe all LocalStack state
```

## resources

:::lang fr
- Documentation LocalStack (couverture des services, édition communauté vs pro).
- Provider AWS Terraform — section « Custom Service Endpoints ».
- `awscli-local` et `terraform-local` (`tflocal`), les wrappers préconfigurés.
:::

:::lang en
- LocalStack documentation (service coverage, community vs pro edition).
- Terraform AWS provider — "Custom Service Endpoints" section.
- `awscli-local` and `terraform-local` (`tflocal`), the preconfigured wrappers.
:::

## troubleshooting

:::lang fr
- **`terraform apply` traîne puis timeout** → le conteneur LocalStack n'est pas lancé ou pas sur 4566 (`docker compose ps`, `docker compose logs localstack`).
- **`InvalidClientTokenId` / erreurs de credentials** → il manque un `skip_*` ou le bloc `endpoints` ne couvre pas le service utilisé (ajoute-le).
- **Lambda reste en `Pending`** → vérifie le montage `/var/run/docker.sock` et que Docker peut tirer l'image de runtime (`docker compose logs localstack`).
- **Port 4566 déjà pris** → un autre LocalStack tourne déjà, ou un service occupe le port (`docker ps`, change le mapping de port si besoin).
:::

:::lang en
- **`terraform apply` hangs then times out** → the LocalStack container isn't running or not on 4566 (`docker compose ps`, `docker compose logs localstack`).
- **`InvalidClientTokenId` / credential errors** → a `skip_*` is missing or the `endpoints` block doesn't cover the service you use (add it).
- **Lambda stays `Pending`** → check the `/var/run/docker.sock` mount and that Docker can pull the runtime image (`docker compose logs localstack`).
- **Port 4566 already in use** → another LocalStack is running, or a service holds the port (`docker ps`, change the port mapping if needed).
:::
