// Items-related functions

// Handle search form submission
function handleSearch(event) {
    event.preventDefault();
    
    const form = event.target;
    const q = form.q.value;
    const type = form.type.value;
    const categoryId = form.categoryId.value;
    const locationId = form.locationId.value;
    const status = form.status.value;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (type) params.append('type', type);
    if (categoryId) params.append('categoryId', categoryId);
    if (locationId) params.append('locationId', locationId);
    if (status) params.append('status', status);
    
    const queryParams = params.toString();
    const url = queryParams ? `/items?${queryParams}` : '/items';
    
    // Update URL without reloading
    window.history.pushState({}, '', url);
    
    // Load items with filters
    loadItems(queryParams ? `?${queryParams}` : '');
}

// Handle create item form submission
async function handleCreateItem(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // Collect form data
    const formData = new FormData(form);
    const itemData = {
        title: formData.get('title'),
        description: formData.get('description'),
        type: formData.get('type'),
        categoryId: formData.get('categoryId'),
        locationId: formData.get('locationId'),
        additionalContactInfo: formData.get('additionalContactInfo'),
        searchKeywords: formData.get('searchKeywords').split(',').map(k => k.trim()).filter(k => k)
    };
    
    // Add date based on type
    if (itemData.type === 'lost') {
        itemData.dateLastSeen = formData.get('dateLastSeen');
    } else {
        itemData.dateFound = formData.get('dateFound');
    }
    
    // Collect security questions
    const securityQuestions = [];
    for (let i = 0; i < 3; i++) {
        const question = formData.get(`securityQuestions[${i}].question`);
        const answer = formData.get(`securityQuestions[${i}].answer`);
        
        if (question && answer) {
            securityQuestions.push({ question, answer });
        }
    }
    
    itemData.securityQuestions = securityQuestions;
    
    try {
        // Create FormData for file upload
        const itemFormData = new FormData();
        
        // Add JSON data
        itemFormData.append('data', JSON.stringify(itemData));
        
        // Add images
        const images = formData.getAll('images');
        images.forEach(image => {
            itemFormData.append('images', image);
        });
        
        const response = await apiRequest('/api/items', {
            method: 'POST',
            body: itemFormData,
            headers: {} // Let browser set Content-Type for FormData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Item created successfully', 'success');
            
            // Redirect to item detail page
            setTimeout(() => {
                redirectTo(`/items/${data.item.id}`);
            }, 1500);
        } else {
            if (data.errors) {
                handleValidationErrors(data.errors);
            } else {
                showAlert(data.message || 'Failed to create item', 'danger');
            }
        }
    } catch (error) {
        console.error('Create item error:', error);
        showAlert('An error occurred while creating the item', 'danger');
    }
}

// Handle claim item form submission
async function handleClaimItem(event) {
    event.preventDefault();
    
    const form = event.target;
    const foundItemId = form.foundItemId.value;
    
    // Collect security answers
    const securityAnswers = [];
    for (let i = 1; i <= 3; i++) {
        const answer = form.get(`answer${i}`);
        if (answer) {
            securityAnswers.push(answer);
        }
    }
    
    const claimData = {
        foundItemId,
        securityAnswers,
        message: form.message.value
    };
    
    try {
        const response = await apiRequest('/api/claims', {
            method: 'POST',
            body: JSON.stringify(claimData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Claim submitted successfully', 'success');
            
            // Redirect to item detail page
            setTimeout(() => {
                redirectTo(`/items/${foundItemId}`);
            }, 1500);
        } else {
            if (data.errors) {
                handleValidationErrors(data.errors);
            } else {
                showAlert(data.message || 'Failed to submit claim', 'danger');
            }
        }
    } catch (error) {
        console.error('Claim item error:', error);
        showAlert('An error occurred while submitting the claim', 'danger');
    }
}

// Approve claim (admin function)
async function approveClaim(claimId) {
    if (!confirm('Are you sure you want to approve this claim?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/api/claims/${claimId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'Approved' })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Claim approved successfully', 'success');
            
            // Reload admin claims
            setTimeout(() => {
                loadAdminClaims();
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to approve claim', 'danger');
        }
    } catch (error) {
        console.error('Approve claim error:', error);
        showAlert('An error occurred while approving the claim', 'danger');
    }
}

// Deny claim (admin function)
async function denyClaim(claimId) {
    if (!confirm('Are you sure you want to deny this claim?')) {
        return;
    }
    
    const adminComment = prompt('Please provide a reason for denying this claim:');
    if (adminComment === null) return; // User cancelled
    
    try {
        const response = await apiRequest(`/api/claims/${claimId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'Denied', adminComment })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Claim denied successfully', 'success');
            
            // Reload admin claims
            setTimeout(() => {
                loadAdminClaims();
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to deny claim', 'danger');
        }
    } catch (error) {
        console.error('Deny claim error:', error);
        showAlert('An error occurred while denying the claim', 'danger');
    }
}