const express = require("express");
const router = express.Router();
const postServices = require("../services/post.services");
const Role = require("../helpers/role");
const { jwt, jwtOptional } = require("../helpers/jwt");

//routes
router.post("/create", jwt(), createPost);
router.post("/:id/like", jwt(), likePost);
router.post("/:id/verify", jwt(Role.Admin), verifyPost);

router.put("/:id", jwt(), update);

router.get("/", jwtOptional(), getAll);
router.get("/popular", jwtOptional(), getPopular);
router.get("/pending", jwt(Role.Admin), pendingPost);
router.get("/:id", jwt(), getById);
router.get("/:id/comments", jwt(), getPostComments);

router.delete("/:id", jwt(), _delete);

module.exports = router;

function verifyPost(req, res, next) {
  postServices
    .verify(req.params.id)
    .then(() =>
      res.json({
        message: `Post verified successfully.`,
      })
    )
    .catch((error) => next(error));
}

function likePost(req, res, next) {
  postServices
    .update(req.params.id, { currentUser: req.user }, true)
    .then(() =>
      res.json({
        message: `Post liked successfully.`,
      })
    )
    .catch((error) => next(error));
}

function getPostComments(req, res, next) {
  postServices
    .getPostComments(req.params.id)
    .then((comments) => res.json(comments))
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  postServices
    .getAll(req.user?.sub, { pending: false }, { createdAt: -1 })
    .then((posts) => res.json(posts))
    .catch((err) => next(err));
}

function getPopular(req, res, next) {
  postServices
    .getAll(req.user?.sub, { pending: false }, { likes: -1 })
    .then((posts) => res.json(posts))
    .catch((err) => next(err));
}

function pendingPost(req, res, next) {
  postServices
    .getPendingPosts()
    .then((posts) => res.json(posts))
    .catch((err) => next(err));
}

function createPost(req, res, next) {
  console.log("crete post USER: ", req.user);
  postServices
    .create({ ...req.body, user: req.user.sub })
    .then((post) =>
      res.json({
        post: post,
        message: `Post created successfully`,
      })
    )
    .catch((error) => next(error));
}

function update(req, res, next) {
  postServices
    .update(req.params.id, { ...req.body, currentUser: req.user })
    .then(() =>
      res.json({
        message: `Post updated successfully.`,
      })
    )
    .catch((error) => next(error));
}

function _delete(req, res, next) {
  postServices
    .delete(req.params.id, { currentUser: req.user })
    .then(() =>
      res.json({
        message: `Post with id: ${req.params.id} deleted successfully.`,
      })
    )
    .catch((error) => next(error));
}

function getById(req, res, next) {
  postServices
    .getById(req.params.id)
    .then((post) => {
      if (!post) {
        res.status(404).json({ message: "Post Not Found!" });
        next();
      }
      return res.json(post);
    })
    .catch((error) => next(error));
}
