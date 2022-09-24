const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("express-async-errors");
const app = express();
const config = require("./utils/config");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const blogsRouter = require("./controllers/blogs");

//Load middleware
app.use(express.json());
app.use(cors());
app.use(middleware.requestLogger);

const mongoUrl = config.MONGODB_URI;
mongoose
  .connect(mongoUrl)
  .then((result) => logger.info(`connected to MongoDB - ${result}`))
  .catch((error) => logger.error(`error connecting to MongoDB - ${error}`));

app.use("/api/blogs", blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
