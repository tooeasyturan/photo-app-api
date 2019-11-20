const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Profile = require('../models/profile')


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

usersRouter.post('/:id/profile', async (request, response) => {
  try {
    const body = request.body

    const profile = new Profile({
      profilePicture: body.profilePicture,
      location: body.location,
      description: body.description,
      experience: body.experience,
      shootingStyle: body.shootingStyle,
      website: body.website,
      socialMedia: body.socialMedia,
      portfolio: body.portfolio
    })

    const savedProfile = await profile.save()
    response.json(savedProfile)
  } catch (exception) {
    next(exception)
  }
})


usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users.map(u => u.toJSON()))
})



module.exports = usersRouter