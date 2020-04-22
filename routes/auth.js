const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});
router.post('/login', authController.login);

router.get('/register', (req, res) => {
  res.render('register');
});
router.post('/register', authController.register);


module.exports = router;