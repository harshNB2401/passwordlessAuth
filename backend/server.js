import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';
import { Strategy as MagicLinkStrategy } from 'passport-magic-link';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log("✅ SECRET_KEY:", process.env.SECRET_KEY);
console.log("✅ EMAIL:", process.env.EMAIL);
console.log("✅ EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD);

const app = express();
const users = new Map();

// ✅ Setup Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASSWORD
    }
});

// ✅ Configure Passport with Magic Link Strategy
// ✅ Configure Passport with Magic Link Strategy
passport.use(new MagicLinkStrategy(
    {
        secret: process.env.SECRET_KEY,
        userFields: ['email'],
        tokenField: 'token',
    },
    // ✅ Fix: Ensure `verifyUser` and `sendToken` are correctly passed as separate functions
    (email, done) => {
        let user = users.get(email);
        if (!user) {
            user = { email };
            users.set(email, user);
        }
        return done(null, user);
    },
    (user, token, done) => {
        console.log("✅ Sending magic link to:", user.email);

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Your Magic Link Login',
            text: `Click here to login: http://localhost:3000/login/${token}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Error sending email:', error);
                return done(error);
            }
            console.log('✅ Magic link sent:', info.response);
            done();
        });
    }
));


// ✅ Passport Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'supersecret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport serialization

passport.serializeUser((user, done) => done(null, user.email));
passport.deserializeUser((email, done) => done(null, users.get(email)));

// ✅ Routes
app.get('/', (req, res) => res.send('<h1>Welcome to Passwordless Authentication</h1>'));

// ✅ Fix: Ensure correct token authentication in login route
app.post('/send-link', passport.authenticate('magiclink', { action: 'requestToken' }));
app.get('/login/:token', passport.authenticate('magiclink', { successRedirect: '/dashboard', failureRedirect: '/' }));
app.get('/dashboard', (req, res) => req.isAuthenticated() ? res.send('<h1>Dashboard</h1>') : res.redirect('/'));
app.get('/logout', (req, res) => { req.logout(() => res.redirect('/')); });

// ✅ Start Server
app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
