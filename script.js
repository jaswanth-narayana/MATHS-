/**
 * ===================================================================
 * ANALYSIS OF DAILY EXPENSES OF COLLEGE STUDENTS
 * Mathematics & Statistics Term Project - Interactive Dashboard Logic
 * ===================================================================
 */

// Global State
const STORAGE_KEY = 'stat_expense_data';
let studentData = [];
let chartSortOrder = 'original'; // 'original', 'asc', 'desc'

// Chart.js Instances
let histogramChart = null;
let pieChart = null;
let individualBarChart = null;
let scatterChart = null;

// ===================================================================
// 30 REALISTIC SAMPLE EXPENSE RECORDS
// Realistic daily expenses (in ₹) and study hours for college students
// ===================================================================
const SAMPLE_STUDENTS = [
  { id: "STU-101", name: "Aarav Sharma", expense: 140, studyHours: 5.0 },
  { id: "STU-102", name: "Priya Patel", expense: 220, studyHours: 3.5 },
  { id: "STU-103", name: "Rohan Verma", expense: 90, studyHours: 6.0 },
  { id: "STU-104", name: "Ananya Iyer", expense: 310, studyHours: 4.0 },
  { id: "STU-105", name: "Vikram Singh", expense: 180, studyHours: 4.5 },
  { id: "STU-106", name: "Sneha Reddy", expense: 120, studyHours: 5.5 },
  { id: "STU-107", name: "Rahul Mehta", expense: 450, studyHours: 2.0 },
  { id: "STU-108", name: "Pooja Nair", expense: 75, studyHours: 7.0 },
  { id: "STU-109", name: "Aditya Joshi", expense: 260, studyHours: 3.0 },
  { id: "STU-110", name: "Neha Gupta", expense: 190, studyHours: 4.5 },
  { id: "STU-111", name: "Siddharth Rao", expense: 150, studyHours: 5.0 },
  { id: "STU-112", name: "Kavya Deshmukh", expense: 85, studyHours: 6.5 },
  { id: "STU-113", name: "Arjun Das", expense: 380, studyHours: 2.5 },
  { id: "STU-114", name: "Riya Sen", expense: 210, studyHours: 4.0 },
  { id: "STU-115", name: "Manish Kumar", expense: 130, studyHours: 5.0 },
  { id: "STU-116", name: "Divya Pillai", expense: 175, studyHours: 4.5 },
  { id: "STU-117", name: "Harsh Vardhan", expense: 520, studyHours: 1.5 },
  { id: "STU-118", name: "Ishita Bhatt", expense: 95, studyHours: 6.0 },
  { id: "STU-119", name: "Karan Malhotra", expense: 280, studyHours: 3.5 },
  { id: "STU-120", name: "Tanvi Chawla", expense: 160, studyHours: 4.0 },
  { id: "STU-121", name: "Nikhil Bansal", expense: 110, studyHours: 5.5 },
  { id: "STU-122", name: "Meera Menon", expense: 240, studyHours: 3.0 },
  { id: "STU-123", name: "Varun Saxena", expense: 340, studyHours: 2.5 },
  { id: "STU-124", name: "Shreya Ghosh", expense: 195, studyHours: 4.5 },
  { id: "STU-125", name: "Kunal Tiwari", expense: 65, studyHours: 7.5 },
  { id: "STU-126", name: "Aditi Kulkarni", expense: 145, studyHours: 5.0 },
  { id: "STU-127", name: "Gaurav Jain", expense: 420, studyHours: 2.0 },
  { id: "STU-128", name: "Pallavi Pandey", expense: 165, studyHours: 4.5 },
  { id: "STU-129", name: "Aman Mishra", expense: 230, studyHours: 3.5 },
  { id: "STU-130", name: "Simran Kaur", expense: 290, studyHours: 3.0 }
];

// ===================================================================
// INITIALIZATION & EVENT LISTENERS
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  setupEventListeners();
  updateAll();
});

/**
 * Initialize storage with default sample data if empty
 */
function initStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      studentData = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse local storage data, resetting.", e);
      studentData = [...SAMPLE_STUDENTS];
      saveData();
    }
  } else {
    // Populate with 30 realistic sample records on first visit
    studentData = [...SAMPLE_STUDENTS];
    saveData();
  }
}

/**
 * Save data to browser's LocalStorage
 */
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(studentData));
}

/**
 * Setup DOM event handlers
 */
function setupEventListeners() {
  // Mobile Nav Toggle
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Smooth Active Nav on Scroll
  window.addEventListener('scroll', handleScrollSpy);

  // Form Submit (Add or Edit)
  const form = document.getElementById('expenseForm');
  form.addEventListener('submit', handleFormSubmit);

  // Cancel Edit Button
  document.getElementById('btnCancelEdit').addEventListener('click', resetForm);

  // Load Sample Data Buttons
  document.getElementById('btnLoadSample').addEventListener('click', loadSampleData);
  document.getElementById('btnQuickSample').addEventListener('click', loadSampleData);
  document.getElementById('heroLoadSampleBtn').addEventListener('click', loadSampleData);

  // Clear All Data
  document.getElementById('btnClearAll').addEventListener('click', clearAllData);

  // Print Report Button
  document.getElementById('btnPrintReport').addEventListener('click', () => window.print());

  // Search in Table
  document.getElementById('tableSearch').addEventListener('input', handleTableSearch);

  // Chart Sort Order Toggles
  document.getElementById('btnSortExpenseOrder').addEventListener('click', (e) => setChartSort('original', e.target));
  document.getElementById('btnSortExpenseAsc').addEventListener('click', (e) => setChartSort('asc', e.target));
  document.getElementById('btnSortExpenseDesc').addEventListener('click', (e) => setChartSort('desc', e.target));

  // Modal Close Events
  document.getElementById('modalCloseBtn').addEventListener('click', closeFormulaModal);
  document.getElementById('modalGotItBtn').addEventListener('click', closeFormulaModal);
  document.getElementById('formulaModal').addEventListener('click', (e) => {
    if (e.target.id === 'formulaModal') closeFormulaModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFormulaModal();
  });
}

function handleScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;

  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 120;
    const sectionId = current.getAttribute('id');
    const navLink = document.querySelector(`.nav-links a[href*=${sectionId}]`);

    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      if (navLink) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        navLink.classList.add('active');
      }
    }
  });
}

// ===================================================================
// DATA MANIPULATION & CRUD
// ===================================================================

/**
 * Handle form submission for adding or editing
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const editIndex = parseInt(document.getElementById('editIndex').value, 10);
  const studentId = document.getElementById('studentId').value.trim();
  const studentName = document.getElementById('studentName').value.trim();
  const dailyExpense = parseFloat(document.getElementById('dailyExpense').value);
  const studyHoursVal = document.getElementById('studyHours').value.trim();
  const studyHours = studyHoursVal !== "" ? parseFloat(studyHoursVal) : null;

  if (!studentId || !studentName || isNaN(dailyExpense) || dailyExpense <= 0) {
    showToast("Please provide valid student details and expense > ₹0.", "danger");
    return;
  }

  // Check unique ID if new or changing ID
  const duplicate = studentData.some((st, idx) => st.id.toLowerCase() === studentId.toLowerCase() && idx !== editIndex);
  if (duplicate) {
    showToast(`Student ID "${studentId}" already exists. Please use a unique ID.`, "danger");
    return;
  }

  const record = {
    id: studentId,
    name: studentName,
    expense: dailyExpense,
    studyHours: studyHours
  };

  if (editIndex >= 0 && editIndex < studentData.length) {
    // Update existing
    studentData[editIndex] = record;
    showToast(`Student record for ${studentName} updated successfully!`, "success");
  } else {
    // Add new
    studentData.push(record);
    showToast(`Student ${studentName} added successfully!`, "success");
  }

  saveData();
  resetForm();
  updateAll();
}

/**
 * Prepare form for editing an existing record
 */
function editStudent(index) {
  if (index < 0 || index >= studentData.length) return;
  const student = studentData[index];

  document.getElementById('editIndex').value = index;
  document.getElementById('studentId').value = student.id;
  document.getElementById('studentName').value = student.name;
  document.getElementById('dailyExpense').value = student.expense;
  document.getElementById('studyHours').value = student.studyHours !== null ? student.studyHours : '';

  document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Student Record';
  document.getElementById('formModeBadge').textContent = 'Editing #' + (index + 1);
  document.getElementById('submitBtnText').textContent = 'Update Student';
  document.getElementById('btnCancelEdit').style.display = 'block';

  // Smooth scroll to form
  document.getElementById('data-entry').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete a student record
 */
function deleteStudent(index) {
  if (index < 0 || index >= studentData.length) return;
  const student = studentData[index];
  const confirmDelete = confirm(`Are you sure you want to delete the record for ${student.name} (${student.id})?`);
  if (!confirmDelete) return;

  studentData.splice(index, 1);
  saveData();
  showToast(`Deleted ${student.name}'s record.`, "info");
  resetForm();
  updateAll();
}

/**
 * Reset form back to Add mode
 */
function resetForm() {
  document.getElementById('expenseForm').reset();
  document.getElementById('editIndex').value = '-1';
  document.getElementById('formTitle').innerHTML = '<i class="fa-solid fa-user-plus"></i> Add Student Record';
  document.getElementById('formModeBadge').textContent = 'New Record';
  document.getElementById('submitBtnText').textContent = 'Add Student';
  document.getElementById('btnCancelEdit').style.display = 'none';

  // Auto-suggest next Student ID
  const nextNumber = studentData.length + 101;
  document.getElementById('studentId').value = `STU-${nextNumber}`;
}

/**
 * Load default 30 sample students
 */
function loadSampleData() {
  const proceed = studentData.length === 0 || confirm("Replace current dataset with the 30 standard realistic sample student records?");
  if (!proceed) return;

  studentData = JSON.parse(JSON.stringify(SAMPLE_STUDENTS));
  saveData();
  resetForm();
  updateAll();
  showToast("Loaded 30 sample student records successfully!", "success");
}

/**
 * Clear all data with confirmation
 */
function clearAllData() {
  if (studentData.length === 0) {
    showToast("Dataset is already empty.", "info");
    return;
  }
  const confirmClear = confirm("Are you sure you want to clear ALL student records? This cannot be undone.");
  if (!confirmClear) return;

  studentData = [];
  saveData();
  resetForm();
  updateAll();
  showToast("All records have been cleared.", "danger");
}

/**
 * Filter table by student name or ID
 */
function handleTableSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  renderStudentTable(query);
}

// ===================================================================
// STATISTICAL CALCULATIONS (MATHEMATICALLY ACCURATE)
// ===================================================================

/**
 * Primary statistics calculator
 */
function computeStatistics(data) {
  const expenses = data.map(d => d.expense).filter(x => typeof x === 'number' && !isNaN(x));
  const n = expenses.length;

  if (n === 0) {
    return {
      n: 0,
      mean: 0,
      median: 0,
      mode: { text: "N/A", values: [], count: 0 },
      min: 0,
      max: 0,
      range: 0,
      sampleVariance: 0,
      populationVariance: 0,
      sampleStdDev: 0,
      populationStdDev: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      cv: 0
    };
  }

  // 1. Mean
  const sum = expenses.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Sorted values for order statistics
  const sorted = [...expenses].sort((a, b) => a - b);

  // 2. Median
  let median = 0;
  const mid = Math.floor(n / 2);
  if (n % 2 !== 0) {
    median = sorted[mid];
  } else {
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // 3. Mode
  const freqMap = {};
  let maxFreq = 0;
  expenses.forEach(x => {
    freqMap[x] = (freqMap[x] || 0) + 1;
    if (freqMap[x] > maxFreq) {
      maxFreq = freqMap[x];
    }
  });

  let modeObj = { text: "No Mode", values: [], count: 1 };
  if (maxFreq > 1) {
    const modes = Object.keys(freqMap)
      .filter(k => freqMap[k] === maxFreq)
      .map(k => parseFloat(k))
      .sort((a, b) => a - b);

    if (modes.length === 1) {
      modeObj = {
        text: `₹${modes[0].toFixed(1)} (appears ${maxFreq} times)`,
        values: modes,
        count: maxFreq
      };
    } else if (modes.length === 2) {
      modeObj = {
        text: `Bimodal: ₹${modes[0].toFixed(1)}, ₹${modes[1].toFixed(1)} (${maxFreq}x each)`,
        values: modes,
        count: maxFreq
      };
    } else {
      modeObj = {
        text: `Multimodal (${modes.length} values, ${maxFreq}x each)`,
        values: modes,
        count: maxFreq
      };
    }
  } else {
    modeObj = {
      text: "No Mode (All values unique)",
      values: [],
      count: 1
    };
  }

  // 4. Min & Max
  const min = sorted[0];
  const max = sorted[n - 1];

  // 5. Range
  const range = max - min;

  // 6. Variance
  // Sum of squared deviations: Σ(x - x̄)²
  const ss = expenses.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const sampleVariance = n > 1 ? ss / (n - 1) : 0;
  const populationVariance = ss / n;

  // 7. Standard Deviation
  const sampleStdDev = Math.sqrt(sampleVariance);
  const populationStdDev = Math.sqrt(populationVariance);

  // 8. Quartiles & IQR
  const q1 = getPercentile(sorted, 0.25);
  const q3 = getPercentile(sorted, 0.75);
  const iqr = q3 - q1;

  // 9. Coefficient of Variation (CV) = (s / x̄) * 100
  const cv = mean > 0 ? (sampleStdDev / mean) * 100 : 0;

  return {
    n,
    mean,
    median,
    mode: modeObj,
    min,
    max,
    range,
    sampleVariance,
    populationVariance,
    sampleStdDev,
    populationStdDev,
    q1,
    q3,
    iqr,
    cv
  };
}

/**
 * Compute percentile from sorted array
 */
function getPercentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  if (sortedArr.length === 1) return sortedArr[0];
  const pos = (sortedArr.length - 1) * p;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedArr[base + 1] !== undefined) {
    return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
  } else {
    return sortedArr[base];
  }
}

/**
 * Frequency Distribution calculation based on required brackets:
 * ₹0–₹100, ₹101–₹200, ₹201–₹300, ₹301–₹400, ₹401–₹500, ₹500+
 */
function computeFrequencyDistribution(data) {
  const expenses = data.map(d => d.expense);
  const n = expenses.length;

  const brackets = [
    { label: "₹0 – ₹100", min: 0, max: 100, midpoint: 50, count: 0 },
    { label: "₹101 – ₹200", min: 100.0001, max: 200, midpoint: 150.5, count: 0 },
    { label: "₹201 – ₹300", min: 200.0001, max: 300, midpoint: 250.5, count: 0 },
    { label: "₹301 – ₹400", min: 300.0001, max: 400, midpoint: 350.5, count: 0 },
    { label: "₹401 – ₹500", min: 400.0001, max: 500, midpoint: 450.5, count: 0 },
    { label: "₹500+", min: 500.0001, max: Infinity, midpoint: 550, count: 0 }
  ];

  expenses.forEach(x => {
    if (x <= 100) brackets[0].count++;
    else if (x <= 200) brackets[1].count++;
    else if (x <= 300) brackets[2].count++;
    else if (x <= 400) brackets[3].count++;
    else if (x <= 500) brackets[4].count++;
    else brackets[5].count++;
  });

  let cumFreq = 0;
  let maxCount = -1;
  let modalClass = null;

  const result = brackets.map(b => {
    cumFreq += b.count;
    const percentage = n > 0 ? (b.count / n) * 100 : 0;

    if (b.count > maxCount) {
      maxCount = b.count;
      modalClass = b.label;
    }

    return {
      ...b,
      cumulative: cumFreq,
      percentage: percentage
    };
  });

  return {
    rows: result,
    modalClass: maxCount > 0 ? modalClass : "None",
    maxCount
  };
}

/**
 * Bivariate Pearson Correlation: Study Hours (X) vs Daily Expense (Y)
 */
function computeCorrelation(data) {
  // Filter records with both studyHours and expense
  const pairs = data
    .filter(d => typeof d.studyHours === 'number' && !isNaN(d.studyHours) && typeof d.expense === 'number' && !isNaN(d.expense))
    .map(d => ({ x: d.studyHours, y: d.expense, name: d.name, id: d.id }));

  const n = pairs.length;
  if (n < 2) {
    return {
      n,
      r: 0,
      r2: 0,
      slope: 0,
      intercept: 0,
      pairs: [],
      strength: "Insufficient Data (Need at least 2 students with study hours)",
      interpretation: "Please enter study hours for at least 2 students to compute correlation."
    };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  pairs.forEach(p => {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  });

  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt(((n * sumX2) - Math.pow(sumX, 2)) * ((n * sumY2) - Math.pow(sumY, 2)));

  let r = 0;
  if (denominator !== 0) {
    r = numerator / denominator;
  }

  // Regression line y = mx + c
  const denomSlope = (n * sumX2) - Math.pow(sumX, 2);
  const slope = denomSlope !== 0 ? ((n * sumXY) - (sumX * sumY)) / denomSlope : 0;
  const intercept = (sumY - (slope * sumX)) / n;

  const r2 = Math.pow(r, 2) * 100;

  // Verbal strength categorization
  let strength = "";
  let interpretation = "";

  const absR = Math.abs(r);
  const direction = r < 0 ? "negative" : "positive";

  if (absR >= 0.7) strength = `Strong ${direction}`;
  else if (absR >= 0.4) strength = `Moderate ${direction}`;
  else if (absR >= 0.2) strength = `Weak ${direction}`;
  else strength = `Very Weak / Negligible`;

  if (r < -0.2) {
    interpretation = `Pearson's r = ${r.toFixed(3)} indicates a ${strength.toLowerCase()} correlation. As students spend more hours dedicated to daily self-study, their daily non-academic expenditure tends to decrease, likely due to reduced leisure and socialization outings.`;
  } else if (r > 0.2) {
    interpretation = `Pearson's r = ${r.toFixed(3)} indicates a ${strength.toLowerCase()} correlation. Higher study hours are associated with slightly higher expenses (e.g. library café visits, printouts, or books).`;
  } else {
    interpretation = `Pearson's r = ${r.toFixed(3)} indicates no meaningful linear relationship. Daily expenses appear largely independent of the number of hours students study per day.`;
  }

  return {
    n,
    r,
    r2,
    slope,
    intercept,
    pairs,
    strength,
    interpretation
  };
}

// ===================================================================
// UI RENDERING & UPDATES
// ===================================================================

/**
 * Master update pipeline
 */
function updateAll() {
  const stats = computeStatistics(studentData);
  const freqDist = computeFrequencyDistribution(studentData);
  const corr = computeCorrelation(studentData);

  renderDashboardKPIs(stats);
  renderStudentTable();
  renderStatisticsCards(stats);
  renderFrequencyTable(freqDist, stats.n);
  updateCharts(stats, freqDist, corr);
  renderInterpretation(stats, freqDist);
  renderCorrelationSection(corr);
  renderConclusion(stats, freqDist, corr);
}

/**
 * Update top KPI numbers in Section 1 (Dashboard)
 */
function renderDashboardKPIs(stats) {
  document.getElementById('kpiTotalStudents').textContent = stats.n;
  document.getElementById('kpiSampleSub').textContent = stats.n === 1 ? '1 student record' : `${stats.n} student records`;
  document.getElementById('kpiAverageExpense').textContent = `₹${stats.mean.toFixed(2)}`;
  document.getElementById('kpiMinExpense').textContent = `₹${stats.min.toFixed(2)}`;
  document.getElementById('kpiMaxExpense').textContent = `₹${stats.max.toFixed(2)}`;
}

/**
 * Render Student Table in Section 2 (Data Entry)
 */
function renderStudentTable(searchQuery = '') {
  const tbody = document.getElementById('studentTableBody');
  const emptyState = document.getElementById('tableEmptyState');
  const countLabel = document.getElementById('tableRecordCount');

  tbody.innerHTML = '';

  let filtered = studentData.map((s, idx) => ({ ...s, originalIndex: idx }));

  if (searchQuery) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchQuery) ||
      s.id.toLowerCase().includes(searchQuery)
    );
  }

  countLabel.textContent = `Showing ${filtered.length} of ${studentData.length} records`;

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  } else {
    emptyState.style.display = 'none';
  }

  filtered.forEach((st, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="text-muted font-mono">${i + 1}</span></td>
      <td><span class="student-badge">${escapeHtml(st.id)}</span></td>
      <td><strong>${escapeHtml(st.name)}</strong></td>
      <td><span class="expense-amount">₹${st.expense.toFixed(2)}</span></td>
      <td>${st.studyHours !== null ? `${st.studyHours.toFixed(1)} hrs/day` : '<span class="text-muted">—</span>'}</td>
      <td style="text-align: right;">
        <button class="btn-icon" onclick="editStudent(${st.originalIndex})" title="Edit ${escapeHtml(st.name)}">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-icon btn-icon-danger" onclick="deleteStudent(${st.originalIndex})" title="Delete ${escapeHtml(st.name)}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Render Section 3 Statistical Cards
 */
function renderStatisticsCards(stats) {
  document.getElementById('statCount').textContent = stats.n;
  document.getElementById('statMean').textContent = `₹${stats.mean.toFixed(2)}`;
  document.getElementById('statMedian').textContent = `₹${stats.median.toFixed(2)}`;
  document.getElementById('statMode').textContent = stats.mode.text;
  document.getElementById('statMin').textContent = `₹${stats.min.toFixed(2)}`;
  document.getElementById('statMax').textContent = `₹${stats.max.toFixed(2)}`;
  document.getElementById('statRange').textContent = `₹${stats.range.toFixed(2)}`;

  // Auxiliary metrics
  document.getElementById('statQ1').textContent = `₹${stats.q1.toFixed(2)}`;
  document.getElementById('statQ3').textContent = `₹${stats.q3.toFixed(2)}`;
  document.getElementById('statIQR').textContent = `₹${stats.iqr.toFixed(2)}`;
  document.getElementById('statCV').textContent = `${stats.cv.toFixed(2)}%`;
}

/**
 * Render Section 4 Frequency Distribution Table
 */
function renderFrequencyTable(freqDist, totalN) {
  const tbody = document.getElementById('frequencyTableBody');
  const tfoot = document.getElementById('frequencyTableFoot');
  tbody.innerHTML = '';
  tfoot.innerHTML = '';

  document.getElementById('modalClassBadge').textContent = `Modal Class: ${freqDist.modalClass}`;

  freqDist.rows.forEach(row => {
    const isModal = row.label === freqDist.modalClass && freqDist.maxCount > 0;
    const tr = document.createElement('tr');
    if (isModal) tr.classList.add('modal-highlight-row');

    tr.innerHTML = `
      <td>
        <span class="range-label">${row.label}</span>
        ${isModal ? '<span class="badge badge-indigo" style="margin-left: 6px;">Modal Class</span>' : ''}
      </td>
      <td>₹${row.midpoint.toFixed(1)}</td>
      <td><strong>${row.count}</strong></td>
      <td>${row.cumulative}</td>
      <td>${row.percentage.toFixed(1)}%</td>
      <td>
        <div class="freq-bar-wrap">
          <div class="freq-bar-track">
            <div class="freq-bar-fill" style="width: ${row.percentage}%;"></div>
          </div>
          <span class="freq-bar-pct">${row.percentage.toFixed(0)}%</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Total summary row in footer
  const totalCount = freqDist.rows.reduce((acc, r) => acc + r.count, 0);
  const totalPct = freqDist.rows.reduce((acc, r) => acc + r.percentage, 0);

  tfoot.innerHTML = `
    <tr>
      <td><strong>Total (Σ)</strong></td>
      <td>—</td>
      <td><strong>${totalCount}</strong></td>
      <td>${totalCount}</td>
      <td><strong>${totalPct.toFixed(0)}%</strong></td>
      <td>100% Accounted</td>
    </tr>
  `;
}

// ===================================================================
// CHART.JS VISUALIZATIONS
// ===================================================================

function setChartSort(sortMode, targetBtn) {
  chartSortOrder = sortMode;
  document.querySelectorAll('.chart-filter-toggle .pill-btn').forEach(btn => btn.classList.remove('active'));
  if (targetBtn) targetBtn.classList.add('active');
  const stats = computeStatistics(studentData);
  const freqDist = computeFrequencyDistribution(studentData);
  const corr = computeCorrelation(studentData);
  updateCharts(stats, freqDist, corr);
}

function updateCharts(stats, freqDist, corr) {
  renderHistogramChart(freqDist);
  renderPieChart(freqDist);
  renderIndividualBarChart(stats);
  renderScatterChart(corr);
}

/**
 * 1. Histogram for expense distribution
 */
function renderHistogramChart(freqDist) {
  const ctx = document.getElementById('histogramChart').getContext('2d');

  const labels = freqDist.rows.map(r => r.label);
  const data = freqDist.rows.map(r => r.count);

  if (histogramChart) {
    histogramChart.destroy();
  }

  histogramChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Students (Frequency)',
        data: data,
        backgroundColor: 'rgba(79, 70, 229, 0.75)',
        borderColor: '#4f46e5',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: '#4338ca'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `Frequency: ${context.raw} students (${((context.raw / (studentData.length || 1)) * 100).toFixed(1)}%)`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Daily Expense Range (₹)', font: { weight: 'bold' } },
          grid: { display: false }
        },
        y: {
          title: { display: true, text: 'Student Count (Frequency)', font: { weight: 'bold' } },
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 }
        }
      }
    }
  });
}

/**
 * 2. Pie / Doughnut Chart for expense ranges
 */
function renderPieChart(freqDist) {
  const ctx = document.getElementById('pieChart').getContext('2d');

  const labels = freqDist.rows.map(r => r.label);
  const data = freqDist.rows.map(r => r.count);

  if (pieChart) {
    pieChart.destroy();
  }

  const palette = [
    '#3b82f6', // blue
    '#4f46e5', // indigo
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444'  // rose
  ];

  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: palette,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 14,
            padding: 12,
            font: { family: 'Plus Jakarta Sans', size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const count = context.raw;
              const total = studentData.length || 1;
              const pct = ((count / total) * 100).toFixed(1);
              return ` ${context.label}: ${count} students (${pct}%)`;
            }
          }
        }
      },
      cutout: '55%'
    }
  });
}

/**
 * 3. Bar Chart for individual student expenses
 */
function renderIndividualBarChart(stats) {
  const ctx = document.getElementById('individualBarChart').getContext('2d');

  let students = [...studentData];
  if (chartSortOrder === 'asc') {
    students.sort((a, b) => a.expense - b.expense);
  } else if (chartSortOrder === 'desc') {
    students.sort((a, b) => b.expense - a.expense);
  }

  const labels = students.map(s => s.name);
  const data = students.map(s => s.expense);

  if (individualBarChart) {
    individualBarChart.destroy();
  }

  const meanLineData = new Array(students.length).fill(stats.mean);

  individualBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Daily Expense (₹)',
          data: data,
          backgroundColor: data.map(val => val > stats.mean ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)'),
          borderColor: data.map(val => val > stats.mean ? '#ef4444' : '#10b981'),
          borderWidth: 1.5,
          borderRadius: 4
        },
        {
          type: 'line',
          label: `Mean Expense (₹${stats.mean.toFixed(1)})`,
          data: meanLineData,
          borderColor: '#4f46e5',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { weight: 'bold' } }
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              return `${students[idx].name} (${students[idx].id})`;
            },
            label: (item) => {
              if (item.dataset.type === 'line') return `Class Mean: ₹${stats.mean.toFixed(2)}`;
              const val = item.raw;
              const diff = val - stats.mean;
              const diffStr = diff >= 0 ? `+₹${diff.toFixed(2)} above mean` : `-₹${Math.abs(diff).toFixed(2)} below mean`;
              return `Expense: ₹${val.toFixed(2)} (${diffStr})`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45,
            font: { size: 11 }
          },
          grid: { display: false }
        },
        y: {
          title: { display: true, text: 'Daily Expense in ₹', font: { weight: 'bold' } },
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * 4. Scatter Plot for Study Hours vs. Daily Expenses (Correlation)
 */
function renderScatterChart(corr) {
  const ctx = document.getElementById('scatterChart').getContext('2d');

  if (scatterChart) {
    scatterChart.destroy();
  }

  const scatterPoints = corr.pairs.map(p => ({
    x: p.x,
    y: p.y,
    name: p.name,
    id: p.id
  }));

  // Generate regression line endpoints
  let trendLinePoints = [];
  if (corr.pairs.length >= 2) {
    const xVals = corr.pairs.map(p => p.x);
    const minX = Math.min(...xVals);
    const maxX = Math.max(...xVals);

    trendLinePoints = [
      { x: minX, y: (corr.slope * minX) + corr.intercept },
      { x: maxX, y: (corr.slope * maxX) + corr.intercept }
    ];
  }

  scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Student (Study Hours vs Expense)',
          data: scatterPoints,
          backgroundColor: '#4f46e5',
          borderColor: '#3730a3',
          borderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 9
        },
        {
          type: 'line',
          label: `Trend Line: y = ${corr.slope.toFixed(2)}x + ${corr.intercept.toFixed(2)}`,
          data: trendLinePoints,
          borderColor: '#ef4444',
          borderWidth: 2.5,
          borderDash: [6, 6],
          fill: false,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.dataset.type === 'line') return `Linear Fit: ${context.dataset.label}`;
              const pt = context.raw;
              return `${pt.name} (${pt.id}): ${pt.x} hrs study, ₹${pt.y} spend`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Study Hours per Day (hrs)', font: { weight: 'bold' } },
          beginAtZero: true
        },
        y: {
          title: { display: true, text: 'Daily Expense (₹)', font: { weight: 'bold' } },
          beginAtZero: true
        }
      }
    }
  });
}

// ===================================================================
// SECTION 6: AUTOMATED INTERPRETATION
// ===================================================================

function renderInterpretation(stats, freqDist) {
  if (stats.n === 0) {
    document.getElementById('interpretSampleSize').textContent = "No data available. Please add student records.";
    document.getElementById('interpretCentralTendency').textContent = "N/A";
    document.getElementById('interpretMode').textContent = "N/A";
    document.getElementById('interpretDispersion').textContent = "N/A";
    document.getElementById('interpretSkewness').textContent = "N/A";
    document.getElementById('interpretExtremes').textContent = "N/A";
    return;
  }

  // 1. Sample Size
  document.getElementById('interpretSampleSize').innerHTML = `
    <strong>${stats.n} students</strong> were analyzed in this statistical sample. 
    The cumulative daily expenditure across all surveyed students amounts to <strong>₹${(stats.mean * stats.n).toFixed(2)}</strong>.
  `;

  // 2. Central Tendency
  document.getElementById('interpretCentralTendency').innerHTML = `
    The <strong>average daily expense is ₹${stats.mean.toFixed(2)}</strong> (Arithmetic Mean). 
    The <strong>median is ₹${stats.median.toFixed(2)}</strong>, meaning exactly 50% of the students spend less than ₹${stats.median.toFixed(2)} and 50% spend more.
  `;

  // 3. Mode & Bracket
  const modalRow = freqDist.rows.find(r => r.label === freqDist.modalClass);
  const modalCount = modalRow ? modalRow.count : 0;
  const modalPct = modalRow ? modalRow.percentage.toFixed(1) : 0;

  document.getElementById('interpretMode').innerHTML = `
    Most students spend between <strong>${freqDist.modalClass}</strong> per day. 
    This modal bracket represents <strong>${modalCount} students (${modalPct}% of the entire sample)</strong>, reflecting the standard collegiate living cost.
  `;

  // 4. Variability & Spread
  document.getElementById('interpretDispersion').innerHTML = `
    The dataset exhibits a <strong>standard deviation of ₹${stats.sampleStdDev.toFixed(2)}</strong> 
    and an interquartile range (IQR) of <strong>₹${stats.iqr.toFixed(2)}</strong>. 
    The coefficient of variation (CV) is <strong>${stats.cv.toFixed(1)}%</strong>, indicating ${stats.cv > 50 ? 'high' : 'moderate'} relative variability in daily spending.
  `;

  // 5. Skewness
  let skewText = "";
  const diff = stats.mean - stats.median;
  if (Math.abs(diff) < 5) {
    skewText = `The distribution is <strong>nearly symmetrical</strong> (Mean ₹${stats.mean.toFixed(1)} ≈ Median ₹${stats.median.toFixed(1)}), suggesting a balanced bell-like spread.`;
  } else if (diff > 0) {
    skewText = `The distribution is <strong>positively skewed (right-skewed)</strong> because the mean (₹${stats.mean.toFixed(1)}) is higher than the median (₹${stats.median.toFixed(1)}). A few high spenders pull the average upward.`;
  } else {
    skewText = `The distribution is <strong>negatively skewed (left-skewed)</strong> because the mean (₹${stats.mean.toFixed(1)}) is lower than the median (₹${stats.median.toFixed(1)}).`;
  }
  document.getElementById('interpretSkewness').innerHTML = skewText;

  // 6. Extremes
  document.getElementById('interpretExtremes').innerHTML = `
    The minimum recorded daily expense is <strong>₹${stats.min.toFixed(2)}</strong> while the maximum is <strong>₹${stats.max.toFixed(2)}</strong>. 
    This creates a total statistical range of <strong>₹${stats.range.toFixed(2)}</strong> between the most frugal and most generous daily spender.
  `;
}

// ===================================================================
// SECTION 7: CORRELATION SECTION
// ===================================================================

function renderCorrelationSection(corr) {
  document.getElementById('corrRValue').textContent = corr.r.toFixed(3);
  document.getElementById('corrStrengthBadge').textContent = corr.strength;
  document.getElementById('corrR2Value').textContent = `${corr.r2.toFixed(1)}%`;
  document.getElementById('corrEquation').textContent = `y = ${corr.slope.toFixed(2)}x + ${corr.intercept.toFixed(2)}`;
  document.getElementById('corrInterpretationText').textContent = corr.interpretation;
}

// ===================================================================
// SECTION 8: CONCLUSION
// ===================================================================

function renderConclusion(stats, freqDist, corr) {
  const container = document.getElementById('conclusionDynamicText');

  if (stats.n === 0) {
    container.innerHTML = `<p>No data is currently available. Please load the sample dataset or input student records to view statistical deductions.</p>`;
    return;
  }

  container.innerHTML = `
    <p>
      In this statistical investigation of <strong>${stats.n} college students</strong>, the central daily spending tendency was established at an arithmetic mean of <strong>₹${stats.mean.toFixed(2)}</strong> with a median of <strong>₹${stats.median.toFixed(2)}</strong>. 
      The analysis reveals that daily expenditure is concentrated predominantly in the <strong>${freqDist.modalClass} bracket</strong>.
    </p>
    <p>
      The measures of dispersion indicate a sample standard deviation of <strong>₹${stats.sampleStdDev.toFixed(2)}</strong> across an overall range of <strong>₹${stats.range.toFixed(2)}</strong> (spanning from ₹${stats.min.toFixed(2)} to ₹${stats.max.toFixed(2)}). 
      The middle 50% of the student population spends between <strong>₹${stats.q1.toFixed(2)} (Q₁)</strong> and <strong>₹${stats.q3.toFixed(2)} (Q₃)</strong>, demonstrating that the vast majority maintain disciplined personal budgets.
    </p>
    <p>
      Furthermore, the bivariate correlation study between daily study hours and daily expenses yielded a Pearson coefficient of <strong>r = ${corr.r.toFixed(3)} (${corr.strength.toLowerCase()})</strong>. 
      ${corr.r < -0.2 
        ? "This statistically supports the hypothesis that students dedicating greater daily hours to academic preparation experience lower routine personal expenses due to reduced leisure activity."
        : "This indicates that study commitments and personal daily expenditures operate as largely independent variables in the student sample."
      }
    </p>
  `;
}

// ===================================================================
// "HOW IS THIS CALCULATED?" FORMULA MODAL
// ===================================================================

const FORMULA_INFO = {
  count: {
    title: "Sample Size (n)",
    formula: "n = Total Number of Observed Students",
    explanation: "The sample size represents the total count of valid student expense observations in the dataset.",
    steps: [
      "Filter out empty or invalid records.",
      "Count the total number of students in the current survey.",
      "Used as the denominator in computing the arithmetic mean and variance."
    ],
    example: (stats) => `In this project, currently <strong>n = ${stats.n}</strong> students are registered.`
  },
  mean: {
    title: "Arithmetic Mean (x̄)",
    formula: "x̄ = (Σx) / n = (x₁ + x₂ + ... + xₙ) / n",
    explanation: "The arithmetic mean is the primary measure of central tendency, representing the equal share of total daily expenses divided among all students.",
    steps: [
      "Sum all individual daily expenses: Σx = x₁ + x₂ + ... + xₙ",
      "Divide the total sum by the sample size n.",
      "Sensitive to extreme values (outliers)."
    ],
    example: (stats) => `Current sum Σx = ₹${(stats.mean * stats.n).toFixed(2)}. Dividing by n = ${stats.n} yields <strong>x̄ = ₹${stats.mean.toFixed(2)}</strong>.`
  },
  median: {
    title: "Median (M)",
    formula: "If n is odd: x₍₍ₙ₊₁₎/₂₎ | If n is even: [x₍ₙ/₂₎ + x₍ₙ/₂₊₁₎] / 2",
    explanation: "The median is the 50th percentile—the exact middle value of an ordered dataset. It is resistant to extreme outliers.",
    steps: [
      "Sort all expense values in ascending order.",
      "If n is odd, the median is the value at index (n + 1) / 2.",
      "If n is even, the median is the mean of the two central numbers at n/2 and (n/2) + 1."
    ],
    example: (stats) => `For n = ${stats.n}, the sorted middle value yields <strong>Median = ₹${stats.median.toFixed(2)}</strong>.`
  },
  mode: {
    title: "Mode (Mₒ)",
    formula: "Value(s) with highest frequency fₘₐₓ",
    explanation: "The mode is the daily expense value that occurs most frequently in the sample.",
    steps: [
      "Tally the occurrence count of each distinct expense amount.",
      "Find the maximum frequency fₘₐₓ.",
      "If fₘₐₓ = 1, there is no mode (uniform distribution). If multiple values tie, the dataset is multimodal."
    ],
    example: (stats) => `Current Mode status: <strong>${stats.mode.text}</strong>.`
  },
  min: {
    title: "Minimum (xₘᵢₙ)",
    formula: "xₘᵢₙ = min(x₁, x₂, ..., xₙ)",
    explanation: "The smallest recorded daily expense in the entire student sample.",
    steps: [
      "Compare all values in the dataset.",
      "Identify the lowest expenditure."
    ],
    example: (stats) => `The lowest student expense recorded is <strong>₹${stats.min.toFixed(2)}</strong>.`
  },
  max: {
    title: "Maximum (xₘₐₓ)",
    formula: "xₘₐₓ = max(x₁, x₂, ..., xₙ)",
    explanation: "The greatest recorded daily expense in the entire student sample.",
    steps: [
      "Compare all values in the dataset.",
      "Identify the highest expenditure."
    ],
    example: (stats) => `The highest student expense recorded is <strong>₹${stats.max.toFixed(2)}</strong>.`
  },
  range: {
    title: "Range (R)",
    formula: "R = xₘₐₓ - xₘᵢₙ",
    explanation: "The simplest measure of statistical dispersion, representing the spread between the extremes.",
    steps: [
      "Identify maximum expense (xₘₐₓ).",
      "Identify minimum expense (xₘᵢₙ).",
      "Subtract: Range = xₘₐₓ - xₘᵢₙ."
    ],
    example: (stats) => `R = ₹${stats.max.toFixed(2)} - ₹${stats.min.toFixed(2)} = <strong>₹${stats.range.toFixed(2)}</strong>.`
  },
  variance: {
    title: "Variance (s² & σ²)",
    formula: "Sample: s² = Σ(x - x̄)² / (n - 1) | Population: σ² = Σ(x - x̄)² / N",
    explanation: "Variance measures how much the individual daily expenses deviate from the mean on average (in squared units).",
    steps: [
      "Calculate the mean (x̄).",
      "For each student, calculate the deviation: (xᵢ - x̄).",
      "Square each deviation: (xᵢ - x̄)².",
      "Sum the squared deviations: SS = Σ(xᵢ - x̄)².",
      "Divide by (n - 1) for unbiased sample variance, or by N for population variance."
    ],
    example: (stats) => `Sample Variance <strong>s² = ${stats.sampleVariance.toFixed(2)}</strong> | Population Variance <strong>σ² = ${stats.populationVariance.toFixed(2)}</strong>.`
  },
  stddev: {
    title: "Standard Deviation (s & σ)",
    formula: "s = √(s²) = √[Σ(x - x̄)² / (n - 1)]",
    explanation: "Standard deviation is the square root of the variance. It expresses dispersion in the exact same unit as the original data (Indian Rupees ₹).",
    steps: [
      "Calculate variance (s²).",
      "Take the positive square root: s = √s².",
      "Indicates how tightly expenses cluster around the average daily spend."
    ],
    example: (stats) => `Taking the square root of s² (${stats.sampleVariance.toFixed(2)}) gives <strong>s = ₹${stats.sampleStdDev.toFixed(2)}</strong>.`
  },
  correlation: {
    title: "Pearson's Correlation Coefficient (r)",
    formula: "r = [nΣxy - (Σx)(Σy)] / √{[nΣx² - (Σx)²][nΣy² - (Σy)²]}",
    explanation: "Measures the strength and direction of the linear relationship between daily study hours (X) and daily expenses (Y). Ranges from -1 to +1.",
    steps: [
      "Let X = Study Hours and Y = Daily Expense (₹).",
      "Compute sums: Σx, Σy, Σxy, Σx², and Σy².",
      "Apply Pearson's product-moment formula.",
      "r > 0 indicates positive correlation, r < 0 indicates negative correlation, r ≈ 0 indicates no linear correlation."
    ],
    example: () => {
      const corr = computeCorrelation(studentData);
      return `For current data, Pearson's <strong>r = ${corr.r.toFixed(3)}</strong> (${corr.strength}).`;
    }
  }
};

function openFormulaModal(metricKey) {
  const info = FORMULA_INFO[metricKey];
  if (!info) return;

  const stats = computeStatistics(studentData);
  document.getElementById('modalFormulaTitle').textContent = info.title;

  const body = document.getElementById('modalFormulaBody');
  body.innerHTML = `
    <div class="modal-formula-box">
      <div class="modal-formula-code">${escapeHtml(info.formula)}</div>
    </div>
    
    <p>${info.explanation}</p>

    <div class="modal-section-title">Calculation Steps:</div>
    <div class="modal-calc-steps">
      <ol>
        ${info.steps.map(s => `<li>${s}</li>`).join('')}
      </ol>
    </div>

    <div class="modal-live-example">
      <i class="fa-solid fa-circle-check"></i> <strong>Current Dataset Calculation:</strong><br>
      ${info.example(stats)}
    </div>
  `;

  document.getElementById('formulaModal').style.display = 'flex';
}

function closeFormulaModal() {
  document.getElementById('formulaModal').style.display = 'none';
}

// ===================================================================
// UTILITIES & TOASTS
// ===================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'danger') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
