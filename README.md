# Ludo

Aplicativo móvel de dessensibilização auditiva para crianças com Transtorno do Espectro Autista (TEA). O Ludo expõe a criança, de forma gradual e lúdica, a sons do cotidiano (despertador, televisão, pássaros, sinal da escola, buzina) organizados em cenários progressivos. A criança ouve cada som controlando o volume e podendo ativar um modo suave; o responsável acessa uma área protegida por PIN, define o volume máximo e o tempo das sessões e acompanha a utilização semanal.

## Stack

- React Native com Expo (TypeScript)
- Expo Router
- React Native Paper
- Context API (acesso dos pais e progresso)
- Async Storage
- expo-av (áudio)
- Axios
- PocketBase (backend)
- Jest (testes)

## Pré-requisitos

- Node.js 20 ou superior
- Expo Go no celular ou um emulador Android/iOS
- PocketBase para a área do responsável

## Instalação

```
npm install
cp .env.example .env
```

Ajuste a variável `EXPO_PUBLIC_API_URL` no arquivo `.env` para o endereço do seu PocketBase.

## Como rodar o aplicativo

```
npm start
```

Em seguida abra no Expo Go (QR Code) ou rode `npm run android` / `npm run ios`.

## Como rodar o PocketBase local

1. Baixe o executável em https://pocketbase.io/docs/
2. Inicie o servidor:

```
./pocketbase serve
```

3. Acesse o painel em http://127.0.0.1:8090/_/ e configure as coleções:

Coleção `users` (tipo Auth — já existe) com os campos extras:

- `name` (texto)
- `child_name` (texto)
- `max_volume` (número)
- `session_time` (número)

Coleção `children` (tipo Base) com as regras de acesso restritas ao dono (ex.: `@request.auth.id != "" && user = @request.auth.id`):

- `user` (relação com `users`)
- `name` (texto)
- `age` (número)
- `notes` (texto)

A área dos pais é protegida por **login** (e-mail e senha). O token retornado é guardado no aparelho (Async Storage); ao reabrir o app, a sessão é restabelecida sem pedir as credenciais novamente.

## Como rodar os testes

```
npm test
```

## Áudios

Os arquivos em `assets/sounds/` são espaços reservados. Substitua pelos sons reais (por exemplo, de bancos gratuitos como freesound.org), mantendo uma versão normal e uma versão suave para cada cenário.
