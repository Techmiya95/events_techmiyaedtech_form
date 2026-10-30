/**
 * FestPitch & Event Registration Backend (Google Apps Script)
 * Techmiya EdTech & FestPitch Portal
 * 
 * Features:
 * - Dynamic event management (from "Events" sheet tab or default backend config)
 * - Registration handling with duplicate checks
 * - Formatted confirmation emails (Payment QR scanner only sent for PAID events)
 * - Configurable sender name, reply-to, and sender alias (techmiyaedtech@gmail.com)
 * - Attendee entry verification & attendance tracking
 */

// ==================== CONFIGURATION ====================
const SHEET_NAME = "Registrations";
const EVENTS_SHEET = "Events";

// Display name shown as the email sender
const SENDER_NAME = "Techmiya EdTech & FestPitch";

// The reply-to email address where candidate replies will be sent
const REPLY_TO_EMAIL = "techmiyaedtech@gmail.com";

// If you have added 'techmiyaedtech@gmail.com' in Gmail Settings -> Accounts -> "Send mail as",
// the script will send emails directly with this 'From' address.
const SENDER_EMAIL_ALIAS = "techmiyaedtech@gmail.com";

// Default event registry if "Events" sheet is not yet populated
const DEFAULT_EVENTS = [
  {
    name: "GenAI Workshop & Hands-on Masterclass",
    date: "November 14, 2026 • 10:00 AM - 5:00 PM IST",
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

  // 1. Setup Registrations Sheet
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

  // 2. Setup Events Sheet (allows organizers to edit events directly in Google Sheets!)
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

    // Populate default events
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

    if (action === "register") {
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
    
    // Include active events only (or all if active is empty)
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

  // Fallback default
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
 * POST: Handle Candidate Registration
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

  // Check for duplicate registration for same email or phone for this event
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
  
  // Save row: [RegID, Name, Email, Phone, Event, Location, CandidateType, Date, Status, CheckinTime]
  sheet.appendRow([
    data.registrationId,
    data.fullName,
    data.email,
    data.phone,
    data.event,
    data.location,
    data.candidateType,
    timestamp,
    "Pending", // Attendance Status
    "" // Check-in Time
  ]);

  // Lookup dynamic event details from backend
  const eventDetails = getEventDetails(data.event);

  // Send formatted confirmation email
  try {
    sendConfirmationEmail(data, eventDetails);
  } catch (emailError) {
    console.error("Error sending confirmation email:", emailError);
    // Non-fatal for registration, continue returning success
  }

  return createJsonResponse({ 
    success: true, 
    registrationId: data.registrationId 
  });
}

/**
 * Send automated formatted confirmation email.
 * - For PAID events: sends payment QR scanner, fee details, and UPI payment notes.
 * - For FREE events: sends free admission confirmation WITHOUT any payment scanner.
 */
function sendConfirmationEmail(data, eventDetails) {
  const subject = `🎟️ Registration Confirmed: ${eventDetails.name} [${data.registrationId}]`;
  
  // Robust check for paid vs free
  const feeStr = String(eventDetails.fee || "").trim().toLowerCase();
  const feeAmountNum = Number(eventDetails.feeAmount) || 0;
  const isPaid = feeAmountNum > 0 || (feeStr !== "free" && feeStr !== "₹0" && feeStr !== "0" && feeStr !== "");
  
  const qrUrl = eventDetails.paymentQrUrl || "https://worldfounderscommunity.github.io/Founders_meetup/Images/payment_QR.jpeg";

  let paymentHtml = "";
  if (isPaid) {
    // PAID EVENT: Include payment QR scanner card
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
    // FREE EVENT: No scanner, clean free admission confirmation
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
        <!-- Brand Header -->
        <div class="header">
          <h1>FestPitch & Tech Events</h1>
          <p>Powered by Techmiya EdTech</p>
        </div>

        <div class="content">
          <p class="greeting">Hello ${data.fullName},</p>
          <p class="intro-text">
            Your registration for <strong>${eventDetails.name}</strong> has been successfully booked! Below are your event details and check-in summary.
          </p>

          <!-- Candidate Registration Card -->
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

          <!-- Dynamic Event Schedule Card -->
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

          <!-- Conditional Payment Section (Included ONLY if event is paid) -->
          ${paymentHtml}

          <!-- Pass Attachment Guidance -->
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

        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0 0 6px;">FestPitch • Powered by Techmiya EdTech</p>
          <p style="margin: 0; font-size: 11px;">If you have any questions or require support, reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = [];
  
  // 1. Attach Digital Ticket Pass if captured from frontend
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

  // 2. Attach Payment QR Code image ONLY IF IT IS A PAID EVENT
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

  // Configure sender options
  const emailOptions = {
    name: SENDER_NAME,
    replyTo: REPLY_TO_EMAIL,
    htmlBody: htmlBody,
    attachments: attachments
  };

  // If a verified alias is set in Gmail, send as techmiyaedtech@gmail.com
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
 * GET: Verify attendee by Registration ID
 */
function handleVerify(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return createJsonResponse({ success: false, error: "Registrations sheet not initialized." });
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
      const attendeeData = {
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
      };
      return createJsonResponse({ success: true, data: attendeeData });
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
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return createJsonResponse({ success: false, error: "Registrations sheet not initialized." });
  }

  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
      sheet.getRange(i + 1, 9).setValue("Present");
      sheet.getRange(i + 1, 10).setValue(new Date());
      return createJsonResponse({ success: true, message: "Attendance marked as Present." });
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
