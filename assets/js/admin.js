/**
 * Admin Panel Management System
 * Handles dashboard functionality, template management, user management, and analytics
 */

class AdminPanel {
    constructor() {
        this.dataManager = window.dataManager || new DataManager();
        this.utils = window.Utils || Utils;
        this.currentSection = 'dashboard';
        
        // Admin-specific data
        this.adminSettings = {
            siteName: 'TemplateHub',
            siteDescription: 'Professional web templates for developers',
            adminEmail: 'admin@templatehub.com',
            templatesPerPage: 12
        };
        
        this.loadAdminSettings();
    }

    /**
     * Initialize the admin panel
     */
    init() {
        this.setupEventListeners();
        this.initializeDashboard();
        this.loadDashboardData();
        
        // Show default section
        this.showSection('dashboard');
        
        console.log('Admin Panel initialized');
    }

    /**
     * Setup event listeners for admin functionality
     */
    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Add template button
        const addTemplateBtn = document.getElementById('add-template-btn');
        if (addTemplateBtn) {
            addTemplateBtn.addEventListener('click', () => this.showAddTemplateModal());
        }

        // Add template modal handlers
        this.setupAddTemplateModal();

        // Search and filter handlers
        this.setupFilters();

        // Settings form
        this.setupSettingsForm();

        // Table actions
        this.setupTableActions();
    }

    /**
     * Show specific admin section
     */
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active from all nav links
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Add active to nav link
        const targetLink = document.querySelector(`.sidebar-link[data-section="${sectionName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    /**
     * Load data for specific section
     */
    loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'templates':
                this.loadTemplatesData();
                break;
            case 'users':
                this.loadUsersData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    /**
     * Load dashboard overview data
     */
    loadDashboardData() {
        const templates = this.dataManager.getAllTemplates();
        const users = this.dataManager.getAllUsers();
        const analytics = this.dataManager.getAnalytics();

        // Update stats
        this.updateStat('total-templates-admin', templates.length);
        this.updateStat('total-downloads-admin', analytics.totalDownloads || 1247);
        this.updateStat('total-users-admin', users.length);
        this.updateStat('total-views-admin', analytics.totalViews || 3421);

        // Load popular templates
        this.loadPopularTemplates(templates);

        // Load recent activity
        this.loadRecentActivity();
    }

    /**
     * Update stat display
     */
    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    }

    /**
     * Load popular templates for dashboard
     */
    loadPopularTemplates(templates) {
        const sortedTemplates = templates
            .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
            .slice(0, 5);

        const container = document.getElementById('popular-templates-list');
        if (!container) return;

        container.innerHTML = sortedTemplates.map(template => `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <i data-lucide="layout-template" style="width: 1rem; height: 1rem;"></i>
                    </div>
                    <div>
                        <div class="font-medium text-sm">${template.name}</div>
                        <div class="text-xs text-gray-500">${template.category}</div>
                    </div>
                </div>
                <div class="text-sm text-gray-600">${template.downloads || 0} downloads</div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Load recent activity
     */
    loadRecentActivity() {
        const activities = [
            { action: 'Template downloaded', item: 'Modern Landing Page', time: '2 minutes ago', icon: 'download' },
            { action: 'New user registered', item: 'john.doe@email.com', time: '15 minutes ago', icon: 'user-plus' },
            { action: 'Template published', item: 'Animated Login Form', time: '1 hour ago', icon: 'upload' },
            { action: 'User updated profile', item: 'jane.smith@email.com', time: '2 hours ago', icon: 'user' },
            { action: 'Template viewed', item: 'Product Cards Grid', time: '3 hours ago', icon: 'eye' }
        ];

        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div class="w-6 h-6 text-gray-400">
                    <i data-lucide="${activity.icon}" style="width: 1rem; height: 1rem;"></i>
                </div>
                <div class="flex-1">
                    <div class="text-sm">${activity.action}</div>
                    <div class="text-xs text-gray-500">${activity.item}</div>
                </div>
                <div class="text-xs text-gray-400">${activity.time}</div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Load templates data for management
     */
    loadTemplatesData() {
        const templates = this.dataManager.getAllTemplates();
        const tbody = document.getElementById('templates-table-body');
        
        if (!tbody) return;

        tbody.innerHTML = templates.map(template => `
            <tr>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <i data-lucide="layout-template" style="width: 1.25rem; height: 1.25rem;"></i>
                        </div>
                        <div>
                            <div class="font-medium">${template.name}</div>
                            <div class="text-sm text-gray-500">${template.description.substring(0, 50)}...</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        ${template.category}
                    </span>
                </td>
                <td>${template.downloads || 0}</td>
                <td>
                    <div class="flex items-center gap-1">
                        <span class="text-yellow-500">★</span>
                        <span>${template.rating || 4.5}</span>
                    </div>
                </td>
                <td>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        template.status === 'published' ? 'bg-green-100 text-green-800' :
                        template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${template.status || 'published'}
                    </span>
                </td>
                <td class="text-gray-500">${template.createdAt || 'Today'}</td>
                <td>
                    <div class="flex items-center gap-2">
                        <button class="p-1 text-gray-400 hover:text-blue-600" onclick="AdminPanel.editTemplate('${template.id}')" title="Edit">
                            <i data-lucide="edit" style="width: 1rem; height: 1rem;"></i>
                        </button>
                        <button class="p-1 text-gray-400 hover:text-green-600" onclick="AdminPanel.previewTemplate('${template.id}')" title="Preview">
                            <i data-lucide="eye" style="width: 1rem; height: 1rem;"></i>
                        </button>
                        <button class="p-1 text-gray-400 hover:text-red-600" onclick="AdminPanel.deleteTemplate('${template.id}')" title="Delete">
                            <i data-lucide="trash-2" style="width: 1rem; height: 1rem;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Load users data for management
     */
    loadUsersData() {
        const users = this.dataManager.getAllUsers();
        const tbody = document.getElementById('users-table-body');
        
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="font-medium">${user.name}</div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'premium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${user.role || 'user'}
                    </span>
                </td>
                <td class="text-gray-500">${user.joinedAt || 'Recently'}</td>
                <td class="text-gray-500">${user.lastLogin || 'Today'}</td>
                <td>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                    </span>
                </td>
                <td>
                    <div class="flex items-center gap-2">
                        <button class="p-1 text-gray-400 hover:text-blue-600" onclick="AdminPanel.editUser('${user.id}')" title="Edit">
                            <i data-lucide="edit" style="width: 1rem; height: 1rem;"></i>
                        </button>
                        <button class="p-1 text-gray-400 hover:text-red-600" onclick="AdminPanel.deleteUser('${user.id}')" title="Delete">
                            <i data-lucide="trash-2" style="width: 1rem; height: 1rem;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Setup add template modal
     */
    setupAddTemplateModal() {
        const modal = document.getElementById('add-template-modal');
        const closeBtn = document.getElementById('close-add-template');
        const cancelBtn = document.getElementById('cancel-add-template');
        const form = document.getElementById('add-template-form');

        // Close modal handlers
        [closeBtn, cancelBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.hideAddTemplateModal());
            }
        });

        // Close on overlay click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAddTemplateModal();
                }
            });
        }

        // Form submission
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddTemplate(form);
            });
        }
    }

    /**
     * Show add template modal
     */
    showAddTemplateModal() {
        const modal = document.getElementById('add-template-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Hide add template modal
     */
    hideAddTemplateModal() {
        const modal = document.getElementById('add-template-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Reset form
        const form = document.getElementById('add-template-form');
        if (form) {
            form.reset();
        }
    }

    /**
     * Handle add template form submission
     */
    handleAddTemplate(form) {
        try {
            const formData = new FormData(form);
            
            // Validate form data
            const validation = this.validateTemplateData(formData);
            if (!validation.isValid) {
                Utils.showNotification(validation.message, 'error');
                return;
            }
            
            const templateData = {
                id: this.generateId(),
                name: formData.get('name').trim(),
                description: formData.get('description').trim(),
                category: formData.get('category'),
                difficulty: formData.get('difficulty'),
                technologies: formData.get('technologies').split(',').map(t => t.trim()).filter(t => t),
                tags: formData.get('tags').split(',').map(t => t.trim()).filter(t => t),
                downloads: 0,
                rating: 0,
                status: 'draft',
                createdAt: new Date().toLocaleDateString(),
                author: 'Admin',
                preview: 'assets/images/template-placeholder.jpg',
                demoUrl: `templates/${formData.get('category')}/${this.slugify(formData.get('name'))}/index.html`,
                cdnUrl: `https://cdn.templatehub.com/${formData.get('category')}/`,
                size: '50 KB',
                featured: false,
                files: ['index.html']
            };

            const result = this.dataManager.addTemplate(templateData);
            if (result) {
                Utils.showNotification('Template added successfully!', 'success');
                this.hideAddTemplateModal();
                
                // Refresh templates if we're on that section
                if (this.currentSection === 'templates') {
                    this.loadTemplatesData();
                }
            } else {
                throw new Error('Failed to save template to database');
            }
        } catch (error) {
            console.error('Error adding template:', error);
            Utils.showNotification('Failed to add template: ' + (error.message || 'Unknown error'), 'error');
        }
    }

    /**
     * Validate template form data
     */
    validateTemplateData(formData) {
        const name = formData.get('name')?.trim();
        const description = formData.get('description')?.trim();
        const category = formData.get('category');
        const difficulty = formData.get('difficulty');

        if (!name || name.length < 3) {
            return { isValid: false, message: 'Template name must be at least 3 characters long.' };
        }

        if (!description || description.length < 10) {
            return { isValid: false, message: 'Description must be at least 10 characters long.' };
        }

        if (!category) {
            return { isValid: false, message: 'Please select a category.' };
        }

        if (!difficulty) {
            return { isValid: false, message: 'Please select a difficulty level.' };
        }

        // Check if template name already exists
        const existingTemplates = this.dataManager.getAllTemplates();
        const nameExists = existingTemplates.some(template => 
            template.name.toLowerCase() === name.toLowerCase()
        );

        if (nameExists) {
            return { isValid: false, message: 'A template with this name already exists.' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Setup filters and search
     */
    setupFilters() {
        // Templates filters
        const categoryFilter = document.getElementById('admin-category-filter');
        const statusFilter = document.getElementById('admin-status-filter');
        const searchInput = document.getElementById('admin-search-templates');

        [categoryFilter, statusFilter, searchInput].forEach(element => {
            if (element) {
                element.addEventListener('change', () => this.applyTemplateFilters());
                element.addEventListener('input', () => this.applyTemplateFilters());
            }
        });
    }

    /**
     * Apply filters to templates table
     */
    applyTemplateFilters() {
        const categoryFilter = document.getElementById('admin-category-filter')?.value || '';
        const statusFilter = document.getElementById('admin-status-filter')?.value || '';
        const searchTerm = document.getElementById('admin-search-templates')?.value.toLowerCase() || '';

        const templates = this.dataManager.getAllTemplates();
        
        const filteredTemplates = templates.filter(template => {
            const matchesCategory = !categoryFilter || template.category === categoryFilter;
            const matchesStatus = !statusFilter || (template.status || 'published') === statusFilter;
            const matchesSearch = !searchTerm || 
                template.name.toLowerCase().includes(searchTerm) ||
                template.description.toLowerCase().includes(searchTerm);

            return matchesCategory && matchesStatus && matchesSearch;
        });

        this.renderFilteredTemplates(filteredTemplates);
    }

    /**
     * Render filtered templates
     */
    renderFilteredTemplates(templates) {
        const tbody = document.getElementById('templates-table-body');
        if (!tbody) return;

        if (templates.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8 text-gray-500">
                        No templates found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        // Use the same rendering logic as loadTemplatesData but with filtered data
        tbody.innerHTML = templates.map(template => `
            <tr>
                <td>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <i data-lucide="layout-template" style="width: 1.25rem; height: 1.25rem;"></i>
                        </div>
                        <div>
                            <div class="font-medium">${template.name}</div>
                            <div class="text-sm text-gray-500">${template.description.substring(0, 50)}...</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        ${template.category}
                    </span>
                </td>
                <td>${template.downloads || 0}</td>
                <td>
                    <div class="flex items-center gap-1">
                        <span class="text-yellow-500">★</span>
                        <span>${template.rating || 4.5}</span>
                    </div>
                </td>
                <td>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        template.status === 'published' ? 'bg-green-100 text-green-800' :
                        template.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }">
                        ${template.status || 'published'}
                    </span>
                </td>
                <td class="text-gray-500">${template.createdAt || 'Today'}</td>
                <td>
                    <div class="flex items-center gap-2">
                        <button class="p-1 text-gray-400 hover:text-blue-600" onclick="AdminPanel.editTemplate('${template.id}')" title="Edit">
                            <i data-lucide="edit" style="width: 1rem; height: 1rem;"></i>
                        </button>
                        <button class="p-1 text-gray-400 hover:text-green-600" onclick="AdminPanel.previewTemplate('${template.id}')" title="Preview">
                            <i data-lucide="eye" style="width: 1rem; height: 1rem;"></i>
                        </button>
                        <button class="p-1 text-gray-400 hover:text-red-600" onclick="AdminPanel.deleteTemplate('${template.id}')" title="Delete">
                            <i data-lucide="trash-2" style="width: 1rem; height: 1rem;"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }

    /**
     * Setup settings form
     */
    setupSettingsForm() {
        const form = document.getElementById('settings-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }
    }

    /**
     * Load settings data
     */
    loadSettingsData() {
        const settings = this.getAdminSettings();
        
        document.getElementById('site-name').value = settings.siteName;
        document.getElementById('site-description').value = settings.siteDescription;
        document.getElementById('admin-email').value = settings.adminEmail;
        document.getElementById('templates-per-page').value = settings.templatesPerPage;
    }

    /**
     * Save admin settings
     */
    saveSettings() {
        const settings = {
            siteName: document.getElementById('site-name').value,
            siteDescription: document.getElementById('site-description').value,
            adminEmail: document.getElementById('admin-email').value,
            templatesPerPage: parseInt(document.getElementById('templates-per-page').value)
        };

        this.saveAdminSettings(settings);
        Utils.showNotification('Settings saved successfully!', 'success');
    }

    /**
     * Setup table actions
     */
    setupTableActions() {
        // Template actions will be handled by global methods
        // User actions will be handled by global methods
    }

    /**
     * Template management methods
     */
    static editTemplate(templateId) {
        console.log('Edit template:', templateId);
        // Implementation for editing template
    }

    static previewTemplate(templateId) {
        const adminPanel = window.AdminPanel;
        const template = adminPanel.dataManager.getTemplate(templateId);
        if (template && template.liveUrl && template.liveUrl !== '#') {
            window.open(template.liveUrl, '_blank');
        } else {
            Utils.showNotification('Preview not available for this template', 'warning');
        }
    }

    static deleteTemplate(templateId) {
        if (confirm('Are you sure you want to delete this template?')) {
            const adminPanel = window.AdminPanel;
            try {
                adminPanel.dataManager.deleteTemplate(templateId);
                Utils.showNotification('Template deleted successfully!', 'success');
                
                // Refresh templates if we're on that section
                if (adminPanel.currentSection === 'templates') {
                    adminPanel.loadTemplatesData();
                }
            } catch (error) {
                Utils.showNotification('Failed to delete template: ' + error.message, 'error');
            }
        }
    }

    /**
     * User management methods
     */
    static editUser(userId) {
        console.log('Edit user:', userId);
        // Implementation for editing user
    }

    static deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            const adminPanel = window.AdminPanel;
            try {
                adminPanel.dataManager.deleteUser(userId);
                Utils.showNotification('User deleted successfully!', 'success');
                
                // Refresh users if we're on that section
                if (adminPanel.currentSection === 'users') {
                    adminPanel.loadUsersData();
                }
            } catch (error) {
                Utils.showNotification('Failed to delete user: ' + error.message, 'error');
            }
        }
    }

    /**
     * Load analytics data (placeholder for future implementation)
     */
    loadAnalyticsData() {
        // Placeholder for analytics implementation
        console.log('Loading analytics data...');
    }

    /**
     * Initialize dashboard
     */
    initializeDashboard() {
        // Set initial active states
        const dashboardLink = document.querySelector('.sidebar-link[data-section="dashboard"]');
        if (dashboardLink) {
            dashboardLink.classList.add('active');
        }
    }

    /**
     * Admin settings management
     */
    getAdminSettings() {
        const saved = localStorage.getItem('templatehub_admin_settings');
        return saved ? JSON.parse(saved) : this.adminSettings;
    }

    saveAdminSettings(settings) {
        this.adminSettings = { ...this.adminSettings, ...settings };
        localStorage.setItem('templatehub_admin_settings', JSON.stringify(this.adminSettings));
    }

    loadAdminSettings() {
        this.adminSettings = this.getAdminSettings();
    }

    /**
     * Utility methods
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    slugify(str) {
        return str.toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/[\s_-]+/g, '-')
                  .replace(/^-+|-+$/g, '');
    }
}

// Make AdminPanel available globally
window.AdminPanel = new AdminPanel();