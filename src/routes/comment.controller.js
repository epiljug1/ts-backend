const express = require("express");
const router = express.Router();
const commentService = require("../services/comment.services");
const Role = require("../helpers/role");
const { jwt, jwtOptional } = require("../helpers/jwt");

//routes
router.post("/create", jwt(), createComment);
router.put("/:id", jwt(), updateComment);
router.delete("/:id", jwt(), _delete);
// router.get("/", jwtOptional(), getAll);
// router.get("/pending", jwt(Role.Admin), pendingPost);
// router.post("/:id/verify", jwt(Role.Admin), verifyPost);
// // router.get("/current", jwt(), getCurrent);
// router.get("/:id", jwt(), getById);
// router.get("/user", jwt(), getUserPosts);
// router.post("/:id/like", jwt(), likePost);

module.exports = router;

function createComment(req, res, next) {
  commentService
    .create(req.body)
    .then((post) =>
      res.json({
        post: post,
        message: `Comment created successfully`,
      })
    )
    .catch((error) => next(error));
}

function updateComment(req, res, next) {
  commentService
    .update(req.params.id, { ...req.body, currentUser: req.user })
    .then(() =>
      res.json({
        message: `Post updated successfully.`,
      })
    )
    .catch((error) => next(error));
}

function _delete(req, res, next) {
  commentServices
    .delete(req.params.id, { currentUser: req.user })
    .then(() =>
      res.json({
        message: `Comment with id: ${req.params.id} deleted successfully.`,
      })
    )
    .catch((error) => next(error));
}
