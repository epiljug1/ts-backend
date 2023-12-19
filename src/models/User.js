const mongoose = require("mongoose");
const role = require("../helpers/role");
const Schema = mongoose.Schema;

const schema = new Schema({
  email: { type: String, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: role.User },
  createdDate: { type: Date, default: Date.now },
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id, delete ret.password;
  },
});

schema.pre("findOneAndDelete", async function () {
  const userId = this.getQuery()["_id"];
  await mongoose.model("Post").deleteMany({ user: userId });
});

module.exports = mongoose.model("User", schema);
