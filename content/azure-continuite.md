---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-continuite
slug: azure-continuite
order: 67
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — continuité d'activité (AZ-305) : HA, sauvegarde, reprise"
title_en: "Azure — business continuity (AZ-305): HA, backup, disaster recovery"
tagline_fr: "RTO/RPO, zones, sauvegarde, géo-réplication, reprise après sinistre."
tagline_en: "RTO/RPO, zones, backup, geo-replication, disaster recovery."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 240
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-architecture-well-architected]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [continuite-activite, rto-rpo, haute-disponibilite, zones-de-disponibilite, sauvegarde, coffre-recovery-services, geo-replication, reprise-apres-sinistre, az-305]
concepts_en: [business-continuity, rto-rpo, high-availability, availability-zones, backup, recovery-services-vault, geo-replication, disaster-recovery, az-305]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "La continuité d'activité Azure pour l'AZ-305 : concevoir la résilience. On définit RTO et RPO, on déploie un socle primaire (réseau + charges) sur miniblue, puis on conçoit les trois couches — haute disponibilité (zones vs groupes), sauvegarde (coffre Recovery Services + politique de rétention, en Bicep validé) et reprise après sinistre (stockage géo-redondant, géo-réplication SQL, Site Recovery multi-région). On grave la grille RTO/RPO → mécanisme. Sans compte ni facture."
og_description_en: "Azure business continuity for AZ-305: designing resilience. We define RTO and RPO, deploy a primary baseline (network + workloads) on miniblue, then design the three layers — high availability (zones vs sets), backup (Recovery Services Vault + retention policy, in validated Bicep) and disaster recovery (geo-redundant storage, SQL geo-replication, multi-region Site Recovery). We engrave the RTO/RPO → mechanism grid. No account or bill."
---

## intro

:::lang fr
« Et si le datacenter brûle ? Et si quelqu'un supprime la base par erreur ? Combien de temps pour se remettre, et combien de données perdues au pire ? » Ce sont les questions de la **continuité d'activité** (Business Continuity / Disaster Recovery), un domaine central de l'examen **AZ-305** et une responsabilité majeure de l'architecte. Une architecture qui marche « quand tout va bien » ne suffit pas : il faut concevoir pour **quand ça casse**.

Ce guide t'apprend à concevoir la **résilience**. On pose d'abord les deux mesures reines : **RTO** (Recovery Time Objective — en combien de temps on récupère) et **RPO** (Recovery Point Objective — combien de données on accepte de perdre). Puis on déploie un **socle primaire** (réseau + charges) sur miniblue, et on conçoit les **trois couches** de continuité : la **haute disponibilité** (zones de disponibilité vs groupes, dans une région), la **sauvegarde** (coffre **Recovery Services** + politique de rétention, décrits en **Bicep**), et la **reprise après sinistre** (stockage **géo-redondant**, **géo-réplication** SQL, **Site Recovery** multi-région). Enfin, on grave la grille **RTO/RPO → mécanisme**, cœur des questions d'examen.

C'est le troisième guide du track **AZ-305**. La résilience n'est pas une option qu'on ajoute à la fin — c'est une **décision de conception** qu'on prend selon les besoins (et le budget) du métier.

**Pour qui c'est :** tu as fait *architecture (WAF)* et tu veux concevoir la continuité.

**Quand ce n'est PAS le bon choix :**

- Tu débutes → fais l'*AZ-104* puis le guide *WAF* d'abord.
- Tu veux tester un vrai basculement de région → ça se fait sur un **vrai compte** (impossible en local) ; ici on **conçoit** et on **valide** la config.
:::

:::lang en
"What if the datacenter burns down? What if someone deletes the database by mistake? How long to recover, and how much data lost at worst?" These are the questions of **business continuity** (Business Continuity / Disaster Recovery), a core **AZ-305** exam domain and a major architect responsibility. An architecture that works "when all is well" isn't enough: you must design for **when it breaks**.

This guide teaches you to design **resilience**. We first set the two ruling measures: **RTO** (Recovery Time Objective — how fast you recover) and **RPO** (Recovery Point Objective — how much data you accept losing). Then we deploy a **primary baseline** (network + workloads) on miniblue, and design the **three layers** of continuity: **high availability** (availability zones vs sets, within a region), **backup** (**Recovery Services Vault** + retention policy, described in **Bicep**), and **disaster recovery** (**geo-redundant** storage, SQL **geo-replication**, multi-region **Site Recovery**). Finally, we engrave the **RTO/RPO → mechanism** grid, the heart of the exam questions.

This is the third guide of the **AZ-305** track. Resilience isn't an option you add at the end — it's a **design decision** you make by the business's needs (and budget).

**Who it's for:** you've done *architecture (WAF)* and want to design continuity.

**When it's NOT the right choice:**

- You're a beginner → do *AZ-104* then the *WAF* guide first.
- You want to test a real region failover → that's done on a **real account** (impossible locally); here we **design** and **validate** the config.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Définir et distinguer **RTO** et **RPO**.
- Concevoir la **haute disponibilité** (zones vs groupes, services zone-redondants).
- Concevoir la **sauvegarde** (coffre Recovery Services + rétention) en Bicep.
- Choisir la **redondance de stockage** (LRS/ZRS/GRS/RA-GRS) selon la continuité.
- Concevoir la **reprise après sinistre** (géo-réplication, Site Recovery, multi-région).
- Assurer la **continuité des bases** (géo-réplication SQL, Cosmos multi-région).
- Choisir le bon **mécanisme** selon RTO/RPO et le coût.
:::

:::lang en
By the end of this guide, you can:

- Define and distinguish **RTO** and **RPO**.
- Design **high availability** (zones vs sets, zone-redundant services).
- Design **backup** (Recovery Services Vault + retention) in Bicep.
- Choose the **storage redundancy** (LRS/ZRS/GRS/RA-GRS) by continuity need.
- Design **disaster recovery** (geo-replication, Site Recovery, multi-region).
- Ensure **database continuity** (SQL geo-replication, Cosmos multi-region).
- Choose the right **mechanism** by RTO/RPO and cost.
:::

## prerequisites

:::lang fr
- Le guide **Azure architecture (WAF)** terminé, et **miniblue** qui tourne.
- **Terraform** et **Bicep** installés ; `export SSL_CERT_FILE=~/.miniblue/cert.pem`.
- Rappel : le socle se déploie en live ; les mécanismes de **sauvegarde/DR** se conçoivent et **valident en Bicep** (un vrai basculement se teste sur un compte).
:::

:::lang en
- The **Azure architecture (WAF)** guide done, and **miniblue** running.
- **Terraform** and **Bicep** installed; `export SSL_CERT_FILE=~/.miniblue/cert.pem`.
- Reminder: the baseline deploys live; the **backup/DR** mechanisms are designed and **validated in Bicep** (a real failover is tested on an account).
:::

## concepts

:::lang fr
**RTO & RPO — les deux mesures reines.** Toute stratégie de continuité se chiffre par deux objectifs. Le **RTO (Recovery Time Objective)** : le **temps maximal** acceptable pour rétablir le service après une panne (« on doit être de retour en < 1 h »). Le **RPO (Recovery Point Objective)** : la **quantité maximale de données** qu'on accepte de perdre, mesurée en temps (« au pire, 5 min de données perdues »). Un RTO/RPO **bas** (proche de zéro) coûte **cher** ; un RTO/RPO **élevé** est **économique**. L'architecte fixe ces cibles **avec le métier**, puis choisit les mécanismes qui les tiennent.

**Trois couches de continuité.** On empile trois protections, du plus courant au plus grave :

- **Haute disponibilité (HA).** Survivre à une panne **locale** (matériel, maintenance) **dans une région**. Mécanismes : **zones de disponibilité** (datacenters séparés d'une région — le standard moderne), **groupes à haute disponibilité** (fault/update domains), services **zone-redondants** (stockage ZRS, bases avec réplicas de zone). RTO/RPO ~ zéro, automatique.
- **Sauvegarde (Backup).** Se remettre d'une **erreur** (suppression, corruption, rançongiciel) ou revenir dans le temps. Mécanisme : **Azure Backup** + un **coffre Recovery Services** avec une **politique** (fréquence, rétention). Le RPO = l'intervalle entre sauvegardes ; le RTO = le temps de restauration.
- **Reprise après sinistre (DR).** Survivre à la perte d'une **région entière**. Mécanismes : **stockage géo-redondant** (GRS/RA-GRS), **géo-réplication** des bases, **Azure Site Recovery** (répliquer et basculer des VM vers une région secondaire). RTO/RPO selon la config (de quelques minutes à quelques heures).

**Redondance de stockage & continuité.** Le choix de redondance d'un compte de stockage **est** une décision de continuité : **LRS** (1 datacenter — pas de protection régionale), **ZRS** (3 zones — HA intra-région), **GRS** (région distante, async — DR), **RA-GRS** (GRS + lecture sur la copie distante — DR avec lecture). Plus on protège loin, plus ça coûte.

**Continuité des bases.** **Azure SQL** : **géo-réplication active** (réplicas lisibles dans d'autres régions) et **groupes de basculement** (failover groups, bascule automatique). **Cosmos DB** : **multi-région** natif (ajouter une région = une case à cocher), écritures multi-maîtres possibles. Le RPO/RTO des bases est souvent **meilleur** que celui des VM.

**Ce qui est live ici.** Le **socle primaire** (réseau + charges) se déploie en live sur miniblue. Les **mécanismes de sauvegarde/DR** (coffre Recovery Services, politique, stockage RA-GRS) se **décrivent et valident en Bicep** — la forme exacte du vrai Azure. Un **vrai basculement** de région ne se teste que sur un compte (impossible sur l'émulateur) — mais la **conception**, elle, s'apprend et se valide ici.
:::

:::lang en
**RTO & RPO — the two ruling measures.** Every continuity strategy is quantified by two objectives. **RTO (Recovery Time Objective)**: the maximum acceptable **time** to restore service after an outage ("we must be back in < 1 h"). **RPO (Recovery Point Objective)**: the maximum **amount of data** you accept losing, measured in time ("at worst, 5 min of data lost"). A **low** RTO/RPO (near zero) is **expensive**; a **high** RTO/RPO is **economical**. The architect sets these targets **with the business**, then chooses the mechanisms that meet them.

**Three layers of continuity.** You stack three protections, from most common to most severe:

- **High availability (HA).** Survive a **local** failure (hardware, maintenance) **within a region**. Mechanisms: **availability zones** (separate datacenters in a region — the modern standard), **availability sets** (fault/update domains), **zone-redundant** services (ZRS storage, databases with zone replicas). RTO/RPO ~ zero, automatic.
- **Backup.** Recover from an **error** (deletion, corruption, ransomware) or go back in time. Mechanism: **Azure Backup** + a **Recovery Services Vault** with a **policy** (frequency, retention). The RPO = the interval between backups; the RTO = the restore time.
- **Disaster recovery (DR).** Survive the loss of an **entire region**. Mechanisms: **geo-redundant storage** (GRS/RA-GRS), database **geo-replication**, **Azure Site Recovery** (replicate and fail over VMs to a secondary region). RTO/RPO by config (minutes to hours).

**Storage redundancy & continuity.** A storage account's redundancy choice **is** a continuity decision: **LRS** (1 datacenter — no regional protection), **ZRS** (3 zones — intra-region HA), **GRS** (distant region, async — DR), **RA-GRS** (GRS + read on the distant copy — DR with read). The farther you protect, the more it costs.

**Database continuity.** **Azure SQL**: **active geo-replication** (readable replicas in other regions) and **failover groups** (automatic failover). **Cosmos DB**: native **multi-region** (adding a region = a checkbox), possible multi-master writes. Databases' RPO/RTO is often **better** than VMs'.

**What's live here.** The **primary baseline** (network + workloads) deploys live on miniblue. The **backup/DR mechanisms** (Recovery Services Vault, policy, RA-GRS storage) are **described and validated in Bicep** — the exact shape of real Azure. A **real** region failover is only tested on an account (impossible on the emulator) — but the **design** is learned and validated here.
:::

:::figure azure-continuite-couches
caption_fr: "Schéma 1. Les trois couches de continuité, réglées par RTO (temps de reprise) et RPO (données perdues) : HAUTE DISPONIBILITÉ (zones/groupes, panne locale, RTO/RPO~0) ; SAUVEGARDE (coffre Recovery Services + rétention, contre erreur/corruption) ; REPRISE APRÈS SINISTRE (géo-redondance, géo-réplication, Site Recovery, perte d'une région). Plus la cible RTO/RPO est basse, plus le coût monte."
caption_en: "Figure 1. The three continuity layers, tuned by RTO (recovery time) and RPO (data lost): HIGH AVAILABILITY (zones/sets, local failure, RTO/RPO~0); BACKUP (Recovery Services Vault + retention, against error/corruption); DISASTER RECOVERY (geo-redundancy, geo-replication, Site Recovery, region loss). The lower the RTO/RPO target, the higher the cost."
:::

## walkthrough

:::lang fr
On avance ainsi : RTO/RPO & stratégie → socle primaire (live) → haute disponibilité → sauvegarde (Bicep) → redondance & reprise → grille RTO/RPO → nettoyage.
:::

:::lang en
We'll go like this: RTO/RPO & strategy → primary baseline (live) → high availability → backup (Bicep) → redundancy & recovery → RTO/RPO grid → cleanup.
:::

### step-01

:::lang fr
**Objectif.** Poser **RTO** et **RPO** — la boussole de la continuité.

**🤔 Chiffrer le besoin.** Avant tout mécanisme, l'architecte demande au métier : « en cas de panne, combien de temps sans service tolérez-vous (**RTO**) ? Combien de données pouvez-vous perdre (**RPO**) ? ». Les réponses **pilotent** tous les choix (et le budget).

Grave les définitions et l'échelle coût :
:::

:::lang en
**Goal.** Set **RTO** and **RPO** — the compass of continuity.

**🤔 Quantify the need.** Before any mechanism, the architect asks the business: "on an outage, how much downtime can you tolerate (**RTO**)? How much data can you lose (**RPO**)?". The answers **drive** all the choices (and the budget).

Engrave the definitions and the cost scale:
:::

```text
RTO (Recovery Time Objective)  = temps MAX pour rétablir le service (downtime)
RPO (Recovery Point Objective) = données MAX perdues, en temps (dernier point sûr)

Exemple : RTO 1 h / RPO 15 min  -> de retour en 1 h, au pire 15 min de données perdues.

  RTO/RPO proche de ZÉRO  -> coûteux (redondance active, réplication synchrone)
  RTO/RPO élevé (heures)  -> économique (sauvegarde quotidienne, restauration)
=> l'architecte équilibre coût <-> RTO/RPO selon la criticité métier
```

:::lang fr
**✅ Vérification :** tu sais **définir** RTO (temps de reprise) et RPO (données perdues) et les **placer** sur un scénario. Réflexe : un **panier e-commerce** exige un RPO bas (ne pas perdre de commandes) ; un **blog** tolère un RPO d'un jour. C'est le métier qui fixe la cible ; l'architecte choisit le **mécanisme** qui la tient au **meilleur coût**. ⚠️ Erreur classique : viser « zéro perte, reprise instantanée » **partout** — c'est ruineux. On **module** par criticité : le critique en HA+DR, le reste en sauvegarde simple.
:::

:::lang en
**✅ Check:** you can **define** RTO (recovery time) and RPO (data lost) and **place** them on a scenario. Reflex: an **e-commerce cart** demands a low RPO (don't lose orders); a **blog** tolerates a one-day RPO. The business sets the target; the architect chooses the **mechanism** that meets it at the **best cost**. ⚠️ Classic mistake: aiming for "zero loss, instant recovery" **everywhere** — it's ruinous. You **modulate** by criticality: critical in HA+DR, the rest in simple backup.
:::

### step-02

:::lang fr
**Objectif.** Déployer le **socle primaire** — ce qu'on va protéger, en live.

**🤔 D'abord, la production.** On déploie une région « primaire » : un réseau et un compte de stockage. C'est le workload qu'on rendra résilient dans les étapes suivantes.

Déploie le socle (Terraform + azlocal) :
:::

:::lang en
**Goal.** Deploy the **primary baseline** — what we'll protect, live.

**🤔 First, production.** We deploy a "primary" region: a network and a storage account. It's the workload we'll make resilient in the next steps.

Deploy the baseline (Terraform + azlocal):
:::

D'abord crée les fichiers **`infra/main.tf`** (ci-dessous) et **`infra/providers.tf`** (le bloc provider `azurerm` → miniblue, à reprendre du guide *réseau*). **Ensuite** lance Terraform (l'apply crée le groupe, indispensable avant le compte de stockage).

```hcl
# infra/main.tf — socle primaire minimal
resource "azurerm_resource_group" "cont" {
  name     = "rg-continuite"
  location = "westeurope"
  tags     = { role = "primaire", env = "continuite" }
}
resource "azurerm_virtual_network" "primaire" {
  name                = "vnet-primaire"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.cont.location
  resource_group_name = azurerm_resource_group.cont.name
}
```

```bash
# 1) Réseau primaire (Terraform crée d'abord le groupe rg-continuite)
cd infra && export SSL_CERT_FILE=~/.miniblue/cert.pem && terraform init && terraform apply -auto-approve

# 2) Une charge à protéger, DANS le groupe créé / a workload to protect, IN the created group
azlocal storage account create --name stprimaire2026 --resource-group rg-continuite
```

:::lang fr
**✅ Vérification :** `terraform apply` déploie le groupe `rg-continuite` et le VNet primaire (`Apply complete!`), et `storage account create` ajoute une charge (`stprimaire2026`, `StorageV2`). Tu as une **région primaire** fonctionnelle — le point de départ. Retiens : la continuité se **conçoit sur** un workload réel ; les trois couches (HA, sauvegarde, DR) viennent **s'ajouter** dessus. ⚠️ En réel, on choisirait dès maintenant la **région** primaire (proximité, souveraineté) et sa **paire de régions** Azure (pour la DR — chaque région a une paire recommandée).
:::

:::lang en
**✅ Check:** `terraform apply` deploys the `rg-continuite` group and the primary VNet (`Apply complete!`), and `storage account create` adds a workload (`stprimaire2026`, `StorageV2`). You have a working **primary region** — the starting point. Remember: continuity is **designed onto** a real workload; the three layers (HA, backup, DR) come **added** on top. ⚠️ For real, you'd choose the primary **region** now (proximity, sovereignty) and its Azure **region pair** (for DR — each region has a recommended pair).
:::

### step-03

:::lang fr
**Objectif.** Concevoir la **haute disponibilité** — survivre à une panne locale.

**🤔 Ne pas dépendre d'un datacenter.** Dans une région, on répartit les ressources sur des **zones de disponibilité** (datacenters physiquement séparés) : si une zone tombe, les autres tiennent. C'est le standard moderne (mieux que les anciens *groupes à haute disponibilité*, limités à un datacenter). Beaucoup de services sont **zone-redondants** en un réglage.

Les mécanismes HA (concept + réglages) :
:::

:::lang en
**Goal.** Design **high availability** — survive a local failure.

**🤔 Don't depend on one datacenter.** Within a region, you spread resources across **availability zones** (physically separate datacenters): if a zone falls, the others hold. It's the modern standard (better than the old *availability sets*, limited to one datacenter). Many services are **zone-redundant** with one setting.

The HA mechanisms (concept + settings):
:::

```text
HAUTE DISPONIBILITÉ dans une région / HIGH AVAILABILITY within a region
  Zones de disponibilité   VM/ressources réparties sur 3 datacenters séparés (moderne, recommandé)
  Groupes à haute dispo    fault domains + update domains (1 datacenter ; legacy)
  Services zone-redondants stockage ZRS ; SQL/Cosmos avec réplicas de zone ; IP/LB standard zone-redundant
  Scale sets multi-zone    le troupeau de VM réparti sur les zones
=> HA = RTO/RPO proche de ZÉRO, automatique, dans UNE région (pas contre un sinistre régional)
```

:::lang fr
**✅ Vérification :** tu sais concevoir la HA : répartir sur **zones de disponibilité** (le réflexe moderne), activer les variantes **zone-redondantes** des services (stockage ZRS, LB/IP Standard, réplicas de base). Retiens la limite : la HA protège d'une panne **locale** (une zone), **pas** d'un **sinistre régional** — pour ça, il faut la **DR** (étapes 4-5). ⚠️ Distinction d'examen : **zones** (datacenters séparés, moderne) > **groupes à haute disponibilité** (un seul datacenter, fault/update domains, ancien). Préfère les **zones** quand la région les propose.
:::

:::lang en
**✅ Check:** you can design HA: spread across **availability zones** (the modern reflex), enable the **zone-redundant** variants of services (ZRS storage, Standard LB/IP, database zone replicas). Remember the limit: HA protects from a **local** failure (one zone), **not** a **regional disaster** — for that you need **DR** (steps 4-5). ⚠️ Exam distinction: **zones** (separate datacenters, modern) > **availability sets** (single datacenter, fault/update domains, legacy). Prefer **zones** when the region offers them.
:::

### step-04

:::lang fr
**Objectif.** Concevoir la **sauvegarde** — coffre Recovery Services + politique, en Bicep.

**🤔 Revenir dans le temps.** Contre une **erreur** (suppression, corruption, rançongiciel), la HA ne sert à rien (elle réplique l'erreur !). Il faut des **sauvegardes** : un **coffre Recovery Services** stocke des points de restauration selon une **politique** (fréquence → RPO ; rétention → jusqu'où revenir). On le décrit en Bicep.

Crée `sauvegarde.bicep` :
:::

:::lang en
**Goal.** Design **backup** — Recovery Services Vault + policy, in Bicep.

**🤔 Go back in time.** Against an **error** (deletion, corruption, ransomware), HA is useless (it replicates the error!). You need **backups**: a **Recovery Services Vault** stores restore points by a **policy** (frequency → RPO; retention → how far back). We describe it in Bicep.

Create `sauvegarde.bicep`:
:::

```bicep
// sauvegarde.bicep — coffre Recovery Services + politique de sauvegarde
param location string = resourceGroup().location

resource coffre 'Microsoft.RecoveryServices/vaults@2023-06-01' = {
  name: 'rsv-continuite'
  location: location
  sku: { name: 'RS0', tier: 'Standard' }
  properties: {}
}

resource politique 'Microsoft.RecoveryServices/vaults/backupPolicies@2023-06-01' = {
  parent: coffre
  name: 'politique-quotidienne'
  properties: {
    backupManagementType: 'AzureIaasVM'
    schedulePolicy: {
      schedulePolicyType: 'SimpleSchedulePolicy'
      scheduleRunFrequency: 'Daily'
      scheduleRunTimes: [ '2026-01-01T02:00:00Z' ]      // sauvegarde quotidienne à 02:00
    }
    retentionPolicy: {
      retentionPolicyType: 'LongTermRetentionPolicy'
      dailySchedule: {
        retentionTimes: [ '2026-01-01T02:00:00Z' ]
        retentionDuration: { count: 30, durationType: 'Days' }   // rétention 30 jours
      }
    }
  }
}
```

```bash
bicep build sauvegarde.bicep --stdout | head -n 20
```

:::lang fr
**✅ Vérification :** `bicep build` compile **deux** ressources — `vaults` (le coffre) et `backupPolicies` (la politique) — sans erreur. Ta sauvegarde : **quotidienne** (RPO ≈ 24 h — on peut perdre au plus une journée), **rétention 30 jours** (on peut revenir un mois en arrière). Analyse : la **fréquence** fixe le RPO, la **rétention** la profondeur historique. ⚠️ La sauvegarde répond à un besoin **différent** de la HA : elle protège de l'**erreur** et de la **corruption** (revenir en arrière), là où la HA protège de la **panne matérielle** (rester en ligne). Les deux sont **complémentaires**.
:::

:::lang en
**✅ Check:** `bicep build` compiles **two** resources — `vaults` (the vault) and `backupPolicies` (the policy) — with no error. Your backup: **daily** (RPO ≈ 24 h — you can lose at most a day), **30-day retention** (you can go back a month). Analysis: the **frequency** sets the RPO, the **retention** the historical depth. ⚠️ Backup meets a **different** need than HA: it protects from **error** and **corruption** (going back), where HA protects from **hardware failure** (staying online). The two are **complementary**.
:::

### step-05

:::lang fr
**Objectif.** Concevoir la **reprise après sinistre** — survivre à la perte d'une région.

**🤔 Le pire cas.** Si une **région entière** tombe (catastrophe), il faut basculer sur une **région secondaire**. Trois leviers : le **stockage géo-redondant** (GRS/RA-GRS, réplication vers la région paire), la **géo-réplication** des bases (SQL failover groups, Cosmos multi-région), et **Azure Site Recovery** (répliquer et basculer les VM). On décrit le stockage RA-GRS en Bicep.

Ajoute le stockage géo-redondant :
:::

:::lang en
**Goal.** Design **disaster recovery** — survive the loss of a region.

**🤔 The worst case.** If an **entire region** falls (catastrophe), you fail over to a **secondary region**. Three levers: **geo-redundant storage** (GRS/RA-GRS, replication to the paired region), database **geo-replication** (SQL failover groups, Cosmos multi-region), and **Azure Site Recovery** (replicate and fail over VMs). We describe RA-GRS storage in Bicep.

Add the geo-redundant storage:
:::

```bicep
// dr-stockage.bicep — stockage géo-redondant avec lecture (RA-GRS)
param location string = resourceGroup().location

resource stockageGeo 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'stgeo${uniqueString(resourceGroup().id)}'
  location: location
  sku: { name: 'Standard_RAGRS' }   // géo-redondant + lecture sur la copie distante
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}
```

```bash
bicep build dr-stockage.bicep --stdout | head -n 15
```

:::lang fr
**✅ Vérification :** `bicep build` compile le compte `Standard_RAGRS` sans erreur — un stockage **répliqué vers la région paire** avec **lecture** sur la copie distante. Tu as les trois leviers de DR : **stockage** (GRS/RA-GRS, ici), **bases** (géo-réplication SQL / Cosmos multi-région — un réglage), **VM** (Site Recovery — réplique et bascule). Analyse RTO/RPO : RA-GRS et géo-réplication SQL offrent un **RPO de quelques minutes** ; Site Recovery, un **RTO** de minutes à heures selon la config. ⚠️ La DR **coûte** (une seconde copie, une région secondaire) — on la réserve aux workloads dont le RTO/RPO l'exige. Un **vrai basculement** se **teste** régulièrement (un plan DR non testé n'existe pas).
:::

:::lang en
**✅ Check:** `bicep build` compiles the `Standard_RAGRS` account with no error — storage **replicated to the paired region** with **read** on the distant copy. You have the three DR levers: **storage** (GRS/RA-GRS, here), **databases** (SQL geo-replication / Cosmos multi-region — a setting), **VMs** (Site Recovery — replicate and fail over). RTO/RPO analysis: RA-GRS and SQL geo-replication offer an **RPO of minutes**; Site Recovery, an **RTO** of minutes to hours by config. ⚠️ DR **costs** (a second copy, a secondary region) — reserve it for workloads whose RTO/RPO demands it. A **real failover** is **tested** regularly (an untested DR plan doesn't exist).
:::

### step-06

:::lang fr
**Objectif.** Graver la grille **RTO/RPO → mécanisme** — le cœur de l'AZ-305.

**🤔 Du besoin au mécanisme.** L'examen te donne un RTO/RPO (et un budget) et attend le **bon mécanisme**. On mémorise la correspondance.

La grille :
:::

:::lang en
**Goal.** Engrave the **RTO/RPO → mechanism** grid — the AZ-305 core.

**🤔 From need to mechanism.** The exam gives you an RTO/RPO (and a budget) and expects the **right mechanism**. We memorize the mapping.

The grid:
:::

```text
BESOIN / NEED                                   -> MÉCANISME / MECHANISM
Panne locale, RTO/RPO~0, dans 1 région          -> zones de disponibilité / zone-redundant services
Erreur/corruption, revenir en arrière           -> Azure Backup + coffre Recovery Services (rétention)
Perte de région, RPO minutes                    -> stockage GRS/RA-GRS + géo-réplication SQL/Cosmos
Perte de région, basculer des VM                -> Azure Site Recovery (réplication + failover)
Base : lecture secondaire + bascule auto        -> SQL failover group / Cosmos multi-région

REDONDANCE STOCKAGE / STORAGE REDUNDANCY -> continuité
  LRS   1 datacenter            aucune protection régionale
  ZRS   3 zones (1 région)      HA intra-région
  GRS   région paire (async)    DR (sans lecture distante)
  RA-GRS GRS + lecture distante DR + lecture sur la copie secondaire
```

:::lang fr
**✅ Vérification :** face à un scénario, tu **choisis** : « base critique, perte < 5 min tolérée, bascule auto » → **SQL failover group** (géo-réplication) ; « protéger des VM d'un sinistre régional » → **Site Recovery** ; « pouvoir restaurer après une suppression » → **Azure Backup** ; « HA d'un site web dans une région » → **zones** + stockage **ZRS**. C'est **exactement** le format AZ-305. ⚠️ Justifie par le **RTO/RPO cible** et le **coût** — l'examen (et un client) veulent le compromis, pas juste le nom du service. Et rappelle-toi : **HA ≠ Backup ≠ DR** (panne locale ≠ erreur ≠ sinistre régional).
:::

:::lang en
**✅ Check:** faced with a scenario, you **choose**: "critical database, < 5 min loss tolerated, auto failover" → **SQL failover group** (geo-replication); "protect VMs from a regional disaster" → **Site Recovery**; "be able to restore after a deletion" → **Azure Backup**; "HA of a website in one region" → **zones** + **ZRS** storage. It's **exactly** the AZ-305 format. ⚠️ Justify by the **target RTO/RPO** and the **cost** — the exam (and a client) want the tradeoff, not just the service name. And remember: **HA ≠ Backup ≠ DR** (local failure ≠ error ≠ regional disaster).
:::

### step-07

:::lang fr
**Objectif.** Nettoyer.

**🤔 L'hygiène.** On supprime le socle primaire déployé en live.

Nettoie :
:::

:::lang en
**Goal.** Clean up.

**🤔 Hygiene.** We delete the live-deployed primary baseline.

Clean up:
:::

```bash
azlocal storage account delete --name stprimaire2026 --resource-group rg-continuite
cd infra && terraform destroy -auto-approve
```

:::lang fr
**✅ Vérification :** `storage account delete` renvoie `Deleted` et `terraform destroy` retire le socle réseau. Ton labo est rangé. Tu maîtrises maintenant la **continuité d'activité** au niveau AZ-305 : chiffrer avec **RTO/RPO**, empiler **HA** (zones), **sauvegarde** (coffre Recovery Services) et **DR** (géo-redondance, Site Recovery), et **choisir le mécanisme** par la grille. La suite du track : concevoir l'**infrastructure** (compute et réseau avancé), puis le **projet d'architecte**.
:::

:::lang en
**✅ Check:** `storage account delete` returns `Deleted` and `terraform destroy` removes the network baseline. Your lab is tidy. You now master **business continuity** at AZ-305 level: quantify with **RTO/RPO**, stack **HA** (zones), **backup** (Recovery Services Vault) and **DR** (geo-redundancy, Site Recovery), and **choose the mechanism** by the grid. The track continues: designing **infrastructure** (compute and advanced networking), then the **architect project**.
:::

## pitfalls

:::lang fr
**1. Confondre HA, sauvegarde et DR.** HA = panne locale (rester en ligne) ; sauvegarde = erreur/corruption (revenir en arrière) ; DR = sinistre régional (basculer ailleurs). Trois besoins, trois mécanismes.

**2. Croire que la HA protège de la suppression.** La HA **réplique** — y compris une suppression. Contre l'erreur, il faut la **sauvegarde**.

**3. Viser RTO/RPO zéro partout.** C'est ruineux. Module par **criticité** : le critique en HA+DR, le reste en sauvegarde.

**4. Confondre GRS et ZRS.** ZRS = zones d'**une** région (HA) ; GRS = **deux** régions (DR). Objectifs différents.

**5. Un plan DR non testé.** Un basculement jamais répété échoue le jour J. **Teste** régulièrement.

**6. Oublier la continuité des bases.** SQL failover groups et Cosmos multi-région offrent souvent un meilleur RPO que les VM — conçois-la explicitement.

**7. Choisir sans RTO/RPO.** Sans cible chiffrée, on ne peut pas justifier un mécanisme ni un coût. Commence **toujours** par RTO/RPO.
:::

:::lang en
**1. Confusing HA, backup and DR.** HA = local failure (stay online); backup = error/corruption (go back); DR = regional disaster (fail over elsewhere). Three needs, three mechanisms.

**2. Thinking HA protects from deletion.** HA **replicates** — including a deletion. Against error, you need **backup**.

**3. Aiming for zero RTO/RPO everywhere.** It's ruinous. Modulate by **criticality**: critical in HA+DR, the rest in backup.

**4. Confusing GRS and ZRS.** ZRS = zones of **one** region (HA); GRS = **two** regions (DR). Different goals.

**5. An untested DR plan.** A failover never rehearsed fails on the day. **Test** regularly.

**6. Forgetting database continuity.** SQL failover groups and Cosmos multi-region often offer a better RPO than VMs — design it explicitly.

**7. Choosing without RTO/RPO.** Without a quantified target, you can't justify a mechanism or a cost. **Always** start with RTO/RPO.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu définis **RTO** et **RPO** et les places sur un scénario.
- [ ] Tu déploies un **socle primaire** (live).
- [ ] Tu conçois la **HA** (zones vs groupes, services zone-redondants).
- [ ] Tu **valides** un coffre Recovery Services + politique en Bicep.
- [ ] Tu choisis la **redondance de stockage** (LRS/ZRS/GRS/RA-GRS) selon la continuité.
- [ ] Tu conçois la **DR** (géo-réplication, Site Recovery).
- [ ] Tu choisis le **mécanisme** par la grille RTO/RPO.

Sept cases = tu tiens la continuité d'activité AZ-305. La suite : l'**infrastructure**.
:::

:::lang en
You know it works when…

- [ ] You define **RTO** and **RPO** and place them on a scenario.
- [ ] You deploy a **primary baseline** (live).
- [ ] You design **HA** (zones vs sets, zone-redundant services).
- [ ] You **validate** a Recovery Services Vault + policy in Bicep.
- [ ] You choose the **storage redundancy** (LRS/ZRS/GRS/RA-GRS) by continuity.
- [ ] You design **DR** (geo-replication, Site Recovery).
- [ ] You choose the **mechanism** by the RTO/RPO grid.

Seven boxes = you hold AZ-305 business continuity. Next up: **infrastructure**.
:::

## next

:::lang fr
Le track AZ-305 continue :

1. **Azure — conception d'infrastructure** : compute (App Service, AKS, Functions), réseau avancé (Front Door, Application Gateway, équilibrage), migration.
2. Plus loin : le **projet d'architecte** (une solution Well-Architected complète) et l'examen AZ-305.
:::

:::lang en
The AZ-305 track continues:

1. **Azure — infrastructure design**: compute (App Service, AKS, Functions), advanced networking (Front Door, Application Gateway, load balancing), migration.
2. Further along: the **architect project** (a complete Well-Architected solution) and the AZ-305 exam.
:::

## cheatsheet

:::lang fr
Aide-mémoire continuité d'activité Azure.
:::

:::lang en
Azure business continuity cheat sheet.
:::

```bash
# Socle primaire (live) / primary baseline
cd infra && export SSL_CERT_FILE=~/.miniblue/cert.pem && terraform apply -auto-approve
azlocal storage account create --name stprimaire2026 --resource-group rg-continuite

# Sauvegarde & DR (Bicep, validé) / backup & DR
bicep build sauvegarde.bicep --stdout     # coffre Recovery Services + politique
bicep build dr-stockage.bicep --stdout    # stockage RA-GRS (géo-redondant + lecture)
```

```text
RTO = temps de reprise ; RPO = données perdues
HA (zones) = panne locale ~0 | Backup (coffre+rétention) = erreur/corruption | DR (géo/Site Recovery) = région perdue
Stockage : LRS(local) < ZRS(zones/HA) < GRS(région/DR) < RA-GRS(DR+lecture)
```

## resources

:::lang fr
- [Continuité d'activité & reprise](https://learn.microsoft.com/azure/reliability/business-continuity-management-program) — le programme BC/DR.
- [Zones de disponibilité](https://learn.microsoft.com/azure/reliability/availability-zones-overview) — la HA régionale.
- [Azure Backup](https://learn.microsoft.com/azure/backup/backup-overview) — coffres et politiques.
- [Azure Site Recovery](https://learn.microsoft.com/azure/site-recovery/site-recovery-overview) — la reprise multi-région.
- [Redondance du stockage](https://learn.microsoft.com/azure/storage/common/storage-redundancy) — LRS/ZRS/GRS/RA-GRS.
:::

:::lang en
- [Business continuity & recovery](https://learn.microsoft.com/azure/reliability/business-continuity-management-program) — the BC/DR program.
- [Availability zones](https://learn.microsoft.com/azure/reliability/availability-zones-overview) — regional HA.
- [Azure Backup](https://learn.microsoft.com/azure/backup/backup-overview) — vaults and policies.
- [Azure Site Recovery](https://learn.microsoft.com/azure/site-recovery/site-recovery-overview) — multi-region recovery.
- [Storage redundancy](https://learn.microsoft.com/azure/storage/common/storage-redundancy) — LRS/ZRS/GRS/RA-GRS.
:::

## troubleshooting

:::lang fr
**`bicep build sauvegarde.bicep` : erreur de schéma.** Vérifie la structure `schedulePolicy`/`retentionPolicy` et le `backupManagementType` (`AzureIaasVM` pour des VM) contre la doc `RecoveryServices/vaults/backupPolicies`.

**Quelle redondance de stockage ?** Pars du besoin : HA intra-région → **ZRS** ; survivre à un sinistre régional → **GRS** ; + lecture sur la copie distante → **RA-GRS** ; données jetables → **LRS**.

**HA ou DR ?** Panne d'un datacenter dans la région → **HA** (zones). Perte de toute la région → **DR** (géo/Site Recovery). Ce sont deux problèmes distincts.

**Mon RPO n'est pas tenu.** L'intervalle de sauvegarde est trop grand. Augmente la fréquence (ou passe à une réplication continue pour un RPO de minutes).

**`terraform apply` : erreur de certificat.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` avant Terraform.

**Puis-je tester un vrai basculement en local ?** Non : l'émulateur n'a pas de « seconde région ». On **conçoit** et **valide** ici ; le basculement réel se teste sur un compte (guide *passer en réel*).
:::

:::lang en
**`bicep build sauvegarde.bicep`: schema error.** Check the `schedulePolicy`/`retentionPolicy` structure and the `backupManagementType` (`AzureIaasVM` for VMs) against the `RecoveryServices/vaults/backupPolicies` docs.

**Which storage redundancy?** Start from the need: intra-region HA → **ZRS**; survive a regional disaster → **GRS**; + read on the distant copy → **RA-GRS**; throwaway data → **LRS**.

**HA or DR?** A datacenter failure in the region → **HA** (zones). Loss of the whole region → **DR** (geo/Site Recovery). Two distinct problems.

**My RPO isn't met.** The backup interval is too large. Increase the frequency (or move to continuous replication for a minutes RPO).

**`terraform apply`: certificate error.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` before Terraform.

**Can I test a real failover locally?** No: the emulator has no "second region". We **design** and **validate** here; the real failover is tested on an account (*going real* guide).
:::
