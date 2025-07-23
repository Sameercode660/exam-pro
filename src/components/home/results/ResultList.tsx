'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';

interface Result {
  examId: number;
  examTitle: string;
  examDescription: string;
  examCreatedAt: string;
  examDuration: number;
  attemptedDate: string;
  groupName: string;
  teacher: string;
}

export default function ResultList() {
  const [results, setResults] = useState<Result[]>([]);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchResults();
  }, [query]);

  const fetchResults = async () => {
    try {
      const res = await axios.post('/api/participants/home-result/all-result', {
        participantId: user?.id,
        query,
      });
      setResults(res.data.results);
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">📊 My Attempted Exams</h1>
      <Input
        placeholder="Search by exam, group, teacher, or description..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6 max-w-md"
      />
      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
        <table className="min-w-full table-auto">
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Exam Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Group</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Teacher</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Created On</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Attempted On</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Duration</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {results.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-gray-400">
                  No results found.
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.examId} className="hover:bg-gray-50 transition-all">
                  <td className="px-4 py-3">{result.examTitle}</td>
                  <td className="px-4 py-3">{result.examDescription}</td>
                  <td className="px-4 py-3">{result.groupName}</td>
                  <td className="px-4 py-3">{result.teacher}</td>
                  <td className="px-4 py-3">{format(new Date(result.examCreatedAt), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3">{format(new Date(result.attemptedDate), 'dd MMM yyyy, hh:mm a')}</td>
                  <td className="px-4 py-3">{result.examDuration} mins</td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() => router.push(`/home/my-groups/result/${result.examId}`)}
                    >
                      View Result
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
