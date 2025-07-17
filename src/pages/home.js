import React, { useState } from "react";
import { checkWinner } from "../utils/checkWinner";
const initialBoard = Array(9).fill(null);

function TicTacToeLimited() {
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [moves, setMoves] = useState({ X: [], O: [] });

  const handleClick = (idx) => {
    if (board[idx] !== null) return; 
    if (checkWinner(board)) return;  

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
    <div>
      <h2>{winner ? `برنده: ${winner}` : `نوبت: ${currentPlayer}`}</h2>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 100px)"}}>
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            style={{ width: 100, height: 100, fontSize: 24 }}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TicTacToeLimited;
