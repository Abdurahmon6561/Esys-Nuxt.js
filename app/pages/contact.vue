<script setup>
import { ref } from "vue";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useI18n } from "vue-i18n";
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

  showToast("Message sent successfully!", "success");

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
      background: type === "success" ? "#1aab9a" : "crimson",
      borderRadius: "8px",
      padding: "10px 20px",
    },
  }).showToast();
};
</script>

<template>
  <div class="mb-[80px]">
    <section
      ref="heroSection"
      id="smooth-wrapper"
      class="relative flex items-center justify-center min-h-[calc(100vh-3rem)] rounded-lg overflow-hidden bg-black"
    >
      <!-- Lottie Background -->
      <div class="absolute inset-0 w-full h-full">

        <iframe src="https://lottie.host/embed/0eb4ebac-df57-4850-845c-755be4c8d7b4/MmeARlMjOt.lottie" class="w-full h-full border-0"></iframe>
      </div>

      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/40 rounded-lg"></div>

      <!-- Contact Form -->
      <div
        class="relative z-10 w-full max-w-lg p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
      >
        <h2 class="text-3xl font-bold text-white mb-6">{{ t("contact.title") }}</h2>
        <form class="space-y-6" @submit="handleSubmit">
          <!-- Name -->
          <div class="relative">
            <label
              for="name"
              class="block mb-1 text-sm font-medium text-gray-300"
            >
              {{ t("contact.name") }}
            </label>
            <input
              type="text"
              id="name"
              v-model="name"
              required
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-[#1aab9a] focus:ring-0 outline-none"
              placeholder="Enter your name"
            />
          </div>

          <!-- Tabs -->
          <div class="flex space-x-2">
            <button
              type="button"
              @click="selectedTab = 'email'"
              :class="[
                'flex-1 py-2 rounded-lg font-medium transition-all',
                selectedTab === 'email'
                  ? 'bg-[#1aab9a] text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20',
              ]"
            >
              {{ t("contact.tab_email") }}
            </button>
            <button
              type="button"
              @click="selectedTab = 'phone'"
              :class="[
                'flex-1 py-2 rounded-lg font-medium transition-all',
                selectedTab === 'phone'
                  ? 'bg-[#1aab9a] text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20',
              ]"
            >
              {{ t("contact.tab_phone") }}
            </button>
          </div>

          <!-- Email Input -->
          <div v-if="selectedTab === 'email'" class="relative">
            <label
              for="email"
              class="block mb-1 text-sm font-medium text-gray-300"
            >
              {{ t("contact.email") }}
            </label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-[#1aab9a] focus:ring-0 outline-none"
              placeholder="Enter your email"
            />
          </div>

          <!-- Phone Input -->
          <div v-if="selectedTab === 'phone'" class="relative">
            <label
              for="phone"
              class="block mb-1 text-sm font-medium text-gray-300"
            >
              {{ t("contact.phone") }}
            </label>
            <input
              type="tel"
              id="phone"
              v-model="phone"
              @input="formatPhone"
              required
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-[#1aab9a] focus:ring-0 outline-none"
              placeholder="+998901234567"
            />
          </div>

          <!-- Message -->
          <div class="relative">
            <label
              for="message"
              class="block mb-1 text-sm font-medium text-gray-300"
            >
              {{ t("contact.message") }}
            </label>
            <textarea
              id="message"
              v-model="message"
              rows="4"
              required
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-[#1aab9a] focus:ring-0 outline-none resize-none"
              placeholder="Enter your message"
            ></textarea>
          </div>

          <!-- Button -->
          <button
            type="submit"
            class="w-full py-3 rounded-xl bg-[#1aab9a] text-white font-semibold shadow-lg hover:bg-[#159482] transition-all"
          >
            {{ t("contact.send") }}
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
