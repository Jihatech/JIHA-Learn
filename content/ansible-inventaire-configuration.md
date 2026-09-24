---
# — Identité (ne change JAMAIS une fois publié) —
id: ansible-inventaire-configuration
slug: ansible-inventaire-configuration
order: 21
status: published

# — Titres & accroches (bilingue) —
title_fr: "Ansible — inventaire & configuration du nœud de contrôle"
title_en: "Ansible — inventory & control-node configuration"
tagline_fr: "ansible.cfg, inventaire à groupes, group_vars, become, ad-hoc."
tagline_en: "ansible.cfg, grouped inventory, group_vars, become, ad-hoc."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 210
repo: "ansible/ansible"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [ansible-fondamentaux]
next: [ansible-taches-avancees]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [noeud-de-controle, ansible-cfg-precedence, inventaire-statique, patterns-hotes, group-vars-host-vars, become-privileges, commandes-ad-hoc]
concepts_en: [control-node, ansible-cfg-precedence, static-inventory, host-patterns, group-vars-host-vars, become-privileges, ad-hoc-commands]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Passe au niveau RHCE/EX294 : configure ton nœud de contrôle et la précédence d'ansible.cfg, écris un inventaire statique à groupes et enfants, résous les variables group_vars/host_vars, cible avec les patterns d'hôtes, gère l'escalade de privilèges (become) et administre à la volée avec les commandes ad-hoc. Sur deux VM locales, sans cloud."
og_description_en: "Step up to RHCE/EX294 level: configure your control node and ansible.cfg precedence, write a grouped static inventory with children, resolve group_vars/host_vars variables, target with host patterns, handle privilege escalation (become) and administer on the fly with ad-hoc commands. On two local VMs, no cloud."
---

## intro

:::lang fr
Dans le guide fondamentaux, tu gérais **une** machine avec un inventaire écrit à la va-vite sur une ligne. Ça suffit pour découvrir. Ça ne tient pas dès que tu as **plusieurs serveurs de rôles différents** — un parc, quoi. Là, tout se joue sur deux choses que l'examen RHCE teste sans relâche : un **inventaire propre** (groupes, enfants, variables) et un **nœud de contrôle correctement configuré** (`ansible.cfg`, `become`).

Ce guide pose ces fondations pour de bon. Tu vas monter un mini-parc de **deux VM locales** (un « web », une « db »), écrire un inventaire à groupes, comprendre **où** Ansible lit sa configuration et ses variables (la fameuse précédence), cibler finement avec les **patterns d'hôtes**, et administrer à la volée avec les **commandes ad-hoc** — l'outil que tout examinateur RHCE attend que tu dégaines pour les tâches ponctuelles.

**Pour qui c'est :** tu as fait le guide Ansible fondamentaux (playbooks, idempotence, un premier rôle) et tu vises le RHCE/EX294 — ou simplement gérer un vrai parc proprement.

**Quand ce n'est PAS le bon choix :**

- Tu n'as jamais écrit de playbook ni vécu l'idempotence → refais d'abord *Ansible fondamentaux*, c'est un prérequis dur.
- Tu cherches à **créer** les VM elles-mêmes de façon déclarative → c'est Terraform ; ici on **configure** des machines qui existent déjà (on les crée juste une fois avec Multipass, à la main, comme si un collègue te livrait des serveurs).
:::

:::lang en
In the fundamentals guide, you managed **one** machine with a throwaway one-line inventory. That's fine to get started. It falls apart the moment you have **several servers with different roles** — a fleet. Then everything hinges on two things the RHCE exam tests relentlessly: a **clean inventory** (groups, children, variables) and a **properly configured control node** (`ansible.cfg`, `become`).

This guide lays those foundations for real. You'll bring up a mini-fleet of **two local VMs** (a "web" and a "db"), write a grouped inventory, understand **where** Ansible reads its configuration and its variables (the famous precedence), target precisely with **host patterns**, and administer on the fly with **ad-hoc commands** — the tool every RHCE examiner expects you to reach for on one-off tasks.

**Who it's for:** you've done the Ansible fundamentals guide (playbooks, idempotence, a first role) and you're aiming for RHCE/EX294 — or simply to manage a real fleet cleanly.

**When it's NOT the right choice:**

- You've never written a playbook or lived idempotence → do *Ansible fundamentals* first, it's a hard prerequisite.
- You want to **create** the VMs themselves declaratively → that's Terraform; here we **configure** machines that already exist (we just create them once with Multipass, by hand, as if a colleague handed you servers).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Configurer un **nœud de contrôle** et comprendre la **précédence d'`ansible.cfg`** (env → répertoire → home → /etc).
- Écrire un **inventaire statique** à groupes, sous-groupes (`:children`) et plages d'hôtes, en INI **et** en YAML.
- Ranger les variables dans `group_vars/` et `host_vars/` et **prédire** laquelle gagne.
- Cibler avec les **patterns d'hôtes** (`all`, `web:db`, `prod:!db1`, `~regex`).
- Gérer l'**escalade de privilèges** (`become`, `become_user`, `--ask-become-pass`).
- Lancer des **commandes ad-hoc** pour les tâches ponctuelles et savoir quand elles battent un playbook.
:::

:::lang en
By the end of this guide, you can:

- Configure a **control node** and understand **`ansible.cfg` precedence** (env → directory → home → /etc).
- Write a **static inventory** with groups, sub-groups (`:children`) and host ranges, in both INI **and** YAML.
- Organize variables in `group_vars/` and `host_vars/` and **predict** which one wins.
- Target with **host patterns** (`all`, `web:db`, `prod:!db1`, `~regex`).
- Handle **privilege escalation** (`become`, `become_user`, `--ask-become-pass`).
- Run **ad-hoc commands** for one-off tasks and know when they beat a playbook.
:::

## prerequisites

:::lang fr
- Le guide **Ansible fondamentaux** terminé (tu sais lancer `ansible-playbook`, tu as vécu l'idempotence).
- **Ansible installé** sur ton nœud de contrôle (ton laptop). Vérifie : `ansible --version` doit afficher **≥ 2.16**. Sinon : `sudo apt install ansible` (Debian/Ubuntu), `sudo dnf install ansible` (Fedora), ou `pipx install ansible` (portable, recommandé pour avoir une version récente).
- **Multipass** installé (`multipass version`) — pour les deux VM locales. Sur macOS/Windows il tourne nativement ; sur Linux via `snap install multipass`.
- Une **paire de clés SSH** (`ls ~/.ssh/id_ed25519.pub` ; sinon `ssh-keygen -t ed25519`).
:::

:::lang en
- The **Ansible fundamentals** guide done (you can run `ansible-playbook`, you've lived idempotence).
- **Ansible installed** on your control node (your laptop). Check: `ansible --version` must show **≥ 2.16**. Otherwise: `sudo apt install ansible` (Debian/Ubuntu), `sudo dnf install ansible` (Fedora), or `pipx install ansible` (portable, recommended for a recent version).
- **Multipass** installed (`multipass version`) — for the two local VMs. On macOS/Windows it runs natively; on Linux via `snap install multipass`.
- An **SSH key pair** (`ls ~/.ssh/id_ed25519.pub`; otherwise `ssh-keygen -t ed25519`).
:::

## concepts

:::lang fr
**Nœud de contrôle vs nœuds gérés.** Le *nœud de contrôle* est la machine où Ansible est installé (ton laptop). Les *nœuds gérés* sont les serveurs qu'il pilote en SSH. Ansible n'installe **rien** en permanence sur les gérés : c'est « agentless ».

**`ansible.cfg` et sa précédence.** Ansible cherche sa config dans cet ordre, et **s'arrête au premier trouvé** :

1. la variable d'environnement `ANSIBLE_CONFIG` (chemin d'un fichier) ;
2. `./ansible.cfg` (dans le répertoire courant) — **le plus courant en projet** ;
3. `~/.ansible.cfg` (home) ;
4. `/etc/ansible/ansible.cfg` (système).

⚠️ Détail de sécurité important : `./ansible.cfg` n'est lu que si le répertoire **ne t'appartient pas via un chemin « world-writable »**. En pratique, garde ton projet dans ton home et tout va bien.

**Inventaire.** La liste des hôtes gérés, organisée en **groupes**. Un groupe peut contenir des hôtes ou d'autres groupes (`:children`). Deux groupes existent toujours : `all` (tout le monde) et `ungrouped` (les hôtes sans groupe). Format INI (concis) ou YAML (structuré) — l'examen accepte les deux.

**Variables d'inventaire : `group_vars/` et `host_vars/`.** Plutôt que d'entasser les variables dans le fichier d'inventaire, on les range dans des dossiers à côté : `group_vars/web.yml` s'applique à tout le groupe `web`, `host_vars/db1.yml` au seul hôte `db1`. Règle d'or : **plus c'est spécifique, plus ça gagne** — `host_vars` bat `group_vars`, un groupe enfant bat son parent.

**`become` (escalade de privilèges).** Par défaut Ansible se connecte avec un utilisateur non-root. `become: true` bascule en root (via `sudo`) pour la tâche ou le play. `become_user:` permet de devenir un autre utilisateur que root.

**Commande ad-hoc.** Un one-liner `ansible <pattern> -m <module> -a "<args>"` : idéal pour une action **ponctuelle** (redémarrer un service, vérifier un fichier, collecter un fact) sans écrire de playbook.
:::

:::lang en
**Control node vs managed nodes.** The *control node* is the machine where Ansible is installed (your laptop). The *managed nodes* are the servers it drives over SSH. Ansible installs **nothing** permanent on the managed nodes: it's "agentless".

**`ansible.cfg` and its precedence.** Ansible looks for its config in this order and **stops at the first found**:

1. the `ANSIBLE_CONFIG` environment variable (a file path);
2. `./ansible.cfg` (in the current directory) — **the most common in a project**;
3. `~/.ansible.cfg` (home);
4. `/etc/ansible/ansible.cfg` (system).

⚠️ Important security detail: `./ansible.cfg` is read only if the directory is **not world-writable**. In practice, keep your project in your home and you're fine.

**Inventory.** The list of managed hosts, organized into **groups**. A group can hold hosts or other groups (`:children`). Two groups always exist: `all` (everyone) and `ungrouped` (hosts with no group). INI format (concise) or YAML (structured) — the exam accepts both.

**Inventory variables: `group_vars/` and `host_vars/`.** Rather than piling variables into the inventory file, we place them in folders alongside: `group_vars/web.yml` applies to the whole `web` group, `host_vars/db1.yml` to only host `db1`. Golden rule: **the more specific, the more it wins** — `host_vars` beats `group_vars`, a child group beats its parent.

**`become` (privilege escalation).** By default Ansible connects as a non-root user. `become: true` switches to root (via `sudo`) for the task or play. `become_user:` lets you become a user other than root.

**Ad-hoc command.** A one-liner `ansible <pattern> -m <module> -a "<args>"`: ideal for a **one-off** action (restart a service, check a file, gather a fact) without writing a playbook.
:::

:::figure ansible-inventory-layout
caption_fr: "Schéma 1. Structure d'un projet Ansible : ansible.cfg à la racine, inventaire à groupes, et les variables rangées par groupe/hôte dans group_vars/ et host_vars/."
caption_en: "Figure 1. An Ansible project layout: ansible.cfg at the root, a grouped inventory, and variables organized by group/host in group_vars/ and host_vars/."
:::

## walkthrough

:::lang fr
On avance ainsi : projet & `ansible.cfg` → deux VM gérées → inventaire à groupes → patterns d'hôtes → group_vars/host_vars → become & ad-hoc admin → prouver la précédence.
:::

:::lang en
We'll go like this: project & `ansible.cfg` → two managed VMs → grouped inventory → host patterns → group_vars/host_vars → become & ad-hoc admin → prove precedence.
:::

### step-01

:::lang fr
**Objectif.** Créer le **squelette du projet** et un `ansible.cfg` qui te suit partout.

**🤔 Pourquoi un `ansible.cfg` de projet ?** Pour ne plus taper `-i inventory` ni `--ask-become-pass` à chaque fois, et surtout pour que **tout le monde qui clone le repo** ait la même config. Un `ansible.cfg` à la racine du projet, c'est le réflexe RHCE.

Crée l'arborescence :
:::

:::lang en
**Goal.** Create the **project skeleton** and an `ansible.cfg` that follows you everywhere.

**🤔 Why a project `ansible.cfg`?** So you no longer type `-i inventory` or `--ask-become-pass` every time, and above all so **everyone who clones the repo** has the same config. An `ansible.cfg` at the project root is the RHCE reflex.

Create the tree:
:::

```bash
mkdir -p ~/ansible-parc/{group_vars,host_vars}
cd ~/ansible-parc
```

```ini
# ~/ansible-parc/ansible.cfg
[defaults]
inventory       = inventory.ini
remote_user     = ubuntu
host_key_checking = false          # accepte l'empreinte au 1er contact (labo) / accept fingerprint on first contact (lab)
# Sur une VRAIE prod, laisse host_key_checking à true. / On REAL prod, keep host_key_checking true.

[privilege_escalation]
become        = false              # on l'active à la tâche, pas partout / enable per-task, not everywhere
become_method = sudo
become_user   = root
```

:::lang fr
**✅ Vérification :** depuis `~/ansible-parc`, lance `ansible-config dump --only-changed`. Tu dois voir tes réglages (`DEFAULT_HOST_LIST`, `DEFAULT_REMOTE_USER = ubuntu`, `HOST_KEY_CHECKING = False`) avec la source `ansible.cfg`. Si la sortie est vide, tu n'es pas dans le bon dossier — Ansible n'a pas trouvé ton fichier.
:::

:::lang en
**✅ Check:** from `~/ansible-parc`, run `ansible-config dump --only-changed`. You should see your settings (`DEFAULT_HOST_LIST`, `DEFAULT_REMOTE_USER = ubuntu`, `HOST_KEY_CHECKING = False`) with source `ansible.cfg`. If the output is empty, you're not in the right folder — Ansible didn't find your file.
:::

### step-02

:::lang fr
**Objectif.** Lancer **deux VM locales** — `web1` et `db1` — avec ta clé SSH injectée, comme si on te livrait deux serveurs.

**🤔 Pourquoi deux VM ?** Parce qu'un inventaire à un seul hôte n'apprend rien sur les groupes et les patterns — le cœur du RHCE. Deux hôtes de rôles différents, c'est le plus petit parc réaliste.

Crée un fichier cloud-init qui autorise ta clé publique (remplace le contenu par **ta** clé) :
:::

:::lang en
**Goal.** Launch **two local VMs** — `web1` and `db1` — with your SSH key injected, as if two servers were handed to you.

**🤔 Why two VMs?** Because a single-host inventory teaches nothing about groups and patterns — the heart of RHCE. Two hosts with different roles is the smallest realistic fleet.

Create a cloud-init file that authorizes your public key (replace the content with **your** key):
:::

```bash
# Génère le cloud-init en y insérant TA clé publique / Generate cloud-init with YOUR public key
cat > cloud-init.yaml <<EOF
#cloud-config
users:
  - name: ubuntu
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    ssh_authorized_keys:
      - $(cat ~/.ssh/id_ed25519.pub)
EOF

multipass launch 24.04 --name web1 --cpus 1 --memory 1G --disk 5G --cloud-init cloud-init.yaml
multipass launch 24.04 --name db1  --cpus 1 --memory 1G --disk 5G --cloud-init cloud-init.yaml

multipass list        # relève les IPv4 des deux VM / note both VMs' IPv4
```

:::lang fr
**✅ Vérification :** `multipass list` montre `web1` et `db1` en état `Running` avec une IPv4 chacune. Teste l'accès SSH à la main : `ssh ubuntu@<IP_de_web1> hostname` renvoie `web1` sans demander de mot de passe. Note les deux IP, tu en as besoin à l'étape suivante.
:::

:::lang en
**✅ Check:** `multipass list` shows `web1` and `db1` in `Running` state, each with an IPv4. Test SSH access by hand: `ssh ubuntu@<web1_IP> hostname` returns `web1` without asking for a password. Note both IPs, you need them next.
:::

### step-03

:::lang fr
**Objectif.** Écrire un **inventaire à groupes** propre, avec un groupe parent `prod` qui contient `web` et `db`.

**🤔 `:children`, c'est quoi ?** Un groupe **de groupes**. `[prod:children]` dit « le groupe `prod` est composé des groupes `web` et `db` ». Comme ça, une variable posée sur `prod` descend sur tous les hôtes web **et** db, sans les relister.

Remplace `<IP_web1>` et `<IP_db1>` par les IP relevées :
:::

:::lang en
**Goal.** Write a clean **grouped inventory**, with a parent group `prod` containing `web` and `db`.

**🤔 What is `:children`?** A group **of groups**. `[prod:children]` says "the `prod` group is made of the `web` and `db` groups". That way, a variable set on `prod` flows down to all web **and** db hosts, without relisting them.

Replace `<web1_IP>` and `<db1_IP>` with the IPs you noted:
:::

```ini
# ~/ansible-parc/inventory.ini
[web]
web1 ansible_host=<IP_web1>

[db]
db1 ansible_host=<IP_db1>

# prod = web + db (groupe de groupes) / prod = web + db (group of groups)
[prod:children]
web
db
```

```bash
ansible-inventory --graph          # visualise l'arbre des groupes / visualize the group tree
ansible-inventory --host web1      # les variables résolues pour web1 / resolved vars for web1
```

:::lang fr
**✅ Vérification :** `ansible-inventory --graph` affiche l'arbre :

```
@all:
  |--@ungrouped:
  |--@prod:
  |  |--@web:
  |  |  |--web1
  |  |--@db:
  |  |  |--db1
```

`web1` et `db1` apparaissent bien sous `prod`, via `web` et `db`. Aucun hôte sous `ungrouped` (qui reste vide ; son emplacement dans l'arbre peut varier selon la version d'Ansible — seule l'appartenance compte).
:::

:::lang en
**✅ Check:** `ansible-inventory --graph` shows the tree:

```
@all:
  |--@ungrouped:
  |--@prod:
  |  |--@web:
  |  |  |--web1
  |  |--@db:
  |  |  |--db1
```

`web1` and `db1` appear under `prod`, via `web` and `db`. No host under `ungrouped` (which stays empty; its position in the tree may vary by Ansible version — only membership matters).
:::

### step-04

:::lang fr
**Objectif.** Tester la connectivité de tout le parc, puis **cibler finement** avec les patterns d'hôtes.

**🤔 Les patterns, à quoi ça sert ?** À l'examen comme en prod, tu veux souvent agir sur un sous-ensemble : « tous sauf db1 », « web et db », « les hôtes qui matchent une regex ». Les patterns évitent de créer un groupe jetable à chaque fois.
:::

:::lang en
**Goal.** Test connectivity across the whole fleet, then **target precisely** with host patterns.

**🤔 What are patterns for?** On the exam as in prod, you often want to act on a subset: "all but db1", "web and db", "hosts matching a regex". Patterns save you from creating a throwaway group each time.
:::

```bash
ansible all -m ping                 # tout le parc / whole fleet
ansible prod -m ping                # via le groupe parent / via the parent group
ansible 'web:db' -m ping            # union : web OU db / union: web OR db
ansible 'prod:!db1' -m ping         # prod SAUF db1 / prod EXCEPT db1
ansible 'web:&prod' --list-hosts    # intersection : web ET prod / intersection: web AND prod
ansible '~^web' --list-hosts        # regex : hôtes commençant par "web" / regex: hosts starting with "web"
```

:::lang fr
**✅ Vérification :** `ansible all -m ping` renvoie `pong` en vert (`SUCCESS`) pour `web1` **et** `db1`. `ansible 'prod:!db1' -m ping` ne touche que `web1`. `ansible '~^web' --list-hosts` liste `web1` seul. `--list-hosts` est ton ami : il montre **qui serait ciblé** sans rien exécuter.
:::

:::lang en
**✅ Check:** `ansible all -m ping` returns `pong` in green (`SUCCESS`) for `web1` **and** `db1`. `ansible 'prod:!db1' -m ping` touches only `web1`. `ansible '~^web' --list-hosts` lists `web1` alone. `--list-hosts` is your friend: it shows **who would be targeted** without executing anything.
:::

### step-05

:::lang fr
**Objectif.** Ranger les variables dans `group_vars/` et `host_vars/`, et **observer laquelle gagne**.

**🤔 Pourquoi des dossiers plutôt que dans l'inventaire ?** Parce que ça sépare *qui existe* (l'inventaire) de *comment c'est configuré* (les variables). Et parce qu'Ansible applique une **précédence** claire : `host_vars` (spécifique) bat `group_vars` d'un enfant, qui bat `group_vars` du parent, qui bat `group_vars/all`.

Crée trois fichiers de variables :
:::

:::lang en
**Goal.** Organize variables in `group_vars/` and `host_vars/`, and **watch which one wins**.

**🤔 Why folders rather than the inventory?** Because it separates *who exists* (the inventory) from *how it's configured* (the variables). And because Ansible applies a clear **precedence**: `host_vars` (specific) beats a child's `group_vars`, which beats the parent's `group_vars`, which beats `group_vars/all`.

Create three variable files:
:::

```yaml
# ~/ansible-parc/group_vars/all.yml
message: "je viens de group_vars/all"
timezone: "Europe/Paris"
```

```yaml
# ~/ansible-parc/group_vars/web.yml
message: "je viens de group_vars/web"
http_port: 8080
```

```yaml
# ~/ansible-parc/host_vars/web1.yml
message: "je viens de host_vars/web1"
```

```bash
ansible web1 -m debug -a "var=message"    # qui gagne pour web1 ? / who wins for web1?
ansible db1  -m debug -a "var=message"    # et pour db1 ? / and for db1?
ansible web1 -m debug -a "var=http_port"  # variable de groupe héritée / inherited group var
```

:::lang fr
**✅ Vérification :** pour `web1`, `message` vaut **« je viens de host_vars/web1 »** — le plus spécifique gagne. Pour `db1` (pas de host_vars, pas dans `web`), `message` vaut **« je viens de group_vars/all »**. Et `web1` hérite bien de `http_port: 8080` depuis `group_vars/web.yml`. Tu viens de *voir* la précédence, pas juste de la lire.
:::

:::lang en
**✅ Check:** for `web1`, `message` is **"je viens de host_vars/web1"** — the most specific wins. For `db1` (no host_vars, not in `web`), `message` is **"je viens de group_vars/all"**. And `web1` correctly inherits `http_port: 8080` from `group_vars/web.yml`. You just *saw* precedence, not merely read about it.
:::

### step-06

:::lang fr
**Objectif.** Administrer le parc **en ad-hoc** avec escalade de privilèges : installer un paquet, gérer un service, écrire un fichier — sans playbook.

**🤔 Ad-hoc ou playbook ?** Ad-hoc pour une action **ponctuelle et jetable** (« redémarre nginx sur tout le web maintenant »). Playbook pour quelque chose de **reproductible et versionné**. L'examen RHCE attend les deux réflexes.

`-b` (`--become`) escalade en root. Nos VM Multipass ont un `sudo` **sans mot de passe** (voir le cloud-init) — donc pas besoin de `--ask-become-pass` ici. Sur une machine classique, tu l'ajouterais.
:::

:::lang en
**Goal.** Administer the fleet **ad-hoc** with privilege escalation: install a package, manage a service, write a file — no playbook.

**🤔 Ad-hoc or playbook?** Ad-hoc for a **one-off, throwaway** action ("restart nginx on all web now"). Playbook for something **reproducible and versioned**. The RHCE exam expects both reflexes.

`-b` (`--become`) escalates to root. Our Multipass VMs have **passwordless** sudo (see the cloud-init) — so no need for `--ask-become-pass` here. On a regular machine, you'd add it.
:::

```bash
# Installer un paquet sur tout le groupe web (root requis → -b) / install a package on all web (root → -b)
ansible web -b -m ansible.builtin.apt -a "name=nginx state=present update_cache=true"

# S'assurer que le service tourne et démarre au boot / ensure the service runs and starts at boot
ansible web -b -m ansible.builtin.service -a "name=nginx state=started enabled=true"

# Vérifier l'état sans rien changer (module command, lecture seule) / check state read-only
ansible web -b -m ansible.builtin.command -a "systemctl is-active nginx"

# Collecter un fact précis sur tout le parc / gather one precise fact across the fleet
ansible all -m ansible.builtin.setup -a "filter=ansible_distribution_version"
```

:::lang fr
**✅ Vérification :** la tâche `apt` renvoie `CHANGED` la première fois (nginx installé) puis `SUCCESS`/`ok` si tu la relances — l'idempotence marche aussi en ad-hoc. `systemctl is-active nginx` renvoie `active` sur `web1`. Et `db1` n'a **pas** nginx : tu n'as ciblé que `web`.
:::

:::lang en
**✅ Check:** the `apt` task returns `CHANGED` the first time (nginx installed) then `SUCCESS`/`ok` if you rerun it — idempotence works in ad-hoc too. `systemctl is-active nginx` returns `active` on `web1`. And `db1` does **not** have nginx: you targeted only `web`.
:::

### step-07

:::lang fr
**Objectif.** **Prouver** la précédence d'`ansible.cfg` — le piège RHCE classique où « Ansible ne lit pas mon fichier ».

**🤔 Pourquoi ça compte ?** Le jour de l'examen (et en prod), tu peux avoir plusieurs `ansible.cfg` qui traînent. Savoir **lequel gagne** t'évite une heure de panique. `ansible --version` te dit noir sur blanc quel fichier a été chargé.
:::

:::lang en
**Goal.** **Prove** `ansible.cfg` precedence — the classic RHCE trap where "Ansible doesn't read my file".

**🤔 Why it matters?** On exam day (and in prod), you may have several stray `ansible.cfg`. Knowing **which one wins** saves you an hour of panic. `ansible --version` tells you in black and white which file was loaded.
:::

```bash
# Depuis le projet : c'est ./ansible.cfg qui gagne / from the project: ./ansible.cfg wins
cd ~/ansible-parc
ansible --version | grep "config file"      # -> config file = /home/.../ansible-parc/ansible.cfg

# ANSIBLE_CONFIG écrase TOUT le reste / ANSIBLE_CONFIG overrides EVERYTHING
echo "[defaults]" > /tmp/autre.cfg
echo "forks = 2" >> /tmp/autre.cfg
ANSIBLE_CONFIG=/tmp/autre.cfg ansible --version | grep "config file"   # -> /tmp/autre.cfg

# Hors projet : ./ansible.cfg n'existe pas ici, Ansible remonte la chaîne / outside the project
cd /tmp && ansible --version | grep "config file"     # -> ~/.ansible.cfg ou /etc/ansible/ansible.cfg, ou aucun
```

:::lang fr
**✅ Vérification :** depuis `~/ansible-parc`, la ligne `config file` pointe sur **ton** `ansible.cfg` de projet. Avec `ANSIBLE_CONFIG=/tmp/autre.cfg` en préfixe, elle pointe sur `/tmp/autre.cfg` — la variable d'env gagne toujours. Depuis `/tmp` (sans `ansible.cfg` local), elle pointe ailleurs (home ou système) ou affiche `None`. Tu tiens la précédence dans les doigts.
:::

:::lang en
**✅ Check:** from `~/ansible-parc`, the `config file` line points to **your** project `ansible.cfg`. With `ANSIBLE_CONFIG=/tmp/autre.cfg` as a prefix, it points to `/tmp/autre.cfg` — the env var always wins. From `/tmp` (no local `ansible.cfg`), it points elsewhere (home or system) or shows `None`. You've got precedence in your fingers.
:::

## pitfalls

:::lang fr
**1. Oublier dans quel dossier on est.** `./ansible.cfg` et `group_vars/` sont **relatifs au répertoire courant**. Lance toujours tes commandes depuis la racine du projet, sinon Ansible ne trouve ni ta config ni tes variables. Le symptôme : `ansible-config dump --only-changed` est vide.

**2. Écrire les IP en dur dans les patterns.** Un pattern cible des **noms d'hôtes/groupes** (`web1`, `web`), pas des IP. L'IP vit dans `ansible_host=` côté inventaire.

**3. Confondre `web:db` (union) et `web:&db` (intersection).** `web:db` = web **ou** db (les deux groupes). `web:&db` = web **et** db (un hôte qui serait dans les deux). Le `:!` exclut. Teste toujours avec `--list-hosts` avant d'exécuter.

**4. Mettre `become: true` dans `[defaults]` d'ansible.cfg.** Escalader **partout par défaut** viole le moindre privilège et masque les vrais besoins. Active `become` à la tâche ou au play, pas globalement.

**5. Croire que `host_vars` s'applique à un groupe.** `host_vars/web.yml` ne s'applique **pas** au groupe `web` — `web` est un groupe, pas un hôte. Pour un groupe, c'est `group_vars/web.yml`. Confusion classique.

**6. `group_vars/all` vs un fichier nommé `all`.** Ansible charge `group_vars/all.yml` (ou un dossier `group_vars/all/`) pour **tous** les hôtes. Ne le nomme pas au hasard : le nom du fichier = le nom du groupe.
:::

:::lang en
**1. Forgetting which folder you're in.** `./ansible.cfg` and `group_vars/` are **relative to the current directory**. Always run your commands from the project root, otherwise Ansible finds neither your config nor your variables. Symptom: `ansible-config dump --only-changed` is empty.

**2. Hardcoding IPs in patterns.** A pattern targets **host/group names** (`web1`, `web`), not IPs. The IP lives in `ansible_host=` on the inventory side.

**3. Confusing `web:db` (union) and `web:&db` (intersection).** `web:db` = web **or** db (both groups). `web:&db` = web **and** db (a host in both). `:!` excludes. Always test with `--list-hosts` before executing.

**4. Putting `become: true` in ansible.cfg `[defaults]`.** Escalating **everywhere by default** violates least privilege and hides real needs. Enable `become` per task or per play, not globally.

**5. Thinking `host_vars` applies to a group.** `host_vars/web.yml` does **not** apply to the `web` group — `web` is a group, not a host. For a group it's `group_vars/web.yml`. Classic confusion.

**6. `group_vars/all` vs a file named `all`.** Ansible loads `group_vars/all.yml` (or an `group_vars/all/` folder) for **all** hosts. Don't name it randomly: the file name = the group name.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu expliques la précédence d'`ansible.cfg` et tu la **prouves** avec `ansible --version`.
- [ ] Tu écris un inventaire à groupes avec `:children` et tu lis l'arbre via `ansible-inventory --graph`.
- [ ] Tu cibles avec `all`, `web:db`, `prod:!db1`, `~regex` et tu vérifies avec `--list-hosts`.
- [ ] Tu ranges une variable dans `group_vars/` vs `host_vars/` et tu **prédis** laquelle gagne.
- [ ] Tu administres le parc en ad-hoc avec `-b` (become).
- [ ] `ansible all -m ping` répond `pong` sur les deux VM.

Six cases = ton nœud de contrôle et ton inventaire sont au niveau RHCE. La suite : le contrôle de flux dans les playbooks.
:::

:::lang en
You know it works when…

- [ ] You explain `ansible.cfg` precedence and **prove** it with `ansible --version`.
- [ ] You write a grouped inventory with `:children` and read the tree via `ansible-inventory --graph`.
- [ ] You target with `all`, `web:db`, `prod:!db1`, `~regex` and verify with `--list-hosts`.
- [ ] You place a variable in `group_vars/` vs `host_vars/` and **predict** which wins.
- [ ] You administer the fleet ad-hoc with `-b` (become).
- [ ] `ansible all -m ping` answers `pong` on both VMs.

Six boxes = your control node and inventory are at RHCE level. Next up: flow control in playbooks.
:::

## next

:::lang fr
La suite du track RHCE :

1. **Ansible — tâches avancées & contrôle de flux** : boucles, conditions `when`, handlers, tags, blocks (`block`/`rescue`/`always`), `register`/`failed_when`. C'est là qu'un playbook devient robuste.
2. Plus loin : variables & facts & templates Jinja2, rôles & collections, Vault, puis le **projet d'entreprise** RHCE.
:::

:::lang en
The RHCE track continues:

1. **Ansible — advanced tasks & flow control**: loops, `when` conditions, handlers, tags, blocks (`block`/`rescue`/`always`), `register`/`failed_when`. That's where a playbook becomes robust.
2. Further along: variables & facts & Jinja2 templates, roles & collections, Vault, then the RHCE **enterprise project**.
:::

## cheatsheet

:::lang fr
Aide-mémoire inventaire & configuration.
:::

:::lang en
Inventory & configuration cheat sheet.
:::

```bash
# Configuration / Config
ansible --version                       # quel ansible.cfg est chargé (ligne "config file") / which ansible.cfg is loaded
ansible-config dump --only-changed      # réglages effectifs vs défauts / effective settings vs defaults
ANSIBLE_CONFIG=/chemin/f.cfg ansible ... # forcer un fichier de config / force a config file

# Inventaire / Inventory
ansible-inventory --graph               # arbre des groupes / group tree
ansible-inventory --list                # inventaire complet en JSON / full inventory as JSON
ansible-inventory --host web1           # variables résolues d'un hôte / a host's resolved vars

# Patterns (avec --list-hosts pour prévisualiser) / Patterns (with --list-hosts to preview)
ansible all --list-hosts                # tout le parc / whole fleet
ansible 'web:db' --list-hosts           # union / union
ansible 'prod:!db1' --list-hosts        # exclusion / exclusion
ansible 'web:&prod' --list-hosts        # intersection / intersection
ansible '~^web' --list-hosts            # regex

# Ad-hoc
ansible web -m ping                     # test de connexion / connectivity test
ansible web -b -m apt -a "name=nginx state=present"   # avec become / with become
ansible all -m setup -a "filter=ansible_distribution*"  # facts filtrés / filtered facts
```

```ini
# Inventaire INI type / typical INI inventory
[web]
web1 ansible_host=192.168.64.10

[db]
db1 ansible_host=192.168.64.11

[prod:children]
web
db

[prod:vars]
ansible_user=ubuntu
```

## resources

:::lang fr
- [Comment construire son inventaire](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html) — groupes, variables, patterns.
- [Précédence des variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#variable-precedence-where-should-i-put-a-variable) — l'ordre officiel complet.
- [Fichier de configuration Ansible](https://docs.ansible.com/ansible/latest/reference_appendices/config.html) — toutes les options d'`ansible.cfg`.
- [Patterns : cibler des hôtes](https://docs.ansible.com/ansible/latest/inventory_guide/intro_patterns.html) — la syntaxe complète.
- [Objectifs RHCE / EX294](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — la certification visée.
:::

:::lang en
- [How to build your inventory](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html) — groups, variables, patterns.
- [Variable precedence](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#variable-precedence-where-should-i-put-a-variable) — the full official order.
- [Ansible configuration file](https://docs.ansible.com/ansible/latest/reference_appendices/config.html) — all `ansible.cfg` options.
- [Patterns: targeting hosts](https://docs.ansible.com/ansible/latest/inventory_guide/intro_patterns.html) — the full syntax.
- [RHCE / EX294 objectives](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — the target certification.
:::

## troubleshooting

:::lang fr
**`ansible-config dump --only-changed` est vide.** Tu n'es pas dans `~/ansible-parc`. `./ansible.cfg` est relatif : reviens dans le dossier du projet.

**`[WARNING]: No inventory was parsed, only implicit localhost is available`.** Ton `inventory` n'est pas trouvé : vérifie le chemin dans `ansible.cfg` (`inventory = inventory.ini`) et que tu lances depuis la racine du projet.

**`web1 | UNREACHABLE! => "Failed to connect... Permission denied (publickey)"`.** La clé publique n'est pas dans la VM : recrée le `cloud-init.yaml` avec **ta** clé (`cat ~/.ssh/id_ed25519.pub`) et relance `multipass launch`. Ou teste à la main `ssh ubuntu@<IP>`.

**`Missing sudo password`.** Ta cible n'a pas de sudo sans mot de passe. Ajoute `--ask-become-pass` (ou `-K`). Nos VM Multipass, elles, ont `NOPASSWD` via le cloud-init.

**Une variable ne prend pas la valeur attendue.** Tu as un conflit de précédence. Lance `ansible <hôte> -m debug -a "var=<nom>"` pour voir la valeur effective, et `ansible-inventory --host <hôte>` pour voir d'où elle vient. Rappel : plus spécifique = gagne.

**`multipass launch` échoue ou reste bloqué.** Vérifie l'hyperviseur (`multipass list`) ; en dernier recours `multipass delete web1 --purge && multipass purge` puis relance.
:::

:::lang en
**`ansible-config dump --only-changed` is empty.** You're not in `~/ansible-parc`. `./ansible.cfg` is relative: go back to the project folder.

**`[WARNING]: No inventory was parsed, only implicit localhost is available`.** Your `inventory` isn't found: check the path in `ansible.cfg` (`inventory = inventory.ini`) and that you run from the project root.

**`web1 | UNREACHABLE! => "Failed to connect... Permission denied (publickey)"`.** The public key isn't in the VM: recreate `cloud-init.yaml` with **your** key (`cat ~/.ssh/id_ed25519.pub`) and rerun `multipass launch`. Or test by hand `ssh ubuntu@<IP>`.

**`Missing sudo password`.** Your target has no passwordless sudo. Add `--ask-become-pass` (or `-K`). Our Multipass VMs have `NOPASSWD` via cloud-init.

**A variable doesn't take the expected value.** You have a precedence conflict. Run `ansible <host> -m debug -a "var=<name>"` to see the effective value, and `ansible-inventory --host <host>` to see where it comes from. Reminder: more specific = wins.

**`multipass launch` fails or hangs.** Check the hypervisor (`multipass list`); as a last resort `multipass delete web1 --purge && multipass purge` then relaunch.
:::
