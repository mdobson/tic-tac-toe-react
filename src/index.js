import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import cloneDeep from "lodash/cloneDeep";

import "./index.css";

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
  const players = Object.keys(props.sessionScore);
  const sessionScore = props.sessionScore;
  return (
    <div className="game-status-item">
      <div>Score:</div>
      <div className="score flex-row flex-center">
        <div className="individual-score">
          <div>{players[0]}</div>
          <div>{sessionScore[players[0]]}</div>
        </div>
        <div className="individual-score">
          <div>{players[1]}</div>
          <div>{sessionScore[players[1]]}</div>
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
  const [sessionScore, setSessionScore] = useState({ X: 0, Y: 0 });

  const current = history[history.length - 1];
  const currentWinner = calculateWinner(current.squares);

  function reset() {
    setHistory([{ squares: Array(9).fill(null) }]);
    setXIsNext(true);
  }

  function jumpTo(step) {
    if (currentWinner) {
      updateSessionScore(currentWinner, -1);
    }

    const newHistory = history.slice(0, step + 1);
    setHistory(newHistory);
    setXIsNext(step % 2 === 0);
  }

  function updateSessionScore(winner, inc) {
    const clonedScore = cloneDeep(sessionScore);
    const prevScore = clonedScore[winner];
    clonedScore[winner] = prevScore + inc;
    setSessionScore(clonedScore);
  }

  //Update the current game state with latest move
  function updateGameState(squares, i) {
    const clonedSquares = squares.slice();
    clonedSquares[i] = xIsNext ? "X" : "Y";
    setHistory(history.concat([{ squares: clonedSquares }]));
    setXIsNext(!xIsNext);

    const winner = calculateWinner(clonedSquares);
    if (winner) {
      updateSessionScore(winner, 1);
    }
  }

  function preventMove(squares, i) {
    return currentWinner || squares[i];
  }

  function handleClick(i) {
    if (preventMove(current.squares, i)) {
      return;
    }

    updateGameState(current.squares, i);
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
            <ScoreTable sessionScore={sessionScore} />
            <StatusIndicator
              winner={currentWinner}
              xIsNext={xIsNext}
              reset={reset}
            />
            <CurrentTurnIndicator turn={history.length} />
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
