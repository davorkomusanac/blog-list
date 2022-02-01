const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const config = require("./utils/config");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");
const app = express();
const blogsRouter = require("./controllers/blogs");

//Load middleware
app.use(express.json());
app.use(cors());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :postData"
  )
);
morgan.token("postData", (request, response) => {
  return JSON.stringify(request.body);
});
app.use(middleware.requestLogger);

const mongoUrl = config.MONGODB_URI;

mongoose
  .connect(mongoUrl)
  .then((result) => logger.info(`connected to MongoDB - ${result}`))
  .catch((error) => logger.error(`error connecting to MongoDB - ${error}`));

app.use("/api", blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
