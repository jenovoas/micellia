# Protocolo de Calidad Fungícola y Control de Bioseguridad (MIP)

Este documento establece los criterios normativos y de calidad para la operación de las Células de Cultivo Autónomas del Proyecto **Micelia**, alineado con las regulaciones de inocuidad alimentaria del **SAG (Servicio Agrícola y Ganadero)** y estándares de bioseguridad industrial.

---

## 1. Control Aritmético de Parámetros Críticos (Protocolo Yatra)

Para cumplir con las auditorías de calidad técnica, el software de control no debe presentar deriva en sus mediciones. Todo reporte y cálculo de promedio acumulativo de CO2, humedad y temperatura debe realizarse utilizando el motor sexagesimal `s60` implementado en el Core del sistema.

### Tolerancias Máximas Permitidas

| Variable | Rango Óptimo (Incubación) | Rango Óptimo (Fructificación) | Precisión del Sistema (S60) |
| :--- | :--- | :--- | :--- |
| **Temperatura** | 20°C - 25°C | 18°C - 22°C | 0.001°C (0° 0' 0" 216''') |
| **Humedad Relativa**| 60% - 70% | 85% - 95% | 0.001% (0° 0' 0" 216''') |
| **Dióxido de Carbono**| > 2000 ppm (alto) | < 800 - 1000 ppm (bajo) | 1 ppm |

---

## 2. Manejo Integral de Plagas (MIP): Prevención de Trichoderma

La plaga más devastadora en la producción de *Pleurotus ostreatus* y *Hericium erinaceus* es el moho verde (*Trichoderma harzianum*). El sistema de control lógico actúa de la siguiente manera:

1. **Monitoreo de Pérdida de Flujo**: Si la presión diferencial del aire desciende por debajo del límite crítico (indicando obstrucción de filtros HEPA o falla del extractor), el sistema entra en **`CONTAMINACION_ALERTA`** de forma preventiva.
2. **Aislamiento Hermético**: El nodo activa el actuador de compuerta (damper) para sellar la cámara de fructificación, evitando que las corrientes de aire compartidas dispersen esporas a los nodos vecinos.
3. **Flujo de Sanitización**: La cámara debe ser pasteurizada / sanitizada manualmente. El operador debe validar físicamente la desinfección mediante una firma digital en `TruthSync` antes de rehabilitar el nodo.

---

## 3. Registro Histórico Inmutable (TruthSync)

Cada transición de estado crítico (ej. inicio de fructificación, detección de alerta, salida de sanitización) queda registrada en PostgreSQL como una entrada de ledger firmada. Esto permite:

*   Trazabilidad completa por Batch ID para el cliente final y certificaciones orgánicas.
*   Auditorías forenses en caso de pérdida de un lote para identificar fallas en las rampas de inducción térmica.
