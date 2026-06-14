import { onMounted, onUpdated, onUnmounted, nextTick } from 'vue'

export function useScrollAnimation() {
  let observer: IntersectionObserver | null = null

  function resetElements() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      el.classList.remove('visible')
    })
  }

  function observeFresh() {
    observer?.disconnect()
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      if (!el.classList.contains('visible')) {
        observer?.observe(el)
      }
    })
  }

  onMounted(() => {
    resetElements()
    nextTick(() => observeFresh())
  })

  onUpdated(() => {
    nextTick(() => observeFresh())
  })

  onUnmounted(() => {
    observer?.disconnect()
  })
}
