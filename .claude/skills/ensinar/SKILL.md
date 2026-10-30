---
name: ensinar
description: Dá UMA lição do mapa do tópico, um passo de raciocínio por vez, no ciclo prever → ensinar → verificar, reparando confusões antes de avançar. Escreve a nota da lição e atualiza o grafo no fim.
argument-hint: <topico> [numero-da-licao]
model: sonnet
---

# Ensino: uma lição

Siga o CLAUDE.md (início e fim de sessão, voz, fidelidade, perguntas, gabarito).

- **Lição:** a indicada no argumento ou em `TOPICO.md › Próxima lição`.
- **Registro:** `sessoes/AAAA-MM-DD-ensinar-NN.md`.
- **Nota:** `licoes/NN-<slug>.md`.
- **Pré-requisito:** `mapa.md` aprovado.

**Antes de tudo:** se `TOPICO.md` tiver confusões em aberto das quais esta lição depende, a sessão começa reparando essas confusões. Se o reparo tomar a sessão inteira, essa passa a ser a lição.

## Um passo por vez

O mapa é a paisagem; o ensino é a estrada. Cada passo leva a pessoa de algo que ela já tem como obviamente verdadeiro ao fato seguinte, por **um** movimento motivado. Assim o fato novo não apenas decorre: ele *assenta* como óbvio.

1. **Um passo, um fato.** Pequeno o bastante para ser entendido de uma vez. Se precisa de duas explicações, são dois passos.
2. **Apresente na forma de máxima absorção:**
   - Uma verdade incondicional fundacional muitas vezes é melhor simplesmente afirmada, com fonte.
   - Um passo derivado é construído a partir do que ela já tem: narrado, ou extraído dela de forma socrática.
   - Traga as coisas quando elas resolvem algo.
3. **A conexão se sustenta sozinha** no fluxo da prosa. Não anuncie a coreografia ("agora vou estabelecer X e depois ligar a Y"). Não rotule as mensagens como capítulos do mapa ("Nó 3: …").
4. **Verifique se o passo assentou, em todo passo.** Um erro quer dizer que não assentou: diagnostique, repare, reforce, antes de construir qualquer coisa em cima. Nunca construa sobre um passo que ela não demonstrou.

Pegue a si mesmo afirmando algo que ela teria de aceitar por fé. Quando isso acontecer, escolha um:
- facilite a aceitação, motivando ou ancorando no que ela já tem;
- verifique antes de construir em cima.

Se uma resposta te deixar inseguro sobre onde está a borda dela, refaça a busca com perguntas curtas antes de escolher o próximo passo.

Verbosidade é custo, não ensino: o método é uma disciplina interna, e a saída é ensino enxuto.

## O ciclo: prever → ensinar → verificar

**prever → previsão dela → ensino que resolve a previsão → verificação → resposta dela → sua reação → próxima previsão.** Uma pergunta por turno, nessa ordem.

### Previsão (antes do passo; motivação)
- Feita **antes** de ensinar o passo, num turno próprio. O assunto é o próximo passo, ainda não ensinado. Ela não precisa ser respondível pelo que já foi visto, e tentar é o objetivo.
- A forma é um empurrão, não um teste. Aponte o problema com o estado atual ("isso funciona, mas não sobrevive a X — o que você acha que tem que ceder?") e deixe-a tentar descobrir o passo. Não revele mais nada.
- Também pede Resposta/Raciocínio/Confiança, com gabarito comprometido.
- Quando a previsão voltar, **abra o ensino resolvendo-a explicitamente**: o que ela previu, o que é verdade e por quê. A correção cai em cima da tentativa dela.
- Pule a previsão quando não houver próximo passo significativo a antecipar (fechamento, turno de reparo puro). Nunca deixe pular virar hábito.

### Verificação (depois do passo; dado para você)
- Só depois que a prosa do passo estiver **completa**: explicação, derivação, exemplo. Nunca no meio de uma explicação.
- Respondível por raciocínio a partir do que a sessão cobriu. Nunca exija algo fora dela.
- Nunca é só repetir suas palavras. **Prefira aplicação**: um caso novo, uma previsão, uma extensão. Recordação honesta é o recurso de reserva, não o hábito.
- Projetada para que o erro **nomeie o modelo errado**. Cada distrator é a resposta sob uma concepção errada específica; em resposta livre, as próprias palavras dela revelam o modelo.
- O veredito decide: continuar, reparar ou reesclarecer.

### Reparar
- Diagnostique o modelo errado a partir do raciocínio. Registre-o em `TOPICO.md › Confusões em aberto`.
- Repare um passo por vez, no mesmo ritmo de sempre. Nada de muro de texto que "cobre" o buraco para voltar ao plano.
- Verifique de novo com **outra superfície**. Feche a confusão só com acerto e raciocínio sólido.
- Se o reparo revelar um fundamento faltando, replaneje (`/planejar`, seção Replanejar).
- Desvios não são interrupções: eles são o ensino.

## A nota da lição (`licoes/NN-<slug>.md`)

Escreva-a ao longo da sessão. É a versão limpa, para reler:

```markdown
# Lição NN — <título>
Nós do mapa: `slug-a`, `slug-b` · Sessão: `ses_<topico>_AAAAMMDD_ensinar-NN`

## Passo 1 — <título curto> <a id="m-NN-1"></a>
Motivação, o fato, a derivação em LaTeX:
$$ … $$
(fonte: livro.pdf, p. 34)  |  [derivado]  |  [sem fonte · 80%]

## Passo 2 — … <a id="m-NN-2"></a>
…
## Confusões encontradas e como foram reparadas
## Resumo: a cadeia
Do que já se tinha ⇒ … ⇒ objetivo da lição (Mermaid se ajudar).
```

As âncoras `m-NN-k` são o `messageId` da proveniência no grafo.

## Encerrar

Uma lição por sessão. Ao chegar ao fim dela (ou ao parar), não comece a próxima. Faça o fim de sessão do CLAUDE.md:
- grafo via `/revisar-grafo`;
- `TOPICO.md` com a próxima lição;
- `mapa.md`, marcando os nós da lição como `visto`, o próximo como `atual` e confusões abertas como `reparo`;
- resumo do que mudou.
