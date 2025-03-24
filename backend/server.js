import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Fix for `__dirname` in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// ✅ Serve the frontend folder (adjust if needed)
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Fix: Serve login.html properly
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

// Middleware
app.use(express.json());

// ✅ Configure CORS properly
app.use(
    cors({
        origin: "http://127.0.0.1:5500", // Adjust if frontend runs elsewhere
        credentials: true,
    })
);

// ✅ Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// ✅ Token Storage (to validate magic links)
const tokenStore = new Map(); // Stores tokens with associated emails

// ✅ Function to generate a magic link
function generateToken() {
    return crypto.randomBytes(32).toString("hex"); // Unique token
}

async function sendMagicLink(email) {
    const token = generateToken();
    tokenStore.set(token, email); // Store the token for verification

    const magicLink = `http://localhost:3000/auth?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Your Magic Login Link",
        text: `Click the link to login: ${magicLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Magic link sent to ${email}: ${magicLink}`);
        return { success: true };
    } catch (error) {
        console.error("❌ Email failed:", error);
        return { success: false, error: error.message };
    }
}

// ✅ Route to send magic link
app.post("/send-link", async (req, res) => {
    console.log("📩 Request received:", req.body);
    const { email } = req.body;

    if (!email || !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    const result = await sendMagicLink(email);
    if (!result.success) {
        return res.status(500).json({ error: "Failed to send email" });
    }

    res.json({ message: "Magic link sent successfully!", email });
});

// ✅ Route to handle magic link authentication
app.get("/auth", (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: "Missing token" });
    }

    // ✅ Verify token (for now, we allow only 'XYZ123')
    if (token === "XYZ123") {
        return res.json({ success: true, email: "user@example.com" });
    } else {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
});
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dashboard.html")); 
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
