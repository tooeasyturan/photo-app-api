const multer = require('multer');

// multer.diskStorage() creates a storage space for storing files. 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, './files/images/');
    } else {
      cb({ message: 'this file is neither a video or image file' }, false)
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
const upload = multer({ storage: storage });


// const storage = multer.diskStorage({
//   destination: './files/images/',
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() +
//       path.extname(file.originalname))
//   }
// })

// const upload = multer({
//   storage: storage
// }).single('file')


module.exports = upload;

// module.exports = multer({
//   storage: multer.diskStorage({}),
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.match(/jpe|jpeg|png|gif$i/)) {
//       cb(new Error('File is not supported'), false)
//       return
//     }

//     cb(null, true)
//   }
// })