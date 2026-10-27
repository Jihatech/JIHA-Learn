# Rejeu : docker-securite
Verdict : ⚠️ faisable avec contournements
Machine : Ubuntu 24.04 vierge (rc-secu) · Durée réelle : ~8 min de commandes, install Docker comprise (annoncée 175) · Étapes rejouées : 6/6

Prérequis appliqués : chaîne `docker-stockage` → … → `docker-fondamentaux`, qui renvoie à l'install officielle Docker Engine (dépôt apt `download.docker.com`, paquets `docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin`, utilisateur ajouté au groupe `docker`). Version obtenue : Docker Engine **29.9.2**. Démon lancé via `dockerd &` (pas de systemd, limite du bac à sable).

## Écarts
| # | Étape | Gravité (bloquant/majeur/mineur) | Constat (commande + sortie réelle, courte) | Correctif proposé (texte exact à remplacer → nouveau texte) |
|---|---|---|---|---|
| 1 | step-06 (+ concepts, objectives, cheatsheet, resources, QCM) | majeur | `export DOCKER_CONTENT_TRUST=1; docker pull ghcr.io/aquasecurity/trivy:0.76.1` → image **non signée** tirée sans erreur, `rc=0` ; `docker pull alpine:3.21` → aucune ligne `Pull (1 of 1)` / `Tagging` de vérification ; `docker trust inspect alpine:3.21` → `docker: unknown command: docker trust`. Sur Docker CE 29.x, DCT n'a plus d'effet (support retiré du CLI ; DCT des images officielles retiré par Docker en août 2025). L'affirmation « `docker pull/run` échoue sur une image non signée » et « les images officielles de Docker Hub le sont » est fausse aujourd'hui. | Commentaire du bloc step-06 : `# export DOCKER_CONTENT_TRUST=1   (puis docker pull/run échoue sur une image non signée)` → `# DOCKER_CONTENT_TRUST=1 (Notary v1) : historique, RETIRÉ par Docker (2025) et sans effet sur Docker Engine 29+. Signature moderne : cosign / Notation (Sigstore).` ; vérification FR : `Enfin, **`DOCKER_CONTENT_TRUST=1`** impose de ne tirer/lancer que des images **signées** (authenticité + intégrité) — les images officielles de Docker Hub le sont.` → `Enfin, le **Docker Content Trust** (`DOCKER_CONTENT_TRUST=1`, Notary v1) a été **retiré par Docker en 2025** et n'a plus d'effet sur Docker Engine 29+ ; il reste à connaître pour l'histoire du DCA, mais la signature d'images se fait aujourd'hui avec **cosign** ou **Notation**.` (idem EN, concepts, cheatsheet `export DOCKER_CONTENT_TRUST=1 # n'autorise que les images signées` et la question QCM step-06). |
| 2 | step-06 | mineur | `docker run --rm aquasec/trivy image ...` → `Unable to find image 'aquasec/trivy:latest' locally` : image non pinée (règle B). Version tirée le jour du rejeu : `Version: 0.76.1`. Même chose dans cheatsheet et troubleshooting. | `docker run --rm aquasec/trivy image` → `docker run --rm aquasec/trivy:0.76.1 image` (3 occurrences : step-06, cheatsheet, troubleshooting FR/EN). |
| 3 | step-06 | mineur | `docker scout quickview nginx:1.27-alpine` → `docker: unknown command: docker scout` sur Docker CE. Le guide dit « plugin à installer » sans donner la commande ; l'étudiant reste sans moyen d'exécuter l'option B. | Après `# Option B : docker scout — livré avec Docker Desktop ; sur Docker CE, plugin à installer` ajouter : `# Docker CE : curl -fsSL https://raw.githubusercontent.com/docker/scout-cli/main/install.sh -o install-scout.sh && sh install-scout.sh` (+ `docker login` requis), ou marquer explicitement l'option B « Docker Desktop seulement ». |
| 4 | step-04 | mineur | Le nettoyage `docker rm -f borne` n'est que dans la prose (`*(Nettoyage : docker rm -f borne.)*`), pas dans le bloc de code. Rejouer l'étape → `Conflict. The container name "/borne" is already in use` (sinon le conteneur vit 300 s). | Ajouter en dernière ligne du bloc step-04 : `docker rm -f borne   # nettoyage / cleanup`. |

Tout le reste est conforme à l'annonce : step-01 `uid=0(root)` / `uid=1000` / `uid=1000(app)` ; step-02 `chown: /etc/hostname: Operation not permitted` puis `chown OK (CHOWN rajouté)` ; step-03 `touch: /tmp/x: Read-only file system` puis `écriture OK dans /tmp` ; step-04 `mem=67108864 cpus=500000000 pids=64`, `552KiB / 64MiB`, `sh: can't fork: Resource temporarily unavailable` ; step-05 `[DB_PASSWORD=s3cr3t-en-clair PATH=...]`. Trivy (une fois le CA du proxy monté, limite bac à sable) : `nginx:1.27-alpine (alpine 3.21.3) Total: 60 (HIGH: 58, CRITICAL: 2)` : tableau conforme.

## Non testable ici
- step-06 (Trivy) : le premier `docker run --rm aquasec/trivy image ...` échoue en `x509: certificate signed by unknown authority` vers `mirror.gcr.io` à cause du proxy HTTPS du bac à sable (CA non présent dans le conteneur Trivy). Contourné avec `-v /etc/ssl/certs/ca-certificates.crt:/etc/ssl/certs/ca-certificates.crt:ro` : le scan fonctionne. Pas un bug du guide.
- `docker scout` : nécessite un compte Docker Hub (connexion), non testé.

## QCM
- step-01 : OK
- step-02 : OK
- step-03 : OK
- step-04 : OK
- step-05 : OK
- step-06 : bonne réponse (index 2) techniquement fausse aujourd'hui : « content trust impose de ne tirer que des images signées » ne s'applique plus sur Docker Engine 29+ (DCT retiré). Correction : `content trust impose de ne tirer que des images signées` → `content trust (Notary v1, retiré en 2025) imposait de ne tirer que des images signées ; aujourd'hui on signe avec cosign/Notation`, ou recentrer la question sur le scan seul.

## Leçon pour CHECKLIST section B (si nouveau type d'erreur)
- **Fonctionnalité retirée par l'éditeur = mention historique.** Vérifier que chaque fonctionnalité présentée comme active (ex. Docker Content Trust / `DOCKER_CONTENT_TRUST=1`, `docker trust`) existe encore dans la version d'outil installée par le guide ; sinon la présenter comme historique et donner l'alternative actuelle. *(Bug réel : docker-securite affirmait que DCT bloque les images non signées, sans effet sur Docker 29.)*
