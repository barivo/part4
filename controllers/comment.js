const router = require('express').Router()
const Blog = require('../models/blog')

router.get('/:id/comments', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const comments = blog.comments
  return response.status(210).json(comments)
  //
})

router.post('/:id/comments', async (request, response) => {
  const body = request.body
  console.log(body)

  const blog = await Blog.findById(request.params.id)

  blog.comments.push({ text: body.text })
  const comment = blog.comments[blog.comments.length - 1]

  await blog.save(function(err) {
    if (err) {
      console.log('comment not saved', err)
      return response.status(401).json({ error: 'comment not saved' })
    } else {
      response.status(201).json(comment)
    }
  })
})

router.delete('/:id/comment/:commentId', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const _id = request.params.commentId

  blog.comments.id(_id).remove()
  await blog.save()
  response.status(204).end()
})

module.exports = router
