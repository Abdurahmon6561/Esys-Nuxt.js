<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
});

const { t } = useI18n();
const activeId = ref("");
let observer;

const visibleIds = new Set();

function stopObserving() {
  observer?.disconnect();
  observer = undefined;
  visibleIds.clear();
}

async function observeHeadings() {
  stopObserving();
  await nextTick();

  if (!import.meta.client || props.items.length < 3) return;

  const headings = props.items
    .map(({ id }) => document.getElementById(id))
    .filter(Boolean);

  if (!headings.length) return;
  activeId.value = headings[0].id;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleIds.add(entry.target.id);
        else visibleIds.delete(entry.target.id);
      }

      const visible = props.items.find(({ id }) => visibleIds.has(id));
      if (visible) {
        activeId.value = visible.id;
        return;
      }

      const passed = headings
        .filter((heading) => heading.getBoundingClientRect().top < 92)
        .at(-1);

      if (passed) activeId.value = passed.id;
    },
    {
      rootMargin: "-92px 0px -65% 0px",
      threshold: [0, 1],
    }
  );

  headings.forEach((heading) => observer.observe(heading));
}

function scrollToItem(id, event) {
  const heading = document.getElementById(id);
  if (!heading) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  heading.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
  window.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
  activeId.value = id;

  const details = event.currentTarget.closest("details");
  if (details) details.open = false;
}

onMounted(observeHeadings);
watch(() => props.items, observeHeadings, { deep: true });
onBeforeUnmount(stopObserving);
</script>

<template>
  <div v-if="items.length >= 3" class="article-toc">
    <nav class="article-toc__desktop" :aria-label="t('blog.toc')">
      <p class="article-toc__label">{{ t("blog.toc") }}</p>
      <ol class="article-toc__list">
        <li
          v-for="item in items"
          :key="`${item.level}-${item.id}`"
          :class="['article-toc__item', `article-toc__item--h${item.level}`]"
        >
          <a
            :href="`#${item.id}`"
            :class="{ 'article-toc__link--active': activeId === item.id }"
            :aria-current="activeId === item.id ? 'location' : undefined"
            class="article-toc__link"
            @click.prevent="scrollToItem(item.id, $event)"
          >
            {{ item.text }}
          </a>
        </li>
      </ol>
    </nav>

    <details class="article-toc__mobile">
      <summary>{{ t("blog.toc") }}</summary>
      <nav :aria-label="t('blog.toc')">
        <ol class="article-toc__list">
          <li
            v-for="item in items"
            :key="`mobile-${item.level}-${item.id}`"
            :class="['article-toc__item', `article-toc__item--h${item.level}`]"
          >
            <a
              :href="`#${item.id}`"
              class="article-toc__link"
              @click.prevent="scrollToItem(item.id, $event)"
            >
              {{ item.text }}
            </a>
          </li>
        </ol>
      </nav>
    </details>
  </div>
</template>

<style scoped>
.article-toc__desktop {
  display: none;
}

.article-toc__mobile {
  padding: 0.9rem 1rem;
  color: #eef1f7;
  background: rgba(70, 230, 225, 0.06);
  border: 1px solid rgba(70, 230, 225, 0.2);
  border-radius: 0.75rem;
}

.article-toc__mobile summary {
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
}

.article-toc__mobile[open] summary {
  margin-bottom: 1rem;
}

.article-toc__label {
  margin: 0 0 1rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #a9d6e5;
}

.article-toc__list {
  display: grid;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.article-toc__item--h3 {
  padding-left: 1rem;
}

.article-toc__link {
  display: block;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: rgba(195, 202, 216, 0.72);
  text-decoration: none;
  overflow-wrap: anywhere;
  transition: color 0.15s ease;
}

.article-toc__link:hover,
.article-toc__link--active {
  color: #46e6e1;
}

.article-toc__link:focus-visible,
.article-toc__mobile summary:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 4px;
  border-radius: 0.125rem;
}

@media (min-width: 1200px) {
  .article-toc__mobile {
    display: none;
  }

  .article-toc__desktop {
    position: sticky;
    top: 92px;
    display: block;
    max-height: calc(100vh - 116px);
    overflow-y: auto;
    padding-right: 0.5rem;
    scrollbar-width: thin;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-toc__link {
    transition: none;
  }
}
</style>
