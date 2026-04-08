const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        is_admin INTEGER DEFAULT 0
    )`);

    // Create investments table
    db.run(`CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        package_name TEXT,
        amount_invested REAL,
        current_value REAL,
        status TEXT,
        roi TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Insert default admin if it doesn't exist
    const defaultAdminUsername = 'admin@laurafarms.com';
    const defaultAdminPassword = 'admin'; // In a real app, hash this!

    db.get('SELECT id FROM users WHERE username = ?', [defaultAdminUsername], (err, row) => {
        if (!row) {
            db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)', 
                [defaultAdminUsername, defaultAdminPassword]
            );
            console.log('Default admin created: admin@laurafarms.com / admin');
        }
    });
});

module.exports = db;
