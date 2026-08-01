---
# — Identité (ne change JAMAIS une fois publié) —
id: linux-fondamentaux
slug: linux-fondamentaux
order: 2
status: published

# — Titres & accroches (bilingue) —
title_fr: "Linux — les fondamentaux"
title_en: "Linux — the fundamentals"
tagline_fr: "Fichiers, permissions, processus, services, réseau."
tagline_en: "Files, permissions, processes, services, networking."

# — Métadonnées pédagogiques —
level: beginner
duration_min: 150
last_review: "2026-07-31"

# — Relations de parcours (par id) —
prerequisites: [art-of-command-line]
next: [git-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [arborescence-fhs, permissions-rwx, utilisateurs-sudo, processus-signaux, services-systemd, gestion-paquets, reseau-cli]
concepts_en: [fhs-hierarchy, rwx-permissions, users-sudo, processes-signals, systemd-services, package-management, cli-networking]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Les fondamentaux Linux pour le DevOps, refaisables sur ta propre machine : arborescence, permissions, utilisateurs et sudo, processus, services systemd, paquets, réseau en ligne de commande."
og_description_en: "Linux fundamentals for DevOps, reproducible on your own machine: filesystem, permissions, users and sudo, processes, systemd services, packages, command-line networking."
---

## intro

:::lang fr
Linux est le **système d'exploitation de tout le DevOps** : tes conteneurs tournent dessus, tes serveurs en sont faits, tes pipelines s'exécutent dessus. Tu n'as pas besoin de le « connaître par cœur » — tu as besoin d'un **socle solide** que tu comprends assez pour débugger quand ça coince.

Le piège classique : empiler des commandes copiées-collées sans jamais comprendre *qui* possède un fichier, *pourquoi* une permission est refusée, ou *où* un service écrit ses logs. Résultat : le premier `Permission denied` te bloque une heure.

Ce guide construit le **modèle mental d'abord**, la pratique ensuite. Tout est **refaisable sur ta propre machine** — aucun serveur distant requis. À la fin, tu liras une sortie `ls -l`, une table de processus ou un statut `systemctl` sans hésiter.

**Pour qui c'est :** tu sais ouvrir un terminal et taper quelques commandes (guide *Ligne de commande* en prérequis), et tu veux le **socle système** qu'exigent Docker, Ansible, Kubernetes et le reste du parcours.

**Quand ce n'est PAS le bon choix :**

- Tu administres déjà Linux au quotidien (permissions, systemd, réseau) → passe directement à Docker.
- Tu cherches un cours de programmation → ce n'est pas ça : ici on **pilote un système**, on ne code pas une application.
:::

:::lang en
Linux is the **operating system of all DevOps**: your containers run on it, your servers are made of it, your pipelines execute on it. You don't need to "know it by heart" — you need a **solid foundation** you understand well enough to debug when things break.

The classic trap: stacking copy-pasted commands without ever understanding *who* owns a file, *why* a permission is denied, or *where* a service writes its logs. Result: the first `Permission denied` blocks you for an hour.

This guide builds the **mental model first**, practice second. Everything is **reproducible on your own machine** — no remote server needed. By the end, you'll read an `ls -l` output, a process table, or a `systemctl` status without hesitation.

**Who it's for:** you can open a terminal and type a few commands (the *Command line* guide is a prerequisite), and you want the **system foundation** that Docker, Ansible, Kubernetes and the rest of the track require.

**When it's NOT the right choice:**

- You already administer Linux daily (permissions, systemd, networking) → skip straight to Docker.
- You're looking for a programming course → this isn't it: here we **drive a system**, we don't write an application.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Te repérer dans l'**arborescence** Linux (le standard FHS) : où vit quoi.
- Lire et manipuler les **permissions** (`rwx`, `chmod`, `chown`) et comprendre `Permission denied`.
- Distinguer les **utilisateurs**, le compte `root` et le bon usage de `sudo` (moindre privilège).
- Observer et contrôler les **processus** : `ps`, `top`, signaux, `kill`.
- Piloter les **services** avec `systemd` (`systemctl`, `journalctl`).
- Installer et maintenir des **paquets** (`apt` / `dnf`).
- Diagnostiquer le **réseau** en ligne de commande : `ip`, `ss`, `ping`, `dig`, `curl`.
:::

:::lang en
By the end of this guide, you'll know how to:

- Navigate the Linux **filesystem** (the FHS standard): where everything lives.
- Read and manage **permissions** (`rwx`, `chmod`, `chown`) and understand `Permission denied`.
- Tell apart **users**, the `root` account, and the correct use of `sudo` (least privilege).
- Observe and control **processes**: `ps`, `top`, signals, `kill`.
- Drive **services** with `systemd` (`systemctl`, `journalctl`).
- Install and maintain **packages** (`apt` / `dnf`).
- Diagnose the **network** from the command line: `ip`, `ss`, `ping`, `dig`, `curl`.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Une **aisance de base en ligne de commande** (`cd`, `ls`, éditer un fichier) — sinon, repasse par le guide *Ligne de commande*.
- Un **environnement Linux sur ta machine**, au choix :
  - **Linux natif** (Ubuntu, Debian, Fedora…) — idéal ;
  - **Windows + WSL2** — installe Ubuntu (`wsl --install`) ;
  - **macOS** — certaines commandes (`ip`, `systemctl`, `apt`) sont propres à Linux : fais ce guide dans une **VM Ubuntu**. Avec Multipass : `brew install --cask multipass`, puis `multipass launch --name lab` et enfin `multipass shell lab` pour entrer dans la VM (c'est là que tu tapes les commandes du guide).
- Un compte utilisateur **normal** (pas root) avec les droits `sudo` — c'est le cas par défaut sur une install desktop/WSL.
- Un **éditeur en terminal** : `nano` est présent presque partout (sinon `sudo apt install -y nano`). On s'en sert pour créer des fichiers.

⚠️ **WSL2 et systemd :** l'étape sur `systemd` suppose qu'il est actif. Sur WSL, édite `/etc/wsl.conf` (`sudo nano /etc/wsl.conf`) pour qu'il contienne les **deux lignes ci-dessous**, puis lance `wsl --shutdown` dans PowerShell et rouvre ton terminal.
:::

:::lang en
You should have:

- **Basic command-line comfort** (`cd`, `ls`, editing a file) — if not, go back through the *Command line* guide.
- A **Linux environment on your machine**, one of:
  - **Native Linux** (Ubuntu, Debian, Fedora…) — ideal;
  - **Windows + WSL2** — install Ubuntu (`wsl --install`);
  - **macOS** — some commands (`ip`, `systemctl`, `apt`) are Linux-specific: do this guide in an **Ubuntu VM**. With Multipass: `brew install --cask multipass`, then `multipass launch --name lab` and finally `multipass shell lab` to enter the VM (that's where you type the guide's commands).
- A **normal user** account (not root) with `sudo` rights — the default on a desktop/WSL install.
- A **terminal editor**: `nano` is present almost everywhere (otherwise `sudo apt install -y nano`). We'll use it to create files.

⚠️ **WSL2 and systemd:** the `systemd` step assumes it's active. On WSL, edit `/etc/wsl.conf` (`sudo nano /etc/wsl.conf`) so it contains the **two lines below**, then run `wsl --shutdown` in PowerShell and reopen your terminal.
:::

```ini
# /etc/wsl.conf
[boot]
systemd=true
```

## concepts

:::lang fr
Trois idées suffisent à tenir tout le reste debout.

**1. Tout est fichier.** Sous Linux, un fichier texte, un disque, un périphérique, même une connexion réseau : presque tout se présente comme un « fichier » quelque part dans une **arborescence unique** qui commence à la racine `/`. Il n'y a pas de « lecteur C: » — juste un seul arbre. Cet arbre suit un standard, le **FHS** : `/etc` (configuration), `/var` (données variables, logs), `/home` (tes fichiers), `/usr` (programmes), `/tmp` (temporaire).

**2. Tout appartient à quelqu'un.** Chaque fichier a un **propriétaire**, un **groupe**, et des **permissions** (`rwx` : lire, écrire, exécuter) pour trois catégories : le propriétaire, le groupe, et « les autres ». `Permission denied` n'est jamais un mystère : c'est simplement que ton utilisateur n'a pas le droit demandé sur cet objet.

**3. Tout est processus.** Un programme qui tourne est un **processus**, avec un identifiant (PID), un propriétaire, et une consommation CPU/mémoire. Les **services** (bases de données, serveurs web) sont des processus au long cours, gérés par `systemd` — le chef d'orchestre qui les démarre, les surveille et centralise leurs logs.
:::

:::lang en
Three ideas hold everything else up.

**1. Everything is a file.** On Linux, a text file, a disk, a device, even a network connection: almost everything appears as a "file" somewhere in a **single tree** that starts at the root `/`. There's no "C: drive" — just one tree. That tree follows a standard, the **FHS**: `/etc` (configuration), `/var` (variable data, logs), `/home` (your files), `/usr` (programs), `/tmp` (temporary).

**2. Everything is owned by someone.** Every file has an **owner**, a **group**, and **permissions** (`rwx`: read, write, execute) for three categories: the owner, the group, and "others". `Permission denied` is never a mystery: it simply means your user lacks the requested right on that object.

**3. Everything is a process.** A running program is a **process**, with an identifier (PID), an owner, and CPU/memory usage. **Services** (databases, web servers) are long-running processes, managed by `systemd` — the conductor that starts them, watches them, and centralizes their logs.
:::

:::figure linux-filesystem
caption_fr: "Schéma 1. L'arborescence Linux (FHS) : un arbre unique depuis la racine /, chaque répertoire a un rôle."
caption_en: "Figure 1. The Linux filesystem (FHS): a single tree from root /, each directory with a role."
:::

:::lang fr
On explore chaque brique dans cet ordre : se repérer (arborescence) → lire & inspecter → permissions → utilisateurs & sudo → processus → services systemd → paquets → réseau → un petit script qui relie le tout.
:::

:::lang en
We'll explore each block in this order: get oriented (filesystem) → read & inspect → permissions → users & sudo → processes → systemd services → packages → networking → a small script tying it all together.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Te repérer dans l'arborescence et distinguer chemins absolus et relatifs.

**🤔 Pourquoi ?** Avant de manipuler, il faut savoir *où on est* et *où vit quoi*. Un chemin **absolu** part de la racine (`/etc/hosts`) : il est vrai partout. Un chemin **relatif** part de ton répertoire courant (`../projets`) : il dépend d'où tu te trouves. Confondre les deux est la première source d'erreurs.
:::

:::lang en
**Goal.** Get oriented in the filesystem and tell absolute from relative paths.

**🤔 Why?** Before touching anything, you must know *where you are* and *where things live*. An **absolute** path starts from the root (`/etc/hosts`): it's true everywhere. A **relative** path starts from your current directory (`../projects`): it depends on where you stand. Confusing the two is the first source of errors.
:::

```bash
pwd                      # où suis-je ? (chemin absolu) / where am I? (absolute path)
ls -a /                  # le contenu de la racine / the root's contents
cd /etc && ls            # config système / system config
cd ~ && pwd              # retour à ton dossier perso / back to your home directory
```

:::lang fr
**✅ Vérification :** `pwd` après `cd ~` affiche `/home/<ton-user>` (ou `/root` si tu es root, ce qui ne devrait pas être le cas). Tu as vu `bin`, `etc`, `home`, `var`, `usr`, `tmp` sous `/`.
:::

:::lang en
**✅ Check:** `pwd` after `cd ~` shows `/home/<your-user>` (or `/root` if you're root, which you shouldn't be). You saw `bin`, `etc`, `home`, `var`, `usr`, `tmp` under `/`.
:::

### step-02

:::lang fr
**Objectif.** Lire les métadonnées d'un fichier et retrouver un fichier dans l'arbre.

**🤔 Pourquoi `ls -l` ?** La forme longue révèle tout ce qui compte : type, permissions, propriétaire, groupe, taille, date. `stat` va encore plus loin. `find` est ta boussole quand tu ne sais plus *où* est un fichier.
:::

:::lang en
**Goal.** Read a file's metadata and locate a file in the tree.

**🤔 Why `ls -l`?** The long form reveals everything that matters: type, permissions, owner, group, size, date. `stat` goes even further. `find` is your compass when you no longer know *where* a file is.
:::

```bash
ls -l /etc/hostname           # une ligne détaillée / one detailed line
stat /etc/hostname            # métadonnées complètes / full metadata
file /etc/hostname            # de quel type de fichier s'agit-il ? / what kind of file is it?
find /etc -name "*.conf" -type f | head   # chercher par nom / search by name
```

:::lang fr
**✅ Vérification :** `ls -l /etc/hostname` affiche une ligne commençant par `-rw-r--r--`. Tu sais déjà lire les 4 derniers champs (proprio, groupe, taille, date) — on décode les permissions à l'étape suivante.
:::

:::lang en
**✅ Check:** `ls -l /etc/hostname` shows a line starting with `-rw-r--r--`. You can already read the last 4 fields (owner, group, size, date) — we'll decode the permissions in the next step.
:::

### step-03

:::lang fr
**Objectif.** Décoder et modifier les permissions. **C'est l'étape la plus importante du guide** — 80 % des `Permission denied` viennent d'ici.

**🤔 Comment lire `-rw-r--r--` ?** Dix caractères : le 1er est le **type** (`-` fichier, `d` dossier, `l` lien), puis **trois triplets** `rwx` pour le **propriétaire**, le **groupe**, et **les autres**. `r`=lire (4), `w`=écrire (2), `x`=exécuter (1). On additionne : `rw-`=6, `r--`=4 → `644`.

On crée un fichier, on l'observe, puis on le rend exécutable de deux façons (symbolique et octale) :
:::

:::lang en
**Goal.** Decode and change permissions. **This is the most important step of the guide** — 80 % of `Permission denied` errors come from here.

**🤔 How do you read `-rw-r--r--`?** Ten characters: the 1st is the **type** (`-` file, `d` directory, `l` link), then **three triplets** `rwx` for the **owner**, the **group**, and **others**. `r`=read (4), `w`=write (2), `x`=execute (1). You add them up: `rw-`=6, `r--`=4 → `644`.

We'll create a file, inspect it, then make it executable two ways (symbolic and octal):
:::

```bash
echo 'echo "Bonjour depuis mon script"' > demo.sh
ls -l demo.sh                 # -rw-r--r-- : pas exécutable / not executable
./demo.sh                     # → Permission denied (attendu / expected)

chmod u+x demo.sh             # symbolique : +x pour le propriétaire (user) / symbolic: +x for the owner
./demo.sh                     # → ça marche / it works

chmod 644 demo.sh             # octal : on retire le x / octal: remove the x
ls -l demo.sh                 # de retour à -rw-r--r-- / back to -rw-r--r--
```

:::lang fr
**✅ Vérification :** après `chmod u+x`, `ls -l demo.sh` montre `-rwxr--r--` et `./demo.sh` affiche ton message. Tu viens de vivre, puis résoudre, un `Permission denied`.

⚠️ **Ne fais jamais `chmod 777`.** C'est le réflexe du débutant paniqué (« je mets tous les droits, comme ça ça passe »). `777` = tout le monde peut lire, écrire **et exécuter** — un trou de sécurité béant. Donne le **droit minimum** nécessaire : `644` pour un fichier de données, `755` pour un exécutable ou un dossier.
:::

:::lang en
**✅ Check:** after `chmod u+x`, `ls -l demo.sh` shows `-rwxr--r--` and `./demo.sh` prints your message. You just lived through, then fixed, a `Permission denied`.

⚠️ **Never `chmod 777`.** It's the panicked beginner's reflex ("I grant all rights so it just works"). `777` = everyone can read, write **and execute** — a gaping security hole. Grant the **minimum right** needed: `644` for a data file, `755` for an executable or a directory.
:::

### step-04

:::lang fr
**Objectif.** Comprendre qui tu es, ce qu'est `root`, et pourquoi on passe par `sudo` plutôt que d'être root en permanence.

**🤔 Pourquoi `sudo` et pas root ?** `root` peut **tout** faire, y compris détruire le système d'une frappe. Le principe du **moindre privilège** : tu travailles en utilisateur normal, et tu n'élèves tes droits (`sudo`) que pour la commande précise qui en a besoin. Tu limites ainsi les dégâts d'une erreur ou d'un script malveillant.
:::

:::lang en
**Goal.** Understand who you are, what `root` is, and why we go through `sudo` rather than being root permanently.

**🤔 Why `sudo` and not root?** `root` can do **everything**, including destroying the system in one keystroke. The **least-privilege** principle: you work as a normal user, and only elevate (`sudo`) for the exact command that needs it. This limits the damage from a mistake or a malicious script.
:::

```bash
whoami                        # ton nom d'utilisateur / your username
id                            # ton UID, tes groupes / your UID, your groups
head -n 3 /etc/passwd         # les comptes du système / the system accounts
sudo whoami                   # → root : tu as élevé tes droits ponctuellement / you elevated rights momentarily
```

:::lang fr
**✅ Vérification :** `whoami` renvoie ton nom, `sudo whoami` renvoie `root`. Dans `id`, si tu vois `sudo` (Debian/Ubuntu) ou `wheel` (Fedora) dans tes groupes, tu as bien le droit d'élever tes privilèges.
:::

:::lang en
**✅ Check:** `whoami` returns your name, `sudo whoami` returns `root`. In `id`, if you see `sudo` (Debian/Ubuntu) or `wheel` (Fedora) among your groups, you do have the right to elevate.
:::

### step-05

:::lang fr
**Objectif.** Observer les processus et en arrêter un proprement.

**🤔 Pourquoi deux `kill` ?** Un processus est un programme vivant, identifié par son **PID**. `kill` lui envoie un **signal** : `SIGTERM` (par défaut) demande poliment de s'arrêter (le programme peut sauvegarder, fermer ses fichiers) ; `SIGKILL` (`-9`) le tue net, sans ménagement. On essaie **toujours** `SIGTERM` d'abord.

On lance un processus de fond bidon, on le retrouve, on l'arrête :
:::

:::lang en
**Goal.** Observe processes and stop one cleanly.

**🤔 Why two `kill`s?** A process is a living program, identified by its **PID**. `kill` sends it a **signal**: `SIGTERM` (default) politely asks it to stop (the program can save, close its files); `SIGKILL` (`-9`) kills it outright, no mercy. **Always** try `SIGTERM` first.

We'll start a dummy background process, find it, and stop it:
:::

```bash
sleep 600 &                   # un process qui dort 10 min, en arrière-plan / a process sleeping 10 min, in the background
ps aux | grep sleep           # le retrouver / find it
pgrep sleep                   # son PID, directement / its PID, directly
kill <PID>                    # SIGTERM : arrêt propre (remplace <PID>) / clean stop (replace <PID>)
# s'il résiste seulement : kill -9 <PID>   # SIGKILL, en dernier recours / last resort
```

:::lang fr
**✅ Vérification :** après `kill <PID>`, un nouveau `ps aux | grep sleep` ne montre plus ton `sleep` (hormis la ligne du `grep` lui-même). Essaie aussi `top` (ou `htop`) : `q` pour quitter.
:::

:::lang en
**✅ Check:** after `kill <PID>`, a fresh `ps aux | grep sleep` no longer shows your `sleep` (except the `grep` line itself). Also try `top` (or `htop`): `q` to quit.
:::

### step-06

:::lang fr
**Objectif.** Piloter un service avec `systemd` et lire ses logs.

**🤔 Pourquoi `systemd` ?** C'est le **gestionnaire de services** de la quasi-totalité des Linux modernes. Il démarre les services au boot, les redémarre s'ils tombent, et centralise leurs journaux (`journalctl`). Chaque base de données, chaque serveur web que tu déploieras est un service `systemd`.

On observe le service de **planification** `cron` (l'ordonnanceur de tâches, présent presque partout) :
:::

:::lang en
**Goal.** Drive a service with `systemd` and read its logs.

**🤔 Why `systemd`?** It's the **service manager** of nearly all modern Linux. It starts services at boot, restarts them if they crash, and centralizes their logs (`journalctl`). Every database, every web server you deploy is a `systemd` service.

We'll observe the `cron` scheduling service (present almost everywhere):
:::

```bash
systemctl status cron         # état du service (Fedora : crond) / service status (Fedora: crond)
systemctl is-enabled cron     # démarre-t-il au boot ? / does it start at boot?
sudo journalctl -u cron -n 20 --no-pager   # ses 20 dernières lignes de log / its last 20 log lines
```

:::lang fr
**✅ Vérification :** `systemctl status cron` affiche une ligne `Active: active (running)` en vert. Si l'affichage ouvre un pager, tape `q` pour en sortir. Retiens les verbes : `start`, `stop`, `restart`, `enable` (au boot), `disable`, `status`. C'est le même quatuor pour **tous** les services.

⚠️ **Sur WSL :** si `systemctl` répond « System has not been booted with systemd », c'est que systemd n'est pas activé — voir la note WSL des prérequis.
:::

:::lang en
**✅ Check:** `systemctl status cron` shows a green `Active: active (running)` line. If the output opens a pager, press `q` to exit. Remember the verbs: `start`, `stop`, `restart`, `enable` (at boot), `disable`, `status`. It's the same quartet for **every** service.

⚠️ **On WSL:** if `systemctl` replies "System has not been booted with systemd", then systemd isn't enabled — see the WSL note in the prerequisites.
:::

### step-07

:::lang fr
**Objectif.** Installer, chercher et supprimer un paquet.

**🤔 Pourquoi un gestionnaire de paquets ?** Sous Linux, on n'installe pas des logiciels en téléchargeant des `.exe` au hasard : un **gestionnaire de paquets** (`apt` sur Debian/Ubuntu, `dnf` sur Fedora) télécharge depuis des dépôts de confiance, gère les dépendances et les mises à jour de sécurité. `update` rafraîchit d'abord la **liste** des paquets disponibles ; `upgrade` applique ensuite les mises à jour.

On installe `tree`, un petit outil qui affiche l'arborescence :
:::

:::lang en
**Goal.** Install, search for, and remove a package.

**🤔 Why a package manager?** On Linux, you don't install software by downloading random `.exe` files: a **package manager** (`apt` on Debian/Ubuntu, `dnf` on Fedora) downloads from trusted repositories, handles dependencies and security updates. `update` first refreshes the **list** of available packages; `upgrade` then applies the updates.

We'll install `tree`, a small tool that prints the directory tree:
:::

```bash
sudo apt update               # rafraîchit la liste des paquets / refresh the package list
sudo apt install -y tree      # installe tree / install tree
tree -L 1 /etc                # l'utiliser : /etc sur 1 niveau / use it: /etc, 1 level deep
apt-cache search json | head  # chercher un paquet / search for a package
sudo apt remove -y tree       # le désinstaller / uninstall it
```

:::lang fr
**✅ Vérification :** `tree -L 1 /etc` a affiché une arborescence en ASCII avant la désinstallation. *(Fedora : remplace `apt update` par rien, `apt install` par `sudo dnf install`, `apt-cache search` par `dnf search`.)*
:::

:::lang en
**✅ Check:** `tree -L 1 /etc` printed an ASCII tree before uninstalling. *(Fedora: replace `apt update` with nothing, `apt install` with `sudo dnf install`, `apt-cache search` with `dnf search`.)*
:::

### step-08

:::lang fr
**Objectif.** Diagnostiquer le réseau : ton IP, les ports en écoute, la résolution DNS, une requête HTTP.

**🤔 Pourquoi ces quatre commandes ?** Ce sont les réflexes de debug réseau que tu répéteras toute ta carrière : `ip a` (quelle est mon adresse ?), `ss -tlnp` (quels services écoutent, sur quels ports ?), `dig` (à quelle IP répond ce nom de domaine ?), `curl` (que renvoie ce service ?).
:::

:::lang en
**Goal.** Diagnose the network: your IP, listening ports, DNS resolution, an HTTP request.

**🤔 Why these four commands?** They're the network-debugging reflexes you'll repeat your whole career: `ip a` (what's my address?), `ss -tlnp` (which services listen, on which ports?), `dig` (what IP does this domain name resolve to?), `curl` (what does this service return?).
:::

```bash
sudo apt install -y dnsutils curl   # dig + curl si absents / if missing (Fedora : bind-utils curl)
ip a                          # tes interfaces et adresses IP / your interfaces and IP addresses
sudo ss -tlnp                 # ports TCP en écoute + le process associé / listening TCP ports + the owning process
dig +short example.com        # résolution DNS / DNS resolution
curl -s https://example.com | head -n 5   # une requête HTTP / an HTTP request
```

:::lang fr
**✅ Vérification :** `ip a` montre au moins `lo` (127.0.0.1) et une interface avec ton IP locale (ex. `192.168.x.x`, ou `172.x` sous WSL2). `dig +short example.com` renvoie une ou plusieurs IP. `curl` affiche du HTML.
:::

:::lang en
**✅ Check:** `ip a` shows at least `lo` (127.0.0.1) and an interface with your local IP (e.g. `192.168.x.x`, or `172.x` on WSL2). `dig +short example.com` returns one or more IPs. `curl` prints HTML.
:::

### step-09

:::lang fr
**Objectif.** Relier tout le guide dans un petit script de « bilan machine ».

**🤔 Pourquoi un script ?** Automatiser, c'est le cœur du DevOps. Un script, c'est juste une suite de commandes que tu sais déjà taper, enregistrée dans un fichier exécutable. Tu réutilises **exactement** ce que tu viens d'apprendre : permissions (`chmod +x`), le shebang, et quelques commandes système.

Crée `bilan.sh` avec un éditeur — `nano bilan.sh`, colle le contenu, puis `Ctrl+O` `Entrée` pour enregistrer et `Ctrl+X` pour quitter (ne colle pas directement dans le terminal : on veut un **fichier**) :
:::

:::lang en
**Goal.** Tie the whole guide together in a small "machine report" script.

**🤔 Why a script?** Automating is the heart of DevOps. A script is just a sequence of commands you already know how to type, saved in an executable file. You reuse **exactly** what you just learned: permissions (`chmod +x`), the shebang, and a few system commands.

Create `bilan.sh` with an editor — `nano bilan.sh`, paste the content, then `Ctrl+O` `Enter` to save and `Ctrl+X` to quit (don't paste straight into the terminal: we want a **file**):
:::

```bash
#!/usr/bin/env bash
# Petit bilan de la machine / Small machine report
echo "== Utilisateur / User =="
whoami
echo "== Espace disque / Disk usage =="
df -h / | tail -n 1
echo "== Mémoire / Memory =="
free -h | grep Mem
echo "== Adresse IP =="
ip -brief address | grep -v '^lo'
```

:::lang fr
Rends-le exécutable et lance-le :
:::

:::lang en
Make it executable and run it:
:::

```bash
chmod +x bilan.sh
./bilan.sh
```

:::lang fr
**✅ Vérification :** le script affiche ton utilisateur, l'espace disque de `/`, la mémoire et ton IP. **Le `#!/usr/bin/env bash` du début (le "shebang")** dit au système quel interpréteur utiliser — sans lui, le noyau ne sait pas que c'est du bash.
:::

:::lang en
**✅ Check:** the script prints your user, the disk space of `/`, memory, and your IP. **The `#!/usr/bin/env bash` at the top (the "shebang")** tells the system which interpreter to use — without it, the kernel doesn't know it's bash.
:::

## pitfalls

:::lang fr
**1. `chmod 777` pour « régler » un Permission denied.** Tu ouvres un trou de sécurité au lieu de comprendre le problème. Lis `ls -l`, identifie *qui* doit avoir *quel* droit, et donne le minimum (`644`/`755`).

**2. Travailler en `root` en permanence (ou `sudo` devant tout).** Une faute de frappe en root peut détruire le système (`rm -rf /` n'est pas une légende). Reste utilisateur normal, élève seulement quand c'est nécessaire.

**3. `sudo rm -rf` sur un chemin mal relu.** Les suppressions sont **définitives** (pas de corbeille). Avant un `rm -rf`, relis le chemin à voix haute, et teste d'abord avec `ls` sur le même chemin.

**4. Confondre chemin absolu et relatif.** `./config` (dans le dossier courant) n'est pas `/config` (à la racine). En cas de doute : `pwd`.

**5. Oublier `apt update` avant `apt install`.** Sans rafraîchir la liste, tu installes des versions périmées ou tu tombes sur des « package not found » trompeurs.

**6. Chercher les logs au mauvais endroit.** Pour un service systemd, les logs sont dans `journalctl -u <service>`, pas dans un fichier au hasard. Pour le reste, regarde sous `/var/log`.
:::

:::lang en
**1. `chmod 777` to "fix" a Permission denied.** You open a security hole instead of understanding the problem. Read `ls -l`, identify *who* needs *which* right, and grant the minimum (`644`/`755`).

**2. Working as `root` permanently (or `sudo` in front of everything).** A typo as root can destroy the system (`rm -rf /` is not a legend). Stay a normal user, elevate only when needed.

**3. `sudo rm -rf` on a misread path.** Deletions are **permanent** (no recycle bin). Before an `rm -rf`, read the path out loud, and test first with `ls` on the same path.

**4. Confusing absolute and relative paths.** `./config` (in the current folder) isn't `/config` (at the root). When in doubt: `pwd`.

**5. Forgetting `apt update` before `apt install`.** Without refreshing the list, you install stale versions or hit misleading "package not found" errors.

**6. Looking for logs in the wrong place.** For a systemd service, logs are in `journalctl -u <service>`, not in some random file. For the rest, look under `/var/log`.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu lis une ligne `ls -l` (type, permissions, proprio) **sans réfléchir**.
- [ ] Un `Permission denied` ne te bloque plus : tu diagnostiques et corriges avec le bon droit.
- [ ] Tu expliques pourquoi on travaille en utilisateur normal + `sudo`, pas en root.
- [ ] `ps`, `kill`, `systemctl status`, `journalctl` sont des réflexes.
- [ ] Tu installes un paquet et retrouves les logs d'un service sans chercher au hasard.
- [ ] Tu trouves ton IP, les ports en écoute et tu résous un nom de domaine en CLI.

Six cases cochées = tu as le socle Linux qu'exige tout le reste du parcours (Docker, Ansible, Kubernetes). Bravo.
:::

:::lang en
You know it works when…

- [ ] You read an `ls -l` line (type, permissions, owner) **without thinking**.
- [ ] A `Permission denied` no longer blocks you: you diagnose and fix it with the right permission.
- [ ] You can explain why we work as a normal user + `sudo`, not as root.
- [ ] `ps`, `kill`, `systemctl status`, `journalctl` are reflexes.
- [ ] You install a package and find a service's logs without random searching.
- [ ] You find your IP, listening ports, and resolve a domain name from the CLI.

Six boxes ticked = you have the Linux foundation the rest of the track (Docker, Ansible, Kubernetes) demands. Well done.
:::

## next

:::lang fr
Deux prolongements naturels, dans l'ordre du parcours :

1. **Git & collaboration** — versionner ton travail et collaborer proprement : le second réflexe de tout profil technique.
2. **Docker fondamentaux** — conteneuriser des applications ; tout ce que tu viens d'apprendre (permissions, processus, réseau) y prend un sens concret.
:::

:::lang en
Two natural next steps, in path order:

1. **Git & collaboration** — version your work and collaborate cleanly: the second reflex of any technical profile.
2. **Docker fundamentals** — containerize applications; everything you just learned (permissions, processes, networking) takes on concrete meaning there.
:::

## cheatsheet

:::lang fr
Aide-mémoire des commandes clés du quotidien Linux.
:::

:::lang en
Key commands cheat sheet for day-to-day Linux.
:::

```bash
# Se repérer / Get oriented
pwd                      # où suis-je / where am I
ls -l   ls -a            # détaillé / caché / detailed / hidden
cd /chemin   cd ~   cd - # se déplacer / dossier perso / précédent / move / home / previous

# Fichiers / Files
stat f     file f        # métadonnées / type / metadata / type
find /etc -name "*.conf" # chercher / search
cp  mv  rm               # copier / déplacer / supprimer (définitif !) / copy / move / delete (permanent!)

# Permissions
chmod u+x f              # symbolique / symbolic
chmod 644 f              # octal (fichier / file)   755 = exécutable / dossier
chown user:group f       # changer le propriétaire / change owner

# Utilisateurs / Users
whoami   id              # qui suis-je / who am I
sudo <cmd>               # élever les droits ponctuellement / elevate rights momentarily

# Processus / Processes
ps aux   top   htop      # lister / temps réel / list / live
kill PID                 # SIGTERM (propre)   kill -9 PID = SIGKILL (dernier recours)

# Services (systemd)
systemctl status|start|stop|restart|enable <svc>
journalctl -u <svc> -n 50 --no-pager    # logs d'un service / a service's logs

# Paquets / Packages (Debian/Ubuntu ; Fedora = dnf)
sudo apt update && sudo apt upgrade
sudo apt install <pkg>    apt-cache search <mot>    sudo apt remove <pkg>

# Réseau / Network
ip a       ip -brief address        # adresses / addresses
sudo ss -tlnp                        # ports en écoute / listening ports
dig +short <domaine>    curl -s <url>
```

## resources

:::lang fr
- [The Linux Command Line (livre gratuit)](https://linuxcommand.org/tlcl.php) — la référence douce et complète.
- [LPIC-1 — objectifs officiels](https://www.lpi.org/our-certifications/lpic-1-overview/) — la certification que ce socle prépare.
- [ExplainShell](https://explainshell.com) — colle une commande, il décortique chaque option.
- [Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) — la carte officielle de l'arborescence.
:::

:::lang en
- [The Linux Command Line (free book)](https://linuxcommand.org/tlcl.php) — the gentle, complete reference.
- [LPIC-1 — official objectives](https://www.lpi.org/our-certifications/lpic-1-overview/) — the certification this foundation prepares.
- [ExplainShell](https://explainshell.com) — paste a command, it breaks down each option.
- [Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html) — the official map of the filesystem.
:::

## troubleshooting

:::lang fr
**« Permission denied » sur une commande.** Tu n'as pas le droit demandé. Lis `ls -l` sur la cible : si le fichier appartient à root et que tu dois vraiment y toucher, préfixe par `sudo` — mais demande-toi d'abord si c'est légitime.

**« command not found ».** Le programme n'est pas installé, ou pas dans ton `PATH`. Installe-le (`sudo apt install <paquet>`), ou vérifie l'orthographe.

**`systemctl` : « System has not been booted with systemd ».** Tu es sur WSL sans systemd. Active-le (`/etc/wsl.conf` → `[boot]` `systemd=true`, puis `wsl --shutdown`), ou fais cette étape dans une VM.

**`sudo` : « user is not in the sudoers file ».** Ton compte n'a pas les droits d'élévation. Sur une install perso c'est rare ; il faut ajouter l'utilisateur au groupe `sudo` (`usermod -aG sudo <user>`) depuis un compte qui, lui, les a.

**Un `apt install` échoue avec « Unable to locate package ».** Tu as oublié `sudo apt update`, ou le paquet n'existe pas sous ce nom : cherche avec `apt-cache search`.
:::

:::lang en
**"Permission denied" on a command.** You lack the requested right. Read `ls -l` on the target: if the file belongs to root and you genuinely must touch it, prefix with `sudo` — but first ask whether that's legitimate.

**"command not found".** The program isn't installed, or isn't in your `PATH`. Install it (`sudo apt install <package>`), or check the spelling.

**`systemctl`: "System has not been booted with systemd".** You're on WSL without systemd. Enable it (`/etc/wsl.conf` → `[boot]` `systemd=true`, then `wsl --shutdown`), or do this step in a VM.

**`sudo`: "user is not in the sudoers file".** Your account lacks elevation rights. Rare on a personal install; you'd add the user to the `sudo` group (`usermod -aG sudo <user>`) from an account that already has them.

**An `apt install` fails with "Unable to locate package".** You forgot `sudo apt update`, or the package doesn't exist under that name: search with `apt-cache search`.
:::
