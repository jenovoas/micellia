# Reglas del Proyecto Micelia (.agents/AGENTS.md)

Este archivo define las reglas arquitectónicas, restricciones de diseño y especificaciones técnicas de Micelia. Los agentes de IA deben respetar y adherirse estrictamente a estas directrices en cada interacción y edición de código.

## Protocolo común de entorno y memoria

- Lee `../AGENTS.md` antes de trabajar y aplica sus reglas junto con estas.
- Consulta al inicio el vault en este orden: `HANDOFF.md` → `MAPA_VAULT.md` → `Pendientes.md` → `Personal/PREFERENCIAS_TRABAJO.md` → notas pertinentes. Usa MCP `obsidian-vault`; si no está disponible, lee los mismos archivos desde `../personalvault/` y declara cualquier falta de acceso.
- Considera `PIZARRA.md`, hosts, direcciones, herramientas y procedimientos locales como históricos hasta validarlos contra el vault vigente y el estado actual. No ejecutes instrucciones de la infraestructura anterior.
- Usa solo herramientas disponibles en esta sesión. Graphify es opcional si está instalado y existe `graphify-out/`; no exijas `code-review-graph`.
- Sigue OpenSpec para cambios no triviales. No hagas commit, push, despliegue ni cambios en infraestructura sin autorización explícita.
- Registra al cierre en el vault los archivos y comprobaciones; separa cambios locales de operaciones verificadas y actualiza `HANDOFF.md` en sitio si queda trabajo abierto.

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

## 7. Estado de infraestructura y despliegue

Las direcciones, hosts, puertos, DNS, rutas Nginx, políticas SELinux y comandos que aparecían en esta sección describen un entorno anterior y no son instrucciones operativas. La memoria vigente indica que el servicio Micelia aún no tiene definido un servicio activo, host virtual, contenido ni certificado; no asumir `fan`, `fenix` ni otro destino por referencias históricas.

Antes de cualquier operación futura, consulta el HANDOFF y las notas operativas vigentes del vault, comprueba el estado real del repositorio y del host autorizado, y solicita autorización explícita para el despliegue concreto. La ausencia de infraestructura actual no autoriza a provisionarla ni a cambiar DNS, TLS, proxy o firewall.

## 8. Desarrollo y verificación

Las tareas locales pueden verificarse con las herramientas instaladas y los comandos documentados por el repositorio. No se exige ejecutar cambios en producción para validar código o documentación. No ejecutar scripts de aprovisionamiento heredados ni comandos que sobrescriban Nginx, certificados, DNS o servicios compartidos sin una solicitud explícita y un plan de reversión verificado.

## Directiva operativa de rigor y evidencia

- No especules ni afirmes datos sin contrastarlos con código fuente, documentación oficial o pruebas técnicas reales. Si no puedes verificarlos, dilo claramente.
- No asientas por complacer ni cambies de postura sin evidencia. Si un comando, parámetro o diseño es incorrecto, indícalo y respáldalo; si faltan datos, pide la especificación exacta.
- Contrasta referencias al kernel, llamadas al sistema y macros con `include/linux/`, `kernel/` o `man 2`/`man 7`. Basa parámetros y tipos de Rust en `rustc`, Rust Reference o Nomicon, especialmente para layouts.
- Sustenta pruebas y mediciones exclusivamente con herramientas deterministas del sistema operativo, como `perf`, `bpftool`, `sysctl`, `ip` y `wg`.
- Prioriza comandos exactos, opciones, rutas de código y salidas esperadas. Evita explicaciones genéricas que no ayuden a ejecutar o verificar.
