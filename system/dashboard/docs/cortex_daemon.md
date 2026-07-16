# Cortex Daemon: El Backend de Telemetría Multihilo en Rust

*Categoría: Tecnología de Cultivo · Tiempo de lectura: 6 min*

---

![Cortex Daemon Telemetry Backend](raw_mushrooms.png)

La arquitectura de telemetría y procesamiento de datos en Micelia está controlada por el **daemon Cortex**, un núcleo robusto programado en **Rust** que gestiona la alta concurrencia de sensores y clientes en tiempo real.

## Concurrencia y Sockets TCP en el Puerto 4000
El daemon levanta un listener TCP asíncrono en el puerto `4000` optimizado con la librería `tokio` de Rust. Cada nodo de cultivo IoT (equipado con chips ESP32) se conecta directamente mediante socket TCP persistente para reportar de forma periódica sus lecturas ambientales en formato **Yatra S60**.
- **Concurrencia sin bloqueos**: Rust permite gestionar miles de lecturas concurrentes con un impacto mínimo en el uso de memoria (menos de 15MB de RAM en reposo).
- **Procesamiento sexagesimal nativo**: La decodificación de las métricas IoT a base `s60` se realiza en hilos dedicados mediante un pool de ejecución gestionado.

## API Gateway & WebSockets en el Puerto 8080
El mismo daemon expone una API REST y un canal WebSockets bidireccional en el puerto `8080` (ruteado a través de Nginx bajo la ruta `/ws`):
- **Websockets en Tiempo Real**: Envía las lecturas ambientales a los dashboards de administración abiertos sin necesidad de recarga.
- **Seguridad y Control de Hilos**: Utiliza semáforos asíncronos y mutexes de lectura-escritura (`RwLock`) para garantizar que múltiples analistas de datos lean de forma consistente el estado del cultivo sin corrupción.

## Extensión Machine Learning con PyO3
Cortex expone sus algoritmos matemáticos más pesados (regresión de mínimos cuadrados) a Python mediante la biblioteca de enlace de Rust **PyO3**, lo que acelera en un 400% el cómputo de predicciones de demanda del negocio B2B.
