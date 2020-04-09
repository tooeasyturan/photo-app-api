const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  message: [{
    sender: String,
    content: String,
    date: Date,
  }],
  convoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Convo'
  }
}, { versionKey: false })



messageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Message', messageSchema)
