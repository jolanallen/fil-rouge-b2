# Rapport Technique Final : Projet d'Infrastructure et de Développement Y-Plaza

---

**Collaborateurs :** Mir Mahan, Loan Mata, Allen Jolan  
**Formation :** Bachelor 2 Informatique - Ynov Campus  
**Année :** 2025/2026  
**Unité de Formation :** INFRA & DEV  

---

## 1. Introduction & Cadrage du Projet

### 1.1 Présentation de Y-Plaza (Brief Client)
Y-Plaza est un groupe immobilier implanté en France avec un siège social basé à Aix-en-Provence et un réseau de 12 agences réparties sur le territoire national. L’entreprise est spécialisée dans la vente et l’achat de biens immobiliers résidentiels et professionnels.

La société souhaite développer sa propre plateforme web centralisée permettant à la fois aux clients et aux agences de gérer facilement les opérations de vente et d’achat de biens immobiliers. Avec l’essor des technologies d’intelligence artificielle, la solution intègre des outils de traitement et d’analyse de données afin d’exploiter les tendances du marché immobilier et guider les décisions stratégiques d’achat et de vente.

### 1.2 Objectifs de la Mission
- **Développement** : Concevoir une solution web incluant du traitement et de l’analyse de données pour la gestion de l'achat et la vente.
- **Infrastructure** : Concevoir une architecture d’infrastructure réseau sécurisée et scalable reliant le siège et les 12 agences.
- **Sécurité** : Garantir l'intégrité, la confidentialité et la disponibilité des données critiques du groupe.

---

## 2. Architecture Globale & Réseau

### 2.1 Topologie Hub & Spoke
L'architecture réseau repose sur un modèle **Hub & Spoke**. Le siège social d'Aix-en-Provence (Hub) centralise les services serveurs, l'authentification et les bases de données. Les 12 agences (Spokes) se connectent au siège via des tunnels VPN IPsec chiffrés.

[Insérer l'image : Schema_architecture_complet.png ici]
![Schéma d'architecture complet](infra/ressources/images/Schema_architecture_complet.png)

### 2.2 Plan d'Adressage IP Global

#### Réseau du Siège : Aix-en-Provence (LAN : 192.168.10.0/24)
Le siège regroupe environ 30 postes clients et l'infrastructure serveur principale.

| Équipement / Rôle | Adresse IP Privée (LAN) | Adresse IP Publique (WAN) | Remarques |
| :--- | :--- | :--- | :--- |
| **Pare-feu OPNsense (Passerelle)** | 192.168.10.254 | 82.100.50.10 | Passerelle par défaut pour le LAN |
| **SRV-AIX-ADDS-01** | 192.168.10.2 | - | AD, DNS, DHCP, Serveur de fichiers |
| **SRV-AIX-WEB-01** | 192.168.10.3 | - | Hébergement web et Base de données |
| **Imprimante Siège** | 192.168.10.10 | - | IP Statique réservée |
| **Plage Clients DHCP** | 192.168.10.50 à .100 | - | Distribuée par l'AD |

#### Réseaux des 12 Agences (LAN : 192.168.20.0/24 à 192.168.31.0/24)
Chaque agence dispose de 5 postes commerciaux et d'une imprimante.

| Site | Réseau LAN | IP Pare-feu (LAN) | Adresse IP Publique (WAN) | Plage DHCP Clients |
| :--- | :--- | :--- | :--- | :--- |
| **Agence 01 - Montpellier** | 192.168.20.0/24 | 192.168.20.254 | 203.0.113.20 | 192.168.20.50 à .100 |
| **Agence 02 - Marseille** | 192.168.21.0/24 | 192.168.21.254 | 212.85.45.21 | 192.168.21.50 à .100 |
| **Agence 03 - Lyon** | 192.168.22.0/24 | 192.168.22.254 | 198.51.100.22 | 192.168.22.50 à .100 |
| **Agence 04 - Toulouse** | 192.168.23.0/24 | 192.168.23.254 | 80.12.34.23 | 192.168.23.50 à .100 |
| **Agence 05 - Nice** | 192.168.24.0/24 | 192.168.24.254 | 91.200.15.24 | 192.168.24.50 à .100 |
| **Agence 06 - Nantes** | 192.168.25.0/24 | 192.168.25.254 | 104.25.36.25 | 192.168.25.50 à .100 |
| **Agence 07 - Strasbourg** | 192.168.26.0/24 | 192.168.26.254 | 62.150.40.26 | 192.168.26.50 à .100 |
| **Agence 08 - Bordeaux** | 192.168.27.0/24 | 192.168.27.254 | 81.90.80.27 | 192.168.27.50 à .100 |
| **Agence 09 - Lille** | 192.168.28.0/24 | 192.168.28.254 | 89.100.11.28 | 192.168.28.50 à .100 |
| **Agence 10 - Rennes** | 192.168.29.0/24 | 192.168.29.254 | 92.140.55.29 | 192.168.29.50 à .100 |
| **Agence 11 - Paris** | 192.168.30.0/24 | 192.168.30.254 | 195.15.20.30 | 192.168.30.50 à .100 |
| **Agence 12 - Dijon** | 192.168.31.0/24 | 192.168.31.254 | 213.40.60.31 | 192.168.31.50 à .100 |

---

## 3. Infrastructure Système (Active Directory)

Le domaine Active Directory utilisé est **y-plaza.local**.

### 3.1 Principes de Gestion des Droits
- **Moindre privilège** : Chaque collaborateur dispose uniquement des autorisations strictement nécessaires.
- **Administration par groupes** : Les droits sont attribués à des groupes AD, jamais directement aux utilisateurs.

### 3.2 Structure Organisationnelle (OU)
L'arborescence AD est la suivante :
- `y-plaza.local`
    - `Users`
        - `Direction`
        - `Commercial`
        - `Communication-Marketing`
        - `Administratif-RH-Juridique`
        - `IT-Support`
    - `Groups` (Contient tous les groupes globaux `GG_`)
    - `Computers`
        - `AIX`
        - `MONTPELLIER` (etc.)
    - `Servers`
    - `Printers`

### 3.3 Groupes de Sécurité Globaux
| Groupe AD | Service associé |
| :--- | :--- |
| **GG_Direction** | Direction |
| **GG_Commercial** | Commercial |
| **GG_Comm_Marketing** | Communication & Marketing |
| **GG_Admin_RH_Juridique** | Administratif - RH - Juridique |
| **GG_IT_Support** | IT & Support |

### 3.4 Arborescence des Dossiers Partagés
Les dossiers sont hébergés sur `\\SRV-AIX-ADDS-01\Shares` :
- `Direction`
- `Commercial`
- `Communication-Marketing`
- `Administratif-RH-Juridique`
- `IT-Support`

### 3.5 Matrice des Permissions (NTFS)
| Dossier \ Groupe | GG_Direction | GG_Commercial | GG_Comm_Mkt | GG_Admin_RH_Jur | GG_IT_Support |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Direction** | **RW** | L | L | L | L |
| **Commercial** | NA | **RW** | L | NA | NA |
| **Communication** | NA | L | **RW** | NA | NA |
| **Administratif-RH** | NA | L | L | **RW** | NA |
| **Support Informatique** | NA | L | L | NA | **RW** |

- **RW (Lecture / Écriture)** : Accès complet (lire, créer, modifier, supprimer).
- **L (Lecture seule)** : Peut ouvrir et lire, mais pas modifier ni supprimer.
- **NA (Aucun accès)** : Dossier invisible et inaccessible.

### 3.6 Contrôle et Maintenance
- **Départ de l'entreprise** : Désactivation du compte + suppression de tous les groupes.
- **Changement de poste** : Retrait de l'ancien groupe + ajout au nouveau groupe.
- **Arrivée** : Création dans la bonne OU + ajout au groupe approprié.

---

## 4. Politique de Sécurité du Système d'Information (PSSI)

### 4.1 Sécurité Périmétrique et Réseau
- **Architecture Hub & Spoke sécurisée** : Tunnels VPN IPsec (protocole IKEv2 avec PSK). Aucun flux interne en clair sur Internet.
- **Filtrage strict** : Pare-feux OPNsense avec filtrage explicite. Utilisation d'Alias :
    - `Ports_AD` : Authentification et résolution DNS.
    - `Ports_Web` : Accès aux applications internes.
- **Blocage par défaut** : Rejet des paquets provenant d'adresses privées non sollicitées sur l'interface WAN.

### 4.2 Gestion des Identités et des Accès (IAM)
- **Stratégie de Mots de Passe (GPO)** : Complexité obligatoire, longueur minimale, validité maximale, historique.
- **Lutte contre le Bruteforce** : Verrouillage après 5 tentatives infructueuses (durée 15 min).
- **Sécurité des sessions** : Verrouillage automatique après 10 min d'inactivité.

### 4.3 Sécurité des Données
- **Cloisonnement des partages** : Utilisation du caractère `$` pour masquer les partages administratifs.
- **Matrice NTFS stricte** : Attribution exclusive via les groupes globaux.

### 4.4 Continuité et Sauvegarde
- **Plan de Continuité (BCP)** : Déploiement d'un contrôleur de domaine secondaire (`SRV-AIX-ADDS-02`).
- **Sauvegarde 3-2-1** : Copie locale via Veeam Backup et externalisation chiffrée sur le Cloud (Azure Blob ou AWS S3).
- **MCS (Maintien en Condition de Sécurité)** : Serveur WSUS pour la gestion centralisée des mises à jour Windows.

---

## 5. Architecture Applicative & Stack Technique (Partie DEV)

### 5.1 Vue d'ensemble du Système
Plateforme immobilière composée de trois services orchestrés par Docker Compose :
- **ImmoFrontend** : Vue.js 3 (Interface utilisateur).
- **ImmoBackend** : NestJS (API REST, Auth, Métier).
- **ImmoPredict** : FastAPI (Analyse DVF, ML).

#### Flux de données
1. **Recherche** : Frontend -> Backend -> MariaDB.
2. **Analyse** : Frontend -> Backend -> ImmoPredict (DVF) -> SSE -> Frontend.
3. **Estimation** : Frontend -> Backend -> Predict (Prix m²).

### 5.2 Justification des Choix Techniques (Stack)

#### Python / FastAPI (ImmoPredict)
- **Python** : Standard pour la data science (Pandas, scikit-learn).
- **FastAPI** : Performance (async/await), validation Pydantic, documentation automatique, SSE natif.

#### NestJS / Node.js (ImmoBackend)
- **Node.js** : Modèle événementiel adapté aux E/S et flux SSE.
- **NestJS** : Architecture modulaire, décorateurs, validation DTO, TypeORM intégré.

#### Vue.js 3 (ImmoFrontend)
- **Composition API** : Réutilisation via Composables.
- **Performance** : Virtual DOM optimisé, Vite pour le build.
- **Pinia** : Gestion d'état simplifiée pour l'Auth.

#### Stockage et Cache
- **MariaDB** : Fiabilité relationnelle (InnoDB, ACID).
- **Redis** : Cache ultra-rapide (< 1ms) pour les résultats d'analyse (TTL 1h).

---

## 6. Développement Backend (ImmoBackend)

### 6.1 Structure du Projet
- `src/core/` : Config (DB, Redis, OAuth, LDAP), Guards, Storage.
- `src/modules/` :
    - **Auth** : Login (Email/Google/LDAP), JWT (Access 15m / Refresh 7j).
    - **Property** : CRUD, Recherche (filtres prix, surface, CP, etc.), Images (CDN), Statuts (draft -> sold).
    - **Analysis** : Liaison avec ImmoPredict, streaming SSE.
    - **Contact** : Formulaires, SMTP, Rate limiting.

### 6.2 Base de données (Entités)
- `User`, `Credential` (multi-provider), `Property`, `PropertyImage`, `Agency`, `Favorites`.

---

## 7. Analyse & Prédiction (ImmoPredict)

### 7.1 Pipeline d'Analyse
1. **Téléchargement** : CSV DVF depuis Data.gouv.fr (id_mutation, valeur_fonciere, surface, etc.).
2. **Nettoyage (Pandas)** : Filtrage des valeurs aberrantes (centiles 1 et 99), conversion des types.
3. **Agrégation** : Prix au m² moyen/médian par ville et par année.
4. **Prédiction (scikit-learn)** : Régression linéaire pour calculer la tendance et la prédiction N+1.

### 7.2 Streaming SSE
Analyse asynchrone avec retour en temps réel :
- Événements : `data` (progression 0-100%), `complete` (résultats), `error`.

---

## 8. Développement Frontend (ImmoFrontend)

### 8.1 Patterns d'Architecture
- **Composables** : `useSellProcess`, `useAnalysis`, `usePropertyFilter`.
- **API Layer** : Client HTTP générique avec injection JWT et refresh transparent sur 401.
- **Mode Mock** : Simulation du backend pour le développement déconnecté.

### 8.2 Routage & Sécurité
- Navigation guards (`beforeEach`) vérifiant `meta.requiresAuth`.
- Gestion des images via utilitaire `cdnUrl()` résolvant les chemins relatifs.

---

## 9. Budget et Chiffrage Matériel

### 9.1 Investissement Siège Social (Aix-en-Provence)
| Désignation du matériel | Qté | Prix Unitaire HT | Total HT | Justification technique |
| :--- | :---: | :---: | :---: | :--- |
| **Serveur physique (ex: Dell PowerEdge)** | 2 | 3 500 € | 7 000 € | Serveurs hôtes pour la virtualisation (AD, Web, Fichiers). |
| **Pare-feu matériel (Appliance OPNsense)** | 1 | 1 200 € | 1 200 € | Routage, filtrage et terminaison des tunnels VPN IPsec. |
| **Commutateur (Switch) 48 ports PoE** | 1 | 1 500 € | 1 500 € | Connexion des 30 postes, serveurs et de l'imprimante. |
| **Onduleur (UPS) 3000VA** | 1 | 1 000 € | 1 000 € | Protection électrique et maintien de la baie serveur. |
| **Baie de brassage & Câblage** | 1 | 1 500 € | 1 500 € | Rangement sécurisé des serveurs et équipements réseaux. |
| **Poste de travail (PC Portable Pro)** | 30 | 850 € | 25 500 € | Postes pour les équipes sous Windows 11 Pro. |
| **Imprimante Multifonction Entreprise** | 1 | 2 500 € | 2 500 € | Copieur réseau partagé de grande capacité. |
| **TOTAL SIÈGE** | | | **40 200 €** | |

### 9.2 Réseau des 12 Agences
| Désignation du matériel | Qté | Prix Unitaire HT | Total HT | Justification technique |
| :--- | :---: | :---: | :---: | :--- |
| **Mini Pare-feu VPN (Appliance OPNsense)** | 12 | 400 € | 4 800 € | Établissement du tunnel IPsec site-à-site vers le siège. |
| **Commutateur (Switch) 8 ports PoE** | 12 | 150 € | 1 800 € | Brassage local des postes et de l'imprimante. |
| **Poste de travail (PC Portable Pro)** | 60 | 850 € | 51 000 € | 5 commerciaux par agence (60 postes total). |
| **Imprimante Multifonction Standard** | 12 | 500 € | 6 000 € | Imprimante réseau locale pour chaque agence. |
| **TOTAL AGENCES** | | | **63 600 €** | |

### 9.3 Licences et Logiciels
| Désignation | Qté | Prix Unitaire HT | Total HT | Justification technique |
| :--- | :---: | :---: | :---: | :--- |
| **Licence Windows Server 2022 Standard** | 2 | 1 000 € | 2 000 € | OS pour les deux serveurs principaux. |
| **Licences d'accès client (CAL) Utilisateur** | 90 | 45 € | 4 050 € | Obligatoire pour chaque utilisateur (90 total). |
| **TOTAL LICENCES** | | | **6 050 €** | |

### 9.4 Bilan Financier Global
- **Budget Total Estimé** : **109 850 € HT**
- **Coût d'équipement par collaborateur** : ~1 220 € HT.
- **Type d'investissement** : CAPEX sur 4 à 5 ans.

---

## 10. Conclusion

Le projet Y-Plaza répond aux exigences de transformation numérique d'un groupe immobilier d'envergure. L'infrastructure Hub & Spoke garantit une interconnexion sécurisée et centralisée, tandis que l'architecture applicative micro-services permet une agilité et une évolutivité maximale. L'intégration de l'IA via ImmoPredict offre un avantage concurrentiel majeur pour l'estimation et l'analyse de marché. Ce rapport valide la viabilité technique et financière de la solution pour un déploiement en production.
