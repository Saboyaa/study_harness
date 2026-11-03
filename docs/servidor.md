# Rodar no PC antigo como servidor

Objetivo: o PC antigo fica ligado com o Claude Code e a pasta `estudos/`. Você estuda de qualquer computador (ou do celular) pelo navegador ou por SSH, e o grafo fica num lugar só.

Recomendação: **Tailscale + code-server**. Um único endereço no navegador entrega o terminal do Claude Code e o preview de Markdown com LaTeX e Mermaid, lado a lado.

## Requisitos do PC antigo
- Linux (Debian/Ubuntu/Mint leves servem), 64 bits.
- Uns 2 GB de RAM são confortáveis (o code-server e o Claude Code rodam em Node). O processamento pesado acontece na nuvem da Anthropic, não no PC.
- Ligado na rede. Configure a BIOS e o sistema para não suspender.

## 1. Acesso de qualquer lugar: Tailscale
Cria uma rede privada entre os seus dispositivos, sem abrir portas no roteador.
```sh
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```
Instale o Tailscale também no notebook ou no celular, com a mesma conta. O PC antigo ganha um nome (ex.: `pc-antigo`) acessível só pelos seus dispositivos.

## 2. Claude Code no servidor
```sh
curl -fsSL https://claude.ai/install.sh | bash
cd ~/estudos && claude      # primeiro login interativo
```
Copie a pasta `estudos/` para o servidor (`scp -r estudos pc-antigo:~/` ou um repositório git privado).

## 3. Interface no navegador: code-server
VS Code rodando no servidor e aberto pelo navegador.
```sh
curl -fsSL https://code-server.dev/install.sh | sh
sudo systemctl enable --now code-server@$USER
```
- Senha em `~/.config/code-server/config.yaml`.
- Para escutar só na Tailscale, use `bind-addr: <ip-tailscale>:8080`. Pegue o IP com `tailscale ip -4`.
- Acesse `http://pc-antigo:8080` de qualquer dispositivo da sua rede Tailscale.
- Extensão **Markdown Preview Enhanced**: renderiza `$…$`, `$$…$$` e Mermaid. Dá para deixar a nota da lição aberta em preview ao lado do terminal.
- No terminal integrado: `cd ~/estudos && claude`.

## Painel do study_harness
Visualizador próprio, no visual do LearnHarness: tópicos, `TOPICO.md` com confusões e pendências em destaque, mapa com nós clicáveis, grafo interativo (proposições, cadeias, fonte de cada nó, onde apareceu), lições e sessões com LaTeX e Mermaid. É somente leitura, usa só a biblioteca padrão do Python e se atualiza sozinho a cada gravação do tutor. Não serve arquivos que começam com ponto (os `.gabarito-*`).
```sh
python3 ferramentas/painel.py            # escuta só em 127.0.0.1:8765
tailscale serve --bg 8765                # publica na sua tailnet, com HTTPS
```
Como serviço: uma unidade systemd com `ExecStart=/usr/bin/python3 <repo>/ferramentas/painel.py --porta 8765` e `User=<você>`. O terminal continua pelo SSH (abaixo); o painel fica aberto ao lado, no navegador ou no celular.

## Terminal no painel (enjaulado)
A aba **Terminal** do painel abre o `claude` no navegador (ttyd → tmux → claude), para estudar inteiro pelo celular. Instalação: `sudo bash ferramentas/servidor/instalar-terminal.sh`; depois, faça o login do Claude uma vez pela própria aba.

Roda como o usuário `estudo`, sem sudo e sem docker, numa jaula do systemd (`ferramentas/servidor/estudo-terminal.service`): sistema somente leitura e `/home` vazio, exceto o repositório. A jaula vale também para comandos com `!` dentro do Claude. Quem tomasse esse terminal conseguiria ler e editar o repositório, gastar a cota do Claude e acessar a internet. Não conseguiria virar root, usar o Docker nem ver o resto da máquina. Publicado só na tailnet, em `https://<máquina>.<tailnet>.ts.net:8443`.

## Alternativa mínima: SSH + tmux
Sem navegador, mais leve:
```sh
ssh pc-antigo
tmux new -A -s estudo     # reconecta na mesma sessão se a conexão cair
cd ~/estudos && claude
```
Para ler as notas renderizadas nesse modo, abra-as em qualquer visualizador local (Obsidian, VS Code) via sincronização, ou use o code-server só para o preview.

## Alternativa: controlar a sessão pelo app do Claude
O Claude Code tem um modo de controle remoto que deixa você conduzir pelo claude.ai (navegador ou celular) uma sessão que roda no seu computador. Os comandos e a disponibilidade mudam entre versões: confira com `claude --help` ou `/help` no servidor. As notas renderizadas continuariam precisando do code-server ou de outro visualizador.

## Cuidados
- Faça backup de `estudos/`. Um `git init` com commits no fim de cada sessão é o mais simples: o grafo só cresce por acréscimo, então o diff mostra exatamente o que cada sessão mudou.
- Não exponha o code-server na internet aberta. Use só a Tailscale.
