const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const path = require("path");
const app = express();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

// Database Connection
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "finsecure"
});

// Registration
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        if (name.trim().length > 100 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Invalid name or email"
            });
        }
        if (password.length < 8 ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)) {
            return res.status(400).json({
                message: "Password must be strong"
            });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        // Secure parameterized query
        const sql = `INSERT INTO employees
        (name, email, password) VALUES (?, ?, ?)`;
        await db.execute(sql, [
            name.trim(),
            email.trim(),
            hashedPassword
        ]);
        res.json({
            message: "Registration successful!"
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email already registered"
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Enter email and password"
            });
        }
        // Parameterized query
        const sql = "SELECT * FROM employees WHERE email = ?";
        const [result] = await db.execute(sql, [email.trim()]);
        if (result.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        const user = result[0];
        // Compare hashed password
        const valid = await bcrypt.compare(
            password,
            user.password
        );
        if (!valid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        res.json({
            message: "Login successful!"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// Start Server
async function startServer() {
    try {
        await db.query("SELECT 1");
        console.log("Database connected successfully");
        app.listen(3000, () => {
            console.log("Server running at http://localhost:3000");
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
