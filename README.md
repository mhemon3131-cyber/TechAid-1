# TechAid - Interactive Tech Support & Troubleshooting System

**Course**: CSE471 System Analysis and Design
**Assignment**: Member 1
**Project Location**: `D:\CSE471\TechAid`

---

## Assigned Modules & Features

### 1. Module 1: AI-Powered Issue Classification
- Customers describe their issue as free text (image/voice capture points are wired for future extension).
- AI analysis identifies the device category, predicts severity (Low, Moderate, Critical), and estimates complexity.
- Recommends the most suitable support method: Live Chat, Video Call, or Home Visit.
- Powered by the **Google Gemini API**, with an automatic rule-based fallback engine so the feature works out of the box without an API key.
- One-click "Create Service Request with this analysis" hands off directly into Module 1's existing request pipeline.

### 2. Module 2: Interactive AI Troubleshooting Assistant
- Pre-technician AI chat assistant that walks the customer through step-by-step troubleshooting.
- Asks context-aware follow-up questions based on the conversation so far.
- Attempts to resolve common issues (device-specific guidance for Laptop, Desktop, Phone, Printer, Internet) without human intervention.
- Provides a direct "Talk to Technician" escalation path into Module 2's appointment booking flow when AI troubleshooting isn't enough.

### 3. Module 3: Issue Resolution History & Service Cost Estimation

**Issue Resolution History**
- Stores and displays the full trail of every service request: description, status history, attachments, and final resolution note.
- Customers can expand any past record to review exactly how a similar issue was resolved before.

**Service Cost Estimation System**
- Estimates the expected repair cost before a booking is confirmed.
- Calculation factors in issue severity, technician rating/pricing signal, travel distance (for Home Visit), and selected service type.
- Full cost breakdown shown so customers can compare service options before booking.

---

## New Backend Endpoints (Member 1)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/ai/classify` | AI-Powered Issue Classification |
| POST | `/api/ai/troubleshoot` | Interactive AI Troubleshooting Assistant (chat turn) |
| GET | `/api/history/:customerId` | Issue Resolution History list |
| GET | `/api/history/detail/:trackingId` | Single resolution record detail |
| POST | `/api/cost-estimate` | Service Cost Estimation |

## Optional: Enabling Live Google Gemini API
The AI features work immediately using a built-in rule-based fallback engine — no setup required.
To use the real Gemini API instead, set an environment variable before starting the server:

```bash
# server/.env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

If `GEMINI_API_KEY` is not set, both AI features automatically use the fallback engine.

---

## How to Run locally

### Backend (Server)
```bash
cd D:\CSE471\TechAid\server
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### Frontend (Client)
```bash
cd D:\CSE471\TechAid\client
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.
