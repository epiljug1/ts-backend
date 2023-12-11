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

async function getAll(user) {
  if (!user) {
    return await Post.find().sort({ likes: -1 }).limit(5);
  }

  const posts = await Post.find().lean();
  const likes = await Like.find({
    user,
  }).lean();
  const likedPostIds = new Set(likes.map((like) => like.post.toString()));

  const postsWithLikeStatus = posts.map((post) => ({
    ...post,
    isLiked: likedPostIds.has(post._id.toString()),
  }));

  return postsWithLikeStatus;
}

async function getById(id) {
  return await Post.findById(id);
}

async function getPendingPosts() {
  return await Post.find({ pending: true });
}

async function create(postParam) {
  const user = await User.findById(postParam.user);
  if (!user) throw `User does not exist!`;

  const newPost = new Post(postParam);
  await newPost.save();
}

async function getUserPosts(id) {
  return await Post.find({ user: id });
}

async function getPostComments(id) {
  const post = await Post.findById(id);
  if (!post) {
    throw "Post not found.";
  }

  const comments = await Comment.find({ post: post._id });
  return comments.sort({ createdAt: -1 });
}

async function update(id, postParam, isLike) {
  const post = await Post.findById(id);
  if (!post) {
    throw "Post not found.";
  }

  const currentUser = postParam.currentUser;
  const postCreator = post.user.toString();
  if (!isLike && currentUser.sub !== postCreator) {
    throw new UnauthorizedError("No permission to update this post!");
  }

  Object.assign(post, postParam);
  if (isLike) {
    Object.assign(post, { likes: post.likes + 1 });
    const user = await User.findById(post.user.toString());

    const like = new Like({
      post: post._id,
      user: user._id,
    });
    await like.save();
  }
  await post.save();
}

async function verify(id) {
  const post = await Post.findById(id);
  if (!post) {
    throw "Post not found.";
  }

  Object.assign(post, { pending: false });
  await post.save();
}

async function _delete(id, postParam) {
  const post = await Post.findById(id);
  if (!post) {
    throw "Post not found.";
  }

  const currentUser = postParam.currentUser;
  const postCreator = post.user.toString();
  if (currentUser.sub !== postCreator && currentUser.role !== "Admin") {
    throw new UnauthorizedError("No permission to delete this post!");
  }

  await Post.findByIdAndDelete(id);
}

module.exports = {
  getAll,
  getById,
  create,
  getPendingPosts,
  update,
  getUserPosts,
  delete: _delete,
  verify,
  getPostComments,
};
