-- Migration to transform from simple dog/cat voting to polls system
-- Creates polls and choices tables for flexible voting polls

-- CreateTable: polls
CREATE TABLE "polls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable: choices  
CREATE TABLE "choices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "poll_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "votes" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "choices_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls" ("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX "choices_poll_id_idx" ON "choices"("poll_id");

-- Create index on polls for efficient listing
CREATE INDEX "polls_created_at_idx" ON "polls"("created_at" DESC);