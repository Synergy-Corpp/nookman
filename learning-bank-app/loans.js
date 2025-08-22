// Learning Loans JavaScript
let currentStep = 1;
const totalSteps = 4;
let applicationData = {};

// Initialize loan application
document.addEventListener('DOMContentLoaded', () => {
    setupFormValidation();
    setupFileUploads();
    updateProgress();
});

// Start loan application
function startApplication() {
    document.getElementById('loan-application').style.display = 'block';
    document.getElementById('loan-application').scrollIntoView({ behavior: 'smooth' });
}

function learnMore() {
    document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
}

// Step navigation
function changeStep(direction) {
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    
    if (direction === 1) {
        // Validate current step before proceeding
        if (!validateCurrentStep()) {
            return;
        }
        
        if (currentStep < totalSteps) {
            currentStepElement.classList.remove('active');
            currentStep++;
            document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        }
    } else {
        if (currentStep > 1) {
            currentStepElement.classList.remove('active');
            currentStep--;
            document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        }
    }
    
    updateProgress();
    updateNavigationButtons();
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentStepSpan = document.getElementById('currentStep');
    
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    currentStepSpan.textContent = currentStep;
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Show/hide previous button
    prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
    
    // Show/hide next/submit buttons
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
}

// Form validation
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
            showError(`Please fill out the ${field.previousElementSibling.textContent}`);
        } else {
            field.style.borderColor = '#10b981';
        }
    });
    
    // Additional validation for specific steps
    switch(currentStep) {
        case 1:
            isValid = validateStep1() && isValid;
            break;
        case 2:
            isValid = validateStep2() && isValid;
            break;
        case 3:
            isValid = validateStep3() && isValid;
            break;
        case 4:
            isValid = validateStep4() && isValid;
            break;
    }
    
    return isValid;
}

function validateStep1() {
    const loanAmount = parseFloat(document.getElementById('loanAmount').value);
    const annualIncome = parseFloat(document.getElementById('annualIncome').value);
    
    if (loanAmount < 500 || loanAmount > 50000) {
        showError('Loan amount must be between $500 and $50,000');
        return false;
    }
    
    if (annualIncome < 10000) {
        showError('Annual income must be at least $10,000');
        return false;
    }
    
    return true;
}

function validateStep2() {
    const ssn = document.getElementById('ssn').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const birthDate = new Date(document.getElementById('birthDate').value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    // SSN validation
    const ssnPattern = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/;
    if (!ssnPattern.test(ssn)) {
        showError('Please enter a valid SSN in format: 123-45-6789');
        return false;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    // Age validation
    if (age < 18) {
        showError('You must be at least 18 years old to apply');
        return false;
    }
    
    return true;
}

function validateStep3() {
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
    const annualIncome = parseFloat(document.getElementById('annualIncome').value);
    
    // Check if monthly income aligns with annual income
    const calculatedAnnual = monthlyIncome * 12;
    const difference = Math.abs(calculatedAnnual - annualIncome);
    
    if (difference > annualIncome * 0.1) { // Allow 10% difference
        showError('Monthly income should align with annual income');
        return false;
    }
    
    return true;
}

function validateStep4() {
    const routingNumber = document.getElementById('routingNumber').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const agreeToTerms = document.getElementById('agreeToTerms').checked;
    
    // Routing number validation
    const routingPattern = /^[0-9]{9}$/;
    if (!routingPattern.test(routingNumber)) {
        showError('Routing number must be 9 digits');
        return false;
    }
    
    // Account number validation
    if (accountNumber.length < 4 || accountNumber.length > 20) {
        showError('Account number must be between 4 and 20 characters');
        return false;
    }
    
    // Terms agreement
    if (!agreeToTerms) {
        showError('You must agree to the terms and conditions');
        return false;
    }
    
    // Check file uploads
    const requiredFiles = ['idFront', 'idBack', 'selfieWithId'];
    for (let fileId of requiredFiles) {
        const fileInput = document.getElementById(fileId);
        if (!fileInput.files || fileInput.files.length === 0) {
            showError('Please upload all required documents');
            return false;
        }
    }
    
    return true;
}

// File upload handling
function setupFileUploads() {
    const fileInputs = ['idFront', 'idBack', 'selfieWithId'];
    
    fileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(inputId + 'Preview');
        
        input.addEventListener('change', (e) => {
            handleFileUpload(e, preview);
        });
    });
}

function handleFileUpload(event, previewElement) {
    const file = event.target.files[0];
    
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please upload only image files');
            event.target.value = '';
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('File size must be less than 5MB');
            event.target.value = '';
            return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewElement.innerHTML = `
                <img src="${e.target.result}" alt="Document preview">
                <p>✓ ${file.name}</p>
            `;
            previewElement.classList.add('has-file');
        };
        reader.readAsDataURL(file);
    }
}

// Form validation setup
function setupFormValidation() {
    // Real-time validation for SSN
    document.getElementById('ssn').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 3) value = value.substring(0,3) + '-' + value.substring(3);
        if (value.length >= 6) value = value.substring(0,6) + '-' + value.substring(6,10);
        e.target.value = value;
    });
    
    // Real-time validation for phone
    document.getElementById('phone').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 3) value = '(' + value.substring(0,3) + ') ' + value.substring(3);
        if (value.length >= 9) value = value.substring(0,9) + '-' + value.substring(9,13);
        e.target.value = value;
    });
    
    // Real-time validation for routing number
    document.getElementById('routingNumber').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 9);
    });
    
    // Auto-calculate monthly income suggestion
    document.getElementById('annualIncome').addEventListener('blur', (e) => {
        const annual = parseFloat(e.target.value);
        if (annual) {
            const monthlyInput = document.getElementById('monthlyIncome');
            if (!monthlyInput.value) {
                monthlyInput.value = Math.round(annual / 12);
            }
        }
    });
}

// Form submission
document.getElementById('loanApplicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Collect all form data
    const formData = new FormData(e.target);
    
    // Convert to object
    applicationData = {};
    for (let [key, value] of formData.entries()) {
        if (key.includes('Front') || key.includes('Back') || key.includes('selfie')) {
            // Handle file uploads
            applicationData[key] = {
                name: value.name,
                size: value.size,
                type: value.type
            };
        } else {
            applicationData[key] = value;
        }
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing Application...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API submission
        await submitLoanApplication(applicationData);
        
        // Generate application ID
        const applicationId = 'LN' + Date.now().toString().slice(-8);
        document.getElementById('applicationId').textContent = applicationId;
        
        // Store application in localStorage for demo
        const applications = JSON.parse(localStorage.getItem('loanApplications') || '[]');
        applications.push({
            id: applicationId,
            ...applicationData,
            status: 'Under Review',
            submittedAt: new Date().toISOString(),
            estimatedResponse: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        });
        localStorage.setItem('loanApplications', JSON.stringify(applications));
        
        // Show success
        document.getElementById('loan-application').style.display = 'none';
        document.getElementById('application-success').style.display = 'block';
        document.getElementById('application-success').scrollIntoView({ behavior: 'smooth' });
        
        showSuccess('Application submitted successfully!');
        
    } catch (error) {
        showError('Failed to submit application. Please try again.');
        console.error('Submission error:', error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// API simulation
async function submitLoanApplication(data) {
    // Simulate API delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, applicationId: 'LN' + Date.now() });
        }, 2000);
    });
}

// Success/Error handling
function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    if (type === 'success') {
        messageDiv.style.background = '#10b981';
    } else {
        messageDiv.style.background = '#ef4444';
    }
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Application tracking
function trackApplication() {
    const applicationId = document.getElementById('applicationId').textContent;
    alert(`Tracking feature coming soon!\nYour application ID: ${applicationId}\n\nYou can check your application status by contacting us at:\n📞 1-800-LEARNING\n📧 loans@learningbank.com`);
}

function newApplication() {
    // Reset form
    document.getElementById('loanApplicationForm').reset();
    currentStep = 1;
    
    // Reset steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('[data-step="1"]').classList.add('active');
    
    // Clear file previews
    document.querySelectorAll('.upload-preview').forEach(preview => {
        preview.innerHTML = 'No file selected';
        preview.classList.remove('has-file');
    });
    
    // Reset navigation
    updateProgress();
    updateNavigationButtons();
    
    // Show application form
    document.getElementById('application-success').style.display = 'none';
    document.getElementById('loan-application').style.display = 'block';
    document.getElementById('loan-application').scrollIntoView({ behavior: 'smooth' });
}

// Smooth scrolling for navigation
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

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .message {
        animation: slideInRight 0.3s ease;
    }
`;
document.head.appendChild(style);