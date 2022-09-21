const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.post("/", (req, res, next) => {
  const body = req.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  });

  blog
    .save()
    .then((savedBlog) => res.json(savedBlog))
    .catch((error) => next(error));
});

blogsRouter.get("/", (req, res) => {
  Blog.find({}).then((blogs) => {
    res.json(blogs);
  });
});

module.exports = blogsRouter;
