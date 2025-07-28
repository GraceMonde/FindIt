const API_BASE_URL = 'http://localhost:3000/api';
let authToken = null;

// Show success message
function showSuccessMessage(message) {
    alert(message);
}

// Show error message
function showErrorMessage(message) {
    alert(message);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

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
            // Redirect after login
            window.location.href = "index.html";
        } else {
            const errorMsg = data?.message || (data.errors ? data.errors.map(err => err.msg).join('\n') : 'Login failed');
            showErrorMessage(errorMsg);
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

// Handle Register (Optional: If you want the same file to handle registration)
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const phone = document.getElementById('register-phone').value.trim();

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
            showSuccessMessage('Registration successful! Redirecting to login...');
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            const errorMsg = data?.message || (data.errors ? data.errors.map(err => err.msg).join('\n') : 'Registration failed');
            showErrorMessage(errorMsg);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showErrorMessage('Network error. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
}

// Bind event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
});
