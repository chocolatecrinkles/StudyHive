// Enhanced Search functionality
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const listingsGrid = document.getElementById('listingsGrid');

searchInput?.addEventListener('input', function(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.listing-card');
  let visibleCount = 0;
  
  // Show/hide clear button
  clearSearch.style.display = searchTerm ? 'block' : 'none';
  
  cards.forEach(card => {
    const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('.card-description')?.textContent.toLowerCase() || '';
    const amenities = card.querySelector('.card-amenities')?.textContent.toLowerCase() || '';
    
    if (title.includes(searchTerm) || desc.includes(searchTerm) || amenities.includes(searchTerm)) {
      card.style.display = 'block';
      card.style.animation = 'fadeIn 0.5s ease-out';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });
  
  // Show "no results" message if needed
  updateEmptyState(visibleCount);
});

// Clear search
clearSearch?.addEventListener('click', function() {
  searchInput.value = '';
  searchInput.dispatchEvent(new Event('input'));
  searchInput.focus();
});

// Filter chips functionality
const filterChips = document.querySelectorAll('.chip');
let activeFilter = 'all';

filterChips.forEach(chip => {
  chip.addEventListener('click', function() {
    // Update active state
    filterChips.forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    
    activeFilter = this.dataset.filter;
    const cards = document.querySelectorAll('.listing-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
      const tags = card.querySelector('.card-tags');
      const shouldShow = activeFilter === 'all' || 
                        (activeFilter === 'wifi' && tags.querySelector('.tag-wifi')) ||
                        (activeFilter === 'free' && tags.querySelector('.tag-free')) ||
                        (activeFilter === 'ac' && tags.querySelector('.tag-ac'));
      
      if (shouldShow) {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.5s ease-out';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    updateEmptyState(visibleCount);
  });
});

// Sort functionality
document.getElementById('sortOptions')?.addEventListener('change', function(e) {
  const sortBy = e.target.value;
  const grid = document.getElementById('listingsGrid');
  const cards = Array.from(grid.querySelectorAll('.listing-card'));
  
  showLoading();
  
  setTimeout(() => {
    cards.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.querySelector('.card-title').textContent;
        const nameB = b.querySelector('.card-title').textContent;
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'rating') {
        const ratingA = parseFloat(a.querySelector('.card-rating span')?.textContent || 0);
        const ratingB = parseFloat(b.querySelector('.card-rating span')?.textContent || 0);
        return ratingB - ratingA;
      }
      // Default sorting (nearest, price) will be handled by backend
      return 0;
    });
    
    cards.forEach(card => grid.appendChild(card));
    hideLoading();
  }, 500);
});

// View toggle functionality
const toggleBtns = document.querySelectorAll('.toggle-btn');

toggleBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    toggleBtns.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    const view = this.dataset.view;
    const grid = document.getElementById('listingsGrid');
    
    if (view === 'list') {
      grid.style.gridTemplateColumns = '1fr';
    } else {
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    }
  });
});

// View details function
function viewDetails(spaceId) {
  showLoading();
  setTimeout(() => {
    window.location.href = `/study-spaces/${spaceId}/`;
  }, 300);
}

// Create listing function
function createListing() {
  showLoading();
  setTimeout(() => {
    window.location.href = '/study-spaces/create/';
  }, 300);
}

// Edit listing function
function editListing(spaceId) {
  showLoading();
  setTimeout(() => {
    window.location.href = `/study-spaces/${spaceId}/edit/`;
  }, 300);
}

// Delete listing function with enhanced confirmation
function deleteListing(spaceId) {
  const card = document.querySelector(`[data-space-id="${spaceId}"]`);
  const spaceName = card?.querySelector('.card-title')?.textContent || 'this study space';
  
  if (confirm(`Are you sure you want to delete "${spaceName}"?\n\nThis action cannot be undone.`)) {
    showLoading();
    
    fetch(`/api/study-spaces/${spaceId}/delete/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': getCookie('csrftoken'),
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      hideLoading();
      if (response.ok) {
        // Animate card removal
        if (card) {
          card.style.animation = 'fadeOut 0.5s ease-out';
          setTimeout(() => {
            card.remove();
            showNotification('Study space deleted successfully!', 'success');
            updateEmptyState(document.querySelectorAll('.listing-card').length);
          }, 500);
        }
      } else {
        showNotification('Failed to delete study space. Please try again.', 'error');
      }
    })
    .catch(error => {
      hideLoading();
      console.error('Error:', error);
      showNotification('An error occurred. Please try again.', 'error');
    });
  }
}

// Helper function to get CSRF token
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Enhanced notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Loading overlay functions
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Update empty state
function updateEmptyState(visibleCount) {
  const grid = document.getElementById('listingsGrid');
  let emptyState = grid.querySelector('.empty-state');
  
  if (visibleCount === 0 && !emptyState) {
    emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <div class="empty-icon">
        <i class="fas fa-search"></i>
      </div>
      <h3>No Study Spaces Found</h3>
      <p>Try adjusting your search or filters to find what you're looking for</p>
      <button class="btn btn-primary" onclick="resetFilters()">
        <i class="fas fa-redo"></i> Reset Filters
      </button>
    `;
    grid.appendChild(emptyState);
  } else if (visibleCount > 0 && emptyState) {
    emptyState.remove();
  }
}

// Reset filters
function resetFilters() {
  searchInput.value = '';
  searchInput.dispatchEvent(new Event('input'));
  
  filterChips.forEach(chip => {
    chip.classList.remove('active');
    if (chip.dataset.filter === 'all') {
      chip.classList.add('active');
    }
  });
  
  activeFilter = 'all';
  
  const cards = document.querySelectorAll('.listing-card');
  cards.forEach(card => {
    card.style.display = 'block';
    card.style.animation = 'fadeIn 0.5s ease-out';
  });
  
  updateEmptyState(cards.length);
  showNotification('Filters reset successfully!', 'success');
}

// Smooth scroll to top
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Add scroll-to-top button
window.addEventListener('scroll', function() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (window.pageYOffset > 300) {
    if (!scrollBtn) {
      const btn = document.createElement('button');
      btn.id = 'scrollTopBtn';
      btn.className = 'scroll-top-btn';
      btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
      btn.onclick = scrollToTop;
      document.body.appendChild(btn);
    }
  } else {
    if (scrollBtn) {
      scrollBtn.remove();
    }
  }
});

// Add dynamic styles for notifications and animations
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
  /* Notification Styles */
  .notification {
    position: fixed;
    top: -100px;
    right: 20px;
    min-width: 300px;
    max-width: 400px;
    padding: 16px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .notification.show {
    top: 20px;
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }
  
  .notification-content i {
    font-size: 1.3rem;
  }
  
  .notification-success {
    border-left: 4px solid #10b981;
  }
  
  .notification-success .notification-content i {
    color: #10b981;
  }
  
  .notification-error {
    border-left: 4px solid #ef4444;
  }
  
  .notification-error .notification-content i {
    color: #ef4444;
  }
  
  .notification-info {
    border-left: 4px solid #3b82f6;
  }
  
  .notification-info .notification-content i {
    color: #3b82f6;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 5px;
    transition: all 0.3s ease;
  }
  
  .notification-close:hover {
    color: #ef4444;
    transform: scale(1.1);
  }
  
  /* Scroll to top button */
  .scroll-top-btn {
    position: fixed;
    bottom: 100px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: rgba(99, 102, 241, 0.9);
    backdrop-filter: blur(10px);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    transition: all 0.3s ease;
    z-index: 998;
    animation: fadeIn 0.3s ease-out;
  }
  
  .scroll-top-btn:hover {
    background: rgba(79, 70, 229, 1);
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
  }
  
  /* Additional animations */
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  /* Responsive notifications */
  @media (max-width: 768px) {
    .notification {
      right: 10px;
      left: 10px;
      min-width: auto;
    }
    
    .notification.show {
      top: 10px;
    }
    
    .scroll-top-btn {
      bottom: 80px;
      right: 20px;
    }
  }
`;
document.head.appendChild(dynamicStyles);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Animate cards on load
  const cards = document.querySelectorAll('.listing-card');
  cards.forEach((card, index) => {
    card.style.animation = `fadeIn 0.6s ease-out ${index * 0.1}s both`;
  });
  
  // Set initial active filter
  const allFilterChip = document.querySelector('.chip[data-filter="all"]');
  if (allFilterChip) {
    allFilterChip.classList.add('active');
  }
  
  console.log('Study Spaces Listings Loaded! 🎉');
});