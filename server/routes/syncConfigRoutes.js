// routes/syncConfigRoutes.js
import express from 'express';
import SyncConfig from '../models/SyncConfig.js';
import { startSyncCron } from '../cron/syncJob.js';
import { syncAllStudentsContestHistory } from '../utils/seedCfProfile.js';
import { syncAllStudentsSubmissions } from '../utils/seedCfProblemStat.js';
import cron from 'node-cron';
import Student from '../models/Student.js';


//Handles routing of all synchronization functions
const syncRouter = express.Router();

// Retrieves the current synchronization configuration.
syncRouter.get('/', async (req, res) => {
  const config = await SyncConfig.findOne();
  res.json({ success: true, data: config });
});


// Updates the synchronization configuration.
syncRouter.put('/sync-config', async (req, res) => {
  const { cronTime, enabled } = req.body;
  let config = await SyncConfig.findOne();
  if (!config) config = new SyncConfig();
  if (cronTime !== undefined) {
  if (typeof cronTime !== 'string' || cronTime.trim() === '') {
    console.log(config.cronTime)
    // console.log('typeof')
    config.cronTime = '0 2 * * *'
    console.log(config.cronTime)
    return res.status(400).json({ success: false, error: 'Cron expression cannot be empty' });
  }
  if (!cron.validate(cronTime)) {
    return res.status(400).json({ success: false, error: 'Invalid cron expression' });
  }

  config.cronTime = cronTime;
}


  if (typeof enabled === 'boolean') config.enabled = enabled;
  await config.save();

  await startSyncCron(); // restart cron with new config

  res.json({ success: true, data: config });
});


// Manually triggers synchronization of all students
// contest history and submissions.
syncRouter.post('/sync-now', async (req, res) => {
  try {
    await syncAllStudentsContestHistory();
    await syncAllStudentsSubmissions();
    res.json({ success: true, message: 'Sync completed manually' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get reminder info for a student
syncRouter.get('/students/:id/reminder-info', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    res.json({
      reminder_email_count: student.reminder_email_count || 0,
      reminders_enabled: student.reminders_enabled || false,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle reminder disabled flag for a student
syncRouter.post('/students/:id/disable-reminder', async (req, res) => {
  try {
    const { enabled } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.reminders_enabled = enabled;
    await student.save();

    res.json({ success: true, reminders_enabled: student.reminders_enabled });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


export default syncRouter;
