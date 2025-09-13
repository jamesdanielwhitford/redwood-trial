import { env } from "cloudflare:workers";
import { type Database, createDb } from "rwsdk/db";
import { type migrations } from "./chatMigrations";

export type ChatDatabase = Database<typeof migrations>;

export const db = createDb<ChatDatabase>(
  env.CHAT_DB_DO,
  "chat-database" // unique key for this database instance
);
