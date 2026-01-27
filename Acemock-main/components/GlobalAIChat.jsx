"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * GlobalAIChat
 * - Sends { message, currentUrl, routes } to /api/ai-chat
 * - Expects JSON { reply: string, action?: { type: 'navigate', url } }
 * - Shows a "Go" button when an action.navigate is returned, which uses next/router to navigate
 */

export default function GlobalAIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi 👋 I'm AceMock assistant. Ask about the app or say 'Go to dashboard'.",
    },
  ]);
  const [lastAction, setLastAction] = useState(null);
  const router = useRouter();
  const scrollRef = useRef(null);

  useEffect(() => {
    // scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Define routes to provide site context to the assistant (update if you add pages)
  const ROUTES = [
    { url: "/", label: "Home" },
    { url: "/dashboard", label: "Dashboard" },
    { url: "/dashboard/interview", label: "Interviews" },
    { url: "/dashboard/interview/:id", label: "Interview details" },
    { url: "/dashboard/interview/:id/start", label: "Start interview" },
    { url: "/dashboard/interview/:id/feedback", label: "Feedback" },
    { url: "/sign-in", label: "Sign in" },
    { url: "/sign-up", label: "Sign up" },
  ];

  const sendMessage = async (overrideMessage) => {
    const messageText = overrideMessage ?? input?.trim();
    if (!messageText || loading) return;
    setLoading(true);
    setLastAction(null);

    // push user message
    const userMsg = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          currentUrl:
            typeof window !== "undefined" ? window.location.pathname : "/",
          routes: ROUTES,
        }),
      });

      if (!res.ok) {
        // Try parse body anyway for friendly message
        const err = await res.json().catch(() => null);
        const errMsg =
          (err && err.reply) || "⚠️ Chat service returned an error.";
        setMessages((prev) => [...prev, { role: "ai", text: errMsg }]);
        return;
      }

      const data = await res.json();

      // data: { reply, action? }
      if (!data || typeof data.reply !== "string") {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: "⚠️ Unexpected response from chat service." },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);

        if (
          data.action &&
          data.action.type === "navigate" &&
          typeof data.action.url === "string"
        ) {
          setLastAction(data.action);
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Could not reach the chat service. Try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (action) => {
    if (!action || action.type !== "navigate" || !action.url) return;
    router.push(action.url);
    setOpen(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg z-50"
        aria-label="Open assistant"
      >
        <MessageCircle />
      </button>

      {open && (
        <div
          className="fixed bottom-20 right-6 w-80 bg-white shadow-2xl rounded-xl z-50 flex flex-col"
          role="dialog"
          aria-modal="false"
        >
          <div className="flex justify-between items-center bg-orange-500 text-white p-3 rounded-t-xl">
            <span className="font-medium">AI Assistant</span>
            <X className="cursor-pointer" onClick={() => setOpen(false)} />
          </div>

          <div
            className="flex-1 p-3 overflow-y-auto space-y-2 text-sm max-h-96"
            ref={scrollRef}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[90%] ${
                  msg.role === "user"
                    ? "bg-orange-100 ml-auto text-right"
                    : "bg-gray-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="text-gray-400 text-xs">AI typing...</div>
            )}
          </div>

          {/* Action area: show a button if the assistant suggested navigation */}
          {lastAction && lastAction.type === "navigate" && lastAction.url && (
            <div className="p-2 border-t flex items-center justify-between gap-2">
              <div className="text-xs text-gray-600 truncate">
                Assistant suggests: {lastAction.url}
              </div>
              <button
                onClick={() => handleNavigate(lastAction)}
                className="bg-orange-500 text-white px-3 rounded text-sm"
              >
                Go
              </button>
            </div>
          )}

          <div className="p-2 flex gap-2 border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="Ask something or say 'Go to dashboard'..."
              aria-label="Message input"
            />
            <button
              onClick={() => sendMessage()}
              className="bg-orange-500 text-white px-3 rounded"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
