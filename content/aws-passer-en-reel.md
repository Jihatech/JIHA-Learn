---
# — Identité (ne change JAMAIS une fois publié) —
id: aws-passer-en-reel
slug: aws-passer-en-reel
order: 51
status: published

# — Titres & accroches (bilingue) —
title_fr: "AWS — passer en réel proprement"
title_en: "AWS — going real, cleanly"
tagline_fr: "compte AWS, sécurité du root, garde-fous de coût, ce que LocalStack cachait."
tagline_en: "AWS account, root security, cost guardrails, what LocalStack hid."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 180
repo: "localstack/localstack"
last_review: "2026-08-13"

# — Relations de parcours (par id) —
prerequisites: [aws-projet-entreprise]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [compte-aws, securite-root-mfa, utilisateur-iam-cli, garde-fous-cout, budgets-alarmes, localstack-vs-reel, discipline-nettoyage]
concepts_en: [aws-account, root-mfa-security, iam-user-cli, cost-guardrails, budgets-alarms, localstack-vs-real, cleanup-discipline]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "La transition du labo au vrai AWS, sans mauvaise surprise : créer un compte et sécuriser le root (MFA), créer un utilisateur IAM et configurer la CLI, poser des garde-fous de coût (AWS Budgets, alarmes de facturation, suivi free-tier), basculer ton projet Terraform de LocalStack vers le réel (retirer le bloc endpoints), et comprendre tout ce que LocalStack cachait (Block Public Access, application d'IAM, unicité des noms, démarrage à froid, cohérence). Plus la discipline de nettoyage anti-facture."
og_description_en: "The transition from lab to real AWS, with no nasty surprise: create an account and secure the root (MFA), create an IAM user and configure the CLI, set cost guardrails (AWS Budgets, billing alarms, free-tier tracking), switch your Terraform project from LocalStack to real (remove the endpoints block), and understand everything LocalStack hid (Block Public Access, IAM enforcement, name uniqueness, cold start, consistency). Plus the anti-bill cleanup discipline."
---

## intro

:::lang fr
Tu as appris tout AWS **sans compte, sans carte, sans risque** grâce à LocalStack. À un moment, tu voudras (ou devras) toucher au **vrai** AWS : pour l'examen, pour un projet client, pour valider en conditions réelles. Ce guide est le **pont** — et surtout le **garde-fou**. Car le vrai AWS a une différence de taille avec LocalStack : **il facture**. Une ressource oubliée, un bucket rendu public, une passerelle NAT laissée tourner, et tu retrouves une facture surprise en fin de mois. Ce guide t'apprend à passer en réel **proprement** : sécuriser ton compte, poser des garde-fous de coût **avant** de créer quoi que ce soit, et garder la discipline de nettoyage.

On y va dans l'ordre qui évite les catastrophes : d'abord **créer et verrouiller** le compte (le root est tout-puissant — on le protège et on ne s'en sert plus), puis un **utilisateur IAM** pour le quotidien, puis — **avant toute ressource** — les **garde-fous de coût** (budgets, alarmes de facturation). Ensuite seulement on bascule ton **projet Terraform** de LocalStack vers le réel (spoiler : c'est presque juste retirer le bloc `endpoints`). Enfin, on démonte les **illusions de LocalStack** : ce que l'émulateur cachait et qui compte vraiment en production.

⚠️ **Ce guide implique de VRAIES actions sur un VRAI compte AWS**, qui peuvent **coûter de l'argent** si tu n'es pas discipliné·e. On reste dans l'**offre gratuite** (free tier) et on nettoie tout — mais lis chaque avertissement. Les vérifications « ✅ » décrivent ce que tu dois voir dans la console/CLI, pas des commandes de labo à rejouer à l'aveugle.

**Pour qui c'est :** tu as terminé tout le track AWS (jusqu'au projet serverless) et tu es prêt·e à mettre le pied dans le vrai cloud.

**Quand ce n'est PAS le bon choix :**

- Tu veux juste réviser/t'entraîner → reste sur **LocalStack**, c'est gratuit et sans risque.
- Tu n'es pas sûr·e de pouvoir surveiller tes coûts → pose **d'abord** les garde-fous de ce guide (étape 3), puis reviens créer des ressources.
:::

:::lang en
You learned all of AWS **with no account, no card, no risk** thanks to LocalStack. At some point, you'll want (or need) to touch **real** AWS: for the exam, a client project, a real-conditions validation. This guide is the **bridge** — and above all the **guardrail**. Because real AWS has one big difference from LocalStack: **it bills**. A forgotten resource, a bucket made public, a NAT gateway left running, and you find a surprise bill at month's end. This guide teaches you to go real **cleanly**: secure your account, set cost guardrails **before** creating anything, and keep cleanup discipline.

We go in the disaster-avoiding order: first **create and lock down** the account (the root is all-powerful — protect it and stop using it), then an **IAM user** for daily work, then — **before any resource** — the **cost guardrails** (budgets, billing alarms). Only then do we switch your **Terraform project** from LocalStack to real (spoiler: it's almost just removing the `endpoints` block). Finally, we dismantle **LocalStack's illusions**: what the emulator hid and what truly matters in production.

⚠️ **This guide involves REAL actions on a REAL AWS account**, which can **cost money** if you're not disciplined. We stay in the **free tier** and clean everything up — but read every warning. The "✅" checks describe what you should see in the console/CLI, not lab commands to replay blindly.

**Who it's for:** you've finished the whole AWS track (through the serverless project) and you're ready to step into the real cloud.

**When it's NOT the right choice:**

- You just want to revise/practice → stay on **LocalStack**, it's free and risk-free.
- You're not sure you can watch your costs → set the guardrails from this guide **first** (step 3), then come back to create resources.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- **Créer un compte AWS** et **verrouiller le root** (MFA, arrêt de l'usage quotidien).
- Créer un **utilisateur/rôle IAM** administrateur et **configurer la CLI** avec de vraies clés.
- Poser les **garde-fous de coût** : AWS Budgets, alarme de facturation, suivi du free-tier.
- **Basculer ton projet Terraform** de LocalStack vers le vrai AWS (bloc `endpoints`, profils, état distant).
- Reconnaître **ce que LocalStack cachait** (Block Public Access, application d'IAM, unicité des noms, démarrage à froid, cohérence, coûts réseau).
- Appliquer la **discipline de nettoyage** anti-facture.
- Préparer et passer l'**examen SAA-C03**.
:::

:::lang en
By the end of this guide, you can:

- **Create an AWS account** and **lock down the root** (MFA, stop daily use).
- Create an admin **IAM user/role** and **configure the CLI** with real keys.
- Set **cost guardrails**: AWS Budgets, a billing alarm, free-tier tracking.
- **Switch your Terraform project** from LocalStack to real AWS (`endpoints` block, profiles, remote state).
- Recognize **what LocalStack hid** (Block Public Access, IAM enforcement, name uniqueness, cold start, consistency, network costs).
- Apply the anti-bill **cleanup discipline**.
- Prepare for and take the **SAA-C03 exam**.
:::

## prerequisites

:::lang fr
- **Tout le track AWS** terminé, projet serverless compris — tu connais les services et les commandes.
- Une **carte bancaire** (AWS l'exige à l'inscription, même pour le free tier ; un débit de vérification de ~1 $ peut apparaître puis être remboursé).
- Une **application d'authentification** (Google Authenticator, Authy, 1Password…) pour la MFA.
- **aws-cli v2** installé (`aws --version`). Terraform pour la partie IaC.
- ⚠️ **Un budget mental « je nettoie tout »**. Rien de ce guide ne doit te coûter plus de quelques centimes si tu suis la discipline — mais le vrai AWS ne pardonne pas l'oubli.
:::

:::lang en
- **The whole AWS track** done, serverless project included — you know the services and commands.
- A **credit card** (AWS requires it at signup, even for the free tier; a ~$1 verification charge may appear then be refunded).
- An **authenticator app** (Google Authenticator, Authy, 1Password…) for MFA.
- **aws-cli v2** installed (`aws --version`). Terraform for the IaC part.
- ⚠️ **A "clean everything up" mindset**. Nothing in this guide should cost you more than a few cents if you follow the discipline — but real AWS doesn't forgive forgetting.
:::

## concepts

:::lang fr
**Compte AWS & utilisateur root.** À l'inscription, tu obtiens un **compte** identifié par un e-mail, et son **utilisateur root** — un accès **total et irrévocable** à tout, y compris la facturation et la fermeture du compte. Le root est si puissant qu'on le **sécurise au maximum** (MFA obligatoire) et qu'on **ne l'utilise plus** au quotidien. Tout le travail passe par des identités IAM à privilèges limités.

**Offre gratuite (free tier).** AWS offre, pour les nouveaux comptes, des quotas gratuits : certains **12 mois** (ex. 750 h/mois d'EC2 `t2.micro`), d'autres **toujours gratuits** (ex. 1 M de requêtes Lambda/mois, 25 Go DynamoDB), d'autres en **essai**. Rester dans ces quotas = 0 €. **Les dépasser facture** — d'où les garde-fous.

**Garde-fous de coût.** Trois outils : **AWS Budgets** (« préviens-moi si je dépasse 5 $ ce mois »), l'**alarme de facturation** CloudWatch (une alarme sur la métrique de coût estimé), et les **alertes free-tier** (« tu approches d'un quota gratuit »). On les pose **avant** de créer des ressources — c'est la ceinture de sécurité.

**Profils CLI.** `aws configure` enregistre des identifiants. Pour ne pas mélanger labo et prod, on utilise des **profils nommés** (`aws configure --profile perso`) et on les cible (`aws s3 ls --profile perso` ou `AWS_PROFILE=perso`). LocalStack, lui, utilisait `test`/`test` ; en réel, ce sont de vraies clés IAM (ou, mieux, **IAM Identity Center**/SSO).

**Basculer Terraform.** Ton projet LocalStack devient un projet réel en **retirant le bloc `endpoints`** (et les `skip_*`/`s3_use_path_style` de labo) : le provider vise alors le vrai AWS via ton profil. Bonus prod : un **état distant** (`backend "s3"`) pour partager l'état en équipe, au lieu du `terraform.tfstate` local.

**Ce que LocalStack émulait « en gentil ».** L'émulateur ne **facture pas**, n'**applique pas** toujours les règles de sécurité (IAM, Block Public Access), ignore l'**unicité mondiale** des noms de bucket, n'a pas de **démarrage à froid** Lambda réaliste, et masque la **cohérence à terme** de certains services. En réel, tout ça compte.
:::

:::lang en
**AWS account & root user.** At signup, you get an **account** identified by an email, and its **root user** — **total, irrevocable** access to everything, including billing and closing the account. The root is so powerful that you **secure it to the max** (mandatory MFA) and **stop using it** day to day. All work goes through limited-privilege IAM identities.

**Free tier.** AWS offers new accounts free quotas: some for **12 months** (e.g. 750 h/month of EC2 `t2.micro`), some **always free** (e.g. 1M Lambda requests/month, 25 GB DynamoDB), some **trials**. Staying within these = €0. **Exceeding them bills** — hence the guardrails.

**Cost guardrails.** Three tools: **AWS Budgets** ("warn me if I exceed $5 this month"), the CloudWatch **billing alarm** (an alarm on the estimated-charges metric), and **free-tier alerts** ("you're nearing a free quota"). You set them **before** creating resources — it's the seatbelt.

**CLI profiles.** `aws configure` stores credentials. To avoid mixing lab and prod, use **named profiles** (`aws configure --profile perso`) and target them (`aws s3 ls --profile perso` or `AWS_PROFILE=perso`). LocalStack used `test`/`test`; in real life these are real IAM keys (or, better, **IAM Identity Center**/SSO).

**Switching Terraform.** Your LocalStack project becomes a real project by **removing the `endpoints` block** (and the lab `skip_*`/`s3_use_path_style`): the provider then targets real AWS via your profile. Prod bonus: a **remote state** (`backend "s3"`) to share state across a team, instead of the local `terraform.tfstate`.

**What LocalStack emulated "leniently".** The emulator doesn't **bill**, doesn't always **enforce** security rules (IAM, Block Public Access), ignores bucket names' **global uniqueness**, has no realistic Lambda **cold start**, and hides some services' **eventual consistency**. In real life, all of that matters.
:::

:::figure aws-lab-to-real
caption_fr: "Schéma 1. Du labo au réel : le même projet, deux cibles. LocalStack (gratuit, endpoints locaux, IAM non appliqué) → AWS réel (facturé, profil IAM, garde-fous de coût obligatoires). La bascule Terraform = retirer le bloc endpoints."
caption_en: "Figure 1. From lab to real: the same project, two targets. LocalStack (free, local endpoints, IAM not enforced) → real AWS (billed, IAM profile, mandatory cost guardrails). The Terraform switch = remove the endpoints block."
:::

## walkthrough

:::lang fr
On avance ainsi : créer & verrouiller le compte → utilisateur IAM & CLI → garde-fous de coût → basculer Terraform → ce que LocalStack cachait → discipline de nettoyage → cap sur la certification.
:::

:::lang en
We'll go like this: create & lock the account → IAM user & CLI → cost guardrails → switch Terraform → what LocalStack hid → cleanup discipline → onward to certification.
:::

### step-01

:::lang fr
**Objectif.** Créer le **compte AWS** et **verrouiller le root**.

**🤔 Pourquoi verrouiller le root d'abord.** Le root peut **tout** faire, y compris vider ton compte ou générer des coûts illimités. S'il est compromis, c'est terminé. Donc : **MFA immédiate**, pas de clé d'accès root, et on **arrête** de s'en servir dès l'utilisateur IAM créé (étape 2).

Fais ceci **dans la console** ([aws.amazon.com](https://aws.amazon.com) → « Créer un compte ») :

1. Inscris-toi (e-mail, mot de passe **fort et unique**, carte bancaire, vérification téléphone).
2. Une fois connecté **en tant que root** : va dans **IAM** → **active la MFA** sur l'utilisateur root (avec ton app d'authentification).
3. **Ne crée AUCUNE clé d'accès pour le root.** Si des clés root existent, supprime-les.
:::

:::lang en
**Goal.** Create the **AWS account** and **lock down the root**.

**🤔 Why lock the root first.** The root can do **everything**, including draining your account or generating unlimited costs. If it's compromised, it's over. So: **MFA immediately**, no root access keys, and **stop** using it as soon as the IAM user is created (step 2).

Do this **in the console** ([aws.amazon.com](https://aws.amazon.com) → "Create an account"):

1. Sign up (email, **strong and unique** password, credit card, phone verification).
2. Once logged in **as root**: go to **IAM** → **enable MFA** on the root user (with your authenticator app).
3. **Create NO access keys for the root.** If root keys exist, delete them.
:::

:::lang fr
**✅ Vérification :** dans **IAM → Tableau de bord**, l'indicateur de sécurité montre **« MFA activée sur le root »** (coche verte), et **aucune clé d'accès active pour le root**. C'est le minimum vital : un root avec MFA et sans clé long terme est beaucoup plus dur à compromettre. ⚠️ **Note ton numéro de compte** (12 chiffres) et **conserve précieusement** l'accès à l'app MFA — perdre la MFA du root est un cauchemar de récupération.
:::

:::lang en
**✅ Check:** in **IAM → Dashboard**, the security indicator shows **"MFA enabled on root"** (green tick), and **no active access keys for root**. It's the vital minimum: a root with MFA and no long-term key is much harder to compromise. ⚠️ **Note your account number** (12 digits) and **carefully keep** access to the MFA app — losing the root MFA is a recovery nightmare.
:::

### step-02

:::lang fr
**Objectif.** Créer un **utilisateur IAM** administrateur (pour le quotidien) et **configurer la CLI**.

**🤔 Root vs IAM (rappel du guide sécurité).** On ne travaille **jamais** en root. On crée un utilisateur IAM avec les droits admin (ou, mieux en équipe, **IAM Identity Center**/SSO), on lui met la MFA, et c'est **lui** qu'on utilise. Pour la CLI, cet utilisateur a une **clé d'accès** — qu'on garde secrète et qu'on fait tourner.

Dans la console (connecté en root une **dernière** fois) :

1. **IAM → Utilisateurs → Créer** : un utilisateur `admin-perso`, avec la politique gérée `AdministratorAccess` (via un groupe, comme au guide IAM). Active-lui la **MFA**.
2. Crée-lui une **clé d'accès** (type « CLI »), note l'`Access Key ID` et le `Secret` (affiché **une seule fois**).
3. Configure la CLI avec un **profil nommé** :
:::

:::lang en
**Goal.** Create an admin **IAM user** (for daily work) and **configure the CLI**.

**🤔 Root vs IAM (recall from the security guide).** You **never** work as root. You create an IAM user with admin rights (or, better in a team, **IAM Identity Center**/SSO), give it MFA, and use **it**. For the CLI, this user has an **access key** — kept secret and rotated.

In the console (logged in as root one **last** time):

1. **IAM → Users → Create**: a user `admin-perso`, with the managed policy `AdministratorAccess` (via a group, as in the IAM guide). Enable **MFA** for it.
2. Create it an **access key** (type "CLI"), note the `Access Key ID` and `Secret` (shown **only once**).
3. Configure the CLI with a **named profile**:
:::

```bash
# Configurer un profil "perso" avec tes VRAIES clés IAM / configure a "perso" profile with your REAL IAM keys
aws configure --profile perso
# AWS Access Key ID     : AKIA................
# AWS Secret Access Key : ........................................
# Default region name   : eu-west-3        (Paris, ou ta région)
# Default output format : json

# Vérifier QUI tu es sur le VRAI AWS / check WHO you are on REAL AWS
aws sts get-caller-identity --profile perso
```

:::lang fr
**✅ Vérification :** `aws sts get-caller-identity --profile perso` renvoie ton **vrai** numéro de compte (12 chiffres, **pas** `000000000000`) et l'ARN `arn:aws:iam::<compte>:user/admin-perso`. Tu parles maintenant au **vrai** AWS, en tant qu'utilisateur IAM (pas root). ⚠️ **Ne mets JAMAIS ces clés dans Git** ni dans un playbook en clair. Le fichier `~/.aws/credentials` reste **local**. Compare avec LocalStack : là-bas c'était `awslocal` (endpoint local, clés bidon) ; ici c'est `aws --profile perso` (vrai endpoint, vraies clés).
:::

:::lang en
**✅ Check:** `aws sts get-caller-identity --profile perso` returns your **real** account number (12 digits, **not** `000000000000`) and the ARN `arn:aws:iam::<account>:user/admin-perso`. You now talk to **real** AWS, as an IAM user (not root). ⚠️ **NEVER put these keys in Git** or in a clear-text playbook. The `~/.aws/credentials` file stays **local**. Compare with LocalStack: there it was `awslocal` (local endpoint, dummy keys); here it's `aws --profile perso` (real endpoint, real keys).
:::

### step-03

:::lang fr
**Objectif.** Poser les **garde-fous de coût** — **avant** de créer la moindre ressource.

**🤔 L'étape qui t'évite une facture surprise.** C'est **la** raison des histoires d'horreur (« j'ai laissé tourner un truc, 300 $ »). Un **budget** avec alerte te prévient par e-mail dès que tes coûts (réels ou prévus) dépassent un seuil. On le pose **maintenant**, seuil bas, pour dormir tranquille.

Crée un budget mensuel de 5 $ avec alerte (remplace l'e-mail) :
:::

:::lang en
**Goal.** Set the **cost guardrails** — **before** creating any resource.

**🤔 The step that saves you from a surprise bill.** It's **the** reason for the horror stories ("I left something running, $300"). A **budget** with an alert emails you as soon as your costs (actual or forecast) exceed a threshold. Set it **now**, low threshold, to sleep soundly.

Create a $5 monthly budget with an alert (replace the email):
:::

```bash
# Un budget mensuel de 5 $ / a $5 monthly budget
cat > budget.json <<'EOF'
{ "BudgetName": "garde-fou-mensuel", "BudgetLimit": { "Amount": "5", "Unit": "USD" },
  "TimeUnit": "MONTHLY", "BudgetType": "COST" }
EOF
cat > alerte.json <<'EOF'
[ { "Notification": { "NotificationType": "ACTUAL", "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80, "ThresholdType": "PERCENTAGE" },
    "Subscribers": [ { "SubscriptionType": "EMAIL", "Address": "TON-EMAIL@exemple.com" } ] } ]
EOF

aws budgets create-budget --account-id <TON-NUMERO-DE-COMPTE> \
  --budget file://budget.json --notifications-with-subscribers file://alerte.json \
  --profile perso
```

:::lang fr
**✅ Vérification :** la commande ne renvoie **aucune erreur** (sortie vide = succès pour `create-budget`). Dans la console **Billing → Budgets**, ton budget `garde-fou-mensuel` apparaît avec une alerte à **80 % de 5 $** (= 4 $). Tu recevras un e-mail dès que tes coûts réels approchent ce seuil. Active **aussi**, dans **Billing → Préférences**, les **« alertes free-tier »** et les **« CloudWatch billing alerts »**. ⚠️ Ces alertes préviennent **après coup** : elles ne **bloquent** pas la dépense. Ta vraie protection reste la **discipline de nettoyage** (étape 6) — le budget est le filet, pas le mur.
:::

:::lang en
**✅ Check:** the command returns **no error** (empty output = success for `create-budget`). In the **Billing → Budgets** console, your `garde-fou-mensuel` budget appears with an alert at **80% of $5** (= $4). You'll get an email as soon as your actual costs near that threshold. Also enable, in **Billing → Preferences**, the **"free-tier alerts"** and the **"CloudWatch billing alerts"**. ⚠️ These alerts warn you **after the fact**: they don't **block** spending. Your real protection stays the **cleanup discipline** (step 6) — the budget is the net, not the wall.
:::

### step-04

:::lang fr
**Objectif.** **Basculer ton projet Terraform** (le pipeline serverless) de LocalStack vers le **vrai** AWS.

**🤔 La bonne surprise.** Comme tout ton projet est en **infrastructure-as-code**, le passage au réel est minimal : on **retire le bloc `endpoints`** et les réglages de labo, on pointe le provider vers ton **profil** IAM, et `terraform apply` déploie sur le vrai AWS. C'est **exactement** l'intérêt de l'IaC : le même code, une autre cible.

Remplace ton `provider.tf` de labo par une version réelle :
:::

:::lang en
**Goal.** **Switch your Terraform project** (the serverless pipeline) from LocalStack to **real** AWS.

**🤔 The good surprise.** Since your whole project is **infrastructure-as-code**, going real is minimal: you **remove the `endpoints` block** and the lab settings, point the provider at your IAM **profile**, and `terraform apply` deploys to real AWS. It's **exactly** the point of IaC: the same code, another target.

Replace your lab `provider.tf` with a real version:
:::

```hcl
# provider.tf — version RÉELLE (compare avec la version LocalStack) / REAL version
terraform {
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 5.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.0" }
  }
}

provider "aws" {
  region  = "eu-west-3"     # ta région / your region
  profile = "perso"         # ton profil IAM (pas de clés en dur) / your IAM profile (no hardcoded keys)
  # PLUS de bloc endpoints, PLUS de skip_*, PLUS de s3_use_path_style
  # NO more endpoints block, NO skip_*, NO s3_use_path_style
}
```

:::lang fr
⚠️ **Un vrai bucket S3 a un nom UNIQUE MONDIALEMENT.** `uploads-pipeline` est sûrement déjà pris : dans `storage.tf`, préfixe-le d'un identifiant unique, ex. `uploads-pipeline-tonpseudo-2026`.
:::

:::lang en
⚠️ **A real S3 bucket has a GLOBALLY UNIQUE name.** `uploads-pipeline` is surely taken: in `storage.tf`, prefix it with a unique identifier, e.g. `uploads-pipeline-yournick-2026`.
:::

```bash
terraform init            # reconfigure le provider / reconfigure the provider
terraform plan            # PRÉVISUALISE sur le vrai AWS (lis attentivement) / PREVIEW on real AWS
terraform apply           # déploie POUR DE VRAI / deploys FOR REAL
# ... teste comme au projet, avec "aws --profile perso" au lieu de "awslocal" ...
terraform destroy         # !!! DÉTRUIS DÈS QUE TU AS FINI !!! / destroy AS SOON as done
```

:::lang fr
**✅ Vérification :** `terraform plan` liste les ressources à créer **sur ton vrai compte** (relis-le : c'est de l'argent réel). Après `apply`, tu vois tes ressources dans la **console AWS** (S3, Lambda, DynamoDB…) — de tes propres yeux, pour de vrai. Le pipeline fonctionne à l'identique : dépose un fichier, l'entrée apparaît dans DynamoDB. ⚠️ **Fais `terraform destroy` immédiatement après avoir vérifié.** Chaque minute où des ressources tournent peut compter (surtout hors free-tier). Le même code qui coûtait 0 € en LocalStack coûte **maintenant** — d'où la discipline.
:::

:::lang en
**✅ Check:** `terraform plan` lists the resources to create **on your real account** (reread it: it's real money). After `apply`, you see your resources in the **AWS console** (S3, Lambda, DynamoDB…) — with your own eyes, for real. The pipeline works identically: drop a file, the entry appears in DynamoDB. ⚠️ **Run `terraform destroy` immediately after checking.** Every minute resources run can count (especially outside the free tier). The same code that cost €0 in LocalStack **now** costs — hence the discipline.
:::

### step-05

:::lang fr
**Objectif.** Reconnaître **ce que LocalStack cachait** — les différences qui comptent en production.

**🤔 Pourquoi c'est crucial.** LocalStack est génial pour apprendre, mais c'est un émulateur **indulgent**. Certaines choses qui « passaient » en labo se comportent **différemment** en réel — et c'est souvent là que ça casse (ou que ça facture, ou que ça fuit). Voici les pièges à connaître :
:::

:::lang en
**Goal.** Recognize **what LocalStack hid** — the differences that matter in production.

**🤔 Why it's crucial.** LocalStack is great for learning, but it's a **lenient** emulator. Some things that "passed" in the lab behave **differently** in real life — and that's often where things break (or bill, or leak). Here are the traps to know:
:::

:::lang fr
- **IAM est réellement appliqué.** En labo, une action interdite passait quand même. En réel, une politique mal fichue **bloque** ton app (ou, pire, une politique trop large **l'expose**). Le moindre privilège devient concret.
- **Block Public Access est actif par défaut.** Ta bucket policy publique du guide S3 **ne suffit pas** en réel : il faut **explicitement** désactiver le « Block Public Access » (et c'est une décision risquée). LocalStack l'ignorait.
- **Les noms de bucket sont uniques mondialement.** `mon-bucket` est pris. En réel, préfixe systématiquement.
- **Démarrage à froid (cold start) Lambda.** La première invocation après une pause a une **latence** (le runtime démarre). LocalStack ne la simulait pas ; en prod, ça compte pour les API sensibles à la latence.
- **Cohérence à terme.** Certains services (S3 historiquement, DynamoDB en lecture non-consistante) peuvent renvoyer une donnée **légèrement en retard**. LocalStack, local et instantané, masquait ça.
- **Le réseau coûte et se configure.** Une passerelle NAT **facture à l'heure + au Go**. Le trafic **sortant** vers Internet est payant. En labo, gratuit et instantané ; en réel, une ligne de facture.
- **Les quotas et limites existent.** Nombre d'instances, de VPC, de règles… Le vrai AWS a des **quotas de service** (relevables sur demande) que LocalStack ignorait.
:::

:::lang en
- **IAM is actually enforced.** In the lab, a forbidden action went through anyway. In real life, a botched policy **blocks** your app (or, worse, a too-broad policy **exposes** it). Least privilege becomes concrete.
- **Block Public Access is on by default.** Your public bucket policy from the S3 guide is **not enough** in real life: you must **explicitly** disable "Block Public Access" (a risky decision). LocalStack ignored it.
- **Bucket names are globally unique.** `my-bucket` is taken. In real life, always prefix.
- **Lambda cold start.** The first invocation after a pause has **latency** (the runtime boots). LocalStack didn't simulate it; in prod it matters for latency-sensitive APIs.
- **Eventual consistency.** Some services (S3 historically, DynamoDB non-consistent reads) can return **slightly stale** data. LocalStack, local and instant, hid this.
- **Networking costs and configures.** A NAT gateway **bills per hour + per GB**. **Outbound** traffic to the internet is paid. In the lab, free and instant; in real life, a bill line.
- **Quotas and limits exist.** Number of instances, VPCs, rules… Real AWS has **service quotas** (raisable on request) that LocalStack ignored.
:::

:::lang fr
**✅ Vérification :** tu sais expliquer, pour chacun de ces sept points, **en quoi le réel diffère** du labo. Concrètement : si tu redéploies ton projet S3 « site statique » en réel et qu'il n'est pas accessible, tu penses **immédiatement** à « Block Public Access ». Si ta facture monte, tu penses **NAT / trafic sortant**. Cette grille de différences est ce qui transforme « je sais faire en LocalStack » en « je sais faire en production ».
:::

:::lang en
**✅ Check:** you can explain, for each of these seven points, **how real life differs** from the lab. Concretely: if you redeploy your "static site" S3 project for real and it's not reachable, you **immediately** think "Block Public Access". If your bill rises, you think **NAT / outbound traffic**. This grid of differences is what turns "I can do it in LocalStack" into "I can do it in production".
:::

### step-06

:::lang fr
**Objectif.** Ancrer la **discipline de nettoyage** anti-facture.

**🤔 La seule vraie protection.** Les alertes préviennent, elles ne bloquent pas. Ce qui t'évite les surprises, c'est l'**habitude** : tu crées, tu testes, tu **détruis**. Et tu **vérifies** qu'il ne reste rien. Voici le rituel de fin de session sur le vrai AWS.

Le check-list de nettoyage :
:::

:::lang en
**Goal.** Anchor the anti-bill **cleanup discipline**.

**🤔 The only real protection.** Alerts warn, they don't block. What saves you from surprises is the **habit**: you create, you test, you **destroy**. And you **verify** nothing remains. Here's the end-of-session ritual on real AWS.

The cleanup checklist:
:::

```bash
# 1) Détruire l'infra gérée par Terraform / destroy Terraform-managed infra
terraform destroy --profile perso     # ou AWS_PROFILE=perso terraform destroy

# 2) Chercher les ressources "chères" qui traînent / hunt for lingering "expensive" resources
aws ec2 describe-instances --profile perso \
  --query 'Reservations[].Instances[?State.Name!=`terminated`].InstanceId' --output text
aws ec2 describe-nat-gateways --profile perso --query 'NatGateways[?State==`available`].NatGatewayId' --output text
aws ec2 describe-volumes --profile perso --query 'Volumes[?State==`available`].VolumeId' --output text   # volumes EBS orphelins
aws s3 ls --profile perso                                          # buckets restants

# 3) La facture du mois en cours / current month's charges
#    Console : Billing → Bills / Cost Explorer (le réflexe de fin de session)
```

:::lang fr
**✅ Vérification :** après `terraform destroy`, les commandes de « chasse » ne renvoient **rien** (aucune instance non terminée, aucune passerelle NAT `available`, aucun volume orphelin, aucun bucket oublié). Dans **Billing**, la facture du mois reste à **0 $** (ou quelques centimes). ⚠️ Les gros postes à surveiller : **instances EC2** oubliées, **passerelles NAT** (chères !), **volumes EBS** non attachés, **adresses IP Elastic** non associées (facturées si inutilisées), et le **trafic sortant**. Fais cette chasse **à chaque fin de session** : c'est le réflexe qui sépare ceux qui apprennent sereinement de ceux qui reçoivent une facture surprise.
:::

:::lang en
**✅ Check:** after `terraform destroy`, the "hunt" commands return **nothing** (no non-terminated instance, no `available` NAT gateway, no orphan volume, no forgotten bucket). In **Billing**, the month's charges stay at **$0** (or a few cents). ⚠️ The big items to watch: forgotten **EC2 instances**, **NAT gateways** (expensive!), unattached **EBS volumes**, unassociated **Elastic IPs** (billed if unused), and **outbound traffic**. Do this hunt **at every end of session**: it's the reflex that separates those who learn calmly from those who get a surprise bill.
:::

### step-07

:::lang fr
**Objectif.** Décrocher la **certification SAA-C03** — et savoir où aller ensuite.

**🤔 Tu es prêt·e.** Tout le track t'a fait **pratiquer** les services que l'examen teste : IAM, S3, VPC, EC2, Lambda, SQS/SNS/DynamoDB, l'architecture découplée et résiliente, et l'IaC. L'examen **Solutions Architect Associate (SAA-C03)** est un QCM de ~65 questions en 130 min, orienté **« quelle architecture pour ce besoin »** (résilience, sécurité, performance, coût).

La marche à suivre :
:::

:::lang en
**Goal.** Earn the **SAA-C03 certification** — and know where to go next.

**🤔 You're ready.** The whole track had you **practice** the services the exam tests: IAM, S3, VPC, EC2, Lambda, SQS/SNS/DynamoDB, decoupled and resilient architecture, and IaC. The **Solutions Architect Associate (SAA-C03)** exam is a ~65-question MCQ in 130 min, focused on **"which architecture for this need"** (resilience, security, performance, cost).

The plan:
:::

:::lang fr
1. **Révise par domaines** (les 4 de l'examen) : conçois **sécurisé** (IAM, chiffrement), **résilient** (multi-AZ, découplage), **performant** (bon service, bon type), **économique** (bonne classe de stockage, bon compute). Chaque guide du track couvre un pan.
2. **Entraîne-toi aux QCM** : fais des examens blancs (le format « scénario → meilleure réponse » se travaille).
3. **Réserve l'examen** sur [aws.amazon.com/certification](https://aws.amazon.com/certification/certified-solutions-architect-associate/) (en ligne surveillé ou en centre).
4. **Le jour J** : lis chaque question en cherchant les mots-clés (« le plus économique », « hautement disponible », « le moins d'administration ») — ils pointent la bonne réponse.

**Après le SAA :** SysOps ou Developer Associate (même socle), puis les **pro** (Solutions Architect Professional) ou les **spécialités** (sécurité, réseau, data). Et surtout : **refais tes projets en réel**, avec parcimonie et discipline de coût.
:::

:::lang en
1. **Revise by domains** (the exam's 4): design **secure** (IAM, encryption), **resilient** (multi-AZ, decoupling), **high-performing** (right service, right type), **cost-optimized** (right storage class, right compute). Each track guide covers one facet.
2. **Practice MCQs**: take mock exams (the "scenario → best answer" format is a skill).
3. **Book the exam** at [aws.amazon.com/certification](https://aws.amazon.com/certification/certified-solutions-architect-associate/) (online proctored or at a center).
4. **On the day**: read each question hunting for keywords ("most cost-effective", "highly available", "least administration") — they point to the right answer.

**After SAA:** SysOps or Developer Associate (same base), then the **pro** (Solutions Architect Professional) or the **specialties** (security, networking, data). And above all: **redo your projects for real**, sparingly and with cost discipline.
:::

:::lang fr
**✅ Vérification :** tu as un compte AWS **sécurisé** (root MFA, utilisateur IAM, garde-fous de coût), tu sais **basculer** un projet Terraform du labo au réel, tu connais les **différences** qui comptent, et tu tiens la **discipline de nettoyage**. Tu as la pratique **et** la sécurité. Il ne reste qu'à réserver l'examen. Bonne route, futur·e AWS Solutions Architect. 🏆
:::

:::lang en
**✅ Check:** you have a **secured** AWS account (root MFA, IAM user, cost guardrails), you can **switch** a Terraform project from lab to real, you know the **differences** that matter, and you hold the **cleanup discipline**. You have the practice **and** the safety. All that's left is booking the exam. Safe travels, future AWS Solutions Architect. 🏆
:::

## pitfalls

:::lang fr
**1. Travailler en root.** Le root est pour l'administration du compte (facturation, fermeture), **pas** pour le quotidien. Crée un utilisateur IAM, mets-lui la MFA, et **oublie** le root (sauf urgence).

**2. Créer des ressources AVANT les garde-fous.** Pose **d'abord** le budget et les alertes (étape 3), **ensuite** crée. L'inverse, c'est jouer sans filet.

**3. Committer des clés d'accès.** Une clé IAM dans Git = compte compromis en minutes (des bots scannent GitHub). Jamais de clés en clair ; `~/.aws/credentials` reste local, et on **fait tourner** les clés.

**4. Oublier une passerelle NAT ou une instance.** Ce sont les postes qui **facturent en silence** 24/7. La chasse de fin de session (étape 6) est non négociable.

**5. Croire que la bucket policy publique suffit (comme en labo).** En réel, **Block Public Access** est actif par défaut et prime. Le désactiver est une décision explicite et risquée — à ne faire qu'en connaissance de cause.

**6. Réutiliser un nom de bucket de labo.** `uploads-pipeline` est mondialement unique et sûrement pris. Préfixe toujours en réel.

**7. Laisser Terraform pointer vers le mauvais compte.** Vérifie **toujours** `aws sts get-caller-identity --profile ...` et le `terraform plan` avant `apply` — sur le vrai AWS, un `apply` sur le mauvais profil a des conséquences réelles.

**8. Croire que les alertes bloquent la dépense.** Elles **préviennent**, elles ne **coupent** rien. La vraie protection, c'est la discipline de nettoyage (et, pour aller plus loin, des politiques de contrôle de service).
:::

:::lang en
**1. Working as root.** The root is for account administration (billing, closure), **not** daily work. Create an IAM user, give it MFA, and **forget** the root (except emergencies).

**2. Creating resources BEFORE the guardrails.** Set the budget and alerts **first** (step 3), **then** create. The reverse is playing without a net.

**3. Committing access keys.** An IAM key in Git = account compromised in minutes (bots scan GitHub). Never clear-text keys; `~/.aws/credentials` stays local, and you **rotate** keys.

**4. Forgetting a NAT gateway or an instance.** These are the items that **bill silently** 24/7. The end-of-session hunt (step 6) is non-negotiable.

**5. Thinking the public bucket policy is enough (like in the lab).** In real life, **Block Public Access** is on by default and wins. Disabling it is an explicit, risky decision — only knowingly.

**6. Reusing a lab bucket name.** `uploads-pipeline` is globally unique and surely taken. Always prefix in real life.

**7. Letting Terraform point to the wrong account.** **Always** check `aws sts get-caller-identity --profile ...` and the `terraform plan` before `apply` — on real AWS, an `apply` on the wrong profile has real consequences.

**8. Thinking alerts block spending.** They **warn**, they don't **cut** anything. Real protection is cleanup discipline (and, further, service control policies).
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Ton compte a le **root sécurisé** (MFA, aucune clé root).
- [ ] Tu travailles via un **utilisateur IAM** + profil CLI (`get-caller-identity` ≠ root).
- [ ] Un **budget** avec alerte e-mail est en place **avant** toute ressource.
- [ ] Tu bascules ton projet Terraform vers le réel en **retirant le bloc `endpoints`**.
- [ ] Tu cites les **différences LocalStack ↔ réel** (Block Public Access, IAM appliqué, unicité, cold start, coûts réseau).
- [ ] Tu fais la **chasse de nettoyage** et ta facture reste à ~0 $.
- [ ] Tu as un **plan** pour réserver et passer le SAA-C03.

Sept cases = tu passes du labo au réel **sans te brûler**. Track AWS terminé. 🏆
:::

:::lang en
You know it works when…

- [ ] Your account has a **secured root** (MFA, no root keys).
- [ ] You work via an **IAM user** + CLI profile (`get-caller-identity` ≠ root).
- [ ] A **budget** with email alert is in place **before** any resource.
- [ ] You switch your Terraform project to real by **removing the `endpoints` block**.
- [ ] You can name the **LocalStack ↔ real differences** (Block Public Access, IAM enforced, uniqueness, cold start, network costs).
- [ ] You do the **cleanup hunt** and your bill stays ~$0.
- [ ] You have a **plan** to book and take SAA-C03.

Seven boxes = you go from lab to real **without getting burned**. AWS track complete. 🏆
:::

## next

:::lang fr
**Tu as bouclé le track AWS → SAA-C03.** Récapitulons le chemin : LocalStack & fondamentaux → IAM & sécurité → S3 → réseau VPC → compute EC2/Lambda → découplage SQS/SNS/DynamoDB → projet serverless en Terraform → et enfin le passage en réel maîtrisé.

**Les prochaines étapes :**

1. **Passe le SAA-C03** — tu en as toute la pratique.
2. **Consolide en réel** : refais tes projets sur ton compte, avec la discipline de coût de ce guide.
3. **Élargis** : une autre associate (SysOps, Developer), ou une spécialité (sécurité, réseau, data), ou le niveau **Professional**.
4. **Combine tes tracks** : Terraform provisionne, Ansible configure, Docker/Kubernetes orchestrent, AWS héberge — c'est la pile complète d'un ingénieur cloud/DevOps.
:::

:::lang en
**You've completed the AWS → SAA-C03 track.** Let's recap the path: LocalStack & fundamentals → IAM & security → S3 → VPC networking → EC2/Lambda compute → SQS/SNS/DynamoDB decoupling → serverless Terraform project → and finally a mastered switch to real.

**Next steps:**

1. **Take the SAA-C03** — you have all the practice.
2. **Consolidate for real**: redo your projects on your account, with this guide's cost discipline.
3. **Broaden**: another associate (SysOps, Developer), or a specialty (security, networking, data), or the **Professional** level.
4. **Combine your tracks**: Terraform provisions, Ansible configures, Docker/Kubernetes orchestrate, AWS hosts — that's the full stack of a cloud/DevOps engineer.
:::

## cheatsheet

:::lang fr
Aide-mémoire du passage en réel.
:::

:::lang en
Going-real cheat sheet.
:::

```bash
# Identité & profil / identity & profile
aws configure --profile perso                 # enregistrer de VRAIES clés IAM / store REAL IAM keys
aws sts get-caller-identity --profile perso   # vérifier le compte (≠ 000000000000)
export AWS_PROFILE=perso                       # ou --profile sur chaque commande

# Garde-fous de coût / cost guardrails
aws budgets create-budget --account-id <compte> --budget file://budget.json \
  --notifications-with-subscribers file://alerte.json --profile perso
# Console : Billing → Budgets, Free-tier alerts, CloudWatch billing alerts

# Chasse de nettoyage / cleanup hunt
aws ec2 describe-instances --profile perso --query 'Reservations[].Instances[?State.Name!=`terminated`].InstanceId'
aws ec2 describe-nat-gateways --profile perso --query 'NatGateways[?State==`available`].NatGatewayId'
aws ec2 describe-volumes --profile perso --query 'Volumes[?State==`available`].VolumeId'
terraform destroy --profile perso
```

```hcl
# provider LocalStack -> RÉEL : retirer le bloc endpoints / remove the endpoints block
provider "aws" {
  region  = "eu-west-3"
  profile = "perso"
  # (fini les endpoints/skip_*/s3_use_path_style de labo) / (no more lab endpoints/skip_*/path-style)
}
```

## resources

:::lang fr
- [Créer et sécuriser un compte AWS](https://docs.aws.amazon.com/accounts/latest/reference/welcome-first-time-user.html) — root, MFA, premiers pas.
- [Bonnes pratiques de sécurité IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) — utilisateur, MFA, rotation.
- [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) — alertes de coût.
- [Offre gratuite AWS](https://aws.amazon.com/free/) — quotas 12 mois / toujours gratuits / essais.
- [Certification SAA-C03](https://aws.amazon.com/certification/certified-solutions-architect-associate/) — guide d'examen officiel.
:::

:::lang en
- [Create and secure an AWS account](https://docs.aws.amazon.com/accounts/latest/reference/welcome-first-time-user.html) — root, MFA, first steps.
- [IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) — user, MFA, rotation.
- [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html) — cost alerts.
- [AWS Free Tier](https://aws.amazon.com/free/) — 12-month / always-free / trial quotas.
- [SAA-C03 certification](https://aws.amazon.com/certification/certified-solutions-architect-associate/) — official exam guide.
:::

## troubleshooting

:::lang fr
**`aws ... --profile perso` : « The config profile could not be found ».** Le profil n'est pas configuré. Lance `aws configure --profile perso`. Vérifie `~/.aws/credentials` et `~/.aws/config`.

**`create-budget` : « AccessDenied ».** Ton utilisateur IAM n'a pas les droits de facturation. Le root doit activer « IAM user/role access to Billing » (Compte → paramètres) et donner la permission `budgets:*` (ou `AdministratorAccess`).

**Mon bucket S3 « site public » n'est pas accessible en réel.** **Block Public Access** est actif (par défaut). Désactive-le au niveau du bucket **en connaissance de cause**, puis vérifie la bucket policy. (En labo, LocalStack ignorait ce garde-fou.)

**`terraform apply` échoue « BucketAlreadyExists ».** Le nom de bucket est pris (unicité **mondiale**). Préfixe-le d'un identifiant unique.

**Une facture apparaît alors que je « n'ai rien laissé ».** Cherche les postes silencieux : passerelle NAT, IP Elastic non associée, volume EBS orphelin, instance oubliée dans une **autre région**. Vérifie **toutes** les régions (`--region`).

**J'ai perdu ma MFA root.** Procédure de récupération AWS (e-mail + téléphone du compte). Longue et pénible — d'où l'importance de sauvegarder l'accès à ton app d'authentification.
:::

:::lang en
**`aws ... --profile perso`: "The config profile could not be found".** The profile isn't configured. Run `aws configure --profile perso`. Check `~/.aws/credentials` and `~/.aws/config`.

**`create-budget`: "AccessDenied".** Your IAM user lacks billing rights. The root must enable "IAM user/role access to Billing" (Account → settings) and grant `budgets:*` (or `AdministratorAccess`).

**My "public site" S3 bucket isn't reachable in real life.** **Block Public Access** is on (by default). Disable it at the bucket level **knowingly**, then check the bucket policy. (In the lab, LocalStack ignored this guardrail.)

**`terraform apply` fails "BucketAlreadyExists".** The bucket name is taken (**global** uniqueness). Prefix it with a unique identifier.

**A bill appears though I "left nothing".** Hunt the silent items: NAT gateway, unassociated Elastic IP, orphan EBS volume, an instance forgotten in **another region**. Check **all** regions (`--region`).

**I lost my root MFA.** AWS recovery procedure (account email + phone). Long and painful — hence the importance of backing up access to your authenticator app.
:::
