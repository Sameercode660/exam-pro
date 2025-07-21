"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import ResultReview from "./ResultReview";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

const ResultPage = () => {
  const { examId } = useParams();
  const { user } = useAuth();

  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.post("/api/participants/my-group/exam/result", {
          examId: Number(examId),
          userId: user.id,
        });
        setResultData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (examId && user?.id) fetchResult();
  }, [examId, user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  return <ResultReview {...resultData} />;
};

export default ResultPage;
