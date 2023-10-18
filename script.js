// JavaScript code to handle the dropdown and hover effect

// Get all service elements
const services = document.querySelectorAll('.service');

// Add event listeners for hover and blur
services.forEach((service) => {
    service.addEventListener('mouseover', handleMouseOver);
    service.addEventListener('mouseleave', handleMouseLeave);
});

function handleMouseOver(event) {
    // Get the dropdown data attribute value
    const dropdownName = event.target.dataset.dropdown;
    // Add 'active' class to the current service and show the corresponding dropdown
    event.target.classList.add('active');
    document.getElementById(dropdownName).classList.add('show');
}

function handleMouseLeave(event) {
    // Get the dropdown data attribute value
    const dropdownName = event.target.dataset.dropdown;
    // Remove 'active' class from all services and hide all dropdowns
    services.forEach((service) => {
        service.classList.remove('active');
    });
    document.querySelectorAll('.dropdown').forEach((dropdown) => {
        dropdown.classList.remove('show');
    });
}



// Delete this part later
// Function to open the popup
function openPopup() {
    document.getElementById("popup").style.display = "block";
}

// Function to close the popup
function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Check if the popup should be shown (e.g., only on the first visit)
if (localStorage.getItem("popupShown") !== "true") {
    openPopup();
    localStorage.setItem("popupShown", "true");
}
// Delete this part later
