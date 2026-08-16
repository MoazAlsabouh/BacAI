import { Router } from 'express';
import { generatePdfBooklet, startOnlineExam, getExamAttempt } from '../controllers/exam.controller';
import { submitAnswer } from '../controllers/grading.controller';
import { getSubjects } from '../controllers/subject.controller';

const router = Router();

// Student routes (Public)
router.get('/subjects', getSubjects);
router.get('/exams/random-pdf', generatePdfBooklet);
router.post('/exams/start', startOnlineExam);
router.get('/exams/:attemptId', getExamAttempt);
router.post('/exams/:attemptId/submit', submitAnswer);

export default router;
