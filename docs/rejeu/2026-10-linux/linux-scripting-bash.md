# Rejeu : linux-scripting-bash
Verdict : ✅ faisable tel quel
Machine : Ubuntu 24.04 vierge (new-vm.sh, systemd PID 1, bash 5.2.21) · Durée réelle : ~10 min de calcul (annoncée 185, cohérent pour un étudiant qui tape et lit) · Étapes rejouées : 6/6

Toutes les sorties annoncées sont obtenues mot pour mot : step-01 (`enfant voit:` vide puis `enfant voit: bonjour`, `ll is aliased to 'ls -lah'`), step-02 (`double: bonjour le monde` / `simple: bonjour $nom` / date), step-03 (`code retour = 0` puis usage sur stderr + `code retour = 1`, vérifié avec `2>/dev/null`), step-04, step-05, step-06 (`verdict = 0` puis `verdict = 1` avec `[FAIL] disque / à 52% (>= 5%)`). Cas d'erreur testés en plus : `./verif.sh /etc` (branche dossier), `./verif.sh /nope` (`/nope introuvable` sur stderr), chemin avec espace, script sans `+x` (`Permission denied`, code 126, `bash nox.sh` fonctionne comme annoncé au piège 4), `sudo systemctl stop cron` puis `./healthcheck.sh` → `[FAIL] service cron INACTIF`, `verdict = 1` (le `|| probleme=1` neutralise bien `set -e` dans la fonction).

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-06 | mineur | Le seuil n'est pas validé. `./healthcheck.sh 80%` (forme naturelle, l'en-tête affiche « seuil disque 80% ») → `[[: 80%: syntax error: operand expected (error token is "%")`, l'erreur dans la condition du `if` n'arrête pas `set -e`, le script passe dans le `else` : `[OK] disque / à 52%`, `== Tout est sain ==`, `verdict = 0` (faux OK silencieux). `./healthcheck.sh abc` → `line 23: abc: unbound variable`, `verdict = 1` sans aucun `[FAIL]` (sortie par `set -u`, pas par le contrôle). | Dans le script, après `seuil="${1:-80}"  …` ajouter : `[[ $seuil =~ ^[0-9]+$ ]] \|\| { echo "usage: $0 [seuil_en_%_sans_signe]" >&2; exit 2; }`. Et ajouter à la vérification : « Un argument non numérique (`80%`, `abc`) est refusé avec le code `2` : on valide toujours une entrée avant de l'utiliser dans `[[ … -ge … ]]`, car une erreur de syntaxe dans une condition `if` n'est pas arrêtée par `set -e`. » |
| 2 | step-06 (vérification FR/EN) | mineur | Le texte dit que `set -euo pipefail` est « arrêt sur erreur, variable non définie, ou échec dans un pipe ». Le cas #1 montre une exception réelle que l'étudiant rencontrera : `set -e` ne s'applique pas aux commandes testées par `if`, `while`, `&&`, `\|\|` (c'est d'ailleurs pour cela que `verifier_service "$svc" \|\| probleme=1` fonctionne). | Après « (arrêt sur erreur, variable non définie, ou échec dans un pipe) » ajouter : « , sauf pour une commande placée dans la condition d'un `if`/`while` ou à gauche de `&&`/`\|\|` : c'est voulu, et c'est ce qui permet `verifier_service "$svc" \|\| probleme=1` » (idem EN : « except for a command used as an `if`/`while` condition or on the left of `&&`/`\|\|`: that's by design, and it's what makes `verifier_service "$svc" \|\| probleme=1` work »). |

ShellCheck 0.9.0 (paquet Ubuntu) sur les 5 scripts : `healthcheck.sh`, `verif.sh`, `boucles.sh` propres ; `bonjour.sh` SC2016 (info, littéral voulu) ; `salut.sh` SC2145 sur `"…(tous: $@)"` (sans effet ici, `echo` rejoint les arguments par un espace : `Salut, Ada ! (tous: Ada Bob)`). Aucun avertissement ne change le comportement pour l'étudiant.

## Non testable ici
- Aucune étape. (Seule adaptation : `bash -lc` non interactif ; step-01 rejoué en `bash -lic` pour que l'alias se comporte comme dans un terminal.)

## QCM
- step-01 : OK
- step-02 : OK
- step-03 : OK
- step-04 : OK
- step-05 : OK
- step-06 : OK (la réponse reste juste ; voir écart #2 pour la nuance `set -e`)

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Script qui prend un argument : le guide le valide et teste le cas invalide.** Une entrée mal formée utilisée dans `[[ $x -ge $y ]]` provoque une erreur de syntaxe que `set -e` ignore dans une condition `if` : le script conclut « OK » à tort. Rejouer chaque script avec un argument absent, non numérique et hors bornes.
