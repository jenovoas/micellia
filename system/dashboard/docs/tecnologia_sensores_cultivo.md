# Los Sensores de la Cámara: Cómo Micelia Cuida Cada Cosecha

*Categoría: Tecnología de Cultivo · Tiempo de lectura: 5 min*

---

![Sensores de temperatura, humedad y CO2 en una cámara de cultivo Micelia](sensor_humedad_cultivo.png)

Una cámara de cultivo no se controla por intuición. En Micelia, los sensores registran las condiciones del ambiente para que cada lote de hongo ostra crezca en el rango que necesita: **humedad de 85% a 95%**, **CO2 bajo 900 ppm** y **temperatura entre 18 C y 22 C** durante la fructificación.

## Dos sensores, tres datos esenciales

El sistema reúne dos fuentes de información dentro de la cámara:

- **Sensirion SHT31**: mide la temperatura y la humedad relativa del aire.
- **Sensor de CO2**: registra la concentración de dióxido de carbono que se acumula por la respiración natural del cultivo.

Estas variables permiten detectar a tiempo un ambiente demasiado seco, caluroso o con poca renovación de aire. No se trata solo de comodidad: una desviación sostenida puede afectar el tamaño, la textura y la apariencia comercial de las setas.

## Del sensor a una decisión de cultivo

Cada lectura llega primero al **ESP32**, el equipo electrónico instalado en la cámara. Desde allí, se envía por la red local al Cortex Daemon de Micelia, que procesa la información y la presenta en el panel del productor.

```
Sensores de temperatura, humedad y CO2
                ↓
             ESP32
                ↓
       Cortex Daemon de Micelia
                ↓
  Alertas y panel de control del productor
```

Cuando un valor se sale del rango saludable, el equipo puede revisar la situación y actuar sobre la ventilación, humidificación o climatización de la sala. El objetivo es reaccionar antes de que el cultivo pierda calidad.

## Por qué el CO2 importa tanto

El micelio libera CO2 mientras crece. En la etapa de fructificación, una concentración elevada puede producir setas con pie largo, fibroso y sombrero pequeño. Por eso el sistema destaca las lecturas bajo **900 ppm**: es una señal práctica para mantener una buena renovación de aire y proteger la forma característica del hongo ostra.

## Datos para aprender y mejorar

Las lecturas no se descartan después de activar una alerta. Micelia las procesa con el estándar interno **Yatra S60**, que organiza el historial de telemetría para revisar ciclos de cultivo y tomar decisiones con evidencia. Así, cada cosecha ayuda a mejorar la siguiente.

---

*Este monitoreo forma parte de la arquitectura de cultivo técnico de Micelia en Curanilahue, Región del Biobío.*
