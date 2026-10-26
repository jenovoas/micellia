# Pizarra del Proyecto - Micelia

Este archivo sirve como pizarra de notas y configuraciones del proyecto **Micelia**.

## Servidor de Despliegue (Destino)

* **Alias SSH**: `fenix` (configurado en `~/.ssh/config`)
* **Dirección IP Pública**: `172.233.24.102` (para DNS y acceso público)
* **Dirección IP Privada (VPN)**: `10.88.0.1` (para SSH via `fenix`)
* **Puerto SSH**: `22`
* **Usuario**: `jnovoas`
* **Llave Privada**: `~/.ssh/id_ed25519_server` (fallback: `~/.ssh/id_ed25519`)
* **Estado**: **Online** (Soporte DNF, Rust y compilación release probado)

---

## Plan de DNS Autorizado y Sitios Web (Multidominio)

El servidor `fenix` resolverá y hospedará de forma autónoma los siguientes dominios:
1. **`pinguinoseguro.cl`** (Sitio principal + Next.js en puerto 3000)
   - Subdominio **`micelia.pinguinoseguro.cl`** (Dashboard estático + Proxy a Cortex Daemon en puerto 8080/ws)
2. **`laespiguita.cl`** (Sitio adicional, estáticos en `/var/www/laespiguita.cl`)

> **Nota**: `micelia.cl` **no es nuestro dominio** (está ocupado). Micelia vive en `micelia.pinguinoseguro.cl`.

---

## Guía de Despliegue y Aprovisionamiento Remoto

Cuando decidas sincronizar y configurar el servidor de producción, sigue estos pasos desde tu laptop:

### Paso 1: Sincronizar el Código y los Scripts
Desde la raíz del repositorio, ejecuta el target del host operativo `fenix`:
```bash
make -C system deploy-fenix
```
*Sincroniza el repositorio con `fenix` y reconstruye los servicios con Podman Compose. Requiere autorización explícita antes de ejecutarlo.*

### Paso 2: Aprovisionar DNS (BIND9), Nginx y Firewall
Ejecuta el script local en el servidor remoto:
```bash
ssh fenix 'bash -s' < ./system/deployment/setup_multi_production.sh
```
*El script detecta la IPv4 pública actual (o acepta `MICELIA_PUBLIC_IPV4`), configura las zonas DNS autoritativas y el subdominio de Micelia, crea los server blocks y abre los puertos 53, 80 y 443.*

> [!WARNING]
> Ejecutar `setup_multi_production.sh` sobrescribirá los archivos de configuración de Nginx en `/etc/nginx/conf.d/` con bloques iniciales en puerto 80, eliminando las directivas SSL agregadas por Certbot. Si esto ocurre, los sitios HTTPS dejarán de responder y deberás re-ejecutar el **Paso 4** inmediatamente para restaurar los certificados y el puerto 443.

### Paso 3: Copiar el Script de Certificación SSL (Certbot)
Copia el script de emisión de certificados a la ruta de comandos del servidor `fenix`:
```bash
scp ./system/deployment/issue_ssl.sh fenix:/tmp/issue_ssl.sh
ssh fenix "sudo mv /tmp/issue_ssl.sh /usr/local/bin/issue_ssl.sh && sudo chmod +x /usr/local/bin/issue_ssl.sh"
```

### Paso 4: Emitir Certificados HTTPS (Bajo Demanda)
Una vez delegados los dominios y propagados los registros hacia la IPv4 pública actual de `fenix`, ejecuta el comando para activar HTTPS para cada dominio:
```bash
ssh fenix "sudo /usr/local/bin/issue_ssl.sh pinguinoseguro.cl --www"
ssh fenix "sudo /usr/local/bin/issue_ssl.sh micelia.pinguinoseguro.cl"
ssh fenix "sudo /usr/local/bin/issue_ssl.sh laespiguita.cl --www"
```
*Este comando solicitará los certificados TLS/SSL de Let's Encrypt, reconfigurará Nginx para forzar el redireccionamiento seguro y reiniciará el servicio automáticamente.*

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
- **Despliegue e Integración**:
  - Configuración e inyección permanente del ambiente en la regla de desarrollo de agentes: **Todo despliegue remoto debe hacerse mediante `make -C system deploy-fenix` y solo con autorización explícita**.

---

## Estado de los Procedimientos de Despliegue

* El único host remoto operativo documentado es `fenix`; confirma su estado antes de desplegar.
* El target `deploy-fenix` del `Makefile` usa `fenix` y requiere autorización explícita antes de ejecutarse.
* El dominio vigente del portal es `micelia.pinguinoseguro.cl`.
