---
# — Identité (ne change JAMAIS une fois publié) —
id: docker-images-dockerfile
slug: docker-images-dockerfile
order: 13
status: published

# — Titres & accroches (bilingue) —
title_fr: "Docker — images & Dockerfile avancés"
title_en: "Docker — advanced images & Dockerfile"
tagline_fr: "Cache de couches, multi-stage, ENTRYPOINT, registre."
tagline_en: "Layer cache, multi-stage, ENTRYPOINT, registry."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 175
repo: "moby/moby"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [docker-compose]
next: [cicd-github-actions]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [couches-cache, entrypoint-cmd, arg-env-healthcheck, multi-stage, gestion-images, registre-local]
concepts_en: [layers-cache, entrypoint-cmd, arg-env-healthcheck, multi-stage, image-management, local-registry]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "La maîtrise des images Docker au niveau DCA : les couches et le cache de build, ENTRYPOINT vs CMD, ARG/ENV/HEALTHCHECK, les builds multi-stage (image finale minuscule), la gestion des images (history, inspect, prune), et un registre local (push/pull, save/load)."
og_description_en: "Docker image mastery at DCA level: layers and the build cache, ENTRYPOINT vs CMD, ARG/ENV/HEALTHCHECK, multi-stage builds (tiny final image), image management (history, inspect, prune), and a local registry (push/pull, save/load)."
---

## intro

:::lang fr
Savoir écrire un `Dockerfile` qui marche, c'est le niveau débutant. L'examen **Docker Certified Associate (DCA)** attend le niveau au-dessus : *pourquoi mon build est-il lent ? comment le rendre reproductible et cachable ? quelle différence entre `ENTRYPOINT` et `CMD` ? comment obtenir une image de 10 Mo au lieu de 800 ? d'où viennent les images, et comment héberger les miennes ?*

Ce guide couvre le domaine **création & gestion d'images** en profondeur : les **couches** et le **cache de build**, **`ENTRYPOINT` vs `CMD`**, **`ARG`/`ENV`/`HEALTHCHECK`**, les builds **multi-stage** (image finale minuscule), la **gestion des images** (`history`, `inspect`, `prune`), et un **registre local** pour distribuer tes images.

On travaille en **local avec Docker** (natif, Docker Desktop, ou WSL2) — les guides fondamentaux et Compose t'ont posé les bases. Tout est buildé sur ta machine, sans cloud.

**Pour qui c'est :** tu as les guides **Docker fondamentaux** et **Compose**, et tu vises le **DCA**.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas ce qu'est une image ou un conteneur → reviens aux fondamentaux.
- Tu veux le réseau, le stockage ou Swarm → ce sont les guides suivants de la track.
:::

:::lang en
Writing a `Dockerfile` that works is the beginner level. The **Docker Certified Associate (DCA)** exam expects the level above: *why is my build slow? how do you make it reproducible and cacheable? what's the difference between `ENTRYPOINT` and `CMD`? how do you get a 10 MB image instead of 800? where do images come from, and how do you host your own?*

This guide covers the **image creation & management** domain in depth: **layers** and the **build cache**, **`ENTRYPOINT` vs `CMD`**, **`ARG`/`ENV`/`HEALTHCHECK`**, **multi-stage** builds (tiny final image), **image management** (`history`, `inspect`, `prune`), and a **local registry** to distribute your images.

We work **locally with Docker** (native, Docker Desktop, or WSL2) — the fundamentals and Compose guides laid the groundwork. Everything is built on your machine, no cloud.

**Who it's for:** you have the **Docker fundamentals** and **Compose** guides, and you're aiming for the **DCA**.

**When it's NOT the right choice:**

- You don't know what an image or a container is → go back to the fundamentals.
- You want networking, storage or Swarm → those are the next guides in the track.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Expliquer les **couches** d'une image et exploiter le **cache de build** (ordre des instructions).
- Distinguer **`ENTRYPOINT`** et **`CMD`**, et choisir la bonne combinaison.
- Utiliser **`ARG`**, **`ENV`** et **`HEALTHCHECK`** à bon escient.
- Écrire un build **multi-stage** pour une image finale **minimale**.
- Gérer les images : **`history`**, **`inspect`**, **`tag`**, **`prune`**, `.dockerignore`.
- Distribuer une image via un **registre local** (`push`/`pull`) et **`save`/`load`**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Explain an image's **layers** and exploit the **build cache** (instruction order).
- Distinguish **`ENTRYPOINT`** from **`CMD`**, and pick the right combination.
- Use **`ARG`**, **`ENV`** and **`HEALTHCHECK`** appropriately.
- Write a **multi-stage** build for a **minimal** final image.
- Manage images: **`history`**, **`inspect`**, **`tag`**, **`prune`**, `.dockerignore`.
- Distribute an image via a **local registry** (`push`/`pull`) and **`save`/`load`**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides **Docker fondamentaux** et **Docker Compose** acquis.
- **Docker** installé et lancé (`docker version` répond).
- Un dossier de travail vierge :
:::

:::lang en
You should have:

- The **Docker fundamentals** and **Docker Compose** guides under your belt.
- **Docker** installed and running (`docker version` answers).
- A blank working directory:
:::

```bash
mkdir docker-images && cd docker-images
```

## concepts

:::lang fr
**Une image est un empilement de couches.** Chaque instruction du `Dockerfile` (`FROM`, `RUN`, `COPY`…) crée une **couche** en lecture seule, empilée sur la précédente. Le conteneur ajoute par-dessus une fine couche **écriture**. Comprendre ça explique **tout** : la taille, le cache, la performance.

**Le cache de build.** Au build, Docker **réutilise** une couche si l'instruction **et** son contexte n'ont pas changé. Dès qu'une couche change, **toutes les suivantes** sont reconstruites. D'où la règle d'or : **place ce qui change rarement en haut** (installer les dépendances) et **ce qui change souvent en bas** (copier ton code). Sinon chaque modif de code réinstalle tout.

**`ENTRYPOINT` vs `CMD`.** Les deux définissent ce qui s'exécute au démarrage, mais :

- **`ENTRYPOINT`** = la commande **fixe** (le programme). Difficile à écraser.
- **`CMD`** = les **arguments par défaut**, facilement remplacés à l'exécution (`docker run img autre-arg`).

Le combo idéal : `ENTRYPOINT ["monprog"]` + `CMD ["--defaut"]` → l'image **est** `monprog`, avec des arguments par défaut surchargeables.

**`ARG` vs `ENV`.** **`ARG`** est une variable **du build uniquement** (`docker build --build-arg`), absente de l'image finale. **`ENV`** est une variable **d'environnement** persistée **dans** l'image et vue par le conteneur. **`HEALTHCHECK`** définit une commande que Docker exécute pour juger si le conteneur est **sain** (statut `healthy`/`unhealthy`).

**Le build multi-stage**, l'arme anti-obésité. On utilise **plusieurs `FROM`** : une première étape **lourde** (compilateur, outils) qui **construit** l'artefact, puis une étape finale **minimale** qui ne **copie que le résultat** (`COPY --from=…`). L'image livrée ne contient **ni le compilateur, ni les sources** — juste le binaire. On passe de centaines de Mo à quelques Mo.

**La distribution.** Une image se **pousse** vers un **registre** (Docker Hub, ou le tien) sous un **tag** (`registre/nom:version`), et se **tire** ailleurs. Sans réseau, `docker save`/`load` exporte/importe une image en archive `.tar`.
:::

:::lang en
**An image is a stack of layers.** Each `Dockerfile` instruction (`FROM`, `RUN`, `COPY`…) creates a read-only **layer**, stacked on the previous. The container adds a thin **write** layer on top. Understanding this explains **everything**: size, cache, performance.

**The build cache.** At build time, Docker **reuses** a layer if the instruction **and** its context haven't changed. As soon as one layer changes, **all the following ones** are rebuilt. Hence the golden rule: **put what rarely changes at the top** (installing dependencies) and **what changes often at the bottom** (copying your code). Otherwise every code change reinstalls everything.

**`ENTRYPOINT` vs `CMD`.** Both define what runs at startup, but:

- **`ENTRYPOINT`** = the **fixed** command (the program). Hard to override.
- **`CMD`** = the **default arguments**, easily replaced at runtime (`docker run img other-arg`).

The ideal combo: `ENTRYPOINT ["myprog"]` + `CMD ["--default"]` → the image **is** `myprog`, with overridable default arguments.

**`ARG` vs `ENV`.** **`ARG`** is a **build-only** variable (`docker build --build-arg`), absent from the final image. **`ENV`** is an **environment** variable persisted **in** the image and seen by the container. **`HEALTHCHECK`** defines a command Docker runs to judge whether the container is **healthy** (status `healthy`/`unhealthy`).

**The multi-stage build**, the anti-obesity weapon. You use **several `FROM`s**: a first **heavy** stage (compiler, tools) that **builds** the artifact, then a final **minimal** stage that **copies only the result** (`COPY --from=…`). The shipped image contains **neither the compiler nor the sources** — just the binary. You go from hundreds of MB to a few MB.

**Distribution.** An image is **pushed** to a **registry** (Docker Hub, or yours) under a **tag** (`registry/name:version`), and **pulled** elsewhere. Without a network, `docker save`/`load` exports/imports an image as a `.tar` archive.
:::

:::figure docker-multistage
caption_fr: "Schéma 1. Multi-stage : l'étape build (compilateur + sources) produit un binaire ; l'étape finale ne copie que le binaire → image minuscule."
caption_en: "Figure 1. Multi-stage: the build stage (compiler + sources) produces a binary; the final stage copies only the binary → tiny image."
:::

:::lang fr
On avance : couches & cache → ENTRYPOINT/CMD → ARG/ENV/HEALTHCHECK → multi-stage → gestion des images → registre local & save/load.
:::

:::lang en
We'll go: layers & cache → ENTRYPOINT/CMD → ARG/ENV/HEALTHCHECK → multi-stage → image management → local registry & save/load.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Voir le **cache de couches** en action, et l'importance de **l'ordre** des instructions.

Crée un petit projet et un `Dockerfile` **mal ordonné** :
:::

:::lang en
**Goal.** See the **layer cache** in action, and the importance of instruction **order**.

Create a small project and a **badly-ordered** `Dockerfile`:
:::

```bash
echo "print('bonjour')" > app.py
cat > Dockerfile <<'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY app.py .                 # <- le code (change souvent) AVANT / code (changes often) BEFORE
RUN pip install --no-cache-dir requests   # <- les deps (changent rarement) APRÈS / deps AFTER
CMD ["python", "app.py"]
EOF

docker build -t demo:v1 .            # premier build : tout s'exécute / first build: everything runs
touch app.py && docker build -t demo:v2 .   # on "modifie" le code / we "change" the code
```

:::lang fr
**✅ Vérification :** au **second** build, comme `COPY app.py` est **avant** le `RUN pip install`, changer le code **invalide** le cache de la couche `COPY` **et** de tout ce qui suit → `pip install` **se réexécute** (tu vois `RUN pip install…` tourner, pas `CACHED`). Inverse l'ordre (`RUN pip install` **avant** `COPY app.py`), rebuild deux fois : la 2ᵉ fois, `pip install` affiche **`CACHED`** et seul le `COPY` re-tourne. **L'ordre des instructions = la vitesse de tes builds.** Règle : dépendances **en haut**, code **en bas**.
:::

:::lang en
**✅ Check:** on the **second** build, since `COPY app.py` is **before** the `RUN pip install`, changing the code **invalidates** the `COPY` layer cache **and** everything after → `pip install` **re-runs** (you see `RUN pip install…` running, not `CACHED`). Reverse the order (`RUN pip install` **before** `COPY app.py`), rebuild twice: the 2nd time, `pip install` shows **`CACHED`** and only the `COPY` re-runs. **Instruction order = your build speed.** Rule: dependencies **at the top**, code **at the bottom**.
:::

### step-02

:::lang fr
**Objectif.** Comprendre **`ENTRYPOINT` vs `CMD`** par l'expérience.

**🤔 Fixe vs surchargeable.** Crée deux images pour comparer :
:::

:::lang en
**Goal.** Understand **`ENTRYPOINT` vs `CMD`** by experiment.

**🤔 Fixed vs overridable.** Create two images to compare:
:::

```bash
# CMD seul : entièrement remplaçable / CMD only: fully replaceable
printf 'FROM alpine:3.20\nCMD ["echo", "défaut CMD"]\n' > Dockerfile.cmd
docker build -t t-cmd -f Dockerfile.cmd .
docker run t-cmd                 # -> "défaut CMD"
docker run t-cmd echo autre      # -> "autre" (CMD entièrement écrasé) / CMD fully overridden

# ENTRYPOINT + CMD : programme fixe + args par défaut / fixed program + default args
printf 'FROM alpine:3.20\nENTRYPOINT ["echo"]\nCMD ["défaut arg"]\n' > Dockerfile.ep
docker build -t t-ep -f Dockerfile.ep .
docker run t-ep                  # -> "défaut arg"
docker run t-ep bonjour          # -> "bonjour" (seul l'ARGUMENT change) / only the ARGUMENT changes
```

:::lang fr
**✅ Vérification :** avec **`CMD` seul**, `docker run t-cmd echo autre` **remplace tout** (la commande devient `echo autre`). Avec **`ENTRYPOINT ["echo"]` + `CMD`**, `docker run t-ep bonjour` garde le programme `echo` **fixe** et ne remplace que l'**argument** → `bonjour`. C'est **la** distinction d'examen : `ENTRYPOINT` = **le programme** (l'image *est* cet outil), `CMD` = **les arguments par défaut**, surchargés par ce qu'on passe à `docker run`.
:::

:::lang en
**✅ Check:** with **`CMD` only**, `docker run t-cmd echo autre` **replaces everything** (the command becomes `echo autre`). With **`ENTRYPOINT ["echo"]` + `CMD`**, `docker run t-ep bonjour` keeps the `echo` program **fixed** and only replaces the **argument** → `bonjour`. That's **the** exam distinction: `ENTRYPOINT` = **the program** (the image *is* that tool), `CMD` = **the default arguments**, overridden by what you pass to `docker run`.
:::

### step-03

:::lang fr
**Objectif.** Utiliser **`ARG`**, **`ENV`** et **`HEALTHCHECK`**.

**🤔 Build-time vs run-time vs santé.** Crée une image qui les combine :
:::

:::lang en
**Goal.** Use **`ARG`**, **`ENV`** and **`HEALTHCHECK`**.

**🤔 Build-time vs run-time vs health.** Create an image that combines them:
:::

```bash
cat > Dockerfile.vars <<'EOF'
FROM nginx:1.27-alpine
ARG VERSION=dev                 # variable de BUILD (absente de l'image finale) / BUILD var
ENV APP_VERSION=$VERSION         # persistée DANS l'image / persisted IN the image
RUN echo "build de la version $VERSION" > /usr/share/nginx/html/index.html
HEALTHCHECK --interval=5s --timeout=3s CMD wget -qO- localhost/ || exit 1
EOF
docker build --build-arg VERSION=1.4 -t t-vars -f Dockerfile.vars .

docker run -d --name web t-vars
docker exec web printenv APP_VERSION      # -> 1.4 (ENV persistée) / ENV persisted
sleep 8 ; docker ps --filter name=web --format '{{.Status}}'   # -> Up ... (healthy)
```

:::lang fr
**✅ Vérification :** `docker exec web printenv APP_VERSION` renvoie **`1.4`** — la valeur passée en **`ARG`** au build a été copiée dans une **`ENV`** persistée (mais `VERSION`, l'`ARG`, n'existe **pas** dans le conteneur : c'était build-time). Après quelques secondes, `docker ps` affiche **`Up … (healthy)`** : le **`HEALTHCHECK`** a exécuté sa commande et jugé le conteneur **sain**. Retiens : **`ARG`** = build seulement, **`ENV`** = dans l'image/le conteneur, **`HEALTHCHECK`** = supervision intégrée. *(Nettoyage : `docker rm -f web`.)*
:::

:::lang en
**✅ Check:** `docker exec web printenv APP_VERSION` returns **`1.4`** — the value passed as **`ARG`** at build was copied into a persisted **`ENV`** (but `VERSION`, the `ARG`, does **not** exist in the container: it was build-time). After a few seconds, `docker ps` shows **`Up … (healthy)`**: the **`HEALTHCHECK`** ran its command and judged the container **healthy**. Remember: **`ARG`** = build only, **`ENV`** = in the image/container, **`HEALTHCHECK`** = built-in supervision. *(Cleanup: `docker rm -f web`.)*
:::

### step-04

:::lang fr
**Objectif.** Écrire un build **multi-stage** et mesurer la **réduction de taille**.

**🤔 Compiler dans une image, livrer dans une autre.** On compile un binaire Go dans une image lourde, puis on ne copie que le binaire dans une image minuscule. Crée les fichiers :
:::

:::lang en
**Goal.** Write a **multi-stage** build and measure the **size reduction**.

**🤔 Compile in one image, ship in another.** We compile a Go binary in a heavy image, then copy only the binary into a tiny image. Create the files:
:::

```bash
cat > main.go <<'EOF'
package main
import ("fmt"; "net/http")
func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello depuis un binaire Go statique")
	})
	http.ListenAndServe(":8080", nil)
}
EOF

cat > Dockerfile.multi <<'EOF'
# --- étape 1 : build (lourde) / stage 1: build (heavy) ---
FROM golang:1.22-alpine AS build
WORKDIR /src
COPY main.go .
RUN go mod init app && CGO_ENABLED=0 go build -o /app .

# --- étape 2 : finale (minimale) / stage 2: final (minimal) ---
FROM alpine:3.20
COPY --from=build /app /app          # ne copie QUE le binaire / copies ONLY the binary
EXPOSE 8080
ENTRYPOINT ["/app"]
EOF
docker build -t t-multi -f Dockerfile.multi .

docker images | grep -E 'golang|t-multi'    # compare les tailles / compare the sizes
```

:::lang fr
**✅ Vérification :** `docker images` montre que **`golang:1.22-alpine`** pèse plusieurs centaines de Mo, tandis que **`t-multi`** ne fait que **~15-20 Mo** (Alpine + le binaire). L'image finale **ne contient ni Go, ni les sources** — le `COPY --from=build` n'a repris **que** le binaire compilé. Lance-la (`docker run -d -p 8080:8080 t-multi` puis `curl localhost:8080`) : elle sert la page. **Le multi-stage** est la technique n°1 pour des images de prod légères, rapides à distribuer et à faible surface d'attaque. *(Nettoyage : `docker rm -f $(docker ps -aq --filter ancestor=t-multi) 2>/dev/null`.)*
:::

:::lang en
**✅ Check:** `docker images` shows that **`golang:1.22-alpine`** weighs several hundred MB, while **`t-multi`** is only **~15-20 MB** (Alpine + the binary). The final image contains **neither Go nor the sources** — the `COPY --from=build` took **only** the compiled binary. Run it (`docker run -d -p 8080:8080 t-multi` then `curl localhost:8080`): it serves the page. **Multi-stage** is the #1 technique for lightweight production images, fast to distribute and low attack surface. *(Cleanup: `docker rm -f $(docker ps -aq --filter ancestor=t-multi) 2>/dev/null`.)*
:::

### step-05

:::lang fr
**Objectif.** Gérer les images : **couches** (`history`), **métadonnées** (`inspect`), **nettoyage** (`prune`).

**🤔 Regarder sous le capot.** Inspecte l'image multi-stage :
:::

:::lang en
**Goal.** Manage images: **layers** (`history`), **metadata** (`inspect`), **cleanup** (`prune`).

**🤔 Look under the hood.** Inspect the multi-stage image:
:::

```bash
docker history t-multi                       # les couches et leur taille / the layers and their sizes
docker inspect t-multi --format '{{.Config.Entrypoint}} / {{.Config.ExposedPorts}}'
docker image ls                              # toutes les images / all images

# nettoyage / cleanup
docker image prune -f                        # supprime les images "dangling" (sans tag) / dangling images
docker builder prune -f                      # vide le cache de build / clears the build cache
```

:::lang fr
**✅ Vérification :** `docker history t-multi` liste les **couches** de l'image (chaque `COPY`/`ENTRYPOINT`…) avec leur **taille** — tu vois concrètement de quoi l'image est faite. `docker inspect --format …` extrait ses **métadonnées** (ici `ENTRYPOINT` = `[/app]` et le port exposé). `docker image prune` supprime les images **dangling** (couches orphelines des rebuilds, qui s'accumulent), et `builder prune` vide le **cache de build** — l'hygiène disque indispensable quand on builde souvent. *(`docker system df` montre l'espace pris par images/conteneurs/cache.)*
:::

:::lang en
**✅ Check:** `docker history t-multi` lists the image's **layers** (each `COPY`/`ENTRYPOINT`…) with their **size** — you see concretely what the image is made of. `docker inspect --format …` extracts its **metadata** (here `ENTRYPOINT` = `[/app]` and the exposed port). `docker image prune` deletes **dangling** images (orphan layers from rebuilds, which pile up), and `builder prune` clears the **build cache** — the disk hygiene you need when building often. *(`docker system df` shows the space taken by images/containers/cache.)*
:::

### step-06

:::lang fr
**Objectif.** Distribuer une image : un **registre local**, et l'export **`save`/`load`**.

**🤔 Ton propre Docker Hub.** L'image `registry:2` est un registre complet. On la lance, on **tague** notre image pour ce registre, on la **pousse**, et on la **retire**. Puis l'alternative hors-ligne `save`/`load`.
:::

:::lang en
**Goal.** Distribute an image: a **local registry**, and the **`save`/`load`** export.

**🤔 Your own Docker Hub.** The `registry:2` image is a full registry. We run it, **tag** our image for it, **push** it, and **pull** it. Then the offline `save`/`load` alternative.
:::

```bash
docker run -d -p 5000:5000 --name registry registry:2      # un registre local sur :5000 / a local registry

docker tag t-multi localhost:5000/monapp:1.0               # tag = registre/nom:version / registry/name:version
docker push localhost:5000/monapp:1.0                       # POUSSE vers le registre / PUSH
docker rmi localhost:5000/monapp:1.0                        # retire l'image locale / remove local copy
docker pull localhost:5000/monapp:1.0                       # la RETIRE du registre / PULL it back

# alternative hors-ligne : archive .tar / offline alternative: .tar archive
docker save t-multi -o t-multi.tar                          # exporte / export
docker load -i t-multi.tar                                  # réimporte / re-import
```

:::lang fr
**✅ Vérification :** `docker push localhost:5000/monapp:1.0` téléverse l'image dans **ton** registre (`registry:2`) ; après avoir supprimé la copie locale, `docker pull` la **récupère** depuis le registre — la boucle **push/pull** complète, comme avec Docker Hub, mais chez toi. Le **tag** encode la destination : `registre/nom:version`. En parallèle, `docker save`/`load` transporte une image en **archive `.tar`** sans aucun réseau (utile en environnement isolé). Tu sais **distribuer** tes images de trois façons : Hub public, registre privé, archive. *(Nettoyage : `docker rm -f registry ; rm -f t-multi.tar`.)*
:::

:::lang en
**✅ Check:** `docker push localhost:5000/monapp:1.0` uploads the image to **your** registry (`registry:2`); after deleting the local copy, `docker pull` **retrieves** it from the registry — the full **push/pull** loop, like with Docker Hub, but at home. The **tag** encodes the destination: `registry/name:version`. In parallel, `docker save`/`load` moves an image as a **`.tar` archive** with no network (useful in an isolated environment). You know how to **distribute** your images three ways: public Hub, private registry, archive. *(Cleanup: `docker rm -f registry ; rm -f t-multi.tar`.)*
:::

## pitfalls

:::lang fr
**1. Copier le code avant d'installer les dépendances.** Chaque modif de code invalide le cache et **réinstalle tout**. Ordre correct : dépendances (rarement changées) **en haut**, code **en bas**.

**2. Confondre `ENTRYPOINT` et `CMD`.** `CMD` est **entièrement** remplacé par les arguments de `docker run` ; `ENTRYPOINT` reste. Pour un outil, `ENTRYPOINT` ; pour un défaut surchargeable, `CMD`.

**3. Mettre un secret dans un `ARG`/`ENV`.** Les `ARG`/`ENV` finissent dans les **couches** de l'image (visibles via `docker history`). Ne jamais y mettre de mot de passe/clé — utilise les secrets (guide sécurité).

**4. `ADD` au lieu de `COPY`.** `ADD` a des comportements magiques (décompression, URL) sources de surprises. Préfère **`COPY`** ; réserve `ADD` à ses cas précis.

**5. Oublier `.dockerignore`.** Sans lui, `COPY . .` embarque `.git`, `node_modules`, des artefacts — build lent et image lourde. Ajoute un `.dockerignore` (comme `.gitignore`).

**6. Ne pas nettoyer.** Les images **dangling** et le **cache de build** grossissent sans fin. `docker image prune`, `docker builder prune`, `docker system df` régulièrement.

**7. Oublier le multi-stage.** Livrer l'image de build (avec compilateur + sources) = image énorme et exposée. Sépare **build** et **runtime** avec un multi-stage.
:::

:::lang en
**1. Copying code before installing dependencies.** Every code change invalidates the cache and **reinstalls everything**. Correct order: dependencies (rarely changed) **at the top**, code **at the bottom**.

**2. Confusing `ENTRYPOINT` and `CMD`.** `CMD` is **entirely** replaced by `docker run`'s arguments; `ENTRYPOINT` stays. For a tool, `ENTRYPOINT`; for an overridable default, `CMD`.

**3. Putting a secret in an `ARG`/`ENV`.** `ARG`/`ENV` end up in the image **layers** (visible via `docker history`). Never put a password/key there — use secrets (security guide).

**4. `ADD` instead of `COPY`.** `ADD` has magic behaviors (unpacking, URLs) that cause surprises. Prefer **`COPY`**; reserve `ADD` for its specific cases.

**5. Forgetting `.dockerignore`.** Without it, `COPY . .` bundles `.git`, `node_modules`, artifacts — slow build and heavy image. Add a `.dockerignore` (like `.gitignore`).

**6. Not cleaning up.** **Dangling** images and the **build cache** grow endlessly. `docker image prune`, `docker builder prune`, `docker system df` regularly.

**7. Skipping multi-stage.** Shipping the build image (with compiler + sources) = a huge, exposed image. Separate **build** and **runtime** with a multi-stage.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu expliques les **couches** et tu ordonnes un `Dockerfile` pour le **cache**.
- [ ] Tu distingues **`ENTRYPOINT`** et **`CMD`** et tu choisis la bonne combinaison.
- [ ] Tu utilises **`ARG`**/**`ENV`**/**`HEALTHCHECK`** à bon escient.
- [ ] Tu écris un build **multi-stage** et tu obtiens une image **minimale**.
- [ ] Tu lis `history`/`inspect` et tu **nettoies** (`prune`).
- [ ] Tu **pousses/tires** via un registre local et tu utilises **`save`/`load`**.

Six cases cochées = tu tiens **création & gestion d'images** du DCA.
:::

:::lang en
You know it works when…

- [ ] You explain **layers** and order a `Dockerfile` for the **cache**.
- [ ] You distinguish **`ENTRYPOINT`** from **`CMD`** and pick the right combination.
- [ ] You use **`ARG`**/**`ENV`**/**`HEALTHCHECK`** appropriately.
- [ ] You write a **multi-stage** build and get a **minimal** image.
- [ ] You read `history`/`inspect` and **clean up** (`prune`).
- [ ] You **push/pull** via a local registry and use **`save`/`load`**.

Six boxes ticked = you hold DCA **image creation & management**.
:::

## next

:::lang fr
La suite de la track Docker → DCA :

1. **Réseau Docker** — bridge, host, réseaux définis par l'utilisateur, DNS, publication de ports.
2. **Stockage & volumes** — volumes, bind mounts, tmpfs, sauvegarde de données.
3. **Sécurité** — utilisateur non-root, capabilities, read-only, limites, secrets, scan.
4. **Orchestration Swarm** — services, stacks, secrets, réseau overlay.
5. **Projet d'entreprise** — image multi-stage → registre → stack Swarm.
:::

:::lang en
The rest of the Docker → DCA track:

1. **Docker networking** — bridge, host, user-defined networks, DNS, port publishing.
2. **Storage & volumes** — volumes, bind mounts, tmpfs, data backup.
3. **Security** — non-root user, capabilities, read-only, limits, secrets, scanning.
4. **Swarm orchestration** — services, stacks, secrets, overlay network.
5. **Enterprise project** — multi-stage image → registry → Swarm stack.
:::

## cheatsheet

:::lang fr
Aide-mémoire images & Dockerfile.
:::

:::lang en
Images & Dockerfile cheat sheet.
:::

```bash
# Build & cache
docker build -t nom:tag .        # deps EN HAUT, code EN BAS pour le cache / deps top, code bottom
docker build --build-arg K=V -t nom .      # passer un ARG / pass an ARG

# Dockerfile clés / key instructions
# FROM ; WORKDIR ; COPY (pas ADD) ; RUN ; ENV k=v ; ARG k=v (build) ; EXPOSE
# ENTRYPOINT ["prog"]  (fixe/fixed)  +  CMD ["arg"]  (défaut surchargeable/overridable)
# HEALTHCHECK --interval=5s CMD cmd || exit 1

# Multi-stage
# FROM img AS build ; ... ; FROM slim ; COPY --from=build /bin /bin

# Gestion / management
docker images ; docker history IMG ; docker inspect IMG ; docker system df
docker image prune -f ; docker builder prune -f

# Distribution
docker tag IMG registre/nom:tag ; docker push registre/nom:tag ; docker pull ...
docker run -d -p 5000:5000 registry:2      # registre local / local registry
docker save IMG -o img.tar ; docker load -i img.tar   # hors-ligne / offline
```

## resources

:::lang fr
- [Référence du Dockerfile](https://docs.docker.com/reference/dockerfile/) — toutes les instructions.
- [Builds multi-stage](https://docs.docker.com/build/building/multi-stage/) et [bonnes pratiques d'image](https://docs.docker.com/build/building/best-practices/).
- [Le registre `registry:2`](https://hub.docker.com/_/registry) et [`docker save`/`load`](https://docs.docker.com/reference/cli/docker/image/save/).
- Domaine **DCA « Image Creation, Management, and Registry »** (~20 %).
:::

:::lang en
- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) — all instructions.
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/) and [image best practices](https://docs.docker.com/build/building/best-practices/).
- [The `registry:2` registry](https://hub.docker.com/_/registry) and [`docker save`/`load`](https://docs.docker.com/reference/cli/docker/image/save/).
- **DCA "Image Creation, Management, and Registry"** domain (~20%).
:::

## troubleshooting

:::lang fr
**Mon build est lent à chaque petite modif.** Le cache est cassé par l'ordre : mets `RUN` d'installation des dépendances **avant** le `COPY` du code. Vérifie avec `docker build` (les lignes `CACHED`).

**`docker run img arg` ignore mon `arg`.** L'image a un `ENTRYPOINT` : `arg` devient un **argument** de l'entrypoint, pas une nouvelle commande. Pour tout remplacer : `docker run --entrypoint autre img`.

**`go build` échoue avec « go.mod not found ».** Ajoute `go mod init app` avant `go build` (mode module de Go). C'est fait dans l'étape build du guide.

**L'image finale est énorme.** Tu livres l'étape de build. Utilise un **multi-stage** et une base **slim/alpine**, et un `.dockerignore`.

**`docker push localhost:5000/...` échoue (« http: server gave HTTP response to HTTPS client »).** Pour un registre **non-`localhost`**, Docker exige HTTPS. Sur `localhost` c'est toléré ; sinon configure le registre en `insecure-registries` dans `/etc/docker/daemon.json`.

**« no space left on device » en buildant.** Cache et images dangling saturent le disque. `docker system prune -af` (attention : supprime tout ce qui n'est pas utilisé) et `docker system df` pour surveiller.
:::

:::lang en
**My build is slow on every small change.** The cache is broken by order: put the dependency-install `RUN` **before** the code `COPY`. Check with `docker build` (the `CACHED` lines).

**`docker run img arg` ignores my `arg`.** The image has an `ENTRYPOINT`: `arg` becomes an **argument** to the entrypoint, not a new command. To replace everything: `docker run --entrypoint other img`.

**`go build` fails with "go.mod not found".** Add `go mod init app` before `go build` (Go's module mode). It's done in the guide's build stage.

**The final image is huge.** You're shipping the build stage. Use a **multi-stage** and a **slim/alpine** base, and a `.dockerignore`.

**`docker push localhost:5000/...` fails ("http: server gave HTTP response to HTTPS client").** For a **non-`localhost`** registry, Docker requires HTTPS. On `localhost` it's tolerated; otherwise configure the registry in `insecure-registries` in `/etc/docker/daemon.json`.

**"no space left on device" while building.** Cache and dangling images fill the disk. `docker system prune -af` (careful: removes everything unused) and `docker system df` to monitor.
:::
