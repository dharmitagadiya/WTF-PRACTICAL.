require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const path = require("path");
const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

app.use(session({
    name: "studenthub.sid",
    secret: process.env.SESSION_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 60 * 1000
    }
}));

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: "studenthub",
    waitForConnections: true,
    connectionLimit: 10
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: {
        message: "Too many login attempts. Try again later."
    }
});

function validEmail(email) {
    return typeof email === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStudent(data) {
    const { enrollment, name, branch, semester, email, mobile } = data;
    return (
        typeof enrollment === "string" &&
        enrollment.trim().length > 0 &&
        enrollment.length <= 30 &&
        typeof name === "string" &&
        name.trim().length > 0 &&
        name.length <= 100 &&
        typeof branch === "string" &&
        branch.trim().length > 0 &&
        branch.length <= 50 &&
        Number.isInteger(semester) &&
        semester >= 1 &&
        semester <= 8 &&
        validEmail(email) &&
        typeof mobile === "string" &&
        /^[0-9]{10}$/.test(mobile)
    );
}

function requireLogin(req, res, next) {
    if (!req.session.adminId) {
        return res.status(401).json({
            message: "Please login first."
        });
    }
    next();
}

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (
            typeof name !== "string" ||
            !name.trim() ||
            name.length > 100 ||
            !validEmail(email) ||
            typeof password !== "string" ||
            password.length < 8 ||
            password.length > 72
        ) {
            return res.status(400).json({
                message: "Enter valid details. Password must be 8-72 characters."
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
            [name.trim(), email.trim().toLowerCase(), hashedPassword]
        );
        res.status(201).json({
            message: "Admin registration successful."
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Registration failed."
        });
    }
});

app.post("/api/login", loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!validEmail(email) || typeof password !== "string") {
            return res.status(400).json({
                message: "Enter valid login details."
            });
        }
        const [rows] = await db.execute(
            "SELECT * FROM admins WHERE email = ?",
            [email.trim().toLowerCase()]
        );
        if (rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }
        const admin = rows[0];
        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({
                    message: "Login failed."
                });
            }
            req.session.adminId = admin.id;
            req.session.adminName = admin.name;
            res.json({
                message: "Login successful.",
                name: admin.name
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Login failed."
        });
    }
});

app.get("/api/me", requireLogin, (req, res) => {
    res.json({
        name: req.session.adminName
    });
});

app.post("/api/logout", requireLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "Logout failed."
            });
        }
        res.clearCookie("studenthub.sid");
        res.json({
            message: "Logout successful."
        });
    });
});

app.get("/api/students", requireLogin, async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM students ORDER BY id DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to retrieve students."
        });
    }
});

app.post("/api/students", requireLogin, async (req, res) => {
    try {
        const student = req.body;
        if (!validateStudent(student)) {
            return res.status(400).json({
                message: "Please enter valid student details."
            });
        }
        await db.execute(
            `INSERT INTO students
            (enrollment, name, branch, semester, email, mobile)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                student.enrollment.trim(),
                student.name.trim(),
                student.branch.trim(),
                student.semester,
                student.email.trim(),
                student.mobile.trim()
            ]
        );
        res.status(201).json({
            message: "Student added successfully."
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Enrollment number already exists."
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Unable to add student."
        });
    }
});

app.put("/api/students/:id", requireLogin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const student = req.body;
        if (!Number.isInteger(id) || id <= 0 ||
            !validateStudent(student)) {
            return res.status(400).json({
                message: "Invalid student information."
            });
        }
        const [result] = await db.execute(
            `UPDATE students
             SET name = ?, branch = ?, semester = ?, email = ?, mobile = ?
             WHERE id = ?`,
            [
                student.name.trim(),
                student.branch.trim(),
                student.semester,
                student.email.trim(),
                student.mobile.trim(),
                id
            ]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }
        res.json({
            message: "Student updated successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to update student."
        });
    }
});

app.delete("/api/students/:id", requireLogin, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid student ID."
            });
        }
        const [result] = await db.execute(
            "DELETE FROM students WHERE id = ?",
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }
        res.json({
            message: "Student deleted successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to delete student."
        });
    }
});

const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        await db.query("SELECT 1");
        app.listen(PORT, () => {
            console.log(`StudentHub running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}
startServer();
