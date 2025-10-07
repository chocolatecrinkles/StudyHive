// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  
  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add animation on scroll for detail items
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe detail items
  document.querySelectorAll('.detail-item').forEach(item => {
    observer.observe(item);
  });

  // Add hover effect to profile card
  const profileCard = document.querySelector('.profile-card');
  if (profileCard) {
    profileCard.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });

    profileCard.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  }

  // Add hover effect to detail values
  const detailValues = document.querySelectorAll('.detail-value');
  detailValues.forEach(detail => {
    detail.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(5px)';
    });

    detail.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
    });
  });

  // Lazy load avatar image
  const avatarImg = document.querySelector('.profile-avatar img');
  if (avatarImg && avatarImg.dataset.src) {
    const img = new Image();
    img.onload = function() {
      avatarImg.src = this.src;
      avatarImg.classList.add('loaded');
    };
    img.src = avatarImg.dataset.src;
  }

  // Add copy to clipboard for email
  const emailValue = document.querySelector('.detail-item:has(label [class*="envelope"]) .detail-value');
  if (emailValue) {
    emailValue.style.cursor = 'pointer';
    emailValue.title = 'Click to copy email';
    
    emailValue.addEventListener('click', function() {
      const email = this.textContent.trim();
      if (email && email !== 'Not provided') {
        navigator.clipboard.writeText(email).then(() => {
          showToast('Email copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy email', 'error');
        });
      }
    });
  }

  // Add copy to clipboard for phone number
  const phoneValue = document.querySelector('.detail-item:has(label [class*="phone"]) .detail-value');
  if (phoneValue) {
    phoneValue.style.cursor = 'pointer';
    phoneValue.title = 'Click to copy phone number';
    
    phoneValue.addEventListener('click', function() {
      const phone = this.textContent.trim();
      if (phone && phone !== 'Not provided') {
        navigator.clipboard.writeText(phone).then(() => {
          showToast('Phone number copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Failed to copy phone number', 'error');
        });
      }
    });
  }

  // Toast notification function
  function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Add keyboard navigation
  document.addEventListener('keydown', function(e) {
    // Press 'M' to go to manage profile
    if (e.key === 'm' || e.key === 'M') {
      const manageBtn = document.querySelector('.btn-manage');
      if (manageBtn && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
          manageBtn.click();
        }
      }
    }
  });

  // Add print functionality
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      window.print();
    }
  });

  // Add loading animation for manage profile button
  const manageBtn = document.querySelector('.btn-manage');
  if (manageBtn) {
    manageBtn.addEventListener('click', function(e) {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      this.style.pointerEvents = 'none';
    });
  }

  // Performance optimization - reduce animations on low-end devices
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    document.body.classList.add('reduce-motion');
  }

  // Add focus visible for accessibility
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-nav');
  });

  console.log('Profile page initialized successfully');
});


function confirmLogout() {
  const confirmAction = confirm("Are you sure you want to log out?");
  if (confirmAction) {
    window.location.href = "{% url 'core:logout' %}";
  }
}

function openLogoutModal() {
  document.getElementById('logoutModal').style.display = 'flex';
}

function closeLogoutModal() {
  document.getElementById('logoutModal').style.display = 'none';
}

// ✅ Handle logout redirect safely (correctly processed by Django)
document.addEventListener("DOMContentLoaded", () => {
  const logoutModal = document.getElementById("logoutModal");
  const logoutUrl = logoutModal.getAttribute("data-logout-url");

  document.getElementById("confirmLogout").addEventListener("click", () => {
    window.location.href = logoutUrl;
  });
});