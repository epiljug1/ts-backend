require("rootpath");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const errorHandler = require("./helpers/errorHandler");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/user.controller");
const postsRouter = require("./routes/post.controller");
const commentRouter = require("./routes/comment.controller");
const { attachUser } = require("./helpers/jwt");

const app = express();
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your React app's URL
  credentials: true, // To allow cookies
};
app.use(cors(corsOptions));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use(attachUser);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/comments", commentRouter);


// catch 404 and forward to error handler
app.use(errorHandler);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(5000, () => console.log(`Server is listening on PORT: 5000`));
module.exports = app;
