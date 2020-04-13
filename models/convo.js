const mongoose = require('mongoose')

const convoSchema = new mongoose.Schema({
  members: [String],
  sender: String,
  deleteBySender: String,
  receiver: String,
  deleteByReceiver: String,
}, { versionKey: false })



convoSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Convo', convoSchema)
