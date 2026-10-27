# Rejeu : docker-reseau
Verdict : ⚠️ faisable avec contournements
Machine : Ubuntu 24.04 vierge (rb-reseau) · Durée réelle : ~8 min (annoncée 170) · Étapes rejouées : 6/6

Prérequis appliqué (docker-images-dockerfile → docker-compose → docker-fondamentaux) : seul Docker est installé par la chaîne. Docker Engine via le dépôt apt officiel (docker-ce 29.9.2) + ajout de `etudiant` au groupe `docker`. Démon lancé à la main (`dockerd &`, pas de systemd : limite du bac à sable).

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-02 | majeur | `IP2=$(docker inspect -f '{{.NetworkSettings.IPAddress}}' c2)` → `template parsing error: ... at <.NetworkSettings.IPAddress>: map has no entry for key "IPAddress"` ; `IP2` vide, puis `docker exec c1 ping -c 2 "$IP2"` → `ping: bad address ''`. Les champs IP de premier niveau de `NetworkSettings` (dépréciés) n'existent plus sur Docker Engine 29. La démonstration « par IP ça marche » échoue donc aussi : l'étudiant voit deux échecs au lieu d'un contraste. Contournement testé : `{{.NetworkSettings.Networks.bridge.IPAddress}}` → `IP2=[172.18.0.3]`, ping 2/2 reçus. | `IP2=$(docker inspect -f '{{.NetworkSettings.IPAddress}}' c2)` → `IP2=$(docker inspect -f '{{.NetworkSettings.Networks.bridge.IPAddress}}' c2)` |
| 2 | step-01, step-03, step-05, cheatsheet | majeur (règle B) | Image `alpine` sans tag (donc `:latest`) : `docker run -d --name c1 alpine sleep 1000` → `Unable to find image 'alpine:latest' locally`. Contraire à la section B (versions pinées). Les autres guides de la track utilisent `alpine:3.20`. | `alpine` → `alpine:3.20` dans les 6 occurrences (`docker run -d --name c1 alpine sleep 1000`, `... c2 alpine ...`, `docker run --rm --network appnet alpine ping -c 2 web`, les deux `ip addr` de step-05, et `alpine ping -c1 web` de la cheatsheet). |
| 3 | cheatsheet | mineur | `docker run -d -p 8080:80 web` et `docker run -d -p 127.0.0.1:8080:80 web` utilisent `web`, qui dans tout le guide est un **nom de conteneur**, à la place d'un nom d'image : copié tel quel → `pull access denied for web`. | `docker run -d -p 8080:80 web` → `docker run -d -p 8080:80 nginx:1.27-alpine` ; idem pour la ligne `127.0.0.1:8080:80`. |

Tout le reste est conforme : step-01 liste `c1=... c2=...` en `/16` ; step-02 `ping c2` → `bad address 'c2'` ; step-03 `ping -c 2 web` 2/2 par nom ; step-04 `curl` renvoie `Welcome to nginx!`, `docker port web-pub` → `80/tcp -> 0.0.0.0:8080` ; step-05 host = interfaces de l'hôte, none = `lo` seul ; step-06 `appnet backend` puis `web-pub web`. Le ménage `docker rm -f c1 c2 web web-pub ; docker network rm appnet backend` fonctionne.

## Non testable ici
- step-01 : les IP observées sont en `172.18.x.x` et non `172.17.x.x` comme annoncé, parce que le Docker de la machine est imbriqué dans un hôte qui occupe déjà `172.17.0.0/16`. Sur une machine réelle le bridge par défaut est bien en `172.17.0.0/16` : pas un bug du guide.
- Prérequis : `$USER` vide sous `docker exec` (pas de session de login), `usermod -aG docker $USER` refait avec le nom explicite. Limite du bac à sable.

## QCM
- step-01 : OK
- step-02 : OK
- step-03 : OK
- step-04 : OK
- step-05 : OK
- step-06 : OK

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Pas de champs `docker inspect` dépréciés.** Les champs de premier niveau `.NetworkSettings.IPAddress`, `.Gateway`, `.MacAddress`... n'existent plus sur Docker Engine 29 : toujours passer par `.NetworkSettings.Networks.<réseau>.IPAddress` (ou `{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}`). Tester chaque `--format`/`-f` sur la version de Docker courante.
- **Image de base sans tag = `:latest`.** `alpine`, `busybox`, `ubuntu` écrits nus dans un `docker run` sont aussi des images non pinées : les traquer comme les `:latest` explicites.
