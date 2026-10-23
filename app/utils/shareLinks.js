// Pure helper: builds social share links for an article.
// No side effects, no DOM access - safe on server and client.
export function buildShareLinks({ url, title }) {
  const safeUrl = url || "";
  const safeTitle = title || "";
  const encUrl = encodeURIComponent(safeUrl);
  const encTitle = encodeURIComponent(safeTitle);

  return [
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${encUrl}&text=${encTitle}`,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${safeTitle} ${safeUrl}`.trim())}`,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
    },
  ];
}
