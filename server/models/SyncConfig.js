
import mongoose from 'mongoose';

// Data for synchronization configuration.
// Stores settings for scheduling and enabling/disabling a sync cron job.

const syncConfigSchema = new mongoose.Schema({
  cronTime: { type: String, default: '0 2 * * *' }, // default 2 AM daily
  enabled: { type: Boolean, default: true },
});

const SyncConfig = mongoose.model('SyncConfig', syncConfigSchema);

export default SyncConfig;
