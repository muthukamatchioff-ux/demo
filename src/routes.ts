import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

// ── Permission helper ────────────────────────────────────────────────────────
const VIEWER_ROLES = ['Viewer', 'TEC Member'];
const EDITOR_ROLES = ['Admin', 'Project Coordinator', 'Senior Officer', 'Documentation User'];
const ADMIN_ROLES  = ['Admin'];

function canEdit(role: string) { return EDITOR_ROLES.includes(role); }
function canAdmin(role: string) { return ADMIN_ROLES.includes(role); }

// ── Validation helpers ───────────────────────────────────────────────────────
const PROJECT_STATUSES = ['Draft','Proposed','Approved','In Progress','On Hold','Completed','Cancelled','Closed'];

function validateProject(body: any): string[] {
  const errors: string[] = [];
  if (!body.projectCode?.trim())  errors.push('Project Code is required.');
  if (!body.projectName?.trim())  errors.push('Project Name is required.');
  if (body.startDate && body.expectedCompletion &&
      new Date(body.startDate) > new Date(body.expectedCompletion))
    errors.push('Expected Completion must be after Start Date.');
  if (body.status && !PROJECT_STATUSES.includes(body.status))
    errors.push(`Invalid status. Allowed: ${PROJECT_STATUSES.join(', ')}`);
  return errors;
}

const TENDER_STATUSES = ['Draft','Published','Open','Evaluation','Awarded','Cancelled','Closed'];

function validateTender(body: any): string[] {
  const errors: string[] = [];
  if (!body.tenderNumber?.trim()) errors.push('Tender Number is required.');
  if (!body.tenderTitle?.trim())  errors.push('Tender Title is required.');
  if (!body.projectId?.trim())    errors.push('Project is required.');
  if (body.submissionStartDate && body.submissionEndDate &&
      new Date(body.submissionStartDate) > new Date(body.submissionEndDate))
    errors.push('Submission End Date must be after Start Date.');
  if (body.submissionEndDate && body.bidOpeningDate &&
      new Date(body.submissionEndDate) > new Date(body.bidOpeningDate))
    errors.push('Bid Opening Date must be after Submission End Date.');
  if (body.status && !TENDER_STATUSES.includes(body.status))
    errors.push(`Invalid status. Allowed: ${TENDER_STATUSES.join(', ')}`);
  return errors;
}

const TEC_STATUSES = ['Draft','Constituted','Evaluation In Progress','Evaluation Completed','Recommendation Submitted','Approved','Closed','Cancelled'];

function validateTec(body: any): string[] {
  const errors: string[] = [];
  if (!body.tecReference?.trim()) errors.push('TEC Reference is required.');
  if (!body.tenderId?.trim())     errors.push('Tender is required.');
  if (body.evalStartDate && body.evalEndDate &&
      new Date(body.evalStartDate) > new Date(body.evalEndDate))
    errors.push('Evaluation End Date must be after Start Date.');
  if (body.status && !TEC_STATUSES.includes(body.status))
    errors.push(`Invalid status. Allowed: ${TEC_STATUSES.join(', ')}`);
  return errors;
}

const CONTRACT_STATUSES = ['Draft','Awarded','Active','Suspended','Completed','Terminated','Closed'];

function validateContract(body: any): string[] {
  const errors: string[] = [];
  if (!body.contractNumber?.trim()) errors.push('Contract Number is required.');
  if (!body.tenderId?.trim())       errors.push('Tender is required.');
  if (!body.contractorName?.trim()) errors.push('Contractor Name is required.');
  if (body.startDate && body.endDate &&
      new Date(body.startDate) > new Date(body.endDate))
    errors.push('End Date must be after Start Date.');
  if (body.status && !CONTRACT_STATUSES.includes(body.status))
    errors.push(`Invalid status. Allowed: ${CONTRACT_STATUSES.join(', ')}`);
  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/projects — list with pagination, search, filter, sort
router.get('/projects', async (req: any, res: any) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip   = (page - 1) * limit;
    const q      = (req.query.q as string || '').trim();
    const status = req.query.status as string || '';
    const fy     = req.query.financialYear as string || '';
    const dept   = req.query.department as string || '';

    const where: any = { deletedAt: null };
    if (status)  where.status = status;
    if (dept)    where.department = { contains: dept };
    if (fy)      where.financialYear = { year: fy };
    if (q) {
      where.OR = [
        { projectCode: { contains: q } },
        { projectName: { contains: q } },
        { department:  { contains: q } },
        { district:    { contains: q } },
        { state:       { contains: q } },
      ];
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        include: { financialYear: true, createdBy: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    res.json({ data: projects, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects — create
router.post('/projects', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });

  const errors = validateProject(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    // Duplicate check
    const existing = await prisma.project.findUnique({ where: { projectCode: req.body.projectCode.trim() } });
    if (existing) return res.status(409).json({ errors: [`Project Code '${req.body.projectCode}' already exists.`] });

    const project = await prisma.project.create({
      data: {
        projectCode:        req.body.projectCode.trim(),
        projectName:        req.body.projectName.trim(),
        description:        req.body.description?.trim() || null,
        projectType:        req.body.projectType?.trim() || null,
        projectCategory:    req.body.projectCategory?.trim() || null,
        department:         req.body.department?.trim() || null,
        division:           req.body.division?.trim() || null,
        officeUnit:         req.body.officeUnit?.trim() || null,
        responsibleOfficer: req.body.responsibleOfficer?.trim() || null,
        state:              req.body.state?.trim() || null,
        district:           req.body.district?.trim() || null,
        block:              req.body.block?.trim() || null,
        village:            req.body.village?.trim() || null,
        siteLocation:       req.body.siteLocation?.trim() || null,
        estimatedCost:      req.body.estimatedCost ? parseFloat(req.body.estimatedCost) : null,
        sanctionedAmount:   req.body.sanctionedAmount ? parseFloat(req.body.sanctionedAmount) : null,
        budgetHead:         req.body.budgetHead?.trim() || null,
        fundingSource:      req.body.fundingSource?.trim() || null,
        financialYearId:    req.body.financialYearId || null,
        startDate:          req.body.startDate ? new Date(req.body.startDate) : null,
        expectedCompletion: req.body.expectedCompletion ? new Date(req.body.expectedCompletion) : null,
        actualCompletion:   req.body.actualCompletion ? new Date(req.body.actualCompletion) : null,
        status:             req.body.status || 'Draft',
        remarks:            req.body.remarks?.trim() || null,
        createdById:        req.session.userId,
        updatedById:        req.session.userId,
      },
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'PROJECTS', recordId: project.id, details: `Created project ${project.projectCode}`, ipAddress: req.ip } });
    res.status(201).json(project);
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') return res.status(409).json({ errors: [`Project Code already exists.`] });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id
router.get('/projects/:id', async (req: any, res: any) => {
  try {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        financialYear: true,
        createdBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
        tenders: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/projects/:id
router.put('/projects/:id', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });

  const errors = validateProject(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const existing = await prisma.project.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });

    // Duplicate code check (exclude self)
    const dup = await prisma.project.findFirst({ where: { projectCode: req.body.projectCode.trim(), id: { not: req.params.id } } });
    if (dup) return res.status(409).json({ errors: [`Project Code '${req.body.projectCode}' is used by another project.`] });

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        projectCode:        req.body.projectCode.trim(),
        projectName:        req.body.projectName.trim(),
        description:        req.body.description?.trim() || null,
        projectType:        req.body.projectType?.trim() || null,
        projectCategory:    req.body.projectCategory?.trim() || null,
        department:         req.body.department?.trim() || null,
        division:           req.body.division?.trim() || null,
        officeUnit:         req.body.officeUnit?.trim() || null,
        responsibleOfficer: req.body.responsibleOfficer?.trim() || null,
        state:              req.body.state?.trim() || null,
        district:           req.body.district?.trim() || null,
        block:              req.body.block?.trim() || null,
        village:            req.body.village?.trim() || null,
        siteLocation:       req.body.siteLocation?.trim() || null,
        estimatedCost:      req.body.estimatedCost ? parseFloat(req.body.estimatedCost) : null,
        sanctionedAmount:   req.body.sanctionedAmount ? parseFloat(req.body.sanctionedAmount) : null,
        budgetHead:         req.body.budgetHead?.trim() || null,
        fundingSource:      req.body.fundingSource?.trim() || null,
        financialYearId:    req.body.financialYearId || null,
        startDate:          req.body.startDate ? new Date(req.body.startDate) : null,
        expectedCompletion: req.body.expectedCompletion ? new Date(req.body.expectedCompletion) : null,
        actualCompletion:   req.body.actualCompletion ? new Date(req.body.actualCompletion) : null,
        status:             req.body.status || existing.status,
        remarks:            req.body.remarks?.trim() || null,
        updatedById:        req.session.userId,
      },
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'UPDATE', module: 'PROJECTS', recordId: project.id, details: `Updated project ${project.projectCode}`, ipAddress: req.ip } });
    res.json(project);
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') return res.status(409).json({ errors: ['Project Code already exists.'] });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/projects/:id — soft delete
router.delete('/projects/:id', async (req: any, res: any) => {
  if (!canAdmin(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const existing = await prisma.project.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Project not found' });
    const activeTenders = await prisma.tender.count({ where: { projectId: req.params.id, deletedAt: null } });
    if (activeTenders > 0) return res.status(409).json({ error: `Cannot archive: ${activeTenders} active tender(s) exist. Archive tenders first.` });
    await prisma.project.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedById: req.session.userId } });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'ARCHIVE', module: 'PROJECTS', recordId: req.params.id, details: `Archived project ${existing.projectCode}`, ipAddress: req.ip } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id/tenders
router.get('/projects/:id/tenders', async (req: any, res: any) => {
  try {
    const project = await prisma.project.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const tenders = await prisma.tender.findMany({ where: { projectId: req.params.id, deletedAt: null }, orderBy: { createdAt: 'desc' } });
    res.json({ data: tenders, project: { id: project.id, projectCode: project.projectCode, projectName: project.projectName } });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TENDERS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/tenders
router.get('/tenders', async (req: any, res: any) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip   = (page - 1) * limit;
    const q      = (req.query.q as string || '').trim();
    const status = req.query.status as string || '';
    const projectId = req.query.projectId as string || '';

    const where: any = { deletedAt: null };
    if (status)    where.status = status;
    if (projectId) where.projectId = projectId;
    if (q) {
      where.OR = [
        { tenderNumber: { contains: q } },
        { tenderTitle:  { contains: q } },
        { project: { projectName: { contains: q } } },
        { project: { projectCode: { contains: q } } },
      ];
    }

    const [total, tenders] = await Promise.all([
      prisma.tender.count({ where }),
      prisma.tender.findMany({
        where,
        include: { project: { select: { id: true, projectCode: true, projectName: true } }, createdBy: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    res.json({ data: tenders, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tenders
router.post('/tenders', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });

  const errors = validateTender(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const project = await prisma.project.findFirst({ where: { id: req.body.projectId, deletedAt: null } });
    if (!project) return res.status(404).json({ errors: ['Project not found or has been archived.'] });

    const existing = await prisma.tender.findUnique({ where: { tenderNumber: req.body.tenderNumber.trim() } });
    if (existing) return res.status(409).json({ errors: [`Tender Number '${req.body.tenderNumber}' already exists.`] });

    const tender = await prisma.tender.create({
      data: {
        tenderNumber:       req.body.tenderNumber.trim(),
        tenderTitle:        req.body.tenderTitle.trim(),
        description:        req.body.description?.trim() || null,
        tenderType:         req.body.tenderType?.trim() || null,
        procurementMethod:  req.body.procurementMethod?.trim() || null,
        tenderCategory:     req.body.tenderCategory?.trim() || null,
        estimatedValue:     req.body.estimatedValue ? parseFloat(req.body.estimatedValue) : null,
        tenderFee:          req.body.tenderFee ? parseFloat(req.body.tenderFee) : null,
        emdAmount:          req.body.emdAmount ? parseFloat(req.body.emdAmount) : null,
        publishDate:        req.body.publishDate ? new Date(req.body.publishDate) : null,
        submissionStartDate: req.body.submissionStartDate ? new Date(req.body.submissionStartDate) : null,
        submissionEndDate:  req.body.submissionEndDate ? new Date(req.body.submissionEndDate) : null,
        bidOpeningDate:     req.body.bidOpeningDate ? new Date(req.body.bidOpeningDate) : null,
        status:             req.body.status || 'Draft',
        remarks:            req.body.remarks?.trim() || null,
        projectId:          req.body.projectId,
        createdById:        req.session.userId,
        updatedById:        req.session.userId,
      },
      include: { project: { select: { id: true, projectCode: true, projectName: true } } },
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'TENDERS', recordId: tender.id, details: `Created tender ${tender.tenderNumber}`, ipAddress: req.ip } });
    res.status(201).json(tender);
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') return res.status(409).json({ errors: ['Tender Number already exists.'] });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tenders/:id
router.get('/tenders/:id', async (req: any, res: any) => {
  try {
    const tender = await prisma.tender.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        project: { select: { id: true, projectCode: true, projectName: true, status: true } },
        createdBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
      },
    });
    if (!tender) return res.status(404).json({ error: 'Tender not found' });
    res.json(tender);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tenders/:id
router.put('/tenders/:id', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });

  const errors = validateTender(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const existing = await prisma.tender.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Tender not found' });

    const project = await prisma.project.findFirst({ where: { id: req.body.projectId, deletedAt: null } });
    if (!project) return res.status(404).json({ errors: ['Project not found or has been archived.'] });

    const dup = await prisma.tender.findFirst({ where: { tenderNumber: req.body.tenderNumber.trim(), id: { not: req.params.id } } });
    if (dup) return res.status(409).json({ errors: [`Tender Number '${req.body.tenderNumber}' is used by another tender.`] });

    const tender = await prisma.tender.update({
      where: { id: req.params.id },
      data: {
        tenderNumber:       req.body.tenderNumber.trim(),
        tenderTitle:        req.body.tenderTitle.trim(),
        description:        req.body.description?.trim() || null,
        tenderType:         req.body.tenderType?.trim() || null,
        procurementMethod:  req.body.procurementMethod?.trim() || null,
        tenderCategory:     req.body.tenderCategory?.trim() || null,
        estimatedValue:     req.body.estimatedValue ? parseFloat(req.body.estimatedValue) : null,
        tenderFee:          req.body.tenderFee ? parseFloat(req.body.tenderFee) : null,
        emdAmount:          req.body.emdAmount ? parseFloat(req.body.emdAmount) : null,
        publishDate:        req.body.publishDate ? new Date(req.body.publishDate) : null,
        submissionStartDate: req.body.submissionStartDate ? new Date(req.body.submissionStartDate) : null,
        submissionEndDate:  req.body.submissionEndDate ? new Date(req.body.submissionEndDate) : null,
        bidOpeningDate:     req.body.bidOpeningDate ? new Date(req.body.bidOpeningDate) : null,
        status:             req.body.status || existing.status,
        remarks:            req.body.remarks?.trim() || null,
        projectId:          req.body.projectId,
        updatedById:        req.session.userId,
      },
      include: { project: { select: { id: true, projectCode: true, projectName: true } } },
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'UPDATE', module: 'TENDERS', recordId: tender.id, details: `Updated tender ${tender.tenderNumber}`, ipAddress: req.ip } });
    res.json(tender);
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') return res.status(409).json({ errors: ['Tender Number already exists.'] });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tenders/:id — soft delete
router.delete('/tenders/:id', async (req: any, res: any) => {
  if (!canAdmin(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const existing = await prisma.tender.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Tender not found' });
    await prisma.tender.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedById: req.session.userId } });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'ARCHIVE', module: 'TENDERS', recordId: req.params.id, details: `Archived tender ${existing.tenderNumber}`, ipAddress: req.ip } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/financial-years — utility for dropdowns
router.get('/financial-years', async (_req: any, res: any) => {
  try {
    const fy = await prisma.financialYear.findMany({ orderBy: { year: 'asc' } });
    res.json(fy);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEC
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/tecs
router.get('/tecs', async (req: any, res: any) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip   = (page - 1) * limit;
    const q      = (req.query.q as string || '').trim();
    const status = req.query.status as string || '';
    const tenderId = req.query.tenderId as string || '';
    const projectId = req.query.projectId as string || '';

    const where: any = { deletedAt: null };
    if (status)    where.status = status;
    if (tenderId)  where.tenderId = tenderId;
    if (projectId) where.projectId = projectId;
    if (q) {
      where.OR = [
        { tecReference: { contains: q } },
        { committeeName: { contains: q } },
        { tender: { tenderNumber: { contains: q } } },
        { tender: { project: { projectCode: { contains: q } } } },
      ];
    }

    const [total, tecs] = await Promise.all([
      prisma.tec.count({ where }),
      prisma.tec.findMany({
        where,
        include: { tender: { select: { id: true, tenderNumber: true, tenderTitle: true, project: { select: { projectCode: true } } } }, createdBy: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    res.json({ data: tecs, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tecs
router.post('/tecs', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });

  const errors = validateTec(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const tender = await prisma.tender.findFirst({ where: { id: req.body.tenderId, deletedAt: null } });
    if (!tender) return res.status(404).json({ errors: ['Tender not found or has been archived.'] });

    const existing = await prisma.tec.findUnique({ where: { tecReference: req.body.tecReference.trim() } });
    if (existing) return res.status(409).json({ errors: [`TEC Reference '${req.body.tecReference}' already exists.`] });

    const tec = await prisma.tec.create({
      data: {
        tecReference:   req.body.tecReference.trim(),
        committeeName:  req.body.committeeName.trim(),
        formationDate:  req.body.formationDate ? new Date(req.body.formationDate) : null,
        orderNumber:    req.body.orderNumber?.trim() || null,
        description:    req.body.description?.trim() || null,
        evalStartDate:  req.body.evalStartDate ? new Date(req.body.evalStartDate) : null,
        evalEndDate:    req.body.evalEndDate ? new Date(req.body.evalEndDate) : null,
        status:         req.body.status || 'Draft',
        recommendation: req.body.recommendation?.trim() || null,
        remarks:        req.body.remarks?.trim() || null,
        tenderId:       req.body.tenderId,
        projectId:      req.body.projectId || tender.projectId,
        createdById:    req.session.userId,
        updatedById:    req.session.userId,
      },
      include: { tender: { select: { id: true, tenderNumber: true } } },
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'TEC', recordId: tec.id, projectId: tec.projectId, details: `Created TEC ${tec.tecReference}`, ipAddress: req.ip } });
    res.status(201).json(tec);
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') return res.status(409).json({ errors: ['TEC Reference already exists.'] });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tecs/:id
router.get('/tecs/:id', async (req: any, res: any) => {
  try {
    const tec = await prisma.tec.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        tender: { select: { id: true, tenderNumber: true, tenderTitle: true, status: true, project: { select: { id: true, projectCode: true } } } },
        members: { orderBy: { createdAt: 'asc' } },
        createdBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
      },
    });
    if (!tec) return res.status(404).json({ error: 'TEC not found' });
    res.json(tec);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tecs/:id
router.put('/tecs/:id', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });

  const errors = validateTec(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const existing = await prisma.tec.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'TEC not found' });

    const tender = await prisma.tender.findFirst({ where: { id: req.body.tenderId, deletedAt: null } });
    if (!tender) return res.status(404).json({ errors: ['Tender not found or has been archived.'] });

    const dup = await prisma.tec.findFirst({ where: { tecReference: req.body.tecReference.trim(), id: { not: req.params.id } } });
    if (dup) return res.status(409).json({ errors: [`TEC Reference '${req.body.tecReference}' is used by another TEC.`] });

    const tec = await prisma.tec.update({
      where: { id: req.params.id },
      data: {
        tecReference:   req.body.tecReference.trim(),
        committeeName:  req.body.committeeName.trim(),
        formationDate:  req.body.formationDate ? new Date(req.body.formationDate) : null,
        orderNumber:    req.body.orderNumber?.trim() || null,
        description:    req.body.description?.trim() || null,
        evalStartDate:  req.body.evalStartDate ? new Date(req.body.evalStartDate) : null,
        evalEndDate:    req.body.evalEndDate ? new Date(req.body.evalEndDate) : null,
        status:         req.body.status || existing.status,
        recommendation: req.body.recommendation?.trim() || null,
        remarks:        req.body.remarks?.trim() || null,
        tenderId:       req.body.tenderId,
        projectId:      req.body.projectId || existing.projectId || tender.projectId,
        updatedById:    req.session.userId,
      },
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'UPDATE', module: 'TEC', recordId: tec.id, projectId: tec.projectId, details: `Updated TEC ${tec.tecReference}`, ipAddress: req.ip } });
    res.json(tec);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tecs/:id/members
router.post('/tecs/:id/members', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  if (!req.body.name?.trim()) return res.status(400).json({ errors: ['Member Name is required.'] });

  try {
    const tec = await prisma.tec.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!tec) return res.status(404).json({ error: 'TEC not found' });

    const member = await prisma.tecMember.create({
      data: {
        name:        req.body.name.trim(),
        designation: req.body.designation?.trim() || null,
        department:  req.body.department?.trim() || null,
        role:        req.body.role?.trim() || null,
        remarks:     req.body.remarks?.trim() || null,
        tecId:       req.params.id,
      },
    });
    
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'TEC_MEMBER', recordId: member.id, details: `Added member to TEC ${tec.tecReference}`, ipAddress: req.ip } });
    res.status(201).json(member);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tecs/:id/members/:memberId
router.delete('/tecs/:id/members/:memberId', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    await prisma.tecMember.delete({ where: { id: req.params.memberId } });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'DELETE', module: 'TEC_MEMBER', recordId: req.params.memberId, details: `Removed member from TEC`, ipAddress: req.ip } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/contracts
router.get('/contracts', async (req: any, res: any) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip   = (page - 1) * limit;
    const q      = (req.query.q as string || '').trim();
    const status = req.query.status as string || '';
    const projectId = req.query.projectId as string || '';

    const where: any = { deletedAt: null };
    if (status)    where.status = status;
    if (projectId) where.projectId = projectId;
    if (q) {
      where.OR = [
        { contractNumber: { contains: q } },
        { contractorName: { contains: q } },
        { contractTitle:  { contains: q } },
        { tender: { tenderNumber: { contains: q } } },
        { tender: { project: { projectCode: { contains: q } } } },
      ];
    }

    const [total, contracts] = await Promise.all([
      prisma.contract.count({ where }),
      prisma.contract.findMany({
        where,
        include: { tender: { select: { id: true, tenderNumber: true, project: { select: { projectCode: true } } } }, createdBy: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    res.json({ data: contracts, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/contracts
router.post('/contracts', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });

  const errors = validateContract(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const tender = await prisma.tender.findFirst({ where: { id: req.body.tenderId, deletedAt: null } });
    if (!tender) return res.status(404).json({ errors: ['Tender not found or has been archived.'] });

    const existing = await prisma.contract.findUnique({ where: { contractNumber: req.body.contractNumber.trim() } });
    if (existing) return res.status(409).json({ errors: [`Contract Number '${req.body.contractNumber}' already exists.`] });

    const contract = await prisma.contract.create({
      data: {
        contractNumber:      req.body.contractNumber.trim(),
        contractTitle:       req.body.contractTitle?.trim() || '',
        contractType:        req.body.contractType?.trim() || null,
        contractorName:      req.body.contractorName.trim(),
        contractorIdNumber:  req.body.contractorIdNumber?.trim() || null,
        contractorAddress:   req.body.contractorAddress?.trim() || null,
        contractAmount:      req.body.contractAmount ? parseFloat(req.body.contractAmount) : null,
        performanceSecurity: req.body.performanceSecurity ? parseFloat(req.body.performanceSecurity) : null,
        paymentTerms:        req.body.paymentTerms?.trim() || null,
        fundingSource:       req.body.fundingSource?.trim() || null,
        awardDate:           req.body.awardDate ? new Date(req.body.awardDate) : null,
        agreementDate:       req.body.agreementDate ? new Date(req.body.agreementDate) : null,
        startDate:           req.body.startDate ? new Date(req.body.startDate) : null,
        endDate:             req.body.endDate ? new Date(req.body.endDate) : null,
        contractDuration:    req.body.contractDuration?.trim() || null,
        status:              req.body.status || 'Draft',
        tenderId:            req.body.tenderId,
        projectId:           req.body.projectId || tender.projectId,
        createdById:         req.session.userId,
        updatedById:         req.session.userId,
      },
      include: { tender: { select: { id: true, tenderNumber: true } } },
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'CONTRACTS', recordId: contract.id, projectId: contract.projectId, details: `Created contract ${contract.contractNumber}`, ipAddress: req.ip } });
    res.status(201).json(contract);
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2002') return res.status(409).json({ errors: ['Contract Number already exists.'] });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/contracts/:id
router.get('/contracts/:id', async (req: any, res: any) => {
  try {
    const contract = await prisma.contract.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        tender: { select: { id: true, tenderNumber: true, tenderTitle: true, status: true, project: { select: { id: true, projectCode: true, projectName: true } } } },
        createdBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
      },
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    res.json(contract);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/contracts/:id
router.put('/contracts/:id', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });

  const errors = validateContract(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const existing = await prisma.contract.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Contract not found' });

    const tender = await prisma.tender.findFirst({ where: { id: req.body.tenderId, deletedAt: null } });
    if (!tender) return res.status(404).json({ errors: ['Tender not found or has been archived.'] });

    const dup = await prisma.contract.findFirst({ where: { contractNumber: req.body.contractNumber.trim(), id: { not: req.params.id } } });
    if (dup) return res.status(409).json({ errors: [`Contract Number '${req.body.contractNumber}' is used by another contract.`] });

    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: {
        contractNumber:      req.body.contractNumber.trim(),
        contractTitle:       req.body.contractTitle?.trim() || '',
        contractType:        req.body.contractType?.trim() || null,
        contractorName:      req.body.contractorName.trim(),
        contractorIdNumber:  req.body.contractorIdNumber?.trim() || null,
        contractorAddress:   req.body.contractorAddress?.trim() || null,
        contractAmount:      req.body.contractAmount ? parseFloat(req.body.contractAmount) : null,
        performanceSecurity: req.body.performanceSecurity ? parseFloat(req.body.performanceSecurity) : null,
        paymentTerms:        req.body.paymentTerms?.trim() || null,
        fundingSource:       req.body.fundingSource?.trim() || null,
        awardDate:           req.body.awardDate ? new Date(req.body.awardDate) : null,
        agreementDate:       req.body.agreementDate ? new Date(req.body.agreementDate) : null,
        startDate:           req.body.startDate ? new Date(req.body.startDate) : null,
        endDate:             req.body.endDate ? new Date(req.body.endDate) : null,
        contractDuration:    req.body.contractDuration?.trim() || null,
        status:              req.body.status || existing.status,
        tenderId:            req.body.tenderId,
        projectId:           req.body.projectId || existing.projectId || tender.projectId,
        updatedById:         req.session.userId,
      },
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'UPDATE', module: 'CONTRACTS', recordId: contract.id, projectId: contract.projectId, details: `Updated contract ${contract.contractNumber}`, ipAddress: req.ip } });
    res.json(contract);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS (Phase 4)
// ═══════════════════════════════════════════════════════════════════════════════

const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET /api/documents
router.get('/documents', async (req: any, res: any) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip   = (page - 1) * limit;
    const q      = (req.query.q as string || '').trim();
    const projectId = req.query.projectId as string || '';
    const tenderId  = req.query.tenderId as string || '';
    const tecId     = req.query.tecId as string || '';
    const contractId = req.query.contractId as string || '';

    const where: any = { deletedAt: null };
    if (projectId) where.projectId = projectId;
    if (tenderId)  where.tenderId = tenderId;
    if (tecId)     where.tecId = tecId;
    if (contractId) where.contractId = contractId;
    if (req.query.monitoringId) where.monitoringId = req.query.monitoringId;
    
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { fileName: { contains: q } },
        { category: { contains: q } },
        { documentType: { contains: q } },
      ];
    }

    const [total, docs] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        include: { createdBy: { select: { username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    res.json({ data: docs, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/documents (Upload new document)
router.post('/documents', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });

  const { title, fileName, fileData, mimeType, fileExtension, category, documentType, description, projectId, tenderId, tecId, contractId, monitoringId } = req.body;
  if (!title || !fileName || !fileData) return res.status(400).json({ errors: ['Title, File Name, and File Data are required.'] });

  try {
    const sizeBytes = Math.round((fileData.length * 3) / 4);
    if (sizeBytes > 20 * 1024 * 1024) return res.status(400).json({ errors: ['File size exceeds 20MB limit.'] });

    const ext = fileExtension?.toLowerCase() || '';
    const blockedExts = ['exe','bat','cmd','sh','js','dll','scr'];
    if (blockedExts.includes(ext.replace('.',''))) {
      return res.status(400).json({ errors: ['File type not allowed for security reasons.'] });
    }

    const storageKey = `${Date.now()}_${Math.random().toString(36).substring(7)}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const filePath = path.join(UPLOAD_DIR, storageKey);
    const buffer = Buffer.from(fileData, 'base64');
    fs.writeFileSync(filePath, buffer);

    const doc = await prisma.document.create({
      data: {
        title, fileName, fileExtension, mimeType, fileSize: sizeBytes, storageKey, category, documentType, description,
        projectId: projectId || null, tenderId: tenderId || null, tecId: tecId || null, contractId: contractId || null, monitoringId: monitoringId || null,
        createdById: req.session.userId, updatedById: req.session.userId,
        versions: {
          create: {
            versionNumber: 1, fileName, fileSize: sizeBytes, mimeType, storageKey, createdById: req.session.userId
          }
        }
      }
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'DOCUMENTS', recordId: doc.id, details: `Uploaded document ${doc.fileName}`, ipAddress: req.ip } });
    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/documents/:id/versions (Upload new version)
router.post('/documents/:id/versions', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  const { fileData, fileName, mimeType, fileExtension, notes } = req.body;
  if (!fileData || !fileName) return res.status(400).json({ errors: ['File Name and File Data are required.'] });

  try {
    const doc = await prisma.document.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const ext = fileExtension?.toLowerCase() || '';
    const blockedExts = ['exe','bat','cmd','sh','js','dll','scr'];
    if (blockedExts.includes(ext.replace('.',''))) return res.status(400).json({ errors: ['File type not allowed.'] });

    const sizeBytes = Math.round((fileData.length * 3) / 4);
    const storageKey = `${Date.now()}_${Math.random().toString(36).substring(7)}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const filePath = path.join(UPLOAD_DIR, storageKey);
    fs.writeFileSync(filePath, Buffer.from(fileData, 'base64'));

    const newVersionNum = doc.versionNumber + 1;

    const [updatedDoc] = await prisma.$transaction([
      prisma.document.update({
        where: { id: doc.id },
        data: {
          fileName, fileExtension, mimeType, fileSize: sizeBytes, storageKey, versionNumber: newVersionNum, updatedById: req.session.userId,
          versions: {
            create: { versionNumber: newVersionNum, fileName, fileSize: sizeBytes, mimeType, storageKey, notes, createdById: req.session.userId }
          }
        }
      }),
      prisma.auditLog.create({ data: { userId: req.session.userId, action: 'UPDATE', module: 'DOCUMENTS', recordId: doc.id, details: `Uploaded version ${newVersionNum} for document ${doc.id}`, ipAddress: req.ip } })
    ]);

    res.json(updatedDoc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/documents/:id/download
router.get('/documents/:id/download', async (req: any, res: any) => {
  try {
    const doc = await prisma.document.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!doc || !doc.storageKey) return res.status(404).json({ error: 'Document not found' });

    // Enforce path traversal protection explicitly
    const filePath = path.resolve(path.join(UPLOAD_DIR, doc.storageKey));
    if (!filePath.startsWith(path.resolve(UPLOAD_DIR))) {
      return res.status(403).json({ error: 'Invalid file path' });
    }

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server' });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'READ', module: 'DOCUMENTS', recordId: doc.id, details: `Downloaded document ${doc.id}`, ipAddress: req.ip } });

    res.download(filePath, doc.fileName);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/documents/:id
router.get('/documents/:id', async (req: any, res: any) => {
  try {
    const doc = await prisma.document.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        versions: { orderBy: { versionNumber: 'desc' }, include: { createdBy: { select: { username: true } } } },
        createdBy: { select: { username: true } },
        updatedBy: { select: { username: true } }
      }
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/documents/:id/metadata
router.put('/documents/:id/metadata', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const existing = await prisma.document.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Document not found' });

    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title || existing.title,
        category: req.body.category || existing.category,
        documentType: req.body.documentType || existing.documentType,
        description: req.body.description || existing.description,
        status: req.body.status || existing.status,
        updatedById: req.session.userId
      }
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'UPDATE', module: 'DOCUMENTS', recordId: doc.id, details: `Updated metadata for document ${doc.id}`, ipAddress: req.ip } });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/documents/:id (Soft delete/archive)
router.delete('/documents/:id', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const existing = await prisma.document.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Document not found' });

    await prisma.document.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedById: req.session.userId } });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'ARCHIVE', module: 'DOCUMENTS', recordId: req.params.id, details: `Archived document ${req.params.id}`, ipAddress: req.ip } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 5: VIDEO LINKS & MONITORING
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/monitoring
router.get('/monitoring', async (req: any, res: any) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip   = (page - 1) * limit;
    const q      = (req.query.q as string || '').trim();
    const projectId = req.query.projectId as string || '';
    const contractId = req.query.contractId as string || '';
    const status = req.query.status as string || '';

    const where: any = { deletedAt: null };
    if (projectId) where.projectId = projectId;
    if (contractId) where.contractId = contractId;
    if (status) where.status = status;
    
    if (q) {
      where.OR = [
        { referenceNumber: { contains: q } },
        { officer: { contains: q } },
        { location: { contains: q } },
        { monitoringType: { contains: q } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.monitoring.count({ where }),
      prisma.monitoring.findMany({
        where,
        include: { project: { select: { projectCode: true, projectName: true } }, contract: { select: { contractNumber: true } } },
        orderBy: { monitoringDate: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    res.json({ data: records, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/monitoring/:id
router.get('/monitoring/:id', async (req: any, res: any) => {
  try {
    const record = await prisma.monitoring.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        project: { select: { id: true, projectCode: true, projectName: true } },
        tender: { select: { id: true, tenderNumber: true, tenderTitle: true } },
        contract: { select: { id: true, contractNumber: true, contractTitle: true } },
        videoLinks: { orderBy: { createdAt: 'desc' } },
        observations: { orderBy: { createdAt: 'desc' } },
        issues: { orderBy: { createdAt: 'desc' } },
        recommendations: { orderBy: { createdAt: 'desc' } },
        actions: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/monitoring
router.post('/monitoring', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { referenceNumber, projectId, tenderId, contractId, monitoringType, monitoringDate, startTime, endTime, officer, team, location, purpose, description, status } = req.body;
    
    if (!referenceNumber || !projectId || !monitoringType || !monitoringDate) {
      return res.status(400).json({ errors: ['Reference Number, Project, Type, and Date are required.'] });
    }
    
    const existing = await prisma.monitoring.findUnique({ where: { referenceNumber } });
    if (existing) return res.status(400).json({ errors: ['Reference Number already exists.'] });

    const record = await prisma.monitoring.create({
      data: {
        referenceNumber, projectId, tenderId: tenderId || null, contractId: contractId || null,
        monitoringType, monitoringDate: new Date(monitoringDate), startTime, endTime, officer, team, location, purpose, description, status,
        createdById: req.session.userId, updatedById: req.session.userId
      }
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'MONITORING', recordId: record.id, details: `Created monitoring ${referenceNumber}`, ipAddress: req.ip } });
    res.status(201).json(record);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/monitoring/:id
router.put('/monitoring/:id', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { monitoringType, monitoringDate, startTime, endTime, officer, team, location, purpose, description, status, overallObservation, overallStatus, recommendationsSum, remarks } = req.body;
    
    const record = await prisma.monitoring.update({
      where: { id: req.params.id },
      data: {
        monitoringType, monitoringDate: monitoringDate ? new Date(monitoringDate) : undefined, startTime, endTime, officer, team, location, purpose, description, status, overallObservation, overallStatus, recommendationsSum, remarks,
        updatedById: req.session.userId
      }
    });

    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'UPDATE', module: 'MONITORING', recordId: record.id, details: `Updated monitoring ${record.id}`, ipAddress: req.ip } });
    res.json(record);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/monitoring/:id/videos
router.post('/monitoring/:id/videos', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { title, platform, url, sessionDate, startTime, endTime, description } = req.body;
    if (!title || !url) return res.status(400).json({ errors: ['Title and URL are required.'] });
    
    let parsedUrl;
    try { parsedUrl = new URL(url); } catch (_) { return res.status(400).json({ errors: ['Invalid URL format.'] }); }
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') return res.status(400).json({ errors: ['Only HTTP/HTTPS URLs are allowed.'] });

    const link = await prisma.videoLink.create({
      data: {
        monitoringId: req.params.id, title, platform, url, sessionDate: sessionDate ? new Date(sessionDate) : null, startTime, endTime, description,
        createdById: req.session.userId
      }
    });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'MONITORING', recordId: req.params.id, details: `Added video link`, ipAddress: req.ip } });
    res.status(201).json(link);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/monitoring/:id/videos/:videoId
router.delete('/monitoring/:id/videos/:videoId', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    await prisma.videoLink.delete({ where: { id: req.params.videoId } });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'DELETE', module: 'MONITORING', recordId: req.params.id, details: `Deleted video link`, ipAddress: req.ip } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/monitoring/:id/observations
router.post('/monitoring/:id/observations', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { category, description, severity, observationDate, recordedBy, remarks } = req.body;
    if (!description) return res.status(400).json({ errors: ['Description is required.'] });

    const obs = await prisma.observation.create({
      data: { monitoringId: req.params.id, category, description, severity, observationDate: observationDate ? new Date(observationDate) : null, recordedBy, remarks }
    });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'MONITORING', recordId: req.params.id, details: `Added observation`, ipAddress: req.ip } });
    res.status(201).json(obs);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/monitoring/:id/issues
router.post('/monitoring/:id/issues', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { issueNumber, description, category, severity, dateIdentified, responsiblePerson, targetDate, status, resolutionDate, resolutionRemarks } = req.body;
    if (!issueNumber || !description) return res.status(400).json({ errors: ['Issue Number and Description are required.'] });

    const issue = await prisma.issue.create({
      data: {
        monitoringId: req.params.id, issueNumber, description, category, severity, dateIdentified: dateIdentified ? new Date(dateIdentified) : null,
        responsiblePerson, targetDate: targetDate ? new Date(targetDate) : null, status: status || 'Open',
        resolutionDate: resolutionDate ? new Date(resolutionDate) : null, resolutionRemarks
      }
    });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'MONITORING', recordId: req.params.id, details: `Added issue`, ipAddress: req.ip } });
    res.status(201).json(issue);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/monitoring/:id/issues/:issueId
router.put('/monitoring/:id/issues/:issueId', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { status, resolutionDate, resolutionRemarks } = req.body;
    const issue = await prisma.issue.update({
      where: { id: req.params.issueId },
      data: { status, resolutionDate: resolutionDate ? new Date(resolutionDate) : null, resolutionRemarks }
    });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'UPDATE', module: 'MONITORING', recordId: req.params.id, details: `Updated issue ${issue.issueNumber}`, ipAddress: req.ip } });
    res.json(issue);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/monitoring/:id/recommendations
router.post('/monitoring/:id/recommendations', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { recommendationText, priority, responsiblePerson, targetDate, remarks } = req.body;
    if (!recommendationText) return res.status(400).json({ errors: ['Recommendation text is required.'] });

    const rec = await prisma.recommendation.create({
      data: { monitoringId: req.params.id, recommendationText, priority, responsiblePerson, targetDate: targetDate ? new Date(targetDate) : null, remarks }
    });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'MONITORING', recordId: req.params.id, details: `Added recommendation`, ipAddress: req.ip } });
    res.status(201).json(rec);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/monitoring/:id/actions
router.post('/monitoring/:id/actions', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { actionNumber, description, assignedTo, assignedDepartment, dueDate, priority } = req.body;
    if (!actionNumber || !description) return res.status(400).json({ errors: ['Action Number and Description are required.'] });

    const action = await prisma.followUpAction.create({
      data: { monitoringId: req.params.id, actionNumber, description, assignedTo, assignedDepartment, dueDate: dueDate ? new Date(dueDate) : null, priority }
    });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'CREATE', module: 'MONITORING', recordId: req.params.id, details: `Added action ${actionNumber}`, ipAddress: req.ip } });
    res.status(201).json(action);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/monitoring/:id/actions/:actionId
router.put('/monitoring/:id/actions/:actionId', async (req: any, res: any) => {
  if (!canEdit(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  try {
    const { status, completionDate, completionRemarks } = req.body;
    if (status === 'Completed' && !completionDate) return res.status(400).json({ errors: ['Completion date is required when status is Completed.'] });

    const action = await prisma.followUpAction.update({
      where: { id: req.params.actionId },
      data: { status, completionDate: completionDate ? new Date(completionDate) : null, completionRemarks }
    });
    await prisma.auditLog.create({ data: { userId: req.session.userId, action: 'UPDATE', module: 'MONITORING', recordId: req.params.id, details: `Updated action ${action.actionNumber}`, ipAddress: req.ip } });
    res.json(action);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 6: DASHBOARD & KPIs
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/dashboard
router.get('/dashboard', async (req: any, res: any) => {
  try {
    const projectId = String(req.query.projectId || '').trim();

    console.log('[DASHBOARD] Request received', {
      projectId: projectId || '(all projects)',
      userId: req.session?.userId,
      role: req.session?.role,
    });

    // Validate the selected project before running dashboard queries.
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, deletedAt: null },
        select: {
          id: true,
          projectCode: true,
          projectName: true,
          status: true,
        },
      });

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          projectId,
        });
      }
    }

    // Project-level filters.
    const projectWhere: any = { deletedAt: null };
    const baseWhere: any = { deletedAt: null };

    if (projectId) {
      projectWhere.id = projectId;
      baseWhere.projectId = projectId;
    }

    // Monitoring child records are filtered through their monitoring relation.
    const issueWhere: any = { status: 'Open' };
    const actionWhere: any = { status: 'Pending' };

    if (projectId) {
      issueWhere.monitoring = { projectId };
      actionWhere.monitoring = { projectId };
    }

    // Run each query separately so Render logs identify the exact failing query.
    const dashboardQuery = async (name: string, query: () => Promise<any>) => {
      try {
        const result = await query();
        console.log(`[DASHBOARD OK] ${name}`);
        return result;
      } catch (error: any) {
        console.error(`[DASHBOARD FAILED] ${name}`);
        console.error('Message:', error?.message);
        console.error('Code:', error?.code);
        console.error('Meta:', error?.meta);
        throw error;
      }
    };

    // KPI counts.
    const [
      totalProjects,
      activeProjects,
      totalTenders,
      activeTenders,
      totalTecs,
      totalContracts,
      totalDocuments,
      totalMonitoring,
      openIssues,
      pendingActions,
    ] = await Promise.all([
      dashboardQuery('totalProjects', () =>
        prisma.project.count({ where: projectWhere })
      ),

      dashboardQuery('activeProjects', () =>
        prisma.project.count({
          where: { ...projectWhere, status: 'In Progress' },
        })
      ),

      dashboardQuery('totalTenders', () =>
        prisma.tender.count({ where: baseWhere })
      ),

      dashboardQuery('activeTenders', () =>
        prisma.tender.count({
          where: { ...baseWhere, status: 'Published' },
        })
      ),

      dashboardQuery('totalTecs', () =>
        prisma.tec.count({ where: baseWhere })
      ),

      dashboardQuery('totalContracts', () =>
        prisma.contract.count({ where: baseWhere })
      ),

      dashboardQuery('totalDocuments', () =>
        prisma.document.count({ where: baseWhere })
      ),

      dashboardQuery('totalMonitoring', () =>
        prisma.monitoring.count({ where: baseWhere })
      ),

      dashboardQuery('openIssues', () =>
        prisma.issue.count({ where: issueWhere })
      ),

      dashboardQuery('pendingActions', () =>
        prisma.followUpAction.count({ where: actionWhere })
      ),
    ]);

    // Upcoming scheduled monitoring.
    const upcomingMonitoring = await dashboardQuery(
      'upcomingMonitoring',
      () =>
        prisma.monitoring.findMany({
          where: {
            ...baseWhere,
            status: 'Scheduled',
            monitoringDate: { gte: new Date() },
          },
          orderBy: { monitoringDate: 'asc' },
          take: 5,
          include: {
            project: {
              select: {
                id: true,
                projectCode: true,
                projectName: true,
              },
            },
          },
        })
    );

    // Recent audit activity.
    const auditWhere: any = projectId ? { projectId } : {};

    const recentActivity = await dashboardQuery(
      'recentActivity',
      () =>
        prisma.auditLog.findMany({
          where: auditWhere,
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: { username: true },
            },
          },
        })
    );

    // Overdue open issues, restricted to the selected project when applicable.
    const overdueIssueWhere: any = {
      status: 'Open',
      targetDate: { lt: new Date() },
    };

    if (projectId) {
      overdueIssueWhere.monitoring = { projectId };
    }

    const overdueIssues = await dashboardQuery(
      'overdueIssues',
      () =>
        prisma.issue.findMany({
          where: overdueIssueWhere,
          orderBy: { targetDate: 'asc' },
          take: 5,
          include: {
            monitoring: {
              select: {
                id: true,
                referenceNumber: true,
                project: {
                  select: {
                    id: true,
                    projectCode: true,
                    projectName: true,
                  },
                },
              },
            },
          },
        })
    );

    return res.json({
      kpis: {
        projects: {
          total: totalProjects,
          active: activeProjects,
        },
        tenders: {
          total: totalTenders,
          active: activeTenders,
        },
        tecs: {
          total: totalTecs,
        },
        contracts: {
          total: totalContracts,
        },
        documents: {
          total: totalDocuments,
        },
        monitoring: {
          total: totalMonitoring,
          openIssues,
          pendingActions,
        },
      },
      upcomingMonitoring,
      recentActivity,
      overdueIssues,
    });
  } catch (error: any) {
    console.error('════════════════════════════════════════════════════════════');
    console.error('[DASHBOARD FATAL ERROR]');
    console.error('Message:', error?.message);
    console.error('Code:', error?.code);
    console.error('Meta:', error?.meta);
    console.error('Stack:', error?.stack);
    console.error('════════════════════════════════════════════════════════════');

    return res.status(500).json({
      error: 'Server error',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Dashboard could not be loaded. Check server logs.'
          : error?.message || 'Unknown error',
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 7: REPORTS & EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/reports/:type', async (req: any, res: any) => {
  try {
    const type = req.params.type;
    const { dateFrom, dateTo, status, financialYear } = req.query;
    
    // Base date filtering logic
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom as string);
    if (dateTo) dateFilter.lte = new Date(dateTo as string);

    let data: any[] = [];

    switch (type) {
      case 'projects': {
        const where: any = { deletedAt: null };
        if (status) where.status = status;
        if (financialYear) where.financialYearId = financialYear;
        if (dateFrom || dateTo) where.startDate = dateFilter;
        
        data = await prisma.project.findMany({
          where,
          include: {
            financialYear: true,
            tenders: { select: { id: true, tenderNumber: true } },
            contracts: { select: { id: true, contractNumber: true } },
            monitoring: { select: { id: true, referenceNumber: true } },
            documents: { select: { id: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
      }
      case 'tenders': {
        const where: any = { deletedAt: null };
        if (status) where.status = status;
        if (dateFrom || dateTo) where.publicationDate = dateFilter;
        
        data = await prisma.tender.findMany({
          where,
          include: {
            project: { select: { projectCode: true, projectName: true } },
            tecs: { select: { id: true, status: true, recommendation: true } },
            contracts: { select: { id: true, contractNumber: true, status: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
      }
      case 'tec': {
        const where: any = { deletedAt: null };
        if (status) where.status = status;
        if (dateFrom || dateTo) where.formationDate = dateFilter;

        data = await prisma.tec.findMany({
          where,
          include: {
            tender: { select: { tenderNumber: true, tenderTitle: true } },
            members: { select: { name: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
      }
      case 'contracts': {
        const where: any = { deletedAt: null };
        if (status) where.status = status;
        if (dateFrom || dateTo) where.awardDate = dateFilter;

        data = await prisma.contract.findMany({
          where,
          include: {
            tender: { select: { tenderNumber: true, project: { select: { projectCode: true } } } }
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
      }
      case 'documents': {
        const where: any = { deletedAt: null };
        if (status) where.status = status;
        if (dateFrom || dateTo) where.createdAt = dateFilter;

        data = await prisma.document.findMany({
          where,
          include: {
            project: { select: { projectCode: true } },
            tender: { select: { tenderNumber: true } },
            contract: { select: { contractNumber: true } },
            createdBy: { select: { username: true } }
          },
          orderBy: { createdAt: 'desc' }
        });
        break;
      }
      case 'monitoring': {
        const where: any = { deletedAt: null };
        if (status) where.status = status;
        if (dateFrom || dateTo) where.monitoringDate = dateFilter;

        data = await prisma.monitoring.findMany({
          where,
          include: {
            project: { select: { projectCode: true } },
            contract: { select: { contractNumber: true } },
            observations: { select: { id: true } },
            issues: { select: { id: true } },
            actions: { select: { id: true } }
          },
          orderBy: { monitoringDate: 'desc' }
        });
        break;
      }
      case 'issues': {
        const where: any = {};
        if (status) where.status = status;
        if (dateFrom || dateTo) where.dateIdentified = dateFilter;

        data = await prisma.issue.findMany({
          where,
          include: {
            monitoring: {
              select: {
                referenceNumber: true,
                project: { select: { projectCode: true } }
              }
            }
          },
          orderBy: { dateIdentified: 'desc' }
        });
        break;
      }
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    res.json({ data, total: data.length });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 8: SECURITY & AUDIT
// ═══════════════════════════════════════════════════════════════════════════════

router.get('/audit', async (req: any, res: any) => {
  // Only highly privileged roles can view audit logs
  if (!['Administrator', 'SuperAdmin'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const { dateFrom, dateTo, action, module, userId } = req.query;
    
    const where: any = {};
    if (action) where.action = action;
    if (module) where.module = module;
    if (userId) where.userId = userId;
    
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom as string);
      if (dateTo) where.timestamp.lte = new Date(dateTo as string);
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })
    ]);

    res.json({ data: logs, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
