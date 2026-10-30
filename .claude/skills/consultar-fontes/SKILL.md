---
name: consultar-fontes
description: Consulta várias fontes do tópico (e URLs, se preciso) sobre uma pergunta, com um subagente leitor-fonte por fonte rodando em paralelo e um agregador-fontes no fim. Reduz o viés de fonte única e mantém PDFs grandes fora do contexto da conversa.
argument-hint: <topico> "<pergunta>"
---

# Consultar fontes

## Quando usar
- Ao **planejar**: para delimitar o campo, as definições e as verdades incondicionais a partir de todas as fontes.
- Quando a resposta depende de **duas ou mais fontes**, ou de uma fonte **grande** (PDF com mais de 30 páginas).
- Para **verificar** uma afirmação marcada `[sem fonte]` ou uma afirmação empírica.

Uma fonte pequena, que responde direto, você lê sozinho: um agente custa mais que um Read.

## Passos
1. **Formule a pergunta de forma neutra.** Pergunte o que a fonte diz sobre X, sem a resposta que você espera. Por exemplo: "Como a fonte define e motiva o determinante, e quais propriedades deriva primeiro?". Não escreva "Confirme que o determinante é o fator de escala de volume". Uma pergunta que sugere a resposta reintroduz o viés que este comando existe para tirar.
2. **Escolha as fontes:** liste `<topico>/fontes/` e `grafo/sources.json`. Fique com as relevantes pelo título, pelo sumário ou por um grep rápido, no máximo 5 a 6. Se faltar uma referência externa para uma afirmação empírica, uma ou duas URLs confirmadas por busca podem entrar como fontes também.
3. **Leitores em paralelo:** dispare um subagente `leitor-fonte` por fonte, **todos na mesma mensagem**, para rodarem ao mesmo tempo. Cada prompt leva só:
   - o caminho absoluto da fonte (ou a URL);
   - a pergunta neutra;
   - nada sobre as outras fontes, o plano ou a pessoa.
4. **Agregador:** quando todos voltarem, dispare um `agregador-fontes` com a pergunta e os resumos completos, rotulados pelo nome da fonte. Com uma única fonte, pule o agregador.
5. **Use o resultado:**
   - **consenso e afirmações de fonte única** podem ser ensinadas com as citações;
   - **divergências** são ensinadas como divergências, com as hipóteses de cada fonte, e muitas vezes são um ótimo material de ensino;
   - **lacunas** viram `[sem fonte · NN%]` ou pedem mais uma fonte;
   - a **avaliação do agregador** nunca vale como fonte.
6. **Guarde** a síntese em `<topico>/sessoes/AAAA-MM-DD-fontes-<slug>.md`, para servir de referência e para a proveniência no grafo (`messageId` = esse arquivo com âncora de seção). Não repita a síntese inteira na conversa: diga em 2 a 4 linhas o que mudou no plano ou na lição.
