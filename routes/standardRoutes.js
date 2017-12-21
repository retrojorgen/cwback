const express = require('express')
const router = express.Router();

app.get('/user', authCheck, (req,res) => {
  getUser(function (user) {
    res.json(user);
  });
});