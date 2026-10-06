import { createApp } from './app';
import { env } from './config/env';
import { pool } from './database/pool';

const app = createApp({ db: pool, jwtSecret: env.jwtSecret });

app.listen(env.port, () => {
  console.log(`API do Ludo rodando na porta ${env.port}`);
});
