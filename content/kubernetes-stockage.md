---
# — Identité (ne change JAMAIS une fois publié) —
id: kubernetes-stockage
slug: kubernetes-stockage
order: 16
status: published

# — Titres & accroches (bilingue) —
title_fr: "Kubernetes — stockage persistant"
title_en: "Kubernetes — persistent storage"
tagline_fr: "PV, PVC, StorageClass, reclaim, StatefulSet."
tagline_en: "PV, PVC, StorageClass, reclaim, StatefulSet."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 190
repo: "kubernetes/kubernetes"
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [kubernetes-services-networking]
next: [traefik]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [pv-pvc, storageclass-dynamique, waitforfirstconsumer, access-modes, reclaim-policy, pv-statique, statefulset]
concepts_en: [pv-pvc, dynamic-storageclass, waitforfirstconsumer, access-modes, reclaim-policy, static-pv, statefulset]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Le stockage persistant Kubernetes en local sur k3d : PersistentVolume et PersistentVolumeClaim, provisionnement dynamique par StorageClass (et le piège WaitForFirstConsumer), access modes et reclaim policy, PV statique, et StatefulSet avec stockage stable par réplica. Le domaine Storage du CKA/CKAD."
og_description_en: "Kubernetes persistent storage locally on k3d: PersistentVolume and PersistentVolumeClaim, dynamic provisioning by StorageClass (and the WaitForFirstConsumer trap), access modes and reclaim policy, static PV, and StatefulSet with stable per-replica storage. The CKA/CKAD Storage domain."
---

## intro

:::lang fr
Un conteneur est **éphémère** : quand il meurt, son disque meurt avec lui. Pour une base de données, un upload, un cache sur disque, c'est inacceptable. Kubernetes sépare donc le **stockage** du cycle de vie du pod, avec un modèle que l'examen **CKA/CKAD** teste en profondeur : *comment réclamer du stockage sans savoir quel disque physique il y a derrière ? comment garantir que la donnée survit au pod ? comment donner à chaque réplica d'une base son propre volume stable ?*

Ce guide couvre tout le domaine **Storage** : **`PersistentVolume`** (PV) et **`PersistentVolumeClaim`** (PVC), le **provisionnement dynamique** par **`StorageClass`** (et son piège **`WaitForFirstConsumer`**), les **access modes** et la **reclaim policy**, le **PV statique**, et le **`StatefulSet`** avec stockage stable par réplica.

On travaille en **local sur k3d**, qui embarque le provisioner **`local-path`** : une vraie StorageClass par défaut, donc le provisionnement dynamique **marche tout seul** sur ta machine. Zéro cloud.

**Pour qui c'est :** tu as les guides **fondamentaux**, **workloads** et **networking**, et tu vises la certification.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas ce qu'est un pod ou un volume `emptyDir` → reviens aux fondamentaux et au guide workloads.
- Tu cherches le RBAC, la sauvegarde etcd ou les mises à jour de cluster → c'est le guide suivant.
:::

:::lang en
A container is **ephemeral**: when it dies, its disk dies with it. For a database, an upload, an on-disk cache, that's unacceptable. So Kubernetes separates **storage** from the pod's lifecycle, with a model the **CKA/CKAD** exam tests deeply: *how do you claim storage without knowing the physical disk behind it? how do you guarantee data survives the pod? how do you give each replica of a database its own stable volume?*

This guide covers the whole **Storage** domain: **`PersistentVolume`** (PV) and **`PersistentVolumeClaim`** (PVC), **dynamic provisioning** by **`StorageClass`** (and its **`WaitForFirstConsumer`** trap), **access modes** and **reclaim policy**, the **static PV**, and the **`StatefulSet`** with stable per-replica storage.

We work **locally on k3d**, which ships the **`local-path`** provisioner: a real default StorageClass, so dynamic provisioning **just works** on your machine. No cloud.

**Who it's for:** you have the **fundamentals**, **workloads** and **networking** guides, and you're aiming for the cert.

**When it's NOT the right choice:**

- You don't know what a pod or an `emptyDir` volume is → go back to the fundamentals and the workloads guide.
- You're after RBAC, etcd backup or cluster upgrades → that's the next guide.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Lire les **StorageClass** disponibles et comprendre le **binding mode**.
- Créer un **PVC** provisionné **dynamiquement**, et expliquer `WaitForFirstConsumer`.
- **Monter** un PVC dans un pod, y écrire, et prouver la **persistance** au-delà du pod.
- Distinguer les **access modes** (RWO/ROX/RWX) et les **reclaim policy** (Delete/Retain).
- Créer un **PV statique** et le lier à un PVC (le modèle manuel).
- Déployer un **StatefulSet** avec `volumeClaimTemplates` : un volume **stable par réplica**.
:::

:::lang en
By the end of this guide, you'll know how to:

- Read available **StorageClasses** and understand the **binding mode**.
- Create a **dynamically** provisioned **PVC**, and explain `WaitForFirstConsumer`.
- **Mount** a PVC in a pod, write to it, and prove **persistence** beyond the pod.
- Distinguish **access modes** (RWO/ROX/RWX) and **reclaim policies** (Delete/Retain).
- Create a **static PV** and bind it to a PVC (the manual model).
- Deploy a **StatefulSet** with `volumeClaimTemplates`: a **stable per-replica** volume.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides **fondamentaux**, **workloads & scheduling** et **services & networking** acquis.
- **Docker** lancé, **k3d** et **kubectl** installés.

On crée un cluster **mono-nœud** dédié (le stockage `local-path` est **local au nœud** ; un seul nœud rend la persistance déterministe dans nos démos) :
:::

:::lang en
You should have:

- The **fundamentals**, **workloads & scheduling** and **services & networking** guides under your belt.
- **Docker** running, **k3d** and **kubectl** installed.

We create a dedicated **single-node** cluster (`local-path` storage is **node-local**; a single node makes persistence deterministic in our demos):
:::

```bash
# (optionnel) libère de la RAM en supprimant les clusters précédents / (optional) free RAM by deleting previous clusters
# k3d cluster delete netlab ckalab
k3d cluster create stolab
kubectl create namespace sto
kubectl config set-context --current --namespace=sto
```

## concepts

:::lang fr
Le stockage Kubernetes repose sur une **séparation des rôles**, comme un service de location.

- Le **`PersistentVolume`** (PV) est **le disque** : une ressource de stockage réelle dans le cluster (un chemin local, un disque cloud, un partage NFS…). C'est l'**offre**.
- Le **`PersistentVolumeClaim`** (PVC) est **la demande** : « je veux 1 Gi, en lecture-écriture ». Le pod ne connaît **que** le PVC ; il ignore le disque physique derrière.
- Kubernetes **lie** (*bind*) un PVC à un PV compatible. Une fois lié, le pod monte le PVC comme un volume.

**Deux façons d'obtenir un PV :**

- **Statique** : un admin crée le PV à la main, à l'avance. Le PVC s'y lie s'il correspond (taille, access mode, class).
- **Dynamique** : une **`StorageClass`** crée le PV **automatiquement** au moment du PVC, via un **provisioner**. Plus besoin d'admin. Sur k3d, la classe `local-path` fait ça.

**Le piège `WaitForFirstConsumer`.** Une StorageClass a un **`volumeBindingMode`**. En `Immediate`, le PV est créé dès le PVC. En **`WaitForFirstConsumer`** (le mode de `local-path`), le PV n'est créé que **lorsqu'un pod consomme** le PVC — donc **un PVC seul reste `Pending`**, et ce n'est pas un bug. Ça permet au scheduler de placer d'abord le pod, puis de créer le volume au bon endroit.

**Access modes.** `ReadWriteOnce` (RWO, un seul nœud en écriture — le plus courant), `ReadOnlyMany` (ROX), `ReadWriteMany` (RWX, plusieurs nœuds — rare, exige un backend qui le supporte). `ReadWriteOncePod` (RWOP) restreint à un seul **pod**.

**Reclaim policy.** Que devient le PV quand on supprime le PVC ? **`Delete`** (le disque est effacé — défaut du dynamique) ou **`Retain`** (le PV et la donnée survivent, pour récupération manuelle).

**Le StatefulSet.** Un Deployment donne des pods **interchangeables** et **sans** stockage propre. Un **StatefulSet** donne à chaque réplica une **identité stable** (`web-0`, `web-1`…) **et**, via `volumeClaimTemplates`, **son propre PVC** (`data-web-0`, `data-web-1`…) qui le suit. C'est le contrôleur des bases de données et des systèmes à état.
:::

:::lang en
Kubernetes storage rests on a **separation of roles**, like a rental service.

- The **`PersistentVolume`** (PV) is **the disk**: a real storage resource in the cluster (a local path, a cloud disk, an NFS share…). It's the **supply**.
- The **`PersistentVolumeClaim`** (PVC) is **the request**: "I want 1 Gi, read-write". The pod knows **only** the PVC; it ignores the physical disk behind it.
- Kubernetes **binds** a PVC to a compatible PV. Once bound, the pod mounts the PVC as a volume.

**Two ways to get a PV:**

- **Static**: an admin creates the PV by hand, ahead of time. The PVC binds to it if it matches (size, access mode, class).
- **Dynamic**: a **`StorageClass`** creates the PV **automatically** at PVC time, via a **provisioner**. No admin needed. On k3d, the `local-path` class does this.

**The `WaitForFirstConsumer` trap.** A StorageClass has a **`volumeBindingMode`**. In `Immediate`, the PV is created as soon as the PVC exists. In **`WaitForFirstConsumer`** (`local-path`'s mode), the PV is created only **when a pod consumes** the PVC — so **a lone PVC stays `Pending`**, and that's not a bug. It lets the scheduler place the pod first, then create the volume in the right place.

**Access modes.** `ReadWriteOnce` (RWO, a single node writing — the most common), `ReadOnlyMany` (ROX), `ReadWriteMany` (RWX, multiple nodes — rare, needs a backend that supports it). `ReadWriteOncePod` (RWOP) restricts to a single **pod**.

**Reclaim policy.** What happens to the PV when the PVC is deleted? **`Delete`** (the disk is wiped — dynamic default) or **`Retain`** (the PV and data survive, for manual recovery).

**The StatefulSet.** A Deployment gives **interchangeable** pods with **no** storage of their own. A **StatefulSet** gives each replica a **stable identity** (`web-0`, `web-1`…) **and**, via `volumeClaimTemplates`, **its own PVC** (`data-web-0`, `data-web-1`…) that follows it. It's the controller for databases and stateful systems.
:::

:::figure kubernetes-storage-binding
caption_fr: "Schéma 1. Le pod monte un PVC (la demande) ; le PVC est lié à un PV (le disque), créé à la main (statique) ou par une StorageClass (dynamique)."
caption_en: "Figure 1. The pod mounts a PVC (the request); the PVC binds to a PV (the disk), created by hand (static) or by a StorageClass (dynamic)."
:::

:::lang fr
On avance : StorageClass → PVC dynamique (Pending) → montage & persistance → PV statique & reclaim → StatefulSet.
:::

:::lang en
We'll go: StorageClass → dynamic PVC (Pending) → mount & persistence → static PV & reclaim → StatefulSet.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Inspecter la **StorageClass** par défaut et lire son **binding mode**.

**🤔 Ce que k3d te donne.** k3s installe la classe `local-path` **par défaut**. Regarde-la :
:::

:::lang en
**Goal.** Inspect the default **StorageClass** and read its **binding mode**.

**🤔 What k3d gives you.** k3s installs the `local-path` class **by default**. Look at it:
:::

```bash
kubectl get storageclass
kubectl get storageclass local-path -o jsonpath='{.provisioner}{"\n"}{.volumeBindingMode}{"\n"}'
```

:::lang fr
**✅ Vérification :** `kubectl get storageclass` liste `local-path` avec la mention **`(default)`**. La commande `jsonpath` affiche `rancher.io/local-path` (le provisioner) puis **`WaitForFirstConsumer`** (le binding mode). Retiens ce dernier point : il explique **tout** le comportement de l'étape suivante.
:::

:::lang en
**✅ Check:** `kubectl get storageclass` lists `local-path` with the **`(default)`** marker. The `jsonpath` command prints `rancher.io/local-path` (the provisioner) then **`WaitForFirstConsumer`** (the binding mode). Remember this last point: it explains **all** the behavior in the next step.
:::

### step-02

:::lang fr
**Objectif.** Créer un **PVC** dynamique — et comprendre pourquoi il reste **`Pending`**.

**🤔 Pas de `storageClassName` → classe par défaut.** En l'omettant, le PVC prend `local-path`. Crée `pvc.yaml` :
:::

:::lang en
**Goal.** Create a dynamic **PVC** — and understand why it stays **`Pending`**.

**🤔 No `storageClassName` → default class.** By omitting it, the PVC takes `local-path`. Create `pvc.yaml`:
:::

```yaml
# pvc.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 1Gi
```

```bash
kubectl apply -f pvc.yaml
kubectl get pvc data          # STATUS Pending — attendu ! / Pending — expected!
kubectl describe pvc data | grep -i 'waiting\|WaitForFirstConsumer'
```

:::lang fr
**✅ Vérification :** `kubectl get pvc data` montre `STATUS Pending`, et `describe` affiche `waiting for first consumer to be created before binding`. **Ce n'est pas une erreur** : avec `WaitForFirstConsumer`, aucun PV n'est créé tant qu'aucun pod ne monte ce PVC. On corrige ça à l'étape suivante en lui donnant un consommateur.
:::

:::lang en
**✅ Check:** `kubectl get pvc data` shows `STATUS Pending`, and `describe` shows `waiting for first consumer to be created before binding`. **It's not an error**: with `WaitForFirstConsumer`, no PV is created until a pod mounts this PVC. We fix that in the next step by giving it a consumer.
:::

### step-03

:::lang fr
**Objectif.** **Monter** le PVC dans un pod → le PV est provisionné, le PVC passe `Bound`, et on écrit de la donnée.

Crée `writer.yaml` :
:::

:::lang en
**Goal.** **Mount** the PVC in a pod → the PV gets provisioned, the PVC goes `Bound`, and we write data.

Create `writer.yaml`:
:::

```yaml
# writer.yaml
apiVersion: v1
kind: Pod
metadata:
  name: writer
spec:
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "echo 'donnée persistante' > /data/note.txt && sleep 3600"]
      volumeMounts:
        - name: vol
          mountPath: /data
  volumes:
    - name: vol
      persistentVolumeClaim:
        claimName: data
```

```bash
kubectl apply -f writer.yaml
kubectl get pvc data          # STATUS passe à Bound / STATUS becomes Bound
kubectl get pv                # un PV a été créé automatiquement / a PV was auto-created
kubectl exec writer -- cat /data/note.txt      # "donnée persistante"
```

:::lang fr
**✅ Vérification :** dès que le pod `writer` est planifié, `kubectl get pvc data` passe **`Bound`**, et `kubectl get pv` montre un PV **créé automatiquement** par le provisioner `local-path` (nom `pvc-…`). Le fichier `/data/note.txt` existe. Le `WaitForFirstConsumer` a joué : le pod a été le déclencheur. Tu viens de faire du provisionnement **dynamique** de bout en bout.
:::

:::lang en
**✅ Check:** as soon as the `writer` pod is scheduled, `kubectl get pvc data` goes **`Bound`**, and `kubectl get pv` shows a PV **auto-created** by the `local-path` provisioner (name `pvc-…`). The `/data/note.txt` file exists. `WaitForFirstConsumer` did its job: the pod was the trigger. You've just done **dynamic** provisioning end to end.
:::

### step-04

:::lang fr
**Objectif.** Prouver la **persistance** : supprimer le pod, en recréer un, retrouver la donnée.

**🤔 Le disque survit au pod.** Le PVC (et son PV) sont **indépendants** du pod. Détruis le pod, recrée-le sur le **même** PVC :
:::

:::lang en
**Goal.** Prove **persistence**: delete the pod, recreate one, find the data again.

**🤔 The disk survives the pod.** The PVC (and its PV) are **independent** of the pod. Destroy the pod, recreate it on the **same** PVC:
:::

```bash
kubectl delete pod writer
kubectl get pvc data          # toujours Bound (le PVC n'a pas bougé) / still Bound

# un nouveau pod, en lecture seule de la même donnée / a new pod, reading the same data
kubectl run reader --image=busybox:1.36 --restart=Never -it --rm \
  --overrides='{"spec":{"containers":[{"name":"r","image":"busybox:1.36","command":["cat","/data/note.txt"],"volumeMounts":[{"name":"v","mountPath":"/data"}]}],"volumes":[{"name":"v","persistentVolumeClaim":{"claimName":"data"}}]}}'
```

:::lang fr
**✅ Vérification :** après suppression du pod `writer`, le PVC `data` reste **`Bound`** et le PV intact. Le nouveau pod `reader`, monté sur le **même** PVC, affiche `donnée persistante` — **la donnée a survécu** à la destruction du pod qui l'avait écrite. C'est toute la promesse du stockage persistant : le cycle de vie de la **donnée** est découplé de celui du **pod**.
:::

:::lang en
**✅ Check:** after deleting the `writer` pod, the `data` PVC stays **`Bound`** and the PV intact. The new `reader` pod, mounted on the **same** PVC, prints `donnée persistante` — **the data survived** the destruction of the pod that wrote it. That's the whole promise of persistent storage: the **data**'s lifecycle is decoupled from the **pod**'s.
:::

### step-05

:::lang fr
**Objectif.** Créer un **PV statique** (le modèle manuel), le lier à un PVC, et fixer une **reclaim policy `Retain`**.

**🤔 Statique vs dynamique.** Ici pas de StorageClass qui provisionne : **toi** tu déclares le disque (un `hostPath` sur le nœud), et un PVC vient s'y lier. On isole du dynamique avec une **class dédiée `manual`** (présente des deux côtés) pour que `local-path` ne s'en mêle pas. Crée `static.yaml` :
:::

:::lang en
**Goal.** Create a **static PV** (the manual model), bind it to a PVC, and set a **`Retain` reclaim policy**.

**🤔 Static vs dynamic.** Here no StorageClass provisions anything: **you** declare the disk (a `hostPath` on the node), and a PVC comes to bind to it. We isolate from dynamic with a dedicated **`manual` class** (present on both sides) so `local-path` doesn't interfere. Create `static.yaml`:
:::

```yaml
# static.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-manual
spec:
  capacity:
    storage: 500Mi
  accessModes: ["ReadWriteOnce"]
  persistentVolumeReclaimPolicy: Retain      # la donnée survit à la suppression du PVC / data survives PVC deletion
  storageClassName: manual
  hostPath:
    path: /tmp/pv-manual                      # sur le nœud k3d / on the k3d node
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: claim-manual
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 200Mi                          # <= capacité du PV / <= PV capacity
  storageClassName: manual
```

```bash
kubectl apply -f static.yaml
kubectl get pv pv-manual            # STATUS Bound, CLAIM sto/claim-manual / bound to our claim
kubectl get pvc claim-manual        # STATUS Bound, VOLUME pv-manual
```

:::lang fr
**✅ Vérification :** `pv-manual` passe **`Bound`** au PVC `claim-manual` — liaison **manuelle** réussie, sans provisioner : ils partagent `storageClassName: manual`, et la demande (200Mi, RWO) est compatible avec l'offre (500Mi, RWO). Le PV porte `RECLAIM POLICY Retain` : si tu supprimes le PVC, le PV passera en `Released` **sans effacer la donnée** (à l'inverse du `Delete` dynamique). Vérifie-le : `kubectl delete pvc claim-manual`, puis `kubectl get pv` → `pv-manual` en `Released`, toujours là.
:::

:::lang en
**✅ Check:** `pv-manual` goes **`Bound`** to the `claim-manual` PVC — a successful **manual** binding, no provisioner: they share `storageClassName: manual`, and the request (200Mi, RWO) is compatible with the supply (500Mi, RWO). The PV carries `RECLAIM POLICY Retain`: if you delete the PVC, the PV goes to `Released` **without wiping the data** (unlike the dynamic `Delete`). Check it: `kubectl delete pvc claim-manual`, then `kubectl get pv` → `pv-manual` in `Released`, still there.
:::

### step-06

:::lang fr
**Objectif.** Déployer un **StatefulSet** : chaque réplica reçoit **son propre** PVC stable et **son** identité.

**🤔 Ce que le Deployment ne sait pas faire.** Un StatefulSet a besoin d'un **Service headless** (identités DNS stables, cf. guide networking) et d'un **`volumeClaimTemplates`** (un PVC par pod). Crée `sts.yaml` :
:::

:::lang en
**Goal.** Deploy a **StatefulSet**: each replica gets **its own** stable PVC and **its** identity.

**🤔 What a Deployment can't do.** A StatefulSet needs a **headless Service** (stable DNS identities, see the networking guide) and a **`volumeClaimTemplates`** (one PVC per pod). Create `sts.yaml`:
:::

```yaml
# sts.yaml
apiVersion: v1
kind: Service
metadata:
  name: web            # service "gouvernant" headless / headless "governing" service
spec:
  clusterIP: None
  selector: { app: web }
  ports: [{ port: 80 }]
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: web
  replicas: 3
  selector:
    matchLabels: { app: web }
  template:
    metadata:
      labels: { app: web }
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          volumeMounts:
            - name: data
              mountPath: /usr/share/nginx/html
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 200Mi
```

```bash
kubectl apply -f sts.yaml
kubectl rollout status statefulset/web         # attends les 3 pods / wait for the 3 pods
kubectl get pods -l app=web                     # web-0, web-1, web-2 (ordre stable) / stable order
kubectl get pvc                                 # data-web-0, data-web-1, data-web-2
```

:::lang fr
**✅ Vérification :** les pods s'appellent **`web-0`, `web-1`, `web-2`** (noms **stables et ordonnés**, pas de hash aléatoire), et `kubectl get pvc` liste **un PVC par pod** : `data-web-0`, `data-web-1`, `data-web-2` — chacun provisionné dynamiquement. Preuve du lien stable : écris une marque dans `web-0` (`kubectl exec web-0 -- sh -c "echo web-0 > /usr/share/nginx/html/id"`), supprime le pod (`kubectl delete pod web-0`) ; il **renaît sous le même nom** et **remonte son PVC `data-web-0`** → `kubectl exec web-0 -- cat /usr/share/nginx/html/id` renvoie encore `web-0`. Identité **et** stockage suivent le réplica. C'est le contrôleur des bases de données.
:::

:::lang en
**✅ Check:** the pods are named **`web-0`, `web-1`, `web-2`** (**stable, ordered** names, no random hash), and `kubectl get pvc` lists **one PVC per pod**: `data-web-0`, `data-web-1`, `data-web-2` — each dynamically provisioned. Proof of the stable link: write a mark in `web-0` (`kubectl exec web-0 -- sh -c "echo web-0 > /usr/share/nginx/html/id"`), delete the pod (`kubectl delete pod web-0`); it **reborn under the same name** and **remounts its `data-web-0` PVC** → `kubectl exec web-0 -- cat /usr/share/nginx/html/id` still returns `web-0`. Identity **and** storage follow the replica. That's the database controller.
:::

## pitfalls

:::lang fr
**1. S'affoler d'un PVC `Pending`.** Avec `WaitForFirstConsumer` (le défaut k3d), c'est **normal** tant qu'aucun pod ne monte le PVC. Regarde `kubectl describe pvc` : `waiting for first consumer`.

**2. Demander plus que l'offre (PV statique).** Un PVC de 1Gi ne se liera pas à un PV de 500Mi. La demande doit être **≤** la capacité, et les **access modes** doivent correspondre.

**3. Oublier `storageClassName: ""` ou une class dédiée pour du statique.** Sans class explicite, un PVC prend la classe **par défaut** et déclenche le provisionnement dynamique au lieu de se lier à ton PV statique. Utilise une class dédiée (ici `manual`) des deux côtés.

**4. Croire que `Delete` garde la donnée.** Reclaim `Delete` (défaut dynamique) **efface** le disque quand le PVC part. Pour garder la donnée, il faut `Retain`.

**5. `ReadWriteMany` par réflexe.** RWX exige un backend qui le supporte (NFS, CephFS…). `local-path` et la plupart des disques bloc ne font que **RWO**. Demander RWX là où il n'existe pas = PVC qui ne se lie jamais.

**6. Utiliser un Deployment pour une base répliquée.** Sans identité ni volume stable, deux répliques écrasent la même donnée ou perdent la leur. Base à état = **StatefulSet**.

**7. Supprimer un StatefulSet croyant supprimer ses PVC.** Les `volumeClaimTemplates` **ne sont pas** supprimés avec le StatefulSet (par sécurité). Nettoie explicitement : `kubectl delete pvc -l app=web`.
:::

:::lang en
**1. Panicking at a `Pending` PVC.** With `WaitForFirstConsumer` (the k3d default), it's **normal** until a pod mounts the PVC. Look at `kubectl describe pvc`: `waiting for first consumer`.

**2. Requesting more than the supply (static PV).** A 1Gi PVC won't bind to a 500Mi PV. The request must be **≤** the capacity, and the **access modes** must match.

**3. Forgetting `storageClassName: ""` or a dedicated class for static.** Without an explicit class, a PVC takes the **default** class and triggers dynamic provisioning instead of binding to your static PV. Use a dedicated class (here `manual`) on both sides.

**4. Believing `Delete` keeps the data.** Reclaim `Delete` (dynamic default) **wipes** the disk when the PVC leaves. To keep the data, use `Retain`.

**5. Reflexively using `ReadWriteMany`.** RWX needs a backend that supports it (NFS, CephFS…). `local-path` and most block disks only do **RWO**. Requesting RWX where it doesn't exist = a PVC that never binds.

**6. Using a Deployment for a replicated database.** Without stable identity or volume, two replicas overwrite the same data or lose theirs. Stateful = **StatefulSet**.

**7. Deleting a StatefulSet thinking it deletes its PVCs.** The `volumeClaimTemplates` are **not** deleted with the StatefulSet (by safety). Clean up explicitly: `kubectl delete pvc -l app=web`.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu lis la StorageClass par défaut et son `volumeBindingMode`.
- [ ] Tu expliques pourquoi un PVC `local-path` reste `Pending` sans consommateur.
- [ ] Tu montes un PVC, écris, supprimes le pod et **retrouves** la donnée.
- [ ] Tu distingues **access modes** et **reclaim policy**.
- [ ] Tu lies un **PV statique** à un PVC via une class dédiée.
- [ ] Tu déploies un **StatefulSet** et tu vois un PVC stable par réplica.

Six cases cochées = tu maîtrises le domaine **Storage** du CKA/CKAD.
:::

:::lang en
You know it works when…

- [ ] You read the default StorageClass and its `volumeBindingMode`.
- [ ] You explain why a `local-path` PVC stays `Pending` without a consumer.
- [ ] You mount a PVC, write, delete the pod and **find** the data again.
- [ ] You distinguish **access modes** and **reclaim policy**.
- [ ] You bind a **static PV** to a PVC via a dedicated class.
- [ ] You deploy a **StatefulSet** and see a stable per-replica PVC.

Six boxes ticked = you've got the CKA/CKAD **Storage** domain.
:::

## next

:::lang fr
La suite de la track Kubernetes → CKA/CKAD :

1. **Cluster ops, sécurité & RBAC** — kubeconfig/contextes, RBAC (Roles/Bindings, ServiceAccount), sauvegarde **etcd**, mises à jour, troubleshooting.
2. **Projet d'entreprise** — appli multi-tier (ingress + config + **stockage** + probes + autoscaling) : le livrable de CV.
:::

:::lang en
The rest of the Kubernetes → CKA/CKAD track:

1. **Cluster ops, security & RBAC** — kubeconfig/contexts, RBAC (Roles/Bindings, ServiceAccount), **etcd** backup, upgrades, troubleshooting.
2. **Enterprise project** — multi-tier app (ingress + config + **storage** + probes + autoscaling): the CV deliverable.
:::

## cheatsheet

:::lang fr
Aide-mémoire stockage.
:::

:::lang en
Storage cheat sheet.
:::

```bash
# StorageClass
kubectl get storageclass                         # (default) = classe utilisée si non précisée / used if unspecified
#   volumeBindingMode: WaitForFirstConsumer -> PVC Pending jusqu'au pod / until a pod

# PVC dynamique / dynamic PVC  (omet storageClassName -> défaut / omit -> default)
#   accessModes: [ReadWriteOnce] ; resources.requests.storage: 1Gi
kubectl get pvc                                  # STATUS Bound / Pending
kubectl get pv                                   # PV créés (dynamiques nommés pvc-…) / created PVs

# PV statique / static PV
#   PV + PVC partagent storageClassName (ex: manual) / share storageClassName
#   persistentVolumeReclaimPolicy: Retain | Delete

# Monter dans un pod / mount in a pod
#   volumes[].persistentVolumeClaim.claimName + containers[].volumeMounts

# StatefulSet
#   serviceName (headless) + volumeClaimTemplates -> data-<sts>-<n>
kubectl get pods -l app=web        # web-0, web-1… (stables)
kubectl delete pvc -l app=web      # nettoyer les PVC d'un StatefulSet / clean STS PVCs
```

## resources

:::lang fr
- [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) — PV, PVC, reclaim, access modes.
- [Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/) et [volume binding mode](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode).
- [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/).
- [k3s — local-path storage](https://docs.k3s.io/storage) (le provisioner par défaut).
:::

:::lang en
- [Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) — PV, PVC, reclaim, access modes.
- [Storage Classes](https://kubernetes.io/docs/concepts/storage/storage-classes/) and [volume binding mode](https://kubernetes.io/docs/concepts/storage/storage-classes/#volume-binding-mode).
- [StatefulSet](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/).
- [k3s — local-path storage](https://docs.k3s.io/storage) (the default provisioner).
:::

## troubleshooting

:::lang fr
**Le PVC reste `Pending`.** Deux causes : soit `WaitForFirstConsumer` et **aucun pod** ne le monte encore (normal — crée le pod) ; soit **aucun PV compatible** (statique : taille/access mode/class ne matchent pas). `kubectl describe pvc` tranche.

**Le pod reste `Pending` avec `unbound immediate PersistentVolumeClaim`.** Le PVC monté ne peut pas se lier — typiquement un PVC **statique sans PV compatible** (ou une class en mode `Immediate` sans PV). *(À ne pas confondre avec `WaitForFirstConsumer`, où c'est au contraire le pod qui **débloque** la liaison en se planifiant.)* Vérifie le PVC avec `kubectl describe pvc`.

**`kubectl get pv` ne montre rien après un PVC dynamique.** Normal tant que le PVC est `Pending` (WaitForFirstConsumer) : le PV n'est créé qu'à l'arrivée du pod.

**Un PVC statique ne se lie pas.** Vérifie que **PV et PVC partagent le même `storageClassName`**, que la capacité du PV **≥** la demande, et que les access modes correspondent exactement.

**Après suppression d'un StatefulSet, les PVC restent.** C'est voulu (protection de la donnée). Supprime-les à la main : `kubectl delete pvc -l app=web`.

**La donnée d'un pod recréé a disparu (multi-nœuds).** `local-path` est **local au nœud** : si le pod renaît sur un autre nœud, il ne retrouve pas son disque. En démo mono-nœud, pas de souci ; en multi-nœuds, il faut un stockage réseau ou une affinité.
:::

:::lang en
**The PVC stays `Pending`.** Two causes: either `WaitForFirstConsumer` and **no pod** mounts it yet (normal — create the pod); or **no compatible PV** (static: size/access mode/class don't match). `kubectl describe pvc` decides.

**The pod stays `Pending` with `unbound immediate PersistentVolumeClaim`.** The mounted PVC can't bind — typically a **static PVC with no compatible PV** (or an `Immediate`-mode class with no PV). *(Don't confuse this with `WaitForFirstConsumer`, where the pod instead **unblocks** binding by scheduling.)* Check the PVC with `kubectl describe pvc`.

**`kubectl get pv` shows nothing after a dynamic PVC.** Normal while the PVC is `Pending` (WaitForFirstConsumer): the PV is only created when the pod arrives.

**A static PVC won't bind.** Check that **PV and PVC share the same `storageClassName`**, that the PV capacity is **≥** the request, and that access modes match exactly.

**After deleting a StatefulSet, the PVCs remain.** That's intended (data protection). Delete them by hand: `kubectl delete pvc -l app=web`.

**A recreated pod's data is gone (multi-node).** `local-path` is **node-local**: if the pod is reborn on another node, it won't find its disk. In a single-node demo, no problem; multi-node needs network storage or an affinity.
:::
