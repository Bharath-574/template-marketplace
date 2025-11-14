/**
 * Template Detail Page Management
 * Handles template detail display, preview, and download functionality
 */

class TemplateDetail {
    constructor() {
        this.dataManager = new DataManager();
        this.utils = new Utils();
        this.currentTemplate = null;
        this.currentView = 'desktop';
        
        // Get template ID from URL parameters
        this.templateId = this.getTemplateIdFromUrl();
    }

    /**
     * Initialize template detail page
     */
    static init() {
        const templateDetail = new TemplateDetail();
        templateDetail.loadTemplate();
        templateDetail.setupEventListeners();
        templateDetail.setupPreviewControls();
        templateDetail.setupIntegrationTabs();
        templateDetail.loadRelatedTemplates();
        
        console.log('Template Detail page initialized');
    }

    /**
     * Get template ID from URL parameters
     */
    getTemplateIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || urlParams.get('template') || '1';
    }

    /**
     * Load template data and populate the page
     */
    loadTemplate() {
        this.currentTemplate = this.dataManager.getTemplate(this.templateId);
        
        if (!this.currentTemplate) {
            // Show error or redirect to templates list
            this.showTemplateNotFound();
            return;
        }

        this.populateTemplateInfo();
        this.setupPreview();
        this.updateBreadcrumb();
        this.trackView();
    }

    /**
     * Show template not found error
     */
    showTemplateNotFound() {
        const container = document.querySelector('.template-detail-layout');
        if (container) {
            container.innerHTML = `
                <div class="not-found-message">
                    <i data-lucide="search-x" style="width: 3rem; height: 3rem; color: var(--gray-400);"></i>
                    <h2>Template Not Found</h2>
                    <p>The template you're looking for doesn't exist or has been removed.</p>
                    <a href="index.html" class="btn btn-primary">Browse Templates</a>
                </div>
            `;
            
            // Re-initialize Lucide icons
            lucide.createIcons();
        }
    }

    /**
     * Populate template information
     */
    populateTemplateInfo() {
        const template = this.currentTemplate;
        
        // Update page title
        document.title = `${template.name} - TemplateHub`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = template.description;
        }

        // Populate template details
        this.updateElement('detail-category', template.category);
        this.updateElement('detail-difficulty', template.difficulty || 'Easy');
        this.updateElement('detail-title', template.name);
        this.updateElement('detail-description', template.description);
        this.updateElement('detail-downloads', template.downloads || 0);
        this.updateElement('detail-rating', template.rating || '4.5');
        this.updateElement('detail-views', template.views || 0);
        this.updateElement('detail-updated', template.updatedAt || template.createdAt || 'Recently');
        this.updateElement('detail-author', template.author || 'TemplateHub Team');

        // Populate technologies
        this.populateTechnologies(template.technologies || ['HTML', 'CSS', 'JavaScript']);
        
        // Populate tags
        this.populateTags(template.tags || ['modern', 'responsive']);
        
        // Update category difficulty styling
        this.updateDifficultyStyle(template.difficulty);
    }

    /**
     * Update element content
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * Populate technologies list
     */
    populateTechnologies(technologies) {
        const container = document.getElementById('detail-technologies');
        if (!container) return;

        container.innerHTML = technologies.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');
    }

    /**
     * Populate tags list
     */
    populateTags(tags) {
        const container = document.getElementById('detail-tags');
        if (!container) return;

        container.innerHTML = tags.map(tag => 
            `<span class="tag-item">${tag}</span>`
        ).join('');
    }

    /**
     * Update difficulty badge styling
     */
    updateDifficultyStyle(difficulty) {
        const difficultyElement = document.getElementById('detail-difficulty');
        if (!difficultyElement) return;

        // Remove existing classes
        difficultyElement.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
        
        // Add appropriate class
        if (difficulty) {
            difficultyElement.classList.add(`difficulty-${difficulty.toLowerCase()}`);
        }
    }

    /**
     * Setup template preview
     */
    setupPreview() {
        const template = this.currentTemplate;
        const iframe = document.getElementById('template-iframe');
        const loadingElement = document.getElementById('preview-loading');
        
        if (!iframe) return;

        // Show loading
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }

        // Set iframe source
        const previewUrl = template.liveUrl || template.preview || 'templates/sample-preview.html';
        iframe.src = previewUrl;

        // Hide loading when iframe loads
        iframe.addEventListener('load', () => {
            if (loadingElement) {
                setTimeout(() => {
                    loadingElement.classList.add('hidden');
                }, 500);
            }
        });

        // Handle iframe load error
        iframe.addEventListener('error', () => {
            if (loadingElement) {
                loadingElement.innerHTML = `
                    <i data-lucide="alert-circle" style="width: 2rem; height: 2rem; color: var(--error);"></i>
                    <p>Preview not available</p>
                `;
                lucide.createIcons();
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Download template
        const downloadBtn = document.getElementById('download-template');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadTemplate());
        }

        // Live preview
        const livePreviewBtn = document.getElementById('live-preview');
        if (livePreviewBtn) {
            livePreviewBtn.addEventListener('click', () => this.openLivePreview());
        }

        // Add to favorites
        const favoriteBtn = document.getElementById('favorite-template');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }

        // Copy CDN link
        const cdnBtn = document.getElementById('copy-cdn');
        if (cdnBtn) {
            cdnBtn.addEventListener('click', () => this.copyCdnLink());
        }

        // Copy CDN code
        const copyCdnCodeBtn = document.getElementById('copy-cdn-code');
        if (copyCdnCodeBtn) {
            copyCdnCodeBtn.addEventListener('click', () => this.copyCdnCode());
        }

        // Fullscreen preview
        const fullscreenBtn = document.getElementById('fullscreen-preview');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.openFullscreenPreview());
        }
    }

    /**
     * Setup preview controls
     */
    setupPreviewControls() {
        const previewButtons = document.querySelectorAll('.preview-btn');
        const previewFrame = document.getElementById('preview-frame');

        previewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.switchPreviewView(view);
                
                // Update active button
                previewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    /**
     * Switch preview view (desktop, tablet, mobile)
     */
    switchPreviewView(view) {
        const previewFrame = document.getElementById('preview-frame');
        if (!previewFrame) return;

        // Remove existing view classes
        previewFrame.classList.remove('desktop-view', 'tablet-view', 'mobile-view');
        
        // Add new view class
        previewFrame.classList.add(`${view}-view`);
        
        this.currentView = view;
    }

    /**
     * Setup integration tabs
     */
    setupIntegrationTabs() {
        const tabs = document.querySelectorAll('.integration-tab');
        const panels = document.querySelectorAll('.integration-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.getAttribute('data-tab');
                
                // Remove active from all tabs and panels
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active to clicked tab and corresponding panel
                tab.classList.add('active');
                const panel = document.getElementById(`${targetPanel}-panel`);
                if (panel) {
                    panel.classList.add('active');
                }
            });
        });

        // Update CDN code with actual template ID
        this.updateCdnCode();
    }

    /**
     * Update CDN code example
     */
    updateCdnCode() {
        const cdnCode = document.getElementById('cdn-code');
        if (!cdnCode || !this.currentTemplate) return;

        const templateId = this.currentTemplate.id;
        const code = `<!-- CSS -->
<link rel="stylesheet" href="https://cdn.templatehub.com/templates/${templateId}/style.css">

<!-- HTML Content -->
<div id="template-container"></div>

<!-- JavaScript -->
<script src="https://cdn.templatehub.com/templates/${templateId}/script.js"></script>`;

        cdnCode.textContent = code;
    }

    /**
     * Download template
     */
    downloadTemplate() {
        if (!this.currentTemplate) return;

        // Track download
        this.dataManager.trackDownload(this.currentTemplate.id);
        
        // Update download count
        this.currentTemplate.downloads = (this.currentTemplate.downloads || 0) + 1;
        this.dataManager.updateTemplate(this.currentTemplate.id, this.currentTemplate);
        
        // Update display
        this.updateElement('detail-downloads', this.currentTemplate.downloads);

        // Show download notification
        this.utils.showNotification('Template download started!', 'success');

        // In a real application, this would trigger actual file download
        console.log('Downloading template:', this.currentTemplate.name);
        
        // Simulate download
        setTimeout(() => {
            this.utils.showNotification('Template downloaded successfully!', 'success');
        }, 1500);
    }

    /**
     * Open live preview in new window
     */
    openLivePreview() {
        if (!this.currentTemplate) return;

        const previewUrl = this.currentTemplate.liveUrl || this.currentTemplate.preview;
        if (previewUrl && previewUrl !== '#') {
            window.open(previewUrl, '_blank');
        } else {
            this.utils.showNotification('Live preview not available for this template', 'warning');
        }
    }

    /**
     * Toggle favorite status
     */
    toggleFavorite() {
        // This would require user authentication
        this.utils.showNotification('Please sign in to add templates to favorites', 'info');
    }

    /**
     * Copy CDN link to clipboard
     */
    copyCdnLink() {
        if (!this.currentTemplate) return;

        const cdnUrl = `https://cdn.templatehub.com/templates/${this.currentTemplate.id}/`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(cdnUrl).then(() => {
                this.utils.showNotification('CDN link copied to clipboard!', 'success');
            });
        } else {
            // Fallback for older browsers
            this.utils.copyToClipboard(cdnUrl);
            this.utils.showNotification('CDN link copied to clipboard!', 'success');
        }
    }

    /**
     * Copy CDN code to clipboard
     */
    copyCdnCode() {
        const codeElement = document.getElementById('cdn-code');
        if (!codeElement) return;

        const code = codeElement.textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
                this.utils.showNotification('CDN code copied to clipboard!', 'success');
            });
        } else {
            this.utils.copyToClipboard(code);
            this.utils.showNotification('CDN code copied to clipboard!', 'success');
        }
    }

    /**
     * Open fullscreen preview
     */
    openFullscreenPreview() {
        const iframe = document.getElementById('template-iframe');
        if (!iframe) return;

        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
        }
    }

    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumb() {
        if (!this.currentTemplate) return;

        const categoryBreadcrumb = document.getElementById('category-breadcrumb');
        const templateBreadcrumb = document.getElementById('template-breadcrumb');

        if (categoryBreadcrumb) {
            categoryBreadcrumb.textContent = this.formatCategory(this.currentTemplate.category);
            categoryBreadcrumb.href = `index.html?category=${this.currentTemplate.category}`;
        }

        if (templateBreadcrumb) {
            templateBreadcrumb.textContent = this.currentTemplate.name;
        }
    }

    /**
     * Format category name for display
     */
    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    /**
     * Track template view
     */
    trackView() {
        if (!this.currentTemplate) return;

        // Update view count
        this.currentTemplate.views = (this.currentTemplate.views || 0) + 1;
        this.dataManager.updateTemplate(this.currentTemplate.id, this.currentTemplate);
        
        // Track analytics event
        this.dataManager.trackEvent('template_view', {
            templateId: this.currentTemplate.id,
            templateName: this.currentTemplate.name,
            category: this.currentTemplate.category,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Load related templates
     */
    loadRelatedTemplates() {
        if (!this.currentTemplate) return;

        const allTemplates = this.dataManager.getAllTemplates();
        const relatedTemplates = allTemplates
            .filter(template => 
                template.id !== this.currentTemplate.id && 
                (template.category === this.currentTemplate.category ||
                 this.hasCommonTags(template, this.currentTemplate))
            )
            .slice(0, 6);

        this.renderRelatedTemplates(relatedTemplates);
    }

    /**
     * Check if templates have common tags
     */
    hasCommonTags(template1, template2) {
        const tags1 = template1.tags || [];
        const tags2 = template2.tags || [];
        return tags1.some(tag => tags2.includes(tag));
    }

    /**
     * Render related templates
     */
    renderRelatedTemplates(templates) {
        const container = document.getElementById('related-templates-grid');
        if (!container) return;

        if (templates.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No related templates found.</p>';
            return;
        }

        container.innerHTML = templates.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-preview">
                    <img src="${template.preview}" alt="${template.name}" loading="lazy">
                    <div class="template-overlay">
                        <button class="btn btn-primary btn-sm preview-btn" onclick="window.location.href='template-detail.html?id=${template.id}'">
                            <i data-lucide="eye"></i>
                            View Details
                        </button>
                    </div>
                </div>
                <div class="template-info">
                    <div class="template-header">
                        <h3 class="template-title">${template.name}</h3>
                        <div class="template-meta">
                            <span class="template-category">${template.category}</span>
                            <span class="template-downloads">
                                <i data-lucide="download"></i>
                                ${template.downloads || 0}
                            </span>
                        </div>
                    </div>
                    <p class="template-description">${template.description}</p>
                    <div class="template-tags">
                        ${(template.tags || []).slice(0, 3).map(tag => 
                            `<span class="tag">${tag}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        lucide.createIcons();
    }
}

// Make TemplateDetail available globally
window.TemplateDetail = TemplateDetail;