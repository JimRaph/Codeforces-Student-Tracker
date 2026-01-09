
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import StudentTable from './component/StudentTable';
import StudentProfile from './component/StudentProfile';
import AdminPage from './component/AdminPage';
import Navigation from './component/Navigator';
import { ArrowBigLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';


interface StudentProp {
  _id: string;
  name: string;
  max_rating: number;
  email: string;
  cf_handle: string;
  current_rating: number;
  phone: string;
}

function StudentTableWrapper() {


  const navigate = useNavigate();

  const handleViewDetails = (student: StudentProp) => {
    navigate(`/students/${student._id}`, { state: { studentName: student.name } });

  };

  return <StudentTable onViewDetails={handleViewDetails} />;
}

function StudentProfileWrapper() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const studentName = location.state?.studentName || '';
  if (!id) return <div>Student ID not found</div>;
  return (
    <div className="min-h-screen p-6 ">
      <button
        onClick={() => window.history.back()}
        className="mb-4 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400
        dark:text-gray-900 flex gap-2 items-center"
      >
        <ArrowBigLeft size={25} /> Back to Students
      </button>
      <StudentProfile studentId={id} studentName={studentName} />
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<StudentTableWrapper />} />
          <Route path="/students/:id" element={<StudentProfileWrapper />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
