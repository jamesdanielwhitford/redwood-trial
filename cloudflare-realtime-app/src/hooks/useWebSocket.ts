import { useEffect, useRef, useState, useCallback } from 'react';

export interface VoteData {
  dog: number;
  cat: number;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface UseWebSocketReturn {
  votes: VoteData | null;
  isConnected: boolean;
  connectionCount: number;
  error: string | null;
  reconnect: () => void;
}

const WEBSOCKET_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

export function useWebSocket(): UseWebSocketReturn {
  const [votes, setVotes] = useState<VoteData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setError(null);
      const ws = new WebSocket(WEBSOCKET_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        // Send initial ping
        ws.send(JSON.stringify({ type: 'ping' }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'vote-update':
              if (message.votes) {
                setVotes(message.votes);
              }
              break;
              
            case 'connected':
              console.log('WebSocket session established:', message.sessionId);
              break;
              
            case 'pong':
              // Handle pong response
              break;
              
            case 'connection-count':
              setConnectionCount(message.count || 0);
              break;
              
            case 'error':
              console.error('WebSocket server error:', message.message);
              setError(message.message);
              break;
              
            default:
              console.log('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setError('Failed to connect to WebSocket after multiple attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setError('Failed to create WebSocket connection');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [connect, disconnect]);

  // Load initial vote data from API
  useEffect(() => {
    fetch('/api/votes')
      .then(res => res.json())
      .then(data => setVotes(data))
      .catch(error => console.error('Error loading initial votes:', error));
  }, []);

  // Establish WebSocket connection
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Ping interval to keep connection alive
  useEffect(() => {
    if (isConnected && wsRef.current) {
      const pingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [isConnected]);

  return {
    votes,
    isConnected,
    connectionCount,
    error,
    reconnect,
  };
}