<script setup>
// Page transition functions
async function onBeforeEnter(el) {
  if (process.client) {
    const { gsap } = await import('gsap')
    gsap.set(el, {
      opacity: 0,
      y: 50,
      scale: 0.98
    })
  }
}

async function onEnter(el, done) {
  if (process.client) {
    const { gsap } = await import("gsap")

    // Reset scroll when entering
    if (window.smoother) {
      window.smoother.scrollTo(0, true) 
    } else {
      window.scrollTo({ top: 0, behavior: "instant" }) // Use instant instead of smooth
    }

    // Add slight delay to ensure DOM is ready
    setTimeout(() => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        onComplete: done
      })
    }, 50)
  } else {
    done()
  }
}


async function onLeave(el, done) {
  if (process.client) {
    const { gsap } = await import('gsap')
    gsap.to(el, {
      opacity: 0,
      y: -30,
      scale: 1.02,
      duration: 0.4,
      ease: "power2.in",
      onComplete: done
    })
  } else {
    done()
  }
}
</script>

<template>
  <NuxtLayout>
    <Transition
      name="page"
      mode="out-in"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @leave="onLeave"
      :css="false"
    >
      <NuxtPage />
    </Transition>
  </NuxtLayout>
</template>
