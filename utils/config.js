require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI
let CLOUDINARY_URL = process.env.CLOUDINARY_URL

// if (process.env.NODE_ENV === 'test') {
//   MONGODB_URI = process.env.TEST_MONGODB_URI
// }






module.exports = {
  MONGODB_URI,
  CLOUDINARY_URL,
  PORT
}