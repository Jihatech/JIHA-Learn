---
# — Identité (ne change JAMAIS une fois publié) —
id: linux-reseau-securite
slug: linux-reseau-securite
order: 7
status: published

# — Titres & accroches (bilingue) —
title_fr: "Linux — réseau & sécurité système"
title_en: "Linux — networking & system security"
tagline_fr: "ip, ss, DNS, SSH, durcissement, pare-feu."
tagline_en: "ip, ss, DNS, SSH, hardening, firewall."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 195
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [linux-boot-systemd]
next: [git-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [adressage-ip, ports-sockets, resolution-dns, ssh-cles, ssh-durcissement, pare-feu-ufw]
concepts_en: [ip-addressing, ports-sockets, dns-resolution, ssh-keys, ssh-hardening, ufw-firewall]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Réseau et sécurité Linux au niveau LPIC-1 : l'adressage IP et les routes (ip), les ports à l'écoute (ss), la chaîne de résolution DNS (/etc/hosts, nsswitch, resolved, dig), l'authentification SSH par clés, le durcissement du serveur SSH, et le pare-feu ufw. Refaisable sans risque dans une VM."
og_description_en: "Linux networking and security at LPIC-1 level: IP addressing and routes (ip), listening ports (ss), the DNS resolution chain (/etc/hosts, nsswitch, resolved, dig), SSH key authentication, SSH server hardening, and the ufw firewall. Reproducible risk-free in a VM."
---

## intro

:::lang fr
Un serveur **est fait pour le réseau** : il écoute, il répond, il se connecte. Et dès qu'il est en ligne, il est **exposé** — d'où l'inséparable couple **réseau & sécurité**. Le guide fondamentaux t'a montré `ip a` et `ping` ; l'examen **LPIC-1** attend la maîtrise d'admin : *quelle est mon adresse, ma route, ma passerelle ? quels ports mon serveur ouvre-t-il ? comment un nom se résout-il en IP ? comment se connecter en SSH par clé (sans mot de passe) ? comment durcir le serveur SSH ? comment fermer tout sauf l'essentiel avec un pare-feu ?*

Ce guide couvre les domaines **Réseau & sécurité** : l'**adressage IP** et les routes (**`ip`**), les **ports** à l'écoute (**`ss`**), la **résolution DNS** (`/etc/hosts`, `nsswitch`, `resolved`, `dig`), l'**authentification SSH par clés**, le **durcissement** du serveur SSH, et le **pare-feu `ufw`**.

⚠️ **Fais ce guide dans une VM Multipass.** Les étapes SSH et pare-feu **peuvent couper un accès distant** si elles sont mal faites. Dans une VM, tu gardes **toujours** la console (`multipass shell`) même si SSH ou le pare-feu bloque — c'est le filet de sécurité indispensable pour apprendre ces manœuvres.

**Pour qui c'est :** tu as les guides précédents de la track et tu vises **LPIC-1**.

**Quand ce n'est PAS le bon choix :**

- Tu ne connais pas `ip a`/`ping` → revois le réseau dans le guide fondamentaux.
- Tu veux le scripting ou le projet → ce sont les étapes suivantes.
:::

:::lang en
A server **is made for the network**: it listens, it answers, it connects. And the moment it's online, it's **exposed** — hence the inseparable **networking & security** pair. The fundamentals guide showed you `ip a` and `ping`; the **LPIC-1** exam expects admin mastery: *what's my address, route, gateway? which ports does my server open? how does a name resolve to an IP? how do you SSH in with a key (no password)? how do you harden the SSH server? how do you close everything but the essentials with a firewall?*

This guide covers the **Networking & security** domains: **IP addressing** and routes (**`ip`**), listening **ports** (**`ss`**), **DNS resolution** (`/etc/hosts`, `nsswitch`, `resolved`, `dig`), **SSH key authentication**, SSH server **hardening**, and the **`ufw` firewall**.

⚠️ **Do this guide in a Multipass VM.** The SSH and firewall steps **can cut off remote access** if done wrong. In a VM you **always** keep the console (`multipass shell`) even if SSH or the firewall blocks — the essential safety net for learning these maneuvers.

**Who it's for:** you have the earlier track guides and you're aiming for **LPIC-1**.

**When it's NOT the right choice:**

- You don't know `ip a`/`ping` → review networking in the fundamentals guide.
- You want scripting or the project → those are the next steps.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Lire l'**adressage** : interfaces, IP/CIDR, **routes**, passerelle (`ip`).
- Lister les **ports à l'écoute** et les processus derrière (`ss`).
- Expliquer la **chaîne de résolution DNS** et interroger un nom (`dig`, `getent`).
- Générer une **paire de clés SSH** et te connecter **sans mot de passe**.
- **Durcir** le serveur SSH (`sshd_config` : root, mots de passe) et valider (`sshd -t`).
- Configurer un **pare-feu** avec `ufw` (deny par défaut, autoriser l'essentiel).
:::

:::lang en
By the end of this guide, you'll know how to:

- Read **addressing**: interfaces, IP/CIDR, **routes**, gateway (`ip`).
- List **listening ports** and the processes behind them (`ss`).
- Explain the **DNS resolution chain** and query a name (`dig`, `getent`).
- Generate an **SSH key pair** and connect **without a password**.
- **Harden** the SSH server (`sshd_config`: root, passwords) and validate (`sshd -t`).
- Configure a **firewall** with `ufw` (default deny, allow the essentials).
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides précédents de la track Linux acquis.
- Une **VM Ubuntu Multipass** (fortement recommandé — voir l'avertissement) avec `sudo`.
- Les outils réseau/SSH :
:::

:::lang en
You should have:

- The earlier Linux track guides under your belt.
- An **Ubuntu Multipass VM** (strongly recommended — see the warning) with `sudo`.
- The networking/SSH tools:
:::

```bash
sudo apt update && sudo apt install -y bind9-dnsutils openssh-server ufw
```

## concepts

:::lang fr
**L'adressage IP.** Une machine a une ou plusieurs **interfaces** (`eth0`, `lo`…), chacune avec une **adresse IP** et un **masque** en notation **CIDR** (`/24` = 256 adresses). Pour joindre l'extérieur, elle passe par une **passerelle** (la **route par défaut**). `ip` est l'outil moderne : `ip addr` (adresses), `ip route` (routes), `ip link` (interfaces). Les plages **privées** (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) ne sont pas routées sur Internet.

**Ports & sockets.** Un service **écoute** sur un **port** (SSH 22, HTTP 80, HTTPS 443…). **`ss`** (successeur de `netstat`) liste les sockets : `ss -tlnp` = **t**cp, **l**istening, **n**umérique, **p**rocessus. C'est ainsi qu'on répond à « **qu'est-ce qui écoute sur ma machine ?** » — première question d'un audit de sécurité (chaque port ouvert est une porte).

**La résolution DNS**, la chaîne qui transforme un **nom** en **IP** :

1. **`/etc/nsswitch.conf`** (ligne `hosts:`) décide de **l'ordre** des sources.
2. **`/etc/hosts`** : la table locale (consultée en premier, en général) — un nom → une IP, en dur.
3. Le **résolveur DNS** : sur Ubuntu, **`systemd-resolved`** (`/etc/resolv.conf` pointe vers `127.0.0.53`), qui interroge les serveurs DNS.

Outils : **`getent hosts nom`** (suit **toute** la chaîne nsswitch), **`dig`**/**`host`** (interrogent **directement** le DNS, sans nsswitch).

**SSH**, l'accès distant sécurisé. L'**authentification par clés** remplace le mot de passe : tu génères une **paire** (clé **privée** secrète chez toi, clé **publique** posée sur le serveur dans `~/.ssh/authorized_keys`). Le serveur te défie, ta clé privée répond — sans jamais transmettre de secret. C'est **plus sûr** et scriptable. Le serveur se configure dans **`sshd_config`** ; les **durcissements** clés : `PermitRootLogin no` (pas de root direct), `PasswordAuthentication no` (clés seulement).

**Le pare-feu.** Par défaut, tout port ouvert est joignable. Un **pare-feu** applique une politique : **tout refuser en entrée**, puis **autoriser** au cas par cas (SSH, web…). Sur Ubuntu, **`ufw`** est la surcouche simple de **`nftables`** (le moteur du noyau). Principe d'or : **deny par défaut, allow l'exception**.
:::

:::lang en
**IP addressing.** A machine has one or more **interfaces** (`eth0`, `lo`…), each with an **IP address** and a **mask** in **CIDR** notation (`/24` = 256 addresses). To reach the outside, it goes through a **gateway** (the **default route**). `ip` is the modern tool: `ip addr` (addresses), `ip route` (routes), `ip link` (interfaces). The **private** ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) aren't routed on the Internet.

**Ports & sockets.** A service **listens** on a **port** (SSH 22, HTTP 80, HTTPS 443…). **`ss`** (netstat's successor) lists sockets: `ss -tlnp` = **t**cp, **l**istening, **n**umeric, **p**rocess. That's how you answer "**what's listening on my machine?**" — the first question of a security audit (every open port is a door).

**DNS resolution**, the chain that turns a **name** into an **IP**:

1. **`/etc/nsswitch.conf`** (the `hosts:` line) decides the **order** of sources.
2. **`/etc/hosts`**: the local table (usually consulted first) — a name → an IP, hardcoded.
3. The **DNS resolver**: on Ubuntu, **`systemd-resolved`** (`/etc/resolv.conf` points to `127.0.0.53`), which queries the DNS servers.

Tools: **`getent hosts name`** (follows the **whole** nsswitch chain), **`dig`**/**`host`** (query **DNS directly**, bypassing nsswitch).

**SSH**, secure remote access. **Key authentication** replaces the password: you generate a **pair** (secret **private** key on your side, **public** key placed on the server in `~/.ssh/authorized_keys`). The server challenges you, your private key answers — without ever transmitting a secret. It's **safer** and scriptable. The server is configured in **`sshd_config`**; the key **hardenings**: `PermitRootLogin no` (no direct root), `PasswordAuthentication no` (keys only).

**The firewall.** By default, every open port is reachable. A **firewall** enforces a policy: **deny everything inbound**, then **allow** case by case (SSH, web…). On Ubuntu, **`ufw`** is the simple front-end to **`nftables`** (the kernel engine). Golden rule: **default deny, allow the exception**.
:::

:::figure linux-network-security
caption_fr: "Schéma 1. ip (adresses/routes) et ss (ports) inspectent ; DNS résout les noms ; SSH par clés authentifie ; le pare-feu ufw filtre l'entrée (deny par défaut)."
caption_en: "Figure 1. ip (addresses/routes) and ss (ports) inspect; DNS resolves names; SSH keys authenticate; the ufw firewall filters inbound (default deny)."
:::

:::lang fr
On avance : adresses & routes → ports à l'écoute → DNS → clés SSH → durcir SSH → pare-feu ufw.
:::

:::lang en
We'll go: addresses & routes → listening ports → DNS → SSH keys → harden SSH → ufw firewall.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Lire l'**adressage** : interfaces, IP/CIDR, routes, passerelle.

**🤔 Trois questions, trois vues.** *Quelle IP ? quelle route ? quelle passerelle ?* Inspecte :
:::

:::lang en
**Goal.** Read **addressing**: interfaces, IP/CIDR, routes, gateway.

**🤔 Three questions, three views.** *Which IP? which route? which gateway?* Inspect:
:::

```bash
ip -br addr                 # résumé : interfaces + IP/CIDR / summary: interfaces + IP/CIDR
ip route                    # les routes ; "default via X" = la passerelle / routes; "default via X" = gateway
ip link                     # état des interfaces (UP/DOWN) / interfaces' state
ping -c 3 1.1.1.1           # connectivité IP brute (sans DNS) / raw IP connectivity (no DNS)
```

:::lang fr
**✅ Vérification :** `ip -br addr` montre tes interfaces avec leur **IP/CIDR** (ex. `eth0  UP  10.x.x.x/24` et `lo  UNKNOWN  127.0.0.1/8`). `ip route` affiche une ligne **`default via …`** : c'est ta **passerelle** (par où sort le trafic Internet). Le `ping -c 3 1.1.1.1` (une IP, pas un nom) teste la **connectivité pure**, sans DNS. Tu sais lire l'identité réseau d'une machine : adresse, masque, route, passerelle.
:::

:::lang en
**✅ Check:** `ip -br addr` shows your interfaces with their **IP/CIDR** (e.g. `eth0  UP  10.x.x.x/24` and `lo  UNKNOWN  127.0.0.1/8`). `ip route` shows a **`default via …`** line: that's your **gateway** (where Internet traffic exits). The `ping -c 3 1.1.1.1` (an IP, not a name) tests **pure connectivity**, without DNS. You can read a machine's network identity: address, mask, route, gateway.
:::

### step-02

:::lang fr
**Objectif.** Lister les **ports à l'écoute** — l'inventaire des portes ouvertes.

**🤔 Qu'est-ce qui écoute ?** Chaque service en écoute = un point d'entrée. `ss` les liste (avec `sudo` pour voir les processus) :
:::

:::lang en
**Goal.** List the **listening ports** — the inventory of open doors.

**🤔 What's listening?** Each listening service = an entry point. `ss` lists them (with `sudo` to see the processes):
:::

```bash
sudo ss -tlnp              # TCP, Listening, Numérique, Processus / TCP, Listening, Numeric, Process
grep -E '\bssh\b' /etc/services   # le port officiel de ssh (22) / ssh's official port (22)
```

:::lang fr
**✅ Vérification :** `sudo ss -tlnp` liste chaque socket **en écoute** avec son port et le **processus** derrière — au minimum le port **`:22`** (SSH) et le résolveur `systemd-resolve` sur `127.0.0.53:53`. *(Sur Ubuntu 24.04, SSH est **activé par socket** : tant qu'aucune connexion n'a eu lieu, `:22` est tenu par **`systemd`** (PID 1), pas par `sshd` — à la première connexion, `ssh.service`/`sshd` prend le relais.)* Tu réponds à « **qu'est-ce qui est exposé ?** ». `/etc/services` mappe les noms de services aux ports (ssh → 22). Mémorise les drapeaux : **`-t`** tcp, **`-l`** listening, **`-n`** numérique (pas de résolution), **`-p`** processus. C'est le réflexe d'audit n°1.
:::

:::lang en
**✅ Check:** `sudo ss -tlnp` lists each **listening** socket with its port and the **process** behind it — at minimum port **`:22`** (SSH) and the resolver `systemd-resolve` on `127.0.0.53:53`. *(On Ubuntu 24.04, SSH is **socket-activated**: until a connection happens, `:22` is held by **`systemd`** (PID 1), not `sshd` — on the first connection, `ssh.service`/`sshd` takes over.)* You answer "**what's exposed?**". `/etc/services` maps service names to ports (ssh → 22). Memorize the flags: **`-t`** tcp, **`-l`** listening, **`-n`** numeric (no resolution), **`-p`** process. It's audit reflex #1.
:::

### step-03

:::lang fr
**Objectif.** Comprendre la **chaîne de résolution DNS** et interroger un nom.

**🤔 Nom → IP, mais par où ?** L'ordre est dans `nsswitch.conf`, `/etc/hosts` passe souvent en premier. Prouve-le en ajoutant une entrée locale :
:::

:::lang en
**Goal.** Understand the **DNS resolution chain** and query a name.

**🤔 Name → IP, but through what?** The order is in `nsswitch.conf`, `/etc/hosts` usually comes first. Prove it by adding a local entry:
:::

```bash
grep '^hosts:' /etc/nsswitch.conf     # l'ordre des sources (files dns...) / the source order
cat /etc/resolv.conf                   # sur Ubuntu : nameserver 127.0.0.53 (systemd-resolved)

echo "203.0.113.42  monserveur.test" | sudo tee -a /etc/hosts   # entrée locale bidon / bogus local entry
getent hosts monserveur.test           # suit nsswitch -> lit /etc/hosts / follows nsswitch -> reads /etc/hosts
dig +short example.com                  # interroge le DNS directement / queries DNS directly
sudo sed -i '/monserveur.test/d' /etc/hosts    # nettoie l'entrée / clean up the entry
```

:::lang fr
**✅ Vérification :** `grep '^hosts:' /etc/nsswitch.conf` montre l'ordre — sur 24.04 avec systemd-resolved, souvent `files resolve [!UNAVAIL=return] dns`. L'essentiel : **`files` est en premier** → **`/etc/hosts` d'abord**, puis la résolution DNS. Preuve : `getent hosts monserveur.test` renvoie **`203.0.113.42`** — l'IP bidon qu'on a mise dans `/etc/hosts`, **sans** jamais toucher au DNS (elle n'existe pas sur Internet). En face, `dig +short example.com` interroge **directement** le DNS et renvoie une vraie IP publique. Distinction d'examen : **`getent`** suit **nsswitch** (hosts + dns), **`dig`** court-circuite et parle **au DNS**.
:::

:::lang en
**✅ Check:** `grep '^hosts:' /etc/nsswitch.conf` shows the order — on 24.04 with systemd-resolved, often `files resolve [!UNAVAIL=return] dns`. The key point: **`files` is first** → **`/etc/hosts` first**, then DNS resolution. Proof: `getent hosts monserveur.test` returns **`203.0.113.42`** — the bogus IP we put in `/etc/hosts`, **without** ever touching DNS (it doesn't exist on the Internet). Meanwhile, `dig +short example.com` queries **DNS directly** and returns a real public IP. Exam distinction: **`getent`** follows **nsswitch** (hosts + dns), **`dig`** bypasses it and talks **to DNS**.
:::

### step-04

:::lang fr
**Objectif.** Générer une **paire de clés SSH** et te connecter **sans mot de passe**.

**🤔 Clé privée vs publique.** La **privée** reste secrète chez toi ; la **publique** se pose sur le serveur. On teste sur `localhost` (le serveur SSH tourne déjà) :
:::

:::lang en
**Goal.** Generate an **SSH key pair** and connect **without a password**.

**🤔 Private vs public key.** The **private** one stays secret on your side; the **public** one is placed on the server. We test on `localhost` (the SSH server is already running):
:::

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""    # paire de clés, sans passphrase (démo) / key pair, no passphrase
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys # pose la clé PUBLIQUE / install the PUBLIC key
chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys

ssh -o StrictHostKeyChecking=accept-new localhost hostname   # se connecte par CLÉ, sans mot de passe / connects by KEY
```

:::lang fr
**✅ Vérification :** `ssh localhost hostname` renvoie le nom de la VM **sans te demander de mot de passe** — l'authentification s'est faite **par clé** : le serveur a vérifié que ta clé privée correspond à la publique posée dans `authorized_keys`. Les **permissions strictes** (`700` sur `~/.ssh`, `600` sur `authorized_keys`) sont **obligatoires** : SSH **refuse** les clés si le dossier est trop ouvert (sécurité). Tu as le socle de tout accès serveur moderne : **des clés, pas des mots de passe**.
:::

:::lang en
**✅ Check:** `ssh localhost hostname` returns the VM's name **without asking for a password** — authentication happened **by key**: the server verified your private key matches the public one placed in `authorized_keys`. The **strict permissions** (`700` on `~/.ssh`, `600` on `authorized_keys`) are **mandatory**: SSH **refuses** keys if the folder is too open (security). You have the foundation of all modern server access: **keys, not passwords**.
:::

### step-05

:::lang fr
**Objectif.** **Durcir** le serveur SSH : pas de root, pas de mots de passe.

⚠️ **Filet de sécurité.** On désactive l'auth par mot de passe : **assure-toi d'abord que ta clé marche** (étape 4 ✅). Dans une VM, la console reste de toute façon accessible. On écrit une surcharge dans `sshd_config.d/` (propre) :
:::

:::lang en
**Goal.** **Harden** the SSH server: no root, no passwords.

⚠️ **Safety net.** We disable password auth: **make sure your key works first** (step 4 ✅). In a VM, the console stays accessible anyway. We write an override in `sshd_config.d/` (clean):
:::

```bash
sudo tee /etc/ssh/sshd_config.d/99-durcissement.conf >/dev/null <<'EOF'
PermitRootLogin no
PasswordAuthentication no
X11Forwarding no
EOF

sudo sshd -t && echo "config SSH valide / SSH config valid"   # VALIDE avant d'appliquer / VALIDATE before applying
sudo systemctl reload ssh
sudo sshd -T | grep -iE 'permitrootlogin|passwordauthentication'   # confirme les valeurs effectives (sudo : lit les host keys) / effective values (sudo: reads host keys)
```

:::lang fr
**✅ Vérification :** `sudo sshd -t` ne renvoie **rien** (ou ton message « valide ») = la config est **syntaxiquement correcte** — étape **cruciale** avant tout `reload` (une faute ici couperait SSH). `sudo sshd -T | grep …` confirme les valeurs **effectives** : `permitrootlogin no` et `passwordauthentication no` *(le `sudo` est requis : `sshd -T` lit les clés d'hôte privées)*. Désormais, le serveur **refuse** root en direct et **n'accepte que les clés** — deux durcissements majeurs du programme LPIC-1. *(Un `Port` différent se change aussi ici, mais sur Ubuntu 24.04 le port est piloté par `ssh.socket` — édite-le avec `systemctl edit ssh.socket`.)*
:::

:::lang en
**✅ Check:** `sudo sshd -t` returns **nothing** (or your "valid" message) = the config is **syntactically correct** — a **crucial** step before any `reload` (a mistake here would cut SSH). `sudo sshd -T | grep …` confirms the **effective** values: `permitrootlogin no` and `passwordauthentication no` *(the `sudo` is required: `sshd -T` reads the private host keys)*. The server now **refuses** direct root and **accepts only keys** — two major LPIC-1 hardenings. *(A different `Port` is also changed here, but on Ubuntu 24.04 the port is driven by `ssh.socket` — edit it with `systemctl edit ssh.socket`.)*
:::

### step-06

:::lang fr
**Objectif.** Fermer tout sauf l'essentiel avec le **pare-feu `ufw`**.

⚠️ **Ordre vital.** **Autorise SSH AVANT d'activer** le pare-feu, sinon tu te coupes l'accès. (Dans une VM, la console te sauve — mais prends le réflexe.)
:::

:::lang en
**Goal.** Close everything but the essentials with the **`ufw` firewall**.

⚠️ **Vital order.** **Allow SSH BEFORE enabling** the firewall, or you cut off your own access. (In a VM the console saves you — but build the reflex.)
:::

```bash
sudo ufw allow OpenSSH             # AUTORISE le SSH d'abord ! (port 22) / ALLOW SSH first! (port 22)
sudo ufw default deny incoming     # politique : tout refuser en entrée / policy: deny all inbound
sudo ufw default allow outgoing    # ...autoriser la sortie / ...allow outbound
sudo ufw --force enable            # active le pare-feu / enable the firewall
sudo ufw status verbose            # règles actives / active rules
```

:::lang fr
**✅ Vérification :** `sudo ufw status verbose` montre **`Default: deny (incoming), allow (outgoing)`** et une règle **`OpenSSH   ALLOW   Anywhere`**. Résultat : **seul** le port 22 (SSH) est joignable de l'extérieur ; tout le reste est **fermé**. C'est le principe **deny par défaut, allow l'exception** — la posture de sécurité de base d'un serveur. `ufw` traduit ça en règles **`nftables`** dans le noyau. *(Pour désactiver : `sudo ufw disable`.)*

**🤔 Aller plus loin.** En prod, on ajoute souvent **`fail2ban`** (`sudo apt install fail2ban`) : il surveille les logs SSH et **bannit** temporairement les IP qui multiplient les échecs — une défense contre le *brute-force*, complémentaire des clés et du pare-feu.
:::

:::lang en
**✅ Check:** `sudo ufw status verbose` shows **`Default: deny (incoming), allow (outgoing)`** and an **`OpenSSH   ALLOW   Anywhere`** rule. Result: **only** port 22 (SSH) is reachable from outside; everything else is **closed**. That's the **default deny, allow the exception** principle — a server's baseline security posture. `ufw` translates this into **`nftables`** rules in the kernel. *(To disable: `sudo ufw disable`.)*

**🤔 Going further.** In prod, you often add **`fail2ban`** (`sudo apt install fail2ban`): it watches SSH logs and temporarily **bans** IPs that rack up failures — a defense against *brute-force*, complementing keys and the firewall.
:::

## pitfalls

:::lang fr
**1. Activer le pare-feu avant d'autoriser SSH.** `ufw enable` sans `allow OpenSSH` **te coupe l'accès distant**. Toujours autoriser SSH **d'abord**. (D'où la VM avec console.)

**2. Désactiver `PasswordAuthentication` sans clé fonctionnelle.** Tu te verrouilles dehors. **Teste la connexion par clé** (étape 4) **avant** de désactiver les mots de passe.

**3. Recharger `sshd` sans `sshd -t`.** Une faute de syntaxe dans `sshd_config` peut empêcher `sshd` de redémarrer. **Valide toujours** avec `sudo sshd -t` avant `reload`.

**4. Permissions trop ouvertes sur `~/.ssh`.** SSH **ignore** `authorized_keys`/les clés si `~/.ssh` n'est pas en `700` et les fichiers en `600` (clé privée) / lisibles. Symptôme : il redemande un mot de passe.

**5. Confondre `getent` et `dig`.** `getent hosts` suit **nsswitch** (donc `/etc/hosts` **puis** DNS) ; `dig` parle **directement** au DNS. Un nom qui résout avec `getent` mais pas `dig` (ou l'inverse) t'indique **où** est l'entrée.

**6. Oublier `sudo` avec `ss -p`.** Sans `sudo`, `ss` liste les ports mais **pas** les noms de processus. Pour l'audit « qui écoute », il faut `sudo`.

**7. `netstat` par habitude.** `netstat` est **obsolète** (paquet `net-tools` souvent absent). L'outil actuel est **`ss`** (et `ip` pour `ifconfig`/`route`).
:::

:::lang en
**1. Enabling the firewall before allowing SSH.** `ufw enable` without `allow OpenSSH` **cuts off your remote access**. Always allow SSH **first**. (Hence the VM with a console.)

**2. Disabling `PasswordAuthentication` without a working key.** You lock yourself out. **Test the key connection** (step 4) **before** disabling passwords.

**3. Reloading `sshd` without `sshd -t`.** A syntax error in `sshd_config` can stop `sshd` from restarting. **Always validate** with `sudo sshd -t` before `reload`.

**4. Too-open permissions on `~/.ssh`.** SSH **ignores** `authorized_keys`/keys if `~/.ssh` isn't `700` and the files `600` (private key) / readable. Symptom: it asks for a password again.

**5. Confusing `getent` and `dig`.** `getent hosts` follows **nsswitch** (so `/etc/hosts` **then** DNS); `dig` talks **directly** to DNS. A name that resolves with `getent` but not `dig` (or vice versa) tells you **where** the entry is.

**6. Forgetting `sudo` with `ss -p`.** Without `sudo`, `ss` lists ports but **not** process names. For the "who's listening" audit, you need `sudo`.

**7. `netstat` out of habit.** `netstat` is **deprecated** (the `net-tools` package is often absent). The current tool is **`ss`** (and `ip` for `ifconfig`/`route`).
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu lis interfaces, **IP/CIDR**, routes et **passerelle** avec `ip`.
- [ ] Tu listes les **ports à l'écoute** et leurs processus (`ss -tlnp`).
- [ ] Tu expliques la **chaîne nsswitch/hosts/DNS** et tu utilises `getent`/`dig`.
- [ ] Tu te connectes en **SSH par clé**, sans mot de passe.
- [ ] Tu **durcis** `sshd` (root, mots de passe) et tu valides avec `sshd -t`.
- [ ] Tu configures **`ufw`** en **deny par défaut**, SSH autorisé.

Six cases cochées = tu tiens **Réseau & sécurité** du LPIC-1.
:::

:::lang en
You know it works when…

- [ ] You read interfaces, **IP/CIDR**, routes and **gateway** with `ip`.
- [ ] You list **listening ports** and their processes (`ss -tlnp`).
- [ ] You explain the **nsswitch/hosts/DNS chain** and use `getent`/`dig`.
- [ ] You connect via **SSH key**, no password.
- [ ] You **harden** `sshd` (root, passwords) and validate with `sshd -t`.
- [ ] You set **`ufw`** to **default deny**, SSH allowed.

Six boxes ticked = you hold LPIC-1 **Networking & security**.
:::

## next

:::lang fr
La suite de la track Linux → LPIC-1 :

1. **Scripting shell (bash)** — variables, conditions, boucles, fonctions.
2. **Projet d'entreprise** — provisionner et durcir un serveur Linux multi-utilisateur (l'aboutissement : tout ce que tu viens d'apprendre, assemblé).
:::

:::lang en
The rest of the Linux → LPIC-1 track:

1. **Shell scripting (bash)** — variables, conditionals, loops, functions.
2. **Enterprise project** — provision and harden a multi-user Linux server (the culmination: everything you just learned, assembled).
:::

## cheatsheet

:::lang fr
Aide-mémoire réseau & sécurité.
:::

:::lang en
Networking & security cheat sheet.
:::

```bash
# Adresses & routes / addresses & routes
ip -br addr ; ip route ; ip link ; ping -c3 IP

# Ports à l'écoute / listening ports
sudo ss -tlnp        # -t tcp -l listening -n numérique -p processus

# DNS
grep '^hosts:' /etc/nsswitch.conf ; cat /etc/resolv.conf
getent hosts NOM     # suit nsswitch (hosts+dns) / follows nsswitch
dig +short NOM       # DNS direct / direct DNS      ; host NOM

# SSH par clé / SSH by key
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
ssh-copy-id user@hote   # (ou cat pub >> ~/.ssh/authorized_keys)
chmod 700 ~/.ssh ; chmod 600 ~/.ssh/authorized_keys

# Durcir sshd / harden sshd  (dans /etc/ssh/sshd_config.d/*.conf)
#   PermitRootLogin no ; PasswordAuthentication no
sudo sshd -t         # VALIDER avant reload / VALIDATE before reload
sudo systemctl reload ssh ; sudo sshd -T | grep -i option   # sudo : sshd -T lit les host keys / reads host keys

# Pare-feu / firewall  (SSH d'abord !)
sudo ufw allow OpenSSH ; sudo ufw default deny incoming ; sudo ufw enable
sudo ufw status verbose ; sudo ufw disable
```

## resources

:::lang fr
- [`man ip`](https://manpages.ubuntu.com/manpages/noble/man8/ip.8.html), [`man ss`](https://manpages.ubuntu.com/manpages/noble/man8/ss.8.html).
- [DNS resolution & nsswitch](https://manpages.ubuntu.com/manpages/noble/man5/nsswitch.conf.5.html), `man dig`, `man getent`.
- [`man sshd_config`](https://manpages.ubuntu.com/manpages/noble/man5/sshd_config.5.html) et [OpenSSH — clés](https://www.ssh.com/academy/ssh/keygen).
- [ufw — Ubuntu](https://help.ubuntu.com/community/UFW) et objectifs **LPIC-1 109.x / 110.x**.
:::

:::lang en
- [`man ip`](https://manpages.ubuntu.com/manpages/noble/man8/ip.8.html), [`man ss`](https://manpages.ubuntu.com/manpages/noble/man8/ss.8.html).
- [DNS resolution & nsswitch](https://manpages.ubuntu.com/manpages/noble/man5/nsswitch.conf.5.html), `man dig`, `man getent`.
- [`man sshd_config`](https://manpages.ubuntu.com/manpages/noble/man5/sshd_config.5.html) and [OpenSSH — keys](https://www.ssh.com/academy/ssh/keygen).
- [ufw — Ubuntu](https://help.ubuntu.com/community/UFW) and **LPIC-1 109.x / 110.x** objectives.
:::

## troubleshooting

:::lang fr
**`ssh localhost` redemande un mot de passe.** L'auth par clé échoue : permissions trop ouvertes sur `~/.ssh` (doit être `700`) ou `authorized_keys` (`600`), ou la clé publique n'y est pas. Vérifie, et regarde `journalctl -u ssh`.

**`ssh: connect to host localhost port 22: Connection refused`.** Le serveur SSH ne tourne pas : `sudo systemctl status ssh` (installe/démarre `openssh-server`).

**`sudo sshd -t` signale une erreur.** Ta surcharge `sshd_config.d/*.conf` a une faute (directive mal orthographiée, valeur invalide). Corrige **avant** tout `reload`.

**Après `ufw enable`, plus de SSH.** Tu n'as pas fait `ufw allow OpenSSH` avant. Depuis la console (VM) : `sudo ufw allow OpenSSH` (ou `sudo ufw disable`).

**`dig: command not found`.** Installe `bind9-dnsutils` (`dig`/`host`). Sur d'anciennes versions le paquet s'appelait `dnsutils`.

**`getent hosts nom` ne renvoie rien mais le site existe.** Le DNS ne résout pas (réseau/serveur DNS) : teste `dig nom`, `cat /etc/resolv.conf`, et `resolvectl status`.
:::

:::lang en
**`ssh localhost` asks for a password again.** Key auth fails: too-open permissions on `~/.ssh` (must be `700`) or `authorized_keys` (`600`), or the public key isn't there. Check, and look at `journalctl -u ssh`.

**`ssh: connect to host localhost port 22: Connection refused`.** The SSH server isn't running: `sudo systemctl status ssh` (install/start `openssh-server`).

**`sudo sshd -t` reports an error.** Your `sshd_config.d/*.conf` override has a mistake (misspelled directive, invalid value). Fix it **before** any `reload`.

**After `ufw enable`, no more SSH.** You didn't `ufw allow OpenSSH` first. From the console (VM): `sudo ufw allow OpenSSH` (or `sudo ufw disable`).

**`dig: command not found`.** Install `bind9-dnsutils` (`dig`/`host`). On older versions the package was called `dnsutils`.

**`getent hosts name` returns nothing but the site exists.** DNS isn't resolving (network/DNS server): test `dig name`, `cat /etc/resolv.conf`, and `resolvectl status`.
:::
