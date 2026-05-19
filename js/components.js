import { DataService } from './data-service.js';

export class AuthPanel extends HTMLElement {
  constructor() { 
    super(); 
    this.mode = 'login'; 
  }
  
  connectedCallback() {
    const session = DataService.getSession();
    
    // 1. Si ya hay sesión, mostrar mensaje de bienvenida
    if (session) {
      this.innerHTML = `
        <div class="alert alert-success">
          👋 Hola, ${session.name}. 
          <button id="logoutBtn" style="background:transparent; color:var(--primary); font-weight:600; text-decoration:underline; margin-left:0.5rem; border:none; cursor:pointer;">Cerrar sesión</button>
        </div>
      `;
      // Usamos setTimeout para asegurar que el DOM existe antes de asignar el evento
      setTimeout(() => {
        const btn = this.querySelector('#logoutBtn');
        if (btn) btn.onclick = () => DataService.logout();
      }, 0);
      return;
    }

    // 2. Si no hay sesión, renderizar formulario
    this.innerHTML = `
      <div class="form-card fade-in">
        <h2 id="authTitle" class="text-center" style="margin-bottom:var(--space-lg); font-weight:700;">Iniciar Sesión</h2>
        <form id="authForm" novalidate>
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
              <label> Nombre Completo</label>
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

    // 3. VINCULACIÓN DE EVENTOS ROBUSTA
    // Usamos requestAnimationFrame para garantizar que el navegador terminó de pintar el HTML
    requestAnimationFrame(() => {
      const form = this.querySelector('#authForm');
      const toggle = this.querySelector('#toggleAuth');
      const regFields = this.querySelector('#regFields');
      const title = this.querySelector('#authTitle');
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!form || !toggle) return; // Seguridad por si acaso

      // Evento del botón Toggle (Cambiar entre Login/Registro)
      toggle.onclick = (e) => {
        e.preventDefault();
        this.mode = this.mode === 'login' ? 'register' : 'login';
        
        if (this.mode === 'login') {
          title.textContent = 'Iniciar Sesión';
          regFields.classList.add('hidden');
          toggle.textContent = '¿No tienes cuenta? Regístrate';
          submitBtn.textContent = 'Ingresar';
        } else {
          title.textContent = 'Crear Cuenta';
          regFields.classList.remove('hidden');
          toggle.textContent = '¿Ya tienes cuenta? Inicia Sesión';
          submitBtn.textContent = 'Crear Cuenta';
        }
      };

      // Evento del Formulario (Login o Registro)
      form.addEventListener('submit', (e) => {
        e.preventDefault(); // ️ ESTO EVITA QUE LA PÁGINA SE RECARGUE AL DAR CLICK
        
        const email = this.querySelector('#email').value.trim();
        const pass = this.querySelector('#pass').value;

        if (this.mode === 'register') {
          // LÓGICA DE REGISTRO
          const docId = this.querySelector('#docId').value;
          const name = this.querySelector('#name').value;
          const nat = this.querySelector('#nat').value;
          const phone = this.querySelector('#phone').value;

          if (!docId || !name || !nat || !phone) {
            return alert('⚠️ Por favor completa todos los campos de registro.');
          }

          if (DataService.getUsers().some(u => u.email === email)) {
            return alert('⚠️ Este email ya está registrado');
          }

          DataService.addUser({ 
            id: 'u_' + Date.now(), 
            docId, name, nationality: nat, phone, email, password: pass, role: 'user' 
          });
          
          alert('✅ Cuenta creada exitosamente. Ahora inicia sesión.');
          // Simular click en toggle para volver al login automáticamente
          toggle.click(); 
          
        } else {
          // LÓGICA DE LOGIN
          if (!email || !pass) return alert('⚠️ Ingresa email y contraseña.');
          
          const user = DataService.authenticate(email, pass);
          if (!user) return alert('❌ Credenciales incorrectas. Verifica tu email y contraseña.');
          
          DataService.login(user);
          window.location.reload();
        }
      });
    });
  }
}

export class RoomCarousel extends HTMLElement {
  connectedCallback() {
    const rooms = DataService.getRooms();
    this.innerHTML = `
      <div class="carousel-wrapper">
        ${rooms.map(r => `
          <article class="carousel-item">
            <room-gallery images='${JSON.stringify(r.images)}'></room-gallery>
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
// ============================================
// GALERÍA DE IMÁGENES CON NAVEGACIÓN
// ============================================
export class RoomGallery extends HTMLElement {
  connectedCallback() {
    const images = this.getAttribute('images') ? JSON.parse(this.getAttribute('images')) : [];
    if (images.length === 0) return;

    this.innerHTML = `
      <div class="room-gallery" style="position:relative; width:100%; aspect-ratio:4/3; overflow:hidden; background:#f0f0f0;">
        <img class="gallery-img" src="${images[0]}" alt="Habitación" loading="lazy" style="width:100%; height:100%; object-fit:cover; transition:opacity 0.3s ease;">
        
        ${images.length > 1 ? `
          <button class="gallery-btn gallery-prev" style="position:absolute; left:8px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.9); border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:#333; box-shadow:0 2px 8px rgba(0,0,0,0.2); transition:all 0.2s ease;" onmouseover="this.style.background='white';this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.9)';this.style.transform='translateY(-50%) scale(1)'">❮</button>
          <button class="gallery-btn gallery-next" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.9); border:none; width:36px; height:36px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:1.2rem; color:#333; box-shadow:0 2px 8px rgba(0,0,0,0.2); transition:all 0.2s ease;" onmouseover="this.style.background='white';this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.9)';this.style.transform='translateY(-50%) scale(1)'">❯</button>
        ` : ''}
        
        ${images.length > 1 ? `
          <div class="gallery-dots" style="position:absolute; bottom:8px; left:50%; transform:translateX(-50%); display:flex; gap:6px;">
            ${images.map((_, i) => `<span class="gallery-dot ${i===0?'active':''}" style="width:8px; height:8px; border-radius:50%; background:${i===0?'white':'rgba(255,255,255,0.5)'}; transition:all 0.2s ease; cursor:pointer;" data-index="${i}"></span>`).join('')}
          </div>
        ` : ''}
        
        ${images.length > 1 ? `
          <div class="gallery-counter" style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.6); color:white; padding:2px 8px; border-radius:12px; font-size:0.75rem; font-weight:600;">1 / ${images.length}</div>
        ` : ''}
      </div>
    `;

    // Lógica de navegación
    let currentIndex = 0;
    const imgEl = this.querySelector('.gallery-img');
    const prevBtn = this.querySelector('.gallery-prev');
    const nextBtn = this.querySelector('.gallery-next');
    const dots = this.querySelectorAll('.gallery-dot');
    const counter = this.querySelector('.gallery-counter');

    const updateGallery = (index) => {
      imgEl.style.opacity = '0.3';
      setTimeout(() => {
        imgEl.src = images[index];
        imgEl.style.opacity = '1';
      }, 150);
      
      dots.forEach((dot, i) => {
        dot.style.background = i === index ? 'white' : 'rgba(255,255,255,0.5)';
        dot.style.transform = i === index ? 'scale(1.3)' : 'scale(1)';
      });
      
      if (counter) counter.textContent = `${index + 1} / ${images.length}`;
    };

    if (prevBtn && nextBtn) {
      prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateGallery(currentIndex);
      };

      nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateGallery(currentIndex);
      };
    }

    dots.forEach((dot, i) => {
      dot.onclick = () => {
        currentIndex = i;
        updateGallery(currentIndex);
      };
    });

    // Soporte para swipe en móvil
    let touchStartX = 0;
    const gallery = this.querySelector('.room-gallery');
    
    gallery.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    gallery.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0 && nextBtn) {
          // Swipe izquierda → siguiente
          currentIndex = (currentIndex + 1) % images.length;
        } else if (diff < 0 && prevBtn) {
          // Swipe derecha → anterior
          currentIndex = (currentIndex - 1 + images.length) % images.length;
        }
        updateGallery(currentIndex);
      }
    }, { passive: true });
  }
}

customElements.define('room-gallery', RoomGallery);
customElements.define('auth-panel', AuthPanel);
customElements.define('room-carousel', RoomCarousel);
customElements.define('service-gallery', ServiceGallery);