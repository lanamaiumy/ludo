import { createApp } from './app';
import { env } from './config/env';
import { pool } from './database/pool';

const app = createApp(pool);

app.listen(env.port, () => {
  console.log(`API do Ludo rodando na porta ${env.port}`);
});
