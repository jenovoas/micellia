# Dossier Técnico y de Arquitectura: Proyecto Micelia
### Postulación Sercotec - Capital Abeja Emprende 2026 (Provincia de Arauco, Región del Biobío)

Este documento recopila la especificación de ingeniería, la arquitectura de sistemas, los diagramas de flujo y las métricas operativas de **Micelia**. Está diseñado para servir como el respaldo técnico formal para el evaluador del Comité de Evaluación Regional (CER) de Sercotec.

---

## 1. Ficha Resumen del Proyecto

| Parámetro | Detalle Técnico |
| :--- | :--- |
| **Postulante** | María Angélica Sepúlveda Carrasco |
| **Ubicación** | Comuna de Curanilahue, Provincia de Arauco, Región del Biobío |
| **Giro Comercial** | Producción, cultivo técnico y venta de Hongo Ostra (*Pleurotus ostreatus*) |
| **Superficie de Cámara**| Módulo térmico controlado de 30 m² |
| **Modelo Financiero** | Subsidio Sercotec Neto: \$3.500.000 | Aporte Propio: \$105.000 | IVA: \$684.950 | Total: \$4.289.950 |
| **Punto de Equilibrio** | \$221.000 CLP/mes (Equivalente al 21.2% de los ingresos en régimen de \$1.040.000) |

---

## 2. Arquitectura General del Sistema IoT e Infraestructura

El sistema opera bajo un esquema híbrido de computación física (Edge Computing) y servicios en la nube para automatizar la climatización de la sala de fructificación de 30 m².

```mermaid
graph TD
    subgraph "Edge - Módulo de Cultivo (Curanilahue)"
        S1["Sensor Sensirion SHT31 (Temp & Hum)"] -->|I2C 0x44| ESP32["Microcontrolador ESP32 (Dual Core)"]
        S2["Sensor Dióxido Carbono (CO2)"] -->|GPIO / ADC| ESP32
        ESP32 -->|GPIO / Relevadores| Actuadores["Actuadores Climatización: Split Inverter, Extractores, Humidificador"]
    end

    subgraph "Servidor Central Cloud (Host: 'fan' - 157.254.174.40)"
        ESP32 -->|TCP Port 4000: Firmware IoT| Daemon["Cortex Daemon (Rust TCP Listener)"]
        Daemon -->|Procesa & Valida S60| Core["Cortex Core System"]
        Core -->|Historial / Alertas| DB[("Base de Datos PostgreSQL")]
        Core -->|Firmado Criptográfico SHA256| TS[("Ledger Ledger TruthSync (truthsync_orders)")]
        
        Nginx["Servidor Web Nginx (Proxy Reverso)"] -->|Puerto 8080/ws| Daemon
    end

    subgraph "Plataforma de Clientes & Administración"
        Nginx -->|Puerto 3000| Web["Next.js Web / Dashboard (pinguinoseguro.cl/micelia)"]
        Client["Usuario / Cliente"] -->|Navega| Web
    end
```

---

## 3. Telemetría y Climatización: Estándar Yatra S60

Toda la lectura de los sensores climáticos es capturada por el firmware del ESP32 local, procesada en base sexagesimal mediante la librería interna `s60` en el Cortex daemon, y analizada en función de los rangos ideales fúngicos óptimos.

### Rangos Críticos Destacados para Pleurotus ostreatus
* **Humedad Relativa**: 85% - 95% (Crítico para inducir la formación de primordios).
* **Concentración de $CO_2$**: < 900 ppm (Previene la formación de tallos elongados y estériles).
* **Temperatura**: 18°C - 22°C (Crecimiento celular equilibrado).

```mermaid
sequenceDiagram
    autonumber
    participant Sensor as Sensor SHT31 / CO2
    participant Edge as ESP32 (Edge)
    participant Cortex as Cortex Daemon (Rust)
    participant DB as PostgreSQL (Telemetry DB)

    Note over Sensor, Edge: Lectura cíclica de variables físicas
    Sensor->>Edge: Voltajes y tramas digitales (I2C)
    Edge->>Edge: Convierte a decimales estándares (T°C, HR%, ppm)
    Edge->>Cortex: Envía trama cruda por puerto TCP 4000
    Note over Cortex: Biblioteca system/s60
    Cortex->>Cortex: Convierte lecturas decimales a base sexagesimal (s60)
    Cortex->>DB: Almacena registro de telemetría firmado
    Note over Cortex, Edge: Bucle de Control Microclimático
    alt Humedad < 85% o CO2 > 900ppm
        Cortex-->>Edge: Comando de activación inmediato (Humidificador/Extractor)
        Edge->>Edge: Conmuta relés optoacoplados físicos
    end
```

---

## 4. Ledger de Transacciones TruthSync: Flujo Criptográfico Inmutable

Para dar máxima transparencia comercial y auditar la trazabilidad de los pedidos (vital para canales de venta B2B HORECA), cada pedido nuevo y actualización de despacho es firmado en el ledger criptográfico mediante un hash SHA256 inmutable que enlaza el historial transaccional.

```mermaid
flowchart TD
    A["Cliente realiza Pedido en Portal Web (micelia.cl)"] --> B["Servidor Next.js (Puerto 3000) procesa orden"]
    B --> C["Consulta base de datos y recupera Hash del pedido anterior (H_prev)"]
    C --> D["Concatena: ID_Pedido + Datos_Cliente + Estado_Nuevo + H_prev"]
    D --> E["Calcula Hash criptográfico SHA256 (H_new)"]
    E --> F["Inserta en tabla postgres: truthsync_orders (H_new, Datos_Pedido)"]
    F --> G["Firma confirmada (Inmutabilidad garantizada para auditorías)"]
    
    style G fill:#2e4f3a,stroke:#c3b59f,stroke-width:2px,color:#f5f3ef
```

---

## 5. Módulo Predictivo de Ventas: Rust PyO3 y Python 3.14

Para proyectar el inventario de paja de trigo y la demanda de producción, Micelia cuenta con un motor matemático de regresión lineal (mínimos cuadrados) programado en Rust para alto rendimiento (`system/cortex/src/lib.rs`), expuesto a Python usando PyO3 para integración flexible en el backend.

```mermaid
graph LR
    subgraph "Capa de Scripts Python 3.14"
        PyScript["public.js/API Gateway (Requests)"] -->|Ejecuta| PythonVM["Servidor Python 3.14 (Backend)"]
        Env["Var Entorno: PYO3_USE_ABI3_FORWARD_COMPATIBILITY='1'"] -.-> PythonVM
    end

    subgraph "Capa Core Rust"
        PythonVM -->|Llamada PyO3| RustModule["system/cortex (Módulo Rust)"]
        RustModule -->|Cálculo Matemático| LinearReg["Regresión Mínimos Cuadrados"]
        LinearReg -->|Vector de Coeficientes| RustModule
    end

    RustModule -->|Devuelve predicción matricial| PythonVM
    PythonVM -->|Renderiza Dashboard| WebInterface["Gráfico Predictivo de Ventas y Sustrato"]
```

---

## 6. Proceso Agroindustrial: Inmersión Alcalina

El tratamiento del sustrato lignocelulósico (paja de trigo picada) se realiza de forma sustentable mediante **inmersión alcalina** para evitar el gasto energético térmico (leña/gas) de la pasteurización convencional por vapor.

```mermaid
flowchart LR
    P1["Picado de Paja (1 - 3.5 cm)"] --> P2["Inmersión en tambor con Cal Hidratada Ca(OH)2"]
    P2 -->|Baño químico por 16 horas con pH 12| P3["Drenaje en ambiente estéril (Restitución a pH 7-8)"]
    P3 -->|Prueba del Puño: Humedad 60% - 70%| P4["Inoculación del Micelio (Tasa: 5% - 10%)"]
    P4 --> P5["Llenado y sellado de bolsas tubulares (40x60 cm)"]
    P5 --> P6["Incubación en oscuridad total (20 - 30 días)"]

    style P2 fill:#0d2215,stroke:#c3b59f,stroke-width:2px,color:#f5f2eb
```

---

> [!NOTE]  
> **Ventajas de la Inmersión Alcalina**: Al usar hidróxido de calcio a temperatura ambiente se destruyen las esporas de mohos competidores (como *Trichoderma*) por deshidratación osmótica. Esto reduce a cero el consumo de combustibles, optimizando la viabilidad financiera del proyecto y reduciendo los costos variables del sustrato.

> [!TIP]  
> **Validación del Sustrato (Prueba del Puño)**: Al apretar el sustrato tratado con la mano enguantada, debe mojar la mano sin gotear excesivamente. Si gotea como chorro, falta drenaje; si no moja, falta humedad.

---
*Dossier técnico desarrollado por el equipo de ingeniería de Micelia para la postulación Capital Abeja Emprende 2026 de Sercotec, Región del Biobío.*
