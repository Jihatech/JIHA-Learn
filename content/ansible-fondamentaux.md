---
# — Identité (ne change JAMAIS une fois publié) —
id: ansible-fondamentaux
slug: ansible-fondamentaux
order: 7
status: published

# — Titres & accroches (bilingue) —
title_fr: "Ansible — automatiser tes serveurs"
title_en: "Ansible — automate your servers"
tagline_fr: "Inventaire, playbooks idempotents, variables, rôles."
tagline_en: "Inventory, idempotent playbooks, variables, roles."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 180
repo: "ansible/ansible"
last_review: "2026-07-31"

# — Relations de parcours (par id) —
prerequisites: [linux-fondamentaux]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [control-node-vs-managed, inventaire, modules-taches, idempotence, variables-jinja2, handlers, roles]
concepts_en: [control-node-vs-managed, inventory, modules-tasks, idempotence, variables-jinja2, handlers, roles]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Apprends Ansible sur ta propre machine : nœud de contrôle, inventaire, premier playbook idempotent, une VM locale gérée en SSH, variables et templates Jinja2, handlers et rôles réutilisables."
og_description_en: "Learn Ansible on your own machine: control node, inventory, first idempotent playbook, a local VM managed over SSH, Jinja2 variables and templates, handlers and reusable roles."
---

## intro

:::lang fr
Jusqu'ici, tu configures tes machines **à la main** : tu te connectes, tu tapes des commandes, tu édites des fichiers. Ça marche pour une machine. Pour dix, c'est ingérable — et surtout **non reproductible** : impossible de savoir si deux serveurs sont vraiment configurés pareil.

**Ansible** résout ça : tu décris l'**état voulu** de tes machines dans des fichiers YAML (les *playbooks*), et Ansible se connecte en SSH pour l'appliquer. Pas d'agent à installer sur les machines, juste SSH et Python. Et surtout : c'est **idempotent** — rejouer un playbook déjà appliqué ne casse rien, il ne change que ce qui doit l'être.

Ce guide se fait **entièrement sur ta machine** : ton laptop est le *nœud de contrôle*, et tu gères d'abord `localhost`, puis une **vraie VM locale** (Multipass) en SSH — le même modèle qu'un parc de serveurs, sans en louer aucun.

**Pour qui c'est :** tu as le socle Linux (SSH, services, paquets) et tu veux arrêter de configurer tes machines à la main.

**Quand ce n'est PAS le bon choix :**

- Tu ne maîtrises pas encore les fondamentaux Linux (permissions, systemd, paquets) → repasse par ce guide, c'est un prérequis dur.
- Tu cherches à **provisionner de l'infra** (créer des serveurs, des réseaux) : c'est le rôle de Terraform ; Ansible **configure** des machines qui existent déjà.
:::

:::lang en
So far, you configure your machines **by hand**: you connect, type commands, edit files. That works for one machine. For ten, it's unmanageable — and above all **not reproducible**: there's no way to know if two servers are truly configured the same.

**Ansible** solves this: you describe the **desired state** of your machines in YAML files (*playbooks*), and Ansible connects over SSH to apply it. No agent to install on the machines, just SSH and Python. And crucially: it's **idempotent** — replaying an already-applied playbook breaks nothing, it changes only what must change.

This guide is done **entirely on your machine**: your laptop is the *control node*, and you first manage `localhost`, then a **real local VM** (Multipass) over SSH — the same model as a fleet of servers, without renting any.

**Who it's for:** you have the Linux foundation (SSH, services, packages) and you want to stop configuring your machines by hand.

**When it's NOT the right choice:**

- You're not comfortable with Linux fundamentals (permissions, systemd, packages) yet → go back through that guide, it's a hard prerequisite.
- You're looking to **provision infrastructure** (create servers, networks): that's Terraform's job; Ansible **configures** machines that already exist.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Distinguer **nœud de contrôle** et **nœuds gérés**, et le rôle de SSH.
- Écrire un **inventaire** et lancer des **commandes ad-hoc**.
- Écrire un **playbook** et comprendre l'**idempotence** (le concept central).
- Gérer une **VM locale** en SSH comme un vrai serveur.
- Utiliser **variables** et **templates Jinja2** pour générer des configs.
- Déclencher une action conditionnelle avec un **handler** (`notify`).
- Structurer ton code en **rôle** réutilisable.
:::

:::lang en
By the end of this guide, you'll know how to:

- Tell apart the **control node** and **managed nodes**, and SSH's role.
- Write an **inventory** and run **ad-hoc commands**.
- Write a **playbook** and understand **idempotence** (the central concept).
- Manage a **local VM** over SSH like a real server.
- Use **variables** and **Jinja2 templates** to generate configs.
- Trigger a conditional action with a **handler** (`notify`).
- Structure your code as a reusable **role**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Le guide **Linux fondamentaux** acquis (SSH, `systemd`, paquets, permissions — prérequis dur).
- **Ansible** installé sur ton nœud de contrôle (ton laptop, ou une VM Linux) :
:::

:::lang en
You should have:

- The **Linux fundamentals** guide under your belt (SSH, `systemd`, packages, permissions — hard prerequisite).
- **Ansible** installed on your control node (your laptop, or a Linux VM):
:::

```bash
sudo apt install -y ansible        # Debian/Ubuntu
# Fedora : sudo dnf install ansible   ·   macOS : brew install ansible
ansible --version                  # vérifie l'install / check the install
```

:::lang fr
- **Multipass** pour créer une VM locale à gérer (étape 3) : `sudo snap install multipass` (Linux), `brew install --cask multipass` (macOS), ou l'installeur Windows.
- Une **clé SSH**. Si tu n'en as pas encore, génère-la (on la réutilisera pour joindre la VM) :
:::

:::lang en
- **Multipass** to create a local VM to manage (step 3): `sudo snap install multipass` (Linux), `brew install --cask multipass` (macOS), or the Windows installer.
- An **SSH key**. If you don't have one yet, generate it (we'll reuse it to reach the VM):
:::

```bash
ls ~/.ssh/id_ed25519.pub 2>/dev/null || ssh-keygen -t ed25519 -C "ansible-lab"
cat ~/.ssh/id_ed25519.pub          # ta clé PUBLIQUE (on la copiera à l'étape 3) / your PUBLIC key (we'll copy it in step 3)
```

## concepts

:::lang fr
Ansible repose sur une architecture **sans agent** (*agentless*). D'un côté le **nœud de contrôle** : ta machine, où Ansible est installé. De l'autre les **nœuds gérés** : les machines que tu configures. Ansible se connecte à eux **en SSH** et y exécute des modules Python — rien à installer côté serveur au préalable.

Le vocabulaire :

- **Inventaire** : la liste de tes machines (par IP ou nom), éventuellement groupées (`[web]`, `[db]`).
- **Module** : une unité d'action idempotente (`apt` installe un paquet, `service` gère un service, `copy` copie un fichier). Tu décris **l'état voulu**, pas les commandes pour y arriver.
- **Tâche** (*task*) : l'usage d'un module avec ses paramètres.
- **Playbook** : un fichier YAML qui enchaîne des tâches sur des groupes de machines.

Le concept qui change tout : l'**idempotence**. Une tâche « le paquet nginx est présent » n'installe nginx que s'il manque. Rejoue le playbook dix fois : la première fois `changed`, les suivantes `ok`. Tu peux donc **converger** tes machines vers un état voulu, encore et encore, sans effet de bord.
:::

:::lang en
Ansible rests on an **agentless** architecture. On one side the **control node**: your machine, where Ansible is installed. On the other the **managed nodes**: the machines you configure. Ansible connects to them **over SSH** and runs Python modules there — nothing to install on the server beforehand.

The vocabulary:

- **Inventory**: the list of your machines (by IP or name), optionally grouped (`[web]`, `[db]`).
- **Module**: an idempotent unit of action (`apt` installs a package, `service` manages a service, `copy` copies a file). You describe **the desired state**, not the commands to get there.
- **Task**: the use of a module with its parameters.
- **Playbook**: a YAML file chaining tasks over groups of machines.

The concept that changes everything: **idempotence**. A task "the nginx package is present" installs nginx only if it's missing. Replay the playbook ten times: the first time `changed`, the following times `ok`. So you can **converge** your machines toward a desired state, again and again, with no side effects.
:::

:::figure ansible-architecture
caption_fr: "Schéma 1. Architecture sans agent : le nœud de contrôle applique des playbooks aux nœuds gérés via SSH."
caption_en: "Figure 1. Agentless architecture: the control node applies playbooks to managed nodes over SSH."
:::

:::lang fr
On avance ainsi : ad-hoc sur localhost → premier playbook & idempotence → une VM gérée en SSH → variables & templates → handlers → rôle.
:::

:::lang en
We'll go like this: ad-hoc on localhost → first playbook & idempotence → a managed VM over SSH → variables & templates → handlers → role.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Faire tes premiers pas avec une **commande ad-hoc** sur `localhost`, sans rien installer de distant.

**🤔 Pourquoi commencer par localhost ?** Pour isoler le concept Ansible (modules, résultat `ok`/`changed`) sans le bruit du SSH et des VM. `-m ping` n'est pas un ping réseau : c'est le module qui vérifie qu'Ansible peut « parler » à la cible. `-c local` dit de ne pas passer par SSH.
:::

:::lang en
**Goal.** Take your first steps with an **ad-hoc command** on `localhost`, without installing anything remote.

**🤔 Why start with localhost?** To isolate the Ansible concept (modules, `ok`/`changed` result) without the noise of SSH and VMs. `-m ping` is not a network ping: it's the module that checks Ansible can "talk" to the target. `-c local` says not to go through SSH.
:::

```bash
ansible localhost -m ping -c local
ansible localhost -m setup -c local | head -n 20   # les "facts" : infos collectées sur la machine / the "facts": info gathered about the machine
```

:::lang fr
**✅ Vérification :** la première commande renvoie `"ping": "pong"` avec un statut vert `SUCCESS`. La seconde affiche un JSON de « facts » (OS, IP, CPU…) — ces variables sont utilisables dans tes playbooks.
:::

:::lang en
**✅ Check:** the first command returns `"ping": "pong"` with a green `SUCCESS` status. The second prints a JSON of "facts" (OS, IP, CPU…) — those variables are usable in your playbooks.
:::

### step-02

:::lang fr
**Objectif.** Écrire ton premier **playbook** et **vivre l'idempotence**. C'est **l'étape clé du guide.**

**🤔 Pourquoi `become` ?** Installer un paquet exige les droits root : `become: true` fait l'équivalent d'un `sudo`. On décrit l'état voulu (« `tree` est présent »), pas la commande. Le module `package` est **générique** (il choisit `apt` ou `dnf` selon la distro).

⚠️ **Cette étape locale suppose Linux** (Debian/Ubuntu ou Fedora). Sur **macOS**, saute-la : tu retrouveras exactement la même leçon d'idempotence à l'étape 3, sur la VM Ubuntu.

Crée `local.yml` (avec `nano local.yml`) :
:::

:::lang en
**Goal.** Write your first **playbook** and **live idempotence**. This is **the key step of the guide.**

**🤔 Why `become`?** Installing a package requires root: `become: true` does the equivalent of `sudo`. We describe the desired state ("`tree` is present"), not the command. The `package` module is **generic** (it picks `apt` or `dnf` depending on the distro).

⚠️ **This local step assumes Linux** (Debian/Ubuntu or Fedora). On **macOS**, skip it: you'll get the exact same idempotence lesson in step 3, on the Ubuntu VM.

Create `local.yml` (with `nano local.yml`):
:::

```yaml
- name: Configurer ma machine locale
  hosts: localhost
  connection: local
  become: true
  tasks:
    - name: tree est installé
      ansible.builtin.package:
        name: tree
        state: present
```

```bash
ansible-playbook local.yml --ask-become-pass   # demande ton mot de passe sudo / asks your sudo password
```

:::lang fr
**✅ Vérification :** au **premier** lancement, le récap affiche `changed=1` (tree a été installé). **Relance exactement la même commande** : cette fois `changed=0`, `ok=1`. Voilà l'idempotence : Ansible n'agit que si l'état diffère de l'état voulu.
:::

:::lang en
**✅ Check:** on the **first** run, the recap shows `changed=1` (tree was installed). **Run the exact same command again**: this time `changed=0`, `ok=1`. That's idempotence: Ansible acts only if the state differs from the desired one.
:::

### step-03

:::lang fr
**Objectif.** Créer une **vraie VM locale** et la gérer en SSH — le modèle d'un serveur distant, sur ta machine.

**🤔 Pourquoi une VM et plus localhost ?** Parce que le vrai métier, c'est gérer des machines **à distance**. Multipass te donne un Ubuntu jetable ; on y injecte ta clé publique via `cloud-init` pour qu'Ansible s'y connecte en SSH sans mot de passe.

⚠️ **Windows/WSL2 :** Multipass tourne côté Windows (Hyper-V) et joindre sa VM en SSH *depuis l'intérieur de WSL2* pose des soucis réseau. Le plus simple : fais ce module **sur du Linux natif ou une VM Linux**. (Sur macOS et Linux, Multipass fonctionne directement.)

Crée `cloud-init.yaml` en **collant ta clé publique** (celle affichée aux prérequis) :
:::

:::lang en
**Goal.** Create a **real local VM** and manage it over SSH — the model of a remote server, on your machine.

**🤔 Why a VM and no longer localhost?** Because the real job is managing machines **remotely**. Multipass gives you a disposable Ubuntu; we inject your public key via `cloud-init` so Ansible connects over SSH without a password.

⚠️ **Windows/WSL2:** Multipass runs on the Windows side (Hyper-V) and reaching its VM over SSH *from inside WSL2* causes networking issues. Simplest: do this module **on native Linux or a Linux VM**. (On macOS and Linux, Multipass works directly.)

Create `cloud-init.yaml`, **pasting your public key** (the one shown in the prerequisites):
:::

```yaml
#cloud-config
ssh_authorized_keys:
  - ssh-ed25519 AAAA...colle-ta-cle-ici...  ansible-lab
```

```bash
multipass launch --name web --cloud-init cloud-init.yaml 24.04
multipass info web | grep IPv4        # relève l'IP de la VM / note the VM's IP
```

:::lang fr
Crée l'inventaire `inventory.ini` en remplaçant `<IP-DE-TA-VM>` par l'IP relevée. L'option `StrictHostKeyChecking=accept-new` accepte l'empreinte SSH au **premier contact** (sans elle, le tout premier `ping` échoue en `UNREACHABLE`) :
:::

:::lang en
Create the inventory `inventory.ini`, replacing `<IP-DE-TA-VM>` with the IP you noted. The `StrictHostKeyChecking=accept-new` option accepts the SSH fingerprint on **first contact** (without it, the very first `ping` fails with `UNREACHABLE`):
:::

```ini
[web]
<IP-DE-TA-VM> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_ed25519 ansible_ssh_common_args='-o StrictHostKeyChecking=accept-new'
```

```bash
ansible -i inventory.ini web -m ping   # cette fois, un VRAI ping SSH / this time, a REAL SSH ping
```

:::lang fr
**✅ Vérification :** `web | SUCCESS => {"ping": "pong"}`. Ansible s'est connecté en SSH à ta VM et a exécuté le module. Si tu obtiens une erreur SSH, voir *troubleshooting*.
:::

:::lang en
**✅ Check:** `web | SUCCESS => {"ping": "pong"}`. Ansible connected over SSH to your VM and ran the module. If you get an SSH error, see *troubleshooting*.
:::

### step-04

:::lang fr
**Objectif.** Installer et démarrer un service (nginx) sur la VM via un playbook.

**🤔 Pourquoi `state: started` ET `enabled: true` ?** `started` = le service tourne maintenant ; `enabled` = il redémarrera au boot. Deux garanties distinctes, comme `systemctl start` + `systemctl enable`. La VM Multipass a un `sudo` sans mot de passe, donc `become: true` suffit (pas de `--ask-become-pass`).

Crée `web.yml` :
:::

:::lang en
**Goal.** Install and start a service (nginx) on the VM via a playbook.

**🤔 Why `state: started` AND `enabled: true`?** `started` = the service runs now; `enabled` = it will restart at boot. Two distinct guarantees, like `systemctl start` + `systemctl enable`. The Multipass VM has passwordless `sudo`, so `become: true` is enough (no `--ask-become-pass`).

Create `web.yml`:
:::

```yaml
- name: Serveur web
  hosts: web
  become: true
  tasks:
    - name: nginx est installé
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: nginx tourne et démarre au boot
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true
```

```bash
ansible-playbook -i inventory.ini web.yml
curl http://<IP-DE-TA-VM>          # remplace par l'IP de ta VM / replace with your VM's IP
```

:::lang fr
**✅ Vérification :** le `curl` affiche la page « Welcome to nginx! ». Relance le playbook : `changed=0` partout — idempotent.
:::

:::lang en
**✅ Check:** the `curl` shows the "Welcome to nginx!" page. Re-run the playbook: `changed=0` everywhere — idempotent.
:::

### step-05

:::lang fr
**Objectif.** Générer une page personnalisée depuis un **template Jinja2** et une **variable**.

**🤔 Pourquoi un template ?** Une config est rarement figée : elle contient des valeurs qui changent selon la machine. Un **template** est un fichier avec des trous (`{{ variable }}`) qu'Ansible remplit. Ici on injecte le nom d'hôte de la VM (un *fact*) dans une page HTML.

Crée le template `index.html.j2` :
:::

:::lang en
**Goal.** Generate a custom page from a **Jinja2 template** and a **variable**.

**🤔 Why a template?** A config is rarely fixed: it holds values that change per machine. A **template** is a file with blanks (`{{ variable }}`) that Ansible fills in. Here we inject the VM's hostname (a *fact*) into an HTML page.

Create the template `index.html.j2`:
:::

```html
<h1>Bienvenue sur {{ ansible_hostname }}</h1>
<p>Page déployée par Ansible — thème : {{ theme }}</p>
```

:::lang fr
Mets à jour `web.yml` avec le playbook **complet** ci-dessous (on ajoute le bloc `vars` et la tâche `template`) :
:::

:::lang en
Update `web.yml` with the **complete** playbook below (we add the `vars` block and the `template` task):
:::

```yaml
- name: Serveur web
  hosts: web
  become: true
  vars:
    theme: "jiha.tech"
  tasks:
    - name: nginx est installé
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: nginx tourne et démarre au boot
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: page d'accueil personnalisée
      ansible.builtin.template:
        src: index.html.j2
        dest: /var/www/html/index.html
```

```bash
ansible-playbook -i inventory.ini web.yml
curl http://<IP-DE-TA-VM>
```

:::lang fr
**✅ Vérification :** le `curl` renvoie maintenant « Bienvenue sur web » (le hostname de la VM) et le thème. Ansible a rendu le template avec les bonnes valeurs. *(`ansible_hostname` provient des* facts*, collectés automatiquement — ne désactive pas `gather_facts`.)*
:::

:::lang en
**✅ Check:** the `curl` now returns "Bienvenue sur web" (the VM's hostname) and the theme. Ansible rendered the template with the right values. *(`ansible_hostname` comes from the* facts*, gathered automatically — don't disable `gather_facts`.)*
:::

### step-06

:::lang fr
**Objectif.** Ne redémarrer nginx **que si** sa configuration change, avec un **handler**.

**🤔 Pourquoi un handler ?** Redémarrer un service à chaque exécution est inutile et coupe le service pour rien. Un **handler** est une tâche qui ne s'exécute **que si** elle est notifiée (`notify`) par une tâche qui a réellement changé quelque chose. C'est le pattern idempotent par excellence.

Ajoute à `web.yml` un `notify` sur la tâche template, et un bloc `handlers` :
:::

:::lang en
**Goal.** Restart nginx **only if** its configuration changes, with a **handler**.

**🤔 Why a handler?** Restarting a service on every run is pointless and cuts the service for nothing. A **handler** is a task that runs **only if** it's notified (`notify`) by a task that actually changed something. It's the idempotent pattern par excellence.

Add a `notify` to the template task in `web.yml`, and a `handlers` block:
:::

```yaml
    - name: page d'accueil personnalisée
      ansible.builtin.template:
        src: index.html.j2
        dest: /var/www/html/index.html
      notify: redémarrer nginx

  handlers:
    - name: redémarrer nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

:::lang fr
**✅ Vérification :** relance le playbook **sans rien changer** → aucun handler ne se déclenche (`changed=0`). Modifie le template (change le texte), relance → la tâche `template` est `changed`, et **seulement là** le handler « redémarrer nginx » s'exécute (visible en fin de run).
:::

:::lang en
**✅ Check:** re-run the playbook **without changing anything** → no handler fires (`changed=0`). Edit the template (change the text), re-run → the `template` task is `changed`, and **only then** the "restart nginx" handler runs (visible at the end of the run).
:::

### step-07

:::lang fr
**Objectif.** Ranger tout ça dans un **rôle** réutilisable.

**🤔 Pourquoi un rôle ?** Un playbook qui grossit devient illisible. Un **rôle** est une structure de dossiers standard (`tasks/`, `templates/`, `handlers/`, `vars/`) qui encapsule une responsabilité (« serveur web ») et se réutilise d'un projet à l'autre. C'est la brique de partage d'Ansible (cf. Ansible Galaxy).
:::

:::lang en
**Goal.** Tidy all this into a reusable **role**.

**🤔 Why a role?** A growing playbook becomes unreadable. A **role** is a standard folder structure (`tasks/`, `templates/`, `handlers/`, `vars/`) that encapsulates one responsibility ("web server") and is reused across projects. It's Ansible's sharing unit (see Ansible Galaxy).
:::

```bash
ansible-galaxy init roles/webserver      # crée le squelette du rôle / scaffold the role
```

:::lang fr
Répartis ton code dans les fichiers du rôle. **Attention :** dans un rôle, `tasks/main.yml` contient la **liste des tâches directement** (sans l'en-tête `- name/hosts/tasks:`), et le template va dans `templates/` (Ansible l'y trouve tout seul) :
:::

:::lang en
Split your code across the role's files. **Note:** in a role, `tasks/main.yml` holds the **task list directly** (without the `- name/hosts/tasks:` header), and the template goes in `templates/` (Ansible finds it there automatically):
:::

```yaml
# roles/webserver/tasks/main.yml
- name: nginx est installé
  ansible.builtin.apt: { name: nginx, state: present, update_cache: true }
- name: nginx tourne et démarre au boot
  ansible.builtin.service: { name: nginx, state: started, enabled: true }
- name: page d'accueil personnalisée
  ansible.builtin.template: { src: index.html.j2, dest: /var/www/html/index.html }
  notify: redémarrer nginx

# roles/webserver/handlers/main.yml
- name: redémarrer nginx
  ansible.builtin.service: { name: nginx, state: restarted }

# roles/webserver/templates/index.html.j2  (déplace le fichier existant ici / move the existing file here)
```

:::lang fr
Le playbook `web.yml` se réduit alors à :
:::

:::lang en
The `web.yml` playbook then shrinks to:
:::

```yaml
- name: Serveur web
  hosts: web
  become: true
  vars:
    theme: "jiha.tech"
  roles:
    - webserver
```

:::lang fr
**✅ Vérification :** `ansible-playbook -i inventory.ini web.yml` produit **le même résultat** qu'avant, mais ton code est maintenant modulaire et réutilisable. `curl` renvoie toujours ta page.

*(Nettoyage quand tu as fini : `multipass delete web && multipass purge`.)*
:::

:::lang en
**✅ Check:** `ansible-playbook -i inventory.ini web.yml` produces **the same result** as before, but your code is now modular and reusable. `curl` still returns your page.

*(Cleanup when done: `multipass delete web && multipass purge`.)*
:::

## pitfalls

:::lang fr
**1. Utiliser `command`/`shell` pour tout.** Lancer `apt install ...` via le module `shell` casse l'idempotence (Ansible ne sait pas si ça a changé quelque chose). Préfère **toujours** le module dédié (`apt`, `service`, `copy`, `template`) : c'est lui qui gère l'état et l'idempotence.

**2. Oublier `become`.** Une tâche qui exige root échoue en « Permission denied » sans `become: true`. À l'inverse, ne mets pas `become` partout « au cas où » : moindre privilège.

**3. Secrets en clair dans les playbooks.** Mots de passe, clés API n'ont rien à faire en clair dans le YAML (surtout versionné en Git). Utilise **Ansible Vault** (`ansible-vault encrypt`) pour les chiffrer.

**4. Ne pas tester avant d'appliquer.** `--check` (dry-run) montre ce qui *changerait* sans rien modifier ; `--diff` montre les différences de fichiers. Le réflexe avant un playbook sur une vraie machine.

**5. Un inventaire en dur, non groupé.** Grouper (`[web]`, `[db]`) et utiliser des variables de groupe évite la duplication quand le parc grandit.

**6. Confondre Ansible et Terraform.** Ansible **configure** des machines existantes. Il ne les **crée** pas (c'est le rôle de Terraform / du provider cloud). Ne t'en sers pas pour provisionner de l'infra.
:::

:::lang en
**1. Using `command`/`shell` for everything.** Running `apt install ...` via the `shell` module breaks idempotence (Ansible can't tell if it changed anything). **Always** prefer the dedicated module (`apt`, `service`, `copy`, `template`): it handles state and idempotence.

**2. Forgetting `become`.** A task that needs root fails with "Permission denied" without `become: true`. Conversely, don't put `become` everywhere "just in case": least privilege.

**3. Clear-text secrets in playbooks.** Passwords, API keys have no business in clear text in the YAML (especially versioned in Git). Use **Ansible Vault** (`ansible-vault encrypt`) to encrypt them.

**4. Not testing before applying.** `--check` (dry-run) shows what *would* change without modifying anything; `--diff` shows file differences. The reflex before a playbook on a real machine.

**5. A hardcoded, ungrouped inventory.** Grouping (`[web]`, `[db]`) and using group variables avoids duplication as the fleet grows.

**6. Confusing Ansible and Terraform.** Ansible **configures** existing machines. It doesn't **create** them (that's Terraform / the cloud provider's job). Don't use it to provision infrastructure.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu expliques nœud de contrôle vs nœud géré, et pourquoi « agentless ».
- [ ] Tu écris un playbook et tu **prédis** `changed` vs `ok` avant de le lancer.
- [ ] L'idempotence est un réflexe : tu rejoues sans crainte.
- [ ] Tu gères une machine distante via un **inventaire** en SSH.
- [ ] Tu génères une config avec un **template Jinja2** et une variable.
- [ ] Tu déclenches un **handler** au bon moment et tu ranges en **rôle**.

Six cases cochées = tu automatises la configuration de machines de façon reproductible. Bravo.
:::

:::lang en
You know it works when…

- [ ] You can explain control node vs managed node, and why "agentless".
- [ ] You write a playbook and **predict** `changed` vs `ok` before running it.
- [ ] Idempotence is a reflex: you replay without fear.
- [ ] You manage a remote machine via an **inventory** over SSH.
- [ ] You generate a config with a **Jinja2 template** and a variable.
- [ ] You trigger a **handler** at the right moment and tidy into a **role**.

Six boxes ticked = you automate machine configuration reproducibly. Well done.
:::

## next

:::lang fr
La suite logique :

1. **Traefik** — exposer proprement, en HTTPS, les services que tu déploies.
2. Plus loin : **Terraform** (créer l'infra, là où Ansible la configure), puis le **projet homelab** où Ansible provisionne toute ta stack sur un vrai serveur.
:::

:::lang en
The logical next steps:

1. **Traefik** — cleanly expose, over HTTPS, the services you deploy.
2. Further along: **Terraform** (create the infra, where Ansible configures it), then the **homelab project** where Ansible provisions your whole stack on a real server.
:::

## cheatsheet

:::lang fr
Aide-mémoire Ansible.
:::

:::lang en
Ansible cheat sheet.
:::

```bash
# Ad-hoc
ansible localhost -m ping -c local          # tester en local / test locally
ansible -i inventory.ini web -m ping        # tester une cible SSH / test an SSH target
ansible -i inventory.ini web -m setup       # voir les facts / see the facts

# Playbooks
ansible-playbook -i inventory.ini web.yml           # appliquer / apply
ansible-playbook -i inventory.ini web.yml --check --diff   # dry-run + différences / dry-run + diffs
ansible-playbook -i inventory.ini web.yml --ask-become-pass # demande le mot de passe sudo / ask sudo password

# Rôles & secrets / Roles & secrets
ansible-galaxy init roles/monrole           # squelette de rôle / role scaffold
ansible-vault encrypt secrets.yml           # chiffrer des secrets / encrypt secrets
```

```yaml
# Modules essentiels / Essential modules
ansible.builtin.apt:      { name: nginx, state: present, update_cache: true }
ansible.builtin.service:  { name: nginx, state: started, enabled: true }
ansible.builtin.copy:     { src: fichier, dest: /chemin }
ansible.builtin.template: { src: f.j2, dest: /chemin }   # + notify: <handler>
ansible.builtin.user:     { name: alice, groups: sudo, append: true }
```

## resources

:::lang fr
- [Documentation Ansible](https://docs.ansible.com/ansible/latest/) — la référence.
- [Index des modules builtin](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/) — tous les modules de base.
- [Ansible Galaxy](https://galaxy.ansible.com) — rôles et collections partagés par la communauté.
- [Objectifs RHCE / EX294](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — la certification que ce module prépare.
:::

:::lang en
- [Ansible documentation](https://docs.ansible.com/ansible/latest/) — the reference.
- [Builtin module index](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/) — all the core modules.
- [Ansible Galaxy](https://galaxy.ansible.com) — roles and collections shared by the community.
- [RHCE / EX294 objectives](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — the certification this module prepares for.
:::

## troubleshooting

:::lang fr
**`web | UNREACHABLE` — erreur SSH.** Vérifie l'IP dans l'inventaire (`multipass info web`), que ta clé publique est bien dans `cloud-init.yaml`, et teste à la main : `ssh ubuntu@<IP>`. Au premier contact SSH, accepte l'empreinte (ou ajoute `ansible_ssh_common_args='-o StrictHostKeyChecking=accept-new'`).

**`Permission denied` pendant une tâche.** Il manque `become: true` sur la tâche ou le play (droits root requis).

**« Missing sudo password ».** Ta cible demande un mot de passe sudo : ajoute `--ask-become-pass`. (La VM Multipass, elle, a un sudo sans mot de passe : rien à ajouter.)

**Une tâche est toujours `changed` à chaque exécution.** Tu utilises probablement `command`/`shell` là où un module idempotent existe. Remplace-le, ou ajoute une condition (`creates:`, `when:`).

**`multipass launch` reste bloqué / pas d'IPv4.** Attends que la VM démarre (`multipass list`), et vérifie l'hyperviseur (sur Windows, Hyper-V ; sur Linux, `snap`). En dernier recours : `multipass delete web --purge` puis relance.
:::

:::lang en
**`web | UNREACHABLE` — SSH error.** Check the IP in the inventory (`multipass info web`), that your public key is in `cloud-init.yaml`, and test by hand: `ssh ubuntu@<IP>`. On first SSH contact, accept the fingerprint (or add `ansible_ssh_common_args='-o StrictHostKeyChecking=accept-new'`).

**`Permission denied` during a task.** Missing `become: true` on the task or play (root rights required).

**"Missing sudo password".** Your target asks for a sudo password: add `--ask-become-pass`. (The Multipass VM has passwordless sudo: nothing to add.)

**A task is always `changed` on every run.** You're probably using `command`/`shell` where an idempotent module exists. Replace it, or add a condition (`creates:`, `when:`).

**`multipass launch` hangs / no IPv4.** Wait for the VM to boot (`multipass list`), and check the hypervisor (on Windows, Hyper-V; on Linux, `snap`). Last resort: `multipass delete web --purge` then relaunch.
:::
