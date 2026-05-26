import express from 'express';
const { createServer } = require("http");
const { Server } = require("socket.io");

const port = 9010;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

io.on("connection", (socket) => {
	console.log(socket.id);
});

httpServer.listen(port);
