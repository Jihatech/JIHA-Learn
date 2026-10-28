# Complément pour la filière Linux (à lire APRÈS BRIEF.md, il le remplace sur ces points)

## Machine : utilise `tools/rejeu/new-vm.sh <nom>` (et non new-box.sh)
Ubuntu 24.04 avec **systemd en PID 1** : `systemctl`, `journalctl`, services, timers, cron et rsyslog
fonctionnent. Pages `man` présentes. Paquets de base d'un Ubuntu Server (iproute2, ping, less, nano,
vim, lsof, htop, ufw, man-db…). Privilégiée : `losetup`, `mkfs`, `mount`, `iptables`/`ufw` fonctionnent.
Exécution : `docker exec -u etudiant -w /home/etudiant <nom> bash -lc '...'`.
Nettoyage final : `docker rm -f <nom>; docker volume rm -f <nom>-docker`.

## Limites de ce bac à sable (à NE PAS compter comme bugs du guide)
- **Pas d'IPv6 dans le noyau** : un service qui écoute par défaut sur `[::]` (nginx, apache) échoue au
  démarrage. Contourne en retirant la ligne `listen [::]...` ou équivalent, et note-le en « Non testable ».
- Pas de vrai disque supplémentaire : simule-le avec un fichier image + `losetup` si le guide suppose
  un second disque (`/dev/sdb`), et note la correspondance.
- Pas de GRUB, pas de vrai redémarrage, pas de console : tout ce qui exige un reboot réel de la machine
  (menu GRUB, mode rescue, `reboot` puis vérification) est « non testable ici » ; teste ce qui peut
  l'être sans reboot (`systemctl isolate`, `systemd-analyze`, fichiers de config).
- Pas d'IP publique ni d'accès SSH entrant depuis l'extérieur ; tu peux tester SSH en local (`ssh localhost`).
- `$USER` peut être vide dans `docker exec` : exporte `USER=etudiant` si une commande en dépend, et note-le.

## Chaîne de prérequis
Les guides Linux forment une chaîne (chacun a le précédent en prérequis). Une machine neuve par guide.
Si une étape dépend d'un état créé par un guide précédent (utilisateur, groupe, fichier, paquet,
service), recrée le **minimum** nécessaire et note-le. Si cette dépendance n'est **pas annoncée** dans
les prérequis du guide, c'est un écart à signaler (un étudiant qui arrive directement sur ce guide
serait bloqué).

## Points d'attention propres à Linux
- Commandes destructives (`rm -rf`, `mkfs`, `dd`, `fdisk`, `chmod -R`, `iptables -F`, `ufw enable`
  sur une machine distante) : avertissement présent ? risque de couper son propre accès SSH annoncé ?
- Différences Ubuntu 24.04 : `netplan`, `systemd-resolved`, `ss` vs `netstat` (net-tools absent),
  `apt` vs `apt-get`, sudo, noms d'interfaces.
- Sorties annoncées (« tu dois voir… ») comparées mot à mot à la sortie réelle quand c'est un critère de succès.
