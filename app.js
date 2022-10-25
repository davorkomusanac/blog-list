const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("express-async-errors");
const app = express();
const config = require("./utils/config");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

//Load middleware
app.use(express.json());
app.use(cors());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
app.use(middleware.userExtractor);

const mongoUrl = config.MONGODB_URI;
mongoose
  .connect(mongoUrl)
  .then((result) => logger.info(`connected to MongoDB - ${result}`))
  .catch((error) => logger.error(`error connecting to MongoDB - ${error}`));

app.use("/api/users", usersRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/login", loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
