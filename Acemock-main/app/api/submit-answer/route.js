/**
 * /api/submit-answer
 *
 * Server-side route to:
 *  - Evaluate the user's spoken answer using Google Generative AI (Gemini) if available,
 *  - Fall back to a simple local evaluator if Gemini isn't available,
 *  - Insert the result into the DB (UserAnswer table) server-side,
 *  - Return { success: true, rating, feedback } or an error.
 *
 * Expected POST body:
 * {
 *   mockIDRef: string,
 *   question: string,
 *   correctAns: string,
 *   userAns: string,
 *   userEmail: string
 * }
 */

import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";

function simpleEvaluate(userAns, correctAns) {
  // naive scoring: length + keyword overlap
  const text = (userAns || "").toLowerCase();
  const reference = (correctAns || "").toLowerCase();

  const words = text.split(/\s+/).filter(Boolean);
  const refWords = reference.split(/\s+/).filter(Boolean);

  const lengthScore = Math.min(5, Math.floor(words.length / 20) + 1); // 1..5
  let overlap = 0;
  refWords.forEach((w) => {
    if (w.length > 3 && text.includes(w)) overlap++;
  });
  const overlapScore = Math.min(3, overlap); // up to 3
  // Combine and map to 1..5
  let score = Math.min(
    5,
    Math.max(1, Math.round((lengthScore + overlapScore) / 1.6)),
  );
  const feedback = `Auto-eval: your answer has ${words.length} words. ${overlap > 0 ? `${overlap} key term(s) matched from the expected answer.` : "Try including more of the expected terminology."}`;

  return { rating: score, feedback };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mockIDRef, question, correctAns, userAns, userEmail } = body || {};

    if (!mockIDRef || !question || !userAns) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Try to use Gemini if configured
    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    let rating = null;
    let feedback = null;

    if (apiKey) {
      try {
        // dynamic import to avoid import-time failure if package not installed
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prompt: ask for JSON output
        const prompt = `
You are an assistant that evaluates a candidate's spoken answer for an interview question.
Compare the user's answer to the expected answer and provide:
- "rating": integer from 1 (poor) to 5 (excellent)
- "feedback": a short helpful paragraph (1-3 sentences)

Question: ${question}
Expected answer (if available): ${correctAns || "N/A"}
User answer: ${userAns}

OUTPUT MUST BE VALID JSON ONLY:
{
  "rating": <1-5>,
  "feedback": "<short helpful feedback>"
}
`;

        const result = await model.generateContent(prompt);
        const text = result?.response?.text?.();

        if (text) {
          // parse JSON (allow for fenced code)
          const cleaned = text.replace(/```json|```/g, "").trim();
          let parsed = null;
          try {
            parsed = JSON.parse(cleaned);
          } catch (err) {
            // try extract JSON substring
            const maybe = cleaned.match(/\{[\s\S]*\}/);
            if (maybe) {
              parsed = JSON.parse(maybe[0]);
            }
          }

          if (
            parsed &&
            typeof parsed.rating !== "undefined" &&
            parsed.feedback
          ) {
            rating = Number(parsed.rating);
            feedback = String(parsed.feedback);
          } else {
            // fallback to local evaluator
            const fallback = simpleEvaluate(userAns, correctAns);
            rating = fallback.rating;
            feedback = fallback.feedback;
          }
        } else {
          // no text from model -> fallback
          const fallback = simpleEvaluate(userAns, correctAns);
          rating = fallback.rating;
          feedback = fallback.feedback;
        }
      } catch (e) {
        console.error("Gemini evaluation failed:", e);
        const fallback = simpleEvaluate(userAns, correctAns);
        rating = fallback.rating;
        feedback = fallback.feedback;
      }
    } else {
      // no api key: use local evaluator
      const fallback = simpleEvaluate(userAns, correctAns);
      rating = fallback.rating;
      feedback = fallback.feedback;
    }

    // Insert into DB server-side
    try {
      await db.insert(UserAnswer).values({
        mockIDRef,
        question,
        correctAns: correctAns || "",
        userAns,
        feedback,
        rating: String(rating),
        userEmail: userEmail || "",
        createdAt: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.error("DB insert error:", dbErr);
      // still return success but indicate DB failure
      return Response.json(
        { success: false, error: "Failed to save answer to DB" },
        { status: 500 },
      );
    }

    return Response.json({ success: true, rating, feedback });
  } catch (err) {
    console.error("submit-answer route error:", err);
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
