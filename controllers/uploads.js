const uploadsRouter = require("express").Router();
const cloudinary = require("cloudinary");
const User = require("../models/user");
const Upload = require("../models/upload");
const Avatar = require("../models/avatar");
const cloud = require("../utils/cloudinaryConfig");
const jwt = require("jsonwebtoken");
const upload = require("../utils/multerConfig");
const middleware = require("../utils/middleware");

const auth = middleware.auth;

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

// @route POST /uploads
// @desc Upload picture to cloudinary and user portfolio in db
// @access Private

uploadsRouter.post("/", auth, upload.single("file"), async (req, res) => {
  const user = await User.findById(req.user.id);

  try {
    console.log("FILE", req.body);
    req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, "");
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      public_id: `${req.user.username}/portfolio/${req.file.originalname}`,
      overwrite: false,
    });

    const upload = new Upload({
      portfolio: result.url,
      user: user._id,
    });

    const savedUpload = await upload.save();
    console.log("user.upload", user.upload);
    user.upload = user.upload.concat(savedUpload._id);
    await user.save();

    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

// @route POST /uploads/avatar
// @desc Upload avatar to cloudinary and user profile in db
// @access Private

uploadsRouter.post("/avatar", auth, upload.single("file"), async (req, res) => {
  console.log("SAVING AAVATAR");
  const user = await User.findById(req.user.id);
  let avatar = await Avatar.findOne({ user: user._id });

  try {
    req.file.originalname = req.file.originalname.replace(/\.[^/.]+$/, "");
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      public_id: `${req.user.username}/avatar/${req.file.originalname}`,
      overwrite: false,
    });

    if (avatar) {
      console.log("avatar to be saved", avatar);
      console.log("user to avatar", user.id);
      await Avatar.findOneAndUpdate(
        { user: user.id },
        { $set: { avatar: result.url } },
        { new: true }
      );
      return res.json(avatar);
    }

    avatar = new Avatar({
      avatar: result.url,
      user: user._id,
    });

    console.log('create avatar', avatar)

    const savedAvatar = await avatar.save();
    console.log("savedavatar", savedAvatar);
    user.avatar = user.avatar.concat(savedAvatar._id);
    await user.save();

    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

// @route GET /uploads/:username
// @desc Get all uploads for individual user by :username
// @access Public

uploadsRouter.get("/:username", async (req, res) => {
  const user = await User.find({ username: req.params.username });

  if (user.length === 1) {
    // IF (REQ.PARAMS.USERNAME === USER.USERNAME) THEN SHOW MY PROFILE
    const images = await Upload.find({ user: user[0].id }); //** CONTINUE TRYING THIS METHOD. FIND IMAGES BY USER.ID. SHOULD BE EASY. */
    const mappedImages = images.map((image) => image.portfolio);
    res.send(mappedImages);
  } else {
    // IF (REQ.PARAMS.USERNAME !== USER.USERNAME) THEN SHOW USERNAME PROFILE OR INVALID USER PAGE
    res.status(404).send("not found");
  }
});

// @route GET /uploads/:username/avatar
// @desc Get avatar for specific user
// @access Public?

uploadsRouter.get("/:username/avatar", async (req, res) => {
  const user = await User.find({ username: req.params.username }).populate(
    "avatar"
  );

  if (user.length === 1) {
    const images = await Avatar.find({ user: user[0].id });
    const mappedImages = images.map((image) => image.avatar);
    console.log("IMAGES", mappedImages);
    res.send(mappedImages);
  } else {
    res.status(404).send("not found");
  }
});


// @route DELETE /uploads
// @desc Delete selected upload for logged in user
// @access Private

uploadsRouter.delete("/", auth, async (req, res, next) => {
  // NEED TO FIGURE OUT HOW TO GET OBJECT ID FOR SPECIFIC IMAGE TO BE DELETED
  // PROBABLY BETTER TO USE REQUEST PARAMS WITH IMAGE NAME OR ID FOR DELETE REQUEST
  console.log("delete image", req.user);

  try {
    const user = req.user;
    const imageToDelete = req.body.imageToDelete;
    console.log("to remove", req.body);

    const remove = await Upload.findOne({ portfolio: imageToDelete });

    await Upload.findOneAndRemove({ portfolio: imageToDelete });

    // Remove Object id from user.upload --> Find better way to do this
    User.update({ _id: user.id }, { $pull: { upload: remove._id } }, function (
      err
    ) {
      if (err) console.log(err);
    });
    res.json({ msg: "Image deleted " });
  } catch (error) {
    console.log(error);
  }
});

module.exports = uploadsRouter;
