import React, { useState, useEffect } from 'react';
import Toast from './Toast';


interface StudentFormProps {
  initialData?: {
    name: string;
    email: string;
    phone?: string;
    cf_handle?: string;
    current_rating?: number | null;
    max_rating?: number | null;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface StudentProp {
  name: string;
  max_rating: number | null;
  email: string;
  cf_handle: string;
  current_rating: number | null;
  phone: string
}

const StudentForm: React.FC<StudentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<StudentProp>({
    name: '',
    email: '',
    phone: '',
    cf_handle: '',
    current_rating: null,
    max_rating: null,
  });
  const [toastMessage, setToastMessage] = useState('');


  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name ?? '',
        email: initialData.email ?? '',
        phone: initialData.phone ?? '',
        cf_handle: initialData.cf_handle ?? '',
        current_rating: initialData.current_rating ?? null,
        max_rating: initialData.max_rating ?? null,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'current_rating' || name === 'max_rating' ? (value ? Number(value) : null) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setToastMessage('Name and Email are required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 dark:bg-zinc-950">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100 transition-shadow"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className="block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100 transition-shadow"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">Phone</label>
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100 transition-shadow"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">Codeforces Handle</label>
        <input
          name="cf_handle"
          value={formData.cf_handle}
          onChange={handleChange}
          className="block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100 transition-shadow"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">Current Rating</label>
          <input
            name="current_rating"
            type="number"
            value={formData.current_rating ?? ''}
            onChange={handleChange}
            className="block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100 transition-shadow"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">Max Rating</label>
          <input
            name="max_rating"
            type="number"
            value={formData.max_rating ?? ''}
            onChange={handleChange}
            className="block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100 transition-shadow"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-zinc-900 dark:bg-zinc-50 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm transition-all text-center"
        >
          Save
        </button>
      </div>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

    </form>
  );
};

export default StudentForm;
