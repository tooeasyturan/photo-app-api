const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: Date.now
  },
  status: {
    type: String,
    // required: true
  },
  passwordHash: String,
  profile: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile'
    }
  ],
  // avatar: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Avatar'
  //   }
  // ],
  // portfolio: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Portfolio'
  //   }
  // ],
  upload: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload'
    }
  ],
  avatar: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Avatar'
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