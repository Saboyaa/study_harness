# study_harness

Sistema de tutoria que roda no [Claude Code](https://claude.com/claude-code) usando só arquivos locais. O método é portado do [LearnHarness](https://github.com/amosblomqvist/learnharness): sondar o que você já sabe, planejar a árvore mínima de dependências até o objetivo, ensinar um passo de raciocínio por vez (prever → explicação → verificar), praticar com dicas mínimas e manter um grafo de conhecimento persistente.

O tutor é o Claude, na sessão interativa. A memória são os arquivos de cada tópico.

## Uso

```sh
cd study_harness && claude
/novo-topico calculo        # cria calculo/ a partir de _modelo/
# coloque PDFs/capítulos em calculo/fontes/
/sondar calculo
/planejar calculo
/ensinar calculo            # uma lição por sessão
/praticar calculo
```

- `CLAUDE.md`: protocolo de tutoria e regras de fidelidade às fontes.
- `.claude/skills/`: um comando por fase.
- `docs/formato-grafo.md`: formato do grafo (LearnHarness v1 + campos `fonte`/`confianca`).
- `docs/servidor.md`: como rodar num PC antigo como servidor.
- `ferramentas/grafo.py`: ids, registro de fontes, listagem e validação do grafo.

## Licença

AGPL-3.0, a mesma do LearnHarness, do qual os prompts e o formato do grafo foram adaptados.
