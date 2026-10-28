# Rejeu : linux-paquets
Verdict : ✅ faisable tel quel
Machine : Ubuntu 24.04 vierge (new-vm.sh, systemd PID 1, `la-paquets`) · Durée réelle : ~6 min d'exécution machine, lecture non comptée (annoncée 160) · Étapes rejouées : 6/6 (step-05 est un tableau de référence : collé tel quel pour vérifier qu'il n'a pas d'effet de bord)

Méthode : commandes lancées dans un vrai shell de connexion (`docker exec la-paquets su - etudiant -c '...'`). Prérequis `linux-fondamentaux` : rien à recréer (ce guide installe puis désinstalle `tree`, `dnsutils`/`curl` ne servent pas ici).

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-05 | mineur | Le tableau de correspondance est un bloc ```` ```bash ```` à deux colonnes : un étudiant qui le colle obtient une série d'erreurs, par ex. `sudo apt install paquet          sudo dnf install paquet` → `E: Unable to locate package paquet` / `E: Unable to locate package install` ; `apt update` sans sudo → `E: Could not open lock file /var/lib/apt/lists/lock - open (13: Permission denied)` ; `dpkg -L paquet rpm -ql paquet` → `error: --listfiles needs a valid package name but '-ql' is not`. Aucun effet de bord constaté (`sudo apt upgrade sudo dnf upgrade` s'arrête sur `E: Unable to locate package upgrade`), mais rien n'indique de ne pas l'exécuter, alors que tous les autres blocs bash du guide sont à taper. | Passer le bloc en ```` ```text ```` (ou ajouter avant le bloc, FR : « Tableau à lire, **pas à coller** : chaque ligne contient deux commandes. » ; EN : « A table to read, **not to paste**: each line holds two commands. »). |
| 2 | step-05 | mineur | Ligne `apt update                       # (dnf vérifie à chaque appel)`. Inexact : dnf ne rafraîchit ses métadonnées que lorsqu'elles ont expiré (`metadata_expire`, 48 h par défaut) ; l'équivalent explicite d'`apt update` est `dnf makecache` (ou `dnf check-update`). Constat de lecture (pas de RHEL dans le bac à sable). | `apt update                       # (dnf vérifie à chaque appel)    # rafraîchir l'index / refresh index` → `apt update                       dnf makecache                    # rafraîchir l'index (dnf le fait aussi seul à l'expiration du cache) / refresh index (dnf also does it when its cache expires)` |
| 3 | concepts | mineur | Bilingue incomplet : FR « `/etc/apt/sources.list.d/` (Ubuntu 24.04+ y place `ubuntu.sources` au format **deb822**) » ; la phrase EN correspondante s'arrête à « the `/etc/apt/sources.list.d/` folder. » sans la mention deb822. | EN : « and the `/etc/apt/sources.list.d/` folder. » → « and the `/etc/apt/sources.list.d/` folder (Ubuntu 24.04+ puts `ubuntu.sources` there, in **deb822** format). » |

Vérifications conformes à l'annonce :
- step-01 : `apt search '^tree$'` → `tree/noble-updates 2.1.1-2ubuntu3.24.04.2 amd64` ; `apt show tree` affiche version, `Installed-Size`, `Depends: libc6` ; `tree --version` → `tree v2.1.1`.
- step-02 : après `remove`, `dpkg -l nano | tail -1` → `rc  nano 7.2-2ubuntu0.2 …` et `/etc/nanorc` présent ; après `purge`, `ls: cannot access '/etc/nanorc'` et `dpkg-query: no packages found matching nano` ; réinstallation OK, l'alternative `editor` revient bien sur `/bin/nano` (pendant le retrait elle bascule sur `vim.basic`, sans conséquence ici). `nano` n'est qu'un `Recommends` de `ubuntu-standard`/`ubuntu-wsl` : son retrait n'emporte aucun métapaquet, `autoremove` ne retire rien.
- step-03 : `dpkg -S /usr/bin/tree` → `tree: /usr/bin/tree` (mot à mot), `dpkg -L tree` liste `/usr/bin/tree` et `/usr/share/man/man1/tree.1.gz`.
- step-04 : `ls /etc/apt/sources.list.d/` → `ubuntu.sources` ; le grep deb822 affiche `Types:/URIs:/Suites:` ; le grep `sources.list` n'affiche rien (fichier réduit à un commentaire sur 24.04, comme annoncé) ; `apt-mark showhold` → `tree`, puis `Canceled hold on tree.`
- step-06 : `build-essential` s'installe en ~15 s ; `gcc 13.3.0`, `GNU Make 4.3`.

## Non testable ici
- step-05 : partie `dnf`/`rpm` non exécutable (pas de RHEL/Fedora), conforme à l'annonce « référence d'examen » du guide.
- Toutes étapes : la ligne `WARNING: apt does not have a stable CLI interface. Use with caution in scripts.` vient de l'absence de TTY dans `docker exec` ; un étudiant dans un vrai terminal ne la voit pas.
- prerequisites : variantes WSL2 / Multipass non rejouables.

## QCM
- step-01 : OK
- step-02 : OK (vérifié : état `rc`, `/etc/nanorc` conservé après `remove`)
- step-03 : OK
- step-04 : OK
- step-05 : OK
- step-06 : OK

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Un tableau de référence n'est pas un bloc `bash`.** Une correspondance à deux colonnes (Debian ↔ RHEL) dans un bloc `bash` se colle et produit des erreurs : utiliser `text` ou un tableau Markdown.
