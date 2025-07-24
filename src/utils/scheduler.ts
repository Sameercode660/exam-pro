import axios from "axios";

let schedulerStarted = false;

export function startExamBufferScheduler() {
  if (schedulerStarted) return; // Prevent multiple intervals in hot-reload dev

  schedulerStarted = true;

  console.log("Starting Exam Buffer Scheduler...");

  setInterval(async () => {
    try {
      console.log("Checking Exam Buffer...");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/scheduling-utils/upcoming-exams`
      );
      console.log(res.data);

      if (res.data.data.length > 0) {
        for (const exam of res.data.data) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/participants/my-group/exam/schedule-activation`,
            {
              examId: exam.examId,
              startTime: exam.startTime,
              endTime: exam.endTime,
            }
          );
        }

        console.log(
          "Exam Buffer check complete. Processed:",
          res.data.data.length
        );
      }

      const resGroup = await axios.get(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/groups/group-inactivation/fetch-sheduled-group-buffer`
      );

      console.log(resGroup.data);

      if (resGroup.data.data.length > 0) {
        for (const group of resGroup.data.data) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_DOMAIN}/api/groups/group-inactivation/group-expiry-cron`,
            {
              groupId: group.groupId,
              endDate: group.endDate,
            }
          );
        }
      }
    } catch (err: any) {
      console.error("Scheduler Error:", err.message);
    }
  }, 24 * 60 * 60 * 1000); 
}


