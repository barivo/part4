const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const mockBlog = require("./mockBlog");

beforeEach(async () => {
  await Blog.deleteMany({});
  let testBlog = new Blog(mockBlog[0]);
  await testBlog.save();

  testBlog = new Blog(mockBlog[1]);
  await testBlog.save();
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(2);
});

test("blog titles to contain 'React patterns'", async () => {
  const response = await api.get("/api/blogs");
  const titles = response.body.map(r => r.title);
  expect(titles).toContain("React patterns");
});

afterAll(() => {
  mongoose.connection.close();
});
