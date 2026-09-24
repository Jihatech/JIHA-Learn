---
# — Identité (ne change JAMAIS une fois publié) —
id: ansible-variables-facts-templates
slug: ansible-variables-facts-templates
order: 23
status: published

# — Titres & accroches (bilingue) —
title_fr: "Ansible — variables, facts & templates Jinja2"
title_en: "Ansible — variables, facts & Jinja2 templates"
tagline_fr: "précédence, facts, custom facts, set_fact, Jinja2."
tagline_en: "precedence, facts, custom facts, set_fact, Jinja2."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 220
repo: "ansible/ansible"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [ansible-taches-avancees]
next: [ansible-roles-collections]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [precedence-variables, facts, set-fact, custom-facts, templates-jinja2, filtres-jinja2, variables-magiques]
concepts_en: [variable-precedence, facts, set-fact, custom-facts, jinja2-templates, jinja2-filters, magic-variables]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le cœur data d'Ansible au niveau RHCE/EX294 : la précédence des variables (extra-vars gagne toujours), les facts (structure ansible_facts, filtrage, set_fact pour dériver), les custom facts dans /etc/ansible/facts.d (ansible_local), les templates Jinja2 (filtres default/mandatory/join, boucles for et if dans un .j2), et les variables magiques (hostvars, groups) pour du templating inter-hôtes. Testable en local."
og_description_en: "Ansible's data core at RHCE/EX294 level: variable precedence (extra-vars always wins), facts (ansible_facts structure, filtering, set_fact to derive), custom facts in /etc/ansible/facts.d (ansible_local), Jinja2 templates (default/mandatory/join filters, for loops and if in a .j2), and magic variables (hostvars, groups) for cross-host templating. Testable locally."
---

## intro

:::lang fr
Un playbook sans variables, c'est du copier-coller déguisé : le même port écrit à dix endroits, le même chemin dupliqué, et le jour où ça change, tu oublies une occurrence. Les **variables**, les **facts** (ce qu'Ansible découvre tout seul sur une machine) et les **templates Jinja2** (des fichiers de config générés à partir de variables) sont ce qui rend un playbook **paramétrable** et **réutilisable**. C'est aussi, sans exagérer, la moitié de l'examen RHCE/EX294 : « déployer un fichier de config templaté », « utiliser les facts », « gérer les variables ».

Le sujet est vaste et truffé de pièges — surtout **la précédence** (quelle valeur gagne quand la même variable est définie à cinq endroits ?). Ce guide te fait tout **manipuler** : tu inspectes les facts, tu en fabriques (`set_fact`, custom facts), tu vois de tes yeux `-e` (extra-vars) écraser tout le reste, tu écris un template Jinja2 avec une **boucle** et une **condition**, et tu génères un vrai fichier de config à partir des données de ton inventaire.

**Pour qui c'est :** tu maîtrises playbooks, inventaire et contrôle de flux (guides précédents) et tu veux rendre tes automatisations paramétrables.

**Quand ce n'est PAS le bon choix :**

- Tu débutes sur les playbooks → reviens aux guides précédents du track.
- Tu veux chiffrer des variables sensibles → c'est **Ansible Vault**, un guide dédié plus loin ; ici on manipule les variables « en clair ».
:::

:::lang en
A playbook with no variables is disguised copy-paste: the same port written in ten places, the same path duplicated, and the day it changes you forget one occurrence. **Variables**, **facts** (what Ansible discovers on its own about a machine) and **Jinja2 templates** (config files generated from variables) are what make a playbook **parameterizable** and **reusable**. It's also, no exaggeration, half of the RHCE/EX294 exam: "deploy a templated config file", "use facts", "manage variables".

The topic is vast and full of traps — especially **precedence** (which value wins when the same variable is defined in five places?). This guide makes you **handle** everything: you inspect facts, you fabricate them (`set_fact`, custom facts), you see with your own eyes `-e` (extra-vars) override everything else, you write a Jinja2 template with a **loop** and a **condition**, and you generate a real config file from your inventory's data.

**Who it's for:** you master playbooks, inventory and flow control (previous guides) and you want to make your automations parameterizable.

**When it's NOT the right choice:**

- You're new to playbooks → go back to the earlier track guides.
- You want to encrypt sensitive variables → that's **Ansible Vault**, a dedicated guide further along; here we handle variables "in clear".
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Inspecter les **facts** (`ansible_facts`), les **filtrer** et les utiliser dans une tâche.
- Fabriquer une variable dérivée avec **`set_fact`**.
- Prédire la **précédence** des variables — et prouver que **`-e` (extra-vars) gagne toujours**.
- Écrire des **custom facts** (`/etc/ansible/facts.d/*.fact`) et les lire via `ansible_local`.
- Appliquer les **filtres Jinja2** essentiels : `default`, `mandatory`, `join`, `int`, ternaire.
- Générer un fichier de config avec le module **`template`**, une **boucle** `for` et un **`if`**.
- Exploiter les **variables magiques** (`hostvars`, `groups`, `inventory_hostname`) pour du templating inter-hôtes.
:::

:::lang en
By the end of this guide, you can:

- Inspect **facts** (`ansible_facts`), **filter** them and use them in a task.
- Build a derived variable with **`set_fact`**.
- Predict variable **precedence** — and prove that **`-e` (extra-vars) always wins**.
- Write **custom facts** (`/etc/ansible/facts.d/*.fact`) and read them via `ansible_local`.
- Apply the essential **Jinja2 filters**: `default`, `mandatory`, `join`, `int`, ternary.
- Generate a config file with the **`template`** module, a `for` **loop** and an **`if`**.
- Use **magic variables** (`hostvars`, `groups`, `inventory_hostname`) for cross-host templating.
:::

## prerequisites

:::lang fr
- Les guides Ansible **fondamentaux**, **inventaire & configuration**, **tâches avancées** terminés.
- **Ansible ≥ 2.16** (`ansible --version`).
- Un dossier de travail. Tout est **testable en local** : les playbooks ciblent `localhost` en `connection: local`. Les facts se collectent sur ta propre machine, les templates se rendent dans `/tmp`. Aucune VM nécessaire.
- Pour les custom facts (étape 6), les droits **root** (via `become`) pour écrire dans `/etc/ansible/facts.d/`.
:::

:::lang en
- The Ansible **fundamentals**, **inventory & configuration**, **advanced tasks** guides done.
- **Ansible ≥ 2.16** (`ansible --version`).
- A working folder. Everything is **testable locally**: the playbooks target `localhost` with `connection: local`. Facts are gathered on your own machine, templates render into `/tmp`. No VM needed.
- For custom facts (step 6), **root** rights (via `become`) to write into `/etc/ansible/facts.d/`.
:::

## concepts

:::lang fr
**Facts.** Des variables qu'Ansible **découvre** automatiquement au début d'un play (si `gather_facts: true`, le défaut) : OS, IP, mémoire, CPU, montages… Elles vivent sous `ansible_facts` (ex. `ansible_facts['distribution']`). Historiquement on les trouvait aussi en variables préfixées `ansible_` (ex. `ansible_distribution`) — encore courant, mais `ansible_facts['...']` est la forme moderne recommandée.

**`set_fact`.** Crée (ou recalcule) une variable **en cours de play**, sur l'hôte courant. Utile pour dériver une valeur (`ansible_facts['memtotal_mb'] // 2`) ou stabiliser un calcul avant de le réutiliser.

**Précédence des variables.** Quand la même variable est définie à plusieurs endroits, Ansible applique un ordre strict. Les niveaux que tu dois connaître pour le RHCE, du **plus faible au plus fort** : les *role defaults* (`defaults/main.yml`) < les *group_vars/all* < *group_vars* d'un groupe < *host_vars* < les *vars du play* < `set_fact`/`register` < les **extra-vars** (`-e`). Règle à graver : **`-e` sur la ligne de commande gagne TOUJOURS**, quoi qu'il y ait ailleurs.

**Custom facts.** Tes propres facts, posés sur la machine gérée dans `/etc/ansible/facts.d/<nom>.fact` (format INI ou script exécutable renvoyant du JSON). Ansible les collecte et les expose sous `ansible_local.<nom>.<section>.<clé>`. C'est un objectif RHCE explicite.

**Template Jinja2.** Un fichier `.j2` où tu insères des variables (`{{ ma_var }}`), des **boucles** (`{% for x in liste %}`) et des **conditions** (`{% if ... %}`). Le module `template` le **rend** puis le dépose sur la cible. C'est ainsi qu'on génère un `nginx.conf`, un `/etc/hosts`, un fichier `.env`.

**Filtres Jinja2.** Des transformations en pipe : `{{ ma_var | default('valeur') }}` (valeur par défaut si indéfinie), `| mandatory` (échoue si indéfinie), `| join(',')`, `| int`, `| upper`, ou le ternaire `{{ (cond) | ternary('oui','non') }}`.

**Variables magiques.** Fournies par Ansible : `inventory_hostname` (le nom de l'hôte courant dans l'inventaire), `groups` (dict groupe → liste d'hôtes), `hostvars` (accès aux variables/facts **des autres** hôtes). Indispensables pour générer, sur un load-balancer, la liste de ses backends.
:::

:::lang en
**Facts.** Variables Ansible **discovers** automatically at the start of a play (if `gather_facts: true`, the default): OS, IP, memory, CPU, mounts… They live under `ansible_facts` (e.g. `ansible_facts['distribution']`). Historically they were also exposed as `ansible_`-prefixed variables (e.g. `ansible_distribution`) — still common, but `ansible_facts['...']` is the recommended modern form.

**`set_fact`.** Creates (or recomputes) a variable **during the play**, on the current host. Useful to derive a value (`ansible_facts['memtotal_mb'] // 2`) or stabilize a computation before reusing it.

**Variable precedence.** When the same variable is defined in several places, Ansible applies a strict order. The levels you must know for RHCE, from **weakest to strongest**: *role defaults* (`defaults/main.yml`) < *group_vars/all* < a group's *group_vars* < *host_vars* < *play vars* < `set_fact`/`register` < **extra-vars** (`-e`). Rule to engrave: **`-e` on the command line ALWAYS wins**, whatever exists elsewhere.

**Custom facts.** Your own facts, placed on the managed machine in `/etc/ansible/facts.d/<name>.fact` (INI format or an executable script returning JSON). Ansible collects them and exposes them under `ansible_local.<name>.<section>.<key>`. It's an explicit RHCE objective.

**Jinja2 template.** A `.j2` file where you insert variables (`{{ my_var }}`), **loops** (`{% for x in list %}`) and **conditions** (`{% if ... %}`). The `template` module **renders** it then drops it on the target. That's how you generate an `nginx.conf`, an `/etc/hosts`, a `.env` file.

**Jinja2 filters.** Piped transformations: `{{ my_var | default('value') }}` (default if undefined), `| mandatory` (fails if undefined), `| join(',')`, `| int`, `| upper`, or the ternary `{{ (cond) | ternary('yes','no') }}`.

**Magic variables.** Provided by Ansible: `inventory_hostname` (the current host's name in the inventory), `groups` (dict group → list of hosts), `hostvars` (access to **other** hosts' variables/facts). Essential to generate, on a load-balancer, the list of its backends.
:::

:::figure ansible-var-precedence
caption_fr: "Schéma 1. La précédence des variables, du plus faible (role defaults) au plus fort (extra-vars -e). La valeur du niveau le plus haut défini l'emporte ; -e gagne toujours."
caption_en: "Figure 1. Variable precedence, from weakest (role defaults) to strongest (extra-vars -e). The highest defined level wins; -e always wins."
:::

## walkthrough

:::lang fr
On avance ainsi : facts → set_fact → précédence & extra-vars → filtres Jinja2 → template avec boucle & if → custom facts → variables magiques.
:::

:::lang en
We'll go like this: facts → set_fact → precedence & extra-vars → Jinja2 filters → template with loop & if → custom facts → magic variables.
:::

### step-01

:::lang fr
**Objectif.** Inspecter les **facts**, les **filtrer**, et en utiliser un dans une tâche.

**🤔 Pourquoi les facts d'abord ?** Parce que la moitié des variables que tu utilises viennent de la machine elle-même (distribution, mémoire, IP). Savoir **où** elles vivent (`ansible_facts[...]`) et comment n'en collecter qu'une partie (les facts, c'est lent) est un réflexe RHCE.

Crée `data.yml` :
:::

:::lang en
**Goal.** Inspect **facts**, **filter** them, and use one in a task.

**🤔 Why facts first?** Because half the variables you use come from the machine itself (distribution, memory, IP). Knowing **where** they live (`ansible_facts[...]`) and how to gather only some (facts are slow) is an RHCE reflex.

Create `data.yml`:
:::

```yaml
- name: Facts & variables — atelier
  hosts: localhost
  connection: local
  gather_facts: true
  tasks:
    - name: Quelques facts utiles
      ansible.builtin.debug:
        msg: >-
          distro={{ ansible_facts['distribution'] }}
          {{ ansible_facts['distribution_version'] }} |
          famille={{ ansible_facts['os_family'] }} |
          mémoire={{ ansible_facts['memtotal_mb'] }} Mo |
          vcpus={{ ansible_facts['processor_vcpus'] }}
```

```bash
# Explorer les facts à la volée (ad-hoc) / explore facts on the fly
ansible localhost -c local -m ansible.builtin.setup -a "filter=ansible_memtotal_mb"
ansible localhost -c local -m ansible.builtin.setup -a "filter=ansible_distribution*"

ansible-playbook data.yml
```

:::lang fr
**✅ Vérification :** l'ad-hoc `filter=ansible_memtotal_mb` renvoie un JSON avec la mémoire totale ; `filter=ansible_distribution*` renvoie plusieurs clés (distribution, version, release…). Le playbook affiche une ligne récap `distro=Ubuntu 24.04 | famille=Debian | mémoire=… Mo | vcpus=…`. Note : en **ad-hoc**, le filtre utilise le nom **préfixé** `ansible_memtotal_mb` ; dans un **playbook**, tu lis `ansible_facts['memtotal_mb']` (sans le préfixe). Les deux pointent la même donnée.
:::

:::lang en
**✅ Check:** the ad-hoc `filter=ansible_memtotal_mb` returns a JSON with the total memory; `filter=ansible_distribution*` returns several keys (distribution, version, release…). The playbook prints a recap line `distro=Ubuntu 24.04 | famille=Debian | mémoire=… Mo | vcpus=…`. Note: in **ad-hoc**, the filter uses the **prefixed** name `ansible_memtotal_mb`; in a **playbook**, you read `ansible_facts['memtotal_mb']` (no prefix). Both point to the same data.
:::

### step-02

:::lang fr
**Objectif.** Fabriquer une variable **dérivée** avec `set_fact`.

**🤔 Quand set_fact ?** Quand une valeur se **calcule** à partir d'autres (la moitié de la RAM pour un buffer, un nom composé, une liste filtrée) et que tu veux la **réutiliser** ensuite sans recopier le calcul. `set_fact` fixe la valeur sur l'hôte pour tout le reste du play.

Ajoute à `data.yml` :
:::

:::lang en
**Goal.** Build a **derived** variable with `set_fact`.

**🤔 When set_fact?** When a value is **computed** from others (half the RAM for a buffer, a composed name, a filtered list) and you want to **reuse** it later without copying the computation. `set_fact` pins the value on the host for the rest of the play.

Add to `data.yml`:
:::

```yaml
    - name: Calculer la moitié de la RAM (buffer)
      ansible.builtin.set_fact:
        buffer_mb: "{{ (ansible_facts['memtotal_mb'] | int // 2) }}"
        appli_id: "{{ ansible_facts['hostname'] }}-{{ ansible_facts['os_family'] | lower }}"

    - name: Réutiliser les variables dérivées
      ansible.builtin.debug:
        msg: "buffer={{ buffer_mb }} Mo | id={{ appli_id }}"
```

```bash
ansible-playbook data.yml
```

:::lang fr
**✅ Vérification :** la dernière tâche affiche `buffer=<moitié de ta RAM> Mo | id=<hostname>-debian`. Le calcul `// 2` (division entière) donne bien un entier. Tu as fabriqué deux variables qui n'existaient dans aucun fichier : elles sont nées d'un calcul sur les facts.
:::

:::lang en
**✅ Check:** the last task prints `buffer=<half your RAM> Mo | id=<hostname>-debian`. The `// 2` computation (integer division) does yield an integer. You built two variables that existed in no file: they were born from a computation on facts.
:::

### step-03

:::lang fr
**Objectif.** **Prouver** la précédence — voir `-e` (extra-vars) écraser une variable définie dans le play.

**🤔 Le piège d'examen n°1.** Tu définis `port: 8080` dans le play, mais le correcteur lance avec `-e port=9090` : c'est **9090** qui gagne. Beaucoup perdent des points en croyant que « c'est écrit dans le playbook donc ça gagne ». Non : `-e` est au sommet de la hiérarchie.

Ajoute à `data.yml`, **au niveau du play** (pas dans une tâche) une section `vars:` :
:::

:::lang en
**Goal.** **Prove** precedence — watch `-e` (extra-vars) override a variable defined in the play.

**🤔 Exam trap #1.** You define `port: 8080` in the play, but the grader runs with `-e port=9090`: **9090** wins. Many lose points thinking "it's written in the playbook so it wins". No: `-e` sits at the top of the hierarchy.

Add to `data.yml`, **at play level** (not inside a task) a `vars:` section:
:::

```yaml
- name: Facts & variables — atelier
  hosts: localhost
  connection: local
  gather_facts: true
  vars:
    app_port: 8080             # valeur "par défaut" du play / play "default" value
  tasks:
    # ... (tâches précédentes) ...
    - name: Quel port gagne ?
      ansible.builtin.debug:
        msg: "port effectif = {{ app_port }}"
```

:::lang fr
⚠️ On nomme la variable `app_port` et **pas** `port` : `port` est un **nom réservé** (variable de connexion) dans Ansible récent et déclencherait un avertissement inutile. Réflexe utile pour l'examen : évite les noms réservés (`port`, `hosts`, `name`, `user`…) pour tes variables.
:::

:::lang en
⚠️ We name the variable `app_port`, **not** `port`: `port` is a **reserved name** (connection variable) in recent Ansible and would trigger a needless warning. Useful exam reflex: avoid reserved names (`port`, `hosts`, `name`, `user`…) for your variables.
:::

```bash
ansible-playbook data.yml                    # -> port effectif = 8080 (valeur du play)
ansible-playbook data.yml -e app_port=9090   # -> port effectif = 9090 (extra-vars gagne !)
```

:::lang fr
**✅ Vérification :** sans `-e`, la tâche affiche `port effectif = 8080`. Avec `-e app_port=9090`, elle affiche `port effectif = 9090` — **la même variable, écrasée depuis la ligne de commande**. Rien n'a changé dans le fichier : c'est la précédence en action. Retiens : `-e` > vars du play > host_vars > group_vars > defaults.
:::

:::lang en
**✅ Check:** without `-e`, the task prints `port effectif = 8080`. With `-e app_port=9090`, it prints `port effectif = 9090` — **the same variable, overridden from the command line**. Nothing changed in the file: that's precedence in action. Remember: `-e` > play vars > host_vars > group_vars > defaults.
:::

### step-04

:::lang fr
**Objectif.** Appliquer les **filtres Jinja2** essentiels — surtout `default` et `mandatory`.

**🤔 Pourquoi c'est vital.** Un template qui référence une variable **indéfinie** plante (`AnsibleUndefinedVariable`). `| default('x')` fournit un repli ; `| mandatory` fait l'inverse : il **exige** la variable et échoue proprement avec un message clair si elle manque. Les autres filtres (`join`, `int`, ternaire) formatent la donnée.

Ajoute à `data.yml` :
:::

:::lang en
**Goal.** Apply the essential **Jinja2 filters** — especially `default` and `mandatory`.

**🤔 Why it's vital.** A template referencing an **undefined** variable crashes (`AnsibleUndefinedVariable`). `| default('x')` provides a fallback; `| mandatory` does the opposite: it **requires** the variable and fails cleanly with a clear message if it's missing. The other filters (`join`, `int`, ternary) format the data.

Add to `data.yml`:
:::

```yaml
    - name: Filtres Jinja2 en action
      ansible.builtin.debug:
        msg: >-
          default={{ region | default('eu-west') }} |
          liste={{ ['web1','web2','db1'] | join(', ') }} |
          majuscules={{ ansible_facts['os_family'] | upper }} |
          ternaire={{ (ansible_facts['memtotal_mb'] | int > 500) | ternary('gros','petit') }}
```

```bash
ansible-playbook data.yml                     # region indéfinie -> default utilisé
ansible-playbook data.yml -e region=us-east   # region définie -> sa valeur
```

:::lang fr
**✅ Vérification :** sans `-e region=...`, la sortie montre `default=eu-west` (le repli). Avec `-e region=us-east`, elle montre `default=us-east`. Tu vois aussi `liste=web1, web2, db1`, `majuscules=DEBIAN`, et `ternaire=gros` (si ta RAM > 500 Mo). Pour tester `mandatory`, ajoute une tâche `msg: "{{ obligatoire | mandatory }}"` sans définir `obligatoire` : le play échoue avec `Mandatory variable 'obligatoire' not defined` — un échec **explicite**, bien mieux qu'un template cassé.
:::

:::lang en
**✅ Check:** without `-e region=...`, the output shows `default=eu-west` (the fallback). With `-e region=us-east`, it shows `default=us-east`. You also see `liste=web1, web2, db1`, `majuscules=DEBIAN`, and `ternaire=gros` (if your RAM > 500 MB). To test `mandatory`, add a task `msg: "{{ obligatoire | mandatory }}"` without defining `obligatoire`: the play fails with `Mandatory variable 'obligatoire' not defined` — an **explicit** failure, far better than a broken template.
:::

### step-05

:::lang fr
**Objectif.** Générer un fichier de config avec le module **`template`**, une **boucle** `for` et une **condition** `if`.

**🤔 Le geste central du RHCE.** « Déployer un fichier de config à partir d'un template » est un objectif d'examen quasi garanti. Un `.j2` combine texte fixe + variables + boucles + conditions. Le module `template` le rend côté nœud de contrôle puis l'écrit sur la cible.

Crée le template `serveurs.conf.j2` :
:::

:::lang en
**Goal.** Generate a config file with the **`template`** module, a `for` **loop** and an `if` **condition**.

**🤔 The central RHCE move.** "Deploy a config file from a template" is a near-guaranteed exam objective. A `.j2` combines fixed text + variables + loops + conditions. The `template` module renders it on the control node then writes it on the target.

Create the template `serveurs.conf.j2`:
:::

```jinja
# Généré par Ansible — NE PAS ÉDITER À LA MAIN
# Hôte : {{ inventory_hostname }} — {{ ansible_facts['distribution'] }}
upstream backend {
{% for s in serveurs %}
    server {{ s.ip }}:{{ s.port | default(8080) }};   # {{ s.nom }}
{% endfor %}
}

{% if activer_tls | default(false) %}
listen 443 ssl;   # TLS activé
{% else %}
listen 80;        # TLS désactivé
{% endif %}
```

:::lang fr
Puis, dans `data.yml`, ajoute une tâche qui fournit les données et rend le template :
:::

:::lang en
Then, in `data.yml`, add a task that supplies the data and renders the template:
:::

```yaml
    - name: Rendre la config depuis le template
      ansible.builtin.template:
        src: serveurs.conf.j2
        dest: /tmp/serveurs.conf
      vars:
        serveurs:
          - { nom: web1, ip: 10.0.0.11, port: 8080 }
          - { nom: web2, ip: 10.0.0.12 }             # pas de port -> default(8080)
          - { nom: web3, ip: 10.0.0.13, port: 9090 }
        activer_tls: true
```

```bash
ansible-playbook data.yml
cat /tmp/serveurs.conf
```

:::lang fr
**✅ Vérification :** `/tmp/serveurs.conf` contient un bloc `upstream backend { ... }` avec **trois** lignes `server` (une par élément de la boucle). La ligne de `web2`, qui n'avait pas de port, affiche `:8080` grâce à `default(8080)`. Comme `activer_tls: true`, tu vois `listen 443 ssl;` et **pas** `listen 80;`. Rejoue le playbook : la tâche `template` est `ok` (le fichier est identique → idempotence). Change une IP et rejoue : elle repasse `changed`.
:::

:::lang en
**✅ Check:** `/tmp/serveurs.conf` contains an `upstream backend { ... }` block with **three** `server` lines (one per loop element). The `web2` line, which had no port, shows `:8080` thanks to `default(8080)`. Since `activer_tls: true`, you see `listen 443 ssl;` and **not** `listen 80;`. Rerun the playbook: the `template` task is `ok` (file identical → idempotence). Change an IP and rerun: it turns `changed` again.
:::

### step-06

:::lang fr
**Objectif.** Écrire des **custom facts** et les lire via `ansible_local` — un objectif RHCE explicite.

**🤔 À quoi ça sert ?** À poser sur une machine des métadonnées **stables** qu'Ansible retrouvera à chaque exécution : le rôle du serveur, un numéro de tranche, l'équipe propriétaire. Format le plus simple : un fichier INI dans `/etc/ansible/facts.d/`, dont le nom finit par `.fact`. Ansible l'expose sous `ansible_local.<nom_sans_.fact>`.

Écris le fact, puis relance la collecte :
:::

:::lang en
**Goal.** Write **custom facts** and read them via `ansible_local` — an explicit RHCE objective.

**🤔 What's it for?** To place **stable** metadata on a machine that Ansible finds again on every run: the server's role, a shard number, the owning team. Simplest format: an INI file in `/etc/ansible/facts.d/`, whose name ends in `.fact`. Ansible exposes it under `ansible_local.<name_without_.fact>`.

Write the fact, then re-run gathering:
:::

```yaml
    - name: Créer le dossier des custom facts
      ansible.builtin.file:
        path: /etc/ansible/facts.d
        state: directory
      become: true

    - name: Déposer un custom fact (INI)
      ansible.builtin.copy:
        dest: /etc/ansible/facts.d/atelier.fact
        content: |
          [role]
          type=frontend
          equipe=plateforme
          tranche=3
      become: true

    - name: Recollecter les facts pour voir le custom fact
      ansible.builtin.setup:
        filter: ansible_local

    - name: Lire le custom fact
      ansible.builtin.debug:
        msg: "role={{ ansible_local.atelier.role.type }} | équipe={{ ansible_local.atelier.role.equipe }} | tranche={{ ansible_local.atelier.role.tranche }}"
```

```bash
ansible-playbook data.yml
```

:::lang fr
**✅ Vérification :** la dernière tâche affiche `role=frontend | équipe=plateforme | tranche=3`. Ces valeurs viennent du fichier `/etc/ansible/facts.d/atelier.fact` que tu viens d'écrire, relues via `ansible_local.atelier.role.*`. ⚠️ **Ordre important :** les custom facts ne sont chargés qu'**après** avoir été écrits. C'est pour ça qu'on ajoute la tâche `setup: filter=ansible_local` **entre** l'écriture et la lecture — sinon `ansible_local.atelier` n'existe pas encore (les facts du tout début de play ont été collectés avant l'écriture).
:::

:::lang en
**✅ Check:** the last task prints `role=frontend | équipe=plateforme | tranche=3`. These values come from the `/etc/ansible/facts.d/atelier.fact` file you just wrote, re-read via `ansible_local.atelier.role.*`. ⚠️ **Order matters:** custom facts are loaded only **after** being written. That's why we add the `setup: filter=ansible_local` task **between** writing and reading — otherwise `ansible_local.atelier` doesn't exist yet (the very-start-of-play facts were gathered before the write).
:::

### step-07

:::lang fr
**Objectif.** Exploiter les **variables magiques** — `inventory_hostname`, `groups`, `hostvars` — pour un template inter-hôtes.

**🤔 Le cas d'usage roi.** Sur un load-balancer, tu veux la liste de **tous les backends** du groupe `web` avec **leur** IP. C'est exactement `groups['web']` (les hôtes) + `hostvars[h]['ansible_host']` (l'IP de chacun). Sans les variables magiques, impossible de générer une config qui parle des *autres* machines.

Crée `magiques.yml` (avec un mini-inventaire en ligne pour tester en local) :
:::

:::lang en
**Goal.** Use **magic variables** — `inventory_hostname`, `groups`, `hostvars` — for a cross-host template.

**🤔 The king use case.** On a load-balancer, you want the list of **all backends** of the `web` group with **their** IP. That's exactly `groups['web']` (the hosts) + `hostvars[h]['ansible_host']` (each one's IP). Without magic variables, you can't generate a config that talks about the *other* machines.

Create `magiques.yml` (with a small inline inventory to test locally):
:::

```yaml
- name: Variables magiques — démo
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    # simule un inventaire : 3 backends avec leur IP / simulate an inventory
    backends:
      web1: 10.0.0.11
      web2: 10.0.0.12
      web3: 10.0.0.13
  tasks:
    - name: Qui suis-je et quels groupes existent ?
      ansible.builtin.debug:
        msg: "je suis {{ inventory_hostname }} | groupes connus : {{ groups.keys() | list }}"

    - name: Générer la liste des backends (comme un LB le ferait)
      ansible.builtin.debug:
        msg: "{% for nom, ip in backends.items() %}{{ nom }}={{ ip }} {% endfor %}"
```

:::lang fr
Pour la version « vraie » avec `hostvars`/`groups`, ajoute ce template `backends.j2` et rends-le contre ton inventaire de parc (`-i inventory.ini`, groupe `web`) :
:::

:::lang en
For the "real" version with `hostvars`/`groups`, add this `backends.j2` template and render it against your fleet inventory (`-i inventory.ini`, `web` group):
:::

```jinja
{% for h in groups['web'] %}
server {{ hostvars[h]['ansible_host'] | default('127.0.0.1') }};  # {{ h }}
{% endfor %}
```

```bash
ansible-playbook magiques.yml
```

:::lang fr
**✅ Vérification :** la première tâche affiche `je suis localhost | groupes connus : ['all', 'ungrouped']` (en local, pas d'autres groupes). La seconde liste `web1=10.0.0.11 web2=10.0.0.12 web3=10.0.0.13` — une boucle Jinja2 **dans** un `msg`. Le template `backends.j2`, rendu contre ton parc `web1`/`web2`, produirait une ligne `server <IP>;` par hôte du groupe `web`, en lisant l'IP de **chaque autre** hôte via `hostvars`. C'est le mécanisme exact d'un `site.yml` de projet qui configure un LB.
:::

:::lang en
**✅ Check:** the first task prints `je suis localhost | groupes connus : ['all', 'ungrouped']` (locally, no other groups). The second lists `web1=10.0.0.11 web2=10.0.0.12 web3=10.0.0.13` — a Jinja2 loop **inside** a `msg`. The `backends.j2` template, rendered against your `web1`/`web2` fleet, would produce one `server <IP>;` line per host of the `web` group, reading each **other** host's IP via `hostvars`. That's the exact mechanism of a project `site.yml` configuring a LB.
:::

## pitfalls

:::lang fr
**1. Croire que « c'est dans le playbook donc ça gagne ».** Non : `-e` (extra-vars) écrase **tout**, y compris les `vars:` du play. C'est le piège de précédence n°1 à l'examen.

**2. `{{ }}` dans un `set_fact` ou pas.** La valeur d'un `set_fact` est une expression : `buffer_mb: "{{ ... }}"`. Mais dans un `when`, on écrit l'expression **nue** (vu au guide précédent). Ne mélange pas les deux réflexes.

**3. Variable indéfinie dans un template.** Un `{{ truc }}` non défini fait planter le rendu. Protège avec `| default(...)`, ou exige avec `| mandatory` pour un échec clair et précoce.

**4. Custom facts lus trop tôt.** `ansible_local.<x>` n'existe **pas** si le fact a été écrit **après** la collecte initiale. Recollecte avec une tâche `setup: filter=ansible_local` entre l'écriture et la lecture.

**5. Nom de fichier custom fact sans `.fact`.** Ansible n'ingère que les fichiers de `/etc/ansible/facts.d/` qui **finissent par `.fact`**. `monrole.txt` sera ignoré. Et le fait doit être un INI valide (ou un exécutable renvoyant du JSON).

**6. `ansible_facts['x']` vs `ansible_x`.** Selon `inject_facts_as_vars` (défaut activé), les deux marchent. Mais la forme moderne et sûre est `ansible_facts['x']`. En **ad-hoc** avec `filter=`, on utilise le nom **préfixé** `ansible_x`.

**7. Espaces Jinja2 dans les templates.** `{% for %}` laisse des lignes vides. Pour un rendu propre, utilise `{%- ... -%}` (trim) ou le paramètre `trim_blocks`. Pas bloquant, mais un `.conf` truffé de lignes vides fait tache.
:::

:::lang en
**1. Thinking "it's in the playbook so it wins".** No: `-e` (extra-vars) overrides **everything**, including the play's `vars:`. It's precedence trap #1 on the exam.

**2. `{{ }}` in a `set_fact` or not.** A `set_fact` value is an expression: `buffer_mb: "{{ ... }}"`. But in a `when`, you write the expression **bare** (seen last guide). Don't mix the two reflexes.

**3. Undefined variable in a template.** An undefined `{{ thing }}` crashes rendering. Protect with `| default(...)`, or require with `| mandatory` for a clear, early failure.

**4. Custom facts read too early.** `ansible_local.<x>` does **not** exist if the fact was written **after** the initial gathering. Re-gather with a `setup: filter=ansible_local` task between writing and reading.

**5. Custom fact filename without `.fact`.** Ansible ingests only files in `/etc/ansible/facts.d/` that **end in `.fact`**. `myrole.txt` is ignored. And the fact must be valid INI (or an executable returning JSON).

**6. `ansible_facts['x']` vs `ansible_x`.** Depending on `inject_facts_as_vars` (default on), both work. But the modern, safe form is `ansible_facts['x']`. In **ad-hoc** with `filter=`, you use the **prefixed** name `ansible_x`.

**7. Jinja2 whitespace in templates.** `{% for %}` leaves blank lines. For clean rendering, use `{%- ... -%}` (trim) or the `trim_blocks` setting. Not blocking, but a `.conf` riddled with blank lines looks sloppy.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu lis un fact via `ansible_facts['...']` et tu filtres avec `setup -a filter=`.
- [ ] Tu dérives une variable avec `set_fact` et tu la réutilises.
- [ ] Tu **prouves** que `-e app_port=9090` écrase le `app_port: 8080` du play.
- [ ] Tu protèges une variable avec `| default(...)` et tu exiges avec `| mandatory`.
- [ ] Tu génères un `.conf` avec un template `for` + `if`, et il est idempotent.
- [ ] Tu écris un custom fact `.fact` et tu le relis via `ansible_local.*`.
- [ ] Tu génères une liste de backends avec `groups[...]` et `hostvars[...]`.

Sept cases = tu paramètres tes automatisations comme un ingénieur RHCE. La suite : rôles & collections.
:::

:::lang en
You know it works when…

- [ ] You read a fact via `ansible_facts['...']` and filter with `setup -a filter=`.
- [ ] You derive a variable with `set_fact` and reuse it.
- [ ] You **prove** that `-e app_port=9090` overrides the play's `app_port: 8080`.
- [ ] You protect a variable with `| default(...)` and require it with `| mandatory`.
- [ ] You generate a `.conf` with a `for` + `if` template, and it's idempotent.
- [ ] You write a `.fact` custom fact and read it back via `ansible_local.*`.
- [ ] You generate a backend list with `groups[...]` and `hostvars[...]`.

Seven boxes = you parameterize your automations like an RHCE engineer. Next up: roles & collections.
:::

## next

:::lang fr
La suite du track RHCE :

1. **Ansible — rôles & collections** : structurer ton code en rôles réutilisables (`ansible-galaxy init`), installer rôles et collections depuis Galaxy (`requirements.yml`), et utiliser les modules en FQCN.
2. Plus loin : Vault (chiffrer ces variables), administration système par modules, puis le **projet d'entreprise** RHCE.
:::

:::lang en
The RHCE track continues:

1. **Ansible — roles & collections**: structure your code into reusable roles (`ansible-galaxy init`), install roles and collections from Galaxy (`requirements.yml`), and use modules in FQCN.
2. Further along: Vault (encrypt those variables), system administration via modules, then the RHCE **enterprise project**.
:::

## cheatsheet

:::lang fr
Aide-mémoire variables, facts & Jinja2.
:::

:::lang en
Variables, facts & Jinja2 cheat sheet.
:::

```bash
# Facts / Facts
ansible HOST -m setup                          # tous les facts / all facts
ansible HOST -m setup -a "filter=ansible_mem*" # filtrer / filter
ansible HOST -m setup -a "filter=ansible_local" # custom facts

# Précédence / Precedence (extra-vars gagne toujours / always wins)
ansible-playbook site.yml -e "app_port=9090"
ansible-playbook site.yml -e "@vars.yml"       # extra-vars depuis un fichier / from a file
```

```yaml
# set_fact
- ansible.builtin.set_fact:
    buffer_mb: "{{ ansible_facts['memtotal_mb'] | int // 2 }}"

# Filtres Jinja2 / Jinja2 filters
"{{ x | default('repli') }}"       # valeur par défaut / default
"{{ x | mandatory }}"              # exige la variable / require
"{{ liste | join(', ') }}"         # concaténer / join
"{{ (n | int > 500) | ternary('gros','petit') }}"

# template
- ansible.builtin.template:
    src: fichier.conf.j2
    dest: /etc/app/fichier.conf
  notify: Recharger app
```

```jinja
{# Template : boucle + condition + variable magique #}
{% for h in groups['web'] %}
server {{ hostvars[h]['ansible_host'] }};
{% endfor %}
{% if activer_tls | default(false) %}listen 443 ssl;{% endif %}
```

## resources

:::lang fr
- [Utiliser les variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html) — définition, précédence, portée.
- [Facts et magic variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_vars_facts.html) — `ansible_facts`, `set_fact`, custom facts.
- [Templating (Jinja2)](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_templating.html) — filtres, tests, boucles.
- [Variables spéciales (magic vars)](https://docs.ansible.com/ansible/latest/reference_appendices/special_variables.html) — `hostvars`, `groups`, `inventory_hostname`.
- [Objectifs RHCE / EX294](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — la certification visée.
:::

:::lang en
- [Using variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html) — definition, precedence, scope.
- [Facts and magic variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_vars_facts.html) — `ansible_facts`, `set_fact`, custom facts.
- [Templating (Jinja2)](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_templating.html) — filters, tests, loops.
- [Special variables (magic vars)](https://docs.ansible.com/ansible/latest/reference_appendices/special_variables.html) — `hostvars`, `groups`, `inventory_hostname`.
- [RHCE / EX294 objectives](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — the target certification.
:::

## troubleshooting

:::lang fr
**`AnsibleUndefinedVariable: 'xxx' is undefined`.** Une variable référencée n'existe pas dans ce contexte. Protège avec `| default(...)`, ou vérifie l'orthographe et la portée (une var de tâche n'existe pas ailleurs).

**Mon `-e` ne change rien.** Vérifie la syntaxe : `-e "cle=valeur"` (ou `-e '{"cle": "valeur"}'` pour du structuré, ou `-e @fichier.yml`). Et rappelle-toi que `-e` gagne — si ça ne change rien, c'est que tu regardes la mauvaise variable.

**`ansible_local.<x>` est indéfini.** Le fact n'a pas été recollecté après écriture. Ajoute une tâche `ansible.builtin.setup: filter=ansible_local` avant de le lire. Vérifie aussi que le fichier finit par `.fact` et est un INI valide.

**Le template rend des lignes vides / mal indentées.** Comportement Jinja2 normal. Utilise `{%- -%}` pour rogner les espaces, ou active `trim_blocks`/`lstrip_blocks`.

**`int` échoue sur une valeur.** Certains facts sont des chaînes ; ajoute `| int` avant un calcul. `//` est la division **entière** (résultat entier), `/` donnerait un flottant.

**Un fact attendu est absent.** Tous les facts ne sont pas collectés selon la plateforme. Liste-les avec `ansible HOST -m setup` et cherche la bonne clé — le nom peut différer (`processor_vcpus` vs `processor_count`).
:::

:::lang en
**`AnsibleUndefinedVariable: 'xxx' is undefined`.** A referenced variable doesn't exist in this context. Protect with `| default(...)`, or check spelling and scope (a task var doesn't exist elsewhere).

**My `-e` changes nothing.** Check the syntax: `-e "key=value"` (or `-e '{"key": "value"}'` for structured, or `-e @file.yml`). And remember `-e` wins — if nothing changes, you're looking at the wrong variable.

**`ansible_local.<x>` is undefined.** The fact wasn't re-gathered after writing. Add a `ansible.builtin.setup: filter=ansible_local` task before reading it. Also check the file ends in `.fact` and is valid INI.

**The template renders blank / misindented lines.** Normal Jinja2 behavior. Use `{%- -%}` to trim whitespace, or enable `trim_blocks`/`lstrip_blocks`.

**`int` fails on a value.** Some facts are strings; add `| int` before a computation. `//` is **integer** division (integer result), `/` would give a float.

**An expected fact is missing.** Not all facts are gathered depending on platform. List them with `ansible HOST -m setup` and find the right key — the name may differ (`processor_vcpus` vs `processor_count`).
:::
