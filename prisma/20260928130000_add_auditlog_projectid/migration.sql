-- Add projectId to AuditLog
ALTER TABLE "AuditLog"
ADD COLUMN "projectId" TEXT;

-- Add foreign key relation to Project
ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "Project"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
