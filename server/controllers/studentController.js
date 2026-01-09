
import Student from '../models/Student.js'
import CfContest from '../models/CfContest.js';
import CfSubmission from '../models/CfProblemStat.js';
import { Parser } from 'json2csv';
import { parsePaginationParams, parseStudentFilter } from '../utils/pagination.js';
import computeProblemStatsByDate from '../utils/problemdate.js'
import { syncContestHistoryForStudent } from '../utils/seedCfProfile.js';
import { syncSubmissionsForStudent } from '../utils/seedCfProblemStat.js';





// Helper function for error response

function errorResponse(res, endpoint, err) {
  return res.status(500).json({ success: false, data: null, error: `${endpoint}: ${err.message}` });
}

// GET /api/students?filter=&page=&pageSize=
// Gets all the students for table view
// With pagination
const getStudents = async (req, res) => {
  const endpoint = 'GET /api/students';
  try {
    console.log("getting all students")
    const { page, pageSize } = parsePaginationParams(req);
    const filter = parseStudentFilter(req);

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ name: 1 })
      .select('name email phone codeforces_handle cf_handle current_rating max_rating last_sync');

    res.json({
      success: true,
      data: {
        students,
        pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
      },
      error: null,
    });

    console.log("All student loaded", students)

  } catch (err) {
    errorResponse(res, endpoint, err);
  }
};

// POST /api/students
// Allows for creation of new students
const createStudent = async (req, res) => {
  const endpoint = 'POST /api/students';
  try {
    console.log("creating student")
    const { name, email, phone, codeforces_handle, current_rating, max_rating } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, data: null, error: `${endpoint}: Name and Email are required` });
    }
    const student = new Student({ name, email, phone, codeforces_handle, current_rating, max_rating });
    await student.save();
    res.json({ success: true, data: student, error: null });
    console.log(" student drunk")
  } catch (err) {
    errorResponse(res, endpoint, err);
  }
};

// PUT /api/students/:id
// Handles updating of student info
// const updateStudent = async (req, res) => {
//   const endpoint = 'PUT /api/students/:id';
//   try {
//     console.log("updating students")
//     const updateData = req.body;
//     const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     if (!student) {
//       return res.status(404).json({ success: false, data: null, error: `${endpoint}: Student not found` });
//     }

    
//     const oldHandle = student.codeforces_handle;
//     Object.assign(student, updateData);
//     await student.save();

//     // If CF handle changed, sync immediately
//     if (updateData.codeforces_handle && updateData.codeforces_handle !== oldHandle) {
//       await Promise.all([
//         syncContestHistoryForStudent(student),
//         syncSubmissionsForStudent(student),
//       ]);
//     }

//     res.json({ success: true, data: student, error: null });
//     console.log("updated students")
//   } catch (err) {
//     errorResponse(res, endpoint, err);
//   }
// };

const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const updateData = req.body;

    // Fetch current student to get existing handle
    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }


    const oldHandle = existingStudent.cf_handle;
    const newHandle = updateData.cf_handle;
    console.log('old: ', oldHandle, 'new handle: ', newHandle)

    // Update student data
    const updatedStudent = await Student.findByIdAndUpdate(studentId, updateData, { new: true });

    // If CF handle changed, sync immediately
    if (newHandle && newHandle !== oldHandle) {
      await Promise.all([
        syncContestHistoryForStudent(updatedStudent),
        syncSubmissionsForStudent(updatedStudent),
      ]);
    }

    res.json({ success: true, data: updatedStudent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// DELETE /api/students/:id
// Handles deletion of student
const deleteStudent = async (req, res) => {
  const endpoint = 'DELETE /api/students/:id';
  try {
    console.log("deleting students")
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, data: null, error: `${endpoint}: Student not found` });
    }
    res.json({ success: true, data: { message: 'Student deleted' }, error: null });
    console.log("deleted students")
  } catch (err) {
    errorResponse(res, endpoint, err);
  }
};

// GET /api/students/export/csv?filter=
// Allows for the download of student data as a csv file
const exportStudentsCsv = async (req, res) => {
  const endpoint = 'GET /api/students/export/csv';
  try {
    console.log("download=ding csv")
    const filter = parseStudentFilter(req);
    const students = await Student.find(filter)
      .sort({ name: 1 })
      .select('name email phone codeforces_handle current_rating max_rating');

    const fields = ['name', 'email', 'phone', 'codeforces_handle', 'current_rating', 'max_rating'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(students);

    res.header('Content-Type', 'text/csv');
    res.attachment('students.csv');
    res.send(csv);
    console.log("files downladed")
  } catch (err) {
    errorResponse(res, endpoint, err);
  }
};

// GET /api/students/:id/contest-history?days=30|90|365
// Gets all the contest history of a student
const getContestHistory = async (req, res) => {
  const endpoint = 'GET /api/students/:id/contest-history';
  try {
    console.log(" getting contest history")
    const days = parseInt(req.query.days) || 365;
    if (![30, 90, 365].includes(days)) {
      return res.status(400).json({ success: false, data: null, error: `${endpoint}: Invalid days filter` });
    }
    const studentId = req.params.id;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const contests = await CfContest.find({
      student: studentId,
      contest_date: { $gte: cutoffDate }
    }).sort({ contest_date: 1 });

    res.json({ success: true, data: contests, error: null });
    console.log("contest history of students")
  } catch (err) {
    errorResponse(res, endpoint, err);
  }
};

// GET /api/students/:id/problem-stats?days=7|30|90
// Gets all the data for problem stats in the frontend
// For a student. Supports filtering
const getProblemStats = async (req, res) => {
  const endpoint = 'GET /api/students/:id/problem-stats';
  try {
    console.log("getting problem data students")
    const days = parseInt(req.query.days) || 90;
    if (![7, 30, 90].includes(days)) {
      return res.status(400).json({ success: false, data: null, error: `${endpoint}: Invalid days filter` });
    }
    const studentId = req.params.id;

    // Assuming you have a function computeProblemStatsByDate(studentId, startDate, endDate)
    // const { computeProblemStatsByDate } = require('../services/problemStatsService');
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const stats = await computeProblemStatsByDate(studentId, startDate);

    res.json({ success: true, data: stats, error: null });
    console.log("problem stas")
  } catch (err) {
    errorResponse(res, endpoint, err);
  }
};

// GET /api/students/:id/submission-heatmap?days=7|30|90
// Gets the data needed to create submission heatmap
const getSubmissionHeatmap = async (req, res) => {
  const endpoint = 'GET /api/students/:id/submission-heatmap';
  try {
    console.log("getting submission heatmap data")
    const days = parseInt(req.query.days) || 30;
    if (![7, 30, 90].includes(days)) {
      return res.status(400).json({ success: false, data: null, error: `${endpoint}: Invalid days filter` });
    }
    const studentId = req.params.id;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const submissions = await CfSubmission.aggregate([
      { $match: { student: studentId, creation_time: { $gte: cutoffDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$creation_time" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Convert aggregation result to { date: count } object
    const heatmap = {};
    submissions.forEach(s => {
      heatmap[s._id] = s.count;
    });

    res.json({ success: true, data: heatmap, error: null });

    console.log("heat map data done")
  } catch (err) {
    errorResponse(res, endpoint, err);
  }
};

// GET /api/students/:id/rating-graph?days=7|30|90
// Gets the data needed to create the rating graph
const getRatingGraph = async (req, res) => {
  const endpoint = 'GET /api/students/:id/rating-graph';
  try {
    console.log("getting grapn")
    const days = parseInt(req.query.days) || 365;
    if (![30, 90, 365].includes(days)) {
      return res.status(400).json({ success: false, data: null, error: `${endpoint}: Invalid days filter` });
    }
    const studentId = req.params.id;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const contests = await CfContest.find({
      student: studentId,
      contest_date: { $gte: cutoffDate }
    }).sort({ contest_date: 1 }).select('contest_date contest_name old_rating new_rating rating_change');

    res.json({ success: true, data: contests, error: null });
  } catch (err) {
    errorResponse(res, endpoint, err);
  }
};

export {getStudents, createStudent, updateStudent, deleteStudent, getContestHistory,
  getProblemStats, getRatingGraph, getSubmissionHeatmap, exportStudentsCsv
}