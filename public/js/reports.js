/**
 * MULTIMEDIA PROJECTS DIGITAL DOCUMENTATION & MONITORING SYSTEM
 * Reports Generation Engine & Data Export Module
 */

const ReportEngine = {
  // Generate Report View Modal
  generateReport(reportKey) {
    const data = window.PM_SETU_DATA;
    let title = "";
    let subTitle = "Ministry of Skill Development & Entrepreneurship / DGT / NIMI";
    let contentHtml = "";
    let csvData = [];

    switch(reportKey) {
      case "complete-register":
        title = "Complete Master Document Register (MDR)";
        csvData = [
          ["Document ID", "Category", "Subcategory", "Document Title", "Agency", "Date", "Version", "Owner", "Status", "Access Level"],
          ...data.documents.map(d => [d.id, d.category, d.subcategory, d.name, d.agency, d.date, d.version, d.owner, d.status, d.accessLevel])
        ];
        contentHtml = `
          <div class="report-meta-box">
            <div><strong>Total Documents Tracked:</strong> ${data.documents.length}</div>
            <div><strong>Active Repository Status:</strong> Compliant with GFR 2017 & Public Procurement Guidelines</div>
            <div><strong>Generated At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th>Doc ID</th>
                <th>Category</th>
                <th>Document Title</th>
                <th>Agency / Source</th>
                <th>Date</th>
                <th>Version</th>
                <th>Status</th>
                <th>Access Level</th>
              </tr>
            </thead>
            <tbody>
              ${data.documents.map(d => `
                <tr>
                  <td><code>${d.id}</code></td>
                  <td>${d.category}</td>
                  <td><strong>${d.name}</strong><br><small style="color:#64748b">${d.location}</small></td>
                  <td>${d.agency}</td>
                  <td>${d.date}</td>
                  <td><span class="badge badge-info">${d.version}</span></td>
                  <td><span class="badge ${d.status === 'Approved' ? 'badge-success' : 'badge-warning'}">${d.status}</span></td>
                  <td><span class="badge badge-outline">${d.accessLevel}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      case "tender-status":
        title = "Tender Procurement Status Report (FY 2026-27)";
        csvData = [
          ["Tender ID", "Category", "CPPP Ref", "Budget Sanctioned", "Selected Agency", "Work Order Ref", "Current Status"],
          ...data.projectInfo.tenders.map(t => [t.id, t.category, t.cpppId, t.approvedValue, t.selectedAgency, t.workOrderNo, t.status])
        ];
        contentHtml = `
          <div class="report-meta-box">
            <div><strong>Procurement Cell:</strong> National Instructional Media Institute (NIMI)</div>
            <div><strong>Implementing Ministry:</strong> Ministry of Skill Development & Entrepreneurship</div>
            <div><strong>Campaign:</strong> Nationwide Multimedia Projects Advocacy</div>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th>Tender ID & Ref</th>
                <th>Category & Scope</th>
                <th>CPPP Tender ID</th>
                <th>Sanctioned Budget (INR)</th>
                <th>Selected Agency</th>
                <th>Work Order Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.projectInfo.tenders.map(t => `
                <tr>
                  <td><strong>${t.refNo}</strong><br><small>Code: ${t.id}</small></td>
                  <td><strong>${t.category}</strong><br><small style="color:#64748b">${t.scope}</small></td>
                  <td><code>${t.cpppId}</code></td>
                  <td><strong>₹ ${(t.approvedValue / 10000000).toFixed(2)} Cr</strong><br><small>(Incl. 18% GST)</small></td>
                  <td><strong style="color:#0b2545">${t.selectedAgency}</strong><br><small>${t.agencyAddress}</small></td>
                  <td><code>${t.workOrderNo}</code><br><small>Dated: ${t.workOrderDate}</small></td>
                  <td><span class="badge badge-success">${t.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      case "bidder-status":
        title = "Bidder Participation & Technical Scrutiny Report";
        csvData = [
          ["Bidder ID", "Bidder Name", "Category", "CBC Empanelment", "Average Turnover", "Eligibility Scrutiny", "Technical Score", "Selection Status"],
          ...data.bidders.map(b => [b.id, b.name, b.category, b.cbcEmpaneled, b.turnoverAvg, b.eligibilityStatus, b.technicalScore || "N/A", b.status])
        ];
        contentHtml = `
          <table class="report-table">
            <thead>
              <tr>
                <th>Bidder ID</th>
                <th>Bidder Name</th>
                <th>Category</th>
                <th>CBC Status</th>
                <th>Turnover</th>
                <th>Scrutiny Status</th>
                <th>Tech Score</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              ${data.bidders.map(b => `
                <tr>
                  <td><code>${b.id}</code></td>
                  <td><strong>${b.name}</strong><br><small style="color:#64748b">${b.location}</small></td>
                  <td>${b.category}</td>
                  <td>${b.cbcEmpaneled}</td>
                  <td>${b.turnoverAvg}</td>
                  <td><span class="badge ${b.eligibilityStatus.includes('Eligible') ? 'badge-success' : 'badge-danger'}">${b.eligibilityStatus}</span></td>
                  <td><strong>${b.technicalScore ? b.technicalScore + '/100' : 'N/A'}</strong></td>
                  <td><span class="badge ${b.status.includes('Selected') ? 'badge-success' : 'badge-secondary'}">${b.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      case "tec-report":
        title = "Technical Evaluation Committee (TEC) Consolidated Scoring Report";
        csvData = [
          ["Tender", "Bidder Name", "Evaluator 1", "Evaluator 2", "Evaluator 3", "Average Score", "Rank", "Recommendation"],
          ...data.tecData.tender1.biddersEvaluation.map(b => [
            "Dissemination Agency", b.bidderName, b.evaluatorScores[0].score, b.evaluatorScores[1].score, b.evaluatorScores[2].score, b.averageScore, b.rank, b.recommendation
          ]),
          ...data.tecData.tender2.biddersEvaluation.map(b => [
            "Creative Agency", b.bidderName, b.evaluatorScores[0].score, b.evaluatorScores[1].score, b.evaluatorScores[2].score, b.averageScore, b.rank, b.recommendation
          ])
        ];
        contentHtml = `
          <div class="report-meta-box">
            <div><strong>TEC Reference:</strong> NIMI/TEC/PM-SETU/2026/01 | Held on 12th & 14th September 2026</div>
            <div><strong>Evaluation Model:</strong> Single-Stage Technical QCBS with Fixed Budget as per RFP</div>
            <div><strong>Minimum Qualifying Mark:</strong> 70 / 100</div>
          </div>
          <h4>1. Dissemination Agency Evaluation (Tender Ref: 01/2026-27/PM SETU Media Campaign/NIMI)</h4>
          <table class="report-table">
            <thead>
              <tr>
                <th>Bidder</th>
                <th>Director (Media), MSDE</th>
                <th>Director (PM-SETU), DGT</th>
                <th>Executive Director, NIMI</th>
                <th>CBC Expert</th>
                <th>Average Score</th>
                <th>Ranking</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              ${data.tecData.tender1.biddersEvaluation.map(b => `
                <tr style="${b.rank.includes('H-1') ? 'background:#ecfdf5;' : ''}">
                  <td><strong>${b.bidderName}</strong></td>
                  <td>${b.evaluatorScores[0].score}</td>
                  <td>${b.evaluatorScores[1].score}</td>
                  <td>${b.evaluatorScores[2].score}</td>
                  <td>${b.evaluatorScores[3].score}</td>
                  <td><strong style="color:#0b2545; font-size:1.1em">${b.averageScore}</strong></td>
                  <td><span class="badge ${b.rank.includes('H-1') ? 'badge-success' : 'badge-secondary'}">${b.rank}</span></td>
                  <td><small>${b.recommendation}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h4 style="margin-top:24px;">2. Creative Agency Evaluation (Tender Ref: 02/2026-27/PM SETU Media Campaign/NIMI)</h4>
          <table class="report-table">
            <thead>
              <tr>
                <th>Bidder</th>
                <th>Director (Media), MSDE</th>
                <th>Director (PM-SETU), DGT</th>
                <th>Executive Director, NIMI</th>
                <th>Average Score</th>
                <th>Ranking</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              ${data.tecData.tender2.biddersEvaluation.map(b => `
                <tr style="${b.rank.includes('H-1') ? 'background:#ecfdf5;' : ''}">
                  <td><strong>${b.bidderName}</strong></td>
                  <td>${b.evaluatorScores[0].score}</td>
                  <td>${b.evaluatorScores[1].score}</td>
                  <td>${b.evaluatorScores[2].score}</td>
                  <td><strong style="color:#0b2545; font-size:1.1em">${b.averageScore}</strong></td>
                  <td><span class="badge ${b.rank.includes('H-1') ? 'badge-success' : 'badge-secondary'}">${b.rank}</span></td>
                  <td><small>${b.recommendation}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      case "media-plan-report":
        title = "Approved Master Media Plan & Channel-Wise Financial Outlay";
        csvData = [
          ["Media Type", "Platform / Publication", "Market / Region", "Duration / Specs", "Quantity", "Base Rate (INR)", "GST 18% (INR)", "Total Outlay (INR)", "Execution Status"],
          ...data.mediaPlan.map(m => [m.media, m.platform, m.marketRegion, m.durationSize, m.quantity, m.rate, m.gst, m.total, m.status])
        ];
        const grandTotal = data.mediaPlan.reduce((acc, m) => acc + m.total, 0);
        contentHtml = `
          <div class="report-meta-box">
            <div><strong>Executing Agency:</strong> M/s Action for Rural Development (Work Order: NIMI/MS/T-02/2026-27/PM-SETU-DA)</div>
            <div><strong>Sanctioned Ceiling:</strong> ₹ 23,50,00,000/- (Rupees Twenty-Three Crores Fifty Lakhs Only)</div>
            <div><strong>Planned Outlay:</strong> ₹ ${(grandTotal / 10000000).toFixed(2)} Crores (Reconciled with 18% GST)</div>
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th>Media</th>
                <th>Platform / Channel</th>
                <th>Market / Region</th>
                <th>Specs / Duration</th>
                <th>Volume</th>
                <th>Base (₹)</th>
                <th>GST 18% (₹)</th>
                <th>Total (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.mediaPlan.map(m => `
                <tr>
                  <td><strong>${m.media}</strong></td>
                  <td>${m.platform}</td>
                  <td><small>${m.marketRegion}</small></td>
                  <td>${m.durationSize}</td>
                  <td>${m.quantity}</td>
                  <td>${m.rate.toLocaleString('en-IN')}</td>
                  <td>${m.gst.toLocaleString('en-IN')}</td>
                  <td><strong>${m.total.toLocaleString('en-IN')}</strong></td>
                  <td><span class="badge badge-success">${m.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight:bold; background:#f1f5f9;">
                <td colspan="5">CONSOLIDATED GRAND TOTAL</td>
                <td>₹ ${data.mediaPlan.reduce((a,c) => a + c.rate, 0).toLocaleString('en-IN')}</td>
                <td>₹ ${data.mediaPlan.reduce((a,c) => a + c.gst, 0).toLocaleString('en-IN')}</td>
                <td>₹ ${grandTotal.toLocaleString('en-IN')}</td>
                <td><span class="badge badge-success">Fully Allocated</span></td>
              </tr>
            </tfoot>
          </table>
        `;
        break;

      case "evidence-report":
        title = "Proof of Performance (PoP) & Campaign Evidence Verification Audit";
        csvData = [
          ["Evidence ID", "Agency", "Media Channel", "Evidence Title", "Date", "Location", "Verification Status", "Verified By", "Remarks"],
          ...data.evidenceItems.map(e => [e.id, e.agency, e.media, e.title, e.date, e.location, e.verificationStatus, e.verifiedBy, e.remarks])
        ];
        contentHtml = `
          <table class="report-table">
            <thead>
              <tr>
                <th>Evidence ID</th>
                <th>Media</th>
                <th>Description</th>
                <th>Date & Location</th>
                <th>Verification Status</th>
                <th>Verified By</th>
                <th>Official Verification Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${data.evidenceItems.map(e => `
                <tr>
                  <td><code>${e.id}</code></td>
                  <td><strong>${e.media}</strong></td>
                  <td><strong>${e.title}</strong><br><small style="color:#64748b">File: ${e.file}</small></td>
                  <td>${e.date}<br><small>${e.location}</small></td>
                  <td><span class="badge ${e.verificationStatus === 'Verified' ? 'badge-success' : 'badge-warning'}">${e.verificationStatus}</span></td>
                  <td>${e.verifiedBy}</td>
                  <td><small>${e.remarks}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      case "payment-report":
        title = "Invoices, Sanctions & Financial Disbursements Report";
        csvData = [
          ["Invoice No", "Agency", "Billing Milestone", "Base (INR)", "GST (INR)", "Total (INR)", "Submitted Date", "Approval Date", "Payment Status", "Sanction Ref"],
          ...data.invoices.map(i => [i.invoiceNo, i.agency, i.period, i.amountExclTax, i.gstAmount, i.totalAmount, i.submittedDate, i.approvedDate, i.paymentStatus, i.sanctionRef])
        ];
        contentHtml = `
          <table class="report-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Agency</th>
                <th>Milestone / Period</th>
                <th>Base Amount (₹)</th>
                <th>GST 18% (₹)</th>
                <th>Gross Total (₹)</th>
                <th>Status</th>
                <th>Sanction / UTR Reference</th>
              </tr>
            </thead>
            <tbody>
              ${data.invoices.map(i => `
                <tr>
                  <td><strong>${i.invoiceNo}</strong><br><small>Dated: ${i.submittedDate}</small></td>
                  <td>${i.agency}</td>
                  <td>${i.period}</td>
                  <td>${i.amountExclTax.toLocaleString('en-IN')}</td>
                  <td>${i.gstAmount.toLocaleString('en-IN')}</td>
                  <td><strong style="color:#0b2545">₹ ${i.totalAmount.toLocaleString('en-IN')}</strong></td>
                  <td><span class="badge ${i.paymentStatus.includes('Paid') ? 'badge-success' : 'badge-info'}">${i.paymentStatus}</span></td>
                  <td><code>${i.sanctionRef}</code><br><small>UTR: ${i.utrRef}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      case "audit-report":
        title = "Non-Repudiable System Audit Trail Report";
        csvData = [
          ["Audit ID", "Timestamp", "User Name", "Role", "Action Performed", "Entity", "Previous State", "New State", "Source IP", "Hash"],
          ...data.auditLogs.map(a => [a.id, a.timestamp, a.user, a.role, a.action, a.entity, a.previousStatus, a.newStatus, a.ip, a.hash])
        ];
        contentHtml = `
          <table class="report-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Timestamp (IST)</th>
                <th>Officer / User</th>
                <th>Role</th>
                <th>Action Performed</th>
                <th>Target Document / Entity</th>
                <th>State Transition</th>
                <th>Integrity Hash</th>
              </tr>
            </thead>
            <tbody>
              ${data.auditLogs.map(a => `
                <tr>
                  <td><code>${a.id}</code></td>
                  <td>${a.timestamp}</td>
                  <td><strong>${a.user}</strong></td>
                  <td><span class="badge badge-outline">${a.role}</span></td>
                  <td><strong>${a.action}</strong></td>
                  <td><small>${a.entity}</small></td>
                  <td><small>${a.previousStatus} &rarr; <strong>${a.newStatus}</strong></small></td>
                  <td><code style="font-size:0.75rem">${a.hash}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;

      default:
        title = "Official Summary Report";
        contentHtml = `<p>Please select a valid report option from the list.</p>`;
    }

    // Render modal
    const modalContainer = document.getElementById("report-modal-content");
    modalContainer.innerHTML = `
      <div class="print-header">
        <div class="official-emblem-header">
          <div class="emblem-text-hindi">राष्ट्रीय अनुदेशात्मक मीडिया संस्थान (निमी)</div>
          <div class="emblem-text-eng">NATIONAL INSTRUCTIONAL MEDIA INSTITUTE (NIMI)</div>
          <div class="emblem-text-sub">Ministry of Skill Development & Entrepreneurship, Government of India</div>
          <div class="emblem-address">Post Box No. 3142, CTI Campus, Guindy Industrial Estate, Chennai - 600032</div>
        </div>
        <hr class="report-divider">
        <div class="report-title-badge">
          <h3>${title}</h3>
          <div class="report-sub">${subTitle}</div>
          <div class="watermark-tag">DEMO DATA – NOT AN OFFICIAL RECORD</div>
        </div>
      </div>

      <div class="report-body">
        ${contentHtml}
      </div>

      <div class="report-footer-signatures">
        <div class="sig-box">
          <div class="sig-line">Prepared & Verified By</div>
          <div class="sig-name">Shri Ashfaq Ahmed</div>
          <div class="sig-desig">Nodal Officer (PM-SETU Campaign)<br>NIMI, Chennai</div>
        </div>
        <div class="sig-box">
          <div class="sig-line">Recommended By</div>
          <div class="sig-name">Head of Office (HOO)</div>
          <div class="sig-desig">Media & Accounts Administration<br>NIMI, Chennai</div>
        </div>
        <div class="sig-box">
          <div class="sig-line">Approved By</div>
          <div class="sig-name">Mr. Muthu kamatchi</div>
          <div class="sig-desig">Executive Director<br>NIMI, Chennai</div>
        </div>
      </div>
    `;

    // Store CSV export data on the download button
    const csvBtn = document.getElementById("btn-export-csv");
    if (csvBtn) {
      csvBtn.onclick = () => ReportEngine.downloadCSV(csvData, title.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    }

    document.getElementById("report-modal").classList.add("active");
  },

  // Export CSV Helper
  downloadCSV(rows, filename) {
    if (!rows || !rows.length) return;
    const processRow = function (row) {
      let finalVal = '';
      for (let j = 0; j < row.length; j++) {
        let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
        if (row[j] instanceof Date) {
          innerValue = row[j].toLocaleString();
        }
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0)
          result = '"' + result + '"';
        if (j > 0)
          finalVal += ',';
        finalVal += result;
      }
      return finalVal + '\n';
    };

    let csvContent = '\uFEFF'; // UTF-8 BOM
    for (let i = 0; i < rows.length; i++) {
      csvContent += processRow(rows[i]);
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `PM_SETU_${filename}_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  // Print current report
  printReport() {
    window.print();
  }
};

if (typeof window !== "undefined") {
  window.ReportEngine = ReportEngine;
}
