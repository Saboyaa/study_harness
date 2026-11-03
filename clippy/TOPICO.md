# Clippy (linter do Rust)

## Objetivo
- Rascunho: entender o Clippy de forma mais completa, já que a pessoa o usa no trabalho para melhorar e otimizar código Rust.
- Concreto (após /sondar): diante de um aviso do Clippy em Rust, entender por que dispara (derivando de tipos, coerções e empréstimos), decidir entre aceitar e suprimir, e configurar o Clippy no projeto (níveis e grupos, `Cargo.toml [lints]`, `clippy.toml`, `-D warnings` no CI). Detalhes em `sondagem.md`.

## Estado
- Fase: ensinando        <!-- nova | sondado | planejado | ensinando | praticando -->
- Próxima lição: 02 · leituras-implicitas (reparo da confusão sobre empréstimos)
- Última sessão: 2026-11-01 · ensinar 01

## Confusões em aberto
- 2026-10-30 · Crê que usar `v` em `v.len()` e em `v[i]` já é conflito de empréstimo, e que o aviso do Clippy seria `correctness`. Evidência: S6 e S7 (conf. 80). Contradiz S8 (duas `&v`, acerto). · bloqueia: `needless_range_loop` e lints ligados a empréstimo

## Confusões resolvidas
- 2026-10-30 → 2026-11-01 · Crê que o argumento de uma chamada precisa ter exatamente o tipo do parâmetro (S4, S5) · fechada por: V2 (`String`/`&str`, outra superfície), quatro chamadas certas com raciocínio da direção dono → fatia (conf. 70)

## Pendências sem fonte
Afirmações da sondagem, conferidas contra `fontes/clippy-book/` e `fontes/catalogo-de-lints/`:
- Grupos padrão: `correctness` em deny; `suspicious`, `style`, `complexity`, `perf` em warn · onde: `grafo/nodes.jsonl` · status: confirmada (fonte: clippy-book/README.md, tabela; ver `sessoes/2026-10-31-fontes-config-grupos.md#grupos`)
- `ptr_arg` e `needless_range_loop` pertencem ao grupo `style` · onde: `grafo/nodes.jsonl` · status: confirmada (fonte: catalogo-de-lints/style.md, §ptr_arg e §needless_range_loop; ver `sessoes/2026-10-31-fontes-config-grupos.md#catalogo`)
- Mecanismos de supressão: `allow` em atributo, `[lints.clippy]` e `-A` · status: confirmada (fonte: clippy-book/configuration.md); `#[expect]`, `priority` e a ordem do `#![allow]` depois do `#![warn(clippy::pedantic)]` · confiança 85% · status: aberta
- `-D warnings` transforma avisos em erros: confirmada (fonte: clippy-book/usage.md). "Não altera quais lints estão ativos" · confiança 90% · status: aberta

## Retestes pendentes
<!-- - <proposição/alvo> · motivo: erro | dica R3+ | abandonado · desde AAAA-MM-DD -->

## Histórico
- 2026-10-30 · nova · tópico criado a partir de `_modelo/`
- 2026-10-30 · sondar · 9 perguntas; 2 concepções erradas firmes (coerção de referências, empréstimos) e lacunas na configuração; `sondagem.md` escrita
- 2026-11-01 · planejar · mapa.md revisão 1: 8 lições, começando pelo reparo das duas confusões abertas; aguarda aprovação
- 2026-11-01 · ensinar-01 · coercao-deref: coerção de referências na chamada e a direção dono → visão; confusão da coerção fechada
