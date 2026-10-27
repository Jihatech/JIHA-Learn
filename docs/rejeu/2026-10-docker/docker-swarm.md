# Rejeu : docker-swarm
Verdict : ⚠️ faisable avec contournements
Machine : Ubuntu 24.04 vierge (rc-swarm, variante 1 nœud proposée par le guide) · Durée réelle : ~8 min de commandes, install Docker comprise (annoncée 190) · Étapes rejouées : 6/6

Prérequis appliqués : `docker-securite` → chaîne Docker, dont seul `docker-fondamentaux` installe quelque chose (Docker Engine via le dépôt apt officiel, + plugins buildx/compose, utilisateur dans le groupe `docker`). Version : Docker Engine **29.9.2**, Compose **v5.6.1**. Démon lancé via `dockerd &` (pas de systemd, limite du bac à sable). Pas besoin de `rc-net` ni de nœuds supplémentaires : le guide est conçu pour un cluster d'un nœud.

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-02 | majeur | Après `docker rm -f "$(docker ps -q -f name=web \| head -1)"`, la boucle `for i in $(seq 10); do docker service ls \| grep -q '5/5' && break; sleep 1; done` sort **immédiatement** (i=1, 31 à 45 ms) car Swarm n'a pas encore vu la tâche morte ; le `docker service ls` suivant affiche `web  replicated  4/5`. Reproduit 3 fois sur 3 + 1 fois au rejeu (4 sur 4). Le guide annonce « toujours 5/5 » : l'étudiant croit que le self-healing ne marche pas. | `# attends que Swarm recrée la tâche (jusqu'à ~10 s) / wait for Swarm to recreate the task` → `sleep 3   # laisse Swarm constater la tâche morte / let Swarm notice the dead task` puis la boucle inchangée. Vérifié : avec `sleep 3` avant la boucle, sortie `5/5` (2 sur 2). |
| 2 | pitfalls n°2 + troubleshooting « `deploy:` ne fait rien » (FR/EN) + concepts « Stacks » | majeur | Explication fausse avec Compose v2+ : `compose.yml` avec `deploy: replicas: 3` puis `docker compose up -d` → `t-web-1`, `t-web-2`, `t-web-3` (3 conteneurs créés, Compose v5.6.1). `docker compose up` respecte `deploy.replicas` et `deploy.resources` ; seuls `update_config`, `placement`, `rollback_config` etc. sont propres à Swarm. | Pitfall 2 : `La section `deploy:` (replicas, update_config) n'est prise en compte que par **Swarm** (`docker stack deploy`), **pas** par `docker compose up`.` → `Une partie de `deploy:` (`update_config`, `rollback_config`, `placement`) n'est appliquée que par **Swarm** (`docker stack deploy`) ; `docker compose up` respecte `replicas` et `resources` mais ignore le reste.` Troubleshooting : `Tu as lancé `docker compose up` (qui **ignore** `deploy:`).` → `Tu as lancé `docker compose up`, qui ignore la partie orchestration de `deploy:` (`update_config`, `placement`…).` Même correction dans l'EN. |
| 3 | step-06 | mineur | `docker stack deploy -c stack.yml monapp` est détaché par défaut (`Since --detach=false was not specified, tasks will be created in the background.`) ; le `docker stack services monapp` immédiatement après affiche `monapp_web  replicated  0/3`. Le guide annonce `3/3`. 5 s plus tard : `3/3`. | `docker stack deploy -c stack.yml monapp` → `docker stack deploy --detach=false -c stack.yml monapp   # attend que les tâches tournent / waits for tasks`. |
| 4 | step-03 | mineur | `docker service update ...` est bloquant (attend la fin du rolling update, ~60 s ici) ; le `docker service ps web --format ...` suivant montre donc l'état **final** (5 tâches `nginx:1.26-alpine Running`, anciennes `Shutdown`), pas « des tâches en cours de bascule ». La vérification « pendant l'update, `docker service ps web` montre Swarm remplacer les tâches progressivement » n'est pas observable avec les commandes données. | Ajouter `--detach` à l'update : `--update-parallelism 1 --update-delay 3s \` → `--update-parallelism 1 --update-delay 3s --detach \`, et remplacer `docker service ps web --format ... \| head` par `watch -n1 "docker service ps web --format '{{.Name}} {{.Image}} {{.CurrentState}}'"   # Ctrl+C quand tout est en 1.26`. |

Conforme à l'annonce : step-01 (`rc-swarm  Ready  Active  Leader  29.9.2`, `active / true`), step-02 création `3/3` puis `5/5` après scale, step-03 rollback → `nginx:1.27-alpine`, step-05 `db_pass` listé et `s3cr3t-de-prod` lu dans `/run/secrets/db_pass`, step-06 `3/3` après quelques secondes, ménage final complet (`Node left the swarm.`, aucun réseau ni conteneur résiduel).

## Non testable ici
- step-02, step-04, step-06 (les `curl -s localhost:8080|9090|8081`) : `Connection refused`. Le noyau du bac à sable n'a pas IPVS (`/proc/net/ip_vs` absent, sur l'hôte aussi), indispensable au routing mesh (ingress) et aux VIP de service. Même cause pour le test complémentaire `wget http://api` depuis `appnet` (`Host is unreachable`). Les services sont bien `Running`, le guide n'est pas en cause. À rejouer sur une VM Ubuntu standard.
- Comportement multi-nœuds du routing mesh : le guide le présente lui-même comme non observable sur 1 nœud.

## QCM
- step-01 : OK
- step-02 : OK
- step-03 : OK
- step-04 : OK
- step-05 : OK
- step-06 : bonne réponse (index 1) acceptable, mais le libellé « La section deploy:, spécifique à Swarm » reproduit l'erreur n°2. Correction : `La section deploy:, spécifique à Swarm` → `La section deploy: (dont update_config et placement ne sont appliqués que par Swarm)`.

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Attente d'une réconciliation asynchrone = pas de boucle qui teste l'état final tout de suite.** Une boucle `until état_voulu` lancée juste après une perturbation peut sortir avant que l'orchestrateur ait vu le changement (Swarm affiche encore `5/5` juste après `docker rm -f`). Attendre d'abord l'état dégradé, ou faire une courte pause, avant d'attendre le retour à l'état voulu. *(Bug réel : docker-swarm step-02 affichait `4/5`.)*
- **Commandes asynchrones par défaut** (`docker stack deploy`, `docker service update --detach`) : une vérification d'état placée juste après doit utiliser `--detach=false` ou attendre.
