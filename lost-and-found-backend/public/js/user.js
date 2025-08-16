// user.js
const authToken = localStorage.getItem('authToken'); 
const API_BASE_URL = 'http://localhost:3000/api'; 
let currentUser = null;

async function loadUserProfile() {
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (res.ok) {
            const data = await res.json();
            currentUser = data.user || data; // support both {user: {...}} and {...}

            // Display user name
            const userNameElem = document.getElementById('user-name');
            if (userNameElem) {
                userNameElem.textContent = `Welcome, ${currentUser.name}`;
            }

            // Show main app UI if available
            if (typeof showMainApp === 'function') {
                showMainApp();
            }

            // Load items if function exists
            if (typeof loadItems === 'function') {
                loadItems();
            }
        } else {
            handleLogout();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        handleLogout();
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    if (!authToken) {
        showErrorMessage('Session expired. Please log in again.');
        window.location.href = 'login.html';
        return;
    }

    const profileData = {
        name: document.getElementById('profile-name').value.trim(),
        email: document.getElementById('profile-email').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
    };

    try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(profileData),
        });

        const data = await res.json();

        if (res.ok) {
            currentUser = data.user;
            document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}`;
            showSuccessMessage('Profile updated successfully!');
            if (typeof closeProfileModal === 'function') closeProfileModal();
        } else {
            showErrorMessage(data.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showErrorMessage('Network error. Please try again.');
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

// Auto-load profile when DOM is ready
document.addEventListener('DOMContentLoaded', loadUserProfile);
