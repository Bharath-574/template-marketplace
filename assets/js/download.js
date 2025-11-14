// Template Marketplace - Enhanced Download System
// Handles multiple download formats, CDN integration, and download analytics

class DownloadManager {
    constructor() {
        this.downloadHistory = Utils.storage.get('tm_download_history') || [];
        this.downloadStats = Utils.storage.get('tm_download_stats') || {};
        
        this.init();
    }

    init() {
        this.bindDownloadEvents();
        this.setupDownloadTracking();
    }

    bindDownloadEvents() {
        // Enhanced download buttons with multiple options
        Utils.on(document, 'click', (e) => {
            if (e.target.matches('[data-action="download"]') || e.target.closest('[data-action="download"]')) {
                e.preventDefault();
                const btn = e.target.closest('[data-action="download"]');
                const templateId = btn.dataset.templateId;
                this.showDownloadOptions(templateId);
            }
        });
    }

    showDownloadOptions(templateId) {
        const template = DataManager.getTemplate(templateId);
        if (!template) {
            Utils.showNotification('Template not found', 'error');
            return;
        }

        const hasDownloadedBefore = this.hasUserDownloaded(templateId);
        
        const modalContent = `
            <div class="download-manager">
                <div class="template-header">
                    <div class="template-preview-mini">
                        <img src="${template.preview}" alt="${template.name}" class="preview-thumb">
                    </div>
                    <div class="template-info">
                        <h4>${template.name}</h4>
                        <p class="text-gray-600">${template.description}</p>
                        <div class="template-meta">
                            <span class="meta-item">
                                <i data-lucide="download"></i>
                                ${template.downloads || 0} downloads
                            </span>
                            <span class="meta-item">
                                <i data-lucide="star"></i>
                                ${template.rating || '4.5'}
                            </span>
                            <span class="meta-item">
                                <i data-lucide="file"></i>
                                ${template.size}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="download-options">
                    <h5>Choose Download Format</h5>
                    
                    <div class="download-format-grid">
                        <!-- ZIP Download -->
                        <div class="format-option" data-format="zip">
                            <div class="format-icon">
                                <i data-lucide="archive"></i>
                            </div>
                            <div class="format-info">
                                <h6>ZIP Archive</h6>
                                <p>Complete template files in a compressed archive</p>
                                <div class="format-details">
                                    <span class="detail-item">
                                        <i data-lucide="file"></i>
                                        ${template.files ? template.files.length : 3} files
                                    </span>
                                    <span class="detail-item">
                                        <i data-lucide="hard-drive"></i>
                                        ${template.size}
                                    </span>
                                </div>
                            </div>
                            <button class="btn btn-primary btn-download" data-template-id="${templateId}" data-method="zip">
                                <i data-lucide="download"></i>
                                Download ZIP
                            </button>
                        </div>

                        <!-- CDN Links -->
                        <div class="format-option" data-format="cdn">
                            <div class="format-icon">
                                <i data-lucide="link"></i>
                            </div>
                            <div class="format-info">
                                <h6>CDN Links</h6>
                                <p>Direct links to use in your projects</p>
                                <div class="format-details">
                                    <span class="detail-item">
                                        <i data-lucide="zap"></i>
                                        Instant setup
                                    </span>
                                    <span class="detail-item">
                                        <i data-lucide="globe"></i>
                                        Global CDN
                                    </span>
                                </div>
                            </div>
                            <button class="btn btn-accent btn-download" data-template-id="${templateId}" data-method="cdn">
                                <i data-lucide="copy"></i>
                                Copy Links
                            </button>
                        </div>

                        <!-- Code Snippet -->
                        <div class="format-option" data-format="snippet">
                            <div class="format-icon">
                                <i data-lucide="code"></i>
                            </div>
                            <div class="format-info">
                                <h6>Code Snippet</h6>
                                <p>Ready-to-use HTML/CSS code</p>
                                <div class="format-details">
                                    <span class="detail-item">
                                        <i data-lucide="copy"></i>
                                        Copy & paste
                                    </span>
                                    <span class="detail-item">
                                        <i data-lucide="edit"></i>
                                        Customizable
                                    </span>
                                </div>
                            </div>
                            <button class="btn btn-secondary btn-download" data-template-id="${templateId}" data-method="snippet">
                                <i data-lucide="clipboard"></i>
                                Copy Code
                            </button>
                        </div>

                        <!-- Live Demo -->
                        <div class="format-option" data-format="demo">
                            <div class="format-icon">
                                <i data-lucide="external-link"></i>
                            </div>
                            <div class="format-info">
                                <h6>Live Preview</h6>
                                <p>Open template in new browser tab</p>
                                <div class="format-details">
                                    <span class="detail-item">
                                        <i data-lucide="eye"></i>
                                        Interactive preview
                                    </span>
                                    <span class="detail-item">
                                        <i data-lucide="smartphone"></i>
                                        Mobile responsive
                                    </span>
                                </div>
                            </div>
                            <button class="btn btn-warning btn-download" data-template-id="${templateId}" data-method="demo">
                                <i data-lucide="play"></i>
                                Open Demo
                            </button>
                        </div>
                    </div>

                    ${this.generateQuickStartGuide(template)}
                </div>

                ${hasDownloadedBefore ? this.getDownloadHistory(templateId) : ''}
            </div>
        `;

        const modal = Utils.showModal(modalContent, {
            title: 'Download Template'
        });

        this.bindDownloadModalEvents(modal, templateId);
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    bindDownloadModalEvents(modal, templateId) {
        const downloadButtons = modal.querySelectorAll('.btn-download');
        
        downloadButtons.forEach(btn => {
            Utils.on(btn, 'click', () => {
                const method = btn.dataset.method;
                this.executeDownload(templateId, method);
                
                // Keep modal open for additional downloads
                Utils.showNotification(`Download started: ${method.toUpperCase()}`, 'success');
            });
        });

        // Format option selection highlighting
        const formatOptions = modal.querySelectorAll('.format-option');
        formatOptions.forEach(option => {
            Utils.on(option, 'click', (e) => {
                if (!e.target.matches('button') && !e.target.closest('button')) {
                    // Highlight selected format
                    formatOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    
                    // Trigger the download button
                    const downloadBtn = option.querySelector('.btn-download');
                    if (downloadBtn) {
                        downloadBtn.focus();
                    }
                }
            });
        });
    }

    async executeDownload(templateId, method) {
        const template = DataManager.getTemplate(templateId);
        if (!template) return;

        // Track download
        this.trackDownload(templateId, method);
        
        // Update template download count
        DataManager.incrementDownload(templateId);

        switch (method) {
            case 'zip':
                await this.downloadZip(template);
                break;
            case 'cdn':
                await this.copyCdnLinks(template);
                break;
            case 'snippet':
                await this.copyCodeSnippet(template);
                break;
            case 'demo':
                this.openDemo(template);
                break;
        }
    }

    async downloadZip(template) {
        try {
            // In a real implementation, this would create and download a ZIP file
            // For now, we'll simulate by opening the template and showing instructions
            
            const zipContent = await this.generateZipContent(template);
            
            if (zipContent) {
                // Create a blob and download
                const blob = new Blob([zipContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                Utils.downloadFile(url, `${this.getTemplateSlug(template.name)}.html`);
                URL.revokeObjectURL(url);
                
                Utils.showNotification('ZIP download started!', 'success');
            } else {
                // Fallback: open template directly
                window.open(template.demoUrl, '_blank');
                Utils.showNotification('Template opened in new tab. Right-click and "Save As" to download.', 'info');
            }
        } catch (error) {
            console.error('Download error:', error);
            Utils.showNotification('Download failed. Opening template in new tab.', 'warning');
            window.open(template.demoUrl, '_blank');
        }
    }

    async generateZipContent(template) {
        // In a real implementation, this would fetch the actual template files
        // For now, generate a sample HTML file with instructions
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name} - Template</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .header { text-align: center; margin-bottom: 2rem; }
        .info { background: #f0f9ff; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; }
        .technologies { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .tech-tag { background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; }
        .links { margin-top: 2rem; }
        .link { display: inline-block; margin: 0.5rem 1rem 0.5rem 0; padding: 0.5rem 1rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 0.25rem; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template.name}</h1>
        <p>${template.description}</p>
    </div>
    
    <div class="info">
        <h3>Template Information</h3>
        <p><strong>Category:</strong> ${template.category}</p>
        <p><strong>Difficulty:</strong> ${template.difficulty}</p>
        <p><strong>Downloads:</strong> ${template.downloads || 0}</p>
        <p><strong>Rating:</strong> ${template.rating || '4.5'} ⭐</p>
        
        <h4>Technologies Used:</h4>
        <div class="technologies">
            ${template.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        
        <h4>Tags:</h4>
        <div class="technologies">
            ${template.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
        </div>
    </div>
    
    <div class="info">
        <h3>Quick Start Guide</h3>
        <ol>
            <li>Extract this template to your project directory</li>
            <li>Open the main HTML file in your browser or code editor</li>
            <li>Customize the content, colors, and styling to match your needs</li>
            <li>Replace placeholder images and text with your own content</li>
            <li>Test the template on different devices and browsers</li>
        </ol>
    </div>
    
    <div class="links">
        <a href="${template.demoUrl}" class="link" target="_blank">View Live Demo</a>
        <a href="${template.cdnUrl}" class="link" target="_blank">CDN Version</a>
        <a href="https://templatehub.com" class="link" target="_blank">More Templates</a>
    </div>
    
    <div class="info">
        <h3>Need Help?</h3>
        <p>Visit our documentation or community forums for support and customization tips.</p>
    </div>
</body>
</html>`;
    }

    async copyCdnLinks(template) {
        const cdnLinks = this.generateCdnLinks(template);
        const success = await Utils.copyToClipboard(cdnLinks);
        
        if (success) {
            Utils.showNotification('CDN links copied to clipboard!', 'success');
            this.showCdnLinksModal(template, cdnLinks);
        } else {
            Utils.showNotification('Failed to copy links', 'error');
        }
    }

    generateCdnLinks(template) {
        return `<!-- ${template.name} CDN Links -->
<!-- Add these to your HTML <head> section -->

<!-- Stylesheet -->
<link rel="stylesheet" href="${template.cdnUrl}style.css">

<!-- JavaScript (if applicable) -->
<script src="${template.cdnUrl}script.js"></script>

<!-- Font dependencies -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Icons (Lucide) -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

<!-- Template Usage -->
<!-- Copy the HTML structure from: ${template.demoUrl} -->`;
    }

    showCdnLinksModal(template, cdnLinks) {
        const modalContent = `
            <div class="cdn-links-modal">
                <h4>CDN Links for ${template.name}</h4>
                <p class="text-gray-600 mb-4">Copy these links to use the template via CDN:</p>
                
                <div class="code-block">
                    <pre><code>${Utils.escapeHtml(cdnLinks)}</code></pre>
                    <button class="copy-btn btn btn-sm btn-secondary" data-copy-text="${Utils.escapeHtml(cdnLinks)}">
                        <i data-lucide="copy"></i>
                        Copy Again
                    </button>
                </div>
                
                <div class="cdn-benefits mt-4">
                    <h5>Benefits of Using CDN:</h5>
                    <ul>
                        <li>⚡ Fast global delivery</li>
                        <li>🔄 Always up-to-date</li>
                        <li>💾 No local file management</li>
                        <li>📱 Optimized for mobile</li>
                    </ul>
                </div>
            </div>
        `;

        const modal = Utils.showModal(modalContent, {
            title: 'CDN Integration'
        });

        // Bind copy button
        const copyBtn = modal.querySelector('.copy-btn');
        Utils.on(copyBtn, 'click', async () => {
            const text = copyBtn.dataset.copyText;
            const success = await Utils.copyToClipboard(text);
            if (success) {
                Utils.showNotification('Links copied again!', 'success');
            }
        });

        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    async copyCodeSnippet(template) {
        const codeSnippet = await this.generateCodeSnippet(template);
        const success = await Utils.copyToClipboard(codeSnippet);
        
        if (success) {
            Utils.showNotification('Code snippet copied!', 'success');
            this.showCodeSnippetModal(template, codeSnippet);
        } else {
            Utils.showNotification('Failed to copy code', 'error');
        }
    }

    async generateCodeSnippet(template) {
        // Generate a sample code snippet based on template type
        const snippets = {
            'landing-pages': this.generateLandingPageSnippet(template),
            'login-forms': this.generateLoginFormSnippet(template),
            'registration-forms': this.generateRegistrationFormSnippet(template),
            'ecommerce': this.generateEcommerceSnippet(template),
            'dashboards': this.generateDashboardSnippet(template),
            'portfolios': this.generatePortfolioSnippet(template),
            'blogs': this.generateBlogSnippet(template),
            'pricing': this.generatePricingSnippet(template)
        };

        return snippets[template.category] || this.generateGenericSnippet(template);
    }

    generateLandingPageSnippet(template) {
        return `<!-- ${template.name} Landing Page Template -->
<section class="hero">
    <div class="container">
        <h1 class="hero-title">Your Amazing Product</h1>
        <p class="hero-subtitle">Transform your business with our innovative solution</p>
        <div class="hero-actions">
            <a href="#" class="btn btn-primary">Get Started</a>
            <a href="#" class="btn btn-outline">Learn More</a>
        </div>
    </div>
</section>

<style>
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
}

.hero-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn {
    padding: 0.75rem 2rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #ffffff;
    color: #667eea;
}

.btn-outline {
    border: 2px solid #ffffff;
    color: #ffffff;
    background: transparent;
}
</style>`;
    }

    generateLoginFormSnippet(template) {
        return `<!-- ${template.name} Login Form Template -->
<div class="login-container">
    <div class="login-form">
        <h2>Welcome Back</h2>
        <form>
            <div class="form-group">
                <input type="email" placeholder="Email address" required>
            </div>
            <div class="form-group">
                <input type="password" placeholder="Password" required>
            </div>
            <div class="form-options">
                <label>
                    <input type="checkbox"> Remember me
                </label>
                <a href="#">Forgot password?</a>
            </div>
            <button type="submit" class="btn-login">Sign In</button>
        </form>
    </div>
</div>

<style>
.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f7fafc;
}

.login-form {
    background: white;
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 400px;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 1rem;
}

.btn-login {
    width: 100%;
    padding: 0.75rem;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
}
</style>`;
    }

    generateGenericSnippet(template) {
        return `<!-- ${template.name} Template -->
<!-- Add this HTML to your page -->

<div class="template-container">
    <h2>${template.name}</h2>
    <p>${template.description}</p>
    
    <!-- Add your content here -->
    <div class="content">
        <!-- Template content goes here -->
    </div>
</div>

<style>
.template-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
}

.template-container h2 {
    color: #1a202c;
    margin-bottom: 1rem;
}

.content {
    background: #f7fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
}
</style>

<script>
// Add any JavaScript functionality here
console.log('${template.name} template loaded');
</script>`;
    }

    showCodeSnippetModal(template, codeSnippet) {
        const modalContent = `
            <div class="code-snippet-modal">
                <h4>Code Snippet: ${template.name}</h4>
                <p class="text-gray-600 mb-4">Ready-to-use HTML, CSS, and JavaScript code:</p>
                
                <div class="code-container">
                    <div class="code-header">
                        <span class="code-lang">HTML/CSS</span>
                        <button class="copy-code-btn btn btn-sm btn-secondary" data-code="${Utils.escapeHtml(codeSnippet)}">
                            <i data-lucide="copy"></i>
                            Copy Code
                        </button>
                    </div>
                    <pre class="code-block"><code>${Utils.escapeHtml(codeSnippet)}</code></pre>
                </div>
                
                <div class="usage-instructions mt-4">
                    <h5>How to use:</h5>
                    <ol>
                        <li>Copy the code above</li>
                        <li>Paste it into your HTML file</li>
                        <li>Customize the content and styling</li>
                        <li>Add your own images and text</li>
                    </ol>
                </div>
            </div>
        `;

        const modal = Utils.showModal(modalContent, {
            title: 'Code Snippet'
        });

        // Bind copy button
        const copyBtn = modal.querySelector('.copy-code-btn');
        Utils.on(copyBtn, 'click', async () => {
            const code = copyBtn.dataset.code;
            const success = await Utils.copyToClipboard(code);
            if (success) {
                Utils.showNotification('Code copied to clipboard!', 'success');
            }
        });

        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    openDemo(template) {
        window.open(template.demoUrl, '_blank');
        Utils.showNotification(`Opening ${template.name} demo...`, 'info');
    }

    trackDownload(templateId, method) {
        const download = {
            templateId,
            method,
            timestamp: new Date().toISOString(),
            userId: this.getCurrentUserId()
        };

        this.downloadHistory.unshift(download);
        this.downloadHistory = this.downloadHistory.slice(0, 100); // Keep last 100 downloads
        
        // Update stats
        if (!this.downloadStats[templateId]) {
            this.downloadStats[templateId] = {
                totalDownloads: 0,
                methods: {}
            };
        }
        
        this.downloadStats[templateId].totalDownloads++;
        this.downloadStats[templateId].methods[method] = (this.downloadStats[templateId].methods[method] || 0) + 1;
        
        // Save to storage
        Utils.storage.set('tm_download_history', this.downloadHistory);
        Utils.storage.set('tm_download_stats', this.downloadStats);
        
        // Update analytics
        const analytics = DataManager.getAnalytics();
        analytics.totalDownloads = (analytics.totalDownloads || 0) + 1;
        DataManager.updateAnalytics(analytics);
    }

    hasUserDownloaded(templateId) {
        return this.downloadHistory.some(download => download.templateId === templateId);
    }

    getDownloadHistory(templateId) {
        const userDownloads = this.downloadHistory.filter(download => download.templateId === templateId);
        
        if (userDownloads.length === 0) return '';
        
        return `
            <div class="download-history mt-4">
                <h5>Your Download History</h5>
                <div class="history-list">
                    ${userDownloads.slice(0, 5).map(download => `
                        <div class="history-item">
                            <span class="method-badge">${download.method.toUpperCase()}</span>
                            <span class="download-date">${Utils.timeAgo(download.timestamp)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateQuickStartGuide(template) {
        const guides = {
            'landing-pages': [
                'Replace hero image and text with your content',
                'Update contact information and social links',
                'Customize colors to match your brand',
                'Add your own sections and features'
            ],
            'login-forms': [
                'Connect form to your authentication system',
                'Update validation rules as needed',
                'Customize styling and branding',
                'Add social login options if required'
            ],
            'ecommerce': [
                'Replace product images and information',
                'Connect to your payment system',
                'Update product categories and filters',
                'Customize shopping cart functionality'
            ]
        };

        const steps = guides[template.category] || [
            'Download or copy the template files',
            'Customize content and styling',
            'Replace placeholder images and text',
            'Test across different devices'
        ];

        return `
            <div class="quick-start mt-4">
                <h5>Quick Start Guide</h5>
                <ol class="start-steps">
                    ${steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        `;
    }

    getCurrentUserId() {
        let userId = Utils.storage.get('tm_user_id');
        if (!userId) {
            userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            Utils.storage.set('tm_user_id', userId);
        }
        return userId;
    }

    getTemplateSlug(name) {
        return name.toLowerCase()
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/(^-|-$)/g, '');
    }

    setupDownloadTracking() {
        // Track popular download methods
        Utils.on(window, 'beforeunload', () => {
            // Save any pending analytics
            this.saveDownloadAnalytics();
        });
    }

    saveDownloadAnalytics() {
        // Calculate popular methods
        const methodStats = {};
        Object.values(this.downloadStats).forEach(stats => {
            Object.entries(stats.methods || {}).forEach(([method, count]) => {
                methodStats[method] = (methodStats[method] || 0) + count;
            });
        });

        Utils.storage.set('tm_method_stats', methodStats);
    }

    getPopularDownloadMethods() {
        const methodStats = Utils.storage.get('tm_method_stats') || {};
        return Object.entries(methodStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);
    }
}

// Initialize download manager
window.DownloadManager = DownloadManager;