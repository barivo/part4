const User = require('../models/user')
const mongoose = require('mongoose')

const bcrypt = require('bcrypt')

const generatePasswordHash = async () => {
  return await bcrypt.hash('password', 10)
}

const createUsers = async () => {
  await User.deleteMany({})

  const passwordHash = await generatePasswordHash()
  const users = [
    {
      id: mongoose.Types.ObjectId('any12charstr'),
      username: 'mluukkai',
      name: 'ull lukai',
      passwordHash,
      blogs: [],
    },
    {
      id: '303030303030303030303030',
      username: 'hellas',
      name: 'arto hellas',
      passwordHash,
      blogs: [],
    },
  ]

  const userObjArray = users
    .map(user => new User(user))
    .map(user => user.save())

  await Promise.all(userObjArray)
}

module.exports = createUsers
