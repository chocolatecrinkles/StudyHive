document.addEventListener("DOMContentLoaded", () => {
  const avatarInput = document.getElementById("avatar-upload");
  const avatarPreview = document.getElementById("avatarPreview");
  const avatarReset = document.getElementById("avatarReset");
  const avatarRemove = document.getElementById("avatarRemove");
  const form = document.querySelector(".settings-form");
  const modal = document.getElementById("updateModal");
  const confirmBtn = document.getElementById("confirmUpdate");
  const cancelBtn = document.getElementById("cancelUpdate");
  const saveBtn = document.getElementById("saveBtn");
  const csrf = document.querySelector("[name=csrfmiddlewaretoken]").value;
  const originalSrc = avatarPreview ? avatarPreview.src : null;

  // Image Preview
  avatarInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (
      file &&
      /^image\/(png|jpe?g)$/i.test(file.type) &&
      file.size <= 5 * 1024 * 1024
    ) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        avatarPreview.src = ev.target.result;
        avatarPreview.dataset.modified = "true";
        toast("Image preview loaded", "success");
      };
      reader.readAsDataURL(file);
    } else {
      toast("Please upload JPG or PNG up to 5MB.", "error");
      avatarInput.value = "";
    }
  });

  // Reset to previous photo
  avatarReset?.addEventListener("click", (e) => {
    e.preventDefault();
    avatarPreview.src = originalSrc;
    delete avatarPreview.dataset.modified;
    delete avatarPreview.dataset.removed;
    avatarInput.value = "";
    toast("Photo reset to original", "success");
  });

  // Remove photo
  avatarRemove?.addEventListener("click", (e) => {
    e.preventDefault();
    const placeholder =
      avatarPreview.dataset.placeholder || "/static/imgs/avatar_placeholder.jpg";
    avatarPreview.src = placeholder;
    avatarPreview.dataset.removed = "true";
    delete avatarPreview.dataset.modified;
    avatarInput.value = "";
    toast("Photo removed (will update on save)", "success");
  });

  // Show confirmation modal
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    modal.classList.add("active");
  });

  // Cancel modal
  cancelBtn?.addEventListener("click", () => modal.classList.remove("active"));

  // Confirm update
  confirmBtn?.addEventListener("click", async () => {
    modal.classList.remove("active");
    saveBtn.disabled = true;
    saveBtn.classList.add("loading");
    saveBtn.textContent = "Updating...";

    try {
      const formData = new FormData(form);
      if (avatarPreview.dataset.removed === "true") {
        formData.append("avatar_removed", "true");
      }

      const res = await fetch(form.action || window.location.href, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrf,
          "X-Requested-With": "XMLHttpRequest",
        },
        body: formData,
      });

      // Try to parse JSON if available, otherwise fallback to redirect
      let data = {};
      try {
        data = await res.json();
      } catch {
        // ignore JSON error
      }

      if (res.ok) {
        showSuccessPopup("Profile Updated Successfully!");
        setTimeout(() => (window.location.href = "/profile/"), 1500);
      } else {
        const msg =
          data.message || "⚠️ Update failed. Please try again.";
        toast(msg, "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast("❌ Something went wrong. Please try again.", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.classList.remove("loading");
      saveBtn.textContent = "Save Changes";
    }
  });

  // Toast helper
  function toast(msg, type = "info") {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  // Success popup
  function showSuccessPopup(msg) {
    const popup = document.createElement("div");
    popup.className = "success-popup";
    popup.innerHTML = `<div class="popup-content">${msg}</div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add("show"), 50);
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 300);
    }, 1500);
  }

  // Close modal when clicking outside
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });
});
