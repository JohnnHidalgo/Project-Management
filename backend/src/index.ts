import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '../.prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import usersRouter from './routes/users.js';
import tasksRouter from './routes/tasks.js';
import risksRouter from './routes/risks.js';
import riskActionsRouter from './routes/riskActions.js';
import milestonesRouter from './routes/milestones.js';
import issuesRouter from './routes/issues.js';
import expensesRouter from './routes/expenses.js';
import stakeholdersRouter from './routes/stakeholders.js';
import taskLogsRouter from './routes/taskLogs.js';
import changeRequestsRouter from './routes/changeRequests.js';
import projectHistoryRouter from './routes/projectHistory.js';
import budgetLinesRouter from './routes/budgetLines.js';
import projectSnapshotsRouter from './routes/projectSnapshots.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set in .env');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/risks', risksRouter);
app.use('/api/riskActions', riskActionsRouter);
app.use('/api/milestones', milestonesRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/stakeholders', stakeholdersRouter);
app.use('/api/taskLogs', taskLogsRouter);
app.use('/api/changeRequests', changeRequestsRouter);
app.use('/api/projectHistory', projectHistoryRouter);
app.use('/api/budgetLines', budgetLinesRouter);
app.use('/api/snapshots', projectSnapshotsRouter);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export { prisma };
