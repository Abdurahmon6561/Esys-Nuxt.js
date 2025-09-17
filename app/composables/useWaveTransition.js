// composables/useWaveTransition.js
export const useWaveTransition = () => {
  const nuxtApp = useNuxtApp();

  const navigateWithWave = async (to) => {
    // Try to get the wave transition function from multiple sources
    const waveTransition =
      nuxtApp.$waveTransition ||
      nuxtApp.provide?.waveTransition ||
      (process.client && window.waveTransition);

    if (waveTransition) {
      await waveTransition(() => {
        navigateTo(to);
      });
    } else {
      // Fallback to regular navigation
      navigateTo(to);
    }
  };

  const executeWithWave = async (callback) => {
    const waveTransition =
      nuxtApp.$waveTransition ||
      nuxtApp.provide?.waveTransition ||
      (process.client && window.waveTransition);

    if (waveTransition && callback) {
      await waveTransition(callback);
    } else if (callback) {
      callback();
    }
  };

  const createWaveTransition =
    nuxtApp.$waveTransition ||
    nuxtApp.provide?.waveTransition ||
    (process.client && window.waveTransition) ||
    null;

  return {
    navigateWithWave,
    executeWithWave,
    createWaveTransition,
  };
};
