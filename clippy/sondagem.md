# Sondagem — 2026-10-30

Sem fontes locais nesta sondagem; as afirmações sobre o Clippy abaixo são `[sem fonte · confiança NN%]` e as confusões estão em `TOPICO.md`.

## Objetivo (concreto)
Diante de um aviso do Clippy em código Rust do trabalho, conseguir:
1. **Entender** por que ele dispara, derivando do que o Rust garante (tipos, coerções, empréstimos), e decidir se aceita a sugestão ou suprime.
2. **Configurar** o Clippy no projeto: níveis e grupos, `Cargo.toml` (`[lints.clippy]`), `clippy.toml`, atributos e `-D warnings` no CI.

Fora do escopo: o funcionamento interno do Clippy e a escrita de lints próprios (não escolhidos pela pessoa). Ainda não medido: o projeto concreto (crate único ou workspace) e a profundidade desejada em `pedantic`, `nursery` e `restriction`.

## Fios

### Configurar o Clippy
- Piso: sabe que os lints têm categorias com nomes (`correctness`, `style`) e supõe que existe um meio nativo de desligar um lint (S1, confiança 30).
- Teto: não conhece nenhum mecanismo de supressão (atributo, `Cargo.toml`, flag), os grupos padrão ativos e seus níveis (S2, "não sei"), nem o efeito de `-D warnings` (S9, entendeu o contrário).
- Concepções erradas: tratar "ocultar a saída" (`grep`) como desligar o lint (S1); achar que `-D warnings` remove os avisos (S9). Ambas de baixa confiança, então lacunas e não concepções firmes.
- De onde construir: a intuição de que existe um meio nativo.

### Entender por que um lint dispara
- Piso: conhece os nomes de dois grupos (`style`, `correctness`) e que o aviso depende do código (S3, S6).
- Teto: não identificou `ptr_arg` nem `needless_range_loop`, nem o motivo de nenhuma das sugestões (S3, S6).
- Concepções erradas: ler o aviso como sobre nome de variável (S3, confiança 40); achar que `needless_range_loop` é `correctness`, ou seja, que o código está errado (S6, confiança 80).
- De onde construir: o hábito de procurar a causa no código, sem a tarefa de distinguir "estilo" de "bug".

### Base de Rust que as sugestões supõem
- Piso: várias `&v` coexistem (S8, acerto, confiança 70); `&[T; N]` passa para `&[T]` (S4, `g(&a)`); `&[T; N]` não passa para `&Vec<T>` (S4, `f(&a)`).
- Teto: não conhece a deref coercion (S4 `g(&w)`, S5 `h(&st)`).
- Concepções erradas firmes:
  - O argumento precisa ter exatamente o tipo do parâmetro (S4, conf. 80; S5, conf. 60).
  - Usar `v` duas vezes, em `v.len()` e em `v[i]`, já é conflito de empréstimo (S6, S7, ambas conf. 80). Contradiz a S8, onde a pessoa aceita duas `&v`.
- De onde construir: o que ela já acerta sobre referências compartilhadas e sobre array para slice.

## Síntese
Entrar por baixo nos dois fios de Rust, antes de qualquer lint que dependa deles, porque a leitura dos lints de parâmetro e de laço apoia-se nas duas concepções erradas firmes. Antes de `ptr_arg` e `needless_range_loop`, reparar: coerção de referências na chamada e empréstimos implícitos (`len()`, indexação) como leituras compartilhadas. Em paralelo, a configuração parte quase do zero: grupos padrão, escopos de `allow`/`warn`/`deny`/`expect`, `Cargo.toml [lints]` com prioridade, `clippy.toml`, `-D warnings`. O resto do objetivo (decidir aceitar ou suprimir) é a síntese dos dois fios.
