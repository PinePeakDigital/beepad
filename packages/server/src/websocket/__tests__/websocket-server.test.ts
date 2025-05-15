import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { setupWebSocket } from '../index';
import { createServer } from 'http';
import { createTestDb } from '../../db/__tests__/test-db';
import { eq } from 'drizzle-orm';
import { yDocs, notes } from '../../db/schema';

describe('WebSocket Server with SQLite', () => {
  let server: ReturnType<typeof createServer>;
  let wss: WebSocketServer;
  const TEST_PORT = 3002;
  const testDb = createTestDb();
  const TEST_SAVE_INTERVAL = 100; // 100ms for tests

  beforeEach(async () => {
    server = createServer();
    wss = setupWebSocket(server, testDb.db, TEST_SAVE_INTERVAL);
    server.listen(TEST_PORT);

    // Clear tables before each test
    await testDb.db.delete(yDocs);
    await testDb.db.delete(notes);
  });

  afterEach(() => {
    wss.close();
    server.close();
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
    // First connection: create and save state
    const ws1 = new WebSocket(`ws://localhost:${TEST_PORT}/test-doc`);
    await new Promise(resolve => ws1.on('open', resolve));

    // Create and send an update
    const doc = new Y.Doc();
    const text = doc.getText('test');
    text.insert(0, 'Hello');
    const update = Y.encodeStateAsUpdate(doc);
    ws1.send(Buffer.from(update));

    // Wait for save
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait for save
    ws1.close();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify state was saved
    const savedState = await testDb.db
      .select()
      .from(yDocs)
      .where(eq(yDocs.docName, 'test-doc'));

    expect(savedState[0]).toBeTruthy();
    expect(savedState[0].state).toBeTruthy();

    // Second connection: should receive saved state
    const ws2 = new WebSocket(`ws://localhost:${TEST_PORT}/test-doc`);
    await new Promise(resolve => ws2.on('open', resolve));

    const message = await new Promise(resolve => ws2.on('message', resolve));
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

    // Create and send an update from first client
    const doc1 = new Y.Doc();
    const text1 = doc1.getText('test');
    text1.insert(0, 'Hello');
    const update1 = Y.encodeStateAsUpdate(doc1);
    ws1.send(Buffer.from(update1));

    // Wait for second client to receive update
    const message = await new Promise(resolve => ws2.on('message', resolve));
    const receivedState = new Uint8Array(message as Buffer);
    
    const doc2 = new Y.Doc();
    Y.applyUpdate(doc2, receivedState);
    
    expect(doc2.getText('test').toString()).toBe('Hello');
  });

  test('should save state before cleanup', async () => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}/test-doc`);
    await new Promise(resolve => ws.on('open', resolve));
    
    // Send an update
    const doc = new Y.Doc();
    const text = doc.getText('test');
    text.insert(0, 'Test content');
    const update = Y.encodeStateAsUpdate(doc);
    ws.send(Buffer.from(update));
    
    // Wait for save
    await new Promise(resolve => setTimeout(resolve, 200));
    ws.close();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check state was saved
    const savedState = await testDb.db
      .select()
      .from(yDocs)
      .where(eq(yDocs.docName, 'test-doc'));

    expect(savedState[0].state).toBeTruthy();

    // Verify saved state is correct
    const savedDoc = new Y.Doc();
    Y.applyUpdate(savedDoc, new Uint8Array(JSON.parse(savedState[0].state!)));
    expect(savedDoc.getText('test').toString()).toBe('Test content');
  }, 10000); // Increase timeout for this test

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
    
    // Wait for save
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check state was saved
    const savedState = await testDb.db
      .select()
      .from(yDocs)
      .where(eq(yDocs.docName, 'test-doc'));

    expect(savedState[0].state).toBeTruthy();

    // Verify saved state is correct
    const savedDoc = new Y.Doc();
    Y.applyUpdate(savedDoc, new Uint8Array(JSON.parse(savedState[0].state!)));
    expect(savedDoc.getText('test').toString()).toBe(largeText);
  }, 10000); // Increase timeout for this test
});
