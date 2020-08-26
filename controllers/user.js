const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    url: 1,
    likes: 1,
    author: 1,
  })

  response.json(users.map(u => u.toJSON()))
})

userRouter.post('/', async (request, response) => {
  const body = request.body
  if (body.password.length < 3) {
    return response.status(400).json({
      error: 'Password must be longer than 3 characters. Please try again',
    })
  }
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

module.exports = userRouter
/*
const bcrypt = require('bcrypt')
const router = require('express').Router()
const User = require('../models/user')

router.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    url: 1,
    likes: 1,
    author: 1,
  })

  response.json(users.map(u => u.toJSON()))
})

router.post('/', async (request, response) => {
  const { password, name, username } = request.body

  if (!password || password.length < 3) {
    return response.status(400).send({
      error: 'password must min length 3',
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

module.exports = router
  */
