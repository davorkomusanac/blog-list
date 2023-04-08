const usersRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

usersRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username required" });
  }

  if (!password) {
    return res.status(400).json({ error: "password required" });
  }

  if (username.length < 3) {
    return res
      .status(400)
      .json({ error: "username length must be at least 3 characters long" });
  }

  if (password.length < 3) {
    return res
      .status(400)
      .json({ error: "password length must be at least 3 characters long" });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ error: "username must be unique" });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();
  res.status(201).json(savedUser);
});

usersRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", { user: 0 });
  res.json(users);
});

usersRouter.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "invalid user id" });
  }

  const user = await User.findById(req.params.id).populate("blogs", {
    user: 0,
  });

  if (!user) {
    return res.status(400).json({ error: "invalid user id" });
  }

  res.json(user);
});

usersRouter.delete("/:id", async (req, res) => {
  await User.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

module.exports = usersRouter;
