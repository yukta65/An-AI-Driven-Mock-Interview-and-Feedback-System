"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
    e.preventDefault();
    setLoading(true);

    if (!user?.primaryEmailAddress?.emailAddress) {
      console.error("User email missing");
      setLoading(false);
      return;
    }

    const InputPrompt = `jobposition: ${jobPosition}, jobDesc: ${jobDesc}, job of experience: ${jobExperience}, 
    Generate ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in JSON format.`;

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      let MockjsonRes = result.response.text();

      MockjsonRes = MockjsonRes.replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();

      let parsedJson;
      try {
        parsedJson = JSON.parse(MockjsonRes);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        setLoading(false);
        return;
      }

      setJsonResponse(parsedJson);

      const resp = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: JSON.stringify(parsedJson),
          jobPosition,
          jobDesc,
          jobExperience,
          createdBy: user.primaryEmailAddress.emailAddress,
          createdAt: moment().toDate(),
        })
        .returning({ mockId: MockInterview.mockId });

      if (resp.length > 0) {
        setOpenDailog(false);
        router.push(`/dashboard/interview/${resp[0]?.mockId}`);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Add New Card */}
      <div
        className="p-10 border border-gray-300 rounded-xl bg-white hover:border-orange-400 hover:shadow-sm cursor-pointer transition-all group"
        onClick={() => setOpenDailog(true)}
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
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 group-hover:text-orange-500 transition-colors">
            Add New
          </h2>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={openDailog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Tell us more about your job interview
            </DialogTitle>

            {/* ❌ FIX: Removed <p> and replaced with <div> */}
            <DialogDescription>
              <div>
                <form onSubmit={onSubmit}>
                  <div className="mt-4">
                    <p className="text-gray-600 mb-6">
                      Add details about your job position/role, job description,
                      and years of experience
                    </p>

                    <div className="space-y-5">
                      {/* Job Position */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Job Role/Job Position
                        </label>
                        <Input
                          placeholder="Ex. Full Stack Developer"
                          required
                          onChange={(e) => setJobPosition(e.target.value)}
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      {/* Job Description */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Job Description / Tech Stack
                        </label>
                        <Textarea
                          placeholder="Ex. React, Angular, NodeJs, MySQL..."
                          required
                          onChange={(e) => setJobDesc(e.target.value)}
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 min-h-[100px]"
                        />
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Years of Experience
                        </label>
                        <Input
                          placeholder="Ex. 5"
                          type="number"
                          max="50"
                          required
                          onChange={(e) => setJobExperience(e.target.value)}
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 justify-end mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpenDailog(false)}
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
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;
