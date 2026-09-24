---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-securite-operations
slug: azure-securite-operations
order: 80
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — opérations de sécurité (AZ-500) : Policy, Defender, Sentinel"
title_en: "Azure — security operations (AZ-500): Policy, Defender, Sentinel"
tagline_fr: "gouverner, mesurer la posture, détecter, chasser, répondre."
tagline_en: "govern, measure posture, detect, hunt, respond."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 260
repo: "Azure/Azure-Sentinel"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-securite-donnees]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [operations-securite, azure-policy, defender-for-cloud, secure-score, sentinel, siem, kql, detection, reponse-incident, az-500]
concepts_en: [security-operations, azure-policy, defender-for-cloud, secure-score, sentinel, siem, kql, detection, incident-response, az-500]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Les opérations de sécurité pour l'AZ-500, en local et pour de vrai : Azure Policy qui REFUSE la création de ressources non conformes (évaluateur deny exécutable + checkov en shift-left), Defender for Cloud (secure score + recommandations priorisées), la centralisation des journaux, un moteur de détection type Sentinel/SIEM (force brute, voyage impossible → incidents), une requête de chasse (analogue KQL), et un playbook de réponse automatique à incident. Gouverner, mesurer, détecter, chasser, répondre. Sans compte cloud.",
og_description_en: "Security operations for AZ-500, locally and for real: Azure Policy that DENIES creation of non-compliant resources (a runnable deny evaluator + checkov shift-left), Defender for Cloud (secure score + prioritized recommendations), log centralization, a Sentinel/SIEM-style detection engine (brute force, impossible travel → incidents), a hunting query (KQL analog), and an automated incident-response playbook. Govern, measure, detect, hunt, respond. No cloud account."
---

## intro

:::lang fr
Tu as durci l'**identité**, le **réseau** et les **données**. Reste à **opérer** la sécurité dans le temps : **gouverner** ce qui se crée, **mesurer** la posture, **détecter** les attaques, **chasser** les menaces et **répondre** aux incidents. C'est le dernier pilier **AZ-500** — celui qui transforme des contrôles statiques en une **défense vivante**.

Fidèle à la méthode, on pratique **en local et pour de vrai** : on écrit un évaluateur **Azure Policy** qui **refuse** (deny) la création de ressources non conformes, on calcule un **secure score** avec des **recommandations priorisées** (Defender for Cloud), on **centralise** des journaux, on écrit un **moteur de détection** type **Sentinel/SIEM** qui repère **force brute** et **voyage impossible** et **lève des incidents**, on écrit une **requête de chasse** (analogue **KQL**), et on **répond** avec un **playbook automatique**.

**Pour qui c'est :** tu as les trois piliers techniques (identité, réseau, données) et tu veux les **opérer**.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas les bases → fais les guides AZ-500 précédents.
- Tu veux le **SOC** organisationnel (processus, astreintes) → ici c'est la **mécanique** technique (détection, réponse).
:::

:::lang en
You've hardened **identity**, **network** and **data**. What remains is to **operate** security over time: **govern** what gets created, **measure** posture, **detect** attacks, **hunt** threats and **respond** to incidents. It's the last **AZ-500** pillar — the one that turns static controls into a **living defense**.

True to the method, we practice **locally and for real**: we write an **Azure Policy** evaluator that **denies** creation of non-compliant resources, we compute a **secure score** with **prioritized recommendations** (Defender for Cloud), we **centralize** logs, we write a **Sentinel/SIEM-style detection engine** that spots **brute force** and **impossible travel** and **raises incidents**, we write a **hunting query** (**KQL** analog), and we **respond** with an **automated playbook**.

**Who it's for:** you have the three technical pillars (identity, network, data) and want to **operate** them.

**When it's NOT the right choice:**

- You lack the basics → do the previous AZ-500 guides.
- You want the organizational **SOC** (processes, on-call) → here it's the technical **mechanics** (detection, response).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Écrire une **Azure Policy** qui **refuse** (deny) une ressource non conforme.
- Distinguer **prévention** (Policy, à la création) et **shift-left** (checkov, avant).
- Calculer un **secure score** et **prioriser** les recommandations (Defender).
- **Centraliser** des journaux de sécurité (Log Analytics).
- Écrire des **règles de détection** (Sentinel) — force brute, voyage impossible.
- Écrire une **requête de chasse** (KQL) sur les journaux.
- **Répondre** à un incident avec un **playbook** automatique.
:::

:::lang en
By the end of this guide, you can:

- Write an **Azure Policy** that **denies** a non-compliant resource.
- Distinguish **prevention** (Policy, at creation) and **shift-left** (checkov, before).
- Compute a **secure score** and **prioritize** recommendations (Defender).
- **Centralize** security logs (Log Analytics).
- Write **detection rules** (Sentinel) — brute force, impossible travel.
- Write a **hunting query** (KQL) over the logs.
- **Respond** to an incident with an automated **playbook**.
:::

## prerequisites

:::lang fr
- Les guides **Azure — sécurité fondamentaux / identité / réseau / données (AZ-500)**.
- Le **lab local** : **Python 3** (moteurs de détection/policy/réponse), `checkov` (`pip install checkov`), **miniblue** optionnel.
- **Aucun compte cloud** : Policy, Defender, Sentinel et playbook sont des **moteurs exécutables** en local.
:::

:::lang en
- The **Azure — security fundamentals / identity / network / data (AZ-500)** guides.
- The **local lab**: **Python 3** (detection/policy/response engines), `checkov` (`pip install checkov`), **miniblue** optional.
- **No cloud account**: Policy, Defender, Sentinel and playbook are **runnable engines** locally.
:::

## concepts

:::lang fr
**Gouverner : Azure Policy.** Une **politique** définit une **règle** sur les ressources et un **effet** : **Audit** (signaler la non-conformité), **Deny** (**refuser** la création), **DeployIfNotExists** (corriger automatiquement). Contrairement à un scan qui **constate**, une politique **Deny empêche** une ressource non conforme d'**exister** — c'est la **prévention côté plateforme**. Complément du **shift-left** (checkov, avant le déploiement), Policy est le **garde-fou côté Azure**.

**Mesurer : Defender for Cloud.** **Microsoft Defender for Cloud** évalue en continu ta posture et produit un **secure score** (%) avec des **recommandations priorisées** par sévérité. Il détecte aussi des menaces sur les ressources (comportements suspects). Le secure score est ta **boussole** : il monte quand tu appliques les recommandations, il baisse quand la posture dérive.

**Centraliser : Log Analytics.** On ne peut détecter que ce qu'on **voit**. **Log Analytics** ingère les journaux (connexions, ressources, réseau) dans un **espace de travail** unique, interrogeable en **KQL**. Sans centralisation, chaque service a ses logs dans son coin — invisibles pour la corrélation.

**Détecter : Sentinel (SIEM/SOAR).** **Microsoft Sentinel** est le **SIEM** natif : il corrèle les journaux avec des **règles de détection** (analytics) et **lève des incidents**. Exemples classiques : **force brute** (beaucoup d'échecs puis un succès), **voyage impossible** (deux connexions réussies depuis deux pays éloignés en peu de temps), **élévation de privilège** inattendue. Chaque règle transforme des **événements bruts** en **alerte actionnable**.

**Chasser : KQL.** La **chasse aux menaces** (threat hunting) est **proactive** : au lieu d'attendre une alerte, on **interroge** les journaux à la recherche d'indices (top des IP par échecs, comptes inhabituels, accès hors horaires). Le langage est **KQL** (Kusto) : `SigninLogs | where Result == "echec" | summarize count() by ip | order by count_ desc`.

**Répondre : SOAR & playbooks.** Détecter ne suffit pas — il faut **réagir vite**. Un **playbook** (automation Sentinel/Logic App) exécute une **réponse automatique** à un incident : désactiver un compte, révoquer des sessions, bloquer une IP, notifier le SOC. C'est le **R** de **SOAR** (Security Orchestration, Automation and Response) : réduire le **MTTR** (temps de réponse).

**Ce qui est live ici.** Tous les moteurs — **Policy (deny)**, **secure score**, **détection**, **chasse (KQL analog)**, **playbook** — sont **exécutables** en Python : de **vraies** décisions reproduisant la logique d'Azure. **checkov** ajoute le **shift-left** réel (offline). Les services managés (Defender, Sentinel) se **raisonnent** ; leur **logique** est ici **jouée pour de vrai**. Sans compte cloud.
:::

:::lang en
**Govern: Azure Policy.** A **policy** defines a **rule** on resources and an **effect**: **Audit** (flag non-compliance), **Deny** (**refuse** creation), **DeployIfNotExists** (auto-remediate). Unlike a scan that **observes**, a **Deny** policy **prevents** a non-compliant resource from **existing** — it's **platform-side prevention**. Complementing **shift-left** (checkov, before deployment), Policy is the **Azure-side guardrail**.

**Measure: Defender for Cloud.** **Microsoft Defender for Cloud** continuously evaluates your posture and produces a **secure score** (%) with **recommendations prioritized** by severity. It also detects threats on resources (suspicious behaviors). The secure score is your **compass**: it rises when you apply recommendations, drops when posture drifts.

**Centralize: Log Analytics.** You can only detect what you **see**. **Log Analytics** ingests logs (sign-ins, resources, network) into a single **workspace**, queryable in **KQL**. Without centralization, each service has its logs in its corner — invisible for correlation.

**Detect: Sentinel (SIEM/SOAR).** **Microsoft Sentinel** is the native **SIEM**: it correlates logs with **detection rules** (analytics) and **raises incidents**. Classic examples: **brute force** (many failures then a success), **impossible travel** (two successful sign-ins from two distant countries in a short time), unexpected **privilege escalation**. Each rule turns **raw events** into an **actionable alert**.

**Hunt: KQL.** **Threat hunting** is **proactive**: instead of waiting for an alert, you **query** the logs for clues (top IPs by failures, unusual accounts, off-hours access). The language is **KQL** (Kusto): `SigninLogs | where Result == "echec" | summarize count() by ip | order by count_ desc`.

**Respond: SOAR & playbooks.** Detecting isn't enough — you must **react fast**. A **playbook** (Sentinel automation/Logic App) runs an **automated response** to an incident: disable an account, revoke sessions, block an IP, notify the SOC. It's the **R** of **SOAR** (Security Orchestration, Automation and Response): reducing the **MTTR** (response time).

**What's live here.** All the engines — **Policy (deny)**, **secure score**, **detection**, **hunting (KQL analog)**, **playbook** — are **runnable** in Python: **real** decisions reproducing Azure's logic. **checkov** adds real **shift-left** (offline). The managed services (Defender, Sentinel) are **reasoned**; their **logic** is here **played for real**. No cloud account.
:::

:::figure azure-securite-operations-cycle
caption_fr: "Schéma 1. Le cycle des opérations de sécurité : GOUVERNER (Azure Policy refuse le non-conforme + checkov en shift-left) → MESURER (Defender for Cloud : secure score + recommandations priorisées) → CENTRALISER (Log Analytics : tous les journaux) → DÉTECTER (Sentinel/SIEM : règles → incidents) → CHASSER (requêtes KQL proactives) → RÉPONDRE (playbook SOAR : désactiver, révoquer, bloquer, notifier). Une boucle continue : la réponse et la chasse nourrissent de nouvelles règles."
caption_en: "Figure 1. The security operations cycle: GOVERN (Azure Policy denies the non-compliant + checkov shift-left) → MEASURE (Defender for Cloud: secure score + prioritized recommendations) → CENTRALIZE (Log Analytics: all logs) → DETECT (Sentinel/SIEM: rules → incidents) → HUNT (proactive KQL queries) → RESPOND (SOAR playbook: disable, revoke, block, notify). A continuous loop: response and hunting feed new rules."
:::

## walkthrough

:::lang fr
On avance ainsi : gouverner (Azure Policy deny) → mesurer (secure score) → centraliser les journaux → détecter (Sentinel) → chasser (KQL) → répondre (playbook) → cycle SecOps assemblé.
:::

:::lang en
We'll go like this: govern (Azure Policy deny) → measure (secure score) → centralize logs → detect (Sentinel) → hunt (KQL) → respond (playbook) → SecOps cycle assembled.
:::

### step-01

:::lang fr
**Objectif.** **Gouverner** avec **Azure Policy** — refuser (deny) le non-conforme.

**🤔 Empêcher d'exister, pas seulement signaler.** Un scan **constate** ; une **politique Deny** **empêche** la création d'une ressource non conforme. On écrit un évaluateur de politiques (HTTPS obligatoire, TLS 1.2, région UE) et on lui soumet des ressources.

Écris l'évaluateur de politiques et teste-le :
:::

:::lang en
**Goal.** **Govern** with **Azure Policy** — deny the non-compliant.

**🤔 Prevent existence, not just flag.** A scan **observes**; a **Deny** policy **prevents** creating a non-compliant resource. We write a policy evaluator (HTTPS required, TLS 1.2, EU region) and feed it resources.

Write the policy evaluator and test it:
:::

```bash
mkdir -p secops && cd secops
cat > policy.py <<'PY'
# Azure Policy : REFUSER (deny) la creation de ressources non conformes
POLITIQUES = [
    ("Refuser stockage sans HTTPS", lambda r: r.get("https_only") is True),
    ("Refuser TLS < 1.2",           lambda r: r.get("tls") == "1.2"),
    ("Refuser emplacement hors UE",  lambda r: r.get("region") in ("westeurope", "northeurope", "francecentral")),
]
def evaluer(ressource):
    for nom, regle in POLITIQUES:
        if not regle(ressource):
            return "DENY", nom
    return "ALLOW", None

ressources = [
    {"nom": "st-conforme", "https_only": True,  "tls": "1.2", "region": "francecentral"},
    {"nom": "st-http",     "https_only": False, "tls": "1.2", "region": "westeurope"},
    {"nom": "st-hors-ue",  "https_only": True,  "tls": "1.2", "region": "eastus"},
]
for r in ressources:
    dec, motif = evaluer(r)
    print(f"{r['nom']:14} -> {dec}" + (f" (viole: {motif})" if motif else ""))
PY
python3 policy.py
```

:::lang fr
**✅ Vérification :** la sortie affiche `st-conforme -> ALLOW`, `st-http -> DENY (viole: Refuser stockage sans HTTPS)`, `st-hors-ue -> DENY (viole: Refuser emplacement hors UE)`. La politique **refuse** ce qui viole une règle — la ressource ne peut **pas être créée**. C'est la différence clé avec un **scan** (checkov, qui **signale** avant le déploiement, en *shift-left*) : Azure Policy **empêche** côté plateforme, **à la création**. Les deux se combinent : **checkov en CI** (tôt) **et** **Policy en prod** (garde-fou permanent). On mesure maintenant la **posture globale**.
:::

:::lang en
**✅ Check:** the output shows `st-conforme -> ALLOW`, `st-http -> DENY (viole: Refuser stockage sans HTTPS)`, `st-hors-ue -> DENY (viole: Refuser emplacement hors UE)`. The policy **denies** what violates a rule — the resource **can't be created**. That's the key difference from a **scan** (checkov, which **flags** before deployment, *shift-left*): Azure Policy **prevents** platform-side, **at creation**. Both combine: **checkov in CI** (early) **and** **Policy in prod** (permanent guardrail). We now measure the **overall posture**.
:::

### step-02

:::lang fr
**Objectif.** **Mesurer** la posture — secure score et **recommandations priorisées** (Defender).

**🤔 Une boussole chiffrée.** Defender for Cloud note ta posture (%) et **priorise** les corrections par **sévérité**. On écrit un moteur qui calcule le score et **trie** les recommandations (Haute d'abord).

Calcule le secure score et priorise :
:::

:::lang en
**Goal.** **Measure** posture — secure score and **prioritized recommendations** (Defender).

**🤔 A quantified compass.** Defender for Cloud rates your posture (%) and **prioritizes** fixes by **severity**. We write an engine that computes the score and **sorts** recommendations (High first).

Compute the secure score and prioritize:
:::

```bash
cat > defender.py <<'PY'
# Defender for Cloud : posture -> secure score + recommandations priorisees
controles = [
    {"nom": "MFA active pour les admins",          "ok": True,  "severite": "Haute"},
    {"nom": "Chiffrement au repos (stockage)",     "ok": True,  "severite": "Haute"},
    {"nom": "Points de terminaison prives (PaaS)", "ok": False, "severite": "Haute"},
    {"nom": "Journalisation activee",              "ok": True,  "severite": "Moyenne"},
    {"nom": "Comptes sans activite desactives",    "ok": False, "severite": "Moyenne"},
]
ok = sum(c["ok"] for c in controles)
print(f"Secure score : {ok}/{len(controles)} = {100*ok//len(controles)}%")
recos = sorted([c for c in controles if not c["ok"]], key=lambda c: 0 if c["severite"] == "Haute" else 1)
print("Recommandations priorisees :")
for c in recos:
    print(f"  [{c['severite']:7}] {c['nom']}")
PY
python3 defender.py
```

:::lang fr
**✅ Vérification :** la sortie affiche `Secure score : 3/5 = 60%`, puis les **recommandations priorisées** : `[Haute] Points de terminaison prives (PaaS)` **avant** `[Moyenne] Comptes sans activite desactives`. Defender te donne un **cap** : corrige les recommandations **Haute** d'abord, ton score **monte**, ta surface d'attaque **baisse**. C'est le pilotage **continu** de la posture — pas un audit ponctuel. Mais un score suppose qu'on **voie** ce qui se passe : il faut **centraliser les journaux**.
:::

:::lang en
**✅ Check:** the output shows `Secure score : 3/5 = 60%`, then the **prioritized recommendations**: `[Haute] Points de terminaison prives (PaaS)` **before** `[Moyenne] Comptes sans activite desactives`. Defender gives you a **heading**: fix **High** recommendations first, your score **rises**, your attack surface **drops**. It's **continuous** posture steering — not a one-off audit. But a score assumes you **see** what happens: you must **centralize the logs**.
:::

### step-03

:::lang fr
**Objectif.** **Centraliser** les journaux — la matière première de la détection.

**🤔 On ne détecte que ce qu'on voit.** Sans journaux centralisés, pas de corrélation. On rassemble des **journaux d'authentification structurés** (user, IP, pays, résultat) — ce que **Log Analytics** ingérerait — et on les prépare pour l'analyse.

Centralise les journaux d'authentification :
:::

:::lang en
**Goal.** **Centralize** logs — the raw material of detection.

**🤔 You only detect what you see.** Without centralized logs, no correlation. We gather **structured auth logs** (user, IP, country, result) — what **Log Analytics** would ingest — and prepare them for analysis.

Centralize the auth logs:
:::

```bash
cat > journaux.json <<'JSON'
[
  {"user":"alice","ip":"1.2.3.4","pays":"FR","result":"echec","t":1},
  {"user":"alice","ip":"1.2.3.4","pays":"FR","result":"echec","t":2},
  {"user":"alice","ip":"1.2.3.4","pays":"FR","result":"echec","t":3},
  {"user":"alice","ip":"1.2.3.4","pays":"FR","result":"echec","t":4},
  {"user":"alice","ip":"1.2.3.4","pays":"FR","result":"echec","t":5},
  {"user":"alice","ip":"1.2.3.4","pays":"FR","result":"succes","t":6},
  {"user":"bob","ip":"5.6.7.8","pays":"FR","result":"succes","t":1},
  {"user":"bob","ip":"9.9.9.9","pays":"RU","result":"succes","t":2}
]
JSON

python3 -c "
import json
logs = json.load(open('journaux.json'))
print('journaux centralises / centralized logs:', len(logs), 'evenements')
print('  echecs / failures :', sum(1 for e in logs if e['result']=='echec'))
print('  succes / success  :', sum(1 for e in logs if e['result']=='succes'))
print('  utilisateurs      :', sorted(set(e['user'] for e in logs)))
"
```

:::lang fr
**✅ Vérification :** la sortie confirme `journaux centralises : 8 evenements`, avec `echecs : 5`, `succes : 3` et les utilisateurs `['alice', 'bob']`. Ces journaux **structurés** (champs clairs) sont **interrogeables** — comme dans Log Analytics. On y voit déjà des **signaux** : cinq échecs pour `alice`, deux connexions de `bob` depuis des pays différents. Ce sont les **règles de détection** qui vont transformer ces signaux bruts en **incidents**.
:::

:::lang en
**✅ Check:** the output confirms `journaux centralises : 8 evenements`, with `echecs : 5`, `succes : 3` and users `['alice', 'bob']`. These **structured** logs (clear fields) are **queryable** — as in Log Analytics. You can already see **signals**: five failures for `alice`, two sign-ins for `bob` from different countries. The **detection rules** will turn these raw signals into **incidents**.
:::

### step-04

:::lang fr
**Objectif.** **Détecter** — des règles Sentinel qui lèvent des **incidents**.

**🤔 Transformer les signaux en alertes.** On écrit deux **règles de détection** classiques : **force brute** (≥ 5 échecs puis succès) et **voyage impossible** (succès depuis deux pays). Chaque règle **corrèle** les journaux et **lève un incident**.

Écris les règles de détection et lance-les :
:::

:::lang en
**Goal.** **Detect** — Sentinel rules that raise **incidents**.

**🤔 Turn signals into alerts.** We write two classic **detection rules**: **brute force** (≥ 5 failures then success) and **impossible travel** (success from two countries). Each rule **correlates** the logs and **raises an incident**.

Write the detection rules and run them:
:::

```bash
cat > detection.py <<'PY'
import json
from collections import defaultdict
logs = json.load(open("journaux.json"))
incidents = []

# Regle 1 : force brute (>= 5 echecs puis un succes pour un meme user)
echecs = defaultdict(int)
for e in logs:
    if e["result"] == "echec":
        echecs[e["user"]] += 1
    elif e["result"] == "succes" and echecs[e["user"]] >= 5:
        incidents.append(("Force brute", e["user"], f"{echecs[e['user']]} echecs puis succes"))

# Regle 2 : voyage impossible (2 succes depuis 2 pays)
vu = {}
for e in logs:
    if e["result"] == "succes":
        if e["user"] in vu and vu[e["user"]] != e["pays"]:
            incidents.append(("Voyage impossible", e["user"], f"{vu[e['user']]} -> {e['pays']}"))
        vu[e["user"]] = e["pays"]

print(f"INCIDENTS detectes : {len(incidents)}")
for typ, user, det in incidents:
    print(f"  🚨 {typ:18} user={user:6} ({det})")
PY
python3 detection.py
```

:::lang fr
**✅ Vérification :** la sortie affiche `INCIDENTS detectes : 2`, puis `🚨 Force brute user=alice (5 echecs puis succes)` et `🚨 Voyage impossible user=bob (FR -> RU)`. Les règles ont **corrélé** les journaux bruts en **incidents actionnables** : une attaque par force brute réussie sur `alice`, et une connexion `bob` géographiquement **impossible** (FR puis RU en un instant → identifiants probablement volés). C'est le cœur d'un **SIEM** : pas juste stocker des logs, mais en **extraire du sens**. On peut aussi **chasser** proactivement.
:::

:::lang en
**✅ Check:** the output shows `INCIDENTS detectes : 2`, then `🚨 Force brute user=alice (5 echecs puis succes)` and `🚨 Voyage impossible user=bob (FR -> RU)`. The rules **correlated** raw logs into **actionable incidents**: a successful brute-force attack on `alice`, and a geographically **impossible** `bob` sign-in (FR then RU in an instant → likely stolen credentials). That's the heart of a **SIEM**: not just storing logs, but **extracting meaning**. You can also **hunt** proactively.
:::

### step-05

:::lang fr
**Objectif.** **Chasser** les menaces — une requête **KQL** proactive.

**🤔 Ne pas attendre l'alerte.** La **chasse** interroge les journaux **à la recherche** d'indices, sans attendre qu'une règle se déclenche. On écrit une requête (top des IP par échecs) et sa version **KQL** — le langage de Sentinel/Log Analytics.

Chasse les IP suspectes :
:::

:::lang en
**Goal.** **Hunt** threats — a proactive **KQL** query.

**🤔 Don't wait for the alert.** **Hunting** queries the logs **looking** for clues, without waiting for a rule to fire. We write a query (top IPs by failures) and its **KQL** version — Sentinel/Log Analytics's language.

Hunt suspicious IPs:
:::

```bash
python3 -c "
import json
from collections import Counter
logs = json.load(open('journaux.json'))

# La MEME logique en KQL (Sentinel / Log Analytics) :
print('--- requete de chasse (KQL) / hunting query (KQL) ---')
print('SigninLogs')
print('| where Result == \"echec\"')
print('| summarize echecs = count() by ip')
print('| order by echecs desc')
print('--- resultat / result ---')
echecs = Counter(e['ip'] for e in logs if e['result']=='echec')
for ip, n in echecs.most_common():
    print(f'  {ip:12} {n} echecs')
"
```

:::lang fr
**✅ Vérification :** la sortie montre la **requête KQL** (`SigninLogs | where Result == "echec" | summarize count() by ip | order by ... desc`) puis son **résultat** : `1.2.3.4  5 echecs` en tête. La chasse **révèle** l'IP la plus agressive **avant** même qu'une règle ne se soit peut-être déclenchée — utile pour repérer les attaques **lentes** ou **nouvelles** que les règles ne couvrent pas encore. En vrai Azure, ces requêtes **KQL** s'exécutent sur **Log Analytics** ; ici, on reproduit **exactement** leur logique. Reste à **répondre**.
:::

:::lang en
**✅ Check:** the output shows the **KQL query** (`SigninLogs | where Result == "echec" | summarize count() by ip | order by ... desc`) then its **result**: `1.2.3.4  5 echecs` on top. Hunting **reveals** the most aggressive IP **before** a rule may have even fired — useful to spot **slow** or **novel** attacks the rules don't cover yet. In real Azure, these **KQL** queries run on **Log Analytics**; here we reproduce **exactly** their logic. Now to **respond**.
:::

### step-06

:::lang fr
**Objectif.** **Répondre** — un playbook automatique (SOAR).

**🤔 Détecter puis agir, vite.** Un **playbook** exécute une **réponse automatique** à un incident, pour réduire le **MTTR**. On écrit un playbook qui, selon le type d'incident, **désactive** le compte, **révoque** les sessions, **bloque** l'IP et **notifie**.

Écris le playbook et déclenche-le sur un incident :
:::

:::lang en
**Goal.** **Respond** — an automated playbook (SOAR).

**🤔 Detect then act, fast.** A **playbook** runs an **automated response** to an incident, to reduce the **MTTR**. We write a playbook that, by incident type, **disables** the account, **revokes** sessions, **blocks** the IP and **notifies**.

Write the playbook and trigger it on an incident:
:::

```bash
cat > playbook.py <<'PY'
# Playbook de reponse automatique (SOAR / Sentinel automation)
def repondre(incident):
    typ, user = incident["type"], incident["user"]
    actions = []
    if typ == "Force brute":
        actions += [f"desactiver temporairement le compte {user}", "exiger reinitialisation MDP + MFA", "bloquer l'IP source"]
    elif typ == "Voyage impossible":
        actions += [f"revoquer les sessions de {user}", "exiger re-authentification MFA", "notifier le SOC"]
    return actions

for inc in [{"type": "Force brute", "user": "alice"}, {"type": "Voyage impossible", "user": "bob"}]:
    print(f"Incident: {inc['type']} ({inc['user']}) -> reponse automatique :")
    for a in repondre(inc):
        print(f"  -> {a}")
PY
python3 playbook.py
```

:::lang fr
**✅ Vérification :** pour l'incident **Force brute (alice)**, le playbook **désactive le compte**, **exige MDP + MFA** et **bloque l'IP** ; pour **Voyage impossible (bob)**, il **révoque les sessions**, **exige la ré-authentification MFA** et **notifie le SOC**. La réponse est **immédiate et automatique** — pas d'attente d'un humain à 3 h du matin. C'est le **R** de **SOAR** : le **MTTR** chute. En vrai Azure, ce playbook est une **Logic App** déclenchée par l'alerte Sentinel. Tu as bouclé le **cycle SecOps** : gouverner → mesurer → détecter → chasser → répondre. On récapitule.
:::

:::lang en
**✅ Check:** for the **Force brute (alice)** incident, the playbook **disables the account**, **requires password + MFA** and **blocks the IP**; for **Voyage impossible (bob)**, it **revokes sessions**, **requires MFA re-auth** and **notifies the SOC**. The response is **immediate and automatic** — no waiting for a human at 3am. That's the **R** of **SOAR**: **MTTR** drops. In real Azure, this playbook is a **Logic App** triggered by the Sentinel alert. You closed the **SecOps cycle**: govern → measure → detect → hunt → respond. Let's recap.
:::

### step-07

:::lang fr
**Objectif.** Assembler le **cycle SecOps** — et clore le track AZ-500.

**🤔 Une boucle vivante.** On récapitule les six maillons des opérations de sécurité, qui forment un **cycle continu** : ce qu'on découvre en chasse et en réponse **nourrit** de nouvelles règles et politiques.

Récapitule le cycle SecOps :
:::

:::lang en
**Goal.** Assemble the **SecOps cycle** — and close the AZ-500 track.

**🤔 A living loop.** We recap the six links of security operations, which form a **continuous cycle**: what you discover in hunting and response **feeds** new rules and policies.

Recap the SecOps cycle:
:::

```bash
echo "=== Cycle des operations de securite / security operations cycle ==="
printf "%-14s %s\n" "1. GOUVERNER" "Azure Policy (deny non-conforme) + checkov (shift-left)"
printf "%-14s %s\n" "2. MESURER"   "Defender for Cloud (secure score + recommandations)"
printf "%-14s %s\n" "3. CENTRALISER" "Log Analytics (tous les journaux, interrogeables KQL)"
printf "%-14s %s\n" "4. DETECTER"  "Sentinel/SIEM (regles -> incidents)"
printf "%-14s %s\n" "5. CHASSER"   "KQL proactif (menaces lentes/nouvelles)"
printf "%-14s %s\n" "6. REPONDRE"  "Playbook SOAR (desactiver/revoquer/bloquer/notifier)"
echo "-> boucle : chasse + reponse nourrissent de nouvelles regles et politiques."
```

:::lang fr
**✅ Vérification :** la table récapitule les **six maillons** — gouverner, mesurer, centraliser, détecter, chasser, répondre — reliés en **boucle continue**. Tu tiens le pilier **opérations** de l'AZ-500, et avec lui **tout le track de sécurité** : fondamentaux (Zero Trust), **identité** (RBAC/PIM), **réseau** (segmentation/WAF), **données** (chiffrement/rotation) et **opérations** (Policy/Defender/Sentinel). La sécurité n'est plus une case cochée mais une **pratique vivante** : on gouverne ce qui se crée, on mesure la posture, et on détecte-chasse-répond en continu. **Félicitations — tu as terminé le track AZ-500 !** Il ne reste que le **projet de synthèse** pour l'emballage CV.
:::

:::lang en
**✅ Check:** the table recaps the **six links** — govern, measure, centralize, detect, hunt, respond — connected in a **continuous loop**. You hold the **operations** pillar of AZ-500, and with it **the whole security track**: fundamentals (Zero Trust), **identity** (RBAC/PIM), **network** (segmentation/WAF), **data** (encryption/rotation) and **operations** (Policy/Defender/Sentinel). Security is no longer a checkbox but a **living practice**: you govern what gets created, measure posture, and detect-hunt-respond continuously. **Congratulations — you finished the AZ-500 track!** Only the capstone **project** remains, for CV packaging.
:::

## pitfalls

:::lang fr
**1. Auditer sans refuser.** Une politique en **Audit** signale mais **laisse passer**. Pour ce qui est critique, utilise **Deny** (empêcher la création).

**2. Scanner OU gouverner.** checkov (shift-left) **et** Azure Policy (plateforme) sont **complémentaires**, pas alternatifs. Les deux.

**3. Mesurer sans agir.** Un secure score qu'on ne fait pas **monter** ne sert à rien. Corrige les recommandations **Haute** d'abord.

**4. Logs éparpillés.** Sans **centralisation** (Log Analytics), pas de corrélation ni de détection. Rassemble d'abord.

**5. Détecter sans répondre.** Une alerte sans **playbook** attend un humain — le MTTR explose. Automatise la réponse (SOAR).

**6. Que du réactif.** Attendre les alertes rate les attaques lentes/nouvelles. **Chasse** proactivement (KQL).

**7. Boucle ouverte.** Ce que tu apprends en incident doit **nourrir** de nouvelles règles/politiques. Sinon tu re-subis la même attaque.
:::

:::lang en
**1. Auditing without denying.** An **Audit** policy flags but **lets it through**. For the critical, use **Deny** (prevent creation).

**2. Scan OR govern.** checkov (shift-left) **and** Azure Policy (platform) are **complementary**, not alternatives. Both.

**3. Measuring without acting.** A secure score you don't **raise** is useless. Fix **High** recommendations first.

**4. Scattered logs.** Without **centralization** (Log Analytics), no correlation or detection. Gather first.

**5. Detecting without responding.** An alert with no **playbook** waits for a human — MTTR explodes. Automate the response (SOAR).

**6. Reactive only.** Waiting for alerts misses slow/novel attacks. **Hunt** proactively (KQL).

**7. Open loop.** What you learn in an incident must **feed** new rules/policies. Otherwise you suffer the same attack again.
:::

## success

:::lang fr
Tu as réussi si :

- Tu écris une **Azure Policy** qui **refuse** (deny) le non-conforme, et la distingues d'un **scan** (checkov).
- Tu calcules un **secure score** et **priorises** les recommandations.
- Tu **centralises** des journaux structurés.
- Tu écris des **règles de détection** (force brute, voyage impossible) qui **lèvent des incidents**.
- Tu écris une **requête de chasse** KQL.
- Tu écris un **playbook** de réponse automatique et fermes la **boucle SecOps**.
:::

:::lang en
You've succeeded if:

- You write an **Azure Policy** that **denies** the non-compliant, and distinguish it from a **scan** (checkov).
- You compute a **secure score** and **prioritize** recommendations.
- You **centralize** structured logs.
- You write **detection rules** (brute force, impossible travel) that **raise incidents**.
- You write a KQL **hunting query**.
- You write an automated response **playbook** and close the **SecOps loop**.
:::

## next

:::lang fr
- **Suivant :** *Azure — projet de sécurité (AZ-500)* — le projet de synthèse : durcir et opérer un workload de bout en bout.
- **Réviser :** n'importe quel guide AZ-500 dont un pilier t'a semblé fragile.
- **S'entraîner :** ajoute une règle de détection (accès hors horaires) et son playbook, et une politique **Deny** sur une balise (tag) obligatoire.
:::

:::lang en
- **Next:** *Azure — security project (AZ-500)* — the capstone: harden and operate a workload end to end.
- **Review:** any AZ-500 guide whose pillar felt shaky.
- **Practice:** add a detection rule (off-hours access) and its playbook, and a **Deny** policy on a required tag.
:::

## cheatsheet

:::lang fr
**Le cycle SecOps**

```text
1. GOUVERNER   Azure Policy : Audit (signaler) / Deny (refuser) / DeployIfNotExists
               + checkov (shift-left, en CI)
2. MESURER     Defender for Cloud : secure score % + recommandations par severite
3. CENTRALISER Log Analytics : journaux dans un espace unique, interrogeable KQL
4. DETECTER    Sentinel : regles d'analyse -> incidents (force brute, voyage impossible)
5. CHASSER     KQL proactif : SigninLogs | where ... | summarize count() by ...
6. REPONDRE    Playbook SOAR : desactiver / revoquer / bloquer / notifier
```

**KQL (essentiel)**

```text
Table | where <condition> | summarize <agg> by <colonne> | order by <col> desc
# ex : SigninLogs | where Result=="echec" | summarize c=count() by ip | order by c desc
```

**Deny vs Audit vs shift-left**

```text
checkov     : AVANT le deploiement (CI) -> bloque la fusion
Azure Deny  : A la creation (plateforme) -> empeche d'exister
Azure Audit : signale la non-conformite (n'empeche pas)
```
:::

:::lang en
**The SecOps cycle**

```text
1. GOVERN      Azure Policy: Audit (flag) / Deny (refuse) / DeployIfNotExists
               + checkov (shift-left, in CI)
2. MEASURE     Defender for Cloud: secure score % + recommendations by severity
3. CENTRALIZE  Log Analytics: logs in one workspace, KQL-queryable
4. DETECT      Sentinel: analytics rules -> incidents (brute force, impossible travel)
5. HUNT        proactive KQL: SigninLogs | where ... | summarize count() by ...
6. RESPOND     SOAR playbook: disable / revoke / block / notify
```

**KQL (essentials)**

```text
Table | where <condition> | summarize <agg> by <column> | order by <col> desc
# e.g. SigninLogs | where Result=="echec" | summarize c=count() by ip | order by c desc
```

**Deny vs Audit vs shift-left**

```text
checkov     : BEFORE deployment (CI) -> blocks the merge
Azure Deny  : at creation (platform) -> prevents existence
Azure Audit : flags non-compliance (doesn't prevent)
```
:::

## resources

:::lang fr
- **Azure Policy** : définitions, effets (Audit/Deny/DINE), initiatives — Microsoft Learn.
- **Microsoft Defender for Cloud** : secure score, recommandations, protection des charges — Microsoft Learn.
- **Microsoft Sentinel** : SIEM/SOAR, règles d'analyse, incidents, playbooks — Microsoft Learn (AZ-500).
- **KQL (Kusto Query Language)** : requêtes, opérateurs, chasse aux menaces — Microsoft Learn.
- **Log Analytics** : espaces de travail, ingestion, requêtes — Microsoft Learn.
- **checkov** : policy-as-code shift-left (complément d'Azure Policy) — docs checkov.
:::

:::lang en
- **Azure Policy**: definitions, effects (Audit/Deny/DINE), initiatives — Microsoft Learn.
- **Microsoft Defender for Cloud**: secure score, recommendations, workload protection — Microsoft Learn.
- **Microsoft Sentinel**: SIEM/SOAR, analytics rules, incidents, playbooks — Microsoft Learn (AZ-500).
- **KQL (Kusto Query Language)**: queries, operators, threat hunting — Microsoft Learn.
- **Log Analytics**: workspaces, ingestion, queries — Microsoft Learn.
- **checkov**: shift-left policy-as-code (complements Azure Policy) — checkov docs.
:::

## troubleshooting

:::lang fr
**Les scripts Python n'affichent rien.** Lance `python3 fichier.py` depuis le dossier `secops`. Chaque script est autonome ; `detection.py`, `hunt` et l'analyse lisent `journaux.json` (créé au step-03).

**`FileNotFoundError: journaux.json` (step-04/05).** Le step-03 doit avoir créé le fichier dans le **même dossier**. Vérifie ton `cd secops` et relance le step-03.

**Ma règle de détection ne lève rien.** Vérifie le **seuil** (≥ 5 échecs) et l'**ordre** des événements (les échecs **avant** le succès). La logique dépend de la séquence temporelle (`t`).

**Deny vs Audit : lequel choisir ?** **Deny** pour ce qui est **critique** (empêcher d'exister). **Audit** pour **cartographier** la non-conformité sans casser l'existant, avant de durcir en Deny.

**checkov et Azure Policy font-ils double emploi ?** Non — **complémentaires** : checkov **en CI** (tôt, sur le code) ; Azure Policy **en prod** (permanent, sur la plateforme). Utilise les deux.

**Le playbook n'agit pas « vraiment ».** Ici il **imprime** les actions (démonstration de la logique). En vrai Azure, c'est une **Logic App** qui appelle les API (désactiver un compte, bloquer une IP) — même orchestration.
:::

:::lang en
**The Python scripts print nothing.** Run `python3 file.py` from the `secops` folder. Each script is standalone; `detection.py`, `hunt` and the analysis read `journaux.json` (created in step-03).

**`FileNotFoundError: journaux.json` (step-04/05).** step-03 must have created the file in the **same folder**. Check your `cd secops` and re-run step-03.

**My detection rule raises nothing.** Check the **threshold** (≥ 5 failures) and the **order** of events (failures **before** the success). The logic depends on the temporal sequence (`t`).

**Deny vs Audit: which to choose?** **Deny** for the **critical** (prevent existence). **Audit** to **map** non-compliance without breaking the existing, before hardening to Deny.

**Do checkov and Azure Policy overlap?** No — **complementary**: checkov **in CI** (early, on code); Azure Policy **in prod** (permanent, on the platform). Use both.

**The playbook doesn't "really" act.** Here it **prints** the actions (demonstrating the logic). In real Azure, it's a **Logic App** calling the APIs (disable an account, block an IP) — same orchestration.
:::
