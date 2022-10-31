const express = require("express");
const app = express();
const socket = require("socket.io");
const cors = require("cors");
const { get_Current_User, user_Disconnect, join_User } = require("./utils");

app.use(express());

const port = 8090;

app.use(cors());

let server = app.listen(
  port,
  console.log(
    `Server is running on the port no: ${(port)} `
      .green
  )
);

const io = socket(server, {
   cors: {
    origin: "https://chatapp-snakshay.netlify.app",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  //for a new user joining the room
  console.log("joined");
  socket.on("joinRoom", ({ userName, roomName }) => {
    console.log("joining room",{userName,roomName})
    const p_user = join_User(socket.id, userName, roomName);
    console.log(socket.id, "=id");
    socket.join(p_user.room);


    socket.broadcast.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `${p_user.username} has joined the chat`,
      align:"center"
    });
  });

  socket.on("chat", (text) => {
    console.log("chat",{text})
    const p_user = get_Current_User(socket.id);

    socket.broadcast.to(p_user?.room).emit("message", {
      userId: p_user?.id,
      username: p_user?.username,
      text: text,
      align:"left"
    });
  });

  socket.on("typing", () => {
    console.log("typing");
    try{

      const p_user = get_Current_User(socket.id);
      
      socket.broadcast.to(p_user?.room).emit("typing", {
        userId: p_user?.id,
        username: "",
        text: `${p_user?.username} is typing`,
        align:"left"
      });
    }catch(e){
      console.log(e)
    }
  });

  socket.on("disconnect", () => {
    const p_user = user_Disconnect(socket.id);

    if (p_user) {
      io.to(p_user.room).emit("message", {
        userId: p_user.id,
        username: p_user.username,
        text: `${p_user.username} has left the chat`,
        align:"center"
      });
    }
  });
});
