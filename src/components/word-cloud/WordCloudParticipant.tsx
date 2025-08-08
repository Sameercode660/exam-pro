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
  const [words, setWords] = useState<any[]>([]);
  const [responseText, setResponseText] = useState("");
  const [wordCloudId, setWordCloudId] = useState<number | null>(null);

  const { user } = useAuth();
  const participantId = user?.id;
  const socket = useSocket();

  useEffect(() => {
    if (!participantId || !socket) return;

    // socket?.emit("register", `participant-${participantId}`);

    // socket?.on('response')
    
    const handleNewQuestion = async (data: any) => {
      setQuestion(data.title || null);
      setWordCloudId(data.id);

      try {
        const res = await axios.post("/api/word-cloud/frequency-count", {
          wordCloudId: data.id,
        });

        const freqWords = res.data; // Example: [{ word: "apple", count: 5 }]
        console.log(res.data)
        console.log(freqWords)
        setWords(freqWords);
      } catch (error) {
        console.error("Failed to fetch word frequencies", error);
      }
    };

    socket?.on("new-wordcloud-question", handleNewQuestion);

    return () => {
      socket?.off("new-wordcloud-question", handleNewQuestion);
    };
  }, [participantId, socket?.id]);

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

      try {
        const res = await axios.post("/api/word-cloud/frequency-count", {
          wordCloudId,
        });

        const freqWords = res.data; // Example: [{ word: "apple", count: 5 }]
        console.log(res.data)
        console.log(freqWords)
        setWords(freqWords);
      } catch (error) {
        console.error("Failed to fetch word frequencies", error);
      }
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
        words={words.map((word: any) => ({
          text: word.word,
          value: word.count,
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
