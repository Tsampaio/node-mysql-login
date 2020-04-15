const express = require('express');
const mysql = require('mysql');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const bcrypt = require('bcryptjs');

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.set('view engine', 'hbs');

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs'
});

db.connect(function(err) {
  if(err) {
    console.log('Error connecting to the database');
  } else {
    console.log('Connected to MYSQL');
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Home Page</h1>');
});

app.listen(5000, () => {
  console.log("listening on port 5000");
})