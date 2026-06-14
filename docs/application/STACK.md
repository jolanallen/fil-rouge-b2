# Choix techniques

## Pourquoi Python / FastAPI pour ImmoPredict

**Python** est le langage standard pour la data science et le machine learning. L'écosystème Pandas, scikit-learn et NumPy permet de manipuler les données DVF et d'exécuter des régressions linéaires sans outillage supplémentaire. Python est également le choix naturel pour le traitement de fichiers CSV volumineux (les données DVF peuvent atteindre plusieurs centaines de mégaoctets).

**FastAPI** a été retenu pour plusieurs raisons :

- **Performance** — Basé sur Starlette, il offre des performances comparables à Node.js ou Go pour les API REST, grâce à l'async/await natif de Python.
- **Validation intégrée** — Pydantic est nativement intégré, permettant de valider les entrées/sorties avec la même syntaxe que les types Python.
- **Documentation automatique** — Génération OpenAPI et Swagger UI sans configuration.
- **SSE natif** — Le streaming Server-Sent Events est simple à implémenter avec Starlette StreamingResponse, ce qui est essentiel pour le retour en temps réel des analyses.
- **Typage fort** — Les annotations de type Python améliorent la maintenabilité et la détection d'erreurs.

## Pourquoi NestJS / Node.js pour ImmoBackend

**Node.js** est le choix naturel pour une API REST orientée CRUD avec des besoins de concurrence modérés. Son modèle événementiel non-bloquant est parfaitement adapté aux opérations d'entrée/sortie (requêtes base de données, appels HTTP à ImmoPredict, streaming SSE).

**NestJS** apporte une structure d'entreprise à Node.js :

- **Architecture modulaire** — Chaque fonctionnalité (auth, property, analysis, contact) est un module indépendant avec son propre contrôleur, service, DTO et entité. Cela facilite la maintenance et l'évolution.
- **Decorators** — Les routes, la validation et l'injection de dépendances sont déclaratives, ce qui réduit le boilerplate.
- **TypeORM** intégré — La couche d'accès aux données est fournie via un module NestJS officiel, avec support du Data Mapper et du Active Record.
- **Guardians et pipes** — La séparation des préoccupations (authentification, validation, autorisation) est propre et réutilisable.
- **Testabilité** — L'injection de dépendances rend les tests unitaires et d'intégration simples à écrire.

Comparé à Express.js (trop minimaliste) ou Fastify (moins d'écosystème NestJS), NestJS offre le meilleur équilibre entre structure, productivité et flexibilité.

## Pourquoi Vue.js 3 pour ImmoFront

**Vue.js 3** avec la Composition API a été choisi pour le frontend pour les raisons suivantes :

- **Courbe d'apprentissage douce** — La syntaxe des templates Vue est intuitive pour les développeurs familiers avec HTML.
- **Composition API** — Permet de réutiliser la logique métier via des composables (équivalent des hooks React), ce qui est idéal pour des fonctionnalités comme `useSellProcess`, `useAnalysis` ou `useAuth`.
- **Performance** — Le Virtual DOM de Vue 3 est optimisé et le tree-shaking natif réduit la taille du bundle.
- **TypeScript natif** — Vue 3 est écrit en TypeScript et son intégration avec `vue-tsc` permet une vérification statique complète.
- **Écosystème** — Pinia (gestion d'état), Vue Router (navigation), Vite (build tool) forment un stack cohérent et maintenu par la même équipe.
- **Taille** — Le bundle final est plus léger que React ou Angular, ce qui est appréciable pour une application servant aussi des images volumineuses.

Le choix de **Tailwind CSS** pour le styling permet un développement rapide avec des utilitaires, sans fichier CSS séparé, tout en gardant un design cohérent.

## Pourquoi MariaDB

MariaDB a été préféré à PostgreSQL pour des raisons de compatibilité avec l'outillage existant et la simplicité :

- **Base de données relationnelle** adaptée à des données structurées (utilisateurs, propriétés, transactions).
- **Moteur InnoDB** fiable, avec support des transactions ACID et des contraintes de clé étrangère.
- **Performances suffisantes** pour un projet de cette envergure (quelques milliers de propriétés, centaines d'utilisateurs).
- **Déploiement simple** avec un seul container Docker, sans configuration complexe.

À noter : le passage à PostgreSQL serait simple si le besoin de fonctionnalités avancées (types JSON, requêtes spatiales PostGIS) se présentait.

## Pourquoi Redis

Redis est utilisé comme cache pour les résultats d'analyse de marché. Le choix est justifié par :

- **Cache en mémoire** extrêmement rapide pour les résultats d'analyse (temps de réponse < 1 ms).
- **TTL automatique** — Les résultats expirés sont automatiquement supprimés.
- **Simplicité** — Un seul container Docker, aucune persistance complexe nécessaire (les résultats sont recalculables).

## Pourquoi TypeORM

TypeORM est le choice mapping standard pour NestJS :

- **Compatibilité NestJS** — Module officiel `@nestjs/typeorm` avec injection de repository.
- **Migrations automatiques** — Synchronisation du schéma base de données avec les entités.
- **Relations** — Gestion des relations ManyToOne, OneToMany, ManyToMany de manière déclarative.
- **Repository pattern** — Séparation claire entre la logique métier et l'accès aux données.

Alternatives considérées : Prisma (moins mature avec NestJS à l'époque du choix), MikroORM (plus complexe). TypeORM reste le standard de facto.

## Pourquoi class-validator / class-transformer

- **Validation déclarative** — Les décorateurs `@IsString()`, `@IsEmail()`, `@MinLength(6)` définissent les règles directement sur les DTO.
- **Transformation automatique** — `class-transformer` convertit automatiquement les types (string → number pour les query params).
- **Messages d'erreur** — Les messages d'erreur de validation sont automatiquement formatés et retournés au client.
- **Intégration NestJS** — Le `ValidationPipe` global applique automatiquement la validation sur tous les contrôleurs.
- **Mode `forbidNonWhitelisted`** — Rejette les propriétés inconnues dans les requêtes, évitant les injections silencieuses.

## Pourquoi Docker Compose pour la production actuelle

Voir [Déploiement](DEPLOYMENT.md) pour les détails. En résumé :

- Projet scolaire avec des besoins d'infrastructure modestes.
- Pas de load balancing, pas de scaling horizontal nécessaire.
- Docker Compose simplifie le déploiement : un seul `docker compose up`.
- L'architecture modulaire permet une migration vers Kubernetes sans refactorisation majeure.
