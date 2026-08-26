---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-securite-identite
slug: azure-securite-identite
order: 77
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — sécurité de l'identité (AZ-500) : RBAC, accès conditionnel, PIM"
title_en: "Azure — identity security (AZ-500): RBAC, conditional access, PIM"
tagline_fr: "moindre privilège, vérifier explicitement, élévation juste-à-temps."
tagline_en: "least privilege, verify explicitly, just-in-time elevation."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 260
repo: "Azure/bicep"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-securite-fondamentaux]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [identite, entra-id, rbac, moindre-privilege, identite-manageee, acces-conditionnel, pim, mfa, revue-acces, az-500]
concepts_en: [identity, entra-id, rbac, least-privilege, managed-identity, conditional-access, pim, mfa, access-review, az-500]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Sécuriser l'identité pour l'AZ-500, en local et pour de vrai : l'identité managée sans mot de passe (live sur miniblue, principalId réel), le RBAC au moindre privilège écrit et validé en Bicep (attribution du rôle intégré Key Vault Secrets User, portée minimale), un moteur d'accès conditionnel exécutable (vérifier explicitement : MFA pour les rôles privilégiés, emplacement approuvé, appareil conforme), le PIM juste-à-temps modélisé (éligible ≠ actif, activation avec MFA + justification, expiration), le flux Key Vault sans mot de passe, et une revue d'accès qui débusque le sur-privilège. Sans compte cloud.",
og_description_en: "Securing identity for AZ-500, locally and for real: passwordless managed identity (live on miniblue, real principalId), least-privilege RBAC written and validated in Bicep (assigning the built-in Key Vault Secrets User role, minimal scope), a runnable conditional-access engine (verify explicitly: MFA for privileged roles, approved location, compliant device), just-in-time PIM modeled (eligible ≠ active, activation with MFA + justification, expiry), the passwordless Key Vault flow, and an access review that surfaces over-privilege. No cloud account."
---

## intro

:::lang fr
« L'identité est le nouveau périmètre. » Dans le cloud, la première ligne de défense n'est plus le pare-feu réseau mais **qui** accède à **quoi**. L'**AZ-500** en fait un pilier majeur : **Entra ID**, **RBAC**, **accès conditionnel**, **PIM**. Ce guide te donne les réflexes du **moindre privilège** et du **Zero Trust** côté identité.

Fidèle à la méthode, on pratique **en local et pour de vrai** : on crée une **identité managée** sans mot de passe (live sur **miniblue**, avec un vrai **principalId**), on écrit et **valide** une attribution **RBAC** au **moindre privilège** en **Bicep** (le rôle intégré *Key Vault Secrets User*, sur une **portée minimale**). Puis on **exécute** un **moteur d'accès conditionnel** (vérifier explicitement : MFA pour les rôles privilégiés, emplacement approuvé, appareil conforme) et un modèle **PIM** juste-à-temps (**éligible ≠ actif**, activation avec MFA + justification, **expiration**). On relie le tout au **flux Key Vault sans mot de passe**, et on **débusque le sur-privilège** avec une **revue d'accès**.

**Pour qui c'est :** tu as les fondations de sécurité (guide précédent) et tu veux **maîtriser l'identité**.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas le modèle mental (CIA, Zero Trust) → fais *Azure — sécurité fondamentaux (AZ-500)*.
- Tu cherches l'identité **applicative** (OAuth, OIDC dans ton code) → ici c'est l'identité **de la plateforme**.
:::

:::lang en
"Identity is the new perimeter." In the cloud, the first line of defense is no longer the network firewall but **who** accesses **what**. **AZ-500** makes it a major pillar: **Entra ID**, **RBAC**, **conditional access**, **PIM**. This guide gives you the reflexes of **least privilege** and identity-side **Zero Trust**.

True to the method, we practice **locally and for real**: we create a passwordless **managed identity** (live on **miniblue**, with a real **principalId**), we write and **validate** a least-privilege **RBAC** assignment in **Bicep** (the built-in *Key Vault Secrets User* role, on a **minimal scope**). Then we **run** a **conditional-access engine** (verify explicitly: MFA for privileged roles, approved location, compliant device) and a just-in-time **PIM** model (**eligible ≠ active**, activation with MFA + justification, **expiry**). We tie it to the **passwordless Key Vault flow**, and **surface over-privilege** with an **access review**.

**Who it's for:** you have the security foundations (previous guide) and want to **master identity**.

**When it's NOT the right choice:**

- You lack the mental model (CIA, Zero Trust) → do *Azure — security fundamentals (AZ-500)*.
- You want **application** identity (OAuth, OIDC in your code) → here it's **platform** identity.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Créer une **identité managée** et expliquer l'authentification **sans mot de passe**.
- Écrire une attribution **RBAC** au **moindre privilège** (rôle + portée) et la **valider** en Bicep.
- Distinguer les **rôles intégrés** clés (Reader, Contributor, *Key Vault Secrets User*…).
- Concevoir un **accès conditionnel** (MFA, emplacement, appareil) et l'**exécuter**.
- Modéliser le **PIM** juste-à-temps (**éligible ≠ actif**, MFA, justification, expiration).
- Relier l'identité au **flux Key Vault sans mot de passe**.
- Mener une **revue d'accès** qui **débusque le sur-privilège**.
:::

:::lang en
By the end of this guide, you can:

- Create a **managed identity** and explain **passwordless** authentication.
- Write a least-privilege **RBAC** assignment (role + scope) and **validate** it in Bicep.
- Distinguish the key **built-in roles** (Reader, Contributor, *Key Vault Secrets User*…).
- Design a **conditional access** policy (MFA, location, device) and **run** it.
- Model **just-in-time PIM** (**eligible ≠ active**, MFA, justification, expiry).
- Tie identity to the **passwordless Key Vault flow**.
- Run an **access review** that **surfaces over-privilege**.
:::

## prerequisites

:::lang fr
- Le guide **Azure — sécurité fondamentaux (AZ-500)** (CIA, Zero Trust, ancres).
- Le **lab local** : **miniblue** démarré, `azlocal` sur le `PATH`, **Bicep CLI** (`az bicep install` ou binaire), **Python 3**.
- **Aucun compte cloud** : identité managée live, RBAC validé en Bicep, accès conditionnel/PIM exécutés en local.
:::

:::lang en
- The **Azure — security fundamentals (AZ-500)** guide (CIA, Zero Trust, anchors).
- The **local lab**: **miniblue** started, `azlocal` on `PATH`, **Bicep CLI** (`az bicep install` or binary), **Python 3**.
- **No cloud account**: managed identity live, RBAC validated in Bicep, conditional access/PIM run locally.
:::

## concepts

:::lang fr
**Entra ID : l'annuaire.** **Microsoft Entra ID** (ex-Azure AD) est l'**annuaire d'identités** d'Azure : utilisateurs, groupes, **principals de service** et **identités managées**. C'est **lui** qui authentifie ; **RBAC** décide ensuite **ce que** l'identité peut faire.

**Identité managée : sans mot de passe.** Une ressource Azure (app, VM, fonction) reçoit une **identité managée**. Elle obtient des **jetons** auprès d'Entra ID **automatiquement** — **aucun** secret stocké. Deux types : **assignée par le système** (liée au cycle de vie de la ressource) et **assignée par l'utilisateur** (autonome, réutilisable). C'est le pilier **machine** du Zero Trust.

**RBAC & moindre privilège.** Le **Role-Based Access Control** attribue un **rôle** à un **principal** (qui) sur une **portée** (où). La règle d'or : le **rôle minimal** sur la **portée minimale**. Anatomie d'une attribution : *principal* + *roleDefinitionId* (le rôle) + *scope* (abonnement / groupe de ressources / ressource). Quelques **rôles intégrés** : **Reader** (lecture seule), **Contributor** (gérer sans donner de droits), **Owner** (tout, y compris les droits — à réserver), **Key Vault Secrets User** (lire les secrets, rien d'autre). Préfère toujours un rôle **intégré étroit** à un rôle large.

**Accès conditionnel : vérifier explicitement.** Une politique d'**accès conditionnel** évalue **chaque** connexion selon des **signaux** — utilisateur, **MFA**, **emplacement**, **conformité de l'appareil**, risque — et **décide** : autoriser, exiger la MFA, ou bloquer. C'est l'application concrète du « vérifier explicitement » : on ne fait pas confiance au mot de passe seul.

**PIM : le juste-à-temps.** Le **Privileged Identity Management** applique le moindre privilège **dans le temps**. Un admin n'est pas **Owner en permanence** : il est **éligible**, et **active** le rôle **quand il en a besoin**, pour une **durée limitée**, avec **MFA** et **justification** (souvent une **approbation**). Passé le délai, le rôle **expire**. On réduit la fenêtre d'attaque : un compte compromis n'a pas de droits privilégiés **actifs** en permanence.

**Revue d'accès : lutter contre l'accumulation.** Les droits **s'accumulent** (projets, remplacements, oublis). Une **revue d'accès** périodique **réexamine** qui a quoi et **retire** l'inutile. Sans elle, le principe du moindre privilège **dérive** avec le temps.

**Ce qui est live ici.** L'**identité managée** se **crée** (live, `principalId` réel). L'**attribution RBAC** s'écrit et se **compile en ARM** avec **Bicep** (validation offline ; l'exécution vise du vrai Azure — miniblue renvoie 404 sur les attributions). L'**accès conditionnel** et le **PIM** sont des **moteurs exécutables** en Python — de **vraies** décisions, pas des slides. Le **Key Vault** sert de cible concrète (live). Tout s'apprend **sans compte cloud**.
:::

:::lang en
**Entra ID: the directory.** **Microsoft Entra ID** (formerly Azure AD) is Azure's **identity directory**: users, groups, **service principals** and **managed identities**. **It** authenticates; **RBAC** then decides **what** the identity can do.

**Managed identity: passwordless.** An Azure resource (app, VM, function) gets a **managed identity**. It obtains **tokens** from Entra ID **automatically** — **no** stored secret. Two types: **system-assigned** (tied to the resource's lifecycle) and **user-assigned** (standalone, reusable). It's the **machine** pillar of Zero Trust.

**RBAC & least privilege.** **Role-Based Access Control** assigns a **role** to a **principal** (who) over a **scope** (where). The golden rule: the **minimal role** on the **minimal scope**. Anatomy of an assignment: *principal* + *roleDefinitionId* (the role) + *scope* (subscription / resource group / resource). A few **built-in roles**: **Reader** (read-only), **Contributor** (manage without granting rights), **Owner** (everything, including rights — reserve it), **Key Vault Secrets User** (read secrets, nothing else). Always prefer a **narrow built-in** role over a broad one.

**Conditional access: verify explicitly.** A **conditional access** policy evaluates **every** sign-in against **signals** — user, **MFA**, **location**, **device compliance**, risk — and **decides**: allow, require MFA, or block. It's the concrete application of "verify explicitly": you don't trust the password alone.

**PIM: just-in-time.** **Privileged Identity Management** applies least privilege **over time**. An admin isn't **Owner permanently**: they're **eligible**, and **activate** the role **when needed**, for a **limited duration**, with **MFA** and **justification** (often an **approval**). After the window, the role **expires**. You shrink the attack surface: a compromised account has no **active** privileged rights permanently.

**Access review: fighting accumulation.** Rights **accumulate** (projects, cover, oversights). A periodic **access review** **re-examines** who has what and **removes** the unneeded. Without it, least privilege **drifts** over time.

**What's live here.** The **managed identity** is **created** (live, real `principalId`). The **RBAC assignment** is written and **compiled to ARM** with **Bicep** (offline validation; execution targets real Azure — miniblue returns 404 on assignments). **Conditional access** and **PIM** are **runnable engines** in Python — **real** decisions, not slides. The **Key Vault** is a concrete target (live). It all learns **without a cloud account**.
:::

:::figure azure-securite-identite-flux
caption_fr: "Schéma 1. L'identité au moindre privilège : une IDENTITÉ MANAGÉE (sans mot de passe) demande un jeton à ENTRA ID. L'ACCÈS CONDITIONNEL vérifie explicitement (MFA, emplacement, appareil) → autorise/bloque. Le RBAC accorde le rôle MINIMAL (Key Vault Secrets User) sur la portée MINIMALE. Le PIM rend les rôles privilégiés JUSTE-À-TEMPS (éligible → activer avec MFA+justif → expire). Une REVUE D'ACCÈS retire les droits accumulés. Résultat : l'app lit le secret, sans secret."
caption_en: "Figure 1. Least-privilege identity: a MANAGED IDENTITY (passwordless) requests a token from ENTRA ID. CONDITIONAL ACCESS verifies explicitly (MFA, location, device) → allow/block. RBAC grants the MINIMAL role (Key Vault Secrets User) on the MINIMAL scope. PIM makes privileged roles JUST-IN-TIME (eligible → activate with MFA+justification → expires). An ACCESS REVIEW removes accumulated rights. Result: the app reads the secret, with no secret."
:::

## walkthrough

:::lang fr
On avance ainsi : identité managée (sans mot de passe) → RBAC au moindre privilège (Bicep) → accès conditionnel (vérifier explicitement) → PIM juste-à-temps → flux Key Vault sans mot de passe → revue d'accès → posture d'identité assemblée.
:::

:::lang en
We'll go like this: managed identity (passwordless) → least-privilege RBAC (Bicep) → conditional access (verify explicitly) → just-in-time PIM → passwordless Key Vault flow → access review → identity posture assembled.
:::

### step-01

:::lang fr
**Objectif.** Créer l'**identité managée** — le **qui** sans mot de passe.

**🤔 Une identité, pas un secret.** Avant d'autoriser, il faut une **identité**. On crée une identité managée (assignée par l'utilisateur : autonome, réutilisable) et on note son **principalId** — l'identifiant qu'on autorisera au RBAC.

Crée l'identité et récupère son principalId :
:::

:::lang en
**Goal.** Create the **managed identity** — the passwordless **who**.

**🤔 An identity, not a secret.** Before authorizing, you need an **identity**. We create a managed identity (user-assigned: standalone, reusable) and note its **principalId** — the id we'll authorize in RBAC.

Create the identity and grab its principalId:
:::

```bash
azlocal group create --name rg-identite --location westeurope >/dev/null 2>&1

azlocal identity create --resource-group rg-identite --name id-app 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); p=d['properties']; print('principalId=' + p['principalId'])" | tee /tmp/principal.txt
```

:::lang fr
**✅ Vérification :** la sortie affiche `principalId=<uuid>` (ex. `principalId=0ba86f54-…`) et l'enregistre dans `/tmp/principal.txt`. Ce **principalId** est le **sujet** de toutes tes autorisations : c'est **lui** qu'on nomme dans une attribution RBAC. L'identité n'a **encore aucun droit** — par défaut, elle ne peut **rien**. On lui accorde le **strict nécessaire** à l'étape suivante.
:::

:::lang en
**✅ Check:** the output shows `principalId=<uuid>` (e.g. `principalId=0ba86f54-…`) and saves it to `/tmp/principal.txt`. This **principalId** is the **subject** of all your authorizations: **it** is what you name in an RBAC assignment. The identity has **no rights yet** — by default, it can do **nothing**. We grant it the **strict minimum** next.
:::

### step-02

:::lang fr
**Objectif.** Attribuer le **rôle minimal** en **RBAC** — écrit et **validé** en Bicep.

**🤔 Le rôle étroit, la portée étroite.** L'app doit **lire des secrets** — rien d'autre. On lui donne le rôle **intégré** *Key Vault Secrets User* (lecture des secrets), **pas** Contributor ni Owner. On écrit l'attribution en Bicep et on la **compile** (validation).

Écris l'attribution RBAC et valide-la :
:::

:::lang en
**Goal.** Assign the **minimal role** in **RBAC** — written and **validated** in Bicep.

**🤔 Narrow role, narrow scope.** The app must **read secrets** — nothing else. We give it the **built-in** *Key Vault Secrets User* role (read secrets), **not** Contributor or Owner. We write the assignment in Bicep and **compile** it (validation).

Write the RBAC assignment and validate it:
:::

```bash
cat > rbac.bicep <<'BICEP'
@description('principalId de l\'identite managee a autoriser')
param principalId string

// Role INTEGRE "Key Vault Secrets User" (lecture des secrets seulement) — moindre privilege
var roleSecretsUser = '4633458b-17de-408a-b874-0445c86b69e6'

resource attribution 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(resourceGroup().id, principalId, roleSecretsUser)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roleSecretsUser)
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}
BICEP

# Compiler/valider en ARM (offline) / compile-validate to ARM (offline)
bicep build rbac.bicep --stdout 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('RBAC compile -> ARM OK, ressource:', d['resources'][0]['type'])"
```

:::lang fr
**✅ Vérification :** la sortie affiche `RBAC compile -> ARM OK, ressource: Microsoft.Authorization/roleAssignments`. L'attribution est **valide** : elle donne à ton `principalId` le rôle **Key Vault Secrets User** — **lire les secrets, rien d'autre**. Remarque les trois pièces : le **principal** (qui), le **roleDefinitionId** (quoi — ici un rôle **intégré étroit**), et la **portée** (où — le groupe de ressources). ⚠️ miniblue n'**exécute** pas les attributions (404) : on les **valide** en Bicep et on les **déploie** sur du vrai Azure. Le principe — **rôle minimal, portée minimale** — est le cœur de l'AZ-500.
:::

:::lang en
**✅ Check:** the output shows `RBAC compile -> ARM OK, ressource: Microsoft.Authorization/roleAssignments`. The assignment is **valid**: it gives your `principalId` the **Key Vault Secrets User** role — **read secrets, nothing else**. Note the three pieces: the **principal** (who), the **roleDefinitionId** (what — here a **narrow built-in** role), and the **scope** (where — the resource group). ⚠️ miniblue doesn't **execute** assignments (404): we **validate** them in Bicep and **deploy** them to real Azure. The principle — **minimal role, minimal scope** — is the heart of AZ-500.
:::

### step-03

:::lang fr
**Objectif.** Exécuter un **accès conditionnel** — *vérifier explicitement*.

**🤔 Le mot de passe ne suffit pas.** L'accès conditionnel évalue **chaque** connexion selon des signaux : **MFA** (surtout pour les rôles privilégiés), **emplacement** approuvé, **appareil** conforme. On écrit un **vrai** moteur de décision et on lui soumet des demandes.

Écris le moteur d'accès conditionnel et évalue :
:::

:::lang en
**Goal.** Run **conditional access** — *verify explicitly*.

**🤔 The password isn't enough.** Conditional access evaluates **every** sign-in against signals: **MFA** (especially for privileged roles), approved **location**, compliant **device**. We write a **real** decision engine and feed it requests.

Write the conditional-access engine and evaluate:
:::

```bash
cat > acces.py <<'PY'
# Acces conditionnel (Zero Trust : verifier explicitement)
def evaluer(d):
    raisons = []
    if d["role"] in ("Owner", "Contributor") and not d["mfa"]:
        raisons.append("MFA requise pour un role privilegie")
    if d["pays"] not in ("FR", "BE", "LU"):
        raisons.append(f"emplacement non approuve ({d['pays']})")
    if not d["appareil_conforme"]:
        raisons.append("appareil non conforme")
    return ("AUTORISE" if not raisons else "BLOQUE"), raisons

demandes = [
    {"user": "alice", "role": "Reader",      "mfa": True,  "pays": "FR", "appareil_conforme": True},
    {"user": "bob",   "role": "Owner",       "mfa": False, "pays": "FR", "appareil_conforme": True},
    {"user": "eve",   "role": "Contributor", "mfa": True,  "pays": "RU", "appareil_conforme": True},
    {"user": "dan",   "role": "Reader",      "mfa": True,  "pays": "FR", "appareil_conforme": False},
]
for d in demandes:
    dec, r = evaluer(d)
    print(f"{d['user']:6} {d['role']:12} -> {dec}" + (f"  ({'; '.join(r)})" if r else ""))
PY
python3 acces.py
```

:::lang fr
**✅ Vérification :** le moteur affiche : `alice … -> AUTORISE`, `bob … -> BLOQUE (MFA requise pour un role privilegie)`, `eve … -> BLOQUE (emplacement non approuve (RU))`, `dan … -> BLOQUE (appareil non conforme)`. Chaque décision **explique** son motif. C'est le « vérifier explicitement » : même avec le bon mot de passe, **bob** (rôle privilégié sans MFA), **eve** (emplacement risqué) et **dan** (appareil non géré) sont **bloqués**. En vrai Azure, ces règles sont des **politiques d'accès conditionnel** Entra ID — même logique.
:::

:::lang en
**✅ Check:** the engine shows: `alice … -> AUTORISE`, `bob … -> BLOQUE (MFA requise pour un role privilegie)`, `eve … -> BLOQUE (emplacement non approuve (RU))`, `dan … -> BLOQUE (appareil non conforme)`. Each decision **explains** its reason. That's "verify explicitly": even with the right password, **bob** (privileged role without MFA), **eve** (risky location) and **dan** (unmanaged device) are **blocked**. In real Azure, these rules are Entra ID **conditional access policies** — same logic.
:::

### step-04

:::lang fr
**Objectif.** Modéliser le **PIM** juste-à-temps — **éligible ≠ actif**.

**🤔 Pas de droits privilégiés en permanence.** Avec le PIM, un admin est **éligible** à un rôle mais ne l'**active** qu'au besoin, avec **MFA** et **justification**, pour une **durée limitée** — puis ça **expire**. On modélise ce cycle de vie.

Modélise l'activation juste-à-temps :
:::

:::lang en
**Goal.** Model **just-in-time PIM** — **eligible ≠ active**.

**🤔 No permanent privileged rights.** With PIM, an admin is **eligible** for a role but only **activates** it when needed, with **MFA** and **justification**, for a **limited duration** — then it **expires**. We model this lifecycle.

Model the just-in-time activation:
:::

```bash
cat > pim.py <<'PY'
# PIM : elevation juste-a-temps d'un role privilegie
class RolePrivilegie:
    def __init__(self, user, role):
        self.user, self.role = user, role
        self.eligible = True     # affecte comme ELIGIBLE, pas actif en permanence
        self.actif_jusqu_a = 0   # minute de fin d'activation (0 = inactif)
    def activer(self, maintenant, duree_min, justification, mfa):
        if not self.eligible:  return "REFUSE : non eligible"
        if not mfa:            return "REFUSE : MFA obligatoire pour activer"
        if not justification:  return "REFUSE : justification obligatoire"
        self.actif_jusqu_a = maintenant + duree_min
        return f"ACTIVE jusqu'a t+{duree_min}min (justif: {justification})"
    def est_actif(self, maintenant):
        return maintenant < self.actif_jusqu_a

r = RolePrivilegie("alice", "Owner")
print("Actif a t=0 (avant activation) ?", r.est_actif(0))
print("Tentative sans MFA             ->", r.activer(0, 60, "incident prod", mfa=False))
print("Activation avec MFA+justif     ->", r.activer(0, 60, "incident prod", mfa=True))
print("Actif a t=30min ?", r.est_actif(30))
print("Actif a t=90min ?", r.est_actif(90), "(expire -> de nouveau eligible seulement)")
PY
python3 pim.py
```

:::lang fr
**✅ Vérification :** la sortie montre le cycle : `Actif a t=0 … ? False` (éligible mais **inactif**), `Tentative sans MFA -> REFUSE : MFA obligatoire`, `Activation avec MFA+justif -> ACTIVE jusqu'a t+60min`, `Actif a t=30min ? True`, `Actif a t=90min ? False (expire …)`. Le rôle privilégié n'est **jamais** actif en permanence : il faut l'**activer** (MFA + justification) et il **expire**. Un compte compromis n'a donc **pas** de droits Owner **actifs** en attente. C'est le moindre privilège **dans le temps** — l'idée-force du PIM.
:::

:::lang en
**✅ Check:** the output shows the cycle: `Actif a t=0 … ? False` (eligible but **inactive**), `Tentative sans MFA -> REFUSE : MFA obligatoire`, `Activation avec MFA+justif -> ACTIVE jusqu'a t+60min`, `Actif a t=30min ? True`, `Actif a t=90min ? False (expire …)`. The privileged role is **never** permanently active: you must **activate** it (MFA + justification) and it **expires**. A compromised account thus has **no** Owner rights **active** and waiting. That's least privilege **over time** — PIM's key idea.
:::

### step-05

:::lang fr
**Objectif.** Boucler le **flux Key Vault sans mot de passe** — l'identité lit le secret.

**🤔 Le tout, ensemble.** L'identité (step-01) + le rôle *Secrets User* (step-02) = l'app **lit le secret** **sans** mot de passe. On dépose un secret, on rappelle **qui** est autorisé (le principalId), et on **lit** — comme le ferait l'app via son identité.

Boucle le flux sans mot de passe :
:::

:::lang en
**Goal.** Close the **passwordless Key Vault flow** — the identity reads the secret.

**🤔 Everything, together.** The identity (step-01) + the *Secrets User* role (step-02) = the app **reads the secret** with **no** password. We deposit a secret, recall **who** is authorized (the principalId), and **read** it — as the app would via its identity.

Close the passwordless flow:
:::

```bash
# Le secret vit au coffre / the secret lives in the vault
azlocal keyvault secret set --vault kv-identite --name api-key --value "cle-api-du-lab" 2>/dev/null >/dev/null

echo "Autorise (principalId) : $(cat /tmp/principal.txt)"
echo "Role                   : Key Vault Secrets User (lecture seule des secrets)"

# L'app, via son identite managee (sans mot de passe), lit le secret
azlocal keyvault secret show --vault kv-identite --name api-key 2>/dev/null \
  | python3 -c "import sys,json; print('Lecture par l identite -> valeur:', json.load(sys.stdin)['value'])"
```

:::lang fr
**✅ Vérification :** la sortie rappelle l'`Autorise (principalId)` et le `Role`, puis affiche `Lecture par l identite -> valeur: cle-api-du-lab`. Le **flux complet** : l'app présente son **identité managée** (sans mot de passe), l'accès conditionnel **vérifie** la connexion, le **RBAC** confirme qu'elle a *Secrets User*, et elle **lit** le secret. **Aucun** mot de passe n'a circulé, **aucun** secret n'était en dur. C'est le Zero Trust côté machine, de bout en bout. ⚠️ En local, c'est `azlocal` qui lit ; en vrai Azure, c'est l'**identité** qui présente son jeton — mêmes acteurs, même résultat.
:::

:::lang en
**✅ Check:** the output recalls the `Autorise (principalId)` and the `Role`, then shows `Lecture par l identite -> valeur: cle-api-du-lab`. The **full flow**: the app presents its **managed identity** (passwordless), conditional access **verifies** the sign-in, **RBAC** confirms it has *Secrets User*, and it **reads** the secret. **No** password traveled, **no** secret was hardcoded. That's machine-side Zero Trust, end to end. ⚠️ Locally it's `azlocal` that reads; in real Azure it's the **identity** presenting its token — same actors, same result.
:::

### step-06

:::lang fr
**Objectif.** Mener une **revue d'accès** — débusquer le **sur-privilège**.

**🤔 Les droits s'accumulent.** Avec le temps, des identités gardent des rôles trop larges ou inutilisés. Une **revue d'accès** liste les attributions et **signale** ce qui viole le moindre privilège. On écrit un audit qui repère les **Owner** et les rôles **inutilisés**.

Audite les attributions et débusque le sur-privilège :
:::

:::lang en
**Goal.** Run an **access review** — surface **over-privilege**.

**🤔 Rights accumulate.** Over time, identities keep roles that are too broad or unused. An **access review** lists assignments and **flags** what violates least privilege. We write an audit that spots **Owners** and **unused** roles.

Audit the assignments and surface over-privilege:
:::

```bash
cat > revue.py <<'PY'
# Revue d'acces : signaler le sur-privilege et les roles dormants
attributions = [
    {"principal": "id-app",    "role": "Key Vault Secrets User", "jours_sans_usage": 2},
    {"principal": "id-batch",  "role": "Owner",                  "jours_sans_usage": 15},
    {"principal": "old-svc",   "role": "Contributor",            "jours_sans_usage": 210},
    {"principal": "id-report", "role": "Reader",                 "jours_sans_usage": 5},
]
print("Revue d'acces — recommandations :")
for a in attributions:
    alertes = []
    if a["role"] == "Owner":
        alertes.append("role Owner (trop large : preferer un role cible + PIM)")
    if a["jours_sans_usage"] > 90:
        alertes.append(f"inutilise depuis {a['jours_sans_usage']} j (a retirer)")
    marque = "❌" if alertes else "✅"
    print(f"  {marque} {a['principal']:10} {a['role']:22} " + ("; ".join(alertes) if alertes else "conforme"))
PY
python3 revue.py
```

:::lang fr
**✅ Vérification :** l'audit marque `✅` `id-app` (rôle étroit, actif) et `id-report`, mais `❌` `id-batch` (**rôle Owner trop large**) et `old-svc` (**inutilisé depuis 210 j**). Ce sont **exactement** les deux dérives que traque une revue d'accès : le **sur-privilège** (Owner là où un rôle ciblé + PIM suffirait) et les **droits dormants** (à retirer). En vrai Azure, les **Access Reviews** d'Entra ID automatisent ce cycle (réviseurs, échéances, retrait auto). Le moindre privilège se **maintient**, il ne se décrète pas une fois.
:::

:::lang en
**✅ Check:** the audit marks `✅` `id-app` (narrow role, active) and `id-report`, but `❌` `id-batch` (**Owner role too broad**) and `old-svc` (**unused for 210 days**). These are **exactly** the two drifts an access review tracks: **over-privilege** (Owner where a targeted role + PIM would do) and **dormant rights** (to remove). In real Azure, Entra ID **Access Reviews** automate this cycle (reviewers, deadlines, auto-removal). Least privilege is **maintained**, not declared once.
:::

### step-07

:::lang fr
**Objectif.** Assembler la **posture d'identité** et nettoyer.

**🤔 La somme des couches identité.** On récapitule ce qui protège l'identité — sans mot de passe, moindre privilège, vérification explicite, juste-à-temps, revue — puis on nettoie le lab.

Récapitule la posture et nettoie :
:::

:::lang en
**Goal.** Assemble the **identity posture** and clean up.

**🤔 The sum of the identity layers.** We recap what protects identity — passwordless, least privilege, explicit verification, just-in-time, review — then clean the lab.

Recap the posture and clean up:
:::

```bash
echo "=== Posture d'identite (Zero Trust) / identity posture ==="
printf "%-26s %s\n" "Identite managee"       "sans mot de passe (aucun secret stocke)"
printf "%-26s %s\n" "RBAC moindre privilege" "role minimal (Secrets User) sur portee minimale"
printf "%-26s %s\n" "Acces conditionnel"     "verifier explicitement (MFA, emplacement, appareil)"
printf "%-26s %s\n" "PIM juste-a-temps"      "eligible != actif ; activer (MFA+justif) ; expire"
printf "%-26s %s\n" "Revue d'acces"          "retirer sur-privilege et roles dormants"

# Nettoyer le lab / clean up
azlocal group delete --name rg-identite >/dev/null 2>&1 && echo "rg-identite supprime / deleted"
rm -f /tmp/principal.txt
```

:::lang fr
**✅ Vérification :** la table récapitule les **cinq leviers** de l'identité sécurisée, puis `rg-identite supprime` nettoie le lab. Tu tiens le pilier **identité** de l'AZ-500 : *identité managée* (sans mot de passe), *RBAC* au moindre privilège (validé en Bicep), *accès conditionnel* (vérifier explicitement), *PIM* (juste-à-temps) et *revue d'accès* (contre l'accumulation). Chaque levier réduit la surface d'attaque **avant** qu'un incident n'arrive. La suite du track AZ-500 : la sécurité **réseau** (segmentation, pare-feu, points de terminaison privés), puis les **données** et les **opérations**.
:::

:::lang en
**✅ Check:** the table recaps the **five levers** of secure identity, then `rg-identite supprime` cleans the lab. You hold the **identity** pillar of AZ-500: *managed identity* (passwordless), least-privilege *RBAC* (validated in Bicep), *conditional access* (verify explicitly), *PIM* (just-in-time) and *access review* (against accumulation). Each lever shrinks the attack surface **before** an incident happens. Next in the AZ-500 track: **network** security (segmentation, firewall, private endpoints), then **data** and **operations**.
:::

## pitfalls

:::lang fr
**1. Mot de passe/secret pour l'accès machine.** Une app ne doit **pas** stocker un secret pour s'authentifier. Utilise une **identité managée**.

**2. Owner « pour que ça marche ».** Le rôle le plus large est le **dernier** recours. Choisis un **rôle intégré étroit** (ex. *Secrets User*) sur la **portée minimale**.

**3. Portée trop large.** Attribuer au niveau **abonnement** ce qui suffirait au **groupe de ressources** (ou à la ressource). Réduis la portée.

**4. Se fier au mot de passe seul.** Sans **accès conditionnel** (MFA, emplacement, appareil), un mot de passe volé suffit. Vérifie **explicitement**.

**5. Rôles privilégiés permanents.** Un Owner « à demeure » est une cible. **PIM** : éligible, activation juste-à-temps, expiration.

**6. Jamais de revue.** Les droits **s'accumulent**. Sans **revue d'accès**, le moindre privilège **dérive**. Révise et retire.

**7. Confondre authentification et autorisation.** **Entra ID** dit **qui** tu es ; **RBAC** dit **ce que** tu peux. Les deux sont nécessaires.
:::

:::lang en
**1. Password/secret for machine access.** An app should **not** store a secret to authenticate. Use a **managed identity**.

**2. Owner "to make it work".** The broadest role is the **last** resort. Choose a **narrow built-in** role (e.g. *Secrets User*) on the **minimal scope**.

**3. Scope too broad.** Assigning at the **subscription** level what the **resource group** (or resource) would cover. Narrow the scope.

**4. Trusting the password alone.** Without **conditional access** (MFA, location, device), a stolen password is enough. Verify **explicitly**.

**5. Permanent privileged roles.** A standing Owner is a target. **PIM**: eligible, just-in-time activation, expiry.

**6. Never reviewing.** Rights **accumulate**. Without an **access review**, least privilege **drifts**. Review and remove.

**7. Confusing authentication and authorization.** **Entra ID** says **who** you are; **RBAC** says **what** you can do. Both are needed.
:::

## success

:::lang fr
Tu as réussi si :

- Tu crées une **identité managée** et sais utiliser son **principalId**.
- Tu écris une attribution **RBAC** au **moindre privilège** (rôle intégré + portée) et la **valides**.
- Tu exécutes un **accès conditionnel** qui **bloque** les connexions à risque (MFA, emplacement, appareil).
- Tu modélises le **PIM** : éligible ≠ actif, activation MFA + justification, expiration.
- Tu boucles le **flux Key Vault sans mot de passe**.
- Tu mènes une **revue d'accès** qui débusque **Owner** et **rôles dormants**.
:::

:::lang en
You've succeeded if:

- You create a **managed identity** and can use its **principalId**.
- You write a least-privilege **RBAC** assignment (built-in role + scope) and **validate** it.
- You run a **conditional access** policy that **blocks** risky sign-ins (MFA, location, device).
- You model **PIM**: eligible ≠ active, MFA + justification activation, expiry.
- You close the **passwordless Key Vault flow**.
- You run an **access review** that surfaces **Owner** and **dormant roles**.
:::

## next

:::lang fr
- **Suivant :** *Azure — sécurité réseau (AZ-500)* — segmentation, pare-feu, points de terminaison privés, DDoS.
- **Réviser :** *Azure — sécurité fondamentaux (AZ-500)* pour le Zero Trust.
- **S'entraîner :** ajoute une règle d'accès conditionnel (heure ouvrée) à `acces.py`, et un niveau d'**approbation** au PIM.
:::

:::lang en
- **Next:** *Azure — network security (AZ-500)* — segmentation, firewall, private endpoints, DDoS.
- **Review:** *Azure — security fundamentals (AZ-500)* for Zero Trust.
- **Practice:** add a conditional-access rule (business hours) to `acces.py`, and an **approval** step to PIM.
:::

## cheatsheet

:::lang fr
**Identité & RBAC**

```bash
# Identite managee (sans mot de passe)
azlocal identity create --resource-group RG --name ID   # -> principalId

# RBAC (Bicep) : role INTEGRE etroit + portee minimale
# roleDefinitionId (exemples) :
#   Reader                     acdd72a7-3385-48ef-bd42-f606fba81ae7
#   Contributor                b24988ac-6180-42a0-ab88-20f7382dd24c
#   Owner                      8e3af657-a8ff-443c-a75c-2fe8c4bcb635  (a eviter)
#   Key Vault Secrets User     4633458b-17de-408a-b874-0445c86b69e6
bicep build rbac.bicep --stdout        # valider l'attribution
```

**Zero Trust — les leviers**

```text
Verifier explicitement  : acces conditionnel (MFA, emplacement, appareil)
Moindre privilege       : role minimal, portee minimale
Juste-a-temps (PIM)     : eligible -> activer (MFA+justif) -> expire
Maintenir               : revue d'acces (retirer sur-privilege / dormant)
```

**Regles d'or**

```text
- App -> identite managee (jamais de secret pour s'authentifier)
- Prefere un role INTEGRE etroit a un role large
- Portee : ressource < groupe < abonnement (choisis la plus petite)
- Owner = dernier recours, et via PIM juste-a-temps
```
:::

:::lang en
**Identity & RBAC**

```bash
# Managed identity (passwordless)
azlocal identity create --resource-group RG --name ID   # -> principalId

# RBAC (Bicep): narrow BUILT-IN role + minimal scope
# roleDefinitionId (examples):
#   Reader                     acdd72a7-3385-48ef-bd42-f606fba81ae7
#   Contributor                b24988ac-6180-42a0-ab88-20f7382dd24c
#   Owner                      8e3af657-a8ff-443c-a75c-2fe8c4bcb635  (avoid)
#   Key Vault Secrets User     4633458b-17de-408a-b874-0445c86b69e6
bicep build rbac.bicep --stdout        # validate the assignment
```

**Zero Trust — the levers**

```text
Verify explicitly  : conditional access (MFA, location, device)
Least privilege    : minimal role, minimal scope
Just-in-time (PIM) : eligible -> activate (MFA+justification) -> expires
Maintain           : access review (remove over-privilege / dormant)
```

**Golden rules**

```text
- App -> managed identity (never a secret to authenticate)
- Prefer a narrow BUILT-IN role over a broad one
- Scope: resource < group < subscription (pick the smallest)
- Owner = last resort, and via just-in-time PIM
```
:::

## resources

:::lang fr
- **Microsoft Entra ID** : identités, principals de service, identités managées — Microsoft Learn.
- **Azure RBAC** : rôles intégrés, attributions, portée — learn.microsoft.com/azure/role-based-access-control.
- **Accès conditionnel** : signaux, décisions, MFA — Microsoft Learn (AZ-500).
- **Privileged Identity Management (PIM)** : rôles éligibles, activation, revues — Microsoft Learn.
- **Access Reviews** : campagnes de revue d'accès Entra ID — Microsoft Learn.
- **Identités managées & Key Vault** : accès sans mot de passe — Microsoft Learn.
:::

:::lang en
- **Microsoft Entra ID**: identities, service principals, managed identities — Microsoft Learn.
- **Azure RBAC**: built-in roles, assignments, scope — learn.microsoft.com/azure/role-based-access-control.
- **Conditional access**: signals, decisions, MFA — Microsoft Learn (AZ-500).
- **Privileged Identity Management (PIM)**: eligible roles, activation, reviews — Microsoft Learn.
- **Access Reviews**: Entra ID access-review campaigns — Microsoft Learn.
- **Managed identities & Key Vault**: passwordless access — Microsoft Learn.
:::

## troubleshooting

:::lang fr
**`azlocal identity create` : `--resource-group is required`.** Crée d'abord le groupe (`azlocal group create --name rg-identite …`) et passe `--resource-group rg-identite`.

**`bicep : command not found`.** `az bicep install`, ou installe le binaire autonome (releases GitHub `Azure/bicep`).

**Le RBAC ne se déploie pas en local.** miniblue renvoie 404 sur les attributions de rôles. C'est **attendu** : on **valide** en Bicep (`bicep build`) et on **déploie** sur du vrai Azure. L'**identité** (principalId), elle, est réelle en local.

**`/tmp/principal.txt` vide (step-05).** Le step-01 doit avoir réussi et écrit le fichier. Relance-le ; vérifie que `azlocal identity create` renvoie bien un JSON avec `properties.principalId`.

**Les scripts Python n'affichent rien.** Vérifie l'indentation (pas de tabulations mélangées) et que tu lances `python3 fichier.py`. Chaque script est autonome.

**Quel roleDefinitionId choisir ?** Pars du **besoin** : lire des secrets → *Key Vault Secrets User* ; lire des ressources → *Reader* ; gérer sans déléguer de droits → *Contributor*. Évite *Owner* sauf nécessité (et via PIM).
:::

:::lang en
**`azlocal identity create`: `--resource-group is required`.** Create the group first (`azlocal group create --name rg-identite …`) and pass `--resource-group rg-identite`.

**`bicep: command not found`.** `az bicep install`, or install the standalone binary (GitHub `Azure/bicep` releases).

**RBAC won't deploy locally.** miniblue returns 404 on role assignments. That's **expected**: we **validate** in Bicep (`bicep build`) and **deploy** to real Azure. The **identity** (principalId) is real locally.

**`/tmp/principal.txt` empty (step-05).** step-01 must have succeeded and written the file. Re-run it; check that `azlocal identity create` returns JSON with `properties.principalId`.

**The Python scripts print nothing.** Check indentation (no mixed tabs) and that you run `python3 file.py`. Each script is standalone.

**Which roleDefinitionId to pick?** Start from the **need**: read secrets → *Key Vault Secrets User*; read resources → *Reader*; manage without delegating rights → *Contributor*. Avoid *Owner* unless necessary (and via PIM).
:::
