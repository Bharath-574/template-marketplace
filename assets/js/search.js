// Template Marketplace - Advanced Search System
// Enhanced search functionality with filters, suggestions, and analytics

class SearchManager {
    constructor() {
        this.searchHistory = Utils.storage.get('tm_search_history') || [];
        this.popularSearches = Utils.storage.get('tm_popular_searches') || [];
        this.searchAnalytics = Utils.storage.get('tm_search_analytics') || {};
        
        this.init();
    }

    init() {
        this.bindSearchEvents();
        this.setupAdvancedFilters();
        this.initializeSearchAnalytics();
    }

    bindSearchEvents() {
        const searchInput = Utils.$('#search-input');
        if (!searchInput) return;

        // Enhanced search with autocomplete
        Utils.on(searchInput, 'input', Utils.debounce((e) => {
            this.handleSearch(e.target.value);
            this.updateSearchSuggestions(e.target.value);
        }, 200));

        // Search on Enter
        Utils.on(searchInput, 'keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeSearch(e.target.value);
            }
        });

        // Voice search (if supported)
        this.setupVoiceSearch(searchInput);
    }

    handleSearch(query) {
        if (query.length < 2) {
            this.clearSearchResults();
            return;
        }

        this.trackSearch(query);
        
        // Perform search with advanced matching
        const results = this.performAdvancedSearch(query);
        this.displaySearchResults(results, query);
    }

    performAdvancedSearch(query) {
        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
        const templates = DataManager.getTemplates() || [];
        
        // Advanced scoring algorithm
        const scoredResults = templates.map(template => {
            let score = 0;
            
            // Exact name match gets highest score
            if (template.name.toLowerCase().includes(query.toLowerCase())) {
                score += 100;
            }
            
            // Description match
            if (template.description.toLowerCase().includes(query.toLowerCase())) {
                score += 50;
            }
            
            // Tag matches
            template.tags.forEach(tag => {
                if (tag.toLowerCase().includes(query.toLowerCase())) {
                    score += 30;
                }
            });
            
            // Category match
            if (template.category.toLowerCase().includes(query.toLowerCase())) {
                score += 40;
            }
            
            // Technology match
            template.technologies.forEach(tech => {
                if (tech.toLowerCase().includes(query.toLowerCase())) {
                    score += 25;
                }
            });
            
            // Partial matches for individual search terms
            searchTerms.forEach(term => {
                if (template.name.toLowerCase().includes(term)) score += 20;
                if (template.description.toLowerCase().includes(term)) score += 10;
                template.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(term)) score += 15;
                });
            });
            
            // Boost popular templates
            if (template.featured) score += 10;
            if (template.downloads > 1000) score += 5;
            
            return { ...template, searchScore: score };
        });
        
        // Filter and sort by score
        return scoredResults
            .filter(result => result.searchScore > 0)
            .sort((a, b) => b.searchScore - a.searchScore);
    }

    updateSearchSuggestions(query) {
        if (!query || query.length < 2) {
            this.hideSuggestions();
            return;
        }

        const suggestions = this.generateSuggestions(query);
        this.displaySuggestions(suggestions);
    }

    generateSuggestions(query) {
        const templates = DataManager.getTemplates() || [];
        const categories = DataManager.getCategories() || [];
        const suggestions = [];
        
        // Template suggestions
        templates.forEach(template => {
            if (template.name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'template',
                    text: template.name,
                    category: template.category,
                    icon: 'file-text',
                    action: () => this.selectTemplate(template.id)
                });
            }
        });
        
        // Category suggestions
        categories.forEach(category => {
            if (category.name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'category',
                    text: category.name,
                    count: templates.filter(t => t.category === category.id).length,
                    icon: 'folder',
                    action: () => this.selectCategory(category.id)
                });
            }
        });
        
        // Tag suggestions
        const allTags = [...new Set(templates.flatMap(t => t.tags))];
        allTags.forEach(tag => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
                const count = templates.filter(t => 
                    t.tags.some(tTag => tTag.toLowerCase().includes(tag.toLowerCase()))
                ).length;
                
                suggestions.push({
                    type: 'tag',
                    text: tag,
                    count: count,
                    icon: 'tag',
                    action: () => this.selectTag(tag)
                });
            }
        });
        
        // Technology suggestions
        const allTech = [...new Set(templates.flatMap(t => t.technologies))];
        allTech.forEach(tech => {
            if (tech.toLowerCase().includes(query.toLowerCase())) {
                const count = templates.filter(t => 
                    t.technologies.some(tTech => tTech.toLowerCase().includes(tech.toLowerCase()))
                ).length;
                
                suggestions.push({
                    type: 'technology',
                    text: tech,
                    count: count,
                    icon: 'code',
                    action: () => this.selectTechnology(tech)
                });
            }
        });
        
        // Recent searches
        this.searchHistory.forEach(historyItem => {
            if (historyItem.query.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'history',
                    text: historyItem.query,
                    timestamp: historyItem.timestamp,
                    icon: 'clock',
                    action: () => this.selectHistoryItem(historyItem.query)
                });
            }
        });
        
        // Limit and sort suggestions
        return suggestions
            .slice(0, 10)
            .sort((a, b) => {
                // Prioritize exact matches
                const aExact = a.text.toLowerCase() === query.toLowerCase();
                const bExact = b.text.toLowerCase() === query.toLowerCase();
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                
                // Then by type priority
                const typePriority = { template: 1, category: 2, tag: 3, technology: 4, history: 5 };
                return typePriority[a.type] - typePriority[b.type];
            });
    }

    displaySuggestions(suggestions) {
        let container = Utils.$('#search-suggestions');
        if (!container) {
            container = Utils.createElement('div', {
                id: 'search-suggestions',
                className: 'search-suggestions'
            });
            
            const searchInput = Utils.$('#search-input');
            searchInput.parentNode.appendChild(container);
        }
        
        if (suggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-suggestion-text="${suggestion.text}">
                <div class="suggestion-content">
                    <i data-lucide="${suggestion.icon}" class="suggestion-icon"></i>
                    <div class="suggestion-text">
                        <span class="suggestion-title">${this.highlightMatch(suggestion.text, Utils.$('#search-input').value)}</span>
                        <span class="suggestion-meta">
                            ${suggestion.type}
                            ${suggestion.count ? ` • ${suggestion.count} items` : ''}
                            ${suggestion.timestamp ? ` • ${Utils.timeAgo(suggestion.timestamp)}` : ''}
                        </span>
                    </div>
                </div>
                <div class="suggestion-actions">
                    <button class="btn-suggestion-action" data-action="select">
                        <i data-lucide="corner-down-left"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Bind suggestion events
        Utils.$$('.suggestion-item').forEach((item, index) => {
            Utils.on(item, 'click', () => {
                suggestions[index].action();
                this.hideSuggestions();
            });
        });
        
        container.classList.remove('hidden');
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    setupAdvancedFilters() {
        // Create advanced filter panel
        const filtersContainer = Utils.$('.filters');
        if (!filtersContainer) return;
        
        const advancedBtn = Utils.createElement('button', {
            className: 'btn btn-secondary btn-sm',
            innerHTML: '<i data-lucide="filter"></i> Advanced Filters'
        });
        
        filtersContainer.appendChild(advancedBtn);
        
        Utils.on(advancedBtn, 'click', () => {
            this.showAdvancedFiltersModal();
        });
    }

    showAdvancedFiltersModal() {
        const templates = DataManager.getTemplates() || [];
        const allTags = [...new Set(templates.flatMap(t => t.tags))].sort();
        const allTech = [...new Set(templates.flatMap(t => t.technologies))].sort();
        const difficulties = ['easy', 'medium', 'hard'];
        
        const modalContent = `
            <div class="advanced-filters">
                <div class="filter-section">
                    <h5>Difficulty Level</h5>
                    <div class="filter-group">
                        ${difficulties.map(diff => `
                            <label class="filter-option">
                                <input type="checkbox" name="difficulty" value="${diff}">
                                <span class="checkmark"></span>
                                ${Utils.capitalize(diff)}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="filter-section">
                    <h5>Technologies</h5>
                    <div class="filter-group">
                        ${allTech.slice(0, 8).map(tech => `
                            <label class="filter-option">
                                <input type="checkbox" name="technology" value="${tech}">
                                <span class="checkmark"></span>
                                ${tech}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="filter-section">
                    <h5>Popular Tags</h5>
                    <div class="filter-group">
                        ${allTags.slice(0, 10).map(tag => `
                            <label class="filter-option">
                                <input type="checkbox" name="tag" value="${tag}">
                                <span class="checkmark"></span>
                                ${tag}
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="filter-section">
                    <h5>Template Features</h5>
                    <div class="filter-group">
                        <label class="filter-option">
                            <input type="checkbox" name="feature" value="featured">
                            <span class="checkmark"></span>
                            Featured Templates
                        </label>
                        <label class="filter-option">
                            <input type="checkbox" name="feature" value="popular">
                            <span class="checkmark"></span>
                            Popular (1000+ downloads)
                        </label>
                        <label class="filter-option">
                            <input type="checkbox" name="feature" value="recent">
                            <span class="checkmark"></span>
                            Recently Added
                        </label>
                    </div>
                </div>
                
                <div class="filter-actions">
                    <button class="btn btn-primary" id="apply-filters">Apply Filters</button>
                    <button class="btn btn-secondary" id="clear-all-filters">Clear All</button>
                </div>
            </div>
        `;
        
        const modal = Utils.showModal(modalContent, {
            title: 'Advanced Filters'
        });
        
        // Bind filter actions
        Utils.on(Utils.$('#apply-filters'), 'click', () => {
            this.applyAdvancedFilters(modal);
        });
        
        Utils.on(Utils.$('#clear-all-filters'), 'click', () => {
            this.clearAllFilters();
            document.body.removeChild(modal);
        });
    }

    applyAdvancedFilters(modal) {
        const formData = new FormData();
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]:checked');
        
        const filters = {
            difficulties: [],
            technologies: [],
            tags: [],
            features: []
        };
        
        checkboxes.forEach(checkbox => {
            switch (checkbox.name) {
                case 'difficulty':
                    filters.difficulties.push(checkbox.value);
                    break;
                case 'technology':
                    filters.technologies.push(checkbox.value);
                    break;
                case 'tag':
                    filters.tags.push(checkbox.value);
                    break;
                case 'feature':
                    filters.features.push(checkbox.value);
                    break;
            }
        });
        
        this.executeAdvancedSearch(filters);
        document.body.removeChild(modal);
    }

    executeAdvancedSearch(filters) {
        const templates = DataManager.getTemplates() || [];
        
        let filteredTemplates = templates.filter(template => {
            // Check difficulty
            if (filters.difficulties.length > 0 && !filters.difficulties.includes(template.difficulty)) {
                return false;
            }
            
            // Check technologies
            if (filters.technologies.length > 0) {
                const hasMatchingTech = filters.technologies.some(tech => 
                    template.technologies.includes(tech)
                );
                if (!hasMatchingTech) return false;
            }
            
            // Check tags
            if (filters.tags.length > 0) {
                const hasMatchingTag = filters.tags.some(tag => 
                    template.tags.includes(tag)
                );
                if (!hasMatchingTag) return false;
            }
            
            // Check features
            if (filters.features.length > 0) {
                const featureChecks = {
                    featured: template.featured === true,
                    popular: (template.downloads || 0) >= 1000,
                    recent: new Date(template.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                };
                
                const hasMatchingFeature = filters.features.some(feature => 
                    featureChecks[feature]
                );
                if (!hasMatchingFeature) return false;
            }
            
            return true;
        });
        
        // Display filtered results
        if (window.TemplateApp && window.TemplateApp.templateManager) {
            window.TemplateApp.templateManager.filteredTemplates = filteredTemplates;
            window.TemplateApp.templateManager.renderTemplates();
        }
        
        Utils.showNotification(`Found ${filteredTemplates.length} templates matching your criteria`, 'success');
    }

    setupVoiceSearch(searchInput) {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return; // Voice search not supported
        }
        
        const voiceBtn = Utils.createElement('button', {
            className: 'voice-search-btn',
            innerHTML: '<i data-lucide="mic"></i>',
            title: 'Voice Search'
        });
        
        searchInput.parentNode.appendChild(voiceBtn);
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        Utils.on(voiceBtn, 'click', () => {
            recognition.start();
            voiceBtn.classList.add('listening');
        });
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            this.handleSearch(transcript);
            voiceBtn.classList.remove('listening');
        };
        
        recognition.onerror = () => {
            voiceBtn.classList.remove('listening');
            Utils.showNotification('Voice search error', 'error');
        };
        
        recognition.onend = () => {
            voiceBtn.classList.remove('listening');
        };
    }

    trackSearch(query) {
        if (!query.trim()) return;
        
        // Update search history
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        this.searchHistory.unshift({
            query: query,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 20 searches
        this.searchHistory = this.searchHistory.slice(0, 20);
        Utils.storage.set('tm_search_history', this.searchHistory);
        
        // Update search analytics
        if (!this.searchAnalytics[query]) {
            this.searchAnalytics[query] = { count: 0, lastSearched: null };
        }
        
        this.searchAnalytics[query].count++;
        this.searchAnalytics[query].lastSearched = new Date().toISOString();
        
        Utils.storage.set('tm_search_analytics', this.searchAnalytics);
    }

    initializeSearchAnalytics() {
        // Track popular searches for suggestions
        const sortedSearches = Object.entries(this.searchAnalytics)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 10)
            .map(([query, data]) => ({ query, ...data }));
        
        this.popularSearches = sortedSearches;
        Utils.storage.set('tm_popular_searches', this.popularSearches);
    }

    selectTemplate(templateId) {
        if (window.TemplateApp && window.TemplateApp.templateManager) {
            window.TemplateApp.templateManager.showTemplateDetails(templateId);
        }
    }

    selectCategory(categoryId) {
        if (window.TemplateApp && window.TemplateApp.templateManager) {
            window.TemplateApp.templateManager.handleCategoryFilter(categoryId);
        }
    }

    selectTag(tag) {
        const searchInput = Utils.$('#search-input');
        if (searchInput) {
            searchInput.value = tag;
            this.handleSearch(tag);
        }
    }

    selectTechnology(tech) {
        const searchInput = Utils.$('#search-input');
        if (searchInput) {
            searchInput.value = tech;
            this.handleSearch(tech);
        }
    }

    selectHistoryItem(query) {
        const searchInput = Utils.$('#search-input');
        if (searchInput) {
            searchInput.value = query;
            this.handleSearch(query);
        }
    }

    hideSuggestions() {
        const container = Utils.$('#search-suggestions');
        if (container) {
            container.classList.add('hidden');
        }
    }

    clearSearchResults() {
        if (window.TemplateApp && window.TemplateApp.templateManager) {
            window.TemplateApp.templateManager.clearFilters();
        }
    }

    clearAllFilters() {
        if (window.TemplateApp && window.TemplateApp.templateManager) {
            window.TemplateApp.templateManager.clearFilters();
        }
        
        Utils.showNotification('All filters cleared', 'success');
    }
}

// Initialize search manager
window.SearchManager = SearchManager;