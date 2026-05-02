const META_PHONE_NUMBER_ID = "1021048977768281";
const META_WABA_ID = "2201948910566971";

/**
 * Send WhatsApp message using Meta Cloud API
 */
export async function sendWhatsAppMessage({ to, message }) {
  try {
    const token = process.env.META_WHATSAPP_TOKEN;

    if (!token) {
      throw new Error("Missing META_WHATSAPP_TOKEN in env");
    }

    const url = `https://graph.facebook.com/v20.0/${META_PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: message,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("WhatsApp API Error:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return { success: false, error: err.message };
  }
}
