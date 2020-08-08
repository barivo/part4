const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../tests/test_helper')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  })
  response.json(blogs.map(blog => blog.toJSON()))
})

blogRouter.get('/:id', async (request, response) => {
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
  const token = body.token ? body.token : null
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  let user = null
  if (body.id) {
    user = await User.findById(decodedToken.id)
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: body.userId ? [body.userId] : [],
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
  const blogId = request.params.id
  const blog = await Blog.findById(blogId)

  const body = request.body
  const token = body.token ? body.token : null

  const decodedToken = jwt.verify(token, process.env.SECRET)

  const user = await User.findById(decodedToken.id)

  if (
    typeof blog.user[0] === 'undefined' ||
    user._id.toString() !== blog.user[0].toString()
  ) {
    return response
      .status(401)
      .json({ error: 'only logged-in users may delete blogs' })
  }

  await Blog.findByIdAndRemove(blogId)

  user.blogs = user.blogs.filter(
    b => b.id.toString() !== request.params.id.toString()
  )
  await user.save()

  response.status(204).end()
})

module.exports = blogRouter
