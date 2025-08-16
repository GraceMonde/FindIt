
// Firebase Initialization

/*import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBQebvs0PkwL8b04oFevlKwnKk2cnykpC0",
  authDomain: "findit-910.firebaseapp.com",
  projectId: "findit-910",
  appId: "1:936062673316:web:75d0f6e6883554e0b72131"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
*/

// API Config and Utilities

const API_BASE_URL = 'http://localhost:3000/api';
let authToken = null;

function showSuccessMessage(message) {
  alert(message);
}

function showErrorMessage(message) {
  alert(message);
}


// Login Handler

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


// Registration Handler

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


// Event Listeners

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const registerForm = document.getElementById('register-form');
  if (registerForm) registerForm.addEventListener('submit', handleRegister);

  /*const logoutBtn = document.getElementById('logout-Btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth)
        .then(() => {
          localStorage.removeItem('authToken');
          window.location.href = '/pages/login.html';
        })
        .catch((error) => {
          console.error('Logout error:', error);
          alert('Error during logout. Please try again.');
        });
    });*/
  }
);
