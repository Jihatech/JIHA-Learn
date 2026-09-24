---
# — Identité (ne change JAMAIS une fois publié) —
id: linux-scripting-bash
slug: linux-scripting-bash
order: 8
status: published

# — Titres & accroches (bilingue) —
title_fr: "Linux — scripting shell (bash)"
title_en: "Linux — shell scripting (bash)"
tagline_fr: "Variables, arguments, tests, conditions, boucles, fonctions."
tagline_en: "Variables, arguments, tests, conditionals, loops, functions."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 185
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [linux-reseau-securite]
next: [git-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [environnement-shell, variables-quoting, arguments-exit-codes, tests-conditions, boucles, fonctions]
concepts_en: [shell-environment, variables-quoting, arguments-exit-codes, tests-conditionals, loops, functions]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le scripting bash au niveau LPIC-1 : l'environnement du shell (variables, PATH, .bashrc, alias), le premier script (shebang, quoting), les arguments et codes de sortie, les tests et conditions (test, [[ ]], if, case), les boucles (for, while, read) et les fonctions — jusqu'à un vrai script de health-check réutilisable."
og_description_en: "Bash scripting at LPIC-1 level: the shell environment (variables, PATH, .bashrc, aliases), the first script (shebang, quoting), arguments and exit codes, tests and conditionals (test, [[ ]], if, case), loops (for, while, read) and functions — up to a real reusable health-check script."
---

## intro

:::lang fr
Un admin qui **répète** une tâche à la main perd son temps ; un admin qui la **script** la rejoue en une seconde, sans erreur. Le shell **bash** est le langage de colle de l'administration Linux — et l'examen **LPIC-1** le teste sérieusement : *comment lire un argument ? tester une condition ? boucler sur une liste ? renvoyer un code de sortie qu'un autre script pourra vérifier ? écrire une fonction réutilisable ?*

Ce guide couvre les domaines **Environnement & scripting shell** : l'**environnement** (variables, `PATH`, `.bashrc`, alias), le **premier script** (shebang, quoting), les **arguments** et **codes de sortie**, les **tests** et **conditions** (`test`, `[[ ]]`, `if`, `case`), les **boucles** (`for`, `while`, `read`) et les **fonctions**. On finit par un **vrai script de health-check** qui assemble tout et réutilise ce que tu as appris sur systemd.

On travaille dans **n'importe quel shell bash** (native, WSL2, VM Multipass) — pas d'infra particulière. Chaque brique est immédiatement testable.

**Pour qui c'est :** tu as les guides précédents de la track et tu vises **LPIC-1**.

**Quand ce n'est PAS le bon choix :**

- Tu n'es pas à l'aise en ligne de commande → revois le guide « L'art de la ligne de commande » et les fondamentaux.
- Tu veux le projet fil-rouge → c'est l'étape **finale** de la track, juste après.
:::

:::lang en
An admin who **repeats** a task by hand wastes time; an admin who **scripts** it replays it in a second, error-free. The **bash** shell is the glue language of Linux administration — and the **LPIC-1** exam tests it seriously: *how do you read an argument? test a condition? loop over a list? return an exit code another script can check? write a reusable function?*

This guide covers the **Shell environment & scripting** domains: the **environment** (variables, `PATH`, `.bashrc`, aliases), the **first script** (shebang, quoting), **arguments** and **exit codes**, **tests** and **conditionals** (`test`, `[[ ]]`, `if`, `case`), **loops** (`for`, `while`, `read`) and **functions**. We finish with a **real health-check script** that assembles everything and reuses what you learned about systemd.

We work in **any bash shell** (native, WSL2, Multipass VM) — no special infra. Every brick is immediately testable.

**Who it's for:** you have the earlier track guides and you're aiming for **LPIC-1**.

**When it's NOT the right choice:**

- You're not comfortable on the command line → review the "Art of the command line" guide and the fundamentals.
- You want the capstone → that's the **final** step of the track, right after.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Manipuler l'**environnement** : variables, `export`, `PATH`, `.bashrc`, alias.
- Écrire un **script** exécutable (shebang, `chmod +x`) et maîtriser le **quoting**.
- Lire des **arguments** (`$1`, `$@`, `$#`) et renvoyer/tester des **codes de sortie** (`$?`, `exit`).
- Écrire des **tests** (`test`, `[ ]`, `[[ ]]`) et des **conditions** (`if`/`elif`/`else`, `case`).
- Écrire des **boucles** (`for`, `while`, `until`) et lire des lignes avec `read`.
- Définir des **fonctions** et assembler un **script complet** utile.
:::

:::lang en
By the end of this guide, you'll know how to:

- Manipulate the **environment**: variables, `export`, `PATH`, `.bashrc`, aliases.
- Write an executable **script** (shebang, `chmod +x`) and master **quoting**.
- Read **arguments** (`$1`, `$@`, `$#`) and return/test **exit codes** (`$?`, `exit`).
- Write **tests** (`test`, `[ ]`, `[[ ]]`) and **conditionals** (`if`/`elif`/`else`, `case`).
- Write **loops** (`for`, `while`, `until`) and read lines with `read`.
- Define **functions** and assemble a useful **complete script**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides précédents de la track Linux acquis (notamment **boot & systemd** pour le script final).
- Un shell **bash** (native, WSL2, ou VM Multipass). Vérifie : `bash --version`.
- Un éditeur en ligne de commande (`nano`, `vim`).

Crée un dossier de travail :
:::

:::lang en
You should have:

- The earlier Linux track guides under your belt (especially **boot & systemd** for the final script).
- A **bash** shell (native, WSL2, or Multipass VM). Check: `bash --version`.
- A command-line editor (`nano`, `vim`).

Create a working directory:
:::

```bash
mkdir -p ~/scripts && cd ~/scripts
```

## concepts

:::lang fr
**L'environnement du shell.** Chaque shell a des **variables** : locales (visibles dans ce shell) ou **d'environnement** (héritées par les processus enfants, via **`export`**). La plus célèbre, **`PATH`**, liste les dossiers où chercher les commandes. Ton shell interactif charge sa config au démarrage : **`~/.bashrc`** (shell interactif non-login) et **`~/.profile`**/`~/.bash_profile` (shell de login) — c'est là qu'on met ses **alias** et exports permanents.

**Un script, c'est un fichier de commandes.** Il commence par un **shebang** — `#!/usr/bin/env bash` — qui dit **quel interpréteur** l'exécute. On le rend **exécutable** (`chmod +x`) puis on le lance (`./script.sh`).

**Le quoting**, source n°1 de bugs :

- **Guillemets doubles `"…"`** : les variables sont **remplacées** (`"$var"`), mais la chaîne reste un seul mot. **Le réflexe par défaut.**
- **Guillemets simples `'…'`** : **rien** n'est interprété (littéral brut).
- Sans guillemets : le shell **découpe** sur les espaces et **développe** les jokers (`*`) — souvent la cause de bugs sur les chemins à espaces.

**Arguments & codes de sortie.** Un script reçoit ses arguments dans **`$1`, `$2`…**, **`$@`** (tous), **`$#`** (le nombre). Toute commande renvoie un **code de sortie** : **`0` = succès**, non-zéro = échec, lu dans **`$?`**. Ton script en renvoie un avec **`exit N`**. C'est **le** mécanisme qui permet de **chaîner** : `cmd1 && cmd2` (si succès), `cmd1 || cmd2` (si échec).

**Tests & conditions.** On évalue une condition avec **`test`** / **`[ … ]`** (POSIX) ou **`[[ … ]]`** (bash, plus sûr) : `-f` (fichier existe), `-d` (dossier), `-z` (chaîne vide), `-eq`/`-lt`/`-gt` (nombres), `=`/`!=` (chaînes). Puis **`if`/`elif`/`else`** branche, ou **`case`** compare une valeur à des motifs. L'arithmétique se fait dans **`$(( … ))`**.

**Boucles.** **`for`** itère sur une liste (`for f in *.txt`), **`while`** tant qu'une condition tient (souvent `while read -r ligne` pour lire un fichier ligne par ligne), **`until`** jusqu'à ce qu'elle tienne.

**Fonctions.** Un bloc réutilisable et nommé : `nom() { … }`. Elle reçoit ses arguments comme un script (`$1`…), et renvoie un **code** avec `return`. On y met des variables **`local`** pour ne pas polluer le reste.
:::

:::lang en
**The shell environment.** Each shell has **variables**: local (visible in this shell) or **environment** ones (inherited by child processes, via **`export`**). The most famous, **`PATH`**, lists the folders to search for commands. Your interactive shell loads its config at startup: **`~/.bashrc`** (interactive non-login shell) and **`~/.profile`**/`~/.bash_profile` (login shell) — that's where you put your **aliases** and permanent exports.

**A script is a file of commands.** It starts with a **shebang** — `#!/usr/bin/env bash` — that says **which interpreter** runs it. You make it **executable** (`chmod +x`) then run it (`./script.sh`).

**Quoting**, bug source #1:

- **Double quotes `"…"`**: variables are **substituted** (`"$var"`), but the string stays one word. **The default reflex.**
- **Single quotes `'…'`**: **nothing** is interpreted (raw literal).
- No quotes: the shell **splits** on spaces and **expands** globs (`*`) — often the cause of bugs on paths with spaces.

**Arguments & exit codes.** A script gets its arguments in **`$1`, `$2`…**, **`$@`** (all), **`$#`** (the count). Every command returns an **exit code**: **`0` = success**, non-zero = failure, read in **`$?`**. Your script returns one with **`exit N`**. That's **the** mechanism to **chain**: `cmd1 && cmd2` (on success), `cmd1 || cmd2` (on failure).

**Tests & conditionals.** You evaluate a condition with **`test`** / **`[ … ]`** (POSIX) or **`[[ … ]]`** (bash, safer): `-f` (file exists), `-d` (directory), `-z` (empty string), `-eq`/`-lt`/`-gt` (numbers), `=`/`!=` (strings). Then **`if`/`elif`/`else`** branches, or **`case`** matches a value against patterns. Arithmetic happens in **`$(( … ))`**.

**Loops.** **`for`** iterates over a list (`for f in *.txt`), **`while`** as long as a condition holds (often `while read -r line` to read a file line by line), **`until`** until it holds.

**Functions.** A named, reusable block: `name() { … }`. It gets its arguments like a script (`$1`…), and returns a **code** with `return`. Use **`local`** variables inside so you don't pollute the rest.
:::

:::figure linux-bash-script
caption_fr: "Schéma 1. shebang → variables/quoting → arguments ($1, $#) → tests ([[ ]]) & conditions (if/case) → boucles (for/while) → fonctions → exit code."
caption_en: "Figure 1. shebang → variables/quoting → arguments ($1, $#) → tests ([[ ]]) & conditionals (if/case) → loops (for/while) → functions → exit code."
:::

:::lang fr
On avance : environnement → premier script & quoting → arguments & codes de sortie → tests & conditions → boucles → fonctions & script complet.
:::

:::lang en
We'll go: environment → first script & quoting → arguments & exit codes → tests & conditionals → loops → functions & complete script.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Manipuler l'**environnement** : variables, `export`, `PATH`, alias.

**🤔 Locale vs exportée.** Une variable **exportée** est héritée par les processus enfants ; une locale, non. Observe :
:::

:::lang en
**Goal.** Manipulate the **environment**: variables, `export`, `PATH`, aliases.

**🤔 Local vs exported.** An **exported** variable is inherited by child processes; a local one isn't. Observe:
:::

```bash
MAVAR="bonjour"                 # variable locale au shell / shell-local variable
echo "$MAVAR"                   # bonjour
bash -c 'echo "enfant voit: $MAVAR"'   # VIDE : non exportée / EMPTY: not exported
export MAVAR
bash -c 'echo "enfant voit: $MAVAR"'   # bonjour : héritée / inherited

echo "$PATH"                    # les dossiers où le shell cherche les commandes / where the shell finds commands
alias ll='ls -lah'              # un alias (raccourci) / an alias (shortcut)
type ll                         # montre à quoi ll est lié / shows what ll maps to
```

:::lang fr
**✅ Vérification :** avant `export`, le sous-shell `bash -c` affiche une valeur **vide** pour `$MAVAR` (la variable locale n'est **pas** transmise) ; **après** `export`, l'enfant voit `bonjour`. C'est **la** distinction locale/environnement. `echo "$PATH"` liste les dossiers de recherche des commandes (séparés par `:`). L'`alias ll` crée un raccourci. **À savoir pour l'examen :** ces réglages sont **temporaires** ; pour les rendre permanents, on les met dans **`~/.bashrc`** (alias, exports).
:::

:::lang en
**✅ Check:** before `export`, the `bash -c` subshell prints an **empty** value for `$MAVAR` (the local variable is **not** passed on); **after** `export`, the child sees `bonjour`. That's **the** local/environment distinction. `echo "$PATH"` lists the command-search folders (colon-separated). The `alias ll` creates a shortcut. **For the exam:** these settings are **temporary**; to make them permanent, put them in **`~/.bashrc`** (aliases, exports).
:::

### step-02

:::lang fr
**Objectif.** Écrire ton **premier script** et comprendre le **quoting**.

**🤔 Trois façons de citer.** Crée `bonjour.sh` :
:::

:::lang en
**Goal.** Write your **first script** and understand **quoting**.

**🤔 Three ways to quote.** Create `bonjour.sh`:
:::

```bash
cat > bonjour.sh <<'EOF'
#!/usr/bin/env bash
nom="le monde"
echo "double: bonjour $nom"     # $nom est REMPLACÉ / $nom is SUBSTITUTED
echo 'simple: bonjour $nom'     # littéral, $nom N'est PAS remplacé / literal, NOT substituted
echo "date du jour: $(date +%F)"   # substitution de commande / command substitution
EOF

chmod +x bonjour.sh             # rend le script exécutable / make it executable
./bonjour.sh
```

:::lang fr
**✅ Vérification :** `./bonjour.sh` affiche `double: bonjour le monde` (les **guillemets doubles** ont **remplacé** `$nom`), puis `simple: bonjour $nom` **littéralement** (les **guillemets simples** n'interprètent **rien**), puis la date du jour (la **substitution de commande** `$(date …)` a été exécutée). Le **shebang** `#!/usr/bin/env bash` dit au système d'utiliser bash, et `chmod +x` a rendu le fichier **exécutable**. Retiens la règle d'or : **guillemets doubles par défaut** (variables remplacées, mais un seul mot), simples pour du littéral brut.
:::

:::lang en
**✅ Check:** `./bonjour.sh` prints `double: bonjour le monde` (the **double quotes** **substituted** `$nom`), then `simple: bonjour $nom` **literally** (the **single quotes** interpret **nothing**), then today's date (the **command substitution** `$(date …)` ran). The **shebang** `#!/usr/bin/env bash` tells the system to use bash, and `chmod +x` made the file **executable**. Remember the golden rule: **double quotes by default** (variables substituted, but one word), single for raw literal.
:::

### step-03

:::lang fr
**Objectif.** Lire des **arguments** et gérer les **codes de sortie**.

**🤔 Un script qui prend des entrées.** Crée `salut.sh` qui salue son argument et vérifie qu'il en reçoit un :
:::

:::lang en
**Goal.** Read **arguments** and handle **exit codes**.

**🤔 A script that takes inputs.** Create `salut.sh` that greets its argument and checks it got one:
:::

```bash
cat > salut.sh <<'EOF'
#!/usr/bin/env bash
echo "nombre d'arguments: $#"
if [[ $# -lt 1 ]]; then
  echo "usage: $0 <nom>" >&2      # message d'erreur sur stderr / error message to stderr
  exit 1                          # code de sortie NON-ZÉRO = échec / NON-ZERO exit = failure
fi
echo "Salut, $1 ! (tous: $@)"
exit 0                            # succès explicite / explicit success
EOF
chmod +x salut.sh

./salut.sh Ada        ; echo "code retour = $?"    # succès / success
./salut.sh            ; echo "code retour = $?"    # échec (aucun argument) / failure (no argument)
```

:::lang fr
**✅ Vérification :** `./salut.sh Ada` affiche `Salut, Ada !` et `code retour = 0` ; `./salut.sh` **sans** argument affiche l'usage (sur **stderr**) et `code retour = 1`. Tu vois le contrat : **`$1`** (premier arg), **`$#`** (leur nombre), **`$@`** (tous), **`$0`** (le nom du script), et **`exit`** qui fixe le code lu ensuite dans **`$?`**. Ce code (**0 = OK**, non-zéro = erreur) est ce qui permet à un autre programme (ou `&&`/`||`) de **réagir** au résultat.
:::

:::lang en
**✅ Check:** `./salut.sh Ada` prints `Salut, Ada !` and `code retour = 0`; `./salut.sh` **without** an argument prints usage (to **stderr**) and `code retour = 1`. You see the contract: **`$1`** (first arg), **`$#`** (their count), **`$@`** (all), **`$0`** (the script name), and **`exit`** which sets the code then read in **`$?`**. That code (**0 = OK**, non-zero = error) is what lets another program (or `&&`/`||`) **react** to the result.
:::

### step-04

:::lang fr
**Objectif.** Écrire des **tests** et des **conditions** (`[[ ]]`, `if`, `case`).

**🤔 Évaluer, puis brancher.** Crée `verif.sh` qui teste un fichier et classe un nombre :
:::

:::lang en
**Goal.** Write **tests** and **conditionals** (`[[ ]]`, `if`, `case`).

**🤔 Evaluate, then branch.** Create `verif.sh` that tests a file and classifies a number:
:::

```bash
cat > verif.sh <<'EOF'
#!/usr/bin/env bash
fichier="${1:-/etc/hostname}"     # valeur par défaut si $1 absent / default if $1 missing

if [[ -f "$fichier" ]]; then      # -f : le fichier existe / -f: the file exists
  echo "$fichier existe ($(wc -l < "$fichier") lignes)"
elif [[ -d "$fichier" ]]; then
  echo "$fichier est un dossier"
else
  echo "$fichier introuvable" >&2
fi

n=$(( RANDOM % 3 ))               # arithmétique : 0, 1 ou 2 / arithmetic: 0, 1 or 2
case "$n" in
  0) echo "zéro" ;;
  1) echo "un" ;;
  *) echo "autre: $n" ;;          # * = motif par défaut / default pattern
esac
EOF
chmod +x verif.sh ; ./verif.sh
```

:::lang fr
**✅ Vérification :** `./verif.sh` teste `/etc/hostname` (via `${1:-défaut}`), voit qu'**il existe** (branche `if`) et affiche son nombre de lignes ; puis le `case` classe un nombre aléatoire (`$(( RANDOM % 3 ))`) en `zéro`/`un`/`autre`. Tu maîtrises : **`[[ -f ]]`/`[[ -d ]]`** (tests de fichiers), **`if`/`elif`/`else`** (branchement binaire/multiple), **`case`** (comparaison à des **motifs**), l'arithmétique **`$(( ))`**, et la valeur par défaut **`${var:-défaut}`**. *(`[[ ]]` est la version bash, plus sûre que `[ ]` avec les variables vides ou les espaces.)*
:::

:::lang en
**✅ Check:** `./verif.sh` tests `/etc/hostname` (via `${1:-default}`), sees it **exists** (the `if` branch) and prints its line count; then the `case` classifies a random number (`$(( RANDOM % 3 ))`) as `zéro`/`un`/`autre`. You've got: **`[[ -f ]]`/`[[ -d ]]`** (file tests), **`if`/`elif`/`else`** (binary/multiple branching), **`case`** (matching against **patterns**), arithmetic **`$(( ))`**, and the default value **`${var:-default}`**. *(`[[ ]]` is the bash version, safer than `[ ]` with empty variables or spaces.)*
:::

### step-05

:::lang fr
**Objectif.** Écrire des **boucles** : `for`, `while`, et lire des lignes avec `read`.

**🤔 Répéter sans copier-coller.** Crée `boucles.sh` :
:::

:::lang en
**Goal.** Write **loops**: `for`, `while`, and read lines with `read`.

**🤔 Repeat without copy-paste.** Create `boucles.sh`:
:::

```bash
cat > boucles.sh <<'EOF'
#!/usr/bin/env bash
# for : sur une liste / over a list
for i in 1 2 3; do
  echo "for -> $i"
done

# while : tant que la condition tient / while the condition holds
n=0
while [[ $n -lt 3 ]]; do
  echo "while -> $n"
  n=$(( n + 1 ))
done

# while read : lire un flux ligne par ligne / read a stream line by line
printf 'alice\nbob\ncarol\n' | while read -r ligne; do
  echo "utilisateur: $ligne"
done
EOF
chmod +x boucles.sh ; ./boucles.sh
```

:::lang fr
**✅ Vérification :** `./boucles.sh` affiche trois `for -> …` (itération sur la **liste** `1 2 3`), trois `while -> …` (tant que `n < 3`, avec incrément `$(( n + 1 ))`), puis un `utilisateur: …` par ligne reçue (le motif **`while read -r`** lit un flux **ligne par ligne** — l'outil pour traiter un fichier ou une sortie de commande). Tu tiens les trois formes de boucle. *(Le **`-r`** de `read` empêche l'interprétation des `\` — toujours l'utiliser.)*
:::

:::lang en
**✅ Check:** `./boucles.sh` prints three `for -> …` (iterating over the **list** `1 2 3`), three `while -> …` (as long as `n < 3`, incrementing with `$(( n + 1 ))`), then one `utilisateur: …` per received line (the **`while read -r`** pattern reads a stream **line by line** — the tool to process a file or a command's output). You hold the three loop forms. *(The **`-r`** in `read` prevents `\` interpretation — always use it.)*
:::

### step-06

:::lang fr
**Objectif.** Définir une **fonction** et assembler un **script complet** utile : un **health-check** de serveur.

**🤔 Tout ensemble.** Ce script réunit tout : shebang, arguments, `[[ ]]`, `if`, `for`, une **fonction**, et un **code de sortie** exploitable. Il vérifie l'usage disque et l'état de services (ce que tu as appris au guide systemd). *(Il appelle `systemctl` : lance-le sur un **hôte systemd** — native/Multipass, ou WSL2 avec systemd activé — sinon les vérifications de services échoueront à tort.)* Crée `healthcheck.sh` :
:::

:::lang en
**Goal.** Define a **function** and assemble a useful **complete script**: a server **health-check**.

**🤔 All together.** This script brings it all: shebang, arguments, `[[ ]]`, `if`, `for`, a **function**, and a usable **exit code**. It checks disk usage and service states (what you learned in the systemd guide). *(It calls `systemctl`: run it on a **systemd host** — native/Multipass, or WSL2 with systemd enabled — otherwise the service checks will wrongly fail.)* Create `healthcheck.sh`:
:::

```bash
cat > healthcheck.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail                 # arrêt sur erreur/variable non définie / stop on error/unset var

seuil="${1:-80}"                  # seuil d'usage disque en %, défaut 80 / disk-usage threshold %, default 80
services=(cron systemd-journald)  # services fiables (toujours actifs) / reliably-active services
probleme=0

# fonction : vérifie qu'un service est actif / function: check a service is active
verifier_service() {
  local svc="$1"
  if systemctl is-active --quiet "$svc"; then
    echo "  [OK]   service $svc actif"
  else
    echo "  [FAIL] service $svc INACTIF" >&2
    return 1
  fi
}

echo "== Health-check (seuil disque ${seuil}%) =="

# 1) usage du disque racine / root disk usage
usage=$(df --output=pcent / | tail -1 | tr -dc '0-9')   # ex. 42
if [[ $usage -ge $seuil ]]; then
  echo "  [FAIL] disque / à ${usage}% (>= ${seuil}%)" >&2
  probleme=1
else
  echo "  [OK]   disque / à ${usage}%"
fi

# 2) chaque service / each service
for svc in "${services[@]}"; do
  verifier_service "$svc" || probleme=1
done

# 3) verdict via code de sortie / verdict via exit code
if [[ $probleme -eq 0 ]]; then
  echo "== Tout est sain =="; exit 0
else
  echo "== Problèmes détectés =="; exit 1
fi
EOF
chmod +x healthcheck.sh

./healthcheck.sh ; echo "verdict = $?"      # code 0 si sain / 0 if healthy
./healthcheck.sh 5 ; echo "verdict = $?"    # seuil bas -> probablement FAIL disque / low threshold -> likely disk FAIL
```

:::lang fr
**✅ Vérification :** `./healthcheck.sh` affiche un rapport `[OK]`/`[FAIL]` pour le disque `/` et pour chaque service (`cron`, `systemd-journald`), puis `Tout est sain` avec **`verdict = 0`** ; `./healthcheck.sh 5` (seuil à 5 %) déclenche le `[FAIL]` disque et renvoie **`verdict = 1`**. Tu as un **script complet et réutilisable** qui assemble tout le guide : une **fonction** `verifier_service` (avec variable `local` et `return`), un **tableau** `services=(…)`, une **boucle `for`**, des **tests `[[ ]]`**, l'usage d'**arguments** avec valeur par défaut, et surtout un **code de sortie** exploitable — un cron ou un pipeline peut lancer ce script et **réagir** à son `0`/`1`. Le `set -euo pipefail` en tête est la **bonne pratique** des scripts robustes (arrêt sur erreur, variable non définie, ou échec dans un pipe).
:::

:::lang en
**✅ Check:** `./healthcheck.sh` prints an `[OK]`/`[FAIL]` report for disk `/` and each service (`cron`, `systemd-journald`), then `Tout est sain` with **`verdict = 0`**; `./healthcheck.sh 5` (threshold 5%) triggers the disk `[FAIL]` and returns **`verdict = 1`**. You have a **complete, reusable script** that assembles the whole guide: a **function** `verifier_service` (with a `local` variable and `return`), an **array** `services=(…)`, a **`for` loop**, **`[[ ]]` tests**, **argument** use with a default value, and above all a usable **exit code** — a cron job or a pipeline can run this script and **react** to its `0`/`1`. The `set -euo pipefail` at the top is the **best practice** for robust scripts (stop on error, unset variable, or a failure in a pipe).
:::

## pitfalls

:::lang fr
**1. Variables non protégées par des guillemets.** `$var` sans `"…"` est **découpé** sur les espaces et **développe** les jokers. Un chemin `mon dossier` casse tout. Réflexe : **toujours `"$var"`**.

**2. Confondre guillemets simples et doubles.** `'$var'` ne remplace **rien** (littéral) ; `"$var"` remplace. Utiliser des simples là où on attend une substitution = valeur non interprétée.

**3. Espaces autour du `=` en affectation.** `var = 5` est faux (bash y voit une commande `var`). C'est **`var=5`**, **sans** espaces.

**4. Oublier le shebang ou `chmod +x`.** Sans shebang, le script peut être exécuté par le mauvais interpréteur ; sans `+x`, `./script.sh` renvoie `Permission denied` (contourne avec `bash script.sh`).

**5. `[ ]` avec une variable vide.** `[ $x = "y" ]` plante si `$x` est vide (« unary operator expected »). `[[ ]]` (bash) est robuste ; sinon **quote** : `[ "$x" = "y" ]`.

**6. `read` sans `-r`.** Sans `-r`, `read` **mange** les antislashs. Utilise **toujours `read -r`**.

**7. Ignorer le code de sortie.** Un script qui renvoie toujours `0` est inutilisable dans une chaîne. Renvoie **`exit 1`** en cas de problème pour qu'un `&&`/cron/CI puisse réagir.
:::

:::lang en
**1. Variables not protected by quotes.** `$var` without `"…"` is **split** on spaces and **expands** globs. A path `my folder` breaks everything. Reflex: **always `"$var"`**.

**2. Confusing single and double quotes.** `'$var'` substitutes **nothing** (literal); `"$var"` substitutes. Using single quotes where you expect substitution = uninterpreted value.

**3. Spaces around `=` in assignment.** `var = 5` is wrong (bash sees a `var` command). It's **`var=5`**, with **no** spaces.

**4. Forgetting the shebang or `chmod +x`.** Without a shebang, the script may run under the wrong interpreter; without `+x`, `./script.sh` returns `Permission denied` (work around with `bash script.sh`).

**5. `[ ]` with an empty variable.** `[ $x = "y" ]` breaks if `$x` is empty ("unary operator expected"). `[[ ]]` (bash) is robust; otherwise **quote**: `[ "$x" = "y" ]`.

**6. `read` without `-r`.** Without `-r`, `read` **eats** backslashes. **Always use `read -r`**.

**7. Ignoring the exit code.** A script that always returns `0` is useless in a chain. Return **`exit 1`** on a problem so a `&&`/cron/CI can react.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu distingues variable **locale** et **exportée**, et tu sais où les rendre permanentes.
- [ ] Tu écris un script (**shebang** + `chmod +x`) et tu maîtrises le **quoting**.
- [ ] Tu lis **`$1`/`$@`/`$#`** et tu renvoies/testes un **code de sortie** (`exit`/`$?`).
- [ ] Tu écris des **tests `[[ ]]`** et des conditions **`if`/`case`**.
- [ ] Tu écris des boucles **`for`**, **`while`**, et **`while read -r`**.
- [ ] Tu définis une **fonction** et tu assembles un **script complet** avec un verdict.

Six cases cochées = tu tiens **l'environnement & le scripting shell** du LPIC-1.
:::

:::lang en
You know it works when…

- [ ] You distinguish a **local** variable from an **exported** one, and know where to make them permanent.
- [ ] You write a script (**shebang** + `chmod +x`) and master **quoting**.
- [ ] You read **`$1`/`$@`/`$#`** and return/test an **exit code** (`exit`/`$?`).
- [ ] You write **`[[ ]]` tests** and **`if`/`case`** conditionals.
- [ ] You write **`for`**, **`while`**, and **`while read -r`** loops.
- [ ] You define a **function** and assemble a **complete script** with a verdict.

Six boxes ticked = you hold LPIC-1 **shell environment & scripting**.
:::

## next

:::lang fr
Tu as bouclé la **couverture de contenu** de la track Linux → LPIC-1. Il reste le **projet d'entreprise** :

- **Projet d'entreprise** — provisionner et **durcir un serveur Linux multi-utilisateur** de A à Z : utilisateurs/groupes/sudo, disque LVM monté, service systemd, tâche planifiée, réseau et SSH durci, pare-feu, **script d'automatisation** — documenté en runbook. Le livrable Linux pour ton CV, qui réunit **tous** les guides de la track.
:::

:::lang en
You've completed the **content coverage** of the Linux → LPIC-1 track. The **enterprise project** remains:

- **Enterprise project** — provision and **harden a multi-user Linux server** end to end: users/groups/sudo, an LVM-mounted disk, a systemd service, a scheduled task, networking and hardened SSH, a firewall, an **automation script** — documented as a runbook. The Linux deliverable for your CV, bringing together **all** the track's guides.
:::

## cheatsheet

:::lang fr
Aide-mémoire scripting bash.
:::

:::lang en
Bash scripting cheat sheet.
:::

```bash
#!/usr/bin/env bash                # shebang
set -euo pipefail                  # robuste : stop erreur/var non définie/pipe / robust

# Variables & quoting
var="valeur" ; export VAR         # locale / exportée
echo "$var"                       # doubles: remplace / substitute   '...' : littéral / literal
d=$(date +%F)                     # substitution de commande / command substitution
n=$(( 2 + 3 ))                    # arithmétique / arithmetic

# Arguments & code de sortie / exit code
$1 $2 ... ; $@ (tous) ; $# (nombre) ; $0 (nom) ; $? (dernier code) ; exit N

# Tests & conditions
[[ -f f ]] [[ -d d ]] [[ -z "$s" ]] [[ $a -eq $b ]] [[ "$s" = "x" ]]
if ... ; then ... ; elif ... ; then ... ; else ... ; fi
case "$x" in  motif) ... ;;  *) ... ;;  esac

# Boucles / loops
for i in liste; do ... ; done
while [[ cond ]]; do ... ; done
while read -r ligne; do ... ; done < fichier

# Fonction / function
nom() { local x="$1" ; ... ; return 0 ; }
```

## resources

:::lang fr
- [Bash Guide for Beginners](https://tldp.org/LDP/Bash-Beginners-Guide/html/) et [Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/).
- [`man bash`](https://manpages.ubuntu.com/manpages/noble/man1/bash.1.html) (sections *Parameter Expansion*, *Conditional Expressions*).
- [ShellCheck](https://www.shellcheck.net/) — l'analyseur qui trouve tes bugs de quoting.
- Objectifs **LPIC-1 105.1 (environnement) et 105.2 (scripts simples)**.
:::

:::lang en
- [Bash Guide for Beginners](https://tldp.org/LDP/Bash-Beginners-Guide/html/) and [Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/).
- [`man bash`](https://manpages.ubuntu.com/manpages/noble/man1/bash.1.html) (*Parameter Expansion*, *Conditional Expressions* sections).
- [ShellCheck](https://www.shellcheck.net/) — the analyzer that finds your quoting bugs.
- **LPIC-1 105.1 (environment) and 105.2 (simple scripts)** objectives.
:::

## troubleshooting

:::lang fr
**`Permission denied` en lançant `./script.sh`.** Il manque le `+x` : `chmod +x script.sh`. (Ou lance-le via `bash script.sh`.)

**`command not found` alors que le script existe.** Il n'est pas dans le `PATH` : lance-le avec un chemin (`./script.sh`) ou ajoute son dossier au `PATH`.

**`syntax error near unexpected token`.** Souvent un `then`/`do`/`fi`/`done` mal placé, ou des espaces manquants (`if[[` au lieu de `if [[`). Passe le script à **ShellCheck**.

**`unary operator expected` avec `[ ]`.** Une variable vide non quotée : utilise `[[ ]]` ou quote (`[ "$x" = "y" ]`).

**`var: command not found` sur une affectation.** Tu as mis des espaces : `var = 5` → écris `var=5` (sans espaces).

**Le script « marche » mais renvoie toujours 0.** Tu ne fais pas `exit 1` en cas d'échec. Ajoute des `exit`/`return` non-zéro pour que le code reflète le résultat.
:::

:::lang en
**`Permission denied` when running `./script.sh`.** The `+x` is missing: `chmod +x script.sh`. (Or run it via `bash script.sh`.)

**`command not found` although the script exists.** It's not in `PATH`: run it with a path (`./script.sh`) or add its folder to `PATH`.

**`syntax error near unexpected token`.** Often a misplaced `then`/`do`/`fi`/`done`, or missing spaces (`if[[` instead of `if [[`). Run the script through **ShellCheck**.

**`unary operator expected` with `[ ]`.** An unquoted empty variable: use `[[ ]]` or quote (`[ "$x" = "y" ]`).

**`var: command not found` on an assignment.** You put spaces: `var = 5` → write `var=5` (no spaces).

**The script "works" but always returns 0.** You don't `exit 1` on failure. Add non-zero `exit`/`return` so the code reflects the result.
:::