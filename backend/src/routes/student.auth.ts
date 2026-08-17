import { Router } from 'express';
import { register, login, getMe } from '../controllers/student.auth.controller';
import { requireStudentAuth } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireStudentAuth, getMe);

export default router;
