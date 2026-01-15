import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ reply: "Message is empty" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are a helpful AI assistant like ChatGPT.
Answer clearly, politely, and briefly.

User question: ${message}
`;

    const result = await model.generateContent(prompt);

    return Response.json({
      reply: result.response.text(),
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    return Response.json(
      {
        reply:
          "⚠️ AI is temporarily unavailable due to high usage. Please try again later.",
      },
      { status: 429 }
    );
  }
}
