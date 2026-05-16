<template>
  <input
    type="tel"
    :value="phone"
    @input="onInput"
    placeholder="+999 99 999-99-99"
    class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white outline-none focus:border-white"
  />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: String
});

const emit = defineEmits(["update:modelValue"]);

const phone = ref(props.modelValue || "");

watch(
  () => props.modelValue,
  (val) => {
    phone.value = val || "";
  }
);

const onInput = (e) => {
  let digits = e.target.value.replace(/\D/g, "");

  digits = digits.slice(0, 12);

  let result = "+";

  if (digits.length > 0) result += digits.slice(0, 3);
  if (digits.length > 3) result += " " + digits.slice(3, 5);
  if (digits.length > 5) result += " " + digits.slice(5, 8);
  if (digits.length > 8) result += "-" + digits.slice(8, 10);
  if (digits.length > 10) result += "-" + digits.slice(10, 12);

  phone.value = result;
  emit("update:modelValue", result);
};
</script>
