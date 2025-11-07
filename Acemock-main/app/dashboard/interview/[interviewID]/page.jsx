"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Webcam from "react-webcam";
import { Lightbulb, WebcamIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Interview = () => {
    const params = useParams();
    const [interviewData, setInterviewData] = useState(null);
    const [webCamEnabled, setWebCamEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params?.interviewID) {
            console.log("Interview ID:", params.interviewID);
            GetInterviewDetails(params.interviewID);
        }
    }, [params]);

    const GetInterviewDetails = async (interviewID) => {
        try {
            setLoading(true);
            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.mockId, interviewID));

            console.log("Fetched Interview Data:", result[0]);
            setInterviewData(result[0] || null);
        } catch (error) {
            console.error("Error fetching interview details:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="my-10">
            <h2 className="font-bold text-2xl">Let's Get Started</h2>

            {loading ? (
                <p className="text-lg text-gray-500">Loading interview details...</p>
            ) : interviewData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col my-5 gap-5">
                        <div className="flex flex-col p-5 rounded-lg border gap-5">
                            <h2 className="text-lg">
                                <strong>Job Role/Job Position:</strong> {interviewData?.jobPosition}
                            </h2>
                            <h2 className="text-lg">
                                <strong>Job Description/Tech Stack:</strong> {interviewData?.jobDesc}
                            </h2>
                            <h2 className="text-lg">
                                <strong>Years of Experience:</strong> {interviewData?.jobExperience}
                            </h2>
                        </div>
                        <div className="p-5 border rounded-lg border-yellow-300 bg-yellow-100">
                            <h2 className="flex gap-2 items-center text-yellow-500">
                                <Lightbulb />
                                <strong>Information</strong>
                            </h2>
                            <h2 className="mt-3 text-yellow-500 font-bold">{process.env.NEXT_PUBLIC_INFORMATION}</h2>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        {webCamEnabled ? (
                            <Webcam
                                onUserMedia={() => setWebCamEnabled(true)}
                                onUserMediaError={() => setWebCamEnabled(false)}
                                mirrored={true}
                                style={{ height: 300, width: 300 }}
                            />
                        ) : (
                            <>
                                <WebcamIcon className="h-72 w-full my-7 p-20 bg-secondary rounded-lg border" />
                            </>
                        )}
                        
                        {/* Button container with flex-column & right alignment */}
                        <div className="flex flex-col items-end w-full gap-4">
                            {!webCamEnabled && (
                                <Button variant="ghost" className="border" onClick={() => setWebCamEnabled(true)}>
                                    Enable Webcam and Microphone
                                </Button>
                            )}
                            <Link href={'/dashboard/interview/'+params.interviewID+'/start'}>  <Button className="mt-2">Start Interview</Button></Link>
                          
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-lg text-red-500">Interview details not found.</p>
            )}
        </div>
    );
};

export default Interview;
