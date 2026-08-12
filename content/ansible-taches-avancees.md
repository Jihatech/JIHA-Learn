---
# — Identité (ne change JAMAIS une fois publié) —
id: ansible-taches-avancees
slug: ansible-taches-avancees
order: 22
status: published

# — Titres & accroches (bilingue) —
title_fr: "Ansible — tâches avancées & contrôle de flux"
title_en: "Ansible — advanced tasks & flow control"
tagline_fr: "boucles, when, handlers, tags, blocks, register."
tagline_en: "loops, when, handlers, tags, blocks, register."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 210
repo: "ansible/ansible"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [ansible-inventaire-configuration]
next: [ansible-variables-facts-templates]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [boucles-loop, conditions-when, handlers-notify, tags, blocks-rescue-always, register, failed-when-changed-when]
concepts_en: [loops, when-conditions, handlers-notify, tags, blocks-rescue-always, register, failed-when-changed-when]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Rends tes playbooks robustes au niveau RHCE/EX294 : boucles (loop, dictionnaires), conditions when sur facts et résultats, handlers (notify/listen/flush_handlers), tags pour exécuter un sous-ensemble, blocks block/rescue/always pour la gestion d'erreur, et register avec failed_when/changed_when pour maîtriser le statut d'une tâche. Testable en local."
og_description_en: "Make your playbooks RHCE/EX294-robust: loops (loop, dicts), when conditions on facts and results, handlers (notify/listen/flush_handlers), tags to run a subset, block/rescue/always for error handling, and register with failed_when/changed_when to control a task's status. Testable locally."
---

## intro

:::lang fr
Un playbook qui aligne des tâches les unes après les autres, ça marche… tant que tout se passe bien et que rien ne varie. La vraie vie n'est pas comme ça : tu installes **une liste** de paquets, tu n'appliques une tâche **que si** l'OS est le bon, tu ne redémarres un service **que si** sa config a changé, tu veux **rejouer une partie** du playbook sans tout relancer, et tu veux **rattraper une erreur** au lieu de tout planter.

C'est exactement ce que couvre le **contrôle de flux** d'Ansible — et c'est un pilier de l'examen RHCE/EX294. Dans ce guide tu vas maîtriser les six outils qui transforment un playbook naïf en playbook robuste : **`register`** (capturer un résultat), **`loop`** (boucler), **`when`** (conditionner), **les handlers** (réagir à un changement), **`failed_when`/`changed_when`** (dicter le statut d'une tâche), **les blocks** (gérer l'erreur), et **les tags** (exécuter à la carte).

**Pour qui c'est :** tu écris déjà des playbooks et un inventaire à groupes (guides précédents), et tu veux les rendre conditionnels, idempotents et rattrapables.

**Quand ce n'est PAS le bon choix :**

- Tu n'as jamais lancé de playbook → refais *Ansible fondamentaux* d'abord.
- Tu cherches à **factoriser** en composants réutilisables (rôles, collections) → c'est le guide *Rôles & collections*, deux crans plus loin ; ici on reste au niveau des tâches d'un playbook.
:::

:::lang en
A playbook that lines up tasks one after another works… as long as everything goes fine and nothing varies. Real life isn't like that: you install **a list** of packages, you apply a task **only if** the OS is the right one, you restart a service **only if** its config changed, you want to **replay part** of the playbook without rerunning it all, and you want to **recover from an error** instead of crashing everything.

That's exactly what Ansible's **flow control** covers — and it's a pillar of the RHCE/EX294 exam. In this guide you'll master the six tools that turn a naive playbook into a robust one: **`register`** (capture a result), **`loop`** (iterate), **`when`** (conditionalize), **handlers** (react to a change), **`failed_when`/`changed_when`** (dictate a task's status), **blocks** (handle errors), and **tags** (run à la carte).

**Who it's for:** you already write playbooks and a grouped inventory (previous guides), and you want to make them conditional, idempotent and recoverable.

**When it's NOT the right choice:**

- You've never run a playbook → do *Ansible fundamentals* first.
- You want to **factor** things into reusable components (roles, collections) → that's the *Roles & collections* guide, two steps further; here we stay at a playbook's task level.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- **Capturer** le résultat d'une tâche avec `register` et exploiter `.stdout`, `.rc`, `.changed`.
- **Boucler** avec `loop` sur une liste, sur une liste de dictionnaires, et exploiter `.results`.
- **Conditionner** avec `when` : sur un fact, sur un résultat enregistré, en combinant `and`/`or`.
- Déclencher un **handler** au bon moment (`notify`/`listen`), et forcer avec `flush_handlers`.
- Maîtriser le statut d'une tâche avec **`changed_when`** et **`failed_when`**.
- Gérer l'erreur avec **`block`/`rescue`/`always`**.
- Exécuter à la carte avec les **tags** (`--tags`, `--skip-tags`, `always`/`never`).
:::

:::lang en
By the end of this guide, you can:

- **Capture** a task's result with `register` and use `.stdout`, `.rc`, `.changed`.
- **Loop** with `loop` over a list, over a list of dictionaries, and use `.results`.
- **Conditionalize** with `when`: on a fact, on a registered result, combining `and`/`or`.
- Trigger a **handler** at the right moment (`notify`/`listen`), and force it with `flush_handlers`.
- Control a task's status with **`changed_when`** and **`failed_when`**.
- Handle errors with **`block`/`rescue`/`always`**.
- Run à la carte with **tags** (`--tags`, `--skip-tags`, `always`/`never`).
:::

## prerequisites

:::lang fr
- Les guides **Ansible fondamentaux** et **Ansible — inventaire & configuration** terminés.
- **Ansible ≥ 2.16** installé (`ansible --version`).
- Un dossier de travail. Tout ce guide est **testable en local** : les playbooks ciblent `localhost` en `connection: local`, parce que le contrôle de flux est une affaire de **logique**, pas de réseau. Chaque play fonctionne à l'identique sur ton parc (`hosts: web`) — on te le signale à chaque fois.
- (Facultatif) Le parc `web1`/`db1` du guide précédent, si tu veux rejouer contre de vraies VM.
:::

:::lang en
- The **Ansible fundamentals** and **Ansible — inventory & configuration** guides done.
- **Ansible ≥ 2.16** installed (`ansible --version`).
- A working folder. This whole guide is **testable locally**: the playbooks target `localhost` with `connection: local`, because flow control is about **logic**, not networking. Each play runs identically on your fleet (`hosts: web`) — we point that out each time.
- (Optional) The `web1`/`db1` fleet from the previous guide, if you want to replay against real VMs.
:::

## concepts

:::lang fr
**`register`.** Range le résultat d'une tâche dans une variable. Ce résultat est un dictionnaire riche : `.rc` (code retour d'une commande), `.stdout`/`.stdout_lines`, `.changed`, `.failed`, `.skipped`. C'est le socle de presque tout le reste.

**`loop`.** Répète une tâche sur chaque élément d'une liste. `item` est l'élément courant. La liste peut contenir des chaînes ou des **dictionnaires** (`item.nom`, `item.groupe`). Un `loop` combiné à `register` remplit `.results` (un résultat par itération).

**`when`.** Exécute la tâche **seulement si** la condition est vraie. La condition est une expression **Jinja2 sans les accolades** : `when: ansible_facts['os_family'] == "Debian"`. On combine avec `and`/`or`, ou une **liste** de conditions (toutes doivent être vraies).

**Handler.** Une tâche spéciale, définie sous `handlers:`, qui ne s'exécute **que si** une tâche l'a **notifiée** (`notify:`) **et** que cette tâche a produit un `changed`. Les handlers s'exécutent **à la fin du play**, une seule fois même s'ils sont notifiés plusieurs fois. Idéal pour « redémarrer nginx seulement si la config a changé ».

**`changed_when` / `failed_when`.** Redéfinissent *quand* une tâche est considérée comme `changed` ou `failed`. Indispensable avec `command`/`shell`, qui se déclarent **toujours** `changed` : `changed_when: false` pour une commande de lecture seule, ou `failed_when: "'ERROR' in resultat.stdout"` pour échouer sur le contenu, pas sur le code retour.

**`block` / `rescue` / `always`.** Le try/catch/finally d'Ansible. Les tâches du `block` s'exécutent ; si l'une échoue, on saute dans `rescue` (rattrapage) ; `always` s'exécute dans tous les cas (nettoyage).

**Tags.** Des étiquettes posées sur des tâches. `--tags X` n'exécute que les tâches taguées `X` ; `--skip-tags X` les saute. Deux tags spéciaux : `always` (toujours joué, sauf `--skip-tags always`) et `never` (jamais joué, sauf si demandé explicitement).
:::

:::lang en
**`register`.** Stores a task's result in a variable. That result is a rich dictionary: `.rc` (a command's return code), `.stdout`/`.stdout_lines`, `.changed`, `.failed`, `.skipped`. It's the foundation of almost everything else.

**`loop`.** Repeats a task over each item of a list. `item` is the current element. The list can hold strings or **dictionaries** (`item.name`, `item.group`). A `loop` combined with `register` fills `.results` (one result per iteration).

**`when`.** Runs the task **only if** the condition is true. The condition is a **Jinja2 expression without the braces**: `when: ansible_facts['os_family'] == "Debian"`. Combine with `and`/`or`, or a **list** of conditions (all must be true).

**Handler.** A special task, defined under `handlers:`, that runs **only if** a task **notified** it (`notify:`) **and** that task produced a `changed`. Handlers run **at the end of the play**, once, even if notified several times. Ideal for "restart nginx only if the config changed".

**`changed_when` / `failed_when`.** Redefine *when* a task is considered `changed` or `failed`. Essential with `command`/`shell`, which **always** report `changed`: `changed_when: false` for a read-only command, or `failed_when: "'ERROR' in result.stdout"` to fail on content, not on the return code.

**`block` / `rescue` / `always`.** Ansible's try/catch/finally. The `block` tasks run; if one fails, execution jumps to `rescue` (recovery); `always` runs in every case (cleanup).

**Tags.** Labels placed on tasks. `--tags X` runs only tasks tagged `X`; `--skip-tags X` skips them. Two special tags: `always` (always played, unless `--skip-tags always`) and `never` (never played, unless explicitly requested).
:::

:::figure ansible-flow-control
caption_fr: "Schéma 1. Le flux d'exécution d'une tâche : loop répète, when filtre, register capture, changed_when/failed_when redéfinissent le statut, notify arme un handler joué en fin de play, et block/rescue/always encadre l'erreur."
caption_en: "Figure 1. A task's execution flow: loop repeats, when filters, register captures, changed_when/failed_when redefine status, notify arms a handler played at end of play, and block/rescue/always frames errors."
:::

## walkthrough

:::lang fr
On avance ainsi : register → loops → when → handlers → changed_when/failed_when → block/rescue/always → tags.
:::

:::lang en
We'll go like this: register → loops → when → handlers → changed_when/failed_when → block/rescue/always → tags.
:::

### step-01

:::lang fr
**Objectif.** Capturer le résultat d'une tâche avec **`register`** et l'inspecter. C'est la brique de base de tout le contrôle de flux.

**🤔 Pourquoi commencer par là ?** Parce que `when`, `changed_when`, `failed_when` s'appuient presque toujours sur un résultat enregistré. Voir la **forme** de ce dictionnaire (`.rc`, `.stdout`, `.changed`) débloque tout le reste.

Crée `flow.yml` :
:::

:::lang en
**Goal.** Capture a task's result with **`register`** and inspect it. It's the building block of all flow control.

**🤔 Why start here?** Because `when`, `changed_when`, `failed_when` almost always rely on a registered result. Seeing the **shape** of that dictionary (`.rc`, `.stdout`, `.changed`) unlocks everything else.

Create `flow.yml`:
:::

```yaml
- name: Contrôle de flux — atelier
  hosts: localhost
  connection: local          # sur le parc : remplace par "hosts: web" et enlève cette ligne
  gather_facts: true
  tasks:
    - name: Compter les fichiers de /etc
      ansible.builtin.command: bash -c "ls /etc | wc -l"
      register: nb_fichiers

    - name: Montrer le résultat brut
      ansible.builtin.debug:
        var: nb_fichiers

    - name: Montrer seulement ce qui compte
      ansible.builtin.debug:
        msg: "rc={{ nb_fichiers.rc }} | sortie={{ nb_fichiers.stdout }} | changed={{ nb_fichiers.changed }}"
```

```bash
ansible-playbook flow.yml
```

:::lang fr
**✅ Vérification :** la tâche « résultat brut » affiche un dictionnaire avec `rc: 0`, `stdout: "<un nombre>"`, `stdout_lines`, et `changed: true`. La dernière tâche résume : `rc=0 | sortie=<nombre> | changed=True`. Retiens que `command` se déclare **toujours** `changed` — on corrigera ça à l'étape 5.
:::

:::lang en
**✅ Check:** the "raw result" task shows a dictionary with `rc: 0`, `stdout: "<a number>"`, `stdout_lines`, and `changed: true`. The last task summarizes: `rc=0 | sortie=<number> | changed=True`. Remember that `command` **always** reports `changed` — we'll fix that in step 5.
:::

### step-02

:::lang fr
**Objectif.** **Boucler** sur une liste, puis sur une liste de **dictionnaires**.

**🤔 Pourquoi les dictionnaires ?** Une liste de chaînes suffit pour « crée ces trois dossiers ». Mais dès que chaque élément a **plusieurs attributs** (un utilisateur = un nom + un groupe + un shell), il faut une liste de dictionnaires et tu accèdes à `item.nom`, `item.groupe`.

Ajoute à `flow.yml` (dans `tasks:`) :
:::

:::lang en
**Goal.** **Loop** over a list, then over a list of **dictionaries**.

**🤔 Why dictionaries?** A list of strings is enough for "create these three folders". But as soon as each element has **several attributes** (a user = a name + a group + a shell), you need a list of dictionaries and you access `item.name`, `item.group`.

Add to `flow.yml` (inside `tasks:`):
:::

```yaml
    - name: Créer trois dossiers (loop sur une liste)
      ansible.builtin.file:
        path: "/tmp/atelier/{{ item }}"
        state: directory
      loop:
        - logs
        - data
        - conf

    - name: Créer des fichiers décrits par des dictionnaires
      ansible.builtin.copy:
        dest: "/tmp/atelier/{{ item.nom }}"
        content: "propriétaire : {{ item.role }}\n"
      loop:
        - { nom: readme.txt, role: doc }
        - { nom: app.conf,   role: config }
      register: fichiers_crees

    - name: Combien d'éléments a produit la boucle ?
      ansible.builtin.debug:
        msg: "{{ fichiers_crees.results | length }} itérations, {{ fichiers_crees.changed }} au global"
```

```bash
ansible-playbook flow.yml
```

:::lang fr
**✅ Vérification :** au premier passage, chaque itération affiche `changed`. `/tmp/atelier/` contient les dossiers `logs data conf` et les fichiers `readme.txt app.conf` (vérifie avec `ls -R /tmp/atelier`). La dernière tâche indique `2 itérations`. **Relance** le playbook : les tâches `file`/`copy` passent `ok` (idempotence) — seule la tâche `command` de l'étape 1 reste `changed`.
:::

:::lang en
**✅ Check:** on the first pass, each iteration shows `changed`. `/tmp/atelier/` contains the `logs data conf` folders and the `readme.txt app.conf` files (check with `ls -R /tmp/atelier`). The last task reports `2 iterations`. **Rerun** the playbook: the `file`/`copy` tasks go `ok` (idempotence) — only the `command` task from step 1 stays `changed`.
:::

### step-03

:::lang fr
**Objectif.** Conditionner avec **`when`** : sur un **fact**, puis sur un **résultat enregistré**.

**🤔 Piège classique.** Dans un `when`, on écrit l'expression **sans les `{{ }}`** (c'est déjà un contexte Jinja2). `when: ma_var` et non `when: {{ ma_var }}`. Autre piège : une **liste** sous `when` signifie « toutes ces conditions ET ».

Ajoute :
:::

:::lang en
**Goal.** Conditionalize with **`when`**: on a **fact**, then on a **registered result**.

**🤔 Classic trap.** In a `when`, you write the expression **without `{{ }}`** (it's already a Jinja2 context). `when: my_var`, not `when: {{ my_var }}`. Another trap: a **list** under `when` means "all these conditions AND".

Add:
:::

```yaml
    - name: Tâche réservée aux systèmes Debian/Ubuntu
      ansible.builtin.debug:
        msg: "Ici c'est de la famille Debian : {{ ansible_facts['distribution'] }}"
      when: ansible_facts['os_family'] == "Debian"

    - name: Vérifier si l'utilisateur root a un shell bash
      ansible.builtin.command: grep -c "^root:.*/bash$" /etc/passwd
      register: root_bash
      changed_when: false
      failed_when: false        # grep renvoie 1 si absent ; on ne veut pas planter

    - name: Réagir selon le résultat (when sur un register)
      ansible.builtin.debug:
        msg: "root utilise bash"
      when: root_bash.stdout == "1"

    - name: Condition combinée (liste = ET)
      ansible.builtin.debug:
        msg: "Debian ET au moins 1 CPU"
      when:
        - ansible_facts['os_family'] == "Debian"
        - ansible_facts['processor_vcpus'] | int >= 1
```

```bash
ansible-playbook flow.yml
```

:::lang fr
**✅ Vérification :** sur une Ubuntu/Debian, la tâche « réservée » s'exécute et affiche la distribution ; sur un autre OS elle est `skipping`. La condition combinée (liste) passe si les **deux** sont vraies. Note le `failed_when: false` : sans lui, un `grep` qui ne trouve rien (`rc=1`) ferait échouer le play.
:::

:::lang en
**✅ Check:** on Ubuntu/Debian, the "reserved" task runs and prints the distribution; on another OS it's `skipping`. The combined condition (list) passes only if **both** are true. Note the `failed_when: false`: without it, a `grep` that finds nothing (`rc=1`) would fail the play.
:::

### step-04

:::lang fr
**Objectif.** Déclencher un **handler** — et voir qu'il ne se joue **que sur changement**.

**🤔 Le cœur du concept.** Un handler est notifié par `notify:`. Mais Ansible ne le déclenche que si la tâche qui notifie a réellement **changé** quelque chose. C'est ce qui rend « redémarrer le service seulement si la config a bougé » propre et idempotent. Le handler tourne **en fin de play**.

Crée un playbook dédié `handlers.yml` :
:::

:::lang en
**Goal.** Trigger a **handler** — and see it runs **only on change**.

**🤔 The heart of the concept.** A handler is notified by `notify:`. But Ansible triggers it only if the notifying task actually **changed** something. That's what makes "restart the service only if the config moved" clean and idempotent. The handler runs **at the end of the play**.

Create a dedicated `handlers.yml`:
:::

```yaml
- name: Démo handlers
  hosts: localhost
  connection: local
  gather_facts: false
  tasks:
    - name: S'assurer que le dossier existe
      ansible.builtin.file:
        path: /tmp/atelier
        state: directory

    - name: Écrire un fichier de config
      ansible.builtin.copy:
        dest: /tmp/atelier/app.ini
        content: "port = 8080\n"
      notify: Recharger l'app

  handlers:
    - name: Recharger l'app
      ansible.builtin.debug:
        msg: ">>> handler déclenché : je recharge l'app <<<"
```

```bash
ansible-playbook handlers.yml      # 1er passage
ansible-playbook handlers.yml      # 2e passage : même commande
```

:::lang fr
**✅ Vérification :** au **premier** passage, la tâche `copy` est `changed` et, en fin de play, tu vois `RUNNING HANDLER [Recharger l'app]` avec le message. Au **deuxième** passage, la config est identique → `copy` est `ok`, le handler **n'est pas** déclenché (aucune section HANDLER). C'est ça, l'idempotence des handlers : on ne recharge que quand ça change. (Astuce examen : `--force-handlers` rejoue les handlers même après une erreur ; `meta: flush_handlers` les force **immédiatement** au milieu du play.)
:::

:::lang en
**✅ Check:** on the **first** pass, the `copy` task is `changed` and, at the end of the play, you see `RUNNING HANDLER [Recharger l'app]` with the message. On the **second** pass, the config is identical → `copy` is `ok`, the handler is **not** triggered (no HANDLER section). That's handler idempotence: you reload only when something changes. (Exam tip: `--force-handlers` replays handlers even after an error; `meta: flush_handlers` forces them **immediately** mid-play.)
:::

### step-05

:::lang fr
**Objectif.** Maîtriser le **statut** d'une tâche avec `changed_when` et `failed_when` — dompter `command`/`shell`.

**🤔 Le problème.** `command` et `shell` ne savent pas s'ils ont « changé » quelque chose : ils se déclarent **toujours `changed`**, ce qui casse ton idempotence et pollue les rapports. Et ils échouent uniquement sur `rc != 0`, ce qui ne correspond pas toujours à un vrai échec métier.

Ajoute à `flow.yml` :
:::

:::lang en
**Goal.** Master a task's **status** with `changed_when` and `failed_when` — tame `command`/`shell`.

**🤔 The problem.** `command` and `shell` don't know whether they "changed" anything: they **always report `changed`**, which breaks your idempotence and pollutes reports. And they fail only on `rc != 0`, which doesn't always match a real business failure.

Add to `flow.yml`:
:::

```yaml
    - name: Une vérification en lecture seule ne "change" rien
      ansible.builtin.command: date +%Y
      register: annee
      changed_when: false          # sans ça : "changed" à chaque run

    - name: Échouer sur le CONTENU, pas sur le code retour
      ansible.builtin.command: bash -c "echo 'traitement OK'"
      register: sortie_metier
      changed_when: false
      failed_when: "'ERROR' in sortie_metier.stdout"    # échoue seulement si 'ERROR' apparaît

    - name: Utiliser la valeur lue
      ansible.builtin.debug:
        msg: "Année = {{ annee.stdout }}"
```

```bash
ansible-playbook flow.yml
```

:::lang fr
**✅ Vérification :** les deux tâches sont **`ok`** (vert), plus jamais `changed`, même en relançant — parce que `changed_when: false`. La tâche `failed_when` réussit car sa sortie ne contient pas `ERROR` ; si tu remplaces l'écho par `echo 'ERROR fatal'`, la même tâche passe en `failed`. Tu contrôles maintenant statut et échec au doigt et à l'œil.
:::

:::lang en
**✅ Check:** both tasks are **`ok`** (green), never `changed` again, even on rerun — because `changed_when: false`. The `failed_when` task succeeds because its output has no `ERROR`; if you replace the echo with `echo 'ERROR fatal'`, that same task turns `failed`. You now control status and failure precisely.
:::

### step-06

:::lang fr
**Objectif.** Rattraper une erreur avec **`block` / `rescue` / `always`** — le try/catch/finally d'Ansible.

**🤔 Pourquoi c'est un objectif RHCE.** Sans block, la première tâche qui échoue arrête tout le play pour cet hôte. Avec un `rescue`, tu **rattrapes** proprement (log, notification, valeur par défaut) ; avec `always`, tu **nettoies** quoi qu'il arrive.

Crée `blocks.yml` :
:::

:::lang en
**Goal.** Recover from an error with **`block` / `rescue` / `always`** — Ansible's try/catch/finally.

**🤔 Why it's an RHCE objective.** Without a block, the first failing task stops the whole play for that host. With a `rescue`, you **recover** cleanly (log, notification, default value); with `always`, you **clean up** no matter what.

Create `blocks.yml`:
:::

```yaml
- name: Démo block/rescue/always
  hosts: localhost
  connection: local
  tasks:
    - name: Traitement protégé
      block:
        - name: Étape qui va échouer volontairement
          ansible.builtin.command: bash -c "exit 3"
        - name: Étape jamais atteinte
          ansible.builtin.debug:
            msg: "tu ne me verras pas"
      rescue:
        - name: Rattrapage
          ansible.builtin.debug:
            msg: ">>> une erreur est survenue, je rattrape proprement <<<"
      always:
        - name: Nettoyage systématique
          ansible.builtin.debug:
            msg: ">>> always : je nettoie, erreur ou pas <<<"
```

```bash
ansible-playbook blocks.yml
```

:::lang fr
**✅ Vérification :** l'« Étape qui va échouer » passe en `fatal` (rc=3), l'« Étape jamais atteinte » est **sautée**, puis tu vois le message de `rescue` **et** celui de `always`. Le récap final affiche `failed=0` : le `rescue` a **absorbé** l'échec, le play se termine en succès. Enlève le `rescue` et relance : cette fois le play s'arrête en `failed=1`.
:::

:::lang en
**✅ Check:** the "step that will fail" turns `fatal` (rc=3), the "never-reached step" is **skipped**, then you see the `rescue` message **and** the `always` one. The final recap shows `failed=0`: the `rescue` **absorbed** the failure, the play ends in success. Remove the `rescue` and rerun: this time the play stops with `failed=1`.
:::

### step-07

:::lang fr
**Objectif.** Exécuter **à la carte** avec les **tags** — rejouer un sous-ensemble sans tout relancer.

**🤔 Le gain concret.** Un gros playbook (paquets + config + service) peut prendre des minutes. Avec des tags, tu rejoues juste `--tags config` après avoir modifié un template. `always` marque une tâche toujours jouée (ex. rafraîchir les facts) ; `never` une tâche qu'on ne joue **que** si on la demande (ex. un débogage lourd).

Crée `tags.yml` :
:::

:::lang en
**Goal.** Run **à la carte** with **tags** — replay a subset without rerunning everything.

**🤔 The concrete gain.** A big playbook (packages + config + service) can take minutes. With tags, you replay just `--tags config` after editing a template. `always` marks a task always played (e.g. refresh facts); `never` a task played **only** when explicitly requested (e.g. a heavy debug).

Create `tags.yml`:
:::

```yaml
- name: Démo tags
  hosts: localhost
  connection: local
  tasks:
    - name: Installer (simulé)
      ansible.builtin.debug: { msg: "j'installe les paquets" }
      tags: [paquets]

    - name: Configurer (simulé)
      ansible.builtin.debug: { msg: "j'écris la config" }
      tags: [config]

    - name: Toujours joué
      ansible.builtin.debug: { msg: "moi je passe toujours" }
      tags: [always]

    - name: Débogage lourd (opt-in)
      ansible.builtin.debug: { msg: "diagnostic complet" }
      tags: [never, debug]
```

```bash
ansible-playbook tags.yml --list-tags        # lister les tags sans exécuter / list tags
ansible-playbook tags.yml --tags config      # que la config (+ always)
ansible-playbook tags.yml --skip-tags paquets # tout sauf paquets
ansible-playbook tags.yml --tags debug       # débloque la tâche "never"
```

:::lang fr
**✅ Vérification :** `--list-tags` liste **tous** les tags définis — `always, config, debug, never, paquets` (y compris `never` et `always`, qui apparaissent dans l'inventaire des tags même s'ils ont un comportement spécial **à l'exécution** ; `--list-tags` ne filtre pas selon la jouabilité). `--tags config` ne joue que « Configurer » **et** « Toujours joué » (le tag `always` force sa présence). `--skip-tags paquets` joue tout sauf « Installer » (la tâche `never` reste muette de toute façon). La tâche `never` ne se joue **que** avec `--tags debug`, qui la débloque. Tu exécutes désormais tes playbooks à la carte.
:::

:::lang en
**✅ Check:** `--list-tags` lists **all** defined tags — `always, config, debug, never, paquets` (including `never` and `always`, which appear in the tag inventory even though they behave specially **at run time**; `--list-tags` doesn't filter by playability). `--tags config` plays only "Configurer" **and** "Toujours joué" (the `always` tag forces its presence). `--skip-tags paquets` plays everything except "Installer" (the `never` task stays silent anyway). The `never` task plays **only** with `--tags debug`, which unlocks it. You now run your playbooks à la carte.
:::

## pitfalls

:::lang fr
**1. Mettre `{{ }}` dans un `when`.** `when: {{ ma_var }}` déclenche un warning et des bugs subtils. Dans `when`, on écrit l'expression **nue** : `when: ma_var`. Les accolades ne servent que pour *interpoler* dans une chaîne.

**2. Oublier que `command`/`shell` sont toujours `changed`.** Sans `changed_when: false`, une simple vérification pollue ton rapport et casse l'idempotence. Réflexe : toute commande de **lecture** porte `changed_when: false`.

**3. Croire qu'un handler se joue immédiatement.** Non : il attend la **fin du play**. Si tu as besoin qu'il tourne *avant* la suite (ex. recharger avant de tester), force-le avec `meta: flush_handlers`.

**4. Un handler notifié mais jamais joué.** Si la tâche qui `notify` ne produit pas de `changed` (idempotence), le handler ne se déclenche **pas** — c'est voulu. Pour tester, force un changement, ou vérifie que le nom notifié correspond **exactement** au `name` du handler.

**5. `loop` + `register` : oublier `.results`.** Avec une boucle, le registre n'a pas `.stdout` directement : il a `.results`, **une liste** d'un résultat par itération. Tu itères dessus (`{{ mon_reg.results | map(attribute='stdout') | list }}`).

**6. `failed_when`/`changed_when` qui se contredisent.** `failed_when` est évalué **après** la tâche ; une tâche marquée `failed` par `failed_when` stoppe le play comme un vrai échec (sauf `ignore_errors` ou un block/rescue). Ne l'utilise pas pour « ignorer », utilise `failed_when: false`.

**7. Un tag `always` qu'on n'arrive plus à sauter.** Une tâche `always` se joue même avec `--tags autre`. Pour vraiment la sauter : `--skip-tags always`. Bon à savoir le jour J.
:::

:::lang en
**1. Putting `{{ }}` in a `when`.** `when: {{ my_var }}` triggers a warning and subtle bugs. In `when`, write the **bare** expression: `when: my_var`. Braces are only for *interpolating* inside a string.

**2. Forgetting `command`/`shell` are always `changed`.** Without `changed_when: false`, a simple check pollutes your report and breaks idempotence. Reflex: every **read** command carries `changed_when: false`.

**3. Thinking a handler runs immediately.** It doesn't: it waits for the **end of the play**. If you need it to run *before* the rest (e.g. reload before testing), force it with `meta: flush_handlers`.

**4. A handler notified but never played.** If the notifying task produces no `changed` (idempotence), the handler does **not** fire — that's intended. To test, force a change, or check that the notified name matches the handler's `name` **exactly**.

**5. `loop` + `register`: forgetting `.results`.** With a loop, the register has no direct `.stdout`: it has `.results`, **a list** of one result per iteration. You iterate over it (`{{ my_reg.results | map(attribute='stdout') | list }}`).

**6. `failed_when`/`changed_when` that contradict.** `failed_when` is evaluated **after** the task; a task marked `failed` by `failed_when` stops the play like a real failure (unless `ignore_errors` or a block/rescue). Don't use it to "ignore" — use `failed_when: false`.

**7. An `always` tag you can no longer skip.** An `always` task runs even with `--tags other`. To truly skip it: `--skip-tags always`. Good to know on exam day.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu enregistres un résultat et tu exploites `.rc`, `.stdout`, `.changed`.
- [ ] Tu boucles sur une liste **et** sur une liste de dictionnaires (`item.nom`).
- [ ] Tu conditionnes avec `when` sur un fact et sur un registre, sans `{{ }}`.
- [ ] Ton handler se joue au 1er passage et **pas** au 2e (idempotence).
- [ ] `changed_when: false` rend une vérification stable ; `failed_when` échoue sur le contenu.
- [ ] Un `rescue` absorbe une erreur et le play finit en `failed=0`.
- [ ] `--tags` / `--skip-tags` rejouent le bon sous-ensemble ; tu comprends `always`/`never`.

Sept cases = tes playbooks sont robustes. La suite : variables, facts et templates Jinja2.
:::

:::lang en
You know it works when…

- [ ] You register a result and use `.rc`, `.stdout`, `.changed`.
- [ ] You loop over a list **and** over a list of dictionaries (`item.name`).
- [ ] You conditionalize with `when` on a fact and on a register, without `{{ }}`.
- [ ] Your handler runs on the 1st pass and **not** the 2nd (idempotence).
- [ ] `changed_when: false` makes a check stable; `failed_when` fails on content.
- [ ] A `rescue` absorbs an error and the play ends `failed=0`.
- [ ] `--tags` / `--skip-tags` replay the right subset; you understand `always`/`never`.

Seven boxes = your playbooks are robust. Next up: variables, facts and Jinja2 templates.
:::

## next

:::lang fr
La suite du track RHCE :

1. **Ansible — variables, facts & templates Jinja2** : la précédence complète des variables, les facts (dont les custom facts), `set_fact`, et la génération de config avec Jinja2 (filtres, boucles, conditions).
2. Plus loin : rôles & collections, Vault, puis le **projet d'entreprise** RHCE.
:::

:::lang en
The RHCE track continues:

1. **Ansible — variables, facts & Jinja2 templates**: the full variable precedence, facts (including custom facts), `set_fact`, and config generation with Jinja2 (filters, loops, conditions).
2. Further along: roles & collections, Vault, then the RHCE **enterprise project**.
:::

## cheatsheet

:::lang fr
Aide-mémoire contrôle de flux.
:::

:::lang en
Flow control cheat sheet.
:::

```yaml
# register + exploitation / register + usage
- ansible.builtin.command: id -un
  register: res
- ansible.builtin.debug: { msg: "{{ res.stdout }} (rc={{ res.rc }})" }

# loop : liste, dictionnaires / loop: list, dicts
- ansible.builtin.file: { path: "/tmp/{{ item }}", state: directory }
  loop: [a, b, c]
- ansible.builtin.user: { name: "{{ item.nom }}", groups: "{{ item.grp }}" }
  loop:
    - { nom: alice, grp: sudo }
    - { nom: bob,   grp: users }

# when : fact, register, liste = ET / when: fact, register, list = AND
- ansible.builtin.debug: { msg: Debian }
  when: ansible_facts['os_family'] == "Debian"
- ansible.builtin.debug: { msg: ok }
  when:
    - res.rc == 0
    - res.stdout | length > 0

# changed_when / failed_when
- ansible.builtin.command: monscript --check
  register: r
  changed_when: false
  failed_when: "'ERROR' in r.stdout"

# handler
  notify: Redémarrer nginx        # sur la tâche / on the task
# ...
handlers:
  - name: Redémarrer nginx
    ansible.builtin.service: { name: nginx, state: restarted }

# block / rescue / always
- block:      [ ... ]
  rescue:     [ ... ]
  always:     [ ... ]
```

```bash
# Tags
ansible-playbook site.yml --list-tags          # lister / list
ansible-playbook site.yml --tags config        # un sous-ensemble / a subset
ansible-playbook site.yml --skip-tags paquets  # tout sauf / all but
ansible-playbook site.yml --tags never_task    # débloquer un tag "never"
ansible-playbook site.yml --step               # confirmer chaque tâche / confirm each task
```

## resources

:::lang fr
- [Boucles (loops)](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html) — `loop`, `.results`, `loop_control`.
- [Conditions (`when`)](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_conditionals.html) — sur facts, registres, combinaisons.
- [Handlers](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_handlers.html) — `notify`, `listen`, `flush_handlers`.
- [Blocks & gestion d'erreur](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_blocks.html) — `rescue`, `always`, `ignore_errors`.
- [Tags](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_tags.html) — `always`, `never`, `--tags`/`--skip-tags`.
:::

:::lang en
- [Loops](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html) — `loop`, `.results`, `loop_control`.
- [Conditionals (`when`)](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_conditionals.html) — on facts, registers, combinations.
- [Handlers](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_handlers.html) — `notify`, `listen`, `flush_handlers`.
- [Blocks & error handling](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_blocks.html) — `rescue`, `always`, `ignore_errors`.
- [Tags](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_tags.html) — `always`, `never`, `--tags`/`--skip-tags`.
:::

## troubleshooting

:::lang fr
**`The conditional check '...' failed`.** Ton `when` référence une variable qui n'existe pas (ou pas encore). Vérifie qu'elle est bien définie/enregistrée **avant**, et n'y mets pas de `{{ }}`.

**Un handler ne se déclenche jamais.** Soit la tâche qui `notify` est `ok` (pas de changement → normal), soit le **nom** notifié ne correspond pas **exactement** au `name` du handler (sensible à la casse et aux accents).

**`'dict object' has no attribute 'stdout'` sur une boucle.** Avec `loop` + `register`, le résultat est dans `.results` (une liste), pas directement `.stdout`. Boucle sur `.results`.

**Ma tâche `command` est toujours `changed`.** C'est le comportement par défaut. Ajoute `changed_when: false` (lecture) ou une vraie condition (`changed_when: "'modifié' in r.stdout"`).

**Le play s'arrête alors que je voulais juste ignorer un échec.** N'utilise pas `failed_when` pour ignorer : mets `failed_when: false`, ou `ignore_errors: true`, ou encadre d'un `block`/`rescue`.

**`--tags` ne joue rien.** Le tag n'existe sur aucune tâche, ou tu as mal orthographié. Liste d'abord avec `--list-tags`.
:::

:::lang en
**`The conditional check '...' failed`.** Your `when` references a variable that doesn't exist (or not yet). Check it's defined/registered **before**, and don't put `{{ }}` in it.

**A handler never fires.** Either the notifying task is `ok` (no change → normal), or the notified **name** doesn't match the handler's `name` **exactly** (case- and accent-sensitive).

**`'dict object' has no attribute 'stdout'` on a loop.** With `loop` + `register`, the result is in `.results` (a list), not directly `.stdout`. Loop over `.results`.

**My `command` task is always `changed`.** That's the default behavior. Add `changed_when: false` (read) or a real condition (`changed_when: "'modified' in r.stdout"`).

**The play stops when I just wanted to ignore a failure.** Don't use `failed_when` to ignore: set `failed_when: false`, or `ignore_errors: true`, or wrap in a `block`/`rescue`.

**`--tags` plays nothing.** The tag exists on no task, or you misspelled it. List first with `--list-tags`.
:::
