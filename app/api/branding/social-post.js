export default async function handler(req, res) {
  if (req.method === "POST") {
    const { topic, style } = req.body;

    // For now we mock AI content generation. Later integrate OpenAI or any AI API
    const content = `🎯 ${style} post for "${topic}": This is a fully generated social media post including hashtags and engaging content.`;

    return res.status(200).json({ success: true, content });
  }
  return res.status(405).json({ success: false, msg: "Method not allowed" });
}
