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

test('first test', async () => {
  // do stuff
})

afterAll(() => {
  mongoose.connection.close()
})
