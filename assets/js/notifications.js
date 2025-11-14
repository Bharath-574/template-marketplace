// Template Marketplace - Notification System
// Handles toast notifications, alerts, and user feedback

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.defaultDuration = 4000;
        this.container = null;
        
        this.init();
    }

    init() {
        this.createContainer();
        this.bindEvents();
    }

    createContainer() {
        // Remove existing container if it exists
        const existing = document.getElementById('notification-container');
        if (existing) {
            existing.remove();
        }

        this.container = Utils.createElement('div', {
            id: 'notification-container',
            className: 'notification-container'
        });

        document.body.appendChild(this.container);

        // Add styles
        this.addStyles();
    }

    addStyles() {
        const styleId = 'notification-styles';
        if (document.getElementById(styleId)) return;

        const styles = Utils.createElement('style', {
            id: styleId,
            innerHTML: `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    max-width: 400px;
                    pointer-events: none;
                }

                .notification {
                    background: white;
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    transform: translateX(calc(100% + 20px));
                    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                    pointer-events: auto;
                    max-width: 100%;
                }

                .notification.show {
                    transform: translateX(0);
                }

                .notification.hide {
                    transform: translateX(calc(100% + 20px));
                    opacity: 0;
                }

                .notification-header {
                    padding: 1rem 1rem 0.5rem;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                }

                .notification-icon {
                    flex-shrink: 0;
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 0.125rem;
                }

                .notification-icon i {
                    width: 1.25rem;
                    height: 1.25rem;
                }

                .notification.success .notification-icon {
                    background: #dcfce7;
                    color: #16a34a;
                }

                .notification.error .notification-icon {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .notification.warning .notification-icon {
                    background: #fef3c7;
                    color: #d97706;
                }

                .notification.info .notification-icon {
                    background: #dbeafe;
                    color: #2563eb;
                }

                .notification-content {
                    flex: 1;
                    min-width: 0;
                }

                .notification-title {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 0.25rem;
                    line-height: 1.25;
                }

                .notification-message {
                    color: #6b7280;
                    font-size: 0.875rem;
                    line-height: 1.4;
                    word-wrap: break-word;
                }

                .notification-actions {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                }

                .notification-btn {
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.375rem;
                    border: none;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .notification-btn-primary {
                    background: #3b82f6;
                    color: white;
                }

                .notification-btn-primary:hover {
                    background: #2563eb;
                }

                .notification-btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .notification-btn-secondary:hover {
                    background: #e5e7eb;
                }

                .notification-close {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                    transition: color 0.15s ease;
                }

                .notification-close:hover {
                    color: #6b7280;
                }

                .notification-progress {
                    height: 3px;
                    background: #f3f4f6;
                    position: relative;
                    overflow: hidden;
                }

                .notification-progress-bar {
                    height: 100%;
                    width: 100%;
                    transform: translateX(-100%);
                    transition: transform linear;
                }

                .notification.success .notification-progress-bar {
                    background: #16a34a;
                }

                .notification.error .notification-progress-bar {
                    background: #dc2626;
                }

                .notification.warning .notification-progress-bar {
                    background: #d97706;
                }

                .notification.info .notification-progress-bar {
                    background: #2563eb;
                }

                /* Mobile responsiveness */
                @media (max-width: 640px) {
                    .notification-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }

                    .notification {
                        transform: translateY(-calc(100% + 10px));
                    }

                    .notification.show {
                        transform: translateY(0);
                    }

                    .notification.hide {
                        transform: translateY(-calc(100% + 10px));
                    }
                }

                /* Animation for stacking notifications */
                .notification:not(:last-child) {
                    margin-bottom: 0.75rem;
                }
            `
        });

        document.head.appendChild(styles);
    }

    bindEvents() {
        // Handle click outside to dismiss notifications
        Utils.on(document, 'click', (e) => {
            if (!e.target.closest('.notification')) {
                // Optionally auto-dismiss on outside click
                // this.dismissAll();
            }
        });

        // Handle escape key to dismiss all
        Utils.on(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.dismissAll();
            }
        });
    }

    show(message, type = 'info', options = {}) {
        const notification = this.createNotification(message, type, options);
        this.addNotification(notification);
        return notification;
    }

    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', {
            duration: 6000,
            ...options
        });
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    createNotification(message, type, options) {
        const {
            title = this.getDefaultTitle(type),
            duration = this.defaultDuration,
            actions = [],
            persistent = false,
            showProgress = true,
            icon = this.getDefaultIcon(type),
            id = Utils.generateId()
        } = options;

        const notification = Utils.createElement('div', {
            className: `notification ${type}`,
            'data-id': id
        });

        // Build notification content
        let actionsHtml = '';
        if (actions.length > 0) {
            const actionButtons = actions.map(action => `
                <button class="notification-btn notification-btn-${action.type || 'secondary'}" 
                        data-action="${action.action}">
                    ${action.label}
                </button>
            `).join('');
            actionsHtml = `<div class="notification-actions">${actionButtons}</div>`;
        }

        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="notification-content">
                    ${title ? `<div class="notification-title">${title}</div>` : ''}
                    <div class="notification-message">${message}</div>
                    ${actionsHtml}
                </div>
            </div>
            ${!persistent ? '<button class="notification-close"><i data-lucide="x"></i></button>' : ''}
            ${showProgress && !persistent ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;

        // Bind events
        this.bindNotificationEvents(notification, duration, persistent, actions);

        // Initialize icons
        if (window.lucide) {
            lucide.createIcons();
        }

        return {
            id,
            element: notification,
            type,
            message,
            dismiss: () => this.dismiss(id)
        };
    }

    bindNotificationEvents(notification, duration, persistent, actions) {
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            Utils.on(closeBtn, 'click', () => {
                this.dismiss(notification.dataset.id);
            });
        }

        // Action buttons
        const actionBtns = notification.querySelectorAll('[data-action]');
        actionBtns.forEach(btn => {
            Utils.on(btn, 'click', () => {
                const actionName = btn.dataset.action;
                const action = actions.find(a => a.action === actionName);
                if (action && action.handler) {
                    action.handler();
                }
                
                // Auto-dismiss after action unless specified otherwise
                if (!action || action.dismissAfter !== false) {
                    this.dismiss(notification.dataset.id);
                }
            });
        });

        // Auto-dismiss timer
        if (!persistent && duration > 0) {
            const progressBar = notification.querySelector('.notification-progress-bar');
            if (progressBar) {
                progressBar.style.transitionDuration = `${duration}ms`;
                setTimeout(() => {
                    progressBar.style.transform = 'translateX(0)';
                }, 50);
            }

            setTimeout(() => {
                this.dismiss(notification.dataset.id);
            }, duration);
        }

        // Pause on hover
        if (!persistent) {
            let timeoutId;
            
            Utils.on(notification, 'mouseenter', () => {
                const progressBar = notification.querySelector('.notification-progress-bar');
                if (progressBar) {
                    progressBar.style.animationPlayState = 'paused';
                }
            });

            Utils.on(notification, 'mouseleave', () => {
                const progressBar = notification.querySelector('.notification-progress-bar');
                if (progressBar) {
                    progressBar.style.animationPlayState = 'running';
                }
            });
        }
    }

    addNotification(notification) {
        // Limit number of notifications
        while (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            this.dismiss(oldest.id, false);
        }

        this.notifications.push(notification);
        this.container.appendChild(notification.element);

        // Trigger show animation
        setTimeout(() => {
            notification.element.classList.add('show');
        }, 50);

        return notification;
    }

    dismiss(id, removeFromArray = true) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        notification.element.classList.add('hide');
        
        setTimeout(() => {
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }
        }, 300);

        if (removeFromArray) {
            const index = this.notifications.findIndex(n => n.id === id);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }
    }

    dismissAll() {
        this.notifications.forEach(notification => {
            this.dismiss(notification.id, false);
        });
        this.notifications = [];
    }

    getDefaultTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type];
    }

    getDefaultIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        return icons[type] || 'bell';
    }

    // Predefined notification types for common use cases
    downloadStarted(templateName) {
        return this.success(`Download started: ${templateName}`, {
            title: 'Download Started',
            icon: 'download'
        });
    }

    downloadComplete(templateName) {
        return this.success(`${templateName} downloaded successfully!`, {
            title: 'Download Complete',
            icon: 'check-circle'
        });
    }

    loginSuccess(userName) {
        return this.success(`Welcome back, ${userName}!`, {
            title: 'Login Successful',
            icon: 'user'
        });
    }

    loginError(message = 'Invalid credentials') {
        return this.error(message, {
            title: 'Login Failed',
            icon: 'alert-circle'
        });
    }

    registrationSuccess(userName) {
        return this.success(`Welcome to TemplateHub, ${userName}!`, {
            title: 'Account Created',
            icon: 'user-plus'
        });
    }

    ratingSubmitted() {
        return this.success('Thank you for your rating!', {
            title: 'Rating Submitted',
            icon: 'star'
        });
    }

    networkError() {
        return this.error('Please check your internet connection and try again.', {
            title: 'Network Error',
            icon: 'wifi-off',
            duration: 6000
        });
    }

    featureComingSoon(feature = 'This feature') {
        return this.info(`${feature} is coming soon!`, {
            title: 'Coming Soon',
            icon: 'clock'
        });
    }

    confirmAction(message, onConfirm, onCancel) {
        return this.warning(message, {
            title: 'Confirm Action',
            persistent: true,
            showProgress: false,
            actions: [
                {
                    label: 'Confirm',
                    type: 'primary',
                    action: 'confirm',
                    handler: onConfirm
                },
                {
                    label: 'Cancel',
                    type: 'secondary',
                    action: 'cancel',
                    handler: onCancel
                }
            ]
        });
    }

    // Update existing Utils.showNotification to use this system
    static replaceUtilsNotification() {
        if (window.Utils) {
            const notificationManager = new NotificationManager();
            
            Utils.showNotification = (message, type = 'info', duration = 4000) => {
                return notificationManager.show(message, type, { duration });
            };
        }
    }
}

// Initialize notification manager and replace Utils.showNotification
const notificationManager = new NotificationManager();
NotificationManager.replaceUtilsNotification();

// Make NotificationManager globally available
window.NotificationManager = notificationManager;