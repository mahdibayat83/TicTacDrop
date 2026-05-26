import express from 'express';
import { Server } from "socket.io";
import { createServer } from "node:http";
import cors from 'cors';

const port = 9010;
const app = express();

var corsOptions = {
  origin: 'localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

const httpServer = createServer(app);
const io = new Server(httpServer, {});

io.on("connection", (socket) => {
	console.log("connected:", socket.id);

	socket.on("join", (room = "global") => {
		socket.join(room);
		const clients = io.sockets.adapter.rooms.get(room);
		const count = clients ? clients.size : 0;
		let assigned = "spectator";
		if (count === 1) assigned = "X";
		else if (count === 2) assigned = "O";
		socket.emit("player-assign", assigned);
		io.to(room).emit("room-update", { count });
	});

	socket.on("move", (data) => {
		// data: { room, idx, player }
		socket.to(data.room || "global").emit("opponent-move", data);
	});

	socket.on("disconnect", () => {
		// nothing special yet
	});
});

httpServer.listen(port);
