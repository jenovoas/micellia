# Arquitectura del Servidor de Producción y Configuración Multidominio

*Categoría: Infraestructura · Tiempo de lectura: 12 min*

---

Este documento detalla la arquitectura de red, DNS, proxy reverso Nginx y el esquema de seguridad SSL de nuestro servidor de producción **`fan`** (`157.254.174.40`). Sigue estas directrices para realizar cambios sin alterar los sitios activos (`pinguinoseguro.cl`, `laespiguita.cl` y el futuro `micelia.cl`).

---

## 1. Topología del Servidor e IP

El servidor centraliza todas las funciones de red y aplicaciones:
* **IP Pública**: `157.254.174.40` (Hostname: `fan`).
* **Usuario**: `jnovoas` (con permisos de `sudo`).

```
                              [ INTERNET (Puerto 80/443/53) ]
                                            │
                                            ▼
                           ┌─────────────────────────────────┐
                           │      Servidor Remoto: fan       │
                           │        (157.254.174.40)         │
                           └──────┬──────────────────┬───────┘
                                  │                  │
                         [Puerto 53 UDP/TCP]  [Puerto 80/443]
                                  │                  │
                                  ▼                  ▼
                             DNS BIND9          Nginx Reverse Proxy
                           (named daemon)            │
                                                     ├─── / ➔ http://127.0.0.1:3000 (Next.js)
                                                     ├─── /micelia ➔ /var/www/micelia.cl/dashboard/
                                                     ├─── /portfolio ➔ /var/www/pinguinoseguro.cl/portfolio/
                                                     └─── /ws ➔ http://127.0.0.1:8080/ws (Cortex API/WS)
```

---

## 2. Configuración de DNS (BIND9)

El servidor `fan` actúa como servidor de nombres autoritativo (DNS) para los tres dominios. El servicio a cargo es `named` (BIND9).

### Estructura de DNS en el Servidor
* **Configuración Principal**: `/etc/named.conf`
* **Archivos de Zona**: `/var/named/`
  * `db.pinguinoseguro.cl` (Zona principal y Glue Records de NIC Chile).
  * `db.laespiguita.cl` (Delegado a los nameservers de `pinguinoseguro.cl`).
  * `db.micelia.cl` (Apuntando localmente a `fan`).

### Regla de Oro para Modificar DNS
Si necesitas agregar subdominios (por ejemplo, `api.pinguinoseguro.cl`):
1. Edita el archivo de zona correspondiente en `/var/named/db.<dominio>`.
2. **Incrementa el número serial** en el registro SOA (formato `AAAAMMDDXX`, ej: `2026071601`).
3. Valida la sintaxis del archivo de zona:
   ```bash
   sudo named-checkzone <dominio> /var/named/db.<dominio>
   ```
4. Recarga la configuración del daemon de DNS:
   ```bash
   sudo systemctl reload named
   ```

---

## 3. Enrutamiento Nginx (Reverse Proxy)

Nginx (`nginx.service`) recibe todas las solicitudes HTTP/HTTPS en los puertos 80 y 443. Redirige el tráfico según el dominio solicitado.

### Directorios Clave
* **Configuraciones de sitios**: `/etc/nginx/conf.d/`
  * `pinguinoseguro.cl.conf`: Controla `pinguinoseguro.cl` (redirige `/` al puerto 3000 de Next.js, `/portfolio` a estáticos y `/micelia` a la landing de Micelia).
  * `laespiguita.cl.conf`: Controla `laespiguita.cl` (sirve estáticos en `/var/www/laespiguita.cl/`).
  * `micelia.cl.conf`: Controla `micelia.cl` (sirve el dashboard directamente).
* **Archivos Estáticos (Roots)**:
  * `/var/www/pinguinoseguro.cl/` (Next.js standalone y Vite portfolio).
  * `/var/www/laespiguita.cl/` (React Vite static).
  * `/var/www/micelia.cl/dashboard/` (HTML/CSS/JS de Micelia y assets 3D).

> [!IMPORTANT]
> Todos los directorios dentro de `/var/www/` deben pertenecer al usuario `nginx` y poseer permisos de lectura y ejecución para el servidor web:
> ```bash
> sudo chown -R nginx:nginx /var/www/
> sudo chmod -R 755 /var/www/
> ```
> Además, SELinux requiere el contexto `httpd_sys_content_t`:
> ```bash
> sudo restorecon -Rv /var/www/
> ```

---

## 4. Seguridad SSL/TLS (Certbot Let's Encrypt)

Para evitar la caída de los portales HTTPS, el proceso de seguridad utiliza certificados automáticos emitidos por Let's Encrypt.

### El Helper de Certificación: `issue_ssl.sh`
Ubicado en `/usr/local/bin/issue_ssl.sh`, es el script encargado de obtener los certificados de forma automatizada e inyectar el bloque de configuración SSL (`listen 443 ssl;` y rutas de llaves) en el archivo `.conf` correspondiente en `/etc/nginx/conf.d/`.

### Procedimiento Correcto para Crear o Modificar un Sitio con SSL

Para no romper el resto de los sitios activos y evitar el error catastrófico de borrar el puerto 443, sigue este procedimiento paso a paso:

#### Paso A: Crear o Modificar la configuración en Puerto 80
Crea un archivo limpio en `/etc/nginx/conf.d/<nuevo-sitio>.conf` que solo escuche en el puerto 80 temporalmente:
```nginx
server {
    listen 80;
    server_name nuevo-sitio.cl www.nuevo-sitio.cl;

    location / {
        root /var/www/nuevo-sitio.cl;
        index index.html;
    }
}
```

#### Paso B: Validar la sintaxis de Nginx
**NUNCA** reinicies Nginx sin verificar la sintaxis antes. Un solo carácter o punto y coma faltante tirará abajo todos los sitios del servidor:
```bash
sudo nginx -t
```
*Si el test es exitoso (`syntax is ok / test is successful`), procede a recargar:*
```bash
sudo systemctl reload nginx
```

#### Paso C: Emitir el Certificado SSL
Una vez que el sitio está en línea en puerto 80 y el DNS ha propagado la resolución a la IP `157.254.174.40`, ejecuta el script helper:
```bash
sudo /usr/local/bin/issue_ssl.sh nuevo-sitio.cl
```
*Este comando hablará con Let's Encrypt, validará el dominio, modificará `/etc/nginx/conf.d/<nuevo-sitio>.conf` para habilitar el puerto 443 SSL, forzará la redirección de HTTP a HTTPS y recargará Nginx automáticamente de manera limpia.*

---

## 5. Advertencias Críticas de Infraestructura

> [!CAUTION]
> **NO EJECUTAR EL CONFIGURADOR GLOBAL (`setup_multi_production.sh`) EN PRODUCCIÓN DIRECTA**
> El script `setup_multi_production.sh` está diseñado para la provisión en frío del servidor. Si lo ejecutas sobre un servidor ya certificado, sobrescribirá todos los bloques de `/etc/nginx/conf.d/` con configuraciones por defecto en puerto 80, eliminando el soporte SSL de Let's Encrypt y dejando sin servicio HTTPS a la totalidad de las aplicaciones.

### ¿Qué hacer si se sobrescribió Nginx por error?
Si por accidente se pierden los bloques SSL, no te alarmes. Los certificados físicos de Let's Encrypt siguen estando a salvo en `/etc/letsencrypt/live/`. Restaura el servicio HTTPS ejecutando el emisor para cada dominio activo:
```bash
sudo /usr/local/bin/issue_ssl.sh pinguinoseguro.cl
sudo /usr/local/bin/issue_ssl.sh laespiguita.cl
```
Nginx recargará e inyectará de nuevo los bloques HTTPS correspondientes.
