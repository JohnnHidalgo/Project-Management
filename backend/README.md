# Project Management Backend

Backend API for the PMBOK-compliant project management system.

## Setup

1. **Start PostgreSQL service** (requires administrator privileges):
   - Open PowerShell or Command Prompt as Administrator
   - Run: `net start postgresql-x64-16`

2. **Create the database:**
   ```bash
   npm run create-db
   ```

3. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database:**
   ```bash
   npm run prisma:seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data

## API Endpoints

- `GET /api/health` - Health check endpoint

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)