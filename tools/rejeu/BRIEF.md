# Mission : rejouer des guides JIHA-Learn comme un étudiant

Tu es un étudiant débutant-intermédiaire qui suit un guide de formation DevOps **à la lettre**,
sur une machine neuve. But : trouver tout ce qui empêche un étudiant réel d'arriver au bout
(commande qui échoue, sortie différente de celle annoncée, étape floue, prérequis caché,
version obsolète, risque non signalé). Tu NE modifies AUCUN repo : tu rédiges un rapport.

## Sources
- Guides : `content/<id>.md` (front-matter YAML + sections `:::lang fr` / `:::lang en`).
  Suis la version **FR** ; vérifie seulement que la version EN dit la même chose aux endroits qui posent problème.
  Les blocs de code ne sont écrits qu'une fois (partagés FR/EN).
- Bugs déjà vécus à rechercher en priorité : section B de `../jiha-formation/docs/CHECKLIST.md`.
- Format attendu d'un guide : `../jiha-formation/docs/GUIDE-TEMPLATE.md` (lis seulement si utile).

## Machine vierge (obligatoire)
- Crée ta machine : `tools/rejeu/new-box.sh <nom>` (Ubuntu 24.04 privilégiée, utilisateur `etudiant`
  avec sudo sans mot de passe, rien d'autre d'installé). Exécute les commandes du guide avec
  `docker exec -u etudiant -w /home/etudiant <nom> bash -lc '...'`.
- **Une machine neuve par guide** (le guide suivant ne doit pas profiter de ce que le précédent a installé),
  sauf si le guide déclare explicitement un guide précédent en prérequis : alors installe d'abord ce que
  ce prérequis fait installer, en le notant.
- Si le guide demande d'installer Docker, fais-le **exactement** comme le guide l'indique. Pour démarrer
  le démon dans la machine (pas de systemd) : `sudo bash -c 'dockerd >/var/log/dockerd.log 2>&1 &'`, puis
  note-le comme limite du bac à sable, pas comme bug du guide.
- N'utilise que les noms de machines qui commencent par ton préfixe. N'arrête, ne supprime et ne touche
  aucun autre conteneur ni volume du Docker hôte. À la fin, supprime tes machines :
  `docker rm -f <nom>; docker volume rm -f <nom>-docker`.
- Ressources partagées (2 vCPU, 7 Go pour 3 rejoueurs en parallèle) : une seule machine à la fois.

## Limites connues du bac à sable (à NE PAS compter comme bugs du guide)
- Pas d'IP publique ni de DNS public vers la machine ; pas de navigateur graphique (utilise `curl`).
- Le trafic HTTPS passe par un proxy dont le certificat est déjà approuvé dans la machine.
- Pas de systemd. Si un pas dépend vraiment de systemd/IP publique, marque-le « non testable ici ».

## Méthode, pour chaque étape (`### step-xx`)
1. Exécute les commandes **telles qu'écrites** (copier-coller), dans l'ordre, y compris prérequis et vérifications.
2. Compare la sortie réelle à ce que le guide annonce (critères de succès, « tu dois voir… »).
3. Si ça casse : jusqu'à 3 tentatives de contournement **évidentes pour un étudiant** pour continuer ;
   note la cause et le correctif exact du texte du guide.
4. Note aussi : versions d'images non pinées (`:latest`), commande destructive sans avertissement,
   explication fausse, étape ambiguë, temps réel très différent de `duration_min`.
5. Vérifie que les QCM de l'étape (`../jiha-formation/lib/quiz/data/<id>.json`, clé `step-xx`,
   champ `answer` = index de la bonne réponse) ont une bonne réponse correcte et non ambiguë.

## Livrable : `docs/rejeu/<date>-<filière>/<id>.md` (un fichier par guide), exactement ce gabarit

```
# Rejeu : <id>
Verdict : ✅ faisable tel quel | ⚠️ faisable avec contournements | ❌ bloquant
Machine : Ubuntu 24.04 vierge · Durée réelle : <x> min (annoncée <y>) · Étapes rejouées : <n>/<total>

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |

## Non testable ici
- <étape> : <raison>

## QCM
- <step-xx> : OK | problème + correction

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- <formulation générique>
```

Sois factuel : chaque écart cite la commande et la sortie réelle. Pas d'écart inventé, pas de
reformulation de style. Réponds à la fin avec seulement : chemin des rapports + verdict de chaque guide.
