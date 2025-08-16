// modal.js
function openReportModal(type) {
    currentReportType = type;
    document.getElementById('modal-title').textContent = `Report ${type}`;
    document.getElementById('report-form').reset();
    document.getElementById('item-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('report-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('report-modal').style.display = 'none';
}

function openProfileModal() {
    document.getElementById('profile-name').value = currentUser.name || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-phone').value = currentUser.phone_number || '';
    document.getElementById('profile-modal').style.display = 'block';
}

function closeProfileModal() {
    document.getElementById('profile-modal').style.display = 'none';
}
