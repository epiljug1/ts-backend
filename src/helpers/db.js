const config = require("../../config.json");
const mongoose = require("mongoose");

try {
  mongoose
    .connect(process.env.MONGODB_URI || config.connectionString)
    .then((res) => console.log(`MOngoDB connected Successfully..!`));
} catch (error) {
  console.log(`MongoDB Error: `, error.message);
  process.exit(1);
}

mongoose.Promise = global.Promise;

module.exports = {
  User: require("../models/User"),
  Post: require("../models/Post"),
  Like: require("../models/Like"),
  Comment: require("../models/Comment"),
};
