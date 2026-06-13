<script setup lang="ts">
import { useScrollAnimation } from '@/composable/useScrollAnimation'
import { useRouter } from 'vue-router'
import Button from '@/components/global/Button.vue'
import Card from '@/components/global/Card.vue'

const router = useRouter()
useScrollAnimation()

const team = [
  { name: 'Mir Mahan', role: 'CEO & Fondateur', bio: 'Expert en immobilier avec 15 ans d\'expérience dans le secteur du luxe en Provence.' },
  { name: 'Loan Mata', role: 'Directeur Technique', bio: 'Architecte logiciel spécialisé en intelligence artificielle et analyse de données.' },
  { name: 'Allen Jolan', role: 'Directeur Commercial', bio: 'Responsable du développement réseau et des partenariats stratégiques.' }
]

const values = [
  { title: 'Excellence', desc: 'Nous visons l\'excellence dans chaque transaction, en offrant un service sur-mesure à nos clients.' },
  { title: 'Innovation', desc: 'L\'IA et la data au service de l\'immobilier pour des décisions éclairées et stratégiques.' },
  { title: 'Confiance', desc: 'La transparence et l\'intégrité sont au cœur de notre relation client.' },
  { title: 'Proximité', desc: '12 agences partout en France pour un accompagnement de proximité.' }
]
</script>

<template>
  <div class="min-h-screen pb-16 bg-warm-50">
    <!-- Hero -->
    <section class="relative pt-16 lg:pt-20 pb-20 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />
      <div class="absolute inset-0 opacity-10">
        <div style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;" class="absolute inset-0" />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 text-center pt-6">
        <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3 reveal">À Propos</span>
        <h1 class="text-4xl sm:text-5xl font-serif font-bold text-white mb-6 reveal">Y-Plaza Group</h1>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed reveal">
          Groupe immobilier de prestige basé à Aix-en-Provence, fort d'un réseau de 12 agences
          à travers la France. Notre mission : révolutionner l'expérience immobilière grâce à la technologie.
        </p>
      </div>
    </section>

    <!-- Story -->
    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div class="reveal-left">
            <span class="text-xs font-semibold uppercase tracking-widest text-gold-600">Notre Histoire</span>
            <h2 class="text-3xl font-serif font-bold text-slate-900 mt-2 mb-4">L'Immobilier Réinventé</h2>
            <p class="text-slate-600 leading-relaxed mb-4">
              Fondé en 2025, Y-Plaza est né de la vision de trois entrepreneurs passionnés d'immobilier
              et de technologie. Basés à Aix-en-Provence, nous avons développé une plateforme centralisée
              qui connecte clients et agences pour une gestion transparente des transactions immobilières.
            </p>
            <p class="text-slate-600 leading-relaxed">
              Notre plateforme intègre des outils d'analyse prédictive basés sur l'intelligence artificielle,
              exploitant les données DVF pour offrir des insights précis sur les tendances du marché et
              guider les décisions stratégiques d'achat et de vente.
            </p>
          </div>
          <div class="reveal-right">
            <img
              src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80"
              alt="Domaine provençal"
              class="rounded-3xl shadow-lg w-full h-80 object-cover"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="py-20 px-4 bg-white">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <span class="text-xs font-semibold uppercase tracking-widest text-gold-600 reveal">Nos Valeurs</span>
          <h2 class="text-3xl font-serif font-bold text-slate-900 mt-2 reveal">Ce qui nous anime</h2>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="v in values" :key="v.title" class="reveal">
            <Card padding="lg" hover>
              <h3 class="text-lg font-semibold text-slate-900 mb-2">{{ v.title }}</h3>
              <p class="text-sm text-slate-500">{{ v.desc }}</p>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-14">
          <span class="text-xs font-semibold uppercase tracking-widest text-gold-600 reveal">L'Équipe</span>
          <h2 class="text-3xl font-serif font-bold text-slate-900 mt-2 reveal">Notre Direction</h2>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="m in team" :key="m.name" class="reveal">
            <Card padding="lg" class="text-center">
              <div class="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center text-primary text-2xl font-serif mx-auto mb-4">
                {{ m.name.split(' ').map(n => n[0]).join('') }}
              </div>
              <h3 class="text-lg font-semibold text-slate-900">{{ m.name }}</h3>
              <p class="text-sm text-gold-600 font-medium mb-3">{{ m.role }}</p>
              <p class="text-sm text-slate-500">{{ m.bio }}</p>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto text-center reveal">
        <div class="bg-gradient-to-br from-primary to-primary-800 rounded-3xl p-12">
          <h2 class="text-3xl font-serif font-bold text-white mb-4">Envie d'en savoir plus ?</h2>
          <p class="text-slate-300 mb-8">Contactez-nous pour une consultation gratuite</p>
          <div class="flex justify-center gap-4">
            <Button variant="secondary" size="lg" @click="router.push('/contact')">Nous contacter</Button>
            <Button variant="outline" size="lg" class="!border-white/30 !text-white hover:!bg-white/10" @click="router.push('/properties')">Voir nos biens</Button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
