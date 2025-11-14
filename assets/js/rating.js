// Template Marketplace - Rating System
// Handles template ratings, reviews, and feedback

class RatingSystem {
    constructor() {
        this.ratings = Utils.storage.get('tm_template_ratings') || {};
        this.reviews = Utils.storage.get('tm_template_reviews') || {};
        this.userRatings = Utils.storage.get('tm_user_ratings') || {};
        
        this.init();
    }

    init() {
        this.bindRatingEvents();
        this.updateTemplateRatings();
    }

    bindRatingEvents() {
        // Handle rating clicks on template cards
        Utils.on(document, 'click', (e) => {
            if (e.target.matches('.rating-star') || e.target.closest('.rating-star')) {
                this.handleRatingClick(e);
            }
        });
    }

    handleRatingClick(event) {
        const starElement = event.target.closest('.rating-star') || event.target;
        const ratingContainer = starElement.closest('.rating-container');
        const templateId = ratingContainer.dataset.templateId;
        const rating = parseInt(starElement.dataset.rating);
        
        this.showRatingModal(templateId, rating);
    }

    showRatingModal(templateId, initialRating = 5) {
        const template = DataManager.getTemplate(templateId);
        if (!template) return;

        const currentUserRating = this.getUserRating(templateId);
        
        const modalContent = `
            <div class="rating-modal">
                <div class="template-info mb-4">
                    <h4>${template.name}</h4>
                    <p class="text-gray-600">${template.description}</p>
                </div>
                
                <div class="rating-section">
                    <h5>Your Rating</h5>
                    <div class="rating-stars" data-template-id="${templateId}">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <button class="star-btn ${star <= (currentUserRating || initialRating) ? 'active' : ''}" 
                                    data-rating="${star}">
                                <i data-lucide="star"></i>
                            </button>
                        `).join('')}
                    </div>
                    <p class="rating-text text-sm text-gray-500 mt-2">
                        ${this.getRatingText(currentUserRating || initialRating)}
                    </p>
                </div>
                
                <div class="review-section mt-4">
                    <h5>Write a Review (Optional)</h5>
                    <textarea 
                        id="review-text" 
                        class="form-input w-full" 
                        rows="4" 
                        placeholder="Share your experience with this template..."
                        maxlength="500"
                    >${this.getUserReview(templateId) || ''}</textarea>
                    <div class="text-right text-sm text-gray-500 mt-1">
                        <span id="review-char-count">0</span>/500 characters
                    </div>
                </div>
                
                <div class="rating-actions mt-4">
                    <button class="btn btn-primary" id="submit-rating">
                        ${currentUserRating ? 'Update Rating' : 'Submit Rating'}
                    </button>
                    <button class="btn btn-secondary" id="cancel-rating">
                        Cancel
                    </button>
                    ${currentUserRating ? `
                        <button class="btn btn-error" id="delete-rating">
                            Delete Rating
                        </button>
                    ` : ''}
                </div>
                
                ${this.getTemplateRatingsSummary(templateId)}
            </div>
        `;

        const modal = Utils.showModal(modalContent, {
            title: 'Rate This Template'
        });

        this.bindModalEvents(modal, templateId);
        
        // Update character count
        const reviewTextarea = Utils.$('#review-text');
        const charCount = Utils.$('#review-char-count');
        
        const updateCharCount = () => {
            charCount.textContent = reviewTextarea.value.length;
        };
        
        Utils.on(reviewTextarea, 'input', updateCharCount);
        updateCharCount();

        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    bindModalEvents(modal, templateId) {
        // Star hover and click effects
        const starBtns = modal.querySelectorAll('.star-btn');
        const ratingText = modal.querySelector('.rating-text');
        
        starBtns.forEach((btn, index) => {
            Utils.on(btn, 'mouseover', () => {
                this.updateStarDisplay(starBtns, index + 1);
                ratingText.textContent = this.getRatingText(index + 1);
            });
            
            Utils.on(btn, 'click', () => {
                const rating = index + 1;
                starBtns.forEach((star, starIndex) => {
                    star.classList.toggle('active', starIndex < rating);
                });
                ratingText.textContent = this.getRatingText(rating);
            });
        });
        
        // Reset stars on mouse leave
        const starsContainer = modal.querySelector('.rating-stars');
        Utils.on(starsContainer, 'mouseleave', () => {
            const currentRating = this.getCurrentModalRating(starBtns);
            this.updateStarDisplay(starBtns, currentRating);
            ratingText.textContent = this.getRatingText(currentRating);
        });
        
        // Submit rating
        Utils.on(Utils.$('#submit-rating'), 'click', () => {
            this.submitRating(templateId, modal);
        });
        
        // Cancel rating
        Utils.on(Utils.$('#cancel-rating'), 'click', () => {
            document.body.removeChild(modal);
        });
        
        // Delete rating
        const deleteBtn = Utils.$('#delete-rating');
        if (deleteBtn) {
            Utils.on(deleteBtn, 'click', () => {
                this.deleteRating(templateId);
                document.body.removeChild(modal);
            });
        }
    }

    updateStarDisplay(starBtns, rating) {
        starBtns.forEach((btn, index) => {
            btn.classList.toggle('active', index < rating);
        });
    }

    getCurrentModalRating(starBtns) {
        return starBtns.filter(btn => btn.classList.contains('active')).length;
    }

    getRatingText(rating) {
        const texts = {
            1: 'Poor - Needs significant improvement',
            2: 'Fair - Has some issues',
            3: 'Good - Meets basic expectations',
            4: 'Very Good - High quality template',
            5: 'Excellent - Outstanding template'
        };
        return texts[rating] || '';
    }

    submitRating(templateId, modal) {
        const starBtns = modal.querySelectorAll('.star-btn');
        const rating = this.getCurrentModalRating(starBtns);
        const reviewText = Utils.$('#review-text').value.trim();
        
        if (rating === 0) {
            Utils.showNotification('Please select a rating', 'warning');
            return;
        }
        
        // Save user rating
        if (!this.userRatings[templateId]) {
            this.userRatings[templateId] = {};
        }
        
        this.userRatings[templateId] = {
            rating: rating,
            review: reviewText,
            timestamp: new Date().toISOString(),
            userId: this.getCurrentUserId()
        };
        
        // Update template ratings aggregate
        this.updateTemplateRating(templateId, rating);
        
        // Save review if provided
        if (reviewText) {
            this.saveReview(templateId, reviewText, rating);
        }
        
        // Save to storage
        Utils.storage.set('tm_user_ratings', this.userRatings);
        
        Utils.showNotification('Rating submitted successfully!', 'success');
        document.body.removeChild(modal);
        
        // Refresh template display
        this.refreshTemplateRatings();
    }

    updateTemplateRating(templateId, newRating) {
        if (!this.ratings[templateId]) {
            this.ratings[templateId] = {
                totalRating: 0,
                totalVotes: 0,
                average: 0,
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }
        
        const templateRating = this.ratings[templateId];
        const previousUserRating = this.getUserRating(templateId);
        
        if (previousUserRating) {
            // Update existing rating
            templateRating.totalRating = templateRating.totalRating - previousUserRating + newRating;
            templateRating.distribution[previousUserRating]--;
            templateRating.distribution[newRating]++;
        } else {
            // New rating
            templateRating.totalRating += newRating;
            templateRating.totalVotes++;
            templateRating.distribution[newRating]++;
        }
        
        templateRating.average = templateRating.totalRating / templateRating.totalVotes;
        
        Utils.storage.set('tm_template_ratings', this.ratings);
        
        // Update template in data manager
        const template = DataManager.getTemplate(templateId);
        if (template) {
            DataManager.updateTemplate(templateId, { 
                rating: Math.round(templateRating.average * 10) / 10 
            });
        }
    }

    saveReview(templateId, reviewText, rating) {
        if (!this.reviews[templateId]) {
            this.reviews[templateId] = [];
        }
        
        // Remove existing review from this user
        const userId = this.getCurrentUserId();
        this.reviews[templateId] = this.reviews[templateId].filter(
            review => review.userId !== userId
        );
        
        // Add new review
        this.reviews[templateId].push({
            userId: userId,
            text: reviewText,
            rating: rating,
            timestamp: new Date().toISOString(),
            helpful: 0
        });
        
        Utils.storage.set('tm_template_reviews', this.reviews);
    }

    deleteRating(templateId) {
        const userRating = this.getUserRating(templateId);
        if (!userRating) return;
        
        // Remove from user ratings
        delete this.userRatings[templateId];
        
        // Update template aggregate
        if (this.ratings[templateId]) {
            const templateRating = this.ratings[templateId];
            templateRating.totalRating -= userRating;
            templateRating.totalVotes--;
            templateRating.distribution[userRating]--;
            
            if (templateRating.totalVotes > 0) {
                templateRating.average = templateRating.totalRating / templateRating.totalVotes;
            } else {
                templateRating.average = 0;
            }
        }
        
        // Remove review
        const userId = this.getCurrentUserId();
        if (this.reviews[templateId]) {
            this.reviews[templateId] = this.reviews[templateId].filter(
                review => review.userId !== userId
            );
        }
        
        // Save changes
        Utils.storage.set('tm_user_ratings', this.userRatings);
        Utils.storage.set('tm_template_ratings', this.ratings);
        Utils.storage.set('tm_template_reviews', this.reviews);
        
        Utils.showNotification('Rating deleted', 'success');
        this.refreshTemplateRatings();
    }

    getUserRating(templateId) {
        const userRating = this.userRatings[templateId];
        return userRating ? userRating.rating : null;
    }

    getUserReview(templateId) {
        const userRating = this.userRatings[templateId];
        return userRating ? userRating.review : '';
    }

    getCurrentUserId() {
        // In a real app, this would be the authenticated user ID
        let userId = Utils.storage.get('tm_user_id');
        if (!userId) {
            userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            Utils.storage.set('tm_user_id', userId);
        }
        return userId;
    }

    getTemplateRatingsSummary(templateId) {
        const templateRating = this.ratings[templateId];
        const reviews = this.reviews[templateId] || [];
        
        if (!templateRating || templateRating.totalVotes === 0) {
            return '<div class="no-ratings mt-4"><p class="text-gray-500">No ratings yet</p></div>';
        }
        
        return `
            <div class="ratings-summary mt-4">
                <h5>Template Ratings (${templateRating.totalVotes} ${templateRating.totalVotes === 1 ? 'vote' : 'votes'})</h5>
                
                <div class="rating-overview mb-3">
                    <div class="average-rating">
                        <span class="rating-number">${templateRating.average.toFixed(1)}</span>
                        <div class="rating-stars-display">
                            ${[1, 2, 3, 4, 5].map(star => `
                                <i data-lucide="star" class="${star <= Math.round(templateRating.average) ? 'filled' : ''}"></i>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="rating-distribution">
                        ${[5, 4, 3, 2, 1].map(star => {
                            const count = templateRating.distribution[star] || 0;
                            const percentage = templateRating.totalVotes > 0 ? (count / templateRating.totalVotes) * 100 : 0;
                            return `
                                <div class="rating-bar">
                                    <span class="star-label">${star}★</span>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${percentage}%"></div>
                                    </div>
                                    <span class="count">${count}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                ${reviews.length > 0 ? `
                    <div class="recent-reviews">
                        <h6>Recent Reviews</h6>
                        ${reviews.slice(-3).map(review => `
                            <div class="review-item">
                                <div class="review-header">
                                    <div class="reviewer-rating">
                                        ${[1, 2, 3, 4, 5].map(star => `
                                            <i data-lucide="star" class="${star <= review.rating ? 'filled' : ''}"></i>
                                        `).join('')}
                                    </div>
                                    <span class="review-date">${Utils.timeAgo(review.timestamp)}</span>
                                </div>
                                <p class="review-text">${review.text}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    updateTemplateRatings() {
        // Update all template ratings in the data manager
        Object.keys(this.ratings).forEach(templateId => {
            const rating = this.ratings[templateId];
            if (rating.totalVotes > 0) {
                const template = DataManager.getTemplate(templateId);
                if (template) {
                    DataManager.updateTemplate(templateId, { 
                        rating: Math.round(rating.average * 10) / 10 
                    });
                }
            }
        });
    }

    refreshTemplateRatings() {
        // Trigger template grid refresh if template manager exists
        if (window.TemplateApp && window.TemplateApp.templateManager) {
            window.TemplateApp.templateManager.loadTemplates();
        }
    }

    // Add rating display to template cards
    addRatingToTemplateCard(templateCard, templateId) {
        const template = DataManager.getTemplate(templateId);
        const userRating = this.getUserRating(templateId);
        
        const ratingHtml = `
            <div class="template-rating" data-template-id="${templateId}">
                <div class="rating-container" data-template-id="${templateId}">
                    <div class="rating-stars">
                        ${[1, 2, 3, 4, 5].map(star => `
                            <span class="rating-star ${star <= Math.ceil(template.rating || 0) ? 'filled' : ''}" 
                                  data-rating="${star}">
                                <i data-lucide="star"></i>
                            </span>
                        `).join('')}
                    </div>
                    <span class="rating-value">${template.rating || '0.0'}</span>
                    ${userRating ? `<span class="user-rating-indicator" title="You rated this ${userRating} stars">★</span>` : ''}
                </div>
            </div>
        `;
        
        // Insert rating after template title
        const titleElement = templateCard.querySelector('.template-title');
        if (titleElement) {
            titleElement.insertAdjacentHTML('afterend', ratingHtml);
        }
    }

    // Get top rated templates
    getTopRatedTemplates(limit = 5) {
        const templates = DataManager.getTemplates() || [];
        return templates
            .filter(template => (template.rating || 0) > 0)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, limit);
    }

    // Get rating statistics
    getRatingStatistics() {
        const totalRatings = Object.values(this.ratings).reduce(
            (sum, rating) => sum + rating.totalVotes, 0
        );
        
        const avgRating = Object.values(this.ratings).reduce(
            (sum, rating, _, arr) => sum + (rating.average / arr.length), 0
        );
        
        return {
            totalRatings,
            averageRating: avgRating,
            totalReviews: Object.values(this.reviews).reduce(
                (sum, reviews) => sum + reviews.length, 0
            )
        };
    }
}

// Initialize rating system
window.RatingSystem = RatingSystem;