const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

beforeAll(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await helper.createUsersAndBlogs()
})

describe('logged in users', () => {
  test('can add blogs', async () => {
    const username = 'mluukkai'
    const password = 'password'

    const response = await api
      .post('/api/login')
      .send({ username, password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = response.body.token

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
})

afterAll(() => {
  mongoose.connection.close()
})
