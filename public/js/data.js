/**
 * PM-SETU MEDIA MIX DIGITAL DOCUMENTATION & MONITORING SYSTEM
 * National Instructional Media Institute (NIMI)
 * Ministry of Skill Development & Entrepreneurship / Directorate General of Training
 * 
 * CORE DATA REPOSITORY & DEMO DATABASE
 * ALL DEMO RECORDS ARE MARKED ACCORDINGLY: DEMO DATA – NOT AN OFFICIAL RECORD
 */

const PM_SETU_DATA = {
  projectInfo: {
    title: "PM-SETU MEDIA MIX DIGITAL DOCUMENTATION & MONITORING SYSTEM",
    shortTitle: "Multimedia Projects Portal",
    organisation: "National Instructional Media Institute (NIMI)",
    orgSubtitle: "An Autonomous Institution under Ministry of Skill Development & Entrepreneurship, Govt. of India",
    ministry: "Ministry of Skill Development & Entrepreneurship (MSDE)",
    department: "Directorate General of Training (DGT)",
    projectYear: "2026–27",
    systemStatus: "ACTIVE / OPERATIONAL",
    lastUpdated: "2026-09-24 15:45:00 IST",
    address: "Post Box No. 3142, CTI Campus, Guindy Industrial Estate, Guindy, Chennai - 600032",
    contactEmail: "chennai-nimi@nic.in",
    contactPhone: "044-2250 0657 / 044-2250 0248",
    tenders: [
      {
        id: "T-01",
        refNo: "01/2026-27/PM SETU Media Campaign/NIMI",
        cpppId: "2026_DGT_920631_1",
        category: "Dissemination Agency",
        scope: "Media Planning & Buying, Placement, Broadcast Monitoring and Proof of Performance (PoP) across TV, Radio, Print, Digital, Social Media, Outdoor/OOH, Cinema/Transit",
        publishedDate: "2026-08-06",
        corrigendumDate: "2026-08-27",
        submissionDeadline: "2026-09-08 15:00",
        tecDate: "2026-09-15",
        approvalDate: "2026-09-15",
        workOrderNo: "NIMI/MS/T-02/2026-27/PM-SETU-DA",
        workOrderDate: "2026-09-24",
        approvedValue: 235000000, // Rs. 23.50 Crores
        selectedAgency: "M/s Action for Rural Development",
        agencyAddress: "P. No. 20/21, Vikrama Ditya Ward, Lohia Path, Near Samvad Kendra, Lucknow, UP - 226001",
        status: "Work Order Issued / Campaign Active"
      },
      {
        id: "T-02",
        refNo: "02/2026-27/PM SETU Media Campaign/NIMI",
        cpppId: "2026_DGT_920985_1",
        category: "Creative Agency",
        scope: "Creative strategy, concept design, multi-lingual TVCs, radio jingles, digital reels, motion graphics, print key visuals, outdoor billboards, and brand guidelines",
        publishedDate: "2026-08-06",
        corrigendumDate: "2026-08-27",
        submissionDeadline: "2026-09-08 15:00",
        tecDate: "2026-09-15",
        approvalDate: "2026-09-15",
        workOrderNo: "NIMI/MS/T-02/2026-27/PM-SETU-CA",
        workOrderDate: "2026-09-24",
        approvedValue: 20000000, // Rs. 2.00 Crores
        selectedAgency: "M/s Super Ads Creative Media Pvt. Ltd.",
        agencyAddress: "9/13, First Floor, East Patel Nagar, Opp. Jaypee Siddharth, New Delhi - 110008",
        status: "Work Order Issued / Creative Production Active"
      }
    ]
  },

  // Available User Personas for RBAC simulation
  users: [
    {
      id: "USR-001",
      name: "Mr. Muthukamatchi",
      designation: "Consultant",
      department: "Multimedia , NIMI Chennai",
      role: "admin",
      roleName: "Administrator",
      email: "ed-nimi@nic.in",
      avatar: "MK",
      permissions: ["ALL_ACCESS", "MANAGE_USERS", "CONFIGURE_SYSTEM", "VIEW_AUDIT", "OVERWRITE_CONTROL", "APPROVE_ALL"]
    },
    {
      id: "USR-002",
      name: "Mr.N Ashfaq Ahmed",
      designation: "Assit Manager",
      department: "Media & Production Wing, NIMI Chennai",
      role: "project_team",
      roleName: "Project / Media Team",
      email: "ashfaq.ahmed@nimi.gov.in",
      avatar: "AA",
      permissions: ["UPLOAD_DOCS", "EDIT_WORKING", "VIEW_PROJECT", "MANAGE_MEDIA", "VERIFY_EVIDENCE", "PROCESS_INVOICES"]
    },
    {
      id: "USR-003",
      name: "Sridharan",
      designation: "Asst Manager / Multimedia",
      department: "Multimedia, NIMI Chennai",
      role: "tec_member",
      roleName: "TEC Member",
      email: "k.ramanathan@tec.nimi.gov.in",
      avatar: "KR",
      permissions: ["VIEW_TENDERS", "VIEW_EVALUATION", "ENTER_SCORES", "VIEW_PRESENTATIONS", "VIEW_MINUTES"]
    },
  ],

  // Bidders registry
  bidders: [
    // Dissemination Bidders
    {
      id: "DIS-01",
      name: "M/s Action for Rural Development",
      tenderId: "2026_DGT_920631_1",
      category: "Dissemination Agency",
      location: "Lucknow, Uttar Pradesh",
      cbcEmpaneled: "Yes - Grade A (Valid till Dec 2027)",
      turnoverAvg: "₹ 48.60 Crores",
      eligibilityStatus: "Eligible",
      technicalScore: 88.5,
      presentationScore: 89.2,
      financialBid: "Fixed Budget Cap (₹ 23,50,00,000/-)",
      status: "Selected / Work Order Issued",
      workOrderRef: "NIMI/MS/T-02/2026-27/PM-SETU-DA",
      folderPath: "Bidder Documents/Dissemination Agency/Bidder 01 - Action for Rural Development"
    },
    {
      id: "DIS-02",
      name: "M/s Bharat Communications Ltd",
      tenderId: "2026_DGT_920631_1",
      category: "Dissemination Agency",
      location: "New Delhi",
      cbcEmpaneled: "Yes - Grade A (Valid till Nov 2026)",
      turnoverAvg: "₹ 54.20 Crores",
      eligibilityStatus: "Eligible",
      technicalScore: 76.2,
      presentationScore: 75.0,
      financialBid: "Fixed Budget Cap (₹ 23,50,00,000/-)",
      status: "Evaluated (Non-Selected)",
      workOrderRef: "N/A",
      folderPath: "Bidder Documents/Dissemination Agency/Bidder 02 - Bharat Communications Ltd"
    },
    {
      id: "DIS-03",
      name: "M/s Prasar Outreach Consortium",
      tenderId: "2026_DGT_920631_1",
      category: "Dissemination Agency",
      location: "Mumbai, Maharashtra",
      cbcEmpaneled: "Yes - Grade B (Valid till Oct 2026)",
      turnoverAvg: "₹ 31.80 Crores",
      eligibilityStatus: "Eligible",
      technicalScore: 71.0,
      presentationScore: 68.5,
      financialBid: "Fixed Budget Cap (₹ 23,50,00,000/-)",
      status: "Evaluated (Non-Selected)",
      workOrderRef: "N/A",
      folderPath: "Bidder Documents/Dissemination Agency/Bidder 03 - Prasar Outreach Consortium"
    },
    {
      id: "DIS-04",
      name: "M/s Apex Media Labs & Allied Services",
      tenderId: "2026_DGT_920631_1",
      category: "Dissemination Agency",
      location: "Bengaluru, Karnataka",
      cbcEmpaneled: "No (CBC Certificate not furnished)",
      turnoverAvg: "₹ 14.20 Crores",
      eligibilityStatus: "Disqualified at Scrutiny",
      technicalScore: null,
      presentationScore: null,
      financialBid: "N/A",
      status: "Ineligible (Mandatory CBC Criteria Not Met)",
      workOrderRef: "N/A",
      folderPath: "Bidder Documents/Dissemination Agency/Bidder 04 - Apex Media Labs"
    },

    // Creative Bidders
    {
      id: "CR-01",
      name: "M/s Super Ads Creative Media Pvt. Ltd.",
      tenderId: "2026_DGT_920985_1",
      category: "Creative Agency",
      location: "New Delhi",
      cbcEmpaneled: "Yes - Grade A (Valid till Mar 2027)",
      turnoverAvg: "₹ 18.40 Crores",
      eligibilityStatus: "Eligible",
      technicalScore: 91.2,
      presentationScore: 92.5,
      financialBid: "₹ 2,00,00,000/- (Within Prescribed Schedule)",
      status: "Selected / Work Order Issued",
      workOrderRef: "NIMI/MS/T-02/2026-27/PM-SETU-CA",
      folderPath: "Bidder Documents/Creative Agency/Bidder 01 - Super Ads Creative Media"
    },
    {
      id: "CR-02",
      name: "M/s Drishti Creative Studio LLP",
      tenderId: "2026_DGT_920985_1",
      category: "Creative Agency",
      location: "Mumbai, Maharashtra",
      cbcEmpaneled: "Yes - Grade A (Valid till Jan 2027)",
      turnoverAvg: "₹ 12.90 Crores",
      eligibilityStatus: "Eligible",
      technicalScore: 83.4,
      presentationScore: 84.0,
      financialBid: "₹ 2,00,00,000/- (Within Prescribed Schedule)",
      status: "Evaluated (Non-Selected)",
      workOrderRef: "N/A",
      folderPath: "Bidder Documents/Creative Agency/Bidder 02 - Drishti Creative Studio"
    },
    {
      id: "CR-03",
      name: "M/s Varta Multimedia & Brand Lab",
      tenderId: "2026_DGT_920985_1",
      category: "Creative Agency",
      location: "Chennai, Tamil Nadu",
      cbcEmpaneled: "Yes - Grade B (Valid till Aug 2027)",
      turnoverAvg: "₹ 9.10 Crores",
      eligibilityStatus: "Eligible",
      technicalScore: 77.8,
      presentationScore: 78.5,
      financialBid: "₹ 2,00,00,000/- (Within Prescribed Schedule)",
      status: "Evaluated (Non-Selected)",
      workOrderRef: "N/A",
      folderPath: "Bidder Documents/Creative Agency/Bidder 03 - Varta Multimedia"
    }
  ],

  // Master Document Register (MDR)
  // Contains realistic documents with unique IDs, versioning, access control, and direct links to workspace files
  documents: [
    // 01. Administrative & Approvals
    {
      id: "PMM-ADM-001",
      category: "01. Administrative & Approvals",
      subcategory: "Administrative Approvals",
      name: "Administrative Approval & Expenditure Sanction for PM-SETU Media Campaign (FY 2026-27)",
      agency: "Ministry of Skill Development & Entrepreneurship",
      date: "2026-07-15",
      version: "v1.0",
      versionLabel: "Approved Version",
      owner: "Director (Media), MSDE",
      status: "Approved",
      accessLevel: "Restricted",
      location: "Administrative & Approvals/Administrative Approvals/AA_Sanction_PM_SETU_2026_27.pdf",
      size: "1.42 MB",
      confidential: false,
      remarks: "Sanctioned budget of Rs. 25.50 Crores for nationwide multi-media advocacy across 1000 ITIs and 5 NSTIs.",
      history: [
        { version: "v1.0", date: "2026-07-15", user: "Director (Media), MSDE", note: "Formal AA&ES signed and issued under F.No. MSDE-18011/04/2026-Media." }
      ]
    },
    {
      id: "PMM-ADM-002",
      category: "01. Administrative & Approvals",
      subcategory: "Committee Constitution",
      name: "Constitution of Technical Evaluation Committee (TEC) & Tender Committee for PM-SETU Media Campaign",
      agency: "Directorate General of Training / NIMI",
      date: "2026-07-22",
      version: "v1.0",
      versionLabel: "Approved Version",
      owner: "Executive Director, NIMI",
      status: "Approved",
      accessLevel: "Restricted",
      location: "Administrative & Approvals/Committee Constitution/TEC_Constitution_Order_2026.pdf",
      size: "820 KB",
      confidential: false,
      remarks: "Constitutes 5-member TEC comprising representatives from DGT, MSDE, NIMI, and CBC technical expert.",
      history: [
        { version: "v1.0", date: "2026-07-22", user: "Executive Director, NIMI", note: "Office Memorandum issued with approval of DG, DGT." }
      ]
    },
    {
      id: "PMM-ADM-003",
      category: "01. Administrative & Approvals",
      subcategory: "File Notes",
      name: "Comprehensive File Note on Media Strategy & Procurement Modality through CBC Empaneled Agencies",
      agency: "NIMI Chennai",
      date: "2026-07-28",
      version: "v1.1",
      versionLabel: "Approved Version",
      owner: "Shri Ashfaq Ahmed, NIMI",
      status: "Approved",
      accessLevel: "Internal",
      location: "Administrative & Approvals/File Notes/File_Note_Media_Strategy_Modality.pdf",
      size: "640 KB",
      confidential: false,
      remarks: "Approved single-stage technical evaluation under Rule 173 of GFR 2017 with CBC rates.",
      history: [
        { version: "v1.0", date: "2026-07-25", user: "Shri Ashfaq Ahmed, NIMI", note: "Initial draft note put up." },
        { version: "v1.1", date: "2026-07-28", user: "Executive Director, NIMI", note: "Incorporated observations of Finance and approved." }
      ]
    },
    {
      id: "PMM-ADM-004",
      category: "01. Administrative & Approvals",
      subcategory: "Official Correspondence",
      name: "Correspondence with Central Bureau of Communication (CBC) regarding Empanelled Rates & Norms",
      agency: "Central Bureau of Communication / NIMI",
      date: "2026-08-01",
      version: "v1.0",
      versionLabel: "Approved Version",
      owner: "Nodal Officer, NIMI",
      status: "Approved",
      accessLevel: "Internal",
      location: "Administrative & Approvals/Official Correspondence/CBC_Rate_Card_Confirmation_2026.pdf",
      size: "1.15 MB",
      confidential: false,
      remarks: "Verification of BOC/CBC rate structure for print, TV, radio and outdoor media buys.",
      history: [
        { version: "v1.0", date: "2026-08-01", user: "Nodal Officer, NIMI", note: "Official confirmation placed in record." }
      ]
    },
    {
      id: "PMM-ADM-005",
      category: "01. Administrative & Approvals",
      subcategory: "Meeting Notices",
      name: "Notice for Pre-Bid Conference & Technical Evaluation Committee Schedule",
      agency: "NIMI Chennai",
      date: "2026-08-14",
      version: "v1.0",
      versionLabel: "Approved Version",
      owner: "Head of Office, NIMI",
      status: "Approved",
      accessLevel: "Public",
      location: "Administrative & Approvals/Meeting Notices/Notice_PreBid_TEC_2026.pdf",
      size: "450 KB",
      confidential: false,
      remarks: "Hybrid pre-bid conference held via VC and at NIMI CTI Campus Guindy Chennai.",
      history: [
        { version: "v1.0", date: "2026-08-14", user: "Head of Office, NIMI", note: "Circulated to all registered participants." }
      ]
    },
    {
      id: "PMM-ADM-006",
      category: "01. Administrative & Approvals",
      subcategory: "Meeting Minutes",
      name: "Minutes of Meeting and Annexure 2 of Dissemination Agencies PM-SETU",
      agency: "NIMI / MSDE",
      date: "2026-09-15",
      version: "v2.0",
      versionLabel: "Approved Version",
      owner: "Executive Director, NIMI",
      status: "Approved",
      accessLevel: "Restricted",
      location: "Minutes of meeting and Annexure 2 of Dissemination AGencies PM-SETU.pdf",
      size: "1.28 MB",
      confidential: true,
      hasRealFile: true,
      realPath: "Minutes of meeting and Annexure 2 of Dissemination AGencies PM-SETU.pdf",
      remarks: "Signed minutes of TEC finalizing technical scrutiny, presentation scores and recommendation for Dissemination Agency.",
      history: [
        { version: "v1.0", date: "2026-09-12", user: "Secretary, TEC", note: "Draft minutes prepared." },
        { version: "v2.0", date: "2026-09-15", user: "Executive Director, NIMI", note: "Signed by all members of TEC." }
      ]
    },

    // 02. RFP & Tender Documents (Dissemination & Creative)
    {
      id: "PMM-RFP-DIS-001",
      category: "02. RFP & Tender Documents",
      subcategory: "Dissemination Agency",
      name: "Request for Proposal (RFP) for Dissemination Agency - PM-SETU Media Campaign",
      agency: "NIMI Chennai",
      date: "2026-08-06",
      version: "v1.0",
      versionLabel: "Published",
      owner: "Executive Director, NIMI",
      status: "Published",
      accessLevel: "Public",
      location: "RFP & Tender Documents/Dissemination Agency/RFP_Dissemination_Agency_PM_SETU_2026.pdf",
      size: "3.45 MB",
      confidential: false,
      remarks: "Tender Ref: 01/2026-27/PM SETU Media Campaign/NIMI. CPPP ID: 2026_DGT_920631_1.",
      history: [
        { version: "v1.0", date: "2026-08-06", user: "Executive Director, NIMI", note: "Published on CPPP Portal and NIMI website." }
      ]
    },
    {
      id: "PMM-RFP-DIS-002",
      category: "02. RFP & Tender Documents",
      subcategory: "Dissemination Agency",
      name: "Corrigendum-1 & Clarification to Pre-Bid Queries - Dissemination Agency RFP",
      agency: "NIMI Chennai",
      date: "2026-08-27",
      version: "v1.0",
      versionLabel: "Published",
      owner: "Executive Director, NIMI",
      status: "Published",
      accessLevel: "Public",
      location: "RFP & Tender Documents/Dissemination Agency/Corrigendum_1_Dissemination_2026.pdf",
      size: "1.12 MB",
      confidential: false,
      remarks: "Clarifications issued on CBC empanelment validity, target market mix, and submission date extension.",
      history: [
        { version: "v1.0", date: "2026-08-27", user: "Executive Director, NIMI", note: "Uploaded to CPPP portal." }
      ]
    },
    {
      id: "PMM-RFP-CR-001",
      category: "02. RFP & Tender Documents",
      subcategory: "Creative Agency",
      name: "Request for Proposal (RFP) for Creative Agency - PM-SETU Advocacy Campaign",
      agency: "NIMI Chennai",
      date: "2026-08-06",
      version: "v1.0",
      versionLabel: "Published",
      owner: "Executive Director, NIMI",
      status: "Published",
      accessLevel: "Public",
      location: "RFP & Tender Documents/Creative Agency/RFP_Creative_Agency_PM_SETU_2026.pdf",
      size: "3.18 MB",
      confidential: false,
      remarks: "Tender Ref: 02/2026-27/PM SETU Media Campaign/NIMI. CPPP ID: 2026_DGT_920985_1.",
      history: [
        { version: "v1.0", date: "2026-08-06", user: "Executive Director, NIMI", note: "Published on CPPP Portal." }
      ]
    },
    {
      id: "PMM-RFP-CR-002",
      category: "02. RFP & Tender Documents",
      subcategory: "Creative Agency",
      name: "Corrigendum-1 & Technical Requirements Clarification - Creative Agency RFP",
      agency: "NIMI Chennai",
      date: "2026-08-27",
      version: "v1.0",
      versionLabel: "Published",
      owner: "Executive Director, NIMI",
      status: "Published",
      accessLevel: "Public",
      location: "RFP & Tender Documents/Creative Agency/Corrigendum_1_Creative_2026.pdf",
      size: "980 KB",
      confidential: false,
      remarks: "Clarifications on multilingual adaptations in 22 official Indian languages and intellectual property assignment.",
      history: [
        { version: "v1.0", date: "2026-08-27", user: "Executive Director, NIMI", note: "Uploaded to CPPP portal." }
      ]
    },

    // 03. Bidder Documents (Strict Bidder Isolation)
    {
      id: "PMM-BID-DIS-001",
      category: "03. Bidder Documents",
      subcategory: "Dissemination - Bidder 01",
      name: "Technical Bid & Eligibility Submission Dossier - M/s Action for Rural Development",
      agency: "M/s Action for Rural Development",
      bidderId: "DIS-01",
      date: "2026-09-07",
      version: "v1.0",
      versionLabel: "Submitted",
      owner: "Rajesh Verma, ARD",
      status: "Evaluated",
      accessLevel: "Confidential",
      location: "Bidder Documents/Dissemination Agency/Bidder 01 - Action for Rural Development/Technical_Bid_Dossier.pdf",
      size: "14.8 MB",
      confidential: true,
      remarks: "Confidential technical proposal, team profiles, and previous national campaign case studies.",
      history: [
        { version: "v1.0", date: "2026-09-07", user: "Rajesh Verma, ARD", note: "Encrypted submission via CPPP." }
      ]
    },
    {
      id: "PMM-BID-DIS-002",
      category: "03. Bidder Documents",
      subcategory: "Dissemination - Bidder 01",
      name: "CBC Empanelment Certificate & Financial Turnover Documents - M/s Action for Rural Development",
      agency: "M/s Action for Rural Development",
      bidderId: "DIS-01",
      date: "2026-09-07",
      version: "v1.0",
      versionLabel: "Verified",
      owner: "Rajesh Verma, ARD",
      status: "Verified",
      accessLevel: "Confidential",
      location: "Bidder Documents/Dissemination Agency/Bidder 01 - Action for Rural Development/CBC_Empanelment_Cert.pdf",
      size: "2.30 MB",
      confidential: true,
      remarks: "Valid CBC Category A certificate verified with Central Bureau of Communication.",
      history: [
        { version: "v1.0", date: "2026-09-07", user: "Rajesh Verma, ARD", note: "Uploaded with CA certificate." }
      ]
    },
    {
      id: "PMM-BID-DIS-003",
      category: "03. Bidder Documents",
      subcategory: "Dissemination - Bidder 02",
      name: "Technical Bid & CBC Certificate - M/s Bharat Communications Ltd",
      agency: "M/s Bharat Communications Ltd",
      bidderId: "DIS-02",
      date: "2026-09-08",
      version: "v1.0",
      versionLabel: "Submitted",
      owner: "Sunil Kapoor, BCL",
      status: "Evaluated",
      accessLevel: "Confidential",
      location: "Bidder Documents/Dissemination Agency/Bidder 02 - Bharat Communications Ltd/Technical_Bid.pdf",
      size: "11.2 MB",
      confidential: true,
      remarks: "Confidential Bidder 02 submission. Access restricted to internal evaluation committee.",
      history: [
        { version: "v1.0", date: "2026-09-08", user: "Sunil Kapoor, BCL", note: "Submitted on CPPP." }
      ]
    },
    {
      id: "PMM-BID-CR-001",
      category: "03. Bidder Documents",
      subcategory: "Creative - Bidder 01",
      name: "Technical Proposal & Creative Concept Pitch - M/s Super Ads Creative Media Pvt. Ltd.",
      agency: "M/s Super Ads Creative Media Pvt. Ltd.",
      bidderId: "CR-01",
      date: "2026-09-07",
      version: "v1.0",
      versionLabel: "Submitted",
      owner: "Vikram Malhotra, Super Ads",
      status: "Evaluated",
      accessLevel: "Confidential",
      location: "Bidder Documents/Creative Agency/Bidder 01 - Super Ads Creative Media/Technical_Proposal_Pitch.pdf",
      size: "28.4 MB",
      confidential: true,
      remarks: "Creative concepts, brand positioning strategy, sample TVC storyboard, and digital campaign architecture.",
      history: [
        { version: "v1.0", date: "2026-09-07", user: "Vikram Malhotra, Super Ads", note: "Submitted with portfolio samples." }
      ]
    },

    // 04. Technical Evaluation (TEC)
    {
      id: "PMM-TEC-CR-001",
      category: "05. Technical Evaluation",
      subcategory: "Creative Agency TEC",
      name: "PM-SETU Creative Agency Individual Score Sheets Including Average Presentation Marks (Unsigned)",
      agency: "Technical Evaluation Committee, NIMI",
      date: "2026-09-15",
      version: "v1.0",
      versionLabel: "Working Draft",
      owner: "Shri Ashfaq Ahmed, NIMI",
      status: "Under Review",
      accessLevel: "Internal",
      location: "Creative Agncy/3. PM-SETU_Creative_Agency_Individual_Score_Sheets_Including_Average_Presentation_Marks_Unsigned.pdf.pdf",
      size: "226 KB",
      confidential: true,
      hasRealFile: true,
      realPath: "Creative Agncy/3. PM-SETU_Creative_Agency_Individual_Score_Sheets_Including_Average_Presentation_Marks_Unsigned.pdf.pdf",
      remarks: "Detailed evaluator-wise breakdown of marks for concept, technical approach, agency credentials and presentation.",
      history: [
        { version: "v1.0", date: "2026-09-15", user: "TEC Secretary", note: "Compiled from individual evaluator evaluation sheets." }
      ]
    },
    {
      id: "PMM-TEC-DIS-001",
      category: "05. Technical Evaluation",
      subcategory: "Dissemination Agency TEC",
      name: "Consolidated Technical Evaluation Statement & Scoring Sheet - Dissemination Agency",
      agency: "Technical Evaluation Committee, NIMI",
      date: "2026-09-15",
      version: "v2.0",
      versionLabel: "Approved Version",
      owner: "Executive Director, NIMI",
      status: "Approved",
      accessLevel: "Restricted",
      location: "Minutes of meeting and Annexure 2 of Dissemination AGencies PM-SETU.pdf",
      size: "1.28 MB",
      confidential: true,
      hasRealFile: true,
      realPath: "Minutes of meeting and Annexure 2 of Dissemination AGencies PM-SETU.pdf",
      remarks: "Consolidated scores: M/s Action for Rural Development ranked 1st with 88.5 marks.",
      history: [
        { version: "v1.0", date: "2026-09-14", user: "TEC Member", note: "Scoring tabulated." },
        { version: "v2.0", date: "2026-09-15", user: "Executive Director, NIMI", note: "Signed by all 5 TEC members." }
      ]
    },

    // 05. Financial Evaluation
    {
      id: "PMM-FIN-001",
      category: "06. Financial Evaluation",
      subcategory: "Comparative Statement",
      name: "Financial Scrutiny & Budget Conformity Report - PM-SETU Media Campaign",
      agency: "Finance & Accounts Wing, NIMI",
      date: "2026-09-16",
      version: "v1.0",
      versionLabel: "Approved Version",
      owner: "Accounts Officer, NIMI",
      status: "Approved",
      accessLevel: "Restricted",
      location: "Financial Evaluation/Comparative_Statement_PM_SETU_2026.pdf",
      size: "780 KB",
      confidential: true,
      remarks: "Verification that proposed dissemination plan strictly conforms to ₹23.50 Cr cap and creative to ₹2.00 Cr cap inclusive of 18% GST.",
      history: [
        { version: "v1.0", date: "2026-09-16", user: "Accounts Officer, NIMI", note: "Financial vetting completed." }
      ]
    },

    // 06. Selection & Approval
    {
      id: "PMM-SEL-001",
      category: "07. Selection & Approval",
      subcategory: "Competent Authority Approval",
      name: "Approval of the Competent Authority for Selection of Dissemination & Creative Agencies",
      agency: "Ministry of Skill Development & Entrepreneurship / DGT",
      date: "2026-09-21",
      version: "v1.0",
      versionLabel: "Approved Version",
      owner: "Director General, DGT / Joint Secretary, MSDE",
      status: "Approved",
      accessLevel: "Restricted",
      location: "Selection & Approval/Competent_Authority_Approval_Note_21_09_2026.pdf",
      size: "1.05 MB",
      confidential: false,
      remarks: "Formal approval of the Competent Authority granting permission to issue Work Orders to M/s Action for Rural Dev and M/s Super Ads.",
      history: [
        { version: "v1.0", date: "2026-09-21", user: "Director General, DGT", note: "Approved on electronic file system." }
      ]
    },

    // 07. Work Order & Agreement
    {
      id: "PMM-WO-CR-001",
      category: "08. Work Order & Agreement",
      subcategory: "Creative Agency Work Order",
      name: "Creative Agency Work Order Final draft V2 (Approved Official Copy)",
      agency: "NIMI Chennai / M/s Super Ads Creative Media Pvt. Ltd.",
      date: "2026-09-24",
      version: "v2.0",
      versionLabel: "Approved Version",
      owner: "Executive Director, NIMI",
      status: "Approved",
      accessLevel: "Restricted",
      location: "Final Draft V2 Work order/Creative Agency/Creative Agency Work Order Final draft V2.pdf",
      size: "873 KB",
      confidential: false,
      hasRealFile: true,
      realPath: "Final Draft V2 Work order/Creative Agency/Creative Agency Work Order Final draft V2.pdf",
      wordPath: "Final Draft V2 Work order/Creative Agency/PM-SETU_Work_Order_Creative_Agency_Final _ Drfat_V2.docx",
      remarks: "Work Order No. NIMI/MS/T-02/2026-27/PM-SETU-CA for ₹2,00,00,000/- inclusive of GST. Covers creative strategy, content development and full content production.",
      history: [
        { version: "v1.0", date: "2026-09-21", user: "Shri Ashfaq Ahmed, NIMI", note: "Draft V1 prepared." },
        { version: "v2.0", date: "2026-09-24", user: "Executive Director, NIMI", note: "Final Draft V2 approved and issued to agency." }
      ]
    },
    {
      id: "PMM-WO-DIS-001",
      category: "08. Work Order & Agreement",
      subcategory: "Dissemination Agency Work Order",
      name: "Dissemination Agency Work Order final draft V2 (Approved Official Copy)",
      agency: "NIMI Chennai / M/s Action for Rural Development",
      date: "2026-09-24",
      version: "v2.0",
      versionLabel: "Approved Version",
      owner: "Executive Director, NIMI",
      status: "Approved",
      accessLevel: "Restricted",
      location: "Final Draft V2 Work order/Dissemination Agency/Dissemination Agency Work Order final draft V2.pdf",
      size: "908 KB",
      confidential: false,
      hasRealFile: true,
      realPath: "Final Draft V2 Work order/Dissemination Agency/Dissemination Agency Work Order final draft V2.pdf",
      wordPath: "Final Draft V2 Work order/Dissemination Agency/PM-SETU_Work_Order_Dissemination_Agency_V2_final draft.docx",
      remarks: "Work Order No. NIMI/MS/T-02/2026-27/PM-SETU-DA for ₹23,50,00,000/- inclusive of GST. Covers media planning & buying, placement, monitoring and PoP across all media channels.",
      history: [
        { version: "v1.0", date: "2026-09-21", user: "Shri Ashfaq Ahmed, NIMI", note: "Draft V1 prepared." },
        { version: "v2.0", date: "2026-09-24", user: "Executive Director, NIMI", note: "Final Draft V2 approved and issued to agency." }
      ]
    },

    // 08. Media Planning & Buying
    {
      id: "PMM-MED-001",
      category: "09. Media Planning & Buying",
      subcategory: "Master Media Plan",
      name: "Master Media Plan & Phased Buying Schedule (Phase 1 & Phase 2) - PM-SETU",
      agency: "M/s Action for Rural Development / NIMI",
      date: "2026-09-24",
      version: "v1.1",
      versionLabel: "Approved Version",
      owner: "Rajesh Verma, ARD / Nodal Officer, NIMI",
      status: "Approved",
      accessLevel: "Restricted",
      location: "Media Planning & Buying/Master_Media_Plan_PM_SETU_V1_1.pdf",
      size: "4.20 MB",
      confidential: false,
      remarks: "Comprehensive allocation: TV (35%), Digital & Social (25%), Print (18%), Outdoor (12%), Radio (6%), OTT & Transit (4%).",
      history: [
        { version: "v1.0", date: "2026-09-22", user: "Rajesh Verma, ARD", note: "Initial plan submitted." },
        { version: "v1.1", date: "2026-09-24", user: "Nodal Officer, NIMI", note: "Revisions incorporated for regional language coverage." }
      ]
    },

    // 09. Creative & Campaign Assets
    {
      id: "PMM-CRE-001",
      category: "10. Creative & Campaign Assets",
      subcategory: "Master Creative",
      name: "PM-SETU National Brand Identity Guidelines & Master Visual Language Manual",
      agency: "M/s Super Ads Creative Media Pvt. Ltd.",
      date: "2026-09-24",
      version: "v2.0",
      versionLabel: "Approved Version",
      owner: "Vikram Malhotra, Super Ads",
      status: "Approved",
      accessLevel: "Internal",
      location: "Creative & Campaign Assets/Brand_Guidelines_PM_SETU_2026.pdf",
      size: "18.5 MB",
      confidential: false,
      remarks: "Typography, color codes, logo clear-space rules, co-branding guidelines with MSDE/DGT and ITI logos.",
      history: [
        { version: "v1.0", date: "2026-09-22", user: "Vikram Malhotra, Super Ads", note: "Concept version." },
        { version: "v2.0", date: "2026-09-24", user: "Executive Director, NIMI", note: "Approved with national emblem conformity." }
      ]
    },
    {
      id: "PMM-CRE-002",
      category: "10. Creative & Campaign Assets",
      subcategory: "Video Creative",
      name: "Flagship 60-Second TVC - 'Hunar Se Pragati Tak' (Master Hindi & Subtitled)",
      agency: "M/s Super Ads Creative Media Pvt. Ltd.",
      date: "2026-09-24",
      version: "v1.2",
      versionLabel: "Approved Version",
      owner: "Vikram Malhotra, Super Ads",
      status: "Approved",
      accessLevel: "Internal",
      location: "Creative & Campaign Assets/TVC_60s_Hunar_Se_Pragati_Master_ProRes.mp4",
      size: "450 MB",
      confidential: false,
      remarks: "4K Master broadcast grade ProRes 422 HQ file showcasing modernised smart ITI laboratories, CNC workshops, and robotics labs.",
      history: [
        { version: "v1.0", date: "2026-09-18", user: "Vikram Malhotra, Super Ads", note: "Rough cut." },
        { version: "v1.2", date: "2026-09-24", user: "Director (Media), MSDE", note: "Final cut approved with voiceover." }
      ]
    },

    // 10. Campaign Execution Evidence (PoP)
    {
      id: "PMM-EVD-001",
      category: "11. Campaign Execution Evidence",
      subcategory: "Print Evidence",
      name: "Proof of Performance (PoP) Dossier - Phase 1 National Dailies Release",
      agency: "M/s Action for Rural Development",
      date: "2026-09-24",
      version: "v1.0",
      versionLabel: "Submitted",
      owner: "Rajesh Verma, ARD",
      status: "Under Verification",
      accessLevel: "Internal",
      location: "Campaign Execution Evidence/Print/PoP_Print_Phase1_TearSheets.pdf",
      size: "34.2 MB",
      confidential: false,
      remarks: "Full-page tear sheets, publication certificates and circulation audits across Dainik Jagran, Times of India, Daily Thanthi, Eenadu.",
      history: [
        { version: "v1.0", date: "2026-09-24", user: "Rajesh Verma, ARD", note: "Submitted for initial verification." }
      ]
    },

    // 11. Bills & Payment
    {
      id: "PMM-PAY-001",
      category: "12. Bills & Payment",
      subcategory: "Payment Certificate",
      name: "Payment Sanction Order & Mobilization Advance Release (10%) - Creative Agency",
      agency: "NIMI Chennai / MSDE",
      date: "2026-09-24",
      version: "v1.0",
      versionLabel: "Approved Version",
      owner: "Accounts Officer, NIMI",
      status: "Sent for Payment",
      accessLevel: "Restricted",
      location: "Bills & Payment/Sanction_Advance_Creative_2026.pdf",
      size: "620 KB",
      confidential: true,
      remarks: "Advance of ₹20,00,000/- (10% of contract value) against submission of unconditional Bank Guarantee.",
      history: [
        { version: "v1.0", date: "2026-09-24", user: "Accounts Officer, NIMI", note: "Sanction order generated and routed to PFMS." }
      ]
    },

    // 12. Final Campaign Report
    {
      id: "PMM-REP-001",
      category: "13. Final Campaign Report",
      subcategory: "Progress Report",
      name: "Inception & Readiness Status Report - PM-SETU National Media Rollout",
      agency: "NIMI Media Monitoring Cell",
      date: "2026-09-24",
      version: "v1.0",
      versionLabel: "Approved Version",
      owner: "Shri Ashfaq Ahmed, NIMI",
      status: "Approved",
      accessLevel: "Internal",
      location: "Final Campaign Report/Inception_Readiness_Report_2026.pdf",
      size: "2.10 MB",
      confidential: false,
      remarks: "Baseline media metrics, channel readiness, and digital dashboard integrations.",
      history: [
        { version: "v1.0", date: "2026-09-24", user: "Shri Ashfaq Ahmed, NIMI", note: "Placed before Executive Committee." }
      ]
    },

    // 13. Archive
    {
      id: "PMM-ARC-001",
      category: "18. Archive",
      subcategory: "Procurement Dossier",
      name: "Complete Consolidated Procurement Dossier 2026-27 (Sealed Archive)",
      agency: "NIMI Archive Cell",
      date: "2026-09-24",
      version: "v1.0",
      versionLabel: "Archived & Locked",
      owner: "System Administrator, NIMI",
      status: "Archived",
      accessLevel: "Read-Only Archive",
      location: "Archive/PM_SETU_Procurement_Archive_Bundle_2026.zip",
      size: "142 MB",
      confidential: true,
      remarks: "Immutable electronic record with SHA-256 digital fingerprint (E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855).",
      history: [
        { version: "v1.0", date: "2026-09-24", user: "System Administrator", note: "Cryptographically hashed and moved to read-only vault." }
      ]
    }
  ],

  // TEC Detailed Evaluation Records
  tecData: {
    tender1: {
      refNo: "01/2026-27/PM SETU Media Campaign/NIMI",
      cpppId: "2026_DGT_920631_1",
      category: "Dissemination Agency",
      maxMarks: 100,
      passingCutoff: 70,
      evaluators: [
        { id: "EV-01", name: "Director (Media), MSDE, New Delhi", role: "Chairperson / Member" },
        { id: "EV-02", name: "Director (PM-SETU Scheme), DGT, New Delhi", role: "Member" },
        { id: "EV-03", name: "Executive Director, NIMI Chennai", role: "Member Secretary" },
        { id: "EV-04", name: "CBC External Technical Expert", role: "Special Invitee" }
      ],
      criteria: [
        { name: "CBC Empanelment & Past Experience in National Campaigns", max: 25 },
        { name: "Proposed Media Strategy & Mix Optimization for ITIs", max: 25 },
        { name: "Digital, TV, Radio & Vernacular Outreach Capabilities", max: 20 },
        { name: "Technical Presentation & Concept Demonstration", max: 30 }
      ],
      biddersEvaluation: [
        {
          bidderId: "DIS-01",
          bidderName: "M/s Action for Rural Development",
          evaluatorScores: [
            { evaluator: "Director (Media), MSDE", score: 89.0, remarks: "Outstanding pan-India media reach and vernacular networks." },
            { evaluator: "Director (PM-SETU), DGT", score: 88.0, remarks: "Well aligned with ITI modernization cluster targets." },
            { evaluator: "Executive Director, NIMI", score: 89.0, remarks: "Thorough proof of performance mechanism and monitoring SLA." },
            { evaluator: "CBC External Expert", score: 88.0, remarks: "100% compliant with CBC billing rates and schedules." }
          ],
          averageScore: 88.5,
          scrutinyStatus: "Compliant & Qualified",
          presentationAttendance: "Attended (12.09.2026 at 11:30 AM via Hybrid VC)",
          rank: "H-1 / Highest Technical Scorer",
          recommendation: "Recommended for award of Dissemination Work Order under approved budget cap."
        },
        {
          bidderId: "DIS-02",
          bidderName: "M/s Bharat Communications Ltd",
          evaluatorScores: [
            { evaluator: "Director (Media), MSDE", score: 77.0, remarks: "Good proposal; digital outreach slightly generic." },
            { evaluator: "Director (PM-SETU), DGT", score: 76.0, remarks: "Regional language presence in East and North East moderate." },
            { evaluator: "Executive Director, NIMI", score: 76.0, remarks: "Monitoring framework acceptable." },
            { evaluator: "CBC External Expert", score: 76.0, remarks: "Rates compliant." }
          ],
          averageScore: 76.2,
          scrutinyStatus: "Compliant & Qualified",
          presentationAttendance: "Attended (12.09.2026 at 02:15 PM via Hybrid VC)",
          rank: "H-2",
          recommendation: "Technically qualified; ranked second."
        },
        {
          bidderId: "DIS-03",
          bidderName: "M/s Prasar Outreach Consortium",
          evaluatorScores: [
            { evaluator: "Director (Media), MSDE", score: 72.0, remarks: "Meets minimum benchmarks." },
            { evaluator: "Director (PM-SETU), DGT", score: 70.0, remarks: "Team experience is adequate." },
            { evaluator: "Executive Director, NIMI", score: 71.0, remarks: "Acceptable proposal." },
            { evaluator: "CBC External Expert", score: 71.0, remarks: "Compliant." }
          ],
          averageScore: 71.0,
          scrutinyStatus: "Compliant & Qualified",
          presentationAttendance: "Attended (12.09.2026 at 03:45 PM via Hybrid VC)",
          rank: "H-3",
          recommendation: "Technically qualified; ranked third."
        }
      ]
    },
    tender2: {
      refNo: "02/2026-27/PM SETU Media Campaign/NIMI",
      cpppId: "2026_DGT_920985_1",
      category: "Creative Agency",
      maxMarks: 100,
      passingCutoff: 70,
      evaluators: [
        { id: "EV-01", name: "Director (Media), MSDE, New Delhi", role: "Chairperson" },
        { id: "EV-02", name: "Director (PM-SETU Scheme), DGT", role: "Member" },
        { id: "EV-03", name: "Executive Director, NIMI Chennai", role: "Member Secretary" }
      ],
      criteria: [
        { name: "Creative Strategy, Concept & Messaging Architecture", max: 30 },
        { name: "Quality of Creative Portfolio, Film & Audio Samples", max: 30 },
        { name: "Multilingual Adaptation Capacity (22 Languages)", max: 15 },
        { name: "Technical Presentation & Pitch Quality", max: 25 }
      ],
      biddersEvaluation: [
        {
          bidderId: "CR-01",
          bidderName: "M/s Super Ads Creative Media Pvt. Ltd.",
          evaluatorScores: [
            { evaluator: "Director (Media), MSDE", score: 92.0, remarks: "Exceptional concept 'Hunar Se Pragati Tak'; powerful script." },
            { evaluator: "Director (PM-SETU), DGT", score: 90.5, remarks: "Captures aspirational spirit of modernized ITIs and NSTIs." },
            { evaluator: "Executive Director, NIMI", score: 91.0, remarks: "Comprehensive delivery schedule and in-house studio infrastructure." }
          ],
          averageScore: 91.2,
          scrutinyStatus: "Compliant & Qualified",
          presentationAttendance: "Attended (14.09.2026 at 11:00 AM at NIMI Conference Room)",
          rank: "H-1 / Highest Technical Scorer",
          recommendation: "Recommended for award of Creative Agency Work Order for ₹2,00,00,000/- incl. GST."
        },
        {
          bidderId: "CR-02",
          bidderName: "M/s Drishti Creative Studio LLP",
          evaluatorScores: [
            { evaluator: "Director (Media), MSDE", score: 84.0, remarks: "Strong aesthetic appeal; youth messaging effective." },
            { evaluator: "Director (PM-SETU), DGT", score: 83.0, remarks: "Good conceptual framework." },
            { evaluator: "Executive Director, NIMI", score: 83.0, remarks: "Strong agency credentials." }
          ],
          averageScore: 83.4,
          scrutinyStatus: "Compliant & Qualified",
          presentationAttendance: "Attended (14.09.2026 at 02:00 PM at NIMI Conference Room)",
          rank: "H-2",
          recommendation: "Technically qualified; ranked second."
        },
        {
          bidderId: "CR-03",
          bidderName: "M/s Varta Multimedia & Brand Lab",
          evaluatorScores: [
            { evaluator: "Director (Media), MSDE", score: 78.0, remarks: "Adequate; focus was more regional than pan-India." },
            { evaluator: "Director (PM-SETU), DGT", score: 77.0, remarks: "Acceptable concepts." },
            { evaluator: "Executive Director, NIMI", score: 78.5, remarks: "Good regional language capabilities." }
          ],
          averageScore: 77.8,
          scrutinyStatus: "Compliant & Qualified",
          presentationAttendance: "Attended (14.09.2026 at 04:00 PM at NIMI Conference Room)",
          rank: "H-3",
          recommendation: "Technically qualified; ranked third."
        }
      ]
    }
  },

  // Selection & Approval Workflow Pipeline
  selectionWorkflow: [
    {
      stage: 1,
      title: "Technical Evaluation (TEC)",
      tender: "Dissemination & Creative Agencies",
      date: "2026-09-15",
      officer: "Technical Evaluation Committee (TEC)",
      document: "Minutes of Meeting and TEC Scoring Statements",
      status: "Approved",
      remarks: "All 5 TEC members unanimously recommended H-1 agencies based on technical presentation and evaluation.",
      reference: "NIMI/TEC/PM-SETU/2026/01",
      fileLink: "Minutes of meeting and Annexure 2 of Dissemination AGencies PM-SETU.pdf"
    },
    {
      stage: 2,
      title: "Financial Evaluation & Vetting",
      tender: "Dissemination & Creative Agencies",
      date: "2026-09-16",
      officer: "Accounts Officer / Finance Wing, NIMI",
      document: "Financial Vetting & Budget Conformity Report",
      status: "Approved",
      remarks: "Proposed expenditures are strictly within approved AA&ES caps (₹23.50 Cr & ₹2.00 Cr incl. GST).",
      reference: "NIMI/FIN/PM-SETU/2026/04",
      fileLink: "Financial Evaluation/Comparative_Statement_PM_SETU_2026.pdf"
    },
    {
      stage: 3,
      title: "TEC Formal Recommendation",
      tender: "Dissemination & Creative Agencies",
      date: "2026-09-18",
      officer: "Executive Director, NIMI Chennai",
      document: "Consolidated Recommendation Note to Ministry",
      status: "Approved",
      remarks: "Submitted to Director General, DGT / MSDE for competent approval.",
      reference: "NIMI/ED/PM-SETU/REC-01",
      fileLink: "Minutes of meeting and Annexure 2 of Dissemination AGencies PM-SETU.pdf"
    },
    {
      stage: 4,
      title: "Competent Authority Approval",
      tender: "Dissemination & Creative Agencies",
      date: "2026-09-21",
      officer: "Director General, DGT / Joint Secretary, MSDE",
      document: "Competent Authority Sanction Note",
      status: "Approved",
      remarks: "Approved by Competent Authority under Rule 173 of GFR 2017.",
      reference: "MSDE-F.No.18011/04/2026-Media",
      fileLink: "Selection & Approval/Competent_Authority_Approval_Note_21_09_2026.pdf"
    },
    {
      stage: 5,
      title: "Agency Selection & Notification",
      tender: "Dissemination & Creative Agencies",
      date: "2026-09-22",
      officer: "Head of Office, NIMI Chennai",
      document: "Letter of Intent (LoI) & Acceptance Notices",
      status: "Completed",
      remarks: "LoI issued to M/s Action for Rural Development and M/s Super Ads Creative Media.",
      reference: "NIMI/HOO/LOI-01/2026",
      fileLink: "Selection & Approval/LOI_Issued_Notices.pdf"
    },
    {
      stage: 6,
      title: "Work Order & Agreement Execution",
      tender: "Dissemination & Creative Agencies",
      date: "2026-09-24",
      officer: "Executive Director, NIMI Chennai",
      document: "Signed Work Orders (NIMI/MS/T-02/2026-27/PM-SETU-DA & CA)",
      status: "Completed",
      remarks: "Final Draft V2 Work Orders issued and accepted by both selected agencies.",
      reference: "NIMI/MS/T-02/2026-27/PM-SETU-DA & CA",
      fileLink: "Final Draft V2 Work order/Dissemination Agency/Dissemination Agency Work Order final draft V2.pdf"
    }
  ],

  // Media Plan Items (Detailed Buying Schedule)
  mediaPlan: [
    {
      id: "MP-001",
      media: "TV Broadcast",
      platform: "Doordarshan National & DD News",
      marketRegion: "Pan-India (National Feed)",
      datePeriod: "2026-10-01 to 2026-10-31",
      durationSize: "30s & 60s Spots",
      quantity: "480 Spots (Prime & Non-Prime)",
      rate: 18500000,
      gst: 3330000,
      total: 21830000,
      status: "Approved",
      proofStatus: "Scheduled",
      agency: "Action for Rural Development"
    },
    {
      id: "MP-002",
      media: "TV Broadcast",
      platform: "Regional Satellite GECs & News (12 Channels)",
      marketRegion: "UP, Bihar, MP, Maharashtra, TN, AP, WB",
      datePeriod: "2026-10-05 to 2026-11-15",
      durationSize: "30s Spots",
      quantity: "1,200 Spots",
      rate: 34000000,
      gst: 6120000,
      total: 40120000,
      status: "Approved",
      proofStatus: "Scheduled",
      agency: "Action for Rural Development"
    },
    {
      id: "MP-003",
      media: "Radio",
      platform: "All India Radio (AIR) Primary Channels & FM Gold/Rainbow",
      marketRegion: "Pan-India (Vividh Bharati + Regional)",
      datePeriod: "2026-10-01 to 2026-11-30",
      durationSize: "20s Audio Jingles",
      quantity: "3,600 Broadcasts",
      rate: 11000000,
      gst: 1980000,
      total: 12980000,
      status: "Approved",
      proofStatus: "Scheduled",
      agency: "Action for Rural Development"
    },
    {
      id: "MP-004",
      media: "Print Daily",
      platform: "National Dailies (Dainik Jagran, Amar Ujala, ToI, HT, Daily Thanthi, Eenadu)",
      marketRegion: "National & 18 State Editions",
      datePeriod: "2026-10-02 (Gandhi Jayanti Launch)",
      durationSize: "Full Page Color",
      quantity: "28 Print Insertions",
      rate: 36000000,
      gst: 6480000,
      total: 42480000,
      status: "Approved",
      proofStatus: "Tear Sheet Verified",
      agency: "Action for Rural Development"
    },
    {
      id: "MP-005",
      media: "Digital & Social",
      platform: "YouTube Non-Skippable Ads & Google Display Network (GDN)",
      marketRegion: "Tier 1, Tier 2, Tier 3 ITI Catchment Districts",
      datePeriod: "2026-10-01 to 2026-12-31",
      durationSize: "15s & 30s Video Ads, Banners",
      quantity: "140M Projected Impressions",
      rate: 28000000,
      gst: 5040000,
      total: 33040000,
      status: "Active Execution",
      proofStatus: "Live Dashboard Verified",
      agency: "Action for Rural Development"
    },
    {
      id: "MP-006",
      media: "Social Media",
      platform: "Meta (Instagram / Facebook) & X (Twitter) Official Handles",
      marketRegion: "Youth demographic (Age 15-28, Aspirants)",
      datePeriod: "2026-10-01 to 2026-12-31",
      durationSize: "Reels, Carousels & Video Outreach",
      quantity: "75M Projected Reach",
      rate: 16000000,
      gst: 2880000,
      total: 18880000,
      status: "Active Execution",
      proofStatus: "Live Dashboard Verified",
      agency: "Action for Rural Development"
    },
    {
      id: "MP-007",
      media: "Outdoor / OOH",
      platform: "Unipoles, Bus Shelters & Railway Station Digital Screens",
      marketRegion: "1,000 ITI Hub Towns & 5 NSTI Campuses",
      datePeriod: "2026-10-01 to 2026-11-30",
      durationSize: "Large Format 40x20, 20x10",
      quantity: "650 Sites Across 24 States",
      rate: 24000000,
      gst: 4320000,
      total: 28320000,
      status: "Approved",
      proofStatus: "Geo-tagged Photos In-Progress",
      agency: "Action for Rural Development"
    },
    {
      id: "MP-008",
      media: "OTT & Cinema",
      platform: "JioCinema, Disney+ Hotstar & Transit Cinema Screens",
      marketRegion: "Youth & Skill Development Interest Segments",
      datePeriod: "2026-10-15 to 2026-12-15",
      durationSize: "20s Mid-roll spots",
      quantity: "45M Video Streams",
      rate: 11500000,
      gst: 2070000,
      total: 13570000,
      status: "Approved",
      proofStatus: "Scheduled",
      agency: "Action for Rural Development"
    }
  ],

  // Creative & Campaign Assets
  creativeAssets: [
    {
      id: "AST-CR-001",
      title: "Master Campaign Logo & Identity Package - PM-SETU",
      mediaType: "Master Creative",
      campaign: "National PM-SETU Launch",
      language: "Bilingual (Hindi / English)",
      version: "v2.0 Approved",
      date: "2026-09-24",
      uploadedBy: "Vikram Malhotra, Super Ads",
      approvalStatus: "Approved by MSDE",
      format: "AI, EPS, SVG, PNG (High-Res)",
      fileSize: "42.8 MB",
      previewType: "image",
      remarks: "Official identity approved for all central, state, and digital communication."
    },
    {
      id: "AST-CR-002",
      title: "Hero Film 60s - 'Nayi Pehchan, Naya ITI' (Hindi Master)",
      mediaType: "Video (TVC)",
      campaign: "Aspirational ITI Transformation",
      language: "Hindi",
      version: "v2.0 Approved",
      date: "2026-09-24",
      uploadedBy: "Vikram Malhotra, Super Ads",
      approvalStatus: "Approved by MSDE",
      format: "ProRes 422 HQ & MP4 4K",
      fileSize: "450 MB",
      previewType: "video",
      remarks: "Showcases AICTE/NCVT aligned labs, aerospace tooling, and renewable energy trades."
    },
    {
      id: "AST-CR-003",
      title: "Regional Adaptation TVC 30s - Tamil ('Pudhiya ITI, Pudhiya Sakthi')",
      mediaType: "Video (TVC)",
      campaign: "Regional Vernacular Outreach",
      language: "Tamil",
      version: "v1.1 Approved",
      date: "2026-09-24",
      uploadedBy: "Vikram Malhotra, Super Ads",
      approvalStatus: "Approved by NIMI",
      format: "MP4 1080p Broadcast",
      fileSize: "185 MB",
      previewType: "video",
      remarks: "Voiced by leading Tamil broadcast artist; verified for cultural resonance."
    },
    {
      id: "AST-CR-004",
      title: "Radio Jingle 20s - 'PM-SETU Sang Hunar Ka Ujala'",
      mediaType: "Audio (Radio)",
      campaign: "Radio Advocacy",
      language: "Hindi",
      version: "v1.0 Approved",
      date: "2026-09-24",
      uploadedBy: "Vikram Malhotra, Super Ads",
      approvalStatus: "Approved by NIMI",
      format: "WAV 24-bit 48kHz Broadcast",
      fileSize: "16.4 MB",
      previewType: "audio",
      remarks: "Catchy audio hook composed for All India Radio and private FM networks."
    },
    {
      id: "AST-CR-005",
      title: "National Print Advertisement - Full Page Color (Hindi & English)",
      mediaType: "Print Creative",
      campaign: "Gandhi Jayanti National Rollout",
      language: "Hindi & English",
      version: "v2.0 Approved",
      date: "2026-09-24",
      uploadedBy: "Vikram Malhotra, Super Ads",
      approvalStatus: "Approved by MSDE",
      format: "PDF (Print-Ready CMYK 300 DPI)",
      fileSize: "68.2 MB",
      previewType: "image",
      remarks: "Features Hon'ble Prime Minister's vision for 1000 upgraded ITIs."
    },
    {
      id: "AST-CR-006",
      title: "Social Media Reel Series - 'Day in the Life at Modernized ITI' (5 Parts)",
      mediaType: "Social Media Creative",
      campaign: "Youth Digital Engagement",
      language: "Multilingual Subtitled",
      version: "v1.0 Approved",
      date: "2026-09-24",
      uploadedBy: "Vikram Malhotra, Super Ads",
      approvalStatus: "Approved by NIMI",
      format: "MP4 9:16 Vertical 4K",
      fileSize: "210 MB",
      previewType: "video",
      remarks: "Designed for Instagram Reels and YouTube Shorts."
    }
  ],

  // Campaign Execution Evidence (PoP)
  evidenceItems: [
    {
      id: "EVD-2026-001",
      agency: "Action for Rural Development",
      media: "Print",
      title: "Tear Sheet Proof - Dainik Jagran (Delhi, UP, Bihar Editions)",
      date: "2026-09-24",
      location: "New Delhi, Lucknow, Patna",
      campaign: "Phase 1 Launch",
      file: "EVD_Print_DainikJagran_24092026.pdf",
      verificationStatus: "Verified",
      verifiedBy: "Shri Ashfaq Ahmed, NIMI",
      verificationDate: "2026-09-24 16:30",
      remarks: "Clear tear sheets showing full page color ad in page 3 with correct logo and DAVP code."
    },
    {
      id: "EVD-2026-002",
      agency: "Action for Rural Development",
      media: "TV",
      title: "Telecast Certificate & Broadcast Log - Doordarshan National",
      date: "2026-09-24",
      location: "Pan-India",
      campaign: "Phase 1 Launch",
      file: "EVD_TV_DDNational_Log_24092026.pdf",
      verificationStatus: "Verified",
      verifiedBy: "Shri Ashfaq Ahmed, NIMI",
      verificationDate: "2026-09-24 17:00",
      remarks: "Certified broadcast log from Prasar Bharati confirming 16 spots telecast during prime time."
    },
    {
      id: "EVD-2026-003",
      agency: "Action for Rural Development",
      media: "Outdoor / OOH",
      title: "Geo-Tagged Site Photographs - Chennai & Guindy ITI Vicinity Billboards",
      date: "2026-09-24",
      location: "Chennai (Lat: 13.0067° N, Long: 80.2023° E)",
      campaign: "Southern Zone Rollout",
      file: "EVD_OOH_Chennai_Geotag_Batch1.pdf",
      verificationStatus: "Verified",
      verifiedBy: "Shri Ashfaq Ahmed, NIMI",
      verificationDate: "2026-09-24 17:15",
      remarks: "All 12 unipoles verified with GPS timestamps and high-visibility illumination check."
    },
    {
      id: "EVD-2026-004",
      agency: "Action for Rural Development",
      media: "Digital",
      title: "YouTube Analytics & Impression Delivery Report (Week 1)",
      date: "2026-09-24",
      location: "Pan-India",
      campaign: "Digital Video Reach",
      file: "EVD_Digital_YouTube_Week1_Report.pdf",
      verificationStatus: "Submitted",
      verifiedBy: "Pending Verification",
      verificationDate: null,
      remarks: "Targeted 15M impressions; platform audit report attached with Google Ads verification hash."
    }
  ],

  // Bills & Payment Data
  invoices: [
    {
      invoiceNo: "INV/ARD/2026-27/001",
      agency: "M/s Action for Rural Development",
      category: "Dissemination",
      period: "Mobilization & Phase 1 Advance",
      amountExclTax: 19915254, // Approx Rs 1.99 Cr
      gstAmount: 3584746,      // 18% GST
      totalAmount: 23500000,    // 10% of Rs 23.5 Cr = Rs 2.35 Cr
      submittedDate: "2026-09-24",
      approvedDate: "2026-09-24",
      paymentStatus: "Sent for Payment",
      sanctionRef: "NIMI/FIN/SANCTION-DA-01/2026",
      utrRef: "PFMS-TXN-2026-928174",
      remarks: "Mobilization advance approved against valid Bank Guarantee of equal amount."
    },
    {
      invoiceNo: "INV/SUPERADS/2026/01",
      agency: "M/s Super Ads Creative Media Pvt. Ltd.",
      category: "Creative",
      period: "Milestone 1 - Concept & Master TVC Production",
      amountExclTax: 1694915,  // Approx Rs 16.94 Lakh
      gstAmount: 305085,       // 18% GST
      totalAmount: 2000000,    // 10% advance of Rs 2.0 Cr = Rs 20.0 Lakh
      submittedDate: "2026-09-24",
      approvedDate: "2026-09-24",
      paymentStatus: "Approved",
      sanctionRef: "NIMI/FIN/SANCTION-CA-01/2026",
      utrRef: "Pending PFMS Release",
      remarks: "Approved by Competent Authority; forwarded to NIMI Accounts for payment disbursement."
    }
  ],

  // Audit Trail Events (Tamper-Evident Chronological Log)
  auditLogs: [
    {
      id: "AUD-1001",
      timestamp: "2026-09-24 15:30:12 IST",
      user: "Dr. B. Rajasekaran",
      role: "Administrator",
      action: "Work Order Issued",
      entity: "Final Draft V2 Work Orders (Dissemination & Creative)",
      previousStatus: "Under Final Review",
      newStatus: "Approved & Issued",
      ip: "10.14.20.105 (NIMI Campus Network)",
      hash: "8f2a91c5e4b6d0"
    },
    {
      id: "AUD-1002",
      timestamp: "2026-09-24 14:15:40 IST",
      user: "Shri Ashfaq Ahmed",
      role: "Project / Media Team",
      action: "Document Version Update",
      entity: "PM-SETU_Work_Order_Creative_Agency_Final_Drfat_V2.docx",
      previousStatus: "v1.1 Draft",
      newStatus: "v2.0 Approved",
      ip: "10.14.20.112 (NIMI Media Wing)",
      hash: "3b7e41d8a9f201"
    },
    {
      id: "AUD-1003",
      timestamp: "2026-09-24 12:45:18 IST",
      user: "Smt. Ananya Sharma, IAS",
      role: "Senior Officer",
      action: "Competent Authority Approval Granted",
      entity: "Agency Selection File Note NIMI/MS/T-02/2026",
      previousStatus: "Submitted for Approval",
      newStatus: "Approved",
      ip: "10.2.1.45 (MSDE Shram Shakti Bhawan)",
      hash: "7c1d84e92a0f55"
    },
    {
      id: "AUD-1004",
      timestamp: "2026-09-24 11:10:05 IST",
      user: "Prof. K. Ramanathan",
      role: "TEC Member",
      action: "Evaluation Sheet Submission",
      entity: "Creative Agency Individual Score Sheets (PMM-TEC-CR-001)",
      previousStatus: "Scoring In-Progress",
      newStatus: "Submitted to Committee",
      ip: "10.14.20.108 (NIMI Conference Facility)",
      hash: "1e9f42b87a3c60"
    },
    {
      id: "AUD-1005",
      timestamp: "2026-09-24 09:20:00 IST",
      user: "Dr. B. Rajasekaran",
      role: "Administrator",
      action: "User Authentication & Session Start",
      entity: "Portal Login via Govt SSO / MFA",
      previousStatus: "Logged Out",
      newStatus: "Authenticated Session",
      ip: "10.14.20.105 (NIMI Campus Network)",
      hash: "9a4f21b7e3d812"
    }
  ],

  // System Architecture & Database Entities Specification
  dbSchema: [
    {
      entity: "Tenders",
      description: "Procurement tenders published for PM-SETU media campaign",
      attributes: ["tender_id (PK)", "ref_number", "cppp_id", "category", "scope_of_work", "budget_cap", "published_date", "submission_deadline", "status"]
    },
    {
      entity: "Agencies & Bidders",
      description: "Registered agencies and participating bidders with isolation boundaries",
      attributes: ["agency_id (PK)", "tender_id (FK)", "legal_name", "registration_no", "cbc_empanelment_no", "turnover_avg", "contact_person", "email", "status"]
    },
    {
      entity: "Documents",
      description: "Master document register records with strict institutional identifiers",
      attributes: ["document_id (PK)", "category_code", "subcategory", "title", "tender_id (FK)", "agency_id (FK)", "current_version", "status", "access_level", "file_uri", "file_hash"]
    },
    {
      entity: "DocumentVersions",
      description: "Immutable version history ensuring zero overwrite of approved records",
      attributes: ["version_id (PK)", "document_id (FK)", "version_number", "uploaded_by (FK)", "upload_timestamp", "change_description", "previous_version_id", "approval_stamp"]
    },
    {
      entity: "TECEvaluations",
      description: "Detailed evaluation scores and remarks by committee members",
      attributes: ["evaluation_id (PK)", "tender_id (FK)", "bidder_id (FK)", "evaluator_id (FK)", "scrutiny_status", "criterion_scores_json", "total_score", "presentation_score", "remarks"]
    },
    {
      entity: "WorkOrders",
      description: "Binding legal agreements with comprehensive milestone schedules",
      attributes: ["work_order_id (PK)", "work_order_no", "tender_id (FK)", "agency_id (FK)", "approved_value", "issue_date", "validity_period", "pb_guarantee_ref", "status"]
    },
    {
      entity: "MediaPlanItems",
      description: "Granular channel-wise media releases, rates, and proof tracking",
      attributes: ["item_id (PK)", "work_order_id (FK)", "media_type", "platform_name", "market_region", "scheduled_start", "scheduled_end", "quantity", "unit_rate", "gst_amount", "total_cost", "status"]
    },
    {
      entity: "CreativeAssets",
      description: "Multi-lingual campaign creatives, scripts, and broadcast masters",
      attributes: ["asset_id (PK)", "work_order_id (FK)", "asset_title", "media_type", "language", "version", "approval_status", "storage_path", "ipr_assignment_status"]
    },
    {
      entity: "ProofOfPerformance",
      description: "Third-party broadcast logs, newspaper tear sheets, and geo-tagged site proofs",
      attributes: ["evidence_id (PK)", "media_plan_item_id (FK)", "agency_id (FK)", "media_category", "evidence_timestamp", "location_coords", "file_uri", "verification_status", "verified_by (FK)"]
    },
    {
      entity: "InvoicesAndPayments",
      description: "Milestone bill tracking, GST verification, and PFMS payment disbursements",
      attributes: ["invoice_id (PK)", "work_order_id (FK)", "agency_id (FK)", "invoice_number", "bill_period", "base_amount", "gst_amount", "total_payable", "sanction_ref", "payment_status", "utr_number"]
    },
    {
      entity: "AuditLogs",
      description: "Cryptographically verifiable tamper-evident log of all system transactions",
      attributes: ["log_id (PK)", "event_timestamp", "user_id (FK)", "user_role", "action_code", "target_entity", "old_state", "new_state", "client_ip", "event_hash"]
    }
  ]
};

// Export to window for browser access
if (typeof window !== "undefined") {
  window.PM_SETU_DATA = PM_SETU_DATA;
}
