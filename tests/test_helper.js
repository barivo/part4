const Blog = require('../models/blog')
const User = require('../models/user')
const mockBlogs = require('./mockBlog')
const bcrypt = require('bcrypt')

const initialBlogs = mockBlogs.slice(0, 2)

const nonExistingBlog = async () => {
  const blog = new Blog({
    title: 'will be deleted soon',
    author: 'foobar',
    url: 'www.foo.bar.com',
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((entries) => entries.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

const generatePasswordHash = async () => {
  return await bcrypt.hash('password', 10)
}

module.exports = {
  initialBlogs,
  nonExistingBlog,
  blogsInDb,
  usersInDb,
  generatePasswordHash,
}
