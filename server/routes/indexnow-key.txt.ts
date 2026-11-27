// IndexNow key file (keyLocation for the admin's seo_request_recrawl tool).
// The key is generated and stored by the admin backend; it is public by
// IndexNow design, but the API call itself uses server-only Basic Auth.
const loadIndexNowKey = defineCachedFunction(
  async (): Promise<string> => {
    const config = useRuntimeConfig();
    const apiUrl = config.public.apiUrl;

    if (!apiUrl || !config.apiUsername || !config.apiPassword) {
      return "";
    }

    const credentials = Buffer.from(
      `${config.apiUsername}:${config.apiPassword}`,
    ).toString("base64");

    try {
      const key = await $fetch<string>(`${apiUrl}indexnow-key`, {
        headers: { Authorization: `Basic ${credentials}` },
        responseType: "text",
      });
      return /^[a-zA-Z0-9-]{8,128}$/.test(key.trim()) ? key.trim() : "";
    } catch (error) {
      console.error("IndexNow: failed to load the key", error);
      return "";
    }
  },
  // A failed fetch ("") must not be cached for an hour.
  { maxAge: 3600, name: "indexnow-key", validate: (entry) => Boolean(entry.value) },
);

export default defineEventHandler(async (event) => {
  const key = await loadIndexNowKey();

  if (!key) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  setResponseHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "public, max-age=3600");
  return key;
});
