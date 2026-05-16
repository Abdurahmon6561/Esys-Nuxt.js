<script setup>
import { useI18n } from "vue-i18n";
import { useApiService } from "../composables/useApiService";
import { watch, onMounted, ref, computed } from "vue";
import { useWaveTransition } from "../composables/useWaveTransition";

const { t, locale } = useI18n();
const { servicesApi } = useApiService();
const { navigateWithWave } = useWaveTransition();

const services = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchServices = async () => {
  try {
    loading.value = true;
    error.value = null;

    const response = await servicesApi.getServices();
    services.value = (response.data || response).slice(0, 4);
  } catch (err) {
    error.value = err.message || "Failed to fetch services";
    console.error("Error fetching services:", err);
  } finally {
    loading.value = false;
  }
};

watch(locale, fetchServices);

onMounted(fetchServices);

const gridClass = computed(() => {
  if (services.value.length === 4) {
    return "md:grid-cols-2";
  }
  return "md:grid-cols-3";
});

const goToContact = () => {
  navigateWithWave('/contact');
};
</script>

<template>
  <div class="container mx-auto mt-[80px] mb-[80px]">
    <!-- Header -->
    <div>
      <div class="flex justify-center items-center">
        <h3
          class="text-sm text-[#080808] border-2 rounded-full p-2 border-[#EEE]"
        >
          {{ t("hero.our_projects") }}
        </h3>
      </div>

      <h1
        class="md:text-[60px] text-[40px] text-[#080808] font-medium mt-[19px] text-center"
      >
        {{ t("services.title") }} 
      </h1>
    </div>

    <div
      class="grid gap-6 bg-[#ededed] md:p-8 p-4 rounded-xl mt-[48px]"
      :class="gridClass"
    >
      <!-- Card -->
      <div
        v-for="service in services"
        :key="service.id"
        class="flex flex-col justify-between bg-white rounded-xl md:p-10 p-4"
      >
        <div>
          <h2 class="md:text-[24px] text-[18px] text-[#080808] font-medium">
            {{ service.title }}
          </h2>

          <p
            class="text-[16px] text-[#080808] mt-3"
            v-html="service.text"
          />
        </div>

        <!-- Button -->
        <button
          @click="goToContact"
          class="w-full bg-white rounded-xl cursor-pointer md:p-4 p-2 flex items-center justify-between mt-5 border-2 border-[#e0e0e0] hover:bg-gray-100 transition"
        >
          <span class="text-[16px] font-medium">
            {{ t("services.order") }}
          </span>

          <span
            class="flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[#e0e0e0] hover:bg-gray-200 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>