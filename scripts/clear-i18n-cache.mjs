import { rmSync } from 'node:fs';

// Nuxt i18n persists resolved messages across builds. Reusing these entries
// can ship old translations even when the locale source files have changed.
rmSync(new URL('../.nuxt/cache/nitro/functions/i18n/', import.meta.url), {
  recursive: true,
  force: true,
});
