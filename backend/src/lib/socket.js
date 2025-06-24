// Integrating Socket.io for real time feature 
// Socket.io allows for the client side to listen , like our server in the backend is listening for requests
// now the client i.e the react application can also listen for these and then update the frontend accordingly 
// Earlier , when a user was sending a message to another user , then first there is a request sent to the server , the server processes the request 
// and then saves the message into the database , but this way the client has to refresh the page to get the new message on the screen
// socket.io allows us to send this message directly to the client also

import {Server} from "socket.io";
import http from "http";
import express from "express";

const app = express()
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// used to store online users
let userSocketMap = {} // {user._id: socket.id}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;
    console.log("User id:",userId);
    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export {io, app, server};
