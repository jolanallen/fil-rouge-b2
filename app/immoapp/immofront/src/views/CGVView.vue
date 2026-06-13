<script setup lang="ts">
import { useScrollAnimation } from '@/composable/useScrollAnimation'

useScrollAnimation()

const sections = [
  {
    title: '1. Objet',
    content: 'Les présentes Conditions Générales de Vente régissent les relations contractuelles entre Y-Plaza Group, société à responsabilité limitée au capital de 50 000 €, inscrite au RCS d\'Aix-en-Provence sous le numéro 987 654 321, et toute personne physique ou morale souhaitant recourir aux services d\'estimation, de mise en relation et de transactions immobilières proposés sur la plateforme Y-Plaza.'
  },
  {
    title: '2. Définitions',
    content: '"Plateforme" désigne le site web et l\'application mobile Y-Plaza. "Client" désigne toute personne utilisant les services de la plateforme. "Prestataire" désigne les agences Y-Plaza partenaires. "Services" désigne l\'ensemble des prestations proposées, incluant l\'estimation en ligne, la mise en relation avec des agences, l\'accompagnement à la vente et l\'analyse de marché.'
  },
  {
    title: '3. Services proposés',
    content: 'Y-Plaza propose un service d\'estimation immobilière basé sur l\'intelligence artificielle et les données DVF, une mise en relation avec son réseau d\'agences partenaires, un accompagnement personnalisé tout au long du processus de vente ou d\'achat, ainsi que des analyses de marché détaillées par secteur géographique.'
  },
  {
    title: '4. Processus de vente',
    content: 'Le processus de vente comprend les étapes suivantes : (1) dépôt du dossier de vente par le client, (2) estimation du bien par notre IA et validation par un expert, (3) signature d\'un mandat de vente avec l\'agence Y-Plaza attribuée, (4) mise en ligne du bien, (5) visite et négociation avec les acquéreurs potentiels, (6) signature du compromis et de l\'acte de vente.'
  },
  {
    title: '5. Tarifs et honoraires',
    content: 'L\'estimation en ligne est gratuite. Les honoraires d\'agence sont fixés dans le mandat de vente et sont dus uniquement en cas de réalisation de la vente. Les frais d\'agence sont à la charge du vendeur sauf mention contraire dans le mandat. Le montant des honoraires est exprimé TTC et varie selon le type de bien et la complexité du dossier.'
  },
  {
    title: '6. Obligations du client',
    content: 'Le client s\'engage à fournir des informations exactes et complètes concernant le bien mis en vente, à autoriser les visites dans des conditions raisonnables, et à informer Y-Plaza de toute modification affectant le bien ou sa situation personnelle. Le client garantit être le propriétaire légitime du bien ou disposer d\'un mandat de vente en bonne et due forme.'
  },
  {
    title: '7. Propriété intellectuelle',
    content: 'L\'ensemble des contenus de la plateforme (textes, graphismes, logos, icônes, images, vidéos, outils d\'analyse) est la propriété exclusive de Y-Plaza Group. Toute reproduction ou utilisation sans autorisation écrite préalable est interdite et constitutive de contrefaçon.'
  },
  {
    title: '8. Protection des données',
    content: 'Conformément au Règlement Général sur la Protection des Données (RGPD), Y-Plaza s\'engage à protéger les données personnelles de ses clients. Les informations collectées sont nécessaires à la gestion des dossiers et ne sont en aucun cas cédées à des tiers sans consentement explicite. Le client dispose d\'un droit d\'accès, de rectification et de suppression de ses données.'
  },
  {
    title: '9. Responsabilité',
    content: 'Y-Plaza s\'engage à mettre en œuvre tous les moyens nécessaires pour assurer le bon fonctionnement de la plateforme et la qualité des services. La responsabilité de Y-Plaza ne saurait être engagée en cas de force majeure, de dysfonctionnement technique indépendant de sa volonté, ou d\'inexactitude des informations fournies par le client.'
  },
  {
    title: '10. Droit de rétractation',
    content: 'Conformément à l\'article L221-18 du Code de la consommation, le client dispose d\'un délai de 14 jours à compter de la signature du mandat pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités, à l\'exception des frais de dossier déjà engagés.'
  },
  {
    title: '11. Litiges',
    content: 'Les présentes CGV sont soumises au droit français. En cas de litige, les parties s\'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut d\'accord, le litige sera porté devant le tribunal compétent d\'Aix-en-Provence.'
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
        <h1 class="text-4xl sm:text-5xl font-serif font-bold text-white mb-6 reveal">Conditions Générales de Vente</h1>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed reveal">
          Dernière mise à jour : Mars 2026
        </p>
      </div>
    </section>

    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto">
        <p class="text-slate-600 leading-relaxed mb-10 reveal">
          Les présentes Conditions Générales de Vente (CGV) s'appliquent à l'ensemble des prestations
          fournies par Y-Plaza Group dans le cadre de ses activités d'estimation, de mise en relation
          et de transactions immobilières.
        </p>

        <div class="space-y-8">
          <div v-for="s in sections" :key="s.title" class="reveal">
            <h2 class="text-xl font-semibold text-slate-900 mb-3">{{ s.title }}</h2>
            <p class="text-slate-600 leading-relaxed">{{ s.content }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
