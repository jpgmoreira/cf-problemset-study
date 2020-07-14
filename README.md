# CF Problemset Study

Este programa foi criado como uma alternativa para interagir com o [problemset do Codeforces](https://codeforces.com/problemset). As informações sobre os problemas são obtidas usando a [API do Codeforces](https://codeforces.com/apiHelp).

O programa sugere um problema aleatório para o usuário resolver. Permite filtrar problemas por:
- Lista de tags.

- Rating mínimo e máximo.

- Página mínima e máxima.

  

## Instruções

Para rodar o programa, é necessário ter o [Node.js](https://nodejs.org/en/) instalado na sua máquina.

1. Clone ou faça o download deste repositório para a sua máquina.
2. Abra um terminal e execute o comando `npm install` para instalar as dependências do programa.
3. Para iniciar o programa execute o comando `npm start`.

&rarr; O botão *Download Problemset* no menu superior faz o download do problemset atualizado do Codeforces. Novos problemas são adicionados com frequência, então recomendo refazer o download do problemset regularmente. O download é feito para um arquivo *problemset.json* no diretório do programa.

&rarr; Filtro por tags: Listar tags usando ponto e vírgula (;). Filtra problemas que contenham **todas** as tags listadas.

&rarr; Filtro por página: Considera o problemset ordenado do mais resolvido para o menos resolvido. Cada página do problemset do Codeforces contém 100 problemas, com exceção possivelmente da última.

&rarr; Valores de min e max nos filtros por rating e página são inclusivos.

---

Ao sugerir um problema o programa mostra a sua identificação, suas tags, e informações que ajudam a saber o nível de dificuldade do problema:
- Identificação do problema (id do contest e o index do problema, seguido pelo nome) em azul. Ao clicar, o link para o problema é copiado para o clipboard, basta colar no navegador e acessar.

- Rating (dificuldade) do problema.

- Quantidade de usuários que resolveram o problema.

- *Solved Rank*: Posição do problema, considerando os problemas do mais resolvido para o menos resolvido (posição 0: problema mais resolvido do problemset).

- Número da página em que se encontra o problema no problemset ordenado.

- Tags do problema, escondidas ou exibidas usando um checkbox.

  

## Dica para Linux

Como o programa é chamado pelo terminal (comando `npm start`) , depois de aberta a janela do programa fica um terminal sem uso aberto atrapalhando. O que eu fiz para me livrar deste terminal foi instalar o [GNU screen](https://www.gnu.org/software/screen/), e no final do arquivo .bashrc no meu diretório home, colocar a seguinte função:
```
noterm() {
    screen -dm "$@" & exit
}
```
Agora, ao invés de chamar o programa com `npm start`, chamo com `noterm npm start`, que ele fecha o terminal e logo em seguida abre a janela do programa.

