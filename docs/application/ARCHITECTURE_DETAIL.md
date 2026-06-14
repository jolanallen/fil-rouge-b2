
# Architecture générale du projet application immoapp

---
Collaborateur : Mir Mahan, Loan Mata, Allen Jolan

année : 2025/2026

---

# Introduction
> **Description** :
> cette architecture repose 
> 
```mermaid
flowchart TD
    %% Styling de base pour la clarté
    classDef frontend fill:#4fc08d,stroke:#333,stroke-width:2px,color:#fff;
    classDef backend fill:#68a063,stroke:#333,stroke-width:2px,color:#fff;
    classDef python fill:#3776ab,stroke:#333,stroke-width:2px,color:#fff;
    classDef db fill:#f29111,stroke:#333,stroke-width:2px,color:#fff;
    classDef api fill:#e2e2e2,stroke:#333,stroke-width:2px,color:#000;

    %% Définition des composants
    immofront("🖥️ Front-End<br>immofront (Vue.js)"):::frontend
    immobackend("⚙️ Back-End<br>immobackend (Node.js)"):::backend
    immopredict("📊 Service d'Analyse<br>immopredict (Python)"):::python
    predictbdd[("🗄️ Base de données<br>predictbdd")]:::db
    datagouv(("🌐 API Externe<br>datagouv")):::api

    %% Relations et communications
    immofront -->|Requêtes HTTP| immobackend
    immobackend <-->|Appels REST internes| immopredict
    immobackend -->|Requêtes SQL/NoSQL| predictbdd
    immopredict -->|Requêtes SQL/NoSQL| predictbdd
    immopredict -->|Appels API| datagouv
```
