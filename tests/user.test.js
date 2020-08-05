const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const createUsers = require('./mockUsers')
const helper = require('./test_helper')

test('first test', async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await helper.createUsersAndBlogs()
})

afterEach(async () => {
  await Blog.deleteMany({})
})

describe('when users already exists in the database', () => {
  beforeEach(async () => {
    await helper.createUsersAndBlogs()
  })

  test('displays all the users', async () => {
    const users = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(users.body.map(user => user.username)).toContain('hellas')
  })
})

describe('when adding a valid new user', () => {
  test('successfully adds user', async () => {
    const newUser = {
      username: 'newest',
      name: 'new user',
      password: 'password',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)

    const allUsers = await helper.usersInDb()

    expect(allUsers.map(user => user.username)).toContain('newest')
  })
})

describe('when adding an invalid new user', () => {
  test('adding a user with a username shorter than 3 characters long fails with an error message', async () => {
    const noUserName = {
      username: '',
      name: 'newuser',
      password: 'password',
    }

    const result = await api
      .post('/api/users')
      .send(noUserName)
      .expect(400)
    expect(result.body.error).toContain('`username` is required')
  })

  test('adding a name shorter than 3 characters long fails', async () => {
    const usersAtStart = await helper.usersInDb()

    const invalideName = {
      username: 'newuser2',
      name: 'nu',
      password: 'password',
    }

    await api
      .post('/api/users')
      .send(invalideName)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('using a password shorter than 3 characters long, fails', async () => {
    const invalideName = {
      username: 'newuser3',
      name: 'new user3',
      password: 'pa',
    }

    await api
      .post('/api/users')
      .send(invalideName)
      .expect(400)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
