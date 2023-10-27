import { Server } from "socket.io";
import User from "../models/userModel.js";
import saveChatHistory from "../routes/chatbots/whatsappIntegration/saveChatHistory.js";

let io;
export const socketConnection = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", (data) => {
      console.log(data);
      socket.join(data.uid);
    });

    socket.on("RECEIVE_LIVECHAT_MESSAGE", async (data) => {
      try {
        /**
         *
         *
         * get user by uid
         */
        const user = await User.findOne({ uid: data?.uid });
        await saveChatHistory({
          userId: user?._id,
          chatId: data?.chatId,
          source: "livechat",
          message: {
            from: data?.from,
            id: data?.messageId,
            message: data?.message,
            timestamp: Date.now(),
            type: data?.type,
          },
        });

        //emit new message event to eazyrooms user
        emitNewMessage({
          roomId: data?.uid,
          key: "NEW_MESSAGE",
          message: "",
        });

        //emit new message event to chat client
        emitNewMessage({
          roomId: data?.chatId,
          key: "NEW_MESSAGE",
          message: "",
        });
      } catch (err) {}
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export const emitNewMessage = ({ roomId, key, message }) => {
  io.to(roomId).emit(key, message);
};

export const getRooms = () => {
  io.sockets.adapter.rooms;
};
