---
# — Identité (ne change JAMAIS une fois publié) —
id: docker-securite
slug: docker-securite
order: 16
status: published

# — Titres & accroches (bilingue) —
title_fr: "Docker — sécurité"
title_en: "Docker — security"
tagline_fr: "Non-root, capabilities, read-only, limites, secrets, scan."
tagline_en: "Non-root, capabilities, read-only, limits, secrets, scan."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 175
repo: "moby/moby"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [docker-stockage]
next: [cicd-github-actions]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [utilisateur-non-root, capabilities, read-only-rootfs, limites-ressources, secrets, scan-content-trust]
concepts_en: [non-root-user, capabilities, read-only-rootfs, resource-limits, secrets, scanning-content-trust]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "La sécurité Docker au niveau DCA : faire tourner un conteneur en non-root, retirer les capabilities inutiles, un rootfs en lecture seule, les limites de ressources (mémoire, CPU, pids) contre le déni de service, la gestion des secrets (et pourquoi pas les ENV), et l'analyse de vulnérabilités + le content trust."
og_description_en: "Docker security at DCA level: running a container as non-root, dropping unneeded capabilities, a read-only rootfs, resource limits (memory, CPU, pids) against denial of service, secret handling (and why not ENV), and vulnerability scanning + content trust."
---

## intro

:::lang fr
Un conteneur mal sécurisé est une **porte ouverte** sur ton hôte : par défaut, il tourne en **root**, avec des privilèges qu'il n'utilise pas, sans limite de ressources. L'examen **DCA** consacre **15 %** à la sécurité, et pose les vraies questions : *pourquoi ne jamais tourner en root ? quelles capabilities retirer ? comment empêcher un conteneur d'écrire n'importe où ? de saturer la machine ? comment gérer un secret sans le laisser fuir ? comment savoir si mon image a des failles ?*

Ce guide couvre le domaine **sécurité** : le **non-root** (`USER`/`--user`), les **capabilities** (`--cap-drop`), le **rootfs en lecture seule** (`--read-only`), les **limites de ressources** (mémoire, CPU, pids), la **gestion des secrets** (et pourquoi **pas** les `ENV`), et l'**analyse de vulnérabilités** + le **content trust**.

On travaille en **local avec Docker**, avec `alpine`. Le principe directeur, du début à la fin : le **moindre privilège** — ne donner à un conteneur **que** ce dont il a besoin, et rien de plus.

**Pour qui c'est :** tu as les guides Docker précédents et tu vises le **DCA**.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas construire une image → reviens au guide images.
- Tu veux l'orchestration → c'est le guide Swarm (les **secrets Swarm** y sont pratiqués).
:::

:::lang en
A poorly secured container is an **open door** onto your host: by default, it runs as **root**, with privileges it never uses, with no resource limit. The **DCA** exam devotes **15%** to security, asking the real questions: *why never run as root? which capabilities to drop? how do you stop a container from writing anywhere? from saturating the machine? how do you handle a secret without leaking it? how do you know if your image has vulnerabilities?*

This guide covers the **security** domain: **non-root** (`USER`/`--user`), **capabilities** (`--cap-drop`), the **read-only rootfs** (`--read-only`), **resource limits** (memory, CPU, pids), **secret handling** (and why **not** `ENV`), and **vulnerability scanning** + **content trust**.

We work **locally with Docker**, with `alpine`. The guiding principle, start to finish: **least privilege** — give a container **only** what it needs, and nothing more.

**Who it's for:** you have the earlier Docker guides and you're aiming for the **DCA**.

**When it's NOT the right choice:**

- You can't build an image → go back to the images guide.
- You want orchestration → that's the Swarm guide (**Swarm secrets** are practiced there).
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Faire tourner un conteneur en **non-root** (`USER` dans l'image, `--user` au run).
- **Retirer les capabilities** inutiles (`--cap-drop ALL` + `--cap-add` ciblé).
- Imposer un **rootfs en lecture seule** (`--read-only` + `--tmpfs`).
- Poser des **limites de ressources** (`--memory`, `--cpus`, `--pids-limit`).
- Comprendre pourquoi un **secret** ne va **pas** dans un `ENV`, et les alternatives.
- **Scanner** une image (`docker scout`/Trivy) et situer le **content trust**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Run a container as **non-root** (`USER` in the image, `--user` at run).
- **Drop unneeded capabilities** (`--cap-drop ALL` + targeted `--cap-add`).
- Enforce a **read-only rootfs** (`--read-only` + `--tmpfs`).
- Set **resource limits** (`--memory`, `--cpus`, `--pids-limit`).
- Understand why a **secret** does **not** go in an `ENV`, and the alternatives.
- **Scan** an image (`docker scout`/Trivy) and place **content trust**.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides Docker précédents acquis.
- **Docker** installé et lancé.
- Un dossier de travail vierge :
:::

:::lang en
You should have:

- The earlier Docker guides under your belt.
- **Docker** installed and running.
- A blank working directory:
:::

```bash
mkdir docker-securite && cd docker-securite
```

## concepts

:::lang fr
Le **moindre privilège** décline plusieurs couches de défense.

**Non-root.** Par défaut, le process d'un conteneur tourne en **root** (`uid 0`) — et ce root, s'il s'échappe (faille du noyau, montage mal fait), est **root sur l'hôte**. La parade : faire tourner l'application en **utilisateur normal**, via **`USER`** dans le Dockerfile ou **`--user`** au run. Un service web n'a **aucune** raison d'être root.

**Les capabilities.** Root n'est pas monolithique : le noyau Linux le découpe en **capabilities** (CAP_CHOWN, CAP_NET_BIND_SERVICE, CAP_SYS_ADMIN…). Docker n'en accorde déjà **qu'un sous-ensemble** par défaut. La bonne pratique : **tout retirer** (`--cap-drop ALL`) puis **rajouter uniquement** ce qu'il faut (`--cap-add`). Un conteneur sans capability inutile a une **surface d'attaque** minuscule.

**Le rootfs en lecture seule.** Avec **`--read-only`**, le système de fichiers du conteneur devient **immuable** : une intrusion ne peut ni déposer un binaire, ni modifier une config. Pour les rares dossiers qui doivent écrire (caches, `/tmp`), on ajoute un **`--tmpfs`** ciblé. Immuabilité = un pilier de la sécurité des conteneurs.

**Les limites de ressources.** Sans limite, un conteneur peut consommer **toute** la RAM/le CPU de l'hôte (déni de service, volontaire ou par bug). On borne : **`--memory`** (RAM max, tue le conteneur au dépassement = `OOMKilled`), **`--cpus`** (part de CPU), **`--pids-limit`** (nombre de processus, contre les *fork bombs*).

**Les secrets.** **Ne jamais** mettre un mot de passe/clé dans une **variable d'environnement** ni dans l'image : les `ENV` sont **visibles** (`docker inspect`, `/proc`, les logs). Les vraies solutions : les **secrets Docker** (chiffrés, montés en fichier — Swarm/Compose), les **secrets de build** (`RUN --mount=type=secret`, non persistés en couche), ou un gestionnaire externe (Vault).

**L'analyse & la confiance.** Une image tirée du net peut contenir des **failles connues** (CVE) : on la **scanne** (**`docker scout`**, **Trivy**). Et pour garantir qu'une image est **authentique** (non altérée), le **Docker Content Trust** (`DOCKER_CONTENT_TRUST=1`) n'autorise que les images **signées**.
:::

:::lang en
**Least privilege** unfolds into several defense layers.

**Non-root.** By default, a container's process runs as **root** (`uid 0`) — and that root, if it escapes (kernel flaw, bad mount), is **root on the host**. The countermeasure: run the application as a **normal user**, via **`USER`** in the Dockerfile or **`--user`** at run. A web service has **no** reason to be root.

**Capabilities.** Root isn't monolithic: the Linux kernel splits it into **capabilities** (CAP_CHOWN, CAP_NET_BIND_SERVICE, CAP_SYS_ADMIN…). Docker already grants **only a subset** by default. Best practice: **drop everything** (`--cap-drop ALL`) then **add back only** what's needed (`--cap-add`). A container without unneeded capabilities has a tiny **attack surface**.

**The read-only rootfs.** With **`--read-only`**, the container's filesystem becomes **immutable**: an intrusion can neither drop a binary nor modify a config. For the rare folders that must write (caches, `/tmp`), you add a targeted **`--tmpfs`**. Immutability = a pillar of container security.

**Resource limits.** Without a limit, a container can consume **all** the host's RAM/CPU (denial of service, deliberate or by bug). You bound it: **`--memory`** (max RAM, kills the container on overrun = `OOMKilled`), **`--cpus`** (CPU share), **`--pids-limit`** (process count, against *fork bombs*).

**Secrets.** **Never** put a password/key in an **environment variable** nor in the image: `ENV`s are **visible** (`docker inspect`, `/proc`, logs). The real solutions: **Docker secrets** (encrypted, mounted as a file — Swarm/Compose), **build secrets** (`RUN --mount=type=secret`, not persisted in a layer), or an external manager (Vault).

**Scanning & trust.** An image pulled from the net may contain **known vulnerabilities** (CVEs): you **scan** it (**`docker scout`**, **Trivy**). And to guarantee an image is **authentic** (untampered), **Docker Content Trust** (`DOCKER_CONTENT_TRUST=1`) allows only **signed** images.
:::

:::figure docker-security
caption_fr: "Schéma 1. Défense en couches : non-root → capabilities minimales → rootfs read-only → limites de ressources → secrets hors ENV → image scannée & signée."
caption_en: "Figure 1. Layered defense: non-root → minimal capabilities → read-only rootfs → resource limits → secrets out of ENV → scanned & signed image."
:::

:::lang fr
On avance : non-root → capabilities → read-only → limites → secrets → scan & content trust.
:::

:::lang en
We'll go: non-root → capabilities → read-only → limits → secrets → scan & content trust.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Faire tourner un conteneur en **non-root**.

**🤔 Root par défaut = danger.** Constate le défaut, puis corrige de deux façons (`--user`, puis `USER` dans l'image) :
:::

:::lang en
**Goal.** Run a container as **non-root**.

**🤔 Root by default = danger.** Observe the default, then fix it two ways (`--user`, then `USER` in the image):
:::

```bash
docker run --rm alpine id                     # uid=0(root) — le DÉFAUT / the DEFAULT
docker run --rm --user 1000:1000 alpine id    # uid=1000 — imposé au run / forced at run

# figé dans l'image / baked into the image
cat > Dockerfile <<'EOF'
FROM alpine:3.20
RUN adduser -D -u 1000 app
USER app
ENTRYPOINT ["id"]
EOF
docker build -t nonroot . && docker run --rm nonroot   # uid=1000(app)
```

:::lang fr
**✅ Vérification :** `docker run alpine id` révèle **`uid=0(root)`** — le conteneur tourne en **root** par défaut, ce que **personne** ne veut pour une application. `--user 1000:1000` l'abaisse au run, et l'image `nonroot` (avec **`USER app`**) tourne en `uid=1000` **de façon permanente**. Un attaquant qui compromet l'app n'a plus les droits root, ni dans le conteneur, ni (s'il s'échappe) sur l'hôte. **Un service ne doit jamais tourner en root** — c'est la première ligne de défense.
:::

:::lang en
**✅ Check:** `docker run alpine id` reveals **`uid=0(root)`** — the container runs as **root** by default, which **nobody** wants for an application. `--user 1000:1000` lowers it at run, and the `nonroot` image (with **`USER app`**) runs as `uid=1000` **permanently**. An attacker who compromises the app no longer has root rights, neither in the container, nor (if they escape) on the host. **A service must never run as root** — it's the first line of defense.
:::

### step-02

:::lang fr
**Objectif.** **Retirer les capabilities** inutiles.

**🤔 Root morcelé.** Une opération privilégiée (changer le propriétaire d'un fichier = CAP_CHOWN) marche par défaut ; retire toutes les capabilities et elle **échoue** :
:::

:::lang en
**Goal.** **Drop unneeded capabilities**.

**🤔 Root, split up.** A privileged operation (changing a file's owner = CAP_CHOWN) works by default; drop all capabilities and it **fails**:
:::

```bash
docker run --rm alpine chown 65534 /etc/hostname && echo "chown OK (CAP_CHOWN présent par défaut)"
docker run --rm --cap-drop ALL alpine chown 65534 /etc/hostname \
  || echo "chown REFUSÉ (toutes capabilities retirées) / DENIED (all caps dropped)"
# rendre juste CAP_CHOWN / add back only CAP_CHOWN
docker run --rm --cap-drop ALL --cap-add CHOWN alpine chown 65534 /etc/hostname && echo "chown OK (CHOWN rajouté)"
```

:::lang fr
**✅ Vérification :** le premier `chown` **réussit** (Docker accorde **CAP_CHOWN** par défaut). Avec **`--cap-drop ALL`**, le même `chown` **échoue** (`Operation not permitted`) — la capability a été retirée. En rajoutant **uniquement** `--cap-add CHOWN`, il remarche. C'est le **moindre privilège** appliqué aux capabilities : on part de **zéro** (`--cap-drop ALL`) et on n'accorde **que** le strict nécessaire. Un conteneur web, par exemple, n'a besoin de quasiment **aucune** capability.
:::

:::lang en
**✅ Check:** the first `chown` **succeeds** (Docker grants **CAP_CHOWN** by default). With **`--cap-drop ALL`**, the same `chown` **fails** (`Operation not permitted`) — the capability was removed. Adding back **only** `--cap-add CHOWN`, it works again. That's **least privilege** applied to capabilities: start from **zero** (`--cap-drop ALL`) and grant **only** the strict minimum. A web container, for instance, needs almost **no** capabilities.
:::

### step-03

:::lang fr
**Objectif.** Imposer un **rootfs en lecture seule**, avec un `tmpfs` pour les rares écritures.

**🤔 Un conteneur immuable.** En `--read-only`, rien ne peut écrire dans le système de fichiers — sauf les `tmpfs` que tu autorises :
:::

:::lang en
**Goal.** Enforce a **read-only rootfs**, with a `tmpfs` for the rare writes.

**🤔 An immutable container.** In `--read-only`, nothing can write to the filesystem — except the `tmpfs`es you allow:
:::

```bash
docker run --rm --read-only alpine sh -c "touch /tmp/x" \
  || echo "écriture REFUSÉE (rootfs en lecture seule) / write DENIED (read-only rootfs)"
# on autorise UNIQUEMENT /tmp en écriture (en mémoire) / allow ONLY /tmp to write (in memory)
docker run --rm --read-only --tmpfs /tmp alpine sh -c "touch /tmp/x && echo 'écriture OK dans /tmp'"
```

:::lang fr
**✅ Vérification :** sous **`--read-only`**, `touch /tmp/x` **échoue** (`Read-only file system`) — le conteneur ne peut **rien** écrire, donc un intrus ne peut ni déposer d'outil, ni altérer de fichier. En ajoutant **`--tmpfs /tmp`**, seul `/tmp` (en RAM) redevient inscriptible, juste ce qu'il faut à l'appli. C'est le motif de l'**immuabilité** : un rootfs figé + des zones d'écriture **explicitement** délimitées. Combiné au non-root et aux capabilities minimales, ça réduit drastiquement ce qu'un attaquant peut faire.
:::

:::lang en
**✅ Check:** under **`--read-only`**, `touch /tmp/x` **fails** (`Read-only file system`) — the container can write **nothing**, so an intruder can neither drop a tool nor tamper with a file. Adding **`--tmpfs /tmp`**, only `/tmp` (in RAM) becomes writable again, just what the app needs. That's the **immutability** pattern: a frozen rootfs + **explicitly** delimited write zones. Combined with non-root and minimal capabilities, it drastically shrinks what an attacker can do.
:::

### step-04

:::lang fr
**Objectif.** Poser des **limites de ressources** contre le déni de service.

**🤔 Borner RAM, CPU, processus.** Un conteneur non borné peut asphyxier l'hôte. Fixe les limites et vérifie-les, puis démontre `--pids-limit` :
:::

:::lang en
**Goal.** Set **resource limits** against denial of service.

**🤔 Bound RAM, CPU, processes.** An unbounded container can choke the host. Set the limits and verify them, then demonstrate `--pids-limit`:
:::

```bash
docker run -d --name borne --memory=64m --cpus=0.5 --pids-limit=64 alpine sleep 300
docker inspect borne --format 'mem={{.HostConfig.Memory}} cpus={{.HostConfig.NanoCpus}} pids={{.HostConfig.PidsLimit}}'
docker stats --no-stream borne          # colonne MEM USAGE / LIMIT -> .../ 64MiB

# --pids-limit en action : bloque la prolifération de processus (fork bomb) / blocks process proliferation
docker run --rm --pids-limit=5 alpine sh -c \
  'for i in $(seq 20); do /bin/sleep 30 & done; wait' 2>&1 | grep -m1 -i "can't fork\|resource" \
  && echo "-> pids-limit a bloqué des forks / pids-limit blocked forks"
```

:::lang fr
**✅ Vérification :** `docker inspect` confirme les limites posées (`mem=67108864` = 64 Mio, `cpus=500000000` = 0,5 CPU, `pids=64`), et `docker stats` affiche la **LIMIT** de mémoire à `64MiB`. La démo `--pids-limit=5` tente de lancer 20 `sleep` en parallèle mais **bute** sur la limite de 5 processus → des messages `can't fork` / `Resource temporarily unavailable`. C'est la protection **anti-DoS** : quoi qu'il arrive dans le conteneur (bug, attaque), il ne peut pas consommer plus que sa **part** de RAM, CPU et processus. *(Nettoyage : `docker rm -f borne`.)*
:::

:::lang en
**✅ Check:** `docker inspect` confirms the limits set (`mem=67108864` = 64 MiB, `cpus=500000000` = 0.5 CPU, `pids=64`), and `docker stats` shows the memory **LIMIT** at `64MiB`. The `--pids-limit=5` demo tries to launch 20 parallel `sleep`s but **hits** the 5-process limit → `can't fork` / `Resource temporarily unavailable` messages. That's the **anti-DoS** protection: whatever happens in the container (bug, attack), it can't consume more than its **share** of RAM, CPU and processes. *(Cleanup: `docker rm -f borne`.)*
:::

### step-05

:::lang fr
**Objectif.** Voir un **secret fuir** par une `ENV`, et connaître les alternatives.

**🤔 La démonstration qui fait peur.** Passe un « mot de passe » en variable d'environnement, puis retrouve-le en clair :
:::

:::lang en
**Goal.** Watch a **secret leak** through an `ENV`, and know the alternatives.

**🤔 The scary demonstration.** Pass a "password" as an environment variable, then find it in cleartext:
:::

```bash
docker run -d --name fuite -e DB_PASSWORD=s3cr3t-en-clair alpine sleep 300
docker inspect fuite --format '{{.Config.Env}}'      # le secret est VISIBLE en clair / the secret is VISIBLE
docker exec fuite printenv DB_PASSWORD               # ...et lisible depuis /proc, les logs... / and from /proc, logs
docker rm -f fuite
```

:::lang fr
**✅ Vérification :** `docker inspect fuite` affiche **`[DB_PASSWORD=s3cr3t-en-clair ...]`** — le « secret » est stocké **en clair** dans la config du conteneur, lisible par quiconque peut faire `docker inspect`, et aussi via `/proc/<pid>/environ` ou des logs indiscrets. **Leçon : jamais de secret dans un `ENV`** (ni dans l'image). Les vraies solutions : les **secrets Docker** (chiffrés au repos, montés en **fichier** dans le conteneur — voir le guide Swarm), les **secrets de build** (`RUN --mount=type=secret=...`, jamais écrits dans une couche), ou un gestionnaire externe (**Vault**). Bonus durcissement : **`--security-opt=no-new-privileges`** empêche l'escalade de privilèges (via un binaire *setuid*).
:::

:::lang en
**✅ Check:** `docker inspect fuite` shows **`[DB_PASSWORD=s3cr3t-en-clair ...]`** — the "secret" is stored **in cleartext** in the container's config, readable by anyone who can `docker inspect`, and also via `/proc/<pid>/environ` or careless logs. **Lesson: never a secret in an `ENV`** (nor in the image). The real solutions: **Docker secrets** (encrypted at rest, mounted as a **file** in the container — see the Swarm guide), **build secrets** (`RUN --mount=type=secret=...`, never written to a layer), or an external manager (**Vault**). Hardening bonus: **`--security-opt=no-new-privileges`** prevents privilege escalation (via a *setuid* binary).
:::

### step-06

:::lang fr
**Objectif.** **Scanner** une image pour ses failles, et situer le **content trust**.

**🤔 Ce que tu tires du net a un passé.** Une image publique peut embarquer des CVE. Scanne-la (les scanners ont besoin du réseau) :
:::

:::lang en
**Goal.** **Scan** an image for vulnerabilities, and place **content trust**.

**🤔 What you pull from the net has a past.** A public image may carry CVEs. Scan it (scanners need the network):
:::

```bash
# Option A : docker scout (intégré au CLI Docker récent) / built into recent Docker CLI
docker scout quickview nginx:1.27-alpine        # résumé des vulnérabilités par sévérité / vuln summary by severity
# docker scout cves nginx:1.27-alpine           # le détail des CVE / the CVE details

# Option B : Trivy (via conteneur, aucune install) / via a container, no install
docker run --rm aquasec/trivy image --severity HIGH,CRITICAL nginx:1.27-alpine

# Content trust : n'autoriser que les images SIGNÉES / only allow SIGNED images
# export DOCKER_CONTENT_TRUST=1   (puis docker pull/run échoue sur une image non signée)
```

:::lang fr
**✅ Vérification :** `docker scout quickview` (ou Trivy) affiche un **tableau des vulnérabilités** par sévérité (`CRITICAL`/`HIGH`/…) — tu vois **combien** de failles connues traînent dans l'image et lesquelles. C'est le réflexe **avant de mettre en prod** : une image « qui marche » peut être criblée de CVE. Enfin, **`DOCKER_CONTENT_TRUST=1`** impose de ne tirer/lancer que des images **signées** (authenticité + intégrité) — les images officielles de Docker Hub le sont. Scanner (les failles) et signer (l'authenticité) sont les deux volets de la **confiance dans les images**. *(Selon ta version/ton compte, `docker scout` peut demander une connexion ; Trivy fonctionne sans.)*
:::

:::lang en
**✅ Check:** `docker scout quickview` (or Trivy) shows a **vulnerability table** by severity (`CRITICAL`/`HIGH`/…) — you see **how many** known flaws linger in the image and which. It's the reflex **before going to prod**: an image "that works" can be riddled with CVEs. Finally, **`DOCKER_CONTENT_TRUST=1`** enforces pulling/running only **signed** images (authenticity + integrity) — Docker Hub's official images are. Scanning (the flaws) and signing (the authenticity) are the two sides of **image trust**. *(Depending on your version/account, `docker scout` may ask you to sign in; Trivy works without.)*
:::

## pitfalls

:::lang fr
**1. Laisser le conteneur en root.** Le défaut est `uid 0`. Un service compromis en root = risque d'évasion vers l'hôte. Toujours **`USER`** (image) ou **`--user`** (run).

**2. Garder toutes les capabilities.** Même le sous-ensemble par défaut est souvent trop large. Réflexe : **`--cap-drop ALL`** puis `--cap-add` ciblé.

**3. Un secret dans `ENV` ou dans l'image.** Visible via `docker inspect`, `/proc`, `docker history`. Utilise les **secrets** (fichier chiffré) ou les secrets de build.

**4. Pas de limites de ressources.** Un conteneur peut asphyxier l'hôte (RAM/CPU/pids). Pose **`--memory`**, **`--cpus`**, **`--pids-limit`** — surtout en multi-tenant.

**5. `--privileged` par facilité.** `--privileged` **désactive** presque toute l'isolation (toutes capabilities + accès aux devices). À **éviter** ; si un besoin précis existe, accorde **la** capability, pas tout.

**6. Ignorer les CVE de l'image de base.** Une base obsolète (`:latest` figé il y a 2 ans) traîne des failles. **Scanne** régulièrement et **mets à jour** la base.

**7. Croire que `--read-only` casse tout.** La plupart des apps n'écrivent que dans quelques dossiers : ajoute des **`--tmpfs`** ciblés (ou des volumes) pour ceux-là, et garde le reste immuable.
:::

:::lang en
**1. Leaving the container as root.** The default is `uid 0`. A service compromised as root = escape risk to the host. Always **`USER`** (image) or **`--user`** (run).

**2. Keeping all capabilities.** Even the default subset is often too broad. Reflex: **`--cap-drop ALL`** then targeted `--cap-add`.

**3. A secret in `ENV` or in the image.** Visible via `docker inspect`, `/proc`, `docker history`. Use **secrets** (encrypted file) or build secrets.

**4. No resource limits.** A container can choke the host (RAM/CPU/pids). Set **`--memory`**, **`--cpus`**, **`--pids-limit`** — especially in multi-tenant.

**5. `--privileged` for convenience.** `--privileged` **disables** almost all isolation (all capabilities + device access). **Avoid** it; if a precise need exists, grant **the** capability, not everything.

**6. Ignoring the base image's CVEs.** A stale base (`:latest` frozen 2 years ago) carries flaws. **Scan** regularly and **update** the base.

**7. Believing `--read-only` breaks everything.** Most apps only write to a few folders: add targeted **`--tmpfs`** (or volumes) for those, and keep the rest immutable.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu fais tourner un conteneur en **non-root** (`USER`/`--user`).
- [ ] Tu **retires les capabilities** et n'ajoutes que le nécessaire.
- [ ] Tu imposes un **rootfs read-only** + `tmpfs` ciblé.
- [ ] Tu poses **`--memory`/`--cpus`/`--pids-limit`** et tu les vérifies.
- [ ] Tu expliques **pourquoi pas de secret en `ENV`** et les alternatives.
- [ ] Tu **scannes** une image et tu situes le **content trust**.

Six cases cochées = tu tiens **la sécurité** du DCA.
:::

:::lang en
You know it works when…

- [ ] You run a container as **non-root** (`USER`/`--user`).
- [ ] You **drop capabilities** and add back only what's needed.
- [ ] You enforce a **read-only rootfs** + targeted `tmpfs`.
- [ ] You set **`--memory`/`--cpus`/`--pids-limit`** and verify them.
- [ ] You explain **why no secret in `ENV`** and the alternatives.
- [ ] You **scan** an image and place **content trust**.

Six boxes ticked = you hold DCA **security**.
:::

## next

:::lang fr
La suite de la track Docker → DCA :

1. **Orchestration Swarm** — services, stacks, **secrets Swarm** (en action), réseau overlay.
2. **Projet d'entreprise** — image multi-stage → registre → stack Swarm sécurisée.
:::

:::lang en
The rest of the Docker → DCA track:

1. **Swarm orchestration** — services, stacks, **Swarm secrets** (in action), overlay network.
2. **Enterprise project** — multi-stage image → registry → secured Swarm stack.
:::

## cheatsheet

:::lang fr
Aide-mémoire sécurité Docker.
:::

:::lang en
Docker security cheat sheet.
:::

```bash
# Non-root
docker run --user 1000:1000 img          # ou USER app dans le Dockerfile / or USER app in Dockerfile

# Capabilities (moindre privilège / least privilege)
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE img

# Rootfs immuable / immutable rootfs
docker run --read-only --tmpfs /tmp img

# Limites / limits (anti-DoS)
docker run --memory=256m --cpus=0.5 --pids-limit=100 img

# Durcissement / hardening
docker run --security-opt=no-new-privileges img
# NE PAS utiliser / do NOT use : --privileged

# Secrets : PAS en ENV / NOT in ENV
#   -> secrets Docker (fichier), RUN --mount=type=secret (build), Vault

# Scan & confiance / trust
docker scout quickview IMG        # ou / or : docker run --rm aquasec/trivy image IMG
export DOCKER_CONTENT_TRUST=1     # n'autorise que les images signées / only signed images
```

## resources

:::lang fr
- [Sécurité Docker](https://docs.docker.com/engine/security/) — vue d'ensemble.
- [Capabilities & `--cap-drop`](https://docs.docker.com/engine/containers/run/#runtime-privilege-and-linux-capabilities) et [`--read-only`](https://docs.docker.com/reference/cli/docker/container/run/#read-only).
- [`docker scout`](https://docs.docker.com/scout/) et [Docker Content Trust](https://docs.docker.com/engine/security/trust/).
- Domaine **DCA « Security »** (~15 %).
:::

:::lang en
- [Docker security](https://docs.docker.com/engine/security/) — overview.
- [Capabilities & `--cap-drop`](https://docs.docker.com/engine/containers/run/#runtime-privilege-and-linux-capabilities) and [`--read-only`](https://docs.docker.com/reference/cli/docker/container/run/#read-only).
- [`docker scout`](https://docs.docker.com/scout/) and [Docker Content Trust](https://docs.docker.com/engine/security/trust/).
- **DCA "Security"** domain (~15%).
:::

## troubleshooting

:::lang fr
**Mon appli non-root ne peut pas écrire dans un dossier.** Le dossier appartient à root : au build, `chown` le dossier vers l'utilisateur applicatif (`RUN chown -R app /data`), ou monte un volume avec les bons droits.

**`--cap-drop ALL` casse mon conteneur.** Une capability lui manque. Identifie laquelle (souvent `NET_BIND_SERVICE` pour un port < 1024, `CHOWN`, `SETUID`/`SETGID`) et rajoute **uniquement** celle-là avec `--cap-add`.

**`--read-only` : « Read-only file system ».** L'appli écrit quelque part (logs, `/tmp`, `/run`). Ajoute un **`--tmpfs`** (ou un volume) sur ce chemin précis, garde le reste read-only.

**`--pids-limit` / `--memory` : le conteneur est tué (`OOMKilled`).** Il dépasse la limite. Augmente-la si c'est légitime, ou corrige la fuite ; regarde `docker stats` et `docker inspect --format '{{.State.OOMKilled}}'`.

**`docker scout` demande de me connecter.** Certaines fonctions requièrent un compte Docker. Utilise **Trivy** (`docker run --rm aquasec/trivy image IMG`) qui fonctionne sans compte.

**`--privileged` était plus simple.** Oui, mais il ouvre tout. Trouve la **capability précise** ou le **device** requis et n'accorde que lui (`--cap-add`, `--device`).
:::

:::lang en
**My non-root app can't write to a folder.** The folder belongs to root: at build, `chown` the folder to the app user (`RUN chown -R app /data`), or mount a volume with the right permissions.

**`--cap-drop ALL` breaks my container.** It's missing a capability. Identify which (often `NET_BIND_SERVICE` for a port < 1024, `CHOWN`, `SETUID`/`SETGID`) and add back **only** that one with `--cap-add`.

**`--read-only`: "Read-only file system".** The app writes somewhere (logs, `/tmp`, `/run`). Add a **`--tmpfs`** (or a volume) on that specific path, keep the rest read-only.

**`--pids-limit` / `--memory`: the container is killed (`OOMKilled`).** It exceeds the limit. Raise it if legitimate, or fix the leak; check `docker stats` and `docker inspect --format '{{.State.OOMKilled}}'`.

**`docker scout` asks me to sign in.** Some features require a Docker account. Use **Trivy** (`docker run --rm aquasec/trivy image IMG`), which works without an account.

**`--privileged` was simpler.** Yes, but it opens everything. Find the **precise capability** or **device** required and grant only that (`--cap-add`, `--device`).
:::
