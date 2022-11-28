import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import { sendWinner } from "./client";

const url = "http://localhost:8080";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

function MoveList(props) {
  const moves = props.history.map((step, move) => {
    const desc = move ? `Go to move # ${move}` : `Go to start`;
    return (
      <li key={move}>
        <button onClick={() => props.jumpTo(move)}>{desc}</button>
      </li>
    );
  });

  return (
    <div className="moves">
      <div>Move History:</div>
      <ol>{moves}</ol>
    </div>
  );
}

function CurrentTurnIndicator(props) {
  return <div className="game-status-item">Current Turn: {props.turn}</div>;
}

function StatusIndicator(props) {
  let status;
  if (props.winner) {
    status = `Winner ${props.winner}`;
  } else {
    status = `Next player: ${props.xIsNext ? "X" : "Y"}`;
  }

  return (
    <div className="game-status-item">
      <div>{status}</div>
      {props.winner && <ResetGameIndicator reset={props.reset} />}
    </div>
  );
}

function ScoreTable(props) {
  return (
    <div className="game-status-item">
      <div>Score:</div>
      <div className="score flex-row flex-center">
        <div className="individual-score">
          <div>{props.playerOne}</div>
          <div>{props.scoreState.X}</div>
        </div>
        <div className="individual-score">
          <div>{props.playerTwo}</div>
          <div>{props.scoreState.Y}</div>
        </div>
      </div>
    </div>
  );
}

function ResetGameIndicator(props) {
  return (
    <div>
      <button onClick={props.reset}>Reset Game</button>
    </div>
  );
}

function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null) }]);
  const [xIsNext, setXIsNext] = useState(true);
  const [stepNumber, setStepNumber] = useState(0);
  const [sessionScore, setSessionScore] = useState({ X: 0, Y: 0 });
  const [winner, setWinner] = useState(null);

  const current = history[stepNumber];

  const memoizedImmutableHistoryCall = useCallback(() => {
    const historyToUse = history;
    const traversableHistory = historyToUse.slice(0, stepNumber + 1);
    const current = traversableHistory[traversableHistory.length - 1];
    const squares = current.squares.slice();
    return squares;
  }, [history, stepNumber]);

  //Use effect to check for a winner?
  useEffect(() => {
    const currentState = memoizedImmutableHistoryCall();
    const calculatedWinner = calculateWinner(currentState);
    if (calculatedWinner) {
      sessionScore[calculatedWinner]++;
      setWinner(calculatedWinner);
      setSessionScore(sessionScore);
      sendWinner(url, calculatedWinner)
        .then(() => {
          console.log(`Winner ${calculateWinner} sent to server`);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [history, sessionScore, memoizedImmutableHistoryCall]);

  useEffect(() => {
    if (winner) {
      console.log("Send winner message");
    }
  }, [winner]);

  function reset() {
    setHistory([{ squares: Array(9).fill(null) }]);
    setXIsNext(true);
    setStepNumber(0);
    setWinner(null);
  }
  function jumpTo(step) {
    setStepNumber(step);
    setXIsNext(step % 2 === 0);
  }

  //Update the current game state with latest move
  function updateGameState(squares, i) {
    squares[i] = xIsNext ? "X" : "Y";
    setHistory(history.concat([{ squares: squares }]));
    setXIsNext(!xIsNext);
    setStepNumber(history.length);
  }

  function checkIfMovePossible(squares, i) {
    return calculateWinner(squares) || squares[i];
  }

  function handleClick(i) {
    const squares = memoizedImmutableHistoryCall(history);
    if (checkIfMovePossible(squares, i)) {
      return;
    }
    updateGameState(squares, i);
  }

  return (
    <div>
      <div className="flex-row flex-center">
        <h1>React Tic Tac Toe!</h1>
      </div>
      <div className="game flex-row flex-center">
        <div className="game-board">
          <Board squares={current.squares} onClick={(i) => handleClick(i)} />
        </div>
        <div className="game-info flex-row">
          <div className="game-status">
            <ScoreTable playerOne="X" playerTwo="Y" scoreState={sessionScore} />
            <StatusIndicator winner={winner} xIsNext={xIsNext} reset={reset} />
            <CurrentTurnIndicator turn={stepNumber + 1} />
          </div>
          <div className="game-status">
            <MoveList history={history} jumpTo={jumpTo} />
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  return null;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
