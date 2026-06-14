# Référence API

## Base URL

**Backend (NestJS) :** `http://localhost:3001/api/v1`
**Prediction (FastAPI) :** `http://localhost:8000`

---

## Authentification

Module : `auth.controller.ts` — préfixe `/auth`.

### `POST /auth/login`

Connexion client.

**Corps :**
```json
{
  "email": "client@test.com",
  "password": "password123"
}
```

**Réponse :** `{ accessToken, refreshToken, user }`

---

### `POST /auth/register`

Inscription client.

**Corps :**
```json
{
  "email": "client@test.com",
  "password": "password123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "0600000000"
}
```

**Réponse :** `{ accessToken, refreshToken, user }`

---

### `POST /auth/refresh`

Rafraîchir les tokens.

**Corps :**
```json
{
  "refreshToken": "..."
}
```

**Réponse :** `{ accessToken, refreshToken }`

---

### `GET /auth/profile`

Profil de l'utilisateur connecté. **Authentification requise.**

**Réponse :** `{ id, email, firstName, lastName, phone, role, ... }`

---

### `POST /auth/logout`

Déconnexion. **Authentification requise.**

**Réponse :** `{ message: "Logged out" }`

---

### `POST /auth/staff/login`

Connexion staff.

**Corps :**
```json
{
  "email": "staff@test.com",
  "password": "password123"
}
```

**Réponse :** `{ accessToken, refreshToken, user }`

---

### `GET /auth/staff/profile`

Profil staff connecté. **Rôle staff requis.**

---

### `PUT /auth/staff/onboarding`

Compléter l'onboarding staff.

**Corps :**
```json
{
  "token": "...",
  "password": "newpassword",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

---

### `GET /auth/google`

URL de redirection Google OAuth.

**Réponse :** `{ url: "https://accounts.google.com/o/oauth2/..." }`

---

### `GET /auth/google/callback?code=...`

Callback Google OAuth. Redirige vers le frontend avec les tokens.

---

## Propriétés

Module : `property.controller.ts` — préfixe `/properties`.

### `GET /properties/agencies`

Liste des agences. Authentification optionnelle.

---

### `GET /properties`

Liste des propriétés avec filtres. Authentification optionnelle.

**Paramètres de requête :** `search`, `type`, `status`, `minPrice`, `maxPrice`, `minSurface`, `maxSurface`, `rooms`, `department`, `page`, `limit`, `sort`, `order`

---

### `POST /properties/request`

Créer une demande de propriété (client).

**Corps :**
```json
{
  "type": "house",
  "surface": 100,
  "rooms": 4,
  "department": "33",
  "budget": 250000
}
```

---

### `GET /properties/my-requests`

Mes demandes (client connecté). **Authentification requise.**

---

### `GET /properties/staff`

Toutes les propriétés (vue staff). **Rôle staff requis.**

---

### `GET /properties/stats`

Statistiques globales. **Rôle staff requis.**

---

### `POST /properties`

Créer une propriété (staff). **Rôle staff requis.**

**Corps :**
```json
{
  "title": "Belle maison à Bordeaux",
  "type": "house",
  "price": 250000,
  "surface": 100,
  "rooms": 4,
  "bedrooms": 3,
  "description": "...",
  "address": "...",
  "city": "Bordeaux",
  "department": "33",
  "energyClass": "C",
  "tags": ["jardin", "garage"],
  "images": []
}
```

---

### `PUT /properties/:id`

Mettre à jour une propriété. **Rôle staff requis.**

---

### `PUT /properties/:id/status`

Mettre à jour le statut uniquement. **Rôle staff requis.**

**Corps :**
```json
{
  "status": "available"
}
```

**Statuts disponibles :** `draft`, `pending`, `estimation`, `mandate`, `available`, `reserved`, `under_offer`, `sold`, `cancelled`

---

### `PUT /properties/:id/assign`

Assigner un staff à une propriété. **Rôle staff requis.**

---

### `DELETE /properties/:id`

Supprimer une propriété. **Rôle staff requis.**

**Réponse :** `204 No Content`

---

### `GET /properties/:id`

Détail d'une propriété. Authentification optionnelle.

---

### `GET /properties/:id/manage`

Détail avec gestion (propriétaire ou staff). **Authentification requise.**

---

### `GET /properties/:id/similar`

Propriétés similaires. Public.

---

### `POST /properties/:id/images`

Uploader une image (multipart). Propriétaire ou staff.

---

### `DELETE /properties/:id/images/:imageId`

Supprimer une image. Propriétaire ou staff.

**Réponse :** `204 No Content`

---

### `POST /properties/:id/messages`

Envoyer un message. Authentification requise.

**Corps :**
```json
{
  "content": "Bonjour, je suis intéressé par ce bien."
}
```

---

### `GET /properties/:id/messages`

Messages d'une propriété. Propriétaire ou staff.

---

### `GET /properties/:id/history`

Historique des changements. Propriétaire ou staff.

---

## Favoris

Module : `property-favorite.controller.ts` — préfixe `/properties`.

### `POST /properties/:id/favorites`

Ajouter aux favoris. **Authentification requise.**

---

### `DELETE /properties/:id/favorites`

Retirer des favoris. **Authentification requise.**

---

### `GET /properties/my-favorites`

Mes favoris (avec les propriétés complètes). **Authentification requise.**

---

## Statistiques de propriété

Module : `property-stat.controller.ts` — préfixe `/properties`.

### `POST /properties/:id/view`

Enregistrer une vue. Public.

---

### `POST /properties/:id/click`

Enregistrer un clic. Public.

---

### `POST /properties/:id/favorite`

Enregistrer un favori (tracking). Public.

---

### `GET /properties/:id/stats`

Statistiques d'une propriété. Public.

---

## Contact

Module : `contact.controller.ts` — préfixe `/contact`.

### `POST /contact`

Soumettre un message de contact.

**Corps :**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@test.com",
  "phone": "0600000000",
  "message": "Bonjour, je souhaite plus d'informations."
}
```

---

### `POST /contact/property/:id`

Contacter un agent à propos d'une propriété.

**Corps :**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@test.com",
  "message": "Je suis intéressé par ce bien."
}
```

---

### `GET /contact?limit=50&page=1`

Lister les messages de contact. **Rôle staff requis.**

---

## Analyse / Prédiction

Module : `analysis.controller.ts` — préfixe `/analysis`.

### `POST /analysis/start`

Lancer une analyse par département.

**Corps :**
```json
{
  "departmentCode": "33",
  "year": 2024
}
```

**Réponse :** `{ taskId: 42 }`

---

### `GET /analysis/task/:id`

Statut d'une tâche d'analyse.

---

### `GET /analysis/task/:id/events`

SSE — événements en temps réel d'une tâche.

---

### `GET /analysis/estimate?department=33&surface=100&type=house`

Estimation de prix.

**Réponse :** `{ estimatedPrice: 250000 }`

---

### `GET /analysis/results/:department`

Résultats d'analyse par département.

---

## API Prédiction (FastAPI)

### `POST /predict`

Lancer une prédiction.

**Corps :**
```json
{
  "city": "Bordeaux",
  "rooms": 4,
  "surface": 100,
  "type": "house"
}
```

---

### `GET /status/:taskId`

Statut d'une tâche de prédiction.
