import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PrismaClient: GeneratedPrismaClient } = require('../prisma/.prisma/client');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL not set in .env');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new GeneratedPrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// TODO: Add routes for projects, users, etc.

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export { prisma };