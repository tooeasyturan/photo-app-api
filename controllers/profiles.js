const profilesRouter = require("express").Router();
const User = require("../models/user");
const Profile = require("../models/profile");
const { check, validationResult } = require("express-validator");
const middleware = require("../utils/middleware");
const auth = middleware.auth;

// @route POST /profile
// @desc Create or update user profile
// @access Private

profilesRouter.post("/", auth, async (req, res, next) => {
  const { country, region, description, experience, shootingStyle } = req.body;
  let user = req.user;

  try {
    const profileFields = {
      country: country,
      region: region,
      description,
      experience,
      shootingStyle,
      user: user._id,
    };

    let profile = await Profile.findOne({ user: user.id });

    if (profile) {
      // UPDATE

      profile = await Profile.findOneAndUpdate(
        { user: user.id },
        { $set: profileFields },
        { new: true }
      );
      console.log("FOUND AND UPDATED PROFILE");

      return res.json(profile);
    }

    // CREATE
    console.log("CREATED NEW PROFILE adsf");
    profile = new Profile(profileFields);
    user = await User.findById(req.user.id);

    const savedProfile = await profile.save();
    user.profile = user.profile.concat(savedProfile._id);
    // user.profile = savedProfile._id;
    await user.save();
    res.json(savedProfile);
  } catch (exception) {
    next(exception);
  }
});

module.exports = profilesRouter;
