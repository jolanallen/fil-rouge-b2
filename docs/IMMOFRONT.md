# ImmoFrontend — Documentation technique

## Structure du projet

```
immofront/src/
├── main.ts                          # Point d'entrée Vue.js
├── App.vue                          # Composant racine avec layout (Navbar + Footer)
├── router/
│   └── index.ts                     # Configuration des routes Vue Router
├── stores/
│   ├── authStore.ts                 # Store Pinia pour l'authentification
├── composable/
│   ├── useSellProcess.ts            # Gestion des processus de vente
│   ├── useAnalysis.ts               # Lancement et suivi des analyses
│   ├── usePropertyFilter.ts         # Filtres de recherche de biens
│   ├── useScrollAnimation.ts        # Animations au défilement
│   ├── useToast.ts                  # Notifications toast
│   └── useBackgroundImage.ts        # Images de fond dynamiques
├── components/
│   ├── global/                      # Composants réutilisables (Button, Card, Badge, InputText, Spinner, StatsCard)
│   ├── layout/                      # Navbar, Footer
│   └── shared/                      # PropertyCard, PriceChart
├── views/                           # Pages de l'application
│   ├── HomeView.vue                 # Page d'accueil
│   ├── LoginView.vue                # Connexion / inscription
│   ├── PropertyListView.vue         # Liste des biens avec filtres
│   ├── PropertyDetailView.vue       # Détail d'un bien
│   ├── AnalysisView.vue             # Analyse de marché
│   ├── SellEstimationView.vue       # Formulaire d'estimation
│   ├── DashboardView.vue            # Tableau de bord client/staff
│   ├── SellProcessDetailView.vue    # Détail d'un processus de vente
│   ├── AboutView.vue                # Page "À propos"
│   ├── ContactView.vue              # Page de contact
│   ├── LegalNoticeView.vue          # Mentions légales
│   ├── RGPDView.vue                 # Politique de confidentialité
│   ├── CGVView.vue                  # Conditions générales de vente
│   └── AuthCallbackView.vue         # Callback OAuth Google
├── lib/                             # Fonctions utilitaires et appels API
│   ├── api.lib.ts                   # Client HTTP générique avec refresh token et mock
│   ├── authAPI.lib.ts               # Appels API d'authentification
│   ├── sellAPI.lib.ts               # Appels API pour les processus de vente
│   ├── analysisAPI.lib.ts           # Appels API pour l'analyse
│   ├── propertyAPI.lib.ts           # Appels API pour les propriétés
│   └── imageUrl.lib.ts              # Utilitaire de résolution d'URL CDN
└── types/                           # Types TypeScript
    ├── dtos/                        # DTOs pour les requêtes API
    └── presenters/                  # Modèles de réponse API
```

## Patterns d'architecture

### Composables (Composition API)

La logique métier est encapsulée dans des composables, réutilisables à travers les vues :

```typescript
// Exemple : useSellProcess.ts
export function useSellProcess() {
  const processes = ref<Property[]>([])
  const currentProcess = ref<Property | null>(null)
  const loading = ref(false)

  async function fetchProcessById(id: string) { ... }
  async function updateProcessStatus(id: string, status: string) { ... }

  return { processes, currentProcess, loading, fetchProcessById, updateProcessStatus }
}
```

Chaque composable expose un état réactif, des actions, et un état de chargement. Les vues consomment ces composables sans se soucier de l'implémentation.

### API Layer

Les appels API sont centralisés dans `lib/`. Chaque module a son propre fichier :

- **api.lib.ts** — Client HTTP générique avec :
  - Injection automatique du token JWT
  - Refresh token transparent sur 401
  - Mock data lorsque `VITE_USE_MOCK=true`
  - Parsing des erreurs avec messages français

- **authAPI.lib.ts** — Toutes les fonctions API pour les connexions/inscriptions, avec fallback mock.
- etc etc...  
### Gestion d'état (Pinia)

Pinia est utilisé pour l'authentification globale (`authStore`). Le store expose :

- **État** : user, accessToken, refreshToken, loading, error
- **Getters** : isAuthenticated, isStaff, fullName
- **Actions** : login, register, logout, refresh, init, clearSession

Les autres données (propriétés, analyses, messages) sont gérées localement dans les composables, sans store global, car elles sont liées à une vue spécifique.

## Routage

Le routeur utilise `createWebHistory()` avec les routes suivantes :

| Path              | Page              | Auth required |
|-------------------|-------------------|---------------|
| `/`               | Accueil           | Non           |
| `/login`          | Connexion         | Non           |
| `/properties`     | Liste des biens   | Non           |
| `/properties/:id` | Détail d'un bien  | Non           |
| `/analysis`       | Analyse de marché | Non           |
| `/vendre`         | Estimation        | Non           |
| `/dashboard`      | Tableau de bord   | Oui           |
| `/sell/:id`       | Processus vente   | Oui           |
| `/about`          | À propos          | Non           |
| `/contact`        | Contact           | Non           |

La navigation guard `beforeEach` vérifie `meta.requiresAuth` et redirige vers `/login` si nécessaire.

## Gestion des images et du CDN

Les images uploadées sont stockées sur le backend et servies via `/cdn`. Le frontend utilise une fonction utilitaire `cdnUrl()` qui résout les chemins relatifs en URLs absolues :

```typescript
// imageUrl.lib.ts
const CDN_BASE = import.meta.env.VITE_CDN_BASE_URL || 'http://localhost:3001'

export function cdnUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${CDN_BASE}/cdn${url.startsWith('/') ? '' : '/'}${url}`
}
```

Cette approche permet de changer l'origine du CDN via une variable d'environnement, utile pour déployer derrière un domaine personnalisé ou un vrai CDN.

## Mock data

En développement, le mode mock (`VITE_USE_MOCK=true`) permet de tester l'interface sans backend. Chaque fichier API dans `lib/` contient une implémentation mock qui :

- Retourne des données réalistes après un délai simulé
- Imite le comportement CRUD (ajout, modification, suppression en mémoire)
- Permet de développer le frontend indépendamment du backend
