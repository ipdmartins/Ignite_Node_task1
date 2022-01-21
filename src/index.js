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
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const existentUsername = users.find(
    (user) => user.username === request.body.username
  );

  if (existentUsername) {
    return response.status(400).json({ error: "Username already exists" });
  }

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

  return response.status(201).json(newTodos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const foundTodo = user.todos.find((todos) => todos.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: "Task does not exists" });
  }

  let updated;
  const userUpdate = user.todos.map((tasks) => {
    if (tasks.id === id) {
      updated = {
        id,
        title: request.body.title,
        done: tasks.done,
        deadline: request.body.deadline,
        created_at: tasks.created_at,
      };
      return updated;
    }
    return tasks;
  });

  user.todos = userUpdate;

  return response.status(200).json(updated);
});

app.patch("/todos/:id/:done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id, done } = request.params;

  const foundTodo = user.todos.find((todos) => todos.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: "Task does not exists" });
  }

  let updated;
  const userUpdate = user.todos.map((tasks) => {
    if (tasks.id === id) {
      updated = {
        id,
        title: tasks.title,
        done: Boolean(done),
        deadline: tasks.deadline,
        created_at: tasks.created_at,
      };
      return updated;
    }
    return tasks;
  });

  user.todos = userUpdate;

  return response.status(200).json(updated);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;

  const foundTodo = user.todos.find((todos) => todos.id === id);

  if (!foundTodo) {
    return response.status(404).json({ error: "Task does not exists" });
  }

  const index = user.todos.findIndex((tasks) => tasks.id === id);

  user.todos.splice(index);

  return response.status(204).send();
});

module.exports = app;
