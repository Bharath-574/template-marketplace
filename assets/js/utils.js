// Template Marketplace - Utility Functions
// Common utilities and helper functions

class Utils {
    // DOM manipulation utilities
    static $(selector) {
        return document.querySelector(selector);
    }
    
    static $$(selector) {
        return document.querySelectorAll(selector);
    }
    
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else if (key === 'textContent') {
                element.textContent = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }
    
    // Event handling utilities
    static on(element, event, handler, options = {}) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.addEventListener(event, handler, options);
        }
    }
    
    static off(element, event, handler) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            element.removeEventListener(event, handler);
        }
    }
    
    static trigger(element, eventName, data = {}) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (element) {
            const event = new CustomEvent(eventName, { detail: data });
            element.dispatchEvent(event);
        }
    }
    
    // Animation utilities
    static fadeIn(element, duration = 300) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = Date.now();
        const fade = () => {
            const elapsed = Date.now() - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = progress;
                requestAnimationFrame(fade);
            } else {
                element.style.opacity = '1';
            }
        };
        
        requestAnimationFrame(fade);
    }
    
    static fadeOut(element, duration = 300, callback = null) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (!element) return;
        
        const start = Date.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity) || 1;
        
        const fade = () => {
            const elapsed = Date.now() - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = initialOpacity * (1 - progress);
                requestAnimationFrame(fade);
            } else {
                element.style.opacity = '0';
                element.style.display = 'none';
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(fade);
    }
    
    static slideDown(element, duration = 300) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (!element) return;
        
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight + 'px';
        
        element.style.transition = `height ${duration}ms ease-out`;
        element.style.height = targetHeight;
        
        setTimeout(() => {
            element.style.height = 'auto';
            element.style.transition = '';
            element.style.overflow = '';
        }, duration);
    }
    
    static slideUp(element, duration = 300, callback = null) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (!element) return;
        
        const height = element.scrollHeight + 'px';
        element.style.height = height;
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.height = '0px';
        });
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.transition = '';
            element.style.overflow = '';
            if (callback) callback();
        }, duration);
    }
    
    // String utilities
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    static slugify(str) {
        return str
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    
    static truncate(str, length = 100) {
        if (str.length <= length) return str;
        return str.slice(0, length) + '...';
    }
    
    static escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // Date utilities
    static formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        switch (format) {
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MMM DD, YYYY':
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${months[d.getMonth()]} ${day}, ${year}`;
            default:
                return d.toLocaleDateString();
        }
    }
    
    static timeAgo(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffDays > 7) {
            return this.formatDate(date, 'MMM DD, YYYY');
        } else if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }
    
    // URL utilities
    static getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    
    static setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.replaceState({}, '', url);
    }
    
    static removeQueryParam(param) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        window.history.replaceState({}, '', url);
    }
    
    // File utilities
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    static downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Validation utilities
    static isEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    static isUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    static isValidPassword(password, minLength = 6) {
        return password && password.length >= minLength;
    }
    
    // Local storage utilities with error handling
    static storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Storage error:', error);
                return false;
            }
        },
        
        get(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (error) {
                console.error('Storage retrieval error:', error);
                return null;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Storage removal error:', error);
                return false;
            }
        },
        
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Storage clear error:', error);
                return false;
            }
        }
    };
    
    // Debounce utility
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }
    
    // Throttle utility
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Copy to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (fallbackError) {
                console.error('Copy failed:', fallbackError);
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }
    
    // Show notification
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = this.createElement('div', {
            className: `notification notification-${type}`,
            innerHTML: `
                <div class="notification-content">
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            `
        });
        
        document.body.appendChild(notification);
        
        // Add styles if not already added
        if (!this.$('#notification-styles')) {
            const styles = this.createElement('style', {
                id: 'notification-styles',
                innerHTML: `
                    .notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 1rem;
                        border-radius: 0.5rem;
                        color: white;
                        z-index: 10000;
                        transform: translateX(400px);
                        transition: transform 0.3s ease-out;
                        max-width: 400px;
                    }
                    .notification.show { transform: translateX(0); }
                    .notification-info { background: #3b82f6; }
                    .notification-success { background: #10b981; }
                    .notification-warning { background: #f59e0b; }
                    .notification-error { background: #ef4444; }
                    .notification-content { display: flex; align-items: center; justify-content: space-between; }
                    .notification-close { 
                        background: none; border: none; color: white; 
                        font-size: 1.2rem; cursor: pointer; margin-left: 1rem; 
                    }
                `
            });
            document.head.appendChild(styles);
        }
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto hide
        const hide = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };
        
        // Close button handler
        this.on(notification.querySelector('.notification-close'), 'click', hide);
        
        // Auto hide after duration
        setTimeout(hide, duration);
        
        return notification;
    }
    
    // Loading state management
    static showLoading(element, message = 'Loading...') {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (!element) return;
        
        const loadingHtml = `
            <div class="loading-overlay">
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        element.style.position = 'relative';
        element.insertAdjacentHTML('beforeend', loadingHtml);
        
        // Add styles if not already added
        if (!this.$('#loading-styles')) {
            const styles = this.createElement('style', {
                id: 'loading-styles',
                innerHTML: `
                    .loading-overlay {
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(255, 255, 255, 0.9);
                        display: flex; align-items: center; justify-content: center;
                        z-index: 100;
                    }
                    .loading-content { text-align: center; color: #6b7280; }
                    .loading-spinner {
                        width: 2rem; height: 2rem; margin: 0 auto 1rem;
                        border: 2px solid #e5e7eb;
                        border-top-color: #3b82f6;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `
            });
            document.head.appendChild(styles);
        }
    }
    
    static hideLoading(element) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        if (!element) return;
        
        const overlay = element.querySelector('.loading-overlay');
        if (overlay) {
            overlay.parentNode.removeChild(overlay);
        }
    }
    
    // Modal utilities
    static showModal(content, options = {}) {
        const modal = this.createElement('div', {
            className: 'modal-overlay',
            innerHTML: `
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>${options.title || 'Modal'}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-content">${content}</div>
                    ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
                </div>
            `
        });
        
        document.body.appendChild(modal);
        
        // Add modal styles if not already added
        if (!this.$('#modal-styles')) {
            const styles = this.createElement('style', {
                id: 'modal-styles',
                innerHTML: `
                    .modal-overlay {
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0, 0, 0, 0.5); z-index: 10000;
                        display: flex; align-items: center; justify-content: center;
                        padding: 1rem;
                    }
                    .modal-container {
                        background: white; border-radius: 0.75rem; max-width: 500px;
                        width: 100%; max-height: 80vh; overflow: hidden;
                    }
                    .modal-header {
                        display: flex; justify-content: space-between; align-items: center;
                        padding: 1.5rem; border-bottom: 1px solid #e5e7eb;
                    }
                    .modal-header h3 { margin: 0; color: #1f2937; }
                    .modal-close {
                        background: none; border: none; font-size: 1.5rem;
                        cursor: pointer; color: #6b7280;
                    }
                    .modal-content { padding: 1.5rem; overflow-y: auto; }
                    .modal-footer { padding: 1.5rem; border-top: 1px solid #e5e7eb; }
                `
            });
            document.head.appendChild(styles);
        }
        
        // Close handlers
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        this.on(modal.querySelector('.modal-close'), 'click', closeModal);
        this.on(modal, 'click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        return modal;
    }
}

// Make Utils globally available
window.Utils = Utils;