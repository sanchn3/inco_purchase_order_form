# 🏢 Logistics & Visitor Check-In Kiosk

A bilingual (English/Spanish) digital kiosk system designed for warehouse and office reception management. This system handles **Driver Pickups** and **Visitor/Delivery Entries**, saving data into separate CSV files via a Flask backend.

---

## 🚀 Features

* **Dual-Path Workflow**: Separate logic for logistics (drivers) and general visitors.
* **Bilingual Interface**: Professional English and Spanish labeling for all user actions..
* **Auto-Reset Loop**: Returns to the landing page 3 seconds after a successful check-in, ready for the next person.

## 🚀 How to Start the System
1. **Launch the Backend:**
   - Open your terminal/command prompt.
   - Navigate to the project folder.
   - Run: `python app.py`
   - *Keep this window open! If you close it, the form will not save data.*

2. **Open the Frontend:**
   - Double-click `landing.html` to open it in your browser (Chrome or Edge recommended).
   - Alternatively, use the **Kiosk Shortcut** (Alt+F4 to exit).

---

## 📁 Project Structure

```text
├── app.py                  # Flask Backend (Routes data to CSV)
├── landing.html            # Main Entry Point (The "Choice" Screen)
├── pickup.html             # Pickup/Outbound Form (Drivers)
├── delivery_visitor.html   # Delivery/Guest Form (Visitors)
├── script.js               # Unified Frontend Logic (Data collection & Fetch)
└── backend/
    └── data/               # Generated CSV storage
        ├── pickup.csv      # Log: PO, Temp, Cleanliness, Driver Name
        └── delivery.csv    # Log: Company, Reason, Visitor Name

## 🛠 Features & Restrictions
* **Auto-Date/Time:** The form automatically detects today's date on load.
* **Phone Formatting:** Restricts input to `123-456-7890` format.
* **Data Integrity:** Prevents submission if the phone number is incorrect or required fields are missing.
* **Self-Cleaning:** The "Thank You" message disappears after 20 seconds to prepare for the next user.

## ⚠️ Important Notes
* **Excel Lock:** Do NOT keep `delivery.csv` nor `pickup.csv` open in Excel while a driver is trying to sign in. Excel will lock the file, and the Python server will be unable to save the data.
* **Local Network:** This system is offline. Data is stored only on this computer.
* **Errors:** If the form fails to submit, check `system_activity.log` to see the error reason.