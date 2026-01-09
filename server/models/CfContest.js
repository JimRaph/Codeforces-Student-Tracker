import mongoose from "mongoose";

// Stores contest participation details of students. Each document represents a single
// contest entry for a student

const cfContestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  contest_id: Number,
  contest_name: String,
  rank: Number,
  old_rating: Number,
  new_rating: Number,
  rating_change: Number,
  contest_date: Date,
  unsolved_problems: Number, // Number of problems unsolved by user in contest
});


// Create a unique compound index to ensure each student-contest pair is unique
cfContestSchema.index({ student: 1, contest_id: 1 }, { unique: true });

const CfContest = mongoose.model('CfContest', cfContestSchema);

export default CfContest
