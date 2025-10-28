document.addEventListener('DOMContentLoaded', function() {

  const imageUploadInput = document.getElementById('image-upload');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const fileUploadLabel = document.querySelector('.file-upload-label span');

  if (imageUploadInput) {
    imageUploadInput.addEventListener('change', function(event) {
      
      const file = event.target.files[0];

      if (file) {
        // Clear previous preview
        imagePreviewContainer.innerHTML = '';

        // Create new preview
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = document.createElement('img');
          img.src = e.target.result;
          imagePreviewContainer.appendChild(img);
        }
        reader.readAsDataURL(file);

        // Update label text
        if (fileUploadLabel) {
          fileUploadLabel.textContent = file.name; // Show the file name
        }
        
      } else {
        // Reset if no file is selected
        imagePreviewContainer.innerHTML = '';
        if (fileUploadLabel) {
          fileUploadLabel.textContent = 'Upload Space Image';
        }
      }
    });
  }

});