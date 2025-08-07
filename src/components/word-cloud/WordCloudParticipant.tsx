"use client";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/auth/AuthContext";
import { useSocket } from "@/context/SocketContext";
import VisxWordCloud from "./VisxWordCloud";

export default function WordCloudParticipant() {
  const [question, setQuestion] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [responseText, setResponseText] = useState("");
  const [wordCloudId, setWordCloudId] = useState<number | null>(null);

  const { user } = useAuth();
  const participantId = user?.id;
  const socket = useSocket();

  useEffect(() => {
    if (!participantId) return;

    socket?.emit("register", `participant-${participantId}`);

    const handleNewQuestion = (data: any) => {
      setQuestion(data.title || null);
      setWords(data.words.split(","));
      setWordCloudId(data.id);
    };

    socket?.on("new-wordcloud-question", handleNewQuestion);

    return () => {
      socket?.off("new-wordcloud-question", handleNewQuestion);
    };
  }, [participantId]);

  const handleSubmit = async () => {
    if (!responseText || !wordCloudId) {
      toast.error("Please enter your response before submitting.");
      return;
    }

    try {
      await axios.post("/api/word-cloud/submit-response", {
        wordCloudId,
        participantId,
        responseText,
      });

      toast.success("Response submitted successfully!");
      setResponseText("");
    } catch (error: any) {
      const message =
        error?.response?.data?.error || "Something went wrong while submitting response.";
      toast.error(message);
    }
  };

  if (!words.length) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto mt-8 border rounded-xl shadow space-y-4">
      {question && <h3 className="text-lg font-semibold">{question}</h3>}

      <VisxWordCloud
        words={words.map((word) => ({
          text: word,
          value: 30,
        }))}
      />

      <Textarea
        placeholder="Write your response here..."
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
      />

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
