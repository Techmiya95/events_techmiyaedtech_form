# FestPitch & Techmiya Event Registration Portal

A production-ready event registration, dynamic ticket generation, and QR-based entry verification platform built with React.js (Vite, Tailwind CSS v4) and Google Apps Script serverless backend.

## ✨ Features

- **Candidate Registration Flow**:
  - Full Name
  - Email Address
  - Phone Number
  - Dynamic Event Dropdown (configurable from Google Sheets backend)
  - Location / City
  - Candidate Type (Working Professional or Student toggle)
- **Dynamic Backend Event Management**:
  - Manage and update event schedules, fees, venues, and payment QR directly from the `Events` sheet tab in Google Sheets without modifying code.
- **Automated Confirmation Email**:
  - Automatically sends confirmation emails via Google Apps Script with:
    - Candidate registration ID & pass
    - Dynamically updated event details (Name, Date & Time, Venue, Fee, Description)
    - **Payment QR code** embedded in the email and attached as an image
    - Clear UPI payment instructions with Registration ID note
- **Digital Event Pass**:
  - Monospace Registration ID (`EVT-2026-XXXXXX`)
  - Scannable Entry verification QR code
  - Downloadable PDF Pass
- **Gate Entry Scanner**:
  - Built-in camera scanner (`/scan`) for event organizers to scan attendees' QR passes and mark attendance.
- **Verification Page (`/verify/:id`)**:
  - Real-time check-in status verification and attendance marking.

## 🛠️ Technologies Used

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React
- **Forms & Validation**: React Hook Form, Zod
- **Pass & QR**: `qrcode.react`, `html-to-image`, `jspdf`, `html5-qrcode`
- **Backend & Database**: Google Apps Script (`Code.gs`), Google Sheets, GmailApp

---

## 🚀 Setup Instructions

### 1. Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```bash
   VITE_GOOGLE_SCRIPT_URL=your_google_apps_script_web_app_url_here
   ```

3. Start local development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

### 2. Backend Setup (Google Sheets & Apps Script)

1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Go to **Extensions > Apps Script**.
3. Replace the default script with the contents of [`Code.gs`](file:///d:/GenAI%20workshop%20Registration%20techmiyaedtech/Code.gs).
4. Run the **`setup()`** function:
   - This automatically creates:
     - `Registrations` sheet: columns for Registration ID, Full Name, Email, Phone Number, Event, Location, Candidate Type, Registration Date, Attendance Status, Check-in Time.
     - `Events` sheet: allows organizers to edit event names, dates, venues, fees, descriptions, and payment QR URLs directly in Google Sheets!
   - Review and grant necessary permissions when prompted.
5. Deploy as Web App:
   - Click **Deploy > New deployment**.
   - Select **Web app**.
   - Set **Execute as**: `Me`.
   - Set **Who has access**: `Anyone`.
   - Click **Deploy** and copy the **Web app URL**.
6. Paste the URL into your `.env` file as `VITE_GOOGLE_SCRIPT_URL`.

---

## 📦 Deployment (GitHub Pages / Static Host)

To build and deploy to GitHub Pages:
```bash
npm run deploy
```
or build static assets:
```bash
npm run build
```
The output in `dist/` is ready to be hosted on GitHub Pages, Vercel, Netlify, or AWS S3.
