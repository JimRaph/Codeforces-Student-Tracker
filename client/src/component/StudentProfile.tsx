import React, { useState, useEffect } from 'react';
import api from '../api';
import ProblemsBarChart from '../charts/ProblemsBarChart';
import RatingLineChart from '../charts/RatingLineChart';
import SubmissionHeatmap from '../charts/SubmissionHeatmap';
import Toast from './Toast';

type Contest = {
  contest_id: number;
  contest_name: string;
  rank: number;
  old_rating: number;
  new_rating: number;
  rating_change: number;
  contest_date: string;
  unsolved_problems: number;
};

type ProblemStats = {
  most_difficult: number;
  total_solved: number;
  avg_rating: number;
  avg_problems_per_day: number;
  problems_per_rating_bucket: Record<string, number>;
  submission_heatmap: Record<string, number>;
};

interface StudentProfileProps {
  studentId: string;
  studentName: string
}

const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, studentName }) => {

  const [contestHistory, setContestHistory] = useState<Contest[]>([]);
  const [problemStats, setProblemStats] = useState<ProblemStats | null>(null);
  const [ratingGraph, setRatingGraph] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [contestDays, setContestDays] = useState(365);
  const [problemDays, setProblemDays] = useState(90);

  const [reminderCount, setReminderCount] = useState<number | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [reminderLoading, setReminderLoading] = useState<boolean>(true);
  const [reminderError, setReminderError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState('');

  async function fetchReminderInfo() {
    setReminderLoading(true);
    setReminderError(null);
    try {
      const res = await api.get(`/students/${studentId}/reminder-info`);
      console.log("RES", res)
      if (res.request.status == 200) {
        setReminderCount(res.data.reminder_email_count);
        setReminderEnabled(res.data.reminders_enabled);

      } else {
        setReminderError('Failed to load reminder info');
      }
    } catch (error) {
      console.error('Error fetching reminder info:', error);
      setReminderError('Error fetching reminder info');
    } finally {
      setReminderLoading(false);
    }
  }

  async function toggleReminder(enabled: boolean) {
    setReminderEnabled(enabled); // optimistic update

    try {
      const res = await api.post(`/students/${studentId}/disable-reminder`, { enabled });
      if (res.data.success) {
        setReminderEnabled(Boolean(res.data.reminders_enabled));
        setToastMessage(`Reminder is ${res.data.reminders_enabled == true ? 'enabled' : 'disabled'}`)
      } else {
        setToastMessage('Failed to update reminder setting');
        setReminderEnabled(!enabled); // revert if failed
      }
    } catch (error) {
      setToastMessage('Error updating reminder setting');
      setReminderEnabled(!enabled); // revert if error
    }
  }



  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [contestsRes, problemStatsRes, ratingGraphRes] = await Promise.all([
          api.get(`/students/${studentId}/contest-history`, { params: { days: contestDays } }),
          api.get(`/students/${studentId}/problem-stats`, { params: { days: problemDays } }),
          api.get(`/students/${studentId}/rating-graph`, { params: { days: contestDays } }),
        ]);
        if (contestsRes.data.success) setContestHistory(contestsRes.data.data);
        if (problemStatsRes.data.success) setProblemStats(problemStatsRes.data.data);
        if (ratingGraphRes.data.success) setRatingGraph(ratingGraphRes.data.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    fetchReminderInfo();
  }, [studentId, contestDays, problemDays]);

  if (loading) return <div className='dark:dark:text-gray-50
   dark:bg-gray-800 flex items-center justify-center'>Loading student profile...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-8">
        Student Profile: <span className="text-zinc-500 dark:text-zinc-400 font-normal">{studentName}</span>
      </h2>

      {/* Contest History Filter */}
      <div className="mb-6 space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">History Period</label>
        <div className="flex gap-2">
          {[30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => setContestDays(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all border ${contestDays === d
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
            >
              Last {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Contest History List */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Contest History</h3>
        {contestHistory.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-500 dark:text-zinc-400 text-sm">
            No contests found in this period.
          </div>
        ) : (
          <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Contest</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Change</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Unsolved</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {contestHistory.map((contest) => (
                  <tr key={contest.contest_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{new Date(contest.contest_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 font-medium">{contest.contest_name}</td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-600 dark:text-zinc-400 font-mono">{contest.rank}</td>
                    <td className={`px-4 py-3 text-sm text-right font-mono font-medium ${contest.rating_change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {contest.rating_change > 0 ? '+' : ''}{contest.rating_change}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-600 dark:text-zinc-400 font-mono">{contest.unsolved_problems}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {ratingGraph.length > 0 && (
        <div className="mb-10 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
          <RatingLineChart ratingData={ratingGraph} />
        </div>
      )}


      {/* Problem Stats Filter */}
      <div className="mb-6 space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Stats Period</label>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setProblemDays(d)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all border ${problemDays === d
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
            >
              Last {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Problem Stats Summary */}
      {problemStats && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Problem Solving Data</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Most Difficult</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{problemStats.most_difficult}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Total Solved</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{problemStats.total_solved}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{problemStats.avg_rating.toFixed(0)}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Avg / Day</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{problemStats.avg_problems_per_day.toFixed(1)}</p>
            </div>
          </div>

          <div className="space-y-8">
            <ProblemsBarChart problemsPerRatingBucket={problemStats.problems_per_rating_bucket} />
            <SubmissionHeatmap submissionHeatmap={problemStats.submission_heatmap} />
          </div>

        </div>
      )}

      <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/30">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Email Notifications</h3>

        {reminderLoading ? (
          <p className="text-sm text-zinc-500">Loading settings...</p>
        ) : reminderError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{reminderError}</p>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Emails sent: <strong className="text-zinc-900 dark:text-zinc-50">{reminderCount ?? 0}</strong>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!reminderEnabled}
                onChange={(e) => toggleReminder(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-600 dark:bg-zinc-800"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Enable Reminders</span>
            </label>
          </div>
        )}
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}


    </div>
  );
};

export default StudentProfile;
