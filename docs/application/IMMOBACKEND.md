# ImmoBackend — Documentation technique

## Structure du projet

```
immobackend/src/
├── main.ts                          # Point d'entrée, configuration globale
├── app.module.ts                    # Module racine
├── core/
│   ├── config/                      # Configuration NestJS (app, database, redis, ldap, google-oauth)
│   ├── database/                    # Connexion TypeORM, datasource
│   ├── guards/                      # Guards JWT, rôles
│   └── storage/                     # Stockage local des fichiers uploadés
├── modules/
│   ├── auth/                        # Authentification (login, register, JWT, OAuth Google, LDAP)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/              # Stratégies Passport (JWT, Google)
│   │   └── dto/                     # LoginDto, RegisterDto
│   ├── property/                    # Gestion des propriétés
│   │   ├── api/
│   │   │   └── property.controller.ts
│   │   ├── services/
│   │   │   ├── property.service.ts  # CRUD + recherche + gestion images
│   │   │   └── agency.service.ts    # Gestion des agences
│   │   ├── entities/                # Property, PropertyImage, PropertyFeature, Agency
│   │   └── dto/                     # CreatePropertyDto, UpdatePropertyStatusDto
│   ├── analysis/                    # Module d'analyse (pont vers ImmoPredict)
│   │   ├── analysis.controller.ts
│   │   └── analysis.service.ts
│   ├── contact/                     # Formulaire de contact
│   └── ...
```

## Modules

### Auth

Gère l'authentification via plusieurs stratégies :

- **Email/mot de passe** — Les identifiants sont vérifiés via la table `credentials`. Les mots de passe sont hashés avec bcrypt (12 rounds).
- **Google OAuth** — Authentification via le flow OAuth 2.0 de Google. Le callback reçoit un code échangé contre un token.
- **LDAP/Active Directory** — Authentification d'entreprise pour les comptes staff. L'utilisateur est créé automatiquement lors de la première connexion.

Les tokens JWT sont composés de :
- **Access token** — Durée de vie : 15 minutes. Contient l'ID utilisateur, le rôle, l'email.
- **Refresh token** — Durée de vie : 7 jours. Stocké en base et utilisé pour générer un nouvel access token.

### Property

Le module principal qui gère :

- **CRUD complet** — Création, lecture, mise à jour, suppression des propriétés.
- **Recherche avancée** — Filtres par prix, surface, type, département, ville, code postal. Tri par date, prix, surface.
- **Images** — Upload via base64, stockage sur disque dans `uploads/properties/{id}/`. Servies via `/cdn`.
- **Processus de vente** — Gestion des statuts (draft → pending → estimation → mandate → available → reserved → under_offer → sold → cancelled).
- **Messages** — Système de messagerie entre client et staff pour chaque dossier.
- **Agences** — Assignation automatique de l'agence la plus proche géographiquement.

### Analysis

Module pont vers ImmoPredict :

- **startAnalysis** — Crée une tâche d'analyse, appelle ImmoPredict et retourne un task_id.
- **getTaskEvents** — SSE stream des événements de progression.
- **estimate** — Estimation ponctuelle via un appel HTTP à ImmoPredict.
- **getResults** — Retourne les résultats d'analyse d'un département (cachés dans Redis).

### Contact

Gère les formulaires de contact :

- Envoi d'email via un service SMTP configurable.
- Stockage des demandes de contact en base de données.
- Rate limiting pour éviter les abus.

## Authentification et autorisation

| Rôle   | Accès                                        |
|--------|----------------------------------------------|
| Client | Ses propres dossiers, recherche publique      |
| Staff  | Tous les dossiers, gestion staff, statistiques |

Les guards NestJS (`JwtAuthGuard`, `RolesGuard`) protègent les routes sensibles. Le décorateur `@Roles('staff')` restreint l'accès au personnel.

## Base de données

### Entités principales

- **User** — ID, email, nom, prénom, téléphone, rôle (client/staff), avatar
- **Credential** — ID, userId, provider (email/google/ldap), providerId, secret (mot de passe hashé)
- **Property** — ID, titre, description, prix, surface, pièces, type, adresse, ville, CP, département, coordonnées, classe énergétique, statut, agence, relations User (owner/staff)
- **PropertyImage** — ID, url, alt, isPrimary → Property
- **PropertyFeature** — ID, name → Property
- **PropertyTag** — ID, name → Property
- **Message** — ID, contenu, sender, rôle → Property
- **History** — ID, type, description → Property
- **Agency** — ID, nom, département, ville, coordonnées GPS
- **Favorites** — Relation User ↔ Property

### Migrations

Les migrations sont exécutées automatiquement au démarrage via TypeORM `synchronize: true` en développement. Pour la production, des migrations explicites sont recommandées.
