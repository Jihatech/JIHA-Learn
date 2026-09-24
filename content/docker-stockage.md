---
# — Identité (ne change JAMAIS une fois publié) —
id: docker-stockage
slug: docker-stockage
order: 15
status: published

# — Titres & accroches (bilingue) —
title_fr: "Docker — stockage & volumes"
title_en: "Docker — storage & volumes"
tagline_fr: "Volumes, bind mounts, tmpfs, partage, sauvegarde."
tagline_en: "Volumes, bind mounts, tmpfs, sharing, backup."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 160
repo: "moby/moby"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [docker-reseau]
next: [cicd-github-actions]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [volumes-nommes, bind-mounts, tmpfs, syntaxe-mount, partage-volume, sauvegarde-restauration]
concepts_en: [named-volumes, bind-mounts, tmpfs, mount-syntax, volume-sharing, backup-restore]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le stockage Docker au niveau DCA : les volumes nommés (persistance gérée par Docker), les bind mounts (dossier de l'hôte), tmpfs (en mémoire), la syntaxe -v vs --mount et le read-only, le partage d'un volume entre conteneurs, et la sauvegarde/restauration d'un volume."
og_description_en: "Docker storage at DCA level: named volumes (Docker-managed persistence), bind mounts (host directory), tmpfs (in memory), the -v vs --mount syntax and read-only, sharing a volume between containers, and backing up/restoring a volume."
---

## intro

:::lang fr
Un conteneur est **jetable** : à sa suppression, sa couche d'écriture disparaît — et ta base de données avec, si tu n'as rien prévu. Docker sépare donc **la donnée** du conteneur, et l'examen **DCA** attend que tu maîtrises **comment** : *quelle différence entre un volume et un bind mount ? où Docker range-t-il les volumes ? comment partager des données entre conteneurs ? comment sauvegarder un volume ? quand utiliser `tmpfs` ?*

Ce guide couvre le domaine **stockage & volumes** : les **volumes nommés** (persistance gérée par Docker), les **bind mounts** (un dossier de l'hôte), **`tmpfs`** (en mémoire), la syntaxe **`-v` vs `--mount`** et le **read-only**, le **partage** d'un volume entre conteneurs, et la **sauvegarde/restauration**.

On travaille en **local avec Docker**, avec de petites images (`alpine`, `nginx`). Toutes les manœuvres sont refaisables sur ta machine.

**Pour qui c'est :** tu as les guides Docker précédents et tu vises le **DCA**.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas lancer un conteneur → reviens aux fondamentaux.
- Tu veux la sécurité ou Swarm → ce sont les guides suivants.
:::

:::lang en
A container is **disposable**: when it's removed, its write layer vanishes — and your database with it, if you planned nothing. So Docker separates **the data** from the container, and the **DCA** exam expects you to master **how**: *what's the difference between a volume and a bind mount? where does Docker store volumes? how do you share data between containers? how do you back up a volume? when do you use `tmpfs`?*

This guide covers the **storage & volumes** domain: **named volumes** (Docker-managed persistence), **bind mounts** (a host directory), **`tmpfs`** (in memory), the **`-v` vs `--mount`** syntax and **read-only**, **sharing** a volume between containers, and **backup/restore**.

We work **locally with Docker**, with small images (`alpine`, `nginx`). Every maneuver is reproducible on your machine.

**Who it's for:** you have the earlier Docker guides and you're aiming for the **DCA**.

**When it's NOT the right choice:**

- You can't launch a container → go back to the fundamentals.
- You want security or Swarm → those are the next guides.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Distinguer **volume nommé**, **bind mount** et **`tmpfs`** — et quand choisir chacun.
- Créer un **volume**, y persister des données **au-delà** du conteneur.
- Monter un **bind mount** (dossier de l'hôte) et éditer en direct.
- Utiliser **`tmpfs`** pour des données éphémères en mémoire.
- Écrire les deux syntaxes **`-v`** et **`--mount`**, et le **read-only** (`:ro`).
- **Partager** un volume entre conteneurs et **sauvegarder/restaurer** un volume.
:::

:::lang en
By the end of this guide, you'll know how to:

- Distinguish **named volume**, **bind mount** and **`tmpfs`** — and when to choose each.
- Create a **volume** and persist data **beyond** the container.
- Mount a **bind mount** (host directory) and edit live.
- Use **`tmpfs`** for ephemeral in-memory data.
- Write both **`-v`** and **`--mount`** syntaxes, and **read-only** (`:ro`).
- **Share** a volume between containers and **back up/restore** a volume.
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
mkdir docker-stockage && cd docker-stockage
```

## concepts

:::lang fr
La **couche d'écriture** d'un conteneur meurt avec lui. Pour **persister** ou **partager** des données, Docker propose trois mécanismes de montage :

- **Le volume nommé** — un espace de stockage **géré par Docker** (rangé dans `/var/lib/docker/volumes/`). Tu le crées, le nommes, le montes ; Docker s'occupe du reste. **C'est le choix par défaut** pour les données d'application (bases, uploads). Portable, sauvegardable, indépendant de l'arborescence de l'hôte.
- **Le bind mount** — tu montes **un dossier précis de l'hôte** dans le conteneur. Le conteneur voit **directement** tes fichiers, et inversement (édition en direct). Idéal en **développement** (monter ton code) ou pour un fichier de config. Mais **dépendant du chemin de l'hôte** — moins portable.
- **`tmpfs`** — un montage **en mémoire vive** (RAM). Rapide, mais **volatil** : effacé à l'arrêt du conteneur. Pour des données sensibles ou temporaires qu'on ne veut **pas** écrire sur disque.

**Deux syntaxes** pour monter :

- **`-v` / `--volume`** — compacte : `-v source:cible[:options]`. Historique, très courante.
- **`--mount`** — explicite : `--mount type=volume,source=…,target=…`. Verbeuse mais claire (obligatoire pour certaines options, préférée en scripts). **Différence de comportement clé :** avec `-v`, si le volume nommé n'existe pas, Docker le **crée** ; avec `--mount type=bind`, si le chemin hôte n'existe pas, Docker **échoue** (au lieu de créer un dossier vide comme `-v`).

**Le read-only.** Un montage peut être **en lecture seule** (`:ro` ou `readonly`) — le conteneur lit mais **ne peut pas écrire**. Bonne pratique pour de la config ou du contenu statique : le conteneur ne peut pas corrompre la source.

**Le partage.** Plusieurs conteneurs peuvent monter **le même** volume → ils partagent les données. Et un volume **survit** à la suppression de tous ses conteneurs, tant qu'on ne le supprime pas explicitement.

**Sous le capot (storage driver).** Les couches d'image sont empilées par un **storage driver** (**`overlay2`** par défaut) en **copy-on-write** : le conteneur ne recopie un fichier que s'il le modifie. Les volumes/bind mounts, eux, **court-circuitent** ce système de couches — c'est pour ça qu'ils persistent et sont rapides.
:::

:::lang en
A container's **write layer** dies with it. To **persist** or **share** data, Docker offers three mount mechanisms:

- **The named volume** — a storage space **managed by Docker** (kept in `/var/lib/docker/volumes/`). You create it, name it, mount it; Docker handles the rest. **It's the default choice** for application data (databases, uploads). Portable, backup-able, independent of the host's tree.
- **The bind mount** — you mount **a specific host directory** into the container. The container sees **your files directly**, and vice versa (live editing). Ideal in **development** (mount your code) or for a config file. But **dependent on the host path** — less portable.
- **`tmpfs`** — a mount **in RAM**. Fast, but **volatile**: wiped when the container stops. For sensitive or temporary data you **don't** want written to disk.

**Two syntaxes** to mount:

- **`-v` / `--volume`** — compact: `-v source:target[:options]`. Historical, very common.
- **`--mount`** — explicit: `--mount type=volume,source=…,target=…`. Verbose but clear (required for some options, preferred in scripts). **Key behavioral difference:** with `-v`, if the named volume doesn't exist, Docker **creates** it; with `--mount type=bind`, if the host path doesn't exist, Docker **fails** (instead of creating an empty folder like `-v`).

**Read-only.** A mount can be **read-only** (`:ro` or `readonly`) — the container reads but **can't write**. Good practice for config or static content: the container can't corrupt the source.

**Sharing.** Several containers can mount **the same** volume → they share the data. And a volume **survives** the removal of all its containers, as long as you don't explicitly delete it.

**Under the hood (storage driver).** Image layers are stacked by a **storage driver** (**`overlay2`** by default) in **copy-on-write**: the container only copies a file when it modifies it. Volumes/bind mounts, by contrast, **bypass** this layer system — that's why they persist and are fast.
:::

:::figure docker-storage
caption_fr: "Schéma 1. Volume nommé (géré par Docker, /var/lib/docker) ; bind mount (dossier de l'hôte) ; tmpfs (RAM, volatil). Tous montés dans le conteneur ; volume & bind survivent au conteneur."
caption_en: "Figure 1. Named volume (Docker-managed, /var/lib/docker); bind mount (host dir); tmpfs (RAM, volatile). All mounted in the container; volume & bind outlive the container."
:::

:::lang fr
On avance : volume nommé & persistance → bind mount → tmpfs → `-v` vs `--mount` & read-only → partage entre conteneurs → sauvegarde/restauration.
:::

:::lang en
We'll go: named volume & persistence → bind mount → tmpfs → `-v` vs `--mount` & read-only → sharing between containers → backup/restore.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Créer un **volume nommé** et prouver que la donnée **survit** au conteneur.

Crée le volume, écris dedans depuis un conteneur, **supprime** le conteneur, relis avec un autre :
:::

:::lang en
**Goal.** Create a **named volume** and prove the data **survives** the container.

Create the volume, write into it from a container, **delete** the container, read back with another:
:::

```bash
docker volume create appdata
docker run --rm -v appdata:/data alpine sh -c "echo 'donnée persistante' > /data/note.txt"
# le conteneur ci-dessus est déjà supprimé (--rm) ; la donnée, elle, reste
# the container above is already gone (--rm); the data stays
docker run --rm -v appdata:/data alpine cat /data/note.txt      # -> "donnée persistante"
docker volume inspect appdata --format '{{.Mountpoint}}'         # où Docker le range / where Docker stores it
```

:::lang fr
**✅ Vérification :** le **second** conteneur (un process totalement différent, le premier ayant été supprimé par `--rm`) affiche **`donnée persistante`** — la donnée écrite dans le **volume** a **survécu** à la disparition du conteneur qui l'avait créée. `docker volume inspect` montre le **`Mountpoint`** (sous `/var/lib/docker/volumes/appdata/_data`) : Docker gère le stockage pour toi. C'est **le** mécanisme de persistance : le cycle de vie de la **donnée** est découplé de celui du **conteneur**.
:::

:::lang en
**✅ Check:** the **second** container (a completely different process, the first having been removed by `--rm`) prints **`donnée persistante`** — the data written to the **volume survived** the disappearance of the container that created it. `docker volume inspect` shows the **`Mountpoint`** (under `/var/lib/docker/volumes/appdata/_data`): Docker manages the storage for you. That's **the** persistence mechanism: the **data**'s lifecycle is decoupled from the **container**'s.
:::

### step-02

:::lang fr
**Objectif.** Monter un **bind mount** : un dossier de l'hôte, vu en direct dans le conteneur.

**🤔 Tes fichiers, directement.** Crée un dossier de contenu sur l'hôte et sers-le avec nginx :
:::

:::lang en
**Goal.** Mount a **bind mount**: a host directory, seen live in the container.

**🤔 Your files, directly.** Create a content folder on the host and serve it with nginx:
:::

```bash
mkdir site && echo "<h1>Bind mount v1</h1>" > site/index.html
docker run -d --name web -p 8080:80 -v "$(pwd)/site":/usr/share/nginx/html:ro nginx:1.27-alpine
curl -s localhost:8080                       # -> "Bind mount v1"

echo "<h1>Bind mount v2</h1>" > site/index.html   # on édite sur l'HÔTE / edit on the HOST
curl -s localhost:8080                       # -> "Bind mount v2" (reflété en DIRECT) / reflected LIVE
```

:::lang fr
**✅ Vérification :** `curl localhost:8080` sert le fichier **de ton dossier hôte** `site/`. Après l'avoir édité **sur l'hôte**, un nouveau `curl` renvoie la **v2** — **sans** reconstruire ni redémarrer le conteneur : le **bind mount** fait voir **en direct** le dossier de l'hôte dans le conteneur. C'est le motif du **développement** (monter son code source) et de la config. Le **`:ro`** rend le montage **lecture seule** : nginx sert les fichiers mais ne peut pas les modifier. *(Nettoyage : `docker rm -f web`.)*
:::

:::lang en
**✅ Check:** `curl localhost:8080` serves the file **from your host folder** `site/`. After editing it **on the host**, a new `curl` returns **v2** — **without** rebuilding or restarting the container: the **bind mount** shows the host folder **live** inside the container. That's the **development** pattern (mount your source) and config. The **`:ro`** makes the mount **read-only**: nginx serves the files but can't modify them. *(Cleanup: `docker rm -f web`.)*
:::

### step-03

:::lang fr
**Objectif.** Utiliser **`tmpfs`** : un montage en mémoire, **volatil**.

**🤔 En RAM, jamais sur disque.** Monte un `tmpfs` et écris dedans :
:::

:::lang en
**Goal.** Use **`tmpfs`**: an in-memory, **volatile** mount.

**🤔 In RAM, never on disk.** Mount a `tmpfs` and write into it:
:::

```bash
docker run -d --name cache --tmpfs /scratch alpine sleep 600
docker exec cache sh -c "echo secret > /scratch/token ; ls -l /scratch"   # écrit en RAM / writes in RAM
docker exec cache df -h /scratch                     # type tmpfs / filesystem tmpfs
docker restart cache
docker exec cache ls /scratch                        # VIDE : effacé au redémarrage / EMPTY: wiped on restart
```

:::lang fr
**✅ Vérification :** après avoir écrit `token` dans `/scratch` (un montage **`tmpfs`**, confirmé par `df -h` qui affiche le type **`tmpfs`**), un `docker restart` **efface** le contenu : `ls /scratch` est **vide**. Le `tmpfs` vit **en mémoire vive**, jamais sur le disque, et disparaît à l'arrêt du conteneur. Usage : des **secrets** ou des fichiers temporaires qu'on ne veut **pas** laisser de traces sur disque, ou un cache rapide. *(Nettoyage : `docker rm -f cache`.)*
:::

:::lang en
**✅ Check:** after writing `token` into `/scratch` (a **`tmpfs`** mount, confirmed by `df -h` showing type **`tmpfs`**), a `docker restart` **wipes** the content: `ls /scratch` is **empty**. The `tmpfs` lives **in RAM**, never on disk, and disappears when the container stops. Use: **secrets** or temporary files you **don't** want to leave traces of on disk, or a fast cache. *(Cleanup: `docker rm -f cache`.)*
:::

### step-04

:::lang fr
**Objectif.** Écrire les deux syntaxes **`-v`** et **`--mount`**, et voir leur **différence** sur les bind mounts.

**🤔 Compacte vs explicite.** Les deux montent la même chose ; `--mount` est plus lisible et **plus strict**. Compare :
:::

:::lang en
**Goal.** Write both **`-v`** and **`--mount`** syntaxes, and see their **difference** on bind mounts.

**🤔 Compact vs explicit.** Both mount the same thing; `--mount` is more readable and **stricter**. Compare:
:::

```bash
# même volume, deux écritures / same volume, two spellings
docker run --rm -v appdata:/data alpine ls /data
docker run --rm --mount type=volume,source=appdata,target=/data alpine ls /data

# LA différence sur un bind mount vers un chemin INEXISTANT / THE difference on a MISSING host path
docker run --rm -v "$(pwd)/inexistant":/x alpine ls /x         # -v CRÉE un dossier vide / -v CREATES an empty dir
docker run --rm --mount type=bind,source="$(pwd)/inexistant2",target=/x alpine ls /x || \
  echo "--mount ÉCHOUE si la source n'existe pas / --mount FAILS if the source doesn't exist"
```

:::lang fr
**✅ Vérification :** les deux premières commandes listent le **même** volume `appdata` (syntaxes équivalentes). La différence apparaît sur le **bind mount vers un chemin inexistant** : **`-v`** **crée silencieusement** un dossier vide (`inexistant/`) sur l'hôte — source classique de bugs (« pourquoi mon montage est vide ? ») ; **`--mount type=bind`** **refuse** et affiche une erreur. C'est pourquoi **`--mount` est recommandé** en production/scripts : il est **explicite** et **échoue proprement** au lieu de masquer une faute de chemin. *(Nettoyage : `rmdir inexistant 2>/dev/null`.)*
:::

:::lang en
**✅ Check:** the first two commands list the **same** `appdata` volume (equivalent syntaxes). The difference shows on the **bind mount to a missing path**: **`-v`** **silently creates** an empty folder (`inexistant/`) on the host — a classic bug source ("why is my mount empty?"); **`--mount type=bind`** **refuses** and prints an error. That's why **`--mount` is recommended** in production/scripts: it's **explicit** and **fails cleanly** instead of hiding a path typo. *(Cleanup: `rmdir inexistant 2>/dev/null`.)*
:::

### step-05

:::lang fr
**Objectif.** **Partager** un volume entre deux conteneurs.

**🤔 Un espace commun.** Deux conteneurs qui montent **le même** volume voient les **mêmes** fichiers. Un écrit, l'autre lit :
:::

:::lang en
**Goal.** **Share** a volume between two containers.

**🤔 A common space.** Two containers mounting **the same** volume see the **same** files. One writes, the other reads:
:::

```bash
docker run -d --name producteur -v shared:/out alpine \
  sh -c "while true; do date > /out/heure.txt; sleep 2; done"
sleep 1                                                    # laisse le producteur écrire une 1re fois / let the producer write once
docker run --rm -v shared:/in alpine cat /in/heure.txt     # lit ce que l'autre écrit / reads what the other writes
sleep 3
docker run --rm -v shared:/in alpine cat /in/heure.txt     # valeur mise à jour / updated value
```

:::lang fr
**✅ Vérification :** le conteneur `producteur` écrit l'heure dans `shared:/out` toutes les 2 s ; un **autre** conteneur, montant le **même** volume `shared` sur `/in`, **lit** cette valeur — et après quelques secondes, la relit **mise à jour**. Les deux partagent **le même** espace de stockage. C'est le motif d'un **pipeline** (un conteneur produit, un autre consomme) ou de données communes. Rappelle-toi : le volume `shared` **existe** indépendamment ; supprimer les conteneurs ne le supprime **pas**. *(Nettoyage : `docker rm -f producteur`.)*
:::

:::lang en
**✅ Check:** the `producteur` container writes the time to `shared:/out` every 2 s; **another** container, mounting the **same** `shared` volume on `/in`, **reads** that value — and after a few seconds, reads it **updated**. Both share **the same** storage space. That's the **pipeline** pattern (one container produces, another consumes) or shared data. Remember: the `shared` volume **exists** independently; deleting the containers does **not** delete it. *(Cleanup: `docker rm -f producteur`.)*
:::

### step-06

:::lang fr
**Objectif.** **Sauvegarder** puis **restaurer** un volume — via un conteneur utilitaire.

**🤔 Un volume ne se copie pas directement.** On monte le volume **et** un dossier de l'hôte dans un conteneur jetable, et on `tar` de l'un vers l'autre :
:::

:::lang en
**Goal.** **Back up** then **restore** a volume — via a helper container.

**🤔 A volume isn't copied directly.** We mount the volume **and** a host folder in a throwaway container, and `tar` from one to the other:
:::

```bash
# SAUVEGARDE : volume -> archive .tar.gz sur l'hôte / BACKUP: volume -> .tar.gz on the host
docker run --rm -v appdata:/data -v "$(pwd)":/backup alpine \
  tar czf /backup/appdata.tar.gz -C /data .
ls -lh appdata.tar.gz

# RESTAURATION dans un nouveau volume / RESTORE into a new volume
docker volume create appdata-restore
docker run --rm -v appdata-restore:/data -v "$(pwd)":/backup alpine \
  tar xzf /backup/appdata.tar.gz -C /data
docker run --rm -v appdata-restore:/data alpine cat /data/note.txt   # -> "donnée persistante"
```

:::lang fr
**✅ Vérification :** la sauvegarde produit `appdata.tar.gz` sur l'hôte (l'archive du contenu du volume `appdata`, monté en lecture dans un conteneur `alpine` jetable + le dossier hôte monté en `/backup`). La restauration extrait cette archive dans un **nouveau** volume `appdata-restore`, et le `cat` final y retrouve **`donnée persistante`** — la donnée a voyagé **volume → archive → nouveau volume**. C'est **le** motif de sauvegarde des volumes Docker (il n'existe pas de `docker volume backup` natif). `docker volume prune` supprime enfin les volumes **inutilisés**. *(Nettoyage — le conteneur AVANT son volume : `docker rm -f producteur 2>/dev/null ; docker volume rm appdata appdata-restore shared ; rm -f appdata.tar.gz`.)*
:::

:::lang en
**✅ Check:** the backup produces `appdata.tar.gz` on the host (the archive of the `appdata` volume's content, mounted read into a throwaway `alpine` container + the host folder mounted at `/backup`). The restore extracts that archive into a **new** `appdata-restore` volume, and the final `cat` finds **`donnée persistante`** there — the data traveled **volume → archive → new volume**. That's **the** Docker volume backup pattern (there's no native `docker volume backup`). `docker volume prune` finally removes **unused** volumes. *(Cleanup — the container BEFORE its volume: `docker rm -f producteur 2>/dev/null ; docker volume rm appdata appdata-restore shared ; rm -f appdata.tar.gz`.)*
:::

## pitfalls

:::lang fr
**1. Croire que la donnée d'un conteneur persiste.** La couche d'écriture **meurt** avec le conteneur. Pour persister → **volume** (ou bind mount). Une base de données **sans** volume perd tout à la suppression.

**2. Confondre volume et bind mount.** **Volume** = géré par Docker (portable, défaut prod) ; **bind mount** = un chemin de l'hôte (dev, config, moins portable). Ne mets pas des données de prod dans un bind mount fragile.

**3. Piège `-v` sur un chemin hôte absent.** `-v /chemin/faux:/x` **crée** un dossier vide au lieu d'échouer → montage vide et confusion. Préfère **`--mount`** (qui échoue clairement).

**4. Oublier `:ro` pour de la config.** Un montage en écriture laisse le conteneur **modifier** ta source. Pour de la config/du statique, ajoute **`:ro`**.

**5. Attendre que `tmpfs` persiste.** Il est **volatil** (RAM) : perdu à l'arrêt. Ne t'en sers **pas** pour des données à conserver.

**6. Supprimer un conteneur en pensant supprimer son volume.** Le volume **survit** (`docker rm` ne le touche pas ; `docker rm -v` supprime les volumes **anonymes** seulement). Nettoie avec `docker volume prune`/`rm`.

**7. Croire à un chemin hôte identique partout.** Un bind mount `$(pwd)/site` dépend de **ta** machine — non reproductible ailleurs. Pour du portable → volume nommé.
:::

:::lang en
**1. Believing a container's data persists.** The write layer **dies** with the container. To persist → **volume** (or bind mount). A database **without** a volume loses everything on removal.

**2. Confusing volume and bind mount.** **Volume** = Docker-managed (portable, prod default); **bind mount** = a host path (dev, config, less portable). Don't put prod data in a fragile bind mount.

**3. The `-v` trap on a missing host path.** `-v /wrong/path:/x` **creates** an empty folder instead of failing → empty mount and confusion. Prefer **`--mount`** (which fails clearly).

**4. Forgetting `:ro` for config.** A writable mount lets the container **modify** your source. For config/static, add **`:ro`**.

**5. Expecting `tmpfs` to persist.** It's **volatile** (RAM): lost on stop. Do **not** use it for data to keep.

**6. Deleting a container thinking it deletes its volume.** The volume **survives** (`docker rm` doesn't touch it; `docker rm -v` removes **anonymous** volumes only). Clean up with `docker volume prune`/`rm`.

**7. Assuming an identical host path everywhere.** A bind mount `$(pwd)/site` depends on **your** machine — not reproducible elsewhere. For portability → named volume.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu distingues **volume**, **bind mount** et **`tmpfs`** et leur usage.
- [ ] Tu crées un **volume** et la donnée **survit** au conteneur.
- [ ] Tu montes un **bind mount** et tu édites en direct depuis l'hôte.
- [ ] Tu utilises un **`tmpfs`** et tu constates sa volatilité.
- [ ] Tu écris **`-v`** et **`--mount`** et tu connais leur différence.
- [ ] Tu **partages** un volume et tu **sauvegardes/restaures** un volume.

Six cases cochées = tu tiens **stockage & volumes** du DCA.
:::

:::lang en
You know it works when…

- [ ] You distinguish **volume**, **bind mount** and **`tmpfs`** and their use.
- [ ] You create a **volume** and the data **survives** the container.
- [ ] You mount a **bind mount** and edit live from the host.
- [ ] You use a **`tmpfs`** and observe its volatility.
- [ ] You write **`-v`** and **`--mount`** and know their difference.
- [ ] You **share** a volume and **back up/restore** a volume.

Six boxes ticked = you hold DCA **storage & volumes**.
:::

## next

:::lang fr
La suite de la track Docker → DCA :

1. **Sécurité** — non-root, capabilities, read-only rootfs, limites, secrets, scan.
2. **Orchestration Swarm** — services, stacks, secrets, réseau overlay.
3. **Projet d'entreprise** — image multi-stage → registre → stack Swarm.
:::

:::lang en
The rest of the Docker → DCA track:

1. **Security** — non-root, capabilities, read-only rootfs, limits, secrets, scanning.
2. **Swarm orchestration** — services, stacks, secrets, overlay network.
3. **Enterprise project** — multi-stage image → registry → Swarm stack.
:::

## cheatsheet

:::lang fr
Aide-mémoire stockage & volumes.
:::

:::lang en
Storage & volumes cheat sheet.
:::

```bash
# Volumes nommés / named volumes  (persistance gérée / managed persistence)
docker volume create NOM ; docker volume ls ; docker volume inspect NOM
docker run -v NOM:/chemin img          # ou --mount type=volume,source=NOM,target=/chemin

# Bind mount (dossier hôte / host dir)  -- :ro pour lecture seule / for read-only
docker run -v "$(pwd)/dir":/chemin:ro img
docker run --mount type=bind,source="$(pwd)/dir",target=/chemin,readonly img   # échoue si source absente / fails if source missing

# tmpfs (RAM, volatil / volatile)
docker run --tmpfs /chemin img

# Partage / sharing : deux conteneurs, même volume / two containers, same volume
docker run -v shared:/a img1 ; docker run -v shared:/b img2

# Sauvegarde / backup  (pas de commande native / no native command)
docker run --rm -v NOM:/data -v "$(pwd)":/backup alpine tar czf /backup/vol.tar.gz -C /data .
docker run --rm -v NOM2:/data -v "$(pwd)":/backup alpine tar xzf /backup/vol.tar.gz -C /data

docker volume prune                    # supprime les volumes inutilisés / remove unused
```

## resources

:::lang fr
- [Volumes](https://docs.docker.com/engine/storage/volumes/), [bind mounts](https://docs.docker.com/engine/storage/bind-mounts/), [tmpfs](https://docs.docker.com/engine/storage/tmpfs/).
- [`-v` vs `--mount`](https://docs.docker.com/engine/storage/#choose-the-right-type-of-mount).
- [Storage drivers (`overlay2`)](https://docs.docker.com/engine/storage/drivers/).
- Domaine **DCA « Storage and Volumes »** (~10 %).
:::

:::lang en
- [Volumes](https://docs.docker.com/engine/storage/volumes/), [bind mounts](https://docs.docker.com/engine/storage/bind-mounts/), [tmpfs](https://docs.docker.com/engine/storage/tmpfs/).
- [`-v` vs `--mount`](https://docs.docker.com/engine/storage/#choose-the-right-type-of-mount).
- [Storage drivers (`overlay2`)](https://docs.docker.com/engine/storage/drivers/).
- **DCA "Storage and Volumes"** domain (~10%).
:::

## troubleshooting

:::lang fr
**Ma donnée disparaît à la suppression du conteneur.** Tu n'as pas de volume : monte un **volume nommé** (`-v nom:/chemin`) pour la persistance.

**Mon bind mount est vide.** Le chemin hôte est faux : avec `-v`, Docker a **créé** un dossier vide. Vérifie le chemin ; utilise **`--mount type=bind`** pour être alerté d'un chemin absent.

**« invalid mount config » / la source n'existe pas.** Avec `--mount type=bind`, le dossier hôte doit **exister** au préalable. Crée-le, ou utilise un volume nommé.

**Le conteneur ne peut pas écrire dans le montage.** Tu l'as monté en **`:ro`** (lecture seule). Retire `:ro` si l'écriture est voulue — ou garde-le si c'est de la config.

**`docker volume rm` : « volume is in use ».** Un conteneur (même arrêté) l'utilise encore. Supprime d'abord les conteneurs concernés (`docker rm`), puis le volume.

**tmpfs : mes données ont disparu.** C'est normal : `tmpfs` est en **RAM**, effacé à l'arrêt du conteneur. Pour persister, utilise un volume.
:::

:::lang en
**My data vanishes when the container is removed.** You have no volume: mount a **named volume** (`-v name:/path`) for persistence.

**My bind mount is empty.** The host path is wrong: with `-v`, Docker **created** an empty folder. Check the path; use **`--mount type=bind`** to be warned of a missing path.

**"invalid mount config" / the source doesn't exist.** With `--mount type=bind`, the host folder must **exist** beforehand. Create it, or use a named volume.

**The container can't write to the mount.** You mounted it **`:ro`** (read-only). Remove `:ro` if writing is intended — or keep it if it's config.

**`docker volume rm`: "volume is in use".** A container (even stopped) still uses it. Remove the relevant containers first (`docker rm`), then the volume.

**tmpfs: my data is gone.** That's normal: `tmpfs` is in **RAM**, wiped when the container stops. To persist, use a volume.
:::
