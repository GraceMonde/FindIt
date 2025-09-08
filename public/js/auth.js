// Authentication functions

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const comp = form.comp.value;
    const password = form.password.value;
    
    try {
        const response = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ comp, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and user data
            setAuthToken(data.token);
            setUser(data.user);
            
            // Update UI
            updateAuthUI();
            
            // Redirect to home page
            redirectTo('/');
        } else {
            showAlert(data.message || 'Login failed', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('An error occurred during login', 'danger');
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const comp = form.comp.value;
    const name = form.name.value;
    const email = form.email.value;
    const school = form.school.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'danger');
        return;
    }
    
    try {
        const response = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ comp, name, email, school, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and user data
            setAuthToken(data.token);
            setUser(data.user);
            
            // Update UI
            updateAuthUI();
            
            // Redirect to home page
            redirectTo('/');
        } else {
            if (data.errors) {
                handleValidationErrors(data.errors);
            } else {
                showAlert(data.message || 'Registration failed', 'danger');
            }
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('An error occurred during registration', 'danger');
    }
}

// Logout function
async function logout() {
    try {
        // Call logout endpoint if needed
        // await apiRequest('/api/auth/logout', { method: 'POST' });
        
        // Clear local storage
        removeAuthToken();
        removeUser();
        
        // Update UI
        updateAuthUI();
        
        // Redirect to home page
        redirectTo('/');
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('An error occurred during logout', 'danger');
    }
}