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
| Persistência local | Async Storage (SQLite previsto) |
| Backend | PocketBase (autenticação e coleções `users` e `children`) |
| Testes | Jest com jest-expo e Testing Library |

As decisões por trás dessas escolhas estão registradas em [docs/arquitetura.md](docs/arquitetura.md).

## Estrutura do repositório

```
app/            rotas do Expo Router, separadas em (child) e (parent)
components/     componentes de interface reutilizáveis
src/contexts/   estado compartilhado de autenticação e progresso
src/data/       definição dos cenários e dos sons de cada etapa
src/helpers/    utilitários de armazenamento local e notificações
src/services/   cliente HTTP e integração com o PocketBase
src/types/      contratos de dados da aplicação
assets/sounds/  áudios por cenário, em versão normal e suave
pb_migrations/  migrações das coleções do PocketBase
__tests__/      testes de componentes
docs/           documentação do projeto
```

## Como rodar

**Pré-requisitos**: Node.js 20 ou superior, Expo Go no celular (ou um emulador Android/iOS) e o executável do PocketBase para a área do responsável.

```
npm install
cp .env.example .env
npm start
```

Ajuste `EXPO_PUBLIC_API_URL` no `.env` para o endereço do seu PocketBase e abra o QR Code no Expo Go, ou rode `npm run android` / `npm run ios`.

Para subir o backend local, baixe o executável em https://pocketbase.io/docs/ na raiz do projeto (ele é ignorado pelo versionamento) e inicie:

```
./pocketbase serve
```

O painel fica em http://127.0.0.1:8090/_/ e as coleções são criadas automaticamente pelas migrações em `pb_migrations/`.

Para rodar os testes:

```
npm test
```

## Documentação

- [Arquitetura e decisões técnicas](docs/arquitetura.md): organização das camadas, modelo de dados e as razões de cada escolha.
- [Fluxo de trabalho](docs/fluxo-de-trabalho.md): convenção de branches, commits e pull requests adotada no projeto.

## Estado atual

A base funcional já cobre a autenticação do responsável, a trilha de cenários com bloqueio por etapa, o player com teto de volume e modo suave, e a visualização da utilização semanal. Os áudios em `assets/sounds/` ainda são arquivos reservados e serão substituídos por sons reais, em versão normal e suave para cada cenário.

Os próximos passos concentram-se na persistência local com SQLite, na validação de formulários com Zod e no sistema de recompensas visuais.

## Projeto relacionado

O mesmo aplicativo é o projeto semestral da disciplina de Desenvolvimento de Projetos para Dispositivos Móveis (2026/2), cuja documentação de checkpoints e planejamento de sprints vive em [ludo-movile-2026-2](https://github.com/lanamaiumy/ludo-movile-2026-2). Este repositório é o canônico do Ludo e concentra a evolução do código e os artefatos do TCC.
