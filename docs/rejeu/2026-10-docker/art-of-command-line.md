# Rejeu : art-of-command-line
Verdict : ⚠️ faisable avec contournements
Machine : Ubuntu 24.04 vierge (ra-aocl) · Durée réelle : ~6 min d'exécution des solutions, hors lecture du repo jlevy (annoncée 90) · Étapes rejouées : 4/4

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-02 | majeur | `tail -n 5 ~/.bash_history` → `tail: cannot open '/home/etudiant/.bash_history' for reading: No such file or directory` (rc=1). Bash n'écrit l'historique qu'à la fermeture du shell : sur une machine neuve le fichier n'existe pas, et ensuite il ne contient jamais les commandes de la session en cours. Premier échec du tout premier guide gratuit. | Bloc de code : `tail -n 5 ~/.bash_history` → `history 5` (et dans le texte FR/EN, ajouter : « `~/.bash_history` n'est écrit qu'à la fermeture du terminal ; `history` montre aussi la session en cours »). |
| 2 | step-03 | majeur | `curl -s https://api.github.com/users/torvalds \| jq .public_repos` → `bash: jq: command not found` (rc=127) : jq n'est pas installé par défaut sur Ubuntu 24.04. L'info « Si `jq` manque : `sudo apt install jq` » n'arrive qu'après la solution, dans la vérification. | Placer avant le bloc solution : « Avant de commencer : `sudo apt update && sudo apt install -y jq` (Debian/Ubuntu) ou `brew install jq` (macOS). » |
| 3 | step-03 | mineur | Une fois jq installé, la même commande a affiché `null` sans aucune erreur. Corps réel : `{"message":"API rate limit exceeded for <IP>. ..."}`. L'API GitHub limite à 60 requêtes/h par IP sans authentification (réseau d'école, NAT, VPN partagés). L'étudiant voit `null` et croit qu'il a fait une erreur. | Ajouter sous la vérification : « Si tu obtiens `null`, affiche la réponse brute (`curl -s https://api.github.com/users/torvalds \| jq .`) : un message « API rate limit exceeded » veut dire que ton IP a dépassé le quota GitHub (60 req/h). Réessaie plus tard. » |
| 4 | step-04 | majeur | `sudo ss -tlnp \| grep sshd` → aucune sortie, rc=1 ; `grep -i port /etc/ssh/sshd_config` → `No such file or directory`. openssh-server n'est pas installé par défaut sur Ubuntu Desktop, sur Ubuntu WSL ni sur cette machine. La vérification annonce « un numéro de port, 22 par défaut » : l'étudiant ne peut pas l'obtenir et ne sait pas pourquoi. | Dans le mini-défi : « Quel port utilise le service SSH ? » → « Quel port utilise le service SSH (s'il est installé : sur un poste Ubuntu Desktop ou WSL, il ne l'est souvent pas, et une sortie vide est alors la bonne réponse) ? » |
| 5 | step-02 | mineur | `ls /var/log/*.log` sans `2>/dev/null` → aucune erreur « Permission denied » (rc=0). `ls` sur des fichiers déjà nommés par le glob n'a pas besoin du droit de lecture. La vérification « le `ls` n'affiche **aucune** erreur « Permission denied » (elles partent dans `/dev/null`) » enseigne donc une cause qui n'existe pas ici. | Mini-défi : remplacer l'exemple par une commande qui produit vraiment des erreurs, par ex. `find /var/log -name "*.log" 2>/dev/null` (sous-dossiers non lisibles, comme `/var/log/private`), et la vérification par « `find` sans `2>/dev/null` affiche des « Permission denied » ; avec, il n'en reste aucune ». |

## Non testable ici
- step-04 `sudo ss -tlnp` : `ss` (iproute2) est absent de l'image conteneur minimale (`sudo: ss: command not found`). Il est présent sur Ubuntu Desktop/Server/WSL : ce n'est pas un bug du guide.
- step-03 bonus GitHub : quota de l'API GitHub épuisé sur l'IP de sortie partagée du bac à sable (voir écart 3). La commande est correcte.
- Prérequis macOS annoncé (« Linux natif, macOS, ou WSL2 ») : non testé. À vérifier, car `ps aux --sort=-%mem` (step-04, option GNU absente du `ps` BSD), `ss` (absent de macOS) et `sudo apt install` (step-03) ne fonctionnent pas sur macOS. Soit on retire macOS des prérequis, soit on ajoute les équivalents (`ps aux -m`, `lsof -iTCP -sTCP:LISTEN`, `brew install jq`).
- Lecture des sections du repo jlevy, `Ctrl-R` et les raccourcis clavier : ils demandent un terminal interactif (TTY), donc pas de durée mesurable ici.
- Limite du bac à sable (pas un bug) : `/etc/sudoers.d/etudiant` est créé avec les droits 666 par `new-box.sh` (umask 0 de `docker exec`), et sudo le refuse (« is world writable »). Corrigé avec `chmod 440` avant le rejeu.

## QCM
- step-01 : OK (answer 2, rm définitif)
- step-02 : OK (answer 0, expansion par le shell)
- step-03 : OK (answer 1, uniq -c ne compte que les doublons consécutifs)
- step-04 : OK (answer 2, stderr redirigé). Remarque : dans un `$HOME` neuf, `du -sh ~/*/` ne produit en fait aucune erreur, mais l'explication reste juste.

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Aucun fichier ni service supposé présent sur une machine neuve.** Toute commande qui lit un fichier d'état (`~/.bash_history`, `/etc/ssh/sshd_config`) ou interroge un service (sshd) doit fonctionner sur un Ubuntu/WSL fraîchement installé, ou bien le guide dit comment l'obtenir. Tout outil hors base (`jq`, `htop`, `tldr`) s'installe **avant** le bloc qui l'utilise, pas dans la vérification.
- **API publique sans authentification = quota.** Quand une commande appelle une API à quota (GitHub : 60 req/h par IP), le guide montre comment reconnaître le message de quota, sinon `jq` affiche `null` sans erreur visible.
