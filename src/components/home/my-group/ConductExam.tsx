"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Clock, SendHorizonal } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/auth/AuthContext";

interface Option {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

interface Exam {
  examId: number;
  title: string;
  duration: number; // in minutes
}

const ConductExam: React.FC = () => {
  const { examId } = useParams();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();
  const userId = user.id;
  const {examCode} = useParams();

  // Fetch exam details
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.post("/api/participants/my-group/exam/conduct", { examCode });

        setExam(res.data.exam);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.exam.duration * 60); // convert minutes to seconds
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to fetch exam");
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchExam();
  }, [examId]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/api/participants/my-group/exam/submit", {
        examId,
        userId,
        answers,
      });

      toast.success("Exam submitted successfully!");
      router.push("/exam/thank-you");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  const attemptedCount = Object.keys(answers).length;
  const timeElapsed = exam ? exam.duration * 60 - timeLeft : 0;
  const isHalfAttempted = attemptedCount >= questions.length / 2;
  const isHalfTime = exam ? timeElapsed >= (exam.duration * 60) / 2 : false;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center text-gray-500 text-xl mt-20">
        Exam not found.
      </div>
    );
  }

  const currentQuestion = questions[currentQ];

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 space-y-6 bg-white shadow-xl rounded-3xl border border-gray-200">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {exam.title}
        </h2>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={20} />
          <span className="font-mono">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-700">
            Q{currentQ + 1}: {currentQuestion.text}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={opt.id}
                onClick={() => handleOptionSelect(currentQuestion.id, idx + 1)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition 
                ${answers[currentQuestion.id] === idx + 1
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-white hover:bg-gray-100"
                  }`}
              >
                {opt.text}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <Button
              onClick={() => setCurrentQ((prev) => Math.max(prev - 1, 0))}
              disabled={currentQ === 0}
              variant="outline"
            >
              Previous
            </Button>

            <Button
              onClick={() =>
                setCurrentQ((prev) =>
                  Math.min(prev + 1, questions.length - 1)
                )
              }
              disabled={currentQ === questions.length - 1}
            >
              Next
            </Button>
          </div>

          {(isHalfAttempted || isHalfTime) && (
            <Button
              onClick={handleSubmit}
              className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 transition"
            >
              <SendHorizonal size={18} />
              Submit Exam
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default ConductExam;
