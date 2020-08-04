const listHelper = require('../utils/list_helper')
const blogs = require('./mockBlog')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

test('total likes returns 36', () => {
  const result = listHelper.totalLikes(blogs)
  expect(result).toBe(36)
})

test('when list has only one blog equals the likes of that', () => {
  const listWithOneBlog = blogs[0]
  const result = listHelper.totalLikes([listWithOneBlog])
  expect(result).toBe(7)
})

test('returns the blog entry with the most likes', () => {
  const mostLiked = {
    _id: '1a',
    title: 'Number One',
    author: 'Someone Very Popular',
    url: 'http://www.topspot.com',
    likes: 1000,
    __v: 0
  }

  const updatedBlogs = [...blogs, mostLiked]
  const result = listHelper.favoriteBlog(updatedBlogs)
  expect(result.likes).toBe(1000)
})

test('author with the most blog entries', () => {
  const result = listHelper.mostBlogs(blogs)
  expect(result.author).toBe('Robert C. Martin')
})

test('author who\'s received the most likes', () => {
  const result = listHelper.mostLikes(blogs)
  expect(result.author).toBe('Edsger W. Dijkstra')
})

test('most likes is 17', () => {
  const result = listHelper.mostLikes(blogs)
  expect(result.author).toBe('Edsger W. Dijkstra')
  expect(result.likes).toBe(17)
})
