export class ScoreKeeper {
  constructor(players, startingScore) {
    this.scores = {};
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      this.scores[player] = startingScore;
    }
  }

  incrementScore(player) {
    this.scores[player]++;
  }

  decrementScore(player) {
    this.scores[player]--;
  }

  updateScore(player, amount) {
    this.scores[player] += amount;
  }
}
