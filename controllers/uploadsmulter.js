const multer = require('multer')
const path = require('path')
const uploadsmulterRouter = require('express').Router()


const storage = multer.diskStorage({
  destination: './public/upload/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() +
      path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage
}).single('myImage')

uploadsmulterRouter.post('/', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err)
      return res.status(400).json({ msg: 'No multer file uploaded' })
    } else {
      console.log(req.file)
      res.send('test')
    }
  })
})

module.exports = uploadsmulterRouter