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
