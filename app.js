var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session");
var app = express();
var db = require("../express-login/models").users;

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler


app.get("/signUp", (req, res) => {
  res.render("signUp", {
    err: "",
    name: "",
    email: "",
    password: "",
  });
});

app.post("/regist", (req, res) => {
  if (
    req.body.name === "" ||
    req.body.email === "" ||
    req.body.password === ""
  ) {
    // res.redirect('/signUp')
    res.render("signUp", {
      err: "全ての項目を埋めてください",
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
  } else {
    db.findOrCreate({
      where: { email: req.body.email },
      defaults: {
        // 新規登録するデータ
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
      .then(() => {
        res.redirect("login");
      })
      .catch((err) => {
        console.log(err);
      });
  }
});




app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
