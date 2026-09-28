const Phase3 = {
  tecsState: { page: 1, q: '', status: '', tenderId: '' },
  contractsState: { page: 1, q: '', status: '' },

  fmt(val) { return val === null || val === undefined || val === '' ? '—' : val; },
  fmtDate(d) { return !d ? '—' : new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); },
  fmtCurrency(v) { return v === null || v === undefined ? '—' : '₹ ' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 }); },
  
  statusBadge(s) {
    const colorMap = {
      Draft: 'badge-secondary', 'Constituted': 'badge-info', 'Evaluation In Progress': 'badge-warning',
      'Evaluation Completed': 'badge-primary', 'Recommendation Submitted': 'badge-primary',
      Approved: 'badge-success', Closed: 'badge-secondary', Cancelled: 'badge-danger',
      Awarded: 'badge-success', Active: 'badge-info', Suspended: 'badge-warning',
      Completed: 'badge-success', Terminated: 'badge-danger'
    };
    return `<span class="badge ${colorMap[s] || 'badge-outline'}">${s || '—'}</span>`;
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

  // ─── TEC LIST ──────────────────────────────────────────────────────────────

  async renderTecsList(container) {
    const s = this.tecsState;
    let data = { data: [], total: 0, pages: 1 };
    try {
      const params = new URLSearchParams({ page: s.page, limit: 20, q: s.q, status: s.status, tenderId: s.tenderId });
      const r = await this.apiFetch(`/api/tecs?${params}`);
      if (r.ok) data = await r.json();
    } catch (_) {}

    const rows = data.data.length ? data.data.map(t => `
      <tr>
        <td><code>${t.tecReference}</code></td>
        <td><a href="#" onclick="Phase2.renderTenderDetail('${t.tender?.id}')">${t.tender?.tenderNumber || '—'}</a></td>
        <td><a href="#" onclick="Phase2.renderProjectDetail('${t.tender?.project?.id}')">${t.tender?.project?.projectCode || '—'}</a></td>
        <td><strong>${t.committeeName}</strong></td>
        <td>${this.fmtDate(t.formationDate)}</td>
        <td>${this.statusBadge(t.status)}</td>
        <td>${this.statusBadge(t.recommendation)}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="Phase3.renderTecDetail('${t.id}')">👁 View</button>
          <button class="btn btn-secondary btn-sm" onclick="Phase3.renderTecForm('${t.id}')" style="margin-left:4px;">✏️ Edit</button>
        </td>
      </tr>`).join('') : `<tr><td colspan="8" style="text-align:center;padding:40px;color:#64748b;">No TEC found. <a href="#" onclick="Phase3.renderTecForm()">Create TEC</a></td></tr>`;

    const paginationBtns = Array.from({ length: data.pages }, (_, i) => i + 1).map(pg =>
      `<button class="btn btn-sm ${pg === s.page ? 'btn-primary' : 'btn-secondary'}" onclick="Phase3.tecsState.page=${pg};Phase3.renderTecsList(document.getElementById('main-content'))">${pg}</button>`
    ).join(' ');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>⚖️ Technical Evaluation Committees (TEC)</h2><p>${data.total} record(s) found.</p></div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="Phase3.renderTecForm()">+ New TEC</button>
        </div>
      </div>
      <div class="table-card" style="margin-bottom:16px;">
        <div style="padding:14px 16px;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
          <div><label class="form-label" style="font-size:11px;margin-bottom:4px;">Search</label>
          <input id="p3-tec-search" type="text" class="form-control" placeholder="Reference, Name..." style="width:200px;" value="${s.q}" onkeydown="if(event.key==='Enter'){Phase3.tecsState.q=this.value;Phase3.tecsState.page=1;Phase3.renderTecsList(document.getElementById('main-content'))}"></div>
          <div><label class="form-label" style="font-size:11px;margin-bottom:4px;">Status</label>
          <select id="p3-tec-status" class="form-control" style="width:140px;" onchange="Phase3.tecsState.status=this.value;Phase3.tecsState.page=1;Phase3.renderTecsList(document.getElementById('main-content'))">
            <option value="">All Statuses</option>
            ${['Draft','Constituted','Evaluation In Progress','Evaluation Completed','Recommendation Submitted','Approved','Closed','Cancelled'].map(st=>`<option value="${st}" ${st===s.status?'selected':''}>${st}</option>`).join('')}
          </select></div>
          <div style="margin-top:auto;"><button class="btn btn-secondary btn-sm" onclick="Phase3.tecsState={page:1,q:'',status:'',tenderId:''};Phase3.renderTecsList(document.getElementById('main-content'))">Clear</button>
          <button class="btn btn-primary btn-sm" style="margin-left:6px;" onclick="Phase3.tecsState.q=document.getElementById('p3-tec-search').value;Phase3.tecsState.page=1;Phase3.renderTecsList(document.getElementById('main-content'))">Search</button></div>
        </div>
      </div>
      <div class="table-card"><table class="data-table"><thead><tr><th>TEC Ref.</th><th>Tender</th><th>Project</th><th>Committee Name</th><th>Formation</th><th>Status</th><th>Recommendation</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
      <div style="padding:12px 16px;display:flex;gap:6px;align-items:center;justify-content:space-between;"><span style="font-size:12px;color:#64748b;">Page ${s.page} of ${data.pages}</span><div style="display:flex;gap:4px;">${paginationBtns}</div></div></div>`;
  },

  // ─── TEC DETAIL ────────────────────────────────────────────────────────────

  async renderTecDetail(id) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';
    try {
      const r = await this.apiFetch(`/api/tecs/${id}`);
      if (!r.ok) { container.innerHTML = '<div style="padding:40px;color:red;">TEC not found.</div>'; return; }
      const t = await r.json();

      const memberRows = t.members?.length ? t.members.map(m => `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td>${this.fmt(m.designation)}</td>
          <td>${this.fmt(m.department)}</td>
          <td>${this.fmt(m.role)}</td>
          <td style="white-space:nowrap;"><button class="btn btn-danger btn-sm" onclick="if(confirm('Remove this member?')) Phase3.removeTecMember('${t.id}', '${m.id}')">Remove</button></td>
        </tr>`).join('') : `<tr><td colspan="5" style="text-align:center;padding:20px;color:#64748b;">No members added yet.</td></tr>`;

      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-text"><h2>⚖️ ${t.tecReference}</h2><p>${t.committeeName} &nbsp; ${this.statusBadge(t.status)}</p></div>
          <div class="page-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('tecs')">← TECs</button>
            <button class="btn btn-secondary btn-sm" onclick="Phase2.renderTenderDetail('${t.tender?.id}')" style="margin-left:6px;">📑 ${t.tender?.tenderNumber || 'Tender'}</button>
            <button class="btn btn-primary btn-sm" onclick="Phase3.renderTecForm('${t.id}')" style="margin-left:6px;">✏️ Edit TEC</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Committee Information</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['TEC Ref.',t.tecReference],['Committee Name',t.committeeName],['Formation Date',this.fmtDate(t.formationDate)],['Order Number',t.orderNumber],['Description',t.description]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
          </div>
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Evaluation</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Eval Start',this.fmtDate(t.evalStartDate)],['Eval End',this.fmtDate(t.evalEndDate)],['Recommendation',this.statusBadge(t.recommendation)],['Remarks',t.remarks]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
            <div style="margin-top:20px;">
              <button class="btn btn-primary btn-sm" onclick="Phase3.renderContractForm(null, '${t.tender?.id}')" ${t.status !== 'Approved' ? 'disabled title="TEC must be Approved"' : ''}>+ Create Contract</button>
            </div>
          </div>
        </div>

        <div class="table-card" style="padding:20px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px;">
            <h4 style="color:#0b2545;margin:0;">Committee Members</h4>
          </div>
          <table class="data-table" style="margin-bottom:16px;">
            <thead><tr><th>Name</th><th>Designation</th><th>Department</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>${memberRows}</tbody>
          </table>
          <form onsubmit="Phase3.addTecMember(event, '${t.id}')" style="display:flex;gap:10px;align-items:flex-end;">
            <div><label class="form-label" style="font-size:11px;">Name *</label><input type="text" id="tm-name" class="form-control" required></div>
            <div><label class="form-label" style="font-size:11px;">Designation</label><input type="text" id="tm-desig" class="form-control"></div>
            <div><label class="form-label" style="font-size:11px;">Dept</label><input type="text" id="tm-dept" class="form-control"></div>
            <div><label class="form-label" style="font-size:11px;">Role</label><input type="text" id="tm-role" class="form-control" placeholder="e.g. Chairperson"></div>
            <div><button type="submit" class="btn btn-secondary btn-sm" style="height:32px;">+ Add Member</button></div>
          </form>
        </div>
        <div id="docs-container-tec"></div>`;
      if (window.Phase4) Phase4.renderWidget('docs-container-tec', 'tec', t.id);
    } catch (e) { container.innerHTML = '<div style="padding:40px;color:red;">Error loading TEC.</div>'; }
  },

  // ─── TEC FORM ──────────────────────────────────────────────────────────────

  async renderTecForm(id = null, presetTenderId = null) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';

    let t = null, tenders = [];
    try {
      const tr = await this.apiFetch('/api/tenders?limit=200');
      if (tr.ok) { const td = await tr.json(); tenders = td.data || []; }
      if (id) {
        const r = await this.apiFetch(`/api/tecs/${id}`);
        if (r.ok) t = await r.json();
      }
    } catch (_) {}

    const v = (f) => t?.[f] ?? '';
    const dateVal = (f) => t?.[f] ? t[f].substring(0, 10) : '';
    const selTender = presetTenderId || v('tenderId');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>${id ? '✏️ Edit TEC' : '+ Create TEC'}</h2></div>
        <div class="page-actions"><button class="btn btn-secondary btn-sm" onclick="App.navigate('tecs')">← Back</button></div>
      </div>
      <div class="table-card" style="padding:24px;">
        <div id="p3-tec-errs" style="display:none;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:12px 16px;margin-bottom:16px;color:#b91c1c;"></div>
        <form onsubmit="Phase3.submitTecForm(event,'${id || ''}')">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">TEC Reference *</label><input type="text" id="tf-ref" class="form-control" value="${v('tecReference')}" required></div>
            <div class="form-group"><label class="form-label">Tender *</label><select id="tf-tender" class="form-control" required>
              <option value="">— Select Tender —</option>
              ${tenders.map(td=>`<option value="${td.id}" ${td.id===selTender?'selected':''}>[${td.tenderNumber}] ${td.tenderTitle}</option>`).join('')}
            </select></div>
          </div>
          <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Committee Name *</label><input type="text" id="tf-name" class="form-control" value="${v('committeeName')}" required></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Formation Date</label><input type="date" id="tf-form" class="form-control" value="${dateVal('formationDate')}"></div>
            <div class="form-group"><label class="form-label">Order Number</label><input type="text" id="tf-order" class="form-control" value="${v('orderNumber')}"></div>
          </div>
          <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Description</label><textarea id="tf-desc" class="form-control">${v('description')}</textarea></div>
          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Evaluation</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Eval Start Date</label><input type="date" id="tf-evs" class="form-control" value="${dateVal('evalStartDate')}"></div>
            <div class="form-group"><label class="form-label">Eval End Date</label><input type="date" id="tf-eve" class="form-control" value="${dateVal('evalEndDate')}"></div>
            <div class="form-group"><label class="form-label">Status</label><select id="tf-status" class="form-control">
              ${['Draft','Constituted','Evaluation In Progress','Evaluation Completed','Recommendation Submitted','Approved','Closed','Cancelled'].map(s=>`<option value="${s}" ${v('status')===s?'selected':''}>${s}</option>`).join('')}
            </select></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Recommendation</label><select id="tf-rec" class="form-control">
              <option value="">— Select —</option>
              ${['Recommended','Not Recommended','Recommended with Conditions','Pending'].map(s=>`<option value="${s}" ${v('recommendation')===s?'selected':''}>${s}</option>`).join('')}
            </select></div>
            <div class="form-group"><label class="form-label">Remarks</label><input type="text" id="tf-rem" class="form-control" value="${v('remarks')}"></div>
          </div>
          <button type="submit" class="btn btn-primary" id="tf-btn">${id ? 'Save Changes' : '+ Create TEC'}</button>
        </form>
      </div>`;
  },

  async submitTecForm(e, id) {
    e.preventDefault();
    const errBox = document.getElementById('p3-tec-errs'); errBox.style.display = 'none';
    const btn = document.getElementById('tf-btn'); btn.disabled = true;

    const payload = {
      tecReference: document.getElementById('tf-ref').value, tenderId: document.getElementById('tf-tender').value,
      committeeName: document.getElementById('tf-name').value, formationDate: document.getElementById('tf-form').value,
      orderNumber: document.getElementById('tf-order').value, description: document.getElementById('tf-desc').value,
      evalStartDate: document.getElementById('tf-evs').value, evalEndDate: document.getElementById('tf-eve').value,
      status: document.getElementById('tf-status').value, recommendation: document.getElementById('tf-rec').value,
      remarks: document.getElementById('tf-rem').value,
    };

    try {
      const r = await this.apiFetch(id ? `/api/tecs/${id}` : '/api/tecs', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      const data = await r.json();
      if (!r.ok) {
        errBox.innerHTML = (data.errors || [data.error || 'Error']).map(m => `• ${m}`).join('<br>');
        errBox.style.display = 'block'; btn.disabled = false; return;
      }
      this.showToast(id ? 'TEC updated.' : 'TEC created.');
      this.renderTecDetail(data.id);
    } catch (err) { errBox.innerHTML = '• Network error.'; errBox.style.display = 'block'; btn.disabled = false; }
  },

  async addTecMember(e, tecId) {
    e.preventDefault();
    const payload = {
      name: document.getElementById('tm-name').value, designation: document.getElementById('tm-desig').value,
      department: document.getElementById('tm-dept').value, role: document.getElementById('tm-role').value
    };
    const r = await this.apiFetch(`/api/tecs/${tecId}/members`, { method: 'POST', body: JSON.stringify(payload) });
    if (r.ok) { this.showToast('Member added.'); this.renderTecDetail(tecId); }
    else { this.showToast('Failed to add member.', 'error'); }
  },

  async removeTecMember(tecId, memberId) {
    const r = await this.apiFetch(`/api/tecs/${tecId}/members/${memberId}`, { method: 'DELETE' });
    if (r.ok) { this.showToast('Member removed.'); this.renderTecDetail(tecId); }
    else { this.showToast('Failed to remove member.', 'error'); }
  },

  // ─── CONTRACT LIST ─────────────────────────────────────────────────────────

  async renderContractsList(container) {
    const s = this.contractsState;
    let data = { data: [], total: 0, pages: 1 };
    try {
      const params = new URLSearchParams({ page: s.page, limit: 20, q: s.q, status: s.status });
      const r = await this.apiFetch(`/api/contracts?${params}`);
      if (r.ok) data = await r.json();
    } catch (_) {}

    const rows = data.data.length ? data.data.map(c => `
      <tr>
        <td><code>${c.contractNumber}</code></td>
        <td><a href="#" onclick="Phase2.renderTenderDetail('${c.tender?.id}')">${c.tender?.tenderNumber || '—'}</a></td>
        <td><a href="#" onclick="Phase2.renderProjectDetail('${c.tender?.project?.id}')">${c.tender?.project?.projectCode || '—'}</a></td>
        <td><strong>${c.contractorName}</strong></td>
        <td>${this.fmtCurrency(c.contractAmount)}</td>
        <td>${this.fmtDate(c.awardDate)}</td>
        <td>${this.statusBadge(c.status)}</td>
        <td style="white-space:nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="Phase3.renderContractDetail('${c.id}')">👁 View</button>
          <button class="btn btn-secondary btn-sm" onclick="Phase3.renderContractForm('${c.id}')" style="margin-left:4px;">✏️ Edit</button>
        </td>
      </tr>`).join('') : `<tr><td colspan="8" style="text-align:center;padding:40px;color:#64748b;">No contracts found. <a href="#" onclick="Phase3.renderContractForm()">Create Contract</a></td></tr>`;

    const paginationBtns = Array.from({ length: data.pages }, (_, i) => i + 1).map(pg =>
      `<button class="btn btn-sm ${pg === s.page ? 'btn-primary' : 'btn-secondary'}" onclick="Phase3.contractsState.page=${pg};Phase3.renderContractsList(document.getElementById('main-content'))">${pg}</button>`
    ).join(' ');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>📜 Contracts</h2><p>${data.total} record(s) found.</p></div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="Phase3.renderContractForm()">+ New Contract</button>
        </div>
      </div>
      <div class="table-card" style="margin-bottom:16px;">
        <div style="padding:14px 16px;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
          <div><label class="form-label" style="font-size:11px;margin-bottom:4px;">Search</label>
          <input id="p3-c-search" type="text" class="form-control" placeholder="Number, Contractor..." style="width:200px;" value="${s.q}" onkeydown="if(event.key==='Enter'){Phase3.contractsState.q=this.value;Phase3.contractsState.page=1;Phase3.renderContractsList(document.getElementById('main-content'))}"></div>
          <div><label class="form-label" style="font-size:11px;margin-bottom:4px;">Status</label>
          <select id="p3-c-status" class="form-control" style="width:140px;" onchange="Phase3.contractsState.status=this.value;Phase3.contractsState.page=1;Phase3.renderContractsList(document.getElementById('main-content'))">
            <option value="">All Statuses</option>
            ${['Draft','Awarded','Active','Suspended','Completed','Terminated','Closed'].map(st=>`<option value="${st}" ${st===s.status?'selected':''}>${st}</option>`).join('')}
          </select></div>
          <div style="margin-top:auto;"><button class="btn btn-secondary btn-sm" onclick="Phase3.contractsState={page:1,q:'',status:''};Phase3.renderContractsList(document.getElementById('main-content'))">Clear</button>
          <button class="btn btn-primary btn-sm" style="margin-left:6px;" onclick="Phase3.contractsState.q=document.getElementById('p3-c-search').value;Phase3.contractsState.page=1;Phase3.renderContractsList(document.getElementById('main-content'))">Search</button></div>
        </div>
      </div>
      <div class="table-card"><table class="data-table"><thead><tr><th>Contract No.</th><th>Tender</th><th>Project</th><th>Contractor</th><th>Amount</th><th>Award Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
      <div style="padding:12px 16px;display:flex;gap:6px;align-items:center;justify-content:space-between;"><span style="font-size:12px;color:#64748b;">Page ${s.page} of ${data.pages}</span><div style="display:flex;gap:4px;">${paginationBtns}</div></div></div>`;
  },

  // ─── CONTRACT DETAIL ───────────────────────────────────────────────────────

  async renderContractDetail(id) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';
    try {
      const r = await this.apiFetch(`/api/contracts/${id}`);
      if (!r.ok) { container.innerHTML = '<div style="padding:40px;color:red;">Contract not found.</div>'; return; }
      const c = await r.json();

      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-text"><h2>📜 ${c.contractNumber}</h2><p>${c.contractTitle} &nbsp; ${this.statusBadge(c.status)}</p></div>
          <div class="page-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.navigate('contracts')">← Contracts</button>
            <button class="btn btn-secondary btn-sm" onclick="Phase2.renderTenderDetail('${c.tender?.id}')" style="margin-left:6px;">📑 ${c.tender?.tenderNumber || 'Tender'}</button>
            <button class="btn btn-primary btn-sm" onclick="Phase3.renderContractForm('${c.id}')" style="margin-left:6px;">✏️ Edit Contract</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Contractor Information</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Contractor',c.contractorName],['ID/Reg No',c.contractorIdNumber],['Address',c.contractorAddress]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
            <h4 style="color:#0b2545;margin-top:20px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Financial</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Contract Amount',this.fmtCurrency(c.contractAmount)],['Perf. Security',this.fmtCurrency(c.performanceSecurity)],['Payment Terms',c.paymentTerms],['Funding',c.fundingSource]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
          </div>
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Timeline</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${[['Award Date',this.fmtDate(c.awardDate)],['Agreement Date',this.fmtDate(c.agreementDate)],['Start Date',this.fmtDate(c.startDate)],['End Date',this.fmtDate(c.endDate)],['Duration',c.contractDuration]].map(([k,v])=>`<tr><td style="padding:5px 0;color:#64748b;width:45%;">${k}</td><td style="padding:5px 0;font-weight:500;">${this.fmt(v)}</td></tr>`).join('')}
            </table>
            <h4 style="color:#0b2545;margin-top:20px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Reference</h4>
            <p><strong>Tender:</strong> <a href="#" onclick="Phase2.renderTenderDetail('${c.tender?.id}')">${c.tender?.tenderNumber}</a></p>
            <p><strong>Project:</strong> <a href="#" onclick="Phase2.renderProjectDetail('${c.tender?.project?.id}')">${c.tender?.project?.projectCode}</a></p>
          </div>
        </div>
        <div id="monitoring-container-contract"></div>
        <div id="docs-container-contract"></div>`;
      if (window.Phase5) Phase5.renderWidget('monitoring-container-contract', 'contract', c.id);
      if (window.Phase4) Phase4.renderWidget('docs-container-contract', 'contract', c.id);
    } catch (e) { container.innerHTML = '<div style="padding:40px;color:red;">Error loading Contract.</div>'; }
  },

  // ─── CONTRACT FORM ─────────────────────────────────────────────────────────

  async renderContractForm(id = null, presetTenderId = null) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';

    let c = null, tenders = [];
    try {
      const tr = await this.apiFetch('/api/tenders?limit=200');
      if (tr.ok) { const td = await tr.json(); tenders = td.data || []; }
      if (id) {
        const r = await this.apiFetch(`/api/contracts/${id}`);
        if (r.ok) c = await r.json();
      }
    } catch (_) {}

    const v = (f) => c?.[f] ?? '';
    const dateVal = (f) => c?.[f] ? c[f].substring(0, 10) : '';
    const selTender = presetTenderId || v('tenderId');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>${id ? '✏️ Edit Contract' : '+ Create Contract'}</h2></div>
        <div class="page-actions"><button class="btn btn-secondary btn-sm" onclick="App.navigate('contracts')">← Back</button></div>
      </div>
      <div class="table-card" style="padding:24px;">
        <div id="p3-c-errs" style="display:none;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:12px 16px;margin-bottom:16px;color:#b91c1c;"></div>
        <form onsubmit="Phase3.submitContractForm(event,'${id || ''}')">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Contract Number *</label><input type="text" id="cf-num" class="form-control" value="${v('contractNumber')}" required></div>
            <div class="form-group"><label class="form-label">Tender *</label><select id="cf-tender" class="form-control" required>
              <option value="">— Select Tender —</option>
              ${tenders.map(td=>`<option value="${td.id}" ${td.id===selTender?'selected':''}>[${td.tenderNumber}] ${td.tenderTitle}</option>`).join('')}
            </select></div>
          </div>
          <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Contract Title</label><input type="text" id="cf-title" class="form-control" value="${v('contractTitle')}"></div>
          
          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Contractor Details</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Contractor Name *</label><input type="text" id="cf-cname" class="form-control" value="${v('contractorName')}" required></div>
            <div class="form-group"><label class="form-label">ID / Reg Number</label><input type="text" id="cf-cid" class="form-control" value="${v('contractorIdNumber')}"></div>
          </div>
          <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Contractor Address</label><textarea id="cf-caddr" class="form-control" rows="2">${v('contractorAddress')}</textarea></div>

          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Financial Details</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Contract Amount (₹)</label><input type="number" id="cf-amt" class="form-control" value="${v('contractAmount')}" step="0.01"></div>
            <div class="form-group"><label class="form-label">Perf. Security (₹)</label><input type="number" id="cf-perf" class="form-control" value="${v('performanceSecurity')}" step="0.01"></div>
            <div class="form-group"><label class="form-label">Funding Source</label><input type="text" id="cf-fund" class="form-control" value="${v('fundingSource')}"></div>
          </div>
          <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Payment Terms</label><input type="text" id="cf-pay" class="form-control" value="${v('paymentTerms')}"></div>

          <h4 style="color:#0b2545;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:16px;">Timeline & Status</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Award Date</label><input type="date" id="cf-awd" class="form-control" value="${dateVal('awardDate')}"></div>
            <div class="form-group"><label class="form-label">Start Date</label><input type="date" id="cf-start" class="form-control" value="${dateVal('startDate')}"></div>
            <div class="form-group"><label class="form-label">End Date</label><input type="date" id="cf-end" class="form-control" value="${dateVal('endDate')}"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div class="form-group"><label class="form-label">Status</label><select id="cf-status" class="form-control">
              ${['Draft','Awarded','Active','Suspended','Completed','Terminated','Closed'].map(s=>`<option value="${s}" ${v('status')===s?'selected':''}>${s}</option>`).join('')}
            </select></div>
            <div class="form-group"><label class="form-label">Contract Type</label><input type="text" id="cf-type" class="form-control" value="${v('contractType')}"></div>
          </div>

          <button type="submit" class="btn btn-primary" id="cf-btn">${id ? 'Save Changes' : '+ Create Contract'}</button>
        </form>
      </div>`;
  },

  async submitContractForm(e, id) {
    e.preventDefault();
    const errBox = document.getElementById('p3-c-errs'); errBox.style.display = 'none';
    const btn = document.getElementById('cf-btn'); btn.disabled = true;

    const payload = {
      contractNumber: document.getElementById('cf-num').value, tenderId: document.getElementById('cf-tender').value,
      contractTitle: document.getElementById('cf-title').value, contractType: document.getElementById('cf-type').value,
      contractorName: document.getElementById('cf-cname').value, contractorIdNumber: document.getElementById('cf-cid').value,
      contractorAddress: document.getElementById('cf-caddr').value, contractAmount: document.getElementById('cf-amt').value,
      performanceSecurity: document.getElementById('cf-perf').value, paymentTerms: document.getElementById('cf-pay').value,
      fundingSource: document.getElementById('cf-fund').value, awardDate: document.getElementById('cf-awd').value,
      startDate: document.getElementById('cf-start').value, endDate: document.getElementById('cf-end').value,
      status: document.getElementById('cf-status').value,
    };

    try {
      const r = await this.apiFetch(id ? `/api/contracts/${id}` : '/api/contracts', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      const data = await r.json();
      if (!r.ok) {
        errBox.innerHTML = (data.errors || [data.error || 'Error']).map(m => `• ${m}`).join('<br>');
        errBox.style.display = 'block'; btn.disabled = false; return;
      }
      this.showToast(id ? 'Contract updated.' : 'Contract created.');
      this.renderContractDetail(data.id);
    } catch (err) { errBox.innerHTML = '• Network error.'; errBox.style.display = 'block'; btn.disabled = false; }
  },
};

if (typeof window !== 'undefined') { window.Phase3 = Phase3; }
