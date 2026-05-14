import { DataService } from './data-service.js';

// 1. Motor de Búsqueda y Reserva
export class BookingEngine extends HTMLElement {
  constructor() { super(); }
  connectedCallback() {
    this.innerHTML = `
      <div class="card">
        <h2 style="margin-bottom:1.5rem; text-align:center;">📅 Encuentra tu Estadía Ideal</h2>
        <form id="searchForm" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="input-group"><label>📅 Llegada</label><input type="date" id="checkIn" required></div>
          <div class="input-group"><label>📅 Salida</label><input type="date" id="checkOut" required></div>
          <div class="input-group" style="grid-column:span 2;"><label>👥 Huéspedes</label><input type="number" id="guests" min="1" max="6" value="2" required></div>
          <button type="submit" class="btn btn-accent" style="grid-column:span 2; justify-content:center; padding:0.8rem;">Buscar Disponibilidad</button>
        </form>
        <div id="results" style="margin-top:2rem;"></div>
      </div>
    `;
    this.querySelector('#searchForm').addEventListener('submit', e => this.search(e));
  }

  search(e) {
    e.preventDefault();
    const cIn = document.getElementById('checkIn').value;
    const cOut = document.getElementById('checkOut').value;
    const guests = parseInt(document.getElementById('guests').value);
    const res = document.getElementById('results');

    if (new Date(cIn) >= new Date(cOut)) return res.innerHTML = `<div class="alert error">La fecha de salida debe ser posterior a la llegada.</div>`;

    const rooms = DataService.getRooms();
    const available = rooms.filter(r => {
      if (guests > r.maxGuests) return false;
      return DataService.isAvailable(r.id, cIn, cOut);
    });

    if (!available.length) return res.innerHTML = `<div class="alert error">No hay habitaciones disponibles para estas fechas y capacidad.</div>`;

    res.innerHTML = `<h3 style="margin:1.5rem 0 1rem;">🏨 Habitaciones Disponibles</h3>` +
      available.map(r => {
        const { nights, total } = DataService.calcPrice(r.price, cIn, cOut);
        return `
          <div class="card" style="margin-bottom:1rem; display:flex; flex-direction:column; gap:0.5rem;">
            <img src="${r.image}" alt="${r.name}" style="height:160px; width:100%; object-fit:cover; border-radius:10px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h3>${r.name}</h3>
              <span class="badge accent">$${r.price}/noche</span>
            </div>
            <p style="color:var(--text-light); font-size:0.9rem;">🛏️ ${r.beds} cama(s) | 👥 Máx ${r.maxGuests} | 📶 ${r.amenities.join(' • ')}</p>
            <p style="font-weight:700; color:var(--primary);">💰 Total por ${nights} noche(s): <span>$${total}</span></p>
            <button class="btn book-btn" data-id="${r.id}" data-in="${cIn}" data-out="${cOut}" data-guests="${guests}" data-total="${total}">Reservar Ahora</button>
          </div>
        `;
      }).join('');

    document.querySelectorAll('.book-btn').forEach(btn => btn.onclick = () => this.attemptBooking(btn.dataset));
  }

  attemptBooking(d) {
    const user = DataService.getSession();
    if (!user) return alert('⚠️ Debes iniciar sesión o registrarte para reservar.');
    
    // Re-verificación en tiempo real (evita race conditions en simulación)
    if (!DataService.isAvailable(d.id, d.in, d.out)) {
      return alert('⚠️ Esta habitación acaba de ser reservada. Por favor selecciona otra fecha o habitación.');
    }

    const booking = {
      id: 'bk_' + Date.now(),
      userId: user.id,
      roomId: d.id,
      checkIn: d.in,
      checkOut: d.out,
      guests: parseInt(d.guests),
      totalPrice: parseInt(d.total),
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    DataService.addBooking(booking);
    alert(`✅ ¡Reserva Confirmada!\nID: ${booking.id}\nTotal: $${booking.total}`);
    document.getElementById('results').innerHTML = `<div class="alert success">Reserva registrada. <a href="reservas.html" style="color:var(--primary);">Ver mis reservas</a></div>`;
  }
}

// 2. Gestión de Reservas del Usuario
export class UserBookings extends HTMLElement {
  constructor() { super(); }
  connectedCallback() {
    const user = DataService.getSession();
    if (!user) {
      this.innerHTML = `<div class="alert error">Inicia sesión para gestionar tus reservas.</div>`;
      return;
    }
    const bookings = DataService.getUserBookings(user.id).filter(b => b.status === 'confirmed');
    const rooms = DataService.getRooms();

    if (!bookings.length) {
      this.innerHTML = `<div class="card mt-2 text-center"><p style="color:var(--text-light);">No tienes reservas activas.</p></div>`;
      return;
    }

    this.innerHTML = `
      <div class="card mt-2">
        <h2 style="margin-bottom:1rem;">📋 Mis Reservas</h2>
        ${bookings.map(b => {
          const room = rooms.find(r => r.id === b.roomId);
          return `
            <div style="border-bottom:1px solid #eee; padding:1rem 0; display:flex; flex-wrap:wrap; gap:1rem; justify-content:space-between; align-items:center;">
              <div>
                <h4 style="color:var(--primary);">${room?.name || 'Habitación'}</h4>
                <p style="font-size:0.9rem; color:var(--text-light);">📅 ${b.checkIn} ➔ ${b.checkOut} | 👥 ${b.guests} huéspedes</p>
              </div>
              <div style="text-align:right;">
                <p style="font-weight:700; font-size:1.1rem;">$${b.totalPrice}</p>
                <button class="btn btn-outline cancel-btn" data-id="${b.id}" style="padding:0.4rem 0.8rem; font-size:0.85rem; margin-top:0.5rem;">Cancelar</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm('¿Estás seguro de cancelar esta reserva? Las fechas quedarán disponibles inmediatamente.')) {
          DataService.cancelBooking(btn.dataset.id);
          this.connectedCallback(); // Re-render
        }
      };
    });
  }
}

// 3. Auth (Login/Register)
export class AuthPanel extends HTMLElement {
  constructor() { super(); this.mode = 'login'; }
  connectedCallback() {
    if (DataService.getSession()) {
      this.innerHTML = `<div class="alert success">Sesión iniciada como ${DataService.getSession().name}. <button class="btn btn-outline" id="logoutBtn">Cerrar Sesión</button></div>`;
      document.getElementById('logoutBtn').onclick = () => DataService.logout();
      return;
    }

    this.innerHTML = `
      <div class="card" style="max-width:400px; margin:0 auto;">
        <h2 id="authTitle" class="text-center" style="margin-bottom:1.5rem;">Iniciar Sesión</h2>
        <form id="authForm">
          <div id="regFields" class="hidden">
            <div class="grid" style="grid-template-columns:1fr 1fr; gap:0.5rem;">
              <div class="input-group"><label>🆔 Documento</label><input id="docId" required></div>
              <div class="input-group"><label>🌍 Nacionalidad</label><input id="nat" required></div>
            </div>
            <div class="input-group"><label>👤 Nombre Completo</label><input id="name" required></div>
            <div class="input-group"><label>📱 Teléfono</label><input id="phone" required type="tel"></div>
          </div>
          <div class="input-group"><label>📧 Email</label><input id="email" type="email" required></div>
          <div class="input-group"><label>🔒 Contraseña</label><input id="pass" type="password" required></div>
          <button type="submit" class="btn btn-accent" style="width:100%; justify-content:center;">Ingresar</button>
        </form>
        <p class="text-center" style="margin-top:1rem; cursor:pointer; color:var(--primary-light); font-weight:500;" id="toggleAuth">¿No tienes cuenta? Regístrate</p>
      </div>
    `;

    document.getElementById('toggleAuth').onclick = () => {
      this.mode = this.mode === 'login' ? 'register' : 'login';
      document.getElementById('authTitle').textContent = this.mode === 'login' ? 'Iniciar Sesión' : 'Registro de Usuario';
      document.getElementById('regFields').classList.toggle('hidden', this.mode === 'login');
      document.getElementById('toggleAuth').textContent = this.mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión';
      document.querySelector('#authForm button[type="submit"]').textContent = this.mode === 'login' ? 'Ingresar' : 'Crear Cuenta';
    };

    document.getElementById('authForm').onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pass = document.getElementById('pass').value;

      if (this.mode === 'register') {
        if (DataService.getUsers().some(u => u.email === email)) return alert('Email ya registrado');
        const newUser = {
          id: 'u_' + Date.now(), docId: document.getElementById('docId').value, name: document.getElementById('name').value,
          nationality: document.getElementById('nat').value, phone: document.getElementById('phone').value, email, password: pass, role: 'user'
        };
        DataService.addUser(newUser);
        alert('✅ Cuenta creada. Inicia sesión.');
        document.getElementById('toggleAuth').click();
      } else {
        const user = DataService.authenticate(email, pass);
        if (!user) return alert('Credenciales incorrectas');
        DataService.login(user);
        window.location.reload();
      }
    };
  }
}

customElements.define('booking-engine', BookingEngine);
customElements.define('user-bookings', UserBookings);
customElements.define('auth-panel', AuthPanel);