# Ludo

Aplicativo móvel de apoio à dessensibilização auditiva de crianças com Transtorno do Espectro Autista (TEA) e hipersensibilidade auditiva. O Ludo expõe a criança, de forma gradual e lúdica, a sons do cotidiano (despertador, televisão, pássaros, sinal da escola, buzina) organizados em uma trilha de cenários progressivos: quarto, sala, parque, rua e escola. A criança controla o volume dentro de um teto seguro e pode interromper a reprodução a qualquer momento, enquanto o responsável configura os limites e acompanha o progresso em uma área protegida.

Trabalho de Conclusão de Curso do curso de Tecnologia em Sistemas para Internet, UTFPR, 2026.

## O problema

A hipersensibilidade auditiva atinge parte significativa das crianças com TEA e transforma situações comuns (o sinal da escola, o liquidificador, a buzina na rua) em episódios de sofrimento e desregulação. As abordagens terapêuticas de exposição gradual costumam depender de acompanhamento presencial e de material improvisado pelo mediador, o que limita a frequência da prática e a consistência dos estímulos.

O Ludo propõe levar essa exposição controlada para o ambiente doméstico: sons reais, organizados por contexto e intensidade, apresentados dentro de limites definidos pelo responsável e com o controle de interrupção sempre à mão da criança.

## Objetivos

**Geral**: desenvolver um aplicativo móvel que apoie a dessensibilização auditiva gradual de crianças com TEA, mediada por um responsável.

**Específicos**:

- Organizar os estímulos sonoros em uma trilha de cenários progressivos, do ambiente mais familiar ao mais imprevisível.
- Garantir que a exposição ocorra sempre dentro de um teto de volume e de um tempo de sessão definidos pelo responsável.
- Manter o controle de interrupção acessível à criança durante toda a reprodução.
- Registrar o progresso e a utilização semanal, oferecendo ao mediador uma leitura objetiva da evolução.
- Assegurar funcionamento offline, já que o uso doméstico não pode depender de conexão estável.

## Como o app funciona

O Ludo atende dois perfis complementares:

- **Criança**: interface lúdica de carga cognitiva mínima, com a trilha de cenários, player com controle deslizante de volume, botão "Pare" em destaque, modo suave (frequências reduzidas) e reforço visual por progresso.
- **Responsável (mediador)**: área restrita com autenticação, configuração do volume máximo permitido, tempo de sessão (5 ou 10 minutos) e acompanhamento da utilização semanal.

## Stack

| Camada | Tecnologia |
|---|---|
| Aplicativo | React Native com Expo (SDK 56) e TypeScript |
| Navegação | Expo Router, com grupos de rotas `(child)` e `(parent)` |
| Interface | React Native Paper |
| Estado | Context API (`AuthContext`, `ProgressContext`) |
| Áudio | expo-av |
| Persistência local | Async Storage |
| API | REST em Node.js com TypeScript e Express |
| Banco de dados | PostgreSQL |
| Infraestrutura | Docker e Docker Compose |
| Testes | Jest com jest-expo e Testing Library no app, `node:test` com Supertest na API |

A stack segue o capítulo 4.4 do projeto do TCC. Durante a primeira fase, o PocketBase foi usado como backend provisório da área do responsável e continua ativo até o aplicativo passar a consumir a API. As decisões por trás dessas escolhas estão registradas em [docs/arquitetura.md](docs/arquitetura.md).

## Estrutura do repositório

```
app/            rotas do Expo Router, separadas em (child) e (parent)
components/     componentes de interface reutilizáveis
src/contexts/   estado compartilhado de autenticação e progresso
src/data/       definição dos cenários e dos sons de cada etapa
src/helpers/    utilitários de armazenamento local e notificações
src/services/   cliente HTTP do aplicativo
src/types/      contratos de dados da aplicação
assets/sounds/  áudios por cenário, em versão normal e suave
pb_migrations/  migrações das coleções do PocketBase (provisório)
__tests__/      testes de componentes
docs/           documentação do projeto

backend/
  src/          API REST: aplicação, rotas, middlewares e acesso ao banco
  migrations/   migrações SQL do PostgreSQL, aplicadas em ordem
  tests/        testes da API
```

## Como rodar

**Pré-requisitos**: Node.js 20 ou superior, Docker com Docker Compose e Expo Go no celular (ou um emulador Android/iOS).

### API e banco de dados

```
cd backend
cp .env.example .env
docker compose up --build
```

Antes de subir, troque no `.env` a senha do banco e o `JWT_SECRET` (um valor aleatório gerado com `openssl rand -hex 32`). O Compose sobe o PostgreSQL e a API, aplica as migrações pendentes e deixa a API em http://localhost:3333. Para conferir se está tudo de pé, acesse http://localhost:3333/health.

Para desenvolver a API fora do contêiner, com recarga automática, suba só o banco e rode a API pelo Node:

```
docker compose up -d db
npm install
npm run migrate
npm run dev
```

### Aplicativo

```
npm install
cp .env.example .env
npm start
```

Ajuste `EXPO_PUBLIC_API_URL` no `.env` e abra o QR Code no Expo Go, ou rode `npm run android` / `npm run ios`.

Enquanto a troca para a API não termina, a área do responsável ainda usa o PocketBase. Para subi-lo, baixe o executável em https://pocketbase.io/docs/ na raiz do projeto (ele é ignorado pelo versionamento) e rode `./pocketbase serve`; as coleções são criadas pelas migrações em `pb_migrations/`.

### Testes

```
npm test
cd backend && npm test
```

## Documentação

- [Arquitetura e decisões técnicas](docs/arquitetura.md): organização das camadas, modelo de dados e as razões de cada escolha.
- [Fluxo de trabalho](docs/fluxo-de-trabalho.md): convenção de branches, commits e pull requests adotada no projeto.

## Estado atual

A base funcional já cobre a autenticação do responsável, a trilha de cenários com bloqueio por etapa, o player com teto de volume e modo suave, e a visualização da utilização semanal. Os áudios em `assets/sounds/` ainda são arquivos reservados e serão substituídos por sons reais, em versão normal e suave para cada cenário.

A API já tem o banco PostgreSQL modelado conforme o projeto do TCC, orquestrado em Docker, e as rotas de cadastro, login, perfil e PIN do responsável, além do cadastro das crianças com volume máximo e tempo de sessão. Os próximos passos concentram-se nas rotas de histórico de sessões e progresso, na troca do PocketBase pela API no aplicativo e no sistema de recompensas visuais.

## Projeto relacionado

O mesmo aplicativo é o projeto semestral da disciplina de Desenvolvimento de Projetos para Dispositivos Móveis (2026/2), cuja documentação de checkpoints e planejamento de sprints vive em [ludo-movile-2026-2](https://github.com/lanamaiumy/ludo-movile-2026-2). Este repositório é o canônico do Ludo e concentra a evolução do código e os artefatos do TCC.
