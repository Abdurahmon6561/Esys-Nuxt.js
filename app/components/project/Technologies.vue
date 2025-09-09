<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div class="md:flex justify-center gap-[43px] p-10 mt-[88px] mb-[88px]">
    <div>
      <img
        src="/images/technologies-left.webp"
        alt="image"
        class="md:w-[224px] md:h-[224px] object-cover mt-12"
      />
    </div>

    <div>
      <div class="flex justify-center">
        <h1
          class="md:text-[62px] font-medium text-center leading-[67px] md:w-[712px]"
        >
          {{ t("technologies.title") }}
        </h1>
      </div>
      <p class="w-[617px] md:text-[27px] font-normal mt-8 text-center">
        {{ t("technologies.text") }}
      </p>
      <div class="flex justify-center items-center mt-12">
        <button
          class="px-5 hover:bg-[#EEE] text-[#080808] border-2 rounded-full p-2 border-[#EEE] font-medium"
        >
          {{ t("technologies.book_call") }}
        </button>
      </div>
    </div>

    <div>
      <img
        src="/images/technologies-right.webp"
        alt="image"
        class="md:w-[224px] md:h-[224px] object-cover mt-36"
      />
    </div>
  </div>
</template>
