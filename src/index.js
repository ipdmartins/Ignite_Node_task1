const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((users) => users.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const newUser = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const newTodos = {
    id: uuidv4(),
    title: request.body.title,
    done: false,
    deadline: new Date(request.body.deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodos);

  return response.status(200).json(user.todos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const userUpdate = user.todos.map((tasks) => {
    if (tasks.id === id) {
      return {
        id,
        title: request.body.title,
        done: tasks.done,
        deadline: request.body.deadline,
        created_at: tasks.created_at,
      };
    }
    return tasks;
  });

  user.todos = userUpdate;

  return response.status(200).json(user.todos);
});

app.patch("/todos/:id/:done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id, done } = request.params;

  const userUpdate = user.todos.map((tasks) => {
    if (tasks.id === id) {
      return {
        id,
        title: tasks.title,
        done: Boolean(done),
        deadline: tasks.deadline,
        created_at: tasks.created_at,
      };
    }
    return tasks;
  });

  user.todos = userUpdate;

  return response.status(200).json(user.todos);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const index = user.todos.findIndex(tasks => tasks.id === id);

  user.todos.splice(index);

  return response.status(200).json(user.todos);
});

module.exports = app;
