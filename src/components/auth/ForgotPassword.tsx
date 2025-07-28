"use client";

import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/authentication/forgot-password", { email });

      toast.success(response.data.message || "Password sent to your email!");
      setEmail("");
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Forgot Password
        </h2>

        <form onSubmit={handleForgotPassword}>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Enter your email
          </label>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Password"}
          </button>
        </form>
        <div className="flex justify-center items-center mt-2.5">
            <span className="text-sm text-blue-500 underline cursor-pointer" onClick={() => router.push('/')}>Go to Login</span>
        </div>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
}
