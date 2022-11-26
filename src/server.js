const http = require("http");

http
  .createServer((req, res) => {
    res.writeHead(200, JSON.stringify({ hello: "world" }));
  })
  .listen(8080);
