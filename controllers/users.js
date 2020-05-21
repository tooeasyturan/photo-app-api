const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const Profile = require("../models/profile");
const { check, validationResult } = require("express-validator");
const middleware = require("../utils/middleware");
const auth = middleware.auth;

// @route POST /users
// @desc Create new user using signup form
// @access Public

usersRouter.post(
  "/",
  [
    // check('firstName', 'First name is required').not().isEmpty(),
    // check('lastName', 'Last name is required').not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    console.log("body", req.body.firstName);

    try {
      const {
        firstName,
        lastName,
        username,
        email,
        status,
        password,
      } = req.body;
      let user = await User.findOne({ email });

      if (user) {
        console.log(errors);
        return res.status(400).json({
          errors: [
            {
              msg: "User already exists with this email",
              param: "userExists",
            },
          ],
        });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      user = new User({
        firstName,
        lastName,
        username,
        email,
        status,
        date: new Date(),
        password,
        passwordHash,
      });

      const savedUser = await user.save();
      res.json(savedUser);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("asdf");
    }
  }
);

// @route POST /profile
// @desc Create or update user profile
// @access Private

usersRouter.post("/profile", auth, async (req, res, next) => {
  const body = req.body;
  let user = req.user;

  try {
    const profileFields = {
      country: body.country,
      region: body.region,
      description: body.description,
      experience: body.experience,
      shootingStyle: body.shootingStyle,
      website: body.website,
      socialMedia: body.socialMedia,
      user: user._id,
    };

    let profile = await Profile.findOne({ user: user.id });

    if (profile) {
      // UPDATE
      console.log("FOUND AND UPDATED PROFILE");

      profile = await Profile.findOneAndUpdate(
        { user: user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // CREATE
    console.log("CREATED NEW PROFILE");
    profile = new Profile(profileFields);

    user = await User.findById(req.user.id);

    const savedProfile = await profile.save();
    user.profile = user.profile.concat(savedProfile._id);
    await user.save();
    res.json(savedProfile);
  } catch (exception) {
    next(exception);
  }
});

// profile = new Profile(profileFields);

// user = await User.findById(req.user.id);
// const savedProfile = await profile.save();
// console.log("saved profile", savedProfile);
// user.profile = user.profile.concat(savedProfile._id);
// await user.save();
// console.log("CREATED NEW PROFILE");

// res.json(savedProfile);

// @route GET /users
// @desc Get all users, including profiles and avatars
// @access Public

usersRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("profile").populate("avatar");
  res.json(users.map((u) => u.toJSON()));
  console.log("get users", users);
});

// @route GET /:username
// @desc Get specific user, including profile, avatar, and portfolio uploads
// @access public

usersRouter.get("/:username", async (req, res, next) => {
  const user = await User.find({ username: req.params.username })
    .populate("profile")
    .populate("avatar")
    .populate("upload");
  console.log(user);
  res.json(user);
});

// @route DELETE users/:username
// @desc Delete profile and user for logged in user
// @access private

usersRouter.delete("/profile", auth, async (req, res, next) => {
  try {
    const user = req.user;
    console.log("user id", user.id);

    // Remove profile
    await Profile.findOneAndRemove({ user: user.id });
    console.log("Profile deleted");
    // Remove user
    await User.findOneAndRemove({ _id: user.id });
    console.log("user deleted");

    res.json({ msg: "User deleted " });
  } catch (error) {
    console.log(error);
  }
});

module.exports = usersRouter;
