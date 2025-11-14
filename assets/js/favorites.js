// Template Marketplace - Favorites System
// Handles template bookmarking, favorites, and personal collections

class FavoritesManager {
    constructor() {
        this.favorites = Utils.storage.get('tm_favorites') || [];
        this.collections = Utils.storage.get('tm_collections') || [];
        this.defaultCollections = ['Favorites', 'To Review', 'For Projects'];
        
        this.init();
    }

    init() {
        this.initializeDefaultCollections();
        this.bindEvents();
        this.updateFavoriteButtons();
    }

    initializeDefaultCollections() {
        if (this.collections.length === 0) {
            this.defaultCollections.forEach(name => {
                this.createCollection(name, '', true);
            });
        }
    }

    bindEvents() {
        // Handle favorite button clicks
        Utils.on(document, 'click', (e) => {
            if (e.target.matches('.favorite-btn') || e.target.closest('.favorite-btn')) {
                e.preventDefault();
                e.stopPropagation();
                
                const btn = e.target.closest('.favorite-btn') || e.target;
                const templateId = btn.dataset.templateId;
                
                if (templateId) {
                    this.toggleFavorite(templateId);
                }
            }
        });

        // Handle collection management
        Utils.on(document, 'click', (e) => {
            if (e.target.matches('[data-action="manage-collections"]') || e.target.closest('[data-action="manage-collections"]')) {
                e.preventDefault();
                this.showCollectionsModal();
            }
        });
    }

    toggleFavorite(templateId) {
        const template = DataManager.getTemplate(templateId);
        if (!template) return;

        const isFavorited = this.isFavorite(templateId);
        
        if (isFavorited) {
            this.removeFavorite(templateId);
        } else {
            this.addFavorite(templateId);
        }
        
        this.updateFavoriteButton(templateId);
    }

    addFavorite(templateId, collectionName = 'Favorites') {
        const template = DataManager.getTemplate(templateId);
        if (!template) return false;

        const favorite = {
            templateId,
            addedAt: new Date().toISOString(),
            collection: collectionName,
            tags: []
        };

        // Remove if already exists (prevents duplicates)
        this.favorites = this.favorites.filter(f => f.templateId !== templateId || f.collection !== collectionName);
        
        // Add to favorites
        this.favorites.unshift(favorite);
        
        // Save to storage
        Utils.storage.set('tm_favorites', this.favorites);
        
        // Show success notification
        NotificationManager.success(`Added "${template.name}" to ${collectionName}`, {
            title: 'Added to Collection',
            icon: 'heart'
        });
        
        // Track favorite event
        this.trackFavoriteEvent('add', templateId, collectionName);
        
        return true;
    }

    removeFavorite(templateId, collectionName = null) {
        const template = DataManager.getTemplate(templateId);
        if (!template) return false;

        const initialLength = this.favorites.length;
        
        if (collectionName) {
            // Remove from specific collection
            this.favorites = this.favorites.filter(f => 
                !(f.templateId === templateId && f.collection === collectionName)
            );
        } else {
            // Remove from all collections
            this.favorites = this.favorites.filter(f => f.templateId !== templateId);
        }
        
        if (this.favorites.length < initialLength) {
            // Save to storage
            Utils.storage.set('tm_favorites', this.favorites);
            
            // Show notification
            const collectionText = collectionName ? ` from ${collectionName}` : '';
            NotificationManager.info(`Removed "${template.name}"${collectionText}`, {
                title: 'Removed from Collection',
                icon: 'heart'
            });
            
            // Track unfavorite event
            this.trackFavoriteEvent('remove', templateId, collectionName);
            
            return true;
        }
        
        return false;
    }

    isFavorite(templateId, collectionName = null) {
        if (collectionName) {
            return this.favorites.some(f => 
                f.templateId === templateId && f.collection === collectionName
            );
        }
        return this.favorites.some(f => f.templateId === templateId);
    }

    getFavorites(collectionName = null) {
        let favs = [...this.favorites];
        
        if (collectionName) {
            favs = favs.filter(f => f.collection === collectionName);
        }
        
        // Get template details for each favorite
        return favs.map(favorite => {
            const template = DataManager.getTemplate(favorite.templateId);
            return {
                ...favorite,
                template
            };
        }).filter(f => f.template); // Remove any favorites for deleted templates
    }

    addFavoriteButtons() {
        // Add favorite buttons to template cards
        const templateCards = document.querySelectorAll('.template-card');
        
        templateCards.forEach(card => {
            const templateId = card.dataset.templateId;
            if (!templateId || card.querySelector('.favorite-btn')) return;
            
            const favoriteBtn = this.createFavoriteButton(templateId);
            
            // Add to template card header or actions
            const actions = card.querySelector('.template-actions');
            const preview = card.querySelector('.template-preview');
            
            if (preview && !preview.querySelector('.favorite-btn')) {
                const favoriteOverlay = Utils.createElement('div', {
                    className: 'favorite-overlay'
                });
                favoriteOverlay.appendChild(favoriteBtn);
                preview.appendChild(favoriteOverlay);
            }
        });
    }

    createFavoriteButton(templateId) {
        const isFavorited = this.isFavorite(templateId);
        
        const btn = Utils.createElement('button', {
            className: `favorite-btn ${isFavorited ? 'favorited' : ''}`,
            'data-template-id': templateId,
            title: isFavorited ? 'Remove from favorites' : 'Add to favorites'
        });
        
        btn.innerHTML = `<i data-lucide="${isFavorited ? 'heart' : 'heart'}" class="${isFavorited ? 'filled' : ''}"></i>`;
        
        return btn;
    }

    updateFavoriteButtons() {
        // Update all favorite buttons on the page
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        
        favoriteButtons.forEach(btn => {
            const templateId = btn.dataset.templateId;
            this.updateFavoriteButton(templateId);
        });
    }

    updateFavoriteButton(templateId) {
        const buttons = document.querySelectorAll(`[data-template-id="${templateId}"].favorite-btn`);
        const isFavorited = this.isFavorite(templateId);
        
        buttons.forEach(btn => {
            const icon = btn.querySelector('i');
            
            if (isFavorited) {
                btn.classList.add('favorited');
                btn.title = 'Remove from favorites';
                if (icon) {
                    icon.classList.add('filled');
                }
            } else {
                btn.classList.remove('favorited');
                btn.title = 'Add to favorites';
                if (icon) {
                    icon.classList.remove('filled');
                }
            }
        });
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    showCollectionsModal() {
        const modalContent = `
            <div class="collections-manager">
                <div class="collections-header">
                    <div class="collections-stats">
                        <div class="stat-item">
                            <span class="stat-number">${this.favorites.length}</span>
                            <span class="stat-label">Total Favorites</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.collections.length}</span>
                            <span class="stat-label">Collections</span>
                        </div>
                    </div>
                </div>

                <div class="collections-tabs">
                    <button class="tab-btn active" data-tab="collections">Collections</button>
                    <button class="tab-btn" data-tab="create">Create Collection</button>
                </div>

                <div class="tab-content">
                    <!-- Collections Tab -->
                    <div class="tab-panel active" data-panel="collections">
                        <div class="collections-grid">
                            ${this.renderCollectionsList()}
                        </div>
                    </div>

                    <!-- Create Collection Tab -->
                    <div class="tab-panel" data-panel="create">
                        <form id="create-collection-form" class="collection-form">
                            <div class="form-group">
                                <label for="collection-name">Collection Name</label>
                                <input 
                                    type="text" 
                                    id="collection-name" 
                                    name="name" 
                                    class="form-input" 
                                    placeholder="Enter collection name"
                                    required
                                >
                            </div>

                            <div class="form-group">
                                <label for="collection-description">Description (Optional)</label>
                                <textarea 
                                    id="collection-description" 
                                    name="description" 
                                    class="form-input" 
                                    rows="3"
                                    placeholder="Describe this collection..."
                                    maxlength="200"
                                ></textarea>
                            </div>

                            <div class="form-group">
                                <label for="collection-color">Collection Color</label>
                                <div class="color-picker">
                                    ${this.getColorOptions().map(color => `
                                        <label class="color-option">
                                            <input type="radio" name="color" value="${color.value}" ${color.value === '#3b82f6' ? 'checked' : ''}>
                                            <span class="color-swatch" style="background-color: ${color.value}"></span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary">
                                <i data-lucide="plus"></i>
                                Create Collection
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        const modal = Utils.showModal(modalContent, {
            title: 'Manage Collections'
        });

        this.bindCollectionsModalEvents(modal);
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderCollectionsList() {
        return this.collections.map(collection => {
            const favoritesInCollection = this.getFavorites(collection.name);
            
            return `
                <div class="collection-card" data-collection="${collection.name}">
                    <div class="collection-header">
                        <div class="collection-icon" style="background-color: ${collection.color}">
                            <i data-lucide="${collection.icon || 'folder'}"></i>
                        </div>
                        <div class="collection-info">
                            <h4 class="collection-name">${collection.name}</h4>
                            <p class="collection-count">${favoritesInCollection.length} template${favoritesInCollection.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div class="collection-actions">
                            <button class="btn-icon" data-action="view-collection" data-collection="${collection.name}">
                                <i data-lucide="eye"></i>
                            </button>
                            ${!collection.isDefault ? `
                                <button class="btn-icon" data-action="edit-collection" data-collection="${collection.name}">
                                    <i data-lucide="edit"></i>
                                </button>
                                <button class="btn-icon text-red-500" data-action="delete-collection" data-collection="${collection.name}">
                                    <i data-lucide="trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${collection.description ? `
                        <p class="collection-description">${collection.description}</p>
                    ` : ''}
                    
                    ${favoritesInCollection.length > 0 ? `
                        <div class="collection-preview">
                            ${favoritesInCollection.slice(0, 3).map(fav => `
                                <div class="preview-item" title="${fav.template.name}">
                                    <img src="${fav.template.preview}" alt="${fav.template.name}" />
                                </div>
                            `).join('')}
                            ${favoritesInCollection.length > 3 ? `<div class="preview-more">+${favoritesInCollection.length - 3}</div>` : ''}
                        </div>
                    ` : `
                        <div class="empty-collection">
                            <i data-lucide="folder-open"></i>
                            <p>No templates in this collection yet</p>
                        </div>
                    `}
                </div>
            `;
        }).join('');
    }

    bindCollectionsModalEvents(modal) {
        // Tab switching
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const tabPanels = modal.querySelectorAll('.tab-panel');
        
        tabBtns.forEach(btn => {
            Utils.on(btn, 'click', () => {
                const targetTab = btn.dataset.tab;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show target panel
                tabPanels.forEach(panel => {
                    if (panel.dataset.panel === targetTab) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });
            });
        });

        // Create collection form
        const createForm = modal.querySelector('#create-collection-form');
        if (createForm) {
            Utils.on(createForm, 'submit', (e) => {
                e.preventDefault();
                this.handleCreateCollection(createForm, modal);
            });
        }

        // Collection actions
        modal.querySelectorAll('[data-action]').forEach(btn => {
            Utils.on(btn, 'click', () => {
                const action = btn.dataset.action;
                const collectionName = btn.dataset.collection;
                
                switch (action) {
                    case 'view-collection':
                        this.viewCollection(collectionName);
                        break;
                    case 'edit-collection':
                        this.editCollection(collectionName);
                        break;
                    case 'delete-collection':
                        this.deleteCollection(collectionName);
                        break;
                }
            });
        });
    }

    handleCreateCollection(form, modal) {
        const formData = new FormData(form);
        const name = formData.get('name').trim();
        const description = formData.get('description').trim();
        const color = formData.get('color');

        if (!name) {
            NotificationManager.error('Collection name is required');
            return;
        }

        if (this.collections.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            NotificationManager.error('A collection with this name already exists');
            return;
        }

        const success = this.createCollection(name, description, false, color);
        
        if (success) {
            // Reset form
            form.reset();
            
            // Refresh collections list
            const collectionsGrid = modal.querySelector('.collections-grid');
            if (collectionsGrid) {
                collectionsGrid.innerHTML = this.renderCollectionsList();
                this.bindCollectionsModalEvents(modal);
            }
            
            // Switch to collections tab
            modal.querySelector('[data-tab="collections"]').click();
            
            NotificationManager.success(`Created collection "${name}"`);
        }
    }

    createCollection(name, description = '', isDefault = false, color = '#3b82f6', icon = 'folder') {
        const collection = {
            id: Utils.generateId(),
            name,
            description,
            isDefault,
            color,
            icon,
            createdAt: new Date().toISOString()
        };

        this.collections.push(collection);
        Utils.storage.set('tm_collections', this.collections);
        
        return true;
    }

    viewCollection(collectionName) {
        const favorites = this.getFavorites(collectionName);
        
        if (favorites.length === 0) {
            NotificationManager.info(`No templates in "${collectionName}" collection yet`);
            return;
        }

        // Create a filtered view (this would integrate with the main template view)
        if (window.TemplateApp && window.TemplateApp.templateManager) {
            window.TemplateApp.templateManager.filteredTemplates = favorites.map(f => f.template);
            window.TemplateApp.templateManager.renderTemplates();
            
            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }
            
            // Scroll to templates section
            const templatesSection = document.querySelector('#templates');
            if (templatesSection) {
                templatesSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            NotificationManager.info(`Showing ${favorites.length} templates from "${collectionName}"`);
        }
    }

    editCollection(collectionName) {
        NotificationManager.featureComingSoon('Collection editing');
    }

    deleteCollection(collectionName) {
        const collection = this.collections.find(c => c.name === collectionName);
        if (!collection) return;

        if (collection.isDefault) {
            NotificationManager.warning('Cannot delete default collections');
            return;
        }

        const favoritesInCollection = this.getFavorites(collectionName);
        
        NotificationManager.confirmAction(
            `Delete "${collectionName}"? This will remove ${favoritesInCollection.length} template${favoritesInCollection.length !== 1 ? 's' : ''} from this collection.`,
            () => {
                // Remove collection
                this.collections = this.collections.filter(c => c.name !== collectionName);
                Utils.storage.set('tm_collections', this.collections);
                
                // Remove favorites in this collection
                this.favorites = this.favorites.filter(f => f.collection !== collectionName);
                Utils.storage.set('tm_favorites', this.favorites);
                
                // Refresh modal
                const modal = document.querySelector('.collections-manager');
                if (modal) {
                    const collectionsGrid = modal.querySelector('.collections-grid');
                    if (collectionsGrid) {
                        collectionsGrid.innerHTML = this.renderCollectionsList();
                    }
                }
                
                NotificationManager.success(`Deleted collection "${collectionName}"`);
            },
            () => {
                // Cancel action - notification will auto-dismiss
            }
        );
    }

    getColorOptions() {
        return [
            { value: '#3b82f6', name: 'Blue' },
            { value: '#10b981', name: 'Green' },
            { value: '#f59e0b', name: 'Orange' },
            { value: '#ef4444', name: 'Red' },
            { value: '#8b5cf6', name: 'Purple' },
            { value: '#06b6d4', name: 'Cyan' },
            { value: '#84cc16', name: 'Lime' },
            { value: '#f97316', name: 'Orange' }
        ];
    }

    trackFavoriteEvent(action, templateId, collection) {
        const analytics = DataManager.getAnalytics();
        if (!analytics.favoriteEvents) {
            analytics.favoriteEvents = [];
        }
        
        analytics.favoriteEvents.unshift({
            action,
            templateId,
            collection,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 events
        analytics.favoriteEvents = analytics.favoriteEvents.slice(0, 100);
        
        DataManager.updateAnalytics(analytics);
    }

    // Statistics
    getFavoriteStats() {
        const stats = {
            totalFavorites: this.favorites.length,
            collectionsUsed: [...new Set(this.favorites.map(f => f.collection))].length,
            mostPopularCollection: null,
            recentlyAdded: this.favorites.filter(f => 
                new Date(f.addedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length
        };

        // Find most popular collection
        const collectionCounts = {};
        this.favorites.forEach(f => {
            collectionCounts[f.collection] = (collectionCounts[f.collection] || 0) + 1;
        });

        if (Object.keys(collectionCounts).length > 0) {
            stats.mostPopularCollection = Object.entries(collectionCounts)
                .sort(([,a], [,b]) => b - a)[0][0];
        }

        return stats;
    }
}

// Initialize favorites manager
window.FavoritesManager = FavoritesManager;