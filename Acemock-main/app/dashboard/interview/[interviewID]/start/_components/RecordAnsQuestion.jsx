"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "@/utils/GeminiAIModal";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

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

  // 🎤 Initialize Speech Recognition (ONCE)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition works only in Chrome / Edge");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false; // ✅ IMPORTANT
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
      // ❌ Ignore empty error objects
      if (!event?.error) return;

      console.warn("Speech error:", event.error);

      if (event.error === "not-allowed") {
        toast.error("Microphone permission denied");
        setIsRecording(false);
        isManuallyStopped.current = true;
      }
    };

    // 🔁 Restart automatically if user is still recording
    recognition.onend = () => {
      if (!isManuallyStopped.current) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
  }, []);

  // ▶️ Start / Stop Recording
  const toggleRecording = async () => {
    if (!recognitionRef.current) return;

    try {
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
    } catch {
      toast.error("Microphone permission required");
    }
  };

  // 🧠 Submit Answer
  const submitAnswer = async () => {
    if (userAnswer.trim().length < 10) {
      toast.error("Please record a longer answer");
      return;
    }

    setLoading(true);

    const prompt = `
Question: ${mockInterviewQuestions[activeQuestionIndex]?.question}
User Answer: ${userAnswer}

Return JSON:
{
  "rating": number,
  "feedback": string
}
`;

    try {
      const result = await chatSession.sendMessage(prompt);

      const cleanJson = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();

      const feedback = JSON.parse(cleanJson);

      await db.insert(UserAnswer).values({
        mockIDRef: interviewData?.mockId,
        question: mockInterviewQuestions[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestions[activeQuestionIndex]?.answer,
        userAns: userAnswer,
        feedback: feedback.feedback,
        rating: feedback.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("DD-MM-YYYY"),
      });

      toast.success("Answer recorded successfully");
      setUserAnswer("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit answer");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mt-20 bg-black p-5 rounded-lg">
        <Image
          src="/webcam2.png"
          alt="Webcam preview"
          width={200}
          height={100}
          className="absolute"
        />
        <Webcam mirrored style={{ height: 300, width: "100%" }} />
      </div>

      <Button variant="outline" className="my-8" onClick={toggleRecording}>
        {isRecording ? (
          <span className="text-red-600 flex gap-2">
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
        Submit Answer
      </Button>
    </div>
  );
}

export default RecordAnsQuestion;
