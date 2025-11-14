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

    // --- FIELD REFERENCES ---
    const firstNameInput = document.getElementById("first_name");
    const lastNameInput = document.getElementById("last_name");
    const middleInitialInput = document.getElementById("middle_initial");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone_number");
    // -------------------------

    // Global variables for uniqueness state and original value
    let isUsernameUnique = true; 
    let originalUsername = usernameInput.value.trim(); 

    // Store original form data (trimmed)
    const initialData = {};
    form.querySelectorAll("input, textarea, select").forEach((el) => {
        if (el.id === 'phone_number') {
            initialData[el.name] = (el.value || "").replace(/\s/g, '').trim();
        } else {
            initialData[el.name] = (el.value || "").trim();
        }
    });

    // Initially disable Save button
    saveBtn.disabled = true;
    saveBtn.classList.add("btn-disabled");

    // --- UTILITY FUNCTIONS (Error Display) ---

    function showTransientError(inputEl, msg, isError = true) {
        // Remove existing message for the field
        inputEl.closest('.form-group')?.querySelectorAll(`.error-message[data-field="${inputEl.name}"], .success-message[data-field="${inputEl.name}"]`).forEach(el => el.remove());

        // Determine the class based on whether it's an error or success/checking status
        const className = isError ? 'error-message transient-error' : 'success-message transient-status';

        // Display new transient error
        const errorDiv = document.createElement('div');
        errorDiv.className = className;
        errorDiv.setAttribute('data-field', inputEl.name);
        errorDiv.textContent = isError ? `Error: ${msg}` : msg; // Only add 'Error:' prefix if it's a true error
        
        const fieldHint = inputEl.closest('.form-group').querySelector('.field-hint');
        if (fieldHint) {
            inputEl.closest('.form-group').insertBefore(errorDiv, fieldHint);
        } else {
            inputEl.closest('.form-group').appendChild(errorDiv);
        }
        
        // Toggle input border color
        if (isError) {
            inputEl.classList.add('input-error');
        } else {
            inputEl.classList.remove('input-error');
        }
    }

    function clearFormErrors() {
        form.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
        form.querySelectorAll('.form-group input, .form-group textarea').forEach(el => {
            el.classList.remove('input-error');
        });
    }

    function displayFieldErrors(errors) {
        clearFormErrors();
        
        for (const [fieldName, messages] of Object.entries(errors)) {
            const inputElement = document.querySelector(`[name="${fieldName}"]`);
            if (inputElement) {
                const formGroup = inputElement.closest('.form-group');
                if (formGroup) {
                    inputElement.classList.add('input-error');
                    
                    messages.forEach(msg => {
                        if (!formGroup.querySelector(`.error-message[data-field="${fieldName}"][data-message="${msg}"]`)) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message';
                            errorDiv.setAttribute('data-field', fieldName);
                            errorDiv.setAttribute('data-message', msg);
                            errorDiv.textContent = `Error: ${msg}`;
                            
                            const fieldHint = formGroup.querySelector('.field-hint');
                            if (fieldHint) {
                                formGroup.insertBefore(errorDiv, fieldHint);
                            } else {
                                formGroup.appendChild(errorDiv);
                            }
                        }
                    });
                }
            } else {
                console.error(`General Update Error: ${messages.join(' ')}`);
            }
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|ph|co|io|gov|edu)$/i;
        return emailRegex.test(email);
    }

    // --- ASYNC UNIQUNESS CHECK ---
    async function checkUsernameUniqueness() {
        const currentUsername = usernameInput.value.trim();
        isUsernameUnique = false; 

        if (currentUsername === originalUsername || currentUsername === "") {
            isUsernameUnique = true;
            usernameInput.classList.remove('input-error');
            usernameInput.closest('.form-group').querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
            return;
        }

        showTransientError(usernameInput, "Checking availability...", false); 

        try {
            const response = await fetch(`/api/check-username/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrf,
                },
                body: JSON.stringify({ username: currentUsername }),
            });

            if (!response.ok) {
                 throw new Error(`Server returned status ${response.status}`);
            }

            const data = await response.json();

            usernameInput.closest('.form-group').querySelectorAll('.error-message, .success-message').forEach(el => el.remove());

            if (data.is_available === false) {
                showTransientError(usernameInput, "Username already taken.", true);
                isUsernameUnique = false;
            } else {
                showTransientError(usernameInput, "Username is available.", false);
                isUsernameUnique = true;
            }

        } catch (error) {
            console.error("Username availability check failed:", error);
            usernameInput.closest('.form-group').querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
            
            isUsernameUnique = true; 
            usernameInput.classList.remove('input-error');
            showTransientError(usernameInput, "Could not verify availability. Proceeding to save.", false); 
        }
        
        checkFormChanges(); 
    }
    // ----------------------------

    // Function to validate all required fields and collect errors
    function validateRequiredFields() {
        clearFormErrors(); 
        const errors = {};
        const namePattern = /^[A-Za-z\s]+$/; 
        const middleInitialPattern = /^[A-Za-z]$/; 

        const fieldsToCheck = [
            { el: firstNameInput, name: "first_name", displayName: "First Name", pattern: namePattern },
            { el: lastNameInput, name: "last_name", displayName: "Last Name", pattern: namePattern },
            { el: usernameInput, name: "username", displayName: "Username" },
            { el: emailInput, name: "email", displayName: "Email Address" },
        ];

        for (const field of fieldsToCheck) {
            const value = field.el.value.trim();

            if (value === "") {
                errors[field.name] = errors[field.name] || [];
                errors[field.name].push(`The ${field.displayName} field is required.`);
            } else if (field.pattern && !field.pattern.test(value)) {
                errors[field.name] = errors[field.name] || [];
                errors[field.name].push(`${field.displayName} should only contain letters and spaces.`);
            } else if (field.el === emailInput && !isValidEmail(value)) {
                errors[field.name] = errors[field.name] || [];
                errors[field.name].push("Please enter a valid email address with a common domain.");
            }
        }
        
        // --- UNIQUE USERNAME CHECK ON SUBMIT ---
        if (usernameInput.value.trim() !== originalUsername && !isUsernameUnique) {
            errors[usernameInput.name] = errors[usernameInput.name] || [];
            errors[usernameInput.name].push("Username is already taken or the check failed.");
        }
        // ---------------------------------------

        // --- MIDDLE INITIAL VALIDATION ---
        const miValue = middleInitialInput.value.trim();
        if (miValue !== "") {
            if (miValue.length > 1 || !middleInitialPattern.test(miValue)) {
                errors[middleInitialInput.name] = errors[middleInitialInput.name] || [];
                errors[middleInitialInput.name].push("M.I. must be a single letter only.");
            }
        }

        // Phone Number Check (if filled - optional field)
        const phoneValueClean = phoneInput.value.trim().replace(/\s/g, '');
        
        // Treat as blank if only the prefix "+63" (length 3) is present.
        if (phoneValueClean.length > 0 && phoneValueClean !== '+63') {
            if (!/^\+639\d{9}$/.test(phoneValueClean)) {
                errors[phoneInput.name] = errors[phoneInput.name] || [];
                errors[phoneInput.name].push("Phone number must be in the format +639XXXXXXXXX (10 digits after +63).");
            }
        }

        if (Object.keys(errors).length > 0) {
            displayFieldErrors(errors);
            console.warn("Client-side validation failed. Check fields marked with errors.");
            return false;
        }

        return true;
    }
    // --- END VALIDATION & ERROR HANDLING FUNCTIONS ---

    // Middle Initial Auto-Capitalization
    middleInitialInput?.addEventListener('input', function() {
        if (this.value) {
            this.value = this.value.toUpperCase();
        }
    });
    
    // --- USERNAME ASYNC CHECK ON BLUR ---
    usernameInput?.addEventListener('blur', checkUsernameUniqueness);

    // Phone Number Auto-Spacing and Prefix Enforcement (No change)
    phoneInput?.addEventListener('input', function() {
        let value = this.value.replace(/\s/g, '').replace(/[^\d+]/g, ''); 

        if (!value.startsWith('+63')) {
            value = '+63' + value.replace(/\+63/, '').replace(/^\+/, '');
        }

        if (value.length > 13) {
            value = value.substring(0, 13);
        }

        if (value.length > 3) {
            value = value.slice(0, 3) + ' ' + value.slice(3);
        }
        if (value.length > 7) {
            value = value.slice(0, 7) + ' ' + value.slice(7);
        }
        if (value.length > 11) {
            value = value.slice(0, 11) + ' ' + value.slice(11);
        }

        this.value = value;
        checkFormChanges();
    });
    
    // Email domain lowercase fix
    emailInput?.addEventListener('blur', function() {
        const atIndex = this.value.indexOf('@');
        
        if (atIndex !== -1) {
            const localPart = this.value.substring(0, atIndex + 1);
            const domainPart = this.value.substring(atIndex + 1);
            
            this.value = localPart + domainPart.toLowerCase();
            
            checkFormChanges(); 
        }
    });

    // Clear error class on input/change (MODIFIED TO CLEAR SUCCESS MESSAGE ON INPUT)
    form.addEventListener('input', (e) => {
        const target = e.target;
        
        // Check if the target input is the username field
        if (target === usernameInput) {
             // Clear any lingering green success messages
             target.closest('.form-group')?.querySelectorAll('.success-message').forEach(el => el.remove());
             
             // Set state to checking until blur event can fire (prevents immediate re-validation)
             if (target.value.trim() !== originalUsername) {
                isUsernameUnique = false;
             }
        }

        // Clear red error class and message on any input
        if (target.classList.contains('input-error')) {
            target.classList.remove('input-error');
            target.closest('.form-group')?.querySelectorAll(`.error-message[data-field="${target.name}"]`).forEach(el => el.remove());
        }
        
        checkFormChanges();
    });

    // --- Profile Picture Handlers (FIXED PREVIEW LOGIC) ---
    avatarInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        
        // Check file validation before proceeding
        if (file && /^image\/(png|jpe?g)$/i.test(file.type) && file.size <= 5 * 1024 * 1024) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                avatarPreview.src = ev.target.result;
                avatarPreview.dataset.modified = "true";
                checkFormChanges();
                console.log("Image preview loaded.");
            };
            reader.readAsDataURL(file);
        } else if (file) {
             console.error("Please upload JPG or PNG up to 5MB.");
             avatarInput.value = "";
        }
        
        // Crucial: Update state even if file validation fails (to disable button if no changes were made otherwise)
        if (file) {
            avatarPreview.dataset.modified = "true";
        }
        checkFormChanges();
    });

    // Reset photo (Preview change only)
    avatarReset?.addEventListener("click", (e) => {
        e.preventDefault();
        avatarPreview.src = originalSrc;
        delete avatarPreview.dataset.modified;
        delete avatarPreview.dataset.removed;
        avatarInput.value = ""; // Crucial to clear file input so same file can be selected again
        checkFormChanges();
        console.log("Photo reset to original preview. Click 'Save' to confirm.");
    });

    // Remove photo (Preview change only)
    avatarRemove?.addEventListener("click", (e) => {
        e.preventDefault();
        const placeholder =
            avatarPreview.dataset.placeholder || "/static/imgs/avatar_placeholder.jpg";
        avatarPreview.src = placeholder;
        avatarPreview.dataset.removed = "true"; // CRUCIAL flag sent to server
        delete avatarPreview.dataset.modified;
        avatarInput.value = ""; 
        checkFormChanges();
        console.log("Photo marked for removal. Click 'Save' to confirm.");
    });
    // --- End Profile Picture Handlers ---


    // Track changes on all inputs
    function checkFormChanges() {
        let changed = false;

        form.querySelectorAll("input, textarea, select").forEach((el) => {
            let original;
            let current;

            if (el.id === 'phone_number') {
                original = (initialData[el.name] || "").trim();
                current = (el.value || "").replace(/\s/g, '').trim();
            } else {
                original = (initialData[el.name] || "").trim();
                current = (el.value || "").trim();
            }

            if (original !== current) changed = true;
        });

        // Avatar changes count too
        if (
            avatarPreview.dataset.modified === "true" ||
            avatarPreview.dataset.removed === "true" ||
            avatarPreview.src !== originalSrc
        ) {
            changed = true;
        }
        
        // Disable save button if username check failed or if the check is pending
        if (usernameInput.value.trim() !== originalUsername && !isUsernameUnique) {
            changed = false;
        }

        toggleSaveButton(changed);
    }

    function toggleSaveButton(state) {
        if (state) {
            saveBtn.disabled = false;
            saveBtn.classList.remove("btn-disabled");
            saveBtn.classList.add("btn-active");
        } else {
            saveBtn.disabled = true;
            saveBtn.classList.add("btn-disabled");
            saveBtn.classList.remove("btn-active");
        }
    }


    // Show modal on submit (UPDATED to use async validate)
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Wait for asynchronous check to resolve before proceeding
        await checkUsernameUniqueness(); 

        if (!validateRequiredFields()) {
            return; 
        }

        modal.classList.add("active");
    });

    // Cancel modal
    cancelBtn?.addEventListener("click", () => modal.classList.remove("active"));

    // Confirm update (Server-side error handling)
    confirmBtn?.addEventListener("click", async () => {
        modal.classList.remove("active");
        saveBtn.disabled = true;
        saveBtn.classList.add("loading");
        saveBtn.textContent = "Updating...";
        
        clearFormErrors();

        try {
            const formData = new FormData(form);
            
            // CRITICAL: Send flag if user chose to remove the avatar
            if (avatarPreview.dataset.removed === "true") {
                formData.append("avatar_removed", "true");
            }
            // Note: If avatarInput has a file (new upload), FormData automatically includes it.

            const cleanPhoneNumber = phoneInput.value.replace(/\s/g, '');
            
            // --- ONLY SEND PHONE NUMBER IF IT HAS MORE THAN JUST '+63' ---
            if (cleanPhoneNumber.length > 3) { 
                 formData.set('phone_number', cleanPhoneNumber);
            } else {
                 formData.delete('phone_number');
            }
            // ---------------------------------------------------------

            const res = await fetch(form.action || window.location.href, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrf,
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: formData,
            });

            let data = {};
            try {
                data = await res.json();
            } catch (e) {
                // Ignore if not JSON
            }

            if (res.ok) {
                console.log("✅ Profile Updated Successfully. Redirecting to profile page...");
                
                // --- CRITICAL FIX: Refresh source on success before redirecting ---
                // We update the originalSrc with the new profile picture URL 
                // received from the server (if available) or the default placeholder,
                // then redirect. However, since the server response (data) doesn't
                // contain the new URL directly, we need to rely on the server 
                // redirecting to load the new URL, OR, since we are AJAX, we 
                // use location.reload() to force the page to fetch the new URL.
                
                // Forcing redirect to /profile/ will cause the browser to reload the data.
                // The main task is making sure the profile page has the right URL.
                
                setTimeout(() => (window.location.href = "/profile/"), 500); 
            } else {
                if (data.errors) {
                    displayFieldErrors(data.errors);
                    console.error("❌ Server validation failed. Please check fields marked with errors.");
                } else {
                    console.error(`❌ Update failed: ${data.message || 'Unknown server error.'}`);
                }
            }
        } catch (err) {
            console.error("❌ Network or unknown update error:", err);
        } finally {
            saveBtn.disabled = false;
            saveBtn.classList.remove("loading");
            saveBtn.textContent = "Save Changes";
        }
    });

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("active");
    });
    
    checkUsernameUniqueness();
});