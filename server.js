import express from 'express';
import { Server } from "socket.io";
import { createServer } from "node:http";
import cors from 'cors';
import crypto from 'node:crypto';

const port = 9010;
const app = express();

var corsOptions = {
	origin: 'localhost:3000',
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost*",
		methods: ["GET", "POST"],
		credentials: true,
	},
});

const free_rooms = [];

io.on("connection", (socket) => {
	console.log("connected:", socket.id);

	socket.on("join", () => {
		let room_id = free_rooms.pop();
		if (room_id == undefined) {
			room_id = crypto.randomBytes(20).toString('hex');
			free_rooms.push(room_id);
		}
		socket.join(room_id);
		const clients = io.sockets.adapter.rooms.get(room_id);
		const count = clients ? clients.size : 0;
		let assigned = "spectator";
		if (count === 1) assigned = "X";
		else if (count === 2) assigned = "O";
		socket.emit("player-assign", assigned);
		io.to(room_id).emit("room-update", { count, room_id });
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
