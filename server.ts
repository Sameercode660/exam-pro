import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { startExamBufferScheduler } from "@/utils/scheduler";
import { register } from "node:module";
import { ja } from "zod/v4/locales";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow your client URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const users = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("Connection established");
    socket.on("register", (user) => {
      users.set(user, socket);
      console.log(`${socket.id} is registered as ${user}`);
    });

    /********** exam adding, removing and restoring starts **********/
    // 1. exam adding notification
    socket.on("exam-added-admin", () => {
      const participantSocket = users.get("participant");

      if (participantSocket) {
        participantSocket.emit("exam-added", "added");
      }
    });

    // 2. exam remove notification
    socket.on("remove-exam-admin", () => {
      const participantSocket = users.get("participant");

      if (participantSocket) {
        participantSocket.emit("remove-exam", "remove");
      }
    });

    // 3. exam restoring notification
    socket.on("restore-exam-admin", () => {
      const participantSocket = users.get("participant");

      if (participantSocket) {
        participantSocket.emit("restore-exam", "restore");
      }
    });

    /********** exam adding, removing and restoring ends **********/

   /********** participant adding, removing and restoring starts **********/

    // 1. add participant notification
    socket.on("add-participant-admin", () => {
      const participantSocket = users.get("participant");

      if (participantSocket) {
        participantSocket.emit("add-participant", "added");
      }
    });
    // 2. remove participant notification
    socket.on("remove-participant-admin", () => {
      const participantSocket = users.get("participant");

      if (participantSocket) {
        participantSocket.emit("remove-participant", "removed");
      }
    });
    // 3. restore participant notification

    socket.on("restore-participant-admin", () => {
      const participantSocket = users.get("participant");

      if (participantSocket) {
        participantSocket.emit("restore-participant", "restored");
      }
    });
     /********** participant adding, removing and restoring ends **********/

    // update exam status notification

    socket.on("update-exam-status-admin", () => {
      const participantSocket = users.get("participant");

      if (participantSocket) {
        participantSocket.emit("update-exam-status", "status-updated");
      }
    });


    socket.on("disconnect", () => {
      for (const [key, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(key);
          console.log(`${key} disconnected and removed`);
        }
      }
    });
  });

  startExamBufferScheduler();
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
