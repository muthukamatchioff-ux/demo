const Phase8 = {
  fmtDate(d) { return !d ? '—' : new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); },

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

  async renderAuditViewer(container, page = 1) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading Audit Logs...</div>';
    
    // Attempt to load logs
    const r = await this.apiFetch(`/api/audit?page=${page}&limit=50`);
    
    if (r.status === 403) {
      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-text">
            <h2>🛡️ System Audit Trail</h2>
          </div>
        </div>
        <div style="padding:40px;text-align:center;background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;color:#b91c1c;margin-top:20px;">
          <h3>Access Denied</h3>
          <p>You do not have the required administrative permissions to view system audit logs.</p>
        </div>
      `;
      return;
    }
    
    if (!r.ok) {
      container.innerHTML = '<div style="padding:40px;color:red;">Error loading audit logs.</div>';
      return;
    }

    const data = await r.json();

    const rows = data.data.map(log => `
      <tr>
        <td style="font-family:monospace;font-size:11px;color:#64748b;">${this.fmtDate(log.timestamp)}</td>
        <td><strong>${log.user?.username || 'System'}</strong><br><small style="color:#64748b;">${log.user?.email || ''}</small></td>
        <td>
          <span class="badge ${log.action === 'DELETE' ? 'badge-danger' : (log.action === 'CREATE' ? 'badge-success' : 'badge-info')}">${log.action}</span>
        </td>
        <td><span class="badge badge-outline">${log.module}</span></td>
        <td style="font-family:monospace;font-size:11px;">${log.recordId || '—'}</td>
        <td><small>${log.details}</small></td>
        <td style="font-family:monospace;font-size:11px;">${log.ipAddress || '—'}</td>
      </tr>
    `).join('') || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#64748b;">No audit records found.</td></tr>';

    const pagination = `
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid #e2e8f0;margin-top:16px;">
        <span style="font-size:13px;color:#64748b;">Showing page ${data.page} of ${data.pages} (Total: ${data.total} records)</span>
        <div>
          <button class="btn btn-secondary btn-sm" ${data.page <= 1 ? 'disabled' : ''} onclick="Phase8.renderAuditViewer(document.getElementById('main-content'), ${data.page - 1})">Previous</button>
          <button class="btn btn-secondary btn-sm" ${data.page >= data.pages ? 'disabled' : ''} onclick="Phase8.renderAuditViewer(document.getElementById('main-content'), ${data.page + 1})">Next</button>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text">
          <h2>🛡️ System Audit Trail</h2>
          <p>Immutable, non-repudiable record of system events</p>
        </div>
      </div>

      <div class="table-card" style="padding:20px;margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h4 style="margin:0;color:#0b2545;">Security & Operational Events</h4>
        </div>
        
        <div style="overflow-x:auto;">
          <table class="data-table" style="width:100%;min-width:1000px;">
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Module</th>
                <th>Target Record ID</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        ${pagination}
      </div>
    `;
  }
};

if (typeof window !== 'undefined') { window.Phase8 = Phase8; }
