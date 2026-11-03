# Propuesta

## Why

Las instrucciones de Micelia mezclan herramientas no verificadas y procedimientos de una infraestructura anterior con mandatos que obligan a desplegar cambios en producción. Los agentes necesitan cargar las reglas comunes del entorno y una fuente vigente antes de actuar, para no convertir notas históricas en operaciones reales.

## What Changes

- Añadir el protocolo común de idioma, memoria compartida, herramientas disponibles, OpenSpec y registro auditable a todas las instrucciones de agentes del proyecto.
- Sustituir el uso obligatorio de `code-review-graph` por navegación condicional con Graphify, sin cambiar servidores MCP ni hooks.
- Marcar como históricas y no ejecutables las instrucciones de despliegue heredadas en `.agents/AGENTS.md`, `PIZARRA.md` y `README.md`; requerir confirmación del destino vigente y autorización explícita.
- Preservar las reglas de telemetría, TruthSync, PyO3, producto y seguridad.

## Capabilities

No cambia el comportamiento del sistema; `skip_specs: true`.

## Impact

Solo documentación e instrucciones de agentes. Sin cambios de código, MCP, hooks, hosts ni despliegues, y sin afirmar que los runtimes cargan efectivamente estos archivos.
