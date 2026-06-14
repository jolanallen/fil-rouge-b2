# ImmoPredict — Documentation technique

## Présentation

ImmoPredict est le service d'analyse et de prédiction immobilière. Il consomme les données DVF (Demande de Valeur Foncière) de Data.gouv.fr, les nettoie, et exécute un modèle de régression linéaire pour estimer les prix au m² par ville et par secteur.

## Pipeline d'analyse

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Téléchargement│    │  Nettoyage   │     │  Agrégation  │     │  Prédiction  │
│  CSV DVF     │────►│  (pandas)    │────►│ par ville    │────►│ (scikit-learn)│
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                                                               ┌──────▼───────┐
                                                               │   Résultats  │
                                                               │   + cache    │
                                                               └──────────────┘
```

### Étape 1 : Téléchargement

Le fichier CSV du département est téléchargé depuis l'API DVF de Data.gouv.fr. Le format est standardisé : une ligne par transaction immobilière, avec les colonnes suivantes :

- `id_mutation` — Identifiant unique de la transaction
- `date_mutation` — Date de la vente
- `valeur_fonciere` — Prix de vente
- `surface_reelle_bati` — Surface habitable
- `type_local` — Appartement / Maison / Local commercial
- `code_postal`, `nom_commune` — Localisation
- `latitude`, `longitude` — Coordonnées GPS

### Étape 2 : Nettoyage

Les données brutes sont nettoyées avec Pandas :

- Suppression des lignes avec `valeur_fonciere` ou `surface_reelle_bati` manquants ou nuls
- Filtrage des prix aberrants (centiles 1 et 99)
- Filtrage des surfaces aberrantes (< 5 m² ou > 1000 m²)
- Conversion des types (dates, nombres)
- Suppression des doublons
- Calcul du prix au m² (`valeur_fonciere / surface_reelle_bati`)

### Étape 3 : Agrégation

Les données nettoyées sont agrégées par ville et par année :

- Prix au m² moyen, prix au m² médian
- Nombre de transactions
- Année de transaction extraite de `date_mutation`

### Étape 4 : Prédiction

Pour chaque ville, une régression linéaire (scikit-learn `LinearRegression`) est entraînée sur les années disponibles (axe X : année, axe Y : prix au m² moyen).

Le modèle produit :

- **Pente** — Tendance de croissance annuelle (€/m²/an)
- **Ordonnée à l'origine** — Prix de base
- **Prédiction N+1** — Prix au m² estimé pour l'année suivante
- **Croissance annuelle** — Pourcentage de changement par rapport à l'année précédente

## Architecture du code

```
app/immopredict/
├── app/
│   ├── main.py                   # Point d'entrée FastAPI
│   ├── config.py                 # Configuration Pydantic (variables d'environnement)
│   ├── api/
│   │   ├── routes.py             # Endpoints REST
│   │   └── dependencies.py       # Dépendances (session DB)
│   ├── services/
│   │   ├── dvf_service.py        # Téléchargement et parsing CSV
│   │   └── cleaning_service.py   # Nettoyage et agrégation
│   ├── models/                   # Modèles SQLAlchemy
│   ├── schemas/                  # Schémas Pydantic
│   ├── database/                 # Connexion et session
│   ├── workers/
│   │   └── analysis_worker.py    # Worker asynchrone d'analyse
│   ├── ml/
│   │   └── predictor.py          # Régression linéaire
│   └── utils/
│       ├── logging.py            # Logging structuré
│       └── sse.py                # Helper SSE
├── alembic/                      # Migrations base de données
├── DOCKERFILE
├── docker-compose.yml
└── requirements.txt
```

## Streaming SSE

L'analyse départementale est longue (téléchargement CSV + nettoyage + ML). Le retour utilisateur est assuré par Server-Sent Events (SSE) :

```python
# sse.py — Helper SSE
async def event_stream(task_id: int, db: AsyncSession):
    while True:
        task = await get_task(task_id, db)
        if task.status == "completed":
            yield f"event: complete\ndata: {json.dumps(task.to_dict())}\n\n"
            break
        elif task.status == "error":
            yield f"event: error\ndata: {json.dumps(task.to_dict())}\n\n"
            break
        yield f"data: {json.dumps(task.to_dict())}\n\n"
        await asyncio.sleep(1)
```

Les événements sont :

- **data** (par défaut) — Mise à jour de progression (0-100%), ville en cours de traitement
- **event: complete** — Analyse terminée avec les résultats
- **event: error** — Erreur avec le message d'erreur

## Base de données

### Tables

- **PropertyTransaction** — Transactions immobilières brutes (id, date, prix, surface, type, ville, département, coordonnées)
- **SectorAnalysis** — Résultats d'analyse par ville (prix m² moyen/médian, nombre transactions, croissance, prédiction)
- **AnalysisTask** — État d'avancement des tâches d'analyse (département, statut, progression, message)

### Cache Redis

Les résultats d'analyse sont stockés dans Redis avec un TTL de 1 heure. Une nouvelle analyse du même département dans l'heure retourne les résultats en cache.
