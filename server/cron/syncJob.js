
import cron from 'node-cron';
import SyncConfig from '../models/SyncConfig.js';
import {syncAllStudentsContestHistory} from '../utils/seedCfProfile.js';
import {syncAllStudentsSubmissions} from '../utils/seedCfProblemStat.js';


// Holds the currently scheduled cron task
// Used to stop the previous task before scheduling a new one
 

let currentTask = null;

// Starts or restarts the cron job for syncing Codeforces data
// Reads the cron schedule and enabled flag from the SyncConfig collection
// Validates the cron expression, falling back to a default if invalid
// Stops any existing scheduled task before scheduling a new one
 
export async function startSyncCron() {
  // Gets sync configuration from the database
  const config = await SyncConfig.findOne();

  let cronTime = config?.cronTime;
  if (!cronTime || typeof cronTime !== 'string' || !cron.validate(cronTime)) {
    console.warn(`Invalid or missing cronTime "${cronTime}", falling back to default '0 2 * * *'`);
    cronTime = '0 2 * * *'; // fallback to 2 AM daily
  }

  // Stop the currently running cron task if it exists
  if (currentTask) currentTask.stop();

  currentTask = cron.schedule(cronTime, async () => {
    console.log('Starting daily Codeforces data sync...');
    try {
      await syncAllStudentsContestHistory();
      await syncAllStudentsSubmissions();
      console.log('Daily Codeforces data sync completed.');
    } catch (err) {
      console.error('Error during Codeforces data sync:', err);
    }
  }, {
    scheduled: config?.enabled ?? true,
  });

  console.log(`Cron job scheduled with time: ${cronTime}`);
}