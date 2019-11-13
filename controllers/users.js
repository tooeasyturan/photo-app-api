const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      firstName: body.firstName,
      lastName: body.lastName,
      username: body.username,
      // name: body.name,
      email: body.email,
      password: body.password,
      passwordHash
    })

    const savedUser = await user.save()
    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users.map(u => u.toJSON()))
})

module.exports = usersRouter