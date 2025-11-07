import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

const InterviewItemCard = ({ interview }) => {
  const router = useRouter();

  const onStart = () => {
    router.push("/dashboard/interview/" + interview?.mockId);
  };
  const onFeedbackpress = () => {
    router.push("/dashboard/interview/" + interview?.mockId + "/feedback");
  };
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white hover:border-orange-300 transition-all group">
      <div className="mb-4">
        <h2 className="font-bold text-lg text-gray-900 group-hover:text-orange-500 transition-colors">
          {interview?.jobPosition}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
          <h2 className="text-sm text-gray-600">
            {interview?.jobExperience} Years of Experience
          </h2>
        </div>
        <h2 className="text-xs text-gray-500 mt-2">
          Created:{" "}
          {interview?.createdAt
            ? new Date(interview.createdAt).toLocaleString()
            : "N/A"}
        </h2>
      </div>
      <div className="flex gap-3 mt-4">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
          onClick={onFeedbackpress}
        >
          Feedback
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          onClick={onStart}
        >
          Start
        </Button>
      </div>
    </div>
  );
};

export default InterviewItemCard;
