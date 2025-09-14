import { type Migrations } from "rwsdk/db";

export const migrations = {
  "001_initial_schema": {
    async up(db) {
      return [
        await db.schema
          .createTable("messages")
          .addColumn("id", "integer", (col) => col.primaryKey())
          .addColumn("user", "text", (col) => col.notNull())
          .addColumn("message", "text", (col) => col.notNull())
          .addColumn("createdAt", "text", (col) =>
            col.notNull().defaultTo("(strftime('%Y-%m-%d %H:%M:%f', 'now'))")
          )
          .execute(),
      ];
    },
    async down(db) {
      await db.schema.dropTable("messages").execute();
    }
  },
} satisfies Migrations;
