<script setup>
import { ref, onMounted } from "vue";
import gsap from "gsap";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router"; // ✅ import router


const { t } = useI18n();
const router = useRouter(); // ✅ init router


const cardsRef = ref([]);

const cards = [
  {
    image: "/images/man.webp",
    title: "Wonder Comfort",
    tech: "Laravel, PHP, JavaScript, Figma, Vue.js",
    tags: [t("projects.tags.websites")],
  },
  {
    image: "/images/soundBar.webp",
    title: "Sound Bar",
    tech: "Laravel, JavaScript, Figma, Flutter, Vue.js",
    link: "https://soundbar010.com/",
    tags: [t("projects.tags.websites"), t("projects.tags.mobile_apps")],
  },
  {
    image: "/images/car.webp",
    title: t("projects.car_card_title"),
    tech: "Laravel, PHP, JavaScript, Figma, Vue.js",
    link: "https://asacar.uz/",
    tags: [t("projects.tags.websites")],
  },
  {
    image: "/images/bbd.jpg",
    title: "BBD",
    tech: "Laravel, PHP, MySQL, JavaScript",
    link: "https://bbd.uz/",
    tags: [t("projects.tags.websites")],
  },
];

// ✅ when clicking eye
const openProject = (card) => {
  localStorage.setItem("selectedProject", JSON.stringify(card)); // save project
  router.push("/view"); // go to view.vue
};

onMounted(async () => {
  await nextTick();

  // Animate each card's cursor inside
  cardsRef.value.forEach((card) => {
    const cursor = card.querySelector(".card-cursor");

    // move cursor inside card only
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(cursor, {
        x,
        y,
        duration: 0.2,
        ease: "power3.out",
      });
    });

    // show on enter
    card.addEventListener("mouseenter", () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.2 });
    });

    // hide on leave
    card.addEventListener("mouseleave", () => {
      gsap.to(cursor, { scale: 0.5, opacity: 0, duration: 0.2 });
    });
  });
});
</script>

<template>
  <div class="container mx-auto mb-[80px] mt-[64px]" id="projects">
    <div>
      <div>
        <div class="flex flex-wrap justify-center gap-[32px] mt-12">
          <!-- Cards -->
          <div
            v-for="(card, i) in cards"
            :key="i"
            :ref="(el) => (cardsRef[i] = el)"
            class="relative rounded-xl overflow-hidden shadow-xl md:h-[501px] md:w-[656px] project-cards"
          >
            <img
              :src="card.image"
              alt="Project"
              class="w-full h-full object-cover"
            />

            <!-- Custom Cursor INSIDE Card (Clickable) -->
            <div class="card-cursor" @click="openProject(card)">
          <svg
            class="eye-svg"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Eye outline -->
            <path
              d="M2 32C10 16 22 8 32 8s22 8 30 24c-8 16-20 24-30 24S10 48 2 32Z"
              fill="none"
              stroke="white"
              stroke-width="4"
            />
            <!-- Eyeball -->
            <circle cx="32" cy="32" r="8" fill="white" />
            <!-- Pupil -->
            <circle cx="32" cy="32" r="4" fill="black" />
            <!-- Eyelid -->
            <rect
              class="eyelid"
              x="0"
              y="0"
              width="64"
              height="32"
              fill="black"
            />
          </svg>
        </div>

            <!-- Category -->
            <div class="absolute top-3 left-3 flex gap-1 z-10">
              <span
                v-for="(tag, t) in card.tags"
                :key="t"
                class="bg-white text-gray-800 text-sm px-3 py-1 rounded-full shadow"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Button -->
            <a :href="card.link" target="_blank">
              <button
                class="absolute bottom-6 left-[20px] right-[20px] backdrop-blur-md bg-white/30 rounded-xl shadow md:p-4 p-2 md:w-[608px] md:h-[89px] flex items-center justify-between hover:bg-white/40 transition"
              >
                <div class="text-left">
                  <h3
                    :class="[
                      'md:text-[24px] font-medium',
                      i === 1 ? 'text-black' : 'text-white',
                    ]"
                  >
                    {{ card.title }}
                  </h3>
                  <p
                    :class="[
                      'md:text-[14px]',
                      i === 1 ? 'text-black' : 'text-white',
                    ]"
                  >
                    {{ card.tech }}
                  </p>
                </div>
                <div
                  class="flex items-center justify-center md:w-12 md:h-12 w-[30px] h-[30px] rounded-xl border-2 border-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-white"
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
                </div>
              </button>
            </a>
          </div>
        </div>
      </div>
      <div class="flex justify-center items-center mt-12">
        <button
          class="px-5 text-[#080808] border-2 rounded-full p-2 border-[#EEE] font-medium"
        >
          {{ t("projects.more_projects") }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-cursor {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%) scale(0.5);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;
  opacity: 0;
  z-index: 20;
}

@media (max-width: 768px) {
  .card-cursor {
    display: none;
  }
}

.eye-svg {
  width: 30px;
  height: 30px;
  animation: blink 2s infinite;
}

/* Eyelid moves up and down */
.eyelid {
  animation: closeEye 2s infinite;
  transform-origin: top;
}

@keyframes closeEye {
  0%,
  90%,
  100% {
    transform: translateY(-32px);
  }
  95% {
    transform: translateY(0);
  }
}

@keyframes blink {
  0%,
  90%,
  100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
}
</style>
