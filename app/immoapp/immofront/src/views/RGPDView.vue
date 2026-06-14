<script setup lang="ts">
import { useScrollAnimation } from '@/composable/useScrollAnimation'

useScrollAnimation()

const sections = [
  {
    title: '1. Introduction',
    content: 'Y-Plaza Group accorde une importance capitale à la protection de vos données personnelles. La présente politique détaille comment nous collectons, utilisons, stockons et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD) n° 2016/679 du 27 avril 2016 et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.'
  },
  {
    title: '2. Responsable du traitement',
    content: 'Le responsable du traitement des données est Y-Plaza Group, SAS au capital de 50 000 €, inscrite au RCS d\'Aix-en-Provence sous le numéro 987 654 321, dont le siège social est situé 15 Cours Mirabeau, 13100 Aix-en-Provence. Pour toute question relative à vos données, contactez notre Délégué à la Protection des Données (DPO) à l\'adresse dpo@yplaza.fr.'
  },
  {
    title: '3. Données collectées',
    content: 'Nous collectons les catégories de données suivantes : données d\'identification (nom, prénom, email, téléphone), données de connexion (adresse IP, logs de connexion), données relatives à vos biens (adresse, surface, caractéristiques), données de navigation (cookies analytiques), et données de transaction (historique d\'estimation et de vente).'
  },
  {
    title: '4. Base légale du traitement',
    content: 'Le traitement de vos données repose sur les bases légales suivantes : l\'exécution du contrat (gestion de votre dossier de vente ou d\'achat), votre consentement (cookies et communications marketing), notre intérêt légitime (amélioration de nos services et analyses de marché), et le respect d\'obligations légales (conservation des documents comptables et fiscaux).'
  },
  {
    title: '5. Finalités du traitement',
    content: 'Vos données sont utilisées pour : (1) la gestion et le suivi de vos dossiers d\'estimation et de transaction, (2) la mise en relation avec nos agences partenaires, (3) l\'amélioration de nos outils d\'analyse et d\'estimation par intelligence artificielle, (4) l\'envoi de communications relatives à vos transactions, (5) la conformité à nos obligations légales et réglementaires.'
  },
  {
    title: '6. Destinataires des données',
    content: 'Vos données sont accessibles uniquement aux personnes habilitées de Y-Plaza Group et de ses agences partenaires impliquées dans votre dossier. Nous ne partageons pas vos données avec des tiers à des fins commerciales sans votre consentement explicite. Certaines données peuvent être transmises à des sous-traitants techniques (hébergeur, prestataire email) dans le cadre strict de l\'exécution de nos services.'
  },
  {
    title: '7. Durée de conservation',
    content: 'Vos données sont conservées pour la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées. Les données de gestion de dossier sont conservées pendant toute la durée de la relation contractuelle et jusqu\'à 5 ans après la fin de celle-ci. Les données comptables et fiscales sont conservées 10 ans conformément à la législation en vigueur. Les données de cookies analytiques sont conservées 13 mois maximum.'
  },
  {
    title: '8. Vos droits',
    content: 'Conformément au RGPD, vous disposez des droits suivants : droit d\'accès (obtenir la confirmation que vos données sont traitées et en recevoir une copie), droit de rectification (faire corriger des données inexactes), droit à l\'effacement (demander la suppression de vos données), droit à la limitation du traitement, droit d\'opposition (vous opposer au traitement pour motifs légitimes), droit à la portabilité (recevoir vos données dans un format structuré).'
  },
  {
    title: '9. Exercice de vos droits',
    content: 'Pour exercer vos droits, adressez votre demande par email à dpo@yplaza.fr ou par courrier à Y-Plaza Group, DPO, 15 Cours Mirabeau, 13100 Aix-en-Provence. Nous nous engageons à répondre à votre demande dans un délai d\'un mois maximum. Une pièce d\'identité pourra vous être demandée pour vérifier votre identité.'
  },
  {
    title: '10. Sécurité des données',
    content: 'Y-Plaza Group met en œuvre toutes les mesures techniques et organisationnelles appropriées pour garantir la sécurité et la confidentialité de vos données. Cela inclut le chiffrement des données, la gestion des accès, la sécurisation des serveurs, et la formation de notre personnel à la protection des données. Nous effectuons régulièrement des audits de sécurité.'
  },
  {
    title: '11. Transferts de données',
    content: 'Vos données sont hébergées en France et dans l\'Union Européenne. En cas de recours à un prestataire situé hors UE, nous nous assurons que des garanties appropriées sont mises en place conformément à la législation (clauses contractuelles types, Privacy Shield).'
  },
  {
    title: '12. Réclamation auprès de la CNIL',
    content: 'Si vous estimez que vos droits ne sont pas respectés, vous avez la possibilité d\'introduire une réclamation auprès de la Commission Nationale de l\'Informatique et des Libertés (CNIL), autorité de contrôle française, à l\'adresse suivante : CNIL, 3 Place de Fontenoy, 75007 Paris, ou sur www.cnil.fr.'
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
        <span class="inline-block text-xs font-semibold uppercase tracking-widest text-gold-400 mb-3 reveal">Protection des Données</span>
        <h1 class="text-4xl sm:text-5xl font-serif font-bold text-white mb-6 reveal">Politique de Confidentialité — RGPD</h1>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed reveal">
          Comment nous protégeons vos données personnelles et respectons vos droits
        </p>
      </div>
    </section>

    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto">
        <p class="text-slate-600 leading-relaxed mb-10 reveal">
          Dernière mise à jour : janvier 2025. Y-Plaza s'engage à protéger la vie privée de ses utilisateurs
          et à traiter leurs données personnelles avec la plus grande transparence.
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
