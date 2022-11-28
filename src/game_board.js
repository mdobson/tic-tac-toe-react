export class GameBoard {
  constructor() {
    this.history = [];
  }

  fill() {
    this.history = [{ squares: Array(9).fill(null) }];
    return this;
  }

  setPosition(character, index) {
    const clonedSquares = this.history[this.history.length - 1].squares.slice();
    clonedSquares[index] = character;
    this.history = this.history.concat([{ squares: clonedSquares }]);
    return this;
  }

  current() {
    return this.history[this.history.length - 1];
  }

  getStep(step) {
    this.history = this.history.slice(0, step + 1);
    return this;
  }

  checkWinner() {
    const squares = this.current().squares;
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
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }

    return null;
  }
}
