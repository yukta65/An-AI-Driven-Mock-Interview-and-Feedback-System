"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(
        eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
      )
      .orderBy(desc(MockInterview.id));

    console.log(result);
    setInterviewList(result);
  };
  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="font-bold text-2xl text-gray-900">
          Previous Mock Interviews
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Review your past interviews and track your progress
        </p>
      </div>

      {interviewList && interviewList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interviewList.map((interview, index) => (
            <InterviewItemCard interview={interview} key={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
          <h3 className="font-semibold text-gray-900 mb-1">
            No interviews yet
          </h3>
          <p className="text-gray-500 text-sm">
            Create your first mock interview to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewList;
