const Convo = require('../models/convo')
const Message = require('../models/message')
const convosRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const middleware = require('../utils/middleware')
const auth = middleware.auth


// @route POST /messages
// @desc Send message from logged in user to selected user
// @access Private
convosRouter.post('/', auth, async (req, res) => {
  // const body = req.body

  try {
    // const user = await User.findById(req.user.id)

    let convo = await Convo.find({ members: { $all: [req.user.username, req.body.userTo] } })

    if (convo.length > 0) {

      const messageFields = {
        sender: req.user.username,
        content: req.body.message,
        date: new Date(),
      }

      let message = await Message.update({ convoId: convo[0].id }, { $push: { message: messageFields } })

      console.log('found and updated message', message)
      return res.json(message)
    }

    const convoFields = {
      members: [req.user.username, req.body.userTo],
      sender: req.user.username,
      receiver: req.body.userTo,
      deleteBySender: null,
      deleteByReceiver: null,
    }
    convo = new Convo(convoFields)
    const savedConvo = await convo.save()

    const messageFields = {
      message: {
        sender: req.user.username,
        content: req.body.message,
        date: new Date(),
      },
      convoId: savedConvo.id
    }
    message = new Message(messageFields)
    const savedMessage = await message.save()
    // user.convo = user.convo.concat(savedConvo._id)
    // await user.save
    res.json(savedMessage)

  } catch (exception) {
    console.log(exception)
  }
})


// @route GET /messages
// @desc Get all conversations for logged in user
// @access Private
convosRouter.get('/', auth, async (req, res) => {
  let convos = await Convo.find({ members: { $all: [req.user.username] } })
  console.log('get convos', convos)
  res.json(convos)
  // let message = await Message.find({ convoId: convos[0].id })

  // let test = await Convo.aggregate([
  //   { "$match": { "members": req.user.username } },
  //   {
  //     "$lookup": {
  //       "from": "messages",
  //       "localField": "_id",
  //       "foreignField": "convoId",
  //       "as": "messages"
  //     }
  //   }
  // ]).exec(function (err, result) {
  //   if (err) throw err;
  //   console.log(result);
  //   res.json(result)
  // })
})

// @route GET /messages/:id
// @desc Get all messages by conversation id
// @access Private
convosRouter.get('/:id', auth, async (req, res) => {
  console.log(req.params.id)
  let messages = await Message.find({ convoId: req.params.id })
  console.log(messages)
  res.json(messages)
})


// @route POST /messages/:id
// @desc Hide convo for loggedInUser (req.user) who has selected remove. This route needs a lot of work.
// @access Private
convosRouter.post('/:id', auth, async (req, res) => {
  console.log(req.user.username)
  let convo = await Convo.find({ _id: req.params.id, })
  console.log(convo)
  try {
    if (convo[0].sender === req.user.username) {
      convo = await Convo.update({ _id: req.params.id }, {
        deleteBySender: req.user.username
      })
      return res.json(convo)
    } else {
      convo = await Convo.update({ _id: req.params.id }, {
        deleteByReceiver: req.user.username
      })
      return res.json(convo)
    }

  } catch (error) {
    console.log(error)
  }
})


module.exports = convosRouter