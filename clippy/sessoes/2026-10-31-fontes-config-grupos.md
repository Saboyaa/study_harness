# Consulta às fontes — 2026-10-31 · grupos padrão, supressão e `-D warnings`

Fonte única consultada (lida direto, sem subagentes): Clippy Book em `fontes/clippy-book/` (commit `8518004`). Como é uma fonte só, não há visão independente de outra fonte. Pergunta: o que o livro diz sobre os grupos padrão, os meios de configurar níveis e o efeito de `-D warnings`.

## Grupos padrão {#grupos}
Confirma o nó "Grupos padrão do Clippy" (`n_32e85d6220`).
- `clippy::all` = correctness, suspicious, style, complexity, perf, nível "warn/deny". `correctness` deny; `suspicious`, `style`, `complexity`, `perf` warn; `pedantic`, `restriction`, `nursery`, `cargo` allow (fonte: README.md, tabela, L15-26).
- `correctness` é o único grupo deny-by-default (fonte: lints.md, §Correctness).

## Meios de configurar níveis {#supressao}
Confirma três dos quatro meios do nó `n_9b7b3cf6b0`:
- Atributos no código: `#![allow(clippy::style)]`, `#[warn(clippy::box_default)]`; `allow`/`warn`/`deny` valem para o item, módulo ou crate onde estão (fonte: configuration.md §Attributes in Code, L44-57; usage.md §Source Code, L127-138).
- Linha de comando: `cargo clippy -- -A clippy::lint_name` (fonte: configuration.md, L61-68; usage.md, L34-39). Também funciona com grupos.
- `Cargo.toml`: seção `[lints.clippy]`, por exemplo `enum_glob_use = "deny"` (fonte: configuration.md §Lints Section in `Cargo.toml`, L89-98).
- Não consta no livro: `#[expect]`, `priority` em `[lints.clippy]`, e a regra de que `#![allow(...)]` deve vir depois do `#![warn(clippy::pedantic)]`. Continuam `[sem fonte]`.
- Orientação do livro sobre suprimir: `correctness` não deve ser suprimido (§Correctness); `suspicious` deve ser corrigido, e se o código é intencional, suprimir localmente com `#[allow]` e uma razão (§Suspicious); `complexity` pode ser permitido caso a caso (§Complexity); `style` é opinativo e pode ser permitido, até no crate inteiro (§Style); `pedantic` espera `#[allow]` generoso (§Pedantic); `restriction` não deve ser habilitado como grupo (§Restriction), todos em lints.md.

## `-D warnings` {#dwarnings}
Confirma "transforma avisos em erros e a saída do comando é diferente de zero" (fonte: usage.md §Elevating warning to errors, L43-44; configuration.md, L55-57).
- Acréscimos do livro que o nó `n_4598a8176d` não tinha: afeta qualquer aviso, inclusive os do `rustc` como `dead_code` (usage.md, L63-65); `-Dwarnings` invalida caches de build e por isso não é recomendado onde se puder usar `build.warnings = "deny"` (Cargo 1.97; usage.md, L46-60 e L73); o CI recomenda `-Dwarnings` (continuous_integration/README.md, L3-5).
- Não consta no livro: "não altera quais lints estão ativos". Fica `[sem fonte]`.

## Lacunas {#lacunas}
- `ptr_arg`, `needless_range_loop` e `must_use_candidate` não aparecem no livro; foram resolvidos pelo catálogo de lints, na seção abaixo.

## Catálogo de lints (fonte adicionada depois) {#catalogo}
Fonte: `fontes/catalogo-de-lints/` (858 lints; texto original em inglês).
- `ptr_arg`: grupo `style`, nível `warn`; verifica argumentos `&String`, `&Vec`, `&PathBuf` e `Cow<_>` e sugere `&[T]` ou `&str` (fonte: style.md, §ptr_arg). Motivo: exigir o tipo específico torna a função menos útil sem benefício; fatias bastam e podem ser obtidas de outros tipos. Problema conhecido: ponteiros `fn(&Vec)` para a função deixam de compilar após a sugestão; em API pública, outras crates podem depender dela.
- `needless_range_loop`: grupo `style`, nível `warn`; avisa em laço sobre `0..len` só para acessar por índice. Motivo: iterar a coleção deixa a intenção clara e provavelmente é mais rápido, porque elimina a checagem de limites da indexação (fonte: style.md, §needless_range_loop).
- `must_use_candidate`: grupo `pedantic`, nível `allow` (fonte: pedantic.md, §must_use_candidate). Por isso não dispara sem habilitar `pedantic`.
