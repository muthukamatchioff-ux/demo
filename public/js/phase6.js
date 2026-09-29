const Phase6 = {

  fmtDate(d) {
    if (!d) return '—';

    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  async apiFetch(url, opts = {}) {

    try {

      // --------------------------------------------------
      // Add active project ID automatically
      // --------------------------------------------------
      if (
        typeof App !== 'undefined' &&
        App &&
        App.activeProjectId
      ) {

        if (!url.includes('projectId=')) {

          url +=
            (url.includes('?') ? '&' : '?') +
            'projectId=' +
            encodeURIComponent(App.activeProjectId);
        }

        if (
          opts.body &&
          typeof opts.body === 'string'
        ) {

          try {

            const body = JSON.parse(opts.body);

            if (!body.projectId) {

              body.projectId =
                App.activeProjectId;

              opts.body =
                JSON.stringify(body);
            }

          } catch (e) {

            console.warn(
              'Could not parse request body as JSON.'
            );

          }
        }
      }

      // --------------------------------------------------
      // API Request
      // --------------------------------------------------
      const response = await fetch(url, {

        ...opts,

        headers: {
          'Content-Type': 'application/json',
          ...(opts.headers || {})
        }

      });

      // --------------------------------------------------
      // Authentication
      // --------------------------------------------------
      if (response.status === 401) {

        window.location.href =
          '/login.html';

        return response;
      }

      return response;

    } catch (error) {

      console.error(
        'API Fetch Error:',
        error
      );

      throw error;
    }
  },

  async renderDashboard(container) {

    // --------------------------------------------------
    // Loading
    // --------------------------------------------------
    container.innerHTML = `
      <div style="
        padding:40px;
        text-align:center;
        color:#64748b;
      ">
        Loading Dashboard...
      </div>
    `;

    try {

      // --------------------------------------------------
      // Load Dashboard API
      // --------------------------------------------------
      const response =
        await this.apiFetch('/api/dashboard');

      // --------------------------------------------------
      // API Error
      // --------------------------------------------------
      if (!response.ok) {

        const errorText =
          await response.text();

        console.error(
          'Dashboard API Error:',
          {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          }
        );

        container.innerHTML = `
          <div style="
            margin:30px;
            padding:25px;
            background:#fef2f2;
            border:1px solid #fecaca;
            border-radius:8px;
            color:#991b1b;
          ">

            <h3 style="
              margin-top:0;
            ">
              Dashboard API Error
            </h3>

            <p>
              <strong>Status:</strong>
              ${response.status}
              ${
                response.statusText
                  ? ` - ${response.statusText}`
                  : ''
              }
            </p>

            <p>
              <strong>API Response:</strong>
            </p>

            <pre style="
              background:#fff;
              padding:15px;
              border:1px solid #e5e7eb;
              border-radius:6px;
              white-space:pre-wrap;
              overflow:auto;
              text-align:left;
            ">${errorText || 'No error message returned by server.'}</pre>

          </div>
        `;

        return;
      }

      // --------------------------------------------------
      // Parse API response
      // --------------------------------------------------
      const data =
        await response.json();

      const kpis =
        data?.kpis || {};

      const upcomingMonitoring =
        Array.isArray(data?.upcomingMonitoring)
          ? data.upcomingMonitoring
          : [];

      const recentActivity =
        Array.isArray(data?.recentActivity)
          ? data.recentActivity
          : [];

      const overdueIssues =
        Array.isArray(data?.overdueIssues)
          ? data.overdueIssues
          : [];

      // --------------------------------------------------
      // KPI objects
      // --------------------------------------------------
      const projects =
        kpis.projects || {};

      const tenders =
        kpis.tenders || {};

      const contracts =
        kpis.contracts || {};

      const tecs =
        kpis.tecs || {};

      const monitoring =
        kpis.monitoring || {};

      // --------------------------------------------------
      // Upcoming Monitoring
      // --------------------------------------------------
      const upcomingRows =
        upcomingMonitoring
          .map(m => `

            <div style="
              padding:12px;
              border-bottom:1px solid #e2e8f0;
              display:flex;
              justify-content:space-between;
              align-items:center;
            ">

              <div>

                <div style="
                  font-weight:600;
                  color:#0b2545;
                ">
                  ${m.referenceNumber || '—'}
                  -
                  ${m.monitoringType || '—'}
                </div>

                <div style="
                  font-size:12px;
                  color:#64748b;
                ">
                  Project:
                  ${m.project?.projectCode || '—'}
                </div>

              </div>

              <div style="
                text-align:right;
              ">

                <div style="
                  font-size:13px;
                  color:#0ea5e9;
                  font-weight:500;
                ">
                  ${this.fmtDate(
                    m.monitoringDate
                  )}
                </div>

                <div style="
                  font-size:11px;
                  color:#64748b;
                ">
                  ${m.location || '—'}
                </div>

              </div>

            </div>

          `)
          .join('')
          ||
          `
            <div style="
              padding:20px;
              text-align:center;
              color:#64748b;
              font-size:13px;
            ">
              No upcoming monitoring scheduled.
            </div>
          `;

      // --------------------------------------------------
      // Recent Activity
      // --------------------------------------------------
      const activityRows =
        recentActivity
          .map(a => `

            <div style="
              padding:10px 12px;
              border-bottom:1px solid #e2e8f0;
            ">

              <div style="
                font-size:13px;
                color:#0b2545;
              ">
                ${a.details || '—'}
              </div>

              <div style="
                font-size:11px;
                color:#64748b;
                margin-top:4px;
              ">
                ${this.fmtDate(
                  a.timestamp
                )}
                by
                ${a.user?.username || 'System'}
              </div>

            </div>

          `)
          .join('')
          ||
          `
            <div style="
              padding:20px;
              text-align:center;
              color:#64748b;
              font-size:13px;
            ">
              No recent activity.
            </div>
          `;

      // --------------------------------------------------
      // Overdue Issues
      // --------------------------------------------------
      const overdueRows =
        overdueIssues
          .map(i => `

            <div style="
              padding:10px 12px;
              border-bottom:1px solid #e2e8f0;
              border-left:3px solid #ef4444;
              background:#fef2f2;
              margin-bottom:8px;
              border-radius:4px;
            ">

              <div style="
                font-size:13px;
                color:#b91c1c;
                font-weight:600;
              ">
                Issue ${i.issueNumber || '—'}
              </div>

              <div style="
                font-size:12px;
                color:#7f1d1d;
                margin-top:2px;
              ">
                ${i.description || '—'}
              </div>

              <div style="
                font-size:11px;
                color:#dc2626;
                margin-top:6px;
              ">
                Target:
                ${this.fmtDate(i.targetDate)}
                |
                Ref:
                ${i.monitoring?.referenceNumber || '—'}
              </div>

            </div>

          `)
          .join('')
          ||
          `
            <div style="
              padding:20px;
              text-align:center;
              color:#10b981;
              font-size:13px;
            ">
              No overdue issues.
            </div>
          `;

      // --------------------------------------------------
      // Dashboard HTML
      // --------------------------------------------------
      container.innerHTML = `

        <div class="page-header">

          <div class="page-header-text">

            <h2>
              Executive Dashboard
            </h2>

            <p>
              System overview and key performance indicators
            </p>

          </div>

        </div>

        <!-- KPI CARDS -->

        <div style="
          display:grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap:16px;
          margin-bottom:20px;
        ">

          <!-- PROJECTS -->

          <div class="table-card" style="
            padding:20px;
            text-align:center;
            border-top:4px solid #3b82f6;
          ">

            <div style="
              font-size:12px;
              text-transform:uppercase;
              color:#64748b;
              font-weight:600;
              letter-spacing:.5px;
            ">
              Total Projects
            </div>

            <div style="
              font-size:32px;
              font-weight:700;
              color:#0b2545;
              margin:8px 0;
            ">
              ${projects.total ?? 0}
            </div>

            <div style="
              font-size:13px;
              color:#10b981;
            ">
              ${projects.active ?? 0}
              Active
            </div>

          </div>

          <!-- TENDERS -->

          <div class="table-card" style="
            padding:20px;
            text-align:center;
            border-top:4px solid #8b5cf6;
          ">

            <div style="
              font-size:12px;
              text-transform:uppercase;
              color:#64748b;
              font-weight:600;
              letter-spacing:.5px;
            ">
              Active Tenders
            </div>

            <div style="
              font-size:32px;
              font-weight:700;
              color:#0b2545;
              margin:8px 0;
            ">
              ${tenders.active ?? 0}
            </div>

            <div style="
              font-size:13px;
              color:#64748b;
            ">
              of ${tenders.total ?? 0}
              Total
            </div>

          </div>

          <!-- CONTRACTS -->

          <div class="table-card" style="
            padding:20px;
            text-align:center;
            border-top:4px solid #10b981;
          ">

            <div style="
              font-size:12px;
              text-transform:uppercase;
              color:#64748b;
              font-weight:600;
              letter-spacing:.5px;
            ">
              Total Contracts
            </div>

            <div style="
              font-size:32px;
              font-weight:700;
              color:#0b2545;
              margin:8px 0;
            ">
              ${contracts.total ?? 0}
            </div>

            <div style="
              font-size:13px;
              color:#64748b;
            ">
              ${tecs.total ?? 0}
              TECs Evaluated
            </div>

          </div>

          <!-- ISSUES -->

          <div class="table-card" style="
            padding:20px;
            text-align:center;
            border-top:4px solid #f59e0b;
          ">

            <div style="
              font-size:12px;
              text-transform:uppercase;
              color:#64748b;
              font-weight:600;
              letter-spacing:.5px;
            ">
              Open Issues
            </div>

            <div style="
              font-size:32px;
              font-weight:700;
              color:#b91c1c;
              margin:8px 0;
            ">
              ${monitoring.openIssues ?? 0}
            </div>

            <div style="
              font-size:13px;
              color:#d97706;
            ">
              ${monitoring.pendingActions ?? 0}
              Pending Actions
            </div>

          </div>

        </div>

        <!-- MAIN CONTENT -->

        <div style="
          display:grid;
          grid-template-columns:
            minmax(0, 2fr)
            minmax(280px, 1fr);
          gap:20px;
        ">

          <div>

            <!-- UPCOMING MONITORING -->

            <div class="table-card"
                 style="margin-bottom:20px;">

              <div class="table-toolbar" style="
                padding:16px 20px;
                border-bottom:
                  1px solid #e2e8f0;
              ">

                <div class="table-title">

                  <h3 style="margin:0;">
                    Upcoming Monitoring
                  </h3>

                </div>

              </div>

              <div style="padding:8px;">
                ${upcomingRows}
              </div>

            </div>

            <!-- OVERDUE -->

            <div class="table-card">

              <div class="table-toolbar" style="
                padding:16px 20px;
                border-bottom:
                  1px solid #e2e8f0;
              ">

                <div class="table-title">

                  <h3 style="
                    margin:0;
                    color:#dc2626;
                  ">
                    Overdue Items
                  </h3>

                </div>

              </div>

              <div style="padding:12px;">
                ${overdueRows}
              </div>

            </div>

          </div>

          <!-- RECENT ACTIVITY -->

          <div>

            <div class="table-card">

              <div class="table-toolbar" style="
                padding:16px 20px;
                border-bottom:
                  1px solid #e2e8f0;
              ">

                <div class="table-title">

                  <h3 style="margin:0;">
                    Recent Activity
                  </h3>

                </div>

              </div>

              <div style="padding:8px;">
                ${activityRows}
              </div>

            </div>

          </div>

        </div>

      `;

    } catch (error) {

      console.error(
        'Dashboard rendering error:',
        error
      );

      container.innerHTML = `

        <div style="
          margin:30px;
          padding:25px;
          color:#991b1b;
          background:#fef2f2;
          border:1px solid #fecaca;
          border-radius:8px;
        ">

          <h3 style="
            margin-top:0;
          ">
            Error rendering dashboard
          </h3>

          <p>
            The dashboard could not be rendered.
          </p>

          <pre style="
            white-space:pre-wrap;
            background:#fff;
            padding:15px;
            border:1px solid #e5e7eb;
            border-radius:6px;
            overflow:auto;
          ">${error?.message || error}</pre>

        </div>

      `;
    }
  }
};


// ------------------------------------------------------
// Global export
// ------------------------------------------------------

if (typeof window !== 'undefined') {
  window.Phase6 = Phase6;
}
