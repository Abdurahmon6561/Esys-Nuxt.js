<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div
    class="flex flex-col md:flex-row justify-center items-center gap-[43px] p-6 md:p-10 mt-[88px] mb-[88px]"
  >
    <!-- Left Image -->
    <div class="flex justify-center md:block">
      <img
        src="/images/technologies-left.webp"
        alt="image"
        class="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[224px] md:h-[224px] object-cover mt-6 md:mt-12"
      />
    </div>

    <!-- Center Text -->
    <div class="text-center max-w-full md:max-w-[712px]">
      <h1
        class="text-2xl sm:text-4xl md:text-[62px] font-medium leading-tight md:leading-[67px]"
      >
        {{ t("technologies.title") }}
      </h1>

      <p
        class="mt-6 sm:mt-8 text-base sm:text-lg md:text-[27px] font-normal mx-auto max-w-[95%] md:max-w-[617px]"
      >
        {{ t("technologies.text") }}
      </p>

      <div class="flex justify-center items-center mt-8 sm:mt-12">
        <button
          class="px-5 py-2 border-2 border-[#EEE] rounded-full font-medium text-[#080808] hover:bg-[#EEE] text-sm sm:text-base"
        >
          {{ t("technologies.book_call") }}
        </button>
      </div>
    </div>

    <!-- Right Image -->
    <div class="justify-center md:block hidden">
      <img
        src="/images/technologies-right.webp"
        alt="image"
        class="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[224px] md:h-[224px] object-cover mt-10 md:mt-36"
      />
    </div>
  </div>
</template>
