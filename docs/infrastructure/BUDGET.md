C'est parti ! Pour impressionner le jury sur cette partie, il ne s'agit pas juste de lister des PC, mais de montrer que tu as pensé à une infrastructure d'entreprise cohérente (serveurs, réseau, licences, redondance énergétique).

Voici une proposition de budgétisation réaliste (avec des tarifs moyens du marché) qui répond parfaitement aux exigences du cahier des charges d'Y-Plaza.

### 1. Siège Social (Aix-en-Provence)

Besoins : 30 postes, 2 serveurs, 1 routeur/pare-feu, 1 imprimante.

| Désignation du matériel | Qté | Prix Unitaire HT | Total HT | Justification technique |
| --- | --- | --- | --- | --- |
| **Serveur physique (ex: Dell PowerEdge)** | 2 | **3 500 €** | **7 000 €** | Serveurs hôtes pour la virtualisation (AD, Web, Fichiers). |
| **Pare-feu matériel (Appliance OPNsense)** | 1 | **1 200 €** | **1 200 €** | Routage, filtrage et terminaison des tunnels VPN IPsec. |
| **Commutateur (Switch) 48 ports PoE** | 1 | **1 500 €** | **1 500 €** | Connexion des 30 postes, serveurs et de l'imprimante. |
| **Onduleur (UPS) 3000VA** | 1 | **1 000 €** | **1 000 €** | Protection électrique et maintien de la baie serveur en cas de coupure. |
| **Baie de brassage & Câblage** | 1 | **1 500 €** | **1 500 €** | Rangement sécurisé des serveurs et équipements réseaux. |
| **Poste de travail (PC Portable Pro)** | 30 | **850 €** | **25 500 €** | Postes pour les équipes (Direction, RH, Com, IT, etc.) sous Windows 11 Pro. |
| **Imprimante Multifonction Entreprise** | 1 | **2 500 €** | **2 500 €** | Copieur réseau partagé de grande capacité.

 |
| **TOTAL SIÈGE** |  |  | **40 200 €** |  |

---

### 2. Réseau des 12 Agences

Besoins par agence : 5 postes (commerciaux), 1 imprimante, connexion VPN.

| Désignation du matériel | Qté | Prix Unitaire HT | Total HT | Justification technique |
| --- | --- | --- | --- | --- |
| **Mini Pare-feu VPN (Appliance OPNsense)** | 12 | **400 €** | **4 800 €** | Établissement du tunnel IPsec site-à-site vers le siège. |
| **Commutateur (Switch) 8 ports PoE** | 12 | **150 €** | **1 800 €** | Brassage local des postes et de l'imprimante dans chaque agence. |
| **Poste de travail (PC Portable Pro)** | 60 | **850 €** | **51 000 €** | 5 commerciaux par agence (12 x 5 = 60 postes) sous Windows 11 Pro.

 |
| **Imprimante Multifonction Standard** | 12 | **500 €** | **6 000 €** | Imprimante réseau locale pour chaque agence.

 |
| **TOTAL AGENCES** |  |  | **63 600 €** |  |

---

### 3. Licences et Logiciels (L'oubli classique à éviter)

*Pour que ton Active Directory soit légal en production, il faut chiffrer les licences Microsoft.*

| Désignation | Qté | Prix Unitaire HT | Total HT | Justification technique |
| --- | --- | --- | --- | --- |
| **Licence Windows Server 2022 Standard** | 2 | **1 000 €** | **2 000 €** | OS pour tes deux serveurs principaux.

 |
| **Licences d'accès client (CAL) Utilisateur** | 90 | **45 €** | **4 050 €** | Obligatoire pour chaque utilisateur se connectant à l'AD (30 siège + 60 agences). |
| **TOTAL LICENCES** |  |  | **6 050 €** |  |

---

### 4. Bilan Financier Global du Projet Y-Plaza

| Pôle d'investissement | Montant Total HT |
| --- | --- |
| **Infrastructure Siège (Aix-en-Provence)** | **40 200 €** |
| **Infrastructure Réseau des 12 Agences** | **63 600 €** |
| **Licences Logicielles** | **6 050 €** |
| **BUDGET TOTAL ESTIMÉ** | **109 850 €** |

> **À noté :** il est important de retenir quil s'agit d'un investissement de type *CAPEX* (dépenses d'investissement) sur 4 à 5 ans. Avec un budget de ~110k€ pour 90 collaborateurs répartis sur 13 sites, le coût d'équipement est d'environ **1 220 € par collaborateur**, ce qui est une moyenne basse et parfaitement maîtrisée dans le milieu de l'entreprise.

Les CAPEX ou dépenses d'investissement se réfèrent aux immobilisations, c'est-à-dire aux dépenses qui ont une valeur positive à long terme.