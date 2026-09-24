---
# — Identité (ne change JAMAIS une fois publié) —
id: linux-utilisateurs-permissions
slug: linux-utilisateurs-permissions
order: 4
status: published

# — Titres & accroches (bilingue) —
title_fr: "Linux — utilisateurs, groupes & permissions"
title_en: "Linux — users, groups & permissions"
tagline_fr: "passwd/shadow, groupes, SUID/SGID/sticky, ACL, sudo."
tagline_en: "passwd/shadow, groups, SUID/SGID/sticky, ACL, sudo."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 175
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [linux-paquets]
next: [git-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [bases-comptes, gestion-utilisateurs, groupes-primaire-secondaire, permissions-octal-symbolique, suid-sgid-sticky, acl, sudoers]
concepts_en: [account-databases, user-management, primary-secondary-groups, octal-symbolic-permissions, suid-sgid-sticky, acl, sudoers]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Utilisateurs et permissions Linux au niveau LPIC-1 : les bases de comptes (passwd/shadow/group), la gestion des utilisateurs et des groupes (primaire vs secondaire), les permissions en octal et symbolique, umask, les permissions spéciales SUID/SGID/sticky, les ACL, et sudo/sudoers."
og_description_en: "Linux users and permissions at LPIC-1 level: the account databases (passwd/shadow/group), user and group management (primary vs secondary), octal and symbolic permissions, umask, the special SUID/SGID/sticky permissions, ACLs, and sudo/sudoers."
---

## intro

:::lang fr
Sur un serveur multi-utilisateur, **la sécurité commence par les permissions** : qui est qui, qui appartient à quel groupe, qui peut lire, écrire, exécuter quoi. Le guide fondamentaux t'a montré `rwx` et `sudo` ; l'examen **LPIC-1** creuse bien plus loin : *où sont stockés les comptes ? comment ajouter un utilisateur à un groupe sans casser les autres ? c'est quoi un bit SUID et pourquoi `passwd` en a un ? comment donner un droit à un seul utilisateur précis sur un fichier (ACL) ? comment autoriser une commande `sudo` sans donner tous les pouvoirs ?*

Ce guide couvre le domaine **Utilisateurs, groupes & permissions** en profondeur : les **bases de comptes** (`/etc/passwd`, `shadow`, `group`), la **gestion** des utilisateurs et des groupes (**primaire** vs **secondaire**), les permissions en **octal** et **symbolique** + `umask`, les **permissions spéciales** (**SUID**, **SGID**, **sticky**), les **ACL** (droits fins), et **`sudo`/`sudoers`**.

On travaille sur **ta machine Ubuntu** (native, WSL2, ou VM Multipass) avec `sudo`. On crée de vrais utilisateurs de test — **jetables**, qu'on supprime à la fin.

**Pour qui c'est :** tu as les guides **fondamentaux** et **paquets**, et tu vises **LPIC-1**.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas lire un `rwxr-xr-x` → revois les permissions dans le guide fondamentaux.
- Tu veux les disques, systemd ou le réseau → ce sont les guides suivants.
:::

:::lang en
On a multi-user server, **security starts with permissions**: who is who, who belongs to which group, who can read, write, execute what. The fundamentals guide showed you `rwx` and `sudo`; the **LPIC-1** exam digs much deeper: *where are accounts stored? how do you add a user to a group without breaking the others? what's a SUID bit and why does `passwd` have one? how do you grant a right to one specific user on a file (ACL)? how do you allow one `sudo` command without handing over all power?*

This guide covers the **Users, groups & permissions** domain in depth: the **account databases** (`/etc/passwd`, `shadow`, `group`), **management** of users and groups (**primary** vs **secondary**), permissions in **octal** and **symbolic** + `umask`, the **special permissions** (**SUID**, **SGID**, **sticky**), **ACLs** (fine-grained rights), and **`sudo`/`sudoers`**.

We work on **your Ubuntu machine** (native, WSL2, or Multipass VM) with `sudo`. We create real test users — **throwaway**, deleted at the end.

**Who it's for:** you have the **fundamentals** and **packages** guides, and you're aiming for **LPIC-1**.

**When it's NOT the right choice:**

- You can't read a `rwxr-xr-x` → review permissions in the fundamentals guide.
- You want disks, systemd or networking → those are the next guides.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Lire les **bases de comptes** : `/etc/passwd`, `/etc/shadow`, `/etc/group`.
- **Créer/modifier/supprimer** des utilisateurs (`useradd`, `usermod`, `userdel`).
- Gérer les **groupes** et distinguer **primaire** vs **secondaire** (`usermod -aG`, `id`).
- Gérer le **vieillissement** des mots de passe (`chage`).
- Poser des permissions en **octal** et en **symbolique**, et régler le **`umask`**.
- Comprendre et poser **SUID**, **SGID**, **sticky**, et les **trouver** (`find -perm`).
- Donner des droits **fins** avec les **ACL** (`setfacl`/`getfacl`).
- Autoriser une commande précise via **`sudo`/`sudoers`** (`visudo`).
:::

:::lang en
By the end of this guide, you'll know how to:

- Read the **account databases**: `/etc/passwd`, `/etc/shadow`, `/etc/group`.
- **Create/modify/delete** users (`useradd`, `usermod`, `userdel`).
- Manage **groups** and tell **primary** from **secondary** (`usermod -aG`, `id`).
- Manage password **aging** (`chage`).
- Set permissions in **octal** and **symbolic**, and configure the **`umask`**.
- Understand and set **SUID**, **SGID**, **sticky**, and **find** them (`find -perm`).
- Grant **fine-grained** rights with **ACLs** (`setfacl`/`getfacl`).
- Allow a specific command via **`sudo`/`sudoers`** (`visudo`).
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides **fondamentaux** et **paquets** acquis.
- Un système **Ubuntu/Debian** avec `sudo` (natif, WSL2, ou VM Multipass).
- L'outil ACL (souvent déjà là ; sinon installe-le) :
:::

:::lang en
You should have:

- The **fundamentals** and **packages** guides under your belt.
- An **Ubuntu/Debian** system with `sudo` (native, WSL2, or Multipass VM).
- The ACL tool (often already present; otherwise install it):
:::

```bash
sudo apt install -y acl
```

## concepts

:::lang fr
**Les comptes vivent dans trois fichiers texte.**

- **`/etc/passwd`** (lisible par tous) : une ligne par utilisateur, 7 champs séparés par `:` → `nom:x:UID:GID:commentaire:home:shell`. Le `x` renvoie au mot de passe stocké ailleurs.
- **`/etc/shadow`** (lisible par **root seul**) : le **mot de passe haché** et les infos de **vieillissement** (dernière modif, âge min/max, avertissement, expiration).
- **`/etc/group`** : les groupes et leurs membres.

**Groupe primaire vs secondaires.** Chaque utilisateur a **un** groupe **primaire** (le GID de `/etc/passwd`, appliqué aux nouveaux fichiers qu'il crée) et **zéro ou plusieurs** groupes **secondaires** (appartenances additionnelles). Le piège fatal : `usermod -G` **remplace** toute la liste des secondaires ; il faut `usermod -aG` (**a**ppend) pour **ajouter** sans effacer les autres.

**Les permissions, trois niveaux × trois droits.** Pour chaque fichier : **propriétaire** (u), **groupe** (g), **autres** (o), chacun avec **r**(4) **w**(2) **x**(1). On les note en **octal** (`chmod 640`) ou en **symbolique** (`chmod u+x,g-w`). Le **`umask`** définit les droits **retirés** par défaut aux nouveaux fichiers (umask `022` → fichiers `644`, dossiers `755`).

**Les permissions spéciales** (le 4ᵉ chiffre octal) :

- **SUID** (`4000`, `s` sur le `x` du propriétaire) : le programme s'exécute avec l'identité de son **propriétaire**, pas de celui qui le lance. C'est pourquoi `passwd` (SUID root) peut écrire dans `/etc/shadow`.
- **SGID** (`2000`) : sur un **fichier**, s'exécute avec le **groupe** propriétaire ; sur un **dossier**, les nouveaux fichiers **héritent du groupe** du dossier (parfait pour un répertoire partagé).
- **Sticky bit** (`1000`, `t`) : sur un **dossier**, seul le **propriétaire d'un fichier** peut le supprimer, même si d'autres ont l'écriture. C'est ce qui protège `/tmp` (`drwxrwxrwt`).

**Les ACL** dépassent le trio u/g/o : elles donnent un droit à **un utilisateur ou groupe précis**, en plus des permissions classiques. `setfacl` pose, `getfacl` lit. Un `+` à la fin du `ls -l` signale une ACL.

**`sudo`** délègue des droits **root ciblés**. La config est dans `/etc/sudoers` (et `/etc/sudoers.d/`), qu'on édite **toujours** avec **`visudo`** (il valide la syntaxe — une erreur ici peut te verrouiller hors de root).
:::

:::lang en
**Accounts live in three text files.**

- **`/etc/passwd`** (world-readable): one line per user, 7 `:`-separated fields → `name:x:UID:GID:comment:home:shell`. The `x` points to the password stored elsewhere.
- **`/etc/shadow`** (readable by **root only**): the **hashed password** and **aging** info (last change, min/max age, warning, expiry).
- **`/etc/group`**: groups and their members.

**Primary vs secondary group.** Each user has **one** **primary** group (the GID in `/etc/passwd`, applied to new files they create) and **zero or more** **secondary** groups (extra memberships). The fatal trap: `usermod -G` **replaces** the entire secondary list; you need `usermod -aG` (**a**ppend) to **add** without wiping the others.

**Permissions, three levels × three rights.** For each file: **owner** (u), **group** (g), **others** (o), each with **r**(4) **w**(2) **x**(1). Written in **octal** (`chmod 640`) or **symbolic** (`chmod u+x,g-w`). The **`umask`** defines the rights **removed** by default from new files (umask `022` → files `644`, dirs `755`).

**Special permissions** (the 4th octal digit):

- **SUID** (`4000`, `s` on the owner's `x`): the program runs with its **owner's** identity, not the caller's. That's why `passwd` (SUID root) can write to `/etc/shadow`.
- **SGID** (`2000`): on a **file**, runs with the owner **group**; on a **directory**, new files **inherit the directory's group** (perfect for a shared directory).
- **Sticky bit** (`1000`, `t`): on a **directory**, only a **file's owner** can delete it, even if others have write. That's what protects `/tmp` (`drwxrwxrwt`).

**ACLs** go beyond the u/g/o trio: they grant a right to **one specific user or group**, on top of the classic permissions. `setfacl` sets, `getfacl` reads. A `+` at the end of `ls -l` flags an ACL.

**`sudo`** delegates **targeted root** rights. Config lives in `/etc/sudoers` (and `/etc/sudoers.d/`), which you **always** edit with **`visudo`** (it validates syntax — a mistake here can lock you out of root).
:::

:::figure linux-permissions
caption_fr: "Schéma 1. rwx × (propriétaire, groupe, autres) + le 4ᵉ chiffre SUID/SGID/sticky. Les ACL ajoutent des droits par utilisateur/groupe précis."
caption_en: "Figure 1. rwx × (owner, group, others) + the 4th SUID/SGID/sticky digit. ACLs add rights for a specific user/group."
:::

:::lang fr
On avance : bases de comptes → créer users/groupes → vieillissement → permissions octal/symbolique/umask → SUID/SGID/sticky → ACL → sudo.
:::

:::lang en
We'll go: account databases → create users/groups → aging → octal/symbolic/umask permissions → SUID/SGID/sticky → ACL → sudo.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Lire les **trois bases de comptes** et comprendre leurs champs.

**🤔 Tout est du texte.** Aucun binaire mystérieux : des fichiers lisibles. Regarde ton propre compte :
:::

:::lang en
**Goal.** Read the **three account databases** and understand their fields.

**🤔 It's all text.** No mysterious binary: readable files. Look at your own account:
:::

```bash
grep "^$USER:" /etc/passwd          # nom:x:UID:GID:commentaire:home:shell
sudo grep "^$USER:" /etc/shadow     # mot de passe haché + vieillissement (root seul) / hash + aging (root only)
id                                  # UID, GID primaire, groupes secondaires / UID, primary GID, secondary groups
```

:::lang fr
**✅ Vérification :** la ligne de `/etc/passwd` montre tes 7 champs (dont ton `home` et ton `shell`, souvent `/bin/bash`). `/etc/shadow` n'est lisible qu'avec `sudo` — c'est **là** qu'est le mot de passe (haché), **pas** dans `passwd`. `id` résume ton identité : `uid=1000(toi) gid=1000(toi) groups=…`. Tu vois la séparation **identité publique** (`passwd`) / **secret** (`shadow`).
:::

:::lang en
**✅ Check:** the `/etc/passwd` line shows your 7 fields (including your `home` and `shell`, often `/bin/bash`). `/etc/shadow` is only readable with `sudo` — that's **where** the (hashed) password lives, **not** in `passwd`. `id` summarizes your identity: `uid=1000(you) gid=1000(you) groups=…`. You see the split between **public identity** (`passwd`) and **secret** (`shadow`).
:::

### step-02

:::lang fr
**Objectif.** Créer un **utilisateur** et un **groupe**, et gérer les appartenances **primaire/secondaire**.

**🤔 Le piège `-aG`.** Ajoute toujours un groupe secondaire avec **`-aG`** (append). Crée un utilisateur et un groupe de test :
:::

:::lang en
**Goal.** Create a **user** and a **group**, and manage **primary/secondary** memberships.

**🤔 The `-aG` trap.** Always add a secondary group with **`-aG`** (append). Create a test user and group:
:::

```bash
sudo useradd -m -s /bin/bash alice        # -m crée le home, -s fixe le shell / -m creates home, -s sets shell
sudo groupadd devs
sudo usermod -aG devs alice               # AJOUTE alice au groupe secondaire devs / ADD alice to secondary group
id alice                                  # groups=...(alice),devs / voit devs en secondaire
groups alice                              # même info, plus court / same info, shorter
```

:::lang fr
**✅ Vérification :** `id alice` montre son **UID**, son **groupe primaire** `alice` (créé automatiquement), et le **secondaire** `devs`. Preuve du piège : `sudo usermod -G devs alice` (**sans `-a`**) **remplacerait** toute la liste secondaire — `-aG` **ajoute**, `-G` **écrase**. C'est l'erreur qui fait perdre à un admin ses accès `sudo` (en le sortant du groupe `sudo`). Retiens : **toujours `-aG`** pour ajouter.
:::

:::lang en
**✅ Check:** `id alice` shows her **UID**, her **primary group** `alice` (auto-created), and the **secondary** `devs`. Proof of the trap: `sudo usermod -G devs alice` (**without `-a`**) would **replace** the whole secondary list — `-aG` **adds**, `-G` **overwrites**. That's the mistake that costs an admin their `sudo` access (by removing them from the `sudo` group). Remember: **always `-aG`** to add.
:::

### step-03

:::lang fr
**Objectif.** Gérer le **vieillissement** du mot de passe avec **`chage`**.

**🤔 Un mot de passe a une durée de vie.** Les stratégies de sécurité imposent expiration et rotation. Regarde et règle :
:::

:::lang en
**Goal.** Manage password **aging** with **`chage`**.

**🤔 A password has a lifetime.** Security policies impose expiry and rotation. Look and set:
:::

```bash
sudo chage -l alice                 # affiche la politique d'âge actuelle / show current aging policy
sudo chage -M 90 -W 7 alice         # max 90 jours, avertit 7 jours avant / max 90 days, warn 7 days before
sudo chage -l alice                 # vérifie le changement / verify the change
```

:::lang fr
**✅ Vérification :** le premier `chage -l alice` montre la politique par défaut (`Maximum number of days` = **99999**, soit « en pratique jamais » ; les champs d'**expiration** affichent `never`) ; après `chage -M 90 -W 7`, `Maximum number of days between password change` passe à **90** et l'avertissement à **7**. Ces valeurs vivent dans `/etc/shadow` (champs de vieillissement). C'est ainsi qu'on impose une **rotation** des mots de passe sur un parc.
:::

:::lang en
**✅ Check:** the first `chage -l alice` shows the default policy (`Maximum number of days` = **99999**, i.e. "effectively never"; the **expiry** fields read `never`); after `chage -M 90 -W 7`, `Maximum number of days between password change` becomes **90** and the warning **7**. These values live in `/etc/shadow` (aging fields). That's how you enforce password **rotation** across a fleet.
:::

### step-04

:::lang fr
**Objectif.** Poser des permissions en **octal** et **symbolique**, et régler le **`umask`**.

**🤔 Deux notations, un résultat.** Crée un fichier et manipule ses droits des deux façons :
:::

:::lang en
**Goal.** Set permissions in **octal** and **symbolic**, and configure the **`umask`**.

**🤔 Two notations, one result.** Create a file and manipulate its rights both ways:
:::

```bash
cd /tmp && touch demo.txt
chmod 640 demo.txt          # octal : rw- r-- --- / owner rw, group r, others none
ls -l demo.txt              # -rw-r-----
chmod u+x,o+r demo.txt      # symbolique : ajoute x au proprio, r aux autres / symbolic
ls -l demo.txt              # -rwxr--r--

umask                       # le masque courant (souvent 0022) / current mask
umask 027 ; touch masked.txt ; ls -l masked.txt   # 0640 : le masque retire g+w et o+rwx
umask 022                   # remets la valeur usuelle / restore usual value
```

:::lang fr
**✅ Vérification :** `chmod 640` donne `-rw-r-----` (octal : 6=rw, 4=r, 0=rien), et `chmod u+x,o+r` le transforme en `-rwxr--r--` (symbolique : opère **relativement**). Avec `umask 027`, le nouveau fichier `masked.txt` naît en `-rw-r-----` : le masque **retire** les droits (027 = enlève l'écriture au groupe et tout aux autres). Octal = **valeur absolue**, symbolique = **ajout/retrait relatif**, umask = **droits retirés par défaut**.
:::

:::lang en
**✅ Check:** `chmod 640` gives `-rw-r-----` (octal: 6=rw, 4=r, 0=none), and `chmod u+x,o+r` turns it into `-rwxr--r--` (symbolic: operates **relatively**). With `umask 027`, the new `masked.txt` is born `-rw-r-----`: the mask **removes** rights (027 = strips group write and everything from others). Octal = **absolute value**, symbolic = **relative add/remove**, umask = **rights removed by default**.
:::

### step-05

:::lang fr
**Objectif.** Comprendre et poser les **permissions spéciales** : **SUID**, **SGID**, **sticky**.

**🤔 Les vois-tu dans la nature ?** Deux exemples déjà présents sur ton système :
:::

:::lang en
**Goal.** Understand and set the **special permissions**: **SUID**, **SGID**, **sticky**.

**🤔 Do you see them in the wild?** Two examples already on your system:
:::

```bash
ls -l /usr/bin/passwd       # -rwsr-xr-x : le 's' = SUID (s'exécute en root) / 's' = SUID (runs as root)
ls -ld /tmp                 # drwxrwxrwt : le 't' final = sticky bit / trailing 't' = sticky

# Poser un SGID sur un dossier partagé : les fichiers créés héritent du groupe / new files inherit the group
sudo mkdir /tmp/partage && sudo chgrp devs /tmp/partage
sudo chmod 2775 /tmp/partage      # le 2 = SGID / the leading 2 = SGID
ls -ld /tmp/partage               # drwxrwsr-x : le 's' sur le groupe / 's' on the group

# Trouver tous les binaires SUID du système (audit de sécurité classique) / find all SUID binaries
find /usr/bin -perm -4000 -type f 2>/dev/null
```

:::lang fr
**✅ Vérification :** `ls -l /usr/bin/passwd` montre `-rw**s**r-xr-x` : le `s` sur le `x` du propriétaire = **SUID**, la raison pour laquelle un utilisateur normal peut changer son mot de passe (le binaire s'exécute en **root** le temps d'écrire dans `/etc/shadow`). `/tmp` porte le **sticky** (`t` final) : chacun y écrit, mais **ne supprime que ses propres fichiers**. Ton `/tmp/partage` en `2775` porte le **SGID** (`s` sur le groupe) : tout fichier qu'on y crée appartiendra au groupe `devs` — le motif du **répertoire d'équipe**. Et `find -perm -4000` **audite** les binaires SUID (surface d'attaque à surveiller).
:::

:::lang en
**✅ Check:** `ls -l /usr/bin/passwd` shows `-rw**s**r-xr-x`: the `s` on the owner's `x` = **SUID**, why a normal user can change their password (the binary runs as **root** long enough to write to `/etc/shadow`). `/tmp` carries the **sticky** (trailing `t`): everyone writes there, but **deletes only their own files**. Your `/tmp/partage` at `2775` carries the **SGID** (`s` on the group): any file created there will belong to the `devs` group — the **team directory** pattern. And `find -perm -4000` **audits** SUID binaries (an attack surface to watch).
:::

### step-06

:::lang fr
**Objectif.** Donner un droit **à un utilisateur précis** avec une **ACL**, au-delà de u/g/o.

**🤔 Quand u/g/o ne suffit pas.** Tu veux que **seul `alice`** puisse écrire dans un fichier, sans changer son propriétaire ni son groupe. C'est le rôle des **ACL**. Crée `bob` pour comparer, puis pose l'ACL :
:::

:::lang en
**Goal.** Grant a right **to a specific user** with an **ACL**, beyond u/g/o.

**🤔 When u/g/o isn't enough.** You want **only `alice`** to write to a file, without changing its owner or group. That's what **ACLs** are for. Create `bob` to compare, then set the ACL:
:::

```bash
sudo useradd -m bob
cd /tmp && touch rapport.txt && chmod 640 rapport.txt   # groupe: lecture seule / group: read-only

sudo setfacl -m u:alice:rw rapport.txt      # alice précisément : lecture-écriture / alice specifically: rw
getfacl rapport.txt                          # affiche l'ACL / show the ACL
ls -l rapport.txt                            # noter le '+' à la fin des permissions / note the trailing '+'
```

:::lang fr
**✅ Vérification :** `getfacl rapport.txt` liste une entrée **`user:alice:rw-`** en plus des permissions classiques — `alice` a l'écriture que ni le groupe ni les autres n'ont, **sans** être propriétaire. Le `ls -l` affiche un **`+`** après les droits (`-rw-rw----+`), signal visuel d'une ACL. **⚠️ Le masque ACL :** `ls` affiche `rw-` sur le triplet **groupe** parce qu'il montre le **masque ACL** (créé automatiquement par `setfacl`, il **plafonne** les droits effectifs des entrées ACL), **pas** le vrai droit de groupe — qui reste `group::r--`, visible seulement dans `getfacl`. Ce masque est un concept d'examen LPIC-1. `bob`, lui, n'a ni entrée ACL ni appartenance : il reste soumis aux droits « autres » (aucun). Les ACL = des droits **chirurgicaux**, par utilisateur/groupe nommé, quand les trois niveaux classiques ne suffisent pas.
:::

:::lang en
**✅ Check:** `getfacl rapport.txt` lists a **`user:alice:rw-`** entry on top of the classic permissions — `alice` has the write that neither group nor others have, **without** being owner. `ls -l` shows a **`+`** after the rights (`-rw-rw----+`), the visual sign of an ACL. **⚠️ The ACL mask:** `ls` shows `rw-` on the **group** triad because it displays the **ACL mask** (auto-created by `setfacl`; it **caps** the effective rights of ACL entries), **not** the real group right — which stays `group::r--`, visible only in `getfacl`. This mask is an LPIC-1 exam concept. `bob` has neither an ACL entry nor membership: he stays subject to the "others" rights (none). ACLs = **surgical** rights, per named user/group, when the three classic levels aren't enough.
:::

### step-07

:::lang fr
**Objectif.** Autoriser une **commande précise** en `sudo` — sans donner tous les pouvoirs — via **`visudo`**.

**🤔 Le moindre privilège, appliqué à root.** On autorise `alice` à redémarrer un service **et rien d'autre**. On édite via `/etc/sudoers.d/` (fichier séparé, propre) avec **`visudo`** (qui valide la syntaxe). Crée la règle :
:::

:::lang en
**Goal.** Allow a **specific command** with `sudo` — without granting all power — via **`visudo`**.

**🤔 Least privilege, applied to root.** We allow `alice` to restart a service **and nothing else**. We edit via `/etc/sudoers.d/` (a separate, clean file) with **`visudo`** (which validates syntax). Create the rule:
:::

```bash
# visudo édite le fichier ET valide la syntaxe avant d'enregistrer / edits AND validates before saving
echo 'alice ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart ssh' | sudo tee /etc/sudoers.d/alice
sudo visudo -cf /etc/sudoers.d/alice        # -c = check : "parsed OK" attendu / -c = check: expect "parsed OK"

sudo -l -U alice                            # liste ce qu'alice a le droit de faire en sudo / what alice may sudo
```

:::lang fr
**✅ Vérification :** `visudo -cf /etc/sudoers.d/alice` répond **`parsed OK`** (syntaxe valide — c'est **le** garde-fou : ne jamais éditer sudoers avec un éditeur brut). `sudo -l -U alice` affiche exactement **une** permission : `systemctl restart ssh`, en `NOPASSWD`. `alice` peut redémarrer ce service **sans mot de passe** mais **ne peut rien faire d'autre** en root. C'est le **moindre privilège** : on délègue une action précise, pas les clés du royaume. *(Toujours `/etc/sudoers.d/` + `visudo`, jamais un `nano /etc/sudoers` direct : une faute de syntaxe peut casser tout `sudo`.)*
:::

:::lang en
**✅ Check:** `visudo -cf /etc/sudoers.d/alice` answers **`parsed OK`** (valid syntax — **the** safeguard: never edit sudoers with a raw editor). `sudo -l -U alice` shows exactly **one** permission: `systemctl restart ssh`, as `NOPASSWD`. `alice` can restart that service **without a password** but **can't do anything else** as root. That's **least privilege**: you delegate a precise action, not the keys to the kingdom. *(Always `/etc/sudoers.d/` + `visudo`, never a direct `nano /etc/sudoers`: a syntax error can break all of `sudo`.)*
:::

## pitfalls

:::lang fr
**1. `usermod -G` sans `-a`.** Il **remplace** tous les groupes secondaires. Se retirer soi-même du groupe `sudo` ainsi = perdre ses droits admin. Toujours **`-aG`** pour ajouter.

**2. Éditer `/etc/passwd`/`shadow`/`sudoers` à la main.** Risque de corruption/verrouillage. Utilise les outils : `useradd`/`usermod`/`chage`/`passwd`, et **`visudo`** pour sudoers.

**3. Chercher le mot de passe dans `/etc/passwd`.** Il n'y est pas (le `x`). Il est **haché** dans `/etc/shadow` (root seul).

**4. Confondre octal et symbolique.** `chmod 644` = **absolu** (écrase tout) ; `chmod u+x` = **relatif** (ajoute). Mélanger les deux logiques donne des résultats inattendus.

**5. Confondre SUID sur fichier et SGID sur dossier.** SUID = s'exécuter en tant que propriétaire (fichiers exécutables). SGID sur **dossier** = héritage de groupe. Le sticky sur **dossier** = seul le propriétaire supprime.

**6. Oublier le paquet `acl`.** `setfacl`/`getfacl` viennent du paquet `acl` ; sur un système minimal il faut l'installer. Et le système de fichiers doit supporter les ACL (ext4 : oui par défaut).

**7. `userdel` sans `-r` laisse le home.** `userdel alice` supprime le compte mais **garde** `/home/alice`. `userdel -r alice` supprime aussi le home et le mail.
:::

:::lang en
**1. `usermod -G` without `-a`.** It **replaces** all secondary groups. Removing yourself from the `sudo` group this way = losing admin rights. Always **`-aG`** to add.

**2. Editing `/etc/passwd`/`shadow`/`sudoers` by hand.** Risk of corruption/lockout. Use the tools: `useradd`/`usermod`/`chage`/`passwd`, and **`visudo`** for sudoers.

**3. Looking for the password in `/etc/passwd`.** It's not there (the `x`). It's **hashed** in `/etc/shadow` (root only).

**4. Confusing octal and symbolic.** `chmod 644` = **absolute** (overwrites all); `chmod u+x` = **relative** (adds). Mixing the two logics gives surprising results.

**5. Confusing SUID on a file and SGID on a directory.** SUID = run as the owner (executable files). SGID on a **directory** = group inheritance. Sticky on a **directory** = only the owner deletes.

**6. Forgetting the `acl` package.** `setfacl`/`getfacl` come from the `acl` package; on a minimal system you must install it. And the filesystem must support ACLs (ext4: yes by default).

**7. `userdel` without `-r` leaves the home.** `userdel alice` deletes the account but **keeps** `/home/alice`. `userdel -r alice` also removes the home and mail.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu lis les 7 champs de `/etc/passwd` et tu sais où est le mot de passe (`shadow`).
- [ ] Tu crées un user, l'ajoutes à un groupe **avec `-aG`**, et lis le tout avec `id`.
- [ ] Tu règles le vieillissement d'un mot de passe (`chage`).
- [ ] Tu poses des droits en **octal** et **symbolique**, et tu expliques un `umask`.
- [ ] Tu reconnais et poses **SUID/SGID/sticky**, et tu **audites** les SUID.
- [ ] Tu donnes un droit à **un utilisateur précis** avec une **ACL**.
- [ ] Tu autorises **une** commande `sudo` via `/etc/sudoers.d/` + `visudo`.

Sept cases cochées = tu tiens **Utilisateurs, groupes & permissions** du LPIC-1.
:::

:::lang en
You know it works when…

- [ ] You read the 7 fields of `/etc/passwd` and know where the password lives (`shadow`).
- [ ] You create a user, add them to a group **with `-aG`**, and read it all with `id`.
- [ ] You set a password's aging (`chage`).
- [ ] You set rights in **octal** and **symbolic**, and explain a `umask`.
- [ ] You recognize and set **SUID/SGID/sticky**, and **audit** SUIDs.
- [ ] You grant a right to **one specific user** with an **ACL**.
- [ ] You allow **one** `sudo` command via `/etc/sudoers.d/` + `visudo`.

Seven boxes ticked = you hold LPIC-1 **Users, groups & permissions**.
:::

## next

:::lang fr
La suite de la track Linux → LPIC-1 :

1. **Systèmes de fichiers, disques & FHS** — partitions, `mkfs`, `fstab`, LVM, liens.
2. **Boot, systemd & processus** — démarrage, units/targets, `journalctl`, cron/timers.
3. **Réseau & sécurité système** — `ip`/`ss`, DNS, SSH, pare-feu, durcissement.
4. **Scripting shell (bash)** — variables, conditions, boucles, fonctions.
5. **Projet d'entreprise** — provisionner et durcir un serveur Linux multi-utilisateur.

**Ménage :** supprime les comptes de test et les fichiers créés — `sudo userdel -r alice ; sudo userdel -r bob ; sudo groupdel devs ; sudo rm -f /etc/sudoers.d/alice ; sudo rm -rf /tmp/partage /tmp/demo.txt /tmp/masked.txt /tmp/rapport.txt`.
:::

:::lang en
The rest of the Linux → LPIC-1 track:

1. **Filesystems, disks & FHS** — partitions, `mkfs`, `fstab`, LVM, links.
2. **Boot, systemd & processes** — startup, units/targets, `journalctl`, cron/timers.
3. **Networking & system security** — `ip`/`ss`, DNS, SSH, firewall, hardening.
4. **Shell scripting (bash)** — variables, conditionals, loops, functions.
5. **Enterprise project** — provision and harden a multi-user Linux server.

**Cleanup:** delete the test accounts and created files — `sudo userdel -r alice ; sudo userdel -r bob ; sudo groupdel devs ; sudo rm -f /etc/sudoers.d/alice ; sudo rm -rf /tmp/partage /tmp/demo.txt /tmp/masked.txt /tmp/rapport.txt`.
:::

## cheatsheet

:::lang fr
Aide-mémoire utilisateurs & permissions.
:::

:::lang en
Users & permissions cheat sheet.
:::

```bash
# Bases de comptes / account databases
/etc/passwd  (nom:x:UID:GID:gecos:home:shell)   /etc/shadow (hash+âge)   /etc/group

# Utilisateurs & groupes / users & groups
sudo useradd -m -s /bin/bash NOM ; sudo passwd NOM ; sudo userdel -r NOM
sudo groupadd GRP ; sudo usermod -aG GRP NOM     # -aG = AJOUTE (pas -G !) / ADD (not -G!)
id NOM ; groups NOM ; sudo chage -l NOM ; sudo chage -M 90 -W 7 NOM

# Permissions
chmod 640 f       # octal (absolu)      chmod u+x,g-w f   # symbolique (relatif)
umask 027         # droits retirés par défaut / rights removed by default
chown user:grp f ; chgrp grp f

# Spéciales (4e chiffre) / special (4th digit)
chmod 4755 f  # SUID    chmod 2775 d  # SGID (dossier: héritage groupe)   chmod 1777 d  # sticky
find / -perm -4000 -type f 2>/dev/null            # audit SUID

# ACL
sudo setfacl -m u:alice:rw f ; getfacl f ; setfacl -x u:alice f   # ls -l montre un '+'

# sudo
sudo visudo -f /etc/sudoers.d/NOM ; sudo visudo -cf FICHIER ; sudo -l -U NOM
```

## resources

:::lang fr
- [`man useradd`](https://manpages.ubuntu.com/manpages/noble/man8/useradd.8.html), [`man usermod`](https://manpages.ubuntu.com/manpages/noble/man8/usermod.8.html), [`man chage`](https://manpages.ubuntu.com/manpages/noble/man1/chage.1.html).
- [Permissions & special bits (LPIC 104.5)](https://www.linux.com/training-tutorials/understanding-linux-file-permissions/).
- [ACL — `man setfacl`](https://manpages.ubuntu.com/manpages/noble/man1/setfacl.1.html) et [`getfacl`](https://manpages.ubuntu.com/manpages/noble/man1/getfacl.1.html).
- [`sudoers` — `man sudoers`](https://manpages.ubuntu.com/manpages/noble/man5/sudoers.5.html) et l'usage de `visudo`.
:::

:::lang en
- [`man useradd`](https://manpages.ubuntu.com/manpages/noble/man8/useradd.8.html), [`man usermod`](https://manpages.ubuntu.com/manpages/noble/man8/usermod.8.html), [`man chage`](https://manpages.ubuntu.com/manpages/noble/man1/chage.1.html).
- [Permissions & special bits (LPIC 104.5)](https://www.linux.com/training-tutorials/understanding-linux-file-permissions/).
- [ACL — `man setfacl`](https://manpages.ubuntu.com/manpages/noble/man1/setfacl.1.html) and [`getfacl`](https://manpages.ubuntu.com/manpages/noble/man1/getfacl.1.html).
- [`sudoers` — `man sudoers`](https://manpages.ubuntu.com/manpages/noble/man5/sudoers.5.html) and using `visudo`.
:::

## troubleshooting

:::lang fr
**`usermod: group 'X' does not exist`.** Crée le groupe d'abord (`sudo groupadd X`), puis `usermod -aG X user`.

**Un utilisateur a perdu ses groupes après `usermod -G`.** Tu as oublié le `-a`. Rajoute-le aux groupes manquants avec `usermod -aG`. Vérifie avec `id`.

**Les changements de groupe ne prennent pas effet.** L'appartenance est lue **à la connexion** : l'utilisateur doit se **reconnecter** (ou `newgrp GRP` pour une session). Un shell déjà ouvert garde l'ancienne liste.

**`setfacl: command not found`.** Installe le paquet : `sudo apt install acl`. Et vérifie que le FS supporte les ACL (`mount | grep acl` ; ext4 les active par défaut).

**`sudo` cassé après édition de sudoers.** Si tu as un shell root ouvert : `visudo` pour corriger. Sinon, redémarre en mode recovery. **Leçon** : toujours `visudo` (il refuse d'enregistrer une syntaxe invalide).

**`chmod 2775` mais pas de `s` sur le groupe.** Le dossier n'a peut-être pas le `x` de groupe : le SGID s'affiche `S` (majuscule) s'il n'y a pas de `x` sous-jacent. Vérifie que le `x` est présent (`2775` l'inclut).
:::

:::lang en
**`usermod: group 'X' does not exist`.** Create the group first (`sudo groupadd X`), then `usermod -aG X user`.

**A user lost their groups after `usermod -G`.** You forgot the `-a`. Re-add them to the missing groups with `usermod -aG`. Check with `id`.

**Group changes don't take effect.** Membership is read **at login**: the user must **log back in** (or `newgrp GRP` for one session). An already-open shell keeps the old list.

**`setfacl: command not found`.** Install the package: `sudo apt install acl`. And check the FS supports ACLs (`mount | grep acl`; ext4 enables them by default).

**`sudo` broken after editing sudoers.** If you have a root shell open: `visudo` to fix. Otherwise, reboot into recovery mode. **Lesson**: always `visudo` (it refuses to save invalid syntax).

**`chmod 2775` but no `s` on the group.** The directory may lack group `x`: SGID shows as `S` (uppercase) when there's no underlying `x`. Check `x` is present (`2775` includes it).
:::
