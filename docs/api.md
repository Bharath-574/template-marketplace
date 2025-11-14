# TemplateHub API Guide

## Overview

TemplateHub provides a simple JavaScript API for interacting with templates programmatically. This guide covers all available methods and their usage.

## Core API Classes

### DataManager
Manages template data and persistence.

```javascript
// Get all templates
const templates = dataManager.getTemplates();

// Get templates by category
const landingPages = dataManager.getTemplatesByCategory('landing-pages');

// Search templates
const results = dataManager.searchTemplates('modern');

// Get template by ID
const template = dataManager.getTemplateById('landing-modern-1');
```

### TemplateManager
Handles template rendering and display.

```javascript
// Render templates grid
templateManager.renderTemplates(templates);

// Render single template card
const cardHTML = templateManager.renderTemplateCard(template);

// Show template modal
templateManager.showTemplateModal(templateId);
```

### SearchManager
Provides search and filtering functionality.

```javascript
// Initialize search
searchManager.init();

// Perform search
searchManager.search('landing page');

// Apply filters
searchManager.applyFilters({
  category: 'login-forms',
  sort: 'popular'
});
```

### RatingSystem
Manages template ratings.

```javascript
// Get template rating
const rating = ratingSystem.getRating(templateId);

// Set template rating
ratingSystem.setRating(templateId, 5);

// Get average rating
const avgRating = ratingSystem.getAverageRating(templateId);
```

### FavoritesManager
Handles favorite templates.

```javascript
// Add to favorites
favoritesManager.addFavorite(templateId);

// Remove from favorites
favoritesManager.removeFavorite(templateId);

// Check if favorited
const isFavorite = favoritesManager.isFavorite(templateId);

// Get all favorites
const favorites = favoritesManager.getFavorites();
```

### DownloadManager
Manages template downloads.

```javascript
// Download template
downloadManager.downloadTemplate(templateId);

// Get download count
const count = downloadManager.getDownloadCount(templateId);

// Get user downloads
const userDownloads = downloadManager.getUserDownloads();
```

### AnalyticsDashboard
Provides analytics and statistics.

```javascript
// Get template stats
const stats = analyticsDashboard.getTemplateStats(templateId);

// Get popular templates
const popular = analyticsDashboard.getPopularTemplates();

// Get category stats
const categoryStats = analyticsDashboard.getCategoryStats();
```

### NotificationManager
Shows user notifications.

```javascript
// Show success notification
notificationManager.success('Template downloaded successfully!');

// Show error notification
notificationManager.error('Failed to download template');

// Show info notification
notificationManager.info('New templates available');

// Show warning notification
notificationManager.warning('Please log in to continue');
```

## Events

TemplateHub fires custom events for various actions:

```javascript
// Template downloaded
document.addEventListener('template:downloaded', (e) => {
  console.log('Downloaded:', e.detail.templateId);
});

// Template favorited
document.addEventListener('template:favorited', (e) => {
  console.log('Favorited:', e.detail.templateId);
});

// Template rated
document.addEventListener('template:rated', (e) => {
  console.log('Rated:', e.detail.templateId, e.detail.rating);
});

// Search performed
document.addEventListener('search:performed', (e) => {
  console.log('Search query:', e.detail.query);
});
```

## Data Structures

### Template Object
```javascript
{
  id: 'landing-modern-1',
  title: 'Modern Landing Page',
  description: 'Clean and modern landing page template',
  category: 'landing-pages',
  subcategory: 'modern',
  tags: ['modern', 'clean', 'responsive'],
  preview: 'assets/images/landing-page-preview.svg',
  demoUrl: 'templates/landing-pages/modern/index.html',
  downloadUrl: 'templates/landing-pages/modern.zip',
  author: 'TemplateHub Team',
  license: 'MIT',
  features: ['Responsive', 'Modern Design', 'Fast Loading'],
  technologies: ['HTML5', 'CSS3', 'JavaScript'],
  createdAt: '2024-01-15',
  updatedAt: '2024-01-20',
  downloads: 150,
  rating: 4.5,
  ratingCount: 23
}
```

### User Object
```javascript
{
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe',
  role: 'user', // 'user' | 'admin'
  favorites: ['template-1', 'template-2'],
  downloads: ['template-3', 'template-4'],
  ratings: {
    'template-1': 5,
    'template-2': 4
  }
}
```

## Initialization

```javascript
// Initialize all systems
document.addEventListener('DOMContentLoaded', function() {
  // Initialize icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  // Initialize managers
  window.dataManager = new DataManager();
  window.templateManager = new TemplateManager();
  window.searchManager = new SearchManager();
  window.ratingSystem = new RatingSystem();
  window.favoritesManager = new FavoritesManager();
  window.downloadManager = new DownloadManager();
  window.analyticsDashboard = new AnalyticsDashboard();
  window.notificationManager = new NotificationManager();
  
  // Start the app
  templateManager.init();
  searchManager.init();
});
```

## Storage

TemplateHub uses localStorage for persistence:

```javascript
// Keys used in localStorage
'templatehub_favorites'     // User favorites
'templatehub_ratings'       // User ratings
'templatehub_downloads'     // Download history
'templatehub_user'          // User data
'templatehub_analytics'     // Analytics data
'templatehub_settings'      // User preferences
```

## Customization

### Adding New Templates
```javascript
// Add template to data
const newTemplate = {
  id: 'my-template-1',
  title: 'My Custom Template',
  // ... other properties
};

dataManager.addTemplate(newTemplate);
```

### Custom Categories
```javascript
// Register new category
dataManager.registerCategory({
  id: 'my-category',
  name: 'My Category',
  icon: 'star',
  description: 'My custom templates'
});
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Performance**: Use pagination for large template lists
3. **Caching**: Cache frequently accessed data
4. **Events**: Use events for loose coupling between components

## Examples

### Custom Search Filter
```javascript
function customSearch() {
  const results = dataManager.getTemplates().filter(template => {
    return template.technologies.includes('React') && 
           template.rating >= 4.0;
  });
  
  templateManager.renderTemplates(results);
}
```

### Analytics Dashboard
```javascript
function showAnalytics() {
  const stats = {
    totalTemplates: dataManager.getTemplates().length,
    totalDownloads: analyticsDashboard.getTotalDownloads(),
    popularCategory: analyticsDashboard.getPopularCategory(),
    topRated: analyticsDashboard.getTopRatedTemplates(5)
  };
  
  console.table(stats);
}
```

---

*For more examples and advanced usage, check out the source code in the `assets/js/` directory.*