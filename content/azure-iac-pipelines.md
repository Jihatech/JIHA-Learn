---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-iac-pipelines
slug: azure-iac-pipelines
order: 72
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — l'IaC dans les pipelines (AZ-400) : validate, plan, apply"
title_en: "Azure — IaC in pipelines (AZ-400): validate, plan, apply"
tagline_fr: "déployer Terraform/Bicep depuis une pipeline, plan revu, porte d'apply."
tagline_en: "deploy Terraform/Bicep from a pipeline, reviewed plan, apply gate."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 280
repo: "hashicorp/terraform"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-pipelines-cicd]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [iac, terraform, bicep, plan, apply, plan-artefact, etat, environnements, approbation, az-400]
concepts_en: [iac, terraform, bicep, plan, apply, plan-artifact, state, environments, approval, az-400]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Déployer l'infrastructure comme du code depuis une pipeline, pour l'AZ-400, en local et pour de vrai (miniblue) : l'hygiène IaC en CI (fmt -check + validate qui échouent tôt), le terraform plan comme dry-run, le plan sauvegardé en ARTEFACT (plan -out) revu par un humain puis appliqué à l'identique (apply tfplan), l'apply LIVE de ressources sur l'émulateur, la pipeline multi-stages Valider → Plan → Apply avec porte d'environnement et approbation, la variante Bicep (build + what-if) et le multi-environnement (dev/prod) avec état distant et verrou. Sans compte cloud.",
og_description_en: "Deploying infrastructure as code from a pipeline, for AZ-400, locally and for real (miniblue): IaC hygiene in CI (fmt -check + validate failing early), the terraform plan as a dry-run, the saved plan as an ARTIFACT (plan -out) reviewed by a human then applied identically (apply tfplan), the LIVE apply of resources on the emulator, the multi-stage Validate → Plan → Apply pipeline with an environment gate and approval, the Bicep variant (build + what-if) and multi-environment (dev/prod) with remote state and locking. No cloud account."
---

## intro

:::lang fr
Tes pipelines savent **construire et tester** du code (guide précédent). Maintenant, elles vont **déployer de l'infrastructure**. C'est le cœur du **GitOps** et un gros morceau de l'**AZ-400** : décrire l'infra en **code** (Terraform, Bicep), la **valider**, la **prévisualiser** (`plan`), puis l'**appliquer** — le tout automatisé, tracé, et **gardé** par une approbation avant la prod.

Fidèle à la méthode, on le fait **en vrai et en local** : notre émulateur **miniblue** accepte un `terraform apply` — on **crée réellement** un groupe de ressources, un réseau, un sous-réseau, puis on **détruit**. On découvre le pattern décisif : le **plan comme artefact** (`terraform plan -out`) — un humain **revoit** exactement ce qui sera fait, puis `apply` applique **ce plan précis**, sans dérive entre revue et exécution. On écrit la pipeline **multi-stages** (Valider → Plan → Apply, la dernière derrière une **porte** d'environnement), on la **valide**, et on voit la **variante Bicep** (`build` + `what-if`) et le **multi-environnement** (dev/prod) avec **état distant** et **verrou**.

**Pour qui c'est :** tu maîtrises les pipelines CI/CD et l'IaC (Terraform/Bicep des tracks AZ-104/305) et tu veux les **relier**.

**Quand ce n'est PAS le bon choix :**

- Tu n'as jamais écrit de Terraform/Bicep → fais d'abord les guides IaC (AZ-104 réseau/stockage, AZ-305).
- Tu ne sais pas ce qu'est un `plan` → ce guide te le montre, mais les bases IaC aident.
:::

:::lang en
Your pipelines can **build and test** code (previous guide). Now they'll **deploy infrastructure**. This is the heart of **GitOps** and a big chunk of **AZ-400**: describe infra as **code** (Terraform, Bicep), **validate** it, **preview** it (`plan`), then **apply** it — all automated, traced, and **gated** by an approval before prod.

True to the method, we do it **for real and locally**: our **miniblue** emulator accepts a `terraform apply` — we **actually create** a resource group, a network, a subnet, then **destroy** them. We discover the decisive pattern: the **plan as an artifact** (`terraform plan -out`) — a human **reviews** exactly what will be done, then `apply` applies **that precise plan**, with no drift between review and execution. We write the **multi-stage** pipeline (Validate → Plan → Apply, the last behind an environment **gate**), **validate** it, and see the **Bicep variant** (`build` + `what-if`) and **multi-environment** (dev/prod) with **remote state** and **locking**.

**Who it's for:** you know CI/CD pipelines and IaC (Terraform/Bicep from the AZ-104/305 tracks) and want to **connect** them.

**When it's NOT the right choice:**

- You've never written Terraform/Bicep → do the IaC guides first (AZ-104 network/storage, AZ-305).
- You don't know what a `plan` is → this guide shows you, but IaC basics help.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Faire de l'**hygiène IaC** un gate de CI (`fmt -check`, `validate`) qui échoue tôt.
- Lire un **`terraform plan`** comme un **dry-run** (le diff avant d'agir).
- Sauvegarder un **plan en artefact** (`plan -out`) et l'**appliquer à l'identique** (`apply tfplan`).
- **Appliquer** de l'infra pour de vrai (sur miniblue) et la **détruire**.
- Écrire une pipeline **Valider → Plan → Apply** avec **porte** (environnement + approbation).
- Comparer **Terraform** et **Bicep** dans une pipeline (`build`, `what-if`).
- Gérer le **multi-environnement** (dev/prod) avec **état distant** et **verrou**.
:::

:::lang en
By the end of this guide, you can:

- Make **IaC hygiene** a CI gate (`fmt -check`, `validate`) that fails early.
- Read a **`terraform plan`** as a **dry-run** (the diff before acting).
- Save a **plan as an artifact** (`plan -out`) and **apply it identically** (`apply tfplan`).
- **Apply** infra for real (on miniblue) and **destroy** it.
- Write a **Validate → Plan → Apply** pipeline with a **gate** (environment + approval).
- Compare **Terraform** and **Bicep** in a pipeline (`build`, `what-if`).
- Handle **multi-environment** (dev/prod) with **remote state** and **locking**.
:::

## prerequisites

:::lang fr
- Le guide **Azure — pipelines CI/CD en profondeur (AZ-400)** (jobs, stages, artefacts, portes).
- Le **lab local** des tracks Azure : **miniblue** démarré (port 4567) et **Terraform** installé. Voir *Azure — fondamentaux (AZ-900)* pour l'installer.
- La variable `SSL_CERT_FILE` pointant sur le certificat de miniblue (`~/.miniblue/cert.pem`).
- **Bicep CLI** (optionnel, pour la variante Bicep) : `az bicep install`.
- **Aucun compte cloud** : `apply` cible l'émulateur local ; les pipelines se valident en local.
:::

:::lang en
- The **Azure — CI/CD pipelines in depth (AZ-400)** guide (jobs, stages, artifacts, gates).
- The Azure tracks' **local lab**: **miniblue** started (port 4567) and **Terraform** installed. See *Azure — fundamentals (AZ-900)* to set it up.
- The `SSL_CERT_FILE` variable pointing at miniblue's certificate (`~/.miniblue/cert.pem`).
- **Bicep CLI** (optional, for the Bicep variant): `az bicep install`.
- **No cloud account**: `apply` targets the local emulator; pipelines validate locally.
:::

## concepts

:::lang fr
**L'IaC dans une pipeline : le flux Valider → Plan → Apply.** On ne fait pas `apply` à l'aveugle. Le flux standard : (1) **Valider** — le code est bien formaté (`fmt -check`) et syntaxiquement correct (`validate`) ; c'est un **gate de CI** qui échoue **tôt** et gratuitement. (2) **Plan** — `terraform plan` calcule le **diff** entre l'état voulu et le réel : ce qui sera **créé / modifié / détruit**. C'est un **dry-run** : il ne change rien. (3) **Apply** — on exécute le plan. Entre Plan et Apply, on met une **porte** (approbation) : un humain **revoit** le diff avant que ça touche la prod.

**Le plan comme artefact — le pattern décisif.** `terraform plan -out=tfplan` **sauvegarde** le plan dans un fichier. Ce fichier est un **artefact** : la pipeline le **publie**, un humain (ou un check) l'**examine**, puis le stage d'apply fait `terraform apply tfplan` — il applique **exactement** ce plan, pas un nouveau calcul. Bénéfice : **aucune dérive** entre ce qui a été revu et ce qui est exécuté (si le réel a changé entre-temps, appliquer le vieux plan **échoue** au lieu de faire une surprise).

**L'état (state).** Terraform garde un **état** : la carte entre ton code et les ressources réelles. En pipeline, cet état doit être **partagé** et **verrouillé** : on le stocke à distance (**remote state** — ex. un conteneur Blob Azure) avec un **verrou** (lock) pour éviter que deux exécutions s'écrasent. En local (ce guide), l'état est un simple fichier `terraform.tfstate`.

**Terraform vs Bicep en pipeline.** **Terraform** : `fmt` / `validate` / `plan` / `apply`, multi-cloud, état explicite. **Bicep** (natif Azure) : `az bicep build` (compile en ARM, validation **offline**), `az deployment group what-if` (l'équivalent du `plan`, mode aperçu), pas d'état à gérer (l'état est côté Azure Resource Manager). Les deux se déploient depuis une pipeline ; le choix suit l'équipe et le périmètre (Azure pur → Bicep ; multi-cloud/état → Terraform).

**Environnements & approbations.** Comme pour le déploiement applicatif : le stage d'`apply` cible un **environnement** (`dev`, `prod`). Sur `prod`, on attache une **approbation** — la pipeline **s'arrête** et attend un humain. `dev` peut être **automatique**. Même code, portes différentes.

**Ce qui est live ici.** `terraform fmt/validate/plan/apply/destroy` s'exécutent **pour de vrai** contre **miniblue** : on **crée** un groupe de ressources, un VNet et des sous-réseaux, on **sauvegarde et applique un plan**, puis on **détruit**. `az bicep build` **compile** un template en ARM (offline). Les **pipelines** (GitHub Actions, Azure Pipelines) se **valident** en local ; leur **exécution** sur runner cible du **vrai** Azure (ou un self-hosted runner pointant sur miniblue). Pas de compte requis pour **apprendre le flux**.
:::

:::lang en
**IaC in a pipeline: the Validate → Plan → Apply flow.** You don't `apply` blindly. The standard flow: (1) **Validate** — the code is well-formatted (`fmt -check`) and syntactically correct (`validate`); it's a **CI gate** that fails **early** and for free. (2) **Plan** — `terraform plan` computes the **diff** between desired and real state: what will be **created / changed / destroyed**. It's a **dry-run**: it changes nothing. (3) **Apply** — you execute the plan. Between Plan and Apply, we put a **gate** (approval): a human **reviews** the diff before it touches prod.

**The plan as an artifact — the decisive pattern.** `terraform plan -out=tfplan` **saves** the plan to a file. That file is an **artifact**: the pipeline **publishes** it, a human (or a check) **examines** it, then the apply stage runs `terraform apply tfplan` — applying **exactly** that plan, not a fresh computation. Benefit: **no drift** between what was reviewed and what runs (if reality changed meanwhile, applying the old plan **fails** instead of surprising you).

**State.** Terraform keeps a **state**: the map between your code and the real resources. In a pipeline, this state must be **shared** and **locked**: store it remotely (**remote state** — e.g. an Azure Blob container) with a **lock** to prevent two runs from clobbering each other. Locally (this guide), state is a plain `terraform.tfstate` file.

**Terraform vs Bicep in a pipeline.** **Terraform**: `fmt` / `validate` / `plan` / `apply`, multi-cloud, explicit state. **Bicep** (Azure-native): `az bicep build` (compiles to ARM, **offline** validation), `az deployment group what-if` (the `plan` equivalent, preview mode), no state to manage (state lives in Azure Resource Manager). Both deploy from a pipeline; the choice follows the team and scope (pure Azure → Bicep; multi-cloud/state → Terraform).

**Environments & approvals.** Same as app deployment: the `apply` stage targets an **environment** (`dev`, `prod`). On `prod`, you attach an **approval** — the pipeline **pauses** and waits for a human. `dev` can be **automatic**. Same code, different gates.

**What's live here.** `terraform fmt/validate/plan/apply/destroy` run **for real** against **miniblue**: we **create** a resource group, a VNet and subnets, we **save and apply a plan**, then **destroy**. `az bicep build` **compiles** a template to ARM (offline). The **pipelines** (GitHub Actions, Azure Pipelines) are **validated** locally; **running** them on a runner targets **real** Azure (or a self-hosted runner pointing at miniblue). No account required to **learn the flow**.
:::

:::figure azure-iac-pipelines-flow
caption_fr: "Schéma 1. L'IaC dans une pipeline : le commit du code Terraform déclenche VALIDER (fmt -check + validate, gate qui échoue tôt) → PLAN (terraform plan -out=tfplan, sauvé en ARTEFACT) → PORTE (un humain revoit le diff, approbation sur l'environnement) → APPLY (terraform apply tfplan applique EXACTEMENT le plan revu). L'état est partagé et verrouillé (remote state). Aucune dérive entre revue et exécution."
caption_en: "Figure 1. IaC in a pipeline: the Terraform code commit triggers VALIDATE (fmt -check + validate, a gate that fails early) → PLAN (terraform plan -out=tfplan, saved as an ARTIFACT) → GATE (a human reviews the diff, approval on the environment) → APPLY (terraform apply tfplan applies EXACTLY the reviewed plan). State is shared and locked (remote state). No drift between review and execution."
:::

## walkthrough

:::lang fr
On avance ainsi : hygiène IaC en CI (fmt/validate) → plan (dry-run) → plan-artefact + apply à l'identique → apply live & vérification → pipeline Valider/Plan/Apply avec porte → variante Bicep → multi-environnement, état, puis destroy.
:::

:::lang en
We'll go like this: IaC hygiene in CI (fmt/validate) → plan (dry-run) → plan-artifact + identical apply → live apply & verification → Validate/Plan/Apply pipeline with a gate → Bicep variant → multi-environment, state, then destroy.
:::

### step-01

:::lang fr
**Objectif.** Faire de l'**hygiène IaC** un gate de CI : `fmt -check` et `validate`.

**🤔 Échouer tôt, gratuitement.** Avant tout déploiement, on vérifie que le code est **formaté** et **valide**. Ces deux commandes ne touchent à **rien** ; elles échouent **avant** de dépenser du temps de runner ou de risquer la prod. On pose le code Terraform (réseau) et on le passe au crible.

Crée l'infra Terraform et lance les gates :
:::

:::lang en
**Goal.** Make **IaC hygiene** a CI gate: `fmt -check` and `validate`.

**🤔 Fail early, for free.** Before any deployment, check the code is **formatted** and **valid**. These two commands touch **nothing**; they fail **before** spending runner time or risking prod. We lay down the Terraform (network) code and run it through the sieve.

Create the Terraform infra and run the gates:
:::

```bash
mkdir -p iac-pipeline/infra && cd iac-pipeline/infra
export SSL_CERT_FILE=$HOME/.miniblue/cert.pem
export ARM_ENVIRONMENT=public

cat > providers.tf <<'TF'
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
  metadata_host              = "localhost:4567"
  skip_provider_registration = true
  subscription_id            = "00000000-0000-0000-0000-000000000000"
  tenant_id                  = "00000000-0000-0000-0000-000000000001"
  client_id                  = "miniblue"
  client_secret              = "miniblue"
  environment                = "public"
}
TF

cat > main.tf <<'TF'
resource "azurerm_resource_group" "app" {
  name     = "rg-iac-pipeline"
  location = "westeurope"
  tags     = { projet = "iac-pipeline", gere = "terraform" }
}

resource "azurerm_virtual_network" "app" {
  name                = "vnet-app"
  location            = azurerm_resource_group.app.location
  resource_group_name = azurerm_resource_group.app.name
  address_space       = ["10.20.0.0/16"]
  tags                = azurerm_resource_group.app.tags
}

resource "azurerm_subnet" "web" {
  name                 = "snet-web"
  resource_group_name  = azurerm_resource_group.app.name
  virtual_network_name = azurerm_virtual_network.app.name
  address_prefixes     = ["10.20.1.0/24"]
}
TF

# Gate 1 : format / formatting
terraform fmt -check -recursive . && echo "FMT OK (formaté / formatted)"
# Gate 2 : validité / validity (init d'abord)
terraform init -no-color > /dev/null && terraform validate -no-color
```

:::lang fr
**✅ Vérification :** `fmt -check` affiche `FMT OK` (aucun fichier mal formaté — sinon il liste les fichiers et **sort en erreur**), et `validate` affiche `Success! The configuration is valid.` Ces deux gates sont les **premiers jobs** de ta pipeline IaC : rapides, sans risque, ils bloquent un code sale avant qu'il n'aille plus loin. ⚠️ `validate` a besoin d'un `init` préalable (il charge le provider).
:::

:::lang en
**✅ Check:** `fmt -check` shows `FMT OK` (no misformatted file — otherwise it lists the files and **exits with an error**), and `validate` shows `Success! The configuration is valid.` These two gates are the **first jobs** of your IaC pipeline: fast, risk-free, they block dirty code before it goes further. ⚠️ `validate` needs a prior `init` (it loads the provider).
:::

### step-02

:::lang fr
**Objectif.** Lire un **`terraform plan`** — le **dry-run** qui montre le diff.

**🤔 Voir avant d'agir.** `plan` compare l'état voulu (ton code) au réel et annonce ce qu'il **créerait / modifierait / détruirait**. Il ne change **rien**. C'est ce qu'un humain **revoit** avant d'approuver.

Lance le plan et lis le résumé :
:::

:::lang en
**Goal.** Read a **`terraform plan`** — the **dry-run** that shows the diff.

**🤔 See before acting.** `plan` compares desired state (your code) to reality and announces what it **would create / change / destroy**. It changes **nothing**. It's what a human **reviews** before approving.

Run the plan and read the summary:
:::

```bash
terraform plan -no-color 2>&1 | grep -E "will be created|Plan:"
```

:::lang fr
**✅ Vérification :** tu vois trois lignes `# ... will be created` (le groupe de ressources, le VNet, le sous-réseau) puis `Plan: 3 to add, 0 to change, 0 to destroy.` C'est le **diff** : trois ressources seront créées, rien ne sera modifié ni détruit. Rien n'a encore été appliqué. Dans une pipeline, cette sortie est **publiée** pour revue.
:::

:::lang en
**✅ Check:** you see three `# ... will be created` lines (the resource group, the VNet, the subnet) then `Plan: 3 to add, 0 to change, 0 to destroy.` That's the **diff**: three resources will be created, nothing changed or destroyed. Nothing has been applied yet. In a pipeline, this output is **published** for review.
:::

### step-03

:::lang fr
**Objectif.** Sauvegarder le **plan en artefact** (`plan -out`) et l'**appliquer à l'identique**.

**🤔 Revoir exactement ce qui sera fait.** Si on refait un `plan` au moment de l'`apply`, il pourrait **différer** de celui qu'on a revu. Le pattern : `plan -out=tfplan` **fige** le plan dans un fichier ; on l'**examine** ; puis `apply tfplan` applique **ce plan précis**. C'est le fichier `tfplan` qui voyage comme **artefact** entre le stage Plan et le stage Apply.

Fige le plan, inspecte-le, applique-le :
:::

:::lang en
**Goal.** Save the **plan as an artifact** (`plan -out`) and **apply it identically**.

**🤔 Review exactly what will be done.** If we re-run a `plan` at `apply` time, it could **differ** from the one we reviewed. The pattern: `plan -out=tfplan` **freezes** the plan into a file; we **examine** it; then `apply tfplan` applies **that precise plan**. The `tfplan` file is what travels as an **artifact** between the Plan stage and the Apply stage.

Freeze the plan, inspect it, apply it:
:::

```bash
# Figer le plan dans un fichier (l'artefact) / freeze the plan into a file (the artifact)
terraform plan -out=tfplan -no-color 2>&1 | grep -E "Plan:|Saved"
ls -la tfplan | awk '{print "artefact plan / plan artifact:", $5, "octets/bytes"}'

# Relire le plan sauvegardé (lecture seule) / re-read the saved plan (read-only)
terraform show tfplan -no-color 2>&1 | grep -E "will be created|Plan:" | head -4

# Appliquer EXACTEMENT ce plan / apply EXACTLY this plan
terraform apply -no-color tfplan 2>&1 | grep -E "Apply complete|Creation complete" | head -4
```

:::lang fr
**✅ Vérification :** `plan -out=tfplan` affiche `Saved the plan to: tfplan` et le fichier fait quelques kilo-octets. `terraform show tfplan` **relit** le plan figé (mêmes trois créations). `apply tfplan` **crée** les ressources et finit par `Apply complete! Resources: 3 added, 0 changed, 0 destroyed.` — sans **redemander** de confirmation, car le plan était déjà approuvé. C'est **exactement** le pattern d'une pipeline : Plan (artefact) → revue → Apply de l'artefact.
:::

:::lang en
**✅ Check:** `plan -out=tfplan` shows `Saved the plan to: tfplan` and the file is a few kilobytes. `terraform show tfplan` **re-reads** the frozen plan (same three creations). `apply tfplan` **creates** the resources and ends with `Apply complete! Resources: 3 added, 0 changed, 0 destroyed.` — without **re-asking** for confirmation, because the plan was already approved. That's **exactly** the pipeline pattern: Plan (artifact) → review → Apply the artifact.
:::

### step-04

:::lang fr
**Objectif.** Vérifier que l'infra est **live**, puis observer une **modification** (le diff en action).

**🤔 C'est du réel.** L'`apply` a créé de vraies ressources sur l'émulateur. On les **liste**, on **ajoute** un sous-réseau, et on refait `plan` : le diff ne montre plus que **1 à ajouter** — Terraform ne recrée pas l'existant, il **converge**.

Vérifie le live, ajoute une ressource, replanifie :
:::

:::lang en
**Goal.** Verify the infra is **live**, then observe a **change** (the diff in action).

**🤔 It's real.** The `apply` created real resources on the emulator. We **list** them, **add** a subnet, and re-run `plan`: the diff now shows only **1 to add** — Terraform doesn't recreate what exists, it **converges**.

Check the live state, add a resource, re-plan:
:::

```bash
# La ressource existe vraiment / the resource really exists
azlocal group show --name rg-iac-pipeline 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('groupe / group:', d['name'], '| état / state:', d['properties']['provisioningState'], '| tags:', d['tags'])"

# Ajouter un sous-réseau / add a subnet
cat >> main.tf <<'TF'

resource "azurerm_subnet" "app" {
  name                 = "snet-app"
  resource_group_name  = azurerm_resource_group.app.name
  virtual_network_name = azurerm_virtual_network.app.name
  address_prefixes     = ["10.20.2.0/24"]
}
TF

terraform plan -no-color 2>&1 | grep -E "Plan:"
```

:::lang fr
**✅ Vérification :** `group show` confirme `groupe / group: rg-iac-pipeline | état / state: Succeeded` avec les tags. Après ajout du sous-réseau, le nouveau `plan` affiche `Plan: 1 to add, 0 to change, 0 to destroy.` — Terraform **détecte** que seul `snet-app` manque. C'est l'**idempotence** de l'IaC : le code décrit l'**état voulu**, l'outil calcule le **delta**.
:::

:::lang en
**✅ Check:** `group show` confirms `groupe / group: rg-iac-pipeline | état / state: Succeeded` with the tags. After adding the subnet, the new `plan` shows `Plan: 1 to add, 0 to change, 0 to destroy.` — Terraform **detects** that only `snet-app` is missing. That's IaC's **idempotence**: the code describes the **desired state**, the tool computes the **delta**.
:::

### step-05

:::lang fr
**Objectif.** Écrire la pipeline **Valider → Plan → Apply** avec **porte** d'environnement.

**🤔 Le flux en YAML.** On traduit le flux en trois stages : `Valider` (fmt + validate), `Plan` (produit l'artefact `tfplan`), `Apply` (consomme l'artefact, derrière l'**environnement** `production` = porte d'approbation). On écrit la pipeline Azure Pipelines et on la **valide**.

Écris la pipeline et valide sa structure :
:::

:::lang en
**Goal.** Write the **Validate → Plan → Apply** pipeline with an environment **gate**.

**🤔 The flow in YAML.** We translate the flow into three stages: `Valider` (fmt + validate), `Plan` (produces the `tfplan` artifact), `Apply` (consumes the artifact, behind the `production` **environment** = approval gate). We write the Azure Pipelines pipeline and **validate** it.

Write the pipeline and validate its structure:
:::

```bash
cat > ../azure-pipelines.yml <<'YAML'
trigger:
  branches:
    include: [ main ]
pool:
  vmImage: ubuntu-latest
variables:
  TF_DIR: infra
stages:
  - stage: Valider
    jobs:
      - job: fmt_validate
        steps:
          - script: terraform fmt -check -recursive $(TF_DIR)
            displayName: Format
          - script: |
              cd $(TF_DIR)
              terraform init -backend=false
              terraform validate
            displayName: Validate
  - stage: Plan
    dependsOn: Valider
    jobs:
      - job: plan
        steps:
          - script: |
              cd $(TF_DIR)
              terraform init
              terraform plan -out=tfplan
            displayName: Plan
          - publish: $(TF_DIR)/tfplan
            artifact: tfplan
  - stage: Apply
    dependsOn: Plan
    jobs:
      - deployment: apply
        environment: production   # porte : approbation avant apply
        strategy:
          runOnce:
            deploy:
              steps:
                - download: current
                  artifact: tfplan
                - script: |
                    cd $(TF_DIR)
                    terraform init
                    terraform apply "$(Pipeline.Workspace)/tfplan/tfplan"
                  displayName: Apply
YAML

python3 -c "import yaml; d=yaml.safe_load(open('../azure-pipelines.yml')); \
st=d['stages']; \
print('stages:', [s['stage'] for s in st]); \
print('deps:', {s['stage']: s.get('dependsOn') for s in st}); \
print('porte / gate env:', st[2]['jobs'][0]['environment'])"
```

:::lang fr
**✅ Vérification :** la sortie affiche `stages: ['Valider', 'Plan', 'Apply']`, les dépendances chaînées, et `porte / gate env: production`. Le stage `Plan` **publie** l'artefact `tfplan` ; le stage `Apply` le **télécharge** et applique **ce** plan — derrière la porte `production`. C'est le flux IaC complet, écrit en pipeline-as-code. ⚠️ Ici on **valide** la structure ; sur un runner, `terraform` cible du vrai Azure (ou un self-hosted runner vers miniblue), avec les identifiants en **secrets** (jamais en clair).
:::

:::lang en
**✅ Check:** the output shows `stages: ['Valider', 'Plan', 'Apply']`, the chained dependencies, and `porte / gate env: production`. The `Plan` stage **publishes** the `tfplan` artifact; the `Apply` stage **downloads** it and applies **that** plan — behind the `production` gate. That's the complete IaC flow, written as pipeline-as-code. ⚠️ Here we **validate** the structure; on a runner, `terraform` targets real Azure (or a self-hosted runner to miniblue), with credentials as **secrets** (never in clear text).
:::

### step-06

:::lang fr
**Objectif.** La **variante Bicep** : `build` (validation offline) et `what-if` (l'équivalent du `plan`).

**🤔 Azure-natif, sans état.** Bicep compile en ARM et se **valide hors ligne** (`az bicep build`) — parfait comme gate de CI. Son **aperçu** avant déploiement est `az deployment group what-if`. Pas d'état à gérer : Azure Resource Manager le tient. On compile un template et on note l'équivalence.

Compile un template Bicep (gate de CI) :
:::

:::lang en
**Goal.** The **Bicep variant**: `build` (offline validation) and `what-if` (the `plan` equivalent).

**🤔 Azure-native, stateless.** Bicep compiles to ARM and **validates offline** (`az bicep build`) — perfect as a CI gate. Its **preview** before deployment is `az deployment group what-if`. No state to manage: Azure Resource Manager holds it. We compile a template and note the equivalence.

Compile a Bicep template (CI gate):
:::

```bash
cat > ../storage.bicep <<'BICEP'
param location string = resourceGroup().location
param nom string = 'stiac${uniqueString(resourceGroup().id)}'

resource compte 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: nom
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}
output compteId string = compte.id
BICEP

# Gate de CI : compiler/valider en ARM (offline) / CI gate: compile/validate to ARM (offline)
az bicep build --file ../storage.bicep --stdout 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Bicep compilé -> ARM OK, ressources:', [r['type'] for r in d['resources']])"
```

:::lang fr
**✅ Vérification :** la sortie affiche `Bicep compilé -> ARM OK, ressources: ['Microsoft.Storage/storageAccounts']`. Le `build` **valide** le template **sans compte** — c'est ton gate de CI côté Bicep (comme `fmt`/`validate` côté Terraform). En pipeline, l'étape suivante serait `az deployment group what-if` (aperçu, = `plan`) puis `az deployment group create` (= `apply`), derrière la même porte d'environnement. **Bicep** pour du Azure pur, **Terraform** pour du multi-cloud ou un état explicite.
:::

:::lang en
**✅ Check:** the output shows `Bicep compilé -> ARM OK, ressources: ['Microsoft.Storage/storageAccounts']`. `build` **validates** the template **without an account** — that's your CI gate on the Bicep side (like `fmt`/`validate` on the Terraform side). In a pipeline, the next step would be `az deployment group what-if` (preview, = `plan`) then `az deployment group create` (= `apply`), behind the same environment gate. **Bicep** for pure Azure, **Terraform** for multi-cloud or explicit state.
:::

### step-07

:::lang fr
**Objectif.** Comprendre le **multi-environnement** et l'**état distant**, puis **détruire**.

**🤔 Même code, plusieurs environnements.** On ne duplique pas le code pour `dev` et `prod` : on passe des **variables** (`-var`) et on isole l'**état** par environnement. En pipeline, l'état vit dans un **backend distant** (conteneur Blob) avec un **verrou** — deux exécutions ne s'écrasent pas. On note la configuration du backend, puis on **détruit** proprement le lab.

Note le backend distant, puis détruis :
:::

:::lang en
**Goal.** Understand **multi-environment** and **remote state**, then **destroy**.

**🤔 Same code, several environments.** We don't duplicate code for `dev` and `prod`: we pass **variables** (`-var`) and isolate **state** per environment. In a pipeline, state lives in a **remote backend** (Blob container) with a **lock** — two runs don't clobber each other. We note the backend configuration, then **destroy** the lab cleanly.

Note the remote backend, then destroy:
:::

```bash
# Exemple de backend distant (concept — à mettre dans providers.tf en vrai Azure)
cat <<'TF'
# terraform {
#   backend "azurerm" {
#     resource_group_name  = "rg-tfstate"
#     storage_account_name = "sttfstateprod"
#     container_name       = "tfstate"
#     key                  = "prod.terraform.tfstate"   # clé par environnement -> état isolé + verrou
#   }
# }
TF

# Multi-environnement : même code, variables différentes / same code, different variables
echo "dev  : terraform apply -var='env=dev'  (porte automatique / auto gate)"
echo "prod : terraform apply -var='env=prod' (porte = approbation / approval gate)"

# Détruire le lab / destroy the lab
terraform destroy -auto-approve -no-color 2>&1 | grep -E "Destroy complete|Resources:" | tail -1
```

:::lang fr
**✅ Vérification :** `terraform destroy` finit par `Destroy complete! Resources: 3 destroyed.` — le lab est nettoyé (groupe + VNet + le sous-réseau `snet-web` appliqué au step-03 ; `snet-app` du step-04 n'a été que **planifié**, jamais appliqué). Tu as vu le pattern complet : **backend distant** (état partagé + verrou, une **clé par environnement**), **même code** piloté par variables pour `dev`/`prod`, et **portes** différentes selon l'environnement. Tu sais maintenant **déployer de l'infra depuis une pipeline**, en toute sûreté. La suite du track AZ-400 : la **sécurité** (DevSecOps — secrets, scan) puis la **supervision** de la livraison.
:::

:::lang en
**✅ Check:** `terraform destroy` ends with `Destroy complete! Resources: 3 destroyed.` — the lab is cleaned (group + VNet + the `snet-web` subnet applied in step-03; `snet-app` from step-04 was only **planned**, never applied). You saw the full pattern: **remote backend** (shared state + lock, **one key per environment**), **same code** driven by variables for `dev`/`prod`, and different **gates** per environment. You can now **deploy infra from a pipeline**, safely. Next in the AZ-400 track: **security** (DevSecOps — secrets, scanning) then delivery **monitoring**.
:::

## pitfalls

:::lang fr
**1. `apply` sans `plan` revu.** Appliquer sans avoir vu le diff = surprises en prod. Toujours **Plan → revue → Apply**.

**2. Replanifier au moment de l'apply.** Si l'`apply` recalcule un plan, il peut **diverger** de celui approuvé. Sauvegarde le plan (`-out`) et applique **ce fichier** (`apply tfplan`).

**3. État local en équipe.** Un `terraform.tfstate` sur une machine = collisions et pertes. En pipeline, **backend distant + verrou** obligatoires.

**4. Identifiants en clair dans le YAML.** Les creds Azure vont dans les **secrets** de la plateforme (variables protégées / service connection), **jamais** dans le fichier versionné.

**5. `validate` sans `init`.** `validate` charge le provider : il faut un `init` avant (en CI, `init -backend=false` suffit pour valider sans toucher l'état).

**6. Pas de porte sur la prod.** Un `apply` prod automatique = risque maximal. Attache une **approbation** à l'environnement `production`.

**7. Détruire sans le vouloir.** Un `plan` montrant `X to destroy` inattendu doit **bloquer**. Lis toujours le résumé `Plan:` avant d'approuver.
:::

:::lang en
**1. `apply` without a reviewed `plan`.** Applying without seeing the diff = prod surprises. Always **Plan → review → Apply**.

**2. Re-planning at apply time.** If `apply` recomputes a plan, it can **diverge** from the approved one. Save the plan (`-out`) and apply **that file** (`apply tfplan`).

**3. Local state in a team.** A `terraform.tfstate` on one machine = collisions and losses. In a pipeline, **remote backend + lock** are mandatory.

**4. Credentials in clear text in the YAML.** Azure creds go in the platform's **secrets** (protected variables / service connection), **never** in the versioned file.

**5. `validate` without `init`.** `validate` loads the provider: you need an `init` first (in CI, `init -backend=false` is enough to validate without touching state).

**6. No gate on prod.** An automatic prod `apply` = maximum risk. Attach an **approval** to the `production` environment.

**7. Destroying unintentionally.** A `plan` showing an unexpected `X to destroy` must **block** you. Always read the `Plan:` summary before approving.
:::

## success

:::lang fr
Tu as réussi si :

- Tu passes `fmt -check` et `validate` comme **gates de CI** (échec tôt).
- Tu lis un **`plan`** comme un **dry-run** (résumé `Plan: X to add/change/destroy`).
- Tu **sauvegardes** un plan (`-out=tfplan`) et l'**appliques à l'identique** (`apply tfplan`).
- Tu as **appliqué** et **détruit** de l'infra pour de vrai (sur miniblue).
- Tu as une pipeline **Valider → Plan → Apply** avec **artefact** de plan et **porte** d'environnement.
- Tu sais faire l'équivalent en **Bicep** (`build`, `what-if`) et gérer **état distant** + **multi-environnement**.
:::

:::lang en
You've succeeded if:

- You run `fmt -check` and `validate` as **CI gates** (fail early).
- You read a **`plan`** as a **dry-run** (summary `Plan: X to add/change/destroy`).
- You **save** a plan (`-out=tfplan`) and **apply it identically** (`apply tfplan`).
- You **applied** and **destroyed** infra for real (on miniblue).
- You have a **Validate → Plan → Apply** pipeline with a plan **artifact** and an environment **gate**.
- You can do the **Bicep** equivalent (`build`, `what-if`) and handle **remote state** + **multi-environment**.
:::

## next

:::lang fr
- **Suivant :** *Azure — DevSecOps (AZ-400)* — sécuriser la pipeline : secrets, scan de dépendances et d'IaC, supply chain.
- **Réviser :** *Azure — pipelines CI/CD en profondeur (AZ-400)* pour les stages/artefacts/portes.
- **S'entraîner :** ajoute un stage `dev` **automatique** (sans porte) avant le stage `prod` **approuvé**, avec un état distant par environnement.
:::

:::lang en
- **Next:** *Azure — DevSecOps (AZ-400)* — secure the pipeline: secrets, dependency and IaC scanning, supply chain.
- **Review:** *Azure — CI/CD pipelines in depth (AZ-400)* for stages/artifacts/gates.
- **Practice:** add an **automatic** `dev` stage (no gate) before the **approved** `prod` stage, with remote state per environment.
:::

## cheatsheet

:::lang fr
**Le flux IaC (Terraform)**

```bash
terraform fmt -check -recursive .     # gate : formatage (échoue si mal formaté)
terraform init                        # charge le provider + backend
terraform validate                    # gate : syntaxe/cohérence
terraform plan -out=tfplan            # dry-run + fige le plan (artefact)
terraform show tfplan                 # relire le plan sauvegardé
terraform apply tfplan                # applique EXACTEMENT ce plan
terraform destroy -auto-approve       # tout détruire
```

**Contre miniblue (lab local)**

```bash
export SSL_CERT_FILE=$HOME/.miniblue/cert.pem
export ARM_ENVIRONMENT=public
# providers.tf : metadata_host="localhost:4567", skip_provider_registration=true, version ~> 3.0
```

**Équivalents Bicep**

```text
az bicep build --file X.bicep          # = fmt+validate (compile en ARM, offline)
az deployment group what-if ...        # = terraform plan (aperçu)
az deployment group create ...         # = terraform apply
# pas d'état à gérer : Azure Resource Manager le tient
```

**État distant (backend azurerm)**

```text
backend "azurerm" { storage_account_name, container_name, key="ENV.tfstate" }
# une clé par environnement -> état isolé + verrou automatique
```
:::

:::lang en
**The IaC flow (Terraform)**

```bash
terraform fmt -check -recursive .     # gate: formatting (fails if misformatted)
terraform init                        # loads provider + backend
terraform validate                    # gate: syntax/consistency
terraform plan -out=tfplan            # dry-run + freeze the plan (artifact)
terraform show tfplan                 # re-read the saved plan
terraform apply tfplan                # applies EXACTLY this plan
terraform destroy -auto-approve       # destroy everything
```

**Against miniblue (local lab)**

```bash
export SSL_CERT_FILE=$HOME/.miniblue/cert.pem
export ARM_ENVIRONMENT=public
# providers.tf: metadata_host="localhost:4567", skip_provider_registration=true, version ~> 3.0
```

**Bicep equivalents**

```text
az bicep build --file X.bicep          # = fmt+validate (compile to ARM, offline)
az deployment group what-if ...        # = terraform plan (preview)
az deployment group create ...         # = terraform apply
# no state to manage: Azure Resource Manager holds it
```

**Remote state (azurerm backend)**

```text
backend "azurerm" { storage_account_name, container_name, key="ENV.tfstate" }
# one key per environment -> isolated state + automatic lock
```
:::

## resources

:::lang fr
- **Terraform** : `plan -out`, `apply <plan>`, `validate`, backends distants et verrou — documentation HashiCorp.
- **Bicep** : `build`, `what-if`, `az deployment group create` — Microsoft Learn (AZ-400).
- **Azure Pipelines** : deployment jobs, environnements, approbations, artefacts de pipeline — docs Microsoft.
- **GitHub Actions** : `hashicorp/setup-terraform`, environments & required reviewers — docs GitHub.
- **miniblue** : émulateur Azure local (community, non officiel) — github.com/moabukar/miniblue.
:::

:::lang en
- **Terraform**: `plan -out`, `apply <plan>`, `validate`, remote backends and locking — HashiCorp docs.
- **Bicep**: `build`, `what-if`, `az deployment group create` — Microsoft Learn (AZ-400).
- **Azure Pipelines**: deployment jobs, environments, approvals, pipeline artifacts — Microsoft docs.
- **GitHub Actions**: `hashicorp/setup-terraform`, environments & required reviewers — GitHub docs.
- **miniblue**: local Azure emulator (community, unofficial) — github.com/moabukar/miniblue.
:::

## troubleshooting

:::lang fr
**`terraform plan/apply` : erreur TLS / certificat.** Il faut pointer sur le certificat de miniblue : `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem`. Vérifie aussi que miniblue tourne (port 4567).

**`validate` échoue : « provider not found ».** Lance `terraform init` d'abord. En CI pur validation, `terraform init -backend=false` évite de configurer le backend.

**`apply tfplan` : « saved plan is stale ».** Le réel a changé depuis le `plan`. C'est **voulu** : le plan figé refuse de s'appliquer sur un état différent (anti-dérive). Refais un `plan -out`, fais revoir, réapplique.

**`fmt -check` sort en erreur sans rien créer.** C'est le but : un fichier est mal formaté. Lance `terraform fmt` (sans `-check`) pour le corriger, puis recommence.

**Le backend azurerm ne marche pas en local.** Le backend distant vise du **vrai** Azure (compte de stockage). En local (ce guide), garde l'état **local** (`terraform.tfstate`) ; le backend distant est un **concept de pipeline**.

**L'apply ne demande pas d'approbation.** L'approbation s'attache à l'**environnement** côté plateforme (Azure DevOps → Environments → *production* → Approvals ; GitHub → Environments → required reviewers), pas au YAML. Le YAML **cible** l'environnement.
:::

:::lang en
**`terraform plan/apply`: TLS / certificate error.** You must point at miniblue's certificate: `export SSL_CERT_FILE=$HOME/.miniblue/cert.pem`. Also check miniblue is running (port 4567).

**`validate` fails: "provider not found".** Run `terraform init` first. In CI validation-only, `terraform init -backend=false` avoids configuring the backend.

**`apply tfplan`: "saved plan is stale".** Reality changed since the `plan`. That's **intended**: the frozen plan refuses to apply on a different state (anti-drift). Re-run `plan -out`, get it reviewed, re-apply.

**`fmt -check` exits with an error creating nothing.** That's the point: a file is misformatted. Run `terraform fmt` (without `-check`) to fix it, then retry.

**The azurerm backend doesn't work locally.** The remote backend targets **real** Azure (a storage account). Locally (this guide), keep state **local** (`terraform.tfstate`); the remote backend is a **pipeline concept**.

**The apply doesn't ask for approval.** The approval attaches to the **environment** on the platform side (Azure DevOps → Environments → *production* → Approvals; GitHub → Environments → required reviewers), not the YAML. The YAML **targets** the environment.
:::
