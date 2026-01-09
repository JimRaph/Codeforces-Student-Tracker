import mongoose from "mongoose";

// Stores Codeforces submission made by a student
// Each document stores details about a single submission

const cfSubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  submission_id: { type: Number, required: true, unique: true }, // unique submission ID from Codeforces
  contest_id: Number,
  problem_index: String,
  problem_name: String,
  problem_rating: Number,
  verdict: String,
  creation_time: { type: Date, required: true },
}, { timestamps: true });

cfSubmissionSchema.index({ student: 1, creation_time: -1 }); // index for efficient date queries

const CfSubmission = mongoose.model('CfSubmission', cfSubmissionSchema);

export default CfSubmission;


