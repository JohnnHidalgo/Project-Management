-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "riskActionId" TEXT,
ALTER COLUMN "milestoneId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_riskActionId_fkey" FOREIGN KEY ("riskActionId") REFERENCES "RiskAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
