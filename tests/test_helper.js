const Blog = require('../models/blog')
const User = require('../models/user')
const mockBlogs = require('./mockBlog')
const createUsers = require('./mockUsers')

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
  return blogs.map(entries => entries.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const createUsersAndBlogs = async () => {
  await createUsers()

  const users = await usersInDb()
  const randomUser = users[0]

  const testObjects = initialBlogs
    .map(entry => ({ ...entry, user: [randomUser.id] }))
    .map(entry => new Blog(entry))

  const promiseArray = testObjects.map(entry => entry.save())
  await Promise.all(promiseArray)
}

const randomUserId = async () => {
  const users = await usersInDb()
  if (users[0]) {
    return users[0].id
  } else {
    await createUsers()
    const users = await usersInDb()
    return users[0].id
  }
}

module.exports = {
  initialBlogs,
  nonExistingBlog,
  blogsInDb,
  usersInDb,
  createUsersAndBlogs,
}
