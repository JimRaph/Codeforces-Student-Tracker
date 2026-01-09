
import axios from 'axios';
import CfSubmission from '../models/CfProblemStat.js';
import Student from '../models/Student.js'
import sendInactivityReminders from './email.js';

// synchronizes Codeforces submission data for all students in 
// the database who have a Codeforces handle


// Fetch all submissions of a user from Codeforces
 
async function fetchUserSubmissions(handle) {
  const url = `https://codeforces.com/api/user.status?handle=${handle}`;
  const { data } = await axios.get(url);
  if (data.status !== 'OK') throw new Error(data.comment);
  return data.result; // Array of submission objects
}


// Sync raw submissions for a student

async function syncSubmissionsForStudent(student) {
  if (!student.codeforces_handle) {
    console.log(`Student ${student.name} has no Codeforces handle. Skipping submissions sync.`);
    return;
  }

  try {
    const submissions = await fetchUserSubmissions(student.codeforces_handle);

    // Prepare bulk operations for upsert
    const bulkOps = submissions.map(sub => ({
      updateOne: {
        filter: { submission_id: sub.id },
        update: {
          student: student._id,
          submission_id: sub.id,
          contest_id: sub.problem.contestId,
          problem_index: sub.problem.index,
          problem_name: sub.problem.name,
          problem_rating: sub.problem.rating || null,
          verdict: sub.verdict,
          creation_time: new Date(sub.creationTimeSeconds * 1000),
        },
        upsert: true,
      }
    }));

    if (bulkOps.length > 0) {
      await CfSubmission.bulkWrite(bulkOps);
      console.log(`Synced ${bulkOps.length} submissions for student ${student.name}`);
       const latestSubmissionTime = new Date(Math.max(...submissions.map(s => s.creationTimeSeconds)) * 1000);
      student.last_submission_date = latestSubmissionTime;
      student.last_sync = new Date();
      await student.save();
    } else {
      console.log(`No submissions found for student ${student.name}`);
    }
  } catch (error) {
    console.error(`Error syncing submissions for ${student.codeforces_handle}:`, error.message);
  }
}

//Fetches all students with Codeforces handles, synchronizes their submissions by calling 
// syncSubmissionsForStudent for each, and then triggers sending 
// inactivity reminder emails
async function syncAllStudentsSubmissions() {
 try {
  
  const students = await Student.find({ codeforces_handle: { $exists: true, $ne: null } });
  for (const student of students) {
    await syncSubmissionsForStudent(student);
  }
  console.log('All students submissions synced')
  await sendInactivityReminders();
 } catch (error) {
  console.error(`Error seeding submission from seedCfProblemStat: ${error}`)
 }
}

// export default syncAllStudentsSubmissions
export  {syncAllStudentsSubmissions,syncSubmissionsForStudent}