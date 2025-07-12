import express from "express";
import Answer from "../models/Answer.js";
import Question from "../models/Question.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const { questionId, body } = req.body;
  let answer = await Answer.create({
    question: questionId,
    body,
    author: req.userId,
  });
  answer = await answer.populate('author', 'name');
  res.json(answer);
});

router.patch("/:id/vote", verifyToken, async (req, res) => {
  const { direction } = req.body;
  const answer = await Answer.findById(req.params.id);
  if (!answer) return res.status(404).json({ error: "Answer not found" });

  answer.votes += direction === "up" ? 1 : -1;
  await answer.save();
  res.json(answer);
});

router.patch("/:id/accept", verifyToken, async (req, res) => {
  const answer = await Answer.findById(req.params.id);
  if (!answer) return res.status(404).json({ error: "Answer not found" });

  // Ensure only question author can accept
  const question = await Question.findById(answer.question);
  if (!question) return res.status(404).json({ error: "Question not found" });

  if (question.author.toString() !== req.userId) {
    return res
      .status(403)
      .json({ error: "Only the question author can accept an answer" });
  }

  // Unaccept all others
  await Answer.updateMany({ question: answer.question }, { isAccepted: false });

  // Accept this one
  answer.isAccepted = true;
  await answer.save();

  await Question.findByIdAndUpdate(answer.question, {
    hasAcceptedAnswer: true,
  });

  res.json(answer);
});

export default router;
