const Phase6 = {
  fmtDate(d) { return !d ? '—' : new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); },
  
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

  async renderDashboard(container) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">Loading Dashboard...</div>';
    try {
      const r = await this.apiFetch('/api/dashboard');
      if (!r.ok) { container.innerHTML = '<div style="padding:40px;color:red;">Error loading dashboard data.</div>'; return; }
      const data = await r.json();
      
      const { kpis, upcomingMonitoring, recentActivity, overdueIssues } = data;

      const upcomingRows = upcomingMonitoring.map(m => `
        <div style="padding:12px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:600;color:#0b2545;">${m.referenceNumber} - ${m.monitoringType}</div>
            <div style="font-size:12px;color:#64748b;">Project: ${m.project?.projectCode || '—'}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px;color:#0ea5e9;font-weight:500;">${this.fmtDate(m.monitoringDate)}</div>
            <div style="font-size:11px;color:#64748b;">${m.location || '—'}</div>
          </div>
        </div>
      `).join('') || '<div style="padding:20px;text-align:center;color:#64748b;font-size:13px;">No upcoming monitoring scheduled.</div>';

      const activityRows = recentActivity.map(a => `
        <div style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">
          <div style="font-size:13px;color:#0b2545;">${a.details}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">${this.fmtDate(a.timestamp)} by ${a.user?.username}</div>
        </div>
      `).join('') || '<div style="padding:20px;text-align:center;color:#64748b;font-size:13px;">No recent activity.</div>';

      const overdueRows = overdueIssues.map(i => `
        <div style="padding:10px 12px;border-bottom:1px solid #e2e8f0;border-left:3px solid #ef4444;background:#fef2f2;margin-bottom:8px;border-radius:4px;">
          <div style="font-size:13px;color:#b91c1c;font-weight:600;">Issue ${i.issueNumber}</div>
          <div style="font-size:12px;color:#7f1d1d;margin-top:2px;">${i.description}</div>
          <div style="font-size:11px;color:#dc2626;margin-top:6px;">Target: ${this.fmtDate(i.targetDate)} | Ref: ${i.monitoring?.referenceNumber}</div>
        </div>
      `).join('') || '<div style="padding:20px;text-align:center;color:#10b981;font-size:13px;">✅ No overdue issues!</div>';

      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-text">
            <h2>📊 Executive Dashboard</h2>
            <p>System overview and key performance indicators</p>
          </div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px;margin-bottom:20px;">
          <div class="table-card" style="padding:20px;text-align:center;border-top:4px solid #3b82f6;">
            <div style="font-size:12px;text-transform:uppercase;color:#64748b;font-weight:600;letter-spacing:0.5px;">Total Projects</div>
            <div style="font-size:32px;font-weight:700;color:#0b2545;margin:8px 0;">${kpis.projects.total}</div>
            <div style="font-size:13px;color:#10b981;">${kpis.projects.active} Active</div>
          </div>
          
          <div class="table-card" style="padding:20px;text-align:center;border-top:4px solid #8b5cf6;">
            <div style="font-size:12px;text-transform:uppercase;color:#64748b;font-weight:600;letter-spacing:0.5px;">Active Tenders</div>
            <div style="font-size:32px;font-weight:700;color:#0b2545;margin:8px 0;">${kpis.tenders.active}</div>
            <div style="font-size:13px;color:#64748b;">of ${kpis.tenders.total} Total</div>
          </div>
          
          <div class="table-card" style="padding:20px;text-align:center;border-top:4px solid #10b981;">
            <div style="font-size:12px;text-transform:uppercase;color:#64748b;font-weight:600;letter-spacing:0.5px;">Total Contracts</div>
            <div style="font-size:32px;font-weight:700;color:#0b2545;margin:8px 0;">${kpis.contracts.total}</div>
            <div style="font-size:13px;color:#64748b;">${kpis.tecs.total} TECs Evaluated</div>
          </div>

          <div class="table-card" style="padding:20px;text-align:center;border-top:4px solid #f59e0b;">
            <div style="font-size:12px;text-transform:uppercase;color:#64748b;font-weight:600;letter-spacing:0.5px;">Open Issues</div>
            <div style="font-size:32px;font-weight:700;color:#b91c1c;margin:8px 0;">${kpis.monitoring.openIssues}</div>
            <div style="font-size:13px;color:#d97706;">${kpis.monitoring.pendingActions} Pending Actions</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;">
          
          <div>
            <div class="table-card" style="margin-bottom:20px;">
              <div class="table-toolbar" style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <div class="table-title"><h3 style="margin:0;">📅 Upcoming Monitoring</h3></div>
              </div>
              <div style="padding:8px;">${upcomingRows}</div>
            </div>

            <div class="table-card">
              <div class="table-toolbar" style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <div class="table-title"><h3 style="margin:0;color:#dc2626;">⚠️ Overdue Items</h3></div>
              </div>
              <div style="padding:12px;">${overdueRows}</div>
            </div>
          </div>

          <div>
            <div class="table-card" style="height:100%;">
              <div class="table-toolbar" style="padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                <div class="table-title"><h3 style="margin:0;">🕒 Recent Activity</h3></div>
              </div>
              <div style="padding:8px;">${activityRows}</div>
            </div>
          </div>

        </div>
      `;
    } catch (e) {
      container.innerHTML = '<div style="padding:40px;color:red;">Error rendering dashboard.</div>';
    }
  }
};

if (typeof window !== 'undefined') { window.Phase6 = Phase6; }
