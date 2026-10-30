---
name: novo-topico
description: Cria a pasta de um novo tópico de estudo a partir de _modelo/ e registra as fontes. Use quando a pessoa quiser começar a estudar um assunto novo.
argument-hint: <nome-do-topico>
---

# Novo tópico

1. Nome da pasta: o argumento em minúsculas, sem acento, palavras separadas por hífen (`algebra-linear`). Se a pasta já existir, não sobrescreva — avise e pare.
2. Copie o modelo: `cp -r _modelo <topico>`.
3. Pergunte, numa só mensagem curta: o que a pessoa quer conseguir entender ou fazer (rascunho de objetivo — a `/sondar` vai torná-lo concreto) e se já há material para colocar em `<topico>/fontes/`.
4. Preencha o título e o "Objetivo (rascunho)" em `<topico>/TOPICO.md`.
5. Para cada arquivo já presente em `fontes/`, registre-o em `grafo/sources.json`:
   `python3 ferramentas/grafo.py fonte <topico> fontes/<arquivo>`
6. Diga o próximo passo: colocar fontes em `<topico>/fontes/` (se ainda não houver) e rodar `/sondar <topico>`.
