---
# — Identité (ne change JAMAIS une fois publié) —
id: linux-boot-systemd
slug: linux-boot-systemd
order: 6
status: published

# — Titres & accroches (bilingue) —
title_fr: "Linux — boot, systemd & processus"
title_en: "Linux — boot, systemd & processes"
tagline_fr: "Démarrage, units, journalctl, signaux, cron, timers."
tagline_en: "Boot, units, journalctl, signals, cron, timers."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 195
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [linux-fichiers-disques]
next: [git-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [chaine-demarrage, units-systemd, systemctl-cycle, journalctl, processus-signaux, cron, systemd-timers]
concepts_en: [boot-chain, systemd-units, systemctl-lifecycle, journalctl, processes-signals, cron, systemd-timers]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le démarrage et la gestion des services Linux au niveau LPIC-1 : la chaîne de boot (firmware → GRUB → noyau → systemd), les units et targets, systemctl, la lecture des logs avec journalctl, les processus et signaux (kill, nice), et la planification (cron, timers systemd, at)."
og_description_en: "Linux boot and service management at LPIC-1 level: the boot chain (firmware → GRUB → kernel → systemd), units and targets, systemctl, reading logs with journalctl, processes and signals (kill, nice), and scheduling (cron, systemd timers, at)."
---

## intro

:::lang fr
Quand un serveur démarre, **une longue chaîne se met en route** avant que ton service ne réponde — et quand quelque chose ne va pas, c'est **là** qu'un admin regarde. Le guide fondamentaux t'a montré `systemctl status` ; l'examen **LPIC-1** attend la maîtrise complète : *que se passe-t-il du bouton d'allumage jusqu'à l'invite ? comment créer son propre service ? comment lire ses logs ? comment tuer proprement un processus (et la différence entre les signaux) ? comment planifier une tâche, avec cron **et** avec systemd ?*

Ce guide couvre les domaines **Démarrage, systemd, processus & planification** : la **chaîne de boot** (firmware → **GRUB** → noyau → **systemd**), les **units** et **targets**, **`systemctl`**, la lecture des logs avec **`journalctl`**, les **processus** et **signaux** (`kill`, `nice`), et la **planification** (**cron**, **timers systemd**, `at`).

On travaille sur **ta machine Ubuntu** (native ou VM Multipass ; **WSL2** : active systemd via `/etc/wsl.conf` comme au guide fondamentaux). On crée un **vrai service systemd** de démo, qu'on supprime à la fin.

**Pour qui c'est :** tu as les guides précédents de la track et tu vises **LPIC-1**.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas ce qu'est un service → revois `systemctl` dans le guide fondamentaux.
- Tu veux le réseau ou le scripting → ce sont les guides suivants.
:::

:::lang en
When a server boots, **a long chain kicks off** before your service answers — and when something's wrong, that's **where** an admin looks. The fundamentals guide showed you `systemctl status`; the **LPIC-1** exam expects full mastery: *what happens from the power button to the prompt? how do you create your own service? how do you read its logs? how do you kill a process cleanly (and the difference between signals)? how do you schedule a task, with cron **and** with systemd?*

This guide covers the **Boot, systemd, processes & scheduling** domains: the **boot chain** (firmware → **GRUB** → kernel → **systemd**), **units** and **targets**, **`systemctl`**, reading logs with **`journalctl`**, **processes** and **signals** (`kill`, `nice`), and **scheduling** (**cron**, **systemd timers**, `at`).

We work on **your Ubuntu machine** (native or Multipass VM; **WSL2**: enable systemd via `/etc/wsl.conf` as in the fundamentals guide). We create a **real demo systemd service**, deleted at the end.

**Who it's for:** you have the earlier track guides and you're aiming for **LPIC-1**.

**When it's NOT the right choice:**

- You don't know what a service is → review `systemctl` in the fundamentals guide.
- You want networking or scripting → those are the next guides.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Décrire la **chaîne de démarrage** et lire son temps (`systemd-analyze`).
- Identifier la **target par défaut** et le rôle de **systemd** (PID 1).
- **Écrire** une **unit** `.service` et la gérer (`start`, `enable`, `status`).
- Maîtriser le cycle **`systemctl`** : `stop`, `restart`, `disable`, **`mask`**.
- Lire et **filtrer** les logs avec **`journalctl`** (`-u`, `-b`, `--since`, `-p`, `-f`).
- Gérer les **processus** et envoyer des **signaux** (`kill`, `nice`/`renice`, `pgrep`/`pkill`).
- Planifier avec **cron**, un **timer systemd**, et **`at`**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Describe the **boot chain** and read its timing (`systemd-analyze`).
- Identify the **default target** and systemd's role (PID 1).
- **Write** a `.service` **unit** and manage it (`start`, `enable`, `status`).
- Master the **`systemctl`** lifecycle: `stop`, `restart`, `disable`, **`mask`**.
- Read and **filter** logs with **`journalctl`** (`-u`, `-b`, `--since`, `-p`, `-f`).
- Manage **processes** and send **signals** (`kill`, `nice`/`renice`, `pgrep`/`pkill`).
- Schedule with **cron**, a **systemd timer**, and **`at`**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides précédents de la track Linux acquis.
- Un système **Ubuntu** avec **systemd actif** et `sudo` (native, VM Multipass, ou WSL2 configuré).
- L'outil `at` (pour la dernière étape) :
:::

:::lang en
You should have:

- The earlier Linux track guides under your belt.
- An **Ubuntu** system with **systemd active** and `sudo` (native, Multipass VM, or configured WSL2).
- The `at` tool (for the last step):
:::

```bash
sudo apt update && sudo apt install -y at
```

## concepts

:::lang fr
**La chaîne de démarrage**, du courant à l'invite :

1. **Firmware** (BIOS ou **UEFI**) : teste le matériel et cherche un **chargeur d'amorçage**.
2. **GRUB** (le bootloader) : charge le **noyau Linux** et l'`initramfs` (mini-système pour monter la vraie racine).
3. **Noyau** : initialise le matériel, monte `/`, puis lance le **premier processus**, **PID 1**.
4. **`systemd`** (PID 1) : c'est lui, l'`init` moderne. Il **active les units** dans l'ordre des dépendances jusqu'à atteindre la **target** voulue.

**Les units** sont les objets que systemd gère. Types principaux : **`.service`** (un démon/programme), **`.target`** (un **groupe** d'units, l'équivalent des anciens *runlevels*), **`.timer`** (déclenche une unit sur planning), **`.socket`**, **`.mount`**. Une unit a un état (**active**, inactive, failed) et une config (le fichier `.service`).

**Les targets** remplacent les runlevels : **`multi-user.target`** (serveur, multi-utilisateur sans interface graphique, ≈ runlevel 3), **`graphical.target`** (avec GUI, ≈ 5), **`rescue.target`** (maintenance mono-utilisateur, ≈ 1). `systemctl get-default` montre la target de démarrage.

**`systemctl`** pilote tout : `start`/`stop` (maintenant), `enable`/`disable` (**au démarrage**), `status`, et **`mask`** (interdit **totalement** une unit, même le démarrage manuel — plus fort que `disable`).

**`journalctl`** lit le **journal** centralisé de systemd (tous les logs des services, du noyau, du boot). On le **filtre** : par unit (`-u`), par démarrage (`-b`), par date (`--since`), par priorité (`-p`), en suivi temps réel (`-f`).

**Les processus & signaux.** Chaque programme en cours est un **processus** (un **PID**). On lui envoie des **signaux** avec `kill` : **`SIGTERM`** (15, demande polie d'arrêt — **défaut**), **`SIGKILL`** (9, arrêt **brutal**, non-interceptable), **`SIGHUP`** (1, souvent « recharge ta config »). La **priorité** d'ordonnancement se règle avec **`nice`** (au lancement) et **`renice`** (en cours) : de **-20** (prioritaire) à **+19** (effacé).

**La planification.** Deux mondes coexistent : **cron** (historique — `crontab` par utilisateur, et `/etc/cron.d`, `/etc/cron.daily`…) et les **timers systemd** (une `.timer` déclenche une `.service`). Pour une tâche **unique** différée : **`at`**.
:::

:::lang en
**The boot chain**, from power to prompt:

1. **Firmware** (BIOS or **UEFI**): tests hardware and looks for a **bootloader**.
2. **GRUB** (the bootloader): loads the **Linux kernel** and the `initramfs` (a mini-system to mount the real root).
3. **Kernel**: initializes hardware, mounts `/`, then launches the **first process**, **PID 1**.
4. **`systemd`** (PID 1): the modern `init`. It **activates units** in dependency order until it reaches the desired **target**.

**Units** are the objects systemd manages. Main types: **`.service`** (a daemon/program), **`.target`** (a **group** of units, the equivalent of the old *runlevels*), **`.timer`** (triggers a unit on a schedule), **`.socket`**, **`.mount`**. A unit has a state (**active**, inactive, failed) and config (the `.service` file).

**Targets** replace runlevels: **`multi-user.target`** (server, multi-user without a GUI, ≈ runlevel 3), **`graphical.target`** (with GUI, ≈ 5), **`rescue.target`** (single-user maintenance, ≈ 1). `systemctl get-default` shows the boot target.

**`systemctl`** drives it all: `start`/`stop` (now), `enable`/`disable` (**at boot**), `status`, and **`mask`** (**totally** forbids a unit, even manual start — stronger than `disable`).

**`journalctl`** reads systemd's centralized **journal** (all services', kernel's, boot's logs). You **filter** it: by unit (`-u`), by boot (`-b`), by date (`--since`), by priority (`-p`), following in real time (`-f`).

**Processes & signals.** Each running program is a **process** (a **PID**). You send it **signals** with `kill`: **`SIGTERM`** (15, polite stop request — **default**), **`SIGKILL`** (9, **brutal**, non-catchable stop), **`SIGHUP`** (1, often "reload your config"). Scheduling **priority** is set with **`nice`** (at launch) and **`renice`** (running): from **-20** (top priority) to **+19** (lowest).

**Scheduling.** Two worlds coexist: **cron** (historical — per-user `crontab`, and `/etc/cron.d`, `/etc/cron.daily`…) and **systemd timers** (a `.timer` triggers a `.service`). For a **one-off** deferred task: **`at`**.
:::

:::figure linux-boot-chain
caption_fr: "Schéma 1. Firmware → GRUB → noyau → systemd (PID 1) → units jusqu'à la target. systemctl gère, journalctl lit les logs."
caption_en: "Figure 1. Firmware → GRUB → kernel → systemd (PID 1) → units up to the target. systemctl manages, journalctl reads logs."
:::

:::lang fr
On avance : chaîne de boot → écrire une unit → cycle systemctl → journalctl → processus & signaux → cron → timers & at.
:::

:::lang en
We'll go: boot chain → write a unit → systemctl lifecycle → journalctl → processes & signals → cron → timers & at.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Observer la **chaîne de démarrage** et la **target par défaut**.

**🤔 Qui est PID 1 ?** `systemd` est le premier processus, celui d'où tout descend. Inspecte :
:::

:::lang en
**Goal.** Observe the **boot chain** and the **default target**.

**🤔 Who is PID 1?** `systemd` is the first process, the one everything descends from. Inspect:
:::

```bash
ps -p 1 -o pid,comm          # PID 1 = systemd / PID 1 = systemd
systemctl get-default        # la target de démarrage (multi-user ou graphical) / boot target
systemd-analyze              # temps de boot total / total boot time
systemd-analyze blame | head # les units les plus lentes au démarrage / slowest units at boot
```

:::lang fr
**✅ Vérification :** `ps -p 1` confirme que le processus **PID 1** est **`systemd`** — l'`init` qui a orchestré tout le démarrage. `systemctl get-default` renvoie ta target de boot (souvent `graphical.target` sur un poste, `multi-user.target` sur un serveur). `systemd-analyze` donne le temps de boot, et `blame` classe les units par lenteur — l'outil pour diagnostiquer un démarrage lent. Tu vois la chaîne aboutir : firmware → GRUB → noyau → **systemd** → target.
:::

:::lang en
**✅ Check:** `ps -p 1` confirms process **PID 1** is **`systemd`** — the `init` that orchestrated the whole boot. `systemctl get-default` returns your boot target (often `graphical.target` on a desktop, `multi-user.target` on a server). `systemd-analyze` gives boot time, and `blame` ranks units by slowness — the tool to diagnose a slow boot. You see the chain land: firmware → GRUB → kernel → **systemd** → target.
:::

### step-02

:::lang fr
**Objectif.** **Écrire** ta propre **unit `.service`** et la démarrer.

**🤔 Un service, c'est un fichier texte.** On crée un petit démon qui écrit l'heure toutes les 5 secondes. Crée l'unit :
:::

:::lang en
**Goal.** **Write** your own **`.service` unit** and start it.

**🤔 A service is a text file.** We create a small daemon that prints the time every 5 seconds. Create the unit:
:::

```bash
sudo tee /etc/systemd/system/hello.service >/dev/null <<'EOF'
[Unit]
Description=Service de démo hello
After=network.target

[Service]
ExecStart=/bin/bash -c 'while true; do echo "hello à $(date)"; sleep 5; done'
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload      # systemd relit les units après création/modif / re-read units
sudo systemctl start hello
systemctl status hello --no-pager # doit être "active (running)" / must be "active (running)"
```

:::lang fr
**✅ Vérification :** `systemctl status hello` affiche **`active (running)`** avec le **PID** du processus et les dernières lignes de sortie (`hello à …`). Tu as créé un **vrai service systemd** à partir d'un simple fichier `.service` : une section `[Unit]` (métadonnées, ordre), `[Service]` (**quoi lancer**, `ExecStart`), `[Install]` (à quelle target l'attacher). Point clé : **`daemon-reload`** est obligatoire après toute création/modification d'unit — sinon systemd ne « voit » pas ton changement.
:::

:::lang en
**✅ Check:** `systemctl status hello` shows **`active (running)`** with the process **PID** and the latest output lines (`hello à …`). You created a **real systemd service** from a plain `.service` file: a `[Unit]` section (metadata, ordering), `[Service]` (**what to run**, `ExecStart`), `[Install]` (which target to attach to). Key point: **`daemon-reload`** is mandatory after any unit creation/change — otherwise systemd doesn't "see" your change.
:::

### step-03

:::lang fr
**Objectif.** Maîtriser le cycle **`systemctl`** : `enable`, `restart`, `disable`, **`mask`**.

**🤔 « Maintenant » vs « au démarrage ».** `start`/`stop` agissent tout de suite ; `enable`/`disable` décident du **démarrage automatique**. Le `mask` va plus loin : il **interdit** l'unit.
:::

:::lang en
**Goal.** Master the **`systemctl`** lifecycle: `enable`, `restart`, `disable`, **`mask`**.

**🤔 "Now" vs "at boot".** `start`/`stop` act immediately; `enable`/`disable` decide **automatic startup**. `mask` goes further: it **forbids** the unit.
:::

```bash
sudo systemctl enable hello         # démarrage auto au boot (crée un lien dans .wants) / auto-start at boot
systemctl is-enabled hello          # "enabled"
sudo systemctl restart hello        # stop + start (nouveau PID) / stop + start (new PID)

sudo systemctl disable hello        # retire du démarrage auto / remove from auto-start
sudo systemctl mask hello           # INTERDIT l'unit (lien vers /dev/null) / FORBID the unit
sudo systemctl start hello || echo "refusé car masqué / refused because masked"
sudo systemctl unmask hello         # lève l'interdiction / lift the ban
```

:::lang fr
**✅ Vérification :** après `enable`, `systemctl is-enabled hello` répond **`enabled`** (le service démarrera au prochain boot — systemd a créé un lien dans `multi-user.target.wants/`). Après `mask` **puis** `start`, le démarrage est **refusé** (`Unit hello.service is masked.`) : le `mask` est un **verrou** bien plus fort que `disable` (qui, lui, laisse le démarrage manuel possible). Retiens l'échelle : **start/stop** (maintenant) < **enable/disable** (au boot) < **mask/unmask** (interdiction totale).
:::

:::lang en
**✅ Check:** after `enable`, `systemctl is-enabled hello` answers **`enabled`** (the service will start at next boot — systemd created a link in `multi-user.target.wants/`). After `mask` **then** `start`, startup is **refused** (`Unit hello.service is masked.`): `mask` is a **lock** far stronger than `disable` (which still allows a manual start). Remember the scale: **start/stop** (now) < **enable/disable** (at boot) < **mask/unmask** (total ban).
:::

### step-04

:::lang fr
**Objectif.** Lire et **filtrer** les logs avec **`journalctl`**.

**🤔 Un journal unique.** systemd centralise **tous** les logs. L'art, c'est de **filtrer** pour ne voir que ce qui compte. Interroge ton service :
:::

:::lang en
**Goal.** Read and **filter** logs with **`journalctl`**.

**🤔 One journal.** systemd centralizes **all** logs. The art is to **filter** to see only what matters. Query your service:
:::

```bash
journalctl -u hello --no-pager | tail       # les logs de CE service / this service's logs
journalctl -u hello -b --no-pager | tail     # ...depuis le démarrage courant / ...since the current boot
journalctl -u hello --since "5 min ago" --no-pager | tail   # ...sur une fenêtre de temps / a time window
journalctl -p err -b --no-pager | tail       # tout ce qui est de priorité "error" ce boot / errors this boot
# journalctl -u hello -f                      # SUIVI temps réel (Ctrl+C pour sortir) / live follow (Ctrl+C)
```

:::lang fr
**✅ Vérification :** `journalctl -u hello` affiche **uniquement** les lignes `hello à …` de ton service (pas le bruit des autres). Les filtres se **combinent** : `-b` (ce démarrage), `--since` (fenêtre de temps), `-p err` (priorité). Le suivi `-f` afficherait les nouvelles lignes en direct (ton service en produit une toutes les 5 s). C'est **la** compétence de diagnostic : au lieu de lire des milliers de lignes, tu **cibles** l'unit, la période, la gravité.
:::

:::lang en
**✅ Check:** `journalctl -u hello` shows **only** your service's `hello à …` lines (not the noise from others). Filters **combine**: `-b` (this boot), `--since` (time window), `-p err` (priority). The `-f` follow would show new lines live (your service emits one every 5 s). That's **the** diagnostic skill: instead of reading thousands of lines, you **target** the unit, the period, the severity.
:::

### step-05

:::lang fr
**Objectif.** Gérer les **processus** et envoyer des **signaux** (`kill`, `nice`).

**🤔 TERM vs KILL.** Un processus reçoit **SIGTERM** (arrêt poli, il peut nettoyer) ou **SIGKILL** (couperet, ininterceptable). Lance des cibles de test :
:::

:::lang en
**Goal.** Manage **processes** and send **signals** (`kill`, `nice`).

**🤔 TERM vs KILL.** A process gets **SIGTERM** (polite stop, it can clean up) or **SIGKILL** (guillotine, uncatchable). Launch test targets:
:::

```bash
sleep 600 &                 # un processus en arrière-plan / a background process
PID=$!                      # son PID / its PID
ps -o pid,ni,cmd -p $PID    # colonne NI = niceness (priorité) / NI = niceness (priority)

sudo renice -n 10 -p $PID   # baisse sa priorité (10) / lower its priority
kill -SIGTERM $PID          # arrêt poli (= kill $PID par défaut) / polite stop (= default kill)

sleep 600 & PID2=$!
kill -SIGKILL $PID2         # arrêt brutal, non-ignorable / brutal, non-ignorable
pgrep -a sleep              # cherche les processus "sleep" restants / find remaining "sleep" processes
pkill sleep                 # les tue par nom / kill them by name
```

:::lang fr
**✅ Vérification :** `ps -o pid,ni` montre le **niceness** du processus (0 par défaut) ; après `renice -n 10`, il passe à **10** (moins prioritaire). `kill -SIGTERM $PID` l'arrête proprement (un `jobs` le montre `Terminated`) ; `kill -SIGKILL` tue l'autre **immédiatement**, sans qu'il puisse rien intercepter. `pgrep`/`pkill` agissent **par nom** au lieu du PID. Retiens : **TERM** (15, défaut, poli) d'abord ; **KILL** (9, brutal) en dernier recours quand un process est bloqué.
:::

:::lang en
**✅ Check:** `ps -o pid,ni` shows the process's **niceness** (0 by default); after `renice -n 10`, it becomes **10** (lower priority). `kill -SIGTERM $PID` stops it cleanly (a `jobs` shows it `Terminated`); `kill -SIGKILL` kills the other **immediately**, with no chance to catch anything. `pgrep`/`pkill` act **by name** instead of PID. Remember: **TERM** (15, default, polite) first; **KILL** (9, brutal) as a last resort when a process is stuck.
:::

### step-06

:::lang fr
**Objectif.** Planifier une tâche **récurrente** avec **cron**.

**🤔 Le format cron.** Cinq champs : `minute heure jour-du-mois mois jour-de-semaine`, puis la commande. `* * * * *` = chaque minute. Programme une tâche pour ton utilisateur :
:::

:::lang en
**Goal.** Schedule a **recurring** task with **cron**.

**🤔 The cron format.** Five fields: `minute hour day-of-month month day-of-week`, then the command. `* * * * *` = every minute. Schedule a task for your user:
:::

```bash
# Ajoute une ligne à ta crontab sans ouvrir l'éditeur / add a crontab line without the editor
( crontab -l 2>/dev/null; echo '* * * * * echo "tick $(date)" >> /tmp/cron.log' ) | crontab -
crontab -l                          # vérifie la crontab / check the crontab

sleep 65 ; cat /tmp/cron.log         # attends >1 min, la tâche a tourné / wait >1 min, the task ran

# Retire la tâche (vide la crontab de démo) / remove the task (clear the demo crontab)
crontab -r
```

:::lang fr
**✅ Vérification :** `crontab -l` montre ta ligne planifiée. Après une minute, `/tmp/cron.log` contient une (ou plusieurs) ligne(s) `tick …` — **cron a exécuté** ta commande **tout seul**, chaque minute. Tu maîtrises les **5 champs** (`min h jour mois jour-sem`). À connaître aussi pour l'examen : les répertoires système **`/etc/cron.d/`** et **`/etc/cron.{hourly,daily,weekly,monthly}/`** (scripts lancés à intervalle), et `/etc/crontab` (crontab système, avec un champ **utilisateur** en plus).
:::

:::lang en
**✅ Check:** `crontab -l` shows your scheduled line. After a minute, `/tmp/cron.log` contains one (or more) `tick …` line(s) — **cron ran** your command **on its own**, every minute. You've got the **5 fields** (`min h day month weekday`). Also for the exam: the system directories **`/etc/cron.d/`** and **`/etc/cron.{hourly,daily,weekly,monthly}/`** (scripts run at intervals), and `/etc/crontab` (system crontab, with an extra **user** field).
:::

### step-07

:::lang fr
**Objectif.** Planifier avec un **timer systemd** et une tâche unique avec **`at`**.

**🤔 L'alternative moderne à cron.** Un **timer** systemd déclenche un **service**. On crée un service *oneshot* + son timer. Puis une tâche **unique** avec `at`.
:::

:::lang en
**Goal.** Schedule with a **systemd timer** and a one-off task with **`at`**.

**🤔 The modern alternative to cron.** A systemd **timer** triggers a **service**. We create a *oneshot* service + its timer. Then a **one-off** task with `at`.
:::

```bash
# 1) le service à déclencher / the service to trigger
sudo tee /etc/systemd/system/tick.service >/dev/null <<'EOF'
[Service]
Type=oneshot
ExecStart=/bin/bash -c 'echo "tick systemd $(date)" >> /tmp/timer.log'
EOF
# 2) le timer : toutes les minutes / the timer: every minute
sudo tee /etc/systemd/system/tick.timer >/dev/null <<'EOF'
[Timer]
OnUnitActiveSec=1min
OnBootSec=30s
[Install]
WantedBy=timers.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now tick.timer
systemctl list-timers tick.timer --no-pager     # le timer est armé / the timer is armed

# 3) tâche UNIQUE différée avec at / one-off deferred task with at
echo 'echo "at a tourné $(date)" >> /tmp/at.log' | at now + 1 minute
atq                                              # la file des tâches at / the at queue
```

:::lang fr
**✅ Vérification :** `systemctl list-timers` liste **`tick.timer`** avec son prochain déclenchement (`NEXT`) — le couple **`.timer` + `.service`** est l'équivalent systemd d'une ligne cron (après ~1 min, `/tmp/timer.log` se remplit). `atq` montre ta tâche `at` en attente ; après l'échéance, `/tmp/at.log` apparaît — `at` exécute **une seule fois**, à l'heure dite. Tu as les **trois** mécanismes de planification du LPIC-1 : **cron** (récurrent, historique), **timer systemd** (récurrent, moderne), **at** (ponctuel).
:::

:::lang en
**✅ Check:** `systemctl list-timers` lists **`tick.timer`** with its next trigger (`NEXT`) — the **`.timer` + `.service`** pair is systemd's equivalent of a cron line (after ~1 min, `/tmp/timer.log` fills up). `atq` shows your pending `at` task; after it's due, `/tmp/at.log` appears — `at` runs **exactly once**, at the set time. You have the **three** LPIC-1 scheduling mechanisms: **cron** (recurring, historical), **systemd timer** (recurring, modern), **at** (one-off).
:::

## pitfalls

:::lang fr
**1. Oublier `daemon-reload`.** Après avoir créé/modifié une unit, systemd ne la voit qu'après `sudo systemctl daemon-reload`. Sans ça, tu pilotes l'ancienne version.

**2. Confondre `enable` et `start`.** `start` démarre **maintenant** ; `enable` planifie le **démarrage au boot**. Un service peut être `enabled` mais arrêté, ou `running` mais pas `enabled`. Souvent on veut `enable --now` (les deux).

**3. `disable` ≠ `mask`.** `disable` retire du démarrage auto (mais on peut encore `start` à la main) ; `mask` **interdit** tout (lien vers `/dev/null`). Un service « impossible à démarrer » est peut-être **masqué**.

**4. Dégainer `SIGKILL` d'emblée.** `SIGKILL` (9) ne laisse **aucun** nettoyage (fichiers temporaires, connexions). Essaie **SIGTERM** (15, défaut) d'abord ; `KILL` seulement si le process est bloqué.

**5. Mauvais champ cron.** Les 5 champs sont `min h jour-du-mois mois jour-de-semaine`. Confondre « jour du mois » et « jour de semaine » est l'erreur classique. `* * * * *` = chaque minute (pas « une fois »).

**6. `crontab` système vs utilisateur.** `crontab -e` édite **ta** crontab (pas de champ utilisateur). `/etc/crontab` et `/etc/cron.d/` ont un **champ utilisateur en plus**. Ne mélange pas les deux formats.

**7. Timer sans service.** Un `.timer` **déclenche** un `.service` du même nom (ou via `Unit=`). Un timer seul ne fait rien ; il faut la paire.
:::

:::lang en
**1. Forgetting `daemon-reload`.** After creating/modifying a unit, systemd only sees it after `sudo systemctl daemon-reload`. Without it, you're driving the old version.

**2. Confusing `enable` and `start`.** `start` starts it **now**; `enable` schedules **startup at boot**. A service can be `enabled` but stopped, or `running` but not `enabled`. Often you want `enable --now` (both).

**3. `disable` ≠ `mask`.** `disable` removes from auto-start (you can still `start` by hand); `mask` **forbids** everything (link to `/dev/null`). A service "impossible to start" may be **masked**.

**4. Reaching for `SIGKILL` first.** `SIGKILL` (9) allows **no** cleanup (temp files, connections). Try **SIGTERM** (15, default) first; `KILL` only if the process is stuck.

**5. Wrong cron field.** The 5 fields are `min h day-of-month month day-of-week`. Confusing "day of month" and "day of week" is the classic mistake. `* * * * *` = every minute (not "once").

**6. System vs user `crontab`.** `crontab -e` edits **your** crontab (no user field). `/etc/crontab` and `/etc/cron.d/` have an **extra user field**. Don't mix the two formats.

**7. Timer without a service.** A `.timer` **triggers** a `.service` of the same name (or via `Unit=`). A timer alone does nothing; you need the pair.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu décris la **chaîne de boot** et tu sais que **systemd est PID 1**.
- [ ] Tu **écris** une unit `.service` et tu fais `daemon-reload` + `start`.
- [ ] Tu distingues **start/enable/mask** et tu lis `is-enabled`.
- [ ] Tu **filtres** les logs d'un service avec `journalctl -u/-b/--since/-p`.
- [ ] Tu envoies **SIGTERM** vs **SIGKILL** et tu règles un **niceness**.
- [ ] Tu planifies une tâche **cron** (5 champs) et tu connais `/etc/cron.*`.
- [ ] Tu crées un **timer systemd** et une tâche **`at`**.

Sept cases cochées = tu tiens **Boot, systemd, processus & planification** du LPIC-1.
:::

:::lang en
You know it works when…

- [ ] You describe the **boot chain** and know **systemd is PID 1**.
- [ ] You **write** a `.service` unit and do `daemon-reload` + `start`.
- [ ] You distinguish **start/enable/mask** and read `is-enabled`.
- [ ] You **filter** a service's logs with `journalctl -u/-b/--since/-p`.
- [ ] You send **SIGTERM** vs **SIGKILL** and set a **niceness**.
- [ ] You schedule a **cron** task (5 fields) and know `/etc/cron.*`.
- [ ] You create a **systemd timer** and an **`at`** task.

Seven boxes ticked = you hold LPIC-1 **Boot, systemd, processes & scheduling**.
:::

## next

:::lang fr
La suite de la track Linux → LPIC-1 :

1. **Réseau & sécurité système** — `ip`/`ss`, DNS, SSH, pare-feu, durcissement.
2. **Scripting shell (bash)** — variables, conditions, boucles, fonctions.
3. **Projet d'entreprise** — provisionner et durcir un serveur Linux multi-utilisateur.

**Ménage :** supprime le service et le timer de démo —
`sudo systemctl disable --now hello tick.timer 2>/dev/null ; sudo rm -f /etc/systemd/system/hello.service /etc/systemd/system/tick.service /etc/systemd/system/tick.timer ; sudo systemctl daemon-reload ; rm -f /tmp/cron.log /tmp/timer.log /tmp/at.log`.
:::

:::lang en
The rest of the Linux → LPIC-1 track:

1. **Networking & system security** — `ip`/`ss`, DNS, SSH, firewall, hardening.
2. **Shell scripting (bash)** — variables, conditionals, loops, functions.
3. **Enterprise project** — provision and harden a multi-user Linux server.

**Cleanup:** delete the demo service and timer —
`sudo systemctl disable --now hello tick.timer 2>/dev/null ; sudo rm -f /etc/systemd/system/hello.service /etc/systemd/system/tick.service /etc/systemd/system/tick.timer ; sudo systemctl daemon-reload ; rm -f /tmp/cron.log /tmp/timer.log /tmp/at.log`.
:::

## cheatsheet

:::lang fr
Aide-mémoire boot, systemd & processus.
:::

:::lang en
Boot, systemd & processes cheat sheet.
:::

```bash
# Boot / systemd
ps -p 1 -o comm ; systemctl get-default ; systemd-analyze [blame]
sudo systemctl daemon-reload            # APRÈS toute création/modif d'unit / after any unit change
systemctl start|stop|restart|status UNIT
systemctl enable|disable [--now] UNIT   # au boot / at boot
systemctl mask|unmask UNIT ; systemctl is-enabled UNIT

# Logs / journalctl
journalctl -u UNIT ; -b (ce boot) ; --since "1h ago" ; -p err ; -f (suivi/follow)

# Processus & signaux / processes & signals
ps aux ; top ; pgrep -a nom ; pkill nom
kill -TERM PID   # 15, poli/polite (défaut)     kill -KILL PID  # 9, brutal
kill -HUP PID    # 1, souvent recharge/reload
nice -n 10 cmd ; renice -n 5 -p PID     # priorité / priority (-20..19)

# Planification / scheduling
crontab -e|-l|-r   # min h jour mois jour-sem CMD    ; /etc/cron.d /etc/cron.daily
systemctl list-timers ; (.timer -> .service)
echo 'cmd' | at now + 5 min ; atq ; atrm N
```

## resources

:::lang fr
- [`man systemctl`](https://manpages.ubuntu.com/manpages/noble/man1/systemctl.1.html), [`man systemd.service`](https://manpages.ubuntu.com/manpages/noble/man5/systemd.service.5.html), [`man journalctl`](https://manpages.ubuntu.com/manpages/noble/man1/journalctl.1.html).
- [Signaux — `man 7 signal`](https://manpages.ubuntu.com/manpages/noble/man7/signal.7.html) et `man nice`/`man renice`.
- [`man 5 crontab`](https://manpages.ubuntu.com/manpages/noble/man5/crontab.5.html) et [`man systemd.timer`](https://manpages.ubuntu.com/manpages/noble/man5/systemd.timer.5.html).
- Objectifs **LPIC-1 101.2, 101.3, 103.5, 103.6, 107.2**.
:::

:::lang en
- [`man systemctl`](https://manpages.ubuntu.com/manpages/noble/man1/systemctl.1.html), [`man systemd.service`](https://manpages.ubuntu.com/manpages/noble/man5/systemd.service.5.html), [`man journalctl`](https://manpages.ubuntu.com/manpages/noble/man1/journalctl.1.html).
- [Signals — `man 7 signal`](https://manpages.ubuntu.com/manpages/noble/man7/signal.7.html) and `man nice`/`man renice`.
- [`man 5 crontab`](https://manpages.ubuntu.com/manpages/noble/man5/crontab.5.html) and [`man systemd.timer`](https://manpages.ubuntu.com/manpages/noble/man5/systemd.timer.5.html).
- **LPIC-1 101.2, 101.3, 103.5, 103.6, 107.2** objectives.
:::

## troubleshooting

:::lang fr
**`systemctl start` : « Unit hello.service not found ».** Le fichier n'est pas au bon endroit (`/etc/systemd/system/`) ou tu as oublié `daemon-reload`. Vérifie le chemin et recharge.

**Le service passe en `failed` juste après `start`.** Regarde **pourquoi** : `systemctl status hello` et `journalctl -u hello`. Souvent un `ExecStart` incorrect (chemin, guillemets) ou un binaire manquant.

**« Unit is masked ».** Le service est **masqué** : `sudo systemctl unmask hello` avant de pouvoir le démarrer.

**Le job cron ne se déclenche pas.** Le service `cron` tourne-t-il (`systemctl status cron`) ? La syntaxe des 5 champs est-elle correcte (`crontab -l`) ? Le `PATH` de cron est minimal → utilise des **chemins absolus** dans la commande.

**`systemctl list-timers` ne montre pas mon timer.** Tu ne l'as pas activé : `sudo systemctl enable --now tick.timer` (et `daemon-reload` d'abord). Le timer doit être **actif**, pas seulement présent.

**`at: command not found` ou la tâche ne part pas.** Installe `at` (`sudo apt install at`) et vérifie que le service `atd` tourne (`systemctl status atd`).
:::

:::lang en
**`systemctl start`: "Unit hello.service not found".** The file isn't in the right place (`/etc/systemd/system/`) or you forgot `daemon-reload`. Check the path and reload.

**The service goes `failed` right after `start`.** Look at **why**: `systemctl status hello` and `journalctl -u hello`. Often a wrong `ExecStart` (path, quotes) or a missing binary.

**"Unit is masked".** The service is **masked**: `sudo systemctl unmask hello` before you can start it.

**The cron job doesn't fire.** Is the `cron` service running (`systemctl status cron`)? Is the 5-field syntax correct (`crontab -l`)? cron's `PATH` is minimal → use **absolute paths** in the command.

**`systemctl list-timers` doesn't show my timer.** You didn't activate it: `sudo systemctl enable --now tick.timer` (and `daemon-reload` first). The timer must be **active**, not just present.

**`at: command not found` or the task doesn't run.** Install `at` (`sudo apt install at`) and check the `atd` service is running (`systemctl status atd`).
:::
