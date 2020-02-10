const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const authRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')

const auth = middleware.auth


authRouter.get('/', auth, (request, response) => {
  response.send('Auth route')
})

module.exports = authRouter