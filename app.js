var express = require("express");
var path = require("path");
var http = require("http");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var expressValidator = require("express-validator");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require("mongodb");
var mongoose = require("mongoose");
var socketIO = require("socket.io");
const connectDB = require("./config/database");

mongoose.connect("mongodb://localhost/blogtest");
var db = mongoose.connection;

var routes = require("./routes/index");
var users = require("./routes/users");

// Init App
var app = express();
const server = http.createServer(app);
const io = socketIO(server);

require("./socket/friend")(io);
// View Engine
app.set("views", path.join(__dirname, "views"));
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      ifIn: function (elem, list, options) {
        if (list.indexOf(elem) > -1) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
    },
    defaultLayout: "layout",
  })
);
app.set("view engine", "handlebars");

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Express Session
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());


// Connect Flash
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

app.use("/", routes);
app.use("/users", users);
// Set Port
app.set("port", process.env.PORT || 5000);

// app.listen(app.get('port'), function(){
// 	console.log('Server started on port '+app.get('port'));
// });

server.listen(app.get("port"), function () {
  connectDB();
  console.log("listening on port 5000");
});
