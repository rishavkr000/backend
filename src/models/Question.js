import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    tags: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    votes: { type: Number, default: 0 },
    hasAcceptedAnswer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
