/* ============================
   JavaScript - Student Council BD2 (Updated for Clean & Flat Design)
   ============================ */

document.addEventListener('DOMContentLoaded', () => {

    // =====================
    // Navbar Scroll Effect
    // =====================
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar scrolled class
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        if (scrollY > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link based on scroll position
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Back to top
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =====================
    // Mobile Menu
    // =====================
    const navToggle = document.getElementById('navToggle');
    const navLinksEl = document.getElementById('navLinks');
    const mobileOverlay = document.getElementById('mobileOverlay');

    function toggleMenu() {
        navToggle.classList.toggle('active');
        navLinksEl.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = navLinksEl.classList.contains('active') ? 'hidden' : '';
    }

    if (navToggle && mobileOverlay) {
        navToggle.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', toggleMenu);
    }

    if (navLinksEl) {
        navLinksEl.querySelectorAll('.nav-link').forEach(link => {
            // If it's a dropdown toggle in mobile, we might want to toggle the dropdown
            if (link.classList.contains('dropdown-toggle')) {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        link.parentElement.classList.toggle('active');
                    }
                });
            } else {
                link.addEventListener('click', () => {
                    if (navLinksEl.classList.contains('active')) {
                        toggleMenu();
                    }
                });
            }
        });
    }

    // =====================
    // Scroll Animations (AOS-like)
    // =====================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

    // =====================
    // Counter Animation
    // =====================
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let statAnimated = false;

    function animateCounters() {
        if (statAnimated) return;
        statAnimated = true;

        statNumbers.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out quad
                const easeOut = 1 - (1 - progress) * (1 - progress);
                const current = Math.floor(easeOut * target);
                counter.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);

    // =====================
    // Exam Data & Rendering (Table List + Dropdown)
    // =====================
    // Initial Default Exams (seeded to localStorage if empty)
    const initialDefaultExams = [
        { id: 1, title: 'คณิตศาสตร์พื้นฐาน (ค21101) - กลางภาค 1/2569', subject: 'math', grade: 'ม.1', term: 'กลางภาค', pdfLink: 'https://drive.google.com/' },
        { id: 2, title: 'คณิตศาสตร์เพิ่มเติม (ค31201) - กลางภาค 1/2569', subject: 'math', grade: 'ม.4', term: 'กลางภาค', pdfLink: 'https://drive.google.com/' },
        { id: 3, title: 'วิทยาศาสตร์พื้นฐาน (ว22101) - ปลายภาค 2/2568', subject: 'science', grade: 'ม.2', term: 'ปลายภาค', pdfLink: 'https://drive.google.com/' },
        { id: 4, title: 'ฟิสิกส์เพิ่มเติม (ว30201) - กลางภาค 1/2569', subject: 'science', grade: 'ม.5', term: 'กลางภาค', pdfLink: 'https://drive.google.com/' },
        { id: 5, title: 'ภาษาไทยพื้นฐาน (ท23101) - ปลายภาค 2/2568', subject: 'thai', grade: 'ม.3', term: 'ปลายภาค', pdfLink: 'https://drive.google.com/' },
        { id: 6, title: 'ภาษาไทยเพิ่มเติม (ท31201) - กลางภาค 1/2569', subject: 'thai', grade: 'ม.4', term: 'กลางภาค', pdfLink: 'https://drive.google.com/' },
        { id: 7, title: 'ภาษาอังกฤษพื้นฐาน (อ21101) - กลางภาค 1/2569', subject: 'foreign', grade: 'ม.1', term: 'กลางภาค', pdfLink: 'https://drive.google.com/' },
        { id: 8, title: 'ภาษาอังกฤษอ่าน-เขียน (อ33201) - ปลายภาค 2/2568', subject: 'foreign', grade: 'ม.6', term: 'ปลายภาค', pdfLink: 'https://drive.google.com/' },
        { id: 9, title: 'สังคมศึกษาฯ (ส22101) - กลางภาค 1/2569', subject: 'social', grade: 'ม.2', term: 'กลางภาค', pdfLink: 'https://drive.google.com/' },
        { id: 10, title: 'สังคมศึกษาฯ (ส32101) - ปลายภาค 2/2568', subject: 'social', grade: 'ม.5', term: 'ปลายภาค', pdfLink: 'https://drive.google.com/' },
        { id: 11, title: 'เคมีเพิ่มเติม (ว30221) - ปลายภาค 2/2568', subject: 'science', grade: 'ม.4', term: 'ปลายภาค', pdfLink: 'https://drive.google.com/' },
        { id: 12, title: 'คณิตศาสตร์พื้นฐาน (ค23101) - ปลายภาค 2/2568', subject: 'math', grade: 'ม.3', term: 'ปลายภาค', pdfLink: 'https://drive.google.com/' }
    ];

    function getExamsList() {
        try {
            let stored = JSON.parse(localStorage.getItem('sc69_exams'));
            if (!stored || !Array.isArray(stored) || stored.length === 0) {
                localStorage.setItem('sc69_exams', JSON.stringify(initialDefaultExams));
                stored = initialDefaultExams;
            }
            return stored;
        } catch (e) {
            return initialDefaultExams;
        }
    }

    const subjectMapping = {
        'math': 'คณิตศาสตร์',
        'science': 'วิทยาศาสตร์ฯ',
        'thai': 'ภาษาไทย',
        'foreign': 'ภาษาต่างประเทศ',
        'social': 'สังคมศึกษาฯ'
    };

    let activeGrade = 'all';
    let activeSubject = 'all';

    function renderExams() {
        const tableBody = document.getElementById('examTableBody');
        const examTableWrapper = document.getElementById('examTableWrapper');
        const emptyState = document.getElementById('examEmpty');
        const countEl = document.getElementById('examCount');

        const allExams = getExamsList();

        const filtered = allExams.filter(exam => {
            const gradeMatch = activeGrade === 'all' || exam.grade === activeGrade;
            const subjectMatch = activeSubject === 'all' || exam.subject === activeSubject;
            return gradeMatch && subjectMatch;
        });

        if (filtered.length === 0) {
            if (examTableWrapper) examTableWrapper.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            if (countEl) countEl.textContent = 'ไม่พบข้อสอบ';
            return;
        }

        if (examTableWrapper) examTableWrapper.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (countEl) countEl.textContent = `พบข้อสอบที่ตรงตามเงื่อนไข ทั้งหมด ${filtered.length} รายการ`;

        if (tableBody) {
            tableBody.innerHTML = filtered.map((exam, index) => {
                const driveUrl = exam.driveLink || (exam.pdfLink && exam.pdfLink.startsWith('http') ? exam.pdfLink : '');
                const hasPdfFile = !!exam.pdfData;

                let actionButtons = [];

                if (driveUrl) {
                    actionButtons.push(`
                        <a href="${escapeHtmlAttr(driveUrl.trim())}" target="_blank" rel="noopener noreferrer" class="btn-download btn-drive-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            Google Drive
                        </a>
                    `);
                }

                if (hasPdfFile) {
                    actionButtons.push(`
                        <a href="${exam.pdfData}" download="${escapeHtmlAttr(exam.pdfName || 'ข้อสอบ.pdf')}" class="btn-download btn-pdf-file">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            ดาวน์โหลด PDF
                        </a>
                    `);
                }

                if (actionButtons.length === 0) {
                    actionButtons.push(`
                        <button class="btn-download btn-disabled" onclick="downloadExam(0)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            ดาวน์โหลด PDF
                        </button>
                    `);
                }

                return `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td><strong>${escapeHtmlText(exam.title)}</strong></td>
                    <td class="text-center"><span class="badge badge-grade">${escapeHtmlText(exam.grade)}</span></td>
                    <td><span class="badge badge-subject badge-${exam.subject}">${subjectMapping[exam.subject] || escapeHtmlText(exam.subject)}</span></td>
                    <td class="text-center">${escapeHtmlText(exam.term || 'กลางภาค')}</td>
                    <td class="text-center"><div class="download-btns-flex">${actionButtons.join('')}</div></td>
                </tr>
                `;
            }).join('');
        }
    }

    // Helper functions
    function escapeHtmlText(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeHtmlAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Filter Change Handlers
    const gradeSelect = document.getElementById('gradeSelectFilter');
    const subjectSelect = document.getElementById('subjectSelectFilter');

    if (gradeSelect) {
        gradeSelect.addEventListener('change', (e) => {
            activeGrade = e.target.value;
            renderExams();
        });
    }

    if (subjectSelect) {
        subjectSelect.addEventListener('change', (e) => {
            activeSubject = e.target.value;
            renderExams();
        });
    }

    // Realtime storage listener for exam changes
    window.addEventListener('storage', () => {
        renderExams();
    });

    // Initial render
    renderExams();

    // =====================
    // Contact Form
    // =====================
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="50" stroke-dashoffset="20"/>
                </svg>
                <span>กำลังส่ง...</span>
            `;
            submitBtn.style.opacity = '0.7';

            // Simulate sending
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    <span>ส่งข้อความ</span>
                `;
                submitBtn.style.opacity = '1';

                // Show success modal
                document.getElementById('successModal').classList.add('active');
                contactForm.reset();
            }, 1500);
        });
    }

    // Anonymous checkbox behavior
    const contactAnonymous = document.getElementById('contactAnonymous');
    if (contactAnonymous) {
        contactAnonymous.addEventListener('change', function() {
            const nameInput = document.getElementById('contactName');
            const classInput = document.getElementById('contactClass');
            if (this.checked) {
                nameInput.value = '';
                nameInput.disabled = true;
                nameInput.placeholder = 'ส่งแบบไม่ระบุตัวตน';
                nameInput.required = false;
                classInput.value = '';
                classInput.disabled = true;
                classInput.placeholder = 'ส่งแบบไม่ระบุตัวตน';
                classInput.required = false;
            } else {
                nameInput.disabled = false;
                nameInput.placeholder = 'กรอกชื่อ-นามสกุล';
                nameInput.required = true;
                classInput.disabled = false;
                classInput.placeholder = 'เช่น ม.4/1';
                classInput.required = true;
            }
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            // Check if this links to a dropdown or has a dropdown-menu parent
            if (this.classList.contains('dropdown-toggle')) return;

            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// =====================
// Global Functions
// =====================
function downloadExam(id) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        padding: 14px 28px;
        background: #112d60;
        color: white;
        border-radius: 4px;
        font-family: 'Prompt', sans-serif;
        font-size: 0.9rem;
        z-index: 3000;
        border: 1px solid #2a7de1;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        opacity: 0;
        transition: all 0.3s ease;
    `;
    toast.textContent = '📄 กำลังเตรียมไฟล์ PDF สำหรับดาวน์โหลด...';
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

function resetFilters() {
    const gradeSelect = document.getElementById('gradeSelectFilter');
    const subjectSelect = document.getElementById('subjectSelectFilter');
    
    if (gradeSelect) gradeSelect.value = 'all';
    if (subjectSelect) subjectSelect.value = 'all';

    // Trigger change event to re-render
    if (gradeSelect) {
        const event = new Event('change', { bubbles: true });
        gradeSelect.dispatchEvent(event);
    }
}

// =====================================================
// ADMIN SYSTEM INTEGRATION (Appended — does not modify existing code)
// =====================================================

// --------------------------------------------------
// 1. Theme System — Apply saved theme on page load
// --------------------------------------------------
(function applyThemeOnLoad() {
    // Theme definitions (CSS variable overrides)
    const themeOverrides = {
        'default': {},
        'memorial': {
            '--navy-dark': '#1a1a1a',
            '--navy-primary': '#2c2c2c',
            '--navy-light': '#444444',
            '--sky-primary': '#777777',
            '--sky-light': '#f0f0f0',
            '--sky-dark': '#555555',
            '--success': '#555555',
            '--warning': '#777777',
            '--danger': '#999999'
        },
        'children': {
            '--navy-dark': '#7c1a00',
            '--navy-primary': '#e8450e',
            '--navy-light': '#ff6b35',
            '--sky-primary': '#ff8c42',
            '--sky-light': '#fff5eb',
            '--sky-dark': '#d4380d',
            '--success': '#52c41a',
            '--warning': '#faad14',
            '--danger': '#ff4d4f'
        },
        'newyear': {
            '--navy-dark': '#0a1628',
            '--navy-primary': '#1a2744',
            '--navy-light': '#263a5c',
            '--sky-primary': '#c8a951',
            '--sky-light': '#fdf6e3',
            '--sky-dark': '#b08d2a',
            '--success': '#2e7d32',
            '--warning': '#c8a951',
            '--danger': '#c62828'
        },
        'songkran': {
            '--navy-dark': '#004066',
            '--navy-primary': '#005b8a',
            '--navy-light': '#0277bd',
            '--sky-primary': '#0288d1',
            '--sky-light': '#e1f5fe',
            '--sky-dark': '#01579b',
            '--success': '#00796b',
            '--warning': '#e65100',
            '--danger': '#d32f2f'
        },
        'christmas': {
            '--navy-dark': '#14351f',
            '--navy-primary': '#1a472a',
            '--navy-light': '#2d6a3f',
            '--sky-primary': '#c62828',
            '--sky-light': '#fce4ec',
            '--sky-dark': '#b71c1c',
            '--success': '#2e7d32',
            '--warning': '#f9a825',
            '--danger': '#c62828'
        },
        'valentine': {
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
    };

    try {
        const savedTheme = JSON.parse(localStorage.getItem('sc69_active_theme')) || 'default';
        const overrides = themeOverrides[savedTheme];
        if (overrides && Object.keys(overrides).length > 0) {
            const root = document.documentElement;
            Object.entries(overrides).forEach(([prop, value]) => {
                root.style.setProperty(prop, value);
            });
        }
    } catch (e) {
        // Silently fail — use default theme
    }
})();

// --------------------------------------------------
// 2. Contact Form — Save submissions to localStorage
//    (so they appear in Admin Dashboard reports)
// --------------------------------------------------
(function hookContactFormToLocalStorage() {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('contactForm');
        if (!form) return;

        // Hook into the form's submit event AFTER the original handler
        form.addEventListener('submit', function() {
            // Use a small delay to let the original handler run first
            setTimeout(() => {
                // Read form values (form may already be reset, so use a pre-capture approach)
            }, 0);
        });

        // Override: capture values before submit
        let capturedData = {};
        form.addEventListener('submit', function(e) {
            // Capture values before the original handler resets the form
            capturedData = {
                name: document.getElementById('contactName')?.value || 'ไม่ระบุตัวตน',
                classRoom: document.getElementById('contactClass')?.value || '',
                type: document.getElementById('contactType')?.value || 'other',
                subject: document.getElementById('contactSubject')?.value || '',
                message: document.getElementById('contactMessage')?.value || '',
                anonymous: document.getElementById('contactAnonymous')?.checked || false
            };

            if (capturedData.anonymous) {
                capturedData.name = 'ไม่ระบุตัวตน (Anonymous)';
                capturedData.classRoom = '-';
            }

            // Save to localStorage after a brief delay (after original handler processes)
            setTimeout(() => {
                try {
                    const reports = JSON.parse(localStorage.getItem('sc69_reports')) || [];
                    reports.push({
                        id: Date.now(),
                        date: new Date().toISOString(),
                        status: 'new',
                        name: capturedData.name,
                        classRoom: capturedData.classRoom,
                        type: capturedData.type,
                        subject: capturedData.subject,
                        message: capturedData.message
                    });
                    localStorage.setItem('sc69_reports', JSON.stringify(reports));
                } catch (err) {
                    console.error('Failed to save report to localStorage:', err);
                }
            }, 100);
        }, true); // Use capture phase to run before the original handler
    });
})();

// --------------------------------------------------
// 4. News & Calendar Dynamic Rendering
// --------------------------------------------------
(function setupNewsAndEvents() {
    const NEWS_KEY = 'sc69_news';
    const EVENTS_KEY = 'sc69_events';

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function getFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    function renderNews() {
        const container = document.getElementById('newsListContainer');
        if (!container) return;

        const newsList = getFromStorage(NEWS_KEY) || [];

        if (newsList.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--text-muted,#888);">
                    <p>ยังไม่มีข่าวประชาสัมพันธ์ในขณะนี้</p>
                </div>`;
            return;
        }

        container.innerHTML = newsList.map(news => `
            <div class="news-item-flat">
                <div class="news-item-date-box">
                    <span class="date-day">${escapeHtml(news.day)}</span>
                    <span class="date-month">${escapeHtml(news.monthYear)}</span>
                </div>
                <div class="news-item-info">
                    <span class="news-type-tag ${escapeHtml(news.tagClass || 'tag-project')}">${escapeHtml(news.tagText)}</span>
                    <h4 class="news-item-title-text"><a href="#">${escapeHtml(news.title)}</a></h4>
                    <p class="news-item-excerpt-text">${escapeHtml(news.excerpt)}</p>
                </div>
            </div>
        `).join('');
    }

    function renderEvents() {
        const container = document.getElementById('eventListContainer');
        if (!container) return;

        const events = getFromStorage(EVENTS_KEY) || [];

        if (events.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:2rem;color:var(--text-muted,#888);">
                    <p>ยังไม่มีกิจกรรมในปฏิทินขณะนี้</p>
                </div>`;
            return;
        }

        container.innerHTML = events.map(ev => `
            <div class="calendar-item-flat">
                <div class="calendar-item-date-badge${ev.isActive ? ' date-active' : ''}">
                    <span class="cal-day">${escapeHtml(ev.day)}</span>
                    <span class="cal-month">${escapeHtml(ev.month)}</span>
                </div>
                <div class="calendar-item-details">
                    <span class="event-time-text">🕒 ${escapeHtml(ev.time)}</span>
                    <h4 class="event-title-text">${escapeHtml(ev.title)}</h4>
                    <p class="event-place-text">${escapeHtml(ev.place)}</p>
                </div>
            </div>
        `).join('');
    }

    // Initial render on page load
    document.addEventListener('DOMContentLoaded', () => {
        renderNews();
        renderEvents();
    });

    // Live sync when admin updates data in another tab
    window.addEventListener('storage', () => {
        renderNews();
        renderEvents();
    });
})();

// --------------------------------------------------
// 3. Admin Login Modal Handler
// --------------------------------------------------
(function setupAdminLoginModal() {
    document.addEventListener('DOMContentLoaded', () => {
        const loginOverlay = document.getElementById('adminLoginModal');
        const loginForm = document.getElementById('adminLoginForm');
        const loginError = document.getElementById('loginErrorMsg');
        const adminBtns = document.querySelectorAll('.admin-login-trigger');

        if (!loginOverlay) return;

        // Open login modal
        adminBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Check if already logged in
                try {
                    const session = JSON.parse(localStorage.getItem('sc69_admin_session'));
                    if (session && session.email === 'student69@gmail.com') {
                        window.location.href = 'admin.html';
                        return;
                    }
                } catch (e) {}
                loginOverlay.classList.add('active');
            });
        });

        // Close on overlay click
        loginOverlay.addEventListener('click', (e) => {
            if (e.target === loginOverlay) {
                loginOverlay.classList.remove('active');
                if (loginError) loginError.classList.remove('visible');
            }
        });

        // Close button
        const closeBtn = loginOverlay.querySelector('.login-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                loginOverlay.classList.remove('active');
                if (loginError) loginError.classList.remove('visible');
            });
        }

        // Login form submit
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const email = document.getElementById('loginEmail').value.trim();
                const password = document.getElementById('loginPassword').value;

                if (email === 'student69@gmail.com' && password === '123456789') {
                    // Save session
                    localStorage.setItem('sc69_admin_session', JSON.stringify({
                        email: email,
                        loginTime: new Date().toISOString()
                    }));
                    // Redirect to admin dashboard
                    window.location.href = 'admin.html';
                } else {
                    if (loginError) {
                        loginError.textContent = '❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง';
                        loginError.classList.add('visible');
                    }
                }
            });
        }
    });
})();
