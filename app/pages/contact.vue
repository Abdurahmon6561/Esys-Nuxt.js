<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import gsap from "gsap";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

import PhoneInput from "../components/PhoneInput.vue";
import { sendToTelegram } from "../composables/TelegramService";

const { t } = useI18n();

let vantaEffect = null;
const selectedTab = ref("email");
const name = ref("");
const email = ref("");
const phone = ref("");
const message = ref("");

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
  const vantaContainer = document.getElementById('vanta-bg');
  if (vantaContainer && typeof window !== 'undefined') {
    vantaEffect = NET({
      el: vantaContainer,
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x048ba8,
      backgroundColor: 0x011424,
      points: 10.00,
      maxDistance: 20.00,
      spacing: 15.00,
    });
  }

  gsap.set(".form-contact", {
    opacity: 0,
    scale: 0.8,
  });

  gsap.to(".form-contact", {
    opacity: 1,
    scale: 1,
    duration: 2.2,
    ease: "power3.out",
  });
});

onUnmounted(() => {
  if (vantaEffect) {
    vantaEffect.destroy();
  }
});

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name.value || !message.value) {
    showToast(t("toastify.please_fill_fields"), "error");
    return;
  }

  if (!email.value && !phone.value) {
    showToast(t("toastify.enter_email_or_phone"), "error");
    return;
  }

  showToast(t("toastify.sending_message"), "success");

  const success = await sendToTelegram({
    name: name.value,
    email: email.value,
    phone: phone.value,
    message: message.value
  });

  if (success) {
    showToast(t("toastify.success_send"), "success");
    name.value = "";
    email.value = "";
    phone.value = "";
    message.value = "";
  } else {
    showToast(t("toastify.failed_to_send"), "error");
  }
};
</script>

<template>
  <div class="mb-[80px]">
    <section
      class="relative flex items-center justify-center min-h-[calc(100vh-3rem)] rounded-lg overflow-hidden bg-[#011424]">
      <div id="vanta-bg" class="absolute inset-0"></div>
      <div class="absolute inset-0 bg-black/40"></div>

      <div class="relative z-10 form-contact w-[90%] sm:w-[85%] md:w-full max-w-lg
           p-6 md:p-8 bg-white/10 backdrop-blur-lg
           rounded-2xl shadow-xl border border-white/20">

        <h2 class="text-xl sm:text-2xl md:text-[42px] font-medium text-white mb-9
                 text-center md:text-left">
          {{ t("contact.title") }}
        </h2>

        <form class="space-y-6" @submit="handleSubmit">
          <input v-model="name" type="text" required :placeholder="t('contact.name')" class="w-full rounded-xl bg-transparent border border-white/30
                   px-4 py-3 text-white outline-none focus:border-white" />

          <!-- Tabs -->
          <div class="relative flex flex-col sm:flex-row bg-white/10 rounded-lg overflow-hidden">
            <div class="absolute bg-white transition-all duration-500" :class="selectedTab === 'email'
              ? 'sm:left-0 sm:w-1/2 sm:h-full h-full w-full top-0'
              : 'sm:left-1/2 sm:w-1/2 sm:h-full h-full w-full top-0'"></div>

            <button type="button" @click="selectedTab = 'email'" class="relative z-10 flex-1 h-12 text-sm md:text-base"
              :class="selectedTab === 'email' ? 'text-black' : 'text-gray-300'">
              {{ t("contact.email") }}
            </button>

            <button type="button" @click="selectedTab = 'phone'" class="relative z-10 flex-1 h-12 text-sm md:text-base"
              :class="selectedTab === 'phone' ? 'text-black' : 'text-gray-300'">
              {{ t("contact.phone") }}
            </button>
          </div>

          <!-- Email -->
          <input v-if="selectedTab === 'email'" v-model="email" type="email" required placeholder="example@gmail.com"
            class="w-full rounded-xl bg-transparent border border-white/30
                   px-4 py-3 text-white outline-none focus:border-white" />

          <!-- Phone -->
          <PhoneInput v-if="selectedTab === 'phone'" v-model="phone" />

          <!-- Message -->
          <textarea v-model="message" rows="4" required :placeholder="t('contact.message')" class="w-full rounded-xl bg-transparent border border-white/30
                   px-4 py-3 text-white outline-none resize-none focus:border-white"></textarea>

          <button type="submit" class="w-full h-[41px] bg-white text-black rounded-xl
                   font-medium hover:bg-gray-200 transition">
            {{ t("contact.send") }}
          </button>
        </form>
      </div>
    </section>
  </div>
</template>
