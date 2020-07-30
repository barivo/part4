const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("there is one blog entry", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(1);
});

test("blog title to be 'First Post'", async () => {
  const response = await api.get("/api/blogs");
  console.log(response);
  expect(response.body[0].title).toContain("First");
});

afterAll(() => {
  mongoose.connection.close();
});
