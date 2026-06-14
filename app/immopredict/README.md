# Immopredict

Analyse et prédiction linéaire des marchés immobiliers en France sur la base des données DVF (Demande de Valeur Foncière) de Data.gouv.fr.

## Stack Technique

- **Python 3.12** / **FastAPI**
- **SQLAlchemy** (async) + **Alembic**
- **MariaDB**
- **Pandas** + **scikit-learn** (LinearRegression)
- **Server-Sent Events** (SSE) pour le streaming temps réel
- **Docker** / **docker-compose**

## Architecture

```
app/immopredict/
├── app/
│   ├── main.py              # Point d'entrée FastAPI
│   ├── config.py            # Configuration (variables d'environnement)
│   ├── api/
│   │   ├── routes.py        # Endpoints REST
│   │   └── dependencies.py  # Dépendances (DB session)
│   ├── services/
│   │   ├── dvf_service.py   # Intégration API DVF
│   │   └── cleaning_service.py  # Nettoyage des données
│   ├── models/              # Modèles SQLAlchemy
│   ├── schemas/             # Schémas Pydantic
│   ├── database/            # Connexion et session DB
│   ├── workers/
│   │   └── analysis_worker.py  # Worker asynchrone d'analyse
│   ├── ml/
│   │   └── predictor.py     # Pipeline ML (régression linéaire)
│   └── utils/
│       ├── logging.py       # Logging structuré
│       └── sse.py           # Helper SSE
├── alembic/                 # Migrations
├── DOCKERFILE
├── docker-compose.yml
└── requirements.txt
```

## Démarrage Rapide

### Prérequis

- Docker & Docker Compose

### Lancer l'application

```bash
docker compose up --build
```

L'API sera disponible sur `http://localhost:8000`.

### Appliquer les migrations

```bash
docker compose exec api alembic upgrade head
```

## Endpoints API

| Méthode | Path | Description |
|---------|------|-------------|
| POST | `/api/v1/analysis/start` | Lancer une analyse départementale |
| GET | `/api/v1/analysis/task/{task_id}` | Statut d'une tâche |
| GET | `/api/v1/analysis/stream/{task_id}` | SSE (streaming temps réel) |
| GET | `/api/v1/analysis/results/{department}` | Résultats d'analyse |
| GET | `/api/v1/health` | Health check |

### Exemple : Lancer une analyse

```bash
curl -X POST http://localhost:8000/api/v1/analysis/start \
  -H "Content-Type: application/json" \
  -d '{"department_code": "75"}'
```

### Exemple : Stream SSE

```bash
curl -N http://localhost:8000/api/v1/analysis/stream/1
```

## Modèles de Données

### PropertyTransaction
- `id`, `mutation_date`, `price`, `surface`, `price_per_m2`
- `property_type`, `city`, `postal_code`, `department`
- `latitude`, `longitude`

### SectorAnalysis
- `city`, `sector`, `department`
- `avg_price_m2`, `median_price_m2`, `transaction_count`
- `yearly_growth_percent`, `predicted_price_next_year`
- `model_slope`, `model_intercept`

### AnalysisTask
- `department`, `status`, `progress`
- `current_city`, `message`, `started_at`, `completed_at`

## Pipeline ML

1. Récupération des données DVF via API Data.gouv.fr
2. Nettoyage : dates, valeurs manquantes, coordonnées invalides, doublons
3. Calcul du prix au m²
4. Agrégation par ville / secteur postal
5. Régression linéaire (scikit-learn) sur `year` → `price_per_m2`
6. Prédiction du prix au m² pour l'année suivante
7. Calcul de la croissance annuelle en %
