const bcrypt = require('bcrypt')
const express = require('express')
const usersRouter = require('express').Router()
const fs = require("fs")
const User = require('../models/user')
const Profile = require('../models/profile')
const jwt = require('jsonwebtoken')
const Avatar = require('../models/avatar')
const Portfolio = require('../models/portfolio')
const { check, validationResult } = require('express-validator')


const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}


usersRouter.post('/',
  [
    // check('firstName', 'First name is required').not().isEmpty(),
    // check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
  ],
  async (request, response) => {


    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      console.log(errors)
      return response.status(400).json({ errors: errors.array() });
    }

    const body = request.body


    try {

      let user = await User.findOne({ email: body.email })

      if (user) {
        console.log(errors)
        return response.status(400).json({ errors: [{ msg: 'User already exists with this email', param: 'userExists' }] })
      }


      const saltRounds = 10
      const passwordHash = await bcrypt.hash(body.password, saltRounds)

      user = new User({
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
    } catch (err) {
      console.log('ERRRRR', err)
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
  const user = await User.find({ username: req.params.username }).populate('profile').populate('avatarCloudUpload').populate('cloudinaryUpload')
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

usersRouter.delete('/portfolio', async (request, response, next) => {
  // NEED TO FIGURE OUT HOW TO GET OBJECT ID FOR SPECIFIC IMAGE TO BE DELETED
  // PROBABLY BETTER TO USE REQUEST PARAMS WITH IMAGE NAME OR ID FOR DELETE REQUEST

  const token = getTokenFrom(request)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    console.log('user id', user.id)
    console.log('user portfolio', user.portfolio)
    console.log('body', request.body)


    const imageToDelete = request.body.portfolioPic
    console.log('image to delete', imageToDelete)

    await Portfolio.findOneAndRemove({ portfolio: `/${imageToDelete}` })

    try {
      fs.unlinkSync(`/Users/joshturan/tfp-frontend/public/uploads/${user.username}/${imageToDelete}`)
    } catch (error) {
      console.log(error)
    }




    // // Remove profile
    // await Profile.findOneAndRemove({ user: user.id })
    // console.log('Profile deleted')
    // // Remove user
    // await User.findOneAndRemove({ _id: user.id })
    // console.log('user deleted')

    response.json({ msg: 'Image deleted ' })
  } catch (error) {
    console.log(error)
  }
}
)



module.exports = usersRouter