const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

blogsRouter.post("/", async (req, res) => {
  const body = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "invalid user credentials" });
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  res.status(201).json(savedBlog);
});

blogsRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  res.json(blogs);
});

blogsRouter.delete("/:id", async (req, res) => {
  const user = req.user;
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ error: "invalid blog id" });
  }

  if (!user || !blog.user) {
    return res.status(403).json({ error: "invalid user credentials" });
  }

  if (blog.user.toString() === user.id.toString()) {
    await blog.delete();
    user.blogs = user.blogs.filter((b) => b !== blog._id.toString());
    await user.save();
    res.status(204).end();
  } else {
    res
      .status(401)
      .json({ error: "you do not have permission to delete this blog" });
  }
});

blogsRouter.put("/:id", async (req, res) => {
  const { likes } = req.body;
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "invalid user credentials" });
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    { likes },
    { new: true, runValidators: true, context: "query" }
  );
  res.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
