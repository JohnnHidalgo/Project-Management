-- Add execution date column to BudgetLine
ALTER TABLE "BudgetLine" ADD COLUMN "executionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
