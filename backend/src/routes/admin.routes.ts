import { Router } from 'express';
import multer from 'multer';
import { uploadMaterial } from '../controllers/ingestion.controller';
import { getSubjects, createSubject, deleteSubject } from '../controllers/subject.controller';

const router = Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 250 * 1024 * 1024 } // 250 MB limit
});

// Admin routes
router.post('/upload-material', upload.single('file'), uploadMaterial);
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);
router.delete('/subjects/:id', deleteSubject);

export default router;
