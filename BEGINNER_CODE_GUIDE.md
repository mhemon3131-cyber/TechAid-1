# 🎈 TechAid - Super Easy Code Guide for Member 2 (Mehedi Hasan)

> **Hello Mehedi!**  
> Imagine you are building a LEGO city called **TechAid** where people with broken laptops or phones can hire expert technicians.  
> As **Member 2 (ID: 23201345)**, you are in charge of **4 big super-features**:
> 1. 📝 **Feature 1 (Module 1)**: Service Request Creation Wizard
> 2. 📅 **Feature 2 (Module 2)**: Appointment Scheduling System & Conflict Prevention
> 3. ⚙️ **Feature 3 (Module 3)**: Technician Availability Management
> 4. 🚀 **Feature 4 (Module 3)**: Service Progress Tracking System

---

## 🧩 THE 4 FEATURES EXPLAINED LIKE A STORY

---

### 🟢 FEATURE 1: Service Request Creation Wizard
* **What it does**: When a customer (like you) has a broken laptop, you open the website and fill out a 2-step form.
* **Step 1**: You choose the device (`Laptop`, `Desktop`, `Phone`), type what's wrong ("Laptop won't turn on"), choose urgency (`Critical`), and pick support method (`Live Chat`, `Video Call`, `Home Visit`).
* **Step 2**: You drag-and-drop screenshots or photos (saved securely via **Cloudinary API**).
* **The Magic Result**: The system creates a unique tracking ID like **`REQ-2026-8942`** and saves it in the database!

---

### 🟢 FEATURE 2: Appointment Scheduling System
* **What it does**: Allows customers to pick a technician and book a date and time slot.
* **How it works**:
  1. You pick a technician (e.g. **Rafiq Ahmed** - 4.9 Stars, 2.1 km away).
  2. You pick a date (**Mon 13**) and a time slot (**10:00 am**).
  3. **The Traffic Cop (Conflict Prevention)**: If someone else ALREADY booked Rafiq at 10:00 am on Mon 13, the system blocks the booking and says *"Conflict! Pick another time slot!"*
  4. Once confirmed, an email notification is automatically sent via **EmailJS API**!

---

### 🟢 FEATURE 3: Technician Availability Management
* **What it does**: Technicians can control their own working schedule so they don't get overworked!
* **How it works**:
  - The technician opens their dashboard and sets:
    - **Working Days**: `Mon`, `Tue`, `Wed`, `Thu`, `Fri`
    - **Shift Hours**: `09:00 AM - 06:00 PM`
    - **Service Areas**: `Gulshan`, `Banani`, `Dhanmondi`, `Uttara`
    - **Max Daily Capacity**: E.g. `5 appointments per day`
  - If a technician reaches 5 bookings on a day, their schedule automatically hides full time slots from customers so nobody can double-book them!

---

### 🟢 FEATURE 4: Service Progress Tracking System
* **What it does**: Just like tracking a pizza delivery on Foodpanda or Uber Eats, customers can watch their repair progress step-by-step!
* **The 6 Stages**:
  `Pending` ➔ `Assigned` ➔ `Accepted` ➔ `In Progress` ➔ `On the Way` ➔ `Completed`
* **How it works**:
  - The customer types their tracking ID (`REQ-2026-8942`).
  - A glowing progress stepper bar shows exactly where the repair is right now!
  - Every time the technician changes the status, a timestamped log is saved in the database history.

---

## 📂 FILE-BY-FILE CODE EXPLANATION

Here is every single file in your project explained simply:

### 1. `server/prisma/schema.prisma` (The Blueprint / Database Rules)
- Think of this file like a blueprint drawing of your LEGO database boxes:
  - `User`: Stores name, email, and whether they are a CUSTOMER or TECHNICIAN.
  - `Technician`: Stores rating, specialty, available days, working hours, and max daily limit.
  - `ServiceRequest`: Stores device name, problem description, urgency, status, and tracking ID.
  - `StatusHistory`: Stores timestamped logs for progress tracking.
  - `Appointment`: Stores booked date, time slot, and technician ID.

---

### 2. `server/src/controllers/requestController.js` (The Kitchen Chef for Requests)
- **Functions in this file**:
  - `createServiceRequest`: Receives the form data, calls Cloudinary to upload photos, generates `REQ-2026-XXXX`, and saves it.
  - `getServiceProgress`: Calculates which stage (0 to 5) the request is in and returns the progress stepper data.
  - `updateServiceStatus`: Changes the stage (e.g. from `IN_PROGRESS` to `ON_THE_WAY`) and adds a log to `statusLogs`.

---

### 3. `server/src/controllers/appointmentController.js` (The Traffic Cop)
- **Functions in this file**:
  - `createAppointment`: Checks if the technician is already booked at that date and time slot (`Conflict Check`). If booked, returns `409 Conflict`. If free, creates the appointment and triggers `sendAppointmentConfirmationEmail()`.
  - `updateAppointmentStatus`: Allows technicians to click `Accept`, `Decline`, or `Reschedule`.

---

### 4. `server/src/controllers/technicianController.js` (The Schedule Manager)
- **Functions in this file**:
  - `getTechnicianAvailability`: Reads the technician's working days, hours, areas, and daily limit.
  - `updateTechnicianAvailability`: Saves new schedule choices made by the technician.

---

### 5. `client/src/pages/CreateRequest.jsx` (The 2-Step Request Wizard UI)
- React component that displays the device buttons (`Laptop`, `Desktop`), text box, urgency pills (`Low`, `Moderate`, `Critical`), file upload box, and submit button.

---

### 6. `client/src/pages/AppointmentBooking.jsx` (The Booking Calendar UI)
- React component that displays technician cards with stars and distance, the date buttons (`Mon 13`, `Tue 14`), time slot grid, and confirmation modal.

---

### 7. `client/src/pages/TechnicianAvailability.jsx` (Technician Schedule Config UI)
- React component that displays day checkboxes, shift hours, neighborhood chips, daily appointment limit slider, and Save button.

---

### 8. `client/src/pages/ServiceProgressTracker.jsx` (The Order Tracker UI)
- React component that displays the glowing 6-stage stepper bar (`Pending` to `Completed`), search bar for tracking ID, and historical log list.

---

## 🤝 HOW TO MERGE SAFELY WITH YOUR 3 COLLABORATORS ON GITHUB

Your group project has **4 members**. To merge your work cleanly without breaking their code:

1. **Keep your work on your branch (`member-2`)**:
   - All your 4 features are inside your branch `member-2`.
2. **Push your updated branch to GitHub**:
   ```bash
   git add .
   git commit -m "Completed Module 3 Features: Technician Availability and Service Progress Tracking"
   git push origin HEAD:member-2
   ```
3. **Merging on GitHub**:
   - Go to GitHub ➔ Click **Pull Requests** ➔ Click **New Pull Request**.
   - Select `base: main` ⬅ `compare: member-2`.
   - GitHub will check for conflicts automatically. Because your files are modular (`CreateRequest.jsx`, `AppointmentBooking.jsx`, `TechnicianAvailability.jsx`, `ServiceProgressTracker.jsx`), there will be **zero conflicts**!
   - Click **Merge Pull Request**!

---

## 🎓 VIVA & DEFENSE QUICK CHEAT SHEET

When your lab instructor asks you questions during evaluation:

* **Q1: What 4 features did you implement?**  
  *Answer*: "I am Member 2. I implemented Service Request Creation in Module 1, Appointment Scheduling System in Module 2, Technician Availability Management in Module 3, and Service Progress Tracking in Module 3."
* **Q2: Which external APIs did you integrate?**  
  *Answer*: "Cloudinary API for multi-channel media uploads (photos/screenshots) and EmailJS API for instant appointment confirmation emails."
* **Q3: How does your conflict prevention work?**  
  *Answer*: "Before saving an appointment, `appointmentController.js` queries the database for existing appointments matching `technicianId + date + timeSlot`. If found, it halts and returns HTTP 409 Conflict."
* **Q4: How does Progress Tracking work?**  
  *Answer*: "Service requests progress through 6 stages: Pending, Assigned, Accepted, In Progress, On the Way, and Completed. Each stage change creates a timestamped entry in `statusLogs`."
