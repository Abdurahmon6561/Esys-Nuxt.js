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

<!-- in this code made the Contact Form  responsive responsible -->
<template>
  <div class="mb-[80px]">
    <section
      ref="heroSection"
      id="smooth-wrapper"
      class="relative flex items-center justify-center min-h-[calc(100vh-3rem)] rounded-lg overflow-hidden bg-[#011424]"
    >
      <!-- Lottie Background -->
      <div class="absolute inset-0 w-full h-full ml-[333px]">
        <iframe
          src="https://lottie.host/embed/26a23b78-f8b5-47be-bb92-563ca44820d6/v0gXWgZoaH.lottie"
          class="w-full h-full"
        ></iframe>
      </div>

      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/40 rounded-lg"></div>

      <!-- Contact Form -->
      <div
        class="relative z-10 w-full max-w-lg md:p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
      >
        <h2 v-if="locale === 'en'" class="text-3xl font-bold text-white mb-6">
          Get in Touch
        </h2>
        <h2 v-if="locale === 'uz'" class="text-3xl font-bold text-white mb-6">
          Aloqa qiling
        </h2>
        <h2 v-if="locale === 'ru'" class="text-3xl font-bold text-white mb-6">
          Свяжитесь с нами
        </h2>

        <form class="space-y-6" @submit="handleSubmit">
          <!-- Name -->
          <div class="relative">
            <label
              for="name"
              class="block mb-1 text-sm font-medium text-gray-300"
            >
              <span v-if="locale === 'en'">Your name</span>
              <span v-if="locale === 'uz'">Ismingiz</span>
              <span v-if="locale === 'ru'">Ваше имя</span>
            </label>

            <input
              type="text"
              id="name"
              v-model="name"
              required
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-[#1aab9a] focus:ring-0 outline-none"
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
              <span v-if="locale === 'en'">Email</span>
              <span v-if="locale === 'uz'">Email</span>
              <span v-if="locale === 'ru'">Почта</span>
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
              <span v-if="locale === 'en'">Phone</span>
              <span v-if="locale === 'uz'">Telefon</span>
              <span v-if="locale === 'ru'">Телефон</span>
            </button>
          </div>

          <!-- Email Input -->
          <div v-if="selectedTab === 'email'" class="relative">
            <label
              for="email"
              class="block mb-1 text-sm font-medium text-gray-300"
            >
              <span v-if="locale === 'en'">Your email</span>
              <span v-if="locale === 'uz'">Elektron pochta</span>
              <span v-if="locale === 'ru'">Ваша почта</span>
            </label>

            <input
              type="email"
              id="email"
              v-model="email"
              required
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-[#1aab9a] focus:ring-0 outline-none"
            />
          </div>

          <!-- Phone Input -->
          <div v-if="selectedTab === 'phone'" class="relative">
            <label
              for="phone"
              class="block mb-1 text-sm font-medium text-gray-300"
            >
              <span v-if="locale === 'en'">Your phone</span>
              <span v-if="locale === 'uz'">Telefon raqamingiz</span>
              <span v-if="locale === 'ru'">Ваш телефон</span>
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
              <span v-if="locale === 'en'">Your message</span>
              <span v-if="locale === 'uz'">Xabaringiz</span>
              <span v-if="locale === 'ru'">Ваше сообщение</span>
            </label>
            <textarea
              id="message"
              v-model="message"
              rows="4"
              required
              class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white focus:border-[#1aab9a] focus:ring-0 outline-none resize-none"
            ></textarea>
          </div>

          <!-- Button -->
          <button
            type="submit"
            class="w-full py-3 rounded-xl bg-[#1aab9a] text-white font-semibold shadow-lg hover:bg-[#159482] transition-all"
          >
            <span v-if="locale === 'en'">Send</span>
            <span v-if="locale === 'uz'">Yuborish</span>
            <span v-if="locale === 'ru'">Отправить</span>
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
