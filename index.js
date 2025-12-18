const express = require("express");
const app = express();
const dotenv = require("dotenv");
const PORT = 4000;
const todosController = require("./src/todos");

dotenv.config();

app.use(express.json());

app.use("/todos", todosController);

app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err.message);
});

app.listen(PORT, () => {
  console.log(`Listening to Port: ${PORT}`);
});
