#!/bin/bash
# issue_ssl.sh - Solicita certificados SSL con Certbot e integra con Nginx.
# Debe copiarse a /usr/local/bin/issue_ssl.sh y ejecutarse con sudo.

set -e

DOMINIO=${1:-}
INCLUIR_WWW=${2:-}
EMAIL="jnovoas@pinguinoseguro.cl" # Correo por defecto para alertas de Let's Encrypt

if [ -z "$DOMINIO" ] || { [ -n "$INCLUIR_WWW" ] && [ "$INCLUIR_WWW" != "--www" ]; }; then
    echo "Uso: sudo $0 <dominio> [--www]"
    exit 1
fi

echo "=== Iniciando solicitud de certificado SSL para $DOMINIO ==="

# 1. Comprobar que el dominio apunta a este servidor para evitar fallos de Certbot
if [ -n "${MICELIA_PUBLIC_IPV4:-}" ]; then
    IP_LOCAL="$MICELIA_PUBLIC_IPV4"
else
    IP_LOCAL=$(curl -4fsS https://api.ipify.org)
fi
verificar_dns() {
    local nombre="$1"
    local ip_resolv
    local ip_aaaa
    local -a registros_a

    echo "Verificando resolución DNS para $nombre..."
    mapfile -t registros_a < <(dig +short "$nombre" A | grep -E '^[0-9]{1,3}([.][0-9]{1,3}){3}$')
    if [ "${#registros_a[@]}" -eq 0 ]; then
        echo "ERROR: $nombre no tiene registros A IPv4 visibles."
        return 1
    fi

    for ip_resolv in "${registros_a[@]}"; do
        if [ "$ip_resolv" != "$IP_LOCAL" ]; then
            echo "ERROR: $nombre resuelve a '$ip_resolv', pero la IPv4 pública de este servidor es '$IP_LOCAL'."
            return 1
        fi
    done

    ip_aaaa=$(dig +short "$nombre" AAAA)
    if [ -n "$ip_aaaa" ]; then
        echo "ERROR: $nombre tiene registros AAAA, pero este procedimiento solo configura IPv4. Retíralos o configura IPv6 antes de solicitar el certificado."
        return 1
    fi
    return 0
}

verificar_dns "$DOMINIO"
if [ "$INCLUIR_WWW" = "--www" ]; then
    verificar_dns "www.$DOMINIO"
fi

# 2. Ejecutar Certbot para Nginx
CERT_DOMAINS=(-d "$DOMINIO")
if [ "$INCLUIR_WWW" = "--www" ]; then
    CERT_DOMAINS+=(-d "www.$DOMINIO")
fi

echo "Ejecutando Certbot..."
sudo certbot --nginx \
    "${CERT_DOMAINS[@]}" \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect \
    --keep-until-expiring

# 3. Recargar Nginx para asegurar que se apliquen los certificados
echo "Reiniciando Nginx..."
sudo systemctl reload nginx

echo "=== ¡Éxito! HTTPS configurado para $DOMINIO ==="
echo "Puedes comprobarlo en: https://$DOMINIO"
