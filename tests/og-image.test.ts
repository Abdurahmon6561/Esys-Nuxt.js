import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isSvgImage,
  resolveOgImage,
} from "../app/utils/ogImage.js";

const fallback = "https://esys.pro/og-image.png";

test("SVG social images use the raster fallback", () => {
  for (const image of [
    "https://api.esys.pro/storage/service.svg",
    "https://api.esys.pro/storage/service.SVG",
    "https://api.esys.pro/storage/service.svg?version=2",
    "/storage/service.svg#preview",
  ]) {
    assert.equal(isSvgImage(image), true, image);
    assert.equal(resolveOgImage(image, fallback), fallback, image);
  }
});

test("raster and missing social images stay unchanged", () => {
  for (const image of [
    "https://api.esys.pro/storage/service.png",
    "https://api.esys.pro/storage/svg/icon.png?source=.svg",
    undefined,
  ]) {
    assert.equal(isSvgImage(image), false);
    assert.equal(resolveOgImage(image, fallback), image);
  }
});
