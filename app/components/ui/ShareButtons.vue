<script setup>
const props = defineProps({
  url: { type: String, required: true },
  title: { type: String, required: true },
});

const { t } = useI18n();

// navigator.share availability is detected only on the client (onMounted),
// so SSR markup and first client render match - no hydration mismatch.
const canNativeShare = ref(false);
const copied = ref(false);
let copyTimer = null;

onMounted(() => {
  canNativeShare.value = typeof navigator !== "undefined" && typeof navigator.share === "function";
});

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer);
});

const links = computed(() => buildShareLinks({ url: props.url, title: props.title }));

// Minimal single-colour SVG icons - no icon library, no new dependencies.
const icons = {
  telegram:
    "M21.9 4.6c.3-1.2-.9-2.2-2-1.7L2.7 9.6c-1.3.5-1.2 2.3.1 2.7l4.1 1.3 1.5 4.7c.4 1.1 1.8 1.4 2.6.5l2.1-2.1 4 3c.9.7 2.2.2 2.5-.9l2.4-14.2ZM8.8 12.9l9.4-5.9c.2-.2.5.2.3.3l-7.7 7.1-.3 3.1-1.7-4.6Z",
  whatsapp:
    "M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a14.7 14.7 0 0 1-5.9-5.2c-.6-.9-1-2-1-3 0-1.1.6-1.7.8-1.9.2-.2.5-.3.8-.3h.6c.2 0 .5 0 .7.6l.9 2.1c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.3.5.8 1.3 1.4 1.8.8.7 1.5 1 1.8 1.1.3.1.4.1.6-.1l.7-.9c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.7-.1 1.3Z",
  linkedin:
    "M4.98 3.5A2.49 2.49 0 1 0 5 8.48a2.48 2.48 0 0 0-.02-4.98ZM3 9.75h4v11.25H3V9.75Zm6.5 0h3.8v1.54h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.67h-4v-5.03c0-1.2-.02-2.75-1.67-2.75-1.68 0-1.93 1.31-1.93 2.66v5.12h-4V9.75Z",
  facebook:
    "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z",
};

async function nativeShare() {
  if (!canNativeShare.value) return;
  try {
    await navigator.share({ title: props.title, url: props.url });
  } catch (error) {
    // User cancelling the native dialog raises AbortError - ignore it. Other
    // failures fall back to the visible links, so don't surface them either.
    if (error?.name !== "AbortError") console.warn("Native share failed:", error);
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="share">
    <p class="share__label">{{ t("blog.share") }}</p>

    <div class="share__row">
      <button
        v-if="canNativeShare"
        type="button"
        class="share__btn share__btn--primary"
        @click="nativeShare"
      >
        {{ t("blog.share") }}
      </button>

      <a
        v-for="link in links"
        :key="link.id"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="share__btn"
        :aria-label="t('blog.shareOn', { network: link.label })"
      >
        <svg
          class="share__icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path :d="icons[link.id]" />
        </svg>
        <span>{{ link.label }}</span>
      </a>

      <button
        type="button"
        class="share__btn share__btn--copy"
        @click="copyLink"
      >
        {{ copied ? t("blog.linkCopied") : t("blog.copyLink") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.share {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.share__label {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8b94a8;
}

.share__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.share__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.3;
  color: #eef1f7;
  text-decoration: none;
  background: transparent;
  border: 1px solid rgba(169, 214, 229, 0.3);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.share__btn:hover {
  border-color: #46e6e1;
  transform: translateY(-2px);
}

.share__btn:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 2px;
}

.share__btn--primary {
  color: #0a0a2e;
  background: #fff;
  border-color: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}

.share__btn--primary:hover {
  background: #f0f3f7;
}

.share__btn--copy {
  color: #46e6e1;
  border-color: rgba(70, 230, 225, 0.4);
}

.share__btn--copy:hover {
  border-color: #46e6e1;
}

.share__icon {
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}
</style>
