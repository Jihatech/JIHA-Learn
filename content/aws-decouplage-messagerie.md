---
# — Identité (ne change JAMAIS une fois publié) —
id: aws-decouplage-messagerie
slug: aws-decouplage-messagerie
order: 49
status: published

# — Titres & accroches (bilingue) —
title_fr: "AWS — découplage & données : SQS, SNS, DynamoDB"
title_en: "AWS — decoupling & data: SQS, SNS, DynamoDB"
tagline_fr: "files SQS, sujets SNS, fan-out, base NoSQL DynamoDB."
tagline_en: "SQS queues, SNS topics, fan-out, DynamoDB NoSQL."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 220
repo: "localstack/localstack"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [aws-compute-ec2-lambda]
next: [aws-projet-entreprise]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [file-sqs, dlq-fifo, sujet-sns, fan-out, dynamodb-nosql, query-vs-scan, architecture-decouplee]
concepts_en: [sqs-queue, dlq-fifo, sns-topic, fan-out, dynamodb-nosql, query-vs-scan, decoupled-architecture]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le découplage pour le SAA-C03 : les files de messages SQS (découpler producteur/consommateur, visibility timeout, DLQ, FIFO), les sujets SNS (publish/subscribe), le motif fan-out SNS→SQS (un événement, N consommateurs), et la base NoSQL DynamoDB (table clé-valeur, clé de partition/tri, query vs scan). Comment rendre une architecture résiliente et élastique. Tout en LocalStack."
og_description_en: "Decoupling for SAA-C03: SQS message queues (decouple producer/consumer, visibility timeout, DLQ, FIFO), SNS topics (publish/subscribe), the SNS→SQS fan-out pattern (one event, N consumers), and DynamoDB NoSQL (key-value table, partition/sort key, query vs scan). How to make an architecture resilient and elastic. All on LocalStack."
---

## intro

:::lang fr
Une application où chaque composant appelle directement le suivant est **fragile** : si le service de facturation est lent ou tombe, la commande échoue en cascade. Une architecture **découplée** insère un **tampon** entre les composants — une **file de messages** — pour qu'ils travaillent à leur rythme, sans se bloquer. C'est le cœur du domaine **résilience** du SAA, et ce qui distingue une architecture qui « marche en démo » d'une architecture qui « tient en production ».

AWS fournit trois briques essentielles pour ça, et ce guide te les fait toutes manipuler. **SQS** (Simple Queue Service) : des **files de messages** où un producteur dépose des tâches qu'un consommateur traite plus tard, à son rythme. **SNS** (Simple Notification Service) : des **sujets** de publication où un événement est **diffusé** à plusieurs abonnés d'un coup (*fan-out*). Et **DynamoDB** : la **base NoSQL** d'AWS, ultra-rapide et élastique, pour stocker l'état de tes applications sans gérer de serveur de base de données.

Tout se fait en **LocalStack** : tu crées de vraies files, tu envoies et reçois des messages, tu montes un fan-out SNS→SQS, tu crées une table DynamoDB et tu l'interroges — les mêmes commandes qu'en réel, sans compte.

**Pour qui c'est :** tu as le compute (EC2/Lambda) en main et tu veux les briques qui relient et découplent les composants — indispensables pour le projet serverless qui suit.

**Quand ce n'est PAS le bon choix :**

- Tu débutes sur AWS → refais les guides précédents ; ici on assemble des services.
- Tu cherches une base **relationnelle** (SQL, jointures) → c'est RDS/Aurora, pas DynamoDB ; on couvre le NoSQL, adapté aux accès par clé à grande échelle.
:::

:::lang en
An application where each component directly calls the next is **fragile**: if the billing service is slow or down, the order fails in cascade. A **decoupled** architecture inserts a **buffer** between components — a **message queue** — so they work at their own pace, without blocking each other. It's the heart of the SAA's **resilience** domain, and what separates an architecture that "works in a demo" from one that "holds in production".

AWS provides three essential building blocks for this, and this guide has you handle them all. **SQS** (Simple Queue Service): **message queues** where a producer drops tasks that a consumer processes later, at its own pace. **SNS** (Simple Notification Service): publish **topics** where an event is **broadcast** to several subscribers at once (*fan-out*). And **DynamoDB**: AWS's **NoSQL database**, ultra-fast and elastic, to store your applications' state without managing a database server.

Everything runs on **LocalStack**: you create real queues, send and receive messages, build an SNS→SQS fan-out, create a DynamoDB table and query it — the same commands as the real thing, no account.

**Who it's for:** you hold compute (EC2/Lambda) and you want the blocks that connect and decouple components — essential for the serverless project that follows.

**When it's NOT the right choice:**

- You're new to AWS → redo the previous guides; here we assemble services.
- You want a **relational** database (SQL, joins) → that's RDS/Aurora, not DynamoDB; we cover NoSQL, suited to key-based access at scale.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Découpler avec une **file SQS** (envoyer, recevoir, supprimer) et comprendre le **visibility timeout**.
- Fiabiliser une file avec une **dead-letter queue** (DLQ) et distinguer **standard** vs **FIFO**.
- Publier/s'abonner avec un **sujet SNS**.
- Monter un **fan-out** SNS → plusieurs SQS (un événement, N consommateurs).
- Créer une **table DynamoDB** (clé de partition) et y écrire/lire des éléments.
- **Interroger** DynamoDB : `query` (efficace) vs `scan` (coûteux), et la clé de tri.
- Assembler une **architecture découplée** et choisir SQS vs SNS vs DynamoDB.
:::

:::lang en
By the end of this guide, you can:

- Decouple with an **SQS queue** (send, receive, delete) and understand the **visibility timeout**.
- Harden a queue with a **dead-letter queue** (DLQ) and tell **standard** from **FIFO**.
- Publish/subscribe with an **SNS topic**.
- Build a **fan-out** SNS → several SQS (one event, N consumers).
- Create a **DynamoDB table** (partition key) and write/read items.
- **Query** DynamoDB: `query` (efficient) vs `scan` (costly), and the sort key.
- Assemble a **decoupled architecture** and choose SQS vs SNS vs DynamoDB.
:::

## prerequisites

:::lang fr
- Les guides AWS précédents du track (jusqu'au **compute EC2 & Lambda**).
- **LocalStack qui tourne** et **`awslocal`** configuré. (Pas besoin du socket Docker ici : SQS/SNS/DynamoDB n'exécutent pas de conteneur.)
- De quoi lire du JSON sans peur (les éléments DynamoDB sont typés en JSON).
:::

:::lang en
- The previous AWS track guides (through **EC2 & Lambda compute**).
- **LocalStack running** and **`awslocal`** configured. (No Docker socket needed here: SQS/SNS/DynamoDB don't run a container.)
- Comfort reading JSON (DynamoDB items are typed in JSON).
:::

## concepts

:::lang fr
**SQS (file de messages).** Une **file** où un **producteur** dépose des messages qu'un **consommateur** lit et traite plus tard. Les deux sont **découplés** : le producteur n'attend pas, le consommateur traite à son rythme, et un pic de charge s'accumule dans la file au lieu de faire tomber le système. Un message reçu devient **invisible** un temps (le **visibility timeout**) pour qu'un autre consommateur ne le traite pas en double ; le consommateur le **supprime** une fois traité (sinon il redevient visible et sera retraité — livraison « au moins une fois »).

**DLQ & FIFO.** Une **dead-letter queue** (DLQ) recueille les messages qui échouent trop de fois (au lieu de boucler à l'infini) — on les inspecte ensuite. Une file **standard** offre un débit quasi illimité mais **ne garantit ni l'ordre ni l'unicité**. Une file **FIFO** garantit l'**ordre** et **exactement une fois**, au prix d'un débit plus limité. Choisir dépend du besoin (ordre critique ? doublons tolérés ?).

**SNS (sujet publish/subscribe).** Un **sujet** (topic) où un **publieur** envoie un message **diffusé** immédiatement à **tous les abonnés** (SQS, Lambda, e-mail, HTTP…). Contrairement à SQS (un message, un consommateur), SNS c'est **un message, N abonnés**. C'est le mécanisme de **notification/diffusion**.

**Fan-out.** Le motif classique : un **sujet SNS** avec **plusieurs files SQS** abonnées. Un seul événement publié se **duplique** dans chaque file, et chaque service consomme sa copie indépendamment. « Nouvelle commande » → une file pour la facturation, une pour l'expédition, une pour les stats — découplées et parallèles.

**DynamoDB (NoSQL).** Une base **clé-valeur / document** entièrement managée : pas de serveur, mise à l'échelle automatique, latence de l'ordre de la milliseconde. Une **table** a une **clé de partition** (obligatoire, qui répartit et identifie) et parfois une **clé de tri** (pour trier/filtrer des éléments partageant la même partition). Pas de schéma fixe : chaque **élément** (item) peut avoir ses propres attributs.

**query vs scan.** **`query`** cible une **clé de partition** précise (et éventuellement une plage de clé de tri) : rapide et peu coûteux. **`scan`** parcourt **toute la table** : simple mais lent et cher à grande échelle. Règle SAA : **conçois pour `query`**, évite les `scan` sur de grosses tables.
:::

:::lang en
**SQS (message queue).** A **queue** where a **producer** drops messages that a **consumer** reads and processes later. Both are **decoupled**: the producer doesn't wait, the consumer processes at its own pace, and a load spike accumulates in the queue instead of crashing the system. A received message becomes **invisible** for a while (the **visibility timeout**) so another consumer doesn't double-process it; the consumer **deletes** it once processed (otherwise it becomes visible again and gets reprocessed — "at least once" delivery).

**DLQ & FIFO.** A **dead-letter queue** (DLQ) collects messages that fail too many times (instead of looping forever) — you inspect them later. A **standard** queue offers near-unlimited throughput but **guarantees neither order nor uniqueness**. A **FIFO** queue guarantees **order** and **exactly once**, at the cost of lower throughput. The choice depends on the need (order critical? duplicates tolerated?).

**SNS (publish/subscribe topic).** A **topic** where a **publisher** sends a message **broadcast** immediately to **all subscribers** (SQS, Lambda, email, HTTP…). Unlike SQS (one message, one consumer), SNS is **one message, N subscribers**. It's the **notification/broadcast** mechanism.

**Fan-out.** The classic pattern: one **SNS topic** with **several SQS queues** subscribed. A single published event is **duplicated** into each queue, and each service consumes its copy independently. "New order" → one queue for billing, one for shipping, one for analytics — decoupled and parallel.

**DynamoDB (NoSQL).** A fully-managed **key-value / document** database: no server, automatic scaling, millisecond-level latency. A **table** has a **partition key** (mandatory, which distributes and identifies) and sometimes a **sort key** (to sort/filter items sharing the same partition). No fixed schema: each **item** can have its own attributes.

**query vs scan.** **`query`** targets a precise **partition key** (and optionally a sort-key range): fast and cheap. **`scan`** goes through the **whole table**: simple but slow and expensive at scale. SAA rule: **design for `query`**, avoid `scan`s on large tables.
:::

:::figure aws-decoupling-fanout
caption_fr: "Schéma 1. Découplage & fan-out : un producteur publie un événement dans un sujet SNS, diffusé vers plusieurs files SQS (facturation, expédition, stats) ; chaque consommateur traite à son rythme et enregistre l'état dans DynamoDB. Un pic de charge s'absorbe dans les files."
caption_en: "Figure 1. Decoupling & fan-out: a producer publishes an event to an SNS topic, broadcast to several SQS queues (billing, shipping, analytics); each consumer processes at its own pace and records state in DynamoDB. A load spike is absorbed by the queues."
:::

## walkthrough

:::lang fr
On avance ainsi : file SQS → DLQ & FIFO → sujet SNS → fan-out SNS→SQS → table DynamoDB → query vs scan → architecture découplée & nettoyage.
:::

:::lang en
We'll go like this: SQS queue → DLQ & FIFO → SNS topic → SNS→SQS fan-out → DynamoDB table → query vs scan → decoupled architecture & cleanup.
:::

### step-01

:::lang fr
**Objectif.** Découpler avec une **file SQS** : envoyer, recevoir, supprimer un message.

**🤔 Le cycle d'un message.** Un producteur **envoie** (`send-message`). Un consommateur **reçoit** (`receive-message`) : le message devient alors **invisible** un moment (visibility timeout) pour éviter un double traitement. Le consommateur traite, puis **supprime** (`delete-message`) via un `ReceiptHandle`. S'il ne supprime pas, le message **redevient visible** et sera relivré — d'où la garantie « au moins une fois ».

Crée une file et fais circuler un message :
:::

:::lang en
**Goal.** Decouple with an **SQS queue**: send, receive, delete a message.

**🤔 A message's lifecycle.** A producer **sends** (`send-message`). A consumer **receives** (`receive-message`): the message then becomes **invisible** for a while (visibility timeout) to avoid double-processing. The consumer processes, then **deletes** (`delete-message`) via a `ReceiptHandle`. If it doesn't delete, the message **becomes visible again** and gets redelivered — hence the "at least once" guarantee.

Create a queue and move a message through it:
:::

```bash
# Créer une file / create a queue
QURL=$(awslocal sqs create-queue --queue-name commandes --query 'QueueUrl' --output text)
echo "file = $QURL"

# Producteur : envoyer un message / producer: send a message
awslocal sqs send-message --queue-url "$QURL" --message-body "commande #42" \
  --query 'MessageId' --output text

# Consommateur : recevoir (le message devient invisible) / consumer: receive
awslocal sqs receive-message --queue-url "$QURL" \
  --query 'Messages[0].[Body,ReceiptHandle]' --output text

# Supprimer une fois traité (avec le ReceiptHandle renvoyé) / delete once processed
RH=$(awslocal sqs receive-message --queue-url "$QURL" --query 'Messages[0].ReceiptHandle' --output text)
[ "$RH" != "None" ] && awslocal sqs delete-message --queue-url "$QURL" --receipt-handle "$RH" && echo "message supprimé"
```

:::lang fr
**✅ Vérification :** `send-message` renvoie un `MessageId`. Le premier `receive-message` affiche `commande #42` et un long `ReceiptHandle`. Après `delete-message`, la file est vide. ⚠️ Subtilité importante : entre le `receive` et le `delete`, le message est **invisible** (visibility timeout, 30 s par défaut) — c'est ce qui empêche deux consommateurs de le traiter en même temps. Si tu relances `receive` trop vite, tu ne le vois plus (il est « en cours de traitement »). Le producteur et le consommateur ne se connaissent pas : c'est ça, le découplage.
:::

:::lang en
**✅ Check:** `send-message` returns a `MessageId`. The first `receive-message` shows `commande #42` and a long `ReceiptHandle`. After `delete-message`, the queue is empty. ⚠️ Important subtlety: between `receive` and `delete`, the message is **invisible** (visibility timeout, 30 s by default) — that's what prevents two consumers from processing it at once. If you rerun `receive` too fast, you no longer see it (it's "being processed"). The producer and consumer don't know each other: that's decoupling.
:::

### step-02

:::lang fr
**Objectif.** Fiabiliser avec une **dead-letter queue** (DLQ) et découvrir la file **FIFO**.

**🤔 Pourquoi une DLQ.** Un message « empoisonné » (que le consommateur n'arrive jamais à traiter) tournerait à l'infini. La **DLQ** recueille les messages après **N échecs** (le `maxReceiveCount`) : la file principale reste saine, et tu inspectes les échecs à part. La file **FIFO** (`.fifo`), elle, garantit l'**ordre** et l'**unicité** — pour quand l'ordre compte (transactions).

Crée une DLQ, relie-la, et une file FIFO :
:::

:::lang en
**Goal.** Harden with a **dead-letter queue** (DLQ) and discover the **FIFO** queue.

**🤔 Why a DLQ.** A "poison" message (that the consumer can never process) would loop forever. The **DLQ** collects messages after **N failures** (the `maxReceiveCount`): the main queue stays healthy, and you inspect failures separately. The **FIFO** queue (`.fifo`) guarantees **order** and **uniqueness** — for when order matters (transactions).

Create a DLQ, wire it, and a FIFO queue:
:::

```bash
# Une file "dead-letter" pour les échecs / a dead-letter queue for failures
DLQ_URL=$(awslocal sqs create-queue --queue-name commandes-dlq --query 'QueueUrl' --output text)
DLQ_ARN=$(awslocal sqs get-queue-attributes --queue-url "$DLQ_URL" \
  --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)

# Relier la file principale à la DLQ après 3 échecs / wire the main queue to the DLQ after 3 failures
awslocal sqs set-queue-attributes --queue-url "$QURL" --attributes \
  "{\"RedrivePolicy\":\"{\\\"deadLetterTargetArn\\\":\\\"$DLQ_ARN\\\",\\\"maxReceiveCount\\\":\\\"3\\\"}\"}"

# Une file FIFO (ordre garanti) — le nom DOIT finir par .fifo / a FIFO queue — name MUST end in .fifo
awslocal sqs create-queue --queue-name transactions.fifo \
  --attributes FifoQueue=true --query 'QueueUrl' --output text

# Vérifier la RedrivePolicy posée / verify the RedrivePolicy
awslocal sqs get-queue-attributes --queue-url "$QURL" \
  --attribute-names RedrivePolicy --query 'Attributes.RedrivePolicy' --output text
```

:::lang fr
**✅ Vérification :** `get-queue-attributes ... RedrivePolicy` te réaffiche la politique JSON avec `deadLetterTargetArn` (l'ARN de la DLQ) et `maxReceiveCount: 3`. La file `transactions.fifo` est créée (son nom **finit par `.fifo`**, obligatoire pour une file FIFO). Retiens : **standard** = débit énorme, pas d'ordre garanti, doublons possibles ; **FIFO** = ordre + exactement une fois, débit plus limité. La DLQ, elle, transforme « boucle infinie sur un message cassé » en « échec isolé et inspectable ».
:::

:::lang en
**✅ Check:** `get-queue-attributes ... RedrivePolicy` shows you back the JSON policy with `deadLetterTargetArn` (the DLQ's ARN) and `maxReceiveCount: 3`. The `transactions.fifo` queue is created (its name **ends in `.fifo`**, mandatory for a FIFO queue). Remember: **standard** = huge throughput, no guaranteed order, possible duplicates; **FIFO** = order + exactly once, lower throughput. The DLQ turns "infinite loop on a broken message" into "isolated, inspectable failure".
:::

### step-03

:::lang fr
**Objectif.** Publier et s'abonner avec un **sujet SNS**.

**🤔 SQS vs SNS.** SQS, c'est **un message → un consommateur** (une file, on dépile). SNS, c'est **un message → tous les abonnés** (on **diffuse**). Un sujet SNS ne stocke rien : il **pousse** immédiatement chaque message publié vers ses abonnés (files, fonctions, e-mails…). C'est la brique de **notification**.

Crée un sujet et publie :
:::

:::lang en
**Goal.** Publish and subscribe with an **SNS topic**.

**🤔 SQS vs SNS.** SQS is **one message → one consumer** (a queue, you pop). SNS is **one message → all subscribers** (you **broadcast**). An SNS topic stores nothing: it **pushes** each published message immediately to its subscribers (queues, functions, emails…). It's the **notification** block.

Create a topic and publish:
:::

```bash
# Créer un sujet SNS / create an SNS topic
TARN=$(awslocal sns create-topic --name evenements-commande --query 'TopicArn' --output text)
echo "sujet = $TARN"

# Publier un message / publish a message
awslocal sns publish --topic-arn "$TARN" --message "commande #42 créée" \
  --subject "nouvelle-commande" --query 'MessageId' --output text

# Lister les abonnements (aucun pour l'instant) / list subscriptions (none yet)
awslocal sns list-subscriptions-by-topic --topic-arn "$TARN" \
  --query 'Subscriptions[].Protocol' --output text
```

:::lang fr
**✅ Vérification :** `create-topic` renvoie un ARN `arn:aws:sns:us-east-1:000000000000:evenements-commande`. `publish` renvoie un `MessageId` — le message est parti, mais **sans abonné**, personne ne le reçoit (SNS ne stocke pas : un message publié sans abonné est perdu). `list-subscriptions-by-topic` est vide. C'est la différence clé avec SQS : SQS **garde** les messages jusqu'à consommation ; SNS **pousse** immédiatement et n'attend personne. À l'étape suivante, on lui donne des abonnés.
:::

:::lang en
**✅ Check:** `create-topic` returns an ARN `arn:aws:sns:us-east-1:000000000000:evenements-commande`. `publish` returns a `MessageId` — the message left, but **with no subscriber**, nobody receives it (SNS stores nothing: a message published with no subscriber is lost). `list-subscriptions-by-topic` is empty. That's the key difference from SQS: SQS **keeps** messages until consumed; SNS **pushes** immediately and waits for no one. In the next step, we give it subscribers.
:::

### step-04

:::lang fr
**Objectif.** Monter un **fan-out** : un sujet SNS diffusant vers **deux files SQS**.

**🤔 Le motif roi de la résilience.** « Nouvelle commande » doit déclencher **plusieurs** traitements indépendants : facturation, expédition, statistiques. Au lieu que le producteur appelle les trois (couplage, fragilité), il **publie une fois** dans SNS, qui **duplique** l'événement dans chaque file SQS abonnée. Chaque service consomme sa copie à son rythme, en panne l'un sans bloquer les autres. C'est **le** schéma que le SAA teste pour « découpler et diffuser ».

Abonne deux files au sujet, publie, et vérifie la réception :
:::

:::lang en
**Goal.** Build a **fan-out**: one SNS topic broadcasting to **two SQS queues**.

**🤔 The king pattern of resilience.** "New order" must trigger **several** independent processings: billing, shipping, analytics. Instead of the producer calling all three (coupling, fragility), it **publishes once** to SNS, which **duplicates** the event into each subscribed SQS queue. Each service consumes its copy at its own pace, one failing without blocking the others. It's **the** pattern the SAA tests for "decouple and broadcast".

Subscribe two queues to the topic, publish, and check delivery:
:::

```bash
# Deux files consommatrices / two consumer queues
FACT_URL=$(awslocal sqs create-queue --queue-name facturation --query 'QueueUrl' --output text)
EXPE_URL=$(awslocal sqs create-queue --queue-name expedition  --query 'QueueUrl' --output text)
FACT_ARN=$(awslocal sqs get-queue-attributes --queue-url "$FACT_URL" --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)
EXPE_ARN=$(awslocal sqs get-queue-attributes --queue-url "$EXPE_URL" --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)

# Abonner chaque file au sujet (fan-out) / subscribe each queue to the topic
awslocal sns subscribe --topic-arn "$TARN" --protocol sqs --notification-endpoint "$FACT_ARN" --query 'SubscriptionArn' --output text
awslocal sns subscribe --topic-arn "$TARN" --protocol sqs --notification-endpoint "$EXPE_ARN" --query 'SubscriptionArn' --output text

# Publier UN message -> il arrive dans LES DEUX files / publish ONE message -> lands in BOTH queues
awslocal sns publish --topic-arn "$TARN" --message "commande #99 payee" >/dev/null
sleep 2

# Chaque file a reçu sa copie / each queue got its copy
echo "facturation :" ; awslocal sqs receive-message --queue-url "$FACT_URL" --query 'Messages[0].Body' --output text | head -c 60 ; echo
echo "expedition  :" ; awslocal sqs receive-message --queue-url "$EXPE_URL" --query 'Messages[0].Body' --output text | head -c 60 ; echo
```

:::lang fr
**✅ Vérification :** les deux `subscribe` renvoient chacun un ARN d'abonnement. Après **un seul** `publish`, **chaque** file (`facturation` **et** `expedition`) a reçu une copie du message — tu le vois avec les deux `receive-message`. Le corps est un JSON d'enveloppe SNS contenant ton message (`"Message":"commande #99 payee"`). Un événement, deux consommateurs indépendants : si `expedition` tombe, `facturation` continue. C'est l'assemblage exact que tu réutiliseras dans le projet.
:::

:::lang en
**✅ Check:** the two `subscribe` calls each return a subscription ARN. After a **single** `publish`, **each** queue (`facturation` **and** `expedition`) received a copy of the message — you see it with the two `receive-message`. The body is an SNS envelope JSON containing your message (`"Message":"commande #99 payee"`). One event, two independent consumers: if `expedition` goes down, `facturation` keeps going. It's the exact assembly you'll reuse in the project.
:::

### step-05

:::lang fr
**Objectif.** Créer une **table DynamoDB** et y écrire/lire des éléments.

**🤔 Le modèle clé-valeur.** DynamoDB stocke des **éléments** (items) identifiés par une **clé de partition**. Pas de schéma fixe : chaque élément a ses attributs, **typés** en JSON (`S` = string, `N` = number, `BOOL`…). On crée la table en **PAY_PER_REQUEST** (facturation à la demande, pas de capacité à provisionner) — le mode le plus simple.

Crée la table et manipule des éléments :
:::

:::lang en
**Goal.** Create a **DynamoDB table** and write/read items.

**🤔 The key-value model.** DynamoDB stores **items** identified by a **partition key**. No fixed schema: each item has its attributes, **typed** in JSON (`S` = string, `N` = number, `BOOL`…). We create the table in **PAY_PER_REQUEST** (on-demand billing, no capacity to provision) — the simplest mode.

Create the table and handle items:
:::

```bash
# Créer une table avec une clé de partition "id" / create a table with partition key "id"
awslocal dynamodb create-table --table-name Commandes \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --query 'TableDescription.TableStatus' --output text

# Écrire deux éléments (attributs typés) / write two items (typed attributes)
awslocal dynamodb put-item --table-name Commandes \
  --item '{"id":{"S":"cmd-42"},"client":{"S":"alice"},"montant":{"N":"120"},"payee":{"BOOL":true}}'
awslocal dynamodb put-item --table-name Commandes \
  --item '{"id":{"S":"cmd-43"},"client":{"S":"bob"},"montant":{"N":"75"},"payee":{"BOOL":false}}'

# Lire un élément par sa clé / read an item by its key
awslocal dynamodb get-item --table-name Commandes --key '{"id":{"S":"cmd-42"}}' \
  --query 'Item.[client.S,montant.N]' --output text
```

:::lang fr
**✅ Vérification :** `create-table` renvoie `ACTIVE` (la table est prête). `get-item` sur `cmd-42` renvoie `alice   120`. Tu viens de stocker et relire des données sans serveur de base ni schéma déclaré à l'avance. Note le **typage** : `{"S":"alice"}` (chaîne), `{"N":"120"}` (nombre, toujours entre guillemets en JSON DynamoDB), `{"BOOL":true}`. C'est verbeux mais explicite. ⚠️ La clé de partition (`id`) est **obligatoire** dans chaque `put-item` et **unique** : un second `put-item` avec le même `id` **remplace** l'élément.
:::

:::lang en
**✅ Check:** `create-table` returns `ACTIVE` (the table is ready). `get-item` on `cmd-42` returns `alice   120`. You just stored and read back data with no database server or pre-declared schema. Note the **typing**: `{"S":"alice"}` (string), `{"N":"120"}` (number, always quoted in DynamoDB JSON), `{"BOOL":true}`. It's verbose but explicit. ⚠️ The partition key (`id`) is **mandatory** in each `put-item` and **unique**: a second `put-item` with the same `id` **replaces** the item.
:::

### step-06

:::lang fr
**Objectif.** **Interroger** DynamoDB — comprendre `query` (efficace) vs `scan` (coûteux).

**🤔 Le réflexe de coût/performance.** `get-item` lit **un** élément par sa clé. Pour lire **plusieurs** éléments : `query` cible une **clé de partition** précise (rapide, ne lit que la partition concernée) ; `scan` lit **toute la table** puis filtre (simple mais lent et cher dès que la table grossit). Le SAA insiste : on **conçoit** son modèle pour interroger par `query`, pas par `scan`.

Compare scan et une lecture ciblée :
:::

:::lang en
**Goal.** **Query** DynamoDB — understand `query` (efficient) vs `scan` (costly).

**🤔 The cost/performance reflex.** `get-item` reads **one** item by its key. To read **several** items: `query` targets a precise **partition key** (fast, reads only the relevant partition); `scan` reads the **whole table** then filters (simple but slow and costly once the table grows). The SAA insists: you **design** your model to query with `query`, not `scan`.

Compare scan and a targeted read:
:::

```bash
# scan : parcourt TOUTE la table (à éviter à grande échelle) / scan: goes through the WHOLE table
awslocal dynamodb scan --table-name Commandes --query 'Count' --output text
awslocal dynamodb scan --table-name Commandes \
  --filter-expression "payee = :p" \
  --expression-attribute-values '{":p":{"BOOL":true}}' \
  --query 'Items[].client.S' --output text

# get-item ciblé par la clé (le mode efficace) / targeted get-item by key (the efficient way)
awslocal dynamodb get-item --table-name Commandes --key '{"id":{"S":"cmd-43"}}' \
  --query 'Item.client.S' --output text
```

:::lang fr
**✅ Vérification :** le premier `scan` renvoie `2` (deux éléments dans la table). Le `scan` filtré sur `payee = true` renvoie `alice` (seule commande payée). Le `get-item` ciblé renvoie `bob`. Retiens la leçon SAA : le `scan` a dû lire **tous** les éléments pour en filtrer un ; sur une table de millions de lignes, c'est catastrophique. Un `query` (sur clé de partition) ou un `get-item` (sur clé complète) ne lit que ce qu'il faut. ⚠️ Ici on n'a qu'une clé de partition, donc pas de `query` par plage ; avec une **clé de tri**, `query` deviendrait « tous les éléments de cette partition, triés/filtrés par la clé de tri » — le vrai motif d'accès efficace.
:::

:::lang en
**✅ Check:** the first `scan` returns `2` (two items in the table). The `scan` filtered on `payee = true` returns `alice` (the only paid order). The targeted `get-item` returns `bob`. Remember the SAA lesson: the `scan` had to read **all** items to filter one; on a table of millions of rows, that's catastrophic. A `query` (on partition key) or a `get-item` (on full key) reads only what's needed. ⚠️ Here we only have a partition key, so no range `query`; with a **sort key**, `query` would become "all items of this partition, sorted/filtered by the sort key" — the real efficient access pattern.
:::

### step-07

:::lang fr
**Objectif.** Assembler l'**architecture découplée**, choisir la bonne brique, puis nettoyer.

**🤔 La grille de choix.** **SQS** quand un travail doit être fait **une fois**, par **un** consommateur, en absorbant les pics (traiter une commande). **SNS** quand un événement doit être **diffusé** à **plusieurs** abonnés (notifier facturation + expédition + stats). **SNS→SQS (fan-out)** pour combiner diffusion **et** découplage tampon. **DynamoDB** pour stocker l'**état** avec des accès par clé rapides. Ensemble, ils font une architecture **élastique** (absorbe la charge) et **résiliente** (un composant tombe sans faire tomber les autres).

Récapitule et nettoie :
:::

:::lang en
**Goal.** Assemble the **decoupled architecture**, choose the right block, then clean up.

**🤔 The choice grid.** **SQS** when a job must be done **once**, by **one** consumer, absorbing spikes (process an order). **SNS** when an event must be **broadcast** to **several** subscribers (notify billing + shipping + analytics). **SNS→SQS (fan-out)** to combine broadcast **and** buffer decoupling. **DynamoDB** to store **state** with fast key-based access. Together, they make an architecture **elastic** (absorbs load) and **resilient** (a component fails without taking the others down).

Recap and clean up:
:::

```bash
# Panorama / overview
awslocal sqs list-queues --query 'QueueUrls' --output text
awslocal sns list-topics --query 'Topics[].TopicArn' --output text
awslocal dynamodb list-tables --query 'TableNames' --output text

# --- Nettoyage / cleanup ---
awslocal sqs delete-queue --queue-url "$QURL"
awslocal sqs delete-queue --queue-url "$DLQ_URL"
awslocal sqs delete-queue --queue-url "$FACT_URL"
awslocal sqs delete-queue --queue-url "$EXPE_URL"
awslocal sqs delete-queue --queue-url "$(awslocal sqs get-queue-url --queue-name transactions.fifo --query 'QueueUrl' --output text)"
awslocal sns delete-topic --topic-arn "$TARN"
awslocal dynamodb delete-table --table-name Commandes
echo "labo rangé / lab tidied"
```

:::lang fr
**✅ Vérification :** le panorama liste tes files (`commandes`, `facturation`, `expedition`, la DLQ, la FIFO), ton sujet et ta table `Commandes`. Le nettoyage supprime tout sans erreur. **La grille à graver** : besoin d'un **tampon** entre deux composants → **SQS** ; besoin de **diffuser** un événement → **SNS** ; besoin des deux → **fan-out SNS→SQS** ; besoin de **stocker l'état** rapidement → **DynamoDB**. Tu as maintenant toutes les briques du projet serverless qui suit — où S3, Lambda, DynamoDB et SQS s'assemblent en une vraie application.
:::

:::lang en
**✅ Check:** the overview lists your queues (`commandes`, `facturation`, `expedition`, the DLQ, the FIFO), your topic and your `Commandes` table. The cleanup deletes everything with no error. **The grid to engrave**: need a **buffer** between two components → **SQS**; need to **broadcast** an event → **SNS**; need both → **SNS→SQS fan-out**; need to **store state** fast → **DynamoDB**. You now hold all the blocks of the serverless project that follows — where S3, Lambda, DynamoDB and SQS assemble into a real application.
:::

## pitfalls

:::lang fr
**1. Oublier de supprimer un message SQS.** Un message reçu mais non `delete-message` **redevient visible** après le visibility timeout et sera **retraité**. C'est la garantie « au moins une fois » : ton consommateur doit être **idempotent** (retraiter sans dégât).

**2. Croire que SNS stocke les messages.** Non : SNS **pousse** et oublie. Un message publié **sans abonné** est **perdu**. Pour ne rien perdre, on abonne une **file SQS** (qui, elle, garde) — c'est le fan-out.

**3. Confondre SQS et SNS.** SQS = **une file, un consommateur dépile** (travail à faire une fois). SNS = **un sujet, tous les abonnés reçoivent** (diffusion). Question de base à l'examen.

**4. `scan` sur une grosse table.** `scan` lit **toute** la table — lent et cher. Conçois pour `query` (clé de partition) ou `get-item` (clé complète). Le `scan` est un dernier recours.

**5. Nom de file FIFO sans `.fifo`.** Une file FIFO **doit** avoir un nom finissant par `.fifo` **et** l'attribut `FifoQueue=true`. Sinon, erreur ou file standard.

**6. Type d'attribut DynamoDB manquant/erroné.** Chaque valeur est typée : `{"S":"..."}`, `{"N":"..."}` (nombre **entre guillemets**), `{"BOOL":true}`. Oublier le type ou se tromper = `ValidationException`.

**7. Clé de partition dupliquée = écrasement.** `put-item` avec un `id` déjà présent **remplace** l'élément entier (pas de fusion). Pour modifier un attribut sans tout réécrire, c'est `update-item`.
:::

:::lang en
**1. Forgetting to delete an SQS message.** A received but not `delete-message`d message **becomes visible again** after the visibility timeout and gets **reprocessed**. It's the "at least once" guarantee: your consumer must be **idempotent** (reprocess without harm).

**2. Thinking SNS stores messages.** No: SNS **pushes** and forgets. A message published **with no subscriber** is **lost**. To lose nothing, subscribe an **SQS queue** (which does keep) — that's fan-out.

**3. Confusing SQS and SNS.** SQS = **one queue, one consumer pops** (work to do once). SNS = **one topic, all subscribers receive** (broadcast). Basic exam question.

**4. `scan` on a big table.** `scan` reads the **whole** table — slow and costly. Design for `query` (partition key) or `get-item` (full key). `scan` is a last resort.

**5. FIFO queue name without `.fifo`.** A FIFO queue **must** have a name ending in `.fifo` **and** the `FifoQueue=true` attribute. Otherwise, error or a standard queue.

**6. Missing/wrong DynamoDB attribute type.** Each value is typed: `{"S":"..."}`, `{"N":"..."}` (number **quoted**), `{"BOOL":true}`. Forgetting the type or getting it wrong = `ValidationException`.

**7. Duplicate partition key = overwrite.** `put-item` with an already-present `id` **replaces** the whole item (no merge). To modify one attribute without rewriting everything, it's `update-item`.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu envoies, reçois et supprimes un message SQS, et tu expliques le visibility timeout.
- [ ] Tu relies une DLQ (RedrivePolicy) et tu crées une file FIFO.
- [ ] Tu publies dans un sujet SNS et tu comprends « pas d'abonné = message perdu ».
- [ ] Tu montes un fan-out SNS→2 SQS et tu vois **une** publication arriver dans **les deux** files.
- [ ] Tu crées une table DynamoDB et tu écris/lis des éléments typés.
- [ ] Tu opposes `scan` (toute la table) et `query`/`get-item` (ciblé).
- [ ] Tu choisis SQS vs SNS vs DynamoDB sur un scénario.

Sept cases = tu tiens le découplage au niveau SAA. La suite : le **projet d'entreprise** serverless.
:::

:::lang en
You know it works when…

- [ ] You send, receive and delete an SQS message, and explain the visibility timeout.
- [ ] You wire a DLQ (RedrivePolicy) and create a FIFO queue.
- [ ] You publish to an SNS topic and understand "no subscriber = lost message".
- [ ] You build an SNS→2 SQS fan-out and see **one** publish land in **both** queues.
- [ ] You create a DynamoDB table and write/read typed items.
- [ ] You contrast `scan` (whole table) with `query`/`get-item` (targeted).
- [ ] You choose SQS vs SNS vs DynamoDB on a scenario.

Seven boxes = you hold decoupling at SAA level. Next up: the serverless **enterprise project**.
:::

## next

:::lang fr
La suite du track AWS → SAA-C03 :

1. **AWS — projet d'entreprise serverless** : le capstone qui assemble **tout** — un pipeline S3 → Lambda → DynamoDB avec notifications SNS/SQS, provisionné en Terraform contre LocalStack. Ton livrable de CV.
2. Enfin : **passer en réel** — créer un compte AWS, les garde-fous de coût, et ce que LocalStack cachait.
:::

:::lang en
The AWS → SAA-C03 track continues:

1. **AWS — serverless enterprise project**: the capstone assembling **everything** — an S3 → Lambda → DynamoDB pipeline with SNS/SQS notifications, provisioned in Terraform against LocalStack. Your CV deliverable.
2. Finally: **going real** — creating an AWS account, cost guardrails, and what LocalStack hid.
:::

## cheatsheet

:::lang fr
Aide-mémoire découplage.
:::

:::lang en
Decoupling cheat sheet.
:::

```bash
# SQS
awslocal sqs create-queue --queue-name q
awslocal sqs send-message --queue-url $Q --message-body "msg"
awslocal sqs receive-message --queue-url $Q               # -> Body + ReceiptHandle
awslocal sqs delete-message --queue-url $Q --receipt-handle $RH
# FIFO : nom en .fifo + FifoQueue=true / DLQ : set-queue-attributes RedrivePolicy

# SNS
awslocal sns create-topic --name t
awslocal sns subscribe --topic-arn $T --protocol sqs --notification-endpoint $QUEUE_ARN
awslocal sns publish --topic-arn $T --message "événement"   # -> tous les abonnés / all subscribers

# DynamoDB
awslocal dynamodb create-table --table-name T \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST
awslocal dynamodb put-item --table-name T --item '{"id":{"S":"a"},"x":{"N":"1"}}'
awslocal dynamodb get-item --table-name T --key '{"id":{"S":"a"}}'
awslocal dynamodb query ...    # ciblé (clé) — préféré / targeted (key) — preferred
awslocal dynamodb scan  ...    # toute la table — à éviter à grande échelle / whole table — avoid at scale
```

## resources

:::lang fr
- [Amazon SQS — guide](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html) — files, visibility, DLQ, FIFO.
- [Amazon SNS — guide](https://docs.aws.amazon.com/sns/latest/dg/welcome.html) — sujets, abonnements.
- [Fan-out SNS + SQS](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html) — le motif de diffusion.
- [Amazon DynamoDB — guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) — clés, items, query/scan.
- [Bonnes pratiques DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html) — concevoir pour query.
:::

:::lang en
- [Amazon SQS — guide](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html) — queues, visibility, DLQ, FIFO.
- [Amazon SNS — guide](https://docs.aws.amazon.com/sns/latest/dg/welcome.html) — topics, subscriptions.
- [SNS + SQS fan-out](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html) — the broadcast pattern.
- [Amazon DynamoDB — guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) — keys, items, query/scan.
- [DynamoDB best practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html) — design for query.
:::

## troubleshooting

:::lang fr
**`receive-message` ne renvoie rien.** Soit la file est vide, soit un message est **invisible** (reçu récemment, dans son visibility timeout). Attends l'expiration, ou vérifie que le producteur a bien envoyé.

**Mon message SNS n'arrive nulle part.** Pas d'abonné, ou l'abonnement n'est pas confirmé. Vérifie `list-subscriptions-by-topic`. Pour SQS, l'abonnement est immédiat ; pour e-mail/HTTP il faut confirmer.

**`create-queue transactions.fifo` échoue.** Une file FIFO exige le nom en `.fifo` **et** `--attributes FifoQueue=true`. Les deux ensemble.

**`ValidationException` sur DynamoDB.** Un attribut n'est pas typé correctement (`{"N":"1"}` avec le nombre **entre guillemets**), ou la clé de partition manque dans `put-item`/`get-item`.

**`ResourceNotFoundException` sur une table.** La table n'existe pas encore (création asynchrone) ou est mal nommée. Vérifie `list-tables` et attends l'état `ACTIVE`.

**La RedrivePolicy ne s'applique pas.** Le JSON imbriqué est délicat à échapper en shell. Vérifie avec `get-queue-attributes ... RedrivePolicy` ; l'ARN de la DLQ doit être correct.
:::

:::lang en
**`receive-message` returns nothing.** Either the queue is empty, or a message is **invisible** (recently received, within its visibility timeout). Wait for expiry, or check the producer actually sent.

**My SNS message goes nowhere.** No subscriber, or the subscription isn't confirmed. Check `list-subscriptions-by-topic`. For SQS the subscription is immediate; for email/HTTP you must confirm.

**`create-queue transactions.fifo` fails.** A FIFO queue requires the `.fifo` name **and** `--attributes FifoQueue=true`. Both together.

**`ValidationException` on DynamoDB.** An attribute isn't typed correctly (`{"N":"1"}` with the number **quoted**), or the partition key is missing in `put-item`/`get-item`.

**`ResourceNotFoundException` on a table.** The table doesn't exist yet (async creation) or is misnamed. Check `list-tables` and wait for `ACTIVE`.

**The RedrivePolicy doesn't apply.** The nested JSON is tricky to escape in the shell. Check with `get-queue-attributes ... RedrivePolicy`; the DLQ ARN must be correct.
:::
