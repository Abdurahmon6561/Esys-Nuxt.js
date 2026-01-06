const TELEGRAM_BOT_TOKEN = "7628001382:AAEmI7MwY_b0rej8sOI_0iuWECRTfNHsYNc";
const TELEGRAM_CHAT_ID = "963152038";

export async function sendToTelegram({ name, email, phone, message }) {
  try {
    let contactLines = [];
    if (email) contactLines.push(`Почта: ${email}`);
    if (phone) contactLines.push(`Телефон: ${phone}`);

    const text = `Свяжитесь

Имя: ${name}
${contactLines.join('\n')}
Сообщение: ${message}`;

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    });

    const result = await res.json();
    return result.ok;
  } catch (err) {
    console.error("Telegram error:", err);
    return false;
  }
}
