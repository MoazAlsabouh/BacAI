import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import adminRoutes from './routes/admin.routes';
import studentRoutes from './routes/student.routes';
import authRoutes from './routes/auth.routes';
import studentAuthRoutes from './routes/student.auth';

app.use(cors());
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ limit: '250mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/student/auth', studentAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BacAI Backend is running' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
