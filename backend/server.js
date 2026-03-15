require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initDB } = require('./config/db');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await initDB();
  console.log(`Server running on port ${PORT}`);
});