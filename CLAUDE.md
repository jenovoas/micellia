# CLAUDE.md — Micelia

## ¿Qué es Micelia?

Plataforma de fungicultura y monitoreo IoT de precisión para soberanía alimentaria y economía circular, enfocada en el cultivo de hongo ostra (*Pleurotus ostreatus*) en la Provincia de Arauco, Región del Biobío.

## Stack y arquitectura

- **Backend IoT**: Cortex Daemon en Rust; API HTTP/WebSocket y listener TCP para telemetría.
- **ML**: funciones de regresión implementadas en Rust/PyO3.
- **Persistencia**: PostgreSQL para datos y ledger TruthSync; Redis también está definido en el despliegue de contenedores.
- **Firmware**: ESP32 con sensores de temperatura, humedad y CO₂.
- **Dashboard**: frontend estático en `system/dashboard`, servido por Cortex o por la infraestructura de proxy según el despliegue.
- **Contenedores**: `Dockerfile` multi-stage y `compose.yaml`; el compose define PostgreSQL, Redis y Cortex. Nginx sirve el dashboard y enruta HTTP/WebSocket a Cortex.
- **Estética**: verde bosque profundo y acentos oro crema/champán (`#c3b59f`); tipografías Outfit/Inter.

## Estación de desarrollo

- El entorno de trabajo actual es una laptop con **Debian 13**; distinguir siempre las herramientas locales de los hosts remotos de producción.
- La compilación Rust/PyO3 requiere Rust/Cargo, `build-essential`, `pkg-config`, `libssl-dev` y `python3-dev`; el proyecto fija `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` en `.cargo/config.toml`.
- El script SEO requiere Node.js/npm. Para el flujo de contenedores del `Makefile` se usa Podman con el proveedor `podman-compose` (`podman compose`); Docker puede estar instalado también, pero no reemplaza el comando del target `deploy-fenix`.
- Verificación local: `make -C system check` y `make -C system test`. El compose es de despliegue; publica solo Cortex HTTP en `127.0.0.1:8080` para el proxy Nginx. El listener TCP de telemetría `4000` no se publica todavía.

## Reglas esenciales

1. **Yatra S60**: toda telemetría se procesa y almacena según el estándar sexagesimal (`s60`) de `system/s60`.
2. **Telemetría real**: nunca presentar ni enviar datos sintéticos como lecturas reales o a producción; sin datos reales, indicar **SIN DATOS**. La simulación de desarrollo solo puede ejecutarse con `firmware-sim`, contra loopback y claramente marcada como sintética.
3. **TruthSync**: pedidos y cambios de estado deben mantener la firma SHA256 encadenada del ledger. No omitir ni puentear el mecanismo.
4. **PyO3**: compilar con `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` cuando corresponda.
5. **Secretos y configuración**: no añadir credenciales, claves ni direcciones IP al código de aplicación. Usar variables de entorno para la configuración de host; los datos operativos de referencia se mantienen en `PIZARRA.md` y deben verificarse antes de usarlos. No copiar secretos presentes en archivos de ejemplo.
6. **Despliegues**: no desplegar ni modificar hosts de producción sin petición/autorización explícita. Antes de actuar, confirmar el target y revisar el estado real del host.

## Rangos críticos IoT

| Variable | Rango óptimo | Notas |
|---|---|---|
| Humedad | 85%–95% | Crítica para inducción de primordios |
| CO₂ | < 900 ppm | Ayuda a prevenir deformaciones |
| Temperatura | 18°C–22°C | Crecimiento celular equilibrado |

## Infraestructura y despliegue

- El dominio vigente del portal es `micelia.pinguinoseguro.cl`; `micelia.cl` en scripts o documentación puede ser una referencia histórica y debe verificarse antes de usarla.
- El host remoto operativo documentado para el proyecto es `fenix`; no usar referencias a otros hosts sin confirmación explícita y verificación de que existen.
- El despliegue de contenedores del repositorio se dirige a `fenix` mediante `make -C system deploy-fenix`, que ejecuta `podman compose up -d --build`. Revisar el target/comandos antes de ejecutarlos; su ejecución afecta producción.
- PostgreSQL y Redis se mantienen en la red interna del compose. Cortex publica HTTP solo en `127.0.0.1:8080` para Nginx; el listener TCP `4000` permanece interno y no está publicado.
- La guía común de transición referenciada por `.agents/AGENTS.md` es `/home/jnovoas/proyectos/sysdocs/02-topologia-y-metodologia-transicion-2026-08-26.md`. Si no está disponible, solicitar o localizar una copia vigente; no inferir los pasos operativos.
- `fan` y su configuración antigua de Nginx/BIND9/Certbot aparecen en notas históricas del proyecto. No tratarlo como destino de despliegue vigente ni ejecutar `setup_multi_production.sh` sin verificar el plan actual: el script puede sobrescribir la configuración de Nginx y afectar TLS.

## Integraciones y experiencia de usuario

- **WhatsApp Business**: flujo conversacional de pedidos, incluyendo el Pack Adulto Mayor de 500 g.
- **Pasaporte de Cosecha**: QR de trazabilidad por lote, servido mediante `view_lote.html?lote=...`.
- Priorizar flujos accesibles y simples para personas mayores.

## Contexto de agentes y navegación

- Leer `AGENTS.md`, `.agents/AGENTS.md` y `PIZARRA.md` para las reglas y notas de sesión. Contrastar las notas históricas con el código/configuración actuales antes de usarlas como instrucciones operativas.
- El proyecto configura el MCP `code-review-graph`; usar sus herramientas antes de explorar código cuando estén disponibles. Si no conecta, indicar la falla y recurrir a búsqueda/lectura directa, sin afirmar que se consultó el grafo.
- No sobrescribir cambios locales existentes que no formen parte de la tarea solicitada.
