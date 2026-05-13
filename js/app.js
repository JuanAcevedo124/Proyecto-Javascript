import { DataService } from './data-service.js';
import './components.js'; // Registra componentes

document.addEventListener('DOMContentLoaded', () => {
DataService.init();

// Header dinámico según sesión
const nav = document.querySelector('.nav-links');
const user = DataService.getSession();
const authBtn = document.getElementById('authBtn');

if (user) {
    authBtn.textContent = `👤 ${user.name.split(' ')[0]} | Cerrar Sesión`;
    authBtn.onclick = () => { DataService.logout(); window.location.reload(); };
    if (DataService.isAdmin()) nav.innerHTML += `<li><a href="admin.html">⚙️ Admin</a></li>`;
} else {
    authBtn.textContent = '🔑 Iniciar Sesión';
    authBtn.onclick = () => alert('Inicia sesión desde reservas.html');
}
});