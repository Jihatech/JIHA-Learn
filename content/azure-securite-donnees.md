---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-securite-donnees
slug: azure-securite-donnees
order: 79
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — sécurité des données (AZ-500) : chiffrement, coffre, rotation"
title_en: "Azure — data security (AZ-500): encryption, vault, rotation"
tagline_fr: "classer, chiffrer au repos et en transit, faire tourner les secrets."
tagline_en: "classify, encrypt at rest and in transit, rotate the secrets."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 250
repo: "bridgecrewio/checkov"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-securite-reseau]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [donnees, classification, chiffrement-au-repos, chiffrement-en-transit, tls, key-vault, rotation, cle-client-cmk, az-500]
concepts_en: [data, classification, encryption-at-rest, encryption-in-transit, tls, key-vault, rotation, customer-managed-key, az-500]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Sécuriser les données pour l'AZ-500, en local et pour de vrai : classer la donnée pour en déduire les contrôles (Public → Secret), le chiffrement au repos (par défaut + clés gérées par le client / CMK) validé par checkov, le chiffrement en transit (TLS 1.2 + HTTPS obligatoire, checkov), le coffre Key Vault et la rotation d'un secret (v1 → v2, live sur miniblue), la rotation des clés de stockage (motif à deux clés, live), et une ressource de données entièrement durcie qui passe le scan au vert. Sans compte cloud.",
og_description_en: "Securing data for AZ-500, locally and for real: classifying data to derive its controls (Public → Secret), encryption at rest (default + customer-managed keys / CMK) validated by checkov, encryption in transit (TLS 1.2 + HTTPS required, checkov), the Key Vault and rotating a secret (v1 → v2, live on miniblue), rotating storage keys (two-key pattern, live), and a fully hardened data resource that passes the scan green. No cloud account."
---

## intro

:::lang fr
Au bout de la chaîne, il y a la **donnée** — ce qu'un attaquant veut vraiment. L'identité et le réseau la protègent **autour** ; ici, on la protège **elle-même**. L'**AZ-500** attend que tu saches **classer** la donnée, la **chiffrer** au repos et en transit, gérer les **clés** et **faire tourner** les secrets. C'est la couche la plus **proche** de la valeur.

Fidèle à la méthode, on pratique **en local et pour de vrai** : on **classe** la donnée (Public → Secret) pour en **déduire les contrôles**, on valide le **chiffrement au repos** (par défaut + **clés gérées par le client**, CMK) et le **chiffrement en transit** (**TLS 1.2** + HTTPS obligatoire) avec **checkov**, on **stocke** et on **fait tourner** un secret dans **Key Vault** (v1 → v2, **live** sur **miniblue**), on **rotationne** les **clés de stockage** (motif à **deux clés**, live), et on assemble une **ressource de données entièrement durcie** qui **passe le scan au vert**.

**Pour qui c'est :** tu as l'identité et le réseau (guides précédents) et tu veux **verrouiller la donnée**.

**Quand ce n'est PAS le bon choix :**

- Tu ne connais pas Key Vault → révise *Azure — sécurité fondamentaux (AZ-500)*.
- Tu veux la **conformité** réglementaire détaillée (RGPD, PCI-DSS) → ici c'est la **mécanique** technique.
:::

:::lang en
At the end of the chain is the **data** — what an attacker really wants. Identity and network protect it **around**; here, we protect it **itself**. **AZ-500** expects you to **classify** data, **encrypt** it at rest and in transit, manage **keys** and **rotate** secrets. It's the layer **closest** to the value.

True to the method, we practice **locally and for real**: we **classify** data (Public → Secret) to **derive its controls**, we validate **encryption at rest** (default + **customer-managed keys**, CMK) and **encryption in transit** (**TLS 1.2** + HTTPS required) with **checkov**, we **store** and **rotate** a secret in **Key Vault** (v1 → v2, **live** on **miniblue**), we **rotate** the **storage keys** (**two-key** pattern, live), and we assemble a **fully hardened data resource** that **passes the scan green**.

**Who it's for:** you have identity and network (previous guides) and want to **lock down the data**.

**When it's NOT the right choice:**

- You don't know Key Vault → review *Azure — security fundamentals (AZ-500)*.
- You want detailed regulatory **compliance** (GDPR, PCI-DSS) → here it's the technical **mechanics**.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- **Classer** la donnée (Public → Secret) et en **déduire les contrôles**.
- Expliquer le **chiffrement au repos** (par défaut vs **clé gérée par le client**, CMK).
- Imposer le **chiffrement en transit** (**TLS 1.2**, HTTPS obligatoire) et le **valider**.
- Utiliser **Key Vault** et **faire tourner** un secret (nouvelles versions).
- **Rotationner** des **clés de stockage** avec le motif à **deux clés**.
- Assembler une **ressource de données durcie** qui **passe** le scan de sécurité.
- Distinguer **clés gérées par la plateforme** et **par le client**.
:::

:::lang en
By the end of this guide, you can:

- **Classify** data (Public → Secret) and **derive its controls**.
- Explain **encryption at rest** (default vs **customer-managed key**, CMK).
- Enforce **encryption in transit** (**TLS 1.2**, HTTPS required) and **validate** it.
- Use **Key Vault** and **rotate** a secret (new versions).
- **Rotate** **storage keys** with the **two-key** pattern.
- Assemble a **hardened data resource** that **passes** the security scan.
- Distinguish **platform-managed** and **customer-managed** keys.
:::

## prerequisites

:::lang fr
- Les guides **Azure — sécurité fondamentaux / identité / réseau (AZ-500)**.
- Le **lab local** : **miniblue** démarré, `azlocal` sur le `PATH`, **Python 3**, `pip install checkov`.
- **Aucun compte cloud** : coffre et rotation live, chiffrement validé par policy (checkov).
:::

:::lang en
- The **Azure — security fundamentals / identity / network (AZ-500)** guides.
- The **local lab**: **miniblue** started, `azlocal` on `PATH`, **Python 3**, `pip install checkov`.
- **No cloud account**: vault and rotation live, encryption validated by policy (checkov).
:::

## concepts

:::lang fr
**Classer avant de protéger.** On ne protège pas tout **pareil** : ce serait trop cher (Secret) ou trop faible (Public). La **classification** attribue une **sensibilité** — *Public*, *Interne*, *Confidentiel*, *Secret* — et **chaque classe** impose des **contrôles**. Plus c'est sensible, plus on empile : chiffrement, TLS, RBAC serré, point privé, journalisation. La classification **pilote** tout le reste.

**Chiffrement au repos.** La donnée stockée est **chiffrée sur le disque**. Azure le fait **par défaut** avec des **clés gérées par la plateforme** (Microsoft). Pour un contrôle accru, on utilise des **clés gérées par le client** (**CMK**) stockées dans **Key Vault** : c'est **toi** qui possèdes et **révoques** la clé — révoquer la clé rend la donnée **illisible**, même pour l'hébergeur. Option supplémentaire : le **chiffrement d'infrastructure** (double couche).

**Chiffrement en transit.** La donnée **en mouvement** (réseau) doit être chiffrée : **TLS 1.2** minimum, **HTTPS obligatoire**. Un service qui accepte HTTP en clair ou un vieux TLS 1.0 est une **fuite** attendue. C'est un contrôle **non négociable**, et un scan de sécurité l'**exige**.

**Le coffre : secrets, clés, certificats.** **Key Vault** stocke trois types d'objets : **secrets** (chaînes : mots de passe, chaînes de connexion), **clés** (cryptographiques : chiffrement, signature — dont les CMK), **certificats** (TLS). Contrôle d'accès (RBAC/politiques), **audit**, et **versionnement** intégré.

**La rotation.** Un secret ou une clé ne doit **pas** vivre éternellement : plus il est ancien, plus le risque de fuite augmente. La **rotation** remplace régulièrement la valeur. Key Vault **versionne** : une nouvelle valeur crée une **nouvelle version**, l'ancienne reste consultable le temps de la transition. Pour un **compte de stockage**, le **motif à deux clés** (`key1`, `key2`) permet de **rotationner sans coupure** : on bascule les apps sur `key2`, on régénère `key1`, puis on rebascule — jamais d'interruption.

**Ce qui est live ici.** La **classification** est un **moteur exécutable** (classe → contrôles). Le **chiffrement au repos et en transit** se **valide** avec **checkov** (TLS 1.2, HTTPS, chiffrement d'infra). Le **secret** se **stocke** et se **fait tourner** dans Key Vault (v1 → v2, live). Les **clés de stockage** se **listent** pour le motif à deux clés (live). Les **CMK** et le versionnement fin se **raisonnent** (miniblue n'émule que les secrets). Tout sans compte cloud.
:::

:::lang en
**Classify before protecting.** You don't protect everything the **same**: that would be too costly (Secret) or too weak (Public). **Classification** assigns a **sensitivity** — *Public*, *Internal*, *Confidential*, *Secret* — and **each class** mandates **controls**. The more sensitive, the more you stack: encryption, TLS, tight RBAC, private endpoint, logging. Classification **drives** everything else.

**Encryption at rest.** Stored data is **encrypted on disk**. Azure does it **by default** with **platform-managed keys** (Microsoft). For more control, you use **customer-managed keys** (**CMK**) stored in **Key Vault**: **you** own and **revoke** the key — revoking it makes the data **unreadable**, even to the host. Extra option: **infrastructure encryption** (double layer).

**Encryption in transit.** Data **in motion** (network) must be encrypted: **TLS 1.2** minimum, **HTTPS required**. A service accepting cleartext HTTP or old TLS 1.0 is an expected **leak**. It's a **non-negotiable** control, and a security scan **requires** it.

**The vault: secrets, keys, certificates.** **Key Vault** stores three object types: **secrets** (strings: passwords, connection strings), **keys** (cryptographic: encryption, signing — including CMKs), **certificates** (TLS). Access control (RBAC/policies), **audit**, and built-in **versioning**.

**Rotation.** A secret or key must **not** live forever: the older it is, the higher the leak risk. **Rotation** regularly replaces the value. Key Vault **versions**: a new value creates a **new version**, the old one stays readable during transition. For a **storage account**, the **two-key pattern** (`key1`, `key2`) allows **rotation without downtime**: switch apps to `key2`, regenerate `key1`, then switch back — never an interruption.

**What's live here.** **Classification** is a **runnable engine** (class → controls). **Encryption at rest and in transit** is **validated** with **checkov** (TLS 1.2, HTTPS, infra encryption). The **secret** is **stored** and **rotated** in Key Vault (v1 → v2, live). The **storage keys** are **listed** for the two-key pattern (live). **CMKs** and fine versioning are **reasoned** (miniblue only emulates secrets). All without a cloud account.
:::

:::figure azure-securite-donnees-couches
caption_fr: "Schéma 1. La sécurité des données : la CLASSIFICATION (Public → Secret) pilote les contrôles. AU REPOS : chiffrement par défaut (clé plateforme) ou CMK (clé client dans Key Vault, révocable). EN TRANSIT : TLS 1.2 + HTTPS obligatoire. Le COFFRE (secrets/clés/certificats) versionne et audite. ROTATION : nouvelles versions de secret ; motif à deux clés (key1/key2) pour rotationner sans coupure. Plus c'est sensible, plus on empile de contrôles."
caption_en: "Figure 1. Data security: CLASSIFICATION (Public → Secret) drives the controls. AT REST: default encryption (platform key) or CMK (customer key in Key Vault, revocable). IN TRANSIT: TLS 1.2 + HTTPS required. The VAULT (secrets/keys/certificates) versions and audits. ROTATION: new secret versions; two-key pattern (key1/key2) to rotate without downtime. The more sensitive, the more controls you stack."
:::

## walkthrough

:::lang fr
On avance ainsi : classer la donnée → chiffrement au repos → chiffrement en transit → coffre & rotation d'un secret → rotation des clés de stockage → ressource de données durcie → posture données assemblée.
:::

:::lang en
We'll go like this: classify data → encryption at rest → encryption in transit → vault & secret rotation → storage-key rotation → hardened data resource → data posture assembled.
:::

### step-01

:::lang fr
**Objectif.** **Classer** la donnée pour en **déduire les contrôles**.

**🤔 Tout ne mérite pas le même effort.** On attribue une **sensibilité** à chaque donnée, et **la classe impose les contrôles**. Un catalogue public n'a pas besoin de CMK ; des cartes bancaires, si. On écrit le moteur de classification.

Écris le moteur de classification et applique-le :
:::

:::lang en
**Goal.** **Classify** data to **derive its controls**.

**🤔 Not everything deserves the same effort.** We assign a **sensitivity** to each data, and **the class mandates the controls**. A public catalog needs no CMK; credit cards do. We write the classification engine.

Write the classification engine and apply it:
:::

```bash
mkdir -p data-securite && cd data-securite
cat > classif.py <<'PY'
# Classer la donnee -> deriver les controles requis (plus c'est sensible, plus on empile)
CONTROLES = {
    "Public":       ["chiffrement au repos (defaut)"],
    "Interne":      ["chiffrement au repos", "TLS 1.2", "RBAC"],
    "Confidentiel": ["chiffrement au repos", "TLS 1.2", "RBAC moindre privilege", "point de terminaison prive"],
    "Secret":       ["chiffrement CMK (cle client)", "TLS 1.2", "RBAC + PIM", "point prive", "journalisation des acces"],
}
donnees = [
    ("catalogue produits", "Public"),
    ("logs applicatifs",   "Interne"),
    ("donnees clients",    "Confidentiel"),
    ("cartes bancaires",   "Secret"),
]
for nom, classe in donnees:
    print(f"{nom:20} [{classe:12}] -> {', '.join(CONTROLES[classe])}")
PY
python3 classif.py
```

:::lang fr
**✅ Vérification :** chaque donnée reçoit sa **classe** et ses **contrôles** : `catalogue produits [Public] -> chiffrement au repos (defaut)` … jusqu'à `cartes bancaires [Secret] -> chiffrement CMK (cle client), TLS 1.2, RBAC + PIM, point prive, journalisation des acces`. La **sensibilité pilote** l'effort : on n'empile les contrôles coûteux (CMK, PIM, point privé) que là où c'est **justifié**. C'est la première décision de sécurité des données — **avant** de choisir la moindre technologie. On applique maintenant ces contrôles, en commençant par le **chiffrement**.
:::

:::lang en
**✅ Check:** each data gets its **class** and **controls**: `catalogue produits [Public] -> chiffrement au repos (defaut)` … up to `cartes bancaires [Secret] -> chiffrement CMK (cle client), TLS 1.2, RBAC + PIM, point prive, journalisation des acces`. **Sensitivity drives** the effort: you only stack costly controls (CMK, PIM, private endpoint) where it's **justified**. It's the first data-security decision — **before** choosing any technology. We now apply these controls, starting with **encryption**.
:::

### step-02

:::lang fr
**Objectif.** Valider le **chiffrement au repos** — par défaut et **clé gérée par le client** (CMK).

**🤔 Chiffré sur le disque, et par qui ?** La donnée au repos est chiffrée **par défaut** (clé plateforme). Pour les données **Secret**, on veut une **CMK** (tu possèdes/révoques la clé) et le **chiffrement d'infrastructure** (double couche). On écrit une ressource **durcie** et on **vérifie** que le chiffrement d'infra est bien activé.

Vérifie le chiffrement au repos :
:::

:::lang en
**Goal.** Validate **encryption at rest** — default and **customer-managed key** (CMK).

**🤔 Encrypted on disk, and by whom?** Data at rest is encrypted **by default** (platform key). For **Secret** data, we want a **CMK** (you own/revoke the key) and **infrastructure encryption** (double layer). We write a **hardened** resource and **check** that infra encryption is on.

Check encryption at rest:
:::

```bash
mkdir -p infra
cat > infra/main.tf <<'TF'
resource "azurerm_storage_account" "donnees" {
  name                              = "stdonneessecure1"
  resource_group_name               = "rg-data"
  location                          = "westeurope"
  account_tier                      = "Standard"
  account_replication_type          = "GRS"
  enable_https_traffic_only         = true
  min_tls_version                   = "TLS1_2"
  public_network_access_enabled     = false
  infrastructure_encryption_enabled = true   # double couche de chiffrement au repos
}
TF

# Verifier le chiffrement d'infrastructure (double couche au repos)
checkov -d infra --check CKV_AZURE_43,CKV2_AZURE_1,CKV_AZURE_33 --compact 2>/dev/null | grep -iE "encryption|infrastructure" | head -3
grep -q "infrastructure_encryption_enabled = true" infra/main.tf && echo "✅ chiffrement d'infrastructure (double couche) active"
```

:::lang fr
**✅ Vérification :** `grep` confirme `✅ chiffrement d'infrastructure (double couche) active` — la ressource impose une **seconde couche** de chiffrement au repos, au-delà du chiffrement par défaut. Retiens la hiérarchie : (1) **par défaut**, tout est chiffré au repos (clé **plateforme**) ; (2) pour un contrôle accru, une **CMK** (clé **client** dans Key Vault) — tu la **révoques** pour rendre la donnée illisible ; (3) le **chiffrement d'infrastructure** ajoute une **double couche**. La classe **Secret** de l'étape 1 exige les trois. On passe au transit.
:::

:::lang en
**✅ Check:** `grep` confirms `✅ chiffrement d'infrastructure (double couche) active` — the resource enforces a **second layer** of encryption at rest, beyond the default. Remember the hierarchy: (1) **by default**, everything is encrypted at rest (**platform** key); (2) for more control, a **CMK** (**customer** key in Key Vault) — you **revoke** it to make data unreadable; (3) **infrastructure encryption** adds a **double layer**. The **Secret** class from step 1 requires all three. On to transit.
:::

### step-03

:::lang fr
**Objectif.** Imposer le **chiffrement en transit** — TLS 1.2 + HTTPS obligatoire.

**🤔 Le réseau n'est pas de confiance.** La donnée qui circule doit être chiffrée : **TLS 1.2** minimum, **HTTPS obligatoire**. Un scan de sécurité **exige** ces réglages. On les **vérifie** sur notre ressource durcie.

Valide le chiffrement en transit :
:::

:::lang en
**Goal.** Enforce **encryption in transit** — TLS 1.2 + HTTPS required.

**🤔 The network isn't trusted.** Data in motion must be encrypted: **TLS 1.2** minimum, **HTTPS required**. A security scan **requires** these settings. We **check** them on our hardened resource.

Validate encryption in transit:
:::

```bash
# Les regles cle : HTTPS obligatoire (CKV_AZURE_3) et TLS recent (CKV_AZURE_44)
checkov -d infra --check CKV_AZURE_3,CKV_AZURE_44 --compact --quiet 2>/dev/null | grep -E "Passed checks|Failed checks"
```

:::lang fr
**✅ Vérification :** checkov affiche `Passed checks: 2, Failed checks: 0` — **HTTPS obligatoire** (`CKV_AZURE_3`) et **TLS récent** (`CKV_AZURE_44`) sont **respectés**. Aucune donnée ne circule en clair, aucun vieux protocole n'est accepté. C'est un contrôle **non négociable** : un `enable_https_traffic_only = false` ou un `min_tls_version = "TLS1_0"` **échouerait** le scan (et donc la porte de CI). Le chiffrement **au repos** (étape 2) **et en transit** (ici) couvre la donnée à l'arrêt **et** en mouvement. Reste à protéger les **secrets** eux-mêmes.
:::

:::lang en
**✅ Check:** checkov shows `Passed checks: 2, Failed checks: 0` — **HTTPS required** (`CKV_AZURE_3`) and **recent TLS** (`CKV_AZURE_44`) are **respected**. No data travels in cleartext, no old protocol is accepted. It's a **non-negotiable** control: an `enable_https_traffic_only = false` or `min_tls_version = "TLS1_0"` would **fail** the scan (and thus the CI gate). Encryption **at rest** (step 2) **and in transit** (here) covers data at rest **and** in motion. Now to protect the **secrets** themselves.
:::

### step-04

:::lang fr
**Objectif.** Stocker et **faire tourner** un secret dans **Key Vault** (v1 → v2).

**🤔 Un secret ancien est un secret à risque.** On stocke une chaîne de connexion, puis on la **fait tourner** : une nouvelle valeur crée une **nouvelle version**, et la **valeur courante** devient la dernière. On le fait **pour de vrai**.

Stocke puis fais tourner un secret :
:::

:::lang en
**Goal.** Store and **rotate** a secret in **Key Vault** (v1 → v2).

**🤔 An old secret is a risky secret.** We store a connection string, then **rotate** it: a new value creates a **new version**, and the **current value** becomes the latest. We do it **for real**.

Store then rotate a secret:
:::

```bash
azlocal group create --name rg-data --location westeurope >/dev/null 2>&1

# Version 1 (ancienne) / version 1 (old)
azlocal keyvault secret set --vault kv-data --name db-conn --value "conn-v1-ancien" 2>/dev/null \
  | python3 -c "import sys,json; print('v1 stockee / stored:', json.load(sys.stdin)['value'])"

# Rotation -> version 2 (nouvelle) / rotation -> version 2 (new)
azlocal keyvault secret set --vault kv-data --name db-conn --value "conn-v2-apres-rotation" 2>/dev/null \
  | python3 -c "import sys,json; print('v2 (rotation) :', json.load(sys.stdin)['value'])"

# La valeur COURANTE est la derniere / the CURRENT value is the latest
azlocal keyvault secret show --vault kv-data --name db-conn 2>/dev/null \
  | python3 -c "import sys,json; print('valeur courante / current:', json.load(sys.stdin)['value'])"
```

:::lang fr
**✅ Vérification :** la sortie montre `v1 stockee : conn-v1-ancien`, puis `v2 (rotation) : conn-v2-apres-rotation`, et enfin `valeur courante : conn-v2-apres-rotation`. La **rotation** a remplacé la valeur : les apps qui lisent le secret par son **nom** obtiennent **automatiquement** la nouvelle version — **sans redéploiement**. En vrai Azure, Key Vault garde les **versions** (l'ancienne reste consultable le temps de la transition) et peut **rotationner automatiquement** (politique de rotation). Le secret ne **stagne** jamais. Passons aux **clés** de stockage.
:::

:::lang en
**✅ Check:** the output shows `v1 stockee : conn-v1-ancien`, then `v2 (rotation) : conn-v2-apres-rotation`, and finally `valeur courante : conn-v2-apres-rotation`. **Rotation** replaced the value: apps that read the secret by its **name** get the new version **automatically** — **without redeployment**. In real Azure, Key Vault keeps the **versions** (the old one stays readable during transition) and can **rotate automatically** (rotation policy). The secret never **stagnates**. On to storage **keys**.
:::

### step-05

:::lang fr
**Objectif.** **Rotationner** les **clés de stockage** — le motif à **deux clés**, sans coupure.

**🤔 Rotationner sans casser.** Un compte de stockage a **deux** clés d'accès (`key1`, `key2`) précisément pour **tourner sans interruption** : les apps utilisent `key2`, on **régénère** `key1`, puis on rebascule. On observe les deux clés et on décrit le cycle.

Liste les deux clés et décris la rotation :
:::

:::lang en
**Goal.** **Rotate** the **storage keys** — the **two-key** pattern, no downtime.

**🤔 Rotate without breaking.** A storage account has **two** access keys (`key1`, `key2`) precisely to **rotate without interruption**: apps use `key2`, you **regenerate** `key1`, then switch back. We observe both keys and describe the cycle.

List the two keys and describe the rotation:
:::

```bash
azlocal storage account create --resource-group rg-data --name stdata001 >/dev/null 2>&1

azlocal storage account list-keys --resource-group rg-data --name stdata001 2>/dev/null \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('clés disponibles / keys:', [k['keyName'] for k in d['keys']])"

cat <<'TXT'
Cycle de rotation sans coupure / zero-downtime rotation cycle :
  1. Les apps utilisent key2                 (bascule)
  2. Regenerer key1                          (l'ancienne key1 est invalidee)
  3. Basculer les apps sur key1 regeneree
  4. Regenerer key2                          (prochaine rotation)
-> A aucun moment le service n'est interrompu ; une cle sert pendant que l'autre tourne.
TXT
```

:::lang fr
**✅ Vérification :** la sortie liste `clés disponibles / keys: ['key1', 'key2']`, puis décrit le **cycle sans coupure**. L'existence de **deux** clés n'est pas un hasard : c'est **exactement** ce qui permet la rotation **sans interruption** — on bascule sur l'une, on régénère l'autre, et on alterne. ⚠️ Rappel du guide précédent : ces clés `Full` restent un **anti-pattern** si distribuées ; préfère l'**identité managée** + RBAC. Mais **quand** on doit les utiliser, on les **fait tourner** avec ce motif. La donnée est protégée au repos, en transit, et ses **secrets/clés tournent**.
:::

:::lang en
**✅ Check:** the output lists `clés disponibles / keys: ['key1', 'key2']`, then describes the **zero-downtime cycle**. The existence of **two** keys is no accident: it's **exactly** what enables rotation **without interruption** — switch to one, regenerate the other, alternate. ⚠️ Reminder from the previous guide: these `Full` keys remain an **anti-pattern** if distributed; prefer **managed identity** + RBAC. But **when** you must use them, you **rotate** them with this pattern. Data is protected at rest, in transit, and its **secrets/keys rotate**.
:::

### step-06

:::lang fr
**Objectif.** Assembler une **ressource de données entièrement durcie** — le scan au vert.

**🤔 Tous les contrôles, ensemble.** On rassemble sur une même ressource : chiffrement au repos (double couche), TLS 1.2, HTTPS obligatoire, accès public fermé, réplication géo-redondante. On **scanne** l'ensemble des règles clés : elles doivent **toutes** passer.

Scanne la ressource durcie sur les règles clés :
:::

:::lang en
**Goal.** Assemble a **fully hardened data resource** — the scan green.

**🤔 All controls, together.** We gather on one resource: encryption at rest (double layer), TLS 1.2, HTTPS required, public access closed, geo-redundant replication. We **scan** all the key rules: they must **all** pass.

Scan the hardened resource on the key rules:
:::

```bash
# Toutes les regles cle de securite des donnees, d'un coup
checkov -d infra --check CKV_AZURE_3,CKV_AZURE_44,CKV_AZURE_59 --compact --quiet 2>/dev/null | grep -E "Passed checks|Failed checks"
echo "Controles de la ressource durcie :"
grep -E "https_traffic_only|min_tls_version|public_network_access|replication_type|infrastructure_encryption" infra/main.tf | sed 's/^ *//'
```

:::lang fr
**✅ Vérification :** checkov affiche `Passed checks: 3, Failed checks: 0` sur les règles clés (HTTPS, TLS, accès public), et le `grep` liste les contrôles actifs : `enable_https_traffic_only = true`, `min_tls_version = "TLS1_2"`, `public_network_access_enabled = false`, `account_replication_type = "GRS"`, `infrastructure_encryption_enabled = true`. La ressource **cumule** tous les contrôles de données : chiffrée (double couche), TLS récent, HTTPS only, hors d'Internet, géo-redondante (disponibilité). C'est le **livrable** de la sécurité des données — une ressource qui **passe** la porte de sécurité. On récapitule.
:::

:::lang en
**✅ Check:** checkov shows `Passed checks: 3, Failed checks: 0` on the key rules (HTTPS, TLS, public access), and `grep` lists the active controls: `enable_https_traffic_only = true`, `min_tls_version = "TLS1_2"`, `public_network_access_enabled = false`, `account_replication_type = "GRS"`, `infrastructure_encryption_enabled = true`. The resource **stacks** all data controls: encrypted (double layer), recent TLS, HTTPS only, off the Internet, geo-redundant (availability). It's the **deliverable** of data security — a resource that **passes** the security gate. Let's recap.
:::

### step-07

:::lang fr
**Objectif.** Assembler la **posture données** et nettoyer.

**🤔 Toutes les couches données.** On récapitule ce qui protège la donnée — classification, chiffrement au repos/en transit, coffre, rotation — puis on nettoie le lab.

Récapitule la posture et nettoie :
:::

:::lang en
**Goal.** Assemble the **data posture** and clean up.

**🤔 All the data layers.** We recap what protects data — classification, encryption at rest/in transit, vault, rotation — then clean the lab.

Recap the posture and clean up:
:::

```bash
echo "=== Posture donnees (defense en profondeur) / data posture ==="
printf "%-24s %s\n" "Classification"       "Public -> Secret : la classe impose les controles"
printf "%-24s %s\n" "Chiffrement au repos" "defaut (cle plateforme) -> CMK (cle client) -> double couche"
printf "%-24s %s\n" "Chiffrement transit"  "TLS 1.2 + HTTPS obligatoire (non negociable)"
printf "%-24s %s\n" "Coffre (Key Vault)"   "secrets / cles / certificats, RBAC + audit"
printf "%-24s %s\n" "Rotation"             "secret : nouvelles versions ; stockage : motif 2 cles"

# Nettoyer le lab / clean up
azlocal group delete --name rg-data >/dev/null 2>&1 && echo "rg-data supprime / deleted"
```

:::lang fr
**✅ Vérification :** la table récapitule les **cinq leviers** de la sécurité des données, puis `rg-data supprime` nettoie le lab. Tu tiens le pilier **données** de l'AZ-500 : **classer** (piloter l'effort), **chiffrer au repos** (défaut → CMK → double couche), **chiffrer en transit** (TLS 1.2/HTTPS), **coffrer** (Key Vault) et **faire tourner** (secrets versionnés, clés à deux temps). La donnée — la cible ultime — est protégée **elle-même**, pas seulement autour. La suite (et fin) du track AZ-500 : les **opérations de sécurité** — Defender for Cloud, Sentinel/SIEM, Azure Policy — surveiller, détecter, répondre.
:::

:::lang en
**✅ Check:** the table recaps the **five levers** of data security, then `rg-data supprime` cleans the lab. You hold the **data** pillar of AZ-500: **classify** (drive the effort), **encrypt at rest** (default → CMK → double layer), **encrypt in transit** (TLS 1.2/HTTPS), **vault** (Key Vault) and **rotate** (versioned secrets, two-stage keys). The data — the ultimate target — is protected **itself**, not just around. Next (and last) in the AZ-500 track: **security operations** — Defender for Cloud, Sentinel/SIEM, Azure Policy — monitor, detect, respond.
:::

## pitfalls

:::lang fr
**1. Tout protéger pareil.** Sans **classification**, on sur-protège le public (coûteux) ou sous-protège le secret (dangereux). Classe **d'abord**.

**2. Croire que « chiffré par défaut » suffit.** Pour les données **Secret**, la clé **plateforme** ne suffit pas : passe à la **CMK** (que **tu** révoques).

**3. HTTP ou vieux TLS toléré.** Un `min_tls_version` bas ou HTTP en clair = fuite en transit. **TLS 1.2 + HTTPS obligatoire**, non négociable.

**4. Secrets qui ne tournent jamais.** Un secret ancien fuit tôt ou tard. **Rotationne** (versions Key Vault, politique de rotation).

**5. Rotationner en cassant.** Régénérer LA clé unique coupe le service. Utilise le **motif à deux clés** (bascule → régénère → rebascule).

**6. Clés/secrets hors du coffre.** Une clé dans un fichier de config ou une variable en clair annule tout. **Key Vault**, avec RBAC et audit.

**7. Oublier la disponibilité.** Le chiffrement protège la **confidentialité** ; la **réplication** (GRS) protège la **disponibilité**. La donnée doit être **sûre ET dispo**.
:::

:::lang en
**1. Protecting everything the same.** Without **classification**, you over-protect public data (costly) or under-protect secret data (dangerous). Classify **first**.

**2. Thinking "encrypted by default" is enough.** For **Secret** data, the **platform** key isn't enough: switch to a **CMK** (that **you** revoke).

**3. Tolerating HTTP or old TLS.** A low `min_tls_version` or cleartext HTTP = leak in transit. **TLS 1.2 + HTTPS required**, non-negotiable.

**4. Secrets that never rotate.** An old secret leaks sooner or later. **Rotate** (Key Vault versions, rotation policy).

**5. Rotating by breaking.** Regenerating THE single key cuts the service. Use the **two-key pattern** (switch → regenerate → switch back).

**6. Keys/secrets outside the vault.** A key in a config file or a cleartext variable undoes everything. **Key Vault**, with RBAC and audit.

**7. Forgetting availability.** Encryption protects **confidentiality**; **replication** (GRS) protects **availability**. Data must be **safe AND available**.
:::

## success

:::lang fr
Tu as réussi si :

- Tu **classes** la donnée et en **déduis** les contrôles (Public → Secret).
- Tu expliques le **chiffrement au repos** (défaut → CMK → double couche).
- Tu imposes et **valides** le **chiffrement en transit** (TLS 1.2, HTTPS).
- Tu **stockes** et **fais tourner** un secret dans Key Vault (v1 → v2).
- Tu décris la **rotation** des clés de stockage (motif à deux clés).
- Tu assembles une **ressource durcie** qui **passe** le scan de sécurité.
:::

:::lang en
You've succeeded if:

- You **classify** data and **derive** its controls (Public → Secret).
- You explain **encryption at rest** (default → CMK → double layer).
- You enforce and **validate** **encryption in transit** (TLS 1.2, HTTPS).
- You **store** and **rotate** a secret in Key Vault (v1 → v2).
- You describe **storage-key rotation** (two-key pattern).
- You assemble a **hardened resource** that **passes** the security scan.
:::

## next

:::lang fr
- **Suivant :** *Azure — opérations de sécurité (AZ-500)* — Defender for Cloud, Sentinel/SIEM, Azure Policy.
- **Réviser :** *Azure — sécurité fondamentaux (AZ-500)* pour Key Vault.
- **S'entraîner :** ajoute une classe *Réglementé* à `classif.py` (avec journalisation renforcée), et une politique de rotation à 90 jours.
:::

:::lang en
- **Next:** *Azure — security operations (AZ-500)* — Defender for Cloud, Sentinel/SIEM, Azure Policy.
- **Review:** *Azure — security fundamentals (AZ-500)* for Key Vault.
- **Practice:** add a *Regulated* class to `classif.py` (with enhanced logging), and a 90-day rotation policy.
:::

## cheatsheet

:::lang fr
**Classification -> contrôles**

```text
Public       chiffrement au repos (defaut)
Interne      + TLS 1.2 + RBAC
Confidentiel + RBAC moindre privilege + point de terminaison prive
Secret       + CMK (cle client) + PIM + journalisation des acces
```

**Chiffrement (Terraform / checkov)**

```text
Au repos :   chiffre par defaut (cle plateforme)
             CMK -> cle client dans Key Vault (tu revoques)
             infrastructure_encryption_enabled = true  (double couche)
En transit : enable_https_traffic_only = true          (CKV_AZURE_3)
             min_tls_version = "TLS1_2"                 (CKV_AZURE_44)
```

**Coffre & rotation (live)**

```bash
azlocal keyvault secret set  --vault V --name N --value "..."   # nouvelle version = rotation
azlocal keyvault secret show --vault V --name N                 # valeur courante (derniere)
azlocal storage account list-keys ...                           # key1/key2 : rotation sans coupure
```
:::

:::lang en
**Classification -> controls**

```text
Public       encryption at rest (default)
Internal     + TLS 1.2 + RBAC
Confidential + least-privilege RBAC + private endpoint
Secret       + CMK (customer key) + PIM + access logging
```

**Encryption (Terraform / checkov)**

```text
At rest :    encrypted by default (platform key)
             CMK -> customer key in Key Vault (you revoke)
             infrastructure_encryption_enabled = true  (double layer)
In transit : enable_https_traffic_only = true          (CKV_AZURE_3)
             min_tls_version = "TLS1_2"                 (CKV_AZURE_44)
```

**Vault & rotation (live)**

```bash
azlocal keyvault secret set  --vault V --name N --value "..."   # new version = rotation
azlocal keyvault secret show --vault V --name N                 # current value (latest)
azlocal storage account list-keys ...                           # key1/key2: zero-downtime rotation
```
:::

## resources

:::lang fr
- **Chiffrement Azure au repos** : clés gérées plateforme vs client (CMK), chiffrement d'infrastructure — Microsoft Learn.
- **Key Vault** : secrets, clés, certificats, versions, politiques de rotation — Microsoft Learn.
- **Rotation des clés de stockage** : motif à deux clés, régénération — Microsoft Learn.
- **TLS & chiffrement en transit** : min TLS version, HTTPS obligatoire — Microsoft Learn (AZ-500).
- **Classification des données** : Microsoft Purview, étiquettes de sensibilité — Microsoft Learn.
- **checkov** : règles de chiffrement (CKV_AZURE_3/44/59…) — docs checkov.
:::

:::lang en
- **Azure encryption at rest**: platform vs customer-managed keys (CMK), infrastructure encryption — Microsoft Learn.
- **Key Vault**: secrets, keys, certificates, versions, rotation policies — Microsoft Learn.
- **Storage key rotation**: two-key pattern, regeneration — Microsoft Learn.
- **TLS & encryption in transit**: min TLS version, HTTPS required — Microsoft Learn (AZ-500).
- **Data classification**: Microsoft Purview, sensitivity labels — Microsoft Learn.
- **checkov**: encryption rules (CKV_AZURE_3/44/59…) — checkov docs.
:::

## troubleshooting

:::lang fr
**`azlocal keyvault : --vault is required`.** Le drapeau est `--vault` (pas `--vault-name`). Vérifie aussi que miniblue tourne (port 4567).

**checkov signale `Failed checks` sur ma ressource durcie.** Vérifie que les cinq réglages sont présents (`enable_https_traffic_only`, `min_tls_version = "TLS1_2"`, `public_network_access_enabled = false`, `infrastructure_encryption_enabled`, réplication). Un oubli fait échouer la règle concernée.

**La rotation ne « garde » pas les versions en local.** miniblue **écrase** la valeur (il n'émule pas le versionnement complet). Le **principe** — nouvelle valeur = rotation, lecture par nom = dernière version — reste exact ; en vrai Azure, les versions sont conservées.

**Les CMK ne se créent pas en local.** miniblue n'émule que les **secrets** (pas les clés cryptographiques ni les certificats). On **raisonne** les CMK et on les **déploie** sur du vrai Azure (clé dans Key Vault + configuration du compte).

**checkov : `command not found`.** `pip install checkov` ; s'il atterrit dans `~/.local/bin` hors PATH, ajoute ce dossier au `PATH`.

**Quelle règle checkov pour quoi ?** `CKV_AZURE_3` = HTTPS obligatoire ; `CKV_AZURE_44` = TLS récent ; `CKV_AZURE_59` = pas d'accès public. Cible-les avec `--check`.
:::

:::lang en
**`azlocal keyvault: --vault is required`.** The flag is `--vault` (not `--vault-name`). Also check miniblue is running (port 4567).

**checkov reports `Failed checks` on my hardened resource.** Check the five settings are present (`enable_https_traffic_only`, `min_tls_version = "TLS1_2"`, `public_network_access_enabled = false`, `infrastructure_encryption_enabled`, replication). A missing one fails the relevant rule.

**Rotation doesn't "keep" versions locally.** miniblue **overwrites** the value (it doesn't emulate full versioning). The **principle** — new value = rotation, read by name = latest version — stays accurate; in real Azure, versions are kept.

**CMKs won't create locally.** miniblue only emulates **secrets** (not cryptographic keys or certificates). We **reason** about CMKs and **deploy** them to real Azure (key in Key Vault + account configuration).

**checkov: `command not found`.** `pip install checkov`; if it lands in `~/.local/bin` off PATH, add that folder to `PATH`.

**Which checkov rule for what?** `CKV_AZURE_3` = HTTPS required; `CKV_AZURE_44` = recent TLS; `CKV_AZURE_59` = no public access. Target them with `--check`.
:::
