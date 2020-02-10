const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}

const auth = (request, response, next) => {
  // Get token from header
  const token = request.header('x-auth-token')

  // Check if no token
  if (!token) {
    return response.status(401).json({ msg: 'No token, authorization denied' })
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get(process.env.SECRET))

    request.user = decoded.user;
    next()
  } catch (error) {
    response.status(401).json({ msg: 'Token is not valid' })
  }
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  auth
}