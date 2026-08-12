---
# — Identité (ne change JAMAIS une fois publié) —
id: ansible-administration-systeme
slug: ansible-administration-systeme
order: 26
status: published

# — Titres & accroches (bilingue) —
title_fr: "Ansible — administration système par modules"
title_en: "Ansible — system administration via modules"
tagline_fr: "user, group, package, service, cron, firewalld, lvol."
tagline_en: "user, group, package, service, cron, firewalld, lvol."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 230
repo: "ansible/ansible"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [ansible-vault]
next: [ansible-projet-entreprise]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [module-user-group, gestion-paquets, services-systemd, taches-cron, pare-feu-firewalld, stockage-lvm, mots-de-passe-hash]
concepts_en: [user-group-module, package-management, systemd-services, cron-tasks, firewalld, lvm-storage, password-hash]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le gros bloc « gérer le contenu système » de l'EX294 : créer utilisateurs et groupes (user/group), gérer les mots de passe hachés et leur expiration, installer/retirer des paquets (apt/dnf/package), piloter les services au boot (service/systemd), planifier des tâches (cron), configurer le pare-feu (firewalld / ufw), et gérer le stockage LVM (lvg/lvol/filesystem/mount). Cœur testable en local, services/pare-feu/LVM sur ta VM de parc."
og_description_en: "The big 'manage system content' block of EX294: create users and groups (user/group), manage hashed passwords and their expiry, install/remove packages (apt/dnf/package), drive services at boot (service/systemd), schedule tasks (cron), configure the firewall (firewalld / ufw), and manage LVM storage (lvg/lvol/filesystem/mount). Testable core locally, services/firewall/LVM on your fleet VM."
---

## intro

:::lang fr
Jusqu'ici tu as appris la **grammaire** d'Ansible : inventaire, contrôle de flux, variables, rôles, secrets. Ce guide-ci porte sur le **vocabulaire métier** — les modules qui font le vrai travail d'un administrateur : créer des utilisateurs, poser des mots de passe, installer des paquets, activer des services au démarrage, planifier des tâches, ouvrir un pare-feu, étendre un volume LVM. C'est **le plus gros bloc de l'examen RHCE/EX294** (« gérer le contenu système »), et c'est ce qui rend Ansible utile au quotidien.

La règle d'or ici : **toujours le module dédié, jamais `command`/`shell`**. `ansible.builtin.user` sait si l'utilisateur existe déjà (idempotence) ; `useradd` via `shell` ne le sait pas. Chaque section te donne le bon module, ses paramètres qui tombent à l'examen, et le piège classique.

Ce que tu peux tester **en local** (sur `localhost`, en root) : utilisateurs, groupes, mots de passe, paquets, tâches cron. Ce qui exige une **vraie machine gérée** avec systemd/pare-feu/disque (ta VM de parc `web1` des guides précédents) : les services, `firewalld`, et LVM — on te le signale à chaque fois, avec la sortie attendue.

**Pour qui c'est :** tu maîtrises toute la mécanique Ansible (guides précédents) et tu veux le catalogue des modules d'administration système.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas encore écrire un playbook idempotent → reviens en arrière dans le track.
- Tu veux apprendre ces tâches **à la main** (sans Ansible) → c'est le track **Linux/LPIC-1** ; ici on les **automatise**.
:::

:::lang en
So far you've learned Ansible's **grammar**: inventory, flow control, variables, roles, secrets. This guide is about the **domain vocabulary** — the modules that do a sysadmin's real work: create users, set passwords, install packages, enable services at boot, schedule tasks, open a firewall, extend an LVM volume. It's **the biggest block of the RHCE/EX294 exam** ("manage system content"), and it's what makes Ansible useful day to day.

The golden rule here: **always the dedicated module, never `command`/`shell`**. `ansible.builtin.user` knows whether the user already exists (idempotence); `useradd` via `shell` doesn't. Each section gives you the right module, its exam-relevant parameters, and the classic trap.

What you can test **locally** (on `localhost`, as root): users, groups, passwords, packages, cron tasks. What needs a **real managed machine** with systemd/firewall/disk (your `web1` fleet VM from earlier guides): services, `firewalld`, and LVM — we flag it each time, with the expected output.

**Who it's for:** you master all of Ansible's mechanics (previous guides) and you want the system-administration module catalog.

**When it's NOT the right choice:**

- You can't yet write an idempotent playbook → go back in the track.
- You want to learn these tasks **by hand** (without Ansible) → that's the **Linux/LPIC-1** track; here we **automate** them.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Créer groupes et utilisateurs (**`group`**, **`user`**) : système, shell, groupes secondaires, suppression.
- Poser un **mot de passe haché** (`password_hash`) et gérer l'**expiration** et le verrouillage.
- Installer/retirer/mettre à jour des **paquets** (**`apt`**, **`dnf`**, **`package`**).
- Piloter un **service** au démarrage (**`service`**/**`systemd_service`** : started, enabled, restarted).
- Planifier une **tâche cron** (**`cron`** : `special_time`, `cron_file`, variables d'env).
- Configurer le **pare-feu** (**`firewalld`** RHEL / **`ufw`** Debian).
- Gérer le **stockage LVM** (**`lvg`**, **`lvol`**, **`filesystem`**, **`mount`**).
:::

:::lang en
By the end of this guide, you can:

- Create groups and users (**`group`**, **`user`**): system, shell, secondary groups, removal.
- Set a **hashed password** (`password_hash`) and manage **expiry** and locking.
- Install/remove/upgrade **packages** (**`apt`**, **`dnf`**, **`package`**).
- Drive a **service** at boot (**`service`**/**`systemd_service`**: started, enabled, restarted).
- Schedule a **cron task** (**`cron`**: `special_time`, `cron_file`, env variables).
- Configure the **firewall** (**`firewalld`** RHEL / **`ufw`** Debian).
- Manage **LVM storage** (**`lvg`**, **`lvol`**, **`filesystem`**, **`mount`**).
:::

## prerequisites

:::lang fr
- Tous les guides Ansible précédents du track (jusqu'à *Vault*).
- **Ansible ≥ 2.16** (`ansible --version`).
- Un dossier de travail et les droits **root** (via `become`). Les étapes 1-2-3-5 sont **testables sur `localhost`** en `connection: local`.
- Pour les étapes 4 (services), 6 (pare-feu) et 7 (LVM) : une **VM gérée** avec systemd (ta VM `web1` du guide *inventaire*), car un conteneur n'a ni systemd, ni firewalld, ni disque à partitionner. Certains modules vivent dans des **collections** (`ansible.posix.firewalld`, `community.general.lvol`) préinstallées sur un paquet `ansible`, à installer sinon (`ansible-galaxy collection install ...`).
:::

:::lang en
- All previous Ansible track guides (through *Vault*).
- **Ansible ≥ 2.16** (`ansible --version`).
- A working folder and **root** rights (via `become`). Steps 1-2-3-5 are **testable on `localhost`** with `connection: local`.
- For steps 4 (services), 6 (firewall) and 7 (LVM): a **managed VM** with systemd (your `web1` VM from the *inventory* guide), because a container has neither systemd, nor firewalld, nor a disk to partition. Some modules live in **collections** (`ansible.posix.firewalld`, `community.general.lvol`) preinstalled on an `ansible` package, otherwise installable (`ansible-galaxy collection install ...`).
:::

## concepts

:::lang fr
**`group` & `user`.** Les modules d'identité. `group` gère un groupe (`name`, `gid`, `system`). `user` gère un compte : `name`, `groups` (secondaires) + `append: true` (ajouter sans écraser), `shell`, `home`, `system: true` (compte de service), `password` (haché), `state: absent` (supprimer). ⚠️ `append: false` (le défaut) **remplace** la liste des groupes secondaires.

**Mot de passe haché.** Le module `user` attend un mot de passe **déjà haché** (jamais en clair). On le génère avec le filtre `password_hash('sha512')`. On gère l'expiration avec `password_expire_max`/`password_expire_min`, et le verrouillage avec `password_lock`.

**`apt`/`dnf`/`package`.** Gestion des paquets. `apt` (Debian/Ubuntu), `dnf` (Fedora/RHEL), ou `package` (générique, choisit le bon). Paramètres clés : `name` (une liste possible), `state: present|absent|latest`, `update_cache: true`, `autoremove: true`.

**`service`/`systemd_service`.** Pilote un service. `service` est générique ; `systemd_service` est spécifique systemd (avec `daemon_reload`). Paramètres : `state: started|stopped|restarted|reloaded`, `enabled: true` (démarrage au boot). **Besoin de systemd** → une vraie VM.

**`cron`.** Gère une entrée de crontab. `name` (identifiant unique du job), `job` (la commande), `minute/hour/day/…` ou `special_time: daily|reboot|…`, `cron_file` (poser le job dans `/etc/cron.d/`), `user`, `env: true` (poser une variable d'env comme `PATH`).

**Pare-feu.** `ansible.posix.firewalld` (RHEL : zones, services, ports, `permanent: true` + `immediate: true`, `state: enabled`) est le module d'examen RHCE. Sur Debian/Ubuntu, l'équivalent communautaire est `community.general.ufw`.

**Stockage LVM.** `community.general.lvg` (volume group sur un ou plusieurs disques), `community.general.lvol` (logical volume, `size`, `resizefs`), `community.general.filesystem` (formater), `ansible.posix.mount` (monter + `/etc/fstab`). C'est la chaîne pour provisionner et étendre un volume.
:::

:::lang en
**`group` & `user`.** The identity modules. `group` manages a group (`name`, `gid`, `system`). `user` manages an account: `name`, `groups` (secondary) + `append: true` (add without overwriting), `shell`, `home`, `system: true` (service account), `password` (hashed), `state: absent` (remove). ⚠️ `append: false` (the default) **replaces** the secondary group list.

**Hashed password.** The `user` module expects an **already-hashed** password (never clear). Generate it with the `password_hash('sha512')` filter. Manage expiry with `password_expire_max`/`password_expire_min`, and locking with `password_lock`.

**`apt`/`dnf`/`package`.** Package management. `apt` (Debian/Ubuntu), `dnf` (Fedora/RHEL), or `package` (generic, picks the right one). Key params: `name` (a list is possible), `state: present|absent|latest`, `update_cache: true`, `autoremove: true`.

**`service`/`systemd_service`.** Drives a service. `service` is generic; `systemd_service` is systemd-specific (with `daemon_reload`). Params: `state: started|stopped|restarted|reloaded`, `enabled: true` (start at boot). **Needs systemd** → a real VM.

**`cron`.** Manages a crontab entry. `name` (the job's unique id), `job` (the command), `minute/hour/day/…` or `special_time: daily|reboot|…`, `cron_file` (place the job in `/etc/cron.d/`), `user`, `env: true` (set an env variable like `PATH`).

**Firewall.** `ansible.posix.firewalld` (RHEL: zones, services, ports, `permanent: true` + `immediate: true`, `state: enabled`) is the RHCE exam module. On Debian/Ubuntu, the community equivalent is `community.general.ufw`.

**LVM storage.** `community.general.lvg` (volume group over one or more disks), `community.general.lvol` (logical volume, `size`, `resizefs`), `community.general.filesystem` (format), `ansible.posix.mount` (mount + `/etc/fstab`). That's the chain to provision and extend a volume.
:::

:::figure ansible-sysadmin-modules
caption_fr: "Schéma 1. Le catalogue des modules d'administration système : identité (group/user), logiciels (apt/dnf), exécution (service/cron), sécurité réseau (firewalld/ufw) et stockage (lvg/lvol/mount) — chacun idempotent, à préférer toujours à command/shell."
caption_en: "Figure 1. The system-administration module catalog: identity (group/user), software (apt/dnf), execution (service/cron), network security (firewalld/ufw) and storage (lvg/lvol/mount) — each idempotent, always preferred over command/shell."
:::

## walkthrough

:::lang fr
On avance ainsi : groupes & utilisateurs → mots de passe & expiration → paquets → services (VM) → tâches cron → pare-feu (VM) → stockage LVM (VM).
:::

:::lang en
We'll go like this: groups & users → passwords & expiry → packages → services (VM) → cron tasks → firewall (VM) → LVM storage (VM).
:::

### step-01

:::lang fr
**Objectif.** Créer un **groupe** et un **utilisateur** proprement, avec groupes secondaires — testable en local.

**🤔 Le piège `append`.** `groups:` sans `append: true` **écrase** les groupes secondaires existants de l'utilisateur. Pour *ajouter* un groupe sans virer les autres, il faut **`append: true`**. C'est l'erreur qui coûte des points à l'examen (et casse des comptes en prod).

Crée `admin.yml` :
:::

:::lang en
**Goal.** Create a **group** and a **user** cleanly, with secondary groups — testable locally.

**🤔 The `append` trap.** `groups:` without `append: true` **overwrites** the user's existing secondary groups. To *add* a group without removing the others, you need **`append: true`**. It's the mistake that costs points on the exam (and breaks accounts in prod).

Create `admin.yml`:
:::

```yaml
- name: Administration système — atelier
  hosts: localhost
  connection: local
  become: true
  tasks:
    - name: Un groupe applicatif
      ansible.builtin.group:
        name: atelier
        state: present

    - name: Un utilisateur de service
      ansible.builtin.user:
        name: deploy
        comment: "Compte de déploiement"
        groups: [atelier]
        append: true            # AJOUTE au lieu d'écraser / ADDS instead of overwriting
        shell: /bin/bash
        create_home: true
        state: present
      register: u

    - name: Confirmer l'appartenance
      ansible.builtin.command: id deploy
      register: idout
      changed_when: false

    - name: Montrer le résultat
      ansible.builtin.debug:
        msg: "{{ idout.stdout }}"
```

```bash
ansible-playbook admin.yml
```

:::lang fr
**✅ Vérification :** la tâche `group` puis `user` sont `changed` au 1er passage. La dernière tâche affiche une ligne `uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),1002(atelier)` (les UID/GID exacts varient) : `deploy` est bien membre d'`atelier`. **Relance** : tout passe `ok` (idempotence). Nettoie ensuite avec un `state: absent` sur `user` (+ `remove: true` pour le home) si tu veux.
:::

:::lang en
**✅ Check:** the `group` then `user` tasks are `changed` on the 1st pass. The last task prints a line `uid=1001(deploy) gid=1001(deploy) groups=1001(deploy),1002(atelier)` (exact UID/GIDs vary): `deploy` is indeed a member of `atelier`. **Rerun**: everything goes `ok` (idempotence). Then clean up with `state: absent` on `user` (+ `remove: true` for the home) if you like.
:::

### step-02

:::lang fr
**Objectif.** Poser un **mot de passe haché** et gérer l'**expiration** — sans jamais écrire le mot de passe en clair.

**🤔 Pourquoi le hash ?** Le module `user` écrit directement dans `/etc/shadow`, qui attend un **hash**, pas un mot de passe. Passer du clair ne marcherait pas (ou stockerait le clair). On génère le hash avec `password_hash('sha512')`, idéalement à partir d'une variable **Vault** (guide précédent). Ici, pour la démo, on part d'une variable simple.

Ajoute à `admin.yml` :
:::

:::lang en
**Goal.** Set a **hashed password** and manage **expiry** — without ever writing the password in clear.

**🤔 Why the hash?** The `user` module writes directly into `/etc/shadow`, which expects a **hash**, not a password. Passing clear text wouldn't work (or would store the clear text). We generate the hash with `password_hash('sha512')`, ideally from a **Vault** variable (previous guide). Here, for the demo, we start from a simple variable.

Add to `admin.yml`:
:::

```yaml
    - name: Poser un mot de passe haché + expiration
      ansible.builtin.user:
        name: deploy
        password: "{{ 'MotDePasseDemo2026' | password_hash('sha512') }}"
        password_expire_max: 90        # expire dans 90 jours / expires in 90 days
        update_password: on_create     # ne rehash pas à chaque run / don't rehash every run

    - name: Vérifier l'entrée shadow (champ non vide = mot de passe posé)
      ansible.builtin.shell: "getent shadow deploy | cut -d: -f2 | cut -c1-3"
      register: shadow3
      changed_when: false

    - name: Montrer le préfixe du hash
      ansible.builtin.debug:
        msg: "préfixe du hash = {{ shadow3.stdout }} (doit être $6$ = SHA512)"
```

:::lang fr
**✅ Vérification :** la dernière tâche affiche `préfixe du hash = $6$` — le `$6$` prouve un hash **SHA512** dans `/etc/shadow`. ⚠️ **`update_password: on_create` est crucial** : sans lui, `password_hash` regénère un sel différent à **chaque** exécution → la tâche serait toujours `changed` (fausse non-idempotence). Avec `on_create`, le mot de passe n'est posé qu'à la création du compte. En prod, le mot de passe vient d'une variable Vault, jamais en clair dans le playbook.
:::

:::lang en
**✅ Check:** the last task prints `préfixe du hash = $6$` — the `$6$` proves a **SHA512** hash in `/etc/shadow`. ⚠️ **`update_password: on_create` is crucial**: without it, `password_hash` regenerates a different salt on **every** run → the task would always be `changed` (false non-idempotence). With `on_create`, the password is set only at account creation. In prod, the password comes from a Vault variable, never clear in the playbook.
:::

### step-03

:::lang fr
**Objectif.** Installer, mettre à jour et retirer des **paquets** — testable en local.

**🤔 `present` vs `latest`.** `state: present` installe si absent, mais **ne met pas à jour** un paquet déjà là. `state: latest` force la dernière version (donc peut être `changed` quand une mise à jour existe). Choisis selon l'intention : « au moins présent » vs « toujours à jour ».

Ajoute à `admin.yml` :
:::

:::lang en
**Goal.** Install, upgrade and remove **packages** — testable locally.

**🤔 `present` vs `latest`.** `state: present` installs if absent, but **does not upgrade** an already-present package. `state: latest` forces the latest version (so may be `changed` when an update exists). Choose by intent: "at least present" vs "always up to date".

Add to `admin.yml`:
:::

```yaml
    - name: Installer des paquets (liste)
      ansible.builtin.apt:
        name: [tree, jq]
        state: present
        update_cache: true
        cache_valid_time: 3600     # ne rafraîchit pas si < 1h / skip refresh if < 1h

    - name: Vérifier qu'ils répondent
      ansible.builtin.command: "{{ item }} --version"
      loop: [tree, jq]
      changed_when: false
```

:::lang fr
Sur RHEL/Fedora, la même chose s'écrit avec `dnf` ; ou le module générique `package` :
:::

:::lang en
On RHEL/Fedora, the same is written with `dnf`; or the generic `package` module:
:::

```yaml
    # Version portable Debian ↔ RHEL / portable version
    - name: Installer avec le module générique
      ansible.builtin.package:
        name: tree
        state: present
```

```bash
ansible-playbook admin.yml
```

:::lang fr
**✅ Vérification :** au 1er passage, `apt` installe `tree` et `jq` (`changed`), puis les `--version` s'exécutent. **Relance** : `apt` passe `ok` (déjà présents, idempotence). Pour retirer : `state: absent` (+ `autoremove: true` pour les dépendances orphelines). Le module `package` fait pareil sans que tu précises apt/dnf — utile pour un rôle multi-distro.
:::

:::lang en
**✅ Check:** on the 1st pass, `apt` installs `tree` and `jq` (`changed`), then the `--version` commands run. **Rerun**: `apt` goes `ok` (already present, idempotence). To remove: `state: absent` (+ `autoremove: true` for orphaned deps). The `package` module does the same without you specifying apt/dnf — useful for a multi-distro role.
:::

### step-04

:::lang fr
**Objectif.** Piloter un **service** : le démarrer, l'activer au boot, le redémarrer. ⚠️ **Nécessite systemd → ta VM de parc.**

**🤔 `started` vs `enabled`.** Deux axes indépendants : `state: started` = tourne **maintenant** ; `enabled: true` = démarrera **au prochain boot**. On veut presque toujours **les deux** pour un service de prod. `restarted`/`reloaded` forcent l'action (souvent via un handler après un changement de config).

Sur ta VM `web1` (inventaire du guide 1), joue :
:::

:::lang en
**Goal.** Drive a **service**: start it, enable it at boot, restart it. ⚠️ **Needs systemd → your fleet VM.**

**🤔 `started` vs `enabled`.** Two independent axes: `state: started` = running **now**; `enabled: true` = will start **at next boot**. You almost always want **both** for a prod service. `restarted`/`reloaded` force the action (often via a handler after a config change).

On your `web1` VM (inventory from guide 1), run:
:::

```yaml
- name: Gérer un service (sur une VM avec systemd)
  hosts: web            # ta VM de parc / your fleet VM
  become: true
  tasks:
    - name: nginx installé
      ansible.builtin.apt: { name: nginx, state: present, update_cache: true }

    - name: nginx démarré ET activé au boot
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: Vérifier l'état
      ansible.builtin.command: systemctl is-enabled nginx
      register: en
      changed_when: false

    - name: Montrer
      ansible.builtin.debug:
        msg: "nginx enabled = {{ en.stdout }}"
```

:::lang fr
**✅ Vérification (sur la VM) :** la tâche `service` est `changed` au 1er passage, et `systemctl is-enabled nginx` renvoie `enabled`. `systemctl is-active nginx` (à la main) renvoie `active`. Relance : `ok`. ⚠️ **Sur `localhost` dans un conteneur, cette étape échoue** avec `System has not been booted with systemd` — c'est normal, un conteneur n'a pas systemd. Utilise ta VM Multipass. Pour redémarrer après un changement de config, on met `state: restarted` dans un **handler** (guide *tâches avancées*).
:::

:::lang en
**✅ Check (on the VM):** the `service` task is `changed` on the 1st pass, and `systemctl is-enabled nginx` returns `enabled`. `systemctl is-active nginx` (by hand) returns `active`. Rerun: `ok`. ⚠️ **On `localhost` in a container, this step fails** with `System has not been booted with systemd` — that's normal, a container has no systemd. Use your Multipass VM. To restart after a config change, put `state: restarted` in a **handler** (*advanced tasks* guide).
:::

### step-05

:::lang fr
**Objectif.** Planifier une **tâche cron** — testable en local.

**🤔 Le `name` est une clé.** Le paramètre `name` du module `cron` n'est pas décoratif : c'est **l'identifiant unique** du job (écrit en commentaire `#Ansible: <name>` dans la crontab). Rejouer avec le même `name` **met à jour** le job existant au lieu d'en créer un doublon. C'est ça, l'idempotence de cron.

Ajoute à `admin.yml` (ou un playbook dédié) :
:::

:::lang en
**Goal.** Schedule a **cron task** — testable locally.

**🤔 `name` is a key.** The `cron` module's `name` parameter isn't decorative: it's the job's **unique identifier** (written as a `#Ansible: <name>` comment in the crontab). Rerunning with the same `name` **updates** the existing job instead of creating a duplicate. That's cron idempotence.

Add to `admin.yml` (or a dedicated playbook):
:::

```yaml
    - name: Une sauvegarde quotidienne à 3h du matin
      ansible.builtin.cron:
        name: "sauvegarde atelier"
        minute: "0"
        hour: "3"
        job: "/usr/local/bin/backup.sh"
        user: root
        state: present

    - name: Un job au reboot avec special_time
      ansible.builtin.cron:
        name: "nettoyage au demarrage"
        special_time: reboot
        job: "/usr/local/bin/cleanup.sh"

    - name: Poser un PATH dans la crontab
      ansible.builtin.cron:
        name: PATH
        env: true
        value: /usr/local/bin:/usr/bin:/bin
```

```bash
ansible-playbook admin.yml
crontab -l -u root       # ou sudo crontab -l / or sudo crontab -l
```

:::lang fr
**✅ Vérification :** `crontab -l -u root` (ou `sudo crontab -l`) montre les deux jobs avec leur commentaire `#Ansible: sauvegarde atelier` et `#Ansible: nettoyage au demarrage`, plus la ligne `PATH=/usr/local/bin:...`. La ligne horaire est `0 3 * * *` pour la sauvegarde et `@reboot` pour le nettoyage. **Relance** le playbook : `ok` partout, **aucun doublon** — la clé `name` fait l'idempotence. Retire un job avec `state: absent` (+ le même `name`).
:::

:::lang en
**✅ Check:** `crontab -l -u root` (or `sudo crontab -l`) shows both jobs with their `#Ansible: sauvegarde atelier` and `#Ansible: nettoyage au demarrage` comments, plus the `PATH=/usr/local/bin:...` line. The time line is `0 3 * * *` for the backup and `@reboot` for the cleanup. **Rerun** the playbook: `ok` everywhere, **no duplicate** — the `name` key does the idempotence. Remove a job with `state: absent` (+ the same `name`).
:::

### step-06

:::lang fr
**Objectif.** Ouvrir un **pare-feu**. ⚠️ **Nécessite firewalld (RHEL) ou ufw (Debian) → ta VM.**

**🤔 Le geste RHCE.** `firewalld` est le pare-feu de RHEL, et le module `ansible.posix.firewalld` est un objectif d'examen direct. Deux paramètres essentiels vont **ensemble** : `permanent: true` (persiste au reboot) **et** `immediate: true` (applique tout de suite). Oublier `immediate` = la règle n'est active qu'après un `reload`. Oublier `permanent` = elle disparaît au reboot.

Sur une VM **RHEL/Fedora** :
:::

:::lang en
**Goal.** Open a **firewall**. ⚠️ **Needs firewalld (RHEL) or ufw (Debian) → your VM.**

**🤔 The RHCE move.** `firewalld` is RHEL's firewall, and the `ansible.posix.firewalld` module is a direct exam objective. Two essential parameters go **together**: `permanent: true` (persists across reboot) **and** `immediate: true` (applies right away). Forgetting `immediate` = the rule is active only after a `reload`. Forgetting `permanent` = it disappears at reboot.

On a **RHEL/Fedora** VM:
:::

```yaml
- name: Ouvrir le pare-feu (RHEL/firewalld)
  hosts: web
  become: true
  tasks:
    - name: Autoriser le service http
      ansible.posix.firewalld:
        service: http
        state: enabled
        permanent: true
        immediate: true       # applique sans reload / applies without reload

    - name: Autoriser un port précis (8080/tcp)
      ansible.posix.firewalld:
        port: 8080/tcp
        state: enabled
        permanent: true
        immediate: true
```

:::lang fr
Sur ta VM **Ubuntu** de parc, l'équivalent avec `community.general.ufw` :
:::

:::lang en
On your **Ubuntu** fleet VM, the equivalent with `community.general.ufw`:
:::

```yaml
    - name: Autoriser un port (Ubuntu/ufw)
      community.general.ufw:
        rule: allow
        port: "8080"
        proto: tcp
```

:::lang fr
**✅ Vérification (sur la VM) :** avec firewalld, `firewall-cmd --list-services` inclut `http` et `firewall-cmd --list-ports` inclut `8080/tcp`. Avec ufw, `ufw status` montre `8080/tcp ALLOW`. Relance : `ok` (idempotence). ⚠️ Le module `ansible.posix.firewalld` vit dans la **collection** `ansible.posix` (préinstallée sur un paquet `ansible`, sinon `ansible-galaxy collection install ansible.posix`). Sur `localhost` sans firewalld, l'étape échoue — c'est attendu.
:::

:::lang en
**✅ Check (on the VM):** with firewalld, `firewall-cmd --list-services` includes `http` and `firewall-cmd --list-ports` includes `8080/tcp`. With ufw, `ufw status` shows `8080/tcp ALLOW`. Rerun: `ok` (idempotence). ⚠️ The `ansible.posix.firewalld` module lives in the `ansible.posix` **collection** (preinstalled on an `ansible` package, otherwise `ansible-galaxy collection install ansible.posix`). On `localhost` without firewalld, the step fails — that's expected.
:::

### step-07

:::lang fr
**Objectif.** Provisionner un **volume LVM** puis l'étendre. ⚠️ **Nécessite un disque → ta VM (fichier loopback).**

**🤔 La chaîne complète.** LVM se fait en quatre modules : `lvg` (créer le *volume group* sur un disque physique), `lvol` (créer/étendre le *logical volume*), `filesystem` (le formater), `mount` (le monter + l'écrire dans `/etc/fstab`). L'étape « étendre » (`size: +100%FREE` ou une taille cible, avec `resizefs: true`) est celle qui tombe le plus souvent : agrandir un volume sans perdre les données.

Sur ta VM, avec un disque de test loopback (comme au track Linux) :
:::

:::lang en
**Goal.** Provision an **LVM volume** then extend it. ⚠️ **Needs a disk → your VM (loopback file).**

**🤔 The full chain.** LVM is done in four modules: `lvg` (create the *volume group* on a physical disk), `lvol` (create/extend the *logical volume*), `filesystem` (format it), `mount` (mount it + write to `/etc/fstab`). The "extend" step (`size: +100%FREE` or a target size, with `resizefs: true`) is the one that comes up most often: grow a volume without losing data.

On your VM, with a loopback test disk (like in the Linux track):
:::

```yaml
- name: Provisionner un volume LVM (sur une VM avec un disque)
  hosts: web
  become: true
  vars:
    disque: /dev/loop-atelier      # remplace par un vrai disque/loop / real disk or loop
  tasks:
    - name: Créer le volume group
      community.general.lvg:
        vg: vg_atelier
        pvs: "{{ disque }}"

    - name: Créer un logical volume de 200 Mo
      community.general.lvol:
        vg: vg_atelier
        lv: lv_data
        size: 200m

    - name: Formater en ext4
      community.general.filesystem:
        fstype: ext4
        dev: /dev/vg_atelier/lv_data

    - name: Monter et persister dans fstab
      ansible.posix.mount:
        path: /srv/data
        src: /dev/vg_atelier/lv_data
        fstype: ext4
        state: mounted

    - name: L'ÉTENDRE à 400 Mo (avec resize du filesystem)
      community.general.lvol:
        vg: vg_atelier
        lv: lv_data
        size: 400m
        resizefs: true       # agrandit aussi le système de fichiers / grows the FS too
```

:::lang fr
**✅ Vérification (sur la VM) :** après le play, `lsblk` et `vgs`/`lvs` montrent `vg_atelier` et `lv_data` ; `df -h /srv/data` montre le point de montage. Après la tâche d'extension, `df -h /srv/data` affiche **~400 Mo** — le volume **et** le système de fichiers ont grandi, sans démontage ni perte de données. `mount: state: mounted` a aussi ajouté la ligne dans `/etc/fstab` (persistance au reboot). ⚠️ Ces modules vivent dans `community.general` et `ansible.posix` ; il faut un vrai disque (un fichier loopback attaché convient, cf. track Linux).
:::

:::lang en
**✅ Check (on the VM):** after the play, `lsblk` and `vgs`/`lvs` show `vg_atelier` and `lv_data`; `df -h /srv/data` shows the mount point. After the extend task, `df -h /srv/data` shows **~400 MB** — the volume **and** the filesystem grew, with no unmount or data loss. `mount: state: mounted` also added the line to `/etc/fstab` (reboot persistence). ⚠️ These modules live in `community.general` and `ansible.posix`; you need a real disk (an attached loopback file works, see Linux track).
:::

## pitfalls

:::lang fr
**1. `groups:` sans `append: true`.** Tu **écrases** les groupes secondaires existants de l'utilisateur. Pour ajouter sans casser, **toujours** `append: true`.

**2. Mot de passe en clair dans `user: password:`.** Le champ attend un **hash**. Passe par `password_hash('sha512')`, et idéalement une variable **Vault**. Un clair y serait stocké tel quel (cassé).

**3. Mot de passe toujours `changed`.** Sans `update_password: on_create`, `password_hash` regénère un sel à chaque run → fausse non-idempotence. Ajoute `on_create` (ou un sel fixe explicite).

**4. `command`/`shell` au lieu du module.** `useradd`, `systemctl enable`, `crontab -e` via `shell` cassent l'idempotence. Utilise `user`, `service`, `cron`. Règle absolue de l'examen.

**5. `firewalld` sans `immediate` OU sans `permanent`.** `permanent: true` seul = règle absente jusqu'au prochain `reload`. `immediate: true` seul = règle perdue au reboot. Il faut **les deux** pour une règle durable et active.

**6. `state: started` en croyant activer au boot.** `started` = tourne maintenant, pas au boot. Pour le boot, c'est `enabled: true`. Les deux sont indépendants — mets les deux pour un service de prod.

**7. Étendre un LV en oubliant `resizefs`.** `lvol` agrandit le **volume** mais pas le **système de fichiers** dessus. Sans `resizefs: true`, `df` ne voit pas la place ajoutée. (Équivaut à `lvextend` + `resize2fs` à la main.)

**8. Tester services/pare-feu/LVM sur `localhost` en conteneur.** Pas de systemd, pas de firewalld, pas de disque → ça échoue. Ces trois blocs se testent sur une **vraie VM** (ton parc Multipass).
:::

:::lang en
**1. `groups:` without `append: true`.** You **overwrite** the user's existing secondary groups. To add without breaking, **always** `append: true`.

**2. Clear password in `user: password:`.** The field expects a **hash**. Go through `password_hash('sha512')`, ideally a **Vault** variable. Clear text would be stored as-is (broken).

**3. Password always `changed`.** Without `update_password: on_create`, `password_hash` regenerates a salt each run → false non-idempotence. Add `on_create` (or an explicit fixed salt).

**4. `command`/`shell` instead of the module.** `useradd`, `systemctl enable`, `crontab -e` via `shell` break idempotence. Use `user`, `service`, `cron`. Absolute exam rule.

**5. `firewalld` without `immediate` OR without `permanent`.** `permanent: true` alone = rule absent until the next `reload`. `immediate: true` alone = rule lost at reboot. You need **both** for a durable, active rule.

**6. `state: started` thinking it enables at boot.** `started` = running now, not at boot. For boot, it's `enabled: true`. Both are independent — set both for a prod service.

**7. Extending an LV forgetting `resizefs`.** `lvol` grows the **volume** but not the **filesystem** on it. Without `resizefs: true`, `df` doesn't see the added space. (Equivalent to `lvextend` + `resize2fs` by hand.)

**8. Testing services/firewall/LVM on `localhost` in a container.** No systemd, no firewalld, no disk → it fails. These three blocks are tested on a **real VM** (your Multipass fleet).
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu crées un groupe + un utilisateur avec `append: true` et tu vérifies avec `id`.
- [ ] Tu poses un mot de passe **haché** (`$6$`) idempotent (`update_password: on_create`).
- [ ] Tu installes une liste de paquets (`present` vs `latest`) idempotente.
- [ ] Tu démarres **et** actives un service (`started` + `enabled`) sur ta VM.
- [ ] Tu planifies une tâche `cron` (clé `name`, `special_time`) sans doublon.
- [ ] Tu ouvres un port avec `firewalld` (`permanent` + `immediate`) sur ta VM.
- [ ] Tu crées puis **étends** un LV avec `resizefs: true` sur ta VM.

Sept cases = tu administres un système entièrement par Ansible. La suite : le **projet d'entreprise** RHCE.
:::

:::lang en
You know it works when…

- [ ] You create a group + a user with `append: true` and verify with `id`.
- [ ] You set a **hashed** (`$6$`) idempotent password (`update_password: on_create`).
- [ ] You install a package list (`present` vs `latest`) idempotently.
- [ ] You start **and** enable a service (`started` + `enabled`) on your VM.
- [ ] You schedule a `cron` task (`name` key, `special_time`) with no duplicate.
- [ ] You open a port with `firewalld` (`permanent` + `immediate`) on your VM.
- [ ] You create then **extend** an LV with `resizefs: true` on your VM.

Seven boxes = you administer a system entirely via Ansible. Next up: the RHCE **enterprise project**.
:::

## next

:::lang fr
La fin du track RHCE :

1. **Ansible — projet d'entreprise** : le capstone qui assemble **tout** — inventaire à groupes, rôles réutilisables, templates Jinja2, secrets Vault, et ces modules d'administration système — dans un `site.yml` complet qui provisionne un parc web + db + load-balancer. Ton livrable de CV.
:::

:::lang en
The end of the RHCE track:

1. **Ansible — enterprise project**: the capstone assembling **everything** — grouped inventory, reusable roles, Jinja2 templates, Vault secrets, and these system-administration modules — into a complete `site.yml` provisioning a web + db + load-balancer fleet. Your CV deliverable.
:::

## cheatsheet

:::lang fr
Aide-mémoire modules d'administration.
:::

:::lang en
Administration modules cheat sheet.
:::

```yaml
# Identité / Identity
- ansible.builtin.group: { name: atelier, state: present }
- ansible.builtin.user:
    name: deploy
    groups: [atelier]
    append: true                 # AJOUTE (sinon écrase) / ADD (else overwrite)
    shell: /bin/bash
    password: "{{ 'x' | password_hash('sha512') }}"
    update_password: on_create   # idempotence du hash / hash idempotence
    state: present               # absent + remove: true pour supprimer / to delete

# Paquets / Packages
- ansible.builtin.apt: { name: [tree, jq], state: present, update_cache: true }
- ansible.builtin.package: { name: tree, state: present }   # générique / generic

# Services (systemd → VM)
- ansible.builtin.service: { name: nginx, state: started, enabled: true }

# Cron
- ansible.builtin.cron:
    name: "sauvegarde"           # clé unique / unique key
    minute: "0" ; hour: "3"
    job: "/usr/local/bin/backup.sh"
    # special_time: reboot|daily|weekly   |   env: true + value: pour une var

# Pare-feu (VM) / Firewall (VM)
- ansible.posix.firewalld: { service: http, state: enabled, permanent: true, immediate: true }
- community.general.ufw:  { rule: allow, port: "8080", proto: tcp }   # Debian

# LVM (VM)
- community.general.lvg:  { vg: vg1, pvs: /dev/sdb }
- community.general.lvol: { vg: vg1, lv: data, size: 400m, resizefs: true }
- ansible.posix.mount:    { path: /srv/data, src: /dev/vg1/data, fstype: ext4, state: mounted }
```

## resources

:::lang fr
- [Module `user`](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/user_module.html) — comptes, groupes, mots de passe.
- [Module `service` / `systemd_service`](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/systemd_service_module.html) — services au boot.
- [Module `cron`](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/cron_module.html) — tâches planifiées.
- [Module `ansible.posix.firewalld`](https://docs.ansible.com/ansible/latest/collections/ansible/posix/firewalld_module.html) — pare-feu RHEL.
- [Modules LVM `community.general`](https://docs.ansible.com/ansible/latest/collections/community/general/lvol_module.html) — `lvg`, `lvol`, `filesystem`.
- [Objectifs RHCE / EX294](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — la certification visée.
:::

:::lang en
- [`user` module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/user_module.html) — accounts, groups, passwords.
- [`service` / `systemd_service` module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/systemd_service_module.html) — services at boot.
- [`cron` module](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/cron_module.html) — scheduled tasks.
- [`ansible.posix.firewalld` module](https://docs.ansible.com/ansible/latest/collections/ansible/posix/firewalld_module.html) — RHEL firewall.
- [LVM `community.general` modules](https://docs.ansible.com/ansible/latest/collections/community/general/lvol_module.html) — `lvg`, `lvol`, `filesystem`.
- [RHCE / EX294 objectives](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — the target certification.
:::

## troubleshooting

:::lang fr
**`System has not been booted with systemd`.** Tu joues une tâche `service` sur un conteneur sans systemd (`localhost`). Utilise une vraie VM (ta VM Multipass de parc).

**Ma tâche `user` est toujours `changed`.** Le mot de passe est rehashé à chaque run. Ajoute `update_password: on_create`.

**L'utilisateur a perdu ses autres groupes.** Tu as oublié `append: true` — `groups:` a écrasé la liste. Rejoue avec `append: true`.

**`firewalld` : ma règle disparaît au reboot / n'est pas active.** Il manque `permanent: true` (persistance) ou `immediate: true` (application immédiate). Mets les deux.

**`ModuleNotFoundError` / `couldn't resolve module ansible.posix.firewalld`.** La collection n'est pas installée. `ansible-galaxy collection install ansible.posix` (ou `community.general` pour LVM/ufw).

**`df` ne montre pas la place après `lvol`.** Tu as agrandi le volume mais pas le système de fichiers. Ajoute `resizefs: true` à la tâche `lvol`.

**`cron` crée un doublon à chaque run.** Tu as changé (ou oublié) le paramètre `name`. Le `name` est la clé d'idempotence : garde-le stable.
:::

:::lang en
**`System has not been booted with systemd`.** You're running a `service` task on a container without systemd (`localhost`). Use a real VM (your Multipass fleet VM).

**My `user` task is always `changed`.** The password is rehashed each run. Add `update_password: on_create`.

**The user lost their other groups.** You forgot `append: true` — `groups:` overwrote the list. Rerun with `append: true`.

**`firewalld`: my rule disappears at reboot / isn't active.** Missing `permanent: true` (persistence) or `immediate: true` (immediate apply). Set both.

**`ModuleNotFoundError` / `couldn't resolve module ansible.posix.firewalld`.** The collection isn't installed. `ansible-galaxy collection install ansible.posix` (or `community.general` for LVM/ufw).

**`df` doesn't show the space after `lvol`.** You grew the volume but not the filesystem. Add `resizefs: true` to the `lvol` task.

**`cron` creates a duplicate each run.** You changed (or omitted) the `name` parameter. `name` is the idempotence key: keep it stable.
:::
