"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Users } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/auth/AuthContext";
import { useRouter } from "next/navigation";

interface Group {
  groupId: number;
  groupName: string;
  description: string;
  specialInstruction: string;
  createdAt: string;
  createdBy: string;
  joinedAt: string;
}


const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();
  const participantId = user?.id;
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.post("/api/participants/my-group/fetch-all-joined-group", {
          participantId,
        });

        setGroups(res.data.groups);
      } catch (err: any) {
        console.error(err);
        toast.error(
          err.response?.data?.message || "Failed to fetch groups"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [participantId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center text-gray-500 text-xl mt-10">
        No groups found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
      {groups.map((group) => (
        <div
          key={group.groupId}
          className="bg-gradient-to-br from-white cursor-pointer via-gray-50 to-gray-100 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all border border-gray-200"
          onClick={() => {
            router.push(`/home/my-groups/${group.groupId}`)
          }}
        >
          <div className="flex items-center mb-4">
            <Users className="text-blue-500 mr-3 w-8 h-8" />
            <h2 className="text-xl font-bold text-gray-800">{group.groupName.toUpperCase()}</h2>
          </div>

          <p className="text-gray-600 mb-2">
            <span className="font-semibold">Description:</span> {group.description}
          </p>

          {/* <p className="text-gray-600 mb-2">
            <span className="font-semibold">Special Instruction:</span> {group.specialInstruction}
          </p> */}

          <p className="text-sm text-gray-500 mt-3">
            <span className="font-semibold">Created By:</span> {group.createdBy}
          </p>

          <p className="text-sm text-gray-500">
            <span className="font-semibold">Created At:</span>{" "}
            {new Date(group.createdAt).toLocaleDateString()}
          </p>

          <p className="text-sm text-gray-500">
            <span className="font-semibold">Joined At:</span>{" "}
            {new Date(group.joinedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
      <ToastContainer position="top-center"></ToastContainer>
    </div>
  );
};

export default GroupList;
