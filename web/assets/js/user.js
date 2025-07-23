// user.js
async function loadUserProfile() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (res.ok) {
            const data = await res.json();
            currentUser = data.user;
            document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}`;
            showMainApp();
            loadItems();
        } else {
            handleLogout();
        }
    } catch {
        handleLogout();
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    const profileData = {
        name: document.getElementById('profile-name').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
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
            closeProfileModal();
        } else {
            showErrorMessage(data.message || 'Failed to update profile');
        }
    } catch {
        showErrorMessage('Network error. Please try again.');
    }
}
