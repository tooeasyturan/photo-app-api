const mongoose = require('mongoose')

const cloudinarySchema = new mongoose.Schema({
  // imageName: {
  //   type: String,
  //   required: true
  // },

  // cloudImage: {
  //   type: String,
  //   required: true
  // },

  // imageId: {
  //   type: String
  // },

  portfolio: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // postDate: {
  //   type: Date,
  //   default: Date.now
  // }
})

cloudinarySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Cloudinary', cloudinarySchema)
