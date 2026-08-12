---
# — Identité (ne change JAMAIS une fois publié) —
id: aws-reseau-vpc
slug: aws-reseau-vpc
order: 47
status: published

# — Titres & accroches (bilingue) —
title_fr: "AWS — réseau VPC"
title_en: "AWS — VPC networking"
tagline_fr: "VPC, sous-réseaux public/privé, routage, IGW, security groups, NACL."
tagline_en: "VPC, public/private subnets, routing, IGW, security groups, NACLs."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 220
repo: "localstack/localstack"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [aws-stockage-s3]
next: [aws-compute-ec2-lambda]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [vpc-cidr, sous-reseaux, passerelle-internet, tables-routage, security-groups, network-acl, public-vs-prive]
concepts_en: [vpc-cidr, subnets, internet-gateway, route-tables, security-groups, network-acl, public-vs-private]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le réseau AWS pour le SAA-C03 : crée un VPC (bloc CIDR), des sous-réseaux publics et privés répartis sur des AZ, une passerelle Internet et des tables de routage (ce qui rend un sous-réseau public), des groupes de sécurité (pare-feu stateful au niveau instance) et des NACL (stateless au niveau sous-réseau), et assemble l'architecture publique/privée avec NAT. Tout en LocalStack."
og_description_en: "AWS networking for SAA-C03: create a VPC (CIDR block), public and private subnets across AZs, an internet gateway and route tables (what makes a subnet public), security groups (stateful instance-level firewall) and NACLs (stateless subnet-level), and assemble the public/private architecture with NAT. All on LocalStack."
---

## intro

:::lang fr
Un VPC (Virtual Private Cloud) est **ton réseau privé** à l'intérieur d'AWS : un espace isolé où tu déploies tes ressources, avec **ton** plan d'adressage, **tes** sous-réseaux, **tes** règles de routage et de pare-feu. Tout ce que tu lances sur AWS (une machine, une base) vit dans un VPC. Comprendre le réseau, c'est comprendre **comment les ressources se parlent** — et surtout **qui peut atteindre quoi**. C'est le troisième gros domaine du SAA après IAM et S3, et celui qui sépare ceux qui « savent lancer une instance » de ceux qui « savent architecturer ».

Ce guide te fait construire un VPC de A à Z : le **bloc d'adresses** (CIDR), des **sous-réseaux** répartis sur plusieurs zones de disponibilité, une **passerelle Internet** et des **tables de routage** (c'est le routage, pas le sous-réseau, qui rend une ressource « publique »), puis les **deux pare-feux** d'AWS — les **groupes de sécurité** (au niveau de l'instance, *stateful*) et les **NACL** (au niveau du sous-réseau, *stateless*). Tu termines en assemblant le motif d'architecture le plus classique : **web en sous-réseau public, base en sous-réseau privé**.

Tout se fait en **LocalStack** : tu crées de vrais VPC, sous-réseaux, passerelles, routes et règles de pare-feu, et tu les relies — les mêmes commandes qu'en réel, sans compte.

**Pour qui c'est :** tu as fait les guides AWS précédents et tu veux le socle réseau, indispensable pour comprendre EC2, les bases de données et la sécurité réseau.

**Quand ce n'est PAS le bon choix :**

- Tu n'as jamais lancé LocalStack → refais *AWS fondamentaux*.
- Tu cherches à connecter deux réseaux (VPC peering, VPN, Direct Connect) → ce sont des sujets avancés qu'on n'aborde qu'en concept ici ; on pose d'abord le VPC unique.
:::

:::lang en
A VPC (Virtual Private Cloud) is **your private network** inside AWS: an isolated space where you deploy your resources, with **your** addressing plan, **your** subnets, **your** routing and firewall rules. Everything you launch on AWS (a machine, a database) lives in a VPC. Understanding networking means understanding **how resources talk** — and above all **who can reach what**. It's the SAA's third big domain after IAM and S3, and the one that separates those who "can launch an instance" from those who "can architect".

This guide has you build a VPC from scratch: the **address block** (CIDR), **subnets** across several availability zones, an **internet gateway** and **route tables** (it's routing, not the subnet, that makes a resource "public"), then AWS's **two firewalls** — **security groups** (at the instance level, *stateful*) and **NACLs** (at the subnet level, *stateless*). You finish by assembling the most classic architecture pattern: **web in a public subnet, database in a private subnet**.

Everything runs on **LocalStack**: you create real VPCs, subnets, gateways, routes and firewall rules, and wire them together — the same commands as the real thing, no account.

**Who it's for:** you've done the previous AWS guides and want the networking foundation, essential to understand EC2, databases and network security.

**When it's NOT the right choice:**

- You've never launched LocalStack → do *AWS fundamentals* first.
- You want to connect two networks (VPC peering, VPN, Direct Connect) → those are advanced topics we only touch conceptually here; we lay the single VPC first.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Créer un **VPC** avec un bloc **CIDR** et comprendre le plan d'adressage.
- Découper le VPC en **sous-réseaux** répartis sur plusieurs **AZ**.
- Rendre un sous-réseau **public** via une **passerelle Internet** + une **route** `0.0.0.0/0`.
- Configurer un **groupe de sécurité** (*stateful*, niveau instance).
- Configurer une **NACL** (*stateless*, niveau sous-réseau) et la distinguer d'un SG.
- Assembler le motif **sous-réseau public / privé** et comprendre le rôle du **NAT**.
- Inspecter ton réseau avec les commandes `describe-*`.
:::

:::lang en
By the end of this guide, you can:

- Create a **VPC** with a **CIDR** block and understand the addressing plan.
- Split the VPC into **subnets** across several **AZs**.
- Make a subnet **public** via an **internet gateway** + a `0.0.0.0/0` **route**.
- Configure a **security group** (*stateful*, instance level).
- Configure a **NACL** (*stateless*, subnet level) and tell it from an SG.
- Assemble the **public / private subnet** pattern and understand the role of **NAT**.
- Inspect your network with the `describe-*` commands.
:::

## prerequisites

:::lang fr
- Les guides AWS **fondamentaux**, **IAM & sécurité**, **stockage S3** terminés.
- **LocalStack qui tourne** (`docker run -d --name localstack -p 4566:4566 localstack/localstack:3.8.1`) et **`awslocal`** configuré.
- Un peu d'aisance avec la notation **CIDR** (`10.0.0.0/16` = un bloc d'adresses). Rien de bloquant, on explique.
:::

:::lang en
- The AWS **fundamentals**, **IAM & security**, **S3 storage** guides done.
- **LocalStack running** (`docker run -d --name localstack -p 4566:4566 localstack/localstack:3.8.1`) and **`awslocal`** configured.
- A little comfort with **CIDR** notation (`10.0.0.0/16` = an address block). Nothing blocking, we explain.
:::

## concepts

:::lang fr
**VPC et CIDR.** Un **VPC** est un réseau privé virtuel, défini par un **bloc CIDR** — une plage d'adresses IP privées, ex. `10.0.0.0/16` (65 536 adresses). Toutes tes ressources reçoivent une IP dans cette plage. Le `/16` indique la taille : plus le nombre est petit, plus le bloc est grand (`/16` = grand, `/24` = 256 adresses).

**Sous-réseau (subnet).** Une **subdivision** du VPC, liée à **une seule AZ**. On découpe le CIDR du VPC en sous-blocs : `10.0.1.0/24` dans `us-east-1a`, `10.0.2.0/24` dans `us-east-1b`. Répartir les sous-réseaux sur **plusieurs AZ** est la base de la haute disponibilité.

**Public vs privé.** Contre-intuitif mais capital : ce n'est **pas** le sous-réseau qui est « public », c'est son **routage**. Un sous-réseau est **public** si sa table de routage a une **route vers une passerelle Internet**. Sans cette route, il est **privé** (pas d'accès Internet entrant/sortant direct).

**Passerelle Internet (IGW).** Le composant qui **connecte le VPC à Internet**. On l'attache au VPC, puis on ajoute une **route** `0.0.0.0/0 → IGW` dans la table de routage d'un sous-réseau pour le rendre public.

**Table de routage.** L'ensemble des **règles de routage** d'un sous-réseau : « pour telle destination, envoie vers telle cible ». La route locale du VPC est implicite ; on ajoute la route vers l'IGW (public) ou vers un NAT (privé sortant).

**Groupe de sécurité (SG).** Un **pare-feu au niveau de l'instance**, **stateful** : si tu autorises le trafic entrant sur le port 80, la réponse sortante est **automatiquement** autorisée (l'état de la connexion est suivi). Un SG n'a **que des règles d'autorisation** (pas de deny), et s'applique à des ressources (ENI), pas à un sous-réseau.

**NACL (Network ACL).** Un **pare-feu au niveau du sous-réseau**, **stateless** : chaque sens (entrant/sortant) est évalué **indépendamment** — autoriser l'entrée ne suffit pas, il faut aussi autoriser la sortie du trafic de retour. Une NACL a des règles **allow ET deny**, numérotées. C'est le second niveau de défense, après les SG.

**NAT (Network Address Translation).** Pour qu'un sous-réseau **privé** puisse **sortir** vers Internet (télécharger des mises à jour) **sans** être joignable depuis l'extérieur, on route sa sortie via une **passerelle NAT** placée dans un sous-réseau public. Entrant bloqué, sortant permis.
:::

:::lang en
**VPC and CIDR.** A **VPC** is a virtual private network, defined by a **CIDR block** — a range of private IP addresses, e.g. `10.0.0.0/16` (65,536 addresses). All your resources get an IP in this range. The `/16` gives the size: the smaller the number, the bigger the block (`/16` = big, `/24` = 256 addresses).

**Subnet.** A **subdivision** of the VPC, tied to **a single AZ**. You split the VPC's CIDR into sub-blocks: `10.0.1.0/24` in `us-east-1a`, `10.0.2.0/24` in `us-east-1b`. Spreading subnets across **several AZs** is the basis of high availability.

**Public vs private.** Counterintuitive but crucial: it's **not** the subnet that is "public", it's its **routing**. A subnet is **public** if its route table has a **route to an internet gateway**. Without that route, it's **private** (no direct inbound/outbound internet access).

**Internet gateway (IGW).** The component that **connects the VPC to the internet**. You attach it to the VPC, then add a `0.0.0.0/0 → IGW` **route** in a subnet's route table to make it public.

**Route table.** The set of **routing rules** for a subnet: "for this destination, send to this target". The VPC's local route is implicit; you add the route to the IGW (public) or to a NAT (private outbound).

**Security group (SG).** A **firewall at the instance level**, **stateful**: if you allow inbound traffic on port 80, the outbound response is **automatically** allowed (connection state is tracked). An SG has **only allow rules** (no deny), and applies to resources (ENIs), not to a subnet.

**NACL (Network ACL).** A **firewall at the subnet level**, **stateless**: each direction (inbound/outbound) is evaluated **independently** — allowing inbound isn't enough, you must also allow the return traffic outbound. A NACL has **allow AND deny** rules, numbered. It's the second layer of defense, after SGs.

**NAT (Network Address Translation).** For a **private** subnet to **reach out** to the internet (download updates) **without** being reachable from outside, you route its egress through a **NAT gateway** placed in a public subnet. Inbound blocked, outbound allowed.
:::

:::figure aws-vpc-architecture
caption_fr: "Schéma 1. Un VPC 10.0.0.0/16 : un sous-réseau public (route vers l'IGW, héberge le web + la passerelle NAT) et un sous-réseau privé (pas de route IGW, sort via le NAT, héberge la base). SG au niveau instance, NACL au niveau sous-réseau."
caption_en: "Figure 1. A VPC 10.0.0.0/16: a public subnet (route to the IGW, hosts the web + the NAT gateway) and a private subnet (no IGW route, egresses via NAT, hosts the database). SG at instance level, NACL at subnet level."
:::

## walkthrough

:::lang fr
On avance ainsi : VPC → sous-réseaux → passerelle Internet & route (rendre public) → groupe de sécurité → NACL → architecture public/privé → vue d'ensemble & nettoyage.
:::

:::lang en
We'll go like this: VPC → subnets → internet gateway & route (make public) → security group → NACL → public/private architecture → overview & cleanup.
:::

### step-01

:::lang fr
**Objectif.** Créer un **VPC** avec son bloc **CIDR**.

**🤔 Pourquoi choisir le CIDR.** Le bloc détermine combien d'adresses tu auras et comment tu pourras le découper. `10.0.0.0/16` (65 536 adresses privées) est le choix standard : assez large pour de nombreux sous-réseaux. On note l'ID du VPC pour tout le reste du guide.

Crée le VPC :
:::

:::lang en
**Goal.** Create a **VPC** with its **CIDR** block.

**🤔 Why choose the CIDR.** The block determines how many addresses you'll have and how you can split it. `10.0.0.0/16` (65,536 private addresses) is the standard choice: broad enough for many subnets. We note the VPC ID for the rest of the guide.

Create the VPC:
:::

```bash
# Créer le VPC et capturer son ID / create the VPC and capture its ID
VPC=$(awslocal ec2 create-vpc --cidr-block 10.0.0.0/16 \
  --query 'Vpc.VpcId' --output text)
echo "VPC = $VPC"

# Le nommer (tag) pour s'y retrouver / tag it for clarity
awslocal ec2 create-tags --resources "$VPC" --tags Key=Name,Value=atelier-vpc

# Vérifier / verify
awslocal ec2 describe-vpcs --vpc-ids "$VPC" \
  --query 'Vpcs[0].[VpcId,CidrBlock,State]' --output text
```

:::lang fr
**✅ Vérification :** `create-vpc` renvoie un ID `vpc-xxxxxxxx` (stocké dans `$VPC`). `describe-vpcs` affiche `vpc-... 10.0.0.0/16 available`. Ton réseau privé existe, prêt à être découpé. ⚠️ **Garde le shell ouvert** : la variable `$VPC` (et les autres IDs des étapes suivantes) servent tout le long. Si tu fermes le terminal, relis les IDs avec `awslocal ec2 describe-vpcs`.
:::

:::lang en
**✅ Check:** `create-vpc` returns an ID `vpc-xxxxxxxx` (stored in `$VPC`). `describe-vpcs` shows `vpc-... 10.0.0.0/16 available`. Your private network exists, ready to be split. ⚠️ **Keep the shell open**: the `$VPC` variable (and the other IDs from later steps) are used throughout. If you close the terminal, re-read the IDs with `awslocal ec2 describe-vpcs`.
:::

### step-02

:::lang fr
**Objectif.** Découper le VPC en **sous-réseaux** sur **deux AZ** — un public, un privé.

**🤔 Pourquoi deux AZ.** Un sous-réseau vit dans **une seule** AZ. Pour survivre à la panne d'un datacenter (le pilier haute dispo du SAA), on place des sous-réseaux dans **au moins deux** AZ. Ici on crée un sous-réseau « public » (`10.0.1.0/24`) et un « privé » (`10.0.2.0/24`) — pour l'instant ils sont identiques ; c'est le **routage** (étape 3) qui fera la différence.

Crée deux sous-réseaux :
:::

:::lang en
**Goal.** Split the VPC into **subnets** across **two AZs** — one public, one private.

**🤔 Why two AZs.** A subnet lives in **a single** AZ. To survive a datacenter failure (the SAA's high-availability pillar), you place subnets in **at least two** AZs. Here we create a "public" subnet (`10.0.1.0/24`) and a "private" one (`10.0.2.0/24`) — for now they're identical; it's the **routing** (step 3) that will make the difference.

Create two subnets:
:::

```bash
# Sous-réseau destiné à être PUBLIC (AZ a) / subnet destined to be PUBLIC
PUB=$(awslocal ec2 create-subnet --vpc-id "$VPC" --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a --query 'Subnet.SubnetId' --output text)
awslocal ec2 create-tags --resources "$PUB" --tags Key=Name,Value=public-a

# Sous-réseau destiné à rester PRIVÉ (AZ b) / subnet meant to stay PRIVATE
PRIV=$(awslocal ec2 create-subnet --vpc-id "$VPC" --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b --query 'Subnet.SubnetId' --output text)
awslocal ec2 create-tags --resources "$PRIV" --tags Key=Name,Value=prive-b

echo "PUBLIC = $PUB | PRIVE = $PRIV"
awslocal ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC" \
  --query 'Subnets[].[CidrBlock,AvailabilityZone]' --output table
```

:::lang fr
**✅ Vérification :** `describe-subnets` liste tes **deux** sous-réseaux : `10.0.1.0/24` en `us-east-1a` et `10.0.2.0/24` en `us-east-1b`. Les deux sont dans le même VPC mais dans des **AZ différentes** — c'est déjà une base multi-AZ. À ce stade, **aucun n'est public** : ils n'ont pas encore de route vers Internet. C'est le sujet de l'étape suivante, et c'est LE point que l'examen adore piéger.
:::

:::lang en
**✅ Check:** `describe-subnets` lists your **two** subnets: `10.0.1.0/24` in `us-east-1a` and `10.0.2.0/24` in `us-east-1b`. Both are in the same VPC but in **different AZs** — already a multi-AZ base. At this stage, **neither is public**: they have no route to the internet yet. That's the next step's topic, and THE point the exam loves to trap.
:::

### step-03

:::lang fr
**Objectif.** Rendre le sous-réseau `public-a` réellement **public** — passerelle Internet + route.

**🤔 Le piège d'examen n°1.** « Mon instance est dans un sous-réseau public mais n'a pas Internet. » Parce qu'un sous-réseau n'est public que si **trois** conditions sont réunies : (1) une **passerelle Internet** attachée au VPC, (2) une **route** `0.0.0.0/0 → IGW` dans la table de routage du sous-réseau, (3) le sous-réseau **associé** à cette table. On fait les trois.

Crée l'IGW, la route, et associe :
:::

:::lang en
**Goal.** Make the `public-a` subnet actually **public** — internet gateway + route.

**🤔 Exam trap #1.** "My instance is in a public subnet but has no internet." Because a subnet is public only if **three** conditions are met: (1) an **internet gateway** attached to the VPC, (2) a **route** `0.0.0.0/0 → IGW` in the subnet's route table, (3) the subnet **associated** with that table. We do all three.

Create the IGW, the route, and associate:
:::

```bash
# 1) Passerelle Internet, attachée au VPC / internet gateway, attached to the VPC
IGW=$(awslocal ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
awslocal ec2 attach-internet-gateway --vpc-id "$VPC" --internet-gateway-id "$IGW"

# 2) Table de routage + route 0.0.0.0/0 vers l'IGW / route table + default route to the IGW
RT=$(awslocal ec2 create-route-table --vpc-id "$VPC" --query 'RouteTable.RouteTableId' --output text)
awslocal ec2 create-route --route-table-id "$RT" \
  --destination-cidr-block 0.0.0.0/0 --gateway-id "$IGW" --query 'Return' --output text

# 3) Associer la table au sous-réseau public / associate the table with the public subnet
awslocal ec2 associate-route-table --route-table-id "$RT" --subnet-id "$PUB" \
  --query 'AssociationId' --output text

# Vérifier la route / verify the route
awslocal ec2 describe-route-tables --route-table-ids "$RT" \
  --query 'RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId]' --output text
```

:::lang fr
**✅ Vérification :** `create-route` renvoie `True`. `describe-route-tables` montre **deux** routes : la route **locale** du VPC (`10.0.0.0/16 local`, implicite) et **ta** route Internet (`0.0.0.0/0` → `igw-...`). C'est cette seconde route qui rend `public-a` public. Le sous-réseau `prive-b`, lui, n'est **pas** associé à cette table : il reste privé. Retiens le triptyque **IGW attaché + route 0.0.0.0/0 + association** — les trois sont nécessaires.
:::

:::lang en
**✅ Check:** `create-route` returns `True`. `describe-route-tables` shows **two** routes: the VPC's **local** route (`10.0.0.0/16 local`, implicit) and **your** internet route (`0.0.0.0/0` → `igw-...`). That second route makes `public-a` public. The `prive-b` subnet is **not** associated with this table: it stays private. Remember the triptych **IGW attached + 0.0.0.0/0 route + association** — all three are needed.
:::

### step-04

:::lang fr
**Objectif.** Créer un **groupe de sécurité** — le pare-feu **stateful** au niveau de l'instance.

**🤔 Stateful, autorisation seulement.** Un SG s'attache à une ressource (une instance). Il est **stateful** : autorise l'entrée sur le port 80, et la **réponse sort automatiquement** — pas besoin de règle sortante pour ça. Un SG n'a **que des règles d'autorisation** (`allow`) : ce qui n'est pas autorisé est implicitement refusé. On crée un SG « web » qui laisse entrer HTTP et SSH.

Crée le SG et ses règles :
:::

:::lang en
**Goal.** Create a **security group** — the **stateful** firewall at the instance level.

**🤔 Stateful, allow-only.** An SG attaches to a resource (an instance). It's **stateful**: allow inbound on port 80, and the **response goes out automatically** — no outbound rule needed for that. An SG has **only allow rules**: what isn't allowed is implicitly denied. We create a "web" SG that lets in HTTP and SSH.

Create the SG and its rules:
:::

```bash
# Créer le groupe de sécurité dans le VPC / create the security group in the VPC
SG=$(awslocal ec2 create-security-group --group-name web-sg \
  --description "Autorise HTTP et SSH" --vpc-id "$VPC" --query 'GroupId' --output text)
echo "SG = $SG"

# Autoriser HTTP (80) depuis partout, SSH (22) depuis partout (labo) / allow HTTP + SSH
awslocal ec2 authorize-security-group-ingress --group-id "$SG" \
  --protocol tcp --port 80 --cidr 0.0.0.0/0 --query 'Return' --output text
awslocal ec2 authorize-security-group-ingress --group-id "$SG" \
  --protocol tcp --port 22 --cidr 0.0.0.0/0 --query 'Return' --output text

# Vérifier les règles entrantes / verify inbound rules
awslocal ec2 describe-security-groups --group-ids "$SG" \
  --query 'SecurityGroups[0].IpPermissions[].[IpProtocol,FromPort,ToPort]' --output table
```

:::lang fr
**✅ Vérification :** les deux `authorize-...-ingress` renvoient `True`. `describe-security-groups` liste **deux** règles entrantes : `tcp 80` et `tcp 22`. Comme le SG est **stateful**, une instance avec ce SG répondra aux requêtes web sans qu'on ajoute de règle **sortante** — la réponse suit la connexion entrante. ⚠️ En prod, on **ne** laisse **pas** SSH ouvert à `0.0.0.0/0` : on restreint à son IP. Ici c'est un labo.
:::

:::lang en
**✅ Check:** both `authorize-...-ingress` return `True`. `describe-security-groups` lists **two** inbound rules: `tcp 80` and `tcp 22`. Since the SG is **stateful**, an instance with this SG will answer web requests without adding an **outbound** rule — the response follows the inbound connection. ⚠️ In prod, you do **not** leave SSH open to `0.0.0.0/0`: restrict it to your IP. Here it's a lab.
:::

### step-05

:::lang fr
**Objectif.** Créer une **NACL** — le pare-feu **stateless** au niveau du sous-réseau — et la distinguer d'un SG.

**🤔 Stateless = les deux sens.** Une NACL s'applique à **tout un sous-réseau** et est **stateless** : chaque sens est évalué séparément. Autoriser l'**entrée** sur le port 80 ne suffit pas ; il faut **aussi** autoriser la **sortie** du trafic de retour (les ports éphémères 1024-65535). C'est LA différence à l'examen : SG stateful (réponse auto), NACL stateless (règle explicite dans les deux sens). La NACL a aussi des règles **deny** (contrairement au SG).

Crée une NACL et une règle entrante :
:::

:::lang en
**Goal.** Create a **NACL** — the **stateless** firewall at the subnet level — and tell it from an SG.

**🤔 Stateless = both directions.** A NACL applies to **a whole subnet** and is **stateless**: each direction is evaluated separately. Allowing **inbound** on port 80 isn't enough; you must **also** allow the return traffic **outbound** (ephemeral ports 1024-65535). That's THE exam difference: SG stateful (auto response), NACL stateless (explicit rule in both directions). The NACL also has **deny** rules (unlike the SG).

Create a NACL and an inbound rule:
:::

```bash
# Créer une NACL dans le VPC / create a NACL in the VPC
NACL=$(awslocal ec2 create-network-acl --vpc-id "$VPC" --query 'NetworkAcl.NetworkAclId' --output text)
echo "NACL = $NACL"

# Règle ENTRANTE : autoriser HTTP (règle n°100) / INBOUND rule: allow HTTP (rule #100)
awslocal ec2 create-network-acl-entry --network-acl-id "$NACL" \
  --rule-number 100 --protocol tcp --port-range From=80,To=80 \
  --cidr-block 0.0.0.0/0 --rule-action allow --ingress

# Règle SORTANTE : autoriser le retour (ports éphémères) / OUTBOUND: allow return traffic
awslocal ec2 create-network-acl-entry --network-acl-id "$NACL" \
  --rule-number 100 --protocol tcp --port-range From=1024,To=65535 \
  --cidr-block 0.0.0.0/0 --rule-action allow --egress

# Vérifier les entrées / verify the entries
awslocal ec2 describe-network-acls --network-acl-ids "$NACL" \
  --query 'NetworkAcls[0].Entries[?RuleNumber==`100`].[Egress,RuleAction,Protocol]' --output table
```

:::lang fr
**✅ Vérification :** `describe-network-acls` montre **deux** entrées n°100 : une **entrante** (`Egress=False`) et une **sortante** (`Egress=True`), toutes deux `allow`. C'est la démonstration du *stateless* : il a fallu écrire la règle de retour **explicitement** (sur les ports éphémères), là où un SG l'aurait fait tout seul. Retiens le tableau : **SG** = instance, stateful, allow-only ; **NACL** = sous-réseau, stateless, allow+deny numérotées.
:::

:::lang en
**✅ Check:** `describe-network-acls` shows **two** rule-#100 entries: one **inbound** (`Egress=False`) and one **outbound** (`Egress=True`), both `allow`. That's the *stateless* demonstration: you had to write the return rule **explicitly** (on the ephemeral ports), where an SG would have done it on its own. Remember the table: **SG** = instance, stateful, allow-only; **NACL** = subnet, stateless, numbered allow+deny.
:::

### step-06

:::lang fr
**Objectif.** Assembler le motif **public/privé** et comprendre le **NAT**.

**🤔 L'architecture de référence.** Le motif que le SAA teste sans cesse : le **web** (joignable d'Internet) va dans le **sous-réseau public** ; la **base de données** (jamais exposée) va dans le **sous-réseau privé**. Mais la base a parfois besoin de **sortir** (mises à jour, appels d'API) sans être **joignable** de l'extérieur : c'est le rôle de la **passerelle NAT**, placée dans le public, vers laquelle on route la sortie du privé.

Crée la table de routage privée (sans route IGW) :
:::

:::lang en
**Goal.** Assemble the **public/private** pattern and understand **NAT**.

**🤔 The reference architecture.** The pattern the SAA tests constantly: the **web** (reachable from the internet) goes in the **public subnet**; the **database** (never exposed) goes in the **private subnet**. But the database sometimes needs to **reach out** (updates, API calls) without being **reachable** from outside: that's the **NAT gateway**'s role, placed in the public subnet, toward which you route the private subnet's egress.

Create the private route table (no IGW route):
:::

```bash
# Table de routage du sous-réseau PRIVÉ : PAS de route 0.0.0.0/0 vers l'IGW / private RT: NO IGW route
RTPRIV=$(awslocal ec2 create-route-table --vpc-id "$VPC" --query 'RouteTable.RouteTableId' --output text)
awslocal ec2 associate-route-table --route-table-id "$RTPRIV" --subnet-id "$PRIV" \
  --query 'AssociationId' --output text

# Vérifier : la table privée n'a QUE la route locale (pas d'IGW) / verify: only the local route
awslocal ec2 describe-route-tables --route-table-ids "$RTPRIV" \
  --query 'RouteTables[0].Routes[].[DestinationCidrBlock,GatewayId]' --output text

# (Concept) En réel, on ajouterait une passerelle NAT dans le public et une route
# 0.0.0.0/0 -> NAT ici, pour la sortie du privé. / (Concept) a NAT gateway would go here.
```

:::lang fr
**✅ Vérification :** `describe-route-tables` sur la table privée ne montre **que** la route locale `10.0.0.0/16 local` — **aucune** route `0.0.0.0/0`. C'est ce qui rend `prive-b` **privé** : ses ressources se parlent au sein du VPC mais ne sont ni joignables ni sortantes vers Internet. Tu as maintenant l'architecture de référence : **public-a** (route IGW) pour le web, **prive-b** (pas de route IGW) pour la base. ⚠️ Pour donner une **sortie** au privé (sans entrée), on ajouterait une **passerelle NAT** dans le public + une route `0.0.0.0/0 → NAT` dans `RTPRIV`. LocalStack communautaire simule mal le NAT, d'où le passage en concept ici — mais tu sais où et pourquoi il s'insère.
:::

:::lang en
**✅ Check:** `describe-route-tables` on the private table shows **only** the local route `10.0.0.0/16 local` — **no** `0.0.0.0/0` route. That's what makes `prive-b` **private**: its resources talk within the VPC but are neither reachable nor outbound to the internet. You now have the reference architecture: **public-a** (IGW route) for the web, **prive-b** (no IGW route) for the database. ⚠️ To give the private subnet **egress** (without ingress), you'd add a **NAT gateway** in the public subnet + a `0.0.0.0/0 → NAT` route in `RTPRIV`. Community LocalStack simulates NAT poorly, hence the conceptual treatment here — but you know where and why it fits.
:::

### step-07

:::lang fr
**Objectif.** Inspecter l'ensemble du réseau, puis **nettoyer** dans le bon ordre.

**🤔 L'ordre de suppression.** Les ressources réseau ont des **dépendances** : on ne peut pas supprimer un VPC tant qu'il contient des sous-réseaux, une IGW attachée, des tables, des SG. On détache/supprime **de l'intérieur vers l'extérieur** : entrées, associations, IGW détachée, sous-réseaux, tables, SG, NACL, puis VPC.

Fais le tour puis range :
:::

:::lang en
**Goal.** Inspect the whole network, then **clean up** in the right order.

**🤔 The deletion order.** Network resources have **dependencies**: you can't delete a VPC while it holds subnets, an attached IGW, tables, SGs. You detach/delete **from the inside out**: entries, associations, detached IGW, subnets, tables, SGs, NACL, then the VPC.

Take the tour then tidy:
:::

```bash
# Vue d'ensemble de ton VPC / overview of your VPC
awslocal ec2 describe-subnets       --filters "Name=vpc-id,Values=$VPC" --query 'Subnets[].CidrBlock' --output text
awslocal ec2 describe-route-tables  --filters "Name=vpc-id,Values=$VPC" --query 'RouteTables[].RouteTableId' --output text
awslocal ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC" --query 'SecurityGroups[].GroupName' --output text

# Nettoyage (de l'intérieur vers l'extérieur) / cleanup (inside out)
awslocal ec2 detach-internet-gateway --vpc-id "$VPC" --internet-gateway-id "$IGW"
awslocal ec2 delete-internet-gateway --internet-gateway-id "$IGW"
awslocal ec2 delete-subnet --subnet-id "$PUB"
awslocal ec2 delete-subnet --subnet-id "$PRIV"
awslocal ec2 delete-security-group --group-id "$SG"
awslocal ec2 delete-network-acl --network-acl-id "$NACL"
awslocal ec2 delete-route-table --route-table-id "$RT"
awslocal ec2 delete-route-table --route-table-id "$RTPRIV"
awslocal ec2 delete-vpc --vpc-id "$VPC"
echo "VPC supprimé / VPC deleted"
```

:::lang fr
**✅ Vérification :** la vue d'ensemble liste tes sous-réseaux (`10.0.1.0/24`, `10.0.2.0/24`), tes tables de routage et ton SG `web-sg` — tout ton réseau en un coup d'œil. Le nettoyage s'exécute **sans erreur** parce que l'ordre respecte les dépendances (IGW détachée avant suppression, ressources internes avant le VPC). Après, `describe-vpcs --vpc-ids $VPC` renvoie une erreur « InvalidVpcID.NotFound » : le VPC n'existe plus. ⚠️ En réel, un `delete-vpc` qui échoue signale presque toujours une **dépendance oubliée** (une instance, une ENI, une passerelle encore attachée).
:::

:::lang en
**✅ Check:** the overview lists your subnets (`10.0.1.0/24`, `10.0.2.0/24`), your route tables and your `web-sg` SG — your whole network at a glance. The cleanup runs **with no error** because the order respects dependencies (IGW detached before deletion, inner resources before the VPC). After, `describe-vpcs --vpc-ids $VPC` returns an "InvalidVpcID.NotFound" error: the VPC is gone. ⚠️ In real AWS, a failing `delete-vpc` almost always signals a **forgotten dependency** (an instance, an ENI, a still-attached gateway).
:::

## pitfalls

:::lang fr
**1. Croire qu'un sous-réseau est « public » par nature.** Non : il est public **si sa table de routage a une route vers une IGW**. Sans cette route, il est privé. C'est le piège de réseau n°1 du SAA.

**2. Oublier une des trois conditions du sous-réseau public.** IGW **attachée** + route `0.0.0.0/0 → IGW` + sous-réseau **associé** à cette table. Les trois, sinon pas d'Internet.

**3. Confondre SG et NACL.** **SG** = niveau instance, **stateful** (réponse auto), **allow-only**. **NACL** = niveau sous-réseau, **stateless** (règle explicite dans les deux sens), **allow+deny**. Question récurrente à l'examen.

**4. NACL : oublier la règle de retour.** Comme la NACL est stateless, autoriser l'entrée sur 80 ne laisse **pas** sortir la réponse. Il faut une règle **sortante** sur les ports éphémères (1024-65535). Symptôme : « ça se connecte mais rien ne revient ».

**5. Un sous-réseau dans plusieurs AZ.** Impossible : un sous-réseau = **une** AZ. Pour du multi-AZ, il faut **plusieurs** sous-réseaux, un par AZ.

**6. Mettre une base de données dans un sous-réseau public.** Une base n'a aucune raison d'être joignable d'Internet. Elle va en **privé** ; si elle doit sortir (mises à jour), c'est via un **NAT**, jamais via une IGW directe.

**7. Supprimer un VPC sans vider ses dépendances.** `delete-vpc` échoue tant qu'il reste des sous-réseaux, une IGW attachée, des ENI. Nettoie de l'intérieur vers l'extérieur.
:::

:::lang en
**1. Thinking a subnet is "public" by nature.** No: it's public **if its route table has a route to an IGW**. Without that route, it's private. It's the SAA's #1 networking trap.

**2. Forgetting one of the three public-subnet conditions.** IGW **attached** + `0.0.0.0/0 → IGW` route + subnet **associated** with that table. All three, or no internet.

**3. Confusing SG and NACL.** **SG** = instance level, **stateful** (auto response), **allow-only**. **NACL** = subnet level, **stateless** (explicit rule both ways), **allow+deny**. Recurring exam question.

**4. NACL: forgetting the return rule.** Since the NACL is stateless, allowing inbound on 80 does **not** let the response out. You need an **outbound** rule on the ephemeral ports (1024-65535). Symptom: "it connects but nothing comes back".

**5. A subnet across multiple AZs.** Impossible: a subnet = **one** AZ. For multi-AZ you need **several** subnets, one per AZ.

**6. Putting a database in a public subnet.** A database has no reason to be reachable from the internet. It goes in the **private** subnet; if it must reach out (updates), that's via a **NAT**, never a direct IGW.

**7. Deleting a VPC without clearing its dependencies.** `delete-vpc` fails while subnets, an attached IGW, or ENIs remain. Clean from the inside out.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées un VPC avec un CIDR et tu expliques la taille du bloc.
- [ ] Tu découpes en sous-réseaux sur **deux AZ**.
- [ ] Tu rends un sous-réseau public via IGW + route `0.0.0.0/0` + association.
- [ ] Tu configures un SG (stateful) et tu sais pourquoi il n'a pas besoin de règle de retour.
- [ ] Tu configures une NACL (stateless) avec ses règles entrante **et** sortante.
- [ ] Tu montres qu'un sous-réseau privé n'a **pas** de route `0.0.0.0/0`, et tu places le NAT.
- [ ] Tu nettoies ton VPC dans le bon ordre, sans erreur de dépendance.

Sept cases = tu tiens le réseau au niveau SAA. La suite : le compute (EC2 & Lambda).
:::

:::lang en
You know it works when…

- [ ] You create a VPC with a CIDR and explain the block size.
- [ ] You split into subnets across **two AZs**.
- [ ] You make a subnet public via IGW + `0.0.0.0/0` route + association.
- [ ] You configure an SG (stateful) and know why it needs no return rule.
- [ ] You configure a NACL (stateless) with its inbound **and** outbound rules.
- [ ] You show a private subnet has **no** `0.0.0.0/0` route, and you place the NAT.
- [ ] You clean up your VPC in the right order, with no dependency error.

Seven boxes = you hold networking at SAA level. Next up: compute (EC2 & Lambda).
:::

## next

:::lang fr
La suite du track AWS → SAA-C03 :

1. **AWS — compute EC2 & Lambda** : lancer des machines virtuelles (EC2, AMI, user-data, dans tes sous-réseaux), puis le serverless avec Lambda (fonctions, invocation, déclencheurs). Choisir entre serveur et sans-serveur.
2. Plus loin : découplage (SQS/SNS/DynamoDB), le **projet d'entreprise** serverless, puis **passer en réel**.
:::

:::lang en
The AWS → SAA-C03 track continues:

1. **AWS — EC2 & Lambda compute**: launch virtual machines (EC2, AMI, user-data, in your subnets), then serverless with Lambda (functions, invocation, triggers). Choosing between server and serverless.
2. Further along: decoupling (SQS/SNS/DynamoDB), the serverless **enterprise project**, then **going real**.
:::

## cheatsheet

:::lang fr
Aide-mémoire VPC.
:::

:::lang en
VPC cheat sheet.
:::

```bash
# VPC & sous-réseaux / VPC & subnets
awslocal ec2 create-vpc --cidr-block 10.0.0.0/16
awslocal ec2 create-subnet --vpc-id $VPC --cidr-block 10.0.1.0/24 --availability-zone us-east-1a

# Rendre public : IGW + route + association / make public
awslocal ec2 create-internet-gateway
awslocal ec2 attach-internet-gateway --vpc-id $VPC --internet-gateway-id $IGW
awslocal ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW
awslocal ec2 associate-route-table --route-table-id $RT --subnet-id $PUB

# Groupe de sécurité (stateful, instance) / security group
awslocal ec2 create-security-group --group-name web-sg --description d --vpc-id $VPC
awslocal ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 80 --cidr 0.0.0.0/0

# NACL (stateless, sous-réseau) / NACL — règle dans les DEUX sens / rule BOTH ways
awslocal ec2 create-network-acl --vpc-id $VPC
awslocal ec2 create-network-acl-entry --network-acl-id $NACL --rule-number 100 \
  --protocol tcp --port-range From=80,To=80 --cidr-block 0.0.0.0/0 --rule-action allow --ingress

# Inspecter / inspect
awslocal ec2 describe-vpcs ; describe-subnets ; describe-route-tables ; describe-security-groups
```

## resources

:::lang fr
- [Amazon VPC — guide](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) — la référence réseau.
- [Sous-réseaux et tables de routage](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html) — public vs privé.
- [Groupes de sécurité](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) — stateful, règles.
- [Network ACL](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) — stateless, numérotées.
- [Passerelles NAT](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) — sortie du privé.
:::

:::lang en
- [Amazon VPC — guide](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) — the networking reference.
- [Subnets and route tables](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html) — public vs private.
- [Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) — stateful, rules.
- [Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) — stateless, numbered.
- [NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) — private subnet egress.
:::

## troubleshooting

:::lang fr
**Mon « sous-réseau public » n'a pas Internet.** Vérifie les **trois** conditions : IGW attachée au VPC, route `0.0.0.0/0 → IGW` dans la table, table **associée** au sous-réseau. Il en manque une.

**`create-route` renvoie une erreur `RouteAlreadyExists`.** Une route pour ce CIDR existe déjà dans la table. Supprime-la (`delete-route`) ou vise une autre table.

**Ma NACL bloque tout alors que j'ai autorisé l'entrée.** Elle est stateless : ajoute la règle **sortante** pour le trafic de retour (ports éphémères 1024-65535).

**`delete-vpc` échoue (`DependencyViolation`).** Des ressources sont encore dans le VPC. Supprime d'abord sous-réseaux, tables non-principales, SG non-défaut, IGW (détacher puis supprimer), NACL non-défaut.

**`delete-subnet` échoue.** Une ressource utilise encore le sous-réseau (instance, ENI, passerelle NAT). Supprime-la d'abord.

**Je ne retrouve plus mes IDs (`$VPC`, `$SG`…).** Le shell a été fermé. Relis-les : `awslocal ec2 describe-vpcs`, `describe-subnets`, `describe-security-groups`, etc.
:::

:::lang en
**My "public subnet" has no internet.** Check the **three** conditions: IGW attached to the VPC, `0.0.0.0/0 → IGW` route in the table, table **associated** with the subnet. One is missing.

**`create-route` returns a `RouteAlreadyExists` error.** A route for that CIDR already exists in the table. Delete it (`delete-route`) or target another table.

**My NACL blocks everything even though I allowed inbound.** It's stateless: add the **outbound** rule for the return traffic (ephemeral ports 1024-65535).

**`delete-vpc` fails (`DependencyViolation`).** Resources are still in the VPC. Delete subnets, non-main route tables, non-default SGs, IGW (detach then delete), non-default NACLs first.

**`delete-subnet` fails.** A resource still uses the subnet (instance, ENI, NAT gateway). Delete it first.

**I lost my IDs (`$VPC`, `$SG`…).** The shell was closed. Re-read them: `awslocal ec2 describe-vpcs`, `describe-subnets`, `describe-security-groups`, etc.
:::
