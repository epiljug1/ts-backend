const express = require("express");
const router = express.Router();
const commentService = require("../services/comment.services");
const { jwt } = require("../helpers/jwt");

router.post("/create", jwt(), createComment);
router.delete("/:id", jwt(), _delete);
router.put("/:id", jwt(), updateComment);

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
  commentService
    .delete(req.params.id, { currentUser: req.user })
    .then((data) =>
      res.json({
        message: `Comment with id: ${req.params.id} deleted successfully.`,
        data,
      })
    )
    .catch((error) => next(error));
}
