# Architecture

## Vue d'ensemble

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   immofront  │────>│  immobackend │────>│  immopredict │
│  (Vue 3 /    │     │  (NestJS)    │     │  (FastAPI)   │
│   Nginx)     │     │  :3001       │     │  :8000       │
└──────────────┘     └──────┬───────┘     └──────┬───────┘
                            │                     │
                            │ partagent la même   │
                            │ base PostgreSQL     │
                            ▼                     ▼
                    ┌─────────────────────────────────┐
                    │         PostgreSQL               │
                    │  - users, credentials            │
                    │  - properties, property_*        │
                    │  - agencies, contact_messages    │
                    │  - analysis_tasks                │
                    │  - sector_analyses               │
                    │  - property_transactions         │
                    └─────────────────────────────────┘
```

## Flux des données

### Propriétés
- `immofront` ⇆ `immobackend` (API REST classique)
- Les images sont servies via un CDN (ou directement depuis le backend)
- Authentification par JWT (access + refresh tokens)

### Analyse / Prédiction (SSE)

```
Frontend              NestJS                     FastAPI                  PostgreSQL
   │                    │                          │                        │
   │  POST /analysis/   │  POST /api/v1/analysis/  │                        │
   │  start             │  start                   │                        │
   │───────────────────>│─────────────────────────>│                        │
   │                    │                          │  Create AnalysisTask   │
   │                    │                          │  (id=2, department=33) │
   │                    │                          │───────────────────────>│
   │                    │                          │  Lance worker (async)  │
   │                    │                          │                        │
   │  GET /analysis/    │                          │  Worker écrit :        │
   │  task/:id/events   │  SSE bridge               │  - property_transactions│
   │<═══════════════════│<══════════════════════════│  - sector_analyses      │
   │  (progress, city,  │                          │  - update task status   │
   │   complete/error)  │                          │───────────────────────>│
   │                    │                          │                        │
   │  GET /results/33   │                          │                        │
   │───────────────────>│─────────────────────────>│                        │
   │                    │  Lit sector_analyses     │                        │
   │                    │<─────────────────────────────────────────────────│
   │<───────────────────│                          │                        │
```

> **Note :** Le Python worker (`analysis_worker.py`) écrit directement dans la même base PostgreSQL, via SQLAlchemy. NestJS se contente de lire ces données depuis la même base. Il n'y a qu'un seul `AnalysisTask` (créé par FastAPI), pas de doublon côté NestJS.

## Sécurité
- Authentification : JWT (access token + refresh token)
- Rôles : `client`, `staff`
- Guards : `JwtAuthGuard`, `OptionalJwtAuthGuard`, `RolesGuard`
- Endpoints publics : marqués `@Public()` ou `@OptionalAuth()`
- CORS : configuré via `CORS_ORIGINS` (variable d'environnement)
- Validation : `ValidationPipe` avec `forbidNonWhitelisted: true`

## Technologies

| Composant | Technologie |
|-----------|------------|
| Frontend | Vue 3, TypeScript, Pinia, Vue Router, Chart.js |
| Backend | NestJS, TypeORM, PostgreSQL |
| ML / Analyse | FastAPI, Pandas, Scikit-learn, SQLAlchemy |
| Base de données | PostgreSQL (partagée entre backend et FastAPI) |
| Conteneurisation | Docker, Docker Compose |
| Serveur statique | Nginx (pour immofront) |
