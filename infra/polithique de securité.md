C'est parfait ! Avec cette logique d'adressage en `192.168.xx.0/24`, tout devient beaucoup plus clair, homogène et évolutif. Bien que je ne puisse pas ouvrir directement ton lien GitHub pour voir l'image, ta description est suffisamment précise pour que nous puissions avancer.

Voici de quoi valider haut la main la partie "Plan d'adressage IP" et "Politique de sécurité" de ta grille d'évaluation.

---


---

### 2. Politique de Sécurité du Système d'Information (PSSI)

Ce chapitre est à intégrer directement dans ta doc INFRA. Il démontre au jury que tu ne fais pas que de la technique, mais que tu as une vision globale "Gouvernance et Sécurité".

#### A. Sécurité Périmétrique et Réseau

* 
**Architecture Hub & Spoke sécurisée :** Toutes les communications entre les 12 agences et le siège d'Aix-en-Provence sont obligatoirement chiffrées au travers de tunnels VPN IPsec (protocole IKEv2 avec Pre-Shared Keys). Aucun flux interne ne transite en clair sur Internet.


* **Filtrage strict (Principe du moindre privilège) :** Les pare-feux OPNsense appliquent un filtrage explicite. Les flux autorisés dans les tunnels IPsec sont limités aux stricts besoins métiers via des Alias réseau : `Ports_AD` (authentification et résolution DNS) et `Ports_Web` (accès aux applications internes). Les paquets provenant d'adresses privées non sollicitées sur l'interface WAN sont bloqués.



#### B. Gestion des Identités et des Accès (IAM)

* 
**Centralisation Active Directory :** L'intégralité des identités (Utilisateurs, Ordinateurs, Groupes) est gérée depuis le contrôleur de domaine principal au siège.


* 
**Stratégie de Mots de Passe (GPO) :** Application rigoureuse d'une politique de mots de passe incluant la complexité obligatoire, une longueur minimale, une durée de validité maximale, un historique des mots de passe, et la désactivation du chiffrement réversible.


* **Lutte contre le Bruteforce :** Une GPO de verrouillage de compte est active. Tout compte est bloqué pour une durée de 15 minutes après 5 tentatives de connexion infructueuses.


* 
**Sécurité des sessions :** Verrouillage automatique de la session utilisateur avec exigence du mot de passe après 10 minutes d'inactivité.



#### C. Sécurité des Données et Fichiers

* 
**Cloisonnement des partages :** Les dossiers serveurs sont configurés en partages masqués (caractère `$`) pour éviter l'énumération par des utilisateurs non autorisés.


* 
**Matrice NTFS stricte :** L'attribution des droits (Lecture / Modification) ne se fait jamais par utilisateur, mais exclusivement via les groupes globaux de sécurité métiers (ex: `GG_Direction`, `GG_Commercial`) garantissant une gestion propre et auditable.



#### D. Sauvegarde, Continuité et Supervision *(À proposer pour viser la mention "Maîtrisé")*

* 
**Plan de Continuité :** Proposition de déploiement d'un contrôleur de domaine secondaire (`SRV-AIX-ADDS-02`) pour assurer la haute disponibilité de l'authentification et du DNS en cas de panne du serveur principal.


* **Sauvegarde Externalisée (Hybride / Cloud) :** Mise en place d'une règle 3-2-1. Sauvegarde locale des machines virtuelles (serveur AD et Serveur Web) via un outil comme Veeam Backup, et externalisation d'une copie chiffrée sur un stockage Cloud (ex: Azure Blob Storage ou AWS S3) pour se prémunir contre les ransomwares ou un sinistre physique au siège d'Aix-en-Provence.
* **Maintien en Condition de Sécurité (MCS) :** Déploiement d'un serveur WSUS pour forcer les mises à jour de sécurité Windows sur les 30 postes du siège et les 60 postes répartis dans les agences.

