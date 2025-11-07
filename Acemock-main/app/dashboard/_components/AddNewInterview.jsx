"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { chatSession } from "@/utils/GeminiAIModal";
import { LoaderCircle } from "lucide-react";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

const AddNewInterview = () => {
  const [openDailog, setOpenDailog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [JsonResponse, setJsonResponse] = useState([]);
  const router = useRouter();

  const { user } = useUser();

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    console.log("User Object:", user);
    console.log("User Email:", user?.primaryEmailAddress?.emailAddress);

    if (!user || !user.primaryEmailAddress?.emailAddress) {
      console.error("User email is missing! Cannot proceed.");
      setLoading(false);
      return;
    }

    const InputPrompt = `jobposition: ${jobPosition}, jobDesc: ${jobDesc}, job of experience: ${jobExperience}, 
            Generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in JSON format.`;

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      let MockjsonRes = result.response.text();

      // Clean AI response by removing unnecessary characters
      MockjsonRes = MockjsonRes.replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();

      let parsedJson;
      try {
        parsedJson = JSON.parse(MockjsonRes);
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        setLoading(false);
        return;
      }

      console.log("AI Response:", parsedJson);
      setJsonResponse(parsedJson);

      if (parsedJson) {
        const resp = await db
          .insert(MockInterview)
          .values({
            mockId: uuidv4(),
            jsonMockResp: JSON.stringify(parsedJson),
            jobPosition,
            jobDesc,
            jobExperience,
            createdBy: user?.primaryEmailAddress?.emailAddress || "unknown",
            createdAt: moment().toDate(),
          })
          .returning({ mockId: MockInterview.mockId });

        console.log("Inserted ID:", resp);
        if (resp.length > 0) {
          setOpenDailog(false);
          router.push(`/dashboard/interview/${resp[0]?.mockId}`);
        }
      } else {
        console.log("ERROR: AI response is empty.");
      }
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 border border-gray-300 rounded-xl bg-white hover:border-orange-400 hover:shadow-sm cursor-pointer transition-all group"
        onClick={() => {
          setOpenDailog(true);
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <svg
              className="w-6 h-6 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 group-hover:text-orange-500 transition-colors">
            Add New
          </h2>
        </div>
      </div>
      <Dialog open={openDailog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Tell us more about your job interview
            </DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit}>
                <div className="mt-4">
                  <p className="text-gray-600 mb-6">
                    Add details about your job position/role, job description,
                    and years of experience
                  </p>

                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Job Role/Job Position
                      </label>
                      <Input
                        placeholder="Ex. Full Stack Developer"
                        required
                        onChange={(event) => {
                          setJobPosition(event.target.value);
                        }}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Job Description/Tech Stack (In Short)
                      </label>
                      <Textarea
                        placeholder="Ex. React, Angular, NodeJs, MySQL, etc.."
                        required
                        onChange={(event) => {
                          setJobDesc(event.target.value);
                        }}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Years of Experience
                      </label>
                      <Input
                        placeholder="Ex. 5"
                        type="number"
                        max="50"
                        required
                        onChange={(event) => {
                          setJobExperience(event.target.value);
                        }}
                        className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenDailog(false);
                    }}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      "Start Interview"
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
