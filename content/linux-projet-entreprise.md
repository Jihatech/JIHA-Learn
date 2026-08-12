---
# — Identité (ne change JAMAIS une fois publié) —
id: linux-projet-entreprise
slug: linux-projet-entreprise
order: 9
status: published

# — Titres & accroches (bilingue) —
title_fr: "Linux — projet d'entreprise : serveur durci"
title_en: "Linux — enterprise project: hardened server"
tagline_fr: "Users, LVM, service, backup, SSH, pare-feu, script."
tagline_en: "Users, LVM, service, backup, SSH, firewall, script."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 300
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [linux-scripting-bash]
next: [git-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [provisionnement-serveur, equipe-sudo, stockage-lvm, service-systemd, sauvegarde-planifiee, durcissement-ssh-pare-feu, automatisation-runbook]
concepts_en: [server-provisioning, team-sudo, lvm-storage, systemd-service, scheduled-backup, ssh-firewall-hardening, automation-runbook]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le projet fil-rouge Linux LPIC-1 : provisionne et durcis un serveur Ubuntu multi-utilisateur de A à Z — équipe et sudo au moindre privilège, volume de données LVM, service systemd, sauvegarde planifiée, SSH par clés durci, pare-feu ufw, et un script d'automatisation idempotent — le tout documenté en runbook. Un livrable d'administration système pour ton CV."
og_description_en: "The Linux LPIC-1 capstone project: provision and harden a multi-user Ubuntu server end to end — a team with least-privilege sudo, an LVM data volume, a systemd service, a scheduled backup, hardened key-based SSH, a ufw firewall, and an idempotent automation script — all documented as a runbook. A sysadmin deliverable for your CV."
---

## intro

:::lang fr
Tu as appris les briques de l'admin Linux — paquets, users, disques, systemd, réseau, scripting. **Un recruteur veut voir un serveur, pas des commandes isolées.** Ce projet est ce serveur : une machine Ubuntu **provisionnée et durcie de A à Z**, comme en production, que tu construis toi-même et que tu mets sur ton CV et ton GitHub.

**Le scénario.** Tu es l'administrateur système embauché pour mettre en service le **serveur applicatif** d'une PME, *Atelier Média*. Ta mission : un serveur **multi-utilisateur, sécurisé et exploitable**, prêt pour une équipe. Tu vas livrer :

- une **équipe** (groupe partagé, comptes) avec un **sudo au moindre privilège** ;
- un **volume de données LVM** monté pour l'application ;
- un **service systemd** applicatif + une **sauvegarde planifiée** ;
- un accès **SSH par clés durci** et un **pare-feu ufw** ;
- un **script de provisionnement** idempotent + un **health-check**, et un **runbook** documenté.

**Tout tourne dans une VM Multipass**, en local — mais c'est **exactement** ce qu'on fait sur un vrai VPS/serveur cloud. Ce projet réunit **les six guides** de la track.

**Ce que ça prouve à un recruteur :** que tu sais **provisionner et sécuriser** un serveur complet — pas juste taper des commandes — avec gestion d'équipe, stockage, services, sauvegardes, durcissement réseau et **automatisation**, le tout **documenté**.

**Pour qui c'est :** tu as terminé les six guides Linux de la track.
:::

:::lang en
You've learned the bricks of Linux administration — packages, users, disks, systemd, networking, scripting. **A recruiter wants to see a server, not isolated commands.** This project is that server: an Ubuntu machine **provisioned and hardened end to end**, like in production, that you build yourself and put on your CV and GitHub.

**The scenario.** You're the sysadmin hired to bring an SME's **application server** online, *Atelier Média*. Your mission: a **multi-user, secure, operable** server, ready for a team. You'll deliver:

- a **team** (shared group, accounts) with **least-privilege sudo**;
- an **LVM data volume** mounted for the application;
- a systemd **application service** + a **scheduled backup**;
- **hardened key-based SSH** access and a **ufw firewall**;
- an idempotent **provisioning script** + a **health-check**, and a documented **runbook**.

**Everything runs in a Multipass VM**, locally — but it's **exactly** what you do on a real VPS/cloud server. This project brings together **all six guides** of the track.

**What it proves to a recruiter:** that you can **provision and secure** a full server — not just type commands — with team management, storage, services, backups, network hardening and **automation**, all **documented**.

**Who it's for:** you've finished the six Linux track guides.
:::

## objectives

:::lang fr
À la fin de ce projet, tu auras produit et su expliquer :

- Une **équipe** (groupe + comptes) et une règle **sudo** ciblée.
- Un **volume LVM** monté au démarrage (fstab/UUID) pour les données.
- Un **service systemd** applicatif et sa **sauvegarde planifiée** (timer).
- Un **accès SSH par clés** et un serveur **durci** (sshd + ufw).
- Un **script de provisionnement** idempotent et un **health-check**.
- Un **runbook** (README) de niveau professionnel.
:::

:::lang en
By the end of this project, you'll have produced and be able to explain:

- A **team** (group + accounts) and a targeted **sudo** rule.
- An **LVM volume** mounted at boot (fstab/UUID) for data.
- A systemd **application service** and its **scheduled backup** (timer).
- **Key-based SSH** access and a **hardened** server (sshd + ufw).
- An idempotent **provisioning script** and a **health-check**.
- A professional-grade **runbook** (README).
:::

## prerequisites

:::lang fr
Tu dois avoir :

- **Toute la track Linux** terminée (fondamentaux → scripting).
- **Multipass** installé (une VM te donne un vrai serveur systemd, avec console de secours).
- **Git** installé.
- ~2-3 h.

Lance une VM propre et un dépôt :
:::

:::lang en
You should have:

- **The whole Linux track** finished (fundamentals → scripting).
- **Multipass** installed (a VM gives you a real systemd server, with a rescue console).
- **Git** installed.
- ~2-3 h.

Launch a fresh VM and a repo:
:::

```bash
multipass launch --name atelier --disk 5G
multipass shell atelier          # tu es maintenant DANS le serveur / you're now INSIDE the server
mkdir -p ~/atelier-runbook/scripts && cd ~/atelier-runbook && git init
sudo apt update && sudo apt install -y lvm2 ufw
```

## concepts

:::lang fr
**L'architecture du serveur.** On assemble, couche par couche, ce que chaque guide a enseigné :

- **Identités** (guide users) — un **groupe d'équipe** `atelier`, des comptes, et une règle **`sudo`** qui n'accorde que le **redémarrage du service** (moindre privilège).
- **Stockage** (guide disques) — un **volume LVM** dédié aux données de l'app, monté sur `/srv/atelier` par **UUID** dans `fstab`, avec un **SGID** de groupe pour le partage d'équipe.
- **Service** (guide systemd) — une **unit `.service`** qui fait tourner l'application (un serveur web simple sur le volume de données), démarrée au boot.
- **Sauvegarde** (guides systemd + scripting) — un **script** qui archive `/srv/atelier`, déclenché par un **timer systemd** quotidien.
- **Accès & réseau** (guide réseau/sécurité) — **SSH par clés**, serveur **durci** (`PermitRootLogin no`, `PasswordAuthentication no`), et un **pare-feu ufw** (deny par défaut, SSH + le port de l'app autorisés).
- **Automatisation** (guide scripting) — un **`provision.sh`** idempotent qui rejoue toute la configuration, et un **`healthcheck.sh`** qui audite l'état.

**Le fil rouge : idempotence & documentation.** Un serviteur qu'on doit reconstruire à l'identique, un incident à diagnostiquer, un collègue à qui passer la main — tout cela exige que la config soit **scriptée** (rejouable) et **documentée** (un runbook). C'est ce qui sépare le bricolage manuel de l'**administration professionnelle**.
:::

:::lang en
**The server architecture.** We assemble, layer by layer, what each guide taught:

- **Identities** (users guide) — a **team group** `atelier`, accounts, and a **`sudo`** rule that only grants **restarting the service** (least privilege).
- **Storage** (disks guide) — an **LVM volume** dedicated to the app's data, mounted at `/srv/atelier` by **UUID** in `fstab`, with a group **SGID** for team sharing.
- **Service** (systemd guide) — a **`.service` unit** running the application (a simple web server on the data volume), started at boot.
- **Backup** (systemd + scripting guides) — a **script** that archives `/srv/atelier`, triggered by a daily **systemd timer**.
- **Access & network** (networking/security guide) — **key-based SSH**, a **hardened** server (`PermitRootLogin no`, `PasswordAuthentication no`), and a **ufw firewall** (default deny, SSH + the app port allowed).
- **Automation** (scripting guide) — an idempotent **`provision.sh`** that replays the whole configuration, and a **`healthcheck.sh`** that audits state.

**The through-line: idempotence & documentation.** A server you must rebuild identically, an incident to diagnose, a colleague to hand off to — all of it demands the config be **scripted** (replayable) and **documented** (a runbook). That's what separates manual tinkering from **professional administration**.
:::

:::figure linux-server-architecture
caption_fr: "Schéma 1. Équipe+sudo → volume LVM (/srv/atelier) → service systemd → sauvegarde (timer) ; SSH durci + ufw filtrent l'accès ; provision.sh & healthcheck.sh automatisent."
caption_en: "Figure 1. Team+sudo → LVM volume (/srv/atelier) → systemd service → backup (timer); hardened SSH + ufw filter access; provision.sh & healthcheck.sh automate."
:::

:::lang fr
Le plan : équipe & sudo → volume LVM → service → sauvegarde planifiée → SSH & pare-feu → automatisation → documentation & démo.
:::

:::lang en
The plan: team & sudo → LVM volume → service → scheduled backup → SSH & firewall → automation → docs & demo.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Créer l'**équipe** : un groupe partagé, des comptes, et un **sudo** au moindre privilège.

Crée le groupe et deux membres, puis une règle sudo ciblée :
:::

:::lang en
**Goal.** Create the **team**: a shared group, accounts, and **least-privilege sudo**.

Create the group and two members, then a targeted sudo rule:
:::

```bash
sudo groupadd atelier
sudo useradd -m -s /bin/bash -G atelier marie
sudo useradd -m -s /bin/bash -G atelier karim

# sudo au moindre privilège : l'équipe peut redémarrer le service, rien d'autre
# least-privilege sudo: the team may restart the service, nothing else
echo '%atelier ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart atelier' | sudo tee /etc/sudoers.d/atelier
sudo visudo -cf /etc/sudoers.d/atelier      # VALIDE la syntaxe / VALIDATE syntax
```

:::lang fr
**✅ Vérification :** `id marie` montre son appartenance au groupe **`atelier`** (secondaire). `visudo -cf /etc/sudoers.d/atelier` répond **`parsed OK`**. La règle `%atelier` (le `%` = un **groupe**) autorise **tous** les membres de l'équipe à faire **une seule** action root — `systemctl restart atelier` — et **rien d'autre**. C'est le **moindre privilège** appliqué à une équipe : on délègue l'exploitation du service sans donner les clés du serveur.
:::

:::lang en
**✅ Check:** `id marie` shows her membership in the **`atelier`** group (secondary). `visudo -cf /etc/sudoers.d/atelier` answers **`parsed OK`**. The `%atelier` rule (the `%` = a **group**) allows **all** team members to perform **one** root action — `systemctl restart atelier` — and **nothing else**. That's **least privilege** applied to a team: you delegate operating the service without handing over the server's keys.
:::

### step-02

:::lang fr
**Objectif.** Provisionner le **volume de données LVM**, monté sur `/srv/atelier`, partagé par l'équipe.

**🤔 Disque virtuel sûr.** Comme au guide disques, on utilise un **fichier loopback** comme disque — zéro risque. Crée le volume :
:::

:::lang en
**Goal.** Provision the **LVM data volume**, mounted at `/srv/atelier`, shared by the team.

**🤔 Safe virtual disk.** Like the disks guide, we use a **loopback file** as a disk — zero risk. Create the volume:
:::

```bash
sudo fallocate -l 1G /var/lib/atelier-disk.img
LOOP=$(sudo losetup --show -f /var/lib/atelier-disk.img)
sudo pvcreate "$LOOP" && sudo vgcreate vg_atelier "$LOOP"
sudo lvcreate -L 800M -n data vg_atelier
sudo mkfs.ext4 /dev/vg_atelier/data

sudo mkdir -p /srv/atelier
UUID=$(sudo blkid -s UUID -o value /dev/vg_atelier/data)
echo "UUID=$UUID  /srv/atelier  ext4  defaults  0  2" | sudo tee -a /etc/fstab
sudo mount -a                                   # monte via fstab / mount via fstab

# partage d'équipe : groupe atelier + SGID (héritage de groupe) / team sharing: group + SGID
sudo chgrp atelier /srv/atelier && sudo chmod 2775 /srv/atelier
```

:::lang fr
**✅ Vérification :** `df -h /srv/atelier` montre le volume LVM **monté** (~750 Mo). Un `sudo mount -a` **sans erreur** valide ta ligne `fstab` (par **UUID**, stable). `ls -ld /srv/atelier` affiche `drwxrwsr-x … atelier` : le **SGID** (`s`) fait que tout fichier créé par un membre de l'équipe **appartient au groupe `atelier`** — le répertoire partagé collaboratif. Les données de l'app vivront ici, **séparées** du système, sur un volume qu'on pourra agrandir (LVM).
:::

:::lang en
**✅ Check:** `df -h /srv/atelier` shows the LVM volume **mounted** (~750 MB). A `sudo mount -a` **with no error** validates your `fstab` line (by **UUID**, stable). `ls -ld /srv/atelier` shows `drwxrwsr-x … atelier`: the **SGID** (`s`) makes every file created by a team member **belong to the `atelier` group** — the collaborative shared directory. The app's data will live here, **separate** from the system, on a volume you can grow (LVM).
:::

### step-03

:::lang fr
**Objectif.** Déployer l'**application** comme un **service systemd** qui sert le volume de données.

**🤔 Une vraie unit.** L'app est un serveur web simple (Python) qui publie `/srv/atelier` sur le port 8080. Sème une page, puis crée le service :
:::

:::lang en
**Goal.** Deploy the **application** as a **systemd service** serving the data volume.

**🤔 A real unit.** The app is a simple web server (Python) publishing `/srv/atelier` on port 8080. Seed a page, then create the service:
:::

```bash
echo "<h1>Atelier Média — serveur applicatif</h1>" | sudo tee /srv/atelier/index.html

sudo tee /etc/systemd/system/atelier.service >/dev/null <<'EOF'
[Unit]
Description=Application Atelier Média
After=network.target

[Service]
ExecStart=/usr/bin/python3 -m http.server 8080 --directory /srv/atelier
Restart=on-failure
User=www-data

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now atelier              # démarre ET active au boot / start AND enable at boot
systemctl status atelier --no-pager | head -5
curl -s localhost:8080 | grep Atelier            # l'app répond / the app answers
```

:::lang fr
**✅ Vérification :** `systemctl status atelier` est **`active (running)`**, et `curl localhost:8080` renvoie ta page `Atelier Média` — l'app **sert le volume de données** (`/srv/atelier`) via un **service systemd** géré, démarré au boot (`enable --now`). Elle tourne sous l'utilisateur **`www-data`** (pas root — principe de moindre privilège pour les services). Tu as transformé un simple programme en **service exploitable** : supervisé, redémarrable (`Restart=on-failure`), persistant.
:::

:::lang en
**✅ Check:** `systemctl status atelier` is **`active (running)`**, and `curl localhost:8080` returns your `Atelier Média` page — the app **serves the data volume** (`/srv/atelier`) via a managed **systemd service**, started at boot (`enable --now`). It runs as the **`www-data`** user (not root — least privilege for services). You've turned a plain program into an **operable service**: supervised, restartable (`Restart=on-failure`), persistent.
:::

### step-04

:::lang fr
**Objectif.** Automatiser la **sauvegarde** : un script + un **timer systemd** quotidien.

Crée le script de sauvegarde dans le dépôt, puis le couple service+timer :
:::

:::lang en
**Goal.** Automate the **backup**: a script + a daily **systemd timer**.

Create the backup script in the repo, then the service+timer pair:
:::

```bash
tee ~/atelier-runbook/scripts/backup.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
src="/srv/atelier"
dest="/var/backups/atelier"
mkdir -p "$dest"
horodatage=$(date +%Y%m%d-%H%M%S)
tar czf "$dest/atelier-$horodatage.tar.gz" -C "$src" .
# ne garde que les 7 dernières / keep only the last 7
ls -1t "$dest"/atelier-*.tar.gz | tail -n +8 | xargs -r rm --
echo "sauvegarde OK: $dest/atelier-$horodatage.tar.gz"
EOF
chmod +x ~/atelier-runbook/scripts/backup.sh

sudo tee /etc/systemd/system/atelier-backup.service >/dev/null <<EOF
[Service]
Type=oneshot
ExecStart=$HOME/atelier-runbook/scripts/backup.sh
EOF
sudo tee /etc/systemd/system/atelier-backup.timer >/dev/null <<'EOF'
[Timer]
OnCalendar=daily
Persistent=true
[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now atelier-backup.timer
sudo systemctl start atelier-backup.service      # lance une sauvegarde tout de suite / run one backup now
ls -lh /var/backups/atelier/                      # l'archive est là / the archive is there
```

:::lang fr
**✅ Vérification :** `sudo systemctl start atelier-backup.service` produit immédiatement une archive `atelier-AAAAMMJJ-HHMMSS.tar.gz` dans `/var/backups/atelier/` (via `ls -lh`). `systemctl list-timers atelier-backup.timer` montre le **prochain déclenchement** quotidien (`OnCalendar=daily`), et **`Persistent=true`** garantit qu'une sauvegarde manquée (serveur éteint) est **rattrapée** au démarrage. Le script tourne, **rotationne** (garde 7 archives), et est **planifié** — la sauvegarde n'est plus « quand j'y pense » mais **automatique et fiable**.
:::

:::lang en
**✅ Check:** `sudo systemctl start atelier-backup.service` immediately produces an `atelier-YYYYMMDD-HHMMSS.tar.gz` archive in `/var/backups/atelier/` (via `ls -lh`). `systemctl list-timers atelier-backup.timer` shows the daily **next trigger** (`OnCalendar=daily`), and **`Persistent=true`** guarantees a missed backup (server off) is **caught up** at startup. The script runs, **rotates** (keeps 7 archives), and is **scheduled** — backup is no longer "when I remember" but **automatic and reliable**.
:::

### step-05

:::lang fr
**Objectif.** Sécuriser l'accès : **SSH par clés**, serveur **durci**, et **pare-feu ufw**.

⚠️ **Filet de sécurité.** On est dans une VM : la console `multipass shell` reste accessible quoi qu'il arrive. Génère une clé (pour la démo, sur la VM même), durcis `sshd`, puis ferme le pare-feu :
:::

:::lang en
**Goal.** Secure access: **key-based SSH**, a **hardened** server, and the **ufw firewall**.

⚠️ **Safety net.** We're in a VM: the `multipass shell` console stays accessible no matter what. Generate a key (for the demo, on the VM itself), harden `sshd`, then close the firewall:
:::

```bash
# clé + auto-autorisation (démo) / key + self-authorization (demo)
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys

# durcissement sshd / sshd hardening
sudo tee /etc/ssh/sshd_config.d/99-durci.conf >/dev/null <<'EOF'
PermitRootLogin no
PasswordAuthentication no
EOF
sudo sshd -t && sudo systemctl reload ssh        # VALIDE puis recharge / VALIDATE then reload

# pare-feu : SSH d'abord, puis l'app, puis deny par défaut / firewall: SSH first, then app, then default deny
sudo ufw allow OpenSSH
sudo ufw allow 8080/tcp
sudo ufw default deny incoming && sudo ufw default allow outgoing
sudo ufw --force enable
sudo ufw status verbose
```

:::lang fr
**✅ Vérification :** `sudo sshd -T | grep -iE 'permitrootlogin|passwordauth'` confirme **`no`**/**`no`** (root direct interdit, clés seulement). `sudo ufw status verbose` montre **`deny (incoming)`** par défaut avec **`OpenSSH`** et **`8080/tcp`** autorisés — **seuls** SSH et l'app sont joignables, tout le reste est **fermé**. Le serveur est **durci** : accès par clés uniquement, surface réseau minimale. *(On a autorisé SSH **avant** d'activer le pare-feu — le réflexe qui évite de se verrouiller dehors.)*
:::

:::lang en
**✅ Check:** `sudo sshd -T | grep -iE 'permitrootlogin|passwordauth'` confirms **`no`**/**`no`** (direct root forbidden, keys only). `sudo ufw status verbose` shows default **`deny (incoming)`** with **`OpenSSH`** and **`8080/tcp`** allowed — **only** SSH and the app are reachable, everything else is **closed**. The server is **hardened**: key-only access, minimal network surface. *(We allowed SSH **before** enabling the firewall — the reflex that avoids locking yourself out.)*
:::

### step-06

:::lang fr
**Objectif.** Écrire le **health-check** qui audite le serveur en une commande.

Adapte le script du guide scripting à ce serveur (dans le dépôt) :
:::

:::lang en
**Goal.** Write the **health-check** that audits the server in one command.

Adapt the scripting-guide script to this server (in the repo):
:::

```bash
tee ~/atelier-runbook/scripts/healthcheck.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
probleme=0
verifier() { # $1=libellé $2=commande de test / label + test command
  if eval "$2" >/dev/null 2>&1; then echo "  [OK]   $1"; else echo "  [FAIL] $1" >&2; probleme=1; fi
}
echo "== Health-check Atelier =="
verifier "service atelier actif"      "systemctl is-active --quiet atelier"
verifier "timer sauvegarde armé"      "systemctl is-active --quiet atelier-backup.timer"
verifier "volume /srv/atelier monté"  "mountpoint -q /srv/atelier"
verifier "app répond sur :8080"       "curl -sf localhost:8080"
verifier "pare-feu actif"             "sudo ufw status | grep -q 'Status: active'"
usage=$(df --output=pcent /srv/atelier | tail -1 | tr -dc '0-9')
verifier "disque données < 90%"       "[ $usage -lt 90 ]"
[[ $probleme -eq 0 ]] && { echo "== Serveur sain =="; exit 0; } || { echo "== Problèmes =="; exit 1; }
EOF
chmod +x ~/atelier-runbook/scripts/healthcheck.sh

sudo ~/atelier-runbook/scripts/healthcheck.sh ; echo "verdict = $?"
```

:::lang fr
**✅ Vérification :** `sudo ~/atelier-runbook/scripts/healthcheck.sh` affiche **six `[OK]`** — service, timer, montage, réponse HTTP, pare-feu, disque — puis `Serveur sain` avec **`verdict = 0`**. En une commande, tu **audites** l'ensemble du serveur : chaque brique des étapes précédentes est **vérifiée automatiquement**. Ce script (exit `0`/`1`) est exactement ce qu'un système de supervision (cron, monitoring) lancerait pour **surveiller** le serveur en continu. *(On le lance avec `sudo` car il interroge `ufw`.)*
:::

:::lang en
**✅ Check:** `sudo ~/atelier-runbook/scripts/healthcheck.sh` prints **six `[OK]`** — service, timer, mount, HTTP response, firewall, disk — then `Serveur sain` with **`verdict = 0`**. In one command, you **audit** the whole server: every brick from the previous steps is **checked automatically**. This script (exit `0`/`1`) is exactly what a supervision system (cron, monitoring) would run to **watch** the server continuously. *(We run it with `sudo` because it queries `ufw`.)*
:::

### step-07

:::lang fr
**Objectif.** Documenter — transformer le serveur en **livrable de CV** : le **runbook**.

**🤔 Le runbook fait la moitié de la valeur.** Un `README.md` qui explique **quoi**, **pourquoi**, et **comment reconstruire**. Crée-le en suivant ce plan (chaque titre devient une section `##`) :
:::

:::lang en
**Goal.** Document — turn the server into a **CV deliverable**: the **runbook**.

**🤔 The runbook is half the value.** A `README.md` explaining **what**, **why**, and **how to rebuild**. Create it following this outline (each heading becomes a `##` section):
:::

    # Atelier Média — runbook du serveur applicatif
    #
    # Serveur Ubuntu multi-utilisateur, provisionné et durci (LPIC-1).
    #
    # Architecture
    # - Équipe : groupe 'atelier' + sudo au moindre privilège (restart du service)
    # - Données : volume LVM (vg_atelier/data) monté sur /srv/atelier (UUID, SGID)
    # - Service : atelier.service (web sur :8080, user www-data)
    # - Sauvegarde : backup.sh + atelier-backup.timer (quotidien, rotation 7)
    # - Sécurité : SSH par clés + sshd durci + ufw (deny, SSH + 8080)
    # - Ops : scripts/provision.sh (idempotent) + scripts/healthcheck.sh
    #
    # Exploitation
    # - État : sudo scripts/healthcheck.sh
    # - Sauvegarde manuelle : sudo systemctl start atelier-backup.service
    # - Restaurer : tar xzf /var/backups/atelier/<archive> -C /srv/atelier
    # - Redémarrer l'app (équipe) : sudo systemctl restart atelier
    #
    # Décisions
    # - LVM -> extensible sans re-partition ; données hors système
    # - moindre privilège (sudo ciblé, service en www-data, ufw deny)
    # - tout scripté (provision.sh) -> reconstructible à l'identique

:::lang fr
**✅ Vérification :** ton dépôt a un `README.md` (architecture, exploitation, décisions) et un dossier `scripts/` (backup, healthcheck, et le provision.sh de l'étape suivante). Ouvre-le comme un recruteur : en deux minutes, comprend-on **ce que fait le serveur, comment l'exploiter, et pourquoi les choix sont bons** ? Si oui, c'est un livrable **vendable** — un runbook, l'artefact quotidien d'un vrai sysadmin.
:::

:::lang en
**✅ Check:** your repo has a `README.md` (architecture, operations, decisions) and a `scripts/` folder (backup, healthcheck, and the provision.sh from the next step). Open it like a recruiter: in two minutes, is it clear **what the server does, how to operate it, and why the choices are sound**? If so, it's a **sellable** deliverable — a runbook, the daily artifact of a real sysadmin.
:::

### step-08

:::lang fr
**Objectif.** Capitaliser dans un **script de provisionnement** idempotent, committer, puis vérifier la reproductibilité.

**🤔 Rejouable à l'identique.** Un vrai serveur se reconstruit **par un script**, pas de mémoire. `provision.sh` réunit les étapes 1-5, en **idempotent** (rejouable sans casser l'existant). Crée-le :
:::

:::lang en
**Goal.** Capitalize into an idempotent **provisioning script**, commit, then verify reproducibility.

**🤔 Replayable identically.** A real server is rebuilt **by a script**, not from memory. `provision.sh` gathers steps 1-5, **idempotently** (replayable without breaking what exists). Create it:
:::

```bash
tee ~/atelier-runbook/scripts/provision.sh >/dev/null <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
# idempotent : chaque action vérifie avant d'agir / each action checks before acting
getent group atelier >/dev/null || sudo groupadd atelier
for u in marie karim; do
  id "$u" >/dev/null 2>&1 || sudo useradd -m -s /bin/bash -G atelier "$u"
done
[[ -f /etc/sudoers.d/atelier ]] || \
  echo '%atelier ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart atelier' | sudo tee /etc/sudoers.d/atelier >/dev/null
sudo systemctl enable --now atelier atelier-backup.timer
echo "provisionnement OK"
EOF
chmod +x ~/atelier-runbook/scripts/provision.sh
~/atelier-runbook/scripts/provision.sh          # rejoue : ne recrée rien d'existant / replays: recreates nothing

cat > .gitignore <<'EOF'
*.tar.gz
EOF
git add . && git commit -m "Atelier Média : serveur Ubuntu durci (users, LVM, service, backup, SSH, ufw, scripts)"
```

:::lang fr
**✅ Vérification :** `~/atelier-runbook/scripts/provision.sh` s'exécute **sans erreur même en le relançant** — chaque étape teste avant d'agir (`getent group … || groupadd`, `id … || useradd`) : c'est l'**idempotence**, la propriété clé d'un script de provisionnement. Le `git commit` fige ton livrable. Preuve finale : `sudo scripts/healthcheck.sh` renvoie toujours **`Serveur sain`**. Tu as un serveur **reconstructible par un script** et **documenté par un runbook** — pousse le dépôt sur GitHub et **mets le lien sur ton CV**.

**🧹 Ménage (détruire la VM) :** depuis ton hôte, `multipass delete atelier && multipass purge`. Tout le projet (VM, disque loopback, services) disparaît proprement ; ton **dépôt Git**, lui, reste le livrable.
:::

:::lang en
**✅ Check:** `~/atelier-runbook/scripts/provision.sh` runs **with no error even when re-run** — each step checks before acting (`getent group … || groupadd`, `id … || useradd`): that's **idempotence**, the key property of a provisioning script. The `git commit` freezes your deliverable. Final proof: `sudo scripts/healthcheck.sh` still returns **`Serveur sain`**. You have a server **rebuildable by a script** and **documented by a runbook** — push the repo to GitHub and **put the link on your CV**.

**🧹 Cleanup (destroy the VM):** from your host, `multipass delete atelier && multipass purge`. The whole project (VM, loopback disk, services) disappears cleanly; your **Git repo** stays the deliverable.
:::

## pitfalls

:::lang fr
**1. Une faute dans `fstab` bloque le boot.** Toujours `sudo mount -a` **avant** de considérer la ligne comme bonne. Le montage par **UUID** évite les surprises de nommage.

**2. Faire tourner le service en root.** Un service exposé (web sur :8080) doit tourner en utilisateur **non privilégié** (`User=www-data`). Root = toute la machine compromise si l'app est piégée.

**3. Activer ufw avant d'autoriser SSH.** `ufw enable` sans `allow OpenSSH` te coupe l'accès distant. Autorise **SSH d'abord** (et l'app), puis active.

**4. Désactiver les mots de passe SSH sans clé testée.** Vérifie que ta clé marche **avant** `PasswordAuthentication no`. Dans une VM, la console te sauve — en prod, tu serais dehors.

**5. Sudo trop large.** `%atelier ALL=(ALL) ALL` donne **tout** à l'équipe. La règle ciblée (`… restart atelier`) applique le **moindre privilège** — c'est le but.

**6. Script de provisionnement non idempotent.** Un `useradd` relancé **échoue** si l'utilisateur existe. Teste avant d'agir (`id u || useradd`) pour pouvoir **rejouer** sans casser.

**7. Committer les sauvegardes.** Les `.tar.gz` n'ont rien à faire dans Git (volumineux, données). Le `.gitignore` les exclut. Le dépôt contient le **code** et la **doc**, pas les données.
:::

:::lang en
**1. A mistake in `fstab` blocks boot.** Always `sudo mount -a` **before** considering the line good. Mounting by **UUID** avoids naming surprises.

**2. Running the service as root.** An exposed service (web on :8080) must run as an **unprivileged** user (`User=www-data`). Root = the whole machine compromised if the app is exploited.

**3. Enabling ufw before allowing SSH.** `ufw enable` without `allow OpenSSH` cuts off remote access. Allow **SSH first** (and the app), then enable.

**4. Disabling SSH passwords without a tested key.** Verify your key works **before** `PasswordAuthentication no`. In a VM the console saves you — in prod, you'd be locked out.

**5. Too-broad sudo.** `%atelier ALL=(ALL) ALL` gives the team **everything**. The targeted rule (`… restart atelier`) applies **least privilege** — that's the point.

**6. Non-idempotent provisioning script.** A re-run `useradd` **fails** if the user exists. Test before acting (`id u || useradd`) to **replay** without breaking.

**7. Committing backups.** `.tar.gz` files don't belong in Git (large, data). The `.gitignore` excludes them. The repo holds **code** and **docs**, not data.
:::

## success

:::lang fr
Ton livrable est prêt pour un CV quand…

- [ ] Une **équipe** (groupe + comptes) existe avec un **sudo ciblé** (`visudo -cf` OK).
- [ ] Un **volume LVM** est monté sur `/srv/atelier` par **UUID** (SGID d'équipe).
- [ ] Le **service** `atelier` tourne (non-root) et répond sur `:8080`.
- [ ] La **sauvegarde** est planifiée (**timer**) et produit des archives rotationnées.
- [ ] SSH est **par clés** et **durci** ; **ufw** est en **deny par défaut**.
- [ ] `healthcheck.sh` renvoie **6 [OK]** ; `provision.sh` est **idempotent**.
- [ ] Le dépôt a un **runbook** clair et tu sais **justifier** chaque choix.

Sept cases cochées = tu ne présentes pas un TP, tu présentes un **serveur de production miniature**.
:::

:::lang en
Your deliverable is CV-ready when…

- [ ] A **team** (group + accounts) exists with **targeted sudo** (`visudo -cf` OK).
- [ ] An **LVM volume** is mounted at `/srv/atelier` by **UUID** (team SGID).
- [ ] The `atelier` **service** runs (non-root) and answers on `:8080`.
- [ ] The **backup** is scheduled (**timer**) and produces rotated archives.
- [ ] SSH is **key-based** and **hardened**; **ufw** is **default deny**.
- [ ] `healthcheck.sh` returns **6 [OK]**; `provision.sh` is **idempotent**.
- [ ] The repo has a clear **runbook** and you can **justify** every choice.

Seven boxes ticked = you're not presenting a lab, you're presenting a **miniature production server**.
:::

## next

:::lang fr
Tu as bouclé la **track Linux → LPIC-1**, projet compris — trois tracks de certification si tu as suivi Terraform et Kubernetes. Pour aller plus loin :

1. **Passe l'examen** — avec toute la track, tu couvres les objectifs **LPIC-1** (101 & 102). Entraîne-toi au format QCM chronométré.
2. **Industrialise ce serveur** — passe le provisionnement à **Ansible** (track Ansible → RHCE) : le même serveur, décrit en playbooks idempotents versionnés. C'est la suite naturelle.
3. **Mets-le en ligne** — rejoue le runbook sur un vrai VPS (le capstone homelab de la plateforme t'y emmène), avec un vrai domaine et HTTPS.
:::

:::lang en
You've completed the **Linux → LPIC-1 track**, project included — three certification tracks if you followed Terraform and Kubernetes. To go further:

1. **Sit the exam** — with the whole track, you cover the **LPIC-1** objectives (101 & 102). Practice in the timed multiple-choice format.
2. **Industrialize this server** — move provisioning to **Ansible** (Ansible → RHCE track): the same server, described as versioned idempotent playbooks. The natural next step.
3. **Put it online** — replay the runbook on a real VPS (the platform's homelab capstone takes you there), with a real domain and HTTPS.
:::

## cheatsheet

:::lang fr
Aide-mémoire projet serveur.
:::

:::lang en
Server project cheat sheet.
:::

```bash
# Équipe & sudo / team & sudo
sudo groupadd atelier ; sudo useradd -m -G atelier NOM
echo '%atelier ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart atelier' | sudo tee /etc/sudoers.d/atelier
sudo visudo -cf /etc/sudoers.d/atelier

# Stockage LVM / LVM storage
sudo pvcreate DEV ; sudo vgcreate vg_atelier DEV ; sudo lvcreate -L 800M -n data vg_atelier
# fstab: UUID=...  /srv/atelier  ext4  defaults  0  2   -> sudo mount -a
sudo chgrp atelier /srv/atelier ; sudo chmod 2775 /srv/atelier   # SGID d'équipe

# Service & sauvegarde / service & backup
sudo systemctl enable --now atelier atelier-backup.timer
systemctl list-timers atelier-backup.timer

# Sécurité / security  (SSH d'abord !)
sudo sshd -t && sudo systemctl reload ssh ; sudo sshd -T | grep -i permitroot
sudo ufw allow OpenSSH ; sudo ufw allow 8080/tcp ; sudo ufw default deny incoming ; sudo ufw enable

# Ops
sudo scripts/healthcheck.sh          # audit (6 checks)
scripts/provision.sh                 # idempotent
```

## resources

:::lang fr
- Les **six guides** de la track Linux (chaque étape du projet en approfondit un).
- [`man sudoers`](https://manpages.ubuntu.com/manpages/noble/man5/sudoers.5.html), [`man systemd.timer`](https://manpages.ubuntu.com/manpages/noble/man5/systemd.timer.5.html), [`man fstab`](https://manpages.ubuntu.com/manpages/noble/man5/fstab.5.html).
- [Ubuntu Server Guide](https://ubuntu.com/server/docs) — provisionnement et durcissement.
- Objectifs **LPIC-1 101 & 102** (l'ensemble de la certification).
:::

:::lang en
- The **six guides** of the Linux track (each project step deepens one).
- [`man sudoers`](https://manpages.ubuntu.com/manpages/noble/man5/sudoers.5.html), [`man systemd.timer`](https://manpages.ubuntu.com/manpages/noble/man5/systemd.timer.5.html), [`man fstab`](https://manpages.ubuntu.com/manpages/noble/man5/fstab.5.html).
- [Ubuntu Server Guide](https://ubuntu.com/server/docs) — provisioning and hardening.
- **LPIC-1 101 & 102** objectives (the whole certification).
:::

## troubleshooting

:::lang fr
**`systemctl status atelier` en `failed`.** Regarde `journalctl -u atelier` : souvent le port 8080 déjà pris, ou `/srv/atelier` non monté (le service sert un dossier vide). Vérifie `df -h /srv/atelier`.

**`curl localhost:8080` : connection refused.** Le service ne tourne pas (`systemctl status atelier`) ou n'a pas démarré (`daemon-reload` oublié après création de l'unit).

**`sudo mount -a` échoue.** Ta ligne `fstab` est mauvaise (UUID erroné). Corrige **avant** tout reboot ; `findmnt --verify` aide.

**Le service ne peut pas lire `/srv/atelier` (`www-data`).** Le dossier n'est pas accessible à `www-data`. Les permissions `2775` + groupe `atelier` suffisent en lecture ; sinon vérifie le propriétaire/les droits.

**La sauvegarde ne se déclenche pas.** Le timer est-il actif ? `systemctl list-timers atelier-backup.timer`. `enable --now` la timer (pas seulement la créer), après `daemon-reload`.

**`provision.sh` échoue au 2ᵉ passage.** Une action n'est pas idempotente (un `useradd`/`groupadd` sans garde). Ajoute le test `id/getent … ||` devant.
:::

:::lang en
**`systemctl status atelier` is `failed`.** Look at `journalctl -u atelier`: often port 8080 already taken, or `/srv/atelier` not mounted (the service serves an empty folder). Check `df -h /srv/atelier`.

**`curl localhost:8080`: connection refused.** The service isn't running (`systemctl status atelier`) or didn't start (`daemon-reload` forgotten after creating the unit).

**`sudo mount -a` fails.** Your `fstab` line is wrong (bad UUID). Fix it **before** any reboot; `findmnt --verify` helps.

**The service can't read `/srv/atelier` (`www-data`).** The folder isn't accessible to `www-data`. The `2775` permissions + `atelier` group are enough for reading; otherwise check the owner/rights.

**The backup doesn't trigger.** Is the timer active? `systemctl list-timers atelier-backup.timer`. `enable --now` the timer (not just create it), after `daemon-reload`.

**`provision.sh` fails on the 2nd run.** An action isn't idempotent (a `useradd`/`groupadd` without a guard). Add the `id/getent … ||` test in front.
:::
