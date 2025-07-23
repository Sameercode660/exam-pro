"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/auth/AuthContext";
import axios from "axios";
import { Loader2, User, ClipboardList, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/context/SocketContext";


interface Participant {
    participantId: number;
    name: string;
    email: string;
}

interface Exam {
    examId: number;
    title: string;
    status: string;
    examCode: string;
    startTime: string | null;
}

interface GroupInfo {
    groupId: number;
    name: string;
    description: string;
    createdAt: string;
    createdBy: string;
}

function GroupDetails() {
    const { groupId } = useParams();
    const { user } = useAuth();
    const router = useRouter();
    const participantId = user.id;

    const [group, setGroup] = useState<GroupInfo | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [examCodeInput, setExamCodeInput] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    // socket instance
    const socket = useSocket();


    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const res = await axios.post("/api/participants/my-group/fetch-group-details", {
                    participantId,
                    groupId: Number(groupId),
                });

                setGroup(res.data.group);
                setParticipants(res.data.participants);
                setExams(res.data.exams);
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to fetch group data");
            } finally {
                setLoading(false);
            }
        };

        if (groupId && participantId) {
            fetchGroupData();
        }
        if (socket) {
            socket.on("exam-added", () => {
                fetchGroupData();
            });

            socket.on('remove-exam', () => {
                fetchGroupData();
            })

            socket.on('restore-exam', () => {
                fetchGroupData();
            })
            socket.on('add-participant', () => {
                fetchGroupData();
            })
            socket.on('remove-participant', () => {
                fetchGroupData();
            })
            socket.on('restore-participant', () => {
                fetchGroupData();
            })
            socket.on('update-exam-status', () => {
                fetchGroupData();
            })
        }


        return () => {
            if (socket) {
                socket.off("exam-added");
                socket.off("remove-exam");
                socket.off("restore-exam");
                socket.off("add-participant");
                socket.off("remove-participant");
                socket.off("restore-participant");
                socket.off("update-exam-status");
            }
        };
    }, [groupId, participantId]);

    const handleAttempt = (exam: Exam) => {
        setSelectedExam(exam);
        setExamCodeInput("");
        setIsModalOpen(true);
    };

    const handleSubmitExamCode = () => {
        if (examCodeInput !== selectedExam?.examCode) {
            toast.error("Invalid Exam Code");
            return;
        }
        router.push(`/exam/${selectedExam.examId}`);
        setIsModalOpen(false);
    };

    const convertToActive = async (examId: number) => {
        try {
            await axios.post("/api/participants/my-group/exam/activate-exam", { examId });

            setExams((prev) =>
                prev.map((exam) =>
                    exam.examId === examId ? { ...exam, status: "Active" } : exam
                )
            );
            toast.success("Exam is now active!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to activate exam.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="text-center text-gray-500 text-xl mt-10">
                No group data available.
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{group.name}</h1>

            <div className="bg-white shadow-md rounded-xl p-6 mb-8 border border-gray-200">
                <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Description:</span> {group.description}
                </p>
                <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Created By:</span> {group.createdBy}
                </p>
                <p className="text-gray-600">
                    <span className="font-semibold">Created At:</span> {new Date(group.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-4 border">
                    <h2 className="text-xl font-semibold mb-3 flex items-center text-blue-500">
                        <User className="mr-2" /> Participants
                    </h2>
                    <ul className="space-y-2 text-gray-700">
                        {participants.map((p) => (
                            <li key={p.participantId} className="border-b pb-2">
                                {p.name} ({p.email})
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-4 border">
                    <h2 className="text-xl font-semibold mb-3 flex items-center text-green-500">
                        <ClipboardList className="mr-2" /> Exams
                    </h2>

                    <ul className="space-y-3 text-gray-700 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                        {exams.map((exam) => (
                            <li key={exam.examId} className="flex flex-col gap-2 border-b pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{exam.title}</p>
                                        <p className="text-sm text-gray-500">Code: {exam.examCode}</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${exam.status === "Active"
                                            ? "bg-green-100 text-green-600"
                                            : exam.status === "Scheduled"
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-blue-100 text-blue-600"
                                            }`}
                                    >
                                        {exam.status}
                                    </span>
                                </div>

                                {exam.status === "Active" ? (
                                    <button
                                        onClick={() => {
                                            router.push(`/home/my-groups/${groupId}/${exam.examId}`)
                                        }}
                                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center gap-2 transition"
                                    >
                                        <KeyRound size={18} />
                                        Attempt
                                    </button>
                                ) : exam.status === "Scheduled" ? (
                                    <CountdownTimer
                                        startTime={exam.startTime}
                                        onTimeUp={() => convertToActive(exam.examId)}
                                    />
                                ) : (
                                    <>

                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Exam Code Modal */}
            {/* <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter Exam Code</DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder="Enter exam code"
                        value={examCodeInput}
                        onChange={(e:React.ChangeEvent<HTMLInputElement>) => setExamCodeInput(e.target.value)}
                    />

                    <DialogFooter className="mt-4">
                        <Button onClick={() => {
                            router.push(`/home/my-groups/${groupId}/${examCodeInput}`)
                        }}>Start Exam</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}

        </div>
    );
}

export default GroupDetails;


// Countdown Timer Component
interface TimerProps {
    startTime: string | null;
    onTimeUp: () => void;
}

const CountdownTimer: React.FC<TimerProps> = ({ startTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!startTime) return;

        const target = new Date(startTime).getTime();
        const now = new Date().getTime();

        if (target <= now) {
            // Time is already up, directly activate
            onTimeUp();
            return;
        }

        const interval = setInterval(() => {
            const currentTime = new Date().getTime();
            const diff = target - currentTime;

            if (diff <= 0) {
                clearInterval(interval);
                onTimeUp();
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, onTimeUp]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    };

    if (timeLeft <= 0) return null;

    return (
        <div className="text-sm text-gray-600">
            Starts in: <span className="font-mono">{formatTime(timeLeft)}</span>
        </div>
    );
};
