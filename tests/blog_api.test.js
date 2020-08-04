const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const createUsers = require('./mockUsers')
const helper = require('./test_helper')

describe('when the database has some entries saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await helper.createUsersAndBlogs()
  })

  test('blogs are returned as json', async () => {
    const result = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('blogs have creators', async () => {
    const blogs = await api.get('/api/blogs')
    const names = (await helper.usersInDb()).map(r => r.name)
    const user = blogs.body[0].user
    expect(names).toContain(user[0].name)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test("blog titles to contain 'React patterns'", async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    expect(titles).toContain('React patterns')
  })
})

describe('when adding a valid blog entry', () => {
  test('a valid blog entry can be added', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const users = await helper.usersInDb()
    const userId = users[0].id
    const entry = {
      title: 'New entry',
      author: 'testing',
      url: 'https://www.test.com/',
      likes: 17,
      id: userId,
    }

    await api
      .post('/api/blogs')
      .send(entry)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length + 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain('New entry')
  })

  test('the root blogs route displays creators', async () => {
    const blogs = await api.get('/api/blogs')
    const names = (await helper.usersInDb()).map(r => r.name)
    const user = blogs.body[0].user
    expect(names).toContain(user[0].name)
  })

  test("can updated an existing blog entry's likes", async () => {
    const blogsAtStart = await helper.blogsInDb()
    const entry = blogsAtStart[0]
    const updatedEntry = {
      title: entry.title,
      author: entry.author,
      url: entry.url,
      likes: entry.likes + 1,
    }

    const result = await api
      .put(`/api/blogs/${entry.id}`)
      .send(updatedEntry)
      .expect(200)

    expect(result.body.likes).toBe(entry.likes + 1)
  })
})

describe('when adding invalid blog entries', () => {
  test('blogs without authors are not added', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const badDataEntry = {
      title: 'Title only',
    }

    await api
      .post('/api/blogs')
      .send(badDataEntry)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
})

describe('when viewing a specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const entry = blogsAtStart[0]

    await api
      .get(`/api/blogs/${entry.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('fails with statuscode 404 if a blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingBlog()

    await api.get(`/api/blogs/${validNonexistingId}`).expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = 'xxx5a3d5da59070081a82a3445'

    await api.get(`/api/blogs/${invalidId}`).expect(400)
  })
})

describe('when deleting a blog', () => {
  test('can delete a blog entry', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const entry = blogsAtStart[0]

    await api.delete(`/api/blogs/${entry.id}`).expect(204)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
