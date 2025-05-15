import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useYDoc } from '../useYDoc';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Mock y-websocket
vi.mock('y-websocket', () => ({
  WebsocketProvider: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    disconnect: vi.fn(),
    destroy: vi.fn()
  }))
}));

describe('useYDoc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create new doc and provider', () => {
    const { result } = renderHook(() => useYDoc('test-doc'));
    
    expect(result.current.ydoc).toBeInstanceOf(Y.Doc);
    expect(WebsocketProvider).toHaveBeenCalledWith(
      'ws://localhost:3001',
      'test-doc',
      expect.any(Y.Doc)
    );
  });

  test('should clean up on unmount', () => {
    const { unmount } = renderHook(() => useYDoc('test-doc'));
    
    unmount();
    
    const provider = vi.mocked(WebsocketProvider).mock.results[0].value;
    expect(provider.disconnect).toHaveBeenCalled();
    expect(provider.destroy).toHaveBeenCalled();
  });

  test('should maintain same doc instance across rerenders', () => {
    const { result, rerender } = renderHook(() => useYDoc('test-doc'));
    const initialDoc = result.current.ydoc;
    
    rerender();
    
    expect(result.current.ydoc).toBe(initialDoc);
  });

  test('should handle provider status updates', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    renderHook(() => useYDoc('test-doc'));
    
    const provider = vi.mocked(WebsocketProvider).mock.results[0].value;
    const statusCallback = provider.on.mock.calls.find(
      call => call[0] === 'status'
    )?.[1];
    
    if (statusCallback) {
      statusCallback({ status: 'connected' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'WebSocket status:',
        'connected'
      );
    }
  });

  test('should handle document changes', () => {
    const { result } = renderHook(() => useYDoc('test-doc'));
    const text = result.current.ydoc.getText('test');
    
    text.insert(0, 'Hello');
    
    expect(text.toString()).toBe('Hello');
  });
});
