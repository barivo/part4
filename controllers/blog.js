const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../tests/test_helper')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogRouter.get('/:id', async (request, response) => {
  const body = request.body
  const id = request.params.id
  const result = await Blog.findById(id)
  if (result) {
    response.json(result)
  } else {
    response.status(404).end()
  }
})

blogRouter.post('/', async (request, response) => {
  const body = request.body
  let user = null
  if (body.id) {
    user = await User.findById(body.id)
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user ? user._id : [],
  })

  const result = await blog.save()
  if (user) {
    user.blogs = user.blogs.concat(result._id)
    await user.save()
  }
  response.status(201).json(result)
})

blogRouter.put('/:id', (request, response) => {
  const body = request.body
  const id = request.params.id
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  Blog.findByIdAndUpdate(id, blog, { new: true }).then(updatedBlog => {
    response.json(updatedBlog.toJSON())
  })
})

blogRouter.delete('/:id', async (request, response) => {
  const id = request.params.id

  await Blog.findByIdAndRemove(id)
  response.status(204).end()
})

module.exports = blogRouter
