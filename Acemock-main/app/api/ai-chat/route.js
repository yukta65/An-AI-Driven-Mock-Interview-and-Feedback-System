/**
 * /api/ai-chat
 *
 * Accepts: POST JSON { message: string, currentUrl?: string, routes?: [{url,label}] }
 * Returns: { reply: string, action?: { type: 'navigate', url: '/path' } }
 *
 * Behavior:
 * - If GEMINI_API_KEY (or NEXT_PUBLIC_GEMINI_API_KEY) exists, attempt to call Google Generative AI.
 * - If Gemini library/key is missing or the call fails, gracefully fall back to a local rule-based responder.
 * - The route uses dynamic import for the Gemini client to avoid import-time crashes.
 */

function simpleRuleReply(message) {
  if (!message || typeof message !== "string") {
    return { reply: "Please say something — I'm listening!" };
  }

  const msg = message.trim().toLowerCase();
  if (!msg) return { reply: "Please say something — I'm listening!" };

  // Greetings
  if (
    ["hi", "hello", "hey"].some(
      (g) => msg === g || msg.startsWith(g + " ") || msg.includes(` ${g} `),
    )
  ) {
    return {
      reply:
        "Hello! I can help you navigate AceMock or answer basic questions. Try 'Go to dashboard' or ask what this app does.",
    };
  }

  // Identity
  if (
    msg.includes("your name") ||
    msg.includes("who are you") ||
    msg.includes("what are you")
  ) {
    return {
      reply:
        "I'm the AceMock assistant — I can explain the app and help you reach pages.",
    };
  }

  // Time
  if (msg.includes("time")) {
    return { reply: `Server time: ${new Date().toLocaleString()}` };
  }

  // Math
  if (
    msg.startsWith("add ") ||
    msg.includes("sum") ||
    msg.includes("plus") ||
    /(\d+\s*\+\s*\d+)/.test(msg)
  ) {
    const nums = msg.match(/-?\d+\.?\d*/g);
    if (nums && nums.length) {
      const s = nums.reduce((acc, n) => acc + Number(n), 0);
      return { reply: `The sum is ${Number.isInteger(s) ? s : s.toFixed(2)}.` };
    }
  }

  // Navigation intents (heuristics)
  const goMatch = msg.match(
    /\b(go to|open|take me to|navigate to|show me|goto)\b\s*(.*)/,
  );
  if (goMatch) {
    const target = goMatch[2]?.trim() || "";

    if (target.includes("dashboard") || msg.includes("dashboard")) {
      return {
        reply: "Opening the dashboard.",
        action: { type: "navigate", url: "/dashboard" },
      };
    }
    if (target.includes("home") || target.includes("main")) {
      return {
        reply: "Taking you to the homepage.",
        action: { type: "navigate", url: "/" },
      };
    }
    const interviewIdMatch = msg.match(/interview\s+([A-Za-z0-9\-_.]+)/);
    if (interviewIdMatch) {
      const id = interviewIdMatch[1];
      return {
        reply: `Opening interview ${id}.`,
        action: { type: "navigate", url: `/dashboard/interview/${id}` },
      };
    }
    if (target.includes("start interview") || msg.includes("start interview")) {
      return {
        reply:
          "To start an interview, open the interview details then click Start. Showing interviews.",
        action: { type: "navigate", url: "/dashboard" },
      };
    }

    // fallback navigation suggestion
    return {
      reply: "I can open the Dashboard for you. Would you like me to go there?",
      action: { type: "navigate", url: "/dashboard" },
    };
  }

  // Ask about the app
  if (
    msg.includes("what is this app") ||
    msg.includes("what does this app") ||
    msg.includes("what is acemock") ||
    msg.includes("what is ace mock")
  ) {
    return {
      reply:
        "AceMock is an AI-driven mock interview and feedback system: generate questions, record answers, and get AI feedback.",
    };
  }

  // Fallback
  return {
    reply:
      "Sorry, I don't know that yet. Try asking about the Dashboard or say 'Go to dashboard'.",
  };
}

export async function POST(req) {
  try {
    const payload = await req.json().catch(() => ({}));
    const message = payload?.message || "";
    const currentUrl = payload?.currentUrl || "/";
    const routes = Array.isArray(payload?.routes) ? payload.routes : [];

    if (!message) {
      return Response.json({ reply: "Message is empty" }, { status: 400 });
    }

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      // No key: return local reply
      const fallback = simpleRuleReply(message);
      return Response.json(fallback);
    }

    // Build site context for LLM
    const routesSummary =
      routes && routes.length
        ? routes.map((r) => `- ${r.label || r.url}: ${r.url}`).join("\n")
        : "- / : Home\n- /dashboard : Dashboard\n- /dashboard/interview/:id : Interview details";

    const prompt = `
You are an assistant for the AceMock web app.

Site routes (use these exact URLs if producing a navigation action):
${routesSummary}

Current page: ${currentUrl}

USER MESSAGE:
${message}

OUTPUT MUST BE VALID JSON ONLY:
{
  "reply": "<short 1-3 sentence answer>",
  "action": { "type": "navigate", "url": "/path" }   // OPTIONAL: include only for explicit navigation requests
}

Rules:
- Output valid JSON only (no extra text).
- If user clearly asks to navigate, include action.navigate.
- Otherwise only provide a textual reply.
- Keep reply concise.
`;

    // Dynamic import of Gemini client
    let modelText = null;
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      modelText = result?.response?.text?.();
    } catch (e) {
      console.error("Gemini call failed or not installed:", e);
    }

    if (!modelText) {
      // fallback to rules
      const fallback = simpleRuleReply(message);
      return Response.json(fallback);
    }

    // Parse JSON from model
    let parsed = null;
    try {
      parsed = JSON.parse(modelText);
    } catch (err) {
      // extract JSON object substring
      const maybe = modelText.match(/\{[\s\S]*\}/);
      if (maybe) {
        try {
          parsed = JSON.parse(maybe[0]);
        } catch (err2) {
          console.error(
            "Failed parsing extracted JSON:",
            err2,
            "raw:",
            modelText,
          );
        }
      } else {
        console.error("No JSON found in model output. Raw:", modelText);
      }
    }

    if (parsed && parsed.reply) {
      // validate action shape if present
      if (
        parsed.action &&
        parsed.action.type === "navigate" &&
        typeof parsed.action.url === "string"
      ) {
        return Response.json({
          reply: String(parsed.reply),
          action: { type: "navigate", url: parsed.action.url },
        });
      }
      return Response.json({ reply: String(parsed.reply) });
    }

    // If nothing worked, fallback
    console.error("Model output not usable. Raw:", modelText);
    const fallback = simpleRuleReply(message);
    return Response.json(fallback);
  } catch (error) {
    console.error("ai-chat route error:", error);

    // Try to return a sensible fallback using whatever message was included
    try {
      const body = await req.json().catch(() => ({}));
      const fallback = simpleRuleReply(body?.message || "");
      return Response.json(fallback);
    } catch (e) {
      return Response.json(
        { reply: "⚠️ AI is temporarily unavailable. Please try again later." },
        { status: 500 },
      );
    }
  }
}
