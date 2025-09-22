<script setup>
import { ref, onMounted } from "vue";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useI18n } from "vue-i18n";
import gsap from "gsap";

const { t, locale, availableLocales } = useI18n();

console.log("current locale:", locale.value);
console.log("available:", availableLocales);
console.log("test key:", t("contact.title"));

const selectedTab = ref("email");
const phone = ref("");
const name = ref("");
const email = ref("");
const message = ref("");

// Format phone input
const formatPhone = (e) => {
  let value = e.target.value;

  if (value.startsWith("+")) {
    value = "+" + value.slice(1).replace(/\D/g, "");
  } else {
    value = value.replace(/\D/g, "");
  }

  phone.value = value;
};
// Submit form
const handleSubmit = (e) => {
  e.preventDefault();

  if (!name.value || !message.value) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  if (selectedTab.value === "email" && !email.value) {
    showToast("Please enter your email", "error");
    return;
  }

  if (selectedTab.value === "phone" && !phone.value) {
    showToast("Please enter your phone number", "error");
    return;
  }

  showToast(t("toastify.success_send"), "success");

  // reset
  name.value = "";
  email.value = "";
  phone.value = "";
  message.value = "";
};

// Toastify function
const showToast = (text, type) => {
  Toastify({
    text,
    duration: 3000,
    gravity: "top",
    position: "right",
    style: {
      background: type === "success" ? "white" : "crimson",
      color: type === "success" ? "black" : "white",
      borderRadius: "8px",
      padding: "10px 20px",
    },
  }).showToast();
};

onMounted(() => {
  // Set initial state
  gsap.set(".form-contact", {
    opacity: 0,
    scale: 0.8,
  });
  
  // Animate to final state
  gsap.to(".form-contact", {
    opacity: 1,
    scale: 1,
    duration: 2.2,
    ease: "power3.out",
  });
});
</script>

<!-- in this code made the Contact Form  responsive responsible -->
<template>
  <div class="mb-[80px]">
    <section
      ref="heroSection"
      id="smooth-wrapper"
      class="relative flex items-center justify-center min-h-[calc(100vh-3rem)] rounded-lg overflow-hidden bg-[#011424]"
    >
      <!-- Lottie Background -->
      <div class="absolute inset-0 w-full h-full md:ml-[333px]">
        <iframe
          src="https://lottie.host/embed/26a23b78-f8b5-47be-bb92-563ca44820d6/v0gXWgZoaH.lottie"
          class="w-full h-full"
        ></iframe>
      </div>

      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/40 rounded-lg"></div>

      <!-- Contact Form -->
      <div
        class="relative form-contact z-10 w-[90%] sm:w-[85%] md:w-full max-w-lg p-6 md:p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
      >
        <h2
          class="text-xl sm:text-2xl md:text-[46px] font-medium text-white mb-9 text-center md:text-left leading-snug"
        >
          {{ t("contact.title") }}
        </h2>

        <form class="space-y-6" @submit="handleSubmit">
          <!-- Name -->
          <div class="relative">
            <input
              type="text"
              id="name"
              v-model="name"
              required
              :placeholder="t('contact.name')"
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-white focus:ring-0 outline-none"
            />
          </div>

          <!-- Tabs -->
          <div
            class="relative flex flex-col sm:flex-row rounded-lg bg-white/10 overflow-hidden"
          >
            <!-- Sliding background indicator -->
            <div
              class="absolute bg-white transition-all duration-500 ease-in-out"
              :class="[
                // Desktop (row layout)
                'sm:top-0 sm:bottom-0 sm:w-1/2 sm:h-full',
                // Mobile (col layout)
                'top-0 left-0 w-full h-1/2',
                selectedTab === 'email'
                  ? 'sm:left-0 sm:top-0 left-0 top-0'
                  : 'sm:left-1/2 sm:top-0 left-0 top-1/2',
              ]"
            ></div>

            <!-- Email -->
            <button
              type="button"
              @click="selectedTab = 'email'"
              class="flex-1 sm:h-[41px] h-12 z-10 relative text-sm md:text-base font-medium transition-all cursor-pointer"
              :class="selectedTab === 'email' ? 'text-black' : 'text-gray-300'"
            >
              {{ t("contact.email") }}
            </button>

            <!-- Phone -->
            <button
              type="button"
              @click="selectedTab = 'phone'"
              class="flex-1 sm:h-[41px] h-12 z-10 relative text-sm md:text-base font-medium transition-all cursor-pointer"
              :class="selectedTab === 'phone' ? 'text-black' : 'text-gray-300'"
            >
              {{ t("contact.phone") }}
            </button>
          </div>

          <!-- Email Input -->
          <div v-if="selectedTab === 'email'" class="relative">
            <input
              type="email"
              id="email"
              v-model="email"
              required
              placeholder="example@gmail.com"
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-white focus:ring-0 outline-none"
            />
          </div>

          <!-- Phone Input -->
          <div v-if="selectedTab === 'phone'" class="relative">
            <input
              type="tel"
              id="phone"
              v-model="phone"
              @input="formatPhone"
              required
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-white focus:ring-0 outline-none"
              placeholder="+998901234567"
            />
          </div>

          <!-- Message -->
          <div class="relative">
            <textarea
              id="message"
              v-model="message"
              rows="4"
              required
              :placeholder="t('contact.message')"
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-white focus:ring-0 outline-none resize-none"
            ></textarea>
          </div>

          <!-- Button -->
          <button
            type="submit"
            class="w-full md:px-6 px-6 text-[13px] cursor-pointer md:text-[15px] h-[41px] bg-white text-black rounded-full font-medium hover:bg-gray-200 hover:shadow-2xl transition-transform duration-700"
          >
            <span>{{ t("contact.send") }}</span>
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<style>
/* 👇 Slower fade-in/out animation */
.custom-toast {
  animation: fadeInOut 1s ease forwards; /* 1s instead of 0.3s */
}

@keyframes fadeInOut {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
