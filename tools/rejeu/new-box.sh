#!/bin/bash
# Crée une « machine vierge » d'étudiant : Ubuntu 24.04, privilégiée, /var/lib/docker sur volume (overlay imbriqué).
# Usage : new-box.sh <nom>   puis : docker exec -it <nom> bash -l
set -e
N=$1
docker rm -f "$N" >/dev/null 2>&1 || true
docker volume rm -f "$N-docker" >/dev/null 2>&1 || true
docker run -d --privileged --name "$N" --hostname "$N" -v "$N-docker:/var/lib/docker" ubuntu:24.04 sleep infinity >/dev/null
[ -f "${PROXY_CA:-}" ] && docker exec "$N" mkdir -p /usr/local/share/ca-certificates
[ -f "${PROXY_CA:-}" ] && docker cp "$PROXY_CA" "$N":/usr/local/share/ca-certificates/sandbox-proxy.crt
docker exec "$N" bash -c 'export DEBIAN_FRONTEND=noninteractive; apt-get update -qq >/dev/null; apt-get install -y -qq ca-certificates curl sudo >/dev/null 2>&1; update-ca-certificates >/dev/null 2>&1; useradd -m -s /bin/bash -G sudo etudiant; echo "etudiant ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/etudiant; chmod 0440 /etc/sudoers.d/etudiant'
echo "box $N prête (user: etudiant, sudo sans mot de passe)"
