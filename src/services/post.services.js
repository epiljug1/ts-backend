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

async function getAll(user, filter, sort, query) {
  let searchFilter = {};
  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    searchFilter = {
      $or: [
        { content: { $regex: searchRegex } },
        { city: { $regex: searchRegex } },
      ],
    };
  }

  if (query.city) {
    const searchRegex = new RegExp(query.city, "i");
    searchFilter = {
      $or: [{ city: { $regex: searchRegex } }],
    };
  }

  const finalFilter = { ...filter, ...searchFilter };

  if (!user) {
    const posts = await Post.find(filter)
      .populate("user", "firstName lastName email")
      .sort(sort)
      .limit(5);

    return posts.filter(
      (item) =>
        item.city.toLowerCase().includes(query?.city?.toLowerCase() || "") &&
        item.content.toLowerCase().includes(query?.search?.toLowerCase() || "")
    );
  }

  const posts = await Post.find(finalFilter)
    .sort(sort)
    .populate("user", "firstName lastName email")
    .lean();

  const likes = await Like.find({ user }).lean();
  // console.log("likes: ", likes, user);
  const likedPostIds = new Set(likes.map((like) => like.post.toString()));

  const postsWithLikeStatus = posts.map((post) => ({
    ...post,
    isLiked: likedPostIds.has(post._id.toString()),
  }));

  return postsWithLikeStatus;
}

async function getPendingPosts(query) {
  let searchFilter = {};
  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    searchFilter = {
      $or: [
        { content: { $regex: searchRegex } },
        { city: { $regex: searchRegex } },
      ],
    };
  }

  if (query.city) {
    const searchRegex = new RegExp(query.city, "i");
    searchFilter = {
      $or: [{ city: { $regex: searchRegex } }],
    };
  }

  const finalFilter = { pending: true, ...searchFilter };
  return await Post.find(finalFilter).populate(
    "user",
    "firstName lastName email"
  );
}

async function getById(id) {
  return await Post.findById(id);
}

async function create(postParam) {
  const user = await User.findById(postParam.user);
  if (!user) throw `User does not exist!`;

  const newPost = new Post(postParam);
  await newPost.save();
}

async function getPostComments(id) {
  const post = await Post.findById(id);
  if (!post) {
    throw "Post not found.";
  }
  const comments = await Comment.find({ post: post._id }).sort({
    createdAt: -1,
  });
  return comments;
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
    const existingLike = await Like.findOne({
      post: post._id,
      user: currentUser.sub,
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });

      if (post.likes > 0) {
        Object.assign(post, { likes: post.likes - 1 });
      }
    } else {
      Object.assign(post, { likes: post.likes + 1 });
      const like = new Like({
        post: post._id.toString(),
        user: currentUser.sub,
      });
      await like.save();
    }
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
  delete: _delete,
  verify,
  getPostComments,
};
