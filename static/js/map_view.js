// StudyHive Map View - Interactive JavaScript

// ===== DOM Elements =====
const mapSidebar = document.getElementById("mapSidebar")
const menuBtn = document.getElementById("menuBtn")
const dropdownBtn = document.getElementById("dropdownBtn")
const userDropdown = document.getElementById("userDropdown")
const logoutLink = document.getElementById("logoutLink")
const logoutModal = document.getElementById("logoutModal")
const cancelLogout = document.getElementById("cancelLogout")
const confirmLogout = document.getElementById("confirmLogout")

const filterBtn = document.getElementById("filterBtn")
const filterPopup = document.getElementById("filterPopup")
const closeFilterBtn = document.getElementById("closeFilterBtn")
const applyFiltersBtn = document.getElementById("applyFiltersBtn")
const clearFiltersBtn = document.getElementById("clearFiltersBtn")

const menuDots = document.getElementById("menuDots")
const dropdownMenu = document.getElementById("dropdownMenu")

const zoomIn = document.getElementById("zoomIn")
const zoomOut = document.getElementById("zoomOut")
const searchAsMove = document.getElementById("searchAsMove")
const distanceSlider = document.getElementById("distanceSlider")
const distanceValue = document.getElementById("distanceValue")


// const spotCards = document.querySelectorAll(".spot-card")
const spotCards = document.querySelectorAll(".map-card-link")
const mapMarkers = document.querySelectorAll(".map-marker")
const filterChips = document.querySelectorAll(".filter-chip")
const mapPreviewCard = document.getElementById("mapPreviewCard")
const previewCloseBtn = document.querySelector(".preview-close")

const searchSpot = document.getElementById("searchSpot")
const searchTriggerBtn = document.getElementById("searchTriggerBtn")

const previewImage = document.querySelector(".preview-spot-image")
const previewTitle = document.querySelector(".preview-spot-title")
const previewRatingValue = document.querySelector(".preview-rating-value")
const previewRatingStars = document.querySelector(".preview-rating-stars")
const previewLocationText = document.querySelector(".preview-location-text")
const previewStatusBadge = document.querySelector(".preview-status-badge")
const previewTagsContainer = document.querySelector(".preview-spot-tags")
const viewDetailsBtn = document.querySelector(".preview-view-btn")

const spotDataMap = new Map()
let currentPreviewSpotId = null
let currentPreviewDetailUrl = null

const amenityDefinitions = {
  wifi: { label: "Free Wi-Fi", icon: "fa-wifi" },
  open24: { label: "24/7", icon: "fa-clock" },
  outlets: { label: "Outlets", icon: "fa-plug" },
  coffee: { label: "Coffee", icon: "fa-mug-hot" },
  ac: { label: "AC", icon: "fa-snowflake" },
  pastries: { label: "Pastries", icon: "fa-bread-slice" },
  trending: { label: "Trending", icon: "fa-fire" },
}

function datasetToBool(value) {
  if (typeof value === "boolean") return value
  if (value === undefined || value === null) return false
  const normalized = String(value).toLowerCase()
  return normalized === "true" || normalized === "1" || normalized === "yes"
}

function registerSpotData() {
  spotCards.forEach((card) => {
    const data = card.dataset
    const spotId = data.spotId
    if (!spotId) return

    const ratingValue = Number.parseFloat(data.rating)
    const detailUrl = data.detailUrl || card.getAttribute("href") || ""
    const spotName = data.name || card.querySelector("h3")?.textContent?.trim() || "Untitled Spot"
    const spotLocation = data.location || card.querySelector(".spot-location span")?.textContent?.trim() || ""
    const status = (data.status || "closed").toLowerCase()
    const image = data.image || previewImage?.dataset?.placeholder || ""

    const amenityFlags = {
      wifi: datasetToBool(data.wifi),
      open24: datasetToBool(data.open24),
      outlets: datasetToBool(data.outlets),
      coffee: datasetToBool(data.coffee),
      ac: datasetToBool(data.ac),
      pastries: datasetToBool(data.pastries),
      trending: datasetToBool(data.trending),
    }

    const amenityTags = Object.entries(amenityFlags)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key)

    spotDataMap.set(spotId, {
      id: spotId,
      name: spotName,
      location: spotLocation,
      rating: Number.isFinite(ratingValue) ? ratingValue : 0,
      status,
      image,
      detailUrl,
      amenities: amenityFlags,
      tags: amenityTags,
    })
  })
}

registerSpotData()

// ===== State Management =====
let currentZoom = 1
const favorites = new Set()
let activeFilters = {
  amenities: [],
  hours: "any",
  price: "1",
  rating: 4.5,
  distance: 5,
}
const visibleMarkers = new Set()

// ===== Sidebar Toggle =====
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    mapSidebar.classList.toggle("collapsed")
  })
}

spotCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    const spotId = card.dataset.spotId
    if (!spotId) return

    const isModifiedClick =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
    if (isModifiedClick) {
      return
    }

    event.preventDefault()

    if (window.innerWidth <= 768) {
      mapSidebar.classList.add("collapsed")
    }

    showPreviewCard(spotId)
  })
})

// ===== User Dropdown =====
if (dropdownBtn) {
  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block"
  })
}

document.addEventListener("click", (e) => {
  if (userDropdown && !e.target.closest(".user-dropdown")) {
    userDropdown.style.display = "none"
  }
})

// ===== Logout Modal =====
if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault()
    logoutModal.classList.add("active")
    if (userDropdown) userDropdown.style.display = "none"
  })
}

if (cancelLogout) {
  cancelLogout.addEventListener("click", () => {
    logoutModal.classList.remove("active")
  })
}

if (confirmLogout) {
  confirmLogout.addEventListener("click", () => {
    console.log("Logging out...")
    // Add actual logout logic here
    // e.g., window.location.href = "{% url 'core:logout' %}"
  })
}

if (logoutModal) {
  logoutModal.addEventListener("click", (e) => {
    if (e.target === logoutModal) {
      logoutModal.classList.remove("active")
    }
  })
}

// ===== Filter Popup =====
if (filterBtn) {
  filterBtn.addEventListener("click", () => {
    filterPopup.classList.add("active")
  })
}

if (closeFilterBtn) {
  closeFilterBtn.addEventListener("click", () => {
    filterPopup.classList.remove("active")
  })
}

if (filterPopup) {
  filterPopup.addEventListener("click", (e) => {
    if (e.target === filterPopup) {
      filterPopup.classList.remove("active")
    }
  })
}























// ===== Filter Functionality =====
// const amenityCheckboxes = document.querySelectorAll('.checkbox-grid input[type="checkbox"]')
// const hoursRadios = document.querySelectorAll('input[name="hours"]')
// const priceRadios = document.querySelectorAll('input[name="price"]')
// const ratingBtns = document.querySelectorAll(".rating-btn")

// amenityCheckboxes.forEach((checkbox) => {
//   checkbox.addEventListener("change", () => {
//     updateAmenityFilters()
//   })
// })

// hoursRadios.forEach((radio) => {
//   radio.addEventListener("change", (e) => {
//     activeFilters.hours = e.target.value
//   })
// })

// priceRadios.forEach((radio) => {
//   radio.addEventListener("change", (e) => {
//     activeFilters.price = e.target.value
//   })
// })

// ratingBtns.forEach((btn) => {
//   btn.addEventListener("click", () => {
//     ratingBtns.forEach((b) => b.classList.remove("active"))
//     btn.classList.add("active")
//     activeFilters.rating = Number.parseFloat(btn.dataset.rating)
//   })
// })

// if (distanceSlider) {
//   distanceSlider.addEventListener("input", (e) => {
//     activeFilters.distance = Number.parseFloat(e.target.value)
//     distanceValue.textContent = `${activeFilters.distance} km`
//   })
// }

// function updateAmenityFilters() {
//   activeFilters.amenities = Array.from(amenityCheckboxes)
//     .filter((cb) => cb.checked)
//     .map((cb) => cb.id)
// }

// if (applyFiltersBtn) {
//   applyFiltersBtn.addEventListener("click", () => {
//     filterPopup.classList.remove("active")
//     applyFilters()
//   })
// }

// if (clearFiltersBtn) {
//   clearFiltersBtn.addEventListener("click", () => {
//     amenityCheckboxes.forEach((cb) => (cb.checked = false))
//     hoursRadios[0].checked = true
//     priceRadios[0].checked = true
//     ratingBtns.forEach((btn) => btn.classList.remove("active"))
//     ratingBtns[2].classList.add("active")
//     distanceSlider.value = 5
//     distanceValue.textContent = "5 km"

//     activeFilters = {
//       amenities: [],
//       hours: "any",
//       price: "1",
//       rating: 4.5,
//       distance: 5,
//     }
//     // After clearing, re-apply to show all
//     applyFilters()
//   })
// }


























function applyFilters() {
  spotCards.forEach((card) => {
    const spotId = card.dataset.spotId
    const spot = spotDataMap.get(spotId)
    if (!spot) return

    let shouldShow = true

    if (spot.rating < activeFilters.rating) {
      shouldShow = false
    }

    if (activeFilters.hours === "open" && spot.status !== "open") {
      shouldShow = false
    }
    if (activeFilters.hours === "24h" && !spot.amenities.open24) {
      shouldShow = false
    }

    if (activeFilters.amenities.length > 0) {
      const hasAllAmenities = activeFilters.amenities.every((amenity) => {
        if (!(amenity in spot.amenities)) {
          return false
        }
        return Boolean(spot.amenities[amenity])
      })
      if (!hasAllAmenities) shouldShow = false
    }

    card.style.display = shouldShow ? "block" : "none"
  })
  updateMarkerVisibility() // Update markers based on filtered cards
}


// ===== Marker Visibility Management =====
function updateMarkerVisibility() {
  const searchTerm = searchSpot ? searchSpot.value.toLowerCase() : ""

  mapMarkers.forEach((marker) => {
    const spotId = marker.dataset.spotId
    const card = document.querySelector(`.map-card-link[data-spot-id="${spotId}"]`)
    if (!card) return

    // Show marker if its corresponding card is visible
    const isCardVisible = card.style.display !== "none"

    
    if (isCardVisible) {
      marker.classList.add("visible")
      visibleMarkers.add(spotId)
    } else {
      marker.classList.remove("visible", "pulse")
      visibleMarkers.delete(spotId)
    }

    // Handle search highlighting
    if (searchTerm.length > 0) {
      const spot = spotDataMap.get(spotId)
      if (!spot) return
      const matches =
        spot.name.toLowerCase().includes(searchTerm) ||
        spot.location.toLowerCase().includes(searchTerm)
      if (isCardVisible && matches) {
        marker.classList.add("pulse")
      } else {
        marker.classList.remove("pulse")
      }
    } else {
      marker.classList.remove("pulse") // Remove pulse when search is cleared
    }
  })
}






















// ===== Search Functionality =====
// if (searchSpot) {
//   searchSpot.addEventListener("input", (e) => {
//     const searchTerm = e.target.value.toLowerCase()

//     spotCards.forEach((card) => {
//       const spotId = card.dataset.spotId
//       const spot = spotDataMap.get(spotId)
//       if (!spot) return

//       const matches =
//         spot.name.toLowerCase().includes(searchTerm) ||
//         spot.location.toLowerCase().includes(searchTerm)

//       // Only filter if the "All" chip is active
//       const allChip = document.querySelector('.filter-chip[data-filter="all"]')
//       if (allChip && allChip.classList.contains("active")) {
//           card.style.display = matches ? "block" : "none"
//       }
//     })

//     updateMarkerVisibility()
//   })
// }

























if (searchTriggerBtn) {
  searchTriggerBtn.addEventListener("click", () => {
    const searchTerm = searchSpot.value.toLowerCase()
    if (searchTerm.length === 0) return

    let foundSpotId = null
    // Find the first matching *visible* card
    for (const card of spotCards) {
      if (card.style.display === "none") continue // Skip hidden cards
      
      const spotId = card.dataset.spotId
      const spot = spotDataMap.get(spotId)
      if (!spot) continue
      if (
        spot.name.toLowerCase().includes(searchTerm) ||
        spot.location.toLowerCase().includes(searchTerm)
      ) {
        foundSpotId = spotId
        break
      }
    }

    if (foundSpotId) {
      const marker = document.querySelector(`.map-marker[data-spot-id="${foundSpotId}"]`)
      if (marker) {
        marker.classList.add("visible", "pulse") // Ensure it's visible and pulse it
      }
      showPreviewCard(foundSpotId)
      
      // Scroll sidebar to the card
      const cardElement = document.querySelector(`.map-card-link[data-spot-id="${foundSpotId}"]`)
      if (cardElement) {
          cardElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  })
}

// ===== Favorite Functionality =====
spotCards.forEach((card) => {
  const favoriteBtn = card.querySelector(".favorite-btn")
  const spotId = card.dataset.spotId

  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      favoriteBtn.classList.toggle("active")
      
      const heartIcon = favoriteBtn.querySelector('i')
      if (favoriteBtn.classList.contains("active")) {
        favorites.add(spotId)
        heartIcon.classList.remove('far') // Switch to solid
        heartIcon.classList.add('fas')
      } else {
        favorites.delete(spotId)
        heartIcon.classList.remove('fas') // Switch to regular
        heartIcon.classList.add('far')
      }
    })
  }
})

// ===== Map Markers & Preview Card =====
function showPreviewCard(spotId) {
  const spot = spotDataMap.get(spotId)
  if (!spot) return

  currentPreviewSpotId = spotId
  currentPreviewDetailUrl = spot.detailUrl

  if (previewImage) {
    const placeholder = previewImage.dataset?.placeholder
    previewImage.src = spot.image || placeholder || previewImage.src
    previewImage.alt = spot.name
  }

  if (previewTitle) {
    previewTitle.textContent = spot.name
  }

  if (previewRatingValue) {
    previewRatingValue.textContent = spot.rating.toFixed(1)
  }

  if (previewLocationText) {
    previewLocationText.textContent = spot.location
  }

  if (previewStatusBadge) {
    previewStatusBadge.textContent = spot.status === "open" ? "Open" : "Closed"
    previewStatusBadge.className = `preview-status-badge ${spot.status}`
    if (spot.status === "open") {
      previewStatusBadge.style.background = "var(--green-light)"
      previewStatusBadge.style.color = "var(--green-dark)"
    } else {
      previewStatusBadge.style.background = "#ffebee"
      previewStatusBadge.style.color = "#c62828"
    }
  }

  if (previewRatingStars) {
    previewRatingStars.innerHTML = ""
    const rounded = Math.round(spot.rating * 2) / 2
    const fullStars = Math.floor(rounded)
    const hasHalfStar = rounded % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    for (let i = 0; i < fullStars; i++) {
      previewRatingStars.innerHTML += '<i class="fas fa-star"></i>'
    }
    if (hasHalfStar) {
      previewRatingStars.innerHTML += '<i class="fas fa-star-half-alt"></i>'
    }
    for (let i = 0; i < emptyStars; i++) {
      previewRatingStars.innerHTML += '<i class="far fa-star"></i>'
    }
  }

  if (previewTagsContainer) {
    const tagsHtml = spot.tags
      .map((tagKey) => {
        const definition = amenityDefinitions[tagKey]
        if (!definition) return ""
        return `<span><i class="fas ${definition.icon}"></i> ${definition.label}</span>`
      })
      .filter(Boolean)
      .join("")
    previewTagsContainer.innerHTML = tagsHtml
  }

  const marker = document.querySelector(`.map-marker[data-spot-id="${spotId}"]`)
  if (marker) {
    marker.classList.add("visible", "pulse")
    setTimeout(() => marker.classList.remove("pulse"), 600)
  }

  mapPreviewCard.classList.add("active")
}

spotCards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    const spotId = card.dataset.spotId
    const marker = document.querySelector(`.map-marker[data-spot-id="${spotId}"]`)
    if (marker) {
      marker.classList.add("visible")
    }
  })
})

mapMarkers.forEach((marker) => {
  marker.addEventListener("click", () => {
    const spotId = marker.dataset.spotId
    showPreviewCard(spotId)
    
    // Scroll sidebar to the card
    const cardElement = document.querySelector(`.map-card-link[data-spot-id="${spotId}"]`)
    if (cardElement) {
        cardElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  })
})

if (previewCloseBtn) {
  previewCloseBtn.addEventListener("click", () => {
    mapPreviewCard.classList.remove("active")
    currentPreviewSpotId = null
    currentPreviewDetailUrl = null
  })
}

// ===== Zoom Controls =====
if (zoomIn) {
  zoomIn.addEventListener("click", () => {
    currentZoom = Math.min(currentZoom + 0.2, 2)
    updateMapZoom()
  })
}

if (zoomOut) {
  zoomOut.addEventListener("click", () => {
    currentZoom = Math.max(currentZoom - 0.2, 0.8)
    updateMapZoom()
  })
}

// REPLACE your old updateMapZoom function with this new one

function updateMapZoom() {
  const mapBg = document.querySelector(".map-bg");
  const mapMarkers = document.querySelector(".map-markers");

  // We apply the same transform to both the map image and the marker container
  // so they scale together from the same origin point.
  const transformValue = `scale(${currentZoom})`;
  const transformOriginValue = "center center";

  if (mapBg) {
    mapBg.style.transform = transformValue;
    mapBg.style.transformOrigin = transformOriginValue;
  }
  
  if (mapMarkers) {
    // We also scale the markers container.
    mapMarkers.style.transform = transformValue;
    mapMarkers.style.transformOrigin = transformOriginValue;
  }
}

// ===== Menu Dropdown =====
if (menuDots) {
  menuDots.addEventListener("click", (e) => {
    e.stopPropagation()
    dropdownMenu.classList.toggle("active")
  })
}

document.addEventListener("click", (e) => {
  if (dropdownMenu && !e.target.closest(".map-menu-dropdown")) {
    dropdownMenu.classList.remove("active")
  }
})

// ===== Search as I Move Toggle =====
if (searchAsMove) {
  searchAsMove.addEventListener("change", (e) => {
    if (e.target.checked) {
      console.log("Search as you move enabled")
    } else {
      console.log("Search as you move disabled")
    }
  })
}

// ===== Location Button =====
const locationBtn = document.querySelector(".location-btn .control-btn")
if (locationBtn) {
  locationBtn.addEventListener("click", () => {
    console.log("Centering on user location...")
    // Add geolocation logic here
  })
}

// ===== View Details Button =====
if (viewDetailsBtn) {
  viewDetailsBtn.addEventListener("click", () => {
    if (currentPreviewDetailUrl) {
      window.location.href = currentPreviewDetailUrl
    }
  })
}

// ===== Keyboard Navigation =====
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (filterPopup) filterPopup.classList.remove("active")
    if (mapPreviewCard) mapPreviewCard.classList.remove("active")
    if (dropdownMenu) dropdownMenu.classList.remove("active")
    if (userDropdown) userDropdown.style.display = "none"
    if (logoutModal) logoutModal.classList.remove("active")
  }
})

// ===== Responsive Sidebar =====
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    if (mapSidebar) mapSidebar.classList.remove("collapsed")
  }
})

// ===== Initial Load =====
// Show all markers that have visible cards on load
updateMarkerVisibility()

console.log("StudyHive Map View initialized")

// ===== Dynamic Amenity Filter (from Django data attributes) =====
document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-chip")
  const cards = document.querySelectorAll(".map-card-link")

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Toggle active button
      filterButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")

      const filter = button.dataset.filter

      cards.forEach((card) => {
        // Reset visibility for "All"
        if (filter === "all") {
          card.style.display = "block"
          return
        }

        // Read the corresponding dataset value (True/False)
        const hasAmenity = card.dataset[filter] === "True" || card.dataset[filter] === "true"
        card.style.display = hasAmenity ? "block" : "none"
      })

      updateMarkerVisibility()
    })
  })
})


// ===== Smart Search Integration =====
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchSpot")
  const cards = document.querySelectorAll(".map-card-link")

  if (!searchInput) return

  searchInput.addEventListener("input", function () {
    const query = searchInput.value.trim().toLowerCase()

    cards.forEach((card) => {
      // Read card text
      const name = (card.dataset.name || card.querySelector("h3")?.textContent || "").toLowerCase()
      const location = (card.dataset.location || card.querySelector(".spot-location span")?.textContent || "").toLowerCase()

      // Read dataset (booleans)
      const dataset = Object.keys(card.dataset).filter(
        (key) => card.dataset[key] === "True" || card.dataset[key] === "true"
      )

      // Check if query matches anything
      const matchesName = name.includes(query)
      const matchesLocation = location.includes(query)
      const matchesAmenity = dataset.some((field) =>
        field.includes(query.replace(/[^a-z0-9]/g, ""))
      )

      // Show or hide
      if (query === "" || matchesName || matchesLocation || matchesAmenity) {
        card.style.display = "block"
      } else {
        card.style.display = "none"
      }
    })

    updateMarkerVisibility()
  })
})

