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

uploadsRouter.post('/avatar', async (req, res) => {

  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' })
  }

  if (!fs.existsSync(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}/avatar`)) {
    fs.mkdir(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}/avatar`, function (err) {
      if (err) {
        return console.error(err);
      }
      console.log("Directory created successfully!");
    });
  }

  const file = await req.files.file
  file.mv(`/Users/joshturan/tfp-frontend/public/uploads/${req.body.username}/avatar/${file.name}`, err => {
    if (err) {
      console.log(err)
      return res.status(500).send(err)
    }

    res.json({ fileName: file.name, filePath: `/uploads/${req.body.username}/avatar/${file.name}` })
  })

})


uploadsRouter.get('/:username', async (req, res) => {
  console.log('test')
  console.log('username params', req.params.username)

  const uploadsFolder = `/Users/joshturan/tfp-frontend/public/uploads/${req.params.username}/`
  console.log('uploads folder', uploadsFolder)

  fs.readdir(uploadsFolder, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err)
    }
    res.json(files)
  })

})

uploadsRouter.get('/avatar/:username', async (req, res) => {
  console.log('test')
  console.log('username params', req.params.username)

  const avatarFolder = `/Users/joshturan/tfp-frontend/public/uploads/${req.params.username}/avatar/`
  console.log('avatar folder', avatarFolder)

  fs.readdir(avatarFolder, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err)
    }
    console.log(files)
    res.json(files)
  })

})


module.exports = uploadsRouter
