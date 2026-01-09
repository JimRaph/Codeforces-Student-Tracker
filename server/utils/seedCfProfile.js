import axios from 'axios';
import CfContest from '../models/CfContest.js';
import Student from '../models/Student.js'

  // Fetch contest rating history for a user
  // Returns an array of contests with rating changes

async function fetchUserRating(handle) {
  const url = `https://codeforces.com/api/user.rating?handle=${handle}`;
  const { data } = await axios.get(url);
  if (data.status !== 'OK') throw new Error(data.comment);
  return data.result; // Array of contest rating objects
}


  // Fetch submissions of a user in a specific contest
  // Used to calculate unsolved problems count
 
async function fetchContestSubmissions(contestId, handle) {
  const url = `https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}`;
  const { data } = await axios.get(url);
  if (data.status !== 'OK') throw new Error(data.comment);
  return data.result; // Array of submission objects
}


  // Calculate the number of unsolved problems for the user in the contest.
 
async function countUnsolvedProblems(contestId, handle) {
  const submissions = await fetchContestSubmissions(contestId, handle);

  const solvedProblems = new Set();
  const allProblems = new Set();

  submissions.forEach(sub => {
    const pid = `${sub.problem.contestId}-${sub.problem.index}`;
    allProblems.add(pid);
    if (sub.verdict === 'OK') solvedProblems.add(pid);
  });

  return allProblems.size - solvedProblems.size;
}


//  Sync contest history for a single student.
//  Fetches contest rating history and unsolved problem counts,
//  then seeds the CfContest collection.

async function syncContestHistoryForStudent(student) {
  if (!student.codeforces_handle) {
    console.log(`Student ${student.name} has no Codeforces handle. Skipping contest sync.`);
    return;
  }

  try {
    // Fetch contest rating history
    const contests = await fetchUserRating(student.codeforces_handle);

    // Remove old contest records for this student
    await CfContest.deleteMany({ student: student._id });

    // Prepare contest documents to insert
    const contestDocs = [];

    for (const contest of contests) {
      const unsolved = await countUnsolvedProblems(contest.contestId, student.codeforces_handle);

      contestDocs.push({
        student: student._id,
        contest_id: contest.contestId,
        contest_name: contest.contestName,
        rank: contest.rank,
        old_rating: contest.oldRating,
        new_rating: contest.newRating,
        rating_change: contest.newRating - contest.oldRating,
        contest_date: new Date(contest.ratingUpdateTimeSeconds * 1000),
        unsolved_problems: unsolved,
      });
    }

    // Insert all contest documents
    await CfContest.insertMany(contestDocs);
    // Update last_sync on the student document instance
    console.log(`Updating last_sync for student ${student._id}`);
    student.last_sync = new Date();
    await student.save();
console.log(`Updated last_sync for student ${student._id}`);

    console.log(`Contest history synced for student ${student.name} (${student.codeforces_handle})`);
  } catch (error) {
    console.error(`Error syncing contest history for ${student.codeforces_handle}:`, error.message);
  }
}


//Synchronize the contest history for all students who have a Codeforces
//handle by iterating through each student and updating their contest data, 
// while handling errors individually to avoid stopping the entire process.
async function syncAllStudentsContestHistory() {
  const students = await Student.find({ codeforces_handle: { $exists: true, $ne: null } });
  for (const student of students) {
    try {
      await syncContestHistoryForStudent(student);
    } catch (error) {
      console.error(`Failed to sync contest history for student ${student._id}:`, error);
    }
  }
}

export  {syncAllStudentsContestHistory, syncContestHistoryForStudent}
