const mongoose = require("mongoose");
const { Schema } = mongoose;

// Post Schema
const postSchema = new Schema(
  {
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    likes: { type: Number, default: 0 },
    pending: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

postSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

postSchema.pre("findOneAndDelete", async function () {
  const postId = this.getQuery()["_id"];
  await mongoose.model("Like").deleteMany({ post: postId });
  await mongoose.model("Comment").deleteMany({ post: postId });
});

module.exports = mongoose.model("Post", postSchema);
