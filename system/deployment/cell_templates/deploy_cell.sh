#!/bin/bash
# deploy_cell.sh - Despliega un nuevo nodo de cultivo sin intervención manual.

set -e

CELL_ID=$1

if [ -z "$CELL_ID" ]; then
    echo "Uso: $0 <cell_id>"
    exit 1
fi

CONFIG_DIR="/etc/micelia/cells"
# Para desarrollo local usamos un path relativo si no hay permisos en /etc
if [ ! -w "/etc" ]; then
    CONFIG_DIR="./deployment/cells"
fi
mkdir -p "$CONFIG_DIR"

echo "Desplegando célula $CELL_ID..."

# Reemplazar placeholders en la plantilla de configuración
sed "s/{{CELL_ID}}/$CELL_ID/g" ./deployment/cell_templates/cell_config.toml.tmpl > "$CONFIG_DIR/cell_$CELL_ID.toml"

echo "Configuración generada en $CONFIG_DIR/cell_$CELL_ID.toml"
echo "Célula $CELL_ID inicializada correctamente."
