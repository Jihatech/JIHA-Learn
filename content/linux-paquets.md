---
# — Identité (ne change JAMAIS une fois publié) —
id: linux-paquets
slug: linux-paquets
order: 3
status: published

# — Titres & accroches (bilingue) —
title_fr: "Linux — gestion des paquets & logiciels"
title_en: "Linux — package & software management"
tagline_fr: "apt, dpkg, dépôts, versions, dnf/rpm, sources."
tagline_en: "apt, dpkg, repos, versions, dnf/rpm, source."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 160
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [linux-fondamentaux]
next: [git-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [apt-haut-niveau, dpkg-bas-niveau, depots-sources-list, versions-hold, dnf-rpm, compilation-sources]
concepts_en: [apt-high-level, dpkg-low-level, repos-sources-list, versions-hold, dnf-rpm, source-compilation]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "La gestion des paquets Linux au niveau LPIC-1 : apt et dpkg (famille Debian) en profondeur — chercher, installer, purger, lister les fichiers d'un paquet, trouver le paquet d'un fichier, gérer les dépôts et figer une version — plus l'équivalent dnf/rpm (famille RHEL) et la compilation depuis les sources."
og_description_en: "Linux package management at LPIC-1 level: apt and dpkg (Debian family) in depth — search, install, purge, list a package's files, find a file's package, manage repositories and pin a version — plus the dnf/rpm equivalent (RHEL family) and building from source."
---

## intro

:::lang fr
Sur un serveur, **tout logiciel arrive par un paquet** : le service web, la base de données, tes outils. Savoir les **installer** est le minimum ; l'examen **LPIC-1** attend bien plus : *quel paquet possède ce fichier ? quels fichiers ce paquet a-t-il posés ? comment figer une version ? d'où viennent les paquets (dépôts) ? et comment fait-on sur un système Red Hat qui ne connaît pas `apt` ?*

Ce guide couvre la **gestion des paquets** en profondeur, telle que LPIC-1 la teste. Sur la **famille Debian** (Ubuntu/Debian), tu manipules l'outil **haut niveau `apt`** (résout les dépendances, parle aux dépôts) **et** l'outil **bas niveau `dpkg`** (agit sur un `.deb`, interroge la base locale). Tu apprends à gérer les **dépôts** et à **figer une version**. Puis on couvre la **famille RHEL** (`dnf`/`rpm`) — que l'examen exige de connaître — et la **compilation depuis les sources**.

On travaille sur **ta propre machine Ubuntu** (native, WSL2, ou VM Multipass, comme au guide fondamentaux). La partie `dnf`/`rpm` est présentée en **référence d'examen** (tu la pratiqueras sur un système Red Hat ou un conteneur Fedora quand tu auras vu Docker).

**Pour qui c'est :** tu as le guide **Linux fondamentaux** et tu vises **LPIC-1**.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas te déplacer dans l'arborescence ni lire des permissions → reviens aux fondamentaux.
- Tu veux gérer utilisateurs, disques ou systemd → ce sont les guides suivants de la track.
:::

:::lang en
On a server, **all software arrives as a package**: the web service, the database, your tools. Knowing how to **install** them is the bare minimum; the **LPIC-1** exam expects much more: *which package owns this file? which files did this package lay down? how do you pin a version? where do packages come from (repositories)? and how do you do it on a Red Hat system that doesn't know `apt`?*

This guide covers **package management** in depth, the way LPIC-1 tests it. On the **Debian family** (Ubuntu/Debian), you handle the **high-level `apt`** tool (resolves dependencies, talks to repositories) **and** the **low-level `dpkg`** tool (acts on a `.deb`, queries the local database). You learn to manage **repositories** and to **pin a version**. Then we cover the **RHEL family** (`dnf`/`rpm`) — which the exam requires — and **building from source**.

We work on **your own Ubuntu machine** (native, WSL2, or Multipass VM, as in the fundamentals guide). The `dnf`/`rpm` part is presented as **exam reference** (you'll practice it on a Red Hat system or a Fedora container once you've seen Docker).

**Who it's for:** you have the **Linux fundamentals** guide and you're aiming for **LPIC-1**.

**When it's NOT the right choice:**

- You can't navigate the filesystem or read permissions → go back to the fundamentals.
- You want to manage users, disks or systemd → those are the next guides in the track.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Distinguer l'outil **haut niveau** (`apt`) du **bas niveau** (`dpkg`) et savoir lequel utiliser.
- **Chercher**, **installer**, **supprimer** vs **purger**, et nettoyer les dépendances orphelines.
- Interroger la base locale : **quels fichiers** un paquet a posés (`dpkg -L`), **quel paquet** possède un fichier (`dpkg -S`).
- Comprendre les **dépôts** (`sources.list`, `sources.list.d`) et rafraîchir l'index.
- **Figer** une version d'un paquet (`apt-mark hold`).
- Traduire vers la **famille RHEL** : `dnf`/`rpm` (référence d'examen).
- Comprendre la **compilation depuis les sources** (`./configure && make && make install`).
:::

:::lang en
By the end of this guide, you'll know how to:

- Tell the **high-level** tool (`apt`) from the **low-level** one (`dpkg`) and know which to use.
- **Search**, **install**, **remove** vs **purge**, and clean up orphaned dependencies.
- Query the local database: **which files** a package laid down (`dpkg -L`), **which package** owns a file (`dpkg -S`).
- Understand **repositories** (`sources.list`, `sources.list.d`) and refresh the index.
- **Pin** a package version (`apt-mark hold`).
- Translate to the **RHEL family**: `dnf`/`rpm` (exam reference).
- Understand **building from source** (`./configure && make && make install`).
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Le guide **Linux fondamentaux** acquis.
- Un système **Ubuntu/Debian** avec `sudo` : natif, **WSL2**, ou une **VM Multipass** (`multipass launch --name lab` puis `multipass shell lab`).

Rafraîchis d'abord l'**index des paquets** (la liste de ce qui est disponible dans les dépôts) :
:::

:::lang en
You should have:

- The **Linux fundamentals** guide under your belt.
- An **Ubuntu/Debian** system with `sudo`: native, **WSL2**, or a **Multipass VM** (`multipass launch --name lab` then `multipass shell lab`).

First refresh the **package index** (the list of what's available in the repositories):
:::

```bash
sudo apt update            # met à jour l'index, PAS les paquets / updates the index, NOT the packages
```

:::lang fr
*(La famille RHEL — `dnf`/`rpm` — est en **référence** dans ce guide ; tu n'as pas besoin d'un système Red Hat pour le suivre.)*
:::

:::lang en
*(The RHEL family — `dnf`/`rpm` — is **reference** in this guide; you don't need a Red Hat system to follow it.)*
:::

## concepts

:::lang fr
Un **paquet** est une archive qui contient un logiciel **plus** ses métadonnées : sa version, ses **dépendances** (les autres paquets qu'il lui faut), et la liste des fichiers qu'il installe. Deux grandes familles se partagent le monde Linux :

- **Debian** (Debian, Ubuntu, Mint…) : paquets **`.deb`**, gérés par `apt`/`dpkg`.
- **RHEL** (RHEL, Fedora, Rocky, CentOS…) : paquets **`.rpm`**, gérés par `dnf`/`rpm`.

Dans chaque famille, **deux niveaux d'outils** :

- **Haut niveau** (`apt`, `dnf`) : il parle aux **dépôts** (des serveurs qui hébergent les paquets), **télécharge** ce qu'il faut et **résout les dépendances** automatiquement. C'est l'outil du quotidien.
- **Bas niveau** (`dpkg`, `rpm`) : il agit sur **un fichier de paquet** déjà présent et interroge la **base locale** (ce qui est installé). Il **ne résout pas** les dépendances et **ne va pas** sur le réseau. C'est l'outil de diagnostic et d'installation manuelle.

**Les dépôts** sont déclarés dans `/etc/apt/sources.list` et le dossier `/etc/apt/sources.list.d/` (Ubuntu 24.04+ y place `ubuntu.sources` au format **deb822**). `apt update` **télécharge l'index** de ces dépôts (quoi et quelle version est disponible) — il ne touche à **aucun** paquet installé. `apt upgrade` applique ensuite les mises à jour. Ne confonds jamais les deux.

**Supprimer vs purger.** `apt remove` retire le logiciel **mais garde ses fichiers de configuration** ; `apt purge` retire **tout, config comprise**. Distinction classique de l'examen.

**Figer une version.** Parfois tu ne veux **pas** qu'un paquet soit mis à jour (compatibilité). `apt-mark hold` le **gèle** : les `upgrade` le sautent, jusqu'au `unhold`.

**La compilation depuis les sources** (hors gestionnaire) : quand un logiciel n'est dans aucun dépôt, on récupère son **code source** (un `.tar.gz`), et on fait `./configure` (vérifie l'environnement) → `make` (compile) → `sudo make install` (installe). Le gestionnaire de paquets **ne connaît pas** ce logiciel — à toi de le suivre.
:::

:::lang en
A **package** is an archive containing software **plus** its metadata: its version, its **dependencies** (the other packages it needs), and the list of files it installs. Two big families share the Linux world:

- **Debian** (Debian, Ubuntu, Mint…): **`.deb`** packages, managed by `apt`/`dpkg`.
- **RHEL** (RHEL, Fedora, Rocky, CentOS…): **`.rpm`** packages, managed by `dnf`/`rpm`.

In each family, **two tool levels**:

- **High-level** (`apt`, `dnf`): it talks to **repositories** (servers hosting packages), **downloads** what's needed and **resolves dependencies** automatically. The everyday tool.
- **Low-level** (`dpkg`, `rpm`): it acts on **one package file** already present and queries the **local database** (what's installed). It **doesn't resolve** dependencies and **doesn't go** to the network. The diagnostics and manual-install tool.

**Repositories** are declared in `/etc/apt/sources.list` and the `/etc/apt/sources.list.d/` folder. `apt update` **downloads the index** of those repos (what and which version is available) — it touches **no** installed package. `apt upgrade` then applies updates. Never confuse the two.

**Remove vs purge.** `apt remove` removes the software **but keeps its configuration files**; `apt purge` removes **everything, config included**. A classic exam distinction.

**Pinning a version.** Sometimes you **don't** want a package upgraded (compatibility). `apt-mark hold` **freezes** it: `upgrade`s skip it, until `unhold`.

**Building from source** (outside the manager): when software isn't in any repo, you fetch its **source code** (a `.tar.gz`), and do `./configure` (checks the environment) → `make` (compiles) → `sudo make install` (installs). The package manager **doesn't know** this software — it's on you to maintain it.
:::

:::figure linux-package-levels
caption_fr: "Schéma 1. apt (haut niveau) parle aux dépôts et résout les dépendances ; dpkg (bas niveau) agit sur un .deb et la base locale. Idem dnf/rpm côté RHEL."
caption_en: "Figure 1. apt (high level) talks to repos and resolves dependencies; dpkg (low level) acts on a .deb and the local database. Same for dnf/rpm on RHEL."
:::

:::lang fr
On avance : apt (chercher/installer/purger) → dpkg (fichiers & appartenance) → dépôts → figer une version → dnf/rpm (référence) → sources.
:::

:::lang en
We'll go: apt (search/install/purge) → dpkg (files & ownership) → repositories → pin a version → dnf/rpm (reference) → source.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Utiliser **`apt`** : chercher, afficher, installer.

**🤔 `apt` vs `apt-get`.** `apt` est l'interface moderne (barre de progression, sortie lisible) ; `apt-get`/`apt-cache` sont les commandes historiques, stables pour les scripts. Pour l'humain : `apt`. Installe un petit utilitaire de démo, `tree` :
:::

:::lang en
**Goal.** Use **`apt`**: search, show, install.

**🤔 `apt` vs `apt-get`.** `apt` is the modern interface (progress bar, readable output); `apt-get`/`apt-cache` are the historical commands, stable for scripts. For a human: `apt`. Install a small demo utility, `tree`:
:::

```bash
apt search '^tree$'          # cherche le paquet dans l'index / search the index
apt show tree                # version, dépendances, description / version, deps, description
sudo apt install -y tree
tree --version               # confirme l'installation / confirm install
```

:::lang fr
**✅ Vérification :** `apt show tree` affiche la fiche du paquet (version, taille, dépendances) **avant** installation, puis `sudo apt install` le pose et `tree --version` répond. `apt` a résolu et téléchargé ce qu'il fallait depuis les dépôts, sans que tu gères une seule dépendance à la main. Retiens : **`search`** trouve, **`show`** décrit, **`install`** pose.
:::

:::lang en
**✅ Check:** `apt show tree` prints the package sheet (version, size, dependencies) **before** installing, then `sudo apt install` lays it down and `tree --version` answers. `apt` resolved and downloaded what was needed from the repos, without you handling a single dependency by hand. Remember: **`search`** finds, **`show`** describes, **`install`** installs.
:::

### step-02

:::lang fr
**Objectif.** Distinguer **`remove`**, **`purge`** et **`autoremove`**.

**🤔 La config survit à `remove`.** On prend un paquet qui pose un **fichier de configuration** dans `/etc` — l'éditeur `nano` (il installe `/etc/nanorc`). Retire-le de deux façons et observe la différence. *(Un paquet **sans** conffile, comme `cowsay`, ne laisse **aucune** trace `rc` — d'où le choix de `nano`.)*
:::

:::lang en
**Goal.** Distinguish **`remove`**, **`purge`** and **`autoremove`**.

**🤔 Config survives `remove`.** We take a package that lays down a **configuration file** under `/etc` — the `nano` editor (it installs `/etc/nanorc`). Remove it two ways and observe the difference. *(A package **without** a conffile, like `cowsay`, leaves **no** `rc` trace — hence the choice of `nano`.)*
:::

```bash
sudo apt install -y nano
sudo apt remove -y nano                # retire le binaire, GARDE /etc/nanorc / removes the binary, KEEPS /etc/nanorc
dpkg -l nano | tail -1                 # état "rc" = removed, config restante / "rc" = removed, config left
ls -l /etc/nanorc                      # la config est TOUJOURS là / the config is STILL there
sudo apt purge -y nano                 # retire TOUT, /etc/nanorc compris / removes EVERYTHING, /etc/nanorc too
sudo apt install -y nano               # on le remet (éditeur utile !) / reinstall it (useful editor!)
sudo apt autoremove -y                 # nettoie les dépendances devenues orphelines / clean orphaned deps
```

:::lang fr
**✅ Vérification :** après `remove`, `dpkg -l nano` montre l'état **`rc`** (`r`emoved, config `c` restante) et `ls -l /etc/nanorc` **existe encore** — le logiciel est parti mais **sa config est là**. Après `purge`, le paquet disparaît **totalement** (et `/etc/nanorc` avec lui). `autoremove` supprime les dépendances installées automatiquement qui ne servent plus à personne. C'est la trilogie de nettoyage attendue à l'examen : **remove** (garde la config), **purge** (tout), **autoremove** (les orphelins).
:::

:::lang en
**✅ Check:** after `remove`, `dpkg -l nano` shows state **`rc`** (`r`emoved, config `c` left) and `ls -l /etc/nanorc` **still exists** — the software is gone but **its config remains**. After `purge`, the package disappears **entirely** (and `/etc/nanorc` with it). `autoremove` deletes automatically-installed dependencies no one needs anymore. That's the cleanup trilogy the exam expects: **remove** (keeps config), **purge** (everything), **autoremove** (orphans).
:::

### step-03

:::lang fr
**Objectif.** Interroger la base locale avec **`dpkg`** : lister les fichiers d'un paquet, et trouver le paquet d'un fichier.

**🤔 Le bas niveau répond « qui » et « quoi ».** `apt` installe ; `dpkg` **enquête**. Deux questions d'examen quasi garanties :
:::

:::lang en
**Goal.** Query the local database with **`dpkg`**: list a package's files, and find a file's package.

**🤔 The low level answers "who" and "what".** `apt` installs; `dpkg` **investigates**. Two nearly guaranteed exam questions:
:::

```bash
dpkg -L tree                 # QUELS fichiers le paquet tree a-t-il posés ? / WHICH files did tree install?
dpkg -S /usr/bin/tree        # QUEL paquet possède ce fichier ? / WHICH package owns this file?
dpkg -l | grep tree          # est-il installé, et en quelle version ? / installed, and what version?
```

:::lang fr
**✅ Vérification :** `dpkg -L tree` liste tous les fichiers posés par le paquet (dont `/usr/bin/tree` et sa page de manuel), et `dpkg -S /usr/bin/tree` répond `tree: /usr/bin/tree` — il **remonte** du fichier au paquet. Ces deux commandes sont l'inverse l'une de l'autre : **`-L`** (paquet → fichiers), **`-S`** (fichier → paquet). Indispensables pour diagnostiquer « d'où vient ce binaire ? ».
:::

:::lang en
**✅ Check:** `dpkg -L tree` lists all files the package laid down (including `/usr/bin/tree` and its man page), and `dpkg -S /usr/bin/tree` answers `tree: /usr/bin/tree` — it **traces back** from file to package. The two commands are inverses: **`-L`** (package → files), **`-S`** (file → package). Essential to diagnose "where did this binary come from?".
:::

### step-04

:::lang fr
**Objectif.** Comprendre les **dépôts** et **figer** une version.

**🤔 D'où viennent les paquets.** Les dépôts sont déclarés dans `/etc/apt/sources.list` **et/ou** `/etc/apt/sources.list.d/`. **Attention au format** : Ubuntu **24.04+** utilise le format **deb822** (fichier `ubuntu.sources`, champs `Types:/URIs:/Suites:`), tandis que les versions plus anciennes (et Debian) utilisent des lignes `deb …` dans `sources.list`. Regarde selon ton cas, puis fige un paquet :
:::

:::lang en
**Goal.** Understand **repositories** and **pin** a version.

**🤔 Where packages come from.** Repositories are declared in `/etc/apt/sources.list` **and/or** `/etc/apt/sources.list.d/`. **Mind the format**: Ubuntu **24.04+** uses the **deb822** format (`ubuntu.sources` file, `Types:/URIs:/Suites:` fields), while older releases (and Debian) use `deb …` lines in `sources.list`. Look at whichever applies to you, then pin a package:
:::

```bash
apt policy                         # vue des dépôts & priorités — marche PARTOUT / repos & priorities — works EVERYWHERE
ls /etc/apt/sources.list.d/        # dépôts additionnels (PPA, éditeurs) / extra repos

# Ubuntu 24.04+ (deb822) :
grep -E '^(Types|URIs|Suites):' /etc/apt/sources.list.d/ubuntu.sources 2>/dev/null
# Anciennes Ubuntu / Debian (lignes deb) :
grep -vE '^\s*#|^\s*$' /etc/apt/sources.list 2>/dev/null

sudo apt-mark hold tree            # GÈLE tree : les upgrade le sauteront / FREEZE tree: upgrades skip it
apt-mark showhold                  # liste les paquets gelés / list held packages
sudo apt-mark unhold tree          # dégèle / unfreeze
```

:::lang fr
**✅ Vérification :** `apt policy` liste tes dépôts (URL + priorités) sur **toutes** les versions ; selon ta distro, l'un des deux `grep` affiche tes dépôts (deb822 `Types:/URIs:/Suites:` sur 24.04, ou lignes `deb …` sur les versions plus anciennes). Après `apt-mark hold tree`, `apt-mark showhold` liste **`tree`** — il est **figé** : un `sudo apt upgrade` ne le mettrait plus à jour, même si une nouvelle version existe. `unhold` le libère. C'est le mécanisme pour **verrouiller une version** critique (base de données, noyau) en production.
:::

:::lang en
**✅ Check:** `apt policy` lists your repos (URL + priorities) on **all** versions; depending on your distro, one of the two `grep`s shows your repos (deb822 `Types:/URIs:/Suites:` on 24.04, or `deb …` lines on older releases). After `apt-mark hold tree`, `apt-mark showhold` lists **`tree`** — it's **frozen**: a `sudo apt upgrade` would no longer update it, even if a new version exists. `unhold` releases it. That's the mechanism to **lock a critical version** (database, kernel) in production.
:::

### step-05

:::lang fr
**Objectif.** Traduire vers la **famille RHEL** (`dnf`/`rpm`) — la référence d'examen.

**🤔 Même logique, autres commandes.** LPIC-1 exige de connaître **les deux** familles. La structure est identique (haut niveau `dnf` qui résout, bas niveau `rpm` qui enquête) ; seuls les mots changent. Ce tableau est à **mémoriser** :
:::

:::lang en
**Goal.** Translate to the **RHEL family** (`dnf`/`rpm`) — the exam reference.

**🤔 Same logic, other commands.** LPIC-1 requires knowing **both** families. The structure is identical (high-level `dnf` that resolves, low-level `rpm` that investigates); only the words change. This table is to be **memorized**:
:::

```bash
# Debian (apt/dpkg)              # RHEL (dnf/rpm)                  # rôle / role
apt update                       # (dnf vérifie à chaque appel)    # rafraîchir l'index / refresh index
apt search motif                 dnf search motif                 # chercher / search
apt show paquet                  dnf info paquet                  # décrire / describe
sudo apt install paquet          sudo dnf install paquet          # installer / install
sudo apt remove paquet           sudo dnf remove paquet           # supprimer / remove
sudo apt upgrade                 sudo dnf upgrade                 # mettre à jour / upgrade
dpkg -l                          rpm -qa                          # tout ce qui est installé / all installed
dpkg -L paquet                   rpm -ql paquet                   # fichiers du paquet / package's files
dpkg -S /chemin/fichier          rpm -qf /chemin/fichier          # paquet d'un fichier / file's package
sudo dpkg -i fichier.deb         sudo rpm -i fichier.rpm          # installer un fichier local / install a local file
```

:::lang fr
**✅ Vérification :** tu sais **traduire** chaque opération d'une famille à l'autre : `apt install`↔`dnf install`, `dpkg -L`↔`rpm -ql`, `dpkg -S`↔`rpm -qf`, `dpkg -l`↔`rpm -qa`. Tu retiens la symétrie **haut niveau réseau/dépendances** (`apt`/`dnf`) vs **bas niveau fichier/base locale** (`dpkg`/`rpm`). *(Pour pratiquer `dnf` en vrai : un système Fedora/Rocky, ou un conteneur `fedora` une fois le guide Docker fait.)*
:::

:::lang en
**✅ Check:** you can **translate** each operation between families: `apt install`↔`dnf install`, `dpkg -L`↔`rpm -ql`, `dpkg -S`↔`rpm -qf`, `dpkg -l`↔`rpm -qa`. You hold the symmetry **high-level network/dependencies** (`apt`/`dnf`) vs **low-level file/local-database** (`dpkg`/`rpm`). *(To practice `dnf` for real: a Fedora/Rocky system, or a `fedora` container once you've done the Docker guide.)*
:::

### step-06

:::lang fr
**Objectif.** Comprendre la **compilation depuis les sources** — la voie hors gestionnaire.

**🤔 Quand aucun paquet n'existe.** Certains logiciels ne sont dans **aucun** dépôt : il faut compiler leur **code source**. Le trio universel : `./configure` → `make` → `make install`. Installe d'abord les **outils de compilation**, puis observe le motif (sans forcément aller au bout) :
:::

:::lang en
**Goal.** Understand **building from source** — the outside-the-manager path.

**🤔 When no package exists.** Some software is in **no** repository: you must compile its **source code**. The universal trio: `./configure` → `make` → `make install`. First install the **build tools**, then observe the pattern (without necessarily finishing):
:::

```bash
sudo apt install -y build-essential   # gcc, make, en-têtes… / gcc, make, headers…

# Le motif universel (sur un tarball source décompressé) :
# The universal pattern (on an unpacked source tarball):
#   tar xzf logiciel-1.2.3.tar.gz && cd logiciel-1.2.3
#   ./configure          # vérifie l'environnement, génère le Makefile / checks env, generates the Makefile
#   make                 # compile le code source / compiles the source
#   sudo make install    # copie les binaires (souvent dans /usr/local) / copies binaries (often /usr/local)
```

:::lang fr
**✅ Vérification :** `build-essential` installé, tu sais réciter et expliquer le trio **`./configure` → `make` → `sudo make install`** : `configure` vérifie les dépendances et prépare le `Makefile`, `make` compile, `make install` copie (typiquement sous `/usr/local`, hors du contrôle d'`apt`). Point crucial d'examen : un logiciel **compilé à la main n'est pas suivi** par le gestionnaire de paquets (pas de mise à jour, pas de désinstallation propre) — c'est le dernier recours, pas la norme.
:::

:::lang en
**✅ Check:** with `build-essential` installed, you can recite and explain the trio **`./configure` → `make` → `sudo make install`**: `configure` checks dependencies and prepares the `Makefile`, `make` compiles, `make install` copies (typically under `/usr/local`, outside `apt`'s control). Key exam point: hand-compiled software **is not tracked** by the package manager (no updates, no clean uninstall) — it's the last resort, not the norm.
:::

## pitfalls

:::lang fr
**1. Confondre `apt update` et `apt upgrade`.** `update` rafraîchit l'**index** (rien d'installé ne change) ; `upgrade` applique les **mises à jour**. Toujours `update` **avant** `install`/`upgrade` pour partir d'un index frais.

**2. `remove` en croyant tout enlever.** `remove` **garde la config** (état `rc`). Pour un nettoyage total → `purge`.

**3. Oublier `autoremove`.** Les dépendances tirées automatiquement restent après suppression du paquet principal → système encombré. `apt autoremove` de temps en temps.

**4. Utiliser `dpkg -i` pour un paquet à dépendances.** `dpkg` **ne résout pas** les dépendances : `dpkg -i` échoue si elles manquent. Répare avec `sudo apt -f install`, ou utilise `apt install ./fichier.deb` (qui, lui, résout).

**5. Croire que `dpkg`/`rpm` vont sur le réseau.** Non : ils agissent en **local** (fichier + base installée). Pour télécharger et résoudre → `apt`/`dnf`.

**6. Oublier `sudo`.** Installer/supprimer modifie le système → `sudo` requis. `search`/`show`/`dpkg -L` sont en lecture seule (pas de `sudo`).

**7. Compiler par défaut.** `make install` pose des fichiers **hors** du gestionnaire : ni mises à jour, ni désinstallation propre. Cherche **toujours** un paquet d'abord ; compile en dernier recours.
:::

:::lang en
**1. Confusing `apt update` and `apt upgrade`.** `update` refreshes the **index** (nothing installed changes); `upgrade` applies **updates**. Always `update` **before** `install`/`upgrade` to start from a fresh index.

**2. `remove` thinking it removes everything.** `remove` **keeps config** (state `rc`). For a full cleanup → `purge`.

**3. Forgetting `autoremove`.** Auto-pulled dependencies remain after removing the main package → cluttered system. `apt autoremove` now and then.

**4. Using `dpkg -i` for a package with dependencies.** `dpkg` **doesn't resolve** dependencies: `dpkg -i` fails if they're missing. Fix with `sudo apt -f install`, or use `apt install ./file.deb` (which does resolve).

**5. Believing `dpkg`/`rpm` go to the network.** No: they act **locally** (file + installed database). To download and resolve → `apt`/`dnf`.

**6. Forgetting `sudo`.** Installing/removing modifies the system → `sudo` required. `search`/`show`/`dpkg -L` are read-only (no `sudo`).

**7. Compiling by default.** `make install` lays files **outside** the manager: no updates, no clean uninstall. **Always** look for a package first; compile as a last resort.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu choisis **`apt`** (réseau/dépendances) ou **`dpkg`** (fichier/base locale) à bon escient.
- [ ] Tu distingues **`remove`**, **`purge`** et **`autoremove`**.
- [ ] Tu réponds « quels fichiers ? » (**`dpkg -L`**) et « quel paquet ? » (**`dpkg -S`**).
- [ ] Tu lis un `sources.list` et tu **figes** une version (`apt-mark hold`).
- [ ] Tu **traduis** chaque commande vers `dnf`/`rpm`.
- [ ] Tu expliques `./configure && make && make install` et ses limites.

Six cases cochées = tu tiens la **gestion des paquets** du programme LPIC-1.
:::

:::lang en
You know it works when…

- [ ] You pick **`apt`** (network/dependencies) or **`dpkg`** (file/local database) appropriately.
- [ ] You distinguish **`remove`**, **`purge`** and **`autoremove`**.
- [ ] You answer "which files?" (**`dpkg -L`**) and "which package?" (**`dpkg -S`**).
- [ ] You read a `sources.list` and **pin** a version (`apt-mark hold`).
- [ ] You **translate** each command to `dnf`/`rpm`.
- [ ] You explain `./configure && make && make install` and its limits.

Six boxes ticked = you hold LPIC-1 **package management**.
:::

## next

:::lang fr
La suite de la track Linux → LPIC-1 :

1. **Utilisateurs, groupes & permissions avancées** — `/etc/passwd`/`shadow`, `sudo`, SUID/SGID/sticky, ACL.
2. **Systèmes de fichiers, disques & FHS** — partitions, `mkfs`, `fstab`, LVM, liens.
3. **Boot, systemd & processus** — démarrage, units/targets, `journalctl`, cron/timers.
4. **Réseau & sécurité système** — `ip`/`ss`, DNS, SSH, pare-feu, durcissement.
5. **Scripting shell (bash)** — variables, conditions, boucles, fonctions.
6. **Projet d'entreprise** — provisionner et durcir un serveur Linux multi-utilisateur.
:::

:::lang en
The rest of the Linux → LPIC-1 track:

1. **Users, groups & advanced permissions** — `/etc/passwd`/`shadow`, `sudo`, SUID/SGID/sticky, ACLs.
2. **Filesystems, disks & FHS** — partitions, `mkfs`, `fstab`, LVM, links.
3. **Boot, systemd & processes** — startup, units/targets, `journalctl`, cron/timers.
4. **Networking & system security** — `ip`/`ss`, DNS, SSH, firewall, hardening.
5. **Shell scripting (bash)** — variables, conditionals, loops, functions.
6. **Enterprise project** — provision and harden a multi-user Linux server.
:::

## cheatsheet

:::lang fr
Aide-mémoire gestion des paquets.
:::

:::lang en
Package management cheat sheet.
:::

```bash
# Debian/Ubuntu — haut niveau (apt) / high level
sudo apt update                 # rafraîchit l'index / refresh index
apt search motif ; apt show paquet
sudo apt install paquet ; sudo apt remove paquet ; sudo apt purge paquet
sudo apt upgrade ; sudo apt autoremove
sudo apt-mark hold paquet       # figer / pin  (showhold, unhold)

# Debian/Ubuntu — bas niveau (dpkg) / low level (local)
dpkg -l [motif]                 # installés / installed
dpkg -L paquet                  # fichiers du paquet / package's files
dpkg -S /chemin                 # paquet d'un fichier / file's package
sudo dpkg -i fichier.deb        # (puis sudo apt -f install si dépendances)

# RHEL/Fedora (référence) / reference
dnf search|info|install|remove|upgrade ;  rpm -qa|-ql|-qf|-i

# Depuis les sources / from source
./configure && make && sudo make install     # dernier recours / last resort

# Dépôts / repos
apt policy                                    # marche partout / works everywhere
/etc/apt/sources.list.d/ubuntu.sources        # Ubuntu 24.04+ (deb822)
/etc/apt/sources.list                         # anciennes Ubuntu / Debian (lignes deb)
```

## resources

:::lang fr
- [Ubuntu — gestion des paquets](https://help.ubuntu.com/community/AptGet/Howto) et [Debian `dpkg`](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html).
- [Pages de manuel](https://manpages.ubuntu.com/) : `man apt`, `man dpkg`, `man apt-mark`.
- [Fedora — DNF](https://docs.fedoraproject.org/en-US/quick-docs/dnf/) et [RPM](https://rpm.org/documentation.html).
- Objectifs **LPIC-1 102.3 à 102.6** (gestion des paquets Debian & RPM).
:::

:::lang en
- [Ubuntu — package management](https://help.ubuntu.com/community/AptGet/Howto) and [Debian `dpkg`](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html).
- [Man pages](https://manpages.ubuntu.com/): `man apt`, `man dpkg`, `man apt-mark`.
- [Fedora — DNF](https://docs.fedoraproject.org/en-US/quick-docs/dnf/) and [RPM](https://rpm.org/documentation.html).
- **LPIC-1 102.3 to 102.6** objectives (Debian & RPM package management).
:::

## troubleshooting

:::lang fr
**`E: Unable to locate package …`.** L'index est vieux ou le dépôt manque. Fais `sudo apt update`, vérifie l'orthographe (`apt search`), et que le bon dépôt (universe/…) est activé.

**`dpkg: dependency problems` après `dpkg -i`.** `dpkg` ne résout pas les dépendances. Répare : `sudo apt -f install` (installe les manquantes), ou réinstalle via `sudo apt install ./fichier.deb`.

**`Could not get lock /var/lib/dpkg/lock-frontend`.** Un autre `apt`/`dpkg` tourne (ou une MAJ automatique). Attends qu'il finisse, ou identifie le process (`ps aux | grep -E 'apt|dpkg'`).

**`apt upgrade` ne met pas à jour un paquet précis.** Il est peut-être **gelé** : `apt-mark showhold`. Dégèle avec `sudo apt-mark unhold <paquet>`.

**Un binaire existe mais `dpkg -S` ne trouve aucun paquet.** Il a probablement été **compilé depuis les sources** (ou copié à la main) : il est hors du gestionnaire, donc invisible pour `dpkg`.

**`sudo apt update` renvoie des erreurs `NO_PUBKEY` / dépôt non signé.** La clé GPG du dépôt manque. Ajoute la clé du dépôt (méthode moderne : un fichier dans `/etc/apt/keyrings/` référencé par `signed-by=` dans la ligne du dépôt).
:::

:::lang en
**`E: Unable to locate package …`.** The index is stale or the repo is missing. Run `sudo apt update`, check spelling (`apt search`), and that the right repo (universe/…) is enabled.

**`dpkg: dependency problems` after `dpkg -i`.** `dpkg` doesn't resolve dependencies. Fix: `sudo apt -f install` (installs the missing ones), or reinstall via `sudo apt install ./file.deb`.

**`Could not get lock /var/lib/dpkg/lock-frontend`.** Another `apt`/`dpkg` is running (or an automatic update). Wait for it to finish, or find the process (`ps aux | grep -E 'apt|dpkg'`).

**`apt upgrade` won't update a specific package.** It may be **frozen**: `apt-mark showhold`. Unfreeze with `sudo apt-mark unhold <package>`.

**A binary exists but `dpkg -S` finds no package.** It was probably **built from source** (or copied by hand): it's outside the manager, so invisible to `dpkg`.

**`sudo apt update` returns `NO_PUBKEY` / unsigned repo errors.** The repo's GPG key is missing. Add the repo's key (modern method: a file in `/etc/apt/keyrings/` referenced by `signed-by=` in the repo line).
:::
