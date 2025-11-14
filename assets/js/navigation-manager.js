// Navigation Manager - Handles all internal routing and link functionality
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.setupNavigationHandlers();
        this.setupSmoothScrolling();
        this.setupActiveLinks();
        this.handleSpecialRoutes();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '');
    }

    setupNavigationHandlers() {
        // Handle all internal navigation links
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip external links and mailto/tel links
            if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) {
                return;
            }

            // Skip anchor links for now
            if (href.startsWith('#')) {
                this.setupAnchorLink(link);
                return;
            }

            // Handle internal page links
            link.addEventListener('click', (e) => {
                this.handleInternalLink(e, href);
            });
        });
    }

    setupAnchorLink(link) {
        const href = link.getAttribute('href');
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (href === '#') {
                return;
            }

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                this.smoothScrollTo(targetElement);
                
                // Update URL without triggering page reload
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        });
    }

    handleInternalLink(e, href) {
        // Check if file exists before navigating
        this.checkFileExists(href).then(exists => {
            if (!exists) {
                e.preventDefault();
                this.showNotFoundMessage(href);
            } else {
                // Allow normal navigation
                this.showLoadingState();
            }
        });
    }

    async checkFileExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    showNotFoundMessage(href) {
        const message = `Page "${href}" is not available yet. This would be implemented in the full version.`;
        
        if (window.notificationManager) {
            window.notificationManager.info(message, {
                title: 'Page Not Available',
                duration: 5000
            });
        } else {
            alert(message);
        }
    }

    showLoadingState() {
        // Show loading indicator during page transitions
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'page-loading';
        loadingDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div class="spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
            </div>
        `;
        
        document.body.appendChild(loadingDiv);
        
        // Remove loading state after a short delay
        setTimeout(() => {
            if (document.getElementById('page-loading')) {
                document.getElementById('page-loading').remove();
            }
        }, 500);
    }

    setupSmoothScrolling() {
        // Add smooth scrolling to the document
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    setupActiveLinks() {
        // Highlight active navigation links
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('nav .nav-link, .header nav a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (href && (currentPath.includes(href) || (href === '#' && currentPath.includes('index')))) {
                link.classList.add('active');
            }
        });
    }

    handleSpecialRoutes() {
        // Handle special application routes and actions
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.getAttribute('data-action');
            this.executeAction(action, target, e);
        });
    }

    executeAction(action, element, event) {
        event.preventDefault();
        
        switch (action) {
            case 'manage-collections':
                this.showCollectionsModal();
                break;
            
            case 'show-favorites':
                this.showFavorites();
                break;
                
            case 'show-analytics':
                this.showAnalytics();
                break;
                
            case 'logout':
                this.handleLogout();
                break;
                
            case 'show-user-menu':
                this.showUserMenu(element);
                break;
                
            default:
                console.warn('Unknown action:', action);
        }
    }

    showCollectionsModal() {
        if (window.favoritesManager) {
            const favorites = window.favoritesManager.getFavorites();
            const modal = this.createModal('My Collections', this.renderCollections(favorites));
            document.body.appendChild(modal);
        } else {
            this.showNotFoundMessage('Collections feature');
        }
    }

    renderCollections(favorites) {
        if (favorites.length === 0) {
            return `
                <div class="text-center py-8">
                    <i data-lucide="heart" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
                    <h3 class="text-lg font-medium mb-2">No favorites yet</h3>
                    <p class="text-gray-600">Start browsing templates and add some to your favorites!</p>
                    <button onclick="this.closest('.modal').remove()" class="btn btn-primary mt-4">
                        Browse Templates
                    </button>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${favorites.map(templateId => {
                    const template = window.dataManager?.getTemplateById(templateId);
                    if (!template) return '';
                    
                    return `
                        <div class="template-card">
                            <img src="${template.preview}" alt="${template.title}" class="template-preview">
                            <div class="template-info">
                                <h4>${template.title}</h4>
                                <p>${template.description}</p>
                                <div class="template-actions">
                                    <button onclick="window.open('${template.demoUrl}', '_blank')" class="btn btn-sm btn-outline">
                                        Preview
                                    </button>
                                    <button onclick="window.downloadManager?.downloadTemplate('${template.id}')" class="btn btn-sm btn-primary">
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    showFavorites() {
        window.location.hash = '#favorites';
        // This would filter templates to show only favorites
        if (window.templateManager && window.favoritesManager) {
            const favorites = window.favoritesManager.getFavorites();
            const templates = favorites.map(id => window.dataManager?.getTemplateById(id)).filter(Boolean);
            window.templateManager.renderTemplates(templates);
        }
    }

    showAnalytics() {
        if (window.analyticsDashboard) {
            window.analyticsDashboard.show();
        } else {
            this.showNotFoundMessage('Analytics dashboard');
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('user');
            localStorage.removeItem('tm_current_user');
            window.location.reload();
        }
    }

    showUserMenu(element) {
        // Create and show user dropdown menu
        const existingMenu = document.querySelector('.user-menu-dropdown');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        const dropdown = document.createElement('div');
        dropdown.className = 'user-menu-dropdown';
        dropdown.innerHTML = `
            <div style="
                position: absolute;
                top: 100%;
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                min-width: 200px;
                margin-top: 8px;
            ">
                <div style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
                    <div style="font-weight: 600;">${user.name || 'User'}</div>
                    <div style="font-size: 0.875rem; color: #6b7280;">${user.email || 'user@example.com'}</div>
                </div>
                <div style="padding: 8px 0;">
                    <a href="#" data-action="show-favorites" style="display: flex; align-items: center; padding: 8px 16px; text-decoration: none; color: #374151;">
                        <i data-lucide="heart" style="width: 16px; height: 16px; margin-right: 12px;"></i>
                        My Favorites
                    </a>
                    <a href="#" data-action="manage-collections" style="display: flex; align-items: center; padding: 8px 16px; text-decoration: none; color: #374151;">
                        <i data-lucide="folder" style="width: 16px; height: 16px; margin-right: 12px;"></i>
                        Collections
                    </a>
                    <a href="#" data-action="show-analytics" style="display: flex; align-items: center; padding: 8px 16px; text-decoration: none; color: #374151;">
                        <i data-lucide="bar-chart-3" style="width: 16px; height: 16px; margin-right: 12px;"></i>
                        Analytics
                    </a>
                    <div style="border-top: 1px solid #e5e7eb; margin: 8px 0;"></div>
                    <a href="#" data-action="logout" style="display: flex; align-items: center; padding: 8px 16px; text-decoration: none; color: #dc2626;">
                        <i data-lucide="log-out" style="width: 16px; height: 16px; margin-right: 12px;"></i>
                        Logout
                    </a>
                </div>
            </div>
        `;

        element.style.position = 'relative';
        element.appendChild(dropdown);
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!dropdown.contains(e.target) && !element.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl max-w-4xl w-full max-h-90vh overflow-hidden">
                    <div class="flex justify-between items-center p-6 border-b">
                        <h3 class="text-2xl font-bold">${title}</h3>
                        <button onclick="this.closest('.modal').remove()" class="text-gray-500 hover:text-gray-700">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="p-6 overflow-y-auto" style="max-height: 70vh;">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        // Re-initialize icons
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 0);
        
        return modal;
    }
}

// Auto-initialize navigation manager
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Add required CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .user-menu-dropdown {
        position: relative;
    }
    
    .template-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        transition: transform 0.2s ease;
    }
    
    .template-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .template-preview {
        width: 100%;
        height: 120px;
        object-fit: cover;
    }
    
    .template-info {
        padding: 16px;
    }
    
    .template-info h4 {
        margin: 0 0 8px 0;
        font-weight: 600;
    }
    
    .template-info p {
        margin: 0 0 12px 0;
        color: #6b7280;
        font-size: 0.875rem;
    }
    
    .template-actions {
        display: flex;
        gap: 8px;
    }
`;
document.head.appendChild(style);