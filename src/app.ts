import express from 'express';
import { errorMiddleware } from './middleware/error.middleware.js';
import { sendSuccess } from './utils/response.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'healthy' }, 'OK');
});

app.use(errorMiddleware);

export default app;
