const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  firstName: String,
  lastName: String,
  email: String,
  date: Date,
  status: String,
  passwordHash: String,
  profile: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile'
    }
  ],
  avatar: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Avatar'
    }
  ],
  portfolio: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio'
    }
  ]
})


userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(),
      delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema)

module.exports = User