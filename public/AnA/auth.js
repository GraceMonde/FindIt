// Firebase Authentication Functions
class Auth {
  constructor() {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.storage = firebase.storage();
    
    // Initialize Firebase
    this.initializeFirebase();
    
    // Set up authentication state listener
    this.setupAuthListener();
  }

  // Initialize Firebase
  initializeFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyBQebvs0PkwL8b04oFevlKwnKk2cnykpC0",
      authDomain: "findit-910.firebaseapp.com",
      projectId: "findit-910",
      storageBucket: "findit-910.firebasestorage.app",
      messagingSenderId: "936062673316",
      appId: "1:936062673316:web:75d0f6e6883554e0b72131"
    };
    
    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  }

  // Set up authentication state listener
  setupAuthListener() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        this.updateUI(user);
      } else {
        // User is signed out
        this.updateUI(null);
      }
    });
  }

  // Register a new user
  async register(email, password, comp, name, school) {
    try {
      // Create user with email and password
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Add user to Firestore
      await this.db.collection('users').doc(user.uid).set({
        comp: comp,
        name: name,
        email: email,
        school: school,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        isDeleted: false,
        trackRecord: {
          itemsFound: 0,
          itemsLost: 0,
          itemsReturned: 0,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }
      });
      
      // Send verification email
      await user.sendEmailVerification();
      
      // Show success message
      this.showNotification('Registration successful! Please check your email for verification.', 'success');
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/AnA/login.html';
      }, 2000);
      
    } catch (error) {
      this.handleError(error);
    }
  }

  // Login user
  async login(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update last login
      await this.db.collection('users').doc(user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Show success message
      this.showNotification('Login successful!', 'success');
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
      
    } catch (error) {
      this.handleError(error);
    }
  }

  // Logout user
  async logout() {
    try {
      await this.auth.signOut();
      this.showNotification('Logged out successfully', 'info');
      window.location.href = '/AnA/login.html';
    } catch (error) {
      this.handleError(error);
    }
  }

  // Send password reset email
  async resetPassword(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      this.showNotification('Password reset email sent! Check your inbox.', 'success');
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update UI based on authentication state
  updateUI(user) {
    if (user) {
      // User is signed in
      document.querySelectorAll('.auth-user').forEach(el => {
        el.style.display = 'block';
      });
      
      document.querySelectorAll('.auth-no-user').forEach(el => {
        el.style.display = 'none';
      });
      
      // Display user info if elements exist
      const userDisplayName = document.getElementById('user-display-name');
      if (userDisplayName) {
        userDisplayName.textContent = user.displayName || user.email;
      }
    } else {
      // User is signed out
      document.querySelectorAll('.auth-user').forEach(el => {
        el.style.display = 'none';
      });
      
      document.querySelectorAll('.auth-no-user').forEach(el => {
        el.style.display = 'block';
      });
    }
  }

  // Handle errors
  handleError(error) {
    let errorMessage = 'An error occurred. Please try again.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email address is already in use.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'User not found. Please check your email.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please use a stronger password.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed login attempts. Please try again later.';
        break;
      default:
        errorMessage = error.message;
    }
    
    this.showNotification(errorMessage, 'error');
  }

  // Show notification
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 150);
    }, 5000);
  }
}

// Initialize Auth class
const auth = new Auth();

// Make it available globally
window.auth = auth;