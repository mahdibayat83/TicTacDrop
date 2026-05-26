import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { checkWinner } from "../utils/checkWinner";

const initialBoard = Array(9).fill(null);

function TicTacToeLimited() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "offline";
  const room = params.get("room") || "global";

  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [moves, setMoves] = useState({ X: [], O: [] });
  const [player, setPlayer] = useState(null); // assigned by server in online mode

  const socketRef = useRef(null);

  useEffect(() => {
    if (mode === "online") {
      socketRef.current = io("http://localhost:9010", {
        transports: ["websocket", "polling"],
      });
      socketRef.current.on("connect", () => {
        socketRef.current.emit("join", room);
      });
      socketRef.current.on("player-assign", (p) => {
        setPlayer(p);
      });
      socketRef.current.on("opponent-move", (data) => {
        // data: { idx, player }
        setBoard((prev) => {
          const nb = [...prev];
          if (nb[data.idx] === null) nb[data.idx] = data.player;
          return nb;
        });
        setMoves((prevMoves) => {
          let pm = [...prevMoves[data.player]];
          if (pm.length === 3) pm.shift();
          pm.push(data.idx);
          return { ...prevMoves, [data.player]: pm };
        });
        setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [mode, room]);

  const handleClick = (idx) => {
    if (board[idx] !== null || checkWinner(board)) return;

    // In online mode, only allow if it's this client's turn
    if (mode === "online" && player && player !== currentPlayer) return;

    setBoard((prevBoard) => {
      const newBoard = [...prevBoard];

      if (moves[currentPlayer].length === 3) {
        const oldestMove = moves[currentPlayer][0];
        newBoard[oldestMove] = null;
      }

      newBoard[idx] = currentPlayer;
      return newBoard;
    });

    setMoves((prevMoves) => {
      let playerMoves = [...prevMoves[currentPlayer]];
      if (playerMoves.length === 3) {
        playerMoves.shift();
      }
      playerMoves.push(idx);
      return { ...prevMoves, [currentPlayer]: playerMoves };
    });

    // Emit move to server in online mode
    if (mode === "online" && socketRef.current) {
      socketRef.current.emit("move", { room, idx, player: currentPlayer });
    }

    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  };

  const winner = checkWinner(board);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tic Toc Drop</h1>
      <h2 style={styles.status}>
        {winner
          ? `🎉 WINNER: ${winner}`
          : mode === "online"
          ? player
            ? `your mode: online • you are: ${player} • turn: ${currentPlayer}`
            : `connecting...`
          : `your turn : ${currentPlayer}`}
      </h2>

      <div style={styles.board}>
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            style={{
              ...styles.cell,
              backgroundColor:
                cell === "X"
                  ? "#ff4e50"
                  : cell === "O"
                  ? "#1c92d2"
                  : "rgba(255,255,255,0.05)",
              color: "#fff",
            }}
          >
            {cell}
          </button>
        ))}
      </div>

      {winner && (
        <button onClick={() => window.location.reload()} style={styles.reset}>
          Rematch🔄
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: "linear-gradient(to right, #232526, #414345)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontFamily: "Vazirmatn, sans-serif",
    textAlign: "center",
    padding: 20,
  },
  title: {
    fontSize: 48,
    marginBottom: 10,
  },
  status: {
    fontSize: 24,
    marginBottom: 30,
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 100px)",
    gap: 15,
  },
  cell: {
    width: 100,
    height: 100,
    fontSize: 36,
    border: "none",
    borderRadius: 15,
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    transition: "all 0.2s ease-in-out",
  },
  reset: {
    marginTop: 30,
    padding: "10px 30px",
    fontSize: 18,
    backgroundColor: "#00c9ff",
    color: "#000",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
  },
};

export default TicTacToeLimited;
