const express = require("express");
const Request = require("supertest");
const todo = require("./todos");

const app = express();
app.use(express.json());
app.use("/todos", todo);

test("should return data", async () => {
  await Request(app)
    .post("/todos")
    .send({ title: "Task 1", status: "pending" })
    .expect(201)
    .then((res) => {
      expect(res.body.message).toBe("Success without data");
    });
});
