-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectCode" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "projectType" TEXT,
    "projectCategory" TEXT,
    "department" TEXT,
    "division" TEXT,
    "officeUnit" TEXT,
    "responsibleOfficer" TEXT,
    "state" TEXT,
    "district" TEXT,
    "block" TEXT,
    "village" TEXT,
    "siteLocation" TEXT,
    "estimatedCost" REAL,
    "sanctionedAmount" REAL,
    "budgetHead" TEXT,
    "fundingSource" TEXT,
    "financialYearId" TEXT,
    "startDate" DATETIME,
    "expectedCompletion" DATETIME,
    "actualCompletion" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "remarks" TEXT,
    "deletedAt" DATETIME,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "FinancialYear" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Project_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenderNumber" TEXT NOT NULL,
    "tenderTitle" TEXT NOT NULL,
    "description" TEXT,
    "tenderType" TEXT,
    "procurementMethod" TEXT,
    "tenderCategory" TEXT,
    "estimatedValue" REAL,
    "tenderFee" REAL,
    "emdAmount" REAL,
    "publishDate" DATETIME,
    "submissionStartDate" DATETIME,
    "submissionEndDate" DATETIME,
    "bidOpeningDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "remarks" TEXT,
    "deletedAt" DATETIME,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tender_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tender_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Tender_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectCode_key" ON "Project"("projectCode");

-- CreateIndex
CREATE INDEX "Project_projectCode_idx" ON "Project"("projectCode");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_financialYearId_idx" ON "Project"("financialYearId");

-- CreateIndex
CREATE UNIQUE INDEX "Tender_tenderNumber_key" ON "Tender"("tenderNumber");

-- CreateIndex
CREATE INDEX "Tender_tenderNumber_idx" ON "Tender"("tenderNumber");

-- CreateIndex
CREATE INDEX "Tender_status_idx" ON "Tender"("status");

-- CreateIndex
CREATE INDEX "Tender_projectId_idx" ON "Tender"("projectId");
