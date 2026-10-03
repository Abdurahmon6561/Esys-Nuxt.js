import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildRedirectMap,
  isRedirectPath,
  STATIC_REDIRECTS,
} from "../server/utils/redirects.ts";

test("redirect lookup covers service and portfolio locale paths", () => {
  for (const path of [
    "/services",
    "/services/websites",
    "/en/services/websites",
    "/uz/services/websites",
    "/portfolio",
    "/portfolio/project",
    "/en/portfolio/project",
    "/uz/portfolio/project",
  ]) {
    assert.equal(isRedirectPath(path), true, path);
  }

  for (const path of ["/", "/blog/post", "/portfolio-other/project"]) {
    assert.equal(isRedirectPath(path), false, path);
  }
});

test("redirect map keeps the static fallback under CMS rows", () => {
  assert.deepEqual(STATIC_REDIRECTS["/portfolio/v-united"], {
    to: "/portfolio",
    code: 301,
  });

  const map = buildRedirectMap([
    { from: "/services/old", to: "/services/new" },
    { from: "/portfolio/v-united", to: "/portfolio/archive", code: 302 },
  ]);

  assert.deepEqual(map["/services/old"], {
    to: "/services/new",
    code: 301,
  });
  assert.deepEqual(map["/portfolio/v-united"], {
    to: "/portfolio/archive",
    code: 302,
  });
});
