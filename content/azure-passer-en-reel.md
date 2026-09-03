---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-passer-en-reel
slug: azure-passer-en-reel
order: 64
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — passer en réel proprement (AZ-104)"
title_en: "Azure — going real, cleanly (AZ-104)"
tagline_fr: "compte, abonnement, ADC, garde-fous de coût, ce que miniblue cachait."
tagline_en: "account, subscription, auth, cost guardrails, what miniblue hid."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 190
repo: "hashicorp/terraform-provider-azurerm"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-projet-entreprise]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [compte-azure, abonnement, az-login, principal-de-service, garde-fous-cout, budgets-alertes, terraform-apply-reel, emulateur-vs-reel, certification-az-104]
concepts_en: [azure-account, subscription, az-login, service-principal, cost-guardrails, budgets-alerts, terraform-apply-real, emulator-vs-real, az-104-certification]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "La transition du labo au vrai Microsoft Azure, sans mauvaise surprise : créer un compte et un abonnement (crédit d'essai + services gratuits), s'authentifier (az login, principal de service pour Terraform), poser des garde-fous de coût AVANT toute ressource (budgets Azure Cost Management + alertes), retirer le bloc de ciblage miniblue et déployer ta zone d'atterrissage pour de vrai (terraform apply), puis tout démonter (destroy + suppression du groupe/abonnement). Et comprendre ce que l'émulateur cachait (RBAC et policies appliqués, unicité mondiale, quotas, coût réel — dont libérer les VM). Plus la feuille de route vers la certification AZ-104."
og_description_en: "The transition from lab to real Microsoft Azure, with no nasty surprise: create an account and a subscription (trial credit + free services), authenticate (az login, service principal for Terraform), set cost guardrails BEFORE any resource (Azure Cost Management budgets + alerts), remove the miniblue targeting block and deploy your landing zone for real (terraform apply), then tear it all down (destroy + resource group/subscription deletion). And understand what the emulator hid (RBAC and policies enforced, global uniqueness, quotas, real cost — including deallocating VMs). Plus the roadmap to the AZ-104 certification."
---

## intro

:::lang fr
Tu as appris tout Azure **sans compte, sans carte, sans risque** grâce à **miniblue** et Azurite. À un moment, tu voudras (ou devras) toucher au **vrai** Azure : pour l'examen, pour un projet client, pour valider en conditions réelles. Ce guide est le **pont** — et surtout le **garde-fou**. Car le vrai Azure a une différence de taille avec l'émulateur : **il facture**. Une VM laissée allumée, une IP publique oubliée, une passerelle coûteuse, et c'est la facture surprise. Ce guide t'apprend à passer en réel **proprement** : créer un compte, poser des garde-fous de coût **avant** de créer quoi que ce soit, déployer ta zone d'atterrissage, puis **tout démonter**.

On avance dans l'ordre qui évite les catastrophes : d'abord **créer un compte** et comprendre l'**abonnement**, puis **s'authentifier proprement** (`az login` pour toi, un **principal de service** pour Terraform), puis — **avant toute ressource** — les **garde-fous de coût** (budgets Azure Cost Management + alertes). Ensuite seulement on **retire le bloc de ciblage miniblue** de ton projet et on déploie ta **zone d'atterrissage** pour de vrai (`terraform apply`). Enfin, on **démonte tout** et on démonte aussi les **illusions de l'émulateur** : ce que miniblue simplifiait et qui compte vraiment en production.

⚠️ **Ce guide implique de VRAIES actions sur un VRAI compte Azure**, qui peuvent **coûter de l'argent** si tu n'es pas discipliné·e. On reste dans le **crédit d'essai** / les **services gratuits** et on nettoie tout — mais lis chaque avertissement. Les vérifications « ✅ » décrivent ce que tu dois **voir** dans le portail/CLI, pas des commandes de labo à rejouer à l'aveugle.

**Pour qui c'est :** tu as terminé tout le track AZ-104 (jusqu'au projet de zone d'atterrissage) et tu es prêt·e à mettre le pied dans le vrai cloud.

**Quand ce n'est PAS le bon choix :**

- Tu veux juste réviser/t'entraîner → reste sur **miniblue**, c'est gratuit et sans risque.
- Tu n'es pas sûr·e de pouvoir surveiller tes coûts → pose **d'abord** les garde-fous de ce guide (étape 3), puis reviens créer des ressources.
:::

:::lang en
You learned all of Azure **with no account, no card, no risk** thanks to **miniblue** and Azurite. At some point, you'll want (or need) to touch **real** Azure: for the exam, a client project, a real-conditions validation. This guide is the **bridge** — and above all the **guardrail**. Because real Azure has one big difference from the emulator: **it bills**. A VM left running, a forgotten public IP, an expensive gateway, and it's a surprise bill. This guide teaches you to go real **cleanly**: create an account, set cost guardrails **before** creating anything, deploy your landing zone, then **tear it all down**.

We go in the disaster-avoiding order: first **create an account** and understand the **subscription**, then **authenticate cleanly** (`az login` for you, a **service principal** for Terraform), then — **before any resource** — the **cost guardrails** (Azure Cost Management budgets + alerts). Only then do we **remove the miniblue targeting block** from your project and deploy your **landing zone** for real (`terraform apply`). Finally, we **tear everything down** and also dismantle the **emulator's illusions**: what miniblue simplified and what truly matters in production.

⚠️ **This guide involves REAL actions on a REAL Azure account**, which can **cost money** if you're not disciplined. We stay in the **trial credit** / **free services** and clean everything up — but read every warning. The "✅" checks describe what you should **see** in the portal/CLI, not lab commands to replay blindly.

**Who it's for:** you've finished the whole AZ-104 track (through the landing-zone project) and you're ready to step into the real cloud.

**When it's NOT the right choice:**

- You just want to revise/practice → stay on **miniblue**, it's free and risk-free.
- You're not sure you can watch your costs → set **this guide's guardrails first** (step 3), then come back to create resources.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Créer un **compte Azure** et comprendre l'**abonnement**.
- T'authentifier avec **`az login`** et un **principal de service** (pour Terraform).
- Poser des **garde-fous de coût** (budgets + alertes) **avant** toute ressource.
- **Retirer le ciblage miniblue** et déployer ta zone d'atterrissage pour de vrai.
- **Faire tourner** l'infra contre le vrai Azure (`terraform apply`).
- **Tout démonter** (`destroy` + suppression du groupe) — la discipline anti-facture.
- Reconnaître **ce que miniblue cachait** (RBAC/policies appliqués, unicité, quotas, coût).
:::

:::lang en
By the end of this guide, you can:

- Create an **Azure account** and understand the **subscription**.
- Authenticate with **`az login`** and a **service principal** (for Terraform).
- Set **cost guardrails** (budgets + alerts) **before** any resource.
- **Remove the miniblue targeting** and deploy your landing zone for real.
- **Run** the infra against real Azure (`terraform apply`).
- **Tear everything down** (`destroy` + group deletion) — the anti-bill discipline.
- Recognize **what miniblue hid** (RBAC/policies enforced, uniqueness, quotas, cost).
:::

## prerequisites

:::lang fr
- Le guide **Azure projet d'entreprise** terminé (la zone d'atterrissage Terraform à déployer).
- Un **compte Microsoft** et une **carte bancaire** (exigée pour ouvrir un abonnement, même en essai gratuit — Azure ne débite pas sans ton accord explicite en fin d'essai).
- **`az`**, **Terraform** et **Bicep** installés.
- ⚠️ La volonté de **lire les avertissements** et de **nettoyer** derrière toi. Le vrai cloud facture.
:::

:::lang en
- The **Azure enterprise project** guide done (the Terraform landing zone to deploy).
- A **Microsoft account** and a **payment card** (required to open a subscription, even on the free trial — Azure won't charge without your explicit consent at trial's end).
- **`az`**, **Terraform** and **Bicep** installed.
- ⚠️ The willingness to **read the warnings** and **clean up** after yourself. Real cloud bills.
:::

## concepts

:::lang fr
**Compte & abonnement.** Sur Azure, ton **compte** (identité Microsoft) contient un ou plusieurs **abonnements** (subscriptions) — l'**unité de facturation** et de quota où vivent les ressources. Un abonnement est rattaché à un **tenant** Entra ID (ton organisation). Azure offre un **compte gratuit** : un **crédit d'essai** (un montant offert sur ~30 jours), **12 mois** de certains services gratuits, et des services **toujours gratuits** (dans des quotas). Bien utilisé, ce projet se déploie **sans dépenser un centime réel**.

**Authentification : toi vs les machines.** Deux niveaux. `az login` t'authentifie **toi** (ouvre le navigateur, te connecte). Pour **Terraform** (et toute automatisation), on crée un **principal de service** (service principal) — l'identité d'une application — avec un `client_id`/`client_secret` (ou un certificat). Terraform lit ces identifiants via des **variables** `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_SUBSCRIPTION_ID`, `ARM_TENANT_ID`. C'est **précisément** ce que le bloc `miniblue` factice remplaçait en local.

**Garde-fous de coût (LE réflexe).** Un **budget** Azure Cost Management te **prévient** (par e-mail, à des seuils comme 50/80/100 %) quand la dépense approche une limite. ⚠️ **Un budget ALERTE, il ne BLOQUE pas** par défaut : c'est un signal, pas un plafond dur. On le pose **avant** de créer quoi que ce soit. Complément : consulter le **tableau de bord des coûts** et **supprimer** ce qu'on n'utilise plus.

**Retirer le ciblage miniblue.** Ton projet visait l'émulateur via un bloc spécifique (`metadata_host`, identifiants `miniblue`, `SSL_CERT_FILE`). Pour le **vrai** Azure, on **retire** ce bloc : le provider `azurerm` s'authentifie alors normalement (via `az login` ou le principal de service). Le **reste du code ne change pas** — c'est la force de l'IaC : la même description, une cible différente.

**Le cycle réel de Terraform.** Ici, `terraform apply` **crée vraiment** les ressources ; le fichier d'**état** mémorise ce qui existe. `destroy` supprime **exactement** ce que le state gère. En prime, la gouvernance (RBAC, policy, verrou) que tu avais **validée en Bicep** se **déploie** enfin pour de vrai (`az deployment group create`).

**Ce que l'émulateur cachait.** miniblue est parfait pour apprendre la **logique** du plan de contrôle, mais il **simplifie**. En réel : le **RBAC est appliqué** (sans le bon rôle, accès refusé), les **policies bloquent** vraiment, les **noms** (compte de stockage) sont **mondialement uniques**, le **peering** et les **cartes réseau** se provisionnent complètement, il y a des **quotas** par région, et surtout **tout coûte** — une **VM** doit être **libérée** (deallocated) pour cesser de facturer.
:::

:::lang en
**Account & subscription.** On Azure, your **account** (Microsoft identity) holds one or more **subscriptions** — the **billing** and quota unit where resources live. A subscription is attached to an Entra ID **tenant** (your organization). Azure offers a **free account**: a **trial credit** (a granted amount over ~30 days), **12 months** of some free services, and **always-free** services (within quotas). Used well, this project deploys **without spending a real cent**.

**Authentication: you vs machines.** Two levels. `az login` authenticates **you** (opens the browser, signs you in). For **Terraform** (and any automation), you create a **service principal** — an application's identity — with a `client_id`/`client_secret` (or a certificate). Terraform reads these credentials via **variables** `ARM_CLIENT_ID`, `ARM_CLIENT_SECRET`, `ARM_SUBSCRIPTION_ID`, `ARM_TENANT_ID`. It's **precisely** what the dummy `miniblue` block replaced locally.

**Cost guardrails (THE reflex).** An Azure Cost Management **budget** **warns** you (by email, at thresholds like 50/80/100%) when spend approaches a limit. ⚠️ **A budget ALERTS, it does NOT BLOCK** by default: it's a signal, not a hard cap. You set it **before** creating anything. Complement: check the **cost dashboard** and **delete** what you no longer use.

**Removing the miniblue targeting.** Your project targeted the emulator via a specific block (`metadata_host`, `miniblue` credentials, `SSL_CERT_FILE`). For **real** Azure, you **remove** it: the `azurerm` provider then authenticates normally (via `az login` or the service principal). The **rest of the code doesn't change** — that's IaC's strength: the same description, a different target.

**Terraform's real cycle.** Here, `terraform apply` **really creates** resources; the **state** file remembers what exists. `destroy` removes **exactly** what the state manages. As a bonus, the governance (RBAC, policy, lock) you had **validated in Bicep** finally **deploys** for real (`az deployment group create`).

**What the emulator hid.** miniblue is perfect for learning the control-plane **logic**, but it **simplifies**. For real: **RBAC is enforced** (without the right role, access denied), **policies really block**, **names** (storage account) are **globally unique**, **peering** and **network cards** fully provision, there are **quotas** per region, and above all **everything costs** — a **VM** must be **deallocated** to stop billing.
:::

:::figure azure-lab-to-real
caption_fr: "Schéma 1. Du labo au réel : à gauche, miniblue (plan de contrôle émulé, gratuit, sans compte) + Azurite ; à droite, le vrai Azure. Le pont se traverse dans l'ordre : compte + abonnement → auth (az login + principal de service) → garde-fous de coût (budgets/alertes) → retirer le ciblage miniblue → terraform apply → destroy. La sécurité coût avant toute ressource."
caption_en: "Figure 1. From lab to real: on the left, miniblue (emulated control plane, free, no account) + Azurite; on the right, real Azure. The bridge is crossed in order: account + subscription → auth (az login + service principal) → cost guardrails (budgets/alerts) → remove the miniblue targeting → terraform apply → destroy. Cost safety before any resource."
:::

## walkthrough

:::lang fr
On avance ainsi : compte & abonnement → authentification (az login + principal de service) → garde-fous de coût → retirer le ciblage miniblue → déployer en réel & vérifier → ce que l'émulateur cachait → tout démonter & cap sur l'AZ-104. **La sécurité coût passe avant les ressources.**
:::

:::lang en
We go like this: account & subscription → authentication (az login + service principal) → cost guardrails → remove the miniblue targeting → deploy for real & verify → what the emulator hid → tear it all down & aim for AZ-104. **Cost safety before resources.**
:::

### step-01

:::lang fr
**Objectif.** Créer un **compte Azure** et repérer ton **abonnement**.

**🤔 L'unité de facturation.** Tout vit dans un **abonnement**. On crée un compte gratuit (crédit d'essai), on se connecte, on identifie l'abonnement actif.

En CLI (ou via `portal.azure.com`) :
:::

:::lang en
**Goal.** Create an **Azure account** and locate your **subscription**.

**🤔 The billing unit.** Everything lives in a **subscription**. We create a free account (trial credit), sign in, identify the active subscription.

In the CLI (or via `portal.azure.com`):
:::

```bash
# Se connecter (ouvre le navigateur) / sign in (opens the browser)
az login

# Voir tes abonnements / see your subscriptions
az account list --output table

# Fixer l'abonnement actif / set the active subscription
az account set --subscription "Azure subscription 1"
az account show --output table
```

:::lang fr
**✅ Vérification :** `az account list` montre au moins un abonnement (souvent « Azure subscription 1 » ou « Essai gratuit »), avec un **ID d'abonnement** (un GUID) et l'état `Enabled`. `az account show` confirme l'abonnement actif et ton `tenantId`. ⚠️ Note bien l'**ID d'abonnement** : Terraform en aura besoin (`ARM_SUBSCRIPTION_ID`). Sépare mentalement le **compte** (ton identité) de l'**abonnement** (où vivent les ressources et la facture). Garde cet abonnement d'essai **isolé** — on nettoiera tout à la fin.
:::

:::lang en
**✅ Check:** `az account list` shows at least one subscription (often "Azure subscription 1" or "Free Trial"), with a **subscription ID** (a GUID) and state `Enabled`. `az account show` confirms the active subscription and your `tenantId`. ⚠️ Note the **subscription ID**: Terraform will need it (`ARM_SUBSCRIPTION_ID`). Mentally separate the **account** (your identity) from the **subscription** (where resources and the bill live). Keep this trial subscription **isolated** — we'll clean everything up at the end.
:::

### step-02

:::lang fr
**Objectif.** T'authentifier proprement : **`az login`** pour toi, un **principal de service** pour Terraform.

**🤔 L'identité des machines.** Terraform ne se connecte pas via ton navigateur : il lui faut une identité **non interactive**. On crée un **principal de service** avec un rôle **Contributeur** limité à ton abonnement, et on exporte ses identifiants dans les variables `ARM_*`.

Crée le principal de service :
:::

:::lang en
**Goal.** Authenticate cleanly: **`az login`** for you, a **service principal** for Terraform.

**🤔 The machines' identity.** Terraform doesn't sign in via your browser: it needs a **non-interactive** identity. We create a **service principal** with a **Contributor** role scoped to your subscription, and export its credentials into the `ARM_*` variables.

Create the service principal:
:::

```bash
# ID d'abonnement (depuis l'étape 1) / subscription ID (from step 1)
SUB=$(az account show --query id -o tsv)

# Créer un principal de service Contributeur sur l'abonnement
# Create a Contributor service principal on the subscription
az ad sp create-for-rbac --name sp-terraform-labo \
  --role Contributor --scopes /subscriptions/$SUB

# La commande renvoie appId, password, tenant -> exporte-les pour Terraform :
export ARM_CLIENT_ID="<appId>"
export ARM_CLIENT_SECRET="<password>"
export ARM_TENANT_ID="<tenant>"
export ARM_SUBSCRIPTION_ID="$SUB"
```

:::lang fr
**✅ Vérification :** `az ad sp create-for-rbac` renvoie un JSON avec `appId`, `password` et `tenant`. Une fois les quatre variables `ARM_*` exportées, **Terraform s'authentifiera tout seul** (sans le bloc miniblue). ⚠️ Le `password` (secret) ne s'affiche **qu'une fois** : note-le en lieu sûr, ne le committe **jamais**. Principe : le principal de service a le rôle **le plus étroit** qui suffit (ici Contributeur sur **un** abonnement, pas Propriétaire). En entreprise, on préférerait une **identité fédérée** (OIDC) sans secret — mais pour un labo perso, le principal de service convient.
:::

:::lang en
**✅ Check:** `az ad sp create-for-rbac` returns JSON with `appId`, `password` and `tenant`. Once the four `ARM_*` variables are exported, **Terraform authenticates by itself** (without the miniblue block). ⚠️ The `password` (secret) is shown **only once**: save it safely, **never** commit it. Principle: the service principal has the **narrowest** role that suffices (here Contributor on **one** subscription, not Owner). In a company you'd prefer a **federated identity** (OIDC) with no secret — but for a personal lab, the service principal is fine.
:::

### step-03

:::lang fr
**Objectif.** Poser les **garde-fous de coût** — **AVANT** toute ressource.

**🤔 Le réflexe qui sauve.** On crée un **budget** Azure Cost Management avec des **alertes** par e-mail (par ex. à 50/80/100 % d'un petit seuil, 5 €). Ça ne bloque pas la dépense, mais ça te **prévient** immédiatement. On le fait **maintenant**, avant la moindre ressource.

Via le portail (recommandé) : **Gestion des coûts + facturation → Budgets → Ajouter**. En CLI :
:::

:::lang en
**Goal.** Set the **cost guardrails** — **BEFORE** any resource.

**🤔 The reflex that saves you.** We create an Azure Cost Management **budget** with email **alerts** (e.g. at 50/80/100% of a small threshold, €5). It doesn't block spend, but it **warns** you immediately. We do it **now**, before any resource.

Via the portal (recommended): **Cost Management + Billing → Budgets → Add**. In the CLI:
:::

```bash
# Un budget mensuel de 5 € avec alertes (portée abonnement)
# A €5 monthly budget with alerts (subscription scope)
# ⚠️ `az consumption budget` est en préversion ; le portail Budgets est la voie stable
#    `az consumption budget` is in preview; the portal Budgets is the stable path
az consumption budget create \
  --budget-name garde-fou-labo \
  --amount 5 \
  --time-grain Monthly \
  --category Cost \
  --start-date 2026-09-01 --end-date 2027-09-01
# Puis, dans le portail, ajoute des seuils d'alerte (50/80/100%) avec ton e-mail.
```

:::lang fr
**✅ Vérification :** dans **Gestion des coûts → Budgets**, ton budget « garde-fou-labo » apparaît avec son montant. Tu recevras un e-mail dès le seuil atteint. ⚠️ **Un budget n'est PAS un plafond dur** (point d'examen crucial) : il **alerte**, il ne **coupe** pas la dépense automatiquement. Pour vraiment couper, il faut un mécanisme actif (une automatisation qui désactive/limite) — hors périmètre ici. La vraie garantie anti-facture de ce guide, c'est la **discipline** : rester dans le crédit d'essai / les services gratuits et **tout supprimer** (étape 7). Pose ce garde-fou **avant** de continuer.
:::

:::lang en
**✅ Check:** in **Cost Management → Budgets**, your "garde-fou-labo" budget appears with its amount. You'll get an email as soon as the threshold is reached. ⚠️ **A budget is NOT a hard cap** (crucial exam point): it **alerts**, it doesn't **cut** spend automatically. To truly cut, you need an active mechanism (automation that disables/limits) — out of scope here. This guide's real anti-bill guarantee is **discipline**: stay in the trial credit / free services and **delete everything** (step 7). Set this guardrail **before** continuing.
:::

### step-04

:::lang fr
**Objectif.** **Retirer le ciblage miniblue** et déployer ta **zone d'atterrissage** pour de vrai.

**🤔 Le même code, le vrai cloud.** Bonne surprise : ton infra Terraform **ne change quasiment pas**. Il suffit de **retirer le bloc de ciblage miniblue** du provider (les lignes `metadata_host`, `skip_provider_registration`, identifiants `miniblue`) — le provider `azurerm` s'authentifie alors via les variables `ARM_*` (étape 2). Puis `apply`.

Modifie `infra/providers.tf`, puis déploie :
:::

:::lang en
**Goal.** **Remove the miniblue targeting** and deploy your **landing zone** for real.

**🤔 The same code, the real cloud.** Good surprise: your Terraform infra **barely changes**. Just **remove the miniblue targeting block** from the provider (the `metadata_host`, `skip_provider_registration`, `miniblue` credential lines) — the `azurerm` provider then authenticates via the `ARM_*` variables (step 2). Then `apply`.

Edit `infra/providers.tf`, then deploy:
:::

```hcl
# infra/providers.tf — version RÉELLE (le bloc de ciblage miniblue est RETIRÉ)
terraform {
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.0" }
  }
}
provider "azurerm" {
  features {}
  # plus de metadata_host / skip_provider_registration / identifiants miniblue
  # l'authentification se fait via az login OU les variables ARM_* (principal de service)
}
```

```bash
cd ~/landing-zone/infra
unset SSL_CERT_FILE            # plus besoin du certificat miniblue / no more miniblue cert
terraform init -upgrade
terraform plan                # vérifie ce qui va être créé / review what will be created
terraform apply               # crée VRAIMENT les ressources / really creates resources
```

:::lang fr
**✅ Vérification :** `terraform apply` affiche `Apply complete! Resources: 8 added.` Dans le **portail Azure**, ton groupe `rg-landing`, le VNet, les sous-réseaux, le NSG et l'IP publique **existent réellement** — avec leurs **tags**. Tu déploies désormais comme un pro : la **même IaC** qu'en local, sur le vrai cloud. ⚠️ **Différences réelles :** le **nom du compte de stockage** (si tu ajoutes les charges) doit être **mondialement unique** ; l'**IP publique Standard** commence à **coûter** dès sa création ; et la gouvernance Bicep se **déploie** enfin (`az deployment group create --resource-group rg-landing --template-file ../gouvernance/durcissement.bicep --parameters principalId=...`).
:::

:::lang en
**✅ Check:** `terraform apply` shows `Apply complete! Resources: 8 added.` In the **Azure portal**, your `rg-landing` group, the VNet, subnets, NSG and public IP **really exist** — with their **tags**. You now deploy like a pro: the **same IaC** as locally, on the real cloud. ⚠️ **Real differences:** the **storage account name** (if you add the workloads) must be **globally unique**; the **Standard public IP** starts to **cost** money from creation; and the Bicep governance finally **deploys** (`az deployment group create --resource-group rg-landing --template-file ../gouvernance/durcissement.bicep --parameters principalId=...`).
:::

### step-05

:::lang fr
**Objectif.** Démonter les **illusions de l'émulateur** — ce qui change en réel.

**🤔 Ce que miniblue simplifiait (et qui compte à l'examen).** L'émulateur est parfait pour la **logique**, mais il ne reproduit pas tout. Connaître les écarts évite les mauvaises surprises en prod — et fait répondre juste à l'AZ-104.

Les principaux écarts :
:::

:::lang en
**Goal.** Dismantle the **emulator's illusions** — what changes for real.

**🤔 What miniblue simplified (and what matters on the exam).** The emulator is perfect for the **logic**, but it doesn't reproduce everything. Knowing the gaps avoids nasty prod surprises — and answers the AZ-104 correctly.

The main gaps:
:::

```text
miniblue (émulateur)              →  Réel / Real
──────────────────────────────────────────────────────────────────────────
RBAC ignoré / not enforced        →  RBAC APPLIQUÉ : sans le bon rôle, accès refusé
policies non appliquées           →  policies BLOQUENT vraiment (deny) / audit remonte
rôles/verrous non provisionnés    →  déployés et actifs (attribution, CanNotDelete)
NIC/peering 404                   →  cartes réseau & peering se provisionnent complètement
noms « libres »                   →  compte de stockage = unicité MONDIALE
pas de quotas / no quotas         →  quotas par région/famille de VM (à surveiller)
gratuit / free                    →  facturé ; VM à LIBÉRER (deallocate) pour stopper le coût
```

:::lang fr
**✅ Vérification :** tu peux **expliquer** chaque écart. Les plus piégeux à l'examen : (1) le **RBAC est réellement appliqué** — retire un rôle, l'accès est **refusé** (miniblue laissait tout passer) ; (2) les **policies bloquent** vraiment (une ressource sans le tag exigé est **refusée**) ; (3) **cartes réseau et peering** se provisionnent (plus de 404) — tu peux enfin brancher une VM à une IP publique ; (4) **coût** : une **VM allumée facture**, et « arrêter » depuis l'OS **ne suffit pas** — il faut la **libérer** (`az vm deallocate`). ⚠️ Ces écarts ne **remettent pas en cause** ce que tu as appris : la **logique** est la même. Ils ajoutent la **rigueur** du réel — sécurité appliquée, unicité, quotas, coût.
:::

:::lang en
**✅ Check:** you can **explain** each gap. The trickiest on the exam: (1) **RBAC is really enforced** — remove a role, access is **denied** (miniblue let everything through); (2) **policies really block** (a resource without the required tag is **denied**); (3) **network cards and peering** provision (no more 404) — you can finally attach a VM to a public IP; (4) **cost**: a **running VM bills**, and "stopping" from the OS is **not enough** — you must **deallocate** it (`az vm deallocate`). ⚠️ These gaps don't **invalidate** what you learned: the **logic** is the same. They add the **rigor** of real life — enforced security, uniqueness, quotas, cost.
:::

### step-06

:::lang fr
**Objectif.** **Tout démonter** (la discipline anti-facture).

**🤔 Créer → utiliser → détruire.** La seule vraie garantie contre la facture surprise : **supprimer** ce que tu ne veux plus payer. `terraform destroy` retire ce que le state gère ; puis, pour être **certain** qu'il ne reste **rien**, on supprime le **groupe de ressources** entier.

Démonte :
:::

:::lang en
**Goal.** **Tear everything down** (the anti-bill discipline).

**🤔 Create → use → destroy.** The only real guarantee against a surprise bill: **delete** what you no longer want to pay for. `terraform destroy` removes what the state manages; then, to be **certain** nothing remains, we delete the whole **resource group**.

Tear it down:
:::

```bash
# 1) Détruire l'infra gérée par Terraform / destroy the Terraform-managed infra
cd ~/landing-zone/infra
terraform destroy

# 2) Filet de sécurité : supprimer le GROUPE entier (retire TOUT résiduel)
#    safety net: delete the WHOLE group (removes ANY leftover)
az group delete --name rg-landing --yes --no-wait

# 3) (optionnel) supprimer le principal de service / (optional) delete the service principal
az ad sp delete --id "$ARM_CLIENT_ID"
```

:::lang fr
**✅ Vérification :** `terraform destroy` affiche `Destroy complete! Resources: N destroyed.`. `az group delete` retire le groupe et **tout** ce qu'il contenait — dans le portail, `rg-landing` disparaît. **Plus aucune ressource facturable.** Tu as bouclé le cycle **créer → utiliser → détruire** — le réflexe d'un administrateur responsable. ⚠️ Vérifie le **tableau de bord des coûts** quelques jours plus tard (les coûts se consolident avec un léger décalage). Pour un abonnement d'essai entier dont tu ne veux plus, tu peux aussi l'**annuler** depuis le portail. 🎓 **Cap sur l'AZ-104 :** entraîne-toi sur des **examens blancs**, révise les **choix de service**, les **rôles RBAC**, les **niveaux de stockage** et le **coût des VM** (arrêtée vs libérée). Tu es prêt·e.
:::

:::lang en
**✅ Check:** `terraform destroy` shows `Destroy complete! Resources: N destroyed.`. `az group delete` removes the group and **everything** it held — in the portal, `rg-landing` disappears. **No more billable resource.** You closed the **create → use → destroy** cycle — a responsible administrator's reflex. ⚠️ Check the **cost dashboard** a few days later (costs consolidate with a slight delay). For an entire trial subscription you no longer want, you can also **cancel** it from the portal. 🎓 **Aim for AZ-104:** practice on **mock exams**, revise **service choices**, **RBAC roles**, **storage tiers** and **VM cost** (stopped vs deallocated). You're ready.
:::

### step-07

:::lang fr
**Objectif.** La suite du **parcours Azure**.

**🤔 Tu as bouclé l'AZ-104.** Administrateur, c'est le socle. Le parcours Azure continue vers des rôles plus spécialisés — architecte, DevOps, sécurité, réseau — et **miniblue te resservira** dans chacun.

La feuille de route :
:::

:::lang en
**Goal.** The rest of the **Azure path**.

**🤔 You've completed AZ-104.** Administrator is the base. The Azure path continues toward more specialized roles — architect, DevOps, security, networking — and **miniblue will serve you** in each.

The roadmap:
:::

```text
PARCOURS AZURE / AZURE PATH
  AZ-900   Fondamentaux (fait) / Fundamentals (done)
  AZ-104   Administrateur (fait) / Administrator (done)      <- tu es ici / you are here
  AZ-305   Architecte de solutions / Solutions Architect
  AZ-400   Ingénieur DevOps / DevOps Engineer
  AZ-500   Ingénieur sécurité / Security Engineer
  AZ-700   Ingénieur réseau / Network Engineer
```

:::lang fr
**✅ Vérification :** tu situes ta progression. Tu as le **socle** (fondamentaux + administrateur) : projets & abonnements, réseau, stockage, calcul, identité & gouvernance, IaC (Terraform + Bicep), et la discipline de coût. La suite ajoute la **conception** (AZ-305), l'**automatisation** (AZ-400), la **sécurité** (AZ-500) et le **réseau avancé** (AZ-700) — tous déployables/validables en local sur miniblue avec la méthode de ce parcours. **Félicitations : tu tiens l'AZ-104 de bout en bout.**
:::

:::lang en
**✅ Check:** you can place your progress. You have the **base** (fundamentals + administrator): projects & subscriptions, networking, storage, compute, identity & governance, IaC (Terraform + Bicep), and cost discipline. The next steps add **design** (AZ-305), **automation** (AZ-400), **security** (AZ-500) and **advanced networking** (AZ-700) — all deployable/validatable locally on miniblue with this path's method. **Congratulations: you hold AZ-104 end to end.**
:::

## pitfalls

:::lang fr
**1. Créer des ressources AVANT le budget.** Toujours l'inverse : garde-fous **d'abord**, ressources ensuite.

**2. Croire qu'un budget bloque la dépense.** Il **alerte**, il ne **coupe** pas. La vraie protection, c'est la **suppression** (destroy + delete group).

**3. Committer le secret du principal de service.** Le `password` est aussi puissant qu'un mot de passe. Jamais dans Git ; en variable d'environnement seulement.

**4. Laisser le bloc de ciblage miniblue.** Si `metadata_host` reste, Terraform vise **encore l'émulateur**. Retire-le et `unset SSL_CERT_FILE` pour le réel.

**5. Oublier de libérer une VM.** « Arrêter » depuis l'OS **facture encore**. `az vm deallocate` pour cesser le coût de calcul.

**6. Nom de compte de stockage non unique.** En réel, les noms sont **mondiaux**. Ajoute un suffixe (`uniqueString`/aléatoire).

**7. Oublier de supprimer le groupe.** Le filet de sécurité ultime. `az group delete` retire **tout** résiduel facturable.
:::

:::lang en
**1. Creating resources BEFORE the budget.** Always the reverse: guardrails **first**, resources next.

**2. Thinking a budget blocks spend.** It **alerts**, it doesn't **cut**. The real protection is **deletion** (destroy + delete group).

**3. Committing the service principal secret.** The `password` is as powerful as a password. Never in Git; in an environment variable only.

**4. Leaving the miniblue targeting block.** If `metadata_host` stays, Terraform **still targets the emulator**. Remove it and `unset SSL_CERT_FILE` for real.

**5. Forgetting to deallocate a VM.** "Stopping" from the OS **still bills**. `az vm deallocate` to stop the compute cost.

**6. Non-unique storage account name.** For real, names are **global**. Add a suffix (`uniqueString`/random).

**7. Forgetting to delete the group.** The ultimate safety net. `az group delete` removes **all** residual billable resources.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées un **compte** et repères ton **abonnement** (ID).
- [ ] Tu crées un **principal de service** et exportes les variables `ARM_*`.
- [ ] Tu poses un **budget + alertes** **avant** toute ressource.
- [ ] Tu **retires le ciblage miniblue** et fais un `terraform apply` réel.
- [ ] Tu cites **3 écarts** émulateur → réel (RBAC appliqué, unicité, coût/deallocate…).
- [ ] Tu fais **`destroy`** puis **supprimes le groupe** — zéro ressource facturable.
- [ ] Tu situes ta progression dans le **parcours Azure**.

Sept cases = tu sais passer en réel **proprement**. Prochain arrêt : la **certification AZ-104**.
:::

:::lang en
You know it works when…

- [ ] You create an **account** and locate your **subscription** (ID).
- [ ] You create a **service principal** and export the `ARM_*` variables.
- [ ] You set a **budget + alerts** **before** any resource.
- [ ] You **remove the miniblue targeting** and run a real `terraform apply`.
- [ ] You name **3 gaps** emulator → real (RBAC enforced, uniqueness, cost/deallocate…).
- [ ] You run **`destroy`** then **delete the group** — zero billable resource.
- [ ] You place your progress in the **Azure path**.

Seven boxes = you can go real **cleanly**. Next stop: the **AZ-104 certification**.
:::

## next

:::lang fr
Tu as terminé le track **AZ-104 — Administrateur Azure** ! 🎉

1. **Certification AZ-104** : entraîne-toi sur des **examens blancs**, révise les **choix de service**, les **rôles RBAC**, les **niveaux de stockage** et le **coût des VM**.
2. **Ton CV** : mets en avant la **zone d'atterrissage** (réseau segmenté, gouvernance, IaC).
3. **La suite du parcours Azure** : **AZ-305** (architecte), **AZ-400** (DevOps), **AZ-500** (sécurité), **AZ-700** (réseau) — même méthode, même labo miniblue.
:::

:::lang en
You've finished the **AZ-104 — Azure Administrator** track! 🎉

1. **AZ-104 certification**: practice on **mock exams**, revise **service choices**, **RBAC roles**, **storage tiers** and **VM cost**.
2. **Your CV**: highlight the **landing zone** (segmented network, governance, IaC).
3. **The rest of the Azure path**: **AZ-305** (architect), **AZ-400** (DevOps), **AZ-500** (security), **AZ-700** (networking) — same method, same miniblue lab.
:::

## cheatsheet

:::lang fr
Aide-mémoire « passer en réel » (Azure).
:::

:::lang en
"Going real" cheat sheet (Azure).
:::

```bash
# Compte & abonnement / account & subscription
az login
az account show --query id -o tsv        # ton ID d'abonnement / your subscription ID

# Principal de service pour Terraform / service principal for Terraform
az ad sp create-for-rbac --name sp-terraform-labo --role Contributor --scopes /subscriptions/<SUB>
export ARM_CLIENT_ID=... ARM_CLIENT_SECRET=... ARM_TENANT_ID=... ARM_SUBSCRIPTION_ID=<SUB>

# Garde-fou de coût AVANT tout / cost guardrail FIRST
az consumption budget create --budget-name garde-fou-labo --amount 5 --time-grain Monthly --category Cost --start-date 2026-09-01 --end-date 2027-09-01

# Déployer en réel (après avoir RETIRÉ le bloc miniblue) / deploy for real (after REMOVING the miniblue block)
unset SSL_CERT_FILE ; terraform init -upgrade ; terraform apply

# TOUT démonter / tear it ALL down
terraform destroy ; az group delete --name rg-landing --yes --no-wait
```

## resources

:::lang fr
- [Compte Azure gratuit](https://azure.microsoft.com/free/) — crédit d'essai, services gratuits.
- [Authentifier Terraform sur Azure](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/service_principal_client_secret) — principal de service.
- [Budgets Azure Cost Management](https://learn.microsoft.com/azure/cost-management-billing/costs/tutorial-acm-create-budgets) — les garde-fous.
- [États et facturation d'une VM](https://learn.microsoft.com/azure/virtual-machines/states-billing) — arrêtée vs libérée.
- [Certification AZ-104](https://learn.microsoft.com/credentials/certifications/azure-administrator/) — le programme officiel.
:::

:::lang en
- [Free Azure account](https://azure.microsoft.com/free/) — trial credit, free services.
- [Authenticate Terraform to Azure](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/service_principal_client_secret) — service principal.
- [Azure Cost Management budgets](https://learn.microsoft.com/azure/cost-management-billing/costs/tutorial-acm-create-budgets) — the guardrails.
- [VM states and billing](https://learn.microsoft.com/azure/virtual-machines/states-billing) — stopped vs deallocated.
- [AZ-104 certification](https://learn.microsoft.com/credentials/certifications/azure-administrator/) — the official program.
:::

## troubleshooting

:::lang fr
**`terraform apply` : « building account: could not... »** Tu n'es ni connecté (`az login`) ni pourvu des variables `ARM_*`. Exporte les identifiants du principal de service, ou reste connecté via `az login`.

**`terraform apply` vise encore miniblue.** Le bloc de ciblage (`metadata_host`, identifiants `miniblue`) est toujours dans `providers.tf`. Retire-le, `unset SSL_CERT_FILE`, `terraform init -upgrade`.

**`az ad sp create-for-rbac` : permission refusée.** Ton compte n'a pas le droit de créer des principaux de service dans le tenant. Utilise un compte disposant des droits, ou passe par `az login` interactif pour Terraform.

**Nom de compte de stockage rejeté (« already taken »).** Les noms sont **mondiaux**. Rends-le plus spécifique (suffixe unique).

**Une ressource refuse de se créer (policy).** En réel, une **policy** peut **bloquer** (deny) — ex. si le tag `env` manque. Ajoute le tag requis, ou ajuste la policy.

**Peur de la facture.** Le plus sûr : `az group delete --name <groupe> --yes`. Ça retire **tout** le groupe et **arrête** la facturation des ressources qu'il contient. Vérifie ensuite le tableau de bord des coûts.
:::

:::lang en
**`terraform apply`: "building account: could not..."** You're neither signed in (`az login`) nor provisioned with the `ARM_*` variables. Export the service principal's credentials, or stay signed in via `az login`.

**`terraform apply` still targets miniblue.** The targeting block (`metadata_host`, `miniblue` credentials) is still in `providers.tf`. Remove it, `unset SSL_CERT_FILE`, `terraform init -upgrade`.

**`az ad sp create-for-rbac`: permission denied.** Your account can't create service principals in the tenant. Use an account with the rights, or use interactive `az login` for Terraform.

**Storage account name rejected ("already taken").** Names are **global**. Make it more specific (unique suffix).

**A resource refuses to be created (policy).** For real, a **policy** can **block** (deny) — e.g. if the `env` tag is missing. Add the required tag, or adjust the policy.

**Fear of the bill.** Safest: `az group delete --name <group> --yes`. It removes the **whole** group and **stops** billing for the resources it holds. Then check the cost dashboard.
:::
