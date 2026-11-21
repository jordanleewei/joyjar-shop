-- One-off data update after adding points, regions, fulfilment and stock (run once, after `prisma db push`).

-- 1) Points for members' past paid orders: 1 point per $1 of jars after discount.
UPDATE "Order" SET "pointsEarned" = FLOOR(subtotal - discount)
WHERE "memberId" IS NOT NULL AND "pointsEarned" = 0 AND subtotal > discount;

-- 2) Region for past orders, from the postal code (same mapping as src/lib/regions.ts).
UPDATE "Order" o SET region = CASE
  WHEN s BETWEEN 1 AND 10 THEN 'central'
  WHEN s BETWEEN 11 AND 13 THEN 'west'
  WHEN s BETWEEN 14 AND 45 THEN 'central'
  WHEN s BETWEEN 46 AND 52 THEN 'east'
  WHEN s BETWEEN 53 AND 56 THEN 'northeast'
  WHEN s BETWEEN 57 AND 59 THEN 'central'
  WHEN s BETWEEN 60 AND 71 THEN 'west'
  WHEN s BETWEEN 72 AND 78 THEN 'north'
  WHEN s BETWEEN 79 AND 80 THEN 'northeast'
  WHEN s = 81 THEN 'east'
  WHEN s = 82 THEN 'northeast'
  ELSE '' END
FROM (
  SELECT id, CAST(SUBSTRING(("customerDetails"::json->>'postal') FROM 1 FOR 2) AS INTEGER) AS s
  FROM "Order" WHERE ("customerDetails"::json->>'postal') ~ '^[0-9]{6}$'
) p
WHERE o.id = p.id AND o.region = '';

-- 3) Past paid orders: don't re-send emails or take stock again, and don't show them as "to pack".
UPDATE "Order" SET "stockApplied" = true, notified = true WHERE status = 'paid';
UPDATE "Order" SET fulfil = 'delivered' WHERE status = 'paid' AND fulfil = 'new';

-- 4) Members keep the accessory they're already wearing (it now costs points in the pet shop).
INSERT INTO "PetPurchase" (id, "memberId", item, cost, "createdAt")
SELECT 'grant_' || m.id, m.id, m.card::json->>'accessory', 0, NOW()
FROM "Member" m
WHERE (m.card::json->>'accessory') IS NOT NULL
  AND (m.card::json->>'accessory') NOT IN ('none', 'bow')
  AND NOT EXISTS (SELECT 1 FROM "PetPurchase" p WHERE p.id = 'grant_' || m.id);
