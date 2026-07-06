// Singleton open/close state for the global contact modal. Any component can
// call useContactModal().open(); the modal (mounted once in app.vue) reacts.
import { ref } from "vue";

const isOpen = ref(false);

export function useContactModal() {
  const open = () => {
    isOpen.value = true;
  };
  const close = () => {
    isOpen.value = false;
  };
  const toggle = () => {
    isOpen.value = !isOpen.value;
  };
  return { isOpen, open, close, toggle };
}
