# Rejeu : docker-projet-entreprise
Verdict : ⚠️ faisable avec contournements
Machine : Ubuntu 24.04 vierge (rc-projet, mono-nœud comme le guide) · Durée réelle : ~10 min de commandes, install Docker comprise (annoncée 320) · Étapes rejouées : 8/8

Prérequis appliqués : `docker-swarm` → chaîne Docker, dont seul `docker-fondamentaux` installe quelque chose (Docker Engine 29.9.2 via le dépôt apt officiel + plugins buildx/compose, groupe `docker`). « Git installé » : déjà présent, tiré par les Recommends de `docker-ce` (`git version 2.43.0`). Démon lancé via `dockerd &` (pas de systemd, limite du bac à sable). Aucune étape n'a dépassé 15 min (la plus longue : step-06 update + rollback, ~2 min).

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-08 (Ménage) + cheatsheet | majeur | Le volume de la stack s'appelle `atelier_redis-data` (préfixe du nom de stack), pas `redis-data`. Après le ménage du guide, `docker volume ls` → `local  atelier_redis-data` toujours là ; `docker volume rm redis-data 2>/dev/null` échoue en silence. Et même avec le bon nom, après `docker stack rm atelier ; sleep 3` : `Error response from daemon: remove atelier_redis-data: volume is in use` (les conteneurs `atelier_*` existent encore ; OK après 10 s de plus). Le pitfall 7 promet pourtant que le volume est nettoyé. | `docker stack rm atelier ; sleep 3 ; docker secret rm api_token 2>/dev/null ; docker volume rm redis-data 2>/dev/null ; ...` → `docker stack rm atelier ; while docker ps -q -f name=atelier_ \| grep -q .; do sleep 1; done ; docker secret rm api_token ; docker volume rm atelier_redis-data ; ...` (avec un avertissement : `docker volume rm` détruit les données Redis). Idem cheatsheet `docker volume rm redis-data` → `docker volume rm atelier_redis-data`. |
| 2 | step-06 → step-08 (reproductibilité) | majeur | `sed -i 's/Atelier API v1/Atelier API v2/' main.go` n'est jamais annulé ; le commit du step-08 fige `main.go` en **v2** (`grep -c "Atelier API v2" main.go` → `1`) alors que `stack.yml` et le README déploient `atelier-api:1.0`. Un `git clone` + `docker build -t localhost:5001/atelier-api:1.0 .` (commande du README) produit une image « 1.0 » qui répond `Atelier API v2` : le livrable contredit la promesse « reconstruire l'appli **à l'identique** ». | Après `docker service rollback atelier_api` / `curl ...  # -> "Atelier API v1 ..."` ajouter : `sed -i 's/Atelier API v2/Atelier API v1/' main.go   # le dépôt reste aligné sur la 1.0 déployée / keep the repo aligned with deployed 1.0`. (Ou : passer `stack.yml` en `:1.1` et commiter la v2.) |
| 3 | step-05 | mineur | `docker stack deploy` est détaché ; `docker stack services atelier` juste après → `atelier_api 0/3`, `atelier_redis 0/1` (annoncé : `3/3` et `1/1`). La boucle `curl` placée **après** ne corrige pas cet affichage. 10 s plus tard : `3/3`, `1/1`. | `docker stack deploy -c stack.yml atelier` → `docker stack deploy --detach=false -c stack.yml atelier` (step-05 ; aussi step-08 pour cohérence). |
| 4 | pitfall n°4 (FR/EN) | mineur | Même erreur que dans docker-swarm : Compose v2+ respecte `deploy.replicas` et `deploy.resources` (vérifié : `docker compose up -d` avec `replicas: 3` crée 3 conteneurs, Compose v5.6.1). Ici, `docker compose up` sur ce `stack.yml` lancerait 3 API sur le même port 8080. | `La section `deploy:` n'est honorée que par **`docker stack deploy`** (Swarm), pas par `docker compose up`.` → ``update_config`, `restart_policy` et `placement` ne sont appliqués que par **`docker stack deploy`** ; `docker compose up` applique `replicas`/`resources` mais ignore `secrets: external` côté Swarm. Ce projet est une **stack**, pas un `compose up`.` |
| 5 | step-01, step-04, step-02 | mineur | Images flottantes (règle B) : `golang:1.22-alpine` (Go 1.22 hors support depuis février 2025, pinée mais obsolète), `registry:2` (majeur flottant), `redis:7-alpine` (mineur flottant). | `FROM golang:1.22-alpine AS build` → `FROM golang:1.25-alpine AS build` ; `registry:2` → `registry:2.8.3` ; `redis:7-alpine` → `redis:7.4-alpine` (step-02, step-04, cheatsheet). |
| 6 | step-02 (+ ménage) | mineur | `docker rm -f registry` laisse le volume anonyme de `registry:2` (`/var/lib/registry`) : après le ménage, `docker volume ls` → `local  bab03b45d46c...`. | `docker rm -f registry 2>/dev/null` → `docker rm -f -v registry 2>/dev/null   # -v : supprime aussi les images poussées / also deletes pushed images` (ménage + cheatsheet). |
| 7 | step-07 | mineur | Le plan du README est un bloc indenté dont chaque ligne commence par `#` ; la consigne « chaque titre devient une section `##` » ne dit pas quelles lignes sont des titres ni s'il faut garder les `#`. Un copier-coller donne un README entièrement en titres H1. | Fournir le README en bloc ```markdown réel (`# Atelier Média…`, `## Architecture`, `## Déployer`, `## Exploitation`, `## Décisions`) avec un `cat > README.md <<'EOF'` comme pour les autres fichiers. |

Conforme à l'annonce : step-01 build OK et `Atelier API v1 — hôte f71a0959e906 — secret: (absent)` ; step-02 push `1.0: digest: sha256:9364…` ; step-03 `api_token` listé ; step-05 tâches `(healthy)`, et dans chaque tâche `Atelier API v1 — hôte <id> — secret: présent (36 octets)` (3 hôtes différents) ; step-06 v2 puis v1 après rollback (vérifié dans les tâches) ; step-08 second `stack deploy` : ensemble des tâches identique avant/après (« aucune tâche recréée »), `git commit` OK (5 fichiers).

## Non testable ici
- step-05 et step-06 (`curl -s localhost:8080` via le routing mesh) : `Connection refused`, le noyau du bac à sable n'a pas IPVS (`/proc/net/ip_vs` absent), requis par l'ingress Swarm. Vérifié à la place par `docker exec <tâche> wget -qO- localhost:8080` : réponses conformes. La boucle d'attente `for i in $(seq 15); do curl -sf ...` a donc tourné 30 s pour rien (`rc=7`), pas un bug du guide.
- « le nom d'hôte change d'un appel à l'autre » (répartition routing mesh) : idem, non observable ici.
- Push GitHub : pas de compte, hors périmètre.

## QCM
- step-01 : OK
- step-02 : OK
- step-03 : OK
- step-04 : OK
- step-05 : OK (non vérifiable en pratique ici, cf. IPVS)
- step-06 : OK
- step-07 : OK
- step-08 : OK

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Ressources nommées par une stack/un projet = nom préfixé.** `docker stack deploy … atelier` crée `atelier_redis-data`, `atelier_backend` ; Compose crée `<projet>_<volume>`. Tout ménage ou commande qui cible ces ressources doit utiliser le nom préfixé, et ne pas masquer l'erreur par `2>/dev/null`. *(Bug réel : docker-projet-entreprise laissait le volume Redis.)*
- **Une modification de démonstration (sed « v2 ») doit être annulée avant le commit du livrable**, sinon le dépôt ne reconstruit plus ce qui est déployé.
