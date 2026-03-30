-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PM', 'PMO', 'Sponsor', 'Team_Member', 'Admin', 'Stakeholder');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Draft', 'Pending_Initial_Approval', 'Planning', 'Charter_Approval', 'Active', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM ('Hardware', 'Software', 'Services', 'Labor', 'Others');

-- CreateEnum
CREATE TYPE "BudgetType" AS ENUM ('CAPEX', 'OPEX');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('Pending', 'In_Progress', 'Completed');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Pending', 'In_Progress', 'Blocked', 'Completed');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('Low', 'Medium', 'High');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('Open', 'Closed');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('Time', 'Scope', 'Cost', 'Quality', 'Resources');

-- CreateEnum
CREATE TYPE "RiskStrategy" AS ENUM ('Avoid', 'Mitigate', 'Transfer', 'Accept', 'Escalate');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('Open', 'Resolved', 'Closed');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('Estimated', 'Approved', 'Paid');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "StakeholderPower" AS ENUM ('Low', 'High');

-- CreateEnum
CREATE TYPE "StakeholderInterest" AS ENUM ('Low', 'High');

-- CreateEnum
CREATE TYPE "SnapshotStatus" AS ENUM ('Open', 'Closed');

-- CreateEnum
CREATE TYPE "LessonCategory" AS ENUM ('Technical', 'Management', 'Communication', 'Procurement');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "department" TEXT,
    "phone" TEXT,
    "position" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "pmId" TEXT,
    "pmoId" TEXT,
    "businessCase" TEXT,
    "strategicAlignment" TEXT,
    "generalObjective" TEXT,
    "benefits" TEXT,
    "assumptions" TEXT,
    "constraints" TEXT,
    "rejectionComments" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "plannedValue" DOUBLE PRECISION,
    "earnedValue" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "cpi" DOUBLE PRECISION,
    "spi" DOUBLE PRECISION,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSponsor" (
    "projectId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,

    CONSTRAINT "ProjectSponsor_pkey" PRIMARY KEY ("projectId","sponsorId")
);

-- CreateTable
CREATE TABLE "ProjectTeamMember" (
    "projectId" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,

    CONSTRAINT "ProjectTeamMember_pkey" PRIMARY KEY ("projectId","teamMemberId")
);

-- CreateTable
CREATE TABLE "ProjectSpecificObjective" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "successCriteria" TEXT NOT NULL,
    "kpi" TEXT NOT NULL,

    CONSTRAINT "ProjectSpecificObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "BudgetCategory" NOT NULL,
    "budgetType" "BudgetType" NOT NULL,
    "description" TEXT NOT NULL,
    "plannedAmount" DOUBLE PRECISION NOT NULL,
    "status" "ApprovalStatus" NOT NULL,
    "approvedBy" TEXT,
    "approvalDate" TIMESTAMP(3),

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "weight" INTEGER,
    "status" "MilestoneStatus" NOT NULL,
    "progress" INTEGER NOT NULL,
    "acceptanceCriteria" TEXT,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "progress" INTEGER NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "priority" "TaskPriority" NOT NULL,
    "predecessorId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskLog" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "comment" TEXT NOT NULL,
    "previousProgress" INTEGER NOT NULL,
    "newProgress" INTEGER NOT NULL,
    "statusChange" TEXT,

    CONSTRAINT "TaskLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "impact" DOUBLE PRECISION NOT NULL,
    "status" "RiskStatus" NOT NULL,
    "category" "RiskCategory" NOT NULL,
    "strategy" "RiskStrategy" NOT NULL,
    "ownerId" TEXT,
    "mitigationPlan" TEXT,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAction" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ownerId" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "ApprovalStatus" NOT NULL,

    CONSTRAINT "RiskAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "taskId" TEXT,
    "description" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "status" "IssueStatus" NOT NULL,
    "resolutionDate" TIMESTAMP(3),
    "ownerId" TEXT,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "budgetLineId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "BudgetCategory" NOT NULL,
    "status" "ExpenseStatus" NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "originalStartDate" TIMESTAMP(3) NOT NULL,
    "originalEndDate" TIMESTAMP(3) NOT NULL,
    "newStartDate" TIMESTAMP(3) NOT NULL,
    "newEndDate" TIMESTAMP(3) NOT NULL,
    "justification" TEXT NOT NULL,
    "status" "ChangeRequestStatus" NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "requestedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stakeholder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "power" "StakeholderPower" NOT NULL,
    "interest" "StakeholderInterest" NOT NULL,
    "influenceStrategy" TEXT NOT NULL,

    CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSnapshot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "highlights" TEXT NOT NULL,
    "plannedValue" DOUBLE PRECISION NOT NULL,
    "earnedValue" DOUBLE PRECISION NOT NULL,
    "actualSpent" DOUBLE PRECISION NOT NULL,
    "cv" DOUBLE PRECISION NOT NULL,
    "sv" DOUBLE PRECISION NOT NULL,
    "cpi" DOUBLE PRECISION NOT NULL,
    "spi" DOUBLE PRECISION NOT NULL,
    "eac" DOUBLE PRECISION NOT NULL,
    "status" "SnapshotStatus" NOT NULL,

    CONSTRAINT "ProjectSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonLearned" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "LessonCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonLearned_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_pmId_fkey" FOREIGN KEY ("pmId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_pmoId_fkey" FOREIGN KEY ("pmoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSponsor" ADD CONSTRAINT "ProjectSponsor_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSponsor" ADD CONSTRAINT "ProjectSponsor_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTeamMember" ADD CONSTRAINT "ProjectTeamMember_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSpecificObjective" ADD CONSTRAINT "ProjectSpecificObjective_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_predecessorId_fkey" FOREIGN KEY ("predecessorId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLog" ADD CONSTRAINT "TaskLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskLog" ADD CONSTRAINT "TaskLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAction" ADD CONSTRAINT "RiskAction_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "Risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAction" ADD CONSTRAINT "RiskAction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_budgetLineId_fkey" FOREIGN KEY ("budgetLineId") REFERENCES "BudgetLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeRequest" ADD CONSTRAINT "ChangeRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stakeholder" ADD CONSTRAINT "Stakeholder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSnapshot" ADD CONSTRAINT "ProjectSnapshot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonLearned" ADD CONSTRAINT "LessonLearned_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonLearned" ADD CONSTRAINT "LessonLearned_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
