---
# — Identité (ne change JAMAIS une fois publié) —
id: azure-supervision-livraison
slug: azure-supervision-livraison
order: 74
status: published

# — Titres & accroches (bilingue) —
title_fr: "Azure — supervision de la livraison (AZ-400) : DORA, sondes, canari"
title_en: "Azure — delivery monitoring (AZ-400): DORA, probes, canary"
tagline_fr: "mesurer (métriques DORA), observer (sondes, logs), livrer en douceur."
tagline_en: "measure (DORA metrics), observe (probes, logs), release smoothly."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 260
repo: "dora-team/fourkeys"
last_review: "2026-08-26"

# — Relations de parcours (par id) —
prerequisites: [azure-devsecops]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [supervision, dora, four-keys, sondes, health-check, logs, kql, canari, blue-green, feature-flags, az-400]
concepts_en: [monitoring, dora, four-keys, probes, health-check, logs, kql, canary, blue-green, feature-flags, az-400]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Superviser la livraison pour l'AZ-400, en local et pour de vrai : calculer les 4 métriques DORA (fréquence de déploiement, lead time, taux d'échec de changement, MTTR) à partir d'un VRAI historique Git (tags de déploiement + incident), exposer des sondes de santé liveness/readiness (endpoint HTTP réel), produire des logs structurés JSON interrogeables (avec un exemple de requête KQL), et livrer en douceur avec le déploiement progressif (blue-green, canari, feature flags — bascule de pourcentage réelle). Plus les alertes et la boucle de retour. Sans compte cloud.",
og_description_en: "Monitoring delivery for AZ-400, locally and for real: computing the 4 DORA metrics (deployment frequency, lead time, change failure rate, MTTR) from a REAL Git history (deploy tags + incident), exposing liveness/readiness health probes (a real HTTP endpoint), producing queryable structured JSON logs (with a sample KQL query), and releasing smoothly with progressive delivery (blue-green, canary, feature flags — a real percentage rollout). Plus alerts and the feedback loop. No cloud account."
---

## intro

:::lang fr
Livrer vite, c'est bien. Livrer vite **et le savoir** — mesurer, observer, réagir — c'est le métier. Le dernier pilier **AZ-400** : la **supervision de la livraison**. Sans mesure, tu ne sais pas si ta chaîne DevOps s'améliore ou se dégrade ; sans observabilité, un incident reste invisible jusqu'à ce qu'un client se plaigne.

Fidèle à la méthode, on le fait **en vrai et en local** : on calcule les **4 métriques DORA** (fréquence de déploiement, lead time, taux d'échec de changement, MTTR) à partir d'un **vrai historique Git** — des **tags de déploiement** et un **incident** suivi d'un hotfix. On expose des **sondes de santé** (`liveness` / `readiness`) sur un **vrai endpoint HTTP** qu'on interroge. On produit des **logs structurés JSON** interrogeables et on écrit une **requête KQL** (le langage de Log Analytics / Application Insights). Enfin, on **livre en douceur** : **blue-green**, **canari** et **feature flags** — avec une **bascule de pourcentage réelle**. On termine par les **alertes** et la **boucle de retour**.

**Pour qui c'est :** tu as des pipelines qui déploient (guides AZ-400) et tu veux **piloter** la livraison, pas la subir.

**Quand ce n'est PAS le bon choix :**

- Tu n'as pas encore de pipeline → fais les guides AZ-400 précédents.
- Tu veux la supervision **d'infrastructure** détaillée (Azure Monitor, VM Insights) → on en pose les bases ici, l'approfondissement est côté exploitation.
:::

:::lang en
Shipping fast is good. Shipping fast **and knowing it** — measuring, observing, reacting — is the craft. The last **AZ-400** pillar: **delivery monitoring**. Without measurement, you don't know if your DevOps chain is improving or degrading; without observability, an incident stays invisible until a customer complains.

True to the method, we do it **for real and locally**: we compute the **4 DORA metrics** (deployment frequency, lead time, change failure rate, MTTR) from a **real Git history** — **deploy tags** and an **incident** followed by a hotfix. We expose **health probes** (`liveness` / `readiness`) on a **real HTTP endpoint** we query. We produce **queryable structured JSON logs** and write a **KQL query** (the Log Analytics / Application Insights language). Finally, we **release smoothly**: **blue-green**, **canary** and **feature flags** — with a **real percentage rollout**. We close with **alerts** and the **feedback loop**.

**Who it's for:** you have pipelines that deploy (AZ-400 guides) and want to **steer** delivery, not endure it.

**When it's NOT the right choice:**

- You don't have a pipeline yet → do the previous AZ-400 guides.
- You want detailed **infrastructure** monitoring (Azure Monitor, VM Insights) → we lay the basics here, the deep dive is on the ops side.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Calculer les **4 métriques DORA** à partir d'un **historique Git** réel.
- Expliquer **fréquence de déploiement**, **lead time**, **taux d'échec**, **MTTR**.
- Exposer des **sondes** `liveness` et `readiness` et les **interroger**.
- Produire des **logs structurés** (JSON) et écrire une **requête KQL**.
- Comparer **blue-green**, **canari** et **feature flags**.
- Réaliser une **bascule de pourcentage** (rollout progressif) réelle.
- Poser une **alerte** et fermer la **boucle de retour**.
:::

:::lang en
By the end of this guide, you can:

- Compute the **4 DORA metrics** from a real **Git history**.
- Explain **deployment frequency**, **lead time**, **change failure rate**, **MTTR**.
- Expose `liveness` and `readiness` **probes** and **query** them.
- Produce **structured logs** (JSON) and write a **KQL query**.
- Compare **blue-green**, **canary** and **feature flags**.
- Perform a real **percentage rollout** (progressive delivery).
- Set an **alert** and close the **feedback loop**.
:::

## prerequisites

:::lang fr
- Le guide **Azure — DevSecOps (AZ-400)** (pipeline sécurisée).
- **Git**, **Node.js** (`node -v` ≥ 18, pour les sondes/logs) et **Python 3** (pour le calcul DORA).
- Un **terminal**. **Aucun compte cloud** : tout se calcule et s'exécute en local ; les requêtes KQL sont **illustratives**.
:::

:::lang en
- The **Azure — DevSecOps (AZ-400)** guide (secured pipeline).
- **Git**, **Node.js** (`node -v` ≥ 18, for probes/logs) and **Python 3** (for the DORA computation).
- A **terminal**. **No cloud account**: everything computes and runs locally; KQL queries are **illustrative**.
:::

## concepts

:::lang fr
**Mesurer : les 4 métriques DORA.** La recherche **DORA** (DevOps Research and Assessment) a identifié **4 indicateurs** qui prédisent la performance d'une équipe :

- **Fréquence de déploiement** — à quelle fréquence tu livres en prod (les élites : plusieurs fois par jour).
- **Lead time for changes** — délai du **commit** à la **prod** (les élites : moins d'un jour).
- **Change failure rate** — % de déploiements qui **causent un incident** (les élites : 0–15 %).
- **MTTR (Mean Time To Restore)** — temps pour **rétablir** après un incident (les élites : moins d'une heure).

Les deux premières mesurent la **vélocité**, les deux dernières la **stabilité**. Le secret DORA : les meilleures équipes sont **bonnes aux quatre** — vitesse **et** stabilité ne s'opposent pas. Et ces métriques se **dérivent de l'historique Git** (tags de déploiement, incidents).

**Observer : sondes de santé.** Un service expose des **sondes** que l'orchestrateur interroge : **liveness** (« suis-je vivant ? » — sinon on me redémarre) et **readiness** (« suis-je prêt à recevoir du trafic ? » — sinon on ne m'envoie rien). Distinguer les deux évite d'envoyer du trafic à un service qui démarre encore.

**Observer : logs structurés & KQL.** Un log en **texte libre** est illisible par la machine. Un log **structuré** (JSON : `level`, `msg`, `route`, `status`, `duree_ms`…) est **interrogeable**. Sur Azure, **Log Analytics** / **Application Insights** ingèrent ces logs et se requêtent en **KQL** (Kusto Query Language) : `traces | where status >= 500 | summarize count() by route`.

**Livrer en douceur : le déploiement progressif.** Plutôt que basculer 100 % du trafic d'un coup :

- **Blue-green** — deux environnements identiques ; on bascule le trafic de *blue* (ancien) à *green* (nouveau) d'un coup, et on **revient** instantanément en cas de souci.
- **Canari** — on envoie un **petit pourcentage** du trafic à la nouvelle version, on **surveille**, puis on **augmente** progressivement (10 % → 50 % → 100 %).
- **Feature flags** — on déploie le code **désactivé**, puis on **active** la fonctionnalité par **drapeau** (pour un %, une région, un segment) — sans redéployer. Idéal avec le trunk-based.

**Réagir : alertes & boucle de retour.** Une **alerte** se déclenche quand une métrique franchit un **seuil** (ex. taux d'erreur > 1 %, latence p95 > 500 ms). Elle **notifie** (ou déclenche un rollback automatique). C'est la **boucle de retour** : mesurer → alerter → corriger → re-mesurer. Sans elle, la supervision n'est qu'un tableau de bord qu'on ne regarde pas.

**Ce qui est live ici.** Les **métriques DORA** se **calculent** sur un **vrai** dépôt Git (tags + incident). Les **sondes** sont un **vrai serveur HTTP** qu'on interroge (200/503). Les **logs JSON** sont **réels** et **reparsés**. La **bascule de pourcentage** (canari) est un **vrai** code exécuté. Les **requêtes KQL** et les **alertes** sont **illustratives** (elles s'exécutent sur un vrai Azure Monitor). Tout le pilotage s'apprend **sans compte cloud**.
:::

:::lang en
**Measure: the 4 DORA metrics.** The **DORA** research (DevOps Research and Assessment) identified **4 indicators** that predict a team's performance:

- **Deployment frequency** — how often you ship to prod (elites: multiple times a day).
- **Lead time for changes** — time from **commit** to **prod** (elites: under a day).
- **Change failure rate** — % of deployments that **cause an incident** (elites: 0–15%).
- **MTTR (Mean Time To Restore)** — time to **recover** after an incident (elites: under an hour).

The first two measure **velocity**, the last two **stability**. The DORA insight: the best teams are **good at all four** — speed **and** stability don't oppose. And these metrics **derive from Git history** (deploy tags, incidents).

**Observe: health probes.** A service exposes **probes** the orchestrator queries: **liveness** ("am I alive?" — else restart me) and **readiness** ("am I ready for traffic?" — else send me nothing). Distinguishing them avoids sending traffic to a service still starting up.

**Observe: structured logs & KQL.** A **free-text** log is unreadable by machine. A **structured** log (JSON: `level`, `msg`, `route`, `status`, `duree_ms`…) is **queryable**. On Azure, **Log Analytics** / **Application Insights** ingest these logs and are queried in **KQL** (Kusto Query Language): `traces | where status >= 500 | summarize count() by route`.

**Release smoothly: progressive delivery.** Rather than switching 100% of traffic at once:

- **Blue-green** — two identical environments; you switch traffic from *blue* (old) to *green* (new) at once, and **roll back** instantly on trouble.
- **Canary** — you send a **small percentage** of traffic to the new version, **watch**, then **increase** progressively (10% → 50% → 100%).
- **Feature flags** — you deploy the code **disabled**, then **enable** the feature by **flag** (for a %, a region, a segment) — without redeploying. Ideal with trunk-based.

**React: alerts & feedback loop.** An **alert** fires when a metric crosses a **threshold** (e.g. error rate > 1%, p95 latency > 500 ms). It **notifies** (or triggers an automatic rollback). That's the **feedback loop**: measure → alert → fix → re-measure. Without it, monitoring is just a dashboard nobody watches.

**What's live here.** The **DORA metrics** are **computed** on a **real** Git repo (tags + incident). The **probes** are a **real HTTP server** we query (200/503). The **JSON logs** are **real** and **re-parsed**. The **percentage rollout** (canary) is **real** executed code. The **KQL queries** and **alerts** are **illustrative** (they run on real Azure Monitor). All the steering learns **without a cloud account**.
:::

:::figure azure-supervision-loop
caption_fr: "Schéma 1. La boucle de supervision : MESURER (4 métriques DORA calculées depuis l'historique Git : fréquence, lead time, taux d'échec, MTTR) → OBSERVER (sondes liveness/readiness + logs structurés interrogés en KQL) → LIVRER EN DOUCEUR (blue-green / canari / feature flags) → ALERTER (seuil franchi → notifier / rollback) → et on recommence. Vélocité (2 premières) ET stabilité (2 dernières) ensemble."
caption_en: "Figure 1. The monitoring loop: MEASURE (4 DORA metrics computed from Git history: frequency, lead time, failure rate, MTTR) → OBSERVE (liveness/readiness probes + structured logs queried in KQL) → RELEASE SMOOTHLY (blue-green / canary / feature flags) → ALERT (threshold crossed → notify / rollback) → and repeat. Velocity (first two) AND stability (last two) together."
:::

## walkthrough

:::lang fr
On avance ainsi : historique de déploiement (Git) → fréquence & lead time → taux d'échec & MTTR → sondes de santé → logs structurés & KQL → déploiement progressif (canari) → alertes & boucle de retour.
:::

:::lang en
We'll go like this: deployment history (Git) → frequency & lead time → failure rate & MTTR → health probes → structured logs & KQL → progressive delivery (canary) → alerts & feedback loop.
:::

### step-01

:::lang fr
**Objectif.** Construire un **historique de déploiement** réel — la matière première des métriques DORA.

**🤔 Les métriques sortent de l'historique.** Pas besoin d'outil coûteux : des **commits** datés et des **tags de déploiement** (`deploy-N`) suffisent. On simule une équipe sur une semaine, avec un **incident** (un `hotfix`) — pour avoir les quatre métriques.

Crée le dépôt et l'historique de déploiement :
:::

:::lang en
**Goal.** Build a real **deployment history** — the raw material of the DORA metrics.

**🤔 Metrics come from history.** No costly tool needed: dated **commits** and **deploy tags** (`deploy-N`) are enough. We simulate a team over a week, with an **incident** (a `hotfix`) — to have all four metrics.

Create the repo and the deployment history:
:::

```bash
mkdir -p supervision && cd supervision
git init -q && git config user.email you@example.com && git config user.name student

# Un commit daté / a dated commit
c() { echo "$2" >> CHANGELOG.md; git add -A; GIT_AUTHOR_DATE="$1" GIT_COMMITTER_DATE="$1" git commit -qm "$2"; }

c "2026-08-01T09:00:00" "feat: page de login"
c "2026-08-01T15:00:00" "feat: panier"
git tag deploy-1                                  # déploiement 1
c "2026-08-05T11:00:00" "feat: paiement"
c "2026-08-06T09:00:00" "fix: correction TVA"
git tag deploy-2                                  # déploiement 2
c "2026-08-06T20:00:00" "hotfix: paiement cassé en prod"
git tag deploy-3-hotfix                           # déploiement 3 (incident)

git tag | grep deploy
```

:::lang fr
**✅ Vérification :** `git tag` liste `deploy-1`, `deploy-2`, `deploy-3-hotfix`. Tu as trois **déploiements** sur la semaine, dont un **hotfix** (le signe d'un **incident** en prod). Cet historique — commits datés + tags — contient **tout** ce qu'il faut pour les 4 métriques DORA. On les calcule maintenant.
:::

:::lang en
**✅ Check:** `git tag` lists `deploy-1`, `deploy-2`, `deploy-3-hotfix`. You have three **deployments** over the week, one being a **hotfix** (the sign of a prod **incident**). This history — dated commits + tags — contains **everything** needed for the 4 DORA metrics. We compute them now.
:::

### step-02

:::lang fr
**Objectif.** Calculer la **fréquence de déploiement** et le **lead time** (la vélocité).

**🤔 Vitesse de livraison.** La **fréquence** = nombre de déploiements sur la période. Le **lead time** = délai entre le code (1er commit) et sa mise en prod (tag). On écrit un script qui lit l'historique et calcule les **4 métriques** ; ici on lit les **deux premières**.

Écris le calculateur DORA et lance-le :
:::

:::lang en
**Goal.** Compute **deployment frequency** and **lead time** (velocity).

**🤔 Delivery speed.** **Frequency** = number of deployments over the period. **Lead time** = delay between code (1st commit) and its production (tag). We write a script that reads the history and computes the **4 metrics**; here we read the **first two**.

Write the DORA calculator and run it:
:::

```bash
cat > dora.py <<'PY'
import subprocess, datetime
def git(*a): return subprocess.check_output(["git", *a], text=True).strip()

tags = [t for t in git("tag").splitlines() if t.startswith("deploy")]
date = lambda t: datetime.datetime.fromisoformat(git("log", "-1", "--format=%cI", t))
deploys = sorted(tags, key=date)
dates = [date(t) for t in deploys]

# 1) Fréquence de déploiement
span = max((dates[-1] - dates[0]).days, 1)
print(f"1. Frequence de deploiement : {len(deploys)} / {span} j = {len(deploys)/span:.2f}/jour")

# 2) Lead time : du 1er commit à chaque déploiement (heures)
first = datetime.datetime.fromisoformat(git("log", "--format=%cI", "--reverse").splitlines()[0])
print(f"2. Lead time (1er commit -> deploiement) : {[round((x-first).total_seconds()/3600,1) for x in dates]} h")

# 3) Taux d'échec de changement : % de déploiements 'hotfix'
fails = [t for t in deploys if "hotfix" in t]
print(f"3. Taux d'echec de changement : {len(fails)}/{len(deploys)} = {100*len(fails)/len(deploys):.0f}%")

# 4) MTTR : du déploiement cassé au hotfix (heures)
if fails:
    hf = fails[0]; broken = deploys[deploys.index(hf)-1]
    print(f"4. MTTR ({broken} -> {hf}) : {(date(hf)-date(broken)).total_seconds()/3600:.1f} h")
PY

python3 dora.py
```

:::lang fr
**✅ Vérification :** le script affiche les 4 lignes. Concentre-toi sur les **deux premières** : `1. Frequence de deploiement : 3 / 5 j = 0.60/jour` (trois déploiements sur cinq jours) et `2. Lead time ... : [6.0, 120.0, 131.0] h` (le premier déploiement est parti **6 h** après le premier commit ; les suivants, plusieurs jours). Voilà la **vélocité**, calculée depuis Git — pas une estimation. On lit la **stabilité** à l'étape suivante.
:::

:::lang en
**✅ Check:** the script prints 4 lines. Focus on the **first two**: `1. Frequence de deploiement : 3 / 5 j = 0.60/jour` (three deployments over five days) and `2. Lead time ... : [6.0, 120.0, 131.0] h` (the first deployment went out **6 h** after the first commit; the next ones, several days). That's **velocity**, computed from Git — not an estimate. We read **stability** next.
:::

### step-03

:::lang fr
**Objectif.** Calculer le **taux d'échec de changement** et le **MTTR** (la stabilité).

**🤔 Fiabilité de livraison.** Le **taux d'échec** = part des déploiements qui ont **cassé** la prod (ici, marqués `hotfix`). Le **MTTR** = temps entre le déploiement cassé (`deploy-2`) et le correctif (`deploy-3-hotfix`). Même script, on lit les **deux dernières** lignes.

Relis les métriques de stabilité :
:::

:::lang en
**Goal.** Compute the **change failure rate** and **MTTR** (stability).

**🤔 Delivery reliability.** The **failure rate** = share of deployments that **broke** prod (here, tagged `hotfix`). The **MTTR** = time between the broken deployment (`deploy-2`) and the fix (`deploy-3-hotfix`). Same script, read the **last two** lines.

Re-read the stability metrics:
:::

```bash
python3 dora.py | tail -2
```

:::lang fr
**✅ Vérification :** tu vois `3. Taux d'echec de changement : 1/3 = 33%` (un déploiement sur trois a nécessité un hotfix) et `4. MTTR (deploy-2 -> deploy-3-hotfix) : 11.0 h` (il a fallu 11 h pour rétablir). Un taux à 33 % est **élevé** (les élites : < 15 %) et un MTTR de 11 h est **lent** (élites : < 1 h) — ces chiffres **guident l'amélioration** : plus de tests avant déploiement (baisse le taux d'échec), meilleur rollback (baisse le MTTR). C'est ça, piloter par la mesure.
:::

:::lang en
**✅ Check:** you see `3. Taux d'echec de changement : 1/3 = 33%` (one deployment in three needed a hotfix) and `4. MTTR (deploy-2 -> deploy-3-hotfix) : 11.0 h` (it took 11 h to recover). A 33% rate is **high** (elites: < 15%) and an 11 h MTTR is **slow** (elites: < 1 h) — these numbers **guide improvement**: more tests before deploying (lowers failure rate), better rollback (lowers MTTR). That's steering by measurement.
:::

### step-04

:::lang fr
**Objectif.** Exposer des **sondes de santé** `liveness` et `readiness` et les **interroger**.

**🤔 « Vivant » n'est pas « prêt ».** Un service qui **démarre** est vivant mais **pas prêt** à recevoir du trafic. On expose deux endpoints : `/health/live` (200 si le process tourne) et `/health/ready` (200 seulement une fois initialisé, 503 sinon). On lance un **vrai** serveur et on le sonde.

Lance le serveur de sondes et interroge-le :
:::

:::lang en
**Goal.** Expose `liveness` and `readiness` **health probes** and **query** them.

**🤔 "Alive" isn't "ready".** A service that's **starting** is alive but **not ready** for traffic. We expose two endpoints: `/health/live` (200 if the process runs) and `/health/ready` (200 only once initialized, 503 otherwise). We launch a **real** server and probe it.

Launch the probe server and query it:
:::

```bash
cat > sondes.js <<'JS'
const http = require("http");
let pret = false;
setTimeout(() => { pret = true; }, 300);   // simule l'initialisation / simulate init

const serveur = http.createServer((req, res) => {
  if (req.url === "/health/live") { res.writeHead(200).end("VIVANT"); }
  else if (req.url === "/health/ready") {
    res.writeHead(pret ? 200 : 503).end(pret ? "PRET" : "DEMARRAGE");
  } else { res.writeHead(404).end(); }
});

serveur.listen(8099, () => {
  // Sonde 'ready' tout de suite (démarrage), puis 'live' et 'ready' après init
  http.get("http://localhost:8099/health/ready", r => console.log("ready (au démarrage) ->", r.statusCode));
  setTimeout(() => {
    http.get("http://localhost:8099/health/live",  r => console.log("live  (après init)   ->", r.statusCode));
    http.get("http://localhost:8099/health/ready", r => { console.log("ready (après init)   ->", r.statusCode); setTimeout(() => serveur.close(), 200); });
  }, 500);
});
JS

node sondes.js
```

:::lang fr
**✅ Vérification :** tu vois `ready (au démarrage) -> 503`, puis `live (après init) -> 200` et `ready (après init) -> 200`. Au démarrage, le service est **vivant** mais **pas prêt** (503) — l'orchestrateur (Kubernetes, App Service) **ne lui envoie pas** de trafic tant que `ready` n'est pas 200. Une fois initialisé, il devient **prêt**. Cette distinction évite les erreurs pendant les démarrages et les déploiements. Les mêmes sondes servent aux **health checks** d'un déploiement progressif (étape 6).
:::

:::lang en
**✅ Check:** you see `ready (au démarrage) -> 503`, then `live (après init) -> 200` and `ready (après init) -> 200`. At startup the service is **alive** but **not ready** (503) — the orchestrator (Kubernetes, App Service) **sends it no** traffic until `ready` is 200. Once initialized, it becomes **ready**. This distinction avoids errors during startups and deployments. The same probes serve the **health checks** of a progressive delivery (step 6).
:::

### step-05

:::lang fr
**Objectif.** Produire des **logs structurés** (JSON) et écrire une **requête KQL**.

**🤔 Un log doit être interrogeable.** Un `console.log("erreur !")` est inutile à l'échelle. Un log **structuré** (JSON avec des champs) se **filtre**, s'**agrège**, s'**alerte**. On émet des logs JSON, on les **reparse** pour prouver qu'ils sont exploitables, et on écrit la **requête KQL** équivalente (le langage d'Application Insights).

Émets des logs structurés et note la requête KQL :
:::

:::lang en
**Goal.** Produce **structured logs** (JSON) and write a **KQL query**.

**🤔 A log must be queryable.** A `console.log("error!")` is useless at scale. A **structured** log (JSON with fields) can be **filtered**, **aggregated**, **alerted on**. We emit JSON logs, **re-parse** them to prove they're exploitable, and write the equivalent **KQL query** (the Application Insights language).

Emit structured logs and note the KQL query:
:::

```bash
cat > logs.js <<'JS'
function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra }));
}
log("info",  "requête traitée", { route: "/panier",   status: 200, duree_ms: 42 });
log("info",  "requête traitée", { route: "/paiement", status: 200, duree_ms: 88 });
log("error", "paiement refusé", { route: "/paiement", status: 500, code: "CARD_DECLINED" });
JS

# Émettre puis reparser : compter les erreurs par route (ce que fait Log Analytics)
node logs.js | python3 -c "
import sys, json
from collections import Counter
erreurs = Counter()
for ligne in sys.stdin:
    e = json.loads(ligne)
    if e['status'] >= 500: erreurs[e['route']] += 1
print('erreurs 5xx par route / 5xx errors by route:', dict(erreurs))
"

# La MÊME logique en KQL (Application Insights / Log Analytics) :
cat <<'KQL'
--- requête KQL équivalente / equivalent KQL query ---
traces
| where status >= 500
| summarize erreurs = count() by route
| order by erreurs desc
KQL
```

:::lang fr
**✅ Vérification :** la sortie affiche `erreurs 5xx par route / 5xx errors by route: {'/paiement': 1}` — on a **agrégé** de vrais logs JSON par route. C'est **exactement** ce que fait la requête **KQL** affichée (`summarize count() by route`) sur Azure : les logs structurés arrivent dans **Application Insights**, et KQL les interroge. Retiens : **logue en JSON**, jamais en texte libre — c'est ce qui rend l'observabilité possible.
:::

:::lang en
**✅ Check:** the output shows `erreurs 5xx par route / 5xx errors by route: {'/paiement': 1}` — we **aggregated** real JSON logs by route. That's **exactly** what the shown **KQL** query does (`summarize count() by route`) on Azure: structured logs land in **Application Insights**, and KQL queries them. Remember: **log in JSON**, never free text — that's what makes observability possible.
:::

### step-06

:::lang fr
**Objectif.** Livrer en douceur — le **déploiement progressif** (canari, feature flag).

**🤔 Ne bascule pas 100 % d'un coup.** Un **feature flag** active la nouveauté pour un **pourcentage** d'utilisateurs, choisi de façon **stable** (le même utilisateur voit toujours la même version). On monte 10 % → 50 % → 100 % en **surveillant**. On exécute une **vraie** bascule de pourcentage.

Réalise un rollout progressif :
:::

:::lang en
**Goal.** Release smoothly — **progressive delivery** (canary, feature flag).

**🤔 Don't switch 100% at once.** A **feature flag** enables the new thing for a **percentage** of users, chosen **stably** (the same user always sees the same version). We ramp 10% → 50% → 100% while **watching**. We run a **real** percentage rollout.

Perform a progressive rollout:
:::

```bash
cat > canari.js <<'JS'
const crypto = require("crypto");
// Actif si le "bucket" stable de l'utilisateur (0..99) < pourcentage de déploiement
function estActif(pourcentage, userId) {
  const bucket = crypto.createHash("sha256").update(String(userId)).digest()[0] % 100;
  return bucket < pourcentage;
}
for (const pct of [0, 10, 50, 100]) {
  const actifs = Array.from({ length: 1000 }, (_, i) => estActif(pct, "user" + i)).filter(Boolean).length;
  console.log(`déploiement à ${pct}% -> ~${actifs}/1000 utilisateurs voient la nouveauté`);
}
JS

node canari.js
```

:::lang fr
**✅ Vérification :** la sortie montre la montée : `0% -> ~0/1000`, `10% -> ~100/1000`, `50% -> ~500/1000`, `100% -> ~1000/1000` (chiffres proches, la répartition est **stable** par utilisateur). C'est le **canari** par feature flag : on expose la nouveauté à **peu** d'utilisateurs, on **surveille** les métriques (erreurs, latence), et on **augmente** — ou on **rebascule à 0 %** en cas de souci, **sans redéployer**. Le **blue-green**, lui, bascule tout d'un coup entre deux environnements, avec retour instantané. Deux stratégies pour **réduire le risque** de chaque livraison.
:::

:::lang en
**✅ Check:** the output shows the ramp: `0% -> ~0/1000`, `10% -> ~100/1000`, `50% -> ~500/1000`, `100% -> ~1000/1000` (numbers are close; the split is **stable** per user). That's the **canary** via feature flag: you expose the new thing to **few** users, **watch** the metrics (errors, latency), and **increase** — or **flip back to 0%** on trouble, **without redeploying**. **Blue-green**, in contrast, switches everything at once between two environments, with instant rollback. Two strategies to **reduce the risk** of each release.
:::

### step-07

:::lang fr
**Objectif.** Poser une **alerte** et fermer la **boucle de retour**.

**🤔 Mesurer sans réagir ne sert à rien.** Une **alerte** surveille une métrique et se déclenche au **franchissement d'un seuil** — elle **notifie** (ou déclenche un rollback). On simule une règle d'alerte sur le taux d'erreur, et on récapitule la boucle.

Évalue une règle d'alerte et récapitule :
:::

:::lang en
**Goal.** Set an **alert** and close the **feedback loop**.

**🤔 Measuring without reacting is pointless.** An **alert** watches a metric and fires when a **threshold is crossed** — it **notifies** (or triggers a rollback). We simulate an alert rule on the error rate, and recap the loop.

Evaluate an alert rule and recap:
:::

```bash
# Règle d'alerte : taux d'erreur 5xx > 1% sur les dernières requêtes
cat > alerte.py <<'PY'
requetes = [200, 200, 200, 500, 200, 200, 503, 200, 200, 200]  # échantillon récent
erreurs = sum(1 for s in requetes if s >= 500)
taux = 100 * erreurs / len(requetes)
SEUIL = 1.0
etat = "🔴 DECLENCHEE" if taux > SEUIL else "🟢 OK"
print(f"Taux d'erreur : {taux:.0f}% (seuil {SEUIL}%) -> alerte {etat}")
if taux > SEUIL:
    print("  Action : notifier l'équipe + envisager un rollback (rebascule le canari à 0%).")
PY
python3 alerte.py

echo "--- La boucle de supervision / the monitoring loop ---"
echo "MESURER (DORA) -> OBSERVER (sondes, logs/KQL) -> LIVRER (canari) -> ALERTER (seuil) -> corriger -> re-mesurer"
```

:::lang fr
**✅ Vérification :** l'évaluation affiche `Taux d'erreur : 20% (seuil 1%) -> alerte 🔴 DECLENCHEE` et propose l'**action** (notifier + rollback). Sur Azure, cette logique est une **règle d'alerte** (Azure Monitor) sur une métrique ou une requête KQL, reliée à un **groupe d'actions** (mail, webhook, rollback). Tu as bouclé la **supervision de la livraison** : mesurer (DORA), observer (sondes, logs), livrer en douceur (canari), alerter, corriger — et recommencer. **Tu as terminé le track AZ-400 !** Il ne reste que le **projet DevOps** de synthèse, pour l'emballage CV.
:::

:::lang en
**✅ Check:** the evaluation shows `Taux d'erreur : 20% (seuil 1%) -> alerte 🔴 DECLENCHEE` and proposes the **action** (notify + rollback). On Azure, this logic is an **alert rule** (Azure Monitor) on a metric or a KQL query, wired to an **action group** (email, webhook, rollback). You closed **delivery monitoring**: measure (DORA), observe (probes, logs), release smoothly (canary), alert, fix — and repeat. **You finished the AZ-400 track!** Only the capstone **DevOps project** remains, for CV packaging.
:::

## pitfalls

:::lang fr
**1. Optimiser la vitesse en ignorant la stabilité.** Déployer souvent avec un taux d'échec de 40 % n'est pas « performant ». DORA mesure les **quatre** — vélocité **et** stabilité.

**2. Liveness et readiness confondues.** Si `liveness` échoue pendant l'init, l'orchestrateur **redémarre** en boucle. La sonde de démarrage/prêt (`readiness`) gère l'init ; `liveness` ne teste que « le process est-il bloqué ? ».

**3. Logs en texte libre.** `console.log("erreur sur user 42")` n'est ni filtrable ni agrégeable. **Logue en JSON** avec des champs.

**4. Tout logguer / rien logguer.** Trop de logs = coût et bruit ; trop peu = angles morts. Logue les **événements utiles** (erreurs, latences, transactions), avec un **niveau**.

**5. Canari sans surveillance.** Monter 10 %→100 % **sans regarder** les métriques, c'est juste un déploiement lent. Le canari **surveille** à chaque palier et **rebascule** si besoin.

**6. Alerte sans seuil pertinent.** Trop sensible = fatigue d'alerte (on les ignore) ; trop laxiste = on rate l'incident. Calibre sur des **objectifs de service** (SLO).

**7. Mesurer sans agir.** Un tableau de bord qu'on ne regarde pas ne sert à rien. L'**alerte** ferme la boucle : mesurer **et** réagir.
:::

:::lang en
**1. Optimizing speed while ignoring stability.** Deploying often with a 40% failure rate isn't "high-performing". DORA measures **all four** — velocity **and** stability.

**2. Confusing liveness and readiness.** If `liveness` fails during init, the orchestrator **restarts** in a loop. The startup/readiness probe handles init; `liveness` only tests "is the process stuck?".

**3. Free-text logs.** `console.log("error on user 42")` is neither filterable nor aggregatable. **Log in JSON** with fields.

**4. Log everything / log nothing.** Too many logs = cost and noise; too few = blind spots. Log the **useful events** (errors, latencies, transactions), with a **level**.

**5. Canary without watching.** Ramping 10%→100% **without looking** at metrics is just a slow deployment. Canary **watches** at each step and **flips back** if needed.

**6. Alert without a relevant threshold.** Too sensitive = alert fatigue (ignored); too lax = you miss the incident. Calibrate against **service objectives** (SLOs).

**7. Measuring without acting.** A dashboard nobody watches is useless. The **alert** closes the loop: measure **and** react.
:::

## success

:::lang fr
Tu as réussi si :

- Tu **calcules** les 4 métriques DORA depuis un historique Git.
- Tu expliques **vélocité** (fréquence, lead time) vs **stabilité** (taux d'échec, MTTR).
- Tu exposes et interroges des sondes **liveness** / **readiness**.
- Tu produis des **logs JSON** et sais écrire la **requête KQL** d'agrégation.
- Tu réalises une **bascule de pourcentage** (canari) stable par utilisateur.
- Tu poses une **alerte** sur un seuil et sais qu'elle **ferme la boucle**.
:::

:::lang en
You've succeeded if:

- You **compute** the 4 DORA metrics from a Git history.
- You explain **velocity** (frequency, lead time) vs **stability** (failure rate, MTTR).
- You expose and query **liveness** / **readiness** probes.
- You produce **JSON logs** and can write the aggregation **KQL query**.
- You perform a **percentage rollout** (canary) stable per user.
- You set an **alert** on a threshold and know it **closes the loop**.
:::

## next

:::lang fr
- **Suivant :** *Azure — projet DevOps (AZ-400)* — le projet de synthèse : une chaîne CI/CD complète, sécurisée et supervisée, pour le CV.
- **Réviser :** *Azure — DevSecOps (AZ-400)* pour la sécurité de la chaîne.
- **S'entraîner :** branche ton calcul DORA sur un **vrai** dépôt (le tien) et interprète tes quatre chiffres.
:::

:::lang en
- **Next:** *Azure — DevOps project (AZ-400)* — the capstone: a complete, secured and monitored CI/CD chain, for the CV.
- **Review:** *Azure — DevSecOps (AZ-400)* for chain security.
- **Practice:** point your DORA computation at a **real** repo (yours) and interpret your four numbers.
:::

## cheatsheet

:::lang fr
**Les 4 métriques DORA**

```text
Vélocité :
  Fréquence de déploiement  = nb de déploiements / période       (élite : plusieurs/jour)
  Lead time for changes     = temps commit -> prod               (élite : < 1 jour)
Stabilité :
  Change failure rate       = % déploiements causant un incident (élite : 0-15%)
  MTTR                      = temps de rétablissement            (élite : < 1 h)
# se calculent depuis Git : tags de déploiement + commits datés + tags 'hotfix'
```

**Sondes de santé**

```text
/health/live   -> 200 si le process tourne        (sinon : redémarrer)
/health/ready  -> 200 si prêt au trafic, 503 sinon (sinon : ne pas router)
```

**Logs & KQL**

```bash
# loguer en JSON : { ts, level, msg, route, status, duree_ms }
# requête Application Insights / Log Analytics :
#   traces | where status >= 500 | summarize count() by route
```

**Déploiement progressif**

```text
Blue-green    : 2 environnements, bascule tout-ou-rien, rollback instantané
Canari        : 10% -> 50% -> 100% du trafic, surveillé à chaque palier
Feature flag  : code déployé désactivé, activé par drapeau (%, région, segment)
```
:::

:::lang en
**The 4 DORA metrics**

```text
Velocity:
  Deployment frequency   = # deployments / period        (elite: several/day)
  Lead time for changes  = time commit -> prod            (elite: < 1 day)
Stability:
  Change failure rate    = % deployments causing incident (elite: 0-15%)
  MTTR                   = time to restore                (elite: < 1 h)
# computed from Git: deploy tags + dated commits + 'hotfix' tags
```

**Health probes**

```text
/health/live   -> 200 if the process runs         (else: restart)
/health/ready  -> 200 if ready for traffic, 503 not (else: don't route)
```

**Logs & KQL**

```bash
# log in JSON: { ts, level, msg, route, status, duree_ms }
# Application Insights / Log Analytics query:
#   traces | where status >= 500 | summarize count() by route
```

**Progressive delivery**

```text
Blue-green    : 2 environments, all-or-nothing switch, instant rollback
Canary        : 10% -> 50% -> 100% of traffic, watched at each step
Feature flag  : code deployed disabled, enabled by flag (%, region, segment)
```
:::

## resources

:::lang fr
- **DORA / Four Keys** : les 4 métriques, le rapport *Accelerate State of DevOps* — dora.dev, `dora-team/fourkeys`.
- **Sondes** : liveness/readiness/startup — docs Kubernetes ; Health checks App Service — Microsoft Learn.
- **KQL** : Kusto Query Language, Log Analytics, Application Insights — Microsoft Learn (AZ-400).
- **Déploiement progressif** : blue-green, canary, feature flags — docs Azure Deployment Center / App Configuration.
- **Azure Monitor** : règles d'alerte, groupes d'actions, SLO/SLI — Microsoft Learn.
:::

:::lang en
- **DORA / Four Keys**: the 4 metrics, the *Accelerate State of DevOps* report — dora.dev, `dora-team/fourkeys`.
- **Probes**: liveness/readiness/startup — Kubernetes docs; App Service health checks — Microsoft Learn.
- **KQL**: Kusto Query Language, Log Analytics, Application Insights — Microsoft Learn (AZ-400).
- **Progressive delivery**: blue-green, canary, feature flags — Azure Deployment Center / App Configuration docs.
- **Azure Monitor**: alert rules, action groups, SLO/SLI — Microsoft Learn.
:::

## troubleshooting

:::lang fr
**`dora.py` : aucune ligne / division par zéro.** Il faut au moins **un tag `deploy*`**. Vérifie `git tag | grep deploy` ; recrée l'historique (step-01) si besoin.

**Les dates du lead time semblent fausses.** Le script utilise la date du **commit** que pointe le tag (`%cI`). Si tu as taggé un autre commit, le calcul change. Ici on tague le dernier commit avant chaque « déploiement ».

**`node sondes.js` ne rend pas la main.** Le serveur se ferme seul après les sondes (`serveur.close()`). Si un `EADDRINUSE` apparaît, le port 8099 est pris — change-le, ou tue le process précédent.

**`ready` renvoie 200 dès le départ.** L'init simulée est courte (300 ms) et la première sonde part vite ; si ta machine est lente, l'ordre peut varier. Le **principe** (503 tant que pas prêt) reste : augmente le délai d'init pour bien le voir.

**Le canari n'est pas pile à 10 %.** Normal : la répartition par hachage est **stable** mais **approximative** sur 1000 utilisateurs (`~100`). À grande échelle, elle converge vers le pourcentage visé.

**KQL ne s'exécute pas en local.** C'est attendu : KQL tourne sur **Log Analytics / Application Insights** (vrai Azure). En local, on **reproduit la logique** en Python pour prouver que les logs structurés sont interrogeables.
:::

:::lang en
**`dora.py`: no lines / division by zero.** You need at least **one `deploy*` tag**. Check `git tag | grep deploy`; recreate the history (step-01) if needed.

**The lead-time dates look wrong.** The script uses the date of the **commit** the tag points to (`%cI`). If you tagged a different commit, the computation changes. Here we tag the last commit before each "deployment".

**`node sondes.js` doesn't return.** The server closes itself after the probes (`serveur.close()`). If an `EADDRINUSE` appears, port 8099 is taken — change it, or kill the previous process.

**`ready` returns 200 from the start.** The simulated init is short (300 ms) and the first probe fires quickly; on a slow machine the order may vary. The **principle** (503 until ready) holds: increase the init delay to see it clearly.

**The canary isn't exactly 10%.** Normal: the hash-based split is **stable** but **approximate** over 1000 users (`~100`). At scale it converges to the target percentage.

**KQL doesn't run locally.** Expected: KQL runs on **Log Analytics / Application Insights** (real Azure). Locally we **reproduce the logic** in Python to prove structured logs are queryable.
:::
