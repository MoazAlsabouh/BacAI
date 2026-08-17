import { Router } from 'express';
import { generatePdfBooklet, startOnlineExam, getExamAttempt } from '../controllers/exam.controller';
import { submitAnswer } from '../controllers/grading.controller';
import { getSubjects } from '../controllers/subject.controller';
import { optionalStudentAuth } from '../middlewares/optionalAuth';
import { requireStudentAuth } from '../middlewares/auth';

const router = Router();

// Student routes (Public / Optional Auth)
router.get('/subjects', getSubjects);
router.get('/exams/random-pdf', optionalStudentAuth, generatePdfBooklet);
router.post('/exams/start', optionalStudentAuth, startOnlineExam);
router.get('/exams/:attemptId', optionalStudentAuth, getExamAttempt);
router.post('/exams/:attemptId/submit', optionalStudentAuth, submitAnswer);

export default router;
