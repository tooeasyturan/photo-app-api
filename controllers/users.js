const bcrypt = require("bcrypt");
const express = require("express");
const usersRouter = require("express").Router();
const fs = require("fs");
const User = require("../models/user");
const Profile = require("../models/profile");
const jwt = require("jsonwebtoken");
const Avatar = require("../models/avatar");
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

    const body = req.body;

    try {
      let user = await User.findOne({ email: body.email });

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
      const passwordHash = await bcrypt.hash(body.password, saltRounds);

      user = new User({
        firstName: body.firstName,
        lastName: body.lastName,
        username: body.username,
        email: body.email,
        status: body.status,
        date: new Date(),
        password: body.password,
        passwordHash,
      });

      const savedUser = await user.save();
      res.json(savedUser);
    } catch (err) {
      console.log("ERRRRR", err);
    }
  }
);

// @route POST /profile
// @desc Create or update user profile
// @access Private

usersRouter.post("/profile", auth, async (req, res, next) => {
  const body = req.body;
  const user = req.user;

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

    const savedProfile = await profile.save();
    user.profile = user.profile.concat(savedProfile._id);
    await user.save();
    res.json(savedProfile);
  } catch (exception) {
    next(exception);
  }
});

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
  console.log("get profile", user);
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
