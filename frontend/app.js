const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');

// Auth Form Handlers
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        
        if (response.ok) {
            alert('Registration successful! Please login.');
            e.target.reset(); // Clear the form
        } else {
            alert(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        alert('Error during registration');
        console.error(error);
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            token = data.token;
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('navMenu').style.display = 'block';
            document.getElementById('mainContent').style.display = 'block';
            showSection('services');
        } else {
            alert(`Login failed: ${data.message}`);
        }
    } catch (error) {
        alert('Error during login');
        console.error(error);
    }
});

// Service Form Handler
document.getElementById('serviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const serviceData = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        duration: parseInt(formData.get('duration'))
    };

    try {
        const response = await fetch(`${API_URL}/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(serviceData)
        });
        const data = await response.json();
        
        if (response.ok) {
            alert('Service created successfully!');
            loadServices(true); // Reload services list
            e.target.reset(); // Clear the form
        } else {
            alert(`Failed to create service: ${data.message}`);
        }
    } catch (error) {
        alert('Error creating service');
        console.error(error);
    }
});

// Client Form Handler
document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const clientData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        notes: formData.get('notes').split('\n').filter(note => note.trim())
    };

    try {
        const response = await fetch(`${API_URL}/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clientData)
        });
        const data = await response.json();
        
        if (response.ok) {
            alert('Client created successfully!');
            loadClients(true); // Reload clients list
            e.target.reset(); // Clear the form
        } else {
            alert(`Failed to create client: ${data.message}`);
        }
    } catch (error) {
        alert('Error creating client');
        console.error(error);
    }
});

// Appointment Form Handler
document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const appointmentData = {
        serviceId: formData.get('serviceId'),
        clientId: parseInt(formData.get('clientId')),
        startTime: formData.get('startTime'),
        notes: formData.get('notes') ? formData.get('notes').split('\n').filter(note => note.trim()) : []
    };

    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(appointmentData)
        });
        const data = await response.json();
        
        if (response.ok) {
            alert('Appointment created successfully!');
            loadAppointments(); // Reload appointments list
            e.target.reset(); // Clear the form
        } else {
            alert(`Failed to create appointment: ${data.message}`);
        }
    } catch (error) {
        alert('Error creating appointment');
        console.error(error);
    }
});

// UI Control Functions
function showSection(sectionName) {
    // Update nav buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`button[onclick="showSection('${sectionName}')"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    
    // Load data for the selected section
    switch(sectionName) {
        case 'services':
            loadServices(true);
            break;
        case 'clients':
            loadClients(true);
            break;
        case 'appointments':
            loadAppointments();
            loadServices();
            loadClients();
            break;
    }
}

function toggleView(formId, listId) {
    const form = document.getElementById(formId);
    const list = document.getElementById(listId);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('navMenu').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
}

// Data Loading Functions
async function loadServices(showList = false) {
    try {
        const response = await fetch(`${API_URL}/services`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const services = await response.json();
        
        // Transform data to match frontend expectations
        const transformedServices = services.map(service => ({
            serviceId: service.id, // Ensure this is named serviceId
            name: service.name,
            price: service.price,
            duration: service.duration
        }));

        // Update service select in appointment form
        const select = document.getElementById('serviceSelect');
        select.innerHTML = transformedServices.map(service => 
            `<option value="${service.serviceId}">${service.name} - $${service.price}</option>`
        ).join('');

        // Update services list if requested
        if (showList) {
            const serviceList = document.getElementById('serviceList');
            serviceList.innerHTML = transformedServices.map(service => `
                <div class="list-item">
                    <div class="list-actions">
                        <button onclick="deleteService(${service.serviceId})">Delete</button>
                        <button onclick="editService(${service.serviceId})">Edit</button>
                    </div>
                    <strong>${service.name}</strong><br>
                    Price: $${service.price}<br>
                    Duration: ${service.duration} minutes
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

async function loadClients(showList = false) {
    try {
        const response = await fetch(`${API_URL}/clients`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const clients = await response.json();
        
        // Update client select in appointment form
        const select = document.getElementById('clientSelect');
        select.innerHTML = `<option value="">No Client</option>` + 
            clients.map(client => 
                `<option value="${client.id}">${client.name}</option>`
            ).join('');

        // Update clients list if requested
        if (showList) {
            const clientList = document.getElementById('clientList');
            clientList.innerHTML = clients.map(client => `
                <div class="list-item">
                    <div class="list-actions">
                        <button onclick="deleteClient(${client.id})">Delete</button>
                        <button onclick="editClient(${client.id})">Edit</button>
                    </div>
                    <strong>${client.name}</strong><br>
                    Phone: ${client.phone || 'N/A'}<br>
                    Email: ${client.email || 'N/A'}<br>
                    Notes: ${client.notes ? client.notes.join(', ') : 'No notes'}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

async function loadAppointments() {
    try {
        const response = await fetch(`${API_URL}/appointments`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const appointments = await response.json();
        
        const appointmentList = document.getElementById('appointmentList');
        appointmentList.innerHTML = appointments.map(appointment => `
            <div class="list-item">
                <div class="list-actions">
                    <button onclick="deleteAppointment(${appointment.id})">Delete</button>
                    <button onclick="editAppointment(${appointment.id})">Edit</button>
                </div>
                <strong>Service:</strong> ${appointment.Service ? appointment.Service.name : 'No Service'}<br>
                <strong>Client:</strong> ${appointment.Client ? appointment.Client.name : 'No Client'}<br>
                <strong>Time:</strong> ${new Date(appointment.startTime).toLocaleString()}<br>
                <strong>Notes:</strong> ${appointment.notes ? appointment.notes.join(', ') : 'No notes'}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// CRUD Operations
async function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        try {
            const response = await fetch(`${API_URL}/services/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                loadServices(true);
            } else {
                alert('Failed to delete service');
            }
        } catch (error) {
            console.error('Error deleting service:', error);
        }
    }
}

async function deleteClient(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        try {
            const response = await fetch(`${API_URL}/clients/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                loadClients(true);
            } else {
                alert('Failed to delete client');
            }
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    }
}

async function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        try {
            const response = await fetch(`${API_URL}/appointments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                loadAppointments();
            } else {
                alert('Failed to delete appointment');
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    }
}

// Initialize the app
if (token) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('navMenu').style.display = 'block';
    document.getElementById('mainContent').style.display = 'block';
    showSection('services');
} 