---
# — Identité (ne change JAMAIS une fois publié) —
id: ansible-vault
slug: ansible-vault
order: 25
status: published

# — Titres & accroches (bilingue) —
title_fr: "Ansible — Vault : chiffrer les secrets"
title_en: "Ansible — Vault: encrypting secrets"
tagline_fr: "encrypt, view, rekey, encrypt_string, vault-id, password file."
tagline_en: "encrypt, view, rekey, encrypt_string, vault-id, password file."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 180
repo: "ansible/ansible"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [ansible-roles-collections]
next: [ansible-administration-systeme]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [ansible-vault, fichier-chiffre, password-file, encrypt-string, rekey-decrypt, vault-id, secrets-en-playbook]
concepts_en: [ansible-vault, encrypted-file, password-file, encrypt-string, rekey-decrypt, vault-id, secrets-in-playbook]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Chiffre tes secrets Ansible au niveau RHCE/EX294 : ansible-vault encrypt/view/edit/rekey/decrypt, fichier de mot de passe (--vault-password-file), variables chiffrées inline avec encrypt_string, utilisation de vars chiffrées dans un playbook, et vault-id pour plusieurs coffres (dev/prod). 100% local, non-interactif, testable sans réseau."
og_description_en: "Encrypt your Ansible secrets at RHCE/EX294 level: ansible-vault encrypt/view/edit/rekey/decrypt, password file (--vault-password-file), inline encrypted variables with encrypt_string, using vaulted vars in a playbook, and vault-id for multiple vaults (dev/prod). 100% local, non-interactive, testable offline."
---

## intro

:::lang fr
Un secret dans un playbook — mot de passe de base, clé d'API, jeton — n'a rien à faire **en clair**, surtout dans un dépôt Git. Le jour où le repo fuite (ou devient public par erreur), tous tes secrets partent avec. La réponse d'Ansible, c'est **Vault** : chiffrer les données sensibles **au repos**, dans le fichier lui-même, avec de l'AES256. Le fichier reste versionnable dans Git — illisible sans le mot de passe — et Ansible le déchiffre **à la volée** au moment de jouer le playbook.

C'est un objectif explicite du RHCE/EX294 (« chiffrer du contenu avec Ansible Vault ») et une compétence de terrain non négociable. Ce guide te fait manipuler **toute** la chaîne : chiffrer un fichier, le lire, l'éditer, l'utiliser dans un playbook, chiffrer **une seule variable** inline (`encrypt_string`), automatiser avec un **fichier de mot de passe**, changer la clé (`rekey`), et gérer **plusieurs coffres** (dev/prod) avec les vault-id.

Tout est **100% local et non-interactif** : on travaille avec un fichier de mot de passe dès le départ (c'est aussi la bonne pratique d'automatisation), donc chaque commande est reproductible sans rien taper au clavier. Aucun réseau, aucune VM.

**Pour qui c'est :** tu structures déjà ton code en rôles (guide précédent) et tu veux y ranger des secrets sans les exposer.

**Quand ce n'est PAS le bon choix :**

- Tu débutes sur les playbooks → reviens au début du track.
- Tu cherches un **gestionnaire de secrets centralisé** (HashiCorp Vault, AWS Secrets Manager) : c'est un autre outil ; Ansible Vault chiffre des fichiers **au repos**, il ne remplace pas un coffre d'entreprise dynamique.
:::

:::lang en
A secret in a playbook — a database password, an API key, a token — has no business being **in clear text**, especially in a Git repo. The day the repo leaks (or goes public by mistake), all your secrets go with it. Ansible's answer is **Vault**: encrypt sensitive data **at rest**, inside the file itself, with AES256. The file stays versionable in Git — unreadable without the password — and Ansible decrypts it **on the fly** when playing the playbook.

It's an explicit RHCE/EX294 objective ("encrypt content with Ansible Vault") and a non-negotiable field skill. This guide has you handle the **whole** chain: encrypt a file, read it, edit it, use it in a playbook, encrypt **a single variable** inline (`encrypt_string`), automate with a **password file**, change the key (`rekey`), and manage **multiple vaults** (dev/prod) with vault-ids.

Everything is **100% local and non-interactive**: we work with a password file from the start (also the automation best practice), so every command is reproducible without typing anything. No network, no VM.

**Who it's for:** you already structure your code into roles (previous guide) and you want to store secrets in it without exposing them.

**When it's NOT the right choice:**

- You're new to playbooks → go back to the start of the track.
- You're looking for a **centralized secrets manager** (HashiCorp Vault, AWS Secrets Manager): that's another tool; Ansible Vault encrypts files **at rest**, it doesn't replace a dynamic enterprise vault.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sais :

- Chiffrer/déchiffrer un fichier avec **`ansible-vault encrypt`/`decrypt`** et le lire avec **`view`**.
- Créer et éditer un fichier chiffré (**`create`**, **`edit`**).
- Automatiser avec un **fichier de mot de passe** (`--vault-password-file`, `vault_password_file` dans `ansible.cfg`).
- Utiliser des **variables chiffrées** dans un playbook (`vars_files`).
- Chiffrer **une seule variable inline** avec **`encrypt_string`**.
- Changer la clé d'un coffre avec **`rekey`**.
- Gérer **plusieurs coffres** avec les **vault-id** (`dev@…`, `prod@…`).
:::

:::lang en
By the end of this guide, you can:

- Encrypt/decrypt a file with **`ansible-vault encrypt`/`decrypt`** and read it with **`view`**.
- Create and edit an encrypted file (**`create`**, **`edit`**).
- Automate with a **password file** (`--vault-password-file`, `vault_password_file` in `ansible.cfg`).
- Use **encrypted variables** in a playbook (`vars_files`).
- Encrypt **a single inline variable** with **`encrypt_string`**.
- Change a vault's key with **`rekey`**.
- Manage **multiple vaults** with **vault-ids** (`dev@…`, `prod@…`).
:::

## prerequisites

:::lang fr
- Les guides Ansible précédents du track (jusqu'aux *rôles & collections*).
- **Ansible ≥ 2.16** (`ansible --version`) — `ansible-vault` est fourni avec.
- Un dossier de travail. **Tout est local, non-interactif et sans réseau** : on utilise un fichier de mot de passe pour éviter toute saisie.
- ⚠️ Le fichier de mot de passe (`.vault_pass`) ne doit **jamais** être commité. On ajoute une règle `.gitignore` à l'étape 3.
:::

:::lang en
- The previous Ansible track guides (through *roles & collections*).
- **Ansible ≥ 2.16** (`ansible --version`) — `ansible-vault` is bundled.
- A working folder. **Everything is local, non-interactive and offline**: we use a password file to avoid any typing.
- ⚠️ The password file (`.vault_pass`) must **never** be committed. We add a `.gitignore` rule in step 3.
:::

## concepts

:::lang fr
**Ansible Vault.** Un mécanisme de chiffrement **symétrique** (AES256) intégré à Ansible. Il chiffre des fichiers (ou des chaînes) avec un **mot de passe**. Le même mot de passe sert à chiffrer et déchiffrer. Ansible reconnaît un fichier chiffré à son en-tête `$ANSIBLE_VAULT;1.1;AES256`.

**Fichier chiffré vs `encrypt_string`.** Deux granularités : chiffrer **un fichier entier** (`ansible-vault encrypt secrets.yml` — pratique pour un fichier 100% secrets), ou chiffrer **une seule valeur** et la coller **inline** dans un fichier en clair (`encrypt_string` — pratique quand un fichier mélange variables publiques et un ou deux secrets, en gardant les noms lisibles).

**Fichier de mot de passe.** Un fichier texte contenant le mot de passe du coffre. `--vault-password-file .vault_pass` évite `--ask-vault-pass` (la saisie interactive). C'est **indispensable** pour automatiser (CI, cron) — et ça se configure une fois pour toutes dans `ansible.cfg` (`vault_password_file`). Ce fichier ne doit **jamais** entrer dans Git.

**`view` / `edit` / `rekey` / `decrypt`.** `view` affiche le contenu déchiffré sans modifier le fichier. `edit` ouvre le fichier déchiffré dans ton éditeur, le rechiffre à la sauvegarde. `rekey` change le **mot de passe** d'un coffre existant. `decrypt` retire définitivement le chiffrement (rare, à éviter en prod).

**Utilisation dans un playbook.** Un fichier chiffré se référence comme n'importe quel `vars_files:` — Ansible le déchiffre à l'exécution si tu fournis le mot de passe (`--vault-password-file` ou `--ask-vault-pass`). Les variables sont alors utilisables normalement.

**vault-id.** Une **étiquette** de coffre (`dev`, `prod`) associée à un mot de passe. Elle permet d'avoir **plusieurs coffres** dans un même projet (un secret dev chiffré avec la clé dev, un secret prod avec la clé prod) et de tous les fournir à Ansible en même temps (`--vault-id dev@.vault_dev --vault-id prod@.vault_prod`).
:::

:::lang en
**Ansible Vault.** A **symmetric** encryption mechanism (AES256) built into Ansible. It encrypts files (or strings) with a **password**. The same password encrypts and decrypts. Ansible recognizes an encrypted file by its `$ANSIBLE_VAULT;1.1;AES256` header.

**Encrypted file vs `encrypt_string`.** Two granularities: encrypt **a whole file** (`ansible-vault encrypt secrets.yml` — handy for a 100%-secrets file), or encrypt **a single value** and paste it **inline** into a clear file (`encrypt_string` — handy when a file mixes public variables and one or two secrets, keeping names readable).

**Password file.** A text file holding the vault's password. `--vault-password-file .vault_pass` avoids `--ask-vault-pass` (interactive typing). It's **essential** for automation (CI, cron) — and it's configured once and for all in `ansible.cfg` (`vault_password_file`). This file must **never** enter Git.

**`view` / `edit` / `rekey` / `decrypt`.** `view` shows the decrypted content without modifying the file. `edit` opens the decrypted file in your editor, re-encrypts on save. `rekey` changes an existing vault's **password**. `decrypt` permanently removes encryption (rare, avoid in prod).

**Use in a playbook.** An encrypted file is referenced like any `vars_files:` — Ansible decrypts it at run time if you supply the password (`--vault-password-file` or `--ask-vault-pass`). The variables are then usable normally.

**vault-id.** A vault **label** (`dev`, `prod`) tied to a password. It lets you have **multiple vaults** in one project (a dev secret encrypted with the dev key, a prod secret with the prod key) and supply them all to Ansible at once (`--vault-id dev@.vault_dev --vault-id prod@.vault_prod`).
:::

:::figure ansible-vault-flow
caption_fr: "Schéma 1. Le cycle Vault : un fichier de secrets chiffré au repos (illisible dans Git), déchiffré à la volée par Ansible au moment de jouer le playbook, à l'aide du mot de passe fourni par --vault-password-file."
caption_en: "Figure 1. The Vault cycle: a secrets file encrypted at rest (unreadable in Git), decrypted on the fly by Ansible when playing the playbook, using the password supplied by --vault-password-file."
:::

## walkthrough

:::lang fr
On avance ainsi : chiffrer & lire un fichier → créer/éditer → fichier de mot de passe & playbook → encrypt_string inline → rekey → decrypt → vault-id multi-coffres.
:::

:::lang en
We'll go like this: encrypt & read a file → create/edit → password file & playbook → inline encrypt_string → rekey → decrypt → vault-id multi-vaults.
:::

### step-01

:::lang fr
**Objectif.** Chiffrer un fichier de secrets existant, constater qu'il est illisible, puis le **lire** avec `view`.

**🤔 Le point de départ.** On part d'un fichier YAML de secrets en clair et on le chiffre **sur place**. Après ça, `cat` ne montre plus qu'un blob ; seul `ansible-vault view` (avec le bon mot de passe) le rend lisible. On utilise un **fichier de mot de passe** dès maintenant pour rester non-interactif.

Prépare le projet, le mot de passe et le fichier de secrets :
:::

:::lang en
**Goal.** Encrypt an existing secrets file, see it's unreadable, then **read** it with `view`.

**🤔 The starting point.** We start from a clear-text YAML secrets file and encrypt it **in place**. After that, `cat` shows only a blob; only `ansible-vault view` (with the right password) makes it readable. We use a **password file** from now on to stay non-interactive.

Prepare the project, the password and the secrets file:
:::

```bash
mkdir -p ~/ansible-vault-lab && cd ~/ansible-vault-lab

# Le mot de passe du coffre (une seule fois) / the vault password (once)
echo "MonMotDePasseDeCoffre" > .vault_pass
chmod 600 .vault_pass

# Un fichier de secrets EN CLAIR / a CLEAR secrets file
cat > secrets.yml <<'YML'
db_password: "S3cr3t-DB-2026"
api_token: "tok_live_abcdef123456"
YML

# Chiffrer sur place / encrypt in place
ansible-vault encrypt secrets.yml --vault-password-file .vault_pass

echo "--- cat (illisible) ---"; head -c 120 secrets.yml; echo
echo "--- view (lisible) ---"; ansible-vault view secrets.yml --vault-password-file .vault_pass
```

:::lang fr
**✅ Vérification :** après `encrypt`, la commande affiche `Encryption successful`. `head -c 120 secrets.yml` montre un en-tête `$ANSIBLE_VAULT;1.1;AES256` suivi d'un blob hexadécimal — **plus aucun secret en clair**. `ansible-vault view ... --vault-password-file .vault_pass` réaffiche `db_password: "S3cr3t-DB-2026"` et `api_token: ...`. Le fichier sur disque **reste chiffré** : `view` ne le modifie pas.
:::

:::lang en
**✅ Check:** after `encrypt`, the command prints `Encryption successful`. `head -c 120 secrets.yml` shows a `$ANSIBLE_VAULT;1.1;AES256` header followed by a hex blob — **no more clear-text secret**. `ansible-vault view ... --vault-password-file .vault_pass` re-displays `db_password: "S3cr3t-DB-2026"` and `api_token: ...`. The on-disk file **stays encrypted**: `view` doesn't modify it.
:::

### step-02

:::lang fr
**Objectif.** Créer un fichier chiffré **directement** (`create`) et le modifier (`edit`).

**🤔 create vs encrypt.** `encrypt` chiffre un fichier **existant** ; `create` ouvre un **nouveau** fichier directement dans l'éditeur et le chiffre à la sauvegarde — le contenu n'existe **jamais** en clair sur le disque. `edit` fait pareil pour modifier un fichier déjà chiffré. Ces commandes ouvrent `$EDITOR` ; pour rester non-interactif ici, on force l'éditeur.

**Note pédagogique.** En usage réel, tu lances simplement `ansible-vault create fichier.yml --vault-password-file .vault_pass` et ton éditeur (nano, vim) s'ouvre. Pour un test **reproductible sans clavier**, on remplace l'éditeur par une commande qui écrit le contenu :
:::

:::lang en
**Goal.** Create an encrypted file **directly** (`create`) and modify it (`edit`).

**🤔 create vs encrypt.** `encrypt` encrypts an **existing** file; `create` opens a **new** file directly in the editor and encrypts it on save — the content **never** exists in clear on disk. `edit` does the same to modify an already-encrypted file. These commands open `$EDITOR`; to stay non-interactive here, we force the editor.

**Teaching note.** In real use, you simply run `ansible-vault create file.yml --vault-password-file .vault_pass` and your editor (nano, vim) opens. For a **keyboard-free reproducible** test, we replace the editor with a command that writes the content:
:::

```bash
# En vrai : ansible-vault create db.yml --vault-password-file .vault_pass  (ouvre l'éditeur)
# Ici, éditeur scripté pour un test non-interactif / scripted editor for a non-interactive test
printf '%s\n' 'cat > "$1" <<<"admin_user: pgadmin"' > /tmp/faux_editeur.sh
chmod +x /tmp/faux_editeur.sh
EDITOR='/tmp/faux_editeur.sh' ansible-vault create db.yml --vault-password-file .vault_pass

ansible-vault view db.yml --vault-password-file .vault_pass   # -> admin_user: pgadmin
head -c 40 db.yml; echo                                        # -> $ANSIBLE_VAULT;1.1;AES256...
```

:::lang fr
**✅ Vérification :** `db.yml` est chiffré dès sa création (`head` montre l'en-tête Vault). `ansible-vault view db.yml ...` affiche `admin_user: pgadmin` — le contenu que le « faux éditeur » a écrit, qui n'a jamais existé en clair sur le disque. En usage réel, tu n'as pas besoin de cette bidouille : ton `$EDITOR` s'ouvre normalement. `edit` fonctionne pareil pour rouvrir et modifier `db.yml`.
:::

:::lang en
**✅ Check:** `db.yml` is encrypted from creation (`head` shows the Vault header). `ansible-vault view db.yml ...` shows `admin_user: pgadmin` — the content the "fake editor" wrote, which never existed in clear on disk. In real use you don't need this trick: your `$EDITOR` opens normally. `edit` works the same way to reopen and modify `db.yml`.
:::

### step-03

:::lang fr
**Objectif.** **Utiliser** les variables chiffrées dans un playbook, et configurer le mot de passe une fois pour toutes.

**🤔 Le cœur pratique.** Un fichier chiffré se déclare en `vars_files:` exactement comme un fichier clair. Ansible le déchiffre à l'exécution — à condition qu'on lui fournisse le mot de passe. Plutôt que de répéter `--vault-password-file`, on le pose dans `ansible.cfg`.

Crée un `ansible.cfg`, un `.gitignore`, et un playbook :
:::

:::lang en
**Goal.** **Use** the encrypted variables in a playbook, and configure the password once and for all.

**🤔 The practical core.** An encrypted file is declared in `vars_files:` exactly like a clear file. Ansible decrypts it at run time — provided you give it the password. Rather than repeating `--vault-password-file`, we put it in `ansible.cfg`.

Create an `ansible.cfg`, a `.gitignore`, and a playbook:
:::

```ini
# ~/ansible-vault-lab/ansible.cfg
[defaults]
vault_password_file = .vault_pass
```

```bash
# NE JAMAIS committer le mot de passe / NEVER commit the password
printf '.vault_pass\n' > .gitignore
```

```yaml
# ~/ansible-vault-lab/utiliser-secrets.yml
- name: Utiliser des secrets chiffrés
  hosts: localhost
  connection: local
  gather_facts: false
  vars_files:
    - secrets.yml            # chiffré ! / encrypted!
  tasks:
    - name: Afficher (démo) que le secret est déchiffré à l'exécution
      ansible.builtin.debug:
        msg: "db_password commence par : {{ db_password[:4] }}*** (longueur {{ db_password | length }})"
```

```bash
# Plus besoin de --vault-password-file : c'est dans ansible.cfg / no more flag needed
ansible-playbook utiliser-secrets.yml
```

:::lang fr
**✅ Vérification :** le playbook s'exécute **sans** demander de mot de passe (il le lit depuis `ansible.cfg`), et la tâche affiche `db_password commence par : S3cr***  (longueur 14)`. La variable `db_password` a bien été déchiffrée à la volée depuis `secrets.yml`, alors que le fichier reste chiffré sur le disque. ⚠️ En vrai, on n'affiche jamais un secret : ici on ne montre que 4 caractères pour **prouver** le déchiffrement.
:::

:::lang en
**✅ Check:** the playbook runs **without** asking for a password (it reads it from `ansible.cfg`), and the task prints `db_password commence par : S3cr***  (longueur 14)`. The `db_password` variable was decrypted on the fly from `secrets.yml`, while the file stays encrypted on disk. ⚠️ In reality you never print a secret: here we show only 4 characters to **prove** decryption.
:::

### step-04

:::lang fr
**Objectif.** Chiffrer **une seule variable inline** avec `encrypt_string` — le pattern « fichier mixte ».

**🤔 Quand l'utiliser ?** Quand un fichier de variables mélange du **public** (ports, chemins, versions) et **un ou deux secrets**. Chiffrer tout le fichier rendrait le public illisible en revue. `encrypt_string` chiffre **juste la valeur** : tu la colles dans un `group_vars/all.yml` en clair, avec un nom de variable **parfaitement lisible**.

Génère une variable chiffrée et colle-la dans un fichier clair :
:::

:::lang en
**Goal.** Encrypt **a single inline variable** with `encrypt_string` — the "mixed file" pattern.

**🤔 When to use it?** When a variables file mixes **public** data (ports, paths, versions) and **one or two secrets**. Encrypting the whole file would make the public part unreadable in review. `encrypt_string` encrypts **just the value**: you paste it into a clear `group_vars/all.yml`, with a **perfectly readable** variable name.

Generate an encrypted variable and paste it into a clear file:
:::

```bash
# Produit un bloc YAML "nom: !vault |..." prêt à coller / produces a ready-to-paste YAML block
ansible-vault encrypt_string 'R3dis-Prod-Pw!' --name 'redis_password' > /tmp/bloc.txt
cat /tmp/bloc.txt
```

:::lang fr
Crée `group_vars_all.yml` en **collant** le bloc produit, à côté de variables en clair :
:::

:::lang en
Create `group_vars_all.yml` by **pasting** the produced block, next to clear variables:
:::

```yaml
# group_vars_all.yml — fichier MIXTE (public + un secret) / MIXED file
app_name: boutique
app_port: 8080
redis_password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          <<< COLLE ICI LES LIGNES HEXADÉCIMALES DE /tmp/bloc.txt >>>
```

```bash
# Vérifier que le secret se déchiffre bien dans un play / check it decrypts in a play
ansible localhost -c local -m ansible.builtin.debug \
  -a "msg={{ redis_password }}" -e "@group_vars_all.yml"
```

:::lang fr
**✅ Vérification :** `cat /tmp/bloc.txt` montre un bloc `redis_password: !vault |` suivi de lignes hexadécimales **indentées**. Une fois collé (en respectant l'indentation !) dans `group_vars_all.yml`, la commande ad-hoc affiche `R3dis-Prod-Pw!` — la valeur déchiffrée. Le fichier reste **lisible en revue** : `app_name`, `app_port` en clair, seul `redis_password` est un blob. C'est le meilleur des deux mondes. ⚠️ L'indentation du bloc `!vault |` est **critique** : toutes les lignes hexadécimales doivent être alignées sous le `|`.
:::

:::lang en
**✅ Check:** `cat /tmp/bloc.txt` shows a `redis_password: !vault |` block followed by **indented** hex lines. Once pasted (respecting the indentation!) into `group_vars_all.yml`, the ad-hoc command prints `R3dis-Prod-Pw!` — the decrypted value. The file stays **readable in review**: `app_name`, `app_port` in clear, only `redis_password` is a blob. Best of both worlds. ⚠️ The indentation of the `!vault |` block is **critical**: all hex lines must align under the `|`.
:::

### step-05

:::lang fr
**Objectif.** Changer le mot de passe d'un coffre avec **`rekey`** (rotation de clé).

**🤔 Pourquoi c'est un vrai besoin.** Un secret partagé finit par fuiter (départ d'un collègue, mot de passe compromis). `rekey` **rechiffre** le fichier avec un **nouveau** mot de passe, sans jamais exposer le contenu en clair. Le fichier reste chiffré du début à la fin, seule la clé change.

Fais tourner la clé de `secrets.yml` :
:::

:::lang en
**Goal.** Change a vault's password with **`rekey`** (key rotation).

**🤔 Why it's a real need.** A shared secret eventually leaks (a colleague leaves, a password is compromised). `rekey` **re-encrypts** the file with a **new** password, without ever exposing the content in clear. The file stays encrypted throughout, only the key changes.

Rotate `secrets.yml`'s key:
:::

```bash
# Nouveau mot de passe / new password
echo "NouveauMotDePasse2026" > .vault_pass_new
chmod 600 .vault_pass_new

# Rechiffrer : ancienne clé -> nouvelle clé / re-encrypt: old key -> new key
ansible-vault rekey secrets.yml \
  --vault-password-file .vault_pass \
  --new-vault-password-file .vault_pass_new

# L'ancienne clé ne marche plus, la nouvelle oui / old key fails, new one works
ansible-vault view secrets.yml --vault-password-file .vault_pass_new   # -> OK
```

:::lang fr
**✅ Vérification :** `rekey` affiche `Rekey successful`. `ansible-vault view secrets.yml --vault-password-file .vault_pass_new` (la **nouvelle** clé) affiche les secrets. Si tu réessaies avec l'**ancienne** clé (`--vault-password-file .vault_pass`), tu obtiens `ERROR! Decryption failed` — la preuve que la rotation a bien eu lieu. (Pense ensuite à mettre à jour `ansible.cfg` / `.vault_pass` avec la nouvelle clé.)
:::

:::lang en
**✅ Check:** `rekey` prints `Rekey successful`. `ansible-vault view secrets.yml --vault-password-file .vault_pass_new` (the **new** key) shows the secrets. If you retry with the **old** key (`--vault-password-file .vault_pass`), you get `ERROR! Decryption failed` — proof the rotation happened. (Then remember to update `ansible.cfg` / `.vault_pass` with the new key.)
:::

### step-06

:::lang fr
**Objectif.** Gérer **plusieurs coffres** avec les **vault-id** — un secret `dev`, un secret `prod`.

**🤔 Le cas multi-environnement.** Tu ne veux pas que la clé de prod déchiffre les secrets de dev, ni l'inverse. Les **vault-id** attachent une **étiquette** (`dev`, `prod`) à chaque mot de passe. Tu chiffres chaque secret avec sa clé, et tu fournis les deux coffres à Ansible : il choisit automatiquement le bon selon l'étiquette du fichier.

Crée deux coffres et chiffre un secret dans chacun :
:::

:::lang en
**Goal.** Manage **multiple vaults** with **vault-ids** — a `dev` secret, a `prod` secret.

**🤔 The multi-environment case.** You don't want the prod key to decrypt dev secrets, nor the reverse. **vault-ids** attach a **label** (`dev`, `prod`) to each password. You encrypt each secret with its key, and you supply both vaults to Ansible: it automatically picks the right one based on the file's label.

Create two vaults and encrypt a secret in each:
:::

```bash
echo "cle-dev-123"  > .vault_dev
echo "cle-prod-456" > .vault_prod
chmod 600 .vault_dev .vault_prod

# Chiffrer un secret AVEC l'étiquette dev / encrypt a secret WITH the dev label
ansible-vault encrypt_string 'dev-token' --name 'token' \
  --vault-id dev@.vault_dev > secret_dev.yml

# Et un autre avec l'étiquette prod / and another with the prod label
ansible-vault encrypt_string 'prod-token' --name 'token' \
  --vault-id prod@.vault_prod > secret_prod.yml

# Fournir LES DEUX coffres : Ansible choisit selon l'étiquette / supply BOTH vaults
ansible localhost -c local -m ansible.builtin.debug -a "msg={{ token }}" \
  --vault-id dev@.vault_dev --vault-id prod@.vault_prod \
  -e "@secret_dev.yml"
```

:::lang fr
**✅ Vérification :** la commande affiche `dev-token` — Ansible a reconnu l'étiquette `dev` du fichier et utilisé `.vault_dev` pour le déchiffrer, **parmi les deux** coffres fournis. Remplace `-e "@secret_dev.yml"` par `-e "@secret_prod.yml"` : cette fois `prod-token` s'affiche, déchiffré avec `.vault_prod`. Chaque coffre ne déchiffre que ce qui lui appartient — l'isolation dev/prod est garantie.
:::

:::lang en
**✅ Check:** the command prints `dev-token` — Ansible recognized the file's `dev` label and used `.vault_dev` to decrypt it, **among the two** supplied vaults. Replace `-e "@secret_dev.yml"` with `-e "@secret_prod.yml"`: this time `prod-token` shows, decrypted with `.vault_prod`. Each vault decrypts only what belongs to it — dev/prod isolation is guaranteed.
:::

### step-07

:::lang fr
**Objectif.** Retirer le chiffrement avec **`decrypt`** — et comprendre pourquoi c'est rare.

**🤔 Quand (ne pas) l'utiliser.** `decrypt` transforme un fichier chiffré en fichier **en clair** sur le disque. Utile pour migrer ou déboguer **hors production**. En prod, tu ne décryptes quasiment jamais : tu utilises `view`/`edit` (qui gardent le fichier chiffré au repos) ou tu laisses Ansible déchiffrer à la volée. Décrypter, c'est réexposer le secret.

Fais un round-trip complet sur une copie :
:::

:::lang en
**Goal.** Remove encryption with **`decrypt`** — and understand why it's rare.

**🤔 When (not) to use it.** `decrypt` turns an encrypted file into a **clear** file on disk. Useful to migrate or debug **outside production**. In prod you almost never decrypt: you use `view`/`edit` (which keep the file encrypted at rest) or let Ansible decrypt on the fly. Decrypting means re-exposing the secret.

Do a full round-trip on a copy:
:::

```bash
cp secrets.yml secrets_copie.yml

# Déchiffrer sur le disque (clé actuelle = la nouvelle depuis le rekey) / decrypt on disk
ansible-vault decrypt secrets_copie.yml --vault-password-file .vault_pass_new

cat secrets_copie.yml           # EN CLAIR maintenant / IN CLEAR now

# Rechiffrer pour ne pas laisser traîner un secret en clair / re-encrypt to not leave a clear secret
ansible-vault encrypt secrets_copie.yml --vault-password-file .vault_pass_new
head -c 40 secrets_copie.yml; echo   # de nouveau chiffré / encrypted again
```

:::lang fr
**✅ Vérification :** après `decrypt`, `cat secrets_copie.yml` montre `db_password: "S3cr3t-DB-2026"` **en clair** — l'en-tête Vault a disparu. Après le `encrypt` de nettoyage, `head` remontre `$ANSIBLE_VAULT;1.1;AES256`. Tu maîtrises maintenant le cycle complet : chiffrer, lire, utiliser, tourner la clé, isoler par environnement, et (rarement) déchiffrer. Supprime la copie : `rm secrets_copie.yml`.
:::

:::lang en
**✅ Check:** after `decrypt`, `cat secrets_copie.yml` shows `db_password: "S3cr3t-DB-2026"` **in clear** — the Vault header is gone. After the cleanup `encrypt`, `head` shows `$ANSIBLE_VAULT;1.1;AES256` again. You now master the full cycle: encrypt, read, use, rotate the key, isolate per environment, and (rarely) decrypt. Delete the copy: `rm secrets_copie.yml`.
:::

## pitfalls

:::lang fr
**1. Committer `.vault_pass`.** Le fichier de mot de passe dans Git réduit Vault à néant : quiconque a le repo a la clé. Mets-le en `.gitignore` **avant** le premier commit, et fais-en une règle d'équipe.

**2. Mauvaise indentation d'un bloc `!vault |`.** Avec `encrypt_string`, toutes les lignes hexadécimales doivent être alignées sous le `|`. Une indentation cassée donne `found unknown escape character` ou un secret illisible. Copie le bloc **tel quel**.

**3. Oublier de fournir le mot de passe.** Sans `--vault-password-file` ni `vault_password_file` dans `ansible.cfg` ni `--ask-vault-pass`, un playbook qui charge un fichier chiffré échoue avec `Attempting to decrypt but no vault secrets found`.

**4. Chiffrer un fichier entier alors qu'une seule valeur est secrète.** Tu rends illisibles en revue des variables publiques. Pour un fichier mixte, `encrypt_string` par secret est plus lisible et plus maintenable.

**5. `decrypt` en production.** Ça réexpose le secret en clair sur le disque. Préfère `view`/`edit`, ou laisse Ansible déchiffrer à l'exécution. `decrypt` est réservé aux migrations hors prod.

**6. Un seul mot de passe pour dev et prod.** Si la même clé chiffre tout, une fuite dev compromet la prod. Utilise des **vault-id** distincts (`dev@`, `prod@`) pour isoler les environnements.

**7. Éditer un fichier chiffré avec un éditeur normal.** Ouvrir `secrets.yml` chiffré avec `nano` puis sauver **corrompt** le fichier (tu édites le blob). Utilise **toujours** `ansible-vault edit`, qui déchiffre/rechiffre proprement.
:::

:::lang en
**1. Committing `.vault_pass`.** The password file in Git reduces Vault to nothing: whoever has the repo has the key. Put it in `.gitignore` **before** the first commit, and make it a team rule.

**2. Wrong indentation of a `!vault |` block.** With `encrypt_string`, all hex lines must align under the `|`. Broken indentation yields `found unknown escape character` or an unreadable secret. Copy the block **as-is**.

**3. Forgetting to supply the password.** Without `--vault-password-file`, nor `vault_password_file` in `ansible.cfg`, nor `--ask-vault-pass`, a playbook loading an encrypted file fails with `Attempting to decrypt but no vault secrets found`.

**4. Encrypting a whole file when only one value is secret.** You make public variables unreadable in review. For a mixed file, `encrypt_string` per secret is more readable and maintainable.

**5. `decrypt` in production.** It re-exposes the secret in clear on disk. Prefer `view`/`edit`, or let Ansible decrypt at run time. `decrypt` is reserved for out-of-prod migrations.

**6. One password for dev and prod.** If the same key encrypts everything, a dev leak compromises prod. Use distinct **vault-ids** (`dev@`, `prod@`) to isolate environments.

**7. Editing an encrypted file with a normal editor.** Opening an encrypted `secrets.yml` with `nano` then saving **corrupts** the file (you edit the blob). **Always** use `ansible-vault edit`, which decrypts/re-encrypts cleanly.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu chiffres un fichier (`encrypt`), tu vois le blob, tu le relis (`view`).
- [ ] Tu crées un fichier chiffré (`create`) sans jamais l'écrire en clair.
- [ ] Un playbook charge un `vars_files:` chiffré grâce à `vault_password_file` dans `ansible.cfg`.
- [ ] Tu chiffres une **seule** variable avec `encrypt_string` dans un fichier mixte lisible.
- [ ] Tu tournes la clé d'un coffre avec `rekey` (l'ancienne clé ne marche plus).
- [ ] Tu isoles `dev` et `prod` avec deux **vault-id** distincts.
- [ ] `.vault_pass` est dans `.gitignore` — jamais commité.

Sept cases = tu gères les secrets comme un ingénieur RHCE. La suite : administrer le système par modules.
:::

:::lang en
You know it works when…

- [ ] You encrypt a file (`encrypt`), see the blob, read it back (`view`).
- [ ] You create an encrypted file (`create`) without ever writing it in clear.
- [ ] A playbook loads an encrypted `vars_files:` thanks to `vault_password_file` in `ansible.cfg`.
- [ ] You encrypt a **single** variable with `encrypt_string` in a readable mixed file.
- [ ] You rotate a vault's key with `rekey` (the old key no longer works).
- [ ] You isolate `dev` and `prod` with two distinct **vault-ids**.
- [ ] `.vault_pass` is in `.gitignore` — never committed.

Seven boxes = you handle secrets like an RHCE engineer. Next up: administer the system via modules.
:::

## next

:::lang fr
La suite du track RHCE :

1. **Ansible — administration système par modules** : gérer utilisateurs, paquets, services, tâches planifiées, pare-feu et stockage avec les modules dédiés — le gros bloc « gérer le contenu système » de l'EX294.
2. Enfin : le **projet d'entreprise** RHCE, qui assemble inventaire, rôles, templates, **Vault** et administration système en un `site.yml` complet — ton livrable de CV.
:::

:::lang en
The RHCE track continues:

1. **Ansible — system administration via modules**: manage users, packages, services, scheduled tasks, firewall and storage with the dedicated modules — the big "manage system content" block of EX294.
2. Finally: the RHCE **enterprise project**, assembling inventory, roles, templates, **Vault** and system administration into a complete `site.yml` — your CV deliverable.
:::

## cheatsheet

:::lang fr
Aide-mémoire Ansible Vault.
:::

:::lang en
Ansible Vault cheat sheet.
:::

```bash
# Fichier / File (avec --vault-password-file ou vault_password_file dans ansible.cfg)
ansible-vault encrypt secrets.yml          # chiffrer un fichier existant / encrypt existing
ansible-vault decrypt secrets.yml          # déchiffrer (rare) / decrypt (rare)
ansible-vault view    secrets.yml          # lire sans modifier / read without modifying
ansible-vault create  secrets.yml          # créer + chiffrer / create + encrypt
ansible-vault edit    secrets.yml          # éditer proprement / edit cleanly
ansible-vault rekey   secrets.yml          # changer la clé / change the key

# Variable inline / Inline variable
ansible-vault encrypt_string 'secret' --name 'db_pw'   # produit un bloc !vault | / produces a !vault | block

# Fournir le mot de passe / Supply the password
ansible-playbook site.yml --ask-vault-pass                 # interactif / interactive
ansible-playbook site.yml --vault-password-file .vault_pass # fichier / file
# ansible.cfg : [defaults] vault_password_file = .vault_pass  (une fois pour toutes / once)

# Multi-coffres / Multi-vaults
ansible-vault encrypt_string 'x' --name 'k' --vault-id prod@.vault_prod
ansible-playbook site.yml --vault-id dev@.vault_dev --vault-id prod@.vault_prod
```

## resources

:::lang fr
- [Chiffrer avec Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/index.html) — le guide officiel complet.
- [Gérer les secrets Vault](https://docs.ansible.com/ansible/latest/vault_guide/vault_managing_passwords.html) — password files, vault-id.
- [`encrypt_string`](https://docs.ansible.com/ansible/latest/cli/ansible-vault.html#ansible-vault-encrypt-string) — variables chiffrées inline.
- [Bonnes pratiques variables & Vault](https://docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html) — organiser secrets et variables.
- [Objectifs RHCE / EX294](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — la certification visée.
:::

:::lang en
- [Encrypt with Ansible Vault](https://docs.ansible.com/ansible/latest/vault_guide/index.html) — the full official guide.
- [Managing Vault passwords](https://docs.ansible.com/ansible/latest/vault_guide/vault_managing_passwords.html) — password files, vault-id.
- [`encrypt_string`](https://docs.ansible.com/ansible/latest/cli/ansible-vault.html#ansible-vault-encrypt-string) — inline encrypted variables.
- [Variables & Vault best practices](https://docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_tricks.html) — organizing secrets and variables.
- [RHCE / EX294 objectives](https://www.redhat.com/en/services/training/ex294-red-hat-certified-engineer-rhce-exam) — the target certification.
:::

## troubleshooting

:::lang fr
**`ERROR! Attempting to decrypt but no vault secrets found`.** Tu n'as pas fourni le mot de passe. Ajoute `--vault-password-file .vault_pass`, `--ask-vault-pass`, ou configure `vault_password_file` dans `ansible.cfg`.

**`ERROR! Decryption failed`.** Mauvais mot de passe (ou mauvaise vault-id). Vérifie le contenu de `.vault_pass`, et pour un fichier multi-coffres, que tu fournis la bonne étiquette.

**`found unknown escape character` / erreur YAML sur un bloc `!vault`.** L'indentation du bloc `encrypt_string` est cassée. Toutes les lignes hexadécimales doivent être alignées sous le `|`. Recopie le bloc exactement.

**`ansible-vault create/edit` n'ouvre pas d'éditeur.** La variable `$EDITOR` (ou `$VISUAL`) n'est pas définie. Exporte-la : `export EDITOR=nano`, puis relance.

**Mon secret s'affiche en clair dans les logs.** `debug` d'un secret le journalise. Ajoute `no_log: true` sur la tâche pour masquer la sortie, ou n'affiche jamais le secret entier.

**Le fichier chiffré est corrompu après édition.** Tu l'as édité avec un éditeur normal au lieu de `ansible-vault edit`. Restaure depuis Git et réédite avec `ansible-vault edit`.
:::

:::lang en
**`ERROR! Attempting to decrypt but no vault secrets found`.** You didn't supply the password. Add `--vault-password-file .vault_pass`, `--ask-vault-pass`, or configure `vault_password_file` in `ansible.cfg`.

**`ERROR! Decryption failed`.** Wrong password (or wrong vault-id). Check `.vault_pass`'s content, and for a multi-vault file, that you supply the right label.

**`found unknown escape character` / YAML error on a `!vault` block.** The `encrypt_string` block indentation is broken. All hex lines must align under the `|`. Recopy the block exactly.

**`ansible-vault create/edit` doesn't open an editor.** The `$EDITOR` (or `$VISUAL`) variable isn't set. Export it: `export EDITOR=nano`, then retry.

**My secret shows in clear in the logs.** `debug`-ing a secret logs it. Add `no_log: true` on the task to mask the output, or never print the whole secret.

**The encrypted file is corrupted after editing.** You edited it with a normal editor instead of `ansible-vault edit`. Restore from Git and re-edit with `ansible-vault edit`.
:::
