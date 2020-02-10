const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Profile = require('../models/profile')
const jwt = require('jsonwebtoken')
const Avatar = require('../models/avatar')


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
      email: body.email,
      status: body.status,
      date: new Date(),
      password: body.password,
      passwordHash
    })

    const savedUser = await user.save()
    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

// @route POST /profile
// @desc Create or update user profile
// @access Private

usersRouter.post('/profile', async (request, response, next) => {
  const body = request.body

  const token = getTokenFrom(request)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }



    const user = await User.findById(decodedToken.id)
    console.log('user id', user.id)

    const profileFields = {
      country: body.country,
      region: body.region,
      description: body.description,
      experience: body.experience,
      shootingStyle: body.shootingStyle,
      website: body.website,
      socialMedia: body.socialMedia,
      user: user._id,
    }

    let profile = await Profile.findOne({ user: user.id })

    if (profile) {
      // UPDATE
      console.log('FOUND AND UPDATED PROFILE')

      profile = await Profile.findOneAndUpdate({ user: user.id }, { $set: profileFields }, { new: true })
      return response.json(profile)
    }

    // CREATE
    console.log('CREATED NEW PROFILE')
    profile = new Profile(profileFields)


    const savedProfile = await profile.save()
    user.profile = user.profile.concat(savedProfile._id)
    await user.save()
    response.json(savedProfile)
  } catch (exception) {
    next(exception)
  }
})


usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('profile').populate('avatar')
  response.json(users.map(u => u.toJSON()))
})

// usersRouter.get('/:id', async (request, response, next) => {
//   try {
//     // const profile = await Profile.find({ username: request.params.username })
//     // console.log(request.params.username)
//     const user = await User.findById(request.params.id)
//     if (user) {
//       response.json(user.toJSON())
//     } else {
//       response.status(404).end()
//     }
//   } catch (exception) {
//     next(exception)
//   }
// })

usersRouter.get('/:username', async (req, res, next) => {
  const user = await User.find({ username: req.params.username }).populate('profile').populate('avatar').populate('portfolio')
  console.log(user)
  res.json(user)
}
)


// @route DELETE users/:username
// @desc Delete profile and user
// @access private

usersRouter.delete('/profile', async (request, response, next) => {


  const token = getTokenFrom(request)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    console.log('user id', user.id)

    // Remove profile
    await Profile.findOneAndRemove({ user: user.id })
    console.log('Profile deleted')
    // Remove user
    await User.findOneAndRemove({ _id: user.id })
    console.log('user deleted')

    response.json({ msg: 'User deleted ' })
  } catch (error) {
    console.log(error)
  }

}
)





module.exports = usersRouter