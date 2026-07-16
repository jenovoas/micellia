# Pizarra del Proyecto - Micelia

Este archivo sirve como pizarra de notas y configuraciones del proyecto **Micelia**.

## Servidor de Despliegue (Destino)

* **Alias SSH**: `fan` (configurado en `~/.ssh/config`)
* **Dirección IP**: `157.254.174.40`
* **Puerto SSH**: `22`
* **Usuario**: `jnovoas`
* **Llave Privada**: `~/.ssh/id_servers_ed25519`
* **Estado**: **Online** (Soporte DNF, Rust y compilación release probado)

---

## Plan de DNS Autorizado y Sitios Web (Multidominio)

El servidor `fan` resolverá y hospedará de forma autónoma los siguientes dominios:
1. **`micelia.cl`** (Dashboard + Proxy a Cortex Daemon en puerto 8080)
2. **`pinguinoseguro.cl`** (Sitio adicional, estáticos en `/var/www/pinguinoseguro.cl`)
3. **`laespiguita.cl`** (Sitio adicional, estáticos en `/var/www/laespiguita.cl`)

---

## Guía de Despliegue y Aprovisionamiento Remoto

Cuando decidas sincronizar y configurar el servidor de producción, sigue estos pasos desde tu laptop:

### Paso 1: Sincronizar el Código y los Scripts
Ejecuta en la raíz de `system`:
```bash
make deploy
```
*Esto creará la estructura en `~/micellia` en el servidor y compilará la versión optimizada del backend.*

### Paso 2: Aprovisionar DNS (BIND9), Nginx y Firewall
Ejecuta el script local en el servidor remoto:
```bash
ssh fan 'bash -s' < ./deployment/setup_multi_production.sh
```
*Este comando instalará BIND9, Nginx, configurará las 3 zonas DNS autoritativas, creará los server blocks para Nginx y abrirá los puertos 53 (DNS), 80 (HTTP) y 443 (HTTPS) en el firewall.*

### Paso 3: Copiar el Script de Certificación SSL (Certbot)
Copia el script de emisión de certificados a la ruta de comandos del servidor `fan`:
```bash
scp ./deployment/issue_ssl.sh fan:/tmp/issue_ssl.sh
ssh fan "sudo mv /tmp/issue_ssl.sh /usr/local/bin/issue_ssl.sh && sudo chmod +x /usr/local/bin/issue_ssl.sh"
```

### Paso 4: Emitir Certificados HTTPS (Bajo Demanda)
Una vez que hayas delegado tus dominios en tu registrador (NIC Chile, etc.) y las consultas DNS resuelvan a `157.254.174.40`, ejecuta el comando para activar HTTPS para cada dominio:
```bash
ssh fan "sudo /usr/local/bin/issue_ssl.sh micelia.cl"
ssh fan "sudo /usr/local/bin/issue_ssl.sh pinguinoseguro.cl"
ssh fan "sudo /usr/local/bin/issue_ssl.sh laespiguita.cl"
```
*Este comando solicitará los certificados TLS/SSL de Let's Encrypt, reconfigurará Nginx para forzar el redireccionamiento seguro y reiniciará el servicio automáticamente.*

---

## Historial y Bitácora de Sesiones (Julio 2026)

### Sesión 1: Base de la Biblioteca Científica e Ingesta de Datos
- **Biblioteca Científica (`biblioteca.html`)**: Catálogo interactivo con buscador y filtros micológicos, fondo Three.js procedural de red micelial.
- **Lector de Artículos (`view_doc.html`)**: Renderizado dinámico de Markdown (`Marked.js`), soporte para fórmulas matemáticas (`MathJax`) y animaciones de vapor CSS personalizadas para las recetas gourmet.
- **Base Documental (`system/dashboard/docs/`)**: 15 artículos de valor nutricional, guías de autocultivo, recetas (ceviche, calamares, crema, risotto, tacos, scampi), y detalles técnicos de telemetría y seguridad.
- **Nginx & Zonas DNS**: Configuración de BIND9 y enrutamiento reverso para Next.js (puerto 3000), Cortex daemon (puerto 8080/4000) y aliases estáticos para los sitios `pinguinoseguro.cl`, `laespiguita.cl` y `micelia.cl`.

### Sesión 2: Unificación de Accesos por Rol y Seguridad Operativa
- **Navbar Unificado**: Remoción del botón estático "Acceso Operador" en `index.html`, `biblioteca.html` y `view_doc.html`. El avatar de perfil actúa ahora como único acceso.
- **Control de Roles**:
  - Detección basada en correo electrónico en `public.js` (dominios `@micelia.cl` se categorizan con el rol `"operator"`, otros como `"customer"`).
  - Redirección automática a `admin.html` para operadores y modal de compras/estimaciones de Cortex ML para clientes al hacer clic en el perfil.
- **Seguridad en `admin.html`**:
  - Script bloqueante en `<head>` que verifica el rol en `localStorage` antes del renderizado de página y redirige a usuarios no autorizados a `index.html`.
  - Añadido botón "Cerrar Sesión" en la barra lateral que limpia el estado de sesión y devuelve al usuario al portal público.
  - Visualización del nombre del operador en el subtítulo del panel de control de telemetría.
- **Despliegue e Integración**:
  - Configuración e inyección permanente del ambiente en la regla de desarrollo de agentes: **Toda verificación y despliegue debe ser en producción (`fan`) mediante `make deploy`**.

