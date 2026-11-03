#!/usr/bin/env python3
"""Painel web dos tópicos: estado, mapa, grafo, lições, sessões e fontes.

Só biblioteca padrão. Somente leitura: nunca escreve nos tópicos. O front-end
(ferramentas/painel/) pergunta a /api/versao a cada poucos segundos e se
atualiza quando o tutor grava algo.

  python3 ferramentas/painel.py [--porta 8765] [--host 127.0.0.1] [--raiz DIR]

Para abrir de outros dispositivos sem expor nada: `tailscale serve --bg 8765`.
Arquivos que começam com ponto (como sessoes/.gabarito-*.md) não são servidos.
"""

import argparse
import json
import mimetypes
import re
import sys
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
from grafo import fundir_cadeias, fundir_nos, ler_jsonl  # noqa: E402

ESTATICO = Path(__file__).resolve().parent / "painel"
RAIZ = Path(__file__).resolve().parent.parent
PASTAS_LISTADAS = ("licoes", "sessoes", "fontes")


def topicos():
    return sorted(
        p.name for p in RAIZ.iterdir()
        if p.is_dir() and p.name[0] not in "._" and (p / "TOPICO.md").exists()
    )


def secoes(md: str) -> dict:
    """Seções '## Título' de TOPICO.md → linhas, sem comentários HTML."""
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    out, atual = {}, None
    for linha in md.splitlines():
        if linha.startswith("## "):
            atual = linha[3:].strip()
            out[atual] = []
        elif atual and linha.strip():
            out[atual].append(linha.strip())
    return out


def campo(linhas, nome):
    for l in linhas:
        m = re.match(rf"-\s*{nome}:\s*(.*)", l)
        if m:
            return m.group(1).strip()
    return ""


def listar(d: Path):
    if not d.is_dir():
        return []
    return sorted(
        (p.relative_to(d.parent).as_posix() for p in d.rglob("*")
         if p.is_file() and not any(x.startswith(".") for x in p.relative_to(d).parts)),
    )


def resumo(t: str) -> dict:
    d = RAIZ / t
    md = (d / "TOPICO.md").read_text(encoding="utf-8")
    titulo = next((l[2:].strip() for l in md.splitlines() if l.startswith("# ")), t)
    s = secoes(md)
    estado = s.get("Estado", [])
    nos, _ = ler_jsonl(d / "grafo" / "nodes.jsonl")
    cad, _ = ler_jsonl(d / "grafo" / "chains.jsonl")
    itens = lambda k: [l[1:].strip() for l in s.get(k, []) if l.startswith("-")]
    return {
        "slug": t,
        "titulo": titulo,
        "fase": campo(estado, "Fase").split("<!--")[0].strip() or "nova",
        "proxima": campo(estado, "Próxima lição"),
        "ultima": campo(estado, "Última sessão"),
        "confusoes": itens("Confusões em aberto"),
        "pendencias": itens("Pendências sem fonte"),
        "retestes": itens("Retestes pendentes"),
        "nos": len({n.get("id") for n in nos}),
        "cadeias": len(fundir_cadeias(cad)),
        "arquivos": {k: listar(d / k) for k in PASTAS_LISTADAS},
        "sondagem": (d / "sondagem.md").exists(),
    }


def grafo(t: str) -> dict:
    d = RAIZ / t / "grafo"
    ln, en = ler_jsonl(d / "nodes.jsonl")
    lc, ec = ler_jsonl(d / "chains.jsonl")
    try:
        fontes = json.loads((d / "sources.json").read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        fontes = {}
    return {
        "nos": list(fundir_nos(ln).values()),
        "cadeias": fundir_cadeias(lc),
        "fontes": fontes,
        "erros": en + ec,
    }


def versao() -> str:
    """Muda sempre que algum arquivo de tópico muda (fontes/ fica de fora)."""
    m, n = 0.0, 0
    for t in topicos():
        for p in (RAIZ / t).rglob("*"):
            if "fontes" in p.relative_to(RAIZ / t).parts[:1]:
                continue
            try:
                m = max(m, p.stat().st_mtime)
                n += 1
            except OSError:
                pass
    return f"{m:.3f}-{n}"


def arquivo_seguro(t: str, rel: str):
    if t not in topicos():
        return None
    base = (RAIZ / t).resolve()
    alvo = (base / rel).resolve()
    if base not in alvo.parents or any(x.startswith(".") for x in alvo.relative_to(base).parts):
        return None
    return alvo if alvo.is_file() else None


class Painel(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def enviar(self, corpo: bytes, tipo: str, status=HTTPStatus.OK):
        self.send_response(status)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(corpo)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corpo)

    def json(self, obj, status=HTTPStatus.OK):
        self.enviar(json.dumps(obj, ensure_ascii=False).encode(), "application/json; charset=utf-8", status)

    def do_GET(self):
        caminho = unquote(urlparse(self.path).path)
        partes = [p for p in caminho.split("/") if p]
        try:
            if partes[:1] == ["api"]:
                return self.api(partes[1:])
            nome = "/".join(partes) or "index.html"
            alvo = (ESTATICO / nome).resolve()
            if ESTATICO.resolve() not in alvo.parents or not alvo.is_file():
                alvo = ESTATICO / "index.html"
            tipo = mimetypes.guess_type(alvo.name)[0] or "application/octet-stream"
            if tipo.startswith("text/") or tipo.endswith("javascript"):
                tipo += "; charset=utf-8"
            self.enviar(alvo.read_bytes(), tipo)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def api(self, p):
        if p == ["versao"]:
            return self.json({"versao": versao()})
        if p == ["topicos"]:
            return self.json([resumo(t) for t in topicos()])
        if len(p) >= 2 and p[1] not in topicos():
            return self.json({"erro": "tópico não existe"}, HTTPStatus.NOT_FOUND)
        if len(p) == 2 and p[0] == "topico":
            return self.json(resumo(p[1]))
        if len(p) == 2 and p[0] == "grafo":
            return self.json(grafo(p[1]))
        if len(p) >= 3 and p[0] == "arquivo":
            alvo = arquivo_seguro(p[1], "/".join(p[2:]))
            if not alvo:
                return self.json({"erro": "arquivo não encontrado"}, HTTPStatus.NOT_FOUND)
            tipo = mimetypes.guess_type(alvo.name)[0] or "text/plain"
            if alvo.suffix in (".md", ".jsonl", ".txt", ".json"):
                tipo = "text/plain; charset=utf-8"
            return self.enviar(alvo.read_bytes(), tipo)
        self.json({"erro": "rota desconhecida"}, HTTPStatus.NOT_FOUND)


def main():
    global RAIZ
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--porta", type=int, default=8765)
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--raiz", type=Path, default=RAIZ, help="pasta que contém os tópicos")
    a = ap.parse_args()
    RAIZ = a.raiz.resolve()
    srv = ThreadingHTTPServer((a.host, a.porta), Painel)
    print(f"painel em http://{a.host}:{a.porta}  ·  tópicos em {RAIZ}")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
