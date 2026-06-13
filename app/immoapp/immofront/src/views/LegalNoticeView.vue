<script setup lang="ts">
import { useScrollAnimation } from '@/composable/useScrollAnimation'

useScrollAnimation()

const sections = [
  {
    title: 'Éditeur du site',
    content: 'Le site Y-Plaza est édité par la société Y-Plaza Group, SAS au capital de 50 000 €, immatriculée au Registre du Commerce et des Sociétés d\'Aix-en-Provence sous le numéro 987 654 321. Numéro de TVA intracommunautaire : FR12 987 654 321.',
    details: [
      'Siège social : 15 Cours Mirabeau, 13100 Aix-en-Provence',
      'Téléphone : +33 4 42 00 00 00',
      'Email : contact@yplaza.fr',
      'Directeur de la publication : Mir Mahan, Président'
    ]
  },
  {
    title: 'Hébergement',
    content: 'Le site est hébergé par OVH Cloud, société immatriculée au RCS de Lille sous le numéro 424 761 419, dont le siège social est situé 2 Rue Kellermann, 59100 Roubaix, France.',
    details: []
  },
  {
    title: 'Propriété intellectuelle',
    content: 'L\'intégralité du contenu du site Y-Plaza (textes, graphismes, logos, images, vidéos, outils d\'analyse, bases de données) est protégée par le droit d\'auteur et le droit de la propriété intellectuelle. Toute reproduction, représentation, modification ou exploitation, même partielle, sans autorisation écrite préalable de Y-Plaza Group est strictement interdite et pourra donner lieu à des poursuites judiciaires.',
    details: []
  },
  {
    title: 'Responsabilité',
    content: 'Y-Plaza Group met tout en œuvre pour assurer l\'exactitude et la mise à jour des informations publiées sur le site. Toutefois, Y-Plaza Group ne saurait garantir l\'exhaustivité ou l\'absence d\'erreur de ces informations. L\'utilisation du site et des services proposés se fait sous la seule responsabilité de l\'utilisateur. Y-Plaza Group ne pourra être tenu responsable des dommages directs ou indirects résultant de l\'utilisation du site.',
    details: []
  },
  {
    title: 'Données personnelles',
    content: 'Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD) du 27 avril 2016, vous disposez d\'un droit d\'accès, de rectification, d\'opposition et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous à contact@yplaza.fr. Pour plus d\'informations, consultez notre page dédiée à la protection des données (RGPD).',
    details: []
  },
  {
    title: 'Cookies',
    content: 'Le site Y-Plaza utilise des cookies strictement nécessaires à son fonctionnement. Des cookies analytiques anonymisés peuvent également être utilisés pour améliorer votre expérience utilisateur. Vous pouvez paramétrer vos préférences de cookies à tout moment via les paramètres de votre navigateur.',
    details: []
  },
  {
    title: 'Droit applicable',
    content: 'Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux compétents sont ceux d\'Aix-en-Provence, sous réserve d\'une procédure de conciliation préalable.',
    details: []
  }
]
</script>

<template>
  <div class="min-h-screen pb-16 bg-warm-50">
    <section class="relative pt-16 lg:pt-20 pb-20 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900" />
      <div class="absolute inset-0 opacity-10">
        <div style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;" class="absolute inset-0" />
      </div>
      <div class="relative z-10 max-w-7xl mx-auto px-4 text-center pt-6">
        <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3 reveal">Informations Légales</span>
        <h1 class="text-4xl sm:text-5xl font-serif font-bold text-white mb-6 reveal">Mentions Légales</h1>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed reveal">
          Conformément à l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique
        </p>
      </div>
    </section>

    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto space-y-10">
        <div v-for="s in sections" :key="s.title" class="reveal">
          <h2 class="text-xl font-semibold text-slate-900 mb-3">{{ s.title }}</h2>
          <p class="text-slate-600 leading-relaxed mb-3">{{ s.content }}</p>
          <ul v-if="s.details.length" class="list-disc list-inside space-y-1.5 text-sm text-slate-600">
            <li v-for="d in s.details" :key="d">{{ d }}</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
