---
# — Identité (ne change JAMAIS une fois publié) —
id: linux-fichiers-disques
slug: linux-fichiers-disques
order: 5
status: published

# — Titres & accroches (bilingue) —
title_fr: "Linux — systèmes de fichiers, disques & FHS"
title_en: "Linux — filesystems, disks & FHS"
tagline_fr: "FHS, partitions, mkfs, fstab, UUID, liens, LVM."
tagline_en: "FHS, partitions, mkfs, fstab, UUID, links, LVM."

# — Métadonnées pédagogiques —
level: intermediate
duration_min: 190
last_review: "2026-08-12"

# — Relations de parcours (par id) —
prerequisites: [linux-utilisateurs-permissions]
next: [git-fondamentaux]

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [fhs-hierarchie, peripheriques-blocs, partitionnement, mkfs-mount, fstab-uuid, liens-inodes, lvm]
concepts_en: [fhs-hierarchy, block-devices, partitioning, mkfs-mount, fstab-uuid, links-inodes, lvm]

# — Accès (freemium) —
access: premium

# — Partage social (Open Graph) —
og_description_fr: "Disques et systèmes de fichiers Linux au niveau LPIC-1, sans risque grâce à un disque virtuel (fichier loopback) : la hiérarchie FHS, le partitionnement (parted/fdisk), mkfs et le montage, la persistance via /etc/fstab et UUID, les liens durs et symboliques, et LVM (créer et étendre un volume)."
og_description_en: "Linux disks and filesystems at LPIC-1 level, risk-free thanks to a virtual disk (loopback file): the FHS hierarchy, partitioning (parted/fdisk), mkfs and mounting, persistence via /etc/fstab and UUID, hard and symbolic links, and LVM (create and extend a volume)."
---

## intro

:::lang fr
Sur un serveur, **les données vivent sur des disques** — et l'admin doit savoir les préparer : partitionner, formater, monter, faire persister, agrandir. Le guide fondamentaux t'a montré l'arborescence ; l'examen **LPIC-1** attend la manœuvre complète : *où va quoi dans le système (FHS) ? comment découper un disque en partitions ? le formater ? le monter au démarrage par un identifiant stable (UUID) ? quelle différence entre un lien dur et un lien symbolique ? et comment agrandir un volume sans tout casser (LVM) ?*

Ce guide couvre le domaine **Systèmes de fichiers & périphériques** en profondeur : la hiérarchie **FHS**, le **partitionnement**, **`mkfs`** et le **montage**, la persistance via **`/etc/fstab`** et **UUID**, les **liens** durs/symboliques, et **LVM**.

Le génie du dispositif : on ne touche **aucun disque réel**. On fabrique un **disque virtuel** — un simple **fichier** attaché en périphérique via `losetup` (une « image de disque »). Tu partitionnes, formates et montes **ce fichier** comme un vrai disque, **sans le moindre risque** pour ta machine. Tout est refaisable dans une VM (Multipass recommandé pour les opérations bloc).

**Pour qui c'est :** tu as les guides **fondamentaux**, **paquets** et **permissions**, et tu vises **LPIC-1**.

**Quand ce n'est PAS le bon choix :**

- Tu ne sais pas te déplacer dans l'arborescence → reviens aux fondamentaux.
- Tu veux systemd, le réseau ou le scripting → ce sont les guides suivants.
:::

:::lang en
On a server, **data lives on disks** — and the admin must know how to prepare them: partition, format, mount, persist, grow. The fundamentals guide showed you the tree; the **LPIC-1** exam expects the full maneuver: *where does what go in the system (FHS)? how do you split a disk into partitions? format it? mount it at boot via a stable identifier (UUID)? what's the difference between a hard link and a symbolic link? and how do you grow a volume without breaking everything (LVM)?*

This guide covers the **Filesystems & devices** domain in depth: the **FHS** hierarchy, **partitioning**, **`mkfs`** and **mounting**, persistence via **`/etc/fstab`** and **UUID**, hard/symbolic **links**, and **LVM**.

The clever part: we touch **no real disk**. We build a **virtual disk** — a plain **file** attached as a device via `losetup` (a "disk image"). You partition, format and mount **that file** like a real disk, **with zero risk** to your machine. All reproducible in a VM (Multipass recommended for the block operations).

**Who it's for:** you have the **fundamentals**, **packages** and **permissions** guides, and you're aiming for **LPIC-1**.

**When it's NOT the right choice:**

- You can't navigate the tree → go back to the fundamentals.
- You want systemd, networking or scripting → those are the next guides.
:::

## objectives

:::lang fr
À la fin de ce guide, tu sauras :

- Situer les grands répertoires de la hiérarchie **FHS** et lire l'usage disque (`df`, `du`, `lsblk`).
- Fabriquer un **disque virtuel** (loopback) et le **partitionner** (`parted`/`fdisk`).
- **Formater** une partition (`mkfs.ext4`) et la **monter** (`mount`).
- Identifier une partition par son **UUID** (`blkid`) et la **persister** dans `/etc/fstab`.
- Créer et activer un **swap** (`mkswap`/`swapon`).
- Distinguer **lien dur** et **lien symbolique** (inodes).
- Créer un volume **LVM** (PV/VG/LV) et l'**étendre** à chaud.
:::

:::lang en
By the end of this guide, you'll know how to:

- Locate the major directories of the **FHS** hierarchy and read disk usage (`df`, `du`, `lsblk`).
- Build a **virtual disk** (loopback) and **partition** it (`parted`/`fdisk`).
- **Format** a partition (`mkfs.ext4`) and **mount** it (`mount`).
- Identify a partition by its **UUID** (`blkid`) and **persist** it in `/etc/fstab`.
- Create and activate **swap** (`mkswap`/`swapon`).
- Distinguish **hard link** from **symbolic link** (inodes).
- Create an **LVM** volume (PV/VG/LV) and **extend** it live.
:::

## prerequisites

:::lang fr
Tu dois avoir :

- Les guides **fondamentaux**, **paquets** et **permissions** acquis.
- Un système **Ubuntu** avec `sudo`. Pour ce guide (opérations bloc), une **VM Multipass** est le plus sûr : `multipass launch --name lab` puis `multipass shell lab`. *(WSL2 : `losetup`/LVM peuvent être limités selon le noyau — préfère une VM.)*
- Les outils LVM :
:::

:::lang en
You should have:

- The **fundamentals**, **packages** and **permissions** guides under your belt.
- An **Ubuntu** system with `sudo`. For this guide (block operations), a **Multipass VM** is safest: `multipass launch --name lab` then `multipass shell lab`. *(WSL2: `losetup`/LVM may be limited depending on the kernel — prefer a VM.)*
- The LVM tools:
:::

```bash
sudo apt update && sudo apt install -y lvm2
```

## concepts

:::lang fr
**La hiérarchie FHS** (*Filesystem Hierarchy Standard*) normalise **où va quoi** :

- **`/etc`** : la configuration (fichiers texte). **`/home`** : les données des utilisateurs. **`/root`** : le home de root.
- **`/bin`, `/sbin`, `/usr`** : les programmes (binaires système et applicatifs). **`/lib`** : les bibliothèques.
- **`/var`** : les données **variables** (logs `/var/log`, bases, files d'attente). **`/tmp`** : le temporaire.
- **`/boot`** : le noyau et le chargeur d'amorçage. **`/dev`** : les périphériques. **`/proc`, `/sys`** : des vues **virtuelles** du noyau (pas de vrais fichiers). **`/mnt`, `/media`** : points de montage. **`/opt`** : logiciels tiers.

**Du disque au fichier, la chaîne :**

1. Un **disque** (`/dev/sda`, ou notre loopback `/dev/loopN`) est un **périphérique bloc**.
2. On le **partitionne** : le découper en tranches (`/dev/sda1`…). Deux tables : **MBR** (ancienne, ≤2 To, 4 partitions primaires) et **GPT** (moderne, recommandée).
3. On **formate** chaque partition avec un **système de fichiers** (`mkfs.ext4`, `mkfs.xfs`) : ça installe la structure qui range les fichiers.
4. On **monte** la partition sur un **répertoire** (le point de montage) : à partir de là, écrire dans ce dossier écrit sur le disque.

**L'UUID, l'identifiant stable.** Le nom `/dev/sda1` peut **changer** selon l'ordre de détection des disques. L'**UUID** (identifiant unique du système de fichiers, via `blkid`) ne change **jamais** : c'est **lui** qu'on met dans `/etc/fstab` pour un montage fiable au démarrage.

**`/etc/fstab`** décrit les montages **permanents** : une ligne par système de fichiers → `identifiant  point-de-montage  type  options  dump  passe`. `mount -a` applique le fichier sans redémarrer.

**Les liens.** Un **lien dur** (`ln`) est un **second nom** pour le **même inode** (les mêmes données) : supprimer un nom ne détruit pas les données tant qu'il en reste un. Un **lien symbolique** (`ln -s`) est un **panneau indicateur** qui pointe vers un **chemin** : si la cible disparaît, le lien est cassé. Un lien dur ne peut pas traverser les systèmes de fichiers ; un lien symbolique, si.

**LVM** (*Logical Volume Manager*) ajoute une couche de souplesse : des **PV** (physical volumes, tes disques/partitions) sont regroupés en un **VG** (volume group, un « pool » d'espace), d'où l'on taille des **LV** (logical volumes, les « partitions virtuelles »). L'avantage décisif : on **agrandit** un LV à chaud, sans re-partitionner.
:::

:::lang en
**The FHS hierarchy** (*Filesystem Hierarchy Standard*) standardizes **where what goes**:

- **`/etc`**: configuration (text files). **`/home`**: user data. **`/root`**: root's home.
- **`/bin`, `/sbin`, `/usr`**: programs (system and application binaries). **`/lib`**: libraries.
- **`/var`**: **variable** data (logs `/var/log`, databases, queues). **`/tmp`**: temporary.
- **`/boot`**: the kernel and bootloader. **`/dev`**: devices. **`/proc`, `/sys`**: **virtual** kernel views (not real files). **`/mnt`, `/media`**: mount points. **`/opt`**: third-party software.

**From disk to file, the chain:**

1. A **disk** (`/dev/sda`, or our loopback `/dev/loopN`) is a **block device**.
2. You **partition** it: split it into slices (`/dev/sda1`…). Two tables: **MBR** (old, ≤2 TB, 4 primary partitions) and **GPT** (modern, recommended).
3. You **format** each partition with a **filesystem** (`mkfs.ext4`, `mkfs.xfs`): this installs the structure that organizes files.
4. You **mount** the partition on a **directory** (the mount point): from then on, writing in that folder writes to the disk.

**The UUID, the stable identifier.** The name `/dev/sda1` can **change** depending on disk detection order. The **UUID** (the filesystem's unique identifier, via `blkid`) **never** changes: that's what goes in `/etc/fstab` for a reliable mount at boot.

**`/etc/fstab`** describes **permanent** mounts: one line per filesystem → `identifier  mount-point  type  options  dump  pass`. `mount -a` applies the file without rebooting.

**Links.** A **hard link** (`ln`) is a **second name** for the **same inode** (the same data): removing one name doesn't destroy the data as long as one remains. A **symbolic link** (`ln -s`) is a **signpost** pointing at a **path**: if the target disappears, the link is broken. A hard link can't cross filesystems; a symbolic one can.

**LVM** (*Logical Volume Manager*) adds a flexibility layer: **PVs** (physical volumes, your disks/partitions) are grouped into a **VG** (volume group, a space "pool"), from which you carve **LVs** (logical volumes, the "virtual partitions"). The decisive advantage: you **grow** an LV live, without repartitioning.
:::

:::figure linux-disk-chain
caption_fr: "Schéma 1. Disque → partitions → système de fichiers → point de montage. UUID identifie de façon stable ; LVM (PV→VG→LV) permet d'étendre à chaud."
caption_en: "Figure 1. Disk → partitions → filesystem → mount point. UUID identifies stably; LVM (PV→VG→LV) allows live extension."
:::

:::lang fr
On avance : FHS & usage disque → disque virtuel & partition → mkfs & montage → fstab & UUID & swap → liens → LVM.
:::

:::lang en
We'll go: FHS & disk usage → virtual disk & partition → mkfs & mount → fstab & UUID & swap → links → LVM.
:::

## walkthrough

### step-01

:::lang fr
**Objectif.** Parcourir la **FHS** et lire l'**usage disque**.

**🤔 Savoir lire l'état des lieux.** Trois commandes d'admin quotidiennes :
:::

:::lang en
**Goal.** Tour the **FHS** and read **disk usage**.

**🤔 Knowing how to read the lay of the land.** Three everyday admin commands:
:::

```bash
ls /                        # les répertoires FHS : etc, var, usr, home, boot, dev, proc… / the FHS dirs
lsblk                       # les périphériques bloc et leurs points de montage / block devices & mounts
df -h                       # espace par système de fichiers monté / space per mounted filesystem
du -sh /var/log             # taille cumulée d'un répertoire / cumulative size of a directory
```

:::lang fr
**✅ Vérification :** `ls /` montre l'arborescence FHS (`etc`, `var`, `usr`, `home`, `boot`, `dev`, `proc`…), et tu sais dire **ce que contient chacun** (config, données variables, binaires, home…). `lsblk` liste tes disques et partitions (ex. `sda` → `sda1` monté sur `/`). `df -h` donne l'espace **par système de fichiers** (au niveau montage), `du -sh` la taille **d'un répertoire** (au niveau fichiers). Retiens la nuance : **`df`** = disques/montages, **`du`** = dossiers.
:::

:::lang en
**✅ Check:** `ls /` shows the FHS tree (`etc`, `var`, `usr`, `home`, `boot`, `dev`, `proc`…), and you can say **what each holds** (config, variable data, binaries, home…). `lsblk` lists your disks and partitions (e.g. `sda` → `sda1` mounted on `/`). `df -h` gives space **per filesystem** (at the mount level), `du -sh` the size **of a directory** (at the file level). Remember the nuance: **`df`** = disks/mounts, **`du`** = folders.
:::

### step-02

:::lang fr
**Objectif.** Fabriquer un **disque virtuel** (loopback) et le **partitionner** en GPT.

**🤔 Zéro risque.** On crée un **fichier** de 512 Mo qu'on présente au système comme un disque (`/dev/loopN`). Toutes les opérations suivantes portent sur **ce fichier**, jamais sur tes vrais disques.
:::

:::lang en
**Goal.** Build a **virtual disk** (loopback) and **partition** it as GPT.

**🤔 Zero risk.** We create a 512 MB **file** that we present to the system as a disk (`/dev/loopN`). All following operations act on **that file**, never on your real disks.
:::

```bash
fallocate -l 512M ~/disk.img                      # crée un fichier de 512 Mo / create a 512 MB file
LOOP=$(sudo losetup --show -fP ~/disk.img)        # l'attache en périphérique, ex. /dev/loop0 / attach as device
echo "Mon disque virtuel = $LOOP"

sudo parted -s "$LOOP" mklabel gpt \
  mkpart primary ext4 1MiB 100%                    # table GPT + 1 partition / GPT table + 1 partition
lsblk "$LOOP"                                       # montre LOOP -> LOOPp1 / shows LOOP -> LOOPp1
```

:::lang fr
**✅ Vérification :** `echo $LOOP` affiche ton périphérique (souvent `/dev/loop0`), et `lsblk "$LOOP"` montre le disque virtuel **avec sa partition** (`loop0` → `loop0p1`). Tu viens de créer une **table de partitions GPT** et une **partition** sur un disque qui n'est qu'un fichier. Le `-P` de `losetup` a fait apparaître la partition comme `${LOOP}p1`. *(Garde le terminal ouvert : `$LOOP` sert aux étapes suivantes.)*
:::

:::lang en
**✅ Check:** `echo $LOOP` shows your device (often `/dev/loop0`), and `lsblk "$LOOP"` shows the virtual disk **with its partition** (`loop0` → `loop0p1`). You've just created a **GPT partition table** and a **partition** on a disk that's just a file. `losetup`'s `-P` made the partition appear as `${LOOP}p1`. *(Keep the terminal open: `$LOOP` is used in the next steps.)*
:::

### step-03

:::lang fr
**Objectif.** **Formater** la partition et la **monter**.

**🤔 Formater = installer un système de fichiers.** La partition existe mais elle est **vide de structure** : `mkfs` y pose un système de fichiers ext4. Puis on la **monte** sur un dossier.
:::

:::lang en
**Goal.** **Format** the partition and **mount** it.

**🤔 Formatting = installing a filesystem.** The partition exists but has **no structure**: `mkfs` lays down an ext4 filesystem. Then we **mount** it on a folder.
:::

```bash
sudo mkfs.ext4 "${LOOP}p1"               # formate la partition en ext4 / format the partition as ext4
sudo mkdir -p /mnt/data
sudo mount "${LOOP}p1" /mnt/data          # monte la partition sur /mnt/data / mount it
df -h /mnt/data                           # confirme : monté, ~470 Mo dispo / mounted, ~470 MB free
echo "test" | sudo tee /mnt/data/hello.txt   # écrire ici écrit sur le disque virtuel / writing here writes to disk
```

:::lang fr
**✅ Vérification :** `df -h /mnt/data` montre la partition **montée** (source `${LOOP}p1`, quelques centaines de Mo disponibles). Le fichier `hello.txt` écrit dans `/mnt/data` est **stocké sur le disque virtuel** : démonte (`sudo umount /mnt/data`) puis remonte, il est toujours là. Tu as bouclé la chaîne **partition → formatage → montage → données**.
:::

:::lang en
**✅ Check:** `df -h /mnt/data` shows the partition **mounted** (source `${LOOP}p1`, a few hundred MB free). The `hello.txt` file written in `/mnt/data` is **stored on the virtual disk**: unmount (`sudo umount /mnt/data`) then remount, it's still there. You've closed the chain **partition → format → mount → data**.
:::

### step-04

:::lang fr
**Objectif.** **Persister** le montage via **UUID** dans `/etc/fstab`, et créer un **swap**.

**🤔 Pourquoi l'UUID.** `${LOOP}p1` peut changer de numéro ; l'**UUID** est gravé dans le système de fichiers. Récupère-le et écris la ligne `fstab` :
:::

:::lang en
**Goal.** **Persist** the mount via **UUID** in `/etc/fstab`, and create **swap**.

**🤔 Why the UUID.** `${LOOP}p1` can change number; the **UUID** is baked into the filesystem. Get it and write the `fstab` line:
:::

```bash
UUID=$(sudo blkid -s UUID -o value "${LOOP}p1")     # l'UUID de la partition / the partition's UUID
echo "UUID=$UUID"

# nofail = ne bloque pas le boot si absent (utile pour un disque loopback) / don't block boot if missing
echo "UUID=$UUID  /mnt/data  ext4  defaults,nofail  0  2" | sudo tee -a /etc/fstab

sudo umount /mnt/data 2>/dev/null ; sudo mount -a    # relit fstab et monte tout / re-read fstab & mount all
df -h /mnt/data                                       # remonté via fstab / remounted via fstab
```

:::lang fr
Crée maintenant un **swap** (mémoire d'appoint sur disque) via un fichier :
:::

:::lang en
Now create **swap** (disk-backed overflow memory) via a file:
:::

```bash
sudo fallocate -l 128M /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
swapon --show                                         # /swapfile listé / /swapfile listed
sudo swapoff /swapfile                                # on le désactive (démo) / disable it (demo)
```

:::lang fr
**✅ Vérification :** après `mount -a`, `df -h /mnt/data` remonte la partition **sans que tu la nommes** — `fstab` l'a fait via l'**UUID** (`mount -a` relit le fichier et monte tout ce qui n'est pas déjà monté). Un `mount -a` **sans erreur** = ta ligne `fstab` est correcte (une faute ici bloquerait le prochain démarrage — d'où l'importance de tester avec `mount -a`). Le swap : `swapon --show` liste `/swapfile` avant qu'on le désactive. L'option **`nofail`** évite qu'un disque loopback absent au boot ne bloque la VM.
:::

:::lang en
**✅ Check:** after `mount -a`, `df -h /mnt/data` remounts the partition **without you naming it** — `fstab` did it via the **UUID** (`mount -a` re-reads the file and mounts everything not already mounted). A `mount -a` **with no error** = your `fstab` line is correct (a mistake here would block the next boot — hence testing with `mount -a`). Swap: `swapon --show` lists `/swapfile` before we disable it. The **`nofail`** option prevents a loopback disk missing at boot from blocking the VM.
:::

### step-05

:::lang fr
**Objectif.** Distinguer **lien dur** et **lien symbolique** par l'**inode**.

**🤔 Deux noms, ou un panneau ?** Un lien **dur** partage l'inode (les données) ; un lien **symbolique** pointe vers un **chemin**. Observe :
:::

:::lang en
**Goal.** Distinguish **hard link** from **symbolic link** via the **inode**.

**🤔 Two names, or a signpost?** A **hard** link shares the inode (the data); a **symbolic** link points at a **path**. Observe:
:::

```bash
cd /mnt/data
echo "contenu original" | sudo tee original.txt
sudo ln original.txt dur.txt          # lien DUR : même inode / HARD link: same inode
sudo ln -s original.txt sym.txt       # lien SYMBOLIQUE : pointe vers le chemin / SYMBOLIC: points at the path
ls -li                                # -i montre l'inode / -i shows the inode

sudo rm original.txt                  # supprime le NOM original / delete the original NAME
cat dur.txt                           # marche encore (l'inode survit) / still works (inode survives)
cat sym.txt                           # CASSÉ : la cible a disparu / BROKEN: the target is gone
```

:::lang fr
**✅ Vérification :** `ls -li` montre que `original.txt` et `dur.txt` partagent le **même numéro d'inode** (colonne de gauche) — ce sont **deux noms d'une même donnée** — tandis que `sym.txt` a un inode **différent** et s'affiche `sym.txt -> original.txt`. Après avoir supprimé `original.txt` : `cat dur.txt` **marche toujours** (l'inode et ses données survivent tant qu'un nom pointe dessus), mais `cat sym.txt` **échoue** (`No such file`) — le panneau indique un chemin qui n'existe plus. C'est **la** distinction d'examen : lien dur = inode partagé, lien symbolique = chemin.
:::

:::lang en
**✅ Check:** `ls -li` shows `original.txt` and `dur.txt` share the **same inode number** (left column) — they're **two names for one piece of data** — while `sym.txt` has a **different** inode and shows as `sym.txt -> original.txt`. After deleting `original.txt`: `cat dur.txt` **still works** (the inode and its data survive as long as a name points to it), but `cat sym.txt` **fails** (`No such file`) — the signpost points at a path that no longer exists. That's **the** exam distinction: hard link = shared inode, symbolic link = path.
:::

### step-06

:::lang fr
**Objectif.** Créer un volume **LVM** et l'**étendre** à chaud — le superpouvoir des disques.

**🤔 La souplesse LVM.** On empile : deux disques virtuels → un **VG** (pool) → un **LV** (volume) qu'on formate et monte, puis qu'on **agrandit** sans démonter. Fabrique deux nouveaux loopbacks :
:::

:::lang en
**Goal.** Create an **LVM** volume and **extend** it live — the disk superpower.

**🤔 LVM flexibility.** We stack: two virtual disks → a **VG** (pool) → an **LV** (volume) we format and mount, then **grow** without unmounting. Build two new loopbacks:
:::

```bash
fallocate -l 256M ~/pv1.img && fallocate -l 256M ~/pv2.img
P1=$(sudo losetup --show -f ~/pv1.img) ; P2=$(sudo losetup --show -f ~/pv2.img)

sudo pvcreate "$P1" "$P2"                 # marque les 2 comme Physical Volumes / mark both as PVs
sudo vgcreate vg_lab "$P1" "$P2"          # pool de ~512 Mo / a ~512 MB pool
sudo lvcreate -L 200M -n lv_data vg_lab   # taille un volume de 200 Mo / carve a 200 MB volume

sudo mkfs.ext4 /dev/vg_lab/lv_data
sudo mkdir -p /mnt/lv && sudo mount /dev/vg_lab/lv_data /mnt/lv
df -h /mnt/lv                             # ~200 Mo / ~200 MB

# Étendre à chaud : +200 Mo, sans démonter / grow live: +200 MB, without unmounting
sudo lvextend -L +200M /dev/vg_lab/lv_data
sudo resize2fs /dev/vg_lab/lv_data        # étend le système de fichiers dans le LV agrandi / grow the FS
df -h /mnt/lv                             # ~400 Mo, toujours monté / ~400 MB, still mounted
```

:::lang fr
**✅ Vérification :** après `lvcreate`, `df -h /mnt/lv` montre ~200 Mo. Après `lvextend -L +200M` **puis** `resize2fs`, le **même point de montage** affiche ~400 Mo — **sans jamais démonter**, sans re-partitionner. C'est le gain décisif de LVM : agrandir un volume en production, à chaud. Retiens les deux temps : **`lvextend`** agrandit le volume logique, **`resize2fs`** étend le système de fichiers *à l'intérieur* (l'un sans l'autre ne suffit pas). `sudo vgs` et `sudo lvs` résument l'état.
:::

:::lang en
**✅ Check:** after `lvcreate`, `df -h /mnt/lv` shows ~200 MB. After `lvextend -L +200M` **then** `resize2fs`, the **same mount point** shows ~400 MB — **without ever unmounting**, without repartitioning. That's LVM's decisive win: growing a volume in production, live. Remember the two steps: **`lvextend`** grows the logical volume, **`resize2fs`** grows the filesystem *inside* it (one without the other isn't enough). `sudo vgs` and `sudo lvs` summarize the state.
:::

## pitfalls

:::lang fr
**1. Une faute dans `/etc/fstab` bloque le démarrage.** Une ligne erronée peut empêcher la machine de booter. **Teste toujours** avec `sudo mount -a` **avant** de redémarrer, et mets `nofail` sur les disques non essentiels.

**2. Monter par `/dev/sdaX` au lieu de l'UUID.** Le nom de périphérique peut changer (ordre de détection) → mauvais disque monté. Dans `fstab`, utilise l'**UUID** (`blkid`).

**3. `lvextend` sans `resize2fs`.** Agrandir le volume logique ne suffit pas : le **système de fichiers** ne le sait pas encore. Il faut `resize2fs` (ext4) ou `xfs_growfs` (xfs) après.

**4. Confondre lien dur et symbolique.** Le lien **dur** partage l'inode (survit à la suppression de l'original, ne traverse pas les FS) ; le **symbolique** pointe un chemin (se casse si la cible part, traverse les FS). Vérifie avec `ls -li`.

**5. `df` vs `du` divergent.** `df` compte au niveau **système de fichiers** (blocs), `du` au niveau **fichiers**. Un fichier supprimé mais encore ouvert par un process fait diverger les deux — c'est normal.

**6. Formater le disque au lieu de la partition.** `mkfs.ext4 /dev/loop0` (le disque) **détruit la table de partitions**. On formate la **partition** : `/dev/loop0p1`.

**7. Oublier de démonter avant de détacher un loopback.** `losetup -d` sur un périphérique encore monté échoue. Ordre : `umount` → `losetup -d`.
:::

:::lang en
**1. A mistake in `/etc/fstab` blocks boot.** A bad line can stop the machine from booting. **Always test** with `sudo mount -a` **before** rebooting, and put `nofail` on non-essential disks.

**2. Mounting by `/dev/sdaX` instead of UUID.** The device name can change (detection order) → wrong disk mounted. In `fstab`, use the **UUID** (`blkid`).

**3. `lvextend` without `resize2fs`.** Growing the logical volume isn't enough: the **filesystem** doesn't know yet. You need `resize2fs` (ext4) or `xfs_growfs` (xfs) afterward.

**4. Confusing hard and symbolic links.** The **hard** link shares the inode (survives deleting the original, doesn't cross FSes); the **symbolic** one points at a path (breaks if the target leaves, crosses FSes). Check with `ls -li`.

**5. `df` vs `du` diverge.** `df` counts at the **filesystem** level (blocks), `du` at the **file** level. A deleted-but-still-open file makes them diverge — that's normal.

**6. Formatting the disk instead of the partition.** `mkfs.ext4 /dev/loop0` (the disk) **destroys the partition table**. You format the **partition**: `/dev/loop0p1`.

**7. Forgetting to unmount before detaching a loopback.** `losetup -d` on a still-mounted device fails. Order: `umount` → `losetup -d`.
:::

## success

:::lang fr
Tu sais que c'est bon quand…

- [ ] Tu situes les répertoires **FHS** et tu lis `df`/`du`/`lsblk`.
- [ ] Tu **partitionnes** un disque (virtuel) en GPT.
- [ ] Tu **formates** (`mkfs.ext4`) et **montes** une partition.
- [ ] Tu récupères un **UUID** et tu **persistes** un montage dans `fstab` (testé par `mount -a`).
- [ ] Tu crées et actives un **swap**.
- [ ] Tu distingues **lien dur** et **symbolique** via l'inode.
- [ ] Tu crées un volume **LVM** et tu l'**étends** avec `lvextend` + `resize2fs`.

Sept cases cochées = tu tiens **Systèmes de fichiers & périphériques** du LPIC-1.
:::

:::lang en
You know it works when…

- [ ] You locate the **FHS** directories and read `df`/`du`/`lsblk`.
- [ ] You **partition** a (virtual) disk as GPT.
- [ ] You **format** (`mkfs.ext4`) and **mount** a partition.
- [ ] You get a **UUID** and **persist** a mount in `fstab` (tested by `mount -a`).
- [ ] You create and activate **swap**.
- [ ] You distinguish **hard** from **symbolic** link via the inode.
- [ ] You create an **LVM** volume and **extend** it with `lvextend` + `resize2fs`.

Seven boxes ticked = you hold LPIC-1 **Filesystems & devices**.
:::

## next

:::lang fr
La suite de la track Linux → LPIC-1 :

1. **Boot, systemd & processus** — démarrage, units/targets, `journalctl`, cron/timers.
2. **Réseau & sécurité système** — `ip`/`ss`, DNS, SSH, pare-feu, durcissement.
3. **Scripting shell (bash)** — variables, conditions, boucles, fonctions.
4. **Projet d'entreprise** — provisionner et durcir un serveur Linux multi-utilisateur.

**Ménage :** démonte et détache tout —
`sudo umount /mnt/data /mnt/lv ; sudo swapoff /swapfile 2>/dev/null ; sudo vgremove -f vg_lab ; sudo pvremove -f "$P1" "$P2" ; sudo losetup -D ; sudo sed -i '\#/mnt/data#d' /etc/fstab ; rm -f ~/disk.img ~/pv1.img ~/pv2.img ; sudo rm -f /swapfile`.
:::

:::lang en
The rest of the Linux → LPIC-1 track:

1. **Boot, systemd & processes** — startup, units/targets, `journalctl`, cron/timers.
2. **Networking & system security** — `ip`/`ss`, DNS, SSH, firewall, hardening.
3. **Shell scripting (bash)** — variables, conditionals, loops, functions.
4. **Enterprise project** — provision and harden a multi-user Linux server.

**Cleanup:** unmount and detach everything —
`sudo umount /mnt/data /mnt/lv ; sudo swapoff /swapfile 2>/dev/null ; sudo vgremove -f vg_lab ; sudo pvremove -f "$P1" "$P2" ; sudo losetup -D ; sudo sed -i '\#/mnt/data#d' /etc/fstab ; rm -f ~/disk.img ~/pv1.img ~/pv2.img ; sudo rm -f /swapfile`.
:::

## cheatsheet

:::lang fr
Aide-mémoire fichiers, disques & FHS.
:::

:::lang en
Filesystems, disks & FHS cheat sheet.
:::

```bash
# État / state
lsblk ; df -h ; du -sh DOSSIER ; blkid

# Disque virtuel (démo sûre) / virtual disk (safe demo)
fallocate -l 512M img ; LOOP=$(sudo losetup --show -fP img) ; sudo losetup -d "$LOOP"

# Partition -> FS -> montage / partition -> FS -> mount
sudo parted -s "$LOOP" mklabel gpt mkpart primary ext4 1MiB 100%
sudo mkfs.ext4 "${LOOP}p1" ; sudo mount "${LOOP}p1" /mnt/data ; sudo umount /mnt/data

# Persistance / persistence  (tester : sudo mount -a)
UUID=$(sudo blkid -s UUID -o value DEV)
# /etc/fstab : UUID=...  /mnt/data  ext4  defaults,nofail  0  2

# Swap
sudo fallocate -l 128M /swapfile ; sudo chmod 600 /swapfile
sudo mkswap /swapfile ; sudo swapon /swapfile ; swapon --show

# Liens / links
ln cible dur          # dur (même inode) / hard (same inode)
ln -s cible sym       # symbolique (chemin) / symbolic (path)     ; ls -li

# LVM
sudo pvcreate DEV... ; sudo vgcreate VG DEV... ; sudo lvcreate -L 200M -n LV VG
sudo lvextend -L +200M /dev/VG/LV ; sudo resize2fs /dev/VG/LV      # étendre / extend
sudo pvs ; sudo vgs ; sudo lvs
```

## resources

:::lang fr
- [FHS — Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html).
- [`man parted`](https://manpages.ubuntu.com/manpages/noble/man8/parted.8.html), [`man mkfs.ext4`](https://manpages.ubuntu.com/manpages/noble/man8/mkfs.ext4.8.html), [`man fstab`](https://manpages.ubuntu.com/manpages/noble/man5/fstab.5.html).
- [`man ln`](https://manpages.ubuntu.com/manpages/noble/man1/ln.1.html) (liens durs/symboliques) et `man blkid`.
- [LVM — guide](https://ubuntu.com/server/docs/manage-logical-volumes) (pvcreate/vgcreate/lvcreate/lvextend).
:::

:::lang en
- [FHS — Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/index.html).
- [`man parted`](https://manpages.ubuntu.com/manpages/noble/man8/parted.8.html), [`man mkfs.ext4`](https://manpages.ubuntu.com/manpages/noble/man8/mkfs.ext4.8.html), [`man fstab`](https://manpages.ubuntu.com/manpages/noble/man5/fstab.5.html).
- [`man ln`](https://manpages.ubuntu.com/manpages/noble/man1/ln.1.html) (hard/symbolic links) and `man blkid`.
- [LVM — guide](https://ubuntu.com/server/docs/manage-logical-volumes) (pvcreate/vgcreate/lvcreate/lvextend).
:::

## troubleshooting

:::lang fr
**`losetup: cannot find an unused loop device`.** Rare ; détache d'anciens loopbacks (`losetup -a` pour lister, `sudo losetup -D` pour tout détacher) ou vérifie que tu es dans une VM (pas un conteneur sans `/dev/loop*`).

**`${LOOP}p1` n'existe pas après le partitionnement.** Il manque le `-P` à `losetup` (scan des partitions) : `sudo losetup -d "$LOOP"` puis ré-attache avec `sudo losetup --show -fP ~/disk.img`. Ou force la relecture : `sudo partprobe "$LOOP"`.

**`mount -a` renvoie une erreur.** Ta ligne `fstab` est mauvaise (UUID erroné, type, options). Corrige-la **avant** tout redémarrage. `sudo findmnt --verify` aide à valider `fstab`.

**`vgremove`/`losetup -d` : « device is busy ».** Un montage tient le device. Démonte d'abord (`sudo umount /mnt/lv`), puis retire le VG/PV, puis détache le loopback.

**`resize2fs` : « nothing to do ».** Le système de fichiers occupe déjà tout le LV ; tu as sans doute oublié le `lvextend` **avant** (l'ordre est lvextend → resize2fs).

**Après reboot de la VM, `/mnt/data` n'est pas monté.** Normal : un disque **loopback** ne se recrée pas au démarrage (le `nofail` évite juste que ça bloque). Sur un **vrai** disque, la ligne `fstab` par UUID, elle, remonterait automatiquement.
:::

:::lang en
**`losetup: cannot find an unused loop device`.** Rare; detach old loopbacks (`losetup -a` to list, `sudo losetup -D` to detach all) or check you're in a VM (not a container without `/dev/loop*`).

**`${LOOP}p1` doesn't exist after partitioning.** `losetup` is missing `-P` (partition scan): `sudo losetup -d "$LOOP"` then re-attach with `sudo losetup --show -fP ~/disk.img`. Or force a re-read: `sudo partprobe "$LOOP"`.

**`mount -a` returns an error.** Your `fstab` line is wrong (bad UUID, type, options). Fix it **before** any reboot. `sudo findmnt --verify` helps validate `fstab`.

**`vgremove`/`losetup -d`: "device is busy".** A mount holds the device. Unmount first (`sudo umount /mnt/lv`), then remove the VG/PV, then detach the loopback.

**`resize2fs`: "nothing to do".** The filesystem already fills the whole LV; you probably forgot the `lvextend` **first** (the order is lvextend → resize2fs).

**After the VM reboots, `/mnt/data` isn't mounted.** Normal: a **loopback** disk isn't recreated at boot (the `nofail` just keeps it from blocking). On a **real** disk, the UUID `fstab` line would remount automatically.
:::
