#!/bin/bash
# « VM » d'étudiant : Ubuntu 24.04 avec systemd en PID 1 (systemctl, journalctl, services),
# privilégiée (loop devices, mount, iptables/ufw), utilisateur etudiant avec sudo.
# Usage : new-vm.sh <nom>   puis : docker exec -u etudiant -w /home/etudiant <nom> bash -lc '...'
set -e
N=$1
docker rm -f "$N" >/dev/null 2>&1 || true
docker volume rm -f "$N-docker" >/dev/null 2>&1 || true
if ! docker image inspect jiha/ubuntu-systemd:24.04 >/dev/null 2>&1; then
  d=$(mktemp -d)
  if [ -f "${PROXY_CA:-}" ]; then cp "$PROXY_CA" "$d/proxy-ca.crt"; else : > "$d/proxy-ca.crt"; fi
  cat > "$d/Dockerfile" <<'DF'
FROM ubuntu:24.04
COPY proxy-ca.crt /usr/local/share/ca-certificates/proxy-ca.crt
# Défaire les réglages « conteneur » de l'image Docker pour ressembler à Ubuntu Server :
# services démarrés à l'installation, pages man présentes, paquets de base d'un serveur.
RUN rm -f /usr/sbin/policy-rc.d /etc/dpkg/dpkg.cfg.d/excludes /etc/apt/apt.conf.d/docker-* \
 && apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
      systemd systemd-sysv dbus sudo ca-certificates curl wget \
      cron logrotate rsyslog iproute2 iputils-ping less nano vim man-db manpages \
      lsof htop psmisc procps kmod util-linux ufw bash-completion tzdata locales \
 && update-ca-certificates \
 && DEBIAN_FRONTEND=noninteractive apt-get install --reinstall -y -qq $(dpkg-query -W -f='${binary:Package} ') >/var/log/reinstall.log 2>&1 \
 && if [ -e /usr/bin/man.REAL ]; then rm -f /usr/bin/man && dpkg-divert --quiet --remove --rename /usr/bin/man; fi \
 && rm -f /etc/update-motd.d/60-unminimize
RUN useradd -m -s /bin/bash -G sudo etudiant \
 && echo "etudiant ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/etudiant && chmod 0440 /etc/sudoers.d/etudiant
STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
DF
  docker build -q -t jiha/ubuntu-systemd:24.04 "$d" >/dev/null
fi
docker run -d --privileged --cgroupns=host -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
  --tmpfs /run --tmpfs /run/lock -v "$N-docker:/var/lib/docker" \
  --name "$N" --hostname "$N" jiha/ubuntu-systemd:24.04 >/dev/null
for i in $(seq 1 30); do
  s=$(docker exec "$N" systemctl is-system-running 2>/dev/null || true)
  case "$s" in running|degraded) break;; esac; sleep 1
done
echo "vm $N prête (systemd: $s, user: etudiant)"
