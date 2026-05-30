import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const initialBoard = Array(9).fill(null);

function TicTacToeLimited() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "offline";
  const room = params.get("room") || "global";

  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [moves, setMoves] = useState({ X: [], O: [] });
  const [player, setPlayer] = useState(null);
  const [winner, setWinner] = useState(null);
  const [gameStatus, setGameStatus] = useState("waiting");

  const socketRef = useRef(null);

  useEffect(() => {
    if (mode === "online") {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Get server address - replace port 3000 with 9010
      const serverUrl = window.location.origin.replace(":3000", ":9010");
      
      socketRef.current = io(serverUrl, {
        transports: ["websocket", "polling"],
      });

      socketRef.current.on("connect", () => {
        socketRef.current.emit("join");
      });

      socketRef.current.on("player-assign", (data) => {
        setPlayer(data.assigned);
        setBoard(data.board);
        setCurrentPlayer(data.currentPlayer);
        setGameStatus(data.count === 2 ? "playing" : "waiting");
      });

      socketRef.current.on("room-update", (data) => {
        if (data.count === 2) {
          setGameStatus("playing");
        }
      });

      socketRef.current.on("game-state-update", (data) => {
        setBoard(data.board);
        setCurrentPlayer(data.currentPlayer);
        setWinner(data.winner);
        setMoves(data.moves);
      });

      socketRef.current.on("player-disconnected", () => {
        alert("Opponent disconnected!");
        setGameStatus("waiting");
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [mode]);

  const handleClick = (idx) => {
    // Offline mode
    if (mode === "offline") {
      if (board[idx] !== null || winner) return;

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

      setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));

      // Check winner after move
      const checkWinner = (b) => {
        const lines = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          [0, 4, 8], [2, 4, 6]
        ];
        for (const [a, b, c] of lines) {
          if (b[a] && b[a] === b[b] && b[b] === b[c]) {
            return b[a];
          }
        }
        return null;
      };

      const w = checkWinner(board);
      if (w) setWinner(w);
      return;
    }

    if (!player || player === "spectator" || board[idx] !== null || winner) return;
    if (player !== currentPlayer) return;


    if (socketRef.current) {
      socketRef.current.emit("move", { idx });
    }
  };

  const handleRematch = () => {
    if (mode === "online") {
      if (socketRef.current) {
        socketRef.current.emit("rematch");
      }
      setWinner(null);
    } else {
      setBoard(initialBoard);
      setCurrentPlayer("X");
      setMoves({ X: [], O: [] });
      setWinner(null);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tic Toc Drop</h1>
      <h2 style={styles.status}>
        {winner
          ? `🎉 WINNER: ${winner}`
          : mode === "online"
          ? player === "spectator"
            ? `spectator mode`
            : player
            ? `you are: ${player} • turn: ${currentPlayer}${currentPlayer === player ? " ✓" : ""}`
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
        <button onClick={handleRematch} style={styles.reset}>
          Rematch🔄
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    overflow: "hidden",
    height: "100%",
    width: "100%",
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
