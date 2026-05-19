export const DataService = {
  KEYS: { 
    USERS: 'hotel_users', 
    ROOMS: 'hotel_rooms', 
    BOOKINGS: 'hotel_bookings', 
    SESSION: 'hotel_session' 
  },

  init() {
    this.seedData(); // Se ejecuta SIEMPRE para garantizar consistencia
  },

  seedData() {
    const rooms = [
      { 
        id: 'r1', 
        name: 'Suite Carmen', 
        beds: 1, 
        maxGuests: 2, 
        price: 180000, 
        amenities: ['WiFi Alta Velocidad', 'Jacuzzi Privado', 'Minibar', 'Vista al Jardín'], 
        images: [
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80'
        ] 
      },
      { 
        id: 'r2', 
        name: 'Habitación Familiar', 
        beds: 2, 
        maxGuests: 4, 
        price: 250000, 
        amenities: ['WiFi', 'TV 55"', 'Desayuno Incluido', 'Cuna', 'Terraza'], 
        images: [
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
          'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80'
        ] 
      },
      { 
        id: 'r3', 
        name: 'Cabaña Spa & Relax', 
        beds: 1, 
        maxGuests: 2, 
        price: 210000, 
        amenities: ['WiFi', 'Acceso Ilimitado Spa', 'Minibar Orgánico', 'Terraza Privada'], 
        images: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
          'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?w=800&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
          'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80'
        ] 
      }
    ];
  
    if (!localStorage.getItem(this.KEYS.ROOMS)) {
      localStorage.setItem(this.KEYS.ROOMS, JSON.stringify(rooms));
    }
  
    let users = this._get(this.KEYS.USERS);
    const adminExists = users.some(u => u.email === 'admin@rinconcarmen.com');
    
    if (!adminExists) {
      const admin = { 
        id: 'admin_1', docId: '1001', name: 'Administrador General', 
        nationality: 'Colombiana', email: 'admin@rinconcarmen.com', 
        phone: '3001234567', password: 'admin2026', role: 'admin' 
      };
      users.push(admin);
      this._set(this.KEYS.USERS, users);
    }
},
  _get(key) { 
    try { 
      return JSON.parse(localStorage.getItem(key) || '[]'); 
    } catch { 
      return []; 
    } 
  },
  
  _set(key, data) { 
    localStorage.setItem(key, JSON.stringify(data)); 
  },

  getUsers() { 
    return this._get(this.KEYS.USERS); 
  },
  
  addUser(u) { 
    const users = this.getUsers(); 
    users.push(u); 
    this._set(this.KEYS.USERS, users); 
  },
  
  authenticate(email, pass) { 
    return this.getUsers().find(u => u.email === email && u.password === pass) || null; 
  },

  getRooms() { 
    return this._get(this.KEYS.ROOMS); 
  },
  
  addRoom(r) { 
    const rooms = this.getRooms(); 
    rooms.push(r); 
    this._set(this.KEYS.ROOMS, rooms); 
  },
  
  updateRoom(r) { 
    const rooms = this.getRooms().map(x => x.id === r.id ? r : x); 
    this._set(this.KEYS.ROOMS, rooms); 
  },
  
  deleteRoom(id) { 
    this._set(this.KEYS.ROOMS, this.getRooms().filter(r => r.id !== id)); 
  },

  getBookings() { 
    return this._get(this.KEYS.BOOKINGS); 
  },
  
  getUserBookings(userId) { 
    return this.getBookings().filter(b => b.userId === userId); 
  },
  
  addBooking(b) { 
    const list = this.getBookings(); 
    list.push(b); 
    this._set(this.KEYS.BOOKINGS, list); 
  },
  
  cancelBooking(id) {
    const list = this.getBookings().map(b => 
      b.id === id ? { ...b, status: 'cancelled' } : b
    );
    this._set(this.KEYS.BOOKINGS, list);
  },

  isAvailable(roomId, checkIn, checkOut) {
    const start = new Date(checkIn).setHours(0,0,0,0);
    const end = new Date(checkOut).setHours(0,0,0,0);
    return !this.getBookings().some(b => {
      if (b.roomId !== roomId || b.status !== 'confirmed') return false;
      const bStart = new Date(b.checkIn).setHours(0,0,0,0);
      const bEnd = new Date(b.checkOut).setHours(0,0,0,0);
      return start < bEnd && end > bStart;
    });
  },

  calcPrice(price, inDate, outDate) {
    const msPerDay = 86400000;
    const nights = Math.max(1, Math.ceil((new Date(outDate) - new Date(inDate)) / msPerDay));
    return { nights, total: nights * price };
  },

  login(u) { 
    localStorage.setItem(this.KEYS.SESSION, JSON.stringify(u)); 
  },
  
  logout() { 
    localStorage.removeItem(this.KEYS.SESSION); 
    window.location.href = 'index.html'; 
  },
  
  getSession() { 
    try { 
      return JSON.parse(localStorage.getItem(this.KEYS.SESSION) || 'null'); 
    } catch { 
      return null; 
    } 
  },
  
  isAdmin() { 
    const s = this.getSession(); 
    return s && s.role === 'admin'; 
  }
};