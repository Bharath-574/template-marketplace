// Template Marketplace - Main Application Controller
// Orchestrates the entire application

class TemplateApp {
    constructor() {
        this.templateManager = null;
        this.currentUser = null;
        this.isAdmin = false;
        
        this.init();
    }

    init() {
        this.initializeComponents();
        this.bindGlobalEvents();
        this.checkAuthStatus();
        this.setupMobileMenu();
    }

    initializeComponents() {
        // Initialize data manager
        this.dataManager = new DataManager();
        
        // Initialize template manager
        this.templateManager = new TemplateManager();
        
        // Initialize authentication system if available
        if (typeof AuthManager !== 'undefined') {
            this.authManager = new AuthManager();
        }
        
        // Initialize other components
        this.initializeSearch();
        this.initializeModals();
    }

    bindGlobalEvents() {
        // Handle page load
        Utils.on(document, 'DOMContentLoaded', () => {
            this.onPageLoad();
        });

        // Handle scroll for header effects
        Utils.on(window, 'scroll', Utils.throttle(() => {
            this.handleScroll();
        }, 100));

        // Handle resize for responsive adjustments
        Utils.on(window, 'resize', Utils.throttle(() => {
            this.handleResize();
        }, 250));

        // Handle keyboard shortcuts
        Utils.on(document, 'keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle clicks outside modals and dropdowns
        Utils.on(document, 'click', (e) => {
            this.handleOutsideClicks(e);
        });
    }

    checkAuthStatus() {
        // Check if user is logged in (simplified for v1.0)
        const currentUser = Utils.storage.get('tm_current_user');
        if (currentUser) {
            this.currentUser = currentUser;
            this.isAdmin = currentUser.role === 'admin';
            this.updateUIForUser();
        }
    }

    updateUIForUser() {
        // Update UI based on user status
        const loginLink = Utils.$('a[href="auth/login.html"]');
        const adminLink = Utils.$('a[href="admin/dashboard.html"]');

        if (this.currentUser) {
            if (loginLink) {
                loginLink.textContent = this.currentUser.name;
                loginLink.href = '#';
                loginLink.onclick = () => this.showUserMenu();
            }
            
            if (adminLink && !this.isAdmin) {
                adminLink.style.display = 'none';
            }
        } else {
            if (adminLink) {
                adminLink.style.display = 'none';
            }
        }
    }

    showUserMenu() {
        const menuHtml = `
            <div class="user-menu">
                <div class="user-info mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                            ${this.currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-medium">${this.currentUser.name}</div>
                            <div class="text-sm text-gray-600">${this.currentUser.email}</div>
                        </div>
                    </div>
                </div>
                <div class="menu-items">
                    ${this.isAdmin ? '<button class="menu-item" data-action="admin">Admin Dashboard</button>' : ''}
                    <button class="menu-item" data-action="profile">Profile Settings</button>
                    <button class="menu-item" data-action="downloads">My Downloads</button>
                    <button class="menu-item text-red-600" data-action="logout">Logout</button>
                </div>
            </div>
        `;

        const modal = Utils.showModal(menuHtml, {
            title: 'Account Menu'
        });

        // Bind menu actions
        Utils.$$('.menu-item').forEach(item => {
            Utils.on(item, 'click', () => {
                const action = item.dataset.action;
                this.handleUserMenuAction(action);
                document.body.removeChild(modal);
            });
        });
    }

    handleUserMenuAction(action) {
        switch (action) {
            case 'admin':
                window.location.href = 'admin/dashboard.html';
                break;
            case 'profile':
                this.showProfileSettings();
                break;
            case 'downloads':
                this.showDownloadHistory();
                break;
            case 'logout':
                this.logout();
                break;
        }
    }

    logout() {
        Utils.storage.remove('tm_current_user');
        Utils.showNotification('Logged out successfully', 'success');
        window.location.reload();
    }

    setupMobileMenu() {
        const mobileMenuBtn = Utils.$('#mobile-menu-btn');
        const nav = Utils.$('.nav');

        if (mobileMenuBtn && nav) {
            Utils.on(mobileMenuBtn, 'click', () => {
                nav.classList.toggle('mobile-open');
                
                // Update button icon
                const icon = mobileMenuBtn.querySelector('i');
                if (nav.classList.contains('mobile-open')) {
                    icon.setAttribute('data-lucide', 'x');
                } else {
                    icon.setAttribute('data-lucide', 'menu');
                }
                
                // Reinitialize icons
                if (window.lucide) {
                    lucide.createIcons();
                }
            });
        }

        // Add mobile menu styles
        if (!Utils.$('#mobile-menu-styles')) {
            const styles = Utils.createElement('style', {
                id: 'mobile-menu-styles',
                innerHTML: `
                    @media (max-width: 768px) {
                        .nav {
                            position: fixed;
                            top: 70px;
                            left: 0;
                            right: 0;
                            background: white;
                            border-bottom: 1px solid var(--gray-200);
                            padding: 1rem;
                            transform: translateY(-100%);
                            transition: transform 0.3s ease;
                            z-index: 999;
                        }
                        
                        .nav.mobile-open {
                            transform: translateY(0);
                        }
                        
                        .nav-link {
                            display: block;
                            margin-bottom: 0.5rem;
                        }
                    }
                `
            });
            document.head.appendChild(styles);
        }
    }

    initializeSearch() {
        // Add search enhancements
        const searchInput = Utils.$('#search-input');
        if (searchInput) {
            // Add search suggestions
            this.setupSearchSuggestions(searchInput);
            
            // Add search shortcuts
            Utils.on(searchInput, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.blur();
                    searchInput.value = '';
                    this.templateManager.handleSearch('');
                }
            });
        }
    }

    setupSearchSuggestions(searchInput) {
        // Create suggestions dropdown
        const suggestionsContainer = Utils.createElement('div', {
            id: 'search-suggestions',
            className: 'search-suggestions hidden'
        });
        
        searchInput.parentNode.appendChild(suggestionsContainer);
        
        // Add suggestions styles
        if (!Utils.$('#search-suggestions-styles')) {
            const styles = Utils.createElement('style', {
                id: 'search-suggestions-styles',
                innerHTML: `
                    .search-suggestions {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: white;
                        border: 1px solid var(--gray-200);
                        border-radius: var(--radius-lg);
                        box-shadow: var(--shadow-lg);
                        max-height: 200px;
                        overflow-y: auto;
                        z-index: 100;
                    }
                    
                    .suggestion-item {
                        padding: 0.75rem;
                        border-bottom: 1px solid var(--gray-100);
                        cursor: pointer;
                        transition: var(--transition-fast);
                    }
                    
                    .suggestion-item:hover {
                        background: var(--gray-50);
                    }
                    
                    .suggestion-item:last-child {
                        border-bottom: none;
                    }
                `
            });
            document.head.appendChild(styles);
        }
        
        // Handle input for suggestions
        Utils.on(searchInput, 'input', Utils.debounce((e) => {
            this.updateSearchSuggestions(e.target.value, suggestionsContainer);
        }, 200));
        
        // Hide suggestions on blur
        Utils.on(searchInput, 'blur', () => {
            setTimeout(() => {
                suggestionsContainer.classList.add('hidden');
            }, 150);
        });
        
        // Show suggestions on focus
        Utils.on(searchInput, 'focus', () => {
            if (searchInput.value.trim()) {
                this.updateSearchSuggestions(searchInput.value, suggestionsContainer);
            }
        });
    }

    updateSearchSuggestions(query, container) {
        if (!query.trim()) {
            container.classList.add('hidden');
            return;
        }

        const templates = this.dataManager.getAllTemplates() || [];
        const categories = this.dataManager.getAllCategories() || [];
        
        // Get suggestions
        const suggestions = [];
        
        // Add template name suggestions
        templates.forEach(template => {
            if (template.name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'template',
                    text: template.name,
                    action: () => this.templateManager.showTemplateDetails(template.id)
                });
            }
        });
        
        // Add category suggestions
        categories.forEach(category => {
            if (category.name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'category',
                    text: category.name,
                    action: () => this.templateManager.handleCategoryFilter(category.id)
                });
            }
        });
        
        // Add tag suggestions
        const allTags = templates.flatMap(t => t.tags);
        const uniqueTags = [...new Set(allTags)];
        uniqueTags.forEach(tag => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'tag',
                    text: tag,
                    action: () => this.templateManager.handleSearch(tag)
                });
            }
        });
        
        // Limit suggestions
        const limitedSuggestions = suggestions.slice(0, 8);
        
        if (limitedSuggestions.length > 0) {
            container.innerHTML = limitedSuggestions.map(suggestion => `
                <div class="suggestion-item" data-suggestion="${suggestion.text}">
                    <i data-lucide="${this.getSuggestionIcon(suggestion.type)}"></i>
                    ${suggestion.text}
                    <span class="text-xs text-gray-500 ml-2">${suggestion.type}</span>
                </div>
            `).join('');
            
            // Bind suggestion clicks
            Utils.$$('.suggestion-item').forEach((item, index) => {
                Utils.on(item, 'click', () => {
                    limitedSuggestions[index].action();
                    container.classList.add('hidden');
                });
            });
            
            container.classList.remove('hidden');
            
            // Reinitialize icons
            if (window.lucide) {
                lucide.createIcons();
            }
        } else {
            container.classList.add('hidden');
        }
    }

    getSuggestionIcon(type) {
        const icons = {
            template: 'file',
            category: 'folder',
            tag: 'tag'
        };
        return icons[type] || 'search';
    }

    initializeModals() {
        // Initialize template modal
        const templateModal = Utils.$('#template-modal');
        const closeModal = Utils.$('#close-modal');
        
        if (closeModal) {
            Utils.on(closeModal, 'click', () => {
                templateModal.classList.add('hidden');
            });
        }
        
        if (templateModal) {
            Utils.on(templateModal, 'click', (e) => {
                if (e.target === templateModal) {
                    templateModal.classList.add('hidden');
                }
            });
        }
    }

    handleScroll() {
        const header = Utils.$('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Add scroll effect styles if not exists
        if (!Utils.$('#scroll-styles')) {
            const styles = Utils.createElement('style', {
                id: 'scroll-styles',
                innerHTML: `
                    .header.scrolled {
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(10px);
                        box-shadow: var(--shadow-lg);
                    }
                `
            });
            document.head.appendChild(styles);
        }
    }

    handleResize() {
        // Handle responsive adjustments
        const nav = Utils.$('.nav');
        if (nav && window.innerWidth > 768) {
            nav.classList.remove('mobile-open');
        }
    }

    handleKeyboardShortcuts(e) {
        // Global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    const searchInput = Utils.$('#search-input');
                    if (searchInput) {
                        searchInput.focus();
                    }
                    break;
                case '/':
                    e.preventDefault();
                    Utils.$('#search-input')?.focus();
                    break;
            }
        }
        
        // Escape key
        if (e.key === 'Escape') {
            // Close any open modals
            const modals = Utils.$$('.modal-overlay');
            modals.forEach(modal => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            });
            
            // Close mobile menu
            const nav = Utils.$('.nav');
            if (nav) {
                nav.classList.remove('mobile-open');
            }
        }
    }

    handleOutsideClicks(e) {
        // Close search suggestions when clicking outside
        const searchSuggestions = Utils.$('#search-suggestions');
        const searchInput = Utils.$('#search-input');
        
        if (searchSuggestions && !searchSuggestions.contains(e.target) && e.target !== searchInput) {
            searchSuggestions.classList.add('hidden');
        }
    }

    onPageLoad() {
        // Smooth reveal animations
        this.animatePageElements();
        
        // Update page metrics
        this.updatePageMetrics();
        
        // Initialize lazy loading for images
        this.initializeLazyLoading();
    }

    animatePageElements() {
        // Add entrance animations
        const animatedElements = Utils.$$('.hero, .stats, .template-grid, .category-card');
        
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    updatePageMetrics() {
        // Update analytics
        const analytics = this.dataManager.getAnalytics() || {};
        analytics.totalViews = (analytics.totalViews || 0) + 1;
        
        // Track page visit
        if (!analytics.recentActivity) {
            analytics.recentActivity = [];
        }
        
        analytics.recentActivity.unshift({
            type: 'page_view',
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 activities
        analytics.recentActivity = analytics.recentActivity.slice(0, 100);
        
        this.dataManager.setAnalytics(analytics);
    }

    initializeLazyLoading() {
        // Simple lazy loading for images
        const images = Utils.$$('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Admin panel shortcuts
    showAdminQuickActions() {
        if (!this.isAdmin) return;
        
        const quickActions = `
            <div class="admin-quick-actions">
                <h4 class="mb-4">Quick Actions</h4>
                <div class="grid grid-cols-2 gap-3">
                    <button class="btn btn-primary" data-action="add-template">Add Template</button>
                    <button class="btn btn-secondary" data-action="view-analytics">Analytics</button>
                    <button class="btn btn-accent" data-action="manage-users">Users</button>
                    <button class="btn btn-warning" data-action="settings">Settings</button>
                </div>
            </div>
        `;
        
        Utils.showModal(quickActions, {
            title: 'Admin Panel'
        });
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Error ${context}:`, error);
        Utils.showNotification(`An error occurred ${context}. Please try again.`, 'error');
    }

    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }

    // Cleanup
    destroy() {
        // Clean up event listeners and references
        this.templateManager = null;
        this.currentUser = null;
    }
}

// Create global app instance
const app = new TemplateApp();

// Make TemplateApp globally available
window.TemplateApp = app;