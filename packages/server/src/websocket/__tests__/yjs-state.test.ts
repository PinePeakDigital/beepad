import { describe, test, expect } from 'vitest';
import * as Y from 'yjs';

describe('Yjs state serialization', () => {
  test('should serialize and deserialize empty doc state', () => {
    const doc = new Y.Doc();
    const serialized = Array.from(Y.encodeStateAsUpdate(doc));
    const deserialized = new Uint8Array(serialized);
    
    const newDoc = new Y.Doc();
    Y.applyUpdate(newDoc, deserialized);
    
    expect(Array.from(Y.encodeStateAsUpdate(newDoc))).toEqual(serialized);
  });

  test('should preserve text content through serialization', () => {
    const doc = new Y.Doc();
    const text = doc.getText('test');
    text.insert(0, 'Hello, world!');
    
    const serialized = Array.from(Y.encodeStateAsUpdate(doc));
    const deserialized = new Uint8Array(serialized);
    
    const newDoc = new Y.Doc();
    Y.applyUpdate(newDoc, deserialized);
    
    expect(newDoc.getText('test').toString()).toBe('Hello, world!');
  });

  test('should survive JSON roundtrip', () => {
    const doc = new Y.Doc();
    const text = doc.getText('test');
    text.insert(0, 'Hello, world!');
    
    const serialized = JSON.stringify(Array.from(Y.encodeStateAsUpdate(doc)));
    const deserialized = new Uint8Array(JSON.parse(serialized));
    
    const newDoc = new Y.Doc();
    Y.applyUpdate(newDoc, deserialized);
    
    expect(newDoc.getText('test').toString()).toBe('Hello, world!');
  });

  test('should work with mock database storage', async () => {
    const doc = new Y.Doc();
    const text = doc.getText('test');
    text.insert(0, 'Hello, world!');
    
    // Mock DB storage
    const mockDb = {
      state: JSON.stringify(Array.from(Y.encodeStateAsUpdate(doc)))
    };
    
    // Mock DB retrieval
    const retrieved = new Uint8Array(JSON.parse(mockDb.state));
    const newDoc = new Y.Doc();
    Y.applyUpdate(newDoc, retrieved);
    
    expect(newDoc.getText('test').toString()).toBe('Hello, world!');
  });

  test('should handle concurrent edits', () => {
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();
    const text1 = doc1.getText('test');
    const text2 = doc2.getText('test');

    // Make concurrent edits
    text1.insert(0, 'Hello');
    text2.insert(0, 'World');

    // Exchange updates
    const update1 = Y.encodeStateAsUpdate(doc1);
    const update2 = Y.encodeStateAsUpdate(doc2);
    Y.applyUpdate(doc1, update2);
    Y.applyUpdate(doc2, update1);

    // Both docs should converge to the same state
    expect(text1.toString()).toBe(text2.toString());
  });

  test('should handle large text content', () => {
    const doc = new Y.Doc();
    const text = doc.getText('test');
    const largeText = 'a'.repeat(1000000); // 1MB of text
    text.insert(0, largeText);
    
    const serialized = JSON.stringify(Array.from(Y.encodeStateAsUpdate(doc)));
    const deserialized = new Uint8Array(JSON.parse(serialized));
    
    const newDoc = new Y.Doc();
    Y.applyUpdate(newDoc, deserialized);
    
    expect(newDoc.getText('test').toString()).toBe(largeText);
  });

  test('should handle special characters', () => {
    const doc = new Y.Doc();
    const text = doc.getText('test');
    const specialChars = '🚀 Hello\n\t世界!';
    text.insert(0, specialChars);
    
    const serialized = JSON.stringify(Array.from(Y.encodeStateAsUpdate(doc)));
    const deserialized = new Uint8Array(JSON.parse(serialized));
    
    const newDoc = new Y.Doc();
    Y.applyUpdate(newDoc, deserialized);
    
    expect(newDoc.getText('test').toString()).toBe(specialChars);
  });
});
