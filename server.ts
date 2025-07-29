import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { startExamBufferScheduler } from "@/utils/scheduler";
import prisma from "@/utils/prisma";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
// const port = Number(process.env.PORT) || 3000;
// const app = next({ dev, hostname, port });
 const app = next({ dev, port });

// const app = next({ dev });
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

  // client mapping
  const users = new Map<string, any>();

  // user online mapping for tracking
  const socketParticipantMap = new Map<string, string>();

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

    // user entry tracking
    socket.on("user-online", async ({ participantId }) => {
      const loginTime = new Date();
      socketParticipantMap.set(socket.id, participantId);
      console.log(`${participantId} came online`);
      const tracking = await prisma.participantTracking.create({
        data: {
          participantId: Number(participantId),
          loginTime,
          logoutTime: loginTime,
          spentTime: 0, // placeholder, will be updated on disconnect
        },
      });

      // Saving the sessionId (tracking.id) with the socket for later use
      socket.data = {
        participantId,
        sessionId: tracking.id,
        loginTime,
      };
    });

    socket.on("disconnect", async () => {
      const userId = socketParticipantMap.get(socket.id);
      const sessionId = socket.data?.sessionId;
      const loginTime = socket.data?.loginTime;

      if (userId) {
        users.delete(userId);
        socketParticipantMap.delete(socket.id);
        console.log(`${userId} disconnected and removed`);

        if (sessionId && loginTime) {
          const logoutTime = new Date();
          const spentTime = Math.floor((logoutTime.getTime() - new Date(loginTime).getTime())/1000);
          try {
            await prisma.participantTracking.update({
              where: { id: sessionId },
              data: {
                logoutTime,
                spentTime,
              },
            });
          } catch (err) {
            console.error("Error updating session tracking:", err);
          }
        }
      }

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
