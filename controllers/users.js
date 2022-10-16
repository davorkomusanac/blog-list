const usersRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

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
  const users = await User.find({});
  res.json(users);
});

module.exports = usersRouter;
