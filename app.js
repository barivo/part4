const express = require('express')
const app = express()
require('express-async-errors')
const cors = require('cors')
const mongoose = require('mongoose')
const blogRouter = require('./controllers/blog')
const userRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')
const commentRouter = require('./controllers/comment')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const config = require('./utils/config')

logger.info('connecting to', config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch(error => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)
app.use('/api/login', loginRouter)
app.use('/api/users', userRouter)
app.use('/api/blogs', blogRouter)
app.use('/api/blogs', commentRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
