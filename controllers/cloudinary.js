const cloudinaryRouter = require('express').Router()
const cloudinary = require('cloudinary')
const User = require('../models/user')
const Cloudinary = require('../models/cloudinary')
const cloud = require('../utils/cloudinaryConfig')
const jwt = require('jsonwebtoken')
const path = require('path')
const upload = require('../utils/multerConfig');


const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}




cloudinaryRouter.post('/', upload.single('file'), async (req, res) => {


  console.log('BODY', req.body.username)

  // res.send(req.file)


  const token = getTokenFrom(req)
  console.log('TOKEN', token)

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)
  console.log('user ID', user.id)

  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      public_id: `${req.body.username}/portfolio/${req.file.originalname}`,
      overwrite: false
    })

    const cloudinaryUpload = new Cloudinary({
      portfolio: result.url,
      user: user._id
    })

    const savedCloudinaryUpload = await cloudinaryUpload.save()
    console.log('savedCloudinaryUpload', savedCloudinaryUpload)
    user.cloudinaryUpload = user.cloudinaryUpload.concat(savedCloudinaryUpload._id)
    await user.save()

    res.send(result)
  } catch (error) {
    console.log(error)
  }

})


cloudinaryRouter.get('/:username', async (req, res) => {
  console.log('test')
  console.log('username params', req.params.username)

  const token = getTokenFrom(req)

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  // const user = await User.findById(decodedToken.id).populate('cloudinaryUpload')
  // console.log('USERNAME!!!!!!', user.username)
  const user = await User.find({ username: req.params.username }).populate('cloudinaryUpload')
  console.log("USER!!!!", user)


  if (user.length === 1) {
    // IF (REQ.PARAMS.USERNAME === USER.USERNAME) THEN SHOW MY PROFILE
    const images = await Cloudinary.find({ user: user[0].id }) //** CONTINUE TRYING THIS METHOD. FIND IMAGES BY USER.ID. SHOULD BE EASY. */
    const mappedImages = images.map(image => image.portfolio)
    console.log('IMAGES', mappedImages)
    // const portfolio = user[0].cloudinaryUpload
    // const images = portfolio.map(image => image)
    res.send(mappedImages)
  } else {
    // IF (REQ.PARAMS.USERNAME !== USER.USERNAME) THEN SHOW USERNAME PROFILE OR INVALID USER PAGE
    res.status(404).send('not found')
  }
})

module.exports = cloudinaryRouter
