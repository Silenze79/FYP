-- Run automatically on backend startup (see DatabaseMigrationRunner)
-- Or execute manually against H2 / PostgreSQL when upgrading an older database.

CREATE TABLE IF NOT EXISTS reward_obtain (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    user_id     VARCHAR(36)  NOT NULL,
    reward_id   VARCHAR(50)  NOT NULL,
    obtained_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reward_obtain_user_reward UNIQUE (user_id, reward_id),
    CONSTRAINT fk_reward_obtain_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reward_obtain_user ON reward_obtain (user_id);

ALTER TABLE users ADD COLUMN IF NOT EXISTS rank_points INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rank VARCHAR(20) NOT NULL DEFAULT 'bronze';

UPDATE users SET rank = 'master'   WHERE rank_points >= 2000 AND (rank IS NULL OR rank = 'bronze');
UPDATE users SET rank = 'diamond'  WHERE rank_points >= 1000 AND rank_points < 2000 AND (rank IS NULL OR rank = 'bronze');
UPDATE users SET rank = 'platinum' WHERE rank_points >= 600  AND rank_points < 1000 AND (rank IS NULL OR rank = 'bronze');
UPDATE users SET rank = 'gold'     WHERE rank_points >= 300  AND rank_points < 600  AND (rank IS NULL OR rank = 'bronze');
UPDATE users SET rank = 'silver'   WHERE rank_points >= 100  AND rank_points < 300  AND (rank IS NULL OR rank = 'bronze');
UPDATE users SET rank = 'bronze'   WHERE rank IS NULL;
