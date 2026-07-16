# Pizarra del Proyecto - Micelia

Este archivo sirve como pizarra de notas y configuraciones del proyecto **Micelia**.

## Servidor de Despliegue (Destino)

* **Alias SSH**: `fan` (configurado en `~/.ssh/config`)
* **Dirección IP**: `157.254.174.40`
* **Puerto SSH**: `22`
* **Usuario**: `jnovoas`
* **Llave Privada**: `~/.ssh/id_servers_ed25519`
* **Estado**: **Online** (Soporte DNF, Rust y compilación release probado)

---

## Plan de DNS Autorizado y Sitios Web (Multidominio)

El servidor `fan` resolverá y hospedará de forma autónoma los siguientes dominios:
1. **`micelia.cl`** (Dashboard + Proxy a Cortex Daemon en puerto 8080)
2. **`pinguinoseguro.cl`** (Sitio adicional, estáticos en `/var/www/pinguinoseguro.cl`)
3. **`laespiguita.cl`** (Sitio adicional, estáticos en `/var/www/laespiguita.cl`)

---

## Guía de Despliegue y Aprovisionamiento Remoto

Cuando decidas sincronizar y configurar el servidor de producción, sigue estos pasos desde tu laptop:

### Paso 1: Sincronizar el Código y los Scripts
Ejecuta en la raíz de `system`:
```bash
make deploy
```
*Esto creará la estructura en `~/micellia` en el servidor y compilará la versión optimizada del backend.*

### Paso 2: Aprovisionar DNS (BIND9), Nginx y Firewall
Ejecuta el script local en el servidor remoto:
```bash
ssh fan 'bash -s' < ./deployment/setup_multi_production.sh
```
*Este comando instalará BIND9, Nginx, configurará las 3 zonas DNS autoritativas, creará los server blocks para Nginx y abrirá los puertos 53 (DNS), 80 (HTTP) y 443 (HTTPS) en el firewall.*

### Paso 3: Copiar el Script de Certificación SSL (Certbot)
Copia el script de emisión de certificados a la ruta de comandos del servidor `fan`:
```bash
scp ./deployment/issue_ssl.sh fan:/tmp/issue_ssl.sh
ssh fan "sudo mv /tmp/issue_ssl.sh /usr/local/bin/issue_ssl.sh && sudo chmod +x /usr/local/bin/issue_ssl.sh"
```

### Paso 4: Emitir Certificados HTTPS (Bajo Demanda)
Una vez que hayas delegado tus dominios en tu registrador (NIC Chile, etc.) y las consultas DNS resuelvan a `157.254.174.40`, ejecuta el comando para activar HTTPS para cada dominio:
```bash
ssh fan "sudo /usr/local/bin/issue_ssl.sh micelia.cl"
ssh fan "sudo /usr/local/bin/issue_ssl.sh pinguinoseguro.cl"
ssh fan "sudo /usr/local/bin/issue_ssl.sh laespiguita.cl"
```
*Este comando solicitará los certificados TLS/SSL de Let's Encrypt, reconfigurará Nginx para forzar el redireccionamiento seguro y reiniciará el servicio automáticamente.*
