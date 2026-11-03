# Mapa — clippy
<!-- revisão 1, 2026-11-01; atualizado após a lição 01 -->
```mermaid
graph TD
  refs-compartilhadas["Várias referências compartilhadas coexistem"]
  array-para-slice["Array vira fatia na chamada"]
  coercao-deref["Coerção de referências na chamada"]
  leituras-implicitas["len e indexação são leituras compartilhadas"]
  niveis-de-lint["Níveis: allow, warn, deny, forbid"]
  grupos-padrao["Grupos e níveis padrão do Clippy"]
  postura-por-grupo["O que fazer ao ver um lint de cada grupo"]
  ptr-arg["Lint ptr_arg"]
  needless-range-loop["Lint needless_range_loop"]
  aceitar-ou-suprimir["Decidir: aceitar ou suprimir"]
  escopos-de-supressao["Onde configurar: atributo, linha de comando, Cargo.toml"]
  prioridade-e-ordem["Ordem e prioridade entre grupo e lint; expect"]
  clippy-toml["clippy.toml e MSRV"]
  ci-e-warnings["CI e elevar avisos a erros"]
  objetivo["Objetivo: entender o aviso, decidir e configurar o projeto"]

  refs-compartilhadas --> leituras-implicitas
  array-para-slice --> coercao-deref
  coercao-deref --> ptr-arg
  leituras-implicitas --> needless-range-loop
  niveis-de-lint --> grupos-padrao
  grupos-padrao --> postura-por-grupo
  postura-por-grupo --> ptr-arg
  postura-por-grupo --> needless-range-loop
  ptr-arg --> aceitar-ou-suprimir
  needless-range-loop --> aceitar-ou-suprimir
  niveis-de-lint --> escopos-de-supressao
  grupos-padrao --> prioridade-e-ordem
  escopos-de-supressao --> prioridade-e-ordem
  escopos-de-supressao --> clippy-toml
  escopos-de-supressao --> ci-e-warnings
  aceitar-ou-suprimir --> objetivo
  prioridade-e-ordem --> objetivo
  clippy-toml --> objetivo
  ci-e-warnings --> objetivo

  class refs-compartilhadas,array-para-slice jasabe
  class coercao-deref visto
  class leituras-implicitas reparo
  classDef visto fill:#d8f0d8,stroke:#3a7d3a
  classDef atual fill:#fff3c4,stroke:#b38f00,stroke-width:3px
  classDef reparo fill:#f8d7da,stroke:#a33
  classDef jasabe fill:#e8e8e8,stroke:#888,stroke-dasharray:4
```
## Lições
| # | Nós | Arquivo |
|---|---|---|
| 01 | coercao-deref | licoes/01-coercao-deref.md |
| 02 | leituras-implicitas | licoes/02-leituras-implicitas.md |
| 03 | niveis-de-lint, grupos-padrao, postura-por-grupo | licoes/03-niveis-e-grupos.md |
| 04 | ptr-arg, needless-range-loop, aceitar-ou-suprimir | licoes/04-ler-dois-lints.md |
| 05 | escopos-de-supressao | licoes/05-escopos.md |
| 06 | prioridade-e-ordem | licoes/06-prioridade.md |
| 07 | clippy-toml | licoes/07-clippy-toml.md |
| 08 | ci-e-warnings, objetivo | licoes/08-ci-e-projeto.md |

## Notas do plano
- As lições 01 e 02 reparam as duas confusões abertas e vêm antes de qualquer lint que dependa delas.
- Fontes: `fontes/clippy-book/` (grupos, configuração, CI) e `fontes/catalogo-de-lints/` (cada lint). O que não vem delas leva `[sem fonte]`.
- Lição 06: `priority` em `[lints.clippy]`, `#[expect]` e a ordem do `#![allow]` depois do `#![warn(clippy::pedantic)]` não estão nas fontes locais. Verificar na documentação do Cargo e do rustc, com URL, antes de ensinar.
