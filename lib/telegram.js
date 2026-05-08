export async function sendTelegramMessage(message) {
  try {
    const token =
      process.env.TELEGRAM_BOT_TOKEN;

    const chatId =
      process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.log(
        "❌ TELEGRAM ENV MISSING"
      );
      return;
    }

    const url =
      `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        chat_id: chatId,

        text: message,

        parse_mode: "HTML",
      }),
    });

    const data =
      await response.json();

    console.log(
      "📨 TELEGRAM SENT:",
      data?.ok
    );

    return data;
  } catch (err) {
    console.log(
      "🔴 TELEGRAM ERROR:",
      err.message
    );
  }
}
