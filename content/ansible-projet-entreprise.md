---
# — Identité (ne change JAMAIS une fois publié) —
id: ansible-projet-entreprise
slug: ansible-projet-entreprise
order: 27
status: published

# — Titres & accroches (bilingue) —
title_fr: "Ansible — projet d'entreprise : plateforme web 3-tiers"
title_en: "Ansible — enterprise project: 3-tier web platform"
tagline_fr: "inventaire, rôles, Vault, templates, handlers : un site.yml complet."
tagline_en: "inventory, roles, Vault, templates, handlers: a complete site.yml."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 300
repo: "ansible/ansible"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [ansible-administration-systeme]
next: [terraform-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [architecture-3-tiers, inventaire-multi-groupes, roles-reutilisables, secrets-vault, templates-hostvars, orchestration-site-yml, livrable-cv]
concepts_en: [3-tier-architecture, multi-group-inventory, reusable-roles, vault-secrets, hostvars-templates, site-yml-orchestration, cv-deliverable]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le capstone RHCE/EX294 : provisionne une plateforme web 3-tiers (load-balancer + app + base de données) sur un parc de VM locales, entièrement avec Ansible. Inventaire à groupes, rôles réutilisables (commun/app/db/loadbalancer), secrets chiffrés avec Vault, configs templatées Jinja2 qui découvrent les backends via hostvars/groups, handlers, et un site.yml idempotent. Un livrable prêt pour ton CV, avec README d'architecture."
og_description_en: "The RHCE/EX294 capstone: provision a 3-tier web platform (load-balancer + app + database) on a local VM fleet, entirely with Ansible. Grouped inventory, reusable roles (commun/app/db/loadbalancer), Vault-encrypted secrets, Jinja2-templated configs discovering backends via hostvars/groups, handlers, and an idempotent site.yml. A CV-ready deliverable, with an architecture README."
---

## intro

:::lang fr
C'est le moment d'assembler **tout** ce que tu as appris dans le track Ansible en **un seul projet** que tu pourras montrer en entretien : une **plateforme web 3-tiers** provisionnée de bout en bout par Ansible. Un **load-balancer** nginx distribue le trafic vers deux **serveurs d'application**, qui lisent leurs données dans une **base PostgreSQL** — le tout configuré, sécurisé et reproductible par un unique `site.yml` idempotent.

Ce projet mobilise toute la boîte à outils RHCE : un **inventaire à groupes** (`loadbalancer`, `app`, `database`), des **rôles réutilisables** (`commun`, `db`, `app`, `loadbalancer`), des **secrets chiffrés avec Vault** (le mot de passe PostgreSQL n'apparaît jamais en clair), des **templates Jinja2** qui **découvrent** dynamiquement les backends via `groups`/`hostvars`, des **handlers** qui ne rechargent un service que si sa config a bougé, et l'**administration système par modules** (utilisateurs, paquets, services, pare-feu). Rien de bidon : c'est une architecture qu'on déploie vraiment en entreprise.

Tu le montes sur un **parc de VM locales** (Multipass), sans louer un seul serveur cloud. À la fin, tu auras un dépôt Git propre — rôles, inventaire, Vault, `site.yml`, README d'architecture — que tu peux **mettre sur ton CV et ton GitHub** comme preuve concrète de tes compétences Ansible/RHCE.

**Pour qui c'est :** tu as terminé tout le track Ansible (des fondamentaux à l'administration système). C'est l'examen final.

**Ce que tu vas produire :** un projet Git complet et idempotent qui, en une commande (`ansible-playbook site.yml`), transforme quatre machines nues en une plateforme web fonctionnelle et sécurisée.
:::

:::lang en
Time to assemble **everything** you learned in the Ansible track into **one project** you can show in an interview: a **3-tier web platform** provisioned end to end by Ansible. An nginx **load-balancer** distributes traffic to two **application servers**, which read their data from a **PostgreSQL database** — all configured, secured and reproducible by a single idempotent `site.yml`.

This project mobilizes the whole RHCE toolbox: a **grouped inventory** (`loadbalancer`, `app`, `database`), **reusable roles** (`commun`, `db`, `app`, `loadbalancer`), **Vault-encrypted secrets** (the PostgreSQL password never appears in clear), **Jinja2 templates** that dynamically **discover** the backends via `groups`/`hostvars`, **handlers** that reload a service only if its config moved, and **system administration via modules** (users, packages, services, firewall). Nothing fake: it's an architecture actually deployed in companies.

You build it on a **local VM fleet** (Multipass), without renting a single cloud server. In the end you'll have a clean Git repo — roles, inventory, Vault, `site.yml`, architecture README — that you can **put on your CV and GitHub** as concrete proof of your Ansible/RHCE skills.

**Who it's for:** you've finished the whole Ansible track (from fundamentals to system administration). This is the final exam.

**What you'll produce:** a complete, idempotent Git project that, in one command (`ansible-playbook site.yml`), turns four bare machines into a working, secured web platform.
:::

## objectives

:::lang fr
À la fin de ce projet, tu as construit et tu sais expliquer :

- Un **inventaire à groupes** modélisant une architecture 3-tiers.
- Quatre **rôles réutilisables** avec `defaults`, `templates`, `handlers`, `meta` et dépendances.
- Un **coffre Vault** pour le mot de passe de la base, jamais en clair.
- Des **templates Jinja2** qui génèrent la config du load-balancer à partir de `groups['app']` et `hostvars`.
- Un **`site.yml`** qui orchestre les rôles par tier, **idempotent** de bout en bout.
- Un **README d'architecture** et un pitch prêt pour l'entretien.
:::

:::lang en
By the end of this project, you've built and can explain:

- A **grouped inventory** modeling a 3-tier architecture.
- Four **reusable roles** with `defaults`, `templates`, `handlers`, `meta` and dependencies.
- A **Vault** for the database password, never in clear.
- **Jinja2 templates** generating the load-balancer config from `groups['app']` and `hostvars`.
- A **`site.yml`** orchestrating roles per tier, **idempotent** end to end.
- An **architecture README** and an interview-ready pitch.
:::

## prerequisites

:::lang fr
- **Tout le track Ansible** terminé (fondamentaux → inventaire → tâches → variables/facts → rôles → Vault → administration système).
- **Ansible ≥ 2.16** et **Multipass** installés.
- Assez de RAM pour **4 petites VM** (~1 Go chacune ; réduis à 512 Mo si besoin, ou fusionne `app2` avec `app1` pour ne faire que 3 VM).
- Les **collections** `community.general` (ufw), `ansible.posix` (firewalld/mount) et `community.postgresql` (base) — on les déclare dans un `requirements.yml`.
- ⚠️ Ce projet se déploie sur de **vraies VM** (systemd, PostgreSQL, nginx). Tu peux **valider la structure sans VM** (`--syntax-check`, `ansible-inventory --graph`, rendu de templates, Vault), mais l'exécution complète exige le parc.
:::

:::lang en
- **The whole Ansible track** done (fundamentals → inventory → tasks → variables/facts → roles → Vault → system administration).
- **Ansible ≥ 2.16** and **Multipass** installed.
- Enough RAM for **4 small VMs** (~1 GB each; drop to 512 MB if needed, or merge `app2` into `app1` for just 3 VMs).
- The **collections** `community.general` (ufw), `ansible.posix` (firewalld/mount) and `community.postgresql` (database) — declared in a `requirements.yml`.
- ⚠️ This project deploys on **real VMs** (systemd, PostgreSQL, nginx). You can **validate the structure without VMs** (`--syntax-check`, `ansible-inventory --graph`, template rendering, Vault), but a full run requires the fleet.
:::

## concepts

:::lang fr
**Architecture 3-tiers.** Trois couches séparées : le **load-balancer** (point d'entrée public, répartit la charge), les **serveurs d'application** (le code, réplicable horizontalement), la **base de données** (l'état persistant, un seul nœud ici). Chaque tier est un **groupe** d'inventaire, et chaque groupe reçoit un **rôle**.

**Découverte dynamique des backends.** Le load-balancer ne doit pas connaître ses backends « en dur » : il les **découvre** à partir de l'inventaire. Le template nginx boucle sur `groups['app']` et lit l'IP de chaque app via `hostvars[h]['ansible_host']`. Ajoute un `app3` à l'inventaire, relance : le LB l'intègre automatiquement.

**Séparation config / secrets.** Les valeurs publiques (ports, noms de base, versions) vivent en clair dans `group_vars/`. Le **mot de passe** de la base vit dans un fichier **Vault** chiffré (`group_vars/all/vault.yml`). Convention : la variable chiffrée s'appelle `vault_db_password`, et une variable claire `db_password: "{{ vault_db_password }}"` fait le pont — on garde des noms lisibles ET des secrets protégés.

**Orchestration par tiers.** Le `site.yml` est une suite de **plays**, un par tier, chacun ciblant son groupe et appliquant ses rôles. Le rôle `commun` (base commune) est appliqué partout, en **dépendance** des autres rôles. L'ordre compte : la base **avant** les apps (qui s'y connectent), les apps **avant** le load-balancer (qui les référence).

**Idempotence de bout en bout.** Le critère de qualité d'un projet Ansible : relancer `site.yml` une seconde fois ne doit produire **que des `ok`** (0 `changed`). C'est la preuve que ton infrastructure est décrite comme un **état voulu**, pas comme une suite de commandes.
:::

:::lang en
**3-tier architecture.** Three separate layers: the **load-balancer** (public entry point, spreads the load), the **application servers** (the code, horizontally replicable), the **database** (persistent state, a single node here). Each tier is an inventory **group**, and each group gets a **role**.

**Dynamic backend discovery.** The load-balancer must not know its backends "hardcoded": it **discovers** them from the inventory. The nginx template loops over `groups['app']` and reads each app's IP via `hostvars[h]['ansible_host']`. Add an `app3` to the inventory, rerun: the LB integrates it automatically.

**Config / secrets separation.** Public values (ports, database name, versions) live in clear in `group_vars/`. The database **password** lives in an encrypted **Vault** file (`group_vars/all/vault.yml`). Convention: the encrypted variable is `vault_db_password`, and a clear variable `db_password: "{{ vault_db_password }}"` bridges it — you keep readable names AND protected secrets.

**Orchestration per tier.** The `site.yml` is a sequence of **plays**, one per tier, each targeting its group and applying its roles. The `commun` role (shared base) is applied everywhere, as a **dependency** of the other roles. Order matters: the database **before** the apps (which connect to it), the apps **before** the load-balancer (which references them).

**End-to-end idempotence.** The quality criterion of an Ansible project: rerunning `site.yml` a second time must produce **only `ok`** (0 `changed`). It proves your infrastructure is described as a **desired state**, not a sequence of commands.
:::

:::figure ansible-3tier-architecture
caption_fr: "Schéma 1. La plateforme 3-tiers : Internet → load-balancer (lb1) → serveurs d'app (app1, app2) → base PostgreSQL (db1). Chaque tier est un groupe d'inventaire piloté par un rôle ; le LB découvre ses backends via groups/hostvars."
caption_en: "Figure 1. The 3-tier platform: Internet → load-balancer (lb1) → app servers (app1, app2) → PostgreSQL database (db1). Each tier is an inventory group driven by a role; the LB discovers its backends via groups/hostvars."
:::

## walkthrough

:::lang fr
On avance ainsi : parc & inventaire → secrets Vault → rôle commun → rôle base de données → rôle application → rôle load-balancer → site.yml, exécution & idempotence.
:::

:::lang en
We'll go like this: fleet & inventory → Vault secrets → commun role → database role → application role → load-balancer role → site.yml, run & idempotence.
:::

### step-01

:::lang fr
**Objectif.** Lancer le parc de 4 VM et écrire l'**inventaire à groupes** de l'architecture 3-tiers.

**🤔 Pourquoi cette structure.** Chaque tier = un groupe (`loadbalancer`, `app`, `database`), et un parent `prod` les rassemble pour les réglages communs. C'est cette structure qui rend le `site.yml` lisible : « applique le rôle db au groupe database ».

Crée le projet, le cloud-init (avec **ta** clé), et lance les VM :
:::

:::lang en
**Goal.** Launch the 4-VM fleet and write the **grouped inventory** of the 3-tier architecture.

**🤔 Why this structure.** Each tier = a group (`loadbalancer`, `app`, `database`), and a parent `prod` gathers them for common settings. It's this structure that makes the `site.yml` readable: "apply the db role to the database group".

Create the project, the cloud-init (with **your** key), and launch the VMs:
:::

```bash
mkdir -p ~/projet-plateforme/{group_vars/all,roles} && cd ~/projet-plateforme

cat > cloud-init.yaml <<EOF
#cloud-config
users:
  - name: ubuntu
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    ssh_authorized_keys:
      - $(cat ~/.ssh/id_ed25519.pub)
EOF

for vm in lb1 app1 app2 db1; do
  multipass launch 24.04 --name "$vm" --cpus 1 --memory 1G --disk 5G --cloud-init cloud-init.yaml
done
multipass list      # relève les 4 IPv4 / note the 4 IPv4s
```

```ini
# ~/projet-plateforme/inventory.ini  (remplace les IP)
[loadbalancer]
lb1 ansible_host=<IP_lb1>

[app]
app1 ansible_host=<IP_app1>
app2 ansible_host=<IP_app2>

[database]
db1 ansible_host=<IP_db1>

[prod:children]
loadbalancer
app
database

[prod:vars]
ansible_user=ubuntu
```

```bash
ansible-inventory -i inventory.ini --graph
ansible -i inventory.ini prod -m ping
```

:::lang fr
**✅ Vérification :** `ansible-inventory --graph` montre l'arbre avec `loadbalancer`, `app` (deux hôtes) et `database` sous `prod`. `ansible prod -m ping` renvoie `pong` (vert) pour les **quatre** VM. Ton parc 3-tiers est debout et pilotable. On configure `ansible.cfg` (inventaire + Vault) à l'étape suivante.
:::

:::lang en
**✅ Check:** `ansible-inventory --graph` shows the tree with `loadbalancer`, `app` (two hosts) and `database` under `prod`. `ansible prod -m ping` returns `pong` (green) for **all four** VMs. Your 3-tier fleet is up and drivable. We configure `ansible.cfg` (inventory + Vault) in the next step.
:::

### step-02

:::lang fr
**Objectif.** Créer le **coffre Vault** pour le mot de passe de la base, et la config projet (`ansible.cfg`, `requirements.yml`).

**🤔 Le pont clair/chiffré.** On chiffre `vault_db_password` dans `group_vars/all/vault.yml`, et on expose `db_password: "{{ vault_db_password }}"` en clair dans `group_vars/all/main.yml`. Les rôles utilisent `db_password` (nom lisible) ; la vraie valeur reste chiffrée. C'est la convention pro.

Mets en place la config et les secrets :
:::

:::lang en
**Goal.** Create the **Vault** for the database password, and the project config (`ansible.cfg`, `requirements.yml`).

**🤔 The clear/encrypted bridge.** We encrypt `vault_db_password` in `group_vars/all/vault.yml`, and expose `db_password: "{{ vault_db_password }}"` in clear in `group_vars/all/main.yml`. Roles use `db_password` (readable name); the real value stays encrypted. It's the pro convention.

Set up the config and secrets:
:::

```ini
# ~/projet-plateforme/ansible.cfg
[defaults]
inventory = inventory.ini
vault_password_file = .vault_pass
host_key_checking = false
roles_path = roles
```

```bash
echo "MotDePasseDuCoffre2026" > .vault_pass && chmod 600 .vault_pass
printf '.vault_pass\n' > .gitignore

# Variables PUBLIQUES / PUBLIC variables
cat > group_vars/all/main.yml <<'YML'
app_name: boutique
app_port: 8080
db_name: boutique
db_user: boutique
db_password: "{{ vault_db_password }}"   # pont vers le secret chiffré / bridge to the encrypted secret
YML

# Le SECRET, chiffré / the SECRET, encrypted
cat > group_vars/all/vault.yml <<'YML'
vault_db_password: "Pg-S3cr3t-Prod-2026"
YML
ansible-vault encrypt group_vars/all/vault.yml

# Dépendances du projet / project dependencies
cat > requirements.yml <<'YML'
collections:
  - name: community.general
  - name: ansible.posix
  - name: community.postgresql
YML
# Avec réseau : ansible-galaxy collection install -r requirements.yml
```

:::lang fr
**✅ Vérification :** `head -c 40 group_vars/all/vault.yml` montre l'en-tête `$ANSIBLE_VAULT;1.1;AES256` (le secret est chiffré). `ansible -m debug -a "var=db_password" prod --limit db1` (une fois les VM prêtes) afficherait le mot de passe déchiffré à la volée — mais **jamais** en clair sur le disque. `.vault_pass` est dans `.gitignore`. La séparation config/secret est en place.
:::

:::lang en
**✅ Check:** `head -c 40 group_vars/all/vault.yml` shows the `$ANSIBLE_VAULT;1.1;AES256` header (the secret is encrypted). `ansible -m debug -a "var=db_password" prod --limit db1` (once the VMs are ready) would print the on-the-fly decrypted password — but **never** in clear on disk. `.vault_pass` is in `.gitignore`. The config/secret separation is in place.
:::

### step-03

:::lang fr
**Objectif.** Écrire le rôle **`commun`** — la base appliquée à **toutes** les machines (paquets, utilisateur de service, fuseau, pare-feu de base).

**🤔 Pourquoi un rôle commun.** Chaque tier partage un socle : un utilisateur `deploy`, des paquets utilitaires, le bon fuseau horaire, un pare-feu qui autorise SSH. Le mettre dans un rôle `commun` évite de le répéter, et on l'attache en **dépendance** aux autres rôles (il tourne toujours en premier).

Génère et remplis le rôle :
:::

:::lang en
**Goal.** Write the **`commun`** role — the base applied to **all** machines (packages, service user, timezone, baseline firewall).

**🤔 Why a commun role.** Each tier shares a base: a `deploy` user, utility packages, the right timezone, a firewall allowing SSH. Putting it in a `commun` role avoids repeating it, and we attach it as a **dependency** to the other roles (it always runs first).

Scaffold and fill the role:
:::

```bash
ansible-galaxy init roles/commun
```

```yaml
# roles/commun/defaults/main.yml
commun_paquets: [vim, curl, htop]
commun_timezone: "Europe/Paris"
```

```yaml
# roles/commun/tasks/main.yml
- name: Paquets utilitaires
  ansible.builtin.apt:
    name: "{{ commun_paquets }}"
    state: present
    update_cache: true
    cache_valid_time: 3600

- name: Utilisateur de service deploy
  ansible.builtin.user:
    name: deploy
    shell: /bin/bash
    state: present

- name: Fuseau horaire
  community.general.timezone:
    name: "{{ commun_timezone }}"

- name: Pare-feu — autoriser SSH puis activer
  community.general.ufw:
    rule: allow
    name: OpenSSH
- name: Activer ufw (politique par défaut refus entrant)
  community.general.ufw:
    state: enabled
    policy: deny
    direction: incoming
```

:::lang fr
**✅ Vérification :** `ansible-playbook -i inventory.ini roles/commun/tests/test.yml --syntax-check` passe (ou on validera via `site.yml`). Sur le parc, appliqué à un hôte, le rôle installe les paquets, crée `deploy`, règle le fuseau et active ufw en n'ouvrant que SSH. ⚠️ **On active SSH dans ufw AVANT** de passer la politique en `deny incoming` — sinon on se coupe l'accès. L'ordre des tâches est critique ici.
:::

:::lang en
**✅ Check:** `ansible-playbook -i inventory.ini roles/commun/tests/test.yml --syntax-check` passes (or we'll validate via `site.yml`). On the fleet, applied to a host, the role installs the packages, creates `deploy`, sets the timezone and enables ufw opening only SSH. ⚠️ **We allow SSH in ufw BEFORE** switching the policy to `deny incoming` — otherwise you cut your own access. Task order is critical here.
:::

### step-04

:::lang fr
**Objectif.** Écrire le rôle **`db`** — installer PostgreSQL et créer la base + l'utilisateur applicatif, avec le mot de passe **Vault**.

**🤔 Le tier persistant.** La base est le seul tier avec état. On installe PostgreSQL, on crée une base `boutique` et un utilisateur `boutique` dont le mot de passe vient du coffre (`db_password`). On ouvre le port 5432 **uniquement** pour le réseau du parc (les apps), pas au monde.

Génère et remplis :
:::

:::lang en
**Goal.** Write the **`db`** role — install PostgreSQL and create the database + application user, with the **Vault** password.

**🤔 The persistent tier.** The database is the only stateful tier. We install PostgreSQL, create a `boutique` database and a `boutique` user whose password comes from the vault (`db_password`). We open port 5432 **only** to the fleet network (the apps), not to the world.

Scaffold and fill:
:::

```bash
ansible-galaxy init roles/db
```

```yaml
# roles/db/meta/main.yml — dépend de commun (REMPLACE la ligne dependencies: [])
dependencies:
  - role: commun
```

```yaml
# roles/db/tasks/main.yml
- name: Installer PostgreSQL et le driver Python
  ansible.builtin.apt:
    name: [postgresql, python3-psycopg2]
    state: present
    update_cache: true

- name: PostgreSQL démarré et activé
  ansible.builtin.service:
    name: postgresql
    state: started
    enabled: true

- name: Créer la base applicative
  community.postgresql.postgresql_db:
    name: "{{ db_name }}"
    state: present
  become: true
  become_user: postgres

- name: Créer l'utilisateur applicatif (mot de passe depuis Vault)
  community.postgresql.postgresql_user:
    db: "{{ db_name }}"
    name: "{{ db_user }}"
    password: "{{ db_password }}"
    priv: ALL
    state: present
  become: true
  become_user: postgres
  no_log: true            # ne journalise pas le secret / don't log the secret
```

:::lang fr
**✅ Vérification :** sur `db1`, après le rôle, `sudo -u postgres psql -c "\l"` liste la base `boutique`, et `\du` montre l'utilisateur `boutique`. Le mot de passe vient de Vault, jamais écrit en clair (et `no_log: true` l'empêche d'apparaître dans les logs Ansible). ⚠️ `python3-psycopg2` est **requis** : les modules `postgresql_*` s'exécutent via ce driver Python sur la cible.
:::

:::lang en
**✅ Check:** on `db1`, after the role, `sudo -u postgres psql -c "\l"` lists the `boutique` database, and `\du` shows the `boutique` user. The password comes from Vault, never written in clear (and `no_log: true` prevents it appearing in Ansible logs). ⚠️ `python3-psycopg2` is **required**: the `postgresql_*` modules run via this Python driver on the target.
:::

### step-05

:::lang fr
**Objectif.** Écrire le rôle **`app`** — déployer l'application sur les serveurs `app`, templater sa config (qui pointe vers la base).

**🤔 Le tier réplicable.** Les serveurs d'app sont **identiques** : même rôle, même config, seule l'identité de la machine change. La config est **templatée** — l'app connaît l'adresse de la base via `hostvars[groups['database'][0]]`, c'est-à-dire « l'IP du premier hôte du groupe database ». Un handler recharge nginx si la config a bougé.

Génère et remplis :
:::

:::lang en
**Goal.** Write the **`app`** role — deploy the application on the `app` servers, template its config (pointing to the database).

**🤔 The replicable tier.** The app servers are **identical**: same role, same config, only the machine's identity changes. The config is **templated** — the app knows the database address via `hostvars[groups['database'][0]]`, i.e. "the IP of the first host of the database group". A handler reloads nginx if the config moved.

Scaffold and fill:
:::

```bash
ansible-galaxy init roles/app
```

```yaml
# roles/app/meta/main.yml (REMPLACE dependencies: [])
dependencies:
  - role: commun
```

```yaml
# roles/app/tasks/main.yml
- name: Installer nginx
  ansible.builtin.apt: { name: nginx, state: present, update_cache: true }

- name: Config nginx — écouter sur app_port (le port que le LB appelle)
  ansible.builtin.template:
    src: nginx-site.conf.j2
    dest: /etc/nginx/sites-available/default
  notify: Recharger nginx

- name: Page servie (identifie le serveur)
  ansible.builtin.template:
    src: index.html.j2
    dest: /var/www/html/index.html
  notify: Recharger nginx

- name: Config applicative (infos de connexion base, templatée)
  ansible.builtin.template:
    src: app.conf.j2
    dest: /etc/app.conf

- name: Ouvrir app_port pour le load-balancer
  community.general.ufw: { rule: allow, port: "{{ app_port }}", proto: tcp }

- name: nginx démarré et activé
  ansible.builtin.service: { name: nginx, state: started, enabled: true }
```

```jinja
{# roles/app/templates/nginx-site.conf.j2 — nginx écoute sur app_port #}
server {
    listen {{ app_port }} default_server;
    root /var/www/html;
    index index.html;
    location / {
        try_files $uri $uri/ =404;
    }
}
```

```jinja
{# roles/app/templates/app.conf.j2 #}
# Config générée par Ansible pour {{ inventory_hostname }}
app_name={{ app_name }}
listen_port={{ app_port }}
db_host={{ hostvars[groups['database'][0]]['ansible_host'] }}
db_name={{ db_name }}
db_user={{ db_user }}
# le mot de passe n'est PAS écrit ici / password NOT written here
```

```jinja
{# roles/app/templates/index.html.j2 #}
<h1>{{ app_name }}</h1>
<p>Servi par {{ inventory_hostname }} ({{ ansible_host | default('local') }})</p>
```

```yaml
# roles/app/handlers/main.yml
- name: Recharger nginx
  ansible.builtin.service:
    name: nginx
    state: reloaded
```

:::lang fr
**✅ Vérification :** sur `app1`, `/etc/app.conf` contient `db_host=<IP de db1>` — l'app a **découvert** la base via `hostvars`, sans qu'on l'écrive en dur. nginx écoute sur `app_port` (8080) : `curl localhost:8080` sur `app1` renvoie « Servi par app1 », sur `app2` « Servi par app2 ». Le rôle ouvre aussi `app_port` dans ufw pour laisser passer le load-balancer. Le mot de passe de la base **n'est pas** dans `app.conf` (bonne hygiène). Le handler « Recharger nginx » ne se déclenche que si un template a changé.
:::

:::lang en
**✅ Check:** on `app1`, `/etc/app.conf` contains `db_host=<db1's IP>` — the app **discovered** the database via `hostvars`, without hardcoding it. nginx listens on `app_port` (8080): `curl localhost:8080` on `app1` returns "Servi par app1", on `app2` "Servi par app2". The role also opens `app_port` in ufw to let the load-balancer through. The database password is **not** in `app.conf` (good hygiene). The "Recharger nginx" handler fires only if a template changed.
:::

### step-06

:::lang fr
**Objectif.** Écrire le rôle **`loadbalancer`** — nginx en reverse-proxy qui **découvre** ses backends `app` via `groups`/`hostvars`.

**🤔 Le cœur du projet.** Le LB ne connaît pas ses backends à l'avance : le template boucle sur `groups['app']` et génère un `upstream` avec l'IP de chaque serveur d'app. Ajoute un `app3` à l'inventaire, relance `site.yml` : la config du LB l'intègre **automatiquement**. C'est la puissance de l'inventaire + templating.

Génère et remplis :
:::

:::lang en
**Goal.** Write the **`loadbalancer`** role — nginx as a reverse-proxy that **discovers** its `app` backends via `groups`/`hostvars`.

**🤔 The heart of the project.** The LB doesn't know its backends in advance: the template loops over `groups['app']` and generates an `upstream` with each app server's IP. Add an `app3` to the inventory, rerun `site.yml`: the LB config integrates it **automatically**. That's the power of inventory + templating.

Scaffold and fill:
:::

```bash
ansible-galaxy init roles/loadbalancer
```

```yaml
# roles/loadbalancer/meta/main.yml (REMPLACE dependencies: [])
dependencies:
  - role: commun
```

```yaml
# roles/loadbalancer/tasks/main.yml
- name: Installer nginx
  ansible.builtin.apt: { name: nginx, state: present, update_cache: true }

- name: Config du reverse-proxy (backends découverts dynamiquement)
  ansible.builtin.template:
    src: lb.conf.j2
    dest: /etc/nginx/sites-available/default
  notify: Recharger nginx

- name: Ouvrir le port 80 (trafic public)
  community.general.ufw: { rule: allow, port: "80", proto: tcp }

- name: nginx démarré et activé
  ansible.builtin.service: { name: nginx, state: started, enabled: true }
```

```jinja
{# roles/loadbalancer/templates/lb.conf.j2 #}
# Load-balancer généré par Ansible — backends du groupe 'app'
upstream boutique {
{% for h in groups['app'] %}
    server {{ hostvars[h]['ansible_host'] }}:{{ app_port | default(80) }};   # {{ h }}
{% endfor %}
}
server {
    listen 80;
    location / {
        proxy_pass http://boutique;
        proxy_set_header Host $host;
    }
}
```

```yaml
# roles/loadbalancer/handlers/main.yml
- name: Recharger nginx
  ansible.builtin.service: { name: nginx, state: reloaded }
```

:::lang fr
**✅ Vérification :** sur `lb1`, `/etc/nginx/sites-available/default` contient un bloc `upstream boutique { ... }` avec **une ligne `server` par app** (app1 **et** app2, avec leurs IP réelles) — généré par la boucle sur `groups['app']`. `curl http://<IP_lb1>` depuis ton laptop renvoie alternativement « Servi par app1 » et « Servi par app2 » (répartition de charge). Tu as prouvé la découverte dynamique des backends. ✅ Cohérence par construction : la **même** variable `app_port` sert au rôle `app` (nginx écoute dessus + ufw l'ouvre) **et** au rôle `loadbalancer` (l'upstream l'appelle). Change `app_port` dans `group_vars` et les deux tiers restent alignés — pas de risque de 502 par port qui ne correspond pas.
:::

:::lang en
**✅ Check:** on `lb1`, `/etc/nginx/sites-available/default` contains an `upstream boutique { ... }` block with **one `server` line per app** (app1 **and** app2, with their real IPs) — generated by the loop over `groups['app']`. `curl http://<lb1_IP>` from your laptop returns alternately "Servi par app1" and "Servi par app2" (load spreading). You've proven dynamic backend discovery. ✅ Consistent by construction: the **same** `app_port` variable is used by the `app` role (nginx listens on it + ufw opens it) **and** by the `loadbalancer` role (the upstream calls it). Change `app_port` in `group_vars` and both tiers stay aligned — no risk of a 502 from a mismatched port.
:::

### step-07

:::lang fr
**Objectif.** Écrire le **`site.yml`** qui orchestre tout, le lancer, et **prouver l'idempotence**.

**🤔 L'ordre des plays.** La base **d'abord** (les apps s'y connectent), les apps **ensuite**, le load-balancer **en dernier** (il référence les apps). Chaque play cible son groupe et applique son rôle ; le rôle `commun` tourne en dépendance au début de chacun. Un `site.yml` bien ordonné se lit comme le plan d'architecture.

Écris le `site.yml` et lance-le :
:::

:::lang en
**Goal.** Write the **`site.yml`** orchestrating everything, run it, and **prove idempotence**.

**🤔 The order of plays.** The database **first** (the apps connect to it), the apps **next**, the load-balancer **last** (it references the apps). Each play targets its group and applies its role; the `commun` role runs as a dependency at the start of each. A well-ordered `site.yml` reads like the architecture plan.

Write the `site.yml` and run it:
:::

```yaml
# ~/projet-plateforme/site.yml
- name: Tier base de données
  hosts: database
  become: true
  roles:
    - db

- name: Tier application
  hosts: app
  become: true
  roles:
    - app

- name: Tier load-balancer
  hosts: loadbalancer
  become: true
  roles:
    - loadbalancer
```

```bash
# Valider la structure sans exécuter / validate structure without running
ansible-playbook site.yml --syntax-check
ansible-playbook site.yml --list-hosts        # qui sera touché, par tier / who gets touched

# Déployer TOUTE la plateforme en une commande / deploy the WHOLE platform in one command
ansible-playbook site.yml

# LA preuve : relancer, tout doit être "ok" / THE proof: rerun, all must be "ok"
ansible-playbook site.yml
```

:::lang fr
**✅ Vérification :** le 1er `ansible-playbook site.yml` déroule les trois tiers dans l'ordre (database → app → loadbalancer), avec des `changed` (installation, config). Le **récap final** (`PLAY RECAP`) montre `failed=0` sur les 4 hôtes. `curl http://<IP_lb1>` sert la boutique via les deux apps. **La preuve d'or :** relance `site.yml` — le récap affiche `changed=0` partout (que des `ok`). Idempotence parfaite = ton infra est un état voulu reproductible. Bravo, la plateforme est déployée. 🎉
:::

:::lang en
**✅ Check:** the 1st `ansible-playbook site.yml` runs the three tiers in order (database → app → loadbalancer), with `changed` (install, config). The **final recap** (`PLAY RECAP`) shows `failed=0` on the 4 hosts. `curl http://<lb1_IP>` serves the shop via the two apps. **The golden proof:** rerun `site.yml` — the recap shows `changed=0` everywhere (only `ok`). Perfect idempotence = your infra is a reproducible desired state. Well done, the platform is deployed. 🎉
:::

## pitfalls

:::lang fr
**1. Se couper l'accès SSH avec ufw.** Passer la politique `deny incoming` **avant** d'autoriser OpenSSH te déconnecte de la VM. Toujours `allow OpenSSH` **puis** `enable`. (Dans un rôle `commun`, respecte l'ordre des tâches.)

**2. Ordre des tiers dans `site.yml`.** Si les apps sont configurées avant la base, `hostvars[groups['database'][0]]` existe mais la base n'est pas prête → la connexion échouera à l'usage. Base → apps → LB.

**3. Mot de passe de base en clair.** Le secret vit **uniquement** dans `group_vars/all/vault.yml` chiffré. Ne le mets jamais dans un template ni un fichier clair. Utilise `no_log: true` sur la tâche qui le manipule.

**4. `hostvars[h]['ansible_host']` indéfini.** Si tu as omis `ansible_host=` dans l'inventaire (en te reposant sur la résolution DNS du nom), `hostvars` n'a pas la clé. Mets une IP explicite, ou un `| default(...)`.

**5. Backends du LB en dur.** Écrire les IP des apps directement dans `lb.conf.j2` tue tout l'intérêt. Boucle **toujours** sur `groups['app']` — c'est ce qui rend l'ajout d'un `app3` automatique.

**6. Oublier `python3-psycopg2` sur la base.** Les modules `postgresql_*` en ont besoin **sur la cible**. Sans lui : `Failed to import the required Python library (psycopg2)`.

**7. Rôle `commun` non idempotent.** Si `commun` (via `apt`, `user`, `timezone`) reste `changed` au 2e run, tout `site.yml` l'est aussi. Vérifie chaque rôle **isolément** avant d'assembler.

**8. `become` oublié.** Installer des paquets, gérer des services, écrire dans `/etc` exige root. Mets `become: true` au niveau du play (comme dans `site.yml`), pas tâche par tâche.
:::

:::lang en
**1. Cutting your own SSH access with ufw.** Switching the policy to `deny incoming` **before** allowing OpenSSH disconnects you from the VM. Always `allow OpenSSH` **then** `enable`. (In a `commun` role, respect task order.)

**2. Tier order in `site.yml`.** If the apps are configured before the database, `hostvars[groups['database'][0]]` exists but the database isn't ready → the connection will fail in use. Database → apps → LB.

**3. Clear database password.** The secret lives **only** in the encrypted `group_vars/all/vault.yml`. Never put it in a template or clear file. Use `no_log: true` on the task handling it.

**4. `hostvars[h]['ansible_host']` undefined.** If you omitted `ansible_host=` in the inventory (relying on DNS name resolution), `hostvars` lacks the key. Set an explicit IP, or a `| default(...)`.

**5. Hardcoded LB backends.** Writing the app IPs directly into `lb.conf.j2` kills the whole point. **Always** loop over `groups['app']` — that's what makes adding an `app3` automatic.

**6. Forgetting `python3-psycopg2` on the database.** The `postgresql_*` modules need it **on the target**. Without it: `Failed to import the required Python library (psycopg2)`.

**7. Non-idempotent `commun` role.** If `commun` (via `apt`, `user`, `timezone`) stays `changed` on the 2nd run, the whole `site.yml` is too. Check each role **in isolation** before assembling.

**8. Forgetting `become`.** Installing packages, managing services, writing to `/etc` needs root. Set `become: true` at play level (as in `site.yml`), not task by task.
:::

## success

:::lang fr
Tu sais que le projet est réussi quand…

- [ ] `ansible-inventory --graph` montre les 3 tiers sous `prod`.
- [ ] Le mot de passe de la base est **chiffré** (Vault) et jamais en clair.
- [ ] Les 4 rôles sont idempotents **isolément** et via `site.yml`.
- [ ] La config du LB liste les apps via `groups['app']`/`hostvars` (pas en dur).
- [ ] `curl http://<lb1>` répartit sur `app1` et `app2`.
- [ ] Un **2e** `ansible-playbook site.yml` affiche `changed=0` partout.
- [ ] Ton dépôt Git a un **README d'architecture** et pas de secret commité.

Sept cases = tu as un projet Ansible de niveau entreprise, prêt pour ton CV. 🏆
:::

:::lang en
You know the project is a success when…

- [ ] `ansible-inventory --graph` shows the 3 tiers under `prod`.
- [ ] The database password is **encrypted** (Vault) and never in clear.
- [ ] The 4 roles are idempotent **in isolation** and via `site.yml`.
- [ ] The LB config lists the apps via `groups['app']`/`hostvars` (not hardcoded).
- [ ] `curl http://<lb1>` spreads across `app1` and `app2`.
- [ ] A **2nd** `ansible-playbook site.yml` shows `changed=0` everywhere.
- [ ] Your Git repo has an **architecture README** and no committed secret.

Seven boxes = you have an enterprise-grade Ansible project, ready for your CV. 🏆
:::

## next

:::lang fr
**Mettre ce projet sur ton CV.** Tu viens de produire une preuve concrète. Voici comment la valoriser.

Structure de dépôt à pousser sur GitHub (le README est ce que le recruteur lit en premier — écris-le comme un plan d'architecture) :
:::

:::lang en
**Put this project on your CV.** You've just produced concrete proof. Here's how to leverage it.

Repo structure to push to GitHub (the README is what a recruiter reads first — write it like an architecture plan):
:::

    projet-plateforme/
    ├── README.md            # architecture, prérequis, "ansible-playbook site.yml"
    ├── ansible.cfg
    ├── inventory.ini
    ├── requirements.yml
    ├── site.yml
    ├── group_vars/all/
    │   ├── main.yml         # variables publiques
    │   └── vault.yml        # secret CHIFFRÉ (le .vault_pass n'est PAS commité)
    └── roles/
        ├── commun/          # base : paquets, user, fuseau, ufw
        ├── db/              # PostgreSQL + base + user (mot de passe Vault)
        ├── app/             # nginx + config templatée vers la base
        └── loadbalancer/    # nginx reverse-proxy, backends dynamiques

:::lang fr
**Le pitch (2 phrases pour l'entretien) :** « J'ai automatisé le déploiement d'une plateforme web 3-tiers (load-balancer, deux serveurs d'app, base PostgreSQL) entièrement avec Ansible : inventaire à groupes, rôles réutilisables, secrets chiffrés avec Vault, et une config de load-balancer qui découvre ses backends dynamiquement via l'inventaire. Une seule commande, `ansible-playbook site.yml`, provisionne tout, de façon idempotente. »

**Pour aller plus loin :**

1. Ajoute un **`app3`** et vérifie que le LB l'intègre sans toucher au code.
2. Ajoute un **rôle `monitoring`** (node_exporter) via une dépendance.
3. Branche ce projet sur le **track Terraform** : Terraform crée les VM, Ansible les configure — la combinaison gagnante en entreprise.
4. Passe l'examen **RHCE/EX294** : tu en as tous les objectifs en main.
:::

:::lang en
**The pitch (2 sentences for the interview):** "I automated the deployment of a 3-tier web platform (load-balancer, two app servers, PostgreSQL database) entirely with Ansible: grouped inventory, reusable roles, Vault-encrypted secrets, and a load-balancer config that discovers its backends dynamically via the inventory. A single command, `ansible-playbook site.yml`, provisions everything, idempotently."

**To go further:**

1. Add an **`app3`** and verify the LB integrates it without touching the code.
2. Add a **`monitoring` role** (node_exporter) via a dependency.
3. Wire this project to the **Terraform track**: Terraform creates the VMs, Ansible configures them — the winning enterprise combo.
4. Take the **RHCE/EX294 exam**: you have all its objectives in hand.
:::

## cheatsheet

:::lang fr
Aide-mémoire du projet.
:::

:::lang en
Project cheat sheet.
:::

```bash
# Structure & validation / Structure & validation
ansible-inventory -i inventory.ini --graph     # voir les 3 tiers / see the 3 tiers
ansible-playbook site.yml --syntax-check       # YAML/modules valides / valid YAML/modules
ansible-playbook site.yml --list-hosts         # qui sera touché / who gets touched
ansible-playbook site.yml --check --diff       # dry-run + différences / dry-run + diffs

# Déploiement / Deployment
ansible-galaxy collection install -r requirements.yml
ansible-playbook site.yml                       # déployer tout / deploy everything
ansible-playbook site.yml --tags config         # rejouer un sous-ensemble / replay a subset
ansible-playbook site.yml --limit app           # un seul tier / a single tier

# Secrets / Secrets
ansible-vault edit group_vars/all/vault.yml     # éditer le secret / edit the secret
ansible-vault view group_vars/all/vault.yml     # lire / read
```

```jinja
{# Le motif clé : backends dynamiques / The key pattern: dynamic backends #}
upstream backend {
{% for h in groups['app'] %}
    server {{ hostvars[h]['ansible_host'] }};
{% endfor %}
}
```

## resources

:::lang fr
- [Bonnes pratiques Ansible](https://docs.ansible.com/ansible/latest/tips_tricks/index.html) — organiser un vrai projet.
- [Réutiliser des rôles](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html) — structure, dépendances.
- [Variables spéciales](https://docs.ansible.com/ansible/latest/reference_appendices/special_variables.html) — `groups`, `hostvars`, `inventory_hostname`.
- [Collection `community.postgresql`](https://docs.ansible.com/ansible/latest/collections/community/postgresql/index.html) — modules base de données.
- [Objectifs RHCE / EX294](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — la certification que ce projet couronne.
:::

:::lang en
- [Ansible best practices](https://docs.ansible.com/ansible/latest/tips_tricks/index.html) — organizing a real project.
- [Reusing roles](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html) — structure, dependencies.
- [Special variables](https://docs.ansible.com/ansible/latest/reference_appendices/special_variables.html) — `groups`, `hostvars`, `inventory_hostname`.
- [`community.postgresql` collection](https://docs.ansible.com/ansible/latest/collections/community/postgresql/index.html) — database modules.
- [RHCE / EX294 objectives](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — the certification this project crowns.
:::

## troubleshooting

:::lang fr
**`UNREACHABLE` sur une VM après le rôle commun.** Tu t'es probablement coupé SSH avec ufw (politique `deny` avant `allow OpenSSH`). Reconnecte via la console Multipass (`multipass shell <vm>`), `sudo ufw allow OpenSSH`, et corrige l'ordre des tâches.

**`Failed to import the required Python library (psycopg2)`.** Il manque `python3-psycopg2` sur `db1`. Ajoute-le à la tâche `apt` du rôle `db`.

**Le LB renvoie 502 Bad Gateway.** nginx du LB n'atteint pas les apps : vérifie que les apps écoutent bien sur le port attendu (`app_port`), que leur nginx tourne, et que le pare-feu des apps autorise le LB.

**`site.yml` reste `changed` au 2e run.** Un rôle n'est pas idempotent. Lance-le seul avec `--limit` et `--diff` pour trouver la tâche fautive (souvent un `command`/`shell` sans `changed_when`, ou un mot de passe rehashé).

**`hostvars[groups['database'][0]]` : list index out of range.** Le groupe `database` est vide ou mal nommé dans l'inventaire. Vérifie `ansible-inventory --graph`.

**Vault : `Attempting to decrypt but no vault secrets found`.** `vault_password_file` n'est pas lu — vérifie `ansible.cfg` et que `.vault_pass` existe. On lance depuis la racine du projet.
:::

:::lang en
**`UNREACHABLE` on a VM after the commun role.** You probably cut SSH with ufw (`deny` policy before `allow OpenSSH`). Reconnect via the Multipass console (`multipass shell <vm>`), `sudo ufw allow OpenSSH`, and fix the task order.

**`Failed to import the required Python library (psycopg2)`.** `python3-psycopg2` is missing on `db1`. Add it to the `db` role's `apt` task.

**The LB returns 502 Bad Gateway.** The LB's nginx can't reach the apps: check the apps listen on the expected port (`app_port`), their nginx is running, and the apps' firewall allows the LB.

**`site.yml` stays `changed` on the 2nd run.** A role isn't idempotent. Run it alone with `--limit` and `--diff` to find the offending task (often a `command`/`shell` without `changed_when`, or a rehashed password).

**`hostvars[groups['database'][0]]`: list index out of range.** The `database` group is empty or misnamed in the inventory. Check `ansible-inventory --graph`.

**Vault: `Attempting to decrypt but no vault secrets found`.** `vault_password_file` isn't read — check `ansible.cfg` and that `.vault_pass` exists. Run from the project root.
:::
