const http = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || process.env.E2E_PORT || "3100", 10);
const hostname =
  process.env.HOSTNAME ||
  process.env.HOST ||
  process.env.E2E_HOST ||
  "127.0.0.1";

const app = next({ dev: true, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.on("error", (error) => {
      console.error("Failed to start Next.js server", error);
      process.exit(1);
    });

    server.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to prepare Next.js app", error);
    process.exit(1);
  });
