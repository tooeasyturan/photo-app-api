const uploadsRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const fs = require("fs")
const Profile = require('../models/profile')
const jwt = require('jsonwebtoken')
const Avatar = require('../models/avatar')
const Portfolio = require('../models/portfolio')


const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}


uploadsRouter.post('/avatar', async (req, res, next) => {
  console.log('TESTING')
  const body = req.body
  console.log('req.body', req.body)
  const token = getTokenFrom(req)
  console.log('token', token)

  // if (req.files === null) {
  //   return res.status(400).json({ msg: 'No file uploaded' })
  // }

  try {
    if (!fs.existsSync(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}/avatar`)) {
      await fs.promises.mkdir(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}/avatar`,
        { recursive: true }, err => {
          if (err) {
            console.error(err);
          }
          console.log("Directory created successfully!");
        });
    }

    const file = await req.files.file
    file.mv(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}/avatar/${file.name}`, err => {
      if (err) {
        console.log(err)
        return res.status(500).send(err)
      }
    })




    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }





    const user = await User.findById(decodedToken.id)

    let avatar = await Avatar.findOne({ user: user.id })

    const profileFields = {
      avatar: `${file.name}`,
      user: user._id
    }

    if (avatar) {
      // UPDATE
      console.log('FOUND AND UPDATED AVATAR')

      avatar = await Avatar.findOneAndUpdate({ user: user.id }, { $set: profileFields }, { new: true })
      return res.json(avatar)
    }

    avatar = new Avatar({
      avatar: `${file.name}`,
      user: user._id
    })

    const savedAvatar = await avatar.save()
    user.avatar = user.avatar.concat(savedAvatar._id)
    await user.save()
    console.log('saved avatar', savedAvatar)
    res.json({ fileName: file.name, filePath: `/uploads/${req.body.username}/avatar/${file.name}` })
  } catch (exception) {
    next(exception)
  }


})


uploadsRouter.get('/:username', async (req, res) => {
  console.log('test')
  console.log('username params', req.params.username)

  const uploadsFolder = `/Users/joshturan/tfp-frontend/public/uploads/${req.params.username}/`
  console.log('uploads folder', uploadsFolder)

  fs.readdir(uploadsFolder, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err)
    }
    res.json(files)
  })

})

uploadsRouter.get('/avatar/:username', async (req, res) => {
  console.log('test')
  console.log('username params', req.params.username)

  const avatarFolder = `/Users/joshturan/tfp-frontend/public/uploads/${req.params.username}/avatar/`
  console.log('avatar folder', avatarFolder)

  fs.readdir(avatarFolder, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err)
    }
    console.log('THESE ARE FILES', files)
    res.json(files)
  })



  uploadsRouter.post('/', async (req, res, next) => {
    console.log('TESTING PORTFOLIO UPLOAD')
    const body = req.body
    console.log('body', body)

    const token = getTokenFrom(req)
    console.log('TOKEN', token)


    try {
      if (!fs.existsSync(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}`)) {
        await fs.promises.mkdir(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}`, { recursive: true },
          err => {
            if (err) {
              console.error(err)
            }
            console.log("Directory created successfully!")
          })
      }

      const file = await req.files.file
      file.mv(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}/${file.name}`, err => {
        if (err) {
          console.log(err)
          return res.status(500).send(err)
        }
      })


      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!token || !decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
      }

      const user = await User.findById(decodedToken.id)
      console.log('user', user)

      const portfolio = new Portfolio({
        portfolio: `/${file.name}`,
        user: user._id
      })

      const savedPortfolio = await portfolio.save()
      user.portfolio = user.portfolio.concat(savedPortfolio._id)
      await user.save()
      res.json({ fileName: file.name, filePath: `/uploads/${req.body.username}/${file.name}` })
    } catch (exception) {
      next(exception)
    }

  })






})


module.exports = uploadsRouter
