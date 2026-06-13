import { ref } from 'vue'

const BACKGROUND_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=85',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85',
  'https://images.unsplash.com/photo-1600566753086-00f18f2c7a9c?w=1920&q=85'
]

export function useBackgroundImage() {
  const currentImage = ref('')

  function pickRandom(): string {
    const envImages = import.meta.env.VITE_BACKGROUND_IMAGES
    let images: string[]
    if (envImages) {
      images = envImages.split(',').map((s: string) => s.trim()).filter(Boolean)
    } else {
      images = BACKGROUND_IMAGES
    }
    currentImage.value = images[Math.floor(Math.random() * images.length)]
    return currentImage.value
  }

  pickRandom()

  return { currentImage, pickRandom }
}
