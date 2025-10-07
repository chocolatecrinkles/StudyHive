// ------- AVATAR: choose/reset/drag-drop -------
const avatarInput   = document.getElementById('avatar-upload');
const avatarPreview = document.getElementById('avatarPreview');
const avatarDrop    = document.getElementById('avatarDrop');
const avatarReset   = document.getElementById('avatarReset');
const originalSrc   = avatarPreview ? avatarPreview.getAttribute('src') : null;

function setPreview(file) {
  if (!file) return;
  const okType = /^image\/(png|jpe?g)$/i.test(file.type);
  const okSize = file.size <= 5 * 1024 * 1024;
  if (!okType || !okSize) {
    toast('Please upload a JPG or PNG up to 5MB.', 'error');
    if (avatarInput) avatarInput.value = '';
    return;
  }
  avatarPreview.src = URL.createObjectURL(file);
}

avatarInput?.addEventListener('change', e => setPreview(e.target.files?.[0]));

['dragenter', 'dragover'].forEach(evt =>
  avatarDrop?.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation();
    avatarDrop.classList.add('dragging');
  })
);

['dragleave', 'drop'].forEach(evt =>
  avatarDrop?.addEventListener(evt, e => {
    e.preventDefault(); e.stopPropagation();
    avatarDrop.classList.remove('dragging');
  })
);

avatarDrop?.addEventListener('drop', e => {
  const file = e.dataTransfer.files?.[0];
  if (file) {
    setPreview(file);
    const dt = new DataTransfer();
    dt.items.add(file);
    avatarInput.files = dt.files;
  }
});

avatarDrop?.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    avatarInput?.click();
  }
});

avatarReset?.addEventListener('click', () => {
  if (avatarInput) avatarInput.value = '';
  if (originalSrc && avatarPreview) avatarPreview.src = originalSrc;
});

// ------- BIO: live remaining counter -------
const bio = document.getElementById('bio');
const remaining = document.getElementById('charRemaining');
function updateRemaining() {
  if (!bio || !remaining) return;
  const max = parseInt(bio.getAttribute('maxlength') || '500', 10);
  const left = Math.max(0, max - bio.value.length);
  remaining.textContent = left;
  remaining.parentElement.classList.toggle('over', left === 0);
}
bio?.addEventListener('input', updateRemaining);
updateRemaining();

// ------- SAVE: confirm modal + AJAX -------
(function() {
  const form = document.querySelector('.settings-form');
  const saveBtn = document.getElementById('saveBtn');
  const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value;

  if (!form) return;

  // Create confirmation modal dynamically
  const modal = document.createElement('div');
  modal.className = 'confirm-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Confirm Update</h3>
      <p>Are you sure you want to update your profile?</p>
      <div class="modal-actions">
        <button type="button" class="btn-cancel">Cancel</button>
        <button type="button" class="btn-confirm">Yes, Update</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const cancelBtn = modal.querySelector('.btn-cancel');
  const confirmBtn = modal.querySelector('.btn-confirm');

  form.addEventListener('submit', e => {
    e.preventDefault();
    modal.classList.add('active');
  });

  cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  confirmBtn.addEventListener('click', async () => {
    modal.classList.remove('active');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Updating...';

    try {
      const body = new FormData(form);
      const res = await fetch(form.getAttribute('action') || window.location.href, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrf,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        },
        body
      });

      const data = await res.json();
      if (data.status === 'ok') {
        showSuccessPopup('✅ Successfully updated!');
        setTimeout(() => {
          window.location.href = '/profile/'; // redirect to profile page
        }, 1800);
      } else {
        toast('⚠️ Update failed.', 'error');
      }

    } catch (err) {
      console.error(err);
      toast('❌ Something went wrong while saving.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  });
})();

// ------- Toast helper -------
function toast(message, type='info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => toast.classList.remove('show'), 3000);
  setTimeout(() => toast.remove(), 3500);
}

// ------- Success popup helper -------
function showSuccessPopup(message) {
  const popup = document.createElement('div');
  popup.className = 'success-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <h3>${message}</h3>
    </div>`;
  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add('show'), 50);
  setTimeout(() => popup.classList.remove('show'), 1500);
  setTimeout(() => popup.remove(), 2000);
}
