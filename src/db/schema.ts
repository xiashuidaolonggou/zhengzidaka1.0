export const SCHEMA_VERSION = 1;

export const DDL = [
  `CREATE TABLE IF NOT EXISTS goals (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    color       TEXT NOT NULL,
    count_style TEXT NOT NULL DEFAULT 'zheng',
    pinned      INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS checkins (
    id        TEXT PRIMARY KEY,
    goal_id   TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
  )`,

  `CREATE INDEX IF NOT EXISTS idx_checkins_goal ON checkins(goal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_checkins_time ON checkins(timestamp)`,

  `CREATE TABLE IF NOT EXISTS _migrations (
    version    INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
  )`,
];
