# Audit d'écart : filière sécurité Azure vs examen SC-500

> Date : 2026-10-22 · Référence : [guide d'étude officiel SC-500](https://learn.microsoft.com/credentials/certifications/resources/study-guides/sc-500)
> Périmètre : les 6 guides de la filière `azure-az500` (id conservé) + les autres guides `azure-*` pour les recoupements.
> Méthode : chaque objectif du guide d'étude est associé à des mots-clés, cherchés dans le contenu (hors note de transition).
> **Limite** : une mention ne prouve pas une couverture suffisante. Un objectif « couvert » reste à relire ; un objectif « absent » est un manque certain.

## Synthèse par domaine

| Domaine SC-500 | Poids examen | Objectifs couverts | Verdict |
|---|---|---|---|
| D1 Identité, accès, gouvernance | 20–25 % | 9 / 13 | Solide, quelques compléments |
| D2 Stockage, bases de données, réseau | 25–30 % | 5 / 12 | Lacunes réelles sur le domaine le plus lourd |
| D3 Calcul (dont **sécurité de l'IA**) | 20–25 % | 4 / 11 | **Volet IA : 0 / 3**, calcul et conteneurs faibles |
| D4 Posture et supervision | 20–25 % | 2 / 6 | Defender et Sentinel présents, le reste absent |
| **Total** | | **20 / 42** | **Environ la moitié du programme SC-500** |

Conclusion : la filière couvre bien le socle hérité de l'ex-AZ-500 (identité, Key Vault, NSG, Private Link, Policy, Sentinel), mais **ne prépare pas au SC-500 tel quel**. Le bandeau de transition ajouté dans les 6 guides est donc nécessaire, pas cosmétique.

## Détail des manques (objectifs absents du contenu)

| Domaine | Objectif SC-500 absent | Où le traiter |
|---|---|---|
| D1 | Defender for Key Vault, scan de secrets par Defender CSPM | `azure-securite-identite` (enrichir) |
| D1 | Conformité réglementaire dans Defender for Cloud | `azure-securite-operations` (enrichir) |
| D1 | Rôles personnalisés, remédiation des accès sur-privilégiés | `azure-securite-identite` (enrichir) |
| D1 | Sécurité d'Azure Backup (immutabilité, suppression réversible) | `azure-securite-donnees` (enrichir) |
| D2 | Defender for Storage, Defender for Databases | `azure-securite-donnees` (enrichir) |
| D2 | Azure Virtual Network Manager, Virtual WAN, sécurité VPN | `azure-securite-reseau` (enrichir) |
| D2 | Microsoft Entra Private Access | `azure-securite-reseau` (enrichir) |
| D2 | Network Watcher (règles de sécurité effectives) | `azure-securite-reseau` (enrichir) |
| D3 IA | Entra Agent ID (accès conditionnel, rayon d'impact via Defender XDR) | **nouveau guide** `azure-securite-ia` |
| D3 IA | AI Gateway dans API Management pour Microsoft Foundry, garde-fous d'agents Foundry | **nouveau guide** `azure-securite-ia` |
| D3 IA | Defender for AI, tableau de bord Data and AI security, Purview DSPM pour l'IA | **nouveau guide** `azure-securite-ia` |
| D3 | Chiffrement de disque, Trusted Launch (secure boot, vTPM) | **nouveau guide** `azure-securite-calcul` |
| D3 | Defender for Containers, sécurité AKS et ACR | **nouveau guide** `azure-securite-calcul` |
| D3 | Sécurité App Service, Functions, Logic Apps, politiques APIM | **nouveau guide** `azure-securite-calcul` |
| D4 | Connecteurs multicloud AWS et GCP dans Defender for Cloud | `azure-securite-operations` (enrichir) |
| D4 | Defender EASM (surface d'attaque externe) | `azure-securite-operations` (enrichir) |
| D4 | Collecte Sentinel : syslog, CEF, règles de collecte (DCR), WEF | `azure-securite-operations` (enrichir) |
| D4 | Microsoft Security Copilot (espaces, rôles, plugins, agents) | `azure-securite-ia` ou `operations` |

## Point d'attention pédagogique

La méthode JIHA-Learn ancre tout **en local** (miniblue, sans compte cloud). Une grande partie du SC-500 repose sur des **produits managés sans émulateur** : Defender for Cloud et ses plans, Sentinel, Purview, Entra Agent ID, Security Copilot. Trois options, à trancher avant d'écrire :

| Option | Avantage | Inconvénient |
|---|---|---|
| A. Conceptuel + captures et KQL commentés | Reste gratuit et local | Moins « hands-on » que le reste du parcours |
| B. Lab sur abonnement d'essai Azure, avec budget et nettoyage guidés | Pratique réelle | Coût et risque de facture pour l'étudiant (CGU : responsabilité de l'étudiant) |
| C. Mixte : local quand c'est possible, B en option clairement balisée | Fidèle à la méthode, honnête | Deux chemins à maintenir |

Recommandation : **C**, en signalant explicitement dans chaque étape ce qui est simulé et ce qui est réel.

**Décision (2026-10-23) : option C retenue.** Chaque étape indique `local` ou `abonnement d'essai (optionnel)`. Une étape optionnelle commence par un avertissement de coût et se termine par le nettoyage des ressources.

## Plan proposé (par priorité)

1. **`azure-securite-ia`** (nouveau) : le seul domaine à 0 % et la raison d'être du SC-500. Prérequis : `azure-securite-identite`.
2. **`azure-securite-calcul`** (nouveau) : VM, conteneurs, App Service, APIM. Prérequis : `azure-securite-reseau`.
3. Enrichissements de `donnees`, `reseau`, `operations`, `identite` selon le tableau ci-dessus.
4. Mettre à jour `azure-projet-securite` pour intégrer un volet IA dans le livrable final.
5. Pour chaque nouveau guide : `guides.json` (id stable, `track: azure-az500`), quiz `jiha-formation/lib/quiz/data/<id>.json`, schéma dans `concepts`, `node build.mjs <id> --strict` et `pnpm check` verts.
6. Retirer le bandeau de transition quand les étapes 1 à 4 sont livrées.
