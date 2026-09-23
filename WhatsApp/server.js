require('dotenv').config();
const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

const UPSCALEUP_API_BASE = process.env.UPSCALEUP_API_BASE || 'https://upscaleup.io/api/partner/v1';
const UPSCALEUP_API_KEY = process.env.UPSCALEUP_API_KEY;
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true
}));
app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway.internal')
        ? false
        : { rejectUnauthorized: false }
});

async function initializeDatabase() {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            external_user_id VARCHAR(255) UNIQUE NOT NULL,
            upscaleup_user_id VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            org_name VARCHAR(255),
            timezone VARCHAR(50) NOT NULL,
            email_verified BOOLEAN DEFAULT FALSE,
            reset_token VARCHAR(255),
            reset_token_expires TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login_at TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_external_id ON users(external_user_id);
    `;

    await pool.query(query);
    console.log('Database initialized');
}

function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

function generateExternalUserId() {
    return `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPassword(password) {
    return typeof password === 'string' && password.length >= 8;
}

async function createUserOnUpScaleUp(userData) {
    const response = await fetch(`${UPSCALEUP_API_BASE}/users`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${UPSCALEUP_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            email_verified: true,
            org_name: userData.org_name || 'Individual',
            phone_no: userData.phone || null,
            external_user_id: userData.external_user_id,
            timezone: userData.timezone
        })
    });

    const data = await response.json();

    if (!response.ok) {
        if (data.error === 'user_already_exists') {
            throw new Error('USER_ALREADY_EXISTS');
        }
        throw new Error(data.message || 'Failed to create user on UpScaleUp');
    }

    return data;
}

async function getSSOLoginUrl(external_user_id) {
    const response = await fetch(`${UPSCALEUP_API_BASE}/sso/login-url`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${UPSCALEUP_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ external_user_id })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to get SSO login URL');
    }

    return data.login_url;
}

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'aitamate-auth-page.html'));
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, phone, org_name, timezone } = req.body;

        if (!name || !email || !password || !timezone) {
            return res.status(400).json({
                error: 'MISSING_FIELDS',
                message: 'name, email, password, and timezone are required'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: 'INVALID_EMAIL',
                message: 'Please provide a valid email address'
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                error: 'WEAK_PASSWORD',
                message: 'Password must be at least 8 characters long'
            });
        }

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'USER_ALREADY_EXISTS',
                message: 'An account with this email already exists'
            });
        }

        const external_user_id = generateExternalUserId();
        const password_hash = await hashPassword(password);

        let upscaleupResponse;
        try {
            upscaleupResponse = await createUserOnUpScaleUp({
                name, email, phone, org_name, timezone, external_user_id
            });
        } catch (error) {
            if (error.message === 'USER_ALREADY_EXISTS') {
                return res.status(409).json({
                    error: 'USER_ALREADY_EXISTS',
                    message: 'An account with this email already exists on UpScaleUp'
                });
            }
            throw error;
        }

        const result = await pool.query(
            `INSERT INTO users
             (external_user_id, upscaleup_user_id, email, name, password_hash, phone, org_name, timezone, email_verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id, external_user_id, email, name`,
            [external_user_id, upscaleupResponse.user_id, email, name, password_hash, phone || null, org_name || null, timezone, true]
        );

        const user = result.rows[0];

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                external_user_id: user.external_user_id,
                email: user.email,
                name: user.name
            },
            message: 'Account created successfully'
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            error: 'SIGNUP_ERROR',
            message: 'Failed to create account'
        });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'MISSING_FIELDS',
                message: 'email and password are required'
            });
        }

        const result = await pool.query(
            `SELECT id, external_user_id, email, name, password_hash
             FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'INVALID_CREDENTIALS',
                message: 'Email or password is incorrect'
            });
        }

        const user = result.rows[0];
        const validPassword = await verifyPassword(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({
                error: 'INVALID_CREDENTIALS',
                message: 'Email or password is incorrect'
            });
        }

        await pool.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        const login_url = await getSSOLoginUrl(user.external_user_id);

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            login_url,
            message: 'Sign in successful'
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            error: 'SIGNIN_ERROR',
            message: 'Failed to sign in'
        });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'MISSING_EMAIL',
                message: 'email is required'
            });
        }

        const result = await pool.query(
            'SELECT id, email FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, a reset link has been sent'
            });
        }

        const user = result.rows[0];
        const resetToken = Buffer.from(`${user.id}:${Date.now()}:${Math.random()}`).toString('base64url');

        await pool.query(
            `UPDATE users
             SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour'
             WHERE id = $2`,
            [resetToken, user.id]
        );

        const resetUrl = `${process.env.FRONTEND_URL || ''}/reset-password?token=${resetToken}`;
        console.log(`Reset link for ${email}: ${resetUrl}`);
        // TODO: send this via an email service instead of logging it

        res.json({
            success: true,
            message: 'Password reset link sent to your email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            error: 'FORGOT_PASSWORD_ERROR',
            message: 'Failed to process password reset'
        });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                error: 'MISSING_FIELDS',
                message: 'token and newPassword are required'
            });
        }

        if (!isValidPassword(newPassword)) {
            return res.status(400).json({
                error: 'WEAK_PASSWORD',
                message: 'Password must be at least 8 characters long'
            });
        }

        const result = await pool.query(
            `SELECT id FROM users
             WHERE reset_token = $1 AND reset_token_expires > NOW()`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'INVALID_TOKEN',
                message: 'Password reset token is invalid or expired'
            });
        }

        const user = result.rows[0];
        const password_hash = await hashPassword(newPassword);

        await pool.query(
            `UPDATE users
             SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
             WHERE id = $2`,
            [password_hash, user.id]
        );

        res.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            error: 'RESET_PASSWORD_ERROR',
            message: 'Failed to reset password'
        });
    }
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
    });
});

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await initializeDatabase();
    } catch (err) {
        console.error('Database initialization error:', err);
    }

    if (!UPSCALEUP_API_KEY) {
        console.warn('UPSCALEUP_API_KEY not configured in .env');
    }
    if (!process.env.DATABASE_URL) {
        console.warn('DATABASE_URL not configured in .env');
    }
});
