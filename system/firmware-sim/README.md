# Simulador de firmware Micelia

Herramienta local de desarrollo para ejercitar el listener TCP de Cortex sin hardware. **Todos los valores emitidos son sintéticos**; no usarlos como telemetría de cultivo ni conectarlos a producción.

## Uso

Desde la raíz del repositorio, con Cortex local escuchando en `127.0.0.1:4000`:

```bash
cargo run --manifest-path system/Cargo.toml -p firmware-sim
```

Enviar una sola muestra para una comprobación rápida:

```bash
cargo run --manifest-path system/Cargo.toml -p firmware-sim -- --once
```

Escenario reproducible de caída de presión:

```bash
cargo run --manifest-path system/Cargo.toml -p firmware-sim -- --scenario pressure-drop
```

Parámetros disponibles: `--host`, `--port`, `--cell-id`, `--interval-ms`, `--scenario stable|pressure-drop` y `--once`. El simulador acepta únicamente destinos loopback, incluso si se cambia `--host`; para probar un Cortex remoto, usa un túnel SSH que termine en loopback. Así no se pueden enviar lecturas sintéticas directamente a una instancia remota o de producción.

Cada muestra se transmite como una línea JSON UTF-8 terminada en `\n`. El modelo es determinista para que escenarios y pruebas sean repetibles. `firmware-sim` es independiente del crate `firmware`, que queda reservado para la implementación del hardware.

## Verificación

```bash
cargo test --manifest-path system/Cargo.toml -p firmware-sim
```
