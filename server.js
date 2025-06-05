require('dotenv').config();

const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const path = require('path');

const app = express();

app.use(express.json());
app.use('/api', taskRoutes);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
});
