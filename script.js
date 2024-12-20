const serviceList = document.querySelector('.service-list');
const appointmentServices = document.querySelector('#appointment-services');
const reviewServices = document.querySelector('#review-services');
const staffList = document.querySelector('.staff-list');
const promotionsList = document.querySelector('.promotions-list');
const preferredTime = document.querySelector('#preferred-time');
const appointmentForm = document.querySelector('#appointment-form');
const reviewForm = document.querySelector('#review-form');
const appointmentList = document.querySelector('.appointment-list');
const reviewList = document.querySelector('.review-list');
let services = [];

function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .catch(error => console.error('Error fetching data:', error));
}

function postData(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .catch(error => console.error('Error posting data:', error));
}

function displayServices() {
    fetchData('http://localhost:3000/services').then(data => {
        if (!data) return;
        services = data;

        serviceList.innerHTML = data.map(service => `
            <div class="service-card">
                <img src="${service.image || 'placeholder.jpg'}" alt="${service.name}" />
                <h3>${service.name}</h3>
                <p>Price: $${service.price}</p>
                <p>Duration: ${service.duration}</p>
            </div>
        `).join('');

        const serviceOptions = data.map(service => 
            `<option value="${service.id}">${service.name}</option>`
        ).join('');

        appointmentServices.innerHTML = '<option value="" disabled selected>Select a service</option>' + serviceOptions;
        reviewServices.innerHTML = '<option value="" disabled selected>Select a service</option>' + serviceOptions;
    });
}

function displayStaff() {
    fetchData('http://localhost:3000/staff').then(staff => {
        if (!staff) return;

        staffList.innerHTML = staff.map(member => `
            <div class="staff-card">
                <img src="${member.image || 'placeholder.jpg'}" alt="${member.name}" />
                <h3>${member.name}</h3>
                <p>Title: ${member.title}</p>
                <p>Specialties: ${member.specialties.join(', ')}</p>
                <p>Experience: ${member.years_experience} years</p>
            </div>
        `).join('');
    });
}

function displayPromotions() {
    fetchData('http://localhost:3000/promotions').then(promotions => {
        if (!promotions) return;

        promotionsList.innerHTML = promotions.map(promotion => `
            <div class="promotion-card">
                <h3>${promotion.title}</h3>
                <p>${promotion.description}</p>
                <p>Valid Until: ${promotion.valid_until}</p>
            </div>
        `).join('');
    });
}

function populateTimeSlots() {
    fetchData('http://localhost:3000/available_slots').then(data => {
        if (!data) return;

        preferredTime.innerHTML = '<option value="" disabled selected>Select a time</option>' +
            data.time_slots.map(slot => `<option value="${slot}">${slot}</option>`).join('');
    });
}

function displayAppointments() {
    fetchData('http://localhost:3000/appointments').then(appointments => {
        if (!appointments) return;

        appointmentList.innerHTML = appointments.map(appointment => `
            <div class="appointment-card">
                <h4>Customer: ${appointment.customer}</h4>
                <p>Service: ${getServiceName(appointment.service_id)}</p>
                <p>Date: ${appointment.date}</p>
                <p>Time: ${appointment.time}</p>
            </div>
        `).join('');
    }).catch(error => console.error('Error fetching appointments:', error));
}

function getServiceName(serviceId) {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
}

function addAppointmentToUI(appointment) {
    appointmentList.innerHTML += `
        <div class="appointment-card">
            <h4>Customer: ${appointment.customerName}</h4>
            <p>Service: ${appointment.serviceName}</p>
            <p>Date: ${appointment.preferredDate}</p>
            <p>Time: ${appointment.preferredTime}</p>
        </div>
    `;
}

function addReviewToUI(review) {
    reviewList.innerHTML += `
        <div class="review-card">
            <h4>${review.serviceName}</h4>
            <p>${review.text}</p>
            <p>Rating: ${review.rating} / 5</p>
        </div>
    `;
}

function displayExistingReviews() {
    fetchData('http://localhost:3000/reviews').then(reviews => {
        if (!reviews) return;
        
        reviewList.innerHTML = reviews.map(review => `
            <div class="review-card">
                <h4>${review.serviceName}</h4>
                <p>${review.text}</p>
                <p>Rating: ${review.rating} / 5</p>
            </div>
        `).join('');
    });
}

function setupAppointmentForm() {
    appointmentForm.addEventListener('submit', event => {
        event.preventDefault();

        const appointmentData = {
            service_id: parseInt(appointmentServices.value, 10),
            serviceName: appointmentServices.options[appointmentServices.selectedIndex].text,
            customer: document.querySelector('#customer-name').value,
            date: document.querySelector('#preferred-date').value,
            time: preferredTime.value,
        };

        postData('http://localhost:3000/appointments', appointmentData)
            .then(appointment => {
                addAppointmentToUI(appointment);
                appointmentForm.reset();
                alert('Appointment successfully booked!');
            })
            .catch(error => {
                console.error('Error booking appointment:', error);
                alert('Failed to book the appointment. Please try again.');
            });
    });
}

function setupReviewForm() {
    reviewForm.addEventListener('submit', event => {
        event.preventDefault();

        const reviewData = {
            service_id: parseInt(reviewServices.value, 10),
            serviceName: reviewServices.options[reviewServices.selectedIndex].text,
            text: document.querySelector('#review-text').value,
            rating: parseInt(document.querySelector('#review-rating').value, 10),
        };

        postData('http://localhost:3000/reviews', reviewData)
            .then(review => {
                addReviewToUI(review);
                reviewForm.reset();
            })
            .catch(error => console.error('Error submitting review:', error));
    });
}
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;


const currentTheme = localStorage.getItem("theme");
if (currentTheme === "dark") {
  body.classList.add("dark-theme");
  themeToggle.textContent = "☀️"; 
} else {
  themeToggle.textContent = "🌙"; 
}

themeToggle.addEventListener("click", () => {
  
  body.classList.toggle("dark-theme");

  if (body.classList.contains("dark-theme")) {
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  }
});


document.addEventListener('DOMContentLoaded', () => {
    displayServices();
    displayStaff();
    displayPromotions();
    populateTimeSlots();
    displayAppointments();
    setupAppointmentForm();
    setupReviewForm();
    displayExistingReviews();  
});
