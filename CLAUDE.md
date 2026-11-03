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
- El script SEO requiere Node.js/npm; comprueba las versiones indicadas por los archivos del proyecto antes de ejecutarlo. El `Makefile` invoca Podman para `build-image` y `deploy-fenix`; en el entorno local verificado el 2026-11-03 no está instalado `podman`, mientras Docker Compose sí está disponible. No sustituyas el runtime remoto ni ejecutes el target de despliegue para resolver esa diferencia.
- Verificación local documentada: `make -C system check` y `make -C system test`. Revisa el `compose.yaml` antes de iniciar servicios; no se ha validado aquí contra el runtime vigente de producción.

## Reglas esenciales

1. **Yatra S60**: toda telemetría se procesa y almacena según el estándar sexagesimal (`s60`) de `system/s60`.
2. **Telemetría real**: nunca presentar ni enviar datos sintéticos como lecturas reales o a producción; sin datos reales, indicar **SIN DATOS**. La simulación de desarrollo solo puede ejecutarse con `firmware-sim`, contra loopback y claramente marcada como sintética.
3. **TruthSync**: pedidos y cambios de estado deben mantener la firma SHA256 encadenada del ledger. No omitir ni puentear el mecanismo.
4. **PyO3**: compilar con `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` cuando corresponda.
5. **Secretos y configuración**: no añadir credenciales, claves ni direcciones IP al código de aplicación. Usar variables de entorno para la configuración de host. `PIZARRA.md` conserva contexto histórico y no es fuente operativa vigente. No copiar secretos presentes en archivos de ejemplo.
6. **Despliegues**: no desplegar ni modificar hosts de producción sin petición/autorización explícita. Antes de actuar, confirmar el target y revisar el estado real del host.

## Rangos críticos IoT

| Variable | Rango óptimo | Notas |
|---|---|---|
| Humedad | 85%–95% | Crítica para inducción de primordios |
| CO₂ | < 900 ppm | Ayuda a prevenir deformaciones |
| Temperatura | 18°C–22°C | Crecimiento celular equilibrado |

## Infraestructura y despliegue

- La memoria vigente indica que el servicio Micelia aún no tiene definido un servicio activo, host virtual, contenido ni certificado para `micelia.pinguinoseguro.cl`; el dominio actual no prueba que haya un despliegue operativo.
- No se considera confirmado ningún destino de producción por la documentación local. Los nombres `fan` y `fenix`, las direcciones, puertos, DNS y comandos de despliegue deben contrastarse con el vault y con el estado real antes de cualquier acción.
- Los targets y scripts de despliegue del repositorio son código que puede afectar producción; no ejecutarlos sin autorización explícita para esa operación concreta.
- No usar la antigua guía `proyectos/sysdocs`: esa ruta no existe en el entorno actual. La topología compartida se consulta en las notas vigentes de `personalvault/Cloud`.
- No ejecutar `setup_multi_production.sh`: sus efectos sobre Nginx y TLS están documentados como destructivos para configuración compartida.

## Integraciones y experiencia de usuario

- **WhatsApp Business**: flujo conversacional de pedidos, incluyendo el Pack Adulto Mayor de 500 g.
- **Pasaporte de Cosecha**: QR de trazabilidad por lote, servido mediante `view_lote.html?lote=...`.
- Priorizar flujos accesibles y simples para personas mayores.

## Contexto de agentes y navegación

- Leer `../AGENTS.md`, `AGENTS.md`, `.agents/AGENTS.md` y `PIZARRA.md`. Aplicar el protocolo de memoria compartida y autorización descrito en las reglas de agentes.
- Las direcciones, hosts y pasos de `PIZARRA.md` pueden pertenecer a la infraestructura anterior: no ejecutarlos sin validarlos contra el vault vigente y el estado real.
- Usar MCP, CLI y habilidades solo si están disponibles en esta sesión. Graphify es opcional; no exigir `code-review-graph` ni declarar que se consultó una herramienta inaccesible.
- No sobrescribir cambios locales existentes que no formen parte de la tarea solicitada. No hacer commit, push o despliegue sin autorización explícita.
