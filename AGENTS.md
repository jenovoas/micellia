# Reglas comunes de agentes — Micelia

## Carga obligatoria del entorno

- Antes de trabajar, lee `../AGENTS.md` y aplica sus reglas de entorno junto con estas reglas del proyecto.
- Al inicio consulta la memoria compartida en este orden: `HANDOFF.md` → `MAPA_VAULT.md` → `Pendientes.md` → `Personal/PREFERENCIAS_TRABAJO.md` → notas del proyecto y de la tarea. Usa primero el MCP `obsidian-vault`; si este agente no lo ofrece, lee los mismos archivos desde `../personalvault/` y no afirmes haberlos consultado si no pudiste acceder.
- Trata las notas del proyecto, `PIZARRA.md`, direcciones, hosts, comandos y procedimientos como información histórica hasta contrastarlos con la fuente vigente del vault y el estado actual del repositorio. No reutilices instrucciones del entorno anterior como acciones ejecutables.

## Herramientas y flujo

- Usa MCP, CLI y habilidades solo si están disponibles en esta sesión; no bloquees el trabajo por herramientas ausentes. Para navegación estructural, usa Graphify cuando esté disponible y el proyecto tenga `graphify-out/`; en caso contrario, consulta directamente los archivos pertinentes.
- Sigue el flujo OpenSpec configurado para cambios no triviales y valida los artefactos antes de cerrar.
- Mantén los cambios locales y acotados. No hagas commit, push, despliegue ni cambios en infraestructura sin autorización explícita.
- Al cerrar, registra en el vault los archivos y comprobaciones realizadas, distinguiendo preparación local de acciones verificadas en producción; actualiza `HANDOFF.md` en sitio si queda trabajo abierto.

## Restricciones del proyecto

- No presentes datos sintéticos como telemetría real ni los envíes a producción.
- Conserva la integridad del ledger TruthSync y el contrato Yatra S60.
- No alteres secretos, datos de clientes ni infraestructura remota durante tareas documentales.
