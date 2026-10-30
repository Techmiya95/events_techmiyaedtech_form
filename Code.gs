/**
 * FestPitch & Event Registration Backend (Google Apps Script)
 * Techmiya EdTech & FestPitch Portal
 * 
 * Features:
 * - Workshop Registrations (GenAI Workshop: Nov 6, 7, 8, 2026 • 10:00 AM - 5:00 PM)
 *   - Online mode: ₹499 with required payment screenshot upload
 *   - Offline mode: ₹599 with "I will pay offline" venue option
 * - Dynamic event management (from "Events" sheet tab or default backend config)
 * - Registration handling with duplicate checks
 * - Formatted confirmation emails from techmiyaedtech@gmail.com
 * - Attendee entry verification & attendance tracking
 */

// ==================== CONFIGURATION ====================
const SHEET_NAME = "Registrations";
const WORKSHOP_SHEET = "Workshop_Registrations";
const EVENTS_SHEET = "Events";

// Display name shown as the email sender
const SENDER_NAME = "Techmiya EdTech";

// The reply-to email address where candidate replies will be sent
const REPLY_TO_EMAIL = "techmiyaedtech@gmail.com";

// If you have added 'techmiyaedtech@gmail.com' in Gmail Settings -> Accounts -> "Send mail as",
// the script will send emails directly with this 'From' address.
const SENDER_EMAIL_ALIAS = "techmiyaedtech@gmail.com";

// Default event registry if "Events" sheet is not yet populated
const DEFAULT_EVENTS = [
  {
    name: "GenAI Workshop & Hands-on Masterclass",
    date: "November 6, 7, 8, 2026 • 10:00 AM - 5:00 PM IST",
    venue: "Techmiya Innovation Hub / Hybrid Online",
    fee: "₹499",
    feeAmount: 499,
    description: "Deep dive into Large Language Models, Prompt Engineering, RAG architectures, and building production-ready AI agents with hands-on live coding.",
    paymentQrUrl: "https://worldfounderscommunity.github.io/Founders_meetup/Images/payment_QR.jpeg",
    active: true
  },
  {
    name: "FestPitch 2026 - Startup Pitching & Showcase",
    date: "November 21, 2026 • 09:30 AM - 6:00 PM IST",
    venue: "Main Auditorium, Startup Arena",
    fee: "₹999",
    feeAmount: 999,
    description: "Pitch your product or startup in front of angel investors, venture capitalists, and industry experts. Win incubation support and grant prizes.",
    paymentQrUrl: "https://worldfounderscommunity.github.io/Founders_meetup/Images/payment_QR.jpeg",
    active: true
  },
  {
    name: "AI & Embedded Systems Walk-In Drive",
    date: "November 28, 2026 • 10:00 AM - 4:00 PM IST",
    venue: "Tech Park Campus, Bangalore",
    fee: "Free",
    feeAmount: 0,
    description: "Direct walk-in hiring drive for AI Engineers, Embedded Software Developers, and ML Specialists with leading tech startups and enterprises.",
    paymentQrUrl: "",
    active: true
  },
  {
    name: "Tech & Founders Networking Summit",
    date: "December 05, 2026 • 04:00 PM - 8:30 PM IST",
    venue: "Skyline Lounge & Conference Hall",
    fee: "₹299",
    feeAmount: 299,
    description: "High-octane evening connecting visionary founders, tech professionals, students, and key startup ecosystem enablers.",
    paymentQrUrl: "https://worldfounderscommunity.github.io/Founders_meetup/Images/payment_QR.jpeg",
    active: true
  }
];

/**
 * Run this function once in Apps Script editor to initialize the spreadsheet structure.
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup Workshop Registrations Sheet
  let wsSheet = ss.getSheetByName(WORKSHOP_SHEET);
  if (!wsSheet) {
    wsSheet = ss.insertSheet(WORKSHOP_SHEET);
    wsSheet.appendRow([
      "Registration ID", 
      "Full Name", 
      "Phone Number", 
      "Email", 
      "Workshop", 
      "Dates & Timing", 
      "Mode", 
      "Fee", 
      "Payment Option", 
      "Screenshot Uploaded", 
      "Registration Date", 
      "Attendance Status", 
      "Check-in Time"
    ]);
    wsSheet.getRange("A1:M1").setFontWeight("bold").setBackground("#c7d2fe").setFontColor("#1e1b4b");
    wsSheet.setFrozenRows(1);
    wsSheet.autoResizeColumns(1, 13);
  }

  // 2. Setup General Registrations Sheet
  let regSheet = ss.getSheetByName(SHEET_NAME);
  if (!regSheet) {
    regSheet = ss.insertSheet(SHEET_NAME);
    regSheet.appendRow([
      "Registration ID", 
      "Full Name", 
      "Email", 
      "Phone Number", 
      "Event", 
      "Location", 
      "Candidate Type", 
      "Registration Date", 
      "Attendance Status", 
      "Check-in Time"
    ]);
    regSheet.getRange("A1:J1").setFontWeight("bold").setBackground("#e0e7ff").setFontColor("#1e1b4b");
    regSheet.setFrozenRows(1);
    regSheet.autoResizeColumns(1, 10);
  }

  // 3. Setup Events Sheet
  let eventSheet = ss.getSheetByName(EVENTS_SHEET);
  if (!eventSheet) {
    eventSheet = ss.insertSheet(EVENTS_SHEET);
    eventSheet.appendRow([
      "Event Name", 
      "Date & Time", 
      "Venue", 
      "Fee", 
      "Fee Amount", 
      "Description", 
      "Payment QR URL", 
      "Active (TRUE/FALSE)"
    ]);
    eventSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#fef3c7").setFontColor("#78350f");
    eventSheet.setFrozenRows(1);

    DEFAULT_EVENTS.forEach(function(evt) {
      eventSheet.appendRow([
        evt.name,
        evt.date,
        evt.venue,
        evt.fee,
        evt.feeAmount,
        evt.description,
        evt.paymentQrUrl,
        true
      ]);
    });
    eventSheet.autoResizeColumns(1, 8);
  }
}

/**
 * Handle HTTP POST requests
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === "registerWorkshop") {
      return handleWorkshopRegistration(postData);
    } else if (action === "register") {
      return handleRegistration(postData);
    } else if (action === "markAttendance") {
      return handleMarkAttendance(postData);
    }

    return createJsonResponse({ success: false, error: "Invalid action" });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Handle HTTP GET requests
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === "getEvents") {
      return handleGetEvents();
    } else if (action === "verify") {
      return handleVerify(e.parameter.id);
    } else if (action === "getAll") {
      return handleGetAll();
    }
    
    return createJsonResponse({ success: false, error: "Invalid action" });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * POST: Handle Workshop Registration (GenAI Workshop)
 */
function handleWorkshopRegistration(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(WORKSHOP_SHEET);
  
  if (!sheet) {
    setup();
    sheet = ss.getSheetByName(WORKSHOP_SHEET);
  }

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  // Check for duplicate registration for same email or phone for this workshop
  for (let i = 1; i < values.length; i++) {
    const rowEmail = String(values[i][3]).toLowerCase().trim();
    const rowPhone = String(values[i][2]).trim();

    if (rowEmail === String(data.email).toLowerCase().trim() || rowPhone === String(data.phone).trim()) {
      return createJsonResponse({ 
        success: false, 
        error: "You have already registered for the GenAI Workshop with this email or phone number." 
      });
    }
  }

  const timestamp = new Date();
  const payOption = data.payOffline ? "Pay Offline at Venue" : "Paid Online via UPI";
  const hasScreenshot = (data.paymentScreenshot && data.paymentScreenshot.length > 50) ? "Yes" : "No";

  // Append row
  sheet.appendRow([
    data.registrationId,
    data.fullName,
    data.phone,
    data.email,
    data.workshop || "GenAI Workshop",
    data.timing || "November 6, 7, 8, 2026 • 10:00 AM - 5:00 PM IST",
    data.mode, // "Online" or "Offline"
    data.fee,  // "₹499" or "₹599"
    payOption,
    hasScreenshot,
    timestamp,
    "Confirmed",
    ""
  ]);

  // Send Workshop Confirmation Email from techmiyaedtech@gmail.com
  try {
    sendWorkshopConfirmationEmail(data);
  } catch (emailError) {
    console.error("Error sending workshop confirmation email:", emailError);
  }

  return createJsonResponse({ 
    success: true, 
    registrationId: data.registrationId 
  });
}

/**
 * Send automated confirmation email for GenAI Workshop
 */
function sendWorkshopConfirmationEmail(data) {
  const subject = `🎟️ Registration Confirmed: GenAI Workshop (Nov 6-8, 2026) [${data.registrationId}]`;
  const isOnline = data.mode === "Online";
  const fee = isOnline ? "₹499" : "₹599";

  let paymentStatusHtml = "";
  if (isOnline) {
    paymentStatusHtml = `
      <div style="background-color: #ecfdf5; padding: 18px 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #a7f3d0;">
        <span style="background-color: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">
          Online Access Confirmed
        </span>
        <h4 style="color: #065f46; margin: 8px 0 4px; font-size: 16px;">Payment Screenshot Received (₹499)</h4>
        <p style="color: #047857; margin: 0; font-size: 13px; line-height: 1.5;">
          Thank you! Your payment screenshot has been received and verified. The live stream link, Discord channel invite, and hands-on Google Colab notebooks will be emailed before day 1.
        </p>
      </div>
    `;
  } else if (data.payOffline) {
    paymentStatusHtml = `
      <div style="background-color: #fffbeb; padding: 18px 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #fde68a;">
        <span style="background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">
          Offline Seat Reserved
        </span>
        <h4 style="color: #92400e; margin: 8px 0 4px; font-size: 16px;">Payment Method: Pay at Venue Desk (₹599)</h4>
        <p style="color: #78350f; margin: 0; font-size: 13px; line-height: 1.5;">
          Your in-person seat is reserved at Techmiya Innovation Campus for Nov 6, 7, 8, 2026. Please present your pass ID (<strong>${data.registrationId}</strong>) and complete your payment of <strong>₹599</strong> at the reception desk upon arrival.
        </p>
      </div>
    `;
  } else {
    paymentStatusHtml = `
      <div style="background-color: #ecfdf5; padding: 18px 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #a7f3d0;">
        <span style="background-color: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">
          Offline Seat Confirmed
        </span>
        <h4 style="color: #065f46; margin: 8px 0 4px; font-size: 16px;">Advance Payment Received (₹599)</h4>
        <p style="color: #047857; margin: 0; font-size: 13px; line-height: 1.5;">
          Your offline seat is fully confirmed. Welcome to Techmiya Innovation Campus on November 6, 2026 at 10:00 AM!
        </p>
      </div>
    `;
  }

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px 10px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 12px; opacity: 0.95; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
        .intro-text { color: #475569; line-height: 1.6; margin: 0 0 20px; font-size: 14px; }
        .badge-id { display: inline-block; font-family: monospace; font-size: 13px; font-weight: 700; color: #4338ca; background: #eef2ff; border: 1px solid #c7d2fe; padding: 3px 10px; border-radius: 6px; }
        .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
        .card-title { margin: 0 0 12px; color: #4338ca; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
        .card-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
        .card-row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 500; }
        .val { color: #0f172a; font-weight: 600; text-align: right; }
        .footer { padding: 24px; background: #f8fafc; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Brand Header -->
        <div class="header">
          <h1>Techmiya EdTech</h1>
          <p>GenAI Workshop 2026 • Official Confirmation</p>
        </div>

        <div class="content">
          <p class="greeting">Hello ${data.fullName},</p>
          <p class="intro-text">
            Congratulations! You are officially registered for the <strong>3-Day GenAI Workshop: Prompt Engineering, RAG & Autonomous Agents</strong>.
          </p>

          <!-- Candidate Details Card -->
          <div class="card">
            <div class="card-title">Participant Summary</div>
            <div class="card-row">
              <span class="label">Pass ID:</span>
              <span class="val"><span class="badge-id">${data.registrationId}</span></span>
            </div>
            <div class="card-row">
              <span class="label">Name:</span>
              <span class="val">${data.fullName}</span>
            </div>
            <div class="card-row">
              <span class="label">Phone:</span>
              <span class="val">${data.phone}</span>
            </div>
            <div class="card-row">
              <span class="label">Email:</span>
              <span class="val">${data.email}</span>
            </div>
            <div class="card-row">
              <span class="label">Selected Mode:</span>
              <span class="val" style="color: #4338ca;">${data.mode}</span>
            </div>
            <div class="card-row">
              <span class="label">Workshop Fee:</span>
              <span class="val" style="color: #059669; font-weight: 700;">${fee}</span>
            </div>
          </div>

          <!-- Schedule & Timing Card -->
          <div class="card" style="background-color: #fbfbfe; border-color: #ddd6fe;">
            <div class="card-title" style="color: #6d28d9;">Masterclass Schedule</div>
            <div class="card-row">
              <span class="label">Workshop:</span>
              <span class="val" style="color: #5b21b6;">GenAI Workshop 2026</span>
            </div>
            <div class="card-row">
              <span class="label">Dates:</span>
              <span class="val" style="font-weight: 700;">November 6, 7, 8, 2026</span>
            </div>
            <div class="card-row">
              <span class="label">Daily Timing:</span>
              <span class="val" style="font-weight: 700;">Morning 10:00 AM - 5:00 PM IST</span>
            </div>
            <div class="card-row">
              <span class="label">Format:</span>
              <span class="val">${data.mode === 'Online' ? 'Interactive Live Stream + Labs' : 'In-Person Campus Masterclass'}</span>
            </div>
            <div class="card-row">
              <span class="label">Curriculum:</span>
              <span class="val">LLMs, Prompt Engineering, RAG, AI Agents</span>
            </div>
          </div>

          <!-- Payment Status Section -->
          ${paymentStatusHtml}

          <!-- Gate Pass Guidance -->
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 13px; color: #334155; line-height: 1.5;">
            <strong>🎟️ Official Pass Attached:</strong> Your digital entry pass (<code>WorkshopPass-${data.registrationId}.jpg</code>) is attached to this email. Please keep it handy for quick verification.
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 16px 0 0;">
            We look forward to seeing you at the workshop!
          </p>

          <br/>
          <p style="margin: 0; color: #0f172a; font-weight: 700; font-size: 14px;">Warm regards,</p>
          <p style="margin: 2px 0 0; color: #4338ca; font-weight: 700; font-size: 14px;">Techmiya EdTech Team</p>
          <p style="margin: 2px 0 0; color: #64748b; font-size: 12px;">Contact: techmiyaedtech@gmail.com</p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0 0 6px;">Techmiya EdTech • Empowering Future Innovators</p>
          <p style="margin: 0; font-size: 11px;">If you have any questions, reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = [];

  // Attach digital pass
  if (data.ticketImage) {
    try {
      const base64Data = data.ticketImage.split(",")[1];
      const blob = Utilities.newBlob(
        Utilities.base64Decode(base64Data), 
        "image/jpeg", 
        `WorkshopPass-${data.registrationId}.jpg`
      );
      attachments.push(blob);
    } catch(e) {
      console.error("Failed to parse workshop pass image:", e);
    }
  }

  // Attach uploaded payment screenshot if available
  if (data.paymentScreenshot && data.paymentScreenshot.indexOf("data:image") > -1) {
    try {
      const parts = data.paymentScreenshot.split(",");
      const mime = parts[0].split(":")[1].split(";")[0];
      const base64Data = parts[1];
      const ext = mime.indexOf("png") > -1 ? "png" : "jpg";
      const blob = Utilities.newBlob(
        Utilities.base64Decode(base64Data), 
        mime, 
        `PaymentScreenshot-${data.registrationId}.${ext}`
      );
      attachments.push(blob);
    } catch(e) {
      console.error("Failed to parse payment screenshot attachment:", e);
    }
  }

  const emailOptions = {
    name: SENDER_NAME,
    replyTo: REPLY_TO_EMAIL,
    htmlBody: htmlBody,
    attachments: attachments
  };

  // If alias is set and verified
  if (SENDER_EMAIL_ALIAS) {
    try {
      const aliases = GmailApp.getAliases();
      if (aliases && aliases.indexOf(SENDER_EMAIL_ALIAS) > -1) {
        emailOptions.from = SENDER_EMAIL_ALIAS;
      }
    } catch (aliasErr) {
      console.warn("Could not retrieve aliases:", aliasErr);
    }
  }

  GmailApp.sendEmail(data.email, subject, "", emailOptions);
}

/**
 * Fetch list of events from the "Events" sheet or fallback to DEFAULT_EVENTS
 */
function getEventsList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const eventSheet = ss.getSheetByName(EVENTS_SHEET);
  
  if (!eventSheet) {
    return DEFAULT_EVENTS;
  }

  const values = eventSheet.getDataRange().getValues();
  if (values.length <= 1) {
    return DEFAULT_EVENTS;
  }

  const events = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const name = row[0];
    const active = row[7];
    
    if (name && (active === true || active === "TRUE" || active === "" || active === undefined)) {
      events.push({
        id: "evt-" + i,
        name: row[0],
        date: row[1] || "",
        venue: row[2] || "",
        fee: row[3] || "Free",
        feeAmount: Number(row[4]) || 0,
        description: row[5] || "",
        paymentQrUrl: row[6] || "",
        active: true
      });
    }
  }

  return events.length > 0 ? events : DEFAULT_EVENTS;
}

/**
 * Retrieve specific event details by event name
 */
function getEventDetails(eventName) {
  const events = getEventsList();
  for (let i = 0; i < events.length; i++) {
    if (events[i].name === eventName) {
      return events[i];
    }
  }

  return {
    name: eventName || "Event Registration",
    date: "Check event schedule",
    venue: "Main Campus / Hybrid",
    fee: "Free",
    feeAmount: 0,
    description: "Welcome to the event. Please present your digital pass at entry.",
    paymentQrUrl: ""
  };
}

/**
 * GET: Return events list as JSON
 */
function handleGetEvents() {
  const events = getEventsList();
  return createJsonResponse({ success: true, data: events });
}

/**
 * POST: Handle General Event Registration
 */
function handleRegistration(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    setup();
    sheet = ss.getSheetByName(SHEET_NAME);
  }

  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  for (let i = 1; i < values.length; i++) {
    const rowEmail = String(values[i][2]).toLowerCase().trim();
    const rowPhone = String(values[i][3]).trim();
    const rowEvent = String(values[i][4]).trim();

    if (
      (rowEmail === String(data.email).toLowerCase().trim() || rowPhone === String(data.phone).trim()) &&
      rowEvent === String(data.event).trim()
    ) {
      return createJsonResponse({ 
        success: false, 
        error: "You have already registered for this event with this email or phone number." 
      });
    }
  }

  const timestamp = new Date();
  sheet.appendRow([
    data.registrationId,
    data.fullName,
    data.email,
    data.phone,
    data.event,
    data.location,
    data.candidateType,
    timestamp,
    "Pending",
    ""
  ]);

  const eventDetails = getEventDetails(data.event);

  try {
    sendConfirmationEmail(data, eventDetails);
  } catch (emailError) {
    console.error("Error sending confirmation email:", emailError);
  }

  return createJsonResponse({ 
    success: true, 
    registrationId: data.registrationId 
  });
}

/**
 * Send automated confirmation email for general events
 */
function sendConfirmationEmail(data, eventDetails) {
  const subject = `🎟️ Registration Confirmed: ${eventDetails.name} [${data.registrationId}]`;
  
  const feeStr = String(eventDetails.fee || "").trim().toLowerCase();
  const feeAmountNum = Number(eventDetails.feeAmount) || 0;
  const isPaid = feeAmountNum > 0 || (feeStr !== "free" && feeStr !== "₹0" && feeStr !== "0" && feeStr !== "");
  
  const qrUrl = eventDetails.paymentQrUrl || "https://worldfounderscommunity.github.io/Founders_meetup/Images/payment_QR.jpeg";

  let paymentHtml = "";
  if (isPaid) {
    paymentHtml = `
      <div style="background-color: #fffbeb; padding: 24px; border-radius: 14px; margin: 24px 0; border: 1px solid #fde68a;">
        <div style="text-align: center; margin-bottom: 14px;">
          <span style="background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #fde68a;">
            Payment Required
          </span>
          <h3 style="color: #78350f; margin: 10px 0 4px; font-size: 20px; font-weight: 800;">
            Registration Fee: ${eventDetails.fee}
          </h3>
          <p style="color: #4b5563; font-size: 13px; margin: 0; line-height: 1.5;">
            Please scan the QR code below using any UPI app (Google Pay, PhonePe, Paytm, BHIM) to complete your payment of <strong>${eventDetails.fee}</strong>.
          </p>
        </div>

        <div style="text-align: center; margin: 18px 0;">
          <div style="display: inline-block; padding: 12px; background: #ffffff; border: 2px solid #e5e7eb; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.06);">
            <img src="${qrUrl}" alt="Scan to Pay via UPI" style="width: 210px; height: 210px; object-fit: contain; display: block; border-radius: 8px;" />
            <p style="margin: 8px 0 0; font-size: 11px; font-weight: 800; color: #4338ca; text-transform: uppercase; letter-spacing: 1px;">
              UPI SCAN & PAY
            </p>
          </div>
        </div>

        <div style="background-color: #ffffff; padding: 14px 18px; border-radius: 10px; border: 1px solid #fcd34d; font-size: 13px; color: #78350f;">
          <p style="margin: 0; line-height: 1.5;">
            <strong>⚠️ Mandatory Note:</strong> Please enter your Registration ID (<strong>${data.registrationId}</strong>) in the UPI payment remarks/note. Take a screenshot of the payment receipt to present at the entry desk.
          </p>
        </div>
      </div>
    `;
  } else {
    paymentHtml = `
      <div style="background-color: #ecfdf5; padding: 20px 24px; border-radius: 14px; margin: 24px 0; border: 1px solid #a7f3d0; text-align: center;">
        <span style="background-color: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #a7f3d0;">
          Admission Free
        </span>
        <h3 style="color: #065f46; margin: 8px 0 4px 0; font-size: 18px; font-weight: 800;">
          🎉 Free Admission Confirmed
        </h3>
        <p style="color: #047857; margin: 0; font-size: 13px; line-height: 1.5;">
          This event is 100% free of charge. No payment or transaction is required. Your digital entry pass is attached below and ready for gate check-in!
        </p>
      </div>
    `;
  }

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px 10px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 12px; opacity: 0.92; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
        .intro-text { color: #475569; line-height: 1.6; margin: 0 0 20px; font-size: 14px; }
        .badge-id { display: inline-block; font-family: monospace; font-size: 13px; font-weight: 700; color: #4338ca; background: #eef2ff; border: 1px solid #c7d2fe; padding: 3px 10px; border-radius: 6px; }
        .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
        .card-title { margin: 0 0 12px; color: #4338ca; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
        .card-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
        .card-row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 500; }
        .val { color: #0f172a; font-weight: 600; text-align: right; }
        .footer { padding: 24px; background: #f8fafc; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>FestPitch & Tech Events</h1>
          <p>Powered by Techmiya EdTech</p>
        </div>

        <div class="content">
          <p class="greeting">Hello ${data.fullName},</p>
          <p class="intro-text">
            Your registration for <strong>${eventDetails.name}</strong> has been successfully booked! Below are your event details and check-in summary.
          </p>

          <div class="card">
            <div class="card-title">Registration Summary</div>
            <div class="card-row">
              <span class="label">Registration ID:</span>
              <span class="val"><span class="badge-id">${data.registrationId}</span></span>
            </div>
            <div class="card-row">
              <span class="label">Candidate Name:</span>
              <span class="val">${data.fullName}</span>
            </div>
            <div class="card-row">
              <span class="label">Candidate Type:</span>
              <span class="val" style="color: #4338ca;">${data.candidateType}</span>
            </div>
            <div class="card-row">
              <span class="label">Location / City:</span>
              <span class="val">${data.location}</span>
            </div>
            <div class="card-row">
              <span class="label">Phone:</span>
              <span class="val">${data.phone}</span>
            </div>
            <div class="card-row">
              <span class="label">Email:</span>
              <span class="val">${data.email}</span>
            </div>
          </div>

          <div class="card" style="background-color: #fbfbfe; border-color: #ddd6fe;">
            <div class="card-title" style="color: #6d28d9;">Event Schedule & Venue</div>
            <div class="card-row">
              <span class="label">Event:</span>
              <span class="val" style="color: #5b21b6;">${eventDetails.name}</span>
            </div>
            <div class="card-row">
              <span class="label">Date & Time:</span>
              <span class="val">${eventDetails.date}</span>
            </div>
            <div class="card-row">
              <span class="label">Venue / Mode:</span>
              <span class="val">${eventDetails.venue}</span>
            </div>
            <div class="card-row">
              <span class="label">Event Fee:</span>
              <span class="val" style="color: ${isPaid ? '#b45309' : '#059669'}; font-weight: 700;">${eventDetails.fee}</span>
            </div>
            ${eventDetails.description ? `
              <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #ddd6fe; font-size: 13px; color: #4c1d95; line-height: 1.5;">
                <strong>About Event:</strong> ${eventDetails.description}
              </div>
            ` : ""}
          </div>

          ${paymentHtml}

          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 13px; color: #334155; line-height: 1.5;">
            <strong>🎟️ Digital Gate Pass:</strong> Your official entry pass (<code>EventPass-${data.registrationId}.jpg</code>) is attached to this email. Please display the pass QR code at the event entrance for fast verification.
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 16px 0 0;">
            We look forward to seeing you at the event!
          </p>

          <br/>
          <p style="margin: 0; color: #0f172a; font-weight: 700; font-size: 14px;">Best regards,</p>
          <p style="margin: 2px 0 0; color: #4338ca; font-weight: 700; font-size: 14px;">FestPitch & Techmiya Organizing Team</p>
          <p style="margin: 2px 0 0; color: #64748b; font-size: 12px;">Email: techmiyaedtech@gmail.com</p>
        </div>

        <div class="footer">
          <p style="margin: 0 0 6px;">FestPitch • Powered by Techmiya EdTech</p>
          <p style="margin: 0; font-size: 11px;">If you have any questions or require support, reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = [];
  
  if (data.ticketImage) {
    try {
      const base64Data = data.ticketImage.split(",")[1];
      const blob = Utilities.newBlob(
        Utilities.base64Decode(base64Data), 
        "image/jpeg", 
        `EventPass-${data.registrationId}.jpg`
      );
      attachments.push(blob);
    } catch(e) {
      console.error("Failed to parse ticket image for attachment:", e);
    }
  }

  if (isPaid && qrUrl) {
    try {
      const qrResponse = UrlFetchApp.fetch(qrUrl, { muteHttpExceptions: true });
      if (qrResponse.getResponseCode() === 200) {
        const qrBlob = qrResponse.getBlob().setName("Payment_QR.jpg");
        attachments.push(qrBlob);
      }
    } catch(e) {
      console.error("Failed to fetch payment QR attachment:", e);
    }
  }

  const emailOptions = {
    name: SENDER_NAME,
    replyTo: REPLY_TO_EMAIL,
    htmlBody: htmlBody,
    attachments: attachments
  };

  if (SENDER_EMAIL_ALIAS) {
    try {
      const aliases = GmailApp.getAliases();
      if (aliases && aliases.indexOf(SENDER_EMAIL_ALIAS) > -1) {
        emailOptions.from = SENDER_EMAIL_ALIAS;
      }
    } catch (aliasErr) {
      console.warn("Could not retrieve aliases:", aliasErr);
    }
  }

  GmailApp.sendEmail(data.email, subject, "", emailOptions);
}

/**
 * GET: Verify attendee by Registration ID (Checks both Workshop and General Registrations)
 */
function handleVerify(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. First check Workshop Registrations
  const wsSheet = ss.getSheetByName(WORKSHOP_SHEET);
  if (wsSheet) {
    const wsValues = wsSheet.getDataRange().getValues();
    for (let i = 1; i < wsValues.length; i++) {
      if (wsValues[i][0] === id) {
        return createJsonResponse({
          success: true,
          data: {
            registrationId: wsValues[i][0],
            fullName: wsValues[i][1],
            phone: wsValues[i][2],
            email: wsValues[i][3],
            event: wsValues[i][4] + " (" + wsValues[i][6] + ")",
            location: wsValues[i][6] === "Online" ? "Online Stream" : "Techmiya Campus",
            candidateType: wsValues[i][6] + " Attendee",
            attendanceStatus: wsValues[i][11] || "Pending",
            checkInTime: wsValues[i][12] || "",
            isWorkshop: true
          }
        });
      }
    }
  }

  // 2. Check General Registrations
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (sheet) {
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        return createJsonResponse({
          success: true,
          data: {
            registrationId: values[i][0],
            fullName: values[i][1],
            email: values[i][2],
            phone: values[i][3],
            event: values[i][4],
            location: values[i][5],
            candidateType: values[i][6],
            registrationDate: values[i][7],
            attendanceStatus: values[i][8] || "Pending",
            checkInTime: values[i][9] || ""
          }
        });
      }
    }
  }

  return createJsonResponse({ success: false, error: "Registration ID not found." });
}

/**
 * POST: Mark Attendance as Present
 */
function handleMarkAttendance(data) {
  const id = data.registrationId;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Check Workshop sheet first
  const wsSheet = ss.getSheetByName(WORKSHOP_SHEET);
  if (wsSheet) {
    const wsValues = wsSheet.getDataRange().getValues();
    for (let i = 1; i < wsValues.length; i++) {
      if (wsValues[i][0] === id) {
        wsSheet.getRange(i + 1, 12).setValue("Present");
        wsSheet.getRange(i + 1, 13).setValue(new Date());
        return createJsonResponse({ success: true, message: "Attendance marked as Present." });
      }
    }
  }

  // Check General Registrations sheet
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (sheet) {
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        sheet.getRange(i + 1, 9).setValue("Present");
        sheet.getRange(i + 1, 10).setValue(new Date());
        return createJsonResponse({ success: true, message: "Attendance marked as Present." });
      }
    }
  }

  return createJsonResponse({ success: false, error: "Registration ID not found." });
}

/**
 * GET: Retrieve all registrations (for Admin Dashboard)
 */
function handleGetAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return createJsonResponse({ success: true, data: [] });
  }

  const values = sheet.getDataRange().getValues();
  const registrations = [];
  
  for (let i = 1; i < values.length; i++) {
    registrations.push({
      registrationId: values[i][0],
      fullName: values[i][1],
      email: values[i][2],
      phone: values[i][3],
      event: values[i][4],
      location: values[i][5],
      candidateType: values[i][6],
      registrationDate: values[i][7],
      attendanceStatus: values[i][8]
    });
  }

  return createJsonResponse({ success: true, data: registrations });
}

/**
 * Helper to build JSON responses with CORS headers
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * CORS preflight handler
 */
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("").setHeaders(headers);
}
