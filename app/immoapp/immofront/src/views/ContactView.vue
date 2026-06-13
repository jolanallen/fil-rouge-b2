<script setup lang="ts">
import { ref } from 'vue'
import { useScrollAnimation } from '@/composable/useScrollAnimation'
import { submitContact } from '@/lib/contactAPI.lib'
import { useToast } from '@/composable/useToast'
import Button from '@/components/global/Button.vue'
import InputText from '@/components/global/InputText.vue'
import Card from '@/components/global/Card.vue'

useScrollAnimation()
const toast = useToast()

const form = ref({ name: '', email: '', subject: '', message: '' })
const sent = ref(false)
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!form.value.name || !form.value.email || !form.value.message) {
    error.value = 'Veuillez remplir tous les champs obligatoires'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await submitContact(form.value)
    sent.value = true
    toast.success('Votre message a été envoyé avec succès')
  } catch (e: any) {
    error.value = e.message
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const agencies = [
  { city: 'Aix-en-Provence', address: '15 Cours Mirabeau, 13100', phone: '+33 4 42 00 00 01' },
  { city: 'Paris', address: '42 Avenue Mozart, 75016', phone: '+33 1 42 00 00 02' },
  { city: 'Marseille', address: '8 Rue Saint-Ferréol, 13001', phone: '+33 4 91 00 00 03' },
  { city: 'Lyon', address: '12 Rue de la République, 69002', phone: '+33 4 72 00 00 04' },
  { city: 'Bordeaux', address: '25 Cours de l\'Intendance, 33000', phone: '+33 5 56 00 00 05' },
  { city: 'Nice', address: '5 Promenade des Anglais, 06000', phone: '+33 4 93 00 00 06' }
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
        <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3 reveal">Contact</span>
        <h1 class="text-4xl sm:text-5xl font-serif font-bold text-white mb-6 reveal">Parlons de votre projet</h1>
        <p class="text-lg text-slate-300 max-w-xl mx-auto reveal">
          Une équipe d'experts à votre écoute dans toute la France
        </p>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Form -->
        <Card padding="lg" class="reveal-left">
          <h2 class="text-xl font-semibold text-slate-900 mb-6">Envoyez-nous un message</h2>

          <form v-if="!sent" @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <InputText v-model="form.name" label="Nom complet" placeholder="Jean Dupont" required />
              <InputText v-model="form.email" label="Email" placeholder="jean@exemple.com" type="email" required />
            </div>
            <InputText v-model="form.subject" label="Sujet" placeholder="Achat, vente, analyse..." />
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Message <span class="text-red-500">*</span></label>
              <textarea
                v-model="form.message"
                rows="5"
                placeholder="Décrivez votre projet..."
                class="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 resize-none"
                required
              />
            </div>
            <div v-if="error" class="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">{{ error }}</div>
            <Button type="submit" variant="primary" size="lg" full-width :loading="loading">Envoyer le message</Button>
          </form>

          <div v-else class="text-center py-12 reveal-scale">
            <svg class="w-16 h-16 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-xl font-semibold text-slate-900 mb-2">Message envoyé !</h3>
            <p class="text-slate-500">Nous vous répondrons dans les plus brefs délais.</p>
            <Button variant="outline" class="mt-6" @click="sent = false; form = { name: '', email: '', subject: '', message: '' }">Envoyer un autre message</Button>
          </div>
        </Card>

        <!-- Info -->
        <div class="space-y-6">
          <Card padding="lg" class="reveal-right">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Siège Social</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Adresse</p>
                  <p class="text-sm text-slate-500">15 Cours Mirabeau<br />13100 Aix-en-Provence</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Téléphone</p>
                  <p class="text-sm text-slate-500">+33 4 42 00 00 00</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="font-medium text-slate-900">Email</p>
                  <p class="text-sm text-slate-500">contact@yplaza.fr</p>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="lg" class="reveal-right">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Nos Agences</h3>
            <div class="space-y-3">
              <div v-for="a in agencies" :key="a.city" class="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                  {{ a.city.slice(0, 3) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-900">{{ a.city }}</p>
                  <p class="text-xs text-slate-500">{{ a.address }} • {{ a.phone }}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
