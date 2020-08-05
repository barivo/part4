const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
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

beforeEach(async () => {
  await Blog.deleteMany({})
  const testObjects = helper.initialBlogs.map(entry => new Blog(entry))
  const promiseArray = testObjects.map(entry => entry.save())
  await Promise.all(promiseArray)
})

test('returns the correct number of blog entries in json format', async () => {
  const initialBlogs = await helper.blogsInDb()
  const result = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(result.body.length).toBe(initialBlogs.length)
})

test("there is an 'id' property defined on each blog", async () => {
  const initialBlogs = await helper.blogsInDb()
  const result = await api.get(`/api/blogs/${initialBlogs[0].id}`).expect(200)

  expect(result.body.id).toBeDefined()
})

test('making an HTTP POST request to /api/blogs url creates a new post', async () => {
  const token = await loginHelper()

  const newPost = {
    title: 'Newest blog entry',
    author: 'testing',
    url: 'www.test.com',
    likes: 1,
  }

  const result = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newPost)
    .expect(201)
  expect(result.body.title).toContain(newPost.title)
})

test('if a new post without a likes propery is added, it defaults to 0 likes', async () => {
  const token = await loginHelper()

  const newPost = {
    title: 'Newest blog entry',
    author: 'testing',
    url: 'www.test.com',
  }

  const result = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newPost)
    .expect(201)
  expect(result.body.likes).toBe(0)
})

test('adding posts without a title and url fails with a 400 status code', async () => {
  const token = await loginHelper()

  const newPost = {
    title: '',
    author: 'testing',
    url: '',
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newPost)
    .expect(400)
})

afterAll(() => {
  mongoose.connection.close()
})
