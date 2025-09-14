-- Migration for real-time voting app
-- Creates votes table for dog vs cat voting with timestamps

CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('dog', 'cat')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient vote counting
CREATE INDEX IF NOT EXISTS idx_votes_type ON votes(vote_type);

-- Initialize with zero votes for each type (optional, for testing)
INSERT OR IGNORE INTO votes (id, vote_type) VALUES 
  (0, 'dog'),
  (0, 'cat');