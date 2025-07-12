import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  body: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  votes: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Answer', answerSchema);
