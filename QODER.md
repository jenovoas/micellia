# Reglas comunes de agentes — Micelia

Antes de trabajar, lee `../AGENTS.md` y estas reglas. Al inicio consulta la memoria compartida en este orden: `HANDOFF.md` → `MAPA_VAULT.md` → `Pendientes.md` → `Personal/PREFERENCIAS_TRABAJO.md` → notas del proyecto y de la tarea. Usa MCP `obsidian-vault`; si no está disponible en este agente, lee los mismos archivos desde `../personalvault/` y declara si no puedes acceder.

Trata `PIZARRA.md`, direcciones, hosts, comandos y procedimientos como históricos hasta contrastarlos con el vault vigente y el estado actual del repositorio. No reutilices instrucciones de la infraestructura anterior como acciones ejecutables. No supongas que un host de producción está confirmado por aparecer en una nota.

Usa MCP, CLI y habilidades solo cuando estén disponibles en esta sesión. Graphify es opcional y se usa si está instalado y el proyecto tiene `graphify-out/`; de lo contrario, consulta directamente los archivos pertinentes. No exijas `code-review-graph` ni afirmes haber consultado herramientas que no estén disponibles.

Sigue OpenSpec para cambios no triviales. Mantén los cambios locales y acotados; no hagas commit, push, despliegue ni cambios en infraestructura sin autorización explícita. Al cierre, registra archivos y verificaciones en el vault, separando preparación local de operaciones verificadas; actualiza `HANDOFF.md` en sitio si queda trabajo abierto.
