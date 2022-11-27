const http = require("http");

const winCounter = {
  X: 0,
  Y: 0,
};

http
  .createServer((req, res) => {
    if (req.method === "POST") {
      const winner = req.url.split("/")[1];
      if (winner !== "X" && winner !== "Y") {
        return res.writeHead(404).end();
      }
      winCounter[winner]++;
    }
    return res
      .writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      })
      .end(JSON.stringify(winCounter));
  })
  .listen(8080);
