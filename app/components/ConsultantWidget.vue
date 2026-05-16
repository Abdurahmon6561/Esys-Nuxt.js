<script setup>
import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const config = useRuntimeConfig()

const apiUrl = `${config.public.apiUrl}consultant/chat`
const widgetKey = config.public.consultantKey

const isOpen = ref(false)
const input = ref('')
const loading = ref(false)
const messages = ref([])
const messagesEl = ref(null)
const sessionId = ref(
  import.meta.client ? sessionStorage.getItem('consultant_session_id') ?? null : null
)

const scrollBottom = () =>
  nextTick(() =>
    messagesEl.value?.scrollTo({ top: messagesEl.value.scrollHeight, behavior: 'smooth' })
  )

const send = async () => {
  const message = input.value.trim()
  if (!message || loading.value) return

  input.value = ''
  loading.value = true
  messages.value = [...messages.value, { role: 'user', content: message }]
  messages.value = [...messages.value, { role: 'typing', content: '...' }]
  await scrollBottom()

  const body = { message }
  if (sessionId.value) body.session_id = sessionId.value

  try {
    const data = await $fetch(apiUrl, {
      method: 'POST',
      headers: { 'X-Widget-Key': widgetKey },
      body,
    })

    messages.value = messages.value.slice(0, -1)
    sessionId.value = data.session_id
    if (import.meta.client) sessionStorage.setItem('consultant_session_id', data.session_id)
    messages.value = [...messages.value, { role: 'assistant', content: data.reply }]
  } catch (err) {
    messages.value = messages.value.slice(0, -1)
    const errMsg = err?.data?.error ?? t('consultant.error')
    messages.value = [...messages.value, { role: 'error', content: errMsg }]
  } finally {
    loading.value = false
    await scrollBottom()
  }
}

const newSession = () => {
  sessionId.value = null
  if (import.meta.client) sessionStorage.removeItem('consultant_session_id')
  messages.value = []
}
</script>

<template>
  <div class="fixed bottom-6 right-6 flex flex-col items-end" style="z-index: 9999">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="mb-3 w-[360px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style="height: 480px"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-[#080808] text-white shrink-0">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#1aab9a] animate-pulse"></span>
            <span class="font-semibold text-sm">{{ t('consultant.title') }}</span>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="newSession"
              :title="t('consultant.new_session')"
              class="text-white/50 hover:text-white transition-colors cursor-pointer text-lg leading-none"
            >↺</button>
            <button
              @click="isOpen = false"
              class="text-white/50 hover:text-white transition-colors cursor-pointer text-base leading-none"
            >✕</button>
          </div>
        </div>

        <!-- Messages -->
        <div ref="messagesEl" class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <p v-if="!messages.length" class="text-gray-400 text-sm text-center mt-10">
            {{ t('consultant.empty') }}
          </p>
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="[
              'max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
              msg.role === 'user'
                ? 'bg-[#1aab9a] text-white self-end rounded-br-sm'
                : msg.role === 'error'
                  ? 'bg-red-50 text-red-600 self-start rounded-bl-sm'
                  : 'bg-gray-100 text-[#080808] self-start rounded-bl-sm',
            ]"
          >{{ msg.content }}</div>
        </div>

        <!-- Input -->
        <div class="flex items-end gap-2 p-3 border-t border-gray-100 shrink-0">
          <textarea
            v-model="input"
            rows="1"
            :placeholder="t('consultant.placeholder')"
            class="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1aab9a] transition-colors max-h-24 leading-relaxed"
            @keydown.enter.exact.prevent="send"
          />
          <button
            @click="send"
            :disabled="loading || !input.trim()"
            class="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-[#1aab9a] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#159084] transition-colors cursor-pointer"
          >→</button>
        </div>
      </div>
    </Transition>

    <!-- Toggle button -->
    <button
      @click="isOpen = !isOpen"
      class="w-14 h-14 rounded-full bg-[#080808] text-white flex items-center justify-center shadow-lg hover:bg-[#1aab9a] transition-colors duration-300 cursor-pointer"
    >
      <font-awesome-icon v-if="!isOpen" :icon="['fas', 'comment']" class="text-xl" />
      <span v-else class="text-lg leading-none">✕</span>
    </button>
  </div>
</template>
