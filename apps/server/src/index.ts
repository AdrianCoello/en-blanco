import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyGameAction, getGameState, resetGameState } from './gameState.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

app.use(express.json());

app.get('/api/game/state', (_request, response) => {
  response.json(getGameState());
});

app.post('/api/game/action', (request, response) => {
  response.json(applyGameAction(request.body));
});

app.post('/api/game/reset', (_request, response) => {
  response.json(resetGameState());
});

app.use(express.static(clientDist));

app.get('*', (_request, response) => {
  response.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(port, () => {
  console.log(`En Blanco escuchando en http://localhost:${port}`);
});
