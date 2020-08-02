const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

describe('when users already exists in the database', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const users = [
      {
        id: mongoose.Types.ObjectId('any12charstr'),
        username: 'mluukkai',
        name: 'ull lukai',
        blogs: [],
      },
      {
        id: '303030303030303030303030',
        username: 'hellas',
        name: 'arto hellas',
        blogs: [],
      },
    ]

    const userObjArray = users
      .map(user => new User(user))
      .map(user => user.save())

    await Promise.all(userObjArray)
  })

  test('displays all the users', async () => {
    const users = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(users.body.map(user => user.username)).toContain('hellas')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
