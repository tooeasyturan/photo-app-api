const uploadsRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const fs = require("fs")

uploadsRouter.post('/', async (req, res) => {

  console.log('req.body', req.body.username)
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' })
  }

  if (!fs.existsSync(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}`)) {
    fs.mkdir(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}`, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log("Directory created successfully!");
    });
  }

  const file = await req.files.file
  file.mv(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}/${file.name}`, err => {
    if (err) {
      console.log(err)
      return res.status(500).send(err)
    }

    res.json({ fileName: file.name, filePath: `/uploads/${req.body.username}/${file.name}` })
  })
})


uploadsRouter.get('/:username', async (req, res) => {
  console.log('test')
  console.log('username params', req.params.username)

  const uploadsFolder = `/Users/joshturan/tfp-frontend/public/uploads/${req.params.username}/`

  fs.readdir(uploadsFolder, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err)
    }
    res.json(files)
  })

})



module.exports = uploadsRouter
