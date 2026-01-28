require('dotenv').config();
const express = require('express');
const cors = require('cors');

const usersRoutes = require('./routes/users');
const integrationRoutes = require('./routes/integration');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', usersRoutes);
app.use('/api', integrationRoutes);

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});

module.exports = app;
