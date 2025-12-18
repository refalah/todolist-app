const express = require("express");
const app = express();
const dotenv = require("dotenv");
const logger = require("pino")();
const PORT = 4000;
const todosController = require("./src/todos");

dotenv.config();

app.use(express.json());

app.use("/todos", todosController);

app.listen(PORT, () => {
  console.log(`Listening to Port: ${PORT}`);
});

app.use((err, req, res, next) => {
  logger.error(err.message);

  const statusCode = err.statusCode || 500;
  // console.log(err, "check err");
  return res.status(statusCode).json({
    status: "failed",
    message: err.message || "Internal server error",
  });
});
