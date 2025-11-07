"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModal'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'


function RecordAnsQuestion({ mockInterviewQuestions, activeQuestionIndex ,interviewData}) {
    const [userAnswer ,setUserAnswer] =useState('');
    const [loading,setLoading]= useState(false);
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
      } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
      });
      const {user} = useUser();
      useEffect(()=>{
            results.map((result)=>(
                setUserAnswer(prevAns=>prevAns+result?.transcript)
            ))
      },[results])

      useEffect(()=>{
        if(!isRecording && userAnswer.length>10)
        {
            UpdateUserAnswer();
        }
        
      },[userAnswer])

      const StartStopRecording = async() =>{
        if(isRecording){
          
            stopSpeechToText();           
        }
        else{
            startSpeechToText();
        }
      }
      const UpdateUserAnswer =async()=>{
        console.log(userAnswer)
        setLoading(true)
        const feedbackPrompt ="Question:"+mockInterviewQuestions[activeQuestionIndex]?.question+",User Answer:"+userAnswer+",Depends on question and user answer for given interview question"+"plz give us rating for answer and feedback as area of improvement if any"+
        "in just 3 to 5 lines to improve it in JSON format in rating field and feedback field";

        const result =await chatSession.sendMessage(feedbackPrompt);

        // Clean AI response by removing unnecessary characters
        const mockjsonRes = result.response.text().replace('```json','').replace('```', '');
        console.log(mockjsonRes);
        const JsonFeedbackResp = JSON.parse(mockjsonRes);

        const resp = await db.insert(UserAnswer).values({
            mockIDRef:interviewData?.mockId,
            question:mockInterviewQuestions[activeQuestionIndex]?.question,
            correctAns:mockInterviewQuestions[activeQuestionIndex]?.answer,
            userAns:userAnswer,
            feedback:JsonFeedbackResp?.feedback,
            rating: JsonFeedbackResp?.rating,
            userEmail:user?.primaryEmailAddress?.emailAddress,
            createdAt:moment().format('DD-MM-yyyy')
        })
        if(resp) {
            toast('User Answer recorded successfully')
            setUserAnswer('');
            setResults([]);
        }
        setResults([]);
        setLoading(false);
      }
    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5'>
                <Image src={'/webcam2.png'} width={200} height={100} className='absolute' />
                <Webcam
                    mirrored={true}
                    style={{ height: 300, width: '100%', zIndex: 10 }}
                />
            </div>
            <Button
            disabled={loading}
            variant="outline" className="my-10" 
            onClick={StartStopRecording}>
                {isRecording?
                <h2 className='text-red-600 flex gap-2'><Mic/>Stop Recording</h2> :
                'Record Answer'}
                </Button>
        
        </div>
    )
}

export default RecordAnsQuestion
