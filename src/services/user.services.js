const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../../config.json");
const db = require("../helpers/db");
const User = db.User;

//this will authenticate the user credentials
async function authenticate({ email, password }) {
  //find the user using email

  const user = await User.findOne({ email });

  //if user is truthy then sign the token
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ sub: user.id, role: user.role }, config.secret, {
      expiresIn: "7d",
    });
    // console.log("user.toJsoon", ...user.toJSON());
    return { ...user.toJSON(), token };
  }
}

async function getAll() {
  return await User.find();
}

async function getById(id) {
  return await User.findById(id);
}

//adding user to db
async function create(userParam) {
  //check if user exist
  const user = await User.findOne({ email: userParam.email });
  //validate
  if (user) throw `This email already exists: ${userParam.email}`;

  //create user obj
  const newUser = new User(userParam);
  if (userParam.password) {
    newUser.password = bcrypt.hashSync(userParam.password, 10);
  }

  await newUser.save();
}

async function update(id, userParam) {
  const user = await User.findById(id);

  //validate the id and email
  if (!user) throw "User not found.";
  if (
    user.email !== userParam.email &&
    (await User.findOne({ email: userParam.email }))
  ) {
    throw `User with email ${userParam.email} already exist.`;
  }

  //convert the password ot hash
  if (userParam.password) {
    userParam.password = bcrypt.hashSync(userParam.password, 10);
  }

  Object.assign(user, userParam);
  await user.save();
}

async function _delete(id) {
  await User.findByIdAndDelete(id);
}

module.exports = {
  authenticate,
  getAll,
  getById,
  create,
  update,
  delete: _delete,
};
