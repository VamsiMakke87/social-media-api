const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const nodemailer= require("nodemailer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/post");
const commentRoute = require("./routes/comment");
const replyRoute = require("./routes/replies");
const mailRouter = require("./routes/mail");
const Notification = require("./models/notifications");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const authenticateJWT = require("./middleware/authMiddleware");

const app = express();
dotenv.config();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const connectDB = (async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connected");
  } catch (error) {
    console.error("Error connecting to the database", error);
    process.exit(1); // Exit process with failure
  }
})();
// connectDB();

app.use(
  cors({
    origin: process.env.SOCKET_URL,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("common"));
app.use("/api/auth", authRoute);
app.use("/api/users", authenticateJWT, userRoute);
app.use("/api/posts", authenticateJWT, postRoute);
app.use("/api/comment", authenticateJWT, commentRoute);
app.use("/api/comment/reply", authenticateJWT, replyRoute);
app.use("/api/mail", mailRouter);

const clients = new Map();

io.on("connection", (socket) => {
  try {
    const userId = socket.handshake.query.userId;

    if (userId) {
      console.log("Connected: ", userId);
      clients.set(userId, socket);
    } else {
      console.error("User ID is missing in the handshake query.");
    }

    socket.on("disconnect", () => {
      console.log(`${userId} disconnected`);
      clients.delete(userId);
    });
  } catch (err) {
    console.log(err);
  }
});



Notification.watch().on("change", (change) => {
  const notificationData = change.fullDocument;
  const client = clients.get(notificationData.toUserId);
  if (client) {
    client.emit("new_notification", {
      type: "new_notification",
      message: "You have a new notification!",
    });
    console.log(client, "sent", notificationData.toUserId);
  }
});

app.post("/api/");

server.listen(8800, () => {
  console.log("Server started");
});

