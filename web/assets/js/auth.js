const API_BASE_URL = 'http://localhost:3000/api';
let currentUser = null;
let authToken = null;
let currentReportType = null;

// Show success message
function showSuccessMessage(message) {
    alert(message); // You can replace with a styled toast later
}

// Show error message
function showErrorMessage(message) {
    alert(message);
}

// Toggle login/register form
function toggleAuthForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authToggleText = document.getElementById('auth-toggle-text');
    const authToggleLink = document.getElementById('auth-toggle-link');

    const isLoginVisible = !loginForm.classList.contains('hidden');

    if (isLoginVisible) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authToggleText.textContent = 'Already have an account? ';
        authToggleLink.textContent = 'Sign in';
    } else {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authToggleText.textContent = "Don't have an account? ";
        authToggleLink.textContent = 'Sign up';
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            showSuccessMessage('Login successful!');
            loadUserProfile();
            window.location.href = "index.html";
        } else {
            if (data.errors && Array.isArray(data.errors)) {
                const messages = data.errors.map(err => err.msg).join('\n');
                showErrorMessage(messages);
            } else {
                showErrorMessage(data.message || 'Login failed');
            }
        }
    } catch {
        showErrorMessage('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const phone = document.getElementById('register-phone').value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone }),
        });

        const data = await res.json();

        if (res.ok) {
            showSuccessMessage('Registration successful! Logging you in...');

            // Now automatically log in the user
            const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const loginData = await loginRes.json();

            if (loginRes.ok) {
                authToken = loginData.token;
                localStorage.setItem('authToken', authToken);
                showSuccessMessage('Welcome! You are now logged in.');
                loadUserProfile(); // optional: preload user data
                window.location.href = 'index.html';
            } else {
                showErrorMessage('Registration succeeded but login failed.');
                toggleAuthForm(); // fallback: prompt them to login manually
            }
        } else {
            if (data.errors && Array.isArray(data.errors)) {
                const messages = data.errors.map(err => err.msg).join('\n');
                showErrorMessage(messages);
            } else {
                showErrorMessage(data.message || 'Registration failed');
            }
        }
    } catch {
        showErrorMessage('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
}

// Handle Logout
function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showAuthScreen(); // You must define this function elsewhere
}

// Bind event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('auth-toggle-link')?.addEventListener('click', toggleAuthForm);
});
