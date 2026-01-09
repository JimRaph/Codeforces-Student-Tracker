// import React from 'react';
import SyncConfig from './Cron';

function AdminPage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-zinc-950/50">
      <SyncConfig />
    </div>
  );
}

export default AdminPage;
