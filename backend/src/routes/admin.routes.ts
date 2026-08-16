import { Router } from 'express';
import multer from 'multer';
import { uploadMaterial } from '../controllers/ingestion.controller';
import { getSubjects, createSubject, deleteSubject } from '../controllers/subject.controller';
import { getStats, getQuestions, deleteQuestion } from '../controllers/admin.controller';

const router = Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 250 * 1024 * 1024 } // 250 MB limit
});

// Stats and Questions routes
router.get('/stats', getStats);
router.get('/questions', getQuestions);
router.delete('/questions/:id', deleteQuestion);

// Subject routes
router.post('/upload-material', upload.single('file'), uploadMaterial);
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.delete('/subjects/:id', deleteSubject);

export default router;
