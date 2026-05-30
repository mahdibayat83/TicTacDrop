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

// Game logic helper
const checkWinner = (board) => {
	const lines = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8],
		[0, 3, 6], [1, 4, 7], [2, 5, 8],
		[0, 4, 8], [2, 4, 6]
	];

	for (const [a, b, c] of lines) {
		if (board[a] && board[a] === board[b] && board[b] === board[c]) {
			return board[a];
		}
	}
	return null;
};

// Room management
const rooms = new Map();

const createRoom = () => {
	return {
		id: crypto.randomBytes(20).toString('hex'),
		playerX: null,
		playerO: null,
		board: Array(9).fill(null),
		moves: { X: [], O: [] },
		currentPlayer: "X",
		winner: null,
		status: "waiting" // waiting, playing, finished
	};
};

io.on("connection", (socket) => {
	console.log("connected:", socket.id);

	socket.on("join", () => {
		// Find an available waiting room
		let room = null;
		for (const [roomId, roomData] of rooms.entries()) {
			if (roomData.status === "waiting" && roomData.playerX !== null && roomData.playerO === null) {
				room = roomData;
				break;
			}
		}

		// If no waiting room found, create new one
		if (room === null) {
			room = createRoom();
			rooms.set(room.id, room);
		}

		socket.join(room.id);
		socket.data.room = room.id;
		socket.data.player = null;

		// Assign player
		if (room.playerX === null) {
			room.playerX = socket.id;
			socket.data.player = "X";
		} else if (room.playerO === null) {
			room.playerO = socket.id;
			socket.data.player = "O";
			room.status = "playing";
		} else {
			socket.data.player = "spectator";
		}

		// Send initial state to joining player
		socket.emit("player-assign", {
			assigned: socket.data.player,
			board: room.board,
			currentPlayer: room.currentPlayer,
			room_id: room.id,
			playerCount: [room.playerX, room.playerO].filter(p => p !== null).length
		});

		// Notify all in room
		io.to(room.id).emit("room-update", {
			count: [room.playerX, room.playerO].filter(p => p !== null).length,
			room_id: room.id,
			status: room.status
		});
	});

	socket.on("move", (data) => {
		// data: { idx }
		const roomId = socket.data.room;
		const player = socket.data.player;

		if (!roomId || !player || player === "spectator") return;

		const room = rooms.get(roomId);
		if (!room) return;

		// Validate move
		if (room.board[data.idx] !== null) return;
		if (room.currentPlayer !== player) return;
		if (room.winner) return;

		// Process move
		if (room.moves[player].length === 3) {
			const oldestMove = room.moves[player].shift();
			room.board[oldestMove] = null;
		}

		room.board[data.idx] = player;
		room.moves[player].push(data.idx);

		// Check winner
		const winner = checkWinner(room.board);
		if (winner) {
			room.winner = winner;
			room.status = "finished";
		}

		// Switch player
		room.currentPlayer = room.currentPlayer === "X" ? "O" : "X";

		// Broadcast updated state
		io.to(roomId).emit("game-state-update", {
			board: room.board,
			currentPlayer: room.currentPlayer,
			winner: room.winner,
			moves: room.moves
		});
	});

	socket.on("rematch", () => {
		const roomId = socket.data.room;
		const room = rooms.get(roomId);

		if (!room) return;

		// Reset room
		room.board = Array(9).fill(null);
		room.moves = { X: [], O: [] };
		room.currentPlayer = "X";
		room.winner = null;
		room.status = "playing";

		// Broadcast updated state
		io.to(roomId).emit("game-state-update", {
			board: room.board,
			currentPlayer: room.currentPlayer,
			winner: room.winner,
			moves: room.moves
		});
	});

	socket.on("disconnect", () => {
		const roomId = socket.data.room;
		const room = rooms.get(roomId);

		if (room) {
			if (room.playerX === socket.id) room.playerX = null;
			if (room.playerO === socket.id) room.playerO = null;

			// Clean up empty rooms
			if (room.playerX === null && room.playerO === null) {
				rooms.delete(roomId);
			} else {
				// Notify remaining players
				io.to(roomId).emit("player-disconnected");
			}
		}
	});
});

httpServer.listen(port);
console.log(`Server running on port ${port}`);
