import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { Router } from 'express';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const router = Router();
  const pushRouter = Router();
  router.post('/message', (_req, res) => res.json({ status: 'ok' }));
  pushRouter.get('/vapid-public-key', (_req, res) => res.json({ status: 'ok' }));

  const server = createApp(router, pushRouter).listen(0);
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

describe('createApp', () => {
  it('returns a clean 400 response for malformed JSON', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"message":',
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        code: 'INVALID_JSON',
      });
    });
  });

  it('returns JSON for unknown routes', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/missing`);

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toEqual({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Route not found',
      });
    });
  });
});
