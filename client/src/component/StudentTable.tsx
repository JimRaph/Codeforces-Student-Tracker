import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import StudentForm from './StudentForm';
import Modal from './Modal';
import FileSaver from 'file-saver';
import Toast from './Toast';
import { Pencil, Trash2 } from 'lucide-react';


const PAGE_SIZE = 10;

interface StudentProp {
  _id: string;
  name: string;
  max_rating: number;
  email: string;
  cf_handle: string;
  current_rating: number;
  phone: string,
  last_sync: Date
}

interface StudentTableProps {
  // students: StudentProp[]; 
  onViewDetails: (student: StudentProp) => void;
}

export default function StudentTable({ onViewDetails }: StudentTableProps) {
  const [students, setStudents] = useState<StudentProp[]>([]);
  // const [filter, setFilter] = useState('');
  // const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const filter = searchParams.get('filter') || '';
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentProp | null>(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<StudentProp | null>(null);


  // Fetch students from backend API with Axios
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/students/', {
        params: { filter, page, pageSize: PAGE_SIZE },
      });
      const data = response.data;
      console.log('fetched: ', response)
      if (data.success) {
        setStudents(data.data.students);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setToastMessage('Failed to fetch students: ' + data.error);
      }
    } catch (error) {
      if (error instanceof Error) {
        setToastMessage('Error fetching students: ' + error.message);
        console.log(error)
      } else {
        setToastMessage('An unexpected error occurred.');
        console.log(error)
      }
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchStudents();
  }, [filter, page]);


  const handleEdit = (student: StudentProp) => {
    setEditingStudent(student);
  };


  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), filter });
  };

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ page: '1', filter: e.target.value });
  };

  // handle student modal deletion
  const handleDelete = (student: StudentProp) => {
    setStudentToDelete(student);
  };


  const handleFormSubmit = async (data: StudentProp) => {
    try {
      const response = await api.put(`/students/${editingStudent?._id}`, data);
      console.log('Update: ', response)
      if (response.data.success) {
        setToastMessage('Student updated successfully');
        setEditingStudent(null);
        fetchStudents();
      } else {
        setToastMessage('Update failed: ' + response.data.error);
      }
    } catch (error) {
      if (error instanceof Error) {
        setToastMessage('Error updating student: ' + error.message);
      } else {
        setToastMessage('Error updating student.');
      }
    }
  };


  const handleAdd = () => {
    setAddingStudent(true);
  };

  const handleAddSubmit = async (data: StudentProp) => {
    try {
      const response = await api.post('/students', data);
      if (response.data.success) {
        setToastMessage('Student added successfully');
        setAddingStudent(false);
        fetchStudents();
      } else {
        setToastMessage('Add failed: ' + response.data.error);
      }
    } catch (error) {
      if (error instanceof Error) {
        setToastMessage('Error adding student: ' + error.message);
      } else {
        setToastMessage('Error adding student.');
      }
    }
  };

  const handleAddCancel = () => {
    setAddingStudent(false);
  };


  const handleFormCancel = () => {
    setEditingStudent(null);
  };


  const handleDeletefun = async () => {
    try {
      const response = await api.delete(`/students/${studentToDelete?._id}`);
      if (response.data.success) {
        setToastMessage('Student deleted');
        fetchStudents();
      } else {
        setToastMessage('Delete failed: ' + response.data.error);
      }
    } catch (error) {
      if (error instanceof Error) {
        setToastMessage('Error deleting student: ' + error.message);
      } else {
        setToastMessage('Error deleting student.');
      }
    } finally {
      setStudentToDelete(null);
    }
  }

  const handleExportCsv = async () => {
    try {
      setToastMessage('Preparing CSV export...');
      const response = await api.get('/students/export/csv', {
        params: { filter },
        responseType: 'blob', 
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });

      FileSaver.saveAs(blob, 'students.csv');

      setToastMessage('CSV download started');
    } catch (error) {
      if (error instanceof Error) {
        setToastMessage('Error downloading csv: ' + error.message);
      } else {
        setToastMessage('Error downloading csv.');
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 py-8 dark:text-zinc-50 transition-colors">
      <div className="flex flex-col  md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 pb-4">
          Enrolled Students Codeforces Student Tracker
        </h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search students..."
            value={filter}
            onChange={handleSearchChange}
            className="border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2  bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 dark:text-zinc-100 transition-all text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              Add Student
            </button>
            <button
              onClick={handleExportCsv}
              className="bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm bg-white dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Handle</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Max</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-10">Last Sync</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    Loading data...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr
                    key={student._id}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    onClick={() => onViewDetails && onViewDetails(student)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 font-mono">{student.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 font-mono tabular-nums">{student.cf_handle || '-'}</td>
                    <td className="px-6 py-4 text-sm text-right font-mono tabular-nums text-zinc-900 dark:text-zinc-100">{student.current_rating ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-right font-mono tabular-nums text-zinc-500 dark:text-zinc-500">{student.max_rating ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-500 pl-10">{student.last_sync ? new Date(student.last_sync).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleEdit(student);
                          }}
                          className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                          aria-label={`Edit ${student.name}`}
                        >
                          <Pencil className='w-4 h-4' />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(student);
                          }}
                          className="p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          aria-label={`Delete ${student.name}`}
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 shadow-sm max-w-xs mx-auto">
        <button
          onClick={() => handlePageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${page === 1
              ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
        >
          Previous
        </button>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 font-mono">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(Math.max(page + 1, 1))}
          disabled={page === totalPages}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${page === totalPages
              ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
        >
          Next
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editingStudent} onClose={handleFormCancel} title="Edit Student">
        {editingStudent && (
          <StudentForm
            initialData={editingStudent}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={addingStudent} onClose={handleAddCancel} title="Add Student">
        <StudentForm onSubmit={handleAddSubmit} onCancel={handleAddCancel} />
      </Modal>

      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}


      {studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg space-y-4 w-80 text-center">
            <p className="text-lg text-gray-900 dark:text-gray-100">
              Are you sure you want to delete <strong>{studentToDelete.name}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletefun}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
