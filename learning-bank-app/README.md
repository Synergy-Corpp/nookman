# Learning Bank App 🏦

An educational banking application built to understand frontend and backend development concepts. This project demonstrates how modern web applications handle user authentication, data persistence, and real-time interactions.

## 🎯 Learning Objectives

- **Frontend Development**: HTML5, CSS3, JavaScript (ES6+)
- **Backend Development**: Node.js, Express.js
- **Database**: SQLite with SQL queries
- **Authentication**: JWT tokens, password hashing
- **API Design**: RESTful endpoints
- **Security**: Input validation, CORS, password encryption

## ✨ Features

### Frontend
- Responsive design that works on all devices
- Professional banking interface
- Real-time currency converter
- Interactive forms with validation
- Smooth animations and transitions
- User dashboard with account overview

### Backend
- User registration and authentication
- JWT-based session management
- Secure password hashing with bcrypt
- Money transfer functionality
- Transaction history tracking
- Real-time balance updates
- Currency conversion API

### Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- CORS protection
- SQL injection prevention

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone or download the project**
   ```bash
   cd learning-bank-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
learning-bank-app/
├── index.html          # Main landing page
├── dashboard.html      # User dashboard
├── styles.css          # Main styling
├── dashboard.css       # Dashboard-specific styles
├── script.js           # Frontend JavaScript
├── dashboard.js        # Dashboard functionality
├── server.js           # Express.js backend
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
└── README.md          # This file
```

## 🔧 How It Works

### Frontend Architecture
- **Landing Page**: Marketing site with currency converter
- **Authentication**: Login/signup modals with form validation
- **Dashboard**: Account overview, money transfers, transaction history
- **Responsive Design**: Works on desktop, tablet, and mobile

### Backend Architecture
- **Express.js Server**: Handles HTTP requests and responses
- **SQLite Database**: Stores user accounts and transactions
- **JWT Authentication**: Secure user sessions
- **RESTful API**: Clean, organized endpoints

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create new user account |
| POST | `/api/login` | User authentication |
| GET | `/api/profile` | Get user profile |
| GET | `/api/transactions` | Get transaction history |
| POST | `/api/transfer` | Send money to another user |
| GET | `/api/exchange-rates` | Get currency rates |
| POST | `/api/convert` | Convert currencies |

### Database Schema

**Users Table**
```sql
- id (Primary Key)
- firstName
- lastName  
- email (Unique)
- password (Hashed)
- balance
- createdAt
```

**Transactions Table**
```sql
- id (Primary Key)
- userId (Foreign Key)
- type (transfer_in/transfer_out)
- amount
- description
- recipientEmail
- createdAt
```

## 🎨 Key Learning Concepts

### Frontend Concepts
1. **DOM Manipulation**: Dynamic content updates
2. **Event Handling**: User interactions
3. **Async/Await**: API calls and promises
4. **Local Storage**: Client-side data persistence
5. **Responsive Design**: Mobile-first approach
6. **Form Validation**: Real-time input checking

### Backend Concepts
1. **Express Middleware**: Request processing pipeline
2. **Database Transactions**: ACID properties
3. **Password Security**: Hashing and salting
4. **JWT Tokens**: Stateless authentication
5. **Error Handling**: Graceful failure management
6. **API Design**: RESTful principles

### Security Concepts
1. **Authentication vs Authorization**
2. **Password Security Best Practices**
3. **Cross-Origin Resource Sharing (CORS)**
4. **Input Validation and Sanitization**
5. **SQL Injection Prevention**

## 🔐 Environment Variables

Create a `.env` file with:
```
PORT=3000
JWT_SECRET=your-super-secret-key
NODE_ENV=development
```

## 🧪 Testing the Application

1. **Register a new account**
2. **Login with your credentials**
3. **Check your starting balance ($1000)**
4. **Try the currency converter**
5. **Send money to another email address**
6. **View your transaction history**

## 📱 Features Demo

### User Registration & Login
- Create account with email and password
- Secure password requirements
- Automatic login after registration
- JWT token management

### Dashboard Features
- Real-time balance display
- Transaction statistics
- Quick action buttons
- Professional interface

### Money Transfers
- Send money to other users by email
- Real-time balance updates
- Transaction descriptions
- Transfer confirmation

### Transaction History
- Chronological transaction list
- Detailed transaction information
- Auto-refresh functionality
- Mobile-friendly display

## 🌟 What You'll Learn

By studying and modifying this code, you'll understand:

1. **How frontend and backend communicate**
2. **How user authentication works**
3. **How databases store and retrieve data**
4. **How to build secure web applications**
5. **How to create responsive user interfaces**
6. **How to handle real-time data updates**

## 🔧 Customization Ideas

- Add more currencies to the converter
- Implement transaction categories
- Add email notifications
- Create admin dashboard
- Add transaction limits
- Implement 2-factor authentication
- Add transaction search and filtering

## 📚 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT, bcryptjs
- **Styling**: Custom CSS with animations
- **Development**: nodemon for auto-restart

## ⚠️ Important Notes

- This is an educational project, not for production use
- Uses in-memory SQLite database (data resets on restart)
- No real money transactions
- Simplified security model for learning

## 🤝 Contributing

This is an educational project. Feel free to:
- Fork and experiment
- Add new features
- Improve the design
- Fix bugs or issues
- Share your learning experience

---

**Happy Learning! 🎓**

*Remember: The best way to learn programming is by building real projects like this one.*