const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const { response } = require("../app");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs.map((blog) => blog.toJSON()));
});

blogRouter.get("/:id", async (request, response) => {
  const body = request.body;
  const id = request.params.id;
  const result = await Blog.findById(id);
  if (result) {
    response.json(result);
  } else {
    response.status(404).end();
  }
});

blogRouter.post("/", async (request, response, next) => {
  const body = request.body;
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  });

  const result = await blog.save();
  response.status(201).json(result);
});

blogRouter.put("/:id", (request, response, next) => {
  const body = request.body;
  const id = request.params.id;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  Blog.findByIdAndUpdate(id, blog, { new: true })
    .then((updatedBlog) => {
      response.json(updatedBlog.toJSON());
    })
    .catch((error) => next(error));
});

blogRouter.delete("/:id", async (request, response) => {
  const id = request.params.id;

  await Blog.findByIdAndRemove(id);
  response.status(204).end();
});

module.exports = blogRouter;
