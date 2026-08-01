---
# — Identité (ne change JAMAIS une fois publié) —
id: capstone-homelab
slug: capstone-homelab
order: 14
status: published

# — Titres & accroches (bilingue) —
title_fr: "Capstone — ton homelab en ligne, de bout en bout"
title_en: "Capstone — your homelab online, end to end"
tagline_fr: "Provisionner, durcir, déployer, monitorer, sauvegarder, restaurer."
tagline_en: "Provision, harden, deploy, monitor, back up, restore."

# — Métadonnées pédagogiques —
level: advanced
duration_min: 600
last_review: "2026-07-31"

# — Relations de parcours (par id) —
prerequisites: [ansible-fondamentaux, traefik, monitoring]
next: []

# — Concepts travaillés (pour cartes & SEO) —
concepts_fr: [provisioning-vps, durcissement-ssh-ufw, dns-domaine, https-public, deploiement-stack, sauvegardes, drill-restauration]
concepts_en: [vps-provisioning, ssh-ufw-hardening, dns-domain, public-https, stack-deployment, backups, restore-drill]

# — Accès (freemium) —
access: free

# — Partage social (Open Graph) —
og_description_fr: "Le projet fil-rouge : provisionne un VPS, durcis-le, expose ta stack self-hostée en HTTPS public, ajoute monitoring et sauvegardes, et prouve ta restauration par un drill chronométré. Un livrable de portfolio DevOps junior."
og_description_en: "The capstone project: provision a VPS, harden it, expose your self-hosted stack over public HTTPS, add monitoring and backups, and prove your restore with a timed drill. A junior DevOps portfolio deliverable."
---

## intro

:::lang fr
Voici le moment où tout se rejoint. Jusqu'ici, chaque module vivait **sur ta machine**, en local. Ce projet fil-rouge change la donne : tu vas **mettre un vrai service en ligne**, sur un **vrai serveur**, accessible sur Internet en HTTPS — et surtout, tu vas **prouver** que tu sais l'exploiter : le sauvegarder, le restaurer, le surveiller.

C'est le **seul module qui demande un serveur** : un petit VPS coûte 3 à 5 € par mois, et c'est le meilleur investissement de ta reconversion — parce qu'à la fin, tu n'auras pas « suivi un tuto », tu auras **un livrable montrable à un recruteur** : une infrastructure que tu as provisionnée, durcie, déployée et documentée toi-même.

Ce n'est pas un tuto pas-à-pas : c'est un **cahier des charges**. Chaque phase te dit *quoi* accomplir et *comment le prouver*, en réutilisant les compétences des modules précédents. Les commandes exactes, tu les connais déjà — ici, tu **assembles**.

**Pour qui c'est :** tu as terminé le parcours (Linux, Docker, Compose, reverse proxy, Ansible, monitoring) et tu veux le transformer en projet concret.

**Quand ce n'est PAS le bon choix :**

- Il te manque encore des bases (durcissement SSH, Compose, Traefik/monitoring) → reviens les consolider, ce projet les suppose acquises.
- Tu ne veux (ou ne peux) pas louer un VPS : tu peux faire une **version dégradée en local** (VM + certificats locaux), mais tu perdras l'expérience « vraie prod » (DNS, HTTPS public, exposition) qui fait la valeur du livrable.
:::

:::lang en
Here's where everything comes together. So far, each module lived **on your machine**, locally. This capstone changes the game: you're going to **put a real service online**, on a **real server**, reachable over the Internet in HTTPS — and above all, you're going to **prove** you can operate it: back it up, restore it, monitor it.

It's the **only module that requires a server**: a small VPS costs €3–5 a month, and it's the best investment of your career switch — because in the end, you won't have "followed a tutorial", you'll have **a deliverable to show a recruiter**: an infrastructure you provisioned, hardened, deployed and documented yourself.

This isn't a step-by-step tutorial: it's a **project brief**. Each phase tells you *what* to accomplish and *how to prove it*, reusing the skills from previous modules. The exact commands, you already know them — here, you **assemble**.

**Who it's for:** you've finished the track (Linux, Docker, Compose, reverse proxy, Ansible, monitoring) and you want to turn it into a concrete project.

**When it's NOT the right choice:**

- You're still missing foundations (SSH hardening, Compose, Traefik/monitoring) → go consolidate them, this project assumes them.
- You don't want to (or can't) rent a VPS: you can do a **degraded local version** (VM + local certs), but you'll lose the "real prod" experience (DNS, public HTTPS, exposure) that gives the deliverable its value.
:::

## objectives

:::lang fr
Ce projet valide, en conditions réelles, que tu sais :

- **Provisionner** un serveur et le **durcir** (SSH par clé, pare-feu, fail2ban).
- Configurer un **domaine** et son **DNS**.
- Exposer des services en **HTTPS public** derrière un reverse proxy.
- **Déployer** une stack multi-services, idéalement **automatisée** (Ansible).
- Mettre en place **monitoring** et **alertes**.
- Sauvegarder, et **prouver la restauration** par un drill chronométré.
- **Documenter** l'ensemble comme un professionnel.
:::

:::lang en
This project validates, in real conditions, that you can:

- **Provision** a server and **harden** it (SSH keys, firewall, fail2ban).
- Configure a **domain** and its **DNS**.
- Expose services over **public HTTPS** behind a reverse proxy.
- **Deploy** a multi-service stack, ideally **automated** (Ansible).
- Set up **monitoring** and **alerts**.
- Back up, and **prove restoration** with a timed drill.
- **Document** the whole thing like a professional.
:::

## prerequisites

:::lang fr
Avant de commencer :

- **Tout le parcours** : Linux, Docker & Compose, reverse proxy & HTTPS, Ansible, monitoring. Ce projet les mobilise tous.
- Un **VPS** chez un hébergeur (Hetzner, Scaleway, OVH, DigitalOcean… ~3-5 €/mois), en **Ubuntu 24.04 LTS**.
- Un **nom de domaine** (ou un sous-domaine délégué). Certains registrars proposent des `.eu`/`.xyz` à quelques euros/an.
- Ta **clé SSH** (générée au module Ansible) et de quoi éditer du YAML.

⚠️ **Sécurité & budget :** un serveur exposé sur Internet est **scanné en permanence**. Le durcissement (phase 2) n'est pas optionnel. Et pense à **détruire le VPS** à la fin si tu ne le gardes pas, pour ne pas payer dans le vide.
:::

:::lang en
Before you start:

- **The whole track**: Linux, Docker & Compose, reverse proxy & HTTPS, Ansible, monitoring. This project draws on all of it.
- A **VPS** at a provider (Hetzner, Scaleway, OVH, DigitalOcean… ~€3–5/month), on **Ubuntu 24.04 LTS**.
- A **domain name** (or a delegated subdomain). Some registrars offer `.eu`/`.xyz` for a few euros/year.
- Your **SSH key** (generated in the Ansible module) and something to edit YAML.

⚠️ **Security & budget:** a server exposed on the Internet is **scanned constantly**. Hardening (phase 2) is not optional. And remember to **destroy the VPS** at the end if you're not keeping it, to avoid paying for nothing.
:::

## concepts

:::lang fr
L'architecture cible, en une image mentale : **Internet → DNS → ton VPS → reverse proxy (HTTPS) → tes services conteneurisés**, le tout **surveillé** et **sauvegardé**.

- Le **DNS** traduit ton domaine en l'IP publique du VPS (enregistrement `A`).
- Le **reverse proxy** (Traefik, Caddy ou Nginx Proxy Manager) reçoit tout le trafic sur 80/443, obtient un **certificat Let's Encrypt** automatiquement, et route chaque sous-domaine vers le bon service.
- Tes **services** tournent en conteneurs (Compose), isolés, avec leurs volumes de données.
- Le **monitoring** (Prometheus + Grafana) observe l'état ; les **sauvegardes** protègent les données ; le **drill de restauration** prouve que ces sauvegardes *fonctionnent vraiment*.

La règle d'or de ce projet : **une sauvegarde non testée n'est pas une sauvegarde.** Le cœur du livrable, ce n'est pas de déployer — c'est de **détruire et restaurer** avec succès.
:::

:::lang en
The target architecture, as a mental picture: **Internet → DNS → your VPS → reverse proxy (HTTPS) → your containerized services**, all of it **monitored** and **backed up**.

- **DNS** translates your domain into the VPS's public IP (an `A` record).
- The **reverse proxy** (Traefik, Caddy or Nginx Proxy Manager) receives all traffic on 80/443, automatically obtains a **Let's Encrypt certificate**, and routes each subdomain to the right service.
- Your **services** run in containers (Compose), isolated, with their data volumes.
- **Monitoring** (Prometheus + Grafana) watches the state; **backups** protect the data; the **restore drill** proves those backups *actually work*.

The golden rule of this project: **an untested backup is not a backup.** The core of the deliverable isn't deploying — it's **destroying and restoring** successfully.
:::

:::figure homelab-architecture
caption_fr: "Schéma 1. Internet → DNS → VPS → reverse proxy HTTPS → services conteneurisés, monitorés et sauvegardés."
caption_en: "Figure 1. Internet → DNS → VPS → HTTPS reverse proxy → containerized services, monitored and backed up."
:::

:::lang fr
Le projet se déroule en 7 phases. Chacune a un **livrable** vérifiable. Avance dans l'ordre : chaque phase suppose la précédente réussie.
:::

:::lang en
The project unfolds in 7 phases. Each has a verifiable **deliverable**. Go in order: each phase assumes the previous one succeeded.
:::

## walkthrough

### step-01

:::lang fr
**Phase 1 — Provisionner le serveur.**

**Objectif.** Obtenir un Ubuntu 24.04 accessible en SSH.

**🤔 Pourquoi Ubuntu LTS ?** Support long (5 ans), énorme communauté, la distribution la plus documentée pour le self-hosting. Choisis le plus petit format (1-2 vCPU, 2-4 Go RAM suffisent pour ce projet).

**Marche à suivre :** crée le VPS chez ton hébergeur, en **ajoutant ta clé SSH publique** dès la création (évite la connexion par mot de passe). Note l'**IP publique**. Connecte-toi : `ssh root@<IP>`.

**📦 Livrable :** une capture de `ssh root@<IP>` réussie + `lsb_release -a` montrant Ubuntu 24.04.
:::

:::lang en
**Phase 1 — Provision the server.**

**Goal.** Get an Ubuntu 24.04 reachable over SSH.

**🤔 Why Ubuntu LTS?** Long support (5 years), huge community, the most documented distro for self-hosting. Pick the smallest size (1-2 vCPU, 2-4 GB RAM is plenty for this project).

**Steps:** create the VPS at your provider, **adding your public SSH key** at creation time (avoid password login). Note the **public IP**. Connect: `ssh root@<IP>`.

**📦 Deliverable:** a screenshot of a successful `ssh root@<IP>` + `lsb_release -a` showing Ubuntu 24.04.
:::

### step-02

:::lang fr
**Phase 2 — Durcir le serveur.** *(non négociable)*

**Objectif.** Réduire drastiquement la surface d'attaque.

**🤔 Pourquoi maintenant ?** Ton IP est déjà scannée. Chaque heure sans durcissement est un risque. On applique le socle Linux du parcours, version « exposé à Internet ».

**À accomplir :**

- Crée un **utilisateur non-root** avec `sudo` ; copie-lui ta clé SSH (`ssh-copy-id` ou manuellement).
- **Désactive** la connexion SSH par mot de passe **et** le login `root` (`/etc/ssh/sshd_config` : `PasswordAuthentication no`, `PermitRootLogin no`), puis `systemctl restart ssh`.
- Active le **pare-feu** : `ufw allow OpenSSH`, `ufw allow 80,443/tcp`, `ufw enable`.
- Installe **fail2ban** (bannit les IP qui brute-forcent SSH).
- Active les **mises à jour de sécurité automatiques** (`unattended-upgrades`).

**📦 Livrable :** `ssh root@<IP>` **échoue** désormais, `ssh <toi>@<IP>` marche par clé ; `sudo ufw status` montre les règles ; `fail2ban-client status sshd` tourne.
:::

:::lang en
**Phase 2 — Harden the server.** *(non-negotiable)*

**Goal.** Drastically reduce the attack surface.

**🤔 Why now?** Your IP is already being scanned. Every hour without hardening is a risk. We apply the track's Linux foundation, "exposed to the Internet" edition.

**To accomplish:**

- Create a **non-root user** with `sudo`; copy your SSH key to it (`ssh-copy-id` or manually).
- **Disable** SSH password login **and** `root` login (`/etc/ssh/sshd_config`: `PasswordAuthentication no`, `PermitRootLogin no`), then `systemctl restart ssh`.
- Enable the **firewall**: `ufw allow OpenSSH`, `ufw allow 80,443/tcp`, `ufw enable`.
- Install **fail2ban** (bans IPs that brute-force SSH).
- Enable **automatic security updates** (`unattended-upgrades`).

**📦 Deliverable:** `ssh root@<IP>` now **fails**, `ssh <you>@<IP>` works via key; `sudo ufw status` shows the rules; `fail2ban-client status sshd` runs.
:::

### step-03

:::lang fr
**Phase 3 — Domaine & DNS.**

**Objectif.** Pointer ton domaine vers le VPS.

**🤔 Pourquoi le DNS d'abord ?** Le reverse proxy a besoin d'un nom de domaine résolvant vers ton IP **avant** de pouvoir obtenir un certificat HTTPS (Let's Encrypt vérifie que tu contrôles le domaine).

**À accomplir :** chez ton registrar/DNS, crée un enregistrement **`A`** `homelab.tondomaine.xyz` → **IP publique du VPS**. Ajoute aussi les sous-domaines de tes services (ex. `vault.`, `grafana.`) en `A` vers la même IP (ou un `CNAME` vers l'apex). Attends la propagation.

**📦 Livrable :** `dig +short homelab.tondomaine.xyz` renvoie l'IP de ton VPS depuis ta machine.
:::

:::lang en
**Phase 3 — Domain & DNS.**

**Goal.** Point your domain at the VPS.

**🤔 Why DNS first?** The reverse proxy needs a domain name resolving to your IP **before** it can obtain an HTTPS certificate (Let's Encrypt verifies you control the domain).

**To accomplish:** at your registrar/DNS, create an **`A`** record `homelab.yourdomain.xyz` → **the VPS public IP**. Also add your services' subdomains (e.g. `vault.`, `grafana.`) as `A` to the same IP (or a `CNAME` to the apex). Wait for propagation.

**📦 Deliverable:** `dig +short homelab.yourdomain.xyz` returns your VPS's IP from your machine.
:::

### step-04

:::lang fr
**Phase 4 — Reverse proxy & HTTPS public.**

**Objectif.** Servir un premier service en `https://` avec un vrai certificat.

**🤔 Ce qui change vs le local :** cette fois, Let's Encrypt délivre un **certificat public valide** (plus de `mkcert`, plus d'avertissement navigateur), parce que ton domaine résout vraiment vers le serveur. C'est la récompense des phases 2-3.

**À accomplir :** installe Docker + Compose sur le VPS, déploie ton reverse proxy (Traefik, Caddy ou Nginx Proxy Manager) avec le **challenge Let's Encrypt HTTP** (ports 80/443 ouverts), et branche un premier service de test (ex. `whoami` ou une page statique) sur `homelab.tondomaine.xyz`.

**📦 Livrable :** `https://homelab.tondomaine.xyz` s'ouvre avec un **cadenas valide** (certificat Let's Encrypt) et affiche ton service.
:::

:::lang en
**Phase 4 — Reverse proxy & public HTTPS.**

**Goal.** Serve a first service over `https://` with a real certificate.

**🤔 What changes vs local:** this time, Let's Encrypt issues a **valid public certificate** (no more `mkcert`, no more browser warning), because your domain truly resolves to the server. It's the reward for phases 2-3.

**To accomplish:** install Docker + Compose on the VPS, deploy your reverse proxy (Traefik, Caddy or Nginx Proxy Manager) with the **Let's Encrypt HTTP challenge** (ports 80/443 open), and wire a first test service (e.g. `whoami` or a static page) on `homelab.yourdomain.xyz`.

**📦 Deliverable:** `https://homelab.yourdomain.xyz` opens with a **valid padlock** (Let's Encrypt certificate) and shows your service.
:::

### step-05

:::lang fr
**Phase 5 — Déployer la stack (idéalement automatisée).**

**Objectif.** Faire tourner 2 services réels avec données persistantes.

**🤔 Pourquoi automatiser ?** Tu *peux* tout faire à la main en SSH. Mais le vrai réflexe DevOps — et ce qui impressionne un recruteur — c'est un **playbook Ansible** qui rejoue **tout** depuis ta machine : « je détruis le VPS, j'en recrée un, je relance le playbook, et 10 minutes plus tard tout est de nouveau debout ». C'est la reproductibilité.

**À accomplir :** déploie **deux services** de ton choix derrière le proxy (ex. **Vaultwarden** + **Immich**, ou une app web + sa base), chacun sur son sous-domaine, avec **volumes** pour les données. Bonus fort : décris tout le déploiement en **Ansible** (inventaire = ton VPS).

**📦 Livrable :** deux services accessibles en HTTPS sur leurs sous-domaines, avec données qui **survivent** à un redémarrage. Bonus : le playbook Ansible qui les déploie.
:::

:::lang en
**Phase 5 — Deploy the stack (ideally automated).**

**Goal.** Run 2 real services with persistent data.

**🤔 Why automate?** You *can* do it all by hand over SSH. But the real DevOps reflex — and what impresses a recruiter — is an **Ansible playbook** that replays **everything** from your machine: "I destroy the VPS, recreate one, re-run the playbook, and 10 minutes later everything is back up". That's reproducibility.

**To accomplish:** deploy **two services** of your choice behind the proxy (e.g. **Vaultwarden** + **Immich**, or a web app + its database), each on its subdomain, with **volumes** for the data. Strong bonus: describe the whole deployment in **Ansible** (inventory = your VPS).

**📦 Deliverable:** two services reachable over HTTPS on their subdomains, with data that **survives** a restart. Bonus: the Ansible playbook that deploys them.
:::

### step-06

:::lang fr
**Phase 6 — Monitoring & alertes.**

**Objectif.** Savoir, sans te connecter, si quelque chose ne va pas.

**🤔 Pourquoi ?** Un service en prod sans supervision, c'est piloter les yeux fermés. Tu réutilises le module monitoring, version distante.

**À accomplir :** déploie **Prometheus + Grafana** (derrière le proxy, sur `grafana.tondomaine.xyz`, protégé par mot de passe), avec au moins un **node exporter** (métriques CPU/RAM/disque du VPS) et une **règle d'alerte** utile (ex. disque > 85 %, ou service down).

**📦 Livrable :** un dashboard Grafana montrant les métriques du VPS, et une alerte configurée que tu peux déclencher volontairement.
:::

:::lang en
**Phase 6 — Monitoring & alerts.**

**Goal.** Know, without logging in, whether something's wrong.

**🤔 Why?** A service in prod with no supervision is flying blind. You reuse the monitoring module, remote edition.

**To accomplish:** deploy **Prometheus + Grafana** (behind the proxy, on `grafana.yourdomain.xyz`, password-protected), with at least a **node exporter** (VPS CPU/RAM/disk metrics) and a useful **alert rule** (e.g. disk > 85 %, or service down).

**📦 Deliverable:** a Grafana dashboard showing the VPS metrics, and a configured alert you can trigger on purpose.
:::

### step-07

:::lang fr
**Phase 7 — Sauvegardes & drill de restauration.** *(le cœur du projet)*

**Objectif.** Prouver que tu peux tout perdre… et tout retrouver.

**🤔 Pourquoi c'est LA phase qui compte ?** N'importe qui peut déployer. Ce qui sépare un amateur d'un pro, c'est la **capacité à restaurer**. Une sauvegarde jamais testée échoue le jour où tu en as besoin. Ici, on la teste **pour de vrai**.

**À accomplir :**

1. Mets en place une **sauvegarde automatisée** (cron) des volumes de données et des configs, idéalement vers un stockage **hors du VPS** (S3/Backblaze, ou ta machine via `rsync`).
2. Fais le **drill, chronomètre en main** : détruis délibérément un service (supprime son conteneur **et son volume**), puis restaure-le depuis la dernière sauvegarde. Mesure le temps.
3. Vérifie que les **données d'avant sont bien là** (une entrée que tu avais créée).

**📦 Livrable :** un compte-rendu du drill : ce que tu as détruit, la procédure de restauration, le **temps de restauration (RTO)**, et la preuve que les données sont revenues.
:::

:::lang en
**Phase 7 — Backups & restore drill.** *(the heart of the project)*

**Goal.** Prove you can lose everything… and get it all back.

**🤔 Why is this THE phase that matters?** Anyone can deploy. What separates an amateur from a pro is the **ability to restore**. A backup never tested fails the day you need it. Here, we test it **for real**.

**To accomplish:**

1. Set up an **automated backup** (cron) of the data volumes and configs, ideally to storage **off the VPS** (S3/Backblaze, or your machine via `rsync`).
2. Do the **drill, stopwatch in hand**: deliberately destroy a service (remove its container **and its volume**), then restore it from the last backup. Measure the time.
3. Verify the **prior data is really there** (an entry you had created).

**📦 Deliverable:** a drill report: what you destroyed, the restore procedure, the **restore time (RTO)**, and proof the data came back.
:::

## pitfalls

:::lang fr
**1. Sauter le durcissement « pour aller vite ».** Un VPS root/mot-de-passe exposé est compromis en heures, pas en jours. La phase 2 avant tout le reste.

**2. Ouvrir tous les ports « au cas où ».** N'ouvre que 22 (SSH), 80 et 443. Tout le reste passe par le reverse proxy. `ufw` par défaut : tout fermé sauf l'explicite.

**3. Croire qu'une sauvegarde qui « tourne » suffit.** Tant que tu n'as pas **restauré**, tu ne sais pas si elle marche. Le drill n'est pas optionnel : c'est le livrable central.

**4. Stocker les sauvegardes sur le VPS lui-même.** Si le serveur meurt (ou est compromis), tu perds les données **et** leurs sauvegardes. Externalise-les.

**5. Secrets en clair dans les fichiers ou l'historique Git.** Mots de passe, tokens : variables d'environnement, `.env` hors Git, ou Ansible Vault. Jamais commités.

**6. Oublier de documenter.** Sans README, ton projet n'est pas reproductible — et pas montrable. La doc fait partie du livrable, pas un extra.

**7. Laisser tourner (et payer) le VPS après coup.** Si tu ne le gardes pas, détruis-le proprement une fois le drill validé et documenté.
:::

:::lang en
**1. Skipping hardening "to go faster".** A root/password VPS exposed is compromised in hours, not days. Phase 2 before anything else.

**2. Opening all ports "just in case".** Only open 22 (SSH), 80 and 443. Everything else goes through the reverse proxy. `ufw` default: everything closed except the explicit.

**3. Thinking a backup that "runs" is enough.** Until you've **restored**, you don't know it works. The drill isn't optional: it's the central deliverable.

**4. Storing backups on the VPS itself.** If the server dies (or is compromised), you lose the data **and** its backups. Externalize them.

**5. Clear-text secrets in files or Git history.** Passwords, tokens: environment variables, `.env` out of Git, or Ansible Vault. Never committed.

**6. Forgetting to document.** Without a README, your project isn't reproducible — and not showable. Docs are part of the deliverable, not an extra.

**7. Leaving the VPS running (and billing) afterward.** If you're not keeping it, destroy it cleanly once the drill is validated and documented.
:::

## success

:::lang fr
Le projet est réussi — et **présentable** — quand :

- [ ] Le serveur est **durci** (clé SSH seule, root désactivé, `ufw`, fail2ban).
- [ ] Deux services tournent en **HTTPS public** (cadenas valide) sur leurs sous-domaines.
- [ ] Le déploiement est **reproductible** (idéalement un playbook Ansible rejouable).
- [ ] Le **monitoring** est en place avec au moins une alerte.
- [ ] Les **sauvegardes** sont automatisées et **externalisées**.
- [ ] Le **drill de restauration** est réussi et **chronométré**, données récupérées.
- [ ] Un **README** documente l'architecture, le déploiement et la procédure de restauration.

**Évaluation (soutenance) :** présente ton architecture, montre les services en ligne, et **fais la démonstration du drill** — c'est lui qui prouve la compétence. Ce dépôt (README + playbooks + captures) devient une **pièce maîtresse de ton portfolio** DevOps.
:::

:::lang en
The project is a success — and **presentable** — when:

- [ ] The server is **hardened** (SSH key only, root disabled, `ufw`, fail2ban).
- [ ] Two services run over **public HTTPS** (valid padlock) on their subdomains.
- [ ] The deployment is **reproducible** (ideally a replayable Ansible playbook).
- [ ] **Monitoring** is in place with at least one alert.
- [ ] **Backups** are automated and **externalized**.
- [ ] The **restore drill** is successful and **timed**, data recovered.
- [ ] A **README** documents the architecture, deployment and restore procedure.

**Evaluation (defense):** present your architecture, show the services online, and **demonstrate the drill** — that's what proves the skill. This repo (README + playbooks + screenshots) becomes a **centerpiece of your DevOps portfolio**.
:::

## next

:::lang fr
Bravo — tu as bouclé le parcours et tu as un vrai projet à montrer. Pour aller plus loin :

- **Passe les certifications** que le parcours a préparées (LPIC-1, Docker, Terraform Associate, CKA/CKAD, RHCE) : ton homelab est ton terrain d'entraînement.
- **Automatise le provisioning** avec Terraform (créer le VPS) en amont d'Ansible (le configurer) : la combinaison complète.
- **Ajoute un pipeline CI/CD** qui redéploie automatiquement à chaque push (le module GitHub Actions, branché sur ton serveur).
- **Étoffe le homelab** : réseau (VLAN, VPN WireGuard), stockage, plus de services — au gré de tes besoins réels.
:::

:::lang en
Congrats — you've completed the track and you have a real project to show. To go further:

- **Take the certifications** the track prepared you for (LPIC-1, Docker, Terraform Associate, CKA/CKAD, RHCE): your homelab is your training ground.
- **Automate provisioning** with Terraform (create the VPS) upstream of Ansible (configure it): the full combo.
- **Add a CI/CD pipeline** that redeploys automatically on every push (the GitHub Actions module, wired to your server).
- **Grow the homelab**: networking (VLAN, WireGuard VPN), storage, more services — as your real needs dictate.
:::

## resources

:::lang fr
- [Let's Encrypt](https://letsencrypt.org/fr/docs/) — certificats HTTPS gratuits et automatisés.
- [ufw — pare-feu Ubuntu](https://help.ubuntu.com/community/UFW) — règles simples.
- [fail2ban](https://github.com/fail2ban/fail2ban) — bannissement des IP malveillantes.
- [restic](https://restic.net) / [Backblaze B2](https://www.backblaze.com/cloud-storage) — sauvegardes chiffrées, externalisées.
- [Awesome-Selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) — des idées de services à héberger.
:::

:::lang en
- [Let's Encrypt](https://letsencrypt.org/docs/) — free, automated HTTPS certificates.
- [ufw — Ubuntu firewall](https://help.ubuntu.com/community/UFW) — simple rules.
- [fail2ban](https://github.com/fail2ban/fail2ban) — banning malicious IPs.
- [restic](https://restic.net) / [Backblaze B2](https://www.backblaze.com/cloud-storage) — encrypted, externalized backups.
- [Awesome-Selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) — ideas for services to host.
:::

## troubleshooting

:::lang fr
**Je me suis verrouillé dehors en SSH.** Utilise la **console web** de ton hébergeur (accès hors SSH) pour corriger `sshd_config` ou `ufw`. Toujours garder une session SSH ouverte **avant** de tester une modif SSH.

**Let's Encrypt refuse le certificat.** Le DNS ne résout pas encore (attends la propagation, `dig`), ou le port 80 n'est pas joignable (`ufw`, ou un autre service occupe le port). Vérifie les logs du reverse proxy.

**Un service répond en HTTP mais pas en HTTPS.** Le routage du proxy ou le sous-domaine DNS manque. Vérifie que le sous-domaine résout et que le proxy a une route pour lui.

**Après restauration, le service démarre mais « vide ».** Tu as probablement restauré la config mais pas le **volume de données** (ou l'inverse). Le drill sert justement à découvrir ça **en exercice**, pas en vrai incident.

**fail2ban m'a banni ma propre IP.** `sudo fail2ban-client set sshd unbanip <ton-IP>`. Ajoute ton IP fixe à la liste blanche si besoin.
:::

:::lang en
**I locked myself out of SSH.** Use your provider's **web console** (out-of-band access) to fix `sshd_config` or `ufw`. Always keep an SSH session open **before** testing an SSH change.

**Let's Encrypt refuses the certificate.** DNS doesn't resolve yet (wait for propagation, `dig`), or port 80 isn't reachable (`ufw`, or another service occupies the port). Check the reverse proxy logs.

**A service answers over HTTP but not HTTPS.** The proxy routing or the DNS subdomain is missing. Check the subdomain resolves and the proxy has a route for it.

**After restore, the service starts but "empty".** You probably restored the config but not the **data volume** (or vice versa). The drill exists precisely to discover this **in practice**, not in a real incident.

**fail2ban banned my own IP.** `sudo fail2ban-client set sshd unbanip <your-IP>`. Add your static IP to the whitelist if needed.
:::
