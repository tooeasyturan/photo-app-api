const uploadsRouter = require('express').Router()

uploadsRouter.post('/', async (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' })
  }

  const file = await req.files.file
  file.mv(`/Users/joshturan/tfp-backend/public/uploads/${file.name}`, err => {
    if (err) {
      console.log(err)
      return res.status(500).send(err)
    }

    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` })
  })
})

module.exports = uploadsRouter
