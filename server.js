const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// In-memory storage
let enquiries = [];
let adminSession = null;

// Admin credentials (demo)
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

// ===== PUBLIC APIs =====

// Get all courses
app.get("/api/courses", (req, res) => {
    res.json([
        {
            id: 1,
            name: "BCA",
            fullName: "Bachelor of Computer Applications",
            duration: "3 Years",
            eligibility: "10+2 with Mathematics",
            description: "A comprehensive program covering programming, databases, networking, and software engineering."
        },
        {
            id: 2,
            name: "BBA",
            fullName: "Bachelor of Business Administration",
            duration: "3 Years",
            eligibility: "10+2 in any stream",
            description: "Focuses on management principles, marketing, finance, and entrepreneurship skills."
        },
        {
            id: 3,
            name: "MBA",
            fullName: "Master of Business Administration",
            duration: "2 Years",
            eligibility: "Graduation in any discipline",
            description: "Advanced management program with specializations in Finance, Marketing, and HR."
        },
        {
            id: 4,
            name: "MCA",
            fullName: "Master of Computer Applications",
            duration: "2 Years",
            eligibility: "BCA/B.Sc CS or equivalent",
            description: "Advanced computing program covering AI, cloud computing, and advanced software development."
        }
    ]);
});

// Get gallery images
app.get("/api/gallery", (req, res) => {
    res.json([
        { id: 1, category: "campus", title: "Main Building", url: "https://images.unsplash.com/photo-1562774053-701939374585?w=400" },
        { id: 2, category: "campus", title: "Library", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400" },
        { id: 3, category: "events", title: "Annual Day", url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400" },
        { id: 4, category: "labs", title: "Computer Lab", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" },
        { id: 5, category: "sports", title: "Sports Ground", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400" },
        { id: 6, category: "events", title: "Cultural Fest", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400" },
        { id: 7, category: "labs", title: "Science Lab", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400" },
        { id: 8, category: "campus", title: "Auditorium", url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400" }
    ]);
});

// Submit enquiry/admission form
app.post("/api/enquiry", (req, res) => {
    const { name, email, phone, course, message } = req.body;
    if (!name || !email || !phone) {
        return res.status(400).json({ error: "Name, email and phone are required" });
    }
    const enquiry = {
        id: enquiries.length + 1,
        name,
        email,
        phone,
        course: course || "Not Specified",
        message: message || "",
        date: new Date().toISOString()
    };
    enquiries.push(enquiry);
    res.json({ success: true, message: "Enquiry submitted successfully" });
});

// ===== ADMIN APIs =====

// Admin login
app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        adminSession = { username, loginTime: new Date().toISOString() };
        res.json({ success: true, token: "demo-token-12345" });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Admin logout
app.post("/api/admin/logout", (req, res) => {
    adminSession = null;
    res.json({ success: true });
});

// Check admin session
app.get("/api/admin/check", (req, res) => {
    const token = req.headers.authorization;
    if (adminSession && token === "Bearer demo-token-12345") {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

// Get dashboard stats
app.get("/api/admin/stats", (req, res) => {
    const token = req.headers.authorization;
    if (!adminSession || token !== "Bearer demo-token-12345") {
        return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({
        totalEnquiries: enquiries.length,
        todayEnquiries: enquiries.filter(e => {
            const today = new Date().toDateString();
            return new Date(e.date).toDateString() === today;
        }).length,
        totalCourses: 4,
        pendingReplies: enquiries.filter(e => !e.replied).length
    });
});

// Get all enquiries
app.get("/api/admin/enquiries", (req, res) => {
    const token = req.headers.authorization;
    if (!adminSession || token !== "Bearer demo-token-12345") {
        return res.status(401).json({ error: "Unauthorized" });
    }
    res.json(enquiries.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Mark enquiry as replied
app.put("/api/admin/enquiries/:id/reply", (req, res) => {
    const token = req.headers.authorization;
    if (!adminSession || token !== "Bearer demo-token-12345") {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const enquiry = enquiries.find(e => e.id === parseInt(req.params.id));
    if (enquiry) {
        enquiry.replied = true;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Enquiry not found" });
    }
});

app.listen(PORT, () => {
    console.log(`BIMT College Server running on http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
});

