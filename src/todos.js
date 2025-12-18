const router = require("express").Router();
const Joi = require("joi");
const logger = require("pino")();

const schemaCreate = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  status: Joi.string().min(3).max(12).required().valid("pending", "done"),
});

const schemaUpdate = Joi.object({
  status: Joi.string().min(3).max(12).required().valid("pending", "done"),
});

const todosArr = [];
let todoId = 1;

const formatResponse = (statusCode, message, data) => {
  const res = {
    statusCode,
    status: statusCode.toString().includes("20") ? "success" : "failed",
    data: data || null,
    message: message || "Error occured",
  };

  return res;
};

const getTodos = (req, res) => {
  try {
    const params = req.query;
    const { error } = schemaUpdate.validate(params);
    if (error) {
      return res.status(400).send({ message: error.message });
    }
    const data = todosArr.filter((todo) => todo.status === params.status);

    const result = formatResponse(200, "Data successfully retrieved", data);
    res.send(result);
  } catch (error) {
    logger.info(error.message);
    res.status(500).send({ message: "Internal server error" });
  }
};

const createTodos = (req, res) => {
  try {
    const payload = req.body;
    const { error } = schemaCreate.validate(payload);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    todosArr.push({ id: todoId++, ...payload });
    const result = formatResponse(201, "Success without data");
    res.status(201).send(result);
  } catch (error) {
    logger.info(error.message);
    res.status(500).send({ message: "Internal server error" });
  }
};

const updateTodos = (req, res) => {
  try {
    let result = {};
    const payload = req.body;
    const { error } = schemaUpdate.validate(payload);
    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const id = Number(req.params.id);

    const todoIndex = todosArr.findIndex((todo) => todo.id === id);
    if (todoIndex >= 0) {
      todosArr[todoIndex].status = payload.status;
      result = formatResponse(200, "Task successfully updated");
    } else {
      result = formatResponse(200, "Task not found");
    }

    res.status(200).send(result);
  } catch (error) {
    logger.info(error.message);
    res.status(500).send({ message: "Internal server error" });
  }
};

const deleteTodos = (req, res) => {
  try {
    let result = {};
    const id = Number(req.params.id);
    const todoIndex = todosArr.findIndex((todo) => todo.id === id);
    todosArr.splice(todoIndex, 1);
    result = formatResponse(200, "Task deleted");

    res.status(200).send(result);
  } catch (error) {
    logger.info(error.message);
    res.status(500).send({ message: "Internal server error" });
  }
};

router.get("/", getTodos);
router.post("/", createTodos);
router.patch("/:id", updateTodos);
router.delete("/:id", deleteTodos);

module.exports = router;
