# Rejouer un guide comme un étudiant

Outillage du rejeu « machine vierge » (voir `CLAUDE.md`, section *Rejouer un guide comme un étudiant*).

| Fichier | Rôle |
|---|---|
| `new-box.sh <nom>` | Ubuntu 24.04 privilégiée minimale (filières Docker, conteneurs) : `/var/lib/docker` sur volume, utilisateur `etudiant` sudo |
| `new-vm.sh <nom>` | Ubuntu 24.04 « comme un serveur » : systemd en PID 1, services, journal, pages man, losetup/mount, ufw (filières Linux, systemd, réseau) |
| `BRIEF.md` | Consigne du rejoueur : méthode étape par étape, gabarit du rapport |
| `BRIEF-LINUX.md` | Complément pour les guides système (limites du bac à sable, chaîne de prérequis) |

Exemple :

```bash
tools/rejeu/new-vm.sh rejeu-linux-fond
docker exec -u etudiant -w /home/etudiant rejeu-linux-fond bash -lc 'id && systemctl is-system-running'
docker rm -f rejeu-linux-fond ; docker volume rm -f rejeu-linux-fond-docker
```

Derrière un proxy HTTPS qui intercepte TLS, exporter `PROXY_CA=/chemin/ca.crt` avant de créer la machine.
Les rapports vont dans `docs/rejeu/<date>-<filière>/`.
