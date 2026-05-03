-- Cleanup: remove duplicate "Neuer Verkauf" wallet rows and recompute the running
-- balance for affected users.
--
-- Strategy:
--   * A duplicate group is rows with the same (user_id, details). The lowest id of
--     each group is kept; the rest are deleted.
--   * After deletion, for each affected user the running balance is recomputed for
--     all surviving rows whose id is greater than the first deleted id of that user.
--     Rows below that point are left alone — this preserves any historical drift in
--     unrelated rows (the wallet has 2 users with non-zero historical drift; we do
--     not want to silently "fix" that here).
--
-- The script runs in a transaction and ends with ROLLBACK so you can preview the
-- effect by running it as-is. To apply: change the final ROLLBACK to COMMIT.
--
-- Take a database dump first:
--   podman exec db mariadb-dump -uroot -ppassword wordpress wp_foodcoop_wallet > wallet-backup-$(date +%F).sql

START TRANSACTION;

-- 1. Snapshot rows to delete (everything past the first row of each duplicate group).
DROP TEMPORARY TABLE IF EXISTS _dups_to_delete;
CREATE TEMPORARY TABLE _dups_to_delete AS
SELECT id, user_id, amount
FROM (
  SELECT id, user_id, amount, details,
         ROW_NUMBER() OVER (PARTITION BY user_id, details ORDER BY id) AS rn,
         COUNT(*)     OVER (PARTITION BY user_id, details)             AS group_size
  FROM wp_foodcoop_wallet
  WHERE details LIKE 'Neuer Verkauf%'
    AND details LIKE '%Bestellung #%'
) ranked
WHERE group_size > 1 AND rn > 1;

-- 2. Per affected user, capture the seed balance = balance of the row immediately
--    preceding the first deleted id (or 0 if no prior row exists).
DROP TEMPORARY TABLE IF EXISTS _seeds;
CREATE TEMPORARY TABLE _seeds AS
SELECT
  d.user_id,
  MIN(d.id) AS first_del_id,
  COALESCE((
    SELECT w.balance
    FROM wp_foodcoop_wallet w
    WHERE w.user_id = d.user_id
      AND w.id < MIN(d.id)
    ORDER BY w.id DESC
    LIMIT 1
  ), 0) AS seed_balance
FROM _dups_to_delete d
GROUP BY d.user_id;

-- 3. Preview: counts and per-user impact.
SELECT '== rows to delete ==' AS section;
SELECT COUNT(*) AS rows_to_delete, COUNT(DISTINCT user_id) AS users_affected FROM _dups_to_delete;

SELECT '== per-user impact ==' AS section;
SELECT
  s.user_id,
  s.first_del_id,
  s.seed_balance,
  (SELECT COUNT(*)        FROM _dups_to_delete d WHERE d.user_id = s.user_id) AS rows_deleted,
  (SELECT ROUND(SUM(amount), 2) FROM _dups_to_delete d WHERE d.user_id = s.user_id) AS amount_removed,
  (SELECT balance         FROM wp_foodcoop_wallet w WHERE w.user_id = s.user_id ORDER BY id DESC LIMIT 1) AS current_latest_balance
FROM _seeds s
ORDER BY s.user_id;

-- 4. Delete the duplicates.
DELETE w FROM wp_foodcoop_wallet w
JOIN _dups_to_delete d ON d.id = w.id;

-- 5. Recompute running balance for surviving rows of affected users with id > first_del_id.
--    Rows with id < first_del_id are untouched (their balance was already correct
--    relative to all rows that still exist).
UPDATE wp_foodcoop_wallet w
JOIN (
  SELECT
    w.id,
    ROUND(s.seed_balance + SUM(w.amount) OVER (PARTITION BY w.user_id ORDER BY w.id), 2) AS new_balance
  FROM wp_foodcoop_wallet w
  JOIN _seeds s ON s.user_id = w.user_id
  WHERE w.id > s.first_del_id
) calc ON calc.id = w.id
SET w.balance = calc.new_balance;

-- 6. Verify: latest balance per affected user before/after, and that no duplicate
--    "Neuer Verkauf" groups remain.
SELECT '== latest balance per affected user (post-cleanup) ==' AS section;
SELECT
  s.user_id,
  (SELECT balance FROM wp_foodcoop_wallet w WHERE w.user_id = s.user_id ORDER BY id DESC LIMIT 1) AS latest_balance_after
FROM _seeds s
ORDER BY s.user_id;

SELECT '== remaining duplicates (should be 0 rows) ==' AS section;
SELECT user_id, details, COUNT(*) AS n
FROM wp_foodcoop_wallet
WHERE details LIKE 'Neuer Verkauf%' AND details LIKE '%Bestellung #%'
GROUP BY user_id, details
HAVING n > 1;

DROP TEMPORARY TABLE IF EXISTS _dups_to_delete;
DROP TEMPORARY TABLE IF EXISTS _seeds;

-- Change to COMMIT to apply.
ROLLBACK;
-- COMMIT;
