import { useEffect, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useYDoc(docName: string) {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(
    () => {
      const wsProvider = new WebsocketProvider('ws://localhost:3001', docName, ydoc);
      
      wsProvider.on('status', (event: { status: string }) => {
        console.log('WebSocket status:', event.status);
      });

      return wsProvider;
    },
    [docName, ydoc]
  );

  useEffect(() => {
    return () => {
      provider.disconnect();
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  return { ydoc, provider };
}