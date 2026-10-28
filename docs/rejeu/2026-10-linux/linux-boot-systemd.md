# Rejeu : linux-boot-systemd
Verdict : ⚠️ faisable avec contournements
Machine : Ubuntu 24.04 vierge avec systemd PID 1 (lb-boot, `new-vm.sh`) · Durée réelle : ~25 min (annoncée 195) · Étapes rejouées : 7/7

Prérequis : le guide déclare `linux-fichiers-disques` ; aucune ressource de ce guide n'est réutilisée, rien à recréer. Seul `sudo apt update && sudo apt install -y at` a été joué (`atd` actif tout de suite). Utilisateur `etudiant` : groupes `etudiant,sudo` uniquement (voir écart 1).

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-04 | majeur | Les 4 commandes `journalctl` sont lancées sans `sudo`. Pour un utilisateur qui n'est ni dans `adm` ni dans `systemd-journal` (cas de tout compte créé avec `useradd`/`adduser`, comme ceux du guide permissions) : `journalctl -u hello --no-pager \| tail` → `Hint: You are currently not seeing messages from other users and the system. Users in groups 'adm', 'systemd-journal' can see all messages.` puis `-- No entries --` (×4). La vérification « affiche uniquement les lignes `hello à …` » échoue. Avec `sudo journalctl -u hello` : `bash[372]: hello à Wed Oct 28 13:31:05 UTC 2026` etc. (Le premier compte créé par l'installeur Ubuntu est dans `adm` et voit les logs : l'écart touche les autres comptes.) | Préfixer les 4 lignes par `sudo` : `journalctl -u hello --no-pager \| tail` → `sudo journalctl -u hello --no-pager \| tail` (idem `-b`, `--since`, `-p err`, et la ligne commentée `-f`). Ajouter à la prose FR : « *(Sans `sudo`, seul un membre des groupes `adm` ou `systemd-journal` voit les logs système.)* » ; EN : « *(Without `sudo`, only members of the `adm` or `systemd-journal` groups can see system logs.)* ». |
| 2 | next (ménage) | mineur | `rm -f /tmp/cron.log /tmp/timer.log /tmp/at.log` → `rm: cannot remove '/tmp/timer.log': Operation not permitted`. `/tmp/timer.log` est écrit par `tick.service` qui tourne en root (`-rw-r--r-- 1 root root`), et `/tmp` est sticky : l'étudiant ne peut pas le supprimer. | `rm -f /tmp/cron.log /tmp/timer.log /tmp/at.log` → `rm -f /tmp/cron.log /tmp/at.log ; sudo rm -f /tmp/timer.log` (FR et EN). |
| 3 | step-05 | mineur | `hello.service` tourne encore (relancé à step-03, jamais arrêté) et lance `sleep 5` en root. `pgrep -a sleep` → `494 sleep 5` et `514 sleep 600` ; `pkill sleep` → `pkill: killing pid 494 failed: Operation not permitted`. Message d'erreur non annoncé ; sur une machine réelle `pkill sleep` tue aussi tous les autres `sleep` de l'utilisateur. | `pgrep -a sleep              # le trouve PAR NOM` → `pgrep -af 'sleep 600'       # le trouve PAR NOM` et `pkill sleep                 # le tue par nom` → `pkill -f 'sleep 600'         # le tue par nom` ; ou ajouter une phrase : « si `hello` tourne encore, `pkill` affiche *Operation not permitted* sur son `sleep 5` (processus root) : normal. » |
| 4 | step-07 | mineur | Collé tel quel, `systemctl list-timers tick.timer --no-pager` affiche `NEXT -  LEFT -  LAST Wed 2026-10-28 13:32:25 UTC  PASSED 16ms ago`. `OnBootSec=30s` est déjà dépassé, donc le timer se déclenche dès `enable --now` et `NEXT` n'est pas encore recalculé. La vérification « liste `tick.timer` avec son prochain déclenchement (`NEXT`) » ne se voit pas au premier essai. Relancée 75 s plus tard : `NEXT Wed 2026-10-28 13:34:32 UTC  LEFT 51s`. `/tmp/timer.log` (2 lignes) et `/tmp/at.log` sont conformes. | `systemctl list-timers tick.timer --no-pager     # le timer est armé / the timer is armed` → `sleep 2 ; systemctl list-timers tick.timer --no-pager   # le timer est armé (NEXT renseigné) / the timer is armed`. Dans la prose FR, ajouter : « *(`OnBootSec` étant déjà passé, le timer se déclenche une première fois tout de suite.)* » ; EN : « *(Since `OnBootSec` is already past, the timer fires once right away.)* ». |
| 5 | step-01 | mineur | `systemctl get-default` → `graphical.target` sur cette Ubuntu 24.04 sans interface graphique. La vérification dit « souvent `graphical.target` sur un poste, `multi-user.target` sur un serveur ». Sur Ubuntu, `default.target` livré pointe vers `graphical.target` même sans bureau, ce qui peut faire croire à l'étudiant serveur qu'il s'est trompé. | FR « (souvent `graphical.target` sur un poste, `multi-user.target` sur un serveur) » → « (souvent `graphical.target`, même sur un serveur Ubuntu sans bureau : sans paquets graphiques, cela revient à `multi-user.target` ; un admin peut fixer `sudo systemctl set-default multi-user.target`) » ; même correction EN. |

Conforme : `ps -p 1` → `1 systemd` ; step-02 `active (running)` avec PID et `sleep 5` ; step-03 `Created symlink .../multi-user.target.wants/hello.service`, `enabled`, `Created symlink /etc/systemd/system/hello.service → /dev/null.`, `Failed to start hello.service: Unit hello.service is masked.` (mot pour mot), unmask OK ; dépannage « file already exists » vérifié (`Failed to mask unit: File /etc/systemd/system/loc.service already exists.`) ; step-05 `NI 0 → 10`, `[1]+ Terminated`, `Killed` ; step-06 `tick Wed Oct 28 13:32:01 UTC 2026` après `sleep 65` ; step-07 `job 1 at ...`, `atq` liste la tâche, `/tmp/at.log` est créé à l'échéance ; le ménage retire hello/tick (0 unit restante), sauf `/tmp/timer.log` (écart 2). Aucune image Docker, aucune commande destructive non signalée.

## Non testable ici
- step-01 : `systemd-analyze` ne donne que `Startup finished in 661ms (userspace)` : pas de firmware, de chargeur ni de noyau propres dans le bac à sable. Sur une vraie VM s'affichent aussi `(firmware) + (loader) + (kernel)`. La chaîne firmware → GRUB → noyau n'est pas observable.
- step-03 : l'effet réel de `enable` (démarrage au prochain boot) demande un vrai redémarrage. Seul le lien `multi-user.target.wants/` a été vérifié.
- Les valeurs de `systemd-analyze blame` (ms) ne sont pas représentatives d'une vraie machine.

## QCM
- step-01 : OK
- step-02 : OK
- step-03 : OK
- step-04 : OK
- step-05 : OK
- step-06 : OK
- step-07 : OK

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Tester avec un compte « ordinaire », pas seulement avec le premier compte de l'installeur.** Le premier utilisateur Ubuntu est dans `adm` (logs, `journalctl`) ; un compte créé ensuite ne l'est pas. Toute commande de lecture de logs système doit avoir `sudo`, ou annoncer le groupe requis.
- **Fichiers créés par un service root = ménage en `sudo`.** Un `.service` système qui écrit dans `/tmp` y laisse des fichiers root que l'utilisateur ne peut pas supprimer (répertoire sticky).
- **`pkill`/`pgrep` par motif précis.** Un nom générique (`sleep`, `python`) attrape aussi les processus des services du guide ou d'autres utilisateurs : utiliser `-f '<commande complète>'` ou `-u "$USER"`.
