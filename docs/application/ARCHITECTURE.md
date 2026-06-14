# Architecture générale

## Vue d'ensemble

Y-Plaza est une plateforme immobilière composée de trois services principaux :

- **ImmoFrontend** — Application frontale Vue.js 3. Interface utilisateur pour la recherche de biens, l'estimation, le tableau de bord et la gestion des processus de vente.
- **ImmoBackend** — API REST NestJS. Gère les utilisateurs, les propriétés, les transactions, les messages et l'authentification.
- **ImmoPredict** — API Python FastAPI. Analyse les données foncières DVF, exécute des modèles de régression linéaire et retourne des prédictions de prix.

Ces trois services sont orchestrés via Docker Compose pour le développement et la production légère.

```
┌─────────────────────────────────────────────────────┐
│                     Navigateur                      │
│              (ImmoFrontend — Vue.js 3)              │
└──────────┬─────────────────────────┬────────────────┘
           │                         │
    ┌──────▼──────┐          ┌───────▼────────┐
    │  /api/v1/*  │          │     /cdn/*     │
    └──────┬──────┘          └───────┬────────┘
           │                         │
    ┌──────▼─────────────────────────▼────────┐
    │           ImmoBackend (NestJS)          │
    │           Port 3001 — API REST          │
    └──────┬─────────────────────────┬────────┘
           │                         │
    ┌──────▼──────┐          ┌───────▼────────┐
    │   MariaDB   │          │     Redis      │
    │  (données)  │          │   (sessions)   │
    └─────────────┘          └────────────────┘
           │
    ┌──────▼──────────────────────────────────────┐
    │         ImmoPredict (FastAPI — Python)      │
    │        Port 8000 — Analyse & Prédiction     │
    └─────────────────────────────────────────────┘
```

## Flux de données

1. **Recherche de biens** — L'utilisateur consulte la liste des propriétés. Le frontend appelle `GET /api/v1/properties` avec des filtres. Le backend interroge MariaDB et retourne les résultats paginés.

2. **Analyse de marché** — L'utilisateur lance une analyse départementale. Le frontend appelle `POST /api/v1/analysis/start` sur ImmoBackend, qui relaie vers ImmoPredict. ImmoPredict télécharge les données DVF, les nettoie, exécute la régression linéaire et retourne les résultats via SSE (Server-Sent Events). Le backend stocke les résultats en cache Redis et les retourne au frontend.

3. **Estimation et vente** — L'utilisateur remplit un formulaire d'estimation. Le frontend appelle `POST /api/v1/analysis/estimate` pour obtenir un prix au m² estimé, puis `POST /api/v1/properties` pour créer le dossier de vente. Les images sont uploadées, stockées sur disque et servies via `/cdn`.

4. **Authentification** — L'utilisateur se connecte via email/mot de passe ou Google OAuth. Le backend génère des JWT (access + refresh token). Les appels API sont authentifiés via Bearer token.

## Flux SSE (analyse temps réel)

```
Frontend                 Backend                ImmoPredict
   │                        │                        │
   │  POST /analysis/start  │                        │
   │──────────────────────► │                        │
   │                        │  POST /analysis/start  │
   │                        │──────────────────────► │
   │                        │                        │
   │                        │    task_id + SSE URL   │
   │                        │◄────────────────────── │
   │   task_id              │                        │
   │◄────────────────────── │                        │
   │                        │                        │
   │  GET /task/:id/events  │                        │
   │──────────────────────► │                        │
   │                        │  SSE stream (progress) │
   │◄────────────────────── │                        │
   │                        │                        │
   │  complete/error event  │                        │
   │◄────────────────────── │                        │
```

## Sécurité

- **JWT** — Authentification par tokens. Access token court (15 min), refresh token long (7 jours).
- **Refresh transparent** — Le interceptor côté frontend tente un refresh automatique sur 401. En cas d'échec, la session est détruite.
- **CORS** — Configurable via `CORS_ORIGINS`. En développement, origins locales autorisées.
- **Validation** — Tous les DTO sont validés côté backend avec class-validator et `forbidNonWhitelisted`.
- **Mots de passe** — Hashés avec bcrypt (12 rounds).
