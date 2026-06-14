### 1. Plan d'Adressage IP Global (Siège + 12 Agences)

Voici la structure de ton réseau. Le siège d'Aix-en-Provence héberge les services centraux , tandis que les 12 agences (dont Montpellier) s'y connectent via les tunnels IPsec.

#### Réseau du Siège : Aix-en-Provence (LAN : `192.168.10.0/24`)

Le siège regroupe les 30 postes clients et l'infrastructure serveur principale.

| Équipement / Rôle | Adresse IP Privée (LAN) | Adresse IP Publique (WAN) | Remarques |
| --- | --- | --- | --- |
| **Pare-feu OPNsense (Passerelle)** | 192.168.10.254 | `82.100.50.10` | Passerelle par défaut pour le LAN |
| **SRV-AIX-ADDS-01** | 192.168.10.2 | - | AD, DNS, DHCP, Serveur de fichiers 

 |
| **SRV-AIX-WEB-01** | 192.168.10.3 | - | Hébergement web et Base de données 

 |
| **Imprimante Siège** | 192.168.10.10 | - | IP Statique réservée 

 |
| **Plage Clients DHCP (30 postes)** | 192.168.10.50 à .100 | - | Distribuée par l'AD 

 |

#### Réseaux des 12 Agences (LAN : `192.168.20.0/24` à `192.168.31.0/24`)

Chaque agence dispose de 5 postes commerciaux et d'une imprimante.

| Site | Réseau LAN | IP Pare-feu OPNsense (LAN) | Adresse IP Publique (WAN) | Plage DHCP Clients |
| --- | --- | --- | --- | --- |
| **Agence 01 - Montpellier** | `192.168.20.0/24` | 192.168.20.254 | `203.0.113.20` | 192.168.20.50 à .100 |
| **Agence 02 - Marseille** | `192.168.21.0/24` | 192.168.21.254 | `212.85.45.21` | 192.168.21.50 à .100 |
| **Agence 03 - Lyon** | `192.168.22.0/24` | 192.168.22.254 | `198.51.100.22` | 192.168.22.50 à .100 |
| **Agence 04 - Toulouse** | `192.168.23.0/24` | 192.168.23.254 | `80.12.34.23` | 192.168.23.50 à .100 |
| **Agence 05 - Nice** | `192.168.24.0/24` | 192.168.24.254 | `91.200.15.24` | 192.168.24.50 à .100 |
| **Agence 06 - Nantes** | `192.168.25.0/24` | 192.168.25.254 | `104.25.36.25` | 192.168.25.50 à .100 |
| **Agence 07 - Strasbourg** | `192.168.26.0/24` | 192.168.26.254 | `62.150.40.26` | 192.168.26.50 à .100 |
| **Agence 08 - Bordeaux** | `192.168.27.0/24` | 192.168.27.254 | `81.90.80.27` | 192.168.27.50 à .100 |
| **Agence 09 - Lille** | `192.168.28.0/24` | 192.168.28.254 | `89.100.11.28` | 192.168.28.50 à .100 |
| **Agence 10 - Rennes** | `192.168.29.0/24` | 192.168.29.254 | `92.140.55.29` | 192.168.29.50 à .100 |
| **Agence 11 - Paris** | `192.168.30.0/24` | 192.168.30.254 | `195.15.20.30` | 192.168.30.50 à .100 |
| **Agence 12 - Dijon** | `192.168.31.0/24` | 192.168.31.254 | `213.40.60.31` | 192.168.31.50 à .100 |

