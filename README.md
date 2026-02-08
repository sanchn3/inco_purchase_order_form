# 📋 Driver Sign-In & PO Management System

A localized web-based sign-in system designed for industrial environments to track truck arrivals, Purchase Orders, and temperatures.

## 🚀 How to Start the System
1. **Launch the Backend:**
   - Open your terminal/command prompt.
   - Navigate to the project folder.
   - Run: `python app.py`
   - *Keep this window open! If you close it, the form will not save data.*

2. **Open the Frontend:**
   - Double-click `index.html` to open it in your browser (Chrome or Edge recommended).
   - Alternatively, use the **Kiosk Shortcut** (Alt+F4 to exit).

---

## 📂 Project Structure
* `index.html`: The user interface (The form).
* `script.js`: Handles real-time phone formatting, form validation, and the 20-second "Thank You" timer.
* `app.py`: The Python (Flask) server that receives data.
* `submissions.csv`: **Your Data.** Open this in Excel to view all sign-ins.
* `system_activity.log`: **System History.** A text file recording every successful save or error.

---

## 🛠 Features & Restrictions
* **Auto-Date/Time:** The form automatically detects today's date on load.
* **Phone Formatting:** Restricts input to `123-456-7890` format.
* **Data Integrity:** Prevents submission if the phone number is incorrect or required fields are missing.
* **Self-Cleaning:** The "Thank You" message disappears after 20 seconds to prepare for the next user.

---

## ⚠️ Important Notes
* **Excel Lock:** Do NOT keep `submissions.csv` open in Excel while a driver is trying to sign in. Excel will lock the file, and the Python server will be unable to save the data.
* **Local Network:** This system is offline. Data is stored only on this computer.
* **Errors:** If the form fails to submit, check `system_activity.log` to see the error reason.