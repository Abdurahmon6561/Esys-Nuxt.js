<template>
    <input type="tel" :value="phone" @input="formatPhone" placeholder="+999 99 999-99-99"
        class="w-full rounded-xl bg-transparent border border-white/30 px-4 py-3 text-white outline-none focus:border-white" />
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
    modelValue: String
});

const emit = defineEmits(["update:modelValue"]);

const phone = ref(props.modelValue || "");

watch(() => props.modelValue, val => {
    phone.value = val;
});

const formatPhone = (e) => {
    let input = e.target.value;

    let digits = input.replace(/[^\d+]/g, '');

    if (!digits.startsWith('+')) {
        digits = '+' + digits;
    }

    phone.value = digits;                
    emit('update:modelValue', digits);  
};
</script>
