// DOM Elements
const serviceList = document.querySelector('.service-list');
const appointmentServices = document.querySelector('#appointment-services');
const reviewServices = document.querySelector('#review-services');
const appointmentList = document.querySelector('.Appointment list');
const reviewList = document.querySelector('.review-list');
const searchBar = document.querySelector('#search-bar');
const appointmentForm = document.querySelector('#appointment-form');
const reviewForm = document.querySelector('#review-form');
const themeToggle = document.querySelector('#theme-toggle');
const priceRange = document.querySelector('#price-range');
const priceValue = document.querySelector('#price-value');
const sortSelect = document.querySelector('#sort-services');

// Global state to store the original data
let globalServices = [];

// Fetch data from db.json
async function fetchData() {
    try {
        const response = await fetch('http://localhost:3000/db.json');
        const data = await response.json();
        globalServices = data.services; // Store services in global state
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        serviceList.innerHTML = '<p>Error loading services. Please try again later.</p>';
    }
}

// Display Services
async function displayServices() {
    const data = await fetchData();
    if (!data) return;

    displayFilteredServices(data.services);

    // Populate service dropdowns
    const serviceOptions = data.services.map(service => 
        `<option value="${service.id}">${service.name} - $${service.price} (${service.duration})</option>`
    ).join('');
    
    appointmentServices.innerHTML = '<option value="" disabled selected>Select a service</option>' + serviceOptions;
    reviewServices.innerHTML = '<option value="" disabled selected>Select a service</option>' + serviceOptions;
}

// Display filtered/sorted services
function displayFilteredServices(services) {
    serviceList.innerHTML = services.map(service => `
        <div class="service-card">
            <h3>${service.name}</h3>
            <p>Price: $${service.price}</p>
            <p>Duration: ${service.duration}</p>
        </div>
    `).join('');
}

// Display Appointments
async function displayAppointments() {
    const data = await fetchData();
    if (!data) return;

    appointmentList.innerHTML = data.appointments.map(appointment => `
        <div class="appointment-card">
            <p>Customer: ${appointment.customer}</p>
            <p>Date: ${appointment.date}</p>
            <p>Time: ${appointment.time}</p>
            <p>Service: ${appointment.service_name || getServiceName(appointment.service_id)}</p>
        </div>
    `).join('');
}

// Helper function to get service name
function getServiceName(serviceId) {
    const service = globalServices.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
}

// Display Reviews
async function displayReviews() {
    const data = await fetchData();
    if (!data) return;

    reviewList.innerHTML = data.reviews.map(review => `
        <div class="review-card">
            <p>Service: ${getServiceName(review.serviceid)}</p>
            <p>${review.review}</p>
            <div class="rating">Rating: ${'★'.repeat(parseInt(review.rating))}${'☆'.repeat(5-parseInt(review.rating))}</div>
        </div>
    `).join('');
}

// Event Listeners

// 1. Search functionality
searchBar.addEventListener('input', () => {
    if (!globalServices.length) return;

    const searchTerm = searchBar.value.toLowerCase();
    const filteredServices = globalServices.filter(service => 
        service.name.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredServices(filteredServices);
});

// 2. Price range filter
priceRange.addEventListener('input', () => {
    if (!globalServices.length) return;

    priceValue.textContent = priceRange.value;
    const maxPrice = parseInt(priceRange.value);
    
    const filteredServices = globalServices.filter(service => 
        parseInt(service.price) <= maxPrice
    );
    
    displayFilteredServices(filteredServices);
});

// 3. Sort services
sortSelect.addEventListener('change', () => {
    if (!globalServices.length) return;

    const services = [...globalServices];
    
    switch(sortSelect.value) {
        case 'name':
            services.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'price':
            services.sort((a, b) => parseInt(a.price) - parseInt(b.price));
            break;
        case 'duration':
            services.sort((a, b) => {
                const timeA = parseInt(a.duration);
                const timeB = parseInt(b.duration);
                return timeA - timeB;
            });
            break;
    }
    
    displayFilteredServices(services);
});

// 4. Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// 5. Appointment form submission
appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newAppointment = {
        id: Date.now().toString(),
        service_id: appointmentServices.value,
        service_name: appointmentServices.options[appointmentServices.selectedIndex].text,
        date: document.querySelector('#appointment-date').value,
        time: document.querySelector('#appointment-time').value,
        customer: document.querySelector('#customer-name').value
    };

    try {
        const response = await fetch('http://localhost:3000/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newAppointment)
        });

        if (response.ok) {
            displayAppointments();
            appointmentForm.reset();
            alert('Appointment booked successfully!');
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        alert('Failed to book appointment. Please try again.');
    }
});

// 6. Review form submission
reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newReview = {
        id: Date.now().toString(),
        serviceid: reviewServices.value,
        review: document.querySelector('#review-text').value,
        rating: document.querySelector('#review-rating').value
    };

    try {
        const response = await fetch('http://localhost:3000/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newReview)
        });

        if (response.ok) {
            displayReviews();
            reviewForm.reset();
            alert('Review submitted successfully!');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
    }
});

// Initialize page
window.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
    
    displayServices();
    displayAppointments();
    displayReviews();
});