const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.initialBlogs);
});

describe("when there are some inital blogs saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const res = await api.get("/api/blogs");

    expect(res.body).toHaveLength(helper.initialBlogs.length);
  });

  test("each returned blogs has the id property", async () => {
    const res = await api.get("/api/blogs");

    for (const blog of res.body) {
      expect(blog.id).toBeDefined();
    }
  });
});

describe("operation with one blog", () => {
  let token = "";
  let userId = "";

  beforeAll(async () => {
    const newUser = {
      username: "TestDavor",
      name: "Davor Komusanac",
      password: "lozinka555",
    };

    const res = await api.post("/api/users").send(newUser);
    userId = res.body.id;
    const loginRes = await api.post("/api/login").send(newUser);
    token = loginRes.body.token;
  });

  test("a valid blog can be added", async () => {
    const newBlog = {
      title: "NEW React patterns",
      author: "NEW Michael Chan",
      url: "https://NEWreactpatterns.com/",
      likes: 5,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const titles = blogsAtEnd.map((e) => e.title);
    expect(titles).toContain(newBlog.title);
  });

  test("if likes property is missing, it will default to 0", async () => {
    const newBlog = {
      title: "Likes NEW React patterns",
      author: "Likes NEW Michael Chan",
      url: "https://LIKESNEWreactpatterns.com/",
    };

    const res = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    expect(res.body.likes).toEqual(0);
  });

  test("if title and url properties are missing, throw error 400 Bad Request", async () => {
    const newBlog = {
      author: "NEW Michael Chan",
      likes: 5,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(newBlog)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test("a blog can be deleted", async () => {
    const blogToDelete = {
      title: "Test patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
    };

    const res = await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${token}`)
      .send(blogToDelete);

    await api
      .delete(`/api/blogs/${res.body.id}`)
      .set("Authorization", `bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

    const titles = blogsAtEnd.map((r) => r.title);
    expect(titles).not.toContain(blogToDelete.title);
  });

  test("a blog can be updated (increase likes by 1)", async () => {
    const startingBlogs = await helper.blogsInDb();
    let blogToUpdate = startingBlogs[0];
    blogToUpdate.likes = blogToUpdate.likes + 1;

    const res = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("Authorization", `bearer ${token}`)
      .send(blogToUpdate)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(res.body.likes).toEqual(blogToUpdate.likes);
  });

  test("blog creation fails if token is not provided", async () => {
    const newBlog = {
      title: "NEW React patterns",
      author: "NEW Michael Chan",
      url: "https://NEWreactpatterns.com/",
      likes: 5,
    };

    await api.post("/api/blogs").send(newBlog).expect(401);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

    const titles = blogsAtEnd.map((e) => e.title);
    expect(titles).not.toContain(newBlog.title);
  });

  afterAll(async () => {
    await User.deleteMany();
  });
});

afterAll(() => {
  mongoose.connection.close();
});
