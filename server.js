const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Simple Authentication Middleware
const authMiddleware = (req, res, next) => {
    const userId = req.cookies.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
};

const adminMiddleware = (req, res, next) => {
    const userId = req.cookies.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    db.get('SELECT is_admin FROM users WHERE id = ?', [userId], (err, row) => {
        if (err || !row || row.is_admin !== 1) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    });
};

// ========================
// API ROUTES
// ========================

// 1. Auth: Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT id, is_admin FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: 'Invalid credentials' });
        
        res.cookie('userId', row.id, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }); // 1 day
        res.json({ success: true, is_admin: row.is_admin });
    });
});

// 2. Auth: Logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('userId');
    res.json({ success: true });
});

// 3. User info
app.get('/api/me', authMiddleware, (req, res) => {
    db.get('SELECT id, username, is_admin FROM users WHERE id = ?', [req.userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// 4. Client Dashboard: Get Investments
app.get('/api/dashboard', authMiddleware, (req, res) => {
    db.all('SELECT * FROM investments WHERE user_id = ?', [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ========================
// ADMIN API ROUTES
// ========================

app.get('/api/admin/users', adminMiddleware, (req, res) => {
    db.all('SELECT id, username, is_admin FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/admin/users', adminMiddleware, (req, res) => {
    const { username, password } = req.body;
    db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 0)', [username, password], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, username });
    });
});

app.post('/api/admin/investments', adminMiddleware, (req, res) => {
    const { user_id, package_name, amount_invested, current_value, status, roi } = req.body;
    db.run(
        'INSERT INTO investments (user_id, package_name, amount_invested, current_value, status, roi) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, package_name, amount_invested, current_value, status, roi],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, success: true });
        }
    );
});

// Serve frontend HTML for known routes, keeping static routing clean
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
