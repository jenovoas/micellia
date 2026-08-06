# CLAUDE.md — Micelia

## ¿Qué es Micelia?

Plataforma integral de fungicultura y monitoreo IoT de precisión para soberanía alimentaria y economía circular. Cultivo de hongo ostra (*Pleurotus ostreatus*) en la Provincia de Arauco, Región del Biobío, Chile.

## Stack Tecnológico

- **Backend IoT**: Rust (Cortex Daemon) — TCP Listener + API Gateway + WebSockets
- **ML**: Rust/PyO3 para regresión (mínimos cuadrados, predicción de ventas), expuesto a Python 3.14
- **Base de datos**: PostgreSQL con Ledger TruthSync (SHA256 inmutable)
- **Firmware**: ESP32 (sensores: temperatura, humedad, CO₂)
- **Dashboard**: Frontend estático servido por Nginx
- **Estética**: Verde bosque profundo + oro crema/champán (#c3b59f); fuentes Outfit/Inter

## Reglas Esenciales

1. **Yatra S60**: Toda telemetría de sensores se procesa en base sexagesimal (`s60`). Sin excepciones.
2. **Ledger TruthSync**: Todo pedido se firma con SHA256 encadenado. No bypass.
3. **PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1**: Requerido para compilar bindings PyO3.
4. **No mock en telemetría**: Nunca simular datos de sensores. Si no hay datos reales, reportar "SIN DATOS".
5. **setup_multi_production.sh WARNING**: Sobrescribe configs de Nginx y desactiva SSL. Si se ejecuta, re-emitir certificados Certbot inmediatamente.

## Rangos Críticos IoT

| Variable | Rango óptimo | Notas |
|---|---|---|
| Humedad | 85% - 95% | Crítico para inducción de primordios |
| CO₂ | < 900 ppm | Previene deformaciones |
| Temperatura | 18°C - 22°C | Crecimiento celular equilibrado |

## Despliegue

- **Server**: `fan` (configurado en `~/.ssh/config`, puerto 4222)
- **Comando**: `make -C system deploy` — sincroniza estáticos y recompila Cortex Daemon
- **DNS**: BIND9 en `fan` con zonas para `micelia.cl`, `pinguinoseguro.cl`, `laespiguita.cl`
- **SSL**: Certbot vía `issue_ssl.sh` para cada dominio

## Dominios Asociados

- `micelia.cl` — Dashboard + proxy a Cortex Daemon (puerto 8080)
- Los servicios comparten servidor con SecurePenguin y LaEspiguita en `fan`

## Integraciones

- **WhatsApp Business**: Bot conversacional para pedidos (Pack Adulto Mayor 500g)
- **Pasaporte de Cosecha**: QR por lote con trazabilidad (`view_lote.html?lote=...`)

## Recordatorios

- Leer PIZARRA.md y AGENTS.md si existen para contexto de sesión actual
- No hardcodear configuraciones del servidor — usar `fan` como target único

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes_tool` or `query_graph_tool` instead of Grep
- **Understanding impact**: `get_impact_radius_tool` instead of manually tracing imports
- **Code review**: `detect_changes_tool` + `get_review_context_tool` instead of reading entire files
- **Finding relationships**: `query_graph_tool` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview_tool` + `list_communities_tool`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes_tool` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context_tool` | Need source snippets for review — token-efficient |
| `get_impact_radius_tool` | Understanding blast radius of a change |
| `get_affected_flows_tool` | Finding which execution paths are impacted |
| `query_graph_tool` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes_tool` | Finding functions/classes by name or keyword |
| `get_architecture_overview_tool` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes_tool` for code review.
3. Use `get_affected_flows_tool` to understand impact.
4. Use `query_graph_tool` pattern="tests_for" to check coverage.
