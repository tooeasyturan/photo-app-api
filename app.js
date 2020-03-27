const config = require('./utils/config')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')
const logger = require('./utils/logger')
const fileupload = require('express-fileupload')
const cloudinary = require('cloudinary').v2;
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const uploadsRouter = require('./controllers/uploads')
const authRouter = require('./controllers/auth')
const cloudinaryRouter = require('./controllers/cloudinary')
const path = require('path')
//const uploadsmulterRouter = require('./controllers/uploadsmulter')


logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.info('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true }))
app.use(middleware.requestLogger)
app.use(middleware.errorHandler)
// app.use(express.static('./public/uploads'))
app.use(express.static(__dirname + '/public/uploads/'))

// app.use(fileupload())

app.use('/users', usersRouter)
app.use('/login', loginRouter)
app.use('/auth', authRouter)
app.use(uploadsRouter)
app.use('/cloudinary', cloudinaryRouter)

// app.use('/upload', uploadsmulterRouter)



module.exports = app