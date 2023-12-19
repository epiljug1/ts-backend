const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../../config.json");
const mongoose = require("mongoose");
const db = require("../helpers/db");
const UnauthorizedError = require("../helpers/Unauthorized.error");
const userServices = require("./user.services");
const User = db.User;
const Post = db.Post;
const Like = db.Like;
const Comment = db.Comment;

async function create(commentParam) {
  const user = await User.findById(commentParam.user);
  if (!user) throw `User does not exist!`;

  const post = await Post.findById(commentParam.post);
  if (!post) throw `Post does not exist!`;

  const newComment = new Comment(commentParam);
  await newComment.save();
}


async function update(id, commentParam) {
  const comment = await Comment.findById(id);
  if (!comment) throw `Comment does not exist!`;

  const currentUser = commentParam.currentUser;
  const commentCreator = comment.user.toString();
  if (currentUser !== commentCreator) {
    throw new UnauthorizedError("No permission to update this post!");
  }

  Object.assign(comment, commentParam);
  await comment.save();
}

async function _delete(id, postParam) {
  const comment = await Comment.findById(id);
  if (!comment) {
    throw "Comment not found.";
  }

  const currentUser = postParam.currentUser;
  const postCreator = post.user.toString();
  if (currentUser.sub !== postCreator && currentUser.role !== "Admin") {
    throw new UnauthorizedError("No permission to delete this comment!");
  }

  await Comment.findByIdAndDelete(id);
}

module.exports = {
  create,
  update,
  delete: _delete,
};
