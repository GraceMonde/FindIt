// main.js
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

function checkAuthStatus() {
    authToken = localStorage.getItem('authToken');
    if (authToken) {
        loadUserProfile();
    } else {
        showAuthScreen();
    }
}

function setupEventListeners() {
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('auth-toggle-link')?.addEventListener('click', toggleAuthForm);
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    document.getElementById('report-lost-btn')?.addEventListener('click', () => openReportModal('lost'));
    document.getElementById('report-found-btn')?.addEventListener('click', () => openReportModal('found'));
    document.getElementById('cancel-report')?.addEventListener('click', closeModal);
    document.getElementById('cancel-profile')?.addEventListener('click', closeProfileModal);
    document.getElementById('profile-btn')?.addEventListener('click', openProfileModal);
    document.getElementById('search-btn')?.addEventListener('click', searchItems);
}
