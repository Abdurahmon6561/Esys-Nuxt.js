# План: полное управление блогом и портфолио через MCP

Дата: 2026-10-23 (ревизия 2 — сверено с кодом `admin.esys` + `esys`)
Репозиторий изменений: `~/Code/admin.esys` (Laravel) + деплой через `./deploy.sh admin`
Анализ: мой аудит кода + критический разбор agy (Gemini 3.8 Flash High) + моя верификация по коду.

**Решение пользователя: удаления записей НЕ выносим в MCP — остаются только в админке.**
Также admin-only: удаление картинки из галереи, очистка main/inner изображений блога.

---

## Что исправлено в ревизии 2

| Было в плане | Факт по коду | Исправление |
|---|---|---|
| П.0 «главная `/` не чистится — блокер 2 и 5» | Для `/`, `/uz`, `/en` в `nuxt.config.ts` нет `swr`-правила → главная **не кэшируется** вообще. Плюс `server/utils/cache-purge.ts` (`PURGEABLE`) явно отклоняет `/`. Laravel API тоже без `Cache::remember`. | П.0 снят как блокер. Остался как заметка «если добавят swr на главную». |
| `is_main` влияет на главную | Главная (`<Portfolio />`) грузит `portfolio/all` (все `status=1`, по `order`). Эндпоинт `portfolio` (где `is_main=1`) фронт не вызывает. | `is_main` сейчас без видимого эффекта → низкий приоритет в п.2. |
| Не было | `Blog` имеет глобальный `PublishedScope` (`published_at <= today`). `show_blog`/`update_blog`/`list_blogs` идут через `Blog::query()` → **запланированный пост (дата в будущем) после `create_blog` не найти и не исправить через MCP**. | Новый п.A — первый в очереди. |
| `PortfolioController.php:175` | Таких файла два; нужный — `app/Http/Controllers/Backend/PortfolioController.php:175`. | Путь уточнён. |
| Блог: «изображения base64» | `*_path` из `mcp/upload-image` уже поддержан (`ResolvesImageSource`) у blog/portfolio/partner. | Таблица уточнена. |
| «У portfolios нет даты» | Есть `created_at`/`updated_at` (timestamps); нет только даты публикации. | Уточнено. |
| `BlogSeoTarget` без translation-механики | Константа `TRANSLATION_FIELDS` уже есть, `versionPayload()` уже включает `title/short_text/text_{locale}`. Не хватает только методов `translationFields()`/`applyTranslation()`. | П.3 упрощён. |
| Не было | Чистка кэша идёт через model events (`AppServiceProvider::registerFrontendCacheInvalidation`) + `flush()` в `app->terminating`. Patch-тулы зовут `$invalidator->flush()` явно. Агенты работают в queue-job (`RunAgent`). | Новые write-тулы: явный `flush()` в ответе; reorder — только через Eloquent `save()` (не mass update, иначе событий нет). |

---

## Текущее состояние

| Область | Есть |
|---|---|
| Блог | `list_blogs`, `show_blog`, `create_blog`, `update_blog` (full-replace; связи services/portfolio; изображения `*_path` или base64) |
| Портфолио | `list_portfolios`, `show_portfolio` (отдаёт `versions`), `create_portfolio`, `update_portfolio` (full-replace, `services` required min:1, галерея append-only), `patch_portfolio_translation` (per-locale + expected_version) |
| SEO | `get_page_seo` / `patch_page_seo` для blog и portfolio (per-locale, версии) |
| Upload | REST `POST mcp/upload-image` (Sanctum, `ability:mcp:content`, multipart) — для внешних MCP-клиентов; MCP-тула нет |
| Агенты | В `AgentToolCatalog`: blog list/show/create/update, portfolio list/show/patch_translation. `create_portfolio`/`update_portfolio` **не** зарегистрированы. |

Тупик workflow: `create_portfolio` не ставит `status` → дефолт БД `false` → созданный через MCP проект невидим на сайте
(`scopeOrdered` и `view` фильтруют `status=1`), переключать может только человек в админке.

---

## Пункты плана

### A. PublishedScope в blog-тулах — НОВЫЙ, GO (баг)
`AbstractShowTool::handle` и `AbstractUpdateTool` (стр. 33, 55) используют `$modelClass::query()`;
для `Blog` это скрывает посты с `published_at > today`.
**Сделать:** хук `protected function query(): Builder` в `AbstractListTool`/`AbstractShowTool`/`AbstractUpdateTool`
(дефолт `modelClass()::query()`), в blog-тулах — `Blog::withoutGlobalScopes()`.
Отдавать в `show_blog`/`list_blogs` признак `is_published` (через `BlogSeoTarget::isPublished`).
**Проверить отдельно:** `Backend/BlogController` (`index`, `form`, `save` → `findOrFail`) — тот же scope,
вероятно запланированные посты не редактируются и в админке.

### 0. Кэш главной — СНЯТ как блокер
Главная SSR не кэшируется; `/portfolio` (swr 300) уже чистится `CachePaths::forPortfolio()`.
`forBlog` главную не касается (блога на главной нет). `forService` — то же (главная грузит services без кэша).
**Заметка на будущее:** если на `/` добавят `swr`, менять вместе: `CachePaths` (homePage-пути) +
`PURGEABLE` в `esys/server/utils/cache-purge.ts` + тест `tests/cache-purge.test.ts`.
Попутно: swr-правила стоят только на ru-пути (`/blog`, `/portfolio`, `/services/**`) — uz/en не кэшируются; не баг, но несимметрично.

### 1. `upload_image` — GO-WITH-CHANGES (не обёртка!)
Внешним MCP-клиентам REST `mcp/upload-image` уже даёт «байты мимо LLM». Реальный пробел — **агенты**
(нет multipart HTTP). Обёртка с base64 ломает идею.
**Сделать:** MCP-тул по паттерну `upload_demo_media`: ровно один из `source_url` (сервер скачивает,
защита `App\Support\SafeUrl` от SSRF, лимит размера, проверка mime) или `chat_attachment`
(`ChatAttachmentResolver`; работает только в агентском ране из чата — внешнему клиенту вернуть понятную ошибку).
Логику хранения (`BASE_DIR`, mimes, `MAX_KB`, имя файла) вынести из `McpUploadController` в общий сервис,
контроллер и тул используют его. Возвращает `path` для `*_path` полей.
Регистрация: `ContentServer` + `AgentToolCatalog` (Risk::Low) + роль `content`.

### 2. `set_portfolio_flags` — GO-WITH-CHANGES
В `PortfolioRequest` флагов нет; админка меняет их через `changeStatus`/`changeMain` (toggle).
Флаги в full-replace `update_portfolio` = риск незапланированного flip (публикация + sitemap).
**Сделать:** отдельный тул `set_portfolio_flags(id, status?, is_main?)` — пишет только переданные,
явные значения (не toggle), через `$portfolio->update()` → событие `saved` → `forPortfolio` чистит кэш;
в ответе `cache => $invalidator->flush()`. `is_main` — опционально (сейчас на фронте не используется).
Для агентов — Risk::High (approval) при `status`, `dry_run`.

### 3. `patch_blog_translation` — GO-WITH-CHANGES
Зеркало `PatchPortfolioTranslationTool`: per-locale title/short_text/text + `expected_version` + `dry_run`.
**Предпосылка:** добавить в `BlogSeoTarget` методы `translationFields()`/`applyTranslation()`
(константа и version-payload уже есть). Версию берём из `get_page_seo` (тот же `SeoTargets::version()`);
для паритета добавить `versions` в `show_blog`. ru-поля не очищаются (как в портфолио);
`HasPlainTextAttributes` уже защищает title/short_text. Явный `flush()` в ответе.
Агенты: Risk::High + `dryRunKey`.

### 4. `expected_version` в update_blog/update_portfolio — ОТЛОЖЕНО
- токен версии per-locale (`SeoTargets::version()`), entity-wide версии нет;
- нужна новая механика (entity-wide hash) — отдельный дизайн;
- approval-очередь агентов (`ToolGateway` → `AgentApproval`): версия протухнет, пока ждёт человека.
**Решение:** отдельная задача после основного объёма.

### 5. `reorder_portfolios` — GO-WITH-CHANGES
Админский `updateOrder` (`app/Http/Controllers/Backend/PortfolioController.php:175`) копировать нельзя:
`Portfolio::find()` без null-check, без транзакции.
**Сделать:** тул `reorder_portfolios(ids: list)` — полный список id в нужном порядке; валидация:
все id существуют, без дублей; в `DB::transaction` → `order = i+1` через Eloquent `save()` по каждой записи
(model events → чистка кэша `/portfolio`). Mass `update()` не использовать — событий не будет.
Явный `flush()`. Агенты: Risk::Low (порядок видим, но обратим).

### 6. Фильтры в list — GO-WITH-CHANGES
- У `blogs` нет колонки `status`; у `portfolios` нет даты публикации (только timestamps).
- Блог: `search` (title_*/тег), `published_from`/`published_to`, `scheduled` (bool) — поверх п.A (`withoutGlobalScopes`).
- Портфолио: `search` (title_*/tag/client), `status`.
- Теги JSON: точное совпадение — `whereJsonContains('tags', $tag)`; подстрока — `LIKE` по `tags`.
Depends: A.

### 7. Portfolio-тулы роли `content` — GO-WITH-CHANGES
Двойная регистрация обязательна: `ContentServer::$tools` (внешний MCP) + `AgentToolCatalog`
(Risk, dryRun) + `AgentToolsets::ROLES`. Только в `AgentToolsets` → `ToolRegistry::get` бросит
`Unknown agent tool [...]`.
**Сделать:** `create_portfolio`/`update_portfolio` в `AgentToolCatalog` с Risk::High, затем в роль `content`
вместе с новыми тулами (1, 2, 3, 5). В промпте агента: для правок текста — `patch_portfolio_translation`,
не full-replace `update_portfolio` (он затирает незаданные uz/en и пересинкивает services).
Порядок: после 2.

### 8. Фикс `BlogController::save` (services) — GO-WITH-CHANGES
`Backend/BlogController::save()` валидирует `services` (`BlogRequest`), но `unset($data['services'])`
и не делает `services()->sync` (стр. 58, 92 — синкается только portfolio).
**Опасность:** в `Blogs/Form.vue` поля services нет → наивный `sync($request->services ?? [])`
затрёт связи, созданные через MCP, при каждом сохранении в админке.
**Сделать:** `if ($request->has('services')) { $blog->services()->sync($request->services ?? []); }`
и/или мультиселект services в форме (тогда передавать `service_ids` в `form()`, как `portfolio_ids`).

---

## Порядок реализации

```
1. П.A  PublishedScope в blog-тулах          (блокер 3, 6; баг)
2. П.2  set_portfolio_flags
3. П.5  reorder_portfolios
4. П.3  BlogSeoTarget methods → patch_blog_translation
5. П.1  upload_image (сервис хранения + source_url/chat_attachment)
6. П.7  регистрация в AgentToolCatalog + роль content   (после 1–5)
7. П.8  фикс BlogController (guard)
8. П.6  фильтры list                         (после A)
9. П.4  expected_version — отдельный дизайн, позже
```

## Проверки/деплой

- Тесты (Pest/PHPUnit в admin.esys) на каждый тул: happy path, unknown id, dry_run без записи,
  stale version (п.3), scheduled blog виден в show/update (п.A), reorder с дублем/лишним id → ошибка.
- Каждый новый тул: есть в `ContentServer` и `AgentToolCatalog` (Risk) — тест на `ToolRegistry::has` для всех имён из `AgentToolsets::ROLES['content']`.
- Смоук после деплоя: MCP-клиент (list/show/create/patch), `/portfolio` обновляется после flip status/reorder,
  агент content не падает на новых тулах.
- Деплой: push → `./deploy.sh admin`. Фронт (`esys`) не меняется.

## Отвергнуто

- Удаления (записи, картинка галереи, очистка изображений) — админка-only (решение пользователя).
- Обёртка upload_image над REST с base64 — ломает дизайн «байты мимо LLM».
- expected_version в update-тулах как есть — механика не подходит (см. п.4).
- homePage-пути в `CachePaths` сейчас — главная не кэшируется, а фронт такие пути отклоняет (см. п.0).
