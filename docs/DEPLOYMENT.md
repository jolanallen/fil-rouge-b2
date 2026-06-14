# Déploiement

## Architecture actuelle : Docker Compose

Le projet utilise Docker Compose pour le développement et la production légère. Quatre services sont orchestrés :

```yaml
services:
  mariadb:     # Base de données relationnelle
  redis:       # Cache en mémoire
  immopredict: # API Python d'analyse
  immobackend: # API NestJS
  immofront:   # Frontend Vue.js (nginx)
```

### Déploiement en production

```bash
# Cloner le projet
git clone https://github.com/jolanallen/fil-rouge-b2.git yplaza
cd yplaza

# Démarrer tous les services
docker compose up --build -d

# Vérifier l'état
docker compose ps

# Consulter les logs
docker compose logs -f
```

### Variables d'environnement

Chaque service lit ses variables depuis le fichier `.env` à la racine du projet ou depuis les variables passées dans `docker-compose.yml`.

Les variables importantes à configurer pour la production :

| Variable | Service | Description |
|----------|---------|-------------|
| `JWT_SECRET` | immobackend | Clé secrète JWT (changez-la !) |
| `CORS_ORIGINS` | immobackend | Origins autorisées pour CORS |
| `DB_NAME` | immobackend | Nom de la base de données |
| `DB_HOST` | immobackend | Host de la base de données |
| `DB_USER` | immobackend | Utilisateur de la base de données |
| `DB_PASSWORD` | immobackend | Mot de passe base de données |
| `VITE_API_BASE_URL` | immofront | URL de l'API backend (build-time) |
| `VITE_CDN_BASE_URL` | immofront | URL du CDN (build-time) |

### Ports exposés

| Service | Port hôte | Port container | Description |
|---------|-----------|----------------|-------------|
| immofront | 3000 | 80 | Interface utilisateur |
| immobackend | 3001 | 3001 | API REST |
| immopredict | 8000 | 8000 | API d'analyse |
| mariadb | 3307 | 3306 | Base de données |
| redis | 6379 | 6379 | Cache |

### Persistance

Les données MariaDB sont persistées dans un volume Docker `mariadb_data`. Les fichiers uploadés (images) sont stockés dans le container immobackend via le volume monté sur `uploads/`.

### Limitations de Docker Compose

- **Scaling** — Pas de scaling horizontal simple (un seul serveur, pas de load balancing)
- **Haute disponibilité** — Pas de replication ni de failover automatique
- **Mise à jour zéro downtime** — Un redémarrage de service coupe la disponibilité
- **Orchestration** — Pas de gestion des pannes, de scheduling ou de rolling updates

Ces limitations sont acceptables pour un projet scolaire. Pour une mise en production professionnelle, Kubernetes est recommandé.

---

## Migration vers Kubernetes

### Pourquoi c'est simple

L'architecture actuelle est déjà conçue pour Kubernetes :

1. **Services sans état** — `immofront`, `immobackend` et `immopredict` sont stateless. Ils peuvent être multipliés horizontalement.
2. **Images Docker existantes** — Chaque service a déjà son Dockerfile, prêt à être poussé sur un registry (Docker Hub, GHCR).
3. **Variables d'environnement** — Toute la configuration passe par des variables d'environnement, parfait pour les ConfigMaps et Secrets Kubernetes.
4. **Dépendances réseau** — Les services communiquent par nom DNS (`immobackend:3001`), ce qui est le mode de fonctionnement natif de Kubernetes.

### Étapes de migration

1. **Pousser les images** sur un registry :
   ```bash
   docker tag yplaza-immobackend ghcr.io/yplaza/immobackend:latest
   docker push ghcr.io/yplaza/immobackend:latest
   ```

2. **Créer les ConfigMaps et Secrets** pour les variables d'environnement.

3. **Déployer MariaDB et Redis** en StatefulSet avec des PersistentVolumeClaims.

4. **Déployer les services** immobackend, immopredict et immofront.

5. **Configurer l'Ingress** pour exposer les services.

6. **Mettre en place un certificat TLS** via cert-manager (Let's Encrypt).

### Avantages de Kubernetes

- **Rolling updates** — Mise à jour sans interruption de service
- **Auto-scaling** — Scale automatique basé sur la charge CPU/mémoire
- **Self-healing** — Redémarrage automatique des pods en échec
- **Service discovery** — DNS intégré pour la communication entre services
- **Gestion des secrets** — Stockage sécurisé des mots de passe et tokens

### Inconvénients (pour un projet scolaire)

- **Complexité** — Nécessite un cluster Kubernetes (Minikube, K3s, ou cloud)
- **Ressources** — Plus de mémoire et CPU pour le cluster lui-même
- **Maintenance** — Gestion des mises à jour du cluster, des certificats, des sauvegardes

Pour un projet scolaire, Docker Compose reste le meilleur choix. Kubernetes est recommandé si le projet passe en production avec un trafic significatif.
