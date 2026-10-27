# Rejeu : docker-compose
Verdict : ✅ faisable tel quel
Machine : Ubuntu 24.04 vierge (ra-compose) + prérequis docker-fondamentaux (Docker Engine 29.9.2 via dépôt apt officiel, groupe docker, jq) · Durée réelle : ~15 min dont ~10 min d'installation de Docker (annoncée 60) · Étapes rejouées : 6/7 (step-07 = squelette de lecture, non exécutable)

Prérequis du front-matter : `prerequisites: [docker-fondamentaux]`. Règle du brief appliquée : Docker Engine + plugin compose installés comme docker-fondamentaux le fait faire (docs.docker.com), `usermod -aG docker`, jq (prérequis transitif art-of-command-line).

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-03 / step-07 | majeur | L'image `wordpress:6.8` déclare `VOLUME /var/www/html`, et le compose ne le monte pas. Après `docker compose down` puis `up -d`, `docker volume ls` montre **2** volumes anonymes (hash) en plus de `wp_db-data` : chaque `down` laisse un volume orphelin, et le nouveau conteneur repart d'un `/var/www/html` neuf (`ls wp-content/uploads` → `No such file or directory`). L'installation « survit » parce qu'elle est en base, mais les médias, thèmes et extensions installés seraient perdus. Ça contredit « Le volume est ta vraie donnée » et le squelette de step-07, qu'on présente comme validé sur la stack WordPress. | Dans les 3 versions du service `wordpress` (step-01, step-05, step-06), ajouter : `    volumes:` / `      - wp-data:/var/www/html`, et sous `volumes:` à la racine : `  wp-data:`. Ajouter dans step-01, sous « Deux détails à bien voir » : « `wp-data` garde les médias, thèmes et extensions : sans lui, ils partent au premier `down`. » |
| 2 | step-02 | mineur | `docker compose up -d` puis `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080` tout de suite → `500` (WordPress n'arrive pas encore à joindre MariaDB). 8 s plus tard → `<title>WordPress &rsaquo; Installation</title>`. Un débutant qui ouvre le navigateur tout de suite voit « Erreur lors de la connexion à la base de données ». | « Puis ouvre `http://localhost:8080` dans ton navigateur : tu dois voir la page d'installation de WordPress. » → « Attends ~20 secondes (MariaDB initialise sa base au 1er démarrage ; avant, WordPress affiche « Erreur lors de la connexion à la base de données »), puis ouvre `http://localhost:8080` : tu dois voir la page d'installation de WordPress. **Va au bout de l'installation** (titre, compte admin) : l'étape 3 vérifie qu'elle survit. » |
| 3 | step-03 | mineur | La vérification « WordPress doit se souvenir de ton installation » suppose que l'installation a été faite, mais step-02 demande seulement de *voir* la page d'installation. Rejoué à la lettre, après `down`/`up -d` on retombe sur la page d'installation et rien ne prouve que `db-data` a survécu. (Rejeu fait en terminant l'installation via `curl .../wp-admin/install.php?step=2` : après `down`/`up -d`, `<title>Test</title>`, OK.) | Couvert par le correctif 2 (« Va au bout de l'installation »). |
| 4 | step-04 | mineur | Objectif annoncé : « Sortir les secrets du `compose.yaml` », mais après step-04 le service `wordpress` contient toujours `WORDPRESS_DB_PASSWORD: wpsecret` en clair (corrigé seulement en step-05/06). `docker compose config` montre bien les MARIADB interpolées, le mot de passe WordPress reste dans le YAML. | Dans step-04, après le bloc `db`, ajouter : « et dans `wordpress`, remplace `WORDPRESS_DB_PASSWORD: wpsecret` par `WORDPRESS_DB_PASSWORD: ${MARIADB_PASSWORD}` (même mot de passe, une seule source). » |
| 5 | prerequisites | mineur | `docker compose version` → `Docker Compose version v5.6.1`. Le guide demande « Le plugin **Docker Compose v2** installé » : un débutant qui lit « v5 » peut croire qu'il n'a pas la bonne version. | « Le plugin **Docker Compose v2** installé — `docker compose version` doit répondre. » → « Le plugin **Docker Compose** (v2 ou plus récent, ex. `v5.x`) installé : `docker compose version` doit répondre. » Même correction en EN (l. 108). |

## Non testable ici
- Démarrage du démon sans systemd : `sudo bash -c 'dockerd >/var/log/dockerd.log 2>&1 &'` (limite du bac à sable).
- `http://localhost:8080` dans un navigateur : vérifié avec `curl`. L'installation WordPress (formulaire) a été faite en POST `curl` sur `/wp-admin/install.php?step=2`.
- `nano compose.yaml` / `nano .env` : nano est absent de l'image conteneur minimale (il est présent sur Ubuntu Desktop/WSL). Fichiers écrits via heredoc avec le contenu exact du guide.
- step-07 : squelette illustratif (`monregistry/app:1.2.3` fictif), pas fait pour être lancé. Vérification de relecture uniquement.
- Limites du bac à sable (pas des bugs) : `$USER` vide dans `docker exec` (rejoué avec `-e USER=etudiant`), `/etc/sudoers.d/etudiant` en 666 (`chmod 440` appliqué).

Résultats conformes vérifiés : step-01 `docker compose config` rc=0 ; step-02 `docker compose ps` 2 services `Up` ; step-03 cycle `restart/stop/start/down/up -d` OK, `wp_db-data` conservé ; step-04 `docker compose config | grep MARIADB` montre les valeurs interpolées ; step-05 `docker network inspect proxy` → `wp-wordpress-1` seul (db uniquement sur `wp_default`) ; step-06 `db Up 10 seconds (healthy)`, wordpress lancé après « Container wp-db-1 Healthy », `healthcheck.sh` présent dans `mariadb:11.4`.

## QCM
- step-01 : OK (answer 1)
- step-02 : OK (answer 2)
- step-03 : OK (answer 0)
- step-04 : OK (answer 1)
- step-05 : OK (answer 2)
- step-06 : OK (answer 0)
- step-07 : OK (answer 1)

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Lire les `VOLUME` déclarés par l'image.** Pour chaque image d'une stack, vérifier `docker image inspect <img> --format '{{json .Config.Volumes}}'`. Chaque chemin listé doit être monté sur un volume nommé dans le compose, sinon `down`/`up` crée un volume anonyme orphelin et perd ces données (bug réel : `wordpress:6.8` et `/var/www/html`).
- **Vérification qui suppose une action jamais demandée.** Si une vérification teste la persistance d'un état (installation, compte, donnée), l'étape précédente doit demander explicitement de créer cet état.
