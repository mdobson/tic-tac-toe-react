import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import cloneDeep from "lodash/cloneDeep";

import "./index.css";

import { ScoreKeeper } from "./score_keeper";
import { GameBoard } from "./game_board";

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
  const moves = props.history.history.map((step, move) => {
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
  const sessionScore = props.sessionScore.scores;
  const players = Object.keys(sessionScore);
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
  const [history, setHistory] = useState(new GameBoard().fill());
  const [xIsNext, setXIsNext] = useState(true);
  const [sessionScore, setSessionScore] = useState(
    new ScoreKeeper(["X", "Y"], 0)
  );

  const current = history.current();
  const currentWinner = history.checkWinner();

  function reset() {
    setHistory(history.fill());
    setXIsNext(true);
  }

  function jumpTo(step) {
    if (currentWinner) {
      updateSessionScore(currentWinner, -1);
    }

    const clonedHistory = cloneDeep(history);
    const newHistory = clonedHistory.getStep(step);
    setHistory(newHistory);
    setXIsNext(step % 2 === 0);
  }

  function updateSessionScore(winner, inc) {
    const clonedScore = cloneDeep(sessionScore);
    clonedScore.updateScore(winner, inc);
    setSessionScore(clonedScore);
  }

  //Update the current game state with latest move
  function updateGameState(squares, i) {
    const player = xIsNext ? "X" : "Y";
    const clonedHistory = cloneDeep(history);
    clonedHistory.setPosition(player, i);
    setHistory(clonedHistory);
    setXIsNext(!xIsNext);

    const winner = clonedHistory.checkWinner();
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

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
