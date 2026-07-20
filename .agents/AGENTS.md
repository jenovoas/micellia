# Reglas del Proyecto Micelia (.agents/AGENTS.md)

Este archivo define las reglas arquitectónicas, restricciones de diseño y especificaciones técnicas de Micelia. Los agentes de IA deben respetar y adherirse estrictamente a estas directrices en cada interacción y edición de código.

---

## 1. Identidad de Marca y Estética
* **Colores Principales**: Verde bosque profundo (fondo oscuro, botones secundarios) y acentos en **oro crema / champán (`#c3b59f`)** para botones principales, enlaces y resaltados premium.
* **Tipografía**: Fuentes modernas sin serifas (por ejemplo, Outfit o Inter desde Google Fonts) para dar una sensación limpia y tecnológica.

---

## 3. Accesibilidad de Tercera Edad (Adulto Mayor)
* Para evitar la fricción digital, se debe proveer un flujo simplificado de pedidos por WhatsApp.
* El enlace de WhatsApp debe redirigir al número corporativo con el mensaje pre-redactado:
  `"Hola Micelia, quisiera pedir el Pack Adulto Mayor de setas de 500g"`

---

## 4. Estándar de Telemetría (Yatra S60)
* Toda lectura de sensores (Temperatura, Humedad, CO₂) se procesa y almacena en base sexagesimal (`s60`) mediante la librería interna en `system/s60`.
* En la visualización de usuario, los rangos saludables fúngicos ideales a destacar son:
  * **Humedad**: 85% - 95% (crítico para inducción de primordios).
  * **CO₂**: < 900 ppm (previene crecimiento fibroso o elongado).
  * **Temperatura**: 18°C - 22°C (crecimiento celular equilibrado).

---

## 5. Ledger de Transacciones TruthSync
* Todo pedido nuevo y actualización de despacho es firmado en el ledger criptográfico inmutable mediante un cálculo de hash SHA256 (enlazando ID, datos del cliente, estado anterior y estado nuevo) y almacenado en la tabla `truthsync_orders` en PostgreSQL.

---

## 6. Integración ML y PyO3
* Las funciones matemáticas de regresión lineal (mínimos cuadrados) usadas para proyectar ventas están programadas en Rust (`system/cortex/src/lib.rs`) y expuestas como módulo PyO3 ejecutable por Python.
* Para soporte de Python 3.14 en sistemas Linux, se debe inyectar permanentemente la variable de entorno `PYO3_USE_ABI3_FORWARD_COMPATIBILITY = "1"`.

---

## 7. Entorno de Producción y Despliegue
* **Servidor Destino**: `157.254.174.40` (Hostname: `fan`, usuario `jnovoas`, llaves SSH configuradas).
* **Zonas DNS Autoritativas (BIND9)**: El puerto 53 (UDP/TCP) de `fan` responde consultas de nombres de forma autoritativa para:
  * `micelia.cl`
  * `pinguinoseguro.cl` (registrado en NIC Chile con Glue Records `ns1.pinguinoseguro.cl` y `ns2.pinguinoseguro.cl` a la IP `157.254.174.40`).
  * `laespiguita.cl` (delegado a los nameservers de `pinguinoseguro.cl`).
* **Puertos de Aplicación**:
  * **Puerto 3000**: Next.js Standalone de `pinguinoseguro_web` (`~/pinguinoseguro_web/.next/standalone/server.js`).
  * **Puerto 8080**: API Gateway & WebSockets del Cortex daemon de Micelia (`~/micellia/target/release/cortex`).
  * **Puerto 4000**: TCP Listener del Cortex daemon para recibir lecturas de firmware IoT.
* **Enrutamiento Nginx (`/etc/nginx/conf.d/`)**:
  * **`pinguinoseguro.cl.conf` (también maneja IP `157.254.174.40` y `_`)**:
    * `/` (Raíz) ➔ Proxy reverso a `http://127.0.0.1:3000` (Next.js).
    * `/portfolio` ➔ Alias a `/var/www/pinguinoseguro.cl/portfolio/` (Vite static). Tiene una regla de redirección estricta para forzar barra diagonal al final (`/portfolio/`).
    * `/micelia` ➔ Alias a `/var/www/micelia.cl/dashboard/` (Estáticos de Micelia + Fondo Three.js).
    * `/ws` ➔ Proxy reverso WebSocket a `http://127.0.0.1:8080/ws` (Cortex daemon).
  * **`laespiguita.cl.conf`**:
    * `/` (Raíz) ➔ Carpeta `/var/www/laespiguita.cl/` (React Vite static).
* **Políticas de Seguridad de Sistema (SELinux)**:
  * Todas las carpetas en `/var/www/` deben estar etiquetadas con el contexto `httpd_sys_content_t` y permisos `chmod 755` para ser legibles por Nginx.
  * El booleano de SELinux `httpd_can_network_connect` debe permanecer en `1` (on) para permitir a Nginx redirigir tráfico a los puertos 3000 y 8080.
* **Certificados SSL (Certbot)**:
  * Administrados mediante el script helper en el servidor en `/usr/local/bin/issue_ssl.sh`. Ejecutar por dominio bajo demanda una vez propagado el DNS (`sudo /usr/local/bin/issue_ssl.sh <dominio>`).

---

## 8. Foco en Producción y Despliegues Remotos
* Todo cambio realizado en el código local debe sincronizarse y probarse directamente en el servidor de producción `fan` (mediante `make -C system deploy`).
* Los reportes, capturas y walkthroughs deben orientarse y hacer referencia al entorno real de producción y no a pruebas en localhost.
* **Advertencia Crítica de SSL/Certbot**: Ejecutar `setup_multi_production.sh` sobrescribe los bloques de Nginx en `/etc/nginx/conf.d/` desactivando el puerto 443 (SSL). Si es estrictamente necesario correr ese script de aprovisionamiento, se debe ejecutar inmediatamente después la emisión de certificados: `sudo /usr/local/bin/issue_ssl.sh <dominio>` para evitar la caída de los portales HTTPS.



