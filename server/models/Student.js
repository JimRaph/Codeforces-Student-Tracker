import mongoose from "mongoose";

// Stores a student profile.
// Stores personal information, Codeforces handle, rating info,
// and reminder email settings.

const studentSchema = new mongoose.Schema({
name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  codeforces_handle: { type: String, unique: true, sparse: true },
  cf_handle: {type: String},
  current_rating: { type: Number, default: null },
  max_rating: { type: Number, default: null },
  last_submission_date: Date,
  last_sync: Date,
  reminders_enabled: { type: Boolean, default: true },
  reminder_email_count: { type: Number, default: 0 },
}, { timestamps: true });
const Student = mongoose.model('Student', studentSchema);

export default Student
