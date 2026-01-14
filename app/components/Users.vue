<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import gsap from "gsap";
import { useApiService } from "~/composables/useApiService";
import { useI18n } from "vue-i18n";

const { reviewsApi } = useApiService();
const { t, locale } = useI18n();

const testimonials = ref([]);
const current = ref(0);
const usersArrow = ref(null);
const loading = ref(false);
const error = ref(null);
let arrowInitialX = 0;
const proximityThreshold = 100;

const fetchTestimonials = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await reviewsApi.getReviews();
    const rawData = response.data || response;
    
    if (Array.isArray(rawData)) {
      testimonials.value = rawData.map((item, index) => ({
        id: index + 1,
        name: item.name,
        role: item.company || item.role,
        text: item.text,
        avatar: item.avatar || '/images/default-avatar.png'
      }));
    } else {
      console.warn("Unexpected API response format:", response);
      testimonials.value = [];
    }
  } catch (err) {
    console.error("Failed to fetch testimonials:", err);
    error.value = t("api.fetch_error") || "Failed to load testimonials";
    testimonials.value = []; 
  } finally {
    loading.value = false;
  }
};

watch(
  locale,
  () => {
    fetchTestimonials();
  },
  { immediate: false }
);

const prev = () => {
  current.value =
    (current.value - 1 + testimonials.value.length) % testimonials.value.length;
};

const next = () => {
  current.value = (current.value + 1) % testimonials.value.length;
};

const moveUsersArrow = (e) => {
  if (!usersArrow.value) return;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const rect = usersArrow.value.getBoundingClientRect();
  const arrowCenterX = rect.left + rect.width / 2;
  const arrowCenterY = rect.top + rect.height / 2;

  const distanceX = Math.abs(mouseX - arrowCenterX);
  const distanceY = Math.abs(mouseY - arrowCenterY);

  if (distanceX <= proximityThreshold && distanceY <= proximityThreshold) {
    const offsetX = mouseX - arrowCenterX;

    gsap.to(usersArrow.value, {
      x: offsetX,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  } else {
    gsap.to(usersArrow.value, {
      x: arrowInitialX,
      duration: 0.8,
      ease: "sine.out",
    });
  }
};

const scrollDown = () => {
  const servicesSection = document.getElementById('services-section');
  
  if (servicesSection) {
    const rect = servicesSection.getBoundingClientRect();
    const offsetTop = rect.top + window.pageYOffset;
    const windowHeight = window.innerHeight;
    const elementHeight = rect.height;
    
    const scrollToPosition = offsetTop - (windowHeight / 2) + (elementHeight / 2);
    
    window.scrollTo({
      top: scrollToPosition,
      behavior: "smooth",
    });
  }
};

onMounted(() => {
  fetchTestimonials();
  
  gsap.to(usersArrow.value, {
    y: "+=10",
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  window.addEventListener("mousemove", moveUsersArrow);
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", moveUsersArrow);
});
</script>

<template>
  <div class="p-4 sm:p-6 bg-[#ededed] rounded-xl">
    <div
      class="relative flex items-center justify-center min-h-[calc(100vh-3rem)] bg-cover bg-center hero rounded-lg"
      style="background-image: url('/images/bg-avatar.webp')"
    >
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center w-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1aab9a]"></div>
      </div>
      
      <!-- Card wrapper -->
      <div v-else class="w-full max-w-[576px] px-4 sm:px-6 lg:px-0">
        <Transition name="fade-slide" mode="out-in">
          <div
            :key="testimonials[current]?.id || current"
            class="bg-white rounded-2xl shadow-md p-6 sm:p-8 text-center relative"
            v-if="testimonials.length > 0"
          >
            <!-- Avatar -->
            <div class="flex justify-center -mt-16 sm:-mt-20 mb-4">
              <img
                :src="testimonials[current].avatar"
                :alt="testimonials[current].name"
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shadow-md p-1 bg-white"
                @error="($event) => $event.target.src='/images/default-avatar.png'"
              />
            </div>

            <!-- Text -->
            <p class="text-gray-700 text-sm sm:text-base leading-relaxed">
              {{ testimonials[current].text }}
            </p>

            <!-- Name + Role -->
            <div class="mt-6">
              <h3 class="font-semibold text-gray-900 text-base sm:text-lg">
                {{ testimonials[current].name }}
              </h3>
              <p class="text-[#080808] text-xs sm:text-sm">
                {{ testimonials[current].role }}
              </p>
            </div>

            <!-- Arrows -->
            <div
              class="flex justify-between mt-4 sm:mt-6"
              v-if="testimonials.length > 1"
            >
              <button
                @click="prev"
                class="flex items-center cursor-pointer justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-gray-100 hover:bg-gray-200 rotate-180 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 sm:h-6 sm:w-6 text-gray-700"
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
              </button>

              <button
                @click="next"
                class="flex items-center cursor-pointer justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-gray-100 hover:bg-gray-200 transition-all duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 sm:h-6 sm:w-6 text-gray-700"
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
              </button>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="bg-white rounded-2xl shadow-md p-6 sm:p-8 text-center">
            <p class="text-gray-500">{{ t("api.no_data") || "No testimonials available" }}</p>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Floating users arrow (hidden on small screens) -->
    <div class="flex justify-center">
      <button
        ref="usersArrow"
        @click="scrollDown"
        class="relative mt-[-40px] sm:mt-[-50px] cursor-pointer z-50 hidden md:block"
      >
        <img src="/images/users-arrow.svg" alt="users arrow" />
        <div
          class="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <img
            src="/images/arrow-down-hero.png"
            alt="arrow"
            class="z-50 w-3 h-3 sm:w-4 sm:h-4"
          />
        </div>
      </button>
    </div>
  </div>
</template>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>