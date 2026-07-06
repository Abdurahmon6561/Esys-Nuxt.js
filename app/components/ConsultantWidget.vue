<script setup>
import { ref, nextTick, watch } from "vue";

const { t } = useI18n();
const config = useRuntimeConfig();

const apiUrl = `${config.public.apiUrl}consultant/chat`;
const widgetKey = config.public.consultantKey;

const INPUT_MAX_HEIGHT_PX = 96;

const isOpen = ref(false);
const input = ref("");
const loading = ref(false);
const messages = ref([]);
const messagesEl = ref(null);
const inputEl = ref(null);
const sessionId = ref(
  import.meta.client
    ? sessionStorage.getItem("consultant_session_id") ?? null
    : null
);

// Opening the panel: focus the input; Escape closes from anywhere inside.
watch(isOpen, (open) => {
  if (open) nextTick(() => inputEl.value?.focus());
});

const onEscape = () => {
  isOpen.value = false;
};

const scrollBottom = () =>
  nextTick(() =>
    messagesEl.value?.scrollTo({
      top: messagesEl.value.scrollHeight,
      behavior: "smooth",
    })
  );

// Textarea grows with content up to a cap, then scrolls.
const autoGrow = () => {
  const el = inputEl.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX_HEIGHT_PX)}px`;
};

const send = async () => {
  const message = input.value.trim();
  if (!message || loading.value) return;

  input.value = "";
  nextTick(autoGrow);
  loading.value = true;
  messages.value = [...messages.value, { role: "user", content: message }];
  messages.value = [...messages.value, { role: "typing" }];
  await scrollBottom();

  const body = { message };
  if (sessionId.value) body.session_id = sessionId.value;

  try {
    const data = await $fetch(apiUrl, {
      method: "POST",
      headers: { "X-Widget-Key": widgetKey },
      body,
    });

    messages.value = messages.value.slice(0, -1);
    sessionId.value = data.session_id;
    if (import.meta.client)
      sessionStorage.setItem("consultant_session_id", data.session_id);
    messages.value = [
      ...messages.value,
      { role: "assistant", content: data.reply },
    ];
  } catch (err) {
    messages.value = messages.value.slice(0, -1);
    const errMsg = err?.data?.error ?? t("consultant.error");
    messages.value = [...messages.value, { role: "error", content: errMsg }];
  } finally {
    loading.value = false;
    await scrollBottom();
  }
};

const newSession = () => {
  sessionId.value = null;
  if (import.meta.client) sessionStorage.removeItem("consultant_session_id");
  messages.value = [];
};
</script>

<template>
  <div class="consultant">
    <Transition name="consultant-panel">
      <div
        v-if="isOpen"
        class="consultant__panel"
        role="dialog"
        :aria-label="t('consultant.title')"
        @keydown.esc="onEscape"
      >
        <!-- Header -->
        <div class="consultant__header">
          <div class="consultant__status">
            <span class="consultant__dot" aria-hidden="true" />
            <span class="consultant__title">{{ t("consultant.title") }}</span>
          </div>
          <div class="consultant__actions">
            <button
              class="consultant__icon-btn"
              :title="t('consultant.new_session')"
              :aria-label="t('consultant.new_session')"
              @click="newSession"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M3 12a9 9 0 1 1 3 6.7M3 22v-6h6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <button
              class="consultant__icon-btn"
              :aria-label="t('consultant.close')"
              @click="isOpen = false"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="messagesEl"
          class="consultant__messages"
          aria-live="polite"
        >
          <p v-if="!messages.length" class="consultant__empty">
            {{ t("consultant.empty") }}
          </p>
          <template v-for="(msg, i) in messages" :key="i">
            <div
              v-if="msg.role === 'typing'"
              class="consultant__msg consultant__msg--typing"
              :aria-label="t('consultant.typing')"
            >
              <span class="consultant__typing-dot" aria-hidden="true" />
              <span class="consultant__typing-dot" aria-hidden="true" />
              <span class="consultant__typing-dot" aria-hidden="true" />
            </div>
            <div
              v-else
              class="consultant__msg"
              :class="{
                'consultant__msg--user': msg.role === 'user',
                'consultant__msg--error': msg.role === 'error',
              }"
            >
              {{ msg.content }}
            </div>
          </template>
        </div>

        <!-- Input -->
        <div class="consultant__composer">
          <textarea
            ref="inputEl"
            v-model="input"
            rows="1"
            class="consultant__input"
            :placeholder="t('consultant.placeholder')"
            @input="autoGrow"
            @keydown.enter.exact.prevent="send"
          />
          <button
            class="consultant__send"
            :disabled="loading || !input.trim()"
            :aria-label="t('consultant.send')"
            @click="send"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Toggle button -->
    <button
      class="consultant__toggle"
      :class="{ 'is-open': isOpen }"
      :aria-label="isOpen ? t('consultant.close') : t('consultant.title')"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <svg
        v-if="!isOpen"
        viewBox="0 0 24 24"
        width="22"
        height="22"
        aria-hidden="true"
      >
        <path
          d="M12 3C6.92 3 2.8 6.55 2.8 10.93c0 2.51 1.36 4.75 3.49 6.2-.14 1.2-.6 2.43-1.53 3.44-.18.2-.04.52.23.49 2.03-.23 3.66-1.05 4.79-1.87.71.15 1.45.24 2.22.24 5.08 0 9.2-3.55 9.2-7.93S17.08 3 12 3Z"
          fill="currentColor"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.consultant {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* ── Panel ── */
.consultant__panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: min(360px, calc(100vw - 3rem));
  /* Never taller than the viewport minus toggle + margins */
  height: min(480px, calc(100dvh - 8rem));
  margin-bottom: 0.75rem;
  border-radius: 1.25rem;
  background: rgba(8, 12, 30, 0.92);
  border: 1px solid rgba(169, 214, 229, 0.16);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  color: #eef1f7;
}

.consultant-panel-enter-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.consultant-panel-leave-active {
  transition: opacity 0.15s ease-in, transform 0.15s ease-in;
}
.consultant-panel-enter-from,
.consultant-panel-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

/* ── Header ── */
.consultant__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0.625rem 0.75rem 0.625rem 1rem;
  border-bottom: 1px solid rgba(169, 214, 229, 0.12);
}

.consultant__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.consultant__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #a9d6e5;
  animation: consultant-pulse 2s ease infinite;
}

@keyframes consultant-pulse {
  50% {
    opacity: 0.4;
  }
}

.consultant__title {
  font-size: 0.875rem;
  font-weight: 600;
}

.consultant__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.consultant__icon-btn {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: none;
  border-radius: 0.625rem;
  background: none;
  color: rgba(238, 241, 247, 0.5);
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.consultant__icon-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.07);
}

.consultant__icon-btn:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 1px;
}

/* ── Messages ── */
.consultant__messages {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.75rem;
  overflow-y: auto;
  padding: 1rem;
}

.consultant__empty {
  margin: 2.5rem 0 0;
  font-size: 0.875rem;
  text-align: center;
  color: rgba(238, 241, 247, 0.45);
}

.consultant__msg {
  align-self: flex-start;
  max-width: 82%;
  padding: 0.625rem 1rem;
  border-radius: 1rem;
  border-bottom-left-radius: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  background: rgba(255, 255, 255, 0.07);
  color: #eef1f7;
  animation: consultant-msg-in 0.25s ease-out;
}

@keyframes consultant-msg-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.consultant__msg--user {
  align-self: flex-end;
  border-radius: 1rem;
  border-bottom-right-radius: 0.25rem;
  background: #a9d6e5;
  color: #05051a;
}

.consultant__msg--error {
  background: rgba(220, 76, 76, 0.14);
  color: #f2a3a3;
}

/* ── Typing indicator ── */
.consultant__msg--typing {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.8rem 1rem;
}

.consultant__typing-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: rgba(238, 241, 247, 0.6);
  animation: consultant-typing 1.2s ease-in-out infinite;
}

.consultant__typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.consultant__typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes consultant-typing {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

/* ── Composer ── */
.consultant__composer {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
  padding: 0.75rem;
  border-top: 1px solid rgba(169, 214, 229, 0.12);
}

.consultant__input {
  flex: 1;
  max-height: 6rem;
  resize: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(169, 214, 229, 0.18);
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.875rem;
  font-family: inherit;
  line-height: 1.55;
  color: #eef1f7;
  outline: none;
  transition: border-color 0.2s ease;
}

.consultant__input::placeholder {
  color: rgba(238, 241, 247, 0.4);
}

.consultant__input:focus {
  border-color: rgba(169, 214, 229, 0.5);
}

.consultant__send {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 0.75rem;
  background: #a9d6e5;
  color: #05051a;
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;
}

.consultant__send:hover:not(:disabled) {
  background: #c3e3ee;
}

.consultant__send:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 2px;
}

.consultant__send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Toggle ── */
.consultant__toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border: none;
  border-radius: 50%;
  background: #a9d6e5;
  color: #05051a;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease, transform 0.3s ease,
    box-shadow 0.3s ease;
}

/* Idle attention: soft breathing glow to draw the eye when closed */
.consultant__toggle:not(.is-open) {
  animation: consultant-breathe 3.2s ease-in-out infinite;
}

/* Expanding pulse ring - radiates outward, loops, only while closed */
.consultant__toggle:not(.is-open)::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(70, 230, 225, 0.7);
  animation: consultant-ring 2.4s ease-out infinite;
  pointer-events: none;
}

@keyframes consultant-breathe {
  0%,
  100% {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45),
      0 0 0 0 rgba(70, 230, 225, 0);
  }
  50% {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45),
      0 0 26px 4px rgba(70, 230, 225, 0.55);
  }
}

@keyframes consultant-ring {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.55);
    opacity: 0;
  }
  100% {
    transform: scale(1.55);
    opacity: 0;
  }
}

.consultant__toggle:hover {
  background: #46e6e1;
  color: #05051a;
  transform: translateY(-2px);
  animation: none;
}

/* Hover cancels the idle pulse ring */
.consultant__toggle:hover::after {
  animation: none;
  opacity: 0;
}

.consultant__toggle:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .consultant__dot,
  .consultant__msg,
  .consultant__typing-dot {
    animation: none;
  }
  .consultant__toggle,
  .consultant-panel-enter-active,
  .consultant-panel-leave-active {
    transition: none;
  }
  .consultant__toggle:not(.is-open),
  .consultant__toggle:not(.is-open)::after {
    animation: none;
  }
  .consultant__toggle:hover {
    transform: none;
  }
}
</style>
