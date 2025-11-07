"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecordAnsQuestion from "./_components/RecordAnsQuestion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function StartInterview() {
    const params = useParams();
    const [interviewData, setInterviewData] = useState(null);
    const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeQuestionIndex ,setActiveQuestionIndex] =useState(0);
    useEffect(() => {
        if (params?.interviewID) {
            console.log("Fetching interview for ID:", params.interviewID);
            GetInterviewDetails(params.interviewID);
        }
    }, [params]);

    const GetInterviewDetails = async (interviewID) => {
        try {
            setLoading(true);

            if (!interviewID) {
                console.error("Error: interviewID is undefined or null.");
                return;
            }

            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.mockId, interviewID));

            if (!result || result.length === 0) {
                console.warn("No interview found for ID:", interviewID);
                setLoading(false);
                return;
            }

            const interview = result[0];
            console.log("Fetched Interview:", interview);

            // Ensure jsonMockResp exists before parsing
            const jsonMockResp = interview?.jsonMockResp ? JSON.parse(interview.jsonMockResp) : [];
         console.log(jsonMockResp)
            setMockInterviewQuestions(jsonMockResp);
            setInterviewData(interview);
        } catch (error) {
            console.error("Error fetching interview details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Ques */}
                <QuestionSection
                 mockInterviewQuestions={mockInterviewQuestions}
                activeQuestionIndex={activeQuestionIndex}
                />
                {/* video record */}
                <RecordAnsQuestion
                  mockInterviewQuestions={mockInterviewQuestions}
                  activeQuestionIndex={activeQuestionIndex}
                  interviewData={interviewData}
                />
            </div>
            <div className="flex justify-end gap-6">
               {activeQuestionIndex>0 &&
               <Button
               onClick={()=>setActiveQuestionIndex(activeQuestionIndex-1)}>Previous Question</Button>}
               {activeQuestionIndex!=mockInterviewQuestions?.length-1 &&
                <Button
                onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)}>Next Question</Button>} 
               {activeQuestionIndex==mockInterviewQuestions?.length-1 &&
               <Link href={'/dashboard/interview/'+interviewData?.mockId+'/feedback'}>
               <Button>End Interview</Button>
               </Link>} 
            </div>
        </div>
           );
}

export default StartInterview;
