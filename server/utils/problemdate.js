/**
 * Compute problem stats for a student filtered by date range
 * @param {ObjectId} studentId - MongoDB ObjectId of student
 * @param {Date} startDate - start of date range (inclusive)
 * @param {Date} endDate - end of date range (inclusive)
 */


import CfSubmission from '../models/CfProblemStat.js';
//Compute detailed problem-solving statistics for a student within a 
// specified date range based on their Codeforces submissions.

async function computeProblemStatsByDate(studentId, startDate, endDate = new Date()) {
  // Fetch submissions in date range
  const submissions = await CfSubmission.find({
    student: studentId,
    creation_time: { $gte: startDate, $lte: endDate },
  }).sort({ creation_time: -1 });

  // Calculate stats (reuse logic from previous calculateProblemStats function)
  const solvedProblems = new Map();
  const submissionDates = new Map();

  submissions.forEach(sub => {
    if (sub.verdict === 'OK') {
      const pid = `${sub.contest_id}-${sub.problem_index}`;
      if (!solvedProblems.has(pid)) {
        solvedProblems.set(pid, sub.problem_rating || 0);
      }
    }
    const dateStr = sub.creation_time.toISOString().slice(0, 10);
    submissionDates.set(dateStr, (submissionDates.get(dateStr) || 0) + 1);
  });

  const totalSolved = solvedProblems.size;
  const ratings = Array.from(solvedProblems.values());
  const mostDifficult = ratings.length ? Math.max(...ratings) : 0;
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;

  const days = Math.max((endDate - startDate) / (1000 * 3600 * 24), 1);
  const avgProblemsPerDay = totalSolved / days;

  const problemsPerRatingBucket = {};
  ratings.forEach(r => {
    const bucketStart = Math.floor(r / 200) * 200;
    const bucket = `${bucketStart}-${bucketStart + 199}`;
    problemsPerRatingBucket[bucket] = (problemsPerRatingBucket[bucket] || 0) + 1;
  });

  return {
    most_difficult: mostDifficult,
    total_solved: totalSolved,
    avg_rating: avgRating,
    avg_problems_per_day: avgProblemsPerDay,
    problems_per_rating_bucket: problemsPerRatingBucket,
    submission_heatmap: Object.fromEntries(submissionDates),
  };
}


// const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// async function getProblemStatsForStudent(studentId, days) {
//   const startDate = daysAgo(days);
//   const stats = await computeProblemStatsByDate(studentId, startDate);
//   return stats;
// }

// export default getProblemStatsForStudent
export default computeProblemStatsByDate

