const mongoose = require('mongoose')

const cloudinaryUpload = new mongoose.Schema({
  imageName: {
    type: String,
    required: true
  },

  cloudImage: {
    type: String,
    required: true
  },

  imageId: {
    type: String
  },

  postDate: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('cloudinaryUpload', cloudinaryUpload)
