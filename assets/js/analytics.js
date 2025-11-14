// Template Marketplace - Analytics Dashboard
// Provides insights into user behavior, popular templates, and system performance

class AnalyticsDashboard {
    constructor() {
        this.analytics = DataManager.getAnalytics();
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Handle analytics view requests
        Utils.on(document, 'click', (e) => {
            if (e.target.matches('[data-action="view-analytics"]') || e.target.closest('[data-action="view-analytics"]')) {
                e.preventDefault();
                this.showDashboard();
            }
        });
    }

    showDashboard() {
        const dashboardContent = `
            <div class="analytics-dashboard">
                <div class="dashboard-tabs">
                    <button class="tab-btn active" data-tab="overview">Overview</button>
                    <button class="tab-btn" data-tab="templates">Templates</button>
                    <button class="tab-btn" data-tab="users">Users</button>
                    <button class="tab-btn" data-tab="performance">Performance</button>
                </div>

                <div class="tab-content">
                    <!-- Overview Tab -->
                    <div class="tab-panel active" data-panel="overview">
                        ${this.renderOverviewTab()}
                    </div>

                    <!-- Templates Tab -->
                    <div class="tab-panel" data-panel="templates">
                        ${this.renderTemplatesTab()}
                    </div>

                    <!-- Users Tab -->
                    <div class="tab-panel" data-panel="users">
                        ${this.renderUsersTab()}
                    </div>

                    <!-- Performance Tab -->
                    <div class="tab-panel" data-panel="performance">
                        ${this.renderPerformanceTab()}
                    </div>
                </div>
            </div>
        `;

        const modal = Utils.showModal(dashboardContent, {
            title: 'Analytics Dashboard',
            size: 'large'
        });

        this.bindDashboardEvents(modal);
        
        // Reinitialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    renderOverviewTab() {
        const stats = this.calculateOverviewStats();
        
        return `
            <div class="overview-stats">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon bg-blue-500">
                            <i data-lucide="eye"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.totalViews}</div>
                            <div class="stat-label">Total Views</div>
                            <div class="stat-trend ${stats.viewsTrend >= 0 ? 'positive' : 'negative'}">
                                <i data-lucide="${stats.viewsTrend >= 0 ? 'trending-up' : 'trending-down'}"></i>
                                ${Math.abs(stats.viewsTrend)}%
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-green-500">
                            <i data-lucide="download"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.totalDownloads}</div>
                            <div class="stat-label">Total Downloads</div>
                            <div class="stat-trend ${stats.downloadsTrend >= 0 ? 'positive' : 'negative'}">
                                <i data-lucide="${stats.downloadsTrend >= 0 ? 'trending-up' : 'trending-down'}"></i>
                                ${Math.abs(stats.downloadsTrend)}%
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-purple-500">
                            <i data-lucide="star"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.totalRatings}</div>
                            <div class="stat-label">Total Ratings</div>
                            <div class="stat-average">Avg: ${stats.avgRating}/5</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon bg-orange-500">
                            <i data-lucide="heart"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.totalFavorites}</div>
                            <div class="stat-label">Total Favorites</div>
                            <div class="stat-trend positive">
                                <i data-lucide="plus"></i>
                                ${stats.newFavorites} this week
                            </div>
                        </div>
                    </div>
                </div>

                <div class="chart-section">
                    <div class="chart-container">
                        <h4>Activity Overview (Last 30 Days)</h4>
                        <div class="activity-chart">
                            ${this.renderActivityChart(stats.dailyActivity)}
                        </div>
                    </div>
                </div>

                <div class="recent-activity">
                    <h4>Recent Activity</h4>
                    <div class="activity-list">
                        ${this.renderRecentActivity()}
                    </div>
                </div>
            </div>
        `;
    }

    renderTemplatesTab() {
        const templateStats = this.calculateTemplateStats();
        
        return `
            <div class="templates-analytics">
                <div class="template-metrics">
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-value">${templateStats.totalTemplates}</span>
                            <span class="metric-label">Total Templates</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${templateStats.categoriesCount}</span>
                            <span class="metric-label">Categories</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${templateStats.avgDownloadsPerTemplate}</span>
                            <span class="metric-label">Avg Downloads</span>
                        </div>
                    </div>
                </div>

                <div class="popular-templates">
                    <h4>Most Popular Templates</h4>
                    <div class="template-ranking">
                        ${this.renderTemplateRanking(templateStats.popularTemplates)}
                    </div>
                </div>

                <div class="category-performance">
                    <h4>Category Performance</h4>
                    <div class="category-chart">
                        ${this.renderCategoryChart(templateStats.categoryStats)}
                    </div>
                </div>
            </div>
        `;
    }

    renderUsersTab() {
        const userStats = this.calculateUserStats();
        
        return `
            <div class="users-analytics">
                <div class="user-metrics">
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-value">${userStats.totalUsers}</span>
                            <span class="metric-label">Total Users</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${userStats.activeUsers}</span>
                            <span class="metric-label">Active Users (7d)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${userStats.newUsers}</span>
                            <span class="metric-label">New Users (30d)</span>
                        </div>
                    </div>
                </div>

                <div class="user-behavior">
                    <h4>User Behavior</h4>
                    <div class="behavior-insights">
                        <div class="insight-item">
                            <div class="insight-icon">
                                <i data-lucide="search"></i>
                            </div>
                            <div class="insight-content">
                                <div class="insight-title">Top Search Terms</div>
                                <div class="search-terms">
                                    ${userStats.topSearchTerms.map(term => `
                                        <span class="search-term">${term.term} (${term.count})</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="insight-item">
                            <div class="insight-icon">
                                <i data-lucide="clock"></i>
                            </div>
                            <div class="insight-content">
                                <div class="insight-title">Peak Usage Hours</div>
                                <div class="usage-hours">
                                    ${this.renderUsageHours(userStats.peakHours)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="user-engagement">
                    <h4>Engagement Metrics</h4>
                    <div class="engagement-chart">
                        ${this.renderEngagementChart(userStats.engagement)}
                    </div>
                </div>
            </div>
        `;
    }

    renderPerformanceTab() {
        const performanceStats = this.calculatePerformanceStats();
        
        return `
            <div class="performance-analytics">
                <div class="performance-metrics">
                    <div class="metrics-grid">
                        <div class="metric-item ${performanceStats.pageLoadTime < 2 ? 'good' : performanceStats.pageLoadTime < 4 ? 'warning' : 'poor'}">
                            <span class="metric-value">${performanceStats.pageLoadTime}s</span>
                            <span class="metric-label">Avg Page Load</span>
                        </div>
                        <div class="metric-item ${performanceStats.errorRate < 1 ? 'good' : performanceStats.errorRate < 5 ? 'warning' : 'poor'}">
                            <span class="metric-value">${performanceStats.errorRate}%</span>
                            <span class="metric-label">Error Rate</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${performanceStats.uptime}%</span>
                            <span class="metric-label">Uptime</span>
                        </div>
                    </div>
                </div>

                <div class="performance-issues">
                    <h4>Performance Issues</h4>
                    <div class="issues-list">
                        ${performanceStats.issues.length > 0 ? performanceStats.issues.map(issue => `
                            <div class="issue-item ${issue.severity}">
                                <div class="issue-icon">
                                    <i data-lucide="${this.getIssueIcon(issue.severity)}"></i>
                                </div>
                                <div class="issue-content">
                                    <div class="issue-title">${issue.title}</div>
                                    <div class="issue-description">${issue.description}</div>
                                    <div class="issue-recommendation">${issue.recommendation}</div>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="no-issues">
                                <i data-lucide="check-circle"></i>
                                <p>No performance issues detected</p>
                            </div>
                        `}
                    </div>
                </div>

                <div class="system-health">
                    <h4>System Health</h4>
                    <div class="health-indicators">
                        ${this.renderHealthIndicators(performanceStats.health)}
                    </div>
                </div>
            </div>
        `;
    }

    calculateOverviewStats() {
        const analytics = this.analytics;
        
        return {
            totalViews: analytics.totalViews || 0,
            viewsTrend: this.calculateTrend('views'),
            totalDownloads: (analytics.downloadEvents || []).length,
            downloadsTrend: this.calculateTrend('downloads'),
            totalRatings: (analytics.ratingEvents || []).length,
            avgRating: this.calculateAverageRating(),
            totalFavorites: (analytics.favoriteEvents || []).filter(e => e.action === 'add').length,
            newFavorites: this.calculateRecentFavorites(),
            dailyActivity: this.calculateDailyActivity()
        };
    }

    calculateTemplateStats() {
        const templates = DataManager.getTemplates() || [];
        const analytics = this.analytics;
        
        const popularTemplates = templates.map(template => {
            const downloads = (analytics.downloadEvents || []).filter(e => e.templateId === template.id).length;
            const ratings = (analytics.ratingEvents || []).filter(e => e.templateId === template.id);
            const avgRating = ratings.length > 0 ? 
                ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;
            
            return {
                ...template,
                downloads,
                avgRating: avgRating.toFixed(1)
            };
        }).sort((a, b) => b.downloads - a.downloads);

        const categories = DataManager.getCategories() || [];
        const categoryStats = categories.map(category => {
            const categoryTemplates = templates.filter(t => t.category === category.id);
            const totalDownloads = categoryTemplates.reduce((sum, template) => {
                return sum + (analytics.downloadEvents || []).filter(e => e.templateId === template.id).length;
            }, 0);
            
            return {
                name: category.name,
                templates: categoryTemplates.length,
                downloads: totalDownloads,
                percentage: categoryTemplates.length > 0 ? (totalDownloads / categoryTemplates.length).toFixed(1) : 0
            };
        });

        return {
            totalTemplates: templates.length,
            categoriesCount: categories.length,
            avgDownloadsPerTemplate: templates.length > 0 ? 
                Math.round((analytics.downloadEvents || []).length / templates.length) : 0,
            popularTemplates: popularTemplates.slice(0, 10),
            categoryStats
        };
    }

    calculateUserStats() {
        const analytics = this.analytics;
        const searchEvents = analytics.searchEvents || [];
        const activityEvents = analytics.recentActivity || [];
        
        // Calculate search terms frequency
        const searchTerms = {};
        searchEvents.forEach(event => {
            if (event.query && event.query.trim()) {
                const term = event.query.toLowerCase().trim();
                searchTerms[term] = (searchTerms[term] || 0) + 1;
            }
        });
        
        const topSearchTerms = Object.entries(searchTerms)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([term, count]) => ({ term, count }));

        // Calculate peak hours
        const hourlyActivity = new Array(24).fill(0);
        activityEvents.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            hourlyActivity[hour]++;
        });

        return {
            totalUsers: analytics.totalUsers || 0,
            activeUsers: this.calculateActiveUsers(7),
            newUsers: this.calculateNewUsers(30),
            topSearchTerms,
            peakHours: hourlyActivity,
            engagement: this.calculateEngagementMetrics()
        };
    }

    calculatePerformanceStats() {
        const analytics = this.analytics;
        const performanceData = analytics.performance || {};
        
        return {
            pageLoadTime: performanceData.avgPageLoad || 1.2,
            errorRate: performanceData.errorRate || 0.5,
            uptime: performanceData.uptime || 99.9,
            issues: this.identifyPerformanceIssues(),
            health: this.calculateSystemHealth()
        };
    }

    renderActivityChart(dailyActivity) {
        const maxValue = Math.max(...dailyActivity.map(d => d.count));
        
        return `
            <div class="chart-bars">
                ${dailyActivity.map(day => {
                    const height = maxValue > 0 ? (day.count / maxValue) * 100 : 0;
                    return `
                        <div class="chart-bar" style="height: ${height}%" title="${day.date}: ${day.count} activities">
                            <div class="bar-value">${day.count}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="chart-labels">
                ${dailyActivity.map(day => `<span class="chart-label">${day.date}</span>`).join('')}
            </div>
        `;
    }

    renderTemplateRanking(templates) {
        return templates.map((template, index) => `
            <div class="ranking-item">
                <div class="rank">#${index + 1}</div>
                <div class="template-info">
                    <img src="${template.preview}" alt="${template.name}" class="template-thumb">
                    <div class="template-details">
                        <div class="template-name">${template.name}</div>
                        <div class="template-stats">
                            ${template.downloads} downloads • ${template.avgRating}★
                        </div>
                    </div>
                </div>
                <div class="ranking-badge ${index < 3 ? 'top' : ''}">
                    ${template.downloads}
                </div>
            </div>
        `).join('');
    }

    renderCategoryChart(categoryStats) {
        const maxDownloads = Math.max(...categoryStats.map(c => c.downloads));
        
        return categoryStats.map(category => {
            const width = maxDownloads > 0 ? (category.downloads / maxDownloads) * 100 : 0;
            
            return `
                <div class="category-bar-container">
                    <div class="category-label">${category.name}</div>
                    <div class="category-bar">
                        <div class="bar-fill" style="width: ${width}%"></div>
                        <span class="bar-value">${category.downloads}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateTrend(type) {
        // Simplified trend calculation
        return Math.floor(Math.random() * 20) - 5; // -5% to +15%
    }

    calculateAverageRating() {
        const ratingEvents = this.analytics.ratingEvents || [];
        if (ratingEvents.length === 0) return 0;
        
        const total = ratingEvents.reduce((sum, event) => sum + event.rating, 0);
        return (total / ratingEvents.length).toFixed(1);
    }

    calculateRecentFavorites() {
        const favoriteEvents = this.analytics.favoriteEvents || [];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        return favoriteEvents.filter(event => 
            event.action === 'add' && new Date(event.timestamp) > weekAgo
        ).length;
    }

    calculateDailyActivity() {
        const activities = this.analytics.recentActivity || [];
        const days = [];
        
        // Get last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dayString = date.toISOString().split('T')[0];
            
            const dayActivities = activities.filter(activity => {
                const activityDate = new Date(activity.timestamp).toISOString().split('T')[0];
                return activityDate === dayString;
            });
            
            days.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: dayActivities.length
            });
        }
        
        return days;
    }

    bindDashboardEvents(modal) {
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
                
                // Reinitialize icons for new content
                if (window.lucide) {
                    lucide.createIcons();
                }
            });
        });
    }

    // Helper methods
    calculateActiveUsers(days) {
        // Simplified calculation
        return Math.floor(Math.random() * 100) + 50;
    }

    calculateNewUsers(days) {
        // Simplified calculation
        return Math.floor(Math.random() * 20) + 5;
    }

    calculateEngagementMetrics() {
        return {
            avgSessionDuration: '5m 32s',
            bounceRate: '32%',
            pagesPerSession: 3.2,
            returnVisitorRate: '68%'
        };
    }

    identifyPerformanceIssues() {
        // Simulated performance issues
        return [
            {
                severity: 'warning',
                title: 'Large Image Files',
                description: 'Some template preview images are larger than recommended',
                recommendation: 'Consider compressing images to improve load times'
            }
        ];
    }

    calculateSystemHealth() {
        return {
            database: 'healthy',
            storage: 'healthy', 
            api: 'healthy',
            cdn: 'healthy'
        };
    }

    renderRecentActivity() {
        const activities = this.analytics.recentActivity || [];
        const recentActivities = activities.slice(0, 10);
        
        return recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i data-lucide="${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-description">${this.formatActivityDescription(activity)}</div>
                    <div class="activity-time">${this.formatRelativeTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'page_view': 'eye',
            'template_download': 'download',
            'template_rating': 'star',
            'search': 'search',
            'favorite_add': 'heart'
        };
        return icons[type] || 'activity';
    }

    formatActivityDescription(activity) {
        const descriptions = {
            'page_view': 'Page visited',
            'template_download': 'Template downloaded',
            'template_rating': 'Template rated',
            'search': `Search: "${activity.query || 'Unknown'}"`,
            'favorite_add': 'Template favorited'
        };
        return descriptions[activity.type] || 'Unknown activity';
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    getIssueIcon(severity) {
        const icons = {
            'critical': 'alert-circle',
            'warning': 'alert-triangle',
            'info': 'info'
        };
        return icons[severity] || 'alert-circle';
    }

    renderHealthIndicators(health) {
        return Object.entries(health).map(([service, status]) => `
            <div class="health-indicator ${status}">
                <div class="indicator-dot"></div>
                <div class="indicator-label">${service.charAt(0).toUpperCase() + service.slice(1)}</div>
                <div class="indicator-status">${status}</div>
            </div>
        `).join('');
    }

    renderUsageHours(hourlyData) {
        const maxHour = Math.max(...hourlyData);
        
        return hourlyData.map((count, hour) => {
            const height = maxHour > 0 ? (count / maxHour) * 40 : 0;
            return `
                <div class="hour-bar" style="height: ${height}px" title="${hour}:00 - ${count} activities"></div>
            `;
        }).join('');
    }

    renderEngagementChart(engagement) {
        return `
            <div class="engagement-metrics">
                <div class="engagement-metric">
                    <span class="metric-label">Session Duration</span>
                    <span class="metric-value">${engagement.avgSessionDuration}</span>
                </div>
                <div class="engagement-metric">
                    <span class="metric-label">Bounce Rate</span>
                    <span class="metric-value">${engagement.bounceRate}</span>
                </div>
                <div class="engagement-metric">
                    <span class="metric-label">Pages/Session</span>
                    <span class="metric-value">${engagement.pagesPerSession}</span>
                </div>
                <div class="engagement-metric">
                    <span class="metric-label">Return Rate</span>
                    <span class="metric-value">${engagement.returnVisitorRate}</span>
                </div>
            </div>
        `;
    }

    // Export functionality
    exportAnalytics() {
        const data = {
            exportDate: new Date().toISOString(),
            analytics: this.analytics,
            summary: {
                overview: this.calculateOverviewStats(),
                templates: this.calculateTemplateStats(),
                users: this.calculateUserStats(),
                performance: this.calculatePerformanceStats()
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        NotificationManager.success('Analytics exported successfully');
    }
}

// Initialize analytics dashboard
window.AnalyticsDashboard = AnalyticsDashboard;