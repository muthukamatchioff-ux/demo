const Phase5 = {
  monState: { page: 1, q: '', status: '', projectId: '', contractId: '' },

  fmtDate(d) { return !d ? '—' : new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); },
  statusBadge(s) {
    if (!s) return '—';
    const c = { 'Scheduled': 'info', 'In Progress': 'primary', 'Completed': 'success', 'Follow-up Required': 'warning', 'Closed': 'secondary', 'Cancelled': 'danger' }[s] || 'secondary';
    return `<span class="badge badge-${c}">${s}</span>`;
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

  // ─── MONITORING LIST ───────────────────────────────────────────────────────

  async renderMonitoringList(container) {
    const s = this.monState;
    let data = { data: [], total: 0, pages: 1 };
    try {
      const params = new URLSearchParams({ page: s.page, limit: 20, q: s.q, status: s.status, projectId: s.projectId, contractId: s.contractId });
      const r = await this.apiFetch(`/api/monitoring?${params}`);
      if (r.ok) data = await r.json();
    } catch (_) {}

    const rows = data.data.length ? data.data.map(m => `
      <tr>
        <td><strong>${m.referenceNumber}</strong></td>
        <td>${m.project?.projectCode || '—'}</td>
        <td>${m.monitoringType}</td>
        <td>${this.fmtDate(m.monitoringDate)}</td>
        <td>${m.officer || '—'}</td>
        <td>${this.statusBadge(m.status)}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="Phase5.renderMonitoringDetail('${m.id}')">👁 View</button>
          <button class="btn btn-secondary btn-sm" onclick="Phase5.renderMonitoringForm('${m.id}')" style="margin-left:4px;">✏️ Edit</button>
        </td>
      </tr>`).join('') : `<tr><td colspan="7" style="text-align:center;padding:40px;color:#64748b;">No monitoring records found.</td></tr>`;

    const paginationBtns = Array.from({ length: data.pages }, (_, i) => i + 1).map(pg =>
      `<button class="btn btn-sm ${pg === s.page ? 'btn-primary' : 'btn-secondary'}" onclick="Phase5.monState.page=${pg};Phase5.renderMonitoringList(document.getElementById('main-content'))">${pg}</button>`
    ).join(' ');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>🔍 Monitoring & Video Links</h2><p>${data.total} record(s) found.</p></div>
        <div class="page-actions"><button class="btn btn-primary btn-sm" onclick="Phase5.renderMonitoringForm()">+ New Record</button></div>
      </div>
      <div class="table-card" style="margin-bottom:16px;">
        <div style="padding:14px 16px;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
          <div><label class="form-label" style="font-size:11px;margin-bottom:4px;">Search</label>
          <input id="p5-m-search" type="text" class="form-control" placeholder="Ref No, Officer, Location..." style="width:200px;" value="${s.q}" onkeydown="if(event.key==='Enter'){Phase5.monState.q=this.value;Phase5.monState.page=1;Phase5.renderMonitoringList(document.getElementById('main-content'))}"></div>
          <div><label class="form-label" style="font-size:11px;margin-bottom:4px;">Status</label>
          <select id="p5-m-status" class="form-control" style="width:140px;" onchange="Phase5.monState.status=this.value;Phase5.monState.page=1;Phase5.renderMonitoringList(document.getElementById('main-content'))">
            <option value="">All Statuses</option>${['Scheduled','In Progress','Completed','Follow-up Required','Closed','Cancelled'].map(st=>`<option value="${st}" ${st===s.status?'selected':''}>${st}</option>`).join('')}
          </select></div>
          <div style="margin-top:auto;"><button class="btn btn-secondary btn-sm" onclick="Phase5.monState={page:1,q:'',status:'',projectId:'',contractId:''};Phase5.renderMonitoringList(document.getElementById('main-content'))">Clear</button>
          <button class="btn btn-primary btn-sm" style="margin-left:6px;" onclick="Phase5.monState.q=document.getElementById('p5-m-search').value;Phase5.monState.page=1;Phase5.renderMonitoringList(document.getElementById('main-content'))">Search</button></div>
        </div>
      </div>
      <div class="table-card"><table class="data-table"><thead><tr><th>Ref Number</th><th>Project</th><th>Type</th><th>Date</th><th>Officer</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
      <div style="padding:12px 16px;display:flex;gap:6px;align-items:center;justify-content:space-between;"><span style="font-size:12px;color:#64748b;">Page ${s.page} of ${data.pages}</span><div style="display:flex;gap:4px;">${paginationBtns}</div></div></div>
    `;
  },

  // ─── MONITORING DETAIL ─────────────────────────────────────────────────────

  async renderMonitoringDetail(id) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';
    try {
      const r = await this.apiFetch(`/api/monitoring/${id}`);
      if (!r.ok) { container.innerHTML = '<div style="padding:40px;color:red;">Record not found.</div>'; return; }
      const m = await r.json();

      const vidRows = m.videoLinks?.map(v => `<tr><td><strong>${v.title}</strong></td><td>${v.platform}</td><td>${this.fmtDate(v.sessionDate)}</td>
        <td><a href="${v.url}" target="_blank" class="btn btn-primary btn-sm">Join / View</a></td>
        <td><button class="btn btn-danger btn-sm" onclick="Phase5.deleteVideo('${id}', '${v.id}')">×</button></td></tr>`).join('') || `<tr><td colspan="5" style="text-align:center;color:#64748b;">No video links added.</td></tr>`;
      
      const obsRows = m.observations?.map(o => `<tr><td>${o.category||'—'}</td><td>${o.description}</td><td>${o.severity||'—'}</td><td>${o.status}</td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center;color:#64748b;">No observations.</td></tr>`;
      const issRows = m.issues?.map(i => `<tr><td>${i.issueNumber}</td><td>${i.description}</td><td>${this.fmtDate(i.targetDate)}</td><td>${i.status}</td>
        <td><button class="btn btn-secondary btn-sm" onclick="Phase5.resolveIssue('${id}', '${i.id}')" ${i.status==='Closed'||i.status==='Resolved'?'disabled':''}>Resolve</button></td></tr>`).join('') || `<tr><td colspan="5" style="text-align:center;color:#64748b;">No issues.</td></tr>`;
      const actRows = m.actions?.map(a => `<tr><td>${a.actionNumber}</td><td>${a.description}</td><td>${a.assignedTo||'—'}</td><td>${this.fmtDate(a.dueDate)}</td><td>${a.status}</td>
        <td><button class="btn btn-secondary btn-sm" onclick="Phase5.completeAction('${id}', '${a.id}')" ${a.status==='Completed'?'disabled':''}>Complete</button></td></tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:#64748b;">No follow-up actions.</td></tr>`;

      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-text"><h2>🔍 ${m.referenceNumber}</h2><p>${m.monitoringType} &nbsp; ${this.statusBadge(m.status)}</p></div>
          <div class="page-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('monitoring')">← Back</button>
            <button class="btn btn-primary btn-sm" onclick="Phase5.renderMonitoringForm('${m.id}')" style="margin-left:6px;">✏️ Edit</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Details</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Type',m.monitoringType],['Date',this.fmtDate(m.monitoringDate)],['Officer',m.officer],['Team',m.team],['Location',m.location],['Purpose',m.purpose]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:30%;">${k}</td><td style="padding:5px 0;font-weight:500;">${v||'—'}</td></tr>`).join('')}
            </table>
          </div>
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Related Records</h4>
            <p><strong>Project:</strong> <a href="#" onclick="Phase2.renderProjectDetail('${m.projectId}')">${m.project?.projectCode} — ${m.project?.projectName}</a></p>
            ${m.tenderId ? `<p><strong>Tender:</strong> <a href="#" onclick="Phase2.renderTenderDetail('${m.tenderId}')">${m.tender?.tenderNumber}</a></p>` : ''}
            ${m.contractId ? `<p><strong>Contract:</strong> <a href="#" onclick="Phase3.renderContractDetail('${m.contractId}')">${m.contract?.contractNumber}</a></p>` : ''}
          </div>
        </div>

        <div class="table-card" style="margin-bottom:16px;">
          <div class="table-toolbar"><div class="table-title"><h3>Video Links</h3></div></div>
          <table class="data-table" style="margin-bottom:16px;">
            <thead><tr><th>Title</th><th>Platform</th><th>Date</th><th>Link</th><th></th></tr></thead>
            <tbody>${vidRows}</tbody>
          </table>
          <div style="padding:0 16px 16px;">
            <form onsubmit="Phase5.addVideoLink(event, '${m.id}')" style="display:flex;gap:10px;align-items:flex-end;">
              <div><label class="form-label" style="font-size:11px;">Title *</label><input type="text" id="vl-title" class="form-control" required></div>
              <div><label class="form-label" style="font-size:11px;">Platform *</label><input type="text" id="vl-plat" class="form-control" required placeholder="Zoom, Meet..."></div>
              <div><label class="form-label" style="font-size:11px;">URL *</label><input type="url" id="vl-url" class="form-control" required></div>
              <div><button type="submit" class="btn btn-secondary btn-sm" style="height:32px;">+ Add Link</button></div>
            </form>
          </div>
        </div>

        <div class="table-card" style="margin-bottom:16px;">
          <div class="table-toolbar"><div class="table-title"><h3>Observations</h3></div></div>
          <table class="data-table" style="margin-bottom:16px;">
            <thead><tr><th>Category</th><th>Description</th><th>Severity</th><th>Status</th></tr></thead>
            <tbody>${obsRows}</tbody>
          </table>
          <div style="padding:0 16px 16px;">
            <form onsubmit="Phase5.addObservation(event, '${m.id}')" style="display:flex;gap:10px;align-items:flex-end;">
              <div><label class="form-label" style="font-size:11px;">Desc *</label><input type="text" id="ob-desc" class="form-control" required></div>
              <div><label class="form-label" style="font-size:11px;">Category</label><input type="text" id="ob-cat" class="form-control"></div>
              <div><label class="form-label" style="font-size:11px;">Severity</label><select id="ob-sev" class="form-control"><option>Low</option><option>Medium</option><option>High</option></select></div>
              <div><button type="submit" class="btn btn-secondary btn-sm" style="height:32px;">+ Add</button></div>
            </form>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div class="table-card">
            <div class="table-toolbar"><div class="table-title"><h3>Issues & Deficiencies</h3></div></div>
            <table class="data-table" style="margin-bottom:16px;"><thead><tr><th>No.</th><th>Desc</th><th>Target</th><th>Status</th><th></th></tr></thead><tbody>${issRows}</tbody></table>
            <div style="padding:0 16px 16px;"><form onsubmit="Phase5.addIssue(event, '${m.id}')" style="display:flex;gap:10px;align-items:flex-end;">
              <div><input type="text" id="is-num" class="form-control" placeholder="No *" required style="width:80px;"></div>
              <div><input type="text" id="is-desc" class="form-control" placeholder="Description *" required></div>
              <div><button type="submit" class="btn btn-secondary btn-sm" style="height:32px;">+ Add</button></div>
            </form></div>
          </div>
          <div class="table-card">
            <div class="table-toolbar"><div class="table-title"><h3>Follow-up Actions</h3></div></div>
            <table class="data-table" style="margin-bottom:16px;"><thead><tr><th>No.</th><th>Desc</th><th>Assigned To</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>${actRows}</tbody></table>
            <div style="padding:0 16px 16px;"><form onsubmit="Phase5.addAction(event, '${m.id}')" style="display:flex;gap:10px;align-items:flex-end;">
              <div><input type="text" id="fa-num" class="form-control" placeholder="No *" required style="width:80px;"></div>
              <div><input type="text" id="fa-desc" class="form-control" placeholder="Description *" required></div>
              <div><input type="date" id="fa-due" class="form-control"></div>
              <div><button type="submit" class="btn btn-secondary btn-sm" style="height:32px;">+ Add</button></div>
            </form></div>
          </div>
        </div>
        
        <div id="docs-container-monitoring"></div>
      `;
      if (window.Phase4) Phase4.renderWidget('docs-container-monitoring', 'monitoring', m.id);

    } catch (e) { container.innerHTML = '<div style="padding:40px;color:red;">Error loading record.</div>'; }
  },

  // ─── FORMS & ACTIONS ───────────────────────────────────────────────────────

  async renderMonitoringForm(id = null) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';
    let m = null, projects = [];
    try {
      const pr = await this.apiFetch('/api/projects?limit=200');
      if (pr.ok) { const pd = await pr.json(); projects = pd.data || []; }
      if (id) {
        const r = await this.apiFetch(`/api/monitoring/${id}`);
        if (r.ok) m = await r.json();
      }
    } catch (_) {}

    const v = (f) => m?.[f] ?? '';
    const dateVal = (f) => m?.[f] ? m[f].substring(0, 10) : '';

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>${id ? '✏️ Edit Monitoring' : '+ Create Monitoring'}</h2></div>
        <div class="page-actions"><button class="btn btn-secondary btn-sm" onclick="App.navigate('monitoring')">← Back</button></div>
      </div>
      <div class="table-card" style="padding:24px;">
        <div id="p5-m-errs" style="display:none;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:12px 16px;margin-bottom:16px;color:#b91c1c;"></div>
        <form onsubmit="Phase5.submitMonitoringForm(event,'${id || ''}')">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Reference Number *</label><input type="text" id="mf-ref" class="form-control" value="${v('referenceNumber')}" required ${id?'readonly':''}></div>
            <div class="form-group"><label class="form-label">Project *</label><select id="mf-proj" class="form-control" required>
              <option value="">— Select Project —</option>
              ${projects.map(p=>`<option value="${p.id}" ${p.id===v('projectId')?'selected':''}>${p.projectCode} — ${p.projectName}</option>`).join('')}
            </select></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Type *</label><input type="text" id="mf-type" class="form-control" value="${v('monitoringType')}" required placeholder="Site Inspection, Virtual..."></div>
            <div class="form-group"><label class="form-label">Date *</label><input type="date" id="mf-date" class="form-control" value="${dateVal('monitoringDate')}" required></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Officer</label><input type="text" id="mf-officer" class="form-control" value="${v('officer')}"></div>
            <div class="form-group"><label class="form-label">Location</label><input type="text" id="mf-loc" class="form-control" value="${v('location')}"></div>
            <div class="form-group"><label class="form-label">Status</label><select id="mf-status" class="form-control">
              ${['Scheduled','In Progress','Completed','Follow-up Required','Closed','Cancelled'].map(s=>`<option value="${s}" ${v('status')===s?'selected':''}>${s}</option>`).join('')}
            </select></div>
          </div>
          <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Purpose</label><input type="text" id="mf-purp" class="form-control" value="${v('purpose')}"></div>
          <div class="form-group" style="margin-bottom:24px;"><label class="form-label">Description / Notes</label><textarea id="mf-desc" class="form-control" rows="2">${v('description')}</textarea></div>
          <button type="submit" class="btn btn-primary" id="mf-btn">${id ? 'Save Changes' : '+ Create Record'}</button>
        </form>
      </div>`;
  },

  async submitMonitoringForm(e, id) {
    e.preventDefault();
    const errBox = document.getElementById('p5-m-errs'); errBox.style.display = 'none';
    const btn = document.getElementById('mf-btn'); btn.disabled = true;

    const payload = {
      referenceNumber: document.getElementById('mf-ref').value, projectId: document.getElementById('mf-proj').value,
      monitoringType: document.getElementById('mf-type').value, monitoringDate: document.getElementById('mf-date').value,
      officer: document.getElementById('mf-officer').value, location: document.getElementById('mf-loc').value,
      purpose: document.getElementById('mf-purp').value, description: document.getElementById('mf-desc').value,
      status: document.getElementById('mf-status').value
    };

    try {
      const r = await this.apiFetch(id ? `/api/monitoring/${id}` : '/api/monitoring', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      const data = await r.json();
      if (!r.ok) {
        errBox.innerHTML = (data.errors || [data.error || 'Error']).map(m => `• ${m}`).join('<br>');
        errBox.style.display = 'block'; btn.disabled = false; return;
      }
      this.showToast(id ? 'Record updated.' : 'Record created.');
      this.renderMonitoringDetail(data.id);
    } catch (err) { errBox.innerHTML = '• Network error.'; errBox.style.display = 'block'; btn.disabled = false; }
  },

  async addVideoLink(e, id) {
    e.preventDefault();
    const payload = { title: document.getElementById('vl-title').value, platform: document.getElementById('vl-plat').value, url: document.getElementById('vl-url').value };
    const r = await this.apiFetch(`/api/monitoring/${id}/videos`, { method: 'POST', body: JSON.stringify(payload) });
    if (r.ok) { this.showToast('Link added.'); this.renderMonitoringDetail(id); }
    else { const d = await r.json(); this.showToast((d.errors||[]).join(', ') || 'Failed to add link', 'error'); }
  },
  async deleteVideo(id, vid) {
    if (!confirm('Remove this link?')) return;
    const r = await this.apiFetch(`/api/monitoring/${id}/videos/${vid}`, { method: 'DELETE' });
    if (r.ok) { this.showToast('Link removed.'); this.renderMonitoringDetail(id); }
  },
  async addObservation(e, id) {
    e.preventDefault();
    const payload = { description: document.getElementById('ob-desc').value, category: document.getElementById('ob-cat').value, severity: document.getElementById('ob-sev').value };
    const r = await this.apiFetch(`/api/monitoring/${id}/observations`, { method: 'POST', body: JSON.stringify(payload) });
    if (r.ok) { this.showToast('Observation added.'); this.renderMonitoringDetail(id); }
  },
  async addIssue(e, id) {
    e.preventDefault();
    const payload = { issueNumber: document.getElementById('is-num').value, description: document.getElementById('is-desc').value };
    const r = await this.apiFetch(`/api/monitoring/${id}/issues`, { method: 'POST', body: JSON.stringify(payload) });
    if (r.ok) { this.showToast('Issue added.'); this.renderMonitoringDetail(id); }
  },
  async resolveIssue(id, issueId) {
    const r = await this.apiFetch(`/api/monitoring/${id}/issues/${issueId}`, { method: 'PUT', body: JSON.stringify({ status: 'Resolved', resolutionDate: new Date().toISOString().substring(0,10) }) });
    if (r.ok) { this.showToast('Issue marked resolved.'); this.renderMonitoringDetail(id); }
  },
  async addAction(e, id) {
    e.preventDefault();
    const payload = { actionNumber: document.getElementById('fa-num').value, description: document.getElementById('fa-desc').value, dueDate: document.getElementById('fa-due').value };
    const r = await this.apiFetch(`/api/monitoring/${id}/actions`, { method: 'POST', body: JSON.stringify(payload) });
    if (r.ok) { this.showToast('Action added.'); this.renderMonitoringDetail(id); }
  },
  async completeAction(id, actionId) {
    const r = await this.apiFetch(`/api/monitoring/${id}/actions/${actionId}`, { method: 'PUT', body: JSON.stringify({ status: 'Completed', completionDate: new Date().toISOString().substring(0,10) }) });
    if (r.ok) { this.showToast('Action marked complete.'); this.renderMonitoringDetail(id); }
  },

  // ─── WIDGET (For Phase 2-3 injection) ──────────────────────────────────────

  async renderWidget(containerId, entityType, entityId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
      const q = new URLSearchParams({ limit: '10' });
      if (entityType === 'project') q.set('projectId', entityId);
      if (entityType === 'contract') q.set('contractId', entityId);

      const r = await this.apiFetch(`/api/monitoring?${q}`);
      let docs = [];
      if (r.ok) { const data = await r.json(); docs = data.data || []; }

      const rows = docs.length ? docs.map(m => `
        <tr>
          <td><a href="#" onclick="Phase5.renderMonitoringDetail('${m.id}')"><strong>${m.referenceNumber}</strong></a></td>
          <td>${m.monitoringType}</td>
          <td>${this.fmtDate(m.monitoringDate)}</td>
          <td>${this.statusBadge(m.status)}</td>
        </tr>`).join('') : `<tr><td colspan="4" style="text-align:center;padding:20px;color:#64748b;">No monitoring records.</td></tr>`;

      container.innerHTML = `
        <div class="table-card" style="padding:20px;margin-top:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px;">
            <h4 style="color:#0b2545;margin:0;">Monitoring & Video Links</h4>
            <button class="btn btn-secondary btn-sm" onclick="Phase5.monState={page:1,q:'',status:'',projectId:'${entityType==='project'?entityId:''}',contractId:'${entityType==='contract'?entityId:''}'};Phase5.renderMonitoringList(document.getElementById('main-content'))">View All / Search</button>
          </div>
          <table class="data-table">
            <thead><tr><th>Ref</th><th>Type</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (e) {
      container.innerHTML = '<div style="padding:20px;color:red;">Error loading monitoring.</div>';
    }
  }
};

if (typeof window !== 'undefined') { window.Phase5 = Phase5; }
