// Template Marketplace - Application Initializer
// Simple initialization for our actual components

(function() {
    'use strict';
    
    let isInitialized = false;
    
    function initializeApp() {
        if (isInitialized) return;
        
        try {
            // Check if core classes are available
            if (typeof DataManager === 'undefined' || typeof TemplateManager === 'undefined') {
                setTimeout(initializeApp, 100);
                return;
            }
            
            // Initialize DataManager
            if (!window.dataManager) {
                window.dataManager = new DataManager();
            }
            
            // Initialize TemplateManager
            if (!window.templateManager) {
                window.templateManager = new TemplateManager();
            }
            
            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            console.log('✅ Template Marketplace initialized successfully');
            isInitialized = true;
            
            // Show welcome notification
            setTimeout(() => {
                Utils.showNotification('Welcome to Template Marketplace!', 'success');
            }, 1000);
            
        } catch (error) {
            console.error('❌ Failed to initialize Template Marketplace:', error);
            Utils.showNotification('Failed to initialize application. Please refresh the page.', 'error');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
    
    // Global error handlers
    window.addEventListener('error', (event) => {
        console.error('Global JavaScript error:', event.error);
        Utils.showNotification('An unexpected error occurred. Please refresh the page if problems persist.', 'error');
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        Utils.showNotification('A network or processing error occurred. Please try again.', 'warning');
    });
    
})();