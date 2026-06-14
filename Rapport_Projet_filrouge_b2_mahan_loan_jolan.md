# Rapport Technique Final : Projet d'Infrastructure et de Développement Y-Plaza

---

**Collaborateurs :** Mir Mahan, Loan Mata, Allen Jolan  
**Formation :** Bachelor 2 Informatique - Ynov Campus  
**Année :** 2025/2026  
**Unité de Formation :** INFRA & DEV  

---

## 1. Introduction & Présentation du Projet

### 1.1 Contexte Professionnel
Y-Plaza est un groupe immobilier majeur implanté en France, spécialisé dans la vente et l'achat de biens immobiliers résidentiels et professionnels. Le groupe s'articule autour d'un siège social basé à Aix-en-Provence et d'un réseau de 12 agences réparties sur le territoire national.

### 1.2 Objectifs Techniques
La mission consiste à concevoir et documenter une infrastructure réseau sécurisée et évolutive reliant tous les sites. Les piliers du projet sont :
- **Centralisation** : Gestion unifiée des identités et des ressources via Active Directory.
- **Sécurité** : Interconnexion par tunnels chiffrés et politique de filtrage stricte.
- **Performance** : Support d'une plateforme web interne intégrant de l'intelligence artificielle pour l'analyse de données immobilières.
- **Continuité** : Stratégies de sauvegarde et de haute disponibilité.

---

## 2. Architecture Globale & Réseau

### 2.1 Topologie Hub & Spoke
Le groupe Y-Plaza utilise une topologie en étoile (Hub & Spoke). Le **Hub (Siège d'Aix-en-Provence)** concentre l'intelligence réseau et les services serveurs, tandis que les **Spokes (Agences)** consomment ces services via des liens sécurisés.

[Insérer l'image : Schema_architecture_complet.png ici]
![Schéma d'architecture complet](infra/ressources/images/Schema_architecture_complet.png)

### 2.2 Plan d'Adressage IP Détaillé
L'adressage IP a été conçu pour éviter tout conflit (overlap) lors de l'établissement des tunnels VPN et pour permettre une extension future facile.

#### A. Réseau du Siège : Aix-en-Provence (LAN : 192.168.10.0/24)
Le siège regroupe environ 30 postes clients et l'infrastructure serveur critique.

| Équipement / Rôle | Adresse IP Privée (LAN) | Adresse IP Publique (WAN) | Remarques |
| :--- | :--- | :--- | :--- |
| **Pare-feu OPNsense** | 192.168.10.254 | 82.100.50.10 | Passerelle par défaut |
| **SRV-AIX-ADDS-01** | 192.168.10.2 | - | AD, DNS, DHCP, Fichiers |
| **SRV-AIX-LIN-02** | 192.168.10.3 | - | Hébergement web et Base de données |
| **Imprimante Siège** | 192.168.10.10 | - | IP Statique réservée |
| **Plage Clients DHCP** | 192.168.10.50 à .100 | - | Distribuée par l'AD |

#### B. Réseaux des 12 Agences (LAN : 192.168.20.0/24 à 192.168.31.0/24)
Chaque agence dispose de 5 postes commerciaux et d'une imprimante locale.

| Site | Réseau LAN | IP Pare-feu (LAN) | IP Publique (WAN) | Plage DHCP Clients |
| :--- | :--- | :--- | :--- | :--- |
| **Ag. 01 - Montpellier** | 192.168.20.0/24 | 192.168.20.254 | 203.0.113.20 | .50 à .100 |
| **Ag. 02 - Marseille** | 192.168.21.0/24 | 192.168.21.254 | 212.85.45.21 | .50 à .100 |
| **Ag. 03 - Lyon** | 192.168.22.0/24 | 192.168.22.254 | 198.51.100.22 | .50 à .100 |
| **Ag. 04 - Toulouse** | 192.168.23.0/24 | 192.168.23.254 | 80.12.34.23 | .50 à .100 |
| **Ag. 05 - Nice** | 192.168.24.0/24 | 192.168.24.254 | 91.200.15.24 | .50 à .100 |
| **Ag. 06 - Nantes** | 192.168.25.0/24 | 192.168.25.254 | 104.25.36.25 | .50 à .100 |
| **Ag. 07 - Strasbourg** | 192.168.26.0/24 | 192.168.26.254 | 62.150.40.26 | .50 à .100 |
| **Ag. 08 - Bordeaux** | 192.168.27.0/24 | 192.168.27.254 | 81.90.80.27 | .50 à .100 |
| **Ag. 09 - Lille** | 192.168.28.0/24 | 192.168.28.254 | 89.100.11.28 | .50 à .100 |
| **Ag. 10 - Rennes** | 192.168.29.0/24 | 192.168.29.254 | 92.140.55.29 | .50 à .100 |
| **Ag. 11 - Paris** | 192.168.30.0/24 | 192.168.30.254 | 195.15.20.30 | .50 à .100 |
| **Ag. 12 - Dijon** | 192.168.31.0/24 | 192.168.31.254 | 213.40.60.31 | .50 à .100 |

---

## 3. Infrastructure Système (Active Directory)

Le domaine **y-plaza.local** centralise la gestion des utilisateurs et des ressources.

### 3.1 Structure Organisationnelle (OU)
L'arborescence AD est conçue pour refléter la structure métier de l'entreprise :
- **OU Users** : Contient les utilisateurs classés par service (Direction, Commercial, Comm-Marketing, Administratif-RH-Juridique, IT-Support).
- **OU Groups** : Regroupe tous les groupes de sécurité globaux.
- **OU Computers** : Divisée en sous-unités par site (Aix, Montpellier, etc.).
- **OU Servers** : Pour les serveurs membres du domaine.
- **OU Printers** : Pour le référencement des imprimantes réseau.

### 3.2 Matrice des Droits d'Accès
La gestion des droits repose sur le principe du moindre privilège et l'administration par groupes.

| Dossier \ Groupe | GG_Direction | GG_Commercial | GG_Comm_Marketing | GG_Admin_RH_Juridique | GG_IT_Support |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Direction** | **RW** | L | L | L | L |
| **Commercial** | NA | **RW** | L | NA | NA |
| **Communication** | NA | L | **RW** | NA | NA |
| **Administratif-RH** | NA | L | L | **RW** | NA |
| **Support IT** | NA | L | L | NA | **RW** |

- **RW (Lecture / Écriture)** : Accès complet — lire, créer, modifier et supprimer des fichiers.
- **L (Lecture seule)** : Peut ouvrir et lire les fichiers — ne peut pas modifier ni supprimer.
- **NA (Aucun accès)** : Le dossier n'est pas visible et totalement inaccessible.

### 3.3 Gestion des Utilisateurs
Toute création de compte suit une procédure stricte :
1. Placement de l'utilisateur dans l'OU correspondant à son service.
2. Ajout au groupe de sécurité global approprié (`GG_`).
Les utilisateurs héritent automatiquement des droits du groupe. Aucun droit n'est configuré individuellement.

---

## 4. Interconnexion & Routage (OPNsense)

### 4.1 Configuration des Tunnels IPsec
Les 12 agences sont reliées au siège via des tunnels **VPN IPsec IKEv2**.
- **Chiffrement** : AES-256 avec authentification SHA-256.
- **Authentification** : Pre-Shared Keys (PSK) robustes par site.
- **Objectif** : Garantir que tout flux interne circulant sur l'Internet public soit chiffré de bout en bout.

### 4.2 Règles de Filtrage (Firewall)
Les pare-feux OPNsense appliquent un filtrage explicite via des **Alias** :
- **Alias `Ports_AD`** : Autorise les flux DNS, Kerberos, LDAP et SMB nécessaires à l'authentification.
- **Alias `Ports_Web`** : Autorise les flux HTTP/HTTPS (80, 443) pour l'accès à la plateforme métier.
Toute communication non explicitement autorisée est rejetée par défaut (Default Deny).

---

## 5. Politique de Sécurité (PSSI) & Continuité

### 5.1 Sécurité des Accès (IAM)
- **Stratégie de Mots de Passe** : Complexité obligatoire, longueur minimale (12 caractères), historique des mots de passe.
- **Protection Bruteforce** : Verrouillage du compte pendant 15 minutes après 5 échecs de connexion.
- **Verrouillage de Session** : Automatique après 10 minutes d'inactivité.

### 5.2 Sécurité des Données
- **Cloisonnement NTFS** : Application stricte de la matrice des droits détaillée en section 3.2.
- **Partages Masqués** : Utilisation du caractère `$` pour les dossiers administratifs afin de limiter la visibilité.

### 5.3 Sauvegarde et Continuité (MCS)
- **Plan de Continuité** : Proposition d'un contrôleur de domaine secondaire (`SRV-AIX-ADDS-02`) pour assurer la haute disponibilité.
- **Sauvegarde Hybride** : Règle du 3-2-1. Sauvegarde locale via Veeam Backup et externalisation chiffrée sur **Azure Blob Storage** ou **AWS S3** pour se prémunir des sinistres physiques.
- **Mises à jour** : Déploiement d'un serveur **WSUS** pour centraliser et forcer les correctifs de sécurité sur les 90 postes du groupe.

---

## 6. Budget et Chiffrage Matériel

### 6.1 Investissement Siège Social (Aix-en-Provence)
| Désignation du matériel | Qté | Prix Unit. HT | Total HT | Justification technique |
| :--- | :---: | :---: | :---: | :--- |
| **Serveur physique (ex: Dell PowerEdge)** | 2 | 3 500 € | 7 000 € | Hôtes de virtualisation (AD, Web, Fichiers). |
| **Pare-feu OPNsense (Appliance)** | 1 | 1 200 € | 1 200 € | Routage, filtrage et terminaison VPN. |
| **Switch 48 ports PoE** | 1 | 1 500 € | 1 500 € | Connexion des 30 postes et serveurs. |
| **Onduleur (UPS) 3000VA** | 1 | 1 000 € | 1 000 € | Maintien électrique en cas de coupure. |
| **Baie de brassage & Câblage** | 1 | 1 500 € | 1 500 € | Rangement sécurisé des équipements. |
| **PC Portable Pro (Windows 11 Pro)** | 30 | 850 € | 25 500 € | Postes pour les équipes du siège. |
| **Imprimante Multifonction Entreprise** | 1 | 2 500 € | 2 500 € | Copieur réseau grande capacité. |
| **TOTAL SIÈGE** | | | **40 200 €** | |

### 6.2 Investissement Réseau des 12 Agences
| Désignation du matériel | Qté | Prix Unit. HT | Total HT | Justification technique |
| :--- | :---: | :---: | :---: | :--- |
| **Mini Pare-feu VPN (Appliance)** | 12 | 400 € | 4 800 € | Établissement du tunnel IPsec vers le siège. |
| **Switch 8 ports PoE** | 12 | 150 € | 1 800 € | Brassage local des postes et imprimante. |
| **PC Portable Pro (Windows 11 Pro)** | 60 | 850 € | 51 000 € | 5 commerciaux par agence (12 x 5 = 60). |
| **Imprimante Multifonction Standard** | 12 | 500 € | 6 000 € | Imprimante réseau locale par agence. |
| **TOTAL AGENCES** | | | **63 600 €** | |

### 6.3 Licences et Logiciels
| Désignation | Qté | Prix Unit. HT | Total HT | Justification technique |
| :--- | :---: | :---: | :---: | :--- |
| **Licence Windows Server 2022 Std** | 2 | 1 000 € | 2 000 € | OS pour les serveurs hôtes. |
| **CAL Utilisateur (Licences accès)** | 90 | 45 € | 4 050 € | Obligatoire pour la connexion à l'AD. |
| **TOTAL LICENCES** | | | **6 050 €** | |

### 6.4 Bilan Financier Global
- **Total Investissement (CAPEX)** : **109 850 € HT**
- **Coût par collaborateur** : Environ **1 220 € HT** (basé sur 90 utilisateurs).
Ce budget est maîtrisé et correspond aux standards du marché pour une infrastructure multi-sites professionnelle.

---

## 7. Conclusion

Le projet technique **Y-Plaza** propose une réponse robuste et sécurisée aux besoins métier de l'entreprise. L'architecture Hub & Spoke assure une centralisation efficace des ressources tout en garantissant une autonomie locale pour les agences. La politique de sécurité stricte, combinée à une gestion rigoureuse des identités via Active Directory, protège les données critiques du groupe. Ce dossier technique constitue la base solide du déploiement opérationnel de l'infrastructure de l'entreprise.

---
*Fin du rapport technique.*
