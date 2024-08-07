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
// Function to open the popup with animation
function openPopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "block";

    // Add the "fade-in" class to trigger the animation
    popup.classList.add("fade-in");
}

// Function to close the popup
function closePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";

    // Remove the "fade-in" class to reset the animation
    popup.classList.remove("fade-in");
}

// Always open the popup when the page is visited
openPopup();


// Delete this part later




