document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backBtn")
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back()
    })
  }

  // Form validation and enhancement
  const form = document.getElementById("staffApplicationForm")
  if (form) {
    // Validation rules
    const validators = {
      text: (value) => value.trim().length >= 2,
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: (value) => /^[\d\s\-+$$$$]{10,}$/.test(value.replace(/\s/g, "")),
      url: (value) => !value || /^https?:\/\/.+/.test(value),
    }

    // File validation
    const fileInputs = form.querySelectorAll('input[type="file"]')
    fileInputs.forEach((input) => {
      input.addEventListener("change", function () {
        const file = this.files[0]
        if (file) {
          // Check file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            showError(this)
            this.value = ""
            return
          }

          // Show file preview
          const preview = document.createElement("div")
          preview.className = "file-preview"
          preview.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`

          // Remove previous preview if exists
          const oldPreview = this.parentElement.querySelector(".file-preview")
          if (oldPreview) oldPreview.remove()

          this.parentElement.appendChild(preview)
          clearError(this)
        }
      })
    })

    // Real-time validation
    const inputs = form.querySelectorAll("input[data-validate], textarea")
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateField(this)
      })

      input.addEventListener("input", function () {
        if (this.classList.contains("error")) {
          validateField(this)
        }
      })
    })

    function validateField(field) {
      const validationType = field.dataset.validate
      if (!validationType) return true

      const isValid = !field.value || validators[validationType](field.value)

      if (field.hasAttribute("required") && !field.value) {
        showError(field)
        return false
      }

      if (field.value && !isValid) {
        showError(field)
        return false
      }

      clearError(field)
      return true
    }

    function showError(field) {
      field.classList.add("error")
      field.style.borderColor = "#d93a3a"
      const errorDiv = field.parentElement.querySelector(".form-error")
      if (errorDiv) {
        errorDiv.classList.add("show")
      }
    }

    function clearError(field) {
      field.classList.remove("error")
      field.style.borderColor = ""
      const errorDiv = field.parentElement.querySelector(".form-error")
      if (errorDiv) {
        errorDiv.classList.remove("show")
      }
    }

    // Form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault()

      let isFormValid = true
      const requiredInputs = form.querySelectorAll("input[required], textarea[required]")

      requiredInputs.forEach((input) => {
        if (!validateField(input)) {
          isFormValid = false
        }
      })

      if (isFormValid) {
        const submitBtn = document.getElementById("submitBtn")
        submitBtn.disabled = true
        submitBtn.textContent = "Submitting..."

        // Simulate submission delay for better UX
        setTimeout(() => {
          form.submit()
        }, 500)
      } else {
        // Shake animation on error
        form.style.animation = "shake 0.3s ease-in-out"
        setTimeout(() => {
          form.style.animation = ""
        }, 300)
      }
    })
  }

  // Smooth scroll to first error
  function scrollToFirstError() {
    const firstError = document.querySelector(".form-error.show")
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }
})
