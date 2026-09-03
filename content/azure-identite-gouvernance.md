---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-identite-gouvernance
slug: azure-identite-gouvernance
order: 62
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — identité & gouvernance (AZ-104) : Entra ID, RBAC, policies"
title_en: "Azure — identity & governance (AZ-104): Entra ID, RBAC, policies"
tagline_fr: "identités, rôles, attributions, policies, tags, verrous."
tagline_en: "identities, roles, assignments, policies, tags, locks."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 240
repo: "moabukar/miniblue"
last_review: "2026-08-21"

# — Relations de parcours (par id) —
prerequisites: [azure-fondamentaux]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [entra-id, identites-manages, rbac, roles, attributions, moindre-privilege, azure-policy, tags, verrous, portees, az-104]
concepts_en: [entra-id, managed-identities, rbac, roles, assignments, least-privilege, azure-policy, tags, locks, scopes, az-104]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "L'identité et la gouvernance Azure pour l'AZ-104 : les identités (Entra ID — utilisateurs, groupes, principaux de service, identités managées, créées en local sur miniblue), le contrôle d'accès RBAC (principal → rôle → portée, rôles intégrés et personnalisés), Azure Policy (imposer des règles), les tags (organiser, gouverner par le coût) et les verrous. Modèle expliqué, RBAC/policy/rôle personnalisé décrits et validés en Bicep, identités et tags déployés en live. Sans compte ni facture."
og_description_en: "Azure identity and governance for AZ-104: identities (Entra ID — users, groups, service principals, managed identities, created locally on miniblue), RBAC access control (principal → role → scope, built-in and custom roles), Azure Policy (enforce rules), tags (organize, govern by cost) and locks. Model explained, RBAC/policy/custom-role described and validated in Bicep, identities and tags deployed live. No account or bill."
---

## intro

:::lang fr
Qui a le droit de faire quoi, où — et comment garder le contrôle quand des dizaines de ressources s'accumulent ? C'est **l'identité et la gouvernance**, le plus gros domaine de l'examen **AZ-104**, et la colonne vertébrale de la sécurité Azure. Une mauvaise attribution de rôle, et un compte a trop de pouvoir ; pas de gouvernance, et les ressources prolifèrent sans règle ni traçabilité de coût.

Ce guide couvre les quatre piliers : les **identités** (Entra ID — utilisateurs, groupes, principaux de service, et surtout les **identités managées** qu'on crée ici en local), le **contrôle d'accès RBAC** (le modèle **principal → rôle → portée**, les rôles **intégrés** et **personnalisés**, le **moindre privilège**), **Azure Policy** (imposer des règles à grande échelle — « toute ressource doit avoir un tag `env` »), et les **tags** & **verrous** (organiser, gouverner le coût, protéger). Tu crées une **identité managée** et poses des **tags en live** sur miniblue ; tu décris et **valides** RBAC, rôle personnalisé, policy et verrou en **Bicep** — la forme exacte du vrai Azure.

C'est le pilier « sécurité & conformité » du track AZ-104. Les concepts ici — RBAC vs Policy, portées et héritage, moindre privilège — reviennent dans **tous** les autres examens Azure (AZ-500 sécurité en tête).

**Pour qui c'est :** tu as fait *Azure fondamentaux* et tu veux comprendre le contrôle d'accès et la gouvernance.

**Quand ce n'est PAS le bon choix :**

- Ton labo n'est pas monté → refais *Azure fondamentaux* (miniblue).
- Tu veux la sécurité réseau (NSG, pare-feu) → c'est le guide *réseau* ; ici c'est l'**identité** et la **conformité**.
:::

:::lang en
Who is allowed to do what, where — and how do you keep control when dozens of resources pile up? That's **identity and governance**, the biggest **AZ-104** exam domain, and the backbone of Azure security. A bad role assignment, and an account has too much power; no governance, and resources proliferate with no rule or cost traceability.

This guide covers the four pillars: **identities** (Entra ID — users, groups, service principals, and above all the **managed identities** we create here locally), **RBAC access control** (the **principal → role → scope** model, **built-in** and **custom** roles, **least privilege**), **Azure Policy** (enforce rules at scale — "every resource must have an `env` tag"), and **tags** & **locks** (organize, govern cost, protect). You create a **managed identity** and set **tags live** on miniblue; you describe and **validate** RBAC, a custom role, policy and a lock in **Bicep** — the exact shape of real Azure.

This is the "security & compliance" pillar of the AZ-104 track. The concepts here — RBAC vs Policy, scopes and inheritance, least privilege — recur in **all** the other Azure exams (AZ-500 security foremost).

**Who it's for:** you've done *Azure fundamentals* and want to understand access control and governance.

**When it's NOT the right choice:**

- Your lab isn't set up → redo *Azure fundamentals* (miniblue).
- You want network security (NSG, firewall) → that's the *networking* guide; here it's **identity** and **compliance**.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Distinguer les **identités** Entra ID (utilisateurs, groupes, principaux de service, identités managées).
- Créer une **identité managée** en local (miniblue).
- Expliquer le modèle **RBAC** : principal → rôle → portée.
- Écrire une **attribution de rôle** (intégré) et un **rôle personnalisé** en Bicep.
- Appliquer le **moindre privilège**.
- Écrire une **policy** (imposer une règle) en Bicep, et la distinguer du RBAC.
- Utiliser **tags** (organiser, coût) et **verrous** (protéger).
- Comprendre les **portées** et l'**héritage** (MG → abonnement → groupe → ressource).
:::

:::lang en
By the end of this guide, you can:

- Distinguish Entra ID **identities** (users, groups, service principals, managed identities).
- Create a **managed identity** locally (miniblue).
- Explain the **RBAC** model: principal → role → scope.
- Write a **role assignment** (built-in) and a **custom role** in Bicep.
- Apply **least privilege**.
- Write a **policy** (enforce a rule) in Bicep, and distinguish it from RBAC.
- Use **tags** (organize, cost) and **locks** (protect).
- Understand **scopes** and **inheritance** (MG → subscription → group → resource).
:::

## prerequisites

:::lang fr
- Le guide **Azure fondamentaux** terminé, et **miniblue** qui tourne (`azlocal health`).
- **Terraform** (pour les tags live) et **Bicep** (pour RBAC/policy) installés.
- Rappel : `export SSL_CERT_FILE=~/.miniblue/cert.pem` pour que Terraform accepte l'endpoint local.
- ⚠️ Sur miniblue, RBAC (rôles/attributions), policies et verrous se **décrivent et valident** en Bicep (l'émulateur ne provisionne pas ces API — l'API des rôles renvoie 404). Les **identités managées** et les **tags** sont **live**.
:::

:::lang en
- The **Azure fundamentals** guide done, and **miniblue** running (`azlocal health`).
- **Terraform** (for live tags) and **Bicep** (for RBAC/policy) installed.
- Reminder: `export SSL_CERT_FILE=~/.miniblue/cert.pem` so Terraform accepts the local endpoint.
- ⚠️ On miniblue, RBAC (roles/assignments), policies and locks are **described and validated** in Bicep (the emulator doesn't provision these APIs — the roles API returns 404). **Managed identities** and **tags** are **live**.
:::

## concepts

:::lang fr
**Entra ID (ex-Azure AD).** L'annuaire d'identités d'Azure. Quatre types d'identités à connaître : les **utilisateurs** (des personnes), les **groupes** (des ensembles d'utilisateurs — on attribue les droits **au groupe**, pas un par un), les **principaux de service** (l'identité d'une **application**), et les **identités managées** (une identité Azure gérée automatiquement pour un service — **sans mot de passe à gérer**, le nec plus ultra). Un **tenant** (locataire) est une instance d'Entra ID (une organisation).

**RBAC (contrôle d'accès basé sur les rôles).** Le mécanisme d'autorisation d'Azure. Trois ingrédients dans une **attribution** : un **principal** (qui — utilisateur, groupe, principal de service, identité managée) + un **rôle** (quoi — un ensemble de permissions) + une **portée** (où — un abonnement, un groupe de ressources, une ressource). « Alice a le rôle **Contributeur** sur le **groupe rg-prod** ». Simple et puissant.

**Rôles intégrés vs personnalisés.** Azure fournit des **rôles intégrés** (built-in) prêts à l'emploi : **Propriétaire** (tout, y compris déléguer), **Contributeur** (tout gérer sauf déléguer les accès), **Lecteur** (lecture seule), et des centaines de rôles spécialisés (« Contributeur de stockage »…). Si aucun ne convient, on crée un **rôle personnalisé** avec **exactement** les permissions voulues.

**Moindre privilège.** La règle d'or : accorder le **strict minimum** de droits, à la **portée la plus étroite**, de préférence via des **groupes** et des **identités managées**. Jamais **Propriétaire** « par confort ». C'est le réflexe que testent l'AZ-104 et l'AZ-500.

**Azure Policy.** Différent du RBAC ! Le RBAC dit **qui peut faire** quoi ; la **Policy** dit **ce qui est autorisé** sur les ressources, quel que soit l'auteur. Une policy impose une règle : `deny` (interdire — « pas de VM hors d'Europe »), `audit` (signaler la non-conformité), `append`/`modify` (ajouter/corriger — « ajoute le tag `env` »). On l'**assigne** à une portée ; elle s'applique à **toutes** les ressources dessous.

**Tags.** Des paires **clé-valeur** sur les ressources (`env=prod`, `cost-center=marketing`). Ils **organisent**, permettent le **filtrage** et surtout la **répartition des coûts** (facturation par tag). Une policy peut les **rendre obligatoires**.

**Verrous (locks).** Pour **protéger** une ressource : **CanNotDelete** (on peut modifier, pas supprimer) ou **ReadOnly** (lecture seule). Contre la suppression accidentelle d'une ressource critique.

**Portées & héritage.** La hiérarchie **groupe d'administration → abonnement → groupe de ressources → ressource** est aussi celle des **portées**. Un rôle ou une policy assigné à un niveau **descend** (hérite) sur tout ce qui est en dessous. Assigner au bon niveau = gouverner efficacement.

**Ce qui est live ici.** Les **identités managées** (miniblue) et les **tags** (Terraform sur miniblue) sont **déployés en live**. Le **RBAC** (attribution, rôle personnalisé), les **policies** et les **verrous** se **décrivent et valident en Bicep** — l'émulateur n'implémente pas ces API (l'API des rôles renvoie 404). La syntaxe Bicep est celle du **vrai Azure**, à connaître pour l'examen ; le déploiement réel se fait sur un compte (guide *passer en réel*).
:::

:::lang en
**Entra ID (formerly Azure AD).** Azure's identity directory. Four identity types to know: **users** (people), **groups** (sets of users — you grant rights **to the group**, not one by one), **service principals** (an **application's** identity), and **managed identities** (an Azure identity managed automatically for a service — **no password to manage**, the gold standard). A **tenant** is an Entra ID instance (an organization).

**RBAC (role-based access control).** Azure's authorization mechanism. Three ingredients in an **assignment**: a **principal** (who — user, group, service principal, managed identity) + a **role** (what — a set of permissions) + a **scope** (where — a subscription, a resource group, a resource). "Alice has the **Contributor** role on the **rg-prod group**." Simple and powerful.

**Built-in vs custom roles.** Azure provides ready-made **built-in roles**: **Owner** (everything, including delegating), **Contributor** (manage everything except delegating access), **Reader** (read-only), and hundreds of specialized roles ("Storage Contributor"…). If none fits, you create a **custom role** with **exactly** the permissions you want.

**Least privilege.** The golden rule: grant the **bare minimum** rights, at the **narrowest scope**, preferably via **groups** and **managed identities**. Never **Owner** "for convenience". It's the reflex AZ-104 and AZ-500 test.

**Azure Policy.** Different from RBAC! RBAC says **who can do** what; **Policy** says **what is allowed** on resources, regardless of the author. A policy enforces a rule: `deny` (forbid — "no VM outside Europe"), `audit` (flag non-compliance), `append`/`modify` (add/fix — "add the `env` tag"). You **assign** it to a scope; it applies to **all** resources under it.

**Tags.** **Key-value** pairs on resources (`env=prod`, `cost-center=marketing`). They **organize**, enable **filtering** and above all **cost allocation** (billing by tag). A policy can make them **mandatory**.

**Locks.** To **protect** a resource: **CanNotDelete** (you can modify, not delete) or **ReadOnly** (read-only). Against accidental deletion of a critical resource.

**Scopes & inheritance.** The **management group → subscription → resource group → resource** hierarchy is also the **scope** hierarchy. A role or policy assigned at one level **flows down** (inherits) to everything below. Assigning at the right level = governing effectively.

**What's live here.** **Managed identities** (miniblue) and **tags** (Terraform on miniblue) are **deployed live**. **RBAC** (assignment, custom role), **policies** and **locks** are **described and validated in Bicep** — the emulator doesn't implement these APIs (the roles API returns 404). The Bicep syntax is real Azure's, to know for the exam; real deployment is on an account (*going real* guide).
:::

:::figure azure-rbac-modele
caption_fr: "Schéma 1. Le modèle RBAC : une ATTRIBUTION relie un PRINCIPAL (utilisateur, groupe, principal de service, identité managée) à un RÔLE (intégré ou personnalisé) sur une PORTÉE (groupe d'administration → abonnement → groupe de ressources → ressource), et l'accès HÉRITE vers le bas. En parallèle, une POLICY impose des règles sur les ressources d'une portée. Tags et verrous complètent la gouvernance."
caption_en: "Figure 1. The RBAC model: an ASSIGNMENT links a PRINCIPAL (user, group, service principal, managed identity) to a ROLE (built-in or custom) at a SCOPE (management group → subscription → resource group → resource), and access INHERITS downward. In parallel, a POLICY enforces rules on a scope's resources. Tags and locks complete governance."
:::

## walkthrough

:::lang fr
On avance ainsi : identité managée (live) → tags (live) → attribution de rôle (Bicep) → rôle personnalisé (Bicep) → policy (Bicep) → verrous & portées → nettoyage.
:::

:::lang en
We'll go like this: managed identity (live) → tags (live) → role assignment (Bicep) → custom role (Bicep) → policy (Bicep) → locks & scopes → cleanup.
:::

### step-01

:::lang fr
**Objectif.** Créer une **identité managée** — une identité sans mot de passe, live sur miniblue.

**🤔 L'identité idéale d'un workload.** Plutôt qu'une application porte un mot de passe (à protéger, faire tourner), on lui donne une **identité managée** : Azure gère les secrets pour elle. C'est **la** bonne pratique moderne (et un point d'examen). On en crée une en local.

Crée une identité managée dans un groupe :
:::

:::lang en
**Goal.** Create a **managed identity** — a password-less identity, live on miniblue.

**🤔 A workload's ideal identity.** Rather than an application carrying a password (to protect, rotate), you give it a **managed identity**: Azure manages the secrets for it. It's **the** modern best practice (and an exam point). We create one locally.

Create a managed identity in a group:
:::

```bash
# Groupe + identité managée (miniblue) / group + managed identity (miniblue)
azlocal group create --name rg-gouvernance --location westeurope
azlocal identity create --name id-app --resource-group rg-gouvernance

# La lister / list it
azlocal identity list --resource-group rg-gouvernance
```

:::lang fr
**✅ Vérification :** `identity create` renvoie un objet avec un `name` (`id-app`) et un `clientId` (un GUID) — c'est une **identité Entra ID** utilisable par un service, **sans mot de passe**. `identity list` la montre. Retiens les **4 types d'identités** : utilisateur (personne), groupe (ensemble), principal de service (appli avec secret/certificat), **identité managée** (appli sans secret à gérer — préférée). ⚠️ En réel, on **attribue** ensuite un rôle RBAC à cette identité (étape 3) pour lui donner des droits — l'identité seule ne peut **rien** tant qu'aucun rôle ne lui est attribué.
:::

:::lang en
**✅ Check:** `identity create` returns an object with a `name` (`id-app`) and a `clientId` (a GUID) — it's an **Entra ID identity** usable by a service, **password-less**. `identity list` shows it. Remember the **4 identity types**: user (person), group (set), service principal (app with secret/certificate), **managed identity** (app with no secret to manage — preferred). ⚠️ For real, you then **assign** an RBAC role to this identity (step 3) to give it rights — the identity alone can do **nothing** until a role is assigned to it.
:::

### step-02

:::lang fr
**Objectif.** Poser des **tags** de gouvernance — live sur miniblue (Terraform).

**🤔 Organiser et suivre le coût.** Un **tag** est une paire clé-valeur (`env=labo`, `cost-center=formation`). Il sert à **classer** les ressources et à **répartir les coûts** (facturation par tag). On applique des tags à un groupe de ressources via Terraform.

Décris un groupe avec des tags et applique :
:::

:::lang en
**Goal.** Set governance **tags** — live on miniblue (Terraform).

**🤔 Organize and track cost.** A **tag** is a key-value pair (`env=labo`, `cost-center=formation`). It classifies resources and **allocates costs** (billing by tag). We apply tags to a resource group via Terraform.

Describe a group with tags and apply:
:::

```hcl
# gouvernance.tf — un groupe avec des tags (provider azurerm -> miniblue, cf. guide réseau)
resource "azurerm_resource_group" "gouv" {
  name     = "rg-tags"
  location = "westeurope"
  tags = {
    env           = "labo"
    "cost-center" = "formation"
    owner         = "equipe-plateforme"
  }
}
```

```bash
export SSL_CERT_FILE=~/.miniblue/cert.pem
terraform init
terraform apply -auto-approve
terraform state show azurerm_resource_group.gouv   # voir les tags appliqués
```

:::lang fr
**✅ Vérification :** `terraform apply` crée `rg-tags` (`Apply complete! Resources: 1 added.`), et `terraform state show` affiche le bloc `tags` avec `env`, `cost-center`, `owner`. Les tags sont **appliqués en live** sur miniblue. Retiens leur double usage : **organisation** (filtrer « toutes les ressources `env=prod` ») et **coût** (ventiler la facture par `cost-center`). ⚠️ Les tags **ne s'héritent pas** automatiquement des ressources parentes vers les enfants (contrairement aux rôles/policies) — pour les imposer partout, on utilise une **policy** (étape 5).
:::

:::lang en
**✅ Check:** `terraform apply` creates `rg-tags` (`Apply complete! Resources: 1 added.`), and `terraform state show` displays the `tags` block with `env`, `cost-center`, `owner`. The tags are **applied live** on miniblue. Remember their dual use: **organization** (filter "all `env=prod` resources") and **cost** (break the bill down by `cost-center`). ⚠️ Tags do **not** auto-inherit from parent resources to children (unlike roles/policies) — to enforce them everywhere, you use a **policy** (step 5).
:::

### step-03

:::lang fr
**Objectif.** Écrire une **attribution de rôle** RBAC (rôle intégré) — en Bicep.

**🤔 Le cœur du contrôle d'accès.** Une **attribution** relie un **principal** à un **rôle** sur une **portée**. On attribue le rôle **intégré** `Lecteur` (Reader — lecture seule) à un principal, à la portée du groupe de ressources. On l'écrit en Bicep (validé hors-ligne).

Crée `rbac.bicep` :
:::

:::lang en
**Goal.** Write an RBAC **role assignment** (built-in role) — in Bicep.

**🤔 The heart of access control.** An **assignment** links a **principal** to a **role** at a **scope**. We assign the **built-in** `Reader` role (read-only) to a principal, at the resource-group scope. We write it in Bicep (validated offline).

Create `rbac.bicep`:
:::

```bicep
// rbac.bicep — attribution du rôle intégré Lecteur (Reader)
targetScope = 'resourceGroup'

@description('Id du principal (identité managée, groupe, utilisateur…)')
param principalId string

// Id du rôle intégré "Reader" (stable dans tout Azure)
var readerRoleId = 'acdd72a7-3385-48ef-bd42-f606fba81ae7'

resource attributionLecteur 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, principalId, readerRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', readerRoleId)
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}
```

```bash
bicep build rbac.bicep --stdout | head -n 20
```

:::lang fr
**✅ Vérification :** `bicep build` compile la ressource `Microsoft.Authorization/roleAssignments` sans erreur. Tu as décrit « ce principal a le rôle **Lecteur** sur ce groupe de ressources ». Analyse les trois ingrédients : **principalId** (qui), **roleDefinitionId** (quoi — l'id stable du rôle Reader), la **portée** (le `targetScope = 'resourceGroup'`, où). ⚠️ Le `name` d'une attribution est un **GUID déterministe** (`guid(...)`) — ainsi rejouer le déploiement ne crée pas de doublon (idempotence). ⚠️ **Note émulateur :** l'attribution se **valide** ici ; l'appliquer réellement demande un vrai compte (l'API des rôles renvoie 404 sur miniblue). La **logique** est celle du vrai Azure.
:::

:::lang en
**✅ Check:** `bicep build` compiles the `Microsoft.Authorization/roleAssignments` resource with no error. You described "this principal has the **Reader** role on this resource group". Analyze the three ingredients: **principalId** (who), **roleDefinitionId** (what — the Reader role's stable id), the **scope** (`targetScope = 'resourceGroup'`, where). ⚠️ An assignment's `name` is a **deterministic GUID** (`guid(...)`) — so re-running the deployment doesn't create a duplicate (idempotence). ⚠️ **Emulator note:** the assignment is **validated** here; actually applying it needs a real account (the roles API returns 404 on miniblue). The **logic** is real Azure's.
:::

### step-04

:::lang fr
**Objectif.** Créer un **rôle personnalisé** au moindre privilège — en Bicep.

**🤔 Exactement les bonnes permissions.** Quand aucun rôle intégré ne convient (trop large, trop étroit), on crée un **rôle personnalisé** : on liste les **actions** autorisées, on fixe les **portées assignables**. Ici, un rôle « lecture seule du stockage ».

Crée `role-perso.bicep` :
:::

:::lang en
**Goal.** Create a **custom role** at least privilege — in Bicep.

**🤔 Exactly the right permissions.** When no built-in role fits (too broad, too narrow), you create a **custom role**: you list the allowed **actions**, set the **assignable scopes**. Here, a "storage read-only" role.

Create `role-perso.bicep`:
:::

```bicep
// role-perso.bicep — un rôle personnalisé au moindre privilège
targetScope = 'resourceGroup'

resource roleLectureStockage 'Microsoft.Authorization/roleDefinitions@2022-04-01' = {
  name: guid(resourceGroup().id, 'LectureStockage')
  properties: {
    roleName: 'Lecture stockage (labo)'
    description: 'Lecture seule sur les ressources de stockage'
    type: 'CustomRole'
    permissions: [
      {
        actions: [
          'Microsoft.Storage/storageAccounts/read'
          'Microsoft.Storage/storageAccounts/blobServices/containers/read'
        ]
        notActions: []
      }
    ]
    assignableScopes: [
      resourceGroup().id
    ]
  }
}
```

```bash
bicep build role-perso.bicep --stdout | head -n 20
```

:::lang fr
**✅ Vérification :** `bicep build` compile la ressource `Microsoft.Authorization/roleDefinitions` sans erreur. Ton rôle n'autorise **que** deux actions de lecture du stockage — le **moindre privilège** incarné. Retiens la structure : `actions` (ce qui est permis), `notActions` (exclusions), `assignableScopes` (où le rôle peut être attribué). ⚠️ Un rôle personnalisé ne **donne** aucun droit tant qu'il n'est pas **attribué** (étape 3) à un principal. Rôle = définition des permissions ; attribution = application à quelqu'un. Deux objets distincts.
:::

:::lang en
**✅ Check:** `bicep build` compiles the `Microsoft.Authorization/roleDefinitions` resource with no error. Your role allows **only** two storage-read actions — **least privilege** embodied. Remember the structure: `actions` (what's allowed), `notActions` (exclusions), `assignableScopes` (where the role can be assigned). ⚠️ A custom role **grants** no rights until it's **assigned** (step 3) to a principal. Role = permission definition; assignment = applying it to someone. Two distinct objects.
:::

### step-05

:::lang fr
**Objectif.** Écrire une **policy** qui impose une règle — en Bicep (portée abonnement).

**🤔 RBAC vs Policy.** Le RBAC dit **qui peut** agir ; la **Policy** dit **ce qui est permis** sur les ressources. On impose : « toute ressource **doit** avoir un tag `env`, sinon on **refuse** la création ». C'est une policy de portée **abonnement** (`targetScope = 'subscription'`).

Crée `policy.bicep` :
:::

:::lang en
**Goal.** Write a **policy** that enforces a rule — in Bicep (subscription scope).

**🤔 RBAC vs Policy.** RBAC says **who can** act; **Policy** says **what is allowed** on resources. We enforce: "every resource **must** have an `env` tag, else creation is **denied**". It's a subscription-scoped policy (`targetScope = 'subscription'`).

Create `policy.bicep`:
:::

```bicep
// policy.bicep — imposer le tag env (deny sinon), portée abonnement
targetScope = 'subscription'

resource exigerTagEnv 'Microsoft.Authorization/policyDefinitions@2021-06-01' = {
  name: 'exiger-tag-env'
  properties: {
    displayName: 'Exiger le tag env'
    policyType: 'Custom'
    mode: 'Indexed'
    policyRule: {
      if: {
        field: 'tags[env]'
        exists: 'false'
      }
      then: {
        effect: 'deny'
      }
    }
  }
}

resource appliquerTagEnv 'Microsoft.Authorization/policyAssignments@2022-06-01' = {
  name: 'appliquer-tag-env'
  properties: {
    displayName: 'Appliquer : tag env obligatoire'
    policyDefinitionId: exigerTagEnv.id
  }
}
```

```bash
bicep build policy.bicep --stdout | head -n 20
```

:::lang fr
**✅ Vérification :** `bicep build` compile **deux** ressources — `policyDefinitions` (la règle) et `policyAssignments` (son application) — sans erreur. Ta policy **refuse** (`effect: deny`) toute ressource sans tag `env`. Retiens la distinction **définition** (la règle, réutilisable) vs **attribution** (l'application à une portée). Et surtout **RBAC ≠ Policy** : RBAC = **qui peut faire** ; Policy = **ce qui est autorisé**. ⚠️ Les `effect` courants : **deny** (bloque), **audit** (signale sans bloquer), **append/modify** (corrige — ex. ajoute le tag manquant). Une **policy définie à l'abonnement s'hérite** sur tous les groupes de ressources dessous.
:::

:::lang en
**✅ Check:** `bicep build` compiles **two** resources — `policyDefinitions` (the rule) and `policyAssignments` (its application) — with no error. Your policy **denies** (`effect: deny`) any resource without an `env` tag. Remember the distinction **definition** (the rule, reusable) vs **assignment** (applying it to a scope). And above all **RBAC ≠ Policy**: RBAC = **who can do**; Policy = **what is allowed**. ⚠️ Common `effect`s: **deny** (blocks), **audit** (flags without blocking), **append/modify** (fixes — e.g. adds the missing tag). A **policy defined at the subscription inherits** onto all resource groups below.
:::

### step-06

:::lang fr
**Objectif.** Poser un **verrou** et maîtriser les **portées** — protéger et gouverner.

**🤔 Protéger et situer.** Un **verrou** empêche une action dangereuse : `CanNotDelete` (modifiable, pas supprimable) ou `ReadOnly`. Et tout — rôles, policies — s'assigne à une **portée** dans la hiérarchie ; plus la portée est haute, plus l'effet est large (héritage).

La config du verrou (Bicep) et la grille des portées :
:::

:::lang en
**Goal.** Set a **lock** and master **scopes** — protect and govern.

**🤔 Protect and locate.** A **lock** prevents a dangerous action: `CanNotDelete` (modifiable, not deletable) or `ReadOnly`. And everything — roles, policies — is assigned to a **scope** in the hierarchy; the higher the scope, the broader the effect (inheritance).

The lock config (Bicep) and the scope grid:
:::

```bicep
// verrou.bicep — empêcher la suppression du groupe de ressources
targetScope = 'resourceGroup'

resource verrou 'Microsoft.Authorization/locks@2020-05-01' = {
  name: 'ne-pas-supprimer'
  properties: {
    level: 'CanNotDelete'
    notes: 'Groupe critique — suppression interdite'
  }
}
```

```text
PORTÉES / SCOPES (de la plus large à la plus étroite / broad -> narrow)
  Groupe d'administration   gouverne plusieurs abonnements (héritage max)
  Abonnement                unité de facturation ; rôles/policies larges
  Groupe de ressources      un cycle de vie applicatif
  Ressource                 une VM, un compte… (portée la plus fine)
  => un rôle/une policy à un niveau S'HÉRITE vers le bas
```

:::lang fr
**✅ Vérification :** `bicep build verrou.bicep` compile la ressource `Microsoft.Authorization/locks` sans erreur (verrou `CanNotDelete`). Tu sais **protéger** une ressource critique. Et tu maîtrises les **portées** : assigner un rôle à l'**abonnement** le fait hériter à **tous** les groupes dessous — pratique pour un accès large, dangereux si trop permissif. Règle d'or : **assigne à la portée la plus étroite** qui répond au besoin. ⚠️ Un verrou l'emporte même sur les **Propriétaires** : pour supprimer une ressource verrouillée, il faut d'abord **retirer le verrou**.
:::

:::lang en
**✅ Check:** `bicep build verrou.bicep` compiles the `Microsoft.Authorization/locks` resource with no error (a `CanNotDelete` lock). You know how to **protect** a critical resource. And you master **scopes**: assigning a role at the **subscription** makes it inherit to **all** groups below — handy for broad access, dangerous if too permissive. Golden rule: **assign at the narrowest scope** that meets the need. ⚠️ A lock overrides even **Owners**: to delete a locked resource, you must first **remove the lock**.
:::

### step-07

:::lang fr
**Objectif.** Nettoyer.

**🤔 L'hygiène.** On supprime les identités et groupes créés en live sur miniblue. Les artefacts Bicep (rôles, policies, verrous) n'ont pas été déployés — ils restaient à valider.

Nettoie :
:::

:::lang en
**Goal.** Clean up.

**🤔 Hygiene.** We delete the identities and groups created live on miniblue. The Bicep artifacts (roles, policies, locks) weren't deployed — they were to be validated.

Clean up:
:::

```bash
# Live (miniblue) : identité + groupes / identity + groups
azlocal identity delete --name id-app --resource-group rg-gouvernance
azlocal group delete --name rg-gouvernance

# Tags (Terraform) : détruire le groupe taggé / destroy the tagged group
terraform destroy -auto-approve
```

:::lang fr
**✅ Vérification :** `identity delete` et `group delete` renvoient `Deleted` ; `terraform destroy` retire `rg-tags`. Ton labo est rangé. Tu maîtrises maintenant l'identité et la gouvernance au niveau AZ-104 : les **identités** (dont les identités managées, live), le **RBAC** (principal → rôle → portée), le **rôle personnalisé** au moindre privilège, les **policies** (RBAC ≠ Policy), les **tags** et les **verrous**, et les **portées** avec héritage. La suite du track : le **projet d'entreprise** AZ-104 (une infra complète, déployée en live), puis **passer en réel** et l'examen.
:::

:::lang en
**✅ Check:** `identity delete` and `group delete` return `Deleted`; `terraform destroy` removes `rg-tags`. Your lab is tidy. You now master identity and governance at AZ-104 level: **identities** (including live managed identities), **RBAC** (principal → role → scope), the least-privilege **custom role**, **policies** (RBAC ≠ Policy), **tags** and **locks**, and **scopes** with inheritance. The track continues: the AZ-104 **enterprise project** (a full infra, deployed live), then **going real** and the exam.
:::

## pitfalls

:::lang fr
**1. Confondre RBAC et Policy.** RBAC = **qui peut faire** (autorisation d'un principal). Policy = **ce qui est autorisé** sur les ressources (conformité). Deux mécanismes complémentaires, pas interchangeables.

**2. Donner Propriétaire « par confort ».** C'est l'anti-moindre-privilège. Attribue le rôle **le plus étroit** (souvent Contributeur ou un rôle spécialisé), à la **portée la plus étroite**.

**3. Attribuer des rôles à des utilisateurs un par un.** Utilise des **groupes** : on gère l'appartenance, pas des dizaines d'attributions. Plus simple, plus sûr.

**4. Mot de passe pour un workload.** Préfère une **identité managée** — pas de secret à stocker ni à faire tourner.

**5. Oublier l'héritage des portées.** Un rôle à l'abonnement descend sur **tout**. Assigner trop haut = donner trop.

**6. Croire qu'un rôle personnalisé donne des droits.** Non : il faut l'**attribuer**. Définition ≠ attribution.

**7. Attendre que miniblue applique RBAC/policies.** L'émulateur ne les provisionne pas (API rôles 404). On les **valide** en Bicep ; on les **déploie** sur un vrai compte.
:::

:::lang en
**1. Confusing RBAC and Policy.** RBAC = **who can do** (a principal's authorization). Policy = **what is allowed** on resources (compliance). Two complementary mechanisms, not interchangeable.

**2. Granting Owner "for convenience".** It's the anti-least-privilege. Assign the **narrowest** role (often Contributor or a specialized role), at the **narrowest scope**.

**3. Assigning roles to users one by one.** Use **groups**: you manage membership, not dozens of assignments. Simpler, safer.

**4. A password for a workload.** Prefer a **managed identity** — no secret to store or rotate.

**5. Forgetting scope inheritance.** A role at the subscription flows down onto **everything**. Assigning too high = granting too much.

**6. Thinking a custom role grants rights.** No: you must **assign** it. Definition ≠ assignment.

**7. Expecting miniblue to enforce RBAC/policies.** The emulator doesn't provision them (roles API 404). You **validate** them in Bicep; you **deploy** them on a real account.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu cites les **4 types d'identités** et crées une **identité managée** (live).
- [ ] Tu poses des **tags** en live et expliques leur double usage.
- [ ] Tu écris une **attribution de rôle** (Bicep) : principal → rôle → portée.
- [ ] Tu écris un **rôle personnalisé** au moindre privilège (Bicep).
- [ ] Tu écris une **policy** (Bicep) et la distingues du RBAC.
- [ ] Tu décris un **verrou** et expliques les **portées** & l'héritage.
- [ ] Tu appliques le **moindre privilège**.

Sept cases = tu tiens l'identité & la gouvernance au niveau AZ-104. La suite : le **projet d'entreprise**.
:::

:::lang en
You know it works when…

- [ ] You name the **4 identity types** and create a **managed identity** (live).
- [ ] You set **tags** live and explain their dual use.
- [ ] You write a **role assignment** (Bicep): principal → role → scope.
- [ ] You write a **custom role** at least privilege (Bicep).
- [ ] You write a **policy** (Bicep) and distinguish it from RBAC.
- [ ] You describe a **lock** and explain **scopes** & inheritance.
- [ ] You apply **least privilege**.

Seven boxes = you hold identity & governance at AZ-104 level. Next up: the **enterprise project**.
:::

## next

:::lang fr
Le track AZ-104 continue :

1. **Azure — projet d'entreprise** : une infrastructure complète (réseau, stockage, calcul, identité, gouvernance) décrite en IaC et déployée en live contre miniblue — le livrable de CV.
2. Puis **passer en réel** (vrai compte, déploiement, garde-fous de coût) et la **certification AZ-104**.
:::

:::lang en
The AZ-104 track continues:

1. **Azure — enterprise project**: a complete infrastructure (networking, storage, compute, identity, governance) described in IaC and deployed live against miniblue — the CV deliverable.
2. Then **going real** (real account, deployment, cost guardrails) and the **AZ-104 certification**.
:::

## cheatsheet

:::lang fr
Aide-mémoire identité & gouvernance Azure.
:::

:::lang en
Azure identity & governance cheat sheet.
:::

```bash
# Live (miniblue) : identité managée + tags / managed identity + tags
azlocal identity create --name id-app --resource-group rg-gouvernance
azlocal identity list --resource-group rg-gouvernance
terraform apply -auto-approve      # groupe avec tags / group with tags

# IaC (Bicep, hors-ligne) / IaC (Bicep, offline)
bicep build rbac.bicep --stdout        # attribution de rôle (principal -> rôle -> portée)
bicep build role-perso.bicep --stdout  # rôle personnalisé (actions, assignableScopes)
bicep build policy.bicep --stdout      # policy (deny/audit) — portée abonnement
bicep build verrou.bicep --stdout      # verrou CanNotDelete / ReadOnly
```

```text
RBAC   = qui peut faire (principal + rôle + portée)
Policy = ce qui est autorisé (deny/audit/append) sur les ressources
Rôles  : Propriétaire > Contributeur > Lecteur (+ rôles spécialisés / personnalisés)
Portées: groupe d'administration > abonnement > groupe de ressources > ressource (héritage vers le bas)
```

## resources

:::lang fr
- [Microsoft Entra ID](https://learn.microsoft.com/entra/fundamentals/whatis) — identités, groupes, principaux.
- [RBAC Azure](https://learn.microsoft.com/azure/role-based-access-control/overview) — rôles, attributions, portées.
- [Rôles intégrés Azure](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles) — le catalogue.
- [Azure Policy](https://learn.microsoft.com/azure/governance/policy/overview) — imposer la conformité.
- [Verrous de ressources](https://learn.microsoft.com/azure/azure-resource-manager/management/lock-resources) — protéger de la suppression.
:::

:::lang en
- [Microsoft Entra ID](https://learn.microsoft.com/entra/fundamentals/whatis) — identities, groups, principals.
- [Azure RBAC](https://learn.microsoft.com/azure/role-based-access-control/overview) — roles, assignments, scopes.
- [Azure built-in roles](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles) — the catalog.
- [Azure Policy](https://learn.microsoft.com/azure/governance/policy/overview) — enforce compliance.
- [Resource locks](https://learn.microsoft.com/azure/azure-resource-manager/management/lock-resources) — protect from deletion.
:::

## troubleshooting

:::lang fr
**`azlocal identity create` : connexion refusée.** miniblue ne tourne pas. Lance `miniblue`, vérifie `azlocal health`.

**`bicep build rbac.bicep` : `principalId` manquant.** Le paramètre est requis ; passe-le au déploiement (`--parameters principalId=...`) ou donne-lui une valeur par défaut pour la simple compilation.

**`bicep build policy.bicep` : erreur de portée (BCP135).** Les `policyDefinitions` s'écrivent à la portée **abonnement** (`targetScope = 'subscription'`), pas groupe de ressources. Sépare-les des ressources de portée groupe.

**`terraform apply` (tags) : erreur de certificat.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` avant de lancer Terraform.

**Mon attribution/policy « ne fait rien » sur miniblue.** Normal : l'émulateur ne provisionne pas ces API (rôles 404). On les **valide** en Bicep ici ; l'effet réel est sur un vrai compte.

**Une suppression échoue à cause d'un verrou.** Retire d'abord le verrou (`CanNotDelete`) puis supprime. Le verrou l'emporte même sur les Propriétaires.
:::

:::lang en
**`azlocal identity create`: connection refused.** miniblue isn't running. Start `miniblue`, check `azlocal health`.

**`bicep build rbac.bicep`: missing `principalId`.** The param is required; pass it at deployment (`--parameters principalId=...`) or give it a default for plain compilation.

**`bicep build policy.bicep`: scope error (BCP135).** `policyDefinitions` are written at **subscription** scope (`targetScope = 'subscription'`), not resource group. Separate them from resource-group-scoped resources.

**`terraform apply` (tags): certificate error.** `export SSL_CERT_FILE=~/.miniblue/cert.pem` before running Terraform.

**My assignment/policy "does nothing" on miniblue.** Normal: the emulator doesn't provision these APIs (roles 404). We **validate** them in Bicep here; the real effect is on a real account.

**A deletion fails because of a lock.** Remove the lock (`CanNotDelete`) first, then delete. The lock overrides even Owners.
:::
