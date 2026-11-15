/* ================================================================
   STUDENT MANAGEMENT SYSTEM — script.js
   Full CRUD + Search + Validation + LocalStorage
   Written in beginner-friendly, heavily commented Vanilla JS
   ================================================================ */


/* ----------------------------------------------------------------
   SECTION 1 — GLOBAL STATE
   These variables are "alive" for the entire lifetime of the page.
   ---------------------------------------------------------------- */

/**
 * The key we use to save/load data in localStorage.
 * Using a constant avoids typos when we reference it multiple times.
 */
const STORAGE_KEY = 'sms_students_data';

/**
 * Our main in-memory array of student objects.
 * Every object looks like:
 * {
 *   id:         "STU-12345",
 *   name:       "Alice Johnson",
 *   email:      "alice@email.com",
 *   course:     "Web Development",
 *   phone:      "9876543210",
 *   createdAt:  "15 Nov 2024"
 * }
 */
let students = [];

/**
 * Tracks whether we are currently editing an existing student.
 * - null  → we are in ADD mode (create a new student)
 * - "STU-XXXXX" → we are in EDIT mode (update that student)
 */
let currentEditId = null;

/** Counts how many students were added during the current browser session. */
let sessionAddCount = 0;


/* ----------------------------------------------------------------
   SECTION 2 — DOM ELEMENT REFERENCES
   We "grab" (select) HTML elements once and store them in
   variables.  This is faster than calling getElementById() every
   time we need an element.
   ---------------------------------------------------------------- */
const studentForm    = document.getElementById('studentForm');
const nameInput      = document.getElementById('studentName');
const emailInput     = document.getElementById('studentEmail');
const courseInput    = document.getElementById('studentCourse');
const phoneInput     = document.getElementById('studentPhone');
const editStudentId  = document.getElementById('editStudentId');  // hidden input

const submitBtn      = document.getElementById('submitBtn');
const cancelBtn      = document.getElementById('cancelBtn');

const tableBody      = document.getElementById('tableBody');
const emptyState     = document.getElementById('emptyState');
const searchInput    = document.getElementById('searchInput');

const toast          = document.getElementById('toast');
const toastMessage   = document.getElementById('toastMessage');
const toastIcon      = document.getElementById('toastIcon');

// Dashboard stat elements
const totalStudentsEl  = document.getElementById('totalStudents');
const totalCoursesEl   = document.getElementById('totalCourses');
const recentlyAddedEl  = document.getElementById('recentlyAdded');
const headerCountEl    = document.getElementById('headerCount');

// Form heading elements (they change between Add and Edit mode)
const formTitle    = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');

// Field-level error elements
const nameError   = document.getElementById('nameError');
const emailError  = document.getElementById('emailError');
const courseError = document.getElementById('courseError');
const phoneError  = document.getElementById('phoneError');


/* ----------------------------------------------------------------
   SECTION 3 — LOCALSTORAGE HELPERS
   Two simple functions to load and save our students array.
   ---------------------------------------------------------------- */

/**
 * loadFromStorage()
 * Reads the students array from localStorage.
 * JSON.parse() converts the stored text string back into a JS array.
 * If nothing is stored yet, we return an empty array [].
 */
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  // If raw is null (nothing saved yet), use an empty array
  return raw ? JSON.parse(raw) : [];
}

/**
 * saveToStorage()
 * Writes our in-memory 'students' array to localStorage.
 * JSON.stringify() converts the JS array into a text string
 * because localStorage can only store text.
 */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}


/* ----------------------------------------------------------------
   SECTION 4 — ID GENERATOR
   Creates a unique student ID like "STU-47392"
   ---------------------------------------------------------------- */

/**
 * generateId()
 * Math.random()         → produces a decimal like 0.473920...
 * * 90000               → scales it to 0–90000
 * + 10000               → shifts range to 10000–99999 (always 5 digits)
 * Math.floor(...)       → removes the decimal part
 * "STU-" + number       → produces e.g. "STU-47392"
 */
function generateId() {
  const number = Math.floor(Math.random() * 90000) + 10000;
  return 'STU-' + number;
}


/* ----------------------------------------------------------------
   SECTION 5 — VALIDATION
   Each function checks one field and returns true (valid) or
   false (invalid).  It also shows/clears the red error message.
   ---------------------------------------------------------------- */

/**
 * clearErrors()
 * Removes all red borders and error messages before each validation run.
 */
function clearErrors() {
  [nameInput, emailInput, courseInput, phoneInput].forEach(function(input) {
    input.classList.remove('input-error');
  });
  nameError.textContent   = '';
  emailError.textContent  = '';
  courseError.textContent = '';
  phoneError.textContent  = '';
}

/**
 * showFieldError(input, errorEl, message)
 * Adds the red "input-error" CSS class to the input field
 * and sets the error message text below it.
 *
 * @param {HTMLElement} input   - The input element to highlight
 * @param {HTMLElement} errorEl - The <span> that shows the error text
 * @param {string}      message - The human-readable error message
 */
function showFieldError(input, errorEl, message) {
  input.classList.add('input-error');
  errorEl.textContent = message;
}

/**
 * validateForm()
 * Runs all field-level validations and returns true only if
 * ALL fields pass.  Stops checking further as soon as one fails.
 *
 * Rules:
 *  - Name:   not empty, at least 2 characters
 *  - Email:  not empty, must match a valid email pattern
 *  - Course: not empty, at least 2 characters
 *  - Phone:  exactly 10 digits
 *  - Email must be unique (unless we're editing the SAME student)
 */
function validateForm() {
  clearErrors();   // reset previous errors first

  let isValid = true;

  /* -- NAME -- */
  const name = nameInput.value.trim();
  if (name === '') {
    showFieldError(nameInput, nameError, '⚠ Full name is required.');
    isValid = false;
  } else if (name.length < 2) {
    showFieldError(nameInput, nameError, '⚠ Name must be at least 2 characters.');
    isValid = false;
  }

  /* -- EMAIL --
     The regex below is a standard email pattern:
     [^\s@]+ means "one or more chars that are not space or @"
     @ means the @ symbol must be present
     [^\s@]+ means the domain part (e.g. "gmail")
     \. means a literal dot
     [^\s@]+ means the top-level domain (e.g. "com")
  */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = emailInput.value.trim();
  if (email === '') {
    showFieldError(emailInput, emailError, '⚠ Email address is required.');
    isValid = false;
  } else if (!emailRegex.test(email)) {
    showFieldError(emailInput, emailError, '⚠ Please enter a valid email address.');
    isValid = false;
  }

  /* -- COURSE -- */
  const course = courseInput.value.trim();
  if (course === '') {
    showFieldError(courseInput, courseError, '⚠ Course name is required.');
    isValid = false;
  } else if (course.length < 2) {
    showFieldError(courseInput, courseError, '⚠ Course must be at least 2 characters.');
    isValid = false;
  }

  /* -- PHONE --
     /^\d{10}$/ means: start (^), exactly 10 digits (\d{10}), end ($).
     \d matches any digit 0–9.
  */
  const phoneRegex = /^\d{10}$/;
  const phone = phoneInput.value.trim();
  if (phone === '') {
    showFieldError(phoneInput, phoneError, '⚠ Phone number is required.');
    isValid = false;
  } else if (!phoneRegex.test(phone)) {
    showFieldError(phoneInput, phoneError, '⚠ Phone must be exactly 10 digits.');
    isValid = false;
  }

  /* -- DUPLICATE EMAIL CHECK --
     .some() returns true if ANY student in the array matches.
     In edit mode we skip the student we are currently editing
     (because they already have that email).
  */
  if (isValid) {
    const duplicate = students.some(function(student) {
      // Skip the student being edited
      if (currentEditId && student.id === currentEditId) return false;
      return student.email.toLowerCase() === email.toLowerCase();
    });
    if (duplicate) {
      showFieldError(emailInput, emailError, '⚠ This email is already registered.');
      isValid = false;
    }
  }

  return isValid;  // true = all good, false = at least one error
}


/* ----------------------------------------------------------------
   SECTION 6 — TOAST NOTIFICATION
   Shows a coloured pop-up message at the bottom-right of the screen.
   ---------------------------------------------------------------- */

/** Timer reference so we can cancel a pending hide if a new toast comes in. */
let toastTimer = null;

/**
 * showToast(message, type)
 * Displays the toast popup for 3 seconds then hides it.
 *
 * @param {string} message  - The text to display
 * @param {string} type     - Either 'success' or 'error'
 */
function showToast(message, type) {
  // Clear any previous timer so we don't get overlapping hides
  if (toastTimer) clearTimeout(toastTimer);

  // Set icon and message text
  toastIcon.textContent    = type === 'success' ? '✅' : '❌';
  toastMessage.textContent = message;

  // Remove old type classes, add the right one, then show
  toast.classList.remove('success', 'error', 'show');
  toast.classList.add(type, 'show');

  // Auto-hide after 3.2 seconds
  toastTimer = setTimeout(function() {
    toast.classList.remove('show');
  }, 3200);
}


/* ----------------------------------------------------------------
   SECTION 7 — DASHBOARD STATS
   Updates the three stat cards and the header counter.
   ---------------------------------------------------------------- */

/**
 * updateStats()
 * Called every time the students array changes (add / edit / delete).
 *
 * "Unique courses" — we use a Set, which automatically removes duplicates.
 * new Set([...])  builds a Set from the array of course names.
 * .size           gives the count of unique entries.
 */
function updateStats() {
  const total = students.length;
  const uniqueCourses = new Set(students.map(function(s) {
    return s.course.toLowerCase();
  })).size;

  totalStudentsEl.textContent  = total;
  totalCoursesEl.textContent   = uniqueCourses;
  recentlyAddedEl.textContent  = sessionAddCount;
  headerCountEl.textContent    = total + (total === 1 ? ' Student Enrolled' : ' Students Enrolled');
}


/* ----------------------------------------------------------------
   SECTION 8 — RENDER (READ / DISPLAY)
   Builds the HTML table rows from an array of student objects.
   ---------------------------------------------------------------- */

/**
 * renderStudents(list)
 * Clears the table body and rebuilds it from the given array.
 * We always pass either the full 'students' array or the filtered
 * search results.
 *
 * We use document.createElement() instead of innerHTML for safety
 * (prevents XSS / script injection attacks from user input).
 *
 * @param {Array} list - The array of student objects to display
 */
function renderStudents(list) {
  // 1. Wipe current rows
  tableBody.innerHTML = '';

  // 2. If no students, show empty-state graphic, hide table
  if (list.length === 0) {
    emptyState.classList.add('show');
    document.querySelector('.table-wrapper').style.display = 'none';
  } else {
    emptyState.classList.remove('show');
    document.querySelector('.table-wrapper').style.display = '';
  }

  // 3. Build one <tr> per student
  list.forEach(function(student, index) {

    // Create the row element
    const row = document.createElement('tr');

    // Create each cell using textContent (never innerHTML with user data)
    const cells = [
      index + 1,                 // serial number
      createIdBadge(student.id), // styled badge (returns a DOM node)
      student.name,
      student.email,
      createCourseBadge(student.course),
      student.phone,
      student.createdAt
    ];

    // First cell: serial number
    const tdNum = document.createElement('td');
    tdNum.textContent = index + 1;
    row.appendChild(tdNum);

    // Second cell: ID badge (already a DOM node)
    const tdId = document.createElement('td');
    tdId.appendChild(createIdBadge(student.id));
    row.appendChild(tdId);

    // Name cell
    const tdName = document.createElement('td');
    tdName.textContent = student.name;
    row.appendChild(tdName);

    // Email cell
    const tdEmail = document.createElement('td');
    tdEmail.textContent = student.email;
    row.appendChild(tdEmail);

    // Course badge cell
    const tdCourse = document.createElement('td');
    tdCourse.appendChild(createCourseBadge(student.course));
    row.appendChild(tdCourse);

    // Phone cell
    const tdPhone = document.createElement('td');
    tdPhone.textContent = student.phone;
    row.appendChild(tdPhone);

    // Date cell
    const tdDate = document.createElement('td');
    tdDate.textContent = student.createdAt;
    row.appendChild(tdDate);

    // Actions cell (Edit + Delete buttons)
    const tdActions = document.createElement('td');
    tdActions.appendChild(createActionButtons(student.id));
    row.appendChild(tdActions);

    // Add the completed row to the table body
    tableBody.appendChild(row);
  });
}

/**
 * createIdBadge(id)
 * Returns a styled <span> element for the student ID.
 */
function createIdBadge(id) {
  const span = document.createElement('span');
  span.className   = 'id-badge';
  span.textContent = id;
  return span;
}

/**
 * createCourseBadge(course)
 * Returns a styled <span> element for the course name.
 */
function createCourseBadge(course) {
  const span = document.createElement('span');
  span.className   = 'course-badge';
  span.textContent = course;
  return span;
}

/**
 * createActionButtons(studentId)
 * Returns a <div> containing Edit and Delete buttons.
 * We store the student's ID in a data-id attribute so we know
 * which student to act on when the button is clicked.
 */
function createActionButtons(studentId) {
  const wrapper = document.createElement('div');
  wrapper.className = 'action-btns';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className       = 'btn btn-edit';
  editBtn.textContent     = '✏ Edit';
  editBtn.dataset.id      = studentId;        // stores ID in HTML
  editBtn.dataset.action  = 'edit';           // action identifier
  wrapper.appendChild(editBtn);

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className       = 'btn btn-delete';
  delBtn.textContent     = '🗑 Delete';
  delBtn.dataset.id      = studentId;
  delBtn.dataset.action  = 'delete';
  wrapper.appendChild(delBtn);

  return wrapper;
}


/* ----------------------------------------------------------------
   SECTION 9 — CREATE (Add New Student)
   ---------------------------------------------------------------- */

/**
 * createStudent(data)
 * Adds a new student object to the array and saves to localStorage.
 *
 * @param {object} data - { name, email, course, phone }
 */
function createStudent(data) {
  // Build the new student record
  const newStudent = {
    id:        generateId(),
    name:      data.name,
    email:     data.email,
    course:    data.course,
    phone:     data.phone,
    createdAt: formatDate(new Date())  // e.g. "15 Nov 2024"
  };

  // Add to the front of the array so the newest student appears first
  students.unshift(newStudent);

  // Persist to localStorage so data survives page refresh
  saveToStorage();

  // Increment the session counter
  sessionAddCount++;

  return newStudent;
}

/**
 * formatDate(dateObj)
 * Converts a JavaScript Date object into a readable string.
 * e.g.  new Date()  →  "15 Nov 2024"
 */
function formatDate(dateObj) {
  return dateObj.toLocaleDateString('en-GB', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric'
  });
}


/* ----------------------------------------------------------------
   SECTION 10 — UPDATE (Edit Existing Student)
   ---------------------------------------------------------------- */

/**
 * initEditStudent(id)
 * Switches the UI to "edit mode" for the given student ID.
 * Populates the form fields with the student's current data.
 *
 * @param {string} id - The student ID to edit (e.g. "STU-47392")
 */
function initEditStudent(id) {
  // Find the student in our array
  const student = students.find(function(s) { return s.id === id; });
  if (!student) return;  // safety check

  // Fill the form inputs with existing data
  nameInput.value   = student.name;
  emailInput.value  = student.email;
  courseInput.value = student.course;
  phoneInput.value  = student.phone;

  // Store the ID in the hidden input and in our tracking variable
  editStudentId.value = id;
  currentEditId       = id;

  // Update the form heading and button text
  formTitle.textContent    = '✏ Edit Student Record';
  formSubtitle.textContent = 'Modify the details below and click "Update Student".';
  submitBtn.textContent    = '💾 Update Student';

  // Scroll up smoothly so the user sees the form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * updateStudent(id, updatedData)
 * Finds the student by ID, replaces their data, and saves.
 *
 * @param {string} id          - The student's ID
 * @param {object} updatedData - { name, email, course, phone }
 */
function updateStudent(id, updatedData) {
  // .findIndex() returns the array position (index) of the student
  const index = students.findIndex(function(s) { return s.id === id; });
  if (index === -1) return;  // not found — safety check

  // Update the fields (keep the original id and createdAt)
  students[index].name   = updatedData.name;
  students[index].email  = updatedData.email;
  students[index].course = updatedData.course;
  students[index].phone  = updatedData.phone;

  saveToStorage();
}


/* ----------------------------------------------------------------
   SECTION 11 — DELETE
   ---------------------------------------------------------------- */

/**
 * deleteStudent(id)
 * Asks for confirmation, removes the student, updates storage and UI.
 *
 * @param {string} id - The student's ID to remove
 */
function deleteStudent(id) {
  // Find the student so we can show their name in the confirm dialog
  const student = students.find(function(s) { return s.id === id; });
  if (!student) return;

  // window.confirm() shows a browser dialog with OK / Cancel buttons.
  // It returns true if the user clicks OK, false if they click Cancel.
  const confirmed = window.confirm(
    '⚠ Delete Student?\n\n' +
    'Name: ' + student.name + '\n' +
    'ID: '   + student.id   + '\n\n' +
    'This action cannot be undone.'
  );

  if (!confirmed) return;  // user cancelled — do nothing

  // .filter() creates a NEW array that excludes the deleted student
  students = students.filter(function(s) { return s.id !== id; });

  saveToStorage();
  renderStudents(students);
  updateStats();
  showToast('Student "' + student.name + '" deleted successfully.', 'success');
}


/* ----------------------------------------------------------------
   SECTION 12 — SEARCH / FILTER
   ---------------------------------------------------------------- */

/**
 * handleSearch(query)
 * Filters the students array and re-renders the table.
 * Matching is case-insensitive and checks name, email, and course.
 *
 * @param {string} query - The user's search text
 */
function handleSearch(query) {
  const q = query.toLowerCase().trim();

  if (q === '') {
    // No query → show all students
    renderStudents(students);
    return;
  }

  // .filter() keeps only students where at least one field includes the query
  const results = students.filter(function(student) {
    return (
      student.name.toLowerCase().includes(q)   ||
      student.email.toLowerCase().includes(q)  ||
      student.course.toLowerCase().includes(q)
    );
  });

  renderStudents(results);
}


/* ----------------------------------------------------------------
   SECTION 13 — RESET FORM
   Clears all inputs and returns to "Add" mode.
   ---------------------------------------------------------------- */

/**
 * resetForm()
 * Clears form fields, removes validation styling,
 * and resets the UI heading / button text back to "Add" mode.
 */
function resetForm() {
  studentForm.reset();          // clears all input values
  clearErrors();                // removes red borders and messages
  currentEditId       = null;   // exit edit mode
  editStudentId.value = '';     // clear the hidden input

  formTitle.textContent    = '📝 Register New Student';
  formSubtitle.textContent = 'Fill in all the fields below to add a new student.';
  submitBtn.textContent    = '➕ Add Student';

  nameInput.focus();   // move keyboard focus to the first field
}


/* ----------------------------------------------------------------
   SECTION 14 — EVENT LISTENERS
   These are the "triggers" that connect user actions to our functions.
   ---------------------------------------------------------------- */

/**
 * FORM SUBMIT
 * Fires when the user clicks "Add Student" or "Update Student".
 * event.preventDefault() stops the page from refreshing (default form behaviour).
 */
studentForm.addEventListener('submit', function(event) {
  event.preventDefault();   // ← VERY IMPORTANT: prevents page reload

  // Gather and trim the input values
  const formData = {
    name:   nameInput.value.trim(),
    email:  emailInput.value.trim(),
    course: courseInput.value.trim(),
    phone:  phoneInput.value.trim()
  };

  // Run validation; stop here if anything fails
  if (!validateForm()) {
    showToast('Please fix the errors in the form.', 'error');
    return;
  }

  if (currentEditId) {
    /* ---- UPDATE MODE ---- */
    updateStudent(currentEditId, formData);
    renderStudents(students);
    updateStats();
    showToast('Student updated successfully! ✏', 'success');
    resetForm();
  } else {
    /* ---- CREATE MODE ---- */
    const newStudent = createStudent(formData);
    renderStudents(students);
    updateStats();
    showToast('Student "' + newStudent.name + '" registered! 🎉', 'success');
    resetForm();
  }
});


/**
 * CANCEL / RESET BUTTON
 * Resets the form without saving anything.
 */
cancelBtn.addEventListener('click', function() {
  resetForm();
  searchInput.value = '';      // also clear the search box
  renderStudents(students);    // restore full table
});


/**
 * SEARCH INPUT
 * Uses the 'input' event which fires on every keystroke — giving
 * real-time / live search filtering.
 */
searchInput.addEventListener('input', function() {
  handleSearch(searchInput.value);
});


/**
 * TABLE ACTIONS (Edit & Delete buttons)
 *
 * Instead of adding a click listener to every button (which is
 * slow and messy), we use "Event Delegation": we add ONE listener
 * to the parent <tbody>.  When any button inside it is clicked,
 * the event "bubbles up" to the tbody and we handle it here.
 *
 * event.target gives us the element that was actually clicked.
 * dataset.id   gives us the student ID stored in data-id="..."
 * dataset.action gives us "edit" or "delete"
 */
tableBody.addEventListener('click', function(event) {
  // Find the nearest button (handles clicks on icon inside button too)
  const btn = event.target.closest('button');
  if (!btn) return;  // click was not on a button — ignore

  const studentId = btn.dataset.id;
  const action    = btn.dataset.action;

  if (action === 'edit') {
    initEditStudent(studentId);
  } else if (action === 'delete') {
    deleteStudent(studentId);
  }
});


/* ----------------------------------------------------------------
   SECTION 15 — INITIALISATION (App Startup)
   This runs once when the page finishes loading.
   ---------------------------------------------------------------- */

/**
 * init()
 * The entry point of the application.
 * Loads saved data from localStorage and renders the initial table.
 */
function init() {
  // Load persisted students from localStorage into our in-memory array
  students = loadFromStorage();

  // Build the table with whatever data we have (empty array → empty state)
  renderStudents(students);

  // Update the dashboard stat cards
  updateStats();

  // Put focus on the first form field for a good UX start
  nameInput.focus();
}

// 'DOMContentLoaded' fires as soon as the HTML is fully parsed
// but before images and stylesheets finish loading.
// This is the standard, safe time to run setup code.
document.addEventListener('DOMContentLoaded', init);
