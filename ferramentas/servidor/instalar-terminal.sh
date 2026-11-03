#!/usr/bin/env bash
# Instala o terminal web enjaulado (veja estudo-terminal.service) e o publica
# só na tailnet, em https://<máquina>.<tailnet>.ts.net:8443. Idempotente.
#   sudo bash ferramentas/servidor/instalar-terminal.sh
set -euo pipefail
[[ $EUID -eq 0 ]] || { echo "rode com: sudo bash $0"; exit 1; }
AQUI=$(cd "$(dirname "$0")" && pwd)
REPO=$(cd "$AQUI/../.." && pwd)
DONO=$(stat -c %U "$REPO")
LAR=/var/lib/estudo

echo "==> Pacotes"
pacman -S --needed --noconfirm ttyd tmux acl

echo "==> Usuário estudo (sem sudo, sem docker, sem login)"
id estudo &>/dev/null || useradd --system --create-home --home-dir "$LAR" --shell /usr/bin/nologin estudo

echo "==> Acesso de leitura e escrita só ao repositório, nos dois sentidos"
setfacl -R -m "u:estudo:rwX,d:u:estudo:rwX,d:u:$DONO:rwX" "$REPO"

echo "==> Claude Code do usuário estudo (login próprio, feito depois pelo navegador)"
if [[ ! -x $LAR/.local/bin/claude ]]; then
  sudo -u estudo -H bash -c "cd '$LAR' && curl -fsSL https://claude.ai/install.sh | bash"
fi
install -d -o estudo -g estudo "$LAR/.claude"
install -o estudo -g estudo -m 644 "$AQUI/claude-settings.json" "$LAR/.claude/settings.json"
install -o estudo -g estudo -m 644 "$AQUI/terminal.tmux.conf" "$LAR/.tmux.conf"
# Roda a partir de $LAR: o estudo não atravessa /home/<dono> (0700) fora da jaula.
(cd "$LAR" && sudo -u estudo -H git config --global safe.directory "$REPO")

echo "==> Serviço"
sed "s#@REPO@#$REPO#g" "$AQUI/estudo-terminal.service" > /etc/systemd/system/estudo-terminal.service
systemctl daemon-reload
systemctl enable estudo-terminal
systemctl restart estudo-terminal

echo "==> Publicando na tailnet (porta 8443)"
tailscale serve --bg --https 8443 http://127.0.0.1:7681
tailscale serve status
echo
echo "Pronto. Abra a aba Terminal no painel e faça o login do Claude uma vez."
