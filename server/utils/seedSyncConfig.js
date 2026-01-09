import SyncConfig from '../models/SyncConfig.js';


//Ensure the synchronization configuration exists in the database by 
// checking for an existing record and creating a default one with a 
// daily 2 AM schedule if none is found
export async function seedSyncConfig() {
  const config = await SyncConfig.findOne();

  if (!config) {
    console.log("Seeding SyncConfig schema.....")
    await SyncConfig.create({
      cronTime: '0 2 * * *',
      enabled: true,
    });
    console.log('SyncConfig seeded with default schedule');
  }
}
