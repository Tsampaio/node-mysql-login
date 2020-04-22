const jwt = require('jsonwebtoken');
const db = require('../model/db');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return res.status(400).render("login", {
      message: 'Please provide email and password'
    });
  }

  // 2) Check if user exists && password is correct
  db.start.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
    console.log(results);
    console.log(password);
    const isMatch = await bcrypt.compare(password, results[0].password);
    console.log(isMatch);
    if(!results || !isMatch ) {
      return res.status(401).render("login", {
        message: 'Incorrect email or password'
      });
    } else {
      // 3) If everything ok, send token to client
      const id = results[0].id;
      console.log(id);
      const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
      res.cookie('jwt', token, cookieOptions);

      res.status(200).redirect("/");
    }
  });
};

exports.register = (req, res) => {
  console.log(req.body);
  const { name, email, password, passwordConfirm } = req.body;

  // 2) Check if user exists && password is correct
  db.start.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
    if(error) {
      console.log(error)
    }

    if(results.length > 0 ) {
      return res.render('register', {
                message: 'That Email has been taken'
              });
    } else if(password !== passwordConfirm) {
      return res.render('register', {
        message: 'Passwords do not match'
      });
    }
      
    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword);

    db.start.query('INSERT INTO users SET ?', { name: name, email: email, password: hashedPassword }, (error, result) => {
      if(error) {
        console.log(error)
      } else {
        db.start.query('SELECT id FROM users WHERE email = ?', [email], (error, result) => {
          const id = result[0].id;
          console.log(id);
          const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
          });

          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
          };
          res.cookie('jwt', token, cookieOptions);

          res.status(201).redirect("/");
        });
      }
    });
  });
};

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  console.log(req.cookies);
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      console.log("decoded");
      console.log(decoded);

      // 2) Check if user still exists
      db.start.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
        console.log(result)
        if(!result) {
          return next();
        }
        // THERE IS A LOGGED IN USER
        req.user = result[0];
        // res.locals.user = result[0];
        console.log("next")
        return next();
      });
    } catch (err) {
      return next();
    }
  } else {
    next();
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).redirect("/");
};