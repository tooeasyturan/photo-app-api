const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const authRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')


const auth = middleware.auth


authRouter.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    console.log(user)
    res.json(user)
  } catch (error) {
    console.log(error)
    res.status(500).send('Server error')
  }
})

module.exports = authRouter