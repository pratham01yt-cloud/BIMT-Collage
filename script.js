// ===== MOBILE MENU =====
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// ===== ACTIVE NAV LINK =====
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// ===== STATS COUNTER ANIMATION =====
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start) + '+';
        }
    }, 16);
}

// Trigger counters when in viewport
const observerOptions = { threshold: 0.5 };
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target);
            animateCounter(entry.target, target);
            statsObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});

// ===== ENQUIRY FORM =====
const enquiryForm = document.getElementById('enquiryForm');
if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('formAlert');

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            course: document.getElementById('course').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();

            if (result.success) {
                showAlert(alertBox, 'Enquiry submitted successfully! We will contact you soon.', 'success');
                enquiryForm.reset();
            } else {
                showAlert(alertBox, result.error || 'Something went wrong', 'error');
            }
        } catch (error) {
            showAlert(alertBox, 'Failed to submit. Please try again.', 'error');
        }
    });
}

function showAlert(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `alert alert-${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// ===== GALLERY FILTERING =====
const galleryGrid = document.getElementById('galleryGrid');
if (galleryGrid) {
    loadGallery();
}

async function loadGallery(filter = 'all') {
    try {
        const response = await fetch('/api/gallery');
        const images = await response.json();

        const filtered = filter === 'all' ? images : images.filter(img => img.category === filter);

        galleryGrid.innerHTML = filtered.map(img => `
            <div class="gallery-item" data-category="${img.category}">
                <img src="${img.url}" alt="${img.title}" loading="lazy">
                <div class="gallery-overlay">
                    <h4>${img.title}</h4>
                    <p>${img.category.charAt(0).toUpperCase() + img.category.slice(1)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load gallery:', error);
    }
}

// Filter buttons
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadGallery(btn.dataset.filter);
    });
});

// ===== ADMIN AUTH =====
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('loginAlert');

        const credentials = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const result = await response.json();

            if (result.success) {
                localStorage.setItem('adminToken', result.token);
                window.location.href = 'dashboard.html';
            } else {
                showAlert(alertBox, 'Invalid username or password', 'error');
            }
        } catch (error) {
            showAlert(alertBox, 'Login failed. Please try again.', 'error');
        }
    });
}

// Check admin auth
function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'admin.html';
        return false;
    }
    return token;
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = 'admin.html';
}

// ===== DASHBOARD =====
if (document.getElementById('dashboard')) {
    const token = checkAdminAuth();
    if (token) {
        loadDashboard(token);
    }
}

async function loadDashboard(token) {
    try {
        // Load stats
        const statsRes = await fetch('/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await statsRes.json();

        document.getElementById('statEnquiries').textContent = stats.totalEnquiries;
        document.getElementById('statToday').textContent = stats.todayEnquiries;
        document.getElementById('statCourses').textContent = stats.totalCourses;
        document.getElementById('statPending').textContent = stats.pendingReplies;

        // Load enquiries
        const enqRes = await fetch('/api/admin/enquiries', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const enquiries = await enqRes.json();

        const tbody = document.getElementById('enquiriesTable');
        if (enquiries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;">No enquiries yet</td></tr>';
        } else {
            tbody.innerHTML = enquiries.map(e => `
                <tr>
                    <td>#${e.id}</td>
                    <td>${e.name}</td>
                    <td>${e.email}</td>
                    <td>${e.phone}</td>
                    <td><span class="badge ${e.replied ? 'badge-replied' : 'badge-pending'}">${e.replied ? 'Replied' : 'Pending'}</span></td>
                    <td>${new Date(e.date).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        if (error.message.includes('401')) {
            logout();
        }
    }
}

// ===== COURSES PAGE =====
const coursesGrid = document.getElementById('coursesGrid');
if (coursesGrid) {
    loadCourses();
}

async function loadCourses() {
    try {
        const response = await fetch('/api/courses');
        const courses = await response.json();

        coursesGrid.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-header">
                    <h3>${course.name}</h3>
                    <p>${course.fullName}</p>
                </div>
                <div class="course-body">
                    <p>${course.description}</p>
                    <div class="course-meta">
                        <span>Duration: ${course.duration}</span>
                        <span>Eligibility: ${course.eligibility}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load courses:', error);
    }
}

// ===== SCROLL ANIMATIONS =====
const fadeElements = document.querySelectorAll('.course-card, .stat-card, .gallery-item, .mv-card');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
});

