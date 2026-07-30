/* ============================
   Admin System JavaScript
   สภานักเรียน โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี) ๒
   ============================ */

// =====================================================
// DataStore — Abstraction layer for localStorage
// Can be replaced with Firebase/Supabase calls later
// =====================================================
const DataStore = {
    // --- Keys ---
    KEYS: {
        SESSION: 'sc69_admin_session',
        THEME: 'sc69_active_theme',
        EXAMS: 'sc69_exams',
        REPORTS: 'sc69_reports',
        NEWS: 'sc69_news',
        EVENTS: 'sc69_events'
    },

    // --- Generic helpers ---
    _get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`DataStore: Error reading key "${key}"`, e);
            return null;
        }
    },

    _set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            // Trigger storage sync event for active window and other tabs
            window.dispatchEvent(new Event('storage'));
            return true;
        } catch (e) {
            console.error(`DataStore: Error writing key "${key}"`, e);
            return false;
        }
    },

    _remove(key) {
        localStorage.removeItem(key);
        window.dispatchEvent(new Event('storage'));
    },

    // --- Auth ---
    getSession() {
        return this._get(this.KEYS.SESSION);
    },

    setSession(session) {
        return this._set(this.KEYS.SESSION, session);
    },

    clearSession() {
        this._remove(this.KEYS.SESSION);
    },

    // --- Theme ---
    getActiveTheme() {
        return this._get(this.KEYS.THEME) || 'default';
    },

    setActiveTheme(themeId) {
        return this._set(this.KEYS.THEME, themeId);
    },

    // --- Exams ---
    getExams() {
        return this._get(this.KEYS.EXAMS) || [];
    },

    saveExams(exams) {
        return this._set(this.KEYS.EXAMS, exams);
    },

    addExam(exam) {
        const exams = this.getExams();
        exam.id = Date.now();
        exam.createdAt = new Date().toISOString();
        exams.push(exam);
        this.saveExams(exams);
        return exam;
    },

    updateExam(id, updates) {
        const exams = this.getExams();
        const index = exams.findIndex(e => e.id === id);
        if (index !== -1) {
            exams[index] = { ...exams[index], ...updates };
            this.saveExams(exams);
            return exams[index];
        }
        return null;
    },

    deleteExam(id) {
        const exams = this.getExams().filter(e => e.id !== id);
        this.saveExams(exams);
    },

    // --- News ---
    getNews() {
        // Only seed if key has never been saved before (null)
        // An empty array means the user deleted everything — respect that
        const raw = localStorage.getItem(this.KEYS.NEWS);
        if (raw === null) {
            return [];
        }
        try {
            const news = JSON.parse(raw);
            return Array.isArray(news) ? news : [];
        } catch (e) {
            return [];
        }
    },

    saveNews(news) {
        return this._set(this.KEYS.NEWS, news);
    },

    addNews(item) {
        const news = this.getNews();
        item.id = Date.now();
        news.unshift(item);
        this.saveNews(news);
        return item;
    },

    updateNews(id, updates) {
        const news = this.getNews();
        const index = news.findIndex(n => n.id === id);
        if (index !== -1) {
            news[index] = { ...news[index], ...updates };
            this.saveNews(news);
            return news[index];
        }
        return null;
    },

    deleteNews(id) {
        const news = this.getNews().filter(n => n.id !== id);
        this.saveNews(news);
    },

    // --- Calendar Events ---
    getEvents() {
        // Only seed if key has never been saved before (null)
        // An empty array means the user deleted everything — respect that
        const raw = localStorage.getItem(this.KEYS.EVENTS);
        if (raw === null) {
            return [];
        }
        try {
            const events = JSON.parse(raw);
            return Array.isArray(events) ? events : [];
        } catch (e) {
            return [];
        }
    },

    saveEvents(events) {
        return this._set(this.KEYS.EVENTS, events);
    },

    addEvent(item) {
        const events = this.getEvents();
        item.id = Date.now();
        events.push(item);
        this.saveEvents(events);
        return item;
    },

    updateEvent(id, updates) {
        const events = this.getEvents();
        const index = events.findIndex(e => e.id === id);
        if (index !== -1) {
            events[index] = { ...events[index], ...updates };
            this.saveEvents(events);
            return events[index];
        }
        return null;
    },

    deleteEvent(id) {
        const events = this.getEvents().filter(e => e.id !== id);
        this.saveEvents(events);
    },

    // --- Reports ---
    getReports() {
        const reports = this._get(this.KEYS.REPORTS) || [];
        // Only return authentic reports submitted by users (ignore old mock IDs)
        return reports.filter(r => r.id !== 1700000000001 && r.id !== 1700000000002 && r.id !== 1700000000003);
    },

    saveReports(reports) {
        return this._set(this.KEYS.REPORTS, reports);
    },

    addReport(report) {
        const reports = this.getReports();
        report.id = Date.now();
        report.date = new Date().toISOString();
        report.status = 'new';
        reports.push(report);
        this.saveReports(reports);
        return report;
    },

    updateReportStatus(id, status) {
        const reports = this.getReports();
        const index = reports.findIndex(r => r.id === id);
        if (index !== -1) {
            reports[index].status = status;
            this.saveReports(reports);
            return reports[index];
        }
        return null;
    },

    deleteReport(id) {
        const reports = this.getReports().filter(r => r.id !== id);
        this.saveReports(reports);
    }
};

// =====================================================
// Admin Credentials (loaded from APP_CONFIG)
// =====================================================
const ADMIN_CREDENTIALS = {
    get email() {
        return (window.APP_CONFIG && window.APP_CONFIG.ADMIN_EMAIL) || 'student69@gmail.com';
    },
    get password() {
        return (window.APP_CONFIG && window.APP_CONFIG.ADMIN_PASSWORD) || '11222333344444';
    }
};

// =====================================================
// Theme Definitions
// =====================================================
const THEMES = {
    default: {
        id: 'default',
        name: 'Default',
        nameEN: 'Default Theme',
        desc: 'ธีมหลักของเว็บไซต์ — สีน้ำเงินทะเล',
        colors: ['#07152c', '#0e2240', '#2a7de1', '#eef5fc', '#ffffff'],
        vars: {} // No overrides needed — this is the original design
    },
    memorial: {
        id: 'memorial',
        name: 'ขาว-ดำ (ไว้อาลัย)',
        nameEN: 'Black & White (Memorial)',
        desc: 'โทนสีเทาขาวดำ สำหรับช่วงไว้อาลัย',
        colors: ['#1a1a1a', '#333333', '#666666', '#e0e0e0', '#ffffff'],
        vars: {
            '--navy-dark': '#1a1a1a',
            '--navy-primary': '#2c2c2c',
            '--navy-light': '#444444',
            '--sky-primary': '#777777',
            '--sky-light': '#f0f0f0',
            '--sky-dark': '#555555',
            '--success': '#555555',
            '--warning': '#777777',
            '--danger': '#999999'
        }
    },
    children: {
        id: 'children',
        name: 'วันเด็ก',
        nameEN: "Children's Day",
        desc: 'สดใสร่าเริง สีสันเจิดจ้า สำหรับเดือนมกราคม',
        colors: ['#e8450e', '#ff6b35', '#ffc947', '#a8e06c', '#ffe5f0'],
        vars: {
            '--navy-dark': '#7c1a00',
            '--navy-primary': '#e8450e',
            '--navy-light': '#ff6b35',
            '--sky-primary': '#ff8c42',
            '--sky-light': '#fff5eb',
            '--sky-dark': '#d4380d',
            '--success': '#52c41a',
            '--warning': '#faad14',
            '--danger': '#ff4d4f'
        }
    },
    newyear: {
        id: 'newyear',
        name: 'ปีใหม่',
        nameEN: 'New Year',
        desc: 'สีทอง-กรมท่า ฉลองเทศกาลปีใหม่',
        colors: ['#0a1628', '#1a2744', '#c8a951', '#fdf6e3', '#ffffff'],
        vars: {
            '--navy-dark': '#0a1628',
            '--navy-primary': '#1a2744',
            '--navy-light': '#263a5c',
            '--sky-primary': '#c8a951',
            '--sky-light': '#fdf6e3',
            '--sky-dark': '#b08d2a',
            '--success': '#2e7d32',
            '--warning': '#c8a951',
            '--danger': '#c62828'
        }
    },
    songkran: {
        id: 'songkran',
        name: 'สงกรานต์',
        nameEN: 'Songkran Festival',
        desc: 'สีน้ำสดชื่น ดอกไม้ไทย สำหรับเดือนเมษายน',
        colors: ['#005b8a', '#0288d1', '#4fc3f7', '#e1f5fe', '#fff3e0'],
        vars: {
            '--navy-dark': '#004066',
            '--navy-primary': '#005b8a',
            '--navy-light': '#0277bd',
            '--sky-primary': '#0288d1',
            '--sky-light': '#e1f5fe',
            '--sky-dark': '#01579b',
            '--success': '#00796b',
            '--warning': '#e65100',
            '--danger': '#d32f2f'
        }
    },
    christmas: {
        id: 'christmas',
        name: 'คริสต์มาส',
        nameEN: 'Christmas',
        desc: 'สีแดง-เขียว-ทอง ฉลองวันคริสต์มาส',
        colors: ['#1a472a', '#2d6a3f', '#c62828', '#fdd835', '#fce4ec'],
        vars: {
            '--navy-dark': '#14351f',
            '--navy-primary': '#1a472a',
            '--navy-light': '#2d6a3f',
            '--sky-primary': '#c62828',
            '--sky-light': '#fce4ec',
            '--sky-dark': '#b71c1c',
            '--success': '#2e7d32',
            '--warning': '#f9a825',
            '--danger': '#c62828'
        }
    },
    valentine: {
        id: 'valentine',
        name: 'วาเลนไทน์',
        nameEN: "Valentine's Day",
        desc: 'สีชมพูโรแมนติก สำหรับเดือนกุมภาพันธ์',
        colors: ['#880e4f', '#ad1457', '#e91e63', '#f8bbd0', '#fce4ec'],
        vars: {
            '--navy-dark': '#560027',
            '--navy-primary': '#880e4f',
            '--navy-light': '#ad1457',
            '--sky-primary': '#e91e63',
            '--sky-light': '#fce4ec',
            '--sky-dark': '#c2185b',
            '--success': '#2e7d32',
            '--warning': '#e91e63',
            '--danger': '#d50000'
        }
    }
};

// =====================================================
// Auth Guard — Redirect if not logged in
// =====================================================
function checkAuth() {
    const session = DataStore.getSession();
    if (!session || session.email !== ADMIN_CREDENTIALS.email) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// =====================================================
// Admin Login Handler (called from main site)
// =====================================================
function adminLogin(email, password) {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        DataStore.setSession({ email: email, loginTime: new Date().toISOString() });
        return true;
    }
    return false;
}

// =====================================================
// Admin Dashboard — Main Controller
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    // Only run on admin page
    if (!document.body.classList.contains('admin-body')) return;

    // Auth guard
    if (!checkAuth()) return;

    // --- DOM References ---
    const sidebar = document.getElementById('adminSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const toggleBtn = document.getElementById('topbarToggle');
    const topbarTitle = document.getElementById('topbarTitle');
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-section]');
    const sections = document.querySelectorAll('.admin-section');

    // --- Sidebar Toggle (mobile) ---
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            sidebarOverlay.classList.toggle('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        });
    }

    // --- Section Navigation ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            switchSection(sectionId);
            // Close mobile sidebar
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        });
    });

    function switchSection(sectionId) {
        // Update nav
        navItems.forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.sidebar-nav-item[data-section="${sectionId}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Update section
        sections.forEach(s => s.classList.remove('active'));
        const activeSection = document.getElementById(sectionId);
        if (activeSection) activeSection.classList.add('active');

        // Update topbar title
        const titles = {
            'dashboard': 'แดชบอร์ดภาพรวม',
            'themes': 'จัดการธีมเว็บไซต์',
            'exams-manager': 'จัดการคลังข้อสอบ',
            'reports': 'จัดการรายงาน/ร้องเรียน'
        };
        if (topbarTitle) topbarTitle.textContent = titles[sectionId] || 'แดชบอร์ด';
    }

    // --- Logout ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            DataStore.clearSession();
            window.location.href = 'index.html';
        });
    }

    // =====================
    // Dashboard Stats
    // =====================
    function updateDashboardStats() {
        const exams = DataStore.getExams();
        const reports = DataStore.getReports();
        const activeTheme = DataStore.getActiveTheme();

        const totalExamsEl = document.getElementById('statTotalExams');
        const totalReportsEl = document.getElementById('statTotalReports');
        const newReportsEl = document.getElementById('statNewReports');
        const activeThemeEl = document.getElementById('statActiveTheme');

        if (totalExamsEl) totalExamsEl.textContent = exams.length;
        if (totalReportsEl) totalReportsEl.textContent = reports.length;
        if (newReportsEl) newReportsEl.textContent = reports.filter(r => r.status === 'new').length;
        if (activeThemeEl) activeThemeEl.textContent = THEMES[activeTheme]?.name || 'Default';
    }

    // =====================
    // Theme Manager
    // =====================
    function renderThemes() {
        const grid = document.getElementById('themesGrid');
        if (!grid) return;

        const activeTheme = DataStore.getActiveTheme();

        grid.innerHTML = Object.values(THEMES).map(theme => `
            <div class="theme-card ${theme.id === activeTheme ? 'active' : ''}" data-theme-id="${theme.id}">
                ${theme.id === activeTheme ? '<span class="theme-active-badge">กำลังใช้งาน</span>' : ''}
                <div class="theme-card-preview">
                    ${theme.colors.map(c => `<div class="preview-strip" style="background:${c}"></div>`).join('')}
                </div>
                <div class="theme-card-body">
                    <div class="theme-card-name">${theme.name}</div>
                    <div class="theme-card-desc">${theme.desc}</div>
                </div>
            </div>
        `).join('');

        // Attach click handlers
        grid.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const themeId = card.getAttribute('data-theme-id');
                DataStore.setActiveTheme(themeId);
                renderThemes();
                updateDashboardStats();
                showToast(`✅ เปลี่ยนธีมเป็น "${THEMES[themeId].name}" สำเร็จ`, 'success');
            });
        });
    }

    // =====================
    // Exam Manager & PDF Dropzone
    // =====================
    let editingExamId = null;
    let uploadedPdfData = null;
    let uploadedPdfName = null;

    // Dropzone elements
    const pdfDropzone = document.getElementById('pdfDropzone');
    const examPdfFile = document.getElementById('examPdfFile');
    const dropzoneContent = document.getElementById('dropzoneContent');
    const dropzoneFileInfo = document.getElementById('dropzoneFileInfo');
    const dropzoneFileName = document.getElementById('dropzoneFileName');
    const removePdfBtn = document.getElementById('removePdfBtn');

    function resetPdfDropzone() {
        uploadedPdfData = null;
        uploadedPdfName = null;
        if (examPdfFile) examPdfFile.value = '';
        if (dropzoneContent) dropzoneContent.style.display = 'block';
        if (dropzoneFileInfo) dropzoneFileInfo.style.display = 'none';
        if (dropzoneFileName) dropzoneFileName.textContent = '';
    }

    function setPdfDropzoneFile(name, dataUrl) {
        uploadedPdfName = name;
        uploadedPdfData = dataUrl;
        if (dropzoneContent) dropzoneContent.style.display = 'none';
        if (dropzoneFileInfo) dropzoneFileInfo.style.display = 'flex';
        if (dropzoneFileName) dropzoneFileName.textContent = name;
    }

    if (pdfDropzone && examPdfFile) {
        pdfDropzone.addEventListener('click', (e) => {
            if (e.target.closest('#removePdfBtn')) return;
            examPdfFile.click();
        });

        pdfDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            pdfDropzone.classList.add('dragover');
        });

        pdfDropzone.addEventListener('dragleave', () => {
            pdfDropzone.classList.remove('dragover');
        });

        pdfDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            pdfDropzone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                handlePdfFile(files[0]);
            }
        });

        examPdfFile.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                handlePdfFile(e.target.files[0]);
            }
        });

        if (removePdfBtn) {
            removePdfBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                resetPdfDropzone();
            });
        }
    }

    function handlePdfFile(file) {
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
            showToast('⚠️ กรุณาเลือกเฉพาะไฟล์เอกสาร .pdf เท่านั้น', 'danger');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setPdfDropzoneFile(file.name, event.target.result);
            showToast(`📄 อัปโหลดไฟล์ ${file.name} สำเร็จ`, 'success');
        };
        reader.readAsDataURL(file);
    }

    function renderExamTable() {
        const tbody = document.getElementById('adminExamTableBody');
        const emptyState = document.getElementById('adminExamEmpty');
        if (!tbody) return;

        const exams = DataStore.getExams();

        if (exams.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            document.querySelector('.admin-table-scroll')?.style && (document.querySelector('#exams-manager .admin-table-scroll').style.display = 'none');
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        const tableScroll = document.querySelector('#exams-manager .admin-table-scroll');
        if (tableScroll) tableScroll.style.display = 'block';

        const subjectNames = {
            'math_basic': 'คณิตศาสตร์พื้นฐาน',
            'math_add': 'คณิตศาสตร์เพิ่มเติม',
            'science': 'วิทยาศาสตร์และเทคโนโลยี',
            'sci_physics': 'ฟิสิกส์',
            'sci_chem': 'เคมี',
            'sci_bio': 'ชีววิทยา',
            'sci_astro': 'ดาราศาสตร์',
            'thai': 'ภาษาไทย',
            'foreign': 'ภาษาต่างประเทศ',
            'social': 'สังคมศึกษาฯ'
        };

        tbody.innerHTML = exams.map((exam, i) => `
            <tr>
                <td class="text-center">${i + 1}</td>
                <td><strong>${escapeHtml(exam.title)}</strong></td>
                <td class="text-center">${escapeHtml(exam.grade)}</td>
                <td>${subjectNames[exam.subject] || escapeHtml(exam.subject)}</td>
                <td>${escapeHtml(exam.description || '-')}</td>
                <td class="actions-cell">
                    <button class="btn-admin btn-admin-warning btn-admin-sm" onclick="editExam(${exam.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        แก้ไข
                    </button>
                    <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteExam(${exam.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        ลบ
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Add Exam button
    const addExamBtn = document.getElementById('addExamBtn');
    if (addExamBtn) {
        addExamBtn.addEventListener('click', () => {
            editingExamId = null;
            document.getElementById('examModalTitle').textContent = 'เพิ่มข้อสอบใหม่';
            document.getElementById('examForm').reset();
            resetPdfDropzone();
            openModal('examModal');
        });
    }

    // Exam form submit
    const examForm = document.getElementById('examForm');
    if (examForm) {
        examForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const driveLinkVal = document.getElementById('examDriveLink')?.value.trim() || '';

            const examData = {
                title: document.getElementById('examTitle').value.trim(),
                subject: document.getElementById('examSubject').value,
                grade: document.getElementById('examGrade').value,
                description: document.getElementById('examDescription').value.trim(),
                coverImage: document.getElementById('examCoverImage').value.trim(),
                driveLink: driveLinkVal,
                pdfData: uploadedPdfData || '',
                pdfName: uploadedPdfName || '',
                pdfLink: driveLinkVal || uploadedPdfData || ''
            };

            if (editingExamId) {
                DataStore.updateExam(editingExamId, examData);
                showToast('✅ แก้ไขข้อสอบสำเร็จ', 'success');
            } else {
                DataStore.addExam(examData);
                showToast('✅ เพิ่มข้อสอบสำเร็จ', 'success');
            }

            closeModal('examModal');
            renderExamTable();
            updateDashboardStats();
        });
    }

    // Edit exam — global function
    window.editExam = function(id) {
        const exams = DataStore.getExams();
        const exam = exams.find(e => e.id === id);
        if (!exam) return;

        editingExamId = id;
        document.getElementById('examModalTitle').textContent = 'แก้ไขข้อสอบ';
        document.getElementById('examTitle').value = exam.title || '';
        document.getElementById('examSubject').value = exam.subject || '';
        document.getElementById('examGrade').value = exam.grade || '';
        document.getElementById('examDescription').value = exam.description || '';
        document.getElementById('examCoverImage').value = exam.coverImage || '';
        
        const driveInput = document.getElementById('examDriveLink');
        if (driveInput) driveInput.value = exam.driveLink || exam.pdfLink || '';

        resetPdfDropzone();
        if (exam.pdfData && exam.pdfName) {
            setPdfDropzoneFile(exam.pdfName, exam.pdfData);
        }

        openModal('examModal');
    };

    // Delete exam — global function
    window.deleteExam = function(id) {
        if (confirm('คุณต้องการลบข้อสอบนี้หรือไม่?')) {
            DataStore.deleteExam(id);
            renderExamTable();
            updateDashboardStats();
            showToast('🗑️ ลบข้อสอบสำเร็จ', 'danger');
        }
    };

    // =====================
    // Report Manager
    // =====================
    function renderReportTable() {
        const tbody = document.getElementById('adminReportTableBody');
        const emptyState = document.getElementById('adminReportEmpty');
        if (!tbody) return;

        const reports = DataStore.getReports();

        if (reports.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            const tableScroll = document.querySelector('#reports .admin-table-scroll');
            if (tableScroll) tableScroll.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        const tableScroll = document.querySelector('#reports .admin-table-scroll');
        if (tableScroll) tableScroll.style.display = 'block';

        const statusLabels = {
            'new': { text: 'ใหม่', class: 'status-new' },
            'in-progress': { text: 'กำลังดำเนินการ', class: 'status-in-progress' },
            'resolved': { text: 'แก้ไขแล้ว', class: 'status-resolved' }
        };

        const typeLabels = {
            'suggestion': 'ข้อเสนอแนะ',
            'complaint': 'ร้องเรียน',
            'question': 'สอบถาม',
            'other': 'อื่นๆ'
        };

        tbody.innerHTML = reports.slice().reverse().map((report, i) => {
            const status = statusLabels[report.status] || statusLabels['new'];
            const dateStr = new Date(report.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            return `
                <tr>
                    <td class="text-center">${i + 1}</td>
                    <td>${dateStr}</td>
                    <td>${escapeHtml(report.name || 'ไม่ระบุตัวตน')}</td>
                    <td>${escapeHtml(report.subject || '-')}</td>
                    <td>${typeLabels[report.type] || escapeHtml(report.type || '-')}</td>
                    <td class="text-center"><span class="status-badge ${status.class}">${status.text}</span></td>
                    <td class="actions-cell">
                        <button class="btn-admin btn-admin-primary btn-admin-sm" onclick="viewReport(${report.id})" title="ดูรายละเอียด">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            ดู
                        </button>
                        <button class="btn-admin btn-admin-success btn-admin-sm" onclick="cycleReportStatus(${report.id})" title="เปลี่ยนสถานะ">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                            สถานะ
                        </button>
                        <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteReport(${report.id})" title="ลบรายงาน">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            ลบ
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // View report detail — global
    window.viewReport = function(id) {
        const report = DataStore.getReports().find(r => r.id === id);
        if (!report) return;

        const statusLabels = {
            'new': 'ใหม่',
            'in-progress': 'กำลังดำเนินการ',
            'resolved': 'แก้ไขแล้ว'
        };

        const typeLabels = {
            'suggestion': 'ข้อเสนอแนะ',
            'complaint': 'ร้องเรียน',
            'question': 'สอบถาม',
            'other': 'อื่นๆ'
        };

        const dateStr = new Date(report.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        const detailHtml = `
            <div class="report-detail-row"><span class="report-detail-label">วันที่:</span><span class="report-detail-value">${dateStr}</span></div>
            <div class="report-detail-row"><span class="report-detail-label">ชื่อผู้แจ้ง:</span><span class="report-detail-value">${escapeHtml(report.name || 'ไม่ระบุตัวตน')}</span></div>
            <div class="report-detail-row"><span class="report-detail-label">ชั้น/ห้อง:</span><span class="report-detail-value">${escapeHtml(report.classRoom || '-')}</span></div>
            <div class="report-detail-row"><span class="report-detail-label">ประเภท:</span><span class="report-detail-value">${typeLabels[report.type] || escapeHtml(report.type || '-')}</span></div>
            <div class="report-detail-row"><span class="report-detail-label">หัวเรื่อง:</span><span class="report-detail-value">${escapeHtml(report.subject || '-')}</span></div>
            <div class="report-detail-row"><span class="report-detail-label">สถานะ:</span><span class="report-detail-value">${statusLabels[report.status] || 'ใหม่'}</span></div>
            <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;">
            <div class="report-detail-row" style="flex-direction: column;">
                <span class="report-detail-label" style="margin-bottom: 6px;">เนื้อหา:</span>
                <span class="report-detail-value" style="white-space: pre-wrap; background: #f8f9fb; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0;">${escapeHtml(report.message || '-')}</span>
            </div>
        `;

        document.getElementById('reportDetailBody').innerHTML = detailHtml;
        openModal('reportDetailModal');
    };

    // Cycle report status — global
    window.cycleReportStatus = function(id) {
        const report = DataStore.getReports().find(r => r.id === id);
        if (!report) return;

        const statusCycle = ['new', 'in-progress', 'resolved'];
        const currentIdx = statusCycle.indexOf(report.status);
        const nextStatus = statusCycle[(currentIdx + 1) % statusCycle.length];

        DataStore.updateReportStatus(id, nextStatus);
        renderReportTable();
        updateDashboardStats();

        const statusLabels = { 'new': 'ใหม่', 'in-progress': 'กำลังดำเนินการ', 'resolved': 'แก้ไขแล้ว' };
        showToast(`🔄 เปลี่ยนสถานะเป็น "${statusLabels[nextStatus]}"`, 'success');
    };

    // Delete report — global
    window.deleteReport = function(id) {
        if (confirm('คุณต้องการลบรายงานนี้หรือไม่?')) {
            DataStore.deleteReport(id);
            renderReportTable();
            updateDashboardStats();
            showToast('🗑️ ลบรายงานสำเร็จ', 'danger');
        }
    };

    // =====================
    // Modal Helpers
    // =====================
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    };

    // Close modal on overlay click
    document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // =====================
    // Toast
    // =====================
    window.showToast = function(message, type = 'success') {
        // Remove existing toasts
        document.querySelectorAll('.admin-toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `admin-toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    };

    // =====================
    // Utility — Escape HTML
    // =====================
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Make escapeHtml available globally for inline handlers
    window.escapeHtml = escapeHtml;

    // =====================
    // News & Events Manager
    // =====================
    let editingNewsId = null;
    let editingEventId = null;

    // --- News Manager ---
    function renderNewsTable() {
        const tbody = document.getElementById('adminNewsTableBody');
        const emptyState = document.getElementById('adminNewsEmpty');
        if (!tbody) return;

        const newsList = DataStore.getNews();

        if (newsList.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        tbody.innerHTML = newsList.map((news, i) => `
            <tr>
                <td class="text-center">${i + 1}</td>
                <td>${escapeHtml(news.day)} ${escapeHtml(news.monthYear)}</td>
                <td><span class="badge ${escapeHtml(news.tagClass || 'tag-project')}">${escapeHtml(news.tagText)}</span></td>
                <td><strong>${escapeHtml(news.title)}</strong></td>
                <td class="actions-cell">
                    <button class="btn-admin btn-admin-warning btn-admin-sm" onclick="editNews(${news.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        แก้ไข
                    </button>
                    <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteNews(${news.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        ลบ
                    </button>
                </td>
            </tr>
        `).join('');
    }

    const addNewsBtn = document.getElementById('addNewsBtn');
    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', () => {
            editingNewsId = null;
            document.getElementById('newsModalTitle').textContent = 'เพิ่มข่าวประชาสัมพันธ์';
            document.getElementById('newsForm').reset();
            openModal('newsModal');
        });
    }

    const newsForm = document.getElementById('newsForm');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newsData = {
                day: document.getElementById('newsDay').value.trim(),
                monthYear: document.getElementById('newsMonthYear').value.trim(),
                tagText: document.getElementById('newsTagText').value.trim(),
                tagClass: document.getElementById('newsTagClass').value,
                title: document.getElementById('newsTitle').value.trim(),
                excerpt: document.getElementById('newsExcerpt').value.trim()
            };

            if (editingNewsId) {
                DataStore.updateNews(editingNewsId, newsData);
                showToast('✅ แก้ไขข่าวประชาสัมพันธ์สำเร็จ', 'success');
            } else {
                DataStore.addNews(newsData);
                showToast('✅ เพิ่มข่าวประชาสัมพันธ์สำเร็จ', 'success');
            }

            closeModal('newsModal');
            renderNewsTable();
        });
    }

    window.editNews = function(id) {
        const item = DataStore.getNews().find(n => n.id === id);
        if (!item) return;

        editingNewsId = id;
        document.getElementById('newsModalTitle').textContent = 'แก้ไขข่าวประชาสัมพันธ์';
        document.getElementById('newsDay').value = item.day || '';
        document.getElementById('newsMonthYear').value = item.monthYear || '';
        document.getElementById('newsTagText').value = item.tagText || '';
        document.getElementById('newsTagClass').value = item.tagClass || 'tag-project';
        document.getElementById('newsTitle').value = item.title || '';
        document.getElementById('newsExcerpt').value = item.excerpt || '';
        openModal('newsModal');
    };

    window.deleteNews = function(id) {
        if (confirm('คุณต้องการลบข่าวนี้หรือไม่?')) {
            DataStore.deleteNews(id);
            renderNewsTable();
            showToast('🗑️ ลบข่าวสำเร็จ', 'danger');
        }
    };

    // --- Calendar Events Manager ---
    function renderEventTable() {
        const tbody = document.getElementById('adminEventTableBody');
        const emptyState = document.getElementById('adminEventEmpty');
        if (!tbody) return;

        const events = DataStore.getEvents();

        if (events.length === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        tbody.innerHTML = events.map((ev, i) => `
            <tr>
                <td class="text-center">${i + 1}</td>
                <td>${escapeHtml(ev.day)} ${escapeHtml(ev.month)}</td>
                <td>${escapeHtml(ev.time)}</td>
                <td><strong>${escapeHtml(ev.title)}</strong></td>
                <td>${escapeHtml(ev.place)}</td>
                <td class="actions-cell">
                    <button class="btn-admin btn-admin-warning btn-admin-sm" onclick="editEvent(${ev.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 2 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        แก้ไข
                    </button>
                    <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteEvent(${ev.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        ลบ
                    </button>
                </td>
            </tr>
        `).join('');
    }

    const addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            editingEventId = null;
            document.getElementById('eventModalTitle').textContent = 'เพิ่มกิจกรรมใหม่';
            document.getElementById('eventForm').reset();
            openModal('eventModal');
        });
    }

    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const eventData = {
                day: document.getElementById('eventDay').value.trim(),
                month: document.getElementById('eventMonth').value.trim(),
                time: document.getElementById('eventTime').value.trim(),
                title: document.getElementById('eventTitle').value.trim(),
                place: document.getElementById('eventPlace').value.trim()
            };

            if (editingEventId) {
                DataStore.updateEvent(editingEventId, eventData);
                showToast('✅ แก้ไขกิจกรรมสำเร็จ', 'success');
            } else {
                DataStore.addEvent(eventData);
                showToast('✅ เพิ่มกิจกรรมสำเร็จ', 'success');
            }

            closeModal('eventModal');
            renderEventTable();
        });
    }

    window.editEvent = function(id) {
        const item = DataStore.getEvents().find(e => e.id === id);
        if (!item) return;

        editingEventId = id;
        document.getElementById('eventModalTitle').textContent = 'แก้ไขกิจกรรม';
        document.getElementById('eventDay').value = item.day || '';
        document.getElementById('eventMonth').value = item.month || '';
        document.getElementById('eventTime').value = item.time || '';
        document.getElementById('eventTitle').value = item.title || '';
        document.getElementById('eventPlace').value = item.place || '';
        openModal('eventModal');
    };

    window.deleteEvent = function(id) {
        if (confirm('คุณต้องการลบกิจกรรมนี้หรือไม่?')) {
            DataStore.deleteEvent(id);
            renderEventTable();
            showToast('🗑️ ลบกิจกรรมสำเร็จ', 'danger');
        }
    };

    // Storage Event Sync for Admin
    window.addEventListener('storage', () => {
        renderNewsTable();
        renderEventTable();
    });

    // =====================
    // Initialize Dashboard
    // =====================
    updateDashboardStats();
    renderThemes();
    renderExamTable();
    renderNewsTable();
    renderEventTable();
    renderReportTable();
    switchSection('dashboard');
});
