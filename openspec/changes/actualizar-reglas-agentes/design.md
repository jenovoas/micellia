# Diseño

## Contexto

Micelia mantiene reglas de producto válidas, pero sus agentes reciben información contradictoria: herramientas MCP no verificadas, una ruta local a `sysdocs` que no existe y procedimientos de producción con el host `fan`, DNS, Nginx y certificados de una infraestructura anterior. El vault vigente indica que el servicio de Micelia aún requiere definición; por ello, ni `fan` ni `fenix` deben tratarse como destino confirmado a partir de documentación local antigua.

## Decisiones

1. Incluir el protocolo común en cada archivo de instrucciones consumido por los agentes y exigir la lectura del `../AGENTS.md` del espacio de trabajo.
2. Consultar primero el vault; si el agente no dispone de su MCP, leer las mismas notas desde `../personalvault/` y declarar cualquier inaccesibilidad.
3. Tratar `PIZARRA.md` y los datos operativos heredados como históricos. Retirar de ellos mandatos ejecutables y reemplazarlos por una advertencia que exija verificar la fuente actual y autorización explícita.
4. Permitir Graphify cuando esté disponible; no exigir `code-review-graph` ni cambiar su configuración MCP o hooks en este cambio.
5. Preservar reglas de dominio, producto, seguridad y arquitectura.
6. Usar `skip_specs: true`: cambio exclusivamente documental, sin cambios de comportamiento del sistema.

## Validación

Validar OpenSpec en modo estricto, `git diff --check`, búsqueda de herramientas/rutas/mandatos heredados, y estado Git. Registrar evidencia local en el vault; no afirmar despliegue ni carga efectiva por runtime.
