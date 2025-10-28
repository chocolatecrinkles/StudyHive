// This function is called by the 'onsubmit' event in your HTML.
function confirmDelete(event, name) {
  // Prevent the form from submitting immediately
  event.preventDefault(); 

  // Show a confirmation dialog
  // Using 'name' makes the message dynamic and safer
  const isConfirmed = confirm(`Are you sure you want to permanently delete "${name}"?`);

  // If the user clicked "OK", submit the form
  if (isConfirmed) {
    event.target.submit();
  }
  // If they clicked "Cancel", do nothing
}