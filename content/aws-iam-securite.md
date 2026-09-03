---
# — Identité (ne change JAMAIS une fois publié) —
id: aws-iam-securite
slug: aws-iam-securite
order: 45
status: published

# — Titres & accroches (bilingue) —
title_fr: "AWS — IAM & sécurité"
title_en: "AWS — IAM & security"
tagline_fr: "utilisateurs, groupes, rôles, politiques JSON, assume-role."
tagline_en: "users, groups, roles, JSON policies, assume-role."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 210
repo: "localstack/localstack"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [aws-fondamentaux]
next: [aws-stockage-s3]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [groupes-iam, politiques-json, moindre-privilege, roles-assume-role, evaluation-permissions, politique-ressource, responsabilite-partagee]
concepts_en: [iam-groups, json-policies, least-privilege, roles-assume-role, permission-evaluation, resource-policy, shared-responsibility]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le socle sécurité du SAA-C03 : gère les identités AWS avec IAM — groupes pour les permissions à l'échelle, politiques JSON personnalisées (Effect/Action/Resource, moindre privilège), rôles et assume-role (le concept clé), logique d'évaluation (deny explicite > allow > deny implicite), politiques basées sur ressource (bucket S3), inline vs managed, et le modèle de responsabilité partagée. En LocalStack : tu construis et relis toute la config IAM."
og_description_en: "The SAA-C03 security foundation: manage AWS identities with IAM — groups for permissions at scale, custom JSON policies (Effect/Action/Resource, least privilege), roles and assume-role (the key concept), evaluation logic (explicit deny > allow > implicit deny), resource-based policies (S3 bucket), inline vs managed, and the shared responsibility model. On LocalStack: you build and read back the whole IAM config."
---

## intro

:::lang fr
IAM (Identity and Access Management) est le service le plus important d'AWS, et de loin le plus testé à l'examen **Solutions Architect Associate**. La raison est simple : sur AWS, **rien** n'est autorisé par défaut. Chaque action — lire un fichier S3, démarrer une machine, envoyer un message — passe par une autorisation IAM. Mal configuré, IAM ouvre ton compte à la terre entière ou, au contraire, bloque ton application. Bien configuré, il applique le **moindre privilège** : chaque identité n'a **que** les permissions dont elle a besoin.

Ce guide te fait construire toute la mécanique IAM : des **groupes** pour gérer les permissions à l'échelle, des **politiques JSON personnalisées** (la grammaire `Effect`/`Action`/`Resource`), des **rôles** et le mécanisme d'**assume-role** (le concept qui déroute le plus les débutants, et qui tombe à tous les examens), la **logique d'évaluation** des permissions, et les **politiques basées sur ressource** (comme les bucket policies S3).

Un point d'honnêteté sur le labo : LocalStack te laisse **créer et relire** toute la configuration IAM (utilisateurs, groupes, rôles, politiques, rattachements) — exactement ce qu'un architecte configure. En revanche il **n'applique pas** l'autorisation (il ne te bloquera pas si une politique interdit une action). On te le signale à chaque fois : tu **construis** et tu **vérifies la structure** ici ; la logique d'autorisation, tu la **raisonnes** (et c'est ce que l'examen teste de toute façon).

**Pour qui c'est :** tu as fait *AWS fondamentaux* (LocalStack, premier bucket, premier utilisateur) et tu veux le socle de sécurité.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas de labo LocalStack qui tourne → refais *AWS fondamentaux* d'abord.
- Tu veux gérer des secrets applicatifs (mots de passe, clés d'API) → c'est plutôt Secrets Manager / Parameter Store ; IAM gère les **identités et permissions**, pas les secrets applicatifs.
:::

:::lang en
IAM (Identity and Access Management) is AWS's most important service, and by far the most tested on the **Solutions Architect Associate** exam. The reason is simple: on AWS, **nothing** is allowed by default. Every action — reading an S3 file, starting a machine, sending a message — goes through IAM authorization. Misconfigured, IAM opens your account to the whole world or, conversely, blocks your application. Well-configured, it applies **least privilege**: each identity has **only** the permissions it needs.

This guide has you build the whole IAM machinery: **groups** to manage permissions at scale, custom **JSON policies** (the `Effect`/`Action`/`Resource` grammar), **roles** and the **assume-role** mechanism (the concept that confuses beginners most, and that shows up on every exam), permission **evaluation logic**, and **resource-based policies** (like S3 bucket policies).

An honesty note about the lab: LocalStack lets you **create and read back** the whole IAM configuration (users, groups, roles, policies, attachments) — exactly what an architect configures. However it does **not** enforce authorization (it won't block you if a policy forbids an action). We flag it each time: you **build** and **verify the structure** here; the authorization logic, you **reason about** (which is what the exam tests anyway).

**Who it's for:** you've done *AWS fundamentals* (LocalStack, first bucket, first user) and you want the security foundation.

**When it's NOT the right choice:**

- You don't have a running LocalStack lab → do *AWS fundamentals* first.
- You want to manage application secrets (passwords, API keys) → that's more Secrets Manager / Parameter Store; IAM manages **identities and permissions**, not application secrets.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Gérer les permissions **à l'échelle** avec des **groupes** IAM.
- Écrire une **politique JSON personnalisée** (`Effect`/`Action`/`Resource`/`Condition`) en **moindre privilège**.
- Lire l'**anatomie** d'une politique et la **logique d'évaluation** (deny explicite > allow > deny implicite).
- Créer un **rôle** avec sa **politique de confiance** et l'endosser via **assume-role**.
- Distinguer politique **basée sur l'identité** et **basée sur la ressource** (bucket policy S3).
- Choisir entre politique **inline**, **gérée par AWS**, et **gérée par le client**.
- Expliquer le **modèle de responsabilité partagée** et les bonnes pratiques (root, MFA, rotation).
:::

:::lang en
By the end of this guide, you can:

- Manage permissions **at scale** with IAM **groups**.
- Write a **custom JSON policy** (`Effect`/`Action`/`Resource`/`Condition`) with **least privilege**.
- Read a policy's **anatomy** and the **evaluation logic** (explicit deny > allow > implicit deny).
- Create a **role** with its **trust policy** and assume it via **assume-role**.
- Tell an **identity-based** from a **resource-based** policy (S3 bucket policy).
- Choose between **inline**, **AWS-managed**, and **customer-managed** policies.
- Explain the **shared responsibility model** and best practices (root, MFA, rotation).
:::

## prerequisites

:::lang fr
- Le guide **AWS fondamentaux** terminé, et **LocalStack qui tourne** (`docker ps` → `localstack` healthy ; sinon `docker run -d --name localstack -p 4566:4566 localstack/localstack:3.8.1`).
- **`awslocal`** configuré (identifiants `test`, région `us-east-1`).
- Un éditeur de texte pour les fichiers de politique JSON.
:::

:::lang en
- The **AWS fundamentals** guide done, and **LocalStack running** (`docker ps` → `localstack` healthy; otherwise `docker run -d --name localstack -p 4566:4566 localstack/localstack:3.8.1`).
- **`awslocal`** configured (creds `test`, region `us-east-1`).
- A text editor for the JSON policy files.
:::

## concepts

:::lang fr
**Les trois identités IAM.** **Utilisateur** : une personne ou une application, avec des identifiants long terme. **Groupe** : un ensemble d'utilisateurs qui partagent des permissions (on attache les politiques au groupe, pas à chaque utilisateur). **Rôle** : une identité **sans identifiants permanents**, qu'on **endosse temporairement** — pour un service AWS (une machine EC2 qui doit lire S3), pour un accès inter-comptes, ou pour une fédération. Le rôle est le mécanisme de sécurité moderne : des identifiants **temporaires**, pas de clés qui traînent.

**Politique.** Un document **JSON** qui décrit des permissions. Sa grammaire : une liste de `Statement`, chacun avec `Effect` (`Allow`/`Deny`), `Action` (les opérations, ex. `s3:GetObject`), `Resource` (sur quoi, via des ARN), et optionnellement `Condition` (quand). Une politique **basée sur l'identité** s'attache à un utilisateur/groupe/rôle. Une politique **basée sur la ressource** s'attache à la ressource elle-même (ex. une **bucket policy** S3).

**Moindre privilège.** Le principe directeur : n'accorde **que** les actions et ressources strictement nécessaires. `s3:*` sur `*` est presque toujours une faute ; `s3:GetObject` sur `arn:aws:s3:::mon-bucket/*` est précis.

**Logique d'évaluation.** Quand AWS décide si une action est permise : (1) tout est **refusé par défaut** (deny implicite) ; (2) un `Allow` explicite l'autorise ; (3) un `Deny` **explicite** l'emporte sur **tout** (même un Allow). Résumé : **Deny explicite > Allow > Deny implicite**. C'est LE mécanisme que l'examen teste.

**assume-role.** Endosser un rôle produit des **identifiants temporaires** (via STS). Deux politiques encadrent un rôle : la **politique de confiance** (`AssumeRolePolicyDocument`) dit **qui** peut l'endosser, et les **politiques de permission** disent **ce que** le rôle permet une fois endossé.

**Types de politiques.** **Gérée par AWS** : prête à l'emploi, maintenue par AWS (`AmazonS3ReadOnlyAccess`). **Gérée par le client** : la tienne, réutilisable, versionnée. **Inline** : collée directement sur une seule identité, non réutilisable (à réserver aux cas très spécifiques).

**Responsabilité partagée.** AWS sécurise le cloud **lui-même** (matériel, datacenters, hyperviseur) ; **toi** tu sécurises ce que tu mets **dedans** (tes données, tes permissions IAM, tes groupes de sécurité). « Security *of* the cloud » (AWS) vs « security *in* the cloud » (toi).
:::

:::lang en
**The three IAM identities.** **User**: a person or application, with long-term credentials. **Group**: a set of users sharing permissions (you attach policies to the group, not to each user). **Role**: an identity **with no permanent credentials**, that you **assume temporarily** — for an AWS service (an EC2 machine that must read S3), for cross-account access, or for federation. The role is the modern security mechanism: **temporary** credentials, no keys lying around.

**Policy.** A **JSON** document describing permissions. Its grammar: a list of `Statement`s, each with `Effect` (`Allow`/`Deny`), `Action` (the operations, e.g. `s3:GetObject`), `Resource` (on what, via ARNs), and optionally `Condition` (when). An **identity-based** policy attaches to a user/group/role. A **resource-based** policy attaches to the resource itself (e.g. an S3 **bucket policy**).

**Least privilege.** The guiding principle: grant **only** the actions and resources strictly needed. `s3:*` on `*` is almost always a mistake; `s3:GetObject` on `arn:aws:s3:::my-bucket/*` is precise.

**Evaluation logic.** When AWS decides if an action is allowed: (1) everything is **denied by default** (implicit deny); (2) an explicit `Allow` allows it; (3) an **explicit** `Deny` overrides **everything** (even an Allow). Summary: **explicit Deny > Allow > implicit Deny**. This is THE mechanism the exam tests.

**assume-role.** Assuming a role yields **temporary** credentials (via STS). Two policies frame a role: the **trust policy** (`AssumeRolePolicyDocument`) says **who** can assume it, and the **permission policies** say **what** the role allows once assumed.

**Policy types.** **AWS-managed**: ready-made, maintained by AWS (`AmazonS3ReadOnlyAccess`). **Customer-managed**: yours, reusable, versioned. **Inline**: stuck directly onto a single identity, not reusable (reserve for very specific cases).

**Shared responsibility.** AWS secures the cloud **itself** (hardware, datacenters, hypervisor); **you** secure what you put **in** it (your data, your IAM permissions, your security groups). "Security *of* the cloud" (AWS) vs "security *in* the cloud" (you).
:::

:::figure aws-iam-model
caption_fr: "Schéma 1. Le modèle IAM : des utilisateurs regroupés en groupes, des politiques (JSON) attachées aux groupes/rôles, et un rôle endossé via assume-role qui délivre des identifiants temporaires. L'évaluation : deny explicite > allow > deny implicite."
caption_en: "Figure 1. The IAM model: users grouped into groups, policies (JSON) attached to groups/roles, and a role assumed via assume-role that issues temporary credentials. Evaluation: explicit deny > allow > implicit deny."
:::

## walkthrough

:::lang fr
On avance ainsi : groupes → politique personnalisée → anatomie & évaluation → rôle & assume-role → politique de ressource (bucket S3) → inline vs managed → responsabilité partagée & bonnes pratiques.
:::

:::lang en
We'll go like this: groups → custom policy → anatomy & evaluation → role & assume-role → resource policy (S3 bucket) → inline vs managed → shared responsibility & best practices.
:::

### step-01

:::lang fr
**Objectif.** Gérer les permissions **à l'échelle** avec un **groupe** IAM.

**🤔 Pourquoi des groupes.** Attacher les mêmes politiques à 50 utilisateurs un par un est ingérable. On crée un **groupe** (`developpeurs`), on lui attache les permissions **une fois**, et on y **ajoute** les utilisateurs. Ajouter/retirer un droit à toute l'équipe = une seule opération. C'est la bonne pratique de base.

Crée un groupe, attache-lui une politique, ajoute des utilisateurs :
:::

:::lang en
**Goal.** Manage permissions **at scale** with an IAM **group**.

**🤔 Why groups.** Attaching the same policies to 50 users one by one is unmanageable. You create a **group** (`developers`), attach the permissions to it **once**, and **add** users to it. Adding/removing a right for the whole team = one operation. It's the basic best practice.

Create a group, attach a policy, add users:
:::

```bash
# Créer un groupe et lui donner une permission gérée par AWS / create a group + AWS-managed permission
awslocal iam create-group --group-name developpeurs
awslocal iam attach-group-policy --group-name developpeurs \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Créer deux utilisateurs et les ajouter au groupe / create two users and add them
awslocal iam create-user --user-name alice
awslocal iam create-user --user-name bob
awslocal iam add-user-to-group --user-name alice --group-name developpeurs
awslocal iam add-user-to-group --user-name bob   --group-name developpeurs

# Vérifier / verify
awslocal iam get-group --group-name developpeurs --query 'Users[].UserName' --output text
awslocal iam list-attached-group-policies --group-name developpeurs --query 'AttachedPolicies[].PolicyName' --output text
```

:::lang fr
**✅ Vérification :** `get-group` liste `alice bob` (les membres). `list-attached-group-policies` montre `AmazonS3ReadOnlyAccess`. Alice et Bob **héritent** de cette permission via le groupe — tu n'as rien attaché à chacun. Ajoute une permission au groupe, et les deux l'obtiennent instantanément : c'est toute la valeur des groupes.
:::

:::lang en
**✅ Check:** `get-group` lists `alice bob` (the members). `list-attached-group-policies` shows `AmazonS3ReadOnlyAccess`. Alice and Bob **inherit** that permission via the group — you attached nothing to each. Add a permission to the group, and both get it instantly: that's the whole value of groups.
:::

### step-02

:::lang fr
**Objectif.** Écrire une **politique personnalisée** (gérée par le client) en **moindre privilège**.

**🤔 Pourquoi personnalisée.** Les politiques AWS toutes faites sont larges. En prod, tu écris des politiques **précises** : « lire ET écrire, mais **uniquement** dans ce bucket, ce préfixe ». La grammaire est toujours la même : `Effect` + `Action` + `Resource`.

Écris la politique et crée-la :
:::

:::lang en
**Goal.** Write a **custom policy** (customer-managed) with **least privilege**.

**🤔 Why custom.** Ready-made AWS policies are broad. In prod, you write **precise** policies: "read AND write, but **only** in this bucket, this prefix". The grammar is always the same: `Effect` + `Action` + `Resource`.

Write the policy and create it:
:::

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LectureEcritureBucketApp",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::donnees-app/*"
    }
  ]
}
```

```bash
# Enregistre le JSON ci-dessus dans app-rw.json, puis : / save the JSON above as app-rw.json, then:
awslocal iam create-policy --policy-name AppDataRW --policy-document file://app-rw.json \
  --query 'Policy.Arn' --output text

# Relire la politique (sa version par défaut) / read the policy back (its default version)
awslocal iam get-policy-version \
  --policy-arn arn:aws:iam::000000000000:policy/AppDataRW \
  --version-id v1 --query 'PolicyVersion.Document'
```

:::lang fr
**✅ Vérification :** `create-policy` renvoie l'ARN `arn:aws:iam::000000000000:policy/AppDataRW`. `get-policy-version` te réaffiche ton document JSON. Note la précision : `s3:GetObject`/`s3:PutObject` (pas `s3:*`) sur `arn:aws:s3:::donnees-app/*` (pas `*`). Le `/*` cible les **objets** du bucket ; l'ARN du bucket lui-même (sans `/*`) serait `arn:aws:s3:::donnees-app`. Cette distinction bucket/objets est un piège classique d'examen.
:::

:::lang en
**✅ Check:** `create-policy` returns the ARN `arn:aws:iam::000000000000:policy/AppDataRW`. `get-policy-version` shows you back your JSON document. Note the precision: `s3:GetObject`/`s3:PutObject` (not `s3:*`) on `arn:aws:s3:::donnees-app/*` (not `*`). The `/*` targets the bucket's **objects**; the bucket ARN itself (without `/*`) would be `arn:aws:s3:::donnees-app`. This bucket/objects distinction is a classic exam trap.
:::

### step-03

:::lang fr
**Objectif.** Comprendre l'**anatomie** d'une politique et la **logique d'évaluation** — avec un `Deny` explicite.

**🤔 LE mécanisme d'examen.** AWS évalue ainsi : tout est refusé par défaut ; un `Allow` explicite autorise ; un `Deny` **explicite** l'emporte sur **tout**. On écrit une politique qui **autorise large** mais **interdit** une action précise, pour ancrer la règle « Deny explicite gagne ».

⚠️ **Honnêteté labo :** LocalStack **n'applique pas** l'autorisation — il ne te bloquera pas. Ici tu **écris et relis** la politique ; la décision d'autorisation, tu la **raisonnes** (c'est ce que l'examen teste). On te donne le raisonnement attendu.

Écris une politique « allow large + deny ciblé » :
:::

:::lang en
**Goal.** Understand a policy's **anatomy** and the **evaluation logic** — with an explicit `Deny`.

**🤔 THE exam mechanism.** AWS evaluates like this: everything denied by default; an explicit `Allow` allows; an **explicit** `Deny` overrides **everything**. We write a policy that **allows broadly** but **forbids** a precise action, to anchor the rule "explicit Deny wins".

⚠️ **Lab honesty:** LocalStack does **not** enforce authorization — it won't block you. Here you **write and read back** the policy; the authorization decision, you **reason about** (which is what the exam tests). We give the expected reasoning.

Write an "allow broad + deny targeted" policy:
:::

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "AutoriserToutS3", "Effect": "Allow", "Action": "s3:*", "Resource": "*" },
    { "Sid": "InterdireSuppression", "Effect": "Deny", "Action": "s3:DeleteBucket", "Resource": "*" }
  ]
}
```

```bash
# Enregistre dans garde-fou.json / save as garde-fou.json
awslocal iam create-policy --policy-name S3SansSuppression --policy-document file://garde-fou.json \
  --query 'Policy.Arn' --output text
awslocal iam get-policy-version --policy-arn arn:aws:iam::000000000000:policy/S3SansSuppression \
  --version-id v1 --query 'PolicyVersion.Document.Statement[].Effect' --output text
```

:::lang fr
**✅ Vérification :** `get-policy-version` renvoie `Allow Deny` (les deux `Effect` de tes statements). **Raisonnement d'évaluation** (ce qu'AWS ferait) : un utilisateur avec cette politique **peut** tout faire sur S3 (`Allow s3:*`), **sauf** `s3:DeleteBucket` — car le `Deny` explicite **l'emporte** sur l'`Allow`. Même si tu ajoutais une autre politique autorisant `s3:DeleteBucket`, le `Deny` gagnerait toujours. C'est le motif « garde-fou » : autoriser large, interdire les actions dangereuses. (En réel, la suppression serait refusée ; en LocalStack, non appliqué — mais la politique, elle, est correcte.)
:::

:::lang en
**✅ Check:** `get-policy-version` returns `Allow Deny` (your statements' two `Effect`s). **Evaluation reasoning** (what AWS would do): a user with this policy **can** do anything on S3 (`Allow s3:*`), **except** `s3:DeleteBucket` — because the explicit `Deny` **overrides** the `Allow`. Even if you added another policy allowing `s3:DeleteBucket`, the `Deny` would still win. This is the "guardrail" pattern: allow broad, forbid dangerous actions. (In reality, the deletion would be refused; in LocalStack, not enforced — but the policy itself is correct.)
:::

### step-04

:::lang fr
**Objectif.** Créer un **rôle** avec sa **politique de confiance**, et l'**endosser** via `assume-role` — le concept clé de l'examen.

**🤔 Pourquoi les rôles.** Une machine EC2 qui doit lire S3 ne doit **pas** stocker des clés d'accès (qui fuiteraient). À la place, elle **endosse un rôle** : AWS lui délivre des identifiants **temporaires**, renouvelés automatiquement. Deux politiques : la **politique de confiance** dit **qui** peut endosser (ici, le service EC2), la **politique de permission** dit **ce que** le rôle peut faire.

Crée le rôle et endosse-le :
:::

:::lang en
**Goal.** Create a **role** with its **trust policy**, and **assume** it via `assume-role` — the exam's key concept.

**🤔 Why roles.** An EC2 machine that must read S3 should **not** store access keys (which would leak). Instead, it **assumes a role**: AWS issues it **temporary** credentials, auto-renewed. Two policies: the **trust policy** says **who** can assume (here, the EC2 service), the **permission policy** says **what** the role can do.

Create the role and assume it:
:::

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

```bash
# Enregistre la politique de CONFIANCE ci-dessus dans trust.json / save the TRUST policy above as trust.json
awslocal iam create-role --role-name role-lecture-s3 \
  --assume-role-policy-document file://trust.json --query 'Role.Arn' --output text

# Attacher une politique de PERMISSION (ce que le rôle peut faire) / attach a PERMISSION policy
awslocal iam attach-role-policy --role-name role-lecture-s3 \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Endosser le rôle -> identifiants TEMPORAIRES / assume the role -> TEMPORARY credentials
awslocal sts assume-role \
  --role-arn arn:aws:iam::000000000000:role/role-lecture-s3 \
  --role-session-name ma-session \
  --query 'Credentials.[AccessKeyId,Expiration]' --output text
```

:::lang fr
**✅ Vérification :** `create-role` renvoie l'ARN du rôle. `assume-role` renvoie des **identifiants temporaires** : un `AccessKeyId` (souvent préfixé, ex. `LSIA...` en LocalStack, `ASIA...` en réel) et une date d'**expiration**. C'est la différence clé avec un utilisateur : ces clés sont **jetables et à durée limitée**. La politique de confiance (`Principal: ec2.amazonaws.com`) dit que **le service EC2** peut endosser ce rôle — c'est ainsi qu'une instance obtient des droits sans clé stockée.
:::

:::lang en
**✅ Check:** `create-role` returns the role's ARN. `assume-role` returns **temporary** credentials: an `AccessKeyId` (often prefixed, e.g. `LSIA...` in LocalStack, `ASIA...` in real AWS) and an **expiration** date. That's the key difference from a user: these keys are **disposable and time-limited**. The trust policy (`Principal: ec2.amazonaws.com`) says **the EC2 service** can assume this role — that's how an instance gets rights with no stored key.
:::

### step-05

:::lang fr
**Objectif.** Attacher une **politique basée sur la ressource** — une **bucket policy** S3.

**🤔 Identité vs ressource.** Jusqu'ici, les politiques étaient **basées sur l'identité** (attachées à un user/groupe/rôle : « cette identité peut faire X »). Une politique **basée sur la ressource** est attachée **à la ressource** et dit « ces identités-là peuvent m'accéder ». Les **bucket policies** S3 en sont l'exemple roi : indispensables pour l'accès **inter-comptes** ou pour rendre des objets **publics**.

Crée un bucket et attache-lui une politique :
:::

:::lang en
**Goal.** Attach a **resource-based policy** — an S3 **bucket policy**.

**🤔 Identity vs resource.** So far, policies were **identity-based** (attached to a user/group/role: "this identity can do X"). A **resource-based** policy is attached **to the resource** and says "these identities can access me". S3 **bucket policies** are the prime example: essential for **cross-account** access or for making objects **public**.

Create a bucket and attach a policy to it:
:::

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LecturePubliqueDesObjets",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::site-public/*"
    }
  ]
}
```

```bash
awslocal s3 mb s3://site-public
# Enregistre la bucket policy ci-dessus dans bucket-policy.json / save the bucket policy above
awslocal s3api put-bucket-policy --bucket site-public --policy file://bucket-policy.json

# Relire la politique attachée au bucket / read the policy attached to the bucket
awslocal s3api get-bucket-policy --bucket site-public --query 'Policy' --output text
```

:::lang fr
**✅ Vérification :** `put-bucket-policy` réussit (aucune erreur). `get-bucket-policy` te réaffiche la politique JSON attachée **au bucket**. Ici `Principal: "*"` signifie « n'importe qui » — c'est ce qu'on met pour un **site web statique public**, mais **jamais** pour des données sensibles (c'est la cause n°1 des fuites S3 dans l'actualité). ⚠️ La politique vit **sur la ressource**, pas sur une identité : c'est le point à retenir. En réel, il faut aussi désactiver le « Block Public Access » pour qu'une politique publique prenne effet.
:::

:::lang en
**✅ Check:** `put-bucket-policy` succeeds (no error). `get-bucket-policy` shows you back the JSON policy attached **to the bucket**. Here `Principal: "*"` means "anyone" — that's what you set for a **public static website**, but **never** for sensitive data (it's the #1 cause of S3 leaks in the news). ⚠️ The policy lives **on the resource**, not on an identity: that's the takeaway. In real AWS, you also need to disable "Block Public Access" for a public policy to take effect.
:::

### step-06

:::lang fr
**Objectif.** Distinguer politique **inline** et politique **gérée**, et savoir quand utiliser laquelle.

**🤔 Trois types, trois usages.** **Gérée par AWS** (`AmazonS3ReadOnlyAccess`) : rapide, maintenue par AWS, mais large. **Gérée par le client** (ta `AppDataRW` de l'étape 2) : réutilisable sur plusieurs identités, versionnée — **le choix par défaut** en prod. **Inline** : collée sur **une seule** identité, disparaît avec elle, non réutilisable — à réserver aux permissions **uniques** à une identité.

Ajoute une politique **inline** à un utilisateur :
:::

:::lang en
**Goal.** Tell an **inline** policy from a **managed** one, and know when to use which.

**🤔 Three types, three uses.** **AWS-managed** (`AmazonS3ReadOnlyAccess`): fast, maintained by AWS, but broad. **Customer-managed** (your `AppDataRW` from step 2): reusable across identities, versioned — **the default choice** in prod. **Inline**: stuck on **one** identity, vanishes with it, not reusable — reserve for permissions **unique** to an identity.

Add an **inline** policy to a user:
:::

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "s3:ListAllMyBuckets", "Resource": "*" }
  ]
}
```

```bash
# Politique INLINE : collée directement sur alice (pas d'ARN réutilisable) / INLINE: stuck on alice
# Enregistre dans inline.json / save as inline.json
awslocal iam put-user-policy --user-name alice --policy-name ListerBuckets --policy-document file://inline.json

# Comparer : politiques inline vs politiques gérées attachées / compare inline vs attached managed
awslocal iam list-user-policies --user-name alice --query 'PolicyNames' --output text          # inline
awslocal iam list-attached-user-policies --user-name alice --query 'AttachedPolicies[].PolicyName' --output text  # gérées
```

:::lang fr
**✅ Vérification :** `list-user-policies` (les **inline**) montre `ListerBuckets`. `list-attached-user-policies` (les **gérées**) est vide pour alice directement (sa permission S3 vient du **groupe**, pas d'un attachement direct). Deux commandes **différentes** pour deux types de politiques : c'est un piège d'examen (« pourquoi je ne vois pas ma politique inline dans list-attached ? » → parce qu'elle est inline). Règle pro : préfère les politiques **gérées par le client** ; garde l'inline pour l'exceptionnel.
:::

:::lang en
**✅ Check:** `list-user-policies` (the **inline** ones) shows `ListerBuckets`. `list-attached-user-policies` (the **managed** ones) is empty for alice directly (her S3 permission comes from the **group**, not a direct attachment). Two **different** commands for two policy types: it's an exam trap ("why don't I see my inline policy in list-attached?" → because it's inline). Pro rule: prefer **customer-managed** policies; keep inline for the exceptional.
:::

### step-07

:::lang fr
**Objectif.** Ancrer le **modèle de responsabilité partagée** et les **bonnes pratiques**, puis nettoyer.

**🤔 Qui sécurise quoi.** AWS sécurise le cloud **lui-même** (matériel, réseau physique, hyperviseur, services managés). **Toi** tu sécurises ce que tu mets **dedans** : tes données, **tes** permissions IAM, tes groupes de sécurité, le chiffrement. Une fuite S3 par bucket public, c'est **ta** responsabilité, pas celle d'AWS. Les bonnes pratiques IAM à retenir : n'utilise **jamais** le root au quotidien, active la **MFA**, applique le **moindre privilège**, préfère les **rôles** aux clés long terme, et **fais tourner** (rotation) les clés.

Récapitule et nettoie :
:::

:::lang en
**Goal.** Anchor the **shared responsibility model** and **best practices**, then clean up.

**🤔 Who secures what.** AWS secures the cloud **itself** (hardware, physical network, hypervisor, managed services). **You** secure what you put **in** it: your data, **your** IAM permissions, your security groups, encryption. An S3 leak from a public bucket is **your** responsibility, not AWS's. The IAM best practices to remember: **never** use root day-to-day, enable **MFA**, apply **least privilege**, prefer **roles** to long-term keys, and **rotate** keys.

Recap and clean up:
:::

```bash
# Panorama de ce que tu as construit / overview of what you built
awslocal iam list-groups --query 'Groups[].GroupName' --output text
awslocal iam list-roles  --query 'Roles[].RoleName'  --output text
awslocal iam list-policies --scope Local --query 'Policies[].PolicyName' --output text   # tes politiques clientes

# Nettoyage (ordre important : détacher avant supprimer) / cleanup (order matters: detach before delete)
awslocal iam remove-user-from-group --user-name alice --group-name developpeurs
awslocal iam remove-user-from-group --user-name bob   --group-name developpeurs
awslocal iam delete-user-policy --user-name alice --policy-name ListerBuckets
awslocal iam delete-user --user-name alice ; awslocal iam delete-user --user-name bob
awslocal iam detach-group-policy --group-name developpeurs --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
awslocal iam delete-group --group-name developpeurs
awslocal iam detach-role-policy --role-name role-lecture-s3 --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
awslocal iam delete-role --role-name role-lecture-s3
awslocal iam delete-policy --policy-arn arn:aws:iam::000000000000:policy/AppDataRW
awslocal iam delete-policy --policy-arn arn:aws:iam::000000000000:policy/S3SansSuppression
awslocal s3 rb s3://site-public --force
```

:::lang fr
**✅ Vérification :** avant nettoyage, `list-policies --scope Local` liste **tes** politiques (`AppDataRW`, `S3SansSuppression`) — `Local` = gérées par le client, par opposition aux centaines de politiques `AWS`. Après nettoyage, `awslocal iam list-users`, `list-groups`, `list-roles` sont vides. Tu as construit **toute** la mécanique IAM — identités, politiques, rôles, ressources — et tu la nettoies proprement. `--scope Local` vs `AWS` est un filtre utile pour ne voir que **tes** créations.
:::

:::lang en
**✅ Check:** before cleanup, `list-policies --scope Local` lists **your** policies (`AppDataRW`, `S3SansSuppression`) — `Local` = customer-managed, as opposed to the hundreds of `AWS` policies. After cleanup, `awslocal iam list-users`, `list-groups`, `list-roles` are empty. You built **all** the IAM machinery — identities, policies, roles, resources — and cleaned it up properly. `--scope Local` vs `AWS` is a handy filter to see only **your** creations.
:::

## pitfalls

:::lang fr
**1. `s3:*` sur `Resource: *`.** La faute de moindre privilège par excellence. Cible des **actions précises** sur des **ARN précis**. Une politique large est une porte ouverte.

**2. Confondre ARN de bucket et ARN d'objets.** `arn:aws:s3:::mon-bucket` = le bucket (pour `s3:ListBucket`). `arn:aws:s3:::mon-bucket/*` = les objets (pour `s3:GetObject`). Beaucoup de politiques cassent parce qu'elles mélangent les deux.

**3. Croire qu'un `Allow` bat un `Deny`.** Non : un **Deny explicite l'emporte toujours**, même sur mille `Allow`. C'est la question piège récurrente de l'examen.

**4. Stocker des clés long terme sur une machine.** Une instance EC2 (ou un conteneur) doit endosser un **rôle**, pas embarquer des clés d'accès. Les clés fuient ; les identifiants temporaires expirent.

**5. Confondre politique de confiance et politique de permission.** La **confiance** (`AssumeRolePolicyDocument`) dit **qui** peut endosser le rôle. La **permission** dit **ce que** le rôle peut faire. Deux documents distincts, deux rôles distincts.

**6. Rendre un bucket public sans le vouloir.** `Principal: "*"` = tout Internet. À réserver aux sites statiques publics. En réel, le « Block Public Access » est activé par défaut — le désactiver est une décision explicite et risquée.

**7. Chercher une politique inline dans `list-attached-user-policies`.** Les politiques **inline** sont dans `list-user-policies` ; les **gérées** dans `list-attached-user-policies`. Deux commandes, deux mondes.

**8. Oublier que LocalStack n'applique pas IAM.** En LocalStack, une action « interdite » par ta politique **passera** quand même. Tu valides la **structure** ici ; l'autorisation, tu la raisonnes (et l'examen aussi).
:::

:::lang en
**1. `s3:*` on `Resource: *`.** The least-privilege mistake par excellence. Target **precise actions** on **precise ARNs**. A broad policy is an open door.

**2. Confusing bucket ARN and objects ARN.** `arn:aws:s3:::my-bucket` = the bucket (for `s3:ListBucket`). `arn:aws:s3:::my-bucket/*` = the objects (for `s3:GetObject`). Many policies break because they mix the two.

**3. Thinking an `Allow` beats a `Deny`.** No: an **explicit Deny always wins**, even over a thousand `Allow`s. It's the exam's recurring trick question.

**4. Storing long-term keys on a machine.** An EC2 instance (or a container) should assume a **role**, not carry access keys. Keys leak; temporary credentials expire.

**5. Confusing trust policy and permission policy.** The **trust** (`AssumeRolePolicyDocument`) says **who** can assume the role. The **permission** says **what** the role can do. Two distinct documents, two distinct roles.

**6. Making a bucket public unintentionally.** `Principal: "*"` = the whole Internet. Reserve for public static sites. In real AWS, "Block Public Access" is on by default — disabling it is an explicit, risky decision.

**7. Looking for an inline policy in `list-attached-user-policies`.** **Inline** policies are in `list-user-policies`; **managed** ones in `list-attached-user-policies`. Two commands, two worlds.

**8. Forgetting LocalStack doesn't enforce IAM.** In LocalStack, an action "forbidden" by your policy will **still** go through. You validate the **structure** here; authorization you reason about (and so does the exam).
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées un groupe, lui attaches une politique, y ajoutes des utilisateurs qui **héritent** des droits.
- [ ] Tu écris une politique JSON précise (`Effect`/`Action`/`Resource`) et tu la relis.
- [ ] Tu expliques « Deny explicite > Allow > Deny implicite » sur un exemple.
- [ ] Tu crées un rôle (confiance + permission) et tu l'endosses via `assume-role` (identifiants temporaires).
- [ ] Tu attaches une **bucket policy** et tu distingues identité vs ressource.
- [ ] Tu sais où vivent les politiques **inline** vs **gérées**.
- [ ] Tu expliques le modèle de responsabilité partagée.

Sept cases = tu tiens le socle de sécurité du SAA. La suite : S3 en profondeur.
:::

:::lang en
You know it works when…

- [ ] You create a group, attach a policy, add users that **inherit** the rights.
- [ ] You write a precise JSON policy (`Effect`/`Action`/`Resource`) and read it back.
- [ ] You explain "explicit Deny > Allow > implicit Deny" on an example.
- [ ] You create a role (trust + permission) and assume it via `assume-role` (temporary credentials).
- [ ] You attach a **bucket policy** and tell identity from resource.
- [ ] You know where **inline** vs **managed** policies live.
- [ ] You explain the shared responsibility model.

Seven boxes = you hold the SAA security foundation. Next up: S3 in depth.
:::

## next

:::lang fr
La suite du track AWS → SAA-C03 :

1. **AWS — stockage S3 en profondeur** : versioning, classes de stockage, cycle de vie, chiffrement, hébergement de site statique, URL présignées — le service le plus utilisé, et le plus testé après IAM.
2. Plus loin : réseau VPC, compute (EC2/Lambda), découplage (SQS/SNS/DynamoDB), le **projet d'entreprise** serverless, puis **passer en réel**.
:::

:::lang en
The AWS → SAA-C03 track continues:

1. **AWS — S3 storage in depth**: versioning, storage classes, lifecycle, encryption, static website hosting, presigned URLs — the most-used service, and the most tested after IAM.
2. Further along: VPC networking, compute (EC2/Lambda), decoupling (SQS/SNS/DynamoDB), the serverless **enterprise project**, then **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire IAM.
:::

:::lang en
IAM cheat sheet.
:::

```bash
# Groupes / Groups
awslocal iam create-group --group-name G
awslocal iam attach-group-policy --group-name G --policy-arn <arn>
awslocal iam add-user-to-group --user-name U --group-name G

# Politiques clientes / Customer-managed policies
awslocal iam create-policy --policy-name P --policy-document file://p.json
awslocal iam get-policy-version --policy-arn <arn> --version-id v1 --query 'PolicyVersion.Document'
awslocal iam list-policies --scope Local            # tes politiques / your policies

# Rôles / Roles
awslocal iam create-role --role-name R --assume-role-policy-document file://trust.json
awslocal iam attach-role-policy --role-name R --policy-arn <arn>
awslocal sts assume-role --role-arn <arn> --role-session-name s1   # identifiants temporaires

# Politiques : inline vs gérées / inline vs managed
awslocal iam put-user-policy --user-name U --policy-name P --policy-document file://i.json  # inline
awslocal iam list-user-policies --user-name U            # inline
awslocal iam list-attached-user-policies --user-name U   # gérées / managed

# Ressource (bucket policy) / Resource policy
awslocal s3api put-bucket-policy --bucket B --policy file://bp.json
```

```json
// Anatomie d'une politique / Policy anatomy
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::b/*" },
    { "Effect": "Deny",  "Action": "s3:DeleteBucket", "Resource": "*" }
  ]
}
```

## resources

:::lang fr
- [Politiques et permissions IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) — la grammaire complète.
- [Logique d'évaluation des politiques](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) — deny explicite, ordre d'évaluation.
- [Rôles IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) — confiance, assume-role, cas d'usage.
- [Bonnes pratiques de sécurité IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) — moindre privilège, MFA, rôles.
- [Modèle de responsabilité partagée](https://aws.amazon.com/compliance/shared-responsibility-model/) — qui sécurise quoi.
:::

:::lang en
- [IAM policies and permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) — the full grammar.
- [Policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html) — explicit deny, evaluation order.
- [IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) — trust, assume-role, use cases.
- [IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) — least privilege, MFA, roles.
- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/) — who secures what.
:::

## troubleshooting

:::lang fr
**`MalformedPolicyDocument`.** Ton JSON est invalide : virgule en trop, `Version` manquante, `Action`/`Resource` mal orthographiés. Valide le JSON, et vérifie que `Version` vaut `"2012-10-17"`.

**`delete-user` / `delete-group` échoue (`DeleteConflict`).** Il reste des attachements. Ordre : retirer les utilisateurs du groupe, détacher les politiques, supprimer les politiques inline, **puis** supprimer.

**`NoSuchEntity` sur un ARN de politique.** L'ARN est faux (numéro de compte, nom). En LocalStack le compte est `000000000000` ; tes politiques clientes sont `arn:aws:iam::000000000000:policy/<nom>`, les gérées AWS `arn:aws:iam::aws:policy/<nom>`.

**`assume-role` échoue.** La politique de **confiance** ne permet pas au principal d'endosser, ou l'ARN du rôle est faux. Vérifie `AssumeRolePolicyDocument` et l'ARN.

**Ma politique « interdit » une action mais elle passe quand même.** Normal en LocalStack : il **n'applique pas** l'autorisation IAM. Tu valides la structure ; le blocage réel n'a lieu que sur le vrai AWS.

**`SimulatePrincipalPolicy` renvoie une erreur.** Cette API n'est pas (bien) supportée en LocalStack communautaire. Raisonne l'évaluation à la main plutôt que de la simuler.
:::

:::lang en
**`MalformedPolicyDocument`.** Your JSON is invalid: trailing comma, missing `Version`, misspelled `Action`/`Resource`. Validate the JSON, and check `Version` is `"2012-10-17"`.

**`delete-user` / `delete-group` fails (`DeleteConflict`).** Attachments remain. Order: remove users from the group, detach policies, delete inline policies, **then** delete.

**`NoSuchEntity` on a policy ARN.** The ARN is wrong (account number, name). In LocalStack the account is `000000000000`; your customer policies are `arn:aws:iam::000000000000:policy/<name>`, AWS-managed ones `arn:aws:iam::aws:policy/<name>`.

**`assume-role` fails.** The **trust** policy doesn't let the principal assume, or the role ARN is wrong. Check `AssumeRolePolicyDocument` and the ARN.

**My policy "forbids" an action but it goes through anyway.** Normal in LocalStack: it does **not** enforce IAM authorization. You validate the structure; real blocking only happens on real AWS.

**`SimulatePrincipalPolicy` returns an error.** That API isn't (well) supported in community LocalStack. Reason about the evaluation by hand rather than simulating it.
:::
