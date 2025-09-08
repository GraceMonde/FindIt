// Utility functions

// API base URL
const API_BASE_URL = '/api';

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set auth token in localStorage
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Remove auth token from localStorage
function removeAuthToken() {
    localStorage.removeItem('authToken');
}

// Get user data from localStorage
function getUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

// Set user data in localStorage
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Remove user data from localStorage
function removeUser() {
    localStorage.removeItem('user');
}

// Check if user is logged in
function isLoggedIn() {
    return !!getAuthToken();
}

// Check if user is admin
function isAdmin() {
    const user = getUser();
    return user && user.role === 'admin';
}

// Update UI based on auth status
function updateAuthUI() {
    const loggedIn = isLoggedIn();
    const user = getUser();
    
    // Show/hide navigation items
    document.getElementById('nav-login').style.display = loggedIn ? 'none' : 'block';
    document.getElementById('nav-register').style.display = loggedIn ? 'none' : 'block';
    document.getElementById('nav-user').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('nav-create-item').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('nav-profile').style.display = loggedIn ? 'block' : 'none';
    
    // Show admin navigation if user is admin
    if (user && user.role === 'admin') {
        document.getElementById('nav-admin').style.display = 'block';
    } else {
        document.getElementById('nav-admin').style.display = 'none';
    }
    
    // Update username in navigation
    if (user) {
        document.getElementById('nav-username').textContent = user.name;
    }
}

// Check auth status and update UI
function checkAuthStatus() {
    updateAuthUI();
}

// Show alert message
function showAlert(message, type = 'danger') {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert at the top of the main content
    const appContent = document.getElementById('app-content');
    appContent.insertBefore(alertContainer, appContent.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertContainer.classList.remove('show');
        setTimeout(() => {
            alertContainer.remove();
        }, 150);
    }, 5000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Redirect to a different page
function redirectTo(path) {
    window.location.href = path;
}

// Make API request with auth token
async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    const response = await fetch(url, mergedOptions);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
        removeAuthToken();
        removeUser();
        updateAuthUI();
        redirectTo('/login');
        throw new Error('Unauthorized');
    }
    
    return response;
}

// Handle form validation errors
function handleValidationErrors(errors) {
    if (errors && errors.length > 0) {
        const errorMessages = errors.map(error => error.msg).join('<br>');
        showAlert(errorMessages, 'danger');
    }
}

// Toggle date fields based on item type
function toggleDateFields() {
    const lostDateField = document.getElementById('dateLastSeenField');
    const foundDateField = document.getElementById('dateFoundField');
    const type = document.querySelector('input[name="type"]:checked').value;
    
    if (type === 'lost') {
        lostDateField.style.display = 'block';
        foundDateField.style.display = 'none';
    } else {
        lostDateField.style.display = 'none';
        foundDateField.style.display = 'block';
    }
}

// Preview uploaded images
function previewImages() {
    const imageInput = document.getElementById('images');
    const previewContainer = document.getElementById('image-preview');
    
    // Clear previous previews
    previewContainer.innerHTML = '';
    
    if (imageInput.files && imageInput.files.length > 0) {
        for (let i = 0; i < imageInput.files.length; i++) {
            const file = imageInput.files[i];
            
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const preview = document.createElement('div');
                    preview.className = 'image-preview';
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-image';
                    removeBtn.innerHTML = '×';
                    removeBtn.type = 'button';
                    
                    preview.appendChild(img);
                    preview.appendChild(removeBtn);
                    previewContainer.appendChild(preview);
                };
                
                reader.readAsDataURL(file);
            }
        }
    }
}

// Add security question fields
function addSecurityQuestionFields() {
    const container = document.getElementById('security-questions-container');
    
    for (let i = 1; i <= 3; i++) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'security-question';
        questionDiv.innerHTML = `
            <h5>Security Question ${i}</h5>
            <div class="mb-3">
                <label for="question${i}" class="form-label">Question</label>
                <input type="text" class="form-control" id="question${i}" name="securityQuestions[${i-1}].question" required>
            </div>
            <div class="mb-3">
                <label for="answer${i}" class="form-label">Answer</label>
                <input type="text" class="form-control" id="answer${i}" name="securityQuestions[${i-1}].answer" required>
            </div>
        `;
        
        container.appendChild(questionDiv);
    }
}

// Show loading spinner
function showLoading(container) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-container';
    spinner.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    
    container.appendChild(spinner);
}

// Hide loading spinner
function hideLoading(container) {
    const spinner = container.querySelector('.spinner-container');
    if (spinner) {
        spinner.remove();
    }
}