"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Percent } from "lucide-react";

interface AnswerFeedback {
  questionId: number;
  questionText: string;
  yourAnswer: string;
  correctAnswer: string;
  status: "correct" | "wrong";
}

interface ResultReviewProps {
  totalAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  percentage: number;
  correctAnswers: AnswerFeedback[];
  wrongAnswers: AnswerFeedback[];
}

const ResultReview: React.FC<ResultReviewProps> = ({
  totalAttempted,
  totalCorrect,
  totalWrong,
  percentage,
  correctAnswers,
  wrongAnswers,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Percent size={24} className="text-blue-500" />
            Your Exam Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6 text-gray-700 text-lg">
          <div>
            <p>Total Attempted: <span className="font-bold">{totalAttempted}</span></p>
            <p>Correct Answers: <span className="font-bold text-green-600">{totalCorrect}</span></p>
            <p>Wrong Answers: <span className="font-bold text-red-600">{totalWrong}</span></p>
          </div>
          <div className="flex flex-col justify-center items-center">
            <p className="text-lg font-semibold text-gray-600">Score</p>
            <p className={`text-4xl font-bold ${percentage >= 50 ? "text-green-500" : "text-red-500"}`}>
              {percentage}%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Correct Answers */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-green-700">✅ Correct Answers</h3>
        {correctAnswers.length === 0 && (
          <p className="text-gray-500">No correct answers.</p>
        )}
        {correctAnswers.map((item, index) => (
          <Card key={item.questionId} className="border border-green-300 shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle2 size={20} />
                <span>{index + 1}. {item.questionText}</span>
              </div>
              <p>Your Answer: <Badge className="bg-green-500 hover:bg-green-600">{item.yourAnswer}</Badge></p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wrong Answers */}
      <div className="space-y-4 mt-10">
        <h3 className="text-xl font-semibold text-red-700">❌ Wrong Answers</h3>
        {wrongAnswers.length === 0 && (
          <p className="text-gray-500">Great! You got everything correct.</p>
        )}
        {wrongAnswers.map((item, index) => (
          <Card key={item.questionId} className="border border-red-300 shadow-sm rounded-2xl">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <XCircle size={20} />
                <span>{index + 1}. {item.questionText}</span>
              </div>
              <p>Your Answer: <Badge className="bg-red-500 hover:bg-red-600">{item.yourAnswer}</Badge></p>
              <p>Correct Answer: <Badge className="bg-green-500 hover:bg-green-600">{item.correctAnswer}</Badge></p>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default ResultReview;
