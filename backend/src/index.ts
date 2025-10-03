import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { LogService } from './services/log.service';
import { createLogSchema, externalApiResponseSchema } from './validators';
import { getRandomPostUrl, PORT } from './config/constants';
import type { ErrorResponse } from './types';

const app = express();
const logService = new LogService();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/logs', async (req, res) => {
  try {
    const validated = createLogSchema.parse(req.body);
    const log = await logService.create(validated.json);
    res.status(201).json(log);
  } catch (error: unknown) {
    if (error instanceof Error && 'issues' in error) {
      res.status(400).json({ error: 'Validation error', details: error });
    } else {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await logService.findAll();
    res.json(logs);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' } as ErrorResponse);
  }
});

app.post('/api/logs/external', async (req, res) => {
  try {
    const response = await axios.get(getRandomPostUrl());
    const validated = externalApiResponseSchema.parse(response.data);
    const log = await logService.create(validated);
    res.status(201).json(log);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' } as ErrorResponse);
  }
});

const NODE_ENV = process.env.NODE_ENV;

if (NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
