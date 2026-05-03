-- Backfill: copy `_payout_done = 1` from wp_postmeta into wp_wc_orders_meta for
-- orders that have it in postmeta but not in orders_meta.
--
-- Background: before the HPOS fix, update_member_balance() wrote the guard flag
-- via update_post_meta(), which lands in wp_postmeta only and is not back-synced
-- to wp_wc_orders_meta. The HPOS-aware guard in the patched code reads via
-- $order->get_meta(), which goes to wp_wc_orders_meta. Without this backfill, any
-- status transition (e.g. an admin re-completing a historical order) on those
-- orders will re-fire the payout because the guard reads empty.
--
-- Only orders that actually exist in wp_wc_orders are backfilled (orphan postmeta
-- rows are skipped). The script ends with ROLLBACK so you can preview; flip the
-- final ROLLBACK to COMMIT to apply.
--
-- wp_wc_orders_meta has no unique key on (order_id, meta_key), so an explicit
-- NOT EXISTS guard is used instead of ON DUPLICATE KEY.

START TRANSACTION;

-- Preview: which orders need backfilling, and the count.
SELECT '== orders missing _payout_done in wp_wc_orders_meta ==' AS section;
SELECT COUNT(*) AS orders_to_backfill
FROM wp_postmeta pm
JOIN wp_wc_orders o ON o.id = pm.post_id
LEFT JOIN wp_wc_orders_meta om
  ON om.order_id = pm.post_id AND om.meta_key = '_payout_done'
WHERE pm.meta_key = '_payout_done' AND om.id IS NULL;

-- Sample of affected orders (first 10).
SELECT '== sample (10) ==' AS section;
SELECT pm.post_id AS order_id, o.status, o.date_created_gmt
FROM wp_postmeta pm
JOIN wp_wc_orders o ON o.id = pm.post_id
LEFT JOIN wp_wc_orders_meta om
  ON om.order_id = pm.post_id AND om.meta_key = '_payout_done'
WHERE pm.meta_key = '_payout_done' AND om.id IS NULL
ORDER BY pm.post_id DESC
LIMIT 10;

-- Backfill.
INSERT INTO wp_wc_orders_meta (order_id, meta_key, meta_value)
SELECT pm.post_id, '_payout_done', pm.meta_value
FROM wp_postmeta pm
JOIN wp_wc_orders o ON o.id = pm.post_id
LEFT JOIN wp_wc_orders_meta om
  ON om.order_id = pm.post_id AND om.meta_key = '_payout_done'
WHERE pm.meta_key = '_payout_done' AND om.id IS NULL;

SELECT ROW_COUNT() AS rows_inserted;

-- Verify: every order with _payout_done in postmeta now also has it in orders_meta
-- (excluding orphan postmeta rows that don't have a corresponding HPOS order).
SELECT '== remaining gaps (should be 0) ==' AS section;
SELECT COUNT(*) AS remaining_gaps
FROM wp_postmeta pm
JOIN wp_wc_orders o ON o.id = pm.post_id
LEFT JOIN wp_wc_orders_meta om
  ON om.order_id = pm.post_id AND om.meta_key = '_payout_done'
WHERE pm.meta_key = '_payout_done' AND om.id IS NULL;

-- Change to COMMIT to apply.
ROLLBACK;
-- COMMIT;
