<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBackgroundImage } from '@/composable/useBackgroundImage'
import { useScrollAnimation } from '@/composable/useScrollAnimation'
import { usePropertyFilter } from '@/composable/usePropertyFilter'
import SearchBar from '@/components/shared/SearchBar.vue'
import PropertyCard from '@/components/shared/PropertyCard.vue'
import StatsCard from '@/components/shared/StatsCard.vue'
import TestimonialCard from '@/components/shared/TestimonialCard.vue'
import Button from '@/components/global/Button.vue'

const router = useRouter()
const { currentImage } = useBackgroundImage()
useScrollAnimation()

const { properties, loading, search } = usePropertyFilter()

onMounted(() => {
  search({ limit: 3, sortBy: 'date', sortOrder: 'desc' })
})

const testimonials = [
  { name: 'Sophie Lambert', role: 'Acquéreur - Aix-en-Provence', content: 'Y-Plaza nous a accompagnés dans l\'achat de notre bastide. Leur connaissance du marché aixois est exceptionnelle et leur équipe a été d\'un professionnalisme remarquable tout au long du processus.', rating: 5 },
  { name: 'Marc Delacroix', role: 'Vendeur - Paris 16e', content: 'Grâce aux outils d\'analyse prédictive de Y-Plaza, nous avons pu vendre notre appartement au meilleur prix. La plateforme de suivi en temps réel est un vrai plus.', rating: 5 },
  { name: 'Claire Moreau', role: 'Investisseur - Lyon', content: 'Les analyses de marché fournies par Y-Plaza m\'ont permis d\'identifier les secteurs les plus porteurs pour mes investissements. Un gain de temps et d\'efficacité considérable.', rating: 5 }
]

const partners = ['Aix-en-Provence', 'Marseille', 'Paris', 'Lyon', 'Bordeaux', 'Nice', 'Toulouse', 'Lille']
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden pb-24 md:pb-28 pt-16 lg:pt-20">
      <div class="absolute inset-0">
        <img :src="currentImage" alt="Domaine avec château" class="w-full h-full object-cover" fetchpriority="high" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div class="reveal">
          <span class="inline-block px-4 py-1.5 bg-white/10 rounded-full text-white/80 text-sm font-medium mb-6 border border-white/10">
            Groupe immobilier depuis 2025
          </span>
        </div>
        <h1 class="reveal text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight mb-6">
          L'Excellence<br />
          <span class="text-gold-300">Immobilière</span>
        </h1>
        <p class="reveal text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Y-Plaza vous accompagne dans l'achat, la vente et l'analyse de vos biens immobiliers
          grâce à une plateforme centralisée et des outils d'intelligence artificielle.
        </p>
        <div class="reveal max-w-xl mx-auto mb-8">
          <SearchBar variant="glass" />
        </div>
        <div class="reveal flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="secondary" size="lg" @click="router.push('/properties')">
            Voir nos propriétés
          </Button>
          <Button variant="outline" size="lg" class="!border-white/30 !text-white hover:!bg-white/10" @click="router.push('/analysis')">
            Analyser le marché
          </Button>
        </div>
      </div>

      <!-- Stats integrated at bottom of hero -->
      <div class="hidden md:block absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 md:pb-8">
        <div class="max-w-7xl mx-auto">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Biens vendus" value="2,847+" icon="chart" :trend="12" glass />
            <StatsCard label="Agences" value="12" icon="building" glass />
            <StatsCard label="Clients satisfaits" value="98%" icon="user" :trend="8" glass />
            <StatsCard label="Villes couvertes" value="15+" icon="chart" :trend="5" glass />
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Properties -->
    <section class="py-24 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-600 mb-3 reveal">Propriétés</span>
          <h2 class="text-3xl sm:text-4xl font-serif font-bold text-slate-900 reveal">Nos Biens d'Exception</h2>
          <p class="text-slate-500 mt-3 max-w-xl mx-auto reveal">Découvrez une sélection de biens prestigieux à travers la France</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="prop in properties" :key="prop.id" class="reveal">
            <PropertyCard :property="prop" />
          </div>
        </div>
        <div class="text-center mt-10 reveal">
          <Button variant="primary" size="lg" @click="router.push('/properties')">
            Voir toutes les propriétés
          </Button>
        </div>
      </div>
    </section>

    <!-- Analysis Section -->
    <section class="py-24 px-4 bg-primary-900 relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.03]">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;" />
      </div>
      <div class="max-w-7xl mx-auto relative z-10">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3 reveal-left">Analyse IA</span>
            <h2 class="text-3xl sm:text-4xl font-serif font-bold text-white mb-6 reveal-left">
              Analyse Prédictive du Marché Immobilier
            </h2>
            <p class="text-slate-300 text-lg leading-relaxed mb-8 reveal-left">
              Notre moteur d'analyse basé sur l'intelligence artificielle traite les données DVF
              (Demandes de Valeurs Foncières) pour vous offrir des prévisions précises sur
              l'évolution des prix dans chaque secteur.
            </p>
            <div class="space-y-4 reveal-left">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-white font-medium">Prévisions de prix par secteur</h4>
                  <p class="text-slate-400 text-sm">Analyse par code postal avec tendances annuelles</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-white font-medium">Taux de croissance annualisé</h4>
                  <p class="text-slate-400 text-sm">Identification des secteurs les plus porteurs</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-white font-medium">Données mises à jour en temps réel</h4>
                  <p class="text-slate-400 text-sm">Connexion directe aux données DVF data.gouv.fr</p>
                </div>
              </div>
            </div>
            <div class="mt-8 reveal-left">
              <Button variant="secondary" size="lg" @click="router.push('/analysis')">
                Explorer les analyses
              </Button>
            </div>
          </div>
          <div class="reveal-right">
            <div class="bg-white/5 rounded-3xl p-8 border border-white/10">
              <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center">
                  <svg class="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p class="text-white font-medium">Tendances 2025</p>
                  <p class="text-slate-400 text-sm">Marché immobilier français</p>
                </div>
              </div>
              <div class="space-y-4">
                <div class="flex items-center justify-between py-2 border-b border-white/5">
                  <span class="text-slate-300 text-sm">Aix-en-Provence</span>
                  <span class="text-emerald-400 text-sm font-semibold">+5.6%</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-white/5">
                  <span class="text-slate-300 text-sm">Marseille</span>
                  <span class="text-emerald-400 text-sm font-semibold">+6.2%</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-white/5">
                  <span class="text-slate-300 text-sm">Bordeaux</span>
                  <span class="text-emerald-400 text-sm font-semibold">+6.6%</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-white/5">
                  <span class="text-slate-300 text-sm">Paris 16e</span>
                  <span class="text-emerald-400 text-sm font-semibold">+3.8%</span>
                </div>
                <div class="flex items-center justify-between py-2">
                  <span class="text-slate-300 text-sm">Nice</span>
                  <span class="text-emerald-400 text-sm font-semibold">+4.9%</span>
                </div>
              </div>
              <div class="mt-6 pt-4 border-t border-white/10">
                <p class="text-xs text-slate-500">Données basées sur les analyses prédictives Y-Plaza</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="py-24 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-600 mb-3 reveal">Témoignages</span>
          <h2 class="text-3xl sm:text-4xl font-serif font-bold text-slate-900 reveal">Ce que disent nos clients</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(t, i) in testimonials" :key="i" class="reveal" :style="{ transitionDelay: `${i * 0.1}s` }">
            <TestimonialCard v-bind="t" />
          </div>
        </div>
      </div>
    </section>

    <!-- Partners / Cities -->
    <section class="py-24 px-4 bg-warm-50">
      <div class="max-w-7xl mx-auto text-center">
        <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-600 mb-3 reveal">Notre Réseau</span>
        <h2 class="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-12 reveal">12 Agences à Travers la France</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 reveal">
          <div v-for="city in partners" :key="city" class="bg-white rounded-2xl py-6 px-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-slate-700">{{ city }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <div class="bg-gradient-to-br from-primary to-primary-800 rounded-3xl p-12 sm:p-16 reveal">
          <h2 class="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
            Prêt à réaliser votre projet immobilier ?
          </h2>
          <p class="text-slate-300 text-lg mb-8 max-w-lg mx-auto">
            Rejoignez Y-Plaza et bénéficiez d'un accompagnement personnalisé avec nos experts.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="secondary" size="lg" @click="router.push('/contact')">
              Nous contacter
            </Button>
            <Button variant="outline" size="lg" class="!border-white/30 !text-white hover:!bg-white/10" @click="router.push('/login?register=true')">
              Créer un compte
            </Button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
