#!/usr/bin/env python3
"""Ferramenta do grafo de conhecimento (formato LearnHarness v1 + campos fonte/confianca).

Só biblioteca padrão. Lê os ledgers JSONL, funde pelas regras do LearnHarness
e nunca reescreve linhas existentes (o único comando que escreve, `fonte`,
mexe em sources.json). Rode a partir de ./estudos.

  python3 ferramentas/grafo.py id n|arg            novo id (n_… para nós, arg_… para cadeias)
  python3 ferramentas/grafo.py fonte <topico> <caminho>   registra uma fonte em sources.json
  python3 ferramentas/grafo.py listar <topico>      nós e cadeias fundidos
  python3 ferramentas/grafo.py buscar <topico> <termo> [--todos]   busca em nome/statement/aliases
  python3 ferramentas/grafo.py validar <topico>     confere o formato e as regras de fidelidade
"""

import hashlib
import json
import secrets
import sys
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def grafo_dir(topico: str) -> Path:
    d = RAIZ / topico / "grafo"
    if not d.is_dir():
        sys.exit(f"erro: {d} não existe")
    return d


def ler_jsonl(caminho: Path):
    """Devolve (linhas, erros). Linhas vazias são ignoradas."""
    linhas, erros = [], []
    if not caminho.exists():
        return linhas, [f"{caminho.name}: arquivo ausente"]
    for i, bruto in enumerate(caminho.read_text(encoding="utf-8").splitlines(), 1):
        if not bruto.strip():
            continue
        try:
            obj = json.loads(bruto)
        except json.JSONDecodeError as e:
            erros.append(f"{caminho.name}:{i}: JSON inválido ({e.msg})")
            continue
        if not isinstance(obj, dict):
            erros.append(f"{caminho.name}:{i}: a linha não é um objeto")
            continue
        obj["_linha"] = i
        linhas.append(obj)
    return linhas, erros


def unir_proveniencia(dest: list, novos) -> None:
    vistos = {(p.get("chatId"), p.get("messageId")) for p in dest}
    for p in novos or []:
        chave = (p.get("chatId"), p.get("messageId"))
        if chave not in vistos:
            vistos.add(chave)
            dest.append(p)


def fundir_nos(linhas):
    """Primeira linha de um id define name/statement/createdAt/fonte; as seguintes viram aliases + proveniência."""
    nos = {}
    for l in linhas:
        nid = l.get("id")
        if nid not in nos:
            nos[nid] = {
                "id": nid,
                "name": l.get("name", ""),
                "statement": l.get("statement", ""),
                "aliases": list(dict.fromkeys(l.get("aliases") or [])),
                "createdAt": l.get("createdAt", ""),
                "provenance": [],
                "fonte": l.get("fonte"),
                "confianca": l.get("confianca"),
            }
            unir_proveniencia(nos[nid]["provenance"], l.get("provenance"))
            continue
        n = nos[nid]
        for extra in [l.get("statement")] + list(l.get("aliases") or []):
            if extra and extra != n["statement"] and extra not in n["aliases"]:
                n["aliases"].append(extra)
        unir_proveniencia(n["provenance"], l.get("provenance"))
    return nos


def fundir_cadeias(linhas):
    """Funde por (premissas ordenadas, conclusão); o id e a ordem são os da primeira linha."""
    cadeias = {}
    for l in linhas:
        chave = (tuple(sorted(l.get("premises") or [])), l.get("conclusion"))
        if chave not in cadeias:
            cadeias[chave] = {
                "id": l.get("id"),
                "premises": list(l.get("premises") or []),
                "conclusion": l.get("conclusion"),
                "createdAt": l.get("createdAt", ""),
                "provenance": [],
            }
        unir_proveniencia(cadeias[chave]["provenance"], l.get("provenance"))
    return list(cadeias.values())


def carregar(topico: str):
    d = grafo_dir(topico)
    ln, en = ler_jsonl(d / "nodes.jsonl")
    lc, ec = ler_jsonl(d / "chains.jsonl")
    return fundir_nos(ln), fundir_cadeias(lc), ln, lc, en + ec


def cmd_id(tipo: str) -> None:
    if tipo not in ("n", "arg"):
        sys.exit("uso: id n|arg")
    print(f"{tipo}_{secrets.token_hex(5)}")


def cmd_fonte(topico: str, caminho: str) -> None:
    d = grafo_dir(topico)
    alvo = RAIZ / topico / caminho
    if not alvo.exists():
        sys.exit(f"erro: {alvo} não existe")
    sid = "src_" + hashlib.sha256(caminho.encode("utf-8")).hexdigest()[:12]
    arq = d / "sources.json"
    fontes = json.loads(arq.read_text(encoding="utf-8")) if arq.exists() else {}
    if sid in fontes:
        print(f"{sid} já registrada ({caminho})")
        return
    fontes[sid] = {
        "id": sid,
        "filePath": caminho,
        "importedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    arq.write_text(json.dumps(fontes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{sid}  {caminho}")


def cmd_listar(topico: str) -> None:
    nos, cadeias, *_ = carregar(topico)
    print(f"# {topico}: {len(nos)} nós, {len(cadeias)} cadeias\n")
    for n in nos.values():
        marca = n["fonte"] or "?"
        if n["fonte"] == "sem fonte":
            marca += f" · {n['confianca']}%"
        print(f"{n['id']} | {n['name']} | {n['statement']}  [{marca}]")
    if cadeias:
        print()
        nome = {i: n["name"] for i, n in nos.items()}
        for c in cadeias:
            prem = " ∧ ".join(nome.get(p, p) for p in c["premises"])
            print(f"{c['id']}: {prem} ⇒ {nome.get(c['conclusion'], c['conclusion'])}")


def cmd_buscar(topico: str, termo: str, todos: bool) -> None:
    topicos = [p.parent.name for p in RAIZ.glob("*/grafo") if p.parent.name != "_modelo"] if todos else [topico]
    t = termo.lower()
    for top in sorted(topicos):
        nos, *_ = carregar(top)
        for n in nos.values():
            texto = " ".join([n["name"], n["statement"], *n["aliases"]]).lower()
            if t in texto:
                print(f"[{top}] {n['id']} | {n['name']} | {n['statement']}")


def cmd_validar(topico: str) -> int:
    nos, cadeias, ln, lc, erros = carregar(topico)
    avisos = []
    fontes_arq = grafo_dir(topico) / "sources.json"
    fontes = json.loads(fontes_arq.read_text(encoding="utf-8")) if fontes_arq.exists() else {}

    primeiras = set()
    for l in ln:
        onde = f"nodes.jsonl:{l['_linha']}"
        nid = l.get("id", "")
        if not str(nid).startswith("n_"):
            erros.append(f"{onde}: id deve começar com n_")
        if not isinstance(l.get("provenance"), list):
            erros.append(f"{onde}: provenance deve ser uma lista")
        if nid in primeiras:
            continue  # linha de link: só proveniência/aliases
        primeiras.add(nid)
        for campo in ("name", "statement", "createdAt"):
            if not l.get(campo):
                erros.append(f"{onde}: campo '{campo}' vazio na primeira linha de {nid}")
        fonte = l.get("fonte")
        if fonte is None:
            avisos.append(f"{onde}: {nid} sem campo 'fonte'")
        elif fonte == "sem fonte":
            c = l.get("confianca")
            if not isinstance(c, int) or not 0 <= c <= 100:
                erros.append(f"{onde}: {nid} é 'sem fonte' e precisa de confianca inteira 0–100")
        elif fonte != "derivado":
            sid = fonte.split()[0]
            if sid not in fontes:
                erros.append(f"{onde}: fonte '{sid}' não está em sources.json")

    for l in lc:
        onde = f"chains.jsonl:{l['_linha']}"
        if not str(l.get("id", "")).startswith("arg_"):
            erros.append(f"{onde}: id deve começar com arg_")
        prem = l.get("premises")
        if not isinstance(prem, list) or not prem:
            erros.append(f"{onde}: premises precisa ter pelo menos um id")
            prem = []
        for ref in prem + [l.get("conclusion")]:
            if ref not in nos:
                erros.append(f"{onde}: referência a nó inexistente {ref}")
        if l.get("conclusion") in prem:
            erros.append(f"{onde}: a conclusão aparece entre as premissas")

    derivados = {c["conclusion"] for c in cadeias}
    for n in nos.values():
        if n["fonte"] == "derivado" and n["id"] not in derivados:
            erros.append(f"{n['id']} marcado 'derivado' mas não é conclusão de nenhuma cadeia")

    fmt = grafo_dir(topico) / "format.json"
    if not fmt.exists() or json.loads(fmt.read_text()).get("version") != 1:
        erros.append("format.json ausente ou com versão diferente de 1")

    for a in avisos:
        print(f"aviso: {a}")
    for e in erros:
        print(f"ERRO: {e}")
    print(f"{topico}: {len(nos)} nós, {len(cadeias)} cadeias — {'OK' if not erros else f'{len(erros)} erro(s)'}")
    return 1 if erros else 0


def main(argv) -> int:
    if len(argv) < 2 or argv[1] in ("-h", "--help"):
        print(__doc__)
        return 0
    cmd, args = argv[1], argv[2:]
    try:
        if cmd == "id" and len(args) == 1:
            cmd_id(args[0])
        elif cmd == "fonte" and len(args) == 2:
            cmd_fonte(*args)
        elif cmd == "listar" and len(args) == 1:
            cmd_listar(args[0])
        elif cmd == "buscar" and len(args) >= 2:
            cmd_buscar(args[0], args[1], "--todos" in args[2:])
        elif cmd == "validar" and len(args) == 1:
            return cmd_validar(args[0])
        else:
            print(__doc__)
            return 2
    except BrokenPipeError:
        pass
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
