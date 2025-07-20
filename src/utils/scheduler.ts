
import axios from "axios";

let schedulerStarted = false;

export function startExamBufferScheduler() {
  if (schedulerStarted) return; // Prevent multiple intervals in hot-reload dev

  schedulerStarted = true;

  console.log("Starting Exam Buffer Scheduler...");

  setInterval(async () => {
    try {
      console.log("Checking Exam Buffer...");

      const res = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/scheduling-utils/upcoming-exmas`);

      for (const exam of res.data.data) {
        await axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/participants/my-group/exam/schedule-activation`, {
          examId: exam.examId,
          startTime: exam.startTime,
          endTime: exam.endTime,
        });
      }

      console.log("Exam Buffer check complete. Processed:", res.data.data.length);
    } catch (err: any) {
      console.error("Scheduler Error:", err.message);
    }
  }, 24 * 60 * 60 * 1000); // Every 24 hours
}
