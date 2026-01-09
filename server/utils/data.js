// import axios from 'axios';

// // Fetch basic user profile info from Codeforces API
// async function fetchUserInfo(handle) {
//   const { data } = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
//   if (data.status !== 'OK') throw new Error(data.comment);
//   return data.result[0];
// }

// //Fetch contest rating history for a user
// async function fetchUserRating(handle) {
//   const { data } = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
//   if (data.status !== 'OK') throw new Error(data.comment);
//   return data.result;
// }

// //Fetch all submissions by the user
// async function fetchUserSubmissions(handle) {
//   const { data } = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}`);
//   if (data.status !== 'OK') throw new Error(data.comment);
//   return data.result;
// }

// //Count how many problems in a contest the user did not solve
// async function countUnsolvedProblems(contestId, handle) {
//   const { data } = await axios.get(`https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}`);
//   if (data.status !== 'OK') throw new Error(data.comment);

//   const solved = new Set();
//   const allProblems = new Set();

//   data.result.forEach(sub => {
//     const pid = `${sub.problem.contestId}-${sub.problem.index}`;
//     allProblems.add(pid);
//     if (sub.verdict === 'OK') solved.add(pid);
//   });

//   return allProblems.size - solved.size;
// }


// //Analyze submissions to compute problem-solving statistics
// function calculateProblemStats(submissions) {
//   const solvedProblems = new Map();
//   const submissionDates = new Map();

//   submissions.forEach(sub => {
//     if (sub.verdict === 'OK') {
//       const pid = `${sub.problem.contestId}-${sub.problem.index}`;
//       if (!solvedProblems.has(pid)) {
//         solvedProblems.set(pid, sub.problem.rating || 0);
//       }
//     }
//     const date = new Date(sub.creationTimeSeconds * 1000).toISOString().slice(0, 10);
//     submissionDates.set(date, (submissionDates.get(date) || 0) + 1);
//   });

//   const totalSolved = solvedProblems.size;
//   const ratings = Array.from(solvedProblems.values());
//   const mostDifficult = ratings.length ? Math.max(...ratings) : 0;
//   const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

//   const firstDate = new Date(submissions[submissions.length - 1].creationTimeSeconds * 1000);
//   const lastDate = new Date(submissions[0].creationTimeSeconds * 1000);
//   const days = Math.max((lastDate - firstDate) / (1000 * 3600 * 24), 1);
//   const avgProblemsPerDay = totalSolved / days;

//   const buckets = {};
//   ratings.forEach(r => {
//     const bucket = `${Math.floor(r / 200) * 200}-${Math.floor(r / 200) * 200 + 199}`;
//     buckets[bucket] = (buckets[bucket] || 0) + 1;
//   });

//   return {
//     mostDifficult,
//     totalSolved,
//     avgRating,
//     avgProblemsPerDay,
//     problemsPerRatingBucket: buckets,
//     submissionHeatmap: Object.fromEntries(submissionDates),
//   };
// }


// //Sync all Codeforces data for a single student
// async function syncStudentCfData(student, CfProfile, CfContest, CfProblemStat) {
//   try {
//     if (!student.codeforces_handle) {
//       console.log(`Skipping student ${student.name} - no Codeforces handle`);
//       return;
//     }

//     // Fetch profile info
//     const profile = await fetchUserInfo(student.codeforces_handle);

//     // Upsert CF profile
//     await CfProfile.findOneAndUpdate(
//       { student: student._id },
//       {
//         current_rating: profile.rating || null,
//         max_rating: profile.maxRating || null,
//         last_updated: new Date(),
//         student: student._id,
//       },
//       { upsert: true, new: true }
//     );

//     // Fetch contest rating history
//     const contests = await fetchUserRating(student.codeforces_handle);

//     // Remove old contests and insert new
//     await CfContest.deleteMany({ student: student._id });

//     for (const contest of contests) {
//       const unsolved = await countUnsolvedProblems(contest.contestId, student.codeforces_handle);
//       await CfContest.create({
//         student: student._id,
//         contest_id: contest.contestId,
//         contest_name: contest.contestName,
//         rank: contest.rank,
//         old_rating: contest.oldRating,
//         new_rating: contest.newRating,
//         rating_change: contest.newRating - contest.oldRating,
//         contest_date: new Date(contest.ratingUpdateTimeSeconds * 1000),
//         unsolved_problems: unsolved,
//       });
//     }

//     // Fetch submissions and calculate problem stats
//     const submissions = await fetchUserSubmissions(student.codeforces_handle);
//     const stats = calculateProblemStats(submissions);

//     // Upsert problem stats
//     await CfProblemStat.findOneAndUpdate(
//       { student: student._id },
//       {
//         ...stats,
//         last_updated: new Date(),
//         student: student._id,
//       },
//       { upsert: true, new: true }
//     );

//     // Update student's last sync timestamp
//     student.last_sync = new Date();
//     await student.save();

//     console.log(`Sync completed for ${student.codeforces_handle}`);
//   } catch (error) {
//     console.error(`Error syncing ${student.codeforces_handle}:`, error.message);
//   }
// }


// const mongoose = require('mongoose');
// // Entry point to sync all students with Codeforces handles
// async function main(Student, CfProfile, CfContest, CfProblemStat) {
//   try {
//     await mongoose.connect('mongodb://localhost:27017/your_database_name', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     // Fetch all students with CF handles
//     const students = await Student.find({ codeforces_handle: { $ne: null } }).limit(100);

//     for (const student of students) {
//       await syncStudentCfData(student, CfProfile, CfContest, CfProblemStat);
//     }

//     console.log('All students synced.');
//   } catch (error) {
//     console.error('Error in main sync:', error);
//   } finally {
//     await mongoose.disconnect();
//   }
// }

// main(Student, CfProfile, CfContest, CfProblemStat);
