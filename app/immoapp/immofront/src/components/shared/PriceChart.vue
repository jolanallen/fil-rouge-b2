<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js'
import type { PropertyPricePoint } from '@/types/presenters/property.presenter'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

const props = defineProps<{
  pricePoints: PropertyPricePoint[]
  predictedPrice?: number
  predictedPricePerM2?: number
  showPrediction?: boolean
}>()

const chartData = computed(() => {
  const labels = props.pricePoints.map(p => {
    const [year, month] = p.date.split('-')
    return `${month}/${year}`
  })
  const prices = props.pricePoints.map(p => p.price)

  const datasets: any[] = [
    {
      label: 'Prix (€)',
      data: prices,
      borderColor: '#1a3a5f',
      backgroundColor: 'rgba(26, 58, 95, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#1a3a5f',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }
  ]

  if (props.showPrediction && props.predictedPrice) {
    const nextLabel = `Prévision ${new Date().getFullYear() + 1}`
    datasets.push({
      label: 'Prévision',
      data: [...prices, null as any],
      borderColor: '#c9953c',
      backgroundColor: 'rgba(201, 149, 60, 0.08)',
      borderDash: [6, 4],
      fill: false,
      tension: 0.4,
      pointBackgroundColor: '#c9953c',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    })
    labels.push(nextLabel)
    datasets[1].data[datasets[1].data.length - 1] = props.predictedPrice
  }

  return { labels, datasets }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 16,
        font: { size: 12, family: 'Inter' }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleFont: { size: 12, family: 'Inter' },
      bodyFont: { size: 12, family: 'Inter' },
      padding: 12,
      cornerRadius: 8,
      callbacks: {
        label: (ctx: any) => {
          const val = ctx.raw as number
          return `${ctx.dataset.label}: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11, family: 'Inter' } }
    },
    y: {
      grid: { color: 'rgba(0,0,0,0.06)' },
      ticks: {
        font: { size: 11, family: 'Inter' },
        callback: (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 0 }).format(val)
      }
    }
  }
}
</script>

<template>
  <div class="w-full h-72">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
