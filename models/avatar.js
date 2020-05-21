const mongoose = require("mongoose");

const avatarSchema = new mongoose.Schema({
  avatar: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

avatarSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Avatar", avatarSchema);
