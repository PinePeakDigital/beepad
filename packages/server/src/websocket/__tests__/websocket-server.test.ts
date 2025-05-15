import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { setupWebSocket } from '../index';
import { createServer } from 'http';
import { db } from '../../db';

// Mock the database
vi.mock('../../db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn() }) }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn()
        })
      })
    }),
    transaction: vi.fn().mockImplementation(async (cb) => cb({ 
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn()
        })
      })
    }))
  }
}));

describe('WebSocket Server', () => {
  let server: ReturnType<typeof createServer>;
  let wss: WebSocketServer;
  let clientSocket: WebSocket;
  const TEST_PORT = 3002;

  beforeEach(() => {
    server = createServer();
    wss = setupWebSocket(server);
    server.listen(TEST_PORT);
  });

  afterEach(() => {
    wss.close();
    server.close();
    vi.clearAllMocks();
  });

  test('should handle rapid connect/disconnect cycles', async () => {
    const cycles = 5;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (let i = 0; i < cycles; i++) {
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}/test-doc`);
      await delay(100); // Wait for connection
      ws.close();
      await delay(100); // Wait for cleanup
    }

    // Check that docs Map is empty after all disconnects
    expect(wss.clients.size).toBe(0);
  });

  test('should preserve state across multiple connections', async () => {
    const doc1 = new Y.Doc();
    const text1 = doc1.getText('test');
    text1.insert(0, 'Hello');

    // Mock DB to return this state
    const state = Array.from(Y.encodeStateAsUpdate(doc1));
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ state: JSON.stringify(state) }])
        })
      })
    });

    const ws1 = new WebSocket(`ws://localhost:${TEST_PORT}/test-doc`);
    await new Promise(resolve => ws1.on('open', resolve));
    
    // Wait for initial state
    const message = await new Promise(resolve => ws1.on('message', resolve));
    const receivedState = new Uint8Array(message as Buffer);
    
    const newDoc = new Y.Doc();
    Y.applyUpdate(newDoc, receivedState);
    
    expect(newDoc.getText('test').toString()).toBe('Hello');
  });

  test('should handle concurrent connections to same document', async () => {
    const ws1 = new WebSocket(`ws://localhost:${TEST_PORT}/test-doc`);
    const ws2 = new WebSocket(`ws://localhost:${TEST_PORT}/test-doc`);

    await Promise.all([
      new Promise(resolve => ws1.on('open', resolve)),
      new Promise(resolve => ws2.on('open', resolve))
    ]);

    // Both connections should be active
    expect(wss.clients.size).toBe(2);
  });

  test('should save state before cleanup', async () => {
    const saveSpy = vi.spyOn(db, 'transaction');
    
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/test-doc`);
    await new Promise(resolve => ws.on('open', resolve));
    
    // Send an update
    const doc = new Y.Doc();
    const text = doc.getText('test');
    text.insert(0, 'Test content');
    const update = Y.encodeStateAsUpdate(doc);
    ws.send(Buffer.from(update));
    
    // Wait a bit and then close
    await new Promise(resolve => setTimeout(resolve, 100));
    ws.close();
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should have called save at least once
    expect(saveSpy).toHaveBeenCalled();
  });

  test('should handle large documents', async () => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/test-doc`);
    await new Promise(resolve => ws.on('open', resolve));
    
    // Create a large document
    const doc = new Y.Doc();
    const text = doc.getText('test');
    const largeText = 'a'.repeat(1000000); // 1MB of text
    text.insert(0, largeText);
    
    const update = Y.encodeStateAsUpdate(doc);
    ws.send(Buffer.from(update));
    
    // Should not throw
    await new Promise(resolve => setTimeout(resolve, 100));
  });
});
