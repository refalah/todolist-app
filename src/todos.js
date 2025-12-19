const router = require("express").Router();
const Joi = require("joi");
const logger = require("pino")();

const apiLogger = (req, res, next) => {
  logger.info({ endpoint: `${req.method} ${req.baseUrl}${req.url}` });
  next();
};

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

const getTodos = (req, res, next) => {
  try {
    const params = req.query;
    const { error } = schemaUpdate.validate(params);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    const data = todosArr.filter((todo) => todo.status === params.status);

    const result = formatResponse(200, "Data successfully retrieved", data);
    res.send(result);
  } catch (error) {
    logger.info(error.message);
    next(error);
  }
};

const createTodos = (req, res, next) => {
  try {
    const payload = req.body;
    const { error } = schemaCreate.validate(payload);
    if (error) {
      error.statusCode = 400;
      return next(error);
    }

    todosArr.push({ id: todoId++, ...payload });
    const result = formatResponse(201, "Success without data");
    res.status(201).send(result);
  } catch (error) {
    logger.info(error.message);
    next(error);
  }
};

const updateTodos = (req, res, next) => {
  try {
    let result = {};
    const payload = req.body;
    const { error } = schemaUpdate.validate(payload);
    if (error) {
      error.statusCode = 400;
      return next(error);
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
    next(error);
  }
};

const deleteTodos = (req, res, next) => {
  try {
    let result = {};
    const id = Number(req.params.id);
    const todoIndex = todosArr.findIndex((todo) => todo.id === id);
    if (todoIndex >= 0) {
      todosArr.splice(todoIndex, 1);
      result = formatResponse(200, "Task deleted");
    } else {
      result = formatResponse(200, "Task not found");
    }

    res.status(200).send(result);
  } catch (error) {
    logger.info(error.message);
    next(error);
  }
};

router.get("/", apiLogger, getTodos);
router.post("/", apiLogger, createTodos);
router.patch("/:id", apiLogger, updateTodos);
router.delete("/:id", apiLogger, deleteTodos);

module.exports = router;
