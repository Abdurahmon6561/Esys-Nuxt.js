// composables/useWaveTransition.js
export const useWaveTransition = () => {
  const nuxtApp = useNuxtApp()
  
  const navigateWithWave = async (to) => {
    // Try to get the wave transition function
    const waveTransition = nuxtApp.$waveTransition || nuxtApp.provide?.waveTransition
    
    if (waveTransition) {
      await waveTransition(() => {
        navigateTo(to)
      })
    } else {
      // Fallback to regular navigation
      navigateTo(to)
    }
  }

  const createWaveTransition = nuxtApp.$waveTransition || nuxtApp.provide?.waveTransition || null

  return {
    navigateWithWave,
    createWaveTransition
  }
}