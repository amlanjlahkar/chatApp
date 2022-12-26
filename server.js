const path = require("path");
const http = require("http");
const express = require("express");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const {
  newUser,
  currentUser,
  roomUsers,
  leftUser,
} = require("./utils/user_info");
const formatMessage = require("./utils/format_message");
const notify = "Notification";

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = newUser(socket.id, username, room);

    socket.join(user.room);
    socket.emit("message", formatMessage(notify, "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(notify, `${user.name} has joined the room!`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: roomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = currentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.name, msg));
  });

  socket.on("disconnect", () => {
    const user = leftUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(notify, `${user.name} has left the room!`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: roomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
