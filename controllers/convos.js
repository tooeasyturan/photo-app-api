const Convo = require('../models/convo')
const Message = require('../models/message')
const convosRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const middleware = require('../utils/middleware')
const auth = middleware.auth



convosRouter.post('/', auth, async (req, res) => {
  console.log('Auth user for sending message', req.user.username)
  const body = req.body
  console.log('response body', body.userTo)

  try {
    const user = await User.findById(req.user.id)
    // const userTo = await User.findById(body.userTo)

    // console.log('USER TO', userTo)
    console.log('user from id', user.id)
    console.log('body message', body.message)

    let convo = await Convo.find({ members: { $all: [req.user.username, body.userTo] } })
    // let message = await Message.find({ convoId: convo[0].id })
    // console.log('FOUND A MESSAGE', message)

    if (convo.length > 0) {

      const messageFields = {
        sender: req.user.username,
        content: body.message,
        date: new Date(),
      }

      let message = await Message.update({ convoId: convo[0].id }, { $push: { message: messageFields } })

      console.log('found and updated message', message)
      return res.json(message)
    }


    const convoFields = {
      members: [req.user.username, body.userTo],
      sender: req.user.username,
      receiver: body.userTo,
      deleteBySender: '',
      deleteByReceiver: '',
    }
    convo = new Convo(convoFields)
    const savedConvo = await convo.save()

    const messageFields = {
      message: {
        sender: req.user.username,
        content: body.message,
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



  // for (i = 0; i <= convos.length; i++) {
  // let message = await Message.find({ convoId: convos[0].id })
  // messages.concat(message)
  // }
  // console.log('message', result)

})

convosRouter.get('/:id', auth, async (req, res) => {
  console.log(req.params.id)
  let messages = await Message.find({ convoId: req.params.id })
  console.log(messages)
  res.json(messages)
})

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