---
# — Identité (ne change JAMAIS une fois publié) —
id: git-fondamentaux
slug: git-fondamentaux
order: 2
status: published

# — Titres & accroches (bilingue) —
title_fr: "Git fondamentaux"
title_en: "Git fundamentals"
tagline_fr: "Du clone au workflow de pro."
tagline_en: "From clone to a professional workflow."

# — Métadonnées pédagogiques —
level: beginner
duration_min: 75
repo: "git/git"
last_review: "2026-06-19"

# — Relations de parcours (par id) —
prerequisites: [art-of-command-line]
next: [docker-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [graphe-de-commits, zones-de-git, branches-et-head, fusion-et-rebase, resolution-de-conflits, github-flow]
concepts_en: [commit-graph, git-areas, branches-and-head, merge-vs-rebase, conflict-resolution, github-flow]

# — Accès (embryon du freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Comprends vraiment Git — graphe de commits, branches, conflits — et adopte un workflow GitHub Flow de pro."
og_description_en: "Truly understand Git — commit graph, branches, conflicts — and adopt a professional GitHub Flow workflow."
---

## intro

:::lang fr
Git, c'est l'outil que tu vas utiliser **tous les jours** pour le reste de ta carrière tech. Et c'est aussi celui que **95 % des gens utilisent en mode magique** : copier-coller des commandes Stack Overflow, paniquer quand ça crashe.

Ce guide te donne le modèle mental correct **avant** les commandes. Une fois que tu vois Git comme un graphe de commits avec des pointeurs, tout devient simple. Avant ça, c'est de la sorcellerie.

On s'appuie sur `learnGitBranching`, un jeu interactif génial qui **dessine le graphe en temps réel**. On l'utilise ici comme terrain d'entraînement structuré, avant de passer à un vrai repo poussé sur GitHub.

**Pour qui c'est :** quelqu'un qui sait à peu près `git add`, `git commit`, `git push`, mais panique dès qu'il y a un conflit ou un mauvais commit à corriger.

**Quand ce n'est PAS le bon choix :**

- Tu as déjà 2+ ans de Git, tu fais du rebase interactif et tu résous des conflits sans transpirer — ce guide va t'ennuyer.
- Tu cherches un guide GitHub Actions / CI — c'est un autre sujet, il viendra plus tard dans le parcours.
:::

:::lang en
Git is the tool you'll use **every single day** for the rest of your tech career. It's also the one **95% of people use in magic mode**: copy-pasting Stack Overflow commands and panicking when things crash.

This guide gives you the correct mental model **before** the commands. Once you see Git as a commit graph with pointers, everything becomes simple. Until then, it's sorcery.

We lean on `learnGitBranching`, a brilliant interactive game that **draws the graph in real time**. We use it here as a structured training ground, before moving on to a real repo pushed to GitHub.

**Who it's for:** someone who roughly knows `git add`, `git commit`, `git push`, but panics as soon as there's a conflict or a bad commit to fix.

**When it's NOT the right choice:**

- You already have 2+ years of Git, do interactive rebases, and resolve conflicts without breaking a sweat — this guide will bore you.
- You're looking for a GitHub Actions / CI guide — that's another topic, coming later in the track.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Le **modèle mental** de Git : commits, branches, HEAD, remotes — et les quatre zones où vit ton code.
- Les opérations quotidiennes : clone, add, commit, push, pull, status, log.
- Les branches : créer, basculer, fusionner, supprimer.
- Les conflits : pourquoi ils arrivent, comment les résoudre, ne plus en avoir peur.
- `rebase` vs `merge` : quand utiliser quoi.
- Réparer tes bêtises : `reset`, `revert`, `reflog`.
- Un workflow propre type **GitHub Flow** pour collaborer.
:::

:::lang en
By the end of this guide, you'll know:

- Git's **mental model**: commits, branches, HEAD, remotes — and the four areas where your code lives.
- The daily operations: clone, add, commit, push, pull, status, log.
- Branches: create, switch, merge, delete.
- Conflicts: why they happen, how to resolve them, and how to stop fearing them.
- `rebase` vs `merge`: when to use which.
- Fixing your mistakes: `reset`, `revert`, `reflog`.
- A clean **GitHub Flow** workflow for collaborating.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Une aisance en **ligne de commande Linux** — si `cd`, `ls` et l'édition d'un fichier au terminal ne sont pas naturels, passe d'abord par le guide *L'art de la ligne de commande*.
- **Git installé** : `git --version` doit répondre. Sinon : `sudo apt install git` (ou l'équivalent de ta distribution).
- Un **compte GitHub** — gratuit, 2 minutes : https://github.com/signup
- Un **navigateur** pour learnGitBranching.

C'est tout. Pas besoin de connaître la moindre commande Git avancée : c'est justement l'objet du guide.
:::

:::lang en
You should have:

- Comfort with the **Linux command line** — if `cd`, `ls`, and editing a file in the terminal don't feel natural, go through *The Art of Command Line* guide first.
- **Git installed**: `git --version` must answer. If not: `sudo apt install git` (or your distribution's equivalent).
- A **GitHub account** — free, 2 minutes: https://github.com/signup
- A **browser** for learnGitBranching.

That's it. You don't need to know a single advanced Git command: that's exactly what this guide is for.
:::

## concepts

:::lang fr
Avant toute commande, intériorise ces quatre idées. **Toutes** les commandes Git manipulent ces quatre objets — si tu les comprends, tu déduis quasi toutes les commandes ; sinon, tu mémorises 40 incantations magiques.

**1. Un commit est un snapshot, pas un diff.** Chaque commit capture **l'état complet** du projet à un instant T, identifié par un hash (`a3f2c8`). Git optimise le stockage derrière (il ne garde que les changements), mais conceptuellement : snapshot.

**2. Une branche est juste un pointeur vers un commit.** Pas une copie du code. Juste un nom (`main`, `feature-x`) qui pointe vers un commit. Quand tu commits, le pointeur avance. C'est tout.

**3. HEAD est un pointeur vers « où tu es ».** Normalement, HEAD pointe vers une branche, qui pointe vers un commit. C'est la position de ta « tête de lecture ».

**4. Un dépôt distant (remote) est juste une autre copie du graphe.** `origin` est le nom usuel du remote sur GitHub. `git push` et `git pull` synchronisent ton graphe local avec le sien.

Ces objets vivent dans **quatre zones** que ton code traverse, toujours dans le même sens :
:::

:::lang en
Before any command, internalize these four ideas. **Every** Git command manipulates these four objects — understand them and you can derive nearly every command; skip them and you're memorizing 40 magic incantations.

**1. A commit is a snapshot, not a diff.** Each commit captures the project's **complete state** at a point in time, identified by a hash (`a3f2c8`). Git optimizes storage behind the scenes (it only keeps the changes), but conceptually: snapshot.

**2. A branch is just a pointer to a commit.** Not a copy of the code. Just a name (`main`, `feature-x`) pointing at a commit. When you commit, the pointer moves forward. That's all.

**3. HEAD is a pointer to "where you are".** Normally, HEAD points to a branch, which points to a commit. It's the position of your "playhead".

**4. A remote repository is just another copy of the graph.** `origin` is the usual name for the GitHub remote. `git push` and `git pull` synchronize your local graph with it.

These objects live in **four areas** your code moves through, always in the same direction:
:::

:::figure git-areas
caption_fr: "Schéma 1. Les zones de Git : répertoire de travail → staging → dépôt local → dépôt distant."
caption_en: "Figure 1. Git's areas: working directory → staging → local repository → remote."
:::

:::lang fr
**Points clés à retenir :**

- Le **répertoire de travail**, ce sont tes fichiers tels que tu les édites. Rien n'est encore enregistré par Git.
- Le **staging** (l'index) est ta zone de préparation : `git add` y sélectionne exactement ce qui entrera dans le prochain commit.
- Le **dépôt local** (`.git/`) contient tout l'historique — commits, branches, HEAD. Il est complet et fonctionne **sans réseau**.
- Le **dépôt distant** (`origin`) n'est qu'une copie du graphe, hébergée ailleurs. `git push` envoie tes commits, `git pull` récupère et fusionne ceux des autres.
:::

:::lang en
**Key takeaways:**

- The **working directory** is your files as you edit them. Nothing is recorded by Git yet.
- The **staging area** (the index) is your preparation zone: `git add` selects exactly what goes into the next commit.
- The **local repository** (`.git/`) holds the entire history — commits, branches, HEAD. It's complete and works **without a network**.
- The **remote repository** (`origin`) is just a copy of the graph, hosted elsewhere. `git push` sends your commits, `git pull` fetches and merges everyone else's.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Ancrer le modèle mental (30 min de lecture active) avant de taper la moindre commande.

**🤔 Pourquoi ?** Le parcours est en 3 temps — modèle mental (lecture), pratique (learnGitBranching), workflow réel (mains sur clavier) — et **l'ordre est non-négociable**. Sauter le modèle mental = continuer à galérer. Sauter la pratique = oublier dans 2 jours. Sauter le workflow réel = ne jamais l'utiliser pour de vrai.

Relis la section concepts ci-dessus, puis reformule chaque idée **avec tes propres mots** : un commit est un ___, une branche est un ___, HEAD pointe vers ___, un remote est ___.

**✅ Vérification :** tu peux réciter les 4 idées sans regarder, et tu sais dire dans quelle zone (répertoire de travail, staging, dépôt local, distant) se trouve un fichier après un `git add` (staging) et après un `git commit` (dépôt local).
:::

:::lang en
**Goal.** Anchor the mental model (30 min of active reading) before typing a single command.

**🤔 Why?** The track has 3 phases — mental model (reading), practice (learnGitBranching), real workflow (hands on keyboard) — and **the order is non-negotiable**. Skip the mental model = keep struggling. Skip the practice = forget it in 2 days. Skip the real workflow = never use it for real.

Re-read the concepts section above, then restate each idea **in your own words**: a commit is a ___, a branch is a ___, HEAD points to ___, a remote is ___.

**✅ Check:** you can recite the 4 ideas without looking, and you can say which area (working directory, staging, local repository, remote) a file is in after `git add` (staging) and after `git commit` (local repository).
:::

### step-02

:::lang fr
**Objectif.** Pratiquer sur learnGitBranching (2–3 h) pour *voir* le graphe bouger.

**🤔 Pourquoi ce jeu plutôt que de taper directement dans un terminal ?** Parce qu'il **dessine le graphe en temps réel**. Tu vois physiquement ce qui se passe quand tu rebase. Sur ton vrai terminal, le graphe est invisible et tu fais tout en aveugle. Les pros voient le graphe dans leur tête — ce jeu te l'apprend.

**Action :** va sur https://learngitbranching.js.org et fais les niveaux dans l'ordre :

1. **Introduction Sequence** (Main) — bases : commit, branche, merge, rebase.
2. **Ramping Up** — détacher HEAD, refs relatives, reset/revert.
3. **Moving Work Around** — cherry-pick, rebase interactif.
4. **Mixed Bag** + partie **Remote** — pushing & pulling.

**✅ Vérification :**

- [ ] Tu peux expliquer `git rebase` à un canard en plastique sans paniquer.
- [ ] Tu sais ce que fait `HEAD~3`.
- [ ] Tu comprends pourquoi `git reset --hard` est dangereux (⚠️ il **détruit** les modifications non commitées, sans corbeille).
:::

:::lang en
**Goal.** Practice on learnGitBranching (2–3 h) to *see* the graph move.

**🤔 Why this game rather than typing straight into a terminal?** Because it **draws the graph in real time**. You physically see what happens when you rebase. In your real terminal, the graph is invisible and you fly blind. Pros see the graph in their head — this game teaches you that.

**Action:** go to https://learngitbranching.js.org and play the levels in order:

1. **Introduction Sequence** (Main) — basics: commit, branch, merge, rebase.
2. **Ramping Up** — detached HEAD, relative refs, reset/revert.
3. **Moving Work Around** — cherry-pick, interactive rebase.
4. **Mixed Bag** + the **Remote** section — pushing & pulling.

**✅ Check:**

- [ ] You can explain `git rebase` to a rubber duck without panicking.
- [ ] You know what `HEAD~3` does.
- [ ] You understand why `git reset --hard` is dangerous (⚠️ it **destroys** uncommitted changes, with no trash bin).
:::

### step-03

:::lang fr
**Objectif.** Configurer Git la première fois — ton identité et ta branche par défaut.

**🤔 Pourquoi `--global` ?** Pour ne pas avoir à le refaire pour chaque repo : la config s'applique à tout ton utilisateur. Si tu veux une identité différente sur un projet pro vs perso, fais un `git config user.email ...` (sans `--global`) à la racine de ce projet — la config locale gagne sur la globale. Le nom et l'email sont **inscrits dans chaque commit** que tu crées ; sans eux, Git refuse de committer.
:::

:::lang en
**Goal.** Configure Git for the first time — your identity and default branch.

**🤔 Why `--global`?** So you don't redo it for every repo: the config applies to your whole user. If you want a different identity on a work vs personal project, run `git config user.email ...` (without `--global`) at that project's root — local config wins over global. Your name and email are **written into every commit** you create; without them, Git refuses to commit.
:::

```bash
git config --global user.name "Ton Nom"
git config --global user.email "ton@email.com"
git config --global init.defaultBranch main
```

:::lang fr
**✅ Vérification :**
:::

:::lang en
**✅ Check:**
:::

```bash
git config --global --list
# user.name, user.email et init.defaultbranch doivent apparaître
```

### step-04

:::lang fr
**Objectif.** Créer ton premier repo local et le pousser sur GitHub.

**🤔 Pourquoi ?** C'est le trajet complet du schéma 1 en vrai : fichier → staging (`git add`) → dépôt local (`git commit`) → dépôt distant (`git push`). Une fois ce circuit fait une fois de bout en bout, il n'a plus rien de magique.
:::

:::lang en
**Goal.** Create your first local repo and push it to GitHub.

**🤔 Why?** It's Figure 1's complete journey for real: file → staging (`git add`) → local repository (`git commit`) → remote (`git push`). Once you've done this circuit end-to-end a single time, it stops being magic.
:::

```bash
mkdir mon-premier-repo && cd mon-premier-repo
git init
echo "# Mon Premier Repo" > README.md
git add README.md
git commit -m "feat: premier commit"
```

:::lang fr
Maintenant, sur GitHub : crée un nouveau repo **vide** (pas de README auto — sinon les historiques divergent dès le départ). Copie l'URL, puis :
:::

:::lang en
Now, on GitHub: create a new **empty** repo (no auto README — otherwise the histories diverge from the start). Copy the URL, then:
:::

```bash
git remote add origin https://github.com/<toi>/mon-premier-repo.git
git branch -M main
git push -u origin main
```

:::lang fr
**🤔 Pourquoi `-u origin main` ?** Le `-u` (upstream) dit à Git : « à partir de maintenant, `main` local suit `main` sur `origin` ». Après ça, un simple `git push` ou `git pull` suffit, sans préciser quoi ni où.

**✅ Vérification :** rafraîchis la page de ton repo GitHub : ton `README.md` doit s'afficher. En local :

```bash
git status
# "Your branch is up to date with 'origin/main'"
```
:::

:::lang en
**🤔 Why `-u origin main`?** The `-u` (upstream) tells Git: "from now on, local `main` tracks `main` on `origin`". After that, a plain `git push` or `git pull` is enough, no need to spell out what or where.

**✅ Check:** refresh your GitHub repo page: your `README.md` must show up. Locally:

```bash
git status
# "Your branch is up to date with 'origin/main'"
```
:::

### step-05

:::lang fr
**Objectif.** Dérouler le workflow d'une vraie feature — le **GitHub Flow**.

**🤔 Pourquoi ce workflow ?** Une feature = une branche = une PR. Ça force la **revue de code** et garde `main` toujours propre et déployable. C'est **exactement** le workflow utilisé en entreprise dans 90 % des équipes modernes — l'apprendre maintenant, c'est arriver préparé.
:::

:::lang en
**Goal.** Run through a real feature's workflow — the **GitHub Flow**.

**🤔 Why this workflow?** One feature = one branch = one PR. It enforces **code review** and keeps `main` clean and deployable at all times. It's **exactly** the workflow used in 90% of modern teams — learn it now and you'll arrive prepared.
:::

```bash
# 1. Synchroniser / Sync up
git checkout main
git pull

# 2. Créer une branche dédiée / Create a dedicated branch
git checkout -b feature/ajout-licence

# 3. Faire ton travail / Do your work
echo "MIT License..." > LICENSE
git add LICENSE
git commit -m "feat: ajoute licence MIT"

# 4. Pousser la branche / Push the branch
git push -u origin feature/ajout-licence
```

:::lang fr
Va sur GitHub : un bouton **"Compare & pull request"** apparaît. Clique, ouvre la PR, merge-la.
:::

:::lang en
Go to GitHub: a **"Compare & pull request"** button appears. Click it, open the PR, merge it.
:::

```bash
# 5. Récupérer le merge en local et supprimer la branche
#    Bring the merge back locally and delete the branch
git checkout main
git pull
git branch -d feature/ajout-licence
```

:::lang fr
**✅ Vérification :** `git log --oneline --graph` montre le commit de merge sur `main`, et `git branch` ne liste plus `feature/ajout-licence`. Sur GitHub, la PR est marquée « Merged ».
:::

:::lang en
**✅ Check:** `git log --oneline --graph` shows the merge commit on `main`, and `git branch` no longer lists `feature/ajout-licence`. On GitHub, the PR is marked "Merged".
:::

## pitfalls

:::lang fr
**1. Tu commits sur `main` directement.** Sur ton repo perso, ça passe. En équipe : interdit. Habitude pro = toujours une branche, même pour un fix d'une ligne.

**2. Tu `git push --force` sans réfléchir.** ⚠️ **Commande destructive** : `--force` écrase l'historique distant. Si quelqu'un d'autre a tiré entre-temps, tu **détruis son travail** sans avertissement. Préfère `--force-with-lease`, qui vérifie avant d'écraser — et ne force jamais sur une branche partagée.

**3. Tu `git pull` au milieu d'un travail non commité et tu paniques.** Solution : `git stash` (range temporairement tes modifications), `git pull`, `git stash pop` (les récupère).

**4. Tu commits des secrets (clé API, mot de passe) sur GitHub.** Une fois pushé, c'est **public et indexé par des bots en quelques minutes**. Solution : `.gitignore` dès le départ + un fichier `.env` jamais commité. Si c'est déjà fait : **révoque la clé** — la supprimer du repo ne suffit pas, l'historique garde tout.

**5. Tu confonds `git reset` et `git revert`.** `reset` réécrit l'historique (⚠️ dangereux si déjà poussé, et `--hard` détruit aussi tes modifications locales sans retour) ; `revert` crée un nouveau commit qui annule l'ancien (safe pour les branches partagées).

**6. Messages de commit type « fix » ou « wip ».** Inutiles dans 6 mois quand tu fouilleras l'historique. Convention recommandée : **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`…).
:::

:::lang en
**1. You commit directly to `main`.** On your personal repo, fine. On a team: forbidden. The professional habit = always a branch, even for a one-line fix.

**2. You `git push --force` without thinking.** ⚠️ **Destructive command**: `--force` overwrites remote history. If someone else pulled in the meantime, you **destroy their work** without warning. Prefer `--force-with-lease`, which checks before overwriting — and never force-push a shared branch.

**3. You `git pull` in the middle of uncommitted work and panic.** Solution: `git stash` (tucks your changes away), `git pull`, `git stash pop` (brings them back).

**4. You commit secrets (API key, password) to GitHub.** Once pushed, it's **public and indexed by bots within minutes**. Solution: `.gitignore` from day one + a `.env` file that's never committed. If it already happened: **revoke the key** — deleting it from the repo isn't enough, history keeps everything.

**5. You confuse `git reset` and `git revert`.** `reset` rewrites history (⚠️ dangerous if already pushed, and `--hard` also destroys your local changes with no way back); `revert` creates a new commit that undoes the old one (safe for shared branches).

**6. Commit messages like "fix" or "wip".** Useless in 6 months when you dig through history. Recommended convention: **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`…).
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu sais ce que fait chaque commande de cette liste sans Google : `git status`, `git log --oneline --graph`, `git diff`, `git stash`, `git checkout -b`.
- [ ] Tu peux résoudre un conflit de merge sans paniquer.
- [ ] Tu peux annuler ton dernier commit sans rien casser (`git reset --soft HEAD~1`).
- [ ] Tu sais ce qu'est `git reflog` — et donc tu sais récupérer un commit « perdu ».
- [ ] Tu utilises une branche pour chaque feature, jamais `main` direct.
- [ ] Ta première PR est mergée sur GitHub, et `main` local est à jour.

Si les 6 sont cochés, Git n'est plus de la sorcellerie pour toi. Bravo.
:::

:::lang en
You know it works when…

- [ ] You know what each command on this list does without Google: `git status`, `git log --oneline --graph`, `git diff`, `git stash`, `git checkout -b`.
- [ ] You can resolve a merge conflict without panicking.
- [ ] You can undo your last commit without breaking anything (`git reset --soft HEAD~1`).
- [ ] You know what `git reflog` is — and therefore how to recover a "lost" commit.
- [ ] You use a branch for every feature, never `main` directly.
- [ ] Your first PR is merged on GitHub, and local `main` is up to date.

If all 6 are ticked, Git is no longer sorcery to you. Well done.
:::

## next

:::lang fr
Quatre prolongements naturels, du plus utile au plus avancé :

1. **Docker fondamentaux** — la suite logique de ton parcours DevOps : tu versionneras tes `Dockerfile` et `compose.yaml` avec le workflow que tu viens d'apprendre.
2. **GitHub Actions** — ton premier pipeline CI, quand tu auras quelques projets à tester automatiquement.
3. **Pro Git** (livre gratuit) — https://git-scm.com/book — la référence absolue pour approfondir.
4. **Conventional Commits + Semantic Release** — professionnaliser tes messages de commit et tes releases.
:::

:::lang en
Four natural extensions, from most useful to most advanced:

1. **Docker fundamentals** — the logical next step of your DevOps track: you'll version your `Dockerfile` and `compose.yaml` with the workflow you just learned.
2. **GitHub Actions** — your first CI pipeline, once you have a few projects to test automatically.
3. **Pro Git** (free book) — https://git-scm.com/book — the absolute reference for going deeper.
4. **Conventional Commits + Semantic Release** — professionalize your commit messages and releases.
:::

## cheatsheet

:::lang fr
Aide-mémoire des commandes clés pour ton quotidien Git.
:::

:::lang en
Key commands cheat sheet for your daily Git work.
:::

```bash
# Configuration initiale / First-time setup
git config --global user.name "Ton Nom"
git config --global user.email "ton@email.com"

# Quotidien / Daily
git status                          # où j'en suis / where am I
git log --oneline --graph --all     # voir le graphe / see the graph
git diff                            # modifs non stagées / unstaged changes
git add <fichier> && git commit -m "feat: message clair"
git push
git pull

# Branches (GitHub Flow)
git checkout -b feature/ma-feature  # créer + basculer / create + switch
git checkout main && git pull       # se resynchroniser / resync
git merge feature/ma-feature
git branch -d feature/ma-feature    # supprimer après merge / delete after merge

# Se sortir du pétrin / Getting unstuck
git stash && git pull && git stash pop   # ranger, tirer, récupérer / park, pull, restore
git reset --soft HEAD~1             # annule le dernier commit, GARDE les changements / undo last commit, KEEP changes
git revert <hash>                   # annule proprement un commit poussé / cleanly undo a pushed commit
git reflog                          # retrouver un commit "perdu" / find a "lost" commit
git merge --abort                   # abandonner un merge en conflit / abort a conflicted merge

# ⚠️ DESTRUCTIF — réfléchis avant / DESTRUCTIVE — think first
git reset --hard HEAD~1             # ⚠️ PERD tes modifs non commitées / LOSES uncommitted changes
git push --force-with-lease         # ⚠️ réécrit l'historique distant (jamais sur branche partagée)
                                    # ⚠️ rewrites remote history (never on a shared branch)
```

## resources

:::lang fr
- [Pro Git (livre officiel, gratuit)](https://git-scm.com/book/fr/v2) — la référence absolue, disponible en français.
- [Référence des commandes Git](https://git-scm.com/docs) — la documentation officielle de chaque commande.
- [learnGitBranching](https://learngitbranching.js.org) — le jeu interactif utilisé dans ce guide.
- [GitHub Flow (doc officielle GitHub)](https://docs.github.com/en/get-started/using-github/github-flow) — le workflow enseigné à l'étape 5.
- [Conventional Commits](https://www.conventionalcommits.org/fr/) — la spécification des messages de commit propres.
:::

:::lang en
- [Pro Git (official book, free)](https://git-scm.com/book/en/v2) — the absolute reference.
- [Git command reference](https://git-scm.com/docs) — the official documentation for every command.
- [learnGitBranching](https://learngitbranching.js.org) — the interactive game used in this guide.
- [GitHub Flow (official GitHub docs)](https://docs.github.com/en/get-started/using-github/github-flow) — the workflow taught in step 5.
- [Conventional Commits](https://www.conventionalcommits.org/en/) — the clean commit message specification.
:::

## troubleshooting

:::lang fr
**« fatal: not a git repository ».** Tu n'es pas dans un dossier qui contient un `.git/`. Soit tu n'es pas au bon endroit (`pwd`), soit tu as oublié `git init`.

**« Please tell me who you are ».** Tu n'as pas configuré ton `user.name` et `user.email`. Refais l'étape 3 (`git config --global …`).

**Conflit de merge — je panique.** Respire. `git status` te montre les fichiers en conflit. Ouvre-les, cherche les marqueurs `<<<<<<<`, `=======`, `>>>>>>>`. Choisis quoi garder, supprime les marqueurs, puis `git add <fichier>` et `git commit`. C'est tout. Et tu peux toujours tout annuler avec `git merge --abort`.

**J'ai commité un fichier que je ne voulais pas.** Si pas encore pushé : `git reset HEAD~1` (garde tes changements dans le répertoire de travail). Si pushé : `git revert <hash>` (crée un commit qui annule). Si c'est un **secret** : révoque-le, change-le, puis purge l'historique avec `git filter-repo` ou BFG — ⚠️ ces outils **réécrivent l'historique** : préviens tes collaborateurs et sauvegarde le repo avant.
:::

:::lang en
**"fatal: not a git repository".** You're not in a folder containing a `.git/`. Either you're in the wrong place (`pwd`), or you forgot `git init`.

**"Please tell me who you are".** You haven't configured your `user.name` and `user.email`. Redo step 3 (`git config --global …`).

**Merge conflict — I'm panicking.** Breathe. `git status` shows the conflicted files. Open them, look for the `<<<<<<<`, `=======`, `>>>>>>>` markers. Choose what to keep, delete the markers, then `git add <file>` and `git commit`. That's it. And you can always back out with `git merge --abort`.

**I committed a file I didn't mean to.** If not pushed yet: `git reset HEAD~1` (keeps your changes in the working directory). If pushed: `git revert <hash>` (creates an undo commit). If it's a **secret**: revoke it, rotate it, then purge history with `git filter-repo` or BFG — ⚠️ these tools **rewrite history**: warn your collaborators and back up the repo first.
:::
