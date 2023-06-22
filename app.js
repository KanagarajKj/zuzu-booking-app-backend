const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv').config();
const UserRegister = require('./models/UserRegister');
const USerLog = require ("./models/UserLog");
const routes = require("./routes/users");

app.use(cors({ credentials: true, origin: true }));
app.use(express.urlencoded());
app.use(express.json());

if (process.env.MONGODB_URL) {
  mongoose.connect(process.env.MONGODB_URL);
  console.log('Database Connected');
}
app.get('/', (req, res) => {
  res.send({ status: 'API is running' });
});

app.use('/', routes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
