# TruthSync Ledger: Inmutabilidad Criptográfica de Despachos

*Categoría: Tecnología de Cultivo · Tiempo de lectura: 5 min*

---

![Ledger de Transacciones TruthSync](oyster_mushrooms.png)

En la cadena de suministro B2B de Micelia, la transparencia y la confianza con los restaurantes y locales de la Provincia de Arauco es fundamental. Para ello implementamos **TruthSync**, un ledger criptográfico inmutable que registra cada pedido y actualización de despacho.

## Estructura del Bloque de Transacción
Cada pedido registrado en PostgreSQL no solo guarda campos convencionales, sino que calcula un hash único **SHA-256** inmutable compuesto por:
1. ID de la transacción.
2. Datos del cliente (nombre, dirección).
3. Detalles del pedido (ítems y totales).
4. Estado anterior (ej. *Cosechando*) y estado nuevo (ej. *En Reparto*).
5. Hash criptográfico del registro anterior en la base de datos (encadenamiento de firmas).

```
[ Registro N-1 (Hash) ] ➔ [ Datos Pedido + Estado ] ➔ SHA256 ➔ [ Registro N (Hash) ]
```

## Prevención del Fraude y Auditorías
Debido a que cada bloque de transacción se encadena con el hash del anterior, si un administrador o intruso intenta modificar de forma maliciosa un precio, cantidad o firma en un despacho pasado en la base de datos PostgreSQL, **toda la cadena de hashes subsiguiente se romperá inmediatamente**.
- El panel de administración realiza verificaciones periódicas automáticas de la integridad de la base de datos comparando las firmas.
- Un ledger criptográfico permite certificar que la información de despacho y entrega reportada es 100% fidedigna ante auditorías comerciales.
