const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const tasksFilePath = path.join(__dirname, "..", "tasks.json");

function readTasks() {
  if (!fs.existsSync(tasksFilePath)) {
    return [];
  }
  const data = fs.readFileSync(tasksFilePath, "utf8");
  return JSON.parse(data);
}

function writeTasks(tasks) {
  fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2), "utf8");
}

router.get("/tasks", (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

router.post("/tasks", (req, res) => {
  const tasks = readTasks();
  const now = new Date().toISOString();

  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

router.put("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const taskId = Number(req.params.id); 
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  task.completed = true;
  task.updatedAt = new Date().toISOString(); 
  writeTasks(tasks);
  res.json(task);
});

router.delete("/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const taskId = Number(req.params.id); // fix here
  const filteredTasks = tasks.filter((t) => t.id !== taskId);
  if (filteredTasks.length === tasks.length) {
    return res.status(404).json({ message: "Task not found" });
  }
  writeTasks(filteredTasks);
  res.status(204).send();
});

module.exports = router;
