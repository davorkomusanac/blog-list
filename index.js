require("dotenv").config();
const http = require("http");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

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

//Connect to MongoDB
const mongoUrl = process.env.MONGODB_URI;
mongoose
  .connect(mongoUrl)
  .then((result) => console.log(`connected to MongoDB - ${result}`))
  .catch((error) => console.log(`error connecting to MongoDB - ${error}`));

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Blog = mongoose.model("Blog", blogSchema);
//

//POST new Blog item
app.post("/api/blogs", (request, response, next) => {
  const body = request.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  });

  blog
    .save()
    .then((savedBlog) => {
      response.json(savedBlog);
    })
    .catch((error) => next(error));
});

//Get blog items
app.get("/api/blogs", (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
