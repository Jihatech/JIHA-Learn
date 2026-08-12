---
# — Identité (ne change JAMAIS une fois publié) —
id: ansible-roles-collections
slug: ansible-roles-collections
order: 24
status: published

# — Titres & accroches (bilingue) —
title_fr: "Ansible — rôles & collections"
title_en: "Ansible — roles & collections"
tagline_fr: "ansible-galaxy init, structure, dépendances, FQCN, requirements."
tagline_en: "ansible-galaxy init, structure, dependencies, FQCN, requirements."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 210
repo: "ansible/ansible"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [ansible-variables-facts-templates]
next: [ansible-vault]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [structure-role, ansible-galaxy-init, defaults-vs-vars, dependances-role, collections-fqcn, requirements-yml, include-vs-import]
concepts_en: [role-structure, ansible-galaxy-init, defaults-vs-vars, role-dependencies, collections-fqcn, requirements-yml, include-vs-import]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Factorise ton code Ansible au niveau RHCE/EX294 : structure d'un rôle (tasks/handlers/templates/defaults/meta), squelette avec ansible-galaxy init, defaults vs vars, dépendances de rôles (meta/main.yml), import_role vs include_role, collections et noms complets FQCN, et requirements.yml pour installer rôles et collections. Rôle démo testable en local."
og_description_en: "Factor your Ansible code at RHCE/EX294 level: role structure (tasks/handlers/templates/defaults/meta), scaffold with ansible-galaxy init, defaults vs vars, role dependencies (meta/main.yml), import_role vs include_role, collections and fully-qualified FQCN names, and requirements.yml to install roles and collections. Demo role testable locally."
---

## intro

:::lang fr
Tes playbooks grossissent. Le jour où tu copies-colles les mêmes vingt tâches « installer + configurer + démarrer un service » d'un playbook à l'autre, tu as un problème de **factorisation**. La réponse d'Ansible, c'est le **rôle** : un dossier standardisé qui regroupe tâches, handlers, templates, fichiers, variables par défaut et métadonnées — un composant réutilisable que tu déposes dans dix playbooks sans rien recopier.

Et quand tu as besoin de **modules qui ne sont pas dans le cœur** d'Ansible (gérer une base, un cloud, un pare-feu spécifique), tu installes une **collection**. Depuis Ansible 2.10, presque tout est distribué en collections, et l'examen RHCE/EX294 exige que tu saches les **installer** (via `requirements.yml`) et **appeler les modules par leur nom complet (FQCN)**.

Ce guide te fait construire un vrai rôle **de A à Z** (structure, defaults, template, handler, dépendances), l'utiliser dans un `site.yml`, puis manipuler les collections et le `requirements.yml`. Le rôle de démo est **file-based** (il écrit des fichiers, pas de paquets) : entièrement testable sur `localhost`, idempotent, sans rien casser.

**Pour qui c'est :** tu maîtrises playbooks, variables, facts et templates (guides précédents) et tu veux structurer ton code proprement.

**Quand ce n'est PAS le bon choix :**

- Tu écris ton tout premier playbook → reviens en arrière dans le track.
- Tu veux chiffrer les variables sensibles d'un rôle → c'est le guide **Vault**, juste après.
:::

:::lang en
Your playbooks grow. The day you copy-paste the same twenty "install + configure + start a service" tasks from one playbook to another, you have a **factoring** problem. Ansible's answer is the **role**: a standardized folder grouping tasks, handlers, templates, files, default variables and metadata — a reusable component you drop into ten playbooks without recopying anything.

And when you need **modules that aren't in Ansible's core** (manage a database, a cloud, a specific firewall), you install a **collection**. Since Ansible 2.10, almost everything ships as collections, and the RHCE/EX294 exam requires you to know how to **install** them (via `requirements.yml`) and **call modules by their fully-qualified name (FQCN)**.

This guide has you build a real role **from scratch** (structure, defaults, template, handler, dependencies), use it in a `site.yml`, then handle collections and `requirements.yml`. The demo role is **file-based** (it writes files, no packages): fully testable on `localhost`, idempotent, breaking nothing.

**Who it's for:** you master playbooks, variables, facts and templates (previous guides) and you want to structure your code cleanly.

**When it's NOT the right choice:**

- You're writing your very first playbook → go back in the track.
- You want to encrypt a role's sensitive variables → that's the **Vault** guide, right after.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Générer un squelette de rôle avec **`ansible-galaxy init`** et expliquer chaque dossier.
- Remplir un rôle : `defaults/`, `tasks/`, `templates/`, `handlers/`, et l'appeler avec `roles:`.
- Distinguer **`defaults/` (faible précédence)** de **`vars/` (forte)** et surcharger proprement.
- Ajouter une **dépendance** de rôle (`meta/main.yml`) et voir l'ordre d'exécution.
- Choisir entre **`import_role`** (statique) et **`include_role`** (dynamique).
- Comprendre les **collections** et appeler un module par son **FQCN**.
- Écrire un **`requirements.yml`** (rôles + collections) et l'installer avec `ansible-galaxy`.
:::

:::lang en
By the end of this guide, you can:

- Generate a role skeleton with **`ansible-galaxy init`** and explain each folder.
- Fill a role: `defaults/`, `tasks/`, `templates/`, `handlers/`, and call it with `roles:`.
- Tell **`defaults/` (low precedence)** from **`vars/` (high)** and override cleanly.
- Add a role **dependency** (`meta/main.yml`) and see the execution order.
- Choose between **`import_role`** (static) and **`include_role`** (dynamic).
- Understand **collections** and call a module by its **FQCN**.
- Write a **`requirements.yml`** (roles + collections) and install it with `ansible-galaxy`.
:::

## prerequisites

:::lang fr
- Les guides Ansible précédents du track (jusqu'à *variables, facts & templates*).
- **Ansible ≥ 2.16** (`ansible --version`) et **`ansible-galaxy`** (fourni avec).
- Un dossier de travail. Le rôle de démo est testable sur `localhost` en `connection: local`, sans VM.
- (Facultatif) Un **accès réseau** vers `galaxy.ansible.com` pour l'étape collections/Galaxy. Sans réseau, tu fais quand même tout le reste : on te donne un repli hors-ligne à chaque fois.
:::

:::lang en
- The previous Ansible track guides (through *variables, facts & templates*).
- **Ansible ≥ 2.16** (`ansible --version`) and **`ansible-galaxy`** (bundled).
- A working folder. The demo role is testable on `localhost` with `connection: local`, no VM.
- (Optional) **Network access** to `galaxy.ansible.com` for the collections/Galaxy step. Without network you still do everything else: we give an offline fallback each time.
:::

## concepts

:::lang fr
**Rôle.** Un dossier au nom standardisé qui contient des sous-dossiers **conventionnels**. Ansible sait automatiquement où chercher : les tâches dans `tasks/main.yml`, les handlers dans `handlers/main.yml`, les templates dans `templates/`, les fichiers dans `files/`, les valeurs par défaut dans `defaults/main.yml`, les variables « fortes » dans `vars/main.yml`, les métadonnées dans `meta/main.yml`. Tu appelles le rôle, Ansible charge le reste.

**`defaults/` vs `vars/`.** Deux endroits pour les variables d'un rôle, mais à des **précédences opposées** : `defaults/main.yml` est **le plus faible** de toute la hiérarchie (fait pour être surchargé par l'utilisateur), `vars/main.yml` est **fort** (difficile à surcharger, réservé aux constantes internes du rôle). Règle : tes variables **paramétrables** vont dans `defaults/`.

**`meta/main.yml` & dépendances.** Décrit le rôle (auteur, plateformes) et surtout ses **dépendances** : d'autres rôles qui doivent tourner **avant** lui. `dependencies: [commun]` garantit que le rôle `commun` s'exécute d'abord.

**`import_role` vs `include_role`.** Deux façons d'appeler un rôle depuis les `tasks:`. `import_role` est **statique** (résolu au parsing, avant l'exécution) ; `include_role` est **dynamique** (résolu à l'exécution, donc utilisable dans une boucle ou derrière un `when` variable). Le mot-clé `roles:` en tête de play, lui, est un import statique qui tourne **avant** les `tasks:`.

**Collection.** Un paquet distribuable de modules, rôles et plugins, nommé `namespace.nom` (ex. `community.general`, `ansible.posix`). Le cœur historique est la collection `ansible.builtin` (toujours présente).

**FQCN (Fully-Qualified Collection Name).** Le nom **complet** d'un module : `ansible.builtin.copy`, `ansible.posix.firewalld`, `community.general.timezone`. Depuis Ansible moderne, on **écrit toujours le FQCN** — c'est explicite et sans ambiguïté (deux collections peuvent avoir un module `user`).

**`requirements.yml`.** Le fichier qui déclare les **rôles** et **collections** à installer depuis Galaxy (ou Git, ou un chemin). On l'installe avec `ansible-galaxy install -r requirements.yml` (rôles) et `ansible-galaxy collection install -r requirements.yml` (collections).
:::

:::lang en
**Role.** A standard-named folder containing **conventional** subfolders. Ansible automatically knows where to look: tasks in `tasks/main.yml`, handlers in `handlers/main.yml`, templates in `templates/`, files in `files/`, defaults in `defaults/main.yml`, "strong" variables in `vars/main.yml`, metadata in `meta/main.yml`. You call the role, Ansible loads the rest.

**`defaults/` vs `vars/`.** Two places for a role's variables, but at **opposite precedences**: `defaults/main.yml` is **the weakest** of the whole hierarchy (meant to be overridden by the user), `vars/main.yml` is **strong** (hard to override, reserved for the role's internal constants). Rule: your **parameterizable** variables go in `defaults/`.

**`meta/main.yml` & dependencies.** Describes the role (author, platforms) and above all its **dependencies**: other roles that must run **before** it. `dependencies: [commun]` guarantees the `commun` role runs first.

**`import_role` vs `include_role`.** Two ways to call a role from `tasks:`. `import_role` is **static** (resolved at parse time, before execution); `include_role` is **dynamic** (resolved at run time, so usable in a loop or behind a variable `when`). The play-level `roles:` keyword is a static import that runs **before** `tasks:`.

**Collection.** A distributable package of modules, roles and plugins, named `namespace.name` (e.g. `community.general`, `ansible.posix`). The historic core is the `ansible.builtin` collection (always present).

**FQCN (Fully-Qualified Collection Name).** A module's **full** name: `ansible.builtin.copy`, `ansible.posix.firewalld`, `community.general.timezone`. In modern Ansible, you **always write the FQCN** — it's explicit and unambiguous (two collections can each have a `user` module).

**`requirements.yml`.** The file declaring the **roles** and **collections** to install from Galaxy (or Git, or a path). Install it with `ansible-galaxy install -r requirements.yml` (roles) and `ansible-galaxy collection install -r requirements.yml` (collections).
:::

:::figure ansible-role-structure
caption_fr: "Schéma 1. L'anatomie d'un rôle : chaque sous-dossier a un rôle conventionnel, et Ansible charge automatiquement le main.yml de chacun quand le rôle est appelé."
caption_en: "Figure 1. A role's anatomy: each subfolder has a conventional purpose, and Ansible automatically loads each one's main.yml when the role is invoked."
:::

## walkthrough

:::lang fr
On avance ainsi : squelette (galaxy init) → remplir le rôle → l'utiliser & surcharger → dépendances → import vs include → collections & FQCN → requirements.yml.
:::

:::lang en
We'll go like this: skeleton (galaxy init) → fill the role → use & override → dependencies → import vs include → collections & FQCN → requirements.yml.
:::

### step-01

:::lang fr
**Objectif.** Générer un **squelette de rôle** avec `ansible-galaxy init` et comprendre chaque dossier.

**🤔 Pourquoi `init` plutôt que créer les dossiers à la main ?** Parce que la structure est **conventionnelle** : Ansible cherche `tasks/main.yml`, `handlers/main.yml`, etc. à des chemins précis. `init` te donne la structure exacte, tu ne risques pas une faute de frappe qui ferait qu'un rôle « ne trouve pas ses tâches ».

Crée le projet et le rôle :
:::

:::lang en
**Goal.** Generate a **role skeleton** with `ansible-galaxy init` and understand each folder.

**🤔 Why `init` rather than making folders by hand?** Because the structure is **conventional**: Ansible looks for `tasks/main.yml`, `handlers/main.yml`, etc. at precise paths. `init` gives you the exact structure, no typo that would make a role "not find its tasks".

Create the project and the role:
:::

```bash
mkdir -p ~/ansible-roles && cd ~/ansible-roles
ansible-galaxy init roles/appli
find roles/appli -maxdepth 2 -type f | sort
```

:::lang fr
**✅ Vérification :** `find` montre l'arborescence conventionnelle du rôle `appli` :

```
roles/appli/README.md
roles/appli/defaults/main.yml
roles/appli/files/.gitkeep
roles/appli/handlers/main.yml
roles/appli/meta/main.yml
roles/appli/tasks/main.yml
roles/appli/templates/.gitkeep
roles/appli/vars/main.yml
```

Chaque `main.yml` est le point d'entrée que charge Ansible quand le rôle est appelé. `defaults/` (surchargeable) et `vars/` (fort) sont deux fichiers **distincts** — retiens la différence, elle tombe à l'examen.
:::

:::lang en
**✅ Check:** `find` shows the conventional tree of the `appli` role:

```
roles/appli/README.md
roles/appli/defaults/main.yml
roles/appli/files/.gitkeep
roles/appli/handlers/main.yml
roles/appli/meta/main.yml
roles/appli/tasks/main.yml
roles/appli/templates/.gitkeep
roles/appli/vars/main.yml
```

Each `main.yml` is the entry point Ansible loads when the role is called. `defaults/` (overridable) and `vars/` (strong) are two **distinct** files — remember the difference, it shows up on the exam.
:::

### step-02

:::lang fr
**Objectif.** **Remplir** le rôle `appli` (defaults, template, tâches, handler) et l'appeler depuis un `site.yml`.

**🤔 Le geste clé.** Un rôle bien fait expose ses réglages en `defaults/`, met sa logique en `tasks/`, ses gabarits en `templates/`, et réagit via `handlers/`. On garde le rôle **file-based** (écrit dans `/tmp/appli`) pour le tester partout sans installer de paquet.

Écris les quatre fichiers du rôle :
:::

:::lang en
**Goal.** **Fill** the `appli` role (defaults, template, tasks, handler) and call it from a `site.yml`.

**🤔 The key move.** A well-made role exposes its settings in `defaults/`, puts its logic in `tasks/`, its templates in `templates/`, and reacts via `handlers/`. We keep the role **file-based** (writes into `/tmp/appli`) to test it anywhere without installing a package.

Write the role's four files:
:::

```yaml
# roles/appli/defaults/main.yml
appli_port: 8080
appli_message: "Bonjour depuis le rôle appli"
appli_dir: /tmp/appli
```

```yaml
# roles/appli/tasks/main.yml
- name: Créer le dossier de l'appli
  ansible.builtin.file:
    path: "{{ appli_dir }}"
    state: directory

- name: Déposer la config depuis le template
  ansible.builtin.template:
    src: appli.conf.j2
    dest: "{{ appli_dir }}/appli.conf"
  notify: Recharger appli
```

```jinja
{# roles/appli/templates/appli.conf.j2 #}
# Généré par le rôle appli
message = {{ appli_message }}
port = {{ appli_port }}
```

```yaml
# roles/appli/handlers/main.yml
- name: Recharger appli
  ansible.builtin.debug:
    msg: ">>> handler du rôle : je recharge l'appli sur le port {{ appli_port }} <<<"
```

:::lang fr
Puis, à la racine du projet, un `site.yml` qui **utilise** le rôle :
:::

:::lang en
Then, at the project root, a `site.yml` that **uses** the role:
:::

```yaml
# ~/ansible-roles/site.yml
- name: Déployer l'appli
  hosts: localhost
  connection: local
  gather_facts: false
  roles:
    - appli
```

```bash
ansible-playbook site.yml
cat /tmp/appli/appli.conf
```

:::lang fr
**✅ Vérification :** au 1er passage, tu vois `TASK [appli : Créer le dossier...]` et `[appli : Déposer la config...]` (le préfixe `appli :` prouve que ça vient du rôle), puis en fin de play `RUNNING HANDLER [appli : Recharger appli]`. `/tmp/appli/appli.conf` contient `message = Bonjour depuis le rôle appli` et `port = 8080` (les valeurs de `defaults/`). Relance : les tâches passent `ok`, le handler ne se déclenche pas (idempotence).
:::

:::lang en
**✅ Check:** on the 1st pass, you see `TASK [appli : Créer le dossier...]` and `[appli : Déposer la config...]` (the `appli :` prefix proves it comes from the role), then at end of play `RUNNING HANDLER [appli : Recharger appli]`. `/tmp/appli/appli.conf` contains `message = Bonjour depuis le rôle appli` and `port = 8080` (the `defaults/` values). Rerun: tasks go `ok`, the handler doesn't fire (idempotence).
:::

### step-03

:::lang fr
**Objectif.** **Surcharger** un `defaults` proprement, et voir que `vars/` du rôle, lui, résiste.

**🤔 Le piège d'examen.** `defaults/` est **le niveau le plus faible** : tout le surcharge (vars du play, host_vars, `-e`). `vars/` du rôle est **fort** : un simple `vars:` de play ne le bat pas. On te demandera de « paramétrer un rôle » : la bonne réponse est de surcharger un **default**, pas de toucher au rôle.

Surcharge `appli_port` depuis le play, puis teste `-e` :
:::

:::lang en
**Goal.** **Override** a `defaults` cleanly, and see that the role's `vars/` resists.

**🤔 Exam trap.** `defaults/` is **the weakest level**: everything overrides it (play vars, host_vars, `-e`). A role's `vars/` is **strong**: a plain play `vars:` doesn't beat it. You'll be asked to "parameterize a role": the right answer is to override a **default**, not to touch the role.

Override `appli_port` from the play, then test `-e`:
:::

```yaml
# site.yml — variante avec surcharge / variant with override
- name: Déployer l'appli
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    appli_port: 9090        # surcharge le default (8080) / overrides the default (8080)
  roles:
    - appli
```

```bash
ansible-playbook site.yml                 # port = 9090 (vars du play battent le default)
ansible-playbook site.yml -e appli_port=7000   # port = 7000 (-e bat tout)
cat /tmp/appli/appli.conf
```

:::lang fr
**✅ Vérification :** sans `-e`, `appli.conf` montre `port = 9090` — le `vars:` du play a battu le `default` (8080). Avec `-e appli_port=7000`, il montre `port = 7000` — extra-vars gagne, comme toujours. Le rôle n'a **pas** été modifié : tu l'as paramétré de l'extérieur, exactement ce qu'on attend d'un composant réutilisable.
:::

:::lang en
**✅ Check:** without `-e`, `appli.conf` shows `port = 9090` — the play `vars:` beat the `default` (8080). With `-e appli_port=7000`, it shows `port = 7000` — extra-vars wins, as always. The role was **not** modified: you parameterized it from outside, exactly what's expected of a reusable component.
:::

### step-04

:::lang fr
**Objectif.** Ajouter une **dépendance de rôle** — `appli` dépend d'un rôle `commun` qui doit tourner **avant**.

**🤔 À quoi ça sert ?** À garantir un ordre : « avant de déployer l'appli, pose toujours la base commune (utilisateur applicatif, dossier racine, réglages système) ». La dépendance vit dans `meta/main.yml` et Ansible exécute le rôle dépendant **en premier**, automatiquement.

Crée le rôle `commun`, puis déclare-le en dépendance de `appli` :
:::

:::lang en
**Goal.** Add a **role dependency** — `appli` depends on a `commun` role that must run **before**.

**🤔 What's it for?** To guarantee ordering: "before deploying the app, always lay the common base (app user, root folder, system settings)". The dependency lives in `meta/main.yml` and Ansible runs the dependency role **first**, automatically.

Create the `commun` role, then declare it as a dependency of `appli`:
:::

```bash
ansible-galaxy init roles/commun
```

```yaml
# roles/commun/tasks/main.yml
- name: Poser un marqueur de base commune
  ansible.builtin.copy:
    dest: /tmp/appli-base.txt
    content: "base commune posée\n"
```

```yaml
# roles/appli/meta/main.yml  (remplace le bloc dependencies vide)
dependencies:
  - role: commun
```

```bash
ansible-playbook site.yml
```

:::lang fr
**✅ Vérification :** dans la sortie, la tâche `TASK [commun : Poser un marqueur...]` s'exécute **avant** les tâches de `appli` — c'est l'ordre imposé par la dépendance, sans que tu l'aies listée dans `roles:`. Le fichier `/tmp/appli-base.txt` existe. ⚠️ Attention : le `meta/main.yml` généré par `init` contient un bloc `galaxy_info` ; ajoute `dependencies:` **au même niveau** (colonne 0), pas à l'intérieur de `galaxy_info`.
:::

:::lang en
**✅ Check:** in the output, the `TASK [commun : Poser un marqueur...]` task runs **before** `appli`'s tasks — the order imposed by the dependency, without you listing it in `roles:`. The `/tmp/appli-base.txt` file exists. ⚠️ Careful: the `meta/main.yml` generated by `init` contains a `galaxy_info` block; add `dependencies:` **at the same level** (column 0), not inside `galaxy_info`.
:::

### step-05

:::lang fr
**Objectif.** Appeler un rôle avec **`import_role`** (statique) et **`include_role`** (dynamique) depuis les `tasks:`.

**🤔 La vraie différence.** `roles:` (en tête de play) et `import_role` sont **statiques** : Ansible les résout au parsing, avant d'exécuter. `include_role` est **dynamique** : résolu à l'exécution — donc le seul qui marche dans une **boucle** ou derrière un `when` qui dépend d'une variable calculée. À l'examen, si tu veux « appliquer un rôle seulement si une condition runtime », c'est `include_role`.

Crée `flexible.yml` :
:::

:::lang en
**Goal.** Call a role with **`import_role`** (static) and **`include_role`** (dynamic) from `tasks:`.

**🤔 The real difference.** `roles:` (play header) and `import_role` are **static**: Ansible resolves them at parse time, before running. `include_role` is **dynamic**: resolved at run time — so the only one that works in a **loop** or behind a `when` that depends on a computed variable. On the exam, if you want to "apply a role only if a runtime condition", it's `include_role`.

Create `flexible.yml`:
:::

```yaml
# ~/ansible-roles/flexible.yml
- name: Import vs include
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    deployer_appli: true
  tasks:
    - name: Base commune (import statique, toujours)
      ansible.builtin.import_role:
        name: commun

    - name: Appli (include dynamique, conditionnel)
      ansible.builtin.include_role:
        name: appli
      when: deployer_appli | bool
```

```bash
ansible-playbook flexible.yml                       # les deux rôles s'appliquent
ansible-playbook flexible.yml -e deployer_appli=false  # seul commun s'applique
```

:::lang fr
**✅ Vérification :** avec les valeurs par défaut, les deux rôles tournent. Avec `-e deployer_appli=false`, seul `commun` s'exécute (le bloc `include_role` de `appli` est **sauté** par le `when`). Un détail important : un `when` sur `include_role` conditionne l'**inclusion entière** du rôle ; sur `import_role`, le `when` serait appliqué à **chaque tâche** du rôle. C'est la nuance statique/dynamique en pratique.
:::

:::lang en
**✅ Check:** with default values, both roles run. With `-e deployer_appli=false`, only `commun` runs (the `include_role` block of `appli` is **skipped** by the `when`). An important detail: a `when` on `include_role` conditions the **whole inclusion** of the role; on `import_role`, the `when` would be applied to **each task** of the role. That's the static/dynamic nuance in practice.
:::

### step-06

:::lang fr
**Objectif.** Comprendre les **collections** et appeler un module par son **FQCN**.

**🤔 Pourquoi le FQCN ?** Depuis Ansible 2.10, les modules vivent dans des collections. `copy` seul est ambigu ; `ansible.builtin.copy` ne l'est pas. Écrire le nom complet est la règle moderne (et une exigence tacite de l'examen : c'est plus lisible et sans collision).

D'abord, liste ce que tu as déjà, puis (si tu as le réseau) installe une collection :
:::

:::lang en
**Goal.** Understand **collections** and call a module by its **FQCN**.

**🤔 Why the FQCN?** Since Ansible 2.10, modules live in collections. `copy` alone is ambiguous; `ansible.builtin.copy` is not. Writing the full name is the modern rule (and a tacit exam requirement: more readable, no collision).

First, list what you already have, then (if you have network) install a collection:
:::

```bash
# Ce qui est déjà installé / what's already installed
ansible-galaxy collection list | head -n 20

# ansible.builtin est TOUJOURS là (le cœur) / ansible.builtin is ALWAYS there (the core)
ansible-doc -l ansible.builtin | head -n 5

# Avec réseau : installer une collection communautaire / with network: install a community collection
ansible-galaxy collection install community.general
ansible-doc community.general.timezone | head -n 5     # doc d'un module de la collection
```

:::lang fr
**✅ Vérification :** `ansible-galaxy collection list` affiche au moins `ansible.builtin` (et, sur une install packagée, plusieurs collections préinstallées comme `community.general`, `ansible.posix`). Tu as utilisé le **FQCN** partout depuis le début de ce track (`ansible.builtin.copy`, `ansible.builtin.template`…) — c'est ça, la bonne pratique. **Sans réseau :** saute `collection install` ; `ansible.builtin` suffit pour tout ce guide. **Avec réseau :** `ansible-galaxy collection install community.general` termine par `... was installed successfully` et `ansible-doc community.general.timezone` affiche la doc du module.
:::

:::lang en
**✅ Check:** `ansible-galaxy collection list` shows at least `ansible.builtin` (and, on a packaged install, several preinstalled collections like `community.general`, `ansible.posix`). You've used the **FQCN** everywhere since the start of this track (`ansible.builtin.copy`, `ansible.builtin.template`…) — that's the best practice. **Without network:** skip `collection install`; `ansible.builtin` covers this whole guide. **With network:** `ansible-galaxy collection install community.general` ends with `... was installed successfully` and `ansible-doc community.general.timezone` shows the module's doc.
:::

### step-07

:::lang fr
**Objectif.** Écrire un **`requirements.yml`** qui déclare rôles **et** collections, et l'installer.

**🤔 Pourquoi c'est central au RHCE.** On te livre un projet ; tu dois installer ses dépendances **de façon reproductible**. Le `requirements.yml` est le manifeste : quiconque clone le repo lance une commande et obtient exactement les mêmes rôles/collections. Deux syntaxes cohabitent dans le fichier : une clé `roles:` et une clé `collections:`.

Crée `requirements.yml` :
:::

:::lang en
**Goal.** Write a **`requirements.yml`** declaring roles **and** collections, and install it.

**🤔 Why it's central to RHCE.** You're handed a project; you must install its dependencies **reproducibly**. The `requirements.yml` is the manifest: anyone who clones the repo runs one command and gets exactly the same roles/collections. Two syntaxes coexist in the file: a `roles:` key and a `collections:` key.

Create `requirements.yml`:
:::

```yaml
# ~/ansible-roles/requirements.yml
roles:
  # depuis Galaxy / from Galaxy
  - name: geerlingguy.ntp
    version: "2.4.1"
collections:
  - name: community.general
    version: ">=8.0.0"
  - name: ansible.posix
```

```bash
# Installer les rôles (dans ./roles par défaut si configuré) / install roles
ansible-galaxy role install -r requirements.yml -p roles/

# Installer les collections / install collections
ansible-galaxy collection install -r requirements.yml

# Vérifier / verify
ls roles/ && ansible-galaxy collection list | grep -E "community.general|ansible.posix"
```

:::lang fr
**✅ Vérification (avec réseau) :** `ansible-galaxy role install -r requirements.yml -p roles/` télécharge `geerlingguy.ntp` dans `roles/`, et `collection install -r requirements.yml` installe `community.general` et `ansible.posix`. `ls roles/` montre `appli commun geerlingguy.ntp`. **Sans réseau :** l'installation échoue (normal, pas d'accès Galaxy) — mais le **fichier** `requirements.yml` est l'essentiel à savoir écrire pour l'examen. Retiens la structure : deux clés `roles:` et `collections:`, chacune avec `name` et éventuellement `version`. C'est le manifeste de dépendances que tout projet Ansible sérieux embarque.
:::

:::lang en
**✅ Check (with network):** `ansible-galaxy role install -r requirements.yml -p roles/` downloads `geerlingguy.ntp` into `roles/`, and `collection install -r requirements.yml` installs `community.general` and `ansible.posix`. `ls roles/` shows `appli commun geerlingguy.ntp`. **Without network:** installation fails (normal, no Galaxy access) — but the **file** `requirements.yml` is the essential thing to know how to write for the exam. Remember the structure: two keys `roles:` and `collections:`, each with `name` and optionally `version`. It's the dependency manifest every serious Ansible project ships.
:::

## pitfalls

:::lang fr
**1. Mettre une variable paramétrable dans `vars/` du rôle.** `vars/` est **fort** : l'utilisateur ne peut plus la surcharger simplement. Les réglages destinés à être changés vont dans **`defaults/`** (le niveau le plus faible). Erreur de conception classique.

**2. Oublier le FQCN.** `copy:` peut marcher par « collection search path », mais c'est fragile. Écris **toujours** `ansible.builtin.copy`. Deux collections peuvent avoir un module du même nom.

**3. `dependencies:` mal placé dans `meta/main.yml`.** Le fichier généré contient `galaxy_info:`. `dependencies:` doit être **au niveau racine** (colonne 0), pas indenté sous `galaxy_info`. Sinon il est ignoré silencieusement.

**4. Attendre qu'`include_role` se comporte comme `import_role`.** Un `when` sur `import_role` s'applique à **chaque tâche** du rôle ; sur `include_role`, il conditionne **toute l'inclusion**. Et seul `include_role` marche dans un `loop`.

**5. `ansible-galaxy install` pour une collection.** `ansible-galaxy install -r ...` gère les **rôles** ; les collections, c'est `ansible-galaxy collection install -r ...`. Deux sous-commandes distinctes (même si `requirements.yml` peut contenir les deux).

**6. Chemins de rôles non trouvés.** Ansible cherche les rôles dans `roles/` **relatif au playbook**, puis dans `roles_path` (config). Si `site.yml` ne « voit » pas ton rôle, vérifie que `roles/<nom>/` est bien à côté du playbook, ou configure `roles_path` dans `ansible.cfg`.

**7. Croire que `roles:` et `tasks:` s'exécutent dans l'ordre écrit.** Les rôles listés sous `roles:` tournent **avant** les `tasks:` du même play (sauf `pre_tasks`/`post_tasks`). Si tu veux un ordre précis mêlant tâches et rôles, utilise `import_role`/`include_role` **dans** `tasks:`.
:::

:::lang en
**1. Putting a parameterizable variable in the role's `vars/`.** `vars/` is **strong**: the user can no longer simply override it. Settings meant to change go in **`defaults/`** (the weakest level). Classic design mistake.

**2. Forgetting the FQCN.** `copy:` may work via "collection search path", but it's fragile. **Always** write `ansible.builtin.copy`. Two collections can have a same-named module.

**3. `dependencies:` misplaced in `meta/main.yml`.** The generated file contains `galaxy_info:`. `dependencies:` must be at the **root level** (column 0), not indented under `galaxy_info`. Otherwise it's silently ignored.

**4. Expecting `include_role` to behave like `import_role`.** A `when` on `import_role` applies to **each task** of the role; on `include_role`, it conditions **the whole inclusion**. And only `include_role` works in a `loop`.

**5. `ansible-galaxy install` for a collection.** `ansible-galaxy install -r ...` handles **roles**; collections are `ansible-galaxy collection install -r ...`. Two distinct subcommands (even if `requirements.yml` can hold both).

**6. Role paths not found.** Ansible looks for roles in `roles/` **relative to the playbook**, then in `roles_path` (config). If `site.yml` doesn't "see" your role, check `roles/<name>/` sits next to the playbook, or set `roles_path` in `ansible.cfg`.

**7. Thinking `roles:` and `tasks:` run in written order.** Roles listed under `roles:` run **before** the same play's `tasks:` (except `pre_tasks`/`post_tasks`). For a precise order mixing tasks and roles, use `import_role`/`include_role` **inside** `tasks:`.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu génères un rôle avec `ansible-galaxy init` et tu nommes chaque dossier.
- [ ] Tu remplis `defaults/`, `tasks/`, `templates/`, `handlers/` et tu appelles le rôle avec `roles:`.
- [ ] Tu surcharges un `default` depuis le play et avec `-e`, et tu sais pourquoi `vars/` résiste.
- [ ] Une dépendance `meta/main.yml` fait tourner un rôle **avant** un autre.
- [ ] Tu choisis `import_role` (statique) vs `include_role` (dynamique) à bon escient.
- [ ] Tu appelles tes modules en **FQCN** et tu listes tes collections.
- [ ] Tu écris un `requirements.yml` avec `roles:` **et** `collections:`.

Sept cases = ton code Ansible est factorisé et distribuable. La suite : chiffrer les secrets avec Vault.
:::

:::lang en
You know it works when…

- [ ] You generate a role with `ansible-galaxy init` and name each folder.
- [ ] You fill `defaults/`, `tasks/`, `templates/`, `handlers/` and call the role with `roles:`.
- [ ] You override a `default` from the play and with `-e`, and know why `vars/` resists.
- [ ] A `meta/main.yml` dependency runs one role **before** another.
- [ ] You choose `import_role` (static) vs `include_role` (dynamic) wisely.
- [ ] You call your modules in **FQCN** and list your collections.
- [ ] You write a `requirements.yml` with `roles:` **and** `collections:`.

Seven boxes = your Ansible code is factored and distributable. Next up: encrypt secrets with Vault.
:::

## next

:::lang fr
La suite du track RHCE :

1. **Ansible — Vault** : chiffrer les variables et fichiers sensibles (`ansible-vault`), `encrypt_string`, vault-id, fichier de mot de passe — pour que tes rôles versionnés ne fuitent aucun secret.
2. Plus loin : administration système par modules, puis le **projet d'entreprise** RHCE qui assemble rôles, templates, Vault et inventaire.
:::

:::lang en
The RHCE track continues:

1. **Ansible — Vault**: encrypt sensitive variables and files (`ansible-vault`), `encrypt_string`, vault-id, password file — so your versioned roles leak no secret.
2. Further along: system administration via modules, then the RHCE **enterprise project** assembling roles, templates, Vault and inventory.
:::

## cheatsheet

:::lang fr
Aide-mémoire rôles & collections.
:::

:::lang en
Roles & collections cheat sheet.
:::

```bash
# Rôles / Roles
ansible-galaxy init roles/monrole          # squelette / scaffold
ansible-galaxy role list                    # rôles installés / installed roles
ansible-galaxy role install -r requirements.yml -p roles/

# Collections
ansible-galaxy collection list              # collections installées / installed
ansible-galaxy collection install community.general
ansible-galaxy collection install -r requirements.yml

# Doc & FQCN
ansible-doc -l ansible.builtin              # modules d'une collection / a collection's modules
ansible-doc ansible.builtin.template        # doc d'un module / a module's doc
```

```yaml
# Utiliser un rôle / use a role
- hosts: web
  roles:
    - appli                 # import statique en tête de play / static import
  tasks:
    - ansible.builtin.import_role:  { name: commun }   # statique / static
    - ansible.builtin.include_role: { name: appli }    # dynamique (loop, when) / dynamic
      when: condition_runtime

# meta/main.yml — dépendances (au niveau racine !) / dependencies (root level!)
dependencies:
  - role: commun

# requirements.yml
roles:
  - name: geerlingguy.ntp
    version: "2.4.1"
collections:
  - name: community.general
  - name: ansible.posix
```

## resources

:::lang fr
- [Rôles Ansible](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html) — structure, `roles:`, `import`/`include`, dépendances.
- [Réutiliser (import vs include)](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse.html) — statique vs dynamique.
- [Utiliser les collections](https://docs.ansible.com/ansible/latest/collections_guide/collections_using_playbooks.html) — FQCN, `collections:`, recherche.
- [Installer contenu depuis Galaxy](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html) — `ansible-galaxy`, `requirements.yml`.
- [Objectifs RHCE / EX294](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — la certification visée.
:::

:::lang en
- [Ansible roles](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html) — structure, `roles:`, `import`/`include`, dependencies.
- [Re-using (import vs include)](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse.html) — static vs dynamic.
- [Using collections](https://docs.ansible.com/ansible/latest/collections_guide/collections_using_playbooks.html) — FQCN, `collections:`, search.
- [Installing content from Galaxy](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html) — `ansible-galaxy`, `requirements.yml`.
- [RHCE / EX294 objectives](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — the target certification.
:::

## troubleshooting

:::lang fr
**`ERROR! the role 'appli' was not found`.** Ansible ne trouve pas le rôle. Vérifie que `roles/appli/` est **à côté** du playbook, ou configure `roles_path = roles` dans `ansible.cfg`. Le nom sous `roles:` doit correspondre au **nom du dossier**.

**Ma dépendance ne s'exécute pas.** `dependencies:` est probablement indenté sous `galaxy_info:` dans `meta/main.yml`. Remets-le au niveau racine (colonne 0).

**Le `when` sur mon rôle importé filtre chaque tâche, pas le rôle entier.** C'est le comportement d'`import_role` (statique). Pour conditionner l'inclusion complète, utilise `include_role`.

**`ansible-galaxy collection install` échoue en réseau.** Vérifie l'accès à `galaxy.ansible.com` (proxy, DNS). Sans réseau, `ansible.builtin` reste disponible pour tout ce guide.

**Une variable de `defaults/` n'est pas prise en compte.** Elle est peut-être surchargée plus haut (group_vars, host_vars, `-e`). Rappelle-toi : `defaults/` est le niveau **le plus faible**. Trace avec `ansible-playbook ... -e` ou un `debug`.

**`ansible-galaxy role install -r` ne trouve pas les collections.** Normal : cette sous-commande n'installe que les **rôles**. Lance en plus `ansible-galaxy collection install -r requirements.yml`.
:::

:::lang en
**`ERROR! the role 'appli' was not found`.** Ansible can't find the role. Check that `roles/appli/` sits **next to** the playbook, or set `roles_path = roles` in `ansible.cfg`. The name under `roles:` must match the **folder name**.

**My dependency doesn't run.** `dependencies:` is probably indented under `galaxy_info:` in `meta/main.yml`. Move it to root level (column 0).

**The `when` on my imported role filters each task, not the whole role.** That's `import_role`'s (static) behavior. To condition the whole inclusion, use `include_role`.

**`ansible-galaxy collection install` fails on network.** Check access to `galaxy.ansible.com` (proxy, DNS). Without network, `ansible.builtin` stays available for this whole guide.

**A `defaults/` variable isn't taken into account.** It's probably overridden higher up (group_vars, host_vars, `-e`). Remember: `defaults/` is the **weakest** level. Trace with `ansible-playbook ... -e` or a `debug`.

**`ansible-galaxy role install -r` doesn't find the collections.** Normal: that subcommand installs only **roles**. Additionally run `ansible-galaxy collection install -r requirements.yml`.
:::
