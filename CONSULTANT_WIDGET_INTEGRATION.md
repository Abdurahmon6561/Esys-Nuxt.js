# AI Consultant Widget — Integration Guide

Это руководство описывает, как подключить AI-консультанта к любому фронтенд-проекту.

---

## Содержание

1. [Обзор](#1-обзор)
2. [Аутентификация](#2-аутентификация)
3. [API Reference](#3-api-reference)
4. [Управление сессией](#4-управление-сессией)
5. [Примеры реализации](#5-примеры-реализации)
   - [Vanilla JS](#51-vanilla-js)
   - [Vue 3 (Composition API)](#52-vue-3-composition-api)
   - [React](#53-react)
6. [Встраивание готового виджета](#6-встраивание-готового-виджета)
7. [Обработка ошибок](#7-обработка-ошибок)
8. [Ограничения и безопасность](#8-ограничения-и-безопасность)

---

## 1. Обзор

Архитектура взаимодействия:

```
Ваш фронтенд (виджет)
        │
        │  POST /api/v1/consultant/chat
        │  Authorization: Basic <credentials>
        ▼
   admin.esys API
        │
        ├── Валидация + защита от инъекций
        ├── История диалога (по session_id)
        ├── База знаний (FULLTEXT поиск)
        └── AI провайдер (OpenAI / DeepSeek / Claude / Gemini)
```

**Базовый URL:**
```
https://your-domain.com/api/v1
```

---

## 2. Аутентификация

Все запросы используют **HTTP Basic Authentication**.

Учётные данные настраиваются в `config/auth.php` раздел `basic-auth.users` на стороне сервера. Для нового проекта запросите у администратора:

- `login` — имя пользователя
- `password` — пароль

**Формат заголовка:**
```
Authorization: Basic base64(login:password)
```

**Пример в JavaScript:**
```js
const credentials = btoa('your_login:your_password');

fetch(url, {
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  }
});
```

> **Важно:** Никогда не храните учётные данные в публичном репозитории. Используйте переменные окружения (`.env`).

---

## 3. API Reference

### POST `/api/v1/consultant/chat`

Отправить сообщение и получить ответ консультанта.

#### Заголовки

| Заголовок | Значение |
|---|---|
| `Authorization` | `Basic base64(login:password)` |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |

#### Тело запроса

```json
{
  "message": "Ваш вопрос",
  "session_id": "abc123xyz",
  "knowledge_base_id": 1
}
```

| Поле | Тип | Обязательно | Описание |
|---|---|---|---|
| `message` | `string` | ✅ | Сообщение пользователя. Макс. 2000 символов. |
| `session_id` | `string` | ❌ | ID текущей сессии диалога. Если не передан — создаётся новая сессия. |
| `knowledge_base_id` | `integer` | ❌ | ID базы знаний для контекстного поиска. |

#### Ответ — успех `200`

```json
{
  "reply": "Ответ AI-консультанта...",
  "session_id": "abc123xyz"
}
```

| Поле | Описание |
|---|---|
| `reply` | Текстовый ответ консультанта. |
| `session_id` | Идентификатор сессии — сохраните его для следующего запроса. |

#### Ответ — ошибки

| Код | Причина | Пример тела |
|---|---|---|
| `401` | Неверные учётные данные | `{"error": "Authorization Required"}` |
| `422` | Ошибка валидации или инъекция | `{"error": "Сообщение содержит недопустимые инструкции."}` |
| `429` | Превышен лимит запросов (20/мин) | `{"error": "Слишком много запросов. Попробуйте позже."}` |
| `503` | Все AI провайдеры недоступны | `{"error": "Сервис временно недоступен. Пожалуйста, попробуйте позже."}` |

---

## 4. Управление сессией

Сессия — это непрерывный диалог. Сервер хранит историю (до 20 сообщений) и передаёт её в AI при каждом запросе.

**Правило работы с `session_id`:**

```
Первый запрос           → session_id не передаём
Ответ сервера           → получаем session_id: "abc123"
Все следующие запросы   → передаём session_id: "abc123"
Новый диалог            → не передаём session_id (сервер создаст новый)
```

**Хранение `session_id`:**
- Для чат-виджета на одной странице — в переменной компонента
- Для сохранения между перезагрузками — в `sessionStorage` (очищается при закрытии вкладки)
- Не используйте `localStorage` — сессии не должны быть бесконечными

---

## 5. Примеры реализации

### 5.1 Vanilla JS

Полноценный чат-виджет без зависимостей:

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>AI Консультант</title>
  <style>
    #consultant-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 360px;
      font-family: system-ui, sans-serif;
      z-index: 9999;
    }

    #chat-toggle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #4f46e5;
      color: #fff;
      border: none;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    #chat-box {
      display: none;
      flex-direction: column;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      overflow: hidden;
      height: 480px;
      margin-bottom: 12px;
    }

    #chat-box.open { display: flex; }

    #chat-header {
      background: #4f46e5;
      color: #fff;
      padding: 14px 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .msg.user {
      background: #4f46e5;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }

    .msg.assistant {
      background: #f1f5f9;
      color: #1e293b;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }

    .msg.typing {
      background: #f1f5f9;
      color: #94a3b8;
      align-self: flex-start;
    }

    #chat-footer {
      display: flex;
      border-top: 1px solid #e2e8f0;
      padding: 10px;
      gap: 8px;
    }

    #chat-input {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 14px;
      outline: none;
      resize: none;
    }

    #chat-input:focus { border-color: #4f46e5; }

    #chat-send {
      background: #4f46e5;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
    }

    #chat-send:disabled { background: #a5b4fc; cursor: not-allowed; }
  </style>
</head>
<body>

<div id="consultant-widget">
  <div id="chat-box">
    <div id="chat-header">
      <span>AI Консультант</span>
      <button onclick="toggleChat()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div id="chat-messages"></div>
    <div id="chat-footer">
      <textarea id="chat-input" rows="1" placeholder="Напишите сообщение..."></textarea>
      <button id="chat-send" onclick="sendMessage()">→</button>
    </div>
  </div>
  <button id="chat-toggle" onclick="toggleChat()">💬</button>
</div>

<script>
  // ─── Конфигурация ───────────────────────────────────────────────
  const API_URL          = 'https://your-domain.com/api/v1/consultant/chat';
  const API_LOGIN        = 'your_login';
  const API_PASSWORD     = 'your_password';
  const KNOWLEDGE_BASE_ID = null; // или числовой ID из админки

  // ─── Состояние ──────────────────────────────────────────────────
  let sessionId = sessionStorage.getItem('consultant_session_id') || null;

  // ─── UI helpers ─────────────────────────────────────────────────
  function toggleChat() {
    document.getElementById('chat-box').classList.toggle('open');
  }

  function appendMessage(role, text) {
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    el.textContent = text;
    const box = document.getElementById('chat-messages');
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
  }

  // ─── Отправка ───────────────────────────────────────────────────
  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    document.getElementById('chat-send').disabled = true;

    appendMessage('user', message);
    const typingEl = appendMessage('typing', '...');

    const body = { message };
    if (sessionId)          body.session_id        = sessionId;
    if (KNOWLEDGE_BASE_ID)  body.knowledge_base_id = KNOWLEDGE_BASE_ID;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${API_LOGIN}:${API_PASSWORD}`),
          'Content-Type':  'application/json',
          'Accept':        'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      typingEl.remove();

      if (!res.ok) {
        appendMessage('assistant', data.error || 'Произошла ошибка.');
        return;
      }

      sessionId = data.session_id;
      sessionStorage.setItem('consultant_session_id', sessionId);
      appendMessage('assistant', data.reply);
    } catch {
      typingEl.remove();
      appendMessage('assistant', 'Не удалось подключиться к серверу.');
    } finally {
      document.getElementById('chat-send').disabled = false;
      input.focus();
    }
  }

  // Enter отправляет, Shift+Enter — перенос строки
  document.getElementById('chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
</script>
</body>
</html>
```

---

### 5.2 Vue 3 (Composition API)

**`components/ConsultantWidget.vue`**

```vue
<script setup>
import { ref, nextTick } from 'vue';

const props = defineProps({
  apiUrl:          { type: String, required: true },
  apiLogin:        { type: String, required: true },
  apiPassword:     { type: String, required: true },
  knowledgeBaseId: { type: Number, default: null },
  title:           { type: String, default: 'AI Консультант' },
});

const isOpen    = ref(false);
const input     = ref('');
const loading   = ref(false);
const messages  = ref([]);
const messagesEl = ref(null);
const sessionId  = ref(sessionStorage.getItem('consultant_session_id') || null);

const scrollBottom = () =>
  nextTick(() => messagesEl.value?.scrollTo({ top: messagesEl.value.scrollHeight, behavior: 'smooth' }));

const send = async () => {
  const message = input.value.trim();
  if (!message || loading.value) return;

  input.value = '';
  loading.value = true;
  messages.value.push({ role: 'user', content: message });
  messages.value.push({ role: 'typing', content: '...' });
  await scrollBottom();

  const body = { message };
  if (sessionId.value)     body.session_id        = sessionId.value;
  if (props.knowledgeBaseId) body.knowledge_base_id = props.knowledgeBaseId;

  try {
    const res = await fetch(props.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${props.apiLogin}:${props.apiPassword}`),
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    messages.value.pop(); // убираем typing

    if (!res.ok) {
      messages.value.push({ role: 'error', content: data.error || 'Ошибка сервера.' });
      return;
    }

    sessionId.value = data.session_id;
    sessionStorage.setItem('consultant_session_id', sessionId.value);
    messages.value.push({ role: 'assistant', content: data.reply });
  } catch {
    messages.value.pop();
    messages.value.push({ role: 'error', content: 'Нет соединения с сервером.' });
  } finally {
    loading.value = false;
    await scrollBottom();
  }
};

const newSession = () => {
  sessionId.value = null;
  sessionStorage.removeItem('consultant_session_id');
  messages.value = [];
};
</script>

<template>
  <div class="consultant-widget">
    <Transition name="slide-up">
      <div v-if="isOpen" class="chat-box">
        <div class="chat-header">
          <span>{{ title }}</span>
          <div class="header-actions">
            <button @click="newSession" title="Новый диалог">↺</button>
            <button @click="isOpen = false">✕</button>
          </div>
        </div>

        <div class="chat-messages" ref="messagesEl">
          <div v-if="!messages.length" class="chat-empty">
            Задайте вопрос — я готов помочь.
          </div>
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="['msg', msg.role]"
          >
            {{ msg.content }}
          </div>
        </div>

        <div class="chat-footer">
          <textarea
            v-model="input"
            rows="1"
            placeholder="Напишите сообщение..."
            @keydown.enter.exact.prevent="send"
          />
          <button @click="send" :disabled="loading || !input.trim()">→</button>
        </div>
      </div>
    </Transition>

    <button class="chat-toggle" @click="isOpen = !isOpen">
      {{ isOpen ? '✕' : '💬' }}
    </button>
  </div>
</template>
```

**Использование в приложении:**

```vue
<ConsultantWidget
  api-url="https://your-domain.com/api/v1/consultant/chat"
  api-login="your_login"
  api-password="your_password"
  :knowledge-base-id="1"
  title="Консультант"
/>
```

> Учётные данные рекомендуется передавать через переменные окружения Vite:
> ```js
> apiLogin:    import.meta.env.VITE_CONSULTANT_LOGIN
> apiPassword: import.meta.env.VITE_CONSULTANT_PASSWORD
> ```

---

### 5.3 React

**`components/ConsultantWidget.jsx`**

```jsx
import { useState, useRef, useEffect } from 'react';

const API_URL      = import.meta.env.VITE_CONSULTANT_API_URL;
const API_LOGIN    = import.meta.env.VITE_CONSULTANT_LOGIN;
const API_PASSWORD = import.meta.env.VITE_CONSULTANT_PASSWORD;
const KB_ID        = import.meta.env.VITE_CONSULTANT_KB_ID || null;

export default function ConsultantWidget() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState(
    () => sessionStorage.getItem('consultant_session_id') || null
  );
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setInput('');
    setLoading(true);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: message },
      { role: 'typing', content: '...' },
    ]);

    const body = { message };
    if (sessionId) body.session_id = sessionId;
    if (KB_ID)     body.knowledge_base_id = Number(KB_ID);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${API_LOGIN}:${API_PASSWORD}`),
          'Content-Type':  'application/json',
          'Accept':        'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      setMessages(prev => {
        const withoutTyping = prev.slice(0, -1);
        const reply = res.ok
          ? { role: 'assistant', content: data.reply }
          : { role: 'error', content: data.error || 'Ошибка сервера.' };
        return [...withoutTyping, reply];
      });

      if (res.ok) {
        setSessionId(data.session_id);
        sessionStorage.setItem('consultant_session_id', data.session_id);
      }
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'error', content: 'Нет соединения с сервером.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const newSession = () => {
    setSessionId(null);
    sessionStorage.removeItem('consultant_session_id');
    setMessages([]);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <span>AI Консультант</span>
            <div>
              <button onClick={newSession} title="Новый диалог">↺</button>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>{msg.content}</div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="chat-footer">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Напишите сообщение..."
            />
            <button onClick={send} disabled={loading || !input.trim()}>→</button>
          </div>
        </div>
      )}
      <button className="chat-toggle" onClick={() => setIsOpen(o => !o)}>
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
```

**.env файл фронтенд-проекта:**
```env
VITE_CONSULTANT_API_URL=https://your-domain.com/api/v1/consultant/chat
VITE_CONSULTANT_LOGIN=your_login
VITE_CONSULTANT_PASSWORD=your_password
VITE_CONSULTANT_KB_ID=1
```

---

## 6. Встраивание готового виджета

Код готового виджета доступен в админке: **Консультант → Настройки → Код виджета**.

Вставьте полученный код перед закрывающим тегом `</body>`:

```html
<script>
  window.__CONSULTANT_WIDGET__ = {
    url: 'https://your-domain.com/api/v1/consultant/chat',
    key: 'widget_key_из_админки'
  };
</script>
<script src="https://your-domain.com/widget.js" defer></script>
```

---

## 7. Обработка ошибок

Рекомендуемая стратегия:

```js
const res = await fetch(url, options);
const data = await res.json();

switch (res.status) {
  case 200:
    // Успех — используем data.reply и сохраняем data.session_id
    break;
  case 401:
    // Ошибка аутентификации — проверьте учётные данные
    console.error('Неверные учётные данные');
    break;
  case 422:
    // Невалидный ввод — показываем data.error пользователю
    showError(data.error);
    break;
  case 429:
    // Rate limit — показываем сообщение и ждём
    showError('Подождите немного перед следующим вопросом.');
    break;
  case 503:
    // AI недоступен — показываем data.error
    showError(data.error);
    break;
  default:
    showError('Произошла непредвиденная ошибка.');
}
```

---

## 8. Ограничения и безопасность

| Параметр | Значение |
|---|---|
| Максимальная длина сообщения | 2 000 символов |
| Rate limit | 20 запросов/минуту на IP |
| История диалога | 20 последних сообщений (10 обменов) |
| Время ответа | ~2–10 сек в зависимости от провайдера |

**Чего не делать:**

- Не помещайте `api_login` / `api_password` напрямую в публичный JavaScript-код — используйте переменные окружения (`.env`) и серверный прокси при необходимости
- Не храните `session_id` в `localStorage` — используйте `sessionStorage`, чтобы сессия не была бесконечной
- Не отображайте raw `error` от сервера напрямую в UI — покажите дружелюбное сообщение

**Серверная защита (уже реализована на стороне API):**

- Блокировка prompt injection (15+ паттернов)
- Role-pinning в системном промпте
- Ограничение длины ввода
- Rate limiting 20 req/min per IP
- Basic Auth на всех запросах
