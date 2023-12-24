const config = require("../../config.json");
const mongoose = require("mongoose");
const role = require("./role");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function createInitialAdmin() {
  try {
    const adminExists = await User.findOne({ role: role.Admin });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync("travelTalkAdmin", 10);
      const adminUser = new User({
        email: "admin@traveltalk.com",
        firstName: "Admin",
        lastName: "User",
        password: hashedPassword,
        role: role.Admin,
      });

      await adminUser.save();
      console.log("Admin account created");
    }
  } catch (error) {
    console.error("Error creating initial admin account:", error);
  }
}

try {
  mongoose
    .connect(process.env.MONGODB_URI || config.connectionString)
    .then((res) => {
      console.log(`MongoDB connected Successfully..!`);
      createInitialAdmin();
    });
} catch (error) {
  console.log(`MongoDB Error: `, error.message);
  process.exit(1);
}

mongoose.Promise = global.Promise;

module.exports = {
  User,
  Post: require("../models/Post"),
  Like: require("../models/Like"),
  Comment: require("../models/Comment"),
};
