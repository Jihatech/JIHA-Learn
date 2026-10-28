# Rejeu : linux-fondamentaux
Verdict : ⚠️ faisable avec contournements
Machine : Ubuntu 24.04 vierge (new-vm.sh, systemd PID 1, `la-fond`) · Durée réelle : ~6 min d'exécution machine, lecture non comptée (annoncée 150) · Étapes rejouées : 9/9

Méthode : commandes lancées dans un **vrai shell de connexion** (`docker exec la-fond su - etudiant -c '...'`), car `docker exec` seul donne `umask 0000`, alors qu'une connexion Ubuntu réelle (console, SSH, `multipass shell`) passe par PAM (`pam_umask` + `USERGROUPS_ENAB yes`) et donne `umask 0002`. C'est ce qui révèle l'écart n°1.

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-03 | majeur | Sur Ubuntu (umask de connexion `0002`) : `ls -l demo.sh` → `-rw-rw-r-- 1 etudiant etudiant 33 … demo.sh` (et non `-rw-r--r--`) ; après `chmod u+x` → `-rwxrw-r--` (et non `-rwxr--r--`) ; après `chmod 644` → `-rw-r--r--`, qui n'est donc **pas** « de retour ». La vérification de l'étape annoncée comme « la plus importante du guide » échoue mot à mot sur l'OS recommandé, sans explication. Le reste (Permission denied puis exécution OK) fonctionne. | Commentaires du bloc : `# -rw-r--r-- : pas exécutable / not executable` → `# -rw-rw-r-- (Ubuntu) ou -rw-r--r-- : pas de x / no x` ; `# de retour à -rw-r--r-- / back to -rw-r--r--` → `# maintenant -rw-r--r-- (644), quel que soit le départ / now -rw-r--r-- (644), whatever the start`. Vérification FR : « après `chmod u+x`, `ls -l demo.sh` montre `-rwxr--r--` » → « après `chmod u+x`, `ls -l demo.sh` montre un `x` dans le premier triplet (`-rwxrw-r--` sur Ubuntu, `-rwxr--r--` ailleurs) ». Ajouter une phrase : « Les droits de départ dépendent du **umask** (`umask` affiche `0002` sur Ubuntu : le groupe garde `w`, d'où `rw-rw-r--` ; `0022` ailleurs : `rw-r--r--`). » Même correction en EN. |
| 2 | step-02 | mineur | `find /etc -name "*.conf" -type f \| head` affiche, mêlées aux résultats, `find: '/etc/credstore.encrypted': Permission denied`, `find: '/etc/credstore': Permission denied`, `'/etc/ssl/private': Permission denied`. Le guide n'annonce rien : un débutant croit avoir fait une erreur, une étape avant que les permissions soient expliquées. | Ajouter sous le bloc (FR) : « Quelques lignes `find: … Permission denied` sont normales : ton utilisateur n'a pas le droit de lire certains dossiers de `/etc`. Pour les masquer : `find /etc -name "*.conf" -type f 2>/dev/null \| head`. » (EN équivalent). |
| 3 | step-09 (vs step-03) | mineur | Explication : « sans lui [le shebang], le noyau ne sait pas que c'est du bash ». Or `demo.sh` (step-03) n'a pas de shebang et `./demo.sh` affiche `Bonjour depuis mon script` ; testé aussi : `printf "echo hi\n" > ns.sh; chmod +x ns.sh; ./ns.sh` → `hi`. Le noyau refuse (ENOEXEC), mais le shell courant relance le fichier lui-même. L'étudiant attentif voit une contradiction entre les deux étapes. | « sans lui, le noyau ne sait pas que c'est du bash. » → « sans lui, le noyau ne sait pas quel interpréteur lancer : ton shell se rabat alors sur lui-même (c'est pour ça que `demo.sh` a marché à l'étape 3), mais depuis cron, un autre shell ou un autre programme, le script échoue ou s'exécute avec le mauvais interpréteur. » (EN équivalent). |
| 4 | prerequisites (macOS) | mineur | Prérequis implicite : `brew install --cask multipass` suppose Homebrew installé, ce qui n'est annoncé nulle part ; sans lui, l'étudiant macOS obtient `zsh: command not found: brew` avant même la première étape (guide gratuit, première impression). Non exécuté ici (pas de macOS), constat de lecture. | « Avec Multipass : `brew install --cask multipass`, puis… » → « Avec Multipass : installe-le depuis https://canonical.com/multipass/install (ou `brew install --cask multipass` si tu as déjà Homebrew), puis… » (EN équivalent). |

## Non testable ici
- step-02 : `file /etc/hostname` → `-bash: line 1: file: command not found` dans le bac à sable. Le paquet `file` est de priorité `standard` (présent sur Ubuntu Server, images cloud/Multipass et Ubuntu WSL), absent seulement de l'image minimale du bac à sable : pas compté comme écart. Si le guide veut couvrir Ubuntu minimal/conteneur, ajouter « (sinon `sudo apt install -y file`) ».
- prerequisites : parcours WSL (`/etc/wsl.conf`, `wsl --shutdown`) et macOS/Multipass non rejouables (pas de Windows/macOS). Remarque de lecture : les installations Ubuntu récentes sous WSL ont déjà `systemd=true` par défaut ; la note reste valable pour les anciennes installations.
- step-06 : la ligne `Warning: some journal files were not opened due to insufficient permissions.` sous `systemctl status cron` vient du fait que l'utilisateur du bac à sable n'est pas dans le groupe `adm` (le premier utilisateur d'une vraie install Ubuntu l'est). Le reste conforme : `Active: active (running)`, `enabled`, journal lisible avec `sudo`.
- step-08 : IP vue `172.17.0.4` (réseau Docker), ce qui est cohérent avec « ton IP locale ». `dig +short example.com` → 2 IP, `curl` → HTML : conformes.

## QCM
- step-01 : OK
- step-02 : OK
- step-03 : OK (644 correct). Suggestion liée à l'écart 1 : un QCM sur le umask aiderait, mais pas d'erreur.
- step-04 : OK
- step-05 : OK
- step-06 : OK
- step-07 : OK
- step-08 : OK
- step-09 : OK

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Sorties dépendantes de l'environnement de connexion vérifiées dans un vrai login.** Les droits de fichiers créés dépendent du `umask` (Ubuntu : `0002` via `pam_umask`, donc `-rw-rw-r--`) ; ne jamais annoncer `-rw-r--r--` mot à mot, et rejouer dans un shell de connexion (`su - user`, SSH), pas un `docker exec` (umask `0000`). *(Bug réel : linux-fondamentaux step-03.)*
- **Sortie d'erreur attendue annoncée.** Une commande qui affiche des erreurs normales pour un utilisateur non-root (`find /etc` → `Permission denied`) doit le dire ou les rediriger (`2>/dev/null`).
