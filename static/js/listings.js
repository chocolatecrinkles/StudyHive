document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const clearSearch = document.getElementById("clearSearch");
  const sortOptions = document.getElementById("sortOptions");
  const chips = document.querySelectorAll(".chip");
  const listingsGrid = document.getElementById("listingsGrid");
  const toggleBtns = document.querySelectorAll(".toggle-btn");
  const allCards = Array.from(document.querySelectorAll(".listing-card"));

  // SEARCH
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    clearSearch.style.display = query ? "block" : "none";
    allCards.forEach(card => {
      const name = card.dataset.name.toLowerCase();
      card.style.display = name.includes(query) ? "block" : "none";
    });
  });

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    clearSearch.style.display = "none";
    allCards.forEach(card => (card.style.display = "block"));
  });

  // SORT
  sortOptions.addEventListener("change", () => {
    const sortBy = sortOptions.value;
    const sorted = [...allCards];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "rating": return b.dataset.rating - a.dataset.rating;
        case "price": return a.dataset.free === "true" ? -1 : 1;
        case "name": return a.dataset.name.localeCompare(b.dataset.name);
        default: return 0;
      }
    });
    listingsGrid.innerHTML = "";
    sorted.forEach(card => listingsGrid.appendChild(card));
  });

  // FILTER
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const filter = chip.dataset.filter;
      allCards.forEach(card => {
        if (filter === "all" || card.dataset[filter] === "true") {
          card.style.display = "block";
        } else card.style.display = "none";
      });
    });
  });

  // GRID/LIST TOGGLE
  toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      toggleBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      listingsGrid.classList.toggle("list-view", btn.dataset.view === "list");
    });
  });

  // LOADING OVERLAY
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  overlay.innerHTML = `<div class="spinner"></div><p>Loading Study Spots...</p>`;
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 400);
  }, 800);
});

// QUICK VIEW / EDIT / DELETE
function viewDetails(id) {
  alert("Viewing details for Listing ID: " + id);
}

function editListing(id) {
  alert("Editing Listing ID: " + id);
}

function deleteListing(id) {
  if (confirm("Are you sure you want to delete this listing?")) {
    const card = document.querySelector(`.listing-card:nth-child(${id})`);
    if (card) card.remove();
    alert("Listing deleted.");
  }
}


function confirmDelete(event, name) {
      event.preventDefault();
      if (confirm(`🗑️ Delete "${name}" permanently?`)) {
        event.target.submit();
      }
    }


