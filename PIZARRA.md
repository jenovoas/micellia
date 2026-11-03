# Pizarra del Proyecto - Micelia

Este archivo sirve como pizarra de notas y configuraciones del proyecto **Micelia**.

## Estado operativo vigente

No hay un destino de producción confirmado para Micelia en estas notas. La memoria compartida indica que `micelia.pinguinoseguro.cl` aún no tiene servicio, virtual host, contenido ni certificado definidos. Confirmar el alcance y el estado real con las notas vigentes del vault antes de proponer operaciones.

Este archivo conserva registros de sesiones de una infraestructura anterior. Los hosts, direcciones, puertos, DNS, rutas Nginx, Certbot y scripts de las secciones históricas no son instrucciones ejecutables. No desplegar, aprovisionar ni modificar DNS, TLS, proxy o firewall sin autorización explícita para la acción concreta.

Para cualquier operación futura, consultar primero el HANDOFF y las notas actuales del vault; verificar el repositorio y el host directamente, y preparar un plan de reversión. La presencia de un target o script en el repositorio no equivale a autorización.

---

## Historial y Bitácora de Sesiones (Julio 2026)

### Sesión 1: Base de la Biblioteca Científica e Ingesta de Datos
- **Biblioteca Científica (`biblioteca.html`)**: Catálogo interactivo con buscador y filtros micológicos, fondo Three.js procedural de red micelial.
- **Lector de Artículos (`view_doc.html`)**: Renderizado dinámico de Markdown (`Marked.js`), soporte para fórmulas matemáticas (`MathJax`) y animaciones de vapor CSS personalizadas para las recetas gourmet.
- **Base Documental (`system/dashboard/docs/`)**: 15 artículos de valor nutricional, guías de autocultivo, recetas (ceviche, calamares, crema, risotto, tacos, scampi), y detalles técnicos de telemetría y seguridad.
- **Nginx & Zonas DNS**: Configuración de BIND9 y enrutamiento reverso para Next.js (puerto 3000), Cortex daemon (puerto 8080/4000) y aliases estáticos para los sitios `pinguinoseguro.cl` (incluye `micelia.pinguinoseguro.cl`) y `laespiguita.cl`.

### Sesión 2: Unificación de Accesos por Rol y Seguridad Operativa
- **Navbar Unificado**: Remoción del botón estático "Acceso Operador" en `index.html`, `biblioteca.html` y `view_doc.html`. El avatar de perfil actúa ahora como único acceso.
- **Control de Roles**:
  - Detección basada en correo electrónico en `public.js` (dominios `@pinguinoseguro.cl` se categorizan con el rol `"operator"`, otros como `"customer"`).
  - Redirección automática a `admin.html` para operadores y modal de compras/estimaciones de Cortex ML para clientes al hacer clic en el perfil.
- **Seguridad en `admin.html`**:
  - Script bloqueante en `<head>` que verifica el rol en `localStorage` antes del renderizado de página y redirige a usuarios no autorizados a `index.html`.
  - Añadido botón "Cerrar Sesión" en la barra lateral que limpia el estado de sesión y devuelve al usuario al portal público.
  - Visualización del nombre del operador en el subtítulo del panel de control de telemetría.
- **Despliegue e Integración (registro histórico)**:
  - En julio de 2026 se documentó un flujo de despliegue remoto que ya no debe tratarse como procedimiento vigente. Consulta el estado actual del vault y solicita autorización explícita antes de cualquier operación.

---

## Referencias históricas de despliegue

Las menciones a `fenix`, `deploy-fenix` y dominios en esta bitácora reflejan decisiones o configuraciones históricas; no confirman destino, servicio ni despliegue vigentes. No ejecutar los comandos de este archivo.
