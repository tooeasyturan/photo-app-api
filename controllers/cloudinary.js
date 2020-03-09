const cloudinaryRouter = require('express').Router()
const cloudinary = require('cloudinary')
const User = require('../models/user')
const Cloudinary = require('../models/cloudinary')
const CloudAvatar = require('../models/avatar')
const cloud = require('../utils/cloudinaryConfig')
const jwt = require('jsonwebtoken')
const path = require('path')
const upload = require('../utils/multerConfig');
const middleware = require('../utils/middleware')

const auth = middleware.auth


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
    req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, "")
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
    console.log('user.cloudinaryUpload', user.cloudinaryUpload)
    user.cloudinaryUpload = user.cloudinaryUpload.concat(savedCloudinaryUpload._id)
    await user.save()

    res.send(result)
  } catch (error) {
    console.log(error)
  }

})

cloudinaryRouter.post('/avatar', upload.single('file'), async (req, res) => {


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

  let avatar = await CloudAvatar.findOne({ user: user.id })
  console.log('IS THERE AVATAR??!', avatar)



  try {
    req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, "")
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      public_id: `${req.body.username}/avatar/${req.file.originalname}`,
      overwrite: false
    })

    if (avatar) {

      await CloudAvatar.findOneAndUpdate({ user: user.id }, { $set: { avatar: result.url } }, { new: true })
      return res.json(avatar)
    }

    const avatarCloudUpload = new CloudAvatar({
      avatar: result.url,
      user: user._id
    })

    const savedAvatarCloudUpload = await avatarCloudUpload.save()
    console.log('USER!!!!', user)
    console.log('avatarCloudUpload!!!!', avatarCloudUpload)
    console.log('savedAvatarCloudUpload!!!!', savedAvatarCloudUpload._id)

    console.log('user.avatarCloudUpload', user.avatarCloudUpload)
    user.avatarCloudUpload = user.avatarCloudUpload.concat(savedAvatarCloudUpload._id)
    await user.save()

    res.send(result)
  } catch (error) {
    console.log(error)
  }

})


cloudinaryRouter.get('/:username', async (req, res) => {
  console.log('test')
  console.log('username params', req.params.username)

  // const token = getTokenFrom(req)

  // const decodedToken = jwt.verify(token, process.env.SECRET)
  // if (!token || !decodedToken.id) {
  //   return response.status(401).json({ error: 'token missing or invalid' })
  // }

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

cloudinaryRouter.get('/:username/avatar', async (req, res) => {
  const user = await User.find({ username: req.params.username }).populate('avatarCloudUpload')
  console.log("USER!!!!", user)


  if (user.length === 1) {
    const images = await CloudAvatar.find({ user: user[0].id })
    const mappedImages = images.map(image => image.avatar)
    console.log('IMAGES', mappedImages)
    res.send(mappedImages)
  } else {
    res.status(404).send('not found')
  }
})


cloudinaryRouter.delete('/', async (request, response, next) => {
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


    const imageToDelete = request.body.upload
    console.log('image to delete', imageToDelete)

    const imageToDeleteId = Cloudinary.find({ portfolio: imageToDelete }, { lean: true }, function (err, results) {
      return results[0]._id
    })
    console.log('IMAGE TO DELETE ID', imageToDeleteId._id)
    const remove = await Cloudinary.findOne({ portfolio: imageToDelete })

    console.log('IMAGE ID TO REMOVE OBJECT', remove._id)
    await Cloudinary.findOneAndRemove({ portfolio: imageToDelete })
    // console.log(User.findOneAndRemove({ cloudinaryUpload: remove._id }))

    console.log('CLOUDINARY UPLOADS ARRY', user.cloudinaryUpload)

    User.update(
      { _id: user.id },
      { $pull: { cloudinaryUpload: remove._id } },
      function (err) {
        if (err) console.log(err)
      }
    )



    response.json({ msg: 'Image deleted ' })
  } catch (error) {
    console.log(error)
  }
}
)

module.exports = cloudinaryRouter
