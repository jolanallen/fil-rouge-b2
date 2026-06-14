# Y-Plaza — Documentation technique

## Table des matières

1. [Architecture générale](ARCHITECTURE.md)
   - Vue d'ensemble du système
   - Diagramme d'architecture
   - Flux de données
2. [Choix techniques](STACK.md)
   - Pourquoi Python / FastAPI pour ImmoPredict
   - Pourquoi NestJS / Node.js pour ImmoBackend
   - Pourquoi Vue.js 3 pour ImmoFront
   - Pourquoi MariaDB, Redis, TypeORM, class-validator
3. [ImmoBackend](IMMOBACKEND.md)
   - Structure du projet
   - Modules et responsabilités
   - Authentification et autorisation
   - Base de données et migrations
4. [ImmoFrontend](IMMOFRONT.md)
   - Structure du projet
   - Composants, vues et composables
   - Gestion d'état (Pinia)
   - Gestion des images et du CDN
5. [ImmoPredict](IMMOPREDICT.md)
   - Pipeline d'analyse
   - Modèle de machine learning
   - Streaming SSE en temps réel
6. [Référence API](API.md)
   - Endpoints immobackend
   - Endpoints immopredict
   - Formats de requête et réponse
7. [Déploiement](DEPLOYMENT.md)
   - Architecture Docker Compose actuelle
   - Migration vers Kubernetes
   - Variables d'environnement
