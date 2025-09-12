export interface VoteData {
  dog: number;
  cat: number;
}

export interface VoteUpdateMessage {
  type: "vote-update";
  votes: VoteData;
  timestamp: number;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface Env {
  VOTING_DURABLE_OBJECT: DurableObjectNamespace;
  REALTIME_DURABLE_OBJECT: DurableObjectNamespace;
  DB: D1Database;
}