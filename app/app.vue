<template>
  <Navbar />
  <NuxtPage />
  <SiteFooter />
  <ClientOnly>
    <CookieBanner />
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
  font-family: "Poppins", sans-serif;
}
</style>
