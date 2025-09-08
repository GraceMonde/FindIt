// Admin-related functions

// Load admin dashboard
async function loadAdminDashboard() {
    try {
        const response = await apiRequest('/api/admin/logs');
        const data = await response.json();
        
        if (response.ok) {
            const { stats } = data;
            
            // Update stats
            document.getElementById('stats-total-items').textContent = stats.totalItems;
            document.getElementById('stats-lost-items').textContent = stats.lostItems;
            document.getElementById('stats-found-items').textContent = stats.foundItems;
            document.getElementById('stats-returned-items').textContent = stats.returnedItems;
            document.getElementById('stats-total-claims').textContent = stats.totalClaims;
            document.getElementById('stats-approved-claims').textContent = stats.approvedClaims;
            document.getElementById('stats-denied-claims').textContent = stats.deniedClaims;
            document.getElementById('stats-pending-claims').textContent = stats.pendingClaims;
        } else {
            showAlert(data.message || 'Failed to load dashboard', 'danger');
        }
    } catch (error) {
        console.error('Load admin dashboard error:', error);
        showAlert('An error occurred while loading the dashboard', 'danger');
    }
}

// Load admin claims
async function loadAdminClaims() {
    try {
        const response = await apiRequest('/api/claims?status=Pending');
        const claims = await response.json();
        
        if (response.ok) {
            const claimsContainer = document.getElementById('admin-claims-container');
            
            if (claims.length === 0) {
                claimsContainer.innerHTML = '<div class="col-12 text-center py-4">No pending claims</div>';
                return;
            }
            
            claimsContainer.innerHTML = claims.map(claim => `
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Claim for ${claim.item ? claim.item.title : 'Unknown Item'}</h5>
                            <p class="card-text">
                                Claimant: ${claim.claimantName}<br>
                                Finder: ${claim.finderName}
                            </p>
                            <div class="d-flex justify-content-between">
                                <button class="btn btn-success btn-approve-claim" data-claim-id="${claim.id}">Approve</button>
                                <button class="btn btn-danger btn-deny-claim" data-claim-id="${claim.id}">Deny</button>
                                <a href="/admin/claims/${claim.id}" class="btn btn-outline-primary">Details</a>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Setup approve/deny buttons
            document.querySelectorAll('.btn-approve-claim').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const claimId = e.target.getAttribute('data-claim-id');
                    approveClaim(claimId);
                });
            });
            
            document.querySelectorAll('.btn-deny-claim').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const claimId = e.target.getAttribute('data-claim-id');
                    denyClaim(claimId);
                });
            });
        } else {
            showAlert('Failed to load claims', 'danger');
        }
    } catch (error) {
        console.error('Load admin claims error:', error);
        showAlert('An error occurred while loading claims', 'danger');
    }
}

// Load admin users
async function loadAdminUsers() {
    try {
        const response = await apiRequest('/api/admin/users');
        const users = await response.json();
        
        if (response.ok) {
            const usersContainer = document.getElementById('admin-users-container');
            
            if (users.length === 0) {
                usersContainer.innerHTML = '<div class="col-12 text-center py-4">No users found</div>';
                return;
            }
            
            usersContainer.innerHTML = users.map(user => `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${user.name}</h5>
                            <p class="card-text">
                                ${user.email}<br>
                                ${user.comp}<br>
                                ${user.school}
                            </p>
                            <div class="d-flex justify-content-between">
                                <span class="badge bg-${user.role === 'admin' ? 'danger' : 'primary'}">${user.role}</span>
                                <div>
                                    <a href="/admin/users/${user.id}" class="btn btn-sm btn-outline-primary">View</a>
                                    <button class="btn btn-sm btn-outline-danger btn-deactivate-user" data-user-id="${user.id}">Deactivate</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Setup deactivate buttons
            document.querySelectorAll('.btn-deactivate-user').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userId = e.target.getAttribute('data-user-id');
                    deactivateUser(userId);
                });
            });
        } else {
            showAlert('Failed to load users', 'danger');
        }
    } catch (error) {
        console.error('Load admin users error:', error);
        showAlert('An error occurred while loading users', 'danger');
    }
}

// Load admin logs
async function loadAdminLogs() {
    try {
        const response = await apiRequest('/api/admin/logs');
        const data = await response.json();
        
        if (response.ok) {
            const { items, claims } = data;
            
            // Load items
            const logsItemsContainer = document.getElementById('logs-items-container');
            if (items.length === 0) {
                logsItemsContainer.innerHTML = '<div class="col-12 text-center py-4">No items found</div>';
            } else {
                logsItemsContainer.innerHTML = items.map(item => `
                    <tr>
                        <td>${item.title}</td>
                        <td><span class="badge bg-${item.type === 'lost' ? 'danger' : 'success'}">${item.type}</span></td>
                        <td>${item.categoryName}</td>
                        <td>${item.locationName}</td>
                        <td>${item.userName}</td>
                        <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            }
            
            // Load claims
            const logsClaimsContainer = document.getElementById('logs-claims-container');
            if (claims.length === 0) {
                logsClaimsContainer.innerHTML = '<div class="col-12 text-center py-4">No claims found</div>';
            } else {
                logsClaimsContainer.innerHTML = claims.map(claim => `
                    <tr>
                        <td>${claim.claimantName}</td>
                        <td>${claim.foundItemId}</td>
                        <td><span class="badge bg-${getStatusColor(claim.status)}">${claim.status}</span></td>
                        <td>${new Date(claim.createdAt).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            }
        } else {
            showAlert('Failed to load logs', 'danger');
        }
    } catch (error) {
        console.error('Load admin logs error:', error);
        showAlert('An error occurred while loading logs', 'danger');
    }
}

// Deactivate user (admin function)
async function deactivateUser(userId) {
    if (!confirm('Are you sure you want to deactivate this user?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/api/admin/users/${userId}/deactivate`, {
            method: 'PUT'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('User deactivated successfully', 'success');
            
            // Reload admin users
            setTimeout(() => {
                loadAdminUsers();
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to deactivate user', 'danger');
        }
    } catch (error) {
        console.error('Deactivate user error:', error);
        showAlert('An error occurred while deactivating the user', 'danger');
    }
}