// Proxies client requests to the backend API, attaching Basic Auth
// server-side so credentials never reach the browser bundle.
const ALLOWED_POST_PATHS = new Set(["feedback"]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FEEDBACK_RATE_LIMIT_WINDOW_MS = 60_000;
const FEEDBACK_RATE_LIMIT_MAX = 5;
// Per-IP timestamps of recent feedback submissions. Resets on server restart -
// acceptable for a single-instance deploy, not meant to survive a redeploy.
const feedbackHits = new Map<string, number[]>();

function isFeedbackRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (feedbackHits.get(ip) || []).filter(
    (t) => now - t < FEEDBACK_RATE_LIMIT_WINDOW_MS,
  );
  recent.push(now);
  feedbackHits.set(ip, recent);
  return recent.length > FEEDBACK_RATE_LIMIT_MAX;
}

function isValidFeedbackBody(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const { name, email, subject, message } = body as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim() || name.length > 200)
    return false;
  if (typeof email !== "string" || email.length > 320 || !EMAIL_RE.test(email))
    return false;
  if (subject != null && (typeof subject !== "string" || subject.length > 200))
    return false;
  if (message != null && (typeof message !== "string" || message.length > 5000))
    return false;
  return true;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl;

  if (!apiUrl || !config.apiUsername || !config.apiPassword) {
    console.error("Backend proxy: API url or credentials are not configured");
    throw createError({
      statusCode: 500,
      statusMessage: "Backend API is not configured",
    });
  }

  const path = getRouterParam(event, "path") || "";
  const method = event.method;

  const isAllowed =
    method === "GET" || (method === "POST" && ALLOWED_POST_PATHS.has(path));
  if (!isAllowed) {
    throw createError({ statusCode: 405, statusMessage: "Method not allowed" });
  }

  let feedbackBody: Record<string, unknown> | undefined;
  if (method === "POST" && path === "feedback") {
    const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
    if (isFeedbackRateLimited(ip)) {
      throw createError({
        statusCode: 429,
        statusMessage: "Too many requests",
      });
    }

    feedbackBody = await readBody(event);
    if (!isValidFeedbackBody(feedbackBody as unknown)) {
      throw createError({
        statusCode: 422,
        statusMessage: "Invalid feedback data",
      });
    }
  }

  const credentials = Buffer.from(
    `${config.apiUsername}:${config.apiPassword}`,
  ).toString("base64");

  const headers: Record<string, string> = {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };
  const contentLanguage = getHeader(event, "content-language");
  if (contentLanguage) {
    headers["Content-Language"] = contentLanguage;
  }

  try {
    return await $fetch(`${apiUrl}${path}`, {
      method,
      query: getQuery(event),
      body: method === "POST" ? feedbackBody : undefined,
      headers,
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode || 502;
    // Do not leak backend error details to the client
    throw createError({
      statusCode,
      statusMessage: "Backend request failed",
    });
  }
});
