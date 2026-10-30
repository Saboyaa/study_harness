# Formato do grafo

Compatível com o formato **v1** do LearnHarness (`learnharness/skills/learnharness/references/data-format.md`). Há dois campos extras opcionais nos nós, `fonte` e `confianca`. Os leitores do LearnHarness ignoram campos que não conhecem.

Cada tópico tem a sua pasta `grafo/`:

```text
grafo/nodes.jsonl    uma linha JSON por asserção de proposição (o mesmo id pode repetir)
grafo/chains.jsonl   uma linha JSON por asserção de cadeia de raciocínio
grafo/sources.json   fontes registradas: {"src_…": {id, filePath, importedAt}}
grafo/format.json    {"version": 1}
```

## Proposição (`nodes.jsonl`)

```json
{"id":"n_3fa9c1d2e0","name":"Derivada como limite","statement":"A derivada de $f$ em $a$ é $f'(a)=\\lim_{h\\to 0}\\frac{f(a+h)-f(a)}{h}$, quando o limite existe.","aliases":[],"createdAt":"2026-10-30T18:00:00+00:00","provenance":[{"chatId":"ses_calculo_20261030_ensinar-01","messageId":"licoes/01-derivada.md#m-01-2"}],"fonte":"src_ab12cd34ef56 p. 87"}
```

| Campo | Significado |
|---|---|
| `id` | `n_` + 10 hex (`python3 ferramentas/grafo.py id n`). Estável. |
| `name` | rótulo curto de exibição, que não identifica o nó |
| `statement` | a proposição completa, verdadeira e autocontida. É a âncora de identidade. |
| `aliases` | outras formulações da mesma proposição |
| `createdAt` | ISO 8601 |
| `provenance` | lista de `{chatId, messageId}`: onde a proposição apareceu |
| `fonte` *(extra)* | `"src_… p. N"` / `"src_… §X"` · `"derivado"` · `"sem fonte"` |
| `confianca` *(extra)* | inteiro 0–100, obrigatório quando `fonte` é `"sem fonte"` |

**Regras de fusão (iguais às do LearnHarness):**
- A **primeira linha** de um id define `name`, `statement`, `createdAt` e, aqui, também `fonte`/`confianca`.
- As linhas seguintes com o mesmo id são *links*: o `statement` e os `aliases` delas entram nos aliases e a `provenance` se une.
- Para registrar um novo encontro com um nó existente, acrescente:

```json
{"id":"n_3fa9c1d2e0","name":"","statement":"","aliases":["f'(a) é a inclinação da reta tangente"],"createdAt":"2026-11-02T…","provenance":[{"chatId":"ses_calculo_20261102_praticar","messageId":"sessoes/2026-11-02-praticar.md#p3"}]}
```

**Mudar o status de fonte depois:** a primeira linha nunca é editada. Quando uma pendência sem fonte for resolvida (achou-se a fonte ou ela se mostrou falsa), registre o desfecho em `TOPICO.md` e, se for preciso, crie um nó novo com a formulação correta e a fonte. Corrigir um nó falso é a única edição permitida, e só com a aprovação da pessoa.

## Cadeia (`chains.jsonl`)

```json
{"id":"arg_9b1e22c7aa","premises":["n_3fa9c1d2e0","n_77c0a1b2c3"],"conclusion":"n_0d4e5f6a7b","createdAt":"…","provenance":[{"chatId":"…","messageId":"…"}]}
```

- As premissas são usadas **em conjunto** para chegar à conclusão.
- Argumentos independentes para a mesma conclusão são cadeias separadas.
- A identidade de uma cadeia é (premissas ordenadas, conclusão). Repetições se fundem pela proveniência.
- Arestas não são gravadas: quem desenha o grafo deriva `premissa → implicação → conclusão`.

## Proveniência

| `chatId` | `messageId` |
|---|---|
| `ses_<topico>_<AAAAMMDD>_<fase>` (ex.: `ses_calculo_20261030_ensinar-01`) | âncora na nota da lição (`licoes/01-derivada.md#m-01-2`) ou no registro (`sessoes/2026-10-30-praticar.md#p3`) |
| `src_…` (proposições extraídas direto de uma fonte, sem sessão) | `""` |

## Fontes (`sources.json`)

`id` = `src_` + os 12 primeiros hex do sha256 do caminho relativo à pasta do tópico (por exemplo `fontes/stewart-cap2.pdf`). O LearnHarness usa a mesma ideia com o caminho absoluto. Para registrar: `python3 ferramentas/grafo.py fonte <topico> fontes/<arquivo>`.

## O que não vai para o grafo

O estado de quem aprende: acertos, confiança, confusões, domínio. Isso fica em `TOPICO.md`, `sondagem.md` e `sessoes/`. O grafo guarda apenas ideias verdadeiras e como elas derivam umas das outras.

## Diferença de nome de pasta

O LearnHarness espera `<data>/graph/`. Aqui a pasta se chama `grafo/`. O conteúdo é o mesmo formato, mas, para usar os leitores do LearnHarness, seria preciso apontá-los para uma pasta com o nome `graph` (uma cópia ou um link simbólico). Isso não foi testado.
