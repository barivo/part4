const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const username = 'mluukkai'
const password = 'password'

const loginHelper = async () => {
  const response = await api
    .post('/api/login')
    .send({ username, password })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const token = response.body.token

  return token
}

beforeAll(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await helper.createUsersAndBlogs()
})

describe('logged in users', () => {
  test('can add blogs', async () => {
    const token = await loginHelper()

    const blogsAtStart = await helper.blogsInDb()

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Node Testing',
        author: 'Bill Gates',
        url: 'www.microsoft.com',
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd.length).toBe(blogsAtStart.length + 1)
  })

  test('can delete their blogs', async () => {
    const token = await loginHelper()
    const blogs = await helper.blogsInDb()
    const blogId = blogs[0].id
    const user = await User.find({ username })

    await api
      .delete(`/api/blogs/${blogId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd.length).toBe(blogs.length - 1)
  })
})

describe('logged-out users', () => {
  beforeAll(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    await helper.createUsersAndBlogs()
  })

  test('can not add blogs', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api
      .post('/api/blogs')
      .send({
        title: 'Node Testing',
        author: 'Bill Gates',
        url: 'www.microsoft.com',
      })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd.length).not.toBe(blogsAtStart.length + 1)
  })

  test('can not delete any blogs', async () => {
    const blogs = await helper.blogsInDb()
    const blogId = blogs[0].id

    await api.delete(`/api/blogs/${blogId}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd.length).not.toBe(blogs.length - 1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
