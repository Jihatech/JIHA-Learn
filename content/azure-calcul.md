---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-calcul
slug: azure-calcul
order: 61
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — calcul (AZ-104) : machines virtuelles, disques, mise à l'échelle"
title_en: "Azure — compute (AZ-104): virtual machines, disks, scaling"
tagline_fr: "VM live sur miniblue, IaC en Bicep, haute dispo & coût."
tagline_en: "live VM on miniblue, IaC in Bicep, high availability & cost."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 240
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-fondamentaux, azure-reseau]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [machine-virtuelle, tailles-vm, disques-manages, groupes-a-haute-disponibilite, zones-de-disponibilite, scale-set, autoscale, etats-alimentation-cout, bicep, az-104]
concepts_en: [virtual-machine, vm-sizes, managed-disks, availability-sets, availability-zones, scale-set, autoscale, power-states-cost, bicep, az-104]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le calcul Azure pour l'AZ-104, en local : crée une VRAIE machine virtuelle sur miniblue (adossée à un conteneur, état « running »), décris l'infrastructure complète en Bicep (VNet, carte réseau, disque, VM — validée hors-ligne), et un scale set avec autoscale. Disques managés, tailles de VM, groupes à haute disponibilité vs zones, et le point coût crucial (arrêté vs libéré) vus en concept. Sans compte ni facture."
og_description_en: "Azure compute for AZ-104, locally: create a REAL virtual machine on miniblue (container-backed, 'running' state), describe the full infrastructure in Bicep (VNet, NIC, disk, VM — validated offline), and a scale set with autoscale. Managed disks, VM sizes, availability sets vs zones, and the crucial cost point (stopped vs deallocated) seen as concept. No account or bill."
---

## intro

:::lang fr
Le **calcul** — les **machines virtuelles** en tête — est le cœur historique du cloud et un gros domaine de l'examen **AZ-104**. Une VM, c'est un serveur à la demande : tu choisis sa **taille** (CPU/RAM), son **image** (OS), ses **disques**, son **réseau**, et tu la fais tourner. L'administrateur doit savoir la **créer**, la **dimensionner**, la **rendre hautement disponible** et — crucial — **maîtriser son coût**.

Grâce à **miniblue**, tu vas créer une **vraie VM en local** : miniblue l'adosse à un **conteneur Docker** réel, avec un état `running`. Puis tu décriras l'**infrastructure complète** — réseau, carte réseau, disque, VM — en **Bicep** (validée hors-ligne), ainsi qu'un **scale set** avec **autoscale**. Les notions clés d'examen — **disques managés**, **tailles de VM**, **groupes à haute disponibilité vs zones**, et surtout le point **coût** (VM *arrêtée* vs *libérée*) — sont ancrées en concept.

C'est le troisième guide de profondeur du track **AZ-104**, après le réseau et le stockage. On y consolide l'idée que l'infrastructure se **décrit** (Bicep) autant qu'elle se **pilote** (CLI).

**Pour qui c'est :** tu as fait *Azure fondamentaux* et *réseau* (une VM vit dans un réseau) et tu veux le calcul en pratique.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas fait le **réseau** → fais-le d'abord (VNet, sous-réseau, NSG — une VM s'y branche).
- Tu cherches du **serverless** (Functions) ou des **conteneurs** managés → on les évoque, mais le cœur ici, c'est la **VM** (IaaS).
:::

:::lang en
**Compute** — **virtual machines** foremost — is the cloud's historical core and a big **AZ-104** exam domain. A VM is an on-demand server: you choose its **size** (CPU/RAM), its **image** (OS), its **disks**, its **network**, and run it. The administrator must know how to **create** it, **size** it, make it **highly available** and — crucially — **control its cost**.

Thanks to **miniblue**, you'll create a **real VM locally**: miniblue backs it with an actual **Docker container**, in a `running` state. Then you'll describe the **full infrastructure** — network, NIC, disk, VM — in **Bicep** (validated offline), plus a **scale set** with **autoscale**. The key exam notions — **managed disks**, **VM sizes**, **availability sets vs zones**, and above all the **cost** point (VM *stopped* vs *deallocated*) — are anchored in concept.

This is the third depth guide of the **AZ-104** track, after networking and storage. We consolidate the idea that infrastructure is **described** (Bicep) as much as **driven** (CLI).

**Who it's for:** you've done *Azure fundamentals* and *networking* (a VM lives in a network) and want compute in practice.

**When it's NOT the right choice:**

- You haven't done **networking** → do it first (VNet, subnet, NSG — a VM plugs into it).
- You want **serverless** (Functions) or managed **containers** → we mention them, but the core here is the **VM** (IaaS).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Créer une **machine virtuelle** en local (miniblue, adossée à un conteneur).
- Décrire l'**infrastructure d'une VM** en Bicep (VNet, NIC, disque, VM).
- Choisir une **taille de VM** (familles B/D/E/F…) selon le besoin.
- Choisir un **type de disque managé** (Standard HDD/SSD, Premium SSD, Ultra).
- Distinguer **groupes à haute disponibilité** et **zones de disponibilité**.
- Décrire un **scale set** avec **autoscale** (Bicep).
- Expliquer les **états d'alimentation** et leur **coût** (arrêtée vs libérée).
:::

:::lang en
By the end of this guide, you can:

- Create a **virtual machine** locally (miniblue, container-backed).
- Describe a **VM's infrastructure** in Bicep (VNet, NIC, disk, VM).
- Choose a **VM size** (B/D/E/F… families) by need.
- Choose a **managed disk type** (Standard HDD/SSD, Premium SSD, Ultra).
- Distinguish **availability sets** and **availability zones**.
- Describe a **scale set** with **autoscale** (Bicep).
- Explain the **power states** and their **cost** (stopped vs deallocated).
:::

## prerequisites

:::lang fr
- Les guides **Azure fondamentaux** et **Azure réseau** terminés.
- **miniblue** qui tourne (`azlocal health` répond). Pour que la VM s'adosse à un vrai conteneur, **Docker** doit être disponible au démarrage de miniblue (sinon la VM est modélisée sans conteneur — le reste marche).
- **Bicep** installé, et une **clé SSH** (`ssh-keygen -t rsa`) pour les templates de VM.
- Rappel : le calcul est du **plan de contrôle** (miniblue) ; on décrit l'IaC en **Bicep**.
:::

:::lang en
- The **Azure fundamentals** and **Azure networking** guides done.
- **miniblue** running (`azlocal health` answers). For the VM to back onto a real container, **Docker** must be available when miniblue starts (otherwise the VM is modeled without a container — the rest works).
- **Bicep** installed, and an **SSH key** (`ssh-keygen -t rsa`) for the VM templates.
- Reminder: compute is **control plane** (miniblue); we describe the IaC in **Bicep**.
:::

## concepts

:::lang fr
**Machine virtuelle (VM).** Un serveur à la demande. Ses ingrédients : une **taille** (combien de CPU/RAM, ex. `Standard_B1s`), une **image** (l'OS : Ubuntu, Windows Server…), un ou plusieurs **disques managés**, et une **carte réseau** (NIC) branchée à un sous-réseau. On la pilote (démarrer, arrêter, redimensionner) ou on la **décrit** en IaC.

**Tailles & familles de VM.** Les tailles sont groupées par **famille** selon l'usage : **B** (économique, « burstable » — dev/test), **D** (usage général), **E** (mémoire — bases de données), **F** (calcul — CPU intensif), **N** (GPU). Choisir la bonne famille/taille, c'est équilibrer **performance** et **coût**.

**Disques managés.** Azure gère le stockage du disque pour toi. Quatre types, du moins au plus performant : **Standard HDD** (économique, froid), **Standard SSD** (équilibré), **Premium SSD** (production, faible latence), **Ultra Disk** (charges extrêmes). Une VM a un **disque OS** et peut avoir des **disques de données**.

**Haute disponibilité.** Une VM **seule** n'a pas de SLA élevé. Deux mécanismes : les **groupes à haute disponibilité** (availability sets — répartissent les VMs sur des **domaines de panne** et de **mise à jour** dans un datacenter, contre les pannes matérielles et les maintenances) ; les **zones de disponibilité** (availability zones — répartissent les VMs sur des **datacenters séparés** d'une région, contre une panne de datacenter). Zones > sets en niveau de protection.

**Scale sets & autoscale.** Un **groupe identique** (Virtual Machine Scale Set) gère un **troupeau** de VMs identiques, et l'**autoscale** ajuste leur **nombre** selon une métrique (ex. « +1 VM si CPU > 75 % »). C'est l'**élasticité** : payer pour ce dont on a besoin, quand on en a besoin.

**États d'alimentation & coût (LE point d'examen).** Une VM peut être **en cours d'exécution** (Running — facturée), **arrêtée** (Stopped — le système est éteint mais la VM **occupe encore** son matériel : **toujours facturée**), ou **arrêtée (libérée)** (Stopped-Deallocated — le matériel est **rendu** : **plus de coût de calcul**, seuls les disques restent facturés). ⚠️ Pour **ne plus payer** le calcul, il faut **libérer** (deallocate), pas seulement « arrêter » depuis l'OS. Question d'examen classique.

**Autres options de calcul.** Au-delà de la VM (IaaS), Azure offre des **conteneurs** (Container Instances, Container Apps), le **serverless** (Functions) et le **PaaS web** (App Service). On choisit selon le besoin — la VM quand on veut le **contrôle total** de l'OS.
:::

:::lang en
**Virtual machine (VM).** An on-demand server. Its ingredients: a **size** (how much CPU/RAM, e.g. `Standard_B1s`), an **image** (the OS: Ubuntu, Windows Server…), one or more **managed disks**, and a **network card** (NIC) plugged into a subnet. You drive it (start, stop, resize) or **describe** it in IaC.

**VM sizes & families.** Sizes are grouped by **family** by use: **B** (economical, "burstable" — dev/test), **D** (general purpose), **E** (memory — databases), **F** (compute — CPU-intensive), **N** (GPU). Choosing the right family/size balances **performance** and **cost**.

**Managed disks.** Azure manages the disk storage for you. Four types, from least to most performant: **Standard HDD** (economical, cold), **Standard SSD** (balanced), **Premium SSD** (production, low latency), **Ultra Disk** (extreme workloads). A VM has an **OS disk** and can have **data disks**.

**High availability.** A **single** VM has no high SLA. Two mechanisms: **availability sets** (spread VMs across **fault domains** and **update domains** in a datacenter, against hardware failures and maintenance); **availability zones** (spread VMs across **separate datacenters** in a region, against a datacenter outage). Zones > sets in protection level.

**Scale sets & autoscale.** A **scale set** (Virtual Machine Scale Set) manages a **herd** of identical VMs, and **autoscale** adjusts their **number** by a metric (e.g. "+1 VM if CPU > 75%"). It's **elasticity**: pay for what you need, when you need it.

**Power states & cost (THE exam point).** A VM can be **running** (billed), **stopped** (the system is off but the VM **still holds** its hardware: **still billed**), or **stopped (deallocated)** (the hardware is **released**: **no more compute cost**, only the disks remain billed). ⚠️ To **stop paying** for compute, you must **deallocate**, not just "shut down" from the OS. Classic exam question.

**Other compute options.** Beyond the VM (IaaS), Azure offers **containers** (Container Instances, Container Apps), **serverless** (Functions) and web **PaaS** (App Service). You choose by need — the VM when you want **full control** of the OS.
:::

:::figure azure-calcul-vm
caption_fr: "Schéma 1. L'anatomie d'une VM : une taille (CPU/RAM) + une image (OS) + un disque OS managé (± disques de données) + une carte réseau branchée à un sous-réseau. Haute dispo : plusieurs VMs en groupe à haute disponibilité (domaines de panne/màj) ou en zones ; élasticité : un scale set + autoscale. Coût : Running et Stopped facturés ; seul Deallocated arrête le coût de calcul."
caption_en: "Figure 1. A VM's anatomy: a size (CPU/RAM) + an image (OS) + a managed OS disk (± data disks) + a NIC plugged into a subnet. High availability: several VMs in an availability set (fault/update domains) or in zones; elasticity: a scale set + autoscale. Cost: Running and Stopped are billed; only Deallocated stops the compute cost."
:::

## walkthrough

:::lang fr
On avance ainsi : créer une VM live → l'infrastructure VM en Bicep → disques & tailles → haute dispo & scale set → états & coût → choisir → nettoyage.
:::

:::lang en
We'll go like this: create a live VM → the VM infrastructure in Bicep → disks & sizes → high availability & scale set → states & cost → choose → cleanup.
:::

### step-01

:::lang fr
**Objectif.** Créer une **vraie VM** en local — adossée à un conteneur, live sur miniblue.

**🤔 Un serveur à la demande.** On crée un groupe de ressources, puis une VM avec une **taille** et une **image**. miniblue l'adosse à un **conteneur Docker** : elle est réellement `running`. On l'inspecte.

Crée et inspecte la VM :
:::

:::lang en
**Goal.** Create a **real VM** locally — container-backed, live on miniblue.

**🤔 An on-demand server.** We create a resource group, then a VM with a **size** and an **image**. miniblue backs it with a **Docker container**: it's really `running`. We inspect it.

Create and inspect the VM:
:::

```bash
# Groupe + VM (miniblue) / group + VM (miniblue)
azlocal group create --name rg-calcul --location westeurope
azlocal vm create --name vm-web --resource-group rg-calcul --image UbuntuLTS --size Standard_B1s

# Inspecter / inspect
azlocal vm show --name vm-web --resource-group rg-calcul
azlocal vm list --resource-group rg-calcul
```

:::lang fr
**✅ Vérification :** `vm create` renvoie un objet ARM `Microsoft.Compute/virtualMachines` avec `"provisioningState": "Succeeded"`, la taille `Standard_B1s`, et (si Docker est dispo) un bloc `miniblue` indiquant `"powerState": "running"` et un `containerName`. `vm show` confirme la VM et son état `running`. `vm list` la liste. Tu viens de créer une **VM qui tourne réellement** en local. ⚠️ La taille (`Standard_B1s`) fixe CPU/RAM ; l'image (`UbuntuLTS`) l'OS. En réel, il faut aussi un **réseau** (VNet/sous-réseau/NIC) — c'est ce qu'on décrit proprement en Bicep à l'étape suivante.
:::

:::lang en
**✅ Check:** `vm create` returns an ARM `Microsoft.Compute/virtualMachines` object with `"provisioningState": "Succeeded"`, the `Standard_B1s` size, and (if Docker is available) a `miniblue` block showing `"powerState": "running"` and a `containerName`. `vm show` confirms the VM and its `running` state. `vm list` lists it. You just created a **VM that really runs** locally. ⚠️ The size (`Standard_B1s`) sets CPU/RAM; the image (`UbuntuLTS`) the OS. For real, you also need a **network** (VNet/subnet/NIC) — which we describe cleanly in Bicep next.
:::

### step-02

:::lang fr
**Objectif.** Décrire l'**infrastructure complète d'une VM** en Bicep — validée hors-ligne.

**🤔 La VM ne vit pas seule.** Une VM réelle a besoin d'un **réseau virtuel**, d'un **sous-réseau**, d'une **carte réseau** et d'un **disque OS**. On décrit **tout** en Bicep, de façon reproductible, et on **valide** hors-ligne. C'est l'IaC d'une VM prête pour la production.

Crée `vm.bicep` puis compile-le :
:::

:::lang en
**Goal.** Describe a **VM's full infrastructure** in Bicep — validated offline.

**🤔 The VM doesn't live alone.** A real VM needs a **virtual network**, a **subnet**, a **NIC** and an **OS disk**. We describe **everything** in Bicep, reproducibly, and **validate** it offline. It's the IaC of a production-ready VM.

Create `vm.bicep` then compile it:
:::

```bicep
// vm.bicep — VNet + sous-réseau + NIC + disque OS + VM Linux
param location string = resourceGroup().location
param adminUsername string = 'azureadmin'
@secure()
param adminPublicKey string   // ta clé SSH publique (ssh-keygen -t rsa)

resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' = {
  name: 'vnet-app'
  location: location
  properties: {
    addressSpace: { addressPrefixes: [ '10.0.0.0/16' ] }
    subnets: [
      { name: 'snet-web', properties: { addressPrefix: '10.0.1.0/24' } }
    ]
  }
}

resource nic 'Microsoft.Network/networkInterfaces@2023-09-01' = {
  name: 'nic-web'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'ipcfg'
        properties: {
          subnet: { id: vnet.properties.subnets[0].id }
          privateIPAllocationMethod: 'Dynamic'
        }
      }
    ]
  }
}

resource vm 'Microsoft.Compute/virtualMachines@2023-09-01' = {
  name: 'vm-web'
  location: location
  properties: {
    hardwareProfile: { vmSize: 'Standard_B1s' }
    osProfile: {
      computerName: 'vm-web'
      adminUsername: adminUsername
      linuxConfiguration: {
        disablePasswordAuthentication: true
        ssh: {
          publicKeys: [
            { path: '/home/${adminUsername}/.ssh/authorized_keys', keyData: adminPublicKey }
          ]
        }
      }
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: '0001-com-ubuntu-server-jammy'
        sku: '22_04-lts'
        version: 'latest'
      }
      osDisk: {
        createOption: 'FromImage'
        managedDisk: { storageAccountType: 'Standard_LRS' }
      }
    }
    networkProfile: {
      networkInterfaces: [ { id: nic.id } ]
    }
  }
}
```

```bash
bicep build vm.bicep --stdout | head -n 25
```

:::lang fr
**✅ Vérification :** `bicep build` affiche l'ARM JSON compilé — **trois** ressources : `Microsoft.Network/virtualNetworks`, `Microsoft.Network/networkInterfaces`, `Microsoft.Compute/virtualMachines` — et **aucune erreur**. Tu as décrit une VM **complète et reproductible** (réseau, NIC, disque OS chiffré côté Azure, authentification par **clé SSH** et non par mot de passe — bonne pratique). ⚠️ **Note émulateur :** la **carte réseau** et la VM via le provider Terraform ne se **déploient pas** entièrement sur miniblue (l'API NIC renvoie 404) — mais la **création directe** de VM par `azlocal` marche (étape 1), et ce **Bicep valide la forme** exacte du vrai Azure. Le **déploiement réel** (`az deployment`) viendra au guide *passer en réel*.
:::

:::lang en
**✅ Check:** `bicep build` prints the compiled ARM JSON — **three** resources: `Microsoft.Network/virtualNetworks`, `Microsoft.Network/networkInterfaces`, `Microsoft.Compute/virtualMachines` — and **no error**. You described a **complete, reproducible** VM (network, NIC, OS disk, **SSH key** authentication rather than a password — good practice). ⚠️ **Emulator note:** the **NIC** and VM via the Terraform provider don't fully **deploy** on miniblue (the NIC API returns 404) — but **direct** VM creation via `azlocal` works (step 1), and this **Bicep validates the exact shape** of real Azure. **Real deployment** (`az deployment`) comes in the *going real* guide.
:::

### step-03

:::lang fr
**Objectif.** Choisir la **taille** de VM et le **type de disque** — la décision de dimensionnement.

**🤔 Équilibrer perf et coût.** Deux choix structurants : la **famille/taille** de VM (combien de CPU/RAM) et le **type de disque managé** (quelle vitesse). Trop petit = lenteur ; trop grand = gaspillage. L'examen te donne un profil de charge et attend le bon dimensionnement.

Les grilles à graver :
:::

:::lang en
**Goal.** Choose the VM **size** and the **disk type** — the sizing decision.

**🤔 Balance performance and cost.** Two structuring choices: the VM **family/size** (how much CPU/RAM) and the **managed disk type** (what speed). Too small = slow; too big = waste. The exam gives a load profile and expects the right sizing.

The grids to engrave:
:::

```text
FAMILLES DE VM / VM FAMILIES
  B   burstable, économique / dev-test, charges intermittentes
  D   usage général / general purpose (web, petites bases)
  E   optimisé mémoire / memory (bases de données, caches)
  F   optimisé calcul / compute (traitement CPU intensif)
  N   GPU (IA, rendu / AI, rendering)

DISQUES MANAGÉS / MANAGED DISKS (du - au + rapide/cher)
  Standard HDD   économique, froid / cheap, cold, sauvegardes
  Standard SSD   équilibré / balanced, prod légère
  Premium SSD    production, faible latence / low latency
  Ultra Disk     charges extrêmes / extreme IOPS (bases critiques)
```

:::lang fr
**✅ Vérification :** tu sais **dimensionner**. Serveur web léger → **B/D** + **Standard SSD** ; base de données en prod → **E** + **Premium SSD** ; batch CPU → **F** ; IA → **N** + Ultra si besoin. Retiens : dans `vm.bicep`, ces choix sont **deux lignes** — `hardwareProfile.vmSize` et `osDisk.managedDisk.storageAccountType`. Tu peux aussi **redimensionner** une VM existante (elle redémarre). ⚠️ Le **type de disque** se change VM éteinte ; certaines tailles exigent des disques Premium (`_s` dans le nom, ex. `Standard_D2s_v5`).
:::

:::lang en
**✅ Check:** you can **size**. Light web server → **B/D** + **Standard SSD**; production database → **E** + **Premium SSD**; CPU batch → **F**; AI → **N** + Ultra if needed. Remember: in `vm.bicep`, these choices are **two lines** — `hardwareProfile.vmSize` and `osDisk.managedDisk.storageAccountType`. You can also **resize** an existing VM (it reboots). ⚠️ The **disk type** is changed with the VM off; some sizes require Premium disks (`_s` in the name, e.g. `Standard_D2s_v5`).
:::

### step-04

:::lang fr
**Objectif.** Assurer la **haute disponibilité** et l'**élasticité** — groupes/zones + scale set.

**🤔 Ne pas dépendre d'une seule VM.** Pour survivre à une panne : répartir sur des **domaines de panne** (availability set) ou des **datacenters** (zones). Pour absorber la charge : un **scale set** qui ajoute/retire des VMs automatiquement (**autoscale**). On décrit un scale set avec autoscale en Bicep.

Crée `vmss.bicep` (extrait clé) et compile-le :
:::

:::lang en
**Goal.** Ensure **high availability** and **elasticity** — sets/zones + scale set.

**🤔 Don't depend on a single VM.** To survive a failure: spread across **fault domains** (availability set) or **datacenters** (zones). To absorb load: a **scale set** that adds/removes VMs automatically (**autoscale**). We describe a scale set with autoscale in Bicep.

Create `vmss.bicep` (key excerpt) and compile it:
:::

```bicep
// vmss.bicep — scale set + autoscale (complet)
param location string = resourceGroup().location
param adminUsername string = 'azureadmin'
@secure()
param adminPublicKey string

resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' = {
  name: 'vnet-vmss'
  location: location
  properties: {
    addressSpace: { addressPrefixes: [ '10.0.0.0/16' ] }
    subnets: [
      { name: 'snet-vmss', properties: { addressPrefix: '10.0.1.0/24' } }
    ]
  }
}

resource vmss 'Microsoft.Compute/virtualMachineScaleSets@2023-09-01' = {
  name: 'vmss-web'
  location: location
  sku: {
    name: 'Standard_B1s'
    tier: 'Standard'
    capacity: 2                 // 2 VMs au démarrage / 2 VMs to start
  }
  properties: {
    upgradePolicy: { mode: 'Automatic' }
    virtualMachineProfile: {
      osProfile: {
        computerNamePrefix: 'web'
        adminUsername: adminUsername
        linuxConfiguration: {
          disablePasswordAuthentication: true
          ssh: {
            publicKeys: [
              { path: '/home/${adminUsername}/.ssh/authorized_keys', keyData: adminPublicKey }
            ]
          }
        }
      }
      storageProfile: {
        imageReference: {
          publisher: 'Canonical'
          offer: '0001-com-ubuntu-server-jammy'
          sku: '22_04-lts'
          version: 'latest'
        }
        osDisk: {
          createOption: 'FromImage'
          managedDisk: { storageAccountType: 'Standard_LRS' }
        }
      }
      networkProfile: {
        networkInterfaceConfigurations: [
          {
            name: 'nic-vmss'
            properties: {
              primary: true
              ipConfigurations: [
                {
                  name: 'ipcfg'
                  properties: { subnet: { id: vnet.properties.subnets[0].id } }
                }
              ]
            }
          }
        ]
      }
    }
  }
}

resource autoscale 'Microsoft.Insights/autoscaleSettings@2022-10-01' = {
  name: 'autoscale-web'
  location: location
  properties: {
    targetResourceUri: vmss.id
    enabled: true
    profiles: [
      {
        name: 'cpu-based'
        capacity: { minimum: '2', maximum: '10', default: '2' }
        rules: [
          {
            metricTrigger: {
              metricName: 'Percentage CPU'
              metricResourceUri: vmss.id
              timeGrain: 'PT1M'
              statistic: 'Average'
              timeWindow: 'PT5M'
              timeAggregation: 'Average'
              operator: 'GreaterThan'
              threshold: 75
            }
            scaleAction: { direction: 'Increase', type: 'ChangeCount', value: '1', cooldown: 'PT5M' }
          }
        ]
      }
    ]
  }
}
```

```bash
bicep build vmss.bicep --stdout | head -n 20
```

:::lang fr
**✅ Vérification :** `bicep build` compile le scale set (`virtualMachineScaleSets`) **et** la règle d'autoscale (`autoscaleSettings`) sans erreur. Ta règle : démarrer à **2** VMs, ajouter **+1** quand le CPU dépasse **75 %**, jusqu'à **10**. C'est l'**élasticité** décrite en code. Retiens la distinction : **groupe à haute disponibilité** (fault/update domains, dans un datacenter) vs **zones** (datacenters séparés) vs **scale set** (nombre variable de VMs identiques). ⚠️ Availability set et zones protègent de la **panne** ; le scale set gère la **charge** — ce sont des réponses à des problèmes **différents** (souvent combinés).
:::

:::lang en
**✅ Check:** `bicep build` compiles the scale set (`virtualMachineScaleSets`) **and** the autoscale rule (`autoscaleSettings`) with no error. Your rule: start at **2** VMs, add **+1** when CPU exceeds **75%**, up to **10**. That's **elasticity** described in code. Remember the distinction: **availability set** (fault/update domains, in a datacenter) vs **zones** (separate datacenters) vs **scale set** (variable number of identical VMs). ⚠️ Availability sets and zones protect from **failure**; the scale set handles **load** — they answer **different** problems (often combined).
:::

### step-05

:::lang fr
**Objectif.** Comprendre les **états d'alimentation** et leur **coût** — le point d'examen crucial.

**🤔 « Arrêter » ne suffit pas.** Beaucoup croient qu'éteindre une VM stoppe la facture. Faux : une VM **arrêtée** (depuis l'OS) **occupe encore** son matériel réservé → **toujours facturée**. Pour **arrêter le coût de calcul**, il faut la **libérer** (deallocate) : Azure **rend** le matériel. Seuls les **disques** restent facturés.

Observe l'état de ta VM (miniblue) :
:::

:::lang en
**Goal.** Understand the **power states** and their **cost** — the crucial exam point.

**🤔 "Stopping" isn't enough.** Many think shutting a VM down stops the bill. Wrong: a **stopped** VM (from the OS) **still holds** its reserved hardware → **still billed**. To **stop the compute cost**, you must **deallocate** it: Azure **releases** the hardware. Only the **disks** remain billed.

Observe your VM's state (miniblue):
:::

```bash
# L'état de la VM — lis le champ properties.miniblue.powerState dans la sortie JSON
# the VM state — read the properties.miniblue.powerState field in the JSON output
azlocal vm show --name vm-web --resource-group rg-calcul
```

```text
ÉTATS & COÛT / STATES & COST
  Running                 en cours     -> facturé (calcul + disques)
  Stopped                 arrêté (OS)  -> ENCORE facturé (matériel réservé)
  Stopped (deallocated)   libéré       -> plus de coût de CALCUL (disques seuls facturés)
```

:::lang fr
**✅ Vérification :** dans la sortie de `vm show`, le champ `properties.miniblue.powerState` vaut `running` sur ta VM locale (⚠️ `azlocal` renvoie le **JSON complet** — il ne filtre pas via `--query` comme le vrai `az` ; repère le champ à l'œil ou avec un outil comme `jq`). Surtout, tu retiens la grille de **coût** : **Running** et **Stopped** sont **facturés** (le second occupe encore le matériel) ; seul **Stopped-Deallocated** arrête le coût de **calcul**. ⚠️ **Piège d'examen n°1 du domaine calcul :** pour cesser de payer une VM, **libère-la** (`deallocate`), ne te contente pas de l'« arrêter » depuis l'intérieur de l'OS. Sur un vrai compte, c'est la différence entre une facture nulle et une facture surprise. (Les transitions d'alimentation complètes se pilotent sur un vrai compte / miniblue avec Docker ; l'essentiel ici est le **modèle de coût**.)
:::

:::lang en
**✅ Check:** in the `vm show` output, the `properties.miniblue.powerState` field is `running` on your local VM (⚠️ `azlocal` returns the **full JSON** — it doesn't filter via `--query` like real `az`; spot the field by eye or with a tool like `jq`). Above all, you remember the **cost** grid: **Running** and **Stopped** are **billed** (the latter still holds the hardware); only **Stopped-Deallocated** stops the **compute** cost. ⚠️ **The compute domain's #1 exam trap:** to stop paying for a VM, **deallocate** it (`deallocate`), don't just "stop" it from inside the OS. On a real account, it's the difference between a zero bill and a surprise bill. (Full power transitions are driven on a real account / miniblue with Docker; the key here is the **cost model**.)
:::

### step-06

:::lang fr
**Objectif.** **Choisir** la bonne option de calcul — la décision d'architecte.

**🤔 La VM n'est pas toujours la réponse.** Pour un contrôle total de l'OS → **VM** (IaaS). Pour un conteneur ponctuel → **Container Instances** ; pour des microservices conteneurisés → **Container Apps** ; pour une appli web/API managée → **App Service** (PaaS) ; pour de l'événementiel → **Functions** (serverless). Moins tu gères l'infra, plus tu te concentres sur le code.

Récapitule la grille :
:::

:::lang en
**Goal.** **Choose** the right compute option — the architect's decision.

**🤔 The VM isn't always the answer.** For full OS control → **VM** (IaaS). For a one-off container → **Container Instances**; for containerized microservices → **Container Apps**; for a managed web app/API → **App Service** (PaaS); for event-driven → **Functions** (serverless). The less infra you manage, the more you focus on code.

Recap the grid:
:::

```text
OPTION                     QUAND / WHEN
  VM (IaaS)                contrôle total de l'OS, legacy, besoins spécifiques
  Scale set                même chose, mais élastique (nombre variable)
  Container Instances      un conteneur isolé, tâche ponctuelle
  Container Apps           microservices conteneurisés, scale-to-zero
  App Service (PaaS)       appli web / API managée, sans gérer l'OS
  Functions (serverless)   code déclenché par événement, payé à l'exécution
```

:::lang fr
**✅ Vérification :** tu sais **choisir**. « Migrer un vieux serveur Windows » → **VM** ; « site web scalable sans gérer l'OS » → **App Service** ou **scale set** ; « tâche batch conteneurisée » → **Container Instances** ; « traiter des messages » → **Functions**. C'est exactement le type d'arbitrage que l'AZ-104 (et l'AZ-305 architecte) attend. ⚠️ Règle : prends le service **le plus managé** qui répond au besoin — tu réduis la charge d'exploitation et souvent le coût.
:::

:::lang en
**✅ Check:** you can **choose**. "Migrate an old Windows server" → **VM**; "scalable website without managing the OS" → **App Service** or **scale set**; "containerized batch task" → **Container Instances**; "process messages" → **Functions**. It's exactly the kind of tradeoff AZ-104 (and AZ-305 architect) expects. ⚠️ Rule: take the **most managed** service that meets the need — you reduce operational load and often cost.
:::

### step-07

:::lang fr
**Objectif.** Nettoyer.

**🤔 L'hygiène.** On supprime la VM et son groupe de ressources. Réflexe **créer → utiliser → nettoyer**.

Nettoie :
:::

:::lang en
**Goal.** Clean up.

**🤔 Hygiene.** We delete the VM and its resource group. **Create → use → clean up** reflex.

Clean up:
:::

```bash
# Supprimer la VM, puis le groupe (et tout ce qu'il contient)
azlocal vm delete --name vm-web --resource-group rg-calcul
azlocal group delete --name rg-calcul
```

:::lang fr
**✅ Vérification :** `vm delete` renvoie `Deleted` (et libère le conteneur adossé), et `group delete` renvoie `Deleted` — le groupe et tout ce qu'il contenait partent ensemble. `azlocal vm list --resource-group rg-calcul` ne renverrait plus rien. Ton labo est rangé. Tu maîtrises désormais le calcul Azure au niveau AZ-104 : créer une VM, décrire son infra en Bicep, la dimensionner, la rendre hautement disponible et élastique, et surtout **maîtriser son coût**. La suite du track : l'**identité & la gouvernance** (Entra ID, RBAC, policies), puis le **projet d'entreprise** AZ-104.
:::

:::lang en
**✅ Check:** `vm delete` returns `Deleted` (and releases the backing container), and `group delete` returns `Deleted` — the group and everything it held go together. `azlocal vm list --resource-group rg-calcul` would return nothing anymore. Your lab is tidy. You now master Azure compute at AZ-104 level: create a VM, describe its infra in Bicep, size it, make it highly available and elastic, and above all **control its cost**. The track continues: **identity & governance** (Entra ID, RBAC, policies), then the AZ-104 **enterprise project**.
:::

## pitfalls

:::lang fr
**1. Croire qu'« arrêter » stoppe la facture.** Une VM arrêtée (OS) occupe encore le matériel → toujours facturée. **Libère** (deallocate) pour cesser le coût de calcul.

**2. Sur- ou sous-dimensionner.** Trop petit → lenteur ; trop grand → gaspillage. Choisis la **famille** (B/D/E/F/N) selon la charge, quitte à redimensionner ensuite.

**3. Une seule VM pour un service critique.** Pas de haute dispo. Utilise un **groupe à haute disponibilité**, des **zones**, ou un **scale set**.

**4. Confondre availability set, zones et scale set.** Set/zones = **résilience** (panne) ; scale set = **élasticité** (charge). Problèmes différents.

**5. Mot de passe au lieu de clé SSH (Linux).** Préfère l'**authentification par clé** (`disablePasswordAuthentication: true`) — plus sûr.

**6. Mauvais type de disque.** Base de données prod sur Standard HDD → lenteur. Premium SSD (ou Ultra) pour la faible latence ; HDD pour l'archivage.

**7. Attendre le déploiement Terraform complet d'une VM sur miniblue.** L'API carte réseau renvoie 404 sur l'émulateur. Crée la VM via **azlocal** (live) et **valide** l'infra en **Bicep** ; le déploiement réel se fait sur un compte.
:::

:::lang en
**1. Thinking "stop" ends the bill.** A stopped (OS) VM still holds the hardware → still billed. **Deallocate** to stop the compute cost.

**2. Over- or under-sizing.** Too small → slow; too big → waste. Choose the **family** (B/D/E/F/N) by load, resizing later if needed.

**3. A single VM for a critical service.** No high availability. Use an **availability set**, **zones**, or a **scale set**.

**4. Confusing availability set, zones and scale set.** Set/zones = **resilience** (failure); scale set = **elasticity** (load). Different problems.

**5. Password instead of SSH key (Linux).** Prefer **key authentication** (`disablePasswordAuthentication: true`) — safer.

**6. Wrong disk type.** A production database on Standard HDD → slow. Premium SSD (or Ultra) for low latency; HDD for archival.

**7. Expecting full Terraform VM deployment on miniblue.** The NIC API returns 404 on the emulator. Create the VM via **azlocal** (live) and **validate** the infra in **Bicep**; real deployment is on an account.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées une **VM** live (`azlocal vm create`) et la vois `running`.
- [ ] Tu **compiles** l'infra VM en Bicep (VNet + NIC + disque + VM).
- [ ] Tu choisis une **famille de VM** et un **type de disque** pour un scénario.
- [ ] Tu distingues **groupe à haute disponibilité**, **zones** et **scale set**.
- [ ] Tu **compiles** un scale set + autoscale en Bicep.
- [ ] Tu expliques le coût : **arrêtée** (facturée) vs **libérée** (calcul non facturé).
- [ ] Tu choisis VM / App Service / Container / Functions selon le besoin.

Sept cases = tu tiens le calcul Azure au niveau AZ-104. La suite : **identité & gouvernance**.
:::

:::lang en
You know it works when…

- [ ] You create a **VM** live (`azlocal vm create`) and see it `running`.
- [ ] You **compile** the VM infra in Bicep (VNet + NIC + disk + VM).
- [ ] You choose a **VM family** and a **disk type** for a scenario.
- [ ] You distinguish **availability set**, **zones** and **scale set**.
- [ ] You **compile** a scale set + autoscale in Bicep.
- [ ] You explain the cost: **stopped** (billed) vs **deallocated** (compute not billed).
- [ ] You choose VM / App Service / Container / Functions by need.

Seven boxes = you hold Azure compute at AZ-104 level. Next up: **identity & governance**.
:::

## next

:::lang fr
Le track AZ-104 continue :

1. **Azure — identité & gouvernance** : Entra ID (utilisateurs, groupes), RBAC (rôles, attributions), policies, tags, verrous — le contrôle d'accès et la conformité.
2. Plus loin : le **projet d'entreprise** AZ-104 (une infra complète déployée en live) et **passer en réel**.
:::

:::lang en
The AZ-104 track continues:

1. **Azure — identity & governance**: Entra ID (users, groups), RBAC (roles, assignments), policies, tags, locks — access control and compliance.
2. Further along: the AZ-104 **enterprise project** (a full infra deployed live) and **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire calcul Azure.
:::

:::lang en
Azure compute cheat sheet.
:::

```bash
# VM live (miniblue) / live VM (miniblue)
azlocal group create --name rg-calcul --location westeurope
azlocal vm create --name vm-web --resource-group rg-calcul --image UbuntuLTS --size Standard_B1s
azlocal vm show --name vm-web --resource-group rg-calcul   # champ properties.miniblue.powerState
azlocal vm list --resource-group rg-calcul
azlocal vm delete --name vm-web --resource-group rg-calcul

# IaC (Bicep, hors-ligne) / IaC (Bicep, offline)
bicep build vm.bicep --stdout          # VNet + NIC + disque + VM
bicep build vmss.bicep --stdout        # scale set + autoscale
```

```text
Tailles : B(éco) D(général) E(mémoire) F(calcul) N(GPU)
Disques : Standard HDD < Standard SSD < Premium SSD < Ultra
Coût    : Running/Stopped facturés ; seul Deallocated arrête le calcul
Haute dispo : availability set (fault/update domains) < zones ; scale set = élasticité
```

## resources

:::lang fr
- [Machines virtuelles Azure](https://learn.microsoft.com/azure/virtual-machines/overview) — tailles, images, cycle de vie.
- [Disques managés](https://learn.microsoft.com/azure/virtual-machines/managed-disks-overview) — types, performances.
- [Zones & groupes à haute disponibilité](https://learn.microsoft.com/azure/virtual-machines/availability) — la résilience.
- [Virtual Machine Scale Sets](https://learn.microsoft.com/azure/virtual-machine-scale-sets/overview) — élasticité, autoscale.
- [États et facturation d'une VM](https://learn.microsoft.com/azure/virtual-machines/states-billing) — arrêtée vs libérée.
:::

:::lang en
- [Azure virtual machines](https://learn.microsoft.com/azure/virtual-machines/overview) — sizes, images, lifecycle.
- [Managed disks](https://learn.microsoft.com/azure/virtual-machines/managed-disks-overview) — types, performance.
- [Zones & availability sets](https://learn.microsoft.com/azure/virtual-machines/availability) — resilience.
- [Virtual Machine Scale Sets](https://learn.microsoft.com/azure/virtual-machine-scale-sets/overview) — elasticity, autoscale.
- [VM states and billing](https://learn.microsoft.com/azure/virtual-machines/states-billing) — stopped vs deallocated.
:::

## troubleshooting

:::lang fr
**`azlocal vm create` : connexion refusée.** miniblue ne tourne pas. Lance `miniblue`, vérifie `azlocal health`.

**`azlocal vm stop/start` : `DockerUnavailable`.** Les transitions d'alimentation exigent le backend Docker : démarre Docker **puis** relance miniblue. La création/lecture/suppression de VM, elles, ne l'exigent pas.

**`bicep build vm.bicep` : erreur sur `adminPublicKey`.** Le paramètre `@secure()` doit recevoir une **vraie** clé SSH publique (`ssh-keygen -t rsa`, puis le contenu de `~/.ssh/id_rsa.pub`). Une chaîne factice est rejetée à la validation.

**`terraform apply` d'une VM échoue (NIC 404).** Attendu sur miniblue : l'API carte réseau n'est pas émulée. Utilise `azlocal vm` pour le live et Bicep pour valider l'IaC.

**Ma VM coûte alors que je l'ai « arrêtée ».** Tu l'as arrêtée depuis l'OS, pas **libérée**. Sur un vrai compte, `deallocate` la VM pour cesser le coût de calcul.

**Quelle taille choisir ?** Pars petit (B/D), mesure, puis redimensionne. Le redimensionnement redémarre la VM mais conserve les disques.
:::

:::lang en
**`azlocal vm create`: connection refused.** miniblue isn't running. Start `miniblue`, check `azlocal health`.

**`azlocal vm stop/start`: `DockerUnavailable`.** Power transitions require the Docker backend: start Docker **then** restart miniblue. VM create/read/delete don't require it.

**`bicep build vm.bicep`: error on `adminPublicKey`.** The `@secure()` param must receive a **real** SSH public key (`ssh-keygen -t rsa`, then the content of `~/.ssh/id_rsa.pub`). A dummy string is rejected at validation.

**`terraform apply` of a VM fails (NIC 404).** Expected on miniblue: the NIC API isn't emulated. Use `azlocal vm` for live and Bicep to validate the IaC.

**My VM costs money though I "stopped" it.** You stopped it from the OS, not **deallocated** it. On a real account, `deallocate` the VM to stop the compute cost.

**Which size to choose?** Start small (B/D), measure, then resize. Resizing reboots the VM but keeps the disks.
:::
