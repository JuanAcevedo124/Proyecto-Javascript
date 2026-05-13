export const DataService = {
    KEYS: { USERS: 'hotel_users', ROOMS: 'hotel_rooms', BOOKINGS: 'hotel_bookings', SESSION: 'hotel_session' },

init() {
    if (!localStorage.getItem(this.KEYS.ROOMS)) this.seedData();
},

seedData() {
    const rooms = [
        { id: 'r1', name: 'Suite Carmen', beds: 1, maxGuests: 2, price: 180, amenities: ['WiFi', 'Jacuzzi', 'Minibar'], images: ['https://picsum.photos/seed/h1/800/500'] },
        { id: 'r2', name: 'Habitación Familiar', beds: 2, maxGuests: 4, price: 250, amenities: ['WiFi', 'TV 50"', 'Desayuno'], images: ['https://picsum.photos/seed/h2/800/500'] },
        { id: 'r3', name: 'Cabaña Spa', beds: 1, maxGuests: 2, price: 200, amenities: ['WiFi', 'Acceso Spa', 'Minibar'], images: ['https://picsum.photos/seed/h3/800/500'] }
];
    const admin = { id: 'u_admin', docId: '123456', name: 'Administrador', nationality: 'Colombiana', email: 'admin@hotel.com', phone: '3001234567', password: 'admin123', role: 'admin' };
    localStorage.setItem(this.KEYS.ROOMS, JSON.stringify(rooms));
    localStorage.setItem(this.KEYS.USERS, JSON.stringify([admin]));
},

_get(key) { return JSON.parse(localStorage.getItem(key) || '[]'); },
_set(key, data) { localStorage.setItem(key, JSON.stringify(data)); },

getUsers() { return this._get(this.KEYS.USERS); },
addUser(user) { const users = this.getUsers(); users.push(user); this._set(this.KEYS.USERS, users); },
authenticate(email, password) { return this.getUsers().find(u => u.email === email && u.password === password) || null; },

getRooms() { return this._get(this.KEYS.ROOMS); },
addRoom(room) { const rooms = this.getRooms(); rooms.push(room); this._set(this.KEYS.ROOMS, rooms); },
updateRoom(updated) { const rooms = this.getRooms().map(r => r.id === updated.id ? updated : r); this._set(this.KEYS.ROOMS, rooms); },
deleteRoom(id) { this._set(this.KEYS.ROOMS, this.getRooms().filter(r => r.id !== id)); },

getBookings() { return this._get(this.KEYS.BOOKINGS); },
addBooking(booking) { const bookings = this.getBookings(); bookings.push(booking); this._set(this.KEYS.BOOKINGS, bookings); },
updateBooking(updated) { const bookings = this.getBookings().map(b => b.id === updated.id ? updated : b); this._set(this.KEYS.BOOKINGS, bookings); },

checkAvailability(roomId, checkIn, checkOut, excludeId = null) {
    const bookings = this.getBookings().filter(b => b.roomId === roomId && b.status === 'confirmed');
    const start = new Date(checkIn);
    const end = new Date(checkOut);
        return !bookings.some(b => {
        if (excludeId && b.id === excludeId) return false;
        const bStart = new Date(b.checkIn);
        const bEnd = new Date(b.checkOut);
        return start < bEnd && end > bStart; // Solapamiento
    });
},

calculatePrice(pricePerNight, checkIn, checkOut) {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * pricePerNight : 0;
},

login(user) { localStorage.setItem(this.KEYS.SESSION, JSON.stringify(user)); },
logout() { localStorage.removeItem(this.KEYS.SESSION); },
getSession() { return JSON.parse(localStorage.getItem(this.KEYS.SESSION) || 'null'); },
isAdmin() { const s = this.getSession(); return s && s.role === 'admin'; }
};