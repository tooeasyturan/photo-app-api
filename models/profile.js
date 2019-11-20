const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  profilePicture: String,
  location: String,
  description: String,
  experience: String,
  shootingStyle: String,
  website: String,
  socialMedia: String,
  portfolio: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

profileSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Profile', profileSchema)
