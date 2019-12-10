const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Profile = require('../models/profile')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}


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

usersRouter.post('/profile', async (request, response, next) => {
  const body = request.body

  const token = getTokenFrom(request)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const profile = new Profile({
      profilePicture: body.profilePicture,
      location: body.location,
      description: body.description,
      experience: body.experience,
      shootingStyle: body.shootingStyle,
      website: body.website,
      socialMedia: body.socialMedia,
      portfolio: body.portfolio,
      user: user._id,
    })


    const savedProfile = await profile.save()
    user.profile = user.profile.concat(savedProfile._id)
    await user.save()
    response.json(savedProfile)
  } catch (exception) {
    next(exception)
  }
})


usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('profile')
  response.json(users.map(u => u.toJSON()))
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes', { content: 1, date: 1 })
  response.json(users.map(u => u.toJSON()))
})


module.exports = usersRouter