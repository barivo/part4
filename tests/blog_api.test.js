const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const helper = require("./test_helper");
const { default: test_helper } = require("./test_helper");
const { default: blogs } = require("./mockBlog");

describe("when the database has some entries saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const testObjects = helper.initialBlogs.map((entry) => new Blog(entry));
    const promiseArray = testObjects.map((entry) => entry.save());
    const result = await Promise.all(promiseArray);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");
    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test("blog titles to contain 'React patterns'", async () => {
    const response = await api.get("/api/blogs");
    const titles = response.body.map((r) => r.title);
    expect(titles).toContain("React patterns");
  });
});

describe("when adding a new blog", () => {
  test("a valid blog entry can be added", async () => {
    const entry = {
      title: "New entry",
      author: "testing",
      url: "https://www.test.com/",
      likes: 17,
    };

    await api
      .post("/api/blogs")
      .send(entry)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const titles = blogsAtEnd.map((r) => r.title);
    expect(titles).toContain("New entry");
  });

  test("can updated an existing blog entry's likes", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const entry = blogsAtStart[0];
    const updatedEntry = {
      title: entry.title,
      author: entry.author,
      url: entry.url,
      likes: entry.likes + 1,
    };

    result = await api
      .put(`/api/blogs/${entry.id}`)
      .send(updatedEntry)
      .expect(200);

    expect(result.body.likes).toBe(entry.likes + 1);
  });

  test("blog without an author is not added", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const badDataEntry = {
      title: "Title only",
    };

    await api.post("/api/blogs").send(badDataEntry).expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
  });
});

describe("when viewing a specific blog", () => {
  test("a specific blog can be viewed", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const entry = blogsAtStart[0];

    const result = await api
      .get(`/api/blogs/${entry.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("fails with statuscode 404 if a blog does not exist", async () => {
    const validNonexistingId = await helper.nonExistingBlog();

    console.log(validNonexistingId);

    const result = await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "xxx5a3d5da59070081a82a3445";

    await api.get(`/api/blogs/${invalidId}`).expect(400);
  });
});

describe("when deleting a blog", () => {
  test("can delete a blog entry", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const entry = blogsAtStart[0];

    await api.delete(`/api/blogs/${entry.id}`).expect(204);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
