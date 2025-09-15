<!-- where is the mistake in getting the tech ? -->
<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useLocalePath } from "#i18n";

const { t } = useI18n();
const router = useRouter();
const localePath = useLocalePath();

const blogs = [
  {
    title: t("blog_cards.first_title"),
    image:
      "https://xrn-a2s-98a-sa7.esys.pro/storage/blogs/main-images/2/lyHb6yFSDNdzDSMrII3iptLs0ekGoKWQ8rzOWH6W.webp",
    date: "2025-08-11",
    tech: ["AI", "Web", "No-code", "Low-code"],
  },
  {
    title: t("blog_cards.second_title"),
    image:
      "https://xrn-a2s-98a-sa7.esys.pro/storage/blogs/main-images/1/Z8x2Q2tC1jwsJs4Gc8vWiJMtm9ORLgPWqxJnrlDS.webp",
    date: "2025-08-11",
    tech: ["Разработка сайта", "CRM система", "Оптимизация бюджета", "Веб-разработка"],
  },
];

const openBlog = (card) => {
  localStorage.setItem("selectedBlog", JSON.stringify(card));
  router.push(localePath("/blog-view"));
};
</script>

<template>
  <div class="mt-[120px] max-w-7xl mx-auto space-y-16 mb-[120px]">
    <div
      v-for="(card, index) in blogs"
      :key="index"
      @click="openBlog(card)"
      class="group flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-2xl bg-white transform transition duration-300 hover:scale-[1.02] cursor-pointer"
    >
      <div class="flex-1">
        <h2
          class="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-[#1aab9a]"
        >
          {{ card.title }}
        </h2>
        <p class="mt-5 text-sm text-gray-400">{{ card.date }}</p>
      </div>
      <div class="flex-shrink-0 w-full md:w-[420px]">
        <img
          :src="card.image"
          alt="image"
          class="rounded-xl w-full h-[260px] object-cover transition duration-300 filter opacity-50 group-hover:opacity-100"
        />
      </div>
    </div>
  </div>
</template>
