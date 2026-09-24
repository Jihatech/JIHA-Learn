---
# — Identité (ne change JAMAIS une fois publié) —
id: gcp-messagerie
slug: gcp-messagerie
order: 54
status: published

# — Titres & accroches (bilingue) —
title_fr: "GCP — messagerie Pub/Sub : découplage & événementiel"
title_en: "GCP — Pub/Sub messaging: decoupling & event-driven"
tagline_fr: "sujets, abonnements, ack/nack, filtres, ordre, dead-letter."
tagline_en: "topics, subscriptions, ack/nack, filters, ordering, dead-letter."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 210
repo: "googleapis/python-pubsub"
last_review: "2026-08-20"

# — Relations de parcours (par id) —
prerequisites: [gcp-fondamentaux]
next: [gcp-iam-terraform]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [pub-sub, sujets-abonnements, fan-out, pull-push, ack-nack, redelivery, attributs-filtres, cles-ordre, dead-letter]
concepts_en: [pub-sub, topics-subscriptions, fan-out, pull-push, ack-nack, redelivery, attributes-filters, ordering-keys, dead-letter]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Pub/Sub en profondeur pour l'ACE, entièrement sur l'émulateur officiel : sujets et abonnements, fan-out (un événement, plusieurs consommateurs), pull vs push, accusés de réception (ack/nack) et redistribution, attributs de message et filtres d'abonnement, clés d'ordre, et dead-letter. Le cœur événementiel de GCP, testé en local, sans compte ni facture."
og_description_en: "Pub/Sub in depth for ACE, fully on the official emulator: topics and subscriptions, fan-out (one event, many consumers), pull vs push, acknowledgements (ack/nack) and redelivery, message attributes and subscription filters, ordering keys, and dead-letter. GCP's event-driven core, tested locally, no account or bill."
---

## intro

:::lang fr
Une application moderne n'est pas un bloc : c'est un **ensemble de services** qui doivent se parler **sans se bloquer**. Quand une commande est passée, il faut débiter le stock, envoyer un e-mail, mettre à jour l'analytique… si chaque étape attend la précédente, tout s'effondre à la première lenteur. La solution : la **messagerie asynchrone**, et sur GCP elle a un nom — **Pub/Sub**. L'examen **Associate Cloud Engineer** en fait un pilier de son domaine « déployer et opérer ».

Tu as créé ton premier sujet au guide *fondamentaux* (publier → tirer → acquitter). Ici, on va **en profondeur**, et **tout est live** sur l'émulateur officiel : le **fan-out** (un événement, plusieurs consommateurs indépendants — comme **SNS+SQS réunis** chez AWS), les modes **pull et push**, les **accusés de réception** (`ack`/`nack`) et la **redistribution** d'un message non traité, les **attributs** de message et les **filtres** d'abonnement, les **clés d'ordre**, et enfin le **dead-letter** (que faire des messages « empoisonnés »).

Bonne nouvelle labo : l'émulateur Pub/Sub de Google est **remarquablement complet**. Fan-out, filtres, redistribution, ordre, politique de dead-letter — tout se pilote **pour de vrai** en local, via la **bibliothèque cliente** Python (l'émulateur ne se pilote pas par `gcloud pubsub`, qui vise toujours le vrai GCP). Une seule nuance signalée au fil du texte : le **routage effectif** vers le dead-letter, qui dépend d'un long cycle de redistributions, se **conceptualise** ici (on crée la politique en live, on la relit).

**Pour qui c'est :** tu as monté le labo local (guide *fondamentaux*) et tu veux maîtriser l'événementiel GCP.

**Quand ce n'est PAS le bon choix :**

- Ton labo n'est pas monté (émulateurs éteints) → refais l'étape « labo local » de *fondamentaux*.
- Tu cherches une **file de tâches** stricte façon Celery/RabbitMQ maison → Pub/Sub couvre le besoin, mais l'angle ici est **cloud/ACE**, pas l'ops d'un broker auto-hébergé.
:::

:::lang en
A modern application isn't one block: it's a **set of services** that must talk to each other **without blocking**. When an order is placed, you must debit stock, send an email, update analytics… if each step waits for the previous one, everything collapses at the first slowdown. The fix: **asynchronous messaging**, and on GCP it has a name — **Pub/Sub**. The **Associate Cloud Engineer** exam makes it a pillar of its "deploy and operate" domain.

You created your first topic in the *fundamentals* guide (publish → pull → acknowledge). Here we go **deep**, and **everything is live** on the official emulator: **fan-out** (one event, many independent consumers — like **SNS+SQS combined** on AWS), the **pull and push** modes, **acknowledgements** (`ack`/`nack`) and **redelivery** of an unprocessed message, message **attributes** and subscription **filters**, **ordering keys**, and finally **dead-letter** (what to do with "poison" messages).

Lab good news: Google's Pub/Sub emulator is **remarkably complete**. Fan-out, filters, redelivery, ordering, dead-letter policy — all driven **for real** locally, via the Python **client library** (the emulator isn't driven by `gcloud pubsub`, which always targets real GCP). One nuance flagged throughout: the **actual routing** to dead-letter, which depends on a long redelivery cycle, is **conceptualized** here (we create the policy live and read it back).

**Who it's for:** you've set up the local lab (*fundamentals* guide) and want to master GCP event-driven messaging.

**When it's NOT the right choice:**

- Your lab isn't up (emulators off) → redo the "local lab" step of *fundamentals*.
- You want a strict **task queue** à la home-grown Celery/RabbitMQ → Pub/Sub covers it, but the angle here is **cloud/ACE**, not operating a self-hosted broker.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Créer un **sujet** et plusieurs **abonnements**, et expliquer le **fan-out**.
- Distinguer les abonnements **pull** et **push** (et quand choisir chacun).
- Gérer les **accusés de réception** : `ack`, `nack`, délai d'accusé, **redistribution**.
- Publier des **attributs** et **filtrer** un abonnement dessus.
- Garantir l'**ordre** avec une **clé d'ordre**.
- Configurer une politique de **dead-letter** et de **nouvelle tentative**.
- Reconnaître le **pattern événementiel** et l'appliquer.
:::

:::lang en
By the end of this guide, you can:

- Create a **topic** and several **subscriptions**, and explain **fan-out**.
- Tell **pull** and **push** subscriptions apart (and when to choose each).
- Handle **acknowledgements**: `ack`, `nack`, ack deadline, **redelivery**.
- Publish **attributes** and **filter** a subscription on them.
- Guarantee **ordering** with an **ordering key**.
- Configure a **dead-letter** and **retry** policy.
- Recognize the **event-driven pattern** and apply it.
:::

## prerequisites

:::lang fr
- Le guide **GCP fondamentaux** terminé, avec le **labo local qui tourne** (au minimum l'émulateur **Pub/Sub** sur `localhost:8085`).
- La variable **`PUBSUB_EMULATOR_HOST=localhost:8085`** exportée dans ton shell (sinon le client vise le vrai GCP).
- Le client Python **`google-cloud-pubsub`** (`pip install google-cloud-pubsub`).
- Rappel : l'émulateur se pilote par la **bibliothèque cliente**, pas par `gcloud pubsub`.
:::

:::lang en
- The **GCP fundamentals** guide done, with the **local lab running** (at minimum the **Pub/Sub** emulator on `localhost:8085`).
- The variable **`PUBSUB_EMULATOR_HOST=localhost:8085`** exported in your shell (otherwise the client targets real GCP).
- The Python client **`google-cloud-pubsub`** (`pip install google-cloud-pubsub`).
- Reminder: the emulator is driven by the **client library**, not by `gcloud pubsub`.
:::

## concepts

:::lang fr
**Le modèle publish/subscribe.** Un **producteur** (publisher) envoie des messages à un **sujet** (topic) sans savoir qui les lira. Des **consommateurs** (subscribers) lisent via des **abonnements** (subscriptions). Producteur et consommateur sont **découplés** : ils ne se connaissent pas, ne s'attendent pas, montent en charge séparément. C'est le cœur de l'asynchrone.

**Sujet et abonnements.** Un **sujet** est un canal nommé. Chaque **abonnement** attaché à ce sujet reçoit **sa propre copie** de chaque message publié après sa création. C'est la clé du **fan-out** : un événement `commande.passée` → un abonnement `facturation`, un abonnement `email`, un abonnement `analytique`, chacun consomme à son rythme. (Chez AWS, il fallait SNS **et** SQS ; Pub/Sub réunit les deux.)

**Pull vs push.** Un abonnement **pull** : le consommateur **tire** activement les messages (`pull`) quand il est prêt — idéal pour un worker qui contrôle son débit. Un abonnement **push** : Pub/Sub **pousse** chaque message en **POST HTTPS** vers une URL que tu fournis (un endpoint web, une Cloud Function/Run) — idéal pour du serverless réactif, sans worker à faire tourner.

**Accusé de réception (ack).** Un message tiré n'est **pas** supprimé tout de suite : le consommateur a un **délai d'accusé** (ack deadline) pour le traiter puis l'**acquitter** (`ack`). S'il acquitte, le message disparaît. S'il **n'acquitte pas** (échec, `nack`, ou délai dépassé), Pub/Sub le **redistribue** — la livraison est **au moins une fois** (at-least-once). Le consommateur doit donc être **idempotent**.

**Attributs & filtres.** Un message porte des **données** (le corps, en octets) et des **attributs** (paires clé-valeur, ex. `region=eu`, `type=commande`). Un abonnement peut déclarer un **filtre** (`attributes.type = "commande"`) : il ne reçoit **que** les messages correspondants. On trie le flux **à la source**, sans code côté consommateur.

**Clés d'ordre.** Par défaut, Pub/Sub ne garantit **pas** l'ordre (priorité au débit). Si l'ordre compte (événements d'un même compte, d'un même appareil), on publie avec une **clé d'ordre** (`ordering_key`) : tous les messages d'une même clé sont livrés **dans l'ordre** de publication.

**Dead-letter & retry.** Un message « empoisonné » (qui échoue à chaque tentative) pourrait tourner en boucle. Une politique de **dead-letter** dit : « après N tentatives de livraison, déplace ce message vers un **sujet de rebut** (dead-letter topic) ». On y branche un abonnement de surveillance pour inspecter les échecs. On règle aussi la **politique de nouvelle tentative** (retry, avec back-off).
:::

:::lang en
**The publish/subscribe model.** A **publisher** sends messages to a **topic** without knowing who will read them. **Subscribers** read via **subscriptions**. Publisher and subscriber are **decoupled**: they don't know each other, don't wait for each other, scale separately. That's the heart of async.

**Topic and subscriptions.** A **topic** is a named channel. Each **subscription** attached to that topic gets **its own copy** of every message published after it was created. That's the key to **fan-out**: an `order.placed` event → a `billing` subscription, an `email` subscription, an `analytics` subscription, each consuming at its own pace. (On AWS you needed SNS **and** SQS; Pub/Sub combines both.)

**Pull vs push.** A **pull** subscription: the consumer actively **pulls** messages (`pull`) when ready — ideal for a worker controlling its own throughput. A **push** subscription: Pub/Sub **pushes** each message as an **HTTPS POST** to a URL you provide (a web endpoint, a Cloud Function/Run) — ideal for reactive serverless, with no worker to keep running.

**Acknowledgement (ack).** A pulled message is **not** deleted right away: the consumer has an **ack deadline** to process then **acknowledge** it (`ack`). If it acks, the message is gone. If it **doesn't ack** (failure, `nack`, or deadline exceeded), Pub/Sub **redelivers** it — delivery is **at-least-once**. The consumer must therefore be **idempotent**.

**Attributes & filters.** A message carries **data** (the body, in bytes) and **attributes** (key-value pairs, e.g. `region=eu`, `type=order`). A subscription can declare a **filter** (`attributes.type = "order"`): it receives **only** matching messages. You sort the stream **at the source**, with no consumer-side code.

**Ordering keys.** By default, Pub/Sub does **not** guarantee ordering (throughput first). If order matters (events for one account, one device), you publish with an **ordering key** (`ordering_key`): all messages with the same key are delivered **in** publish order.

**Dead-letter & retry.** A "poison" message (failing every attempt) could loop forever. A **dead-letter** policy says: "after N delivery attempts, move this message to a **dead-letter topic**." You attach a watch subscription there to inspect failures. You also tune the **retry policy** (with back-off).
:::

:::figure gcp-pubsub-fanout
caption_fr: "Schéma 1. Pub/Sub en fan-out : un producteur publie sur un sujet ; chaque abonnement (facturation, email, analytique) reçoit sa propre copie et consomme à son rythme (pull ou push). Un message non acquitté est redistribué ; après N échecs, il part vers le sujet de dead-letter. Producteur et consommateurs restent découplés."
caption_en: "Figure 1. Pub/Sub fan-out: a publisher publishes to a topic; each subscription (billing, email, analytics) gets its own copy and consumes at its own pace (pull or push). An unacked message is redelivered; after N failures, it goes to the dead-letter topic. Publisher and consumers stay decoupled."
:::

## walkthrough

:::lang fr
On avance ainsi : sujet & fan-out → pull vs push → ack/nack & redistribution → attributs & filtres → clés d'ordre → dead-letter & retry → pattern événementiel & nettoyage.
:::

:::lang en
We'll go like this: topic & fan-out → pull vs push → ack/nack & redelivery → attributes & filters → ordering keys → dead-letter & retry → event-driven pattern & cleanup.
:::

### step-01

:::lang fr
**Objectif.** Créer un **sujet** et **deux abonnements**, et voir le **fan-out** en action — live.

**🤔 Une source, plusieurs consommateurs.** Chaque abonnement reçoit **sa** copie. Publie **un** message sur le sujet `commandes`, tire-le sur **deux** abonnements (`facturation`, `email`) : les deux le reçoivent, indépendamment. C'est ça, le découplage un-vers-plusieurs.

Crée le sujet, les abonnements, publie et tire des deux côtés :
:::

:::lang en
**Goal.** Create a **topic** and **two subscriptions**, and see **fan-out** in action — live.

**🤔 One source, many consumers.** Each subscription gets **its** copy. Publish **one** message to the `commandes` topic, pull it from **two** subscriptions (`facturation`, `email`): both receive it, independently. That's one-to-many decoupling.

Create the topic, the subscriptions, publish and pull from both sides:
:::

```python
# fanout.py
from google.cloud import pubsub_v1
projet = "demo-projet"
pub = pubsub_v1.PublisherClient()
sub = pubsub_v1.SubscriberClient()

sujet = pub.topic_path(projet, "commandes")
fact  = sub.subscription_path(projet, "facturation")
email = sub.subscription_path(projet, "email")

pub.create_topic(request={"name": sujet})
sub.create_subscription(request={"name": fact,  "topic": sujet})
sub.create_subscription(request={"name": email, "topic": sujet})
print("sujet + 2 abonnements créés")

# Publier UN message / publish ONE message
pub.publish(sujet, b"commande #42").result()

# Chaque abonnement reçoit sa copie / each subscription gets its copy
for nom, ab in [("facturation", fact), ("email", email)]:
    rep = sub.pull(request={"subscription": ab, "max_messages": 10})
    for m in rep.received_messages:
        print(f"{nom} reçoit :", m.message.data.decode())
        sub.acknowledge(request={"subscription": ab, "ack_ids": [m.ack_id]})
```

```bash
export PUBSUB_EMULATOR_HOST=localhost:8085
python3 fanout.py
```

:::lang fr
**✅ Vérification :** le script affiche `sujet + 2 abonnements créés`, puis `facturation reçoit : commande #42` **et** `email reçoit : commande #42`. Un seul `publish`, **deux** consommateurs servis : c'est le fan-out. Chaque abonnement a sa file logique indépendante — si `email` est lent ou en panne, `facturation` avance quand même. ⚠️ Un abonnement ne reçoit que les messages publiés **après** sa création : crée toujours l'abonnement **avant** de publier.
:::

:::lang en
**✅ Check:** the script prints `sujet + 2 abonnements créés`, then `facturation reçoit : commande #42` **and** `email reçoit : commande #42`. One `publish`, **two** consumers served: that's fan-out. Each subscription has its own independent logical queue — if `email` is slow or down, `facturation` still progresses. ⚠️ A subscription only receives messages published **after** its creation: always create the subscription **before** publishing.
:::

### step-02

:::lang fr
**Objectif.** Distinguer les abonnements **pull** et **push** — concept, avec le pull en live.

**🤔 Qui déclenche la livraison ?** En **pull**, c'est le **consommateur** : il appelle `pull()` quand il est prêt (idéal pour un worker qui maîtrise son débit, retraite par lots, tourne en continu). En **push**, c'est **Pub/Sub** : il envoie un **POST HTTPS** vers ton **endpoint** (une Cloud Function/Run, un service web) à chaque message (idéal pour du serverless réactif, sans processus à maintenir). Même sujet, même message — seule la **mécanique de livraison** change.

⚠️ **Note émulateur :** le **pull** est ce qu'on utilise partout ici, **pleinement émulé**. Le **push** nécessite un endpoint HTTPS joignable ; il se **décrit** (concept + syntaxe) mais on ne le déclenche pas dans le labo. La commande de création d'un abonnement push (vrai GCP) :
:::

:::lang en
**Goal.** Tell **pull** and **push** subscriptions apart — concept, with pull live.

**🤔 Who triggers delivery?** In **pull**, the **consumer** does: it calls `pull()` when ready (ideal for a worker that controls throughput, batches, runs continuously). In **push**, **Pub/Sub** does: it sends an **HTTPS POST** to your **endpoint** (a Cloud Function/Run, a web service) for each message (ideal for reactive serverless, no process to maintain). Same topic, same message — only the **delivery mechanics** change.

⚠️ **Emulator note:** **pull** is what we use everywhere here, **fully emulated**. **Push** needs a reachable HTTPS endpoint; it's **described** (concept + syntax) but we don't trigger it in the lab. The push-subscription creation command (real GCP):
:::

```bash
# PULL (le mode qu'on utilise ici — créé plus haut via la bibliothèque cliente) : le worker tire
# Équivalent CLI sur le VRAI GCP / CLI equivalent on REAL GCP:
gcloud pubsub subscriptions create facturation --topic=commandes

# PUSH (vrai GCP) : Pub/Sub POST vers ton endpoint HTTPS
gcloud pubsub subscriptions create notif-web \
  --topic=commandes \
  --push-endpoint=https://mon-service.example.com/pubsub \
  --ack-deadline=10
```

:::lang fr
**✅ Vérification :** en **pull** (émulateur), tu as déjà vu la livraison marcher à l'étape 1. Retiens la grille de choix : **pull** = worker qui maîtrise son rythme, gros volumes, retraitement ; **push** = réaction immédiate vers un service HTTP/serverless, pas de worker à faire tourner. En push, l'endpoint doit **répondre 2xx** pour valoir `ack` (sinon Pub/Sub redistribue, exactement comme en pull). ⚠️ `gcloud pubsub` vise le **vrai** GCP : ces commandes ne s'exécutent pas contre l'émulateur (qui, lui, se pilote par la bibliothèque cliente) — elles sont là pour l'examen et le vrai projet.
:::

:::lang en
**✅ Check:** in **pull** (emulator), you already saw delivery work in step 1. Remember the choice grid: **pull** = a worker that controls its pace, high volumes, reprocessing; **push** = immediate reaction to an HTTP/serverless service, no worker to keep running. In push, the endpoint must **return 2xx** to count as `ack` (otherwise Pub/Sub redelivers, exactly like pull). ⚠️ `gcloud pubsub` targets **real** GCP: these commands don't run against the emulator (which is driven by the client library) — they're here for the exam and the real project.
:::

### step-03

:::lang fr
**Objectif.** Maîtriser l'**accusé de réception** : `ack`, `nack`, délai, et la **redistribution** — live.

**🤔 At-least-once.** Un message tiré reste « en vol » jusqu'à l'`ack`. Si le consommateur échoue et **n'acquitte pas** (ou renvoie un `nack`), Pub/Sub le **redistribue** : la garantie est **au moins une fois**. Ici on simule un échec en **remettant le message à disposition** (`modify_ack_deadline` à `0` = « je n'ai pas fini, redonne-le »), puis on le re-tire et on l'acquitte pour de bon.

Simule un échec puis un succès :
:::

:::lang en
**Goal.** Master **acknowledgement**: `ack`, `nack`, deadline, and **redelivery** — live.

**🤔 At-least-once.** A pulled message stays "in flight" until `ack`. If the consumer fails and **doesn't ack** (or sends a `nack`), Pub/Sub **redelivers** it: the guarantee is **at-least-once**. Here we simulate a failure by **making the message available again** (`modify_ack_deadline` to `0` = "I'm not done, give it back"), then re-pull it and ack it for real.

Simulate a failure then a success:
:::

```python
# ack_nack.py
from google.cloud import pubsub_v1
from google.api_core.exceptions import DeadlineExceeded, RetryError
projet = "demo-projet"
pub = pubsub_v1.PublisherClient(); sub = pubsub_v1.SubscriberClient()
sujet = pub.topic_path(projet, "commandes")
fact  = sub.subscription_path(projet, "facturation")

# Un corps de message est en octets : on encode une chaîne accentuée (jamais b"…à…").
# A message body is bytes: encode an accented string (never a b"…à…" literal).
pub.publish(sujet, "paiement à traiter".encode()).result()

# 1er tir : on SIMULE un échec -> nack (remettre à dispo) / simulate failure -> nack
rep = sub.pull(request={"subscription": fact, "max_messages": 10})
for m in rep.received_messages:
    print("tentative 1, reçu :", m.message.data.decode(), "-> nack (échec simulé)")
    sub.modify_ack_deadline(request={"subscription": fact,
                                     "ack_ids": [m.ack_id], "ack_deadline_seconds": 0})

# 2e tir : Pub/Sub a redistribué -> cette fois on ACK / redelivered -> now ack
import time; time.sleep(1)
rep = sub.pull(request={"subscription": fact, "max_messages": 10})
for m in rep.received_messages:
    print("tentative 2, reçu :", m.message.data.decode(), "-> ack (succès)")
    sub.acknowledge(request={"subscription": fact, "ack_ids": [m.ack_id]})

# 3e tir : plus rien. Un pull sur file vide peut "attendre" (long-poll) : on le borne à 5 s.
# nothing left. A pull on an empty queue may long-poll: we bound it to 5 s.
try:
    rep = sub.pull(request={"subscription": fact, "max_messages": 10}, timeout=5)
    restants = len(rep.received_messages)
except (DeadlineExceeded, RetryError):
    restants = 0
print("tentative 3, messages restants :", restants)
```

```bash
python3 ack_nack.py
```

:::lang fr
**✅ Vérification :** tu vois `tentative 1 ... -> nack`, puis `tentative 2 ... -> ack`, puis `tentative 3, messages restants : 0`. Le même message a été **redistribué** après le nack, puis a **disparu** après l'ack. C'est la garantie **at-least-once** en action. (Le 3ᵉ tir est **borné à 5 s** : un `pull` synchrone sur une file vide peut sinon patienter le temps d'un long-poll côté serveur — d'où le `try/except` autour.) ⚠️ **Conséquence majeure (point ACE) :** comme un message peut arriver **plusieurs fois**, ton traitement doit être **idempotent** (traiter deux fois « paiement #42 » ne doit pas débiter deux fois). Le **délai d'accusé** (ack deadline) fixe le temps avant redistribution automatique : trop court, tu retraites en boucle ; trop long, un vrai échec traîne.
:::

:::lang en
**✅ Check:** you see `tentative 1 ... -> nack`, then `tentative 2 ... -> ack`, then `tentative 3, messages restants : 0`. The same message was **redelivered** after the nack, then **vanished** after the ack. That's the **at-least-once** guarantee in action. (The 3rd pull is **bounded to 5 s**: a synchronous `pull` on an empty queue can otherwise wait out a server-side long-poll — hence the `try/except`.) ⚠️ **Major consequence (ACE point):** since a message can arrive **several times**, your processing must be **idempotent** (handling "payment #42" twice must not debit twice). The **ack deadline** sets the time before automatic redelivery: too short, you reprocess in a loop; too long, a real failure lingers.
:::

### step-04

:::lang fr
**Objectif.** Publier des **attributs** et **filtrer** un abonnement dessus — live.

**🤔 Trier à la source.** Plutôt que de tout recevoir et jeter côté code, on attache un **filtre** à l'abonnement : il ne reçoit **que** les messages dont les **attributs** correspondent. Moins de trafic, moins de code, moins d'erreurs. Le filtre se déclare **à la création** de l'abonnement (immuable ensuite).

⚠️ **Note émulateur :** les attributs **et** les filtres sont **pleinement émulés** ici — tu verras réellement le tri. Crée un abonnement filtré `prio = "haute"`, publie deux messages, vérifie qu'un seul passe :
:::

:::lang en
**Goal.** Publish **attributes** and **filter** a subscription on them — live.

**🤔 Sort at the source.** Rather than receiving everything and discarding in code, you attach a **filter** to the subscription: it receives **only** messages whose **attributes** match. Less traffic, less code, fewer bugs. The filter is declared **at subscription creation** (immutable afterwards).

⚠️ **Emulator note:** attributes **and** filters are **fully emulated** here — you'll really see the sorting. Create a filtered subscription `prio = "haute"`, publish two messages, check that only one gets through:
:::

```python
# filtres.py
from google.cloud import pubsub_v1
projet = "demo-projet"
pub = pubsub_v1.PublisherClient(); sub = pubsub_v1.SubscriberClient()
sujet = pub.topic_path(projet, "commandes")
urgent = sub.subscription_path(projet, "urgentes")

# Abonnement avec FILTRE sur un attribut / subscription with attribute FILTER
sub.create_subscription(request={
    "name": urgent, "topic": sujet,
    "filter": 'attributes.prio = "haute"'
})
print("abonnement filtré (prio=haute) créé")

# Publier avec ATTRIBUTS / publish WITH attributes (kwargs = attributs)
pub.publish(sujet, b"petite commande", prio="basse").result()
pub.publish(sujet, b"commande VIP",    prio="haute").result()

import time; time.sleep(1)
rep = sub.pull(request={"subscription": urgent, "max_messages": 10})
for m in rep.received_messages:
    print("urgentes reçoit :", m.message.data.decode(), "| attrs :", dict(m.message.attributes))
    sub.acknowledge(request={"subscription": urgent, "ack_ids": [m.ack_id]})
print("nb messages passés le filtre :", len(rep.received_messages))
```

```bash
python3 filtres.py
```

:::lang fr
**✅ Vérification :** le script affiche `abonnement filtré (prio=haute) créé`, puis **une seule** ligne `urgentes reçoit : commande VIP | attrs : {'prio': 'haute'}`, et `nb messages passés le filtre : 1`. Le message `prio=basse` a été **écarté à la source** — l'abonnement ne l'a jamais vu. Tu viens de router par contenu **sans une ligne de logique côté consommateur**. ⚠️ Le filtre porte sur les **attributs**, pas sur le corps du message (les données en octets) : mets dans les attributs ce sur quoi tu veux filtrer (type, région, priorité).
:::

:::lang en
**✅ Check:** the script prints `abonnement filtré (prio=haute) créé`, then **a single** line `urgentes reçoit : commande VIP | attrs : {'prio': 'haute'}`, and `nb messages passés le filtre : 1`. The `prio=basse` message was **dropped at the source** — the subscription never saw it. You just routed by content **without a single line of consumer logic**. ⚠️ The filter is on **attributes**, not on the message body (the byte data): put in attributes whatever you want to filter on (type, region, priority).
:::

### step-05

:::lang fr
**Objectif.** Garantir l'**ordre** avec une **clé d'ordre** — live.

**🤔 Ordre vs débit.** Par défaut, Pub/Sub privilégie le **débit** et ne garantit **pas** l'ordre : deux messages peuvent arriver inversés. Quand l'ordre compte (les événements d'**un même** compte, d'**un même** appareil), on publie avec une **clé d'ordre** : Pub/Sub livre alors, **par clé**, dans l'ordre de publication. Il faut activer l'ordre côté **publisher** (`enable_message_ordering`).

Publie trois messages ordonnés sur une même clé :
:::

:::lang en
**Goal.** Guarantee **ordering** with an **ordering key** — live.

**🤔 Order vs throughput.** By default, Pub/Sub favors **throughput** and does **not** guarantee order: two messages can arrive swapped. When order matters (events for **one** account, **one** device), you publish with an **ordering key**: Pub/Sub then delivers, **per key**, in publish order. You must enable ordering on the **publisher** side (`enable_message_ordering`).

Publish three ordered messages on the same key:
:::

```python
# ordre.py
from google.cloud import pubsub_v1
projet = "demo-projet"
# Publisher avec ordre activé / publisher with ordering enabled
opts = pubsub_v1.types.PublisherOptions(enable_message_ordering=True)
pub = pubsub_v1.PublisherClient(publisher_options=opts)
sub = pubsub_v1.SubscriberClient()
sujet = pub.topic_path(projet, "commandes")
suivi = sub.subscription_path(projet, "suivi-compte")

# L'ordre doit AUSSI être activé côté abonnement (obligatoire sur le vrai GCP).
# Ordering must ALSO be enabled on the subscription (required on real GCP).
sub.create_subscription(request={"name": suivi, "topic": sujet,
                                 "enable_message_ordering": True})

# 3 événements d'un même compte, avec clé d'ordre / same account, ordering key
for etape in ["créée", "payée", "expédiée"]:
    pub.publish(sujet, f"commande {etape}".encode(), ordering_key="compte-7").result()

import time; time.sleep(1)
rep = sub.pull(request={"subscription": suivi, "max_messages": 10})
recus = [m.message.data.decode() for m in rep.received_messages]
print("ordre reçu :", recus)
for m in rep.received_messages:
    sub.acknowledge(request={"subscription": suivi, "ack_ids": [m.ack_id]})
```

```bash
python3 ordre.py
```

:::lang fr
**✅ Vérification :** le script affiche `ordre reçu : ['commande créée', 'commande payée', 'commande expédiée']` — **exactement** l'ordre de publication. Sans clé d'ordre, `payée` pourrait précéder `créée`. La clé garantit la séquence **par entité** (ici `compte-7`), pas globalement : deux comptes différents restent parallèles (et rapides). ⚠️ En vrai GCP, l'ordre a un **coût de débit** (les messages d'une clé se sérialisent) : ne l'active **que** là où c'est nécessaire. Côté consommateur, l'abonnement doit aussi **activer** la livraison ordonnée (dans la console/`gcloud`, `--enable-message-ordering`).
:::

:::lang en
**✅ Check:** the script prints `ordre reçu : ['commande créée', 'commande payée', 'commande expédiée']` — **exactly** the publish order. Without an ordering key, `payée` could precede `créée`. The key guarantees the sequence **per entity** (here `compte-7`), not globally: two different accounts stay parallel (and fast). ⚠️ On real GCP, ordering has a **throughput cost** (a key's messages serialize): enable it **only** where needed. On the consumer side, the subscription must also **enable** ordered delivery (in the console/`gcloud`, `--enable-message-ordering`).
:::

### step-06

:::lang fr
**Objectif.** Configurer une politique de **dead-letter** et de **nouvelle tentative** — création live, routage en concept.

**🤔 Le message empoisonné.** Un message qui échoue **à chaque** tentative (données corrompues, bug) tournerait en boucle et bloquerait la file. La parade : une politique de **dead-letter** — « après **N** tentatives de livraison, envoie ce message vers un **sujet de rebut** ». On y branche un abonnement de surveillance pour l'inspecter à froid. On règle aussi le **back-off** des nouvelles tentatives.

⚠️ **Note émulateur :** la **création** de la politique (dead-letter + max de tentatives) est **émulée** — on la crée et on la **relit** en live. En revanche, le **routage effectif** vers le sujet de rebut (qui suppose de dépasser réellement N tentatives) se **conceptualise** : on ne le déclenche pas ici.

Crée le sujet de rebut et un abonnement avec politique de dead-letter :
:::

:::lang en
**Goal.** Configure a **dead-letter** and **retry** policy — creation live, routing as concept.

**🤔 The poison message.** A message failing **every** attempt (corrupt data, a bug) would loop forever and block the queue. The fix: a **dead-letter** policy — "after **N** delivery attempts, send this message to a **dead-letter topic**." You attach a watch subscription there to inspect it cold. You also tune the retry **back-off**.

⚠️ **Emulator note:** the policy **creation** (dead-letter + max attempts) is **emulated** — we create it and **read it back** live. However, the **actual routing** to the dead-letter topic (which requires really exceeding N attempts) is **conceptualized**: we don't trigger it here.

Create the dead-letter topic and a subscription with a dead-letter policy:
:::

```python
# deadletter.py
from google.cloud import pubsub_v1
projet = "demo-projet"
pub = pubsub_v1.PublisherClient(); sub = pubsub_v1.SubscriberClient()

sujet   = pub.topic_path(projet, "commandes")
rebut   = pub.topic_path(projet, "commandes-rebut")     # dead-letter topic
travail = sub.subscription_path(projet, "traitement")
veille  = sub.subscription_path(projet, "rebut-veille")

pub.create_topic(request={"name": rebut})
sub.create_subscription(request={"name": veille, "topic": rebut})

# Abonnement de travail AVEC politique de dead-letter / with dead-letter policy
sub.create_subscription(request={
    "name": travail, "topic": sujet,
    "dead_letter_policy": {
        "dead_letter_topic": rebut,
        "max_delivery_attempts": 5,
    },
})
print("abonnement avec dead-letter créé")

# Relire la politique pour confirmer / read the policy back to confirm
got = sub.get_subscription(request={"subscription": travail})
print("dead-letter topic :", got.dead_letter_policy.dead_letter_topic)
print("max tentatives     :", got.dead_letter_policy.max_delivery_attempts)
```

```bash
python3 deadletter.py
```

:::lang fr
**✅ Vérification :** le script affiche `abonnement avec dead-letter créé`, puis `dead-letter topic : projects/demo-projet/topics/commandes-rebut` et `max tentatives : 5`. La politique est **bien enregistrée** sur l'abonnement (création émulée, relue en live). En **réel**, après 5 livraisons non acquittées, Pub/Sub déplacerait le message vers `commandes-rebut`, où l'abonnement `rebut-veille` te permet de l'analyser. ⚠️ **Points ACE :** (1) le dead-letter topic doit être **différent** du sujet source ; (2) Pub/Sub a besoin des **droits** de publier dans le rebut et d'acquitter la source (IAM — vu au guide suivant) ; (3) `delivery_attempt` sur le message reçu te dit combien de fois il a déjà été livré.
:::

:::lang en
**✅ Check:** the script prints `abonnement avec dead-letter créé`, then `dead-letter topic : projects/demo-projet/topics/commandes-rebut` and `max tentatives : 5`. The policy is **properly recorded** on the subscription (creation emulated, read back live). On **real** GCP, after 5 unacked deliveries, Pub/Sub would move the message to `commandes-rebut`, where the `rebut-veille` subscription lets you analyze it. ⚠️ **ACE points:** (1) the dead-letter topic must be **different** from the source topic; (2) Pub/Sub needs the **rights** to publish to the dead-letter and ack the source (IAM — next guide); (3) `delivery_attempt` on the received message tells you how many times it's already been delivered.
:::

### step-07

:::lang fr
**Objectif.** Ancrer le **pattern événementiel**, puis nettoyer.

**🤔 Le déclic d'architecte.** Pub/Sub, c'est le **système nerveux** d'une architecture cloud : un service **émet un événement** (« commande passée »), et **plusieurs** services y réagissent **sans se connaître** (facturation, e-mail, analytique, stock). Ajouter un consommateur = **ajouter un abonnement**, sans toucher au producteur. C'est ce **découplage** qui rend les systèmes cloud extensibles et résilients — et c'est **exactement** ce que le projet d'entreprise GCP construira.

Récapitule tes abonnements, puis nettoie :
:::

:::lang en
**Goal.** Anchor the **event-driven pattern**, then clean up.

**🤔 The architect's click.** Pub/Sub is the **nervous system** of a cloud architecture: a service **emits an event** ("order placed"), and **several** services react to it **without knowing each other** (billing, email, analytics, stock). Adding a consumer = **adding a subscription**, without touching the producer. This **decoupling** is what makes cloud systems extensible and resilient — and it's **exactly** what the GCP enterprise project will build.

Recap your subscriptions, then clean up:
:::

```python
# recap_nettoyage.py
from google.cloud import pubsub_v1
projet = "demo-projet"
pub = pubsub_v1.PublisherClient(); sub = pubsub_v1.SubscriberClient()
chemin_projet = f"projects/{projet}"

# Récap : les abonnements du projet / recap: the project's subscriptions
subs = list(sub.list_subscriptions(request={"project": chemin_projet}))
print("abonnements :", [s.name.split('/')[-1] for s in subs])

# Nettoyage : supprimer abonnements puis sujets / delete subs then topics
for s in subs:
    sub.delete_subscription(request={"subscription": s.name})
for t in pub.list_topics(request={"project": chemin_projet}):
    pub.delete_topic(request={"topic": t.name})

restants = len(list(pub.list_topics(request={"project": chemin_projet})))
print("sujets restants après nettoyage :", restants)
```

```bash
python3 recap_nettoyage.py
```

:::lang fr
**✅ Vérification :** le récap liste tes abonnements (`facturation`, `email`, `urgentes`, `suivi-compte`, `traitement`, `rebut-veille`…), puis `sujets restants après nettoyage : 0`. Ton émulateur est propre. Tu maîtrises maintenant Pub/Sub au niveau ACE : **fan-out**, **pull/push**, **ack/nack & redistribution**, **filtres**, **ordre**, **dead-letter**. ⚠️ **Ordre de suppression :** abonnements **puis** sujets (un sujet avec abonnements attachés se supprime, mais on nettoie proprement de bas en haut). La suite : **IAM & Terraform** — donner les bons droits, et décrire tout ça en infrastructure-as-code.
:::

:::lang en
**✅ Check:** the recap lists your subscriptions (`facturation`, `email`, `urgentes`, `suivi-compte`, `traitement`, `rebut-veille`…), then `sujets restants après nettoyage : 0`. Your emulator is clean. You now master Pub/Sub at ACE level: **fan-out**, **pull/push**, **ack/nack & redelivery**, **filters**, **ordering**, **dead-letter**. ⚠️ **Deletion order:** subscriptions **then** topics (a topic with attached subscriptions can be deleted, but we clean bottom-up). Next up: **IAM & Terraform** — granting the right rights, and describing all this as infrastructure-as-code.
:::

## pitfalls

:::lang fr
**1. Croire qu'un sujet garde les messages sans abonnement.** Un message publié n'est retenu que pour les **abonnements existants au moment de la publication**. Pas d'abonnement = message perdu. Crée l'abonnement **avant** de publier.

**2. Oublier l'idempotence.** Livraison **at-least-once** = un message peut arriver **deux fois**. Un traitement non idempotent (débiter, incrémenter) produit des doublons. Déduplique (par `message_id` ou une clé métier).

**3. Confondre données et attributs.** Le **corps** (`data`, octets) porte la charge ; les **attributs** portent les métadonnées **filtrables**. On ne filtre **pas** sur le corps.

**4. Attendre l'ordre sans clé d'ordre.** Par défaut, **aucune** garantie d'ordre. Il faut une **clé d'ordre** (et l'activer côté publisher). Et ça sérialise par clé — coûteux si mal ciblé.

**5. Régler un ack deadline absurde.** Trop court → le message est redistribué avant la fin du traitement (boucles). Trop long → un vrai échec bloque longtemps. Ajuste au temps de traitement réel (et prolonge dynamiquement pour les longs).

**6. Dead-letter = même sujet.** Le sujet de rebut doit être **distinct** du sujet source, sinon boucle. Et il faut les **droits IAM** pour que Pub/Sub y publie.

**7. Vouloir piloter l'émulateur avec `gcloud pubsub`.** `gcloud pubsub` vise **toujours** le vrai GCP. L'émulateur se pilote par la **bibliothèque cliente** (`PUBSUB_EMULATOR_HOST`).
:::

:::lang en
**1. Thinking a topic keeps messages with no subscription.** A published message is retained only for **subscriptions existing at publish time**. No subscription = message lost. Create the subscription **before** publishing.

**2. Forgetting idempotence.** **At-least-once** delivery = a message can arrive **twice**. Non-idempotent processing (debiting, incrementing) produces duplicates. Deduplicate (by `message_id` or a business key).

**3. Confusing data and attributes.** The **body** (`data`, bytes) carries the payload; **attributes** carry the **filterable** metadata. You do **not** filter on the body.

**4. Expecting ordering without an ordering key.** By default, **no** ordering guarantee. You need an **ordering key** (and to enable it on the publisher). And it serializes per key — costly if badly targeted.

**5. Setting an absurd ack deadline.** Too short → the message is redelivered before processing finishes (loops). Too long → a real failure blocks for a while. Tune it to actual processing time (and extend dynamically for long ones).

**6. Dead-letter = same topic.** The dead-letter topic must be **distinct** from the source topic, else a loop. And Pub/Sub needs the **IAM rights** to publish to it.

**7. Trying to drive the emulator with `gcloud pubsub`.** `gcloud pubsub` **always** targets real GCP. The emulator is driven by the **client library** (`PUBSUB_EMULATOR_HOST`).
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées un sujet et **plusieurs abonnements**, et tu expliques le fan-out.
- [ ] Tu distingues **pull** et **push** et sais quand choisir chacun.
- [ ] Tu provoques une **redistribution** (nack) puis un **ack** propre.
- [ ] Tu publies des **attributs** et **filtres** un abonnement dessus.
- [ ] Tu garantis l'**ordre** avec une clé d'ordre.
- [ ] Tu configures une politique de **dead-letter** et la relis.
- [ ] Tu expliques pourquoi le consommateur doit être **idempotent**.

Sept cases = tu tiens Pub/Sub au niveau ACE. La suite : IAM & Terraform.
:::

:::lang en
You know it works when…

- [ ] You create a topic and **several subscriptions**, and explain fan-out.
- [ ] You tell **pull** and **push** apart and know when to choose each.
- [ ] You trigger a **redelivery** (nack) then a clean **ack**.
- [ ] You publish **attributes** and **filter** a subscription on them.
- [ ] You guarantee **ordering** with an ordering key.
- [ ] You configure a **dead-letter** policy and read it back.
- [ ] You explain why the consumer must be **idempotent**.

Seven boxes = you hold Pub/Sub at ACE level. Next up: IAM & Terraform.
:::

## next

:::lang fr
La suite du track GCP → ACE :

1. **GCP — IAM & Terraform** : rôles, comptes de service, principe du moindre privilège, et décrire ton infra en **Terraform** (provider `google`) — la compétence pro de l'ACE.
2. Plus loin : le **projet d'entreprise** (pipeline événementiel complet sur émulateurs + Terraform), puis **passer en réel**.
:::

:::lang en
The GCP → ACE track continues:

1. **GCP — IAM & Terraform**: roles, service accounts, least privilege, and describing your infra in **Terraform** (`google` provider) — the ACE's pro skill.
2. Further along: the **enterprise project** (a full event-driven pipeline on emulators + Terraform), then **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire Pub/Sub (bibliothèque cliente Python, `PUBSUB_EMULATOR_HOST`).
:::

:::lang en
Pub/Sub cheat sheet (Python client library, `PUBSUB_EMULATOR_HOST`).
:::

```python
from google.cloud import pubsub_v1
pub = pubsub_v1.PublisherClient(); sub = pubsub_v1.SubscriberClient()
t = pub.topic_path("demo-projet","commandes"); a = sub.subscription_path("demo-projet","w")

pub.create_topic(request={"name": t})                       # sujet / topic
sub.create_subscription(request={"name": a, "topic": t})    # abonnement pull / pull sub
sub.create_subscription(request={"name": a, "topic": t, "filter": 'attributes.prio = "haute"'})  # filtre
pub.publish(t, b"corps", prio="haute").result()             # publier + attributs / publish + attrs
rep = sub.pull(request={"subscription": a, "max_messages": 10})
sub.acknowledge(request={"subscription": a, "ack_ids": [m.ack_id for m in rep.received_messages]})
sub.modify_ack_deadline(request={"subscription": a, "ack_ids":[id], "ack_deadline_seconds": 0})   # nack
```

```bash
# Ordre (publisher) / ordering (publisher)
#   PublisherClient(publisher_options=pubsub_v1.types.PublisherOptions(enable_message_ordering=True))
#   pub.publish(t, b"...", ordering_key="compte-7")
# Dead-letter (sur l'abonnement) / on the subscription:
#   "dead_letter_policy": {"dead_letter_topic": rebut, "max_delivery_attempts": 5}
# Push (VRAI GCP, pas l'émulateur) / push (REAL GCP):
gcloud pubsub subscriptions create s --topic=commandes --push-endpoint=https://ex/pubsub
```

## resources

:::lang fr
- [Pub/Sub — documentation](https://cloud.google.com/pubsub/docs) — sujets, abonnements, garanties.
- [Pull vs push](https://cloud.google.com/pubsub/docs/subscriber) — modes de livraison.
- [Filtres d'abonnement](https://cloud.google.com/pubsub/docs/subscription-message-filter) — syntaxe des filtres d'attributs.
- [Ordre des messages](https://cloud.google.com/pubsub/docs/ordering) — clés d'ordre.
- [Dead-letter & retry](https://cloud.google.com/pubsub/docs/handling-failures) — sujet de rebut, back-off.
- [Émulateur Pub/Sub](https://cloud.google.com/pubsub/docs/emulator) — le labo local.
:::

:::lang en
- [Pub/Sub — documentation](https://cloud.google.com/pubsub/docs) — topics, subscriptions, guarantees.
- [Pull vs push](https://cloud.google.com/pubsub/docs/subscriber) — delivery modes.
- [Subscription filters](https://cloud.google.com/pubsub/docs/subscription-message-filter) — attribute-filter syntax.
- [Message ordering](https://cloud.google.com/pubsub/docs/ordering) — ordering keys.
- [Dead-letter & retry](https://cloud.google.com/pubsub/docs/handling-failures) — dead-letter topic, back-off.
- [Pub/Sub emulator](https://cloud.google.com/pubsub/docs/emulator) — the local lab.
:::

## troubleshooting

:::lang fr
**Le `pull` ne renvoie rien.** L'abonnement a-t-il été créé **avant** le `publish` ? Un abonnement ne reçoit que les messages postérieurs à sa création. Republie après création, ou augmente `max_messages` et réessaie (le premier `pull` peut revenir vide, retente).

**Le client vise le vrai GCP (erreur d'auth).** `PUBSUB_EMULATOR_HOST=localhost:8085` n'est pas exporté dans **ce** shell. Ré-exporte-le avant de lancer python3.

**`gcloud pubsub topics list` ne montre pas mes sujets.** Normal : `gcloud pubsub` vise le vrai GCP, **pas** l'émulateur. Liste via la bibliothèque cliente (`pub.list_topics`).

**Mon message n'arrive jamais sur l'abonnement filtré.** Vérifie que tu publies bien l'**attribut** attendu (kwargs du `publish`) et que la **syntaxe** du filtre correspond (`attributes.cle = "valeur"`, guillemets compris). Le filtre est **immuable** : recrée l'abonnement pour le changer.

**Les messages arrivent dans le désordre.** Sans **clé d'ordre** + `enable_message_ordering` côté publisher, aucun ordre garanti. Ajoute la clé, et côté abonnement active la livraison ordonnée.

**Un message revient sans cesse.** Tu ne l'acquittes pas (`ack`) à temps, ou ton traitement échoue : Pub/Sub redistribue (at-least-once). Corrige le traitement, ajuste l'ack deadline, et pour les cas irrécupérables ajoute une politique de **dead-letter**.
:::

:::lang en
**`pull` returns nothing.** Was the subscription created **before** the `publish`? A subscription only receives messages after its creation. Re-publish after creation, or raise `max_messages` and retry (the first `pull` may come back empty — retry).

**The client targets real GCP (auth error).** `PUBSUB_EMULATOR_HOST=localhost:8085` isn't exported in **this** shell. Re-export it before running python3.

**`gcloud pubsub topics list` doesn't show my topics.** Normal: `gcloud pubsub` targets real GCP, **not** the emulator. List via the client library (`pub.list_topics`).

**My message never reaches the filtered subscription.** Check you publish the expected **attribute** (kwargs of `publish`) and that the filter **syntax** matches (`attributes.key = "value"`, quotes included). The filter is **immutable**: recreate the subscription to change it.

**Messages arrive out of order.** Without an **ordering key** + `enable_message_ordering` on the publisher, no ordering is guaranteed. Add the key, and on the subscription enable ordered delivery.

**A message keeps coming back.** You're not acking it in time, or your processing fails: Pub/Sub redelivers (at-least-once). Fix the processing, tune the ack deadline, and for unrecoverable cases add a **dead-letter** policy.
:::
