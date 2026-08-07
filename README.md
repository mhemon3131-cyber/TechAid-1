# TechAid - Interactive Tech Support & Troubleshooting System

**Course**: CSE471 System Analysis and Design  
**Assignment**: Member 2 (Student ID: 23201345 - Mehedi Hasan)  
**Project Location**: `D:\CSE471\TechAid`

---

## Assigned Modules & Features

### 1. Module 1: Service Request Creation
- Device category selection (Laptop, Desktop, Phone, Printer, Internet).
- Detailed issue description with urgency classification (Low, Moderate, Critical).
- Preferred service method selection (Live Chat, Video Call, Home Visit).
- Multi-channel media attachments (Screenshots, Images, Voice, Video) uploaded via Cloudinary API.
- Generation of unique tracking IDs (`REQ-2026-XXXX`).
- Stored securely in PostgreSQL using Prisma ORM.

### 2. Module 2: Appointment Scheduling System
- Technician selection with rating & distance filters.
- Interactive Calendar & Time slot picker (`10:00 am` - `06:30 pm`).
- Automatic collision detection & conflict prevention.
- Confirmation booking summary modal.
- Confirmation email notifications via EmailJS API.
- Technician management console to Accept, Decline, or Reschedule client appointments.

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
