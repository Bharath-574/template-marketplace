// Template Marketplace - Data Management System
// Handles localStorage operations and data initialization

class DataManager {
    constructor() {
        this.storageKeys = {
            templates: 'tm_templates',
            users: 'tm_users',
            categories: 'tm_categories',
            settings: 'tm_settings',
            analytics: 'tm_analytics'
        };
        
        this.initializeData();
    }

    // Initialize default data if not exists
    initializeData() {
        if (!this.getTemplates()) {
            this.setTemplates(this.getDefaultTemplates());
        }
        
        if (!this.getCategories()) {
            this.setCategories(this.getDefaultCategories());
        }
        
        if (!this.getUsers()) {
            this.setUsers(this.getDefaultUsers());
        }
        
        if (!this.getSettings()) {
            this.setSettings(this.getDefaultSettings());
        }
        
        if (!this.getAnalytics()) {
            this.setAnalytics(this.getDefaultAnalytics());
        }
    }

    // Generic storage methods
    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Storage retrieval error:', error);
            return null;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage removal error:', error);
            return false;
        }
    }

    // Template methods
    getTemplates() {
        return this.get(this.storageKeys.templates);
    }

    setTemplates(templates) {
        return this.set(this.storageKeys.templates, templates);
    }

    addTemplate(template) {
        const templates = this.getTemplates() || [];
        template.id = this.generateId();
        template.createdAt = new Date().toISOString();
        template.updatedAt = new Date().toISOString();
        template.downloads = 0;
        templates.push(template);
        return this.setTemplates(templates) ? template : null;
    }

    updateTemplate(id, updates) {
        const templates = this.getTemplates() || [];
        const index = templates.findIndex(t => t.id === id);
        if (index !== -1) {
            templates[index] = { ...templates[index], ...updates, updatedAt: new Date().toISOString() };
            return this.setTemplates(templates) ? templates[index] : null;
        }
        return null;
    }

    deleteTemplate(id) {
        const templates = this.getTemplates() || [];
        const filtered = templates.filter(t => t.id !== id);
        return this.setTemplates(filtered);
    }

    getTemplate(id) {
        const templates = this.getTemplates() || [];
        return templates.find(t => t.id === id) || null;
    }

    incrementDownload(id) {
        const template = this.getTemplate(id);
        if (template) {
            template.downloads = (template.downloads || 0) + 1;
            return this.updateTemplate(id, { downloads: template.downloads });
        }
        return false;
    }

    getAllTemplates() {
        return this.getTemplates() || [];
    }

    // User methods
    getUsers() {
        return this.get(this.storageKeys.users);
    }

    setUsers(users) {
        return this.set(this.storageKeys.users, users);
    }

    addUser(user) {
        const users = this.getUsers() || [];
        user.id = this.generateId();
        user.createdAt = new Date().toISOString();
        user.lastLogin = null;
        users.push(user);
        return this.setUsers(users) ? user : null;
    }

    updateUser(id, updates) {
        const users = this.getUsers() || [];
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            return this.setUsers(users) ? users[index] : null;
        }
        return null;
    }

    deleteUser(id) {
        const users = this.getUsers() || [];
        const filtered = users.filter(u => u.id !== id);
        return this.setUsers(filtered);
    }

    getUserByEmail(email) {
        const users = this.getUsers() || [];
        return users.find(u => u.email === email) || null;
    }

    getAllUsers() {
        return this.getUsers() || [];
    }

    // Category methods
    getCategories() {
        return this.get(this.storageKeys.categories);
    }

    setCategories(categories) {
        return this.set(this.storageKeys.categories, categories);
    }

    getAllCategories() {
        return this.getCategories() || [];
    }

    // Settings methods
    getSettings() {
        return this.get(this.storageKeys.settings);
    }

    setSettings(settings) {
        return this.set(this.storageKeys.settings, settings);
    }

    // Analytics methods
    getAnalytics() {
        return this.get(this.storageKeys.analytics);
    }

    setAnalytics(analytics) {
        return this.set(this.storageKeys.analytics, analytics);
    }

    updateAnalytics(updates) {
        const analytics = this.getAnalytics() || {};
        const newAnalytics = { ...analytics, ...updates, lastUpdated: new Date().toISOString() };
        return this.setAnalytics(newAnalytics);
    }

    // Track events for analytics
    trackEvent(eventName, data) {
        const analytics = this.getAnalytics() || {};
        if (!analytics.events) {
            analytics.events = [];
        }
        analytics.events.push({
            name: eventName,
            data: data,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 1000 events
        analytics.events = analytics.events.slice(-1000);
        
        this.setAnalytics(analytics);
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Search and filter methods
    searchTemplates(query, filters = {}) {
        const templates = this.getTemplates() || [];
        let results = [...templates];

        // Text search
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase().trim();
            results = results.filter(template => 
                template.name.toLowerCase().includes(searchTerm) ||
                template.description.toLowerCase().includes(searchTerm) ||
                template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                template.category.toLowerCase().includes(searchTerm)
            );
        }

        // Category filter
        if (filters.category && filters.category !== '') {
            results = results.filter(template => template.category === filters.category);
        }

        // Sort results
        if (filters.sort) {
            results = this.sortTemplates(results, filters.sort);
        }

        return results;
    }

    sortTemplates(templates, sortBy) {
        const sorted = [...templates];
        
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'popular':
                return sorted.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return sorted;
        }
    }

    // Export/Import methods
    exportData() {
        return {
            templates: this.getTemplates(),
            categories: this.getCategories(),
            users: this.getUsers(),
            settings: this.getSettings(),
            analytics: this.getAnalytics(),
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        try {
            if (data.templates) this.setTemplates(data.templates);
            if (data.categories) this.setCategories(data.categories);
            if (data.users) this.setUsers(data.users);
            if (data.settings) this.setSettings(data.settings);
            if (data.analytics) this.setAnalytics(data.analytics);
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }

    // Default data generators
    getDefaultTemplates() {
        return [
            // Landing Pages
            {
                id: 'tpl-001',
                name: 'Modern Landing Page',
                description: 'A clean, modern landing page with hero section, features, and contact form.',
                category: 'landing-pages',
                tags: ['modern', 'responsive', 'hero', 'contact-form'],
                difficulty: 'easy',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/landing-page-preview.svg',
                files: ['index.html'],
                size: '45 KB',
                downloads: 1567,
                rating: 4.8,
                author: 'TemplateHub',
                createdAt: '2025-01-15T10:30:00Z',
                updatedAt: '2025-01-15T10:30:00Z',
                featured: true,
                cdnUrl: 'https://cdn.templatehub.com/landing-pages/modern/',
                demoUrl: 'templates/landing-pages/modern-landing/index.html'
            },
            {
                id: 'tpl-009',
                name: 'Startup Landing Page',
                description: 'Professional startup landing page with investor pitch sections and team showcase.',
                category: 'landing-pages',
                tags: ['startup', 'business', 'pitch', 'team', 'responsive'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/landing-page-preview.svg',
                files: ['index.html'],
                size: '67 KB',
                downloads: 923,
                rating: 4.7,
                author: 'TemplateHub',
                createdAt: '2025-01-07T11:15:00Z',
                updatedAt: '2025-01-07T11:15:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/landing-pages/startup/',
                demoUrl: 'templates/landing-pages/startup/index.html'
            },
            {
                id: 'tpl-010',
                name: 'Product Launch Page',
                description: 'Eye-catching product launch page with countdown timer and early bird pricing.',
                category: 'landing-pages',
                tags: ['product', 'launch', 'countdown', 'conversion', 'marketing'],
                difficulty: 'hard',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/landing-page-preview.svg',
                files: ['index.html'],
                size: '78 KB',
                downloads: 1234,
                rating: 4.9,
                author: 'TemplateHub',
                createdAt: '2025-01-06T09:30:00Z',
                updatedAt: '2025-01-06T09:30:00Z',
                featured: true,
                cdnUrl: 'https://cdn.templatehub.com/landing-pages/product-launch/',
                demoUrl: 'templates/landing-pages/product-launch/index.html'
            },

            // Login Forms
            {
                id: 'tpl-002',
                name: 'Animated Login Form',
                description: 'Beautiful login form with smooth animations and modern design.',
                category: 'login-forms',
                tags: ['animated', 'modern', 'responsive', 'validation'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/login-form-preview.svg',
                files: ['index.html'],
                size: '32 KB',
                downloads: 1234,
                rating: 4.6,
                author: 'TemplateHub',
                createdAt: '2025-01-14T14:20:00Z',
                updatedAt: '2025-01-14T14:20:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/login-forms/animated/',
                demoUrl: 'templates/login-forms/animated-login/index.html'
            },
            {
                id: 'tpl-011',
                name: 'Glass Morphism Login',
                description: 'Trendy glass morphism login form with backdrop blur effects.',
                category: 'login-forms',
                tags: ['glassmorphism', 'modern', 'blur', 'trendy', 'transparent'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/login-form-preview.svg',
                files: ['index.html'],
                size: '28 KB',
                downloads: 856,
                rating: 4.8,
                author: 'TemplateHub',
                createdAt: '2025-01-05T16:45:00Z',
                updatedAt: '2025-01-05T16:45:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/login-forms/glassmorphism/',
                demoUrl: 'templates/login-forms/glassmorphism/index.html'
            },

            // Registration Forms
            {
                id: 'tpl-003',
                name: 'Registration Wizard',
                description: 'Multi-step registration form with progress indicator and validation.',
                category: 'registration-forms',
                tags: ['multi-step', 'wizard', 'validation', 'progress'],
                difficulty: 'hard',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/registration-form-preview.svg',
                files: ['index.html'],
                size: '67 KB',
                downloads: 2103,
                rating: 4.9,
                author: 'TemplateHub',
                createdAt: '2025-01-13T09:15:00Z',
                updatedAt: '2025-01-13T09:15:00Z',
                featured: true,
                cdnUrl: 'https://cdn.templatehub.com/registration-forms/wizard/',
                demoUrl: 'templates/registration-forms/wizard/index.html'
            },
            {
                id: 'tpl-012',
                name: 'Social Registration Form',
                description: 'Registration form with social login options and profile picture upload.',
                category: 'registration-forms',
                tags: ['social', 'oauth', 'profile', 'upload', 'modern'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/registration-form-preview.svg',
                files: ['index.html'],
                size: '54 KB',
                downloads: 1456,
                rating: 4.7,
                author: 'TemplateHub',
                createdAt: '2025-01-04T13:20:00Z',
                updatedAt: '2025-01-04T13:20:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/registration-forms/social/',
                demoUrl: 'templates/registration-forms/social/index.html'
            },

            // E-commerce Templates
            {
                id: 'tpl-004',
                name: 'E-commerce Product Cards',
                description: 'Interactive product cards with wishlist, filtering, and shopping cart features.',
                category: 'ecommerce',
                tags: ['ecommerce', 'cards', 'responsive', 'interactive', 'shopping'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/ecommerce-preview.svg',
                files: ['index.html'],
                size: '89 KB',
                downloads: 1876,
                rating: 4.9,
                author: 'TemplateHub',
                createdAt: '2025-01-12T16:45:00Z',
                updatedAt: '2025-01-12T16:45:00Z',
                featured: true,
                cdnUrl: 'https://cdn.templatehub.com/ecommerce/product-cards/',
                demoUrl: 'templates/ecommerce/product-cards/index.html'
            },
            {
                id: 'tpl-013',
                name: 'Shopping Cart Page',
                description: 'Complete shopping cart interface with quantity controls and checkout flow.',
                category: 'ecommerce',
                tags: ['cart', 'checkout', 'payment', 'quantity', 'responsive'],
                difficulty: 'hard',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/ecommerce-preview.svg',
                files: ['index.html'],
                size: '76 KB',
                downloads: 1324,
                rating: 4.8,
                author: 'TemplateHub',
                createdAt: '2025-01-03T10:30:00Z',
                updatedAt: '2025-01-03T10:30:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/ecommerce/shopping-cart/',
                demoUrl: 'templates/ecommerce/shopping-cart/index.html'
            },
            {
                id: 'tpl-014',
                name: 'Product Detail Page',
                description: 'Detailed product page with image gallery, reviews, and related products.',
                category: 'ecommerce',
                tags: ['product', 'detail', 'gallery', 'reviews', 'related'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/ecommerce-preview.svg',
                files: ['index.html'],
                size: '65 KB',
                downloads: 998,
                rating: 4.6,
                author: 'TemplateHub',
                createdAt: '2025-01-02T14:15:00Z',
                updatedAt: '2025-01-02T14:15:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/ecommerce/product-detail/',
                demoUrl: 'templates/ecommerce/product-detail/index.html'
            },

            // Dashboard Templates
            {
                id: 'tpl-005',
                name: 'Dashboard Analytics',
                description: 'Professional dashboard with stats, charts, and data tables for admin panels.',
                category: 'dashboards',
                tags: ['dashboard', 'analytics', 'admin', 'charts', 'data-tables'],
                difficulty: 'hard',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/dashboard-preview.svg',
                files: ['index.html'],
                size: '94 KB',
                downloads: 1543,
                rating: 4.8,
                author: 'TemplateHub',
                createdAt: '2025-01-11T11:30:00Z',
                updatedAt: '2025-01-11T11:30:00Z',
                featured: true,
                cdnUrl: 'https://cdn.templatehub.com/dashboards/analytics/',
                demoUrl: 'templates/dashboards/analytics/index.html'
            },
            {
                id: 'tpl-015',
                name: 'CRM Dashboard',
                description: 'Customer relationship management dashboard with leads, contacts, and sales tracking.',
                category: 'dashboards',
                tags: ['crm', 'sales', 'leads', 'contacts', 'tracking'],
                difficulty: 'hard',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/dashboard-preview.svg',
                files: ['index.html'],
                size: '102 KB',
                downloads: 876,
                rating: 4.7,
                author: 'TemplateHub',
                createdAt: '2025-01-01T09:00:00Z',
                updatedAt: '2025-01-01T09:00:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/dashboards/crm/',
                demoUrl: 'templates/dashboards/crm/index.html'
            },
            {
                id: 'tpl-016',
                name: 'Project Management Dashboard',
                description: 'Task management dashboard with kanban boards, timelines, and team collaboration.',
                category: 'dashboards',
                tags: ['project', 'kanban', 'timeline', 'collaboration', 'tasks'],
                difficulty: 'hard',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/dashboard-preview.svg',
                files: ['index.html'],
                size: '118 KB',
                downloads: 1205,
                rating: 4.9,
                author: 'TemplateHub',
                createdAt: '2024-12-31T15:30:00Z',
                updatedAt: '2024-12-31T15:30:00Z',
                featured: true,
                cdnUrl: 'https://cdn.templatehub.com/dashboards/project-management/',
                demoUrl: 'templates/dashboards/project-management/index.html'
            },

            // Portfolio Templates
            {
                id: 'tpl-006',
                name: 'Portfolio Showcase',
                description: 'Creative portfolio template for designers and developers.',
                category: 'portfolios',
                tags: ['portfolio', 'creative', 'showcase', 'personal', 'responsive'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/portfolio-preview.svg',
                files: ['index.html'],
                size: '56 KB',
                downloads: 892,
                rating: 4.7,
                author: 'TemplateHub',
                createdAt: '2025-01-10T14:20:00Z',
                updatedAt: '2025-01-10T14:20:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/portfolios/showcase/',
                demoUrl: 'templates/portfolios/showcase/index.html'
            },
            {
                id: 'tpl-017',
                name: 'Photography Portfolio',
                description: 'Stunning photography portfolio with lightbox gallery and client testimonials.',
                category: 'portfolios',
                tags: ['photography', 'gallery', 'lightbox', 'testimonials', 'visual'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/portfolio-preview.svg',
                files: ['index.html'],
                size: '72 KB',
                downloads: 634,
                rating: 4.8,
                author: 'TemplateHub',
                createdAt: '2024-12-30T12:45:00Z',
                updatedAt: '2024-12-30T12:45:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/portfolios/photography/',
                demoUrl: 'templates/portfolios/photography/index.html'
            },
            {
                id: 'tpl-018',
                name: 'Developer Portfolio',
                description: 'Technical portfolio for developers with project showcase and skills matrix.',
                category: 'portfolios',
                tags: ['developer', 'technical', 'projects', 'skills', 'github'],
                difficulty: 'easy',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/portfolio-preview.svg',
                files: ['index.html'],
                size: '48 KB',
                downloads: 1456,
                rating: 4.6,
                author: 'TemplateHub',
                createdAt: '2024-12-29T16:20:00Z',
                updatedAt: '2024-12-29T16:20:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/portfolios/developer/',
                demoUrl: 'templates/portfolios/developer/index.html'
            },

            // Blog Templates
            {
                id: 'tpl-007',
                name: 'Blog Article Layout',
                description: 'Clean and readable blog article template with comments section.',
                category: 'blogs',
                tags: ['blog', 'article', 'reading', 'content', 'responsive'],
                difficulty: 'easy',
                technologies: ['HTML', 'CSS'],
                preview: 'assets/images/blog-preview.svg',
                files: ['index.html'],
                size: '34 KB',
                downloads: 654,
                rating: 4.5,
                author: 'TemplateHub',
                createdAt: '2025-01-09T09:30:00Z',
                updatedAt: '2025-01-09T09:30:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/blogs/article/',
                demoUrl: 'templates/blogs/article/index.html'
            },
            {
                id: 'tpl-019',
                name: 'Blog Homepage',
                description: 'Modern blog homepage with featured posts, categories, and newsletter signup.',
                category: 'blogs',
                tags: ['homepage', 'featured', 'categories', 'newsletter', 'modern'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/blog-preview.svg',
                files: ['index.html'],
                size: '67 KB',
                downloads: 823,
                rating: 4.7,
                author: 'TemplateHub',
                createdAt: '2024-12-28T11:15:00Z',
                updatedAt: '2024-12-28T11:15:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/blogs/homepage/',
                demoUrl: 'templates/blogs/homepage/index.html'
            },
            {
                id: 'tpl-020',
                name: 'Personal Blog',
                description: 'Personal blog template with author bio, social links, and minimalist design.',
                category: 'blogs',
                tags: ['personal', 'author', 'social', 'minimalist', 'simple'],
                difficulty: 'easy',
                technologies: ['HTML', 'CSS'],
                preview: 'assets/images/blog-preview.svg',
                files: ['index.html'],
                size: '29 KB',
                downloads: 445,
                rating: 4.4,
                author: 'TemplateHub',
                createdAt: '2024-12-27T14:30:00Z',
                updatedAt: '2024-12-27T14:30:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/blogs/personal/',
                demoUrl: 'templates/blogs/personal/index.html'
            },

            // Pricing Templates
            {
                id: 'tpl-008',
                name: 'Pricing Tables',
                description: 'Modern pricing tables with feature comparison and CTAs.',
                category: 'pricing',
                tags: ['pricing', 'tables', 'saas', 'business', 'comparison'],
                difficulty: 'easy',
                technologies: ['HTML', 'CSS'],
                preview: 'assets/images/pricing-preview.svg',
                files: ['index.html'],
                size: '28 KB',
                downloads: 1123,
                rating: 4.6,
                author: 'TemplateHub',
                createdAt: '2025-01-08T16:00:00Z',
                updatedAt: '2025-01-08T16:00:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/pricing/tables/',
                demoUrl: 'templates/pricing/tables/index.html'
            },
            {
                id: 'tpl-021',
                name: 'SaaS Pricing Page',
                description: 'Complete SaaS pricing page with feature toggles, annual discounts, and FAQ.',
                category: 'pricing',
                tags: ['saas', 'subscription', 'annual', 'faq', 'features'],
                difficulty: 'medium',
                technologies: ['HTML', 'CSS', 'JavaScript'],
                preview: 'assets/images/pricing-preview.svg',
                files: ['index.html'],
                size: '45 KB',
                downloads: 987,
                rating: 4.8,
                author: 'TemplateHub',
                createdAt: '2024-12-26T10:45:00Z',
                updatedAt: '2024-12-26T10:45:00Z',
                featured: true,
                cdnUrl: 'https://cdn.templatehub.com/pricing/saas/',
                demoUrl: 'templates/pricing/saas/index.html'
            },
            {
                id: 'tpl-022',
                name: 'App Pricing Cards',
                description: 'Mobile app pricing cards with feature highlights and download buttons.',
                category: 'pricing',
                tags: ['mobile', 'app', 'cards', 'download', 'features'],
                difficulty: 'easy',
                technologies: ['HTML', 'CSS'],
                preview: 'assets/images/pricing-preview.svg',
                files: ['index.html'],
                size: '35 KB',
                downloads: 567,
                rating: 4.5,
                author: 'TemplateHub',
                createdAt: '2024-12-25T13:20:00Z',
                updatedAt: '2024-12-25T13:20:00Z',
                featured: false,
                cdnUrl: 'https://cdn.templatehub.com/pricing/app/',
                demoUrl: 'templates/pricing/app/index.html'
            }
        ];
    }

    getDefaultCategories() {
        return [
            {
                id: 'landing-pages',
                name: 'Landing Pages',
                description: 'Professional landing pages for businesses and products',
                icon: 'layout',
                color: '#3b82f6',
                templateCount: 3
            },
            {
                id: 'login-forms',
                name: 'Login Forms',
                description: 'Authentication interfaces and login pages',
                icon: 'log-in',
                color: '#10b981',
                templateCount: 2
            },
            {
                id: 'registration-forms',
                name: 'Registration Forms',
                description: 'Sign-up forms and user registration pages',
                icon: 'user-plus',
                color: '#f59e0b',
                templateCount: 2
            },
            {
                id: 'ecommerce',
                name: 'E-commerce',
                description: 'Shopping carts, product displays, and store layouts',
                icon: 'shopping-cart',
                color: '#ef4444',
                templateCount: 3
            },
            {
                id: 'dashboards',
                name: 'Dashboards',
                description: 'Admin panels and analytics dashboards',
                icon: 'bar-chart',
                color: '#8b5cf6',
                templateCount: 3
            },
            {
                id: 'portfolios',
                name: 'Portfolios',
                description: 'Personal and professional portfolio layouts',
                icon: 'briefcase',
                color: '#06b6d4',
                templateCount: 3
            },
            {
                id: 'blogs',
                name: 'Blogs',
                description: 'Blog layouts and article templates',
                icon: 'edit',
                color: '#84cc16',
                templateCount: 3
            },
            {
                id: 'pricing',
                name: 'Pricing',
                description: 'Pricing tables and subscription layouts',
                icon: 'dollar-sign',
                color: '#f97316',
                templateCount: 3
            }
        ];
    }

    getDefaultUsers() {
        return [
            {
                id: 'user-001',
                email: 'admin@templatehub.com',
                password: 'admin123', // In production, this should be hashed
                name: 'Admin User',
                role: 'admin',
                avatar: 'assets/images/avatars/admin.jpg',
                createdAt: '2025-01-01T00:00:00Z',
                lastLogin: null
            }
        ];
    }

    getDefaultSettings() {
        return {
            siteName: 'TemplateHub',
            siteDescription: 'Professional web templates for developers',
            adminEmail: 'admin@templatehub.com',
            enableRegistration: true,
            enableComments: true,
            enableRatings: true,
            templatesPerPage: 12,
            theme: 'default',
            maintenance: false,
            version: '1.0.0'
        };
    }

    getDefaultAnalytics() {
        return {
            totalViews: 24567,
            totalDownloads: 18934,
            totalUsers: 1256,
            totalTemplates: 22,
            popularTemplates: ['tpl-003', 'tpl-016', 'tpl-010', 'tpl-021', 'tpl-001'],
            recentActivity: [
                { action: 'Template Downloaded', template: 'Registration Wizard', user: 'john.doe@email.com', timestamp: new Date().toISOString() },
                { action: 'New User Registered', user: 'jane.smith@email.com', timestamp: new Date(Date.now() - 300000).toISOString() },
                { action: 'Template Downloaded', template: 'Product Launch Page', user: 'mike.dev@email.com', timestamp: new Date(Date.now() - 600000).toISOString() },
                { action: 'Template Downloaded', template: 'Project Management Dashboard', user: 'sarah.design@email.com', timestamp: new Date(Date.now() - 900000).toISOString() }
            ],
            monthlyStats: {
                views: [1200, 1450, 1680, 2100, 1870, 2340, 2156],
                downloads: [345, 467, 589, 698, 576, 723, 645],
                users: [72, 89, 103, 129, 115, 141, 135]
            },
            lastUpdated: new Date().toISOString()
        };
    }
}

// Create global instance
window.DataManager = new DataManager();