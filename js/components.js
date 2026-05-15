import { DataService } from './data-service.js';

export class AuthPanel extends HTMLElement {
  constructor() { super(); this.mode = 'login'; }
  
  connectedCallback() {
    if (DataService.getSession()) {
      this.innerHTML = `
        <div class="alert alert-success">
          👋 Hola, ${DataService.getSession().name}. 
          <button id="logoutBtn" style="background:transparent; color:var(--primary); font-weight:600; text-decoration:underline; margin-left:0.5rem; border:none; cursor:pointer;">Cerrar sesión</button>
        </div>
      `;
      document.getElementById('logoutBtn').onclick = () => DataService.logout();
      return;
    }

    this.innerHTML = `
      <div class="form-card fade-in">
        <h2 id="authTitle" class="text-center" style="margin-bottom:var(--space-lg); font-weight:700;">Iniciar Sesión</h2>
        <form id="authForm">
          <div id="regFields" class="hidden">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-sm); margin-bottom:var(--space-sm);">
              <div class="form-group" style="margin:0">
                <label>🆔 Documento</label>
                <input id="docId" required placeholder="1020304050">
              </div>
              <div class="form-group" style="margin:0">
                <label>🌍 Nacionalidad</label>
                <input id="nat" required placeholder="Colombiana">
              </div>
            </div>
            <div class="form-group">
              <label>👤 Nombre Completo</label>
              <input id="name" required placeholder="María Pérez">
            </div>
            <div class="form-group">
              <label>📱 Teléfono</label>
              <input id="phone" required type="tel" placeholder="+57 300 123 4567">
            </div>
          </div>
          <div class="form-group">
            <label>📧 Email</label>
            <input id="email" type="email" required placeholder="tu@email.com">
          </div>
          <div class="form-group">
            <label>🔒 Contraseña</label>
            <input id="pass" type="password" required placeholder="Mínimo 6 caracteres">
          </div>
          <button type="submit" class="btn btn-accent btn-full">Ingresar</button>
        </form>
        <p class="text-center" style="margin-top:var(--space-md); cursor:pointer; color:var(--primary); font-weight:500;" id="toggleAuth">
          ¿No tienes cuenta? Regístrate
        </p>
      </div>
    `;

    document.getElementById('toggleAuth').onclick = () => {
      this.mode = this.mode === 'login' ? 'register' : 'login';
      document.getElementById('authTitle').textContent = this.mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta';
      document.getElementById('regFields').classList.toggle('hidden', this.mode === 'login');
      document.getElementById('toggleAuth').textContent = this.mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión';
      document.querySelector('#authForm button[type="submit"]').textContent = this.mode === 'login' ? 'Ingresar' : 'Crear Cuenta';
    };

    document.getElementById('authForm').onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pass = document.getElementById('pass').value;

      if (this.mode === 'register') {
        if (DataService.getUsers().some(u => u.email === email)) {
          return alert('⚠️ Este email ya está registrado');
        }
        DataService.addUser({ 
          id: 'u_' + Date.now(), 
          docId: document.getElementById('docId').value, 
          name: document.getElementById('name').value, 
          nationality: document.getElementById('nat').value, 
          phone: document.getElementById('phone').value, 
          email, 
          password: pass, 
          role: 'user' 
        });
        alert('✅ Cuenta creada. Inicia sesión.');
        document.getElementById('toggleAuth').click();
      } else {
        const user = DataService.authenticate(email, pass);
        if (!user) return alert('❌ Credenciales incorrectas.');
        DataService.login(user);
        window.location.reload();
      }
    };
  }
}

export class RoomCarousel extends HTMLElement {
  connectedCallback() {
    const rooms = DataService.getRooms();
    this.innerHTML = `
      <div class="carousel-wrapper">
        ${rooms.map(r => `
          <article class="carousel-item">
            <div class="card-image">
              <img src="${r.image}" alt="${r.name}" loading="lazy">
            </div>
            <div class="card-content">
              <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:0.35rem;">${r.name}</h3>
              <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:0.75rem;">
                🛏️ ${r.beds} cama(s) • 👥 Máx ${r.maxGuests}
              </p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                <div>
                  <span style="font-size:0.8rem; color:var(--text-light);">Desde</span>
                  <div style="font-size:1.35rem; font-weight:700; color:var(--text);">
                    $${r.price.toLocaleString()} <span style="font-size:0.85rem; font-weight:400;">/noche</span>
                  </div>
                </div>
                <a href="reservas.html" class="btn btn-outline" style="padding:0.5rem 1rem; font-size:0.85rem;">
                  Ver disponibilidad
                </a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }
}

export class ServiceGallery extends HTMLElement {
  connectedCallback() {
    const services = [
      { 
        title: 'Spa & Bienestar', 
        desc: 'Masajes relajantes, sauna y tratamientos exclusivos.', 
        img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80' 
      },
      { 
        title: 'Gastronomía Local', 
        desc: 'Platos típicos con ingredientes frescos de la región.', 
        img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' 
      },
      { 
        title: 'Zonas Húmedas', 
        desc: 'Piscinas climatizadas, jacuzzi exterior y áreas verdes.', 
        img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80' 
      }
    ];
    this.innerHTML = `
      <div class="services-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:var(--space-lg);">
        ${services.map(s => `
          <div style="position:relative; border-radius:var(--radius); overflow:hidden; height:300px; box-shadow:var(--shadow); cursor:pointer;">
            <img src="${s.img}" alt="${s.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease;">
            <div style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding:var(--space-lg); color:white;">
              <h3 style="margin:0 0 var(--space-xs); font-size:1.25rem;">${s.title}</h3>
              <p style="margin:0; font-size:0.9rem; opacity:0.9;">${s.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

customElements.define('auth-panel', AuthPanel);
customElements.define('room-carousel', RoomCarousel);
customElements.define('service-gallery', ServiceGallery);