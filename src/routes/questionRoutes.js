import express from "express";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js"; // ✅ Import missing Answer model
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all questions (with optional search)
router.get("/", async (req, res) => {
  const search = req.query.search?.toLowerCase() || "";

  const query = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ],
      }
    : {};

  try {
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .populate("author", "name");

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// ✅ Create a new question
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    const question = await Question.create({
      title,
      body,
      tags,
      author: req.userId,
    });

    res.json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Failed to post question" });
  }
});

// ✅ Get a single question with its answers
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("author", "name");

    if (!question) return res.status(404).json({ error: "Question not found" });

    const answers = await Answer.find({ question: req.params.id })
      .sort({ createdAt: -1 })
      .populate("author", "name");

    res.json({ question, answers });
  } catch (error) {
    console.error("Error fetching question details:", error);
    res.status(500).json({ error: "Failed to fetch question details" });
  }
});

// ✅ Vote on a question (up/down)
router.post("/:id/vote", verifyToken, async (req, res) => {
  try {
    const { direction } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    question.votes += direction === "up" ? 1 : -1;
    await question.save();

    res.json({ success: true, votes: question.votes });
  } catch (error) {
    console.error("Error voting on question:", error);
    res.status(500).json({ error: "Failed to vote on question" });
  }
});

export default router;
