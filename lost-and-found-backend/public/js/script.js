// Configuration
        const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your backend URL
        let currentUser = null;
        let authToken = null;
        let currentReportType = null;

        // DOM Elements
        const authScreen = document.getElementById('auth-screen');
        const mainApp = document.getElementById('main-app');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authToggleLink = document.getElementById('auth-toggle-link');
        const authToggleText = document.getElementById('auth-toggle-text');
        const errorMessage = document.getElementById('error-message');
        const successMessage = document.getElementById('success-message');
        const userNameSpan = document.getElementById('user-name');
        const itemsContainer = document.getElementById('items-container');
        const reportModal = document.getElementById('report-modal');
        const profileModal = document.getElementById('profile-modal');

        // Initialize the application
        function init() {
            checkAuthStatus();
            setupEventListeners();
        }

        // Check if user is authenticated
        function checkAuthStatus() {
            authToken = localStorage.getItem('authToken');
            if (authToken) {
                loadUserProfile();
            } else {
                showAuthScreen();
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            // Authentication
            loginForm.addEventListener('submit', handleLogin);
            registerForm.addEventListener('submit', handleRegister);
            authToggleLink.addEventListener('click', toggleAuthForm);
            document.getElementById('logout-btn').addEventListener('click', handleLogout);

            // Modal controls
            document.getElementById('modal-close').addEventListener('click', closeModal);
            document.getElementById('profile-close').addEventListener('click', closeProfileModal);
            document.getElementById('cancel-report').addEventListener('click', closeModal);
            document.getElementById('cancel-profile').addEventListener('click', closeProfileModal);

            // Report buttons
            document.getElementById('report-lost-btn').addEventListener('click', () => openReportModal('lost'));
            document.getElementById('report-found-btn').addEventListener('click', () => openReportModal('found'));
            document.getElementById('report-form').addEventListener('submit', handleReportSubmit);

            // Profile
            document.getElementById('profile-btn').addEventListener('click', openProfileModal);
            document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);

            // Search
            document.getElementById('search-btn').addEventListener('click', searchItems);
            document.getElementById('search-query').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') searchItems();
            });

            // Close modals when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === reportModal) closeModal();
                if (e.target === profileModal) closeProfileModal();
            });
        }

        // Authentication functions
        async function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    authToken = data.token;
                    localStorage.setItem('authToken', authToken);
                    showSuccessMessage('Login successful!');
                    loadUserProfile();
                } else {
                    showErrorMessage(data.message || 'Login failed');
                }
            } catch (error) {
                showErrorMessage('Network error. Please try again.');
            }
        }

        async function handleRegister(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const phone = document.getElementById('register-phone').value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password, phone }),
                });

                const data = await response.json();

                if (response.ok) {
                    showSuccessMessage('Registration successful! Please login.');
                    toggleAuthForm();
                } else {
                    showErrorMessage(data.message || 'Registration failed');
                }
            } catch (error) {
                showErrorMessage('Network error. Please try again.');
            }
        }

        async function loadUserProfile() {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    currentUser = data.user;
                    userNameSpan.textContent = `Welcome, ${currentUser.name}`;
                    showMainApp();
                    loadItems();
                } else {
                    handleLogout();
                }
            } catch (error) {
                handleLogout();
            }
        }

        function handleLogout() {
            authToken = null;
            currentUser = null;
            localStorage.removeItem('authToken');
            window.location.href = "pages/login.html"; // Redirect to login page
        }

        function toggleAuthForm() {
            const isLoginVisible = !loginForm.classList.contains('hidden');
            
            if (isLoginVisible) {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                authToggleText.textContent = 'Already have an account? ';
                authToggleLink.textContent = 'Sign in';
            } else {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
                authToggleText.textContent = "Don't have an account? ";
                authToggleLink.textContent = 'Sign up';
            }
        }

        // UI functions
        function showAuthScreen() {
            authScreen.classList.remove('hidden');
            mainApp.classList.add('hidden');
        }

        function showMainApp() {
            authScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
        }

        function showErrorMessage(message) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('hidden');
            successMessage.classList.add('hidden');
            setTimeout(() => {
                errorMessage.classList.add('hidden');
            }, 5000);
        }

        function showSuccessMessage(message) {
            successMessage.textContent = message;
            successMessage.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 5000);
        }

        // Items management
        async function loadItems() {
            try {
                const [lostResponse, foundResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/lost-items`),
                    fetch(`${API_BASE_URL}/found-items`)
                ]);

                // lostResponse returns { items: [...] }, foundResponse returns array or { items: [...] }
                const lostData = await lostResponse.json();
                const foundData = await foundResponse.json();

                // Normalize foundData if needed
                const foundItems = Array.isArray(foundData) ? foundData : (foundData.items || []);
                const lostItems = Array.isArray(lostData) ? lostData : (lostData.items || []);

                const allItems = [
                    ...lostItems.map(item => ({ ...item, type: 'lost' })),
                    ...foundItems.map(item => ({ ...item, type: 'found' }))
                ];

                displayItems(allItems);
            } catch (error) {
                itemsContainer.innerHTML = '<p>Error loading items. Please try again.</p>';
            }
        }

        function displayItems(items) {
            if (items.length === 0) {
                itemsContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No items found.</p>';
                return;
            }

            const itemsHTML = items.map(item => `
                <div class="item-card">
                    <span class="item-badge badge-${item.type}">${item.type.toUpperCase()}</span>
                    <h3>${item.title}</h3>
                    <p><strong>Description:</strong> ${item.description}</p>
                    <p><strong>Location:</strong> ${item.last_seen_location_description || item.location_found_description || item.location || ''}</p>
                    <p><strong>Date:</strong> ${item.date_last_seen || item.date_found || item.date || ''}</p>
                    <p><strong>Category:</strong> ${item.category_id || item.category || ''}</p>
                    <p><strong>Contact:</strong> ${item.user_name || ''}</p>
                </div>
            `).join('');

            itemsContainer.innerHTML = `<div class="items-grid">${itemsHTML}</div>`;
        }

        async function searchItems() {
            const query = document.getElementById('search-query').value;
            const type = document.getElementById('filter-type').value;
            const category = document.getElementById('filter-category').value;

            try {
                let items = [];
                
                if (type === 'lost' || type === '') {
                    const params = new URLSearchParams();
                    if (query) params.append('search', query);
                    if (category) params.append('category', category);
                    
                    const response = await fetch(`${API_BASE_URL}/lost-items?${params}`);
                    const data = await response.json();
                    items.push(...data.items.map(item => ({ ...item, type: 'lost' })));
                }
                
                if (type === 'found' || type === '') {
                    const params = new URLSearchParams();
                    if (query) params.append('search', query);
                    if (category) params.append('category', category);
                    
                    const response = await fetch(`${API_BASE_URL}/found-items?${params}`);
                    const data = await response.json();
                    items.push(...data.items.map(item => ({ ...item, type: 'found' })));
                }

                displayItems(items);
            } catch (error) {
                showErrorMessage('Error searching items. Please try again.');
            }
        }

        // Modal functions
        function openReportModal(type) {
            currentReportType = type;
            document.getElementById('modal-title').textContent = `Report ${type.charAt(0).toUpperCase() + type.slice(1)} Item`;
            document.getElementById('report-form').reset();
            document.getElementById('item-date').value = new Date().toISOString().split('T')[0];
            reportModal.style.display = 'block';
        }

        function closeModal() {
            reportModal.style.display = 'none';
        }

        async function handleReportSubmit(e) {
            e.preventDefault();
            
            const itemData = {
                title: document.getElementById('item-title').value,
                description: document.getElementById('item-description').value,
                category_id: document.getElementById('item-category').value,
                last_seen_location_description: document.getElementById('item-location').value,
                location_found_description: document.getElementById('item-location').value,
                date_last_seen: document.getElementById('item-date').value,
                date_found: document.getElementById('item-date').value,
            };

            try {
                let endpoint, body;
                if (currentReportType === 'lost') {
                    endpoint = 'lost-items';
                    body = {
                        title: itemData.title,
                        description: itemData.description,
                        category_id: itemData.category_id,
                        last_seen_location_description: itemData.last_seen_location_description,
                        date_last_seen: itemData.date_last_seen
                    };
                } else {
                    endpoint = 'found-items';
                    body = {
                        title: itemData.title,
                        description: itemData.description,
                        category_id: itemData.category_id,
                        location_found_description: itemData.location_found_description,
                        date_found: itemData.date_found
                    };
                }
                const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(body),
                });

                if (response.ok) {
                    showSuccessMessage(`${currentReportType.charAt(0).toUpperCase() + currentReportType.slice(1)} item reported successfully!`);
                    closeModal();
                    loadItems();
                } else {
                    const data = await response.json();
                    showErrorMessage(data.message || 'Failed to report item');
                }
            } catch (error) {
                showErrorMessage('Network error. Please try again.');
            }
        }

        function openProfileModal() {
            document.getElementById('profile-name').value = currentUser.name || '';
            document.getElementById('profile-email').value = currentUser.email || '';
            document.getElementById('profile-phone').value = currentUser.phone_number || '';
            profileModal.style.display = 'block';
        }

        function closeProfileModal() {
            profileModal.style.display = 'none';
        }

        async function handleProfileUpdate(e) {
            e.preventDefault();
            
            const profileData = {
                name: document.getElementById('profile-name').value,
                email: document.getElementById('profile-email').value,
                phone: document.getElementById('profile-phone').value,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(profileData),
                });

                if (response.ok) {
                    const data = await response.json();
                    currentUser = data.user;
                    userNameSpan.textContent = `Welcome, ${currentUser.name}`;
                    showSuccessMessage('Profile updated successfully!');
                    closeProfileModal();
                } else {
                    const data = await response.json();
                    showErrorMessage(data.message || 'Failed to update profile');
                }
            } catch (error) {
                showErrorMessage('Network error. Please try again.');
            }
        }

        // Initialize the application when the DOM is loaded
        document.addEventListener('DOMContentLoaded', init);