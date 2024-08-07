function loadHeader() {
    const headerHTML = `
        <header>
            <a href="https://gyromotionphysio.in"><img src="img/logo-png.png" alt="Logo" class="logo" style="height: auto; max-width: 68%;"></a>
        </header>
        <nav>
            <ul>
                <li><a href="https://gyromotionphysio.in">Home</a></li>
                <li><a href="about.html">About</a></li>
                <li><a href="services.html">Services</a></li>
                <li><a href="appointment.html">Book an Appointment</a></li>
            </ul>
        </nav>
    `;
    document.getElementById('common-header').innerHTML = headerHTML;
}

document.addEventListener('DOMContentLoaded', loadHeader);