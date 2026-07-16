#!/bin/bash
# issue_ssl.sh - Solicita certificados SSL con Certbot e integra con Nginx.
# Debe copiarse a /usr/local/bin/issue_ssl.sh y ejecutarse con sudo.

set -e

DOMINIO=$1
EMAIL="jnovoas@micelia.cl" # Correo por defecto para alertas de Let's Encrypt

if [ -z "$DOMINIO" ]; then
    echo "Uso: sudo $0 <dominio.cl>"
    exit 1
fi

echo "=== Iniciando solicitud de certificado SSL para $DOMINIO ==="

# 1. Comprobar que el dominio apunta a este servidor para evitar fallos de Certbot
IP_LOCAL="157.254.174.40"
echo "Verificando resolución DNS para $DOMINIO..."

IP_RESOLV=$(dig +short "$DOMINIO" | tail -n1)

if [ "$IP_RESOLV" != "$IP_LOCAL" ]; then
    echo "⚠️ ADVERTENCIA: El dominio $DOMINIO resuelve a la IP '$IP_RESOLV', pero la IP de este servidor es '$IP_LOCAL'."
    echo "Let's Encrypt requiere que la IP pública apunte a este servidor antes de emitir el certificado."
    read -p "¿Deseas continuar de todas formas? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Cancelado por el usuario."
        exit 1
    fi
fi

# 2. Ejecutar Certbot para Nginx
echo "Ejecutando Certbot..."
sudo certbot --nginx \
    -d "$DOMINIO" \
    -d "www.$DOMINIO" \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect \
    --keep-until-expiring

# 3. Recargar Nginx para asegurar que se apliquen los certificados
echo "Reiniciando Nginx..."
sudo systemctl reload nginx

echo "=== ¡Éxito! HTTPS configurado para $DOMINIO y www.$DOMINIO ==="
echo "Puedes comprobarlo en: https://$DOMINIO"
