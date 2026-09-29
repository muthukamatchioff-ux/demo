-- AlterTable
ALTER TABLE "Contract" ADD COLUMN "projectId" TEXT;

-- AlterTable
ALTER TABLE "Tec" ADD COLUMN "projectId" TEXT;

-- AddForeignKey
ALTER TABLE "Tec"
ADD CONSTRAINT "Tec_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract"
ADD CONSTRAINT "Contract_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
