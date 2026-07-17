#!/bin/bash
# setup_multi_production.sh - Configuración de BIND9, Nginx y Certbot en el servidor fan.
# Debe ejecutarse en el servidor 'fan' como root o con privilegios sudo.

set -e

echo "=== Iniciando aprovisionamiento multidominio de Micelia ==="

# 1. Habilitar repositorio EPEL y dnf utilities
echo "Instalando dependencias de paquetes y EPEL..."
sudo dnf install -y epel-release dnf-plugins-core

# 2. Instalar BIND9 y Nginx
echo "Instalando BIND9 y Nginx..."
sudo dnf install -y bind bind-utils nginx

# 3. Configurar BIND9 (/etc/named.conf)
echo "Configurando /etc/named.conf..."
sudo tee /etc/named.conf > /dev/null << 'EOF'
options {
    listen-on port 53 { any; };
    listen-on-v6 port 53 { any; };
    directory 	"/var/named";
    dump-file 	"/var/named/data/cache_dump.db";
    statistics-file "/var/named/data/named_stats.txt";
    memstatistics-file "/var/named/data/named_mem_stats.txt";
    secroots-file	"/var/named/data/named.secroots";
    recursing-file	"/var/named/data/named.recursing";
    allow-query     { any; };

    recursion yes;
    dnssec-validation yes;

    managed-keys-directory "/var/named/dynamic";
    geoip-directory "/usr/share/GeoIP";

    pid-file "/run/named/named.pid";
    session-keyfile "/run/named/session.key";

    include "/etc/crypto-policies/back-ends/bind.config";
};

logging {
    channel default_debug {
        file "data/named.run";
        severity dynamic;
    };
};

zone "." IN {
    type hint;
    file "named.ca";
};

include "/etc/named.rfc1912.zones";
include "/etc/named.root.key";

// Zonas Autorizadas
zone "micelia.cl" IN {
    type master;
    file "db.micelia.cl";
    allow-update { none; };
};

zone "pinguinoseguro.cl" IN {
    type master;
    file "db.pinguinoseguro.cl";
    allow-update { none; };
};

zone "laespiguita.cl" IN {
    type master;
    file "db.laespiguita.cl";
    allow-update { none; };
};
EOF

# 4. Crear archivos de Zona DNS
IP_PUBLICA="157.254.174.40"

crear_zona_dns() {
    local dominio=$1
    echo "Creando archivo de zona para $dominio..."
    sudo tee /var/named/db.$dominio > /dev/null << EOF
\$TTL 86400
@   IN  SOA     ns1.$dominio. admin.$dominio. (
                2026071501  ; Serial
                3600        ; Refresh
                1800        ; Retry
                604800      ; Expire
                86400       ; Minimum TTL
)
@   IN  NS      ns1.$dominio.
@   IN  NS      ns2.$dominio.
ns1 IN  A       $IP_PUBLICA
ns2 IN  A       $IP_PUBLICA
@   IN  A       $IP_PUBLICA
www IN  A       $IP_PUBLICA
EOF
    # Corregir permisos para que BIND pueda leerlos
    sudo chown root:named /var/named/db.$dominio
    sudo chmod 640 /var/named/db.$dominio
}

crear_zona_dns "micelia.cl"
crear_zona_dns "pinguinoseguro.cl"
crear_zona_dns "laespiguita.cl"

# 5. Crear directorios web y placeholders
echo "Configurando directorios web..."
sudo mkdir -p /var/www/micelia.cl/dashboard
sudo mkdir -p /var/www/pinguinoseguro.cl
sudo mkdir -p /var/www/laespiguita.cl

# Copiar dashboard si ya existe en la carpeta desplegada
if [ -d "/home/jnovoas/micellia/system/dashboard" ]; then
    echo "Desplegando dashboard real de Micelia..."
    sudo cp -r /home/jnovoas/micellia/system/dashboard/* /var/www/micelia.cl/dashboard/
else
    echo "Creando placeholder para el dashboard de Micelia..."
    echo "<h1>Micelia Dashboard - Placeholder</h1>" | sudo tee /var/www/micelia.cl/dashboard/index.html > /dev/null
fi

if [ ! -f /var/www/pinguinoseguro.cl/index.html ]; then
    echo "<h1>Bienvenido a pinguinoseguro.cl</h1>" | sudo tee /var/www/pinguinoseguro.cl/index.html > /dev/null
fi
if [ ! -f /var/www/laespiguita.cl/index.html ]; then
    echo "<h1>Bienvenido a laespiguita.cl</h1>" | sudo tee /var/www/laespiguita.cl/index.html > /dev/null
fi
sudo chown -R nginx:nginx /var/www/

# 6. Configurar Server Blocks en Nginx
echo "Configurando bloques de servidores Nginx..."

# micelia.cl
sudo tee /etc/nginx/conf.d/micelia.cl.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name micelia.cl www.micelia.cl;

    location / {
        root /var/www/micelia.cl/dashboard;
        index index.html;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

# pinguinoseguro.cl
sudo tee /etc/nginx/conf.d/pinguinoseguro.cl.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name pinguinoseguro.cl www.pinguinoseguro.cl _ 157.254.174.40;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location = /portfolio {
        return 301 $scheme://$http_host/portfolio/;
    }

    location /portfolio {
        alias /var/www/pinguinoseguro.cl/portfolio;
        index index.html;
    }

    location = /micelia {
        return 301 /micelia/;
    }

    location ^~ /micelia/ {
        alias /var/www/micelia.cl/dashboard/;
        index index.html;
    }

    # robots.txt se consulta siempre en la raíz del host; no en /micelia/.
    # Si Pinguino Seguro ya tiene reglas propias, intégralas en este archivo.
    location = /robots.txt {
        alias /var/www/micelia.cl/dashboard/robots-host.txt;
        default_type text/plain;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

# laespiguita.cl
sudo tee /etc/nginx/conf.d/laespiguita.cl.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name laespiguita.cl www.laespiguita.cl;

    location / {
        root /var/www/laespiguita.cl;
        index index.html;
    }
}
EOF

# 7. Instalar Certbot
echo "Instalando Certbot y plugin de Nginx..."
sudo dnf install -y certbot python3-certbot-nginx

# 8. Configurar Firewall
echo "Abriendo puertos del Firewall (DNS, HTTP, HTTPS)..."
if sudo systemctl is-active --quiet firewalld; then
    sudo firewall-cmd --add-service=dns --permanent
    sudo firewall-cmd --add-service=http --permanent
    sudo firewall-cmd --add-service=https --permanent
    sudo firewall-cmd --reload
else
    echo "Firewalld no está activo. Omitiendo configuración del firewall."
fi

# 9. Habilitar e Iniciar Servicios
echo "Habilitando e iniciando servicios..."
sudo systemctl enable named nginx
sudo systemctl restart named nginx

echo "=== Aprovisionamiento Completado Correctamente ==="
echo "BIND9 y Nginx están corriendo y configurados para: micelia.cl, pinguinoseguro.cl, laespiguita.cl."
echo "Usa el script /usr/local/bin/issue_ssl.sh para certificar cada dominio cuando esté propagado en la red."
