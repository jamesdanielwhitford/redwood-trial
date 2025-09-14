import { SqliteDurableObject } from "rwsdk/db";
import { migrations } from "./chatMigrations";

export class ChatDatabaseDurableObject extends SqliteDurableObject {
  migrations = migrations;
}
