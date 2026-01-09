import { useState, useEffect } from 'react';
import api from '../api';
import { Clock, Calendar, AlertCircle, Check, Settings2, Save } from 'lucide-react';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export default function SyncConfig() {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');

  // State for different modes
  const [time, setTime] = useState('02:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(1);
  const [customCron, setCustomCron] = useState('');

  const daysOfWeek = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await api.get('/sync-config');
        if (res.data.success) {
          const { cronTime, enabled } = res.data.data;
          setEnabled(enabled);
          parseCronString(cronTime);
        }
      } catch (error) {
        console.error('Failed to fetch config', error);
      }
    }
    fetchConfig();
  }, []);

  const parseCronString = (cron: string) => {
    if (!cron) return;
    const parts = cron.trim().split(' ');
    if (parts.length !== 5) {
      setFrequency('custom');
      setCustomCron(cron);
      return;
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Check for Daily: "0 H * * *"
    if (minute === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      setFrequency('daily');
      setTime(`${hour.padStart(2, '0')}:00`);
      return;
    }

    // Check for Weekly: "0 H * * D,D"
    if (minute === '0' && dayOfMonth === '*' && month === '*') {
      setFrequency('weekly');
      setTime(`${hour.padStart(2, '0')}:00`);
      if (dayOfWeek === '*') {
        setSelectedDays([]);
      } else {
        const days = dayOfWeek.split(',').map(d => parseInt(d, 10)).filter(n => !isNaN(n));
        setSelectedDays(days);
      }
      return;
    }

    // Check for Monthly: "0 H D * *"
    if (minute === '0' && month === '*' && dayOfWeek === '*') {
      setFrequency('monthly');
      setTime(`${hour.padStart(2, '0')}:00`);
      setSelectedDate(parseInt(dayOfMonth, 10) || 1);
      return;
    }

    // Default to custom
    setFrequency('custom');
    setCustomCron(cron);
  };

  const getCronString = () => {
    const [hStr, mStr] = time.split(':');

    const minute = parseInt(mStr, 10);
    const hour = parseInt(hStr, 10);

    const m = isNaN(minute) ? 0 : minute;
    const h = isNaN(hour) ? 0 : hour;

    switch (frequency) {
      case 'daily':
        return `${m} ${h} * * *`;
      case 'weekly':
        const days = selectedDays.length > 0 ? selectedDays.join(',') : '*';
        return `${m} ${h} * * ${days}`;
      case 'monthly':
        return `${m} ${h} ${selectedDate} * *`;
      case 'custom':
        return customCron;
      default:
        return customCron;
    }
  };

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cronTime = getCronString();

    try {
      const res = await api.put('/sync-config', { cronTime, enabled });
      if (res.data.success) {
        setMessage('Sync schedule updated');
        setCustomCron(cronTime);
      } else {
        setMessage(res.data.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.error || 'Server returned an error';
      setMessage(errMsg);
      console.error(error);
    }

    setTimeout(() => setMessage(''), 5000);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sync Configuration
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Manage automated data synchronization schedules.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl">

        {/* Frequency Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['daily', 'weekly', 'monthly', 'custom'] as Frequency[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors duration-200
                ${frequency === f
                  ? 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-50 box-border border-b-2 border-zinc-900 dark:border-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-8">

          {/* Daily Config */}
          {frequency === 'daily' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Clock className="w-4 h-4" /> Run time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-gray-950 border border-zinc-200 dark:border-zinc-800
                   rounded-md focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all sm:w-40"
                />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Runs every day at {time}.
              </p>
            </div>
          )}

          {/* Weekly Config */}
          {frequency === 'weekly' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Clock className="w-4 h-4" /> Run time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all sm:w-40"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Calendar className="w-4 h-4" /> Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-9 h-9 text-xs font-medium rounded-md transition-all duration-200 border
                        ${selectedDays.includes(day.value)
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                          : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                    >
                      {day.label.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Monthly Config */}
          {frequency === 'monthly' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Clock className="w-4 h-4" /> Run time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all sm:w-40"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Calendar className="w-4 h-4" /> Day of month
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(parseInt(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all sm:w-40"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Custom Config */}
          {frequency === 'custom' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Settings2 className="w-4 h-4" /> Cron Expression
                </label>
                <input
                  value={customCron}
                  onChange={(e) => setCustomCron(e.target.value)}
                  placeholder="* * * * *"
                  className="w-full p-2.5 font-mono text-sm bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Format: Minute Hour DayOfMonth Month DayOfWeek
                </p>
              </div>
            </div>
          )}

          {/* Common Settings */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${enabled ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                <div className={`w-4 h-4 bg-white dark:bg-zinc-900 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                Active
              </span>
            </label>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium rounded-md shadow-sm transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>

          {message && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-md ${message.includes('updated') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
              {message.includes('updated') ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message}
            </div>
          )}

        </div>
      </form>
    </div>
  );
}
