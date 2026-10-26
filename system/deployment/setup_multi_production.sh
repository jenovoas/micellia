#!/bin/bash
# setup_multi_production.sh - Configuración de BIND9, Nginx y Certbot en el servidor fenix.
# Ejecutar como el usuario que desplegó el repo; como root, define MICELIA_PROJECT_DIR.

set -e

echo "=== Iniciando aprovisionamiento multidominio de Micelia ==="

# 1. Habilitar repositorio EPEL y dnf utilities
echo "Instalando dependencias de paquetes y EPEL..."
sudo dnf install -y epel-release dnf-plugins-core

# 2. Instalar BIND9 y Nginx
echo "Instalando BIND9 y Nginx..."
sudo dnf install -y bind bind-utils nginx curl

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
if [ -n "${MICELIA_PUBLIC_IPV4:-}" ]; then
    IP_PUBLICA="$MICELIA_PUBLIC_IPV4"
else
    IP_PUBLICA=$(curl -4fsS https://api.ipify.org)
fi

es_ipv4_publica_valida() {
    local octeto
    local a b c
    local -a octetos
    [[ "$1" =~ ^([0-9]{1,3}[.]){3}[0-9]{1,3}$ ]] || return 1
    IFS=. read -r -a octetos <<< "$1"
    for octeto in "${octetos[@]}"; do
        if ((10#$octeto > 255)); then
            return 1
        fi
    done

    a=$((10#${octetos[0]}))
    b=$((10#${octetos[1]}))
    c=$((10#${octetos[2]}))
    if ((a == 0 || a == 10 || a == 127 || a >= 224)); then return 1; fi
    if ((a == 100 && b >= 64 && b <= 127)); then return 1; fi
    if ((a == 169 && b == 254)); then return 1; fi
    if ((a == 172 && b >= 16 && b <= 31)); then return 1; fi
    if ((a == 192 && (b == 0 || b == 168))); then return 1; fi
    if ((a == 192 && b == 0 && c == 2)); then return 1; fi
    if ((a == 192 && b == 88 && c == 99)); then return 1; fi
    if ((a == 198 && (b == 18 || b == 19 || (b == 51 && c == 100)))); then return 1; fi
    if ((a == 203 && b == 0 && c == 113)); then return 1; fi
    return 0
}

if ! es_ipv4_publica_valida "$IP_PUBLICA"; then
    echo "No se pudo determinar una IPv4 pública válida. Define MICELIA_PUBLIC_IPV4 y reintenta."
    exit 1
fi

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
; micelia.pinguinoseguro.cl se resuelve como subdominio (A record)
micelia IN  A     $IP_PUBLICA
EOF
    # Corregir permisos para que BIND pueda leerlos
    sudo chown root:named /var/named/db.$dominio
    sudo chmod 640 /var/named/db.$dominio
}

# micelia.cl YA NO es zona propia; es subdominio micelia.pinguinoseguro.cl
crear_zona_dns "pinguinoseguro.cl"
crear_zona_dns "laespiguita.cl"

# 5. Crear directorios web de los sitios estáticos auxiliares.
echo "Configurando directorios web..."
sudo mkdir -p /var/www/pinguinoseguro.cl/portfolio
sudo mkdir -p /var/www/laespiguita.cl

if [ ! -f /var/www/pinguinoseguro.cl/index.html ]; then
    echo "<h1>Bienvenido a pinguinoseguro.cl</h1>" | sudo tee /var/www/pinguinoseguro.cl/index.html > /dev/null
fi
if [ ! -f /var/www/laespiguita.cl/index.html ]; then
    echo "<h1>Bienvenido a laespiguita.cl</h1>" | sudo tee /var/www/laespiguita.cl/index.html > /dev/null
fi
sudo chown -R nginx:nginx /var/www/

# 6. Configurar Server Blocks en Nginx
echo "Configurando bloques de servidores Nginx..."

# pinguinoseguro.cl (incluye micelia.pinguinoseguro.cl)
sudo tee /etc/nginx/conf.d/pinguinoseguro.cl.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name pinguinoseguro.cl www.pinguinoseguro.cl _;

    # Sitio principal pinguinoseguro.cl (proxy a Next.js en puerto 3000)
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

}

# Subdominio micelia.pinguinoseguro.cl: dashboard, API y WebSocket por Cortex.
server {
    listen 80;
    server_name micelia.pinguinoseguro.cl;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8080/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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
echo "BIND9 y Nginx están corriendo y configurados para: pinguinoseguro.cl (incluye micelia.pinguinoseguro.cl), laespiguita.cl."
echo "Usa el script /usr/local/bin/issue_ssl.sh para certificar cada dominio cuando esté propagado en la red."