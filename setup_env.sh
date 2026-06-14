#!/bin/bash

# Script de configuration automatique des fichiers .env pour Y-Plaza
# Auteur : Architecte Infrastructure & Sécurité

echo "🚀 Configuration des environnements Y-Plaza..."

# 1. Configuration pour ImmoPredict (Python/FastAPI)
echo "📝 Génération de app/immopredict/.env"
cat <<EOF > app/immopredict/.env
# Database
DATABASE_URL=mysql+pymysql://immopredict:immopredict@mariadb:3306/immoapp

# DVF data source (French land registry)
DVF_API_BASE_URL=https://files.data.gouv.fr/geo-dvf/latest/csv
DVF_API_TIMEOUT=30

# Logging
LOG_LEVEL=INFO
EOF

# 2. Configuration pour ImmoBackend (NestJS)
echo "📝 Génération de app/immoapp/immobackend/.env"
cat <<EOF > app/immoapp/immobackend/.env
# App
PORT=3001
NODE_ENV=production

# Database (Docker)
DB_HOST=mariadb
DB_PORT=3306
DB_USER=immopredict
DB_PASSWORD=immopredict
DB_NAME=immoapp

# Redis (Docker)
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "y-plaza-super-secret-key-2026")
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# LDAP / Active Directory (Siège Aix)
LDAP_URL=ldap://192.168.10.2:389
LDAP_BASE_DN=DC=y-plaza,DC=local
LDAP_BIND_DN=CN=svc_auth,OU=Groups,DC=y-plaza,DC=local
LDAP_BIND_PASSWORD=y-plaza-auth-pass
LDAP_SEARCH_FILTER=(sAMAccountName={{username}})
LDAP_ATTR_FIRSTNAME=givenName
LDAP_ATTR_LASTNAME=sn
LDAP_ATTR_EMAIL=mail

# Google OAuth (À remplir manuellement)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# Frontend URL (Docker Port mapping)
FRONTEND_URL=http://localhost:3002

# CORS
CORS_ORIGINS=http://localhost:3002,http://localhost:5173,http://localhost:3000

# Immopredict Python API (Docker)
IMMOPREDICT_API_URL=http://immopredict:8000/api/v1
EOF

# 3. Configuration pour ImmoFrontend (Vue.js 3)
echo "📝 Génération de app/immoapp/immofront/.env"
cat <<EOF > app/immoapp/immofront/.env
# Application
VITE_APP_TITLE=Y-Plaza

# Backend API (Accès côté navigateur)
VITE_API_BASE_URL=http://localhost:3001/api/v1

# CDN pour les images
VITE_CDN_BASE_URL=http://localhost:3001

# Désactivation du mock en production
VITE_USE_MOCK=false

# Images de fond (Défaut Unsplash)
VITE_BACKGROUND_IMAGES=https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=85,https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EOF

# 4. Configuration pour DVF Coder
echo "📝 Génération de app/dvf-coder/.env"
cat <<EOF > app/dvf-coder/.env
DISABLE_GEOCODING=false
CADASTRE_MILLESIME=2020-01-01
COG_MILLESIME=2019-01-01
ANNEES=2014,2015,2016,2017,2018,2019,2020
EOF

echo "✅ Tous les fichiers .env ont été générés avec succès."
echo "💡 Note : N'oubliez pas de configurer vos clés Google OAuth si nécessaire."
