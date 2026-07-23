import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import studentsRouter from './routes/students.js';
import classDaysRouter from './routes/classDays.js';
import attendanceRouter from './routes/attendance.js';
import reportsRouter from './routes/reports.js';
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/students', studentsRouter);
app.use('/api/class-days', classDaysRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/admin', adminRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
