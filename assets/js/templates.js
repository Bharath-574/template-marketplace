// Template Marketplace - Template Management System
// Handles template display, search, filtering, and actions

class TemplateManager {
    constructor() {
        this.dataManager = new DataManager();
        this.templates = [];
        this.filteredTemplates = [];
        this.currentSearch = '';
        this.currentFilters = {
            category: '',
            sort: 'newest'
        };
        
        this.init();
    }

    init() {
        try {
            this.loadTemplates();
            this.bindEvents();
            this.updateStats();
            console.log('TemplateManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TemplateManager:', error);
            Utils.showNotification('Failed to load templates. Please refresh the page.', 'error');
        }
    }

    loadTemplates() {
        this.templates = this.dataManager.getAllTemplates() || [];
        this.filteredTemplates = [...this.templates];
        this.renderTemplates();
    }

    bindEvents() {
        // Search functionality
        const searchInput = Utils.$('#search-input');
        if (searchInput) {
            Utils.on(searchInput, 'input', Utils.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // Category filter
        const categoryFilter = Utils.$('#category-filter');
        if (categoryFilter) {
            Utils.on(categoryFilter, 'change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        // Sort filter
        const sortFilter = Utils.$('#sort-filter');
        if (sortFilter) {
            Utils.on(sortFilter, 'change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // Clear filters
        const clearFiltersBtn = Utils.$('#clear-filters');
        if (clearFiltersBtn) {
            Utils.on(clearFiltersBtn, 'click', () => {
                this.clearFilters();
            });
        }

        // Category cards click
        Utils.$$('.category-card').forEach(card => {
            Utils.on(card, 'click', () => {
                const category = card.dataset.category;
                this.handleCategoryFilter(category);
                this.scrollToTemplates();
            });
        });
    }

    handleSearch(query) {
        this.currentSearch = query;
        this.applyFilters();
    }

    handleCategoryFilter(category) {
        this.currentFilters.category = category;
        
        // Update UI
        const categoryFilter = Utils.$('#category-filter');
        if (categoryFilter) {
            categoryFilter.value = category;
        }
        
        this.applyFilters();
    }

    handleSort(sortBy) {
        this.currentFilters.sort = sortBy;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredTemplates = this.searchTemplates(
            this.currentSearch, 
            this.currentFilters
        );
        
        this.renderTemplates();
        this.updateResultsCount();
    }

    clearFilters() {
        this.currentSearch = '';
        this.currentFilters = {
            category: '',
            sort: 'newest'
        };
        
        // Reset UI
        const searchInput = Utils.$('#search-input');
        const categoryFilter = Utils.$('#category-filter');
        const sortFilter = Utils.$('#sort-filter');
        
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (sortFilter) sortFilter.value = 'newest';
        
        this.applyFilters();
    }

    renderTemplates() {
        try {
            const container = Utils.$('#templates-grid');
            const loadingState = Utils.$('#loading-state');
            const noResults = Utils.$('#no-results');
            
            if (!container) {
                console.warn('Templates grid container not found');
                return;
            }

            // Hide loading state
            if (loadingState) {
                loadingState.classList.add('hidden');
            }

            // Show/hide no results
            if (this.filteredTemplates.length === 0) {
                container.classList.add('hidden');
                if (noResults) {
                    noResults.classList.remove('hidden');
                }
                return;
            } else {
                container.classList.remove('hidden');
                if (noResults) {
                    noResults.classList.add('hidden');
                }
            }

            // Render templates with error handling
            const templateCards = this.filteredTemplates.map(template => {
                try {
                    return this.renderTemplateCard(template);
                } catch (cardError) {
                    console.error('Error rendering template card:', template.id, cardError);
                    return `<div class="template-card error">
                        <p>Error loading template: ${template.name}</p>
                    </div>`;
                }
            });
            
            container.innerHTML = templateCards.join('');

            // Bind template card events
            this.bindTemplateEvents();

            // Add favorite buttons to rendered templates
            if (window.TemplateApp && window.TemplateApp.favoritesManager) {
                try {
                    window.TemplateApp.favoritesManager.addFavoriteButtons();
                } catch (favError) {
                    console.warn('Could not add favorite buttons:', favError);
                }
            }

            // Reinitialize Lucide icons
            if (window.lucide) {
                try {
                    lucide.createIcons();
                } catch (iconError) {
                    console.warn('Could not initialize Lucide icons:', iconError);
                }
            }
        } catch (error) {
            console.error('Error rendering templates:', error);
            Utils.showNotification('Failed to display templates. Please try refreshing the page.', 'error');
        }
    }

    renderTemplateCard(template) {
        const difficultyColor = {
            'easy': 'success',
            'medium': 'warning',
            'hard': 'error'
        };

        const tags = template.tags.slice(0, 3).map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');

        return `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-preview">
                    <img src="${template.preview || 'assets/images/placeholder.jpg'}" 
                         alt="${template.name}" 
                         loading="lazy"
                         onerror="this.src='assets/images/placeholder.jpg'">
                    <div class="absolute top-2 right-2">
                        ${template.featured ? '<span class="tag primary">Featured</span>' : ''}
                    </div>
                </div>
                
                <div class="template-info">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="template-title">${template.name}</h3>
                        <div class="flex items-center gap-1 text-sm text-gray-500">
                            <i data-lucide="star" style="width: 1rem; height: 1rem;"></i>
                            <span>${template.rating || '4.5'}</span>
                        </div>
                    </div>
                    
                    <p class="template-description">${Utils.truncate(template.description, 100)}</p>
                    
                    <div class="template-tags mb-3">
                        ${tags}
                        <span class="tag ${difficultyColor[template.difficulty] || 'secondary'}">${template.difficulty}</span>
                    </div>
                    
                    <div class="flex justify-between items-center text-sm text-gray-500 mb-3">
                        <span class="flex items-center gap-1">
                            <i data-lucide="download" style="width: 1rem; height: 1rem;"></i>
                            ${template.downloads || 0} downloads
                        </span>
                        <span class="flex items-center gap-1">
                            <i data-lucide="file" style="width: 1rem; height: 1rem;"></i>
                            ${template.size || 'N/A'}
                        </span>
                    </div>
                    
                    <div class="template-actions">
                        <button class="btn btn-primary btn-sm flex-1" 
                                data-action="preview" 
                                data-template-id="${template.id}">
                            <i data-lucide="eye"></i>
                            Preview
                        </button>
                        <button class="btn btn-secondary btn-sm flex-1" 
                                data-action="download" 
                                data-template-id="${template.id}">
                            <i data-lucide="download"></i>
                            Download
                        </button>
                        <button class="btn btn-accent btn-sm" 
                                data-action="copy-link" 
                                data-template-id="${template.id}"
                                title="Copy CDN Link">
                            <i data-lucide="link"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindTemplateEvents() {
        // Preview buttons
        Utils.$$('[data-action="preview"]').forEach(btn => {
            Utils.on(btn, 'click', (e) => {
                const templateId = e.target.closest('button').dataset.templateId;
                this.previewTemplate(templateId);
            });
        });

        // Download buttons
        Utils.$$('[data-action="download"]').forEach(btn => {
            Utils.on(btn, 'click', (e) => {
                const templateId = e.target.closest('button').dataset.templateId;
                this.downloadTemplate(templateId);
            });
        });

        // Copy link buttons
        Utils.$$('[data-action="copy-link"]').forEach(btn => {
            Utils.on(btn, 'click', (e) => {
                const templateId = e.target.closest('button').dataset.templateId;
                this.copyTemplateLink(templateId);
            });
        });

        // Template card clicks (for detailed view)
        Utils.$$('.template-card').forEach(card => {
            Utils.on(card, 'click', (e) => {
                // Don't trigger if clicking on buttons
                if (e.target.closest('button')) return;
                
                const templateId = card.dataset.templateId;
                this.showTemplateDetails(templateId);
            });
        });
    }

    async previewTemplate(templateId) {
        const template = this.dataManager.getTemplate(templateId);
        if (!template) {
            Utils.showNotification('Template not found', 'error');
            return;
        }

        // Open the template directly in a new tab for better preview experience
        const templateUrl = template.demoUrl || `templates/${template.category}/${this.getTemplateSlug(template.name)}/index.html`;
        
        try {
            window.open(templateUrl, '_blank');
            Utils.showNotification(`Opening ${template.name}...`, 'success');
            
            // Increment view count
            this.incrementTemplateDownloads(templateId); // Using this for view tracking too
        } catch (error) {
            console.error('Error opening template:', error);
            this.showTemplateModal(template, templateId);
        }
    }

    showTemplateModal(template, templateId) {
        // Fallback modal preview if direct opening fails
        const modalContent = `
            <div class="template-preview-modal">
                <div class="preview-header mb-4">
                    <h4>${template.name}</h4>
                    <p class="text-gray-600">${template.description}</p>
                </div>
                
                <div class="preview-frame" style="height: 400px; border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden;">
                    <iframe src="${template.demoUrl}" 
                            width="100%" 
                            height="100%" 
                            frameborder="0"
                            style="border-radius: 0.5rem;"
                            onload="this.style.opacity='1'"
                            style="opacity: 0; transition: opacity 0.3s;"
                            onerror="this.outerHTML='<div class=\\'flex items-center justify-center h-full text-gray-500\\'>Preview not available</div>'">
                    </iframe>
                </div>
                
                <div class="preview-actions mt-4 flex gap-2">
                    <button class="btn btn-primary" onclick="window.open('${template.demoUrl}', '_blank')">
                        <i data-lucide="external-link"></i>
                        Open in New Tab
                    </button>
                    <button class="btn btn-secondary" data-template-id="${templateId}" data-modal-action="download">
                        <i data-lucide="download"></i>
                        Download Template
                    </button>
                </div>
            </div>
        `;

        const modal = Utils.showModal(modalContent, {
            title: 'Template Preview',
            footer: ''
        });

        // Bind modal actions
        const downloadBtn = modal.querySelector('[data-modal-action="download"]');
        if (downloadBtn) {
            Utils.on(downloadBtn, 'click', () => {
                document.body.removeChild(modal);
                this.downloadTemplate(templateId);
            });
        }

        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    getTemplateSlug(name) {
        return name.toLowerCase()
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/(^-|-$)/g, '');
    }

    async downloadTemplate(templateId) {
        const template = this.dataManager.getTemplate(templateId);
        if (!template) {
            Utils.showNotification('Template not found', 'error');
            return;
        }

        // Increment download counter
        this.incrementTemplateDownloads(templateId);
        
        // Update analytics
        const analytics = this.dataManager.getAnalytics() || {};
        analytics.totalDownloads = (analytics.totalDownloads || 0) + 1;
        this.dataManager.setAnalytics(analytics);

        // Show download options
        const modalContent = `
            <div class="download-options">
                <div class="mb-4">
                    <h4>${template.name}</h4>
                    <p class="text-gray-600">${template.description}</p>
                </div>
                
                <div class="download-methods">
                    <div class="method-card p-4 border rounded-lg mb-3 hover:bg-gray-50 cursor-pointer" data-method="zip">
                        <div class="flex items-start gap-3">
                            <i data-lucide="archive" class="text-primary mt-1"></i>
                            <div>
                                <h5 class="font-medium">Download ZIP</h5>
                                <p class="text-sm text-gray-600">Download all template files as a ZIP archive</p>
                                <p class="text-xs text-gray-500 mt-1">Size: ${template.size}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="method-card p-4 border rounded-lg mb-3 hover:bg-gray-50 cursor-pointer" data-method="cdn">
                        <div class="flex items-start gap-3">
                            <i data-lucide="link" class="text-accent mt-1"></i>
                            <div>
                                <h5 class="font-medium">CDN Link</h5>
                                <p class="text-sm text-gray-600">Use direct CDN links in your project</p>
                                <code class="text-xs bg-gray-100 p-1 rounded mt-1 block">${template.cdnUrl}</code>
                            </div>
                        </div>
                    </div>
                    
                    <div class="method-card p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" data-method="copy">
                        <div class="flex items-start gap-3">
                            <i data-lucide="copy" class="text-warning mt-1"></i>
                            <div>
                                <h5 class="font-medium">Copy Code</h5>
                                <p class="text-sm text-gray-600">Copy template code to clipboard</p>
                                <p class="text-xs text-gray-500 mt-1">Files: ${template.files.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = Utils.showModal(modalContent, {
            title: 'Download Template'
        });

        // Bind download method handlers
        Utils.$$('.method-card').forEach(card => {
            Utils.on(card, 'click', () => {
                const method = card.dataset.method;
                this.handleDownloadMethod(template, method);
                document.body.removeChild(modal);
            });
        });

        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    handleDownloadMethod(template, method) {
        switch (method) {
            case 'zip':
                this.downloadZip(template);
                break;
            case 'cdn':
                this.copyCdnLink(template);
                break;
            case 'copy':
                this.copyTemplateCode(template);
                break;
        }
    }

    downloadZip(template) {
        // Open the template file directly instead of a non-existent ZIP
        const templateUrl = template.demoUrl || `templates/${template.category}/${this.getTemplateSlug(template.name)}/index.html`;
        window.open(templateUrl, '_blank');
        Utils.showNotification(`Opening ${template.name} for download...`, 'success');
    }

    async copyCdnLink(template) {
        const success = await Utils.copyToClipboard(template.cdnUrl);
        if (success) {
            Utils.showNotification('CDN link copied to clipboard!', 'success');
        } else {
            Utils.showNotification('Failed to copy link', 'error');
        }
    }

    async copyTemplateLink(templateId) {
        const template = this.dataManager.getTemplate(templateId);
        if (!template) return;

        const success = await Utils.copyToClipboard(template.cdnUrl);
        if (success) {
            Utils.showNotification('Template link copied!', 'success');
        } else {
            Utils.showNotification('Failed to copy link', 'error');
        }
    }

    async copyTemplateCode(template) {
        // In a real implementation, this would fetch the actual template code
        const sampleCode = `<!-- ${template.name} Template -->
<!-- Include this in your HTML -->
<link rel="stylesheet" href="${template.cdnUrl}style.css">
<script src="${template.cdnUrl}script.js"></script>

<!-- Template HTML structure would be here -->`;
        
        const success = await Utils.copyToClipboard(sampleCode);
        if (success) {
            Utils.showNotification('Template code copied to clipboard!', 'success');
        } else {
            Utils.showNotification('Failed to copy code', 'error');
        }
    }

    showTemplateDetails(templateId) {
        const template = this.dataManager.getTemplate(templateId);
        if (!template) return;

        // Open the template directly in a new tab instead of navigating to a detail page
        const templateUrl = template.demoUrl || `templates/${template.category}/${this.getTemplateSlug(template.name)}/index.html`;
        window.open(templateUrl, '_blank');
        
        Utils.showNotification(`Opening ${template.name}...`, 'success');
    }

    updateStats() {
        const templates = this.dataManager.getAllTemplates() || [];
        const categories = this.dataManager.getAllCategories() || [];

        // Update total templates
        const totalTemplatesEl = Utils.$('#total-templates');
        if (totalTemplatesEl) {
            totalTemplatesEl.textContent = templates.length + '+';
        }

        // Update total downloads
        const totalDownloads = templates.reduce((sum, t) => sum + (t.downloads || 0), 0);
        const totalDownloadsEl = Utils.$('#total-downloads');
        if (totalDownloadsEl) {
            totalDownloadsEl.textContent = this.formatNumber(totalDownloads) + '+';
        }

        // Update category counts
        categories.forEach(category => {
            const count = templates.filter(t => t.category === category.id).length;
            const countEl = Utils.$(`#${category.id}-count`);
            if (countEl) {
                countEl.textContent = `${count} template${count !== 1 ? 's' : ''}`;
            }
        });
    }

    updateResultsCount() {
        // Update results count if needed
        const resultsCount = this.filteredTemplates.length;
        const totalCount = this.templates.length;
        
        // You can add a results counter element if needed
        console.log(`Showing ${resultsCount} of ${totalCount} templates`);
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    scrollToTemplates() {
        const templatesSection = Utils.$('#templates');
        if (templatesSection) {
            templatesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Admin methods for template management
    createTemplate(templateData) {
        const template = this.dataManager.addTemplate(templateData);
        if (template) {
            this.loadTemplates();
            Utils.showNotification('Template created successfully!', 'success');
            return template;
        }
        Utils.showNotification('Failed to create template', 'error');
        return null;
    }

    updateTemplate(id, updates) {
        const template = this.dataManager.updateTemplate(id, updates);
        if (template) {
            this.loadTemplates();
            Utils.showNotification('Template updated successfully!', 'success');
            return template;
        }
        Utils.showNotification('Failed to update template', 'error');
        return null;
    }

    deleteTemplate(id) {
        if (confirm('Are you sure you want to delete this template?')) {
            const success = this.dataManager.deleteTemplate(id);
            if (success) {
                this.loadTemplates();
                Utils.showNotification('Template deleted successfully!', 'success');
                return true;
            }
            Utils.showNotification('Failed to delete template', 'error');
        }
        return false;
    }

    // Search templates method
    searchTemplates(query, filters) {
        let templates = this.templates;

        // Apply search query
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase();
            templates = templates.filter(template => 
                template.name.toLowerCase().includes(searchTerm) ||
                template.description.toLowerCase().includes(searchTerm) ||
                template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                template.technologies.some(tech => tech.toLowerCase().includes(searchTerm))
            );
        }

        // Apply category filter
        if (filters.category && filters.category !== '') {
            templates = templates.filter(template => template.category === filters.category);
        }

        // Apply sorting
        if (filters.sort) {
            switch (filters.sort) {
                case 'newest':
                    templates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                case 'popular':
                    templates.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
                    break;
                case 'rating':
                    templates.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    break;
                case 'name':
                    templates.sort((a, b) => a.name.localeCompare(b.name));
                    break;
            }
        }

        return templates;
    }

    // Increment template downloads/views
    incrementTemplateDownloads(templateId) {
        const template = this.dataManager.getTemplate(templateId);
        if (template) {
            const updated = this.dataManager.updateTemplate(templateId, {
                downloads: (template.downloads || 0) + 1
            });
            if (updated) {
                // Update local templates array
                const index = this.templates.findIndex(t => t.id === templateId);
                if (index !== -1) {
                    this.templates[index] = updated;
                }
            }
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Make TemplateManager globally available
window.TemplateManager = TemplateManager;