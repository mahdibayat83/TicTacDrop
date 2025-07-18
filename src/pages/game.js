import React, { useState } from "react";
import { checkWinner } from "../utils/checkWinner";

const initialBoard = Array(9).fill(null);

function TicTacToeLimited() {
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [moves, setMoves] = useState({ X: [], O: [] });

  const handleClick = (idx) => {
    if (board[idx] !== null || checkWinner(board)) return;

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
  };

  const winner = checkWinner(board);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Tic Toc Drop</h1>
      <h2 style={styles.status}>
        {winner ? `🎉 WINNER: ${winner}` : `your turn : ${currentPlayer}`}
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
