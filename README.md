# Flix Player

Projeto desenvolvido em grupo para avaliacao e pratica na disciplina de Desenvolvimento Web do curso de Ciencia da Computacao da UFC.

O Flix Player e uma aplicacao web inspirada em plataformas de streaming, com autenticacao de usuarios, consulta de filmes e series, paginas de detalhes, player incorporado, favoritos, historico, avaliacoes e area administrativa.

## O que foi feito

- Front-end em Next.js com React, TypeScript e Tailwind CSS.
- Back-end em Node.js com Express e MongoDB.
- Autenticacao com JWT, cadastro, login e persistencia de sessao no navegador.
- Perfis de usuario com papeis `user` e `manager`.
- Planos de uso `free`, `basic` e `pro`, com limites configurados no back-end.
- Integracao com a API do TMDB para busca, listagem, generos, detalhes, elenco e conteudos similares.
- Proxy interno no Next.js para chamadas ao TMDB, incluindo idioma `pt-BR` e cache.
- Integracao com VidLink para exibicao de filmes e episodios.
- Funcionalidades de favoritos, historico de visualizacao e avaliacoes.
- Area administrativa para gerenciamento de contas e conteudos bloqueados.
- Blacklist de conteudos, aplicada nas buscas/listagens e no acesso direto a filmes ou series.
- Documentacao da API com Swagger.
- Seed para criacao de um usuario gerente inicial.

## Tecnologias

### Front-end

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- Zustand

### Back-end

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Swagger
- Jest e Supertest

## Estrutura do projeto

```text
flix-player/
  front-end/   Aplicacao web em Next.js
  back-end/    API REST em Express
```

No front-end ficam as telas de autenticacao, pagina inicial, busca, navegacao por filmes/series, favoritos, configuracoes, paginas de conteudo e area administrativa.

No back-end ficam os modulos de autenticacao, usuarios, favoritos, historico, avaliacoes e administracao, alem dos modelos do MongoDB e middlewares de seguranca/validacao.

## Como executar

### 1. Back-end

Entre na pasta do back-end:

```bash
cd back-end
npm install
```

Crie um arquivo `.env` com as variaveis:

```env
PORT=3001
MONGO_URI=sua_string_de_conexao_mongodb
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=7d
MANAGER_BOOTSTRAP_PASSWORD=senha_opcional_para_gerente
```

Execute a API:

```bash
npm run dev
```

Opcionalmente, crie o usuario gerente inicial:

```bash
npm run seed
```

Credenciais criadas pelo seed:

```text
email: admin@flix.com
senha: Admin@123
```

A API fica disponivel em:

```text
http://localhost:3001
```

A documentacao Swagger fica disponivel em:

```text
http://localhost:3001/docs
```

### 2. Front-end

Em outro terminal, entre na pasta do front-end:

```bash
cd front-end
npm install
```

Crie um arquivo `.env.local` com as variaveis:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
TMDB_API_KEY=sua_chave_da_tmdb
```

Execute a aplicacao:

```bash
npm run dev
```

O front-end fica disponivel em:

```text
http://localhost:3000
```

## Scripts uteis

### Back-end

```bash
npm run dev     # executa com nodemon
npm start       # executa em modo normal
npm test        # executa os testes
npm run seed    # cria usuario gerente inicial
```

### Front-end

```bash
npm run dev     # executa ambiente de desenvolvimento
npm run build   # gera build de producao
npm start       # executa build de producao
npm run lint    # executa lint
```

## Observacoes

Este projeto tem finalidade academica, com foco na pratica de desenvolvimento web full stack, integracao entre front-end e back-end, consumo de APIs externas, autenticacao, persistencia de dados e organizacao de uma aplicacao em modulos.
