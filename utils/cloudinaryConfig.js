const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dxv4p7nxb',
  api_key: '841757219254432',
  api_secret: 'pi7pqJG7-VdkSoKbUF-oTBTkAak',
});

exports.uploads = (file) => {
  return new Promise(resolve => {
    cloudinary.uploader.upload(file, (result) => {
      resolve({ url: result.url, id: result.public_id })
    }, { resource_type: "auto" })
  })
}

