// plugins/wave-transition.client.js
import { gsap } from "gsap";

// Global transition state
let transitionOverlay = null;
let isTransitioning = false;
let isInitialLoad = true;

// Immediately hide page content with CSS until wave transition is ready
if (process.client && !window.waveInitialized) {
  window.waveInitialized = true;

  // Create CSS to hide content immediately
  const style = document.createElement("style");
  style.id = "wave-initial-hide";
  style.textContent = `
    body { visibility: hidden !important; }
    #wave-transition-overlay { visibility: visible !important; }
  `;

  // Insert CSS as early as possible
  if (document.head) {
    document.head.appendChild(style);
  } else {
    // If head doesn't exist yet, create it
    const head = document.createElement("head");
    head.appendChild(style);
    if (document.documentElement) {
      document.documentElement.appendChild(head);
    }
  }
}

// Create overlay immediately when script loads
const createOverlay = () => {
  if (transitionOverlay) return transitionOverlay;

  transitionOverlay = document.createElement("div");
  transitionOverlay.id = "wave-transition-overlay";
  transitionOverlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: #f2f1f0 !important;
    z-index: 999999 !important;
    pointer-events: none !important;
    display: block !important;
    visibility: visible !important;
    clip-path: circle(150% at 50% 100%) !important;
  `;

  // Append to body or html if body doesn't exist
  const target = document.body || document.documentElement;
  if (target) {
    target.appendChild(transitionOverlay);
  }

  return transitionOverlay;
};

// Initialize overlay and styles immediately
if (process.client) {
  // Create overlay as soon as possible
  const initializeOverlay = () => {
    createOverlay();
  };

  // Try multiple approaches to initialize as early as possible
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeOverlay);
  } else {
    initializeOverlay();
  }

  // Also try immediate initialization
  setTimeout(initializeOverlay, 0);
}

// Create global transition function
const createWaveTransition = (callback, skipCallback = false) => {
  if (isTransitioning) return Promise.resolve();

  return new Promise((resolve) => {
    isTransitioning = true;
    const overlay = createOverlay();

    // Show overlay and start wave animation
    gsap.set(overlay, {
      display: "block",
      visibility: "visible",
      clipPath: "circle(0% at 50% 100%)",
    });

    // Wave expanding upward
    gsap.to(overlay, {
      clipPath: "circle(150% at 50% 100%)",
      duration: 0.4, // Faster expand
      ease: "power2.out", // More dynamic easing
      onComplete: () => {
        // Navigate *after* the wave has fully covered the screen
        if (callback && !skipCallback) {
          callback();
        }
        
        // Small delay to ensure navigation is processed, then close the wave
        setTimeout(() => {
          gsap.to(overlay, {
            clipPath: "circle(0% at 50% 0%)",
            duration: 0.4, // Faster close
            ease: "power2.in", // More dynamic easing
            onComplete: () => {
              gsap.set(overlay, { display: "none" });
              isTransitioning = false;
              resolve();
            },
          });
        }, 50); // Reduced delay for smoother transition
      },
    });
  });
};

// Make it globally available
if (process.client) {
  window.waveTransition = createWaveTransition;
}

export default defineNuxtPlugin((nuxtApp) => {
  // Intercept all NuxtLink clicks globally
  const interceptNuxtLinks = () => {
    // Function to handle link clicks
    const handleLinkClick = async (event) => {
      const link = event.currentTarget;
      const href = link.getAttribute("href") || link.getAttribute("to");

      // Skip if it's not a local navigation
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("tel") ||
        href.startsWith("#")
      ) {
        return;
      }

      // Skip if it's the same route
      const currentPath = window.location.pathname;
      if (href === currentPath) {
        event.preventDefault();
        return;
      }

      // Prevent default navigation
      event.preventDefault();

      // Create wave transition and navigate
      await createWaveTransition(() => {
        navigateTo(href);
      });
    };

    // Intercept existing and future NuxtLinks
    const observer = new MutationObserver(() => {
      const links = document.querySelectorAll(
        'a[href]:not([href^="http"]):not([href^="mailto"]):not([href^="tel"]):not([href^="#"]), a[to], button[data-wave-transition]'
      );

      links.forEach((link) => {
        if (!link.hasAttribute("data-wave-intercepted")) {
          link.setAttribute("data-wave-intercepted", "true");
          link.addEventListener("click", handleLinkClick, { passive: false });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial setup for existing links
    setTimeout(() => {
      const links = document.querySelectorAll(
        'a[href]:not([href^="http"]):not([href^="mailto"]):not([href^="tel"]):not([href^="#"]), a[to], button[data-wave-transition]'
      );
      links.forEach((link) => {
        if (!link.hasAttribute("data-wave-intercepted")) {
          link.setAttribute("data-wave-intercepted", "true");
          link.addEventListener("click", handleLinkClick, { passive: false });
        }
      });
    }, 100);
  };

  // Handle browser navigation (back/forward buttons)
  const handlePopState = () => {
    createWaveTransition(null, true);
  };

  // Handle page load transition
  const handlePageLoad = () => {
    if (!isInitialLoad) return;
    isInitialLoad = false;

    const overlay = transitionOverlay || createOverlay();

    // Ensure overlay is covering the screen
    gsap.set(overlay, {
      display: "block",
      visibility: "visible",
      clipPath: "circle(150% at 50% 100%)",
    });

    // Remove the initial hide styles and show content
    const hideStyle = document.getElementById("wave-initial-hide");
    if (hideStyle) {
      hideStyle.remove();
    }

    // Make body visible but keep it hidden behind overlay
    document.body.style.visibility = "visible";

    // Wait then animate wave out to reveal content
    setTimeout(() => {
      gsap.to(overlay, {
        clipPath: "circle(0% at 50% 0%)",
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
        },
      });
    }, 400);
  };

  // Setup on client-side
  if (process.client) {
    // Handle page load transition
    nuxtApp.hook("app:mounted", () => {
      setTimeout(() => {
        handlePageLoad();
      }, 100);

      setTimeout(() => {
        interceptNuxtLinks();
      }, 500);
    });

    // Fallback in case app:mounted doesn't fire quickly enough
    setTimeout(() => {
      if (isInitialLoad) {
        handlePageLoad();
      }
    }, 1000);

    // Handle browser back/forward
    window.addEventListener("popstate", handlePopState);

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && isTransitioning) {
        isTransitioning = false;
        if (transitionOverlay) {
          gsap.set(transitionOverlay, { display: "none" });
        }
      }
    });

    // Emergency fallback - ensure content is visible after 3 seconds
    setTimeout(() => {
      const hideStyle = document.getElementById("wave-initial-hide");
      if (hideStyle) {
        hideStyle.remove();
        document.body.style.visibility = "visible";
      }
    }, 3000);

    // Clean up on app unmount
    nuxtApp.hook("app:beforeUnmount", () => {
      window.removeEventListener("popstate", handlePopState);
      if (transitionOverlay && transitionOverlay.parentNode) {
        transitionOverlay.parentNode.removeChild(transitionOverlay);
      }
    });
  }

  // Provide the function to Nuxt app
  return {
    provide: {
      waveTransition: createWaveTransition,
    },
  };
});
