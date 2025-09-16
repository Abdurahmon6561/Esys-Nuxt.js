<template>
  <div class="general-title">
    <div
      :style="{
        clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)',
        borderColor: borderColor,
      }"
      :class="`${className} border-[.5vw] text-nowrap opacity-0`"
    >
      <div
        class="pb-5 md:px-14 px-3 md:pt-0 pt-3"
        :style="{
          backgroundColor: bg,
        }"
      >
        <h2
          :style="{
            color: color,
          }"
        >
          {{ title }}
        </h2>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  bg: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  },
  borderColor: {
    type: String,
    required: true
  }
})
</script>