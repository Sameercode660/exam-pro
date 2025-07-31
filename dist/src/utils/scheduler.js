"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExamBufferScheduler = startExamBufferScheduler;
const axios_1 = __importDefault(require("axios"));
let schedulerStarted = false;
function startExamBufferScheduler() {
    if (schedulerStarted)
        return; // Prevent multiple intervals in hot-reload dev
    schedulerStarted = true;
    console.log("Starting Exam Buffer Scheduler...");
    setInterval(async () => {
        try {
            console.log("Checking Exam Buffer...");
            const res = await axios_1.default.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/scheduling-utils/upcoming-exams`);
            console.log(res.data);
            if (res.data.data.length > 0) {
                for (const exam of res.data.data) {
                    await axios_1.default.post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/participants/my-group/exam/schedule-activation`, {
                        examId: exam.examId,
                        startTime: exam.startTime,
                        endTime: exam.endTime,
                    });
                }
                console.log("Exam Buffer check complete. Processed:", res.data.data.length);
            }
            const resGroup = await axios_1.default.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/groups/group-inactivation/fetch-sheduled-group-buffer`);
            console.log(resGroup.data);
            if (resGroup.data.data.length > 0) {
                for (const group of resGroup.data.data) {
                    await axios_1.default.post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/groups/group-inactivation/group-expiry-cron`, {
                        groupId: group.groupId,
                        endDate: group.endDate,
                    });
                }
            }
        }
        catch (err) {
            console.error("Scheduler Error:", err.message);
        }
    }, 24 * 60 * 60 * 1000);
}
