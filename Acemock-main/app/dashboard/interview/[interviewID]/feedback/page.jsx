"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Feedback() {
  const router = useRouter();
  const params = useParams();
  const interviewID = params?.interviewID;

  const [feedbackList, setFeedbackList] = useState([]);
  const [averageRating, setAverageRating] = useState("0.0");

  useEffect(() => {
    if (interviewID) {
      getFeedback();
    }
  }, [interviewID]);

  const normalizeRating = (rating) => {
    let r = Number(rating) || 0;

    // If AI gave score out of 100, convert to 10-scale
    if (r > 10) {
      r = r / 10;
    }

    // Clamp between 0 and 10
    return Math.min(10, Math.max(0, r));
  };

  const getFeedback = async () => {
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIDRef, interviewID))
        .orderBy(UserAnswer.id);

      setFeedbackList(result);

      if (result.length > 0) {
        const normalizedRatings = result.map((item) =>
          normalizeRating(item.rating),
        );

        const total = normalizedRatings.reduce((a, b) => a + b, 0);
        const avg = (total / normalizedRatings.length).toFixed(1);

        setAverageRating(avg);
      } else {
        setAverageRating("0.0");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-6">
        {feedbackList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border">
            <h2 className="text-xl font-semibold mb-2">
              No Interview Feedback Found
            </h2>
            <Button onClick={() => router.replace("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white rounded-xl border p-8 mb-6">
              <h1 className="text-3xl font-bold mb-2">🎉 Congratulations!</h1>
              <p className="text-gray-600 mb-4">
                Here is your interview feedback
              </p>

              <div className="p-4 bg-orange-50 border rounded-lg">
                <p className="text-sm">Overall Interview Rating</p>
                <p className="text-3xl font-bold text-orange-600">
                  {averageRating}/10
                </p>
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {feedbackList.map((item, index) => {
                const rating = normalizeRating(item.rating).toFixed(1);

                return (
                  <Collapsible
                    key={index}
                    className="bg-white rounded-xl border"
                  >
                    <CollapsibleTrigger className="p-5 flex justify-between items-center w-full">
                      <div className="flex gap-3">
                        <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-medium">{item.question}</span>
                      </div>
                      <ChevronsUpDown className="h-5 w-5" />
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="p-5 space-y-3">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm font-semibold">Rating</p>
                          <p className="text-lg font-bold text-orange-600">
                            {rating}/10
                          </p>
                        </div>

                        <div className="bg-red-50 p-3 rounded">
                          <p className="text-sm font-semibold">Your Answer</p>
                          <p>{item.userAns || "Not given"}</p>
                        </div>

                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm font-semibold">
                            Correct Answer
                          </p>
                          <p>{item.correctAns || "Not available"}</p>
                        </div>

                        <div className="bg-orange-50 p-3 rounded">
                          <p className="text-sm font-semibold">Feedback</p>
                          <p>{item.feedback || "No feedback provided"}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

            {/* Back Button */}
            <div className="mt-8 text-center">
              <Button onClick={() => router.replace("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
