---
# — Identité (ne change JAMAIS une fois publié) —
id: art-of-command-line
slug: art-of-command-line
order: 1
status: published

# — Titres & accroches (bilingue) —
title_fr: "L'Art de la ligne de commande"
title_en: "The Art of the Command Line"
tagline_fr: "Bouger, inspecter, manipuler du texte, investiguer."
tagline_en: "Move, inspect, manipulate text, investigate."

# — Métadonnées pédagogiques —
level: beginner
duration_min: 90
last_review: "2026-06-19"

# — Relations de parcours (par id) —
prerequisites: []
next: [git-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [pipes, redirections, codes-de-sortie, permissions-unix, variables-environnement, expansion-shell]
concepts_en: [pipes, redirections, exit-codes, unix-permissions, environment-variables, shell-expansion]

# — Accès (embryon du freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Un parcours structuré en 4 paliers pour maîtriser la CLI Linux à partir du repo the-art-of-command-line."
og_description_en: "A structured 4-tier path to master the Linux CLI, built on the art-of-command-line repo."
---

## intro

:::lang fr
Le repo `jlevy/the-art-of-command-line` est une **mine d'or** : environ 150 astuces concentrées, validées par des milliers de pros. Mais c'est aussi un **mur de texte sans parcours**. Si tu débutes, tu ouvres la page, tu vois 200+ commandes balancées d'un coup, tu refermes l'onglet. Dommage : le contenu est excellent.

Ce guide te donne **un parcours**. Tu ne liras pas tout — tu liras *le bon ordre, à la bonne dose, avec des objectifs vérifiables*, en 4 paliers : survivre, naviguer, comprendre, investiguer.

**Pour qui c'est :** quelqu'un qui va passer le reste de sa vie à taper des commandes (ops, sysadmin, dev backend, homelabber) et veut poser les fondations sans douleur. C'est le **niveau 0** du parcours : tout le reste (Docker, Git, SSH avancé) part d'ici.

**Quand ce n'est PAS le bon choix :**

- Tu cherches un cours pas-à-pas façon vidéo YouTube — préfère « Linux Journey » ou une chaîne vidéo dédiée.
- Tu veux apprendre le Bash scripting en profondeur — ce guide effleure, il ne plonge pas.
- Tu es déjà confortable en CLI depuis 5+ ans — tu n'apprendras quasi rien ici.

Si l'un des trois te concerne, passe ton chemin sans culpabiliser : ce guide n'est pas fait pour toi, et c'est très bien.
:::

:::lang en
The `jlevy/the-art-of-command-line` repo is a **gold mine**: roughly 150 concentrated tips, validated by thousands of professionals. But it's also a **wall of text with no path through it**. If you're a beginner, you open the page, see 200+ commands dumped at once, and close the tab. A shame — the content is excellent.

This guide gives you **a path**. You won't read everything — you'll read *the right order, at the right dose, with verifiable goals*, across 4 tiers: survive, navigate, understand, investigate.

**Who it's for:** someone who will spend the rest of their life typing commands (ops, sysadmin, backend dev, homelabber) and wants to lay the foundations painlessly. This is **level 0** of the learning path: everything else (Docker, Git, advanced SSH) starts here.

**When it's NOT the right choice:**

- You want a step-by-step video-style course — go for "Linux Journey" or a dedicated video channel instead.
- You want to learn Bash scripting in depth — this guide skims the surface, it doesn't dive.
- You've been comfortable on the CLI for 5+ years — you'll learn almost nothing here.

If any of those apply, skip this guide guilt-free: it isn't for you, and that's perfectly fine.
:::

## objectives

:::lang fr
À la fin de ce parcours, tu sauras :

- **Naviguer** dans un système Linux sans souris (et plus vite qu'avec).
- **Inspecter** un fichier, un process, un disque, une connexion réseau.
- **Combiner** des commandes via pipes (`|`) — la vraie philosophie Unix.
- **Manipuler du texte** comme un pro (`grep`, `sed`, `awk` au niveau utile).
- **Gérer les permissions** sans faire de `chmod 777` partout (anti-pattern n°1).
- Connaître les bases pour la suite : **redirections, codes de sortie, processus, variables d'environnement, expansion shell**.
:::

:::lang en
By the end of this path, you'll know how to:

- **Navigate** a Linux system without a mouse (and faster than with one).
- **Inspect** a file, a process, a disk, a network connection.
- **Combine** commands with pipes (`|`) — the real Unix philosophy.
- **Manipulate text** like a pro (`grep`, `sed`, `awk` at the useful level).
- **Manage permissions** without slapping `chmod 777` everywhere (anti-pattern #1).
- Master the basics you'll need later: **redirections, exit codes, processes, environment variables, shell expansion**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Un **terminal accessible** : Linux natif, macOS, ou WSL2 sur Windows. Si tu n'en as pas → installe Ubuntu via WSL2 (10 minutes, Microsoft Store).
- Un **éditeur texte** que tu sais ouvrir et fermer — `nano` suffit, il est installé partout, on commencera avec ça.
- **Une heure libre** pour démarrer, et la patience d'expérimenter.

**Pourquoi pas de prérequis technique fort ?** Ce guide est le **niveau 0** de ton parcours. Tout part d'ici — aucun autre guide n'est requis avant.
:::

:::lang en
You need:

- An **accessible terminal**: native Linux, macOS, or WSL2 on Windows. If you don't have one → install Ubuntu through WSL2 (10 minutes, Microsoft Store).
- A **text editor** you know how to open and close — `nano` is enough, it's installed everywhere, and that's what we'll start with.
- **One free hour** to get going, plus the patience to experiment.

**Why no serious technical prerequisite?** This guide is **level 0** of your learning path. Everything starts here — no other guide is required first.
:::

## concepts

:::lang fr
Le shell repose sur une idée simple et géniale : **tout est flux de texte**. Chaque commande lit une entrée (`stdin`), écrit une sortie (`stdout`), et signale ses erreurs sur un canal séparé (`stderr`). Comme ces flux sont standardisés, tu peux **brancher la sortie d'une commande sur l'entrée de la suivante** avec un pipe (`|`), ou la détourner vers un fichier avec une redirection (`>`, `>>`, `2>`).

C'est la philosophie Unix : des petits outils qui font une seule chose bien, que tu composes en pipelines.
:::

:::lang en
The shell rests on one simple, brilliant idea: **everything is a text stream**. Every command reads an input (`stdin`), writes an output (`stdout`), and reports errors on a separate channel (`stderr`). Because these streams are standardized, you can **plug one command's output into the next command's input** with a pipe (`|`), or divert it to a file with a redirection (`>`, `>>`, `2>`).

That's the Unix philosophy: small tools that each do one thing well, composed into pipelines.
:::

:::figure cli-pipeline
caption_fr: "Schéma 1. Anatomie d'un pipeline shell : stdin → commandes → stdout, redirections et pipes."
caption_en: "Figure 1. Anatomy of a shell pipeline: stdin → commands → stdout, redirections and pipes."
:::

:::lang fr
**Points clés à retenir :**

- **`stdin` / `stdout` / `stderr`** : trois flux par commande. Le pipe ne transmet que `stdout` ; `stderr` continue vers ton écran (sauf si tu le rediriges avec `2>`).
- **`>` écrase, `>>` ajoute.** Confondre les deux vide un fichier — on y revient dans les pièges.
- **Code de sortie** : chaque commande se termine avec un nombre (`0` = succès, autre = erreur). `echo $?` l'affiche ; `&&` et `||` s'en servent pour enchaîner.
- **L'expansion shell** (`*`, `{1..10}`, `$VAR`) est faite **par le shell avant** de lancer la commande — la commande ne voit jamais le `*`, elle reçoit la liste des fichiers.
- **Le parcours** : le repo est découpé en sections (Basics, Everyday use, Processing files and data, System debugging…). On ne le lit **pas** dans l'ordre — on suit 4 paliers, chacun débloquant le suivant. À chaque palier : lire la section, **tester chaque commande dans ton terminal**, faire le mini-défi.
:::

:::lang en
**Key takeaways:**

- **`stdin` / `stdout` / `stderr`**: three streams per command. A pipe only carries `stdout`; `stderr` keeps going to your screen (unless you redirect it with `2>`).
- **`>` overwrites, `>>` appends.** Mixing them up empties a file — more on that in the pitfalls.
- **Exit code**: every command finishes with a number (`0` = success, anything else = error). `echo $?` shows it; `&&` and `||` use it to chain commands.
- **Shell expansion** (`*`, `{1..10}`, `$VAR`) happens **in the shell, before** the command runs — the command never sees the `*`, it receives the expanded file list.
- **The path**: the repo is split into sections (Basics, Everyday use, Processing files and data, System debugging…). We do **not** read it in order — we follow 4 tiers, each unlocking the next. At every tier: read the section, **try every command in your terminal**, do the mini-challenge.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Palier 1 — Survivre. Lis la section « Basics » du repo en testant chaque commande dans ton terminal.

**🤔 Pourquoi ?** Tu sors d'ici avec l'essentiel vital : savoir où tu es (`pwd`), bouger (`cd`), voir (`ls`), créer/supprimer (`mkdir`, `touch`, `rm`), lire (`cat`, `less`), copier/déplacer (`cp`, `mv`). C'est **20 % des commandes que tu utiliseras 80 % du temps**.

**Mini-défi (sans regarder la doc)** : crée un dossier `~/playground` et va dedans ; crée 3 fichiers vides `a.txt`, `b.txt`, `c.txt` ; copie `a.txt` en `a-copie.txt` ; renomme `b.txt` en `important.txt` ; supprime `c.txt` ; liste le contenu avec les détails (taille, dates, permissions).

⚠️ `rm` supprime **définitivement** — pas de corbeille en CLI. Ici on ne touche qu'à des fichiers vides créés dans `~/playground`, c'est le but de ce bac à sable.

Solution (à ne regarder qu'après avoir essayé) :
:::

:::lang en
**Goal.** Tier 1 — Survive. Read the repo's "Basics" section, trying every command in your terminal.

**🤔 Why?** You walk away with the vital essentials: knowing where you are (`pwd`), moving (`cd`), seeing (`ls`), creating/deleting (`mkdir`, `touch`, `rm`), reading (`cat`, `less`), copying/moving (`cp`, `mv`). That's **the 20% of commands you'll use 80% of the time**.

**Mini-challenge (no docs allowed):** create a `~/playground` folder and enter it; create 3 empty files `a.txt`, `b.txt`, `c.txt`; copy `a.txt` to `a-copie.txt`; rename `b.txt` to `important.txt`; delete `c.txt`; list the contents with details (size, dates, permissions).

⚠️ `rm` deletes **permanently** — there is no trash bin on the CLI. Here we only touch empty files created inside `~/playground`; that's what this sandbox is for.

Solution (only look after you've tried):
:::

```bash
mkdir -p ~/playground && cd ~/playground
touch a.txt b.txt c.txt
cp a.txt a-copie.txt
mv b.txt important.txt
rm c.txt            # suppression définitive / permanent deletion
ls -la
```

:::lang fr
**✅ Vérification :** tu réussis les 6 actions en moins de 2 minutes, sans Google. `ls -la` montre `a.txt`, `a-copie.txt`, `important.txt` — et plus de `c.txt`. Palier validé.
:::

:::lang en
**✅ Check:** you complete all 6 actions in under 2 minutes, without Google. `ls -la` shows `a.txt`, `a-copie.txt`, `important.txt` — and no more `c.txt`. Tier cleared.
:::

### step-02

:::lang fr
**Objectif.** Palier 2 — Naviguer. Lis la section « Everyday use » du repo, en te concentrant sur quatre sujets : l'historique (`↑`, `!!`, `!$`, `Ctrl-R`), le globbing (`*`, `?`, `[abc]`, `{a,b,c}`), les raccourcis clavier (`Ctrl-A`, `Ctrl-E`, `Ctrl-W`, `Ctrl-U`), et les redirections (`>`, `>>`, `2>`, `2>&1`, `|`).

**🤔 Pourquoi ces 4 sujets en priorité ?**

- L'historique te fait taper 10× moins.
- Le globbing te fait traiter 100 fichiers comme 1.
- Les raccourcis te font éditer ta ligne sans souris ni flèches.
- Les redirections t'ouvrent la philosophie Unix : composer des petits outils.

**Mini-défi** : liste tous les fichiers `.log` de `/var/log/` en redirigeant les erreurs de permission vers `/dev/null` ; affiche les 5 dernières lignes de ton historique ; crée 10 fichiers `test1.txt` à `test10.txt` en une seule commande ; retrouve une commande tapée plus tôt avec `Ctrl-R`.

Solution :
:::

:::lang en
**Goal.** Tier 2 — Navigate. Read the repo's "Everyday use" section, focusing on four topics: history (`↑`, `!!`, `!$`, `Ctrl-R`), globbing (`*`, `?`, `[abc]`, `{a,b,c}`), keyboard shortcuts (`Ctrl-A`, `Ctrl-E`, `Ctrl-W`, `Ctrl-U`), and redirections (`>`, `>>`, `2>`, `2>&1`, `|`).

**🤔 Why these 4 topics first?**

- History makes you type 10× less.
- Globbing lets you treat 100 files as 1.
- Shortcuts let you edit your line without mouse or arrow keys.
- Redirections open up the Unix philosophy: composing small tools.

**Mini-challenge:** list every `.log` file in `/var/log/` while redirecting permission errors to `/dev/null`; show the last 5 lines of your history; create 10 files `test1.txt` through `test10.txt` in a single command; find an earlier command with `Ctrl-R`.

Solution:
:::

```bash
ls /var/log/*.log 2>/dev/null
tail -n 5 ~/.bash_history
cd ~/playground && touch test{1..10}.txt
# Ctrl-R puis tape un fragment / then type a fragment, Enter pour exécuter / to run
```

:::lang fr
**✅ Vérification :** le `ls` n'affiche **aucune** erreur « Permission denied » (elles partent dans `/dev/null`), `ls test*.txt` montre exactement 10 fichiers, et `Ctrl-R` te retrouve une vieille commande en 3 frappes.
:::

:::lang en
**✅ Check:** the `ls` shows **no** "Permission denied" error (they go to `/dev/null`), `ls test*.txt` shows exactly 10 files, and `Ctrl-R` finds an old command of yours in 3 keystrokes.
:::

### step-03

:::lang fr
**Objectif.** Palier 3 — Comprendre (texte + données). Lis « Processing files and data » puis « One-liners ».

**🤔 Pourquoi ce palier change ta vie ?** La majorité du travail en ops/dev consiste à **fouiller dans des logs, des fichiers de config, du JSON, du CSV**. Sans `grep`/`sed`/`awk`/`jq`, tu fais ça à la main = tu meurs. Avec ces outils, ce qui prendrait 2 h prend 30 secondes.

Focalise sur : `grep` (recherche + regex de base), `sed` (juste `s/old/new/g` et `-i`), `awk` (juste `awk '{print $N}'` et les filtres simples), le pattern « top N » `sort | uniq -c | sort -rn`, et `jq` (parser du JSON).

**Mini-défi** : combien de lignes de `/etc/passwd` contiennent `bash` ? Affiche uniquement le nom d'utilisateur (1ʳᵉ colonne) de chaque ligne. Quels sont les 5 shells les plus utilisés sur ton système (dernière colonne) ? Bonus : récupère le profil GitHub de Torvalds via `curl` et extrais le champ `public_repos` avec `jq`.

Solution :
:::

:::lang en
**Goal.** Tier 3 — Understand (text + data). Read "Processing files and data" then "One-liners".

**🤔 Why does this tier change your life?** Most ops/dev work is **digging through logs, config files, JSON, CSV**. Without `grep`/`sed`/`awk`/`jq`, you do it by hand = you die. With these tools, what would take 2 hours takes 30 seconds.

Focus on: `grep` (search + basic regex), `sed` (just `s/old/new/g` and `-i`), `awk` (just `awk '{print $N}'` and simple filters), the "top N" pattern `sort | uniq -c | sort -rn`, and `jq` (parsing JSON).

**Mini-challenge:** how many lines of `/etc/passwd` contain `bash`? Print only the username (1st column) of each line. What are the 5 most-used shells on your system (last column)? Bonus: fetch Torvalds' GitHub profile with `curl` and extract the `public_repos` field with `jq`.

Solution:
:::

```bash
grep -c bash /etc/passwd
awk -F: '{print $1}' /etc/passwd
awk -F: '{print $NF}' /etc/passwd | sort | uniq -c | sort -rn | head -5
curl -s https://api.github.com/users/torvalds | jq .public_repos
```

:::lang fr
**✅ Vérification :** chaque one-liner rend un résultat plausible (des nombres, des noms d'utilisateurs, un classement de shells), et surtout : tu sais **expliquer chaque segment** du pipeline `sort | uniq -c | sort -rn | head -5` à voix haute. Si `jq` manque : `sudo apt install jq` (Debian/Ubuntu).
:::

:::lang en
**✅ Check:** every one-liner returns a plausible result (numbers, usernames, a shell ranking), and above all: you can **explain each segment** of the `sort | uniq -c | sort -rn | head -5` pipeline out loud. If `jq` is missing: `sudo apt install jq` (Debian/Ubuntu).
:::

### step-04

:::lang fr
**Objectif.** Palier 4 — Investiguer. Lis « System debugging ».

**🤔 Pourquoi c'est essentiel pour la suite ?** Tous les guides self-hosting de cette plateforme te feront installer des services qui parfois cassent. Savoir investiguer (`ps`, `top`/`htop`, `df`, `du`, `lsof`, `journalctl`, `dmesg`) c'est la différence entre « ça marche pas, j'abandonne » et « OK, je vois ce qui se passe ».

**Mini-défi** : quel process consomme le plus de RAM sur ta machine ? Quel pourcentage de ton disque `/` est utilisé ? Quel est le dossier le plus volumineux dans ton `$HOME` ? Quel port utilise le service SSH ?

Solution :
:::

:::lang en
**Goal.** Tier 4 — Investigate. Read "System debugging".

**🤔 Why is this essential for what comes next?** Every self-hosting guide on this platform will have you install services that sometimes break. Knowing how to investigate (`ps`, `top`/`htop`, `df`, `du`, `lsof`, `journalctl`, `dmesg`) is the difference between "it doesn't work, I give up" and "OK, I can see what's going on".

**Mini-challenge:** which process eats the most RAM on your machine? What percentage of your `/` disk is used? What's the biggest folder in your `$HOME`? Which port does the SSH service use?

Solution:
:::

```bash
ps aux --sort=-%mem | head -5
df -h /
du -sh ~/*/ 2>/dev/null | sort -rh | head -1
sudo ss -tlnp | grep sshd    # ou / or: grep -i port /etc/ssh/sshd_config
```

:::lang fr
**✅ Vérification :** tu réponds aux 4 questions avec des valeurs concrètes (un nom de process, un pourcentage, un dossier, un numéro de port — 22 par défaut). Bonus : tu comprends pourquoi le `2>/dev/null` évite le bruit des dossiers non lisibles.
:::

:::lang en
**✅ Check:** you answer all 4 questions with concrete values (a process name, a percentage, a folder, a port number — 22 by default). Bonus: you understand why `2>/dev/null` silences the noise from unreadable folders.
:::

## pitfalls

:::lang fr
**1. Le « fear of the unknown » qui te fait copier-coller sans comprendre.** La pire habitude possible. Avant d'exécuter une commande trouvée sur Stack Overflow, surtout avec `sudo`, **lis chaque flag**. `man <commande>` est ton ami. `tldr <commande>` aussi (plus court).

**2. `chmod 777` « pour que ça marche ».** Anti-pattern n°1 des débutants. Donner tous les droits à tout le monde résout 0 problème et en crée 10. Apprends la triade `u/g/o` + `rwx`. C'est 10 minutes d'investissement.

**3. `rm -rf` mal placé.** ⚠️ Commande destructive, irréversible. Tape **toujours** `pwd` avant un `rm -rf`, et méfie-toi des variables vides : Steam Linux, en 2015, a exécuté `rm -rf "$STEAMROOT/"*` avec `STEAMROOT` vide → effacement de la home complète d'utilisateurs.

**4. Confondre `>` et `>>`.** `>` écrase, `>>` ajoute à la fin. Faire `>` sur un fichier de config existant le **vide**. Toujours vérifier avant.

**5. Coller du texte multiligne contenant des retours à la ligne.** Le shell interprète chaque newline comme un « Entrée ». Si tu copies 5 lignes depuis un site web et que l'une contient un `rm -rf /` déguisé, elle s'exécute **avant** que tu puisses paniquer. Habitude pro : coller dans un éditeur d'abord, lire, puis exécuter ligne par ligne.
:::

:::lang en
**1. The "fear of the unknown" that makes you copy-paste without understanding.** The worst possible habit. Before running a command found on Stack Overflow, especially with `sudo`, **read every flag**. `man <command>` is your friend. So is `tldr <command>` (shorter).

**2. `chmod 777` "so it works".** Beginner anti-pattern #1. Giving everyone every right solves 0 problems and creates 10. Learn the `u/g/o` + `rwx` triad. It's a 10-minute investment.

**3. A misplaced `rm -rf`.** ⚠️ Destructive, irreversible command. **Always** type `pwd` before an `rm -rf`, and beware of empty variables: in 2015, Steam for Linux ran `rm -rf "$STEAMROOT/"*` with `STEAMROOT` empty → users' entire home directories wiped.

**4. Mixing up `>` and `>>`.** `>` overwrites, `>>` appends. Running `>` on an existing config file **empties it**. Always double-check first.

**5. Pasting multi-line text containing newlines.** The shell treats each newline as an "Enter". If you copy 5 lines from a website and one hides an `rm -rf /`, it runs **before** you can panic. Pro habit: paste into an editor first, read, then run line by line.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu ouvres un terminal sans réfléchir, comme tu ouvres un navigateur.
- [ ] Tu utilises `Ctrl-R` plus souvent que la flèche du haut.
- [ ] Tu sais ce que fait `cat file.txt | grep error | wc -l` rien qu'en le lisant.
- [ ] Tu lis `man <cmd>` au lieu de Googler à chaque doute.
- [ ] Tu as un `~/.bashrc` (ou `.zshrc`) personnalisé avec 2-3 alias à toi.

Si les 5 sont cochés, tu es prêt pour Docker, Git, SSH avancé, et tout le reste.
:::

:::lang en
You know it works when…

- [ ] You open a terminal without thinking, the way you open a browser.
- [ ] You use `Ctrl-R` more often than the up arrow.
- [ ] You know what `cat file.txt | grep error | wc -l` does just by reading it.
- [ ] You read `man <cmd>` instead of Googling every doubt.
- [ ] You have a customized `~/.bashrc` (or `.zshrc`) with 2-3 aliases of your own.

If all 5 are ticked, you're ready for Docker, Git, advanced SSH, and everything else.
:::

## next

:::lang fr
Quatre prolongements naturels, du plus urgent au plus confort :

1. **Git fondamentaux** — versionning, branches, collaboration : la suite officielle de ce guide.
2. **SSH & serveurs distants** — se connecter, copier (`scp`, `rsync`), travailler à distance.
3. **Bash scripting** — écrire tes premiers scripts utiles (sauvegarde, alerting, batch).
4. **`tmux`** — sessions terminal persistantes, indispensable dès que tu bosses en SSH.
:::

:::lang en
Four natural extensions, from most urgent to most comfortable:

1. **Git fundamentals** — versioning, branches, collaboration: the official follow-up to this guide.
2. **SSH & remote servers** — connecting, copying (`scp`, `rsync`), working remotely.
3. **Bash scripting** — writing your first useful scripts (backup, alerting, batch jobs).
4. **`tmux`** — persistent terminal sessions, indispensable once you work over SSH.
:::

## cheatsheet

:::lang fr
Aide-mémoire des commandes et raccourcis clés du parcours.
:::

:::lang en
Quick reference of the path's key commands and shortcuts.
:::

```bash
# Bouger & voir / Move & see
pwd                         # où suis-je / where am I
cd <dir> ; cd - ; cd        # aller / revenir / home
ls -la                      # tout, avec détails / everything, detailed

# Créer, copier, supprimer / Create, copy, delete
mkdir -p a/b/c              # dossiers imbriqués / nested dirs
cp src dst ; mv src dst     # copier / déplacer-renommer
rm fichier                  # ⚠️ définitif / permanent — pwd d'abord / pwd first

# Lire / Read
cat f ; less f ; head -n 20 f ; tail -f f

# Historique & édition / History & editing
Ctrl-R                      # recherche dans l'historique / history search
!! ; !$                     # dernière commande / dernier argument — last cmd / last arg
Ctrl-A / Ctrl-E / Ctrl-W / Ctrl-U

# Redirections & pipes
cmd > f                     # écrase / overwrite
cmd >> f                    # ajoute / append
cmd 2> f ; cmd 2>&1         # stderr
cmd1 | cmd2                 # pipe

# Texte / Text
grep -rn "motif" .          # chercher / search
sed 's/old/new/g' f         # remplacer / replace
awk -F: '{print $1}' f      # colonne / column
sort | uniq -c | sort -rn | head -5   # top N

# Investiguer / Investigate
ps aux --sort=-%mem | head  # RAM
df -h ; du -sh */           # disque / disk
ss -tlnp                    # ports ouverts / open ports
echo $?                     # code de sortie / exit code
```

## resources

:::lang fr
- [jlevy/the-art-of-command-line](https://github.com/jlevy/the-art-of-command-line) — le repo de référence de ce parcours (existe aussi en français).
- [MIT — The Missing Semester](https://missing.csail.mit.edu) — cours universitaire gratuit, excellent complément.
- [tldr pages](https://tldr.sh) — versions courtes et pratiques des `man`.
- [explainshell.com](https://explainshell.com) — colle une commande complexe, chaque bout t'est expliqué.
:::

:::lang en
- [jlevy/the-art-of-command-line](https://github.com/jlevy/the-art-of-command-line) — this path's reference repo (also available in several languages).
- [MIT — The Missing Semester](https://missing.csail.mit.edu) — free university course, an excellent complement.
- [tldr pages](https://tldr.sh) — short, practical versions of `man` pages.
- [explainshell.com](https://explainshell.com) — paste a complex command, every piece gets explained.
:::

## troubleshooting

:::lang fr
**« Permission denied » sur quasi tout.** Tu touches probablement un fichier qui ne t'appartient pas. Tape `ls -la` pour voir les permissions. Soit le fichier est à toi (modifie les perms avec `chmod`), soit c'est un fichier système (utilise `sudo` — en comprenant ce que tu fais).

**« Command not found » sur une commande « standard ».** Soit le paquet n'est pas installé (`sudo apt install <paquet>` sur Debian/Ubuntu), soit il n'est pas dans ton `$PATH`. Vérifie avec `echo $PATH`.

**Tu es bloqué dans `vim` et tu ne peux plus sortir.** Classique. Appuie sur `Échap`, puis tape `:q!` puis `Entrée`. Pour t'éviter ça, mets `nano` en éditeur par défaut : `export EDITOR=nano` dans ton `.bashrc`.

**Ton terminal semble gelé, plus rien ne répond.** Tu as sans doute tapé `Ctrl-S` (gel de l'affichage, vieux mécanisme de contrôle de flux). Tape `Ctrl-Q` pour dégeler. Si tu es coincé dans `less` ou `man`, la touche `q` te fait sortir.
:::

:::lang en
**"Permission denied" on almost everything.** You're probably touching a file you don't own. Run `ls -la` to see the permissions. Either the file is yours (fix the perms with `chmod`), or it's a system file (use `sudo` — understanding what you're doing).

**"Command not found" on a "standard" command.** Either the package isn't installed (`sudo apt install <package>` on Debian/Ubuntu), or it isn't in your `$PATH`. Check with `echo $PATH`.

**You're stuck in `vim` and can't get out.** A classic. Press `Esc`, then type `:q!` then `Enter`. To avoid it entirely, set `nano` as your default editor: `export EDITOR=nano` in your `.bashrc`.

**Your terminal seems frozen, nothing responds.** You probably hit `Ctrl-S` (display freeze, an old flow-control mechanism). Hit `Ctrl-Q` to unfreeze. If you're stuck in `less` or `man`, the `q` key gets you out.
:::
