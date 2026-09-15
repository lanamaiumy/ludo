# Fluxo de trabalho

O Ludo é desenvolvido por uma pessoa só, mas o histórico do repositório é parte da entrega do TCC: ele precisa mostrar como o trabalho evoluiu, não apenas onde chegou. Por isso nada é commitado direto na `main` — toda mudança passa por uma branch e por um pull request que explica a decisão em texto corrido.

## Branches

A `main` está sempre estável e reflete o que funciona. Cada frente de trabalho sai dela em uma branch curta, com nome no formato `tipo/assunto-em-kebab-case`:

| Prefixo | Quando usar |
|---|---|
| `feat/` | Funcionalidade nova visível para a criança ou para o responsável |
| `fix/` | Correção de comportamento que já deveria funcionar |
| `refactor/` | Reorganização interna sem mudança de comportamento |
| `docs/` | Documentação, README, artefatos do TCC |
| `test/` | Inclusão ou ajuste de testes |
| `chore/` | Dependências, configuração, infraestrutura do repositório |

Exemplos: `feat/persistencia-sqlite`, `fix/teto-de-volume-no-modo-suave`, `docs/capitulo-metodologia`.

Branches curtas são uma escolha consciente: quanto menor o intervalo entre sair da `main` e voltar para ela, menor o conflito e mais legível fica cada pull request para quem for avaliar o trabalho depois.

## Commits

A convenção segue o padrão de commits convencionais, com a descrição em português e no imperativo:

```
tipo(escopo opcional): descricao curta em minusculas

Corpo opcional, explicando o motivo da mudanca quando a
descricao curta nao for suficiente.
```

Um commit deve contar uma unidade de trabalho completa. Vale mais um commit que entrega o teto de volume funcionando do que três commits que só fazem sentido juntos.

## Pull requests

Cada branch vira um pull request antes de entrar na `main`. O template em `.github/PULL_REQUEST_TEMPLATE.md` é preenchido em texto corrido, não em tópicos soltos: o objetivo é que, meses depois, a leitura do PR reconstrua o porquê da mudança — a alternativa considerada, a restrição que pesou, o que ficou de fora de propósito.

Antes de abrir o PR:

```
npm test
```

Depois do merge, a branch é apagada. O registro do trabalho fica no pull request, não na lista de branches.

## Ciclo completo

```
git checkout main
git pull
git checkout -b feat/persistencia-sqlite

# desenvolvimento e commits

npm test
git push -u origin feat/persistencia-sqlite

# abrir o pull request, preencher o template e fazer o merge
```
