const Phase4 = {
  docsState: { page: 1, q: '', projectId: '', tenderId: '', tecId: '', contractId: '' },

  fmtDate(d) { return !d ? '—' : new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); },
  fmtSize(bytes) {
    if (bytes === null || bytes === undefined) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
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

  // ─── DOCUMENT LIST (Central) ───────────────────────────────────────────────

  async renderDocumentsList(container) {
    const s = this.docsState;
    let data = { data: [], total: 0, pages: 1 };
    try {
      const params = new URLSearchParams({ page: s.page, limit: 20, q: s.q });
      const r = await this.apiFetch(`/api/documents?${params}`);
      if (r.ok) data = await r.json();
    } catch (_) {}

    const rows = data.data.length ? data.data.map(d => `
      <tr>
        <td><strong>${d.title}</strong><br><small style="color:#64748b;">${d.fileName}</small></td>
        <td>${d.category || '—'}<br><small style="color:#64748b;">${d.documentType || '—'}</small></td>
        <td>v${d.versionNumber}</td>
        <td>${this.fmtSize(d.fileSize)}</td>
        <td>${d.createdBy?.username || '—'}<br><small style="color:#64748b;">${this.fmtDate(d.createdAt)}</small></td>
        <td style="white-space:nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="Phase4.renderDocumentDetail('${d.id}')">👁 View</button>
          <a class="btn btn-primary btn-sm" style="margin-left:4px;" href="/api/documents/${d.id}/download" download>⬇️</a>
        </td>
      </tr>`).join('') : `<tr><td colspan="6" style="text-align:center;padding:40px;color:#64748b;">No documents found.</td></tr>`;

    const paginationBtns = Array.from({ length: data.pages }, (_, i) => i + 1).map(pg =>
      `<button class="btn btn-sm ${pg === s.page ? 'btn-primary' : 'btn-secondary'}" onclick="Phase4.docsState.page=${pg};Phase4.renderDocumentsList(document.getElementById('main-content'))">${pg}</button>`
    ).join(' ');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>📄 Document Repository</h2><p>${data.total} document(s) found.</p></div>
        <div class="page-actions">
          <button class="btn btn-primary btn-sm" onclick="Phase4.openUploadModal()">+ Upload Document</button>
        </div>
      </div>
      <div class="table-card" style="margin-bottom:16px;">
        <div style="padding:14px 16px;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
          <div><label class="form-label" style="font-size:11px;margin-bottom:4px;">Search</label>
          <input id="p4-doc-search" type="text" class="form-control" placeholder="Title, File name..." style="width:250px;" value="${s.q}" onkeydown="if(event.key==='Enter'){Phase4.docsState.q=this.value;Phase4.docsState.page=1;Phase4.renderDocumentsList(document.getElementById('main-content'))}"></div>
          <div style="margin-top:auto;"><button class="btn btn-secondary btn-sm" onclick="Phase4.docsState={page:1,q:''};Phase4.renderDocumentsList(document.getElementById('main-content'))">Clear</button>
          <button class="btn btn-primary btn-sm" style="margin-left:6px;" onclick="Phase4.docsState.q=document.getElementById('p4-doc-search').value;Phase4.docsState.page=1;Phase4.renderDocumentsList(document.getElementById('main-content'))">Search</button></div>
        </div>
      </div>
      <div class="table-card"><table class="data-table"><thead><tr><th>Document</th><th>Classification</th><th>Ver.</th><th>Size</th><th>Uploaded By</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
      <div style="padding:12px 16px;display:flex;gap:6px;align-items:center;justify-content:space-between;"><span style="font-size:12px;color:#64748b;">Page ${s.page} of ${data.pages}</span><div style="display:flex;gap:4px;">${paginationBtns}</div></div></div>
      ${this.getModalHTML()}
    `;
  },

  // ─── DOCUMENT DETAIL ───────────────────────────────────────────────────────

  async renderDocumentDetail(id) {
    const container = document.getElementById('main-content');
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading…</div>';
    try {
      const r = await this.apiFetch(`/api/documents/${id}`);
      if (!r.ok) { container.innerHTML = '<div style="padding:40px;color:red;">Document not found.</div>'; return; }
      const d = await r.json();

      const versionRows = d.versions?.length ? d.versions.map(v => `
        <tr>
          <td>v${v.versionNumber}</td>
          <td>${v.fileName}</td>
          <td>${this.fmtSize(v.fileSize)}</td>
          <td>${this.fmtDate(v.createdAt)}</td>
          <td>${v.createdBy?.username || '—'}</td>
          <td>${v.notes || '—'}</td>
        </tr>`).join('') : `<tr><td colspan="6" style="text-align:center;padding:20px;color:#64748b;">No versions available.</td></tr>`;

      let parentLink = '';
      if (d.projectId) parentLink += `<button class="btn btn-secondary btn-sm" onclick="Phase2.renderProjectDetail('${d.projectId}')">📂 View Project</button> `;
      if (d.tenderId)  parentLink += `<button class="btn btn-secondary btn-sm" onclick="Phase2.renderTenderDetail('${d.tenderId}')">📑 View Tender</button> `;
      if (d.tecId)     parentLink += `<button class="btn btn-secondary btn-sm" onclick="Phase3.renderTecDetail('${d.tecId}')">⚖️ View TEC</button> `;
      if (d.contractId) parentLink += `<button class="btn btn-secondary btn-sm" onclick="Phase3.renderContractDetail('${d.contractId}')">📜 View Contract</button> `;

      const isImage = d.mimeType?.startsWith('image/');
      let previewHtml = `<div style="padding:40px;background:#f8fafc;border:1px dashed #cbd5e1;text-align:center;color:#64748b;border-radius:6px;">Preview not available for this file type.<br><a href="/api/documents/${d.id}/download" download style="display:inline-block;margin-top:10px;font-weight:600;">Download File</a></div>`;
      if (isImage) {
        previewHtml = `<div style="text-align:center;padding:20px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:6px;"><img src="/api/documents/${d.id}/download" style="max-width:100%;max-height:400px;box-shadow:0 1px 3px rgba(0,0,0,0.1);border:1px solid #e2e8f0;"></div>`;
      }

      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-text"><h2>📄 ${d.title}</h2><p>${d.fileName} &nbsp; <span class="badge badge-info">v${d.versionNumber}</span></p></div>
          <div class="page-actions">
            <button class="btn btn-secondary btn-sm" onclick="Phase4.renderDocumentsList(document.getElementById('main-content'))">← Repository</button>
            <button class="btn btn-secondary btn-sm" onclick="Phase4.deleteDocument('${d.id}')" style="margin-left:6px;color:red;">🗑 Delete</button>
            <a class="btn btn-primary btn-sm" style="margin-left:6px;" href="/api/documents/${d.id}/download" download>⬇️ Download</a>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px;">
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Metadata</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
              <div><small style="color:#64748b;display:block;">Category</small><strong>${d.category || '—'}</strong></div>
              <div><small style="color:#64748b;display:block;">Document Type</small><strong>${d.documentType || '—'}</strong></div>
              <div><small style="color:#64748b;display:block;">File Size</small><strong>${this.fmtSize(d.fileSize)}</strong></div>
              <div><small style="color:#64748b;display:block;">MIME Type</small><strong>${d.mimeType || '—'}</strong></div>
              <div style="grid-column:1 / -1;"><small style="color:#64748b;display:block;">Description</small><strong>${d.description || '—'}</strong></div>
            </div>
            
            <h4 style="color:#0b2545;margin-top:20px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Preview</h4>
            ${previewHtml}
          </div>
          <div class="table-card" style="padding:20px;">
            <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Relationships</h4>
            ${parentLink ? `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">${parentLink}</div>` : '<p style="color:#64748b;font-size:13px;">Not linked to any parent record.</p>'}
            
            <h4 style="color:#0b2545;margin-top:20px;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">Administration</h4>
            <div style="font-size:13px;">
              <p style="margin:4px 0;"><span style="color:#64748b;display:inline-block;width:90px;">Uploaded By:</span> <strong>${d.createdBy?.username || '—'}</strong></p>
              <p style="margin:4px 0;"><span style="color:#64748b;display:inline-block;width:90px;">Upload Date:</span> <strong>${this.fmtDate(d.createdAt)}</strong></p>
              <p style="margin:4px 0;"><span style="color:#64748b;display:inline-block;width:90px;">Updated By:</span> <strong>${d.updatedBy?.username || '—'}</strong></p>
              <p style="margin:4px 0;"><span style="color:#64748b;display:inline-block;width:90px;">Last Update:</span> <strong>${this.fmtDate(d.updatedAt)}</strong></p>
            </div>
            <div style="margin-top:20px;">
              <button class="btn btn-primary btn-sm" style="width:100%;" onclick="Phase4.openVersionModal('${d.id}')">+ Upload New Version</button>
            </div>
          </div>
        </div>

        <div class="table-card" style="padding:20px;">
          <h4 style="color:#0b2545;margin-top:0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px;">Version History</h4>
          <table class="data-table">
            <thead><tr><th>Ver.</th><th>File Name</th><th>Size</th><th>Date</th><th>Uploaded By</th><th>Notes</th></tr></thead>
            <tbody>${versionRows}</tbody>
          </table>
        </div>
        ${this.getModalHTML()}
      `;
    } catch (e) { container.innerHTML = '<div style="padding:40px;color:red;">Error loading document.</div>'; }
  },

  async deleteDocument(id) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    const r = await this.apiFetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (r.ok) {
      this.showToast('Document deleted successfully.');
      this.renderDocumentsList(document.getElementById('main-content'));
    } else {
      this.showToast('Failed to delete document.', 'error');
    }
  },

  // ─── WIDGET (For Phase 1-3 injection) ──────────────────────────────────────

  async renderWidget(containerId, entityType, entityId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
      const q = new URLSearchParams();
      if (entityType === 'project') q.set('projectId', entityId);
      if (entityType === 'tender') q.set('tenderId', entityId);
      if (entityType === 'tec') q.set('tecId', entityId);
      if (entityType === 'contract') q.set('contractId', entityId);
      if (entityType === 'monitoring') q.set('monitoringId', entityId);
      q.set('limit', '50');

      const r = await this.apiFetch(`/api/documents?${q}`);
      let docs = [];
      if (r.ok) { const data = await r.json(); docs = data.data || []; }

      const rows = docs.length ? docs.map(d => `
        <tr>
          <td><a href="#" onclick="Phase4.renderDocumentDetail('${d.id}')"><strong>${d.title}</strong></a></td>
          <td>${d.category || '—'}<br><small style="color:#64748b;">${d.documentType || '—'}</small></td>
          <td>v${d.versionNumber}</td>
          <td style="white-space:nowrap;">
            <a class="btn btn-primary btn-sm" href="/api/documents/${d.id}/download" download>⬇️</a>
          </td>
        </tr>`).join('') : `<tr><td colspan="4" style="text-align:center;padding:20px;color:#64748b;">No documents attached.</td></tr>`;

      container.innerHTML = `
        <div class="table-card" style="padding:20px;margin-top:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px;">
            <h4 style="color:#0b2545;margin:0;">Documents</h4>
            <button class="btn btn-primary btn-sm" onclick="Phase4.openUploadModal('${entityType}', '${entityId}')">+ Attach Document</button>
          </div>
          <table class="data-table">
            <thead><tr><th>Document</th><th>Classification</th><th>Ver.</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${document.getElementById('p4-upload-modal') ? '' : this.getModalHTML()}
      `;
    } catch (e) {
      container.innerHTML = '<div style="padding:20px;color:red;">Error loading documents.</div>';
    }
  },

  // ─── UPLOAD MODAL ──────────────────────────────────────────────────────────

  getModalHTML() {
    return `
      <div id="p4-upload-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,0.6);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:#fff;width:500px;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.2);display:flex;flex-direction:column;max-height:90vh;">
          <div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
            <h3 id="p4-modal-title" style="margin:0;color:#0b2545;">Upload Document</h3>
            <button onclick="document.getElementById('p4-upload-modal').style.display='none'" style="background:none;border:none;font-size:20px;cursor:pointer;color:#64748b;">×</button>
          </div>
          <div style="padding:20px;overflow-y:auto;">
            <div id="p4-upload-errs" style="display:none;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:12px 16px;margin-bottom:16px;color:#b91c1c;"></div>
            
            <form id="p4-upload-form" onsubmit="Phase4.submitUpload(event)">
              <input type="hidden" id="p4-up-entity-type">
              <input type="hidden" id="p4-up-entity-id">
              <input type="hidden" id="p4-up-doc-id"> <!-- For versions -->
              
              <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label">Select File (Max 20MB) *</label>
                <input type="file" id="p4-up-file" class="form-control" style="padding-top:6px;" required>
              </div>
              
              <div id="p4-up-meta-fields">
                <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Document Title *</label><input type="text" id="p4-up-title" class="form-control"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                  <div class="form-group"><label class="form-label">Category</label><select id="p4-up-cat" class="form-control"><option value="">— Select —</option><option>Administrative</option><option>Tender</option><option>Technical</option><option>Financial</option><option>TEC</option><option>Contract</option><option>Approval</option><option>Correspondence</option><option>Drawings</option><option>Reports</option><option>Other</option></select></div>
                  <div class="form-group"><label class="form-label">Document Type</label><input type="text" id="p4-up-type" class="form-control" placeholder="e.g. BOQ"></div>
                </div>
                <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Description</label><textarea id="p4-up-desc" class="form-control" rows="2"></textarea></div>
              </div>
              
              <div id="p4-up-version-fields" style="display:none;">
                <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Version Notes</label><input type="text" id="p4-up-notes" class="form-control" placeholder="Reason for revision"></div>
              </div>
              
              <div style="text-align:right;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('p4-upload-modal').style.display='none'">Cancel</button>
                <button type="submit" class="btn btn-primary" id="p4-up-btn" style="margin-left:8px;">Upload</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  openUploadModal(entityType = '', entityId = '') {
    document.getElementById('p4-modal-title').textContent = 'Upload Document';
    document.getElementById('p4-upload-form').reset();
    document.getElementById('p4-upload-errs').style.display = 'none';
    document.getElementById('p4-up-entity-type').value = entityType;
    document.getElementById('p4-up-entity-id').value = entityId;
    document.getElementById('p4-up-doc-id').value = '';
    
    document.getElementById('p4-up-meta-fields').style.display = 'block';
    document.getElementById('p4-up-title').required = true;
    document.getElementById('p4-up-version-fields').style.display = 'none';
    
    document.getElementById('p4-upload-modal').style.display = 'flex';
  },

  openVersionModal(documentId) {
    document.getElementById('p4-modal-title').textContent = 'Upload New Version';
    document.getElementById('p4-upload-form').reset();
    document.getElementById('p4-upload-errs').style.display = 'none';
    document.getElementById('p4-up-entity-type').value = '';
    document.getElementById('p4-up-entity-id').value = '';
    document.getElementById('p4-up-doc-id').value = documentId;
    
    document.getElementById('p4-up-meta-fields').style.display = 'none';
    document.getElementById('p4-up-title').required = false;
    document.getElementById('p4-up-version-fields').style.display = 'block';
    
    document.getElementById('p4-upload-modal').style.display = 'flex';
  },

  async submitUpload(e) {
    e.preventDefault();
    const errBox = document.getElementById('p4-upload-errs'); errBox.style.display = 'none';
    const btn = document.getElementById('p4-up-btn'); btn.disabled = true; btn.textContent = 'Uploading...';

    const fileInput = document.getElementById('p4-up-file');
    if (!fileInput.files.length) { errBox.textContent = 'Please select a file.'; errBox.style.display = 'block'; btn.disabled = false; return; }
    
    const file = fileInput.files[0];
    if (file.size > 20 * 1024 * 1024) { errBox.textContent = 'File exceeds 20MB limit.'; errBox.style.display = 'block'; btn.disabled = false; btn.textContent = 'Upload'; return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Str = ev.target.result.split(',')[1];
      const extension = file.name.substring(file.name.lastIndexOf('.'));
      
      const isVersion = !!document.getElementById('p4-up-doc-id').value;
      const url = isVersion ? `/api/documents/${document.getElementById('p4-up-doc-id').value}/versions` : '/api/documents';
      
      const payload = isVersion ? {
        fileName: file.name, fileExtension: extension, mimeType: file.type,
        fileData: base64Str, notes: document.getElementById('p4-up-notes').value
      } : {
        title: document.getElementById('p4-up-title').value,
        category: document.getElementById('p4-up-cat').value,
        documentType: document.getElementById('p4-up-type').value,
        description: document.getElementById('p4-up-desc').value,
        fileName: file.name, fileExtension: extension, mimeType: file.type, fileData: base64Str,
        projectId: document.getElementById('p4-up-entity-type').value === 'project' ? document.getElementById('p4-up-entity-id').value : undefined,
        tenderId: document.getElementById('p4-up-entity-type').value === 'tender' ? document.getElementById('p4-up-entity-id').value : undefined,
        tecId: document.getElementById('p4-up-entity-type').value === 'tec' ? document.getElementById('p4-up-entity-id').value : undefined,
        contractId: document.getElementById('p4-up-entity-type').value === 'contract' ? document.getElementById('p4-up-entity-id').value : undefined,
        monitoringId: document.getElementById('p4-up-entity-type').value === 'monitoring' ? document.getElementById('p4-up-entity-id').value : undefined,
      };

      try {
        const r = await this.apiFetch(url, { method: 'POST', body: JSON.stringify(payload) });
        const data = await r.json();
        if (!r.ok) {
          errBox.innerHTML = (data.errors || [data.error || 'Error']).map(m => `• ${m}`).join('<br>');
          errBox.style.display = 'block'; btn.disabled = false; btn.textContent = 'Upload'; return;
        }
        
        document.getElementById('p4-upload-modal').style.display = 'none';
        this.showToast(isVersion ? 'New version uploaded successfully.' : 'Document uploaded successfully.');
        
        if (isVersion) this.renderDocumentDetail(data.id);
        else {
          const eType = document.getElementById('p4-up-entity-type').value;
          if (eType) this.renderWidget(`docs-container-${eType}`, eType, document.getElementById('p4-up-entity-id').value);
          else this.renderDocumentsList(document.getElementById('main-content'));
        }
      } catch (err) {
        errBox.innerHTML = '• Network error.'; errBox.style.display = 'block';
        btn.disabled = false; btn.textContent = 'Upload';
      }
    };
    reader.onerror = () => { errBox.textContent = 'Error reading file.'; errBox.style.display = 'block'; btn.disabled = false; btn.textContent = 'Upload'; };
    reader.readAsDataURL(file);
  }
};

if (typeof window !== 'undefined') { window.Phase4 = Phase4; }
