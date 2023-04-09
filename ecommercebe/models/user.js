const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  name: String,
  email: String,
  username: String,
  password: String,
});

module.exports = mongoose.model("UserTest", UserSchema);
