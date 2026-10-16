# Nymph Classes — WhatsApp Integration Documentation

Comprehensive reference and guide covering all WhatsApp automation, architecture, endpoints, workflows, message templates, frontend components, and operational best practices across the **Nymph Classes** platform.

---

## Table of Contents
1. [Overview & Architecture](#1-overview--architecture)
2. [Technology Stack & Dependencies](#2-technology-stack--dependencies)
3. [Configuration & Lifecycle Management](#3-configuration--lifecycle-management)
4. [API Endpoints Reference](#4-api-endpoints-reference)
5. [Core Functional Use Cases](#5-core-functional-use-cases)
   - [A. Exam Result Publishing (Single Result)](#a-exam-result-publishing-single-result)
   - [B. Monthly Performance Reports & Bulk Dispatch](#b-monthly-performance-reports--bulk-dispatch)
   - [C. Daily Attendance Absentee Notifications](#c-daily-attendance-absentee-notifications)
   - [D. WhatsApp Connection & Session Management](#d-whatsapp-connection--session-management)
6. [Message Templates & Gujarati Translations](#6-message-templates--gujarati-translations)
7. [Frontend User Interfaces & Pages](#7-frontend-user-interfaces--pages)
8. [Anti-Ban & Rate Limiting Strategy](#8-anti-ban--rate-limiting-strategy)
9. [Deployment Constraints (VPS vs Vercel)](#9-deployment-constraints-vps-vs-vercel)
10. [Troubleshooting & FAQs](#10-troubleshooting--faqs)

---

## 1. Overview & Architecture

The WhatsApp integration in **Nymph Classes** powers automated communication between the institution, students, and parents. It operates directly from the server using **WhatsApp Web automation**, eliminating per-message SMS or third-party paid API fees.

### High-Level Architecture

```
+---------------------------------------------------------------------------------+
|                                Frontend (Next.js)                               |
|                                                                                 |
|  - Dashboard Status Dock (/dashboard)                                           |
|  - Device Linking & QR Scanner (/results/whatsapp)                              |
|  - Single Exam Result Publishing (/results/single & /results/view)              |
|  - Monthly Bulk Performance Dispatch (/results/monthly)                         |
|  - Daily Absentee Attendance Dispatch (/attendance)                             |
+---------------------------------------------------------------------------------+
                                       |
                                       | HTTP / REST API (Axios)
                                       v
+---------------------------------------------------------------------------------+
|                                Backend (Express.js)                             |
|                                                                                 |
|  Routes & Controllers:                                                          |
|  - /src/routes/result.routes.js     <--> pdf.controller.js / result.controller.js|
|  - /src/routes/attendance.routes.js <--> attendance.controller.js               |
|                                                                                 |
|  Helper Utilities:                                                              |
|  - /src/utils/whatsappSender.js (Number cleaning, JID lookup, media packaging)  |
|  - @react-pdf/renderer (Dynamic ResultPDF & MonthlyResultPDF buffer generation) |
+---------------------------------------------------------------------------------+
                                       |
                                       | In-Memory & Puppeteer Hooks
                                       v
+---------------------------------------------------------------------------------+
|                           WhatsApp Client Engine (/src/config/whatsapp.js)      |
|                                                                                 |
|  - whatsapp-web.js (Puppeteer Headless Chromium)                                |
|  - LocalAuth Session Persistence (.wwebjs_auth/session-nymph-classes-session)   |
|  - Window Injection: Auto re-injection of window.WWebJS / LoadUtils            |
|  - Linux / Windows / macOS dynamic Chromium detection                           |
+---------------------------------------------------------------------------------+
                                       |
                                       | Encrypted WebSocket Protocol
                                       v
+---------------------------------------------------------------------------------+
|                                 WhatsApp Web / Cloud                            |
|                            (Parents & Students Handsets)                        |
+---------------------------------------------------------------------------------+
```

---

## 2. Technology Stack & Dependencies

| Layer | Library / Tool | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Engine** | `whatsapp-web.js` | `^1.34.7` | Controls WhatsApp Web instance via headless Chromium |
| **Browser Runner** | `puppeteer` | Bundled | Chromium automation engine |
| **Session Storage** | `LocalAuth` | Included in wwebjs | Stores credentials on disk so restarts don't lose session |
| **QR Code (Terminal)** | `qrcode-terminal` | `^0.12.0` | Prints QR code in server CLI during startup |
| **QR Code (Web UI)** | `api.qrserver.com` | Remote API | Encodes QR raw string into scan-ready PNG for the frontend |
| **PDF Generation** | `@react-pdf/renderer` | `^4.3.1` | Converts React scorecard components to raw PDF buffers |
| **Frontend Framework**| `Next.js` / React | `14+` | Dashboard, device scan UI, and trigger controls |
| **Icons & Alerts** | `react-icons/fa` & `react-hot-toast` | - | WhatsApp badges (`FaWhatsapp`), spinner, toast feedback |

---

## 3. Configuration & Lifecycle Management

**Primary Configuration File:** Backend `src/config/whatsapp.js`  
**Boot File:** Backend `server.js` (`import "./src/config/whatsapp.js"`)

### Session Persistence
- Session details are cached in `.wwebjs_auth/session-nymph-classes-session/`.
- Once authenticated, subsequent restarts read from this directory and restore the session automatically without re-scanning.

### Dynamic Chromium Resolution (VPS vs Local)
When running on Linux production servers (Ubuntu/Debian), standard Chromium paths are checked in order:
1. `/usr/bin/chromium-browser`
2. `/usr/bin/chromium`
3. `/usr/bin/google-chrome`
4. `/usr/bin/google-chrome-stable`
5. Falls back to Puppeteer's internal Chrome build if none are found.

### Puppeteer Launch Optimizations
The client initializes with flags tailored for resource efficiency on VPS:
```javascript
args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-gpu",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-ipc-flooding-protection",
    "--disable-extensions",
    "--disable-default-apps",
    "--mute-audio",
    "--js-flags=--max-old-space-size=2048"
]
```

### Script Re-Injection (`ensureWhatsAppReady`)
Modern WhatsApp Web updates occasionally wipe injected helper scripts (`window.WWebJS`). Before dispatching any media or message, `ensureWhatsAppReady()` verifies the presence of `window.WWebJS` on the active page and re-injects `LoadUtils` dynamically to avoid execution failures.

---

## 4. API Endpoints Reference

All routes are mounted under the base backend API URL.

### 1. WhatsApp Connection Status
- **Method:** `GET`
- **Route:** `/results/whatsapp-status`
- **Controller:** `getWhatsAppStatusController` (`pdf.controller.js`)
- **Headers:** `Cache-Control: no-store, no-cache, must-revalidate`
- **Responses:**
  - **Authenticated:**
    ```json
    {
      "success": true,
      "status": "authenticated",
      "message": "WhatsApp is ready and connected!",
      "deviceInfo": {
        "pushname": "Admin Name",
        "number": "919876543210",
        "platform": "android"
      }
    }
    ```
  - **Scan Required:**
    ```json
    {
      "success": true,
      "status": "scan_required",
      "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...",
      "message": "Scan this QR code with WhatsApp Linked Devices"
    }
    ```
  - **Initializing:**
    ```json
    {
      "success": true,
      "status": "initializing",
      "message": "WhatsApp client is initializing. Please refresh in a few seconds."
    }
    ```

### 2. Disconnect / Logout WhatsApp
- **Method:** `POST`
- **Route:** `/results/whatsapp-logout`
- **Controller:** `logoutWhatsAppController` (`pdf.controller.js`)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

### 3. Send Single Exam Scorecard PDF
- **Method:** `POST`
- **Route:** `/results/send-whatsapp/:studentId/:examId`
- **Controller:** `sendResultWhatsAppController` (`pdf.controller.js`)
- **Response:**
  ```json
  {
    "success": true,
    "message": "Result PDF sent successfully via WhatsApp!",
    "messageId": "true_919876543210@c.us_3EB0..."
  }
  ```

### 4. Send Monthly Performance Report (Single Student)
- **Method:** `POST`
- **Route:** `/results/monthly/send-whatsapp`
- **Controller:** `sendMonthlyWhatsApp` (`result.controller.js`)
- **Payload:**
  ```json
  {
    "studentId": "65b...",
    "month": 10,
    "year": 2026,
    "totalObtained": 380,
    "totalMaximum": 400,
    "percentage": 95,
    "grade": "A+",
    "examCount": 4
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "WhatsApp message sent successfully!"
  }
  ```

### 5. Send Monthly Performance Reports (Bulk by Standard/Section)
- **Method:** `POST`
- **Route:** `/results/monthly/send-whatsapp-bulk`
- **Controller:** `sendMonthlyWhatsAppBulk` (`result.controller.js`)
- **Payload:**
  ```json
  {
    "standard": "10",
    "section": "A",
    "month": 10,
    "year": 2026
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Bulk WhatsApp messages completed!",
    "report": [
      { "student": "John Doe", "phone": "9876543210", "success": true, "error": null },
      { "student": "Jane Smith", "phone": "9123456789", "success": false, "error": "Phone number 9123456789 is not active or registered on WhatsApp." }
    ]
  }
  ```

### 6. Create Result with WhatsApp Checkbox
- **Method:** `POST`
- **Route:** `/results`
- **Controller:** `createResult` (`result.controller.js`)
- **Payload includes:** `"sendWhatsApp": true` (optional boolean). Dispatches PDF asynchronously in the background.

### 7. Record Attendance with WhatsApp Checkbox
- **Method:** `POST` `/attendance` and `PUT` `/attendance/:id`
- **Controller:** `recordAttendance` & `updateAttendance` (`attendance.controller.js`)
- **Condition:** Triggered when `status === "Absent"` and `sendWhatsApp === true`.

---

## 5. Core Functional Use Cases

### A. Exam Result Publishing (Single Result)
1. User creates or views an exam result in the UI.
2. The user toggles `Send WhatsApp Alert` or clicks `Send WhatsApp`.
3. Backend retrieves the student details and subject mark breakdowns.
4. `@react-pdf/renderer` renders `ResultPDF` into a Node buffer.
5. `whatsappSender.js` converts the buffer to `MessageMedia` (`application/pdf`) with `sendMediaAsDocument: true`.
6. Sends the document along with a structured scorecard summary caption.

### B. Monthly Performance Reports & Bulk Dispatch
1. Instructor selects Standard (e.g. 10th), Month, and Year on `/results/monthly`.
2. Instructor clicks **"SEND BULK WHATSAPP"**.
3. The backend iterates over all students enrolled in that class.
4. For each student:
   - Aggregates all exam scores recorded in that date range.
   - Calculates monthly obtained marks, max marks, percentage, and grade.
   - Renders `MonthlyResultPDF`.
   - Sends the PDF document and caption.
   - Pauses for **1200ms** before proceeding to the next student (anti-ban protection).
5. The API returns a per-student delivery report (`reportResults`).
6. If any students failed because their number isn't registered on WhatsApp, the frontend displays the **WhatsApp Manual Fallback Modal**.

### C. Daily Attendance Absentee Notifications
1. Teacher logs daily class attendance on `/attendance`.
2. Checks **"WhatsApp Alert Absentee Parents"**.
3. For students marked **"Absent"**, the backend immediately triggers an automated notification in **Gujarati** directly to their registered mobile number.
4. If the student is present or excused, no message is dispatched.

### D. WhatsApp Connection & Session Management
1. The institution admin navigates to `/results/whatsapp` (or clicks the WhatsApp dock card on `/dashboard`).
2. The page polls `/results/whatsapp-status` every 5 seconds.
3. If disconnected, a live QR code is displayed on screen.
4. Admin opens WhatsApp on their phone -> **Linked Devices** -> **Link a Device** -> scans the QR code.
5. The client transitions to `authenticated` state and displays the device's registered phone number and name.
6. A **"Disconnect WhatsApp"** button allows logging out anytime to switch numbers.

---

## 6. Message Templates & Gujarati Translations

### 1. Single Exam Result Caption (English)
```text
Hello *{student.name}*,

Your result for *{result.examName}* (Standard {student.standard}) has been published:

*Scores:*
• *Mathematics*: 48/50
• *Science*: 45/50
• *English*: 46/50

*Total:* 139 / 150
*Percentage:* 92.67%
*Grade:* A+

Please find your detailed scorecard PDF attached below.

Best regards,
Nymph Classes
```

### 2. Monthly Performance Report Caption (English)
```text
Dear Parent,

Here is the Monthly Performance Report of your ward, *{student.name}* (Roll No: *{student.rollNumber}*), for *{Month Year}* at Nymph Classes:

• Total Exams: 4
• Total Marks: 380 / 400
• Overall Percentage: 95%
• Monthly Grade: A+

Best regards,
Nymph Classes
```

### 3. Daily Absentee Parent Notification (Gujarati)
```text
આદરણીય વાલીશ્રી,
આપને જણાવવાનું કે આપનું બાળક, *{student.name}* (રોલ નંબર: *{student.rollNumber}*), આજે ({DD/MM/YYYY}) Nymph Classes માં *ગેરહાજર* છે.

કૃપા કરીને ગેરહાજરી અંગેની માહિતી સંસ્થાને આપશો.
📞 વધુ માહિતી માટે સંસ્થાનો સંપર્ક કરો.

આભાર.
Nymph Classes
```

### 4. Attendance Update Notification (Gujarati)
```text
વાલીશ્રી,

આપને જણાવવાનું કે આપનો બાળક, *{student.name}* (રોલ નંબર: *{student.rollNumber}*), આજે ({DD/MM/YYYY}) Nymph Classes માં *ગેરહાજર* રહેલ છે.

જો આપને કોઈ પ્રશ્ન હોય તો મહેરબાની કરીને ક્લાસના વહીવટી વિભાગનો સંપર્ક કરો.

શુભેચ્છા સહ,
Nymph Classes
```

---

## 7. Frontend User Interfaces & Pages

| Page Path | Source File | Description & WhatsApp Elements |
| :--- | :--- | :--- |
| `/results/whatsapp` | [page.jsx](file:///d:/extraprojects/nymph-classes/nymph-classes/src/app/results/whatsapp/page.jsx) | Dedicated device linking portal with live QR code display, connected device details, refresh, and logout controls. |
| `/dashboard` | [page.jsx](file:///d:/extraprojects/nymph-classes/nymph-classes/src/app/dashboard/page.jsx) | Key metrics dock with **"WhatsApp Client"** card displaying live status badge (Online / Offline / Scan Required) and quick navigation. |
| `/results/single` | [page.jsx](file:///d:/extraprojects/nymph-classes/nymph-classes/src/app/results/single/page.jsx) | Checkbox toggle: `<FaWhatsapp /> Send WhatsApp Alert` during single exam score entry. |
| `/results/view` | [page.jsx](file:///d:/extraprojects/nymph-classes/nymph-classes/src/app/results/view/page.jsx) | Action button on scorecards: **"Send WhatsApp"** with loading state and direct link to device status. |
| `/results/monthly` | [page.jsx](file:///d:/extraprojects/nymph-classes/nymph-classes/src/app/results/monthly/page.jsx) | Bulk action button: **"SEND BULK WHATSAPP"**, per-student action buttons, and **Unregistered WhatsApp Number Modal** with `https://wa.me/<phone>` fallback links. |
| `/attendance` | [page.jsx](file:///d:/extraprojects/nymph-classes/nymph-classes/src/app/attendance/page.jsx) | Roll call footer switch: `<FaWhatsapp /> WhatsApp Alert Absentee Parents` for dispatching absentee notifications. |

---

## 8. Anti-Ban & Rate Limiting Strategy

Automating personal or business WhatsApp numbers requires safeguarding against spam detection algorithms:

1. **Sequential Processing:** Bulk monthly dispatches (`sendMonthlyWhatsAppBulk`) loop student-by-student rather than using `Promise.all()`.
2. **Artificial Delay (Throttling):** Each message transmission is followed by a non-blocking `await new Promise(r => setTimeout(r, 1200))` pause.
3. **Number Validation (`getNumberId`):** The sender verifies if the number is registered before attempting to transmit a heavy payload, avoiding repeated delivery drops to inactive numbers.
4. **Clean Country Code Prepending:** Any 10-digit number automatically receives the `91` Indian country code (`formatWhatsAppNumber()`), avoiding invalid recipient errors.

---

## 9. Deployment Constraints (VPS vs Vercel)

> [!IMPORTANT]
> **WhatsApp Web requires a persistent Node.js environment with a writable disk and Chromium support.**

- **Vercel / AWS Lambda / Serverless:**
  - Vercel functions are stateless and have short execution timeouts. Headless Chromium and `.wwebjs_auth` session directories cannot run reliably.
  - The codebase explicitly skips initialization on Vercel:
    ```javascript
    if (process.env.VERCEL) {
        console.log("⚠️ [WhatsApp] Skipping WhatsApp init — running on Vercel (serverless).");
    }
    ```
- **Recommended Production Hosting:**
  - **VPS / Dedicated Server:** DigitalOcean Droplet, AWS EC2, Linode, or Hetzner running Ubuntu 22.04+ with Node.js 18+ and `pm2`.
  - Install Chromium on Ubuntu:
    ```bash
    sudo apt update
    sudo apt install -y chromium-browser libatk-bridge2.0-0 libgtk-3-0 libasound2
    ```

---

## 10. Troubleshooting & FAQs

### Q1: The QR code is stuck on "Initializing..." or never appears.
- Ensure the backend server has full network access and is not blocked by a corporate firewall or proxy.
- Verify Chromium is installed if hosting on Linux.
- Check terminal logs: backend outputs `[WhatsApp] Initializing WhatsApp Web Client...`.

### Q2: Parents report not receiving the PDF attachment.
- Verify the student profile contains a valid 10-digit mobile number.
- Ensure the recipient number is active on WhatsApp.
- Check if the session was unlinked from the admin phone. Open `/results/whatsapp` to verify **"WhatsApp Connected"** status.

### Q3: How to reconnect after logging out or changing phone numbers?
1. Go to `/results/whatsapp`.
2. Click **"Disconnect WhatsApp"** (if still linked).
3. A new QR code will render within seconds.
4. Scan with the new WhatsApp account.

### Q4: Can multiple admins scan their phones at the same time?
- The backend maintains a single active session (`nymph-classes-session`). All automated messages (exam marks, attendance alerts, monthly reports) originate from the one authenticated WhatsApp phone number.
