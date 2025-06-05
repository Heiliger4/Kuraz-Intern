const fs = require('fs').promises;
const path = require('path');

const TASKS_FILE = path.join(__dirname, '../tasks.json');

const initializeTasksFile = async () => {
  try {
    await fs.access(TASKS_FILE);
  } catch (error) {
    await fs.writeFile(TASKS_FILE, JSON.stringify([]));
  }
};

const readTasks = async () => {
  await initializeTasksFile();
  const data = await fs.readFile(TASKS_FILE, 'utf8');
  return JSON.parse(data);
};

const writeTasks = async (tasks) => {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

exports.getAllTasks = async (req, res) => {
  try {
    let tasks = await readTasks();
    const { status } = req.query;

    if (status) {
      if (status === 'completed') {
        tasks = tasks.filter(t => t.completed === true);
      } else if (status === 'pending') {
        tasks = tasks.filter(t => t.completed === false);
      } else {
        return res.status(400).json({ error: "Invalid status filter. Use 'completed' or 'pending'." });
      }
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const tasks = await readTasks();
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const tasks = await readTasks();

    const newTask = {
      id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const tasks = await readTasks();
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.completed = true;
    task.updatedAt = new Date().toISOString();

    await writeTasks(tasks);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const tasks = await readTasks();
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

    tasks.splice(taskIndex, 1);
    await writeTasks(tasks);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
