const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Initialize SQLite Database
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            balance REAL DEFAULT 1000.00,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Transactions table
    db.run(`
        CREATE TABLE transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            fromCurrency TEXT DEFAULT 'USD',
            toCurrency TEXT DEFAULT 'USD',
            description TEXT,
            recipientEmail TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )
    `);

    // Loan applications table
    db.run(`
        CREATE TABLE loan_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            applicationId TEXT UNIQUE NOT NULL,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            ssn TEXT NOT NULL,
            birthDate TEXT NOT NULL,
            address TEXT NOT NULL,
            loanAmount REAL NOT NULL,
            annualIncome REAL NOT NULL,
            monthlyIncome REAL NOT NULL,
            loanPurpose TEXT NOT NULL,
            employer TEXT NOT NULL,
            occupation TEXT NOT NULL,
            workExperience INTEGER NOT NULL,
            monthlyRent REAL NOT NULL,
            hasCreditCard TEXT NOT NULL,
            bankName TEXT NOT NULL,
            accountNumber TEXT NOT NULL,
            routingNumber TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            reviewedAt DATETIME,
            reviewedBy TEXT,
            notes TEXT
        )
    `);

    console.log('Database tables created successfully');
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve loans page
app.get('/loans', (req, res) => {
    res.sendFile(path.join(__dirname, 'loans.html'));
});

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        db.run(
            'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.code === 'SQLITE_CONSTRAINT') {
                        return res.status(400).json({ error: 'User with this email already exists' });
                    }
                    return res.status(500).json({ error: 'Failed to create user' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: this.lastID, email: email },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    message: 'User created successfully',
                    token: token,
                    user: {
                        id: this.lastID,
                        firstName,
                        lastName,
                        email,
                        balance: 1000.00
                    }
                });
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user in database
        db.get(
            'SELECT * FROM users WHERE email = ?',
            [email],
            async (err, user) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Verify password
                const isValidPassword = await bcrypt.compare(password, user.password);
                
                if (!isValidPassword) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: user.id, email: user.email },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.json({
                    message: 'Login successful',
                    token: token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        balance: user.balance
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get(
        'SELECT id, firstName, lastName, email, balance, createdAt FROM users WHERE id = ?',
        [req.user.userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user });
        }
    );
});

// Get transaction history
app.get('/api/transactions', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
        [req.user.userId],
        (err, transactions) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({ transactions });
        }
    );
});

// Money Transfer
app.post('/api/transfer', authenticateToken, (req, res) => {
    const { amount, recipientEmail, description } = req.body;

    if (!amount || !recipientEmail) {
        return res.status(400).json({ error: 'Amount and recipient email are required' });
    }

    if (amount <= 0) {
        return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Start transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Check sender's balance
        db.get(
            'SELECT balance FROM users WHERE id = ?',
            [req.user.userId],
            (err, sender) => {
                if (err || !sender) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: 'Error checking balance' });
                }

                if (sender.balance < amount) {
                    db.run('ROLLBACK');
                    return res.status(400).json({ error: 'Insufficient balance' });
                }

                // Find recipient
                db.get(
                    'SELECT id FROM users WHERE email = ?',
                    [recipientEmail],
                    (err, recipient) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Error finding recipient' });
                        }

                        if (!recipient) {
                            db.run('ROLLBACK');
                            return res.status(404).json({ error: 'Recipient not found' });
                        }

                        // Update sender balance
                        db.run(
                            'UPDATE users SET balance = balance - ? WHERE id = ?',
                            [amount, req.user.userId],
                            (err) => {
                                if (err) {
                                    db.run('ROLLBACK');
                                    return res.status(500).json({ error: 'Error updating sender balance' });
                                }

                                // Update recipient balance
                                db.run(
                                    'UPDATE users SET balance = balance + ? WHERE id = ?',
                                    [amount, recipient.id],
                                    (err) => {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            return res.status(500).json({ error: 'Error updating recipient balance' });
                                        }

                                        // Record transaction
                                        db.run(
                                            'INSERT INTO transactions (userId, type, amount, description, recipientEmail) VALUES (?, ?, ?, ?, ?)',
                                            [req.user.userId, 'transfer_out', amount, description || 'Money transfer', recipientEmail],
                                            (err) => {
                                                if (err) {
                                                    db.run('ROLLBACK');
                                                    return res.status(500).json({ error: 'Error recording transaction' });
                                                }

                                                // Record recipient transaction
                                                db.run(
                                                    'INSERT INTO transactions (userId, type, amount, description) VALUES (?, ?, ?, ?)',
                                                    [recipient.id, 'transfer_in', amount, `Received from ${req.user.email}`],
                                                    (err) => {
                                                        if (err) {
                                                            db.run('ROLLBACK');
                                                            return res.status(500).json({ error: 'Error recording recipient transaction' });
                                                        }

                                                        db.run('COMMIT');
                                                        res.json({
                                                            message: 'Transfer successful',
                                                            transaction: {
                                                                amount,
                                                                recipientEmail,
                                                                description,
                                                                timestamp: new Date().toISOString()
                                                            }
                                                        });
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
});

// Currency conversion rates (mock data)
const exchangeRates = {
    USD: { EUR: 0.85, GBP: 0.73, CAD: 1.25 },
    EUR: { USD: 1.18, GBP: 0.86, CAD: 1.47 },
    GBP: { USD: 1.37, EUR: 1.16, CAD: 1.71 },
    CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58 }
};

// Get exchange rates
app.get('/api/exchange-rates', (req, res) => {
    res.json({ rates: exchangeRates });
});

// Convert currency
app.post('/api/convert', (req, res) => {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({ error: 'Amount, from currency, and to currency are required' });
    }

    if (fromCurrency === toCurrency) {
        return res.json({ convertedAmount: amount });
    }

    let rate = 1;
    if (exchangeRates[fromCurrency] && exchangeRates[fromCurrency][toCurrency]) {
        rate = exchangeRates[fromCurrency][toCurrency];
    }

    const convertedAmount = (amount * rate).toFixed(2);
    
    res.json({
        originalAmount: amount,
        fromCurrency,
        toCurrency,
        exchangeRate: rate,
        convertedAmount: parseFloat(convertedAmount)
    });
});

// Loan application submission
app.post('/api/loan-application', (req, res) => {
    const {
        firstName, lastName, email, phone, ssn, birthDate, address,
        loanAmount, annualIncome, monthlyIncome, loanPurpose,
        employer, occupation, workExperience, monthlyRent, hasCreditCard,
        bankName, accountNumber, routingNumber
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !loanAmount || !annualIncome) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique application ID
    const applicationId = 'LN' + Date.now().toString();

    // Insert loan application into database
    db.run(`
        INSERT INTO loan_applications (
            applicationId, firstName, lastName, email, phone, ssn, birthDate, address,
            loanAmount, annualIncome, monthlyIncome, loanPurpose,
            employer, occupation, workExperience, monthlyRent, hasCreditCard,
            bankName, accountNumber, routingNumber
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        applicationId, firstName, lastName, email, phone, ssn, birthDate, address,
        loanAmount, annualIncome, monthlyIncome, loanPurpose,
        employer, occupation, workExperience, monthlyRent, hasCreditCard,
        bankName, accountNumber, routingNumber
    ], function(err) {
        if (err) {
            console.error('Loan application error:', err);
            return res.status(500).json({ error: 'Failed to submit loan application' });
        }

        res.status(201).json({
            message: 'Loan application submitted successfully',
            applicationId: applicationId,
            status: 'pending',
            estimatedResponse: '24-48 hours'
        });
    });
});

// Get loan applications (admin only)
app.get('/api/loan-applications', (req, res) => {
    db.all('SELECT * FROM loan_applications ORDER BY submittedAt DESC', (err, applications) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ applications });
    });
});

// Update loan application status (admin only)
app.put('/api/loan-application/:id', (req, res) => {
    const { id } = req.params;
    const { status, notes, reviewedBy } = req.body;

    db.run(`
        UPDATE loan_applications 
        SET status = ?, notes = ?, reviewedBy = ?, reviewedAt = CURRENT_TIMESTAMP 
        WHERE applicationId = ?
    `, [status, notes, reviewedBy, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update application' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ message: 'Application updated successfully' });
    });
});

// Get loan application by ID
app.get('/api/loan-application/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM loan_applications WHERE applicationId = ?', [id], (err, application) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ application });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏦 Learning Bank Server running on http://localhost:${PORT}`);
    console.log('📊 Database: SQLite (in-memory)');
    console.log('🔐 JWT Secret: Make sure to set JWT_SECRET in production');
    console.log('🚀 Ready to accept requests!');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('💾 Database closed');
        }
        process.exit(0);
    });
});