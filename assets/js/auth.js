/**
 * Authentication Management System
 * Handles user login, registration, and authentication state
 */

class AuthManager {
    constructor() {
        this.dataManager = new DataManager();
        this.currentUser = null;
        
        // Load current user from storage
        this.loadCurrentUser();
    }

    /**
     * Initialize authentication for login page
     */
    static init() {
        const authManager = new AuthManager();
        authManager.setupLoginForm();
        authManager.setupPasswordToggle();
        authManager.setupSocialAuth();
        
        // Auto-fill demo credentials
        authManager.setupDemoCredentials();
    }

    /**
     * Initialize authentication for registration page
     */
    static initRegister() {
        const authManager = new AuthManager();
        authManager.setupRegisterForm();
        authManager.setupPasswordToggle();
        authManager.setupPasswordRequirements();
        authManager.setupSocialAuth();
    }

    /**
     * Setup login form
     */
    setupLoginForm() {
        const form = document.getElementById('login-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(form);
        });
    }

    /**
     * Setup registration form
     */
    setupRegisterForm() {
        const form = document.getElementById('register-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister(form);
        });
    }

    /**
     * Setup password toggle functionality
     */
    setupPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.setAttribute('data-lucide', 'eye-off');
                } else {
                    input.type = 'password';
                    icon.setAttribute('data-lucide', 'eye');
                }
                
                // Re-initialize Lucide icons
                lucide.createIcons();
            });
        });
    }

    /**
     * Setup password requirements validation
     */
    setupPasswordRequirements() {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (!passwordInput) return;

        passwordInput.addEventListener('input', () => {
            this.validatePasswordRequirements(passwordInput.value);
        });

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
            });
        }
    }

    /**
     * Validate password requirements
     */
    validatePasswordRequirements(password) {
        const requirements = {
            length: password.length >= 6,
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password)
        };

        // Update requirement indicators
        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(`${req}-req`);
            if (element) {
                element.classList.toggle('valid', requirements[req]);
            }
        });

        return Object.values(requirements).every(Boolean);
    }

    /**
     * Validate password match
     */
    validatePasswordMatch(password, confirmPassword) {
        const confirmInput = document.getElementById('confirmPassword');
        if (!confirmInput) return true;

        const isMatch = password === confirmPassword && confirmPassword !== '';
        
        if (confirmPassword && !isMatch) {
            confirmInput.setCustomValidity('Passwords do not match');
        } else {
            confirmInput.setCustomValidity('');
        }

        return isMatch;
    }

    /**
     * Setup social authentication
     */
    setupSocialAuth() {
        const googleBtns = document.querySelectorAll('#google-auth, #google-register');
        const githubBtns = document.querySelectorAll('#github-auth, #github-register');

        googleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleSocialAuth('google'));
        });

        githubBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleSocialAuth('github'));
        });
    }

    /**
     * Setup demo credentials auto-fill
     */
    setupDemoCredentials() {
        const demoAccounts = document.querySelectorAll('.demo-account');
        
        demoAccounts.forEach(account => {
            account.addEventListener('click', () => {
                const text = account.textContent;
                const emailMatch = text.match(/Email: (.+)/);
                const passwordMatch = text.match(/Password: (.+)/);
                
                if (emailMatch && passwordMatch) {
                    const emailInput = document.getElementById('email');
                    const passwordInput = document.getElementById('password');
                    
                    if (emailInput) emailInput.value = emailMatch[1];
                    if (passwordInput) passwordInput.value = passwordMatch[1];
                }
            });
        });
    }

    /**
     * Handle login form submission
     */
    async handleLogin(form) {
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.get('remember') === 'on'
        };

        try {
            this.showLoading('login-btn');
            
            // Simulate API delay
            await this.delay(1500);
            
            const user = await this.authenticateUser(credentials);
            
            if (user) {
                this.setCurrentUser(user, credentials.remember);
                Utils.showNotification('Login successful!', 'success');
                
                // Redirect based on user role
                setTimeout(() => {
                    if (user.role === 'admin') {
                        window.location.href = '../admin/dashboard.html';
                    } else {
                        window.location.href = '../index.html';
                    }
                }, 1000);
            } else {
                throw new Error('Invalid credentials');
            }
            
        } catch (error) {
            Utils.showNotification(error.message, 'error');
        } finally {
            this.hideLoading('login-btn');
        }
    }

    /**
     * Handle registration form submission
     */
    async handleRegister(form) {
        const formData = new FormData(form);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            role: formData.get('role'),
            terms: formData.get('terms') === 'on',
            newsletter: formData.get('newsletter') === 'on'
        };

        try {
            // Validate form data
            this.validateRegistrationData(userData);
            
            this.showLoading('register-btn');
            
            // Simulate API delay
            await this.delay(2000);
            
            const user = await this.createUser(userData);
            
            if (user) {
                this.setCurrentUser(user, false);
                Utils.showNotification('Account created successfully!', 'success');
                
                // Redirect to main page
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            }
            
        } catch (error) {
            Utils.showNotification(error.message, 'error');
        } finally {
            this.hideLoading('register-btn');
        }
    }

    /**
     * Validate registration data
     */
    validateRegistrationData(userData) {
        if (!userData.firstName || !userData.lastName) {
            throw new Error('First name and last name are required');
        }

        if (!userData.email || !Utils.isEmail(userData.email)) {
            throw new Error('Please enter a valid email address');
        }

        if (!this.validatePasswordRequirements(userData.password)) {
            throw new Error('Password does not meet requirements');
        }

        if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        if (!userData.role) {
            throw new Error('Please select an account type');
        }

        if (!userData.terms) {
            throw new Error('You must accept the Terms of Service');
        }

        // Check if user already exists
        const existingUser = this.dataManager.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('An account with this email already exists');
        }
    }

    /**
     * Authenticate user credentials
     */
    async authenticateUser(credentials) {
        // Check demo credentials first
        const demoUsers = [
            { email: 'user@demo.com', password: 'demo123', role: 'user', name: 'Demo User' },
            { email: 'admin@demo.com', password: 'admin123', role: 'admin', name: 'Admin User' }
        ];

        const demoUser = demoUsers.find(user => 
            user.email === credentials.email && user.password === credentials.password
        );

        if (demoUser) {
            return {
                id: this.generateId(),
                name: demoUser.name,
                email: demoUser.email,
                role: demoUser.role,
                joinedAt: new Date().toLocaleDateString(),
                lastLogin: new Date().toLocaleDateString()
            };
        }

        // Check registered users
        const user = this.dataManager.getUserByEmail(credentials.email);
        if (user && user.password === credentials.password) {
            // Update last login
            user.lastLogin = new Date().toLocaleDateString();
            this.dataManager.updateUser(user.id, user);
            return user;
        }

        return null;
    }

    /**
     * Create new user account
     */
    async createUser(userData) {
        const user = {
            id: this.generateId(),
            name: `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password, // In production, this should be hashed
            role: userData.role === 'business' ? 'premium' : 'user',
            accountType: userData.role,
            newsletter: userData.newsletter,
            joinedAt: new Date().toLocaleDateString(),
            lastLogin: new Date().toLocaleDateString(),
            downloads: 0,
            favorites: []
        };

        this.dataManager.addUser(user);
        
        // Remove password from returned user object for security
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Handle social authentication
     */
    handleSocialAuth(provider) {
        Utils.showNotification(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication would be handled here`, 'info');
        
        // In a real application, this would integrate with OAuth providers
        console.log(`Initiating ${provider} authentication...`);
    }

    /**
     * Set current user and store in localStorage/sessionStorage
     */
    setCurrentUser(user, remember = false) {
        this.currentUser = user;
        
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('templatehub_user', JSON.stringify(user));
        
        // Set auth flag
        storage.setItem('templatehub_auth', 'true');
        
        // Update analytics
        this.dataManager.trackEvent('user_login', {
            userId: user.id,
            userRole: user.role,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Load current user from storage
     */
    loadCurrentUser() {
        // Check both localStorage and sessionStorage
        const userData = localStorage.getItem('templatehub_user') || 
                        sessionStorage.getItem('templatehub_user');
        
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Check if user has admin role
     */
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    /**
     * Logout current user
     */
    logout() {
        // Track logout event
        if (this.currentUser) {
            this.dataManager.trackEvent('user_logout', {
                userId: this.currentUser.id,
                timestamp: new Date().toISOString()
            });
        }

        // Clear user data
        this.currentUser = null;
        localStorage.removeItem('templatehub_user');
        localStorage.removeItem('templatehub_auth');
        sessionStorage.removeItem('templatehub_user');
        sessionStorage.removeItem('templatehub_auth');
        
        // Redirect to login
        window.location.href = 'auth/login.html';
    }

    /**
     * Show loading state on button
     */
    showLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        if (btnText && btnLoading) {
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
        }
        
        button.disabled = true;
    }

    /**
     * Hide loading state on button
     */
    hideLoading(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');
        
        if (btnText && btnLoading) {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
        
        button.disabled = false;
    }

    /**
     * Check authentication status and redirect if needed
     */
    static requireAuth() {
        const authManager = new AuthManager();
        if (!authManager.isAuthenticated()) {
            window.location.href = '/auth/login.html';
            return false;
        }
        return true;
    }

    /**
     * Check admin role and redirect if needed
     */
    static requireAdmin() {
        const authManager = new AuthManager();
        if (!authManager.isAuthenticated()) {
            window.location.href = '/auth/login.html';
            return false;
        }
        
        if (!authManager.isAdmin()) {
            window.location.href = '/index.html';
            return false;
        }
        
        return true;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Make AuthManager available globally
window.AuthManager = AuthManager;