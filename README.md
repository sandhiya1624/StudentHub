# 🎓 Student Management System

> **IBM Mini Project** — Built with HTML5, CSS3 & Vanilla JavaScript

---

## 📌 Project Introduction

The **Student Management System** is a fully functional, browser-based web application built as a mini project following the IBM Web Development course. It allows users to register, view, search, edit, and delete student records directly in the browser — with zero backend infrastructure required.

All data is stored in the browser's **LocalStorage**, which means records persist even after closing or refreshing the tab.

---

## 🎯 Project Objectives

- Demonstrate mastery of HTML, CSS, and JavaScript fundamentals
- Implement full **CRUD** (Create, Read, Update, Delete) operations
- Build a responsive, professional user interface without external frameworks
- Use browser **LocalStorage** for client-side data persistence
- Apply form validation, DOM manipulation, and event handling

---

## 🛠 Technologies Used

| Technology     | Purpose                                      |
|----------------|----------------------------------------------|
| HTML5          | Semantic page structure and accessibility     |
| CSS3           | Styling, layout (Flexbox / Grid), animations |
| JavaScript ES6 | Logic, DOM manipulation, CRUD operations     |
| LocalStorage   | Client-side data persistence                 |

> ✅ No external libraries, frameworks, or backend required.

---

## ✨ Features

- **Dashboard** with live-updating stat cards (total students, active courses, session adds)
- **Student Registration Form** with field-level validation
- **Student ID auto-generation** (format: `STU-XXXXX`)
- **Data Table** with clean row design and hover effects
- **Edit Functionality** — inline form population for seamless updates
- **Delete with Confirmation** — safe deletion with browser dialog
- **Live Search** — real-time filter by name, email, or course
- **Toast Notifications** — coloured pop-up success/error messages
- **LocalStorage Persistence** — data survives page refresh
- **Responsive Design** — works on desktop, tablet, and mobile

---

## 📁 Folder Structure

```
Student-Management-System/
│
├── index.html   ← App shell: header, dashboard, form, table, footer
├── style.css    ← All styling: colours, layout, animations, responsive
├── script.js    ← All logic: CRUD, validation, search, LocalStorage
└── README.md    ← This documentation file
```

---

## 🚀 How to Run the Project

### Option 1 — Direct Open (Quickest)
1. Open your project folder.
2. Double-click **`index.html`**.
3. It opens in your default browser. Done!

### Option 2 — VS Code Live Server (Recommended for Development)
1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Open the project folder in VS Code.
4. Right-click `index.html` → **"Open with Live Server"**.
5. The app auto-refreshes every time you save a file.

---

## 📖 CRUD Operations Explained

### ➕ CREATE — Add a New Student
1. Fill in the **Student Registration Form** (Name, Email, Course, Phone).
2. Click **"Add Student"**.
3. The app validates all fields, generates a unique ID, adds the student to the data array, saves to LocalStorage, and refreshes the table.

### 📋 READ — View Student Records
- The table auto-loads all saved records when the page opens.
- Records are read from **LocalStorage** on startup.
- If no records exist, a friendly empty-state graphic is shown.

### ✏ UPDATE — Edit a Student
1. Click the **"✏ Edit"** button next to any student row.
2. The form fills with that student's current data.
3. Modify any field and click **"💾 Update Student"**.
4. The record is updated in the array and LocalStorage; the table refreshes.

### 🗑 DELETE — Remove a Student
1. Click the **"🗑 Delete"** button next to any student row.
2. A confirmation dialog appears with the student's name and ID.
3. Click **OK** to confirm. The record is permanently removed from the array and LocalStorage.

---

## 💾 LocalStorage Explained

The browser's `localStorage` is a simple key-value store built into every browser. It stores data as text strings and keeps them even after the browser is closed.

| Operation          | JavaScript Code                                       |
|--------------------|-------------------------------------------------------|
| Save data          | `localStorage.setItem('key', JSON.stringify(array))` |
| Load data          | `JSON.parse(localStorage.getItem('key'))`             |
| Delete all data    | `localStorage.removeItem('key')`                      |
| View in DevTools   | F12 → Application → Local Storage                     |

> **Note:** LocalStorage has a ~5 MB limit and is browser-specific. It is not shared between different browsers or devices.

---

## ✅ Validation Rules

| Field  | Rule                                    |
|--------|-----------------------------------------|
| Name   | Required, minimum 2 characters          |
| Email  | Required, valid email format, unique    |
| Course | Required, minimum 2 characters          |
| Phone  | Required, exactly 10 digits             |

---

## 🧪 Testing Checklist

| Test                            | Expected Result                              |
|---------------------------------|----------------------------------------------|
| Add a student                   | Row appears in table; toast shows success    |
| Submit empty form               | Red field errors appear                      |
| Enter invalid email             | Email field highlighted with error           |
| Enter duplicate email           | Error: "Email already registered"            |
| Refresh page                    | All students re-load from LocalStorage       |
| Click Edit on a student         | Form fills with their data                   |
| Update and save                 | Table row updates; toast shows success       |
| Click Delete → Cancel           | Record is NOT removed                        |
| Click Delete → OK               | Record removed; table updates                |
| Type in search box              | Table filters live by name / email / course  |
| Clear search                    | Full table is restored                       |
| Resize browser window           | Layout adapts for tablet and mobile          |

---

## 👨‍💻 Author

Built as a first mini project after completing the **IBM Web Development** course.  
Technologies: HTML5 · CSS3 · JavaScript (Vanilla) · Browser LocalStorage
