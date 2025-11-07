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
  const [feedbackList, setFeedbackList] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const interviewID = params?.interviewID;

  useEffect(() => {
    if (interviewID) {
      GetFeedback();
    }
  }, [interviewID]);

  const GetFeedback = async () => {
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIDRef, interviewID))
        .orderBy(UserAnswer.id);

      setFeedbackList(result);

      if (result.length > 0) {
        const totalRating = result.reduce(
          (sum, item) => sum + (item.rating || 0),
          0
        );
        const avg = (totalRating / result.length).toFixed(1);
        setAverageRating(avg);
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-6">
        {feedbackList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <svg
              className="w-20 h-20 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Interview Feedback Found
            </h2>
            <p className="text-gray-600 mb-6">
              Complete an interview to see your feedback here
            </p>
            <Button
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => router.replace("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎉</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Congratulations!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Here is your interview feedback
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-1">
                  Overall Interview Rating
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {averageRating}/10
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Detailed Feedback
              </h3>
              <p className="text-sm text-gray-600">
                Below are your interview questions, your answers, correct
                answers, and feedback for improvement.
              </p>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {feedbackList.map((item, index) => (
                <Collapsible
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <CollapsibleTrigger className="p-5 hover:bg-gray-50 flex justify-between items-center text-left gap-4 w-full transition-colors">
                    <div className="flex gap-3 items-start flex-1">
                      <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.question}
                      </span>
                    </div>
                    <ChevronsUpDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="p-5 pt-0 space-y-3">
                      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">
                          Rating
                        </p>
                        <p className="text-lg font-bold text-orange-600">
                          {item.rating || "N/A"}/10
                        </p>
                      </div>

                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <p className="text-xs font-semibold text-red-800 uppercase mb-2">
                          Your Answer
                        </p>
                        <p className="text-sm text-red-900">
                          {item.userAns || "Not given"}
                        </p>
                      </div>

                      <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                        <p className="text-xs font-semibold text-green-800 uppercase mb-2">
                          Correct Answer
                        </p>
                        <p className="text-sm text-green-900">
                          {item.correctAns || "Not available"}
                        </p>
                      </div>

                      <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                        <p className="text-xs font-semibold text-orange-800 uppercase mb-2">
                          Feedback
                        </p>
                        <p className="text-sm text-orange-900">
                          {item.feedback || "No feedback provided"}
                        </p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
              <Button
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-8"
                onClick={() => router.replace("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
