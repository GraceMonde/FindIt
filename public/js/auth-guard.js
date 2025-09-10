// auth-guard.js
(function () {
    const token = localStorage.getItem('authToken');

    // If no token, redirect to login
    if (!token) {
        window.location.href = 'login.html';
    }
})();
