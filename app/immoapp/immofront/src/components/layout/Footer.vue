<script setup lang="ts">
const agencies = [
  { city: 'Aix-en-Provence', address: '15 Cours Mirabeau, 13100' },
  { city: 'Paris', address: '42 Avenue Mozart, 75016' },
  { city: 'Marseille', address: '8 Rue Saint-Ferréol, 13001' },
  { city: 'Lyon', address: '12 Rue de la République, 69002' },
  { city: 'Bordeaux', address: '25 Cours de l\'Intendance, 33000' },
  { city: 'Nice', address: '5 Promenade des Anglais, 06000' },
  { city: 'Toulouse', address: '18 Rue d\'Alsace-Lorraine, 31000' },
  { city: 'Lille', address: '10 Grand Place, 59800' },
  { city: 'Strasbourg', address: '7 Rue des Juifs, 67000' },
  { city: 'Nantes', address: '3 Rue Crébillon, 44000' },
  { city: 'Montpellier', address: '20 Rue de la Loge, 34000' },
  { city: 'Rennes', address: '15 Rue Le Bastard, 35000' }
]
</script>

<template>
  <footer class="bg-primary-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div class="reveal">
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">YP</div>
            <span class="text-xl font-serif font-semibold">Y-Plaza</span>
          </div>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">
            Groupe immobilier de prestige basé à Aix-en-Provence, avec 12 agences réparties sur tout le territoire français.
          </p>
          <div class="flex gap-3">
            <a href="#" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-gold/80 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-gold/80 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-gold/80 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>

        <div class="reveal">
          <h4 class="font-semibold text-sm uppercase tracking-wider text-gold-300 mb-4">Nos Agences</h4>
          <ul class="space-y-2.5">
            <li v-for="agency in agencies.slice(0, 6)" :key="agency.city">
              <span class="text-sm text-slate-300 hover:text-white transition-colors block">
                <strong class="text-slate-200">{{ agency.city }}</strong>
                <br /><span class="text-xs text-slate-400">{{ agency.address }}</span>
              </span>
            </li>
          </ul>
        </div>

        <div class="reveal">
          <h4 class="font-semibold text-sm uppercase tracking-wider text-gold-300 mb-4">Liens Rapides</h4>
          <ul class="space-y-2.5">
            <li><router-link to="/properties" class="text-sm text-slate-300 hover:text-white transition-colors">Propriétés</router-link></li>
            <li><router-link to="/analysis" class="text-sm text-slate-300 hover:text-white transition-colors">Analyse de Marché</router-link></li>
            <li><router-link to="/properties" class="text-sm text-slate-300 hover:text-white transition-colors">Recherche</router-link></li>
            <li><router-link to="/about" class="text-sm text-slate-300 hover:text-white transition-colors">À Propos</router-link></li>
            <li><router-link to="/contact" class="text-sm text-slate-300 hover:text-white transition-colors">Contact</router-link></li>
          </ul>
        </div>

        <div class="reveal">
          <h4 class="font-semibold text-sm uppercase tracking-wider text-gold-300 mb-4">Contact</h4>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <svg class="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm text-slate-300">15 Cours Mirabeau<br />13100 Aix-en-Provence</span>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-sm text-slate-300">+33 4 42 00 00 00</span>
            </li>
            <li class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gold-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-sm text-slate-300">contact@yplaza.fr</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-slate-400">&copy; {{ new Date().getFullYear() }} Y-Plaza. Tous droits réservés.</p>
        <div class="flex gap-6">
          <a href="#" class="text-xs text-slate-400 hover:text-white transition-colors">Mentions légales</a>
          <a href="#" class="text-xs text-slate-400 hover:text-white transition-colors">RGPD</a>
          <a href="#" class="text-xs text-slate-400 hover:text-white transition-colors">CGV</a>
        </div>
      </div>
    </div>
  </footer>
</template>
