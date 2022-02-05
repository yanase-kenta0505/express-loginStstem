var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var bodyParser = require("body-parser");
var csrf = require("csurf");
var app = express();
var db = require("../express-login/models").users;

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var csrfProtection = csrf({ cookie: false });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret word",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 1000,
    },
  })
);

app.get("/", csrfProtection, function (req, res) {
  res.render("index");
});
app.get("/myPage/:userId", csrfProtection, function (req, res) {
  console.log(req.session.userName);
  if (!req.session.userName) {
    res.redirect("/login");
  } else {
    res.render("myPage", { name: req.session.userName });
  }
});

app.get("/signUp", csrfProtection, (req, res) => {
  res.render("signUp", {
    err: "",
    name: "",
    email: "",
    password: "",
    csrfToken: req.csrfToken(),
  });
});

app.get("/login", csrfProtection, (req, res) => {
  res.render("login", {
    err: "",
    csrfToken: req.csrfToken(),
  });
});

app.get("/myPage", csrfProtection, (req, res) => {
  if (!req.session.userName) {
    res.redirect("login");
  } else {
    console.log(req.session.userName);
    res.redirect(`/myPage/${req.session.userName}`);
  }
});

app.get("/logOut", csrfProtection, (req, res) => {
  req.session.userName = undefined;
  res.redirect("/");
});

app.post("/regist", csrfProtection, (req, res) => {
  if (
    req.body.name === "" ||
    req.body.email === "" ||
    req.body.password === ""
  ) {
    res.render("signUp", {
      err: "全ての項目を埋めてください",
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      csrfToken: req.csrfToken(),
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

app.post("/login", csrfProtection, (req, res) => {
  if (
    req.body.name === "" ||
    req.body.email === "" ||
    req.body.password === ""
  ) {
    res.render("login", { err: "全ての項目を埋めてください" });
  } else {
    db.findAll({
      where: {
        email: req.body.email,
        password: req.body.password,
      },
    })
      .then((users) => {
        req.session.userName = users[0].name;
        res.redirect(`/myPage/${users[0].name}`);
      })
      .catch(() => {
        res.render("login", {
          err: "メールアドレスかパスワードが間違っています",
        });
      });
  }
});

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
