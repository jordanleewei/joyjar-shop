// Delivery dates, worked out in Singapore time. Customers pick a day (no time slot).
export const DELIVERY_DAYS_AHEAD = 30;
const DAY = 864e5;
const SG = 8 * 60 * 60 * 1000;

const sgToday = () => new Date(Date.now() + SG).toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => new Date(Date.parse(iso + "T00:00:00Z") + n * DAY).toISOString().slice(0, 10);

// tomorrow up to 30 days ahead
export function deliveryDates(now?: string) {
  const today = now || sgToday();
  return Array.from({ length: DELIVERY_DAYS_AHEAD }, (_, i) => addDays(today, i + 1));
}

export function isDeliveryDate(iso: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && deliveryDates().includes(iso);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_ZH = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dateParts(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return { day: DAYS[d.getUTCDay()], dayZh: DAYS_ZH[d.getUTCDay()], date: d.getUTCDate(), month: MONTHS[d.getUTCMonth()], m: d.getUTCMonth() + 1 };
}

// "Wed, 25 Nov" (or "" if not a date)
export function formatDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return "";
  const p = dateParts(iso);
  return `${p.day}, ${p.date} ${p.month}`;
}
