---
name: revisar-grafo
description: Extrai as proposições e cadeias de raciocínio de uma sessão (ou de notas/fontes) e as funde no grafo do tópico, no formato LearnHarness v1, com resumo do que mudou. Roda no fim de toda sessão.
argument-hint: <topico> [arquivo de sessão ou nota]
---

# Revisar o grafo

Formato: `docs/formato-grafo.md`. Material de entrada:
- o arquivo indicado no argumento; ou
- a nota da lição e o registro da sessão atual.

Leia o grafo atual antes de começar.

## 1. Extração

O objetivo é descobrir as **ideias centrais** do material e mostrar como tudo deriva dos fundamentos. O entregável tem duas partes: as ideias e as cadeias que as derivam.

- **Cadeia** = premissas que **juntas** implicam a conclusão. Só a implicação justifica uma cadeia. Conexão histórica ou narrativa ("fulano argumentou", "a exposição segue") não é cadeia.
- **Direção para cima**: os fundamentos ficam embaixo e cada cadeia mostra a conclusão saindo de algo mais estabelecido.
- **O grafo guarda só ideias VERDADEIRAS sobre o mundo.** Nunca "a pessoa entende X", e sim X. Uma concepção errada entra como sua correção verdadeira.
- Cada `statement` é uma ideia autocontida, com precisão total e legível por alguém que nunca viu a sessão. Não use numeração da aula, rótulos de passo nem "como vimos". Matemática em LaTeX.
- Extraia as ideias que sustentam o assunto, o que um livro de referência ensinaria. Exemplos, glosas de notação e reformulações de que nenhum argumento precisa ficam de fora.
- Construa sobre o grafo existente: referencie nós existentes pelo `id` em vez de reescrevê-los e prefira premissas já estabelecidas. Não rederive uma conclusão que o grafo já tem, a menos que a rota seja realmente diferente.
- Argumentos independentes para a mesma conclusão são cadeias separadas.

**Fidelidade:** cada nó novo recebe `fonte`:
- `"src_… p. N"` ou `"src_… §X"` quando vem das fontes;
- `"derivado"` quando é conclusão de uma cadeia cujas premissas têm fonte ou são derivadas;
- `"sem fonte"` com `confianca` (0–100) nos demais casos.

Nunca invente uma localização de fonte: confira na fonte.

## 2. Identidade (o papel do auditor)

Para cada proposição extraída, pergunte se um nó **existente** já afirma a mesma proposição. Procure com `python3 ferramentas/grafo.py buscar <topico> "<termo>"` e leia os candidatos.

- **Viés de equivalência:** paráfrases, reformulações e compressões da mesma afirmação **fundem**. Só afirmações genuinamente diferentes sobre o mundo ficam separadas.
- Se fundir: acrescente uma linha de *link* com o mesmo `id` do nó existente. O `statement` dessa linha vira alias e a proveniência se une. O nome continua o da primeira linha.
- Se não fundir: crie um nó novo com `python3 ferramentas/grafo.py id n`.
- Procure também em outros tópicos, se forem vizinhos. Um nó de outro tópico não é copiado; cite-o no resumo como conexão possível.

## 3. Fusão (só acrescentar)

- Acrescente as linhas em `grafo/nodes.jsonl` e `grafo/chains.jsonl`. **Nunca edite nem apague linhas existentes.** A única exceção é corrigir um erro factual descoberto, e ela exige a aprovação explícita da pessoa e uma explicação no resumo.
- `chatId` = id da sessão (`ses_<topico>_AAAAMMDD_<fase>`). `messageId` = a âncora (`licoes/NN-slug.md#m-NN-k` ou `sessoes/…#pK`).
- Fontes novas em `fontes/`: `python3 ferramentas/grafo.py fonte <topico> fontes/<arquivo>`.
- Valide: `python3 ferramentas/grafo.py validar <topico>`. Corrija qualquer erro antes de seguir.

## 4. Resumo do que mudou

```
Grafo de <topico> — sessão <id>
+ N nós novos: <nome> (fonte) …
~ M nós com nova proveniência: …
+ K cadeias: [A ∧ B ⇒ C] …
! sem fonte: <nome> (NN%) — ver Pendências
↔ conexões com outros tópicos: …
```
