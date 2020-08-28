/*
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('../tests/test_helper')
const jwt = require('jsonwebtoken')
*/
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

router.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

router.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  response.status(201).json(blog)
})

router.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(request.body.token, process.env.SECRET)

  if (!request.body.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)
  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() !== user.id.toString()) {
    return response
      .status(401)
      .json({ error: 'only the creator can delete blogs' })
  }

  await blog.remove()

  user.blogs = user.blogs.filter(
    b => b.toString() !== request.params.id.toString()
  )
  await user.save()
  response.status(204).end()
})

router.put('/:id', async (request, response) => {
  const blog = request.body
  // check if user is signed in and the blog owner
  const decodedToken = jwt.verify(request.body.token, process.env.SECRET)

  if (!request.body.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blogInDB = await Blog.findById(request.params.id)

  // decodedToken.id is the logged in users id

  if (blogInDB.user[0].toString() === decodedToken.id) {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
    })
    response.json(updatedBlog.toJSON())
    console.log(updatedBlog.toJSON())
  } else {
    return response
      .status(401)
      .json({ error: 'only creators can modify blogs' })
  }
})

router.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  const decodedToken = jwt.verify(request.body.token, process.env.SECRET)

  if (!request.body.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  if (!blog.url || !blog.title) {
    return response.status(400).send({ error: 'title or url missing ' })
  }

  if (!blog.likes) {
    blog.likes = 0
  }

  blog.user = user
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

module.exports = router
