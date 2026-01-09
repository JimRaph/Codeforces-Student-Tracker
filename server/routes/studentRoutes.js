
import express from 'express'
import {getStudents, createStudent, updateStudent, deleteStudent, getContestHistory,
  getProblemStats, getRatingGraph, getSubmissionHeatmap, exportStudentsCsv
} from '../controllers/studentController.js'

const studentRouter = express.Router()

// For fetching contest history, problem statistics, rating graph,
// submission heatmap, and exporting student data as CSV

studentRouter.get('/', getStudents);
studentRouter.post('/', createStudent);
studentRouter.put('/:id', updateStudent);
studentRouter.delete('/:id', deleteStudent);
studentRouter.get('/export/csv', exportStudentsCsv);

studentRouter.get('/:id/contest-history', getContestHistory);
studentRouter.get('/:id/problem-stats', getProblemStats);
studentRouter.get('/:id/rating-graph', getRatingGraph);
studentRouter.get('/:id/submission-heatmap', getSubmissionHeatmap);


export default studentRouter;
