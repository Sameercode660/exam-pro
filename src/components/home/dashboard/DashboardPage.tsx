// app/(dashboard)/page.tsx or wherever your dashboard page is
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const sampleGraphData = [
  { date: "Mon", value: 40 },
  { date: "Tue", value: 60 },
  { date: "Wed", value: 30 },
  { date: "Thu", value: 80 },
  { date: "Fri", value: 70 },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Optional Header */}
      <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>

      {/* Top Section: Quick Links | Upcoming Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Links */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>⚡ Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="hover:underline cursor-pointer">View Exam</li>
              <li className="hover:underline cursor-pointer">View Results</li>
              <li className="hover:underline cursor-pointer">View Groups</li>
              {/* <li className="hover:underline cursor-pointer">Settings</li> */}
            </ul>
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>📝 Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <div className="border-b pb-2">
              <p className="font-semibold">Java Final Exam</p>
              <p className="text-xs text-gray-500">Date: Aug 25, 2025</p>
            </div>
            <div className="border-b pb-2">
              <p className="font-semibold">DSA Mock Test</p>
              <p className="text-xs text-gray-500">Date: Aug 27, 2025</p>
            </div>
            <div>
              <p className="font-semibold">Cyber Security Quiz</p>
              <p className="text-xs text-gray-500">Date: Sep 01, 2025</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Graph Data | Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graph Section */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>📈 Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sampleGraphData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle>📄 Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>July Exam Performance</span>
              <a className="text-indigo-600 hover:underline" href="#">View</a>
            </div>
            <div className="flex justify-between">
              <span>Participant Feedback</span>
              <a className="text-indigo-600 hover:underline" href="#">Download</a>
            </div>
            <div className="flex justify-between">
              <span>System Activity Logs</span>
              <a className="text-indigo-600 hover:underline" href="#">Analyze</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
