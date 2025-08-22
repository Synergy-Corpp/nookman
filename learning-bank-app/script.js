// Currency exchange rates (mock data for learning)
const exchangeRates = {
    USD: { EUR: 0.85, GBP: 0.73, CAD: 1.25 },
    EUR: { USD: 1.18, GBP: 0.86, CAD: 1.47 },
    GBP: { USD: 1.37, EUR: 1.16, CAD: 1.71 },
    CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58 }
};

// DOM elements
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const closeBtns = document.querySelectorAll('.close');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const convertBtn = document.getElementById('convertBtn');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Modal functionality
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Event listeners for modals
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(loginModal);
});

signupBtn.addEventListener('click', () => {
    openModal(signupModal);
});

showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
});

// Close modal when clicking X or outside
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeModal(loginModal);
        closeModal(signupModal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === signupModal) closeModal(signupModal);
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Currency converter functionality
function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount').value);
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const convertedAmountField = document.getElementById('convertedAmount');

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (fromCurrency === toCurrency) {
        convertedAmountField.value = amount.toFixed(2);
        return;
    }

    let rate = 1;
    if (exchangeRates[fromCurrency] && exchangeRates[fromCurrency][toCurrency]) {
        rate = exchangeRates[fromCurrency][toCurrency];
    }

    const convertedAmount = (amount * rate).toFixed(2);
    convertedAmountField.value = convertedAmount;
    
    // Add some visual feedback
    convertedAmountField.style.background = '#e3f2fd';
    setTimeout(() => {
        convertedAmountField.style.background = '';
    }, 1000);
}

convertBtn.addEventListener('click', convertCurrency);

// Auto-convert when amount changes
document.getElementById('amount').addEventListener('input', convertCurrency);
document.getElementById('fromCurrency').addEventListener('change', convertCurrency);
document.getElementById('toCurrency').addEventListener('change', convertCurrency);

// Swap currencies functionality
document.querySelector('.swap-btn').addEventListener('click', () => {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const amount = document.getElementById('amount');
    const convertedAmount = document.getElementById('convertedAmount');
    
    // Swap the currency values
    const tempCurrency = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tempCurrency;
    
    // Swap the amounts
    const tempAmount = amount.value;
    amount.value = convertedAmount.value;
    convertedAmount.value = tempAmount;
    
    // Add rotation animation to swap button
    document.querySelector('.swap-btn').style.transform = 'rotate(180deg)';
    setTimeout(() => {
        document.querySelector('.swap-btn').style.transform = '';
    }, 300);
});

// Form submissions (mock implementations for learning)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Add loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        // Real API call
        const response = await apiLogin(email, password);
        
        if (response.success) {
            alert('Login successful! Welcome to Learning Bank.');
            closeModal(loginModal);
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed: ' + response.message);
        }
    } catch (error) {
        alert('Login error: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Enhanced validation
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (!agreeTerms) {
        alert('You must agree to the Terms of Service and Privacy Policy');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Add loading state
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    try {
        // Real API call
        const response = await apiSignup(firstName, lastName, email, password);
        
        if (response.success) {
            alert('Account created successfully! Welcome to Learning Bank.');
            closeModal(signupModal);
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Signup failed: ' + response.message);
        }
    } catch (error) {
        alert('Signup error: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Real API functions
const API_BASE = 'http://localhost:3000/api';

async function apiLogin(email, password) {
    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (response.ok) {
        // Store token and user info
        localStorage.setItem('bankToken', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        
        return {
            success: true,
            user: result.user
        };
    } else {
        return {
            success: false,
            message: result.error
        };
    }
}

async function apiSignup(firstName, lastName, email, password) {
    const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, email, password })
    });
    
    const result = await response.json();
    
    if (response.ok) {
        // Store token and user info
        localStorage.setItem('bankToken', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        
        return {
            success: true,
            user: result.user
        };
    } else {
        return {
            success: false,
            message: result.error
        };
    }
}

// Enhanced form validation
function setupFormValidation() {
    const signupPassword = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const signupEmail = document.getElementById('signupEmail');
    
    // Password strength validation
    signupPassword.addEventListener('input', validatePasswordStrength);
    
    // Password match validation
    confirmPassword.addEventListener('input', validatePasswordMatch);
    
    // Email validation
    signupEmail.addEventListener('blur', validateEmail);
}

function validatePasswordStrength() {
    const password = document.getElementById('signupPassword').value;
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    const requirements = document.querySelectorAll('.requirement');
    
    let score = 0;
    let feedback = '';
    
    // Check length
    const lengthReq = document.querySelector('[data-requirement="length"]');
    if (password.length >= 6) {
        lengthReq.classList.add('met');
        score++;
    } else {
        lengthReq.classList.remove('met');
    }
    
    // Check for number
    const numberReq = document.querySelector('[data-requirement="number"]');
    if (/\d/.test(password)) {
        numberReq.classList.add('met');
        score++;
    } else {
        numberReq.classList.remove('met');
    }
    
    // Check for letter
    const letterReq = document.querySelector('[data-requirement="letter"]');
    if (/[a-zA-Z]/.test(password)) {
        letterReq.classList.add('met');
        score++;
    } else {
        letterReq.classList.remove('met');
    }
    
    // Update strength bar
    strengthFill.className = 'strength-fill';
    if (score === 1) {
        strengthFill.classList.add('weak');
        feedback = 'Weak password';
    } else if (score === 2) {
        strengthFill.classList.add('medium');
        feedback = 'Medium strength';
    } else if (score === 3) {
        strengthFill.classList.add('strong');
        feedback = 'Strong password';
    } else {
        feedback = 'Enter a password';
    }
    
    strengthText.textContent = feedback;
}

function validatePasswordMatch() {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const matchMessage = document.getElementById('passwordMatch');
    
    if (confirmPassword.length === 0) {
        matchMessage.textContent = '';
        matchMessage.className = 'validation-message';
        return;
    }
    
    if (password === confirmPassword) {
        matchMessage.textContent = '✓ Passwords match';
        matchMessage.className = 'validation-message success';
    } else {
        matchMessage.textContent = '✗ Passwords do not match';
        matchMessage.className = 'validation-message error';
    }
}

function validateEmail() {
    const email = document.getElementById('signupEmail').value;
    const emailMessage = document.getElementById('emailValidation');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email.length === 0) {
        emailMessage.textContent = '';
        emailMessage.className = 'validation-message';
        return;
    }
    
    if (emailRegex.test(email)) {
        emailMessage.textContent = '✓ Valid email address';
        emailMessage.className = 'validation-message success';
    } else {
        emailMessage.textContent = '✗ Please enter a valid email address';
        emailMessage.className = 'validation-message error';
    }
}

// Initialize currency converter on page load
document.addEventListener('DOMContentLoaded', () => {
    convertCurrency();
    setupFormValidation();
    
    // Add some interactive animations
    const serviceCards = document.querySelectorAll('.service-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some dynamic stats animation
function animateStats() {
    const stats = document.querySelectorAll('.stat h3');
    
    stats.forEach(stat => {
        const finalValue = stat.textContent;
        const numericValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
        const suffix = finalValue.replace(/[\d.]/g, '');
        
        let currentValue = 0;
        const increment = numericValue / 50;
        
        const animation = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                currentValue = numericValue;
                clearInterval(animation);
            }
            stat.textContent = currentValue.toFixed(1) + suffix;
        }, 30);
    });
}

// Trigger stats animation when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroObserver.observe(heroSection);
}