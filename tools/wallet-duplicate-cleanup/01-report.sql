-- Report: per-owner over-credit caused by duplicate "Neuer Verkauf" wallet rows.
--
-- A duplicate group is rows in wp_foodcoop_wallet that share the same user_id and
-- the same details string ("Neuer Verkauf von Produkt X(Nx) Bestellung #Y"). The
-- first row of each group is treated as the legitimate payout; every additional
-- row is an over-credit caused by the broken HPOS guard in update_member_balance().
--
-- Read-only — safe to run against production.

SELECT
  dups.user_id,
  COALESCE(
    NULLIF(TRIM(CONCAT_WS(' ', um1.meta_value, um2.meta_value)), ''),
    u.display_name,
    u.user_login,
    CONCAT('user #', dups.user_id)
  ) AS owner,
  dups.extra_rows,
  dups.affected_orders,
  ROUND(dups.over_credit, 2) AS over_credit_chf
FROM (
  SELECT
    user_id,
    SUM(CASE WHEN rn > 1 THEN amount ELSE 0 END) AS over_credit,
    SUM(CASE WHEN rn > 1 THEN 1 ELSE 0 END) AS extra_rows,
    COUNT(DISTINCT CASE WHEN rn > 1 THEN REGEXP_REPLACE(details, '^.*Bestellung #([0-9]+).*$', '\\1') END) AS affected_orders
  FROM (
    SELECT
      id, user_id, amount, details,
      ROW_NUMBER() OVER (PARTITION BY user_id, details ORDER BY id) AS rn,
      COUNT(*)     OVER (PARTITION BY user_id, details)             AS group_size
    FROM wp_foodcoop_wallet
    WHERE details LIKE 'Neuer Verkauf%'
      AND details LIKE '%Bestellung #%'
  ) ranked
  WHERE group_size > 1
  GROUP BY user_id
) dups
LEFT JOIN wp_users    u   ON u.ID = dups.user_id
LEFT JOIN wp_usermeta um1 ON um1.user_id = dups.user_id AND um1.meta_key = 'billing_first_name'
LEFT JOIN wp_usermeta um2 ON um2.user_id = dups.user_id AND um2.meta_key = 'billing_last_name'
ORDER BY dups.over_credit DESC;
