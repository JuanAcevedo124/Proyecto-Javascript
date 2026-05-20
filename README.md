#  Hotel El Rincón del Carmen - Sistema de Reservas

Sitio web responsivo y funcional para la gestión de reservas de habitaciones, desarrollado con estándares modernos de desarrollo web. Simula un entorno completo de hotelería con autenticación, disponibilidad en tiempo real, prevención de solapamientos y panel administrativo.

## ✨ Características Principales
-  **Mobile-First**: Diseño optimizado para móviles, tablets y escritorio.
-  **Motor de Búsqueda**: Filtro por fechas y cantidad de huéspedes con cálculo automático de precio total.
- 🔐 **Autenticación Segura**: Registro con documento, nombre, nacionalidad, email, teléfono y contraseña. Solo usuarios logueados pueden reservar.
- ️ **Prevención de Solapamientos**: Algoritmo que valida rangos de fechas en tiempo real para evitar reservas duplicadas.
- 🔄 **Gestión Ágil**: Cancelación instantánea de reservas (libera fechas automáticamente).
- 🎛️ **Panel Admin**: CRUD de habitaciones y gestión de reservas.
-  **Persistencia Local**: Simulación de base de datos mediante `localStorage`.

## ️ Tecnologías Utilizadas
- `HTML5` & `CSS3`: Estructura semántica, diseño responsivo, variables CSS, Grid/Flexbox.
- `JavaScript (ES6+)`: Módulos, Web Components nativos (Vanilla JS), manejo de eventos, lógica de negocio.
- `Web Components`: Modularización de interfaz (`<auth-panel>`, `<room-gallery>`, `<booking-engine>`, etc.).
- `localStorage`: Simulación de almacenamiento persistente sin backend.

## 📁 Estructura del Proyecto
hotel-rincon/
├── index.html # Landing Page (Carrusel, Servicios, CTA)
── reservas.html # Motor de búsqueda, resultados y gestión de reservas
├── contacto.html # Ubicación, mapa y formulario de contacto
├── admin.html # Panel administrativo (Habitaciones y Reservas)
── css/
│ └── main.css # Estilos globales, responsive y componentes
└── js/
├── data-service.js # Capa de datos, lógica de negocio y localStorage
└── components.js # Web Components nativos reutilizables

## 🚀 Instalación y Ejecución
1. Clona el repositorio: `git clone <url-repo>`
2. Navega a la carpeta: `cd hotel-rincon`
3. Inicia un servidor local (requerido para módulos ES6):
   ```bash
   npx serve .
   # o usa la extensión "Live Server" en VS Code
4. Abre en el navegador: http://localhost:3000
👤 Credenciales de Prueba
### Rol
- Admin
### Email
- admin@rinconcarmen.com
### Contraseña
- admin2026
### Rol
- Usuario
### Email
- Regístrate desde reservas.html
### Contraseña
La que definas

## Notas Técnicas
Sin solapamiento: El sistema valida checkIn < existingCheckOut && checkOut > existingCheckIn.
Cancelación: Cambia el estado a cancelled, lo que libera el rango de fechas inmediatamente.
Imágenes: Se utiliza Unsplash para simulación. En producción, reemplazar por CDN propio.
Web Components: Desarrollados con Vanilla JS para máxima compatibilidad y sin dependencias externas.
## 📦 Entrega
Código fuente versionado con Git.
Repositorio privado compartido con las cuentas indicadas por el trainer.
Cumple con todos los requerimientos técnicos y funcionales del brief.