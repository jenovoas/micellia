# Telemetría IoT en Cultivo: El Sistema Yatra S60 de Micelia

*Categoría: Tecnología de Cultivo · Tiempo de lectura: 10 min*

---

El cultivo técnico de hongos ostra requiere un control ambiental de precisión quirúrgica. Micelia desarrolló el **sistema de telemetría Yatra S60**: una arquitectura IoT de bajo costo que monitorea en tiempo real las variables críticas de cada cámara de producción.

## Variables críticas y rangos óptimos

Los hongos son organismos extremadamente sensibles al microambiente. Las tres variables fundamentales son:

### 🌡️ Temperatura

| Fase | Rango Óptimo | Crítico |
|------|-------------|---------|
| Colonización | 24–28°C | <18°C o >32°C → detención |
| Inducción | 14–18°C (choque) | Sin delta-T → falla de primordización |
| Fructificación | 18–22°C | >25°C → setas aguadas, sin textura |
| Cosecha | 15–20°C | >25°C → apertura prematura |

### 💧 Humedad Relativa

$$HR_{óptima} = 85\% - 95\%$$

La humedad es **la variable más crítica** para la inducción de primordios. Una caída por debajo del 80% detiene el crecimiento y provoca que las setas se sequen y abran prematuramente.

**Efectos de la HR sobre morfología:**
- **HR > 95%**: Setas grandes pero de textura blanda, susceptibles a bacteriosis
- **HR 85–92%**: Setas de calibre óptimo, textura firme, láminas bien definidas
- **HR < 80%**: Pileus (sombrero) se agrieta, esporulación prematura, rendimiento -40%

### 🫧 CO₂ (Dióxido de Carbono)

$$[CO_2]_{ambiente} < 900\text{ ppm}$$

El CO₂ es el metabolito respiratorio del micelio. Su acumulación en cámaras sin ventilación produce un fenómeno llamado **etiloamento**:

```
CO₂ elevado → Respuesta hormonal del hongo
  → Elongación del pie (tallo)
  → Reducción del sombrero
  → Pérdida de 30-50% del valor comercial
  → Textura fibrosa y amarga
```

**Referencia:** CO₂ ambiente = 400 ppm. En una cámara sellada con 10 bloques activos, el CO₂ puede alcanzar 3000–5000 ppm en 6 horas sin renovación de aire.

## Arquitectura del Sistema Yatra S60

```
┌─────────────────────────────────────────────────────────┐
│                  CÁMARA DE CULTIVO                       │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Sensor      │    │  Sensor      │                  │
│  │  SHT31       │    │  MH-Z19B     │                  │
│  │  (Temp+HR)   │    │  (CO₂ NDIR)  │                  │
│  └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                           │
│         └─────────┬─────────┘                          │
│                   │                                     │
│           ┌───────┴───────┐                            │
│           │  ESP32-S3     │  ← Microcontrolador        │
│           │  WiFi + BLE   │     principal               │
│           └───────┬───────┘                            │
└───────────────────│─────────────────────────────────────┘
                    │ MQTT / TCP
                    ▼
         ┌──────────────────┐
         │  Cortex Daemon   │  ← Servidor fan             
         │  (Rust/Axum)     │     puerto 4000 (IoT)        
         │  Puerto 8080 API │     puerto 8080 (WS)         
         └──────────┬───────┘
                    │
                    ▼
         ┌──────────────────┐
         │  PostgreSQL      │
         │  Base S60        │
         │  TruthSync Logs  │
         └──────────┬───────┘
                    │
                    ▼
         ┌──────────────────┐
         │  Dashboard Web   │  ← WebSocket en tiempo real
         │  (Micelia Admin) │
         └──────────────────┘
```

## El estándar S60: Telemetría en Base Sexagesimal

El nombre "S60" proviene del sistema de numeración **base 60** (sexagesimal) utilizado en la matemática babilónica. Micelia lo utiliza para una razón práctica concreta:

Las **lecturas de sensores ambientales** tienen una naturaleza **cíclica** que se mapea naturalmente en base 60:
- Ciclos de 60 minutos en el día
- Ciclos de 60 segundos en el minuto
- Franjas de cultivo de múltiplos de 6 (6, 12, 18, 24 días)

```rust
// Sistema S60 en Rust (sistema/s60/src/lib.rs)
pub struct S60Reading {
    pub value: f64,
    pub s60_timestamp: u64,  // Timestamp en base 60 comprimida
    pub cycle: u8,            // Ciclo del cultivo (0-59)
    pub frame: u8,            // Frame dentro del ciclo
}

impl S60Reading {
    pub fn encode(unix_ts: u64, val: f64) -> Self {
        let cycle = ((unix_ts / 3600) % 60) as u8;
        let frame = ((unix_ts / 60) % 60) as u8;
        Self {
            value: val,
            s60_timestamp: unix_ts,
            cycle,
            frame,
        }
    }
}
```

## TruthSync: Ledger Criptográfico de Lecturas

Cada lectura de sensor es **firmada criptográficamente** en el ledger inmutable TruthSync antes de persistirse:

$$H_n = \text{SHA256}(H_{n-1} \| id \| ts \| T \| HR \| CO_2 \| \Delta)$$

Esta cadena de hashes garantiza que ninguna lectura puede ser modificada retroactivamente sin invalidar toda la cadena posterior — un principio de **blockchain simplificado** aplicado a la trazabilidad de cultivo.

**¿Para qué sirve esto en la práctica?**
1. **Certificación de calidad**: Se puede demostrar criptográficamente que las condiciones de cultivo respetaron los estándares durante toda la producción
2. **Trazabilidad HACCP**: Evidencia tamper-proof para auditorías sanitarias
3. **Investigación**: Datos de largo plazo con integridad garantizada para estudios de optimización

## Alertas automáticas

El sistema genera alertas en tiempo real cuando cualquier parámetro sale del rango saludable:

```json
{
  "alert_type": "humidity_critical",
  "value": 78.2,
  "threshold": 85.0,
  "chamber": "camara_01",
  "timestamp": "2026-07-16T14:30:00Z",
  "hash": "sha256:a3f9c2...",
  "action_required": "Activar nebulizador zona norte"
}
```

---

*¿Interesado en la arquitectura técnica completa? → Ver el **Dossier Técnico Sercotec***
