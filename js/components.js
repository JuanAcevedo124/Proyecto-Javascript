export class RoomCarousel extends HTMLElement {
constructor() { super(); }
connectedCallback() {
    const rooms = DataService.getRooms();
    this.innerHTML = `
    <div class="carousel" style="display:flex; gap:1rem; overflow-x:auto; padding:1rem; scroll-snap-type:x mandatory;">
        ${rooms.map(r => `
            <div class="card" style="min-width:85%; scroll-snap-align:center; flex-shrink:0;">
            <img src="${r.images[0]}" alt="${r.name}" style="height:200px; width:100%; object-fit:cover; border-radius:8px; margin-bottom:1rem;">
            <h3>${r.name}</h3>
            <p>💰 $${r.price}/noche | 👥 Max ${r.maxGuests} | 🛏️ ${r.beds} camas</p>
            <a href="reservas.html" class="btn" style="margin-top:1rem; display:inline-block;">Ver Disponibilidad</a>
    </div>
`).join('')}
</div>
`;
}
}

export class BookingEngine extends HTMLElement {
    constructor() { super(); }
    connectedCallback() {
    this.innerHTML = `
    <div class="card">
        <h2>📅 Consultar Disponibilidad</h2>
        <form id="searchForm">
            <div class="grid" style="grid-template-columns:1fr 1fr;">
                <div class="input-group"><label>Check-in</label><input type="date" id="checkIn" required></div>
                <div class="input-group"><label>Check-out</label><input type="date" id="checkOut" required></div>
            </div>
            <div class="input-group"><label>Huéspedes</label><input type="number" id="guests" min="1" value="2" required></div>
            <button type="submit" class="btn" style="width:100%;">Buscar Habitaciones</button>
        </form>
        <div id="results"></div>
    </div>
`;
this.querySelector('#searchForm').addEventListener('submit', e => this.handleSearch(e));
}

handleSearch(e) {
e.preventDefault();
const checkIn = document.getElementById('checkIn').value;
const checkOut = document.getElementById('checkOut').value;
const guests = parseInt(document.getElementById('guests').value);
const resDiv = document.getElementById('results');
    if (new Date(checkIn) >= new Date(checkOut)) return resDiv.innerHTML = `<div class="alert error">Fechas inválidas</div>`;
const rooms = DataService.getRooms();
const available = rooms.filter(r => {
    if (guests > r.maxGuests) return false;
        return DataService.checkAvailability(r.id, checkIn, checkOut);
});

if (available.length === 0) {
    resDiv.innerHTML = `<div class="alert error">No hay habitaciones disponibles para esas fechas y cantidad de personas.</div>`;
    return;
}

resDiv.innerHTML = `<h3 style="margin:1rem 0;">Habitaciones Disponibles:</h3>` +
    available.map(r => {
    const total = DataService.calculatePrice(r.price, checkIn, checkOut);
    return `
    <div class="card" style="margin-bottom:1rem;">
        <img src="${r.images[0]}" alt="${r.name}" style="height:150px; width:100%; object-fit:cover; border-radius:8px; margin-bottom:0.5rem;">
        <h3>${r.name} - <span style="color:var(--primary);">$${total} total</span></h3>
        <p>🛏️ ${r.beds} camas | 📶 ${r.amenities.join(' • ')}</p>
        <p>👥 Capacidad: ${r.maxGuests} | 💵 Precio/noche: $${r.price}</p>
            <button class="btn book-btn" data-room="${r.id}" data-total="${total}">Reservar Ahora</button>
    </div>
`;
}).join('');

document.querySelectorAll('.book-btn').forEach(btn => btn.addEventListener('click', () => this.initBooking(btn.dataset.room, checkIn, checkOut, guests, btn.dataset.total)));
}

initBooking(roomId, inDate, outDate, guests, total) {
const user = DataService.getSession();
    if (!user) return alert('⚠️ Debes iniciar sesión para reservar.');
    if (!DataService.checkAvailability(roomId, inDate, outDate)) return alert('⚠️ La habitación acaba de ser reservada por otro usuario.');

const booking = {
    id: 'b_' + Date.now(),
    userId: user.id,
    roomId,
    checkIn: inDate,
    checkOut: outDate,
    guests,
    totalPrice: parseInt(total),
    status: 'confirmed',
    createdAt: new Date().toISOString()
};
DataService.addBooking(booking);
    alert(`✅ Reserva confirmada! ID: ${booking.id}. Total pagado simulado: $${total}`);
    this.querySelector('#results').innerHTML = `<div class="alert success">Reserva registrada exitosamente.</div>`;
}
}

export class UserRegistration extends HTMLElement {
constructor() { super(); }
    connectedCallback() {
    this.innerHTML = `
        <div class="card" id="authBox">
            <h2 id="authTitle">Iniciar Sesión</h2>
            <form id="authForm">
                <div id="registerFields" style="display:none;">
                    <div class="input-group"><label>Documento</label><input id="docId" type="text" required></div>
                    <div class="input-group"><label>Nombre Completo</label><input id="name" type="text" required></div>
                    <div class="input-group"><label>Nacionalidad</label><input id="nationality" type="text" required></div>
                    <div class="input-group"><label>Teléfono</label><input id="phone" type="tel" required></div>
                </div>
            <div class="input-group"><label>Email</label><input id="email" type="email" required></div>
            <div class="input-group"><label>Contraseña</label><input id="password" type="password" required></div>
            <button type="submit" class="btn" style="width:100%;">Ingresar</button>
            </form>
            <p style="margin-top:1rem; cursor:pointer; color:var(--primary);" id="toggleAuth">¿No tienes cuenta? Regístrate</p>
        </div>
`;
this.isRegister = false;
this.setupListeners();
}

    setupListeners() {
    const toggle = this.querySelector('#toggleAuth');
    toggle.onclick = () => {
    this.isRegister = !this.isRegister;
    this.querySelector('#authTitle').textContent = this.isRegister ? 'Registro' : 'Iniciar Sesión';
    this.querySelector('#registerFields').style.display = this.isRegister ? 'block' : 'none';
    toggle.textContent = this.isRegister ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate';
    this.querySelector('button[type="submit"]').textContent = this.isRegister ? 'Registrarse' : 'Ingresar';
};

this.querySelector('#authForm').onsubmit = async (e) => {
e.preventDefault();
const email = document.getElementById('email').value;
const pass = document.getElementById('password').value;

if (this.isRegister) {
    const newUser = {
        id: 'u_' + Date.now(),
        docId: document.getElementById('docId').value,
        name: document.getElementById('name').value,
        nationality: document.getElementById('nationality').value,
        phone: document.getElementById('phone').value,
        email, password: pass, role: 'user'
};
const exists = DataService.getUsers().some(u => u.email === email);
    if (exists) return alert('Email ya registrado');
        DataService.addUser(newUser);
        alert('✅ Registro exitoso. Inicia sesión.');
        toggle.click();
} else {
    const user = DataService.authenticate(email, pass);
    if (!user) return alert('Credenciales incorrectas');
    DataService.login(user);
    window.location.reload();
}
};
}
}

export class AdminPanel extends HTMLElement {
constructor() { super(); this.render(); }
render() {
const rooms = DataService.getRooms();
const bookings = DataService.getBookings();
this.innerHTML = `
    <div class="grid" style="margin-top:2rem;">
        <div class="card">
            <h3>🏨 Habitaciones</h3>
            <button class="btn" onclick="document.getElementById('roomModal').showModal()">+ Nueva Habitación</button>
            <div style="margin-top:1rem; max-height:400px; overflow-y:auto;">
                ${rooms.map(r => `
                <div style="border-bottom:1px solid #eee; padding:0.5rem 0;">
                    <strong>${r.name}</strong> ($${r.price}/noche)
                    <button class="btn-outline" onclick="AdminPanel.deleteRoom('${r.id}')">🗑️</button>
                </div>
            `).join('')}
            </div>
        </div>
        <div class="card">
            <h3>📋 Reservas Activas</h3>
                <div style="margin-top:1rem; max-height:400px; overflow-y:auto;">
                ${bookings.filter(b=>b.status==='confirmed').map(b => {
                const room = rooms.find(r=>r.id===b.roomId);
                const user = DataService.getUsers().find(u=>u.id===b.userId);
                return `<div style="border-bottom:1px solid #eee; padding:0.5rem 0;">
                    <strong>${room?.name || 'Desconocida'}</strong><br>
                    👤 ${user?.name || 'N/A'} | 📅 ${b.checkIn} a ${b.checkOut} | 💰 $${b.totalPrice}
                    <button class="btn-outline" onclick="AdminPanel.cancelBooking('${b.id}')">❌ Cancelar</button>
                </div>`;
            }).join('') || '<p>Sin reservas</p>'}
            </div>
        </div>
    </div>
        <dialog id="roomModal" style="padding:2rem; border-radius:12px; border:none; box-shadow:var(--shadow); width:90%; max-width:400px;">
            <h3>Agregar Habitación</h3>
            <input id="rName" placeholder="Nombre" style="width:100%; margin-bottom:0.5rem;">
            <input id="rPrice" type="number" placeholder="Precio/noche" style="width:100%; margin-bottom:0.5rem;">
            <input id="rBeds" type="number" placeholder="Camas" style="width:100%; margin-bottom:0.5rem;">
            <input id="rMax" type="number" placeholder="Max personas" style="width:100%; margin-bottom:0.5rem;">
            <button class="btn" onclick="AdminPanel.saveRoom()">Guardar</button>
            <button class="btn-outline" onclick="document.getElementById('roomModal').close()">Cerrar</button>
        </dialog>
`;
}
}

  // Métodos estáticos para AdminPanel
window.AdminPanel = {
deleteRoom: (id) => { DataService.deleteRoom(id); document.querySelector('admin-panel').render(); },
saveRoom: () => {
const r = {
    id: 'r_' + Date.now(),
    name: document.getElementById('rName').value,
    price: parseInt(document.getElementById('rPrice').value),
    beds: parseInt(document.getElementById('rBeds').value),
    maxGuests: parseInt(document.getElementById('rMax').value),
    amenities: ['WiFi', 'Minibar'],
    images: ['https://picsum.photos/seed/'+Date.now()+'/800/500']
};
    DataService.addRoom(r);
    document.getElementById('roomModal').close();
    document.querySelector('admin-panel').render();
},
cancelBooking: (id) => {
    const b = DataService.getBookings().find(x => x.id === id);
    b.status = 'cancelled';
    DataService.updateBooking(b);
    document.querySelector('admin-panel').render();
    }
};

customElements.define('room-carousel', RoomCarousel);
customElements.define('booking-engine', BookingEngine);
customElements.define('user-registration', UserRegistration);
customElements.define('admin-panel', AdminPanel);