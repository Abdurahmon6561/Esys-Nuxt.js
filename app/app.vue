<script setup>
// i18n head: <html lang>, hreflang alternates, canonical, og:locale
const localeHead = useLocaleHead();
const config = useRuntimeConfig();

const siteUrl = config.public.siteUrl || "https://esys.pro";

// Organization schema - emitted once, site-wide
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Evolution Systems",
  url: siteUrl,
  logo: `${siteUrl}/images/logo.webp`,
  email: "hi@esys.pro",
  telephone: "+998712001133",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tashkent",
    addressCountry: "UZ",
  },
  sameAs: ["https://t.me/esys_pro", "https://www.instagram.com/esysuz"],
};

useHead(() => ({
  htmlAttrs: localeHead.value.htmlAttrs,
  link: localeHead.value.link,
  meta: localeHead.value.meta,
  titleTemplate: (chunk) =>
    chunk ? `${chunk} - Evolution Systems` : "Evolution Systems",
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify(organizationJsonLd),
    },
  ],
}));

// Default social sharing image - pages with their own ogImage override it
useSeoMeta({
  ogImage: `${siteUrl}/og-image.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: "summary_large_image",
  ogSiteName: "Evolution Systems",
});
</script>

<template>
  <Navbar />
  <NuxtPage />
  <SiteFooter />
  <ClientOnly>
    <CookieBanner />
    <ContactModal />
    <ConsultantWidget />
  </ClientOnly>
</template>

<style>
* {
  box-sizing: border-box;
}
html,
body,
#__nuxt {
  margin: 0;
  padding: 0;
  width: 100%;
}
body {
  font-family: "Montserrat", sans-serif;
}

/* Page transition: fade + subtle rise on route change. CSS-only so it
   runs SSR-safe without a GSAP import in app.vue. */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* Layout transition: plain fade (no vertical drift between layouts). */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.25s ease;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .layout-enter-active,
  .layout-leave-active {
    transition: none;
  }
  .page-enter-from,
  .page-leave-to,
  .layout-enter-from,
  .layout-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
