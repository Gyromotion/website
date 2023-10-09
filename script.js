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
