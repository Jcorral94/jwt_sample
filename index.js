const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require('cors');
const app = express();
const path = require("path");
const PORT = 3232;
const SECRET = 'JASNDCVJ ABA';

const users = {};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.post('/token/create', (req, res, next) => {
  const { id } = req.body;

  if (!users[id]) users[id] = { blackListed: false };
  if (users[id].blackListed) return res.json({ error: 'beep boop' })

  setTimeout(() => {
    users[id].blackListed = true;
  }, 25000);
  const token = jwt.sign({ id, exp: Math.floor(Date.now() / 1000) + (2 * 60) }, SECRET);
  return res.json({ id, token, exp: Math.floor(Date.now() / 1000) + (2 * 60) });
});

app.get('/review/:id/:token', (req, res) => {
  const { token, id } = req.params;
  jwt.verify(req.params.token, SECRET, (error, decoded) => {
    if (error) next(error);
    if (users[id].blackListed) next('Blacklisted');
    res.json({
      ping: 'pong'
    });
  });
});

app.use((error, req, res, next) => {
  res.json({ error });
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});