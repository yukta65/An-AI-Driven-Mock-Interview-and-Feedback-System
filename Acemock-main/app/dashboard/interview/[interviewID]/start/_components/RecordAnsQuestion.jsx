"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useUser } from "@clerk/nextjs";

/**
 * RecordAnsQuestion (client)
 * - Uses Web Speech API (SpeechRecognition) for live transcription
 * - Minimal built-in toast so no external toast lib is required
 * - Sends transcription to /api/submit-answer for evaluation and DB insertion
 */

function createToastContainer() {
  if (typeof document === "undefined") return null;
  let container = document.getElementById("__acemock_toast_container");
  if (!container) {
    container = document.createElement("div");
    container.id = "__acemock_toast_container";
    container.style.position = "fixed";
    container.style.right = "16px";
    container.style.top = "16px";
    container.style.zIndex = "99999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    document.body.appendChild(container);
  }
  return container;
}
function showToast(message, type = "info", timeout = 4000) {
  if (typeof document === "undefined") {
    // fallback to alert in non-browser contexts
    // eslint-disable-next-line no-alert
    alert(message);
    return;
  }
  const container = createToastContainer();
  if (!container) {
    // fallback
    // eslint-disable-next-line no-alert
    alert(message);
    return;
  }

  const el = document.createElement("div");
  el.textContent = message;
  el.style.background =
    type === "error" ? "#FFEBEB" : type === "success" ? "#E6FFED" : "#EDF2FF";
  el.style.color = "#0f172a";
  el.style.border = "1px solid rgba(0,0,0,0.06)";
  el.style.padding = "8px 12px";
  el.style.borderRadius = "8px";
  el.style.boxShadow = "0 4px 12px rgba(2,6,23,0.08)";
  el.style.maxWidth = "320px";
  el.style.fontSize = "13px";
  el.style.opacity = "0";
  el.style.transition = "opacity .18s ease, transform .18s ease";
  el.style.transform = "translateY(-6px)";
  container.appendChild(el);
  // small enter animation
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(-6px)";
    setTimeout(() => {
      try {
        container.removeChild(el);
      } catch {}
    }, 200);
  }, timeout);
}

function RecordAnsQuestion({
  mockInterviewQuestions,
  activeQuestionIndex,
  interviewData,
}) {
  const { user } = useUser();

  const recognitionRef = useRef(null);
  const isManuallyStopped = useRef(false);

  const [isRecording, setIsRecording] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize SpeechRecognition on client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition works only in Chrome / Edge", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false; // final results only
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        setUserAnswer((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      if (!event?.error) return;
      console.warn("Speech error:", event.error);
      if (event.error === "not-allowed") {
        showToast("Microphone permission denied", "error");
        setIsRecording(false);
        isManuallyStopped.current = true;
      } else {
        showToast(`Speech recognition error: ${event.error}`, "error");
      }
    };

    recognition.onend = () => {
      // only auto-restart if the user didn't explicitly stop it
      if (!isManuallyStopped.current && isRecording) {
        try {
          recognition.start();
        } catch (e) {
          // ignore start errors
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        isManuallyStopped.current = true;
        recognition.stop();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start/Stop recording
  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      showToast("Speech recognition not available in this browser.", "error");
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (isRecording) {
        isManuallyStopped.current = true;
        recognitionRef.current.stop();
        setIsRecording(false);
      } else {
        setUserAnswer("");
        isManuallyStopped.current = false;
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (err) {
      console.error("Microphone access error:", err);
      showToast("Microphone permission required", "error");
    }
  };

  // Submit answer to server for analysis & DB insertion
  const submitAnswer = async () => {
    if (userAnswer.trim().length < 10) {
      showToast("Please record a longer answer", "error");
      return;
    }

    if (!interviewData?.mockId) {
      showToast("Interview context missing", "error");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        mockIDRef: interviewData?.mockId,
        question: mockInterviewQuestions?.[activeQuestionIndex]?.question || "",
        correctAns: mockInterviewQuestions?.[activeQuestionIndex]?.answer || "",
        userAns: userAnswer,
        userEmail: user?.primaryEmailAddress?.emailAddress || "",
      };

      const res = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const msg =
          (err && (err.error || err.message)) || "Failed to submit answer";
        showToast(msg, "error");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data?.success) {
        showToast("Answer recorded successfully", "success");
        // optionally clear the recorded answer
        setUserAnswer("");
      } else {
        showToast(data?.error || "Failed to store feedback", "error");
      }
    } catch (err) {
      console.error("submitAnswer error:", err);
      showToast("Failed to submit answer", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mt-20 bg-black p-5 rounded-lg w-full max-w-xl">
        <Image
          src="/webcam2.png"
          alt="Webcam preview"
          width={200}
          height={100}
          className="absolute"
        />
        <Webcam
          mirrored
          style={{ height: 300, width: "100%", borderRadius: 8 }}
        />
      </div>

      <div className="my-6 w-full max-w-xl flex flex-col gap-3 items-center">
        <div className="w-full text-sm text-gray-700">
          <strong>Recorded text:</strong>
          <div className="mt-2 p-3 bg-gray-50 rounded h-28 overflow-y-auto text-sm w-full">
            {userAnswer ? (
              <div>{userAnswer}</div>
            ) : (
              <div className="text-gray-400">No recording yet</div>
            )}
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={toggleRecording}
          >
            {isRecording ? (
              <span className="text-red-600 flex gap-2 items-center">
                <Mic /> Stop Recording
              </span>
            ) : (
              "Record Answer"
            )}
          </Button>

          <Button
            disabled={loading}
            onClick={submitAnswer}
            className="bg-orange-500 text-white"
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RecordAnsQuestion;
