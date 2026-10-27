# Rejeu : docker-stockage
Verdict : ⚠️ faisable avec contournements
Machine : Ubuntu 24.04 vierge (rb-stockage) · Durée réelle : ~6 min (annoncée 160) · Étapes rejouées : 6/6

Prérequis appliqué (docker-reseau → docker-images-dockerfile → docker-compose → docker-fondamentaux) : seul Docker est installé par la chaîne. Docker Engine via le dépôt apt officiel (docker-ce 29.9.2) + ajout de `etudiant` au groupe `docker`. Démon lancé à la main (`dockerd &`, pas de systemd : limite du bac à sable).

Note sur le verdict : toutes les commandes passent telles qu'écrites et donnent la sortie annoncée. Le « contournement » concerne une explication fausse (`docker volume prune`) qui laisse l'étudiant avec des volumes qu'il croit supprimés, et la règle B sur les images non pinées.

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-06, pitfalls n°6, cheatsheet | majeur | Le guide affirme que `docker volume prune` « supprime les volumes inutilisés ». Depuis Docker Engine 23 il ne supprime que les volumes **anonymes** inutilisés. Test : `docker volume create orphelin ; docker volume prune -f` → `Total reclaimed space: 0B`, et `docker volume ls` liste toujours `orphelin` (ainsi que `appdata`, `appdata-restore`, `shared`, tous inutilisés). Explication fausse sur un point d'examen DCA. | Step-06 : `` `docker volume prune` supprime enfin les volumes **inutilisés**. `` → `` `docker volume prune` supprime les volumes **anonymes** inutilisés ; `docker volume prune -a` supprime aussi les volumes **nommés** inutilisés (⚠️ irréversible : les données sont perdues). `` (EN : `` `docker volume prune` finally removes **unused** volumes. `` → `` `docker volume prune` removes unused **anonymous** volumes; `docker volume prune -a` also removes unused **named** volumes (⚠️ irreversible: the data is lost). ``). Cheatsheet : `docker volume prune                    # supprime les volumes inutilisés / remove unused` → `docker volume prune -a                 # ⚠️ supprime TOUS les volumes inutilisés, nommés compris / removes ALL unused volumes, named included`. Pitfall n°6 : `Nettoie avec \`docker volume prune\`/\`rm\`.` → `Nettoie avec \`docker volume rm NOM\` (ou \`docker volume prune -a\` pour tous les volumes inutilisés).` |
| 2 | step-01 à step-06, cheatsheet | majeur (règle B) | Image `alpine` sans tag, donc `:latest`, dans 15 commandes (`docker run --rm -v appdata:/data alpine sh -c ...`, etc.). La section B exige des versions pinées ; les guides voisins utilisent `alpine:3.20`. | Remplacer chaque ` alpine ` utilisé comme image par ` alpine:3.20 ` (15 occurrences du fichier, blocs de step-01 à step-06 et cheatsheet). |
| 3 | step-06 | mineur | `docker volume prune` est cité sans avertissement alors qu'il est destructif (section B : « commande à effet de bord = avertissement »). | Couvert par le correctif n°1 (ajout de `⚠️ irréversible`). |

Tout le reste est conforme : step-01 `donnée persistante` + `/var/lib/docker/volumes/appdata/_data` ; step-02 `Bind mount v1` puis `Bind mount v2` sans redémarrage ; step-03 `df -h` → `tmpfs ... /scratch`, puis `ls /scratch` vide après `docker restart` ; step-04 `-v` crée `inexistant/` (propriété root, `rmdir` OK), `--mount` → `bind source path does not exist` et le message de repli s'affiche ; step-05 deux horodatages différents ; step-06 archive de 151 o, `cat` → `donnée persistante` ; le nettoyage final supprime bien les 3 volumes et l'archive.

## Non testable ici
- Prérequis : `$USER` vide sous `docker exec` (pas de session de login), ajout au groupe `docker` refait avec le nom explicite. Limite du bac à sable.

## QCM
- step-01 : OK
- step-02 : OK
- step-03 : OK
- step-04 : OK
- step-05 : OK
- step-06 : OK

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Sémantique des `prune` vérifiée sur la version courante.** Depuis Docker Engine 23, `docker volume prune` ne touche que les volumes anonymes ; il faut `-a` pour les volumes nommés. Ne jamais décrire l'effet d'une commande de nettoyage sans l'avoir exécutée sur un volume nommé de test, et toujours accompagner `prune -a` d'un avertissement.
