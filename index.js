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

  if (!users[id]) users[id] = { blackListed: false, tokens: [] };
  if (users[id].blackListed) {
    res.status(403);
    const error = new Error('Error:BL');
    return next(error);
  }

  setTimeout(() => {
    users[id].tokens[users[id].tokens.length - 1].blackListed = true;
    console.log(users[id]);
  }, 5000);
  const token = jwt.sign({ id, exp: Math.floor(Date.now() / 1000) + (2 * 60) }, SECRET);
  users[id].tokens.push({ token, blackListed: false });
  return res.json({ id, token, exp: Math.floor(Date.now() / 1000) + (2 * 60) });
});

app.get('/review/:id/:token', (req, res, next) => {
  const { token, id } = req.params;
  if (!users[id]) {
    res.status(401);
    const error = new Error('Error:ID');
    return next(error);
  }
  const isTokenBlackListed = users[id].tokens.filter(t => t.token === token);
  console.log(isTokenBlackListed);
  if (isTokenBlackListed.length > 0 && isTokenBlackListed[0].blackListed) {
    res.status(403);
    // users[id].blackListed = false;
    // users[id].tokens = users[id].tokens.filter(t => t !== token);
    const error = new Error('Error:BL');
    return next(error);
  }
  jwt.verify(token, SECRET, (error, decoded) => {
    if (error) {
      res.status(401);
      return next(error);
    }
    return res.json({
      ping: 'pong',
    });
  });
});

app.use((error, req, res, next) => {
  console.log('Error handler', error);
  res.json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});