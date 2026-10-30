---
name: sondar
description: Sondagem de um tópico — torna o objetivo concreto e mede, por busca binária, onde termina o que a pessoa sabe em cada fio de dependência. Produz sondagem.md.
argument-hint: <topico>
model: sonnet
---

# Sondagem

Siga o CLAUDE.md (início de sessão, voz, fidelidade, formato de perguntas e gabarito). Registro: `sessoes/AAAA-MM-DD-sondar.md`.

Sua tarefa são duas medições: **o que a pessoa precisa aprender** (o objetivo) e **o que ela já sabe** (um mapa detalhado e exato do entendimento dela). A lição inteira será planejada a partir desse mapa, então ele precisa ser preciso. Aqui você **não ensina**. Revelar a resposta correta depois de cada pergunta é permitido, de forma breve e sem aula, e só depois de receber o bloco Resposta/Raciocínio/Confiança.

Trabalhe estritamente com uma pergunta por vez.

## 1. Leia o mapa persistente
Veja o grafo e as sessões anteriores do tópico (e de tópicos vizinhos, se forem relevantes). Um fio já sólido não precisa ser sondado de novo.

## 2. Torne o objetivo concreto
"Quero entender X" pode querer dizer dez coisas diferentes, e qual delas muda tudo. Faça perguntas até o objetivo ficar concreto: o que ela quer conseguir fazer ou explicar no final, em que contexto, com que profundidade. Pergunte, não oriente. Se ela não conhece o terreno, registre que o objetivo começa por orientação, sem desenhar o mapa no lugar dela. Use as fontes para ancorar o objetivo, por exemplo "até o Teorema 4.2 do capítulo 4".

## 3. Raciocine sobre os fios
A partir do objetivo: de que a lição vai depender? Onde o ensino começaria e sobre o que precisa se apoiar? Cada dependência é um fio, e o único critério para ele existir é a relevância.

## 4. Busca binária em cada fio
A borda de um fio é encontrada entre um **piso** (algo que ela acerta com segurança) e um **teto** (algo que ela erra ou não sabe). Escolha cada próxima pergunta pela evidência: o veredito, a confiança e o raciocínio, juntos.

- **Entre perto do topo, não da base.** Um adulto buscando material avançado quase sempre domina o básico escolar. Comece perto da coisa mais difícil de que o objetivo precisa e deixe os erros te fazerem descer.
- **Os fios se informam.** Um fio dominado no alto indica que os vizinhos também começam alto.
- Certa e com confiança: suba bastante a dificuldade. Quanto maior o salto, menos perguntas.
- Certa mas hesitante (confiança baixa, raciocínio ralo): é frágil. Suba devagar e caracterize a insegurança.
- Errada: o teto desce. Aperte de volta para localizar exatamente onde ele fica.
- Um erro é uma coordenada, não um veredito: deslize, lacuna e concepção errada parecem iguais. Sonde em volta. Concepções erradas importam mais: investigue a extensão delas antes de seguir.
- Fio que nunca quebra não está pronto: escale até quebrar.

Cada pergunta precisa mover alguma borda. Nada de enchimento, nada de repetir o que a última resposta já mostrou. Prefira perguntas de aplicação a perguntas de recitação. Em matemática, peça um passo de derivação ou um cálculo curto.

## 5. Conclua
Quando todos os fios tiverem piso e teto e o objetivo estiver concreto, escreva `sondagem.md`:

```markdown
# Sondagem — <data>
## Objetivo (concreto)
…
## Fios
### <nome do fio>
- Piso: … (evidência: pergunta S3)
- Teto: … (evidência: S5)
- Concepções erradas: …
- De onde construir: …
## Síntese
Onde o ensino deve entrar.
```

Concepções erradas encontradas também vão para `TOPICO.md › Confusões em aberto`. Atualize o objetivo em `TOPICO.md`, faça o fim de sessão (o grafo recebe só as proposições verdadeiras que surgiram ao revelar respostas, com proveniência desta sessão) e indique `/planejar <topico>`.
