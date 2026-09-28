/**
 * MULTIMEDIA PROJECTS PORTAL — PHASE 2: Projects & Tenders
 * Frontend module — integrates with the existing App routing system.
 */

const Phase2 = {

  // ── Shared state ──────────────────────────────────────────────────────────
  projectsState: { page: 1, q: '', status: '', department: '', financialYear: '' },
  tendersState:  { page: 1, q: '', status: '', projectId: '' },
  financialYears: [],

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITY
  // ─────────────────────────────────────────────────────────────────────────

  fmt(val) {
    if (val === null || val === undefined || val === '') return '—';
    return val;
  },

  fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  fmtCurrency(v) {
    if (v === null || v === undefined) return '—';
    return '₹ ' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  },

  statusBadge(s, type) {
    const colorMap = {
      Draft: 'badge-secondary', Proposed: 'badge-info', Approved: 'badge-success',
      'In Progress': 'badge-info', 'On Hold': 'badge-warning', Completed: 'badge-success',
      Cancelled: 'badge-danger', Closed: 'badge-secondary',
      Published: 'badge-info', Open: 'badge-info', Evaluation: 'badge-warning',
      Awarded: 'badge-success',
    };
    const cls = colorMap[s] || 'badge-outline';
    return `<span class="badge ${cls}">${s || '—'}</span>`;
  },

  showToast(msg, type = 'success') {
    if (window.App && App.showToast) { App.showToast(msg); return; }
    const tc = document.getElementById('toast-container');
    if (!tc) return;
    const t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.textContent = msg;
    tc.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  },

        async apiFetch(url, opts = {}) {
    if (typeof App !== 'undefined' && App.activeProjectId) {
      if (!url.includes('projectId=')) {
        url += (url.includes('?') ? '&' : '?') + 'projectId=' + App.activeProjectId;
      }
      if (opts.body && typeof opts.body === 'string') {
        try {
          const b = JSON.parse(opts.body);
          if (!b.projectId) { b.projectId = App.activeProjectId; opts.body = JSON.stringify(b); }
        } catch(e) {}
      }
    }
    const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    if (r.status === 401) {
      window.location.href = '/login.html';
      return r;
    }
    return r;
  },

  async loadFinancialYears() {
    if (this.financialYears.length) return;
    try {
      const r = await this.apiFetch('/api/financial-years');
      if (r.ok) this.financialYears = await r.json();
    } catch (_) {}
  },

  fyOptions(selectedId = '') {
    return this.financialYears.map(fy =>
      `<option value="${fy.id}" ${fy.id === selectedId ? 'selected' : ''}>${fy.year}</option>`
    ).join('');
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROJECTS LIST
  // ─────────────────────────────────────────────────────────────────────────

  async renderProjectsList(container) {
    await this.loadFinancialYears();
    const s = this.projectsState;
    let data = { data: [], total: 0, pages: 1 };

    try {
      const params = new URLSearchParams({ page: s.page, limit: 20, q: s.q, status: s.status, department: s.department, financialYear: s.financialYear });
      const r = await this.apiFetch(`/api/projects?${params}`);
      if (r.ok) data = await r.json();
    } catch (_) {}

    const rows = data.data.length ? data.data.map(p => `
      <tr>
        <td><code>${p.projectCode}</code></td>
        <td><strong>${p.projectName}</strong></td>
        <td>${this.fmt(p.department)}</td>
        <td>${[p.district, p.state].filter(Boolean).join(', ') || '—'}</td>
        <td>${this.fmtCurrency(p.estimatedCost)}</td>
        <td>${p.financialYear?.year || '—'}</td>
        <td>${this.statusBadge(p.status)}</td>
        <td>${this.fmtDate(p.createdAt)}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="Phase2.renderProjectDetail('${p.id}')">👁 View</button>
          <button class="btn btn-secondary btn-sm" onclick="Phase2.renderProjectForm('${p.id}')" style="margin-left:4px;">✏️ Edit</button>
        </td>
      </tr>`).join('') : `<tr><td colspan="9" style="text-align:center;padding:40px;color:#64748b;">No projects found. Try changing your filters or <a href="#" onclick="Phase2.renderProjectForm()">create a new project</a>.</td></tr>`;

    const paginationBtns = Array.from({ length: data.pages }, (_, i) => i + 1).map(pg =>
      `<button class="btn btn-sm ${pg === s.page ? 'btn-primary' : 'btn-secondary'}" onclick="Phase2.projectsState.page=${pg};Phase2.renderProjectsList(document.getElementById('main-content'))">${pg}</button>`
    ).join(' ');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>📂 Projects</h2><p>Manage all projects. ${data.total} record(s) found.</p></div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="Phase2.renderProjectForm()">+ New Project</button>
        </div>
      </div>

      <div class="table-card" style="margin-bottom:16px;">
        <div style="padding:14px 16px;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
          <div>
            <label class="form-label" style="font-size:11px;margin-bottom:4px;">Search</label>
            <input id="p2-p-search" type="text" class="form-control" placeholder="Code, Name, Dept…" style="width:200px;" value="${s.q}"
              onkeydown="if(event.key==='Enter'){Phase2.projectsState.q=this.value;Phase2.projectsState.page=1;Phase2.renderProjectsList(document.getElementById('main-content'))}">
          </div>
          <div>
            <label class="form-label" style="font-size:11px;margin-bottom:4px;">Status</label>
            <select id="p2-p-status" class="form-control" style="width:140px;" onchange="Phase2.projectsState.status=this.value;Phase2.projectsState.page=1;Phase2.renderProjectsList(document.getElementById('main-content'))">
              <option value="">All Statuses</option>
              ${['Draft','Proposed','Approved','In Progress','On Hold','Completed','Cancelled','Closed'].map(st=>`<option value="${st}" ${st===s.status?'selected':''}>${st}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label" style="font-size:11px;margin-bottom:4px;">Financial Year</label>
            <select id="p2-p-fy" class="form-control" style="width:130px;" onchange="Phase2.projectsState.financialYear=this.value;Phase2.projectsState.page=1;Phase2.renderProjectsList(document.getElementById('main-content'))">
              <option value="">All Years</option>
              ${this.financialYears.map(fy=>`<option value="${fy.year}" ${fy.year===s.financialYear?'selected':''}>${fy.year}</option>`).join('')}
            </select>
          </div>
          <div style="margin-top:auto;">
            <button class="btn btn-secondary btn-sm" onclick="Phase2.projectsState={page:1,q:'',status:'',department:'',financialYear:''};Phase2.renderProjectsList(document.getElementById('main-content'))">Clear Filters</button>
            <button class="btn btn-primary btn-sm" style="margin-left:6px;" onclick="Phase2.projectsState.q=document.getElementById('p2-p-search').value;Phase2.projectsState.page=1;Phase2.renderProjectsList(document.getElementById('main-content'))">Search</button>
          </div>
        </div>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr><th>Code</th><th>Project Name</th><th>Department</th><th>Location</th><th>Est. Cost</th><th>Fin. Year</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="padding:12px 16px;display:flex;gap:6px;align-items:center;justify-content:space-between;">
          <span style="font-size:12px;color:#64748b;">Page ${s.page} of ${data.pages} (${data.total} records)</span>
          <div style="display:flex;gap:4px;">${paginationBtns}</div>
        </div>
      </div>`;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROJECT DETAIL
  // ─────────────────────────────────────────────────────────────────────────

  async renderProjectDetail(id) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';
    try {
      const r = await this.apiFetch(`/api/projects/${id}`);
      if (!r.ok) { container.innerHTML = '<div style="padding:40px;color:red;">Project not found.</div>'; return; }
      const p = await r.json();

      const tenderRows = p.tenders?.length ? p.tenders.map(t => `
        <tr>
          <td><code>${t.tenderNumber}</code></td>
          <td>${t.tenderTitle}</td>
          <td>${this.fmt(t.tenderType)}</td>
          <td>${this.fmtCurrency(t.estimatedValue)}</td>
          <td>${this.fmtDate(t.submissionEndDate)}</td>
          <td>${this.statusBadge(t.status)}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="Phase2.renderTenderDetail('${t.id}')">👁 View</button>
            <button class="btn btn-secondary btn-sm" onclick="Phase2.renderTenderForm('${t.id}')" style="margin-left:4px;">✏️ Edit</button>
          </td>
        </tr>`).join('') : `<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b;">No tenders for this project. <a href="#" onclick="Phase2.renderTenderForm(null,'${p.id}')">Add Tender</a></td></tr>`;

      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-text">
            <h2>📂 ${p.projectCode} — ${p.projectName}</h2>
            <p>${this.statusBadge(p.status)} &nbsp; Financial Year: ${p.financialYear?.year || '—'}</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('projects')">← Projects</button>
            <button class="btn btn-primary btn-sm" onclick="Phase2.renderProjectForm('${p.id}')" style="margin-left:6px;">✏️ Edit Project</button>
            <button class="btn btn-primary btn-sm" onclick="Phase2.renderTenderForm(null,'${p.id}')" style="margin-left:6px;">+ Add Tender</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Project Information</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Code',p.projectCode],['Name',p.projectName],['Description',p.description],['Type',p.projectType],['Category',p.projectCategory],['Department',p.department],['Division',p.division],['Responsible Officer',p.responsibleOfficer]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
          </div>
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Financial & Timeline</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Est. Cost',this.fmtCurrency(p.estimatedCost)],['Sanctioned',this.fmtCurrency(p.sanctionedAmount)],['Budget Head',p.budgetHead],['Funding Source',p.fundingSource],['Financial Year',p.financialYear?.year],['Start Date',this.fmtDate(p.startDate)],['Exp. Completion',this.fmtDate(p.expectedCompletion)],['Actual Completion',this.fmtDate(p.actualCompletion)]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
          </div>
        </div>

        <div class="table-card" style="padding:20px;margin-bottom:16px;">
          <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Location</h4>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;font-size:13px;">
            ${[['State',p.state],['District',p.district],['Block',p.block],['Village / Site',p.siteLocation||p.village]].map(([k,v])=>`<div><div style="color:#64748b;font-size:11px;">${k}</div><div style="font-weight:500;">${this.fmt(v)}</div></div>`).join('')}
          </div>
        </div>

        <div class="table-card">
          <div class="table-toolbar"><div class="table-title"><h3>Associated Tenders</h3><p>${p.tenders?.length || 0} tender(s)</p></div></div>
          <table class="data-table">
            <thead><tr><th>Tender No.</th><th>Title</th><th>Type</th><th>Est. Value</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${tenderRows}</tbody>
          </table>
        </div>
        <div id="monitoring-container-project"></div>
        <div id="docs-container-project"></div>`;
      if (window.Phase5) Phase5.renderWidget('monitoring-container-project', 'project', p.id);
      if (window.Phase4) Phase4.renderWidget('docs-container-project', 'project', p.id);
    } catch (e) {
      container.innerHTML = '<div style="padding:40px;color:red;">Error loading project.</div>';
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROJECT FORM (Create / Edit)
  // ─────────────────────────────────────────────────────────────────────────

  async renderProjectForm(id = null) {
    await this.loadFinancialYears();
    const container = document.getElementById('main-content');
    let p = null;

    if (id) {
      container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';
      try {
        const r = await this.apiFetch(`/api/projects/${id}`);
        if (r.ok) p = await r.json();
      } catch (_) {}
    }

    const v = (field) => p?.[field] ?? '';
    const dateVal = (f) => p?.[f] ? p[f].substring(0, 10) : '';

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text">
          <h2>${id ? '✏️ Edit Project' : '+ Create Project'}</h2>
          <p>${id ? `Editing: ${p?.projectCode || ''}` : 'Fill in the details to create a new project.'}</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('projects')">← Back</button>
        </div>
      </div>

      <div class="table-card" style="padding:24px;">
        <div id="p2-proj-errors" style="display:none;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:12px 16px;margin-bottom:16px;color:#b91c1c;"></div>
        <form id="p2-project-form" onsubmit="Phase2.submitProjectForm(event,'${id || ''}')">

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;">
            <div class="form-group">
              <label class="form-label">Project Code <span style="color:red">*</span></label>
              <input type="text" id="pf-code" class="form-control" value="${v('projectCode')}" placeholder="e.g. PMSETU-2026-001" required>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="pf-status" class="form-control">
                ${['Draft','Proposed','Approved','In Progress','On Hold','Completed','Cancelled','Closed'].map(s=>`<option value="${s}" ${v('status')===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Financial Year</label>
              <select id="pf-fy" class="form-control">
                <option value="">— Select —</option>
                ${this.fyOptions(v('financialYearId'))}
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Project Name <span style="color:red">*</span></label>
            <input type="text" id="pf-name" class="form-control" value="${v('projectName')}" placeholder="Full project name" required>
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Description</label>
            <textarea id="pf-desc" class="form-control" rows="3" placeholder="Project scope and objectives…">${v('description')}</textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">Project Type</label>
              <input type="text" id="pf-type" class="form-control" value="${v('projectType')}" placeholder="e.g. Media Campaign">
            </div>
            <div class="form-group">
              <label class="form-label">Project Category</label>
              <input type="text" id="pf-cat" class="form-control" value="${v('projectCategory')}" placeholder="e.g. Awareness">
            </div>
          </div>

          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Administrative</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">Department</label>
              <input type="text" id="pf-dept" class="form-control" value="${v('department')}" placeholder="e.g. DGT / MSDE">
            </div>
            <div class="form-group">
              <label class="form-label">Division</label>
              <input type="text" id="pf-div" class="form-control" value="${v('division')}">
            </div>
            <div class="form-group">
              <label class="form-label">Responsible Officer</label>
              <input type="text" id="pf-officer" class="form-control" value="${v('responsibleOfficer')}">
            </div>
          </div>

          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Location</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">State</label><input type="text" id="pf-state" class="form-control" value="${v('state')}"></div>
            <div class="form-group"><label class="form-label">District</label><input type="text" id="pf-district" class="form-control" value="${v('district')}"></div>
            <div class="form-group"><label class="form-label">Block</label><input type="text" id="pf-block" class="form-control" value="${v('block')}"></div>
            <div class="form-group"><label class="form-label">Village / Site</label><input type="text" id="pf-site" class="form-control" value="${v('siteLocation')}"></div>
          </div>

          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Financial</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Estimated Cost (₹)</label><input type="number" id="pf-cost" class="form-control" value="${v('estimatedCost')}" min="0" step="0.01"></div>
            <div class="form-group"><label class="form-label">Sanctioned Amount (₹)</label><input type="number" id="pf-sanction" class="form-control" value="${v('sanctionedAmount')}" min="0" step="0.01"></div>
            <div class="form-group"><label class="form-label">Budget Head</label><input type="text" id="pf-bhead" class="form-control" value="${v('budgetHead')}"></div>
            <div class="form-group"><label class="form-label">Funding Source</label><input type="text" id="pf-fund" class="form-control" value="${v('fundingSource')}"></div>
          </div>

          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Timeline</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Start Date</label><input type="date" id="pf-start" class="form-control" value="${dateVal('startDate')}"></div>
            <div class="form-group"><label class="form-label">Expected Completion</label><input type="date" id="pf-exp" class="form-control" value="${dateVal('expectedCompletion')}"></div>
            <div class="form-group"><label class="form-label">Actual Completion</label><input type="date" id="pf-actual" class="form-control" value="${dateVal('actualCompletion')}"></div>
          </div>

          <div class="form-group" style="margin-bottom:24px;">
            <label class="form-label">Remarks</label>
            <textarea id="pf-remarks" class="form-control" rows="2">${v('remarks')}</textarea>
          </div>

          <div style="display:flex;gap:10px;">
            <button type="submit" class="btn btn-primary" id="pf-submit-btn">
              ${id ? 'Save Changes' : '+ Create Project'}
            </button>
            <button type="button" class="btn btn-secondary" onclick="App.navigate('projects')">Cancel</button>
          </div>
        </form>
      </div>`;
  },

  async submitProjectForm(e, id) {
    e.preventDefault();
    const errBox = document.getElementById('p2-proj-errors');
    errBox.style.display = 'none';
    const btn = document.getElementById('pf-submit-btn');
    btn.disabled = true; btn.textContent = 'Saving…';

    const payload = {
      projectCode:        document.getElementById('pf-code').value,
      projectName:        document.getElementById('pf-name').value,
      description:        document.getElementById('pf-desc').value,
      projectType:        document.getElementById('pf-type').value,
      projectCategory:    document.getElementById('pf-cat').value,
      department:         document.getElementById('pf-dept').value,
      division:           document.getElementById('pf-div').value,
      responsibleOfficer: document.getElementById('pf-officer').value,
      state:              document.getElementById('pf-state').value,
      district:           document.getElementById('pf-district').value,
      block:              document.getElementById('pf-block').value,
      siteLocation:       document.getElementById('pf-site').value,
      estimatedCost:      document.getElementById('pf-cost').value,
      sanctionedAmount:   document.getElementById('pf-sanction').value,
      budgetHead:         document.getElementById('pf-bhead').value,
      fundingSource:      document.getElementById('pf-fund').value,
      financialYearId:    document.getElementById('pf-fy').value,
      startDate:          document.getElementById('pf-start').value,
      expectedCompletion: document.getElementById('pf-exp').value,
      actualCompletion:   document.getElementById('pf-actual').value,
      status:             document.getElementById('pf-status').value,
      remarks:            document.getElementById('pf-remarks').value,
    };

    try {
      const r = await this.apiFetch(id ? `/api/projects/${id}` : '/api/projects', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) {
        const msgs = data.errors || [data.error || 'An error occurred.'];
        errBox.innerHTML = msgs.map(m => `• ${m}`).join('<br>');
        errBox.style.display = 'block';
        btn.disabled = false; btn.textContent = id ? 'Save Changes' : '+ Create Project';
        return;
      }
      this.showToast(id ? 'Project updated successfully.' : 'Project created successfully.');
      this.renderProjectDetail(data.id);
    } catch (err) {
      errBox.innerHTML = '• Network error. Please try again.';
      errBox.style.display = 'block';
      btn.disabled = false; btn.textContent = id ? 'Save Changes' : '+ Create Project';
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TENDERS LIST
  // ─────────────────────────────────────────────────────────────────────────

  async renderTendersList(container) {
    const s = this.tendersState;
    let data = { data: [], total: 0, pages: 1 };

    try {
      const params = new URLSearchParams({ page: s.page, limit: 20, q: s.q, status: s.status, projectId: s.projectId });
      const r = await this.apiFetch(`/api/tenders?${params}`);
      if (r.ok) data = await r.json();
    } catch (_) {}

    const rows = data.data.length ? data.data.map(t => `
      <tr>
        <td><code>${t.tenderNumber}</code></td>
        <td><strong>${t.tenderTitle}</strong></td>
        <td><a href="#" onclick="Phase2.renderProjectDetail('${t.project?.id}')">${t.project?.projectCode || '—'}</a></td>
        <td>${this.fmt(t.tenderType)}</td>
        <td>${this.fmtCurrency(t.estimatedValue)}</td>
        <td>${this.fmtDate(t.publishDate)}</td>
        <td>${this.fmtDate(t.submissionEndDate)}</td>
        <td>${this.statusBadge(t.status)}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="Phase2.renderTenderDetail('${t.id}')">👁 View</button>
          <button class="btn btn-secondary btn-sm" onclick="Phase2.renderTenderForm('${t.id}')" style="margin-left:4px;">✏️ Edit</button>
        </td>
      </tr>`).join('') : `<tr><td colspan="9" style="text-align:center;padding:40px;color:#64748b;">No tenders found. <a href="#" onclick="Phase2.renderTenderForm()">Create a tender</a>.</td></tr>`;

    const paginationBtns = Array.from({ length: data.pages }, (_, i) => i + 1).map(pg =>
      `<button class="btn btn-sm ${pg === s.page ? 'btn-primary' : 'btn-secondary'}" onclick="Phase2.tendersState.page=${pg};Phase2.renderTendersList(document.getElementById('main-content'))">${pg}</button>`
    ).join(' ');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>📑 Tenders</h2><p>Manage all tenders. ${data.total} record(s) found.</p></div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="Phase2.renderTenderForm()">+ New Tender</button>
        </div>
      </div>

      <div class="table-card" style="margin-bottom:16px;">
        <div style="padding:14px 16px;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
          <div>
            <label class="form-label" style="font-size:11px;margin-bottom:4px;">Search</label>
            <input id="p2-t-search" type="text" class="form-control" placeholder="Number, Title, Project…" style="width:200px;" value="${s.q}"
              onkeydown="if(event.key==='Enter'){Phase2.tendersState.q=this.value;Phase2.tendersState.page=1;Phase2.renderTendersList(document.getElementById('main-content'))}">
          </div>
          <div>
            <label class="form-label" style="font-size:11px;margin-bottom:4px;">Status</label>
            <select id="p2-t-status" class="form-control" style="width:140px;" onchange="Phase2.tendersState.status=this.value;Phase2.tendersState.page=1;Phase2.renderTendersList(document.getElementById('main-content'))">
              <option value="">All Statuses</option>
              ${['Draft','Published','Open','Evaluation','Awarded','Cancelled','Closed'].map(st=>`<option value="${st}" ${st===s.status?'selected':''}>${st}</option>`).join('')}
            </select>
          </div>
          <div style="margin-top:auto;">
            <button class="btn btn-secondary btn-sm" onclick="Phase2.tendersState={page:1,q:'',status:'',projectId:''};Phase2.renderTendersList(document.getElementById('main-content'))">Clear Filters</button>
            <button class="btn btn-primary btn-sm" style="margin-left:6px;" onclick="Phase2.tendersState.q=document.getElementById('p2-t-search').value;Phase2.tendersState.page=1;Phase2.renderTendersList(document.getElementById('main-content'))">Search</button>
          </div>
        </div>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead><tr><th>Tender No.</th><th>Title</th><th>Project</th><th>Type</th><th>Est. Value</th><th>Publish Date</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="padding:12px 16px;display:flex;gap:6px;align-items:center;justify-content:space-between;">
          <span style="font-size:12px;color:#64748b;">Page ${s.page} of ${data.pages} (${data.total} records)</span>
          <div style="display:flex;gap:4px;">${paginationBtns}</div>
        </div>
      </div>`;
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TENDER DETAIL
  // ─────────────────────────────────────────────────────────────────────────

  async renderTenderDetail(id) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';
    try {
      const r = await this.apiFetch(`/api/tenders/${id}`);
      if (!r.ok) { container.innerHTML = '<div style="padding:40px;color:red;">Tender not found.</div>'; return; }
      const t = await r.json();
      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-text">
            <h2>📑 ${t.tenderNumber}</h2>
            <p>${t.tenderTitle} &nbsp; ${this.statusBadge(t.status)}</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('tenders')">← Tenders</button>
            <button class="btn btn-secondary btn-sm" onclick="Phase2.renderProjectDetail('${t.project?.id}')" style="margin-left:6px;">📂 ${t.project?.projectCode || 'Project'}</button>
            <button class="btn btn-primary btn-sm" onclick="Phase2.renderTenderForm('${t.id}')" style="margin-left:6px;">✏️ Edit Tender</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Tender Information</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Tender No.',t.tenderNumber],['Title',t.tenderTitle],['Description',t.description],['Type',t.tenderType],['Procurement Method',t.procurementMethod],['Category',t.tenderCategory]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
          </div>
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Financial</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Estimated Value',this.fmtCurrency(t.estimatedValue)],['Tender Fee',this.fmtCurrency(t.tenderFee)],['EMD Amount',this.fmtCurrency(t.emdAmount)]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
            <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-top:20px;">Important Dates</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Publish Date',this.fmtDate(t.publishDate)],['Submission Start',this.fmtDate(t.submissionStartDate)],['Submission Deadline',this.fmtDate(t.submissionEndDate)],['Bid Opening',this.fmtDate(t.bidOpeningDate)]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;">Parent Project</h4>
            <p><a href="#" onclick="Phase2.renderProjectDetail('${t.project?.id}')" style="color:#0b2545;font-weight:600;">${t.project?.projectCode} — ${t.project?.projectName}</a>
            &nbsp; ${this.statusBadge(t.project?.status)}</p>
            ${t.remarks ? `<p style="color:#64748b;font-size:13px;"><strong>Remarks:</strong> ${t.remarks}</p>` : ''}
          </div>
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;">Evaluation & Contracts</h4>
            <div style="margin-top:10px;">
              <button class="btn btn-secondary btn-sm" onclick="Phase3.tecsState.tenderId='${t.id}';Phase3.tecsState.page=1;Phase3.renderTecsList(document.getElementById('main-content'))">👁 View TECs</button>
              <button class="btn btn-primary btn-sm" onclick="Phase3.renderTecForm(null, '${t.id}')" style="margin-left:6px;">+ Create TEC</button>
            </div>
            <div style="margin-top:10px;">
              <button class="btn btn-secondary btn-sm" onclick="Phase3.contractsState.page=1;Phase3.contractsState.q='${t.tenderNumber}';Phase3.renderContractsList(document.getElementById('main-content'))">📜 View Contracts</button>
            </div>
          </div>
        </div>
        <div id="monitoring-container-tender"></div>
        <div id="docs-container-tender"></div>`;
      if (window.Phase5) Phase5.renderWidget('monitoring-container-tender', 'tender', t.id);
      if (window.Phase4) Phase4.renderWidget('docs-container-tender', 'tender', t.id);
    } catch (e) {
      container.innerHTML = '<div style="padding:40px;color:red;">Error loading tender.</div>';
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TENDER FORM (Create / Edit)
  // ─────────────────────────────────────────────────────────────────────────

  async renderTenderForm(id = null, presetProjectId = null) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';

    let t = null, projects = [];
    try {
      const pr = await this.apiFetch('/api/projects?limit=200');
      if (pr.ok) { const pd = await pr.json(); projects = pd.data || []; }
      if (id) {
        const r = await this.apiFetch(`/api/tenders/${id}`);
        if (r.ok) t = await r.json();
      }
    } catch (_) {}

    const v = (f) => t?.[f] ?? '';
    const dateVal = (f) => t?.[f] ? t[f].substring(0, 10) : '';
    const selProject = presetProjectId || v('projectId');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text">
          <h2>${id ? '✏️ Edit Tender' : '+ Create Tender'}</h2>
          <p>${id ? `Editing: ${t?.tenderNumber || ''}` : 'Fill in the details to create a new tender.'}</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" onclick="App.navigate('tenders')">← Back</button>
        </div>
      </div>

      <div class="table-card" style="padding:24px;">
        <div id="p2-tend-errors" style="display:none;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:12px 16px;margin-bottom:16px;color:#b91c1c;"></div>
        <form id="p2-tender-form" onsubmit="Phase2.submitTenderForm(event,'${id || ''}')">

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">Tender Number <span style="color:red">*</span></label>
              <input type="text" id="tf-num" class="form-control" value="${v('tenderNumber')}" placeholder="e.g. NIMI/T-01/2026-27" required>
            </div>
            <div class="form-group">
              <label class="form-label">Parent Project <span style="color:red">*</span></label>
              <select id="tf-project" class="form-control" required>
                <option value="">— Select Project —</option>
                ${projects.map(p=>`<option value="${p.id}" ${p.id===selProject?'selected':''}>[${p.projectCode}] ${p.projectName}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Tender Title <span style="color:red">*</span></label>
            <input type="text" id="tf-title" class="form-control" value="${v('tenderTitle')}" required>
          </div>
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label">Description</label>
            <textarea id="tf-desc" class="form-control" rows="3">${v('description')}</textarea>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">Tender Type</label>
              <input type="text" id="tf-type" class="form-control" value="${v('tenderType')}" placeholder="e.g. Open, Limited">
            </div>
            <div class="form-group">
              <label class="form-label">Procurement Method</label>
              <input type="text" id="tf-method" class="form-control" value="${v('procurementMethod')}" placeholder="e.g. RFP, GeM">
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="tf-status" class="form-control">
                ${['Draft','Published','Open','Evaluation','Awarded','Cancelled','Closed'].map(s=>`<option value="${s}" ${v('status')===s?'selected':''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>

          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Financial</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Estimated Value (₹)</label><input type="number" id="tf-value" class="form-control" value="${v('estimatedValue')}" min="0" step="0.01"></div>
            <div class="form-group"><label class="form-label">Tender Fee (₹)</label><input type="number" id="tf-fee" class="form-control" value="${v('tenderFee')}" min="0" step="0.01"></div>
            <div class="form-group"><label class="form-label">EMD Amount (₹)</label><input type="number" id="tf-emd" class="form-control" value="${v('emdAmount')}" min="0" step="0.01"></div>
          </div>

          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Important Dates</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Publish Date</label><input type="date" id="tf-pub" class="form-control" value="${dateVal('publishDate')}"></div>
            <div class="form-group"><label class="form-label">Submission Start</label><input type="date" id="tf-substart" class="form-control" value="${dateVal('submissionStartDate')}"></div>
            <div class="form-group"><label class="form-label">Submission Deadline</label><input type="date" id="tf-subend" class="form-control" value="${dateVal('submissionEndDate')}"></div>
            <div class="form-group"><label class="form-label">Bid Opening Date</label><input type="date" id="tf-open" class="form-control" value="${dateVal('bidOpeningDate')}"></div>
          </div>

          <div class="form-group" style="margin-bottom:24px;">
            <label class="form-label">Remarks</label>
            <textarea id="tf-remarks" class="form-control" rows="2">${v('remarks')}</textarea>
          </div>

          <div style="display:flex;gap:10px;">
            <button type="submit" class="btn btn-primary" id="tf-submit-btn">${id ? 'Save Changes' : '+ Create Tender'}</button>
            <button type="button" class="btn btn-secondary" onclick="App.navigate('tenders')">Cancel</button>
          </div>
        </form>
      </div>`;
  },

  async submitTenderForm(e, id) {
    e.preventDefault();
    const errBox = document.getElementById('p2-tend-errors');
    errBox.style.display = 'none';
    const btn = document.getElementById('tf-submit-btn');
    btn.disabled = true; btn.textContent = 'Saving…';

    const payload = {
      tenderNumber:       document.getElementById('tf-num').value,
      tenderTitle:        document.getElementById('tf-title').value,
      description:        document.getElementById('tf-desc').value,
      tenderType:         document.getElementById('tf-type').value,
      procurementMethod:  document.getElementById('tf-method').value,
      status:             document.getElementById('tf-status').value,
      estimatedValue:     document.getElementById('tf-value').value,
      tenderFee:          document.getElementById('tf-fee').value,
      emdAmount:          document.getElementById('tf-emd').value,
      publishDate:        document.getElementById('tf-pub').value,
      submissionStartDate: document.getElementById('tf-substart').value,
      submissionEndDate:  document.getElementById('tf-subend').value,
      bidOpeningDate:     document.getElementById('tf-open').value,
      remarks:            document.getElementById('tf-remarks').value,
      projectId:          document.getElementById('tf-project').value,
    };

    try {
      const r = await this.apiFetch(id ? `/api/tenders/${id}` : '/api/tenders', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) {
        const msgs = data.errors || [data.error || 'An error occurred.'];
        errBox.innerHTML = msgs.map(m => `• ${m}`).join('<br>');
        errBox.style.display = 'block';
        btn.disabled = false; btn.textContent = id ? 'Save Changes' : '+ Create Tender';
        return;
      }
      this.showToast(id ? 'Tender updated successfully.' : 'Tender created successfully.');
      this.renderTenderDetail(data.id);
    } catch (err) {
      errBox.innerHTML = '• Network error. Please try again.';
      errBox.style.display = 'block';
      btn.disabled = false; btn.textContent = id ? 'Save Changes' : '+ Create Tender';
    }
  },
};

if (typeof window !== 'undefined') { window.Phase2 = Phase2; }
