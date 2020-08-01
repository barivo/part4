const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const { response } = require("../app");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogRouter.get("/:id", async (request, response, next) => {
  const body = request.body;
  const id = request.params.id;
  const result = await Blog.findById(id);
  response.json(result);
});

blogRouter.post("/", async (request, response, next) => {
  const body = request.body;
  try {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    });
    const result = await blog.save();
    response.status(201).json(result);
  } catch (error) {
    response.status(400);
    next(error);
  }
});

blogRouter.delete("/:id", async (request, response, next) => {
  const id = request.params.id;

  const result = await Blog.findByIdAndRemove(id);
  response.status(204).end();
});

module.exports = blogRouter;
