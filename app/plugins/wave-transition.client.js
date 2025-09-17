// plugins/wave-transition.client.js
import { gsap } from 'gsap'

// Global transition state
let transitionOverlay = null
let isTransitioning = false
let isInitialLoad = true

// Create overlay immediately when script loads
const createOverlay = () => {
  if (transitionOverlay) return transitionOverlay
  
  transitionOverlay = document.createElement('div')
  transitionOverlay.id = 'wave-transition-overlay'
  transitionOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #f2f1f0;
    z-index: 99999;
    pointer-events: none;
    display: block;
    clip-path: circle(150% at 50% 100%);
  `
  document.body.appendChild(transitionOverlay)
  return transitionOverlay
}

// Initialize overlay immediately for first load
if (process.client && !window.waveOverlayInitialized) {
  window.waveOverlayInitialized = true
  
  // Create overlay as soon as possible
  const initializeOverlay = () => {
    if (document.body) {
      createOverlay()
    } else {
      // If body doesn't exist yet, wait for it
      document.addEventListener('DOMContentLoaded', () => {
        createOverlay()
      })
    }
  }
  
  // Try to initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOverlay)
  } else {
    initializeOverlay()
  }
}

// Create global transition function
const createWaveTransition = (callback, skipCallback = false) => {
  if (isTransitioning) return Promise.resolve()
  
  return new Promise((resolve) => {
    isTransitioning = true
    const overlay = createOverlay()
    
    // Show overlay and start wave animation
    gsap.set(overlay, {
      display: 'block',
      clipPath: 'circle(0% at 50% 100%)',
    })
    
    // Wave expanding upward
    gsap.to(overlay, {
      clipPath: 'circle(150% at 50% 100%)',
      duration: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        // Execute callback during peak of transition
        if (callback && !skipCallback) {
          callback()
        }
        
        // Wait a moment then animate out
        setTimeout(() => {
          gsap.to(overlay, {
            clipPath: 'circle(0% at 50% 0%)',
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.set(overlay, { display: 'none' })
              isTransitioning = false
              resolve()
            }
          })
        }, 100)
      }
    })
  })
}

// Make it globally available
if (process.client) {
  window.waveTransition = createWaveTransition
}

export default defineNuxtPlugin((nuxtApp) => {
  // Intercept all NuxtLink clicks globally
  const interceptNuxtLinks = () => {
    // Function to handle link clicks
    const handleLinkClick = async (event) => {
      const link = event.currentTarget
      const href = link.getAttribute('href') || link.getAttribute('to')
      
      // Skip if it's not a local navigation
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('#')) {
        return
      }
      
      // Skip if it's the same route
      const currentPath = window.location.pathname
      if (href === currentPath) {
        event.preventDefault()
        return
      }
      
      // Prevent default navigation
      event.preventDefault()
      
      // Create wave transition and navigate
      await createWaveTransition(() => {
        navigateTo(href)
      })
    }
    
    // Intercept existing and future NuxtLinks
    const observer = new MutationObserver(() => {
      // Get all links that look like navigation links including buttons with click handlers
      const links = document.querySelectorAll('a[href]:not([href^="http"]):not([href^="mailto"]):not([href^="tel"]):not([href^="#"]), a[to], button[data-wave-transition]')
      
      links.forEach(link => {
        if (!link.hasAttribute('data-wave-intercepted')) {
          link.setAttribute('data-wave-intercepted', 'true')
          link.addEventListener('click', handleLinkClick, { passive: false })
        }
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    // Initial setup for existing links
    setTimeout(() => {
      const links = document.querySelectorAll('a[href]:not([href^="http"]):not([href^="mailto"]):not([href^="tel"]):not([href^="#"]), a[to], button[data-wave-transition]')
      links.forEach(link => {
        if (!link.hasAttribute('data-wave-intercepted')) {
          link.setAttribute('data-wave-intercepted', 'true')
          link.addEventListener('click', handleLinkClick, { passive: false })
        }
      })
    }, 100)
  }
  
  // Handle browser navigation (back/forward buttons)
  const handlePopState = () => {
    createWaveTransition(null, true) // Skip callback for popstate
  }
  
  // Handle page load transition - now this just animates out
  const handlePageLoad = () => {
    if (!isInitialLoad) return
    isInitialLoad = false
    
    // The overlay should already be covering the screen
    // Just animate it out to reveal the content
    const overlay = transitionOverlay || createOverlay()
    
    // Ensure overlay is visible and covering screen
    gsap.set(overlay, {
      display: 'block',
      clipPath: 'circle(150% at 50% 100%)',
    })
    
    // Wait a moment then animate out from top
    setTimeout(() => {
      gsap.to(overlay, {
        clipPath: 'circle(0% at 50% 0%)',
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(overlay, { display: 'none' })
        }
      })
    }, 300) // Increased delay to ensure content is fully loaded
  }
  
  // Setup on client-side
  if (process.client) {
    // Handle page load transition
    nuxtApp.hook('app:mounted', () => {
      // Minimal delay to ensure everything is ready
      setTimeout(() => {
        handlePageLoad()
      }, 200)
      
      setTimeout(() => {
        interceptNuxtLinks()
      }, 500)
    })
    
    // Handle browser back/forward
    window.addEventListener('popstate', handlePopState)
    
    // Handle page visibility changes (for better UX)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isTransitioning) {
        // Reset if stuck in transition state
        isTransitioning = false
        if (transitionOverlay) {
          gsap.set(transitionOverlay, { display: 'none' })
        }
      }
    })
    
    // Clean up on app unmount
    nuxtApp.hook('app:beforeUnmount', () => {
      window.removeEventListener('popstate', handlePopState)
      if (transitionOverlay && transitionOverlay.parentNode) {
        transitionOverlay.parentNode.removeChild(transitionOverlay)
      }
    })
  }
  
  // Provide the function to Nuxt app
  return {
    provide: {
      waveTransition: createWaveTransition
    }
  }
})