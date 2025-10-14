document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".listing-form");
  const imageInput = document.getElementById("image");
  const ratingInput = document.getElementById("rating");
  const submitBtn = document.querySelector(".submit-btn");

  // 🖼️ Create dynamic image preview container
  const previewContainer = document.createElement("div");
  previewContainer.classList.add("image-preview-container");
  imageInput.parentNode.appendChild(previewContainer);

  // 📸 Live Image Preview
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    previewContainer.innerHTML = "";

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target.result;
        img.alt = "Preview";
        img.classList.add("image-preview");
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      previewContainer.innerHTML = "<p style='color:#777;'>No valid image selected.</p>";
    }
  });

  // ✅ Activate Save button when form is complete
  form.addEventListener("input", () => {
    const name = form.querySelector("#name").value.trim();
    const location = form.querySelector("#location").value.trim();
    const description = form.querySelector("#description").value.trim();
    const rating = form.querySelector("#rating").value.trim();

    if (name && location && description && rating) {
      submitBtn.classList.add("active");
    } else {
      submitBtn.classList.remove("active");
    }
  });

  // 🚀 Form Validation + Real Submit
  form.addEventListener("submit", (e) => {
    const name = document.getElementById("name").value.trim();
    const location = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();
    const rating = parseFloat(ratingInput.value);

    if (!name || !location || !description) {
      e.preventDefault();
      alert("⚠️ Please fill out all required fields.");
      return;
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      e.preventDefault();
      alert("⚠️ Please enter a valid rating between 1 and 5.");
      return;
    }

    if (!confirm("Are you sure you want to save this listing?")) {
      e.preventDefault();
      return;
    }

    // ✅ Let Django handle the POST + redirect
    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;
  });
});
