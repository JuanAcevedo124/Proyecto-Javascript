# Hotel El Rincón del Carmen: sistema de reservas

Aplicación web para buscar y reservar habitaciones de hotel, con validación de fechas y panel administrativo. Es un proyecto de frontend: los datos se guardan en el navegador con `localStorage`.

**Demo:** https://juanacevedo124.github.io/Proyecto-Javascript/

## Funcionalidades

- Registro e inicio de sesión de usuarios (simulados en el navegador).
- Búsqueda por fechas y número de huéspedes, con cálculo automático del precio total.
- Validación que impide reservar una habitación en fechas que se cruzan.
- Cancelación de reservas, que libera las fechas de inmediato.
- Panel administrativo para gestionar habitaciones y reservas.
- Diseño responsive con enfoque mobile-first.

## Tecnologías

| Área | Herramientas |
|---|---|
| Interfaz | HTML5, CSS3 (variables, Grid, Flexbox) |
| Lógica | JavaScript ES6+ con módulos |
| Componentes | Web Components nativos, sin librerías |
| Persistencia | `localStorage` |

## Estructura

```text
Proyecto-Javascript/
├── index.html           Página principal
├── reservas.html        Búsqueda y gestión de reservas
├── contacto.html        Ubicación y contacto
├── admin.html           Panel administrativo
├── css/main.css
└── js/
    ├── app.js
    ├── components.js    Web Components
    └── data-service.js  Datos y reglas de negocio
```

## Ejecución local

Los módulos ES6 requieren un servidor local:

```bash
git clone https://github.com/JuanAcevedo124/Proyecto-Javascript.git
cd Proyecto-Javascript
npx serve .
```

Luego abre la dirección que muestra la terminal.

## Acceso de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@rinconcarmen.com | admin2026 |
| Usuario | Regístrate en `reservas.html` | La que definas |

## Decisiones técnicas

- **Cruce de fechas:** hay conflicto si `inicio < finExistente && fin > inicioExistente`, y solo se comparan reservas confirmadas.
- **Cancelación:** la reserva pasa al estado `cancelled` y deja de bloquear sus fechas.

## Limitaciones

Al no tener backend, la autenticación es una demostración y las contraseñas se guardan sin cifrar en el navegador. No debe usarse con datos reales.

## Autor

Juan José Acevedo Morales, desarrollador de software junior.
[Portafolio](https://juanacevedo124.github.io/Portafolio/) | [GitHub](https://github.com/JuanAcevedo124) | [LinkedIn](https://www.linkedin.com/in/juan-acevedo-b24759450/)
