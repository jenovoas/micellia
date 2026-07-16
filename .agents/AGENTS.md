# Reglas del Proyecto Micelia (.agents/AGENTS.md)

Este archivo define las reglas arquitectónicas, restricciones de diseño y especificaciones técnicas de Micelia. Los agentes de IA deben respetar y adherirse estrictamente a estas directrices en cada interacción y edición de código.

---

## 1. Identidad de Marca y Estética
* **Colores Principales**: Verde bosque profundo (fondo oscuro, botones secundarios) y acentos en **oro crema / champán (`#c3b59f`)** para botones principales, enlaces y resaltados premium.
* **Tipografía**: Fuentes modernas sin serifas (por ejemplo, Outfit o Inter desde Google Fonts) para dar una sensación limpia y tecnológica.

---

## 2. Reglas del Catálogo y Precios
Los precios y productos en la landing page y el carrito deben coincidir exactamente con los siguientes valores comerciales:
* **Hongo Ostra Fresco 500g**: $4.500 CLP
* **Hongo Ostra Fresco 1kg**: $8.000 CLP
* **Suscripción HORECA B2B**: $25.000 CLP / mes
* **Kit de Autocultivo Educativo**: $12.000 CLP

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

## 7. Entorno de Producción
* **Servidor Destino**: `157.254.174.40` (Hostname: `fan`).
* **Dominios**: Gestión autoritativa de `micelia.cl` y subdominios mediante BIND9 y Nginx.
